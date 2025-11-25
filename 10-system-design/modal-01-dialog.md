# Modal/Dialog System Design

> **Focus**: Frontend system design and component architecture

---

## Question 1: Design a Modal/Dialog Component with Focus Trap and Accessibility

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 30-45 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb, Stripe

### Question
Design and implement a production-ready modal/dialog component with focus trapping, portal rendering, backdrop click handling, and full accessibility (ARIA, keyboard navigation). Consider performance, UX, and edge cases.

### Answer

A modal/dialog is an overlay that requires user interaction before returning to the main content. Key requirements include:

1. **Focus Trap** - Keep keyboard focus inside modal (prevent Tab escaping)
2. **Portal Rendering** - Render outside parent DOM hierarchy
3. **Accessibility** - ARIA roles, labels, focus management
4. **Backdrop** - Click outside to close (optional)
5. **Keyboard Shortcuts** - Escape to close, Enter to confirm
6. **Body Scroll Lock** - Prevent background scrolling
7. **Stacking** - Handle multiple modals

### Code Example

**Complete Implementation:**

```javascript
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Production-Ready Modal Component
 * Features:
 * - Focus trap (keyboard navigation stays in modal)
 * - Portal rendering (renders at document.body level)
 * - Backdrop click to close
 * - Escape key to close
 * - Body scroll lock
 * - ARIA attributes for accessibility
 * - Animation (fade in/out)
 * - Prevents focus loss when closed
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  size = 'medium', // 'small', 'medium', 'large', 'fullscreen'
}) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Focus trap refs
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Get all focusable elements
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      modalRef.current.querySelectorAll(focusableSelectors.join(', '))
    );
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore scroll position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Save the currently focused element
    previousActiveElementRef.current = document.activeElement;

    // Wait for modal to render
    setTimeout(() => {
      const focusableElements = getFocusableElements();

      if (focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0];
        lastFocusableRef.current = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstFocusableRef.current?.focus();
      } else {
        // If no focusable elements, focus modal itself
        modalRef.current?.focus();
      }
    }, 100);

    return () => {
      // Restore focus to previous element when modal closes
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen, getFocusableElements]);

  // Focus trap
  const handleTabKey = useCallback(
    (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab on first element → focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element → focus first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements]
  );

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (
      closeOnBackdropClick &&
      e.target === e.currentTarget &&
      !isAnimating
    ) {
      onClose();
    }
  };

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onKeyDown={handleTabKey}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>

          {showCloseButton && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div id="modal-description" className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );

  // Render in portal at document.body level
  return createPortal(modalContent, document.body);
}

// Example: Confirmation Modal with Actions
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary', // 'primary', 'danger'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirmation-modal">
        <p className="confirmation-modal__message">{message}</p>

        <div className="confirmation-modal__actions">
          <button
            className="button button--secondary"
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>

          <button
            className={`button button--${confirmVariant}`}
            onClick={handleConfirm}
            type="button"
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Example: Form Modal
function FormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Form" size="medium">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="button button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button--primary">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Example usage
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = () => {
    console.log('Item deleted');
    // API call to delete item
  };

  return (
    <div className="app">
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      <button onClick={() => setIsConfirmOpen(true)}>Delete Item</button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Welcome"
        size="medium"
      >
        <p>This is a modal with focus trap and accessibility features.</p>
        <button>Focusable Button 1</button>
        <button>Focusable Button 2</button>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}

// CSS (modal.css)
const styles = `
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal container */
.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 300ms ease;
  outline: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Sizes */
.modal--small { max-width: 400px; width: 100%; }
.modal--medium { max-width: 600px; width: 100%; }
.modal--large { max-width: 900px; width: 100%; }
.modal--fullscreen {
  max-width: 95vw;
  max-height: 95vh;
  width: 100%;
  height: 100%;
}

