const express = require("express");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
    res.json(blogs);
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true }).lean();
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  })
);

router.post(
  "/",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  })
);

module.exports = router;
