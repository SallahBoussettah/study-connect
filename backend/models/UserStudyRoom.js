'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserStudyRoom = sequelize.define('UserStudyRoom', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'study_rooms',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    role: {
      type: DataTypes.ENUM('owner', 'moderator', 'member'),
      defaultValue: 'member'
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastActive: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    tableName: 'user_study_rooms'
  });

  UserStudyRoom.associate = function(models) {
    UserStudyRoom.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    
    UserStudyRoom.belongsTo(models.StudyRoom, {
      foreignKey: 'roomId'
    });
  };

  return UserStudyRoom;
}; 