const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Runs after an array of express-validator checks in a route.
 * Collects any failures into a single 400 ApiError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      "Validation failed",
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = validate;
