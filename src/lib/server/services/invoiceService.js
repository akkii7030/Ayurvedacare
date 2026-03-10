const Invoice = require("../models/Invoice");
const { buildBillingBreakdown, toInvoiceItems } = require("../utils/billing");
const { generateInvoicePdf } = require("./pdfService");

function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const stamp = now.getTime().toString().slice(-6);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `INV-${year}${month}-${stamp}${rand}`;
}

async function ensureInvoiceForAppointment(appointment, options = {}) {
  if (!appointment) return null;
  const billing = buildBillingBreakdown(appointment, options);
  const userId = appointment.userId?._id || appointment.userId;
  const doctorId = appointment.doctorId?._id || appointment.doctorId;
  if (!userId || !doctorId) {
    const error = new Error("Invoice generation failed: appointment references are incomplete");
    error.statusCode = 400;
    throw error;
  }

  const payload = {
    appointmentId: appointment._id,
    userId,
    doctorId,
    items: toInvoiceItems(billing),
    subtotal: billing.subtotal,
    gstPercent: billing.gstPercent,
    gstAmount: billing.gstAmount,
    total: billing.total,
    paymentStatus: appointment.paymentStatus || "pending",
    issuedAt: new Date(),
  };

  let invoice = null;
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      invoice = await Invoice.findOneAndUpdate(
        { appointmentId: appointment._id },
        {
          $set: payload,
          $setOnInsert: { invoiceNumber: generateInvoiceNumber() },
        },
        { upsert: true, new: true, runValidators: true }
      );
      break;
    } catch (error) {
      lastError = error;
      if (error?.code !== 11000) {
        throw error;
      }
    }
  }
  if (!invoice) {
    throw lastError || new Error("Unable to create invoice");
  }

  try {
    const pdfUrl = await generateInvoicePdf({
      invoice,
      appointment,
      patientName: appointment.userId?.name || "Patient",
      patientPhone: appointment.userId?.phone || "",
      doctorName: appointment.doctorId?.name || "Doctor",
      doctorSpecialization: appointment.doctorId?.specialization || "",
    });
    invoice.pdfUrl = pdfUrl;
    await invoice.save();
  } catch (_pdfError) {
    // Keep invoice creation successful even if PDF rendering fails.
  }
  return invoice;
}

module.exports = {
  ensureInvoiceForAppointment,
};