/* Header */
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.modal__close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.modal__close:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal__close:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Content */
.modal__content {
  padding: 24px;
  max-height: calc(90vh - 150px);
  overflow-y: auto;
}

/* Confirmation modal */
.confirmation-modal__message {
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 1.5;
  color: #555;
}

.confirmation-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 12px;
}

/* Buttons */
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.button--primary {
  background: #007bff;
  color: white;
}

.button--primary:hover {
  background: #0056b3;
}

.button--danger {
  background: #dc3545;
  color: white;
}

.button--danger:hover {
  background: #c82333;
}

.button--secondary {
  background: #f0f0f0;
  color: #333;
}

.button--secondary:hover {
  background: #e0e0e0;
}

.button:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal {
    border-radius: 12px 12px 0 0;
    max-height: 90vh;
    animation: slideUp 300ms ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal--small,
  .modal--medium,
  .modal--large {
    max-width: 100%;
    width: 100%;
  }
}
`;

export default Modal;
```

<details>
<summary><strong>🔍 Deep Dive: Focus Trap Implementation & Portal Rendering</strong></summary>

**Why Focus Trap is Critical:**

When a modal is open, keyboard users (including screen reader users) must not be able to Tab out of the modal to the underlying page. This is essential for accessibility.

**Focus Trap Implementation Strategies:**

**1. Tab Key Interception (Most Common):**

```javascript
// ✅ GOOD: Intercept Tab key and wrap focus
function FocusTrap({ children }) {
  const containerRef = useRef(null);

  const getFocusableElements = () => {
    if (!containerRef.current) return [];

    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      containerRef.current.querySelectorAll(selectors.join(', '))
    );
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // SHIFT+TAB on first element → focus last
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // TAB on last element → focus first
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

// HOW IT WORKS:
// Modal has 3 focusable elements: [Close button, Input, Submit button]
// User tabs:
// Close → Input → Submit → (Tab) → Close (wrapped!)
// Submit → Input → Close → (Shift+Tab) → Submit (wrapped backwards!)
```

**2. Sentinel Elements (Alternative Approach):**

```javascript
// ✅ ALTERNATIVE: Use invisible sentinel elements
function FocusTrapWithSentinels({ children }) {
  const firstSentinelRef = useRef(null);
  const lastSentinelRef = useRef(null);
  const contentRef = useRef(null);

  const handleFirstSentinelFocus = () => {
    // Focus moved to top sentinel → wrap to last focusable element
    const focusableElements = getFocusableElements(contentRef.current);
    const lastElement = focusableElements[focusableElements.length - 1];
    lastElement?.focus();
  };

  const handleLastSentinelFocus = () => {
    // Focus moved to bottom sentinel → wrap to first focusable element
    const focusableElements = getFocusableElements(contentRef.current);
    const firstElement = focusableElements[0];
    firstElement?.focus();
  };

  return (
    <>
      {/* Top sentinel (invisible) */}
      <div
        ref={firstSentinelRef}
        tabIndex={0}
        onFocus={handleFirstSentinelFocus}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div ref={contentRef}>{children}</div>

      {/* Bottom sentinel (invisible) */}
      <div
        ref={lastSentinelRef}
        tabIndex={0}
        onFocus={handleLastSentinelFocus}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
    </>
  );
}

// PROS:
// - Works even with dynamic content (new focusable elements added)
// - No need to track Tab key state
// - Simpler logic

// CONS:
// - Extra DOM elements (sentinels)
// - Slightly more complex setup
```

**3. FocusScope from React Aria (Production-Ready):**

```javascript
// ✅ BEST: Use battle-tested library
import { FocusScope } from '@react-aria/focus';

function Modal({ children }) {
  return (
    <FocusScope contain restoreFocus autoFocus>
      <div role="dialog">{children}</div>
    </FocusScope>
  );
}

// PROS:
// - Handles all edge cases (dynamic content, nested modals, etc.)
// - Battle-tested by Adobe (used in Spectrum)
// - Automatic focus restoration
// - Auto-focus first element

// CONS:
// - External dependency (~15KB)
// - Less control over implementation
```

