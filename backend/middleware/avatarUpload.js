const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Set up storage for uploaded avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create user folder inside avatars if it doesn't exist
    const userId = req.user.id;
    const userDir = path.join(avatarsDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp to prevent caching issues
    const timestamp = Date.now();
    const uniqueFilename = `avatar-${timestamp}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Filter for allowed image types
const fileFilter = (req, file, cb) => {
  // Accept only image file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Set up multer with configured storage and file filter
const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  }
});

// Export configured multer middleware
module.exports = avatarUpload; 