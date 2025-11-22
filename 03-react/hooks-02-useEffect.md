# React useEffect Hook

## Question 1: How does useEffect work and what is its lifecycle?

`useEffect` is React's mechanism for synchronizing components with external systems (APIs, DOM, subscriptions, timers). It runs after React renders your component to the DOM, allowing you to perform side effects without blocking the browser's paint. The effect lifecycle consists of three phases: setup (after render), cleanup (before re-running or unmounting), and dependency checking (determines when to re-run).

The basic signature is `useEffect(setup, dependencies?)`. The setup function runs after the component commits to the screen. If it returns a cleanup function, React calls it before running the effect again or when the component unmounts. The dependencies array controls when the effect re-runs: no array means run after every render, empty array `[]` means run once after initial mount, and `[dep1, dep2]` means run when those dependencies change.

Understanding useEffect's timing is crucial: it runs **after** the browser paints (passive effect), unlike `useLayoutEffect` which runs synchronously before paint. This makes useEffect non-blocking but means you can't use it for DOM measurements that affect layout. React batches multiple effect executions and runs them in the order they were defined in the component.

### 🔍 Deep Dive

**React's Effect Execution Model (Fiber Architecture)**

When React processes a component update, it goes through two main phases: the render phase (pure, interruptible) and the commit phase (synchronous, non-interruptible). Effects are scheduled during the commit phase but executed **after** the commit completes.

Here's the precise execution order:
1. **Render Phase**: React calls your component function, builds the new fiber tree
2. **Commit Phase**: React updates the DOM with changes
3. **Browser Paint**: Browser paints the updated DOM to screen
4. **Passive Effects Phase**: React runs all `useEffect` callbacks (scheduled via `requestIdleCallback` or similar)

This "passive" scheduling is implemented using the `Scheduler` package in React. Effects are queued and flushed after paint, allowing the browser to show visual updates immediately without waiting for potentially slow effect code.

**Cleanup Mechanism Deep Dive**

Cleanup functions are critical for preventing memory leaks. React's cleanup strategy:

```javascript
// React's internal effect processing (simplified)
function commitPassiveEffects(fiber) {
  const effect = fiber.updateQueue.lastEffect;

  if (effect !== null) {
    const firstEffect = effect.next;
    let currentEffect = firstEffect;

    do {
      // 1. Run cleanup from PREVIOUS render (if exists)
      const destroy = currentEffect.destroy;
      if (destroy !== undefined) {
        destroy(); // Call previous cleanup
      }

      // 2. Run new effect setup
      const create = currentEffect.create;
      currentEffect.destroy = create(); // Store new cleanup

      currentEffect = currentEffect.next;
    } while (currentEffect !== firstEffect);
  }
}
```

The cleanup runs **before** the new effect on re-execution, ensuring old subscriptions/timers are cleared before new ones are created. On unmount, all pending cleanups run during the commit phase before the component is removed.

**Dependency Array Comparison Algorithm**

React uses `Object.is()` (strict equality with special NaN handling) to compare dependencies:

```javascript
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false; // Difference found, re-run effect
  }
  return true; // All deps equal, skip effect
}
```

This means:
- **Primitives** (numbers, strings, booleans): compared by value
- **Objects/Arrays**: compared by reference (same object instance)
- **Functions**: compared by reference (recreated every render unless memoized)

**Effect Timing & Scheduling**

React uses a priority-based scheduling system. Effects have lower priority than rendering:

```javascript
// Effect priorities (React 18+)
const priorities = {
  ImmediatePriority: 1,    // Click, input events
  UserBlockingPriority: 2, // User interactions
  NormalPriority: 3,       // Network responses, animations
  LowPriority: 4,          // Data prefetching
  IdlePriority: 5          // Analytics, logging
};

// Effects run at NormalPriority or lower
// Allows React to interrupt effect execution if higher priority work arrives
```

In Concurrent Mode (React 18+), React can interrupt effect execution to handle urgent updates, then resume where it left off. This prevents long-running effects from blocking critical user interactions.

**Fiber Effect List**

Each fiber node maintains an effect list (linked list of side effects):

```javascript
{
  tag: 'FunctionComponent',
  memoizedState: {
    // Effect hook state
    memoizedState: null,
    baseState: null,
    queue: {
      pending: null,
      lastEffect: {
        tag: HookPassive | HookHasEffect, // Passive = useEffect
        create: setupFunction,
        destroy: cleanupFunction,
        deps: [dep1, dep2],
        next: nextEffect
      }
    }
  }
}
```

The `HookHasEffect` flag determines if the effect should run this render cycle. React sets this flag when dependencies change or when it's the initial mount.

### 🐛 Real-World Scenario

**Production Bug: Memory Leak in Chat Application**

**Context**: A real-time chat app using WebSocket connections showed memory usage growing from 50MB to 800MB over 2 hours of usage. Users reported browser slowdowns and eventual crashes. Production monitoring showed 200+ active WebSocket connections from a single user session.

**The Buggy Code**:
```javascript
// ❌ MEMORY LEAK - Missing cleanup
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(`wss://chat.api.com/room/${roomId}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    socket.onopen = () => {
      console.log('Connected to room:', roomId);
    };

    // ❌ NO CLEANUP FUNCTION - Socket never closes!
  }, [roomId]); // Effect re-runs when roomId changes

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </div>
  );
}

// User navigates: Room A → Room B → Room C
// Result: 3 WebSocket connections still active!
// Each old socket still receiving messages, calling setMessages on unmounted components
```

**Debugging Process**:

1. **Chrome DevTools Memory Profiler**:
```
Timeline Recording (30 min session):
- Start: 52MB heap size
- After 10 room changes: 180MB heap size
- After 30 room changes: 620MB heap size
- Detached DOM nodes: 4,800+ (should be 0)
- Listeners: 94 WebSocket listeners (should be 1)
```

2. **React DevTools Profiler**:
```
Component render times:
- ChatRoom initial: 12ms
- After 20 room changes: 340ms (28x slower!)
- Reason: Processing messages from 20+ dead sockets
```

3. **Console Warnings** (React 18 StrictMode):
```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.

