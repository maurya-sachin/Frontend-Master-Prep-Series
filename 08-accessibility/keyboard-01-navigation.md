# Keyboard Navigation and Accessibility

> Focus management, keyboard shortcuts, tab order, skip links, and accessible interactions.

---

## Question 1: Keyboard Accessibility Best Practices

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Airbnb

### Question
How do you ensure keyboard accessibility in web applications?

### Answer

**Key Requirements:**
1. All interactive elements keyboard accessible
2. Visible focus indicators
3. Logical tab order
4. Keyboard shortcuts
5. Skip links

```html
<!-- ❌ Bad: div with onclick (not keyboard accessible) -->
<div onclick="handleClick()">Click me</div>

<!-- ✅ Good: button (keyboard accessible) -->
<button onclick="handleClick()">Click me</button>

<!-- ✅ Good: div made keyboard accessible -->
<div role="button" tabindex="0" onkeypress="handleKeyPress(event)">
  Click me
</div>

<!-- Skip link for keyboard users -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

```jsx
// Focus management in React
function Modal({ isOpen, onClose }) {
  const firstFocusRef = useRef();

  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div role="dialog" aria-modal="true">
      <button ref={firstFocusRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

<details>
<summary><strong>🔍 Deep Dive: Browser Focus Management and Keyboard Event Architecture</strong></summary>

Keyboard accessibility is built on several fundamental browser mechanisms that work together to enable navigation without a mouse. Understanding these internals is crucial for implementing robust accessible experiences.

**Focus Ring Architecture:**

The browser maintains a focus tree parallel to the DOM tree. When an element receives focus, the browser:

1. **Updates the focus tree** - Marks the element as the current focus target
2. **Fires focus events** - Dispatches `focus`, `focusin` events (bubbling vs non-bubbling)
3. **Renders focus indicator** - Applies `:focus` pseudo-class styles
4. **Establishes keyboard context** - Routes keyboard events to the focused element

```javascript
// Browser's internal focus management (simplified conceptual model)
class FocusManager {
  constructor() {
    this.currentFocus = null;
    this.focusableElements = [];
  }

  updateFocus(element) {
    // Fire blur events on previous element
    if (this.currentFocus) {
      this.currentFocus.dispatchEvent(new FocusEvent('blur'));
    }

    // Update focus
    this.currentFocus = element;

    // Fire focus events
    element.dispatchEvent(new FocusEvent('focus'));
    element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    // Update CSS rendering
    this.updateFocusStyles(element);

    // Scroll into view if needed
    if (this.shouldScrollIntoView(element)) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }
}
```

**Tab Order Algorithm:**

The browser determines tab order using a complex algorithm:

1. **Tabindex > 0** - Explicit positive values (visited in numeric order) - AVOID THIS
2. **Tabindex = 0** - Natural DOM order + explicitly included elements
3. **Tabindex = -1** - Programmatically focusable but not in tab sequence
4. **Native focusable** - `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`, `<summary>`

```javascript
// How browsers calculate tab order (simplified)
function calculateTabOrder(rootElement) {
  const allElements = rootElement.querySelectorAll('*');
  const tabSequence = [];

  // Phase 1: Collect elements with explicit tabindex > 0 (ANTI-PATTERN)
  const positiveTabindex = [];

  // Phase 2: Collect naturally focusable and tabindex="0"
  const naturalOrder = [];

  allElements.forEach(element => {
    const tabindex = element.getAttribute('tabindex');
    const isNativelyFocusable = isFocusable(element);

    if (tabindex && parseInt(tabindex) > 0) {
      positiveTabindex.push({ element, index: parseInt(tabindex) });
    } else if (tabindex === '0' || (isNativelyFocusable && tabindex !== '-1')) {
      naturalOrder.push(element);
    }
  });

  // Sort positive tabindex (CREATES UNPREDICTABLE BEHAVIOR)
  positiveTabindex.sort((a, b) => a.index - b.index);

  // Combine: positive first, then natural DOM order
  return [
    ...positiveTabindex.map(item => item.element),
    ...naturalOrder
  ];
}

function isFocusable(element) {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'];

  if (focusableTags.includes(element.tagName)) {
    return !element.disabled && element.offsetParent !== null; // Not disabled, not hidden
  }

  // contentEditable elements are focusable
  if (element.contentEditable === 'true') return true;

  return false;
}
```

**Keyboard Event Propagation:**

Understanding how keyboard events flow through the DOM is essential:

```javascript
// Keyboard event flow
document.addEventListener('keydown', (e) => {
  // Event phases:
  // 1. CAPTURING_PHASE (1) - from window down to target
  // 2. AT_TARGET (2) - at the focused element
  // 3. BUBBLING_PHASE (3) - from target back up to window

  console.log('Phase:', e.eventPhase);
  console.log('Target:', e.target);
  console.log('Current:', e.currentTarget);
});

// Focus trap implementation using event capturing
function createFocusTrap(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: moving backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forward
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Initial focus
  firstElement.focus();
}
```

**Focus Restoration Pattern:**

When modals open/close or SPAs navigate, preserving focus context improves UX:

```javascript
class FocusManager {
  constructor() {
    this.focusHistory = [];
  }

  saveFocus() {
    this.focusHistory.push(document.activeElement);
  }

  restoreFocus() {
    const previousElement = this.focusHistory.pop();

    if (previousElement && document.contains(previousElement)) {
      // Element still exists in DOM
      previousElement.focus();
    } else {
      // Fallback to first focusable element in body
      const firstFocusable = document.querySelector(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      firstFocusable?.focus();
    }
  }
}

// Usage in modal
class Modal {
  open() {
    focusManager.saveFocus(); // Save current focus
    this.show();
    this.firstFocusableElement.focus(); // Move focus into modal
    this.trapFocus(); // Trap focus inside modal
  }

  close() {
    this.hide();
    focusManager.restoreFocus(); // Return focus to original element
  }
}
```

**Skip Links and Landmark Navigation:**

Screen reader users rely on landmarks and skip links for efficient navigation:

```javascript
// Skip link implementation with smooth scrolling
function initializeSkipLinks() {
  const skipLinks = document.querySelectorAll('.skip-link');

  skipLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        // Make target focusable
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }

        // Smooth scroll and focus
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Focus after scroll completes
        setTimeout(() => {
          target.focus();

          // Remove tabindex after focus if it was added programmatically
          target.addEventListener('blur', () => {
            if (target.getAttribute('tabindex') === '-1') {
              target.removeAttribute('tabindex');
            }
          }, { once: true });
        }, 500);
      }
    });
  });
}
```

**Roving Tabindex Pattern:**

For complex widgets like toolbars, menus, and grids, roving tabindex maintains one focusable element:

```javascript
class RovingTabindex {
  constructor(container, items) {
    this.container = container;
    this.items = Array.from(items);
    this.currentIndex = 0;

    this.initialize();
  }

  initialize() {
    // Set initial tabindex values
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
      item.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  handleKeyDown(event, currentIndex) {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % this.items.length;
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = (currentIndex - 1 + this.items.length) % this.items.length;
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = this.items.length - 1;
        break;

      default:
        return;
    }

    this.setCurrentIndex(newIndex);
    this.items[newIndex].focus();
  }

  setCurrentIndex(index) {
    // Update tabindex: only current item is tab-reachable
    this.items.forEach((item, i) => {
      item.setAttribute('tabindex', i === index ? '0' : '-1');
    });

    this.currentIndex = index;
  }
}

// Usage
const toolbar = document.querySelector('[role="toolbar"]');
const buttons = toolbar.querySelectorAll('button');
new RovingTabindex(toolbar, buttons);
```

**Keyboard Shortcuts and Key Binding Systems:**

Modern applications need robust keyboard shortcut handling:

```javascript
class KeyboardShortcutManager {
  constructor() {
    this.shortcuts = new Map();
    this.modifierKeys = { ctrl: false, alt: false, shift: false, meta: false };

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  register(keys, callback, options = {}) {
    const normalizedKey = this.normalizeKey(keys);

    this.shortcuts.set(normalizedKey, {
      callback,
      preventDefault: options.preventDefault ?? true,
      scope: options.scope || 'global'
    });
  }

  normalizeKey(keys) {
    // Convert "Ctrl+K" or "cmd+k" to normalized format
    const parts = keys.toLowerCase().split('+');
    const modifiers = parts.slice(0, -1).sort();
    const key = parts[parts.length - 1];

    return [...modifiers, key].join('+');
  }

  handleKeyDown(event) {
    // Update modifier state
    this.modifierKeys.ctrl = event.ctrlKey;
    this.modifierKeys.alt = event.altKey;
    this.modifierKeys.shift = event.shiftKey;
    this.modifierKeys.meta = event.metaKey;

    // Build current key combination
    const modifiers = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl'); // Treat Cmd as Ctrl
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');

    const key = event.key.toLowerCase();
    const combination = [...modifiers, key].join('+');

    // Check if registered
    const shortcut = this.shortcuts.get(combination);

    if (shortcut) {
      // Don't activate shortcuts when typing in inputs
      const activeElement = document.activeElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
                       activeElement.contentEditable === 'true';

      if (!isTyping || shortcut.scope === 'always') {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        shortcut.callback(event);
      }
    }
  }

  handleKeyUp(event) {
    this.modifierKeys.ctrl = event.ctrlKey;
    this.modifierKeys.alt = event.altKey;
    this.modifierKeys.shift = event.shiftKey;
    this.modifierKeys.meta = event.metaKey;
  }

  unregister(keys) {
    const normalizedKey = this.normalizeKey(keys);
    this.shortcuts.delete(normalizedKey);
  }
}

// Usage
const shortcuts = new KeyboardShortcutManager();

shortcuts.register('ctrl+k', () => {
  openCommandPalette();
});

shortcuts.register('ctrl+/', () => {
  toggleKeyboardShortcutsHelp();
});

shortcuts.register('escape', () => {
  closeModal();
}, { scope: 'always' }); // Works even in inputs
```

Understanding these internals allows you to build sophisticated, accessible keyboard navigation that rivals desktop applications.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Checkout Flow Keyboard Trap (12% Conversion Loss)</strong></summary>

**Company:** Major online retailer (similar to Shopify/BigCommerce merchants)
**Impact:** 12% drop in checkout completion for keyboard-only users
**Time to Resolution:** 3 days
**Root Cause:** Modal dialogs breaking keyboard navigation flow

**The Problem:**

An e-commerce platform noticed a significant drop in conversion rates specifically for users who relied on keyboard navigation. Their analytics showed:

```
Metrics (March 2024):
- Overall checkout completion: 68%
- Keyboard-only users completion: 56% (12% lower)
- Cart abandonment at shipping modal: 23% (keyboard users)
- Support tickets about "stuck" forms: +340% MoM
- Screen reader user complaints: 18 tickets/week
```

The checkout flow had multiple modal dialogs (address validation, gift options, promo codes) that created keyboard traps - users couldn't escape without using a mouse.

**Initial Investigation:**

```javascript
// PROBLEMATIC CODE - Modal component
class CheckoutModal extends React.Component {
  componentDidMount() {
    // Modal opens, but focus isn't managed
    this.modalRef.current.style.display = 'block';
  }

  render() {
    return (
      <div className="modal-overlay" onClick={this.props.onClose}>
        <div className="modal-content" ref={this.modalRef}>
          <h2>Confirm Shipping Address</h2>

          {/* ❌ ISSUE 1: Close button not keyboard accessible */}
          <span className="close-icon" onClick={this.props.onClose}>×</span>

          {/* ❌ ISSUE 2: No focus management */}
          <form>
            <input type="text" placeholder="Address Line 1" />
            <input type="text" placeholder="City" />
            <input type="text" placeholder="Zip" />

            {/* ❌ ISSUE 3: Submit button outside modal's focus trap */}
            <button type="submit">Confirm</button>
          </form>
        </div>
      </div>
    );
  }
}
```

**Specific Issues Identified:**

1. **Focus not moved to modal** - When modal opened, focus remained on the trigger button behind the overlay
2. **No Escape key handler** - Keyboard users had no way to close modal
3. **Focus not trapped** - Tab key moved focus to elements behind modal
4. **No focus restoration** - After closing modal, focus lost in the page
5. **Close button not keyboard accessible** - `<span>` with onClick instead of `<button>`

**Debugging Process:**

```javascript
// Step 1: Audit keyboard flow
function auditKeyboardFlow() {
  const report = {
    focusableElements: [],
    tabOrder: [],
    issues: []
  };

  // Find all focusable elements
  const focusable = document.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusable.forEach((el, index) => {
    const tabindex = el.getAttribute('tabindex');
    const rect = el.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;

    report.focusableElements.push({
      index,
      tag: el.tagName,
      tabindex,
      isVisible,
      text: el.textContent.trim().substring(0, 30),
      hasVisibleFocus: hasVisibleFocusIndicator(el)
    });

    // Check for positive tabindex (anti-pattern)
    if (tabindex && parseInt(tabindex) > 0) {
      report.issues.push({
        element: el,
        issue: 'Positive tabindex creates unpredictable tab order',
        severity: 'high'
      });
    }

    // Check for focus indicator
    if (!hasVisibleFocusIndicator(el)) {
      report.issues.push({
        element: el,
        issue: 'No visible focus indicator',
        severity: 'medium'
      });
    }
  });

  return report;
}

function hasVisibleFocusIndicator(element) {
  // Temporarily focus element
  const previousFocus = document.activeElement;
  element.focus();

  // Get computed styles
  const styles = window.getComputedStyle(element, ':focus');
  const outlineWidth = styles.getPropertyValue('outline-width');
  const outlineStyle = styles.getPropertyValue('outline-style');

  // Restore focus
  previousFocus.focus();

  // Check if outline is visible
  return outlineWidth !== '0px' && outlineStyle !== 'none';
}

// Step 2: Monitor focus changes
let focusHistory = [];

document.addEventListener('focus', (e) => {
  focusHistory.push({
    timestamp: Date.now(),
    element: e.target,
    tag: e.target.tagName,
    className: e.target.className,
    id: e.target.id
  });

  // Detect focus leaving visible area (possible trap)
  const rect = e.target.getBoundingClientRect();
  if (rect.top < 0 || rect.left < 0 ||
      rect.bottom > window.innerHeight ||
      rect.right > window.innerWidth) {
    console.warn('Focus moved to off-screen element:', e.target);
  }
}, true);

// Step 3: Detect modal keyboard traps
function detectModalTrap() {
  const modals = document.querySelectorAll('[role="dialog"], .modal');

  modals.forEach(modal => {
    const isVisible = modal.offsetParent !== null;

    if (isVisible) {
      const focusableInModal = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const focusableOutsideModal = document.querySelectorAll(
        'body > *:not(.modal-container) button, body > *:not(.modal-container) [href]'
      );

      console.log({
        modal,
        focusableCount: focusableInModal.length,
        hasEscapeHandler: modal.hasAttribute('data-escape-handler'),
        hasFocusTrap: modal.hasAttribute('data-focus-trap'),
        outsideElementsStillFocusable: focusableOutsideModal.length
      });
    }
  });
}
```

**The Solution - Comprehensive Keyboard-Accessible Modal:**

```javascript
import { useEffect, useRef, useCallback } from 'react';

function AccessibleModal({ isOpen, onClose, children, title }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Get all focusable elements in modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(modalRef.current.querySelectorAll(focusableSelectors));
  }, []);

  // Focus trap implementation
  const handleTabKey = useCallback((e) => {
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: move backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move forward
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Tab') {
      handleTabKey(e);
    }
  }, [onClose, handleTabKey]);

  // Manage focus on open/close
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement;

      // Wait for modal to render, then focus first element
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 100);

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Hide content behind modal from screen readers
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }

      // Remove keyboard listener
      document.removeEventListener('keydown', handleKeyDown);

      // Restore body scroll
      document.body.style.overflow = '';

      // Restore screen reader access to main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, getFocusableElements]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>

          {/* ✅ Keyboard accessible close button */}
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Usage in checkout
function CheckoutFlow() {
  const [showAddressModal, setShowAddressModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowAddressModal(true)}>
        Edit Shipping Address
      </button>

      <AccessibleModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Confirm Shipping Address"
      >
        <form onSubmit={handleSubmit}>
          <label>
            Address Line 1
            <input type="text" name="address1" required />
          </label>

          <label>
            City
            <input type="text" name="city" required />
          </label>

          <label>
            Zip Code
            <input type="text" name="zip" required />
          </label>

          <div className="button-group">
            <button type="button" onClick={() => setShowAddressModal(false)}>
              Cancel
            </button>
            <button type="submit">
              Confirm
            </button>
          </div>
        </form>
      </AccessibleModal>
    </>
  );
}
```

**Additional Enhancements:**

```css
/* ✅ Visible focus indicators */
:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* ✅ Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

```html
<!-- ✅ Skip link at top of page -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<header>...</header>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

**Results After Fix:**

```
Metrics (April 2024 - 2 weeks after deployment):
- Keyboard-only users completion: 66% (+10% improvement)
- Cart abandonment at modals: 8% (-15% improvement)
- Support tickets about navigation: -89% reduction
- Screen reader complaints: 1-2 tickets/week (-85%)
- Average checkout time (keyboard users): 3:12 → 2:45 (-14%)
- Estimated additional revenue: $142K/month from recovered conversions
```

**Key Lessons:**

1. **Always test with keyboard only** - Tab through entire flow without touching mouse
2. **Focus management is critical** - Save, move, trap, and restore focus appropriately
3. **Escape key should always close modals** - Standard user expectation
4. **Visible focus indicators are mandatory** - Never set `outline: none` without replacement
5. **Skip links improve efficiency** - Let users jump to main content
6. **Monitor keyboard-specific metrics** - Track conversion rates by input method
7. **Screen reader testing catches edge cases** - NVDA/JAWS reveal focus issues

</details>

<details>
<summary><strong>⚖️ Trade-offs: Focus Management Strategies and Implementation Complexity</strong></summary>

When implementing keyboard accessibility, different approaches offer varying balances between user experience, development effort, and maintenance complexity.

**1. Native Focusable Elements vs. ARIA-Enhanced Divs**

```javascript
// ❌ Approach A: ARIA on divs (high maintenance)
<div
  role="button"
  tabindex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="Submit form"
>
  Submit
</div>

// ✅ Approach B: Native button (low maintenance)
<button onClick={handleClick} aria-label="Submit form">
  Submit
</button>
```

| Aspect | Native Elements | ARIA-Enhanced Divs |
|--------|----------------|-------------------|
| **Keyboard Support** | Built-in (Enter, Space) | Manual implementation required |
| **Screen Reader** | Automatic announcements | Must add all ARIA manually |
| **Focus Management** | Automatic | Manual tabindex management |
| **Event Handling** | Simple onClick | onClick + onKeyDown + key checking |
| **Browser Compatibility** | Excellent | Inconsistent across browsers/AT |
| **Development Time** | Minutes | Hours |
| **Maintenance** | Low | High |
| **Bundle Size** | Minimal | +2-5KB per component |

**Recommendation:** Use native elements 95% of the time. Only use ARIA when building truly custom widgets not covered by HTML.

**2. Focus Trap: Manual vs. Library Implementation**

```javascript
// Approach A: Manual focus trap
function manualFocusTrap(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  first.focus();
}

// Approach B: Using focus-trap library
import createFocusTrap from 'focus-trap';

const trap = createFocusTrap(container, {
  onActivate: () => console.log('Focus trapped'),
  onDeactivate: () => console.log('Focus released'),
  escapeDeactivates: true,
  clickOutsideDeactivates: true,
  returnFocusOnDeactivate: true,
  fallbackFocus: container
});

trap.activate();
```

| Aspect | Manual Implementation | Library (focus-trap) |
|--------|---------------------|---------------------|
| **Bundle Size** | 0 KB | ~5 KB (gzipped) |
| **Edge Cases Handled** | Basic scenarios | Comprehensive (dynamic content, iframes, etc.) |
| **Development Time** | 2-4 hours | 15 minutes |
| **Testing Burden** | High (must test all cases) | Low (battle-tested) |
| **Dynamic Content** | Breaks easily | Handles automatically |
| **Iframe Support** | Manual implementation | Built-in |
| **Shadow DOM** | Manual implementation | Built-in |
| **Return Focus** | Manual tracking | Automatic |
| **Maintenance** | Ongoing bug fixes | Library updates |

**Recommendation:** Use libraries for production modals/dialogs. Manual for learning or extremely simple cases.

**3. Skip Links: Hidden vs. Visible**

```css
/* Approach A: Visually hidden skip link (appears on focus) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Approach B: Always visible skip link */
.skip-link-visible {
  display: block;
  background: #f0f0f0;
  padding: 8px;
  text-align: center;
}
```

| Aspect | Hidden (Appears on Focus) | Always Visible |
|--------|---------------------------|---------------|
| **Visual Clutter** | None (hidden by default) | Always present |
| **Discoverability** | Low (requires Tab key) | High (always seen) |
| **Keyboard User UX** | Excellent (saves time) | Excellent (saves time) |
| **Mouse User UX** | Unaffected | Slight clutter |
| **Accessibility Score** | Full points | Full points |
| **User Confusion** | None | May confuse mouse users |
| **Common Pattern** | Yes (most sites) | Rare |

**Recommendation:** Hidden skip links are standard practice. Always visible can work for accessibility-first products.

**4. Roving Tabindex vs. All Elements Focusable**

```javascript
// Approach A: Roving tabindex (single tab stop)
class Toolbar {
  constructor(container) {
    this.items = container.querySelectorAll('button');
    this.currentIndex = 0;

    this.items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
      item.addEventListener('keydown', (e) => this.handleArrowKeys(e, index));
    });
  }

  handleArrowKeys(event, index) {
    if (event.key === 'ArrowRight') {
      const newIndex = (index + 1) % this.items.length;
      this.items[newIndex].focus();
      this.updateTabindex(newIndex);
    }
    // ... other arrows
  }

  updateTabindex(newIndex) {
    this.items.forEach((item, i) => {
      item.tabIndex = i === newIndex ? 0 : -1;
    });
  }
}

// Approach B: All elements focusable (multiple tab stops)
// Just use native tabindex="0" on all buttons
```

| Aspect | Roving Tabindex | All Focusable |
|--------|----------------|---------------|
| **Tab Key Behavior** | Single tab stop (toolbar = 1 stop) | Multiple tab stops (5 buttons = 5 stops) |
| **Arrow Key Navigation** | Required | Optional |
| **Keyboard Efficiency** | High (fewer tab presses) | Low (many tab presses) |
| **Implementation** | Complex (state management) | Simple (native behavior) |
| **User Familiarity** | Desktop app pattern | Web pattern |
| **ARIA Authoring Practices** | Recommended for toolbars | Not recommended |
| **Screen Reader UX** | Excellent (announces count) | Verbose |
| **Development Time** | Hours | Minutes |

**Recommendation:**
- **Toolbars, menus, grids:** Use roving tabindex (matches desktop UX)
- **Simple button groups:** All focusable (simpler, good enough)

**5. Focus Indicators: Custom vs. Default**

```css
/* Approach A: Default browser outline */
/* No CSS needed - browser provides outline */

/* Approach B: Custom focus indicator */
*:focus {
  outline: none; /* Remove default */
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);
  border: 2px solid #0066cc;
}

/* Approach C: Hybrid (enhance default) */
*:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

| Aspect | Default Browser | Custom Styled | Hybrid |
|--------|----------------|---------------|--------|
| **Development Time** | 0 | High (all states) | Low |
| **Consistency** | Varies by browser | Consistent | Consistent |
| **Brand Alignment** | None | Perfect | Good |
| **Accessibility** | Good | Risk of poor contrast | Good |
| **Maintenance** | None | Ongoing | Low |
| **WCAG Compliance** | Usually compliant | Must verify | Usually compliant |
| **User Familiarity** | High | Varies | High |

**Recommendation:** Hybrid approach - enhance default outline with brand colors, maintain outline-offset for clarity.

**6. Keyboard Shortcuts: Global vs. Contextual**

```javascript
// Approach A: Global shortcuts (always active)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') {
    openSearch();
  }
});

