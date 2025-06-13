'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_study_rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roomId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'study_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('owner', 'moderator', 'member'),
        defaultValue: 'member'
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      lastActive: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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

    // Add unique constraint to prevent duplicate memberships
    await queryInterface.addConstraint('user_study_rooms', {
      fields: ['userId', 'roomId'],
      type: 'unique',
      name: 'unique_user_study_room'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_study_rooms');
  }
}; 