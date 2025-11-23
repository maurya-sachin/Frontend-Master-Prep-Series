# React Hooks - useState and useEffect

> Master useState and useEffect hooks

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

## 🔍 Deep Dive: useState Internal Implementation

### How useState Works Under the Hood

React implements `useState` using a **hook state array** stored in the Fiber node. Each component instance maintains a linked list of hooks, and useState entries are stored sequentially in this list.

**Internal Data Structure:**
```javascript
// Simplified React internals
let currentFiber = null;
let hookIndex = 0;

function useState(initialState) {
  const fiber = currentFiber;
  const hooks = fiber.memoizedState || [];
  const hook = hooks[hookIndex];

  // First render: initialize
  if (!hook) {
    const initialValue = typeof initialState === 'function'
      ? initialState()
      : initialState;

    hooks[hookIndex] = {
      state: initialValue,
      queue: [] // Pending updates
    };
  }

  const currentHook = hooks[hookIndex];

  // Process queued updates
  currentHook.queue.forEach(update => {
    currentHook.state = typeof update === 'function'
      ? update(currentHook.state)
      : update;
  });
  currentHook.queue = [];

  const setState = (update) => {
    currentHook.queue.push(update);
    scheduleRerender(fiber); // Trigger reconciliation
  };

  hookIndex++;
  return [currentHook.state, setState];
}
```

**Key Implementation Details:**

1. **Hook Index Tracking**
   - React uses the call order to track hooks
   - Each useState call increments an internal index
   - This is why hooks must be called in the same order every render
   - Breaking this rule corrupts the hook state array

2. **State Storage in Fiber Nodes**
   ```javascript
   // Fiber node structure (simplified)
   const fiber = {
     type: ComponentFunction,
     memoizedState: [ // Hook state array
       { state: 0, queue: [] },        // First useState
       { state: '', queue: [] },       // Second useState
       { state: false, queue: [] }     // Third useState
     ],
     alternate: previousFiber, // For comparison during reconciliation
     updateQueue: null
   };
   ```

3. **Batching and Update Queue**
   - setState doesn't update immediately
   - Updates are queued in the hook's update queue
   - React flushes the queue during the render phase
   - In React 18+, automatic batching applies to all updates

4. **Double Buffering (Work-in-Progress)**
   ```javascript
   // React maintains two fiber trees
   const current = {
     memoizedState: [{ state: 0 }] // Current rendered state
   };

   const workInProgress = {
     memoizedState: [{ state: 1 }] // Next state being computed
   };

   // After commit: workInProgress becomes current
   ```

### Performance Characteristics

**Time Complexity:**
- `useState` initialization: **O(1)**
- `setState` call: **O(1)** (just queues the update)
- Applying updates during render: **O(n)** where n = number of queued updates
- Re-render triggered: **O(tree depth)** for reconciliation

**Memory Impact:**
```javascript
// Each useState hook consumes:
// - Hook object: ~48 bytes
// - State value: depends on data type
// - Update queue: ~16 bytes (empty array)
// - Closure references: varies

// Example component memory footprint
function Dashboard() {
  const [user, setUser] = useState({}); // ~48 bytes + object size
  const [data, setData] = useState([]); // ~48 bytes + array size
  const [loading, setLoading] = useState(false); // ~48 bytes + 1 byte
  // Total hook overhead: ~144 bytes + data size
}
```

### Lazy Initialization Deep Dive

React's lazy initialization optimization prevents expensive computations on every render:

```javascript
// ❌ BAD: Runs on EVERY render (expensive!)
function DataGrid() {
  const [data, setData] = useState(processHugeDataset(rawData));
  // processHugeDataset runs every time DataGrid renders!
}

// ✅ GOOD: Runs ONLY on first render
function DataGrid() {
  const [data, setData] = useState(() => processHugeDataset(rawData));
  // Function only called once during mount
}

// Benchmark results:
// Without lazy init: 150ms per render × 10 renders = 1,500ms
// With lazy init: 150ms × 1 render = 150ms (10x improvement!)
```

**Internal Implementation:**
```javascript
function mountState(initialState) {
  const hook = mountWorkInProgressHook();

  // Check if initializer is a function
  if (typeof initialState === 'function') {
    initialState = initialState(); // Call once, store result
  }

  hook.memoizedState = hook.baseState = initialState;
  // ... queue setup
  return [hook.memoizedState, dispatch];
}

function updateState(initialState) {
  // initialState argument is IGNORED on updates!
  // Only the stored memoizedState matters
  return updateReducer(basicStateReducer);
}
```

### Batching Mechanism in React 18+

React 18 introduced **automatic batching** for all updates:

```javascript
// React 17: Only batches in event handlers
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched: single re-render
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // NOT batched: two re-renders
}, 1000);

// React 18: Batches everywhere
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched: single re-render!
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // Batched: single re-render!
});
```

**Internal Batching Implementation:**
```javascript
// React 18 uses createRoot with concurrent features
let isBatchingUpdates = false;
const updateQueue = [];

function scheduleUpdate(fiber, update) {
  updateQueue.push({ fiber, update });

  if (!isBatchingUpdates) {
    isBatchingUpdates = true;
    queueMicrotask(() => {
      flushUpdates(); // Process all queued updates
      isBatchingUpdates = false;
    });
  }
}
```

### Reference Equality and Bail-out Optimization

React optimizes re-renders when state hasn't changed:

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  console.log('Render!');

  // Clicking this button WON'T trigger re-render!
  return <button onClick={() => setCount(0)}>
    Count: {count}
  </button>;
}

// Internal check (simplified)
function updateState(update) {
  const newState = typeof update === 'function'
    ? update(currentState)
    : update;

  if (Object.is(newState, currentState)) {
    return; // Bail out - no re-render!
  }

  scheduleRerender();
}
```

**Benchmark: Bail-out Performance**
```javascript
// Test: 1000 setState calls with same value
// With bail-out: 1 render, ~0.5ms
// Without bail-out: 1000 renders, ~5000ms

// ❌ Object/Array: Always new reference (no bail-out)
setUser({ name: 'John' }); // New object every time
setItems([1, 2, 3]); // New array every time

// ✅ Primitive: Uses Object.is comparison (bail-out works)
setCount(0); // If already 0, no re-render
setFlag(true); // If already true, no re-render
```

### Functional Updates and Closure Traps

Understanding closures is critical for correct useState usage:

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ STALE CLOSURE: count is always 0!
      setCount(count + 1);
      console.log(count); // Always 0!
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty deps: count captured from first render

  // After 5 seconds: count is 1 (not 5!)
}

// ✅ SOLUTION: Functional update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // Always gets latest!
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // After 5 seconds: count is 5 ✅
}
```

**Why Functional Updates Work:**
```javascript
// Internal implementation (simplified)
function setState(update) {
  const pendingUpdate = {
    update,
    next: null
  };

  // Enqueue update
  hook.queue.push(pendingUpdate);

  // During render phase
  function processUpdateQueue() {
    let newState = hook.baseState;

    hook.queue.forEach(({ update }) => {
      // Function gets CURRENT state, not closure state!
      newState = typeof update === 'function'
        ? update(newState) // newState is up-to-date!
        : update;
    });

    return newState;
  }
}
```

---

## 🐛 Real-World Scenario: Race Condition in Search Component

### Problem: Stale setState Causing Incorrect Results

**Scenario:** E-commerce product search with auto-complete

**Symptoms:**
- Search results don't match input field
- Old search results briefly flash before correct ones
- Metrics: 23% of search queries showed wrong results for 200-500ms
- User complaints: 847 tickets in 2 weeks
- Conversion rate dropped 12% on mobile

**The Buggy Code:**
```javascript
// ❌ BUGGY: Race condition with stale closures
function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchTerm) => {
    setLoading(true);

    const data = await fetch(`/api/search?q=${searchTerm}`).then(r => r.json());

    // BUG: If user typed fast, query might have changed!
    // Example timeline:
    // t0: User types "lap" → fetch starts (500ms)
    // t1: User types "laptop" → fetch starts (300ms)
    // t2: "laptop" fetch completes → setResults([...])
    // t3: "lap" fetch completes → setResults([...]) ← WRONG!
    setResults(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {loading && <Spinner />}
      {results.map(product => <ProductCard key={product.id} {...product} />)}
    </div>
  );
}
```

**Error Reproduction:**
```
Timeline of race condition:
┌─────────────────────────────────────────────────────────┐
│ t0: User types "la"                                     │
│     → API call 1 starts (RTT: 450ms)                    │
├─────────────────────────────────────────────────────────┤
│ t1 (50ms): User types "lap"                             │
│     → API call 2 starts (RTT: 380ms)                    │
├─────────────────────────────────────────────────────────┤
│ t2 (80ms): User types "lapt"                            │
│     → API call 3 starts (RTT: 320ms)                    │
├─────────────────────────────────────────────────────────┤
│ t3 (100ms): User types "laptop"                         │
│     → API call 4 starts (RTT: 280ms)                    │
├─────────────────────────────────────────────────────────┤
│ t4 (380ms): Call 4 completes                            │
│     → setResults([laptop results]) ✅                   │
├─────────────────────────────────────────────────────────┤
│ t5 (400ms): Call 3 completes                            │
│     → setResults([lapt results]) ❌ WRONG!              │
├─────────────────────────────────────────────────────────┤
│ t6 (430ms): Call 2 completes                            │
│     → setResults([lap results]) ❌ WRONG!               │
├─────────────────────────────────────────────────────────┤
│ t7 (450ms): Call 1 completes                            │
│     → setResults([la results]) ❌ WRONG!                │
└─────────────────────────────────────────────────────────┘
Final state: Shows "la" results but input says "laptop"!
```

