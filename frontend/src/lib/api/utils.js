// Determine API base URL
// Priority: 1. VITE_API_URL env var, 2. Relative path /api (for Vercel), 3. localhost (dev only)
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (or when not in dev), use relative path for same-domain deployments
  // This works for Vercel where frontend and backend are on the same domain
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  // Development: use localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Helper function to handle token expiration
const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Helper function to make API requests with timeout and better error handling
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  let timeoutId = null;

  try {
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    config.signal = controller.signal;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      handleTokenExpiration();
      throw new Error(
        data.message || 'Authentication failed. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (error.name === 'AbortError') {
      throw new Error(
        'Request timeout. Please check your connection and try again.',
      );
    }

    if (error.message) {
      throw error;
    }

    throw new Error('Network error. Please check your connection.');
  }
};

// Helper function for file uploads with timeout and better error handling
export const apiRequestWithFiles = async (
  endpoint,
  formData,
  method = 'POST',
) => {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    credentials: 'include',
    body: formData,
  };

  // Create abort controller for timeout (longer timeout for file uploads)
  const controller = new AbortController();
  let timeoutId = null;

  try {
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT * 2); // 60 seconds for file uploads
    config.signal = controller.signal;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      handleTokenExpiration();
      throw new Error(
        data.message || 'Authentication failed. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Upload failed with status ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (error.name === 'AbortError') {
      throw new Error(
        'Upload timeout. Please check your connection and try again.',
      );
    }

    if (error.message) {
      throw error;
    }

    throw new Error('Network error. Please check your connection.');
  }
};
