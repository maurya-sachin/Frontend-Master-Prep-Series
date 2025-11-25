# Focus Management and Keyboard Navigation

> **Master focus management - focus traps, skip links, focus restoration, and keyboard accessibility patterns**

---

## Question 1: What is focus management and how do you implement focus traps, skip links, and focus restoration?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain focus management patterns in web applications. How do you implement modal focus traps, skip links for keyboard navigation, and focus restoration after closing dialogs? What are the accessibility requirements?

### Answer

Focus management ensures keyboard users can navigate efficiently and understand where they are in the interface. Proper focus management is a WCAG Level A requirement (2.1.1, 2.1.2, 2.4.3).

1. **Focus Trap (Modal Dialogs)**
   - **Purpose:** Keep focus within modal when open
   - **How:** Intercept Tab key, cycle focus within modal
   - **Escape:** ESC key should close modal and restore focus
   - **WCAG:** Required for aria-modal="true" dialogs

2. **Skip Links**
   - **Purpose:** Let keyboard users skip repetitive navigation
   - **Implementation:** Hidden link that appears on focus
   - **Common:** "Skip to main content", "Skip navigation"
   - **WCAG:** Level A requirement (2.4.1 Bypass Blocks)

3. **Focus Restoration**
   - **Purpose:** Return focus to trigger element after modal closes
   - **Implementation:** Save reference before opening, restore after closing
   - **Why:** Prevents focus loss and confusion

4. **Focus Indicators**
   - **Purpose:** Show where keyboard focus is
   - **Implementation:** `:focus-visible` CSS
   - **WCAG:** Level AA requirement (2.4.7 Focus Visible)

5. **Tab Order Management**
   - **tabindex="0":** Add to tab order
   - **tabindex="-1":** Remove from tab order but allow programmatic focus
   - **tabindex="1+":** Avoid (disrupts natural tab order)

### Code Example

