# useClickOutside Hook

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All companies
**Time:** 25 minutes

---

## Problem Statement

Implement a `useClickOutside` custom hook that detects clicks outside a DOM element and triggers a callback. This is essential for closing modals, dropdowns, tooltips, and popovers when users click outside.

### Requirements

- ✅ Detect clicks outside target element(s)
- ✅ Support multiple refs simultaneously
- ✅ Handle escape key closing
- ✅ Work with portals (modals outside DOM tree)
- ✅ Prevent triggering on target element itself
- ✅ Clean up event listeners on unmount
- ✅ TypeScript support
- ✅ Handle focus trap patterns
- ✅ Support nested click-outside components
- ✅ Performance optimized (no memory leaks)

---

## Solution

### Basic Implementation

```typescript
import { useEffect, useRef } from 'react';

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

// Usage
function Dropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Menu
      </button>
      {isOpen && (
        <ul>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      )}
    </div>
  );
}
```

---

### Advanced: Multiple Refs Support

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
  includeEscape?: boolean;
}

function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  callback: () => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true, includeEscape = false } = options;
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside any of the refs
      const isInsideAnyRef = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node)
      );

      // Call callback if click is outside all refs
      if (!isInsideAnyRef) {
        callbackRef.current();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callbackRef.current();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (includeEscape) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (includeEscape) {
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
  }, [refs, enabled, includeEscape]);
}

// Usage with multiple refs
function ComplexModal() {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Close when clicking outside modal or trigger button
  useClickOutside(
    [modalRef, triggerRef],
    () => setIsOpen(false),
    { includeEscape: true }
  );

  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        Open Modal
      </button>

      {isOpen && (
        <div ref={modalRef} className="modal">
          <h2>Modal Content</h2>
          <p>Click outside or press Escape to close</p>
        </div>
      )}
    </>
  );
}
```

---

### Production-Ready with Portal Support

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface ClickOutsideOptions {
  enabled?: boolean;
  includeEscape?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreClass?: string;
  onEscapeKey?: () => void;
}

function useClickOutside(
  refs: React.RefObject<HTMLElement> | React.RefObject<HTMLElement>[],
  callback: (event: MouseEvent | KeyboardEvent) => void,
  options: ClickOutsideOptions = {}
) {
  const {
    enabled = true,
    includeEscape = false,
    preventDefault = false,
    stopPropagation = false,
    ignoreClass,
    onEscapeKey
  } = options;

  const callbackRef = useRef(callback);
  const refsArray = useRef<React.RefObject<HTMLElement>[]>(
    Array.isArray(refs) ? refs : [refs]
  );

  // Update refs array
  useEffect(() => {
    refsArray.current = Array.isArray(refs) ? refs : [refs];
  }, [refs]);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if target has ignored class
      if (ignoreClass && target.closest(`.${ignoreClass}`)) {
        return;
      }

      // Check if click is inside any of the refs
      const isInsideAnyRef = refsArray.current.some(
        (ref) => ref.current && ref.current.contains(target)
      );

      if (!isInsideAnyRef) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        callbackRef.current(event);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();

        if (onEscapeKey) {
          onEscapeKey();
        } else {
          callbackRef.current(event);
        }
      }
    };

    // Use capture phase for better control
    document.addEventListener('mousedown', handleClickOutside, true);
    if (includeEscape) {
      document.addEventListener('keydown', handleEscapeKey, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      if (includeEscape) {
        document.removeEventListener('keydown', handleEscapeKey, true);
      }
    };
  }, [enabled, includeEscape, preventDefault, stopPropagation, ignoreClass, onEscapeKey]);
}

// Usage with Portal
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Don't close when clicking on close button
  useClickOutside(
    [modalRef, overlayRef],
    onClose,
    {
      includeEscape: true,
      ignoreClass: 'modal-close-button',
      stopPropagation: true
    }
  );

  if (!isOpen) return null;

  return createPortal(
    <div ref={overlayRef} className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2>Modal</h2>
        <p>Click outside to close</p>
      </div>
    </div>,
    document.body
  );
}
```

