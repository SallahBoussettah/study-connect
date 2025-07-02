'use strict';

module.exports = (sequelize, DataTypes) => {
  const SharedFlashcardDeck = sequelize.define('SharedFlashcardDeck', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    deckId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sharedWithId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sharedById: {
      type: DataTypes.UUID,
      allowNull: false
    },
    canEdit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sharingToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'shared_flashcard_decks',
    indexes: [
      {
        unique: true,
        fields: ['deckId', 'sharedWithId']
      }
    ]
  });

  SharedFlashcardDeck.associate = function(models) {
    // SharedFlashcardDeck belongs to FlashcardDeck
    SharedFlashcardDeck.belongsTo(models.FlashcardDeck, {
      foreignKey: 'deckId',
      as: 'deck'
    });

    // SharedFlashcardDeck belongs to User (sharedWith)
    SharedFlashcardDeck.belongsTo(models.User, {
      foreignKey: 'sharedWithId',
      as: 'sharedWith'
    });

    // SharedFlashcardDeck belongs to User (sharedBy)
    SharedFlashcardDeck.belongsTo(models.User, {
      foreignKey: 'sharedById',
      as: 'sharedBy'
    });
  };

  return SharedFlashcardDeck;
}; 