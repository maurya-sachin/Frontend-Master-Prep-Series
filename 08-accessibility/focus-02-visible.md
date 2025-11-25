# Focus Visible

> **Focus**: Accessibility fundamentals

---

## Question 1: What is :focus-visible and why is it important for keyboard users?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Microsoft, Amazon

### Question
Explain the difference between :focus and :focus-visible, why :focus-visible matters for accessibility, and best practices for focus indicators.

### Answer

**:focus-visible** is a CSS pseudo-class that applies styles only when an element receives focus AND the browser determines that a focus indicator should be visible (typically for keyboard users). This solves the problem of unwanted focus rings when users click buttons with a mouse.

**Key Differences:**

1. **:focus** - Applies when element receives focus (ANY method: mouse, keyboard, touch, JavaScript)
2. **:focus-visible** - Applies only when browser's heuristics determine focus should be visible (usually keyboard/AT navigation)

**Why it matters:**
- **Keyboard users** need visible focus indicators to know where they are on the page
- **Mouse users** find focus rings on clicked buttons visually distracting
- **:focus-visible** provides the best of both worlds - visible when needed, hidden when not

**Browser Heuristics:**

The browser shows focus indicators when:
- User navigates with Tab/Shift+Tab
- User navigates with arrow keys (in certain widgets)
- User activates assistive technology navigation
- Element receives focus via JavaScript AND user was recently using keyboard

The browser hides focus indicators when:
- User clicks/taps with mouse/touch
- Element's focus is purely visual (doesn't need keyboard indication)

### Code Example

**Basic :focus vs :focus-visible:**

```css
/* ❌ OLD WAY: Always show focus ring */
button:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Problems:
   - Mouse users see ring when clicking (annoying)
   - Many developers remove outline entirely (accessibility fail)
*/

/* ✅ NEW WAY: Show focus ring only when needed */
button:focus {
  outline: none; /* Remove default for mouse clicks */
}

button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Result:
   - Keyboard users: See focus ring ✅
   - Mouse users: No ring after click ✅
*/
```

**Complete Focus Styling Pattern:**

```css
/* Base styles */
button {
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

/* Hover state */
button:hover {
  background: #0052a3;
}

/* Remove default focus outline (will use custom) */
button:focus {
  outline: none;
}

/* Custom focus indicator for keyboard users */
button:focus-visible {
  outline: 3px solid #ffbf47; /* High contrast color */
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 191, 71, 0.3); /* Extra emphasis */
}

/* Active state (being clicked) */
button:active {
  background: #003d7a;
  transform: translateY(1px);
}
```

**Form Inputs:**

```css
/* ❌ WRONG: Removing outline entirely */
input:focus {
  outline: none; /* Inaccessible! Keyboard users can't see focus */
}

/* ✅ CORRECT: Keep outline for keyboard, style for mouse */
input {
  border: 2px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

/* Mouse focus: Subtle styling */
input:focus {
  border-color: #0066cc;
  outline: none; /* Remove default outline */
}

/* Keyboard focus: High-visibility indicator */
input:focus-visible {
  border-color: #0066cc;
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}

/* Error state */
input:invalid {
  border-color: #d32f2f;
}

input:invalid:focus-visible {
  outline-color: #d32f2f;
}
```

**Links:**

```css
a {
  color: #0066cc;
  text-decoration: underline;
  border-radius: 2px; /* For focus ring */
}

a:hover {
  color: #0052a3;
  text-decoration: none;
}

/* Remove default focus outline */
a:focus {
  outline: none;
}

/* Keyboard focus: High-contrast ring around link text */
a:focus-visible {
  outline: 2px solid #ffbf47;
  outline-offset: 3px;
  background: rgba(255, 191, 71, 0.1); /* Subtle highlight */
}
```

**Custom Checkbox/Radio (with :focus-within):**

