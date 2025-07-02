'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserCardProgress = sequelize.define('UserCardProgress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    cardId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    deckId: {
      type: DataTypes.UUID,
      allowNull: false
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
    }
  }, {
    timestamps: true,
    tableName: 'user_card_progress',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'cardId']
      }
    ]
  });

  UserCardProgress.associate = function(models) {
    // UserCardProgress belongs to User
    UserCardProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // UserCardProgress belongs to FlashcardCard
    UserCardProgress.belongsTo(models.FlashcardCard, {
      foreignKey: 'cardId',
      as: 'card'
    });

    // UserCardProgress belongs to FlashcardDeck
    UserCardProgress.belongsTo(models.FlashcardDeck, {
      foreignKey: 'deckId',
      as: 'deck'
    });
  };

  return UserCardProgress;
}; 