import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const getMenuItems = () => {
    if (user?.role === "admin") {
      return [
        {
          icon: "📊",
          label: "Dashboard",
          path: "/admin/dashboard",
          badge: null,
        },
        {
          icon: "📋",
          label: "Inquiries",
          path: "/admin/inquiries",
          badge: null,
        },
        {
          icon: "👥",
          label: "Staff Management",
          path: "/admin/staff",
          badge: null,
        },
        {
          icon: "💰",
          label: "Billing",
          path: "/admin/billing",
          badge: null,
        },
        {
          icon: "📚",
          label: "Classes",
          path: "/admin/classes",
          badge: null,
        },
      ];
    } else if (user?.role === "teacher") {
      return [
        {
          icon: "👨‍🏫",
          label: "My Class",
          path: "/staff/dashboard",
          badge: null,
        },
        {
          icon: "✓",
          label: "Attendance",
          path: "/teacher/attendance",
          badge: null,
        },
        {
          icon: "📝",
          label: "Activity Log",
          path: "/teacher/activities",
          badge: null,
        },
        {
          icon: "💬",
          label: "Messages",
          path: "/teacher/messages",
          badge: 3,
        },
      ];
    } else {
      // Parent
      return [
        {
          icon: "👶",
          label: "My Child",
          path: "/parent-dashboard",
          badge: null,
        },
        {
          icon: "📸",
          label: "Activity Feed",
          path: "/parent/activities",
          badge: 2,
        },
        {
          icon: "💳",
          label: "Invoices",
          path: "/parent/invoices",
          badge: 1,
        },
        {
          icon: "📅",
          label: "Calendar",
          path: "/parent/calendar",
          badge: null,
        },
        {
          icon: "💬",
          label: "Messages",
          path: "/parent/messages",
          badge: null,
        },
      ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-40 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-900 to-slate-800 text-white shadow-2xl transform transition-transform duration-300 z-30 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-lg">
              🧸
            </div>
            <div>
              <h1 className="font-bold text-lg">Sprout & Spark</h1>
              <p className="text-xs text-slate-400">Childcare</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-700 hover:text-white transition-colors group relative"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="px-4 py-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <span className="text-xl">⚙️</span>
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/40 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-700 text-xs text-slate-500">
          <p>© 2024 Sprout & Spark Childcare</p>
          <p>All rights reserved</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
