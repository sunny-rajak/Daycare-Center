import axios from "axios";

const CLASSES_API_URL = `${import.meta.env.VITE_API_URL}/classes`;

export const getAllClasses = async () => {
  const response = await axios.get(CLASSES_API_URL);
  return response.data;
};

export const createClass = async (classData) => {
  const response = await axios.post(CLASSES_API_URL, classData);
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await axios.put(`${CLASSES_API_URL}/${id}`, classData);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await axios.delete(`${CLASSES_API_URL}/${id}`);
  return response.data;
};
