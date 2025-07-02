import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaRandom, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaGraduationCap, FaGlobe, FaUser, FaUsers, FaShareAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import socketService from '../../services/socketService';

const Flashcards = () => {
  const { currentUser, api } = useAuth();
  const [activeTab, setActiveTab] = useState('myDecks');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDeck, setCurrentDeck] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for flashcard decks
  const [myDecks, setMyDecks] = useState([]);
  const [sharedDecks, setSharedDecks] = useState([]);
  const [globalDecks, setGlobalDecks] = useState([]);
  
  // State for creating new deck
  const [newDeck, setNewDeck] = useState({
    title: '',
    description: '',
    subject: '',
    isPublic: false,
    cards: []
  });
  
  // State for editing deck
  const [editDeck, setEditDeck] = useState({
    id: '',
    title: '',
    description: '',
    subject: '',
    cards: []
  });
  
  // State for creating new card
  const [newCard, setNewCard] = useState({
    question: '',
    answer: ''
  });
  
  // State for editing card
  const [editCard, setEditCard] = useState({
    id: '',
    question: '',
    answer: ''
  });

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deckToShare, setDeckToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingStatus, setSharingStatus] = useState({});
  const [shareWithEmail, setShareWithEmail] = useState('');
  const [canEditShared, setCanEditShared] = useState(false);

  // Fetch user's decks
  const fetchDecks = async () => {
    setLoading(true);
    try {
      // Fetch my decks
      const myDecksResponse = await api.get('/flashcards/my-decks');
      setMyDecks(myDecksResponse.data.data);
      
      // Fetch shared decks
      const sharedDecksResponse = await api.get('/flashcards/shared');
      setSharedDecks(sharedDecksResponse.data.data);
      
      // Fetch global decks
      const globalDecksResponse = await api.get('/flashcards/global');
      setGlobalDecks(globalDecksResponse.data.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching flashcard decks:', err);
      setError('Failed to load flashcard decks. Please try again later.');
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch of decks
  useEffect(() => {
    fetchDecks();
    
    // Check URL parameters for tab selection
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'shared') {
      setActiveTab('shared');
    }
  }, [api]);
  
  // Filter decks based on search query
  const filteredDecks = activeTab === 'myDecks' 
    ? myDecks.filter(deck => 
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTab === 'shared'
    ? sharedDecks.filter(deck => 
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : globalDecks.filter(deck => 
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Start studying a deck
  const startStudying = async (deckId) => {
    try {
      setLoading(true);
      // Fetch the full deck with cards
      const response = await api.get(`/flashcards/decks/${deckId}`);
      const deck = response.data.data;
      
      if (!deck.cards || deck.cards.length === 0) {
        toast.info('This deck has no cards to study');
        return;
      }
      
      setCurrentDeck(deck);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setStudyMode(true);
    } catch (err) {
      console.error('Error fetching deck for study:', err);
      toast.error('Failed to load study deck');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate through cards
  const nextCard = () => {
    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // End of deck
      toast.success('You completed this study session!');
      exitStudyMode();
    }
  };
  
  // Exit study mode and refresh deck data
  const exitStudyMode = () => {
    setStudyMode(false);
    setCurrentDeck(null);
    // Refresh the decks data to show updated mastery
    fetchDecks();
  };
  
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };
  
  // Mark card as mastered/not mastered
  const markCard = async (mastered) => {
    try {
      const cardId = currentDeck.cards[currentCardIndex].id;
      
      // Call API to mark card as reviewed
      const response = await api.post(`/flashcards/cards/${cardId}/review`, { mastered });
      
      // Update the local state with the response data
      const updatedDeck = { ...currentDeck };
      
      // If the response includes card data with userProgress (for global decks)
      if (response.data.data.userProgress) {
        updatedDeck.cards[currentCardIndex] = {
          ...updatedDeck.cards[currentCardIndex],
          mastered: response.data.data.userProgress.mastered,
          lastReviewed: response.data.data.userProgress.lastReviewed,
          reviewCount: response.data.data.userProgress.reviewCount
        };
      } else {
        // For personal decks
        updatedDeck.cards[currentCardIndex] = {
          ...updatedDeck.cards[currentCardIndex],
          mastered: mastered,
          lastReviewed: new Date().toISOString(),
          reviewCount: (updatedDeck.cards[currentCardIndex].reviewCount || 0) + 1
        };
      }
      
      // Update deck mastery if provided in the response
      if (response.data.deckMastery !== undefined) {
        updatedDeck.mastery = response.data.deckMastery;
      }
      
      setCurrentDeck(updatedDeck);
      
      // Move to next card
      nextCard();
    } catch (err) {
      console.error('Error marking card:', err);
      toast.error('Failed to update card status');
    }
  };
  
  // Add new card to deck being created
  const addCardToDeck = () => {
    if (newCard.question.trim() && newCard.answer.trim()) {
      setNewDeck({
        ...newDeck,
        cards: [...newDeck.cards, { ...newCard, mastered: false }]
      });
      setNewCard({ question: '', answer: '' });
    } else {
      toast.warning('Both question and answer are required');
    }
  };
  
  // Add new card to deck being edited
  const addCardToEditDeck = () => {
    if (editCard.question.trim() && editCard.answer.trim()) {
      setEditDeck({
        ...editDeck,
        cards: [...editDeck.cards, { ...editCard, mastered: false }]
      });
      setEditCard({ id: '', question: '', answer: '' });
    } else {
      toast.warning('Both question and answer are required');
    }
  };
  
  // Start editing a deck
  const handleStartEditDeck = async (deckId) => {
    try {
      setLoading(true);
      
      // Fetch the full deck with cards
      const response = await api.get(`/flashcards/decks/${deckId}`);
      const deck = response.data.data;
      
      // Set the edit deck state
      setEditDeck({
        id: deck.id,
        title: deck.title,
        description: deck.description || '',
        subject: deck.subject || '',
        cards: deck.cards || []
      });
      
      setShowEditDeck(true);
    } catch (err) {
      console.error('Error fetching deck for edit:', err);
      toast.error('Failed to load deck for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing a specific card
  const startEditingCard = (card) => {
    setEditCard({
      id: card.id,
      question: card.question,
      answer: card.answer
    });
    setShowEditCard(true);
  };

  // Save edited card
  const saveEditedCard = async () => {
    if (!editCard.question.trim() || !editCard.answer.trim()) {
      toast.warning('Both question and answer are required');
      return;
    }
    
    try {
      setLoading(true);
      
      await updateCardInEditDeck(editCard.id, {
        question: editCard.question,
        answer: editCard.answer
      });
      
      // Close the edit card modal
      setShowEditCard(false);
      
    } catch (err) {
      console.error('Error saving card:', err);
      toast.error('Failed to save card');
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing card in the edit deck
  const updateCardInEditDeck = async (cardId, updatedCard) => {
    try {
      setLoading(true);
      
      // Call API to update card
      await api.put(`/flashcards/cards/${cardId}`, updatedCard);
      
      // Update the local state
      const updatedCards = editDeck.cards.map(card => 
        card.id === cardId ? { ...card, ...updatedCard } : card
      );
      
      setEditDeck({
        ...editDeck,
        cards: updatedCards
      });
      
      toast.success('Card updated successfully');
    } catch (err) {
      console.error('Error updating card:', err);
      toast.error('Failed to update card');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a card from the edit deck
  const deleteCardFromEditDeck = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to delete card
      await api.delete(`/flashcards/cards/${cardId}`);
      
      // Update the local state
      const updatedCards = editDeck.cards.filter(card => card.id !== cardId);
      
      setEditDeck({
        ...editDeck,
        cards: updatedCards
      });
      
      toast.success('Card deleted successfully');
    } catch (err) {
      console.error('Error deleting card:', err);
      toast.error('Failed to delete card');
    } finally {
      setLoading(false);
    }
  };
  
  // Save edited deck
  const handleSaveEditDeck = async () => {
    if (!editDeck.title.trim()) {
      toast.warning('Deck title is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to update deck details
      await api.put(`/flashcards/decks/${editDeck.id}`, {
        title: editDeck.title,
        description: editDeck.description,
        subject: editDeck.subject
      });
      
      // Process any new cards that don't have IDs yet
      const newCards = editDeck.cards.filter(card => !card.id);
      if (newCards.length > 0) {
        // Create each new card one by one
        for (const card of newCards) {
          await api.post(`/flashcards/decks/${editDeck.id}/cards`, {
            question: card.question,
            answer: card.answer
          });
        }
        
        toast.success(`Added ${newCards.length} new card${newCards.length > 1 ? 's' : ''}`);
      }
      
      // Refresh decks to show updated data
      await fetchDecks();
      
      // Close edit modal
      setShowEditDeck(false);
      
      toast.success('Flashcard deck updated successfully');
    } catch (err) {
      console.error('Error updating deck:', err);
      toast.error('Failed to update flashcard deck');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new deck
  const handleCreateDeck = async () => {
    if (!newDeck.title.trim()) {
      toast.warning('Deck title is required');
      return;
    }
    
    if (newDeck.cards.length === 0) {
      toast.warning('Add at least one card to your deck');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to create deck with cards
      const response = await api.post('/flashcards/decks', newDeck);
      
      // Add new deck to state
      setMyDecks([response.data.data, ...myDecks]);
      
      // Reset form
      setNewDeck({ title: '', description: '', subject: '', isPublic: false, cards: [] });
      setShowCreateDeck(false);
      
      toast.success('Flashcard deck created successfully');
    } catch (err) {
      console.error('Error creating deck:', err);
      toast.error('Failed to create flashcard deck');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a deck
  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to delete deck
      await api.delete(`/flashcards/decks/${deckId}`);
      
      // Remove deck from state
      setMyDecks(myDecks.filter(deck => deck.id !== deckId));
      
      toast.success('Flashcard deck deleted successfully');
    } catch (err) {
      console.error('Error deleting deck:', err);
      toast.error('Failed to delete flashcard deck');
    } finally {
      setLoading(false);
    }
  };
  
  // Open share modal
  const openShareModal = (deck) => {
    setDeckToShare(deck);
    setShareModalOpen(true);
    fetchFriends();
  };

  // Close share modal
  const closeShareModal = () => {
    setShareModalOpen(false);
    setDeckToShare(null);
    setSharingStatus({});
    setShareWithEmail('');
    setCanEditShared(false);
  };

  // Fetch friends list
  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const response = await api.get('/friends');
      setFriends(response.data.data || []);
      
      // If we have a deck to share, check which friends already have it shared
      if (deckToShare) {
        try {
          // Get existing shares for this deck
          const sharesResponse = await api.get(`/flashcards/decks/${deckToShare.id}/shares`);
          const existingShares = sharesResponse.data.data || [];
          
          // Mark friends who already have this deck shared
          const initialSharingStatus = {};
          existingShares.forEach(share => {
            const friendId = share.sharedWithId;
            initialSharingStatus[friendId] = 'already-shared';
          });
          
          setSharingStatus(initialSharingStatus);
        } catch (error) {
          console.error('Error fetching deck shares:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends list');
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Share deck with a friend
  const shareWithFriend = async (friendId) => {
    // Don't do anything if already shared
    if (sharingStatus[friendId] === 'already-shared') {
      return;
    }
    
    try {
      setSharingStatus(prev => ({ ...prev, [friendId]: 'loading' }));
      
      // Create a unique sharing token for this share
      const sharingToken = `share_${Date.now().toString(36)}_${Math.random().toString(36).substr(2)}`;
      
      // Create a direct link to accept the share and go to the Shared With Me tab
      const shareAcceptUrl = `${window.location.origin}/dashboard/flashcards/share/accept/${deckToShare.id}/${sharingToken}`;
      
      // Create message content with HTML link that will be processed by renderMessageWithLinks
      // This hides the raw URL and shows a clean clickable text instead
      let messageContent = `I've shared my flashcard deck "${deckToShare.title}" with you. <a href="${shareAcceptUrl}">Click here to access the deck</a>`;
      
      // First share the deck through the API to ensure the token is saved
      await api.post(`/flashcards/decks/${deckToShare.id}/share`, { 
        email: friends.find(f => f.id === friendId).email,
        canEdit: false,
        sharingToken: sharingToken
      });
      
      // Join the direct chat first to ensure the connection is established
      socketService.joinDirectChat(friendId);
      
      // Small delay to ensure the join operation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to send via socket for real-time delivery
      const sent = socketService.sendDirectMessage(friendId, messageContent);
      
      // If socket sending fails, fall back to API
      if (!sent) {
        await api.post(`/messages/direct/${friendId}`, { content: messageContent });
      }
      
      setSharingStatus(prev => ({ ...prev, [friendId]: 'success' }));
      
      // Reset status after 2 seconds to show "already shared"
      setTimeout(() => {
        setSharingStatus(prev => {
          const newStatus = { ...prev };
          newStatus[friendId] = 'already-shared';
          return newStatus;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing deck:', error);
      setSharingStatus(prev => ({ ...prev, [friendId]: 'error' }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSharingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[friendId];
          return newStatus;
        });
      }, 2000);
    }
  };
  
  // Share deck with email
  const shareWithEmailHandler = async (e) => {
    e.preventDefault();
    
    if (!shareWithEmail.trim()) {
      toast.warning('Please enter an email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Share the deck through the API
      await api.post(`/flashcards/decks/${deckToShare.id}/share`, { 
        email: shareWithEmail,
        canEdit: canEditShared
      });
      
      toast.success(`Deck shared with ${shareWithEmail}`);
      setShareWithEmail('');
      
    } catch (error) {
      console.error('Error sharing deck:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to share deck');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!studyMode ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Flashcards</h1>
              <p className="text-secondary-600 mt-1">
                Create and study flashcards to improve your memory retention
              </p>
            </div>
            <button 
              onClick={() => setShowCreateDeck(true)}
              className="mt-4 md:mt-0 btn-primary flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Create New Deck
            </button>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-secondary-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('myDecks')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'myDecks'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <FaUser className="mr-2" /> My Decks
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'shared'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <FaUsers className="mr-2" /> Shared With Me
                </button>
                <button
                  onClick={() => setActiveTab('global')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'global'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  <FaGlobe className="mr-2" /> Global Decks
                </button>
              </nav>
            </div>
            
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search flashcard decks..."
                  className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Flashcard Decks */}
          {activeTab === 'myDecks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FaTimes className="text-red-500 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">Error Loading Flashcards</h3>
                  <p className="text-secondary-500">{error}</p>
                </div>
              ) : filteredDecks.length > 0 ? (
                filteredDecks.map(deck => (
                  <div key={deck.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">{deck.title}</h3>
                        {deck.subject && (
                        <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {deck.subject}
                        </span>
                        )}
                      </div>
                      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                        {deck.description || 'No description'}
                      </p>
                      <div className="flex justify-between items-center text-sm text-secondary-500 mb-4">
                        <span>{deck.cardCount} cards</span>
                        <span>
                          {deck.lastStudied 
                            ? `Last studied: ${new Date(deck.lastStudied).toLocaleDateString()}`
                            : 'Never studied'}
                        </span>
                      </div>
                      
                      {/* Mastery progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-secondary-700">Mastery</span>
                          <span className="text-xs font-medium text-secondary-700">{deck.mastery}%</span>
                        </div>
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${deck.mastery}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startStudying(deck.id)}
                          className="flex-1 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                          disabled={loading}
                        >
                          Study
                        </button>
                        <button 
                          className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors"
                          onClick={() => handleStartEditDeck(deck.id)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors"
                          onClick={() => openShareModal(deck)}
                          disabled={loading}
                        >
                          <FaShareAlt />
                        </button>
                        <button 
                          className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors"
                          onClick={() => handleDeleteDeck(deck.id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                    <FaGraduationCap className="text-secondary-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">No flashcard decks found</h3>
                  <p className="text-secondary-500">Create your first deck to start studying</p>
                  <button
                    onClick={() => setShowCreateDeck(true)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create Flashcard Deck
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'shared' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FaTimes className="text-red-500 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">Error Loading Shared Decks</h3>
                  <p className="text-secondary-500">{error}</p>
                </div>
              ) : filteredDecks.length > 0 ? (
                filteredDecks.map(deck => (
                  <div key={deck.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">{deck.title}</h3>
                        {deck.subject && (
                          <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                            {deck.subject}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mb-2 text-sm text-secondary-600">
                        <span>Shared by: </span>
                        <div className="flex items-center ml-1">
                          {deck.sharedBy?.avatar && (
                            <img 
                              src={deck.sharedBy.avatar} 
                              alt={`${deck.sharedBy.firstName} ${deck.sharedBy.lastName}`}
                              className="h-5 w-5 rounded-full mr-1"
                            />
                          )}
                          <span>{deck.sharedBy?.firstName} {deck.sharedBy?.lastName}</span>
                        </div>
                      </div>
                      
                      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                        {deck.description || 'No description'}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-secondary-500 mb-4">
                        <span>{deck.cardCount} cards</span>
                        <span>
                          {deck.lastStudied 
                            ? `Last studied: ${new Date(deck.lastStudied).toLocaleDateString()}`
                            : 'Never studied'}
                        </span>
                      </div>
                      
                      {/* Mastery progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-secondary-700">Mastery</span>
                          <span className="text-xs font-medium text-secondary-700">{deck.mastery}%</span>
                        </div>
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${deck.mastery}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startStudying(deck.id)}
                          className="flex-1 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                          disabled={loading}
                        >
                          Study
                        </button>
                        {deck.canEdit && (
                          <button 
                            className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors"
                            onClick={() => handleStartEditDeck(deck.id)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                    <FaGraduationCap className="text-secondary-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">No shared decks yet</h3>
                  <p className="text-secondary-500">Decks shared with you will appear here</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'global' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FaTimes className="text-red-500 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">Error Loading Global Decks</h3>
                  <p className="text-secondary-500">{error}</p>
                </div>
              ) : filteredDecks.length > 0 ? (
                filteredDecks.map(deck => (
                  <div key={deck.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">{deck.title}</h3>
                        {deck.subject && (
                          <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                            {deck.subject}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mb-2 text-sm text-secondary-600">
                        <span>Created by: </span>
                        <div className="flex items-center ml-1">
                          {deck.owner?.avatar && (
                            <img 
                              src={deck.owner.avatar} 
                              alt={`${deck.owner.firstName} ${deck.owner.lastName}`}
                              className="h-5 w-5 rounded-full mr-1"
                            />
                          )}
                          <span>{deck.owner?.firstName} {deck.owner?.lastName}</span>
                          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            {deck.owner?.role === 'admin' ? 'Admin' : 'Teacher'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                        {deck.description || 'No description'}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-secondary-500 mb-4">
                        <span>{deck.cardCount} cards</span>
                        <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <button
                        onClick={() => startStudying(deck.id)}
                        className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
                        disabled={loading}
                      >
                        Study
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                    <FaGlobe className="text-secondary-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-1">No global decks available</h3>
                  <p className="text-secondary-500">Global decks created by teachers and admins will appear here</p>
                </div>
              )}
            </div>
          )}
          
          {/* Create Deck Modal */}
          {showCreateDeck && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-secondary-900 opacity-75"></div>
                </div>
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-secondary-900 mb-4">Create New Flashcard Deck</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                          Deck Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newDeck.title}
                          onChange={(e) => setNewDeck({...newDeck, title: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows="2"
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newDeck.description}
                          onChange={(e) => setNewDeck({...newDeck, description: e.target.value})}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-1">
                          Subject
                        </label>
                        <select
                          id="subject"
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newDeck.subject}
                          onChange={(e) => setNewDeck({...newDeck, subject: e.target.value})}
                        >
                          <option value="">Select a subject</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Biology">Biology</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Physics">Physics</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Literature">Literature</option>
                          <option value="History">History</option>
                          <option value="Languages">Languages</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                        {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                        <div>
                          <label htmlFor="isPublic" className="flex items-center text-sm font-medium text-secondary-700 mb-1">
                            <input
                              type="checkbox"
                              id="isPublic"
                              className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                              checked={newDeck.isPublic}
                              onChange={(e) => setNewDeck({...newDeck, isPublic: e.target.checked})}
                            />
                            Make this deck public (visible to everyone)
                          </label>
                          <p className="text-xs text-secondary-500 ml-6">
                            As {currentUser?.role === 'admin' ? 'an' : 'a'} {currentUser?.role}, your public decks will appear in the Global Decks section
                          </p>
                        </div>
                      )}
                      
                      <div className="border-t border-secondary-200 pt-4">
                        <h4 className="text-sm font-medium text-secondary-900 mb-2">Cards ({newDeck.cards.length})</h4>
                        
                        {newDeck.cards.length > 0 && (
                          <div className="mb-4 max-h-40 overflow-y-auto">
                            {newDeck.cards.map((card, index) => (
                              <div key={index} className="p-3 bg-secondary-50 rounded-md mb-2">
                                <p className="font-medium text-sm">{card.question}</p>
                                <p className="text-secondary-600 text-sm mt-1">{card.answer}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="bg-secondary-50 p-3 rounded-md">
                          <div className="mb-2">
                            <label htmlFor="question" className="block text-xs font-medium text-secondary-700 mb-1">
                              Question
                            </label>
                            <input
                              type="text"
                              id="question"
                              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              value={newCard.question}
                              onChange={(e) => setNewCard({...newCard, question: e.target.value})}
                            />
                          </div>
                          
                          <div className="mb-2">
                            <label htmlFor="answer" className="block text-xs font-medium text-secondary-700 mb-1">
                              Answer
                            </label>
                            <textarea
                              id="answer"
                              rows="2"
                              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              value={newCard.answer}
                              onChange={(e) => setNewCard({...newCard, answer: e.target.value})}
                            ></textarea>
                          </div>
                          
                          <button
                            onClick={addCardToDeck}
                            className="w-full py-1 bg-secondary-200 text-secondary-700 rounded-md hover:bg-secondary-300 transition-colors text-sm"
                          >
                            Add Card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleCreateDeck}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Deck'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowCreateDeck(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Study Mode */
        <div className="h-full flex flex-col">
          <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">{currentDeck.title}</h1>
              <p className="text-sm text-secondary-500">
                Card {currentCardIndex + 1} of {currentDeck.cards.length}
              </p>
            </div>
            <button
              onClick={exitStudyMode}
              className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors"
            >
              Exit
            </button>
          </div>
          
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              {/* Card mastery indicator */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  {currentDeck.cards[currentCardIndex].mastered ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheck className="mr-1" /> Mastered
                    </span>
                  ) : currentDeck.cards[currentCardIndex].reviewCount > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaTimes className="mr-1" /> Learning
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      New Card
                    </span>
                  )}
                </div>
                {currentDeck.cards[currentCardIndex].reviewCount > 0 && (
                  <span className="text-xs text-secondary-500">
                    Reviewed {currentDeck.cards[currentCardIndex].reviewCount} {currentDeck.cards[currentCardIndex].reviewCount === 1 ? 'time' : 'times'}
                    {currentDeck.cards[currentCardIndex].lastReviewed && 
                      ` · Last: ${new Date(currentDeck.cards[currentCardIndex].lastReviewed).toLocaleDateString()}`
                    }
                  </span>
                )}
              </div>
              
              <div 
                className={`bg-white rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-between transform transition-all duration-300 ${
                  showAnswer ? 'rotate-y-180' : ''
                }`}
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {!showAnswer ? (
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-secondary-900 mb-6">
                      {currentDeck.cards[currentCardIndex].question}
                    </h2>
                    <p className="text-secondary-500 text-sm mt-8">Click to reveal answer</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-secondary-700 mb-4">Answer:</h3>
                    <p className="text-xl text-secondary-900">
                      {currentDeck.cards[currentCardIndex].answer}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className={`p-2 rounded-full ${
                    currentCardIndex === 0
                      ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                  }`}
                >
                  <FaChevronLeft />
                </button>
                
                {showAnswer && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => markCard(false)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center"
                      disabled={loading}
                    >
                      <FaTimes className="mr-2" /> Still Learning
                    </button>
                    <button
                      onClick={() => markCard(true)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
                      disabled={loading}
                    >
                      <FaCheck className="mr-2" /> Mastered
                    </button>
                  </div>
                )}
                
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === currentDeck.cards.length - 1 && !showAnswer}
                  className={`p-2 rounded-full ${
                    currentCardIndex === currentDeck.cards.length - 1 && !showAnswer
                      ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
                  }`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Deck Modal */}
      {showEditDeck && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-900 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Edit Flashcard Deck</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-secondary-700 mb-1">
                      Deck Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editDeck.title}
                      onChange={(e) => setEditDeck({...editDeck, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-secondary-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      rows="2"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editDeck.description}
                      onChange={(e) => setEditDeck({...editDeck, description: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-subject" className="block text-sm font-medium text-secondary-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="edit-subject"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editDeck.subject}
                      onChange={(e) => setEditDeck({...editDeck, subject: e.target.value})}
                    >
                      <option value="">Select a subject</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Literature">Literature</option>
                      <option value="History">History</option>
                      <option value="Languages">Languages</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-secondary-200 pt-4">
                    <h4 className="text-sm font-medium text-secondary-900 mb-2">Cards ({editDeck.cards.length})</h4>
                    
                    {editDeck.cards.length > 0 && (
                      <div className="mb-4 max-h-60 overflow-y-auto">
                        {editDeck.cards.map((card, index) => (
                          <div key={card.id || index} className="p-3 bg-secondary-50 rounded-md mb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <p className="font-medium text-sm">{card.question}</p>
                                  {card.mastered && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <FaCheck className="mr-1" size={8} /> Mastered
                                    </span>
                                  )}
                                  {!card.mastered && card.reviewCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Learning
                                    </span>
                                  )}
                                </div>
                                <p className="text-secondary-600 text-sm mt-1">{card.answer}</p>
                                {card.reviewCount > 0 && (
                                  <p className="text-xs text-secondary-400 mt-1">
                                    Reviewed {card.reviewCount} {card.reviewCount === 1 ? 'time' : 'times'}
                                    {card.lastReviewed && ` · Last: ${new Date(card.lastReviewed).toLocaleDateString()}`}
                                  </p>
                                )}
                              </div>
                              {card.id && (
                                <div className="flex space-x-2 ml-2">
                                  <button
                                    onClick={() => startEditingCard(card)}
                                    className="p-1 text-secondary-500 hover:text-secondary-700"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteCardFromEditDeck(card.id)}
                                    className="p-1 text-secondary-500 hover:text-red-500"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-secondary-50 p-3 rounded-md">
                      <div className="mb-2">
                        <label htmlFor="edit-question" className="block text-xs font-medium text-secondary-700 mb-1">
                          Add New Question
                        </label>
                        <input
                          type="text"
                          id="edit-question"
                          className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={editCard.question}
                          onChange={(e) => setEditCard({...editCard, question: e.target.value})}
                        />
                      </div>
                      
                      <div className="mb-2">
                        <label htmlFor="edit-answer" className="block text-xs font-medium text-secondary-700 mb-1">
                          Add New Answer
                        </label>
                        <textarea
                          id="edit-answer"
                          rows="2"
                          className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={editCard.answer}
                          onChange={(e) => setEditCard({...editCard, answer: e.target.value})}
                        ></textarea>
                      </div>
                      
                      <button
                        onClick={addCardToEditDeck}
                        className="w-full py-1 bg-secondary-200 text-secondary-700 rounded-md hover:bg-secondary-300 transition-colors text-sm"
                      >
                        Add New Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveEditDeck}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditDeck(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Card Modal */}
      {showEditCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-900 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Edit Card</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-card-question" className="block text-sm font-medium text-secondary-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      id="edit-card-question"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editCard.question}
                      onChange={(e) => setEditCard({...editCard, question: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-card-answer" className="block text-sm font-medium text-secondary-700 mb-1">
                      Answer
                    </label>
                    <textarea
                      id="edit-card-answer"
                      rows="4"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editCard.answer}
                      onChange={(e) => setEditCard({...editCard, answer: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={saveEditedCard}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Card'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditCard(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Deck Modal */}
      {shareModalOpen && deckToShare && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-900 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Share Flashcard Deck</h3>
                
                <p className="mb-4 text-secondary-600">
                  Share "{deckToShare.title}" with others:
                </p>
                
                {/* Share by email form */}
                <form onSubmit={shareWithEmailHandler} className="mb-6">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                      Share with email
                    </label>
                    <div className="flex">
                      <input
                        type="email"
                        id="email"
                        className="flex-1 px-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={shareWithEmail}
                        onChange={(e) => setShareWithEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Sharing...' : 'Share'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canEdit"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      checked={canEditShared}
                      onChange={(e) => setCanEditShared(e.target.checked)}
                    />
                    <label htmlFor="canEdit" className="ml-2 block text-sm text-secondary-700">
                      Allow editing
                    </label>
                  </div>
                </form>
                
                <div className="border-t border-secondary-200 pt-4">
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Share with friends</h4>
                  
                  {loadingFriends ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                      <p className="mt-2 text-secondary-600">Loading friends...</p>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-8 text-secondary-600">
                      <p>You don't have any friends yet.</p>
                      <p className="mt-2">
                        <Link to="/dashboard/friends" className="text-primary-600 hover:text-primary-700">
                          Add friends
                        </Link>
                        {' '}to share flashcard decks with them.
                      </p>
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {friends.map(friend => (
                        <li key={friend.id} className="py-2 border-b border-secondary-100 last:border-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {friend.avatar ? (
                                <img 
                                  src={friend.avatar} 
                                  alt={`${friend.firstName} ${friend.lastName}`} 
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                  {friend.firstName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-secondary-900">{friend.firstName} {friend.lastName}</span>
                            </div>
                            <button
                              onClick={() => shareWithFriend(friend.id)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                sharingStatus[friend.id] === 'loading' ? 'bg-secondary-100 text-secondary-500' :
                                sharingStatus[friend.id] === 'success' ? 'bg-green-100 text-green-700' :
                                sharingStatus[friend.id] === 'error' ? 'bg-red-100 text-red-700' :
                                sharingStatus[friend.id] === 'already-shared' ? 'bg-blue-100 text-blue-700' :
                                'bg-primary-100 text-primary-700 hover:bg-primary-200'
                              }`}
                              disabled={sharingStatus[friend.id] === 'loading' || sharingStatus[friend.id] === 'already-shared'}
                            >
                              {sharingStatus[friend.id] === 'loading' ? 'Sharing...' :
                               sharingStatus[friend.id] === 'success' ? 'Shared!' :
                               sharingStatus[friend.id] === 'error' ? 'Failed' :
                               sharingStatus[friend.id] === 'already-shared' ? 'Shared' : 'Share'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeShareModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards; 