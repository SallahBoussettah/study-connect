# StudyConnect Website Analysis & Backend Implementation Plan

## Website Analysis

### Project Structure
The project is a React-based web application built with Vite, using modern React features and libraries:
- **Frontend Framework**: React 19.0.0 with React Router v7 for routing
- **Styling**: Tailwind CSS for responsive design with custom utility classes
- **Form Handling**: Formik with Yup for validation
- **HTTP Client**: Axios for API requests
- **Icons**: React Icons library
- **Build Tool**: Vite for fast development and building

### Authentication System
The frontend has implemented an authentication system with:
- Context API for state management (AuthContext)
- JWT token-based authentication (currently mocked)
- User roles (admin and student)
- Protected routes based on authentication status and roles
- Login, registration, and logout functionality

### Main Features

#### Public Pages
- **Landing Page**: Introduction to the platform with hero section, features, testimonials, and call-to-action
- **Login/Registration**: User authentication forms with validation
- **Other Public Pages**: About, Features, Pricing, Contact

#### Dashboard
- **Dashboard Home**: Overview with active study rooms, upcoming events, notifications, and quick actions
- **Study Rooms**: A core feature allowing students to create and join virtual study groups
- **Study Room Detail**: Comprehensive interface for collaboration including:
  - Real-time chat (currently mocked)
  - Video/audio conferencing capabilities (UI only)
  - Resource sharing
  - Participant management
- **Resources**: File sharing and educational resource management
- **Study Timer**: Productivity tool for time management
- **Flashcards**: Learning tool for memorization
- **Profile & Settings**: User profile management

### Current State
The frontend is well-structured with a clean, modern UI using Tailwind CSS. The application currently uses mock data throughout to simulate backend functionality, but there's no actual backend integration yet.

## Backend Development Recommendations

Based on the frontend implementation, here are recommendations for developing the backend:

### 1. Backend Technology Stack
- **Node.js with Express.js**: For a JavaScript-based backend that complements the React frontend
- **PostgreSQL**: Relational database for structured data storage with strong relationships between entities
- **Sequelize**: ORM for PostgreSQL to create models, manage migrations, and handle database operations
- **JWT**: For authentication (already set up in the frontend)
- **Socket.IO**: For real-time features like chat and video conferencing
- **Multer**: For file uploads (resources)

### 2. API Structure
Create a RESTful API with the following endpoints:

#### Authentication
- POST `/api/auth/register`: User registration
- POST `/api/auth/login`: User login
- POST `/api/auth/logout`: User logout
- GET `/api/auth/me`: Get current user data
- PUT `/api/auth/me`: Update user profile

#### Study Rooms
- GET `/api/rooms`: Get all public rooms or user's rooms
- POST `/api/rooms`: Create a new study room
- GET `/api/rooms/:id`: Get a specific room details
- PUT `/api/rooms/:id`: Update room details
- DELETE `/api/rooms/:id`: Delete a room
- POST `/api/rooms/:id/join`: Join a room
- POST `/api/rooms/:id/leave`: Leave a room

#### Messages
- GET `/api/rooms/:id/messages`: Get messages for a room
- POST `/api/rooms/:id/messages`: Send a message to a room

#### Resources
- GET `/api/resources`: Get all resources (with filters)
- POST `/api/resources`: Upload a new resource
- GET `/api/resources/:id`: Get a specific resource
- DELETE `/api/resources/:id`: Delete a resource
- GET `/api/rooms/:id/resources`: Get resources for a specific room

#### Events/Sessions
- GET `/api/events`: Get upcoming study sessions
- POST `/api/events`: Create a new study session
- PUT `/api/events/:id`: Update a study session
- DELETE `/api/events/:id`: Delete a study session

### 3. Real-time Features Implementation
- Implement WebSockets using Socket.IO for:
  - Real-time chat messaging
  - Video/audio conferencing (or integrate with a service like Twilio or Agora)
  - User presence (online/offline status)
  - Typing indicators

### 4. Database Schema Design

#### User Model
```javascript
// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('student', 'admin'),
      defaultValue: 'student'
    },
    avatar: DataTypes.STRING(255),
    bio: DataTypes.TEXT,
    subjects: DataTypes.ARRAY(DataTypes.STRING),
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasOne(models.UserPreference);
    User.hasMany(models.StudyRoom, { foreignKey: 'ownerId', as: 'ownedRooms' });
    User.belongsToMany(models.StudyRoom, { through: models.StudyRoomMember });
    User.hasMany(models.Message, { foreignKey: 'senderId' });
    User.hasMany(models.Resource, { foreignKey: 'uploadedById' });
  };

  return User;
};
```

#### Study Room Model
```javascript
// models/StudyRoom.js
module.exports = (sequelize, DataTypes) => {
  const StudyRoom = sequelize.define('StudyRoom', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: DataTypes.TEXT,
    subject: DataTypes.STRING,
    image: DataTypes.STRING(255),
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accessCode: DataTypes.STRING(50),
    maxMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 20
    },
    lastActive: DataTypes.DATE
  }, {
    timestamps: true,
    underscored: true
  });

  StudyRoom.associate = (models) => {
    StudyRoom.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    StudyRoom.belongsToMany(models.User, { through: models.StudyRoomMember });
    StudyRoom.hasMany(models.Message);
    StudyRoom.hasMany(models.Resource);
    StudyRoom.hasMany(models.Event);
  };

  return StudyRoom;
};
```

