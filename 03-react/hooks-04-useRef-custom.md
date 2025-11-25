# React Hooks - Advanced useRef and Custom Hooks with Refs

> Advanced patterns combining useRef with custom hooks

---

## Question 1: How do you create production-ready custom hooks that use useRef?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Uber

### Question
Explain how to build custom hooks that leverage useRef for non-reactive state management, DOM manipulation, and performance optimization. What are the common patterns and pitfalls?

### Answer

Custom hooks using `useRef` solve critical problems where state updates would cause unnecessary re-renders or where you need to maintain stable references across renders. The key principle is using refs for values that need persistence but shouldn't trigger UI updates.

**Core Patterns:**

1. **Previous Value Tracking**: Store previous props/state for comparison
2. **Mutable Callbacks**: Maintain latest callback without changing reference
3. **Instance Variables**: Store component-scoped values like timers, subscriptions
4. **DOM Measurements**: Access and measure DOM elements
5. **Cleanup Coordination**: Track cleanup state across async operations

**Common Use Cases:**

- `usePrevious(value)`: Track previous value for change detection
- `useInterval(callback, delay)`: Manage intervals with auto-cleanup
- `useDebounce(value, delay)`: Delay updates using refs for timing
- `useEventListener(event, handler, element)`: Add/remove listeners safely
- `useIntersectionObserver(ref, options)`: Detect element visibility
- `useMeasure()`: Measure element dimensions with ResizeObserver

**Key Implementation Principles:**

**Ref for Mutable Values**: Store timer IDs, WebSocket connections, or any value that changes but doesn't affect rendering. Mutating ref.current doesn't schedule re-renders.

**Ref Callbacks for Latest Values**: When callbacks depend on props/state, store them in refs to avoid stale closures in effects with empty dependencies.

**Cleanup Flags**: Use boolean refs to track if component is mounted, preventing state updates after unmount in async operations.

**Combination with State**: Often combine refs (for internal tracking) with state (for UI updates). Refs handle behind-the-scenes logic while state drives visual changes.

```javascript
// Pattern: Latest callback without changing effect dependencies
function useLatestCallback(callback) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => callbackRef.current(...args), []);
}

// Usage: Interval with dynamic callback
function useInterval(callback, delay) {
  const savedCallback = useLatestCallback(callback);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(savedCallback, delay);
    return () => clearInterval(id);
  }, [delay, savedCallback]);
}
```

The power of custom hooks with refs lies in encapsulating complex ref-based patterns into reusable, testable units that hide implementation details from consumers.

---

### 🔍 Deep Dive: Advanced Custom Hook Patterns with useRef

Understanding how professional React libraries implement custom hooks reveals advanced patterns for performance, correctness, and developer experience.

#### Pattern 1: usePrevious - Comparing Across Renders

The `usePrevious` hook tracks previous values for change detection:

```javascript
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Usage: Detect prop changes
function UserProfile({ userId }) {
  const previousUserId = usePrevious(userId);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId !== previousUserId) {
      console.log(`User changed from ${previousUserId} to ${userId}`);
      fetchUser(userId).then(setUser);
    }
  }, [userId, previousUserId]);

  return <div>{user?.name}</div>;
}
```

**Why useEffect not useLayoutEffect?** Using `useEffect` means `ref.current` holds the value from the previous render during the current render, which is exactly what we want. `useLayoutEffect` would update the ref before effects run, defeating the purpose.

**Internal Execution Flow:**

```
Render 1 (userId=1):
├─ usePrevious(1) called
│  └─ ref.current = undefined (not set yet)
├─ Component renders, previousUserId = undefined
├─ useEffect runs after paint
│  └─ ref.current = 1 (saved for next render)

Render 2 (userId=2):
├─ usePrevious(2) called
│  └─ ref.current = 1 (from previous render) ✅
├─ Component renders, previousUserId = 1
├─ useEffect runs
│  └─ ref.current = 2 (saved for next render)
```

**Advanced Variant with Comparator:**

```javascript
function usePrevious(value, compare = Object.is) {
  const ref = useRef({ value, prev: undefined });

  const current = ref.current.value;

  if (!compare(current, value)) {
    ref.current = {
      value,
      prev: current
    };
  }

  return ref.current.prev;
}

// Usage with deep comparison
function DataTable({ data }) {
  const prevData = usePrevious(data, isEqual); // lodash isEqual

  useEffect(() => {
    if (prevData && !isEqual(data, prevData)) {
      console.log('Data changed:', { old: prevData, new: data });
    }
  }, [data, prevData]);
}
```

#### Pattern 2: useLatestRef - Escaping Stale Closures

Critical for effects and callbacks that reference changing values:

