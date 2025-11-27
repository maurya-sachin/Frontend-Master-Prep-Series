# React Fiber Architecture

## Question 1: What is React Fiber architecture and why was it created?

### Answer

React Fiber is a complete rewrite of React's core reconciliation algorithm, introduced in React 16 (2017). It's an internal reimplementation that fundamentally changed how React updates the UI, replacing the previous "stack reconciler" with a more flexible fiber reconciler.

**Key innovations:**

1. **Incremental rendering**: Ability to split rendering work into chunks and spread it across multiple frames
2. **Pause and resume**: Can pause work, assign priorities, and resume later
3. **Abort and reuse**: Can abort outdated work and reuse previously completed work
4. **Priority-based scheduling**: Different updates have different priorities
5. **Concurrent features**: Enables time-slicing, Suspense, concurrent rendering

**Why it was created:**

The old stack reconciler processed updates synchronously and couldn't be interrupted. Once React started rendering, it had to finish the entire component tree before yielding control back to the browser. This caused problems:

- **UI blocking**: Large updates blocked the main thread, causing jank and unresponsive interfaces
- **Dropped frames**: Animations stuttered during complex renders (< 60fps)
- **No prioritization**: Urgent updates (user input) couldn't interrupt low-priority work (background data fetch)
- **Poor mobile performance**: Limited CPU resources amplified blocking issues

Fiber solved these problems by making rendering interruptible and enabling React to prioritize user-facing updates over less critical background work.

**The name "Fiber":**

Comes from computer science—a fiber is a lightweight thread of execution. Each Fiber node represents a unit of work that can be paused, prioritized, and resumed independently.

---

### 🔍 Deep Dive

<details>
<summary><strong>🔍 Deep Dive: Fiber Node Structure and Reconciliation Algorithm</strong></summary>

#### Fiber Node Structure

Every React element has a corresponding Fiber node—a JavaScript object containing component state, props, and pointers to other Fibers. Here's the actual structure (simplified):

```javascript
// Fiber node structure (React internals)
function FiberNode(tag, pendingProps, key, mode) {
  // Instance properties
  this.tag = tag;                    // Type of component (FunctionComponent, ClassComponent, etc.)
  this.key = key;                    // Unique key for reconciliation
  this.elementType = null;           // The function/class itself
  this.type = null;                  // Resolved type
  this.stateNode = null;             // DOM node or class instance

  // Fiber tree structure (doubly-linked tree)
  this.return = null;                // Parent fiber
  this.child = null;                 // First child fiber
  this.sibling = null;               // Next sibling fiber
  this.index = 0;                    // Index in parent

  // State and props
  this.pendingProps = pendingProps;  // New props from React element
  this.memoizedProps = null;         // Props from last render
  this.memoizedState = null;         // State from last render
  this.updateQueue = null;           // Queue of state updates

  // Effects
  this.flags = NoFlags;              // Side-effect flags (Placement, Update, Deletion, etc.)
  this.subtreeFlags = NoFlags;       // Aggregate flags from children
  this.deletions = null;             // Child fibers to delete

  // Scheduling
  this.lanes = NoLanes;              // Priority of this work
  this.childLanes = NoLanes;         // Priority of subtree work

  // Double buffering (current vs work-in-progress)
  this.alternate = null;             // Points to alternate fiber
}
```

**Key concepts:**

1. **Doubly-linked tree**: Each fiber knows its parent (`return`), first child (`child`), and next sibling (`sibling`). This allows React to traverse the tree without recursion (avoiding stack overflow).

2. **Double buffering**: Two fiber trees exist simultaneously:
   - **Current tree**: What's currently on screen
   - **Work-in-progress tree**: Being constructed during render
   - When render completes, WIP becomes current via pointer swap (fast!)

3. **Effect flags**: Track what work needs doing (DOM updates, refs, lifecycle methods):
   ```javascript
   const Placement = 0b000000000000010;  // Insert new DOM node
   const Update =    0b000000000000100;  // Update existing node
   const Deletion =  0b000000000001000;  // Remove node
   const Passive =   0b000001000000000;  // useEffect
   const Layout =    0b000010000000000;  // useLayoutEffect
   ```

#### The Work Loop

Fiber's core is a work loop that processes one fiber at a time, checking if there's time remaining before yielding:

```javascript
// Simplified React work loop (actual code is more complex)
function workLoopConcurrent() {
  // Loop while there's work and time remaining
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;

  // RENDER PHASE: Process this fiber, return next fiber or null
  let next = beginWork(current, unitOfWork, renderLanes);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // No child, complete this fiber
    completeUnitOfWork(unitOfWork);
  } else {
    // Continue with child
    workInProgress = next;
  }
}

function shouldYield() {
  // Check if we've used up our time slice (default: 5ms)
  const currentTime = getCurrentTime();
  return currentTime >= deadline;
}
```

**The process:**

1. **Begin work**: Process a fiber node
   - Reconcile children (diff old vs new)
   - Call component function/render method
   - Create child fibers
   - Return next child to process

2. **Complete work**: When no more children
   - Create/update DOM nodes
   - Collect effect flags
   - Return to sibling or parent

