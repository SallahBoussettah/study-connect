const { StudyRoom, User, Subject, Resource, UserStudyRoom, Event } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all study rooms
 * @route   GET /api/study-rooms
 * @access  Private
 */
exports.getStudyRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get study rooms the user has joined
    const userRooms = await StudyRoom.findAll({
      attributes: ['id', 'name', 'description', 'image', 'totalMembers', 'activeMembers', 'lastActive', 'isActive', 'createdBy', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'members',
          where: { id: userId },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'category']
        },
        {
          model: Resource,
          as: 'resources',
          attributes: ['id']
        }
      ],
      order: [['lastActive', 'DESC']]
    });

    // Count resources for each room
    const formattedUserRooms = userRooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject ? room.subject.name : 'General',
      members: room.totalMembers,
      owner: room.creator ? `${room.creator.firstName} ${room.creator.lastName}` : 'Unknown',
      isOwner: room.createdBy === userId,
      lastActive: room.lastActive,
      resources: room.resources ? room.resources.length : 0,
      image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
      isActive: room.isActive,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }));

    // Get all study rooms for discovery (excluding ones the user is already in)
    const allRooms = await StudyRoom.findAll({
      attributes: ['id', 'name', 'description', 'image', 'totalMembers', 'activeMembers', 'lastActive', 'isActive', 'createdBy', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'category']
        },
        {
          model: Resource,
          as: 'resources',
          attributes: ['id']
        }
      ],
      where: {
        isActive: true,
        id: {
          [Op.notIn]: userRooms.map(room => room.id)
        }
      },
      order: [['lastActive', 'DESC']],
      limit: 10
    });

    const formattedDiscoverRooms = allRooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject ? room.subject.name : 'General',
      members: room.totalMembers,
      owner: room.creator ? `${room.creator.firstName} ${room.creator.lastName}` : 'Unknown',
      lastActive: room.lastActive,
      resources: room.resources ? room.resources.length : 0,
      image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
      createdAt: room.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        userRooms: formattedUserRooms,
        discoverRooms: formattedDiscoverRooms
      }
    });
  } catch (error) {
    console.error('Error fetching study rooms:', error);
    next(error);
  }
};

/**
 * @desc    Get a single study room
 * @route   GET /api/study-rooms/:id
 * @access  Private
 */
exports.getStudyRoom = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;

    const room = await StudyRoom.findByPk(roomId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
          through: {
            attributes: ['role', 'joinedAt', 'lastActive']
          }
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'category']
        },
        {
          model: Resource,
          as: 'resources',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Event,
          as: 'events',
          where: {
            date: {
              [Op.gte]: new Date()
            }
          },
          required: false,
          limit: 5,
          order: [['date', 'ASC']]
        }
      ]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Check if user is a member of the room
    const isMember = room.members.some(member => member.id === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }

    // Format study room data
    const formattedRoom = {
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject ? room.subject.name : 'General',
      members: room.members.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        avatar: member.avatar,
        role: member.UserStudyRoom.role,
        joinedAt: member.UserStudyRoom.joinedAt
      })),
      owner: room.creator ? {
        id: room.creator.id,
        name: `${room.creator.firstName} ${room.creator.lastName}`,
        email: room.creator.email,
        avatar: room.creator.avatar
      } : null,
      isOwner: room.createdBy === userId,
      lastActive: room.lastActive,
      resources: room.resources.map(resource => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        uploadedBy: resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown',
        createdAt: resource.createdAt
      })),
      events: room.events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        duration: event.duration
      })),
      image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
      isActive: room.isActive,
      totalMembers: room.totalMembers,
      activeMembers: room.activeMembers,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedRoom
    });
  } catch (error) {
    console.error('Error fetching study room:', error);
    next(error);
  }
};

/**
 * @desc    Create a new study room
 * @route   POST /api/study-rooms
 * @access  Private
 */
