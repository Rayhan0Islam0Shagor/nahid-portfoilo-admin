import { apiRequest, apiRequestWithFiles } from './utils.js';

// Gallery API
export const galleryAPI = {
  getAll: async (options = {}) => {
    // Add nocache parameter to bypass cache for admin panel
    const params = new URLSearchParams();
    params.append('nocache', 'true');
    
    // Pagination parameters
    if (options.page) {
      params.append('page', options.page.toString());
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    // Legacy support for category (if needed)
    if (options.category) {
      params.append('category', options.category);
    }
    
    return apiRequest(`/gallery?${params.toString()}`);
  },

  getById: async (id) => {
    return apiRequest(`/gallery/${id}`);
  },

  // Upload image file - returns { url: "https://..." }
  upload: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiRequestWithFiles('/gallery/upload', formData, 'POST');
  },

  create: async (imageData) => {
    return apiRequest('/gallery', {
      method: 'POST',
      body: imageData,
    });
  },

  update: async (id, imageData) => {
    return apiRequest(`/gallery/${id}`, {
      method: 'PUT',
      body: imageData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },
};

