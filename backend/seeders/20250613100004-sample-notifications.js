'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user for notifications
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@studyconnect.com' LIMIT 1;`
    );
    
    const adminId = adminUser[0]?.id;
    
    if (!adminId) {
      console.warn('Admin user not found for notifications seeder');
      return;
    }
    
    // Get resources for related content
    const [resources] = await queryInterface.sequelize.query(
      `SELECT id FROM resources LIMIT 1;`
    );
    
    // Get study rooms for related content
    const [studyRooms] = await queryInterface.sequelize.query(
      `SELECT id FROM study_rooms LIMIT 1;`
    );
    
    // Get events for related content
    const [events] = await queryInterface.sequelize.query(
      `SELECT id FROM events LIMIT 1;`
    );
    
    // Create timestamps for relative times
    const now = new Date();
    
    const twoHoursAgo = new Date(now);
    twoHoursAgo.setHours(now.getHours() - 2);
    
    const fiveHoursAgo = new Date(now);
    fiveHoursAgo.setHours(now.getHours() - 5);
    
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    
    const notifications = [
      {
        id: uuidv4(),
        userId: adminId,
        message: 'Alex commented on your note',
        type: 'info',
        link: `/dashboard/resources/${resources[0]?.id}`,
        isRead: false,
        relatedId: resources[0]?.id,
        relatedType: 'resource',
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo
      },
      {
        id: uuidv4(),
        userId: adminId,
        message: 'New resource added to Physics 101',
        type: 'success',
        link: `/dashboard/groups/${studyRooms[0]?.id}`,
        isRead: false,
        relatedId: studyRooms[0]?.id,
        relatedType: 'studyRoom',
        createdAt: fiveHoursAgo,
        updatedAt: fiveHoursAgo
      },
      {
        id: uuidv4(),
        userId: adminId,
        message: 'Study session scheduled for tomorrow',
        type: 'info',
        link: `/dashboard/events/${events[0]?.id}`,
        isRead: false,
        relatedId: events[0]?.id,
        relatedType: 'event',
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo
      }
    ];
    
    await queryInterface.bulkInsert('notifications', notifications, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('notifications', null, {});
  }
}; 