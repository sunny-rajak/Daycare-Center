const User = require("../models/userModel");
const Child = require("../models/Child");
const Parent = require("../models/Parent");
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
    const normalizedEmail = email.trim().toLowerCase();

    if (userCount > 0 && role !== "parent") {
      // Require admin authentication for subsequent staff registrations
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
    } else if (userCount === 0 && role !== "parent") {
      // First user: automatically set as admin and ignore submitted role
      currentRole = "admin";
    }

    // 1. Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    let parentRecord = null;
    if (role === "parent") {
      // Verify that this parent email belongs to an enrolled child
      let childMatch = await Child.findOne({
        parentEmail: normalizedEmail,
        status: "Enrolled",
      }).populate("parentId");

      // Fallback: if parentEmail is not stored on the child yet, check by parent record
      if (!childMatch) {
        const parentLookup = await Parent.findOne({ email: normalizedEmail });
        if (parentLookup) {
          childMatch = await Child.findOne({
            parentId: parentLookup._id,
            status: "Enrolled",
          }).populate("parentId");
        }
      }

      if (!childMatch) {
        res.status(403);
        throw new Error(
          "Registration is only available for enrolled families. Please complete the enrollment process first.",
        );
      }

      if (childMatch.parentId) {
        parentRecord = childMatch.parentId;
      } else {
        parentRecord = await Parent.create({
          name,
          email: normalizedEmail,
          phone: phone?.trim() || "",
        });
      }

      if (!childMatch.parentId) {
        await Child.updateMany(
          { parentEmail: normalizedEmail },
          { parentId: parentRecord._id },
        );
      }

      currentRole = "parent";
    }

    // 2. Create the user (Password is hashed automatically in the Model)
    const userData = {
      name,
      email: normalizedEmail,
      password,
      role: currentRole || "teacher",
    };

    if (parentRecord) {
      userData.parentId = parentRecord._id;
    }

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
      if (parentRecord && !parentRecord.userId) {
        await Parent.findByIdAndUpdate(parentRecord._id, {
          userId: user._id,
        });
      }

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
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

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

// @desc    Delete a user (Staff)
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "User removed successfully" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};
