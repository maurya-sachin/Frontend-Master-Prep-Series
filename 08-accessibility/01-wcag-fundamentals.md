# WCAG and Accessibility Fundamentals

> **Master web accessibility - WCAG guidelines, ARIA, semantic HTML, keyboard navigation, and screen reader support**

---

## Question 1: What are WCAG guidelines and the four POUR principles?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain WCAG (Web Content Accessibility Guidelines). What are the POUR principles and their importance?

### Answer

WCAG provides standards for making web content accessible to people with disabilities.

1. **WCAG Levels**
   - **Level A** - Basic accessibility (must have)
   - **Level AA** - Standard accessibility (recommended, legal requirement in many countries)
   - **Level AAA** - Enhanced accessibility (nice to have)

2. **POUR Principles**
   - **Perceivable** - Information and UI must be presentable to users
   - **Operable** - UI components and navigation must be operable
   - **Understandable** - Information and operation must be understandable
   - **Robust** - Content must be robust enough for assistive technologies

3. **Why It Matters**
   - 15% of world population has some disability
   - Legal requirements (ADA, Section 508, AODA)
   - Better SEO and UX for everyone
   - Larger audience reach

4. **Common Disabilities**
   - Visual (blindness, low vision, color blindness)
   - Auditory (deafness, hard of hearing)
   - Motor (limited movement, tremors)
   - Cognitive (dyslexia, ADHD, learning disabilities)

### Code Example

```html
<!-- PERCEIVABLE -->

<!-- 1. Text alternatives for images -->
<img src="chart.png" alt="Sales increased 45% from Q1 to Q2">

<!-- 2. Captions for videos -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>

<!-- 3. Color is not the only visual means -->
<!-- ❌ Bad: Only color indicates error -->
<input class="error" style="border-color: red;">

<!-- ✅ Good: Icon + color + text -->
<div>
  <input aria-invalid="true" aria-describedby="error-msg">
  <span id="error-msg" class="error">
    <span aria-label="Error">❌</span> Email is required
  </span>
</div>

<!-- 4. Sufficient color contrast -->
<style>
  /* ❌ Bad: Insufficient contrast (3:1) */
  .text {
    color: #777;  /* Gray */
    background: #fff;  /* White */
  }

  /* ✅ Good: AA standard (4.5:1 for normal text) */
  .text {
    color: #595959;
    background: #fff;
  }

  /* ✅ AAA standard (7:1 for normal text) */
  .text {
    color: #333;
    background: #fff;
  }
</style>

<!-- 5. Resizable text (up to 200%) -->
<style>
  /* ✅ Use relative units */
  .text {
    font-size: 1rem;  /* Not 16px */
    line-height: 1.5;
  }
</style>

<!-- OPERABLE -->

<!-- 1. Keyboard accessible -->
<!-- ❌ Bad: Not keyboard accessible -->
<div onclick="handleClick()">Click me</div>

<!-- ✅ Good: Button is focusable and keyboard accessible -->
<button onclick="handleClick()">Click me</button>

<!-- 2. Skip navigation links -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>
  <!-- Navigation links -->
</nav>

<main id="main-content">
  <!-- Main content -->
</main>

<style>
  .skip-link {
    position: absolute;
    left: -9999px;
  }

  .skip-link:focus {
    left: 0;
    top: 0;
    z-index: 1000;
  }
</style>

<!-- 3. Focus visible -->
<style>
  /* ❌ Bad: Removing focus outline */
  button:focus {
    outline: none;  /* Never do this without replacement */
  }

  /* ✅ Good: Custom focus indicator */
  button:focus-visible {
    outline: 3px solid #4A90E2;
    outline-offset: 2px;
  }
</style>

<!-- 4. No keyboard traps -->
<script>
// Modal with focus trap
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;

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

    modalRef.current.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" ref={modalRef}>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
</script>

<!-- 5. Enough time -->
<div role="alert">
  Session will expire in <span id="timer">5:00</span>.
  <button onclick="extendSession()">Extend Session</button>
</div>

<!-- UNDERSTANDABLE -->

<!-- 1. Language of page -->
<html lang="en">

<!-- 2. Language of parts -->
<p>Welcome! <span lang="es">Bienvenidos!</span></p>

<!-- 3. Consistent navigation -->
<nav aria-label="Main navigation">
  <!-- Same order across all pages -->
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- 4. Labels and instructions -->
<!-- ❌ Bad: No label -->
<input type="email" placeholder="Email">

<!-- ✅ Good: Proper label -->
<label for="email">Email address</label>
<input type="email" id="email" required aria-required="true">
<span id="email-hint">We'll never share your email</span>

<!-- 5. Error identification and suggestions -->
<form>
  <label for="username">Username</label>
  <input
    type="text"
    id="username"
    aria-invalid="true"
    aria-describedby="username-error"
  >
  <span id="username-error" role="alert">
    Username must be at least 3 characters long
  </span>
</form>

<!-- ROBUST -->

<!-- 1. Valid HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
</head>
<body>
  <!-- Properly nested elements -->
  <main>
    <article>
      <h1>Title</h1>
      <p>Content</p>
    </article>
  </main>
</body>
</html>

<!-- 2. Name, Role, Value -->
<!-- Custom checkbox -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  onclick="toggleCheckbox()"
  onkeydown="handleKeyDown(event)"
>
  Remember me
</div>

<script>
function toggleCheckbox() {
  const checkbox = event.currentTarget;
  const isChecked = checkbox.getAttribute('aria-checked') === 'true';
  checkbox.setAttribute('aria-checked', !isChecked);
}

function handleKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    toggleCheckbox();
    event.preventDefault();
  }
}
</script>

<!-- 3. Status messages -->
<div role="status" aria-live="polite">
  <!-- Screen reader announces changes -->
  Item added to cart
</div>

<div role="alert" aria-live="assertive">
  <!-- Interrupts screen reader -->
  Error: Payment failed
</div>
```

