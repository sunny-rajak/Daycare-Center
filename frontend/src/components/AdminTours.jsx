import { useState, useEffect } from "react";
import { getAllTours, updateTourStatus, deleteTour } from "../api/tourApi";
import { Trash2, ChevronDown } from "lucide-react";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTours();

      let toursData = [];
      if (response?.data && Array.isArray(response.data)) {
        toursData = response.data;
      } else if (Array.isArray(response)) {
        toursData = response;
      }

      setTours(toursData);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError(err.message || "Failed to fetch tours. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatus = async (tourId, newStatus) => {
    try {
      // Update local state immediately for instant UI feedback
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour._id === tourId ? { ...tour, status: newStatus } : tour,
        ),
      );

      // Then update on backend
      await updateTourStatus(tourId, {
        status: newStatus,
        adminNotes: editNotes,
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to update tour");
      console.error("Error updating tour:", err);
      // Refetch to revert if there was an error
      fetchTours();
    }
  };

  const handleDeleteTour = async (id) => {
    if (window.confirm("Are you sure you want to delete this tour request?")) {
      try {
        await deleteTour(id);
        fetchTours();
      } catch (err) {
        setError(err.message || "Failed to delete tour");
        console.error("Error deleting tour:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D9699] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tour requests...</p>
        </div>
      </div>
    );
  }

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalTours = tours.length;
  const pendingTours = tours.filter((t) => t.status === "Pending").length;
  const confirmedTours = tours.filter((t) => t.status === "Confirmed").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Tours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Tours
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">{totalTours}</h3>
          </div>
        </div>

        {/* Card 2: Pending Tours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Pending Tours
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">
              {pendingTours}
            </h3>
          </div>
        </div>

        {/* Card 3: Confirmed Tours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Confirmed Tours
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">
              {confirmedTours}
            </h3>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Search Bar & Table Container */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by parent name, email, or phone..."
              className="w-full pl-11 pr-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Parent / Contact
                </th>
                <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Phone
                </th>
                <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="p-5 text-xs font-bold tracking-wider text-gray-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTours.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-gray-400 font-medium"
                  >
                    No tour requests found.
                  </td>
                </tr>
              ) : (
                filteredTours.map((tour) => (
                  <tr
                    key={tour._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-semibold text-[#2D3436]">
                        {tour.parentName}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {tour.email}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-[#2D3436]">{tour.phone}</td>
                    <td className="p-5">
                      <div className="text-sm font-medium text-[#2D3436]">
                        {formatDate(tour.requestedDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {tour.requestedTime}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="relative inline-block">
                        <select
                          value={tour.status}
                          onChange={(e) =>
                            handleSaveStatus(tour._id, e.target.value)
                          }
                          className={`appearance-none border rounded-full px-3 py-1 pr-8 text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 w-full transition-colors ${getStatusColor(tour.status)}`}
                        >
                          <option value="Pending">PENDING</option>
                          <option value="Confirmed">CONFIRMED</option>
                          <option value="Completed">COMPLETED</option>
                          <option value="Cancelled">CANCELLED</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-70" />
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleDeleteTour(tour._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Tour"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
