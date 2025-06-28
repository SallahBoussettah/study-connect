const { Resource, User, StudyRoom } = require('../models');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const { invalidateCache, invalidateCachePattern } = require('../utils/cache');
const { Op } = require('sequelize');

/**
 * @desc    Get resources for a study room
 * @route   GET /api/study-rooms/:roomId/resources
 * @access  Private
 */
exports.getStudyRoomResources = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate that the user is a member of the room
    try {
      const isMember = await isRoomMember(userId, roomId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You are not a member of this room'
        });
      }
    } catch (memberError) {
      console.error('Error checking room membership:', memberError);
      // If we can't verify membership, return empty resources instead of error
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Set up query conditions
    const whereConditions = { roomId };
    
    // Students can only see approved resources or their own pending resources
    // Admins and teachers can see all resources
    if (userRole === 'student') {
      whereConditions[Op.or] = [
        { status: 'approved' },
        { 
          uploadedBy: userId,
          status: { [Op.ne]: 'approved' }
        }
      ];
    }
    
    // Get the resources
    const resources = await Resource.findAll({
      where: whereConditions,
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
    // Return empty array instead of error
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
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
    const userRole = req.user.role;
    const { title, description, type, subjectId } = req.body;

    console.log('Creating resource with data:', {
      title,
      description,
      type,
      subjectId
    });

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
    let originalFilename = null;

    // If a file was uploaded
    if (req.file) {
      filePath = req.file.path;
      fileSize = req.file.size;
      originalFilename = req.file.originalname;
      
      // Determine type from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        resourceType = 'Image';
      } else if (req.file.mimetype === 'application/pdf') {
        resourceType = 'PDF';
      } else if (req.file.mimetype.includes('word')) {
        resourceType = 'Document';
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        resourceType = 'Spreadsheet';
      } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
        resourceType = 'Presentation';
      } else if (req.file.mimetype.includes('compressed') || req.file.mimetype.includes('zip')) {
        resourceType = 'Archive';
      } else if (req.file.mimetype.includes('text/plain')) {
        resourceType = 'Text';
      } else if (req.file.mimetype.includes('video')) {
        resourceType = 'Video';
      } else if (req.file.mimetype.includes('audio')) {
        resourceType = 'Audio';
      } else if (req.file.mimetype.includes('code') || 
                req.file.originalname.match(/\.(js|html|css|py|java|php|rb|c|cpp|h|cs|go)$/)) {
        resourceType = 'Code';
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'File upload is required'
      });
    }

    // Resources uploaded in study rooms are automatically approved
    // No need for admin review for resources inside study rooms
    const status = 'approved';
    const reviewedAt = new Date();
    const reviewedBy = userId;

    // Create the resource
    const resource = await Resource.create({
      title,
      description,
      type: resourceType,
      url: null,
      roomId,
      uploadedBy: userId,
      subjectId: subjectId || null,
      filePath,
      fileSize,
      originalFilename,
      status,
      reviewedAt,
      reviewedBy
    });

    // Log the created resource for debugging
    console.log('Created resource:', {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      filePath: resource.filePath,
      status: resource.status
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
    const { title, description, type, subjectId } = req.body;

    console.log('Updating resource with data:', {
      resourceId,
      title,
      description,
      type,
      subjectId
    });

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
      updateData.originalFilename = req.file.originalname;
      
      // Determine type from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        updateData.type = 'Image';
      } else if (req.file.mimetype === 'application/pdf') {
        updateData.type = 'PDF';
      } else if (req.file.mimetype.includes('word')) {
        updateData.type = 'Document';
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        updateData.type = 'Spreadsheet';
      } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
        updateData.type = 'Presentation';
      } else if (req.file.mimetype.includes('compressed') || req.file.mimetype.includes('zip')) {
        updateData.type = 'Archive';
      } else if (req.file.mimetype.includes('text/plain')) {
        updateData.type = 'Text';
      } else if (req.file.mimetype.includes('video')) {
        updateData.type = 'Video';
      } else if (req.file.mimetype.includes('audio')) {
        updateData.type = 'Audio';
      } else if (req.file.mimetype.includes('code') || 
                req.file.originalname.match(/\.(js|html|css|py|java|php|rb|c|cpp|h|cs|go)$/)) {
        updateData.type = 'Code';
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

    // Admin can delete any resource
    // Resource uploader can delete their own resources
    // Room owner can delete resources in their room
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

    console.log(`Download request for resource ${resourceId} by user ${userId}`);

    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: StudyRoom,
          as: 'studyRoom',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!resource) {
      console.error(`Resource not found: ${resourceId}`);
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // If resource is in a study room, check if user has access
    if (resource.roomId) {
      const isMember = await isRoomMember(userId, resource.roomId);
      if (!isMember && req.user.role !== 'admin') {
        console.error(`User ${userId} does not have access to resource ${resourceId} in room ${resource.roomId}`);
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this resource'
        });
      }
    }

    // Check if resource has a file
    if (!resource.filePath) {
      console.error(`Resource ${resourceId} has no file path`);
      return res.status(404).json({
        success: false,
        error: 'Resource file not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(resource.filePath)) {
      console.error(`File does not exist at path: ${resource.filePath}`);
      return res.status(404).json({
        success: false,
        error: 'Resource file not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(resource.filePath);
    
    // Use the original filename if available, otherwise use the basename of the file path
    const downloadFilename = resource.originalFilename || path.basename(resource.filePath);
    
    console.log(`Serving file: ${resource.filePath} as ${downloadFilename}`);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
    
    // Set content type based on file extension
    const ext = path.extname(resource.filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    
    // Map common extensions to content types
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (['.doc', '.docx'].includes(ext)) contentType = 'application/msword';
    else if (['.xls', '.xlsx'].includes(ext)) contentType = 'application/vnd.ms-excel';
    else if (['.ppt', '.pptx'].includes(ext)) contentType = 'application/vnd.ms-powerpoint';
    else if (ext === '.txt') contentType = 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    
    // Log download activity
    console.log(`User ${userId} downloaded resource ${resourceId}: ${downloadFilename}`);
    
    // Stream the file to the client
    const fileStream = fs.createReadStream(resource.filePath);
    fileStream.pipe(res);
    
    // Handle errors in the stream
    fileStream.on('error', (err) => {
      console.error(`Error streaming file ${resource.filePath}:`, err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error streaming file'
        });
      }
    });
  } catch (error) {
    console.error('Error downloading resource:', error);
    next(error);
  }
};

/**
 * @desc    Get all pending resources for review
 * @route   GET /api/resources/pending
 * @access  Private (Admin/Teacher)
 */
exports.getPendingResources = async (req, res, next) => {
  try {
    // Only admins and teachers can access this
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins and teachers can review resources.'
      });
    }

    const pendingResources = await Resource.findAll({
      where: { 
        status: 'pending',
        roomId: null // Only get global resources that need approval
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Format the resources for response
    const formattedResources = pendingResources.map(resource => {
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
    console.error('Error fetching pending resources:', error);
    next(error);
  }
};

/**
 * @desc    Review a resource (approve or reject)
 * @route   PUT /api/resources/:id/review
 * @access  Private (Admin/Teacher)
 */
exports.reviewResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const { status, notes } = req.body;
    
    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected".'
      });
    }

    // Only admins and teachers can review resources
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins and teachers can review resources.'
      });
    }

    // Find the resource
    const resource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Update the resource status
    await resource.update({
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewNotes: notes || null
    });

    // Get the updated resource
    const updatedResource = await Resource.findByPk(resourceId, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'role']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstName', 'lastName', 'role']
        }
      ]
    });

    // Format the response
    const resourceResponse = updatedResource.toJSON();
    delete resourceResponse.filePath;
    
    // Add download URL if the resource has a file
    if (resource.filePath) {
      resourceResponse.downloadUrl = `/api/resources/${resource.id}/download`;
    }

    // TODO: Send notification to resource uploader about the review result

    res.status(200).json({
      success: true,
      data: resourceResponse
    });
  } catch (error) {
    console.error('Error reviewing resource:', error);
    next(error);
  }
};

