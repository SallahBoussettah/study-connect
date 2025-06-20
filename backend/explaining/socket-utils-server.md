# Understanding Socket.IO, Utilities, and Server Setup

This document explains three important aspects of your backend architecture: Socket.IO for real-time communication, utility functions, and the main server setup.

## 1. Socket.IO Implementation

Socket.IO enables real-time, bidirectional communication between clients and your server. This is crucial for features like live chat, presence tracking, and real-time updates.

### Socket.IO Setup in Your Project

Your Socket.IO implementation is in `backend/socket/index.js` and provides several key features:

#### Authentication

```javascript
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (!decoded || !decoded.id) {
      return next(new Error('Invalid authentication token'));
    }
    
    // Store the user ID in the socket object
    socket.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    return next(new Error('Authentication failed'));
  }
});
```

This middleware:
- Extracts the JWT token from the socket handshake
- Verifies the token's validity
- Stores the user ID in the socket object for later use
- Rejects unauthorized connections

#### Real-time Chat

The chat namespace (`/chat`) handles messaging in study rooms:

```javascript
chatNamespace.on('connection', (socket) => {
  // Join a study room chat
  socket.on('join-room', async (roomId) => {
    // Implementation details
  });
  
  // Send a message
  socket.on('send-message', async (data) => {
    // Implementation details
  });
  
  // Leave a room
  socket.on('leave-room', async (roomId) => {
    // Implementation details
  });
});
```

Key features:
- Room-based messaging using Socket.IO rooms
- Message persistence in the database
- User presence tracking
- Real-time notifications when users join/leave

#### Presence Tracking

Your application tracks which users are active in which study rooms:

```javascript
// In-memory cache for active users in rooms to reduce DB queries
const activeRoomUsersCache = new Map();

// Cache expiration time for room users (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;
```

This implementation:
- Uses an in-memory cache to track active users
- Updates the database less frequently than the cache
- Broadcasts presence changes to all users in a room
- Updates room active member counts

#### Performance Optimizations

Your Socket.IO implementation includes several performance optimizations:

1. **In-memory Caching**: Active users are stored in memory to reduce database queries
2. **Debounced Database Updates**: Database is updated less frequently than the in-memory cache
3. **User Information Caching**: User details are cached to avoid repeated database lookups
4. **Selective Broadcasting**: Messages are only sent to users who need to receive them

### Socket.IO Events

Your implementation handles these key events:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client → Server | User joins a study room chat |
| `leave-room` | Client → Server | User leaves a study room chat |
| `send-message` | Client → Server | User sends a message |
| `message` | Server → Client | New message received |
| `room-users` | Server → Client | List of active users in a room |
| `user-joined` | Server → Client | Notification when a user joins |
| `user-left` | Server → Client | Notification when a user leaves |
| `error` | Server → Client | Error notifications |

## 2. Utility Functions

Your project includes utility functions in `backend/utils/cache.js` that provide caching functionality:

```javascript
const getOrFetch = async (key, fetchFn, ttl = 300) => {
  // Check if cache is available
  if (!global.userCache) {
    console.warn('Cache not available, fetching data directly');
    return await fetchFn();
  }
  
  // Try to get from cache
  const cachedData = global.userCache.get(key);
  
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  // Fetch data
  const data = await fetchFn();
  
  // Cache data
  global.userCache.set(key, data, ttl);
  
  return data;
};
```

### Key Utility Functions

1. **getOrFetch**: Retrieves data from cache or fetches it if not cached
   - Takes a cache key, fetch function, and TTL (time to live)
   - Returns cached data if available, otherwise fetches and caches it

2. **cacheData**: Explicitly stores data in the cache
   - Takes a key, data, and TTL
   - Stores the data in the global cache

3. **invalidateCache**: Removes a specific item from the cache
   - Takes a cache key
   - Deletes that key from the cache

4. **invalidateCachePattern**: Removes multiple items matching a pattern
   - Takes a regular expression pattern
   - Deletes all matching keys from the cache

### How Caching Improves Performance

Caching is used throughout your application to improve performance:

- **Dashboard Data**: Caches personalized dashboard data for each user
- **User Information**: Caches user details for Socket.IO connections
- **Study Room Data**: Caches study room information for frequent access
- **Active Users**: Caches lists of active users in study rooms

This reduces database load and improves response times for frequently accessed data.

## 3. Server Setup

Your main server file (`backend/server.js`) ties everything together:

```javascript
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

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
setupSocket(server);

// Connect to database
connectDB();
```

### Key Components of the Server Setup

1. **Express Application**: Creates the main Express app
   - Configures middleware (JSON parsing, CORS, etc.)
   - Mounts routes for different API endpoints
   - Sets up error handling

2. **HTTP Server**: Creates a standard Node.js HTTP server
   - Wraps the Express app
   - Allows Socket.IO to attach to the same server

3. **Socket.IO Integration**: Sets up Socket.IO on the HTTP server
   - Enables real-time communication
   - Shares the same port as the HTTP server

4. **Database Connection**: Connects to the PostgreSQL database
   - Uses Sequelize ORM
   - Configured via the db.js file

5. **Global Cache**: Sets up a Node.js in-memory cache
   - Used for frequently accessed data
   - Configured with a 5-minute default TTL

6. **Route Mounting**: Registers API routes
   - Organizes routes by feature (auth, dashboard, study rooms, etc.)
   - Prefixes all routes with `/api`

7. **Error Handling**: Sets up centralized error handling
   - Catches 404 errors for undefined routes
   - Uses the error middleware for consistent error responses

### Server Startup

The server is started with:

```javascript
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
```

This:
- Uses the configured port (default: 5000)
- Logs the environment mode and port
- Starts both the HTTP and Socket.IO servers

## How These Components Work Together

1. **Client Request Flow**:
   - HTTP requests go through Express routes and controllers
   - Socket.IO connections handle real-time events
   - Both share the same authentication system

2. **Data Access Pattern**:
   - Check cache first (using utility functions)
   - Query database if not in cache
   - Store results in cache for future requests

3. **Real-time Updates**:
   - Database changes trigger Socket.IO events
   - Clients receive immediate updates
   - UI reflects changes without page refresh

These components form a robust architecture that handles both traditional HTTP requests and real-time communication efficiently. 