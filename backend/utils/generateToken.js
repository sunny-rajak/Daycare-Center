const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  // Sign the token with the User ID and our Secret
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