3. **Commit phase**: After all work complete
   - Apply all DOM changes at once (synchronous, can't interrupt)
   - Fire effects (useLayoutEffect, then useEffect)

#### Two-Phase Architecture

Fiber splits rendering into two phases:

**Phase 1: Render/Reconciliation (Interruptible)**
- Can be paused, resumed, or aborted
- No side effects allowed
- Functions called:
  - Function component bodies
  - Class `render()`, `getDerivedStateFromProps()`
  - `shouldComponentUpdate()`

```javascript
// RENDER PHASE - can be called multiple times!
function MyComponent() {
  console.log('Rendering'); // ⚠️ May log multiple times
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

**Phase 2: Commit (Synchronous, uninterruptible)**
- Applies all changes to DOM
- Fires effects and lifecycle methods
- Always completes once started
- Functions called:
  - `componentDidMount`, `componentDidUpdate`
  - `useLayoutEffect`, `useEffect`

#### Priority Lanes System

React 18 uses a sophisticated lane-based priority system (31 lanes represented as bits):

```javascript
// Lane priorities (simplified)
const SyncLane =              0b0000000000000000000000000000001; // Highest - sync updates
const InputContinuousLane =   0b0000000000000000000000000000100; // User input
const DefaultLane =           0b0000000000000000000000000010000; // Normal updates
const TransitionLane1 =       0b0000000000000000000001000000000; // useTransition
const IdleLane =              0b0100000000000000000000000000000; // Idle priority

// Multiple lanes can be active simultaneously (bitwise OR)
const lanes = SyncLane | InputContinuousLane; // Multiple priorities
```

**Priority levels:**
1. **Sync**: Discrete user input (clicks, key presses)—must be immediate
2. **Continuous**: Drag, scroll, mousemove—high priority but slightly delayed
3. **Default**: Normal updates (data fetching results)
4. **Transition**: Low priority, can be interrupted (useTransition)
5. **Idle**: Lowest priority (analytics, prefetching)

This allows React to work on urgent updates first, interrupt low-priority work, and batch similar priority updates together.

</details>

---

### 🐛 Real-World Scenario

<details>
<summary><strong>🐛 Real-World Scenario: Large Dashboard Rendering Blocking UI</strong></summary>

#### Scenario: Large Dashboard Rendering Blocking UI

**Context:**

An enterprise analytics dashboard at a fintech company had severe performance issues. The app rendered complex charts, tables, and metrics—all updating in real-time via WebSocket. Users complained about lag when typing in search fields or clicking buttons.

**Before Fiber (React 15 with Stack Reconciler):**

```javascript
// Dashboard with 500+ rows, 12 columns, live updates
class Dashboard extends React.Component {
  state = {
    transactions: [],      // 500 rows
    searchQuery: '',
    selectedFilters: []
  };

  handleSearch = (e) => {
    // Setting state triggers re-render of entire tree
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const filteredData = this.filterTransactions();

    return (
      <div>
        <SearchBar
          value={this.state.searchQuery}
          onChange={this.handleSearch}  {/* ❌ Typing feels laggy */}
        />

        <TransactionTable
          data={filteredData}            {/* ❌ 500 rows * 12 cols = 6000 cells */}
          renderCell={this.renderCell}
        />

        <Charts data={filteredData} />   {/* ❌ Heavy D3.js charts */}
      </div>
    );
  }

  renderCell = (transaction, column) => {
    // Complex formatting, calculations
    return <Cell {...formatCell(transaction, column)} />;
  };
}
```

**Measured problems:**

1. **Input lag**: 200-400ms delay when typing (users expect < 100ms)
2. **Frame rate**: 15-25 fps during updates (target: 60fps)
3. **Main thread blocking**: 800ms+ synchronous work
4. **Poor UX**: Interface feels frozen during data updates

**Root cause:**

Stack reconciler processed updates synchronously. When user typed a character:
1. `setState` triggered re-render
2. React reconciled 500 rows × 12 columns = 6,000+ components
3. Main thread blocked for 800ms
4. Browser couldn't process next keystroke until finished
5. Result: Laggy, unresponsive UI

**Performance metrics (React 15):**

```
Metric                    | Value
--------------------------|----------
Input to visual update    | 350ms
Frame rate during update  | 18fps
Main thread block time    | 850ms
Time to interactive (TTI) | 2.3s
User-perceived lag        | Severe
```

**After Fiber (React 16+ with Time-Slicing):**

```javascript
// Same component structure, but React handles it differently internally
function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Use transition for expensive filtering (React 18)
  const [isPending, startTransition] = useTransition();
  const [displayedData, setDisplayedData] = useState(transactions);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);  // ✅ High priority - updates immediately

    // Low priority - can be interrupted
    startTransition(() => {
      const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedData(filtered);  // ✅ Can be interrupted by typing
    });
  };

  return (
    <div>
      <SearchBar
        value={searchQuery}
        onChange={handleSearch}  {/* ✅ Responsive, no lag */}
      />

      {isPending && <Spinner />}

      <TransactionTable
        data={displayedData}     {/* ✅ Updates don't block input */}
      />
    </div>
  );
}
```

**How Fiber solved it:**

1. **Incremental rendering**: Broke 6,000 component updates into small chunks (5ms each)
2. **Time-slicing**: After each chunk, yielded to browser for input handling
3. **Priority scheduling**: Typed characters got higher priority than table updates
4. **Interruptible work**: Ongoing table render paused when new keystroke arrived

**Performance metrics (React 18 with Fiber):**

```
Metric                    | Before  | After   | Improvement
--------------------------|---------|---------|-------------
Input to visual update    | 350ms   | 50ms    | 85% faster
Frame rate during update  | 18fps   | 58fps   | 222% better
Main thread block time    | 850ms   | 5ms     | 99% reduction
Time to interactive (TTI) | 2.3s    | 0.4s    | 82% faster
User-perceived lag        | Severe  | None    | ✅ Smooth
```

**Code comparison:**

```javascript
// ❌ BEFORE: All updates have same priority
this.setState({ searchQuery: value });  // Triggers full re-render

// ✅ AFTER: Separate urgent from non-urgent
setSearchQuery(value);                  // Urgent: update input immediately
startTransition(() => {
  setDisplayedData(filtered);           // Non-urgent: interruptible
});
```

**Actual debugging steps:**

```javascript
// Step 1: Identify blocking work with React DevTools Profiler
// Found: TransactionTable render took 850ms

// Step 2: Use useTransition to mark expensive work as low-priority
const [isPending, startTransition] = useTransition();

// Step 3: Verify with Performance tab
// Before: Long task 850ms (red bar)
// After: Many small tasks ~5ms each (green bars)

