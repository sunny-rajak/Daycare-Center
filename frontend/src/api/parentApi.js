import axios from "axios";

const PARENT_API_URL = "http://localhost:5000/api/parent";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("ecera_user"))?.token;
  if (!token) return {};
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getMyFamily = async () => {
  const response = await axios.get(
    `${PARENT_API_URL}/my-family`,
    getAuthConfig(),
  );
  return response.data;
};

export const updateChildSafetyProfile = async (childId, safetyData) => {
  const response = await axios.put(
    `${PARENT_API_URL}/child/${childId}/safety-profile`,
    safetyData,
    getAuthConfig(),
  );
  return response.data;
};

export const updateChildBasicInfo = async (childId, basicInfoData) => {
  const response = await axios.put(
    `${PARENT_API_URL}/child/${childId}/basic-info`,
    basicInfoData,
    getAuthConfig(),
  );
  return response.data;
};
