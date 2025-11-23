import { apiRequest, apiRequestWithFiles } from './utils.js';

// TikTok API
export const tiktokAPI = {
  getAll: async () => {
    // Add nocache parameter to bypass cache for admin panel
    return apiRequest('/tiktok?nocache=true');
  },

  // Upload video file - returns { url: "https://...", thumbnail: "https://..." }
  upload: async (videoFile) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    return apiRequestWithFiles('/tiktok/upload', formData, 'POST');
  },

  // Upload thumbnail file - returns { url: "https://..." }
  uploadThumbnail: async (thumbnailFile) => {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);
    return apiRequestWithFiles('/tiktok/upload-thumbnail', formData, 'POST');
  },

  create: async (videoData) => {
    return apiRequest('/tiktok', {
      method: 'POST',
      body: videoData,
    });
  },

  update: async (id, videoData) => {
    return apiRequest(`/tiktok/${id}`, {
      method: 'PUT',
      body: videoData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/tiktok/${id}`, {
      method: 'DELETE',
    });
  },
};

