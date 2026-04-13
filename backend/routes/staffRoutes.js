const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getStaffList,
  assignClassToTeacher,
  getTeacherDashboard,
} = require("../controllers/staffController");

router.get("/", protect, authorizeRoles("admin"), getStaffList);
router.put(
  "/assign-class",
  protect,
  authorizeRoles("admin"),
  assignClassToTeacher,
);
router.get(
  "/my-class",
  protect,
  authorizeRoles("teacher"),
  getTeacherDashboard,
);

module.exports = router;
