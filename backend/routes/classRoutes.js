const express = require("express");
const router = express.Router();
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  seedClasses,
} = require("../controllers/classController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getClasses);
router.post("/", protect, admin, createClass);
router.put("/:id", protect, admin, updateClass);
router.delete("/:id", protect, admin, deleteClass);
router.post("/seed", protect, admin, seedClasses);

module.exports = router;
