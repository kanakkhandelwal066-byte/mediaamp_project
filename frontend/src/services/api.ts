import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for attaching auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cinebook_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for extracting response data and error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean up local auth state
      const isAuthEndpoint = error.config.url?.includes("/auth/login") || error.config.url?.includes("/auth/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("cinebook_token");
        localStorage.removeItem("cinebook_user");
      }
    }
    return Promise.reject(error);
  }
);
