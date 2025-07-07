# WebSockets

## What are WebSockets?

WebSockets are a communication protocol that provides full-duplex (two-way) communication channels over a single TCP connection. Unlike HTTP, which is request-response based, WebSockets allow continuous communication between client and server.

## How WebSockets Differ from HTTP

| HTTP | WebSockets |
|------|------------|
| Client initiates requests | Either side can send data |
| Each request needs a new connection | Persistent connection |
| Stateless | Stateful |
| Higher latency | Lower latency |
| Good for occasional interactions | Good for real-time applications |

## Use Cases for WebSockets

- Chat applications
- Live notifications
- Collaborative editing
- Real-time dashboards
- Online gaming
- Live tracking

## Socket.IO

Socket.IO is a library that enables real-time, bidirectional communication between web clients and servers. It uses WebSockets as its primary transport but can fall back to other methods if WebSockets aren't supported.

## Example from StudyConnect

### Backend Socket.IO Setup

```javascript
// backend/socket/index.js

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, UserPresence } = require('../models');

// Setup Socket.IO with the HTTP server
const setupSocket = (server) => {
  // Create a new Socket.IO instance
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Middleware to authenticate socket connections
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
      
      // Attach user to socket
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
  
  // Handle connection event
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
      
      // Handle joining study rooms
      socket.on('room:join', (roomId) => {
        socket.join(`room:${roomId}`);
        console.log(`${socket.user.id} joined room ${roomId}`);
        
        // Notify room that user joined
        socket.to(`room:${roomId}`).emit('room:userJoined', {
          roomId,
          user: socket.user
        });
      });
      
      // Handle leaving study rooms
      socket.on('room:leave', (roomId) => {
        socket.leave(`room:${roomId}`);
        console.log(`${socket.user.id} left room ${roomId}`);
        
        // Notify room that user left
        socket.to(`room:${roomId}`).emit('room:userLeft', {
          roomId,
          userId: socket.user.id
        });
      });
      
      // Handle chat messages
      socket.on('message:send', async (data) => {
        const { roomId, text } = data;
        
        // Save message to database
        const message = await saveMessageToDatabase(socket.user.id, roomId, text);
        
        // Broadcast message to room
        io.to(`room:${roomId}`).emit('message:received', {
          id: message.id,
          roomId,
          sender: socket.user,
          text,
          createdAt: message.createdAt
        });
      });
      
      // Handle direct messages
      socket.on('dm:send', async (data) => {
        const { recipientId, text } = data;
        
        // Save direct message to database
        const dm = await saveDirectMessageToDatabase(socket.user.id, recipientId, text);
        
        // Send to recipient
        io.to(`user:${recipientId}`).emit('dm:received', {
          id: dm.id,
          sender: socket.user,
          text,
          createdAt: dm.createdAt
        });
        
        // Also send back to sender
        socket.emit('dm:received', {
          id: dm.id,
          sender: socket.user,
          recipientId,
          text,
          createdAt: dm.createdAt
        });
      });
      
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
    } catch (error) {
      console.error('Socket error:', error);
    }
  });
  
  return io;
};

module.exports = { setupSocket };
```

### Frontend Socket.IO Service

```javascript
// src/services/socketService.js

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  // Initialize socket connection
  init(token) {
    if (this.socket) {
      this.disconnect();
    }
    
    // Create socket connection with authentication
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });
    
    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });
    
    return this.socket;
  }
  
  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
  
  // Join a study room
  joinRoom(roomId) {
    if (this.isConnected()) {
      this.socket.emit('room:join', roomId);
    }
  }
  
  // Leave a study room
  leaveRoom(roomId) {
    if (this.isConnected()) {
      this.socket.emit('room:leave', roomId);
    }
  }
  
  // Send a message to a room
  sendMessage(roomId, text) {
    if (this.isConnected()) {
      this.socket.emit('message:send', { roomId, text });
    }
  }
  
  // Send a direct message
  sendDirectMessage(recipientId, text) {
    if (this.isConnected()) {
      this.socket.emit('dm:send', { recipientId, text });
    }
  }
  
  // Subscribe to an event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
  
  // Unsubscribe from an event
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
  
  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
```

### Using Socket.IO in React Components

```jsx
// src/components/chat/ChatContainer.jsx (simplified)

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser } = useAuth();
  const [currentRoomId, setCurrentRoomId] = useState(null);
  
  // Set up socket event listeners
  useEffect(() => {
    // Listen for incoming messages
    socketService.on('message:received', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    // Clean up event listeners on unmount
    return () => {
      socketService.off('message:received');
    };
  }, []);
  
  // Join a room when currentRoomId changes
  useEffect(() => {
    if (currentRoomId) {
      // Join the room via socket
      socketService.joinRoom(currentRoomId);
      
      // Clean up when leaving the room
      return () => {
        socketService.leaveRoom(currentRoomId);
      };
    }
  }, [currentRoomId]);
  
  // Send a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && currentRoomId) {
      // Send message via socket
      socketService.sendMessage(currentRoomId, newMessage.trim());
      
      // Clear input field
      setNewMessage('');
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={msg.sender.id === currentUser.id ? 'my-message' : 'other-message'}
          >
            <div className="message-header">
              <img src={msg.sender.avatar || '/default-avatar.png'} alt="Avatar" />
              <span>{msg.sender.firstName} {msg.sender.lastName}</span>
            </div>
            <div className="message-body">{msg.text}</div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatContainer;
```

## Key Takeaways

1. **Real-time Communication**: WebSockets enable instant data exchange between clients and server
2. **Persistent Connection**: A single connection stays open, reducing overhead
3. **Bidirectional**: Both server and client can initiate communication
4. **Socket.IO**: Provides a reliable abstraction over WebSockets with fallbacks
5. **Event-Based**: Communication is organized around named events
6. **Room-Based**: Socket.IO's concept of rooms makes it easy to broadcast to specific groups 