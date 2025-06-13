# StudyConnect Backend Implementation Plan

## Overview

This document outlines a comprehensive plan for implementing the backend of the StudyConnect application. The backend will support all features currently mocked in the frontend, including user authentication, study rooms, real-time messaging, resource sharing, and more.

## Technology Stack

- **Runtime Environment**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **File Storage**: AWS S3 or Firebase Storage
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest and Supertest
- **Deployment**: Docker, AWS/DigitalOcean/Heroku

## Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── db.js               # Database connection
│   ├── socket.js           # Socket.IO setup
│   └── config.js           # Environment variables
├── controllers/            # Route controllers
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   ├── error.js            # Error handling middleware
│   └── upload.js           # File upload middleware
├── models/                 # Database models
├── migrations/             # Database migrations
├── seeders/                # Database seeders
├── routes/                 # API routes
├── services/               # Business logic
├── utils/                  # Utility functions
├── validations/            # Request validation schemas
├── tests/                  # Test files
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── .sequelizerc            # Sequelize configuration
└── server.js               # Entry point
```

## Database Models

Based on the database schema (see `database_schema.puml`), we'll implement the following Sequelize models:

1. User
2. UserPreference
3. Subject
4. UserSubject
5. StudyRoom
6. StudyRoomMember
7. StudyRoomRequest
8. Message
9. Resource
10. Event
11. EventAttendee
12. FlashcardDeck
13. Flashcard
14. StudySession
15. Notification

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users` - Get users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/preferences` - Get user preferences
- `PUT /api/users/:id/preferences` - Update user preferences
- `GET /api/users/:id/subjects` - Get user subjects/interests
- `POST /api/users/:id/subjects` - Add user subject/interest
- `DELETE /api/users/:id/subjects/:subjectId` - Remove user subject/interest

### Subjects

- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a subject (admin only)
- `GET /api/subjects/:id` - Get subject by ID
- `PUT /api/subjects/:id` - Update subject (admin only)
- `DELETE /api/subjects/:id` - Delete subject (admin only)

### Study Rooms

- `GET /api/rooms` - Get all rooms (with filters)
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room by ID
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `POST /api/rooms/:id/join` - Join a room
- `POST /api/rooms/:id/leave` - Leave a room
- `GET /api/rooms/:id/members` - Get room members
- `PUT /api/rooms/:id/members/:userId` - Update member role
- `DELETE /api/rooms/:id/members/:userId` - Remove member
- `GET /api/rooms/:id/requests` - Get join requests
- `POST /api/rooms/:id/requests/:requestId/approve` - Approve join request
- `POST /api/rooms/:id/requests/:requestId/reject` - Reject join request

### Messages

- `GET /api/rooms/:id/messages` - Get room messages
- `POST /api/rooms/:id/messages` - Send a message
- `PUT /api/rooms/:id/messages/:messageId` - Edit a message
- `DELETE /api/rooms/:id/messages/:messageId` - Delete a message
- `POST /api/rooms/:id/messages/:messageId/read` - Mark message as read

### Resources

- `GET /api/resources` - Get all resources (with filters)
- `POST /api/resources` - Upload a resource
- `GET /api/resources/:id` - Get resource by ID
- `PUT /api/resources/:id` - Update resource metadata
- `DELETE /api/resources/:id` - Delete resource
- `GET /api/rooms/:id/resources` - Get room resources
- `POST /api/resources/:id/download` - Track resource download

### Events

- `GET /api/events` - Get all events (with filters)
- `POST /api/events` - Create an event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/rooms/:id/events` - Get room events
- `POST /api/events/:id/attend` - Attend an event
- `PUT /api/events/:id/attendance` - Update attendance status

### Flashcards

- `GET /api/flashcard-decks` - Get all flashcard decks
- `POST /api/flashcard-decks` - Create a flashcard deck
- `GET /api/flashcard-decks/:id` - Get flashcard deck by ID
- `PUT /api/flashcard-decks/:id` - Update flashcard deck
- `DELETE /api/flashcard-decks/:id` - Delete flashcard deck
- `GET /api/flashcard-decks/:id/cards` - Get flashcards in a deck
- `POST /api/flashcard-decks/:id/cards` - Add a flashcard
- `PUT /api/flashcard-decks/:id/cards/:cardId` - Update a flashcard
- `DELETE /api/flashcard-decks/:id/cards/:cardId` - Delete a flashcard

### Study Sessions

- `GET /api/study-sessions` - Get user study sessions
- `POST /api/study-sessions` - Create a study session
- `PUT /api/study-sessions/:id` - Update a study session
- `DELETE /api/study-sessions/:id` - Delete a study session
- `GET /api/users/:id/study-sessions` - Get user study sessions

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Real-time Features with Socket.IO

### Events to Implement

- `connection` - Client connects
- `disconnect` - Client disconnects
- `joinRoom` - User joins a study room
- `leaveRoom` - User leaves a study room
- `sendMessage` - User sends a message
- `messageReceived` - New message received
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing
- `userJoined` - User joined a room
- `userLeft` - User left a room
- `userOnline` - User came online
- `userOffline` - User went offline
- `callStarted` - Video/audio call started
- `callEnded` - Video/audio call ended
- `screenShareStarted` - Screen sharing started
- `screenShareEnded` - Screen sharing ended

### Socket.IO Implementation

