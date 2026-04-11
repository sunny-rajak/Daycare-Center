import { useEffect, useState } from "react";
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
      });
      setForm({ className: "Infant", ageGroup: "3m - 15m", capacity: "10" });
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Manage Classes
            </h2>
            <p className="text-gray-500 mt-2">
              Add new classes or update the capacity of existing ones.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateClass}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Class Name
            </label>
            <select
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Infant">Infant</option>
              <option value="Toddler">Toddler</option>
              <option value="Preschool">Preschool</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Age Group
            </label>
            <input
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3m - 15m"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50"
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
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {cls.className}
                    </h3>
                    <p className="text-sm text-gray-500">{cls.ageGroup}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600">
                    {occupancy}/{cls.capacity}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-500">Current occupancy</div>
                  <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${Math.min((occupancy / cls.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {remaining} spots remaining
                  </div>
                </div>

                {editingClassId === cls._id ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingCapacity}
                      onChange={(e) => setEditingCapacity(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cls._id)}
                        disabled={saving}
                        className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-white font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-gray-700">
                      Capacity: {cls.capacity}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => beginEdit(cls)}
                        className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-white font-bold hover:bg-blue-700 transition-all"
                      >
                        Edit Capacity
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls._id)}
                        className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-bold hover:bg-red-100 transition-all"
                      >
                        Delete
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
