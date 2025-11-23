import { apiRequest } from './utils.js';

// Contacts API
export const contactsAPI = {
  // Submit contact form (PUBLIC)
  submit: async (contactData) => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: contactData,
    });
  },

  // Get all contacts (ADMIN ONLY)
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.isRead !== undefined) {
      queryParams.append('isRead', filters.isRead);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    
    const query = queryParams.toString();
    return apiRequest(`/contacts${query ? `?${query}` : ''}`);
  },

  // Get single contact (ADMIN ONLY)
  getById: async (id) => {
    return apiRequest(`/contacts/${id}`);
  },
};

