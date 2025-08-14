import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

// --- helpers: clean payloads before sending (prevents weird 400s) ---
const scrub = (val) => {
  if (Array.isArray(val)) return val.map(scrub);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (v === undefined) continue;
      out[k] = scrub(v);
    }
    return out;
  }
  // turn empty strings into null (common for optional numeric/foreign keys)
  if (val === '') return null;
  return val;
};

// Ensure JSON on writes so Spring doesn't 415 us
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();

  // default headers
  config.headers = {
    Accept: 'application/json',
    ...(config.headers || {}),
  };

  // force JSON for POST/PUT/PATCH/DELETE-with-body
  if (['post', 'put', 'patch'].includes(method)) {
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/json';
  }

  // Scrub payloads
  if (config.data && typeof config.data === 'object') {
    config.data = scrub(config.data);
  }

  return config;
});

// surface useful backend error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) {
      console.error('[API ERROR]', {
        url: err.config?.url,
        method: err.config?.method,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
    return Promise.reject(err);
  }
);

export default api;
