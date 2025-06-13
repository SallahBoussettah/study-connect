const { UserPresence, User, StudyRoom } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get online users in a room
 * @route   GET /api/rooms/:roomId/presence
 * @access  Private
 */
exports.getRoomPresence = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    
    // Get all online users in the room
    const presence = await UserPresence.findAll({
      where: {
        roomId,
        isOnline: true,
        lastActive: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Active in the last 5 minutes
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    // Format users
    const onlineUsers = presence.map(p => ({
      userId: p.user.id,
      name: `${p.user.firstName} ${p.user.lastName}`,
      avatar: p.user.avatar,
      status: p.status,
      lastActive: p.lastActive
    }));
    
    res.status(200).json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error('Error fetching room presence:', error);
    next(error);
  }
};

/**
 * @desc    Update user presence in a room
 * @route   POST /api/rooms/:roomId/presence
 * @access  Private
 */
exports.updatePresence = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    const { status } = req.body;
    
    // Validate status if provided
    if (status && !['active', 'away', 'busy'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    // Find or create presence record
    let presence = await UserPresence.findOne({
      where: {
        userId,
        roomId
      }
    });
    
    if (presence) {
      // Update existing presence
      await presence.update({
        isOnline: true,
        status: status || presence.status,
        lastActive: new Date()
      });
    } else {
      // Create new presence
      presence = await UserPresence.create({
        userId,
        roomId,
        isOnline: true,
        status: status || 'active',
        lastActive: new Date()
      });
    }
    
    // Update room active members count
    await StudyRoom.update(
      { 
        activeMembers: await UserPresence.count({
          where: { 
            roomId,
            isOnline: true,
            lastActive: {
              [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Active in the last 5 minutes
            }
          }
        }) 
      },
      { where: { id: roomId } }
    );
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        roomId,
        isOnline: presence.isOnline,
        status: presence.status,
        lastActive: presence.lastActive
      }
    });
  } catch (error) {
    console.error('Error updating presence:', error);
    next(error);
  }
};

/**
 * @desc    Set user offline in a room
 * @route   DELETE /api/rooms/:roomId/presence
 * @access  Private
 */
exports.setOffline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    
    // Find presence record
    const presence = await UserPresence.findOne({
      where: {
        userId,
        roomId
      }
    });
    
    if (presence) {
      // Update to offline
      await presence.update({
        isOnline: false
      });
    }
    
    // Update room active members count
    await StudyRoom.update(
      { 
        activeMembers: await UserPresence.count({
          where: { 
            roomId,
            isOnline: true,
            lastActive: {
              [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Active in the last 5 minutes
            }
          }
        }) 
      },
      { where: { id: roomId } }
    );
    
    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error setting user offline:', error);
    next(error);
  }
}; 