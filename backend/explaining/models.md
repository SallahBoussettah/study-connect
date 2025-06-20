# Understanding Sequelize Models

## What are Models in Sequelize?

Models in Sequelize are JavaScript classes that represent tables in your database. They define:

1. **Structure**: What columns exist in the table and their data types
2. **Validation**: Rules to ensure data integrity
3. **Relationships**: How this table relates to other tables
4. **Behavior**: Custom methods and hooks for business logic

Models are the core of the Object-Relational Mapping (ORM) pattern, allowing you to interact with your database using JavaScript objects instead of writing SQL queries.

## How Models Work in Your Project

In your project, models are organized in the `backend/models` directory. The `index.js` file serves as the entry point that:

1. Connects to the database using configuration from `config/database.js`
2. Loads all model files in the directory
3. Sets up associations between models
4. Exports a `db` object containing all models

Each model file defines a single table's structure and behavior. Let's look at two important models in your application:

## Example Model 1: User.js

The User model represents users in your application:

```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is required'
        }
      }
    },
    // ... other fields ...
  }, {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
      // ... other hooks ...
    }
  });

  // Custom instance methods
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  User.prototype.getSignedJwtToken = function(secret, expiresIn) {
    return jwt.sign({ id: this.id, role: this.role }, secret, {
      expiresIn: expiresIn
    });
  };

  // Associations
  User.associate = function(models) {
    // User has one UserPreference
    User.hasOne(models.UserPreference, {
      foreignKey: 'userId',
      as: 'preferences'
    });

    // User belongs to many StudyRooms
    User.belongsToMany(models.StudyRoom, {
      through: 'UserStudyRoom',
      foreignKey: 'userId',
      otherKey: 'roomId',
      as: 'joinedRooms'
    });
    
    // ... other associations ...
  };

  return User;
};
```

### Key Components of the User Model:

1. **Table Definition**:
   - The model maps to the `users` table in the database
   - It has fields like `id`, `firstName`, `lastName`, `email`, `password`, etc.
   - Each field has a specific data type (UUID, STRING, BOOLEAN, etc.)

2. **Validation Rules**:
   - `firstName` and `lastName` cannot be empty
   - `email` must be a valid email address and unique
   - `password` must be at least 6 characters long

3. **Lifecycle Hooks**:
   - `beforeCreate`: Automatically hashes passwords before saving a new user
   - `beforeUpdate`: Rehashes passwords when they're changed

4. **Custom Methods**:
   - `matchPassword()`: Compares a provided password with the stored hash
   - `getSignedJwtToken()`: Generates a JWT token for authentication

5. **Associations**:
   - One-to-One: Each user has one preferences record
   - One-to-Many: Users can create many study rooms
   - Many-to-Many: Users can join many study rooms

### How the User Model Is Used:

```javascript
// Creating a new user
const user = await User.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Finding a user
const user = await User.findOne({ where: { email } });

// Checking password
const isMatch = await user.matchPassword(password);

// Generating token
const token = user.getSignedJwtToken(secret, '30d');
```

## Example Model 2: StudyRoom.js

The StudyRoom model represents study groups in your application:

```javascript
module.exports = (sequelize, DataTypes) => {
  const StudyRoom = sequelize.define('StudyRoom', {
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
          msg: 'Study room name is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    image: {
      type: DataTypes.STRING(255)
    },
    totalMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    activeMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastActive: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'study_rooms'
  });

  StudyRoom.associate = function(models) {
    StudyRoom.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    StudyRoom.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });

    StudyRoom.belongsToMany(models.User, {
      through: 'UserStudyRoom',
      foreignKey: 'roomId',
      otherKey: 'userId',
      as: 'members'
    });

    StudyRoom.hasMany(models.Event, {
      foreignKey: 'roomId',
      as: 'events'
    });
    
    StudyRoom.hasMany(models.Resource, {
      foreignKey: 'roomId',
      as: 'resources'
    });
  };

  return StudyRoom;
};
```

### Key Components of the StudyRoom Model:

1. **Table Definition**:
   - The model maps to the `study_rooms` table in the database
   - It has fields like `id`, `name`, `description`, `image`, etc.
   - It includes tracking fields like `totalMembers`, `activeMembers`, and `lastActive`

2. **Validation Rules**:
   - `name` cannot be empty

3. **Default Values**:
   - `totalMembers` starts at 1 (the creator)
   - `activeMembers` starts at 0
   - `lastActive` is set to the current time
   - `isActive` is set to true

4. **Foreign Keys**:
   - `createdBy`: Links to the user who created the room
   - `subjectId`: Links to the subject the room is about

5. **Associations**:
   - Belongs-To: Each room belongs to a creator (User) and a subject
   - Many-to-Many: Rooms have many members (Users)
   - One-to-Many: Rooms can have many events and resources

### How the StudyRoom Model Is Used:

```javascript
// Creating a new study room
const room = await StudyRoom.create({
  name: 'Physics Study Group',
  description: 'Weekly study sessions for Physics 101',
  createdBy: userId,
  subjectId: physicsSubjectId
});

// Finding rooms a user is a member of
const userRooms = await StudyRoom.findAll({
  include: [
    {
      model: User,
      as: 'members',
      where: { id: userId }
    }
  ]
});

// Getting room details with related data
const roomDetails = await StudyRoom.findByPk(roomId, {
  include: [
    { model: User, as: 'creator' },
    { model: Subject, as: 'subject' },
    { model: User, as: 'members' },
    { model: Event, as: 'events' },
    { model: Resource, as: 'resources' }
  ]
});
```

## How Models and Migrations Work Together

Models and migrations are closely related but serve different purposes:

- **Migrations**: Define how to create and modify database tables
- **Models**: Define how to interact with those tables in your code

When you create a new feature:

1. Create a migration to add/modify tables in the database
2. Create or update models to interact with those tables
3. Use the models in your controllers to handle business logic

This separation allows you to:
- Track database changes over time with migrations
- Have a clean, object-oriented interface for your data with models

## Benefits of the Model Approach

1. **Type Safety**: JavaScript objects with defined properties instead of raw SQL
2. **Code Organization**: Business logic lives with the data it operates on
3. **Validation**: Automatic data validation before saving to the database
4. **Relationships**: Easy handling of related data across tables
5. **Abstraction**: Work with objects and methods instead of SQL queries
6. **Security**: Protection against SQL injection attacks

Models are the foundation of your application's data layer, providing a structured way to interact with your database. 