```javascript
function useLatestRef(value) {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}

// Usage: Event handler with latest state
function ChatComponent({ onMessage }) {
  const [messages, setMessages] = useState([]);
  const messagesRef = useLatestRef(messages);

  useEffect(() => {
    const ws = new WebSocket('wss://chat.example.com');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Always has latest messages, no stale closure!
      const currentMessages = messagesRef.current;
      onMessage(message, currentMessages);

      setMessages([...currentMessages, message]);
    };

    return () => ws.close();
  }, []); // Empty deps - no stale closures!

  return <MessageList messages={messages} />;
}
```

**Why useLayoutEffect?** Synchronous update before browser paint ensures ref is always current before any effects or event handlers run.

**Performance Characteristics:**

- `useLayoutEffect` blocks painting (~0.1ms overhead)
- Prevents one re-render compared to `useEffect` approach
- Critical for refs used in layout measurements or animations

#### Pattern 3: useTimeout/useInterval - Declarative Timers

Managing timers safely requires coordinating refs, state, and cleanup:

```javascript
function useTimeout(callback, delay) {
  const savedCallback = useLatestRef(callback);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

function useInterval(callback, delay) {
  const savedCallback = useLatestRef(callback);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

// Usage: Auto-save with dynamic delay
function AutosaveEditor({ content, saveDelay = 2000 }) {
  const [isDirty, setIsDirty] = useState(false);

  useInterval(() => {
    if (isDirty) {
      saveContent(content);
      setIsDirty(false);
    }
  }, isDirty ? saveDelay : null); // null pauses interval

  return (
    <textarea
      value={content}
      onChange={() => setIsDirty(true)}
    />
  );
}
```

**Advanced Variant with Pause/Resume:**

```javascript
function useControllableInterval(callback, delay, options = {}) {
  const { immediate = false } = options;
  const savedCallback = useLatestRef(callback);
  const intervalRef = useRef(null);
  const [isRunning, setIsRunning] = useState(immediate);

  const start = useCallback(() => {
    if (intervalRef.current) return; // Already running

    savedCallback.current(); // Immediate first call
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);
    setIsRunning(true);
  }, [delay]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  useEffect(() => {
    if (immediate) start();
    return stop;
  }, [immediate, start, stop]);

  return { start, stop, reset, isRunning };
}

// Usage: Controllable polling
function LiveMetrics() {
  const [metrics, setMetrics] = useState(null);

  const { start, stop, isRunning } = useControllableInterval(
    async () => {
      const data = await fetchMetrics();
      setMetrics(data);
    },
    5000,
    { immediate: true }
  );

  return (
    <div>
      <button onClick={isRunning ? stop : start}>
        {isRunning ? 'Pause' : 'Resume'} Updates
      </button>
      <MetricsDisplay data={metrics} />
    </div>
  );
}
```

#### Pattern 4: useEventListener - Safe Event Handling

Encapsulates add/remove listener logic with proper cleanup:

```javascript
function useEventListener(
  eventName,
  handler,
  element = window,
  options = {}
) {
  const savedHandler = useLatestRef(handler);

  useEffect(() => {
    const targetElement = element?.current ?? element;
    if (!(targetElement && targetElement.addEventListener)) return;

    const eventListener = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, JSON.stringify(options)]);
}

// Usage: Window resize handler
function ResponsiveComponent() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEventListener('resize', () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  });

  return <div>Window: {windowSize.width} x {windowSize.height}</div>;
}

// Usage: Click outside detection
function useClickOutside(ref, handler) {
  useEventListener('mousedown', (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      handler(event);
    }
  }, document);
}

function Dropdown() {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <DropdownMenu />}
    </div>
  );
}
```

#### Pattern 5: useMeasure - DOM Dimension Tracking

Uses ResizeObserver with refs for efficient measurement:

```javascript
function useMeasure() {
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0
  });

  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observerRef.current = new ResizeObserver(([entry]) => {
      setBounds(entry.contentRect);
    });

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return [ref, bounds];
}

// Usage: Responsive canvas
function ResponsiveCanvas() {
  const [ref, { width, height }] = useMeasure();

  useEffect(() => {
    if (width && height) {
      drawCanvas(width, height);
    }
  }, [width, height]);

  return <canvas ref={ref} width={width} height={height} />;
}
```

**Advanced Variant with Debouncing:**

```javascript
function useMeasureDebounced(delay = 100) {
  const [bounds, setBounds] = useState({});
  const [ref, rawBounds] = useMeasure();
  const debouncedBounds = useDebounce(rawBounds, delay);

  useEffect(() => {
    setBounds(debouncedBounds);
  }, [debouncedBounds]);

  return [ref, bounds];
}
```

#### Pattern 6: useIsMounted - Prevent State Updates After Unmount

Critical for async operations:

```javascript
function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

// Usage: Safe async updates
function DataFetcher({ url }) {
  const [data, setData] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();

      // Double protection against state updates
      if (!cancelled && isMounted()) {
        setData(json);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, isMounted]);

  return <div>{data?.title}</div>;
}
```

#### Performance Optimization Patterns

**Ref-based Memoization:**

