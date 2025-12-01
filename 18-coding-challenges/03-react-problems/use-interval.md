# useInterval Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All companies
**Time:** 25 minutes

---

## Problem Statement

Implement a `useInterval` custom hook that executes a callback at a specified interval. This is a fundamental hook for implementing timers, countdowns, and polling logic in React applications.

### Requirements

- ✅ Execute callback at regular intervals
- ✅ Clean up on unmount
- ✅ Support dynamic delay changes
- ✅ Support pause/resume functionality
- ✅ Handle null delay (disabled state)
- ✅ TypeScript support
- ✅ Dan Abramov's Hooks pattern
- ✅ No stale closures

---

## Solution

### Basic Implementation

```typescript
import { useEffect, useRef } from 'react';

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);

  return <div>{count}</div>;
}
```

---

### Explanation: Dan Abramov's Pattern

The key insight is separating two effects:

1. **Callback Reference Effect**: Always sync the latest callback to a ref
2. **Interval Effect**: Use the ref inside the interval, avoiding closure issues

```typescript
// ❌ WRONG: Closure captures old callback
function BadInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]); // Callback in dependency creates new interval every render!
}

// ✅ CORRECT: Dan Abramov pattern
function GoodInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Effect 1: Update saved callback without changing interval
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]); // Only syncs ref, no interval recreation

  // Effect 2: Create interval once, uses saved callback via ref
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]); // Only interval changes when delay changes
}
```

---

### Advanced: With Pause/Resume

```typescript
interface UseIntervalReturn {
  count: number;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  isActive: boolean;
}

function useInterval(
  callback: () => void,
  delay: number | null,
  autoStart: boolean = true
): UseIntervalReturn {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const savedCallback = useRef(callback);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      setCount(c => c + 1);
      savedCallback.current?.();
    }

    if (delay !== null && isActive) {
      intervalIdRef.current = setInterval(tick, delay);

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
    }
  }, [delay, isActive]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return {
    count,
    pause,
    resume,
    reset,
    isActive
  };
}

// Usage
function StopwatchComponent() {
  const { count, pause, resume, reset, isActive } = useInterval(
    () => {
      // Update logic here
    },
    1000,
    false // Don't auto-start
  );

  return (
    <div>
      <p>Elapsed: {count}s</p>
      {isActive ? (
        <button onClick={pause}>Pause</button>
      ) : (
        <button onClick={resume}>Resume</button>
      )}
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

### Advanced: Dynamic Delay Changes

```typescript
function useInterval(
  callback: () => void,
  delay: number | null | undefined,
  options: {
    immediate?: boolean;
    onCleanup?: () => void;
  } = {}
): void {
  const { immediate = false, onCleanup } = options;
  const savedCallback = useRef(callback);
  const savedOptions = useRef(options);

  useEffect(() => {
    savedCallback.current = callback;
    savedOptions.current = options;
  }, [callback, options]);

  useEffect(() => {
    // Handle immediate execution
    if (immediate && delay !== null && delay !== undefined) {
      savedCallback.current?.();
    }

    // Skip if delay is null/undefined
    if (delay === null || delay === undefined) {
      return;
    }

    function tick() {
      savedCallback.current?.();
    }

    const id = setInterval(tick, delay);

    return () => {
      clearInterval(id);
      savedOptions.current?.onCleanup?.();
    };
  }, [delay, immediate]);
}

// Usage: Dynamic interval change
function DynamicPolling() {
  const [interval, setInterval] = useState(5000);
  const [data, setData] = useState(null);

  useInterval(
    async () => {
      const res = await fetch('/api/data');
      const result = await res.json();
      setData(result);
    },
    interval,
    {
      immediate: true,
      onCleanup: () => console.log('Cleanup')
    }
  );

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={() => setInterval(2000)}>Faster (2s)</button>
      <button onClick={() => setInterval(5000)}>Normal (5s)</button>
      <button onClick={() => setInterval(10000)}>Slower (10s)</button>
    </div>
  );
}
```

---

### Production-Ready with TypeScript

```typescript
type IntervalCallback = () => void | Promise<void>;

interface UseIntervalOptions {
  autoStart?: boolean;
  immediate?: boolean;
  onError?: (error: Error) => void;
  maxExecutions?: number;
}

interface UseIntervalControls {
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
  executionCount: number;
}

