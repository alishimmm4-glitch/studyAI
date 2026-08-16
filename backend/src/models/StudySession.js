const mongoose = require("mongoose");

/**
 * One row per day per user, accumulating study hours.
 * Powers the weekly-hours chart and streak calculation.
 */
const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true }, // normalized to start-of-day
    hours: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudySession", studySessionSchema);
