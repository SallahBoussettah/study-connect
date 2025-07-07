const { User, StudyRoom, Event, Resource, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getOrFetch } = require('../utils/cache');

/**
 * @desc    Get dashboard data for current user
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `dashboard:${userId}`;
    
    // Try to get from cache or fetch from DB
    const dashboardData = await getOrFetch(cacheKey, async () => {
      // Get active study rooms the user is a member of
      const studyRooms = await StudyRoom.findAll({
        attributes: ['id', 'name', 'description', 'image', 'totalMembers', 'activeMembers', 'lastActive', 'isActive', 'createdBy', 'createdAt', 'updatedAt'],
        include: [
          {
            model: User,
            as: 'members',
            where: { id: userId },
            attributes: [],
            through: { attributes: [] }
          }
        ],
        where: { isActive: true },
        limit: 5,
        order: [['lastActive', 'DESC']]
      });
      
      // Get upcoming events for the user
      const now = new Date();
      const upcomingEvents = await Event.findAll({
        include: [
          {
            model: StudyRoom,
            as: 'studyRoom',
            attributes: ['name']
          }
        ],
        where: {
          date: { [Op.gte]: now }
        },
        limit: 3,
        order: [['date', 'ASC']]
      });
      
      // Get recent resources
      const recentResources = await Resource.findAll({
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['firstName', 'lastName']
          }
        ],
        where: {
          uploadedBy: userId
        },
        limit: 3,
        order: [['createdAt', 'DESC']]
      });
      
      // Get unread notifications
      const notifications = await Notification.findAll({
        where: {
          userId,
          isRead: false
        },
        limit: 5,
        order: [['createdAt', 'DESC']]
      });
      
      // Format data for response
      const formattedRooms = studyRooms.map(room => ({
        id: room.id,
        name: room.name,
        activeMembers: room.activeMembers,
        totalMembers: room.totalMembers,
        lastActive: room.lastActive,
        image: room.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`
      }));
      
      const formattedEvents = upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        group: event.studyRoom ? event.studyRoom.name : 'General'
      }));
      
      const formattedResources = recentResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        uploadedBy: resource.uploader ? `${resource.uploader.firstName} ${resource.uploader.lastName}` : 'Unknown',
        date: resource.createdAt
      }));
      
      const formattedNotifications = notifications.map(notification => {
        // Calculate relative time
        const now = new Date();
        const diff = now - new Date(notification.createdAt);
        let time;
        
        if (diff < 60 * 1000) {
          time = 'Just now';
        } else if (diff < 60 * 60 * 1000) {
          const minutes = Math.floor(diff / (60 * 1000));
          time = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diff < 24 * 60 * 60 * 1000) {
          const hours = Math.floor(diff / (60 * 60 * 1000));
          time = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
          const days = Math.floor(diff / (24 * 60 * 60 * 1000));
          time = `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
        
        return {
          id: notification.id,
          message: notification.message,
          time
        };
      });
      
      return {
        activeRooms: formattedRooms,
        upcomingEvents: formattedEvents,
        recentResources: formattedResources,
        notifications: formattedNotifications
      };
    }, 60); // Cache for 1 minute
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
};

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/dashboard/admin
 * @access  Private (Admin only)
 */
