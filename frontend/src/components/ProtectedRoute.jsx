import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = ["admin"] }) => {
  const { user, loading } = useAuth();

  // Wait for the context to check localStorage before redirecting
  if (loading) return <div className="p-10 text-center">Loading Auth...</div>;

  // If no user is found in Context, send them to Login (NOT Home)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "teacher"
        ? "/staff/dashboard"
        : user.role === "parent"
          ? "/parent-dashboard"
          : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
