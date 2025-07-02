const { FlashcardDeck, FlashcardCard, SharedFlashcardDeck, User, UserCardProgress } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all flashcard decks for the current user
// @route   GET /api/flashcards/my-decks
// @access  Private
exports.getMyDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.findAll({
      where: { userId: req.user.id },
      attributes: [
        'id', 'title', 'description', 'subject', 'cardCount', 
        'lastStudied', 'mastery', 'isPublic', 'createdAt'
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: decks
    });
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcard decks'
    });
  }
};

// @desc    Get all flashcard decks shared with the current user
// @route   GET /api/flashcards/shared
// @access  Private
exports.getSharedDecks = async (req, res) => {
  try {
    const sharedDecks = await SharedFlashcardDeck.findAll({
      where: { sharedWithId: req.user.id },
      include: [
        {
          model: FlashcardDeck,
          as: 'deck',
          attributes: [
            'id', 'title', 'description', 'subject', 'cardCount', 
            'lastStudied', 'mastery', 'createdAt'
          ],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName', 'avatar']
            }
          ]
        },
        {
          model: User,
          as: 'sharedBy',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    // Format the response
    const formattedDecks = sharedDecks.map(share => {
      const deck = share.deck.toJSON();
      return {
        ...deck,
        sharedBy: share.sharedBy,
        canEdit: share.canEdit,
        sharedAt: share.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedDecks
    });
  } catch (error) {
    console.error('Error fetching shared flashcard decks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared flashcard decks'
    });
  }
};

// @desc    Get a specific flashcard deck by ID
// @route   GET /api/flashcards/decks/:deckId
// @access  Private
exports.getDeckById = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { 
        id: deckId,
        [Op.or]: [
          { userId: req.user.id },
          // Include decks shared with the user
          { '$shares.sharedWithId$': req.user.id },
          // Include public decks from teachers and admins
          {
            isPublic: true,
            '$owner.role$': {
              [Op.in]: ['teacher', 'admin']
            }
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'role']
        },
        {
          model: FlashcardCard,
          as: 'cards',
          attributes: ['id', 'question', 'answer', 'mastered', 'lastReviewed', 'reviewCount']
        },
        {
          model: SharedFlashcardDeck,
          as: 'shares',
          required: false,
          where: { sharedWithId: req.user.id },
          attributes: ['canEdit']
        }
      ]
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you do not have access'
      });
    }
    
    // Check if this is a shared deck and add appropriate permissions
    const deckData = deck.toJSON();
    const isOwner = deck.userId === req.user.id;
    const canEdit = isOwner || (deck.shares.length > 0 && deck.shares[0].canEdit);
    const isGlobal = deck.isPublic && ['teacher', 'admin'].includes(deck.owner.role);
    
    // For global decks that the user doesn't own, fetch user's progress
    if (isGlobal && !isOwner) {
      // Get user's progress for all cards in this deck
      const userProgress = await UserCardProgress.findAll({
        where: {
          userId: req.user.id,
          deckId: deckId
        },
        attributes: ['cardId', 'mastered', 'lastReviewed', 'reviewCount']
      });
      
      // Create a map of card progress by cardId for easier lookup
      const progressMap = {};
      userProgress.forEach(progress => {
        progressMap[progress.cardId] = {
          mastered: progress.mastered,
          lastReviewed: progress.lastReviewed,
          reviewCount: progress.reviewCount
        };
      });
      
      // Calculate user's mastery percentage for this deck
      let masteryPercentage = 0;
      if (userProgress.length > 0) {
        const masteredCount = userProgress.filter(progress => progress.mastered).length;
        masteryPercentage = Math.round((masteredCount / deckData.cards.length) * 100);
      }
      
      // Add user's progress to each card
      deckData.cards = deckData.cards.map(card => ({
        ...card,
        mastered: progressMap[card.id]?.mastered || false,
        lastReviewed: progressMap[card.id]?.lastReviewed || null,
        reviewCount: progressMap[card.id]?.reviewCount || 0,
        hasProgress: !!progressMap[card.id]
      }));
      
      // Add user's mastery percentage to the deck
      deckData.mastery = masteryPercentage;
      deckData.lastStudied = userProgress.length > 0 
        ? new Date(Math.max(...userProgress.map(p => p.lastReviewed ? new Date(p.lastReviewed).getTime() : 0)))
        : null;
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...deckData,
        isOwner,
        canEdit,
        isGlobal
      }
    });
  } catch (error) {
    console.error('Error fetching flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcard deck'
    });
  }
};

