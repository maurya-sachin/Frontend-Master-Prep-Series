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

## 🔍 Deep Dive: Fiber Architecture Internals

### The Problem Fiber Solves

Before React 16 (pre-Fiber), React used a **stack reconciler** - a synchronous, recursive algorithm that walked the component tree top-to-bottom in one uninterruptible pass. This created fundamental limitations:

**Stack Reconciler Issues:**
1. **Blocking Updates**: Once reconciliation started, it couldn't be interrupted. A complex tree taking 100ms meant the browser was locked for 100ms - no animations, no scrolling, no user input.
2. **No Priority**: All updates were equal. A background data fetch update would block urgent user input updates.
3. **Frame Drops**: Browser needs ~16ms per frame (60 FPS). If reconciliation took 50ms, that's 3 dropped frames - visible jank.
4. **Call Stack Limitation**: JavaScript's call stack is limited. Deep component trees could cause stack overflow.

### Fiber's Revolutionary Solution

Fiber is **not** just an optimization - it's a complete architectural rewrite that transforms React's reconciliation from a **synchronous stack-based algorithm** to an **asynchronous, incremental, priority-based scheduler**.

**Core Fiber Concepts:**

**1. Fiber Node Structure**

Each React element has a corresponding "fiber" - a JavaScript object representing a unit of work:

```javascript
// Simplified Fiber Node Structure
const fiber = {
  // Identity
  type: 'div',              // Component type (function, class, or DOM tag)
  key: 'unique-key',        // React key prop

  // Relationships (doubly-linked tree)
  child: childFiber,        // First child
  sibling: nextSiblingFiber, // Next sibling
  return: parentFiber,      // Parent (called "return" because we return to it after processing)

  // State & Props
  memoizedProps: {},        // Props from last render
  memoizedState: {},        // State from last render
  pendingProps: {},         // New props for this render
  updateQueue: {},          // Queue of state updates

  // Effects
  effectTag: 'PLACEMENT',   // What work needs doing (PLACEMENT, UPDATE, DELETION)
  nextEffect: nextFiber,    // Linked list of fibers with effects
  firstEffect: null,
  lastEffect: null,

  // Scheduling
  lanes: 0b0001,            // Priority lanes (binary bitmap)
  childLanes: 0b0011,       // Descendant lanes

  // Double Buffering
  alternate: workInProgressFiber, // Points to current/work-in-progress counterpart

  // DOM
  stateNode: domNode,       // Actual DOM node or component instance
};
```

**2. Double Buffering (Current vs Work-in-Progress)**

Fiber maintains **two fiber trees**:

- **Current Tree**: What's currently rendered on screen
- **Work-in-Progress Tree**: The tree being built during reconciliation

```javascript
// Double buffering visualization
currentFiber.alternate = workInProgressFiber;
workInProgressFiber.alternate = currentFiber;

// During render:
// 1. Clone current fiber to create work-in-progress
// 2. Apply updates to work-in-progress
// 3. When complete, swap: workInProgress becomes current
```

This enables:
- **Interruptible rendering**: Discard work-in-progress if higher priority update arrives
- **Fast bailouts**: Reuse unchanged fibers from current tree
- **Time travel debugging**: Keep both versions for comparison

**3. Incremental Work Loop**

Fiber breaks reconciliation into small units of work that can be paused:

```javascript
// Simplified Fiber Work Loop (actual React code is more complex)
function workLoopConcurrent() {
  // Keep working while there's work AND we haven't run out of time
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;

  // PHASE 1: "begin work" - process this fiber
  let next = beginWork(current, unitOfWork, renderLanes);

  // Update memoized props
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // PHASE 2: "complete work" - no child, complete this unit
    completeUnitOfWork(unitOfWork);
  } else {
    // Continue to child
    workInProgress = next;
  }
}

function shouldYield() {
  // Check if we've exceeded our time slice (typically 5ms)
  const currentTime = performance.now();
  return currentTime >= deadline;
}
```

**4. Priority Lanes System**

React 18+ uses a **lanes model** for priority - a 31-bit bitmap where each bit represents a priority level:

