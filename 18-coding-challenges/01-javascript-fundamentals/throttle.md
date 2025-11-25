# Implement Throttle Function

## Problem Statement

Implement a throttle function that ensures a callback is executed at most once per specified time interval, regardless of how many times it's invoked.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-30 minutes
**Companies:** Google, Meta, Netflix, Amazon

---

## Requirements

- [ ] Function should execute at most once per wait interval
- [ ] First call should execute immediately (by default)
- [ ] Subsequent calls within interval should be ignored
- [ ] Should preserve the context (this) of the original function
- [ ] Should pass all arguments to the callback
- [ ] Optional: Add trailing call support
- [ ] Optional: Add cancel method

---

## Real-World Use Cases

1. **Scroll Events** - Limit scroll handler execution frequency
2. **Window Resize** - Throttle resize calculations
3. **API Rate Limiting** - Prevent excessive API calls
4. **Button Clicks** - Prevent spam clicking
5. **Mouse Move** - Limit mousemove event handlers
6. **Auto-save** - Throttle save operations

---

## Example Usage

```javascript
// Basic usage
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 1000);

window.addEventListener('scroll', throttledScroll);
// Will execute at most once per second

// With context
const obj = {
  count: 0,
  increment: throttle(function() {
    this.count++;
    console.log('Count:', this.count);
  }, 500)
};

// Rapid calls
obj.increment(); // Executes immediately (count: 1)
obj.increment(); // Ignored (within 500ms)
obj.increment(); // Ignored (within 500ms)
// After 500ms
obj.increment(); // Executes (count: 2)
```

---

## Throttle vs Debounce

| Feature | Throttle | Debounce |
|---------|----------|----------|
| **Execution** | At most once per interval | After inactivity period |
| **First call** | Executes immediately | Waits for delay |
| **Rapid calls** | Some execute | Only last executes |
| **Use case** | Continuous events (scroll) | Burst events (typing) |

---

## Test Cases

```javascript
describe('throttle', () => {
  jest.useFakeTimers();

  test('executes immediately on first call', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 1000);

    throttled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('ignores calls within wait period', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 1000);

    throttled(); // Executes
    throttled(); // Ignored
    throttled(); // Ignored

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('executes again after wait period', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 1000);

    throttled(); // Executes (call 1)
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    throttled(); // Executes (call 2)
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('preserves context and arguments', () => {
    const callback = jest.fn(function(arg) {
      return this.value + arg;
    });

    const obj = { value: 10 };
    const throttled = throttle(callback, 1000);

    throttled.call(obj, 5);
    expect(callback).toHaveBeenCalledWith(5);
    expect(callback.mock.instances[0]).toBe(obj);
  });

  test('trailing call executes pending call', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 1000, { trailing: true });

    throttled(); // Executes immediately
    throttled(); // Queued for trailing
    throttled(); // Overwrites previous trailing

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2); // Initial + trailing
  });

  test('cancel prevents pending execution', () => {
    const callback = jest.fn();
    const throttled = throttle(callback, 1000, { trailing: true });

    throttled();
    throttled(); // Queued

    throttled.cancel();
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1); // Only initial call
  });
});
```

---

## Solution 1: Basic Throttle