```html
<!-- HTML structure -->
<label class="custom-checkbox">
  <input type="checkbox" class="checkbox-input">
  <span class="checkbox-label">Accept terms and conditions</span>
</label>

<style>
/* Hide native checkbox */
.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

/* Custom checkbox appearance */
.checkbox-input + .checkbox-label::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: middle;
  transition: all 0.2s;
}

/* Checked state */
.checkbox-input:checked + .checkbox-label::before {
  background: #0066cc;
  border-color: #0066cc;
  background-image: url('data:image/svg+xml,...'); /* Checkmark icon */
}

/* ❌ WRONG: No focus indicator */
.checkbox-input:focus + .checkbox-label::before {
  border-color: #0066cc;
}

/* ✅ CORRECT: Visible focus indicator for keyboard users */
.checkbox-input:focus + .checkbox-label::before {
  border-color: #0066cc; /* Subtle for mouse */
}

.checkbox-input:focus-visible + .checkbox-label::before {
  border-color: #0066cc;
  outline: 3px solid #ffbf47; /* High-visibility for keyboard */
  outline-offset: 2px;
}

/* Alternative: Use :focus-within on label */
.custom-checkbox:focus-within {
  outline: 2px solid #ffbf47;
  outline-offset: 4px;
  border-radius: 4px;
}
</style>
```

**Card/Interactive Divs:**

```css
/* Interactive card (clickable) */
.card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Make it focusable */
.card[tabindex] {
  position: relative;
}

/* Remove default focus */
.card:focus {
  outline: none;
}

/* Keyboard focus: Visible indicator */
.card:focus-visible {
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
              0 0 0 4px rgba(255, 191, 71, 0.3);
}
```

**Skip Links:**

```css
/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -100px; /* Hidden off-screen */
  left: 10px;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 9999;
  transition: top 0.2s;
}

/* Show on keyboard focus ONLY */
.skip-link:focus-visible {
  top: 10px; /* Slide into view */
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}

/* Don't show on mouse focus (if user somehow clicks while off-screen) */
.skip-link:focus:not(:focus-visible) {
  top: -100px; /* Stay hidden */
}
```

**Modal Focus Trap:**

```css
/* Modal backdrop */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal container */
.modal {
  background: white;
  padding: 32px;
  border-radius: 8px;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* All focusable elements in modal */
.modal button,
.modal a,
.modal input {
  /* Standard focus-visible styles */
}

/* Close button (top-right X) */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.modal-close:focus {
  outline: none;
}

.modal-close:focus-visible {
  outline: 2px solid #ffbf47;
  outline-offset: 2px;
  background: rgba(0, 0, 0, 0.05);
}
```

**Polyfill for Older Browsers:**

```css
/* Fallback for browsers without :focus-visible support */

/* Default: Hide focus outline */
button:focus {
  outline: none;
}

/* Show for keyboard users (with class added by polyfill) */
button.focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Or use :focus-visible with fallback */
button:focus-visible,
button.focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

```javascript
// JavaScript polyfill (simplified concept)
// Real polyfill: https://github.com/WICG/focus-visible

(function() {
  let hadKeyboardEvent = false;

  // Detect keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      hadKeyboardEvent = true;
    }
  });

  // Detect mouse clicks
  document.addEventListener('mousedown', () => {
    hadKeyboardEvent = false;
  });

  // On focus, check if keyboard was used
  document.addEventListener('focus', (e) => {
    if (hadKeyboardEvent) {
      e.target.classList.add('focus-visible');
    }
  }, true);

  // On blur, remove class
  document.addEventListener('blur', (e) => {
    e.target.classList.remove('focus-visible');
  }, true);
})();
```

**High Contrast Mode Support:**

```css
/* Ensure focus indicators work in Windows High Contrast Mode */

button:focus-visible {
  outline: 2px solid #ffbf47;
  outline-offset: 2px;
}

/* High Contrast Mode detection and enhancement */
@media (prefers-contrast: high) {
  button:focus-visible {
    outline-width: 3px;
    outline-style: solid;
    /* Color will be overridden by HCM, but outline style preserved */
  }
}

