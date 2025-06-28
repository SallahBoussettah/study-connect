const express = require('express');
const {
  getDirectMessages,
  sendDirectMessage,
  getUnreadMessageCounts,
  markMessagesAsRead,
  getRecentConversations,
  sendMessage
} = require('../controllers/directMessageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get unread message counts
router.get('/unread', getUnreadMessageCounts);

// Get all conversations
router.get('/conversations', getRecentConversations);

// Send a message with recipient in body
router.post('/', sendMessage);

// Get messages with a specific friend
router.get('/:friendId', getDirectMessages);

// Send a message to a friend
router.post('/:friendId', sendDirectMessage);

// Mark messages from a friend as read
router.put('/:friendId/read', markMessagesAsRead);

module.exports = router; 