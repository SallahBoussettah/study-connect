const { Notification, User } = require('../models');

/**
 * @desc    Get all notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get notifications for the user
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Format notifications for response
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
        type: notification.type || 'info',
        message: notification.message,
        isRead: notification.isRead,
        time,
        createdAt: notification.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Find the notification
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Update the notification
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: notification.id,
        isRead: notification.isRead
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for the user
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}; 