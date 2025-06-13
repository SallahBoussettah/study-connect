'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'study_rooms',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'messages'
  });

  Message.associate = function(models) {
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });

    Message.belongsTo(models.StudyRoom, {
      foreignKey: 'roomId',
      as: 'room'
    });
  };

  return Message;
}; 