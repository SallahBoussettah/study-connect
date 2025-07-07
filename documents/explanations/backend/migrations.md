# Database Migrations Simplified 🗃️

## What Are Migrations?

Migrations are like version control for your database. They help you:

1. **Track changes** to your database structure
2. **Share these changes** with your team
3. **Roll back** to previous versions if needed
4. **Keep development, testing, and production databases in sync**

Think of migrations as a series of steps that transform your database from one state to another.

## How Migrations Work in Sequelize

Migrations in Sequelize consist of two main functions:

1. **`up()`**: What to do when applying the migration (create tables, add columns, etc.)
2. **`down()`**: What to do when reverting the migration (drop tables, remove columns, etc.)

```
Migration files are stored in: /backend/migrations/
Format: YYYYMMDDHHMMSS-migration-name.js
```

## Two Key Examples from StudyConnect

### Example 1: Creating a New Table

This migration creates the Subjects table:

```javascript
// backend/migrations/20230415120000-create-subjects-table.js

'use strict';

module.exports = {
  // What happens when we apply this migration
  up: async (queryInterface, Sequelize) => {
    // Create the Subjects table with these columns
    await queryInterface.createTable('Subjects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  // What happens when we undo this migration
  down: async (queryInterface, Sequelize) => {
    // Drop the Subjects table completely
    await queryInterface.dropTable('Subjects');
  }
};
```

This migration:
1. Creates a new table called "Subjects"
2. Defines columns for id, name, description, and timestamps
3. Sets up constraints like primary key, not null, and unique
4. Provides a way to undo the creation by dropping the table

### Example 2: Modifying an Existing Table

This migration adds a new column to the StudyRooms table:

```javascript
// backend/migrations/20230510143000-add-max-participants-to-study-rooms.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new column to the StudyRooms table
    await queryInterface.addColumn('StudyRooms', 'maxParticipants', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10  // Default value if not specified
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column if we need to roll back
    await queryInterface.removeColumn('StudyRooms', 'maxParticipants');
  }
};
```

This migration:
1. Adds a new "maxParticipants" column to the StudyRooms table
2. Sets it as an integer that can't be null
3. Gives it a default value of 10
4. Provides a way to undo by removing the column

## Common Migration Operations

Here are some common operations you can perform in migrations:

```javascript
// Create a table
queryInterface.createTable('TableName', { columns });

// Add a column
queryInterface.addColumn('TableName', 'columnName', { type, options });

// Remove a column
queryInterface.removeColumn('TableName', 'columnName');

// Add an index
queryInterface.addIndex('TableName', ['column1', 'column2']);

// Add a foreign key
queryInterface.addConstraint('TableName', {
  fields: ['foreignId'],
  type: 'foreign key',
  references: { table: 'OtherTable', field: 'id' }
});
```

## Running Migrations

To run migrations, use these commands:

```bash
# Apply all pending migrations
npx sequelize-cli db:migrate

# Undo the most recent migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Create a new migration file
npx sequelize-cli migration:generate --name add-something-to-table
```

## Why Migrations Are Important

1. **Team Collaboration**: Everyone can apply the same database changes
2. **Deployment Safety**: Test changes before applying them to production
3. **History Tracking**: Keep a record of how your database evolved
4. **Consistency**: Ensure all environments have the same database structure

## Summary

- Migrations are scripts that change your database structure in a controlled way
- They have "up" methods to apply changes and "down" methods to undo them
- They run in sequence based on their timestamp
- In StudyConnect, they define tables for users, subjects, study rooms, and more
- Always test migrations on development before applying to production 