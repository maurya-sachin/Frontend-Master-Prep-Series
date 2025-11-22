# React Hooks - useRef

## Question 1: How does useRef work and what are its use cases?

### Answer

`useRef` is a React hook that returns a mutable ref object whose `.current` property persists across re-renders without causing component updates. Unlike state, mutating a ref doesn't trigger re-renders, making it perfect for storing values that need to persist but don't affect the visual output.

**Key characteristics:**
- **Persistence**: The ref object persists for the component's entire lifetime
- **Mutability**: You can modify `.current` without causing re-renders
- **Identity stability**: The same object is returned on every render
- **No reactivity**: Changes don't trigger component updates

**Primary use cases:**

1. **DOM access**: Directly access and manipulate DOM elements
2. **Storing mutable values**: Keep values across renders without causing updates
3. **Previous values**: Track previous props or state values
4. **Timers and intervals**: Store timer IDs for cleanup
5. **Third-party library instances**: Store instances that shouldn't trigger re-renders

**Basic syntax:**
```javascript
const ref = useRef(initialValue);
// Access/modify: ref.current = newValue
```

The ref object structure is simple: `{ current: initialValue }`. React ensures this object remains the same across all re-renders, providing a stable reference that survives component updates while staying outside React's reactivity system.

---

### 🔍 Deep Dive

**Internal Implementation and Ref Object Lifecycle**

When you call `useRef(initialValue)`, React creates a plain JavaScript object with a single property `current` initialized to your provided value. This object is stored in the component's fiber node (React's internal representation of components) and persists across all re-renders:

```javascript
// Simplified internal representation
function useRef(initialValue) {
  // On mount: create and store ref object
  if (currentlyRenderingFiber.memoizedState === null) {
    const ref = { current: initialValue };
    currentlyRenderingFiber.memoizedState = ref;
    return ref;
  }
  // On updates: return existing ref object
  return currentlyRenderingFiber.memoizedState;
}
```

**Why refs don't trigger re-renders:**

React's reconciliation process only tracks changes to state and props. When you mutate `ref.current`, you're modifying a property of an object that React handed you but doesn't monitor. React has no mechanism to detect these mutations because refs intentionally bypass the reactivity system:

```javascript
// React doesn't track this
ref.current = newValue; // No re-render scheduled

// React tracks this
setState(newValue); // Re-render scheduled
```

**DOM Ref Attachment Process**

When you pass a ref to a JSX element's `ref` attribute, React handles the attachment during the commit phase (after render but before browser paint):

```javascript
// Your code
<input ref={inputRef} />

// React's internal process during commit phase:
// 1. Render phase: React sees ref={inputRef}
// 2. Commit phase: DOM node created
// 3. React executes: inputRef.current = domNode
// 4. Before unmount: React executes: inputRef.current = null
```

**Ref timing considerations:**

```javascript
function Component() {
  const ref = useRef(null);

  // ❌ ref.current is null here (render phase)
  console.log(ref.current); // null

  useEffect(() => {
    // ✅ ref.current has DOM node (after commit phase)
    console.log(ref.current); // <div>...</div>
  }, []);

  return <div ref={ref}>Content</div>;
}
```

**Ref callback alternative:**

React also supports callback refs, which provide more control over ref lifecycle:

```javascript
function Component() {
  const [node, setNode] = useState(null);

  const refCallback = useCallback((node) => {
    // Called with node when mounted
    // Called with null when unmounted
    if (node) {
      console.log('Node mounted:', node);
      setNode(node);
    } else {
      console.log('Node unmounted');
      setNode(null);
    }
  }, []);

  return <div ref={refCallback}>Content</div>;
}
```

**Ref forwarding internals:**

`forwardRef` creates a special component type that receives refs as a second argument:

```javascript
const FancyInput = forwardRef((props, ref) => {
  // ref is forwarded from parent
  return <input ref={ref} {...props} />;
});

// Parent usage
function Parent() {
  const inputRef = useRef(null);
  return <FancyInput ref={inputRef} />;
}
```

**useImperativeHandle for controlled exposure:**

```javascript
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);

  // Expose only specific methods, not entire DOM node
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    scrollIntoView: () => inputRef.current.scrollIntoView(),
    getValue: () => inputRef.current.value,
    // Don't expose setValue to enforce controlled input
  }), []);

  return <input ref={inputRef} {...props} />;
});
```

**Memory considerations:**

Refs are cleaned up when the component unmounts. React automatically sets `ref.current` to `null` for DOM refs during unmount to help garbage collection. For custom refs storing intervals or subscriptions, you must clean up manually:

```javascript
useEffect(() => {
  const intervalId = setInterval(() => {
    console.log('Tick');
  }, 1000);

  intervalRef.current = intervalId;

  // ✅ Cleanup stored ref value
  return () => {
    clearInterval(intervalRef.current);
  };
}, []);
```

---

### 🐛 Real-World Scenario

**Problem: Video Player Memory Leak and Race Conditions**

A video streaming platform implemented a custom video player component with play/pause controls, progress tracking, and autoplay. After deployment, monitoring revealed memory leaks and race conditions causing crashes on iOS Safari.

**Initial buggy implementation:**

```javascript
// ❌ BUGGY VERSION
function VideoPlayer({ src, autoplay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Bug 1: Storing interval ID in state causes unnecessary re-renders
  const [intervalId, setIntervalId] = useState(null);

  // Bug 2: Creating new video element on every render
  const video = document.createElement('video');
  video.src = src;

  const startProgressTracking = () => {
    // Bug 3: Not clearing previous interval
    const id = setInterval(() => {
      setProgress((video.currentTime / video.duration) * 100);
    }, 100);
    setIntervalId(id); // Causes re-render
  };

  const handlePlay = () => {
    video.play();
    setIsPlaying(true);
    startProgressTracking();
  };

  const handlePause = () => {
    video.pause();
    setIsPlaying(false);
    // Bug 4: Clearing wrong interval (state is stale)
    clearInterval(intervalId);
  };

  // Bug 5: No cleanup on unmount
  return (
    <div>
      <video src={src} />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <div>Progress: {progress}%</div>
    </div>
  );
}
```

**Production metrics showing the issues:**

```
Before Fix (1 week monitoring):
- Memory leaks detected: 847 instances
- Average memory growth: 15MB per video session
- Interval leak rate: 3.2 intervals per component mount
- iOS Safari crashes: 23% of sessions > 5 videos
- Progress bar freeze rate: 12% of playbacks
- Zombie intervals found: 1,247 (intervals running after unmount)
- Bundle size: 127KB (video player component)
```

