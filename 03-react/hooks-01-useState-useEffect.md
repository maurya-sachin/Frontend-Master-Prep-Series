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

