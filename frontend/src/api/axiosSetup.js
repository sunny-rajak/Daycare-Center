import axios from "axios";

// Request Interceptor: Automatically attach the latest token to every outgoing request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Automatically handle expired tokens or global 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the token is invalid or expired, clear the session and force login
      localStorage.removeItem("token");
      localStorage.removeItem("daycare_user");
    }
    return Promise.reject(error);
  },
);