```javascript
function useStableMemo(factory, deps) {
  const ref = useRef({ value: undefined, deps: undefined });

  if (!ref.current.deps || !shallowEqual(deps, ref.current.deps)) {
    ref.current = {
      value: factory(),
      deps
    };
  }

  return ref.current.value;
}

// More control than useMemo (doesn't rely on React's cache)
function ExpensiveComponent({ data }) {
  const processed = useStableMemo(
    () => expensiveProcessing(data),
    [data]
  );

  return <div>{processed}</div>;
}
```

These patterns form the foundation of production-grade custom hooks, enabling developers to build robust, performant React applications with clean, reusable logic.

---

### 🐛 Real-World Scenario: Memory Leak in useInterval Hook

**Context**: Task management app with auto-refresh functionality. Users reported browser tabs crashing after leaving the app open for extended periods. Memory profiling revealed a severe leak in the interval management system.

#### The Buggy Implementation

```javascript
// ❌ CATASTROPHIC MEMORY LEAK
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Callback recreated on EVERY render
  useInterval(() => {
    fetchTasks(filter).then(setTasks);
  }, 5000);

  return (
    <div>
      <FilterButtons filter={filter} onChange={setFilter} />
      <TaskList tasks={tasks} />
    </div>
  );
}
```

#### Impact Metrics (2 weeks in production)

**Memory Leaks:**
- Baseline memory: 45MB
- After 1 hour: 380MB (+844%)
- After 4 hours: 1.2GB (tab crash on most systems)
- Leaked intervals per hour: 720 intervals (one every 5 seconds)

**User Impact:**
- Browser crashes: 1,847 incidents
- User complaints: 432 support tickets
- Session duration before crash: Average 3.2 hours
- Users affected: 15,234 (23% of active users)
- Churn rate during bug period: +18%

**Business Impact:**
- Lost productivity: ~12,000 hours
- Support costs: $8,900 (extra tickets)
- Reputation damage: -0.8 point drop in App Store rating

#### Root Cause Analysis

**Problem 1: Closure Capture**
```javascript
useEffect(() => {
  const id = setInterval(callback, delay);
  return () => clearInterval(id);
}, [callback, delay]);
```

- Every time `callback` changes, effect re-runs
- New interval started BEFORE old one cleaned up
- In React 17, cleanup runs after new effect starts (race condition)

**Problem 2: Callback Recreated Every Render**
```javascript
useInterval(() => {
  fetchTasks(filter).then(setTasks);
}, 5000);
```

- Anonymous function recreated on every render
- `filter` captured in closure, changing `filter` changes callback
- User changing filter 10 times = 10 intervals running simultaneously

**Problem 3: React 17 Effect Timing**
```
Component re-renders (filter changes):
├─ Old effect cleanup scheduled (but NOT run yet)
├─ New effect runs → creates interval #2
├─ Old cleanup finally runs → clears interval #1
└─ Both intervals now running!
```

#### Debugging Process

**Step 1: Chrome DevTools Memory Profiler (15 minutes)**

```javascript
// Add tracking to measure leak
const activeIntervals = new Set();

function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    activeIntervals.add(id);
    console.log('[useInterval] Active intervals:', activeIntervals.size);

    return () => {
      clearInterval(id);
      activeIntervals.delete(id);
      console.log('[useInterval] Cleaned up, remaining:', activeIntervals.size);
    };
  }, [callback, delay]);
}
```

Console output revealed the smoking gun:
```
[useInterval] Active intervals: 1
[useInterval] Active intervals: 2
[useInterval] Cleaned up, remaining: 1  ← Should be 0!
[useInterval] Active intervals: 2
[useInterval] Cleaned up, remaining: 1
[useInterval] Active intervals: 2
...pattern continues forever
```

**Step 2: React DevTools Profiler (10 minutes)**

Profiler showed component re-rendering every time `filter` changed, and the callback dependency was causing effect re-runs.

**Step 3: Heap Snapshot Comparison (20 minutes)**

1. Take heap snapshot at start
2. Wait 10 minutes
3. Take second snapshot
4. Compare: Found 120 orphaned `setInterval` timers

#### The Fix: Ref-Based Stable Callback

```javascript
// ✅ FIXED: Using ref to maintain latest callback
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Update ref when callback changes (doesn't trigger effect re-run)
  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;

    // Interval calls latest callback via ref
    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]); // Only re-run if delay changes
}

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Callback can change freely without recreating interval
  useInterval(() => {
    fetchTasks(filter).then(setTasks);
  }, 5000);

  return (
    <div>
      <FilterButtons filter={filter} onChange={setFilter} />
      <TaskList tasks={tasks} />
    </div>
  );
}
```

#### How the Fix Works

**Execution Flow:**

```
Initial Render:
├─ useInterval called with callback #1
├─ savedCallback.current = callback #1 (useLayoutEffect)
├─ setInterval(() => savedCallback.current(), 5000) (useEffect)
└─ Interval ID: 123

Filter Changes (re-render):
├─ useInterval called with callback #2
├─ savedCallback.current = callback #2 (useLayoutEffect updates ref)
├─ useEffect does NOT re-run (delay unchanged)
└─ Interval 123 continues running, but now calls callback #2 via ref
```

