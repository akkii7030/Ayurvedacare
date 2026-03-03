const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ["physical", "telecare", "emergency"], default: "telecare" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    amount: { type: Number, min: 0, required: true },
    billing: {
      consultation: { type: Number, min: 0, default: 0 },
      lab: { type: Number, min: 0, default: 0 },
      medicine: { type: Number, min: 0, default: 0 },
      subtotal: { type: Number, min: 0, default: 0 },
      gstPercent: { type: Number, min: 0, max: 100, default: 0 },
      gstAmount: { type: Number, min: 0, default: 0 },
      total: { type: Number, min: 0, default: 0 },
    },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentId: { type: String, trim: true },
    razorpayOrderId: { type: String, trim: true },
    notes: { type: String, trim: true },
    telemedicineConsent: { type: Boolean, default: false },
    joinUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
