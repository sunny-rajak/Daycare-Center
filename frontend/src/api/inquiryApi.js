import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/inquiry`;
const USERS_API_URL = `${import.meta.env.VITE_API_URL}/users`;
const ADMIN_API_URL = `${import.meta.env.VITE_API_URL}/admin`;
const CLASSES_API_URL = `${import.meta.env.VITE_API_URL}/classes`;

export const getAllInquiries = async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status });
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const registerStaff = async (staffData) => {
  const payload = Object.entries(staffData).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const response = await axios.post(`${ADMIN_API_URL}/register-staff`, payload);
  return response.data;
};

export const enrollChild = async (inquiryId, classId) => {
  const response = await axios.post(`${API_URL}/${inquiryId}/enroll`, {
    classId,
  });
  return response.data;
};

export const getClasses = async () => {
  const response = await axios.get(`${CLASSES_API_URL}`);
  return response.data;
};
