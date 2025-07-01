'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Last name is required'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student'
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    bio: {
      type: DataTypes.TEXT
    },
    institution: {
      type: DataTypes.STRING(255)
    },
    major: {
      type: DataTypes.STRING(100)
    },
    yearOfStudy: {
      type: DataTypes.STRING(50)
    },
    interests: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Method to check if password matches
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Method to generate JWT token
  User.prototype.getSignedJwtToken = function(secret, expiresIn) {
    return jwt.sign({ id: this.id, role: this.role }, secret, {
      expiresIn: expiresIn
    });
  };

  // Associations
  User.associate = function(models) {
    // Only create associations if the related models exist
    // User has one UserPreference
    if (models.UserPreference) {
      User.hasOne(models.UserPreference, {
        foreignKey: 'userId',
        as: 'preferences'
      });
    }

    // User has many UserSubjects
    if (models.UserSubject) {
      User.hasMany(models.UserSubject, {
        foreignKey: 'userId',
        as: 'subjects'
      });
    }

    // User owns many StudyRooms
    if (models.StudyRoom) {
      User.hasMany(models.StudyRoom, {
        foreignKey: 'createdBy',
        as: 'ownedRooms'
      });
    }

    // User belongs to many StudyRooms through UserStudyRoom
    if (models.StudyRoom) {
      User.belongsToMany(models.StudyRoom, {
        through: 'UserStudyRoom',
        foreignKey: 'userId',
        otherKey: 'roomId',
        as: 'joinedRooms'
      });
    }

    // User has many StudyRoomRequests
    if (models.StudyRoomRequest) {
      User.hasMany(models.StudyRoomRequest, {
        foreignKey: 'userId',
        as: 'roomRequests'
      });
    }

    // User has many Messages
    if (models.Message) {
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'messages'
      });
    }

    // User has many Resources
    if (models.Resource) {
      User.hasMany(models.Resource, {
        foreignKey: 'uploadedBy',
        as: 'resources'
      });
    }

    // User creates many Events
    if (models.Event) {
      User.hasMany(models.Event, {
        foreignKey: 'createdBy',
        as: 'createdEvents'
      });
    }

    // User belongs to many Events through UserEvent
    if (models.Event && models.UserEvent) {
      User.belongsToMany(models.Event, {
        through: models.UserEvent,
        foreignKey: 'userId',
        otherKey: 'eventId',
        as: 'events'
      });
    }

    // User has many FlashcardDecks
    if (models.FlashcardDeck) {
      User.hasMany(models.FlashcardDeck, {
        foreignKey: 'ownerId',
        as: 'flashcardDecks'
      });
    }

    // User has many StudySessions
    if (models.StudySession) {
      User.hasMany(models.StudySession, {
        foreignKey: 'userId',
        as: 'studySessions'
      });
    }

    // User has many Notifications
    if (models.Notification) {
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
      });
    }
    
    // Friendship associations
    if (models.Friendship) {
      // Sent friend requests
      User.hasMany(models.Friendship, {
        foreignKey: 'senderId',
        as: 'sentFriendRequests'
      });
      
      // Received friend requests
      User.hasMany(models.Friendship, {
        foreignKey: 'receiverId',
        as: 'receivedFriendRequests'
      });
      
      // Friends (users who have accepted this user's friend requests)
      User.belongsToMany(models.User, {
        through: {
          model: models.Friendship,
          scope: {
            status: 'accepted'
          }
        },
        foreignKey: 'senderId',
        otherKey: 'receiverId',
        as: 'friends'
      });
      
      // Friends (users whose friend requests this user has accepted)
      User.belongsToMany(models.User, {
        through: {
          model: models.Friendship,
          scope: {
            status: 'accepted'
          }
        },
        foreignKey: 'receiverId',
        otherKey: 'senderId',
        as: 'friendsOf'
      });
    }
  };

  return User;
}; 