// Step 4: Measure with User Timing API
performance.mark('search-start');
startTransition(() => { /* expensive work */ });
performance.mark('search-end');
performance.measure('search', 'search-start', 'search-end');
// Result: 45ms (vs 850ms before)
```

**Business impact:**

- **User satisfaction**: NPS score increased from 6.2 to 8.7
- **Task completion**: 34% faster workflow completion
- **Reduced support tickets**: 60% fewer "app is slow" complaints
- **Mobile users**: Performance on mobile devices improved dramatically

</details>

---

### ⚖️ Trade-offs

<details>
<summary><strong>⚖️ Trade-offs: Stack Reconciler vs Fiber Reconciler</strong></summary>

#### Stack Reconciler vs Fiber Reconciler

**Stack Reconciler (React 15 and earlier):**

**Pros:**
- ✅ **Simple**: Straightforward recursive algorithm, easier to understand
- ✅ **Predictable**: Always completes render synchronously (deterministic)
- ✅ **Smaller bundle**: Less code (simpler implementation)
- ✅ **Debugging**: Stack traces align with component tree

**Cons:**
- ❌ **Blocking**: Can't interrupt rendering once started
- ❌ **No prioritization**: All updates treated equally
- ❌ **Poor large-tree performance**: Deep trees block main thread
- ❌ **Stack overflow risk**: Very deep trees (>10,000 depth) can crash
- ❌ **No concurrent features**: Can't support Suspense, transitions, time-slicing

```javascript
// Stack reconciler (recursive, can't pause)
function reconcileChildren(current, workInProgress) {
  const children = workInProgress.pendingProps.children;

  // ❌ Recursively processes all children before returning
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    reconcileChildFiber(current, child);  // Recursive call
  }
}
```

**Fiber Reconciler (React 16+):**

**Pros:**
- ✅ **Interruptible**: Can pause, prioritize, resume work
- ✅ **Priority-based**: Urgent updates interrupt low-priority work
- ✅ **Better performance**: Maintains 60fps during complex updates
- ✅ **Concurrent features**: Enables Suspense, transitions, server components
- ✅ **Scalable**: Handles massive component trees without blocking
- ✅ **Error boundaries**: Better error handling with boundaries

**Cons:**
- ❌ **Complexity**: Much more complex internal implementation
- ❌ **Larger bundle**: ~30% more code (though compressed well)
- ❌ **Render phase re-runs**: Component render may be called multiple times
- ❌ **Harder debugging**: Fiber tree doesn't match call stack exactly
- ❌ **Learning curve**: Concepts like priority lanes are advanced

```javascript
// Fiber reconciler (iterative, can pause)
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);  // ✅ Can exit loop any time
  }

  // ✅ If shouldYield() returns true, browser handles input
  // Then React resumes from workInProgress later
}
```

#### When Concurrent Features Help vs Hurt

**Concurrent rendering benefits:**

| Scenario | Benefit | Example |
|----------|---------|---------|
| Heavy computation during input | Keeps UI responsive | Search filtering large lists |
| Background data fetching | UI doesn't freeze | Loading new page data |
| Multiple simultaneous updates | Batches intelligently | WebSocket + user input |
| Mobile/low-end devices | Better performance | Incremental rendering |
| Complex animations | Maintains 60fps | Animated transitions |

**When NOT to use concurrent features:**

| Scenario | Problem | Solution |
|----------|---------|----------|
| Simple forms | Unnecessary complexity | Use regular `setState` |
| Real-time critical updates | Transitions delay updates | Use `flushSync()` for immediate updates |
| Server-side rendering | Doesn't apply | SSR is always synchronous |
| Small apps | Overhead not worth it | Concurrent mode optional |

**useTransition vs useDeferredValue:**

```javascript
// ✅ useTransition: You control when expensive update happens
function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);           // Urgent: update input immediately

    startTransition(() => {
      const filtered = expensiveFilter(e.target.value);
      setResults(filtered);             // Non-urgent: can be interrupted
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

// ✅ useDeferredValue: React decides when to update deferred value
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);  // React defers this

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}  {/* Always responsive */}
      />
      <Results query={deferredQuery} />  {/* May lag behind during typing */}
    </>
  );
}
```

**Trade-off comparison:**

| Feature | Control | Use Case | Complexity |
|---------|---------|----------|------------|
| `useTransition` | Manual (you wrap expensive work) | When you know what's expensive | Medium |
| `useDeferredValue` | Automatic (React defers value) | Simple value-based deferral | Low |

**Bundle size impact:**

```
React version | Bundle size (minified) | Gzipped | Difference
--------------|------------------------|---------|------------
React 15      | 45 KB                  | 14 KB   | Baseline
React 18      | 48 KB                  | 15 KB   | +7% (Fiber + concurrent)
```

**Memory usage:**

Fiber uses ~2x memory during render (two trees: current + work-in-progress), but memory is released after commit. For most apps, this is negligible.

```javascript
// Memory during render
Current tree:        ~500 KB
Work-in-progress:    ~500 KB
Total:               ~1 MB  (released after commit)
```

**Decision matrix:**

```
Should I use concurrent features?

App has complex UI with frequent updates?
├─ Yes → Use concurrent mode + transitions
└─ No  → Regular mode is fine

Updates block user input?
├─ Yes → Use useTransition or useDeferredValue
└─ No  → Regular setState sufficient

Targeting low-end devices?
├─ Yes → Concurrent features help maintain responsiveness
└─ No  → Benefits exist but less critical

SSR/SSG only?
├─ Yes → Concurrent features don't apply (use Suspense for data fetching)
└─ No  → Consider concurrent rendering
```

</details>

---

### 💬 Explain to Junior

<details>
<summary><strong>💬 Explain to Junior: The Party Organizer Analogy</strong></summary>

#### Simple Explanation

Imagine you're organizing a huge party (rendering a complex React app). You have a long to-do list: decorate rooms, prepare food, set up music, greet guests, etc.

**Old way (Stack Reconciler):**

You start at the top of your list and work straight through without stopping. If someone knocks on the door while you're setting up decorations, you ignore them until you finish the entire decoration task. Guests have to wait, the doorbell keeps ringing, but you're stuck finishing your current task.

- ❌ Can't multitask
- ❌ Important tasks (greeting guests) wait for unimportant tasks (decorating back room)
- ❌ Party feels disorganized and slow

**New way (Fiber):**

You break your to-do list into tiny chunks (5-minute tasks). After each chunk, you check if something urgent needs attention. If a guest arrives, you pause decorating, greet them (urgent!), then return to decorating. You also prioritize: greeting guests > preparing food > decorating rarely-used rooms.

- ✅ Can pause and resume tasks
- ✅ Urgent things get immediate attention
- ✅ Party feels smooth and responsive

**React Fiber is exactly this:**

Instead of rendering your entire app in one uninterruptible block, Fiber breaks rendering into tiny units of work. Between each unit, React checks: "Is there something more important?" If yes, it pauses current work and handles the urgent task.

#### Key Concepts Simplified

**1. Fiber = Unit of Work**

```javascript
// Before Fiber: Recursive (all at once)
function renderApp() {
  renderHeader();        // ❌ Must finish all three
  renderSidebar();       //    before yielding control
  renderMainContent();
}

// With Fiber: Incremental (piece by piece)
function workLoop() {
  while (hasWork && hasTimeRemaining) {
    doSmallUnitOfWork();  // ✅ Check time after each unit
    if (urgentWorkArrived) {
      pauseCurrentWork();
      doUrgentWork();
    }
  }
}
```

**2. Priority Lanes = Task Urgency**

Think of priority lanes like lanes on a highway:

- **Express lane**: User clicks, typing (must handle immediately)
- **Normal lane**: Loading new data (important but not urgent)
- **Slow lane**: Background tasks (can wait)

React uses the express lane for urgent updates and moves slow lane traffic aside when express traffic arrives.

**3. Double Buffering = Draft vs Published**

React keeps two versions of your UI:
- **Current tree**: What users see on screen
- **Work-in-progress tree**: New version being built

It's like editing a document:
1. Open published version (current tree)
2. Make edits in draft mode (work-in-progress tree)
3. When done, replace published with draft (commit phase)

This way, users never see half-finished updates.

#### Interview Answer Template

**Question**: "What is React Fiber and why was it introduced?"

**Answer structure:**

```
1. WHAT (Definition):
"React Fiber is a complete rewrite of React's reconciliation algorithm,
introduced in React 16. It's the internal engine that determines what
needs to update when state changes."

