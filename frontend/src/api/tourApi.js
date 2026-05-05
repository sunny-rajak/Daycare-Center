import axios from "axios";

const API_URL = "http://localhost:5000/api/tours";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// Public: Submit a tour request
export const submitTourRequest = async (tourData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, tourData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Get all tour requests
export const getAllTours = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Update tour status
export const updateTourStatus = async (tourId, statusData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${tourId}/status`,
      statusData,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Delete a tour
export const deleteTour = async (tourId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${tourId}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
