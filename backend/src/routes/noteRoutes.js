const express = require("express");
const { uploadNote, getNotes, getNote, deleteNote } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const { uploadNote: uploadMiddleware } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getNotes).post(uploadMiddleware.single("file"), uploadNote);
router.route("/:id").get(getNote).delete(deleteNote);

module.exports = router;
