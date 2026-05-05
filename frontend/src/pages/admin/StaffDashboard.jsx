import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherDashboard,
  saveAttendance,
  getAttendanceHistory,
} from "../../api/staffApi";
import { createActivity } from "../../api/activityApi";
import ChildRosterCard from "../../components/ChildRosterCard";
import {
  CheckCircle,
  XCircle,
  Activity,
  ShieldCheck,
  Users,
  Calendar,
} from "lucide-react";

export default function StaffDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [myClass, setMyClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyMessage, setHistoryMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Activity states
  const [showClassActivityModal, setShowClassActivityModal] = useState(false);
  const [showIndividualActivityModal, setShowIndividualActivityModal] =
    useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [activityForm, setActivityForm] = useState({
    category: "",
    title: "",
    description: "",
  });
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityMessage, setActivityMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const today = new Date().toLocaleDateString();
  const todayIso = new Date().toISOString().split("T")[0];

  // Fetch dashboard data function
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await getTeacherDashboard();
      setMyClass(response.class);
      setStudents(response.students || []);
      const initialState = {};
      (response.students || []).forEach((student) => {
        initialState[student._id] = "Absent";
      });
      setAttendance(initialState);
    } catch (err) {
      setMessage("Unable to load staff dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchRecentHistory = async (classId) => {
    setHistoryLoading(true);
    setHistoryMessage("");
    try {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      const response = await getAttendanceHistory({
        classId,
        startDate: sevenDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      });

      setHistory(response?.data || []);
      if (!response?.data?.length) {
        setHistoryMessage("No attendance history found for the last 7 days.");
      }
    } catch (err) {
      setHistory([]);
      setHistoryMessage(
        err.response?.data?.message ||
          "Failed to load recent attendance history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!myClass?._id) return;
    fetchRecentHistory(myClass._id);
  }, [myClass]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const updateStatus = (childId, newStatus) => {
    setAttendance((prev) => ({ ...prev, [childId]: newStatus }));
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    setMessage("");
    setSaving(true);

    try {
      const records = students.map((student) => ({
        childId: student._id,
        status: attendance[student._id] || "Absent",
        date: todayIso,
      }));

      await saveAttendance({ records, date: todayIso });
      setMessage("Attendance saved for today.");
    } catch (err) {
      setMessage("Failed to save attendance. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Activity handlers
  const openIndividualActivityModal = (child) => {
    setSelectedChild(child);
    setActivityForm({ category: "", title: "", description: "" });
    setActivityMessage("");
    setShowIndividualActivityModal(true);
  };

  const openClassActivityModal = () => {
    setActivityForm({ category: "", title: "", description: "" });
    setActivityMessage("");
    setShowClassActivityModal(true);
  };

  const openCheckoutModal = (child) => {
    setSelectedChild(child);
    setSelectedPickup(null);
    setShowCheckoutModal(true);
  };

  const closeModals = () => {
    setShowClassActivityModal(false);
    setShowIndividualActivityModal(false);
    setShowCheckoutModal(false);
    setSelectedChild(null);
    setSelectedPickup(null);
    setActivityForm({ category: "", title: "", description: "" });
    setActivityMessage("");
  };

  const handleActivityFormChange = (e) => {
    const { name, value } = e.target;
    setActivityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmCheckout = async () => {
    if (!selectedPickup) return;

    setCheckoutLoading(true);
    setCheckoutMessage("");

    try {
      // Find the selected pickup person object to get relationship
      const pickupPerson = selectedChild.authorizedPickups?.find(
        (person) => person.name === selectedPickup,
      );

      // Build checkout activity payload
      const checkoutData = {
        childId: selectedChild._id,
        teacherId: JSON.parse(localStorage.getItem("daycare_user"))._id,
        type: "Checkout",
        title: "Child Checked Out",
        description: `${selectedChild.name} was picked up by ${selectedPickup} (${
          pickupPerson?.relationship || "Guardian"
        }).`,
        category: "Checkout",
        timestamp: new Date().toISOString(),
      };

      // Send to API
      await createActivity(checkoutData);

      // Show success message
      setCheckoutMessage("Checkout successful and logged.");

      // Refresh the dashboard to update the roster
      await fetchDashboard();

      // Close modals after short delay to show success message
      setTimeout(() => {
        closeModals();
      }, 1500);
    } catch (err) {
      setCheckoutMessage(
        err.response?.data?.message || "Failed to log checkout. Try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitIndividualActivity = async () => {
    if (
      !activityForm.category ||
      !activityForm.title ||
      !activityForm.description
    ) {
      setActivityMessage("Please fill in all fields.");
      return;
    }

    setActivityLoading(true);
    setActivityMessage("");

    try {
      const activityData = {
        childId: selectedChild._id,
        teacherId: JSON.parse(localStorage.getItem("daycare_user"))._id,
        ...activityForm,
      };

      await createActivity(activityData);
      setActivityMessage("Activity logged successfully!");
      setTimeout(closeModals, 2000);
    } catch (err) {
      setActivityMessage("Failed to log activity. Try again.");
    } finally {
      setActivityLoading(false);
    }
  };

  const submitClassActivity = async () => {
    if (
      !activityForm.category ||
      !activityForm.title ||
      !activityForm.description
    ) {
      setActivityMessage("Please fill in all fields.");
      return;
    }

    setActivityLoading(true);
    setActivityMessage("");

    try {
      const activities = students.map((student) => ({
        childId: student._id,
        teacherId: JSON.parse(localStorage.getItem("daycare_user"))._id,
        ...activityForm,
      }));

      await createActivity({ activities });
      setActivityMessage("Class activity logged for all students!");
      setTimeout(closeModals, 2000);
    } catch (err) {
      setActivityMessage("Failed to log class activity. Try again.");
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans">
        <div className="text-center text-xl font-semibold text-[#2D3436]">
          Loading teacher dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500">Teacher Dashboard</p>
            <h1 className="text-3xl font-bold text-[#2D3436]">
              Daily Class Tasks
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        {/* No Class Assigned */}
        {!myClass ? (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-[#2D3436]">
              No Assigned Class
            </h2>
            <p className="mt-3 text-gray-600">
              You do not have a class assigned yet. Please ask an administrator
              to assign you to a class.
            </p>
          </div>
        ) : (
          <>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Main Roster Card - Left Side (lg:col-span-2) */}
              <section className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#2D3436]">
                    Active Roster & Actions
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => markAll("Present")}
                      className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 text-sm font-semibold transition"
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => markAll("Absent")}
                      className="rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm font-semibold transition"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

                {/* Attendance List */}
                <div className="space-y-0 border border-gray-100 rounded-2xl divide-y divide-gray-100">
                  {students.length === 0 ? (
                    <p className="text-gray-600 p-4">
                      No students are currently enrolled in this class.
                    </p>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                      >
                        {/* Left: Child Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#2D3436]">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.floor(
                                (new Date() - new Date(student.dateOfBirth)) /
                                  (365.25 * 24 * 60 * 60 * 1000),
                              )}{" "}
                              years old
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                          {/* Attendance Toggle */}
                          <button
                            type="button"
                            onClick={() => updateStatus(student._id, "Present")}
                            className={`p-2 rounded-full transition ${
                              attendance[student._id] === "Present"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(student._id, "Absent")}
                            className={`p-2 rounded-full transition ${
                              attendance[student._id] === "Absent"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle size={20} />
                          </button>

                          {/* Log Activity */}
                          <button
                            type="button"
                            onClick={() => openIndividualActivityModal(student)}
                            className="p-2 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition"
                            title="Log Activity"
                          >
                            <Activity size={20} />
                          </button>

                          {/* Checkout/Verify ID */}
                          <button
                            type="button"
                            onClick={() => openCheckoutModal(student)}
                            className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                            title="Verify ID / Checkout"
                          >
                            <ShieldCheck size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Save Attendance Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || students.length === 0}
                  className="w-full mt-6 rounded-full bg-[#4D9699] text-white px-6 py-3 font-semibold hover:bg-[#3d7a7d] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>

                {message && (
                  <p className="mt-4 text-sm text-[#2D3436] bg-blue-50 p-3 rounded-lg">
                    {message}
                  </p>
                )}
              </section>

              {/* Right Side - Class Details & History */}
              <div className="flex flex-col gap-6">
                {/* My Class Card */}
                <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={24} className="text-[#4D9699]" />
                    <h2 className="text-lg font-semibold text-[#2D3436]">
                      My Class
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Class Name
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#2D3436]">
                        {myClass.className}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Age Group
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">
                        {myClass.ageGroup}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Capacity
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">
                        {myClass.capacity}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Today&apos;s Date
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">
                        {today}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={openClassActivityModal}
                    className="w-full mt-6 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2 font-semibold transition"
                  >
                    Log Class Activity
                  </button>
                </section>

                {/* Recent Attendance History */}
                <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={24} className="text-[#4D9699]" />
                    <h2 className="text-lg font-semibold text-[#2D3436]">
                      Attendance History
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Last 7 days</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Date
                          </th>
                          <th className="pb-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Child
                          </th>
                          <th className="pb-3 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {historyLoading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-8 text-center text-gray-400 text-sm"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : history.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-8 text-center text-gray-500 text-sm"
                            >
                              {historyMessage || "No records found."}
                            </td>
                          </tr>
                        ) : (
                          history.slice(0, 10).map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                              <td className="py-3 text-gray-700">
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 font-medium text-gray-900">
                                {item.childId?.name || "Unknown"}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    item.status === "Present"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        {/* Class Activity Modal */}
        {showClassActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-[#2D3436]">
                Log Class Activity
              </h3>
              <p className="mt-2 text-gray-600">
                This activity will be logged for all students in{" "}
                <span className="font-semibold">{myClass?.className}</span>.
              </p>
              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Category
                  </label>
                  <select
                    name="category"
                    value={activityForm.category}
                    onChange={handleActivityFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Nap">Nap</option>
                    <option value="Learning">Learning</option>
                    <option value="Play">Play</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={activityForm.title}
                    onChange={handleActivityFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                    placeholder="e.g., Afternoon Nap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={activityForm.description}
                    onChange={handleActivityFormChange}
                    rows="3"
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                    placeholder="e.g., Slept for 45 minutes, very peaceful"
                  />
                </div>
              </form>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitClassActivity}
                  disabled={activityLoading}
                  className="flex-1 rounded-full bg-[#4D9699] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d7a7d] transition disabled:opacity-60"
                >
                  {activityLoading ? "Logging..." : "Log Activity"}
                </button>
              </div>
              {activityMessage && (
                <p className="mt-4 text-sm text-gray-700">{activityMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* Individual Activity Modal */}
        {showIndividualActivityModal && selectedChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-[#2D3436]">
                Log Activity for {selectedChild.name}
              </h3>
              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Category
                  </label>
                  <select
                    name="category"
                    value={activityForm.category}
                    onChange={handleActivityFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Nap">Nap</option>
                    <option value="Learning">Learning</option>
                    <option value="Play">Play</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={activityForm.title}
                    onChange={handleActivityFormChange}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                    placeholder="e.g., Afternoon Nap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={activityForm.description}
                    onChange={handleActivityFormChange}
                    rows="3"
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-700 focus:border-[#4D9699] focus:outline-none focus:ring-1 focus:ring-[#4D9699]"
                    placeholder="e.g., Slept for 45 minutes, very peaceful"
                  />
                </div>
              </form>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitIndividualActivity}
                  disabled={activityLoading}
                  className="flex-1 rounded-full bg-[#4D9699] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d7a7d] transition disabled:opacity-60"
                >
                  {activityLoading ? "Logging..." : "Log Activity"}
                </button>
              </div>
              {activityMessage && (
                <p className="mt-4 text-sm text-gray-700">{activityMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* Checkout/Safety Verification Modal */}
        {showCheckoutModal && selectedChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100">
                <ShieldCheck size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3436] text-center">
                Safety Verification
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Verify and checkout{" "}
                <span className="font-semibold">{selectedChild.name}</span>
              </p>

              <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    Name
                  </p>
                  <p className="mt-2 font-semibold text-[#2D3436]">
                    {selectedChild.name}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    DOB
                  </p>
                  <p className="mt-2 font-semibold text-[#2D3436]">
                    {new Date(selectedChild.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    Gender
                  </p>
                  <p className="mt-2 font-semibold text-[#2D3436]">
                    {selectedChild.gender}
                  </p>
                </div>
              </div>

              {/* Authorized Pickups Section */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500 mb-3">
                  Authorized Pickups
                </p>

                {selectedChild.authorizedPickups &&
                selectedChild.authorizedPickups.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChild.authorizedPickups.map((person, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPickup(person.name)}
                        className={`cursor-pointer p-3 rounded-xl border mb-2 flex items-center justify-between transition-all ${
                          selectedPickup === person.name
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-[#2D3436]">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {person.relationship}
                          </p>
                        </div>
                        {selectedPickup === person.name && (
                          <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ No authorized pickups on file. Please contact
                    administration.
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModals}
                  disabled={checkoutLoading}
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  disabled={!selectedPickup || checkoutLoading}
                  className="flex-1 rounded-full bg-[#4D9699] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d7a7d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? "Processing..." : "Confirm Checkout"}
                </button>
              </div>
              {checkoutMessage && (
                <p
                  className={`mt-4 text-sm font-medium p-3 rounded-lg ${
                    checkoutMessage.includes("successful")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {checkoutMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
