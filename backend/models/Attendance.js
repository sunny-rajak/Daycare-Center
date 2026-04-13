const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    status: {
      type: String,
      required: true,
      enum: ["Present", "Absent"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
