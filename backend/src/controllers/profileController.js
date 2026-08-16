const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * @route   PATCH /api/profile
 * @desc    Update the current user's profile fields
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "school", "major", "year", "bio", "avatar"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  new ApiResponse(res, 200, "Profile updated", { user: user.toSafeObject() });
});

/**
 * @route   PATCH /api/profile/password
 * @desc    Change the current user's password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  new ApiResponse(res, 200, "Password changed successfully");
});

module.exports = { updateProfile, changePassword };
