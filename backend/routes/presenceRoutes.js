const express = require('express');
const {
  getRoomPresence,
  updatePresence,
  setOffline
} = require('../controllers/presenceController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getRoomPresence)
  .post(updatePresence)
  .delete(setOffline);

module.exports = router; 