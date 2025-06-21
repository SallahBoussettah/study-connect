const { Resource, User, StudyRoom } = require('../models');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { invalidateCache, invalidateCachePattern } = require('../utils/cache');

/**
 * @desc    Get resources for a study room
 * @route   GET /api/study-rooms/:roomId/resources
 * @access  Private
 */
exports.getStudyRoomResources = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.id;

    // Validate that the user is a member of the room
    const isMember = await isRoomMember(userId, roomId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }

    // Get the resources
    const resources = await Resource.findAll({
      where: { roomId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the resources for response
    const formattedResources = resources.map(resource => {
      const resourceObj = resource.toJSON();
      
      // Add a download URL if the resource has a file
      if (resourceObj.filePath) {
        resourceObj.downloadUrl = `/api/resources/${resource.id}/download`;
      }
      
      // Remove the actual file path for security
      delete resourceObj.filePath;
      
      return resourceObj;
    });

    res.status(200).json({
      success: true,
      count: formattedResources.length,
      data: formattedResources
    });
  } catch (error) {
    console.error('Error fetching study room resources:', error);
    next(error);
  }
};

/**
 * @desc    Create a resource in a study room
 * @route   POST /api/study-rooms/:roomId/resources
 * @access  Private
 */
exports.createResource = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const { title, description, type, url, subjectId } = req.body;

    // Validate that the user is a member of the room
    const isMember = await isRoomMember(userId, roomId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }

    // Handle validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Resource title is required'
      });
    }

    // Determine resource type
    let resourceType = type || 'Other';
    let fileSize = null;
    let filePath = null;

    // If a file was uploaded
    if (req.file) {
      filePath = req.file.path;
      fileSize = req.file.size;
      
      // Determine type from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        resourceType = 'Image';
      } else if (req.file.mimetype === 'application/pdf') {
        resourceType = 'PDF';
      } else if (req.file.mimetype.includes('word')) {
        resourceType = 'Document';
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        resourceType = 'Document';
      } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
        resourceType = 'Document';
      } else if (req.file.mimetype.includes('compressed') || req.file.mimetype.includes('zip')) {
        resourceType = 'Other';
      }
    }

    // Create the resource
    const resource = await Resource.create({
      title,
      description,
      type: resourceType,
      url: url || null,
      roomId,
      uploadedBy: userId,
      subjectId: subjectId || null,
      filePath,
      fileSize
    });

    // Get the resource with user data included
    const resourceWithUser = await Resource.findByPk(resource.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    // Format the response
    const resourceResponse = resourceWithUser.toJSON();
    
    // Remove the actual file path for security
    delete resourceResponse.filePath;
    
    // Add download URL if the resource has a file
    if (filePath) {
      resourceResponse.downloadUrl = `/api/resources/${resource.id}/download`;
    }

    // Invalidate admin dashboard cache to reflect storage changes
    invalidateCache('dashboard:admin');
    invalidateCache('dashboard:admin:storage');
    
    res.status(201).json({
      success: true,
      data: resourceResponse
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file after failed upload:', err);
      });
    }
    next(error);
  }
};

/**
 * @desc    Get a single resource
 * @route   GET /api/resources/:id
 * @access  Private
 */
exports.getResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;

    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: StudyRoom,
          as: 'studyRoom',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user has access to this resource
    if (resource.studyRoom) {
      const isMember = await isRoomMember(userId, resource.studyRoom.id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this resource'
        });
      }
    }

    // Format the resource for response
    const resourceResponse = resource.toJSON();
    
    // Add download URL if the resource has a file
    if (resourceResponse.filePath) {
      resourceResponse.downloadUrl = `/api/resources/${resource.id}/download`;
    }
    
    // Remove the actual file path for security
    delete resourceResponse.filePath;

    res.status(200).json({
      success: true,
      data: resourceResponse
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    next(error);
  }
};

/**
 * @desc    Update a resource
 * @route   PUT /api/resources/:id
 * @access  Private (Owner/Admin only)
 */
