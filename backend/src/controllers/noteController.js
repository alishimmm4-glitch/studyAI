const asyncHandler = require("express-async-handler");
const fs = require("fs");
const Note = require("../models/Note");
const Summary = require("../models/Summary");
const Quiz = require("../models/Quiz");
const FlashcardDeck = require("../models/FlashcardDeck");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const extractTextFromFile = require("../utils/extractText");

/**
 * @route   POST /api/notes
 * @desc    Upload a PDF/DOCX note, extract its text in the background
 * @access  Private
 */
const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const note = await Note.create({
    user: req.user._id,
    originalName: req.file.originalname,
    storedFilename: req.file.filename,
    fileExt: req.file.originalname.split(".").pop().toUpperCase(),
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype,
    status: "processing",
  });

  // Extract text synchronously (fine for typical note sizes); mark ready/failed.
  try {
    const text = await extractTextFromFile(req.file.path);
    note.extractedText = text;
    note.status = "ready";
    await note.save();
  } catch (err) {
    note.status = "failed";
    await note.save();
  }

  new ApiResponse(res, 201, "Note uploaded successfully", { note: sanitizeNote(note) });
});

/**
 * @route   GET /api/notes
 * @desc    List the current user's notes
 * @access  Private
 */
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  new ApiResponse(res, 200, "Notes fetched", { notes: notes.map(sanitizeNote) });
});

/**
 * @route   GET /api/notes/:id
 * @desc    Get a single note
 * @access  Private
 */
const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");
  new ApiResponse(res, 200, "Note fetched", { note: sanitizeNote(note) });
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note, its file on disk, and any derived content
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");

  const filePath = require("path").join(
    process.cwd(),
    process.env.UPLOAD_DIR || "uploads",
    note.storedFilename
  );
  fs.unlink(filePath, () => {}); // best-effort; ignore errors

  await Promise.all([
    Summary.deleteMany({ note: note._id }),
    Quiz.deleteMany({ note: note._id }),
    FlashcardDeck.deleteMany({ note: note._id }),
    note.deleteOne(),
  ]);

  new ApiResponse(res, 200, "Note deleted", { id: req.params.id });
});

function sanitizeNote(note) {
  const obj = note.toObject ? note.toObject() : note;
  delete obj.extractedText;
  return obj;
}

module.exports = { uploadNote, getNotes, getNote, deleteNote };
