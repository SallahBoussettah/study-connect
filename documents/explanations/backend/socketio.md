# Socket.IO (Backend)

## What is Socket.IO?

Socket.IO is a library that enables real-time, bidirectional communication between web clients and servers. It primarily uses WebSockets but can fall back to other methods like long-polling when WebSockets aren't supported.

## How Socket.IO Works on the Server

1. **Server Setup**: Socket.IO server attaches to an HTTP server
2. **Event-Based**: Communication happens through named events
3. **Rooms and Namespaces**: Clients can join "rooms" for targeted messaging
4. **Middleware**: Authentication and other processing can be applied to connections
5. **Broadcast**: Messages can be sent to specific clients, rooms, or everyone

## Example from StudyConnect

### Server Setup

```javascript
// backend/socket/index.js

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, UserPresence, Message } = require('../models');

// Setup Socket.IO with the HTTP server
const setupSocket = (server) => {
  // Create a new Socket.IO instance attached to the HTTP server
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  console.log('Socket.IO server initialized');
  
  return io;
};

module.exports = { setupSocket };
```

### Socket Authentication Middleware

```javascript
// backend/socket/index.js (continued)

const setupSocket = (server) => {
  const io = socketIO(server, {
    // CORS configuration...
  });
  
  // Middleware to authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket for later use
      socket.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });
  
  // Rest of socket setup...
  
  return io;
};
```

### Managing User Presence

```javascript
// backend/socket/index.js (continued)

// Inside setupSocket function after middleware setup
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  try {
    // Update user presence status to online
    await UserPresence.upsert({
      userId: socket.user.id,
      status: 'online',
      lastActivity: new Date()
    });
    
    // Broadcast to others that user is online
    socket.broadcast.emit('user:status', {
      userId: socket.user.id,
      status: 'online'
    });
    
    // Join user to their personal room for direct messages
    socket.join(`user:${socket.user.id}`);
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.id}`);
      
      // Update user presence status to offline
      await UserPresence.upsert({
        userId: socket.user.id,
        status: 'offline',
        lastActivity: new Date()
      });
      
      // Broadcast to others that user is offline
      socket.broadcast.emit('user:status', {
        userId: socket.user.id,
        status: 'offline'
      });
    });
    
    // More event handlers...
  } catch (error) {
    console.error('Socket error:', error);
  }
});
```

### Study Room Event Handlers

```javascript
// backend/socket/index.js (continued)

// Inside the io.on('connection') callback
// Handle joining study rooms
socket.on('room:join', async (roomId) => {
  // Join the socket to a room with the roomId
  socket.join(`room:${roomId}`);
  console.log(`${socket.user.id} joined room ${roomId}`);
  
  try {
    // Save to database that user joined the room
    await addUserToRoom(socket.user.id, roomId);
    
    // Notify room that user joined
    socket.to(`room:${roomId}`).emit('room:userJoined', {
      roomId,
      user: socket.user
    });
  } catch (error) {
    console.error(`Error joining room ${roomId}:`, error);
  }
});

// Handle leaving study rooms
socket.on('room:leave', async (roomId) => {
  // Remove socket from the room
  socket.leave(`room:${roomId}`);
  console.log(`${socket.user.id} left room ${roomId}`);
  
  try {
    // Save to database that user left the room
    await removeUserFromRoom(socket.user.id, roomId);
    
    // Notify room that user left
    socket.to(`room:${roomId}`).emit('room:userLeft', {
      roomId,
      userId: socket.user.id
    });
  } catch (error) {
    console.error(`Error leaving room ${roomId}:`, error);
  }
});
```

### Chat Message Handling

```javascript
// backend/socket/index.js (continued)