Component: ChatRoom
State update: setMessages
```

**The Fix**:
```javascript
// ✅ PROPER CLEANUP
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(`wss://chat.api.com/room/${roomId}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    socket.onopen = () => {
      console.log('Connected to room:', roomId);
    };

    // ✅ CLEANUP: Close socket before roomId changes or unmount
    return () => {
      console.log('Disconnecting from room:', roomId);
      socket.close(); // Closes connection, removes all listeners
    };
  }, [roomId]);

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </div>
  );
}
```

**Results After Fix**:
```
Memory Profile (same 30 min session):
- Steady state: 55-60MB heap size (stable)
- Detached DOM nodes: 0
- Active WebSocket listeners: 1 (current room only)
- ChatRoom render time: Consistent 12-15ms
- User satisfaction: No crashes, smooth navigation
```

**Additional Real-World Patterns**:

**Race Condition in Data Fetching**:
```javascript
// ❌ RACE CONDITION - Fast clicks cause wrong data display
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data)); // ❌ No cleanup, no race protection
  }, [userId]);
  // User clicks: ID 1 → ID 2 → ID 3
  // Fetch responses arrive: ID 3 (50ms) → ID 1 (200ms) → ID 2 (500ms)
  // Final UI shows ID 2 data, but userId prop is ID 3!

  return <div>{user?.name}</div>;
}

// ✅ RACE CONDITION PROTECTED
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false; // Closure variable to track if effect is stale

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) { // Only update if this effect is still current
          setUser(data);
        }
      });

    return () => {
      ignore = true; // Cleanup sets ignore flag for pending fetches
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Even better: Use AbortController
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted'); // Normal, not an error
        }
      });

    return () => controller.abort(); // Cancels in-flight requests
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

**Performance Impact Metrics**:
```
Without AbortController:
- Network requests: 47 (for 10 rapid user switches)
- Data transferred: 2.3MB
- UI flicker: 8 instances (wrong user shown briefly)

With AbortController:
- Network requests: 10 (one per switch, old ones aborted)
- Data transferred: 0.5MB
- UI flicker: 0 instances
```

### ⚖️ Trade-offs

**useEffect vs useLayoutEffect**

| Aspect | useEffect | useLayoutEffect |
|--------|-----------|-----------------|
| **Timing** | After browser paint (async) | Before browser paint (sync) |
| **Blocking** | Non-blocking, doesn't delay visual updates | Blocks painting until complete |
| **Use Case** | Data fetching, subscriptions, logging | DOM measurements, animations, preventing flicker |
| **Performance** | Better: Doesn't delay page updates | Worse: Can cause jank if slow |
| **SSR** | Safe, runs only on client | Warns in SSR, requires suppression |

**When to Use useLayoutEffect**:
```javascript
// ✅ CORRECT: useLayoutEffect for DOM measurements
function Tooltip({ children, content }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    // Measure DOM before browser paints
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    // No visual flicker - tooltip appears in correct position immediately
  }, []);

  return (
    <>
      <button ref={buttonRef}>{children}</button>
      <div style={{ position: 'absolute', left: coords.x, top: coords.y }}>
        {content}
      </div>
    </>
  );
}

// ❌ WRONG: useEffect causes visible flicker
// Tooltip first renders at (0, 0), then jumps to correct position after paint
```

**Dependency Array Strategies**

**1. No Dependencies (Runs Every Render)**:
```javascript
useEffect(() => {
  // ❌ PERFORMANCE KILLER - Runs after every render
  logPageView(window.location.pathname);
}); // Missing dependency array

// Every state change, every parent re-render triggers this effect
// 100 renders = 100 log calls (should be 1)
```

**2. Empty Dependencies `[]` (Runs Once)**:
```javascript
useEffect(() => {
  // ✅ GOOD: Subscribe to global event once
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []); // Only on mount/unmount

// ⚠️ DANGER: Can cause stale closures
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // ❌ Always logs 0! Stale closure
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Empty deps = closure captures initial count (0)

  // Fix: Use functional update
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1); // ✅ Always gets current count
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Safe: No dependencies needed
}
```

**3. Specific Dependencies `[dep1, dep2]`**:
```javascript
useEffect(() => {
  fetchUserData(userId, filters);
}, [userId, filters]); // ❌ 'filters' is object, new reference every render

// Problem: filters = { status: 'active' } recreated every render
// Effect runs constantly even if filter values unchanged

// ✅ Solution 1: Destructure primitive dependencies
useEffect(() => {
  fetchUserData(userId, filters);
}, [userId, filters.status, filters.role]); // Primitives compared by value

// ✅ Solution 2: Memoize the object
const filters = useMemo(() => ({
  status: 'active',
  role: userRole
}), [userRole]); // Only recreate when userRole changes

useEffect(() => {
  fetchUserData(userId, filters);
}, [userId, filters]); // Now stable
```

**Effect Splitting Trade-offs**

**One Giant Effect (Bad)**:
```javascript
// ❌ COUPLING - Unrelated concerns mixed
useEffect(() => {
  // Concern 1: Analytics
  trackPageView(pathname);

  // Concern 2: Data fetching
  fetchUserData(userId);

  // Concern 3: WebSocket
  const socket = connectSocket(roomId);

  return () => {
    socket.disconnect();
  };
}, [pathname, userId, roomId]);
// Any dependency change re-runs ALL concerns (wasteful)
```

**Multiple Focused Effects (Good)**:
```javascript
// ✅ SEPARATION - Each effect has single responsibility
useEffect(() => {
  trackPageView(pathname);
}, [pathname]); // Only re-runs on route change

useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Only re-runs when user changes

useEffect(() => {
  const socket = connectSocket(roomId);
  return () => socket.disconnect();
}, [roomId]); // Only re-runs when room changes

// Performance: 3 separate effects = more granular control
// Readability: Clear what each effect does
// Testing: Easier to test in isolation
```

**Optimization Decision Matrix**:

| Scenario | Strategy | Why |
|----------|----------|-----|
| Expensive computation | Move to `useMemo` | useEffect runs after render, too late |
| Synchronizing props to state | Remove useEffect, use derived state | One less render cycle |
| Event handlers | Don't use useEffect | Effects are for external systems only |
| Data fetching | Use Suspense (React 18+) or libraries | Built-in race condition handling |
| Subscriptions | useEffect with cleanup | Perfect use case |
| Timers | useEffect with cleanup | Standard pattern |
| DOM measurements | useLayoutEffect | Prevent visual flicker |

**ESLint Rule Trade-offs**:

The `exhaustive-deps` rule catches 95% of bugs but has false positives:

```javascript
// Rule helps catch bugs:
useEffect(() => {
  fetchData(userId); // ❌ ESLint: missing 'userId' dependency
}, []); // BUG: Won't refetch when userId changes

