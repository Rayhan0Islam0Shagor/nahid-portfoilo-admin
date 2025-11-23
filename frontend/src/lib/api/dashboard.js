import { apiRequest } from './utils.js';

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/dashboard/stats');
  },

  getSalesStats: async (days = 30) => {
    return apiRequest(`/dashboard/sales-stats?days=${days}`);
  },

  getPaymentHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }

    const query = queryParams.toString();
    return apiRequest(`/dashboard/payment-history${query ? `?${query}` : ''}`);
  },
};

