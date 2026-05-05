import axios from "axios";

const PAYMENT_API_URL = "http://localhost:5000/api/payments";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getAllPayments = async () => {
  const response = await axios.get(PAYMENT_API_URL, getAuthConfig());
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await axios.post(
    PAYMENT_API_URL,
    paymentData,
    getAuthConfig(),
  );
  return response.data;
};

export const getPaymentsByParent = async (parentId) => {
  const response = await axios.get(
    `${PAYMENT_API_URL}/parent/${parentId}`,
    getAuthConfig(),
  );
  return response.data;
};

export const generateMonthlyInvoices = async () => {
  const response = await axios.post(
    `${PAYMENT_API_URL}/generate-monthly`,
    {},
    getAuthConfig(),
  );
  return response.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const response = await axios.patch(
    `${PAYMENT_API_URL}/${paymentId}`,
    { status },
    getAuthConfig(),
  );
  return response.data;
};

export const deletePayment = async (paymentId) => {
  const response = await axios.delete(
    `${PAYMENT_API_URL}/${paymentId}`,
    getAuthConfig(),
  );
  return response.data;
};

export const getParentOptions = async () => {
  const response = await axios.get(
    `${PAYMENT_API_URL}/parents`,
    getAuthConfig(),
  );
  return response.data;
};
