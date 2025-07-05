import { io } from 'socket.io-client';
import callService from './callService';

class SocketService {
  constructor() {
    this.socket = null;
    this.chatSocket = null;
    this.connected = false;
    this.connecting = false;
    this.listeners = {};
    this.token = null;
    
    // Base URL for the Socket.IO server
    this.baseURL = 'http://localhost:5000';
  }
  
  /**
   * Initialize Socket.IO connection
   * @param {string} token - JWT auth token
   */
  init(token) {
    if (this.connecting) return;
    
    // Store token for reconnection attempts
    this.token = token;
    this.connecting = true;
    
    try {
      // Create main socket connection
      this.socket = io(this.baseURL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      
      // Create chat namespace connection
      this.chatSocket = io(`${this.baseURL}/chat`, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      
      // Extract user ID from token
      const userId = this._getUserIdFromToken(token);
      
      // Initialize call service if we have a user ID
      if (userId) {
        callService.init(token, userId);
      }
      
      // Set up connection event handlers
      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.connected = true;
        this.connecting = false;
      });
      
      this.chatSocket.on('connect', () => {
        console.log('Chat namespace connected');
      });
      
      // Handle errors
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.connecting = false;
        this.connected = false;
        
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect after connection error...');
          this.reconnect();
        }, 5000);
      });
      
      this.chatSocket.on('connect_error', (error) => {
        console.error('Chat socket connection error:', error.message);
      });
      
      // Handle disconnection
      this.socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        this.connected = false;
        
        // Attempt to reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            console.log('Attempting to reconnect socket...');
            this.reconnect();
          }, 1000);
        }
      });
      
      this.chatSocket.on('disconnect', (reason) => {
        console.log(`Chat socket disconnected: ${reason}`);
        
        // Attempt to reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server disconnected us, try to reconnect
          setTimeout(() => {
            console.log('Attempting to reconnect chat socket...');
            this.chatSocket.connect();
          }, 1000);
        }
      });
      
      // Set up error handling for both sockets
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      this.chatSocket.on('error', (error) => {
        console.error('Chat socket error:', error);
      });
      
      // Set up automatic reconnection check
      this.setupReconnectionCheck();
      
    } catch (error) {
      console.error('Error initializing socket:', error);
      this.connecting = false;
      
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect after initialization error...');
        this.reconnect();
      }, 5000);
    }
  }
  
  /**
   * Reconnect both sockets
   */
  reconnect() {
    if (!this.token || this.connecting) return;
    
    this.connecting = true;
    
    // Clean up existing connections if they exist
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }
    
    // Reinitialize with stored token
    this.init(this.token);
  }
  
  /**
   * Set up periodic check to ensure connection is alive
   */
  setupReconnectionCheck() {
    // Check connection every minute
    setInterval(() => {
      if (!this.connected && this.token && !this.connecting) {
        console.log('Connection check: Socket disconnected, attempting to reconnect...');
        this.reconnect();
      }
    }, 60000); // Every minute
  }
  
  /**
   * Join a chat room
   * @param {string} roomId - ID of the room to join
   */
  joinChatRoom(roomId) {
    if (!this.chatSocket || !this.connected) {
      console.error('Socket not connected. Cannot join room.');
      return;
    }
    
    this.chatSocket.emit('join-room', roomId);
  }
  
  /**
   * Leave a chat room
   * @param {string} roomId - ID of the room to leave
   */
  leaveChatRoom(roomId) {
    if (!this.chatSocket) return;
    
    this.chatSocket.emit('leave-room', roomId);
  }
  
  /**
   * Send a message to a room
   * @param {string} roomId - ID of the room
   * @param {string} content - Message content
   */
  sendMessage(roomId, content) {
    if (!this.chatSocket || !this.connected) {
      console.error('Socket not connected. Cannot send message.');
      return false;
    }
    
    this.chatSocket.emit('send-message', { roomId, content });
    return true;
  }
  
  /**
   * Join a direct chat with a friend
   * @param {string} friendId - ID of the friend
   */
  joinDirectChat(friendId) {
    if (!this.chatSocket || !this.connected) {
      console.error('Socket not connected. Cannot join direct chat.');
      return false;
    }
    
    this.chatSocket.emit('join-direct-chat', friendId);
    return true;
  }
  
  /**
   * Leave a direct chat with a friend
   * @param {string} friendId - ID of the friend
   */
  leaveDirectChat(friendId) {
    if (!this.chatSocket) return;
    
    this.chatSocket.emit('leave-direct-chat', friendId);
  }
  
  /**
   * Send a direct message to a friend
   * @param {string} friendId - ID of the friend
   * @param {string} content - Message content
   */
  sendDirectMessage(friendId, content) {
    if (!this.chatSocket || !this.connected) {
      console.error('Socket not connected. Cannot send direct message.');
      return false;
    }
    
    this.chatSocket.emit('send-direct-message', { friendId, content });
    return true;
  }
  
  /**
   * Mark messages from a friend as read
   * @param {string} friendId - ID of the friend
   */
  markMessagesAsRead(friendId) {
    if (!this.chatSocket) return;
    
    this.chatSocket.emit('mark-messages-read', friendId);
  }
  
  /**
   * Subscribe to notification events
   * @param {function} callback - Callback function to handle new notifications
   */
  subscribeToNotifications(callback) {
    if (!this.socket) return;
    
    // Remove any existing listeners to prevent duplicates
    this.socket.off('notification');
    
    // Add new listener
    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Format notification time if not already set
      if (!notification.timeAgo) {
        notification.timeAgo = 'Just now';
      }
      
      // Process friendship notifications
      if (notification.relatedType === 'friendship') {
        // Make sure the link is correct based on notification content
        if (notification.message.includes('sent you a friend request')) {
          notification.link = '/dashboard/friends/requests';
        } else if (notification.message.includes('accepted your friend request')) {
          notification.link = '/dashboard/friends';
        }
      }
      
      // Call the callback with the notification
      callback(notification);
    });
  }
  
  /**
   * Unsubscribe from notification events
   */
  unsubscribeFromNotifications() {
    if (!this.socket) return;
    
    this.socket.off('notification');
  }
  
  /**
   * Update user status in a room
   * @param {string} roomId - ID of the room
   * @param {string} status - User status (active, away, busy)
   */
  updateStatus(roomId, status) {
    if (!this.chatSocket) return;
    
    this.chatSocket.emit('update-status', { roomId, status });
  }
  
  /**
   * Register event listeners
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @param {boolean} useMainSocket - Whether to use main socket instead of chat socket
   */
  on(event, callback, useMainSocket = false) {
    const socket = useMainSocket ? this.socket : this.chatSocket;
    if (!socket) return;
    
    // Store callback reference for cleanup
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push({ callback, useMainSocket });
    socket.on(event, callback);
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function (optional, removes all if not provided)
   * @param {boolean} useMainSocket - Whether to use main socket instead of chat socket
   */
  off(event, callback, useMainSocket = false) {
    const socket = useMainSocket ? this.socket : this.chatSocket;
    if (!socket) return;
    
    if (callback && this.listeners[event]) {
      // Remove specific callback
      const index = this.listeners[event].findIndex(l => l.callback === callback && l.useMainSocket === useMainSocket);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
        socket.off(event, callback);
      }
    } else if (this.listeners[event]) {
      // Remove all callbacks for this event
      this.listeners[event].forEach(l => {
        const s = l.useMainSocket ? this.socket : this.chatSocket;
        if (s) {
          s.off(event, l.callback);
        }
      });
      this.listeners[event] = [];
    }
  }
  
  /**
   * Extract user ID from JWT token
   * @param {string} token - JWT token
   * @returns {string|null} - User ID or null if invalid
   * @private
   */
  _getUserIdFromToken(token) {
    try {
      // JWT tokens are in format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Return the user ID
      return payload.id || null;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }
  
  /**
   * Clean up and disconnect
   */
  disconnect() {
    // Clean up listeners
    if (this.socket) {
      for (const event in this.listeners) {
        this.listeners[event].forEach(l => {
          const s = l.useMainSocket ? this.socket : this.chatSocket;
          if (s) s.off(event, l.callback);
        });
      }
      
      // Close connections
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
    
    // Disconnect call service
    callService.disconnect();
    
    // Reset state
    this.connected = false;
    this.connecting = false;
    this.listeners = {};
    
    console.log('Socket service disconnected');
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 