```html
<!-- SKIP LINKS: Keyboard Bypass -->

<!-- ✅ Good: Skip link appears on focus -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<nav aria-label="Main navigation">
  <!-- 20+ navigation links -->
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <!-- ... more links ... -->
</nav>

<main id="main-content" tabindex="-1">
  <h1>Page Content</h1>
  <!-- Main content -->
</main>

<style>
  /* Skip link hidden by default */
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 1000;
    padding: 1rem;
    background: #000;
    color: #fff;
    text-decoration: none;
  }

  /* Skip link visible on focus */
  .skip-link:focus {
    left: 0;
    top: 0;
  }
</style>

<script>
  // Programmatically focus main content when skip link clicked
  document.querySelector('.skip-link').addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');

    // Focus main content
    mainContent.focus();

    // Smooth scroll to main content
    mainContent.scrollIntoView({ behavior: 'smooth' });
  });
</script>

<!-- FOCUS TRAP: Modal Dialog -->

<!-- ❌ Bad: No focus trap (focus escapes modal) -->
<div class="modal" style="display: block;">
  <h2>Confirm Delete</h2>
  <button onclick="confirmDelete()">Delete</button>
  <button onclick="closeModal()">Cancel</button>
</div>
<!-- User can Tab out to background content -->

<!-- ✅ Good: Focus trap implementation -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  id="confirm-dialog"
  hidden
>
  <div class="dialog-content">
    <h2 id="dialog-title">Confirm Delete</h2>
    <p>This action cannot be undone. Are you sure?</p>

    <div class="dialog-buttons">
      <button id="confirm-btn" onclick="confirmDelete()">
        Delete
      </button>
      <button id="cancel-btn" onclick="closeDialog()">
        Cancel
      </button>
    </div>
  </div>
</div>

<script>
  let previouslyFocusedElement = null;

  function openDialog() {
    // 1. Save currently focused element
    previouslyFocusedElement = document.activeElement;

    // 2. Show dialog
    const dialog = document.getElementById('confirm-dialog');
    dialog.hidden = false;

    // 3. Hide background from screen readers
    document.querySelector('main').setAttribute('aria-hidden', 'true');

    // 4. Get focusable elements within dialog
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 5. Focus first element
    firstElement.focus();

    // 6. Trap Tab key
    dialog.addEventListener('keydown', trapFocus);

    function trapFocus(e) {
      // Handle ESC key
      if (e.key === 'Escape') {
        closeDialog();
        return;
      }

      // Handle Tab key
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: If on first element, wrap to last
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: If on last element, wrap to first
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  function closeDialog() {
    const dialog = document.getElementById('confirm-dialog');

    // 1. Hide dialog
    dialog.hidden = true;

    // 2. Restore background accessibility
    document.querySelector('main').setAttribute('aria-hidden', 'false');

    // 3. Restore focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }

    // 4. Remove event listener
    dialog.removeEventListener('keydown', trapFocus);
  }
</script>

<!-- REACT EXAMPLE: Reusable Focus Trap Hook -->

function useFocusTrap(isActive) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    // Trap focus handler
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

// Usage
function Modal({ isOpen, onClose, title, children }) {
  const trapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

<!-- FOCUS RESTORATION: SPA Routing -->

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const previousFocusRef = useRef(null);

  const navigateTo = (page) => {
    // Save current focus
    previousFocusRef.current = document.activeElement;

    // Change page
    setCurrentPage(page);
  };

  useEffect(() => {
    // After route change, focus main heading
    const heading = document.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }, [currentPage]);

  return (
    <div>
      <nav>
        <button onClick={() => navigateTo('home')}>Home</button>
        <button onClick={() => navigateTo('about')}>About</button>
      </nav>

      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
      </main>
    </div>
  );
}

<!-- FOCUS INDICATORS: :focus-visible -->

<style>
  /* ❌ Bad: Remove focus outline entirely */
  button:focus {
    outline: none;  /* NEVER do this without alternative */
  }

  /* ❌ Bad: Outline on mouse click (annoying) */
  button:focus {
    outline: 2px solid blue;
  }

  /* ✅ Good: Outline only for keyboard focus */
  button:focus-visible {
    outline: 3px solid #0078d4;
    outline-offset: 2px;
  }

  /* Remove outline for mouse focus */
  button:focus:not(:focus-visible) {
    outline: none;
  }
</style>

<!-- TABINDEX MANAGEMENT -->

<!-- tabindex="0": Add to natural tab order -->
<div tabindex="0" role="button" onclick="handleClick()">
  Custom button
</div>

<!-- tabindex="-1": Focusable programmatically but not via Tab -->
<h1 id="page-title" tabindex="-1">
  Page Title
</h1>

<script>
  // Focus heading after route change
  document.getElementById('page-title').focus();
</script>

<!-- ❌ Bad: Positive tabindex (disrupts natural order) -->
<input type="text" tabindex="3">
<input type="text" tabindex="1">  <!-- Focused first, out of order -->
<input type="text" tabindex="2">

<!-- ✅ Good: Natural tab order (no tabindex or tabindex="0") -->
<input type="text">
<input type="text">
<input type="text">

<!-- ROVING TABINDEX: Toolbar Pattern -->

<!-- ✅ Good: Only one toolbar item in tab order at a time -->
<div role="toolbar" aria-label="Text formatting">
  <button tabindex="0" aria-label="Bold">B</button>
  <button tabindex="-1" aria-label="Italic">I</button>
  <button tabindex="-1" aria-label="Underline">U</button>
</div>

<script>
  // Arrow keys move focus within toolbar
  document.querySelector('[role="toolbar"]').addEventListener('keydown', (e) => {
    const buttons = Array.from(e.currentTarget.querySelectorAll('button'));
    const currentIndex = buttons.indexOf(document.activeElement);

    if (e.key === 'ArrowRight') {
      const nextButton = buttons[currentIndex + 1] || buttons[0];
      updateFocus(buttons, nextButton);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prevButton = buttons[currentIndex - 1] || buttons[buttons.length - 1];
      updateFocus(buttons, prevButton);
      e.preventDefault();
    }
  });

  function updateFocus(buttons, targetButton) {
    // Remove all from tab order
    buttons.forEach(btn => btn.tabIndex = -1);

    // Add target to tab order and focus
    targetButton.tabIndex = 0;
    targetButton.focus();
  }
</script>

<!-- REACT EXAMPLE: Complete Modal with All Best Practices -->

function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement;

    // Hide background from screen readers
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true');
    }

    // Focus first focusable element
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }

    // Handle ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Handle focus trap
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    modal.addEventListener('keydown', handleTab);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscape);
      modal.removeEventListener('keydown', handleTab);

      // Restore background
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'false');
      }

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <h2 id="modal-title">{title}</h2>
        <div className="modal-content">
          {children}
        </div>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
}
```

