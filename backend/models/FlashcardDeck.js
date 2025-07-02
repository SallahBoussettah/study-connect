'use strict';

module.exports = (sequelize, DataTypes) => {
  const FlashcardDeck = sequelize.define('FlashcardDeck', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Deck title is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    subject: {
      type: DataTypes.STRING(100)
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    cardCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastStudied: {
      type: DataTypes.DATE
    },
    mastery: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'flashcard_decks'
  });

  FlashcardDeck.associate = function(models) {
    // FlashcardDeck belongs to User
    FlashcardDeck.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });

    // FlashcardDeck belongs to Subject (optional)
    FlashcardDeck.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subjectDetail',
      constraints: false
    });

    // FlashcardDeck has many FlashcardCards
    FlashcardDeck.hasMany(models.FlashcardCard, {
      foreignKey: 'deckId',
      as: 'cards',
      onDelete: 'CASCADE'
    });

    // FlashcardDeck has many SharedFlashcardDecks
    FlashcardDeck.hasMany(models.SharedFlashcardDeck, {
      foreignKey: 'deckId',
      as: 'shares',
      onDelete: 'CASCADE'
    });

    // FlashcardDeck is shared with many Users through SharedFlashcardDeck
    FlashcardDeck.belongsToMany(models.User, {
      through: models.SharedFlashcardDeck,
      foreignKey: 'deckId',
      otherKey: 'sharedWithId',
      as: 'sharedWithUsers'
    });
    
    // FlashcardDeck has many UserCardProgress records
    if (models.UserCardProgress) {
      FlashcardDeck.hasMany(models.UserCardProgress, {
        foreignKey: 'deckId',
        as: 'userProgress'
      });
    }
  };

  // Instance method to calculate mastery percentage
  FlashcardDeck.prototype.calculateMastery = async function() {
    try {
      const cards = await sequelize.models.FlashcardCard.findAll({
        where: { deckId: this.id }
      });
      
      if (cards.length === 0) return 0;
      
      const masteredCount = cards.filter(card => card.mastered).length;
      const masteryPercentage = Math.round((masteredCount / cards.length) * 100);
      
      // Update the deck's mastery and cardCount
      this.mastery = masteryPercentage;
      this.cardCount = cards.length;
      await this.save();
      
      return masteryPercentage;
    } catch (error) {
      console.error('Error calculating mastery:', error);
      return this.mastery;
    }
  };

  return FlashcardDeck;
}; 