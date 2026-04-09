const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const registerStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone, salary, hireDate } = req.body;

    // Task 2: Check if there are any users in the database
    const userCount = await User.countDocuments();

    let assignedRole = role || "teacher";

    if (userCount === 0) {
      // "Setup" Exception: If the DB is empty, the first user is an admin
      assignedRole = "admin";
    } else {
      // If users exist, the requester MUST be an authenticated Admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied: Only admins can register new staff members.",
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone,
      salary,
      hireDate,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerStaff };
