const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      enum: ["Infant", "Toddler", "Preschool"],
    },
    ageGroup: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    monthlyFee: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Class", classSchema);