**Root cause analysis:**

1. **Memory leak**: New video elements created every render, never garbage collected
2. **Interval leak**: Previous intervals not cleared, multiple intervals running simultaneously
3. **Race condition**: Stale closure over `intervalId` state in pause handler
4. **Unnecessary re-renders**: Storing interval ID in state caused updates every 100ms
5. **Missing cleanup**: Component unmounted with intervals still running
6. **DOM refs not used**: Video element recreated instead of using stable DOM ref

**Fixed implementation using refs:**

```javascript
// ✅ FIXED VERSION
function VideoPlayer({ src, autoplay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fix 1: Use ref for DOM element (stable across renders)
  const videoRef = useRef(null);

  // Fix 2: Use ref for interval ID (no re-renders on mutation)
  const intervalRef = useRef(null);

  // Fix 3: Use ref for previous src (detect changes)
  const prevSrcRef = useRef(src);

  // Clear any existing interval before starting new one
  const clearProgressInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    // Clear previous interval if exists
    clearProgressInterval();

    intervalRef.current = setInterval(() => {
      if (videoRef.current) {
        const currentProgress =
          (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(currentProgress);
      }
    }, 100);
  }, [clearProgressInterval]);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    }
  }, [startProgressTracking]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      clearProgressInterval();
    }
  }, [clearProgressInterval]);

  // Handle src changes
  useEffect(() => {
    if (prevSrcRef.current !== src) {
      clearProgressInterval();
      setProgress(0);
      setIsPlaying(false);
      prevSrcRef.current = src;
    }
  }, [src, clearProgressInterval]);

  // Autoplay handling
  useEffect(() => {
    if (autoplay && videoRef.current) {
      handlePlay();
    }
  }, [autoplay, handlePlay]);

  // Critical: Cleanup on unmount
  useEffect(() => {
    return () => {
      clearProgressInterval();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = ''; // Release video resources
      }
    };
  }, [clearProgressInterval]);

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        onEnded={() => {
          setIsPlaying(false);
          clearProgressInterval();
          setProgress(0);
        }}
      />
      <button onClick={handlePlay} disabled={isPlaying}>
        Play
      </button>
      <button onClick={handlePause} disabled={!isPlaying}>
        Pause
      </button>
      <div>Progress: {progress.toFixed(1)}%</div>
    </div>
  );
}
```

**After fix metrics:**

```
After Fix (1 week monitoring):
- Memory leaks detected: 0 instances ✅
- Average memory growth: 0.8MB per session (94% reduction)
- Interval leak rate: 0 (100% elimination)
- iOS Safari crashes: 0.3% (98% reduction)
- Progress bar freeze rate: 0% (100% elimination)
- Zombie intervals found: 0 (100% elimination)
- Bundle size: 129KB (2KB increase for proper cleanup)
- Performance score: 96/100 (up from 67)
```

**Key lessons learned:**

1. **Use refs for non-visual state**: Interval IDs, timeout IDs, subscriptions
2. **Clear intervals properly**: Store ref, clear before starting new, cleanup on unmount
3. **DOM refs for persistence**: One video element for component lifetime
4. **Avoid state for non-rendering values**: Prevents unnecessary re-renders
5. **Proper cleanup is critical**: Always clear intervals/timeouts in cleanup function
6. **Test unmount scenarios**: Use React DevTools to simulate unmounts during development

---

### ⚖️ Trade-offs

**useRef vs useState vs Regular Variables**

**1. useRef advantages:**
- ✅ No re-renders on mutation
- ✅ Persists across renders
- ✅ Synchronous updates (immediate)
- ✅ Perfect for DOM access
- ✅ Great for mutable tracking (timers, previous values)

**useRef disadvantages:**
- ❌ No automatic UI updates
- ❌ Requires manual synchronization with state
- ❌ Can lead to stale closures if not careful
- ❌ Debugging harder (mutations invisible to React DevTools)

**2. useState advantages:**
- ✅ Triggers re-renders automatically
- ✅ React DevTools shows state changes
- ✅ Integrates with React's reconciliation
- ✅ Better for values that affect rendering

**useState disadvantages:**
- ❌ Re-renders on every update (performance cost)
- ❌ Asynchronous updates (batched)
- ❌ Stale closure issues in event handlers
- ❌ Unnecessary re-renders for non-visual state

**3. Regular variables advantages:**
- ✅ Simplest syntax
- ✅ No React overhead
- ✅ Fast access

**Regular variables disadvantages:**
- ❌ Reset on every render
- ❌ Don't persist across renders
- ❌ Can't store values between renders

**Decision matrix:**

| Use Case | useRef | useState | Regular Variable |
|----------|--------|----------|------------------|
| DOM access | ✅ Best | ❌ No | ❌ No |
| Interval/timer IDs | ✅ Best | ❌ Causes re-renders | ❌ Resets |
| Previous props/state | ✅ Best | ⚠️ Complex | ❌ Resets |
| Form values (uncontrolled) | ✅ Good | ✅ Best | ❌ No |
| Animation frame IDs | ✅ Best | ❌ No | ❌ Resets |
| Third-party instances | ✅ Best | ❌ No | ❌ Resets |
| Visual state | ❌ No | ✅ Best | ❌ No |
| Render counter | ✅ Good | ❌ Infinite loop | ⚠️ Resets |
| Temporary calculations | ❌ Overkill | ❌ Overkill | ✅ Best |

**Performance comparison:**

```javascript
// Scenario: Tracking mouse position (60fps = 16.67ms per frame)

// ❌ BAD: Using state (causes re-render every frame)
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY }); // Re-render!
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return <div>Position: {position.x}, {position.y}</div>;
}
// Performance: 60 re-renders/sec, React busy reconciling
// Frame budget exceeded: 20-30ms per frame (janky)

// ✅ GOOD: Using ref (no re-renders, only when needed)
function MouseTracker() {
  const positionRef = useRef({ x: 0, y: 0 });
  const [displayPosition, setDisplayPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY }; // No re-render
    };

    const handleClick = () => {
      setDisplayPosition(positionRef.current); // Update UI only on click
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return <div>Last clicked position: {displayPosition.x}, {displayPosition.y}</div>;
}
// Performance: 0 re-renders during mouse move, only on click
// Frame budget maintained: <2ms per frame (smooth)
```

