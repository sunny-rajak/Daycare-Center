const Inquiry = require("../models/Inquiry");
const Parent = require("../models/Parent");
const Child = require("../models/Child");
const Class = require("../models/Class");

// 1. Submit a new inquiry
const submitInquiry = async (req, res) => {
  try {
    const {
      parentName,
      email,
      phone,
      childName,
      childAge,
      programOfInterest,
      message,
    } = req.body;

    const newInquiry = new Inquiry({
      parentName,
      email,
      phone,
      childName,
      childAge,
      programOfInterest,
      message,
    });

    const savedInquiry = await newInquiry.save();

    res.status(201).json({
      success: true,
      message: "We received your inquiry!",
      data: savedInquiry,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Submission failed",
      error: error.message,
    });
  }
};

// 2. Get all inquiries
const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    next(error);
  }
};

// 3. Update status
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedInquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, data: updatedInquiry });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete request for ID:", id);
    const deletedInquiry = await Inquiry.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// 5. Enroll a child from an inquiry
const enrollChild = async (req, res) => {
  try {
    const { id } = req.params; // inquiryId
    const { classId } = req.body;

    console.log("Enrolling child for inquiry ID:", id, "classId:", classId);

    // Fetch the inquiry
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      console.log("Inquiry not found for ID:", id);
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    console.log("Inquiry data:", {
      id: inquiry._id,
      status: inquiry.status,
      email: inquiry.email,
      phone: inquiry.phone,
      childName: inquiry.childName,
      childAge: inquiry.childAge,
    });

    if (inquiry.status !== "Pending") {
      console.log("Inquiry status is not pending:", inquiry.status);
      return res
        .status(400)
        .json({ success: false, message: "Inquiry is not in pending status" });
    }

    // Check if class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      console.log("Class not found for ID:", classId);
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    // Check class capacity
    const enrolledCount = await Child.countDocuments({
      classId: selectedClass._id,
    });
    console.log("Class capacity check:", {
      enrolledCount,
      capacity: selectedClass.capacity,
      className: selectedClass.name,
    });
    if (enrolledCount >= selectedClass.capacity) {
      console.log("Class at full capacity");
      return res.status(400).json({
        success: false,
        message: "Selected class is already at full capacity",
      });
    }

    // Reuse an existing parent record if one exists for this email,
    // otherwise create a new parent record.
    console.log(
      "Looking for existing parent with email:",
      inquiry.email,
      "and phone:",
      inquiry.phone,
    );
    let parent = await Parent.findOne({
      email: inquiry.email,
      phone: inquiry.phone,
    });
    if (!parent) {
      parent = await Parent.findOne({ email: inquiry.email });
    }

    if (parent) {
      parent.name = inquiry.parentName;
      parent.phone = inquiry.phone;
      await parent.save();
      console.log("Parent updated:", parent._id.toString(), parent.name);
    } else {
      parent = await Parent.create({
        name: inquiry.parentName,
        email: inquiry.email,
        phone: inquiry.phone,
      });
      console.log("Parent created:", parent._id.toString(), parent.name);
    }

    // Create Child
    const ageNumber = Number(inquiry.childAge);
    console.log(
      "Child age from inquiry:",
      inquiry.childAge,
      "parsed:",
      ageNumber,
    );
    const birthday = Number.isFinite(ageNumber)
      ? new Date(Date.now() - ageNumber * 365 * 24 * 60 * 60 * 1000)
      : new Date();
    console.log("Calculated birthday:", birthday);

    const child = await Child.create({
      name: inquiry.childName,
      dateOfBirth: birthday,
      age: ageNumber,
      gender: "Other", // Default, can be updated later
      parentId: parent._id,
      classId: selectedClass._id,
    });
    console.log("Child created:", child._id, child.name);

    // Update Inquiry status
    inquiry.status = "Enrolled";
    await inquiry.save();
    console.log("Inquiry status updated to Enrolled");

    res.status(201).json({
      success: true,
      message: "Child enrolled successfully",
      data: { parent, child },
    });
  } catch (error) {
    console.error("Error in enrollChild:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update your module.exports at the bottom
module.exports = {
  submitInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
  enrollChild,
};