### Debugging Process

**Step 1: Add Request Logging**
```javascript
const handleSearch = async (searchTerm) => {
  const requestId = Date.now();
  console.log(`[${requestId}] Search started: "${searchTerm}"`);

  setLoading(true);
  const data = await fetch(`/api/search?q=${searchTerm}`).then(r => r.json());

  console.log(`[${requestId}] Search completed: "${searchTerm}"`, data.length, 'results');
  setResults(data);
  setLoading(false);
};

// Console output revealed the problem:
// [1234] Search started: "la"
// [1235] Search started: "lap"
// [1236] Search started: "lapt"
// [1237] Search started: "laptop"
// [1237] Search completed: "laptop" 45 results ✅
// [1236] Search completed: "lapt" 38 results ❌
// [1235] Search completed: "lap" 52 results ❌
// [1234] Search completed: "la" 120 results ❌
```

**Step 2: Track Active Queries**
```javascript
// Revealed that 4-6 requests were in-flight simultaneously
// with 23% completing out-of-order
```

**Step 3: Chrome DevTools Network Tab**
```
Performance analysis:
- Average search API: 280-450ms
- User typing speed: 50-120ms between keystrokes
- Race condition probability: 23% (slower network = higher)
- Mobile 3G probability: 67%!
```

### Solution 1: AbortController (Recommended)

```javascript
// ✅ SOLUTION: Cancel previous requests
function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const handleSearch = async (searchTerm) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      const data = await fetch(`/api/search?q=${searchTerm}`, {
        signal: controller.signal
      }).then(r => r.json());

      // Only update if not aborted
      setResults(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return; // Don't update state
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (/* ... same UI ... */);
}

// Performance improvement:
// - Race conditions: 23% → 0%
// - Wasted API calls: -78%
// - User complaints: -100%
// - Conversion recovery: +11%
```

### Solution 2: Request ID Validation

```javascript
// ✅ ALTERNATIVE: Ignore stale responses
function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const requestIdRef = useRef(0);

  const handleSearch = async (searchTerm) => {
    // Increment request ID
    const currentRequestId = ++requestIdRef.current;

    const data = await fetch(`/api/search?q=${searchTerm}`).then(r => r.json());

    // Only update if this is still the latest request
    if (currentRequestId === requestIdRef.current) {
      setResults(data);
    } else {
      console.log(`Ignoring stale response for "${searchTerm}"`);
    }
  };

  // ... rest of component
}

// Pros: Simpler than AbortController, works in older browsers
// Cons: Doesn't cancel requests (wastes bandwidth)
```

### Solution 3: Debouncing (Combined Approach)

```javascript
// ✅ BEST: Debounce + AbortController
import { useDebouncedCallback } from 'use-debounce';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const abortControllerRef = useRef(null);

  const handleSearch = async (searchTerm) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await fetch(`/api/search?q=${searchTerm}`, {
        signal: controller.signal
      }).then(r => r.json());

      setResults(data);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  };

  // Debounce: wait 300ms after user stops typing
  const debouncedSearch = useDebouncedCallback(handleSearch, 300);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value); // Update input immediately
    debouncedSearch(value); // Search after 300ms pause
  };

  return (/* ... */);
}

// Performance metrics (before → after):
// - API requests: 100% → 15% (85% reduction!)
// - Race conditions: 23% → 0%
// - Average response time: 350ms → 280ms (less server load)
// - Bandwidth saved: ~78%
// - Server costs: -$1,200/month
```

### Monitoring Solution

```javascript
// Add production monitoring
function ProductSearch() {
  const metrics = useRef({
    searches: 0,
    cancelled: 0,
    errors: 0,
    avgLatency: 0
  });

  const handleSearch = async (searchTerm) => {
    const startTime = performance.now();
    metrics.current.searches++;

    // ... abort logic ...

    try {
      const data = await fetch(/* ... */);

      const latency = performance.now() - startTime;
      metrics.current.avgLatency =
        (metrics.current.avgLatency + latency) / 2;

      // Report to analytics
      analytics.track('search_completed', {
        query: searchTerm,
        results: data.length,
        latency
      });

      setResults(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        metrics.current.cancelled++;
      } else {
        metrics.current.errors++;
        analytics.track('search_error', { error: error.message });
      }
    }
  };

  // ... rest of component
}

// Dashboard metrics after fix:
// ┌────────────────────────────────────────┐
// │ Search Health Metrics                  │
// ├────────────────────────────────────────┤
// │ Total searches: 45,230                 │
// │ Cancelled (debounced): 38,445 (85%)    │
// │ Completed: 6,785                       │
// │ Errors: 12 (0.2%)                      │
// │ Avg latency: 285ms                     │
// │ Race conditions: 0 🎉                  │
// └────────────────────────────────────────┘
```

### Key Learnings

1. **Always consider race conditions** in async operations
2. **AbortController** is essential for cancellable fetches
3. **Debouncing** reduces unnecessary API calls
4. **Request IDs** provide a simple stale-check mechanism
5. **Monitoring** catches production issues early
6. **Combined approaches** (debounce + abort) work best

---

## ⚖️ Trade-offs: When to Use useState vs Alternatives

### Decision Matrix: State Management Strategies

| Criteria | useState | useReducer | Context | External Store (Zustand/Redux) |
|----------|----------|------------|---------|--------------------------------|
| **Component-local state** | ✅ Perfect | ⚠️ Overkill | ❌ Wrong tool | ❌ Wrong tool |
| **Simple boolean/string** | ✅ Best | ❌ Verbose | ❌ Overkill | ❌ Overkill |
| **Complex state logic** | ⚠️ Gets messy | ✅ Excellent | ⚠️ Maybe | ✅ Good |
| **State shared 2-3 levels** | ⚠️ Prop drilling | ⚠️ Prop drilling | ✅ Perfect | ⚠️ Overkill |
| **Global app state** | ❌ Wrong tool | ❌ Wrong tool | ⚠️ Performance issues | ✅ Best |
| **Frequent updates** | ✅ Fast | ✅ Fast | ❌ Slow (re-renders) | ✅ Fast |
| **Developer experience** | ✅ Simple | ⚠️ More code | ⚠️ Boilerplate | ⚠️ Setup required |
| **Bundle size impact** | ✅ 0 bytes | ✅ 0 bytes | ✅ 0 bytes | ⚠️ 3-50KB |
| **Time travel debugging** | ❌ No | ⚠️ Manual | ❌ No | ✅ Yes (Redux DevTools) |
| **Persistence** | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual | ✅ Built-in (middleware) |

### Trade-off 1: useState vs useReducer

**When to use useState:**
```javascript
// ✅ PERFECT: Independent simple state
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Simple, clear, easy to understand
}

// ✅ GOOD: Single complex state with spread updates
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: null
  });

  const updateField = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };
}
```

**When to switch to useReducer:**
```javascript
// ❌ MESSY: Multiple related state variables
function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
    setTotal(prev => prev + item.price); // Easy to forget!
    setTax(prev => (prev + item.price) * 0.1); // Out of sync risk!
  };

  // 4 setState calls = 4 potential bugs!
}

// ✅ BETTER: useReducer keeps state consistent
function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    discount: 0,
    tax: 0
  });

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', item });
    // Reducer calculates total, tax automatically!
  };
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      const newItems = [...state.items, action.item];
      const newTotal = newItems.reduce((sum, i) => sum + i.price, 0);
      return {
        items: newItems,
        total: newTotal,
        discount: state.discount,
        tax: newTotal * 0.1 // Always in sync!
      };
    default:
      return state;
  }
}
```

**Performance Comparison:**
```javascript
// Benchmark: 1000 state updates
// useState (multiple): 23ms, 1000 re-renders
// useReducer (batched logic): 18ms, 1000 re-renders
// Difference: ~20% faster for complex updates

// Memory footprint:
// useState: 48 bytes × 4 = 192 bytes
// useReducer: 96 bytes (single reducer)
// Savings: ~50% memory
```

**Rule of Thumb:**
- **1-2 related values** → useState
- **3-4 related values** → useState (maybe useReducer)
- **5+ related values OR complex logic** → useReducer
- **State transitions need validation** → useReducer

### Trade-off 2: Local State vs Lifted State

**Performance Impact of Lifting State:**
```javascript
// ❌ ANTI-PATTERN: Lifting everything to top
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);

  // Every state change re-renders ENTIRE app!
  return (
    <Layout>
      <Sidebar /> {/* Re-renders unnecessarily */}
      <Content
        modalOpen={modalOpen}
        tooltipText={tooltipText}
        hoveredItem={hoveredItem}
      />
    </Layout>
  );
}

// Performance: 45ms render time per state change

// ✅ BETTER: Keep state local
function App() {
  return (
    <Layout>
      <Sidebar />
      <Content /> {/* Manages own modal/tooltip state */}
    </Layout>
  );
}

function Content() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState('');

  // Only Content re-renders!
  return (/* ... */);
}

// Performance: 8ms render time (5.6× faster!)
```

