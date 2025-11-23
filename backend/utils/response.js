/**
 * Response Utility
 * Centralized response formatting for consistent API responses
 * 
 * Provides standardized response formats for success and error cases
 * to ensure consistency across all API endpoints.
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 */
export const sendSuccess = (res, statusCode = 200, data = null, message = null) => {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {any} error - Error details (only in development)
 */
export const sendError = (res, statusCode = 500, message = 'Internal server error', error = null) => {
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error: error.message || error }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {object} res - Express response object
 * @param {string|array} errors - Validation error messages
 */
export const sendValidationError = (res, errors) => {
  const message = Array.isArray(errors) ? errors.join(', ') : errors;
  return sendError(res, 400, message);
};

/**
 * Send not found error response
 * @param {object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'Track', 'User')
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, 404, `${resource} not found`);
};

/**
 * Send unauthorized error response
 * @param {object} res - Express response object
 * @param {string} message - Custom error message
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

/**
 * Send forbidden error response
 * @param {object} res - Express response object
 * @param {string} message - Custom error message
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
};

