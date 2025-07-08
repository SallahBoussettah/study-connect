# Node.js and Express Simplified 🚀

## What is Node.js?

Node.js is a JavaScript runtime that lets you run JavaScript code outside of a web browser. Think of it like:

- A **JavaScript engine** that runs on your computer instead of in a browser
- An **environment** for building server-side applications using JavaScript
- A **platform** that handles many connections simultaneously

Before Node.js, you needed different languages for frontend (JavaScript) and backend (PHP, Java, etc.). With Node.js, you can use JavaScript for both!

## What is Express?

Express is a framework for Node.js that makes building web applications easier. If Node.js is the engine of a car, Express is the steering wheel, pedals, and dashboard that help you control it.

Express helps you:
- Handle different HTTP requests (GET, POST, PUT, DELETE)
- Set up middleware for common tasks
- Define routes for your API endpoints
- Render HTML pages (though in StudyConnect, React handles this part)

## How They Work Together

```
┌─────────────────────────────────────────────────┐
│                    Node.js                      │
│  ┌─────────────────────────────────────────┐    │
│  │               Express                   │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │    │
│  │  │ Routes  │  │Middleware│  │Controllers│  │    │
│  │  └─────────┘  └─────────┘  └─────────┘  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## Two Key Examples from StudyConnect

### Example 1: Setting Up an Express Server

This example shows how StudyConnect sets up its Express server:

```javascript
// backend/server.js (simplified)

// Import required packages
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const http = require('http');
const { setupSocket } = require('./socket');

// Create Express application
const app = express();

// Set up middleware
app.use(cors());                         // Allow cross-origin requests
app.use(express.json());                 // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Set up routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/study-rooms', require('./routes/studyRoomRoutes'));
app.use('/api/flashcards', require('./routes/flashcardRoutes'));

// Create HTTP server using Express app
const server = http.createServer(app);

// Set up Socket.IO with the HTTP server
const io = setupSocket(server);

// Make io available to Express routes
app.set('io', io);

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to database
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
```

This code:
1. Creates an Express application
2. Sets up middleware for handling requests
3. Defines API routes
4. Creates an HTTP server with Express
5. Adds Socket.IO for real-time features
6. Connects to the database
7. Starts the server on a specified port

### Example 2: Creating API Routes and Handlers

This example shows how StudyConnect defines routes and connects them to controllers:

```javascript
// backend/routes/studyRoomRoutes.js (simplified)

const express = require('express');
const router = express.Router();
const studyRoomController = require('../controllers/studyRoomController');
const { protect } = require('../middleware/auth');

// GET all study rooms (requires authentication)
router.get('/', protect, studyRoomController.getAllRooms);

// GET a single study room by ID
router.get('/:id', protect, studyRoomController.getRoomById);

// POST create a new study room
router.post('/', protect, studyRoomController.createRoom);

// PUT update a study room
router.put('/:id', protect, studyRoomController.updateRoom);

// DELETE a study room
router.delete('/:id', protect, studyRoomController.deleteRoom);

// POST join a study room
router.post('/:id/join', protect, studyRoomController.joinRoom);

// POST leave a study room
router.post('/:id/leave', protect, studyRoomController.leaveRoom);

module.exports = router;
```

```javascript
// backend/controllers/studyRoomController.js (simplified example)

const { StudyRoom, User } = require('../models');

// Get all study rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.findAll({
      include: [{
        model: User,
        as: 'participants',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch study rooms',
      error: error.message
    });
  }
};

// Create a new study room
const createRoom = async (req, res) => {
  try {
    const { name, description, subject } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for the study room'
      });
    }
    
    // Create room
    const room = await StudyRoom.create({
      name,
      description,
      subject,
      createdBy: req.user.id  // From auth middleware
    });
    
    // Add creator as participant
    await room.addParticipant(req.user.id);
    
    // Get Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Emit event for real-time updates
      io.emit('room:created', {
        id: room.id,
        name: room.name,
        createdBy: req.user.id
      });
    }
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create study room',
      error: error.message
    });
  }
};

module.exports = {
  getAllRooms,
  createRoom,
  // Other controller functions...
};
```

This code shows:
1. How Express routes are defined with HTTP methods (GET, POST, PUT, DELETE)
2. How routes are connected to controller functions
3. How middleware (like `protect`) can be applied to routes
4. How controller functions handle requests and send responses
5. How real-time updates can be triggered using Socket.IO

## Key Features of Node.js

1. **Non-blocking I/O**: Can handle many connections without waiting for each one to complete
2. **Event-driven**: Uses events and callbacks to handle asynchronous operations
3. **NPM (Node Package Manager)**: Huge ecosystem of open-source packages
4. **JavaScript**: Same language on frontend and backend
5. **Fast**: Built on Chrome's V8 JavaScript engine

## Key Features of Express

1. **Routing**: Easy way to define API endpoints
2. **Middleware**: Plug-in functions that process requests
3. **Minimal**: Not opinionated, giving you freedom to structure your app
4. **HTTP Utility Methods**: Simplified handling of HTTP requests and responses
5. **Error Handling**: Built-in and custom error handling

## Common Express Middleware in StudyConnect

1. **express.json()**: Parses JSON request bodies
2. **express.urlencoded()**: Parses URL-encoded form data
3. **cors()**: Enables Cross-Origin Resource Sharing
4. **protect**: Custom middleware for authentication
5. **errorHandler**: Custom middleware for error handling

## Summary

- **Node.js** is a JavaScript runtime that allows you to run JavaScript on the server
- **Express** is a framework that simplifies building web applications with Node.js
- Together they form the backbone of StudyConnect's backend
- They handle API requests, database operations, and real-time communication
- The combination allows for a full JavaScript stack (MERN: MongoDB/MySQL, Express, React, Node.js) 