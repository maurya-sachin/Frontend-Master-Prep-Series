# ARIA States and Dynamic Updates

> **Master ARIA states - aria-expanded, aria-hidden, aria-disabled, and dynamic state management**

---

## Question 1: What are ARIA states and how do you manage them for dynamic components?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain ARIA states like aria-expanded, aria-hidden, aria-disabled, aria-selected, aria-checked. How do you keep them synchronized with visual state changes in dynamic components?

### Answer

ARIA states communicate the current status of interactive elements to assistive technologies. Unlike properties (which are mostly static), states change frequently during user interaction and MUST stay synchronized with visual changes.

1. **Key ARIA States**
   - **aria-expanded** - Collapsed/expanded state (accordions, dropdowns, menus)
   - **aria-hidden** - Hides element from accessibility tree
   - **aria-disabled** - Disabled state (different from disabled attribute)
   - **aria-selected** - Selection state (tabs, listbox options)
   - **aria-checked** - Checkbox/radio/switch state (true/false/mixed)
   - **aria-pressed** - Toggle button state (true/false)
   - **aria-busy** - Loading/processing state
   - **aria-invalid** - Form validation error state

2. **Dynamic State Management Rules**
   - State MUST match visual appearance
   - Update state immediately when visual changes
   - Use JavaScript to toggle states on interaction
   - Test with screen reader to verify announcements
   - Use aria-live regions for dynamic updates

3. **State vs Attribute**
   - **disabled attribute:** Removes from tab order, prevents interaction
   - **aria-disabled:** Keeps in tab order, announces disabled but requires JS to prevent interaction
   - **hidden attribute:** Removes from DOM flow AND accessibility tree
   - **aria-hidden:** Removes only from accessibility tree (still visible)

4. **State Synchronization Pattern**
   ```javascript
   // When visual state changes, update ARIA state
   const toggle = (element) => {
     const isExpanded = element.getAttribute('aria-expanded') === 'true';
     element.setAttribute('aria-expanded', !isExpanded);
     // Also update visual (show/hide content)
     content.hidden = isExpanded;
   };
   ```

### Code Example

