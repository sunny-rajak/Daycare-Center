import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/tours`;

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
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Update tour status
export const updateTourStatus = async (tourId, statusData) => {
  try {
    const response = await axios.put(`${API_URL}/${tourId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Delete a tour
export const deleteTour = async (tourId) => {
  try {
    const response = await axios.delete(`${API_URL}/${tourId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
