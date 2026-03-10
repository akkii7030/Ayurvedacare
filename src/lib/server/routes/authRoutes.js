const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/authValidators");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function getRequestIp(req) {
  const raw = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "";
  return String(raw).split(",")[0].trim();
}

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, email, password, role } = req.body;
    const existing = await User.findOne({ phone }).lean();
    if (existing) return res.status(409).json({ message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      email,
      passwordHash,
      role: role || "patient",
    });

    const token = signToken(user);
    await ActivityLog.create({
      actorId: user._id,
      action: "auth.register.success",
      entity: "auth",
      entityId: String(user._id),
      payload: { ip: getRequestIp(req), userAgent: req.headers["user-agent"] || "", role: user.role },
    });
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
    });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      await ActivityLog.create({
        action: "auth.login.failed",
        entity: "auth",
        entityId: String(phone || ""),
        payload: { ip: getRequestIp(req), userAgent: req.headers["user-agent"] || "" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await ActivityLog.create({
        actorId: user._id,
        action: "auth.login.failed",
        entity: "auth",
        entityId: String(user._id),
        payload: { ip: getRequestIp(req), userAgent: req.headers["user-agent"] || "" },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    await ActivityLog.create({
      actorId: user._id,
      action: "auth.login.success",
      entity: "auth",
      entityId: String(user._id),
      payload: { ip: getRequestIp(req), userAgent: req.headers["user-agent"] || "", role: user.role },
    });
    return res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
    });
  })
);

module.exports = router;