**Memory usage comparison:**

```javascript
// Storing 100 refs vs 100 states
// useRef: ~32 bytes per ref (object overhead + pointer)
// useState: ~32 bytes + re-render overhead + fiber updates

// 100 useRef: ~3.2KB
// 100 useState: ~3.2KB + re-render cost (much more expensive)
```

**When to combine ref + state:**

```javascript
// ✅ Best of both worlds pattern
function SearchInput() {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use ref for DOM manipulation
    inputRef.current.blur();
    // Use state for rendering
    console.log('Searching for:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* State for controlled input (UI updates) */}
      <input
        ref={inputRef} // Ref for DOM access
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

**Anti-patterns to avoid:**

```javascript
// ❌ DON'T use ref for values that should trigger renders
function Counter() {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1; // Updates but no re-render!
    // UI shows stale value
  };

  return <div>{countRef.current}</div>; // Won't update
}

// ✅ DO use state for values that affect rendering
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(c => c + 1); // Triggers re-render
  };

  return <div>{count}</div>; // Updates correctly
}

// ❌ DON'T mutate ref during render
function Component() {
  const renderCount = useRef(0);
  renderCount.current += 1; // Side effect in render! Bad!
  return <div>Render: {renderCount.current}</div>;
}

// ✅ DO mutate refs in effects or event handlers
function Component() {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1; // Safe in effect
  });

  return <div>Render count tracked in ref</div>;
}
```

---

### 💬 Explain to Junior

**Simple explanation:**

Think of `useRef` as a **special box** that React gives you. This box has one pocket called `.current` where you can store anything. The magical thing about this box is:

1. **It survives render storms**: No matter how many times your component re-renders, this box stays the same. It's like having a locker at school that keeps your stuff safe even when classes change.

2. **It's invisible to React**: When you put something in the box or take it out, React doesn't notice. It's like passing notes in class - the teacher (React) doesn't see it happening, so no reaction.

3. **It's perfect for backstage stuff**: Anything that needs to happen behind the scenes (like keeping track of timers, grabbing DOM elements, or remembering the last time something happened) goes in the ref box.

**Real-world analogy:**

Imagine you're a chef in a restaurant:

- **useState** is like your **order screen**: When orders change, you react and cook new dishes (re-render)
- **useRef** is like your **notepad**: You jot down timer notes, ingredient locations, or special instructions. These notes don't change what you're cooking right now, but they help you keep track of important info.

When the order screen updates → everyone in the kitchen reacts (re-render)
When you update your notepad → nobody notices, you just keep working (no re-render)

**Common useRef use cases explained:**

**1. Accessing DOM elements (most common):**

```javascript
function FocusInput() {
  // Create a ref box for the input
  const inputRef = useRef(null);

  const handleClick = () => {
    // Look in the box, find the input, and focus it
    inputRef.current.focus();
  };

  return (
    <>
      {/* Put the input element in the ref box */}
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  );
}

// Why this works:
// 1. React creates the input element
// 2. React puts it in inputRef.current
// 3. When you click button, you grab the element and focus it
// 4. No re-render needed - you just manipulated the DOM directly
```

**2. Keeping track of previous values:**

```javascript
function Greeter({ name }) {
  // Box to remember previous name
  const prevNameRef = useRef('');

  useEffect(() => {
    // After rendering, save current name as "previous" for next time
    prevNameRef.current = name;
  });

  return (
    <div>
      <p>Hello, {name}!</p>
      {prevNameRef.current && (
        <p>Previously: {prevNameRef.current}</p>
      )}
    </div>
  );
}

// Example flow:
// Render 1: name="Alice", prevNameRef.current="" → Shows "Hello, Alice!"
// After render: prevNameRef.current = "Alice"
// Render 2: name="Bob", prevNameRef.current="Alice" → Shows "Hello, Bob! Previously: Alice"
// After render: prevNameRef.current = "Bob"
```

**3. Storing timer IDs (prevent memory leaks):**

```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  // Box to store the interval ID
  const intervalRef = useRef(null);

  const start = () => {
    // Stop any old timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new timer and put its ID in the box
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stop = () => {
    // Look in box, get ID, stop timer
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Cleanup when component disappears
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

// Why use ref instead of state?
// If we used state for intervalRef, every time we store the ID,
// it would cause a re-render - totally unnecessary!
// The timer ID is backstage info - ref is perfect.
```

**Interview answer template:**

> "useRef is a React hook that returns a mutable object with a `.current` property. Unlike state, mutating a ref doesn't trigger re-renders. I use it for three main scenarios: accessing DOM elements directly, storing mutable values like timer IDs that don't affect rendering, and tracking previous prop or state values.
>
> For example, if I need to focus an input on button click, I'd create a ref with `useRef(null)`, attach it to the input using the `ref` attribute, and call `inputRef.current.focus()` in the click handler. This is efficient because we're just accessing the DOM without causing unnecessary re-renders.
>
> The key difference from useState is that refs are for values that don't directly impact the UI, while state is for values that should trigger re-renders when changed. Common mistake developers make is using state for timer IDs, which causes unnecessary re-renders - refs are the right choice there."

**Quick decision guide for juniors:**

```
Need to store a value across renders?
├─ Does changing it need to update the UI?
│  ├─ YES → useState ✅
│  └─ NO → useRef ✅
│
Need to access a DOM element?
└─ useRef ✅

Need to track previous props/state?
└─ useRef ✅

Need to store timer/interval ID?
└─ useRef ✅

Need to count renders (for debugging)?
└─ useRef ✅

Value only used in current render?
└─ Regular variable ✅
```

**Common mistakes to avoid:**

```javascript
// ❌ MISTAKE 1: Using ref value in render (can be stale)
function BadComponent() {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1;
  };

  // Stale value! Doesn't update on screen
  return <div>{countRef.current}</div>;
}

// ✅ FIX: Use state for rendering, ref for tracking
function GoodComponent() {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    countRef.current = newCount; // Keep ref in sync
  };

  return <div>{count}</div>;
}

// ❌ MISTAKE 2: Accessing ref during render
function BadComponent() {
  const inputRef = useRef(null);

  // Trying to use ref before React has assigned it
  console.log(inputRef.current.value); // null! Hasn't rendered yet

  return <input ref={inputRef} />;
}

