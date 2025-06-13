const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, UserPresence, Message, StudyRoom } = require('../models');
const config = require('../config/config');
const { Op } = require('sequelize');

// In-memory cache for active users in rooms to reduce DB queries
const activeRoomUsersCache = new Map();

// Cache expiration time for room users (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Socket.io setup
function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: config.cors.origin || "*",
      methods: ["GET", "POST"],
      credentials: config.cors.credentials || false
    }
  });
  
  console.log('Socket.IO server initialized');
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      if (!decoded || !decoded.id) {
        return next(new Error('Invalid authentication token'));
      }
      
      // Store the user ID in the socket object
      socket.userId = decoded.id;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error('Authentication failed'));
    }
  });

  // Create chat namespace
  const chatNamespace = io.of('/chat');
  
  // Apply authentication middleware to chat namespace
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      if (!decoded || !decoded.id) {
        return next(new Error('Invalid authentication token'));
      }
      
      // Store the user ID in the socket object
      socket.userId = decoded.id;
      
      next();
    } catch (error) {
      console.error('Chat namespace authentication error:', error.message);
      return next(new Error('Authentication failed'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(`User connected to chat: ${socket.userId}`);
    
    // Join a study room chat
    socket.on('join-room', async (roomId) => {
      try {
        const userId = socket.userId;
        
        if (!userId || !roomId) {
          socket.emit('error', 'Invalid user ID or room ID');
          return;
        }
        
        // Join socket room
        socket.join(`room:${roomId}`);
        
        // Get user info from cache or database
        let user = null;
        const cacheKey = `user:${userId}`;
        const cachedUser = global.userCache ? global.userCache.get(cacheKey) : null;
        
        if (cachedUser) {
          user = cachedUser;
        } else {
          user = await User.findByPk(userId, {
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          });
          
          if (global.userCache) {
            global.userCache.set(cacheKey, user);
          }
        }
        
        if (!user) {
          socket.emit('error', 'User not found');
          return;
        }
        
        // Update user presence in memory cache first
        let roomUsers = activeRoomUsersCache.get(roomId) || [];
        const userIndex = roomUsers.findIndex(u => u.id === userId);
        
        const userPresence = {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
          status: 'active',
          lastActive: new Date()
        };
        
        if (userIndex >= 0) {
          roomUsers[userIndex] = userPresence;
        } else {
          roomUsers.push(userPresence);
        }
        
        // Update room users cache
        activeRoomUsersCache.set(roomId, roomUsers);
        
        // Update presence in database less frequently
        const presence = await UserPresence.findOne({
          where: { userId, roomId }
        });
        
        if (presence) {
          await presence.update({
            isOnline: true,
            lastActive: new Date()
          });
        } else {
          await UserPresence.create({
            userId,
            roomId,
            isOnline: true,
            status: 'active',
            lastActive: new Date()
          });
        }
        
        // Get active users from cache
        socket.emit('room-users', activeRoomUsersCache.get(roomId) || []);
        
        // Broadcast to room that user joined
        socket.to(`room:${roomId}`).emit('user-joined', userPresence);
        
        // Update room active members count
        updateRoomActiveMembers(roomId);
        
        console.log(`User ${userId} joined room ${roomId} chat`);
      } catch (error) {
        console.error('Error joining room chat:', error);
        socket.emit('error', 'Failed to join room chat');
      }
    });
    
    // Leave a study room chat
    socket.on('leave-room', async (roomId) => {
      try {
        const userId = socket.userId;
        
        // Leave socket room
        socket.leave(`room:${roomId}`);
        
        // Update presence in cache
        let roomUsers = activeRoomUsersCache.get(roomId) || [];
        activeRoomUsersCache.set(
          roomId,
          roomUsers.filter(user => user.id !== userId)
        );
        
        // Update presence in database asynchronously
        UserPresence.findOne({
          where: { userId, roomId }
        }).then(presence => {
          if (presence) {
            presence.update({ isOnline: false });
          }
        });
        
        // Broadcast to room that user left
        socket.to(`room:${roomId}`).emit('user-left', { userId });
        
        // Update room active members count
        updateRoomActiveMembers(roomId);
        
        console.log(`User ${userId} left room ${roomId} chat`);
      } catch (error) {
        console.error('Error leaving room chat:', error);
      }
    });
    
    // Send a message
    socket.on('send-message', async ({ roomId, content }) => {
      try {
        const userId = socket.userId;
        
        if (!content || !content.trim()) {
          socket.emit('error', 'Message content is required');
          return;
        }
        
        // Get user information from cache
        let user = null;
        const cacheKey = `user:${userId}`;
        const cachedUser = global.userCache ? global.userCache.get(cacheKey) : null;
        
        if (cachedUser) {
          user = cachedUser;
        } else {
          user = await User.findByPk(userId, {
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          });
          
          if (global.userCache) {
            global.userCache.set(cacheKey, user);
          }
        }
        
        if (!user) {
          socket.emit('error', 'User not found');
          return;
        }
        
        // Create message in database
        const message = await Message.create({
          content,
          roomId,
          senderId: userId,
          isSystem: false
        });
        
        // Update room last active asynchronously
        StudyRoom.update(
          { lastActive: new Date() },
          { where: { id: roomId } }
        );
        
        // Format message for sending
        const formattedMessage = {
          id: message.id,
          content: message.content,
          isSystem: message.isSystem,
          timestamp: message.createdAt,
          sender: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar
          }
        };
        
        // Update user's last active timestamp in cache
        let roomUsers = activeRoomUsersCache.get(roomId) || [];
        const userIndex = roomUsers.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          roomUsers[userIndex].lastActive = new Date();
        }
        
        // Broadcast message to room
        chatNamespace.to(`room:${roomId}`).emit('new-message', formattedMessage);
        
        console.log(`User ${userId} sent message to room ${roomId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;
        console.log(`User disconnecting: ${userId}`);
        
        // Mark user as offline in all rooms they were active in
        for (const [roomId, users] of activeRoomUsersCache.entries()) {
          if (users.some(user => user.id === userId)) {
            // Remove user from room cache
            activeRoomUsersCache.set(
              roomId,
              users.filter(user => user.id !== userId)
            );
            
            // Broadcast to room that user left
            chatNamespace.to(`room:${roomId}`).emit('user-left', { userId });
            
            // Update room active members count
            updateRoomActiveMembers(roomId);
          }
        }
        
        // Update all presence records for this user to offline (asynchronously)
        UserPresence.update(
          { isOnline: false },
          { where: { userId } }
        );
        
        console.log(`User disconnected: ${userId}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  // Helper function to update room active members count
  async function updateRoomActiveMembers(roomId) {
    try {
      // Use cached data instead of querying the database every time
      const activeUsers = (activeRoomUsersCache.get(roomId) || []).filter(user => {
        // Consider users active if they've interacted within the last 5 minutes
        return new Date() - new Date(user.lastActive) < 5 * 60 * 1000;
      });
      
      // Update room active members count
      await StudyRoom.update(
        { activeMembers: activeUsers.length },
        { where: { id: roomId } }
      );
      
      console.log(`Room ${roomId}: Updated to ${activeUsers.length} active members`);
    } catch (error) {
      console.error('Error updating room active members count:', error);
    }
  }

  // Set up a periodic job to clean up inactive users from cache
  setInterval(() => {
    const now = new Date();
    
    // Clean up inactive users from the cache
    for (const [roomId, users] of activeRoomUsersCache.entries()) {
      const activeUsers = users.filter(user => {
        return now - new Date(user.lastActive) < CACHE_EXPIRATION;
      });
      
      if (activeUsers.length !== users.length) {
        activeRoomUsersCache.set(roomId, activeUsers);
        updateRoomActiveMembers(roomId);
      }
    }
  }, 60000); // Run every minute

  return io;
}

module.exports = { setupSocket }; 