```javascript
// Lanes (binary bitmaps)
const SyncLane = 0b0000000000000000000000000000001;      // Sync updates (legacy)
const InputContinuousLane = 0b0000000000000000000000000000100; // User input
const DefaultLane = 0b0000000000000000000000000010000;   // Normal updates
const TransitionLanes = 0b0000000001111111111111110000000; // Transitions (16 lanes)
const IdleLane = 0b0100000000000000000000000000000;      // Idle work

// Higher lanes = higher priority (processed first)
// Multiple updates can share same lane (batched together)
```

**Why lanes instead of simple priority numbers?**

- **Batching**: Multiple updates in same lane are processed together
- **Expiration**: Lanes can expire (prevent starvation)
- **Entanglement**: Track which lanes caused re-renders (debugging)

**5. Render vs Commit Phases**

Fiber splits work into two distinct phases:

**Render Phase (Interruptible):**
- Can be paused, aborted, restarted
- No side effects allowed
- Pure computation: build work-in-progress tree
- Functions called: `render()`, function components, `getDerivedStateFromProps`

**Commit Phase (Synchronous, Non-Interruptible):**
- Applies changes to DOM (must be atomic - user shouldn't see partial updates)
- Lifecycle methods with side effects run here
- Functions called: `componentDidMount`, `useLayoutEffect`, `useEffect` (scheduled)

```javascript
// Simplified flow
function performConcurrentWorkOnRoot(root) {
  // RENDER PHASE (can be interrupted)
  let exitStatus = renderRootConcurrent(root, lanes);

  if (exitStatus === RootInProgress) {
    // Work was interrupted, will continue later
    return;
  }

  // COMMIT PHASE (synchronous, non-interruptible)
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root);
}
```

**6. Scheduler Integration**

Fiber integrates with React's **Scheduler** package (based on `requestIdleCallback` concept):

```javascript
// Scheduler decides when to do work
function scheduleCallback(priorityLevel, callback) {
  const currentTime = performance.now();
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = currentTime + timeout;

  const newTask = {
    callback,
    priorityLevel,
    expirationTime,
    startTime: currentTime,
  };

  // Add to priority queue (min-heap based on expiration)
  push(taskQueue, newTask);

  // Schedule flush
  requestHostCallback(flushWork);
}

// Timeout mapping
function timeoutForPriorityLevel(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority: return -1;      // Expires immediately
    case UserBlockingPriority: return 250;  // 250ms
    case IdlePriority: return 1073741823;   // ~12 days (never)
    case LowPriority: return 10000;         // 10s
    case NormalPriority:
    default: return 5000;                   // 5s
  }
}
```

### Concurrent Features Enabled by Fiber

**1. useTransition**

Marks state updates as non-urgent, allowing React to interrupt them:

```javascript
// Internal behavior
function useTransition() {
  const [isPending, setPending] = useState(false);

  function startTransition(callback) {
    setPending(true);

    // Mark current lane as transition lane (lower priority)
    const prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = 1;

    try {
      setPending(false); // High priority
      callback();        // Low priority (transition lane)
    } finally {
      ReactCurrentBatchConfig.transition = prevTransition;
    }
  }

  return [isPending, startTransition];
}
```

**2. Suspense for Data Fetching**

Fiber can pause rendering while waiting for data:

```javascript
// Component suspends during render
function ProfilePage({ userId }) {
  const user = useUserData(userId); // Throws promise if not ready
  return <Profile user={user} />;
}

// Fiber catches thrown promise and renders fallback
// When promise resolves, retry rendering
```

**3. Time Slicing**

Fiber yields to browser between units of work:

```javascript
// Before Fiber: Blocks for 100ms
function renderHugeList() {
  const items = Array(10000).fill(0).map((_, i) => <Item key={i} />);
  return <div>{items}</div>;
}

// After Fiber: Yields every 5ms, total time still ~100ms but UI responsive
// User can scroll, type, click during rendering
```

### Performance Characteristics

**Time Complexity:**
- **Best case**: O(n) where n = number of changed components (bailout optimization)
- **Worst case**: O(n) where n = total components (same as old reconciler)
- **Fiber doesn't make reconciliation faster** - it makes it interruptible

**Space Complexity:**
- **O(2n)**: Maintains two fiber trees (current + work-in-progress)
- Trade-off: Extra memory for better UX

**Scheduling Overhead:**
- ~0.1-0.3ms per yield to check `shouldYield()`
- Negligible compared to improved responsiveness

### Browser Integration

Fiber leverages browser APIs for scheduling:

```javascript
// React uses MessageChannel for scheduling (better than setTimeout)
const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = () => {
  // Perform work
  workLoop();
};

function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}
```

**Why MessageChannel over setTimeout?**
- `setTimeout` clamped to 4ms minimum (too slow for 60 FPS)
- `MessageChannel` fires immediately after current task
- `requestIdleCallback` not widely supported + only fires when truly idle

---

## 🐛 Real-World Scenario: Fixing Dropped Frames in Large Data Tables

### The Problem

Your team built an admin dashboard with a filterable data table showing 10,000 products. Users complained that **typing in the filter input feels laggy** - there's a 500ms delay between keypress and seeing the character appear.

**Initial Implementation:**

```javascript
function ProductTable() {
  const [filter, setFilter] = useState('');
  const [products, setProducts] = useState(allProducts); // 10,000 items

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    // Problem: Filtering 10,000 items synchronously
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setProducts(filtered);
  };

  return (
    <div>
      <input
        value={filter}
        onChange={handleFilterChange}
        placeholder="Filter products..."
      />
      <table>
        <tbody>
          {products.map(product => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Metrics:**
- **Input lag**: 500-800ms (user types "a", sees it 0.5s later)
- **Frame rate**: Drops to 5-10 FPS during filtering (should be 60 FPS)
- **Main thread blocking**: 600ms+ (browser can't respond to user)
- **User complaint rate**: 73% of users report "sluggish" experience

### Root Cause Analysis

**1. Check Performance Tab (Chrome DevTools):**

```
Timeline:
- Keypress event: 0ms
- onChange handler: 0ms - 600ms (LONG TASK - blocks main thread)
  ├─ setState(filter): 1ms
  ├─ allProducts.filter(): 50ms
  ├─ setState(products): 1ms
  └─ Re-render 10,000 rows: 548ms (BOTTLENECK)
- Input update visible: 600ms (user sees character)
```

**2. React DevTools Profiler:**

```
Render time: 602ms
Components rendered: 10,001 (1 input + 10,000 rows)
Flamegraph shows:
- ProductTable: 602ms
  └─ ProductRow × 10,000: 598ms (each takes ~0.06ms)
```

**3. Problem Identified:**

Pre-Fiber (React 15), this would **completely lock the browser** for 600ms. With Fiber (React 16+), the render is still 600ms, but we're not using Fiber's capabilities. The update is treated as **high priority** (user input), so React tries to finish it ASAP, blocking the UI.

### The Solution: Leverage Fiber's Priority System

**Step 1: Separate Urgent vs Non-Urgent Updates**

```javascript
import { useTransition, useDeferredValue } from 'react';

function ProductTable() {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Deferred value lags behind real value during transitions
  const deferredFilter = useDeferredValue(filter);

  const handleFilterChange = (e) => {
    const value = e.target.value;

    // HIGH PRIORITY: Update input immediately
    setFilter(value);
  };

  // LOW PRIORITY: Filter based on deferred value
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [deferredFilter]);

  return (
    <div>
      <input
        value={filter}
        onChange={handleFilterChange}
        placeholder="Filter products..."
      />
      {isPending && <Spinner />}
      <table style={{ opacity: isPending ? 0.6 : 1 }}>
        <tbody>
          {filteredProducts.map(product => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Improved Metrics:**
- **Input lag**: 16ms (60 FPS - instant feedback)
- **Frame rate**: Stays 60 FPS (smooth)
- **Main thread**: Yields every 5ms (browser responsive)
- **Total render time**: Still ~600ms, but spread over 120 frames (600ms / 5ms)

**Step 2: Virtualization for Ultimate Performance**

For truly large lists, combine Fiber priorities with virtualization:

```javascript
import { useTransition } from 'react';
import { FixedSizeList } from 'react-window';

function VirtualizedProductTable() {
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredFilter = useDeferredValue(filter);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [deferredFilter]);

  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductRow product={filteredProducts[index]} />
    </div>
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter products..."
      />
      {isPending && <Spinner />}
      <FixedSizeList
        height={600}
        itemCount={filteredProducts.length}
        itemSize={50}
        width="100%"
        style={{ opacity: isPending ? 0.6 : 1 }}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

**Final Metrics:**
- **Input lag**: 16ms (instant)
- **Render time**: 20ms (only renders ~12 visible rows)
- **Memory**: 90% reduction (only renders visible items)
- **User satisfaction**: 98% positive feedback

### Debugging Fiber-Related Issues

**Problem: Updates not batching correctly**

```javascript
// Wrong: Multiple state updates in async callback (not auto-batched in React 17)
function handleClick() {
  fetch('/api/data').then(data => {
    setA(data.a); // Causes render
    setB(data.b); // Causes render
    setC(data.c); // Causes render
  });
}

// Fix 1: Use React 18 automatic batching (works everywhere)
// React 18+ auto-batches even in async callbacks

// Fix 2: Manual batching (React 17)
import { unstable_batchedUpdates } from 'react-dom';

function handleClick() {
  fetch('/api/data').then(data => {
    unstable_batchedUpdates(() => {
      setA(data.a);
      setB(data.b);
      setC(data.c);
    }); // Single render
  });
}
```

**Problem: Transition not working as expected**

```javascript
// Wrong: Transition doesn't affect setState calls inside
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    startTransition(() => {
      setQuery(e.target.value); // Still high priority (input change)
      setResults(search(e.target.value)); // Low priority
    });
  };

  return <input value={query} onChange={handleChange} />;
}

// Fix: Keep urgent update outside transition
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // High priority - immediate

    startTransition(() => {
      setResults(search(e.target.value)); // Low priority - can be interrupted
    });
  };

  return <input value={query} onChange={handleChange} />;
}
```

### Monitoring Fiber Performance

```javascript
// Use React DevTools Profiler API
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,      // "mount" or "update"
  actualDuration, // Time spent rendering
  baseDuration,   // Estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  // Log slow renders
  if (actualDuration > 16) { // Slower than 1 frame
    console.warn(`Slow render in ${id}: ${actualDuration}ms`);

    // Send to analytics
    analytics.track('slow_render', {
      component: id,
      duration: actualDuration,
      phase
    });
  }
}

