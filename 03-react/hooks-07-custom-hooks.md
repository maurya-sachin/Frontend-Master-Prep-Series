# React Custom Hooks - Advanced Patterns

## Question 1: How do you create custom hooks and what are the best practices?

**Answer:**

Custom hooks are JavaScript functions that start with "use" and can call other hooks. They allow you to extract component logic into reusable functions, promoting code reuse and separation of concerns. Unlike regular functions, custom hooks can use React hooks inside them, maintaining the same lifecycle and state management capabilities.

The fundamental principle is that custom hooks encapsulate stateful logic that can be shared across multiple components without changing the component hierarchy. They follow the same rules as built-in hooks: only call hooks at the top level, only call hooks from React functions, and ensure hook calls happen in the same order on every render.

Best practices include:

**Naming Convention**: Always prefix with "use" (e.g., `useFetch`, `useLocalStorage`). This signals to React's linter that the function follows hook rules and enables proper validation.

**Single Responsibility**: Each custom hook should handle one specific concern. A `useFetch` hook handles data fetching, while `useAuth` handles authentication logic. Avoid creating "god hooks" that do too many things.

**Return Values**: Return an object for multiple values (easier to extend) or an array for tuple-like patterns (similar to `useState`). Choose based on how consumers will use the hook.

**Dependencies Management**: Properly declare all dependencies in internal `useEffect` calls. Missing dependencies cause stale closures and bugs that are difficult to debug.

**Error Handling**: Include comprehensive error states and boundaries. Network requests, parsing operations, and side effects can all fail and should be handled gracefully.

**Cleanup**: Always return cleanup functions from `useEffect` when dealing with subscriptions, timers, or event listeners to prevent memory leaks.

Custom hooks transform React development by enabling true logic reuse without render props or higher-order components, leading to cleaner, more maintainable code.

---

### 🔍 Deep Dive: Custom Hook Architecture and Composition Patterns

Custom hooks represent a paradigm shift in React development, enabling developers to encapsulate complex stateful logic into composable, testable units. Understanding their internal mechanics and composition patterns is crucial for building scalable React applications.

#### Hook Composition Chain

When you call a custom hook, you're creating a dependency chain that React manages:

```javascript
function useUser(userId) {
  // This hook composes multiple primitive hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Effect registered with React's fiber
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true; // Cleanup to prevent state updates after unmount
    };
  }, [userId]); // Dependency array - re-run when userId changes

  return { user, loading, error };
}
```

React maintains a linked list of hooks for each component. When `useUser` is called, React walks this list in order, matching each hook call to its stored state. This is why hooks must be called in the same order every render.

#### Advanced Composition Patterns

**Pattern 1: Hook Chaining**

Custom hooks can call other custom hooks, creating powerful abstractions:

```javascript
function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  return { token, user, setToken, setUser };
}

function useAuthenticatedFetch(url) {
  const { token } = useAuth(); // Using another custom hook
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url, token]);

  return { data, loading };
}
```

**Pattern 2: Reducer-Based Hooks**

For complex state logic, combine `useReducer` with custom hooks:

```javascript
function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error(`Unhandled action: ${action.type}`);
  }
}

function useFetch(url, options = {}) {
  const [state, dispatch] = useReducer(fetchReducer, {
    data: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: 'FETCH_INIT' });

    fetch(url, options)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        }
      })
      .catch(error => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_FAILURE', payload: error });
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}
```

#### Testing Custom Hooks

React provides `@testing-library/react-hooks` (now part of `@testing-library/react`) for testing hooks in isolation:

```javascript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

test('useCounter with async', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useFetch('/api/data')
  );

  expect(result.current.loading).toBe(true);

  await waitForNextUpdate();

  expect(result.current.loading).toBe(false);
  expect(result.current.data).toBeDefined();
});
```

#### Performance Optimization in Custom Hooks

Use `useMemo` and `useCallback` strategically within custom hooks:

```javascript
function useExpensiveComputation(data) {
  // Memoize expensive calculation
  const processed = useMemo(() => {
    return data.map(item => {
      // Expensive transformation
      return complexCalculation(item);
    });
  }, [data]);

  // Memoize callbacks to prevent re-renders
  const refresh = useCallback(() => {
    // Refresh logic
  }, []);

  return { processed, refresh };
}
```

#### TypeScript Integration

TypeScript enhances custom hooks with type safety:

```typescript
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Implementation
  }, [url]);

  return state;
}

// Usage with type inference
const { data, loading } = useFetch<User[]>('/api/users');
// data is typed as User[] | null
```

Custom hooks are React's most powerful code reuse mechanism, enabling developers to build libraries of domain-specific abstractions while maintaining the declarative nature of React components.

---

### 🐛 Real-World Scenario: Debugging Stale Closure Bugs in Custom Hooks

**Context**: E-commerce platform with real-time inventory tracking using a custom `useInventorySubscription` hook. Users reported seeing incorrect stock counts, and "Add to Cart" buttons weren't disabling when items went out of stock.

#### The Bug

```javascript
// ❌ BUGGY VERSION
function useInventorySubscription(productId) {
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/inventory');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // BUG: Closure captures initial productId value
      if (data.productId === productId) {
        setInventory(data.stock);
      }
    };

    return () => ws.close();
  }, []); // Missing productId in dependencies!

  return inventory;
}

// Component using the hook
function ProductCard({ productId }) {
  const stock = useInventorySubscription(productId);

  return (
    <div>
      <h3>Product {productId}</h3>
      <p>Stock: {stock}</p>
      <button disabled={stock === 0}>Add to Cart</button>
    </div>
  );
}
```