**When to Lift State:**

| Scenario | Keep Local | Lift Up |
|----------|-----------|---------|
| Modal open/close | ✅ If modal is inside component | ✅ If modal is at root level |
| Form input values | ✅ Until submission | ❌ Unless multi-step form |
| Hover/focus state | ✅ Always | ❌ Never |
| Filter/sort options | ⚠️ Depends on sharing | ✅ If affects multiple lists |
| User authentication | ❌ Never local | ✅ Always global |
| Theme preference | ❌ Never local | ✅ Always global |

### Trade-off 3: Multiple useState vs Single Object

**Multiple useState (Recommended for Most Cases):**
```javascript
// ✅ PROS: Fine-grained updates, clear intent
function UserSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  // Only affected component re-renders
  const handleNameChange = (e) => setName(e.target.value);
}

// Performance: Changing name doesn't re-render email field
```

**Single Object useState:**
```javascript
// ⚠️ CONS: Spread complexity, easy mistakes
function UserSettings() {
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    theme: 'light',
    notifications: true
  });

  // ❌ Common mistake: losing properties
  const handleNameChange = (e) => {
    setSettings({ name: e.target.value }); // Oops! Lost email, theme, notifications
  };

  // ✅ Correct but verbose
  const handleEmailChange = (e) => {
    setSettings(prev => ({ ...prev, email: e.target.value }));
  };
}

// Performance: Changing name re-renders ALL fields (wasteful)
```

**Benchmark Results:**
```
Test: Update one field 1000 times in form with 10 fields

Multiple useState:
- Renders: 1,000 (only changed field)
- Time: 145ms
- Memory allocations: 1,000 primitives

Single object useState:
- Renders: 1,000 (entire object)
- Time: 380ms (2.6× slower!)
- Memory allocations: 1,000 objects (10 properties each)
```

**Exception: When Single Object is Better**
```javascript
// ✅ GOOD: When you always update multiple fields together
function AddressForm() {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleSubmit = () => {
    // Updating all fields together → single object makes sense
    setAddress({
      street: validatedStreet,
      city: validatedCity,
      state: validatedState,
      zip: validatedZip
    });
  };
}
```

### Trade-off 4: Derived State vs Stored State

**Anti-pattern: Storing Derived State**
```javascript
// ❌ BAD: Duplicate state (sync issues!)
function ProductList({ products }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // Bug-prone: easy to forget updating filteredProducts
    const sorted = [...products].sort(/* ... */);
    setFilteredProducts(sorted);
  }, [products, sortOrder]);

  // What if products changes but effect hasn't run yet?
  // filteredProducts is stale!
}

// ✅ GOOD: Compute on render
function ProductList({ products }) {
  const [sortOrder, setSortOrder] = useState('asc');

  // Always in sync, no useEffect needed!
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );
  }, [products, sortOrder]);

  return sortedProducts.map(/* ... */);
}
```

**Performance:**
```
Benchmark: 1000 products, 100 sort operations

Stored derived state (useEffect):
- Time: 850ms
- Re-renders: 200 (double renders due to effect)
- Memory: 2× array storage

Computed with useMemo:
- Time: 420ms (2× faster!)
- Re-renders: 100
- Memory: 1× array storage
```

**Rule:** Never store what you can compute!

### Trade-off 5: useState vs URL State (React Router)

**When to Use URL State:**
```javascript
// ✅ PERFECT: Filters, pagination, search queries
import { useSearchParams } from 'react-router-dom';

function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat, page: '1' });
  };

  // ✅ BENEFITS:
  // - Shareable URLs: /products?category=laptops&page=2
  // - Browser back/forward works!
  // - Bookmarkable state
  // - Deep linking
}

// ❌ WRONG: Modal state, hover state, form inputs
function BadExample() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modalOpen = searchParams.get('modal') === 'true';

  // Problems:
  // - URL becomes cluttered: /?modal=true&tooltip=show&hover=item-5
  // - Browser history polluted
  // - Can't share URL (transient UI state)
}
```

**Decision Guide:**
- **URL State:** Filters, sort, pagination, search, selected item ID
- **Local State:** Modals, tooltips, hover, focus, loading indicators

---

## 💬 Explain to Junior: useState Like a Sticky Note System

### The Sticky Note Analogy

Imagine React components as workers at a desk, and `useState` is like having a sticky note pad:

**Without useState (Regular Variables):**
```javascript
function BadCounter() {
  let count = 0; // Regular variable

  const increment = () => {
    count = count + 1;
    console.log(count); // Shows 1, 2, 3...
  };

  return <button onClick={increment}>Count: {count}</button>;
  // Always shows 0! Why?
}
```

Think of it like this: Every time React "looks at" the component (renders it), it's like the worker getting a fresh desk. The sticky note with `count = 0` gets replaced with a brand new one that also says 0. The console.log works because it happens during the click (before the desk resets), but the UI always sees the fresh desk with `count = 0`.

**With useState (Persistent Sticky Notes):**
```javascript
function GoodCounter() {
  const [count, setCount] = useState(0); // Magic sticky note!

  const increment = () => {
    setCount(count + 1);
  };

  return <button onClick={increment}>Count: {count}</button>;
  // Shows 0, then 1, then 2... ✅
}
```

With `useState`, React puts the sticky note in a special drawer that doesn't get cleared when the desk resets. When you call `setCount`, you're telling React: "Update the sticky note in the drawer AND give me a fresh desk to see the new value."

### Why Two Things? `[count, setCount]`

Think of it like a vending machine:
- `count` is the **display window** (you can look but not touch)
- `setCount` is the **button** (the only way to change what's inside)

```javascript
const [count, setCount] = useState(0);

// ❌ Can't do this:
count = 5; // Error! Display window is read-only

// ✅ Must use the button:
setCount(5); // This tells React to update AND refresh
```

**Why this design?** Because React needs to know when to update the UI. If you could change `count` directly, React wouldn't know the value changed!

### Interview Answer Template

**Question:** "Explain useState to me."

**Template Answer:**
```
"useState is a React Hook that lets functional components have state—
data that persists between re-renders and triggers UI updates when changed.

It returns an array with two elements:
1. The current state value
2. A function to update that value

For example: `const [count, setCount] = useState(0);`

When you call setCount, React:
1. Updates the state value
2. Schedules a re-render
3. Re-runs the component with the new value

The key difference from regular variables is persistence—useState values
survive re-renders, while regular variables reset to their initial value
every render.

I use useState for component-local state like form inputs, toggle states,
or any data that changes over time and affects what the user sees."
```

### Common "Why?" Questions from Juniors

**Q: "Why does count not update immediately after setCount?"**
```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(5);
    console.log(count); // Still 0! Why?
  };

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**A:** Think of setCount like ordering food at a restaurant:
1. You call setCount(5) → "I'd like a burger please!"
2. React says "OK, I'll make it and bring it to your table"
3. Your console.log runs → "But I'm hungry NOW!" (still sees old count)
4. React re-renders → "Here's your burger!" (count is now 5)

**The state update isn't instant—it's scheduled.** React batches updates for performance.

**Q: "When should I use functional updates?"**

**A:** Use `setCount(prev => prev + 1)` when:

1. **The new value depends on the old value:**
```javascript
// ❌ Can be buggy:
setCount(count + 1);

// ✅ Always safe:
setCount(prev => prev + 1);
```

2. **Inside useEffect, setTimeout, or closures:**
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // ❌ count is stale!
    setCount(prev => prev + 1); // ✅ Always correct!
  }, 1000);
}, []);
```

**Analogy:** It's like saying "Give me one more than whatever you currently have" vs "Give me one more than what I saw 5 minutes ago."

**Q: "Why can't I use setState outside components?"**

**A:** useState is like a vending machine at your office—you can only use it if you're at the office (inside a component). React tracks useState calls using the component's "location" (Fiber node).

```javascript
// ❌ Doesn't work:
const [count, setCount] = useState(0);

function Counter() {
  return <div>{count}</div>;
}

// ✅ Works:
function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### Common Beginner Mistakes

**Mistake 1: Mutating State Directly**
```javascript
// ❌ WRONG:
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Mutating!
setItems(items); // React thinks nothing changed!

// ✅ RIGHT:
setItems(prev => [...prev, 4]); // New array!
```

**Why?** React compares old and new state using `Object.is()`. If it's the same array reference, React thinks nothing changed and skips the re-render!

**Mistake 2: Calling setCount Multiple Times**
```javascript
const [count, setCount] = useState(0);

const addThree = () => {
  setCount(count + 1); // count is 0, queues update to 1
  setCount(count + 1); // count is still 0, queues update to 1
  setCount(count + 1); // count is still 0, queues update to 1
  // Result: count becomes 1 (not 3!)
};

// ✅ FIX:
const addThree = () => {
  setCount(prev => prev + 1); // prev is 0, queues update to 1
  setCount(prev => prev + 1); // prev is 1, queues update to 2
  setCount(prev => prev + 1); // prev is 2, queues update to 3
  // Result: count becomes 3 ✅
};
```

**Mistake 3: Too Many useState Calls**
```javascript
// ❌ MESSY:
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  // 8 useState calls! Hard to manage!
}

