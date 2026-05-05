const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Example authentication middleware (verifies JWT and sets req.user)
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in your .env
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Task 3: Role-Based Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role: ${req.user?.role || "Guest"} is not authorized to access this resource`,
      });
    }
    next();
  };
};

const admin = authorizeRoles("admin");
const teacher = authorizeRoles("teacher");
const parent = authorizeRoles("parent");

module.exports = { protect, admin, teacher, parent, authorizeRoles };