exports.getAdminDashboardData = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard:admin';
    const forceRefresh = req.query.refresh === 'true';
    
    // If refresh is requested, invalidate the cache first
    if (forceRefresh && global.userCache) {
      global.userCache.del(cacheKey);
    }
    
    // Try to get from cache or fetch from DB
    const adminData = await getOrFetch(cacheKey, async () => {
      // Get time range for queries
      const timeRangeParam = req.query.timeRange || '7days';
      let timeRangeDate;
      
      switch(timeRangeParam) {
        case '30days':
          timeRangeDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          timeRangeDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          timeRangeDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // 7days
          timeRangeDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
      
      // Combine multiple queries into a single Promise.all for better performance
      const [
        totalUsers,
        newUsersToday,
        activeUsers,
        totalResources,
        totalStudyRooms,
        activeStudyRooms,
        recentUsers,
        totalStorageUsed,
        resourcesByType,
        resourcesByDay,
        userRegistrationsByDay
      ] = await Promise.all([
        // Get total users count
        User.count(),
        
        // Get new users today
        User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Get active users (users who logged in within the last 7 days)
        User.count({
          where: {
            lastLogin: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Get total resources
        Resource.count(),
        
        // Get total study rooms
        StudyRoom.count(),
        
        // Get active study rooms
        StudyRoom.count({
          where: {
            isActive: true,
            activeMembers: {
              [Op.gt]: 0
            }
          }
        }),
        
        // Get recent users with their storage usage - modified to get ALL users, not just recent ones
        User.findAll({
          attributes: [
            'id', 
            'firstName', 
            'lastName', 
            'email', 
            'role', 
            'createdAt'
          ],
          include: [
            {
              model: Resource,
              as: 'resources',
              attributes: ['id', 'fileSize', 'type', 'createdAt'],
              required: false
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 50
        }),
        
        // Calculate total storage used across all users
        Resource.sum('fileSize'),
        
        // Get resources grouped by type
        Resource.findAll({
          attributes: [
            'type',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize']
          ],
          group: ['type']
        }),
        
        // Get resources created per day in the time range
        Resource.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize']
          ],
          where: {
            createdAt: {
              [Op.gte]: timeRangeDate
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        }),
        
        // Get user registrations per day in the time range
        User.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.gte]: timeRangeDate
            }
          },
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        })
      ]);
      
      // Calculate active percentage
      const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
      
      // Format recent users with storage usage
      const formattedRecentUsers = recentUsers.map(user => {
        // Calculate user's storage usage
        const storageUsageBytes = user.resources?.reduce((total, resource) => {
          return total + (resource.fileSize || 0);
        }, 0) || 0;
        
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          joinDate: user.createdAt,
          storageUsed: formatFileSize(storageUsageBytes),
          storageUsedBytes: storageUsageBytes,
          storagePercentage: Math.min(100, Math.round((storageUsageBytes / (500 * 1024 * 1024)) * 100))
        };
      });
      
      // Format resource types data
      const formattedResourceTypes = resourcesByType.map(item => ({
        type: item.type,
        count: parseInt(item.dataValues.count, 10),
        totalSize: parseInt(item.dataValues.totalSize, 10) || 0,
        formattedSize: formatFileSize(parseInt(item.dataValues.totalSize, 10) || 0)
      }));
      
      // Format resources by day data
      const formattedResourcesByDay = resourcesByDay.map(item => ({
        date: item.dataValues.date,
        count: parseInt(item.dataValues.count, 10),
        totalSize: parseInt(item.dataValues.totalSize, 10) || 0,
        formattedSize: formatFileSize(parseInt(item.dataValues.totalSize, 10) || 0)
      }));
      
      // Format user registrations by day data
      const formattedRegistrationsByDay = userRegistrationsByDay.map(item => ({
        date: item.dataValues.date,
        count: parseInt(item.dataValues.count, 10)
      }));
      
      // Ensure we have data for all days in the time range for registrations
      // This helps the frontend chart display properly
      const allDaysInRange = [];
      const currentDate = new Date(timeRangeDate);
      const endDate = new Date();
      
      // Add debug logging to see what's happening
      console.log('User registrations data:', {
        timeRange: timeRangeParam,
        timeRangeDate: timeRangeDate.toISOString(),
        registrationsFound: formattedRegistrationsByDay.length,
        registrationDays: formattedRegistrationsByDay.map(d => d.date)
      });
      
      // If we have no registration data but we do have users,
      // let's add at least one data point to show something in the chart
      if (formattedRegistrationsByDay.length === 0 && totalUsers > 0) {
        // Add all users to the oldest date in our range to show something
        allDaysInRange.push({
          date: currentDate.toISOString().split('T')[0],
          count: totalUsers
        });
        
        // Move to next day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        currentDate.setDate(currentDate.getDate() + 1);
        
        console.log('Added fallback data point for existing users:', {
          date: allDaysInRange[0].date,
          count: totalUsers
        });
      }
      
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if we already have data for this date
        const existingData = formattedRegistrationsByDay.find(item => item.date === dateString);
        
        if (existingData) {
          allDaysInRange.push(existingData);
        } else {
          // Add a zero-count entry for this date
          allDaysInRange.push({
            date: dateString,
            count: 0
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Format total storage used
      const totalStorageUsedFormatted = formatFileSize(totalStorageUsed || 0);
      const totalStorageLimit = '500 GB'; // 500 GB total storage limit
      const totalStorageLimitBytes = 500 * 1024 * 1024 * 1024;
      const totalStoragePercentage = Math.round(((totalStorageUsed || 0) / totalStorageLimitBytes) * 100);
      
      // Generate system alerts based on storage usage
      const systemAlerts = [];
      
      // Add storage warning if total usage is above 70%
      if (totalStoragePercentage > 70) {
        systemAlerts.push({
          id: 1,
          type: 'warning',
          message: `Storage usage at ${totalStoragePercentage}% of total capacity`,
          time: 'Now'
        });
      }
      
      // Add info about system updates
      systemAlerts.push({
        id: 2,
        type: 'info',
        message: 'System update scheduled for June 20, 2025',
        time: '1 day ago'
      });
      
      return {
        stats: {
          totalUsers,
          newUsersToday,
          activeUsers,
          activePercentage,
          totalResources,
          totalStudyRooms,
          activeStudyRooms,
          storageUsed: totalStorageUsedFormatted,
          totalStorage: totalStorageLimit,
          storagePercentage: totalStoragePercentage
        },
        recentUsers: formattedRecentUsers,
        resourceStats: {
          byType: formattedResourceTypes,
          byDay: formattedResourcesByDay
        },
        registrationStats: {
          byDay: allDaysInRange // Use our enhanced data with all days
        },
        systemAlerts
      };
    }, 30); // Cache for 30 seconds
    
    res.status(200).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    next(error);
  }
};