**Portal Rendering with React:**

**Why Portals are Necessary:**

```javascript
// ❌ BAD: Modal rendered inside parent component
function ParentComponent() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h1>Parent Content</h1>

      {/* Modal rendered here */}
      <div className="modal-overlay">
        <div className="modal">
          <p>Modal content</p>
        </div>
      </div>
    </div>
  );
}

// PROBLEMS:
// 1. z-index stacking issues (parent's z-index: 1 limits modal)
// 2. overflow: hidden on parent clips modal
// 3. position: relative on parent affects modal positioning
// 4. CSS specificity conflicts

// RESULT: Modal may be hidden behind other elements!
```

```javascript
// ✅ GOOD: Modal rendered at document.body level via portal
import { createPortal } from 'react-dom';

function Modal({ children }) {
  const modalContent = (
    <div className="modal-overlay">
      <div className="modal">{children}</div>
    </div>
  );

  // Render at document.body level (escapes parent DOM hierarchy)
  return createPortal(modalContent, document.body);
}

// BENEFITS:
// 1. No z-index conflicts (rendered at body level)
// 2. No clipping issues (independent of parent overflow)
// 3. Fixed positioning works correctly
// 4. CSS isolation (no parent styles interfere)

// DOM structure:
// <body>
//   <div id="root">
//     <App>
//       <ParentComponent>
//         <button>Open Modal</button> <!-- Trigger -->
//       </ParentComponent>
//     </App>
//   </div>
//   <div class="modal-overlay"> <!-- Portal rendered here -->
//     <div class="modal">...</div>
//   </div>
// </body>
```

**Advanced Portal with Custom Container:**

```javascript
// Create dedicated modal container
const getModalContainer = () => {
  let container = document.getElementById('modal-root');

  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
  }

  return container;
};

function Modal({ children }) {
  const [container] = useState(() => getModalContainer());

  return createPortal(
    <div className="modal-overlay">
      <div className="modal">{children}</div>
    </div>,
    container
  );
}

// DOM structure:
// <body>
//   <div id="root">...</div>
//   <div id="modal-root"> <!-- Dedicated modal container -->
//     <div class="modal-overlay">...</div>
//   </div>
// </body>

// BENEFITS:
// - Organized structure (all modals in one container)
// - Easier to manage multiple modals
// - Can apply global modal styles to container
```

**Body Scroll Lock Implementation:**

**Naive Approach (Flaws):**

```javascript
// ❌ BAD: Simple overflow: hidden (causes layout shift)
function BadScrollLock({ isLocked }) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isLocked]);
}

// PROBLEMS:
// 1. Scrollbar disappears → content shifts right (layout shift)
// 2. Scroll position lost when unlocked
// 3. Doesn't prevent touch scrolling on iOS
// 4. Background content still scrollable with mouse wheel in some browsers
```

**Proper Scroll Lock:**

```javascript
// ✅ GOOD: Preserve scroll position + prevent layout shift
function BodyScrollLock({ isLocked }) {
  useEffect(() => {
    if (!isLocked) return;

    // 1. Save current scroll position
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 2. Lock scroll with fixed positioning
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // 3. Add padding to prevent layout shift (compensate for scrollbar)
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // 4. Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // 5. Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

// BENEFITS:
// - No layout shift (padding compensates for scrollbar)
// - Scroll position preserved
// - Works on all browsers including iOS
// - Prevents background scrolling completely
```

**iOS Touch Scroll Prevention:**

```javascript
// ✅ BEST: Also prevent touch scrolling on iOS
function IOSScrollLock({ isLocked }) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock body scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Prevent touch scrolling on iOS
    const preventScroll = (e) => {
      // Allow scrolling inside modal content
      const isModalContent = e.target.closest('.modal__content');
      if (!isModalContent) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);

      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isLocked]);
}
```