### Common Mistakes

❌ **Mistake:** No focus trap in modal
```html
<div role="dialog">
  <button>Delete</button>
</div>
<!-- User can Tab to background elements -->
```

✅ **Correct:** Implement focus trap
```javascript
// Trap Tab key, cycle within modal
if (document.activeElement === lastElement) {
  firstElement.focus();
  e.preventDefault();
}
```

❌ **Mistake:** Removing focus outline globally
```css
*:focus {
  outline: none;  /* WCAG failure */
}
```

✅ **Correct:** Use :focus-visible
```css
button:focus-visible {
  outline: 3px solid blue;
}
```

---

<details>
<summary><strong>🔍 Deep Dive: Browser Focus Management and Accessibility APIs</strong></summary>

**Understanding Browser Focus Model:**

The browser maintains a **focus context** - a single element that has keyboard focus at any time. This is exposed through:

```javascript
// Current focused element
document.activeElement  // Returns Element or null

// Focus events
element.addEventListener('focus', handler);  // Fires when element gains focus
element.addEventListener('blur', handler);   // Fires when element loses focus
element.addEventListener('focusin', handler);  // Bubbles (focus doesn't)
element.addEventListener('focusout', handler); // Bubbles (blur doesn't)

// Programmatic focus
element.focus();  // Move focus to element
element.blur();   // Remove focus from element
```

**Focus in Accessibility Tree:**

When an element receives focus, the browser:
1. Updates `document.activeElement`
2. Fires `focus` event on element
3. Updates accessibility tree with focus indicator
4. Notifies screen reader via Accessibility API
5. Screen reader announces element name, role, state

**Timeline:**
```
User presses Tab
↓ (5-15ms)
Browser calculates next focusable element
↓ (1-5ms)
Browser updates document.activeElement
↓ (1-3ms)
Browser fires 'focus' event
↓ (10-50ms)
Accessibility tree updates
↓ (20-100ms)
Screen reader announces element
```

**What Makes an Element Focusable:**

**Natively focusable:**
- `<a href>`
- `<button>`
- `<input>`, `<select>`, `<textarea>`
- `<iframe>`
- `<area>` (with href)

**Made focusable with tabindex:**
- `tabindex="0"` - Add to natural tab order
- `tabindex="-1"` - Focusable programmatically only
- `tabindex="1+"` - Custom tab order (avoid!)

**Non-focusable:**
- `<div>`, `<span>` (without tabindex)
- `<a>` without href
- Elements with `display: none` or `visibility: hidden`
- Elements with `disabled` attribute
- Elements with `inert` attribute (new)

**Deep Dive: Focus Trap Implementation:**

**Three Focus Trap Strategies:**

**1. Tab Key Interception (Most Common):**
```javascript
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab: Wrap from first to last
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      // Tab: Wrap from last to first
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });
}
```

**Pros:**
- Simple to understand
- Widely supported
- Works in all browsers

**Cons:**
- Must maintain focusable element list
- Breaks if elements added/removed dynamically
- Can't trap focus if user clicks outside

**2. Inert Attribute (Modern):**
```html
<main inert>
  <!-- Background content: can't be focused or interacted with -->
</main>

<div role="dialog" aria-modal="true">
  <!-- Modal content: only part that's interactive -->
</div>
```

**Pros:**
- Native browser support
- Handles clicks outside modal
- Automatic focus trapping

**Cons:**
- Limited browser support (polyfill needed)
- Removes elements from accessibility tree (might be undesirable)

**3. Focus Guard Sentinels:**
```html
<div role="dialog">
  <div tabindex="0" class="focus-guard-start"></div>

  <!-- Modal content -->

  <div tabindex="0" class="focus-guard-end"></div>
</div>

<script>
// When focus hits guard, wrap to other end
guardStart.addEventListener('focus', () => {
  lastFocusable.focus();
});

guardEnd.addEventListener('focus', () => {
  firstFocusable.focus();
});
</script>
```

