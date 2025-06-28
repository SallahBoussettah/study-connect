import api from './api';

const BASE_URL = '/study-tasks';

/**
 * Get all study tasks for the current user
 * @returns {Promise} Promise with tasks data
 */
export const getUserTasks = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get a specific task by ID
 * @param {string} taskId - The ID of the task to fetch
 * @returns {Promise} Promise with task data
 */
export const getTask = async (taskId) => {
  try {
    const response = await api.get(`${BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Create a new study task
 * @param {Object} taskData - The task data
 * @param {string} taskData.title - The task title
 * @param {string} [taskData.description] - The task description
 * @param {Date} [taskData.dueDate] - The task due date
 * @param {string} [taskData.priority] - The task priority (low, medium, high)
 * @param {number} [taskData.estimatedTime] - The estimated time in minutes
 * @returns {Promise} Promise with created task data
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post(BASE_URL, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing study task
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The task data to update
 * @returns {Promise} Promise with updated task data
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`${BASE_URL}/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Delete a study task
 * @param {string} taskId - The ID of the task to delete
 * @returns {Promise} Promise with success message
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get task statistics
 * @returns {Promise} Promise with task statistics data
 */
export const getTaskStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    throw error;
  }
}; 