'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
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
          msg: 'Subject name is required'
        }
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'subjects'
  });

  // Associations
  Subject.associate = function(models) {
    // Only create associations if the related models exist
    // Subject has many UserSubjects
    if (models.UserSubject) {
      Subject.hasMany(models.UserSubject, {
        foreignKey: 'subjectId',
        as: 'userSubjects'
      });
    }

    // Subject has many StudyRooms
    if (models.StudyRoom) {
      Subject.hasMany(models.StudyRoom, {
        foreignKey: 'subjectId',
        as: 'studyRooms'
      });
    }

    // Subject has many FlashcardDecks
    if (models.FlashcardDeck) {
      Subject.hasMany(models.FlashcardDeck, {
        foreignKey: 'subjectId',
        as: 'flashcardDecks'
      });
    }
  };

  return Subject;
}; 