#### Impact Metrics

- **Bug Reports**: 347 customer complaints in 48 hours
- **Revenue Impact**: $23,400 lost sales (customers couldn't add in-stock items)
- **False Positives**: 892 "out of stock" errors for available items
- **User Sessions Affected**: 12,459 sessions with incorrect inventory data
- **Cart Abandonment**: 34% increase during the bug period

#### Root Cause Analysis

The hook had multiple critical issues:

1. **Stale Closure**: The `onmessage` handler captured the initial `productId` value. When the component re-rendered with a new `productId`, the old WebSocket handler still referenced the old value.

2. **Missing Dependencies**: The empty dependency array `[]` meant the effect only ran once, never re-subscribing when `productId` changed.

3. **No Cleanup Strategy**: When `productId` changed, the old WebSocket connection wasn't closed before creating a new one, causing memory leaks.

4. **Race Conditions**: Multiple WebSocket connections could exist simultaneously, with messages arriving out of order.

#### Debugging Process

**Step 1: Add Logging (5 minutes)**

```javascript
useEffect(() => {
  console.log('[useInventorySubscription] Effect running for productId:', productId);

  const ws = new WebSocket('wss://api.example.com/inventory');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('[useInventorySubscription] Message received:', data);
    console.log('[useInventorySubscription] Current productId in closure:', productId);

    if (data.productId === productId) {
      setInventory(data.stock);
    }
  };

  return () => {
    console.log('[useInventorySubscription] Cleanup for productId:', productId);
    ws.close();
  };
}, []);
```

This revealed the effect only ran once, and the closure always referenced the first `productId`.

**Step 2: ESLint Warnings (2 minutes)**

Running ESLint with `eslint-plugin-react-hooks`:

```bash
Warning: React Hook useEffect has a missing dependency: 'productId'.
Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
```

**Step 3: Chrome DevTools Performance Analysis (15 minutes)**

Memory profiling showed:
- 23 WebSocket connections open simultaneously (should be 1)
- Memory growing by ~2MB per product page navigation
- Event listeners accumulating without cleanup

#### The Fix

```javascript
// ✅ FIXED VERSION
function useInventorySubscription(productId) {
  const [inventory, setInventory] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!productId) return; // Guard clause

    let cancelled = false; // Prevent state updates after unmount
    const ws = new WebSocket(`wss://api.example.com/inventory?product=${productId}`);

    ws.onopen = () => {
      if (!cancelled) {
        setIsConnected(true);
        setError(null);
      }
    };

    ws.onmessage = (event) => {
      if (cancelled) return; // Early exit if cleanup started

      try {
        const data = JSON.parse(event.data);

        // No need to check productId - server filters by connection
        setInventory(data.stock);
      } catch (err) {
        setError(err);
      }
    };

    ws.onerror = (err) => {
      if (!cancelled) {
        setError(err);
        setIsConnected(false);
      }
    };

    ws.onclose = () => {
      if (!cancelled) {
        setIsConnected(false);
      }
    };

    // Cleanup function
    return () => {
      cancelled = true;
      setIsConnected(false);
      ws.close();
    };
  }, [productId]); // Correct dependency array

  return { inventory, error, isConnected };
}
```

#### Improved Implementation with Retry Logic

```javascript
// ✅ PRODUCTION-READY VERSION
function useInventorySubscription(productId, options = {}) {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    onError = () => {}
  } = options;

  const [state, setState] = useState({
    inventory: null,
    error: null,
    isConnected: false,
    isReconnecting: false
  });

  const attemptRef = useRef(0);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!productId) return;

    const ws = new WebSocket(`wss://api.example.com/inventory?product=${productId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0; // Reset retry counter
      setState(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        error: null
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setState(prev => ({ ...prev, inventory: data.stock }));
      } catch (err) {
        console.error('Failed to parse inventory data:', err);
      }
    };

    ws.onerror = (err) => {
      setState(prev => ({ ...prev, error: err, isConnected: false }));
      onError(err);
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, isConnected: false }));

      // Retry logic
      if (attemptRef.current < retryAttempts) {
        attemptRef.current += 1;
        setState(prev => ({ ...prev, isReconnecting: true }));

        setTimeout(() => {
          connect();
        }, retryDelay * attemptRef.current); // Exponential backoff
      }
    };
  }, [productId, retryAttempts, retryDelay, onError]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return state;
}

// Usage
function ProductCard({ productId }) {
  const { inventory, error, isConnected, isReconnecting } = useInventorySubscription(
    productId,
    {
      retryAttempts: 5,
      retryDelay: 2000,
      onError: (err) => {
        analytics.track('websocket_error', { productId, error: err.message });
      }
    }
  );

  if (error && !isReconnecting) {
    return <div>Failed to load inventory. Please refresh.</div>;
  }

  return (
    <div>
      <h3>Product {productId}</h3>
      {isReconnecting && <span>Reconnecting...</span>}
      <p>Stock: {inventory ?? 'Loading...'}</p>
      <button
        disabled={inventory === 0 || !isConnected}
      >
        Add to Cart
      </button>
    </div>
  );
}
```

#### Post-Fix Metrics

- **Bug Resolution Time**: 2 hours from identification to deployment
- **Customer Complaints**: Dropped to 0 within 4 hours
- **Memory Leaks**: Eliminated (verified with 8-hour soak test)
- **WebSocket Connections**: Stable at 1 per active product page
- **Cart Conversion**: Recovered to baseline + 2% improvement
- **Inventory Accuracy**: 99.97% (previously 87%)

#### Key Lessons

1. **Always include exhaustive dependencies**: Use ESLint rules to catch missing dependencies
2. **Add cancellation flags**: Prevent state updates after component unmounts
3. **Test productId changes**: Verify hooks work correctly when dependencies change
4. **Monitor resource cleanup**: Check for memory leaks and orphaned connections
5. **Add error boundaries**: Graceful degradation when WebSocket fails
6. **Use refs for non-reactive values**: `wsRef` prevents unnecessary effect re-runs

---

### ⚖️ Trade-offs: When to Extract Custom Hooks vs. Inline Logic

Creating custom hooks involves architectural decisions that impact code maintainability, performance, and team productivity. Understanding when to extract logic versus keeping it inline requires balancing multiple factors.

#### Decision Matrix

| Factor | Extract to Hook | Keep Inline |
|--------|-----------------|-------------|
| **Reuse Frequency** | Used in 3+ components | Used in 1-2 components |
| **Logic Complexity** | 20+ lines, multiple effects | <10 lines, single effect |
| **Testing Needs** | Needs isolated testing | Tested via component |
| **Team Size** | Large team, shared patterns | Small team, simple app |
| **State Complexity** | Multiple state pieces, complex updates | Single state value |
| **Dependencies** | Complex dependency tracking | Simple, obvious dependencies |

#### Trade-off Analysis

**Extraction Benefits:**

1. **Reusability**
```javascript
// ✅ GOOD: Reusable across many components
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Used in 15+ components across the app
function Sidebar() {
  const { width } = useWindowSize();
  return width < 768 ? <MobileSidebar /> : <DesktopSidebar />;
}
```

2. **Testability**
```javascript
// ✅ GOOD: Testable in isolation
import { renderHook } from '@testing-library/react';

test('useDebounce delays value updates', async () => {
  jest.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated', delay: 500 });
  expect(result.current).toBe('initial'); // Still old value

  jest.advanceTimersByTime(500);
  expect(result.current).toBe('updated'); // Now updated

  jest.useRealTimers();
});
```

3. **Documentation and Discoverability**
```javascript
// ✅ GOOD: Self-documenting API
/**
 * Tracks element visibility using Intersection Observer
 * @param {RefObject} ref - Element ref to observe
 * @param {Object} options - Intersection Observer options
 * @returns {boolean} isVisible - Whether element is in viewport
 */
function useIntersectionObserver(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
}
```

**Extraction Costs:**

1. **Indirection and Complexity**
```javascript
// ❌ OVER-EXTRACTION: Simple logic doesn't need a hook
function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  const toggle = () => setValue(v => !v);

  return { value, setTrue, setFalse, toggle };
}

// Better: Just use useState directly
function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      Toggle Modal
    </button>
  );
}
```

2. **Performance Overhead**
```javascript
// ❌ UNNECESSARY: Adds re-render overhead
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  // These callbacks cause re-renders on every count change
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);

  return { count, increment, decrement, reset };
}

// ✅ BETTER: Simpler for one-off usage
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}
```

3. **Dependency Management Complexity**
```javascript
// ❌ TRICKY: Hard to track dependencies
function useComplexEffect(callback, data) {
  useEffect(() => {
    // Callback might have its own dependencies
    callback(data);
  }, [callback, data]); // callback changes every render if not memoized
}

// ✅ BETTER: Inline for transparency
function Component({ data }) {
  useEffect(() => {
    // Clear what dependencies are
    processData(data);
  }, [data]);
}
```

#### When to Extract: Real-World Guidelines

**Extract When:**

1. **Logic is used in 3+ components**
```javascript
// ✅ Extract: Used everywhere
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    setLoading(false);
    return unsubscribe;
  }, []);

  return { user, loading };
}

// Used in 30+ components
function Dashboard() {
  const { user, loading } = useAuth();
  // ...
}
```

2. **Complex state orchestration**
```javascript
// ✅ Extract: Complex state machine
function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldName, value) => {
    // Complex validation logic
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    // Handle change with validation
  }, [validate]);

  const handleBlur = useCallback((e) => {
    // Mark as touched
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    // Validation + submission
  }, [values, validate]);

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit };
}
```

3. **External system integration**
```javascript
// ✅ Extract: Encapsulates browser API
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

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
```

**Keep Inline When:**

1. **One-off component logic**
```javascript
// ✅ Inline: Only used here
function ImageGallery() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setSelectedIndex(i => i + 1);
      if (e.key === 'ArrowLeft') setSelectedIndex(i => i - 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Component-specific rendering
}
```

2. **Simple derived state**
```javascript
// ✅ Inline: No need for useMemo hook
function ShoppingCart({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <div>Total: ${total}</div>;
}
```

#### Performance Considerations

Custom hooks can impact performance:

```javascript
// ❌ PERFORMANCE ISSUE: Re-renders all consumers on any state change
function useGlobalState() {
  const [state, setState] = useState({
    user: null,
    theme: 'light',
    notifications: [],
    settings: {}
  });

  return { state, setState };
}

// ✅ BETTER: Split into focused hooks
function useUser() {
  const [user, setUser] = useState(null);
  return { user, setUser };
}

function useTheme() {
  const [theme, setTheme] = useState('light');
  return { theme, setTheme };
}

// Components only re-render when their data changes
function Header() {
  const { user } = useUser(); // Only re-renders on user change
  const { theme } = useTheme(); // Only re-renders on theme change
}
```

The decision to extract should prioritize maintainability and team productivity over premature abstraction. Start inline, extract when patterns emerge.

---

### 💬 Explain to Junior: Understanding Custom Hooks

**Simple Analogy:**

Think of custom hooks like creating your own power tools in a workshop. React gives you basic tools (useState, useEffect), but sometimes you need to combine them to create specialized tools for specific jobs.

Imagine you're a carpenter. React gives you a hammer (`useState`) and a screwdriver (`useEffect`). But if you're building lots of birdhouses, you might create a "birdhouse kit" that combines multiple tools and materials in one package. That's what a custom hook is - a reusable combination of React's basic hooks tailored for a specific purpose.

**Real-World Comparison:**

**Regular Function** (doesn't use hooks):
```javascript
// Like a recipe that doesn't use the kitchen
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Custom Hook** (uses hooks):
```javascript
// Like a recipe that uses the kitchen equipment (state, effects)
function useShoppingCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price, 0);
    setTotal(newTotal);
  }, [items]);

  const addItem = (item) => setItems([...items, item]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  return { items, total, addItem, removeItem };
}
```

**Why Use Custom Hooks?**

1. **Don't Repeat Yourself**: Instead of copying the same `useEffect` code across 10 components, write it once in a custom hook.

2. **Cleaner Components**: Your component focuses on what to display, while the hook handles how to get the data.

3. **Easier Testing**: Test the hook's logic separately from the component's UI.

**Step-by-Step Example: Building useFetch**

Let's build a custom hook from scratch:

```javascript
// Step 1: Start with what you need - fetch data
function useFetch(url) {
  // We need to store the data somewhere
  const [data, setData] = useState(null);

  return data;
}

