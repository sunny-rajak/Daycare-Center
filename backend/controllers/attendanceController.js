const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

const createAttendance = async (req, res) => {
  try {
    const {
      childId,
      status,
      date,
      records,
      classId: requestClassId,
    } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    const teacherClassId = req.user?.classId;
    const classId =
      req.user?.role === "teacher" ? teacherClassId : requestClassId;

    if (req.user?.role === "teacher" && !teacherClassId) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher must be assigned to a class before saving attendance.",
      });
    }

    const entries = [];

    if (Array.isArray(records)) {
      records.forEach((record) => {
        if (record.childId && record.status) {
          entries.push({
            childId: record.childId,
            status: record.status,
            date: record.date ? new Date(record.date) : attendanceDate,
            classId,
          });
        }
      });
    } else if (childId && status) {
      entries.push({ childId, status, date: attendanceDate, classId });
    }

    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance records are required",
      });
    }

    const createdAttendance = await Attendance.insertMany(entries);
    res.status(201).json({ success: true, data: createdAttendance });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save attendance",
      error: error.message,
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { date, startDate, endDate, classId, childId } = req.query;
    const filter = {};

    if (req.user?.role === "teacher") {
      if (!req.user.classId) {
        return res.status(200).json({ success: true, data: [] });
      }
      filter.classId = req.user.classId;
    }

    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          message: "A valid classId is required",
        });
      }
      filter.classId = classId;
    }

    if (childId) {
      if (!mongoose.Types.ObjectId.isValid(childId)) {
        return res.status(400).json({
          success: false,
          message: "A valid childId is required",
        });
      }
      filter.childId = childId;
    }

    if (date) {
      const target = new Date(date);
      if (Number.isNaN(target.getTime())) {
        return res.status(400).json({
          success: false,
          message: "A valid date is required",
        });
      }
      const start = new Date(target.setHours(0, 0, 0, 0));
      const end = new Date(target.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    } else {
      const range = {};
      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "A valid startDate is required",
          });
        }
        range.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "A valid endDate is required",
          });
        }
        range.$lte = new Date(end.setHours(23, 59, 59, 999));
      }
      if (Object.keys(range).length) {
        filter.date = range;
      }
    }

    const records = await Attendance.find(filter)
      .populate("childId", "name")
      .populate("classId", "className")
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history",
      error: error.message,
    });
  }
};

module.exports = { createAttendance, getAttendanceHistory };
