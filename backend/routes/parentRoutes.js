const express = require("express");
const router = express.Router();
const {
  getMyFamily,
  registerParent,
  getDashboardData,
  updateChildSafetyProfile,
  updateChildBasicInfo,
} = require("../controllers/parentController");
const { protect, parent } = require("../middleware/authMiddleware");

router.post("/register", registerParent);
router.get("/my-family", protect, parent, getMyFamily);
router.get("/dashboard-data", protect, parent, getDashboardData);
router.put(
  "/child/:childId/safety-profile",
  protect,
  parent,
  updateChildSafetyProfile,
);
router.put("/child/:childId/basic-info", protect, parent, updateChildBasicInfo);

module.exports = router;
