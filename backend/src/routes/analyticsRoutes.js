const express = require("express");
const { getOverview, logStudySession } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/overview", getOverview);
router.post("/study-session", logStudySession);

module.exports = router;
