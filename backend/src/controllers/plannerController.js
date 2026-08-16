const asyncHandler = require("express-async-handler");
const PlannerTask = require("../models/PlannerTask");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * @route   GET /api/planner/tasks?month=8&year=2026
 * @desc    List tasks, optionally scoped to a calendar month
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  const { month, year } = req.query;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: start, $lt: end };
  }
  const tasks = await PlannerTask.find(filter).sort({ date: 1 });
  new ApiResponse(res, 200, "Tasks fetched", { tasks });
});

/**
 * @route   POST /api/planner/tasks
 * @desc    Create a task
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, date } = req.body;
  const task = await PlannerTask.create({ user: req.user._id, title, date });
  new ApiResponse(res, 201, "Task created", { task });
});

/**
 * @route   PATCH /api/planner/tasks/:id
 * @desc    Update a task (title, date, or completed status)
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await PlannerTask.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError(404, "Task not found");

  ["title", "date", "completed"].forEach((key) => {
    if (req.body[key] !== undefined) task[key] = req.body[key];
  });
  await task.save();

  new ApiResponse(res, 200, "Task updated", { task });
});

/**
 * @route   DELETE /api/planner/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await PlannerTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError(404, "Task not found");
  new ApiResponse(res, 200, "Task deleted", { id: req.params.id });
});

module.exports = { getTasks, createTask, updateTask, deleteTask };