// But sometimes you want to ignore it:
useEffect(() => {
  // Only run once on mount, userId intentionally excluded
  initializeApp(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Intentional: initialization only
```

**Trade-off**: Enable the rule (prevents 95% of bugs) but learn when to legitimately disable it (5% of cases).

### 💬 Explain to Junior

**Simple Mental Model**: Think of useEffect as a "synchronization manager" between React and the outside world.

**Restaurant Analogy**:

Imagine React is a restaurant kitchen:
- **Component render**: Chef prepares the dish (your JSX)
- **Browser paint**: Waiter serves the dish to customer
- **useEffect**: After serving, waiter does cleanup (clear table, refill water, take payment)

The waiter doesn't make customers wait while cleaning tables - they serve food immediately, then do cleanup afterward. That's why useEffect is "passive" - it doesn't block the visual update.

**Cleanup Function = Leaving a Party**

When you join a party (component mounts), you might:
- Sign the guest book (subscribe to notifications)
- Get a name tag (set up WebSocket)
- Order drinks (start timers)

When you leave (component unmounts or dependencies change), you should:
- Remove your name from guest book (unsubscribe)
- Return your name tag (close WebSocket)
- Cancel your drink order (clear timers)

The cleanup function is React reminding you to clean up after yourself:

```javascript
useEffect(() => {
  // Join the party
  const subscription = subscribe();

  return () => {
    // Leave the party gracefully
    subscription.unsubscribe();
  };
}, []);
```

**Dependency Array = "When Should I Re-Run?"**

Think of dependencies as triggers:

```javascript
// No array = "Re-run after EVERY render"
useEffect(() => {
  console.log('Every single render!');
}); // Like checking your phone every second

// Empty array = "Run ONCE when component appears"
useEffect(() => {
  console.log('Only when I first show up!');
}, []); // Like reading instructions once

// With dependencies = "Re-run when THESE SPECIFIC things change"
useEffect(() => {
  console.log('Search changed!');
}, [searchTerm]); // Like only searching when user types
```

**Common Beginner Mistakes & Fixes**:

**Mistake 1: Forgetting Cleanup**
```javascript
// ❌ "I started a timer but never stopped it"
useEffect(() => {
  setInterval(() => console.log('tick'), 1000);
}, []); // Memory leak! Timer runs forever

// ✅ "I clean up my timer when done"
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id); // Stop timer on unmount
}, []);
```

**Mistake 2: Infinite Loop**
```javascript
// ❌ "I keep triggering myself"
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1); // Changes count...
}); // No dependency array, so runs after every render...
    // Which triggers another render... infinite loop!

// ✅ "I only run when needed"
useEffect(() => {
  // Only run once on mount
  setCount(1);
}, []); // Runs once, stops
```

**Mistake 3: Stale Closures**
```javascript
// ❌ "I'm stuck in the past"
const [count, setCount] = useState(0);

useEffect(() => {
  setTimeout(() => {
    console.log(count); // Always prints 0!
  }, 3000);
}, []); // Empty deps = captures initial count (0)

// ✅ "I always get fresh values"
useEffect(() => {
  setTimeout(() => {
    setCount(c => c + 1); // Callback form gets current value
  }, 3000);
}, []);
```

**Interview Answer Template**:

**Question**: "What is useEffect and when do you use it?"

**Good Answer Structure**:
1. **Definition**: "useEffect synchronizes components with external systems like APIs, subscriptions, or the DOM. It runs after React renders, allowing side effects without blocking the UI."

2. **Key Concepts**: "It has three parts: the effect function that runs after render, an optional cleanup function for cleanup logic, and a dependency array that controls when the effect re-runs."

3. **Example**: "For instance, fetching user data when an ID changes:
```javascript
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // Re-fetch only when userId changes
```

4. **Cleanup Example**: "For subscriptions, cleanup prevents memory leaks:
```javascript
useEffect(() => {
  const sub = subscribe(topic);
  return () => sub.unsubscribe(); // Cleanup
}, [topic]);
```

5. **Common Pitfalls**: "The most common mistakes are forgetting cleanup (memory leaks), creating infinite loops by modifying dependencies without proper guards, and race conditions in async operations. Using AbortController for fetch requests and the 'ignore' flag pattern prevents these issues."

**Key Points to Remember**:
- ✅ useEffect runs **after** browser paints (non-blocking)
- ✅ Cleanup runs **before** the next effect and on unmount
- ✅ Dependencies are compared with `Object.is()` (reference equality for objects)
- ✅ Empty `[]` = run once, no `[]` = run every render
- ✅ Always clean up subscriptions, timers, event listeners
- ✅ Use AbortController for fetch requests to prevent race conditions

---

## Question 2: What are common useEffect mistakes and how to avoid them?

The most common useEffect mistakes are: infinite loops (caused by missing or incorrect dependencies), memory leaks (missing cleanup functions), stale closures (capturing old values), race conditions (async operations completing out of order), and unnecessary re-executions (not optimizing dependencies). These mistakes often manifest as performance issues, incorrect UI states, or browser crashes in production.

Infinite loops typically occur when an effect modifies a dependency without proper guards, causing it to re-trigger itself endlessly. Memory leaks happen when subscriptions, timers, or event listeners aren't cleaned up, causing them to accumulate with each render. Stale closures capture old variable values in effects with empty dependency arrays, leading to incorrect behavior. Race conditions occur when async operations (like fetch) complete in different order than initiated, displaying wrong data. Understanding these patterns and their solutions is essential for building reliable React applications.

### 🔍 Deep Dive

**Mistake 1: Infinite Loop Patterns**

Infinite loops occur when effect execution causes a re-render that triggers the effect again. React has no built-in protection against this - it will keep looping until the browser crashes or React's error boundary catches too many updates.

**Pattern A: Object/Array Dependencies**
```javascript
// ❌ INFINITE LOOP: Object recreated every render
function UserList() {
  const [users, setUsers] = useState([]);
  const filters = { status: 'active' }; // New object every render!

  useEffect(() => {
    fetchUsers(filters).then(setUsers);
  }, [filters]); // filters reference changes every render

  // Execution flow:
  // 1. Component renders, creates new filters object
  // 2. Effect runs (filters dependency changed)
  // 3. setUsers triggers re-render
  // 4. New filters object created (different reference)
  // 5. Effect runs again... infinite loop!

  return <div>{users.length} users</div>;
}

