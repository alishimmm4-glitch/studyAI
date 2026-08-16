/**
 * Netlify Functions entrypoint.
 * Wraps the existing Express app (src/app.js) with serverless-http so the
 * exact same routes/controllers/middleware run inside a Lambda-style
 * function — no duplicate logic to maintain.
 *
 * netlify.toml redirects /api/* -> /.netlify/functions/api/:splat, so we
 * strip that function prefix back down to /api/... before handing the
 * event to serverless-http, keeping every route in app.js unchanged.
 */
require("dotenv").config();
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const app = require("../../src/app");

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) return cachedConnection;
  cachedConnection = await mongoose.connect(process.env.MONGO_URI);
  return cachedConnection;
}

const serverlessHandler = serverless(app);

module.exports.handler = async (event, context) => {
  // Reuse the DB connection across warm invocations instead of reconnecting
  // on every request.
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();

  // Rewrite the function path back to the app's expected /api/... shape.
  event.path = event.path.replace("/.netlify/functions/api", "/api") || "/api";

  return serverlessHandler(event, context);
};
