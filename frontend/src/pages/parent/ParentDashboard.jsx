import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getMyFamily } from "../../api/parentApi";
import ManageSafetyProfile from "../../components/ManageSafetyProfile";
import ManageBasicInfo from "../../components/ManageBasicInfo";
import {
  Utensils,
  Moon,
  HeartPulse,
  LogOut,
  Smile,
  Palette,
  Music,
  Bell,
  AlertCircle,
  Pill,
  Phone,
  ShieldCheck,
  Leaf,
  X,
} from "lucide-react";

const CARD =
  "bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-gray-100";

// Badge pill colors for the category tag (top-right of each card)
const categoryColors = {
  Meal: "bg-amber-100 text-amber-700",
  Nap: "bg-indigo-100 text-indigo-700",
  Activity: "bg-teal-100 text-teal-700",
  Health: "bg-red-100 text-red-700",
  default: "bg-blue-100 text-blue-700",
};

// Timeline icon circle: background color + icon component per category
const ACTIVITY_META = {
  Meal: {
    bg: "bg-amber-100",
    icon: <Utensils size={18} className="text-amber-600" />,
  },
  Nap: {
    bg: "bg-indigo-100",
    icon: <Moon size={18} className="text-indigo-600" />,
  },
  Health: {
    bg: "bg-red-100",
    icon: <HeartPulse size={18} className="text-red-600" />,
  },
  Checkout: {
    bg: "bg-rose-100",
    icon: <LogOut size={18} className="text-rose-600" />,
  },
  Art: {
    bg: "bg-pink-100",
    icon: <Palette size={18} className="text-pink-600" />,
  },
  Music: {
    bg: "bg-purple-100",
    icon: <Music size={18} className="text-purple-600" />,
  },
  Social: {
    bg: "bg-green-100",
    icon: <Smile size={18} className="text-green-600" />,
  },
  Activity: {
    bg: "bg-teal-100",
    icon: <Smile size={18} className="text-teal-600" />,
  },
  default: {
    bg: "bg-teal-100",
    icon: <Bell size={18} className="text-teal-600" />,
  },
};

function getActivityMeta(activity) {
  if (
    activity.title?.includes("Signed Out") ||
    activity.description?.includes("Signed Out") ||
    activity.category === "Checkout"
  ) {
    return {
      bg: "bg-blue-100",
      icon: <LogOut size={18} className="text-blue-600" />,
    };
  }
  return ACTIVITY_META[activity.category] ?? ACTIVITY_META.default;
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChildForSafety, setSelectedChildForSafety] = useState(null);

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
              alert("Payment Verified and Successful!");
              fetchFamily(true);
            } else {
              alert("Payment verification failed.");
            }
          } catch {
            alert("Payment verification failed.");
          }
        },
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.on("payment.failed", () =>
        alert("Payment failed or cancelled."),
      );
      paymentWindow.open();
    } catch {
      alert("Could not initiate payment. Please try again.");
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      {/* Modal Overlay for Safety Profile */}
      {selectedChildForSafety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-0 md:p-4">
          <div className="w-full h-full md:w-auto md:h-auto md:max-w-3xl max-h-[100dvh] md:max-h-[85vh] bg-white md:rounded-2xl shadow-xl overflow-y-auto relative p-6 md:p-8 custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => setSelectedChildForSafety(null)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-full p-2 shadow-sm transition-all duration-200"
            >
              <X size={24} />
            </button>
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
                  {recentActivities.length} updates
                </span>
              </div>
              <p className="text-left text-sm text-gray-500">
                Daily activity feed &bull; {today}
              </p>
            </div>

            {recentActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="flex justify-center mb-3 text-emerald-400">
                  <Leaf size={48} />
                </div>
                <p className="text-gray-400 font-medium">
                  No activities logged yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {recentActivities.map((activity, idx) => {
                  const { bg, icon } = getActivityMeta(activity);
                  const isLast = idx === recentActivities.length - 1;
                  return (
                    <div key={activity._id} className="flex gap-4">
                      {/* Timeline: icon circle + connecting line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 ${bg}`}
                        >
                          {icon}
                        </div>
                        {!isLast && (
                          <div className="w-0 flex-1 border-l-2 border-gray-100 my-1" />
                        )}
                      </div>

                      {/* Activity card */}
                      <div className="flex-1 bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-[#2D3436] text-sm">
                              {activity.childId?.name}
                            </p>
                            <p className="text-sm font-semibold text-[#4D9699] mt-0.5">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                              {activity.description}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 text-xs font-bold rounded-full px-3 py-1 ${
                              categoryColors[activity.category] ||
                              categoryColors.default
                            }`}
                          >
                            {activity.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(activity.date).toLocaleString()} · by{" "}
                          {activity.teacherId?.name}
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

                {/* Allergies */}
                <div className="mb-4">
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
                    <p className="text-xs text-gray-400 italic">None on file</p>
                  )}
                </div>

                {/* Dietary */}
                <div className="mb-4">
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
                    <p className="text-xs text-gray-400 italic">None on file</p>
                  )}
                </div>

                {/* Authorized Pickups */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} className="text-teal-600" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Authorized Pickups
                    </p>
                  </div>
                  {primaryChild.authorizedPickups?.length > 0 ? (
                    <div className="space-y-1">
                      {primaryChild.authorizedPickups.map((p, i) => (
                        <p key={i} className="text-sm text-[#2D3436]">
                          · {p.name}{" "}
                          <span className="text-gray-400 text-xs">
                            ({p.relationship})
                          </span>
                        </p>
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
              <h2 className="text-xl font-bold text-[#2D3436] mb-1">
                Tuition & Billing
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Current account balance
              </p>

              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                Current Balance
              </p>
              <div className="flex items-center gap-3 my-2">
                <p className="text-4xl font-extrabold text-[#2D3436]">
                  ₹{billingOverview.totalPending.toLocaleString("en-IN")}
                </p>
                {billingOverview.totalPending > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                    Payment Due
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                    All Paid Up
                  </span>
                )}
              </div>

              {billingOverview.pending.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {billingOverview.pending.slice(0, 2).map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex flex-wrap justify-between items-center gap-2 text-xs bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                    >
                      <span className="text-gray-500 truncate max-w-[60%]">
                        {invoice.childId?.name} — {invoice.description}
                      </span>
                      <span className="font-bold text-[#2D3436]">
                        ₹{invoice.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handlePayment(billingOverview.totalPending)}
                disabled={billingOverview.totalPending === 0}
                className="mt-5 w-full bg-[#4D9699] text-white rounded-full py-3 font-bold shadow-md hover:bg-[#3b7a7c] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Make a Payment
              </button>
              <p className="text-sm text-gray-400 text-center mt-3 cursor-pointer hover:text-[#4D9699] transition-colors">
                View Payment History
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