// ✅ FIX 1: Move object outside component
const FILTERS = { status: 'active' }; // Same reference every render

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers(FILTERS).then(setUsers);
  }, []); // Stable reference, runs once

  return <div>{users.length} users</div>;
}

// ✅ FIX 2: useMemo for dynamic objects
function UserList({ role }) {
  const [users, setUsers] = useState([]);

  const filters = useMemo(() => ({
    status: 'active',
    role: role
  }), [role]); // Only recreate when role changes

  useEffect(() => {
    fetchUsers(filters).then(setUsers);
  }, [filters]); // Stable reference until role changes

  return <div>{users.length} users</div>;
}

// ✅ FIX 3: Inline primitive dependencies
function UserList({ role }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const filters = { status: 'active', role }; // Create inside effect
    fetchUsers(filters).then(setUsers);
  }, [role]); // Only depend on primitive

  return <div>{users.length} users</div>;
}
```

**Pattern B: setState in Effect Body**
```javascript
// ❌ INFINITE LOOP: Updates state without dependency guard
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // Changes count...
  }, [count]); // ...which triggers effect... which changes count...

  // React error after ~50 iterations:
  // "Maximum update depth exceeded. This can happen when a component
  // calls setState inside useEffect, but useEffect either doesn't
  // have a dependency array, or one of the dependencies changes on every render."

  return <div>{count}</div>;
}

// ✅ FIX: Add condition or remove from dependencies
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < 10) { // Guard condition
      setCount(count + 1);
    }
  }, [count]); // Will stop at 10

  return <div>{count}</div>;
}

// ✅ BETTER: Use functional update, remove dependency
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // No dependency on count needed
    }, 1000);
    return () => clearInterval(id);
  }, []); // Runs once

  return <div>{count}</div>;
}
```

**React's Loop Detection**:

React tracks the number of nested updates and throws an error after 50:

```javascript
// React internals (simplified)
let nestedUpdateCount = 0;
const NESTED_UPDATE_LIMIT = 50;

function scheduleUpdateOnFiber(fiber) {
  if (fiber === workInProgressRoot) {
    nestedUpdateCount++;
    if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
      nestedUpdateCount = 0;
      throw new Error('Maximum update depth exceeded...');
    }
  }
}
```

**Mistake 2: Memory Leak Patterns**

Memory leaks occur when resources aren't released, causing memory usage to grow unbounded.

**Pattern A: Event Listeners**
```javascript
// ❌ MEMORY LEAK: Listeners never removed
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // ❌ No cleanup! Listener persists after unmount
  }, []);

  return <div>Width: {width}</div>;
}

// Memory impact over time:
// After 100 mount/unmount cycles: 100 resize listeners registered
// Each listener holds reference to component closure
// Garbage collector can't free old component instances
// Heap size: 50MB → 200MB over 1 hour

// ✅ FIX: Remove listener in cleanup
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Width: {width}</div>;
}
```

**Pattern B: Subscriptions**
```javascript
// ❌ MEMORY LEAK: Subscription never unsubscribed
function StockPrice({ symbol }) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const subscription = stockAPI.subscribe(symbol, setPrice);
    // ❌ No cleanup! Old subscriptions remain active
  }, [symbol]);

  // User switches: AAPL → GOOGL → MSFT → TSLA
  // Result: 4 active subscriptions, all calling setPrice
  // Each subscription uses WebSocket connection
  // Network tab: 4 WS connections (should be 1)

  return <div>{symbol}: ${price}</div>;
}

// ✅ FIX: Unsubscribe in cleanup
function StockPrice({ symbol }) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const subscription = stockAPI.subscribe(symbol, setPrice);
    return () => subscription.unsubscribe(); // Clean up old subscription
  }, [symbol]);

  return <div>{symbol}: ${price}</div>;
}
```

**Pattern C: Timers**
```javascript
// ❌ MEMORY LEAK: Timers accumulate
function AutoRefresh({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData);
    }, 5000);
    // ❌ No cleanup! Timer runs forever
  }, [url]);

  // Component unmounts but timer continues
  // Still making fetch calls to old URL
  // Still trying to call setData (React warning in console)

  return <div>{data?.title}</div>;
}

// ✅ FIX: Clear timer in cleanup
function AutoRefresh({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData);
    }, 5000);
    return () => clearInterval(id); // Stop timer
  }, [url]);

  return <div>{data?.title}</div>;
}
```

**Detecting Memory Leaks**:

Use Chrome DevTools to identify leaks:

```bash
# 1. Take heap snapshot before mounting component
# 2. Mount/unmount component 10 times
# 3. Force garbage collection (trash icon in DevTools)
# 4. Take another heap snapshot
# 5. Compare snapshots

# Healthy component: Snapshot 2 ≈ Snapshot 1 (same memory)
# Leaking component: Snapshot 2 >> Snapshot 1 (growing memory)

# Look for:
# - Detached DOM nodes (should be 0)
# - Event listeners (should match active components)
# - Timers/intervals (should be cleared)
```

**Mistake 3: Stale Closure Patterns**

Stale closures capture old values when effects don't list all dependencies.

**Pattern A: Stale State in Callbacks**
```javascript
// ❌ STALE CLOSURE: Captures initial count
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Always logs 0!
      setCount(count + 1); // Always sets to 0 + 1 = 1
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty deps = closure captures initial render (count = 0)

  // Click increments count to 5
  // But interval still uses count = 0 from first render
  // State stuck at 1

  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

// ✅ FIX 1: Use functional update (best)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1); // Callback gets current value
    }, 1000);
    return () => clearInterval(id);
  }, []); // No dependency on count needed

  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

// ✅ FIX 2: Include dependency (creates new interval each time)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Current count
      setCount(count + 1); // Current count + 1
    }, 1000);
    return () => clearInterval(id); // Clear old interval
  }, [count]); // Re-create interval when count changes

  // Trade-off: Interval resets on every count change
  // If interval is 10s, clicking resets the 10s timer

  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

