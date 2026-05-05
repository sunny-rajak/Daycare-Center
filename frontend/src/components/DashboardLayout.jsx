import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children, title = "Dashboard" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Left: Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            </div>

            {/* Right: User Menu & Notifications */}
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-sm text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {user?.name?.charAt(0) || "U"}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
