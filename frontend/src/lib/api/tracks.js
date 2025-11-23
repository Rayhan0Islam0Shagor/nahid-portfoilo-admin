import { apiRequest, apiRequestWithFiles } from './utils.js';

// Tracks API
export const tracksAPI = {
  getAll: async (category) => {
    // Add nocache parameter to bypass cache for admin panel
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('nocache', 'true');
    return apiRequest(`/tracks?${params.toString()}`);
  },

  getById: async (id) => {
    return apiRequest(`/tracks/${id}`);
  },

  // Get audio URL (requires purchase verification)
  // Returns: { audioUrl: "...", expiresAt: "..." }
  getAudioUrl: async (trackId, buyerEmail, purchaseToken) => {
    const queryParams = new URLSearchParams();
    if (buyerEmail) queryParams.append('email', buyerEmail);
    if (purchaseToken) queryParams.append('token', purchaseToken);

    const query = queryParams.toString();
    return apiRequest(`/tracks/${trackId}/audio${query ? `?${query}` : ''}`);
  },

  // Get audio stream URL (requires purchase verification)
  // Returns a streaming URL that proxies through the server
  // More secure than direct URL access - prevents direct download
  getAudioStreamUrl: (trackId, buyerEmail, purchaseToken) => {
    const queryParams = new URLSearchParams();
    if (buyerEmail) queryParams.append('email', buyerEmail);
    if (purchaseToken) queryParams.append('token', purchaseToken);

    const query = queryParams.toString();
    // Use same logic as utils.js for consistency
    const getApiBaseUrl = () => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
        return '/api';
      }
      return 'http://localhost:5000/api';
    };
    const API_BASE_URL = getApiBaseUrl();
    return `${API_BASE_URL}/tracks/${trackId}/audio/stream${
      query ? `?${query}` : ''
    }`;
  },

  // Upload thumbnail file - returns { url: "https://..." }
  uploadThumbnail: async (thumbnailFile) => {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);
    return apiRequestWithFiles('/tracks/upload/thumbnail', formData, 'POST');
  },

  // Upload audio file - returns { url: "https://..." }
  uploadAudio: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return apiRequestWithFiles('/tracks/upload/audio', formData, 'POST');
  },

  // Upload preview/short audio file - returns { url: "https://..." }
  uploadPreviewAudio: async (previewAudioFile) => {
    const formData = new FormData();
    formData.append('previewAudio', previewAudioFile);
    return apiRequestWithFiles('/tracks/upload/preview-audio', formData, 'POST');
  },

  create: async (trackData) => {
    return apiRequest('/tracks', {
      method: 'POST',
      body: trackData,
    });
  },

  update: async (id, trackData) => {
    return apiRequest(`/tracks/${id}`, {
      method: 'PUT',
      body: trackData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/tracks/${id}`, {
      method: 'DELETE',
    });
  },

  // Increment view count - returns { message: "...", views: number }
  incrementView: async (id) => {
    return apiRequest(`/tracks/${id}/view`, {
      method: 'POST',
    });
  },
};
