import { apiRequest } from './utils.js';

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      // Store user info in localStorage for quick access
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }
    return response;
  },

  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