```html
<!-- ARIA-EXPANDED: Accordion/Dropdown State -->

<!-- ❌ Bad: No state indication -->
<button onclick="toggleMenu()">Menu</button>
<div id="menu">
  <a href="/home">Home</a>
  <a href="/about">About</a>
</div>

<!-- ✅ Good: aria-expanded tracks open/closed state -->
<button
  id="menu-btn"
  aria-expanded="false"
  aria-controls="menu"
  onclick="toggleMenu()"
>
  Menu
  <span aria-hidden="true">▼</span>
</button>

<div id="menu" hidden>
  <a href="/home">Home</a>
  <a href="/about">About</a>
</div>

<script>
function toggleMenu() {
  const button = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  // Update ARIA state
  button.setAttribute('aria-expanded', !isExpanded);

  // Update visual state (must match ARIA!)
  menu.hidden = isExpanded;
}
</script>

<!-- ARIA-HIDDEN: Visibility Control -->

<!-- ✅ Good: Hide decorative elements from screen readers -->
<button aria-label="Delete">
  <span aria-hidden="true">🗑️</span>
  <span class="sr-only">Delete</span>
</button>

<!-- ❌ Bad: Hiding important content -->
<div aria-hidden="true">
  <h1>Page Title</h1>  <!-- Screen readers miss this! -->
</div>

<!-- ✅ Good: Modal with aria-hidden on background -->
<div class="page-content" aria-hidden="true">
  <!-- Hidden when modal is open -->
</div>

<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure?</p>
  <button onclick="confirmDelete()">Delete</button>
  <button onclick="closeDialog()">Cancel</button>
</div>

<script>
function openDialog() {
  // Hide page content from screen readers
  document.querySelector('.page-content').setAttribute('aria-hidden', 'true');

  // Show dialog
  const dialog = document.querySelector('[role="dialog"]');
  dialog.hidden = false;
  dialog.querySelector('button').focus();
}

function closeDialog() {
  // Restore page content to screen readers
  document.querySelector('.page-content').setAttribute('aria-hidden', 'false');

  // Hide dialog
  const dialog = document.querySelector('[role="dialog"]');
  dialog.hidden = true;
}
</script>

<!-- ARIA-DISABLED: Disabled State -->

<!-- ❌ Confusing: Looks disabled but still interactive -->
<button class="disabled-style" onclick="submit()">
  Submit
</button>

<!-- ✅ Good: Native disabled (removes from tab order) -->
<button disabled>
  Submit (disabled)
</button>

<!-- ✅ Good: aria-disabled (keeps in tab order, requires JS prevention) -->
<button
  aria-disabled="true"
  onclick="handleClick(event)"
  class="disabled"
>
  Submit (processing...)
</button>

<script>
function handleClick(event) {
  const button = event.currentTarget;

  // Check aria-disabled state
  if (button.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    return; // Prevent action
  }

  // Normal submit logic
  submit();
}

// When processing
function setProcessing(isProcessing) {
  const button = document.querySelector('button');
  button.setAttribute('aria-disabled', isProcessing);

  if (isProcessing) {
    button.textContent = 'Processing...';
    button.classList.add('disabled');
  } else {
    button.textContent = 'Submit';
    button.classList.remove('disabled');
  }
}
</script>

<!-- ARIA-SELECTED: Selection State (Tabs, Listbox) -->

<!-- ✅ Good: Tab interface with aria-selected -->
<div role="tablist" aria-label="Settings">
  <button
    role="tab"
    id="tab-1"
    aria-selected="true"
    aria-controls="panel-1"
    tabindex="0"
  >
    General
  </button>

  <button
    role="tab"
    id="tab-2"
    aria-selected="false"
    aria-controls="panel-2"
    tabindex="-1"
  >
    Privacy
  </button>

  <button
    role="tab"
    id="tab-3"
    aria-selected="false"
    aria-controls="panel-3"
    tabindex="-1"
  >
    Security
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <h2>General Settings</h2>
  <!-- Content -->
</div>

<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  <h2>Privacy Settings</h2>
  <!-- Content -->
</div>

<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
  <h2>Security Settings</h2>
  <!-- Content -->
</div>

<script>
function selectTab(selectedTab) {
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab, index) => {
    const isSelected = tab === selectedTab;

    // Update aria-selected state
    tab.setAttribute('aria-selected', isSelected);

    // Update tabindex (only selected tab is focusable)
    tab.tabIndex = isSelected ? 0 : -1;

    // Show/hide corresponding panel
    panels[index].hidden = !isSelected;
  });

  // Focus selected tab
  selectedTab.focus();
}
</script>

<!-- ARIA-CHECKED: Checkbox/Radio/Switch State -->

<!-- ✅ Good: Custom checkbox with aria-checked -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  onclick="toggleCheckbox()"
  onkeydown="handleCheckboxKey(event)"
>
  <span class="checkbox-icon"></span>
  <span>I agree to terms</span>
</div>

<script>
function toggleCheckbox() {
  const checkbox = event.currentTarget;
  const isChecked = checkbox.getAttribute('aria-checked') === 'true';

  // Toggle state
  checkbox.setAttribute('aria-checked', !isChecked);

  // Update visual
  checkbox.classList.toggle('checked');
}

function handleCheckboxKey(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    toggleCheckbox();
    event.preventDefault();
  }
}
</script>

<!-- ✅ Good: Tri-state checkbox (indeterminate) -->
<div
  role="checkbox"
  aria-checked="mixed"
  aria-label="Select all items"
  tabindex="0"
>
  <span class="checkbox-icon indeterminate"></span>
  Select all
</div>

<!-- ARIA-PRESSED: Toggle Button State -->

<!-- ✅ Good: Mute button with aria-pressed -->
<button
  aria-pressed="false"
  aria-label="Mute audio"
  onclick="toggleMute()"
>
  <span class="icon-volume-up"></span>
</button>

<script>
function toggleMute() {
  const button = event.currentTarget;
  const isMuted = button.getAttribute('aria-pressed') === 'true';

  // Toggle state
  button.setAttribute('aria-pressed', !isMuted);

  // Update visual icon
  const icon = button.querySelector('span');
  icon.className = isMuted ? 'icon-volume-up' : 'icon-volume-mute';

  // Update label
  button.setAttribute('aria-label', isMuted ? 'Mute audio' : 'Unmute audio');

  // Actual mute logic
  audioElement.muted = !isMuted;
}
</script>

<!-- ARIA-BUSY: Loading State -->

<!-- ✅ Good: Button with loading state -->
<button
  id="submit-btn"
  aria-busy="false"
  onclick="handleSubmit()"
>
  <span class="button-text">Submit</span>
  <span class="spinner" hidden aria-hidden="true">⏳</span>
</button>

<script>
async function handleSubmit() {
  const button = document.getElementById('submit-btn');

  // Set busy state
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.querySelector('.button-text').textContent = 'Submitting...';
  button.querySelector('.spinner').hidden = false;

  try {
    await submitForm();

    // Success
    button.setAttribute('aria-busy', 'false');
    button.querySelector('.button-text').textContent = 'Success!';
  } catch (error) {
    // Error
    button.setAttribute('aria-busy', 'false');
    button.disabled = false;
    button.querySelector('.button-text').textContent = 'Submit';
    alert('Error: ' + error.message);
  } finally {
    button.querySelector('.spinner').hidden = true;
  }
}
</script>

<!-- ARIA-INVALID: Form Validation State -->

<!-- ✅ Good: Input with validation state -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-hint email-error"
  onblur="validateEmail()"
>
<span id="email-hint">Enter a valid email address</span>
<span id="email-error" role="alert" hidden>
  Please enter a valid email format
</span>

<script>
function validateEmail() {
  const input = document.getElementById('email');
  const error = document.getElementById('email-error');
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);

  // Update aria-invalid state
  input.setAttribute('aria-invalid', !isValid);

  // Show/hide error
  error.hidden = isValid;

  // Visual feedback
  input.classList.toggle('invalid', !isValid);
}
</script>

<!-- REACT EXAMPLE: State Management in Component -->

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={index} className="accordion-item">
            <button
              aria-expanded={isOpen}
              aria-controls={`panel-${index}`}
              onClick={() => toggleItem(index)}
              className="accordion-trigger"
            >
              {item.title}
              <span aria-hidden="true">
                {isOpen ? '▼' : '▶'}
              </span>
            </button>

            <div
              id={`panel-${index}`}
              role="region"
              aria-labelledby={`trigger-${index}`}
              hidden={!isOpen}
              className="accordion-panel"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

<!-- REACT EXAMPLE: Disabled Button with Loading State -->

function SubmitButton({ onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-busy={isSubmitting}
      disabled={isSubmitting}
      className={isSubmitting ? 'submitting' : ''}
    >
      {isSubmitting ? (
        <>
          <span aria-hidden="true">⏳</span>
          Submitting...
        </>
      ) : (
        'Submit'
      )}
    </button>
  );
}
```

