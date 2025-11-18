# React Hooks - useContext and useReducer

> Master useContext and useReducer hooks

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

## Questions 3-15: More Essential Hooks

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Consolidated hooks patterns**

### Q3-5: useRef, useCallback, useMemo

```javascript
// Q3: useRef - Mutable reference that persists across renders
import { useRef, useState, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// useRef for mutable values (doesn't trigger re-render)
function Stopwatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p>Time: {time}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

// Q4: useCallback - Memoize functions to prevent re-creation
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // ❌ Wrong: Function recreated on every render
  const incrementBad = () => {
    setCount(c => c + 1);
  };

  // ✅ Correct: Memoized function
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty deps: function never changes

  return <ChildComponent onIncrement={increment} />;
}

// useCallback with dependencies
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Function depends on query and filters
  const search = useCallback(() => {
    performSearch(query, filters);
  }, [query, filters]); // Recreate when these change

  return <SearchResults onSearch={search} />;
}

// Q5: useMemo - Memoize expensive computations
function ExpensiveList({ items }) {
  // ❌ Wrong: Computed on every render
  const sortedItems = items.sort((a, b) => b.value - a.value);

  // ✅ Correct: Only recompute when items change
  const sortedItemsMemo = useMemo(() => {
    console.log('Sorting...');
    return items.sort((a, b) => b.value - a.value);
  }, [items]);

  return (
    <ul>
      {sortedItemsMemo.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// useMemo for complex objects
function UserProfile({ user }) {
  // Prevent recreating object on every render
  const userConfig = useMemo(() => ({
    name: user.name,
    settings: processSettings(user.settings),
    permissions: calculatePermissions(user.role)
  }), [user.name, user.settings, user.role]);

  return <ConfigProvider config={userConfig} />;
}
```

### Q6-8: useContext, useReducer, Custom Hooks

```javascript
// Q6: useContext - Access context without prop drilling
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for theme context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      style={{ background: theme === 'light' ? '#fff' : '#333' }}
      onClick={toggleTheme}
    >
      Toggle Theme
    </button>
  );
}

// Q7: useReducer - Complex state management
import { useReducer } from 'react';

const initialState = {
  count: 0,
  step: 1,
  history: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, `+${state.step}`]
      };
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, `-${state.step}`]
      };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({
          type: 'SET_STEP',
          payload: Number(e.target.value)
        })}
      />
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <p>History: {state.history.join(', ')}</p>
    </div>
  );
}

// Q8: Custom Hooks - Reusable logic
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();

        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserList() {
  const { data, loading, error } = useFetch('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Q9-11: Advanced Custom Hooks

```javascript
// Q9: useLocalStorage - Persist state in localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Set Dark</button>;
}

// Q10: useDebounce - Debounce value changes
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // API call happens 500ms after user stops typing
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}

// Q11: usePrevious - Track previous value
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Q12-15: More Advanced Hooks

```javascript
// Q12: useOnClickOutside - Detect clicks outside element
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown Content</div>}
    </div>
  );
}

// Q13: useInterval - Declarative interval hook
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Usage
function Clock() {
  const [time, setTime] = useState(new Date());

  useInterval(() => {
    setTime(new Date());
  }, 1000);

  return <div>{time.toLocaleTimeString()}</div>;
}

// Q14: useMediaQuery - Responsive hooks
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}

// Q15: useAsync - Handle async operations
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback((...params) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    return asyncFunction(...params)
      .then(response => {
        setValue(response);
        setStatus('success');
      })
      .catch(error => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

// Usage
function UserProfile({ userId }) {
  const { status, value, error } = useAsync(
    () => fetchUser(userId),
    true
  );

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;
  if (status === 'success') return <div>Hello {value.name}</div>;

  return null;
}
```

### Common Hooks Mistakes

```javascript
// ❌ WRONG: Calling hooks conditionally
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // Error!
  }
}

// ✅ CORRECT: Always call hooks at top level
function Component({ condition }) {
  const [state, setState] = useState(0);

  if (condition) {
    // Use state here
  }
}

// ❌ WRONG: Using stale values in effects
function Component({ userId }) {
  const [user, setUser] = useState(null);

  const fetchUser = () => {
    fetch(`/api/users/${userId}`).then(setUser);
  };

  useEffect(() => {
    fetchUser(); // fetchUser not in deps!
  }, []); // ❌ Missing dependency
}

// ✅ CORRECT: Include all dependencies
function Component({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(setUser);
  }, [userId]); // ✅ All dependencies included
}

// ❌ WRONG: Overusing useMemo/useCallback
function Component() {
  // Don't memoize everything!
  const simpleValue = useMemo(() => 2 + 2, []); // Overkill
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Premature optimization
}

// ✅ CORRECT: Use when actually needed
function Component({ items }) {
  // Good: Expensive computation
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => /* complex sorting */);
  }, [items]);

  // Good: Passing to memo'd child
  const handleClick = useCallback(() => {
    doSomething();
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}
```

### Resources
- [React Hooks API Reference](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

[← Back to React README](./README.md) | [Next: Advanced Hooks →](./02-advanced-hooks.md)

**Progress:** 15 of 15 hooks fundamentals completed ✅
