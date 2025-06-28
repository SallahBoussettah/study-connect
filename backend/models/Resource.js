'use strict';

module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
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
          msg: 'Resource title is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM(
        'PDF', 
        'Document', 
        'Link', 
        'Image', 
        'Video', 
        'Spreadsheet', 
        'Presentation', 
        'Archive', 
        'Text', 
        'Code', 
        'Audio', 
        'Other'
      ),
      defaultValue: 'Other'
    },
    url: {
      type: DataTypes.STRING(255)
    },
    filePath: {
      type: DataTypes.STRING(255)
    },
    fileSize: {
      type: DataTypes.INTEGER
    },
    originalFilename: {
      type: DataTypes.STRING(255)
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.UUID
    },
    roomId: {
      type: DataTypes.UUID
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'resources'
  });

  Resource.associate = function(models) {
    Resource.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });

    Resource.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });

    Resource.belongsTo(models.StudyRoom, {
      foreignKey: 'roomId',
      as: 'studyRoom'
    });
    
    // Add association for the reviewer
    Resource.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return Resource;
}; 