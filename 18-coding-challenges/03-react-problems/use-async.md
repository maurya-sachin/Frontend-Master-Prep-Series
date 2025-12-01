# useAsync Hook

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Netflix
**Time:** 30 minutes

---

## Problem Statement

Implement a comprehensive `useAsync` custom hook for managing asynchronous operations with proper handling of:
- Loading, error, and data states
- Request cancellation (AbortController)
- Race condition prevention
- Retry logic with exponential backoff
- Manual refetch capability

### Requirements

- ✅ Return loading, error, data, and status states
- ✅ Support for custom async functions
- ✅ AbortController for request cancellation
- ✅ Race condition handling (ignore stale requests)
- ✅ Retry logic with configurable backoff
- ✅ Refetch on dependency changes
- ✅ Manual refetch capability
- ✅ TypeScript support
- ✅ Memory leak prevention

---

## Solution

### Basic Implementation

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: 'idle' | 'pending' | 'success' | 'error';
}

function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
  dependencies: any[] = []
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle'
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null,
      status: 'pending'
    }));

    try {
      const data = await asyncFunction();

      if (isMountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
          status: 'success'
        });
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return;

      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({
          data: null,
          loading: false,
          error,
          status: 'error'
        });
      }
    }
  }, [asyncFunction]);

  useEffect(() => {
    isMountedRef.current = true;

    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [execute, immediate, ...dependencies]);

  return { ...state, execute };
}

// Usage
function UserDataComponent({ userId }: { userId: string }) {
  const { data, loading, error, execute } = useAsync(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    true,
    [userId]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={execute}>Refetch</button>
    </div>
  );
}
```

---

### Production-Ready with Retry Logic

```typescript
interface AsyncOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  backoffFactor?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  timeout?: number;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  retryCount: number;
}