exports.updateResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    const { title, description, type, url, subjectId } = req.body;

    const resource = await Resource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user is the uploader of the resource or an admin
    if (resource.uploadedBy !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this resource'
      });
    }

    // Prepare update object
    const updateData = {
      title: title || resource.title,
      description: description || resource.description,
      type: type || resource.type,
      url: url !== undefined ? url : resource.url,
      subjectId: subjectId || resource.subjectId
    };

    // If a new file was uploaded
    if (req.file) {
      // Delete the old file if it exists
      if (resource.filePath && fs.existsSync(resource.filePath)) {
        fs.unlink(resource.filePath, err => {
          if (err) console.error('Error deleting old file during update:', err);
        });
      }

      // Update with new file info
      updateData.filePath = req.file.path;
      updateData.fileSize = req.file.size;
      
      // Determine type from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        updateData.type = 'Image';
      } else if (req.file.mimetype === 'application/pdf') {
        updateData.type = 'PDF';
      } else if (req.file.mimetype.includes('word')) {
        updateData.type = 'Document';
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        updateData.type = 'Document';
      } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
        updateData.type = 'Document';
      }
    }

    // Update the resource
    await resource.update(updateData);

    // Get the updated resource with user data
    const updatedResource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    // Format the response
    const resourceResponse = updatedResource.toJSON();
    
    // Add download URL if the resource has a file
    if (resourceResponse.filePath) {
      resourceResponse.downloadUrl = `/api/resources/${resource.id}/download`;
    }
    
    // Remove the actual file path for security
    delete resourceResponse.filePath;

    // Invalidate admin dashboard cache to reflect storage changes
    invalidateCache('dashboard:admin');
    invalidateCache('dashboard:admin:storage');

    res.status(200).json({
      success: true,
      data: resourceResponse
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file after failed update:', err);
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Owner/Admin only)
 */
exports.deleteResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;

    const resource = await Resource.findByPk(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user is the uploader of the resource or an admin or the room owner
    const isOwner = resource.uploadedBy === userId;
    const isAdmin = req.user.role === 'admin';
    
    // Check if user is room owner (if resource is in a room)
    let isRoomOwner = false;
    if (resource.roomId) {
      const room = await StudyRoom.findByPk(resource.roomId);
      if (room && room.createdBy === userId) {
        isRoomOwner = true;
      }
    }

    if (!isOwner && !isAdmin && !isRoomOwner) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this resource'
      });
    }

    // Delete file if exists
    if (resource.filePath && fs.existsSync(resource.filePath)) {
      fs.unlink(resource.filePath, err => {
        if (err) console.error('Error deleting file during resource deletion:', err);
      });
    }

    // Delete the resource
    await resource.destroy();

    // Invalidate admin dashboard cache to reflect storage changes
    invalidateCache('dashboard:admin');
    invalidateCache('dashboard:admin:storage');
    
    // Also invalidate any user-specific dashboard caches
    invalidateCachePattern(/^dashboard:/);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    next(error);
  }
};

/**
 * @desc    Download a resource file
 * @route   GET /api/resources/:id/download
 * @access  Private
 */
exports.downloadResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;

    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: StudyRoom,
          as: 'studyRoom',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Check if user has access to this resource
    if (resource.studyRoom) {
      const isMember = await isRoomMember(userId, resource.studyRoom.id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this resource'
        });
      }
    }

    // Check if resource has a file
    if (!resource.filePath || !fs.existsSync(resource.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Resource file not found'
      });
    }

    const filename = path.basename(resource.filePath);
    res.download(resource.filePath, filename);
  } catch (error) {
    console.error('Error downloading resource:', error);
    next(error);
  }
};

// Helper function to check if a user is a member of a study room
async function isRoomMember(userId, roomId) {
  const { UserStudyRoom } = require('../models');
  
  const membership = await UserStudyRoom.findOne({
    where: {
      userId,
      roomId
    }
  });

  return !!membership;
} 