### Common Mistakes

❌ **Mistake:** aria-expanded without aria-controls
```html
<button aria-expanded="false">Menu</button>
<div id="menu" hidden>...</div>
```

✅ **Correct:** Link expanded state to controlled element
```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
<div id="menu" hidden>...</div>
```

❌ **Mistake:** Using aria-hidden on focusable elements
```html
<button aria-hidden="true">Click me</button>
<!-- Hidden from SR but still focusable - very confusing -->
```

✅ **Correct:** Use hidden attribute or remove from flow
```html
<button hidden>Click me</button>
```

---

<details>
<summary><strong>🔍 Deep Dive: ARIA State Update Timing and Screen Reader Announcements</strong></summary>

**Understanding State Update Propagation:**

When you update an ARIA state attribute, the following happens:

```
1. DOM mutation occurs (setAttribute)
   ↓
2. Browser updates accessibility tree (5-50ms delay)
   ↓
3. Accessibility API notifies screen reader (platform-dependent)
   ↓
4. Screen reader announces change (if in focus or live region)
```

**Critical Timing Considerations:**

```javascript
// ❌ Bad: State update after visual change (async)
function toggle() {
  const content = document.getElementById('content');
  content.hidden = false;  // Visual change

  // Browser may render before aria-expanded updates
  setTimeout(() => {
    button.setAttribute('aria-expanded', 'true');
  }, 100);
}

// ✅ Good: Synchronous state update
function toggle() {
  const button = event.currentTarget;
  const content = document.getElementById('content');

  // Update ARIA state FIRST or simultaneously
  button.setAttribute('aria-expanded', 'true');
  content.hidden = false;
}
```

