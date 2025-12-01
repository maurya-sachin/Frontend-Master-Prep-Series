# useToggle Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Microsoft, Apple
**Time:** 20-25 minutes

---

## Problem Statement

Create a custom React hook `useToggle` that manages a boolean state with toggle functionality. It should support optional initial values and multiple toggle modes for different use cases.

### Requirements

- ✅ Toggle boolean state
- ✅ Support optional initial value parameter
- ✅ Support multiple toggle modes (single value, multiple values)
- ✅ Return state and toggle function
- ✅ TypeScript support with generics
- ✅ Memory efficient cleanup
- ✅ Predictable behavior

---

## Solution

### Basic Implementation

```typescript
import { useState, useCallback } from 'react';

function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState(prevState => !prevState);
  }, []);

  return [state, toggle];
}

// Usage
function Modal() {
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <div>
      <button onClick={toggleOpen}>
        {isOpen ? 'Close' : 'Open'} Modal
      </button>
      {isOpen && <div className="modal">Modal Content</div>}
    </div>
  );
}
```

---

### Advanced: With Set Methods

```typescript
import { useState, useCallback } from 'react';

interface UseToggleReturn {
  state: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  const setValue = useCallback((value: boolean) => {
    setState(value);
  }, []);

  return {
    state,
    toggle,
    setTrue,
    setFalse,
    setValue
  };
}

// Usage
function Dropdown() {
  const { state: isOpen, toggle, setFalse } = useToggle(false);

  const handleSelect = () => {
    setFalse(); // Close dropdown after selection
  };

  return (
    <div className="dropdown">
      <button onClick={toggle}>Menu</button>
      {isOpen && (
        <ul>
          <li onClick={handleSelect}>Option 1</li>
          <li onClick={handleSelect}>Option 2</li>
        </ul>
      )}
    </div>
  );
}
```

---

### Multi-Value Toggle (Advanced TypeScript)

```typescript
import { useState, useCallback } from 'react';

function useToggle<T = boolean>(
  initialValue: T,
  ...values: T[]
): [T, () => void, (index: number) => void] {
  const [state, setState] = useState(initialValue);

  // All possible values for toggling
  const allValues = [initialValue, ...values];

  const toggle = useCallback(() => {
    setState(prevState => {
      const currentIndex = allValues.indexOf(prevState);
      const nextIndex = (currentIndex + 1) % allValues.length;
      return allValues[nextIndex];
    });
  }, [allValues]);

  const setValueByIndex = useCallback((index: number) => {
    if (index >= 0 && index < allValues.length) {
      setState(allValues[index]);
    }
  }, [allValues]);

  return [state, toggle, setValueByIndex];
}

// Usage with cycle through states
function ThemeToggle() {
  const [theme, toggleTheme] = useToggle('light', 'dark', 'auto');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Cycle Theme</button>
    </div>
  );
}

// Usage with step through states
function StepperToggle() {
  const [step, toggleStep, setStep] = useToggle('start', 'processing', 'complete');

  const handleReset = () => setStep(0); // Reset to 'start'

  return (
    <div>
      <p>Step: {step}</p>
      <button onClick={toggleStep}>Next Step</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

---

### With Controlled Mode

```typescript
import { useState, useCallback } from 'react';

interface UseToggleOptions<T> {
  initialValue?: T;
  controlled?: T;
  onToggle?: (value: T) => void;
}

function useToggle<T = boolean>(
  options: UseToggleOptions<T> = {}
): [T, (nextValue?: T) => void] {
  const {
    initialValue = false as T,
    controlled,
    onToggle
  } = options;

  const [internalState, setInternalState] = useState<T>(initialValue);

  // Use controlled value if provided, otherwise use internal state
  const state = controlled !== undefined ? controlled : internalState;

  const toggle = useCallback((nextValue?: T) => {
    const newValue = nextValue !== undefined
      ? nextValue
      : (!internalState as unknown as T);

    if (controlled === undefined) {
      setInternalState(newValue);
    }

    onToggle?.(newValue);
  }, [internalState, controlled, onToggle]);

  return [state, toggle];
}

// Usage - Uncontrolled
function UncontrolledToggle() {
  const [isOpen, toggle] = useToggle({
    initialValue: false,
    onToggle: (value) => console.log('Toggled:', value)
  });

  return (
    <button onClick={() => toggle()}>
      {isOpen ? 'Open' : 'Closed'}
    </button>
  );
}

