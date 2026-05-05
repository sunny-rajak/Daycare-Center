const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// @desc    Admin-only endpoint to register a new staff member (teacher)
// @route   POST /api/admin/register-staff
// @access  Admin only
exports.registerStaff = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, salary, hireDate, classId } =
      req.body;

    // Validate that role is either 'teacher' or 'admin'
    if (!role || !["teacher", "admin"].includes(role)) {
      res.status(400);
      throw new Error("Role must be either 'teacher' or 'admin'");
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email already exists");
    }

    // Create user data
    const userData = {
      name,
      email: normalizedEmail,
      password,
      role,
      phone: phone?.trim() || undefined,
      salary: salary ? Number(salary) : undefined,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      classId: classId || undefined,
    };

    // Remove undefined fields
    Object.keys(userData).forEach(
      (key) => userData[key] === undefined && delete userData[key],
    );

    // Create the user
    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      salary: user.salary || null,
      hireDate: user.hireDate || null,
      classId: user.classId || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
