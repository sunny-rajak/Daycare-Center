import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  createPayment,
  getAllPayments,
  getParentOptions,
  getPaymentsByParent,
  generateMonthlyInvoices,
  updatePaymentStatus,
  deletePayment,
} from "../api/paymentApi";

export default function Billing() {
  const [payments, setPayments] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formData, setFormData] = useState({
    parentId: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Paid",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      setError("");

      try {
        const [paymentsRes, parentsRes] = await Promise.all([
          getAllPayments(),
          getParentOptions(),
        ]);

        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        setParents(Array.isArray(parentsRes.data) ? parentsRes.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load billing information. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const filteredParents = useMemo(() => {
    const term = parentSearch.toLowerCase();
    return parents.filter(
      (parent) =>
        parent.name.toLowerCase().includes(term) ||
        parent.email.toLowerCase().includes(term) ||
        parent.phone?.toLowerCase().includes(term),
    );
  }, [parents, parentSearch]);

  const currentMonthPayments = useMemo(() => {
    const now = new Date();
    return payments.filter((payment) => {
      if (!payment.date) return false;
      const paymentDate = new Date(payment.date);
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    });
  }, [payments]);

  const totalExpected = currentMonthPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );
  const totalCollected = currentMonthPayments.reduce(
    (sum, payment) =>
      sum + (payment.status === "Paid" ? Number(payment.amount || 0) : 0),
    0,
  );
  const totalOutstanding = currentMonthPayments.reduce(
    (sum, payment) =>
      sum +
      (["Pending", "Overdue"].includes(payment.status)
        ? Number(payment.amount || 0)
        : 0),
    0,
  );

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredTablePayments = useMemo(() => {
    if (!selectedParentId) return payments;
    return payments.filter((p) => p.parentId?._id === selectedParentId);
  }, [payments, selectedParentId]);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "PAID":
        return "bg-green-50 text-green-700 border-green-200";
      case "OVERDUE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const refreshBillingData = async () => {
    setLoading(true);
    setError("");

    try {
      const [paymentsRes, parentsRes] = await Promise.all([
        getAllPayments(),
        getParentOptions(),
      ]);

      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setParents(Array.isArray(parentsRes.data) ? parentsRes.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load billing information. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    setError("");

    try {
      await generateMonthlyInvoices();
      await refreshBillingData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate monthly invoices. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    setActionLoadingId(paymentId);
    setError("");

    try {
      await updatePaymentStatus(paymentId, newStatus);
      await refreshBillingData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update payment status. Please try again.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    setActionLoadingId(paymentId);
    setError("");

    try {
      await deletePayment(paymentId);
      await refreshBillingData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the payment. Please try again.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.parentId || !formData.amount || !formData.date) {
      setError(
        "Please choose a parent, enter a valid amount, and select a date.",
      );
      return;
    }

    setFormLoading(true);
    setError("");

    try {
      await createPayment({
        parentId: formData.parentId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        date: formData.date,
      });

      const refreshedPayments = await getAllPayments();
      setPayments(
        Array.isArray(refreshedPayments.data) ? refreshedPayments.data : [],
      );
      setFormData({
        parentId: "",
        amount: "",
        paymentMethod: "Cash",
        status: "Paid",
        date: new Date().toISOString().split("T")[0],
      });
      setParentSearch("");
      setModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to record payment. Please try again.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Quick Actions */}
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={handleGenerateInvoices}
          disabled={isGenerating}
          className="bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 font-bold py-2 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Monthly Invoices"}
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-[#4D9699] hover:bg-[#3d7a7c] text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm"
        >
          Record New Payment
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Expected
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">
              ₹
              {totalExpected.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>
        </div>

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
              Total Collected
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">
              ₹
              {totalCollected.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
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
              Total Outstanding
            </p>
            <h3 className="text-3xl font-black text-[#2D3436]">
              ₹
              {totalOutstanding.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-[#2D3436]">Payment History</h2>
          <select
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Parents</option>
            {parents.map((parent) => (
              <option key={parent._id} value={parent._id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Parent / Contact
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center text-gray-400 font-medium"
                  >
                    Loading payments...
                  </td>
                </tr>
              ) : filteredTablePayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center text-gray-400 italic"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredTablePayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-semibold text-[#2D3436]">
                        {payment.parentId?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.parentId?.email}
                      </div>
                    </td>
                    <td className="p-5 font-bold text-[#2D3436]">
                      ₹
                      {Number(payment.amount || 0).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="p-5 text-sm text-[#2D3436]">
                      {payment.date
                        ? new Date(payment.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-5 text-sm text-[#2D3436]">
                      {payment.paymentMethod || "N/A"}
                    </td>
                    <td className="p-5 text-center">
                      <div className="relative inline-block w-full max-w-[130px]">
                        <select
                          value={payment.status}
                          onChange={(e) =>
                            handleUpdateStatus(payment._id, e.target.value)
                          }
                          disabled={actionLoadingId === payment._id}
                          className={`appearance-none border rounded-full px-3 py-1 pr-8 text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20 w-full transition-colors disabled:opacity-60 ${getStatusColor(payment.status)}`}
                        >
                          <option value="Pending">PENDING</option>
                          <option value="Paid">PAID</option>
                          <option value="Overdue">OVERDUE</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-70" />
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        disabled={actionLoadingId === payment._id}
                        onClick={() => handleDeletePayment(payment._id)}
                        className="inline-block p-1"
                        title="Delete Payment"
                      >
                        <Trash2
                          size={18}
                          className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#2D3436]">
                  Record New Payment
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select a parent and fill the payment details below.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Search Parents
                </label>
                <input
                  type="text"
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  placeholder="Search by parent name, email, or phone"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Parent
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleFormChange("parentId", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-white"
                >
                  <option value="">Select a parent</option>
                  {filteredParents.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name} — {parent.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      handleFormChange("paymentMethod", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-[#2D3436] bg-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mt-2">
                <button
                  type="button"
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={handleSubmit}
                  className="bg-[#4D9699] hover:bg-[#3d7a7c] text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
