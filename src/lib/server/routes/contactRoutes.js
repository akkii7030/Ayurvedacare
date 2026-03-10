const express = require("express");
const Contact = require("../models/Contact");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  })
);

router.get(
  "/",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(contacts);
  })
);

module.exports = router;
