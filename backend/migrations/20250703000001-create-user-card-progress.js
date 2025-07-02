'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_card_progress', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cardId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'flashcard_cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint
    await queryInterface.addIndex('user_card_progress', ['userId', 'cardId'], {
      unique: true,
      name: 'user_card_progress_user_card_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_card_progress');
  }
}; 