/* Forced colors mode (Windows High Contrast) */
@media (forced-colors: active) {
  button:focus-visible {
    outline: 3px solid; /* Browser chooses high-contrast color */
  }
}
```

<details>
<summary><strong>🔍 Deep Dive: Browser Heuristics for :focus-visible</strong></summary>

**How Browsers Decide When to Show Focus Indicators:**

Browsers use complex heuristics to determine when `:focus-visible` should apply. These heuristics evolved from user research and accessibility feedback.

**Chromium's Heuristic Algorithm (Simplified):**

```javascript
// Conceptual model of Chromium's focus-visible logic

class FocusVisibleManager {
  constructor() {
    this.hadKeyboardEvent = false;
    this.hadFocusVisibleRecently = false;
    this.lastFocusTime = 0;
  }

  // Check if focus should be visible for this element
  shouldShowFocusRing(element, focusMethod) {
    // Rule 1: Always show for text inputs (always need visible focus)
    if (this.isTextInputElement(element)) {
      return true;
    }

    // Rule 2: Show if user recently used keyboard
    if (this.hadKeyboardEvent) {
      return true;
    }

    // Rule 3: Show if focus was recently visible (within 1 second)
    // This prevents flickering when tabbing quickly
    const now = Date.now();
    if (now - this.lastFocusTime < 1000 && this.hadFocusVisibleRecently) {
      return true;
    }

    // Rule 4: Show if element was focused programmatically
    // AND user was using keyboard recently
    if (focusMethod === 'script' && this.hadKeyboardEvent) {
      return true;
    }

    // Rule 5: Don't show for mouse/touch
    if (focusMethod === 'mouse' || focusMethod === 'touch') {
      return false;
    }

    // Default: Don't show
    return false;
  }

  isTextInputElement(element) {
    // Text inputs always show focus (user is typing)
    if (element.tagName === 'TEXTAREA') return true;

    if (element.tagName === 'INPUT') {
      const type = element.type.toLowerCase();
      return ['text', 'email', 'password', 'number', 'search', 'tel', 'url'].includes(type);
    }

    if (element.contentEditable === 'true') return true;

    return false;
  }

  // Track keyboard events
  onKeyDown(event) {
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) {
      this.hadKeyboardEvent = true;
    }
  }

  // Track mouse events
  onMouseDown() {
    this.hadKeyboardEvent = false;
  }

  // Track touch events
  onTouchStart() {
    this.hadKeyboardEvent = false;
  }

  // Update when focus changes
  onFocus(element, method) {
    const shouldShow = this.shouldShowFocusRing(element, method);

    if (shouldShow) {
      element.classList.add('focus-visible-active');
      this.hadFocusVisibleRecently = true;
      this.lastFocusTime = Date.now();
    } else {
      element.classList.remove('focus-visible-active');
      this.hadFocusVisibleRecently = false;
    }
  }

  onBlur(element) {
    element.classList.remove('focus-visible-active');
  }
}

// Usage:
const manager = new FocusVisibleManager();

document.addEventListener('keydown', (e) => manager.onKeyDown(e));
document.addEventListener('mousedown', () => manager.onMouseDown());
document.addEventListener('touchstart', () => manager.onTouchStart());

document.addEventListener('focus', (e) => {
  const method = determineFocusMethod(e); // 'keyboard', 'mouse', 'script'
  manager.onFocus(e.target, method);
}, true);

document.addEventListener('blur', (e) => {
  manager.onBlur(e.target);
}, true);
```

**Special Cases:**

```javascript
// Case 1: Text inputs ALWAYS show focus
<input type="text" id="name">

// User clicks input with mouse
// :focus applies ✅
// :focus-visible applies ✅ (text inputs are special)

// Case 2: Buttons show focus only for keyboard
<button id="submit">Submit</button>

// User clicks button with mouse
// :focus applies ✅
// :focus-visible applies ❌ (mouse click)

// User tabs to button with keyboard
// :focus applies ✅
// :focus-visible applies ✅ (keyboard)

// Case 3: Programmatic focus
const button = document.getElementById('submit');

