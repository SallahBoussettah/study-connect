# Controllers Simplified

## What are Controllers? 🎮

Controllers are like traffic directors for your app. They:
1. Receive requests from users
2. Process the data
3. Talk to the database
4. Send back responses

Think of controllers as the "brains" of your API endpoints. When a user makes a request, the controller decides what to do with it.

## Why Use Controllers?

Without controllers, your route files would be huge and messy! Controllers help you:

- **Organize your code** - Keep related functionality together
- **Reuse logic** - The same controller function can be used by multiple routes
- **Test more easily** - Test controller functions separately from routes
- **Follow MVC pattern** - Model-View-Controller is a proven architecture pattern

## Two Key Examples from StudyConnect

### Example 1: Getting Data from the Database

This controller function gets all subjects from the database:

```javascript
// backend/controllers/subjectController.js (simplified)

const { Subject, User } = require('../models');

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    // Step 1: Get data from database
    const subjects = await Subject.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['name', 'ASC']] // Sort alphabetically
    });
    
    // Step 2: Send successful response
    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    // Step 3: Handle any errors
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};
```

This controller function:
1. Gets all subjects from the database
2. Includes related user data
3. Orders them alphabetically
4. Returns a nicely formatted response
5. Handles any errors that might occur

### Example 2: Creating Data in the Database

This controller function creates a new study room:

```javascript
// backend/controllers/studyRoomController.js (simplified)

const { StudyRoom } = require('../models');

// Create a new study room
const createRoom = async (req, res) => {
  try {
    // Step 1: Get data from request body
    const { name, description, isPublic, subject } = req.body;
    
    // Step 2: Validate the data
    if (!name || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and subject'
      });
    }
    
    // Step 3: Create record in database
    const room = await StudyRoom.create({
      name,
      description,
      isPublic,
      subject,
      createdBy: req.user.id // From auth middleware
    });
    
    // Step 4: Add creator as first participant
    await room.addParticipant(req.user.id, { 
      through: { role: 'admin' } 
    });
    
    // Step 5: Send successful response
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    // Step 6: Handle any errors
    res.status(400).json({
      success: false,
      message: 'Failed to create study room',
      error: error.message
    });
  }
};
```

This controller function:
1. Gets data from the request body
2. Validates that required fields are present
3. Creates a new record in the database
4. Sets up relationships (adding the creator as a participant)
5. Returns the created room
6. Handles any errors that might occur

## How Controllers Connect to Routes

Controllers are connected to routes like this:

```javascript
// backend/routes/subjectRoutes.js (simplified)

const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

// Public route - anyone can access
router.get('/', subjectController.getAllSubjects);

// Protected route - only authenticated users can access
router.post('/', protect, subjectController.createSubject);

module.exports = router;
```

## Controller Best Practices

1. **Keep it focused** - Each controller function should do one thing well
2. **Use try/catch** - Always handle potential errors
3. **Validate input** - Check that required data is present and valid
4. **Consistent responses** - Use a consistent format for all responses
5. **Status codes** - Use appropriate HTTP status codes (200, 201, 400, 404, 500, etc.)

## Summary

- Controllers handle the logic for your API endpoints
- They receive requests, process data, and send responses
- They keep your route files clean and organized
- They make your code more reusable and testable
- In StudyConnect, controllers manage all database operations 