// Inside the io.on('connection') callback
// Handle chat messages in study rooms
socket.on('message:send', async (data) => {
  const { roomId, text } = data;
  
  try {
    // Validate the message
    if (!text || !roomId) {
      return;
    }
    
    // Save message to database
    const message = await Message.create({
      roomId,
      senderId: socket.user.id,
      text,
      type: 'room'
    });
    
    // Get the saved message with its ID
    const savedMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    // Broadcast message to everyone in the room (including sender)
    io.to(`room:${roomId}`).emit('message:received', {
      id: savedMessage.id,
      roomId,
      sender: socket.user,
      text,
      createdAt: savedMessage.createdAt
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
});
```

### Direct Messaging

```javascript
// backend/socket/index.js (continued)

// Inside the io.on('connection') callback
// Handle direct messages between users
socket.on('dm:send', async (data) => {
  const { recipientId, text } = data;
  
  try {
    // Validate the message
    if (!text || !recipientId) {
      return;
    }
    
    // Check if recipient exists
    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      socket.emit('dm:error', {
        message: 'Recipient not found'
      });
      return;
    }
    
    // Save direct message to database
    const dm = await Message.create({
      senderId: socket.user.id,
      recipientId,
      text,
      type: 'direct'
    });
    
    // Format message for sending
    const messageData = {
      id: dm.id,
      sender: socket.user,
      recipientId,
      text,
      createdAt: dm.createdAt
    };
    
    // Send to recipient if they're online
    io.to(`user:${recipientId}`).emit('dm:received', messageData);
    
    // Also send back to sender for UI update
    socket.emit('dm:received', messageData);
  } catch (error) {
    console.error('Error sending direct message:', error);
    socket.emit('dm:error', {
      message: 'Failed to send message'
    });
  }
});
```

### Typing Indicators

```javascript
// backend/socket/index.js (continued)

// Inside the io.on('connection') callback
// Handle typing indicators
socket.on('typing:start', (data) => {
  const { roomId } = data;
  
  if (!roomId) return;
  
  // Broadcast to room that user is typing
  socket.to(`room:${roomId}`).emit('typing:update', {
    roomId,
    userId: socket.user.id,
    firstName: socket.user.firstName,
    isTyping: true
  });
});

socket.on('typing:stop', (data) => {
  const { roomId } = data;
  
  if (!roomId) return;
  
  // Broadcast to room that user stopped typing
  socket.to(`room:${roomId}`).emit('typing:update', {
    roomId,
    userId: socket.user.id,
    firstName: socket.user.firstName,
    isTyping: false
  });
});
```

### Integrating with Express Server

```javascript
// backend/server.js

const express = require('express');
const http = require('http');
const { setupSocket } = require('./socket');

// Create Express app
const app = express();

// Create HTTP server using the Express app
const server = http.createServer(app);

// Set up Socket.IO with the HTTP server
const io = setupSocket(server);

// Store io instance on app for use in routes if needed
app.set('io', io);

// Express middleware and routes setup...

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Emitting Events from Express Routes

```javascript
// backend/controllers/studyRoomController.js (example)

const createRoom = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    // Create room in database
    const room = await StudyRoom.create({
      name,
      description,
      isPublic,
      createdBy: req.user.id
    });
    
    // Add creator as first participant
    await room.addParticipant(req.user.id, { 
      through: { role: 'admin' } 
    });
    
    // Get Socket.IO instance from app
    const io = req.app.get('io');
    
    // Emit event to notify interested clients about new room
    if (io) {
      io.emit('room:created', {
        id: room.id,
        name: room.name,
        description: room.description,
        isPublic: room.isPublic,
        createdBy: {
          id: req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      });
    }
    
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
```

## Key Takeaways

1. **Real-time Updates**: Socket.IO enables instant communication between server and clients
2. **Authentication**: Socket connections can be authenticated using JWT tokens
3. **Room-Based Communication**: Grouping sockets into rooms allows for targeted messaging
4. **Event-Driven Architecture**: Communication is organized around named events
5. **Integration with Express**: Socket.IO works alongside your REST API
6. **User Presence**: Track and broadcast user online/offline status
7. **Persistent Connections**: Maintain long-lived connections for immediate data delivery 