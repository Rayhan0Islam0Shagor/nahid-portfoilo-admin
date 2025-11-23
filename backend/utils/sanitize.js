/**
 * Sanitization Utility
 * Input sanitization functions to prevent XSS, SQL injection, and other attacks
 * 
 * Provides functions to sanitize user input before storing in database
 */

/**
 * Sanitize string input - removes HTML tags and dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 1000)
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous characters that could be used for injection
  sanitized = sanitized.replace(/[<>'"&]/g, (match) => {
    const map = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return map[match] || match;
  });

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Sanitize email - validates and sanitizes email address
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed)) {
    return '';
  }

  // Remove any HTML tags
  return sanitizeString(trimmed, 255);
};

/**
 * Sanitize phone number - removes non-digit characters except +, -, spaces, parentheses
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Allow digits, +, -, spaces, parentheses
  let sanitized = phone.replace(/[^\d+\-() ]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > 20) {
    sanitized = sanitized.substring(0, 20);
  }

  return sanitized;
};

/**
 * Sanitize object - sanitizes all string fields in an object
 * @param {object} obj - Object to sanitize
 * @param {object} schema - Schema defining field types and max lengths
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj, schema = {}) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    const fieldSchema = schema[key] || {};

    if (typeof value === 'string') {
      if (fieldSchema.type === 'email') {
        sanitized[key] = sanitizeEmail(value);
      } else if (fieldSchema.type === 'phone') {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeString(value, fieldSchema.maxLength);
      }
    } else if (typeof value === 'number') {
      // Sanitize numbers - prevent NaN and Infinity
      if (isNaN(value) || !isFinite(value)) {
        continue;
      }
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Recursively sanitize array items
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item,
      );
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value, schema);
    }
  }

  return sanitized;
};

/**
 * Sanitize contact form data
 * @param {object} contactData - Contact form data
 * @returns {object} Sanitized contact data
 */
export const sanitizeContact = (contactData) => {
  const schema = {
    name: { type: 'string', maxLength: 100 },
    phoneNumber: { type: 'phone' },
    email: { type: 'email' },
    subject: { type: 'string', maxLength: 200 },
    message: { type: 'string', maxLength: 5000 },
  };

  return sanitizeObject(contactData, schema);
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  sanitizeContact,
};

