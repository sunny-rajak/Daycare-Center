import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for the context to check localStorage before redirecting
  if (loading) return <div className="p-10 text-center">Loading Auth...</div>;

  // If no user is found in Context, send them to Login (NOT Home)
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If they aren't an admin, you can send them to Home
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
