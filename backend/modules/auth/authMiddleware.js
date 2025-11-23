import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT token
 * Adds user info to req.user if token is valid
 */
export const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

/**
 * Optional authentication middleware
 * Adds user info to req.user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const token =
    req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key',
      );
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }
  next();
};