/**
 * @desc    Get user storage usage details
 * @route   GET /api/dashboard/admin/storage
 * @access  Private (Admin only)
 */
exports.getUserStorageDetails = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard:admin:storage';
    const forceRefresh = req.query.refresh === 'true';
    
    // If refresh is requested, invalidate the cache first
    if (forceRefresh && global.userCache) {
      global.userCache.del(cacheKey);
    }
    
    // Try to get from cache or fetch from DB
    const storageData = await getOrFetch(cacheKey, async () => {
      // Get all users with their storage usage
      const users = await User.findAll({
        attributes: [
          'id', 
          'firstName', 
          'lastName', 
          'email', 
          'role', 
          'createdAt'
        ],
        include: [
          {
            model: Resource,
            as: 'resources',
            attributes: ['id', 'fileSize', 'type', 'createdAt'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Format users with storage usage
      const formattedUsers = users.map(user => {
        // Calculate user's storage usage
        const storageUsageBytes = user.resources?.reduce((total, resource) => {
          return total + (resource.fileSize || 0);
        }, 0) || 0;
        
        // Count resources by type
        const resourceTypes = {};
        user.resources?.forEach(resource => {
          if (!resourceTypes[resource.type]) {
            resourceTypes[resource.type] = 0;
          }
          resourceTypes[resource.type]++;
        });
        
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          joinDate: user.createdAt,
          storageUsed: formatFileSize(storageUsageBytes),
          storageUsedBytes: storageUsageBytes,
          storagePercentage: Math.min(100, Math.round((storageUsageBytes / (500 * 1024 * 1024)) * 100)),
          resourceCount: user.resources?.length || 0,
          resourceTypes
        };
      });
      
      // Sort users by storage usage (highest first)
      formattedUsers.sort((a, b) => b.storageUsedBytes - a.storageUsedBytes);
      
      // Calculate total storage used
      const totalStorageUsed = formattedUsers.reduce((total, user) => {
        return total + user.storageUsedBytes;
      }, 0);
      
      return {
        users: formattedUsers,
        totalUsers: users.length,
        totalStorageUsed: formatFileSize(totalStorageUsed),
        totalStorageUsedBytes: totalStorageUsed,
        totalStorageLimit: '500 GB',
        totalStorageLimitBytes: 500 * 1024 * 1024 * 1024,
        storagePercentage: Math.round((totalStorageUsed / (500 * 1024 * 1024 * 1024)) * 100)
      };
    }, 30); // Cache for 30 seconds
    
    res.status(200).json({
      success: true,
      data: storageData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users for admin management
 * @route   GET /api/dashboard/admin/users
 * @access  Private (Admin only)
 */
exports.getAdminUsers = async (req, res, next) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    // Get search and filter parameters
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';
    
    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      whereClause.role = role;
    }
    
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }
    
    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'email', 
        'role', 
        'avatar', 
        'institution',
        'isActive', 
        'emailVerified', 
        'createdAt', 
        'lastLogin'
      ],
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      institution: user.institution || 'Not specified',
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      joinedAt: user.createdAt,
      lastLogin: user.lastLogin || 'Never'
    }));
    
    res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          totalUsers: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/dashboard/admin/users/:userId/role
 * @access  Private (Admin only)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Role must be one of: student, teacher, admin'
      });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    next(error);
  }
};

/**
 * @desc    Update user active status
 * @route   PUT /api/dashboard/admin/users/:userId/status
 * @access  Private (Admin only)
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    // Validate isActive
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean'
      });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (userId === req.user.id && !isActive) {
      return res.status(403).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }
    
    // Update user status
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isActive: user.isActive
      },
      message: isActive ? 'User activated' : 'User deactivated'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/dashboard/admin/users/:userId
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    // Delete user
    await user.destroy();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
};

// Helper function to format file size
function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return '0 B';
  
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
} 