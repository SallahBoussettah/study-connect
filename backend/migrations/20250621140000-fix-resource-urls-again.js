'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all resources
      const [resources] = await queryInterface.sequelize.query(
        `SELECT id, title, type, url FROM resources WHERE url IS NOT NULL AND url != ''`
      );
      
      console.log(`Found ${resources.length} resources with URLs`);
      
      // Update each resource to have type 'Link' and properly formatted URL
      for (const resource of resources) {
        console.log(`Processing resource ${resource.id} (${resource.title})`);
        
        let url = resource.url;
        
        // Format URL if needed
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
          console.log(`Formatted URL: ${url}`);
        }
        
        // Update the resource
        await queryInterface.sequelize.query(
          `UPDATE resources SET type = 'Link', url = :url WHERE id = :id`,
          {
            replacements: { 
              id: resource.id,
              url: url
            }
          }
        );
        console.log(`Updated resource ${resource.id}`);
      }
      
      console.log('Resource URL correction completed successfully');
    } catch (error) {
      console.error('Error updating resource URLs:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('This migration cannot be undone');
  }
}; 