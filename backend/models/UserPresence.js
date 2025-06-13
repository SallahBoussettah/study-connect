'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserPresence = sequelize.define('UserPresence', {
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
      }
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'study_rooms',
        key: 'id'
      }
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastActive: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'away', 'busy'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true,
    tableName: 'user_presence'
  });

  UserPresence.associate = function(models) {
    UserPresence.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    UserPresence.belongsTo(models.StudyRoom, {
      foreignKey: 'roomId',
      as: 'room'
    });
  };

  return UserPresence;
}; 