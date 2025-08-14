import axios from 'axios';

// make an axios instance so we don't repeat the base URL + timeout everywhere
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // if env var missing, just hit local backend
  timeout: 10000, // don't wait forever if backend dies
});

// --- helper functions ---
const isObj = (v) => v && typeof v === 'object';
const isFormLike = (v) =>
  typeof FormData !== 'undefined' && v instanceof FormData ||
  typeof Blob !== 'undefined' && v instanceof Blob ||
  typeof File !== 'undefined' && v instanceof File;

// clean up the data before sending so backend doesn't freak out
const scrub = (val) => {
  if (val == null) return val; // null/undefined stays as is
  if (isFormLike(val) || val instanceof Date) return val; // don't touch files, blobs, or dates

  if (Array.isArray(val)) return val.map(scrub); // loop over arrays

  if (isObj(val)) {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (v === undefined) continue; // skip undefined (backend hates it)
      out[k] = scrub(v);
    }
    return out;
  }

  // turn empty strings into null so Spring doesn't think it's a legit value
  return val === '' ? null : val;
};

// make arrays in query params look like a=1&a=2 instead of weird stuff
api.defaults.paramsSerializer = (params) => {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
    else if (v !== undefined && v !== null) usp.set(k, v);
  });
  return usp.toString();
};

// --- runs before every request ---
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();

  // always tell the backend "we want JSON back"
  config.headers = {
    Accept: 'application/json',
    ...(config.headers || {}),
  };

  // for writes (POST/PUT/PATCH or DELETE-with-body), send JSON unless it's a file upload
  const hasBody =
    ['post', 'put', 'patch'].includes(method) ||
    (method === 'delete' && config.data != null);

  if (hasBody && config.data != null && !isFormLike(config.data)) {
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/json';
  }

  // only scrub plain objects (don't break files)
  if (config.data && isObj(config.data) && !isFormLike(config.data)) {
    config.data = scrub(config.data);
  }

  return config;
});

// --- runs after every response ---
api.interceptors.response.use(
  (res) => {
    // if backend says "204 No Content", just give us null instead of empty string
    if (res.status === 204 && res.data === '') {
      res.data = null;
    }
    return res;
  },
  (err) => {
    // show errors in dev so we know what's up, but don't spam tests
    const isDev = import.meta.env.DEV;
    const isTest = import.meta.env.MODE === 'test';

    if (isDev && !isTest) {
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