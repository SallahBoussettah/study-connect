'use strict';

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