// User was using mouse
button.focus(); // Called via script
// :focus applies ✅
// :focus-visible applies ❌ (no recent keyboard activity)

// User was using keyboard (pressed Tab recently)
button.focus(); // Called via script
// :focus applies ✅
// :focus-visible applies ✅ (recent keyboard activity)

// Case 4: Contenteditable
<div contenteditable="true">Edit me</div>

// User clicks div with mouse
// :focus applies ✅
// :focus-visible applies ✅ (contenteditable is text input)
```

**Browser Differences:**

```javascript
// Chromium (Chrome, Edge)
// - Most sophisticated heuristics
// - Tracks "keyboard mode" globally
// - Respects text input exception

// Firefox
// - Similar to Chromium
// - Slightly different timing for mode switches

// Safari
// - Added :focus-visible support in Safari 15.4 (March 2022)
// - Simpler heuristics than Chromium
// - May show focus more often (more conservative)

// Testing differences:
// Chrome: User tabs to button, clicks elsewhere, clicks button
// Result: No focus ring (switched to mouse mode)

// Safari: Same scenario
// Result: May show focus ring (doesn't switch modes as aggressively)
```

**Performance Implications:**

```javascript
// :focus-visible requires browser to track user input mode

// Performance cost: Minimal
// - Event listeners for keydown, mousedown, touchstart
// - Global state tracking (single boolean)
// - Style recalculation when mode changes

// Benchmark (10,000 focus changes):
console.time('with-focus-visible');
for (let i = 0; i < 10000; i++) {
  button.focus();
  button.blur();
}
console.timeEnd('with-focus-visible'); // ~45ms

console.time('without-focus-visible');
for (let i = 0; i < 10000; i++) {
  button.focus();
  button.blur();
}
console.timeEnd('without-focus-visible'); // ~43ms

// Difference: ~2ms for 10,000 focus changes (0.0002ms per focus)
// Negligible performance impact
```

**Accessibility Tree Integration:**

```javascript
// :focus-visible affects visual presentation only
// Accessibility tree always reflects focus state

// Example:
<button id="btn">Click me</button>

// User clicks button (mouse)
// Visual: No focus ring (:focus-visible doesn't apply)
// Accessibility tree: focused=true (screen readers announce focus)

// User tabs to button (keyboard)
// Visual: Focus ring shown (:focus-visible applies)
// Accessibility tree: focused=true (same as above)

// Key insight: :focus-visible is purely visual
// Doesn't affect programmatic focus detection or screen readers
```

**Edge Cases:**

```javascript
// Case 1: Focus moves within element
<div class="dropdown">
  <button>Menu</button>
  <div class="dropdown-content">
    <a href="#">Item 1</a>
    <a href="#">Item 2</a>
  </div>
</div>

// User tabs to button (keyboard)
// button:focus-visible applies ✅

// JavaScript opens dropdown and focuses first link
const firstLink = document.querySelector('.dropdown-content a');
firstLink.focus();

// firstLink:focus-visible applies ✅ (keyboard mode persists)

// Case 2: Focus returns after alert/dialog
<button id="btn">Show Alert</button>

// User tabs to button
btn.addEventListener('click', () => {
  alert('Hello!');
});

// Sequence:
// 1. User tabs to button: :focus-visible applies ✅
// 2. User presses Enter: Alert shows
// 3. User closes alert: Focus returns to button
// 4. :focus-visible still applies ✅ (keyboard mode persists)

// Case 3: Virtual focus (ARIA widgets)
<div role="listbox" tabindex="0">
  <div role="option" aria-selected="false">Option 1</div>
  <div role="option" aria-selected="true">Option 2</div>
</div>

// Container has real focus: :focus-visible applies ✅
// Options have "virtual" focus via aria-selected
// Only container shows focus ring, not options
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Site Focus Indicators</strong></summary>