---

### Focus Trap Pattern

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
}

function useClickOutsideWithFocusTrap(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options: FocusTrapOptions = {}
) {
  const {
    enabled = true,
    returnFocus = true,
    escapeDeactivates = true
  } = options;

  const callbackRef = useRef(callback);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within trap
    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && escapeDeactivates) {
        handleDeactivate();
        return;
      }

      if (event.key !== 'Tab') return;

      // Trap focus
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleDeactivate();
      }
    };

    const handleDeactivate = () => {
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      callbackRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, enabled, returnFocus, escapeDeactivates]);
}

// Usage
function AccessibleModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutsideWithFocusTrap(modalRef, onClose, {
    returnFocus: true,
    escapeDeactivates: true
  });

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="modal" role="dialog" aria-modal="true">
      <h2>Accessible Modal</h2>
      <button onClick={onClose}>Close</button>
      <button>Action 1</button>
      <button>Action 2</button>
    </div>
  );
}
```

---

### With Event Delegation for Nested Components

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface EventDelegationOptions {
  enabled?: boolean;
  includeEscape?: boolean;
  delegateSelector?: string;
  excludeSelector?: string;
}

function useClickOutsideAdvanced(
  ref: React.RefObject<HTMLElement>,
  callback: (event: Event) => void,
  options: EventDelegationOptions = {}
) {
  const {
    enabled = true,
    includeEscape = false,
    delegateSelector,
    excludeSelector
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;

      if (!ref.current) return;

      // Skip if excluded
      if (excludeSelector && target.closest(excludeSelector)) {
        return;
      }

      // Skip if inside ref
      if (ref.current.contains(target)) {
        return;
      }

      // Check delegation selector
      if (delegateSelector && !target.closest(delegateSelector)) {
        return;
      }

      callbackRef.current(event);
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callbackRef.current(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    if (includeEscape) {
      document.addEventListener('keydown', handleEscapeKey, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      if (includeEscape) {
        document.removeEventListener('keydown', handleEscapeKey, true);
      }
    };
  }, [ref, enabled, includeEscape, delegateSelector, excludeSelector]);
}

// Usage with nested dropdowns
function DropdownMenu({ isOpen, onClose }) {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutsideAdvanced(
    menuRef,
    onClose,
    {
      includeEscape: true,
      excludeSelector: '[data-keep-open]'
    }
  );

  return (
    <div ref={menuRef} className="dropdown">
      <button data-keep-open>Always Open</button>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Submenu
          <ul>
            <li>Sub Item 1</li>
            <li>Sub Item 2</li>
          </ul>
        </li>
      </ul>
    </div>
  );
}
```

---

## Real-World Example: Complete Dropdown Component

```typescript
import { useRef, useState, useCallback } from 'react';
import { useClickOutside } from './useClickOutside';

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<{ label: string; onClick: () => void }>;
  onOpenChange?: (isOpen: boolean) => void;
}

function Dropdown({ trigger, items, onOpenChange }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Close on outside click or escape key
  useClickOutside(
    [containerRef, menuRef],
    handleClose,
    { includeEscape: true }
  );

  const handleItemClick = (callback: () => void) => {
    callback();
    handleClose();
  };

  return (
    <div ref={containerRef} className="dropdown-container">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onOpenChange?.(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>

      {isOpen && (
        <ul ref={menuRef} className="dropdown-menu" role="menu">
          {items.map((item, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                onClick={() => handleItemClick(item.onClick)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Usage
function App() {
  const [result, setResult] = useState('');

  return (
    <Dropdown
      trigger="Actions"
      items={[
        { label: 'Edit', onClick: () => setResult('Edit clicked') },
        { label: 'Delete', onClick: () => setResult('Delete clicked') },
        { label: 'Share', onClick: () => setResult('Share clicked') }
      ]}
      onOpenChange={(isOpen) => console.log('Dropdown is', isOpen ? 'open' : 'closed')}
    />
  );
}
```

