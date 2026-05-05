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

    // Free up the class spot if the status is moved away from Enrolled
    if (status !== "Enrolled") {
      await Child.updateMany(
        {
          name: updatedInquiry.childName,
          parentEmail: updatedInquiry.email,
        },
        { $set: { status: "Unenrolled" }, $unset: { classId: 1 } },
      );
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

    // Fetch the inquiry
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Inquiry not found" });
    }

    if (inquiry.status === "Enrolled") {
      return res
        .status(400)
        .json({ success: false, message: "Child is already enrolled" });
    }

    // Check if class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    // Check class capacity
    const enrolledCount = await Child.countDocuments({
      classId: selectedClass._id,
    });
    if (enrolledCount >= selectedClass.capacity) {
      return res.status(400).json({
        success: false,
        message: "Selected class is already at full capacity",
      });
    }

    // Reuse an existing parent record if one exists for this email,
    // otherwise create a new parent record.
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
    } else {
      parent = await Parent.create({
        name: inquiry.parentName,
        email: inquiry.email,
        phone: inquiry.phone,
      });
    }

    // Create Child
    const ageNumber = Number(inquiry.childAge);
    const birthday = Number.isFinite(ageNumber)
      ? new Date(Date.now() - ageNumber * 365 * 24 * 60 * 60 * 1000)
      : new Date();

    let child = await Child.findOne({
      name: inquiry.childName,
      parentEmail: inquiry.email,
    });

    if (child) {
      child.classId = selectedClass._id;
      child.status = "Enrolled";
      await child.save();
    } else {
      child = await Child.create({
        name: inquiry.childName,
        dateOfBirth: birthday,
        age: ageNumber,
        gender: "Other", // Default, can be updated later
        parentId: parent._id,
        parentEmail: inquiry.email,
        classId: selectedClass._id,
        status: "Enrolled",
      });
    }

    // Update Inquiry status
    inquiry.status = "Enrolled";
    await inquiry.save();

    res.status(201).json({
      success: true,
      message: "Child enrolled successfully",
      data: { parent, child },
    });
  } catch (error) {
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
