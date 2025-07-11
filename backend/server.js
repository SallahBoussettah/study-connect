const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { connectDB } = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/error');
const NodeCache = require('node-cache');
const { setupSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studyRoomRoutes = require('./routes/studyRoomRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const friendRoutes = require('./routes/friendRoutes');
const directMessageRoutes = require('./routes/directMessageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studyTaskRoutes = require('./routes/studyTaskRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');

// Load environment variables
dotenv.config();

// Create global cache for frequently accessed data
global.userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
setupSocket(server);

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static file serving for uploads
// Note: In production, you'd want to put this behind authentication
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages/direct', directMessageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/study-tasks', studyTaskRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StudyConnect API' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
}); 