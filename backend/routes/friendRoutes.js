const express = require('express');
const {
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers
} = require('../controllers/friendshipController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all friends
router.get('/', getFriends);

// Search for users to add as friends
router.get('/search', searchUsers);

// Friend requests routes
router.get('/requests', getFriendRequests);
router.get('/requests/sent', getSentFriendRequests);
router.post('/requests', sendFriendRequest);
router.put('/requests/:id/accept', acceptFriendRequest);
router.put('/requests/:id/reject', rejectFriendRequest);

// Remove a friend
router.delete('/:id', removeFriend);

module.exports = router; 