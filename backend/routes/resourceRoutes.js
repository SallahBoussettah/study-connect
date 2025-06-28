const express = require('express');
const { 
  getResource,
  updateResource,
  deleteResource,
  downloadResource,
  getPendingResources,
  reviewResource,
  getGlobalResources,
  createGlobalResource
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create router
const router = express.Router();

// Protect all routes
router.use(protect);

// Get all global resources (not associated with study rooms)
router.route('/global')
  .get(getGlobalResources)
  .post(upload.single('file'), createGlobalResource);

// Get all pending resources for review (admin/teacher only)
router.route('/pending')
  .get(authorize('admin', 'teacher'), getPendingResources);

// Routes for individual resources
router.route('/:id')
  .get(getResource)
  .put(upload.single('file'), updateResource)
  .delete(deleteResource);

// Review a resource (admin/teacher only)
router.route('/:id/review')
  .put(authorize('admin', 'teacher'), reviewResource);

// Download route
router.route('/:id/download').get(downloadResource);

module.exports = router; 