const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20, unique: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, unique: true, sparse: true },
    role: { type: String, enum: ["admin", "patient", "doctor", "receptionist", "accountant"], default: "patient" },
    age: { type: Number, min: 0, max: 130 },
    gender: { type: String, enum: ["male", "female", "other"], trim: true },
    medicalHistory: { type: String, trim: true },
    allergies: { type: [String], default: [] },
    chronicDiseases: { type: [String], default: [] },
    reports: {
      type: [
        {
          label: { type: String, trim: true },
          url: { type: String, trim: true },
          doctorComment: { type: String, trim: true },
          commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          commentedAt: { type: Date },
          emailedAt: { type: Date },
          emailedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