// Step 2: Add the fetching logic
function useFetch(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch when component mounts
    fetch(url)
      .then(response => response.json())
      .then(data => setData(data));
  }, [url]); // Re-fetch if URL changes

  return data;
}

// Step 3: Add loading state (users want to know it's loading)
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Start loading

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false); // Done loading
      });
  }, [url]);

  return { data, loading };
}

// Step 4: Add error handling (things can go wrong)
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null); // Clear previous errors

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Step 5: Add cleanup (prevent memory leaks)
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false; // Flag to track if component unmounted

    setLoading(true);
    setError(null);

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(data => {
        if (!cancelled) { // Only update if still mounted
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true; // Component unmounted, cancel updates
    };
  }, [url]);

  return { data, loading, error };
}
```

**Using the Hook:**

```javascript
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Common Interview Questions:**

**Q: "Why does a custom hook need to start with 'use'?"**

**Answer Template:**
"The 'use' prefix is a React convention that serves two purposes. First, it signals to developers that this function follows the Rules of Hooks (only call at top level, only in React functions). Second, it enables React's ESLint plugin to automatically check for hook rule violations. Without the 'use' prefix, the linter can't validate the code properly, and subtle bugs can slip through."

**Q: "When would you create a custom hook?"**

**Answer Template:**
"I create a custom hook when I notice the same stateful logic being repeated across multiple components. For example, if three components all fetch user data with loading and error states, I'd extract that into a `useUser` hook. The key indicator is: if removing this logic would require duplicating it elsewhere, it's probably worth extracting. However, I avoid over-abstracting - if logic is only used once, I keep it inline."

