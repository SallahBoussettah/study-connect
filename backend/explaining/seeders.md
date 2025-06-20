# Understanding Database Seeders

## What are Seeders?

Seeders are scripts that populate your database with initial or test data. They are essential for:

1. **Initial Setup**: Providing necessary data for your application to function (like admin users)
2. **Testing**: Creating consistent test data for development and testing
3. **Demonstration**: Setting up sample data to showcase application features
4. **Reset**: Allowing you to reset your database to a known state

In your project, seeders are managed using Sequelize, which provides tools to create and run seeders alongside migrations.

## How Seeders Work

Each seeder file has two main functions:

1. **up()**: Adds data to the database when the seeder is run
2. **down()**: Removes that data when the seeder is undone

Seeders are typically run after migrations to populate the newly created tables with initial data.

## Example Seeder 1: Subjects

Let's look at the `20250613000001-subjects.js` seeder:

```javascript
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    return queryInterface.bulkInsert('subjects', [
      {
        id: uuidv4(),
        name: 'Mathematics',
        category: 'Science',
        description: 'The study of numbers, quantities, and shapes',
        icon: 'math-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Physics',
        category: 'Science',
        description: 'The study of matter, energy, and the interactions between them',
        icon: 'physics-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      // ... more subjects ...
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('subjects', null, {});
  }
};
```

### What This Seeder Does:

1. **Creates Initial Data**: The `up` function inserts multiple subject records into the `subjects` table
   - Each subject has a unique UUID
   - Each subject has a name, category, description, and icon
   - Timestamps are set to the current date/time

2. **Provides Cleanup**: The `down` function deletes all records from the `subjects` table

3. **Data Organization**: Subjects are organized by academic categories (Science, Humanities, etc.)

### Why This Seeder Is Important:

- Subjects are a core part of your application's domain model
- Having predefined subjects allows users to categorize study rooms and resources
- Consistent subject data ensures a better user experience

## Example Seeder 2: Sample Study Rooms

Now let's look at the `20250613100001-sample-study-rooms.js` seeder:

```javascript
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user for createdBy
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@studyconnect.com' LIMIT 1;`
    );
    
    const adminId = adminUser[0]?.id;
    
    if (!adminId) {
      console.warn('Admin user not found for study room seeder');
      return;
    }
    
    const studyRooms = [
      {
        id: uuidv4(),
        name: 'Advanced Calculus Study Group',
        description: 'A group dedicated to mastering advanced calculus concepts...',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
        totalMembers: 12,
        activeMembers: 3,
        lastActive: new Date(),
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // ... more study rooms ...
    ];
    
    await queryInterface.bulkInsert('study_rooms', studyRooms, {});
    
    // Also add the admin user to each study room
    const userStudyRooms = studyRooms.map(room => ({
      id: uuidv4(),
      userId: adminId,
      roomId: room.id,
      role: 'owner',
      joinedAt: new Date(),
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await queryInterface.bulkInsert('user_study_rooms', userStudyRooms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_study_rooms', null, {});
    await queryInterface.bulkDelete('study_rooms', null, {});
  }
};
```

### What This Seeder Does:

1. **Finds Related Data**: Queries the database to find the admin user's ID
   - This ensures referential integrity by using a real user ID

2. **Creates Sample Rooms**: Inserts multiple study room records
   - Each room has a unique UUID
   - Each room has a name, description, and image URL
   - Rooms have realistic member counts and activity status
   - All rooms are created by the admin user

3. **Creates Relationships**: Also inserts records into the join table (`user_study_rooms`)
   - This establishes the many-to-many relationship between users and study rooms
   - The admin user is added as the owner of each room

4. **Provides Cleanup**: The `down` function deletes all related records
   - It deletes from both tables
   - It deletes the join table records first to maintain referential integrity

### Why This Seeder Is Important:

- Sample study rooms provide immediate content for new users to explore
- They demonstrate the features and capabilities of your application
- They create a realistic environment for testing and development

## Other Seeders in Your Project

Your project includes several other seeders:

1. **Admin User Seeder** (`20250613000002-admin-user.js`):
   - Creates an administrator account for managing the application

2. **Sample Events Seeder** (`20250613100002-sample-events.js`):
   - Creates sample events associated with study rooms

3. **Sample Resources Seeder** (`20250613100003-sample-resources.js`):
   - Creates sample resources (documents, links) for study rooms

4. **Sample Notifications Seeder** (`20250613100004-sample-notifications.js`):
   - Creates sample notifications for users

## Running Seeders

Seeders are typically run using Sequelize CLI commands:

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Run a specific seeder
npx sequelize-cli db:seed --seed 20250613000001-subjects.js

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo a specific seeder
npx sequelize-cli db:seed:undo --seed 20250613000001-subjects.js
```

## Seeder Dependencies and Order

The order of seeders matters because some seeders depend on data created by others:

1. First, basic entities like subjects and users are seeded
2. Then, entities that depend on them (like study rooms) are seeded
3. Finally, relationships and activity data are seeded

This ensures that all foreign key references are valid.

## Benefits of Using Seeders

1. **Consistent Development Environment**: Every developer works with the same initial data
2. **Faster Setup**: New developers can quickly set up a working environment
3. **Realistic Testing**: Tests can run against data that resembles production
4. **Feature Demonstration**: New features can be showcased with appropriate sample data
5. **Database Reset**: The database can be reset to a known state for testing or demos

Seeders are an essential part of a professional development workflow, ensuring that your application has the data it needs to function properly during development and testing. 