import axios from 'axios';

// Set at build time (VITE_API_URL). Vite inlines every VITE_* variable into the
// public bundle, so only non-secret values such as this URL may use the prefix.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