**Q: "How do you test custom hooks?"**

**Answer Template:**
"I use React Testing Library's `renderHook` utility to test hooks in isolation. For example, to test a `useCounter` hook, I'd render it in a test environment, verify the initial state, then use `act()` to trigger state updates and assert the new values. For async hooks like `useFetch`, I'd use `waitFor` or `waitForNextUpdate` to wait for async operations to complete. This approach tests the hook's logic without needing a full component."

**Q: "Can custom hooks call other custom hooks?"**

**Answer Template:**
"Yes, absolutely. This is called hook composition and it's very powerful. For example, a `useAuthenticatedFetch` hook might call both `useAuth` (to get the auth token) and `useFetch` (to make the request). The only rule is that all hook calls must happen at the top level of the custom hook, in the same order every time, just like in components."

**Visual Mental Model:**

```
Component
  ├─ useState (primitive hook)
  ├─ useEffect (primitive hook)
  └─ useCustomHook (custom hook)
       ├─ useState (primitive hook inside custom hook)
       ├─ useEffect (primitive hook inside custom hook)
       └─ useAnotherCustomHook (custom hook inside custom hook)
            ├─ useState
            └─ useEffect
```

Each custom hook is just a wrapper around React's primitive hooks, creating layers of abstraction that make code more maintainable and reusable.

---

## Question 2: What are common custom hook patterns and implementations?

**Answer:**

Common custom hook patterns solve recurring problems in React applications. These patterns have emerged as best practices through widespread use in production applications. Understanding these patterns helps developers write cleaner, more maintainable React code.

**useFetch/useAsync**: Handles asynchronous data fetching with loading, error, and success states. This pattern abstracts the common sequence of setting loading state, making a request, handling errors, and updating with data. Essential for any app that communicates with APIs.

**useDebounce**: Delays updating a value until a specified time has passed without changes. Critical for search inputs where you want to wait for the user to stop typing before making API requests. Prevents excessive API calls and improves performance.

**useLocalStorage**: Synchronizes state with browser local storage, persisting data across sessions. Useful for user preferences, shopping carts, or any data that should survive page refreshes. Handles JSON serialization, parse errors, and storage quota exceeded errors.

**useIntersectionObserver**: Detects when an element enters or leaves the viewport. Powers infinite scroll, lazy loading images, analytics tracking, and animations triggered by scrolling. Wraps the Intersection Observer API in a React-friendly interface.

**useMediaQuery**: Responds to CSS media query changes, enabling responsive behavior in JavaScript. Useful for conditional rendering based on screen size, showing different components for mobile vs desktop, or adjusting behavior based on user preferences (prefers-color-scheme, prefers-reduced-motion).

