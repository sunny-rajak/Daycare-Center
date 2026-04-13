import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherDashboard,
  saveAttendance,
  getAttendanceHistory,
} from "../../api/staffApi";

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

  const today = new Date().toLocaleDateString();
  const todayIso = new Date().toISOString().split("T")[0];

  useEffect(() => {
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
    navigate("/admin/login");
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

  if (loading) {
    return (
      <div className="p-12 text-center text-xl font-semibold">
        Loading teacher dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Teacher Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Daily Class Tasks
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {!myClass ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              No Assigned Class
            </h2>
            <p className="mt-3 text-slate-600">
              You do not have a class assigned yet. Please ask an administrator
              to assign you to a class.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">My Class</h2>
              <p className="mt-3 text-slate-600">
                Class assigned to you for today&apos;s session.
              </p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Class Name
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {myClass.className}
                </p>
                <p className="mt-3 text-slate-600">
                  Age Group: {myClass.ageGroup}
                </p>
                <p className="mt-1 text-slate-600">
                  Capacity: {myClass.capacity}
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Attendance Date
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {today}
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Attendance Quick Actions
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Set the full roster present or absent in one click.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => markAll("Present")}
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markAll("Absent")}
                    className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {students.length === 0 ? (
                  <p className="text-slate-600">
                    No students are currently enrolled in this class.
                  </p>
                ) : (
                  students.map((student) => (
                    <div
                      key={student._id}
                      className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {student.gender} • DOB:{" "}
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {["Present", "Absent"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateStatus(student._id, status)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              attendance[student._id] === status
                                ? status === "Present"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-600 text-white"
                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Attendance settings are saved as daily records.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || students.length === 0}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>

              {message && (
                <p className="mt-4 text-sm text-slate-700">{message}</p>
              )}
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Attendance History
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Last 7 days of attendance for {myClass.className}.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Child
                      </th>
                      <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyLoading ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-8 text-center text-slate-400"
                        >
                          Loading recent attendance...
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-8 text-center text-slate-500"
                        >
                          {historyMessage || "No attendance records found."}
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 text-sm text-slate-700">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-900">
                            {item.childId?.name || "Unknown"}
                          </td>
                          <td className="p-4 text-sm text-slate-700">
                            {item.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
