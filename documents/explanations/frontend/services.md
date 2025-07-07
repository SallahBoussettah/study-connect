# Frontend Services

## What are Frontend Services?

Frontend services are JavaScript modules that handle external interactions and business logic, such as API calls, WebSocket connections, or complex data transformations. They help separate concerns in your application by extracting this logic from your UI components.

## Benefits of Using Services

1. **Separation of Concerns**: Keep UI components focused on rendering and user interaction
2. **Reusability**: Use the same service across multiple components
3. **Testability**: Test business logic independently from UI
4. **Maintainability**: Easier to update API endpoints or change implementation details

## Examples from StudyConnect

### API Service

```javascript
// src/services/apiService.js

import axios from 'axios';

// Base API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in all requests
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

// User-related API calls
const userService = {
  // Get current user profile
  getCurrentUser: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/password', passwordData)
};

// Study room API calls
const studyRoomService = {
  // Get all study rooms
  getAllRooms: () => api.get('/study-rooms'),
  
  // Get rooms the user has joined
  getUserRooms: () => api.get('/study-rooms/joined'),
  
  // Get a specific room by ID
  getRoomById: (roomId) => api.get(`/study-rooms/${roomId}`),
  
  // Create a new study room
  createRoom: (roomData) => api.post('/study-rooms', roomData),
  
  // Update a study room
  updateRoom: (roomId, roomData) => api.put(`/study-rooms/${roomId}`, roomData),
  
  // Join a study room
  joinRoom: (roomId) => api.post(`/study-rooms/${roomId}/join`),
  
  // Leave a study room
  leaveRoom: (roomId) => api.post(`/study-rooms/${roomId}/leave`),
  
  // Delete a study room
  deleteRoom: (roomId) => api.delete(`/study-rooms/${roomId}`)
};

// Flashcard API calls
const flashcardService = {
  // Get all flashcard decks
  getAllDecks: () => api.get('/flashcards/decks'),
  
  // Get a specific deck by ID
  getDeckById: (deckId) => api.get(`/flashcards/decks/${deckId}`),
  
  // Create a new flashcard deck
  createDeck: (deckData) => api.post('/flashcards/decks', deckData),
  
  // Add a card to a deck
  addCard: (deckId, cardData) => api.post(`/flashcards/decks/${deckId}/cards`, cardData),
  
  // Update a card
  updateCard: (cardId, cardData) => api.put(`/flashcards/cards/${cardId}`, cardData),
  
  // Delete a card
  deleteCard: (cardId) => api.delete(`/flashcards/cards/${cardId}`),
  
  // Share a deck with another user
  shareDeck: (deckId, userData) => api.post(`/flashcards/decks/${deckId}/share`, userData)
};

export { api, userService, studyRoomService, flashcardService };
```

### Socket Service

```javascript
// src/services/socketService.js

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }
  
  // Initialize socket connection with authentication token
  init(token) {
    if (this.socket) {
      this.disconnect();
    }
    
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    // Create socket connection with auth token
    this.socket = io(SOCKET_URL, {
      auth: { token }
    });
    
    // Set up connection event handlers
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
  
  // Send a direct message to a user
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

### Notification Service

```javascript
// src/services/notificationService.js

import { api } from './apiService';
import socketService from './socketService';

class NotificationService {
  constructor() {
    this.callbacks = {
      onNewNotification: null,
      onNotificationRead: null
    };
    this.initialized = false;
  }
  
  // Initialize notification listeners
  init() {
    if (this.initialized) return;
    
    // Listen for real-time notifications via socket
    socketService.on('notification:new', (notification) => {
      if (this.callbacks.onNewNotification) {
        this.callbacks.onNewNotification(notification);
      }
    });
    
    socketService.on('notification:read', (notificationId) => {
      if (this.callbacks.onNotificationRead) {
        this.callbacks.onNotificationRead(notificationId);
      }
    });
    
    this.initialized = true;
  }
  
  // Set callback for new notifications
  onNewNotification(callback) {
    this.callbacks.onNewNotification = callback;
  }
  
  // Set callback for read notifications
  onNotificationRead(callback) {
    this.callbacks.onNotificationRead = callback;
  }
  
  // Get all notifications for current user
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }
  
  // Mark a notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }
  
  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }
  
  // Clean up event listeners
  cleanup() {
    socketService.off('notification:new');
    socketService.off('notification:read');
    this.initialized = false;
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;
```

### Using Services in Components

```jsx
// src/components/dashboard/StudyRooms.jsx (simplified)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyRoomService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const StudyRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Fetch study rooms using the service
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await studyRoomService.getAllRooms();
        setRooms(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching study rooms:', err);
        setError('Failed to load study rooms');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, []);
  
  const handleJoinRoom = async (roomId) => {
    try {
      await studyRoomService.joinRoom(roomId);
      
      // Update the rooms list to show the user has joined
      setRooms(rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            isJoined: true,
            participants: [...room.participants, currentUser]
          };
        }
        return room;
      }));
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    }
  };
  
  const handleLeaveRoom = async (roomId) => {
    try {
      await studyRoomService.leaveRoom(roomId);
      
      // Update the rooms list to show the user has left
      setRooms(rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            isJoined: false,
            participants: room.participants.filter(p => p.id !== currentUser.id)
          };
        }
        return room;
      }));
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
    }
  };
  
  if (loading) return <div>Loading study rooms...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="study-rooms-container">
      <h1>Study Rooms</h1>
      
      <Link to="/dashboard/rooms/create" className="create-button">
        Create New Room
      </Link>
      
      <div className="room-list">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <p>{room.description}</p>
            <p>Participants: {room.participants.length}</p>
            
            <div className="room-actions">
              <Link to={`/dashboard/rooms/${room.id}`}>
                View Details
              </Link>
              
              {room.isJoined ? (
                <button onClick={() => handleLeaveRoom(room.id)}>
                  Leave Room
                </button>
              ) : (
                <button onClick={() => handleJoinRoom(room.id)}>
                  Join Room
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyRooms;
```

## Key Takeaways

1. **Separation of Concerns**: Services separate data fetching and business logic from UI components
2. **Reusability**: Services can be used across multiple components
3. **Centralized API Logic**: API endpoints and authentication logic are defined in one place
4. **Singleton Pattern**: Services are often implemented as singletons for consistent state
5. **Abstraction**: Services hide implementation details from components 