'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const adminId = uuidv4();
    
    // Create admin user
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@studyconnect.com',
        password: await bcrypt.hash('password123', 10), // In a real app, use a secure password
        role: 'admin',
        emailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // Create admin user preferences
    await queryInterface.bulkInsert('user_preferences', [
      {
        id: uuidv4(),
        userId: adminId,
        notificationEmail: true,
        notificationPush: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove admin user and preferences (cascade delete will handle the preferences)
    await queryInterface.bulkDelete('users', { email: 'admin@studyconnect.com' }, {});
  }
}; 