const express = require("express");
const Product = require("../models/Product");
const ProductInquiry = require("../models/ProductInquiry");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = req.query.active === "false" ? {} : { active: true };
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
    res.json(products);
  })
);

router.post(
  "/",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  })
);

router.post(
  "/:id/inquiry",
  asyncHandler(async (req, res) => {
    const { name, phone, message, quantity } = req.body;
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    const inquiry = await ProductInquiry.create({
      productId: req.params.id,
      name,
      phone,
      message,
      quantity,
    });
    res.status(201).json(inquiry);
  })
);

router.get(
  "/inquiries/all",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const inquiries = await ProductInquiry.find().populate("productId", "name").sort({ createdAt: -1 }).lean();
    res.json(inquiries);
  })
);

module.exports = router;