function App() {
  return (
    <Profiler id="ProductTable" onRender={onRenderCallback}>
      <ProductTable />
    </Profiler>
  );
}
```

---

<details>
<summary><strong>⚖️ Trade-offs: When to Use Fiber Features</strong></summary>

### useTransition vs useDeferredValue

**useTransition:**
- **Use when:** You control the state update causing expensive rendering
- **Best for:** User interactions triggering expensive state changes
- **Provides:** `isPending` flag to show loading state
- **Example:** Search input triggering expensive filtering

```javascript
// useTransition - You trigger the update
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value) => {
    setQuery(value); // Urgent
    startTransition(() => {
      setResults(expensiveSearch(value)); // Non-urgent
    });
  };

  return (
    <>
      <input onChange={e => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
```

**useDeferredValue:**
- **Use when:** You receive value from parent, can't control update
- **Best for:** Expensive derived values from props/state
- **Provides:** Deferred version of value (lags behind during updates)
- **Example:** Expensive component receiving prop from parent

```javascript
// useDeferredValue - Parent controls update
function SlowList({ query }) {
  const deferredQuery = useDeferredValue(query);

  // This list updates with deferred query (can lag)
  const items = useMemo(
    () => expensiveFilter(allItems, deferredQuery),
    [deferredQuery]
  );

  return items.map(item => <Item key={item.id} {...item} />);
}

function Parent() {
  const [query, setQuery] = useState('');

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SlowList query={query} />
    </>
  );
}
```

**Decision Matrix:**

| Scenario | useTransition | useDeferredValue |
|----------|---------------|------------------|
| You control setState | ✅ Preferred | ❌ |
| Value comes from parent | ❌ | ✅ Preferred |
| Need isPending flag | ✅ | ❌ (derive from value !== deferredValue) |
| Multiple state updates | ✅ Wrap all in startTransition | ❌ One value at a time |
| Third-party component | ❌ | ✅ Can't modify internal setState |

### Concurrent Rendering vs Synchronous Rendering

**Concurrent Rendering (React 18+):**

**Pros:**
- UI stays responsive during expensive updates
- Automatic batching (even in async callbacks)
- Can interrupt/abandon low-priority work
- Better user experience for complex UIs

**Cons:**
- Components may render multiple times (must be pure)
- Harder to debug (non-deterministic timing)
- Lifecycle methods called multiple times (render phase)
- External side effects in render can cause issues

**When to use:**
- Large data tables with filtering
- Complex animations + data updates
- Forms with expensive validation
- Search/autocomplete with heavy computation

**Synchronous Rendering (Legacy Mode):**

**Pros:**
- Predictable, deterministic behavior
- Components render exactly once per update
- Easier to debug (step through linearly)
- Compatible with legacy lifecycle methods

**Cons:**
- UI freezes during expensive updates
- No automatic batching in async callbacks
- Can't interrupt work (all-or-nothing)
- Poor UX for complex UIs

**When to use:**
- Simple applications with fast renders (<16ms)
- Legacy apps with impure components
- Third-party libraries assuming synchronous rendering

### Fiber vs Virtualization

**React Fiber (Incremental Rendering):**

**How it works:** Breaks rendering into chunks, yields to browser
**Renders:** All items (eventually), just spread over time
**Use when:** 100-1000 items, complex per-item logic, need all items in DOM

```javascript
// Fiber approach - Renders all 1000 items incrementally
function ProductList({ products }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filtered = useMemo(
    () => products.filter(p => p.name.includes(deferredFilter)),
    [products, deferredFilter]
  );

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(p => <ProductCard key={p.id} product={p} />)}
    </>
  );
}

