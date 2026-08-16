const express = require("express");
const { createDeck, getDecks, getDeck, deleteDeck } = require("../controllers/flashcardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getDecks);
router.post("/:noteId", createDeck);
router.route("/:id").get(getDeck).delete(deleteDeck);

module.exports = router;