**Why synchronous updates matter:**
- Screen readers read accessibility tree snapshot
- Async updates can cause mismatch between visual and announced state
- User navigates to element before state updates = wrong announcement

**Deep Dive: aria-expanded Behavior:**

aria-expanded has three valid values:
1. **"true"** - Element is expanded
2. **"false"** - Element is collapsed
3. **undefined** (attribute not present) - Element is not expandable

```html
<!-- State: Not expandable (no aria-expanded) -->
<button>Static Content</button>

<!-- State: Collapsed -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>

<!-- State: Expanded -->
<button aria-expanded="true" aria-controls="menu">
  Menu
</button>
```

**Screen reader announcements:**
- NVDA: "Menu, button, collapsed" or "Menu, button, expanded"
- JAWS: "Menu, button, collapsed" or "Menu, button, expanded"
- VoiceOver: "Menu, button, collapsed" or "Menu, expanded, button"

**aria-expanded with aria-controls:**

aria-controls creates a relationship:
```html
<button id="trigger" aria-expanded="false" aria-controls="panel">
  Show Details
</button>

<div id="panel" hidden>
  Details content
</div>
```

**What screen readers do:**
1. Announce "Show Details, button, collapsed"
2. Some screen readers (JAWS) allow jumping to controlled element
3. Keyboard shortcut: JAWS users can press Alt+Ctrl+Down to jump to panel

**Deep Dive: aria-hidden="true" Behavior:**

aria-hidden removes element and ALL descendants from accessibility tree:

```html
<div aria-hidden="true">
  <h1>Title</h1>  <!-- Hidden from SR -->
  <button>Click</button>  <!-- Hidden from SR, but still focusable! -->
</div>
```

**Critical gotcha:**
- aria-hidden does NOT remove from tab order
- Keyboard users can still tab to buttons inside aria-hidden container
- Screen reader announces nothing when focused → very confusing

**Correct pattern:**
```html
<!-- ✅ Good: Use hidden attribute for complete removal -->
<div hidden>
  <button>Click</button>  <!-- Not visible, not focusable, not in SR -->
</div>

<!-- ✅ Good: aria-hidden only for decorative non-interactive elements -->
<span aria-hidden="true">★★★★★</span>
<span class="sr-only">Rated 5 out of 5 stars</span>
```

**Deep Dive: aria-disabled vs disabled Attribute:**

**disabled attribute:**
- Removes from tab order (tabindex becomes -1)
- Prevents all mouse/keyboard events
- Applies :disabled CSS pseudo-class
- Form inputs excluded from form submission
- Native browser behavior

**aria-disabled="true":**
- Stays in tab order (still reachable via Tab)
- Does NOT prevent events (must use JavaScript)
- Does NOT apply :disabled pseudo-class
- Screen reader announces "disabled" but element still interactive

**Use cases:**

```javascript
// Use disabled when: Want to prevent interaction entirely
<button disabled>Submit</button>

// Use aria-disabled when: Want to keep in tab order for SR users to discover
<button
  aria-disabled="true"
  onClick={(e) => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      return;
    }
    // Normal logic
  }}
>
  Submit
</button>
```

**Why keep disabled elements in tab order?**

Accessibility best practice debate:
- **Pro:** SR users can discover why element is disabled (use aria-describedby)
- **Con:** Confusing to tab to element that doesn't work

**Modern consensus:** Use disabled for most cases; aria-disabled for complex UI where explanation is needed

**Deep Dive: aria-selected vs aria-checked:**

**aria-selected:**
- Used for: Tabs, listbox options, grid cells
- Indicates: Current selection in a set of options
- Multiple selections possible (multi-select listbox)

**aria-checked:**
- Used for: Checkboxes, radio buttons, switches
- Indicates: Checked/unchecked state
- Three values: "true", "false", "mixed" (indeterminate)

```html
<!-- aria-selected: Tab interface -->
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>

<!-- aria-checked: Checkbox -->
<div role="checkbox" aria-checked="false">
  I agree
</div>

<!-- aria-checked: Tri-state checkbox -->
<div role="checkbox" aria-checked="mixed">
  Select all (some items selected)
</div>
```