2. WHY (Problem it solved):
"Before Fiber, React used a stack-based reconciler that processed updates
synchronously. This meant rendering large component trees blocked the main
thread, causing UI lag and dropped frames. Users experienced janky
interactions—typing felt slow, buttons didn't respond immediately."

3. HOW (Key innovation):
"Fiber solved this by making rendering interruptible. Instead of processing
the entire component tree in one go, Fiber splits work into small units and
can pause between them. This allows React to:
- Prioritize urgent updates (user input) over less critical work (background data)
- Maintain 60fps during complex renders
- Respond immediately to user interactions"

4. CONCRETE EXAMPLE:
"For example, in a search interface filtering 1,000 items, the old reconciler
would block the UI for 200ms while processing results. With Fiber and
useTransition, the input field stays responsive while filtering happens in
the background at lower priority. Users never experience lag."

5. IMPACT (React 18 features):
"Fiber enables modern React features like Suspense, concurrent rendering,
useTransition, and automatic batching. These features make apps feel faster
and more responsive, especially on mobile devices or during complex updates."
```

**Common follow-up**: "What's the difference between the render phase and commit phase?"

```
"The render phase is where React figures out what changed—it reconciles
components, diffs the virtual DOM, and prepares updates. This phase can
be paused and resumed because it has no side effects.

The commit phase is where React applies those changes to the actual DOM.
This phase is synchronous and can't be interrupted because half-applied
DOM changes would be visible to users.

Think of it like planning a trip (render—can revise the plan) vs actually
driving (commit—can't stop halfway on the highway)."
```

**Common mistake to avoid:**

```javascript
// ❌ WRONG: Thinking Fiber makes React faster
"Fiber makes rendering faster"  // No!

// ✅ RIGHT: Fiber makes React more responsive
"Fiber keeps the UI responsive during complex rendering by splitting work
into interruptible chunks and prioritizing urgent updates"
```

Fiber doesn't make individual renders faster—it makes the app *feel* faster by ensuring urgent updates (like user input) aren't blocked by low-priority work.

---

## Question 2: How does Fiber enable concurrent rendering and time-slicing?

### Answer

Concurrent rendering is React's ability to work on multiple versions of the UI simultaneously, pausing and resuming work based on priority. Time-slicing is the mechanism that breaks rendering into small chunks (slices) to maintain responsiveness.

**Core mechanisms:**

1. **Work loop with yielding**: React performs work in ~5ms chunks, then yields to the browser
2. **Priority lanes**: Different updates get different priority levels (31 priority lanes)
3. **Double buffering**: Current tree vs work-in-progress tree allows non-blocking updates
4. **Scheduler**: Coordinates work based on priority and available time
5. **Interruptible rendering**: Low-priority work pauses when high-priority work arrives

**How time-slicing works:**

```javascript
// Simplified scheduler logic
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);  // ~0.5-1ms per unit
  }

  if (workInProgress !== null) {
    // More work remains, schedule continuation
    return RootInProgress;
  } else {
    // All work complete, commit changes
    return RootCompleted;
  }
}

function shouldYield() {
  const currentTime = getCurrentTime();
  return currentTime >= deadline;  // Default: 5ms deadline
}
```

**Priority-based scheduling:**

```javascript
// User clicks button (high priority - sync)
<button onClick={() => setCount(c => c + 1)}>
  Click me  {/* Updates immediately, can't be interrupted */}
</button>

// Background data update (normal priority - concurrent)
useEffect(() => {
  fetch('/api/data').then(data =>
    setData(data)  // Can be interrupted by user interactions
  );
}, []);

// Expensive filtering (low priority - transition)
startTransition(() => {
  setFilteredResults(expensiveFilter(data));  // Yields to urgent work
});
```

**React 18 concurrent features enabled by Fiber:**

1. **useTransition**: Mark state updates as non-urgent
2. **useDeferredValue**: Defer updating a value until more urgent updates finish
3. **Suspense**: Declaratively handle async operations
4. **Automatic batching**: Batch multiple state updates across async boundaries
5. **Server Components**: Stream UI from server while maintaining interactivity

**The key insight:**

Traditional React rendered like a synchronous function call—once started, it runs to completion. Fiber transforms rendering into an interruptible process more like async/await—it can pause, let other code run, then resume where it left off. This is accomplished through the fiber tree structure and scheduler cooperation.

---

### 🔍 Deep Dive

#### The Scheduler: React's Task Coordinator

React's scheduler (separate package: `scheduler`) is the brain behind concurrent rendering. It uses browser APIs to coordinate work without blocking the main thread.

**How it works:**

```javascript
// Simplified scheduler implementation
const taskQueue = [];           // Pending tasks sorted by priority
const timerQueue = [];          // Delayed tasks
let isHostCallbackScheduled = false;
let currentTask = null;

function scheduleCallback(priorityLevel, callback) {
  const currentTime = getCurrentTime();
  const startTime = currentTime;

  const timeout = getTimeoutForPriority(priorityLevel);
  const expirationTime = startTime + timeout;

  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: expirationTime,  // Earlier expiration = higher priority
  };

  // Insert task into queue (min-heap sorted by expiration)
  taskQueue.push(newTask);
  taskQueue.sort((a, b) => a.sortIndex - b.sortIndex);

  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);  // Uses MessageChannel or setTimeout
  }

  return newTask;
}

function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;

  let currentTime = initialTime;
  advanceTimers(currentTime);  // Move expired timers to taskQueue

  currentTask = peek(taskQueue);  // Get highest priority task

  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      // Task hasn't expired and we're out of time
      break;
    }

    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

      const continuationCallback = callback(didUserCallbackTimeout);

      if (typeof continuationCallback === 'function') {
        // Callback isn't finished, schedule continuation
        currentTask.callback = continuationCallback;
      } else {
        // Callback finished, remove from queue
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  }

  if (currentTask !== null) {
    // More work remains
    return true;
  } else {
    // All work complete
    return false;
  }
}
```

**Priority timeout calculation:**

```javascript
function getTimeoutForPriority(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return -1;          // Already expired, run immediately
    case UserBlockingPriority:
      return 250;         // 250ms timeout
    case IdlePriority:
      return 1073741823;  // ~12 days (practically infinite)
    case LowPriority:
      return 10000;       // 10 seconds
    case NormalPriority:
    default:
      return 5000;        // 5 seconds
  }
}
```

**Browser API integration:**

React uses `MessageChannel` for scheduling (falls back to `setTimeout` if unavailable):

```javascript
// Why MessageChannel instead of setTimeout?
// MessageChannel fires immediately after current task, before rendering
// setTimeout has minimum 4ms delay in browsers

