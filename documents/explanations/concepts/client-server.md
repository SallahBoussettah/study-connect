# Client-Server Architecture

## What is Client-Server Architecture?

Client-server architecture is a computing model where tasks and workloads are divided between service providers (servers) and service requesters (clients). In web applications:

- **Client**: The user's device running a web browser or app that requests and displays data
- **Server**: A computer or system that stores, processes, and delivers data to clients

## How Client-Server Works in Web Applications

1. **Client makes a request**: User interacts with the frontend, triggering a request
2. **Server processes the request**: Backend receives the request, processes it, and accesses the database if needed
3. **Server sends a response**: Backend sends data or confirmation back to the client
4. **Client renders the response**: Frontend displays the data to the user

## StudyConnect's Client-Server Architecture

### Overview

StudyConnect follows a modern client-server architecture with:

- **Frontend (Client)**: React application running in the browser
- **Backend (Server)**: Express.js API server
- **Database**: PostgreSQL relational database
- **Real-time Communication**: WebSockets via Socket.IO

### Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Frontend     │◄───────►│     Backend     │◄───────►│    Database     │
│    (React)      │   HTTP  │   (Express.js)  │   SQL   │  (PostgreSQL)   │
│                 │         │                 │         │                 │
└────────┬────────┘         └────────┬────────┘         └─────────────────┘
         │                           │
         │                           │
         │                           │
         │         WebSockets        │
         └───────────────────────────┘
```

### Client (Frontend) Components

- **User Interface**: React components for rendering the UI
- **State Management**: React Context for managing application state
- **API Communication**: Axios for HTTP requests to the backend
- **Real-time Communication**: Socket.IO client for WebSocket connections

### Server (Backend) Components

- **API Endpoints**: Express.js routes for handling HTTP requests
- **Business Logic**: Controllers for processing requests
- **Data Access**: Sequelize ORM for database operations
- **Authentication**: JWT-based authentication middleware
- **Real-time Server**: Socket.IO server for WebSocket connections

## Example Flow in StudyConnect

### User Authentication Flow

```
┌─────────┐                           ┌─────────┐                        ┌─────────┐
│         │                           │         │                        │         │
│ Browser │                           │ Server  │                        │ Database│
│         │                           │         │                        │         │
└────┬────┘                           └────┬────┘                        └────┬────┘
     │                                     │                                  │
     │ 1. User enters email/password       │                                  │
     │ and clicks "Login"                  │                                  │
     │                                     │                                  │
     │ 2. POST /api/auth/login             │                                  │
     │ {email, password}                   │                                  │
     │ ────────────────────────────────►   │                                  │
     │                                     │ 3. Query user by email           │
     │                                     │ ─────────────────────────────►   │
     │                                     │                                  │
     │                                     │ 4. Return user data              │
     │                                     │ ◄─────────────────────────────   │
     │                                     │                                  │
     │                                     │ 5. Verify password               │
     │                                     │ Generate JWT token               │
     │                                     │                                  │
     │ 6. Return token and user data       │                                  │
     │ ◄────────────────────────────────   │                                  │
     │                                     │                                  │
     │ 7. Store token in localStorage      │                                  │
     │ Update UI to show logged in state   │                                  │
     │                                     │                                  │
     │ 8. Initialize WebSocket connection  │                                  │
     │ with token for authentication       │                                  │
     │ ────────────────────────────────►   │                                  │
     │                                     │                                  │
     │ 9. WebSocket connection established │                                  │
     │ ◄────────────────────────────────   │                                  │
     │                                     │                                  │
```

### Creating a Study Room Flow

```
┌─────────┐                           ┌─────────┐                        ┌─────────┐
│         │                           │         │                        │         │
│ Browser │                           │ Server  │                        │ Database│
│         │                           │         │                        │         │
└────┬────┘                           └────┬────┘                        └────┬────┘
     │                                     │                                  │
     │ 1. User fills out study room form   │                                  │
     │ and clicks "Create"                 │                                  │
     │                                     │                                  │
     │ 2. POST /api/study-rooms            │                                  │
     │ {name, description, isPublic, etc}  │                                  │
     │ ────────────────────────────────►   │                                  │
     │                                     │ 3. Validate request              │
     │                                     │ Check user authentication        │
     │                                     │                                  │
     │                                     │ 4. Create study room             │
     │                                     │ ─────────────────────────────►   │
     │                                     │                                  │
     │                                     │ 5. Return created room           │
     │                                     │ ◄─────────────────────────────   │
     │                                     │                                  │
     │ 6. Return created room data         │                                  │
     │ ◄────────────────────────────────   │                                  │
     │                                     │                                  │
     │ 7. Update UI to show new room       │                                  │
     │ Navigate to room detail page        │                                  │
     │                                     │                                  │
     │ 8. Join room via WebSocket          │                                  │
     │ ────────────────────────────────►   │                                  │
     │                                     │                                  │
     │ 9. Broadcast to other users         │                                  │
     │ that a new user joined the room     │                                  │
     │                                     │                                  │
```

## Code Examples from StudyConnect

### Frontend API Request (Client)

```javascript
// src/services/apiService.js (simplified)

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// Example of client making a request to server
const studyRoomService = {
  getAllRooms: () => api.get('/study-rooms'),
  getRoomById: (roomId) => api.get(`/study-rooms/${roomId}`),
  createRoom: (roomData) => api.post('/study-rooms', roomData)
};

export { api, studyRoomService };
```

### Backend API Endpoint (Server)

```javascript
// backend/routes/studyRoomRoutes.js (simplified)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const studyRoomController = require('../controllers/studyRoomController');

// Server handling requests from clients
router.get('/', protect, studyRoomController.getUserRooms);
router.post('/', protect, studyRoomController.createRoom);
router.get('/:id', protect, studyRoomController.getRoomById);
router.put('/:id', protect, studyRoomController.updateRoom);
router.delete('/:id', protect, studyRoomController.deleteRoom);

module.exports = router;
```

### Backend Controller (Server)

```javascript
// backend/controllers/studyRoomController.js (simplified)

const { StudyRoom, User } = require('../models');

// Server processing the request and interacting with the database
const createRoom = async (req, res) => {
  try {
    const { name, description, isPublic, maxParticipants, subject } = req.body;
    
    // Create room in database
    const room = await StudyRoom.create({
      name,
      description,
      isPublic,
      maxParticipants,
      subject,
      createdBy: req.user.id // From auth middleware
    });
    
    // Add creator as first participant
    await room.addParticipant(req.user.id, { 
      through: { role: 'admin' } 
    });
    
    // Return response to client
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

module.exports = { createRoom };
```

## Key Takeaways

1. **Separation of Concerns**: Frontend handles UI and user interaction, backend handles data processing and storage
2. **Scalability**: Client and server can scale independently based on demand
3. **Security**: Sensitive operations and data validation happen on the server
4. **Multiple Clients**: One server can serve many clients (web, mobile, etc.)
5. **API-Based Communication**: Standardized communication through HTTP APIs and WebSockets 