# Socket.IO Simplified 🔌

## What is Socket.IO?

Socket.IO is a library that enables real-time, two-way communication between web clients and servers. 

Think of it like a phone call, where both sides can talk at any time, rather than traditional HTTP which is more like sending letters back and forth.

## How Socket.IO Works

Traditional HTTP communication is one-way and disconnects after each request:
```
Client → Request → Server
Client ← Response ← Server
(Connection closes)
```

Socket.IO creates a persistent connection:
```
Client ⟷ Continuous Connection ⟷ Server
(Connection stays open for real-time messages)
```

Socket.IO uses an event-based system where both sides can:
- Emit events with data
- Listen for events from the other side
- Communicate with specific users or groups (rooms)

## Two Key Examples from StudyConnect

### Example 1: Setting Up Socket.IO on the Backend

```javascript
// backend/socket/index.js (simplified)

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Setup Socket.IO with the HTTP server
const setupSocket = (server) => {
  // Create Socket.IO instance attached to HTTP server
  const io = socketIO(server, {
    cors: {
      origin: 'http://localhost:3000', // Frontend URL
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      // Get token from connection handshake
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }
      
      // Verify token and get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user info to socket for later use
      socket.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };
      
      next(); // Allow connection
    } catch (error) {
      return next(new Error('Authentication failed'));
    }
  });
  
  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user to their personal room for direct messages
    socket.join(`user:${socket.user.id}`);
    
    // Handle chat messages in study rooms
    socket.on('message:send', async (data) => {
      const { roomId, text } = data;
      
      if (!text || !roomId) return;
      
      // Broadcast message to everyone in the room
      io.to(`room:${roomId}`).emit('message:received', {
        sender: socket.user,
        text,
        roomId,
        createdAt: new Date()
      });
    });
    
    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
  
  return io;
};

module.exports = { setupSocket };
```

This example:
1. Creates a Socket.IO server attached to the HTTP server
2. Authenticates users with JWT tokens
3. Sets up event handlers for messages
4. Organizes users into "rooms" for targeted messaging

### Example 2: Study Room Chat Implementation

```javascript
// backend/socket/index.js (continued)

// Inside io.on('connection') callback:

// Handle joining study rooms
socket.on('room:join', (roomId) => {
  // Add socket to room group
  socket.join(`room:${roomId}`);
  
  // Notify everyone in the room that a new user joined
  socket.to(`room:${roomId}`).emit('room:userJoined', {
    roomId,
    user: {
      id: socket.user.id,
      firstName: socket.user.firstName,
      lastName: socket.user.lastName,
      avatar: socket.user.avatar
    }
  });
  
  console.log(`${socket.user.firstName} joined room ${roomId}`);
});

// Handle leaving study rooms
socket.on('room:leave', (roomId) => {
  // Remove socket from room group
  socket.leave(`room:${roomId}`);
  
  // Notify everyone in the room that a user left
  socket.to(`room:${roomId}`).emit('room:userLeft', {
    roomId,
    userId: socket.user.id
  });
  
  console.log(`${socket.user.firstName} left room ${roomId}`);
});

// Handle chat messages
socket.on('message:send', async (data) => {
  const { roomId, text } = data;
  
  if (!text || !roomId) return;
  
  // Create message object
  const message = {
    id: generateId(), // Function to create unique ID
    sender: socket.user,
    text,
    roomId,
    createdAt: new Date()
  };
  
  // Send to everyone in the room (including sender)
  io.to(`room:${roomId}`).emit('message:received', message);
});
```

This example shows how Socket.IO handles:
1. Users joining specific study rooms
2. Sending notifications when users join/leave
3. Broadcasting chat messages to everyone in a room

## How Socket.IO Is Used in StudyConnect

Socket.IO powers these real-time features in StudyConnect:

1. **Chat in Study Rooms**: Students can chat in real-time during study sessions
2. **User Presence**: See who's online and active in study rooms
3. **Typing Indicators**: Show when someone is typing a message
4. **Notifications**: Instant alerts for new messages or study room invites
5. **Live Updates**: Real-time updates to flashcards, notes, or study materials

## Connecting Socket.IO with Express

```javascript
// backend/server.js (simplified)

const express = require('express');
const http = require('http');
const { setupSocket } = require('./socket');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with the HTTP server
const io = setupSocket(server);

// Make io available to Express routes
app.set('io', io);

// Start the server
server.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

## Summary

- Socket.IO enables real-time, bidirectional communication
- It maintains persistent connections between clients and server
- It uses an event-based system for sending and receiving data
- In StudyConnect, it powers chat, notifications, and live updates
- Socket.IO works alongside the REST API for a complete application 