// ✅ BETTER:
function Form() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
}
```

### Mental Model: The React State Ledger

Think of React's state system like a bank:
- **useState** opens an account (creates state)
- **State value** is your balance (current amount)
- **setState** is a deposit slip (request to update)
- **Re-render** is when the bank processes transactions (updates UI)

```javascript
function BankAccount() {
  const [balance, setBalance] = useState(100);

  const deposit = (amount) => {
    // Fill out deposit slip
    setBalance(prev => prev + amount);

    // Don't check balance immediately!
    // console.log(balance); // Still old balance

    // Wait for bank to process (re-render)
    // Then balance updates!
  };
}
```

Just like banks batch transactions for efficiency, React batches state updates!

### Practice Exercises for Juniors

**Exercise 1: Build a Toggle**
```javascript
// TODO: Implement a light switch toggle
function LightSwitch() {
  // Your code here

  return <button>Turn On</button>;
}

// Expected: Clicking toggles between "Turn On" / "Turn Off"
```

**Exercise 2: Counter with Limits**
```javascript
// TODO: Implement a counter that can't go below 0 or above 10
function LimitedCounter() {
  // Your code here
}
```

**Exercise 3: Form Input**
```javascript
// TODO: Create a controlled input that shows character count
function CharacterCounter() {
  // Your code here

  return (
    <div>
      <input />
      <p>Characters: ??/100</p>
    </div>
  );
}
```

**Solutions in follow-up section or documentation**

---

## Question 2: How does useEffect work and when should you use it?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the useEffect hook in React. What are its use cases? How do dependencies work? What are common pitfalls and how do you handle cleanup?

### Answer

`useEffect` is a Hook that lets you perform side effects in functional components. It combines the functionality of `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` from class components.

1. **Basic Syntax**
   - Runs after render (by default)
   - Can return cleanup function
   - Accepts dependency array

2. **Dependency Array**
   - Empty array `[]`: runs once on mount
   - No array: runs on every render
   - With dependencies: runs when dependencies change

3. **Common Use Cases**
   - Data fetching
   - Subscriptions (WebSocket, event listeners)
   - DOM manipulation
   - Timers
   - Analytics tracking

4. **Cleanup Function**
   - Return function from useEffect
   - Runs before next effect and on unmount
   - Essential for preventing memory leaks

### Code Example

```javascript
import { useState, useEffect } from 'react';

// 1. BASIC USAGE: Run once on mount
function WelcomeMessage() {
  useEffect(() => {
    console.log('Component mounted!');
  }, []); // Empty array = run once

  return <h1>Welcome!</h1>;
}

// 2. RUN ON EVERY RENDER (usually a mistake!)
function EveryRender() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Rendered!'); // Runs after EVERY render
  }); // No dependency array!

  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}

// 3. RUN WHEN DEPENDENCIES CHANGE
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Fetching user:', userId);

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Re-run when userId changes

  return <div>Hello, {user?.name}</div>;
}

// 4. CLEANUP FUNCTION
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Cleanup: runs on unmount
    return () => {
      console.log('Cleaning up timer');
      clearInterval(interval);
    };
  }, []);

  return <div>Seconds: {seconds}</div>;
}

// 5. EVENT LISTENERS
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup: remove listener on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div>Mouse: {position.x}, {position.y}</div>;
}

// 6. WEBSOCKET SUBSCRIPTION
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/${roomId}`);

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    // Cleanup: close WebSocket
    return () => {
      ws.close();
    };
  }, [roomId]); // Re-connect when roomId changes

  return (
    <ul>
      {messages.map((msg, i) => <li key={i}>{msg}</li>)}
    </ul>
  );
}

// 7. DOCUMENT TITLE UPDATE
function PageTitle({ title }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    // Cleanup: restore previous title
    return () => {
      document.title = prevTitle;
    };
  }, [title]);

  return <h1>{title}</h1>;
}

// 8. MULTIPLE EFFECTS (separate concerns)
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // Effect 1: Fetch user
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  // Effect 2: Fetch posts (separate concern!)
  useEffect(() => {
    fetch(`/api/posts?userId=${userId}`)
      .then(res => res.json())
      .then(setPosts);
  }, [userId]);

  // Better than combining into one effect!
}

// 9. LOCAL STORAGE SYNC
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDark);
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

// 10. ASYNC/AWAIT IN USEEFFECT
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        // Only update state if still mounted
        if (isMounted) {
          setUser(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup: mark as unmounted
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>User: {user.name}</div>;
}
```

### Common Mistakes

❌ **Mistake 1:** Missing dependencies
```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, []); // ❌ Missing 'query' dependency!

  // Bug: results never update when query changes!
}

// ✅ Correct:
useEffect(() => {
  fetch(`/api/search?q=${query}`)
    .then(res => res.json())
    .then(setResults);
}, [query]); // Include all dependencies
```

❌ **Mistake 2:** Not cleaning up timers/listeners
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Tick');
  }, 1000);

  // ❌ No cleanup! Memory leak!
}, []);

// ✅ Correct:
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Tick');
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

❌ **Mistake 3:** Infinite loops
```javascript
function InfiniteLoop() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // ❌ Sets state...
  }, [count]); // ...which triggers effect... which sets state... INFINITE LOOP!

  // ✅ Solution: Remove count from dependencies OR use functional update
  useEffect(() => {
    setCount(c => c + 1); // Only runs once
  }, []);
}
```

✅ **Best Practices:**
- Always include all dependencies (use ESLint plugin)
- Clean up subscriptions and timers
- Use separate effects for separate concerns
- Avoid setting state in effects that depend on that state

### Follow-up Questions

- "What's the difference between useEffect and useLayoutEffect?"
- "How do you handle race conditions in useEffect?"
- "When should you use AbortController with useEffect?"
- "Can you explain the cleanup function lifecycle?"
- "How does React 18 Strict Mode affect useEffect?"

### Resources

- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)

---

## 🔍 Deep Dive: useEffect Internal Implementation

### How useEffect Works Under the Hood

React implements `useEffect` as part of the **Fiber reconciliation** process. Effects are stored in a linked list attached to the Fiber node and executed in specific phases of the render cycle.

**Effect Data Structure:**
```javascript
// Simplified React internals
type Effect = {
  tag: number;          // EffectTag (HasEffect, Passive, Layout, etc.)
  create: () => void;   // The effect function you provide
  destroy: (() => void) | null; // Cleanup function (if returned)
  deps: Array<any> | null;      // Dependency array
  next: Effect | null;  // Next effect in linked list
};

type Fiber = {
  // ... other fiber properties
  memoizedState: Hook | null;  // First hook in linked list
  updateQueue: Effect | null;  // Effect list
  flags: number;               // Fiber flags (Passive, Update, etc.)
};
```

**useEffect Implementation (Simplified):**
```javascript
let currentlyRenderingFiber = null;
let workInProgressHook = null;

function mountEffect(create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;

  currentlyRenderingFiber.flags |= PassiveEffect; // Mark fiber as having effects

  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive, // Tags
    create,                       // Effect function
    undefined,                    // Cleanup (initially undefined)
    nextDeps                      // Dependencies
  );
}

function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (hook.memoizedState !== null) {
    const prevEffect = hook.memoizedState;
    destroy = prevEffect.destroy; // Previous cleanup function

    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;

      // Compare dependencies using Object.is
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // Dependencies haven't changed - don't run effect
        hook.memoizedState = pushEffect(HookPassive, create, destroy, nextDeps);
        return;
      }
    }
  }

  // Dependencies changed - schedule effect
  currentlyRenderingFiber.flags |= PassiveEffect;
  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive,
    create,
    destroy,
    nextDeps
  );
}

function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null
  };

  // Add to effect list (circular linked list)
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;

  if (componentUpdateQueue === null) {
    componentUpdateQueue = createEffectList();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    const firstEffect = lastEffect.next;
    lastEffect.next = effect;
    effect.next = firstEffect;
    componentUpdateQueue.lastEffect = effect;
  }

  return effect;
}

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

### Effect Execution Timeline

**React's render cycle has specific phases where effects run:**

```javascript
// MOUNT PHASE
// ┌──────────────────────────────────────────────────────────┐
// │ 1. Render Phase (reconciliation)                         │
// │    - Component function executes                         │
// │    - useEffect calls are collected                       │
// │    - Dependencies are stored                             │
// │    - Effects are NOT executed yet                        │
// ├──────────────────────────────────────────────────────────┤
// │ 2. Commit Phase (DOM updates)                            │
// │    - React updates the DOM                               │
// │    - Layout effects run (useLayoutEffect)                │
// ├──────────────────────────────────────────────────────────┤
// │ 3. Post-Paint Phase (AFTER browser paints)               │
// │    - useEffect effects run asynchronously                │
// │    - Browser has already painted                         │
// │    - Non-blocking                                        │
// └──────────────────────────────────────────────────────────┘

// UPDATE PHASE
// ┌──────────────────────────────────────────────────────────┐
// │ 1. Render Phase                                          │
// │    - Component re-renders                                │
// │    - Dependencies are compared                           │
// │    - Effects are scheduled if deps changed               │
// ├──────────────────────────────────────────────────────────┤
// │ 2. Commit Phase                                          │
// │    - Cleanup functions run for changed effects           │
// │    - DOM updates                                         │
// │    - Layout effects run                                  │
// ├──────────────────────────────────────────────────────────┤
// │ 3. Post-Paint Phase                                      │
// │    - New useEffect effects run                           │
// └──────────────────────────────────────────────────────────┘

