import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check for token in query string (for specific use cases)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // Verify token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. This token is no longer valid.'
        });
      }

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact administrator.'
        });
      }

      // Add user activity timestamp (optional enhancement)
      req.user.lastActive = new Date();
      await req.user.save({ validateBeforeSave: false });

      next();
    } catch (jwtError) {
      // Specific JWT error handling
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          expired: true
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token.',
          invalid: true
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Please log in again.'
        });
      }
    }
  } catch (error) {
    console.error('🔐 Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication server error. Please try again later.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization check.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. ${req.user.role} role cannot access this resource. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Convenience middleware for common roles
export const admin = authorize('admin');
export const user = authorize('user');
export const adminOrSelf = (req, res, next) => {
  const requestedUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === requestedUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access forbidden. Admin access or ownership required.'
  });
};

// Optional: Rate limiting middleware for auth endpoints
export const authLimiter = (req, res, next) => {
  // Simple in-memory rate limiter for auth endpoints
  const authLimit = new Map();
  const ip = req.ip;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // 5 attempts per window
  
  if (!authLimit.has(ip)) {
    authLimit.set(ip, { count: 1, startTime: Date.now() });
    return next();
  }

  const window = authLimit.get(ip);
  
  if (Date.now() - window.startTime > windowMs) {
    // Reset for new window
    window.count = 1;
    window.startTime = Date.now();
    authLimit.set(ip, window);
    return next();
  }

  window.count++;
  
  if (window.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.'
    });
  }

  authLimit.set(ip, window);
  next();
};