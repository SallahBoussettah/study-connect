import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaRandom, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Flashcards = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('myDecks');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDeck, setCurrentDeck] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  
  // Mock data for flashcard decks
  const [myDecks, setMyDecks] = useState([
    {
      id: 1,
      title: 'Calculus Fundamentals',
      description: 'Basic concepts and formulas for calculus',
      cardCount: 24,
      lastStudied: '2023-06-10T15:30:00',
      mastery: 68,
      subject: 'Mathematics',
      cards: [
        { id: 1, question: 'What is the derivative of sin(x)?', answer: 'cos(x)', mastered: true },
        { id: 2, question: 'What is the derivative of e^x?', answer: 'e^x', mastered: true },
        { id: 3, question: 'What is the integral of 1/x?', answer: 'ln|x| + C', mastered: false },
        { id: 4, question: 'What is the chain rule?', answer: 'If y = f(g(x)), then dy/dx = (df/dg) × (dg/dx)', mastered: false },
        { id: 5, question: 'What is the product rule?', answer: 'If y = f(x) × g(x), then dy/dx = f(x) × g\'(x) + g(x) × f\'(x)', mastered: true },
      ]
    },
    {
      id: 2,
      title: 'Biology Terms',
      description: 'Important terminology for biology exams',
      cardCount: 42,
      lastStudied: '2023-06-12T09:15:00',
      mastery: 45,
      subject: 'Biology',
      cards: [
        { id: 1, question: 'What is photosynthesis?', answer: 'The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water', mastered: true },
        { id: 2, question: 'What is cellular respiration?', answer: 'The process by which cells break down glucose and other molecules to generate ATP', mastered: false },
        { id: 3, question: 'What is mitosis?', answer: 'A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus', mastered: false },
      ]
    },
    {
      id: 3,
      title: 'Computer Science Concepts',
      description: 'Core concepts in computer science and programming',
      cardCount: 36,
      lastStudied: '2023-06-08T14:00:00',
      mastery: 72,
      subject: 'Computer Science',
      cards: [
        { id: 1, question: 'What is a data structure?', answer: 'A specialized format for organizing, processing, retrieving and storing data', mastered: true },
        { id: 2, question: 'What is an algorithm?', answer: 'A step-by-step procedure for solving a problem or accomplishing a task', mastered: true },
        { id: 3, question: 'What is object-oriented programming?', answer: 'A programming paradigm based on the concept of "objects", which can contain data and code', mastered: false },
        { id: 4, question: 'What is recursion?', answer: 'A method where the solution to a problem depends on solutions to smaller instances of the same problem', mastered: true },
      ]
    }
  ]);
  
  const [newDeck, setNewDeck] = useState({
    title: '',
    description: '',
    subject: '',
    cards: []
  });
  
  const [newCard, setNewCard] = useState({
    question: '',
    answer: ''
  });
  
  // Filter decks based on search query
  const filteredDecks = myDecks.filter(deck => 
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Start studying a deck
  const startStudying = (deckId) => {
    const deck = myDecks.find(d => d.id === deckId);
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode(true);
  };
  
  // Navigate through cards
  const nextCard = () => {
    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // End of deck
      setStudyMode(false);
      setCurrentDeck(null);
    }
  };
  
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };
  
  // Mark card as mastered/not mastered
  const markCard = (mastered) => {
    const updatedDecks = myDecks.map(deck => {
      if (deck.id === currentDeck.id) {
        const updatedCards = deck.cards.map(card => {
          if (card.id === currentDeck.cards[currentCardIndex].id) {
            return { ...card, mastered };
          }
          return card;
        });
        
        // Calculate new mastery percentage
        const masteredCount = updatedCards.filter(card => card.mastered).length;
        const newMastery = Math.round((masteredCount / updatedCards.length) * 100);
        
        return { 
          ...deck, 
          cards: updatedCards,
          mastery: newMastery
        };
      }
      return deck;
    });
    
    setMyDecks(updatedDecks);
    setCurrentDeck(updatedDecks.find(d => d.id === currentDeck.id));
    nextCard();
  };
  
  // Add new card to deck being created
  const addCardToDeck = () => {
    if (newCard.question.trim() && newCard.answer.trim()) {
      setNewDeck({
        ...newDeck,
        cards: [...newDeck.cards, { ...newCard, id: newDeck.cards.length + 1, mastered: false }]
      });
      setNewCard({ question: '', answer: '' });
    }
  };
  
  // Create new deck
  const handleCreateDeck = () => {
    if (newDeck.title.trim() && newDeck.cards.length > 0) {
      const newDeckWithId = {
        ...newDeck,
        id: myDecks.length + 1,
        cardCount: newDeck.cards.length,
        lastStudied: new Date().toISOString(),
        mastery: 0
      };
      
      setMyDecks([...myDecks, newDeckWithId]);
      setNewDeck({ title: '', description: '', subject: '', cards: [] });
      setShowCreateDeck(false);
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
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('myDecks')}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'myDecks'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  My Decks
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'shared'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  Shared With Me
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
              {filteredDecks.length > 0 ? (
                filteredDecks.map(deck => (
                  <div key={deck.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">{deck.title}</h3>
                        <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {deck.subject}
                        </span>
                      </div>
                      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                        {deck.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-secondary-500 mb-4">
                        <span>{deck.cardCount} cards</span>
                        <span>Last studied: {new Date(deck.lastStudied).toLocaleDateString()}</span>
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
                        >
                          Study
                        </button>
                        <button className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors">
                          <FaEdit />
                        </button>
                        <button className="p-2 bg-secondary-100 text-secondary-600 rounded-md hover:bg-secondary-200 transition-colors">
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
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <FaGraduationCap className="text-secondary-400 text-xl" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No shared decks yet</h3>
              <p className="text-secondary-500">Decks shared with you will appear here</p>
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
                    >
                      Create Deck
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowCreateDeck(false)}
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
              onClick={() => setStudyMode(false)}
              className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors"
            >
              Exit
            </button>
          </div>
          
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
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
                    >
                      <FaTimes className="mr-2" /> Still Learning
                    </button>
                    <button
                      onClick={() => markCard(true)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
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
    </div>
  );
};

export default Flashcards; 