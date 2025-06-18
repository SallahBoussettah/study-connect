const express = require('express');
const { 
  getResource,
  updateResource,
  deleteResource,
  downloadResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create router
const router = express.Router();

// Protect all routes
router.use(protect);

// Routes for individual resources
router.route('/:id')
  .get(getResource)
  .put(upload.single('file'), updateResource)
  .delete(deleteResource);

// Download route
router.route('/:id/download').get(downloadResource);

module.exports = router; 