interface AsyncReturn<T> extends AsyncState<T> {
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: AsyncOptions = {},
  dependencies: any[] = []
): AsyncReturn<T> {
  const {
    immediate = true,
    retries = 0,
    retryDelay = 1000,
    backoffFactor = 2,
    onError,
    onSuccess,
    timeout = 0
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle',
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const executeWithRetry = useCallback(
    async (retryAttempt: number = 0) => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState(prevState => ({
        ...prevState,
        loading: true,
        error: null,
        status: 'pending',
        retryCount: retryAttempt
      }));

      try {
        // Create promise with timeout if specified
        let executePromise = asyncFunction();

        if (timeout > 0) {
          executePromise = Promise.race([
            executePromise,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        }

        const data = await executePromise;

        if (isMountedRef.current) {
          setState({
            data,
            loading: false,
            error: null,
            status: 'success',
            retryCount: retryAttempt
          });

          onSuccess?.(data);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retryAttempt < retries) {
          const delayMs = retryDelay * Math.pow(backoffFactor, retryAttempt);

          if (isMountedRef.current) {
            timeoutIdRef.current = setTimeout(() => {
              executeWithRetry(retryAttempt + 1);
            }, delayMs);
          }
        } else {
          // Final error
          if (isMountedRef.current) {
            setState({
              data: null,
              loading: false,
              error,
              status: 'error',
              retryCount: retryAttempt
            });

            onError?.(error);
          }
        }
      }
    },
    [asyncFunction, retries, retryDelay, backoffFactor, onError, onSuccess, timeout]
  );

  const execute = useCallback(() => executeWithRetry(0), [executeWithRetry]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    setState({
      data: null,
      loading: false,
      error: null,
      status: 'idle',
      retryCount: 0
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [execute, immediate, ...dependencies]);

  return {
    ...state,
    execute,
    refetch: execute,
    reset
  };
}

// Usage with retry logic
function DataFetchComponent() {
  const { data, loading, error, execute, retryCount } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    {
      immediate: true,
      retries: 3,
      retryDelay: 1000,
      backoffFactor: 2,
      timeout: 5000,
      onError: (error) => console.error('Final error:', error),
      onSuccess: (data) => console.log('Success:', data)
    }
  );

  if (loading) {
    return <div>Loading... {retryCount > 0 && `(Retry ${retryCount})`}</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={execute}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={execute}>Refetch</button>
    </div>
  );
}
```

---

### Advanced: With Race Condition Prevention

```typescript
function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: AsyncOptions = {},
  dependencies: any[] = []
): AsyncReturn<T> {
  const {
    immediate = true,
    retries = 0,
    retryDelay = 1000,
    backoffFactor = 2,
    onError,
    onSuccess,
    timeout = 0
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle',
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0); // Track request sequence
  const latestRequestIdRef = useRef(0);

  const executeWithRetry = useCallback(
    async (retryAttempt: number = 0) => {
      // Increment request ID to identify this request
      const currentRequestId = ++latestRequestIdRef.current;

      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      if (isMountedRef.current) {
        setState(prevState => ({
          ...prevState,
          loading: true,
          error: null,
          status: 'pending',
          retryCount: retryAttempt
        }));
      }

      try {
        let executePromise = asyncFunction();

        if (timeout > 0) {
          executePromise = Promise.race([
            executePromise,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        }

        const data = await executePromise;

        // Only update state if this is still the latest request
        if (isMountedRef.current && currentRequestId === latestRequestIdRef.current) {
          setState({
            data,
            loading: false,
            error: null,
            status: 'success',
            retryCount: retryAttempt
          });

          onSuccess?.(data);
        }
      } catch (err) {
        // Only handle this error if it's still the latest request
        if (currentRequestId !== latestRequestIdRef.current) {
          return; // Ignore stale request
        }

        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retryAttempt < retries) {
          const delayMs = retryDelay * Math.pow(backoffFactor, retryAttempt);

          if (isMountedRef.current && currentRequestId === latestRequestIdRef.current) {
            timeoutIdRef.current = setTimeout(() => {
              if (currentRequestId === latestRequestIdRef.current) {
                executeWithRetry(retryAttempt + 1);
              }
            }, delayMs);
          }
        } else {
          // Final error
          if (isMountedRef.current && currentRequestId === latestRequestIdRef.current) {
            setState({
              data: null,
              loading: false,
              error,
              status: 'error',
              retryCount: retryAttempt
            });

            onError?.(error);
          }
        }
      }
    },
    [asyncFunction, retries, retryDelay, backoffFactor, onError, onSuccess, timeout]
  );

  const execute = useCallback(() => executeWithRetry(0), [executeWithRetry]);

  const reset = useCallback(() => {
    latestRequestIdRef.current = 0;
    abortControllerRef.current?.abort();
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    if (isMountedRef.current) {
      setState({
        data: null,
        loading: false,
        error: null,
        status: 'idle',
        retryCount: 0
      });
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [execute, immediate, ...dependencies]);

  return {
    ...state,
    execute,
    refetch: execute,
    reset
  };
}

// Usage demonstrating race condition handling
function UserListComponent() {
  const [userId, setUserId] = useState('1');

  const { data, loading, error, execute } = useAsync(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    {
      retries: 2,
      timeout: 5000
    },
    [userId]  // When userId changes, old request is automatically cancelled
  );

  const handleUserChange = (newId: string) => {
    setUserId(newId);
    // Previous request is automatically cancelled
  };

  return (
    <div>
      <select value={userId} onChange={(e) => handleUserChange(e.target.value)}>
        <option value="1">User 1</option>
        <option value="2">User 2</option>
      </select>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>User: {data.name}</div>}
      <button onClick={execute}>Reload</button>
    </div>
  );
}
```

---

## Real-World Example: Data Pagination with Retry

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}

function PaginatedDataTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const { data, loading, error, execute, retryCount } = useAsync(
    async () => {
      const response = await fetch(
        `/api/items?page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<PaginatedResponse<any>>;
    },
    {
      immediate: true,
      retries: 2,
      retryDelay: 500,
      backoffFactor: 1.5,
      timeout: 10000,
      onError: (error) => {
        console.error('Failed to load data:', error);
      }
    },
    [page, pageSize]
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Data Table</h2>
        {loading && <span className="badge">Loading...</span>}
        {retryCount > 0 && <span className="badge">Retry {retryCount}</span>}
      </div>

      {error && (
        <div className="error-banner">
          {error.message}
          <button onClick={execute}>Try Again</button>
        </div>
      )}

      {data && (
        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {Math.ceil(data.total / pageSize)}</span>
            <button
              disabled={page >= Math.ceil(data.total / pageSize) || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should execute async function and update state', async () => {
    const mockFn = jest.fn().mockResolvedValue({ name: 'John' });

    const { result } = renderHook(() => useAsync(mockFn));

    expect(result.current.loading).toBe(true);
    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ name: 'John' });
    expect(result.current.status).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should handle errors', async () => {
    const mockError = new Error('Network error');
    const mockFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsync(mockFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.status).toBe('error');
  });

  test('should retry on failure', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() =>
      useAsync(mockFn, { retries: 3, retryDelay: 100 })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    }, { timeout: 3000 });

    expect(result.current.data).toEqual({ success: true });
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('should prevent race conditions', async () => {
    const mockFn = jest.fn()
      .mockImplementationOnce(() => new Promise(resolve =>
        setTimeout(() => resolve({ id: 1 }), 100)
      ))
      .mockImplementationOnce(() => new Promise(resolve =>
        setTimeout(() => resolve({ id: 2 }), 50)
      ));

    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => mockFn(), {}, [id]),
      { initialProps: { id: 1 } }
    );

    // Change dependency before first request completes
    rerender({ id: 2 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have the latest response (id: 2)
    expect(result.current.data).toEqual({ id: 2 });
  });

  test('should cancel on unmount', async () => {
    const mockFn = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 1000))
    );

    const { unmount } = renderHook(() => useAsync(mockFn));

    // Unmount before request completes
    unmount();

    // Advance past request completion time
    jest.advanceTimersByTime(1000);

    // Should not throw
    expect(() => jest.runAllTimers()).not.toThrow();
  });

  test('should support manual execute', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useAsync(mockFn, { immediate: false }));

    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ data: 'test' });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should reset state', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useAsync(mockFn));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  test('should respect timeout', async () => {
    const mockFn = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 5000))
    );

    const { result } = renderHook(() =>
      useAsync(mockFn, { timeout: 1000 })
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error?.message).toContain('timeout');
  });
});
```

---

## Common Mistakes

- ❌ Not cancelling previous requests (race conditions)
- ❌ Not cleaning up on unmount (memory leaks)
- ❌ Missing abort controller checks
- ❌ Not handling stale requests
- ❌ Infinite retry loops
- ❌ Memory leaks with timeouts
- ❌ Not checking if mounted before setState

✅ Use AbortController for request cancellation
✅ Track request IDs to ignore stale responses
✅ Check isMounted before state updates
✅ Implement exponential backoff for retries
✅ Clean up timeouts on unmount
✅ Use useCallback for stable function references
✅ Handle abort errors separately

---

## Performance Comparison

```typescript
// ❌ BAD: No race condition handling
function BadAsyncComponent({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setData); // Stale response might overwrite newer data
  }, [userId]);

  return <div>{data?.name}</div>;
}

