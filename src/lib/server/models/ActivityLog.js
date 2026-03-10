const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, trim: true },
    entity: { type: String, trim: true },
    entityId: { type: String, trim: true },
    payload: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
