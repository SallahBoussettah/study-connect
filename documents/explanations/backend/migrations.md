# Database Migrations

## What are Migrations?

Migrations are like version control for your database schema. They allow you to:
1. Create and modify database tables
2. Track changes to your database structure over time
3. Share database schema changes with your team
4. Roll back changes if needed

## How Migrations Work in Sequelize

1. **Create a migration file**: Generate a timestamped JS file with `up` and `down` methods
2. **Define changes**: Write code to create/alter tables in the `up` method
3. **Define rollback**: Write code to undo those changes in the `down` method
4. **Run migrations**: Execute migrations to apply changes to the database
5. **Revert if needed**: Roll back migrations if there are issues

## Example from StudyConnect

### Migration File Structure

```javascript
// backend/migrations/20250613000000-create-users.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // The up method is run when applying the migration
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('student', 'teacher', 'admin'),
        defaultValue: 'student'
      },
      avatar: {
        type: Sequelize.STRING(255)
      },
      bio: {
        type: Sequelize.TEXT
      },
      institution: {
        type: Sequelize.STRING(255)
      },
      major: {
        type: Sequelize.STRING(100)
      },
      yearOfStudy: {
        type: Sequelize.STRING(50)
      },
      interests: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE
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

  // The down method is run when rolling back the migration
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

### Creating a Relationship in a Migration

```javascript
// backend/migrations/20250613000003-create-user-subjects.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_subjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // References the users table
          key: 'id'       // References the id column in users table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subjects', // References the subjects table
          key: 'id'          // References the id column in subjects table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      proficiency: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        defaultValue: 'beginner'
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

    // Add a unique constraint to prevent duplicate user-subject pairs
    await queryInterface.addConstraint('user_subjects', {
      fields: ['userId', 'subjectId'],
      type: 'unique',
      name: 'unique_user_subject'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_subjects');
  }
};
```

### Modifying a Table in a Migration

```javascript
// backend/migrations/20250615000001-add-notification-preferences.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a new column to an existing table
    await queryInterface.addColumn('user_preferences', 'notificationSettings', {
      type: Sequelize.JSON,
      defaultValue: {
        email: true,
        push: true,
        studyReminders: true,
        friendRequests: true,
        messages: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column when rolling back
    await queryInterface.removeColumn('user_preferences', 'notificationSettings');
  }
};
```

### Running Migrations

Migrations are run using the Sequelize CLI. In the StudyConnect project, there are npm scripts defined in `backend/package.json` to make this easier:

```json
{
  "scripts": {
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all",
    "db:reset": "sequelize-cli db:drop && sequelize-cli db:create && sequelize-cli db:migrate && sequelize-cli db:seed:all"
  }
}
```

To run migrations:
```bash
cd backend
npm run db:migrate
```

## Key Takeaways

1. **Version Control for Database**: Migrations track changes to your database structure over time
2. **Team Collaboration**: Everyone on the team can apply the same database changes
3. **Reversibility**: Changes can be rolled back if needed
4. **Automation**: Database schema can be set up automatically in new environments
5. **Consistency**: Ensures development, testing, and production environments have the same structure 