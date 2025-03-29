import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for 401 (Unauthorized) errors
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const business = {
  getProfile: () => api.get('/business/profile'),
  updateProfile: (data) => api.put('/business/profile', data),
  getAnalytics: () => api.get('/business/analytics'),
  getRecommendations: () => api.get('/business/recommendations'),
  getBulkRequests: () => api.get('/business/bulk-requests'),
  createBulkRequest: (data) => api.post('/business/bulk-requests', data),
  getScheduledPickups: () => api.get('/business/scheduled-pickups'),
  createScheduledPickup: (data) => api.post('/business/scheduled-pickups', data),
  getRequests: () => api.get('/waste-requests'),
  getRequestById: (id) => api.get(`/waste-requests/${id}`),
  updateRequestStatus: (id, status) => api.patch(`/waste-requests/${id}/status`, { status }),
  getStatusCounts: () => api.get('/waste-requests/status-counts')
};

export const expenses = {
  getExpenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getExpenseAnalytics: () => api.get('/expenses/analytics')
};

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

export const wasteRequests = {
  create: (requestData) => api.post('/waste-requests', requestData),
  getResidentRequests: () => api.get('/waste-requests/resident'),
  updateStatus: (requestId, status) => api.patch(`/waste-requests/${requestId}/status`, { status }),
  getStatusCounts: () => api.get('/waste-requests/status-counts'),
};

export const wasteTips = {
  getAll: () => api.get('/waste-tips'),
};

export const collector = {
  getAssignedRequests: () => api.get('/collector/assigned-requests'),
  updateRequestStatus: (requestId, status) => api.patch(`/collector/requests/${requestId}/status`, { status }),
  updateLocation: (location) => api.post('/collector/location', location),
  getAnalytics: (timeFrame) => api.get(`/collector/analytics?timeFrame=${timeFrame}`),
  exportAnalytics: (timeFrame) => api.get(`/collector/analytics/export?timeFrame=${timeFrame}`, {
    responseType: 'blob'
  }),
  getHistory: (dateRange, status) => api.get('/collector/history', {
    params: {
      startDate: dateRange.start,
      endDate: dateRange.end,
      status
    }
  }),
  exportHistory: (dateRange) => api.get('/collector/history/export', {
    params: {
      startDate: dateRange.start,
      endDate: dateRange.end
    },
    responseType: 'blob'
  }),
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/collector/profile', profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 