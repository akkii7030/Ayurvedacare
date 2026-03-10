const express = require("express");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const doctors = await Doctor.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json(doctors);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json(doctor);
  })
);

router.get(
  "/:id/slots",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;
    const doctor = await Doctor.findById(id).lean();
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!date) return res.status(400).json({ message: "date query is required" });

    const onLeave = (doctor.leaves || []).some((leave) => {
      if (leave.status !== "approved") return false;
      return date >= leave.fromDate && date <= leave.toDate;
    });
    if (onLeave) {
      return res.json({ date, available: [], onLeave: true });
    }

    const booked = await Appointment.find({ doctorId: id, date, status: { $ne: "cancelled" } })
      .select({ time: 1, _id: 0 })
      .lean();

    const bookedSet = new Set(booked.map((b) => b.time));
    const allSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];
    const available = allSlots.filter((slot) => !bookedSet.has(slot));
    return res.json({ date, available, onLeave: false });
  })
);

router.post(
  "/",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    return res.status(201).json(doctor);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json(doctor);
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json({ message: "Doctor deactivated", doctor });
  })
);

router.post(
  "/:id/leaves",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const { fromDate, toDate, reason, status = "approved" } = req.body;
    if (!fromDate || !toDate) return res.status(400).json({ message: "fromDate and toDate are required" });
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    doctor.leaves.push({ fromDate, toDate, reason, status });
    await doctor.save();
    return res.status(201).json(doctor);
  })
);

router.patch(
  "/:id/leaves/:leaveId",
  requireAuth,
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const leave = doctor.leaves.id(req.params.leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    if (req.body.fromDate) leave.fromDate = req.body.fromDate;
    if (req.body.toDate) leave.toDate = req.body.toDate;
    if (req.body.reason !== undefined) leave.reason = req.body.reason;
    if (req.body.status) leave.status = req.body.status;
    await doctor.save();
    return res.json(doctor);
  })
);

module.exports = router;
