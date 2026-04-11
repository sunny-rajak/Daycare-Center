const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    enrollmentDate: { type: Date, default: Date.now },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Child", childSchema);