**Pattern B: Stale Props in Event Handlers**
```javascript
// ❌ STALE CLOSURE: Captures initial userId
function ChatRoom({ userId, roomId }) {
  useEffect(() => {
    const handleMessage = (msg) => {
      console.log(`User ${userId} received: ${msg}`);
      // ❌ userId is stale if prop changed
    };

    socket.on('message', handleMessage);
    return () => socket.off('message', handleMessage);
  }, [roomId]); // Missing userId dependency!

  // userId changes: 123 → 456
  // But handleMessage still uses userId = 123
  // Logs "User 123 received..." even though current user is 456

  return <div>Chat Room {roomId}</div>;
}

// ✅ FIX: Include all captured variables
function ChatRoom({ userId, roomId }) {
  useEffect(() => {
    const handleMessage = (msg) => {
      console.log(`User ${userId} received: ${msg}`);
    };

    socket.on('message', handleMessage);
    return () => socket.off('message', handleMessage);
  }, [roomId, userId]); // Both dependencies listed

  return <div>Chat Room {roomId}</div>;
}
```

**ESLint exhaustive-deps Rule**:

The `react-hooks/exhaustive-deps` ESLint rule catches stale closures automatically:

```javascript
// ESLint warning:
// React Hook useEffect has a missing dependency: 'userId'.
// Either include it or remove the dependency array.

// Options:
// 1. Add the dependency (usually correct)
// 2. Use functional updates (removes dependency)
// 3. Disable rule with comment (rarely correct)

useEffect(() => {
  doSomething(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only disable if you truly understand the trade-off
```

**Mistake 4: Race Condition Patterns**

Race conditions occur when async operations complete in unexpected order.

**Pattern A: Fast Navigation**
```javascript
// ❌ RACE CONDITION: Wrong user data displayed
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => setUser(data)); // ❌ No race protection
  }, [userId]);

  // User clicks rapidly: ID 1 → ID 2 → ID 3
  // Network responses (varying latency):
  // - ID 3 request: 50ms response time
  // - ID 1 request: 200ms response time
  // - ID 2 request: 500ms response time
  //
  // Timeline:
  // 0ms: Click ID 1, fetch starts
  // 10ms: Click ID 2, fetch starts
  // 20ms: Click ID 3, fetch starts
  // 70ms: ID 3 response arrives, setUser(user3) ✅
  // 220ms: ID 1 response arrives, setUser(user1) ❌ WRONG!
  // 520ms: ID 2 response arrives, setUser(user2) ❌ WRONG!
  //
  // Final state: UI shows user2 data, but userId prop is 3

  return <div>{user?.name}</div>;
}

// ✅ FIX 1: Ignore flag pattern
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false; // Closure variable

    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!ignore) { // Only update if this effect is still current
          setUser(data);
        }
      });

    return () => {
      ignore = true; // Mark this effect as stale
    };
  }, [userId]);

  // Timeline with cleanup:
  // 0ms: Click ID 1, fetch starts, ignore1 = false
  // 10ms: Click ID 2, cleanup sets ignore1 = true, fetch2 starts, ignore2 = false
  // 20ms: Click ID 3, cleanup sets ignore2 = true, fetch3 starts, ignore3 = false
  // 70ms: ID 3 response, ignore3 = false, setUser(user3) ✅
  // 220ms: ID 1 response, ignore1 = true, no update ✅
  // 520ms: ID 2 response, ignore2 = true, no update ✅

  return <div>{user?.name}</div>;
}

// ✅ FIX 2: AbortController (best for fetch)
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/users/${userId}`, {
      signal: controller.signal // Link fetch to controller
    })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted'); // Normal, not an error
        } else {
          console.error('Fetch failed:', err);
        }
      });

    return () => {
      controller.abort(); // Cancel in-flight request
    };
  }, [userId]);

  // AbortController cancels network request early
  // Saves bandwidth and CPU
  // Browser devtools shows cancelled requests (greyed out)

  return <div>{user?.name}</div>;
}
```

**Mistake 5: Unnecessary Re-executions**

Running effects too frequently wastes CPU and causes performance issues.

**Pattern A: Function Dependencies**
```javascript
// ❌ RUNS EVERY RENDER: Function recreated each time
function SearchResults({ initialQuery }) {
  const [results, setResults] = useState([]);

  const performSearch = (query) => { // New function every render!
    return fetch(`/api/search?q=${query}`).then(r => r.json());
  };

  useEffect(() => {
    performSearch(initialQuery).then(setResults);
  }, [performSearch]); // performSearch changes every render

  // Even if initialQuery doesn't change, effect runs on every render
  // Parent re-renders → new performSearch → effect runs → fetch

  return <div>{results.length} results</div>;
}

// ✅ FIX 1: useCallback to memoize function
function SearchResults({ initialQuery }) {
  const [results, setResults] = useState([]);

  const performSearch = useCallback((query) => {
    return fetch(`/api/search?q=${query}`).then(r => r.json());
  }, []); // Function only created once

  useEffect(() => {
    performSearch(initialQuery).then(setResults);
  }, [performSearch, initialQuery]); // Stable references

  return <div>{results.length} results</div>;
}

// ✅ FIX 2: Move function inside effect (best if only used there)
function SearchResults({ initialQuery }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const performSearch = (query) => { // Defined inside, no dependency
      return fetch(`/api/search?q=${query}`).then(r => r.json());
    };

    performSearch(initialQuery).then(setResults);
  }, [initialQuery]); // Only initialQuery as dependency

  return <div>{results.length} results</div>;
}
```

### 🐛 Real-World Scenario

**Production Bug: Infinite Loop Crashes E-commerce Site**

**Context**: A product listing page with filters crashed user browsers after 2-3 seconds. The page worked fine in development but failed in production under real traffic. Error monitoring showed: "Maximum update depth exceeded" affecting 40% of users, average 15 crashes per minute during peak hours.

**The Buggy Code**:
```javascript
// ❌ INFINITE LOOP - Multiple compound mistakes
function ProductList({ category }) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    inStock: true,
    sortBy: 'popular'
  });

  // Mistake 1: Object dependency recreated every render
  const searchParams = {
    category,
    ...filters, // New object every render
    timestamp: Date.now() // Always different!
  };

  // Mistake 2: Effect updates state that's in dependencies
  useEffect(() => {
    fetch(`/api/products`, {
      method: 'POST',
      body: JSON.stringify(searchParams)
    })
      .then(r => r.json())
      .then(data => {
        setProducts(data.products);

        // Mistake 3: Updating filters in effect
        if (data.suggestedFilters) {
          setFilters(data.suggestedFilters); // Changes filters state!
        }
      });
  }, [searchParams, filters]); // Both are unstable references

  // Execution flow:
  // 1. Component renders, creates new searchParams object
  // 2. Effect runs (searchParams changed)
  // 3. Fetch completes, setProducts + setFilters
  // 4. Component re-renders (state changed)
  // 5. New searchParams object created (different timestamp!)
  // 6. Effect runs again... INFINITE LOOP

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  );
}
```

**Production Impact**:
```
Error Monitoring Dashboard:
- Error rate: 15 errors/min (peak hours)
- Affected users: 40% of traffic
- Browser crashes: 60% of errors led to tab crashes
- Network requests: 800+ fetch calls in 2 seconds (before crash)
- Server load: 300% spike, API rate limiting triggered
- Revenue impact: $12,000 lost sales in 1 hour

