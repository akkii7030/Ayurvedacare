const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "in_progress", "closed"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