### WCAG Quick Reference

| Principle | Examples |
|-----------|----------|
| **Perceivable** | Alt text, captions, color contrast, resizable text |
| **Operable** | Keyboard access, skip links, no time limits, focus visible |
| **Understandable** | Clear language, consistent navigation, error help |
| **Robust** | Valid HTML, ARIA attributes, semantic elements |

### Color Contrast Requirements

| Text Size | Level AA | Level AAA |
|-----------|----------|-----------|
| Normal (< 18pt) | 4.5:1 | 7:1 |
| Large (≥ 18pt or bold 14pt) | 3:1 | 4.5:1 |
| UI Components | 3:1 | - |

### Common Mistakes

❌ **Mistake:** Using div/span for interactive elements
```html
<div onclick="submit()">Submit</div>
```

✅ **Correct:** Use semantic HTML
```html
<button onclick="submit()">Submit</button>
```

❌ **Mistake:** Placeholder as label
```html
<input type="email" placeholder="Email">
```

✅ **Correct:** Use proper label
```html
<label for="email">Email</label>
<input type="email" id="email" placeholder="you@example.com">
```

### Follow-up Questions

- "How do you test for accessibility?"
- "What's the difference between Level AA and AAA?"
- "How do screen readers interact with web pages?"
- "What are the legal requirements for accessibility?"

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

## Question 2: What is ARIA and how do you use it correctly?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain ARIA (Accessible Rich Internet Applications). What are roles, properties, and states? When should you use ARIA?

### Answer

ARIA provides semantics for assistive technologies when HTML semantics are insufficient.

1. **First Rule of ARIA**
   - Don't use ARIA if semantic HTML exists
   - Use `<button>` instead of `<div role="button">`
   - Native elements have built-in accessibility

2. **ARIA Roles**
   - Define what an element is
   - Examples: button, navigation, dialog, alert

3. **ARIA Properties**
   - Define relationships or extra information
   - Examples: aria-label, aria-labelledby, aria-describedby

4. **ARIA States**
   - Define current state of element
   - Examples: aria-expanded, aria-checked, aria-hidden

5. **Live Regions**
   - Announce dynamic content changes
   - aria-live: polite, assertive, off

### Code Example

