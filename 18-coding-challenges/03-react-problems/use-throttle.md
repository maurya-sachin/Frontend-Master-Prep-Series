# useThrottle Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All companies
**Time:** 20-25 minutes

---

## Problem Statement

Implement a `useThrottle` custom hook that limits how often a function or value update is executed. Unlike debouncing which waits for inactivity, throttling ensures the function/value updates at most once per specified interval.

### Requirements

- ✅ Limit execution frequency
- ✅ Support leading and trailing edges
- ✅ Clean up on unmount
- ✅ Handle rapid value changes
- ✅ TypeScript support
- ✅ React-specific edge cases (cleanup, dependencies)

---

## Throttle vs Debounce: Critical Differences

### Debounce (Wait for calm)
- Waits for value changes to **stop** before executing
- Common use cases: Search, API calls, form validation
- Execution: Only once after delay with no new changes

### Throttle (Limit frequency)
- Executes at **regular intervals** regardless of change frequency
- Common use cases: Scroll, resize, mouse move, button clicks
- Execution: At most once per interval

```typescript
// Example: 10 rapid changes with 1000ms interval

// Debounce (delay: 1000ms):
// ===== ===== ===== (executes once after 1s of inactivity)

// Throttle (interval: 1000ms):
// = . . . . = . . . . = (executes at start, then every 1s)
// (with leading=true, trailing=true)
```

---

## Solution

### Basic Implementation (Value-based)

```typescript
import { useState, useEffect } from 'react';

function useThrottle<T>(value: T, interval: number = 1000): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  useEffect(() => {
    // Update immediately (leading edge)
    setThrottledValue(value);

    // Schedule next update
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, interval);

    // Cleanup timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}

// Usage
function ScrollListener() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 500);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <p>Scroll position: {throttledScrollY}px</p>
    </div>
  );
}
```

**Issue with basic implementation:**
- Updates immediately on every value change, defeating throttle purpose
- We need to track the last execution time instead

---

### Optimized Implementation with Execution Tracking

```typescript
import { useState, useEffect, useRef } from 'react';

function useThrottle<T>(
  value: T,
  interval: number = 1000
): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= interval) {
      // Enough time has passed, update immediately
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      // Schedule update after remaining interval
      const remainingTime = interval - timeSinceLastUpdate;
      const handler = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
      }, remainingTime);

      return () => clearTimeout(handler);
    }
  }, [value, interval]);

  return throttledValue;
}

// Usage: Efficient scroll position tracking
function ScrollPerformanceMonitor() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 500);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Can be called 100+ times per second on mobile
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, right: 0 }}>
      <p>Position: {throttledScrollY}px</p>
    </div>
  );
}
```

---

### Production-Ready with Leading/Trailing Options

```typescript
interface ThrottleOptions {
  interval?: number;
  leading?: boolean;  // Execute on first call
  trailing?: boolean; // Execute on last call after interval
}

function useThrottle<T>(
  value: T,
  options: ThrottleOptions = {}
): T {
  const {
    interval = 1000,
    leading = true,
    trailing = true
  } = options;

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(leading ? 0 : Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef<T>(value);

  useEffect(() => {
    lastValueRef.current = value;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (timeSinceLastUpdate >= interval) {
      // Enough time passed, execute immediately
      if (leading) {
        lastUpdatedRef.current = now;
        setThrottledValue(value);
      }
    } else if (trailing) {
      // Schedule trailing edge execution
      const remainingTime = interval - timeSinceLastUpdate;
      timeoutRef.current = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(lastValueRef.current);
        timeoutRef.current = null;
      }, remainingTime);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, interval, leading, trailing]);

  return throttledValue;
}

// Usage with options
function ResponsiveElementSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Only update throttle on trailing edge (after resize completes)
  const throttledSize = useThrottle(windowSize, {
    interval: 500,
    leading: false,
    trailing: true
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <p>Window: {throttledSize.width} x {throttledSize.height}</p>
    </div>
  );
}
```

---

### Callback-Based Throttle (for side effects)

