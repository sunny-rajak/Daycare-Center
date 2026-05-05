import axios from "axios";

const ACTIVITY_API_URL = `${import.meta.env.VITE_API_URL}/activities`;

export const createActivity = async (activityData) => {
  const response = await axios.post(ACTIVITY_API_URL, activityData);
  return response.data;
};

export const getActivitiesByChild = async (childId) => {
  const response = await axios.get(`${ACTIVITY_API_URL}/child/${childId}`);
  return response.data;
};
