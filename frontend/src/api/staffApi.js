import axios from "axios";

const STAFF_API_URL = "http://localhost:5000/api/staff";
const ADMIN_API_URL = "http://localhost:5000/api/admin";
const ATTENDANCE_API_URL = "http://localhost:5000/api/attendance";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const registerStaffMember = async (staffData) => {
  const response = await axios.post(
    `${ADMIN_API_URL}/register-staff`,
    staffData,
    getAuthConfig(),
  );
  return response.data;
};

export const getTeacherDashboard = async () => {
  const response = await axios.get(
    `${STAFF_API_URL}/my-class`,
    getAuthConfig(),
  );
  return response.data;
};

export const getStaffList = async () => {
  const response = await axios.get(STAFF_API_URL, getAuthConfig());
  return response.data;
};

export const assignTeacherClass = async (teacherId, classId) => {
  const response = await axios.put(
    `${STAFF_API_URL}/assign-class`,
    { teacherId, classId },
    getAuthConfig(),
  );
  return response.data;
};

export const saveAttendance = async (payload) => {
  const response = await axios.post(
    ATTENDANCE_API_URL,
    payload,
    getAuthConfig(),
  );
  return response.data;
};

export const getAttendanceHistory = async (filters = {}) => {
  const response = await axios.get(`${ATTENDANCE_API_URL}/history`, {
    ...getAuthConfig(),
    params: filters,
  });
  return response.data;
};

export const deleteStaff = async (teacherId) => {
  const response = await axios.delete(
    `http://localhost:5000/api/users/${teacherId}`,
    getAuthConfig(),
  );
  return response.data;
};