// ✅ FIX: Access ref in useEffect or event handlers
function GoodComponent() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Now it's safe - React has assigned the DOM node
    console.log(inputRef.current.value);
  }, []);

  return <input ref={inputRef} />;
}

// ❌ MISTAKE 3: Forgetting to clean up refs
function BadTimer() {
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
  };

  // No cleanup! Memory leak when component unmounts
  return <button onClick={start}>Start</button>;
}

// ✅ FIX: Always clean up in useEffect return
function GoodTimer() {
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return <button onClick={start}>Start</button>;
}
```

---

## Question 2: What's the difference between useRef and useState? When to use each?

### Answer

`useRef` and `useState` are both hooks for persisting values across renders, but they serve fundamentally different purposes and behave differently:

**Key differences:**

| Feature | useRef | useState |
|---------|--------|----------|
| **Re-renders** | No re-renders on change | Triggers re-render on change |
| **Update timing** | Synchronous (immediate) | Asynchronous (batched) |
| **Purpose** | Non-visual state, DOM refs | Visual state, UI updates |
| **Mutability** | Mutable (`.current` directly) | Immutable (via setter function) |
| **Reactivity** | Not tracked by React | Tracked by React |

**When to use useRef:**

1. **DOM access**: Directly manipulate DOM elements (focus, scroll, measure)
2. **Mutable values**: Store values that change but don't affect rendering (timer IDs, counters, flags)
3. **Previous values**: Track previous props/state for comparison
4. **Instance variables**: Store class instance-like values (third-party library instances)
5. **Performance**: Avoid unnecessary re-renders for non-visual state

**When to use useState:**

1. **Visual state**: Any value that affects what's rendered on screen
2. **Form inputs**: Controlled component values
3. **Conditional rendering**: Flags that show/hide UI elements
4. **Lists/collections**: Data displayed to users
5. **UI feedback**: Loading states, error messages, success indicators

**Mental model:** If changing the value should update the UI → `useState`. If it's behind-the-scenes tracking → `useRef`.

---

### 🔍 Deep Dive

**Architectural Differences in React's Reconciliation**

Understanding the internal behavior reveals why each hook exists:

**useState internals:**

```javascript
// Simplified React internals
function useState(initialValue) {
  // React stores state in fiber's memoizedState queue
  const hook = {
    memoizedState: initialValue,
    queue: { pending: null },
    dispatch: null,
  };

  const dispatch = (action) => {
    // 1. Enqueue update
    hook.queue.pending = action;

    // 2. Schedule re-render
    scheduleUpdateOnFiber(currentlyRenderingFiber);

    // 3. React reconciliation begins
  };

  return [hook.memoizedState, dispatch];
}

// When you call setState:
setState(newValue);
// → Update enqueued
// → Component marked for re-render
// → Reconciliation scheduled
// → Virtual DOM diff
// → DOM updates
// → Browser repaint
```

**useRef internals:**

```javascript
// Simplified React internals
function useRef(initialValue) {
  // React stores ref in fiber's memoizedState
  const hook = {
    memoizedState: { current: initialValue },
  };

  // Return same object every render
  return hook.memoizedState;
}

// When you mutate ref.current:
ref.current = newValue;
// → Object property mutated
// → No React notification
// → No re-render scheduled
// → No reconciliation
// → No DOM updates
```

**Performance implications:**

The synchronous vs asynchronous update behavior has significant performance implications:

```javascript
// useState: Asynchronous batching
function StateCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Before setState:', count); // 0
    setCount(count + 1); // Enqueued
    setCount(count + 1); // Enqueued
    setCount(count + 1); // Enqueued
    console.log('After setState:', count); // Still 0!

    // React batches all three updates into one re-render
    // Final value: 1 (not 3! Each used stale count of 0)
  };

  return <button onClick={handleClick}>{count}</button>;
}

// Fix: Use functional updates
const handleClick = () => {
  setCount(c => c + 1); // c = 0 → 1
  setCount(c => c + 1); // c = 1 → 2
  setCount(c => c + 1); // c = 2 → 3
  // Final value: 3 ✅
};

// useRef: Synchronous immediate
function RefCounter() {
  const countRef = useRef(0);
  const [, forceRender] = useState({});

  const handleClick = () => {
    console.log('Before mutation:', countRef.current); // 0
    countRef.current += 1;
    countRef.current += 1;
    countRef.current += 1;
    console.log('After mutation:', countRef.current); // 3 (immediate!)

    forceRender({}); // Manual re-render needed to see on screen
  };

  return <button onClick={handleClick}>{countRef.current}</button>;
}
```

**Closure and stale value behavior:**

```javascript
// useState closure trap
function StateExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Closure over initial count (0)
      console.log('State count:', count); // Always 0!
      setCount(count + 1); // Always sets to 1
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty deps - closure formed over count=0

  return <div>{count}</div>; // Stuck at 1
}

// Fix: Use functional update
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1); // Always gets latest
  }, 1000);

  return () => clearInterval(timer);
}, []); // No closure issues

// useRef: Always current
function RefExample() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Always reads current value (no closure)
      console.log('Ref count:', countRef.current); // 0, 1, 2, 3...
      countRef.current += 1;
      setCount(countRef.current); // Trigger UI update
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Ref always has latest value

  return <div>{count}</div>;
}
```

**Memory and garbage collection:**

```javascript
// useState: React manages lifecycle
function StateComponent() {
  // React stores this in fiber's memoizedState
  const [heavyData, setHeavyData] = useState(() => {
    return new Array(1000000).fill('data');
  });

  // When component unmounts:
  // → React clears memoizedState
  // → heavyData becomes eligible for GC
  // → Memory freed automatically
}

// useRef: Manual cleanup needed
function RefComponent() {
  const heavyDataRef = useRef(null);

  useEffect(() => {
    heavyDataRef.current = new Array(1000000).fill('data');

    return () => {
      // Manual cleanup recommended for large data
      heavyDataRef.current = null;
      // Helps GC, though React will clean up on unmount anyway
    };
  }, []);
}
```

**Ref callbacks vs useRef:**

React supports both `useRef` and callback refs. Callback refs provide more control:

```javascript
// useRef: Simple, most common
function SimpleRef() {
  const divRef = useRef(null);

  useEffect(() => {
    console.log('Div dimensions:', {
      width: divRef.current.offsetWidth,
      height: divRef.current.offsetHeight,
    });
  }, []);

  return <div ref={divRef}>Content</div>;
}