const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = performWorkUntilDeadline;

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);  // Trigger performWorkUntilDeadline
  }
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;  // Default: 5ms

    const hasTimeRemaining = true;
    let hasMoreWork = true;

    try {
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) {
        // Schedule continuation
        port.postMessage(null);
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  }
}
```

#### Priority Lanes in Depth

React 18 uses 31 lanes (bitmask) to represent priority. Multiple lanes can be active simultaneously.

```javascript
// Lane definitions (actual React source code)
export const NoLanes: Lanes = 0b0000000000000000000000000000000;
export const NoLane: Lane = 0b0000000000000000000000000000000;

export const SyncLane: Lane = 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane: Lane = 0b0000000000000000000000000000010;
export const InputContinuousLane: Lane = 0b0000000000000000000000000000100;

export const DefaultHydrationLane: Lane = 0b0000000000000000000000000001000;
export const DefaultLane: Lane = 0b0000000000000000000000000010000;

const TransitionLanes: Lanes = 0b0000000001111111111111111000000;
export const TransitionLane1: Lane = 0b0000000000000000000000001000000;
export const TransitionLane2: Lane = 0b0000000000000000000000010000000;
// ... up to TransitionLane16

export const RetryLanes: Lanes = 0b0000111110000000000000000000000;
export const SelectiveHydrationLane: Lane = 0b0001000000000000000000000000000;

export const IdleHydrationLane: Lane = 0b0010000000000000000000000000000;
export const IdleLane: Lane = 0b0100000000000000000000000000000;

export const OffscreenLane: Lane = 0b1000000000000000000000000000000;
```

**Lane operations:**

```javascript
// Check if lane is in lanes
function includesSomeLane(a: Lanes | Lane, b: Lanes | Lane): boolean {
  return (a & b) !== NoLanes;
}

// Combine lanes
function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
  return a | b;
}

// Remove lanes
function removeLanes(set: Lanes, subset: Lanes | Lane): Lanes {
  return set & ~subset;
}

// Get highest priority lane
function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes;  // Isolates rightmost bit (highest priority)
}

// Example usage
const lanes = DefaultLane | TransitionLane1 | IdleLane;
//           = 0b0100000000000000000000001010000

const highestPriority = getHighestPriorityLane(lanes);
//                     = 0b0000000000000000000000000010000  (DefaultLane)
```

**How lanes map to priorities:**

```javascript
export function lanesToEventPriority(lanes: Lanes): EventPriority {
  const lane = getHighestPriorityLane(lanes);

  if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
    return DiscreteEventPriority;       // Sync, InputContinuous
  }
  if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
    return ContinuousEventPriority;     // Default
  }
  if (includesNonIdleWork(lane)) {
    return DefaultEventPriority;        // Transitions
  }
  return IdleEventPriority;             // Idle, Offscreen
}
```

#### Time-Slicing Visualization

Here's what happens during a complex update with time-slicing:

```
Timeline (1 frame = 16.67ms for 60fps):

Without time-slicing (React 15):
Frame 1: |████████████████████████████████████| <- Render blocks (850ms)
Frame 2: |████████████████████████████████████|
...
Frame 51:|████████|                              <- Finally completes
         |        |<- Commit (DOM update)

User experience: Frozen for 850ms, then sudden update

With time-slicing (React 18):
Frame 1: |██|                <- Render slice 1 (5ms)
         |  |<- Browser handles input, paint, etc (11ms)
Frame 2: |██|                <- Render slice 2 (5ms)
         |  |<- Browser responsive
Frame 3: |██|                <- Render slice 3 (5ms)
...
Frame 10:|██|                <- Final render slice
         |  |<- Commit (DOM update)

User experience: Smooth, responsive throughout

Priority interrupt example:
Frame 1: |██|                <- Low-priority render started
         |  |
Frame 2: |██|                <- Low-priority continues
         |  |<- USER CLICKS (high priority)
Frame 3: |████|              <- Pause low-priority, handle click immediately
         |    |<- Commit click update
Frame 4: |██|                <- Resume low-priority render
         |  |
```

**Code demonstration:**

```javascript
function App() {
  const [urgent, setUrgent] = useState(0);
  const [nonUrgent, setNonUrgent] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // High priority: updates immediately, can't be interrupted
    setUrgent(u => u + 1);

    // Low priority: can be interrupted by next click
    startTransition(() => {
      setNonUrgent(n => n + 1);
    });
  };

  return (
    <div>
      <button onClick={handleClick}>
        Urgent: {urgent} {/* Always responsive */}
      </button>

      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {/* This can lag behind during rapid clicks */}
        <ExpensiveComponent count={nonUrgent} />
      </div>
    </div>
  );
}

function ExpensiveComponent({ count }) {
  // Simulate expensive rendering
  const items = Array.from({ length: 10000 }, (_, i) => (
    <div key={i}>{count + i}</div>
  ));

  return <div>{items}</div>;
}
```

**What happens during rapid clicks:**

1. User clicks → `setUrgent` runs immediately (SyncLane)
2. `startTransition` schedules update (TransitionLane)
3. React starts rendering `ExpensiveComponent`
4. User clicks again before render finishes
5. React pauses transition render, handles new click immediately
6. After click handled, resumes (or restarts) transition render
7. Result: Button always responsive, expensive list may lag slightly

#### React 18 Concurrent Features Deep Dive

**1. Automatic Batching**

React 18 batches all state updates, even in async code:

```javascript
// React 17: Only batches in event handlers
function handleClick() {
  setCount(c => c + 1);  // Batched
  setFlag(f => !f);      // Batched
  // One render
}

setTimeout(() => {
  setCount(c => c + 1);  // ❌ Not batched (renders immediately)
  setFlag(f => !f);      // ❌ Not batched (renders immediately)
  // Two renders in React 17
}, 1000);

// React 18: Batches everywhere
setTimeout(() => {
  setCount(c => c + 1);  // ✅ Batched
  setFlag(f => !f);      // ✅ Batched
  // One render in React 18
}, 1000);

fetch('/api/data').then(() => {
  setData(data);         // ✅ Batched
  setLoading(false);     // ✅ Batched
  // One render
});
```

**2. useTransition**

```javascript
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);  // Urgent: always responsive

    startTransition(() => {
      // Non-urgent: can be interrupted
      const filtered = data.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    });
  };

  return (
    <>
      <input
        value={query}
        onChange={handleChange}
        style={{ opacity: isPending ? 0.7 : 1 }}  // Visual feedback
      />
      <ResultsList results={results} />
    </>
  );
}
```

**3. useDeferredValue**

```javascript
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // query updates immediately (for input)
  // deferredQuery updates at lower priority (for expensive list)

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}  {/* Always fast */}
      />
      <ResultsList query={deferredQuery} />  {/* May lag during typing */}
    </>
  );
}

