# Authentication Flow

## What is Authentication?

Authentication is the process of verifying the identity of a user or system. In web applications, it typically involves:

1. **Registration**: Creating a new user account
2. **Login**: Verifying credentials to access the system
3. **Authorization**: Determining what actions a user can perform
4. **Session Management**: Maintaining the user's authenticated state

## JWT Authentication

StudyConnect uses JWT (JSON Web Token) authentication, which is a stateless authentication method that works as follows:

1. User provides credentials (email/password)
2. Server verifies credentials and generates a JWT
3. JWT is sent to the client and stored (usually in localStorage)
4. Client includes JWT in subsequent requests
5. Server validates the JWT to authenticate the user

## Authentication Flow in StudyConnect

### Registration Flow

```
┌───────────┐                          ┌───────────┐                          ┌───────────┐
│           │                          │           │                          │           │
│  Client   │                          │  Server   │                          │ Database  │
│           │                          │           │                          │           │
└─────┬─────┘                          └─────┬─────┘                          └─────┬─────┘
      │                                      │                                      │
      │  1. User fills registration form     │                                      │
      │                                      │                                      │
      │  2. POST /api/auth/register          │                                      │
      │  {firstName, lastName, email, ...}   │                                      │
      │ ─────────────────────────────────►   │                                      │
      │                                      │                                      │
      │                                      │  3. Validate input                   │
      │                                      │  Check if email exists               │
      │                                      │ ─────────────────────────────────►   │
      │                                      │                                      │
      │                                      │  4. Email available                  │
      │                                      │ ◄─────────────────────────────────   │
      │                                      │                                      │
      │                                      │  5. Hash password                    │
      │                                      │                                      │
      │                                      │  6. Create user                      │
      │                                      │ ─────────────────────────────────►   │
      │                                      │                                      │
      │                                      │  7. User created                     │
      │                                      │ ◄─────────────────────────────────   │
      │                                      │                                      │
      │                                      │  8. Generate JWT token               │
      │                                      │                                      │
      │  9. Return token and user data       │                                      │
      │ ◄─────────────────────────────────   │                                      │
      │                                      │                                      │
      │  10. Store token in localStorage     │                                      │
      │  Update UI to logged-in state        │                                      │
      │                                      │                                      │
```

### Login Flow

```
┌───────────┐                          ┌───────────┐                          ┌───────────┐
│           │                          │           │                          │           │
│  Client   │                          │  Server   │                          │ Database  │
│           │                          │           │                          │           │
└─────┬─────┘                          └─────┬─────┘                          └─────┬─────┘
      │                                      │                                      │
      │  1. User enters email/password       │                                      │
      │                                      │                                      │
      │  2. POST /api/auth/login             │                                      │
      │  {email, password}                   │                                      │
      │ ─────────────────────────────────►   │                                      │
      │                                      │                                      │
      │                                      │  3. Find user by email               │
      │                                      │ ─────────────────────────────────►   │
      │                                      │                                      │
      │                                      │  4. Return user data                 │
      │                                      │ ◄─────────────────────────────────   │
      │                                      │                                      │
      │                                      │  5. Compare password hash            │
      │                                      │                                      │
      │                                      │  6. Generate JWT token               │
      │                                      │                                      │
      │  7. Return token and user data       │                                      │
      │ ◄─────────────────────────────────   │                                      │
      │                                      │                                      │
      │  8. Store token in localStorage      │                                      │
      │  Update UI to logged-in state        │                                      │
      │                                      │                                      │
      │  9. Initialize WebSocket connection  │                                      │
      │  with token for authentication       │                                      │
      │ ─────────────────────────────────►   │                                      │
      │                                      │                                      │
```

### Authenticated Request Flow