```typescript
function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 1000,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = true, trailing = true } = options;

  const lastExecutedRef = useRef<number>(leading ? 0 : Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttled = ((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (timeSinceLastExecution >= interval) {
      if (leading) {
        lastExecutedRef.current = now;
        callbackRef.current(...args);
      }
    } else if (trailing) {
      const remainingTime = interval - timeSinceLastExecution;
      timeoutRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, remainingTime);
    }
  }) as T;

  return throttled;
}

// Usage: Button click limiting
function RateLimitedSubmit() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useThrottledCallback(
    async () => {
      try {
        const response = await fetch('/api/submit', { method: 'POST' });
        if (response.ok) {
          setSubmitted(true);
        }
      } catch (error) {
        console.error('Submit failed:', error);
      }
    },
    1000,
    { leading: true, trailing: false }
  );

  return (
    <div>
      <button onClick={handleSubmit}>Submit (Max 1/sec)</button>
      {submitted && <p>Submitted successfully!</p>}
    </div>
  );
}
```

---

### With Cancel and Flush Functions

```typescript
interface ThrottleControl<T> {
  value: T;
  cancel: () => void;
  flush: () => void;
}

function useThrottleWithControl<T>(
  value: T,
  interval: number = 1000
): ThrottleControl<T> {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef<T>(value);

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const flush = () => {
    cancel();
    lastUpdatedRef.current = Date.now();
    setThrottledValue(lastValueRef.current);
  };

  useEffect(() => {
    lastValueRef.current = value;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    cancel();

    if (timeSinceLastUpdate >= interval) {
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      const remainingTime = interval - timeSinceLastUpdate;
      timeoutRef.current = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(lastValueRef.current);
        timeoutRef.current = null;
      }, remainingTime);
    }

    return cancel;
  }, [value, interval]);

  return { value: throttledValue, cancel, flush };
}

// Usage: Game state with explicit state sync
function GameRenderer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const throttle = useThrottleWithControl(position, 16); // ~60fps

  const handleSync = () => {
    throttle.flush(); // Force immediate render
  };

  return (
    <div>
      <p>Position: {throttle.value.x}, {throttle.value.y}</p>
      <button onClick={handleSync}>Sync Now</button>
    </div>
  );
}
```

---

## Real-World Example: Infinite Scroll with Throttling

```typescript
function InfiniteScrollList() {
  const [items, setItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Throttle scroll event to max 1 check per 500ms
  const throttledScrollY = useThrottle(scrollY, 500);

  // Check if near bottom
  useEffect(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const isNearBottom = throttledScrollY + windowHeight >= documentHeight - 500;

    if (isNearBottom && !loading) {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        const newItems = Array.from(
          { length: 10 },
          (_, i) => `Item ${page * 10 + i + 1}`
        );
        setItems(prev => [...prev, ...newItems]);
        setPage(p => p + 1);
        setLoading(false);
      }, 500);
    }
  }, [throttledScrollY, page, loading]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {loading && <p>Loading more items...</p>}
    </div>
  );
}
```

---

## Real-World Example: Mouse Move Tracking

