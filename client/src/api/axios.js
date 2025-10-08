import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to avoid caching issues for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, data?.message || error.message);
      
      // Auto logout if 401 Unauthorized or 403 Forbidden
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          // Use setTimeout to avoid potential React state updates during render
          setTimeout(() => {
            window.location.href = '/login?session=expired';
          }, 100);
        }
      }
      
      // Return a more structured error
      return Promise.reject({
        message: data?.message || 'An error occurred',
        status: status,
        data: data,
        isAxiosError: true
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', 'No response received from server');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
        isNetworkError: true
      });
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message);
      return Promise.reject({
        message: 'Request configuration error',
        status: 0
      });
    }
  }
);

// Helper methods for common API calls
export const api = {
  // GET request
  get: (url, params = {}) => instance.get(url, { params }),
  
  // POST request
  post: (url, data = {}) => instance.post(url, data),
  
  // PUT request
  put: (url, data = {}) => instance.put(url, data),
  
  // DELETE request
  delete: (url) => instance.delete(url),
  
  // PATCH request
  patch: (url, data = {}) => instance.patch(url, data),
};

// Authentication helpers
export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // Get stored user data
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  
  // Set authentication data
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get auth headers (for manual requests)
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // Check if token is about to expire (optional enhancement)
  isTokenExpiring: () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      return (exp - now) < bufferTime;
    } catch {
      return true;
    }
  }
};

// Resource-specific API methods
export const resourcesAPI = {
  getAll: (filters = {}) => instance.get('/resources', { params: filters }),
  getById: (id) => instance.get(`/resources/${id}`),
  create: (data) => instance.post('/resources', data),
  update: (id, data) => instance.put(`/resources/${id}`, data),
  delete: (id) => instance.delete(`/resources/${id}`),
  checkAvailability: (id, data) => instance.post(`/resources/${id}/availability`, data),
  getAnalytics: (id) => instance.get(`/resources/${id}/analytics`),
  getTypes: () => instance.get('/resources/types')
};

// Booking-specific API methods
export const bookingsAPI = {
  getAll: (filters = {}) => instance.get('/bookings', { params: filters }),
  getById: (id) => instance.get(`/bookings/${id}`),
  create: (data) => instance.post('/bookings', data),
  cancel: (id, reason) => instance.put(`/bookings/${id}/cancel`, { reason }),
  updateStatus: (id, status, notes) => instance.put(`/bookings/${id}/status`, { status, notes }),
  checkIn: (id, notes) => instance.put(`/bookings/${id}/checkin`, { notes }),
  getAnalytics: (filters = {}) => instance.get('/bookings/analytics/overview', { params: filters })
};

// Auth-specific API method
export const authAPI = {
  login: (credentials) => instance.post('/auth/login', credentials),
  register: (userData) => instance.post('/auth/register', userData),
  getMe: () => instance.get('/auth/me'),
  updateProfile: (data) => instance.put('/auth/profile', data),
  changePassword: (data) => instance.put('/auth/password', data),
  logout: () => instance.get('/auth/logout')
};

// User-specific API methods (optional enhancement
export const usersAPI = {
  getAll: (filters = {}) => instance.get('/auth/users', { params: filters }),
  getById: (id) => instance.get(`/auth/users/${id}`),
  update: (id, data) => instance.put(`/auth/users/${id}`, data),
  delete: (id) => instance.delete(`/auth/users/${id}`)
};

export default instance;