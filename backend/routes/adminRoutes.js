const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { registerStaff } = require("../controllers/adminController");

// @route   POST /api/admin/register-staff
// @access  Admin only
// @desc    Admin-only endpoint to create teacher/staff accounts
router.post("/register-staff", protect, authorizeRoles("admin"), registerStaff);

module.exports = router;