function useInterval(
  callback: IntervalCallback,
  delay: number | null | undefined,
  options: UseIntervalOptions = {}
): UseIntervalControls {
  const {
    autoStart = true,
    immediate = false,
    onError,
    maxExecutions
  } = options;

  const [isRunning, setIsRunning] = useState(autoStart);
  const [executionCount, setExecutionCount] = useState(0);
  const savedCallback = useRef(callback);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setExecutionCount(0);
  }, []);

  useEffect(() => {
    // Validate max executions
    if (maxExecutions && executionCount >= maxExecutions) {
      stop();
      return;
    }

    // Execute immediately if requested
    if (immediate && isRunning) {
      try {
        savedCallback.current?.();
        setExecutionCount(c => c + 1);
      } catch (error) {
        onError?.(error as Error);
      }
    }

    // Skip if disabled
    if (delay === null || delay === undefined || !isRunning) {
      return;
    }

    async function tick() {
      try {
        await savedCallback.current?.();
        setExecutionCount(c => c + 1);
      } catch (error) {
        onError?.(error as Error);
      }
    }

    const id = setInterval(tick, delay);
    intervalIdRef.current = id;

    return () => {
      clearInterval(id);
      intervalIdRef.current = null;
    };
  }, [delay, isRunning, immediate, maxExecutions, executionCount, onError, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    start,
    stop,
    reset,
    isRunning,
    executionCount
  };
}