**Performance Optimization:**

**Lazy Portal Creation:**

```javascript
// ✅ Optimize: Only create portal container when needed
function LazyPortal({ children, isOpen }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (isOpen && !container) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
      setContainer(div);
    }

    return () => {
      if (container && !isOpen) {
        // Delay removal to allow exit animation
        setTimeout(() => {
          container.remove();
        }, 300);
      }
    };
  }, [isOpen, container]);

  if (!isOpen || !container) return null;

  return createPortal(children, container);
}
```

**Animation with CSS Transitions:**

```javascript
// ✅ Smooth enter/exit animations
function AnimatedModal({ isOpen, onClose, children }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger enter animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      // Trigger exit animation
      setIsAnimating(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`modal-overlay ${isAnimating ? 'modal-overlay--visible' : ''}`}
    >
      <div className={`modal ${isAnimating ? 'modal--visible' : ''}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}

// CSS:
// .modal-overlay {
//   opacity: 0;
//   transition: opacity 300ms ease;
// }
// .modal-overlay--visible {
//   opacity: 1;
// }
//
// .modal {
//   opacity: 0;
//   transform: translateY(-20px) scale(0.95);
//   transition: all 300ms ease;
// }
// .modal--visible {
//   opacity: 1;
//   transform: translateY(0) scale(1);
// }
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Modal Focus Loss & Accessibility Issues</strong></summary>

**Scenario**: Your SaaS app's confirmation modals are causing accessibility complaints. Screen reader users report being "trapped" in modals with no way to close them. Keyboard-only users can Tab out of modals back to the main page (breaking focus trap). After closing a modal, focus is lost (goes to document body instead of the button that opened it). WCAG audit gives failing grade (Level A violations).

**Production Metrics (Before Fix):**
- WCAG compliance: Level A failures (5 critical issues)
- Screen reader usability: 2.1/10 rating
- Keyboard navigation issues: 87% of modals
- User complaints from accessibility users: 23/week
- Legal risk: ADA lawsuit threat
- Lost enterprise contracts: 3 (accessibility requirement)

**The Problem Code:**

```javascript
// ❌ CRITICAL BUG: Missing focus trap, no ARIA, poor focus management
function BrokenModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal">
        {/* ❌ BUG: No role="dialog" */}
        {/* ❌ BUG: No aria-modal="true" */}
        {/* ❌ BUG: No aria-labelledby */}
        {/* ❌ BUG: No focus trap */}

        <button onClick={onClose}>Close</button>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ACCESSIBILITY ISSUES:
// 1. No focus trap → User can Tab out of modal to background
// 2. No ARIA roles → Screen readers don't announce it as modal
// 3. No focus restoration → After closing, focus goes to <body>
// 4. No Escape key support → Keyboard users can't close easily
// 5. Backdrop click closes modal → Accidental closes (UX issue)
// 6. No aria-modal → Screen reader reads background content
// 7. No title announcement → Screen reader users don't know what modal is about

// USER EXPERIENCE:
// Screen reader user opens "Delete Account" modal:
// - Screen reader: "button" (doesn't announce modal opened)
// - User presses Tab: Focus moves to background page (expects to stay in modal)
// - User presses Escape: Nothing happens (expects modal to close)
// - User closes modal: Focus lost, no idea where they are
```

**Real Production Bug Report:**

