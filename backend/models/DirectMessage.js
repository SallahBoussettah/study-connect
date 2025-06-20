'use strict';

module.exports = (sequelize, DataTypes) => {
  const DirectMessage = sequelize.define('DirectMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'direct_messages'
  });

  DirectMessage.associate = function(models) {
    DirectMessage.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });

    DirectMessage.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver'
    });
  };

  return DirectMessage;
}; 