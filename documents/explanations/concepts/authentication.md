# Authentication Flow Simplified 🔐

## What is Authentication?

Authentication is like checking ID at the door of a club:
1. You claim to be someone (username/email)
2. You prove it (password)
3. You get a wristband (token) to show you're allowed in
4. You show your wristband each time you re-enter

In web applications, this means:
- **Registration**: Creating your ID
- **Login**: Getting your wristband (token)
- **Protected Routes**: Showing your wristband to access certain areas

## How JWT Authentication Works

StudyConnect uses JWT (JSON Web Token) authentication:

```
┌─────────┐                         ┌─────────┐
│ Browser │                         │ Server  │
└────┬────┘                         └────┬────┘
     │                                   │
     │ 1. Login with email/password      │
     │ ──────────────────────────────►   │
     │                                   │ 2. Verify credentials
     │                                   │    Generate JWT token
     │ 3. Store token in localStorage    │
     │ ◄──────────────────────────────   │
     │                                   │
     │ 4. Send request with token        │
     │ ──────────────────────────────►   │
     │                                   │ 5. Verify token
     │                                   │    Process request
     │ 6. Receive protected data         │
     │ ◄──────────────────────────────   │
     │                                   │
```

## Two Key Examples from StudyConnect

### Example 1: Login Process

When a user logs in to StudyConnect:

```javascript
// src/services/authService.js (Frontend)

const login = async (email, password) => {
  try {
    // 1. Send credentials to server
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    
    // 2. Store the JWT token
    localStorage.setItem('token', response.data.token);
    
    // 3. Store user info
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // 4. Return user data
    return response.data.user;
  } catch (error) {
    throw new Error(error.response.data.message || 'Login failed');
  }
};
```

```javascript
// backend/controllers/authController.js (Backend)

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 4. Send token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

### Example 2: Protecting Routes with Authentication Middleware

```javascript
// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in header
    if (!req.headers.authorization || 
        !req.headers.authorization.startsWith('Bearer')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token'
      });
    }
    
    // 2. Get the token from header
    const token = req.headers.authorization.split(' ')[1];
    
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Find the user from the token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // 5. Add user to request object
    req.user = user;
    
    // 6. Continue to the route handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token'
    });
  }
};
```

```javascript
// backend/routes/studyRoomRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const studyRoomController = require('../controllers/studyRoomController');

// Public routes - no authentication needed
router.get('/public', studyRoomController.getPublicRooms);

// Protected routes - require authentication
router.get('/', protect, studyRoomController.getAllRooms);
router.post('/', protect, studyRoomController.createRoom);
router.get('/:id', protect, studyRoomController.getRoomById);
router.put('/:id', protect, studyRoomController.updateRoom);
router.delete('/:id', protect, studyRoomController.deleteRoom);

module.exports = router;
```

## How Authentication is Used in StudyConnect

### Frontend Authentication Flow

1. **User Login/Registration**:
   - User enters credentials
   - Frontend sends request to backend
   - Backend validates and returns JWT token
   - Frontend stores token in localStorage

2. **Making Authenticated Requests**:
   - Frontend adds token to request headers
   - Backend validates token
   - Request proceeds if token is valid

3. **Auth Context**:
   - React Context provides authentication state to all components
   - Components can check if user is logged in
   - Components can access current user data

```javascript
// src/contexts/AuthContext.jsx (simplified)

import React, { createContext, useState, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if token exists in localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  // Context value
  const value = {
    currentUser,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
```

## Key Points to Remember

1. **JWT is Stateless**: The server doesn't need to store session information
2. **Tokens Expire**: JWTs have an expiration time for security
3. **Store Tokens Safely**: In StudyConnect, tokens are stored in localStorage
4. **Protect Sensitive Routes**: Use middleware to check for valid tokens
5. **Send Token with Requests**: Include token in Authorization header

## Summary

- Authentication verifies user identity using credentials
- JWT provides a secure way to maintain user sessions
- Frontend stores the token and sends it with each request
- Backend validates the token before processing protected requests
- React Context makes authentication state available throughout the app 