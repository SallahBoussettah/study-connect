# Frontend Services Simplified

## What are Services? 🛠️

Think of services as helpers that do specific jobs for your app. They handle things like:
- Talking to your backend API
- Managing WebSocket connections
- Storing and retrieving data
- Handling complex logic

Services keep your React components clean by moving complex code out of them. This way, your components can focus on what they do best: showing the user interface.

## Why Use Services?

Imagine you need to fetch user data in 10 different components. You have two options:

**Option 1 (Without Services):** Copy the same API call code in all 10 components 😱

**Option 2 (With Services):** Create one service that handles the API call, and use it in all 10 components 👍

Services make your code:
- **DRY** (Don't Repeat Yourself)
- **Easier to maintain** (change API URL in one place, not 10)
- **More testable** (test the service separately from components)

## Two Key Examples from StudyConnect

### Example 1: API Service

This service handles all communication with the backend API:

```javascript
// src/services/apiService.js (simplified)

import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Study room API calls
const studyRoomService = {
  // Get all study rooms
  getAllRooms: () => api.get('/study-rooms'),
  
  // Get a specific room by ID
  getRoomById: (roomId) => api.get(`/study-rooms/${roomId}`),
  
  // Create a new study room
  createRoom: (roomData) => api.post('/study-rooms', roomData),
  
  // Join a study room
  joinRoom: (roomId) => api.post(`/study-rooms/${roomId}/join`)
};

export { api, studyRoomService };
```

**How it's used in a component:**

```jsx
// src/components/StudyRoomList.jsx
import { studyRoomService } from '../services/apiService';
import { useState, useEffect } from 'react';

function StudyRoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Use the service to fetch data
    async function fetchRooms() {
      try {
        const response = await studyRoomService.getAllRooms();
        setRooms(response.data.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRooms();
  }, []);
  
  // Rest of component...
}
```

### Example 2: Socket Service

This service manages real-time communication:

```javascript
// src/services/socketService.js (simplified)

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  // Initialize socket connection with authentication token
  init(token) {
    // Create socket connection with auth token
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });
    
    // Set up connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });
    
    return this.socket;
  }
  
  // Join a study room
  joinRoom(roomId) {
    if (this.connected && this.socket) {
      this.socket.emit('room:join', roomId);
    }
  }
  
  // Send a message to a room
  sendMessage(roomId, text) {
    if (this.connected && this.socket) {
      this.socket.emit('message:send', { roomId, text });
    }
  }
  
  // Subscribe to an event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
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

**How it's used in a component:**

```jsx
// src/components/ChatRoom.jsx
import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    // Join the room when component mounts
    socketService.joinRoom(roomId);
    
    // Listen for incoming messages
    socketService.on('message:received', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    // Clean up when component unmounts
    return () => {
      socketService.off('message:received');
    };
  }, [roomId]);
  
  const sendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage(roomId, newMessage);
      setNewMessage('');
    }
  };
  
  // Rest of component...
}
```

## When to Create a Service

Create a service when you have:

1. **Code that talks to external systems** (APIs, WebSockets, localStorage)
2. **Logic used in multiple components**
3. **Complex business logic** that makes components hard to understand

## Service Design Patterns

1. **Singleton Services** - One instance shared throughout the app
   ```javascript
   const service = new Service();
   export default service;
   ```

2. **Module Services** - Collection of related functions
   ```javascript
   export const userService = { getUser, updateUser };
   ```

## Summary

- Services separate business logic and external communication from UI components
- They make your code more maintainable and reusable
- Two main types in StudyConnect:
  - API services for backend communication
  - Socket service for real-time features
- Use services whenever you need to access external systems or share logic 