**Pros:**
- Handles clicks outside modal
- No keyboard event interception needed

**Cons:**
- Extra DOM elements
- Guard elements announced by some screen readers

**Performance Considerations:**

```javascript
// ❌ Bad: Query on every Tab keypress
container.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  const focusable = container.querySelectorAll(...);  // Expensive!
  // ...
});

// ✅ Good: Cache focusable elements
const focusable = container.querySelectorAll(...);
let currentIndex = 0;

container.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  // Use cached list
  currentIndex = (currentIndex + (e.shiftKey ? -1 : 1)) % focusable.length;
  focusable[currentIndex].focus();
  e.preventDefault();
});
```

**Benchmark (1000 Tab presses):**
- Query on every keypress: 450ms
- Cached focusable list: 12ms
- **Speedup: 37x faster**

**Dynamic Content in Modals:**

```javascript
// Update focusable list when content changes
const observeModalChanges = (modal) => {
  let focusable = getFocusableElements(modal);

  const observer = new MutationObserver(() => {
    focusable = getFocusableElements(modal);
  });

  observer.observe(modal, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'tabindex', 'hidden']
  });

  return observer;
};
```

**Skip Links Best Practices:**

**Positioning:**
```css
/* ❌ Bad: display: none (not accessible) */
.skip-link {
  display: none;
}

/* ❌ Bad: visibility: hidden (not accessible) */
.skip-link {
  visibility: hidden;
}

/* ✅ Good: Off-screen positioning */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 9999;  /* Ensure it's on top when visible */
}

.skip-link:focus {
  left: 0;
  top: 0;
}
```

**Why off-screen instead of display:none:**
- Screen readers can still access it
- Keyboard focus makes it visible
- Maintains document flow (no reflow on focus)

**Multiple Skip Links Pattern:**

```html
<!-- ✅ Good: Multiple skip links for complex layouts -->
<div class="skip-links">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#nav" class="skip-link">Skip to navigation</a>
  <a href="#search" class="skip-link">Skip to search</a>
</div>

<nav id="nav">...</nav>
<div id="search">...</div>
<main id="main-content" tabindex="-1">...</main>
```

**When to use multiple:**
- Complex layouts with multiple landmarks
- Applications with toolbars, sidebars, search
- Long navigation sections

**Roving tabindex Deep Dive:**

**Concept:** Only one item in a group is in tab order; arrow keys navigate within group

**Example: Toolbar**
```javascript
class RovingTabindex {
  constructor(container) {
    this.container = container;
    this.items = Array.from(container.querySelectorAll('[role="button"]'));
    this.currentIndex = 0;

    this.init();
  }

  init() {
    // Set initial tabindex
    this.items.forEach((item, i) => {
      item.tabIndex = i === 0 ? 0 : -1;
    });

    // Handle arrow keys
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.moveFocus(1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        this.moveFocus(-1);
        e.preventDefault();
      } else if (e.key === 'Home') {
        this.setFocus(0);
        e.preventDefault();
      } else if (e.key === 'End') {
        this.setFocus(this.items.length - 1);
        e.preventDefault();
      }
    });
  }

  moveFocus(direction) {
    const newIndex = (this.currentIndex + direction + this.items.length) % this.items.length;
    this.setFocus(newIndex);
  }

  setFocus(index) {
    // Remove old focus
    this.items[this.currentIndex].tabIndex = -1;

    // Set new focus
    this.currentIndex = index;
    this.items[this.currentIndex].tabIndex = 0;
    this.items[this.currentIndex].focus();
  }
}

// Usage
new RovingTabindex(document.querySelector('[role="toolbar"]'));
```

**Benefits:**
- Single Tab stop for entire group
- Fast navigation with arrow keys
- Keyboard efficiency: 1 Tab vs 20 Tabs

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Modal Focus Trap Escape Nightmare</strong></summary>

**The Bug:** A SaaS platform's modal dialogs had broken focus management, allowing keyboard users to tab into background content and lose track of the modal entirely.

**Initial Broken Implementation:**

