const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} = require('../controllers/notificationController');

// Get all notifications for the current user
router.get('/', protect, getNotifications);

// Mark a specific notification as read
router.put('/:id/read', protect, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllNotificationsAsRead);

module.exports = router; 