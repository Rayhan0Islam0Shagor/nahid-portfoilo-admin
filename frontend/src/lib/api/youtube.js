import { apiRequest, apiRequestWithFiles } from './utils.js';

// YouTube API
export const youtubeAPI = {
  getAll: async () => {
    // Add nocache parameter to bypass cache for admin panel
    return apiRequest('/youtube?nocache=true');
  },

  // Upload thumbnail file - returns { url: "https://..." }
  upload: async (thumbnailFile) => {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);
    return apiRequestWithFiles('/youtube/upload', formData, 'POST');
  },

  create: async (videoData) => {
    return apiRequest('/youtube', {
      method: 'POST',
      body: videoData,
    });
  },

  update: async (id, videoData) => {
    return apiRequest(`/youtube/${id}`, {
      method: 'PUT',
      body: videoData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/youtube/${id}`, {
      method: 'DELETE',
    });
  },
};

