import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          email,
          password,
        },
      );

      login(data);
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.role === "teacher") {
        navigate("/staff/dashboard");
      } else if (data.role === "parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-slate-900">Sign In</h1>
          <p className="mt-2 text-slate-600">
            Access your Sprout & Spark Childcare dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 px-8 pt-8 pb-10 border border-slate-100 mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-[#4D9699] transition"
                >
                  Forgot?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#4D9699] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-200/50 hover:bg-[#458689] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Parent Registration CTA */}
        <div className="bg-[#FDFBF7] rounded-3xl border border-gray-200 p-6 text-center">
          <h3 className="font-semibold text-slate-900 mb-1">New Parent?</h3>
          <p className="text-sm text-slate-600 mb-4">
            Start tracking your child's daycare activities, billing, and more.
          </p>
          <button
            type="button"
            onClick={() => navigate("/parent/register")}
            className="w-full sm:w-auto inline-block rounded-2xl bg-[#8FB996] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-green-100 hover:bg-[#82a888] transition"
          >
            Create Parent Account
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Reset Password
              </h2>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition mb-4"
            />
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              Send Reset Link
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Back to login
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
