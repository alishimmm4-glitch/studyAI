const rateLimit = require("express-rate-limit");

const windowMin = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
const max = Number(process.env.RATE_LIMIT_MAX || 200);

/** General API limiter — applied globally in app.js */
const apiLimiter = rateLimit({
  windowMs: windowMin * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

/** Stricter limiter for auth endpoints to slow down brute-force attempts */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

module.exports = { apiLimiter, authLimiter };
