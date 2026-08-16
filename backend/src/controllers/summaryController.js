const asyncHandler = require("express-async-handler");
const Note = require("../models/Note");
const Summary = require("../models/Summary");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { generateSummary } = require("../utils/aiService");

/**
 * @route   POST /api/summaries/:noteId
 * @desc    Generate (or regenerate) an AI summary for a note
 * @access  Private
 */
const createSummary = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id }).select("+extractedText");
  if (!note) throw new ApiError(404, "Note not found");
  if (note.status !== "ready") throw new ApiError(409, "Note is still processing — try again shortly");

  const { overview, keyPoints, definitions } = generateSummary(note.extractedText, note.originalName);

  const summary = await Summary.findOneAndUpdate(
    { note: note._id, user: req.user._id },
    { overview, keyPoints, definitions },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  new ApiResponse(res, 201, "Summary generated", { summary });
});

/**
 * @route   GET /api/summaries/:noteId
 * @desc    Get the existing summary for a note (if any)
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await Summary.findOne({ note: req.params.noteId, user: req.user._id });
  if (!summary) throw new ApiError(404, "No summary found for this note yet");
  new ApiResponse(res, 200, "Summary fetched", { summary });
});

module.exports = { createSummary, getSummary };
