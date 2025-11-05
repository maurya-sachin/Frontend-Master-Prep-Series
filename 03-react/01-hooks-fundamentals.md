# React Hooks Fundamentals

> **Essential React Hooks every developer must master - useState, useEffect, useRef, useCallback, useMemo, useContext, and custom hooks**

---

## Question 1: What is useState and how does it work?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the useState hook in React. How does it differ from class component state? When should you use functional updates?

### Answer

`useState` is a Hook that lets you add state to functional components.

1. **Basic Syntax**
   - Returns array: `[state, setState]`
   - State persists between re-renders
   - Triggers re-render when state changes

2. **Lazy Initialization**
   - Pass function to useState for expensive computations
   - Function only runs on initial render

3. **Functional Updates**
   - Use when new state depends on previous state
   - Guarantees correct state in async updates
   - Essential for closures and event handlers

4. **Multiple State Variables**
   - Can call useState multiple times
   - Each has independent state
   - Better than one giant object

### Code Example

```javascript
import { useState } from 'react';

// 1. BASIC USAGE
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// 2. LAZY INITIALIZATION (expensive computation)
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    console.log('Computing initial state...');
    return computeExpensiveValue(); // Only runs once
  });

  // Wrong: runs on every render
  // const [data, setData] = useState(computeExpensiveValue());
}

// 3. FUNCTIONAL UPDATES
function Counter2() {
  const [count, setCount] = useState(0);

  // ❌ Wrong: doesn't work correctly with multiple rapid clicks
  const increment = () => {
    setCount(count + 1);
    setCount(count + 1); // Still uses old count!
  };

  // ✅ Correct: functional update
  const incrementCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // Works correctly!
  };

  return <button onClick={incrementCorrect}>Count: {count}</button>;
}

// 4. MULTIPLE STATE VARIABLES
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  // Better than:
  // const [form, setForm] = useState({ name: '', email: '', age: 0 });
}

// 5. OBJECT STATE
function UserProfile() {
  const [user, setUser] = useState({ name: '', age: 0 });

  // ❌ Wrong: loses other properties
  const updateName = (name) => {
    setUser({ name }); // age is lost!
  };

  // ✅ Correct: spread existing state
  const updateNameCorrect = (name) => {
    setUser(prev => ({ ...prev, name }));
  };
}

// 6. ARRAY STATE
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    // ✅ Correct: create new array
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  };

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id, newText) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
}

// 7. TOGGLE STATE
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  // ✅ Functional update for toggles
  const toggle = () => setIsOn(prev => !prev);

  return <button onClick={toggle}>{isOn ? 'ON' : 'OFF'}</button>;
}

// 8. FORM HANDLING
function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <input
        type="checkbox"
        name="rememberMe"
        checked={formData.rememberMe}
        onChange={handleChange}
      />
    </form>
  );
}
```

### Common Mistakes

❌ **Mistake 1:** Mutating state directly
```javascript
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Wrong! Mutates state
setItems(items); // React won't detect change
```

❌ **Mistake 2:** Not using functional updates in loops
```javascript
for (let i = 0; i < 3; i++) {
  setCount(count + 1); // All use same count!
}

// ✅ Correct
for (let i = 0; i < 3; i++) {
  setCount(prev => prev + 1);
}
```

✅ **Correct:** Always create new references
```javascript
setItems(prev => [...prev, 4]); // New array reference
```

### Follow-up Questions

- "Why do we need functional updates?"
- "What's the difference between useState and useReducer?"
- "How does React know when to re-render?"
- "Can you batch multiple setState calls?"
- "What happens if you call setState with the same value?"

### Resources

