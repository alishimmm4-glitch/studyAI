const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, true);

  new ApiResponse(res, 201, "Account created successfully", {
    user: user.toSafeObject(),
    token,
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and return a JWT
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, remember } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id, !!remember);

  new ApiResponse(res, 200, "Logged in successfully", {
    user: user.toSafeObject(),
    token,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(res, 200, "Current user fetched", { user: req.user.toSafeObject() });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate a password reset token (in production this would be emailed;
 *          here it is returned directly since no mail service is configured)
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return new ApiResponse(res, 200, "If that email exists, a reset link has been generated");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // NOTE: wire this up to a real email provider (SendGrid, SES, Resend, etc.)
  // in production. For now, the raw token is returned so the flow is testable.
  new ApiResponse(res, 200, "If that email exists, a reset link has been generated", {
    resetToken,
    expiresInMinutes: 30,
  });
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using a valid reset token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) throw new ApiError(400, "Reset token is invalid or has expired");

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const token = generateToken(user._id, false);
  new ApiResponse(res, 200, "Password reset successfully", { token });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
