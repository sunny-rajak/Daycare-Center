const Child = require("../models/Child");
const Activity = require("../models/Activity");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");
const Parent = require("../models/Parent");
const User = require("../models/userModel");
const Inquiry = require("../models/Inquiry");
const generateToken = require("../utils/generateToken");

// Get family data for logged-in parent
const getMyFamily = async (req, res) => {
  try {
    // Security: Ensure req.user exists (from protect middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Find parent by stored parentId or by userId link
    const parent =
      (req.user.parentId && (await Parent.findById(req.user.parentId))) ||
      (await Parent.findOne({ userId: req.user._id }));

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const parentId = parent._id;

    // Get all children for this parent
    const children = await Child.find({ parentId }).populate(
      "classId",
      "className ageGroup monthlyFee",
    );

    // Get recent activities for these children
    const childIds = children.map((c) => c._id);
    const activities = await Activity.find({
      childId: { $in: childIds },
    })
      .sort({ date: -1 })
      .limit(20)
      .populate("childId", "name")
      .populate("teacherId", "name");

    // Get attendance summary for this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendanceThisMonth = await Attendance.find({
      childId: { $in: childIds },
      date: { $gte: monthStart, $lte: monthEnd },
      status: "Present",
    });

    const attendanceSummary = {};
    children.forEach((child) => {
      const daysPresent = attendanceThisMonth.filter(
        (a) => a.childId.toString() === child._id.toString(),
      ).length;
      attendanceSummary[child._id.toString()] = {
        childName: child.name,
        daysPresent,
      };
    });

    // Get billing overview (pending and paid invoices)
    const invoices = await Payment.find({ parentId })
      .sort({ date: -1 })
      .populate("childId", "name");

    const billingOverview = {
      pending: invoices.filter((inv) =>
        ["Pending", "Overdue"].includes(inv.status),
      ),
      paid: invoices.filter((inv) => inv.status === "Paid"),
      totalPending: invoices
        .filter((inv) => ["Pending", "Overdue"].includes(inv.status))
        .reduce((sum, inv) => sum + inv.amount, 0),
      totalPaid: invoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + inv.amount, 0),
      hasOverdue: invoices.some((inv) => inv.status === "Overdue"),
    };

    res.json({
      success: true,
      data: {
        parent: {
          _id: parent._id,
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
        },
        children,
        recentActivities: activities,
        attendanceSummary,
        billingOverview,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch family data",
      error: error.message,
    });
  }
};

// Register a parent
const registerParent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Verify the email has an enrollment inquiry or existing linked parent record
    const inquiry = await Inquiry.findOne({ email });
    const existingParent = await Parent.findOne({ email });

    if (!inquiry && !existingParent) {
      return res.status(400).json({
        success: false,
        message:
          "No enrollment found for this email. Please contact the daycare admin.",
      });
    }

    let parentRecord = existingParent;
    if (!parentRecord) {
      parentRecord = await Parent.create({
        name: inquiry.parentName || name,
        email,
        phone: phone || inquiry.phone,
      });
    }

    // Create the User with parent role and link to the Parent record
    const user = new User({
      name,
      email,
      password,
      phone: phone || inquiry?.phone,
      role: "parent",
      parentId: parentRecord._id,
    });

    const savedUser = await user.save();

    // Update Parent record with the user ID if needed
    if (parentRecord && !parentRecord.userId) {
      await Parent.findByIdAndUpdate(parentRecord._id, {
        userId: savedUser._id,
      });
    }

    res.status(201).json({
      success: true,
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      token: generateToken(savedUser._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not register parent",
      error: error.message,
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.parentId) {
      return res.status(404).json({
        success: false,
        message: "Parent record not found for this user.",
      });
    }

    const parentId = user.parentId;

    const children = await Child.find({ parentId }).populate(
      "classId",
      "className",
    );

    const childIds = children.map((child) => child._id);

    const recentActivities = await Activity.find({
      childId: { $in: childIds },
    })
      .sort({ date: -1 })
      .limit(5)
      .populate("childId", "name")
      .populate("teacherId", "name");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendanceRecords = await Attendance.find({
      childId: { $in: childIds },
      status: "Present",
      date: { $gte: monthStart, $lte: monthEnd },
    });

    const attendanceSummary = {
      totalPresentDays: attendanceRecords.length,
      byChild: children.map((child) => ({
        childId: child._id,
        childName: child.name,
        presentDays: attendanceRecords.filter(
          (record) => record.childId.toString() === child._id.toString(),
        ).length,
      })),
    };

    const outstandingInvoices = await Payment.find({
      parentId,
      status: { $in: ["Pending", "Overdue"] },
    })
      .sort({ date: -1 })
      .populate("childId", "name");

    res.json({
      success: true,
      data: {
        children,
        recentActivities,
        attendanceSummary,
        outstandingInvoices,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch parent dashboard data",
      error: error.message,
    });
  }
};

// Update child's safety profile (allergies, medications, emergency contacts, etc.)
const updateChildSafetyProfile = async (req, res) => {
  try {
    const { childId } = req.params;
    const {
      allergies,
      dietaryRestrictions,
      medications,
      emergencyContacts,
      authorizedPickups,
    } = req.body;

    // Verify the child exists and belongs to the logged-in parent
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    // Security: Ensure the child belongs to the authenticated parent
    const parent = await Parent.findOne({ userId: req.user._id });
    if (!parent || child.parentId.toString() !== parent._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This child does not belong to you",
      });
    }

    // Update the child with new safety profile data
    const updatedChild = await Child.findByIdAndUpdate(
      childId,
      {
        allergies: allergies || [],
        dietaryRestrictions: dietaryRestrictions || [],
        medications: medications || [],
        emergencyContacts: emergencyContacts || [],
        authorizedPickups: authorizedPickups || [],
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Child safety profile updated successfully",
      data: updatedChild,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not update child safety profile",
      error: error.message,
    });
  }
};

// Update child's basic information (name, gender, dateOfBirth, age)
const updateChildBasicInfo = async (req, res) => {
  try {
    const { childId } = req.params;
    const { name, gender, dateOfBirth, age } = req.body;

    // Verify the child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    // Security: Ensure the child belongs to the authenticated parent
    const parent = await Parent.findOne({ userId: req.user._id });
    if (!parent || child.parentId.toString() !== parent._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This child does not belong to you",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (gender) updateData.gender = gender; // Mongoose will automatically validate enum ["Male", "Female", "Other"]

    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);

      // Auto-calculate exact age if it wasn't explicitly passed in the request
      if (age === undefined) {
        const ageDifMs = Date.now() - updateData.dateOfBirth.getTime();
        const ageDate = new Date(ageDifMs);
        updateData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }

    if (age !== undefined) updateData.age = Number(age);

    const updatedChild = await Child.findByIdAndUpdate(childId, updateData, {
      new: true,
      runValidators: true, // Ensures enum and type rules are respected
    });

    res.json({
      success: true,
      message: "Child basic info updated",
      data: updatedChild,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not update child basic info",
      error: error.message,
    });
  }
};

module.exports = {
  getMyFamily,
  registerParent,
  getDashboardData,
  updateChildSafetyProfile,
  updateChildBasicInfo,
};