**usePrevious**: Tracks the previous value of a prop or state, enabling comparison between renders. Helpful for detecting changes, implementing "if value changed, do X" logic, or creating animations based on value transitions.

**useInterval/useTimeout**: Manages timers with automatic cleanup. Prevents memory leaks from forgotten clearInterval/clearTimeout calls and handles the complexities of timers in React's lifecycle.

**useOnClickOutside**: Detects clicks outside a component, essential for closing dropdowns, modals, or popovers when clicking elsewhere on the page.

These patterns represent architectural solutions to common problems. Learning them accelerates development and prevents reinventing the wheel for solved problems.

---

### 🔍 Deep Dive: Comprehensive Custom Hook Pattern Library

Understanding custom hook patterns at a deep level requires examining their implementation details, edge cases, and integration with React's internal mechanisms.

#### Pattern 1: useFetch/useAsync - Robust Data Fetching

The `useFetch` pattern has evolved significantly since hooks were introduced. A production-ready implementation handles many edge cases:

```javascript
function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true
  });

  // Memoize options to prevent infinite loops if object is passed inline
  const memoizedOptions = useMemo(() => options, [
    JSON.stringify(options)
  ]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController(); // Modern fetch cancellation

    setState({ data: null, error: null, loading: true });

    async function fetchData() {
      try {
        const response = await fetch(url, {
          ...memoizedOptions,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          setState({ data: null, error, loading: false });
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
      controller.abort(); // Cancel in-flight request
    };
  }, [url, memoizedOptions]);

  // Refetch function for manual refreshes
  const refetch = useCallback(() => {
    setState({ data: null, error: null, loading: true });
  }, []);

  return { ...state, refetch };
}
```

**Advanced Variant with Caching:**

```javascript
const fetchCache = new Map();

function useFetchWithCache(url, options = {}) {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const [state, setState] = useState(() => {
    // Return cached data immediately if available
    const cached = fetchCache.get(cacheKey);
    return cached || { data: null, error: null, loading: true };
  });

  useEffect(() => {
    let cancelled = false;

    // Return early if cache hit
    if (fetchCache.has(cacheKey) && !options.skipCache) {
      return;
    }

    setState({ data: null, error: null, loading: true });

    async function fetchData() {
      try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!cancelled) {
          const newState = { data, error: null, loading: false };
          setState(newState);
          fetchCache.set(cacheKey, newState); // Cache result
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, error, loading: false });
        }
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, [cacheKey, options.skipCache]);

  return state;
}
```

#### Pattern 2: useDebounce - Controlled Delay Updates

Debouncing is crucial for performance when handling rapid user input:

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup - cancel timer if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Search with API calls
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: results } = useFetch(
    `/api/search?q=${debouncedSearchTerm}`,
    { skip: !debouncedSearchTerm }
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {results && <SearchResults items={results} />}
    </div>
  );
}
```

**Enhanced Debounce with Callback:**

```javascript
function useDebounceCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

// Usage: Debounced save
function AutosaveForm() {
  const [formData, setFormData] = useState({ title: '', content: '' });

  const saveToServer = useDebounceCallback((data) => {
    fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, 1000);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    saveToServer(newData); // Debounced - only calls after 1s of no changes
  };

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <textarea
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
      />
    </form>
  );
}
```

#### Pattern 3: useLocalStorage - Persistent State

Synchronizing state with localStorage requires careful error handling:

```javascript
function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue; // SSR compatibility
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Wrapped setValue that persists to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be function (like useState)
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

// Usage: Persistent theme
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div className={`app theme-${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

#### Pattern 4: useIntersectionObserver - Viewport Detection

Wrapping the Intersection Observer API:

```javascript
function useIntersectionObserver(
  elementRef,
  options = { threshold: 0, root: null, rootMargin: '0px' }
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options.threshold, options.root, options.rootMargin]);

  return { isIntersecting, entry };
}

// Usage: Lazy load image
function LazyImage({ src, alt }) {
  const imgRef = useRef();
  const { isIntersecting } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '100px' // Start loading 100px before visible
  });

  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || 'placeholder.jpg'}
      alt={alt}
      className={imageSrc ? 'loaded' : 'loading'}
    />
  );
}
```

#### Pattern 5: useMediaQuery - Responsive Hooks

```javascript
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

