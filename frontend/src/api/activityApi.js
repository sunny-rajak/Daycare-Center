import axios from "axios";

const ACTIVITY_API_URL = "http://localhost:5000/api/activities";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const createActivity = async (activityData) => {
  const response = await axios.post(
    ACTIVITY_API_URL,
    activityData,
    getAuthConfig(),
  );
  return response.data;
};

export const getActivitiesByChild = async (childId) => {
  const response = await axios.get(
    `${ACTIVITY_API_URL}/child/${childId}`,
    getAuthConfig(),
  );
  return response.data;
};
