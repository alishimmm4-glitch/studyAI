const mongoose = require("mongoose");

const plannerTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true }, // deadline / scheduled date
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

plannerTaskSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("PlannerTask", plannerTaskSchema);