// UNMOUNT PHASE
// ┌──────────────────────────────────────────────────────────┐
// │ 1. Render Phase (parent re-renders without this child)  │
// ├──────────────────────────────────────────────────────────┤
// │ 2. Commit Phase                                          │
// │    - All cleanup functions run                           │
// │    - Component removed from DOM                          │
// └──────────────────────────────────────────────────────────┘
```

**Detailed Timeline Example:**
```javascript
function TimerComponent() {
  const [count, setCount] = useState(0);

  console.log('1. Render phase');

  useEffect(() => {
    console.log('3. Effect runs (after paint)');

    return () => {
      console.log('4. Cleanup runs (before next effect or unmount)');
    };
  }, [count]);

  console.log('2. Still in render phase');

  return <div>{count}</div>;
}

// Console output on mount:
// 1. Render phase
// 2. Still in render phase
// [DOM painted to screen]
// 3. Effect runs (after paint)

// Console output when count changes:
// 1. Render phase
// 2. Still in render phase
// [DOM painted to screen]
// 4. Cleanup runs (before next effect or unmount)
// 3. Effect runs (after paint)

// Console output on unmount:
// 4. Cleanup runs (before next effect or unmount)
```

### Dependency Comparison Algorithm

React uses `Object.is()` for dependency comparison, which has specific behavior:

```javascript
// React's dependency comparison
function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue; // Same value
    }
    return false; // Different value - re-run effect
  }
  return true; // All dependencies are the same
}

// Object.is() behavior (different from ===)
Object.is(0, -0);           // false (=== returns true)
Object.is(NaN, NaN);        // true (=== returns false)
Object.is(5, 5);            // true
Object.is('foo', 'foo');    // true
Object.is({}, {});          // false (different references)
Object.is([], []);          // false (different references)
Object.is(null, null);      // true
Object.is(undefined, undefined); // true

// Common pitfall: Object/Array dependencies
function Component({ user }) {
  useEffect(() => {
    console.log('User changed');
  }, [user]); // ❌ If user is a new object every render, this runs every time!

  // Even if user has same properties: { name: 'John', age: 30 }
  // Each render creates NEW object reference → effect always runs
}

// Example of problematic parent:
function Parent() {
  return <Component user={{ name: 'John', age: 30 }} />; // ❌ New object every render!
}

// ✅ Solutions:
// 1. Memoize the object
const user = useMemo(() => ({ name: 'John', age: 30 }), []);
return <Component user={user} />;

// 2. Depend on specific properties
useEffect(() => {
  console.log('User changed');
}, [user.name, user.age]); // ✅ Compare primitives, not object reference

// 3. Use deep comparison (use-deep-compare-effect library)
import { useDeepCompareEffect } from 'use-deep-compare-effect';
useDeepCompareEffect(() => {
  console.log('User changed');
}, [user]); // Compares object contents, not reference
```

### Effect Cleanup Mechanics

**When Cleanup Runs:**
```javascript
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    console.log(`Connected to room ${roomId}`);

    return () => {
      connection.disconnect();
      console.log(`Disconnected from room ${roomId}`);
    };
  }, [roomId]);

  return <h1>Welcome to {roomId}</h1>;
}

// Timeline when roomId changes from "general" to "react":
// 1. User action changes roomId to "react"
// 2. Component re-renders with roomId="react"
// 3. React commits changes to DOM
// 4. DOM painted: "Welcome to react"
// 5. Cleanup runs: "Disconnected from room general" ← OLD effect cleanup
// 6. New effect runs: "Connected to room react" ← NEW effect
```

**Internal Cleanup Implementation:**
```javascript
function commitHookEffectListUnmount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // Unmount: call destroy function
        const destroy = effect.destroy;
        effect.destroy = undefined;

        if (destroy !== undefined) {
          try {
            destroy(); // Run cleanup function
          } catch (error) {
            captureCommitPhaseError(finishedWork, error);
          }
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

function commitHookEffectListMount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // Mount: call create function
        const create = effect.create;

        try {
          const destroy = create(); // Run effect, get cleanup function
          effect.destroy = typeof destroy === 'function' ? destroy : undefined;
        } catch (error) {
          captureCommitPhaseError(finishedWork, error);
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

### Performance Characteristics

**Time Complexity:**
- **Dependency comparison**: O(n) where n = number of dependencies
- **Effect scheduling**: O(1) - just adds to linked list
- **Effect execution**: O(m) where m = number of effects in component

**Memory Usage:**
```javascript
// Each useEffect hook consumes:
// - Hook object: ~72 bytes
// - Effect object: ~96 bytes
// - Dependency array: ~48 bytes + (8 bytes × num deps)
// - Closure (create function): varies based on captured variables
// - Cleanup function: ~48 bytes (if provided)

// Example component memory footprint:
function DataFetcher({ userId, sortBy, filters }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/data?user=${userId}&sort=${sortBy}`)
      .then(res => res.json())
      .then(setData);

    return () => {
      // Cleanup function
    };
  }, [userId, sortBy]); // 2 dependencies

  // Memory breakdown:
  // - Hook object: 72 bytes
  // - Effect object: 96 bytes
  // - Deps array: 48 + 16 = 64 bytes
  // - Closure captures: userId, sortBy, setData (~24 bytes)
  // - Cleanup: 48 bytes
  // Total: ~304 bytes per useEffect
}
```

**Benchmark: Effect Execution Cost**
```javascript
// Test: Component with 10 useEffect hooks, re-rendering 1000 times
// Only 1 effect's deps change each render

// Scenario A: All effects have dependencies that change
// - Time: ~850ms
// - 10,000 effect executions (10 × 1000)

// Scenario B: Only 1 effect's deps change per render
// - Time: ~95ms (9× faster!)
// - 1,000 effect executions (1 × 1000)

// Conclusion: React efficiently skips effects with unchanged dependencies
```

### React 18 Changes: Stricter Behavior

React 18 introduced **Strict Mode double-invocation** for effects:

```javascript
// React 18 Strict Mode behavior (development only)
function Component() {
  useEffect(() => {
    console.log('Effect runs');

    return () => {
      console.log('Cleanup runs');
    };
  }, []);

  // In development with Strict Mode:
  // 1. Component mounts
  // 2. Effect runs → "Effect runs"
  // 3. React unmounts component (simulated)
  // 4. Cleanup runs → "Cleanup runs"
  // 5. React re-mounts component
  // 6. Effect runs again → "Effect runs"

  // Production: Effect runs only once (normal behavior)
}

// WHY? To catch bugs where cleanup isn't properly implemented
// Example bug that Strict Mode catches:
function BuggyComponent() {
  useEffect(() => {
    const listener = () => console.log('Event!');
    window.addEventListener('resize', listener);

    // ❌ Forgot cleanup! Memory leak!
  }, []);

  // Strict Mode runs this twice → 2 listeners added → easier to notice bug
}

// ✅ Fixed version:
function FixedComponent() {
  useEffect(() => {
    const listener = () => console.log('Event!');
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener); // Cleanup properly
    };
  }, []);

  // Strict Mode: Adds listener → removes it → adds it again
  // Net result: 1 listener (correct!)
}
```

### Passive vs Layout Effects

React has two types of effects with different timing:

```javascript
// PASSIVE EFFECTS (useEffect) - Post-paint, non-blocking
useEffect(() => {
  // Runs AFTER browser paints
  // Timeline:
  // 1. React renders
  // 2. DOM updated
  // 3. Browser paints screen ← USER SEES THIS
  // 4. useEffect runs ← HAPPENS HERE (async)

  console.log('Passive effect'); // Logged after paint

  // Good for:
  // - Data fetching
  // - Subscriptions
  // - Analytics
  // - Timers
  // - Most side effects
}, []);

// LAYOUT EFFECTS (useLayoutEffect) - Pre-paint, blocking
useLayoutEffect(() => {
  // Runs BEFORE browser paints (synchronous)
  // Timeline:
  // 1. React renders
  // 2. DOM updated
  // 3. useLayoutEffect runs ← HAPPENS HERE (blocking)
  // 4. Browser paints screen

  console.log('Layout effect'); // Logged before paint

  // Good for:
  // - Reading layout (element dimensions)
  // - Synchronous DOM mutations
  // - Preventing visual flicker

  const height = ref.current.offsetHeight;
  ref.current.style.top = `${height}px`; // Position based on measurement
}, []);

// Performance comparison:
// useEffect: Non-blocking, browser can paint while effect runs
// useLayoutEffect: Blocking, delays paint until effect completes

// Benchmark: Component with 1000 child elements
// useEffect: First paint at ~16ms, effect runs at ~20ms
// useLayoutEffect: First paint at ~80ms (includes effect time)

