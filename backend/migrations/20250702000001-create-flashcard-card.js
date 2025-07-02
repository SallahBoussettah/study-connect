'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('flashcard_cards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      mastered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lastReviewed: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('flashcard_cards');
  }
}; 