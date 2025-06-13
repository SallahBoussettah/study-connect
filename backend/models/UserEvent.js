'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserEvent = sequelize.define('UserEvent', {
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
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('attending', 'maybe', 'declined'),
      defaultValue: 'attending'
    }
  }, {
    timestamps: true,
    tableName: 'user_events'
  });

  UserEvent.associate = function(models) {
    UserEvent.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    
    UserEvent.belongsTo(models.Event, {
      foreignKey: 'eventId'
    });
  };

  return UserEvent;
}; 