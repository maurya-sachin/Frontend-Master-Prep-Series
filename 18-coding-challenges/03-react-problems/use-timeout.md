# useTimeout Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon
**Time:** 20 minutes

---

## Problem Statement

Implement a `useTimeout` custom hook that executes a callback function after a specified delay. The hook should support dynamic delays, manual reset, and proper cleanup.

### Requirements

- ✅ Execute callback after delay
- ✅ Support dynamic delay
- ✅ Reset functionality
- ✅ Cancel/clear timeout
- ✅ Proper cleanup on unmount
- ✅ TypeScript support
- ✅ Handle edge cases (zero/negative delays, null callbacks)

---

## Solution

### Basic Implementation

```typescript
import { useEffect, useRef, useCallback } from 'react';

function useTimeout(callback: () => void, delay: number | null): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up timeout
  useEffect(() => {
    // Only set timeout if delay is valid
    if (delay === null || delay < 0) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);

    // Cleanup: clear timeout on unmount or delay change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
}

// Usage
function DelayedAlert() {
  useTimeout(() => {
    console.log('3 seconds have passed!');
  }, 3000);

  return <div>Wait 3 seconds...</div>;
}
```

---

### Advanced: With Reset and Cancel

```typescript
import { useEffect, useRef, useCallback } from 'react';

function useTimeoutWithControls(
  callback: () => void,
  delay: number | null
): {
  reset: () => void;
  cancel: () => void;
  isActive: boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const isActiveRef = useRef(false);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      isActiveRef.current = false;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    cancel();

    if (delay === null || delay < 0) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
      isActiveRef.current = false;
    }, delay);

    isActiveRef.current = true;
  }, [delay, cancel]);

  // Initial setup
  useEffect(() => {
    reset();

    return cancel;
  }, [delay, reset, cancel]);

  return {
    reset,
    cancel,
    isActive: isActiveRef.current
  };
}

// Usage
function Notification() {
  const [message, setMessage] = useState('');

  const { reset, cancel, isActive } = useTimeoutWithControls(() => {
    setMessage('Notification dismissed!');
  }, 5000);

  const handleDismiss = () => {
    cancel();
    setMessage('Manually dismissed');
  };

  const handleReset = () => {
    reset();
    setMessage('Timer reset');
  };

  return (
    <div>
      <p>{message}</p>
      {isActive && (
        <>
          <button onClick={handleDismiss}>Dismiss</button>
          <button onClick={handleReset}>Reset Timer</button>
        </>
      )}
    </div>
  );
}
```

---

### Production-Ready with Lifecycle Hooks

```typescript
interface UseTimeoutOptions {
  delay: number | null;
  onTimeout?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  enabled?: boolean;
}

function useTimeoutAdvanced(
  callback: () => void,
  options: UseTimeoutOptions
): {
  reset: () => void;
  cancel: () => void;
  isActive: boolean;
  remainingTime: number;
} {
  const {
    delay,
    onTimeout,
    onCancel,
    onReset,
    enabled = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const startTimeRef = useRef<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(delay || 0);
  const [isActive, setIsActive] = useState(false);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Update remaining time
  useEffect(() => {
    if (!isActive || !startTimeRef.current || !delay) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current!;
      const remaining = Math.max(0, delay - elapsed);
      setRemainingTime(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsActive(false);
    startTimeRef.current = null;
    onCancel?.();
  }, [onCancel]);

  const reset = useCallback(() => {
    cancel();

    if (!enabled || delay === null || delay <= 0) {
      return;
    }

    startTimeRef.current = Date.now();
    setRemainingTime(delay);
    setIsActive(true);

    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
      setIsActive(false);
      onTimeout?.();
    }, delay);

    onReset?.();
  }, [delay, enabled, cancel, onTimeout, onReset]);

  // Initial setup and cleanup
  useEffect(() => {
    if (enabled && delay && delay > 0) {
      reset();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, enabled, reset]);

  return {
    reset,
    cancel,
    isActive,
    remainingTime
  };
}

// Usage
function Timer() {
  const [count, setCount] = useState(0);

  const { reset, cancel, isActive, remainingTime } = useTimeoutAdvanced(
    () => {
      setCount(prev => prev + 1);
      console.log('Timeout completed!');
    },
    {
      delay: 5000,
      onTimeout: () => console.log('Callback executed'),
      onCancel: () => console.log('Timer cancelled'),
      onReset: () => console.log('Timer reset'),
      enabled: true
    }
  );

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  return (
    <div>
      <p>Count: {count}</p>
      {isActive && <p>Time remaining: {formatTime(remainingTime)}s</p>}
      <button onClick={reset}>Reset ({isActive ? 'Running' : 'Idle'})</button>
      {isActive && <button onClick={cancel}>Cancel</button>}
    </div>
  );
}
```