```javascript
// config/socket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} ${socket.user.lastName}`);
    
    // Update user status to online
    socket.broadcast.emit('userOnline', { userId: socket.user.id });
    
    // Join room
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.firstName} joined room: ${roomId}`);
      
      // Notify room members
      socket.to(roomId).emit('userJoined', {
        userId: socket.user.id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName
      });
    });
    
    // Leave room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.user.firstName} left room: ${roomId}`);
      
      // Notify room members
      socket.to(roomId).emit('userLeft', {
        userId: socket.user.id
      });
    });
    
    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        // Save message to database
        const message = await Message.create({
          room_id: data.roomId,
          sender_id: socket.user.id,
          content: data.content,
          is_system: false,
          created_at: new Date(),
          read_by: [socket.user.id]
        });
        
        // Broadcast to room
        io.to(data.roomId).emit('messageReceived', {
          id: message.id,
          roomId: data.roomId,
          sender: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName
          },
          content: data.content,
          timestamp: message.created_at,
          isSystem: false
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // User typing
    socket.on('userTyping', (roomId) => {
      socket.to(roomId).emit('userTyping', {
        userId: socket.user.id,
        firstName: socket.user.firstName
      });
    });
    
    // User stopped typing
    socket.on('userStoppedTyping', (roomId) => {
      socket.to(roomId).emit('userStoppedTyping', {
        userId: socket.user.id
      });
    });
    
    // Video/audio call events
    socket.on('callStarted', (data) => {
      socket.to(data.roomId).emit('callStarted', {
        roomId: data.roomId,
        initiator: socket.user.id,
        callType: data.callType
      });
    });
    
    socket.on('callEnded', (data) => {
      socket.to(data.roomId).emit('callEnded', {
        roomId: data.roomId,
        userId: socket.user.id
      });
    });
    
    // Screen sharing
    socket.on('screenShareStarted', (data) => {
      socket.to(data.roomId).emit('screenShareStarted', {
        roomId: data.roomId,
        userId: socket.user.id
      });
    });
    
    socket.on('screenShareEnded', (data) => {
      socket.to(data.roomId).emit('screenShareEnded', {
        roomId: data.roomId,
        userId: socket.user.id
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.firstName}`);
      io.emit('userOffline', { userId: socket.user.id });
    });
  });

  return io;
};

module.exports = setupSocket;
```

## Authentication Implementation

### JWT Authentication

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
```

## File Upload Implementation

### AWS S3 Integration

```javascript
// middleware/upload.js
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX and TXT files are allowed.'), false);
  }
};

// Configure multer for S3 upload
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, `resources/${fileName}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
```

## Implementation Phases

### Phase 1: Core Setup (Week 1-2)
- Set up project structure and dependencies
- Implement database connection
- Create basic User model and authentication
- Set up basic Express server with middleware

### Phase 2: Authentication & User Management (Week 3-4)
- Complete user registration and login
- Implement JWT authentication
- Create user profile management
- Set up email verification

### Phase 3: Study Rooms & Members (Week 5-6)
- Implement study room CRUD operations
- Create room membership management
- Set up join requests system
- Implement room search and filtering

### Phase 4: Messaging & Real-time Features (Week 7-8)
- Set up Socket.IO for real-time communication
- Implement messaging system
- Create notifications system
- Set up presence indicators (online/offline)

### Phase 5: Resources & File Management (Week 9-10)
- Implement AWS S3 integration
- Create resource upload and management
- Set up file type validation
- Implement resource sharing permissions

### Phase 6: Events & Study Sessions (Week 11-12)
- Create events system
- Implement study session tracking
- Set up reminders and notifications
- Create calendar integration

### Phase 7: Flashcards & Study Tools (Week 13-14)
- Implement flashcard system
- Create study timer
- Set up progress tracking
- Implement analytics

### Phase 8: Testing & Optimization (Week 15-16)
- Write unit and integration tests
- Perform security audits
- Optimize database queries
- Load testing and performance optimization

## Deployment Strategy

### Development Environment
- Local development with Docker
- PostgreSQL running in Docker container
- Local S3-compatible storage (MinIO)

### Staging Environment
- AWS EC2 or DigitalOcean Droplet
- Managed PostgreSQL database (AWS RDS or DigitalOcean Managed Database)
- AWS S3 for file storage
- CI/CD with GitHub Actions

### Production Environment
- AWS EC2 or DigitalOcean Droplet with load balancer
- Managed PostgreSQL database with read replicas (AWS RDS or DigitalOcean Managed Database)
- AWS S3 for file storage
- CDN for static assets
- CI/CD with GitHub Actions
- Automated backups

## Monitoring and Maintenance

- Implement logging with Winston
- Set up error tracking with Sentry
- Create health check endpoints
- Implement rate limiting
- Set up automated database backups
- Create documentation for API endpoints

## Security Considerations

- Implement HTTPS
- Set up CORS properly
- Use helmet.js for security headers
- Implement rate limiting
- Sanitize user inputs
- Set up proper validation for all inputs
- Implement CSRF protection
- Regular security audits
- Secure environment variables

## Conclusion

This implementation plan provides a comprehensive roadmap for developing the StudyConnect backend. By following this plan, we can create a robust, scalable, and secure backend that supports all the features currently mocked in the frontend.

The plan is designed to be implemented in phases, allowing for incremental development and testing. Each phase builds upon the previous one, ensuring that core functionality is in place before moving on to more advanced features.

Once implemented, the backend will provide a solid foundation for the StudyConnect platform, enabling students to connect, collaborate, and study together effectively. 