// Approach B: Contextual shortcuts (scope-aware)
class ShortcutManager {
  constructor() {
    this.contexts = [];
  }

  pushContext(context, shortcuts) {
    this.contexts.push({ context, shortcuts });
  }

  popContext() {
    this.contexts.pop();
  }

  handleKey(event) {
    // Only apply shortcuts from current context
    const currentContext = this.contexts[this.contexts.length - 1];
    if (currentContext) {
      const shortcut = currentContext.shortcuts.find(s => s.matches(event));
      if (shortcut) shortcut.execute();
    }
  }
}
```

| Aspect | Global Shortcuts | Contextual Shortcuts |
|--------|-----------------|---------------------|
| **Conflicts** | High (many competing keys) | Low (scoped to context) |
| **Implementation** | Simple | Complex (context stack) |
| **User Mental Model** | Simple (always same) | Complex (changes by context) |
| **Power User UX** | Excellent (consistent) | Good (context-specific) |
| **Accessibility** | Risk of blocking input fields | Safer |
| **Documentation Burden** | Low (one list) | High (per-context docs) |

**Recommendation:** Use global shortcuts sparingly (Ctrl+K for search, Escape for close). Use contextual for complex apps (editors, IDEs).

**Decision Matrix:**

```
Simple Marketing Site:
- Native elements ✅
- Hidden skip link ✅
- Default focus indicators (enhanced) ✅
- No keyboard shortcuts ✅

