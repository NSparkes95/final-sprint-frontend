import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

// Ensure JSON for POST/PUT/PATCH so Spring doesn't return 415 (Unsupported Media Type)
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch'].includes(method)) {
    config.headers = {
      ...(config.headers || {}),
      'Content-Type': config.headers?.['Content-Type'] || 'application/json',
      Accept: config.headers?.Accept || 'application/json',
    };
  }
  return config;
});

export default api;