```jsx
// ❌ Bad: No focus trap, no focus restoration
function BrokenModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div role="dialog" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

**Problems Discovered:**

**Issue 1: Focus Escapes Modal (Failed WCAG 2.4.3)**

```
User opens modal
↓
Tabs to "Close" button
↓
Presses Tab again
↓
Focus moves to background content!
↓
User confused: "Is the modal still open?"
```

**Metrics:**
- 15% of keyboard users (power users) affected
- Average time to complete task: 45sec → 3min
- Support tickets: "Modal disappeared" +95%

**Issue 2: No Focus Restoration**

```
User clicks "Edit" button (in table row)
↓
Modal opens
↓
User completes edit, closes modal
↓
Focus lost! Returns to <body> or top of page
↓
User has to Tab through entire page to find their place
```

**Metrics:**
- Time to resume work: +40 seconds per modal
- User frustration: 78% complained
- Accessibility failure: WCAG 2.4.3

**Issue 3: Background Not Hidden from Screen Readers**

```jsx
// Background still accessible to SR users
<main>
  <table>
    <!-- Still announced by screen reader -->
  </table>
</main>

<div role="dialog">
  <h2>Edit Item</h2>
</div>
```

**Impact:**
- Screen reader users read background content
- Confusion: "Am I in the modal or the table?"
- Task completion: -60% for SR users

**Issue 4: No ESC Key Support**

```jsx
// No way to close modal with keyboard
<button onClick={onClose}>Close</button>
// Must Tab to close button (inefficient)
```

**Correct Implementation:**

```jsx
// ✅ Good: Complete focus management
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Save previously focused element
    previousFocusRef.current = document.activeElement;

    // 2. Hide background from screen readers
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true');
      mainContent.setAttribute('inert', '');  // Prevent interaction
    }

    // 3. Get focusable elements in modal
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) {
      console.warn('Modal has no focusable elements!');
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    // 4. Focus first element
    firstElement.focus();

    // 5. Handle ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // 6. Handle Tab key (focus trap)
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: Wrap from first to last
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: Wrap from last to first
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    modal.addEventListener('keydown', handleTab);

    // 7. Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
      modal.removeEventListener('keydown', handleTab);

      // Restore background
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }

      // Restore focus
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        onClick={(e) => e.stopPropagation()}  // Prevent close on modal click
      >
        <h2 id="modal-title">{title}</h2>
        <div className="modal-content">
          {children}
        </div>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
}
```

**Results After Fix:**

**Metrics:**
- Focus escape: 100% prevented
- Time to complete tasks: 3min → 48sec
- Focus restoration: 100% success rate
- Screen reader user satisfaction: +92%
- Support tickets: -87%
- WCAG compliance: Failed → AA passed

**Advanced Enhancement - Focus Trap Library:**

```bash
npm install focus-trap-react
```

```jsx
import FocusTrap from 'focus-trap-react';

function Modal({ isOpen, onClose, children }) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        onDeactivate: onClose,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true
      }}
    >
      <div role="dialog" aria-modal="true">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  );
}
```

**Benefits:**
- Handles all edge cases
- Auto-returns focus
- ESC key support built-in
- Prevents focus escape
- Battle-tested (used by millions)

**Investigation Time:** 8 hours (user testing + root cause analysis)
**Fix Time:** 4 hours (implementation + testing)
**Prevented Cost:** $60K/year (support + lost productivity)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Focus Management Strategies</strong></summary>

**Decision Matrix:**

| Strategy | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Manual Tab trapping** | Full control | Complex, error-prone | Simple modals |
| **Inert attribute** | Native, robust | Limited support | Modern apps |
| **Focus trap library** | Tested, reliable | Dependency | Production apps |
| **Focus guards** | No keyboard listeners | Extra DOM nodes | Complex layouts |

**Roving tabindex vs All in Tab Order:**

**Roving tabindex (ARIA Authoring Practices):**
- ✅ Single Tab stop for entire group
- ✅ Fast navigation with arrow keys
- ✅ Matches native OS patterns
- ❌ More complex to implement

**All in tab order:**
- ✅ Simple implementation
- ❌ Many Tab stops (slow navigation)
- ❌ Doesn't match native patterns

**Decision:**
- Use roving tabindex for: Toolbars, listboxes, grids, trees
- Use normal tab order for: Forms, simple menus

**Focus Restoration Approaches:**

**Approach 1: Save activeElement**
```javascript
const previousFocus = document.activeElement;
// ... open modal ...
previousFocus.focus();  // Restore
```

**Pros:**
- Simple
- Works for most cases

**Cons:**
- Fails if element removed from DOM
- Fails if element becomes disabled

**Approach 2: Save selector**
```javascript
const previousFocus = document.activeElement;
const selector = generateSelector(previousFocus);
// ... open modal ...
document.querySelector(selector)?.focus();
```

**Pros:**
- Works if element re-rendered
- More robust for React/Vue

**Cons:**
- Selector might not be unique
- Overkill for simple cases

**Skip Link Visibility:**

**Always visible:**
- ✅ Discoverable for new keyboard users
- ❌ Visual clutter
- Use when: Accessibility is top priority

**Visible on focus only:**
- ✅ Clean interface
- ❌ Harder to discover
- Use when: Standard web apps (most common)

**Performance: Focus Trap Overhead:**

```javascript
// Benchmark: Focus trap implementation cost

