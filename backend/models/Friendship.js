'use strict';

module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('Friendship', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    tableName: 'friendships',
    indexes: [
      {
        unique: true,
        fields: ['senderId', 'receiverId']
      }
    ]
  });

  Friendship.associate = function(models) {
    Friendship.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
    
    Friendship.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver'
    });
  };

  return Friendship;
}; 