```typescript
function DragDropWithThrottle() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Throttle mouse position updates (smooth but performant)
  const throttledMousePos = useThrottle(mousePos, 16); // ~60fps

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      onMouseDown={() => setIsDragging(true)}
      style={{
        width: 100,
        height: 100,
        background: isDragging ? 'red' : 'blue',
        position: 'absolute',
        left: throttledMousePos.x,
        top: throttledMousePos.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    />
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle(value, interval),
      { initialProps: { value: 'initial', interval: 1000 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'second', interval: 1000 });
    expect(result.current).toBe('initial'); // Not updated yet

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('second'); // Now updated
  });

  test('should allow multiple rapid updates within interval', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    rerender({ value: 'c' });
    rerender({ value: 'd' });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should update to final value 'd'
    expect(result.current).toBe('d');
  });

  test('should respect leading option', () => {
    const { result, rerender } = renderHook(
      ({ value, options }) => useThrottle(value, options),
      {
        initialProps: {
          value: 'initial',
          options: { interval: 1000, leading: false, trailing: true }
        }
      }
    );

    expect(result.current).toBe('initial'); // Initial state set

    rerender({
      value: 'updated',
      options: { interval: 1000, leading: false, trailing: true }
    });

    // With leading: false, shouldn't update immediately
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  test('should respect trailing option', () => {
    const { result, rerender } = renderHook(
      ({ value, options }) => useThrottle(value, options),
      {
        initialProps: {
          value: 'initial',
          options: { interval: 1000, leading: true, trailing: false }
        }
      }
    );

    rerender({
      value: 'updated',
      options: { interval: 1000, leading: true, trailing: false }
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // With trailing: false, should not update after interval
    expect(result.current).toBe('updated'); // From leading edge
  });

  test('should cancel pending throttle on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'second' });

    unmount();

    // Should not throw
    act(() => {
      jest.runAllTimers();
    });
  });

  test('should work with objects', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: { count: 0 } } }
    );

    rerender({ value: { count: 1 } });
    rerender({ value: { count: 2 } });

    expect(result.current).toEqual({ count: 0 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toEqual({ count: 2 });
  });

  test('callback throttle should limit execution frequency', () => {
    const callback = jest.fn();

    const { result } = renderHook(() =>
      useThrottledCallback(callback, 1000, {
        leading: true,
        trailing: true
      })
    );

    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });

    expect(callback).toHaveBeenCalledWith('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledWith('call3');
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
```

---

## Time/Space Complexity Analysis

### Time Complexity
- **Value-based throttle**: O(1) per update
  - Computing elapsed time: O(1)
  - Setting state: O(1)
  - Managing timeouts: O(1)

- **Callback-based throttle**: O(1) per invocation
  - Time checks: O(1)
  - Timeout management: O(1)

### Space Complexity
- **Value-based**: O(1)
  - Fixed refs (lastUpdatedRef, timeoutRef): O(1)
  - Single state value: O(1)

- **Callback-based**: O(1)
  - Fixed refs (lastExecutedRef, timeoutRef, callbackRef): O(1)
  - No accumulated state

**Note:** Unlike debounce which might accumulate pending timers, throttle maintains constant space because only one pending timeout exists at a time.

---

## Common Mistakes

### ❌ Mistake 1: Basic throttle defeats purpose

```typescript
// Wrong - updates on every render anyway
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);

  useEffect(() => {
    setThrottledValue(value); // Updates immediately!
    const timer = setTimeout(() => {
      setThrottledValue(value);
    }, interval);

    return () => clearTimeout(timer);
  }, [value, interval]);

  return throttledValue;
}
```

✅ **Solution:** Track last execution time and only update if enough time has passed

```typescript
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdatedRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdatedRef.current >= interval) {
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    }
  }, [value, interval]);

  return throttledValue;
}
```

### ❌ Mistake 2: Confusing throttle with debounce

```typescript
// Wrong - this is actually debounce, not throttle
const throttledSearch = useThrottle(searchTerm, 500);

useEffect(() => {
  // This fires after 500ms of inactivity (debounce behavior)
  fetchResults(throttledSearch);
}, [throttledSearch]);
```

✅ **Solution:** Use throttle for events that fire frequently (scroll, resize), debounce for value changes that need to stabilize

### ❌ Mistake 3: Not cleaning up pending timeouts

```typescript
// Wrong - timeout leaks on unmount
function useThrottledCallback(callback, interval) {
  const timeoutRef = useRef(null);

  return (...args) => {
    timeoutRef.current = setTimeout(
      () => callback(...args),
      interval
    ); // Never cleared!
  };
}
```

✅ **Solution:** Clear timeout in useEffect cleanup

```typescript
function useThrottledCallback(callback, interval) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(
      () => callback(...args),
      interval
    );
  };
}
```

### ❌ Mistake 4: Incorrect leading/trailing logic

```typescript
// Wrong - both leading and trailing execute, defeating throttle
if (leading) setThrottledValue(value);
if (trailing) {
  setTimeout(() => setThrottledValue(value), interval);
}
```