function ResultsList({ query }) {
  const results = useMemo(() => {
    // Expensive filtering only runs when deferredQuery changes
    return data.filter(item => item.title.includes(query));
  }, [query]);

  return results.map(result => <Result key={result.id} {...result} />);
}
```

**Difference:**

- `useTransition`: You control what's deferred (wrap specific state updates)
- `useDeferredValue`: React controls when value updates (defer entire value)

---

### 🐛 Real-World Scenario

#### Scenario: E-commerce Product Filter Performance

**Context:**

A large e-commerce site (10,000+ products) had a filter sidebar with 50+ filters (categories, price ranges, brands, ratings, etc.). Users could toggle filters and see results update in real-time. Performance was terrible—clicking a checkbox froze the UI for 500-800ms.

**Before Concurrent Rendering (React 17):**

```javascript
function ProductPage() {
  const [products, setProducts] = useState(allProducts);  // 10,000 items
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    brands: [],
    ratings: [],
    inStock: false,
  });

  const handleFilterChange = (filterType, value) => {
    // ❌ Problem: This triggers immediate re-render of 10,000 products
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // ❌ Problem: Runs synchronously on every render
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.categories.length && !filters.categories.includes(product.category)) {
        return false;
      }
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      if (filters.brands.length && !filters.brands.includes(product.brand)) {
        return false;
      }
      if (filters.ratings.length && !filters.ratings.includes(product.rating)) {
        return false;
      }
      if (filters.inStock && !product.inStock) {
        return false;
      }
      return true;
    });
  }, [products, filters]);  // Re-computes every filter change

  return (
    <div>
      <Sidebar filters={filters} onChange={handleFilterChange} />
      <ProductGrid products={filteredProducts} />  {/* 10,000 product cards */}
    </div>
  );
}

function ProductGrid({ products }) {
  // ❌ Problem: Renders all products synchronously
  return (
    <div className="grid">
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
```

**Measured problems:**

```
Metric                          | Value
--------------------------------|----------
Click checkbox to visual update | 650ms
Main thread block time          | 650ms
Frame rate during filtering     | 0fps (frozen)
User interactions dropped       | 3-5 clicks
Lighthouse performance score    | 42/100
User complaint rate             | High
```

**Root cause:**

1. User clicks checkbox
2. `setFilters` triggers re-render
3. `useMemo` recalculates (filters 10,000 products)—takes 150ms
4. React reconciles 10,000 `ProductCard` components—takes 500ms
5. Total: 650ms blocking the main thread
6. User can't interact during this time

**After Concurrent Rendering (React 18):**

```javascript
function ProductPage() {
  const [products, setProducts] = useState(allProducts);

  // Separate urgent state (filter UI) from non-urgent (results)
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    brands: [],
    ratings: [],
    inStock: false,
  });

  const [displayedProducts, setDisplayedProducts] = useState(products);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filterType, value) => {
    // ✅ Urgent: Update filter UI immediately
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // ✅ Non-urgent: Defer expensive filtering
    startTransition(() => {
      const filtered = applyFilters(products, newFilters);
      setDisplayedProducts(filtered);
    });
  };

  return (
    <div>
      <Sidebar
        filters={filters}
        onChange={handleFilterChange}
        // ✅ Sidebar always responsive
      />

      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {isPending && <LoadingOverlay />}
        <ProductGrid products={displayedProducts} />
      </div>
    </div>
  );
}

// Additional optimization: Virtualization
import { FixedSizeGrid } from 'react-window';

function ProductGrid({ products }) {
  // ✅ Only render visible products (virtualization)
  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={250}
      height={600}
      rowCount={Math.ceil(products.length / 4)}
      rowHeight={300}
      width={1000}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * 4 + columnIndex;
        const product = products[index];
        return product ? (
          <div style={style}>
            <ProductCard {...product} />
          </div>
        ) : null;
      }}
    </FixedSizeGrid>
  );
}
```

**Alternative approach: useDeferredValue**

```javascript
function ProductPage() {
  const [products] = useState(allProducts);
  const [filters, setFilters] = useState({/* ... */});

  // ✅ React automatically defers this value during rapid changes
  const deferredFilters = useDeferredValue(filters);

  const filteredProducts = useMemo(() => {
    return applyFilters(products, deferredFilters);
  }, [products, deferredFilters]);

  const handleFilterChange = (filterType, value) => {
    // Urgent: UI updates immediately
    setFilters(prev => ({ ...prev, [filterType]: value }));
    // Non-urgent: filteredProducts updates when React has time
  };

  return (
    <div>
      <Sidebar filters={filters} onChange={handleFilterChange} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
```

**Performance improvements:**

```
Metric                          | Before | After  | Improvement
--------------------------------|--------|--------|-------------
Click to checkbox visual update | 650ms  | 16ms   | 97% faster
Main thread block time          | 650ms  | 5ms    | 99% reduction
Frame rate during filtering     | 0fps   | 60fps  | ✅ Smooth
User interactions dropped       | 3-5    | 0      | ✅ Responsive
Lighthouse performance score    | 42     | 94     | +124%
User complaint rate             | High   | Low    | ✅ Satisfied
```

**How concurrent rendering helped:**

1. **Immediate feedback**: Checkbox toggles instantly (urgent update)
2. **Non-blocking filtering**: Expensive computation happens in background
3. **Interruptible work**: Can click multiple filters rapidly without queueing
4. **Visual feedback**: `isPending` shows loading state during filtering
5. **Maintained responsiveness**: UI never freezes, always accepting input

**Debugging process:**

```javascript
// Step 1: Identify the problem with React DevTools Profiler
// Found: ProductGrid render taking 500ms

// Step 2: Add performance marks
performance.mark('filter-start');
const filtered = applyFilters(products, filters);
performance.mark('filter-end');
performance.measure('filtering', 'filter-start', 'filter-end');
// Result: 150ms for filtering logic

// Step 3: Use useTransition to make filtering non-urgent
startTransition(() => {
  setDisplayedProducts(filtered);
});

// Step 4: Verify with Performance tab
// Before: Single long task (650ms red bar)
// After: Many short tasks (5ms green bars)

// Step 5: Add virtualization for further optimization
// Reduced rendered components from 10,000 to ~40 (visible only)
```

**Business impact:**

- **Conversion rate**: +18% (users complete purchases more often)
- **Bounce rate**: -25% (fewer users leave due to poor performance)
- **Mobile performance**: +40% improvement (concurrent rendering shines on low-end devices)
- **Customer satisfaction**: +2.3 NPS points
- **Support tickets**: -45% "site is slow" complaints

**Additional optimizations:**

```javascript
// 1. Memoize expensive filter components
const Sidebar = React.memo(function Sidebar({ filters, onChange }) {
  return (
    <div>
      <CategoryFilter value={filters.categories} onChange={onChange} />
      <PriceRangeFilter value={filters.priceRange} onChange={onChange} />
      {/* ... */}
    </div>
  );
});

// 2. Debounce rapid filter changes
import { useDeferredValue } from 'react';

function PriceRangeFilter({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);
  const deferredValue = useDeferredValue(localValue);

  useEffect(() => {
    onChange('priceRange', deferredValue);
  }, [deferredValue, onChange]);

  return (
    <input
      type="range"
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}  // Immediate UI update
    />
  );
}

// 3. Web Worker for heavy computation (advanced)
const filterWorker = new Worker('filter-worker.js');

function useFilteredProducts(products, filters) {
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      filterWorker.postMessage({ products, filters });
    });

    filterWorker.onmessage = (e) => {
      setFiltered(e.data);
    };
  }, [products, filters]);

  return [filtered, isPending];
}
```

---

### ⚖️ Trade-offs

#### Concurrent Rendering Benefits vs Costs

**Benefits:**

| Benefit | Explanation | Use Case |
|---------|-------------|----------|
| **Responsive UI** | User interactions never blocked | Complex dashboards, data tables |
| **Priority-based updates** | Urgent work interrupts non-urgent | Search interfaces, filters |
| **Better perceived performance** | App feels faster even if total time same | Mobile apps, low-end devices |
| **Graceful degradation** | Handles complex updates without freezing | Real-time data, animations |
| **Better mobile experience** | Limited CPU handled better | Progressive web apps |

**Costs:**

| Cost | Explanation | Mitigation |
|------|-------------|------------|
| **Complexity** | More concepts to learn (transitions, deferred values) | Use sparingly, only where needed |
| **Render phase re-runs** | Components may render multiple times | Avoid side effects in render |
| **Bundle size** | ~3KB larger (React 18 vs 17) | Negligible when gzipped |
| **Debugging challenges** | Work may pause/resume unexpectedly | Use React DevTools Profiler |
| **Mental model shift** | Think in priorities, not sequential updates | Practice with examples |

#### When to Use Concurrent Features

**Use `useTransition` when:**

✅ Expensive state update that can wait (filtering, sorting)
✅ You want to show pending UI (spinners, opacity)
✅ User interaction should feel instant (typing, clicking)
✅ Update involves rendering large lists or complex trees

❌ Avoid for: Simple state, critical updates, SSR

```javascript
// ✅ GOOD: Expensive filtering
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);
const [isPending, startTransition] = useTransition();

