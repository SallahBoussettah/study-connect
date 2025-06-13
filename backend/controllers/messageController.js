const { Message, User, StudyRoom, UserStudyRoom } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all messages for a study room
 * @route   GET /api/rooms/:roomId/messages
 * @access  Private
 */
exports.getRoomMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    
    // Check if user is a member of the room
    const membership = await UserStudyRoom.findOne({
      where: {
        userId,
        roomId
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }
    
    // Get messages with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    
    const messages = await Message.findAndCountAll({
      where: {
        roomId
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
    
    // Format messages
    const formattedMessages = messages.rows.map(message => ({
      id: message.id,
      content: message.content,
      isSystem: message.isSystem,
      timestamp: message.createdAt,
      sender: message.isSystem ? null : {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatar: message.sender.avatar
      }
    })).reverse(); // Reverse to get oldest messages first
    
    res.status(200).json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page,
          limit,
          total: messages.count,
          totalPages: Math.ceil(messages.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(error);
  }
};

/**
 * @desc    Send a message to a study room
 * @route   POST /api/rooms/:roomId/messages
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    const { content } = req.body;
    
    // Validate request
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    // Check if user is a member of the room
    const membership = await UserStudyRoom.findOne({
      where: {
        userId,
        roomId
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }
    
    // Create message
    const message = await Message.create({
      content,
      roomId,
      senderId: userId,
      isSystem: false
    });
    
    // Update user last active status
    await membership.update({
      lastActive: new Date()
    });

    // Update room last active time
    await StudyRoom.update(
      { 
        lastActive: new Date(),
        activeMembers: await UserStudyRoom.count({
          where: { 
            roomId,
            lastActive: {
              [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Active in the last 5 minutes
            }
          }
        })
      },
      { where: { id: roomId } }
    );
    
    // Get the sender details
    const sender = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'avatar']
    });
    
    // Return formatted message
    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        isSystem: message.isSystem,
        timestamp: message.createdAt,
        sender: {
          id: sender.id,
          name: `${sender.firstName} ${sender.lastName}`,
          avatar: sender.avatar
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    next(error);
  }
};

/**
 * @desc    Create a system message
 * @route   POST /api/rooms/:roomId/system-message
 * @access  Private (Admin or room owner only)
 */
exports.createSystemMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    const { content } = req.body;
    
    // Validate request
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    // Check if user is a room owner or admin
    const room = await StudyRoom.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }
    
    const isAdmin = req.user.role === 'admin';
    const isOwner = room.createdBy === userId;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Only the room owner or admin can create system messages'
      });
    }
    
    // Create message
    const message = await Message.create({
      content,
      roomId,
      senderId: userId, // We still track who created the system message
      isSystem: true
    });
    
    // Return formatted message
    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        isSystem: true,
        timestamp: message.createdAt,
        sender: null
      }
    });
  } catch (error) {
    console.error('Error creating system message:', error);
    next(error);
  }
}; 