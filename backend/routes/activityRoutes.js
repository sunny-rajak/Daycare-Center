const express = require("express");
const router = express.Router();
const {
  createActivity,
  getActivitiesByChild,
} = require("../controllers/activityController");
const { protect, admin, teacher } = require("../middleware/authMiddleware");

router.post("/", protect, teacher, createActivity);
router.get("/child/:childId", protect, teacher, getActivitiesByChild);

module.exports = router;
