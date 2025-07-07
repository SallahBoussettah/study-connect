# Middleware

## What is Middleware?

Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application's request-response cycle. They can:

1. Execute any code
2. Modify request and response objects
3. End the request-response cycle
4. Call the next middleware in the stack

## How Middleware Works

Middleware functions are executed sequentially in the order they are added to the application. Each middleware can either:

- Pass control to the next middleware by calling `next()`
- End the request-response cycle by sending a response with methods like `res.send()`, `res.json()`, etc.
- Pass an error to Express's error handling middleware by calling `next(error)`

## Types of Middleware

1. **Application-level middleware**: Bound to the entire Express application
2. **Router-level middleware**: Bound to specific routes
3. **Error-handling middleware**: Handle errors that occur in the application
4. **Built-in middleware**: Provided by Express (e.g., `express.json()`)
5. **Third-party middleware**: External packages (e.g., `cors`, `multer`)   

## Examples from StudyConnect

### Authentication Middleware

```javascript
// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes - requires authentication
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5..."
      token = req.headers.authorization.split(' ')[1];
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id from decoded token
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Add user to request object so it's available in route handlers
      req.user = user;
      
      // Call next middleware
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware for role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has a role that's included in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`
      });
    }
    
    // User is authorized, proceed to next middleware
    next();
  };
};

module.exports = { protect, authorize };
```

### Error Handling Middleware

```javascript
// backend/middleware/error.js

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = 500;
  let message = 'Server Error';
  
  // Handle specific error types
  
  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }
  
  // Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'A record with that data already exists';
  }
  
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  // JWT expiration
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Custom error with status code
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
```

### File Upload Middleware

```javascript
// backend/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Set destination folder based on file type
  destination: function (req, file, cb) {
    let uploadPath;
    
    // Determine upload path based on file mimetype
    if (file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = 'uploads/documents';
    } else {
      uploadPath = 'uploads/other';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  // Set filename to be unique
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  }
});

module.exports = upload;
```

### Using Middleware in Express App

```javascript
// backend/server.js (simplified)

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error');

const app = express();

// Global middleware (applied to all routes)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cors()); // Enable CORS for all routes

// Route-specific middleware
app.use('/api/auth', authRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/subjects', subjectRoutes);

// 404 handler middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);
```

## Key Takeaways

1. **Request Processing Pipeline**: Middleware forms a pipeline that processes requests sequentially
2. **Modularity**: Allows breaking down complex logic into smaller, reusable functions
3. **Cross-Cutting Concerns**: Handles aspects that apply to multiple routes (authentication, logging, etc.)
4. **Flow Control**: Can pass control to the next middleware or end the request-response cycle
5. **Error Handling**: Can centralize error handling in dedicated middleware 