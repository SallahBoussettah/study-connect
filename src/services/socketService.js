import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.chatSocket = null;
    this.connected = false;
    this.connecting = false;
    this.listeners = {};
    
    // Base URL for the Socket.IO server
    this.baseURL = 'http://localhost:5000';
  }
  
  /**
   * Initialize Socket.IO connection
   * @param {string} token - JWT auth token
   */
  init(token) {
    if (this.connecting || this.connected) return;
    
    this.connecting = true;
    
    try {
      // Create main socket connection
      this.socket = io(this.baseURL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      
      // Create chat namespace connection
      this.chatSocket = io(`${this.baseURL}/chat`, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      
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
      });
      
      this.chatSocket.on('connect_error', (error) => {
        console.error('Chat socket connection error:', error.message);
      });
      
      // Handle disconnection
      this.socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        this.connected = false;
      });
      
      this.chatSocket.on('disconnect', (reason) => {
        console.log(`Chat socket disconnected: ${reason}`);
      });
      
      // Set up error handling for both sockets
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      this.chatSocket.on('error', (error) => {
        console.error('Chat socket error:', error);
      });
      
    } catch (error) {
      console.error('Error initializing socket:', error);
      this.connecting = false;
    }
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
    
    this.socket.on('notification', callback);
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
   * Disconnect sockets
   */
  disconnect() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connected = false;
    this.connecting = false;
    this.listeners = {};
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 