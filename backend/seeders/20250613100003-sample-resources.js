'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user for uploadedBy
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@studyconnect.com' LIMIT 1;`
    );
    
    const adminId = adminUser[0]?.id;
    
    if (!adminId) {
      console.warn('Admin user not found for resources seeder');
      return;
    }
    
    // Get study rooms
    const [studyRooms] = await queryInterface.sequelize.query(
      `SELECT id, name FROM study_rooms LIMIT 3;`
    );
    
    // Get subjects
    const [subjects] = await queryInterface.sequelize.query(
      `SELECT id, name FROM subjects LIMIT 3;`
    );
    
    const resources = [
      {
        id: uuidv4(),
        title: 'Calculus Cheat Sheet',
        description: 'A comprehensive cheat sheet covering all major calculus formulas and theorems.',
        type: 'PDF',
        url: 'https://example.com/resources/calculus-cheat-sheet.pdf',
        filePath: '/uploads/resources/calculus-cheat-sheet.pdf',
        fileSize: 2048, // 2MB
        uploadedBy: adminId,
        subjectId: subjects[0]?.id,
        roomId: studyRooms[0]?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Physics Formulas',
        description: 'A collection of essential physics formulas organized by topic.',
        type: 'Document',
        url: 'https://example.com/resources/physics-formulas.docx',
        filePath: '/uploads/resources/physics-formulas.docx',
        fileSize: 1536, // 1.5MB
        uploadedBy: adminId,
        subjectId: subjects[1]?.id,
        roomId: studyRooms[1]?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Programming Basics',
        description: 'A beginner-friendly guide to programming fundamentals with examples in Python.',
        type: 'Link',
        url: 'https://example.com/resources/programming-basics',
        uploadedBy: adminId,
        subjectId: subjects[2]?.id,
        roomId: studyRooms[2]?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('resources', resources, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('resources', null, {});
  }
}; 