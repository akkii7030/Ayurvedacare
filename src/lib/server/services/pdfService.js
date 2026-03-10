const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const env = require("../config/env");

function generatePrescriptionPdf({ prescription, patientName, doctorName }) {
  const outputDir = path.join(process.cwd(), "uploads", "prescriptions");
  fs.mkdirSync(outputDir, { recursive: true });
  const fileName = `prescription-${prescription._id}.pdf`;
  const filePath = path.join(outputDir, fileName);
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header band
  doc.save().rect(0, 0, doc.page.width, 110).fill("#0D47A1").restore();

  if (hasLogo) {
    try {
      doc.image(logoPath, 52, 30, { width: 48, height: 48 });
    } catch (_error) {}
  }

  doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("Sharavat Pali Clinic", 110, 34);
  doc.fillColor("#DDEBFF").fontSize(10).font("Helvetica").text("TeleCare & Emergency Services", 110, 62);
  doc.fillColor("#EAF4FF").fontSize(9).text("Kushaha Road, Singra Mau, Jaunpur | +91-" + (env.WHATSAPP_NUMBER || "916386192882"), 110, 78);

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

  y += 10;
  doc.moveTo(52, y).lineTo(doc.page.width - 52, y).lineWidth(1).stroke("#E2EAF4");
  y += 18;

  doc.fillColor("#0D47A1").fontSize(13).font("Helvetica-Bold").text("Medicines", 52, y);
  y += 18;

  const meds = Array.isArray(prescription.medicines) ? prescription.medicines : [];
  if (meds.length === 0) {
    doc.fillColor(valueColor).fontSize(11).font("Helvetica").text("No medicines added.", 52, y);
    y += 18;
  } else {
    meds.forEach((med, index) => {
      const line = `${index + 1}. ${med.name || "-"} | Dosage: ${med.dosage || "-"}${med.duration ? ` | Duration: ${med.duration}` : ""}`;
      doc.fillColor(valueColor).fontSize(10.5).font("Helvetica").text(line, 52, y, { width: doc.page.width - 104 });
      y += 16;
    });
  }

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
  const outputDir = path.join(process.cwd(), "uploads", "invoices");
  fs.mkdirSync(outputDir, { recursive: true });
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(outputDir, fileName);
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.save().rect(0, 0, doc.page.width, 160).fill("#0f172a").restore();

  if (hasLogo) {
     try { doc.image(logoPath, 50, 40, { width: 60, height: 60 }); } catch (_e) {}
  }

  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("Sharavat Pali Clinic", 125, 45);
  doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Kushaha Road, Singra Mau, Jaunpur, Uttar Pradesh", 125, 75);
  doc.text("TeleCare & 24/7 Emergency Dispatch | +91-" + (env.WHATSAPP_NUMBER || "916386192882"), 125, 90);

  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text("OFFICIAL INVOICE", 50, 45, { align: "right" });
  doc.fontSize(10).font("Helvetica").text(`#${invoice.invoiceNumber}`, 50, 70, { align: "right" });

  let y = 180;
  doc.fillColor("#64748b").fontSize(9).font("Helvetica-Bold").text("BILL TO (PATIENT)", 50, y);
  doc.text("PROVIDER (FACULTY)", 320, y);
  y += 15;
  doc.fillColor("#1e293b").fontSize(12).font("Helvetica-Bold").text(patientName || "Patient", 50, y);
  doc.text(doctorName || "Doctor", 320, y);
  y += 16;
  doc.fillColor("#475569").fontSize(10).font("Helvetica").text(patientPhone || "N/A", 50, y);
  doc.text(doctorSpecialization || "Staff", 320, y);
  
  y += 50;
  doc.save().rect(50, y, doc.page.width - 100, 30).fill("#f8fafc").restore();
  doc.fillColor("#475569").fontSize(10).font("Helvetica-Bold");
  doc.text("DESCRIPTION / SERVICE RENDERED", 65, y + 10);
  doc.text("TOTAL (INR)", doc.page.width - 165, y + 10, { width: 100, align: "right" });
  
  y += 40;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  items.forEach((item) => {
    doc.fillColor("#1e293b").fontSize(11).font("Helvetica").text(item.label || "Service", 65, y);
    doc.text(`INR ${Number(item.amount || 0).toFixed(2)}`, doc.page.width - 165, y, { width: 100, align: "right" });
    y += 24;
  });

  y += 20;
  const summaryX = doc.page.width - 250;
  doc.fillColor("#64748b").fontSize(10).font("Helvetica").text("Subtotal", summaryX, y);
  doc.text(`INR ${Number(invoice.subtotal || 0).toFixed(2)}`, doc.page.width - 150, y, { width: 100, align: "right" });
  y += 20;
  doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("Grand Total", summaryX, y);
  doc.text(`INR ${Number(invoice.total || 0).toFixed(2)}`, doc.page.width - 150, y, { width: 100, align: "right" });

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
