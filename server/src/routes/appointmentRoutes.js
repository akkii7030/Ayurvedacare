const express = require("express");
const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const env = require("../config/env");
const razorpay = require("../config/razorpay");
const asyncHandler = require("../utils/asyncHandler");
const { buildBillingBreakdown } = require("../utils/billing");
const { ensureInvoiceForAppointment } = require("../services/invoiceService");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { sendAppointmentConfirmation } = require("../services/notificationService");

const router = express.Router();

router.post(
  "/create-order",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { doctorId, date, time, telemedicineConsent = false, patientName, patientPhone, patientEmail } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }
    if (!telemedicineConsent) {
      return res.status(400).json({ message: "Telemedicine consent is required" });
    }

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await User.findByIdAndUpdate(req.user._id, {
      ...(patientName ? { name: patientName } : {}),
      ...(patientPhone ? { phone: patientPhone } : {}),
      ...(patientEmail ? { email: String(patientEmail).toLowerCase() } : {}),
    });

    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: "cancelled" } }).lean();
    if (existing) return res.status(409).json({ message: "Selected slot is not available" });

    const amount = Number(doctor.fees || 0);
    let order;
    try {
      order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        notes: { doctorId, date, time, userId: req.user._id.toString() },
      });
    } catch (_e) {
      order = { id: `demo_${crypto.randomUUID()}` };
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId,
      date,
      time,
      amount,
      billing: buildBillingBreakdown(
        {
          amount,
          billing: { consultation: amount, lab: 0, medicine: 0, gstPercent: 0 },
        },
        {}
      ),
      telemedicineConsent: Boolean(telemedicineConsent),
      razorpayOrderId: order.id,
      status: "pending",
      paymentStatus: "pending",
      type: "telecare",
    });

    return res.status(201).json({
      appointmentId: appointment._id,
      orderId: order.id,
      amount: amount * 100,
      razorpayKey: env.RAZORPAY_KEY_ID || "",
      doctorName: doctor.name,
    });
  })
);

router.post(
  "/verify-payment",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET || "test_secret").update(body).digest("hex");
    const valid = expected === razorpay_signature;
    if (!valid) return res.status(400).json({ message: "Invalid payment signature" });

    appointment.paymentId = razorpay_payment_id;
    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    await appointment.save();

    const user = await User.findById(appointment.userId);
    const doctor = await Doctor.findById(appointment.doctorId);
    if (user && doctor) {
      await sendAppointmentConfirmation({ user, appointment, doctor });
      await ensureInvoiceForAppointment({
        ...appointment.toObject(),
        userId: user,
        doctorId: doctor,
      });
    }

    return res.json({ message: "Payment verified and appointment confirmed" });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("doctorId", "name specialization")
      .sort({ date: 1, time: 1 })
      .lean();
    res.json(appointments);
  })
);

router.get(
  "/doctor/me",
  requireAuth,
  requireRoles("doctor"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id }).lean();
    if (!doctor) return res.json([]);
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("userId", "name phone")
      .sort({ date: 1, time: 1 })
      .lean();
    res.json(appointments);
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRoles("doctor", "admin"),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    return res.json(appointment);
  })
);

module.exports = router;
