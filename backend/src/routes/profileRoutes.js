const express = require("express");
const { body } = require("express-validator");
const { updateProfile, changePassword } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(protect);
router.patch("/", updateProfile);
router.patch(
  "/password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  changePassword
);

module.exports = router;
