const Inquiry = require("../models/Inquiry");

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

// Update your module.exports at the bottom
module.exports = {
  submitInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry, // Add this
};