**Scenario**: You're leading the accessibility audit for a major e-commerce site. During user testing with keyboard-only users, you discover that:
- Users struggle to see where they are on the page
- Many developers removed focus outlines because "they look ugly"
- Mouse users complain about blue rings appearing when clicking buttons
- Keyboard users have **4.2x longer task completion times** than mouse users
- **23% of keyboard users abandon checkout** due to "can't see where I am"

**Production Metrics (Before Fix):**
- Keyboard user task completion time: 6.3 minutes
- Mouse user task completion time: 1.5 minutes
- Keyboard user checkout abandonment: 23%
- Mouse user checkout abandonment: 5%
- Accessibility WCAG violations: 47 instances of "missing focus indicators"
- Support tickets about "can't navigate with keyboard": 12/week
- Legal risk: High (ADA compliance issues)

**The Problem Code:**

```css
/* ❌ BAD: Global outline removal (accessibility fail) */
* {
  outline: none !important;
}

/* Result: No focus indicators anywhere
   - Keyboard users can't see where they are
   - Violates WCAG 2.1 SC 2.4.7 (Focus Visible)
*/

/* ❌ BAD: Removing outline only on buttons */
button:focus {
  outline: none; /* No focus indicator! */
}

/* ❌ BAD: Very subtle focus indicator (insufficient contrast) */
button:focus {
  outline: 1px solid #ccc; /* Too subtle, fails WCAG contrast */
}

/* ❌ BAD: Focus indicator same as hover */
button:hover,
button:focus {
  background: #0052a3;
}
/* Problem: User can't distinguish hover from focus */
```

**User Testing Observations:**

```
Observer notes - Participant #1 (Keyboard-only user, motor disability):
- User tabs through product grid
- Spends 20 seconds looking for visual cue of current product
- User: "I can't tell which product I'm on. Is this normal?"
- User eventually gives up and uses screen reader to navigate
- Task completion: Failed

Observer notes - Participant #2 (Low vision user, keyboard navigation):
- User tabs through checkout form
- Skips past credit card field because didn't see focus indicator
- User: "Did I tab past the card number field? I can't tell where I am."
- User tabs backward multiple times trying to find field
- Task completion: 8.5 minutes (should be ~2 minutes)

Observer notes - Participant #3 (Power user, prefers keyboard):
- User quickly tabs through navigation
- Clicks button with mouse to test
- User: "Why is there a blue ring when I click? That's annoying."
- User continues navigating with keyboard
- User: "Wait, now there's no blue ring when I tab. I can't see anything."
- User switches to mouse navigation (slower but has visual feedback)
</summary>

**Step 1: Implement :focus-visible**

```css
/* ✅ FIXED: Proper focus indicators with :focus-visible */

/* Global focus reset (remove default, add custom) */
*:focus {
  outline: none; /* Remove for mouse clicks */
}

*:focus-visible {
  outline: 3px solid #ffbf47; /* High contrast yellow */
  outline-offset: 2px;
}

/* Buttons */
.btn {
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.btn:hover {
  background: #0052a3;
}

.btn:focus {
  outline: none; /* Remove for mouse */
}

.btn:focus-visible {
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255, 191, 71, 0.2);
}

.btn:active {
  transform: translateY(1px);
}

/* Form inputs */
.form-input {
  border: 2px solid #ccc;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #0066cc;
  outline: none;
}

.form-input:focus-visible {
  border-color: #0066cc;
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}

/* Product cards (clickable) */
.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-card:focus {
  outline: none;
}

.product-card:focus-visible {
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1),
              0 0 0 6px rgba(255, 191, 71, 0.2);
}

/* Links */
a {
  color: #0066cc;
  text-decoration: underline;
  border-radius: 2px;
  transition: all 0.2s;
}

a:hover {
  color: #0052a3;
}

a:focus {
  outline: none;
}

a:focus-visible {
  outline: 2px solid #ffbf47;
  outline-offset: 3px;
  background: rgba(255, 191, 71, 0.1);
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 10px;
  background: #000;
  color: #fff;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  z-index: 10000;
  transition: top 0.3s;
}

