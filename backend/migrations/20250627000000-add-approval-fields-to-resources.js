'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status ENUM field
    await queryInterface.addColumn('resources', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    });

    // Add reviewedBy field
    await queryInterface.addColumn('resources', 'reviewedBy', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add reviewedAt field
    await queryInterface.addColumn('resources', 'reviewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add reviewNotes field
    await queryInterface.addColumn('resources', 'reviewNotes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns in reverse order
    await queryInterface.removeColumn('resources', 'reviewNotes');
    await queryInterface.removeColumn('resources', 'reviewedAt');
    await queryInterface.removeColumn('resources', 'reviewedBy');
    
    // Remove the ENUM type after removing the column that uses it
    await queryInterface.removeColumn('resources', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_resources_status;');
  }
}; 