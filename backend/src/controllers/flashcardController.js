const asyncHandler = require("express-async-handler");
const Note = require("../models/Note");
const FlashcardDeck = require("../models/FlashcardDeck");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { generateFlashcards } = require("../utils/aiService");

/**
 * @route   POST /api/flashcards/:noteId
 * @desc    Generate a flashcard deck from a note
 * @access  Private
 */
const createDeck = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id }).select("+extractedText");
  if (!note) throw new ApiError(404, "Note not found");
  if (note.status !== "ready") throw new ApiError(409, "Note is still processing — try again shortly");

  const count = Math.min(Number(req.body.count) || 8, 20);
  const cards = generateFlashcards(note.extractedText, count);
  if (!cards.length) throw new ApiError(422, "Not enough text in this note to generate flashcards");

  const deck = await FlashcardDeck.create({
    user: req.user._id,
    note: note._id,
    title: `${note.originalName.replace(/\.(pdf|docx?|txt)$/i, "")} — Flashcards`,
    cards,
  });

  new ApiResponse(res, 201, "Flashcard deck generated", { deck });
});

/**
 * @route   GET /api/flashcards
 * @desc    List the current user's flashcard decks
 * @access  Private
 */
const getDecks = asyncHandler(async (req, res) => {
  const decks = await FlashcardDeck.find({ user: req.user._id }).sort({ createdAt: -1 });
  new ApiResponse(res, 200, "Decks fetched", { decks });
});

/**
 * @route   GET /api/flashcards/:id
 * @desc    Get a single deck
 * @access  Private
 */
const getDeck = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) throw new ApiError(404, "Deck not found");
  new ApiResponse(res, 200, "Deck fetched", { deck });
});

/**
 * @route   DELETE /api/flashcards/:id
 * @desc    Delete a flashcard deck
 * @access  Private
 */
const deleteDeck = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deck) throw new ApiError(404, "Deck not found");
  new ApiResponse(res, 200, "Deck deleted", { id: req.params.id });
});

module.exports = { createDeck, getDecks, getDeck, deleteDeck };
