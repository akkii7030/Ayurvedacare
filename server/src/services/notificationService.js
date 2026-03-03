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
      code: err.code || "",
      command: err.command || "",
      response: err.response || "",
      responseCode: err.responseCode || "",
    };
    console.error("SMTP send failed:", errorPayload);
    return errorPayload;
  }
}

async function sendAppointmentConfirmation({ user, appointment, doctor }) {
  const whatsappMessage = `Appointment confirmed with ${doctor.name} on ${appointment.date} at ${appointment.time}.`;
  const waLink = `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
  const appBase = env.CLIENT_ORIGIN || "http://localhost:8080";
  const logoPath = path.resolve(__dirname, "../../../public/logo.png");
  const hasLocalLogo = fs.existsSync(logoPath);
  const logoCid = "clinic-logo";
  const logoUrl = `${appBase}/logo.png`;
  const logoSrc = hasLocalLogo ? `cid:${logoCid}` : logoUrl;
  const emailAttachments = hasLocalLogo
    ? [{ filename: "logo.png", path: logoPath, cid: logoCid }]
    : [];
  const cardStyle =
    "max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e6edf6;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;color:#16335B;";
  const headerStyle =
    "background:linear-gradient(135deg,#0D47A1,#1E88E5,#00ACC1);padding:22px 24px;color:#fff;";
  const sectionStyle = "padding:22px 24px;";
  const tableStyle = "width:100%;border-collapse:collapse;font-size:14px;";
  const tdLabel = "padding:10px;border-bottom:1px solid #eaf0f7;color:#5b6f8d;width:38%;";
  const tdValue = "padding:10px;border-bottom:1px solid #eaf0f7;color:#16335B;font-weight:600;";
  const btnStyle =
    "display:inline-block;background:#1E88E5;color:#fff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:700;font-size:14px;";

  await queueNotification({
    userId: user._id,
    channel: "whatsapp",
    subject: "Appointment Confirmation",
    message: whatsappMessage,
    meta: { waLink, appointmentId: appointment._id.toString() },
  });

  const patientEmailNotification = await queueNotification({
    userId: user._id,
    channel: "email",
    subject: "Sharavat Pali Clinic Appointment Confirmed",
    message: `Your appointment has been confirmed. Doctor: ${doctor.name}, date: ${appointment.date}, time: ${appointment.time}.`,
    meta: { appointmentId: appointment._id.toString(), to: user.email || "" },
  });

  const patientMail = await sendEmail({
    to: user.email,
    subject: "Sharavat Pali Clinic Appointment Confirmed",
    attachments: emailAttachments,
    html: `
      <div style="${cardStyle}">
        <div style="${headerStyle}">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${logoSrc}" alt="Sharavat Pali Clinic" style="width:54px;height:54px;border-radius:10px;background:#fff;object-fit:cover;" />
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <div style="font-size:20px;font-weight:800;line-height:1.2;">Sharavat Pali Clinic</div>
                <div style="font-size:13px;opacity:0.95;">TeleCare & Emergency Services</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="${sectionStyle}">
          <h2 style="margin:0 0 8px;font-size:22px;color:#0D47A1;">Appointment Confirmed</h2>
          <p style="margin:0 0 14px;color:#4a617f;">Hello ${user.name || "Patient"}, your booking has been successfully confirmed.</p>
          <table style="${tableStyle}">
            <tr><td style="${tdLabel}">Doctor</td><td style="${tdValue}">${doctor.name}</td></tr>
            <tr><td style="${tdLabel}">Specialization</td><td style="${tdValue}">${doctor.specialization || "-"}</td></tr>
            <tr><td style="${tdLabel}">Date</td><td style="${tdValue}">${appointment.date}</td></tr>
            <tr><td style="${tdLabel}">Time</td><td style="${tdValue}">${appointment.time}</td></tr>
            <tr><td style="${tdLabel}">Mode</td><td style="${tdValue}">${appointment.type || "telecare"}</td></tr>
          </table>
          <div style="margin-top:16px;">
            <a href="${waLink}" style="${btnStyle}">Open WhatsApp Confirmation</a>
          </div>
          <p style="margin:16px 0 0;color:#6f8099;font-size:12px;">For emergency support call: +91-${env.WHATSAPP_NUMBER}</p>
        </div>
      </div>
    `,
  });
  patientEmailNotification.status = patientMail.sent ? "sent" : "failed";
  patientEmailNotification.meta = { ...patientEmailNotification.meta, sendResult: patientMail };
  await patientEmailNotification.save();

  const doctorEmailNotification = await queueNotification({
    userId: user._id,
    channel: "email",
    subject: "New Appointment Assigned",
    message: `New appointment with ${user.name}. Date: ${appointment.date}, time: ${appointment.time}.`,
    meta: { appointmentId: appointment._id.toString(), to: doctor.email || "" },
  });
  const doctorMail = await sendEmail({
    to: doctor.email,
    subject: "New Appointment Assigned - Sharavat Pali Clinic",
    attachments: emailAttachments,
    html: `
      <div style="${cardStyle}">
        <div style="${headerStyle}">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${logoSrc}" alt="Sharavat Pali Clinic" style="width:54px;height:54px;border-radius:10px;background:#fff;object-fit:cover;" />
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <div style="font-size:20px;font-weight:800;line-height:1.2;">Sharavat Pali Clinic</div>
                <div style="font-size:13px;opacity:0.95;">New Booking Alert</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="${sectionStyle}">
          <h2 style="margin:0 0 8px;font-size:22px;color:#0D47A1;">New Appointment Assigned</h2>
          <p style="margin:0 0 14px;color:#4a617f;">A patient has booked an appointment.</p>
          <table style="${tableStyle}">
            <tr><td style="${tdLabel}">Patient Name</td><td style="${tdValue}">${user.name || "-"}</td></tr>
            <tr><td style="${tdLabel}">Patient Phone</td><td style="${tdValue}">${user.phone || "-"}</td></tr>
            <tr><td style="${tdLabel}">Patient Email</td><td style="${tdValue}">${user.email || "-"}</td></tr>
            <tr><td style="${tdLabel}">Date</td><td style="${tdValue}">${appointment.date}</td></tr>
            <tr><td style="${tdLabel}">Time</td><td style="${tdValue}">${appointment.time}</td></tr>
          </table>
          <div style="margin-top:16px;">
            <a href="${appBase}/dashboard/doctor" style="${btnStyle}">Open Doctor Dashboard</a>
          </div>
        </div>
      </div>
    `,
  });
  doctorEmailNotification.status = doctorMail.sent ? "sent" : "failed";
  doctorEmailNotification.meta = { ...doctorEmailNotification.meta, sendResult: doctorMail };
  await doctorEmailNotification.save();
}

async function sendAppointmentStatusUpdate({ user, doctor, appointment, previousAppointment, updateType, note = "" }) {
  if (!user?.email) return { sent: false, reason: "missing_user_email" };

  const appBase = env.CLIENT_ORIGIN || "http://localhost:8080";
  const logoPath = path.resolve(__dirname, "../../../public/logo.png");
  const hasLocalLogo = fs.existsSync(logoPath);
  const logoCid = "clinic-logo-status";
  const logoUrl = `${appBase}/logo.png`;
  const logoSrc = hasLocalLogo ? `cid:${logoCid}` : logoUrl;
  const emailAttachments = hasLocalLogo
    ? [{ filename: "logo.png", path: logoPath, cid: logoCid }]
    : [];
  const cardStyle =
    "max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e6edf6;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;color:#16335B;";
  const headerStyle =
    "background:linear-gradient(135deg,#0D47A1,#1E88E5,#00ACC1);padding:22px 24px;color:#fff;";
  const sectionStyle = "padding:22px 24px;";
  const tableStyle = "width:100%;border-collapse:collapse;font-size:14px;";
  const tdLabel = "padding:10px;border-bottom:1px solid #eaf0f7;color:#5b6f8d;width:38%;";
  const tdValue = "padding:10px;border-bottom:1px solid #eaf0f7;color:#16335B;font-weight:600;";

  const map = {
    cancelled: {
      subject: "Appointment Cancelled - Sharavat Pali Clinic",
      title: "Appointment Cancelled",
      message: `Hello ${user.name || "Patient"}, your appointment has been cancelled.`,
    },
    rescheduled: {
      subject: "Appointment Rescheduled - Sharavat Pali Clinic",
      title: "Appointment Rescheduled",
      message: `Hello ${user.name || "Patient"}, your appointment schedule has been updated.`,
    },
    refunded: {
      subject: "Payment Refunded - Sharavat Pali Clinic",
      title: "Payment Refunded",
      message: `Hello ${user.name || "Patient"}, your payment refund has been processed.`,
    },
  };

  const content = map[updateType] || map.rescheduled;
  const notification = await queueNotification({
    userId: user._id,
    channel: "email",
    subject: content.subject,
    message: content.message,
    meta: { appointmentId: appointment?._id?.toString?.() || "", updateType, to: user.email || "" },
  });

  const html = `
    <div style="${cardStyle}">
      <div style="${headerStyle}">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:middle;">
              <img src="${logoSrc}" alt="Sharavat Pali Clinic" style="width:54px;height:54px;border-radius:10px;background:#fff;object-fit:cover;" />
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <div style="font-size:20px;font-weight:800;line-height:1.2;">Sharavat Pali Clinic</div>
              <div style="font-size:13px;opacity:0.95;">Appointment Update</div>
            </td>
          </tr>
        </table>
      </div>
      <div style="${sectionStyle}">
        <h2 style="margin:0 0 8px;font-size:22px;color:#0D47A1;">${content.title}</h2>
        <p style="margin:0 0 14px;color:#4a617f;">${content.message}</p>
        <table style="${tableStyle}">
          <tr><td style="${tdLabel}">Doctor</td><td style="${tdValue}">${doctor?.name || "-"}</td></tr>
          <tr><td style="${tdLabel}">Date</td><td style="${tdValue}">${appointment?.date || "-"}</td></tr>
          <tr><td style="${tdLabel}">Time</td><td style="${tdValue}">${appointment?.time || "-"}</td></tr>
          ${updateType === "rescheduled" ? `<tr><td style="${tdLabel}">Previous Slot</td><td style="${tdValue}">${previousAppointment?.date || "-"} ${previousAppointment?.time || "-"}</td></tr>` : ""}
          ${updateType === "refunded" ? `<tr><td style="${tdLabel}">Refund Status</td><td style="${tdValue}">${appointment?.paymentStatus || "refunded"}</td></tr>` : ""}
          ${note ? `<tr><td style="${tdLabel}">Note</td><td style="${tdValue}">${note}</td></tr>` : ""}
        </table>
      </div>
    </div>
  `;

  const mail = await sendEmail({
    to: user.email,
    subject: content.subject,
    attachments: emailAttachments,
    html,
  });
  notification.status = mail.sent ? "sent" : "failed";
  notification.meta = { ...notification.meta, sendResult: mail };
  await notification.save();
  return mail;
}

module.exports = {
  queueNotification,
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentStatusUpdate,
};
