import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../api/classesApi";

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    className: "Infant",
    ageGroup: "3m - 15m",
    capacity: "10",
    monthlyFee: "10000",
  });
  const [saving, setSaving] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingCapacity, setEditingCapacity] = useState("");

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await getAllClasses();
      setClasses(response?.data || []);
    } catch (err) {
      console.error("Class fetch error:", err);
      setError("Unable to load classes. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createClass({
        className: form.className,
        ageGroup: form.ageGroup,
        capacity: Number(form.capacity),
        monthlyFee: Number(form.monthlyFee),
      });
      setForm({
        className: "Infant",
        ageGroup: "3m - 15m",
        capacity: "10",
        monthlyFee: "10000",
      });
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create class.");
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (cls) => {
    setEditingClassId(cls._id);
    setEditingCapacity(String(cls.capacity));
  };

  const cancelEdit = () => {
    setEditingClassId(null);
    setEditingCapacity("");
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      await updateClass(id, { capacity: Number(editingCapacity) });
      cancelEdit();
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update class.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    setSaving(true);
    setError("");
    try {
      await deleteClass(id);
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete class.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#2D3436]">
              Manage Classes
            </h2>
            <p className="text-gray-500 mt-2">
              Add new classes or update the capacity of existing ones.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateClass}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Class Name
            </label>
            <select
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="Infant">Infant</option>
              <option value="Toddler">Toddler</option>
              <option value="Preschool">Preschool</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Age Group
            </label>
            <select
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            >
              <option value="3m - 15m">3m - 15m</option>
              <option value="16m - 33m">16m - 33m</option>
              <option value="33m - 5y">33m - 5y</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
              Monthly Fee (₹)
            </label>
            <input
              type="number"
              min="0"
              value={form.monthlyFee}
              onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#4D9699] hover:bg-[#3d7a7c] text-white font-bold py-2.5 px-8 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="md:col-span-3 rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center text-gray-500">
            Loading classes...
          </div>
        ) : (
          classes.map((cls) => {
            const occupancy = cls.enrolledCount || 0;
            const remaining = Math.max(cls.capacity - occupancy, 0);
            return (
              <div
                key={cls._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2D3436]">
                      {cls.className}
                    </h3>
                    <p className="text-sm text-gray-500">{cls.ageGroup}</p>
                  </div>
                  <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-sm font-bold">
                    {occupancy}/{cls.capacity}
                  </span>
                </div>

                <div className="mb-4 space-y-2 flex-1">
                  <div className="text-sm text-gray-500">Current occupancy</div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-[#4D9699] transition-all duration-500"
                      style={{
                        width: `${Math.min((occupancy / cls.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {remaining} spots remaining
                  </div>
                </div>

                {editingClassId === cls._id ? (
                  <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingCapacity}
                      onChange={(e) => setEditingCapacity(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cls._id)}
                        disabled={saving}
                        className="flex-1 bg-[#4D9699] hover:bg-[#3d7a7c] text-white text-sm font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[#2D3436] text-sm font-bold py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => beginEdit(cls)}
                        className="flex-1 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-[#2D3436] hover:text-teal-700 text-sm font-bold py-2 rounded-xl transition-colors text-center cursor-pointer"
                      >
                        Edit Capacity
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
