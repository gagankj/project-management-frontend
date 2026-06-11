import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequests = 0;

const updateLoader = (loading: boolean) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: loading }));
};

// Add interceptor to include authorization token and manage loading state
api.interceptors.request.use(
  (config) => {
    activeRequests++;
    if (activeRequests === 1) {
      updateLoader(true);
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      updateLoader(false);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to manage loading state and auto-logout on unauthorized/expired token
api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      updateLoader(false);
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      updateLoader(false);
    }

    // Auto-logout if token is expired, invalid, or unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token/user info instantly to prevent loop requests
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }

    return Promise.reject(error);
  }
);

export default api;