// Pros: Simple, all items accessible, good for 100-1000 items
// Cons: Still renders all items (slower than virtualization)
```

**Virtualization (react-window/react-virtualized):**

**How it works:** Only renders visible items + small buffer
**Renders:** 10-20 items regardless of total list size
**Use when:** 10,000+ items, simple per-item logic, scrollable list

```javascript
// Virtualization approach - Renders only ~12 visible items
import { FixedSizeList } from 'react-window';

function VirtualizedProductList({ products }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filter)),
    [products, filter]
  );

  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductCard product={filtered[index]} />
    </div>
  );

  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <FixedSizeList
        height={600}
        itemCount={filtered.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </>
  );
}

// Pros: Handles millions of items, constant performance
// Cons: More complex, items not in DOM (accessibility issues), no variable heights (easily)
```

**Combined Approach (Best of Both):**

```javascript
// Use Fiber priorities + virtualization for ultimate performance
function HybridProductList({ products }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filtered = useMemo(
    () => products.filter(p => p.name.includes(deferredFilter)),
    [products, deferredFilter]
  );

  return (
    <>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <FixedSizeList
        height={600}
        itemCount={filtered.length}
        itemSize={80}
        width="100%"
        style={{ opacity: filter !== deferredFilter ? 0.6 : 1 }}
      >
        {({ index, style }) => (
          <div style={style}>
            <ProductCard product={filtered[index]} />
          </div>
        )}
      </FixedSizeList>
    </>
  );
}
```

**Decision Matrix:**

| List Size | Simple Items | Complex Items | Recommendation |
|-----------|--------------|---------------|----------------|
| < 100 | ✅ Fiber | ✅ Fiber | Fiber only |
| 100-1000 | ✅ Fiber | ⚠️ Fiber + useMemo | Fiber + optimization |
| 1000-10000 | ⚠️ Virtualization | ✅ Virtualization | Virtualization preferred |
| 10000+ | ✅ Virtualization | ✅ Virtualization | Virtualization required |

### Concurrent Features vs Code Complexity

**Without Concurrent Features (Simpler Code):**

```javascript
// Simple, but can freeze UI
function App() {
  const [data, setData] = useState([]);

  const handleUpdate = async () => {
    const result = await fetch('/api/data');
    setData(result); // May block UI if data is large
  };

  return (
    <div>
      <button onClick={handleUpdate}>Update</button>
      <List data={data} />
    </div>
  );
}
```

**With Concurrent Features (More Complex, Better UX):**

```javascript
// Complex, but responsive UI
function App() {
  const [data, setData] = useState([]);
  const [isPending, startTransition] = useTransition();
  const deferredData = useDeferredValue(data);

  const handleUpdate = async () => {
    const result = await fetch('/api/data');
    startTransition(() => {
      setData(result); // Non-blocking
    });
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      <List data={deferredData} style={{ opacity: isPending ? 0.6 : 1 }} />
    </div>
  );
}
```

**Trade-off:**
- **Simple code**: Easier to understand, but poor UX for expensive updates
- **Concurrent code**: More concepts to learn, but excellent UX

**Guideline:**
- Start simple
- Add concurrent features when users report lag (measured, not premature)
- Profile first: Ensure the problem is render time, not data fetching

---

## 💬 Explain to Junior: Fiber in Simple Terms

### The Restaurant Analogy

Imagine you're a chef in a restaurant (React), and you need to prepare orders (render components).

**Before Fiber (Old React):**

You receive 3 orders:
1. VIP customer's appetizer (urgent - they're hungry now!)
2. Regular customer's full meal (normal priority)
3. Catering order for tomorrow (low priority)

**Old way:** You prepare them in order received. The VIP waits 2 hours while you finish the catering order first. They leave angry. 😡

**With Fiber (New React):**

Same 3 orders, but now:
1. You start the catering order (low priority)
2. VIP customer arrives - you STOP catering, make their appetizer immediately (high priority)
3. Serve VIP (happy customer! 😊)
4. Return to catering order where you left off
5. Regular meal next

**Key insight:** Fiber lets React "pause" what it's doing to handle urgent tasks, then resume later.

### The Simple Explanation

**What is Fiber?**

Fiber is React's way of being smart about **when** to update the screen. Instead of doing all the work at once (blocking), it breaks work into tiny pieces and checks after each piece: "Is there something more important I should do?"

**Real-world example:**

You're typing in a search box, and the app filters 10,000 products as you type.

**Without Fiber (React 15):**
- You type "a"
- Browser thinks: "Hold on, I need to filter 10,000 products and update the screen... this will take 500ms"
- You type "b" but don't see it (browser busy)
- You type "c" but don't see it (browser still busy)
- 500ms later: Browser finishes, shows "abc" all at once
- Experience: LAGGY 😩

**With Fiber (React 16+) + useTransition:**
- You type "a" → instantly appears (high priority)
- Browser starts filtering 10,000 products (low priority)
- You type "b" → browser STOPS filtering, shows "b" immediately (high priority)
- Browser resumes filtering (based on "ab" now)
- You type "c" → browser STOPS again, shows "c" immediately
- Browser finishes filtering for "abc"
- Experience: SMOOTH ✨

### The Key Concepts (Simplified)

**1. Incremental Rendering**

Think of building a LEGO castle:

**Old way:** Build entire castle in one go. Can't do anything else until done.

**Fiber way:** Build one brick at a time. After each brick, check if someone needs you. If yes, stop building, help them, then continue.

**2. Priority System**

Not all updates are equal:

**Urgent (high priority):**
- User typing
- User clicking
- Animations

**Can wait (low priority):**
- Data fetching results
- Background calculations
- Analytics

Fiber does urgent stuff first, then gets to the low-priority work when there's time.

**3. Double Buffering**

Think of video game graphics:

**One screen:** What player sees (current)
**Second screen:** What's being drawn next (work-in-progress)

When next screen is ready, SWAP (instant transition). Player never sees half-drawn frame.

Fiber does the same: Keeps current UI visible while preparing next version in background. When ready, swap.

### Interview Answer Template

**Question:** "What is React Fiber?"

**Answer:**

"Fiber is React's reconciliation algorithm introduced in React 16 that enables incremental rendering. Before Fiber, React would render the entire component tree synchronously, which could block the main thread and freeze the UI during expensive updates.

Fiber solves this by breaking rendering into small units of work that can be paused and resumed. This allows React to:

1. **Prioritize updates** - Handle urgent user interactions immediately, defer less important updates
2. **Keep UI responsive** - Yield to the browser between chunks of work, preventing frame drops
3. **Enable concurrent features** - Like `useTransition` and Suspense, which weren't possible before

For example, in a search input filtering a large list, Fiber lets React update the input immediately (high priority) while gradually updating the results (low priority). The user sees instant feedback instead of lag.

Under the hood, Fiber represents each component as a 'fiber node' - a JavaScript object with links to children, siblings, and parent. React walks this tree incrementally, processing one node at a time and checking whether it should yield to more urgent work.

This architectural change doesn't make reconciliation faster, but it makes React applications feel more responsive by ensuring critical updates aren't blocked by expensive ones."

### Common Beginner Mistakes

**Mistake 1: Thinking Fiber makes React faster**

```javascript
// Wrong thinking: "Fiber will make my slow component fast"
function SlowComponent() {
  const expensiveValue = doSlowCalculation(); // Still slow!
  return <div>{expensiveValue}</div>;
}

