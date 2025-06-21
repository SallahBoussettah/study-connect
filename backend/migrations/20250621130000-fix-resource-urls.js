'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, log all resources with their types and URLs for debugging
      const [allResources] = await queryInterface.sequelize.query(
        `SELECT id, title, type, url FROM resources`
      );
      
      console.log('All resources:');
      allResources.forEach(resource => {
        console.log(`ID: ${resource.id}, Title: ${resource.title}, Type: ${resource.type}, URL: ${resource.url || 'null'}`);
      });

      // Find resources that have a URL but aren't type 'Link'
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

      // Find resources with 'Test' in the title for debugging
      const [testResources] = await queryInterface.sequelize.query(
        `SELECT id, title, type, url FROM resources WHERE title LIKE '%Test%'`
      );
      
      console.log('Test resources:');
      testResources.forEach(resource => {
        console.log(`ID: ${resource.id}, Title: ${resource.title}, Type: ${resource.type}, URL: ${resource.url || 'null'}`);
      });

      console.log('Resource URL correction completed successfully');
    } catch (error) {
      console.error('Error updating resource types:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration cannot be undone as we don't know the original types
    console.log('This migration cannot be undone');
  }
}; 