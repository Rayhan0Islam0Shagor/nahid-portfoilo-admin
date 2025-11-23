/**
 * Logger Utility
 * Centralized logging system for the application
 * 
 * Provides consistent logging across the application with different log levels
 * and proper formatting for development and production environments.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel =
  process.env.LOG_LEVEL === 'error'
    ? LOG_LEVELS.ERROR
    : process.env.LOG_LEVEL === 'warn'
      ? LOG_LEVELS.WARN
      : process.env.LOG_LEVEL === 'info'
        ? LOG_LEVELS.INFO
        : process.env.NODE_ENV === 'production'
          ? LOG_LEVELS.INFO
          : LOG_LEVELS.DEBUG;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 * @returns {string} Formatted log message
 */
const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
};

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {Error|object} error - Error object or additional data
   */
  error: (message, error = null) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      if (error instanceof Error) {
        console.error(formatMessage('error', message, {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          name: error.name,
        }));
      } else {
        console.error(formatMessage('error', message, error));
      }
    }
  },

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {object} data - Additional data
   */
  warn: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {object} data - Additional data
   */
  info: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(formatMessage('info', message, data));
    }
  },

  /**
   * Log debug messages (only in development)
   * @param {string} message - Debug message
   * @param {object} data - Additional data
   */
  debug: (message, data = null) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(formatMessage('debug', message, data));
    }
  },
};

export default logger;

