import axios from "axios";

const PARENT_API_URL = `${import.meta.env.VITE_API_URL}/parent`;

export const getMyFamily = async () => {
  const response = await axios.get(`${PARENT_API_URL}/my-family`);
  return response.data;
};

export const updateChildSafetyProfile = async (childId, safetyData) => {
  const response = await axios.put(
    `${PARENT_API_URL}/child/${childId}/safety-profile`,
    safetyData,
  );
  return response.data;
};

export const updateChildBasicInfo = async (childId, basicInfoData) => {
  const response = await axios.put(
    `${PARENT_API_URL}/child/${childId}/basic-info`,
    basicInfoData,
  );
  return response.data;
};
