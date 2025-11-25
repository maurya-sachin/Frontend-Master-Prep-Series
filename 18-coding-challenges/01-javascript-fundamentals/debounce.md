# Implement Debounce Function

## Problem Statement

Implement a debounce function that delays the execution of a callback until after a specified wait time has elapsed since the last time it was invoked.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-30 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

---

## Requirements

- [ ] Function should delay execution until wait time has passed
- [ ] Subsequent calls within wait time should reset the timer
- [ ] Should preserve the context (this) of the original function
- [ ] Should pass all arguments to the callback
- [ ] Handle edge cases (null callback, negative wait time)
- [ ] Optional: Add immediate execution mode
- [ ] Optional: Add cancel method

---

## Real-World Use Cases

1. **Search Input** - Wait for user to stop typing before making API call
2. **Window Resize** - Debounce resize event handlers
3. **Scroll Events** - Reduce frequency of scroll calculations
4. **Button Clicks** - Prevent duplicate form submissions
5. **Auto-save** - Save draft after user stops editing

---

## Example Usage

```javascript
// Basic usage
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
  // API call here
}, 300);

debouncedSearch('a');    // Won't execute
debouncedSearch('ab');   // Won't execute
debouncedSearch('abc');  // Will execute after 300ms

// With context
const obj = {
  name: 'Test',
  greet: debounce(function() {
    console.log('Hello from', this.name);
  }, 500)
};

obj.greet(); // "Hello from Test" after 500ms
```

---

## Test Cases

```javascript
describe('debounce', () => {
  jest.useFakeTimers();

  test('delays execution until wait time has passed', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);

    debounced();
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('resets timer on subsequent calls', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);

    debounced();
    jest.advanceTimersByTime(500);

    debounced(); // Reset timer
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('preserves context and arguments', () => {
    const callback = jest.fn(function(arg) {
      return this.value + arg;
    });

    const obj = { value: 10 };
    const debounced = debounce(callback, 1000);

    debounced.call(obj, 5);
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledWith(5);
    expect(callback.mock.instances[0]).toBe(obj);
  });

  test('handles multiple arguments', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);

    debounced(1, 2, 3);
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledWith(1, 2, 3);
  });

  test('cancel method stops execution', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);

    debounced();
    debounced.cancel();
    jest.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  test('immediate mode executes on leading edge', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000, { immediate: true });

    debounced();
    expect(callback).toHaveBeenCalledTimes(1);

    debounced();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });
});
```

---

## Solution 1: Basic Debounce

```javascript
function debounce(callback, wait) {
  let timeoutId;

  return function(...args) {
    // Clear existing timer
    clearTimeout(timeoutId);

    // Set new timer
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, wait);
  };
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Simple and easy to understand
- Handles basic debounce functionality
- Preserves context and arguments

**Cons:**
- No cancel method
- No immediate execution option
- Timer ID not accessible

---

## Solution 2: Debounce with Cancel

```javascript
function debounce(callback, wait) {
  let timeoutId;

  const debounced = function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, wait);
  };

  // Add cancel method
  debounced.cancel = function() {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Includes cancel method
- Can stop pending execution
- Still simple

**Cons:**
- No immediate mode
- No return value handling

---

## Solution 3: Production-Ready Debounce

```javascript
function debounce(callback, wait, options = {}) {
  // Validate inputs
  if (typeof callback !== 'function') {
    throw new TypeError('Expected a function');
  }

  wait = +wait || 0;
  const immediate = options.immediate || false;

  let timeoutId;
  let lastCallTime;
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
    // Reset any `maxWait` timer
    lastInvokeTime = time;

    // Start the timer for the trailing edge
    timeoutId = setTimeout(timerExpired, wait);

    // Invoke on the leading edge if immediate
    return immediate ? invokeFunc(time) : result;
  }

  function timerExpired() {
    const time = Date.now();

    // If we should invoke on the trailing edge
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    // Restart the timer
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timeoutId = undefined;

    // Only invoke if we have `lastArgs` which means `debounced` was called
    if (lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeWaiting = wait - timeSinceLastCall;
    return timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, or enough time has elapsed
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 // Handle clock drift
    );
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
    }

    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }

    return result;
  }

  debounced.cancel = function() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = undefined;
  };

  debounced.flush = function() {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  debounced.pending = function() {
    return timeoutId !== undefined;
  };

  return debounced;
}
```

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Pros:**
- Complete implementation with all features
- Handles edge cases (clock drift, null checks)
- Includes cancel, flush, and pending methods
- Immediate execution mode
- Returns result of last invocation

**Cons:**
- More complex code
- Harder to understand initially

---

## Common Mistakes

### ❌ Mistake 1: Not preserving context

```javascript
function debounce(callback, wait) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    // Wrong: callback(...args) - loses 'this' context
    timeoutId = setTimeout(() => callback(...args), wait);
  };
}
```

### ✅ Correct: Use apply to preserve context

```javascript
function debounce(callback, wait) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args); // Preserves 'this'
    }, wait);
  };
}
```

### ❌ Mistake 2: Using arrow function for returned function

```javascript
function debounce(callback, wait) {
  let timeoutId;
  // Wrong: Arrow function has no 'this' binding
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, args), wait);
  };
}
```

### ✅ Correct: Use regular function

```javascript
function debounce(callback, wait) {
  let timeoutId;
  // Correct: Regular function can receive 'this'
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, args), wait);
  };
}
```

### ❌ Mistake 3: Not clearing previous timeout

```javascript
function debounce(callback, wait) {
  let timeoutId;
  return function(...args) {
    // Wrong: Not clearing previous timeout
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, wait);
  };
}
```

### ✅ Correct: Always clear previous timeout

```javascript
function debounce(callback, wait) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId); // Clear previous timer
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, wait);
  };
}
```

---

## Edge Cases

1. **Null/undefined callback** - Throw TypeError
2. **Negative wait time** - Treat as 0
3. **Multiple rapid calls** - Only last call should execute
4. **Context with arrow functions** - Won't work as expected
5. **Cancelled debounce** - Should not execute callback

---

## Follow-up Questions

1. **"What's the difference between debounce and throttle?"**
   - Debounce: Waits for inactivity period
   - Throttle: Executes at most once per time period

2. **"When would you use immediate mode?"**
   - Button clicks where you want instant feedback
   - First interaction should execute immediately

3. **"How would you implement maxWait option?"**
   - Track last invocation time
   - Force execution if maxWait exceeded

4. **"Can debounce cause memory leaks?"**
   - Yes, if callback holds references to large objects
   - Cancel debounce when component unmounts

5. **"How to test debounced functions?"**
   - Use Jest fake timers
   - Mock setTimeout/clearTimeout
   - Use jest.advanceTimersByTime()

---

## Practical Example: Search Input

```javascript
// Search component with debounced API call
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (!searchQuery.trim()) {
          setResults([]);
          return;
        }

        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error('Search failed:', error);
        }
      }, 300),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Resources

- [Lodash debounce](https://lodash.com/docs/4.17.15#debounce)
- [MDN: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [Debouncing and Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [JavaScript Debounce Function](https://davidwalsh.name/javascript-debounce-function)

---

[← Back to JavaScript Fundamentals](./README.md) | [Next: Throttle →](./throttle.md)
