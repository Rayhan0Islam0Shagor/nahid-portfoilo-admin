/**
 * Auth Module
 * Contains all authentication-related functionality
 */

// Export routes
export { default as authRoutes } from './authRoutes.js';

// Export middleware
export { authenticateToken, optionalAuth } from './authMiddleware.js';

// Export services
export { loginUser, getUserById, generateToken } from './authService.js';

// Export models
export { default as User } from './User.js';