/**
 * @desc    Get all global resources (not associated with study rooms)
 * @route   GET /api/resources/global
 * @access  Private
 */
exports.getGlobalResources = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Set up query conditions - only get resources not associated with rooms
    const whereConditions = { 
      roomId: null  // Only get resources not associated with any room
    };
    
    // Students can only see approved resources or their own pending resources
    if (userRole === 'student') {
      whereConditions[Op.or] = [
        { status: 'approved' },
        { 
          uploadedBy: userId,
          status: { [Op.ne]: 'approved' }
        }
      ];
    }
    
    // Get the resources
    const resources = await Resource.findAll({
      where: whereConditions,
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
    console.error('Error fetching global resources:', error);
    next(error);
  }
};

/**
 * @desc    Create a global resource (not associated with any study room)
 * @route   POST /api/resources/global
 * @access  Private
 */
exports.createGlobalResource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { title, description, type, subjectId } = req.body;

    console.log('Creating global resource with data:', {
      title,
      description,
      type,
      subjectId
    });

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
    let originalFilename = null;

    // If a file was uploaded
    if (req.file) {
      filePath = req.file.path;
      fileSize = req.file.size;
      originalFilename = req.file.originalname;
      
      // Determine type from file mimetype
      if (req.file.mimetype.startsWith('image/')) {
        resourceType = 'Image';
      } else if (req.file.mimetype === 'application/pdf') {
        resourceType = 'PDF';
      } else if (req.file.mimetype.includes('word')) {
        resourceType = 'Document';
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        resourceType = 'Spreadsheet';
      } else if (req.file.mimetype.includes('presentation') || req.file.mimetype.includes('powerpoint')) {
        resourceType = 'Presentation';
      } else if (req.file.mimetype.includes('compressed') || req.file.mimetype.includes('zip')) {
        resourceType = 'Archive';
      } else if (req.file.mimetype.includes('text/plain')) {
        resourceType = 'Text';
      } else if (req.file.mimetype.includes('video')) {
        resourceType = 'Video';
      } else if (req.file.mimetype.includes('audio')) {
        resourceType = 'Audio';
      } else if (req.file.mimetype.includes('code') || 
                req.file.originalname.match(/\.(js|html|css|py|java|php|rb|c|cpp|h|cs|go)$/)) {
        resourceType = 'Code';
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'File upload is required'
      });
    }

    // Set approval status based on user role
    // Teachers and admins get automatic approval, students need review
    const status = userRole === 'student' ? 'pending' : 'approved';
    const reviewedAt = userRole === 'student' ? null : new Date();
    const reviewedBy = userRole === 'student' ? null : userId;

    // Create the resource (with roomId set to null for global resources)
    const resource = await Resource.create({
      title,
      description,
      type: resourceType,
      url: null,
      roomId: null, // This makes it a global resource
      uploadedBy: userId,
      subjectId: subjectId || null,
      filePath,
      fileSize,
      originalFilename,
      status,
      reviewedAt,
      reviewedBy
    });

    // Log the created resource for debugging
    console.log('Created global resource:', {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      filePath: resource.filePath,
      status: resource.status
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
    console.error('Error creating global resource:', error);
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file after failed upload:', err);
      });
    }
    next(error);
  }
};

// Helper function to check if a user is a member of a study room
async function isRoomMember(userId, roomId) {
  try {
    const { UserStudyRoom } = require('../models');
    
    if (!userId || !roomId) {
      console.error('Invalid userId or roomId in isRoomMember check:', { userId, roomId });
      return false;
    }
    
    const membership = await UserStudyRoom.findOne({
      where: {
        userId,
        roomId
      }
    });

    return !!membership;
  } catch (error) {
    console.error('Error in isRoomMember function:', error);
    // Default to false if there's an error
    return false;
  }
} 