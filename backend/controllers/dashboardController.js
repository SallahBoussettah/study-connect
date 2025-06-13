const { User, StudyRoom, Event, Resource, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get dashboard data for current user
 * @route   GET /api/dashboard
 * @access  Private
 */
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
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
    
    res.status(200).json({
      success: true,
      data: {
        activeRooms: formattedRooms,
        upcomingEvents: formattedEvents,
        recentResources: formattedResources,
        notifications: formattedNotifications
      }
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
    // Get total users count
    const totalUsers = await User.count();
    
    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    // Get active users (users who logged in within the last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    // Calculate active percentage
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    
    // Get total resources
    const totalResources = await Resource.count();
    
    // Get total study rooms
    const totalStudyRooms = await StudyRoom.count();
    
    // Get active study rooms
    const activeStudyRooms = await StudyRoom.count({
      where: {
        isActive: true,
        activeMembers: {
          [Op.gt]: 0
        }
      }
    });
    
    // Get recent users
    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Format recent users
    const formattedRecentUsers = recentUsers.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      joinDate: user.createdAt
    }));
    
    // Mock system alerts (would be replaced with real data in a production system)
    const systemAlerts = [
      { id: 1, type: 'warning', message: 'Storage usage approaching 30% of limit', time: '2 hours ago' },
      { id: 2, type: 'info', message: 'System update scheduled for June 20, 2025', time: '1 day ago' }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          newUsersToday,
          activeUsers,
          activePercentage,
          totalResources,
          totalStudyRooms,
          activeStudyRooms,
          storageUsed: '128.5 GB', // Mock data, would be calculated in a real system
          totalStorage: '500 GB' // Mock data, would be configured in a real system
        },
        recentUsers: formattedRecentUsers,
        systemAlerts
      }
    });
  } catch (error) {
    next(error);
  }
}; 