const express = require("express");
const {
  createQuiz, getQuizzes, getQuiz, submitAttempt, getAttemptHistory,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/attempts/history", getAttemptHistory);
router.route("/").get(getQuizzes);
router.route("/:noteId").post(createQuiz);
router.route("/:id").get(getQuiz);
router.post("/:id/attempts", submitAttempt);

module.exports = router;
