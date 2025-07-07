# React Hooks Simplified

## What Are Hooks? 🪝

Hooks are special functions in React that let you use React features in your function components. Think of them as "hooks" that let you grab onto React powers like:
- Remembering information (state)
- Running code at specific times (lifecycle)
- Sharing logic between components

Before hooks, you had to use class components for these features. Now, you can use simple function components with hooks!

## The Most Common Hooks

### 1. useState - Remember Things

`useState` lets your component remember information that can change.

```jsx
// Simple example
const [count, setCount] = useState(0);

// count = the current value (starts at 0)
// setCount = function to change the value

// To change the value:
setCount(count + 1);  // Now count = 1
```

**Real example from StudyConnect:**
```jsx
// From LoginPage.jsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// When user types in email field:
const handleEmailChange = (e) => {
  setEmail(e.target.value);  // Update email state
};
```

### 2. useEffect - Run Code at Specific Times

`useEffect` lets you run code:
- After the component appears on screen
- After certain values change
- Before the component disappears

```jsx
// Run once when component appears
useEffect(() => {
  console.log('Component appeared!');
}, []);  // Empty array = run once only

// Run when count changes
useEffect(() => {
  console.log('Count changed to:', count);
}, [count]);  // Array with count = run when count changes
```

**Real example from StudyConnect:**
```jsx
// From StudyRoomDetail.jsx
useEffect(() => {
  // When component loads, fetch room data
  fetchRoomData(roomId);
  
  // Connect to room's socket channel
  socket.emit('room:join', roomId);
  
  // Clean up when component disappears
  return () => {
    socket.emit('room:leave', roomId);
  };
}, [roomId]);  // Re-run if roomId changes
```

### 3. useContext - Access Shared Data

`useContext` lets you access data that's shared across many components without passing props through every level.

```jsx
// First, create a context somewhere high in your app
const ThemeContext = createContext('light');

// Then, provide a value
<ThemeContext.Provider value="dark">
  {/* All children components can access "dark" */}
</ThemeContext.Provider>

// In any child component, access the value
const theme = useContext(ThemeContext);  // theme = "dark"
```

**Real example from StudyConnect:**
```jsx
// From Flashcards.jsx
const { showNotification } = useContext(NotificationContext);

// Later in the code:
showNotification('Flashcard created successfully!', 'success');
```

## Custom Hooks - Make Your Own!

You can create your own hooks to reuse logic between components. Custom hooks are just functions that use other hooks.

**Real example from StudyConnect:**
```jsx
// Custom hook to save and load from localStorage
function useLocalStorage(key, initialValue) {
  // Use useState internally
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Try to get from localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Function to update both state and localStorage
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Using the custom hook
const [studyTime, setStudyTime] = useLocalStorage('studyTime', 0);
```

## Hook Rules - Important!

1. **Only call hooks at the top level** - Don't use hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call them from function components or custom hooks

## Hooks vs. Old Way

Before hooks:
```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  componentDidMount() {
    console.log('Component appeared');
  }
  
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

With hooks:
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Component appeared');
  }, []);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Summary

- **useState**: Remember values that can change
- **useEffect**: Run code at specific times
- **useContext**: Access shared data
- **Custom hooks**: Create reusable logic

Hooks make React components simpler, more readable, and help you reuse code between components! 