Chrome DevTools (user's browser):
- Memory: 80MB → 2.4GB in 2 seconds
- Network tab: 847 identical requests
- CPU: 100% (all cores maxed out)
- Console: 50+ "Maximum update depth exceeded" errors
```

**Debugging Process**:

1. **React DevTools Profiler**:
```
Profiler Recording (2 seconds before crash):
- ProductList rendered: 847 times
- Render duration: 12ms → 340ms (28x increase)
- Reason for update: "State changed" (847 times)
- useEffect executed: 847 times

Component tree:
  ProductList (847 renders) ❌
    ├─ FilterBar (847 renders)
    ├─ ProductCard × 24 (20,328 total renders!)
    └─ Pagination (847 renders)
```

2. **Network Waterfall**:
```
Request timeline:
0ms: /api/products (pending)
50ms: /api/products (pending) - Duplicate!
100ms: /api/products (pending) - Duplicate!
...
2000ms: 847 requests in flight

Server logs:
[WARN] Rate limit exceeded for IP 192.168.1.100
[ERROR] Database connection pool exhausted (500/500 connections)
[CRITICAL] API server CPU 98%
```

3. **Root Cause Analysis**:
```javascript
// Log searchParams on each render
console.log('searchParams:', searchParams);

// Output (each line is a new render):
// searchParams: { category: 'electronics', timestamp: 1699876543210 }
// searchParams: { category: 'electronics', timestamp: 1699876543220 } ← Different!
// searchParams: { category: 'electronics', timestamp: 1699876543230 } ← Different!
// ... (repeats 847 times)

// Reason: Date.now() creates a new timestamp every render
// New timestamp → new object → new reference → effect re-runs
```

**The Complete Fix**:
```javascript
// ✅ FIXED - All mistakes corrected
function ProductList({ category }) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    inStock: true,
    sortBy: 'popular'
  });

  // Fix 1: Separate effect for suggested filters
  const [suggestedFilters, setSuggestedFilters] = useState(null);

  // Fix 2: Memoize searchParams with stable dependencies
  const searchParams = useMemo(() => ({
    category,
    priceRange: filters.priceRange.join('-'), // Primitive
    inStock: filters.inStock,
    sortBy: filters.sortBy
    // ✅ Removed timestamp - not needed for search
  }), [
    category,
    filters.priceRange.join('-'), // Stable string
    filters.inStock,
    filters.sortBy
  ]);

  // Fix 3: Fetch effect - only updates products
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/products`, {
      method: 'POST',
      body: JSON.stringify(searchParams),
      signal: controller.signal
    })
      .then(r => r.json())
      .then(data => {
        setProducts(data.products);
        // ✅ Store suggestions separately, don't apply automatically
        if (data.suggestedFilters) {
          setSuggestedFilters(data.suggestedFilters);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch failed:', err);
        }
      });

    return () => controller.abort();
  }, [searchParams]); // Only re-run when search params actually change

  // Fix 4: Separate handler for applying suggested filters
  const applySuggestedFilters = () => {
    if (suggestedFilters) {
      setFilters(suggestedFilters); // User-triggered, not automatic
    }
  };

  return (
    <div>
      {suggestedFilters && (
        <button onClick={applySuggestedFilters}>
          Apply suggested filters
        </button>
      )}
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  );
}
```

**Results After Fix**:
```
Production Metrics (same traffic load):
- Error rate: 0 errors/min ✅
- ProductList renders per session: 3-5 (down from 847)
- Network requests: 1 per filter change (down from 847)
- Server CPU: 12% (down from 98%)
- Memory per tab: 60-80MB stable (down from 2.4GB crash)
- Revenue: $0 lost (down from $12k/hour)

User Experience:
- Page load time: 1.2s (previously crashed)
- Filter interaction: Instant (<50ms)
- Browser crashes: 0 (down from 60% of users)
```

**Additional Real-World Patterns**:

**Memory Leak in Analytics**:
```javascript
// ❌ LEAK: Event listener on every route change
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const trackScroll = () => {
      analytics.track('scroll', {
        page: location.pathname,
        depth: window.scrollY
      });
    };

    window.addEventListener('scroll', trackScroll);
    // ❌ No cleanup! New listener on every route change
  }, [location.pathname]);

  // After visiting 50 pages: 50 scroll listeners registered
  // Every scroll fires 50 analytics events
  // Analytics quota exceeded, billing spike

  return null;
}

// ✅ FIXED: Proper cleanup
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const trackScroll = () => {
      analytics.track('scroll', {
        page: location.pathname,
        depth: window.scrollY
      });
    };

    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, [location.pathname]);

  return null;
}
```