// 99% of the time, use useEffect!
// Only use useLayoutEffect when you MUST measure/mutate DOM before paint
```

---

## 🐛 Real-World Scenario: Memory Leak in Chat Application

### Problem: Event Listeners Not Cleaned Up

**Scenario:** Real-time chat application with WebSocket connections

**Symptoms:**
- Memory usage grows by ~50MB every 5 minutes
- Browser becomes sluggish after 30 minutes
- WebSocket connections accumulate (100+ connections after 1 hour)
- Mobile devices crash after 45 minutes
- Metrics from production:
  - Average session duration: 2.3 hours
  - Memory leak rate: ~600MB/hour
  - User complaints: 234 tickets about "app slowing down"
  - Crash rate on mobile: 18% after 1 hour of usage

**The Buggy Code:**
```javascript
// ❌ BUGGY: Memory leak - no cleanup!
function ChatRoom({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);

    ws.onopen = () => {
      console.log('Connected to room:', roomId);
      ws.send(JSON.stringify({ type: 'join', userId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'users') {
        setOnlineUsers(data.users);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from room:', roomId);
    };

    // ❌ BUG: No cleanup function!
    // When roomId changes, a NEW WebSocket is created
    // but the OLD one is never closed!

  }, [roomId, userId]);

  // Global event listener (also leaking!)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('User switched tabs');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ❌ BUG: Listener never removed!
  }, []);

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div>Online: {onlineUsers.length}</div>
      <MessageList messages={messages} />
    </div>
  );
}
```

**What Happens:**
```javascript
// Timeline of memory leak:
// t0: User enters room "general"
//     → WebSocket 1 created, listener 1 added
//     → Memory: ~5MB

// t1 (30s): User switches to room "react"
//     → WebSocket 2 created, listener 2 added
//     → WebSocket 1 still open! (memory leak)
//     → Memory: ~10MB

// t2 (60s): User switches to room "javascript"
//     → WebSocket 3 created, listener 3 added
//     → WebSocket 1, 2 still open! (leak growing)
//     → Memory: ~15MB

// After 1 hour of room switching (average 120 switches):
//     → 120 WebSocket connections open!
//     → 120 event listeners attached!
//     → Memory: ~600MB
//     → Browser barely responsive
```

### Debugging Process

**Step 1: Memory Profiling (Chrome DevTools)**
```javascript
// 1. Open Chrome DevTools → Memory tab
// 2. Take heap snapshot
// 3. Switch rooms 10 times
// 4. Take another snapshot
// 5. Compare snapshots

// Results showed:
// - WebSocket objects: +10 (should be 1)
// - Event listeners: +10 (should be 1)
// - Closures holding old state: +10
// - Total leak: ~50MB per room switch
```

**Step 2: Network Tab Analysis**
```javascript
// Chrome DevTools → Network → WS (WebSocket filter)

// Observed:
// ┌─────────────────────────────────────────────────┐
// │ Active WebSocket Connections                    │
// ├─────────────────────────────────────────────────┤
// │ wss://chat.example.com/rooms/general      OPEN  │ ← Should be closed!
// │ wss://chat.example.com/rooms/react        OPEN  │ ← Should be closed!
// │ wss://chat.example.com/rooms/javascript   OPEN  │ ← Current room (OK)
// │ wss://chat.example.com/rooms/python       OPEN  │ ← Should be closed!
// │ ... 96 more connections ...                     │
// └─────────────────────────────────────────────────┘
```

**Step 3: Add Logging to Track Lifecycle**
```javascript
useEffect(() => {
  console.log('[MOUNT] Creating WebSocket for room:', roomId);
  const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);

  ws.onopen = () => {
    console.log('[OPEN] Connected to room:', roomId);
  };

  ws.onclose = () => {
    console.log('[CLOSE] Disconnected from room:', roomId);
  };

  // Still no cleanup!
}, [roomId]);

// Console output when switching rooms:
// [MOUNT] Creating WebSocket for room: general
// [OPEN] Connected to room: general
// [MOUNT] Creating WebSocket for room: react ← NEW effect runs
// [OPEN] Connected to room: react
// (Notice: No [CLOSE] for "general"! It's still connected!)
```

**Step 4: Event Listener Monitoring**
```javascript
// Add to console:
getEventListeners(document);

// Output showed:
// {
//   visibilitychange: [
//     { listener: function, useCapture: false },
//     { listener: function, useCapture: false }, ← Duplicate!
//     { listener: function, useCapture: false }, ← Duplicate!
//     { listener: function, useCapture: false }, ← Duplicate!
//     // ... 50 more identical listeners!
//   ]
// }
```

### Solution: Proper Cleanup Functions

```javascript
// ✅ FIXED: Add cleanup to close WebSocket
function ChatRoom({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    console.log('[EFFECT] Setting up WebSocket for room:', roomId);

    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);

    ws.onopen = () => {
      console.log('[OPEN] Connected to room:', roomId);
      ws.send(JSON.stringify({ type: 'join', userId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'users') {
        setOnlineUsers(data.users);
      }
    };

    ws.onerror = (error) => {
      console.error('[ERROR] WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('[CLOSE] Disconnected from room:', roomId);
    };

    // ✅ CLEANUP: Close WebSocket on unmount or when roomId changes
    return () => {
      console.log('[CLEANUP] Closing WebSocket for room:', roomId);

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmounted or roomId changed');
      }
    };
  }, [roomId, userId]);

  // ✅ CLEANUP: Remove event listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('User switched tabs');
      }
    };

    console.log('[EFFECT] Adding visibility listener');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('[CLEANUP] Removing visibility listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div>Online: {onlineUsers.length}</div>
      <MessageList messages={messages} />
    </div>
  );
}

// Console output when switching rooms (AFTER fix):
// [EFFECT] Setting up WebSocket for room: general
// [OPEN] Connected to room: general
// [CLEANUP] Closing WebSocket for room: general ← Cleanup runs!
// [CLOSE] Disconnected from room: general ← WebSocket actually closes!
// [EFFECT] Setting up WebSocket for room: react
// [OPEN] Connected to room: react
// Perfect! Only 1 connection at a time!
```

### Advanced Solution: Reconnection Logic

```javascript
// ✅ PRODUCTION-READY: Handle reconnection with exponential backoff
function ChatRoom({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      setConnectionStatus('connecting');
      ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);

      ws.onopen = () => {
        if (!isMounted) return;

        console.log('Connected to room:', roomId);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset on successful connection

        ws.send(JSON.stringify({ type: 'join', userId, roomId }));
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;

        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.message]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (!isMounted) return;
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        if (!isMounted) return;

        console.log('Disconnected from room:', roomId, 'Code:', event.code);
        setConnectionStatus('disconnected');

        // Only reconnect if:
        // 1. Component is still mounted
        // 2. Wasn't a clean close (code 1000)
        // 3. Haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeout = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus('failed');
        }
      };
    };

    connect();

    // ✅ CLEANUP: Close connection and cancel reconnection
    return () => {
      isMounted = false;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      if (ws) {
        // Remove listeners to prevent memory leaks
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;

        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Component cleanup');
        }
      }
    };
  }, [roomId, userId]);

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <ConnectionStatus status={connectionStatus} />
      <MessageList messages={messages} />
    </div>
  );
}
```

### Performance Metrics (Before → After Fix)

```javascript
// Memory usage over 1-hour session:
// Before: 5MB → 600MB (leak rate: ~10MB/min)
// After: 5MB → 8MB (normal growth from messages)

// WebSocket connections:
// Before: 1 → 120+ (1 per room switch)
// After: Always 1 (properly cleaned up)

// Event listeners:
// Before: Growing linearly (1 per mount)
// After: Always 1 (properly removed)

// Crash rate on mobile:
// Before: 18% after 1 hour
// After: 0.3% (unrelated issues)

// User complaints:
// Before: 234 tickets in 2 weeks
// After: 2 tickets in 2 weeks (both false alarms)

// Performance score (Lighthouse):
// Before: 45/100
// After: 92/100
```

### Monitoring & Prevention

```javascript
// Add production monitoring to detect future leaks
function ChatRoom({ roomId, userId }) {
  const wsRef = useRef(null);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Track connection duration
      analytics.track('websocket_connected', {
        roomId,
        userId,
        timestamp: Date.now()
      });
    };

    ws.onclose = (event) => {
      const duration = Date.now() - mountTimeRef.current;

      // Track cleanup metrics
      analytics.track('websocket_closed', {
        roomId,
        userId,
        duration,
        code: event.code,
        reason: event.reason,
        wasCleanClose: event.wasClean
      });
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Normal cleanup');
      }
    };
  }, [roomId, userId]);

  // Monitor memory usage (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const checkMemory = setInterval(() => {
      if (performance.memory) {
        const usedMB = performance.memory.usedJSHeapSize / 1048576;

        if (usedMB > 500) {
          console.warn('High memory usage detected:', usedMB.toFixed(2), 'MB');
        }
      }
    }, 5000);

    return () => clearInterval(checkMemory);
  }, []);

  return (/* ... */);
}

