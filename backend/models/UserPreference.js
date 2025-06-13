'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserPreference = sequelize.define('UserPreference', {
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
    notificationEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notificationPush: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    theme: {
      type: DataTypes.STRING(50),
      defaultValue: 'light'
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: 'en'
    },
    timezone: {
      type: DataTypes.STRING(100),
      defaultValue: 'UTC'
    }
  }, {
    timestamps: true,
    tableName: 'user_preferences'
  });

  // Associations
  UserPreference.associate = function(models) {
    if (models.User) {
      UserPreference.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  };

  return UserPreference;
}; 