const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "true_false", "short"], required: true },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
    title: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
