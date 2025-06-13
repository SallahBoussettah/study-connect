const express = require('express');
const {
  getStudyRooms,
  getStudyRoom,
  createStudyRoom,
  updateStudyRoom,
  deleteStudyRoom,
  joinStudyRoom,
  leaveStudyRoom
} = require('../controllers/studyRoomController');
const { protect, authorize } = require('../middleware/auth');

// Include sub-routes
const messageRoutes = require('./messageRoutes');
const presenceRoutes = require('./presenceRoutes');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Re-route into other resource routers
router.use('/:roomId/messages', messageRoutes);
router.use('/:roomId/presence', presenceRoutes);

// Get all study rooms and create a new study room
router.route('/')
  .get(getStudyRooms)
  .post(createStudyRoom);

// Get, update, delete a specific study room
router.route('/:id')
  .get(getStudyRoom)
  .put(updateStudyRoom)
  .delete(deleteStudyRoom);

// Join or leave a study room
router.route('/:id/join')
  .post(joinStudyRoom);

router.route('/:id/leave')
  .post(leaveStudyRoom);

module.exports = router; 