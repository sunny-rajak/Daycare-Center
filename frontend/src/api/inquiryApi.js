import axios from "axios";

const API_URL = "http://localhost:5000/api/inquiry";
const USERS_API_URL = "http://localhost:5000/api/users";
const ADMIN_API_URL = "http://localhost:5000/api/admin";
const CLASSES_API_URL = "http://localhost:5000/api/classes";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getAllInquiries = async () => {
  const response = await axios.get(`${API_URL}/all`, getAuthConfig());
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await axios.put(
    `${API_URL}/${id}/status`,
    { status },
    getAuthConfig(),
  );
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

export const registerStaff = async (staffData) => {
  const payload = Object.entries(staffData).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const response = await axios.post(
    `${ADMIN_API_URL}/register-staff`,
    payload,
    getAuthConfig(),
  );
  return response.data;
};

export const enrollChild = async (inquiryId, classId) => {
  const response = await axios.post(
    `${API_URL}/${inquiryId}/enroll`,
    { classId },
    getAuthConfig(),
  );
  return response.data;
};

export const getClasses = async () => {
  const response = await axios.get(`${CLASSES_API_URL}`, getAuthConfig());
  return response.data;
};