- [React Docs: useState](https://react.dev/reference/react/useState)
- [useState Complete Guide](https://www.robinwieruch.de/react-usestate-hook/)

---

## Question 2: How does useEffect work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Airbnb

### Question
Explain the useEffect hook. What are the different dependency array patterns? When and why do you need cleanup functions?

### Answer

`useEffect` lets you perform side effects in functional components (data fetching, subscriptions, DOM manipulation).

1. **Execution Timing**
   - Runs after render commits to screen
   - Asynchronous (doesn't block rendering)
   - Replaces componentDidMount, componentDidUpdate, componentWillUnmount

2. **Dependency Array**
   - `[]` = run once (mount only)
   - `[dep]` = run when dep changes
   - No array = run after every render

3. **Cleanup Function**
   - Returned function runs before next effect
   - Runs on unmount
   - Essential for subscriptions, timers, listeners

4. **Common Use Cases**
   - Fetching data
   - Setting up subscriptions
   - Manipulating DOM
   - Synchronizing with external systems

### Code Example

```javascript
import { useState, useEffect } from 'react';

// 1. BASIC USAGE - Runs after every render
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }); // No dependency array
}

// 2. EMPTY DEPENDENCIES - Runs once on mount
function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []); // Empty array = componentDidMount
}

// 3. WITH DEPENDENCIES - Runs when dependencies change
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]); // Re-run when query changes
}

// 4. CLEANUP FUNCTION - Clear subscriptions
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup runs on unmount and before next effect
    return () => clearInterval(interval);
  }, []);
}

// 5. EVENT LISTENERS WITH CLEANUP
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: remove listener
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty deps: set up once
}

// 6. WEBSOCKET SUBSCRIPTION
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(`ws://server/room/${roomId}`);

    socket.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };

    // Cleanup: close socket
    return () => socket.close();
  }, [roomId]); // Reconnect when room changes
}

// 7. ASYNC EFFECT WITH ABORT
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const data = await fetchUser(userId);
      if (!cancelled) {
        setUser(data);
      }
    }

    loadUser();

    return () => {
      cancelled = true; // Prevent state update if unmounted
    };
  }, [userId]);
}

// 8. DEPENDENT EFFECTS
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Effect 1: Validate on every change
  useEffect(() => {
    setIsValid(name.length > 0 && email.includes('@'));
  }, [name, email]);

  // Effect 2: Save to localStorage
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify({ name, email }));
  }, [name, email]);
}

// 9. CONDITIONALLY RUNNING EFFECTS
function AutoSave({ content, isDraft }) {
  useEffect(() => {
    if (!isDraft) return; // Skip effect

    const timer = setTimeout(() => {
      saveToServer(content);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, isDraft]);
}

// 10. MULTIPLE EFFECTS (SEPARATION OF CONCERNS)
function Dashboard() {
  useEffect(() => {
    // Effect 1: Analytics
    trackPageView();
  }, []);

  useEffect(() => {
    // Effect 2: Data fetching
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Effect 3: Realtime updates
    const unsubscribe = subscribeToUpdates();
    return unsubscribe;
  }, []);
}
```

### Common Mistakes

❌ **Mistake 1:** Missing dependencies
```javascript
function Component({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setData); // Uses userId
  }, []); // ❌ Missing userId in dependencies!
}
```

❌ **Mistake 2:** Not cleaning up subscriptions
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    console.log('tick');
  }, 1000);
  // ❌ No cleanup! Memory leak!
}, []);
```

❌ **Mistake 3:** Async useEffect directly
```javascript
// ❌ Wrong: useEffect cannot be async
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ Correct: create async function inside
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load();
}, []);
```

✅ **Correct:** Include all dependencies and clean up
```javascript
useEffect(() => {
  let cancelled = false;

  fetchUser(userId).then(data => {
    if (!cancelled) setData(data);
  });

  return () => {
    cancelled = true;
  };
}, [userId]); // All dependencies included
```

### Follow-up Questions

- "What's the difference between useEffect and useLayoutEffect?"
- "How do you fetch data with useEffect?"
- "Why does my effect run twice in development?"
- "How do you handle race conditions in useEffect?"
- "What are the rules for dependency arrays?"

### Resources

- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [useEffect Cleanup](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)

---

[← Back to React README](./README.md) | [Next: Advanced Hooks →](./02-advanced-hooks.md)

**Progress:** 2 of 7 hooks questions completed

_More hooks content (useRef, useCallback, useMemo, useContext, custom hooks) will be added..._
