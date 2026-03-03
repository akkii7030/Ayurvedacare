const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");
const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const ProductInquiry = require("../models/ProductInquiry");
const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const Invoice = require("../models/Invoice");
const env = require("../config/env");
const { DEFAULT_PERMISSION_MATRIX, normalizeMatrix } = require("../utils/permissionMatrix");
const { buildBillingBreakdown } = require("../utils/billing");
const { ensureInvoiceForAppointment } = require("../services/invoiceService");
const { sendAppointmentStatusUpdate, sendEmail } = require("../services/notificationService");
const { requireAuth, requireRoles, requirePermission } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const reportsUploadDir = path.join(process.cwd(), "server", "uploads", "reports");
fs.mkdirSync(reportsUploadDir, { recursive: true });
const reportUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, reportsUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || ".pdf") || ".pdf";
      cb(null, `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requireAuth, requireRoles("admin", "receptionist", "accountant"));

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getRequestIp(req) {
  const raw = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "";
  return String(raw).split(",")[0].trim();
}

async function logActivity(req, action, entity, entityId, payload = {}) {
  try {
    await ActivityLog.create({
      actorId: req.user?._id,
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      payload: {
        ...payload,
        ip: getRequestIp(req),
        userAgent: req.headers["user-agent"] || "",
      },
    });
  } catch (_err) {
    // ignore activity logging failures
  }
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

router.get(
  "/dashboard",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const [appointments, doctors, products, testimonials, contacts, inquiries, patients, todayAppointments, pendingPayments] = await Promise.all([
      Appointment.countDocuments(),
      Doctor.countDocuments(),
      Product.countDocuments(),
      Testimonial.countDocuments(),
      Contact.countDocuments(),
      ProductInquiry.countDocuments(),
      User.countDocuments({ role: "patient", isActive: true }),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ paymentStatus: "pending" }),
    ]);

    const [paidAgg, unpaidAgg, recentAppointments, recentContacts] = await Promise.all([
      Appointment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Appointment.aggregate([
        { $match: { paymentStatus: { $in: ["pending", "failed"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Appointment.find()
        .populate("userId", "name")
        .populate("doctorId", "name")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Contact.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const recentActivity = [
      ...recentAppointments.map((row) => ({
        type: "appointment",
        message: `Appointment ${row.status} for ${row.userId?.name || "patient"} with ${row.doctorId?.name || "doctor"}`,
        createdAt: row.createdAt,
      })),
      ...recentContacts.map((row) => ({
        type: "contact",
        message: `New contact from ${row.name}`,
        createdAt: row.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    res.json({
      counts: { appointments, doctors, products, testimonials, contacts, inquiries, patients },
      kpis: {
        totalPatients: patients,
        todayAppointments,
        totalRevenue: paidAgg[0]?.total || 0,
        pendingPayments,
        unpaidAmount: unpaidAgg[0]?.total || 0,
      },
      revenue: paidAgg[0]?.total || 0,
      recentActivity,
    });
  })
);

router.get(
  "/doctors",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const doctors = await Doctor.find().sort({ createdAt: -1 }).lean();
    res.json(doctors);
  })
);

router.post(
  "/doctors",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      specializationTags: Array.isArray(req.body.specializationTags)
        ? req.body.specializationTags
        : String(req.body.specializationTags || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    };
    const doctor = await Doctor.create(payload);
    res.status(201).json(doctor);
  })
);

router.patch(
  "/doctors/:id",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (payload.specializationTags && !Array.isArray(payload.specializationTags)) {
      payload.specializationTags = String(payload.specializationTags)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  })
);

router.delete(
  "/doctors/:id",
  requirePermission("delete"),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deactivated", doctor });
  })
);

router.post(
  "/doctors/:id/leaves",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const { fromDate, toDate, reason, status = "approved" } = req.body;
    if (!fromDate || !toDate) return res.status(400).json({ message: "fromDate and toDate are required" });
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    doctor.leaves.push({ fromDate, toDate, reason, status });
    await doctor.save();
    res.status(201).json(doctor);
  })
);

router.patch(
  "/doctors/:id/leaves/:leaveId",
  requirePermission("edit"),
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
    res.json(doctor);
  })
);

router.get(
  "/doctors/revenue",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const rows = await Appointment.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: "$doctorId", revenue: { $sum: "$amount" }, appointments: { $sum: 1 } } },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 0,
          doctorId: "$doctor._id",
          doctorName: "$doctor.name",
          specialization: "$doctor.specialization",
          revenue: 1,
          appointments: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    res.json(rows);
  })
);

router.get(
  "/permissions",
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const setting = await Setting.findOne({ key: "permissions_matrix" }).lean();
    const matrix = normalizeMatrix(setting?.value || DEFAULT_PERMISSION_MATRIX);
    res.json({ matrix });
  })
);

router.patch(
  "/permissions",
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const matrix = normalizeMatrix(req.body?.matrix || {});
    const saved = await Setting.findOneAndUpdate(
      { key: "permissions_matrix" },
      { key: "permissions_matrix", value: matrix },
      { upsert: true, new: true }
    ).lean();
    await logActivity(req, "admin.permissions.updated", "setting", "permissions_matrix", { matrix });
    res.json({ matrix: normalizeMatrix(saved.value || matrix) });
  })
);

router.get(
  "/patients",
  requirePermission("view"),
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const filter = { role: "patient" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const patients = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json(patients);
  })
);

router.get(
  "/patients/:id",
  requirePermission("view"),
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" }).select("-passwordHash").lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ userId: patient._id }).populate("doctorId", "name specialization").sort({ createdAt: -1 }).lean(),
      Prescription.find({ userId: patient._id }).populate("doctorId", "name specialization").sort({ createdAt: -1 }).lean(),
    ]);

    return res.json({ patient, appointments, prescriptions });
  })
);

router.post(
  "/patients",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const { name, phone, email, age, gender, medicalHistory, allergies, chronicDiseases, password } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "name and phone are required" });

    const exists = await User.findOne({ phone }).lean();
    if (exists) return res.status(409).json({ message: "Phone already registered" });

    const rawPassword = String(password || "Patient@123");
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const patient = await User.create({
      name,
      phone,
      email,
      age: age !== undefined ? toSafeNumber(age, undefined) : undefined,
      gender,
      medicalHistory,
      allergies: toStringArray(allergies),
      chronicDiseases: toStringArray(chronicDiseases),
      role: "patient",
      passwordHash,
      isActive: true,
    });
    await logActivity(req, "patient.created", "user", patient._id, { name: patient.name, phone: patient.phone });

    return res.status(201).json({
      _id: patient._id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies || [],
      chronicDiseases: patient.chronicDiseases || [],
      role: patient.role,
      isActive: patient.isActive,
    });
  })
);

router.patch(
  "/patients/:id",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const patch = {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
      ...(req.body.email !== undefined ? { email: req.body.email } : {}),
      ...(req.body.gender !== undefined ? { gender: req.body.gender } : {}),
      ...(req.body.medicalHistory !== undefined ? { medicalHistory: req.body.medicalHistory } : {}),
      ...(req.body.allergies !== undefined ? { allergies: toStringArray(req.body.allergies) } : {}),
      ...(req.body.chronicDiseases !== undefined ? { chronicDiseases: toStringArray(req.body.chronicDiseases) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: Boolean(req.body.isActive) } : {}),
      ...(req.body.age !== undefined ? { age: toSafeNumber(req.body.age, undefined) } : {}),
    };

    if (Array.isArray(req.body.reports)) {
      patch.reports = req.body.reports
        .filter((r) => r && (r.url || r.label))
        .map((r) => ({
          label: String(r.label || "").trim(),
          url: String(r.url || "").trim(),
          uploadedAt: r.uploadedAt || new Date(),
        }));
    }

    const patient = await User.findOneAndUpdate({ _id: req.params.id, role: "patient" }, patch, {
      new: true,
      runValidators: true,
    })
      .select("-passwordHash")
      .lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    await logActivity(req, "patient.updated", "user", req.params.id, { keys: Object.keys(patch) });
    return res.json(patient);
  })
);

router.delete(
  "/patients/:id",
  requirePermission("delete"),
  asyncHandler(async (req, res) => {
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: "patient" },
      { isActive: false },
      { new: true }
    )
      .select("-passwordHash")
      .lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    await logActivity(req, "patient.deactivated", "user", req.params.id, {});
    return res.json({ message: "Patient deactivated", patient });
  })
);

router.post(
  "/patients/:id/reports/upload",
  requirePermission("edit"),
  reportUpload.single("report"),
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (!req.file) return res.status(400).json({ message: "PDF report file is required" });

    const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
    const reportUrl = `${base}/uploads/reports/${req.file.filename}`;
    patient.reports.push({
      label: req.body.label || req.file.originalname || "Lab Report",
      url: reportUrl,
      doctorComment: req.body.doctorComment || "",
      commentedBy: req.user?._id,
      commentedAt: req.body.doctorComment ? new Date() : undefined,
      uploadedAt: new Date(),
    });
    await patient.save();
    await logActivity(req, "patient.report.uploaded", "user", req.params.id, { label: req.body.label || req.file.originalname });
    return res.status(201).json({ message: "Report uploaded", reports: patient.reports });
  })
);

router.patch(
  "/patients/:id/reports/:index/comment",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    const idx = Number(req.params.index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= patient.reports.length) {
      return res.status(404).json({ message: "Report not found" });
    }
    patient.reports[idx].doctorComment = String(req.body.comment || "").trim();
    patient.reports[idx].commentedBy = req.user?._id;
    patient.reports[idx].commentedAt = new Date();
    await patient.save();
    await logActivity(req, "patient.report.commented", "user", req.params.id, { index: idx });
    return res.json({ message: "Doctor comment saved", report: patient.reports[idx] });
  })
);

router.post(
  "/patients/:id/reports/:index/email",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" }).lean();
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (!patient.email) return res.status(400).json({ message: "Patient email is missing" });
    const idx = Number(req.params.index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= (patient.reports || []).length) {
      return res.status(404).json({ message: "Report not found" });
    }
    const report = patient.reports[idx];
    const mail = await sendEmail({
      to: patient.email,
      subject: "Lab Report - Sharavat Pali Clinic",
      html: `<p>Hello ${patient.name || "Patient"},</p><p>Your lab report is available.</p><p><a href="${report.url}">Open Report</a></p><p>${report.doctorComment ? `Doctor Comment: ${report.doctorComment}` : ""}</p>`,
    });
    const update = {};
    update[`reports.${idx}.emailedAt`] = new Date();
    update[`reports.${idx}.emailedBy`] = req.user?._id;
    await User.updateOne({ _id: req.params.id }, { $set: update });
    await logActivity(req, "patient.report.emailed", "user", req.params.id, { index: idx, sent: mail.sent });
    return res.json({ message: mail.sent ? "Report emailed to patient" : "Email could not be delivered", sendResult: mail });
  })
);

router.get(
  "/appointments",
  requirePermission("view"),
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || "").trim();
    const filter = status ? { status } : {};
    const appointments = await Appointment.find(filter)
      .populate("userId", "name phone email")
      .populate("doctorId", "name specialization")
      .sort({ date: -1, time: -1 })
      .lean();
    res.json(appointments);
  })
);

router.patch(
  "/appointments/:id",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const previousAppointment = await Appointment.findById(req.params.id)
      .populate("userId", "name email")
      .populate("doctorId", "name specialization")
      .lean();
    if (!previousAppointment) return res.status(404).json({ message: "Appointment not found" });

    const patch = {
      ...(req.body.status ? { status: req.body.status } : {}),
      ...(req.body.date ? { date: req.body.date } : {}),
      ...(req.body.time ? { time: req.body.time } : {}),
      ...(req.body.type ? { type: req.body.type } : {}),
      ...(req.body.paymentStatus ? { paymentStatus: req.body.paymentStatus } : {}),
      ...(req.body.notes !== undefined ? { notes: req.body.notes } : {}),
    };

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name phone email")
      .populate("doctorId", "name specialization")
      .lean();

    const statusChangedToCancelled = previousAppointment.status !== "cancelled" && appointment.status === "cancelled";
    const rescheduled =
      (req.body.date && req.body.date !== previousAppointment.date) ||
      (req.body.time && req.body.time !== previousAppointment.time);

    if (statusChangedToCancelled) {
      await sendAppointmentStatusUpdate({
        user: appointment.userId,
        doctor: appointment.doctorId,
        appointment,
        previousAppointment,
        updateType: "cancelled",
        note: appointment.notes || "",
      });
    } else if (rescheduled) {
      await sendAppointmentStatusUpdate({
        user: appointment.userId,
        doctor: appointment.doctorId,
        appointment,
        previousAppointment,
        updateType: "rescheduled",
        note: appointment.notes || "",
      });
    }
    await logActivity(req, "appointment.updated", "appointment", req.params.id, { patch });

    return res.json(appointment);
  })
);

router.post(
  "/appointments/:id/refund",
  requirePermission("refund"),
  asyncHandler(async (req, res) => {
    const previousAppointment = await Appointment.findById(req.params.id)
      .populate("userId", "name email")
      .populate("doctorId", "name specialization")
      .lean();
    if (!previousAppointment) return res.status(404).json({ message: "Appointment not found" });

    const updates = {
      paymentStatus: "refunded",
      notes: req.body.notes || "Refund processed by admin",
    };
    if (req.body.cancelAppointment) updates.status = "cancelled";
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("userId", "name phone email")
      .populate("doctorId", "name specialization")
      .lean();
    await sendAppointmentStatusUpdate({
      user: appointment.userId,
      doctor: appointment.doctorId,
      appointment,
      previousAppointment,
      updateType: "refunded",
      note: updates.notes,
    });
    await logActivity(req, "refund.initiated", "appointment", req.params.id, {
      cancelAppointment: Boolean(req.body.cancelAppointment),
      notes: updates.notes,
    });
    return res.json(appointment);
  })
);

router.get(
  "/payments",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const rows = await Appointment.find()
      .populate("userId", "name phone")
      .populate("doctorId", "name")
      .sort({ createdAt: -1 })
      .lean();
    const appointmentIds = rows.map((row) => row._id);
    const invoiceRows = await Invoice.find({ appointmentId: { $in: appointmentIds } }).lean();
    const invoiceMap = new Map(invoiceRows.map((row) => [String(row.appointmentId), row]));

    const payments = rows.map((row) => ({
      appointmentId: row._id,
      patient: row.userId,
      doctor: row.doctorId,
      amount: row.amount,
      type: row.type || "telecare",
      paymentStatus: row.paymentStatus,
      paymentId: row.paymentId || "",
      date: row.date,
      time: row.time,
      status: row.status,
      billing: buildBillingBreakdown(row),
      invoice: invoiceMap.get(String(row._id))
        ? {
            _id: invoiceMap.get(String(row._id))._id,
            invoiceNumber: invoiceMap.get(String(row._id)).invoiceNumber,
            pdfUrl: invoiceMap.get(String(row._id)).pdfUrl || "",
            gstPercent: invoiceMap.get(String(row._id)).gstPercent || 0,
            gstAmount: invoiceMap.get(String(row._id)).gstAmount || 0,
            subtotal: invoiceMap.get(String(row._id)).subtotal || 0,
            total: invoiceMap.get(String(row._id)).total || 0,
          }
        : null,
      createdAt: row.createdAt,
    }));
    return res.json(payments);
  })
);

router.post(
  "/payments/:appointmentId/invoice",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const billing = buildBillingBreakdown(appointment.toObject(), {
      consultation: req.body?.consultation,
      lab: req.body?.lab,
      medicine: req.body?.medicine,
      gstPercent: req.body?.gstPercent,
    });

    appointment.billing = billing;
    if (appointment.paymentStatus === "paid") {
      appointment.amount = billing.total;
    }
    await appointment.save();

    const [patient, doctor] = await Promise.all([
      User.findById(appointment.userId).select("name phone email").lean(),
      Doctor.findById(appointment.doctorId).select("name specialization").lean(),
    ]);

    const invoice = await ensureInvoiceForAppointment(
      {
        ...appointment.toObject(),
        userId: patient || appointment.userId,
        doctorId: doctor || appointment.doctorId,
      },
      billing
    );
    await logActivity(req, "invoice.generated", "appointment", req.params.appointmentId, { billing });
    return res.json({
      message: "Invoice generated",
      invoice,
      billing,
    });
  })
);

router.get(
  "/prescriptions",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const prescriptions = await Prescription.find()
      .populate("userId", "name phone")
      .populate("doctorId", "name specialization")
      .populate("appointmentId", "date time status")
      .sort({ createdAt: -1 })
      .lean();
    res.json(prescriptions);
  })
);

router.get(
  "/products",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products);
  })
);

router.post(
  "/products",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  })
);

router.patch(
  "/products/:id",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    await logActivity(req, "inventory.product.updated", "product", req.params.id, { keys: Object.keys(req.body || {}) });
    return res.json(product);
  })
);

router.post(
  "/products/:id/purchase",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const quantity = toSafeNumber(req.body.quantity, 0);
    if (quantity <= 0) return res.status(400).json({ message: "quantity must be greater than 0" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const purchase = {
      quantity,
      costPerUnit: toSafeNumber(req.body.costPerUnit, 0),
      supplier: String(req.body.supplier || "").trim(),
      batchNo: String(req.body.batchNo || "").trim(),
      expiryDate: String(req.body.expiryDate || product.expiryDate || "").trim(),
      purchasedAt: new Date(),
    };
    product.stock = toSafeNumber(product.stock, 0) + quantity;
    if (purchase.expiryDate) product.expiryDate = purchase.expiryDate;
    product.purchases.push(purchase);
    await product.save();
    await logActivity(req, "inventory.purchase.entry", "product", req.params.id, purchase);
    return res.status(201).json({ message: "Purchase entry added", product });
  })
);

router.get(
  "/inventory/alerts",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const rows = await Product.find().lean();
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const lowStock = rows.filter((p) => toSafeNumber(p.stock, 0) <= toSafeNumber(p.reorderLevel, 10));
    const expirySoon = rows.filter((p) => {
      if (!p.expiryDate) return false;
      const d = new Date(p.expiryDate);
      return Number.isFinite(d.getTime()) && d <= in30Days;
    });
    res.json({
      totals: { medicines: rows.length, stockCount: rows.reduce((acc, p) => acc + toSafeNumber(p.stock, 0), 0) },
      lowStock,
      expirySoon,
    });
  })
);

router.get(
  "/blogs",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    res.json(blogs);
  })
);

router.post(
  "/blogs",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  })
);

router.patch(
  "/blogs/:id",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  })
);

router.get(
  "/testimonials",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
    res.json(testimonials);
  })
);

router.patch(
  "/testimonials/:id/approve",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { approved: Boolean(req.body.approved) },
      { new: true }
    );
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    res.json(testimonial);
  })
);

router.get(
  "/contacts",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(contacts);
  })
);

router.patch(
  "/contacts/:id/status",
  requirePermission("edit"),
  asyncHandler(async (req, res) => {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  })
);

router.get(
  "/analytics",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const [paidAppointments, allAppointments, patients, prescriptions, doctors] = await Promise.all([
      Appointment.find({ paymentStatus: "paid" }).select("amount createdAt").lean(),
      Appointment.find().select("userId doctorId date time status paymentStatus amount").lean(),
      User.find({ role: "patient" }).select("createdAt").lean(),
      Prescription.find().select("diagnosis").lean(),
      Doctor.find().select("name").lean(),
    ]);

    const monthlyMap = {};
    for (const row of paidAppointments) {
      const key = new Date(row.createdAt).toISOString().slice(0, 7);
      monthlyMap[key] = (monthlyMap[key] || 0) + (row.amount || 0);
    }
    const monthlyRevenue = Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, revenue]) => ({ month, revenue }));

    const patientGrowthMap = {};
    for (const patient of patients) {
      const key = new Date(patient.createdAt).toISOString().slice(0, 7);
      patientGrowthMap[key] = (patientGrowthMap[key] || 0) + 1;
    }
    const patientGrowth = Object.entries(patientGrowthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, patientsCount]) => ({ month, patients: patientsCount }));

    const diseaseMap = {};
    for (const row of prescriptions) {
      const key = String(row.diagnosis || "General Consultation").trim() || "General Consultation";
      diseaseMap[key] = (diseaseMap[key] || 0) + 1;
    }
    const mostCommonDisease = Object.entries(diseaseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const appointmentCountByPatient = {};
    for (const row of allAppointments) {
      const key = String(row.userId);
      appointmentCountByPatient[key] = (appointmentCountByPatient[key] || 0) + 1;
    }
    const repeatPatients = Object.values(appointmentCountByPatient).filter((count) => count > 1).length;
    const totalPatients = Object.keys(appointmentCountByPatient).length;
    const repeatPatientsPercent = totalPatients ? Math.round((repeatPatients / totalPatients) * 10000) / 100 : 0;

    const totalAppointments = allAppointments.length || 1;
    const completedOrConfirmed = allAppointments.filter((row) => ["confirmed", "completed"].includes(String(row.status))).length;
    const cancelledCount = allAppointments.filter((row) => String(row.status) === "cancelled").length;
    const refundedCount = allAppointments.filter((row) => String(row.paymentStatus) === "refunded").length;
    const conversionRate = Math.round((completedOrConfirmed / totalAppointments) * 10000) / 100;
    const noShowPercentage = Math.round((cancelledCount / totalAppointments) * 10000) / 100;
    const refundRatio = Math.round((refundedCount / totalAppointments) * 10000) / 100;

    const doctorMap = new Map(doctors.map((d) => [String(d._id), d.name || "Doctor"]));
    const doctorPerfAccumulator = {};
    for (const row of allAppointments) {
      const key = String(row.doctorId || "");
      if (!doctorPerfAccumulator[key]) {
        doctorPerfAccumulator[key] = { doctorId: key, doctorName: doctorMap.get(key) || "Doctor", appointments: 0, revenue: 0, completed: 0 };
      }
      doctorPerfAccumulator[key].appointments += 1;
      if (row.paymentStatus === "paid") doctorPerfAccumulator[key].revenue += Number(row.amount || 0);
      if (["confirmed", "completed"].includes(String(row.status))) doctorPerfAccumulator[key].completed += 1;
    }
    const doctorPerformance = Object.values(doctorPerfAccumulator)
      .map((row) => ({
        ...row,
        conversionRate: row.appointments ? Math.round((row.completed / row.appointments) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const hourMap = {};
    for (const row of allAppointments) {
      const hour = String(row.time || "00:00").slice(0, 2);
      if (!hourMap[hour]) hourMap[hour] = 0;
      hourMap[hour] += 1;
    }
    const peakBookingHours = Object.entries(hourMap)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return res.json({
      monthlyRevenue,
      patientGrowth,
      mostCommonDisease,
      topDiseases: mostCommonDisease,
      doctorPerformance,
      conversionRate,
      noShowPercentage,
      refundRatio,
      peakBookingHours,
      repeatPatientsPercent,
    });
  })
);

router.get(
  "/security/status",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const otpEnabled = String(process.env.ADMIN_OTP_ENABLED || "").toLowerCase() === "true";
    const backupConfigured = Boolean(process.env.BACKUP_CRON || process.env.BACKUP_BUCKET || process.env.BACKUP_PATH);
    const sslEnabled = String(env.CLIENT_ORIGIN || "").startsWith("https://");
    const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
    return res.json({
      otpEnabled,
      backupConfigured,
      sslEnabled,
      smtpConfigured,
      roleBasedAccess: true,
      jwtConfigured: Boolean(env.JWT_SECRET && env.JWT_SECRET !== "change-me"),
    });
  })
);

router.get(
  "/appointments/export.csv",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const rows = await Appointment.find().populate("userId", "name phone").populate("doctorId", "name").lean();
    const header = "appointmentId,patientName,patientPhone,doctor,date,time,status,paymentStatus,amount\n";
    const body = rows
      .map(
        (r) =>
          `${r._id},${(r.userId?.name || "").replaceAll(",", " ")},${r.userId?.phone || ""},${(r.doctorId?.name || "").replaceAll(",", " ")},${r.date},${r.time},${r.status},${r.paymentStatus},${r.amount}`
      )
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=appointments.csv");
    res.send(`${header}${body}`);
  })
);

router.post(
  "/backup/manual",
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const backupDir = path.join(process.cwd(), "server", "uploads", "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${stamp}.json`;
    const filePath = path.join(backupDir, fileName);

    const db = mongoose.connection.db;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const data = {};
    for (const col of collections) {
      const rows = await db.collection(col.name).find({}).toArray();
      data[col.name] = rows;
    }
    fs.writeFileSync(filePath, JSON.stringify({ generatedAt: new Date().toISOString(), data }, null, 2), "utf8");

    const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
    const backupUrl = `${base}/uploads/backups/${fileName}`;
    await Setting.findOneAndUpdate(
      { key: "backup_last_manual" },
      { key: "backup_last_manual", value: { fileName, backupUrl, generatedAt: new Date().toISOString() } },
      { upsert: true, new: true }
    );
    await logActivity(req, "backup.manual.created", "backup", fileName, {});
    res.json({ message: "Manual backup generated", fileName, backupUrl });
  })
);