**Race Condition in Form Auto-save**:
```javascript
// ❌ RACE CONDITION: Saves arrive out of order
function AutoSaveForm() {
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    const saveData = async () => {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]); // Triggers on every keystroke (after 1s debounce)

  // User types: "Hello" quickly
  // Character by character: H → He → Hel → Hell → Hello
  //
  // Timeline:
  // 0ms: Type "H", schedule save
  // 100ms: Type "e", cancel previous, schedule save
  // 200ms: Type "l", cancel previous, schedule save
  // 300ms: Type "l", cancel previous, schedule save
  // 400ms: Type "o", cancel previous, schedule save
  // 1400ms: Save "Hello" starts (500ms latency)
  //
  // User quickly changes to "Hi":
  // 1500ms: Delete "llo", type "i" → "Hi"
  // 1900ms: Save "Hello" completes ← Old data!
  // 2500ms: Save "Hi" starts
  // 3000ms: Save "Hi" completes
  //
  // Server has: "Hello" as latest (wrong!)
  // User sees: "Hi" (correct)
  // Data loss on page reload!

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
    </form>
  );
}

// ✅ FIXED: Abort stale requests
function AutoSaveForm() {
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    const controller = new AbortController();

    const saveData = async () => {
      try {
        await fetch('/api/save', {
          method: 'POST',
          body: JSON.stringify(formData),
          signal: controller.signal // Abort stale saves
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Save failed:', err);
        }
      }
    };

    const timeoutId = setTimeout(saveData, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort(); // Cancel in-flight save if formData changes
    };
  }, [formData]);

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
    </form>
  );
}
```

### ⚖️ Trade-offs

**Dependency Array Strategies**

**Strategy 1: Include Everything (ESLint Default)**

```javascript
// ✅ Safest: All captured variables listed
function Component({ userId, filters }) {
  const [data, setData] = useState(null);
  const apiKey = useContext(ApiContext);

  useEffect(() => {
    fetchData(userId, filters, apiKey).then(setData);
  }, [userId, filters, apiKey]); // All dependencies listed

  // Pros:
  // - No stale closures
  // - ESLint happy
  // - Predictable behavior

  // Cons:
  // - Re-runs when filters object reference changes (even if values same)
  // - Need to memoize objects/functions
  // - More re-executions = potential performance cost
}
```

**Strategy 2: Primitive Dependencies Only**

```javascript
// ✅ Optimized: Extract primitives from objects
function Component({ userId, filters }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const filterObj = {
      status: filters.status,
      category: filters.category
    };
    fetchData(userId, filterObj).then(setData);
  }, [userId, filters.status, filters.category]); // Primitives only

  // Pros:
  // - Fewer re-executions (primitives compared by value)
  // - No need for useMemo on filters
  // - Better performance

  // Cons:
  // - More verbose
  // - Need to maintain list of filter properties
  // - If filters adds new property, might forget to add to deps
}
```

**Strategy 3: Functional Updates (Remove Dependencies)**

```javascript
// ✅ Elegant: Use functional updates to avoid dependencies
function Component({ userId }) {
  const [data, setData] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Instead of: setCount(count + 1)  [needs count in deps]
      setCount(c => c + 1); // ✅ No dependency on count
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty deps, runs once

  useEffect(() => {
    fetchData(userId).then(newData => {
      setData(oldData => {
        // Functional update can access both old and new
        return { ...oldData, ...newData };
      });
    });
  }, [userId]); // Only userId, not data

  // Pros:
  // - Fewer dependencies
  // - More stable effects
  // - Less re-execution overhead

  // Cons:
  // - Can't access current state value for logging/conditions
  // - Less explicit about what values are used
}
```

**Cleanup Timing Trade-offs**

**Pattern A: Cleanup Before New Effect**
```javascript
// Default React behavior
useEffect(() => {
  const subscription = subscribe(topic);
  return () => subscription.unsubscribe(); // Runs BEFORE next effect
}, [topic]);

// Timeline when topic changes:
// 1. User changes topic: "news" → "sports"
// 2. Cleanup runs: unsubscribe("news")
// 3. New effect runs: subscribe("sports")
//
// Pros:
// - No overlap (never two subscriptions active)
// - Prevents resource waste
// - Clean state transitions
//
// Cons:
// - Brief moment with no subscription (gap in data)
// - Can't compare old vs new values in cleanup
```

**Pattern B: Overlap Subscriptions (Manual)**
```javascript
// Custom pattern to maintain continuity
function Component({ topic }) {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const newSubscription = subscribe(topic);

    // Keep old subscription until new one is ready
    newSubscription.on('ready', () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe(); // Cleanup old
      }
      subscriptionRef.current = newSubscription; // Switch to new
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [topic]);

  // Timeline:
  // 1. User changes topic: "news" → "sports"
  // 2. New effect: subscribe("sports") starts
  // 3. Subscribe("sports") becomes ready
  // 4. Cleanup: unsubscribe("news")
  // 5. Switch to "sports" subscription
  //
  // Pros:
  // - No gap in data (continuous stream)
  // - Smooth transitions
  // - Good UX
  //
  // Cons:
  // - Two subscriptions briefly active (resource overhead)
  // - More complex code
  // - Harder to reason about state
}
```

**Effect Granularity Trade-offs**

**Monolithic Effect (One Big Effect)**:
```javascript
// ❌ Generally bad: Multiple concerns in one effect
useEffect(() => {
  // Concern 1: Analytics
  analytics.track('page_view', pathname);

  // Concern 2: Data fetching
  fetchUser(userId).then(setUser);

  // Concern 3: WebSocket
  const socket = connectSocket(roomId);

  // Concern 4: Scroll restoration
  window.scrollTo(0, scrollPosition);

  return () => {
    socket.disconnect();
  };
}, [pathname, userId, roomId, scrollPosition]);

// Cons:
// - ANY dependency change re-runs ALL logic
// - Changing pathname triggers socket disconnect/reconnect (wasteful)
// - Changing roomId triggers analytics event (wrong)
// - Hard to test individual concerns
// - Cleanup applies to only one concern (socket)
//
// Pros:
// - Fewer effect declarations
// - All logic in one place (debatable if this is good)
```

**Granular Effects (Multiple Small Effects)**:
```javascript
// ✅ Better: Separate effects for separate concerns
useEffect(() => {
  analytics.track('page_view', pathname);
}, [pathname]); // Only re-runs on route change

useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // Only re-runs when user changes

useEffect(() => {
  const socket = connectSocket(roomId);
  return () => socket.disconnect();
}, [roomId]); // Only re-runs when room changes

useEffect(() => {
  window.scrollTo(0, scrollPosition);
}, [scrollPosition]); // Only re-runs when scroll position changes

// Pros:
// - Each effect runs only when relevant dependencies change
// - Easy to test in isolation
// - Clear separation of concerns
// - Each cleanup tied to specific resource
// - Better performance (less wasted re-execution)
//
// Cons:
// - More lines of code
// - Multiple effect declarations
```

**Decision Matrix**:

