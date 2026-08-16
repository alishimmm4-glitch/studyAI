const express = require("express");
const { body } = require("express-validator");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/plannerController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(protect);
router
  .route("/tasks")
  .get(getTasks)
  .post(
    [body("title").trim().notEmpty().withMessage("Title is required"), body("date").isISO8601().withMessage("Valid date is required")],
    validate,
    createTask
  );
router.route("/tasks/:id").patch(updateTask).delete(deleteTask);

module.exports = router;
