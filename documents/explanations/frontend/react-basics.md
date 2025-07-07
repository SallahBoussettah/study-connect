# React Basics

## What is React?

React is a JavaScript library for building user interfaces. It lets you create reusable UI components that update efficiently when your data changes.

## Key Concepts

### Components

Components are the building blocks of a React application. They are like custom HTML elements that contain both the structure (HTML) and behavior (JavaScript) of a part of your UI.

**Example from StudyConnect:**

```jsx
// src/components/ProtectedRoute.jsx - A component that protects routes from unauthorized access

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get current user from authentication context
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

### JSX

JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code in your JavaScript files.

**Example from StudyConnect:**

```jsx
// From src/App.jsx - JSX syntax in action

// This is JSX - HTML-like syntax in JavaScript
return (
  <Router>
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* More routes... */}
          </Routes>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  </Router>
);
```

### Props

Props (short for properties) are how components receive data from their parent components.

**Example from StudyConnect:**

```jsx
// Parent component passing props to a child component
<StudyRoomCard 
  key={room.id}
  room={room}
  onJoin={handleJoinRoom}
  onLeave={handleLeaveRoom}
/>

// StudyRoomCard component receiving props
const StudyRoomCard = ({ room, onJoin, onLeave }) => {
  // Use the room data and callback functions passed as props
  return (
    <div className="card">
      <h3>{room.name}</h3>
      <p>{room.description}</p>
      <button onClick={() => onJoin(room.id)}>Join</button>
      <button onClick={() => onLeave(room.id)}>Leave</button>
    </div>
  );
};
```

### State

State is data that changes over time in a component. When state changes, React automatically re-renders the component.

**Example from StudyConnect:**

```jsx
// Using state in a functional component with the useState hook
import React, { useState } from 'react';

const LoginPage = () => {
  // Create state variables with useState
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Update state to show loading indicator
    
    try {
      // Login logic...
    } catch (error) {
      // Error handling...
    } finally {
      setIsLoading(false); // Update state to hide loading indicator
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Key Takeaways

1. React is all about **components** - small, reusable pieces of your interface
2. **JSX** lets you write HTML-like code in JavaScript
3. **Props** pass data down from parent to child components
4. **State** manages data that changes over time
5. When **state** or **props** change, React efficiently updates only the parts of the UI that need to change 