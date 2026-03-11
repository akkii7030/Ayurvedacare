const fs = require("fs");
const path = require("path");
const { put, list } = require("@vercel/blob");
const env = require("../config/env");

const isVercelRuntime = Boolean(process.env.VERCEL);
const isBlobStorageEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function ensureLocalDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

function getLocalUploadsRoot() {
  return isVercelRuntime ? path.join("/tmp") : path.join(process.cwd(), "uploads");
}

function getLocalFolderPath(folder) {
  return ensureLocalDir(path.join(getLocalUploadsRoot(), folder));
}

function toPublicUploadUrl(pathname) {
  const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
  return `${base}/uploads/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

function sanitizePathSegment(value, fallback = "file") {
  const normalized = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || fallback;
}

function buildPathname(folder, fileName) {
  return `${sanitizePathSegment(folder, "uploads")}/${sanitizePathSegment(fileName)}`;
}

async function uploadBuffer({ folder, fileName, buffer, contentType }) {
  const pathname = buildPathname(folder, fileName);
  if (isBlobStorageEnabled) {
    const blob = await put(pathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return {
      url: blob.url,
      pathname: blob.pathname || pathname,
      size: buffer.length,
      uploadedAt: blob.uploadedAt ? new Date(blob.uploadedAt) : new Date(),
    };
  }

  const localFilePath = path.join(getLocalFolderPath(folder), path.basename(pathname));
  fs.writeFileSync(localFilePath, buffer);
  return {
    url: toPublicUploadUrl(pathname),
    pathname,
    size: buffer.length,
    uploadedAt: new Date(),
  };
}

async function listFiles({ folder, extension }) {
  if (isBlobStorageEnabled) {
    const { blobs = [] } = await list({ prefix: `${sanitizePathSegment(folder, "uploads")}/` });
    return blobs
      .filter((blob) => !extension || blob.pathname.endsWith(extension))
      .map((blob) => ({
        fileName: path.posix.basename(blob.pathname),
        pathname: blob.pathname,
        size: blob.size,
        createdAt: blob.uploadedAt ? new Date(blob.uploadedAt) : new Date(),
        downloadUrl: blob.url,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const folderPath = getLocalFolderPath(folder);
  return fs
    .readdirSync(folderPath)
    .filter((name) => !extension || name.endsWith(extension))
    .map((name) => {
      const stat = fs.statSync(path.join(folderPath, name));
      const pathname = buildPathname(folder, name);
      return {
        fileName: name,
        pathname,
        size: stat.size,
        createdAt: stat.birthtime,
        downloadUrl: toPublicUploadUrl(pathname),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  isBlobStorageEnabled,
  sanitizePathSegment,
  uploadBuffer,
  listFiles,
};
