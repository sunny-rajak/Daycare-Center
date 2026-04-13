const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

// @desc    Register a new user (Staff/Admin)
// @route   POST /api/users/register
// @access  Public for first user, Admin-only thereafter
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, salary, hireDate, classId } =
      req.body;

    // Check if any users exist
    const userCount = await User.countDocuments();
    let currentRole = role;

    if (userCount > 0) {
      // Require admin authentication for subsequent registrations
      if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")
      ) {
        res.status(401);
        throw new Error("Not authorized, no token");
      }

      const token = req.headers.authorization.split(" ")[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (tokenError) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }

      const authenticatedUser = await User.findById(decoded.id).select(
        "-password",
      );
      if (!authenticatedUser || authenticatedUser.role !== "admin") {
        res.status(403);
        throw new Error("Only admins can register new users");
      }
    } else {
      // First user: automatically set as admin and ignore submitted role
      currentRole = "admin";
    }

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // 2. Create the user (Password is hashed automatically in the Model)
    const userData = {
      name,
      email,
      password,
      role: currentRole || "teacher",
    };

    if (classId) {
      userData.classId = classId;
    }

    // Only add optional fields if they are provided and not empty
    if (phone?.trim()) userData.phone = phone.trim();
    if (salary !== undefined && salary !== null && salary !== "") {
      userData.salary = Number(salary);
    }
    if (hireDate?.trim()) userData.hireDate = new Date(hireDate);

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId || null,
        token: generateToken(user._id), // Send token immediately on register
      });
    }
  } catch (error) {
    next(error); // Pass to our professional errorMiddleware
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Use the matchPassword helper we wrote in the Model
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId || null,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};