#### Message Model
```javascript
// models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readBy: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.StudyRoom);
    Message.belongsTo(models.User, { foreignKey: 'senderId' });
    Message.belongsTo(models.Message, { as: 'parentMessage', foreignKey: 'parentId' });
  };

  return Message;
};
```

#### Resource Model
```javascript
// models/Resource.js
module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: DataTypes.TEXT,
    fileUrl: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fileType: DataTypes.STRING(50),
    fileSize: DataTypes.INTEGER,
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Resource.associate = (models) => {
    Resource.belongsTo(models.StudyRoom);
    Resource.belongsTo(models.User, { foreignKey: 'uploadedById' });
  };

  return Resource;
};
```

#### Event Model
```javascript
// models/Event.js
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: DataTypes.TEXT,
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurrencePattern: DataTypes.STRING(100),
    reminderTime: DataTypes.INTEGER,
    location: DataTypes.STRING(255),
    meetingLink: DataTypes.STRING(255),
    status: {
      type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
      defaultValue: 'scheduled'
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Event.associate = (models) => {
    Event.belongsTo(models.StudyRoom);
    Event.belongsTo(models.User, { foreignKey: 'createdById' });
    Event.belongsToMany(models.User, { through: models.EventAttendee });
  };

  return Event;
};
```

### 5. Authentication and Security
- Implement password hashing with bcrypt
- JWT token generation and validation
- Role-based access control
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration

### 6. File Storage
- Use cloud storage like AWS S3 or Firebase Storage for resource files
- Implement file type validation and size limits

### 7. Development Approach
1. Set up the basic Express server and PostgreSQL connection with Sequelize
2. Create database migrations for the main tables
3. Implement authentication endpoints and middleware
4. Create core models and API endpoints
5. Implement real-time features with Socket.IO
6. Connect frontend to backend by updating the AuthContext and other services
7. Test the full application flow
8. Implement error handling and logging

### 8. Additional Features to Consider
- Email verification for new accounts
- Password reset functionality
- Notifications system (email and in-app)
- Search functionality for study rooms and resources
- Analytics for study time and activity

## Backend Implementation Steps

### Step 1: Project Setup
1. Create a new directory for the backend
2. Initialize a new Node.js project with `npm init`
3. Install necessary dependencies:
   ```bash
   npm install express mongoose jsonwebtoken bcrypt cors dotenv socket.io multer
   npm install --save-dev nodemon
   ```
4. Create basic folder structure:
   ```
   backend/
   ├── config/
   │   └── db.js
   ├── controllers/
   ├── middleware/
   │   └── auth.js
   ├── models/
   ├── routes/
   ├── utils/
   ├── .env
   ├── .gitignore
   ├── package.json
   └── server.js
   ```

### Step 2: Database Connection
Set up PostgreSQL connection using Sequelize in `config/db.js`:

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 3: Create Models
Create Sequelize models for User, StudyRoom, Message, Resource, and Event based on the schema designs above.

### Step 4: Authentication Middleware
Implement JWT authentication middleware in `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findByPk(decoded.id);

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
```

### Step 5: Implement API Routes and Controllers
Create controllers and routes for each resource (users, study rooms, messages, resources, events).

### Step 6: Socket.IO Integration
Set up Socket.IO for real-time communication:

```javascript
const socketIo = require('socket.io');

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    socket.on('sendMessage', async (data) => {
      // Save message to database
      // Broadcast to room
      io.to(data.roomId).emit('newMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = setupSocket;
```

### Step 7: Server Setup
Set up the Express server in `server.js`:

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSocket = require('./socket');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/events', require('./routes/events'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set up Socket.IO
const io = setupSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

## Frontend-Backend Integration

After implementing the backend, update the frontend AuthContext and other services to connect to the real API endpoints instead of using mock data. This involves:

1. Creating API service files for each resource
2. Updating the AuthContext to use real JWT authentication
3. Implementing Socket.IO client for real-time features
4. Handling file uploads for resources

## Deployment Considerations

For deploying the full-stack application:

1. **Backend**: Deploy to a cloud platform like Heroku, AWS, or Digital Ocean
2. **Frontend**: Continue using Netlify as indicated in your netlify.toml file
3. **Database**: Use PostgreSQL Atlas for the database
4. **File Storage**: AWS S3 or Firebase Storage for file uploads
5. **Environment Variables**: Set up environment variables for sensitive information
6. **CORS**: Configure CORS settings to allow communication between frontend and backend
7. **WebSockets**: Ensure the hosting platform supports WebSockets for Socket.IO

## Conclusion

The StudyConnect frontend provides an excellent foundation for building a complete student collaboration platform. By implementing the backend as outlined above, you'll create a fully functional application that enables students to connect, collaborate, and study together effectively. 