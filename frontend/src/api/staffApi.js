import axios from "axios";

const STAFF_API_URL = `${import.meta.env.VITE_API_URL}/staff`;
const ADMIN_API_URL = `${import.meta.env.VITE_API_URL}/admin`;
const ATTENDANCE_API_URL = `${import.meta.env.VITE_API_URL}/attendance`;

export const registerStaffMember = async (staffData) => {
  const response = await axios.post(
    `${ADMIN_API_URL}/register-staff`,
    staffData,
  );
  return response.data;
};

export const getTeacherDashboard = async () => {
  const response = await axios.get(`${STAFF_API_URL}/my-class`);
  return response.data;
};

export const getStaffList = async () => {
  const response = await axios.get(STAFF_API_URL);
  return response.data;
};

export const assignTeacherClass = async (teacherId, classId) => {
  const response = await axios.put(`${STAFF_API_URL}/assign-class`, {
    teacherId,
    classId,
  });
  return response.data;
};

export const saveAttendance = async (payload) => {
  const response = await axios.post(ATTENDANCE_API_URL, payload);
  return response.data;
};

export const getAttendanceHistory = async (filters = {}) => {
  const response = await axios.get(`${ATTENDANCE_API_URL}/history`, {
    params: filters,
  });
  return response.data;
};

export const deleteStaff = async (teacherId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_URL}/users/${teacherId}`,
  );
  return response.data;
};