```
┌───────────┐                          ┌───────────┐                          ┌───────────┐
│           │                          │           │                          │           │
│  Client   │                          │  Server   │                          │ Database  │
│           │                          │           │                          │           │
└─────┬─────┘                          └─────┬─────┘                          └─────┬─────┘
      │                                      │                                      │
      │  1. User performs action             │                                      │
      │  (e.g., create study room)           │                                      │
      │                                      │                                      │
      │  2. POST /api/study-rooms            │                                      │
      │  Headers: {Authorization: Bearer JWT}│                                      │
      │  Body: {room data}                   │                                      │
      │ ─────────────────────────────────►   │                                      │
      │                                      │                                      │
      │                                      │  3. Verify JWT token                 │
      │                                      │                                      │
      │                                      │  4. Extract user ID from token       │
      │                                      │                                      │
      │                                      │  5. Find user in database            │
      │                                      │ ─────────────────────────────────►   │
      │                                      │                                      │
      │                                      │  6. Return user data                 │
      │                                      │ ◄─────────────────────────────────   │
      │                                      │                                      │
      │                                      │  7. Process request with user context│
      │                                      │                                      │
      │                                      │  8. Create study room                │
      │                                      │ ─────────────────────────────────►   │
      │                                      │                                      │
      │                                      │  9. Return created room              │
      │                                      │ ◄─────────────────────────────────   │
      │                                      │                                      │
      │  10. Return response                 │                                      │
      │ ◄─────────────────────────────────   │                                      │
      │                                      │                                      │
      │  11. Update UI with new room         │                                      │
      │                                      │                                      │
```

## Code Examples from StudyConnect

### Backend: User Model with Password Hashing

```javascript
// backend/models/User.js (relevant parts)

'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // User model fields...
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student'
    }
    // Other fields...
  }, {
    hooks: {
      // Hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash password before updating
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Method to check if password matches
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Method to generate JWT token
  User.prototype.getSignedJwtToken = function(secret, expiresIn) {
    return jwt.sign(
      { 
        id: this.id,
        role: this.role 
      }, 
      secret, 
      {
        expiresIn: expiresIn
      }
    );
  };

  // Associations and other model code...

  return User;
};
```

### Backend: Authentication Controller

```javascript
// backend/controllers/authController.js (simplified)

const { User } = require('../models');

// Register a new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user (password hashing happens in model hooks)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    
    // Generate JWT token
    const token = user.getSignedJwtToken(
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE || '30d'
    );
    
    // Return success response with token and user data
    res.status(201).json({
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
    res.status(400).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
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
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = user.getSignedJwtToken(
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE || '30d'
    );
    
    // Return success response with token and user data
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

// Get current user
const getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        institution: user.institution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
```

### Backend: Authentication Middleware

```javascript
// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - require authentication
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

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'undefined'} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### Frontend: Authentication Context

```jsx
// src/contexts/AuthContext.jsx (simplified)

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

const API_URL = 'http://localhost:5000/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add interceptor to add auth token to requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Initialize socket connection
  const initializeSocket = (token) => {
    socketService.init(token);
  };

  // Check if user is already logged in when app loads
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          // Set user from stored info initially
          setCurrentUser(JSON.parse(userInfo));
          
          // Initialize socket connection
          initializeSocket(token);
          
          // Verify token with backend
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              // Update user info from server data
              const userData = response.data.data;
              localStorage.setItem('userInfo', JSON.stringify(userData));
              setCurrentUser(userData);
            }
          } catch (err) {
            // If token is invalid, logout user
            console.error('Token validation failed:', err);
            logout();
          }
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      // Initialize socket connection
      initializeSocket(token);
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      // Initialize socket connection
      initializeSocket(token);
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Disconnect socket
    socketService.disconnect();
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    api
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
```

## Key Takeaways

1. **JWT-Based Authentication**: Stateless authentication using signed tokens
2. **Password Security**: Passwords are hashed before storage using bcrypt
3. **Role-Based Authorization**: Different user roles (student, teacher, admin) with different permissions
4. **Token Storage**: Client stores tokens in localStorage for persistent authentication
5. **Context API**: Frontend uses React Context to share authentication state across components 