.skip-link:focus-visible {
  top: 10px;
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}
```

**Step 2: Add Focus Polyfill for Older Browsers**

```html
<!-- Include focus-visible polyfill -->
<script src="https://unpkg.com/focus-visible@5.2.0/dist/focus-visible.min.js"></script>

<!-- Or CDN -->
<script src="https://cdn.jsdelivr.net/npm/focus-visible@5.2.0/dist/focus-visible.min.js"></script>
```

```css
/* Polyfill fallback (for older browsers) */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}

button.focus-visible {
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}
```

**Step 3: Accessibility Testing**

```javascript
// Automated test: Check all interactive elements have focus indicators

const interactiveElements = document.querySelectorAll(
  'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
);

const elementsWithoutFocus = [];

interactiveElements.forEach(el => {
  // Simulate keyboard focus
  el.focus();
  el.classList.add('focus-visible'); // Polyfill class

  // Get computed styles
  const styles = window.getComputedStyle(el);
  const outline = styles.outline;
  const outlineWidth = styles.outlineWidth;

  // Check if focus indicator exists and is visible
  if (outline === 'none' || outlineWidth === '0px') {
    elementsWithoutFocus.push(el);
  }

  el.blur();
  el.classList.remove('focus-visible');
});

if (elementsWithoutFocus.length > 0) {
  console.error(`❌ ${elementsWithoutFocus.length} elements missing focus indicators:`, elementsWithoutFocus);
} else {
  console.log('✅ All interactive elements have focus indicators');
}
```

**Production Metrics (After Fix):**

```javascript
// Before fix:
// - Keyboard task completion: 6.3 minutes
// - Keyboard checkout abandonment: 23%
// - WCAG violations: 47
// - Support tickets: 12/week

// After fix:
// - Keyboard task completion: 1.8 minutes ✅ (72% faster!)
// - Keyboard checkout abandonment: 6% ✅ (74% reduction!)
// - WCAG violations: 0 ✅ (100% compliance!)
// - Support tickets: 0/week ✅ (100% reduction!)
// - User satisfaction (keyboard users): +88%
// - Conversion rate (keyboard users): +21%

// Additional benefits:
// - Mouse users no longer see "ugly focus rings" on clicks
// - Keyboard users have clear, high-contrast indicators
// - Legal risk eliminated (WCAG 2.1 AA compliant)
// - Improved brand reputation
// - Increased accessible user base
```

**User Feedback After Fix:**

```
User A (Keyboard-only):
"FINALLY! I can actually see where I am on the page. The yellow focus
indicators are perfect - bright enough to see, but not distracting.
Shopping is actually enjoyable now."

User B (Low vision):
"The high-contrast focus indicators are a game-changer. I can navigate
without zooming in constantly to see what's focused."

User C (Power keyboard user):
"Perfect! When I click buttons with my mouse, no annoying blue ring.
When I tab around, the yellow indicator is clear and visible. This is
exactly how it should work."
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Focus Styling Approaches</strong></summary>

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **:focus only** | Simple, works everywhere | Shows on mouse clicks (annoying) | Legacy browsers, quick prototypes |
| **:focus-visible** | Best UX (keyboard only) | Requires polyfill for old browsers | Modern sites (95%+ browser support) |
| **outline: none globally** | "Clean" design | Inaccessible, fails WCAG | ❌ Never use |
| **Custom focus with box-shadow** | Creative styling | May not work in High Contrast Mode | Design-forward sites (with outline fallback) |

**Performance Comparison:**

```javascript
// Scenario: 1,000 elements with focus styles

// Test 1: Simple outline (fastest)
*:focus-visible {
  outline: 2px solid blue;
}
// Style recalc: ~2ms

// Test 2: Outline + box-shadow (moderate)
*:focus-visible {
  outline: 2px solid blue;
  box-shadow: 0 0 0 4px rgba(0, 0, 255, 0.2);
}
// Style recalc: ~4ms

// Test 3: Complex animation (slower)
*:focus-visible {
  outline: 2px solid blue;
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 0, 255, 0); }
}
// Style recalc: ~12ms (animation overhead)

// Lesson: Simple outline is fastest, but difference negligible for UX
```

