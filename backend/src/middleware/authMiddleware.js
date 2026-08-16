const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

/**
 * Verifies the Bearer JWT on the request, attaches the authenticated
 * user (minus password) to req.user, and calls next(). Rejects with 401
 * on any missing/invalid/expired token or deleted user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized — no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "Not authorized — user no longer exists");
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Not authorized — invalid or expired token");
  }
});

/**
 * Gate for premium-only features. Use after `protect`.
 */
const requirePremium = (req, res, next) => {
  if (req.user?.plan !== "premium") {
    throw new ApiError(403, "This feature requires a Premium plan");
  }
  next();
};

module.exports = { protect, requirePremium };
