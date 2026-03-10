const Notification = require("../models/Notification");
const env = require("../config/env");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const canSendEmail = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

async function queueNotification({ userId, channel, subject, message, meta = {} }) {
  return Notification.create({
    userId,
    channel,
    subject,
    message,
    meta,
    status: "queued",
  });
}

async function sendEmail({ to, subject, html, attachments = [] }) {
  if (!transporter || !to) {
    return { sent: false, reason: "email_not_configured_or_missing_recipient" };
  }
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    return {
      sent: true,
      messageId: info.messageId,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
      response: info.response || "",
    };
  } catch (error) {
    const err = error || {};
    const errorPayload = {
      sent: false,
      reason: "smtp_send_failed",
      message: err.message || "Unknown SMTP error",
    };
    console.error("SMTP send failed:", errorPayload);
    return errorPayload;
  }
}

const EMAIL_THEME = {
  card: "max-width:600px;margin:20px auto;background:#ffffff;border-radius:24px;overflow:hidden;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#1e293b;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);",
  header: "background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center;color:#ffffff;",
  section: "padding:40px;",
  table: "width:100%;border-collapse:separate;border-spacing:0 8px;margin-top:20px;",
  label: "padding:12px 16px;background:#f8fafc;border-radius:12px 0 0 12px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;width:35%;",
  value: "padding:12px 16px;background:#f8fafc;border-radius:0 12px 12px 0;color:#0f172a;font-size:14px;font-weight:600;",
  button: "display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:14px;font-weight:700;font-size:14px;margin-top:24px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);",
  footer: "padding:32px;background:#f1f5f9;text-align:center;color:#64748b;font-size:12px;"
};

function getLogoInfo(appBase) {
  const logoPath = path.resolve(__dirname, "../../../public/logo.png");
  const hasLocalLogo = fs.existsSync(logoPath);
  const logoCid = "clinic-logo";
  const logoUrl = `${appBase}/logo.png`;
  const logoSrc = hasLocalLogo ? `cid:${logoCid}` : logoUrl;
  const emailAttachments = hasLocalLogo ? [{ filename: "logo.png", path: logoPath, cid: logoCid }] : [];
  return { logoSrc, emailAttachments };
}

async function sendAppointmentConfirmation({ user, appointment, doctor }) {
  const appBase = env.CLIENT_ORIGIN || "http://localhost:3000";
  const { logoSrc, emailAttachments } = getLogoInfo(appBase);
  const waLink = `https://wa.me/${env.WHATSAPP_NUMBER || "916386192882"}?text=${encodeURIComponent("Appointment confirmation for Sharavat Pali Clinic")}`;

  const html = `
    <div style="${EMAIL_THEME.card}">
      <div style="${EMAIL_THEME.header}">
        <img src="${logoSrc}" alt="Logo" style="width:72px;height:72px;border-radius:18px;background:#ffffff;padding:8px;margin-bottom:20px;" />
        <h1 style="margin:0;font-size:24px;font-weight:800;">Sharavat Pali Clinic</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">TeleCare · 24x7 Emergency Services</p>
      </div>
      <div style="${EMAIL_THEME.section}">
        <h2 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;">Booking Secured.</h2>
        <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">Hello <strong>${user.name || "Patient"}</strong>, your consultation is confirmed.</p>
        <table style="${EMAIL_THEME.table}">
          <tr><td style="${EMAIL_THEME.label}">Practitioner</td><td style="${EMAIL_THEME.value}">${doctor.name}</td></tr>
          <tr><td style="${EMAIL_THEME.label}">Date</td><td style="${EMAIL_THEME.value}">${appointment.date}</td></tr>
          <tr><td style="${EMAIL_THEME.label}">Time</td><td style="${EMAIL_THEME.value}">${appointment.time}</td></tr>
        </table>
        <div style="text-align:center;"><a href="${waLink}" style="${EMAIL_THEME.button}">Verify via WhatsApp</a></div>
      </div>
      <div style="${EMAIL_THEME.footer}">
        <p>Kushaha Road, Singra Mau, Jaunpur | Emergency: +91-${env.WHATSAPP_NUMBER || "916386192882"}</p>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject: "Sharavat Pali Clinic | Appointment Confirmed", attachments: emailAttachments, html });
}

async function sendAppointmentStatusUpdate({ user, doctor, appointment, updateType, note = "" }) {
  const appBase = env.CLIENT_ORIGIN || "http://localhost:3000";
  const { logoSrc, emailAttachments } = getLogoInfo(appBase);
  
  const map = {
    cancelled: { subject: "Appointment Cancelled", title: "Session Cancelled" },
    rescheduled: { subject: "Appointment Rescheduled", title: "Schedule Updated" },
    refunded: { subject: "Payment Refunded", title: "Refund Processed" }
  };
  const content = map[updateType] || map.rescheduled;

  const html = `
    <div style="${EMAIL_THEME.card}">
      <div style="${EMAIL_THEME.header}">
        <img src="${logoSrc}" alt="Logo" style="width:72px;height:72px;border-radius:18px;background:#ffffff;padding:8px;margin-bottom:20px;" />
        <h1 style="margin:0;font-size:24px;font-weight:800;">Sharavat Pali Clinic</h1>
      </div>
      <div style="${EMAIL_THEME.section}">
        <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0f172a;">${content.title}</h2>
        <table style="${EMAIL_THEME.table}">
          <tr><td style="${EMAIL_THEME.label}">Doctor</td><td style="${EMAIL_THEME.value}">${doctor?.name || "Clinic Staff"}</td></tr>
          <tr><td style="${EMAIL_THEME.label}">Date</td><td style="${EMAIL_THEME.value}">${appointment?.date || "N/A"}</td></tr>
          ${note ? `<tr><td style="${EMAIL_THEME.label}">Note</td><td style="${EMAIL_THEME.value}">${note}</td></tr>` : ""}
        </table>
      </div>
    </div>
  `;

  await sendEmail({ to: user.email, subject: `Sharavat Pali Clinic | ${content.subject}`, attachments: emailAttachments, html });
}

module.exports = {
  queueNotification,
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentStatusUpdate,
};
