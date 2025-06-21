'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('resources', 'originalFilename', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    // Update the type enum to include new resource types
    await queryInterface.changeColumn('resources', 'type', {
      type: Sequelize.ENUM('PDF', 'Document', 'Link', 'Image', 'Video', 'Spreadsheet', 'Presentation', 'Archive', 'Text', 'Code', 'Audio', 'Other'),
      defaultValue: 'Other'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('resources', 'originalFilename');
    
    // This is tricky because you can't easily revert an ENUM change
    // For a proper down migration, you'd need to create a new ENUM type and switch to it
    // For simplicity, we'll leave the expanded ENUM in place
  }
};