// Usage - Controlled
function ControlledToggle() {
  const [parentState, setParentState] = useState(false);
  const [isOpen, toggle] = useToggle({
    controlled: parentState,
    onToggle: setParentState
  });

  return (
    <button onClick={() => toggle()}>
      {isOpen ? 'Open' : 'Closed'}
    </button>
  );
}
```

---

### Production-Ready with Debounce

```typescript
import { useState, useCallback, useRef } from 'react';

interface UseToggleOptions {
  initialValue?: boolean;
  debounce?: number;
  onToggle?: (value: boolean) => void;
}

function useToggle(options: UseToggleOptions = {}): [boolean, () => void, () => void] {
  const {
    initialValue = false,
    debounce: debounceMs = 0,
    onToggle
  } = options;

  const [state, setState] = useState(initialValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const toggleRequestRef = useRef(false);

  const toggle = useCallback(() => {
    if (debounceMs > 0) {
      // Debounce toggle calls
      toggleRequestRef.current = true;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (toggleRequestRef.current) {
          const newState = !state;
          setState(newState);
          onToggle?.(newState);
          toggleRequestRef.current = false;
        }
      }, debounceMs);
    } else {
      const newState = !state;
      setState(newState);
      onToggle?.(newState);
    }
  }, [state, debounceMs, onToggle]);

  const cancel = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      toggleRequestRef.current = false;
    }
  }, []);

  return [state, toggle, cancel];
}

// Usage with debounce
function DebouncedToggle() {
  const [isActive, toggle, cancel] = useToggle({
    initialValue: false,
    debounce: 500,
    onToggle: (value) => console.log('Toggled to:', value)
  });

  return (
    <div>
      <p>Active: {isActive ? 'Yes' : 'No'}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={cancel}>Cancel Pending</button>
    </div>
  );
}
```

---

## TypeScript Versions

### Tuple Return Type

```typescript
type UseToggleReturn<T> = [T, () => void];

function useToggle<T = boolean>(initialValue: T): UseToggleReturn<T> {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return [state, toggle];
}
```

### Object Return Type

```typescript
interface UseToggleResult {
  value: boolean;
  toggle: () => void;
  on: () => void;
  off: () => void;
  reset: () => void;
}

function useToggle(initialValue: boolean = false): UseToggleResult {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    toggle: useCallback(() => setValue(v => !v), []),
    on: useCallback(() => setValue(true), []),
    off: useCallback(() => setValue(false), []),
    reset: useCallback(() => setValue(initialValue), [])
  };
}