// @desc    Create a new flashcard deck
// @route   POST /api/flashcards/decks
// @access  Private
exports.createDeck = async (req, res) => {
  try {
    const { title, description, subject, isPublic, cards } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Deck title is required'
      });
    }
    
    // Create the deck
    const deck = await FlashcardDeck.create({
      title,
      description,
      subject,
      isPublic: isPublic || false,
      userId: req.user.id,
      cardCount: cards?.length || 0
    });
    
    // Create cards if provided
    if (cards && Array.isArray(cards) && cards.length > 0) {
      const cardsToCreate = cards.map(card => ({
        ...card,
        deckId: deck.id
      }));
      
      await FlashcardCard.bulkCreate(cardsToCreate);
    }
    
    res.status(201).json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create flashcard deck'
    });
  }
};

// @desc    Update a flashcard deck
// @route   PUT /api/flashcards/decks/:deckId
// @access  Private
exports.updateDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { title, description, subject, isPublic } = req.body;
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { id: deckId },
      include: [
        {
          model: SharedFlashcardDeck,
          as: 'shares',
          required: false,
          where: { sharedWithId: req.user.id },
          attributes: ['canEdit']
        }
      ]
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found'
      });
    }
    
    // Check if user has permission to update
    const isOwner = deck.userId === req.user.id;
    const canEdit = isOwner || (deck.shares.length > 0 && deck.shares[0].canEdit);
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this deck'
      });
    }
    
    // Update the deck
    await deck.update({
      title: title || deck.title,
      description: description !== undefined ? description : deck.description,
      subject: subject !== undefined ? subject : deck.subject,
      isPublic: isPublic !== undefined ? isPublic : deck.isPublic
    });
    
    res.status(200).json({
      success: true,
      data: deck
    });
  } catch (error) {
    console.error('Error updating flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update flashcard deck'
    });
  }
};

// @desc    Delete a flashcard deck
// @route   DELETE /api/flashcards/decks/:deckId
// @access  Private
exports.deleteDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { id: deckId }
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found'
      });
    }
    
    // Only the owner can delete the deck
    if (deck.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this deck'
      });
    }
    
    // Delete the deck (cascade will delete cards and shares)
    await deck.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Flashcard deck deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard deck'
    });
  }
};

// @desc    Get all cards for a deck
// @route   GET /api/flashcards/decks/:deckId/cards
// @access  Private
exports.getCards = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Check if user has access to the deck
    const deck = await FlashcardDeck.findOne({
      where: { 
        id: deckId,
        [Op.or]: [
          { userId: req.user.id },
          { '$shares.sharedWithId$': req.user.id }
        ]
      },
      include: [
        {
          model: SharedFlashcardDeck,
          as: 'shares',
          required: false,
          where: { sharedWithId: req.user.id }
        }
      ]
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you do not have access'
      });
    }
    
    // Get all cards
    const cards = await FlashcardCard.findAll({
      where: { deckId },
      order: [['createdAt', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcards'
    });
  }
};

// @desc    Create a new flashcard
// @route   POST /api/flashcards/decks/:deckId/cards
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }
    
    // Check if user has access to the deck
    const deck = await FlashcardDeck.findOne({
      where: { 
        id: deckId,
        [Op.or]: [
          { userId: req.user.id },
          { '$shares.sharedWithId$': req.user.id }
        ]
      },
      include: [
        {
          model: SharedFlashcardDeck,
          as: 'shares',
          required: false,
          where: { sharedWithId: req.user.id },
          attributes: ['canEdit']
        }
      ]
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you do not have access'
      });
    }
    
    // Check if user has permission to add cards
    const isOwner = deck.userId === req.user.id;
    const canEdit = isOwner || (deck.shares.length > 0 && deck.shares[0].canEdit);
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add cards to this deck'
      });
    }
    
    // Create the card
    const card = await FlashcardCard.create({
      question,
      answer,
      deckId
    });
    
    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create flashcard'
    });
  }
};