**Performance Impact of State Updates:**

```javascript
// Benchmark: 10,000 state updates

// setAttribute: 45ms
for (let i = 0; i < 10000; i++) {
  element.setAttribute('aria-expanded', 'true');
}

// Direct property (faster): 28ms
for (let i = 0; i < 10000; i++) {
  element.ariaExpanded = 'true';
}

// Dataset (slowest): 67ms
for (let i = 0; i < 10000; i++) {
  element.dataset.ariaExpanded = 'true';
}
```

**Recommendation:** Use setAttribute for consistency; performance difference negligible for <1000 updates

**State Update Batching in React:**

```jsx
// ❌ Bad: Multiple state updates (can cause announcement conflicts)
const [isExpanded, setIsExpanded] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const toggle = async () => {
  setIsExpanded(true);  // Update 1
  setIsLoading(true);   // Update 2

  await fetchData();

  setIsLoading(false);  // Update 3
};

// ✅ Good: Batch state updates
const [state, setState] = useState({ isExpanded: false, isLoading: false });

const toggle = async () => {
  setState({ isExpanded: true, isLoading: true });  // Single update

  await fetchData();

  setState(prev => ({ ...prev, isLoading: false }));
};
```

**React 18 Automatic Batching:**
- All state updates batched automatically
- Accessibility tree updated once per batch
- Reduces screen reader announcement spam

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Accordion State Sync Nightmare</strong></summary>

**The Bug:** An enterprise SaaS app's accordion component had desynchronized ARIA states, causing screen reader users to think sections were closed when they were actually open.

**Initial Broken Implementation:**

```jsx
// ❌ Bad: State management with timing issues
function BrokenAccordion({ items }) {
  const [openItems, setOpenItems] = useState([]);

  const toggle = (index) => {
    // Visual change happens immediately
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );

    // ARIA state updated in useEffect (next render cycle)
  };

  useEffect(() => {
    // This runs AFTER visual render
    // Screen reader sees stale state
    items.forEach((item, index) => {
      const button = document.getElementById(`accordion-btn-${index}`);
      button?.setAttribute('aria-expanded', openItems.includes(index));
    });
  }, [openItems, items]);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);

        return (
          <div key={index}>
            <button
              id={`accordion-btn-${index}`}
              onClick={() => toggle(index)}
            >
              {item.title}
            </button>

            <div style={{ display: isOpen ? 'block' : 'none' }}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Problems Discovered:**

**Issue 1: Stale ARIA State (Failed WCAG 4.1.2)**

```
User clicks accordion button
↓
Visual content expands (display: block)
↓
Screen reader reads aria-expanded="false" (stale!)
↓
User confused: "It says collapsed but content is visible"
```

**Metrics:**
- 8% of users (screen reader users) completely confused
- Support tickets: +120% ("accordion doesn't work with screen reader")
- Task completion time: +400% (3min vs 45sec for sighted)

**Issue 2: Focus Management Missing**

```jsx
// No focus restoration after toggle
const toggle = (index) => {
  setOpenItems(prev =>
    prev.includes(index)
      ? prev.filter(i => i !== index)
      : [...prev, index]
  );
  // Focus stays on button, but no announcement of content change
};
```

**Impact:**
- Screen reader users unaware content appeared
- No announcement when panel opens/closes
- Users navigate away thinking nothing happened

**Issue 3: Keyboard Navigation Broken**

```jsx
// No keyboard support for arrow keys
<button onClick={() => toggle(index)}>
  {item.title}
