const express = require("express");
const { createSummary, getSummary } = require("../controllers/summaryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/:noteId").post(createSummary).get(getSummary);

module.exports = router;