// Right thinking: "Fiber makes UI responsive DURING slow renders"
// You still need to optimize expensive calculations
function BetterComponent() {
  const expensiveValue = useMemo(() => doSlowCalculation(), [deps]);
  return <div>{expensiveValue}</div>;
}
```

**Mistake 2: Not using concurrent features**

```javascript
// Missing opportunity: UI lags during filter
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setResults(expensiveSearch(e.target.value)); // Blocks UI
  };

  return <input value={query} onChange={handleChange} />;
}

// Better: Use useTransition
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // Instant
    startTransition(() => {
      setResults(expensiveSearch(e.target.value)); // Non-blocking
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
```

**Mistake 3: Side effects in render**

```javascript
// Wrong: Side effect in render (will run multiple times in concurrent mode)
function BadComponent() {
  logAnalytics('Component rendered'); // ❌ Runs multiple times!

  return <div>Content</div>;
}

// Right: Side effects in useEffect
function GoodComponent() {
  useEffect(() => {
    logAnalytics('Component rendered'); // ✅ Runs once per commit
  }, []);

  return <div>Content</div>;
}
```

### Visual Mental Model

```
OLD REACT (Synchronous Stack):

[User Input] → [Start Render] → → → → → → → → [Finish] → [User Sees Update]
                 ↑ BLOCKING (500ms) ↑
                 UI FROZEN


NEW REACT (Fiber):

[User Input] → [Urgent Update (16ms)] → [User Sees Input]
                                            ↓
[Background: Chunk 1] → [Yield] → [Chunk 2] → [Yield] → ... → [Done]
 (5ms)                  (check)     (5ms)       (check)

Result: Input instant, expensive work happens in background
```

### Practical Tips for Using Fiber

1. **Use React DevTools Profiler** - Measure before optimizing
2. **Wrap expensive updates in useTransition** - Keep UI responsive
3. **Keep components pure** - Fiber may call render multiple times
4. **Use useMemo/useCallback** - Prevent unnecessary work
5. **Consider virtualization for huge lists** - Fiber helps, but virtualization better for 10,000+ items

### When Does Fiber Matter?

**You probably don't need to think about Fiber if:**
- Your app renders fast (< 16ms per update)
- You have simple UIs with few components
- Your lists have < 100 items

**You should leverage Fiber features if:**
- Users report input lag or UI freezing
- You have large filterable lists (1,000+ items)
- You have complex animations + data updates
- You're building data-heavy dashboards

**Bottom line:** Fiber makes React better by default, but you get the most benefit when you actively use its concurrent features (`useTransition`, `useDeferredValue`, Suspense).

</details>

---