```javascript
function throttle(callback, wait) {
  let lastCallTime = 0;

  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= wait) {
      lastCallTime = now;
      callback.apply(this, args);
    }
  };
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Simple and easy to understand
- Executes immediately on first call
- Minimal memory usage

**Cons:**
- No trailing call support
- No cancel method
- Loses intermediate calls

---

## Solution 2: Throttle with Trailing Call

```javascript
function throttle(callback, wait, options = {}) {
  let timeoutId;
  let lastCallTime = 0;
  let lastArgs;
  let lastThis;

  const leading = options.leading !== false;
  const trailing = options.trailing !== false;

  function invokeCallback() {
    lastCallTime = Date.now();
    timeoutId = null;
    callback.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    lastArgs = args;
    lastThis = this;

    // First call or after wait period
    if (!lastCallTime && leading) {
      lastCallTime = now;
      callback.apply(this, args);
      return;
    }

    // Within wait period
    if (timeSinceLastCall < wait) {
      // Clear existing timer
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Schedule trailing call if enabled
      if (trailing) {
        timeoutId = setTimeout(invokeCallback, wait - timeSinceLastCall);
      }
      return;
    }

    // After wait period
    lastCallTime = now;
    callback.apply(this, args);
  };
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Supports trailing call
- Configurable leading/trailing execution
- Handles rapid calls properly

**Cons:**
- More complex
- Still no cancel method

---

## Solution 3: Production-Ready Throttle

```javascript
function throttle(callback, wait, options = {}) {
  // Validate inputs
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a function');
  }

  wait = +wait || 0;
  const leading = options.leading !== false;
  const trailing = options.trailing !== false;

  let timeoutId;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs;
  let lastThis;
  let result;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = callback.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 // Handle clock drift
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart timer
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timeoutId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function throttled(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      // Handle invocations in a tight loop
      timeoutId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(lastCallTime) : result;
    }

    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }

    return result;
  }

  throttled.cancel = function() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = undefined;
  };

  throttled.flush = function() {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  throttled.pending = function() {
    return timeoutId !== undefined;
  };

  return throttled;
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Complete implementation with all features
- Handles edge cases (clock drift, tight loops)
- Cancel, flush, and pending methods
- Configurable leading/trailing
- Returns result of invocation

**Cons:**
- Most complex
- Harder to understand initially

---

## Common Mistakes

### ❌ Mistake 1: Using setTimeout for basic throttle

```javascript
function throttle(callback, wait) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) return; // Wrong approach!

    callback.apply(this, args);
    timeoutId = setTimeout(() => {
      timeoutId = null;
    }, wait);
  };
}
```

**Why it's wrong:** This doesn't actually throttle based on time intervals, it throttles based on callback execution time.

### ✅ Correct: Track last call time

```javascript
function throttle(callback, wait) {
  let lastCallTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      callback.apply(this, args);
    }
  };
}
```

### ❌ Mistake 2: Not preserving context

```javascript
function throttle(callback, wait) {
  let lastCallTime = 0;
  return (...args) => { // Arrow function loses context!
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      callback(...args); // Lost 'this'
    }
  };
}
```

### ✅ Correct: Use regular function

```javascript
function throttle(callback, wait) {
  let lastCallTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      callback.apply(this, args);
    }
  };
}
```

---

## Edge Cases

1. **First call** - Should execute immediately (leading edge)
2. **Rapid calls** - Should ignore calls within wait period
3. **Last call** - Optional trailing execution
4. **Zero wait** - Should execute every call
5. **Negative wait** - Treat as zero
6. **Clock drift** - Handle system time changes

---

## Follow-up Questions

1. **"What's the difference between throttle and debounce?"**
   - Throttle: Executes at regular intervals during continuous events
   - Debounce: Waits for pause in events before executing

2. **"When would you use leading vs trailing throttle?"**
   - Leading: Immediate feedback (button clicks)
   - Trailing: Capture final state (scroll position)

3. **"How does throttle affect performance?"**
   - Reduces function calls significantly
   - Prevents main thread blocking
   - Can miss intermediate values

4. **"Can throttle cause issues?"**
   - Yes, if wait time is too long
   - May miss important state changes
   - User actions might feel unresponsive

5. **"How to choose wait time?"**
   - Scroll: 100-200ms
   - Resize: 100-300ms
   - Mouse move: 50-100ms
   - API calls: 500-1000ms

---

## Practical Example: Infinite Scroll

```javascript
function InfiniteScroll() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/items');
      const newItems = await response.json();
      setItems(prev => [...prev, ...newItems]);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Throttle scroll handler
  const handleScroll = useMemo(
    () =>
      throttle(() => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Load more when near bottom (within 200px)
        if (scrollTop + windowHeight >= docHeight - 200) {
          loadMore();
        }
      }, 200), // Execute at most once per 200ms
    [isLoading]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel(); // Clean up
    };
  }, [handleScroll]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      {isLoading && <div>Loading...</div>}
    </div>
  );
}
```

---

## Performance Comparison

```javascript
// Without throttle: Handler called 100+ times during scroll
window.addEventListener('scroll', handleScroll);

// With throttle (200ms): Handler called ~5 times during 1s scroll
window.addEventListener('scroll', throttle(handleScroll, 200));

// Performance improvement: ~95% fewer function calls
```

---

## Resources

- [Lodash throttle](https://lodash.com/docs/4.17.15#throttle)
- [MDN: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [RequestAnimationFrame vs Throttle](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

---

[← Back: Debounce](./debounce.md) | [JavaScript Fundamentals](./README.md) | [Next: Memoize →](./memoize.md)
