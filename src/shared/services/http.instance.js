import axios from 'axios';

// Base configuration for axios instance
const httpInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
httpInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to avoid cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
httpInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Specific error handling
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Expired or invalid token - clear auth and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Use dynamic import to avoid circular dependency
          const { useAuthStore } = await import('@/stores/auth.store');
          const authStore = useAuthStore();
          authStore.clearAuth();
          
          // Redirect to login
          window.location.href = '/auth/login';
          break;
          
        case 403:
          // Access denied
          console.error('Access denied:', data.message);
          break;
          
        case 404:
          // Resource not found
          console.error('Resource not found:', data.message);
          break;
          
        case 422:
          // Validation errors
          console.error('Validation errors:', data.errors);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('Unknown error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Configuration error
      console.error('Configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Utility methods
export const http = {
  // GET
  get: (url, config = {}) => httpInstance.get(url, config),
  
  // POST
  post: (url, data = {}, config = {}) => httpInstance.post(url, data, config),
  
  // PUT
  put: (url, data = {}, config = {}) => httpInstance.put(url, data, config),
  
  // PATCH
  patch: (url, data = {}, config = {}) => httpInstance.patch(url, data, config),
  
  // DELETE
  delete: (url, config = {}) => httpInstance.delete(url, config),
  
  // File upload
  upload: (url, formData, config = {}) => {
    return httpInstance.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // File download
  download: (url, config = {}) => {
    return httpInstance.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

// Export direct instance as well
export default httpInstance;

// Export types for TypeScript (if needed)
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