```
Title: Cannot navigate delete confirmation modal with keyboard
Reporter: accessibility-advocate@example.com
Severity: Critical (WCAG 2.1 Level A violation)

Steps to reproduce:
1. Navigate to Settings page using keyboard only
2. Tab to "Delete Account" button, press Enter
3. Modal opens
4. Try to Tab through modal options

Expected:
- Modal should trap focus (Tab cycles through modal elements only)
- Escape key should close modal
- After closing, focus returns to "Delete Account" button
- Screen reader announces modal title and role

Actual:
- Tab key moves focus OUT of modal to background page elements
- Escape key does nothing
- After closing modal, focus is lost (goes to document.body)
- Screen reader doesn't announce modal opened
- No way to know what the modal is about (no title announced)

Impact:
- Cannot use the application with keyboard only
- Screen reader users confused and stuck
- WCAG 2.1 Level A violation (legal risk)

Additional context:
- I am a blind user who relies on screen readers
- This issue blocks me from using critical account management features
- This is a violation of ADA Title III and Section 508
```

**Debugging Process:**

**Step 1: Audit with axe DevTools**

```javascript
// Run axe accessibility scanner
// Results:

// CRITICAL (WCAG 2.1 Level A):
// 1. [aria-required-parent] Modal missing role="dialog"
// 2. [aria-required-attr] Missing aria-modal="true"
// 3. [aria-labelledby] Missing aria-labelledby reference
// 4. [focus-trap] Focus can escape modal (keyboard trap failure)
// 5. [focus-restore] Focus not restored after modal closes

// SERIOUS (WCAG 2.1 Level AA):
// 6. [color-contrast] Close button has 3.2:1 contrast (needs 4.5:1)
// 7. [keyboard] Escape key not working to close modal

// MODERATE:
// 8. [aria-hidden] Background content not hidden from screen readers
// 9. [tabindex] Modal itself not focusable (fallback needed)

// WCAG Grade: F (Failing Level A)
```

**Step 2: Test with Screen Reader (NVDA)**

```
User Action: Click "Open Modal" button
Expected: "Dialog, Welcome to Modal, Close button"
Actual: "button" (doesn't announce dialog opened)

User Action: Press Tab
Expected: Focus stays in modal (Close button → Input → Submit)
Actual: Focus moves to background page (Main Navigation link)

User Action: Press Escape
Expected: Modal closes, focus returns to "Open Modal" button
Actual: Nothing happens (modal stays open, focus lost)

User Action: Click backdrop
Expected: Modal closes (optional UX choice)
Actual: Modal closes, but focus goes to document.body (not original button)

SEVERITY: Screen reader users have NO WAY to interact with modal effectively
```

**Step 3: Fix with Proper Focus Trap + ARIA**

```javascript
// ✅ FIXED: Complete accessibility implementation
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  // Focus trap
  const getFocusableElements = () => {
    if (!modalRef.current) return [];

    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      modalRef.current.querySelectorAll(selectors.join(', '))
    );
  };

  // Handle Tab key for focus trap
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Save currently focused element
    previousActiveElementRef.current = document.activeElement;

    // Hide background content from screen readers
    const appRoot = document.getElementById('root');
    if (appRoot) {
      appRoot.setAttribute('aria-hidden', 'true');
    }

    // Focus first focusable element (or modal itself)
    setTimeout(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        modalRef.current?.focus();
      }
    }, 100);

    return () => {
      // Restore background visibility
      if (appRoot) {
        appRoot.removeAttribute('aria-hidden');
      }

      // Restore focus to previous element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog" // ✅ FIX: ARIA role
        aria-modal="true" // ✅ FIX: Indicates modal state
        aria-labelledby="modal-title" // ✅ FIX: Title reference
        aria-describedby="modal-description" // ✅ FIX: Description reference
        onKeyDown={handleKeyDown}
        tabIndex={-1} // ✅ FIX: Make modal focusable
      >
        <h2 id="modal-title">{title}</h2>

        <button
          onClick={onClose}
          aria-label="Close modal" // ✅ FIX: Screen reader label
        >
          ✕
        </button>

        <div id="modal-description">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// SCREEN READER NOW ANNOUNCES:
// "Dialog, Welcome to Modal. Close modal button, Input field, Submit button"
// User presses Tab: Focus cycles through modal elements only ✅
// User presses Escape: Modal closes, focus returns to original button ✅
// User closes modal: Focus restored to "Open Modal" button ✅
```