</button>
```

**Impact:**
- Users can't navigate accordion with arrow keys
- Only Tab key works (inefficient for 20+ items)

**Issue 4: Duplicate IDs (Failed WCAG 4.1.1)**

```jsx
// Bug: Same ID reused across multiple accordions
items.map((item, index) => (
  <button id={`accordion-btn-${index}`}>
    {/* If multiple accordions on page, IDs collide */}
  </button>
))
```

**Correct Implementation:**

```jsx
// ✅ Good: Fully accessible accordion with synchronized states
function AccessibleAccordion({ items, id }) {
  const [openIndex, setOpenIndex] = useState(null);
  const accordionId = useId(); // React 18 unique ID

  const toggle = (index) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    const buttons = document.querySelectorAll(`[data-accordion="${accordionId}"] button`);
    const currentIndex = Array.from(buttons).indexOf(e.target);

    if (e.key === 'ArrowDown') {
      const nextButton = buttons[currentIndex + 1] || buttons[0];
      nextButton.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const prevButton = buttons[currentIndex - 1] || buttons[buttons.length - 1];
      prevButton.focus();
      e.preventDefault();
    } else if (e.key === 'Home') {
      buttons[0].focus();
      e.preventDefault();
    } else if (e.key === 'End') {
      buttons[buttons.length - 1].focus();
      e.preventDefault();
    }
  };

  return (
    <div data-accordion={accordionId}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${accordionId}-btn-${index}`;
        const panelId = `${accordionId}-panel-${index}`;

        return (
          <div key={index} className="accordion-item">
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span>{item.title}</span>
              <span aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Key Fixes:**

1. **Synchronous ARIA updates:** aria-expanded set in render, not useEffect
2. **Unique IDs:** useId() ensures no collisions
3. **Keyboard navigation:** Arrow keys, Home, End support
4. **Proper roles:** role="region" for panels
5. **aria-controls linkage:** Button linked to panel

**Results After Fix:**

**Metrics:**
- Screen reader task completion: 18% → 94%
- Average time: 3min → 52sec
- Support tickets: -85%
- WCAG compliance: Failed → AA passed

**Additional Enhancement - Live Announcements:**

```jsx
// Optional: Announce panel state changes
function AccessibleAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const toggle = (index) => {
    const wasOpen = openIndex === index;
    setOpenIndex(wasOpen ? null : index);

    // Announce state change
    setAnnouncement(
      wasOpen
        ? `${items[index].title} panel collapsed`
        : `${items[index].title} panel expanded`
    );
  };

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Accordion items */}
    </>
  );
}
```

**Investigation Time:** 4 hours (screen reader testing + user feedback)
**Fix Time:** 3 hours (implementation + testing)
**Prevented Cost:** $30K/year (support + lost conversions)

</details>

<details>
<summary><strong>⚖️ Trade-offs: State Management Approaches</strong></summary>

**Decision Matrix:**

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Inline ARIA in JSX** | Always in sync | Verbose | React/Vue components |
| **useEffect updates** | Separate concerns | Can desync | Legacy codebases |
| **State machine library** | Robust, testable | Overkill for simple | Complex workflows |
| **Manual DOM updates** | Full control | Error-prone | Vanilla JS apps |

**disabled vs aria-disabled Trade-off:**

**Use disabled attribute:**
- ✅ Prevents interaction (no JS needed)
- ✅ Removes from tab order
- ✅ Native browser styling
- ❌ SR users can't discover why disabled

**Use aria-disabled="true":**
- ✅ Keeps in tab order (discoverable)
- ✅ Can add aria-describedby with reason
- ❌ Must prevent interaction with JS
- ❌ Must apply visual styling manually

**Decision framework:**
```
Is the reason for disabling important for users to know?
├─ NO → Use disabled attribute
└─ YES → Use aria-disabled + aria-describedby
```

**Example:**
```html
<!-- Use disabled: Simple cases -->
<button disabled>Submit</button>

<!-- Use aria-disabled: Complex cases -->
<button
  aria-disabled="true"
  aria-describedby="reason"
  onClick={(e) => {
    if (e.target.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
    }
  }}
>
  Submit
</button>
<span id="reason">
  Please fill in all required fields before submitting
</span>
```

**hidden vs aria-hidden Trade-off:**

**Use hidden attribute:**
- ✅ Removes from visual AND SR
- ✅ Removes from tab order
- ✅ display: none applied automatically
- Use when: Content should be completely hidden

**Use aria-hidden="true":**
- ✅ Hides only from SR (still visible)
- ❌ Doesn't remove from tab order
- Use when: Decorative visual elements

**Decision matrix:**
```
Should element be invisible to everyone?
├─ YES → Use hidden attribute
└─ NO (visual decoration) → Use aria-hidden
```

**Performance: State Update Frequency:**

```jsx
// ❌ Bad: Frequent unnecessary updates
<input
  onKeyUp={(e) => {
    // Fires on EVERY keystroke
    setAriaInvalid(!isValid(e.target.value));
  }}
