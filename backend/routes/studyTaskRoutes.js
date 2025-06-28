const express = require('express');
const router = express.Router();
const studyTaskController = require('../controllers/studyTaskController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Get all tasks for the authenticated user
router.get('/', studyTaskController.getUserTasks);

// Get task statistics
router.get('/stats', studyTaskController.getTaskStats);

// Get a specific task
router.get('/:id', studyTaskController.getTask);

// Create a new task
router.post('/', studyTaskController.createTask);

// Update a task
router.put('/:id', studyTaskController.updateTask);

// Delete a task
router.delete('/:id', studyTaskController.deleteTask);

module.exports = router; 