</details>

<details>
<summary><strong>💬 Explain to Junior: :focus-visible</strong></summary>

**Simple Explanation:**

Imagine you're using a website with only your keyboard (no mouse). As you press Tab to move between buttons, links, and form fields, you need to see WHERE you are on the page. That visual indicator (usually a colored ring or outline) is the **focus indicator**.

**The Problem:**
- **Old way** (`:focus`): Always shows the ring, even when you click with a mouse
- **Mouse users**: "Ugh, this blue ring is annoying when I click buttons!"
- **Developers**: "Let's remove it with `outline: none`"
- **Keyboard users**: "Wait, now I can't see anything! How do I navigate?"

**The Solution:**
**:focus-visible** = Shows focus ring ONLY when needed (keyboard navigation), hides it for mouse clicks

**Code Example:**

```css
/* ❌ OLD WAY: Annoying for mouse users */
button:focus {
  outline: 2px solid blue;
}
/* Result:
   - Keyboard: Ring shows ✅
   - Mouse click: Ring shows ❌ (annoying)
*/

/* ✅ NEW WAY: Best of both worlds */
button:focus {
  outline: none; /* Hide for mouse */
}

button:focus-visible {
  outline: 2px solid blue; /* Show for keyboard */
}
/* Result:
   - Keyboard: Ring shows ✅
   - Mouse click: No ring ✅
*/
```

**Analogy for a PM:**

"Think of :focus-visible like auto-brightness on your phone:

- **:focus**: Brightness always at 100% (whether indoors or in sunlight)
- **:focus-visible**: Brightness adjusts automatically based on environment
  - Indoors (mouse user): Dim/off (not needed)
  - In sunlight (keyboard user): Bright (needed to see)

The browser is smart enough to know when you're using a keyboard vs mouse and shows the focus ring accordingly."

**Visual Example:**

```html
<button>Click Me</button>

<!-- User clicks with MOUSE: -->
<!-- Visual: No focus ring (looks clean) -->

<!-- User presses TAB (keyboard): -->
<!-- Visual: Focus ring appears (can see where they are!) -->

<!-- User clicks with MOUSE again: -->
<!-- Visual: No focus ring (doesn't distract from content) -->
```

</details>

### Common Mistakes

❌ **Wrong**: Removing outline globally
```css
* { outline: none !important; }
/* Inaccessible - keyboard users can't navigate */
```

✅ **Correct**: Use :focus-visible
```css
*:focus { outline: none; }
*:focus-visible { outline: 2px solid blue; }
```

❌ **Wrong**: No difference between :focus and :focus-visible
```css
button:focus,
button:focus-visible {
  outline: 2px solid blue;
}
/* Same as :focus only (shows on mouse clicks) */
```

✅ **Correct**: Different styling
```css
button:focus { outline: none; }
button:focus-visible { outline: 2px solid blue; }
```

❌ **Wrong**: Low contrast focus indicator
```css
button:focus-visible {
  outline: 1px solid #ccc; /* Fails WCAG contrast */
}
```

✅ **Correct**: High contrast (3:1 minimum)
```css
button:focus-visible {
  outline: 3px solid #ffbf47; /* High contrast */
}
```

### Follow-up Questions

1. **What contrast ratio do focus indicators need to meet WCAG 2.1?**
   - Minimum 3:1 contrast ratio against adjacent colors (SC 1.4.11)

2. **Can I use only box-shadow for focus indicators?**
   - Not recommended - box-shadow may not appear in Windows High Contrast Mode
   - Always use `outline` as base, box-shadow for enhancement

3. **How do I test :focus-visible?**
   - Manual: Tab through with keyboard, click with mouse
   - Automated: focus-visible polyfill test suite
   - Tools: Chrome DevTools (force :focus-visible state)

### Resources

- [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WCAG 2.1 SC 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [focus-visible Polyfill](https://github.com/WICG/focus-visible)