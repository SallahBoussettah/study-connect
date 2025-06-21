const express = require('express');
const { getDashboardData, getAdminDashboardData, getUserStorageDetails } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data
router.get('/', protect, getDashboardData);

// Get admin dashboard data (admin only)
router.get('/admin', protect, authorize('admin'), getAdminDashboardData);

// Get user storage details (admin only)
router.get('/admin/storage', protect, authorize('admin'), getUserStorageDetails);

module.exports = router; 