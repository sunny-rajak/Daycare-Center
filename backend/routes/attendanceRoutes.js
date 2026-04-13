const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createAttendance,
  getAttendanceHistory,
} = require("../controllers/attendanceController");

router.post("/", protect, authorizeRoles("teacher", "admin"), createAttendance);
router.get(
  "/history",
  protect,
  authorizeRoles("teacher", "admin"),
  getAttendanceHistory,
);

module.exports = router;
