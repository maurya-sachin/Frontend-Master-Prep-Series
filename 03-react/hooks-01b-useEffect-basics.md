# React Hooks - useEffect

> Master the useEffect hook

---

## Question 1: How does useEffect work and when should you use it?

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
// │ Memory leak incidents: 0                 │
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
