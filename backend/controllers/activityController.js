const Activity = require("../models/Activity");
const Child = require("../models/Child");
const User = require("../models/userModel");

// Create single or multiple activities
const createActivity = async (req, res) => {
  try {
    const { activities } = req.body;

    // If activities is an array, insert multiple
    if (Array.isArray(activities)) {
      // Automatically inject teacher ID from logged-in user
      activities.forEach((activity) => {
        if (!activity.teacherId && req.user) {
          activity.teacherId = req.user._id;
        }
      });
      const createdActivities = await Activity.insertMany(activities);
      const populatedActivities = await Activity.find({
        _id: { $in: createdActivities.map((a) => a._id) },
      })
        .populate("childId", "name")
        .populate("teacherId", "name");
      res.status(201).json({
        success: true,
        count: populatedActivities.length,
        data: populatedActivities,
      });
    } else {
      // Single activity
      if (!req.body.teacherId && req.user) {
        req.body.teacherId = req.user._id;
      }
      const activity = await Activity.create(req.body);
      const populatedActivity = await Activity.findById(activity._id)
        .populate("childId", "name")
        .populate("teacherId", "name");
      res.status(201).json({ success: true, data: populatedActivity });
    }
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Could not create activity",
      error: error.message,
    });
  }
};

// Get activities for a specific child
const getActivitiesByChild = async (req, res) => {
  try {
    const { childId } = req.params;

    const child = await Child.findById(childId);
    if (!child) {
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });
    }

    const activities = await Activity.find({ childId })
      .sort({ date: -1 })
      .populate("teacherId", "name");

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch activities",
      error: error.message,
    });
  }
};

module.exports = {
  createActivity,
  getActivitiesByChild,
};