**Key Insights:**

1. **Ref stores callback**: `savedCallback.current` always points to latest callback
2. **Effect only depends on delay**: Changing callback doesn't recreate interval
3. **useLayoutEffect for sync update**: Ensures ref updated before next interval fires
4. **One interval for lifetime**: Interval created once, reused forever (unless delay changes)

#### Production-Ready Implementation

```javascript
// ✅ ENTERPRISE-GRADE: With pause, resume, reset
function useInterval(callback, delay, options = {}) {
  const { immediate = false, enabled = true } = options;

  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);
  const [isActive, setIsActive] = useState(enabled && delay !== null);

  // Keep callback fresh
  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
    }
  }, []);

  const start = useCallback(() => {
    if (delay === null || !enabled) return;

    clear(); // Clear existing first

    if (immediate) {
      savedCallback.current();
    }

    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);

    setIsActive(true);
  }, [delay, immediate, enabled, clear]);

  const reset = useCallback(() => {
    clear();
    start();
  }, [clear, start]);

  useEffect(() => {
    if (enabled && delay !== null) {
      start();
    } else {
      clear();
    }

    return clear;
  }, [delay, enabled, start, clear]);

  return { clear, reset, isActive };
}

// Usage: With controls
function AutoRefreshDashboard() {
  const [data, setData] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshRate, setRefreshRate] = useState(5000);

  const { clear, reset, isActive } = useInterval(
    async () => {
      const newData = await fetchData();
      setData(newData);
    },
    refreshRate,
    { enabled: !isPaused, immediate: true }
  );

  return (
    <div>
      <Controls
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onRefreshNow={reset}
        refreshRate={refreshRate}
        onRateChange={setRefreshRate}
      />

      <StatusIndicator active={isActive} rate={refreshRate} />

      <DataDisplay data={data} />
    </div>
  );
}
```

#### Post-Fix Metrics (2 weeks monitoring)

**Memory Performance:**
- Baseline memory: 45MB ✅
- After 1 hour: 52MB (+15%, normal growth) ✅
- After 4 hours: 58MB (+28%, stable) ✅
- After 24 hours: 67MB (no crash!) ✅
- Leaked intervals: 0 ✅

**User Experience:**
- Browser crashes: 1,847 → 0 (100% elimination) ✅
- User complaints: 432 → 7 (98% reduction) ✅
- Average session duration: 6.8 hours (no crashes observed) ✅
- Users affected: 0 ✅
- Churn rate: Recovered +11% ✅

**Business Recovery:**
- Support tickets: -96%
- App Store rating: Recovered +0.9 points
- User trust: Regained within 3 weeks
- Cost savings: $8,400/month (reduced support load)

#### Key Learnings

1. **Never depend on callback in useEffect**: Use ref to store latest callback
2. **Use useLayoutEffect for ref updates**: Ensures sync update before effects run
3. **Monitor interval count in development**: Add logging to detect leaks early
4. **Test with React StrictMode**: Catches effect cleanup issues
5. **Use Chrome DevTools Memory Profiler**: Essential for debugging leaks
6. **Provide pause/resume controls**: Users should control polling
7. **Implement cleanup on unmount**: Always clear intervals in effect cleanup
8. **Test long-running sessions**: Automated tests rarely catch slow leaks

This bug pattern is **extremely common** in React applications and understanding it is critical for any developer working with intervals, timeouts, or subscriptions.

---

<details>
<summary><strong>⚖️ Trade-offs: Custom Hook Design Decisions with Refs</strong></summary>

Building custom hooks involves architectural choices that impact API ergonomics, performance, and maintainability. Understanding trade-offs helps make informed decisions.

#### Trade-off 1: Ref in Hook vs. Ref from Consumer

**Pattern A: Hook Manages Ref Internally**

```javascript
// ✅ Hook creates and returns ref
function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [handler]);

  return ref; // Consumer attaches this
}

// Usage
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  return <div ref={dropdownRef}>{/* ... */}</div>;
}
```

**Pros:**
- ✅ Simpler API (one line to use)
- ✅ Hook controls ref lifecycle
- ✅ Less boilerplate for consumer

**Cons:**
- ❌ Consumer can't use existing ref
- ❌ Difficult to compose with other ref-using hooks
- ❌ Can't work with multiple elements

**Pattern B: Consumer Provides Ref**

```javascript
// ✅ Hook accepts ref as parameter
function useClickOutside(ref, handler) {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return <div ref={dropdownRef}>{/* ... */}</div>;
}
```

**Pros:**
- ✅ Consumer controls ref
- ✅ Easy to compose multiple hooks using same ref
- ✅ Works with forwarded refs
- ✅ Can use with multiple elements

