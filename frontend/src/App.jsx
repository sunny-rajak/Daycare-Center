import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/public/Home";

// Admin Pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import StaffDashboard from "./pages/admin/StaffDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Route: Anyone can see the Landing Page */}
        <Route path="/" element={<Home />} />

        {/* 2. Login Route: Staff enters credentials here */}
        <Route path="/admin/login" element={<Login />} />

        {/* 3. Protected Route: Only accessible if logged in as Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 4. Teacher Dashboard: Only accessible if logged in as Teacher */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* 5. Optional: 404 Page or Redirect */}
        <Route
          path="*"
          element={<div className="p-20 text-center">404 - Page Not Found</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
