const express = require('express');
const { register, login, getMe, updateProfile, logout, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const avatarUpload = require('../middleware/avatarUpload');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.post('/logout', protect, logout);

module.exports = router; 