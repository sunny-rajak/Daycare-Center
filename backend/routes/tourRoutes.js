const express = require("express");
const router = express.Router();
const {
  createTour,
  getAllTours,
  updateTourStatus,
  deleteTour,
} = require("../controllers/tourController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public route - anyone can submit a tour request
router.post("/create", createTour);

// Admin routes - protected
router.get("/all", protect, admin, getAllTours);
router.put("/:id/status", protect, admin, updateTourStatus);
router.delete("/:id", protect, admin, deleteTour);

module.exports = router;