✅ **Solution:** Only execute if enough time passed or if queued trailing edge is pending

### ❌ Mistake 5: Missing callback ref update

```typescript
// Wrong - callback changes won't be reflected
const throttled = useThrottledCallback(callback, 1000);

// callback changes but throttled still calls old callback
return <button onClick={throttled}>Click</button>;
```

✅ **Solution:** Update callback ref in useEffect

```typescript
const callbackRef = useRef(callback);

useEffect(() => {
  callbackRef.current = callback;
}, [callback]);

return useCallback((...args) => {
  callbackRef.current(...args);
}, []);
```

---

## Performance Benefits

### Real Numbers: Scroll Event Optimization

**Without throttle:**
- Scroll events fired: 100+ per second
- Value updates: 100+ per second
- Renders triggered: 100+ per second
- Paint operations: 100+ per second
- **Result:** Janky scrolling, 30+ FPS on mobile

**With throttle (16ms interval = ~60fps):**
- Scroll events fired: 100+ per second
- Value updates: ~60 per second (1 per 16ms)
- Renders triggered: ~60 per second
- Paint operations: ~60 per second
- **Result:** Smooth scrolling, 60 FPS maintained

```typescript
// CPU time comparison
// 60fps = 16.67ms per frame

// ❌ Without throttle: 100+ events/sec
// Each handler: 0.5ms → Total: 50ms+ (exceeds frame budget)

// ✅ With throttle: 60 events/sec
// Each handler: 0.5ms → Total: 30ms (within frame budget)
```

---

## Throttle vs Debounce: Decision Matrix

| Scenario | Use Throttle | Use Debounce |
|----------|-------------|--------------|
| Scroll position tracking | ✅ Yes | ❌ No |
| Window resize listener | ✅ Yes | ❌ No |
| Mouse move tracking | ✅ Yes | ❌ No |
| Search input (API call) | ❌ No | ✅ Yes |
| Form validation on type | ❌ No | ✅ Yes |
| Button click (prevent double-submit) | ✅ Yes | ❌ No |
| Autocomplete suggestions | ❌ No | ✅ Yes |
| Infinite scroll detection | ✅ Yes | ❌ No |

---

## Follow-Up Questions

1. **How would you implement throttle with leading=false to skip the first execution?**
   - Initialize `lastUpdatedRef` to `Date.now()` instead of 0

2. **What's the difference between throttle and requestAnimationFrame?**
   - Throttle: Fixed interval (e.g., 500ms)
   - RAF: Synced to browser repaint (~16.67ms/60fps), more efficient

3. **How to combine throttle with debounce?**
   - Throttle frequent events, then debounce the result for API calls

4. **Why not just use CSS throttling (e.g., `will-change`)?**
   - CSS helps rendering, but JS throttle prevents expensive computations altogether

5. **How to implement throttle for async operations?**
   - Track in-flight promises and skip new requests if one is pending

6. **What about throttle with maxWait like lodash?**
   - Force execution after maxWait even if interval hasn't passed

---

## Related Concepts

- **Debounce**: Delay execution until activity stops
- **RequestAnimationFrame**: Frame-synced throttling (60fps)
- **Web Workers**: Offload expensive computations triggered by throttled events
- **IntersectionObserver**: Throttle-friendly element visibility detection
- **ResizeObserver**: Efficient resize throttling
- **Passive event listeners**: Improve scroll performance alongside throttle

---

## Implementation Patterns Comparison

```typescript
// Pattern 1: Value-based (recommended for state sync)
const throttledValue = useThrottle(value, 500);

// Pattern 2: Callback-based (recommended for side effects)
const throttledFn = useThrottledCallback(fn, 500);

// Pattern 3: Custom hook combining both
function useThrottledState<T>(initialValue: T, interval: number) {
  const [value, setValue] = useState(initialValue);
  const throttledValue = useThrottle(value, interval);
  return [throttledValue, setValue];
}
```

---

[← Back to React Problems](./README.md)