// Dashboard metrics after fix:
// ┌──────────────────────────────────────────┐
// │ WebSocket Health Metrics                 │
// ├──────────────────────────────────────────┤
// │ Active connections: 1,234                │
// │ Avg connection duration: 18.3 min        │
// │ Clean closes: 98.7%                      │
// │ Reconnections: 1.2%                      │
// │ Memory leak incidents: 0 🎉              │
// │ User complaints: -99.1%                  │
// └──────────────────────────────────────────┘
```

### Key Learnings

1. **Always clean up effects** - WebSockets, event listeners, timers MUST be cleaned up
2. **Use cleanup functions** - Return a function from useEffect to run cleanup
3. **Test with Strict Mode** - React 18 double-invocation catches cleanup bugs early
4. **Monitor memory** - Use Chrome DevTools to catch leaks before production
5. **Track metrics** - Log connection lifecycles to detect issues in production
6. **Handle edge cases** - Reconnection logic must respect component lifecycle

---

## ⚖️ Trade-offs: useEffect Dependency Strategies

### Decision Matrix: Dependency Array Options

| Strategy | Use Case | Pros | Cons | Re-run Frequency |
|----------|----------|------|------|------------------|
| **Empty array `[]`** | Run once on mount | Simple, runs once, like componentDidMount | Can cause stale closures | Once (mount only) |
| **No array** | Run on every render | Always has fresh values | Performance killer, usually a bug | Every render |
| **With dependencies `[a, b]`** | Run when specific values change | Granular control, optimized | Must include ALL deps (ESLint helps) | When deps change |
| **Exhaustive deps** | Complex derived logic | Correct, no stale closures | Can run too often if deps change frequently | Varies |
| **Minimal deps** | Performance optimization | Fewer re-runs | Risk of stale closures, hard to maintain | Infrequent |

### Trade-off 1: Empty Dependencies vs Specific Dependencies

**Empty Array `[]` - Run Once:**
```javascript
// ✅ GOOD: One-time setup that doesn't need updates
function Analytics() {
  useEffect(() => {
    // Initialize analytics SDK
    analytics.init('API_KEY');

    // Set user properties (doesn't change)
    analytics.setUser({ cohort: 'beta' });

    return () => analytics.cleanup();
  }, []); // Correct: this should only run once

  return <div>Tracking enabled</div>;
}

// ❌ BAD: Using [] when you NEED the dependency
function UserGreeting({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, []); // ❌ BUG: Missing userId dependency!

  // Problem: When userId changes, user data doesn't update!
  return <div>Hello, {user?.name}</div>;
}

// ✅ FIXED: Include userId dependency
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(setUser);
}, [userId]); // ✅ Correct: re-fetch when userId changes
```

**When to use `[]`:**
- Global event listeners (window, document)
- One-time SDK initialization
- Analytics page view tracking
- Mounting animations
- Subscriptions that don't depend on props/state

**When NOT to use `[]`:**
- Data fetching based on props
- Effects that use props/state values
- Effects that call functions from props
- Anything that should update when component updates

### Trade-off 2: No Dependencies vs Empty Array

**No Dependency Array - Run Every Render:**
```javascript
// ❌ USUALLY A MISTAKE: Runs on EVERY render
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }); // ❌ No dependency array!

  // Problem: Fetches on EVERY render, including when results change!
  // This creates an infinite loop:
  // 1. Fetch completes → setResults
  // 2. Component re-renders
  // 3. useEffect runs again → fetch
  // 4. Repeat forever!

  return <ResultList results={results} />;
}

// ✅ RARE VALID USE: Intentionally run after every render
function ScrollToBottom() {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom after EVERY render
    // (useful for chat where new messages can come from anywhere)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }); // Intentionally no deps

  return (
    <div>
      <MessageList />
      <div ref={messagesEndRef} />
    </div>
  );
}
```

**Benchmark: Performance Impact**
```javascript
// Test: Component renders 100 times

// With no deps: useEffect runs 100 times
// - Time: ~850ms
// - Wasted renders: 99
// - Network requests: 100 (if fetching)

// With [query]: useEffect runs 3 times (query changes 3 times)
// - Time: ~45ms (19× faster!)
// - Wasted renders: 0
// - Network requests: 3

// With []: useEffect runs 1 time
// - Time: ~15ms (57× faster!)
// - Wasted renders: 0
// - Network requests: 1
```

### Trade-off 3: Object/Array Dependencies vs Primitives

**Problem: Objects/Arrays Create New References Every Render**
```javascript
// ❌ ANTI-PATTERN: Object dependency re-creates every render
function UserProfile() {
  const filters = { age: 25, active: true }; // ❌ New object every render!

  useEffect(() => {
    fetchUsers(filters);
  }, [filters]); // Runs on EVERY render (filters always "new")

  return <ProfileList />;
}

// ✅ SOLUTION 1: Memoize the object
function UserProfile() {
  const filters = useMemo(() => ({ age: 25, active: true }), []); // ✅ Stable reference

  useEffect(() => {
    fetchUsers(filters);
  }, [filters]); // Only runs when filters actually changes

  return <ProfileList />;
}

// ✅ SOLUTION 2: Depend on primitive values
function UserProfile() {
  const age = 25;
  const active = true;

  useEffect(() => {
    fetchUsers({ age, active });
  }, [age, active]); // ✅ Primitives are stable

  return <ProfileList />;
}

// ✅ SOLUTION 3: Move object inside effect
function UserProfile() {
  useEffect(() => {
    const filters = { age: 25, active: true }; // ✅ Created inside effect
    fetchUsers(filters);
  }, []); // No dependencies needed

  return <ProfileList />;
}
```

**Trade-off Analysis:**
| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **useMemo** | Clean separation, reusable object | Extra memory, more code | Object used in multiple places |
| **Primitive deps** | Simple, explicit | Verbose for many properties | 2-3 properties |
| **Move inside effect** | No deps needed, simple | Object not reusable | Object only used in effect |

### Trade-off 4: Function Dependencies

**Problem: Functions Re-created Every Render**
```javascript
// ❌ PROBLEMATIC: Function dependency causes too many effect runs
function ProductList({ category }) {
  const fetchProducts = () => {
    return fetch(`/api/products?category=${category}`).then(r => r.json());
  };

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, [fetchProducts]); // ❌ fetchProducts is new every render!

  // Runs on EVERY render because fetchProducts is a new function each time
}

// ✅ SOLUTION 1: useCallback to memoize function
function ProductList({ category }) {
  const fetchProducts = useCallback(() => {
    return fetch(`/api/products?category=${category}`).then(r => r.json());
  }, [category]); // Only changes when category changes

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, [fetchProducts]); // ✅ Stable reference, only re-runs when category changes

  return <Products />;
}

// ✅ SOLUTION 2: Move function inside effect (preferred if only used there)
function ProductList({ category }) {
  useEffect(() => {
    const fetchProducts = () => {
      return fetch(`/api/products?category=${category}`).then(r => r.json());
    };

    fetchProducts().then(setProducts);
  }, [category]); // ✅ Simpler, no useCallback needed

  return <Products />;
}

// ✅ SOLUTION 3: If function from props, trust it's memoized
function ProductList({ onFetchComplete }) {
  useEffect(() => {
    fetchData().then(onFetchComplete);
  }, [onFetchComplete]); // Assume parent provides stable reference
}
```

**Performance Comparison:**
```javascript
// Benchmark: 1000 renders, category changes 5 times

// Without memoization: useEffect runs 1000 times
// - Time: ~4,200ms
// - API calls: 1000

// With useCallback: useEffect runs 5 times
// - Time: ~28ms (150× faster!)
// - API calls: 5

// Function inside effect: useEffect runs 5 times
// - Time: ~24ms (175× faster!)
// - API calls: 5
// - Less code complexity
```

### Trade-off 5: ESLint Exhaustive Deps vs Manual Deps

**ESLint Rule: `react-hooks/exhaustive-deps`**
```javascript
// ESLint will warn about missing dependencies

// ❌ ESLint warning: Missing dependency 'userId'
useEffect(() => {
  fetchUser(userId);
}, []);

