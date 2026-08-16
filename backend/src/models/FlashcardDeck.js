const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  { front: String, back: String },
  { _id: true }
);

const flashcardDeckSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
    title: { type: String, required: true },
    cards: { type: [cardSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashcardDeck", flashcardDeckSchema);