// Usage
function DataPoller() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const { start, stop, isRunning, executionCount } = useInterval(
    async () => {
      const res = await fetch('/api/data');
      const result = await res.json();
      setData(result);
    },
    5000,
    {
      autoStart: true,
      immediate: true,
      onError: (err) => setError(err.message),
      maxExecutions: 10
    }
  );

  return (
    <div>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
      <p>Executions: {executionCount}</p>
      <p>Data: {JSON.stringify(data)}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

## Real-World Examples

### Example 1: Countdown Timer

```typescript
function CountdownTimer({ initialSeconds = 60 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      setSeconds(s => {
        if (s <= 1) {
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    },
    isRunning ? 1000 : null
  );

  const handleStart = () => setIsRunning(true);
  const handleReset = () => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  };

  return (
    <div className="countdown">
      <p className="time">
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
      </p>
      {isRunning ? (
        <button onClick={() => setIsRunning(false)}>Pause</button>
      ) : (
        <button onClick={handleStart}>Start</button>
      )}
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

### Example 2: Real-Time Data Polling

```typescript
function LivePriceChart() {
  const [prices, setPrices] = useState<number[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState(null);

  const { executionCount } = useInterval(
    async () => {
      try {
        const res = await fetch('/api/price');
        const { price } = await res.json();
        setPrices(p => [...p.slice(-59), price]); // Keep last 60 prices
      } catch (err) {
        setError(err.message);
        setIsPolling(false);
      }
    },
    isPolling ? 1000 : null,
    {
      onError: (err) => {
        console.error('Price fetch failed:', err);
        setIsPolling(false);
      }
    }
  );

  return (
    <div>
      <h3>Live Price (fetches: {executionCount})</h3>
      <LineChart data={prices} />
      {error && <p className="error">{error}</p>}
      <button onClick={() => setIsPolling(!isPolling)}>
        {isPolling ? 'Stop Polling' : 'Start Polling'}
      </button>
    </div>
  );
}
```

### Example 3: Animated Counter

```typescript
function AnimatedCounter({ target = 100, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const incrementPerInterval = target / (duration / 100); // Update every 100ms

  useInterval(
    () => {
      setCount(c => {
        const next = c + incrementPerInterval;
        return next >= target ? target : next;
      });
    },
    count < target ? 100 : null
  );

  return <div className="counter">{Math.floor(count)}</div>;
}
```

---

## Test Cases

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should execute callback at specified interval', () => {
    const callback = jest.fn();

    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('should handle null delay (pause)', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Pause interval
    rerender({ delay: null });

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(1); // No additional calls

    // Resume interval
    rerender({ delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2); // Resumed
  });

  test('should always call latest callback', () => {
    let callbackVersion = 1;
    const callback1 = jest.fn(() => {
      callbackVersion = 1;
    });
    const callback2 = jest.fn(() => {
      callbackVersion = 2;
    });

    const { rerender } = renderHook(
      ({ callback }) => useInterval(callback, 1000),
      { initialProps: { callback: callback1 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Update callback
    rerender({ callback: callback2 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback1).toHaveBeenCalledTimes(1); // Still 1
    expect(callback2).toHaveBeenCalledTimes(1); // Called with new callback
  });

  test('should clean up on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(1); // No additional calls
  });

  test('should handle immediate execution', () => {
    const callback = jest.fn();

    renderHook(
      () => useInterval(callback, 1000, { immediate: true }),
      { initialProps: {} }
    );

    expect(callback).toHaveBeenCalledTimes(1); // Called immediately

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('should respect max executions', () => {
    const callback = jest.fn();

    renderHook(
      () => useInterval(callback, 1000, { maxExecutions: 3 }),
      { initialProps: {} }
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(3);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(callback).toHaveBeenCalledTimes(3); // No additional calls
  });

  test('should handle dynamic delay changes', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Change delay
    rerender({ delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2); // Executes with new delay
  });

  test('should call onError on callback error', () => {
    const error = new Error('Test error');
    const callback = jest.fn(() => {
      throw error;
    });
    const onError = jest.fn();

    renderHook(
      () => useInterval(callback, 1000, { onError }),
      { initialProps: {} }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});
```

---

## Common Mistakes

❌ **No useRef for callback**
```typescript
function BadInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]); // Creates new interval on every callback change!
}
```
✅ **Use useRef to avoid recreating interval**
```typescript
function GoodInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]); // Sync ref, no interval change

  useEffect(() => {
    const id = setInterval(() => savedCallback.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]); // Only interval changes
}
```

---

❌ **Not handling unmount cleanup**
```typescript
useEffect(() => {
  setInterval(() => {
    // Callback executes even after unmount!
  }, 1000);
}, []);
```
✅ **Always return cleanup function**
```typescript
useEffect(() => {
  const id = setInterval(() => {
    // Safe
  }, 1000);
  return () => clearInterval(id); // Cleanup
}, []);
```

---

❌ **Forgetting null delay handling**
```typescript
useEffect(() => {
  const id = setInterval(tick, delay); // Error if delay is null!
  return () => clearInterval(id);
}, [delay]);
```
✅ **Check delay before creating interval**
```typescript
useEffect(() => {
  if (delay === null) return;

  const id = setInterval(tick, delay);
  return () => clearInterval(id);
}, [delay]);
```

---

❌ **State mutations causing stale closures**
```typescript
let count = 0;
useInterval(() => {
  count++;
  console.log(count); // Always 1 on first render, stale closure
}, 1000);
```
✅ **Use setState with updater function**
```typescript
const [count, setCount] = useState(0);
useInterval(() => {
  setCount(c => c + 1); // Always gets latest count
}, 1000);
```

---

## Performance Comparison

```typescript
// ❌ BAD: Creates new interval on every render
function BadPolling() {
  const [data, setData] = useState(null);

  const fetchData = () => {
    fetch('/api/data').then(r => r.json()).then(setData);
  };

  useEffect(() => {
    const id = setInterval(fetchData, 5000); // New interval every render
    return () => clearInterval(id);
  }); // No dependencies!

  return <div>{JSON.stringify(data)}</div>;
}

// ✅ GOOD: Interval created once with callback ref
function GoodPolling() {
  const [data, setData] = useState(null);
  const savedFetch = useRef(fetchData);

  useEffect(() => {
    savedFetch.current = fetchData;
  }, []);

  useInterval(
    () => {
      fetch('/api/data').then(r => r.json()).then(setData);
    },
    5000
  );

  return <div>{JSON.stringify(data)}</div>;
}
```

---

## Complexity Analysis

| Aspect | Complexity | Notes |
|--------|-----------|-------|
| Time (per tick) | O(1) | Callback execution time depends on callback |
| Space | O(1) | Fixed refs and state |
| Initial setup | O(1) | Two useEffect calls |
| Interval cleanup | O(1) | Single clearInterval call |

---

## Interview Tips

1. **Start simple**: Explain basic pattern first
2. **Mention Dan Abramov's pattern**: Explain the two-effect pattern
3. **Address closure issues**: Show why useRef prevents stale closures
4. **Handle edge cases**: null delay, immediate execution, cleanup
5. **TypeScript**: Add type safety with generics
6. **Real example**: Discuss a countdown or polling use case
7. **Performance**: Explain why avoiding callback in deps is crucial
8. **Testing**: Mention fake timers with jest.useFakeTimers()

---

[← Back to React Problems](./README.md)
