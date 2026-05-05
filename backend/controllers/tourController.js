const Tour = require("../models/Tour");

// 1. Create a new tour request (Public)
const createTour = async (req, res) => {
  try {
    const { parentName, email, phone, requestedDate, requestedTime } = req.body;

    // Validate required fields
    if (!parentName || !email || !phone || !requestedDate || !requestedTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newTour = new Tour({
      parentName,
      email,
      phone,
      requestedDate,
      requestedTime,
      status: "Pending",
    });

    const savedTour = await newTour.save();

    res.status(201).json({
      success: true,
      message: "Tour request submitted! We will contact you soon.",
      data: savedTour,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create tour request",
      error: error.message,
    });
  }
};

// 2. Get all tour requests (Admin only)
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch tours",
      error: error.message,
    });
  }
};

// 3. Update tour status (Admin only)
const updateTourStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { status, adminNotes: adminNotes || "" },
      { new: true, runValidators: true },
    );

    if (!updatedTour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour status updated successfully",
      data: updatedTour,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update tour status",
      error: error.message,
    });
  }
};

// 4. Delete a tour request (Admin only)
const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTour = await Tour.findByIdAndDelete(id);

    if (!deletedTour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: deletedTour,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete tour",
      error: error.message,
    });
  }
};

module.exports = {
  createTour,
  getAllTours,
  updateTourStatus,
  deleteTour,
};
