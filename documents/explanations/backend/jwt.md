# JWT Authentication Simplified

## What is JWT? 🔐

JWT (JSON Web Token) is a secure way to pass information between your frontend and backend. Think of it like a digital ID card that:

1. Proves who the user is
2. Can't be faked or tampered with
3. Contains information about the user
4. Doesn't require the server to remember anything

## How JWT Works in Simple Steps

1. **User logs in** with email and password
2. **Server creates a JWT** (signed with a secret key)
3. **Token is sent to the browser** (stored in localStorage)
4. **Browser sends the token** with future requests
5. **Server verifies the token** to identify the user

```
┌─────────┐                               ┌─────────┐
│         │ 1. Login (email + password)   │         │
│ Browser │ ────────────────────────────> │ Server  │
│         │                               │         │
│         │ 2. JWT Token                  │         │
│         │ <──────────────────────────── │         │
└─────────┘                               └─────────┘
     │                                        ▲
     │ 3. Store token                         │
     │    in localStorage                     │
     │                                        │
     │ 4. Send token with                     │
     │    future requests                     │
     └────────────────────────────────────────┘
```

## What's Inside a JWT?

A JWT looks like this: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJyb2xlIjoic3R1ZGVudCJ9.QxTGLQpJSKHcK4xjkRgTpLKDhp4jGV_aUkXmMp4UrKQ`

It has three parts separated by dots:
1. **Header**: What type of token this is and how it's signed
2. **Payload**: The actual data (user ID, role, etc.)
3. **Signature**: Proves the token is authentic and hasn't been changed

## Two Key Examples from StudyConnect

### Example 1: Creating a JWT When a User Logs In

```javascript
// backend/controllers/authController.js (simplified)

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Send response with token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
```

In this example:
1. User provides email and password
2. Server verifies credentials
3. Server creates a JWT containing the user's ID and role
4. Server sends the token back to the client

### Example 2: Protecting Routes with JWT Authentication

```javascript
// backend/middleware/auth.js (simplified)

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user to request object
    req.user = user;
    
    // Continue to the route
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Using the middleware in routes
// backend/routes/studyRoomRoutes.js
const router = express.Router();

// Public route - no authentication needed
router.get('/public', studyRoomController.getPublicRooms);

// Protected route - authentication required
router.post('/', protect, studyRoomController.createRoom);
```

In this example:
1. The `protect` middleware checks for a valid JWT in the request header
2. If valid, it adds the user object to the request
3. If invalid, it returns a 401 Unauthorized response
4. The middleware is used to protect specific routes

## Benefits of JWT Authentication

1. **Stateless** - Server doesn't need to store session information
2. **Scalable** - Works well with multiple servers/microservices
3. **Mobile-friendly** - Easy to use in mobile apps
4. **Cross-domain** - Works across different domains

## Common JWT Mistakes to Avoid

1. ❌ **Storing sensitive data** in the token (it's encoded, not encrypted!)
2. ❌ **Using a weak secret key** for signing
3. ❌ **Not setting an expiration time** on tokens
4. ❌ **Not handling token expiration** on the client side

## Summary

- JWT is a secure way to authenticate users without server-side sessions
- The token contains user information and is digitally signed
- The client stores the token and sends it with each request
- The server verifies the token to identify the user
- In StudyConnect, JWT is used to protect routes and maintain user sessions 