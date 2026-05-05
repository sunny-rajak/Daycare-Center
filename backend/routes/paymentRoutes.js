const express = require("express");
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentsByParent,
  getAllParents,
  generateMonthlyInvoices,
  updatePaymentStatus,
  deletePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyRazorpayPayment);

router.post("/generate-monthly", protect, admin, generateMonthlyInvoices);
router.post("/", protect, admin, createPayment);
router.get("/", protect, admin, getAllPayments);
router.get("/parent/:parentId", protect, admin, getPaymentsByParent);
router.get("/parents", protect, admin, getAllParents);
router.patch("/:id", protect, admin, updatePaymentStatus);
router.delete("/:id", protect, admin, deletePayment);

module.exports = router;