router.get(
  "/backup/list",
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const backupDir = path.join(process.cwd(), "server", "uploads", "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const files = fs
      .readdirSync(backupDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const stat = fs.statSync(path.join(backupDir, name));
        return { fileName: name, size: stat.size, createdAt: stat.birthtime };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
    res.json({
      files: files.map((f) => ({ ...f, downloadUrl: `${base}/uploads/backups/${f.fileName}` })),
    });
  })
);

router.patch(
  "/backup/config",
  requireRoles("admin"),
  asyncHandler(async (req, res) => {
    const value = {
      autoBackupEnabled: Boolean(req.body.autoBackupEnabled),
      scheduleCron: String(req.body.scheduleCron || ""),
      cloudProvider: String(req.body.cloudProvider || ""),
      cloudPath: String(req.body.cloudPath || ""),
      updatedAt: new Date().toISOString(),
    };
    await Setting.findOneAndUpdate({ key: "backup_config" }, { key: "backup_config", value }, { upsert: true, new: true });
    await logActivity(req, "backup.config.updated", "setting", "backup_config", value);
    res.json({ message: "Backup config saved", config: value });
  })
);

router.get(
  "/audit/login-history",
  requireRoles("admin"),
  asyncHandler(async (_req, res) => {
    const logs = await ActivityLog.find({ action: "auth.login.success" }).sort({ createdAt: -1 }).limit(500).lean();
    res.json(logs);
  })
);

router.get(
  "/activity",
  requirePermission("view"),
  asyncHandler(async (_req, res) => {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json(logs);
  })
);

module.exports = router;
