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
  ShieldCheck,
  Users,
  Calendar,
  LogOut,
  X,
  Utensils,
  Moon,
  Plus,
  BookOpen,
  Smile,
  HeartPulse,
  Phone,
} from "lucide-react";

export default function StaffDashboard() {
  const { user, logout } = useAuth();
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityMessage, setActivityMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [activeLogAction, setActiveLogAction] = useState(null);
  const [logDetails, setLogDetails] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  const isAlreadyMarked = (studentId) => {
    return history.some((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      const sid = record.childId?._id || record.childId;
      return sid === studentId && recordDate === todayIso;
    });
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = status;
      if (!isAlreadyMarked(student._id)) {
        newAttendance[student._id] = status;
      }
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    setMessage("");
    setSaving(true);

    try {
      const newRecords = students
        .filter((student) => !isAlreadyMarked(student._id))
        .map((student) => ({
          childId: student._id,
          status: attendance[student._id] || "Absent",
          date: todayIso,
        }));

      if (newRecords.length === 0) {
        setMessage("All attendance is already up to date.");
        setSaving(false);
        return;
      }

      await saveAttendance({ records: newRecords, date: todayIso });
      setMessage("Attendance saved for today.");
      setAttendance({}); // Clear local selection
      if (myClass?._id) {
        fetchRecentHistory(myClass._id);
      }
    } catch (err) {
      setMessage("Failed to save attendance. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Activity handlers
  const openClassActivityModal = () => {
    setActiveLogAction(null);
    setLogDetails("");
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
    setShowCheckoutModal(false);
    setSelectedChild(null);
    setSelectedPickup(null);
    setSelectedStudent(null);
    setActivityMessage("");
    setActiveLogAction(null);
    setLogDetails("");
    setShowSuccess(false);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedPickup) return;

    setCheckoutLoading(true);
    setCheckoutMessage("");
    setShowSuccess(false);

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

      setShowSuccess(true);

      // Refresh the dashboard to update the roster
      await fetchDashboard();

      // Close modals after short delay to show success message
      setTimeout(() => {
        closeModals();
      }, 2000);
    } catch (err) {
      setCheckoutMessage(
        err.response?.data?.message || "Failed to log checkout. Try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitClassActivity = async () => {
    if (!activeLogAction || !logDetails) {
      setActivityMessage("Please select a category and add details.");
      return;
    }

    setActivityLoading(true);
    setActivityMessage("");

    try {
      const activities = students.map((student) => ({
        childId: student._id,
        category: activeLogAction,
        title:
          activeLogAction === "Food"
            ? "Meal"
            : activeLogAction === "Checkout"
              ? "General Note"
              : activeLogAction,
        description: logDetails,
        date: new Date().toISOString(),
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

  const handleLogPickup = async (pickupName) => {
    setActivityLoading(true);
    setActivityMessage("");
    setShowSuccess(false);

    try {
      await createActivity({
        childId: selectedStudent._id,
        teacherId: JSON.parse(localStorage.getItem("daycare_user"))._id,
        type: "Pickup",
        title: "Child Checked Out",
        description: "Picked up by " + pickupName,
        category: "Checkout",
        timestamp: new Date().toISOString(),
      });

      setShowSuccess(true);
      if (myClass?._id) {
        fetchRecentHistory(myClass._id);
      }

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedStudent(null); // Close modal
        setActivityMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to log pickup:", error);
      setActivityMessage("Failed to log pickup. Please try again.");
    } finally {
      setActivityLoading(false);
    }
  };

  const submitProfessionalLog = async () => {
    if (!logDetails) {
      setActivityMessage("Please add details for the log.");
      return;
    }

    setActivityLoading(true);
    setActivityMessage("");
    setShowSuccess(false);

    try {
      await createActivity({
        childId: selectedStudent._id,
        category: activeLogAction,
        title:
          activeLogAction === "Food"
            ? "Meal"
            : activeLogAction === "Checkout"
              ? "General Note"
              : activeLogAction,
        description: logDetails,
        date: new Date().toISOString(),
      });

      setShowSuccess(true);
      // Optional: Refresh the teacher's dashboard/roster in the background
      if (myClass?._id) {
        fetchRecentHistory(myClass._id);
      }

      setTimeout(() => {
        setShowSuccess(false);
        setActiveLogAction(null);
        setLogDetails("");
        setSelectedStudent(null); // Close modal
        setActivityMessage("");
      }, 2000);
    } catch (error) {
      console.error("Full Error Object:", error.response?.data);
      console.error(`Failed to log ${activeLogAction}:`, error);
      alert(`Failed to log ${activeLogAction}. Please try again.`);
      setActivityMessage(`Failed to log ${activeLogAction}. Please try again.`);
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
        <header className="flex flex-col w-full mb-8">
          <div className="flex justify-between items-center w-full mb-2">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
              Teacher Dashboard
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 px-4 py-2 bg-white hover:bg-red-50 rounded-lg shadow-sm transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-2">
              Welcome back, {user?.name?.split(" ")[0] || "Teacher"}
            </h1>
            <p className="text-base text-gray-500 font-medium">
              Viewing: {myClass ? `${myClass.className} Class` : "Unassigned"} |
              Live Attendance Feed
            </p>
          </div>
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
                    Today's Attendance
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
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -ml-2"
                          onClick={() => setSelectedStudent(student)}
                        >
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
                          {isAlreadyMarked(student._id) ? (
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                              <CheckCircle size={14} /> Recorded
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(student._id, "Present")
                                }
                                className={`transition ${
                                  attendance[student._id] === "Present"
                                    ? "bg-teal-600 text-white rounded-full p-2"
                                    : "text-gray-400 hover:text-teal-600 border border-gray-200 rounded-full p-2"
                                }`}
                                title="Mark Present"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(student._id, "Absent")
                                }
                                className={`transition ${
                                  attendance[student._id] === "Absent"
                                    ? "bg-red-100 text-red-600 rounded-full p-2"
                                    : "text-gray-400 hover:text-red-600 border border-gray-200 rounded-full p-2"
                                }`}
                                title="Mark Absent"
                              >
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full mt-auto">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || students.length === 0}
                    disabled={
                      saving ||
                      students.filter((s) => !isAlreadyMarked(s._id)).length ===
                        0
                    }
                    className="w-full sm:flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                  <button
                    type="button"
                    onClick={openClassActivityModal}
                    className="w-full sm:flex-1 py-3 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-xl transition-colors"
                  >
                    Log Class Activity
                  </button>
                </div>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-0 md:p-4 overflow-hidden">
            <div className="relative w-full h-full md:h-auto md:w-full md:max-w-lg mx-auto bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] md:max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Class Activity
                  </h2>
                  <p className="text-sm text-gray-500">
                    Log activity for all students in{" "}
                    <span className="font-semibold">{myClass?.className}</span>
                  </p>
                </div>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
                {/* Quick Actions Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Select an activity category
                  </p>

                  {!activeLogAction ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveLogAction("Food")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Utensils size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Meal
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Nap")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Moon size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Nap
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Learning")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <BookOpen size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Learning
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Play")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Smile size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Play
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Health")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <HeartPulse size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Health
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Checkout")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <LogOut size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          General
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-4">
                        {activeLogAction === "Checkout"
                          ? "General Note / Other"
                          : `Log ${activeLogAction === "Food" ? "Meal" : activeLogAction}`}
                      </h4>
                      {activeLogAction === "Food" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Ate All",
                            "Ate Some",
                            "Refused",
                            "Milk/Bottle",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Nap" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {["Slept Well", "Restless", "Did not sleep"].map(
                            (chip) => (
                              <button
                                key={chip}
                                onClick={() => setLogDetails(chip)}
                                className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                              >
                                {chip}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                      {activeLogAction === "Learning" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Story Time",
                            "Art Project",
                            "Music",
                            "Sensory Play",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Play" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Outdoor Play",
                            "Group Activity",
                            "Independent Play",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Health" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Temperature Check",
                            "Medication Given",
                            "Minor Incident",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none mb-4"
                        rows="3"
                        placeholder={
                          activeLogAction === "Checkout"
                            ? "Enter any additional notes or updates..."
                            : "Add details..."
                        }
                        value={logDetails}
                        onChange={(e) => setLogDetails(e.target.value)}
                      ></textarea>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setActiveLogAction(null);
                            setLogDetails("");
                          }}
                          className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={submitClassActivity}
                          disabled={activityLoading}
                          className="flex-1 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
                        >
                          {activityLoading ? "Logging..." : "Save Log for All"}
                        </button>
                      </div>
                    </div>
                  )}

                  {activityMessage && (
                    <p
                      className={`mt-4 text-sm font-medium p-3 rounded-lg text-center ${
                        activityMessage.includes("Failed") ||
                        activityMessage.includes("Please")
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {activityMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout/Safety Verification Modal */}
        {showCheckoutModal && selectedChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 p-0 md:p-4 overflow-hidden">
            <div className="w-full h-full md:h-auto md:w-full md:max-w-md max-h-[100dvh] md:max-h-[85vh] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
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

                {showSuccess ? (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center font-medium mt-6 border border-emerald-100 animate-in fade-in duration-300">
                    Checkout logged successfully for {selectedChild.name}!
                  </div>
                ) : (
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
                )}

                {checkoutMessage && !showSuccess && (
                  <p className="mt-4 text-sm font-medium p-3 rounded-lg text-center bg-red-50 text-red-700">
                    {checkoutMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Student Snapshot Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-0 md:p-4 overflow-hidden">
            <div className="relative w-full h-full md:h-auto md:w-full md:max-w-lg mx-auto bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] md:max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-gray-600">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {Math.floor(
                        (new Date() - new Date(selectedStudent.dateOfBirth)) /
                          (365.25 * 24 * 60 * 60 * 1000),
                      )}{" "}
                      years old
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setActiveLogAction(null);
                    setLogDetails("");
                    setActivityMessage("");
                    setShowSuccess(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
                {/* Quick Actions Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Log activities for {selectedStudent.name}
                  </p>

                  {!activeLogAction ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setActiveLogAction("Food")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Utensils size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Meal
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Nap")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Moon size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Nap
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Learning")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <BookOpen size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Learning
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Play")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <Smile size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Play
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Health")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <HeartPulse size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Health
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveLogAction("Checkout")}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-teal-600 hover:bg-teal-50 transition-all cursor-pointer"
                      >
                        <LogOut size={20} />
                        <span className="text-[10px] font-bold uppercase">
                          Checkout
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-4">
                        {activeLogAction === "Checkout"
                          ? "Log Departure / Checkout"
                          : `Log ${activeLogAction === "Food" ? "Meal" : activeLogAction}`}
                      </h4>
                      {activeLogAction === "Food" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Ate All",
                            "Ate Some",
                            "Refused",
                            "Milk/Bottle",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Nap" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {["Slept Well", "Restless", "Did not sleep"].map(
                            (chip) => (
                              <button
                                key={chip}
                                onClick={() => setLogDetails(chip)}
                                className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                              >
                                {chip}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                      {activeLogAction === "Learning" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Story Time",
                            "Art Project",
                            "Music",
                            "Sensory Play",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Play" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Outdoor Play",
                            "Group Activity",
                            "Independent Play",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      {activeLogAction === "Health" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            "Temperature Check",
                            "Medication Given",
                            "Minor Incident",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => setLogDetails(chip)}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none mb-4"
                        rows="3"
                        placeholder={
                          activeLogAction === "Checkout"
                            ? "Enter any additional notes or updates..."
                            : "Add details..."
                        }
                        value={logDetails}
                        onChange={(e) => setLogDetails(e.target.value)}
                      ></textarea>

                      {showSuccess && (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center font-medium mb-4 border border-emerald-100 animate-in fade-in duration-300">
                          Activity logged successfully for{" "}
                          {selectedStudent.name}!
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setActiveLogAction(null);
                            setLogDetails("");
                            setActivityMessage("");
                            setShowSuccess(false);
                          }}
                          className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitProfessionalLog}
                          disabled={activityLoading || showSuccess}
                          className="flex-1 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {activityLoading
                            ? "Saving..."
                            : showSuccess
                              ? "Saved!"
                              : "Save Log"}
                        </button>
                      </div>

                      {activityMessage && !showSuccess && (
                        <p
                          className={`mt-4 text-sm font-medium p-3 rounded-lg text-center ${
                            activityMessage.includes("Failed") ||
                            activityMessage.includes("Please")
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {activityMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Health Information Card */}
                {!activeLogAction && (
                  <>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Health Information
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Allergies and dietary restrictions
                      </p>

                      <div className="flex flex-wrap gap-8">
                        <div className="flex-1 min-w-[140px]">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                            Health & Allergies
                          </h4>
                          {selectedStudent.allergies &&
                          selectedStudent.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.allergies.map((allergy, idx) => (
                                <span
                                  key={idx}
                                  className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200"
                                >
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No known allergies on file.
                            </p>
                          )}
                        </div>

                        <div className="flex-1 min-w-[140px]">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                            Dietary Restrictions
                          </h4>
                          {selectedStudent.dietaryRestrictions &&
                          selectedStudent.dietaryRestrictions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.dietaryRestrictions.map(
                                (diet, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200"
                                  >
                                    {diet}
                                  </span>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No known dietary restrictions.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medications Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Medications
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Active prescriptions and dosage
                      </p>

                      {selectedStudent.medications &&
                      selectedStudent.medications.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.medications.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl"
                            >
                              <p className="font-semibold text-gray-900">
                                {med.name}
                              </p>
                              <p className="text-gray-600 mt-1 text-sm">
                                <span className="font-medium">Dosage:</span>{" "}
                                {med.dosage} |{" "}
                                <span className="font-medium">Time:</span>{" "}
                                {med.timeToAdminister}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">
                          No medications logged.
                        </p>
                      )}
                    </div>

                    {/* Contacts & Pickups Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 pb-8 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Contacts & Pickups
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Emergency contacts and authorized pickups
                      </p>

                      <div className="mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                          Emergency Contacts
                        </h4>
                        {selectedStudent.emergencyContacts &&
                        selectedStudent.emergencyContacts.length > 0 ? (
                          <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden">
                            {selectedStudent.emergencyContacts.map(
                              (contact, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">
                                      {contact.name}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      • {contact.relationship}
                                    </span>
                                  </div>
                                  <a
                                    href={`tel:${contact.phone}`}
                                    className="p-2 bg-teal-50 rounded-full text-teal-600 hover:bg-teal-100 transition-colors"
                                  >
                                    <Phone size={16} />
                                  </a>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic text-sm">
                            No emergency contacts listed.
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                          Authorized Pickups
                        </h4>
                        {selectedStudent.authorizedPickups &&
                        selectedStudent.authorizedPickups.length > 0 ? (
                          <div className="space-y-2">
                            {selectedStudent.authorizedPickups.map(
                              (pickup, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleLogPickup(pickup.name)}
                                  disabled={activityLoading || showSuccess}
                                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all flex justify-between items-center group disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {pickup.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {pickup.relationship}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="text-sm font-medium text-gray-700">
                                      {pickup.phone}
                                    </p>
                                    <span className="text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Log Pickup &rarr;
                                    </span>
                                  </div>
                                </button>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic text-sm">
                            No authorized pickups listed.
                          </p>
                        )}

                        {showSuccess && (
                          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center font-medium mt-4 border border-emerald-100 animate-in fade-in duration-300">
                            Pickup logged successfully for{" "}
                            {selectedStudent.name}!
                          </div>
                        )}

                        {activityMessage && !showSuccess && (
                          <p className="mt-4 text-sm font-medium p-3 rounded-lg text-center bg-red-50 text-red-700">
                            {activityMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
