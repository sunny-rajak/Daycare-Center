const Payment = require("../models/Payment");
const Parent = require("../models/Parent");
const Child = require("../models/Child");
const Class = require("../models/Class");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPayment = async (req, res) => {
  try {
    const {
      parentId,
      childId,
      amount,
      description = "",
      date,
      paymentMethod = "Cash",
      status = "Paid",
    } = req.body;

    if (!parentId || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "parentId and amount are required to record a payment",
      });
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, message: "Parent not found" });
    }

    if (childId) {
      const child = await Child.findById(childId);
      if (!child) {
        return res
          .status(404)
          .json({ success: false, message: "Child not found" });
      }
    }

    const payment = await Payment.create({
      parentId,
      childId,
      amount,
      description,
      date: date || Date.now(),
      paymentMethod,
      status,
    });

    // Avoid chain-populate issues in older Mongoose versions
    await payment.populate("parentId", "name email");
    await payment.populate("childId", "name");

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    console.error("Payment creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Could not create payment",
      error: error.message,
    });
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .sort({ date: -1 })
      .populate("parentId", "name email")
      .populate("childId", "name");

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, message: "Parent not found" });
    }

    const payments = await Payment.find({ parentId })
      .sort({ date: -1 })
      .populate("parentId", "name email")
      .populate("childId", "name");

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

const getAllParents = async (req, res, next) => {
  try {
    const parents = await Parent.find({}).sort({ name: 1 });
    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    next(error);
  }
};

const generateMonthlyInvoices = async (req, res, next) => {
  try {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthLabel = `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}`;

    const enrolledChildren = await Child.find({
      $or: [{ status: "Enrolled" }, { status: { $exists: false } }],
    })
      .populate("parentId", "name email")
      .populate("classId", "monthlyFee className");

    const childIds = enrolledChildren.map((child) => child._id);

    const existingInvoices = await Payment.find({
      childId: { $in: childIds },
      date: { $gte: monthStart, $lt: nextMonthStart },
    }).select("childId");

    const existingChildIds = existingInvoices.map((invoice) =>
      invoice.childId.toString(),
    );

    const feeMap = {
      Infant: 1500,
      Toddler: 1200,
      Preschool: 1000,
    };

    const invoicesToCreate = enrolledChildren
      .filter((child) => child.parentId && child.classId)
      .filter((child) => !existingChildIds.includes(child._id.toString()))
      .map((child) => {
        const classFee =
          child.classId.monthlyFee ?? feeMap[child.classId.className] ?? 1000;

        return {
          parentId: child.parentId._id,
          childId: child._id,
          amount:
            classFee != null && !Number.isNaN(Number(classFee))
              ? Number(classFee)
              : 1000,
          date: monthStart,
          paymentMethod: "Cash",
          status: "Pending",
          description: `${monthLabel} Tuition`,
        };
      });

    if (invoicesToCreate.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: "Monthly invoices already generated for the current month.",
      });
    }

    const createdInvoices = await Payment.insertMany(invoicesToCreate);
    const populatedInvoices = await Payment.find({
      _id: { $in: createdInvoices.map((invoice) => invoice._id) },
    })
      .populate("parentId", "name email")
      .populate("childId", "name");

    res.status(201).json({
      success: true,
      count: populatedInvoices.length,
      data: populatedInvoices,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Paid", "Pending", "Overdue"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .populate("parentId", "name email")
      .populate("childId", "name");

    if (!updatedPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not update payment status",
      error: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete payment",
      error: error.message,
    });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Could not create order",
      error: error.message,
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Safely determine the logged-in parent's ID
      let parentRecordId = req.user?.parentId;
      if (!parentRecordId && req.user?._id) {
        const parent = await Parent.findOne({ userId: req.user._id });
        if (parent) parentRecordId = parent._id;
      }

      // Find their oldest pending invoice and update it to 'Paid'
      if (parentRecordId) {
        await Payment.findOneAndUpdate(
          { parentId: parentRecordId, status: { $in: ["Pending", "Overdue"] } },
          {
            $set: {
              status: "Paid",
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id,
            },
          },
          { sort: { date: 1 } }, // Updates the oldest pending balance first
        );
      }

      res.json({ status: "success", message: "Database updated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByParent,
  getAllParents,
  generateMonthlyInvoices,
  updatePaymentStatus,
  deletePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
