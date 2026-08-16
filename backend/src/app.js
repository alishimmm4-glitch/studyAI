const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const quizRoutes = require("./routes/quizRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", apiLimiter);

// --- Static file serving removed: notes are processed in-memory only
// (buffer -> text extraction -> discard), so no uploaded files persist on
// disk. This keeps the API stateless and serverless-friendly (Netlify
// Functions have a read-only/ephemeral filesystem).

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "StudyAI API is running", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
