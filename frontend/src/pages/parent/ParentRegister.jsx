import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ParentRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Submits to your backend parent registration endpoint
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/parents/register`,
        formData,
      );

      // Log the user in and redirect to their dashboard
      login(data);
      navigate("/parent-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your enrollment status.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Main Registration Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 px-8 pt-8 pb-10 border border-slate-100">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8FB996]/20 text-[#8FB996] mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Join the Sprout & Spark Family
            </h1>
            <p className="mt-2 text-slate-600">
              Create your parent account to get started.
            </p>
          </div>

          {/* The "Enrollment Warning" Banner */}
          <div className="mb-8 rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              <span className="font-semibold block mb-0.5">Note:</span>
              Registration is only available for parents with children already
              enrolled in our center.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 2-Column Grid for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Create Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Submit Button & Footer Link */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#4D9699] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-200/50 hover:bg-[#458689] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#4D9699] font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
