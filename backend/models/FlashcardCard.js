'use strict';

module.exports = (sequelize, DataTypes) => {
  const FlashcardCard = sequelize.define('FlashcardCard', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Question is required'
        }
      }
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Answer is required'
        }
      }
    },
    mastered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastReviewed: {
      type: DataTypes.DATE
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    deckId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'flashcard_cards',
    hooks: {
      afterCreate: async (card, options) => {
        // Update card count in the deck
        try {
          const deck = await sequelize.models.FlashcardDeck.findByPk(card.deckId);
          if (deck) {
            deck.cardCount += 1;
            await deck.save();
          }
        } catch (error) {
          console.error('Error updating deck card count:', error);
        }
      },
      afterDestroy: async (card, options) => {
        // Update card count in the deck
        try {
          const deck = await sequelize.models.FlashcardDeck.findByPk(card.deckId);
          if (deck) {
            deck.cardCount = Math.max(0, deck.cardCount - 1);
            await deck.save();
            
            // Recalculate mastery
            await deck.calculateMastery();
          }
        } catch (error) {
          console.error('Error updating deck after card deletion:', error);
        }
      }
    }
  });

  FlashcardCard.associate = function(models) {
    // FlashcardCard belongs to FlashcardDeck
    FlashcardCard.belongsTo(models.FlashcardDeck, {
      foreignKey: 'deckId',
      as: 'deck'
    });
    
    // FlashcardCard has many UserCardProgress records
    if (models.UserCardProgress) {
      FlashcardCard.hasMany(models.UserCardProgress, {
        foreignKey: 'cardId',
        as: 'userProgress'
      });
    }
  };

  // Instance method to mark card as reviewed
  FlashcardCard.prototype.markReviewed = async function(wasMastered) {
    this.lastReviewed = new Date();
    this.reviewCount += 1;
    this.mastered = wasMastered;
    await this.save();
    
    // Update the deck's mastery
    try {
      const deck = await sequelize.models.FlashcardDeck.findByPk(this.deckId);
      if (deck) {
        await deck.calculateMastery();
        
        // Update lastStudied time
        deck.lastStudied = new Date();
        await deck.save();
      }
    } catch (error) {
      console.error('Error updating deck mastery:', error);
    }
    
    return this;
  };

  return FlashcardCard;
}; 