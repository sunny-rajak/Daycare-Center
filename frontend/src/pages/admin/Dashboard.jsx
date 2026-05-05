import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllInquiries,
  updateStatus,
  deleteInquiry,
  registerStaff,
  enrollChild,
  getClasses,
} from "../../api/inquiryApi";
import {
  getStaffList,
  assignTeacherClass,
  getAttendanceHistory,
  deleteStaff,
} from "../../api/staffApi";
import ClassManager from "../../components/ClassManager";
import Billing from "../../components/Billing";
import AdminTours from "../../components/AdminTours";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "tours";
    return localStorage.getItem("ecera_dashboard_tab") || "tours";
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
    classId: "",
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState({ type: "", text: "" });
  const [staffList, setStaffList] = useState([]);
  const [selectedClassByTeacher, setSelectedClassByTeacher] = useState({});
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  // Enrollment modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceClassFilter, setAttendanceClassFilter] = useState("");
  const [attendanceHistoryLoading, setAttendanceHistoryLoading] =
    useState(false);
  const [attendanceHistoryError, setAttendanceHistoryError] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);

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

    const fetchClasses = async () => {
      try {
        const response = await getClasses();
        setClasses(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    };

    const fetchStaffMembers = async () => {
      try {
        const response = await getStaffList();
        const staff = response?.data || [];
        setStaffList(staff);
        const initialAssignments = {};
        staff.forEach((teacher) => {
          initialAssignments[teacher._id] = teacher.classId?._id || "";
        });
        setSelectedClassByTeacher(initialAssignments);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
      }
    };

    fetchInquiries();
    fetchClasses();
    fetchStaffMembers();
  }, []);

  const fetchAttendanceHistory = async (filters = {}) => {
    setAttendanceHistoryLoading(true);
    setAttendanceHistoryError("");

    try {
      const cleanFilters = {
        date: filters.date || undefined,
        classId: filters.classId || undefined,
      };
      const response = await getAttendanceHistory(cleanFilters);
      setAttendanceHistory(response?.data || []);
    } catch (err) {
      setAttendanceHistoryError(
        err.response?.data?.message ||
          "Unable to load attendance history. Please try again.",
      );
      setAttendanceHistory([]);
    } finally {
      setAttendanceHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "attendance") return;
    fetchAttendanceHistory({
      date: attendanceDateFilter,
      classId: attendanceClassFilter,
    });
  }, [activeTab, attendanceDateFilter, attendanceClassFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStatusChange = async (id, newStatus) => {
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
        classId: "",
      });

      // Refresh the staff list to show the newly registered staff member
      const staffResponse = await getStaffList();
      const staff = staffResponse?.data || [];
      setStaffList(staff);
      const initialAssignments = {};
      staff.forEach((teacher) => {
        initialAssignments[teacher._id] = teacher.classId?._id || "";
      });
      setSelectedClassByTeacher(initialAssignments);
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

  const handleTeacherClassChange = (teacherId, classId) => {
    setSelectedClassByTeacher((prev) => ({
      ...prev,
      [teacherId]: classId,
    }));
  };

  const handleSaveTeacherClass = async (teacherId) => {
    setAssignMessage("");
    setAssignLoading(true);

    try {
      const classId = Object.prototype.hasOwnProperty.call(
        selectedClassByTeacher,
        teacherId,
      )
        ? selectedClassByTeacher[teacherId]
        : staffList.find((teacher) => teacher._id === teacherId)?.classId
            ?._id || "";

      const response = await assignTeacherClass(teacherId, classId || null);
      setStaffList((prev) =>
        prev.map((teacher) =>
          teacher._id === teacherId ? response.data : teacher,
        ),
      );
      setAssignMessage("Teacher class assignment updated successfully.");
    } catch (err) {
      setAssignMessage(
        err.response?.data?.message ||
          "Failed to update teacher assignment. Please try again.",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteStaff = async (teacherId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this staff member? This action cannot be undone.",
      )
    ) {
      setAssignLoading(true);
      setAssignMessage("");
      try {
        await deleteStaff(teacherId);
        setStaffList((prev) => prev.filter((t) => t._id !== teacherId));
        setAssignMessage("Staff member removed successfully.");
      } catch (err) {
        setAssignMessage(
          err.response?.data?.message || "Failed to remove staff member.",
        );
      } finally {
        setAssignLoading(false);
      }
    }
  };

  const handleEnrollClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedClassId("");
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInquiry || !selectedClassId) return;

    setEnrollLoading(true);
    try {
      await enrollChild(selectedInquiry._id, selectedClassId);
      // Refresh inquiries
      const response = await getAllInquiries();
      const validatedData = Array.isArray(response)
        ? response
        : response?.data && Array.isArray(response.data)
          ? response.data
          : [];
      setInquiries(validatedData);
      setShowEnrollModal(false);
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Enrollment error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to enroll child. Please try again.",
      );
    } finally {
      setEnrollLoading(false);
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
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D3436] uppercase tracking-tight">
            Admin Console
          </h1>
          <p className="text-[#2D3436]/70 font-medium">
            Sprout & Spark Childcare LLC | Staff:{" "}
            {user?.name || "Authenticated User"}
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
        <div className="flex flex-wrap gap-2 bg-white/50 p-2 rounded-2xl w-fit border border-gray-100">
          <button
            onClick={() => setActiveTab("tours")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "tours"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Booked Tours
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "inquiries"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Manage Inquiries
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "staff"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Manage Staff
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "classes"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Manage Classes
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "attendance"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Attendance Logs
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === "billing"
                ? "bg-teal-50 text-[#4D9699] shadow-sm border border-teal-100"
                : "text-gray-500 hover:text-[#2D3436] hover:bg-white/50 transition-colors"
            }`}
          >
            Billing & Payments
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
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Parent / Contact
                    </th>
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Child Details
                    </th>
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Program
                    </th>
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase text-center">
                      Status
                    </th>
                    <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase text-right">
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
                          <div className="font-bold text-[#2D3436]">
                            {item.parentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="text-[#2D3436] font-medium">
                            {item.childName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Age: {item.childAge}
                          </div>
                        </td>
                        <td className="p-5 text-[#2D3436] font-medium">
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
                            className={`text-xs font-bold uppercase px-3 py-1 rounded-full border outline-none cursor-pointer transition-all
    ${
      item.status === "Enrolled"
        ? "bg-green-50 text-green-700 border-green-200"
        : item.status === "Contacted"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : item.status === "Rejected"
            ? "bg-red-50 text-red-700 border-red-200"
            : item.status === "Closed"
              ? "bg-gray-100 text-gray-700 border-gray-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
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
                          {item.status === "Pending" && (
                            <button
                              onClick={() => handleEnrollClick(item)}
                              className="mr-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                            >
                              Enroll
                            </button>
                          )}
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
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              Register New Staff Member
            </h2>
            <form onSubmit={handleStaffSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.name}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.password}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Role
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        role: e.target.value,
                        classId:
                          e.target.value === "teacher" ? staffForm.classId : "",
                      })
                    }
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {staffForm.role === "teacher" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Assigned Class
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                      value={staffForm.classId}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, classId: e.target.value })
                      }
                    >
                      <option value="">No class assigned</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className} - {cls.ageGroup}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.phone}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Salary
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                    value={staffForm.salary}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, salary: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
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
                className="bg-[#4D9699] hover:bg-[#3d7a7c] text-white font-bold py-3 px-8 rounded-xl transition-colors w-full md:w-auto mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Teacher Assignments
                </h2>
                <p className="text-sm text-gray-500">
                  Assign teachers to classes from your current roster.
                </p>
              </div>
              {assignMessage && (
                <p className="text-sm text-slate-600">{assignMessage}</p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-3">
                      Teacher
                    </th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-3 hidden md:table-cell">
                      Email
                    </th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-3">
                      Assigned Class
                    </th>
                    <th className="p-4 text-xs font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100 pb-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staffList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-12 text-center text-gray-400"
                      >
                        No teachers currently registered.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((teacher) => {
                      const selectedClassId =
                        selectedClassByTeacher[teacher._id] ||
                        teacher.classId?._id ||
                        "";
                      return (
                        <tr
                          key={teacher._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="text-[#2D3436] font-semibold">
                              {teacher.name}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">
                              {teacher.role}
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell text-gray-600 text-sm">
                            {teacher.email}
                          </td>
                          <td className="p-4">
                            <select
                              value={selectedClassId}
                              onChange={(e) =>
                                handleTeacherClassChange(
                                  teacher._id,
                                  e.target.value,
                                )
                              }
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full max-w-[200px]"
                            >
                              <option value="">Unassigned</option>
                              {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>
                                  {cls.className} - {cls.ageGroup}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveTeacherClass(teacher._id)
                                }
                                disabled={assignLoading}
                                className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(teacher._id)}
                                disabled={assignLoading}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Delete Staff"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Attendance Logs
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Filter attendance history by date or class and review past
                  records.
                </p>
              </div>
              <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2 md:w-auto">
                <label className="block text-sm font-medium text-gray-700">
                  Date
                  <input
                    type="date"
                    value={attendanceDateFilter}
                    onChange={(e) => setAttendanceDateFilter(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                  <select
                    value={attendanceClassFilter}
                    onChange={(e) => setAttendanceClassFilter(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - {cls.ageGroup}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceHistoryLoading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-20 text-center text-gray-400 font-medium"
                    >
                      Loading attendance history...
                    </td>
                  </tr>
                ) : attendanceHistoryError ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-20 text-center text-red-500 font-bold"
                    >
                      {attendanceHistoryError}
                    </td>
                  </tr>
                ) : attendanceHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-20 text-center text-gray-500 font-medium"
                    >
                      No attendance records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {record.childId?.name || "Unknown"}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {record.classId?.className || "Unknown"}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900">
                        {record.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="max-w-7xl mx-auto">
          <Billing />
        </div>
      )}

      {activeTab === "tours" && (
        <div className="max-w-7xl mx-auto">
          <AdminTours />
        </div>
      )}

      {activeTab === "classes" && (
        <div className="max-w-7xl mx-auto">
          <ClassManager />
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              Enroll Child: {selectedInquiry?.childName}
            </h3>
            <form onSubmit={handleEnrollSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} - {cls.ageGroup}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {enrollLoading ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