// Usage: Responsive component
function ResponsiveNav() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <nav>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
      {prefersDark && <DarkModeIndicator />}
    </nav>
  );
}
```

These patterns form the foundation of most custom hooks in production React applications, combining React's primitives in battle-tested ways.

---

### 🐛 Real-World Scenario: Race Condition in useDebounce Hook

**Context**: Social media analytics dashboard where users search for hashtags to view trending metrics. The `useDebounce` hook was implemented to reduce API calls during search input.

#### The Bug

```javascript
// ❌ BUGGY VERSION
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function HashtagSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { data } = useFetch(`/api/hashtags?q=${debouncedSearch}`);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {data && <HashtagResults data={data} />}
    </div>
  );
}
```

**The Problem**: Users reported seeing incorrect results when typing quickly. Searching for "#react" would sometimes show results for "#rea", "#reac", or other partial terms.

#### Impact Metrics

- **User Reports**: 234 complaints about "wrong search results"
- **Data Accuracy**: Only 73% of searches showed correct results
- **API Calls**: 15,600 unnecessary requests per day (cost $89/day in API fees)
- **User Trust**: 41% drop in feature usage after bug emerged
- **Session Length**: Average session reduced from 8m to 3m

#### Root Cause

Two critical issues:

1. **Race Condition**: Fast typers could trigger multiple debounced values in quick succession. API responses returned out of order, causing stale data to overwrite fresh data.

2. **No Request Cancellation**: Previous API calls weren't cancelled when new searches started, leading to the "latest API call wins" problem.

**Timeline of Bug:**
```
User types: #react
├─ 0ms: User types '#'
├─ 100ms: User types 'r'
├─ 200ms: User types 'e'
├─ 300ms: User types 'a'
├─ 400ms: User types 'c'
├─ 500ms: User types 't'
├─ 1000ms: Debounce for '#' fires → API call A (#)
├─ 1050ms: API call A returns
├─ 1100ms: Debounce for 'r' fires → API call B (#r)
├─ 1200ms: Debounce for 'e' fires → API call C (#re)
├─ 1250ms: API call C returns, displays #re results
├─ 1300ms: Debounce for 'a' fires → API call D (#rea)
├─ 1400ms: Debounce for 'c' fires → API call E (#reac)
├─ 1500ms: Debounce for 't' fires → API call F (#react) ← Correct
├─ 1600ms: API call D returns (#rea), overwrites F ← BUG!
└─ User sees wrong results for #rea instead of #react
```

#### Debugging Process

**Step 1: Add Request Tracking (10 minutes)**

```javascript
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true });

  useEffect(() => {
    console.log('[useFetch] Starting request:', url);
    const startTime = Date.now();

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const duration = Date.now() - startTime;
        console.log('[useFetch] Received response:', url, `${duration}ms`);
        setState({ data, loading: false });
      });
  }, [url]);

  return state;
}
```

Console output revealed the problem:
```
[useFetch] Starting request: /api/hashtags?q=#rea
[useFetch] Starting request: /api/hashtags?q=#reac
[useFetch] Starting request: /api/hashtags?q=#react
[useFetch] Received response: /api/hashtags?q=#react 150ms
[useFetch] Received response: /api/hashtags?q=#rea 380ms ← LATE!
```

**Step 2: Network Tab Analysis (5 minutes)**

Chrome DevTools Network tab showed:
- 6 concurrent requests for different search terms
- Response times varied: 150ms to 450ms
- Requests returned out of order 40% of the time

#### The Fix: Request Cancellation + Debounce Coordination

```javascript
// ✅ FIXED VERSION with AbortController
function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetch(url, {
      ...options,
      signal: controller.signal
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setState({ data, loading: false, error: null });
      })
      .catch(error => {
        // Ignore abort errors (expected when cancelling)
        if (error.name === 'AbortError') {
          console.log('[useFetch] Request cancelled:', url);
          return;
        }
        setState({ data: null, loading: false, error });
      });

    return () => {
      console.log('[useFetch] Aborting request:', url);
      controller.abort();
    };
  }, [url]);

  return state;
}

// ✅ Improved useDebounce with immediate cancel option
function useDebounce(value, delay, options = {}) {
  const { leading = false } = options; // Option for immediate first call
  const [debouncedValue, setDebouncedValue] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Leading edge: fire immediately on first call
    if (leading && isFirstRender.current) {
      setDebouncedValue(value);
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, leading]);

  return debouncedValue;
}

// ✅ Combined solution
function HashtagSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500, { leading: false });

  // useFetch now cancels previous requests automatically
  const { data, loading, error } = useFetch(
    debouncedSearch ? `/api/hashtags?q=${debouncedSearch}` : null
  );

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search hashtags..."
      />
      {loading && <Spinner />}
      {error && <Error message={error.message} />}
      {data && <HashtagResults data={data} />}
    </div>
  );
}
```

#### Alternative Solution: Request ID Tracking

For APIs that don't support AbortController:

```javascript
// ✅ Request ID pattern (for legacy APIs)
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true });
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!url) return;

    const requestId = ++requestIdRef.current;
    setState({ data: null, loading: true });

    fetch(url)
      .then(r => r.json())
      .then(data => {
        // Only update if this is still the latest request
        if (requestId === requestIdRef.current) {
          setState({ data, loading: false });
        } else {
          console.log('[useFetch] Ignoring stale response:', url);
        }
      });
  }, [url]);

  return state;
}
```

#### Post-Fix Metrics

**Immediate Improvements (Day 1):**
- Search accuracy: 73% → 99.8%
- User complaints: 234 → 3
- Unnecessary API calls: -87% (15,600 → 2,000 per day)
- API cost savings: $89/day → $12/day ($77/day saved)

**Week 1 Results:**
- Feature usage: +68% recovery
- Session length: 3m → 7.5m (back to baseline)
- User satisfaction: 4.8/5 stars (up from 2.3/5)
- Zero race condition reports

#### Key Lessons

1. **Always cancel in-flight requests**: Use AbortController for modern APIs
2. **Test with realistic network delays**: Localhost doesn't reveal race conditions
3. **Log request/response timing**: Helps identify out-of-order responses
4. **Implement request ID tracking**: Fallback for legacy APIs
5. **Combine debounce with cancellation**: Neither alone is sufficient
6. **Test rapid input changes**: Automation can't catch what slow typing hides

This bug is extremely common in production React apps and understanding the fix is crucial for any developer working with async data.

---

### ⚖️ Trade-offs: Hook Pattern Selection and Design Decisions

Choosing the right custom hook pattern involves balancing complexity, reusability, performance, and maintainability.

#### useFetch vs. React Query/SWR

**When to use custom useFetch:**

```javascript
// ✅ Simple, one-off data fetching
function SimpleComponent() {
  const { data } = useFetch('/api/user');
  return <div>{data?.name}</div>;
}
```

**Pros:**
- Zero dependencies (no library needed)
- Full control over implementation
- Minimal bundle size (~50 lines of code)
- Easy to customize for specific needs

**Cons:**
- No automatic caching across components
- No background refetching/revalidation
- No optimistic updates
- Manual cache invalidation
- No request deduplication

**When to use React Query/SWR:**

```javascript
// ✅ Complex data requirements
import { useQuery } from '@tanstack/react-query';

