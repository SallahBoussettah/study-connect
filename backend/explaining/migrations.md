# Understanding Database Migrations

## What are Migrations?

Database migrations are a way to manage changes to your database schema over time. They allow you to:

1. **Track Changes**: Keep a history of how your database schema evolves
2. **Version Control**: Manage database changes alongside your code
3. **Team Collaboration**: Allow multiple developers to make and share database changes
4. **Deployment**: Easily apply database changes across different environments (development, staging, production)
5. **Rollback**: Revert database changes if needed

In your project, migrations are managed using Sequelize, which provides tools to create and run migrations.

## How Migrations Work

Each migration file has two main functions:

1. **up()**: Specifies what changes to make when applying the migration
2. **down()**: Specifies how to undo those changes if the migration needs to be rolled back

Migrations are typically run in order based on their timestamps, which is why your migration files have names like `20250613000001-create-user.js`.

## Example Migration 1: Creating the Users Table

Let's look at the `20250613000001-create-user.js` migration:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      // ... other fields ...
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

### What This Migration Does:

1. **Creates a Table**: The `up` function creates a new table called `users`

2. **Defines Columns**:
   - `id`: A UUID primary key that auto-generates using UUIDV4
   - `firstName`: A required string field with max length of 100
   - `lastName`: A required string field with max length of 100
   - `email`: A required unique string field with max length of 255
   - `password`: A required string field for storing hashed passwords
   - `role`: An enum field with possible values 'student', 'teacher', 'admin'
   - Various optional fields for user profile information
   - Standard timestamp fields (`createdAt` and `updatedAt`)

3. **Rollback Strategy**: The `down` function simply drops the `users` table if the migration needs to be reversed

### Key Database Design Decisions:

- **UUID Primary Keys**: Using UUIDs instead of auto-incrementing integers for security and distributed systems
- **Required Fields**: Making critical fields like name and email non-nullable (`allowNull: false`)
- **Field Length Limits**: Setting appropriate maximum lengths for string fields
- **Unique Constraints**: Ensuring email addresses are unique
- **Enum Types**: Restricting role values to a predefined set
- **Timestamps**: Including creation and update timestamps for record-keeping

## Example Migration 2: Creating the Study Rooms Table

Now let's look at the `20250613100001-create-study-room.js` migration:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('study_rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      // ... other fields ...
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // ... timestamp fields ...
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('study_rooms');
  }
};
```

### What This Migration Does:

1. **Creates a Table**: The `up` function creates a new table called `study_rooms`

2. **Defines Columns**:
   - `id`: A UUID primary key
   - `name`: A required string field for the room name
   - `description`: A text field for longer descriptions
   - `image`: A string field for storing image URLs or paths
   - `totalMembers`, `activeMembers`: Integer fields for tracking room participation
   - `lastActive`: A timestamp for when the room was last used
   - `isActive`: A boolean flag for room status

3. **Establishes Relationships**:
   - `createdBy`: A foreign key to the `users` table, with CASCADE behavior
   - `subjectId`: A foreign key to the `subjects` table, with SET NULL behavior

4. **Rollback Strategy**: The `down` function drops the `study_rooms` table

### Key Database Design Decisions:

- **Foreign Keys**: Creating relationships to users and subjects tables
- **Referential Integrity**: Setting appropriate actions for updates and deletes:
  - `CASCADE` for `createdBy`: If a user is deleted, their created rooms are also deleted
  - `SET NULL` for `subjectId`: If a subject is deleted, rooms keep existing but lose their subject reference
- **Default Values**: Setting sensible defaults for counters and status fields
- **Tracking Fields**: Including fields to track activity and participation

## Running Migrations

Migrations are typically run using Sequelize CLI commands:

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Undo the most recent migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

## Benefits of Using Migrations

1. **Database Evolution**: Safely evolve your database schema as your application grows
2. **Consistency**: Ensure all environments have the same database structure
3. **History**: Keep a record of all changes made to your database
4. **Automation**: Integrate database changes into your deployment process
5. **Testing**: Easily set up test databases with the correct schema

Migrations are an essential tool for managing database changes in a professional, maintainable way. 