const mongoose = require("mongoose");

const productInquirySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProductInquiry || mongoose.model("ProductInquiry", productInquirySchema);
