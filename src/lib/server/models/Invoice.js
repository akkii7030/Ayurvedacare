const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    category: { type: String, enum: ["consultation", "lab", "medicine", "other"], default: "other" },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    gstPercent: { type: Number, min: 0, max: 100, default: 0 },
    gstAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: "INR", trim: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    pdfUrl: { type: String, trim: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