// Usage
function Notifications() {
  const { value: isNotified, toggle, on, off } = useToggle(true);

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <button onClick={on}>Enable</button>
      <button onClick={off}>Disable</button>
      <p>Notifications: {isNotified ? 'ON' : 'OFF'}</p>
    </div>
  );
}
```

---

## Real-World Examples

### Form Validation Toggle

```typescript
function PasswordField() {
  const { value: showPassword, toggle } = useToggle(false);

  return (
    <div className="password-field">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter password"
      />
      <button onClick={toggle}>
        {showPassword ? 'Hide' : 'Show'} Password
      </button>
    </div>
  );
}
```

### Accordion with Multiple Items

```typescript
function Accordion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="accordion">
      {['item1', 'item2', 'item3'].map(id => (
        <div key={id} className="accordion-item">
          <button onClick={() => handleToggle(id)}>
            Item {id}
          </button>
          {expandedId === id && (
            <div className="content">Expanded content</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Modal with Portal

```typescript
function Modal() {
  const { value: isOpen, on, off } = useToggle(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') off();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, off]);

  return (
    <>
      <button onClick={on}>Open Modal</button>
      {isOpen && (
        <div className="modal-overlay" onClick={off}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button onClick={off}>Close</button>
            <p>Modal content</p>
          </div>
        </div>
      )}
    </>
  );
}
```

### Sidebar Toggle

```typescript
function Layout() {
  const { value: sidebarOpen, toggle } = useToggle(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (windowWidth < 768 && sidebarOpen) {
      // Option to auto-close
    }
  }, [windowWidth, sidebarOpen]);

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        Navigation
      </aside>
      <button onClick={toggle} className="menu-toggle">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <main>Content</main>
    </div>
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useToggle', () => {
  test('returns initial false by default', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  test('returns custom initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  test('toggles boolean state', () => {
    const { result } = renderHook(() => useToggle(false));
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  test('returns stable toggle function', () => {
    const { result, rerender } = renderHook(() => useToggle(false));
    const firstToggle = result.current[1];

    rerender();

    const secondToggle = result.current[1];
    expect(firstToggle).toBe(secondToggle);
  });

  test('supports multiple toggles', () => {
    const { result } = renderHook(() =>
      useToggle('light', 'dark', 'auto')
    );

    expect(result.current[0]).toBe('light');

    act(() => {
      result.current[1](); // toggle to next
    });

    expect(result.current[0]).toBe('dark');

    act(() => {
      result.current[1](); // toggle to next
    });

    expect(result.current[0]).toBe('auto');

    act(() => {
      result.current[1](); // cycle back to first
    });

    expect(result.current[0]).toBe('light');
  });

  test('supports direct value setting', () => {
    const { result } = renderHook(() =>
      useToggle('light', 'dark', 'auto')
    );

    act(() => {
      result.current[2](1); // Set to 'dark' (index 1)
    });

    expect(result.current[0]).toBe('dark');
  });

  test('works with controlled mode', () => {
    const { result, rerender } = renderHook(
      ({ controlled }) => useToggle({ controlled }),
      { initialProps: { controlled: false } }
    );

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false); // Still false (controlled)

    rerender({ controlled: true });

    expect(result.current[0]).toBe(true); // Updated by parent
  });

  test('calls onToggle callback', () => {
    const onToggle = jest.fn();
    const { result } = renderHook(() =>
      useToggle({ initialValue: false, onToggle })
    );

    act(() => {
      result.current[1]();
    });

    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('debounces toggle calls', async () => {
    jest.useFakeTimers();
    const onToggle = jest.fn();

    const { result } = renderHook(() =>
      useToggle({ debounce: 500, onToggle })
    );

    act(() => {
      result.current[1]();
      result.current[1]();
      result.current[1]();
    });

    expect(onToggle).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onToggle).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test('cancel prevents pending toggle', async () => {
    jest.useFakeTimers();
    const onToggle = jest.fn();

    const { result } = renderHook(() =>
      useToggle({ debounce: 500, onToggle })
    );

    act(() => {
      result.current[1]();
    });

    expect(onToggle).not.toHaveBeenCalled();

    act(() => {
      result.current[2](); // Cancel
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onToggle).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
```

---

## Common Mistakes

- ❌ Not using `useCallback` for toggle function (creates new function on every render)
- ❌ Directly mutating state instead of using setState
- ❌ Forgetting to clean up debounce timers
- ❌ Not handling controlled vs uncontrolled modes properly
- ❌ Incorrect index bounds in multi-value toggle
- ❌ Not providing TypeScript generics for complex scenarios

✅ Always use `useCallback` for toggle function
✅ Use functional setState for state updates
✅ Clean up timers in useEffect return
✅ Support both controlled and uncontrolled modes
✅ Validate array indices in cycle operations
✅ Provide generic types for type safety

---

## Performance Comparison

```typescript
// ❌ BAD: Creates new function on every render
function BadToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button onClick={toggle}>Toggle</button>
      <Child onToggle={toggle} /> {/* Child re-renders unnecessarily */}
    </>
  );
}

// ✅ GOOD: Stable toggle function with useCallback
function GoodToggle() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <>
      <button onClick={toggle}>Toggle</button>
      <Child onToggle={toggle} /> {/* Child doesn't re-render */}
    </>
  );
}

// ✅ BETTER: Using custom hook completely
function BetterToggle() {
  const { value, toggle } = useToggle(false);

  return (
    <>
      <button onClick={toggle}>Toggle</button>
      <Child isOpen={value} /> {/* Cleaner API */}
    </>
  );
}
```

---

## Interview Follow-ups

**Q: How would you handle multiple independent toggles?**
```typescript
function useToggles(initialState: Record<string, boolean>) {
  const [state, setState] = useState(initialState);

  const toggle = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const setTrue = useCallback((key: string) => {
    setState(prev => ({ ...prev, [key]: true }));
  }, []);

  const setFalse = useCallback((key: string) => {
    setState(prev => ({ ...prev, [key]: false }));
  }, []);

  return { state, toggle, setTrue, setFalse };
}
```

**Q: How would you integrate with localStorage?**
```typescript
function useToggleWithStorage(key: string, initialValue: boolean) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const toggle = useCallback(() => {
    setState(prev => {
      const next = !prev;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [state, toggle];
}
```

---

[← Back to React Problems](./README.md)
