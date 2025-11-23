/**
 * Validation Utility
 * Centralized validation functions for request data
 * 
 * Provides reusable validation functions to ensure data consistency
 * and reduce code duplication across the application.
 */

import { TRACK_CATEGORIES, GALLERY_HEIGHTS, PAYMENT_STATUSES } from './constants.js';

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate that URL is not base64 data
 * @param {string} url - URL to validate
 * @returns {boolean} True if not base64
 */
export const isNotBase64 = (url) => {
  if (!url || typeof url !== 'string') return false;
  return !url.startsWith('data:');
};

/**
 * Validate track category
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid category
 */
export const isValidTrackCategory = (category) => {
  if (!category || typeof category !== 'string') return false;
  return TRACK_CATEGORIES.includes(category.trim());
};

/**
 * Validate gallery height
 * @param {string} height - Height to validate
 * @returns {boolean} True if valid height
 */
export const isValidGalleryHeight = (height) => {
  if (!height || typeof height !== 'string') return false;
  return GALLERY_HEIGHTS.includes(height.trim());
};

/**
 * Validate payment status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
export const isValidPaymentStatus = (status) => {
  if (!status || typeof status !== 'string') return false;
  return PAYMENT_STATUSES.includes(status.trim());
};

/**
 * Validate positive number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  if (value === undefined || value === null) return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate required string (non-empty after trim)
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid non-empty string
 */
export const isValidRequiredString = (value) => {
  return value !== undefined && typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate date string
 * @param {any} date - Date to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export default {
  isValidEmail,
  isValidUrl,
  isNotBase64,
  isValidTrackCategory,
  isValidGalleryHeight,
  isValidPaymentStatus,
  isValidPositiveNumber,
  isValidRequiredString,
  isValidDate,
  isValidObjectId,
};

