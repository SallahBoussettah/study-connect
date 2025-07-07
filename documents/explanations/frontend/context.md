# React Context Simplified

## What is React Context? 🌍

Think of React Context as a way to create global variables for your React app. It lets components share data without passing props down through every level.

Imagine you have a family tree of components:

```
App
├── Header
│   └── UserProfile (needs user data)
├── Main
│   ├── Dashboard (needs user data)
│   └── Settings (needs user data)
└── Footer
```

Without Context, you'd have to pass user data through every component in the chain. With Context, components can access the data directly!

## How Context Works in 3 Simple Steps

### 1. Create a Context

```jsx
// Create a new context with a default value
const UserContext = createContext(null);
```

### 2. Provide the Context

```jsx
// Wrap components that need access to the data
function App() {
  const [user, setUser] = useState({name: "John", role: "student"});
  
  return (
    <UserContext.Provider value={user}>
      {/* Any child component can now access user data */}
      <Header />
      <Main />
      <Footer />
    </UserContext.Provider>
  );
}
```

### 3. Use the Context

```jsx
function UserProfile() {
  // Get data from context
  const user = useContext(UserContext);
  
  return <div>Hello, {user.name}!</div>;
}
```

## Real Examples from StudyConnect

### Example 1: Authentication Context

In StudyConnect, the auth context manages user login state across the app:

```jsx
// src/contexts/AuthContext.jsx (simplified)

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Login function
  const login = async (email, password) => {
    try {
      // Call API to login
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token and user info
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      
      return user;
    } catch (error) {
      throw new Error('Login failed');
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };
  
  // 3. Provide context value
  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
```

### Example 2: Using Auth Context in a Component

```jsx
// src/components/LoginPage.jsx (simplified)

import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();  // Get login function from context
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the login function from context
      await login(email, password);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## When to Use Context

✅ **Good for:**
- User authentication state
- Theme preferences (dark/light mode)
- Language settings
- Notifications system

❌ **Not good for:**
- Data that changes frequently
- Deep component trees where only a few components need the data

## Context vs. Props

**Without Context (using props):**
```jsx
// Passing user data through props
<App>
  <Header user={user}>
    <Navigation user={user} />
  </Header>
  <Main user={user}>
    <Dashboard user={user} />
  </Main>
</App>
```

**With Context:**
```jsx
// Provide once at the top
<UserContext.Provider value={user}>
  <App>
    <Header>
      <Navigation /> {/* Can access user directly */}
    </Header>
    <Main>
      <Dashboard /> {/* Can access user directly */}
    </Main>
  </App>
</UserContext.Provider>
```

## Summary

- Context provides a way to share values between components without passing props
- It's perfect for global data like user info, themes, and settings
- Setup is easy: create, provide, and use with `useContext`
- Use it to avoid "prop drilling" through many component levels 