**Cons:**
- ❌ More verbose (consumer creates ref)
- ❌ Easier to misuse (forgetting to create ref)

**Decision Guide:**
- **Hook creates ref**: Single-purpose hooks where composition isn't needed (`useHover`, `useFocus`)
- **Consumer provides ref**: General-purpose hooks that might compose with others (`useClickOutside`, `useIntersectionObserver`)

**Best of Both Worlds:**

```javascript
// ✅ Hybrid: Optional ref parameter
function useClickOutside(handler, providedRef = null) {
  const internalRef = useRef(null);
  const ref = providedRef || internalRef;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);

  return ref;
}

// Usage 1: Hook provides ref
const ref = useClickOutside(handleClose);

// Usage 2: Consumer provides ref
const myRef = useRef();
useClickOutside(handleClose, myRef);
```

#### Trade-off 2: useLayoutEffect vs. useEffect for Ref Updates

**useLayoutEffect - Synchronous Before Paint:**

```javascript
function useLatestRef(value) {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
```

**Pros:**
- ✅ Ref updated before DOM paint
- ✅ Prevents one frame of stale data
- ✅ Critical for layout measurements
- ✅ Necessary for animations

**Cons:**
- ❌ Blocks browser paint (~0.1-0.5ms)
- ❌ Can cause jank if doing heavy work
- ❌ SSR warning (no layout phase on server)

**useEffect - Asynchronous After Paint:**

```javascript
function useLatestRef(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
}
```

**Pros:**
- ✅ Doesn't block paint
- ✅ Better performance for non-critical updates
- ✅ No SSR warnings
- ✅ Safer default choice

**Cons:**
- ❌ One frame delay before ref updated
- ❌ Can cause visual glitches in animations
- ❌ Wrong for DOM measurements

**Decision Matrix:**

| Use Case | useLayoutEffect | useEffect |
|----------|-----------------|-----------|
| **Storing latest callback** | ✅ Preferred | ⚠️ Usually fine |
| **DOM measurements** | ✅ Required | ❌ Wrong values |
| **Animation frame callbacks** | ✅ Required | ❌ Frame delay |
| **Event listeners** | ⚠️ Overkill | ✅ Preferred |
| **Non-visual tracking** | ❌ Overkill | ✅ Preferred |
| **SSR compatibility** | ❌ Warns | ✅ Safe |

**Rule of Thumb:** Use `useLayoutEffect` when ref correctness before paint matters (DOM measurements, animations). Use `useEffect` for everything else (callbacks, tracking, cleanup).

#### Trade-off 3: Single-Value Ref vs. Object Ref

**Single-Value Pattern:**

```javascript
function useInterval(callback, delay) {
  const callbackRef = useRef(callback);
  const intervalRef = useRef(null);

  // Two separate refs
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => clearInterval(intervalRef.current);
  }, [delay]);
}
```

**Pros:**
- ✅ Clear single responsibility
- ✅ Easy to understand
- ✅ Simple to test

**Cons:**
- ❌ Multiple refs for related data
- ❌ No atomic updates
- ❌ More memory overhead (2+ ref objects)

**Object Pattern:**

```javascript
function useInterval(callback, delay) {
  const ref = useRef({
    callback,
    intervalId: null,
    delay
  });

  useLayoutEffect(() => {
    ref.current.callback = callback;
    ref.current.delay = delay;
  });

  useEffect(() => {
    ref.current.intervalId = setInterval(() => {
      ref.current.callback();
    }, ref.current.delay);

    return () => clearInterval(ref.current.intervalId);
  }, [delay]);
}
```

**Pros:**
- ✅ Related data grouped
- ✅ Single ref object (less memory)
- ✅ Atomic-ish updates (single object mutation)

**Cons:**
- ❌ More complex to understand
- ❌ Harder to track what changed
- ❌ Debugging shows entire object

**Decision Guide:**
- **Single-value refs**: Independent values (`callbackRef`, `elementRef`)
- **Object ref**: Tightly coupled state (`{ isLoading, data, error }`)

**Performance Comparison:**

```javascript
// Memory: 100 components with interval hook
// Single-value (2 refs each): ~6.4KB
// Object ref (1 ref each): ~3.2KB
// Difference: Negligible for most apps
```

#### Trade-off 4: Exposing Imperative Handles

**Pattern A: No Imperative API**

```javascript
function useInterval(callback, delay) {
  // Hook handles everything internally
  // Consumer has no control

  const savedCallback = useRef(callback);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);

  // Returns nothing
}

// Usage: Declarative only
function Component() {
  const [enabled, setEnabled] = useState(true);
  const [delay, setDelay] = useState(1000);

  useInterval(
    () => console.log('Tick'),
    enabled ? delay : null
  );

  // To pause: Set delay to null
  // To change rate: Update delay
}
```

**Pros:**
- ✅ Fully declarative
- ✅ No manual management
- ✅ Can't be misused
- ✅ Simpler mental model

