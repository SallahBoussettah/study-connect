'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all resources that have a URL but are not of type 'Link'
      const [resources] = await queryInterface.sequelize.query(
        `SELECT id, title, url, type FROM resources WHERE url IS NOT NULL AND url != '' AND type != 'Link'`
      );

      console.log(`Found ${resources.length} resources with URLs that need type correction`);

      // Update each resource to have type 'Link'
      for (const resource of resources) {
        await queryInterface.sequelize.query(
          `UPDATE resources SET type = 'Link' WHERE id = :id`,
          {
            replacements: { id: resource.id }
          }
        );
        console.log(`Updated resource ${resource.id} (${resource.title}) from type ${resource.type} to Link`);
      }

      console.log('Resource type correction completed successfully');
    } catch (error) {
      console.error('Error updating resource types:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration cannot be undone as we don't know the original types
    console.log('This migration cannot be undone');
  }
}; 