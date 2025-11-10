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

### Resources
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

