import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8000"
});

// ════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR - Add token to every request
// ════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR - Handle 401/403 errors
// ════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend returns 401 (Unauthorized) or 403 (Forbidden), clear auth
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;