// @desc    Update a flashcard
// @route   PUT /api/flashcards/cards/:cardId
// @access  Private
exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { question, answer } = req.body;
    
    // Find the card
    const card = await FlashcardCard.findByPk(cardId, {
      include: [
        {
          model: FlashcardDeck,
          as: 'deck',
          include: [
            {
              model: SharedFlashcardDeck,
              as: 'shares',
              required: false,
              where: { sharedWithId: req.user.id },
              attributes: ['canEdit']
            }
          ]
        }
      ]
    });
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }
    
    // Check if user has permission to update
    const isOwner = card.deck.userId === req.user.id;
    const canEdit = isOwner || (card.deck.shares.length > 0 && card.deck.shares[0].canEdit);
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this flashcard'
      });
    }
    
    // Update the card
    await card.update({
      question: question || card.question,
      answer: answer || card.answer
    });
    
    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update flashcard'
    });
  }
};

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/cards/:cardId
// @access  Private
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    // Find the card
    const card = await FlashcardCard.findByPk(cardId, {
      include: [
        {
          model: FlashcardDeck,
          as: 'deck',
          include: [
            {
              model: SharedFlashcardDeck,
              as: 'shares',
              required: false,
              where: { sharedWithId: req.user.id },
              attributes: ['canEdit']
            }
          ]
        }
      ]
    });
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }
    
    // Check if user has permission to delete
    const isOwner = card.deck.userId === req.user.id;
    const canEdit = isOwner || (card.deck.shares.length > 0 && card.deck.shares[0].canEdit);
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this flashcard'
      });
    }
    
    // Delete the card
    await card.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard'
    });
  }
};

// @desc    Mark a flashcard as reviewed
// @route   POST /api/flashcards/cards/:cardId/review
// @access  Private
exports.markCardReviewed = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { mastered } = req.body;
    
    // Find the card
    const card = await FlashcardCard.findByPk(cardId, {
      include: [
        {
          model: FlashcardDeck,
          as: 'deck',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['role']
            }
          ]
        }
      ]
    });
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }
    
    // Check if user has access to the deck
    const deck = await FlashcardDeck.findOne({
      where: { 
        id: card.deckId,
        [Op.or]: [
          { userId: req.user.id },
          { '$shares.sharedWithId$': req.user.id },
          // Allow access to public decks from teachers and admins
          {
            isPublic: true,
            '$owner.role$': {
              [Op.in]: ['teacher', 'admin']
            }
          }
        ]
      },
      include: [
        {
          model: SharedFlashcardDeck,
          as: 'shares',
          required: false,
          where: { sharedWithId: req.user.id }
        },
        {
          model: User,
          as: 'owner',
          required: false,
          attributes: ['role']
        }
      ]
    });
    
    if (!deck) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this flashcard'
      });
    }
    
    // For global decks, we need to track the user's personal progress
    // without modifying the original card's mastery status
    if (deck.isPublic && ['teacher', 'admin'].includes(deck.owner.role) && deck.userId !== req.user.id) {
      // Create or update user's progress record for this card
      const [userProgress, created] = await UserCardProgress.findOrCreate({
        where: {
          userId: req.user.id,
          cardId: cardId,
          deckId: card.deckId
        },
        defaults: {
          mastered: mastered,
          lastReviewed: new Date(),
          reviewCount: 1
        }
      });
      
      // If the record already existed, update it
      if (!created) {
        await userProgress.update({
          mastered: mastered,
          lastReviewed: new Date(),
          reviewCount: userProgress.reviewCount + 1
        });
      }
      
      // Calculate user's mastery percentage for this deck
      const userProgressRecords = await UserCardProgress.findAll({
        where: {
          userId: req.user.id,
          deckId: card.deckId
        }
      });
      
      // Get all cards in the deck to calculate mastery percentage
      const allDeckCards = await FlashcardCard.findAll({
        where: { deckId: card.deckId }
      });
      
      // Calculate mastery percentage based on user's progress
      let masteryPercentage = 0;
      if (userProgressRecords.length > 0) {
        const masteredCount = userProgressRecords.filter(record => record.mastered).length;
        masteryPercentage = Math.round((masteredCount / allDeckCards.length) * 100);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Progress tracked for global deck card',
        data: {
          ...card.toJSON(),
          userProgress: {
            mastered: userProgress.mastered,
            lastReviewed: userProgress.lastReviewed,
            reviewCount: userProgress.reviewCount
          }
        },
        deckMastery: masteryPercentage
      });
    }
    
    // For personal or shared decks, mark the card as reviewed
    await card.markReviewed(mastered);
    
    res.status(200).json({
      success: true,
      data: card,
      deckMastery: card.deck.mastery
    });
  } catch (error) {
    console.error('Error marking flashcard as reviewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark flashcard as reviewed'
    });
  }
};

