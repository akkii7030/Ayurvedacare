const express = require("express");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { generatePrescriptionPdf } = require("../services/pdfService");
const { requireAuth, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRoles("doctor", "admin"),
  asyncHandler(async (req, res) => {
    const { appointmentId, diagnosis, ayurvedicSuggestions, dietPlan, medicines, nextVisitDate, signedBy } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    let prescription = await Prescription.findOne({ appointmentId: appointment._id });
    if (!prescription) {
      prescription = await Prescription.create({
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        userId: appointment.userId,
        diagnosis,
        ayurvedicSuggestions,
        dietPlan,
        medicines,
        nextVisitDate,
        signedBy,
      });
    } else {
      prescription.diagnosis = diagnosis;
      prescription.ayurvedicSuggestions = ayurvedicSuggestions;
      prescription.dietPlan = dietPlan;
      prescription.medicines = medicines;
      prescription.nextVisitDate = nextVisitDate;
      prescription.signedBy = signedBy;
      await prescription.save();
    }

    const doctor = await Doctor.findById(appointment.doctorId).lean();
    const user = await User.findById(appointment.userId).lean();
    prescription.pdfUrl = await generatePrescriptionPdf({
      prescription,
      patientName: user?.name || "Patient",
      doctorName: doctor?.name || "Doctor",
    });
    await prescription.save();

    res.status(201).json(prescription);
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({ userId: req.user._id })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 })
      .lean();
    res.json(prescriptions);
  })
);

module.exports = router;
