const { User } = require('../models');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });

    // Return token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Return token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar,
      bio: req.body.bio,
      institution: req.body.institution,
      major: req.body.major,
      yearOfStudy: req.body.yearOfStudy,
      interests: req.body.interests
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Update user
    const user = await User.findByPk(req.user.id);
    await user.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Get the file path
    const filePath = req.file.path;
    
    // Create a URL path that can be used by the frontend
    // Convert backslashes to forward slashes for consistent URL paths
    const relativePath = filePath.split('uploads')[1].replace(/\\/g, '/');
    const avatarUrl = `/uploads${relativePath}`;
    
    // Update user's avatar field
    const user = await User.findByPk(req.user.id);
    
    // If user already has an avatar, delete the old file
    if (user.avatar && user.avatar !== avatarUrl) {
      try {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log(`Deleted old avatar: ${oldAvatarPath}`);
        }
      } catch (err) {
        console.error('Error deleting old avatar:', err);
        // Continue even if deletion fails
      }
    }
    
    await user.update({ avatar: avatarUrl });

    res.status(200).json({
      success: true,
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    // If there was an error, delete the uploaded file
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file after failed upload:', err);
      }
    }
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

/**
 * Helper function to get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken(config.jwt.secret, config.jwt.expiresIn);

  // User data to return
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
}; 