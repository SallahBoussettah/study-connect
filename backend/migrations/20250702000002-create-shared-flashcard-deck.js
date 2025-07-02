'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shared_flashcard_decks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      deckId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'flashcard_decks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sharedWithId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sharedById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      canEdit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add a unique constraint to prevent duplicate shares
    await queryInterface.addConstraint('shared_flashcard_decks', {
      fields: ['deckId', 'sharedWithId'],
      type: 'unique',
      name: 'unique_shared_deck'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shared_flashcard_decks');
  }
}; 