const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const Setting = require("../models/Setting");
const { DEFAULT_PERMISSION_MATRIX, normalizeMatrix } = require("../utils/permissionMatrix");
const asyncHandler = require("../utils/asyncHandler");

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(decoded.sub).lean();
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "User not found or inactive" });
  }

  req.user = user;
  next();
});

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

function requirePermission(permission) {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role === "admin") return next();

    const setting = await Setting.findOne({ key: "permissions_matrix" }).lean();
    const matrix = normalizeMatrix(setting?.value || DEFAULT_PERMISSION_MATRIX);
    const rolePermissions = matrix[req.user.role] || {};
    if (!rolePermissions[permission]) {
      return res.status(403).json({ message: "Forbidden: insufficient permission" });
    }
    next();
  });
}

module.exports = {
  requireAuth,
  requireRoles,
  requirePermission,
};
