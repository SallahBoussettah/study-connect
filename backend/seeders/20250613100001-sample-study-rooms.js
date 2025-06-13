'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user for createdBy
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@studyconnect.com' LIMIT 1;`
    );
    
    const adminId = adminUser[0]?.id;
    
    if (!adminId) {
      console.warn('Admin user not found for study room seeder');
      return;
    }
    
    const studyRooms = [
      {
        id: uuidv4(),
        name: 'Advanced Calculus Study Group',
        description: 'A group dedicated to mastering advanced calculus concepts including multivariable calculus, vector analysis, and differential equations.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
        totalMembers: 12,
        activeMembers: 3,
        lastActive: new Date(),
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Physics 101 Lab Prep',
        description: 'Prepare for physics lab sessions, discuss experimental methods, and collaborate on lab reports.',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
        totalMembers: 8,
        activeMembers: 5,
        lastActive: new Date(),
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Computer Science Projects',
        description: 'Collaborate on programming projects, share code, and discuss software development best practices.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80',
        totalMembers: 15,
        activeMembers: 7,
        lastActive: new Date(),
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('study_rooms', studyRooms, {});
    
    // Also add the admin user to each study room
    const userStudyRooms = studyRooms.map(room => ({
      id: uuidv4(),
      userId: adminId,
      roomId: room.id,
      role: 'owner',
      joinedAt: new Date(),
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await queryInterface.bulkInsert('user_study_rooms', userStudyRooms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_study_rooms', null, {});
    await queryInterface.bulkDelete('study_rooms', null, {});
  }
}; 