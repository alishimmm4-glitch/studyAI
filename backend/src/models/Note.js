const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalName: { type: String, required: true },
    fileExt: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    mimeType: { type: String, required: true },
    extractedText: { type: String, default: "", select: false },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
