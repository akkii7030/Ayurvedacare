const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, min: 0 },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
    active: { type: Boolean, default: true },
    category: { type: String, default: "Ayurveda" },
    stock: { type: Number, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 10 },
    expiryDate: { type: String, trim: true },
    purchases: {
      type: [
        {
          quantity: { type: Number, min: 0, required: true },
          costPerUnit: { type: Number, min: 0, default: 0 },
          supplier: { type: String, trim: true },
          batchNo: { type: String, trim: true },
          expiryDate: { type: String, trim: true },
          purchasedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    featured: { type: Boolean, default: false },
    offerBadge: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