Complex SaaS Application:
- Native elements where possible ✅
- Focus-trap library for modals ✅
- Roving tabindex for toolbars ✅
- Custom focus indicators (brand) ✅
- Contextual keyboard shortcuts ✅

E-commerce Site:
- Native elements ✅
- Focus-trap for checkout modals ✅
- Hidden skip links ✅
- Default focus indicators ✅
- Minimal shortcuts (search, cart) ✅
```

Choose approaches based on your application's complexity, team expertise, and user base. When in doubt, start simple with native elements and default behaviors.

</details>

<details>
<summary><strong>💬 Explain to Junior: Keyboard Accessibility Like Learning to Drive</strong></summary>

**The Car Analogy:**

Imagine a car (your website) that can only be driven with a steering wheel (mouse). Now imagine someone who can only use pedals (keyboard) - they're stuck! Keyboard accessibility is like making sure your car has BOTH steering wheel AND pedals, so everyone can drive.

**Why This Matters:**

```
Users who rely on keyboard navigation:
- People with motor disabilities (can't use mouse precisely)
- Power users (keyboard is faster for them)
- Screen reader users (blind users navigate by keyboard)
- People with RSI (repetitive strain injury from mouse use)
- Mobile users (touch interfaces often act like keyboard navigation)

In the US alone: ~8 million people have difficulty using their arms/hands
Globally: ~200 million people with motor disabilities
```

That's a LOT of people you're excluding if your site isn't keyboard accessible!

**The Three Golden Rules:**

**1. Everything Clickable Must Be Keyboard-Reachable**

```jsx
// ❌ BAD: This div can't be reached with Tab key
<div onClick={() => alert('Clicked!')}>
  Click me
</div>

// ✅ GOOD: Button is automatically keyboard-accessible
<button onClick={() => alert('Clicked!')}>
  Click me
</button>

// ✅ ALSO GOOD: If you MUST use a div, make it keyboard-friendly
<div
  role="button"
  tabIndex="0"
  onClick={() => alert('Clicked!')}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      alert('Clicked!');
    }
  }}
