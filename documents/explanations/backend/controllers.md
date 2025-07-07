# Controllers

## What are Controllers?

Controllers are functions that handle the application logic for specific routes in your API. They:

1. Receive requests from clients
2. Process data and interact with models
3. Return appropriate responses

Controllers follow the MVC (Model-View-Controller) pattern, separating the business logic from the routes.

## How Controllers Work

1. **Route mapping**: Routes direct requests to specific controller functions
2. **Request processing**: Controllers extract data from the request (body, params, query)
3. **Business logic**: Controllers perform operations using models
4. **Response generation**: Controllers send back appropriate responses

## Example from StudyConnect

### Basic Controller Structure

```javascript
// backend/controllers/subjectController.js

const { Subject, Resource, User } = require('../models');

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    // Find all subjects in the database
    const subjects = await Subject.findAll({
      // Include related resources (limited attributes)
      include: [
        {
          model: Resource,
          as: 'resources',
          attributes: ['id', 'title', 'type']
        }
      ],
      // Order by name alphabetically
      order: [['name', 'ASC']]
    });
    
    // Return success response with subjects
    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    // Return error response if something goes wrong
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

// Get a single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find subject by primary key (id)
    const subject = await Subject.findByPk(id, {
      // Include related resources and users
      include: [
        {
          model: Resource,
          as: 'resources'
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          through: { attributes: [] } // Don't include join table attributes
        }
      ]
    });
    
    // If subject not found, return 404 error
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    
    // Return success response with subject
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error.message
    });
  }
};

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    // Create new subject in database
    const subject = await Subject.create({
      name,
      category,
      description,
      icon: req.file ? req.file.filename : 'default-subject-icon.svg'
    });
    
    // Return success response with created subject
    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
};

// Update a subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;
    
    // Find subject by id
    const subject = await Subject.findByPk(id);
    
    // If subject not found, return 404 error
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    
    // Update subject properties
    subject.name = name || subject.name;
    subject.category = category || subject.category;
    subject.description = description || subject.description;
    
    // If file uploaded, update icon
    if (req.file) {
      subject.icon = req.file.filename;
    }
    
    // Save changes to database
    await subject.save();
    
    // Return success response with updated subject
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
};

// Delete a subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find subject by id
    const subject = await Subject.findByPk(id);
    
    // If subject not found, return 404 error
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with id ${id} not found`
      });
    }
    
    // Delete subject from database
    await subject.destroy();
    
    // Return success response
    res.json({
      success: true,
      message: `Subject with id ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
```

### Using Controllers in Routes

```javascript
// backend/routes/subjectRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');
const upload = require('../middleware/upload');

// Public route - anyone can get all subjects
router.get('/', subjectController.getAllSubjects);

// Public route - anyone can get a specific subject
router.get('/:id', subjectController.getSubjectById);

// Protected routes - only authenticated users with admin role can create/update/delete
router.post('/', protect, authorize('admin'), upload.single('icon'), subjectController.createSubject);
router.put('/:id', protect, authorize('admin'), upload.single('icon'), subjectController.updateSubject);
router.delete('/:id', protect, authorize('admin'), subjectController.deleteSubject);

module.exports = router;
```

## Key Takeaways

1. **Separation of Concerns**: Controllers separate route handling from business logic
2. **Reusability**: Controller functions can be reused across different routes
3. **Maintainability**: Easier to maintain and test when logic is organized in controllers
4. **Error Handling**: Centralized error handling for each operation
5. **Response Formatting**: Consistent response structure across the API 