// @desc    Share a flashcard deck with another user
// @route   POST /api/flashcards/decks/:deckId/share
// @access  Private
exports.shareDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { email, canEdit, sharingToken } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { id: deckId, userId: req.user.id }
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you are not the owner'
      });
    }
    
    // Find the user to share with
    const userToShare = await User.findOne({
      where: { email }
    });
    
    if (!userToShare) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Don't share with yourself
    if (userToShare.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot share a deck with yourself'
      });
    }
    
    // Check if already shared
    const existingShare = await SharedFlashcardDeck.findOne({
      where: { deckId, sharedWithId: userToShare.id }
    });
    
    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Deck is already shared with this user'
      });
    }
    
    // Create the share with the sharing token if provided
    const share = await SharedFlashcardDeck.create({
      deckId,
      sharedWithId: userToShare.id,
      sharedById: req.user.id,
      canEdit: canEdit || false,
      sharingToken: sharingToken || null // Store the sharing token if provided
    });
    
    res.status(201).json({
      success: true,
      data: {
        ...share.toJSON(),
        sharedWith: {
          id: userToShare.id,
          firstName: userToShare.firstName,
          lastName: userToShare.lastName,
          email: userToShare.email
        }
      }
    });
  } catch (error) {
    console.error('Error sharing flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share flashcard deck'
    });
  }
};

// @desc    Remove a share from a flashcard deck
// @route   DELETE /api/flashcards/decks/:deckId/share/:userId
// @access  Private
exports.removeDeckShare = async (req, res) => {
  try {
    const { deckId, userId } = req.params;
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { id: deckId, userId: req.user.id }
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you are not the owner'
      });
    }
    
    // Find and delete the share
    const share = await SharedFlashcardDeck.findOne({
      where: { deckId, sharedWithId: userId }
    });
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    
    await share.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Share removed successfully'
    });
  } catch (error) {
    console.error('Error removing flashcard deck share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove flashcard deck share'
    });
  }
};