// Callback ref: More control over lifecycle
function CallbackRef() {
  const [dimensions, setDimensions] = useState(null);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      // Called when element mounts
      const resizeObserver = new ResizeObserver((entries) => {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      });

      resizeObserver.observe(node);

      // Cleanup when element unmounts
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div ref={measuredRef}>
      {dimensions && (
        <p>Size: {dimensions.width} x {dimensions.height}</p>
      )}
    </div>
  );
}
```

**Combining refs and state effectively:**

```javascript
// ✅ Best practice: Ref for DOM, state for UI
function VideoPlayer({ src }) {
  // Ref for video element (DOM access)
  const videoRef = useRef(null);

  // State for UI elements
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Ref for interval (non-visual tracking)
  const progressIntervalRef = useRef(null);

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        // Read from ref, update state for UI
        setCurrentTime(videoRef.current.currentTime);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handlePlay = () => {
    videoRef.current.play(); // Ref for DOM manipulation
    setIsPlaying(true); // State for UI update
    startProgressTracking();
  };

  const handlePause = () => {
    videoRef.current.pause(); // Ref for DOM manipulation
    setIsPlaying(false); // State for UI update
    stopProgressTracking();
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration); // State for UI
  };

  useEffect(() => {
    return () => stopProgressTracking();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <button onClick={isPlaying ? handlePause : handlePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div>
        {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
      </div>
    </div>
  );
}
```

---

### 🐛 Real-World Scenario

**Problem: Animation Performance Degradation in Dashboard**

A SaaS analytics dashboard displayed real-time metrics with smooth number animations. Users reported choppy animations, frozen UI, and browser tab crashes when monitoring multiple metrics simultaneously.

**Initial implementation using only useState:**

```javascript
// ❌ PROBLEMATIC: All state causes constant re-renders
function AnimatedMetric({ value, duration = 1000 }) {
  // State for current animated value
  const [currentValue, setCurrentValue] = useState(0);

  // State for animation frame ID (causes re-renders!)
  const [frameId, setFrameId] = useState(null);

  useEffect(() => {
    const startValue = currentValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (difference * eased);

      // State update causes re-render every frame!
      setCurrentValue(newValue);

      if (progress < 1) {
        // Storing frame ID in state causes another re-render!
        const id = requestAnimationFrame(animate);
        setFrameId(id);
      }
    };

    animate();

    // Cleanup using stale frameId from closure
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId); // May cancel wrong frame!
      }
    };
  }, [value]); // Runs on every value change

  return (
    <div className="metric">
      <div className="value">{Math.round(currentValue)}</div>
    </div>
  );
}

// Dashboard with 20 animated metrics
function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    users: 0,
    sessions: 0,
    // ... 17 more metrics
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update all metrics every second
      setMetrics({
        revenue: Math.random() * 100000,
        users: Math.random() * 10000,
        sessions: Math.random() * 50000,
        // ... 17 more
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {Object.entries(metrics).map(([key, value]) => (
        <AnimatedMetric key={key} value={value} />
      ))}
    </div>
  );
}
```

**Production metrics showing the catastrophe:**

```
Before Fix (1 week monitoring, 1,247 users):
- Average frame rate: 23 FPS (target: 60 FPS)
- Frame drops: 62% of animation frames
- Re-renders per animation: ~60 (one per frame)
- Total re-renders/sec with 20 metrics: 1,200 re-renders/sec
- Main thread blocked time: 450ms per animation cycle
- Memory usage: 380MB average, 890MB peak
- Browser crashes: 47 incidents (3.8% of sessions)
- User complaints: 89 tickets about "laggy dashboard"
- Bounce rate: 34% (users leaving due to performance)
- CPU usage: 85-95% (single core maxed out)
- Time to interactive: 4.2 seconds
```

**Root cause analysis:**

1. **Re-render storm**: Each `setCurrentValue` call triggered full component re-render (60 times/second per metric)
2. **State for animation frames**: Storing `frameId` in state caused unnecessary re-renders
3. **20 metrics simultaneously**: 20 metrics × 60 FPS = 1,200 re-renders/second
4. **Stale closure**: `frameId` in cleanup captured stale value, causing frame leaks
5. **React overhead**: Reconciliation couldn't keep up with 60 FPS animation rate
6. **No frame skipping**: Every single frame forced React reconciliation
7. **Cascading re-renders**: Parent re-rendered children unnecessarily

**Optimized implementation using useRef:**

```javascript
// ✅ OPTIMIZED: Ref for animation state, setState only when needed
function AnimatedMetric({ value, duration = 1000 }) {
  // State: Only for final display value (minimal re-renders)
  const [displayValue, setDisplayValue] = useState(value);

  // Refs: Animation internals (no re-renders)
  const frameIdRef = useRef(null);
  const startValueRef = useRef(value);
  const startTimeRef = useRef(null);
  const currentValueRef = useRef(value);

  useEffect(() => {
    // Cancel any ongoing animation
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }

    startValueRef.current = currentValueRef.current;
    startTimeRef.current = Date.now();
    const targetValue = value;
    const difference = targetValue - startValueRef.current;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValueRef.current + (difference * eased);

      // Update ref (no re-render)
      currentValueRef.current = newValue;

      if (progress < 1) {
        // Store in ref (no re-render)
        frameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Only update state when animation complete
        setDisplayValue(Math.round(targetValue));
        frameIdRef.current = null;
      }
    };

    // Throttle updates: Update display every 50ms instead of every frame
    const updateDisplay = () => {
      setDisplayValue(Math.round(currentValueRef.current));
    };

    const displayUpdateInterval = setInterval(updateDisplay, 50);

    animate();

    return () => {
      // Clean up with current frameId (no stale closure)
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      clearInterval(displayUpdateInterval);
    };
  }, [value, duration]);

  return (
    <div className="metric">
      <div className="value">{displayValue}</div>
    </div>
  );
}

// Further optimization: Memoize metrics to prevent unnecessary re-renders
const AnimatedMetric = memo(function AnimatedMetric({ value, duration = 1000 }) {
  // ... same implementation as above
});

