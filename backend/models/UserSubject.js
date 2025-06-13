'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserSubject = sequelize.define('UserSubject', {
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
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    proficiencyLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'beginner'
    },
    isTeaching: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'user_subjects'
  });

  // Associations
  UserSubject.associate = function(models) {
    // Only create associations if the related models exist
    if (models.User) {
      UserSubject.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    if (models.Subject) {
      UserSubject.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject'
      });
    }
  };

  return UserSubject;
}; 