const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Configure CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://daycare-center-omega.vercel.app",
  "https://daycare-center-igi5oxmcj-sunny-rajaks-projects.vercel.app",
  "https://daycare-center-git-main-sunny-rajaks-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/inquiry", require("./routes/inquiryRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/parent", require("./routes/parentRoutes"));
app.use("/api/tours", require("./routes/tourRoutes"));

// Error Middleware (Must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold,
  );
});
