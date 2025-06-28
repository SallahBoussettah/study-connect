const jwt = require('jsonwebtoken');
const models = require('../models');
const config = require('../config/config');

/**
 * Protect routes - Middleware to verify JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Get token from query params (for direct file downloads)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from the token (exclude password)
    const user = await models.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Set user in request object
    req.user = user;
    
    // Add models to request for controllers to use
    req.models = models;
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...String} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
}; 