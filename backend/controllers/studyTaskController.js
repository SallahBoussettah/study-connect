const { StudyTask, User } = require('../models');
const { Op } = require('sequelize');

// Get all tasks for a user
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tasks = await StudyTask.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, priority, estimatedTime } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }
    
    const task = await StudyTask.create({
      userId,
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      estimatedTime: estimatedTime || null,
      completed: false
    });
    
    return res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, completed, dueDate, priority, estimatedTime, actualTime } = req.body;
    
    const task = await StudyTask.findOne({
      where: { id, userId }
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const updatedTask = await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      completed: completed !== undefined ? completed : task.completed,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      priority: priority || task.priority,
      estimatedTime: estimatedTime !== undefined ? estimatedTime : task.estimatedTime,
      actualTime: actualTime !== undefined ? actualTime : task.actualTime
    });
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const task = await StudyTask.findOne({
      where: { id, userId }
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const task = await StudyTask.findOne({
      where: { id, userId }
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total tasks
    const totalTasks = await StudyTask.count({
      where: { userId }
    });
    
    // Get completed tasks
    const completedTasks = await StudyTask.count({
      where: { 
        userId,
        completed: true
      }
    });
    
    // Get pending tasks
    const pendingTasks = await StudyTask.count({
      where: { 
        userId,
        completed: false
      }
    });
    
    // Get total study time
    const tasks = await StudyTask.findAll({
      where: { 
        userId,
        actualTime: {
          [Op.not]: null
        }
      },
      attributes: ['actualTime']
    });
    
    const totalStudyTime = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    
    return res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        totalStudyTime
      }
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task statistics',
      error: error.message
    });
  }
}; 