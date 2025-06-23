'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    return queryInterface.bulkInsert('subjects', [
      {
        id: uuidv4(),
        name: 'Mathematics',
        category: 'Science',
        description: 'The study of numbers, quantities, and shapes',
        icon: 'math-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Physics',
        category: 'Science',
        description: 'The study of matter, energy, and the interactions between them',
        icon: 'physics-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Chemistry',
        category: 'Science',
        description: 'The study of substances, their properties, and reactions',
        icon: 'chemistry-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Biology',
        category: 'Science',
        description: 'The study of living organisms and their interactions',
        icon: 'biology-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Computer Science',
        category: 'Technology',
        description: 'The study of computers and computational systems',
        icon: 'cs-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'History',
        category: 'Humanities',
        description: 'The study of past events',
        icon: 'history-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Literature',
        category: 'Humanities',
        description: 'The study of written works',
        icon: 'literature-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Economics',
        category: 'Social Sciences',
        description: 'The study of how people use resources',
        icon: 'economics-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Psychology',
        category: 'Social Sciences',
        description: 'The study of the mind and behavior',
        icon: 'psychology-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Art',
        category: 'Arts',
        description: 'The study of visual arts',
        icon: 'art-icon.svg',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Other',
        category: 'Other',
        description: 'Other subjects',
        icon: 'other-icon.svg',
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('subjects', null, {});
  }
}; 