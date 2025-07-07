# React Context

## What is React Context?

React Context is a way to share data between components without having to pass props down manually at every level. It's like creating a global state that specific components can access.

## When to Use Context

- When data needs to be accessible by many components at different nesting levels
- To avoid "prop drilling" (passing props through many intermediate components)
- For global state like user authentication, theme preferences, or language settings

## How Context Works

1. **Create a context**: Define a new context using `React.createContext()`
2. **Provide the context**: Wrap components in a Provider component with a value
3. **Consume the context**: Use the `useContext` hook to access the context value

## Example from StudyConnect

### Creating an Auth Context

```jsx
// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

// 1. Create a context
const AuthContext = createContext(null);

// 2. Create a provider component
export const AuthProvider = ({ children }) => {
  // State to hold user data
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create axios instance with base URL
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // Add auth token to requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Initialize socket connection
  const initializeSocket = (token) => {
    socketService.init(token);
  };
  
  // Check if user is already logged in when the app loads
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          // Set user from stored info initially
          setCurrentUser(JSON.parse(userInfo));
          
          // Initialize socket connection
          initializeSocket(token);
          
          // Verify token with backend
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              // Update user info from server data
              const userData = response.data.data;
              localStorage.setItem('userInfo', JSON.stringify(userData));
              setCurrentUser(userData);
            }
          } catch (err) {
            // If token is invalid, logout user
            console.error('Token validation failed:', err);
            logout();
          }
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedInStatus();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      // Initialize socket connection
      initializeSocket(token);
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Disconnect socket
    socketService.disconnect();
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };
  
  // Value to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    login,
    register: async (userData) => { /* Registration logic */ },
    logout,
    updateCurrentUser: (userData) => {
      setCurrentUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
    },
    api
  };
  
  // Provide the context value to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
```

### Using the Auth Context in Components

```jsx
// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // 3. Consume the context using the useAuth hook
  const { currentUser } = useAuth();
  
  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If specific roles are required and user doesn't have permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and authorized, render the protected content
  return children;
};

export default ProtectedRoute;
```

### Providing the Context in the App

```jsx
// src/App.jsx (simplified)

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { NotificationProvider } from './contexts/NotificationProvider';

const App = () => {
  return (
    // Wrap the app with context providers
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            {/* App content */}
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
```

## Key Takeaways

1. **Avoid Prop Drilling**: Context eliminates the need to pass props through many levels
2. **Global State**: Provides a way to share state across the entire app or a subtree
3. **Separation of Concerns**: Keeps state management logic separate from UI components
4. **Multiple Contexts**: You can use multiple contexts for different types of data
5. **Performance**: Context should be used for data that doesn't change frequently, as all consumers re-render when the context value changes 