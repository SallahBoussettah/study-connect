# Middleware Simplified

## What is Middleware? 🔄

Middleware is like a series of checkpoints that a request passes through before reaching its final destination. Think of it as security guards and helpers that:

1. Check if you're allowed to enter (authentication)
2. Process your information (parsing request body)
3. Validate your paperwork (input validation)
4. Log your visit (request logging)
5. Handle any problems that come up (error handling)

## How Middleware Works

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
                ↓             ↓
          Can modify      Can modify
          request         request/response
          or stop it      or stop it
```

Each middleware function can:
- Let the request continue to the next middleware (by calling `next()`)
- Stop the request and send back a response
- Modify the request or response objects

## Two Key Examples from StudyConnect

### Example 1: Authentication Middleware

This middleware checks if the user is logged in before allowing access to protected routes:

```javascript
// backend/middleware/auth.js (simplified)

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes - requires authentication
const protect = async (req, res, next) => {
  try {
    // Step 1: Check if token exists in the header
    if (!req.headers.authorization || 
        !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token'
      });
    }
    
    // Step 2: Get the token from the header
    const token = req.headers.authorization.split(' ')[1];
    
    // Step 3: Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Step 4: Find the user from the token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Step 5: Add user to request object
    req.user = user;
    
    // Step 6: Continue to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token'
    });
  }
};

// Example usage in routes:
// router.get('/profile', protect, userController.getProfile);
```

This middleware:
1. Checks if a token exists in the Authorization header
2. Verifies that the token is valid
3. Finds the user associated with the token
4. Adds the user object to the request so route handlers can access it
5. Allows the request to continue if everything is valid
6. Sends an error response if authentication fails

### Example 2: Error Handling Middleware

This middleware catches errors that occur during request processing:

```javascript
// backend/middleware/error.js (simplified)

// Error handling middleware - must be used after all other middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Set default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  
  // Handle specific error types
  
  // Database validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }
  
  // Database unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'That information is already in use';
  }
  
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  // Send error response to client
  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Example usage in Express app:
// app.use(errorHandler);
```

This middleware:
1. Catches errors thrown in route handlers or other middleware
2. Determines the appropriate status code and message
3. Formats errors consistently for the client
4. Includes extra debugging info in development mode
5. Sends the error response to the client

## How to Use Middleware in Express

There are three main ways to use middleware:

### 1. Application-Level Middleware
```javascript
// Apply to all routes
app.use(express.json());
```

### 2. Router-Level Middleware
```javascript
// Apply to specific routes
router.use(protect);
// OR
router.get('/profile', protect, userController.getProfile);
```

### 3. Error-Handling Middleware
```javascript
// Must be defined last
app.use(errorHandler);
```

## Common Types of Middleware in StudyConnect

1. **Body Parsing**: `express.json()` - Parses JSON request bodies
2. **Authentication**: `protect` - Verifies user is logged in
3. **Authorization**: `authorize(['admin'])` - Checks user permissions
4. **File Upload**: `multer` - Handles file uploads
5. **Error Handling**: `errorHandler` - Processes errors
6. **CORS**: `cors()` - Enables cross-origin requests

## Summary

- Middleware functions process requests before they reach route handlers
- They can modify the request/response objects or end the request cycle
- They execute in the order they're added to the application
- They help keep your code DRY by centralizing common functionality
- In StudyConnect, middleware handles authentication, error processing, and more 