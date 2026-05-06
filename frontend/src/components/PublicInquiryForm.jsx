import { useState } from "react";
import axios from "axios";

export default function PublicInquiryForm() {
  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    childAge: "",
    programOfInterest: "Infant",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/inquiry/submit`,
        formData,
      );
      setStatus({ type: "success", message: res.data.message });
      // Reset form on success
      setFormData({
        parentName: "",
        email: "",
        phone: "",
        childName: "",
        childAge: "",
        programOfInterest: "Infant",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inquiry" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Start Your Journey
          </h2>
          <p className="text-gray-500 font-medium">
            Complete the form below and our admissions team will reach out
            within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Parent Info */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Parent Name
              </label>
              <input
                required
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                type="text"
                placeholder="John Doe"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Email Address
              </label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="john@example.com"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all"
              />
            </div>

            {/* Child Info */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Child's Name
              </label>
              <input
                required
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                type="text"
                placeholder="Junior Doe"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Program of Interest
              </label>
              <select
                name="programOfInterest"
                value={formData.programOfInterest}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all font-medium text-gray-700"
              >
                <option value="Infant">Infant Program</option>
                <option value="Toddler">Toddler Program</option>
                <option value="Preschool">Preschool Program</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Phone Number
              </label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="123-456-7890"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Child's Age
              </label>
              <input
                required
                name="childAge"
                value={formData.childAge}
                onChange={handleChange}
                type="number"
                placeholder="2"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all"
              />
            </div>
          </div>

          {/* Add this inside the grid in PublicInquiryForm.jsx */}

          <div className="mb-8 space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about your child's needs..."
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#4D9699] outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full block py-5 bg-[#4D9699] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-white rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Send Inquiry Now"}
          </button>

          {status.message && (
            <div
              className={`mt-6 p-4 rounded-2xl text-center font-bold ${status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
