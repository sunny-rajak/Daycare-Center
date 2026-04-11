const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true },
);

parentSchema.index({ email: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model("Parent", parentSchema);