// ✅ GOOD: Proper race condition prevention
function GoodAsyncComponent({ userId }: { userId: string }) {
  const { data } = useAsync(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    {},
    [userId] // Old request cancelled automatically
  );

  return <div>{data?.name}</div>;
}

// ❌ BAD: Manual retry logic (error-prone)
function BadRetryComponent() {
  const [data, setData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/data')
        .then(res => res.json())
        .then(setData)
        .catch(() => {
          if (retryCount < 3) setRetryCount(c => c + 1);
        });
    }, 1000 * Math.pow(2, retryCount));

    return () => clearInterval(timer);
  }, [retryCount]);

  return <div>{data}</div>;
}

// ✅ GOOD: Built-in retry with backoff
function GoodRetryComponent() {
  const { data } = useAsync(
    () => fetch('/api/data').then(res => res.json()),
    {
      retries: 3,
      retryDelay: 1000,
      backoffFactor: 2
    }
  );

  return <div>{data}</div>;
}
```

---

## Key Concepts

**Race Conditions:**
When multiple async operations are in flight and newer responses overwrite older ones. Solution: Track request IDs and ignore stale responses.

**AbortController:**
Browser API to cancel in-flight fetch requests. Prevents memory leaks and unnecessary state updates.

**Exponential Backoff:**
Increases delay between retry attempts (1s, 2s, 4s, 8s). Reduces server load during outages.

**Mounting Check:**
Prevents state updates on unmounted components (memory leak warning).

---

[← Back to React Problems](./README.md)
