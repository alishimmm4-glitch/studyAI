const asyncHandler = require("express-async-handler");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { generateQuiz } = require("../utils/aiService");

/**
 * @route   POST /api/quizzes/:noteId
 * @desc    Generate a new quiz from a note
 * @access  Private
 */
const createQuiz = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id }).select("+extractedText");
  if (!note) throw new ApiError(404, "Note not found");
  if (note.status !== "ready") throw new ApiError(409, "Note is still processing — try again shortly");

  const count = Math.min(Number(req.body.count) || 6, 15);
  const questions = generateQuiz(note.extractedText, count);
  if (!questions.length) throw new ApiError(422, "Not enough text in this note to generate a quiz");

  const quiz = await Quiz.create({
    user: req.user._id,
    note: note._id,
    title: `${note.originalName.replace(/\.(pdf|docx?|txt)$/i, "")} — Quiz`,
    questions,
  });

  new ApiResponse(res, 201, "Quiz generated", { quiz: publicQuiz(quiz) });
});

/**
 * @route   GET /api/quizzes
 * @desc    List the current user's quizzes
 * @access  Private
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
  new ApiResponse(res, 200, "Quizzes fetched", { quizzes: quizzes.map(publicQuiz) });
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get a single quiz WITH correct answers (used for review screens)
 * @access  Private
 */
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  new ApiResponse(res, 200, "Quiz fetched", { quiz });
});

/**
 * @route   POST /api/quizzes/:id/attempts
 * @desc    Submit answers for a quiz, get score + per-question correctness
 * @access  Private
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const { answers = {}, durationSeconds = 0 } = req.body; // { [questionId]: givenAnswer }

  let score = 0;
  const gradedAnswers = quiz.questions.map((q) => {
    const given = (answers[q._id.toString()] || "").toString();
    const correct =
      q.type === "short"
        ? given.trim().toLowerCase().includes(q.answer.toLowerCase())
        : given === q.answer;
    if (correct) score += 1;
    return { questionId: q._id, givenAnswer: given, correct };
  });

  const total = quiz.questions.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: gradedAnswers,
    score,
    total,
    percentage,
    durationSeconds,
  });

  new ApiResponse(res, 201, "Attempt recorded", { attempt, correctAnswers: quiz.questions.map((q) => ({ id: q._id, answer: q.answer })) });
});

/**
 * @route   GET /api/quizzes/attempts/history
 * @desc    List the current user's quiz attempt history (for analytics)
 * @access  Private
 */
const getAttemptHistory = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("quiz", "title")
    .limit(50);
  new ApiResponse(res, 200, "Attempt history fetched", { attempts });
});

// Strip correct answers when listing quizzes so clients can't cheat by inspecting the list payload.
function publicQuiz(quiz) {
  const obj = quiz.toObject ? quiz.toObject() : quiz;
  return {
    ...obj,
    questions: obj.questions.map((q) => ({ _id: q._id, type: q.type, question: q.question, options: q.options })),
  };
}

module.exports = { createQuiz, getQuizzes, getQuiz, submitAttempt, getAttemptHistory };