**Production Metrics (After Fix):**

```javascript
// Before fix:
// - WCAG compliance: F (Level A failures)
// - Screen reader usability: 2.1/10
// - Keyboard navigation issues: 87% of modals
// - User complaints: 23/week
// - Legal risk: ADA lawsuit threat
// - Lost contracts: 3

// After fix:
// - WCAG compliance: AAA (100% compliant) ✅
// - Screen reader usability: 9.2/10 (343% improvement ✅)
// - Keyboard navigation issues: 0% (100% functional ✅)
// - User complaints: 0/week (100% reduction ✅)
// - Legal risk: Eliminated ✅
// - Won contracts: 5 (accessibility as selling point ✅)

// Additional benefits:
// - Positive PR: Featured on accessibility blogs
// - Enterprise sales: +40% (accessibility requirement met)
// - User satisfaction: +65% among accessibility users
// - Retention: +28% among keyboard-only users
// - Brand reputation: Recognized as accessibility leader
```

**Common Mistakes & Lessons:**

```javascript
// ❌ MISTAKE 1: No role="dialog"
<div className="modal">{children}</div>

// ✅ FIX: Always add ARIA roles
<div role="dialog" aria-modal="true">{children}</div>

// ❌ MISTAKE 2: Focus not restored after close
// User closes modal → focus goes to document.body (lost)

// ✅ FIX: Save and restore focus
const previousElement = document.activeElement;
// ... modal opens ...
// ... modal closes ...
previousElement.focus(); // Restore

// ❌ MISTAKE 3: No focus trap
// User can Tab out of modal to background

// ✅ FIX: Intercept Tab key and wrap focus
if (e.key === 'Tab') {
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  }
  // ... (wrap logic)
}

// ❌ MISTAKE 4: Background content not hidden
// Screen reader reads background while modal is open

// ✅ FIX: Hide background with aria-hidden
document.getElementById('root').setAttribute('aria-hidden', 'true');

// ❌ MISTAKE 5: No Escape key support
// Keyboard users can't close modal easily

// ✅ FIX: Handle Escape key
if (e.key === 'Escape') {
  onClose();
}
```

**Key Takeaways:**

1. **Always use role="dialog" and aria-modal="true"** for modals
2. **Implement focus trap** - Tab must not escape modal
3. **Restore focus** to trigger element when modal closes
4. **Hide background** from screen readers with aria-hidden
5. **Support Escape key** to close modal
6. **Test with screen readers** (NVDA, JAWS, VoiceOver)
7. **Run axe DevTools** to catch accessibility issues early

</details>

<details>
<summary><strong>⚖️ Trade-offs: Modal Implementation Approaches</strong></summary>

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| **Native `<dialog>` element** | Built-in focus trap, ESC key support, browser-optimized | Limited browser support (IE, older Safari), less styling control | Modern browsers only, simple modals |
| **Custom React modal** | Full control, works everywhere, rich features | More code, must implement focus trap manually | Complex interactions, full accessibility |
| **Third-party library (react-modal)** | Battle-tested, feature-rich, accessibility built-in | External dependency (~30KB), less customization | Rapid development, standard requirements |
| **Headless UI (Radix, Reach UI)** | Unstyled primitives, full accessibility, composable | Need to style yourself, learning curve | Design system, full control + accessibility |

**Performance Comparison:**

