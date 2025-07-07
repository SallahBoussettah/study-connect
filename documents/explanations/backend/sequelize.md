# Sequelize ORM Simplified

## What is Sequelize? 🗃️

Sequelize is a tool that helps your JavaScript code talk to databases. Instead of writing complex SQL queries, you can use simple JavaScript objects and methods.

Think of it like this:
- **Without Sequelize**: Write SQL like `SELECT * FROM users WHERE age > 18`
- **With Sequelize**: Write JavaScript like `User.findAll({ where: { age: { [Op.gt]: 18 } } })`

## Why Use Sequelize?

- **Easier to read and write** - Use JavaScript instead of SQL
- **Prevents SQL injection** - Automatically protects against common security issues
- **Works with many databases** - MySQL, PostgreSQL, SQLite, and more
- **Handles relationships** - Easily work with connected data (like users and their posts)

## Two Key Examples from StudyConnect

### Example 1: Defining a Model

A model is like a blueprint for a database table. Here's how StudyConnect defines the Subject model:

```javascript
// backend/models/Subject.js (simplified)

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    // Define columns for the subjects table
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Subject name is required'
        }
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    icon: {
      type: DataTypes.STRING(255)
    }
  });

  // Define relationships with other models
  Subject.associate = function(models) {
    // A subject can be chosen by many users
    Subject.belongsToMany(models.User, {
      through: 'UserSubject',
      foreignKey: 'subjectId',
      as: 'users'
    });
  };

  return Subject;
};
```

This code creates a database table called `subjects` with columns for `id`, `name`, `category`, `description`, and `icon`. It also sets up a many-to-many relationship with the `User` model.

### Example 2: Using the Model in a Controller

Once you have a model, you can use it to interact with the database:

```javascript
// backend/controllers/subjectController.js (simplified)

const { Subject, User } = require('../models');

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    // Find all subjects in the database
    const subjects = await Subject.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName'],
          through: { attributes: [] } // Don't include join table
        }
      ],
      order: [['name', 'ASC']]
    });
    
    // Send the results back to the client
    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    // Create a new record in the database
    const subject = await Subject.create({
      name,
      category,
      description,
      icon: req.file ? req.file.filename : 'default-icon.svg'
    });
    
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
```

This controller has two functions:
1. `getAllSubjects` - Gets all subjects from the database, including related users
2. `createSubject` - Creates a new subject in the database

## Common Sequelize Operations

| What you want to do | SQL | Sequelize |
|---------------------|-----|-----------|
| Get all records | `SELECT * FROM users` | `User.findAll()` |
| Get one record | `SELECT * FROM users WHERE id = 1` | `User.findByPk(1)` |
| Create a record | `INSERT INTO users (name, age) VALUES ('John', 25)` | `User.create({ name: 'John', age: 25 })` |
| Update a record | `UPDATE users SET age = 26 WHERE id = 1` | `User.update({ age: 26 }, { where: { id: 1 } })` |
| Delete a record | `DELETE FROM users WHERE id = 1` | `User.destroy({ where: { id: 1 } })` |

## Summary

- Sequelize is an ORM that lets you use JavaScript to work with databases
- Models define the structure of your database tables
- Relationships between models (like one-to-many) are easy to set up
- Queries are written in JavaScript instead of SQL
- Data validation happens automatically based on your model definitions 