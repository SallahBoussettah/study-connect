'use strict';

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Event title is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Event date is required'
        }
      }
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      defaultValue: 60
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'events'
  });

  Event.associate = function(models) {
    Event.belongsTo(models.StudyRoom, {
      foreignKey: 'roomId',
      as: 'studyRoom'
    });

    Event.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    Event.belongsToMany(models.User, {
      through: 'UserEvent',
      foreignKey: 'eventId',
      otherKey: 'userId',
      as: 'participants'
    });
  };

  return Event;
}; 