function ComplexComponent() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 5000,
    refetchOnWindowFocus: true
  });

  return <div>{data?.name}</div>;
}
```

**Pros:**
- Automatic caching and cache sharing
- Background refetching
- Request deduplication (multiple components fetching same data)
- Optimistic updates
- Pagination/infinite scroll support
- DevTools for debugging

**Cons:**
- Additional dependency (~40KB for React Query)
- Learning curve for complex features
- More configuration needed
- Potential over-engineering for simple apps

**Decision Matrix:**

| Requirement | Custom useFetch | React Query/SWR |
|-------------|-----------------|-----------------|
| **Simple GET requests** | ✅ Perfect fit | ❌ Overkill |
| **Shared data across components** | ❌ Manual setup | ✅ Automatic |
| **Real-time updates** | ⚠️ Manual WebSocket | ✅ Built-in |
| **Pagination** | ❌ Build from scratch | ✅ Built-in |
| **Offline support** | ❌ Complex to add | ✅ Available |
| **Bundle size concern** | ✅ Minimal | ❌ Adds 40KB+ |
| **Learning curve** | ✅ Low | ⚠️ Medium |

#### useDebounce vs. useThrottle

**useDebounce**: Delays execution until activity stops

```javascript
// User must STOP typing for 500ms before search fires
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Use cases:**
- Search inputs (wait for user to finish typing)
- Autosave (wait for user to stop editing)
- Form validation (validate after user pauses)
- API calls that depend on complete input

**useThrottle**: Limits execution frequency

```javascript
// Fires at MOST once every 500ms, even if input continues
const throttledScroll = useThrottle(scrollPosition, 500);
```

**Use cases:**
- Scroll events (update UI max once per 500ms)
- Window resize (recalculate layout periodically)
- Mouse move tracking
- Real-time analytics (batch events)

**Comparison:**

```javascript
// User types: "react"
// Timeline: r(0ms) e(100ms) a(200ms) c(300ms) t(400ms)

// DEBOUNCE (500ms):
// └─ Fires at 900ms (500ms after last keypress 't')
//    Result: 1 API call for "react"

// THROTTLE (500ms):
// ├─ Fires at 0ms for "r"
// ├─ Fires at 500ms for "c" (was "c" at that moment)
// └─ Result: 2 API calls
```

**Trade-offs:**

| Aspect | Debounce | Throttle |
|--------|----------|----------|
| **API Calls** | Fewer (wait for pause) | More frequent |
| **Responsiveness** | Slower (waits for quiet) | Faster (periodic updates) |
| **Use for Search** | ✅ Better (complete terms) | ❌ Partial results |
| **Use for Scroll** | ❌ Jerky (waits for stop) | ✅ Smooth (periodic) |
| **Resource Usage** | Lower (fewer calls) | Higher (regular calls) |

#### useLocalStorage vs. useState

**When useLocalStorage adds value:**

```javascript
// ✅ Data should persist across sessions
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  // User's preference saved forever
}
```

**When plain useState is better:**

```javascript
// ✅ Temporary UI state that shouldn't persist
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  // Modal should close on page refresh
}
```

**Trade-offs:**

**useLocalStorage Pros:**
- Persistence across sessions
- Sync across tabs (via storage event)
- User preferences remembered

**useLocalStorage Cons:**
- Serialization overhead (JSON.stringify/parse)
- Storage quota limits (5-10MB)
- Slower than memory (disk I/O)
- Privacy considerations (data persists)
- SSR complications (no `window` on server)

**Performance Impact:**

```javascript
// Benchmark: 10,000 state updates
// useState: ~15ms
// useLocalStorage: ~890ms (60x slower due to JSON + disk writes)
```

**Best Practice:**

```javascript
// ✅ Debounce localStorage writes for frequently changing data
function useLocalStorageDebounced(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const debouncedValue = useDebounce(value, 1000);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(debouncedValue));
  }, [debouncedValue, key]);

  return [value, setValue];
}
```

#### Return Value Patterns: Object vs. Array

**Array Pattern (like useState):**

```javascript
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);

  return [count, increment]; // Array
}

// Usage: Can rename easily
const [userCount, incrementUsers] = useCounter(0);
const [postCount, incrementPosts] = useCounter(0);
```

**Object Pattern (like useQuery):**

```javascript
function useFetch(url) {
  // ...
  return { data, loading, error, refetch }; // Object
}

// Usage: Clear names, can destructure selectively
const { data, loading } = useFetch('/api/data');
const { data: userData } = useFetch('/api/user');
```

**Trade-offs:**

| Aspect | Array Return | Object Return |
|--------|--------------|---------------|
| **Renaming** | ✅ Easy | ⚠️ Manual (`data: userData`) |
| **Order matters** | ❌ Yes | ✅ No |
| **Partial usage** | ⚠️ Must include all | ✅ Destructure what you need |
| **Discoverability** | ❌ IDE can't help | ✅ IDE autocomplete |
| **Extending** | ❌ Breaks existing code | ✅ Add new fields safely |

**Guidelines:**
- Use **array** for 2-3 related values (counter, toggle)
- Use **object** for 4+ values or complex APIs
- Use **array** when values are always used together
- Use **object** when values are often used selectively