**Cons:**
- ❌ No imperative control
- ❌ Can't manually trigger
- ❌ Can't query state
- ❌ Less flexible

**Pattern B: Imperative API Exposed**

```javascript
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  const start = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, delay);
    setIsActive(true);
  }, [delay]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  return { start, stop, reset, isActive };
}

// Usage: Imperative control
function Component() {
  const { start, stop, reset, isActive } = useInterval(
    () => console.log('Tick'),
    1000
  );

  return (
    <div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
      <div>Status: {isActive ? 'Running' : 'Stopped'}</div>
    </div>
  );
}
```

**Pros:**
- ✅ Full control
- ✅ Can manually trigger
- ✅ Query current state
- ✅ Maximum flexibility

**Cons:**
- ❌ More complex API
- ❌ Easier to misuse
- ❌ Manual lifecycle management
- ❌ Larger bundle size

**Hybrid Approach:**

```javascript
function useInterval(callback, delay, options = {}) {
  const { autoStart = true, mode = 'declarative' } = options;

  // Internal implementation...

  if (mode === 'imperative') {
    return { start, stop, reset, isActive };
  }

  // Auto-start for declarative mode
  useEffect(() => {
    if (autoStart && delay !== null) {
      start();
    }
    return stop;
  }, [autoStart, delay, start, stop]);

  return isActive;
}

// Declarative usage
const isActive = useInterval(tick, 1000);

// Imperative usage
const controls = useInterval(tick, 1000, { mode: 'imperative', autoStart: false });
controls.start();
```

#### Trade-off 5: Error Handling Strategies

**Pattern A: Silent Failure (Ref Nullability)**

```javascript
function useClickOutside(ref, handler) {
  useEffect(() => {
    const handleClick = (e) => {
      // Silent: Just doesn't work if ref not attached
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}
```

**Pros:**
- ✅ No runtime errors
- ✅ Graceful degradation
- ✅ Works with conditional rendering

**Cons:**
- ❌ Silent failures hard to debug
- ❌ Hook "does nothing" without clear reason
- ❌ No developer feedback

**Pattern B: Defensive Validation**

```javascript
function useClickOutside(ref, handler) {
  useEffect(() => {
    if (!ref || !ref.current) {
      console.warn('useClickOutside: ref is not attached to an element');
      return;
    }

    const handleClick = (e) => {
      if (!ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}
```

**Pros:**
- ✅ Clear developer feedback
- ✅ Easier debugging
- ✅ Prevents silent failures

**Cons:**
- ❌ Console noise in development
- ❌ Still doesn't fail hard
- ❌ Warning fatigue

**Pattern C: Strict Validation (Development Only)**

```javascript
function useClickOutside(ref, handler) {
  if (process.env.NODE_ENV !== 'production') {
    if (!ref) {
      throw new Error('useClickOutside: ref is required');
    }
  }

  useEffect(() => {
    if (!ref.current) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('useClickOutside: ref.current is null. Did you forget to attach the ref?');
      }
      return;
    }

    const handleClick = (e) => {
      if (!ref.current.contains(e.target)) {
        handler(e);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}
```

**Pros:**
- ✅ Strict in dev, forgiving in prod
- ✅ Catches mistakes early
- ✅ No production overhead

**Cons:**
- ❌ Different behavior dev vs. prod
- ❌ Might miss edge cases in production

**Decision Guide:**
- **Silent failure**: Utility hooks used optionally
- **Defensive validation**: Critical hooks (accessibility, security)
- **Strict validation**: Library hooks with clear contracts

Understanding these trade-offs enables designing custom hooks that balance API ergonomics, performance, safety, and developer experience for your specific use case.

---

### 💬 Explain to Junior: Building Custom Hooks with useRef

**Simple Analogy:**

Think of building custom hooks like creating specialized power tools. React gives you basic tools (useState, useEffect, useRef), and you combine them into specialized tools for specific jobs.

**useRef is like having a toolbox with secret compartments** - you can store things (timer IDs, DOM elements, latest callbacks) without anyone noticing. The component doesn't re-render when you put stuff in or take stuff out of these compartments.

**Why Combine useRef with Custom Hooks?**

Imagine you're building a **useInterval** hook. Without refs, you hit problems:

```javascript
// ❌ BROKEN: Callback changes cause interval to restart
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]); // callback changes = new interval!
}

function Component() {
  const [count, setCount] = useState(0);

  // Every render, this function is NEW (different reference)
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);

  // Problem: Interval restarts on EVERY render!
  // Expected: Tick once per second
  // Reality: Thousands of intervals created!
}
```

**The Fix: Use Ref to Store Callback**

```javascript
// ✅ WORKING: Ref stores latest callback, interval stable
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Update ref when callback changes (no re-render)
  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => {
      savedCallback.current(); // Call latest callback
    }, delay);

    return () => clearInterval(id);
  }, [delay]); // Only recreate if delay changes
}

// Now it works perfectly!
function Component() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(c => c + 1); // Callback can change freely
  }, 1000);

  // Interval created once, runs forever
  // Callback updated via ref without restarting interval
}
```

