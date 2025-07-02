const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyDecks,
  getSharedDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  getCards,
  createCard,
  updateCard,
  deleteCard,
  markCardReviewed,
  shareDeck,
  removeDeckShare,
  getGlobalDecks,
  acceptShare,
  getDeckShares
} = require('../controllers/flashcardController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Deck routes
router.get('/my-decks', getMyDecks);
router.get('/shared', getSharedDecks);
router.get('/global', getGlobalDecks);
router.get('/decks/:deckId', getDeckById);
router.post('/decks', createDeck);
router.put('/decks/:deckId', updateDeck);
router.delete('/decks/:deckId', deleteDeck);

// Card routes
router.get('/decks/:deckId/cards', getCards);
router.post('/decks/:deckId/cards', createCard);
router.put('/cards/:cardId', updateCard);
router.delete('/cards/:cardId', deleteCard);
router.post('/cards/:cardId/review', markCardReviewed);

// Sharing routes
router.post('/decks/:deckId/share', shareDeck);
router.delete('/decks/:deckId/share/:userId', removeDeckShare);
router.post('/share/accept', acceptShare);
router.get('/decks/:deckId/shares', getDeckShares);

module.exports = router; 