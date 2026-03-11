const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");
const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const ProductInquiry = require("../models/ProductInquiry");
const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const Invoice = require("../models/Invoice");
const env = require("../config/env");
const { DEFAULT_PERMISSION_MATRIX, normalizeMatrix } = require("../utils/permissionMatrix");
const { buildBillingBreakdown } = require("../utils/billing");
const { ensureInvoiceForAppointment } = require("../services/invoiceService");
const { sendAppointmentStatusUpdate, sendEmail } = require("../services/notificationService");
const { requireAuth, requireRoles, requirePermission } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const reportsUploadDir = process.env.VERCEL ? "/tmp/reports" : path.join(process.cwd(), "uploads", "reports");
if (!fs.existsSync(reportsUploadDir)) {
  fs.mkdirSync(reportsUploadDir, { recursive: true });
}
const reportUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, reportsUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || ".pdf") || ".pdf";
      cb(null, `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requireAuth, requireRoles("admin", "receptionist", "accountant"));

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getRequestIp(req) {
  const raw = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "";
  return String(raw).split(",")[0].trim();
}

async function logActivity(req, action, entity, entityId, payload = {}) {
  try {
    await ActivityLog.create({
      actorId: req.user?._id,
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      payload: {
        ...payload,
        ip: getRequestIp(req),
        userAgent: req.headers["user-agent"] || "",
      },
    });
  } catch (_err) {
    // ignore activity logging failures
  }
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

module.exports = router;
