const express = require('express');
const {
  getRoomMessages,
  sendMessage,
  createSystemMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getRoomMessages)
  .post(sendMessage);

router.route('/system')
  .post(createSystemMessage);

module.exports = router; 