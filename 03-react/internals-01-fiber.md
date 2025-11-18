# React Internals - Fiber Architecture

> React Fiber architecture and reconciliation basics

---

## Question 1: React Fiber Architecture

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 15 minutes
**Companies:** Meta, Google

### Question
What is React Fiber? How does it improve React's performance?

### Answer

**Fiber** is React's complete rewrite of the reconciliation algorithm (React 16+) that enables incremental rendering, pause/resume work, and prioritize updates.

**Key Points:**
1. **Incremental rendering** - Split work into chunks, spread over multiple frames
2. **Priority-based updates** - Urgent updates (user input) over less urgent (data fetching)
3. **Interruptible** - Can pause work and return to it later
4. **Concurrent rendering** - Prepare multiple versions of UI simultaneously
5. **Better UX** - Keeps UI responsive during heavy updates

### Code Example

```jsx
// BEFORE FIBER (React 15)
// Problem: Entire component tree rendered synchronously
// If rendering takes 100ms, UI freezes for 100ms

function App() {
  const [count, setCount] = useState(0);

  // Heavy computation blocks UI
  const expensiveValue = calculateExpensiveValue(count); // blocks for 100ms

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Click me - UI freezes during update
      </button>
      <HeavyComponent value={expensiveValue} />
    </div>
  );
}

// AFTER FIBER (React 16+)
// Fiber breaks work into units that can be paused/resumed
// UI stays responsive even during heavy updates

// 1. FIBER STRUCTURE (simplified concept)
// Each component has a corresponding "fiber" node
const fiber = {
  type: 'div',              // Component type
  props: { className: 'container' },
  stateNode: domNode,       // Actual DOM node
  child: childFiber,        // First child fiber
  sibling: siblingFiber,    // Next sibling fiber
  return: parentFiber,      // Parent fiber
  alternate: currentFiber,  // Previous version (for diffing)
  effectTag: 'UPDATE',      // What work needs doing
  updateQueue: [],          // Pending state updates
};

// 2. WORK LOOP (simplified)
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // Do a small chunk of work
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // Check if we need to yield to browser
    shouldYield = deadline.timeRemaining() < 1;
  }

  // If there's more work and time left, continue
  if (nextUnitOfWork) {
    requestIdleCallback(workLoop);
  }
}

// 3. CONCURRENT FEATURES ENABLED BY FIBER

// useTransition - Mark updates as non-urgent
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // Urgent: Update input immediately
    setQuery(value);

    // Non-urgent: Search can wait
    startTransition(() => {
      const searchResults = performExpensiveSearch(value);
      setResults(searchResults);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </div>
  );
}

// useDeferredValue - Defer updating less important parts
function ProductList({ query }) {
  const deferredQuery = useDeferredValue(query);

  // Input shows latest query instantly
  // List updates with deferred query (can lag behind)
  return (
    <div>
      <input value={query} />
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}

// 4. PRIORITY LEVELS IN FIBER
const PriorityLevels = {
  ImmediatePriority: 1,     // User input, clicks (1ms timeout)
  UserBlockingPriority: 2,  // User interactions (250ms)
  NormalPriority: 3,        // Data fetching (5s)
  LowPriority: 4,           // Analytics (10s)
  IdlePriority: 5,          // Background work (no timeout)
};

// Example: Input stays responsive while list updates
function FilteredList() {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState(largeDataSet);

  const handleFilterChange = (e) => {
    // HIGH PRIORITY: Update input immediately
    setFilter(e.target.value);

    // LOW PRIORITY: Filter list can wait
    startTransition(() => {
      const filtered = filterLargeDataSet(e.target.value);
      setItems(filtered);
    });
  };

  return (
    <div>
      <input value={filter} onChange={handleFilterChange} />
      {items.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

### Common Mistakes

- ❌ Assuming all updates render immediately (Fiber can delay low-priority updates)
- ❌ Not using `useTransition` for expensive operations
- ❌ Blocking the main thread with synchronous expensive operations
- ✅ Use `useTransition` for non-urgent updates
- ✅ Use `useDeferredValue` for expensive derived values
- ✅ Understand that Fiber enables concurrent rendering

### Follow-up Questions

1. How does Fiber decide which updates to prioritize?
2. What's the difference between Fiber and the Virtual DOM?
3. How does `useTransition` work under the hood?

### Resources
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Concurrent React](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)

---

