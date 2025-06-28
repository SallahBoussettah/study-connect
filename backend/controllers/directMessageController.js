const { User, DirectMessage, Friendship, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get direct messages with a friend
 * @route   GET /api/messages/direct/:friendId
 * @access  Private
 */
exports.getDirectMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Check if friendship exists
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
      return res.status(403).json({
        success: false,
        error: 'You are not friends with this user'
      });
    }
    
    // Get messages between the two users
    const messages = await DirectMessage.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Mark messages as read
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
    
    // Format messages
    const formattedMessages = messages.rows.map(message => ({
      id: message.id,
      content: message.content,
      timestamp: message.createdAt,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatar: message.sender.avatar
      }
    }));
    
    res.status(200).json({
      success: true,
      data: formattedMessages,
      pagination: {
        page,
        limit,
        totalMessages: messages.count,
        totalPages: Math.ceil(messages.count / limit),
        hasMore: offset + limit < messages.count
      }
    });
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    next(error);
  }
};

/**
 * @desc    Send a direct message to a friend
 * @route   POST /api/messages/direct/:friendId
 * @access  Private
 */
exports.sendDirectMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    const { content } = req.body;
    
    // Validate request
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    // Check if friendship exists
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
      return res.status(403).json({
        success: false,
        error: 'You are not friends with this user'
      });
    }
    
    // Create message
    const message = await DirectMessage.create({
      content,
      senderId: userId,
      receiverId: friendId,
      isRead: false
    });
    
    // Get sender info
    const sender = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'avatar']
    });
    
    // Format response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      timestamp: message.createdAt,
      isRead: message.isRead,
      sender: {
        id: sender.id,
        name: `${sender.firstName} ${sender.lastName}`,
        avatar: sender.avatar
      }
    };
    
    res.status(201).json({
      success: true,
      data: formattedMessage
    });
  } catch (error) {
    console.error('Error sending direct message:', error);
    next(error);
  }
};

/**
 * @desc    Get unread message counts from all friends
 * @route   GET /api/messages/direct/unread
 * @access  Private
 */
exports.getUnreadMessageCounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all friends
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
    
    // Get unread message counts
    const unreadCounts = await DirectMessage.findAll({
      attributes: [
        'senderId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        receiverId: userId,
        senderId: {
          [Op.in]: friendIds
        },
        isRead: false
      },
      group: ['senderId'],
      raw: true
    });
    
    // Format response
    const formattedCounts = unreadCounts.reduce((acc, item) => {
      acc[item.senderId] = parseInt(item.count);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: formattedCounts
    });
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    next(error);
  }
};

/**
 * @desc    Get all conversations (friendships) with last messages
 * @route   GET /api/messages/direct/conversations
 * @access  Private
 */
exports.getRecentConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all friendships
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    // Extract friend data from friendships
    const friendsData = friendships.map(friendship => {
      const isFriend = friendship.senderId === userId;
      const friend = isFriend ? friendship.receiver : friendship.sender;
      
      return {
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatar: friend.avatar
      };
    });
    
    // Get the last message for each friendship
    const conversations = await Promise.all(friendsData.map(async (friend) => {
      // Get the last message between the user and this friend
      const lastMessage = await DirectMessage.findOne({
        where: {
          [Op.or]: [
            { senderId: userId, receiverId: friend.id },
            { senderId: friend.id, receiverId: userId }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 1,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });
      
      // Format the last message data
      let formattedLastMessage = null;
      let lastMessageTime = null;
      let isRead = true;
      
      if (lastMessage) {
        formattedLastMessage = lastMessage.content;
        lastMessageTime = lastMessage.createdAt;
        isRead = lastMessage.senderId === userId || lastMessage.isRead;
        
        // Prepend sender's name if the message is from the friend
        if (lastMessage.senderId !== userId) {
          formattedLastMessage = lastMessage.content;
        }
      }
      
      return {
        friendId: friend.id,
        friendName: `${friend.firstName} ${friend.lastName}`,
        avatar: friend.avatar,
        lastMessage: formattedLastMessage,
        lastMessageTime: lastMessageTime,
        isRead: isRead
      };
    }));
    
    // Sort conversations by last message time (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    res.status(200).json({
      success: true,
      data: conversations
    });
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
};

/**
 * @desc    Mark messages from a friend as read
 * @route   PUT /api/messages/direct/:friendId/read
 * @access  Private
 */
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;
    
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
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    next(error);
  }
};

/**
 * @desc    Send a direct message to a friend (alternative endpoint)
 * @route   POST /api/messages/direct
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recipientId, content } = req.body;
    
    // Validate request
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Recipient ID is required'
      });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    // Check if friendship exists
    const friendship = await Friendship.findOne({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId, receiverId: recipientId },
          { senderId: recipientId, receiverId: userId }
        ]
      }
    });
    
    if (!friendship) {
      return res.status(403).json({
        success: false,
        error: 'You are not friends with this user'
      });
    }
    
    // Create message
    const message = await DirectMessage.create({
      content,
      senderId: userId,
      receiverId: recipientId,
      isRead: false
    });
    
    // Get sender info
    const sender = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'avatar']
    });
    
    // Format response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      timestamp: message.createdAt,
      isRead: message.isRead,
      sender: {
        id: sender.id,
        name: `${sender.firstName} ${sender.lastName}`,
        avatar: sender.avatar
      }
    };
    
    res.status(201).json({
      success: true,
      data: formattedMessage
    });
  } catch (error) {
    console.error('Error sending direct message:', error);
    next(error);
  }
}; 