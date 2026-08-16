module.exports = {
  ALLOWED_NOTE_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
  ALLOWED_NOTE_EXTENSIONS: [".pdf", ".docx", ".doc"],
  PLANS: ["free", "premium"],
  QUESTION_TYPES: ["mcq", "true_false", "short"],
  FREE_PLAN_LIMITS: {
    notesPerMonth: 5,
    quizzesPerMonth: 10,
  },
};
