const mongoose = require("mongoose");
const Class = require("../models/Class");
const Child = require("../models/Child");
const User = require("../models/userModel");

const getStaffList = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .populate("classId", "className ageGroup")
      .lean();

    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff list",
      error: error.message,
    });
  }
};

const assignClassToTeacher = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          message: "A valid classId is required",
        });
      }

      const assignedClass = await Class.findById(classId);
      if (!assignedClass) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }
      teacher.classId = classId;
    } else {
      teacher.classId = null;
    }

    await teacher.save();

    const updatedTeacher = await User.findById(teacherId)
      .select("-password")
      .populate("classId", "className ageGroup");

    res.json({ success: true, data: updatedTeacher });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not assign class to teacher",
      error: error.message,
    });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    if (!req.user?.classId) {
      return res.status(200).json({
        success: true,
        class: null,
        students: [],
      });
    }

    const assignedClass = await Class.findById(req.user.classId);
    if (!assignedClass) {
      return res.status(404).json({
        success: false,
        message: "Assigned class not found",
      });
    }

    const students = await Child.find({ classId: assignedClass._id })
      .select("name dateOfBirth gender")
      .lean();

    res.json({
      success: true,
      class: assignedClass,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load teacher dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffList,
  assignClassToTeacher,
  getTeacherDashboard,
};