---

### Comparison: useTimeout vs useEffect + setTimeout

```typescript
// ❌ BAD: Manual setup with useEffect + setTimeout
function BadTimeout() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Creating timeout every render
    const timeout = setTimeout(() => {
      setCount(count + 1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [count]); // Missing dependency or infinite loop

  return <div>Count: {count}</div>;
}

// ✅ GOOD: Using useTimeout hook
function GoodTimeout() {
  const [count, setCount] = useState(0);

  const { reset } = useTimeoutWithControls(() => {
    setCount(count + 1);
  }, 3000);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// Key Differences:
// 1. useTimeout abstracts cleanup logic
// 2. useTimeout provides reset/cancel controls
// 3. useTimeout handles dynamic delays better
// 4. useTimeout prevents callback stale closure issues
// 5. useTimeout provides remaining time tracking
// 6. useTimeout is reusable across components
```

---

## Real-World Example: Auto-Save with Reset

```typescript
function DocumentEditor() {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoSave = useCallback(() => {
    setIsSaving(true);

    // Simulate API call
    fetch('/api/documents/save', {
      method: 'POST',
      body: JSON.stringify({ content })
    })
      .then(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      })
      .catch(() => setIsSaving(false));
  }, [content]);

  const { reset, cancel } = useTimeoutWithControls(autoSave, 2000);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Reset timer every keystroke
    reset();
  };

  const handleManualSave = () => {
    cancel();
    autoSave();
  };

  return (
    <div className="editor">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing... Auto-saves after 2 seconds of inactivity"
      />

      <div className="status">
        {isSaving && <span>Saving...</span>}
        {lastSaved && (
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        )}
      </div>

      <button onClick={handleManualSave}>Save Now</button>
    </div>
  );
}
```

---

## Real-World Example: Countdown Timer

```typescript
function CountdownTimer({ initialSeconds = 60 }: { initialSeconds?: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const handleTick = useCallback(() => {
    setSeconds(prev => {
      if (prev <= 1) {
        setIsRunning(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  const { reset, cancel } = useTimeoutWithControls(
    handleTick,
    isRunning ? 1000 : null
  );

  useEffect(() => {
    if (isRunning) {
      reset();
    } else {
      cancel();
    }
  }, [isRunning, reset, cancel]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const restart = () => {
    setSeconds(initialSeconds);
    setIsRunning(true);
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="countdown">
      <h2>{formatTime(seconds)}</h2>

      {!isRunning && seconds > 0 && (
        <button onClick={start}>Start</button>
      )}

      {isRunning && (
        <button onClick={stop}>Pause</button>
      )}

      <button onClick={restart}>Restart</button>

      {seconds === 0 && (
        <p className="finished">Time's up!</p>
      )}
    </div>
  );
}
```

---

## Real-World Example: Modal Auto-Close

```typescript
function ConfirmationModal({
  isOpen,
  title,
  message,
  autoCloseDelay = 3000,
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  message: string;
  autoCloseDelay?: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { cancel, remainingTime, isActive } = useTimeoutAdvanced(
    onCancel,
    {
      delay: autoCloseDelay,
      enabled: isOpen,
      onCancel: () => console.log('Modal auto-closed')
    }
  );

  useEffect(() => {
    if (!isOpen) {
      cancel();
    }
  }, [isOpen, cancel]);

  if (!isOpen) return null;

  const formatTime = (ms: number) => (ms / 1000).toFixed(1);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>

        {isActive && (
          <p className="auto-close">
            Auto-closing in {formatTime(remainingTime)}s
          </p>
        )}

        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-primary">
            Confirm
          </button>
          <button onClick={() => { cancel(); onCancel(); }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Dynamic Delay Pattern

```typescript
function useDynamicTimeout(
  callback: () => void,
  delay: number | null,
  dependency: any
): void {
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);

  // Update refs
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    if (!delayRef.current || delayRef.current <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      callbackRef.current();
    }, delayRef.current);

    return () => clearTimeout(timeout);
  }, [dependency]); // Re-run when dependency changes
}

