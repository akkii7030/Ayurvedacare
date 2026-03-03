const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const env = require("../config/env");

function generatePrescriptionPdf({ prescription, patientName, doctorName }) {
  const outputDir = path.join(process.cwd(), "server", "uploads", "prescriptions");
  fs.mkdirSync(outputDir, { recursive: true });
  const fileName = `prescription-${prescription._id}.pdf`;
  const filePath = path.join(outputDir, fileName);
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header band
  doc
    .save()
    .rect(0, 0, doc.page.width, 110)
    .fill("#0D47A1")
    .restore();

  if (hasLogo) {
    try {
      doc.image(logoPath, 52, 30, { width: 48, height: 48 });
    } catch (_error) {
      // If logo parsing fails, continue PDF generation without image.
    }
  }

  doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("Sharavat Pali Clinic", 110, 34);
  doc.fillColor("#DDEBFF").fontSize(10).font("Helvetica").text("TeleCare & Emergency Services", 110, 62);
  doc.fillColor("#EAF4FF").fontSize(9).text("Kushaha Road, Singra Mau, Jaunpur | +91-" + env.WHATSAPP_NUMBER, 110, 78);

  let y = 135;
  const labelColor = "#4B6484";
  const valueColor = "#16335B";

  const writeRow = (label, value) => {
    doc.fillColor(labelColor).fontSize(10).font("Helvetica-Bold").text(label, 52, y, { width: 130 });
    doc.fillColor(valueColor).fontSize(11).font("Helvetica").text(String(value || "-"), 190, y, { width: 350 });
    y += 22;
  };

  doc.fillColor("#0D47A1").fontSize(15).font("Helvetica-Bold").text("Digital Prescription", 52, y);
  y += 28;

  writeRow("Patient", patientName || "Patient");
  writeRow("Doctor", doctorName || "Doctor");
  writeRow("Diagnosis", prescription.diagnosis || "-");
  writeRow("Next Visit", prescription.nextVisitDate || "-");
  writeRow("Prescription ID", String(prescription._id));

  const lineY = y + 2;
  doc.moveTo(52, lineY).lineTo(doc.page.width - 52, lineY).lineWidth(1).stroke("#E2EAF4");
  y += 18;

  doc.fillColor("#0D47A1").fontSize(13).font("Helvetica-Bold").text("Medicines", 52, y);
  y += 18;

  const meds = Array.isArray(prescription.medicines) ? prescription.medicines : [];
  if (meds.length === 0) {
    doc.fillColor(valueColor).fontSize(11).font("Helvetica").text("No medicines added.", 52, y);
    y += 18;
  } else {
    meds.forEach((med, index) => {
      const line = `${index + 1}. ${med.name || "-"}  |  Dosage: ${med.dosage || "-"}${med.duration ? `  |  Duration: ${med.duration}` : ""}${med.notes ? `  |  Notes: ${med.notes}` : ""}`;
      doc.fillColor(valueColor).fontSize(10.5).font("Helvetica").text(line, 52, y, {
        width: doc.page.width - 104,
      });
      y += 16;
    });
  }

  const ayurText = prescription.ayurvedicSuggestions || "-";
  const dietText = prescription.dietPlan || "-";

  y += 8;
  doc.fillColor("#0D47A1").fontSize(13).font("Helvetica-Bold").text("Ayurvedic Suggestions", 52, y);
  y += 16;
  doc.fillColor(valueColor).fontSize(10.5).font("Helvetica").text(ayurText, 52, y, { width: doc.page.width - 104 });
  y = doc.y + 12;

  doc.fillColor("#0D47A1").fontSize(13).font("Helvetica-Bold").text("Diet Plan", 52, y);
  y += 16;
  doc.fillColor(valueColor).fontSize(10.5).font("Helvetica").text(dietText, 52, y, { width: doc.page.width - 104 });
  y = doc.y + 24;

  doc.moveTo(52, y).lineTo(doc.page.width - 52, y).lineWidth(1).stroke("#E2EAF4");
  y += 12;
  doc.fillColor("#5F7694").fontSize(10).font("Helvetica").text(`Doctor Signature: ${prescription.signedBy || "On file"}`, 52, y);
  doc.fillColor("#7A8EA8").fontSize(9).text(`Generated on: ${new Date().toLocaleString()}`, 52, y + 16);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
      resolve(`${base}/uploads/prescriptions/${fileName}`);
    });
    stream.on("error", reject);
  });
}

