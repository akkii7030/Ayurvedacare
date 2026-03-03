const express = require("express");
const Testimonial = require("../models/Testimonial");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 }).lean();
    res.json(testimonials);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial);
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    res.json(testimonials);
  })
);

router.patch(
  "/:id/approve",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { approved: Boolean(req.body.approved) },
      { new: true }
    );
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    res.json(testimonial);
  })
);

module.exports = router;
