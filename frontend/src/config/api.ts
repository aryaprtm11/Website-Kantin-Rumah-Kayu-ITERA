/**
 * Axios configuration for API requests
 * Centralized API client with interceptors
 */

import axios from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.HEADERS,
    'Accept': 'application/json',
  },
  withCredentials: false,
});

/**
 * Request interceptor
 * Adds authentication token if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles global error responses
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc)
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;