function generateInvoicePdf({ invoice, appointment, patientName, patientPhone, doctorName, doctorSpecialization }) {
  const outputDir = path.join(process.cwd(), "server", "uploads", "invoices");
  fs.mkdirSync(outputDir, { recursive: true });
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(outputDir, fileName);
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const doc = new PDFDocument({ margin: 48 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.save().rect(0, 0, doc.page.width, 96).fill("#0B3D91").restore();
  if (hasLogo) {
    try {
      doc.image(logoPath, 48, 24, { width: 42, height: 42 });
    } catch (_error) {
      // Continue if logo cannot be rendered.
    }
  }

  doc.fillColor("#FFFFFF").fontSize(20).font("Helvetica-Bold").text("Sharavat Pali Clinic", 100, 30);
  doc.fillColor("#DDEBFF").fontSize(10).font("Helvetica").text("Medical Billing Invoice", 100, 56);

  let y = 120;
  const leftX = 48;
  const rightX = 320;
  const labelColor = "#4B6484";
  const valueColor = "#102A43";

  const writePair = (x, rowY, label, value) => {
    doc.fillColor(labelColor).fontSize(9).font("Helvetica-Bold").text(label, x, rowY);
    doc.fillColor(valueColor).fontSize(10).font("Helvetica").text(String(value || "-"), x, rowY + 12, { width: 240 });
  };

  writePair(leftX, y, "Invoice Number", invoice.invoiceNumber);
  writePair(rightX, y, "Issue Date", new Date(invoice.issuedAt || Date.now()).toLocaleDateString());
  y += 40;
  writePair(leftX, y, "Patient", patientName || "Patient");
  writePair(rightX, y, "Doctor", doctorName || "Doctor");
  y += 40;
  writePair(leftX, y, "Phone", patientPhone || "-");
  writePair(rightX, y, "Specialization", doctorSpecialization || "-");
  y += 40;
  writePair(leftX, y, "Appointment Date", appointment?.date || "-");
  writePair(rightX, y, "Appointment Time", appointment?.time || "-");
  y += 36;

  doc.moveTo(48, y).lineTo(doc.page.width - 48, y).lineWidth(1).stroke("#E5EDF5");
  y += 16;

  doc.fillColor("#0B3D91").fontSize(12).font("Helvetica-Bold").text("Service Breakdown", 48, y);
  y += 18;

  const headerY = y;
  doc.rect(48, headerY, doc.page.width - 96, 24).fill("#F6FAFF");
  doc.fillColor("#264A73").fontSize(10).font("Helvetica-Bold");
  doc.text("Service", 58, headerY + 7);
  doc.text("Amount", doc.page.width - 150, headerY + 7, { width: 92, align: "right" });
  y += 28;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  items.forEach((item) => {
    doc.fillColor("#102A43").fontSize(10).font("Helvetica").text(item.label || "-", 58, y);
    doc.text(`INR ${Number(item.amount || 0).toFixed(2)}`, doc.page.width - 150, y, { width: 92, align: "right" });
    y += 20;
  });

  if (items.length === 0) {
    doc.fillColor("#102A43").fontSize(10).font("Helvetica").text("No billable items found.", 58, y);
    y += 20;
  }

  y += 10;
  doc.moveTo(300, y).lineTo(doc.page.width - 48, y).lineWidth(1).stroke("#E5EDF5");
  y += 10;
  const money = (v) => `INR ${Number(v || 0).toFixed(2)}`;
  doc.fillColor("#4B6484").fontSize(10).font("Helvetica-Bold").text("Subtotal", 320, y);
  doc.fillColor("#102A43").fontSize(10).font("Helvetica").text(money(invoice.subtotal), doc.page.width - 150, y, { width: 92, align: "right" });
  y += 16;
  doc.fillColor("#4B6484").fontSize(10).font("Helvetica-Bold").text(`GST (${Number(invoice.gstPercent || 0).toFixed(2)}%)`, 320, y);
  doc.fillColor("#102A43").fontSize(10).font("Helvetica").text(money(invoice.gstAmount), doc.page.width - 150, y, { width: 92, align: "right" });
  y += 18;
  doc.moveTo(300, y).lineTo(doc.page.width - 48, y).lineWidth(1).stroke("#CFE0F2");
  y += 10;
  doc.fillColor("#0B3D91").fontSize(12).font("Helvetica-Bold").text("Grand Total", 320, y);
  doc.fillColor("#0B3D91").fontSize(12).font("Helvetica-Bold").text(money(invoice.total), doc.page.width - 150, y, { width: 92, align: "right" });

  y += 44;
  doc.fillColor("#6B7F99").fontSize(9).font("Helvetica").text(`Payment Status: ${invoice.paymentStatus || "pending"}`, 48, y);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 48, y + 14);

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const base = String(env.API_PUBLIC_URL || "").replace(/\/+$/, "");
      resolve(`${base}/uploads/invoices/${fileName}`);
    });
    stream.on("error", reject);
  });
}

module.exports = {
  generatePrescriptionPdf,
  generateInvoicePdf,
};
