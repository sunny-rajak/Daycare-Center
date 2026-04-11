const Class = require("../models/Class");
const Child = require("../models/Child");

// Get all classes with occupancy counts
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({});
    const classesWithOccupancy = await Promise.all(
      classes.map(async (cls) => {
        const enrolledCount = await Child.countDocuments({ classId: cls._id });
        return {
          ...cls.toObject(),
          enrolledCount,
        };
      }),
    );

    res.json({ success: true, data: classesWithOccupancy });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Create a new class
const createClass = async (req, res) => {
  try {
    const { className, ageGroup, capacity } = req.body;
    const newClass = new Class({ className, ageGroup, capacity });
    const savedClass = await newClass.save();
    res.status(201).json({ success: true, data: savedClass });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Creation failed",
      error: error.message,
    });
  }
};

// Update class details
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, ageGroup, capacity } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { className, ageGroup, capacity },
      { new: true, runValidators: true },
    );

    if (!updatedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    res.json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    res.json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Deletion failed",
      error: error.message,
    });
  }
};

// Seed default classes when collection is empty
const seedClasses = async (req, res) => {
  try {
    const existingCount = await Class.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Classes collection already seeded",
        count: existingCount,
      });
    }

    const defaultClasses = [
      { className: "Infant", ageGroup: "3m - 15m", capacity: 10 },
      { className: "Toddler", ageGroup: "16m - 33m", capacity: 12 },
      { className: "Preschool", ageGroup: "33m - 5y", capacity: 20 },
    ];

    const insertedClasses = await Class.insertMany(defaultClasses);
    res.status(201).json({
      success: true,
      message: "Default classes seeded successfully",
      data: insertedClasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Seeding failed",
      error: error.message,
    });
  }
};

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  seedClasses,
};
