import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getMyFamily } from "../../api/parentApi";
import ManageSafetyProfile from "../../components/ManageSafetyProfile";
import ManageBasicInfo from "../../components/ManageBasicInfo";
import {
  Utensils,
  LogOut,
  AlertCircle,
  Pill,
  ShieldCheck,
  Leaf,
  Clock,
  Phone,
  MessageCircle,
  X,
} from "lucide-react";

const CARD =
  "bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-gray-100";

const categoryStyles = {
  Food: "bg-orange-50 text-orange-800 border-orange-100",
  Meal: "bg-orange-50 text-orange-800 border-orange-100", // Fallback for existing logs
  Nap: "bg-slate-100 text-slate-700 border-slate-200",
  Learning: "bg-teal-50 text-teal-800 border-teal-200",
  Play: "bg-emerald-50 text-emerald-800 border-emerald-100",
  Health: "bg-rose-50 text-rose-800 border-rose-100",
  Checkout: "bg-blue-50 text-blue-800 border-blue-100",
};

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChildForSafety, setSelectedChildForSafety] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState({ type: "", text: "" });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchFamily = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const response = await getMyFamily();
      setFamilyData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load family data. Please refresh.",
      );
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handlePayment = async (amountToPay) => {
    setPaymentMessage({ type: "", text: "" });
    try {
      const token = user?.token || localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        { amount: amountToPay },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const order = response.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Sprout & Spark Childcare",
        description: "Tuition Payment",
        order_id: order.id,
        theme: { color: "#4D9699" },
        handler: async function (razorpayResponse) {
          try {
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/payments/verify-payment`,
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (
              verifyResponse.data.success ||
              verifyResponse.data.status === "success"
            ) {
              setPaymentMessage({
                type: "success",
                text: "Payment verified and successful!",
              });
              setTimeout(() => setPaymentMessage({ type: "", text: "" }), 5000);
              fetchFamily(true);
            } else {
              setPaymentMessage({
                type: "error",
                text: "Payment verification failed.",
              });
            }
          } catch {
            setPaymentMessage({
              type: "error",
              text: "Payment verification failed.",
            });
          }
        },
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.on("payment.failed", () =>
        setPaymentMessage({
          type: "error",
          text: "Payment failed or cancelled.",
        }),
      );
      paymentWindow.open();
    } catch {
      setPaymentMessage({
        type: "error",
        text: "Could not initiate payment. Please try again.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-xl font-semibold text-[#2D3436]">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <button
          onClick={handleLogout}
          className="w-full max-w-xs rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-xl font-semibold text-[#2D3436]">
          No family data found.
        </p>
      </div>
    );
  }

  const {
    parent,
    children,
    recentActivities,
    attendanceSummary,
    billingOverview,
  } = familyData;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Use first child for the safety card quick-view
  const primaryChild = children[0];

  const todaysActivities = recentActivities.filter((activity) => {
    const activityDate = new Date(
      activity.date || activity.timestamp,
    ).toDateString();
    const todayDate = new Date().toDateString();
    return activityDate === todayDate;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      {/* Modal Overlay for Safety Profile */}
      {selectedChildForSafety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-0 md:p-4 overflow-hidden">
          <div className="w-full h-full md:w-full md:max-w-3xl max-h-[100dvh] md:max-h-[85vh] bg-white md:rounded-2xl shadow-xl overflow-hidden relative flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedChildForSafety(null)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-full p-2 shadow-sm transition-all duration-200"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 md:px-8 md:py-6 space-y-6">
              <ManageBasicInfo
                child={selectedChildForSafety}
                onSave={() => {
                  fetchFamily(true);
                }}
              />
              <ManageSafetyProfile
                child={selectedChildForSafety}
                onSave={() => {
                  setSelectedChildForSafety(null);
                  fetchFamily(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <header className="flex justify-between items-center w-full mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#2D3436]">
              Welcome back, {parent.name.split(" ")[0]}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 bg-white hover:bg-red-50 rounded-full shadow-sm transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Child Profile Card */}
        {children.length > 0 && (
          <div className="flex flex-col">
            {children.map((child) => (
              <div
                key={child._id}
                className="w-full flex items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-2xl mb-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4D9699] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-[#2D3436]">
                      {child.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {child.classId?.className || "No class"} · Age {child.age}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">
                  {child.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start mt-8">
          {/* ── Daily Activity Feed (2 cols) ── */}
          <section
            className={`${CARD} md:col-span-1 lg:col-span-2 w-full flex flex-col self-start`}
          >
            <div className="flex flex-col gap-1 mb-6 w-full">
              <div className="flex justify-between items-start sm:items-center w-full">
                <h2 className="text-xl font-bold text-[#2D3436]">
                  Today's Updates
                </h2>
                <span className="text-xs font-bold bg-teal-50 text-[#4D9699] rounded-full px-3 py-1 border border-teal-100">
                  {todaysActivities.length} updates
                </span>
              </div>
              <p className="text-left text-sm text-gray-500">
                Daily activity feed &bull; {today}
              </p>
            </div>

            {todaysActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="flex justify-center mb-3 text-emerald-400">
                  <Leaf size={48} />
                </div>
                <p className="text-gray-400 font-medium">
                  No activities logged yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-1 scrollbar-hide">
                {todaysActivities.map((activity, idx) => {
                  const isLast = idx === todaysActivities.length - 1;
                  return (
                    <div key={activity._id} className="flex gap-4">
                      {/* Timeline: icon circle + connecting line */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 z-10">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        {!isLast && (
                          <div className="w-0 flex-1 border-l-2 border-gray-100 my-1" />
                        )}
                      </div>

                      {/* Activity card */}
                      <div className="flex-1 bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-base font-bold text-slate-800 mt-0.5">
                            {activity.description || "General Update"}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border flex-shrink-0 ${
                              categoryStyles[activity.category] ||
                              "bg-gray-50 text-gray-600 border-gray-100"
                            }`}
                          >
                            {activity.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(activity.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • by {activity.teacherId?.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Utility Column (1 col) ── */}
          <div className="flex flex-col gap-6 md:col-span-1 lg:col-span-1 w-full">
            {/* Attendance */}
            <div className={CARD}>
              <h2 className="text-xl font-bold text-[#2D3436] mb-1">
                Attendance
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Days present this month
              </p>

              {Object.keys(attendanceSummary).length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No attendance data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.values(attendanceSummary).map((summary, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap justify-between items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100"
                    >
                      <p className="font-semibold text-[#2D3436] text-sm">
                        {summary.childName}
                      </p>
                      <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">
                        {summary.daysPresent} days
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health & Safety */}
            {primaryChild && (
              <div className={CARD}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#2D3436]">
                    Health & Safety
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {primaryChild.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-6 mb-6">
                  {/* Allergies */}
                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={18} className="text-red-500" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Allergies
                      </p>
                    </div>
                    {primaryChild.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {primaryChild.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="bg-red-50 text-red-600 rounded-full px-3 py-1 text-xs font-bold border border-red-100"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        None on file
                      </p>
                    )}
                  </div>

                  {/* Dietary */}
                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils size={18} className="text-orange-500" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Dietary
                      </p>
                    </div>
                    {primaryChild.dietaryRestrictions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {primaryChild.dietaryRestrictions.map((d, i) => (
                          <span
                            key={i}
                            className="bg-orange-50 text-orange-600 rounded-full px-3 py-1 text-xs font-bold border border-orange-100"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        None on file
                      </p>
                    )}
                  </div>
                </div>

                {/* Medications */}
                {primaryChild.medications &&
                  primaryChild.medications.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">
                        <Pill size={18} className="text-blue-500" />
                        <p>Medications</p>
                      </div>
                      <div>
                        {primaryChild.medications.map((med, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl mb-2"
                          >
                            <p className="text-sm font-semibold text-slate-700">
                              {med.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Dosage: {med.dosage} | Time:{" "}
                              {med.timeToAdminister}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Authorized Pickups */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} className="text-teal-600" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Authorized Pickups
                    </p>
                  </div>
                  {primaryChild.authorizedPickups?.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {primaryChild.authorizedPickups.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        >
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-[#2D3436]">
                              {p.name}{" "}
                              <span className="text-xs text-gray-500 font-normal">
                                • {p.relationship}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${p.phone}`}
                              className="p-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors"
                              title="Call"
                            >
                              <Phone size={16} />
                            </a>
                            <a
                              href={`sms:${p.phone}`}
                              className="p-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors"
                              title="Message"
                            >
                              <MessageCircle size={16} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No pickups configured
                    </p>
                  )}
                </div>

                {children.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => setSelectedChildForSafety(child)}
                        className="text-xs font-semibold border border-[#4D9699] text-[#4D9699] rounded-full px-3 py-1 hover:bg-[#e6f2f2] transition-all"
                      >
                        Edit {child.name}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedChildForSafety(primaryChild)}
                  className="w-full border-2 border-[#4D9699] text-[#4D9699] hover:bg-[#e6f2f2] rounded-full py-2.5 font-semibold text-sm transition-all"
                >
                  Manage Child Profile
                </button>
              </div>
            )}

            {/* Tuition & Billing */}
            <div className={CARD}>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[#2D3436]">
                    Tuition & Billing
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Last updated: {today}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">
                  Current Balance
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-extrabold text-[#2D3436]">
                    ₹{billingOverview.totalPending.toLocaleString("en-IN")}
                  </p>
                  {billingOverview.totalPending > 0 ? (
                    billingOverview.hasOverdue ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                        Payment Overdue
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                        Payment Due
                      </span>
                    )
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                      All Paid Up
                    </span>
                  )}
                </div>
              </div>

              {billingOverview.pending.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {billingOverview.pending.slice(0, 2).map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex flex-wrap justify-between items-center gap-2 text-xs bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                    >
                      <span className="text-gray-500 truncate max-w-[60%]">
                        {invoice.childId?.name} — {invoice.description}
                      </span>
                      <div className="flex items-center gap-2">
                        {invoice.status === "Overdue" ? (
                          <span
                            className="w-2 h-2 rounded-full bg-red-500"
                            title="Overdue"
                          ></span>
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full bg-orange-400"
                            title="Pending"
                          ></span>
                        )}
                        <span className="font-bold text-[#2D3436]">
                          ₹{invoice.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {paymentMessage.text && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm font-semibold text-center border animate-in fade-in duration-300 ${
                    paymentMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {paymentMessage.text}
                </div>
              )}

              <button
                onClick={() => handlePayment(billingOverview.totalPending)}
                disabled={billingOverview.totalPending === 0}
                className="mt-5 w-full bg-[#4D9699] text-white rounded-full py-3 font-bold shadow-sm hover:shadow-md hover:bg-[#3b7a7c] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Make a Payment
              </button>
              <p
                onClick={() => setShowHistoryModal(true)}
                className="text-sm text-gray-400 text-center mt-3 cursor-pointer hover:text-[#4D9699] transition-colors"
              >
                View Payment History
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-0 md:p-4 overflow-hidden">
          <div className="relative w-full h-full md:h-auto md:w-full md:max-w-md mx-auto bg-white md:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] md:max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#2D3436]">
                Payment History
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 space-y-4">
              {billingOverview.paid && billingOverview.paid.length > 0 ? (
                billingOverview.paid.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-[#2D3436] text-sm">
                        {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {invoice.childId?.name} —{" "}
                        {invoice.description || "Tuition"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2D3436] mb-1">
                        ₹{invoice.amount?.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                        Paid
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-500 font-medium">
                    No payment history found yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
