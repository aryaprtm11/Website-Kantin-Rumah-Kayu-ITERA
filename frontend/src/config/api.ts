import axios from "axios";

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const frontendSecretKey = import.meta.env.VITE_FRONTEND_SECRET_KEY;
    if (frontendSecretKey && config.headers) {
      config.headers["X-Kantin-Key"] = frontendSecretKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access - Session expired");
    }
    if (error.response?.status === 403) {
      console.error(
        "Forbidden access - Cek konfigurasi Secret Key atau User Role"
      );
    }
    return Promise.reject(error);
  }
);

export default api;
