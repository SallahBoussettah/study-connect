# StudyConnect Backend Overview

## Table of Contents
1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [Node.js Platform](#nodejs-platform)
4. [Express.js Framework](#expressjs-framework)
5. [Project Architecture](#project-architecture)
6. [Routing System](#routing-system)
7. [Controllers](#controllers)
8. [Middleware](#middleware)
9. [Database Integration](#database-integration)
10. [Authentication & Authorization](#authentication--authorization)
11. [Real-time Communication](#real-time-communication)
12. [Error Handling](#error-handling)
13. [File Uploads](#file-uploads)
14. [Environment Configuration](#environment-configuration)
15. [API Endpoints](#api-endpoints)
16. [Conclusion](#conclusion)

## Introduction

The StudyConnect backend is a robust, scalable API server that powers the StudyConnect platform. It handles data persistence, authentication, real-time communication, and business logic for the application. Built with modern JavaScript technologies, the backend follows industry best practices for security, performance, and code organization.

## Technology Stack

The backend of StudyConnect is built with the following technologies:

- **Node.js**: JavaScript runtime for server-side execution
- **Express.js**: Web application framework for building APIs
- **PostgreSQL**: Relational database for data storage
- **Sequelize ORM**: Object-Relational Mapping for database interactions
- **Socket.IO**: Library for real-time, bidirectional communication
- **JWT (JSON Web Tokens)**: For secure authentication
- **Bcrypt**: For password hashing and security
- **Multer**: For handling file uploads
- **Node-Cache**: For in-memory caching to improve performance
- **Cors**: For handling Cross-Origin Resource Sharing
- **Dotenv**: For managing environment variables

## Node.js Platform

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that allows developers to run JavaScript on the server side. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.

### Key Node.js Concepts

1. **Event Loop**: The core mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It handles asynchronous operations efficiently.

2. **Modules**: Node.js uses the CommonJS module system, allowing code to be organized into reusable components. Modules are loaded using the `require()` function.

3. **NPM (Node Package Manager)**: The default package manager for Node.js that allows developers to install, share, and manage dependencies.

4. **Asynchronous Programming**: Node.js heavily relies on callbacks, promises, and async/await for handling asynchronous operations, making it highly scalable for I/O-bound applications.

5. **Single-Threaded Nature**: Node.js runs on a single thread but can handle many concurrent connections through its event loop, making it efficient for I/O-heavy applications.

## Express.js Framework

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies the process of building APIs by providing a thin layer of fundamental web application features.

### Key Express.js Concepts

1. **Middleware**: Functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle.

2. **Routing**: Mechanism to define how an application responds to client requests to specific endpoints (URIs) and HTTP methods.

3. **Request & Response Objects**: Enhanced HTTP request and response objects with additional properties and methods to simplify handling HTTP operations.

4. **Application Object**: The main Express application that is created by calling the express() function, which provides methods for routing HTTP requests, configuring middleware, rendering HTML views, and more.

5. **Router Object**: A mini Express application that can handle routes for a specific part of the site, allowing for modular route handling.

## Project Architecture

The StudyConnect backend follows a well-organized structure that separates concerns and promotes code maintainability:

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers for routes
├── middleware/      # Custom middleware functions
├── models/          # Database models (Sequelize)
├── routes/          # API route definitions
├── socket/          # Socket.IO event handlers
├── utils/           # Utility functions and helpers
├── uploads/         # Storage for uploaded files
├── migrations/      # Database migrations
├── seeders/         # Database seed data
├── .env             # Environment variables
└── server.js        # Application entry point
```

This architecture follows the Model-View-Controller (MVC) pattern, where:
- **Models**: Represent data structures and database interactions
- **Views**: In an API context, these are the JSON responses sent to clients
- **Controllers**: Handle incoming requests and return appropriate responses

## Routing System

Express.js routes determine how the application responds to client requests to specific endpoints (URIs) and HTTP methods (GET, POST, PUT, DELETE, etc.). In StudyConnect, routes are organized by feature and separated into different files for better maintainability.

### Route Structure

Routes in StudyConnect follow a RESTful API design pattern:

```javascript
const express = require('express');
const { register, login, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
```

Routes are organized by resource (auth, study-rooms, resources, etc.) and follow RESTful conventions:
- GET: Retrieve resources
- POST: Create new resources
- PUT/PATCH: Update existing resources
- DELETE: Remove resources

## Controllers

Controllers are responsible for handling incoming requests and returning appropriate responses. They contain the business logic of the application and interact with models to perform CRUD operations on the database.

### Controller Structure

Controllers in StudyConnect are organized by resource and follow a consistent pattern:

```javascript
/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });

    // Return token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};
```

Each controller function typically:
1. Extracts data from the request (body, params, query)
2. Performs validation and business logic
3. Interacts with the database through models
4. Returns an appropriate response with status code and data
5. Handles errors and passes them to error handling middleware

## Middleware

Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle. They can execute code, modify request and response objects, end the request-response cycle, or call the next middleware function.

### Types of Middleware in StudyConnect

1. **Authentication Middleware**: Verifies user tokens and attaches user information to the request object.

```javascript
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
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
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from the token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
```

2. **Error Handling Middleware**: Processes errors that occur during request handling.

3. **File Upload Middleware**: Handles file uploads using Multer.

4. **CORS Middleware**: Manages Cross-Origin Resource Sharing to allow requests from the frontend.

5. **Body Parsing Middleware**: Parses incoming request bodies and makes the data available in req.body.

## Database Integration

StudyConnect uses PostgreSQL as its database and Sequelize as the ORM (Object-Relational Mapping) layer. This combination provides a robust, scalable database solution with the convenience of working with JavaScript objects instead of raw SQL queries.

### Sequelize Models

Models in Sequelize define the structure of database tables and their relationships:

```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student'
    }
    // Additional fields...
  });

  // Define associations
  User.associate = (models) => {
    User.belongsToMany(models.StudyRoom, { through: models.UserStudyRoom });
    User.hasMany(models.Message);
    // Additional associations...
  };

  // Instance methods
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  User.prototype.getSignedJwtToken = function(secret, expiresIn) {
    return jwt.sign({ id: this.id }, secret, { expiresIn });
  };

  // Hooks
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  return User;
};
```

### Database Migrations and Seeders

StudyConnect uses Sequelize migrations to manage database schema changes and seeders to populate the database with initial data:

- **Migrations**: Define how to create, modify, or delete database tables and columns
- **Seeders**: Provide initial data for database tables

## Authentication & Authorization

StudyConnect implements a robust authentication and authorization system using JSON Web Tokens (JWT):

### Authentication Flow

1. **Registration**: User provides credentials and account information
2. **Password Hashing**: Password is securely hashed using bcrypt before storage
3. **Login**: User provides credentials, which are verified against stored data
4. **Token Generation**: Upon successful login, a JWT is generated and returned to the client
5. **Token Verification**: Protected routes verify the JWT before granting access

### Authorization

Role-based access control is implemented to restrict access to certain routes based on user roles:

```javascript
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
```

## Real-time Communication

StudyConnect implements real-time features using Socket.IO, enabling instant messaging, notifications, and collaborative features:

### Socket.IO Integration

Socket.IO is integrated into the Express application and provides:

1. **Real-time Messaging**: Instant message delivery in study rooms
2. **Presence Tracking**: Showing which users are online and active
3. **Notifications**: Real-time notifications for various events
4. **Collaborative Features**: Real-time updates for collaborative activities

### Socket Authentication

Socket connections are authenticated using the same JWT tokens used for REST API authentication, ensuring secure real-time communication.

## Error Handling

StudyConnect implements a centralized error handling system to provide consistent error responses:

```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    error.message = messages.join(', ');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = Object.keys(err.fields)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
```

## File Uploads

StudyConnect uses Multer for handling file uploads, allowing users to share resources and profile images:

```javascript
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

// Export middleware
exports.upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10485760 }, // Default 10MB
  fileFilter
});
```

## Environment Configuration

StudyConnect uses environment variables for configuration, allowing different settings for development, testing, and production environments:

```javascript
// .env file
DB_PASSWORD=SATOSANb6...
DB_USERNAME=postgres
DB_NAME=studyconnect
DB_HOST=127.0.0.1

PORT=5000
NODE_ENV=development

JWT_SECRET=studyconnect_jwt_secret_dev_key
JWT_EXPIRE=30d

FRONTEND_URL=http://localhost:3000

MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

These variables are loaded using the dotenv package and accessed throughout the application.

## API Endpoints

StudyConnect provides a comprehensive set of API endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - Logout user

### Study Room Endpoints
- `GET /api/study-rooms` - Get all study rooms
- `POST /api/study-rooms` - Create new study room
- `GET /api/study-rooms/:id` - Get single study room
- `PUT /api/study-rooms/:id` - Update study room
- `DELETE /api/study-rooms/:id` - Delete study room
- `POST /api/study-rooms/:id/join` - Join study room
- `POST /api/study-rooms/:id/leave` - Leave study room

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create new resource
- `GET /api/resources/:id` - Get single resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/study-rooms/:roomId/resources` - Get resources for a study room

### Message Endpoints
- `GET /api/study-rooms/:roomId/messages` - Get messages for a study room
- `POST /api/study-rooms/:roomId/messages` - Send message to study room

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get user dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity for user

## Conclusion

The StudyConnect backend is built with modern Node.js technologies and follows best practices for API development. The architecture is designed to be modular, maintainable, and scalable, providing a solid foundation for the application.

The use of Express.js, Sequelize ORM, Socket.IO, and other modern libraries enables a robust, secure, and performant backend that can handle complex business logic, real-time communication, and data persistence. The well-organized code structure, with clear separation of concerns, makes the codebase easier to understand and maintain. 