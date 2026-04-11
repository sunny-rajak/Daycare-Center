const express = require("express");
const router = express.Router();
const {
  submitInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
  enrollChild,
} = require("../controllers/inquiryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/submit", submitInquiry);
router.get("/all", protect, admin, getAllInquiries);

// This matches the frontend call: axios.put(`${API_URL}/${id}/status`...)
router.put("/:id/status", protect, admin, updateInquiryStatus);

router.delete("/:id", protect, admin, deleteInquiry);

// New enrollment route
router.post("/:id/enroll", protect, admin, enrollChild);

module.exports = router;
