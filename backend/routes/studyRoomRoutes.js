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

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all study rooms and create a new study room
router.route('/')
  .get(getStudyRooms)
  .post(createStudyRoom);

// Get, update, delete a specific study room
router.route('/:id')
  .get(getStudyRoom)
  .put(updateStudyRoom)
  .delete(deleteStudyRoom);

// Join and leave a study room
router.post('/:id/join', joinStudyRoom);
router.post('/:id/leave', leaveStudyRoom);

module.exports = router; 