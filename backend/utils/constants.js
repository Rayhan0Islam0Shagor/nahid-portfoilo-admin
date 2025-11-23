/**
 * Application Constants
 * Centralized constants for the application
 * 
 * All magic numbers, strings, and configuration values should be defined here
 * to ensure consistency and easy maintenance.
 */

// File upload limits
export const FILE_LIMITS = {
  THUMBNAIL_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AUDIO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  BODY_MAX_SIZE: 50 * 1024 * 1024, // 50MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
  AUDIO_EXTENSIONS: ['mp3', 'wav', 'm4a', 'ogg'],
};

// Track categories
export const TRACK_CATEGORIES = [
  'Rock',
  'Folk',
  'Hip-Hop',
  'Jazz & Blues',
  'Modern Song',
  'Classical',
];

// Gallery image heights
export const GALLERY_HEIGHTS = ['small', 'medium', 'large', 'xlarge'];

// Payment statuses
export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Cloudinary folders
export const CLOUDINARY_FOLDERS = {
  TRACKS_THUMBNAILS: 'nahid-admin/tracks/thumbnails',
  TRACKS_AUDIO: 'nahid-admin/tracks/audio',
  GALLERY: 'nahid-admin/gallery',
};

// JWT token expiration
export const TOKEN_EXPIRATION = {
  DEFAULT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  AUDIO_URL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'Invalid file type',
  CLOUDINARY_CONFIG_MISSING: 'Cloudinary configuration is missing',
  PURCHASE_REQUIRED: 'You must purchase this track to access the audio file',
  PURCHASE_VERIFICATION_REQUIRED: 'Purchase verification required',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  UPLOADED: 'File uploaded successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
};

export default {
  FILE_LIMITS,
  ALLOWED_FILE_TYPES,
  TRACK_CATEGORIES,
  GALLERY_HEIGHTS,
  PAYMENT_STATUSES,
  USER_ROLES,
  CLOUDINARY_FOLDERS,
  TOKEN_EXPIRATION,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

