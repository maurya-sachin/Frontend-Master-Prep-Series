# Custom Hook: useLocalStorage

## Problem Statement

Create a custom React hook `useLocalStorage` that synchronizes state with localStorage. It should behave like `useState` but persist data across page reloads.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-25 minutes
**Companies:** Google, Meta, Amazon, Airbnb, Netflix

## Requirements

- [ ] Sync state with localStorage
- [ ] Handle JSON serialization/deserialization
- [ ] Support initial value (primitive or function)
- [ ] Update localStorage when state changes
- [ ] Handle localStorage quota exceeded errors
- [ ] Sync across multiple tabs/windows
- [ ] TypeScript support

## Example Usage

```javascript
function App() {
  const [name, setName] = useLocalStorage('name', 'Anonymous');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [user, setUser] = useLocalStorage('user', { id: null });

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <p>Name: {name}, Theme: {theme}</p>
    </div>
  );
}
```

## Solution

```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
```

## TypeScript Version

```typescript
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setStoredValue];
}
```

## Test Cases

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  test('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(localStorage.getItem('test')).toBe(JSON.stringify('updated'));
    expect(result.current[0]).toBe('updated');
  });

  test('reads existing value from localStorage', () => {
    localStorage.setItem('test', JSON.stringify('existing'));

    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('existing');
  });

  test('handles objects correctly', () => {
    const { result } = renderHook(() =>
      useLocalStorage('user', { name: 'John', age: 30 })
    );

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored).toEqual({ name: 'Jane', age: 25 });
  });

  test('handles function initial value', () => {
    const expensive = jest.fn(() => 'computed');
    const { result } = renderHook(() => useLocalStorage('test', expensive));

    expect(expensive).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe('computed');
  });
});
```

## Common Mistakes

❌ **Mistake:** Not handling JSON serialization errors
```javascript
// Wrong - crashes if value can't be stringified
localStorage.setItem(key, JSON.stringify(value));
```

✅ **Correct:** Wrap in try-catch
```javascript
try {
  localStorage.setItem(key, JSON.stringify(value));
} catch (error) {
  console.error('Failed to save to localStorage:', error);
}
```

## Real-World Applications

1. **User preferences** (theme, language, layout)
2. **Form data persistence** (draft emails, unsaved changes)
3. **Shopping cart** (e-commerce applications)
4. **Authentication tokens** (with encryption)

## Resources

- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [usehooks.com: useLocalStorage](https://usehooks.com/useLocalStorage/)
- [React Hooks FAQ](https://react.dev/reference/react)

---

[← Back to React Problems](./README.md)
