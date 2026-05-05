import axios from "axios";

const PAYMENT_API_URL = `${import.meta.env.VITE_API_URL}/payments`;

export const getAllPayments = async () => {
  const response = await axios.get(PAYMENT_API_URL);
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await axios.post(PAYMENT_API_URL, paymentData);
  return response.data;
};

export const getPaymentsByParent = async (parentId) => {
  const response = await axios.get(`${PAYMENT_API_URL}/parent/${parentId}`);
  return response.data;
};

export const generateMonthlyInvoices = async () => {
  const response = await axios.post(`${PAYMENT_API_URL}/generate-monthly`, {});
  return response.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const response = await axios.patch(`${PAYMENT_API_URL}/${paymentId}`, {
    status,
  });
  return response.data;
};

export const deletePayment = async (paymentId) => {
  const response = await axios.delete(`${PAYMENT_API_URL}/${paymentId}`);
  return response.data;
};

export const getParentOptions = async () => {
  const response = await axios.get(`${PAYMENT_API_URL}/parents`);
  return response.data;
};