/>

// ✅ Good: Update only when meaningful
<input
  onBlur={(e) => {
    // Fires only when user leaves field
    setAriaInvalid(!isValid(e.target.value));
  }}
/>
```

**State Management Libraries:**

**XState (State Machine):**
- Pros: Bulletproof state logic, prevents invalid states
- Cons: Steep learning curve, overkill for simple components
- Use when: Complex multi-step workflows (checkout, wizards)

**useState (React):**
- Pros: Simple, built-in, fast
- Cons: Can have race conditions
- Use when: Simple components (accordions, tabs)

**Zustand/Redux:**
- Pros: Global state, time-travel debugging
- Cons: Boilerplate, complexity
- Use when: State shared across many components

</details>

<details>
<summary><strong>💬 Explain to Junior: ARIA States as Traffic Lights</strong></summary>

**Analogy: Traffic Lights Change State**

Think of ARIA states like traffic lights:
- **Red** = closed/collapsed (aria-expanded="false")
- **Green** = open/expanded (aria-expanded="true")
- **Yellow** = loading (aria-busy="true")

When the light changes, everyone sees it immediately. Same with ARIA states - when you click a button, the state MUST update immediately so screen readers announce the new state.

**Common ARIA States You'll Use:**

**1. aria-expanded (accordion, dropdown, menu)**
```html
<button aria-expanded="false">Menu</button>
<!-- Screen reader says: "Menu, button, collapsed" -->

<button aria-expanded="true">Menu</button>
<!-- Screen reader says: "Menu, button, expanded" -->
```

**2. aria-hidden (hide decorative content)**
```html
<button aria-label="Delete">
  <span aria-hidden="true">🗑️</span>  <!-- Icon hidden from SR -->
  <span class="sr-only">Delete</span>  <!-- Text for SR only -->
</button>
```

**3. aria-disabled (disabled but discoverable)**
```html
<button aria-disabled="true" aria-describedby="reason">
  Submit
</button>
<span id="reason">Please fill in required fields</span>
```

**4. aria-invalid (form validation)**
```html
<input
  aria-invalid="false"  <!-- No error -->
  onBlur={() => {
    if (!isValid) input.setAttribute('aria-invalid', 'true');
  }}
>
```

**The Golden Rule: Visual = ARIA State**

```jsx
// ❌ Bad: Visual says open, ARIA says closed
<button aria-expanded="false">
  Menu
</button>
<div style={{ display: 'block' }}>
  <!-- Menu is visible but aria-expanded says false! -->
</div>

// ✅ Good: Visual matches ARIA
<button aria-expanded="true">
  Menu
</button>
<div style={{ display: 'block' }}>
  <!-- Menu is visible AND aria-expanded says true -->
</div>
```

**Interview Answer Template:**

"ARIA states communicate the current status of interactive elements to screen readers. The most common ones are aria-expanded for accordions and dropdowns, aria-hidden for decorative elements, aria-disabled for disabled states, and aria-invalid for form errors.

The key principle is keeping ARIA states synchronized with visual changes. When I toggle an accordion, I update aria-expanded at the same time as showing/hiding the content. I use aria-controls to link the button to the content it controls.

For disabled elements, I typically use the disabled attribute unless users need to discover WHY it's disabled - then I use aria-disabled='true' with aria-describedby pointing to an explanation.

I test with screen readers to ensure state changes are announced correctly. For example, when a form field fails validation, aria-invalid should change to 'true' and the error message should have role='alert' so it's announced immediately."

</details>

### Follow-up Questions

- "What's the difference between hidden and aria-hidden?"
- "When should you use aria-disabled instead of the disabled attribute?"
- "How do you handle aria-expanded for multi-level menus?"
- "What happens if aria-expanded and visual state don't match?"
- "How do screen readers announce aria-busy state changes?"
- "When should you use aria-pressed vs aria-checked?"

### Resources

- [ARIA States and Properties Spec](https://www.w3.org/TR/wai-aria-1.2/#states_and_properties)
- [MDN: ARIA States](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes)
- [W3C: Managing Focus](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

---

[← Back to Accessibility README](./README.md)

**Progress:** 2 of 4 new accessibility files with TIER 1 depth sections
