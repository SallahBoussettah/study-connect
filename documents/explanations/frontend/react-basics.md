# React Basics Simplified

## What is React? 🧩

React is a JavaScript library that makes building websites easier. Think of it like building with LEGO blocks - you create small, reusable pieces (components) and put them together to build your website.

## Why React is Awesome

- **Component-Based**: Build small pieces and combine them
- **Reactive**: When your data changes, the screen updates automatically
- **Popular**: Used by Facebook, Instagram, Netflix, and many others
- **Great for Teams**: Different people can work on different components

## Two Main Concepts You Need to Know

### 1. Components - The Building Blocks

Components are like custom HTML tags you create. Each component is responsible for one part of your screen.

```jsx
// A simple React component
function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

// Using the component
<Button text="Click me!" onClick={() => alert('Hello!')} />
```

**Real example from StudyConnect:**

```jsx
// src/components/dashboard/SubjectCard.jsx
function SubjectCard({ subject, onSelect }) {
  return (
    <div 
      className="subject-card" 
      onClick={() => onSelect(subject.id)}
    >
      <div className="subject-icon">
        <i className={subject.icon}></i>
      </div>
      <h3>{subject.name}</h3>
      <p>{subject.description}</p>
      <div className="subject-category">
        {subject.category}
      </div>
    </div>
  );
}

// Using it in another component
<div className="subjects-grid">
  {subjects.map(subject => (
    <SubjectCard
      key={subject.id}
      subject={subject}
      onSelect={handleSubjectSelect}
    />
  ))}
</div>
```

### 2. State - The Memory of React

State is how React components remember things. When state changes, React automatically updates the screen.

```jsx
// Simple counter with state
function Counter() {
  // [current value, function to update value] = useState(initial value)
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**Real example from StudyConnect:**

```jsx
// src/components/LoginPage.jsx (simplified)
function LoginPage() {
  // Create state variables to store form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    try {
      // Try to log in
      await login(email, password);
      navigate('/dashboard'); // Go to dashboard on success
    } catch (err) {
      // Show error message if login fails
      setError('Invalid email or password');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## Other Important React Concepts

### Props - Passing Data to Components

Props are like arguments you pass to a function. They let parent components send data to child components.

```jsx
// Parent component
<UserProfile name="John" role="Student" />

// Child component
function UserProfile({ name, role }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Role: {role}</p>
    </div>
  );
}
```

### JSX - HTML in JavaScript

JSX lets you write HTML-like code directly in your JavaScript. React converts it to regular JavaScript behind the scenes.

```jsx
// This is JSX
const element = <h1>Hello, world!</h1>;

// React converts it to something like this
const element = React.createElement('h1', null, 'Hello, world!');
```

## How React Updates the Screen

1. You change the state using a setter function (like `setCount(count + 1)`)
2. React compares the old virtual DOM with the new one
3. React updates only the parts of the real DOM that actually changed
4. The screen shows the updated content

This makes React very fast, even for complex applications!

## Summary

- **Components**: Reusable pieces of your interface
- **State**: Data that can change over time
- **Props**: Data passed from parent to child components
- **JSX**: HTML-like syntax in JavaScript
- **Virtual DOM**: Makes updates fast and efficient 