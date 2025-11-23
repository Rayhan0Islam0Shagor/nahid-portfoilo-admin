import { apiRequest } from './utils.js';

// Sales API
export const salesAPI = {
  getAll: async () => {
    return apiRequest('/sales');
  },

  getByTrack: async (trackId) => {
    return apiRequest(`/sales/track/${trackId}`);
  },

  getById: async (id) => {
    return apiRequest(`/sales/${id}`);
  },

  create: async (saleData) => {
    return apiRequest('/sales', {
      method: 'POST',
      body: saleData,
    });
  },

  update: async (id, saleData) => {
    return apiRequest(`/sales/${id}`, {
      method: 'PUT',
      body: saleData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/sales/${id}`, {
      method: 'DELETE',
    });
  },
};

