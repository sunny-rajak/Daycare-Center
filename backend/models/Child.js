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
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Enrolled", "Withdrawn"],
      default: "Enrolled",
    },
    allergies: {
      type: [String],
      default: [],
    },
    dietaryRestrictions: {
      type: [String],
      default: [],
    },
    medications: {
      type: [
        {
          name: { type: String },
          dosage: { type: String },
          timeToAdminister: { type: String },
        },
      ],
      default: [],
    },
    emergencyContacts: {
      type: [
        {
          name: { type: String, required: true },
          relationship: { type: String, required: true },
          phone: { type: String, required: true },
        },
      ],
      default: [],
    },
    authorizedPickups: {
      type: [
        {
          name: { type: String },
          relationship: { type: String },
          phone: { type: String },
          photoIdChecked: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Child", childSchema);