---

## Test Cases

```typescript
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';

describe('useClickOutside', () => {
  test('should call callback when clicking outside', () => {
    const callback = jest.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      document.body.click();
    });

    expect(callback).toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  test('should not call callback when clicking inside', () => {
    const callback = jest.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    renderHook(() => useClickOutside(ref, callback));

    act(() => {
      ref.current!.click();
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  test('should handle multiple refs', () => {
    const callback = jest.fn();
    const ref1 = { current: document.createElement('div') };
    const ref2 = { current: document.createElement('div') };
    document.body.appendChild(ref1.current);
    document.body.appendChild(ref2.current);

    renderHook(() => useClickOutside([ref1, ref2], callback));

    act(() => {
      ref1.current!.click();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      ref2.current!.click();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      document.body.click();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(ref1.current);
    document.body.removeChild(ref2.current);
  });

  test('should trigger on escape key when enabled', () => {
    const callback = jest.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    renderHook(() =>
      useClickOutside(ref, callback, { includeEscape: true })
    );

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  test('should cleanup on unmount', () => {
    const callback = jest.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    const { unmount } = renderHook(() => useClickOutside(ref, callback));

    unmount();

    act(() => {
      document.body.click();
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  test('should support disabling with enabled option', () => {
    const callback = jest.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    const { rerender } = renderHook(
      ({ enabled }) => useClickOutside(ref, callback, { enabled }),
      { initialProps: { enabled: true } }
    );

    act(() => {
      document.body.click();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Disable
    rerender({ enabled: false });

    act(() => {
      document.body.click();
    });

    expect(callback).toHaveBeenCalledTimes(1); // No additional calls

    document.body.removeChild(ref.current);
  });
});
```

---

## Common Mistakes

- ❌ Not cleaning up event listeners (memory leaks)
- ❌ Using callback directly instead of useRef (stale closures)
- ❌ Not handling escape key
- ❌ Forgetting to exclude the trigger button
- ❌ Not testing with portals
- ❌ Not considering nested components
- ❌ Using 'click' instead of 'mousedown'
- ❌ Not handling focus management

✅ Always clean up in useEffect return
✅ Use useRef for callback stability
✅ Handle both click and escape key
✅ Exclude trigger elements with multiple refs
✅ Test with React Portal
✅ Use capture phase for better control
✅ Use 'mousedown' for better UX
✅ Return focus to trigger element

---

## Performance Comparison

```typescript
// ❌ BAD: Creates new callback on every render
function BadDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }); // No dependency array!

  return <div ref={dropdownRef}>{/* content */}</div>;
}

// ✅ GOOD: Proper event handling with useClickOutside
function GoodDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(dropdownRef, () => setIsOpen(false), {
    includeEscape: true
  });

  return <div ref={dropdownRef}>{/* content */}</div>;
}
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| mousedown event | ✅ | ✅ | ✅ | ✅ |
| Escape key | ✅ | ✅ | ✅ | ✅ |
| Event capture | ✅ | ✅ | ✅ | ✅ |
| contains() method | ✅ | ✅ | ✅ | ✅ |
| Portal support | ✅ | ✅ | ✅ | ✅ |

---

## Key Points for Interviews

1. **Event Delegation**: Explain why 'mousedown' is better than 'click'
2. **Memory Management**: Discuss cleanup and potential memory leaks
3. **Multiple Refs**: Handle complex UI with multiple trigger/content areas
4. **Portal Support**: React portals render outside normal DOM tree
5. **Focus Management**: Return focus and implement focus trapping
6. **Escape Key**: Standard UX pattern for closing overlays
7. **Stale Closures**: Use useRef for stable callback references
8. **Event Capture**: Capture phase vs bubble phase implications
9. **Accessibility**: ARIA attributes and keyboard navigation
10. **Testing**: Mock DOM events and test edge cases

---

[← Back to React Problems](./README.md)