```html
<!-- SEMANTIC HTML FIRST -->

<!-- ❌ Bad: Using ARIA unnecessarily -->
<div role="button" tabindex="0" onclick="submit()">Submit</div>

<!-- ✅ Good: Native button -->
<button onclick="submit()">Submit</button>

<!-- ❌ Bad: Div as heading -->
<div role="heading" aria-level="1">Title</div>

<!-- ✅ Good: Semantic heading -->
<h1>Title</h1>

<!-- ARIA ROLES -->

<!-- Navigation landmark -->
<nav role="navigation" aria-label="Main">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<!-- Main content landmark -->
<main role="main">
  <article>Content</article>
</main>

<!-- Complementary content -->
<aside role="complementary" aria-label="Related articles">
  <h2>Related</h2>
</aside>

<!-- Dialog -->
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure?</p>
  <button>Delete</button>
  <button>Cancel</button>
</div>

<!-- Tab interface -->
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Privacy
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- General settings -->
</div>

<div role="tabpanel" id="panel-2" hidden aria-labelledby="tab-2">
  <!-- Privacy settings -->
</div>

<!-- ARIA PROPERTIES -->

<!-- Labeling -->
<button aria-label="Close dialog">×</button>

<!-- Labeling by reference -->
<div id="dialog-title">Confirm Action</div>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- Dialog content -->
</div>

<!-- Description -->
<button aria-describedby="save-desc">Save</button>
<span id="save-desc">Saves your changes permanently</span>

<!-- Required field -->
<label for="email">Email</label>
<input type="email" id="email" aria-required="true" required>

<!-- Invalid field -->
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-invalid="true"
  aria-describedby="password-error"
>
<span id="password-error">Password must be at least 8 characters</span>

<!-- ARIA STATES -->

<!-- Expanded/Collapsed -->
<button
  aria-expanded="false"
  aria-controls="menu"
  onclick="toggleMenu()"
>
  Menu
</button>
<ul id="menu" hidden>
  <li><a href="/home">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>

<script>
function toggleMenu() {
  const button = event.currentTarget;
  const menu = document.getElementById('menu');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  button.setAttribute('aria-expanded', !isExpanded);
  menu.hidden = isExpanded;
}
</script>

<!-- Checked state -->
<div
  role="checkbox"
  aria-checked="true"
  tabindex="0"
  onclick="toggleCheckbox()"
>
  Subscribe to newsletter
</div>

<!-- Pressed state (toggle button) -->
<button aria-pressed="false" onclick="toggleMute()">
  Mute
</button>

<!-- Current page -->
<nav>
  <a href="/" aria-current="page">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- Disabled -->
<button disabled aria-disabled="true">
  Save
</button>

<!-- LIVE REGIONS -->

<!-- Polite announcements (don't interrupt) -->
<div role="status" aria-live="polite">
  5 items in cart
</div>

<!-- Assertive announcements (interrupt) -->
<div role="alert" aria-live="assertive">
  Error: Payment failed
</div>

<!-- Atomic updates -->
<div aria-live="polite" aria-atomic="true">
  <span>Step 2</span> of <span>5</span>
</div>

<!-- Relevant updates -->
<div aria-live="polite" aria-relevant="additions removals">
  <!-- Only announce additions and removals, not text changes -->
</div>

<!-- HIDING CONTENT -->

<!-- Visually hidden but available to screen readers -->
<span class="sr-only">Click to open menu</span>

<style>
.sr-only {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>

<!-- Hidden from everyone -->
<div hidden>
  This content is hidden
</div>

<!-- Hidden from screen readers only -->
<div aria-hidden="true">
  <span>★★★★★</span>  <!-- Decorative stars -->
</div>
<span class="sr-only">Rated 5 out of 5 stars</span>

<!-- REACT EXAMPLES -->

// Custom select component
function CustomSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxRef = useRef();

  return (
    <div>
      <label id="select-label">{label}</label>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || 'Select...'}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="select-label"
          ref={listboxRef}
        >
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Loading indicator
function LoadingButton({ isLoading, children, ...props }) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true">⏳</span>
          <span class="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Form error announcements
function FormField({ label, error, ...inputProps }) {
  const errorId = `${inputProps.id}-error`;

  return (
    <div>
      <label htmlFor={inputProps.id}>{label}</label>
      <input
        {...inputProps}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### ARIA Roles Reference

| Category | Roles |
|----------|-------|
| **Landmarks** | banner, navigation, main, complementary, contentinfo, search |
| **Widget** | button, checkbox, tab, tabpanel, dialog, tooltip |
| **Document** | article, document, feed, figure, table |
| **Status** | alert, status, log, timer |

### Common Mistakes

❌ **Mistake:** Using ARIA when HTML is sufficient
```html
<div role="button" tabindex="0">Click</div>
```

✅ **Correct:** Use native elements
```html
<button>Click</button>
```

❌ **Mistake:** Conflicting roles
```html
<button role="link">Click</button>
```

✅ **Correct:** Use appropriate element
```html
<a href="/page">Click</a>
```

### Follow-up Questions

- "When should you use aria-label vs aria-labelledby?"
- "What's the difference between aria-hidden and display:none?"
- "How do you create an accessible modal dialog?"
- "What are live region politeness levels?"

### Resources

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Using ARIA](https://www.w3.org/TR/using-aria/)
- [ARIA Examples](https://www.w3.org/WAI/ARIA/apg/example-index/)

---

[← Back to Accessibility README](./README.md)

**Progress:** 2 of 5 accessibility questions