function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    users: 0,
    sessions: 0,
    // ... 17 more metrics
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        revenue: Math.random() * 100000,
        users: Math.random() * 10000,
        sessions: Math.random() * 50000,
        // ... 17 more
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {Object.entries(metrics).map(([key, value]) => (
        <AnimatedMetric key={key} value={value} />
      ))}
    </div>
  );
}
```

**After fix metrics:**

```
After Fix (1 week monitoring, 1,389 users):
- Average frame rate: 59 FPS ✅ (97% improvement)
- Frame drops: 3% of animation frames (95% improvement)
- Re-renders per animation: 20 (from 60) (67% reduction)
- Total re-renders/sec with 20 metrics: 400/sec (from 1,200) (67% reduction)
- Main thread blocked time: 12ms per animation cycle (97% improvement)
- Memory usage: 145MB average, 280MB peak (62% reduction)
- Browser crashes: 0 incidents (100% elimination)
- User complaints: 2 tickets (97% reduction)
- Bounce rate: 11% (68% improvement)
- CPU usage: 25-35% (70% reduction)
- Time to interactive: 1.1 seconds (74% improvement)
- User satisfaction score: 4.6/5 (up from 2.1/5)
```

**Advanced optimization: RAF pooling with single ref manager**

```javascript
// ✅ ENTERPRISE-LEVEL: Single animation coordinator for all metrics
function useAnimationCoordinator() {
  const animationsRef = useRef(new Map());
  const rafIdRef = useRef(null);

  const tick = useCallback(() => {
    const now = Date.now();
    const animations = animationsRef.current;

    animations.forEach((animation, id) => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = animation.startValue + (animation.difference * eased);

      animation.onUpdate(newValue);

      if (progress >= 1) {
        animation.onComplete();
        animations.delete(id);
      }
    });

    if (animations.size > 0) {
      rafIdRef.current = requestAnimationFrame(tick);
    } else {
      rafIdRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(({ startValue, targetValue, duration, onUpdate, onComplete }) => {
    const id = Math.random().toString(36);
    const animation = {
      startValue,
      targetValue,
      difference: targetValue - startValue,
      duration,
      startTime: Date.now(),
      onUpdate,
      onComplete,
    };

    animationsRef.current.set(id, animation);

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(tick);
    }

    return id;
  }, [tick]);

  const cancelAnimation = useCallback((id) => {
    animationsRef.current.delete(id);
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return { startAnimation, cancelAnimation };
}

// Usage: All 20 metrics share single RAF loop
function AnimatedMetric({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValueRef = useRef(value);
  const animationIdRef = useRef(null);
  const { startAnimation, cancelAnimation } = useAnimationCoordinator();

  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimation(animationIdRef.current);
    }

    animationIdRef.current = startAnimation({
      startValue: currentValueRef.current,
      targetValue: value,
      duration,
      onUpdate: (newValue) => {
        currentValueRef.current = newValue;
        setDisplayValue(Math.round(newValue));
      },
      onComplete: () => {
        animationIdRef.current = null;
      },
    });

    return () => {
      if (animationIdRef.current) {
        cancelAnimation(animationIdRef.current);
      }
    };
  }, [value, duration, startAnimation, cancelAnimation]);

  return <div className="value">{displayValue}</div>;
}

// Result: Single RAF loop for all 20 metrics
// Before: 20 RAF loops = 20 animation frames
// After: 1 RAF loop = 1 animation frame (batched updates)
```

**Key lessons learned:**

1. **useState for UI only**: Only use state for values that need to render
2. **useRef for animation internals**: Frame IDs, timing, intermediate values
3. **Throttle state updates**: Update display every 50ms, not every 16ms
4. **Batch animations**: Coordinate multiple animations in single RAF loop
5. **Memoize components**: Prevent parent re-renders from affecting children
6. **Monitor performance**: Use React DevTools Profiler to catch re-render storms
7. **Test at scale**: 1 animation works fine, 20 reveals performance issues

---

### ⚖️ Trade-offs

**Detailed Comparison Matrix**

**1. Re-render behavior:**

```javascript
// useState: Triggers reconciliation
function StateComponent() {
  const [count, setCount] = useState(0);

  console.log('Rendering...'); // Logs on every setCount

  const increment = () => {
    setCount(c => c + 1); // Schedules re-render
  };

  return <button onClick={increment}>{count}</button>;
}

// useRef: No reconciliation
function RefComponent() {
  const countRef = useRef(0);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  console.log('Rendering...'); // Only logs on forceUpdate

  const increment = () => {
    countRef.current += 1; // No re-render
    forceUpdate(); // Manual re-render
  };

  return <button onClick={increment}>{countRef.current}</button>;
}

// Performance comparison:
// 1000 updates:
// - useState: 1000 reconciliations + 1000 DOM updates
// - useRef + manual: 1000 mutations + 1 reconciliation + 1 DOM update
```

**2. Timing and synchronicity:**

```javascript
// useState: Asynchronous batched updates
function StateExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Before:', count); // 0

    setCount(1);
    console.log('After setState:', count); // Still 0 (async)

    setTimeout(() => {
      console.log('In timeout:', count); // Still 0 (closure)
    }, 0);
  };

  console.log('Render:', count); // 1 (eventually)

  return <button onClick={handleClick}>{count}</button>;
}

// useRef: Synchronous immediate updates
function RefExample() {
  const countRef = useRef(0);
  const [display, setDisplay] = useState(0);

  const handleClick = () => {
    console.log('Before:', countRef.current); // 0

    countRef.current = 1;
    console.log('After mutation:', countRef.current); // 1 (immediate)

    setTimeout(() => {
      console.log('In timeout:', countRef.current); // 1 (no closure)
    }, 0);

    setDisplay(countRef.current); // Trigger UI update
  };

  return <button onClick={handleClick}>{display}</button>;
}
```

**3. DevTools visibility:**

```javascript
// useState: Visible in React DevTools
function StateComponent() {
  const [name, setName] = useState('Alice');
  const [age, setAge] = useState(25);

  // DevTools shows:
  // State:
  //   name: "Alice"
  //   age: 25

  return <div>{name}, {age}</div>;
}

// useRef: Not visible in React DevTools
function RefComponent() {
  const nameRef = useRef('Alice');
  const ageRef = useRef(25);

  // DevTools shows:
  // Ref: { current: "Alice" }
  // Ref: { current: 25 }
  // (Not as clear, requires expanding objects)

  return <div>{nameRef.current}, {ageRef.current}</div>;
}
```

**4. Memory usage comparison:**

```javascript
// Test: Store 1000 values

