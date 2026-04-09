const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    childName: { type: String, required: true },
    childAge: { type: Number, required: true },
    programOfInterest: {
      type: String,
      enum: ["Infant", "Toddler", "Preschool"],
      required: true, // Added this so you know which program they want
    },
    message: String,
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Contacted", "Enrolled", "Rejected", "Closed"],
    },
  },
  {
    timestamps: true, // This automatically adds 'createdAt' and 'updatedAt' fields
  },
);

module.exports = mongoose.model("Inquiry", inquirySchema);
