const express = require("express");
const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { ensureInvoiceForAppointment } = require("../services/invoiceService");

const router = express.Router();

router.post(
  "/razorpay-webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret")
      .update(body)
      .digest("hex");
    const valid = signature === expected || env.NODE_ENV === "development";
    if (!valid) return res.status(400).json({ message: "Invalid webhook signature" });

    const event = req.body.event;
    if (event === "payment.captured") {
      const entity = req.body.payload?.payment?.entity;
      if (entity?.order_id) {
        const appointment = await Appointment.findOneAndUpdate(
          { razorpayOrderId: entity.order_id },
          { paymentStatus: "paid", paymentId: entity.id, status: "confirmed" },
          { new: true }
        )
          .populate("userId", "name phone email")
          .populate("doctorId", "name specialization");
        if (appointment) {
          await ensureInvoiceForAppointment(appointment);
        }
      }
    }
    return res.json({ received: true });
  })
);

module.exports = router;
