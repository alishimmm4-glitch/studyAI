const mongoose = require("mongoose");

const definitionSchema = new mongoose.Schema(
  { term: String, def: String },
  { _id: false }
);

const summarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    overview: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    definitions: { type: [definitionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
