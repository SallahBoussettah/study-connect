const express = require('express');
const { getDashboardData, getAdminDashboardData, getUserStorageDetails, getAdminUsers, updateUserRole, updateUserStatus, deleteUser } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data
router.get('/', protect, getDashboardData);

// Get admin dashboard data (admin only)
router.get('/admin', protect, authorize('admin'), getAdminDashboardData);

// Get user storage details (admin only)
router.get('/admin/storage', protect, authorize('admin'), getUserStorageDetails);

// User management routes (admin only)
router.get('/admin/users', protect, authorize('admin'), getAdminUsers);
router.put('/admin/users/:userId/role', protect, authorize('admin'), updateUserRole);
router.put('/admin/users/:userId/status', protect, authorize('admin'), updateUserStatus);
router.delete('/admin/users/:userId', protect, authorize('admin'), deleteUser);

module.exports = router; 