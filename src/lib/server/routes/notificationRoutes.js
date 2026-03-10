const express = require("express");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(notifications);
  })
);

router.get(
  "/all",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json(notifications);
  })
);

module.exports = router;
