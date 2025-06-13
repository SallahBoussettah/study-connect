'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      defaultValue: 'info'
    },
    link: {
      type: DataTypes.STRING(255)
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedId: {
      type: DataTypes.UUID
    },
    relatedType: {
      type: DataTypes.STRING(50)
    }
  }, {
    timestamps: true,
    tableName: 'notifications'
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Notification;
}; 