// ✅ Option 1: Add the dependency (usually correct)
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ⚠️ Option 2: Disable ESLint (use sparingly!)
useEffect(() => {
  fetchUser(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// When to disable ESLint:
// 1. You're 100% sure the dependency is stable (rare)
// 2. You only want to run on mount (refactor to be clearer)
// 3. Including dependency causes infinite loop (fix the root cause instead!)
```

**Decision Guide:**
```javascript
// FOLLOW ESLINT unless you have a VERY good reason

// ❌ BAD: Ignoring ESLint without understanding
useEffect(() => {
  setCount(count + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Missing 'count' - this is a BUG!

// ✅ GOOD: Understanding why ESLint warns, using functional update
useEffect(() => {
  setCount(c => c + 1); // ✅ No count dependency needed
}, []); // ESLint happy, no warning

// ⚠️ ACCEPTABLE: Rare case where you know better than ESLint
useEffect(() => {
  // Function is guaranteed stable by external library
  externalLib.init(onEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // OK if onEvent is truly stable (document why!)
```

### Trade-off 6: Single Effect vs Multiple Effects

**Single Large Effect:**
```javascript
// ❌ ANTI-PATTERN: One effect doing too much
function Dashboard({ userId, teamId, projectId }) {
  useEffect(() => {
    // Fetch user
    fetch(`/api/users/${userId}`).then(res => res.json()).then(setUser);

    // Fetch team
    fetch(`/api/teams/${teamId}`).then(res => res.json()).then(setTeam);

    // Fetch projects
    fetch(`/api/projects/${projectId}`).then(res => res.json()).then(setProject);

    // Setup WebSocket
    const ws = new WebSocket(`wss://api.com/${userId}`);
    ws.onmessage = handleMessage;

    // Add event listener
    window.addEventListener('resize', handleResize);

    return () => {
      ws.close();
      window.removeEventListener('resize', handleResize);
    };
  }, [userId, teamId, projectId]);

  // Problems:
  // 1. If only teamId changes, user and project are re-fetched unnecessarily
  // 2. Cleanup runs for ALL resources, even if only one dependency changed
  // 3. Hard to understand what depends on what
  // 4. Difficult to test individual effects
}

// ✅ BETTER: Separate effects by concern
function Dashboard({ userId, teamId, projectId }) {
  // Effect 1: User data
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(res => res.json()).then(setUser);
  }, [userId]); // Only re-runs when userId changes

  // Effect 2: Team data
  useEffect(() => {
    fetch(`/api/teams/${teamId}`).then(res => res.json()).then(setTeam);
  }, [teamId]); // Only re-runs when teamId changes

  // Effect 3: Project data
  useEffect(() => {
    fetch(`/api/projects/${projectId}`).then(res => res.json()).then(setProject);
  }, [projectId]); // Only re-runs when projectId changes

  // Effect 4: WebSocket (depends on userId)
  useEffect(() => {
    const ws = new WebSocket(`wss://api.com/${userId}`);
    ws.onmessage = handleMessage;
    return () => ws.close();
  }, [userId]);

  // Effect 5: Window resize (no dependencies)
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Benefits:
  // ✅ Granular re-runs (only what changed)
  // ✅ Easier to understand
  // ✅ Easier to test
  // ✅ Better performance
}
```

**Performance Comparison:**
```javascript
// Test: teamId changes, userId and projectId stay same

// Single effect:
// - 3 API calls (all re-fetched)
// - WebSocket reconnection (unnecessary)
// - Event listener removed and re-added (unnecessary)
// - Time: ~450ms

// Multiple effects:
// - 1 API call (only team re-fetched)
// - No WebSocket reconnection
// - No listener churn
// - Time: ~95ms (4.7× faster!)
```

**Rule of Thumb:** One effect per concern (data source, subscription, etc.)

---

## 💬 Explain to Junior: useEffect Like Setting Up and Cleaning a Room

### The Room Analogy

Imagine React components are like different rooms in a house, and `useEffect` is like setting up decorations, posters, or electronics in those rooms.

**Without useEffect:**
```javascript
function BedroomWithoutEffect() {
  // Just furniture (JSX) - no electronics, no decorations
  return <div>Bed, Desk, Chair</div>;
}
```

Your bedroom has furniture, but that's it. No computer, no lights, no posters.

**With useEffect:**
```javascript
function BedroomWithEffect() {
  useEffect(() => {
    // Set up: Turn on computer, hang posters, plug in lamp
    console.log('Setting up room!');
    const computer = turnOnComputer();

    // Cleanup: When you move out, turn off computer, take down posters
    return () => {
      console.log('Cleaning up room!');
      computer.turnOff();
    };
  }, []);

  return <div>Bed, Desk, Chair</div>;
}
```

Now when you **move in** (component mounts), you set things up. When you **move out** (component unmounts), you clean up. The cleanup function is like taking your stuff with you when you leave!

### Why Do We Need Cleanup?

**Bad Roommate (No Cleanup):**
```javascript
// ❌ Leaves computer running, wastes electricity!
useEffect(() => {
  turnOnComputer();
  // No cleanup!
}, []);

// After moving out: computer still running, electric bill $$$!
```

**Good Roommate (With Cleanup):**
```javascript
// ✅ Turns off computer before leaving
useEffect(() => {
  const computer = turnOnComputer();

  return () => {
    computer.turnOff(); // Good citizen!
  };
}, []);

// After moving out: room is clean, no wasted resources!
```

### Dependency Array Explained

The dependency array is like a **"redo list"** - things that, if they change, mean you should redo your setup.

**Empty Array `[]` - Set up once when moving in:**
```javascript
useEffect(() => {
  hangPosters(); // Hang posters once, never change them
}, []); // Empty list = "Don't redo this, ever"

// Like putting up permanent wallpaper - you do it once!
```

**With Dependencies `[theme]` - Redo when something changes:**
```javascript
function Bedroom({ theme }) {
  useEffect(() => {
    if (theme === 'dark') {
      paintWalls('black');
    } else {
      paintWalls('white');
    }
  }, [theme]); // "Redo this whenever theme changes"

  // When theme changes: repaint the walls!
  return <div>Bedroom</div>;
}

// If theme changes from 'light' to 'dark':
// 1. Cleanup old paint
// 2. Paint walls black
```

**No Array - Redo constantly (usually a mistake!):**
```javascript
useEffect(() => {
  rearrangeFurniture(); // Every time you blink, rearrange furniture!
}); // No array = "Redo this ALL THE TIME"

// Exhausting! You'd never get anything done!
```

### Interview Answer Template

**Question:** "Explain useEffect to me."

**Template Answer:**
```
"useEffect is a React Hook that lets you perform side effects in functional
components—things like data fetching, subscriptions, or manually changing
the DOM.

It takes two arguments:
1. A function that runs your side effect
2. A dependency array that controls when it runs

For example: `useEffect(() => { fetchData(); }, [userId]);`

The effect runs:
- After the component first renders (mount)
- When dependencies change (update)
- You can return a cleanup function that runs before the next effect or unmount

The dependency array is important:
- Empty array `[]`: run once on mount
- With dependencies `[a, b]`: run when a or b changes
- No array: run after every render (usually a bug)

I use useEffect for things like:
- Fetching data from APIs
- Setting up WebSocket connections
- Adding event listeners
- Timers and intervals
- Updating document title

The cleanup function is critical for preventing memory leaks—you must clean
up subscriptions, timers, and event listeners when the component unmounts."
```

### Common "Why?" Questions from Juniors

**Q: "Why doesn't useEffect run during render?"**

**A:** Imagine you're building with LEGO blocks:
1. **Render phase** = Deciding which blocks to use (planning)
2. **Commit phase** = Actually building the structure (doing)
3. **Effect phase** = Adding stickers, lights, motors (decorating)

You can't add stickers while you're still deciding which blocks to use! You need to finish building first.

```javascript
function Component() {
  console.log('1. Rendering (planning)');

  useEffect(() => {
    console.log('3. Effect running (decorating)');
  });

  console.log('2. Still rendering');

  return <div>Component</div>;
}

// Output:
// 1. Rendering (planning)
// 2. Still rendering
// [React builds the DOM]
// [Browser paints screen]
// 3. Effect running (decorating)
```

**Q: "Why do I need to include dependencies?"**

**A:** Because **closures** capture values at the time they're created.

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count is:', count); // What count?
    }, 1000);

    return () => clearInterval(timer);
  }, []); // ❌ Empty array!

  // Problem: The interval "remembers" count from when it was created (count = 0)
  // Even if count becomes 5, the interval still thinks count = 0!
}

// ✅ FIX: Include count in dependencies
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Count is:', count); // ✅ Fresh count every time!
  }, 1000);

  return () => clearInterval(timer);
}, [count]); // Re-create interval when count changes
```

Think of it like a photo: when you take a photo, it captures that moment. If someone moves, the photo doesn't update! Dependencies tell React: "Hey, take a new photo when this person moves."

**Q: "When should I NOT use useEffect?"**

**A:** Don't use useEffect for things you can calculate during render!

```javascript
// ❌ WRONG: Storing derived state in useEffect
function ProductList({ products }) {
  const [sortedProducts, setSortedProducts] = useState([]);

  useEffect(() => {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    setSortedProducts(sorted);
  }, [products]);

  return sortedProducts.map(/* ... */);
}

// ✅ RIGHT: Calculate during render
function ProductList({ products }) {
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.price - b.price),
    [products]
  );

  return sortedProducts.map(/* ... */);
}
```

**Rule:** useEffect is for **side effects** (things outside your component), not for **calculating values**.

### Common Beginner Mistakes

**Mistake 1: Forgetting Cleanup**
```javascript
// ❌ Memory leak!
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
}, []);

// Timer runs forever, even after component unmounts!

// ✅ Clean up!
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer); // Stop timer on unmount
}, []);
```

**Mistake 2: Infinite Loops**
```javascript
// ❌ INFINITE LOOP!
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // Sets state...
  }, [count]); // ...which triggers effect... which sets state... FOREVER!

  // ✅ FIX: Remove count from deps
  useEffect(() => {
    setCount(c => c + 1); // Only runs once
  }, []);
}
```

**Mistake 3: Missing Dependencies**
```javascript
// ❌ Stale data!
function Greeting({ name }) {
  useEffect(() => {
    console.log('Hello,', name);
  }, []); // ❌ Missing 'name'

  // If name changes, effect doesn't re-run!

  // ✅ FIX: Include name
  useEffect(() => {
    console.log('Hello,', name);
  }, [name]); // Re-run when name changes
}
```

### Practice Exercises for Juniors

**Exercise 1: Clock That Ticks**
```javascript
// TODO: Create a clock that updates every second
function Clock() {
  const [time, setTime] = useState(new Date());

  // Your useEffect here

  return <div>Time: {time.toLocaleTimeString()}</div>;
}

// Expected: Clock updates every second
// Bonus: Clean up the interval!
```

**Exercise 2: Fetch User on Mount**
```javascript
// TODO: Fetch user data when component mounts
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // Your useEffect here

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}

// Expected: Fetches user when component mounts
// Bonus: Re-fetch when userId changes!
```

**Exercise 3: Window Resize Listener**
```javascript
// TODO: Track window width
function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  // Your useEffect here

  return <div>Width: {width}px</div>;
}

// Expected: Updates when window resizes
// Bonus: Clean up the event listener!
```

---

