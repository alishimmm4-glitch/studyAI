const asyncHandler = require("express-async-handler");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const FlashcardDeck = require("../models/FlashcardDeck");
const StudySession = require("../models/StudySession");
const ApiResponse = require("../utils/ApiResponse");

/**
 * @route   GET /api/analytics/overview
 * @desc    Aggregate stats + chart-ready series for the analytics dashboard
 * @access  Private
 */
const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalNotes, totalQuizzes, totalDecks, attempts] = await Promise.all([
    Note.countDocuments({ user: userId }),
    Quiz.countDocuments({ user: userId }),
    FlashcardDeck.countDocuments({ user: userId }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: 1 }).populate("quiz", "title"),
  ]);

  const successRate = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : 0;

  const quizScores = attempts.slice(-10).map((a, i) => ({
    name: a.quiz?.title ? a.quiz.title.slice(0, 18) : `Quiz ${i + 1}`,
    score: a.percentage,
  }));

  // Last 7 days of study hours, zero-filled for days without a session.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const sessions = await StudySession.find({
    user: userId,
    date: { $gte: sevenDaysAgo, $lte: today },
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyHours = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const match = sessions.find((s) => new Date(s.date).toDateString() === d.toDateString());
    return { day: dayLabels[d.getDay()], hours: match ? match.hours : 0 };
  });

  const totalStudyHours = sessions.reduce((sum, s) => sum + s.hours, 0);

  new ApiResponse(res, 200, "Analytics fetched", {
    totalNotes,
    totalQuizzes,
    totalDecks,
    successRate,
    totalStudyHours,
    weeklyHours,
    quizScores,
  });
});

/**
 * @route   POST /api/analytics/study-session
 * @desc    Log (or accumulate) study hours for today — powers the streak/chart
 * @access  Private
 */
const logStudySession = asyncHandler(async (req, res) => {
  const hours = Number(req.body.hours);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const session = await StudySession.findOneAndUpdate(
    { user: req.user._id, date: today },
    { $inc: { hours } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  new ApiResponse(res, 200, "Study session logged", { session });
});

module.exports = { getOverview, logStudySession };
