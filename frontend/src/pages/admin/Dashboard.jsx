import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllInquiries,
  updateStatus,
  deleteInquiry,
  registerStaff,
} from "../../api/inquiryApi";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "inquiries";
    return localStorage.getItem("ecera_dashboard_tab") || "inquiries";
  });

  useEffect(() => {
    localStorage.setItem("ecera_dashboard_tab", activeTab);
  }, [activeTab]);

  // Defensive Initialization: Start with an empty array
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("All");

  // Staff registration form state
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
    phone: "",
    salary: "",
    hireDate: "",
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const response = await getAllInquiries();

        /** * Defensive Mapping:
         * Extract array regardless of whether backend returns [data] or {data: [data]}
         */
        const validatedData = Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];

        setInquiries(validatedData);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to synchronize with server. Please try again later.");
        setInquiries([]); // Ensure state remains an array
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleStatusChange = async (id, newStatus) => {
    console.log("Attempting update for ID:", id, "to Status:", newStatus);
    try {
      await updateStatus(id, newStatus);
      // Optimistic Update: Refresh the local state to show the change immediately
      setInquiries((prev) =>
        prev.map((iq) => (iq._id === id ? { ...iq, status: newStatus } : iq)),
      );
    } catch {
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this inquiry? This action cannot be undone.",
      )
    ) {
      try {
        await deleteInquiry(id);
        // Remove from local state immediately
        setInquiries((prev) => prev.filter((iq) => iq._id !== id));
      } catch {
        alert("Failed to delete inquiry. Please try again.");
      }
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffMessage({ type: "", text: "" });

    try {
      await registerStaff(staffForm);
      setStaffMessage({
        type: "success",
        text: "Staff member registered successfully!",
      });
      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "teacher",
        phone: "",
        salary: "",
        hireDate: "",
      });
    } catch (err) {
      setStaffMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to register staff. Please try again.",
      });
    } finally {
      setStaffLoading(false);
    }
  };

  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(
    (iq) => iq.status === "Pending",
  ).length;
  const enrolledInquiries = inquiries.filter(
    (iq) => iq.status === "Enrolled",
  ).length;

  const filteredInquiries = inquiries.filter((iq) => {
    const matchesSearch =
      iq.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iq.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iq.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram =
      filterProgram === "All" || iq.programOfInterest === filterProgram;

    return matchesSearch && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Admin Console
          </h1>
          <p className="text-gray-500 font-medium">
            Ecera Stay & Care LLC | Staff: {user?.name || "Authenticated User"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-100 transition-all active:scale-95"
        >
          Secure Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "inquiries"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manage Inquiries
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "staff"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manage Staff
          </button>
        </div>
      </div>

      {activeTab === "inquiries" && (
        <>
          {/* Analytics Stats Bar */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Total */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Total Inquiries
                </p>
                <h3 className="text-3xl font-black text-gray-900">
                  {totalInquiries}
                </h3>
              </div>
            </div>

            {/* Card 2: Pending */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Pending Leads
                </p>
                <h3 className="text-3xl font-black text-gray-900">
                  {pendingInquiries}
                </h3>
              </div>
            </div>

            {/* Card 3: Enrolled */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-green-50 p-4 rounded-2xl text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Success Rate
                </p>
                <h3 className="text-3xl font-black text-gray-900">
                  {enrolledInquiries}
                </h3>
              </div>
            </div>
          </div>

          {/* Search and Filter Control Bar */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by parent, child, or email..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none text-sm font-bold text-gray-600 cursor-pointer"
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
            >
              <option value="All">All Programs</option>
              <option value="Infant">Infant</option>
              <option value="Toddler">Toddler</option>
              <option value="Preschool">Preschool</option>
            </select>
          </div>

          {/* Main Content Card */}
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">
                      Parent / Contact
                    </th>
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">
                      Child Details
                    </th>
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center animate-pulse text-gray-400 font-medium"
                      >
                        Fetching records from database...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center text-red-500 font-bold"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : filteredInquiries?.length > 0 ? (
                    filteredInquiries.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        <td className="p-5">
                          <div className="font-bold text-gray-900">
                            {item.parentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="text-gray-700 font-medium">
                            {item.childName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Age: {item.childAge}
                          </div>
                        </td>
                        <td className="p-5 text-gray-600 font-medium">
                          {item.programOfInterest}
                        </td>
                        <td className="p-5 text-gray-500 text-sm">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-5 text-center">
                          <select
                            value={item.status || "Pending"}
                            onChange={(e) =>
                              handleStatusChange(item._id, e.target.value)
                            }
                            className={`text-xs font-black uppercase px-3 py-1 rounded-full border outline-none cursor-pointer transition-all
    ${
      item.status === "Enrolled"
        ? "bg-green-50 text-green-600 border-green-100"
        : item.status === "Contacted"
          ? "bg-blue-50 text-blue-600 border-blue-100"
          : item.status === "Rejected"
            ? "bg-red-50 text-red-600 border-red-100"
            : item.status === "Closed"
              ? "bg-gray-100 text-gray-600 border-gray-200"
              : "bg-amber-50 text-amber-600 border-amber-100"
    }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>

                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Inquiry"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center text-gray-400 italic"
                      >
                        No inquiries currently on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "staff" && (
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            Register New Staff Member
          </h2>
          <form onSubmit={handleStaffSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.email}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.password}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.role}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, role: e.target.value })
                  }
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.phone}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Salary
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.salary}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, salary: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffForm.hireDate}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, hireDate: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={staffLoading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {staffLoading ? "Registering..." : "Register Staff"}
            </button>
            {staffMessage.text && (
              <p
                className={`text-sm font-medium ${staffMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {staffMessage.text}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
