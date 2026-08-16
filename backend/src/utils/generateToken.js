const jwt = require("jsonwebtoken");

/**
 * Signs a JWT for a given user id.
 * @param {string} id - Mongo user _id
 * @param {boolean} remember - if true, issues a longer-lived token
 */
const generateToken = (id, remember = false) => {
  const expiresIn = remember
    ? process.env.JWT_EXPIRES_IN_REMEMBER || "30d"
    : process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
