import React, { useState } from "react";
import { updateChildBasicInfo } from "../api/parentApi";
import { User, Calendar, UserCheck } from "lucide-react";

const ManageBasicInfo = ({ child, onSave }) => {
  const [name, setName] = useState(child?.name || "");
  const [gender, setGender] = useState(child?.gender || "Other");

  // Format date for the HTML date input (YYYY-MM-DD)
  const formattedDate = child?.dateOfBirth
    ? new Date(child.dateOfBirth).toISOString().split("T")[0]
    : "";
  const [dateOfBirth, setDateOfBirth] = useState(formattedDate);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const updateData = { name, gender, dateOfBirth };
      await updateChildBasicInfo(child._id, updateData);

      setMessage("✅ Basic information updated successfully!");
      if (onSave) onSave(updateData);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Failed to update information. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto mb-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#2D3436]">Basic Information</h2>
        <p className="text-gray-600 mt-2">
          Update the name, date of birth, and gender for{" "}
          <span className="font-semibold">{child?.name}</span>.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-[#2D3436] mb-2">
            <User size={16} className="text-blue-500" /> Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#2D3436] mb-2">
              <Calendar size={16} className="text-purple-500" /> Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-[#2D3436] mb-2">
              <UserCheck size={16} className="text-teal-500" /> Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">{message}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-3 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Basic Info"}
        </button>
      </div>
    </div>
  );
};

export default ManageBasicInfo;