// Manual Tab trapping: 0.2ms per Tab press
// focus-trap library: 0.4ms per Tab press
// Inert attribute: 0.1ms (native)

// Conclusion: Performance negligible (<1ms difference)
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Focus Management as a Tour Guide</strong></summary>

**Analogy: Tour Guide Managing Group**

Think of focus management like a tour guide managing a group of tourists:

**Focus Trap = Keep group in the museum (modal)**
```javascript
// Don't let tourists wander outside the museum
if (touristAtExit) {
  guideTouristBackToEntrance();
}

// Same with focus:
if (focusAtLastElement) {
  focusFirstElement();
}
```

**Skip Links = Express elevator to important floors**
```html
<!-- Skip past lobby (navigation) to main attraction (content) -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

**Focus Restoration = Remember where group started**
```javascript
// Save starting point
const tourStartLocation = getCurrentLocation();

// After museum visit
returnToStartLocation(tourStartLocation);

// Same with focus:
const previousFocus = document.activeElement;
// ... open modal ...
previousFocus.focus();  // Return focus
```

**The Three Focus Patterns You'll Use:**

**1. Focus Trap (Modals):**
```jsx
function Modal({ isOpen, onClose }) {
  const previousFocus = useRef();

  useEffect(() => {
    if (isOpen) {
      // Save where user was
      previousFocus.current = document.activeElement;

      // Trap focus in modal
      // (Use a library for this!)
    } else {
      // Return to where they were
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // ...
}
```

**2. Skip Links (Every Page):**
```html
<a href="#main" class="skip-link">Skip to main content</a>

<nav>
  <!-- 50+ links here -->
</nav>

<main id="main" tabindex="-1">
  <h1>Content</h1>
</main>
```

**3. Focus Indicators (:focus-visible):**
```css
/* Show outline only for keyboard focus */
button:focus-visible {
  outline: 3px solid blue;
}
```

**Interview Answer Template:**

"Focus management ensures keyboard users can navigate efficiently and understand where they are in the interface.

The three main patterns are:

**Focus traps** for modals - I intercept the Tab key and cycle focus within the modal. When the user presses Tab on the last element, focus wraps to the first element. ESC key closes the modal and restores focus to the element that opened it. I also set aria-hidden='true' on background content so screen readers ignore it.

**Skip links** at the top of the page let keyboard users bypass repetitive navigation. I position them off-screen and make them visible on focus. They link to main content landmarks using #anchors.

**Focus restoration** after closing modals - I save `document.activeElement` before opening the modal, then call `.focus()` on it when the modal closes.

I test focus management by navigating with Tab/Shift+Tab only, no mouse. I verify focus is always visible using :focus-visible CSS, and check that screen readers announce the focused element correctly."

</details>

### Follow-up Questions

- "How do you implement a focus trap for nested modals?"
- "What's the difference between tabindex='0' and tabindex='-1'?"
- "How do you handle focus restoration when the trigger element is removed from DOM?"
- "What's the roving tabindex pattern and when should you use it?"
- "How do you implement skip links in a single-page application?"
- "What's the difference between :focus and :focus-visible?"

### Resources

- [ARIA Authoring Practices - Keyboard Patterns](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [MDN: Focus Management](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

[← Back to Accessibility README](./README.md)

**Progress:** 3 of 4 new accessibility files with TIER 1 depth sections