// Usage: Delay changes based on condition
function AdaptiveTimeout() {
  const [count, setCount] = useState(0);
  const delay = count < 5 ? 1000 : 5000; // Change delay based on count

  useDynamicTimeout(() => {
    setCount(prev => prev + 1);
  }, delay, count);

  return <div>Count: {count}</div>;
}
```

---

## Test Cases

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should execute callback after delay', () => {
    const callback = jest.fn();

    renderHook(() => useTimeout(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should not execute callback if delay is null', () => {
    const callback = jest.fn();

    renderHook(() => useTimeout(callback, null));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should support dynamic delay', () => {
    const callback = jest.fn();

    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Change delay
    rerender({ delay: 2000 });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should cleanup on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    unmount();

    act(() => {
      jest.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should support reset', () => {
    const callback = jest.fn();

    const { result } = renderHook(() =>
      useTimeoutWithControls(callback, 1000)
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Reset timer
    act(() => {
      result.current.reset();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should support cancel', () => {
    const callback = jest.fn();

    const { result } = renderHook(() =>
      useTimeoutWithControls(callback, 1000)
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Cancel timer
    act(() => {
      result.current.cancel();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle rapid resets', () => {
    const callback = jest.fn();

    const { result } = renderHook(() =>
      useTimeoutWithControls(callback, 1000)
    );

    for (let i = 0; i < 5; i++) {
      act(() => {
        jest.advanceTimersByTime(900);
        result.current.reset();
      });
    }

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should track remaining time', () => {
    const callback = jest.fn();

    const { result } = renderHook(() =>
      useTimeoutAdvanced(callback, {
        delay: 1000,
        enabled: true
      })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.remainingTime).toBeLessThanOrEqual(500);
    expect(result.current.isActive).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isActive).toBe(false);
    expect(callback).toHaveBeenCalled();
  });
});
```

---

## Common Mistakes

- ❌ Not updating callback ref (stale closure)
- ❌ Forgetting cleanup function (memory leaks)
- ❌ Not handling null/invalid delays
- ❌ Creating new callback every render
- ❌ Not resetting on dependency changes
- ❌ Mixing setTimeout logic in component

✅ Always use useRef for callback
✅ Clean up timeout in useEffect return
✅ Handle null and negative delays
✅ Use useCallback for stable functions
✅ Reset timer when dependencies change
✅ Provide cancel and reset controls

---

## Performance Tips

```typescript
// ❌ BAD: Callback changes every render
function BadComponent() {
  const handleTimeout = () => {
    console.log('timeout');
  };

  useTimeout(handleTimeout, 1000);
  return <div>...</div>;
}

// ✅ GOOD: Stable callback with useCallback
function GoodComponent() {
  const handleTimeout = useCallback(() => {
    console.log('timeout');
  }, []);

  useTimeout(handleTimeout, 1000);
  return <div>...</div>;
}

// ✅ BETTER: Using inline callback ref updates
function BetterComponent() {
  useTimeout(() => {
    console.log('timeout');
  }, 1000);
  return <div>...</div>;
}
```

---

## Edge Cases

```typescript
// Delay = 0 (immediate execution)
useTimeout(() => console.log('immediate'), 0);

// Negative delay (skip execution)
useTimeout(() => console.log('never'), -100);

// Null delay (pause)
useTimeout(() => console.log('later'), null);

// Very large delay
useTimeout(() => console.log('far future'), 2147483647); // Max 32-bit int

// Callback that throws
useTimeout(() => {
  throw new Error('callback error');
}, 1000); // Should be caught by error boundary

// Multiple hooks in same component
useTimeout(() => console.log('first'), 1000);
useTimeout(() => console.log('second'), 2000);
```

---

[← Back to React Problems](./README.md)
