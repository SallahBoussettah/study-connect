'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resources', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.ENUM('PDF', 'Document', 'Link', 'Image', 'Video', 'Other'),
        defaultValue: 'Other'
      },
      url: {
        type: Sequelize.STRING(255)
      },
      filePath: {
        type: Sequelize.STRING(255)
      },
      fileSize: {
        type: Sequelize.INTEGER
      },
      uploadedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      roomId: {
        type: Sequelize.UUID,
        references: {
          model: 'study_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('resources');
  }
}; 