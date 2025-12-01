# useIsMounted Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Airbnb
**Time:** 20 minutes

---

## Problem Statement

Implement a comprehensive `useIsMounted` custom hook for checking if a React component is mounted. This pattern is essential for preventing memory leaks when async operations complete after a component has unmounted.

### Requirements

- ✅ Return boolean indicating mount status
- ✅ Prevent state updates after unmount
- ✅ Support cleanup patterns for async operations
- ✅ Work with async functions and callbacks
- ✅ Handle edge cases (rapid mount/unmount)
- ✅ TypeScript support
- ✅ Minimal performance overhead
- ✅ No external dependencies

---

## Solution

### Basic Implementation

```typescript
import { useEffect, useRef } from 'react';

function useIsMounted(): boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef.current;
}

// Usage: Prevent state updates after unmount
function DataFetchComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    let controller = new AbortController();

    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
        }
      })
      .catch(err => {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isMounted]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

---

### Production-Ready with Callback Helper

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface IsMountedUtils {
  isMounted: boolean;
  getIsMounted: () => boolean;
  safeUpdate: (callback: () => void) => void;
}

function useIsMounted(): IsMountedUtils {
  const isMountedRef = useRef(true);

  // Provide function that always returns current state
  const getIsMounted = useCallback(() => isMountedRef.current, []);

  // Safe state update wrapper
  const safeUpdate = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isMounted: isMountedRef.current,
    getIsMounted,
    safeUpdate
  };
}

// Usage: With safeUpdate helper
function SmartDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { safeUpdate } = useIsMounted();

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      fetch('/api/data')
        .then(res => res.json())
        .then(result => {
          // No need to check isMounted - safeUpdate handles it
          safeUpdate(() => {
            setData(result);
            setLoading(false);
          });
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [safeUpdate]);

  if (loading) return <div>Loading...</div>;
  return <div>{data}</div>;
}
```

---

