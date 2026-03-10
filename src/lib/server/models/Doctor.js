const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const leaveSchema = new mongoose.Schema(
  {
    fromDate: { type: String, required: true, trim: true },
    toDate: { type: String, required: true, trim: true },
    reason: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    fees: { type: Number, required: true, min: 0 },
    bio: { type: String, trim: true },
    image: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    registrationNumber: { type: String, trim: true },
    specializationTags: { type: [String], default: [] },
    availability: { type: [slotSchema], default: [] },
    leaves: { type: [leaveSchema], default: [] },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
