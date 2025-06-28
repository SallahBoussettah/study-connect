const { StudyRoom, User, Subject, Resource, UserStudyRoom, Event } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

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
    const { name, description, image, isActive, subjectId } = req.body;
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
      description: description !== undefined ? description : room.description,
      image: image !== undefined ? image : room.image,
      isActive: isActive !== undefined ? isActive : room.isActive,
      subjectId: subjectId !== undefined ? subjectId : room.subjectId
    });

    // Get the updated room with subject information
    const updatedRoom = await StudyRoom.findByPk(roomId, {
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'category']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedRoom.id,
        name: updatedRoom.name,
        description: updatedRoom.description,
        image: updatedRoom.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedRoom.name)}&background=random`,
        isActive: updatedRoom.isActive,
        subject: updatedRoom.subject,
        updatedAt: updatedRoom.updatedAt
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

    // Get all resources associated with the room
    const resources = await Resource.findAll({
      where: { roomId }
    });

    // Delete physical files associated with resources
    const deletedDirs = new Set(); // Track directories we've deleted files from
    
    for (const resource of resources) {
      if (resource.filePath) {
        try {
          // The filePath in the database should be the absolute path to the file
          console.log(`Attempting to delete file: ${resource.filePath}`);
          
          let fileDeleted = false;
          let deletedFromPath = '';
          
          if (fs.existsSync(resource.filePath)) {
            fs.unlinkSync(resource.filePath);
            console.log(`Successfully deleted file: ${resource.filePath}`);
            fileDeleted = true;
            deletedFromPath = resource.filePath;
          } else {
            console.log(`File not found at path stored in database: ${resource.filePath}`);
            
            // Get just the filename without the path
            const fileName = path.basename(resource.filePath);
            
            // Extract userId and filename from the path if possible
            // Path might be like 'uploads/userId/filename' or '/uploads/userId/filename'
            const pathParts = resource.filePath.replace(/\\/g, '/').split('/');
            
            // Try alternative paths if the file wasn't found
            const alternativePaths = [
              // Try path relative to the backend directory
              path.join(__dirname, '..', 'uploads', fileName),
              // Try path relative to project root
              path.join(__dirname, '../../uploads', fileName)
            ];
            
            // If we can identify a userId in the path
            if (pathParts.length > 2) {
              const possibleUserId = pathParts[pathParts.length - 2];
              // Check if it looks like a UUID
              if (possibleUserId.includes('-') && possibleUserId.length > 30) {
                // Add path with the extracted userId and filename
                alternativePaths.push(path.join(__dirname, '../../uploads', possibleUserId, fileName));
              }
            }
            
            // Based on the screenshot, try the specific pattern
            // Look for any directories in the uploads folder that match UUID pattern
            try {
              const uploadsDir = path.join(__dirname, '../../uploads');
              if (fs.existsSync(uploadsDir)) {
                const dirs = fs.readdirSync(uploadsDir);
                for (const dir of dirs) {
                  // Check if directory name looks like a UUID
                  if (dir.includes('-') && dir.length > 30) {
                    const possiblePath = path.join(uploadsDir, dir, fileName);
                    if (!alternativePaths.includes(possiblePath)) {
                      alternativePaths.push(possiblePath);
                    }
                  }
                }
              }
            } catch (dirError) {
              console.error('Error reading uploads directory:', dirError);
            }
            
            for (const altPath of alternativePaths) {
              if (fs.existsSync(altPath)) {
                fs.unlinkSync(altPath);
                console.log(`Successfully deleted file using alternative path: ${altPath}`);
                fileDeleted = true;
                deletedFromPath = altPath;
                break;
              }
            }
            
            if (!fileDeleted) {
              console.log(`File not found at any expected location for resource ${resource.id}: ${resource.filePath}`);
            }
          }
          
          // If we successfully deleted a file, add its directory to our tracking set
          if (fileDeleted && deletedFromPath) {
            const dirPath = path.dirname(deletedFromPath);
            deletedDirs.add(dirPath);
          }
        } catch (fileError) {
          console.error(`Error deleting file for resource ${resource.id}:`, fileError);
          // Continue with deletion even if file removal fails
        }
      }
    }
    
    // Clean up empty directories
    try {
      // Process each directory we've deleted files from
      for (const dirPath of deletedDirs) {
        if (fs.existsSync(dirPath)) {
          // Check if directory is empty
          const files = fs.readdirSync(dirPath);
          if (files.length === 0) {
            // Directory is empty, delete it
            fs.rmdirSync(dirPath);
            console.log(`Removed empty directory: ${dirPath}`);
            
            // Check if parent directory is now empty (for nested structures)
            const parentDir = path.dirname(dirPath);
            if (parentDir.includes('uploads')) {
              try {
                const parentFiles = fs.readdirSync(parentDir);
                if (parentFiles.length === 0) {
                  fs.rmdirSync(parentDir);
                  console.log(`Removed empty parent directory: ${parentDir}`);
                }
              } catch (parentError) {
                console.error(`Error checking/removing parent directory: ${parentError}`);
              }
            }
          } else {
            console.log(`Directory not empty, skipping removal: ${dirPath}`);
          }
        }
      }
    } catch (dirError) {
      console.error('Error cleaning up empty directories:', dirError);
    }

    // Explicitly delete resources associated with the room
    await Resource.destroy({
      where: { roomId }
    });

    // Delete messages associated with the room (in case cascade isn't working)
    const Message = require('../models').Message;
    if (Message) {
      await Message.destroy({
        where: { roomId }
      });
    }

    // Delete user-room associations
    await UserStudyRoom.destroy({
      where: { roomId }
    });

    // Delete the room
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