'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_preferences', {
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
      notificationEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      notificationPush: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      theme: {
        type: Sequelize.STRING(50),
        defaultValue: 'light'
      },
      language: {
        type: Sequelize.STRING(50),
        defaultValue: 'en'
      },
      timezone: {
        type: Sequelize.STRING(100),
        defaultValue: 'UTC'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_preferences');
  }
}; 