exports.createStudyRoom = async (req, res, next) => {
  try {
    const { name, description, image, subjectId } = req.body;
    const userId = req.user.id;

    // Create the room
    const room = await StudyRoom.create({
      name,
      description,
      image,
      subjectId,
      createdBy: userId,
      totalMembers: 1,
      activeMembers: 1,
      lastActive: new Date(),
      isActive: true
    });

    // Add the creator as a member with owner role
    await UserStudyRoom.create({
      userId,
      roomId: room.id,
      role: 'owner',
      joinedAt: new Date(),
      lastActive: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        id: room.id,
        name: room.name,
        description: room.description,
        image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating study room:', error);
    next(error);
  }
};

/**
 * @desc    Update a study room
 * @route   PUT /api/study-rooms/:id
 * @access  Private (Owner/Admin only)
 */
exports.updateStudyRoom = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;
    const roomId = req.params.id;
    const userId = req.user.id;

    // Find the room
    const room = await StudyRoom.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Check if user is the creator of the room
    if (room.createdBy !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this room'
      });
    }

    // Update the room
    await room.update({
      name: name || room.name,
      description: description || room.description,
      image: image || room.image,
      isActive: isActive !== undefined ? isActive : room.isActive
    });

    res.status(200).json({
      success: true,
      data: {
        id: room.id,
        name: room.name,
        description: room.description,
        image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
        isActive: room.isActive,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating study room:', error);
    next(error);
  }
};

/**
 * @desc    Delete a study room
 * @route   DELETE /api/study-rooms/:id
 * @access  Private (Owner/Admin only)
 */
exports.deleteStudyRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    // Find the room
    const room = await StudyRoom.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Check if user is the creator of the room
    if (room.createdBy !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this room'
      });
    }

    // Delete the room (will cascade delete memberships, resources, events, etc.)
    await room.destroy();

    res.status(200).json({
      success: true,
      message: 'Study room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting study room:', error);
    next(error);
  }
};

/**
 * @desc    Join a study room
 * @route   POST /api/study-rooms/:id/join
 * @access  Private
 */
exports.joinStudyRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    // Find the room
    const room = await StudyRoom.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Check if user is already a member
    const membership = await UserStudyRoom.findOne({
      where: {
        userId,
        roomId
      }
    });

    if (membership) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this room'
      });
    }

    // Add user as a member
    await UserStudyRoom.create({
      userId,
      roomId,
      role: 'member',
      joinedAt: new Date(),
      lastActive: new Date()
    });

    // Update total members count
    await room.update({
      totalMembers: room.totalMembers + 1,
      lastActive: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the study room'
    });
  } catch (error) {
    console.error('Error joining study room:', error);
    next(error);
  }
};

/**
 * @desc    Leave a study room
 * @route   POST /api/study-rooms/:id/leave
 * @access  Private
 */
exports.leaveStudyRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    // Find the room
    const room = await StudyRoom.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Check if user is a member
    const membership = await UserStudyRoom.findOne({
      where: {
        userId,
        roomId
      }
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }

    // Check if user is the owner
    if (membership.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'As the owner, you cannot leave the room. Transfer ownership first or delete the room.'
      });
    }

    // Remove user from the room
    await membership.destroy();

    // Update total members count
    await room.update({
      totalMembers: Math.max(0, room.totalMembers - 1),
      lastActive: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left the study room'
    });
  } catch (error) {
    console.error('Error leaving study room:', error);
    next(error);
  }
};

/**
 * @desc    Get basic information about a study room (without requiring membership)
 * @route   GET /api/study-rooms/:id/basic-info
 * @access  Private
 */
exports.getStudyRoomBasicInfo = async (req, res, next) => {
  try {
    const roomId = req.params.id;

    const room = await StudyRoom.findByPk(roomId, {
      attributes: ['id', 'name', 'description', 'image', 'totalMembers', 'activeMembers', 'lastActive', 'createdAt'],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'category']
        }
      ]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Study room not found'
      });
    }

    // Format the response with only the necessary information
    const formattedRoom = {
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject ? room.subject.name : 'General',
      totalMembers: room.totalMembers,
      activeMembers: room.activeMembers,
      lastActive: room.lastActive,
      image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`,
      creator: room.creator ? `${room.creator.firstName} ${room.creator.lastName}` : 'Unknown',
      createdAt: room.createdAt
    };

    res.status(200).json({
      success: true,
      data: formattedRoom
    });
  } catch (error) {
    console.error('Error fetching study room basic info:', error);
    next(error);
  }
}; 