>
  Click me
</div>
```

**Think of it like this:** If you can click it with a mouse, you should be able to "press" it with Enter or Space key.

**2. Show Where You Are (Focus Indicators)**

```css
/* ❌ BAD: Hiding the focus indicator (makes it impossible to see where you are) */
button:focus {
  outline: none; /* DON'T DO THIS! */
}

/* ✅ GOOD: Making the focus indicator clear */
button:focus {
  outline: 3px solid blue;
  outline-offset: 2px;
}
```

**The Video Game Analogy:**

You know in video games how your character has a highlight or glow so you can see where you are? That's what focus indicators do on websites. Without them, it's like playing a game where your character is invisible!

```
Try this yourself:
1. Go to Google.com
2. Press Tab a few times (don't touch your mouse!)
3. See that blue rectangle? That's the focus indicator
4. It shows you which button/link will activate if you press Enter
```

**3. Logical Tab Order**

```html
<!-- ✅ GOOD: Natural DOM order = Natural tab order -->
<form>
  <label>
    Name
    <input type="text" />  <!-- Press Tab → goes here first -->
  </label>

  <label>
    Email
    <input type="email" />  <!-- Press Tab again → goes here second -->
  </label>

  <button type="submit">Submit</button>  <!-- Press Tab again → goes here third -->
</form>

<!-- ❌ BAD: Using tabindex numbers creates chaos -->
<form>
  <label>
    Name
    <input type="text" tabindex="3" />  <!-- Goes THIRD? Confusing! -->
  </label>

  <label>
    Email
    <input type="email" tabindex="1" />  <!-- Goes FIRST? What? -->
  </label>

  <button type="submit" tabindex="2">Submit</button>  <!-- Goes SECOND? Why?? -->
</form>
```

**The Restaurant Menu Analogy:**

Imagine reading a restaurant menu where appetizers are on page 5, entrees are on page 2, and desserts are on page 1. Confusing, right? That's what bad tab order feels like. Keep it natural - top to bottom, left to right.

**Common Real-World Scenarios:**

**Scenario 1: Modal Dialogs (The "Trapped in a Room" Problem)**

```jsx
// When a modal opens, focus should be TRAPPED inside
// Think of it like entering a room - you can't interact with things outside!

function Modal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      // When modal opens:
      // 1. Move focus INTO the modal (enter the room)
      // 2. Trap Tab key inside modal (can't leave until you close door)
      // 3. Escape key closes modal (emergency exit!)
      // 4. When closed, return focus to trigger button (exit room, stand where you were)
    }
  }, [isOpen]);

  return (
    <div role="dialog">
      <button onClick={onClose}>Close</button>
      {/* Modal content */}
    </div>
  );
}
```

**Why trap focus?** Imagine opening a dialog box on your phone - you can't tap buttons behind it, right? Same principle for keyboard users.

**Scenario 2: Skip Links (The "Express Elevator" Pattern)**

```html
<!-- Skip link: lets keyboard users jump to main content -->
<a href="#main" class="skip-link">Skip to main content</a>

