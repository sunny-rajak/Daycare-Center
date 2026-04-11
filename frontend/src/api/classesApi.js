import axios from "axios";

const CLASSES_API_URL = "http://localhost:5000/api/classes";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getAllClasses = async () => {
  const response = await axios.get(CLASSES_API_URL, getAuthConfig());
  return response.data;
};

export const createClass = async (classData) => {
  const response = await axios.post(
    CLASSES_API_URL,
    classData,
    getAuthConfig(),
  );
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await axios.put(
    `${CLASSES_API_URL}/${id}`,
    classData,
    getAuthConfig(),
  );
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await axios.delete(
    `${CLASSES_API_URL}/${id}`,
    getAuthConfig(),
  );
  return response.data;
};
