/**
 * Optional demo-data seeder.
 * Usage: npm run seed
 * Creates one demo user (demo@studyai.app / password123) with a few
 * planner tasks and a week of study sessions, so the analytics/planner
 * screens have something to show immediately after setup.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const PlannerTask = require("../models/PlannerTask");
const StudySession = require("../models/StudySession");

(async () => {
  await connectDB();

  const email = "demo@studyai.app";
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "Demo Student",
      email,
      password: "password123",
      school: "Riverdale University",
      major: "Biology, B.Sc.",
      year: "3rd Year",
      bio: "Demo account seeded for local development.",
    });
    console.log(`Created demo user: ${email} / password123`);
  } else {
    console.log("Demo user already exists, skipping creation.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    await StudySession.findOneAndUpdate(
      { user: user._id, date },
      { hours: Math.round((Math.random() * 3 + 1) * 10) / 10 },
      { upsert: true }
    );
  }

  await PlannerTask.findOneAndUpdate(
    { user: user._id, title: "Review Chapter 4 notes" },
    { user: user._id, title: "Review Chapter 4 notes", date: today, completed: false },
    { upsert: true }
  );

  console.log("Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