```javascript
// NATIVE <dialog>:
// Bundle size: 0 KB (native)
// Performance: Excellent (browser-optimized)
// Accessibility: Good (built-in focus trap, ESC key)
// Customization: Limited
// Browser support: Modern only

// CUSTOM REACT:
// Bundle size: ~8 KB (with focus trap)
// Performance: Excellent (when optimized)
// Accessibility: Excellent (when implemented correctly)
// Customization: Full control
// Browser support: All browsers

// REACT-MODAL:
// Bundle size: ~30 KB
// Performance: Good
// Accessibility: Excellent (battle-tested)
// Customization: Good (many options)
// Browser support: All browsers

// RADIX DIALOG:
// Bundle size: ~15 KB
// Performance: Excellent
// Accessibility: Excellent (ARIA compliant)
// Customization: Full (headless - bring your own styles)
// Browser support: All modern browsers
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Modal Component</strong></summary>

**Simple Explanation:**

A modal is like a pop-up window that appears on top of the page and requires the user to interact with it before going back to the main content.

**Key Concepts:**

1. **Focus Trap** - When modal opens, pressing Tab keeps focus INSIDE the modal (can't Tab out to background)
2. **Portal** - Modal renders at the very top of the page (not inside parent component)
3. **Accessibility** - Screen readers announce the modal, keyboard users can navigate it
4. **Focus Restoration** - When modal closes, focus goes back to the button that opened it

**Analogy for a PM:**

"Think of a modal like an important phone call:
- **Focus trap**: While on the call, you ignore everything else (focus is 'trapped' in the conversation)
- **Portal rendering**: The call happens 'above' your current task (not embedded in it)
- **Focus restoration**: After the call ends, you resume exactly where you left off

Without focus trap, it's like being on a call while also trying to cook dinner - confusing and inefficient!"

**Visual Example:**

```javascript
// User journey:

// 1. User clicks "Delete Account" button
<button onClick={() => setIsOpen(true)}>Delete Account</button>

// 2. Modal opens, FOCUS MOVES to modal
[Modal appears]
  Close [X] ← Focus here first
  Are you sure?
  [Cancel] [Delete]

// 3. User presses Tab → Focus cycles INSIDE modal only
  Close [X]
  [Cancel] ← Focus moves here
  [Delete] ← Then here
  Close [X] ← Then wraps back to top (TRAPPED!)

// 4. User presses Escape → Modal closes
// 5. Focus returns to "Delete Account" button ← RESTORED!

// Result: Smooth, accessible experience
```

**Why Each Feature Matters:**

```javascript
// ❌ WITHOUT focus trap:
// User opens modal → presses Tab → focus moves to BACKGROUND page
// Problem: Confusing, accessibility violation

// ✅ WITH focus trap:
// User opens modal → presses Tab → focus stays in modal
// Benefit: Clear, accessible experience

// ❌ WITHOUT portal:
// Modal rendered inside parent → z-index issues, clipping
// Problem: Modal may be hidden behind other elements

// ✅ WITH portal:
// Modal rendered at document.body → no z-index issues
// Benefit: Always appears on top

// ❌ WITHOUT focus restoration:
// User closes modal → focus goes to document.body (lost)
// Problem: Keyboard users don't know where they are

// ✅ WITH focus restoration:
// User closes modal → focus returns to trigger button
// Benefit: User continues where they left off
```

**Interview Answer Template:**

"A production-ready modal needs three critical features:

1. **Focus trap** - Use keyboard event handlers to intercept Tab key. When user reaches last focusable element, wrap back to first element. This prevents Tab from escaping the modal to the background page.

2. **Portal rendering** - Use React's `createPortal` to render modal at document.body level instead of inside parent component. This prevents z-index and clipping issues.

3. **Focus management** - Save currently focused element when modal opens, focus first modal element, and restore focus when modal closes. This ensures keyboard users don't lose their place.

For example, when user clicks 'Delete Account', we save that button reference, open modal and focus the 'Cancel' button, then when they close the modal, we restore focus back to 'Delete Account' button. We also add role='dialog' and aria-modal='true' for screen reader support."

</details>

### Resources

- [WAI-ARIA Authoring Practices: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN: createPortal](https://developer.mozilla.org/en-US/docs/Web/API/Element/createPortal)
- [React Aria: Focus Management](https://react-spectrum.adobe.com/react-aria/FocusScope.html)

---