**How It Works - Step by Step:**

```
Initial Render:
1. useInterval called with callback #1
2. savedCallback.current = callback #1
3. setInterval created (calls savedCallback.current)
4. Interval ID: 123 (will run forever)

Component Re-renders (count changes):
1. useInterval called with callback #2
2. savedCallback.current = callback #2 (ref updated)
3. useEffect does NOT run (delay unchanged)
4. Interval 123 still running, but NOW calls callback #2

Magic: Interval never restarts, but always calls latest callback!
```

**Common Patterns for Juniors**

**Pattern 1: usePrevious - Compare Old vs New**

```javascript
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value; // Save for next render
  });

  return ref.current; // Return previous value
}

// Usage: Detect changes
function UserProfile({ userId }) {
  const previousUserId = usePrevious(userId);

  useEffect(() => {
    if (userId !== previousUserId) {
      console.log(`User changed from ${previousUserId} to ${userId}`);
      loadNewUser(userId);
    }
  }, [userId, previousUserId]);
}
```

**Real-world analogy:** Like looking at your old ID photo to see how much you've changed. The ref keeps the "old photo" while your state has the "new photo".

**Pattern 2: useTimeout - Auto-Cleanup Timer**

```javascript
function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id); // Auto-cleanup!
  }, [delay]);
}

// Usage: Show notification for 3 seconds
function Notification({ message }) {
  const [visible, setVisible] = useState(true);

  useTimeout(() => {
    setVisible(false);
  }, 3000);

  if (!visible) return null;
  return <div>{message}</div>;
}
```

**Why this is better than raw setTimeout:**
- Auto-cleanup when component unmounts
- Won't update state after unmount (memory leak prevention)
- Latest callback always called

**Pattern 3: useClickOutside - Detect Clicks Outside Element**

```javascript
function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      // If click is outside our element
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handler]);

  return ref;
}

// Usage: Close dropdown when clicking outside
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {isOpen && <DropdownMenu />}
    </div>
  );
}
```

**Real-world analogy:** Like a motion sensor for a building - it detects when activity happens outside the building's boundary.

**Interview Question Templates**

**Q: "Why use useRef in custom hooks instead of useState?"**

**Answer Template:**
> "I use useRef in custom hooks when I need to store values that don't affect rendering. For example, in useInterval, I store the latest callback in a ref because:
>
> 1. The callback might change every render (new function reference)
> 2. Changing the callback shouldn't restart the interval
> 3. The interval needs to call the LATEST callback
>
> With useState, every callback change would cause a re-render and restart the interval. With useRef, I can update the callback silently. The interval keeps running, but calls the updated callback via the ref.
>
> Rule of thumb: State for values that affect UI, refs for values that don't."

**Q: "What's the purpose of useLayoutEffect in ref-based hooks?"**

**Answer Template:**
> "I use useLayoutEffect when updating refs that will be read synchronously before the next paint. For example, when storing the latest callback in useInterval, I want the ref updated before any effects or timers fire.
>
> useLayoutEffect runs synchronously after render but before browser paint, ensuring the ref is current. If I used useEffect, there'd be one frame where the ref is stale, which could cause the interval to call an old callback.
>
> However, useLayoutEffect blocks painting, so I only use it when timing matters. For non-critical ref updates, useEffect is fine and more performant."

**Q: "How do you prevent memory leaks in custom hooks with refs?"**

**Answer Template:**
> "Memory leaks happen when timers, subscriptions, or event listeners aren't cleaned up. In custom hooks, I prevent leaks by:
>
> 1. **Always return cleanup functions from useEffect**
> 2. **Store timer/subscription IDs in refs** (not state, to avoid re-renders)
> 3. **Use a 'cancelled' flag** to prevent state updates after unmount
> 4. **Clear refs in cleanup** (set to null to help garbage collection)
>
> For example, in useInterval, I store the interval ID in a ref and clear it in the cleanup function. If the component unmounts, the cleanup runs and clears the interval, preventing it from running forever."

**Common Mistakes to Avoid**

```javascript
// ❌ MISTAKE 1: Not cleaning up intervals
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    // Missing return statement! Interval never cleared!
  }, [callback, delay]);
}

// ✅ FIX: Always return cleanup
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id); // ✅ Cleanup!
  }, [delay]);
}

// ❌ MISTAKE 2: Depending on callback directly
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]); // ❌ callback changes = new interval!
}

// ✅ FIX: Store callback in ref
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]); // ✅ Only depends on delay
}

// ❌ MISTAKE 3: Mutating refs during render
function useCounter() {
  const renderCount = useRef(0);
  renderCount.current++; // ❌ Side effect during render!

  return renderCount.current;
}

// ✅ FIX: Mutate refs in effects
function useCounter() {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++; // ✅ Safe in effect
  });

  return renderCount.current;
}
```

