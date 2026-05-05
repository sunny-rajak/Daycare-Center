import React, { useState } from "react";
import { createActivity } from "../api/activityApi";

export default function ChildRosterCard({ child, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedPickup) return;

    setLoading(true);
    try {
      // We use the existing Activity structure (category/title/description)
      await createActivity({
        childId: child._id,
        category: "Checkout",
        title: "Child Signed Out",
        description: `${child.name} was picked up by ${selectedPickup.name} (${selectedPickup.relationship}).`,
      });

      alert("Checkout successfully logged!");
      setIsModalOpen(false);
      setSelectedPickup(null);

      // Trigger dashboard refresh if callback provided
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to log checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-3xl p-6 shadow-sm bg-white relative">
      <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
      <p className="text-sm text-slate-500 mb-6">Age: {child.age} years</p>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 rounded-2xl transition-colors border border-slate-200"
      >
        Sign Out / Verify ID
      </button>

      {/* Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Verify Identity for {child.name}
            </h2>

            {child.authorizedPickups?.length > 0 ? (
              <div className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-2">
                {child.authorizedPickups.map((pickup, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPickup(pickup)}
                    className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${
                      selectedPickup === pickup
                        ? "border-[#4D9699] bg-[#e6f2f2]"
                        : "border-slate-100 hover:border-[#4D9699]"
                    }`}
                  >
                    {/* Custom Radio Button */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPickup === pickup
                          ? "border-[#4D9699]"
                          : "border-slate-300"
                      }`}
                    >
                      {selectedPickup === pickup && (
                        <div className="w-3 h-3 bg-[#4D9699] rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{pickup.name}</p>
                      <p className="text-sm text-slate-500">
                        {pickup.relationship} • {pickup.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic mb-8 p-4 bg-slate-50 rounded-2xl text-center">
                No authorized pickups are listed for this child.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 font-semibold transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!selectedPickup || loading}
                className={`px-6 py-3 rounded-2xl font-semibold text-white transition-all ${
                  !selectedPickup || loading
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-[#4D9699] hover:bg-[#3b7a7c] shadow-sm"
                }`}
              >
                {loading ? "Processing..." : "Confirm Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