// useState: More overhead per value
function StateHeavy() {
  const values = Array.from({ length: 1000 }, (_, i) => {
    const [value, setValue] = useState(i);
    return [value, setValue];
  });

  // Memory: ~32 bytes per state (value + hook + queue)
  // Total: ~32KB + React overhead
  // Re-render cost: High (1000 state updates)
}

// useRef: Less overhead per value
function RefHeavy() {
  const values = Array.from({ length: 1000 }, (_, i) => {
    const valueRef = useRef(i);
    return valueRef;
  });

  // Memory: ~24 bytes per ref (value + pointer)
  // Total: ~24KB
  // Re-render cost: Low (0 automatic re-renders)
}

// Verdict: useRef is slightly more memory efficient
// But the real savings is in re-render performance
```

**5. Use case decision tree:**

```
Need to store a value across renders?
│
├─ Will this value affect what's displayed on screen?
│  ├─ YES → useState
│  │  └─ Examples:
│  │     • Form input values
│  │     • Toggle states (open/closed, visible/hidden)
│  │     • Loading/error states
│  │     • List of items to display
│  │     • Current page/tab
│  │
│  └─ NO → useRef
│     └─ Examples:
│        • Timer/interval IDs
│        • Previous prop/state values
│        • Animation frame IDs
│        • WebSocket instances
│        • Focus/scroll position tracking
│
├─ Need to access DOM element?
│  └─ useRef (always)
│
├─ Need value in effect/event handler to be current?
│  ├─ useRef → Always current (no closure)
│  └─ useState → Requires functional update or deps
│
└─ Need to trigger side effects when value changes?
   ├─ useState → Can use in useEffect deps
   └─ useRef → Cannot use in deps (use state + ref combo)
