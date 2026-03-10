const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    channel: { type: String, enum: ["whatsapp", "email", "system"], required: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
