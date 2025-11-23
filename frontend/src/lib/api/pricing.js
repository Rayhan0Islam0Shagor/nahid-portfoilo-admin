import { apiRequest } from './utils.js';

// Pricing API
export const pricingAPI = {
  getAll: async () => {
    return apiRequest('/pricing');
  },

  getById: async (id) => {
    return apiRequest(`/pricing/${id}`);
  },

  create: async (planData) => {
    return apiRequest('/pricing', {
      method: 'POST',
      body: planData,
    });
  },

  update: async (id, planData) => {
    return apiRequest(`/pricing/${id}`, {
      method: 'PUT',
      body: planData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/pricing/${id}`, {
      method: 'DELETE',
    });
  },
};