const handleSearch = (value) => {
  setQuery(value);  // Urgent
  startTransition(() => {
    setResults(expensiveFilter(value));  // Non-urgent
  });
};

// ❌ BAD: Simple toggle (unnecessary complexity)
const [isOpen, setIsOpen] = useState(false);
const [isPending, startTransition] = useTransition();

const handleToggle = () => {
  startTransition(() => {  // ❌ Overkill for simple boolean
    setIsOpen(prev => !prev);
  });
};
```

**Use `useDeferredValue` when:**

✅ Value changes frequently (input, slider)
✅ Derived computation is expensive
✅ You want React to manage deferral automatically
✅ Don't need explicit pending state

❌ Avoid for: Critical data, SEO content, server-rendered values

```javascript
// ✅ GOOD: Defer expensive computation
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() =>
    data.filter(item => item.title.includes(deferredQuery)),
    [deferredQuery]
  );

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Results data={results} />
    </>
  );
}

// ❌ BAD: Deferring critical content
function ProductDetails({ productId }) {
  const deferredId = useDeferredValue(productId);  // ❌ User expects immediate update
  const product = useProduct(deferredId);
  return <div>{product.name}</div>;
}
```

#### Concurrent Mode vs Legacy Mode

**Concurrent Mode (React 18+):**

```javascript
// Automatic when using createRoot
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);  // ✅ Concurrent features enabled
```

**Legacy Mode (React 17 style):**

```javascript
// Opt-out of concurrent features
import { render } from 'react-dom';

render(<App />, document.getElementById('root'));  // ❌ No concurrent features
```

**Comparison:**

| Feature | Concurrent Mode | Legacy Mode |
|---------|----------------|-------------|
| **Batching** | Everywhere (event handlers, async, timeouts) | Event handlers only |
| **useTransition** | ✅ Available | ❌ Not available |
| **useDeferredValue** | ✅ Available | ❌ Not available |
| **Suspense (data)** | ✅ Full support | ⚠️ Limited (code-splitting only) |
| **Automatic batching** | ✅ Yes | ❌ No |
| **Time-slicing** | ✅ Yes | ❌ No |
| **Server Components** | ✅ Compatible | ❌ Not compatible |

**Should you migrate to React 18?**

```
Decision matrix:

App has performance issues with complex updates?
├─ Yes → Migrate, use concurrent features
└─ No  → Migrate for automatic batching (free perf boost)

App is simple (few components, minimal state)?
├─ Yes → Migrate for future-proofing, don't use transitions
└─ No  → Evaluate based on complexity

Need Server Components or Suspense for data?
├─ Yes → Must use React 18+ concurrent mode
└─ No  → Optional, but recommended
```

#### Performance Considerations

**Concurrent rendering isn't always faster:**

```javascript
// Example: Small list (50 items)
function SmallList() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState(data);

  const handleSearch = (value) => {
    setQuery(value);

    // ❌ Unnecessary: Filtering 50 items is instant (<5ms)
    startTransition(() => {
      setResults(data.filter(item => item.name.includes(value)));
    });
  };

  // ✅ Better: Just use regular setState (faster, simpler)
  const handleSearchOptimized = (value) => {
    setQuery(value);
    setResults(data.filter(item => item.name.includes(value)));
  };
}
```

**Benchmark:**

```
Task: Filter 50 items, update UI

Regular setState:     8ms total (includes render)
useTransition:       15ms total (scheduler overhead)

Task: Filter 10,000 items, update UI

Regular setState:    650ms (blocks main thread)
useTransition:       680ms total (but UI responsive throughout)
```

**Key insight:** Concurrent features add small overhead (~5-10ms). Use only when work is expensive enough (>50ms) to justify the cost.

**Memory usage:**

```javascript
// Concurrent mode uses double buffering (2x memory during render)

Component tree size:  500 KB
Memory during render:
  - Current tree:     500 KB
  - WIP tree:         500 KB
  - Total:            1 MB

Memory after commit:
  - Current tree:     500 KB (WIP released)
  - Total:            500 KB