// @desc    Get all public flashcard decks created by teachers and admins
// @route   GET /api/flashcards/global
// @access  Private
exports.getGlobalDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.findAll({
      where: { 
        isPublic: true,
        '$owner.role$': {
          [Op.in]: ['teacher', 'admin']
        }
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'],
          required: true
        }
      ],
      attributes: [
        'id', 'title', 'description', 'subject', 'cardCount', 
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Get all deck IDs
    const deckIds = decks.map(deck => deck.id);
    
    // Get user's progress for these decks
    const userProgress = await UserCardProgress.findAll({
      where: {
        userId: req.user.id,
        deckId: {
          [Op.in]: deckIds
        }
      },
      attributes: ['deckId', 'cardId', 'mastered', 'lastReviewed']
    });
    
    // Group progress by deckId
    const progressByDeck = {};
    userProgress.forEach(progress => {
      if (!progressByDeck[progress.deckId]) {
        progressByDeck[progress.deckId] = [];
      }
      progressByDeck[progress.deckId].push(progress);
    });
    
    // Add progress information to each deck
    const decksWithProgress = decks.map(deck => {
      const deckData = deck.toJSON();
      const deckProgress = progressByDeck[deck.id] || [];
      
      // Calculate mastery percentage
      let masteryPercentage = 0;
      if (deckProgress.length > 0) {
        const masteredCount = deckProgress.filter(progress => progress.mastered).length;
        // Use deck.cardCount to calculate percentage
        masteryPercentage = deck.cardCount > 0 
          ? Math.round((masteredCount / deck.cardCount) * 100)
          : 0;
      }
      
      // Find last studied date
      const lastStudied = deckProgress.length > 0 
        ? new Date(Math.max(...deckProgress.map(p => p.lastReviewed ? new Date(p.lastReviewed).getTime() : 0)))
        : null;
      
      return {
        ...deckData,
        mastery: masteryPercentage,
        lastStudied: lastStudied,
        hasProgress: deckProgress.length > 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: decksWithProgress
    });
  } catch (error) {
    console.error('Error fetching global flashcard decks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global flashcard decks'
    });
  }
};

// @desc    Accept a shared flashcard deck
// @route   POST /api/flashcards/share/accept
// @access  Private
exports.acceptShare = async (req, res) => {
  try {
    const { deckId, token } = req.body;
    
    if (!deckId || !token) {
      return res.status(400).json({
        success: false,
        message: 'Deck ID and token are required'
      });
    }
    
    // Find the deck
    const deck = await FlashcardDeck.findByPk(deckId);
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found'
      });
    }
    
    // Check if the deck is already shared with this user
    const existingShare = await SharedFlashcardDeck.findOne({
      where: { 
        deckId,
        sharedWithId: req.user.id
      }
    });
    
    if (existingShare) {
      return res.status(200).json({
        success: true,
        message: 'Deck is already shared with you',
        data: existingShare
      });
    }
    
    // Verify that the sharing token is valid
    // This prevents unauthorized users from accessing the deck
    const validShare = await SharedFlashcardDeck.findOne({
      where: {
        deckId,
        sharingToken: token
      }
    });
    
    // If no valid share with this token exists, check if the token was meant for a direct share
    if (!validShare) {
      // Look for any share that might be pending with this token
      const pendingShare = await SharedFlashcardDeck.findOne({
        where: {
          sharingToken: token
        }
      });
      
      if (!pendingShare) {
        return res.status(404).json({
          success: false,
          message: 'Invalid sharing token. This share may have expired or been revoked.'
        });
      }
      
      // If the pending share is for a different deck, reject it
      if (pendingShare.deckId !== deckId) {
        return res.status(400).json({
          success: false,
          message: 'Token does not match the requested deck'
        });
      }
    }
    
    // Create the share record
    const share = await SharedFlashcardDeck.create({
      deckId,
      sharedWithId: req.user.id,
      sharedById: deck.userId,
      canEdit: false,
      sharingToken: token
    });
    
    res.status(201).json({
      success: true,
      message: 'Flashcard deck shared successfully',
      data: share
    });
  } catch (error) {
    console.error('Error accepting shared flashcard deck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept shared flashcard deck'
    });
  }
};

// @desc    Get all shares for a deck
// @route   GET /api/flashcards/decks/:deckId/shares
// @access  Private
exports.getDeckShares = async (req, res) => {
  try {
    const { deckId } = req.params;
    
    // Find the deck
    const deck = await FlashcardDeck.findOne({
      where: { id: deckId, userId: req.user.id }
    });
    
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found or you are not the owner'
      });
    }
    
    // Get all shares for this deck
    const shares = await SharedFlashcardDeck.findAll({
      where: { deckId },
      include: [
        {
          model: User,
          as: 'sharedWith',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: shares
    });
  } catch (error) {
    console.error('Error fetching flashcard deck shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flashcard deck shares'
    });
  }
}; 