<header>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/portfolio">Portfolio</a>
    <a href="/team">Team</a>
    <a href="/blog">Blog</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<main id="main">
  <!-- Your actual content -->
</main>
```

**The Skyscraper Analogy:**

Imagine you work on the 50th floor. Would you rather:
- Take stairs (Tab through 50 navigation links every page load)
- Take express elevator (Press Tab once, hit Enter on "Skip to main content")

Skip links are express elevators for keyboard users!

**Scenario 3: Focus Indicators (The "You Are Here" Map)**

```jsx
// You know those "You Are Here" markers on mall maps?
// Focus indicators are the digital version!

function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>  {/* Tab → focus indicator shows you're here */}
      <a href="/about">About</a>  {/* Tab → now indicator is here */}
      <a href="/contact">Contact</a>  {/* Tab → now here */}
    </nav>
  );
}
```

**Testing Your Site (The "No Mouse Challenge"):**

```
Step 1: Hide your mouse (seriously, put it away)
Step 2: Can you navigate your entire site with just:
  - Tab (move forward)
  - Shift+Tab (move backward)
  - Enter (activate links/buttons)
  - Space (activate buttons, scroll)
  - Arrow keys (for custom widgets)
  - Escape (close modals)

Step 3: Can you SEE where you are at all times?
  - Is there a visible focus indicator?
  - Does it have enough contrast?
  - Is it clear which element is focused?

