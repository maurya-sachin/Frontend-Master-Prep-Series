# useDebounce Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All companies
**Time:** 20 minutes

---

## Problem Statement

Implement a `useDebounce` custom hook that delays updating a value until after a specified delay has passed since the last change.

### Requirements

- ✅ Delay value updates
- ✅ Clean up on unmount
- ✅ Reset timer on value change
- ✅ TypeScript support
- ✅ Handle edge cases

---

## Solution

### Basic Implementation

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timeout if value changes before delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // API call here
      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(data => console.log(data));
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

### Advanced: With Callback

```typescript
import { useEffect, useRef, useCallback } from 'react';

function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// Usage
function SearchWithCallback() {
  const [results, setResults] = useState([]);

  const searchAPI = useDebouncedCallback(async (term: string) => {
    const response = await fetch(`/api/search?q=${term}`);
    const data = await response.json();
    setResults(data);
  }, 500);

  return (
    <input
      type="text"
      onChange={(e) => searchAPI(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

### Production-Ready with Options

```typescript
interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

function useDebounce<T>(
  value: T,
  options: DebounceOptions = {}
): T {
  const {
    delay = 500,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);
  const hasInvokedRef = useRef(false);

  useEffect(() => {
    // Leading edge
    if (leading && !hasInvokedRef.current) {
      setDebouncedValue(value);
      hasInvokedRef.current = true;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
      hasInvokedRef.current = false;

      if (maxWaitRef.current) {
        clearTimeout(maxWaitRef.current);
        maxWaitRef.current = null;
      }
    }, delay);

    // Max wait handling
    if (maxWait && !maxWaitRef.current) {
      maxWaitRef.current = setTimeout(() => {
        setDebouncedValue(value);
        hasInvokedRef.current = false;
      }, maxWait);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitRef.current) {
        clearTimeout(maxWaitRef.current);
      }
    };
  }, [value, delay, leading, trailing, maxWait]);

  return debouncedValue;
}

// Usage with options
function AdvancedSearch() {
  const [search, setSearch] = useState('');

  // Update immediately on first keystroke, then debounce
  const debouncedSearch = useDebounce(search, {
    delay: 500,
    leading: true,    // Execute on first change
    trailing: true,   // Execute after delay
    maxWait: 2000     // Force execution after 2s
  });

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

---

### With Cancel Function

```typescript
function useDebounceWithCancel<T>(
  value: T,
  delay: number = 500
): [T, () => void, () => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(value);
  }, [value, cancel]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return cancel;
  }, [value, delay, cancel]);

  return [debouncedValue, cancel, flush];
}

// Usage
function SearchWithControls() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, cancelDebounce, flushDebounce] =
    useDebounceWithCancel(search, 500);

  const handleSubmit = () => {
    flushDebounce(); // Execute immediately
    // Submit search
  };

  const handleCancel = () => {
    cancelDebounce(); // Cancel pending debounce
    setSearch('');
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSubmit}>Search Now</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}
```

---

## Real-World Example: Autocomplete

```typescript
function Autocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    fetch(`/api/autocomplete?q=${debouncedQuery}`)
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search..."
      />

      {loading && <div className="spinner">Loading...</div>}

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((item, index) => (
            <li key={index} onClick={() => setQuery(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Not updated yet

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated'); // Now updated
  });

  test('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => jest.advanceTimersByTime(300));

    rerender({ value: 'c' });
    act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('a'); // Timer was reset

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('c'); // Now updated
  });

  test('should cleanup on unmount', () => {
    const { unmount } = renderHook(
      () => useDebounce('test', 500)
    );

    unmount();

    // Should not throw
    act(() => {
      jest.runAllTimers();
    });
  });
});
```

---

## Common Mistakes

- ❌ Not cleaning up timeouts (memory leaks)
- ❌ Creating new timeout on every render
- ❌ Not updating callback ref
- ❌ Forgetting TypeScript generics
- ❌ Not handling edge cases (empty values)

✅ Clean up in useEffect return
✅ Use useCallback for stable references
✅ Update refs properly
✅ Type-safe with generics
✅ Handle all edge cases

---

## Performance Comparison

```typescript
// ❌ BAD: Creates new debounced function every render
function BadSearch() {
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setTimeout(() => {
      // API call
    }, 500);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}

// ✅ GOOD: Properly debounced
function GoodSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // API call with debouncedSearch
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearch(e.target.value)} />;
}
```

---

[← Back to React Problems](./README.md)
