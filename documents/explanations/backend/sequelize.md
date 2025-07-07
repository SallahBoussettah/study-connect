# Sequelize ORM

## What is Sequelize?

Sequelize is an Object-Relational Mapping (ORM) library for Node.js. It makes it easier to work with databases by letting you interact with your database using JavaScript objects instead of writing raw SQL queries.

## How Sequelize Works

1. **Models**: Define JavaScript classes that represent database tables
2. **Queries**: Use JavaScript methods instead of SQL to query the database
3. **Associations**: Define relationships between tables (one-to-many, many-to-many, etc.)
4. **Migrations**: Manage database schema changes over time

## Example from StudyConnect

### Model Definition

```javascript
// backend/models/Subject.js - Defining a Subject model

'use strict';
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
  }, {
    timestamps: true,
    tableName: 'subjects'
  });

  // Define associations with other models
  Subject.associate = function(models) {
    // A subject can be chosen by many users (through UserSubject)
    Subject.belongsToMany(models.User, {
      through: 'UserSubject',
      foreignKey: 'subjectId',
      otherKey: 'userId',
      as: 'users'
    });
    
    // A subject can have many resources
    Subject.hasMany(models.Resource, {
      foreignKey: 'subjectId',
      as: 'resources'
    });
  };

  return Subject;
};
```

### Using Models in Controllers

```javascript
// Example from a controller using Sequelize methods

const { Subject, Resource } = require('../models');

// Get all subjects with their resources
const getAllSubjects = async (req, res) => {
  try {
    // Using Sequelize's findAll method instead of writing SQL
    const subjects = await Subject.findAll({
      include: [
        {
          model: Resource,
          as: 'resources',
          attributes: ['id', 'title', 'type']
        }
      ],
      order: [['name', 'ASC']]
    });
    
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
```

### Creating Records

```javascript
// Example of creating a new record

const createSubject = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    // Create a new subject using Sequelize's create method
    const subject = await Subject.create({
      name,
      category,
      description,
      icon: req.file ? req.file.filename : 'default-subject-icon.svg'
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

## Key Takeaways

1. **No SQL needed**: Sequelize lets you work with databases using JavaScript, without writing raw SQL
2. **Data validation**: Built-in validation helps ensure data integrity
3. **Relationships**: Easily define and work with relationships between tables
4. **Database agnostic**: Works with multiple database types (PostgreSQL, MySQL, SQLite, etc.)
5. **Migrations**: Helps manage database schema changes over time 