const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, UserPresence, Message, StudyRoom, DirectMessage, Friendship } = require('../models');
const config = require('../config/config');
const { Op } = require('sequelize');

// In-memory cache for active users in rooms to reduce DB queries
const activeRoomUsersCache = new Map();
// In-memory cache for online users
const onlineUsersCache = new Map();
// In-memory cache for active calls in rooms
const activeCallsCache = new Map();
// In-memory cache for users in calls
const callParticipantsCache = new Map();

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
  
  // Store io instance globally for emitNotification function
  global.io = io;
  
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

  // Create call namespace for WebRTC signaling
  const callNamespace = io.of('/call');
  
  // Apply authentication middleware to call namespace
  callNamespace.use(async (socket, next) => {
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
      console.error('Call namespace authentication error:', error.message);
      return next(new Error('Authentication failed'));
    }
  });

  // Handle main socket connection
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);
    
    try {
      // Get user info
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      });
      
      if (!user) {
        socket.disconnect();
        return;
      }
      
      // Add user to online users cache
      onlineUsersCache.set(userId, {
        id: userId,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        socketId: socket.id,
        lastActive: new Date()
      });
      
      // Notify friends that user is online
      const friendships = await Friendship.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      });
      
      // Extract friend IDs
      const friendIds = friendships.map(friendship => 
        friendship.senderId === userId ? friendship.receiverId : friendship.senderId
      );
      
      // Emit online status to friends
      friendIds.forEach(friendId => {
        const friendSocketId = onlineUsersCache.get(friendId)?.socketId;
        if (friendSocketId) {
          io.to(friendSocketId).emit('friend-online', {
            friendId: userId,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar
          });
        }
      });
      
      // Send online friends to the user
      const onlineFriends = friendIds
        .filter(id => onlineUsersCache.has(id))
        .map(id => {
          const friend = onlineUsersCache.get(id);
          return {
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar
          };
        });
      
      socket.emit('online-friends', onlineFriends);
      
      // Ping for presence updates - send presence updates every 30 seconds
      const presenceInterval = setInterval(() => {
        if (!socket.connected) {
          clearInterval(presenceInterval);
          return;
        }
        
        // Update last active time
        const userInfo = onlineUsersCache.get(userId);
        if (userInfo) {
          userInfo.lastActive = new Date();
          onlineUsersCache.set(userId, userInfo);
        }
        
        // Refresh online friends list
        const currentOnlineFriends = friendIds
          .filter(id => onlineUsersCache.has(id))
          .map(id => {
            const friend = onlineUsersCache.get(id);
            return {
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar
            };
          });
        
        socket.emit('online-friends', currentOnlineFriends);
      }, 30000); // Every 30 seconds
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        
        // Clear presence interval
        clearInterval(presenceInterval);
        
        // Remove from online users
        onlineUsersCache.delete(userId);
        
        // Notify friends that user is offline
        friendIds.forEach(friendId => {
          const friendSocketId = onlineUsersCache.get(friendId)?.socketId;
          if (friendSocketId) {
            io.to(friendSocketId).emit('friend-offline', { friendId: userId });
          }
        });
      });
    } catch (error) {
      console.error('Error handling socket connection:', error);
      socket.disconnect();
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
    
    // Send a message to a room
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
    
    // Direct message handling
    socket.on('join-direct-chat', async (friendId) => {
      try {
        const userId = socket.userId;
        
        if (!userId || !friendId) {
          socket.emit('error', 'Invalid user ID or friend ID');
          return;
        }
        
        // Check if they are friends
        const friendship = await Friendship.findOne({
          where: {
            status: 'accepted',
            [Op.or]: [
              { senderId: userId, receiverId: friendId },
              { senderId: friendId, receiverId: userId }
            ]
          }
        });
        
        if (!friendship) {
          socket.emit('error', 'You are not friends with this user');
          return;
        }
        
        // Create a unique room ID for direct messages
        const chatRoomId = [userId, friendId].sort().join('-');
        
        // Join the direct message room
        socket.join(`direct:${chatRoomId}`);
        
        console.log(`User ${userId} joined direct chat with ${friendId}`);
      } catch (error) {
        console.error('Error joining direct chat:', error);
        socket.emit('error', 'Failed to join direct chat');
      }
    });
    
    // Leave direct chat
    socket.on('leave-direct-chat', async (friendId) => {
      try {
        const userId = socket.userId;
        
        if (!userId || !friendId) {
          return;
        }
        
        // Create a unique room ID for direct messages
        const chatRoomId = [userId, friendId].sort().join('-');
        
        // Leave the direct message room
        socket.leave(`direct:${chatRoomId}`);
        
        console.log(`User ${userId} left direct chat with ${friendId}`);
      } catch (error) {
        console.error('Error leaving direct chat:', error);
      }
    });
    
    // Send direct message
    socket.on('send-direct-message', async ({ friendId, content }) => {
      try {
        const userId = socket.userId;
        
        if (!content || !content.trim()) {
          socket.emit('error', 'Message content is required');
          return;
        }
        
        // Check if they are friends
        const friendship = await Friendship.findOne({
          where: {
            status: 'accepted',
            [Op.or]: [
              { senderId: userId, receiverId: friendId },
              { senderId: friendId, receiverId: userId }
            ]
          }
        });
        
        if (!friendship) {
          socket.emit('error', 'You are not friends with this user');
          return;
        }
        
        // Get user information
        const user = await User.findByPk(userId, {
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        });
        
        if (!user) {
          socket.emit('error', 'User not found');
          return;
        }
        
        // Create message in database
        const message = await DirectMessage.create({
          content,
          senderId: userId,
          receiverId: friendId,
          isRead: false
        });
        
        // Format message for sending
        const formattedMessage = {
          id: message.id,
          content: message.content,
          timestamp: message.createdAt,
          isRead: false,
          sender: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar
          }
        };
        
        // Create a unique room ID for direct messages
        const chatRoomId = [userId, friendId].sort().join('-');
        
        // Send to the direct message room
        chatNamespace.to(`direct:${chatRoomId}`).emit('new-direct-message', formattedMessage);
        
        // If the friend is online but not in the chat room, send a notification
        const friendSocketId = onlineUsersCache.get(friendId)?.socketId;
        if (friendSocketId) {
          io.to(friendSocketId).emit('direct-message-notification', {
            messageId: message.id,
            senderId: userId,
            senderName: `${user.firstName} ${user.lastName}`,
            senderAvatar: user.avatar,
            content: content.length > 30 ? content.substring(0, 30) + '...' : content,
            timestamp: message.createdAt
          });
        }
        
        console.log(`User ${userId} sent direct message to ${friendId}`);
      } catch (error) {
        console.error('Error sending direct message:', error);
        socket.emit('error', 'Failed to send direct message');
      }
    });
    
    // Mark direct messages as read
    socket.on('mark-messages-read', async (friendId) => {
      try {
        const userId = socket.userId;
        
        // Update messages to read
        await DirectMessage.update(
          { isRead: true },
          {
            where: {
              receiverId: userId,
              senderId: friendId,
              isRead: false
            }
          }
        );
        
        // Create a unique room ID for direct messages
        const chatRoomId = [userId, friendId].sort().join('-');
        
        // Notify the sender that messages were read
        chatNamespace.to(`direct:${chatRoomId}`).emit('messages-read', {
          readerId: userId,
          senderId: friendId
        });
        
        console.log(`User ${userId} marked messages from ${friendId} as read`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
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

  // Handle call namespace connections
  callNamespace.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected to call namespace: ${userId}`);
    
    try {
      // Get user info
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      });
      
      if (!user) {
        socket.disconnect();
        return;
      }
      
      // Handle joining a call in a study room
      socket.on('join-call', async ({ roomId }) => {
        try {
          // Check if user is a member of the room
          const room = await StudyRoom.findByPk(roomId, {
            include: [{
              model: User,
              as: 'members',
              where: { id: userId },
              required: true
            }]
          });
          
          if (!room) {
            socket.emit('call-error', { message: 'You are not a member of this room' });
            return;
          }
          
          // Join the call socket room
          socket.join(`call:${roomId}`);
          
          // Initialize room in call cache if needed
          if (!callParticipantsCache.has(roomId)) {
            callParticipantsCache.set(roomId, new Map());
          }
          
          // Add user to call participants
          const participants = callParticipantsCache.get(roomId);
          participants.set(userId, {
            id: userId,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar,
            socketId: socket.id,
            audioEnabled: true,
            videoEnabled: false,
            screenSharing: false,
            isSpeaking: false,
            joinedAt: new Date()
          });
          
          // Mark call as active for this room
          activeCallsCache.set(roomId, true);
          
          // Get all participants to send to the new user
          const participantsArray = Array.from(participants.values()).map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            audioEnabled: p.audioEnabled,
            videoEnabled: p.videoEnabled,
            screenSharing: p.screenSharing,
            isSpeaking: p.isSpeaking || false
          }));
          
          // Send current participants to the new user
          socket.emit('call-joined', {
            roomId,
            participants: participantsArray
          });
          
          // Notify other participants that a new user joined
          socket.to(`call:${roomId}`).emit('user-joined-call', {
            roomId,
            user: {
              id: userId,
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.avatar,
              audioEnabled: true,
              videoEnabled: false,
              screenSharing: false,
              isSpeaking: false
            }
          });
          
          // Create a system message in the chat
          await Message.create({
            roomId,
            senderId: userId,
            content: `${user.firstName} ${user.lastName} joined the voice call`,
            isSystem: true
          });
          
          // Broadcast system message to chat
          chatNamespace.to(`room:${roomId}`).emit('new-message', {
            id: Date.now().toString(),
            content: `${user.firstName} ${user.lastName} joined the voice call`,
            timestamp: new Date(),
            sender: {
              id: userId,
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.avatar
            },
            isSystem: true
          });
          
          console.log(`User ${userId} joined call in room ${roomId}`);
        } catch (error) {
          console.error('Error joining call:', error);
          socket.emit('call-error', { message: 'Failed to join call' });
        }
      });
      
      // Handle WebRTC signaling
      socket.on('signal', ({ roomId, to, signal, type }) => {
        // Forward the signaling message to the intended recipient
        const participants = callParticipantsCache.get(roomId);
        
        if (participants) {
          const recipient = Array.from(participants.values()).find(p => p.id === to);
          
          if (recipient && recipient.socketId) {
            callNamespace.to(recipient.socketId).emit('signal', {
              from: userId,
              signal,
              type
            });
          }
        }
      });
      
      // Handle audio/video state changes
      socket.on('media-state-change', ({ roomId, audioEnabled, videoEnabled, screenSharing }) => {
        const participants = callParticipantsCache.get(roomId);
        
        if (participants && participants.has(userId)) {
          // Update user's media state
          const userState = participants.get(userId);
          
          if (audioEnabled !== undefined) userState.audioEnabled = audioEnabled;
          if (videoEnabled !== undefined) userState.videoEnabled = videoEnabled;
          if (screenSharing !== undefined) userState.screenSharing = screenSharing;
          
          participants.set(userId, userState);
          
          // Notify other participants of the state change
          socket.to(`call:${roomId}`).emit('user-media-changed', {
            userId,
            audioEnabled: userState.audioEnabled,
            videoEnabled: userState.videoEnabled,
            screenSharing: userState.screenSharing
          });
        }
      });
      
      // Handle speaking status changes
      socket.on('speaking-status-change', ({ roomId, isSpeaking }) => {
        const participants = callParticipantsCache.get(roomId);
        
        if (participants && participants.has(userId)) {
          // Update user's speaking state
          const userState = participants.get(userId);
          userState.isSpeaking = isSpeaking;
          participants.set(userId, userState);
          
          // Notify other participants of the speaking status change
          socket.to(`call:${roomId}`).emit('user-speaking-status', {
            userId,
            isSpeaking
          });
          
          console.log(`User ${userId} speaking status in room ${roomId}: ${isSpeaking ? 'speaking' : 'not speaking'}`);
        }
      });
      
      // Handle leaving a call
      socket.on('leave-call', async ({ roomId }) => {
        await handleLeaveCall(socket, roomId, userId, user);
      });
      
      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`User disconnected from call namespace: ${userId}`);
        
        // Find all calls the user is part of and remove them
        for (const [roomId, participants] of callParticipantsCache.entries()) {
          if (participants.has(userId)) {
            const user = await User.findByPk(userId, {
              attributes: ['id', 'firstName', 'lastName', 'avatar']
            });
            
            if (user) {
              await handleLeaveCall(socket, roomId, userId, user);
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error handling call connection:', error);
      socket.disconnect();
    }
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

  // Helper function to handle a user leaving a call
  async function handleLeaveCall(socket, roomId, userId, user) {
    try {
      // Remove user from call participants
      const participants = callParticipantsCache.get(roomId);
      
      if (participants && participants.has(userId)) {
        participants.delete(userId);
        
        // Leave the call socket room
        socket.leave(`call:${roomId}`);
        
        // If no participants left, mark call as inactive
        if (participants.size === 0) {
          callParticipantsCache.delete(roomId);
          activeCallsCache.delete(roomId);
        }
        
        // Notify other participants that user left
        socket.to(`call:${roomId}`).emit('user-left-call', {
          roomId,
          userId
        });
        
        // Create a system message in the chat
        await Message.create({
          roomId,
          senderId: userId,
          content: `${user.firstName} ${user.lastName} left the voice call`,
          isSystem: true
        });
        
        // Broadcast system message to chat
        global.io.of('/chat').to(`room:${roomId}`).emit('new-message', {
          id: Date.now().toString(),
          content: `${user.firstName} ${user.lastName} left the voice call`,
          timestamp: new Date(),
          sender: {
            id: userId,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar
          },
          isSystem: true
        });
        
        console.log(`User ${userId} left call in room ${roomId}`);
      }
    } catch (error) {
      console.error('Error handling leave call:', error);
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

/**
 * Emit a notification to a specific user
 * @param {string} userId - User ID to send notification to
 * @param {object} notification - Notification object
 */
async function emitNotification(userId, notification) {
  try {
    // Check if io is available
    if (!global.io) {
      console.error('Socket.io instance not available');
      return;
    }
    
    // Find user's socket connection if they're online
    const userInfo = onlineUsersCache.get(userId);
    
    if (userInfo && userInfo.socketId) {
      // Format notification with time info
      const formattedNotification = {
        ...notification,
        time: 'Just now',
        timeAgo: 'Just now'
      };
      
      try {
        // Emit notification to the user
        global.io.to(userInfo.socketId).emit('notification', formattedNotification);
        console.log(`Notification emitted to user ${userId}`);
      } catch (socketError) {
        console.error(`Error emitting notification to socket: ${socketError.message}`);
      }
    } else {
      console.log(`User ${userId} is offline, notification saved to database only`);
    }
  } catch (error) {
    console.error('Error in emitNotification function:', error);
  }
}

// Export both functions
module.exports = {
  setupSocket,
  emitNotification
}; 