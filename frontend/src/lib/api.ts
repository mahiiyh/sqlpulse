import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't logout for optional endpoints that may not have full permissions
      const optionalEndpoints = ['/queue/stats', '/queue/active', '/queue/failed'];
      const isOptionalEndpoint = optionalEndpoints.some(endpoint => url.includes(endpoint));
      
      if (!isOptionalEndpoint) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden - add user-friendly message
    if (error.response?.status === 403) {
      const originalMessage = error.response?.data?.message || 'Access denied';
      error.userMessage = originalMessage.includes('do not own') 
        ? 'You do not have permission to access this resource. It may belong to another user.'
        : originalMessage;
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
