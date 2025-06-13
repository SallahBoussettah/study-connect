'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_subjects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      proficiencyLevel: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        defaultValue: 'beginner'
      },
      isTeaching: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add a unique constraint to prevent duplicate user-subject pairs
    await queryInterface.addConstraint('user_subjects', {
      fields: ['userId', 'subjectId'],
      type: 'unique',
      name: 'unique_user_subject'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_subjects');
  }
}; 