```

**6. Combining useState and useRef (best practice):**

```javascript
// ✅ Pattern: State for UI, ref for tracking
function SearchInput() {
  // State: What the user sees
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refs: Behind-the-scenes tracking
  const abortControllerRef = useRef(null);
  const latestQueryRef = useRef('');
  const searchCountRef = useRef(0);

  const search = async (searchQuery) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Track query in ref (no re-render)
    latestQueryRef.current = searchQuery;
    searchCountRef.current += 1;
    const currentSearchCount = searchCountRef.current;

    // Update UI state
    setIsLoading(true);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/search?q=${searchQuery}`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await response.json();

      // Only update if this is still the latest search
      if (currentSearchCount === searchCountRef.current) {
        setResults(data);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error);
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery); // Update UI

    // Debounced search
    setTimeout(() => {
      if (latestQueryRef.current === newQuery) {
        search(newQuery);
      }
    }, 300);
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isLoading && <div>Loading...</div>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

// Why this pattern works:
// - State (query, results, isLoading): User sees these
// - Refs (abortController, latestQuery, searchCount): Internal tracking
// - Refs prevent race conditions without causing re-renders
// - State updates trigger UI updates when needed
```

**7. Performance benchmarks:**

```javascript
// Scenario: Update value 1000 times

// ❌ useState only (causes 1000 re-renders)
function StateOnly() {
  const [value, setValue] = useState(0);

  const update1000Times = () => {
    for (let i = 0; i < 1000; i++) {
      setValue(i); // 1000 re-renders queued
    }
  };

  // Performance:
  // - 1000 state updates
  // - 1000 reconciliations (React may batch, but still expensive)
  // - Time: ~500ms on average machine

  return <button onClick={update1000Times}>{value}</button>;
}

// ✅ useRef + final state update (1 re-render)
function RefOptimized() {
  const valueRef = useRef(0);
  const [display, setDisplay] = useState(0);

  const update1000Times = () => {
    for (let i = 0; i < 1000; i++) {
      valueRef.current = i; // No re-render
    }
    setDisplay(valueRef.current); // 1 re-render for final value
  };

  // Performance:
  // - 1000 ref mutations
  // - 1 state update
  // - 1 reconciliation
  // - Time: ~5ms on average machine

  return <button onClick={update1000Times}>{display}</button>;
}

// Result: useRef is 100x faster for non-visual updates
```

**8. Common anti-patterns:**

```javascript
// ❌ ANTI-PATTERN 1: Using state for interval IDs
function BadTimer() {
  const [intervalId, setIntervalId] = useState(null);

  const start = () => {
    const id = setInterval(() => {
      console.log('Tick');
    }, 1000);
    setIntervalId(id); // Unnecessary re-render!
  };

  return <button onClick={start}>Start</button>;
}

// ✅ FIX: Use ref for interval IDs
function GoodTimer() {
  const intervalIdRef = useRef(null);

  const start = () => {
    intervalIdRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // No re-render needed
  };

  return <button onClick={start}>Start</button>;
}

// ❌ ANTI-PATTERN 2: Using ref for values that affect UI
function BadCounter() {
  const countRef = useRef(0);

  const increment = () => {
    countRef.current += 1;
    // UI doesn't update!
  };

  return <button onClick={increment}>{countRef.current}</button>;
}

// ✅ FIX: Use state for values that render
function GoodCounter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(c => c + 1);
    // UI updates correctly
  };

  return <button onClick={increment}>{count}</button>;
}

// ❌ ANTI-PATTERN 3: Reading ref during render
function BadComponent({ threshold }) {
  const countRef = useRef(0);
  countRef.current += 1; // Side effect in render!

  // Conditional logic based on ref (unpredictable)
  if (countRef.current > threshold) {
    return <div>Over threshold</div>;
  }

  return <div>Under threshold</div>;
}

// ✅ FIX: Use state for render-dependent logic
function GoodComponent({ threshold }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(c => c + 1);
  });

  if (count > threshold) {
    return <div>Over threshold</div>;
  }

  return <div>Under threshold</div>;
}
```

---

### 💬 Explain to Junior

**Simple explanation:**

Imagine you're a chef preparing dishes in a restaurant:

**useState is like your ORDER BOARD:**
- When orders change, the kitchen springs into action (re-render)
- Everyone can see the order board
- When you update it, bells ring, lights flash, people react
- Example: "Table 5 wants pasta" → entire kitchen adjusts

**useRef is like your PERSONAL NOTEPAD:**
- You jot down notes for yourself (timer started, ingredient location)
- Nobody else reacts to your notes
- You can scribble/erase without anyone noticing
- Example: "Started timer at 3:45pm" → just for your tracking

**When to use each:**

```javascript
// useState: Things customers SEE
function MenuItem() {
  const [isAvailable, setIsAvailable] = useState(true); // Show on menu
  const [price, setPrice] = useState(12.99); // Display price

  // When these change, customers need to know (re-render)
  return (
    <div>
      <h3>Pasta</h3>
      <p>${price}</p>
      {isAvailable ? '✅ Available' : '❌ Sold out'}
    </div>
  );
}

// useRef: Things customers DON'T SEE
function Kitchen() {
  const timerRef = useRef(null); // Your personal timer
  const orderCountRef = useRef(0); // Your personal count

  const startCooking = () => {
    timerRef.current = setTimeout(() => {
      console.log('Pasta ready!');
    }, 600000); // 10 minutes

    orderCountRef.current += 1; // Track orders (internal)
  };

  // Customers don't see timer or count - just for you
  return <button onClick={startCooking}>Start Cooking</button>;
}
```

**Real-world examples for juniors:**

**Example 1: Focus management (useRef winner)**

```javascript
// Focus an input when button clicked
function LoginForm() {
  const usernameRef = useRef(null);

  const focusUsername = () => {
    // Directly grab the input and focus it
    usernameRef.current.focus();
  };

  return (
    <div>
      <input ref={usernameRef} placeholder="Username" />
      <button onClick={focusUsername}>Focus Username</button>
    </div>
  );
}

// Why useRef?
// - We're manipulating the DOM directly
// - No need to re-render just to focus an input
// - Ref gives us the actual HTML element
```

**Example 2: Toggle button (useState winner)**

```javascript
// Show/hide password
function PasswordInput() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      <input type={isVisible ? 'text' : 'password'} />
      <button onClick={toggleVisibility}>
        {isVisible ? '🙈 Hide' : '👁️ Show'}
      </button>
    </div>
  );
}

// Why useState?
// - isVisible changes what user sees (text vs password)
// - Need to re-render to show different input type
// - Button text changes based on state
```

**Example 3: Combining both (best practice)**

```javascript
// Auto-save form
function AutoSaveForm() {
  // State: What user sees
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Refs: Behind-the-scenes tracking
  const saveTimerRef = useRef(null);
  const textRef = useRef('');

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText); // Update UI
    textRef.current = newText; // Track latest value

    // Cancel previous save timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new save timer (debounced)
    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);

      // Save to server
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ text: textRef.current }),
      });

      setIsSaving(false);
      setLastSaved(new Date());
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <textarea value={text} onChange={handleChange} />

      {isSaving && <span>💾 Saving...</span>}
      {lastSaved && (
        <span>✅ Saved at {lastSaved.toLocaleTimeString()}</span>
      )}
    </div>
  );
}

// Why this pattern?
// - text, isSaving, lastSaved: User sees these → useState
// - saveTimerRef: Internal timer ID, user doesn't care → useRef
// - textRef: Track latest value without re-renders → useRef
```

**Quick decision flowchart for juniors:**

```
Does changing this value need to update what the user sees?
├─ YES → useState
│  Examples:
│  • Form input values
│  • Button text
│  • Show/hide states
│  • Lists of items
│  • Loading spinners
│
└─ NO → useRef
   Examples:
   • Timer IDs
   • Previous values (for comparison)
   • DOM elements (for focus/scroll)
   • Interval IDs
   • Animation frame IDs
```

**Interview answer template:**

> "The main difference between useRef and useState is that useState triggers re-renders when the value changes, while useRef doesn't. I use useState for values that affect what's displayed on screen, like form inputs, toggle states, or lists. I use useRef for behind-the-scenes values that don't need to trigger UI updates, like timer IDs, DOM element references, or tracking previous values.
>
> For example, if I'm building an auto-save form, I'd use useState for the text content (because users need to see what they're typing), but useRef for the debounce timer ID (because users don't need to know about the timer - it's just internal tracking).
>
> Another key difference is timing: useState updates are asynchronous and batched, while useRef mutations are synchronous and immediate. This makes refs great for values you need to read right away, like in intervals or animation frames.
>
> A common mistake is using useState for timer IDs, which causes unnecessary re-renders. Timer IDs should always go in refs because they're not visual state - they're just handles for cleanup."

**Common mistakes to avoid (junior-friendly):**

```javascript
// ❌ MISTAKE 1: Trying to display ref value directly
function BadCounter() {
  const countRef = useRef(0);

  return (
    <div>
      {/* This won't update when count changes! */}
      <p>Count: {countRef.current}</p>
      <button onClick={() => countRef.current += 1}>
        Increment
      </button>
    </div>
  );
}
// What happens: Button click updates ref, but screen doesn't change!

// ✅ FIX: Use state for values that render
function GoodCounter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// ❌ MISTAKE 2: Trying to access ref before it's set
function BadFocus() {
  const inputRef = useRef(null);

  // Trying to focus during render - ref is null!
  if (inputRef.current) {
    inputRef.current.focus(); // null! Doesn't work
  }

  return <input ref={inputRef} />;
}

// ✅ FIX: Access ref in useEffect or event handler
function GoodFocus() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Now ref is set - safe to use
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}

// ❌ MISTAKE 3: Forgetting to clean up refs
function BadTimer() {
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
  };

  // No cleanup! Interval keeps running even after unmount
  return <button onClick={start}>Start</button>;
}

// ✅ FIX: Always clean up in useEffect
function GoodTimer() {
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return <button onClick={start}>Start</button>;
}
```

**Memory trick for juniors:**

**STATE = STAGE** (Everyone sees it, causes reactions)
**REF = REFEREE'S NOTEPAD** (Only referee uses it, game continues)

When you update state → React re-renders (like announcing a goal → crowd reacts)
When you update ref → Nothing happens (like referee jotting down notes → game continues)

**Practice exercise for understanding:**

```javascript
// Challenge: Identify what should be state vs ref
function VideoPlayer({ src }) {
  // 1. Is video playing? → __________ (users see play/pause button)
  // 2. Current time? → __________ (users see progress bar)
  // 3. Video element? → __________ (DOM reference)
  // 4. Update interval ID? → __________ (internal tracking)
  // 5. Video duration? → __________ (users see total time)

  // Answers:
  // 1. isPlaying → useState (affects UI)
  // 2. currentTime → useState (displays on screen)
  // 3. videoRef → useRef (DOM element reference)
  // 4. intervalRef → useRef (internal, no UI impact)
  // 5. duration → useState (displays on screen)
}
```