Understanding these trade-offs enables making informed decisions about custom hook design based on specific application requirements.

---

### 💬 Explain to Junior: Common Custom Hook Patterns

**Simple Analogy:**

Think of custom hook patterns like cooking recipes. Just as professional chefs have go-to recipes for common dishes (pasta, stir-fry, soup), React developers have go-to patterns for common problems (fetching data, debouncing input, storing preferences).

You don't reinvent pasta sauce every time - you use a proven recipe. Similarly, you don't rewrite data fetching logic for every component - you use `useFetch`.

**Pattern Library Mental Model:**

Imagine a toolbox:
- **useFetch**: Your main tool for getting data from the internet
- **useDebounce**: A timer that waits for the user to stop acting before doing something
- **useLocalStorage**: A memory that survives even when you close the browser
- **useIntersectionObserver**: A watchdog that tells you when something scrolls into view

**Pattern 1: useFetch - The Data Getter**

```javascript
// What it does: Gets data from a URL and tracks loading/error states
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage: Just pass a URL, get data back
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <h1>Hello, {user.name}!</h1>;
}
```

**Why it's useful**: Every app fetches data. This hook handles all the repetitive loading/error logic so you don't copy-paste it everywhere.

**Pattern 2: useDebounce - The Patient Waiter**

```javascript
// What it does: Waits for the user to stop changing a value before updating
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If value changes again, cancel timer and start over
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Search without hammering the API
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500); // Wait 500ms

  // Only fetch when user stops typing for 500ms
  const { data } = useFetch(`/api/search?q=${debouncedTerm}`);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
      />
      {data && <SearchResults results={data} />}
    </div>
  );
}
```

**Real-world analogy**: Imagine you're cooking and your friend keeps changing their mind about ingredients. Instead of adding each ingredient immediately, you wait until they stop talking for 5 seconds. That's debouncing!

**Why it's useful**: Without debouncing, typing "react" would make 5 API calls (r, re, rea, reac, react). With debouncing, it makes 1 call after the user finishes typing.

**Pattern 3: useLocalStorage - The Memory Keeper**

```javascript
// What it does: Saves data in the browser so it survives page refreshes
function useLocalStorage(key, initialValue) {
  // Read from localStorage on first render
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage: Remember user preferences
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <div className={`app-${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

**Why it's useful**: When you refresh the page, regular `useState` forgets everything. `useLocalStorage` remembers user preferences, shopping carts, etc.

**Pattern 4: useIntersectionObserver - The Scroll Watcher**

```javascript
// What it does: Tells you when an element scrolls into view
function useIntersectionObserver(ref) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

// Usage: Lazy load images
function LazyImage({ src }) {
  const imgRef = useRef();
  const isVisible = useIntersectionObserver(imgRef);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : 'placeholder.jpg'}
      alt="Lazy loaded"
    />
  );
}
```

**Real-world analogy**: Like a security camera that only records when someone enters the frame. The image only loads when you scroll near it.

**Why it's useful**: Don't load 100 images at once - only load what the user can see. Saves bandwidth and improves performance.

**Combining Patterns:**

```javascript
// Real app: Search with debounce + fetch + local storage
function SmartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useLocalStorage('searches', []);

  const debouncedTerm = useDebounce(searchTerm, 500);
  const { data, loading } = useFetch(`/api/search?q=${debouncedTerm}`);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Save to recent searches
    setRecentSearches([term, ...recentSearches.slice(0, 4)]);
  };

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {recentSearches.length > 0 && (
        <div>
          <h3>Recent Searches:</h3>
          {recentSearches.map(term => (
            <button key={term} onClick={() => handleSearch(term)}>
              {term}
            </button>
          ))}
        </div>
      )}

      {loading && <Spinner />}
      {data && <Results data={data} />}
    </div>
  );
}
```

**Interview Questions:**

**Q: "What's the difference between useDebounce and useThrottle?"**

**Answer Template:**
"useDebounce waits for the user to STOP acting before executing, while useThrottle executes at regular intervals regardless of activity. For search, use debounce because you want the complete search term. For scroll events, use throttle because you want periodic updates while scrolling continues. Think of debounce as 'wait for quiet' and throttle as 'update every X seconds maximum'."

**Q: "When would you use useLocalStorage instead of useState?"**

**Answer Template:**
"Use useLocalStorage when data should persist across page refreshes - things like user preferences, theme settings, or shopping cart items. Use regular useState for temporary UI state like modal visibility or form inputs that should reset on refresh. LocalStorage is slower than memory, so avoid it for data that changes rapidly like scroll position."

**Q: "How would you implement useFetch with cancellation?"**

**Answer Template:**
"I'd use AbortController to cancel in-flight requests when the component unmounts or the URL changes. Create a controller in useEffect, pass its signal to fetch, and call controller.abort() in the cleanup function. This prevents race conditions where an old request returns after a new one, potentially showing stale data. It's critical for search features where URLs change rapidly."

**Visual Pattern Reference:**

```
useFetch Pattern:
Component renders → useEffect fires → fetch() → loading = true
                 → response arrives → data = response, loading = false
                 → component re-renders with data

useDebounce Pattern:
User types 'r' → timer starts (500ms)
User types 'e' → cancel old timer, start new (500ms)
User types 'a' → cancel old timer, start new (500ms)
User stops     → timer completes → value updates

useLocalStorage Pattern:
Component renders → read localStorage → initialize state
State changes    → write to localStorage → persist
Page refresh     → read localStorage → state restored
```

These patterns are the building blocks of professional React applications. Master these, and you'll recognize them everywhere in production code.
