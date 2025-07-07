# JWT Authentication

## What is JWT?

JWT (JSON Web Token) is a compact, URL-safe way to represent claims between two parties. In web applications, it's commonly used for authentication and information exchange.

## How JWT Works

1. **User logs in**: Server verifies credentials and creates a JWT
2. **Token is sent to client**: Client stores the token (usually in localStorage)
3. **Client sends token with requests**: Token is included in the Authorization header
4. **Server validates token**: Server verifies the token signature and extracts user information

## JWT Structure

A JWT consists of three parts separated by dots:
- **Header**: Contains the token type and signing algorithm
- **Payload**: Contains claims (user data, permissions, expiration time)
- **Signature**: Used to verify the token hasn't been tampered with

Example: `xxxxx.yyyyy.zzzzz`

## Example from StudyConnect

### Creating a JWT Token (Login)

```javascript
// backend/controllers/authController.js (simplified)

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT token
    const token = user.getSignedJwtToken(
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE
    );
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Send response with token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};
```

### JWT Token Generation Method

```javascript
// backend/models/User.js (relevant part)

// Method to generate JWT token
User.prototype.getSignedJwtToken = function(secret, expiresIn) {
  return jwt.sign(
    { 
      id: this.id,    // User ID to identify the user
      role: this.role // User role for authorization checks
    }, 
    secret,           // Secret key to sign the token
    {
      expiresIn: expiresIn // Token expiration time
    }
  );
};
```

### Protecting Routes with JWT Middleware

```javascript
// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
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
      
      // Add user to request object
      req.user = user;
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
```

### Using the Auth Middleware in Routes

```javascript
// backend/routes/studyRoomRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const studyRoomController = require('../controllers/studyRoomController');

// Public routes - no authentication needed
router.get('/public', studyRoomController.getPublicRooms);

// Protected routes - authentication required
router.get('/', protect, studyRoomController.getUserRooms);
router.post('/', protect, studyRoomController.createRoom);
router.get('/:id', protect, studyRoomController.getRoomById);
router.put('/:id', protect, studyRoomController.updateRoom);
router.delete('/:id', protect, studyRoomController.deleteRoom);

module.exports = router;
```

## Key Takeaways

1. **Stateless Authentication**: JWT allows stateless authentication - the server doesn't need to store session data
2. **Secure**: JWTs are signed, so they can't be modified without detection
3. **Self-contained**: The token contains all the necessary user information
4. **Portable**: Works across different domains and services
5. **Expiration**: Tokens can be set to expire after a certain time for security 