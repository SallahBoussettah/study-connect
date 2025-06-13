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
      console.warn('Admin user not found for events seeder');
      return;
    }
    
    // Get study rooms
    const [studyRooms] = await queryInterface.sequelize.query(
      `SELECT id, name FROM study_rooms LIMIT 3;`
    );
    
    if (studyRooms.length === 0) {
      console.warn('No study rooms found for events seeder');
      return;
    }
    
    // Create future dates for events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(10, 30, 0, 0);
    
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    twoWeeks.setHours(15, 0, 0, 0);
    
    const events = [
      {
        id: uuidv4(),
        title: 'Calculus Study Session',
        description: 'Group session to review calculus problems and prepare for the upcoming exam.',
        date: tomorrow,
        duration: 120, // 2 hours
        roomId: studyRooms[0]?.id,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Physics Lab Prep',
        description: 'Prepare for the upcoming physics lab experiment on mechanics.',
        date: nextWeek,
        duration: 90, // 1.5 hours
        roomId: studyRooms[1]?.id,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Group Project Meeting',
        description: 'Team meeting to discuss progress on the semester project and assign tasks.',
        date: twoWeeks,
        duration: 60, // 1 hour
        roomId: studyRooms[2]?.id,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('events', events, {});
    
    // Add admin user as participant to each event
    const userEvents = events.map(event => ({
      id: uuidv4(),
      userId: adminId,
      eventId: event.id,
      status: 'attending',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await queryInterface.bulkInsert('user_events', userEvents, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_events', null, {});
    await queryInterface.bulkDelete('events', null, {});
  }
}; 