**Mental Model Summary**

```
Custom Hook Design Checklist:
├─ Does it need to remember something across renders?
│  ├─ Affects UI? → useState
│  └─ Doesn't affect UI? → useRef
│
├─ Does it set up timers/listeners?
│  ├─ Store ID in ref
│  ├─ Clear in cleanup function
│  └─ Use latest callback pattern
│
├─ Does it interact with DOM?
│  ├─ Return ref for consumer to attach
│  └─ Access DOM in useEffect (after render)
│
└─ Does callback capture props/state?
   ├─ Store callback in ref
   ├─ Update ref with useLayoutEffect
   └─ Only depend on stable values in effect
```

Understanding these patterns prepares you to build production-quality custom hooks that are performant, correct, and maintainable.

---

## Question 2: How do you compose multiple custom hooks using refs for complex state management?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Meta, Google, Uber, Airbnb, Netflix

### Question
Explain advanced patterns for composing custom hooks that use refs together. How do you handle hook interdependencies, shared refs, and coordination between multiple ref-based hooks? What are the architectural considerations?

### Answer

Hook composition with refs enables building sophisticated behaviors from simple, reusable pieces. The key is managing dependencies and ref lifecycles across multiple hooks while maintaining clear contracts and avoiding subtle bugs.

**Composition Patterns:**

1. **Sequential Composition**: One hook's output feeds another's input
2. **Parallel Composition**: Multiple independent hooks working together
3. **Hierarchical Composition**: Parent hook delegates to child hooks
4. **Shared Ref Pattern**: Multiple hooks operate on same DOM element
5. **Coordination Pattern**: Hooks communicate through shared state/refs

**Core Principles:**

**Ref Ownership**: Establish clear ownership - one hook creates the ref, others consume it. Prevents conflicts and makes cleanup responsibility clear.

**Dependency Ordering**: When hooks depend on each other, ensure proper execution order through careful dependency array management and execution flow.

**Lifecycle Coordination**: When multiple hooks manage timers/subscriptions, coordinate cleanup to prevent race conditions and ensure resources freed in correct order.

**Type Safety**: With TypeScript, use generics to ensure ref types match across hook composition boundaries.

**Example: Composing Animation Hooks**

```javascript
// Base hooks
function useAnimationFrame(callback) {
  const savedCallback = useRef(callback);
  const frameRef = useRef(null);

  useLayoutEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);
}

function useBoundedValue(initialValue, min, max) {
  const [value, setValue] = useState(initialValue);

  const setBounded = useCallback((newValue) => {
    setValue(Math.max(min, Math.min(max, newValue)));
  }, [min, max]);

  return [value, setBounded];
}

// Composed hook
function useAnimatedCounter(target, duration = 1000) {
  const [current, setCurrent] = useBoundedValue(0, 0, target);
  const startTimeRef = useRef(null);
  const isAnimating = useRef(false);

  useAnimationFrame(() => {
    if (!isAnimating.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    const eased = 1 - Math.pow(1 - progress, 3); // easeOut
    const next = Math.floor(target * eased);

    setCurrent(next);

    if (progress >= 1) {
      isAnimating.current = false;
    }
  });

  useEffect(() => {
    startTimeRef.current = Date.now();
    isAnimating.current = true;
  }, [target]);

  return current;
}
```

**Shared Ref Pattern:**

```javascript
function useHover(ref) {
  const [isHovered, setIsHovered] = useState(false);

  useEventListener('mouseenter', () => setIsHovered(true), ref);
  useEventListener('mouseleave', () => setIsHovered(false), ref);

  return isHovered;
}

function useFocus(ref) {
  const [isFocused, setIsFocused] = useState(false);

  useEventListener('focus', () => setIsFocused(true), ref);
  useEventListener('blur', () => setIsFocused(false), ref);

  return isFocused;
}

// Composing with shared ref
function InteractiveButton() {
  const buttonRef = useRef(null);
  const isHovered = useHover(buttonRef);
  const isFocused = useFocus(buttonRef);

  const className = [
    isHovered && 'hovered',
    isFocused && 'focused'
  ].filter(Boolean).join(' ');

  return <button ref={buttonRef} className={className}>Click me</button>;
}
```

Successfully composing ref-based hooks requires understanding execution order, dependency management, and lifecycle coordination to build complex behaviors from simple, testable units.

</details>

---

### 🔍 Deep Dive: Advanced Hook Composition Architecture

(Continue with 500-800 word deep dive section...)

[Content continues with detailed implementation examples, architectural patterns, performance considerations, and advanced composition techniques]

### 🐛 Real-World Scenario: [Specific production bug]

(Continue with 500-800 word real-world scenario...)

### ⚖️ Trade-offs: [Specific trade-off analysis]

(Continue with 500-800 word trade-off analysis...)

### 💬 Explain to Junior: [Junior-friendly explanation]

(Continue with 500-800 word beginner-friendly section...)
