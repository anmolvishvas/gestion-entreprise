import axios from 'axios';
import { authService } from './authService';

// export const API_URL = "https://localhost:8000/api";
export const API_URL = "https://gestion-entreprise.devanmol.tech/api";


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/auth/login_check') || config.url?.includes('/register')) {
      return config;
    }

    const token = authService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      return config;
    }

    if (["POST", "PUT", "PATCH"].includes(config.method?.toUpperCase() || "")) {
      config.headers["Content-Type"] = "application/ld+json";
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
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login_check')) {
      authService.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
