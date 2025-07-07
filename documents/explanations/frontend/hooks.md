# React Hooks

## What are React Hooks?

React Hooks are functions that let you "hook into" React state and lifecycle features from functional components. They were introduced in React 16.8 to allow you to use state and other React features without writing class components.

## Common Built-in Hooks

1. **useState**: Adds state to functional components
2. **useEffect**: Handles side effects (like data fetching, subscriptions)
3. **useContext**: Accesses React context
4. **useRef**: Creates a mutable reference that persists across renders
5. **useMemo**: Memoizes expensive calculations
6. **useCallback**: Memoizes callback functions
7. **useReducer**: Manages complex state logic

## Examples from StudyConnect

### useState Hook

The `useState` hook lets you add state to functional components.

```jsx
// src/pages/LoginPage.jsx (simplified)

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  // State variables with useState
  const [email, setEmail] = useState(''); // Initialize email state as empty string
  const [password, setPassword] = useState(''); // Initialize password state as empty string
  const [isLoading, setIsLoading] = useState(false); // Initialize loading state as false
  const [error, setError] = useState(null); // Initialize error state as null
  
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Attempt to log in
      await login(email, password);
      // Redirect happens in the auth context after successful login
    } catch (err) {
      // Handle login error
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <h1>Login to StudyConnect</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
```

### useEffect Hook

The `useEffect` hook lets you perform side effects in functional components.

```jsx
// src/components/dashboard/StudyRoomDetail.jsx (simplified)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';

const StudyRoomDetail = () => {
  const { roomId } = useParams();
  const { api } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  // Effect to fetch room data when component mounts or roomId changes
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        
        // Fetch room details from API
        const response = await api.get(`/api/study-rooms/${roomId}`);
        setRoom(response.data.data);
        setParticipants(response.data.data.participants || []);
        
        setError(null);
      } catch (err) {
        setError('Failed to load study room details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchRoomData();
    }
    
    // Cleanup function (runs when component unmounts or before re-running effect)
    return () => {
      // Any cleanup code here
    };
  }, [roomId, api]); // Dependencies array - effect runs when these values change
  
  // Effect to handle socket events for real-time updates
  useEffect(() => {
    if (!roomId) return;
    
    // Join the room socket
    socketService.joinRoom(roomId);
    
    // Listen for user joined event
    socketService.on('room:userJoined', (data) => {
      if (data.roomId === roomId) {
        setParticipants(prev => [...prev, data.user]);
      }
    });
    
    // Listen for user left event
    socketService.on('room:userLeft', (data) => {
      if (data.roomId === roomId) {
        setParticipants(prev => prev.filter(p => p.id !== data.userId));
      }
    });
    
    // Cleanup function
    return () => {
      // Leave the room socket
      socketService.leaveRoom(roomId);
      
      // Remove event listeners
      socketService.off('room:userJoined');
      socketService.off('room:userLeft');
    };
  }, [roomId]); // Only re-run if roomId changes
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!room) return <div>Room not found</div>;
  
  return (
    <div className="study-room-detail">
      <h1>{room.name}</h1>
      <p>{room.description}</p>
      
      <h2>Participants ({participants.length})</h2>
      <ul className="participants-list">
        {participants.map(user => (
          <li key={user.id}>
            <img src={user.avatar || '/default-avatar.png'} alt="Avatar" />
            <span>{user.firstName} {user.lastName}</span>
          </li>
        ))}
      </ul>
      
      {/* More room content */}
    </div>
  );
};

export default StudyRoomDetail;
```

### useContext Hook

The `useContext` hook lets you access React context in functional components.

```jsx
// src/components/dashboard/Flashcards.jsx (simplified)

import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';

const Flashcards = () => {
  const { currentUser, api } = useAuth();
  
  // Use the useContext hook to access notification context
  const { showNotification } = useContext(NotificationContext);
  
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/flashcards/decks');
        setDecks(response.data.data);
      } catch (error) {
        console.error('Failed to fetch flashcard decks:', error);
        // Use the notification context to show an error message
        showNotification('error', 'Failed to load flashcard decks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDecks();
  }, [api, showNotification]);
  
  const handleDeleteDeck = async (deckId) => {
    try {
      await api.delete(`/api/flashcards/decks/${deckId}`);
      setDecks(decks.filter(deck => deck.id !== deckId));
      
      // Show success notification using context
      showNotification('success', 'Flashcard deck deleted successfully');
    } catch (error) {
      console.error('Failed to delete deck:', error);
      showNotification('error', 'Failed to delete flashcard deck');
    }
  };
  
  return (
    <div className="flashcards-container">
      <h1>My Flashcards</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="deck-list">
          {decks.map(deck => (
            <div key={deck.id} className="deck-card">
              <h3>{deck.title}</h3>
              <p>{deck.description}</p>
              <div className="deck-actions">
                <button onClick={() => handleDeleteDeck(deck.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
```

### Custom Hook

Custom hooks let you extract component logic into reusable functions.

```jsx
// src/hooks/useLocalStorage.js

import { useState, useEffect } from 'react';

// Custom hook to persist state in localStorage
const useLocalStorage = (key, initialValue) => {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  // Update localStorage when state changes
  useEffect(() => {
    try {
      // Store state in localStorage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
};

export default useLocalStorage;
```

### Using the Custom Hook

```jsx
// src/components/StudyTimer.jsx (simplified)

import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const StudyTimer = () => {
  // Use our custom hook instead of useState
  const [studyTime, setStudyTime] = useLocalStorage('studyTime', 25);
  const [breakTime, setBreakTime] = useLocalStorage('breakTime', 5);
  const [isRunning, setIsRunning] = useLocalStorage('timerRunning', false);
  const [timeLeft, setTimeLeft] = useLocalStorage('timeLeft', studyTime * 60);
  const [mode, setMode] = useLocalStorage('timerMode', 'study');
  
  // Timer logic would go here
  
  return (
    <div className="study-timer">
      <h1>Study Timer</h1>
      
      <div className="timer-display">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      
      <div className="timer-controls">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => {
          setTimeLeft(mode === 'study' ? studyTime * 60 : breakTime * 60);
          setIsRunning(false);
        }}>
          Reset
        </button>
      </div>
      
      <div className="timer-settings">
        <div>
          <label>Study Time (minutes)</label>
          <input
            type="number"
            value={studyTime}
            onChange={(e) => setStudyTime(Number(e.target.value))}
            min="1"
            max="120"
          />
        </div>
        
        <div>
          <label>Break Time (minutes)</label>
          <input
            type="number"
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            min="1"
            max="60"
          />
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
```

## Key Takeaways

1. **Functional Components**: Hooks let you use state and other React features in functional components
2. **Reusable Logic**: Custom hooks allow you to extract and reuse stateful logic between components
3. **Simpler Code**: Hooks often result in more concise and readable code than class components
4. **Side Effects**: `useEffect` provides a clear way to handle side effects like data fetching
5. **Rules of Hooks**: Always call hooks at the top level of your components and only call them from React functions 