| Use Case | Strategy | Reasoning |
|----------|----------|-----------|
| Data fetching | AbortController + ignore flag | Prevents race conditions |
| Subscriptions | Separate effect with cleanup | Clean resource management |
| Event listeners | Separate effect with cleanup | One listener per effect |
| Timers | Functional updates | Avoid stale closures |
| Analytics | Primitive dependencies | Avoid object comparison issues |
| Multiple concerns | Split into separate effects | Granular control |
| Expensive operations | useMemo for dependencies | Reduce re-executions |
| Derived state | Remove useEffect, use render | One less render cycle |

**ESLint Rule Configuration Trade-offs**:

```javascript
// Option 1: Strict (recommended for most teams)
{
  "rules": {
    "react-hooks/exhaustive-deps": "error" // Fails build on violations
  }
}
// Pros: Catches 95% of bugs, enforces best practices
// Cons: Sometimes requires workarounds (useMemo, useCallback)

// Option 2: Warning (for gradual migration)
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn" // Shows warning, doesn't fail
  }
}
// Pros: Doesn't block development, educates developers
// Cons: Warnings often ignored, bugs slip through

// Option 3: Off (not recommended)
{
  "rules": {
    "react-hooks/exhaustive-deps": "off" // No checking
  }
}
// Pros: Maximum flexibility
// Cons: High bug rate, stale closures everywhere
```

### 💬 Explain to Junior

**Simple Mental Model**: Think of useEffect mistakes like forgetting to turn off lights or lock doors when you leave.

**Common Mistakes Explained**:

**1. Infinite Loop = Chasing Your Own Tail**

Imagine a dog chasing its tail:
- Dog sees tail → chases it
- Chasing makes tail move
- Tail moved → chase it again
- Infinite loop!

In React:
```javascript
// ❌ Dog chasing tail
useEffect(() => {
  setCount(count + 1); // Makes count change
}, [count]); // Which triggers effect again

// ✅ Dog stops chasing
useEffect(() => {
  setCount(1); // Set once
}, []); // Don't re-run
```

**2. Memory Leak = Leaving the Tap Running**

When you leave home, you turn off the tap. If you don't, water keeps running and your bill skyrockets.

In React:
```javascript
// ❌ Leaving tap running
useEffect(() => {
  const interval = setInterval(() => tick(), 1000);
  // Forgot to turn off! Timer runs forever
}, []);

// ✅ Turn off tap when leaving
useEffect(() => {
  const interval = setInterval(() => tick(), 1000);
  return () => clearInterval(interval); // Turn off timer
}, []);
```

**3. Stale Closure = Using Old Shopping List**

You write a shopping list (buy milk, bread). Your spouse updates it (add eggs). But you use your old photo of the list - you miss the eggs!

In React:
```javascript
// ❌ Using old list
const [items, setItems] = useState(['milk', 'bread']);

useEffect(() => {
  setTimeout(() => {
    console.log(items); // Old list: ['milk', 'bread']
  }, 3000);
}, []); // Empty deps = captured initial items

// Meanwhile, items updated to ['milk', 'bread', 'eggs']
// But timer still uses old list!

// ✅ Always check current list
useEffect(() => {
  setTimeout(() => {
    console.log(items); // Current list
  }, 3000);
}, [items]); // Re-create timer when items change
```

**4. Race Condition = Pizza Delivery Mix-up**

You order Pizza A, then quickly change to Pizza B. But Pizza A arrives last and you eat it thinking it's Pizza B.

In React:
```javascript
// ❌ Pizza mix-up
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => setUser(data)); // Whatever arrives last wins
  }, [userId]);

  // Click user 1 → user 2 → user 3
  // If responses arrive: 3, 1, 2
  // Final UI shows user 2 (wrong! should be 3)
}

// ✅ Cancel old orders
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false; // Flag for "is this order still valid?"

    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!ignore) { // Only use if order still valid
          setUser(data);
        }
      });

    return () => {
      ignore = true; // Cancel this order
    };
  }, [userId]);
}
```

**Interview Answer Template**:

**Question**: "What are common useEffect mistakes and how do you avoid them?"

**Good Answer Structure**:

1. **List Main Mistakes**:
"The most common useEffect mistakes are infinite loops, memory leaks, stale closures, and race conditions. Each has distinct symptoms and solutions."

2. **Explain Infinite Loops**:
"Infinite loops occur when an effect modifies a dependency, triggering itself repeatedly. For example:
```javascript
useEffect(() => {
  setCount(count + 1);
}, [count]); // Changes count, which re-triggers effect
```
The fix is either adding a guard condition or using functional updates: `setCount(c => c + 1)` with empty deps."

3. **Explain Memory Leaks**:
"Memory leaks happen when effects create resources (timers, subscriptions, listeners) but don't clean them up. The cleanup function prevents this:
```javascript
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // Cleanup
}, []);
```
Without cleanup, old timers continue running even after the component unmounts."

4. **Explain Race Conditions**:
"Race conditions occur when async operations complete out of order. For example, fetching user data while rapidly switching users can display the wrong user. The solution is using an ignore flag or AbortController:
```javascript
useEffect(() => {
  let ignore = false;
  fetch(url).then(data => {
    if (!ignore) setData(data);
  });
  return () => { ignore = true; };
}, [url]);
```

5. **Preventive Measures**:
"To avoid these mistakes: enable the `exhaustive-deps` ESLint rule, always write cleanup functions for resources, use AbortController for fetch requests, prefer functional updates to avoid stale closures, and split effects by concern for better granularity."

**Key Points to Remember**:
- ✅ Infinite loop = effect triggers itself (add guards or functional updates)
- ✅ Memory leak = missing cleanup (always clean up resources)
- ✅ Stale closure = old values captured (include deps or use functional updates)
- ✅ Race condition = async completion order (use ignore flag or AbortController)
- ✅ ESLint exhaustive-deps = your best friend (catches most bugs)
- ✅ Cleanup function = essential for subscriptions, timers, listeners
- ✅ Split effects by concern = better performance and readability

**Debugging Checklist**:
1. Effect running too often? → Check dependencies (are objects/arrays recreated?)
2. Memory growing? → Check cleanup (are resources being released?)
3. Seeing old values? → Check closures (are all used values in deps?)
4. Wrong data displayed? → Check race conditions (is latest request winning?)
5. Component laggy? → Check effect count (too many effects or re-executions?)