### Advanced: Generic Async Handler

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface AsyncOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface UseIsMountedReturn {
  isMounted: boolean;
  getIsMounted: () => boolean;
  safeUpdate: (callback: () => void) => void;
  safeAsync: <T>(
    promise: Promise<T>,
    onSuccess: (data: T) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
}

function useIsMounted(): UseIsMountedReturn {
  const isMountedRef = useRef(true);

  const getIsMounted = useCallback(() => isMountedRef.current, []);

  const safeUpdate = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  const safeAsync = useCallback(
    async <T,>(
      promise: Promise<T>,
      onSuccess: (data: T) => void,
      onError?: (error: Error) => void
    ) => {
      try {
        const result = await promise;

        if (isMountedRef.current) {
          onSuccess(result);
        }
      } catch (error) {
        if (isMountedRef.current && onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isMounted: isMountedRef.current,
    getIsMounted,
    safeUpdate,
    safeAsync
  };
}

// Usage: With async handler
function AdvancedDataComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { safeAsync } = useIsMounted();

  useEffect(() => {
    setLoading(true);
    safeAsync(
      fetch(`/api/users/${userId}`).then(res => res.json()),
      (data) => {
        setUser(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [userId, safeAsync]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>User: {user?.name}</div>;
}
```

---

### Expert: With Abort Pattern

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface UseIsMountedReturn {
  isMounted: boolean;
  getIsMounted: () => boolean;
  safeUpdate: (callback: () => void) => void;
  safeAsync: <T>(
    promise: Promise<T>,
    onSuccess: (data: T) => void,
    onError?: (error: Error) => void
  ) => AbortController;
  withAbort: <T>(
    asyncFn: (signal: AbortSignal) => Promise<T>,
    onSuccess: (data: T) => void,
    onError?: (error: Error) => void
  ) => () => void;
}

function useIsMounted(): UseIsMountedReturn {
  const isMountedRef = useRef(true);
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const getIsMounted = useCallback(() => isMountedRef.current, []);

  const safeUpdate = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);

  const safeAsync = useCallback(
    <T,>(
      promise: Promise<T>,
      onSuccess: (data: T) => void,
      onError?: (error: Error) => void
    ) => {
      const controller = new AbortController();
      controllersRef.current.add(controller);

      promise
        .then((result) => {
          // Check both mounted and not aborted
          if (isMountedRef.current && !controller.signal.aborted) {
            onSuccess(result);
          }
        })
        .catch((error) => {
          if (isMountedRef.current && !controller.signal.aborted && onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          }
        })
        .finally(() => {
          controllersRef.current.delete(controller);
        });

      return controller;
    },
    []
  );

  const withAbort = useCallback(
    <T,>(
      asyncFn: (signal: AbortSignal) => Promise<T>,
      onSuccess: (data: T) => void,
      onError?: (error: Error) => void
    ) => {
      const controller = new AbortController();
      controllersRef.current.add(controller);

      asyncFn(controller.signal)
        .then((result) => {
          if (isMountedRef.current && !controller.signal.aborted) {
            onSuccess(result);
          }
        })
        .catch((error) => {
          // Ignore abort errors
          if (error?.name === 'AbortError') return;

          if (isMountedRef.current && !controller.signal.aborted && onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          }
        })
        .finally(() => {
          controllersRef.current.delete(controller);
        });

      // Return cleanup function
      return () => controller.abort();
    },
    []
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Abort all pending requests
      controllersRef.current.forEach(controller => controller.abort());
      controllersRef.current.clear();
    };
  }, []);

  return {
    isMounted: isMountedRef.current,
    getIsMounted,
    safeUpdate,
    safeAsync,
    withAbort
  };
}

// Usage: Expert pattern with abort handling
function MusicPlayerComponent({ playlistId }: { playlistId: string }) {
  const [songs, setSongs] = useState<any[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { withAbort } = useIsMounted();

  useEffect(() => {
    setLoading(true);

    const cleanup = withAbort(
      async (signal) => {
        const response = await fetch(`/api/playlists/${playlistId}/songs`, { signal });
        if (!response.ok) throw new Error('Failed to load songs');
        return response.json();
      },
      (data) => {
        setSongs(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return cleanup; // Automatically cleanup/abort
  }, [playlistId, withAbort]);

  if (loading) return <div>Loading playlist...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="playlist">
      {songs.map(song => (
        <div key={song.id} className="song-item">
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Real-World Example: Form with API Validation

```typescript
function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { withAbort, safeUpdate } = useIsMounted();
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Validate email uniqueness
  const validateEmail = useCallback((newEmail: string) => {
    if (!newEmail.includes('@')) {
      safeUpdate(() => setEmailError('Invalid email format'));
      return;
    }

    setIsValidating(true);
    safeUpdate(() => setEmailError(''));

    // Cancel previous validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      withAbort(
        async (signal) => {
          const response = await fetch(`/api/validate/email?email=${newEmail}`, { signal });
          return response.json();
        },
        (result) => {
          if (!result.available) {
            setEmailError('Email already in use');
          }
          setIsValidating(false);
        },
        (error) => {
          if (error.name !== 'AbortError') {
            setEmailError('Validation failed');
          }
          setIsValidating(false);
        }
      );
    }, 500);
  }, [withAbort, safeUpdate]);

  // Validate username uniqueness
  const validateUsername = useCallback((newUsername: string) => {
    if (newUsername.length < 3) {
      safeUpdate(() => setUsernameError('Username too short'));
      return;
    }

    setIsValidating(true);
    safeUpdate(() => setUsernameError(''));

    withAbort(
      async (signal) => {
        const response = await fetch(`/api/validate/username?username=${newUsername}`, { signal });
        return response.json();
      },
      (result) => {
        if (!result.available) {
          setUsernameError('Username already taken');
        }
        setIsValidating(false);
      },
      () => {
        setIsValidating(false);
      }
    );
  }, [withAbort, safeUpdate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    validateUsername(newUsername);
  };

  return (
    <form className="registration-form">
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="email@example.com"
        />
        {emailError && <span className="error">{emailError}</span>}
      </div>

      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="username"
        />
        {usernameError && <span className="error">{usernameError}</span>}
      </div>

      {isValidating && <div className="status">Validating...</div>}

      <button type="submit" disabled={!!emailError || !!usernameError || isValidating}>
        Register
      </button>
    </form>
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useIsMounted', () => {
  test('should return true when mounted', () => {
    const { result } = renderHook(() => useIsMounted());

    expect(result.current.getIsMounted()).toBe(true);
  });

  test('should return false when unmounted', () => {
    const { result, unmount } = renderHook(() => useIsMounted());

    expect(result.current.getIsMounted()).toBe(true);

    unmount();

    expect(result.current.getIsMounted()).toBe(false);
  });

  test('should prevent state updates after unmount', async () => {
    const updateFn = jest.fn();

    const { unmount } = renderHook(() => {
      const { safeUpdate } = useIsMounted();
      useEffect(() => {
        setTimeout(() => {
          safeUpdate(() => updateFn());
        }, 100);
      }, [safeUpdate]);
    });

    unmount();
    jest.advanceTimersByTime(100);

    expect(updateFn).not.toHaveBeenCalled();
  });

  test('should execute callback if still mounted', async () => {
    const updateFn = jest.fn();

    renderHook(() => {
      const { safeUpdate } = useIsMounted();
      useEffect(() => {
        safeUpdate(() => updateFn());
      }, [safeUpdate]);
    });

    await waitFor(() => {
      expect(updateFn).toHaveBeenCalled();
    });
  });

  test('should handle async operations safely', async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { unmount } = renderHook(() => {
      const { safeAsync } = useIsMounted();
      useEffect(() => {
        safeAsync(
          Promise.resolve({ data: 'test' }),
          onSuccess,
          onError
        );
      }, [safeAsync]);
    });

    unmount();

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  test('should abort pending requests on unmount', async () => {
    const abortFn = jest.fn();
    const mockFetch = jest.fn();

    const { unmount } = renderHook(() => {
      const { withAbort } = useIsMounted();
      useEffect(() => {
        const cleanup = withAbort(
          async (signal) => {
            signal.addEventListener('abort', abortFn);
            return new Promise(resolve =>
              setTimeout(() => resolve({ data: 'test' }), 100)
            );
          },
          mockFetch
        );

        return cleanup;
      }, [withAbort]);
    });

    unmount();

    expect(abortFn).toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('should handle rapid mount/unmount', () => {
    const { unmount, rerender } = renderHook(() => useIsMounted());

    expect(result.current.getIsMounted()).toBe(true);
    unmount();
    expect(result.current.getIsMounted()).toBe(false);
  });

  test('should handle multiple safeAsync calls', async () => {
    const onSuccess1 = jest.fn();
    const onSuccess2 = jest.fn();

    renderHook(() => {
      const { safeAsync } = useIsMounted();
      useEffect(() => {
        safeAsync(Promise.resolve({ id: 1 }), onSuccess1);
        safeAsync(Promise.resolve({ id: 2 }), onSuccess2);
      }, [safeAsync]);
    });

    await waitFor(() => {
      expect(onSuccess1).toHaveBeenCalledWith({ id: 1 });
      expect(onSuccess2).toHaveBeenCalledWith({ id: 2 });
    });
  });

  test('should handle async errors safely', async () => {
    const onError = jest.fn();

    renderHook(() => {
      const { safeAsync } = useIsMounted();
      useEffect(() => {
        safeAsync(
          Promise.reject(new Error('Network error')),
          () => {},
          onError
        );
      }, [safeAsync]);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error('Network error'));
    });
  });

  test('should not execute callback if component unmounts before promise resolves', async () => {
    const onSuccess = jest.fn();

    const { unmount } = renderHook(() => {
      const { safeAsync } = useIsMounted();
      useEffect(() => {
        safeAsync(
          new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100)),
          onSuccess
        );
      }, [safeAsync]);
    });

    // Unmount before promise resolves
    unmount();

    // Wait past promise resolution
    jest.advanceTimersByTime(150);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
```

---

## Common Mistakes

- ❌ Not checking mounted status before setState
- ❌ Returning boolean instead of function (stale closures)
- ❌ Not aborting requests on unmount
- ❌ Forgetting cleanup in useEffect
- ❌ Multiple state updates in single callback
- ❌ Not handling aborted promise errors
- ❌ Accumulating abort controllers without cleanup

✅ Use ref to track mounted status
✅ Return getIsMounted() function for latest state
✅ Implement safeUpdate wrapper for state updates
✅ Track and abort all pending requests
✅ Clean up all controllers on unmount
✅ Handle AbortError separately
✅ Check mounted before each state update

---

## Performance Comparison

```typescript
// ❌ BAD: Direct state update after unmount (memory leak warning)
function BadDataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData); // Will warn if unmounted

    return () => {
      // No cleanup!
    };
  }, []);

  return <div>{data}</div>;
}

// ✅ GOOD: Use useIsMounted to prevent updates
function GoodDataComponent() {
  const [data, setData] = useState(null);
  const { safeUpdate } = useIsMounted();

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(result => safeUpdate(() => setData(result)));

    return () => {};
  }, [safeUpdate]);

  return <div>{data}</div>;
}

// ❌ BAD: Manual abort handling (error-prone)
function BadAbortComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, []);

  return <div>{data}</div>;
}

// ✅ GOOD: Built-in abort handling
function GoodAbortComponent() {
  const [data, setData] = useState(null);
  const { withAbort } = useIsMounted();

  useEffect(() => {
    return withAbort(
      async (signal) => {
        const response = await fetch('/api/data', { signal });
        return response.json();
      },
      (result) => setData(result),
      (error) => console.error(error)
    );
  }, [withAbort]);

  return <div>{data}</div>;
}
```

---

## Why This Pattern Matters

**Memory Leaks:**
When async operations complete after unmount, directly calling `setState` triggers React warnings and wastes memory. Using `useIsMounted` prevents this entirely.

**Race Conditions:**
Multiple async calls can complete out of order. The `isMounted` check ensures only the latest mounted state receives updates.

**Production Reliability:**
Console warnings in production indicate memory leaks. `useIsMounted` is essential for enterprise applications.

**AbortController Integration:**
The most modern approach (AbortController + Signal) requires tracking both mount status and abort state.

---

## Alternative Approaches

### Using AbortController Alone (Simpler)

```typescript
function useData(url: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [url]);

  return data;
}
```

**Pros:** Simpler, no ref needed
**Cons:** Relies on AbortController availability, doesn't handle all async patterns

### Using useMountEffect (Custom Hook)

```typescript
function useMountEffect(effect: () => void) {
  useEffect(effect, []);
}
```

**Pros:** Clear intent for mount-only effects
**Cons:** Doesn't solve post-unmount state update problems

---

## Key Concepts

**Reference Stability:**
Using `useRef` for `isMountedRef` is crucial because refs persist across renders and don't cause re-renders.

**Closure Patterns:**
The returned object maintains a closure over `isMountedRef`, ensuring always-current state checks.

**Cleanup Functions:**
The cleanup function in `useEffect` is the single source of truth for unmounting, making it the perfect place to set `isMounted = false`.

**AbortController Tracking:**
Maintaining a Set of controllers ensures all pending requests are cancelled on unmount, not just the latest one.

---

[← Back to React Problems](./README.md)