```

For most apps, this is negligible. Only concern for extremely memory-constrained environments (IoT devices, older phones).

---

### 💬 Explain to Junior

#### Simple Explanation

Imagine you're working at a busy restaurant kitchen (React app). Orders come in constantly (state updates), and you need to prepare dishes (render UI).

**Old way (synchronous rendering):**

When an order arrives, you drop everything and prepare that dish from start to finish. If a VIP customer walks in while you're cooking someone else's meal, they have to wait. You can't multitask—you're stuck finishing the current order.

- ❌ Important customers (urgent updates) wait for regular orders to finish
- ❌ Kitchen feels chaotic and slow
- ❌ Customers get frustrated

**New way (concurrent rendering):**

You organize orders by priority:
- **VIP orders** (user clicks, typing): Handle immediately
- **Regular orders** (data updates): Work on them when VIP customers are happy
- **Prep work** (background tasks): Do when kitchen is slow

You also work in small chunks. Instead of cooking an entire meal without pause, you:
1. Chop vegetables for Order A (5 seconds)
2. Check if VIP arrived—if yes, pause Order A and handle VIP
3. If no VIP, continue with Order A
4. Repeat

This way, VIPs never wait, and regular orders still get done (just might take slightly longer in total, but everyone's happier).

#### Key Concepts Simplified

**1. Time-Slicing = Working in Chunks**

```javascript
// Before: Cook entire meal in one go (can't pause)
function cookMeal() {
  chopVegetables();    // 200ms
  cookMeat();          // 300ms
  prepareSauce();      // 150ms
  plateDish();         // 100ms
  // Total: 750ms blocking, can't handle VIP
}

// After: Break into chunks, check for VIPs between chunks
function cookMealWithPauses() {
  chopVegetables();         // 5ms chunk
  if (vipArrived) handleVIP();

  cookMeat();               // 5ms chunk
  if (vipArrived) handleVIP();

  prepareSauce();           // 5ms chunk
  if (vipArrived) handleVIP();

  // Continue until meal done, always responsive to VIPs
}
```

**2. Priority Lanes = Different Customer Types**

```javascript
// VIP customer (high priority)
<button onClick={() => setCount(c => c + 1)}>
  Click me  {/* Must respond instantly! */}
</button>

// Regular customer (normal priority)
useEffect(() => {
  fetch('/api/data').then(data => setData(data));  // Can wait
}, []);

// Prep work (low priority)
startTransition(() => {
  setFilteredResults(expensiveFilter(data));  // Do when slow
});
```

**3. useTransition = "This Can Wait" Button**

```javascript
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // VIP: Update input immediately (user is typing!)
    setQuery(value);

    // Regular: Update results when React has time
    startTransition(() => {
      const filtered = data.filter(item => item.name.includes(value));
      setResults(filtered);
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />  {/* Always fast */}
      {isPending && <Spinner />}  {/* Show we're working */}
      <ResultsList results={results} />  {/* May lag slightly */}
    </>
  );
}
```

**What happens:**
- User types "a" → Input shows "a" immediately (20ms)
- React starts filtering in background
- User types "b" → Input shows "ab" immediately, pauses filtering
- React restarts filtering for "ab" (interrupted old work)
- Filtering completes, results update (200ms total, but input never lagged)

**4. useDeferredValue = "Slow Version of This Value"**

```javascript
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);  // Slow version

  // query:         "a"  → "ab" → "abc" (instant updates)
  // deferredQuery: "a"  → "ab" → "abc" (delayed updates, may skip "ab")

  return (
    <>
      <input
        value={query}  {/* Fast, always up-to-date */}
        onChange={e => setQuery(e.target.value)}
      />
      <ExpensiveList query={deferredQuery} />  {/* Slow, but UI responsive */}
    </>
  );
}
```

#### Interview Answer Template

**Question**: "How does React Fiber enable concurrent rendering?"

**Answer structure:**

```
1. HIGH-LEVEL CONCEPT:
"React Fiber enables concurrent rendering by making the rendering process
interruptible. Instead of processing the entire component tree in one
synchronous block, Fiber breaks work into small units and can pause between
them to handle higher-priority updates."

2. TECHNICAL MECHANISM:
"Fiber works through three key mechanisms:

a) Time-slicing: React works in ~5ms chunks, checking between each chunk
   if there's more urgent work to do.

b) Priority lanes: Different updates get different priority levels. User
   input (clicks, typing) gets highest priority, while background data
   updates get lower priority.

c) Double buffering: React maintains two fiber trees—current and
   work-in-progress. This allows React to build a new UI version without
   disrupting what's on screen, then swap them atomically when ready."

3. CONCRETE EXAMPLE:
"For example, imagine a search interface filtering 10,000 products. In
React 17, typing a character would block the UI for 500ms while React
updated the results. With Fiber and useTransition in React 18, the input
field updates immediately (high priority), while the expensive filtering
happens in the background (low priority). If the user types again before
filtering finishes, React pauses the filtering, handles the new keystroke,
then resumes. The UI never freezes."

4. PRACTICAL API:
"We use this through hooks like useTransition and useDeferredValue:

useTransition: You explicitly mark state updates as non-urgent
useDeferredValue: React automatically defers updating a value

Both keep the UI responsive by allowing urgent work to interrupt
non-urgent work."

5. IMPACT:
"This fundamentally changes how React apps feel. Instead of freezing during
complex updates, they stay responsive. On mobile devices or low-end hardware,
the difference is dramatic—apps that felt janky in React 17 feel smooth in
React 18."
```

**Common follow-up**: "What's the difference between useTransition and useDeferredValue?"

```
"Both defer low-priority work, but they give you different control:

useTransition: You control WHEN the deferred work happens. You explicitly
wrap state updates in startTransition(), and you get an isPending flag to
show loading UI. Use this when you know exactly what's expensive and want
to show pending state.

Example: Clicking a filter checkbox—you know filtering is expensive, so you
wrap setFilteredResults in startTransition and show a spinner while isPending.

useDeferredValue: React controls WHEN the value updates. You pass it a
value, and it returns a 'deferred' version that lags behind. React decides
when to update it based on available time. Use this for simpler cases where
you just want a slow version of a value.

Example: Search input—you want the input field fast but the results list can
lag. You defer the query value: deferredQuery = useDeferredValue(query), and
React handles the rest.

Rule of thumb: useTransition for explicit control and pending UI.
useDeferredValue for simpler automatic deferral."
```

**Common mistake to avoid:**

```javascript
// ❌ WRONG: Wrapping everything in useTransition
function App() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      setCount(c => c + 1);  // ❌ Simple counter doesn't need transition
    });
  };
}

// ✅ RIGHT: Only use transitions for expensive work
function App() {
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);  // ✅ Urgent: update UI immediately

    startTransition(() => {
      setResults(expensiveFilter(newFilters));  // ✅ Non-urgent: can lag
    });
  };
}
```

</details>

Transitions add overhead (~5-10ms). Only use them when the work is expensive enough (>50ms) to justify the complexity.