Step 4: Can you complete your main tasks?
  - Fill out forms?
  - Navigate menus?
  - Close modals?
  - Play/pause videos?
```

**Quick Wins for Your Next Project:**

1. **Use semantic HTML** - `<button>`, `<a>`, `<input>` instead of `<div onClick>`
2. **Never remove outline without replacement** - Keep focus visible!
3. **Test with Tab key** - Navigate your site without touching mouse
4. **Add skip links** - Let users jump to main content
5. **Handle Escape key** - Close modals/dropdowns when Escape pressed

**Interview Answer Template:**

"Keyboard accessibility means ensuring users can navigate and interact with a website using only a keyboard. The key principles are:

1. **Focusability**: All interactive elements must be keyboard-reachable
2. **Focus Indicators**: Users must see where they are (never hide outline)
3. **Logical Tab Order**: Navigation should follow natural reading order
4. **Keyboard Shortcuts**: Common patterns like Escape to close, Enter to activate
5. **Focus Management**: When opening modals, trap focus inside; restore when closing

I implement this by using semantic HTML elements which have built-in keyboard support, ensuring visible focus indicators, and testing thoroughly with keyboard-only navigation. Tools like the Tab key, Chrome DevTools accessibility audit, and screen readers help validate the implementation."

**Remember:** Good keyboard accessibility isn't just about compliance - it's about making your site usable by millions more people. Plus, it makes YOUR development experience better too (try navigating your own forms with Tab - it's faster than clicking!).

</details>

### Resources
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

