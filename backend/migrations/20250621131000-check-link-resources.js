'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Find Link resources without URLs
      const [linkResourcesWithoutUrls] = await queryInterface.sequelize.query(
        `SELECT id, title, type, url FROM resources WHERE type = 'Link' AND (url IS NULL OR url = '')`
      );
      
      console.log(`Found ${linkResourcesWithoutUrls.length} Link resources without URLs:`);
      linkResourcesWithoutUrls.forEach(resource => {
        console.log(`ID: ${resource.id}, Title: ${resource.title}, Type: ${resource.type}, URL: ${resource.url || 'null'}`);
      });

      // Find the specific "Test" resource
      const [testResources] = await queryInterface.sequelize.query(
        `SELECT id, title, type, url FROM resources WHERE title = 'Test'`
      );
      
      console.log('Test resources:');
      testResources.forEach(resource => {
        console.log(`ID: ${resource.id}, Title: ${resource.title}, Type: ${resource.type}, URL: ${resource.url || 'null'}`);
        
        // If this is a Link type resource but has no URL, let's update it with a sample URL
        if (resource.type === 'Link' && (!resource.url || resource.url.trim() === '')) {
          console.log(`Updating Test resource with a sample URL`);
          queryInterface.sequelize.query(
            `UPDATE resources SET url = 'https://example.com' WHERE id = :id`,
            {
              replacements: { id: resource.id }
            }
          );
        }
      });
    } catch (error) {
      console.error('Error checking link resources:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration doesn't need to be undone
    console.log('This migration does not need to be undone');
  }
}; 