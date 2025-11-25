# Screen Readers and Assistive Technology

> ARIA attributes, screen reader testing, semantic HTML, and accessible patterns.

---

## Question 1: ARIA Roles and Attributes

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Airbnb

### Question
What are ARIA roles and when should you use them?

### Answer

**ARIA (Accessible Rich Internet Applications)** - Provides accessibility information to assistive technologies.

```html
<!-- ❌ Bad: Using div without semantics -->
<div onclick="toggleMenu()">Menu</div>

<!-- ✅ Better: Using button -->
<button onclick="toggleMenu()">Menu</button>

<!-- ✅ When needed: ARIA for custom widgets -->
<div
  role="button"
  tabindex="0"
  aria-label="Toggle menu"
  aria-expanded="false"
  onclick="toggleMenu()"
  onkeypress="handleKeyPress(event)"
>
  Menu
</div>

<!-- Common ARIA attributes -->
<button aria-label="Close dialog">×</button>
<input aria-describedby="password-hint" />
<div role="alert" aria-live="polite">Changes saved</div>
<nav aria-label="Main navigation">...</nav>
```

**Key Rules:**
1. First rule: Don't use ARIA (use semantic HTML)
2. Only use ARIA when semantic HTML isn't enough
3. Don't change native semantics

<details>
<summary><strong>🔍 Deep Dive: ARIA Architecture and Accessibility Tree Construction</strong></summary>

ARIA (Accessible Rich Internet Applications) works by modifying the accessibility tree that browsers construct from the DOM. Understanding how this tree is built and consumed by assistive technologies is essential for proper ARIA implementation.

**The Accessibility Tree:**

The browser maintains two parallel structures:

1. **DOM Tree** - The actual HTML structure
2. **Accessibility Tree** - A simplified version consumed by screen readers

```javascript
// Conceptual model of how browsers build the accessibility tree
class AccessibilityTreeBuilder {
  buildTree(domNode) {
    const accessibilityNode = {
      role: this.computeRole(domNode),
      name: this.computeAccessibleName(domNode),
      description: this.computeAccessibleDescription(domNode),
      state: this.computeState(domNode),
      properties: this.computeProperties(domNode),
      children: []
    };

    // Recursively build child nodes
    domNode.childNodes.forEach(child => {
      if (this.shouldIncludeInTree(child)) {
        accessibilityNode.children.push(this.buildTree(child));
      }
    });

    return accessibilityNode;
  }

  computeRole(element) {
    // Priority order:
    // 1. Explicit ARIA role
    if (element.hasAttribute('role')) {
      return element.getAttribute('role');
    }

    // 2. Implicit role from HTML semantics
    const implicitRoles = {
      'BUTTON': 'button',
      'A': element.hasAttribute('href') ? 'link' : 'generic',
      'NAV': 'navigation',
      'MAIN': 'main',
      'HEADER': 'banner',
      'FOOTER': 'contentinfo',
      'ASIDE': 'complementary',
      'INPUT': this.getInputRole(element),
      'IMG': 'img',
      'H1': 'heading',
      'H2': 'heading',
      // ... more mappings
    };

    return implicitRoles[element.tagName] || 'generic';
  }

  computeAccessibleName(element) {
    // Accessible name computation algorithm (simplified)
    // Priority order per ARIA spec:

    // 1. aria-labelledby (highest priority)
    if (element.hasAttribute('aria-labelledby')) {
      const ids = element.getAttribute('aria-labelledby').split(' ');
      return ids.map(id => {
        const referencedElement = document.getElementById(id);
        return referencedElement ? referencedElement.textContent : '';
      }).join(' ');
    }

    // 2. aria-label
    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }

    // 3. Native label associations
    if (element.tagName === 'INPUT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent;

      // Check if wrapped in label
      const parentLabel = element.closest('label');
      if (parentLabel) {
        return parentLabel.textContent.replace(element.value, '').trim();
      }
    }

    // 4. Alt text for images
    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') || '';
    }

    // 5. Text content (for buttons, links)
    if (['BUTTON', 'A'].includes(element.tagName)) {
      return element.textContent.trim();
    }

    // 6. title attribute (last resort)
    return element.getAttribute('title') || '';
  }

  computeAccessibleDescription(element) {
    // aria-describedby takes precedence
    if (element.hasAttribute('aria-describedby')) {
      const ids = element.getAttribute('aria-describedby').split(' ');
      return ids.map(id => {
        const referencedElement = document.getElementById(id);
        return referencedElement ? referencedElement.textContent : '';
      }).join(' ');
    }

    // Fallback to title if not already used for name
    if (!element.hasAttribute('aria-label') && element.hasAttribute('title')) {
      return element.getAttribute('title');
    }

    return '';
  }

  computeState(element) {
    return {
      disabled: element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true',
      checked: element.hasAttribute('checked') || element.getAttribute('aria-checked') === 'true',
      expanded: element.getAttribute('aria-expanded') === 'true',
      hidden: element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true',
      selected: element.getAttribute('aria-selected') === 'true',
      pressed: element.getAttribute('aria-pressed') === 'true',
      // ... more states
    };
  }

  shouldIncludeInTree(element) {
    // Elements hidden from accessibility tree:
    // 1. aria-hidden="true"
    if (element.getAttribute('aria-hidden') === 'true') return false;

    // 2. Hidden via CSS
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden') return false;

    // 3. Presentational roles
    if (['presentation', 'none'].includes(element.getAttribute('role'))) return false;

    return true;
  }
}
```

**ARIA Roles Deep Dive:**

ARIA defines 81 roles across six categories:

```javascript
// Role categories and their purposes
const ARIARoles = {
  // 1. Widget Roles (interactive components)
  widgets: {
    button: 'Clickable element that triggers action',
    checkbox: 'Checkable input with three states',
    gridcell: 'Cell in a grid or treegrid',
    link: 'Hyperlink reference',
    menuitem: 'Option in a menu',
    menuitemcheckbox: 'Checkable menuitem',
    menuitemradio: 'Radio menuitem in a group',
    option: 'Selectable item in a listbox',
    progressbar: 'Progress indicator',
    radio: 'Radio button',
    scrollbar: 'Scrollbar control',
    searchbox: 'Search input',
    slider: 'Range input',
    spinbutton: 'Number input with increment/decrement',
    switch: 'On/off toggle',
    tab: 'Tab in a tab list',
    tabpanel: 'Container for tab content',
    textbox: 'Text input',
    // ... more widget roles
  },

  // 2. Composite Roles (widgets that contain other widgets)
  composite: {
    combobox: 'Input with dropdown (autocomplete)',
    grid: 'Interactive table',
    listbox: 'List of selectable options',
    menu: 'Menu of choices',
    menubar: 'Horizontal menu',
    radiogroup: 'Group of radio buttons',
    tablist: 'List of tabs',
    tree: 'Hierarchical tree',
    treegrid: 'Tree with grid behavior',
  },

  // 3. Document Structure Roles (organize content)
  documentStructure: {
    article: 'Self-contained composition',
    definition: 'Definition of a term',
    directory: 'List of references',
    document: 'Document content',
    feed: 'Scrollable list of articles',
    figure: 'Perceivable content',
    group: 'Group of UI elements',
    heading: 'Heading for a section',
    img: 'Image container',
    list: 'List of items',
    listitem: 'Single item in a list',
    math: 'Mathematical expression',
    note: 'Parenthetic content',
    presentation: 'Removes semantics (DANGEROUS)',
    region: 'Significant content area',
    separator: 'Divider',
    table: 'Data table',
    toolbar: 'Collection of controls',
  },

  // 4. Landmark Roles (navigation regions)
  landmarks: {
    banner: 'Site header (use <header> instead)',
    complementary: 'Supporting content (use <aside>)',
    contentinfo: 'Footer (use <footer>)',
    form: 'Form region (use <form>)',
    main: 'Main content (use <main>)',
    navigation: 'Navigation links (use <nav>)',
    region: 'Important content area',
    search: 'Search functionality',
  },

  // 5. Live Region Roles (dynamic updates)
  liveRegions: {
    alert: 'Important, time-sensitive message',
    log: 'Sequential information log',
    marquee: 'Non-essential live updates',
    status: 'Advisory information',
    timer: 'Countdown or timer',
  },

  // 6. Window Roles (browser sub-windows)
  windows: {
    alertdialog: 'Modal alert requiring user response',
    dialog: 'Modal dialog',
  }
};

// Example implementations
const examples = {
  // ✅ Custom dropdown (requires ARIA)
  customDropdown: `
    <div role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-owns="country-listbox">
      <input type="text" aria-autocomplete="list" aria-controls="country-listbox" />
      <ul id="country-listbox" role="listbox">
        <li role="option">United States</li>
        <li role="option">Canada</li>
        <li role="option">Mexico</li>
      </ul>
    </div>
  `,

  // ✅ Custom tabs (requires ARIA)
  customTabs: `
    <div>
      <div role="tablist" aria-label="Settings">
        <button role="tab" aria-selected="true" aria-controls="panel-general">General</button>
        <button role="tab" aria-selected="false" aria-controls="panel-privacy">Privacy</button>
      </div>
      <div id="panel-general" role="tabpanel">General settings content</div>
      <div id="panel-privacy" role="tabpanel" hidden>Privacy settings content</div>
    </div>
  `,

  // ❌ DON'T DO THIS - changing native semantics
  badPractice: `
    <!-- ❌ BAD: Overriding button semantics -->
    <button role="heading">This is confusing</button>

    <!-- ✅ GOOD: Use correct element -->
    <h2>This is a heading</h2>
  `,
};
```

**ARIA States and Properties:**

```javascript
// States vs Properties distinction
const ARIAStatesAndProperties = {
  // States (change frequently during interaction)
  states: {
    'aria-busy': 'Element is loading (boolean)',
    'aria-checked': 'Checked state (true/false/mixed)',
    'aria-disabled': 'Disabled state (boolean)',
    'aria-expanded': 'Expanded state for collapsibles (boolean)',
    'aria-grabbed': 'Drag-and-drop grabbed state (deprecated)',
    'aria-hidden': 'Hidden from accessibility tree (boolean)',
    'aria-invalid': 'Validation error state (boolean/grammar/spelling)',
    'aria-pressed': 'Toggle button state (true/false/mixed)',
    'aria-selected': 'Selected state (boolean)',
  },

  // Properties (rarely change after initialization)
  properties: {
    'aria-atomic': 'Announce entire live region vs just changes (boolean)',
    'aria-autocomplete': 'Autocomplete behavior (list/inline/both/none)',
    'aria-controls': 'IDs of controlled elements (ID reference list)',
    'aria-describedby': 'IDs of description elements (ID reference list)',
    'aria-details': 'ID of detailed description (ID reference)',
    'aria-haspopup': 'Type of popup (menu/listbox/tree/grid/dialog/true/false)',
    'aria-label': 'Accessible name (string)',
    'aria-labelledby': 'IDs of labeling elements (ID reference list)',
    'aria-level': 'Hierarchical level (integer)',
    'aria-live': 'Live region politeness (off/polite/assertive)',
    'aria-modal': 'Modal behavior (boolean)',
    'aria-multiline': 'Multi-line input (boolean)',
    'aria-multiselectable': 'Multiple selection allowed (boolean)',
    'aria-orientation': 'Orientation (horizontal/vertical/undefined)',
    'aria-owns': 'IDs of owned elements (ID reference list)',
    'aria-placeholder': 'Placeholder text (string)',
    'aria-readonly': 'Read-only state (boolean)',
    'aria-required': 'Required field (boolean)',
    'aria-roledescription': 'Human-readable role (string)',
    'aria-valuemax': 'Maximum value (number)',
    'aria-valuemin': 'Minimum value (number)',
    'aria-valuenow': 'Current value (number)',
    'aria-valuetext': 'Human-readable value (string)',
  }
};

// Practical implementation examples
class AccessibleWidget {
  // Example: Accessible slider
  createSlider(min, max, value, label) {
    const slider = document.createElement('div');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', label);
    slider.setAttribute('aria-valuemin', min);
    slider.setAttribute('aria-valuemax', max);
    slider.setAttribute('aria-valuenow', value);
    slider.setAttribute('aria-valuetext', `${value} percent`);
    slider.setAttribute('tabindex', '0');

    // Update on arrow keys
    slider.addEventListener('keydown', (e) => {
      let newValue = parseInt(slider.getAttribute('aria-valuenow'));

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(newValue + 1, max);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(newValue - 1, min);
      } else {
        return;
      }

      slider.setAttribute('aria-valuenow', newValue);
      slider.setAttribute('aria-valuetext', `${newValue} percent`);

      // Announce change to screen readers
      this.announceChange(`Volume ${newValue}%`);
    });

    return slider;
  }

  // Example: Live region announcements
  announceChange(message) {
    // Create or reuse live region
    let liveRegion = document.getElementById('announcer');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'announcer';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only'; // Visually hidden
      document.body.appendChild(liveRegion);
    }

    // Update content (will be announced)
    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  // Example: Accessible modal dialog
  createModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'presentation');

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.setAttribute('aria-describedby', 'dialog-description');

    const titleElement = document.createElement('h2');
    titleElement.id = 'dialog-title';
    titleElement.textContent = title;

    const contentElement = document.createElement('div');
    contentElement.id = 'dialog-description';
    contentElement.textContent = content;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.setAttribute('aria-label', 'Close dialog');

    dialog.appendChild(titleElement);
    dialog.appendChild(contentElement);
    dialog.appendChild(closeButton);
    overlay.appendChild(dialog);

    return overlay;
  }
}
```

**Common ARIA Patterns:**

```javascript
// Pattern 1: Accordion
const accordionHTML = `
<div class="accordion">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="panel1"
      id="button1"
    >
      Section 1
    </button>
  </h3>
  <div id="panel1" role="region" aria-labelledby="button1" hidden>
    Content for section 1
  </div>

  <h3>
    <button
      aria-expanded="false"
      aria-controls="panel2"
      id="button2"
    >
      Section 2
    </button>
  </h3>
  <div id="panel2" role="region" aria-labelledby="button2" hidden>
    Content for section 2
  </div>
</div>
`;

// Pattern 2: Alert messages
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.setAttribute('role', 'alert'); // Assertive live region
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  document.body.appendChild(alert);

  // Screen reader will announce immediately
  // Remove after 5 seconds
  setTimeout(() => alert.remove(), 5000);
}

// Pattern 3: Loading states
function setLoadingState(element, isLoading) {
  element.setAttribute('aria-busy', isLoading.toString());

  if (isLoading) {
    // Announce loading started
    element.setAttribute('aria-label', 'Loading content, please wait');
  } else {
    // Announce loading complete
    element.removeAttribute('aria-label');
  }
}

// Pattern 4: Form validation
function showValidationError(input, errorMessage) {
  const errorId = `${input.id}-error`;
  let errorElement = document.getElementById(errorId);

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.setAttribute('role', 'alert'); // Announce error
    errorElement.className = 'error-message';
    input.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = errorMessage;

  // Mark input as invalid and associate with error
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
}

function clearValidationError(input) {
  const errorId = `${input.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.remove();
  }

  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}
```

Understanding the accessibility tree and ARIA's role in shaping it allows you to build truly accessible custom widgets that work seamlessly with assistive technologies.

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Banking App Screen Reader Inaccessibility (85% User Drop-off)</strong></summary>

**Company:** Major fintech platform (mobile banking app)
**Impact:** 85% of screen reader users abandoned account creation
**Time to Resolution:** 2 weeks
**Root Cause:** Poor ARIA implementation and missing semantic HTML

**The Problem:**

A mobile banking app's account creation flow had a catastrophic accessibility failure. Analytics revealed:

```
Metrics (May 2024):
- Overall account creation completion: 72%
- Screen reader users completion: 11% (85% drop-off!)
- Support calls from blind users: +450% MoM
- ADA compliance complaints: 12 formal complaints in 2 weeks
- Average time on form (screen readers): 18 minutes vs 3 minutes (sighted)
- Abandonment at address autocomplete: 94% (screen reader users)
```

The development team had attempted to add ARIA attributes but made critical mistakes that actually made the experience worse than having no ARIA at all.

**Initial Investigation - The Broken Code:**

```jsx
// ❌ PROBLEMATIC CODE - Multi-step form component
function AccountCreationForm() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  return (
    <div className="form-container">
      {/* ❌ ISSUE 1: No role, no aria-label, not announced as multi-step */}
      <div className="progress-bar">
        <div className="step">Step {step} of 4</div>
      </div>

      {step === 1 && (
        <div>
          {/* ❌ ISSUE 2: Using divs instead of semantic form */}
          <div className="form-group">
            <div className="label">Email Address</div>
            {/* ❌ ISSUE 3: No association between label and input */}
            <input type="email" name="email" placeholder="Enter email" />

            {/* ❌ ISSUE 4: Error not announced to screen readers */}
            {errors.email && (
              <div className="error-text" style={{ color: 'red' }}>
                {errors.email}
              </div>
            )}
          </div>

          {/* ❌ ISSUE 5: Custom autocomplete with no ARIA */}
          <div className="autocomplete-container">
            <div className="label">Address</div>
            <input
              type="text"
              onChange={handleAddressSearch}
              placeholder="Start typing address..."
            />

            {/* ❌ ISSUE 6: Dropdown not accessible */}
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectAddress(suggestion)}
                  >
                    {suggestion.formatted_address}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ❌ ISSUE 7: Password strength indicator not accessible */}
          <div className="form-group">
            <div className="label">Password</div>
            <input type="password" name="password" />
            <div className="strength-meter">
              <div
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${passwordStrength * 25}%` }}
              />
            </div>
          </div>

          {/* ❌ ISSUE 8: Button state changes not announced */}
          <button
            onClick={handleNext}
            disabled={isValidating}
            className={isValidating ? 'loading' : ''}
          >
            {isValidating ? 'Validating...' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
```

**Specific Issues Identified via Screen Reader Testing (NVDA):**

1. **Multi-step form not announced** - Screen reader users didn't know it was step 1 of 4
2. **No label associations** - Screen reader couldn't identify what each input was for
3. **Errors not announced** - Validation errors appeared visually but weren't announced
4. **Autocomplete inaccessible** - Dropdown suggestions were invisible to screen readers
5. **No keyboard navigation for suggestions** - Couldn't select suggestions with keyboard
6. **Password strength visual only** - Color-coded bar with no text alternative
7. **Loading states not announced** - "Validating..." spinner was silent
8. **No focus management** - Focus didn't move to error fields

**Debugging Process:**

```javascript
// Step 1: Accessibility tree audit
function auditAccessibilityTree() {
  const inputs = document.querySelectorAll('input');

  inputs.forEach(input => {
    const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                     input.closest('label') ||
                     input.hasAttribute('aria-label') ||
                     input.hasAttribute('aria-labelledby');

    const hasDescription = input.hasAttribute('aria-describedby');

    const computedRole = input.getAttribute('role') ||
                         (input.tagName === 'INPUT' ? input.type : input.tagName.toLowerCase());

    console.log({
      element: input,
      id: input.id || 'NO ID',
      hasLabel: hasLabel,
      hasDescription: hasDescription,
      role: computedRole,
      ariaInvalid: input.getAttribute('aria-invalid'),
      ariaRequired: input.getAttribute('aria-required'),
      accessibleName: getAccessibleName(input) || 'NO NAME - PROBLEM!'
    });
  });
}

function getAccessibleName(element) {
  // Simplified accessible name computation
  if (element.hasAttribute('aria-labelledby')) {
    const ids = element.getAttribute('aria-labelledby').split(' ');
    return ids.map(id => document.getElementById(id)?.textContent).join(' ');
  }

  if (element.hasAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }

  const label = document.querySelector(`label[for="${element.id}"]`);
  if (label) return label.textContent;

  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent;

  return null;
}

// Step 2: Test with actual screen reader
// Manual testing with NVDA revealed:
// - "Button" announced without context
// - "Edit, has autocomplete" but no list announced
// - Errors appeared but weren't read
// - Progress indicator completely silent
```

**The Solution - Fully Accessible Implementation:**

```jsx
import { useEffect, useRef, useState } from 'react';

function AccessibleAccountCreationForm() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const errorRefs = useRef({});
  const liveRegionRef = useRef(null);

  // Announce to screen readers
  const announce = (message, priority = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
      liveRegionRef.current.setAttribute('aria-live', priority);
    }
  };

  // Focus first error when validation fails
  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && errorRefs.current[firstErrorKey]) {
      errorRefs.current[firstErrorKey].focus();
    }
  }, [errors]);

  const handleNext = async () => {
    setIsValidating(true);
    announce('Validating your information, please wait', 'assertive');

    // Validation logic...
    const newErrors = await validateStep(step);

    setIsValidating(false);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      announce(`Validation failed. ${Object.keys(newErrors).length} errors found.`, 'assertive');
    } else {
      setStep(step + 1);
      announce(`Step ${step + 1} of 4`, 'polite');
    }
  };

  return (
    <div className="form-container">
      {/* ✅ Screen reader-only live region for announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* ✅ Accessible progress indicator */}
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-label={`Account creation progress: step ${step} of 4`}
        className="progress-bar"
      >
        <div className="step" aria-hidden="true">
          Step {step} of 4
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {/* ✅ Properly labeled input with error announcement */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address
              <span className="required" aria-label="required">*</span>
            </label>

            <input
              ref={el => errorRefs.current.email = el}
              id="email"
              type="email"
              name="email"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />

            {/* ✅ Error announced with role="alert" */}
            {errors.email && (
              <div id="email-error" role="alert" className="error-text">
                {errors.email}
              </div>
            )}
          </div>

          {/* ✅ Accessible autocomplete combobox */}
          <div className="form-group">
            <label htmlFor="address">Address</label>

            <input
              id="address"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls="address-listbox"
              aria-activedescendant={
                selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
              }
              onChange={handleAddressSearch}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex(Math.min(selectedIndex + 1, suggestions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex(Math.max(selectedIndex - 1, -1));
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                  e.preventDefault();
                  selectAddress(suggestions[selectedIndex]);
                }
              }}
            />

            {/* ✅ Accessible suggestions listbox */}
            {suggestions.length > 0 && (
              <ul
                id="address-listbox"
                role="listbox"
                aria-label="Address suggestions"
                className="suggestions"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => selectAddress(suggestion)}
                    className={index === selectedIndex ? 'selected' : ''}
                  >
                    {suggestion.formatted_address}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ Password with accessible strength indicator */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              aria-describedby="password-strength password-requirements"
            />

            {/* ✅ Text-based strength indicator */}
            <div
              id="password-strength"
              role="status"
              aria-live="polite"
              className="strength-meter"
            >
              <div
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${passwordStrength * 25}%` }}
                aria-hidden="true"
              />
              <span className="sr-only">
                Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
              </span>
            </div>

            <div id="password-requirements" className="requirements">
              Must contain at least 8 characters, one uppercase, one number, and one special character
            </div>
          </div>

          {/* ✅ Button with loading state announced */}
          <button
            type="submit"
            disabled={isValidating}
            aria-busy={isValidating}
            aria-label={isValidating ? 'Validating your information, please wait' : 'Continue to next step'}
          >
            {isValidating ? 'Validating...' : 'Next'}
          </button>
        </form>
      )}
    </div>
  );
}
```

**Additional Accessibility Enhancements:**

```css
/* Screen reader only class (visually hidden but announced) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Ensure focus indicators are visible */
*:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* Error styling with sufficient contrast */
.error-text {
  color: #c00;
  font-weight: 600;
}
```

**Results After Fix:**

```
Metrics (June 2024 - 3 weeks after deployment):
- Screen reader users completion: 67% (+56% improvement!)
- Support calls from blind users: -92% reduction
- ADA compliance complaints: 0 new complaints
- Average time on form (screen readers): 4:30 minutes (-75% improvement)
- Abandonment at address autocomplete: 12% (-82% improvement)
- Positive feedback from accessibility community: 34 emails/tweets
- Industry accessibility award nomination
```

**Key Lessons:**

1. **Test with actual screen readers** - Automated tools catch ~30% of issues
2. **Semantic HTML first, ARIA second** - Use `<label>`, `<button>`, `<form>` before ARIA
3. **Every input needs an accessible name** - Via label, aria-label, or aria-labelledby
4. **Errors must be announced** - Use `role="alert"` or `aria-live`
5. **Custom widgets need full ARIA** - Autocomplete, tabs, sliders require proper roles/states
6. **Visual-only indicators fail** - Color-coded meters need text alternatives
7. **Loading states must be announced** - Use `aria-busy` and `aria-live`
8. **Focus management is critical** - Move focus to errors, first fields in steps

</details>

<details>
<summary><strong>⚖️ Trade-offs: ARIA Implementation Strategies and Maintenance Burden</strong></summary>

When implementing ARIA, different approaches present trade-offs between semantic correctness, development effort, and long-term maintainability.

**1. Semantic HTML vs. ARIA Roles**

```html
<!-- ❌ Approach A: DIVs with ARIA (high maintenance) -->
<div role="navigation" aria-label="Main navigation">
  <div role="list">
    <div role="listitem">
      <div role="link" tabindex="0" onclick="navigate('/home')">Home</div>
    </div>
    <div role="listitem">
      <div role="link" tabindex="0" onclick="navigate('/about')">About</div>
    </div>
  </div>
</div>

<!-- ✅ Approach B: Semantic HTML (low maintenance) -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

| Aspect | Semantic HTML | DIVs + ARIA |
|--------|--------------|-------------|
| **Browser Support** | Universal | Varies by AT version |
| **Keyboard Behavior** | Built-in | Manual implementation |
| **Default Styling** | Browser defaults | Custom CSS required |
| **Screen Reader Support** | Consistent | Can vary |
| **Development Time** | Minutes | Hours |
| **Maintenance** | Low | High (ARIA version updates) |
| **Bundle Size** | Minimal | +JavaScript for behavior |
| **SEO Impact** | Positive | Neutral |
| **Code Readability** | High | Low |

**Recommendation:** Use semantic HTML for 95% of cases. Only use ARIA roles when creating custom widgets not covered by HTML (e.g., tree view, carousel, autocomplete).

**2. aria-label vs. aria-labelledby**

```html
<!-- Approach A: aria-label (inline) -->
<button aria-label="Close dialog">×</button>

<!-- Approach B: aria-labelledby (reference) -->
<h2 id="dialog-title">Confirm deletion</h2>
<button aria-labelledby="dialog-title close-text">
  <span id="close-text" class="sr-only">Close</span>
  ×
</button>
```

| Aspect | aria-label | aria-labelledby |
|--------|-----------|----------------|
| **Localization** | Hard (scattered in code) | Easier (centralized text) |
| **DRY Principle** | Violates (duplicates content) | Follows (references existing) |
| **Dynamic Content** | Requires JS update | Auto-updates with referenced element |
| **Visibility** | Hidden from QA/testing | Visible (can use .sr-only) |
| **Override Behavior** | Completely replaces | Concatenates multiple references |
| **Implementation** | Simpler | Slightly more complex (IDs needed) |

**Recommendation:**
- Use `aria-label` for simple, static labels (close buttons, icons)
- Use `aria-labelledby` when referencing existing visible text or needing concatenation

**3. Live Regions: Polite vs. Assertive**

```html
<!-- Approach A: Polite (waits for pause) -->
<div aria-live="polite" role="status">
  Item added to cart
</div>

<!-- Approach B: Assertive (interrupts immediately) -->
<div aria-live="assertive" role="alert">
  Payment failed! Please try again.
</div>
```

| Aspect | aria-live="polite" | aria-live="assertive" |
|--------|-------------------|---------------------|
| **Interruption** | Waits for pause | Interrupts immediately |
| **User Experience** | Less disruptive | Can be jarring |
| **Use Cases** | Status updates, notifications | Errors, critical alerts |
| **Announcement Order** | May queue | Immediate |
| **User Annoyance** | Low | High if overused |

**Recommendation:**
- **Polite** for: Form validation success, loading complete, items added to cart
- **Assertive** for: Payment errors, session timeouts, security alerts
- **Never** use assertive for routine updates (e.g., typing character count)

**4. Form Validation: Inline vs. Summary**

```html
<!-- Approach A: Inline errors (announce each error) -->
<form>
  <label for="email">Email</label>
  <input id="email" aria-describedby="email-error" aria-invalid="true" />
  <div id="email-error" role="alert">Email is required</div>

  <label for="password">Password</label>
  <input id="password" aria-describedby="password-error" aria-invalid="true" />
  <div id="password-error" role="alert">Password must be 8+ characters</div>
</form>

<!-- Approach B: Error summary (announce once) -->
<div role="alert" aria-live="assertive">
  <h2>Form has 2 errors:</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password must be 8+ characters</a></li>
  </ul>
</div>

<form aria-describedby="form-errors">
  <label for="email">Email</label>
  <input id="email" aria-invalid="true" />

  <label for="password">Password</label>
  <input id="password" aria-invalid="true" />
</form>
```

| Aspect | Inline Errors | Error Summary |
|--------|--------------|--------------|
| **Announcement** | Multiple (one per field) | Single (all errors) |
| **User Overwhelm** | Can be verbose | Concise overview |
| **Navigation** | Errors at each field | Jump links to errors |
| **Long Forms** | Excellent (contextual) | Good (overview first) |
| **Short Forms** | Good | Overkill |
| **Implementation** | Simple | More complex |
| **WCAG Compliance** | Meets AA | Exceeds AA (best practice) |

**Recommendation:**
- **Short forms (1-5 fields):** Inline errors only
- **Long forms (6+ fields):** Error summary + inline errors
- **Multi-step forms:** Inline errors per step

**5. Loading States: aria-busy vs. aria-live**

```jsx
// Approach A: aria-busy (on loading element)
<button aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Approach B: aria-live (separate announcement)
<>
  <button>{isLoading ? 'Loading...' : 'Submit'}</button>
  <div aria-live="polite" aria-atomic="true">
    {isLoading && 'Submitting your form, please wait'}
  </div>
</>

// Approach C: Both (most comprehensive)
<>
  <button aria-busy={isLoading} aria-label={isLoading ? 'Submitting, please wait' : 'Submit form'}>
    {isLoading ? 'Loading...' : 'Submit'}
  </button>
  <div role="status" aria-live="polite" className="sr-only">
    {isLoading && 'Submitting your form, please wait'}
  </div>
</>
```

| Aspect | aria-busy Only | aria-live Only | Both |
|--------|---------------|---------------|------|
| **Announcement Quality** | Generic ("busy") | Descriptive message | Best (both contexts) |
| **Screen Reader Support** | Inconsistent | Good | Excellent |
| **Implementation** | Simple | Simple | Slightly more complex |
| **User Experience** | Basic | Good | Optimal |
| **Maintenance** | Low | Low | Medium |

**Recommendation:** Use both for critical operations (form submit, checkout), aria-busy alone for minor operations (search suggestions).

**6. Custom Widget Complexity: Build vs. Library**

```jsx
// Approach A: Build custom accessible widget
function CustomDatePicker({ value, onChange }) {
  // 200+ lines of ARIA implementation
  // role="dialog", aria-labelledby, keyboard navigation,
  // focus management, aria-selected, aria-activedescendant...
}

// Approach B: Use accessible library
import { DatePicker } from '@accessible-ui/datepicker';

function MyDatePicker({ value, onChange }) {
  return <DatePicker value={value} onChange={onChange} />;
}
```

| Aspect | Build Custom | Use Library |
|--------|-------------|------------|
| **Development Time** | Weeks | Minutes |
| **Bundle Size** | Custom (optimized) | +15-50KB typically |
| **Accessibility Compliance** | Requires expertise | Pre-tested |
| **Customization** | Full control | Limited by library API |
| **Maintenance** | Ongoing | Library updates |
| **Testing Burden** | High (all edge cases) | Low (library tested) |
| **ARIA Accuracy** | Risk of mistakes | Battle-tested |
| **Screen Reader Support** | Must test all AT | Usually comprehensive |

**Common widgets to use libraries for:**
- Date pickers
- Autocomplete/combobox
- Rich text editors
- Data grids
- Drag-and-drop
- Complex tabs/accordions

**Common widgets safe to build:**
- Simple modals
- Tooltips
- Dropdowns
- Toggle buttons
- Simple accordions

**Recommendation:** Use libraries for complex widgets. Build simple widgets yourself with proper ARIA.

**Decision Matrix:**

```
Simple Website (Blog, Portfolio):
- Semantic HTML everywhere ✅
- Minimal ARIA (just aria-label for icons) ✅
- No custom widgets ✅
- Standard form validation ✅

E-commerce Site:
- Semantic HTML + ARIA where needed ✅
- Library for: date picker, autocomplete ✅
- Custom: modals, dropdowns (simple) ✅
- Error summary + inline errors ✅
- Loading states with aria-busy + aria-live ✅

Complex SaaS Application:
- Semantic HTML foundation ✅
- Libraries for: grid, editor, complex forms ✅
- Custom: app-specific widgets with full ARIA ✅
- Comprehensive live regions ✅
- Focus management throughout ✅
- Regular screen reader testing ✅
```

**The Golden Rule:** Start with semantic HTML. Add ARIA only when necessary. Test with actual screen readers. Use libraries for complex widgets.

</details>

<details>
<summary><strong>💬 Explain to Junior: ARIA Like Adding Subtitles to a Silent Movie</strong></summary>

**The Movie Theater Analogy:**

Imagine you're watching a silent movie. You can see what's happening, but there's no sound. Now imagine someone who can't see the screen at all - they need someone to describe what's happening. That's what ARIA does for websites!

- **Visual users** = Watching the movie with their eyes
- **Screen reader users** = Listening to someone describe the movie
- **ARIA** = The descriptive narration that makes the movie make sense

**Why This Matters:**

```
Who uses screen readers?
- Blind users (completely unable to see)
- Low vision users (can see a bit, but use screen reader for efficiency)
- Dyslexic users (reading text aloud helps comprehension)
- Learning disabilities (audio + visual = better understanding)
- Temporary situations (eyes tired, multitasking)

In the US: ~7 million people use screen readers
Globally: ~250 million people with vision impairment
```

That's why we need to make sure our websites "talk" properly!

**The Three Golden Rules of ARIA:**

**Rule #1: Don't Use ARIA (Use Regular HTML First!)**

This sounds backwards, but it's the MOST important rule:

```html
<!-- ❌ BAD: Using ARIA when you don't need it -->
<div role="button" tabindex="0" onclick="handleClick()">
  Click me
</div>

<!-- ✅ GOOD: Just use a button! -->
<button onclick="handleClick()">
  Click me
</button>
```

**Why?** Regular HTML elements (like `<button>`, `<nav>`, `<header>`) already have screen reader support built in! Using ARIA when you don't need it is like wearing a raincoat indoors - unnecessary and makes things more complicated.

**When DO you need ARIA?** Only when building something that doesn't exist in HTML:

```html
<!-- ✅ ARIA needed: Custom tab widget (not in HTML) -->
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>

<!-- ✅ ARIA needed: Loading spinner (needs announcement) -->
<div role="status" aria-live="polite">
  Loading your results...
</div>
```

**Rule #2: Only Add ARIA for Things Screen Readers Need to Know**

Think about what information a blind person would need:

```jsx
// ✅ GOOD: Icon button needs a label (icon is just a picture)
<button aria-label="Close dialog">
  ×  {/* Screen reader can't "see" this X symbol */}
</button>

// ✅ GOOD: Loading state needs announcement
<button aria-busy={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// ✅ GOOD: Error needs to be announced immediately
<div role="alert">
  Email is required
</div>
```

**Rule #3: Never Break Native Semantics**

Don't use ARIA to change what an element is:

```html
<!-- ❌ BAD: Making a button pretend to be a heading (confusing!) -->
<button role="heading">This is wrong</button>

<!-- ✅ GOOD: Use the right element -->
<h2>This is a heading</h2>
<button>This is a button</button>
```

**Common Real-World Scenarios:**

**Scenario 1: Form Fields (The "Name Tag" Pattern)**

Every input needs a name tag so screen readers know what it is:

```html
<!-- ❌ BAD: No name tag - screen reader says "edit text" (what text??) -->
<input type="text" placeholder="Enter email" />

<!-- ✅ GOOD: Proper label (name tag) -->
<label for="email">Email Address</label>
<input id="email" type="text" />

<!-- ✅ ALSO GOOD: Using aria-label when visual label isn't needed -->
<input type="text" aria-label="Email address" />
```

**The Restaurant Order Analogy:**

Imagine ordering food without labels on the form fields:
- Server: "What do you want in box 1?"
- You: "Umm... what's box 1 for?"

That's what forms without labels feel like to screen reader users!

**Scenario 2: Error Messages (The "Alarm" Pattern)**

When something goes wrong, screen readers need to announce it immediately:

```jsx
// ❌ BAD: Error appears visually but screen reader user doesn't know
<div className="error-text">
  Password is too short
</div>

// ✅ GOOD: Error announced immediately with role="alert"
<div role="alert" className="error-text">
  Password is too short
</div>

// ✅ EVEN BETTER: Also link error to input
<label htmlFor="password">Password</label>
<input
  id="password"
  aria-describedby="password-error"
  aria-invalid="true"
/>
<div id="password-error" role="alert">
  Password must be at least 8 characters
</div>
```

**The Fire Alarm Analogy:**

`role="alert"` is like a fire alarm - it interrupts whatever the screen reader is doing and announces the message immediately. Use it for important stuff like errors, not for routine updates!

**Scenario 3: Loading States (The "Please Wait" Pattern)**

When something is loading, screen reader users need to know:

```jsx
// ❌ BAD: Visual spinner, no announcement
<button>
  {isLoading ? <Spinner /> : 'Submit'}
</button>

// ✅ GOOD: Announce loading state
<button aria-busy={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>

// ✅ EVEN BETTER: Separate announcement region
<button aria-busy={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
<div role="status" aria-live="polite" className="sr-only">
  {isLoading && 'Submitting your form, please wait'}
</div>
```

**Scenario 4: Custom Dropdowns (The "Menu" Pattern)**

When building autocomplete/search suggestions:

```html
<!-- ❌ BAD: DIVs that screen readers don't understand -->
<input type="text" />
<div class="suggestions">
  <div onclick="select('Option 1')">Option 1</div>
  <div onclick="select('Option 2')">Option 2</div>
</div>

<!-- ✅ GOOD: Proper ARIA combobox pattern -->
<input
  type="text"
  role="combobox"
  aria-expanded="true"
  aria-controls="suggestions-list"
  aria-autocomplete="list"
/>
<ul id="suggestions-list" role="listbox">
  <li role="option">Option 1</li>
  <li role="option">Option 2</li>
</ul>
```

**The Voice Assistant Analogy:**

You know how Siri/Alexa announces search results? That's what the combobox pattern does for screen readers - it says "Hey, I found 5 suggestions, use arrow keys to explore them."

**Quick Testing Tips:**

**1. The "Close Your Eyes" Test:**

Close your eyes and have someone read the page to you:
- Can you understand what each button does?
- Do you know what to type in each input?
- Are errors announced when they appear?
- Do you know when things are loading?

If any answer is "no" - you need more ARIA!

**2. The "Tab Key" Test:**

Press Tab through your page:
- Does every interactive thing get focus?
- Can you see where you are (focus indicator)?
- Is the order logical?

**3. The "Screen Reader" Test (NVDA - free!):**

Download NVDA (free screen reader for Windows):
1. Install NVDA
2. Press Insert + Down Arrow (starts reading)
3. Listen - does it make sense?

**Common Mistakes to Avoid:**

```html
<!-- ❌ MISTAKE 1: Hiding important content from screen readers -->
<button aria-hidden="true">Submit</button>  <!-- Screen reader can't find this! -->

<!-- ❌ MISTAKE 2: Using placeholder as label (placeholder disappears when typing) -->
<input type="text" placeholder="Email" />  <!-- No permanent label! -->

<!-- ❌ MISTAKE 3: Icons without labels -->
<button><i class="icon-delete"></i></button>  <!-- Says "button" - button for what? -->

<!-- ✅ FIX: Add aria-label -->
<button aria-label="Delete item"><i class="icon-delete"></i></button>

<!-- ❌ MISTAKE 4: Using color alone for meaning -->
<span style="color: red;">Error</span>  <!-- Color-blind and blind users miss this -->

<!-- ✅ FIX: Add role="alert" and descriptive text -->
<span role="alert">Error: Email is required</span>
```

**Quick Wins for Your Next Project:**

1. **Use proper HTML** - `<button>`, `<nav>`, `<main>`, `<header>` instead of DIVs
2. **Label everything** - Every input needs a `<label>` or `aria-label`
3. **Announce errors** - Use `role="alert"` for validation messages
4. **Loading states** - Use `aria-busy` when things are loading
5. **Icon buttons** - Always have `aria-label`

**Interview Answer Template:**

"ARIA stands for Accessible Rich Internet Applications. It's a set of attributes we add to HTML to make dynamic content and custom widgets accessible to screen readers.

The three key rules are:
1. **Don't use ARIA** - Use semantic HTML first (button, nav, header)
2. **Only add ARIA when necessary** - For custom widgets or dynamic updates
3. **Never break native semantics** - Don't change what elements are

Common ARIA attributes I use:
- `role="alert"` for error announcements
- `aria-label` for icon buttons without text
- `aria-busy` for loading states
- `aria-live` for dynamic content updates
- `role="dialog"` and `aria-modal` for modals

I test my implementations with screen readers like NVDA to ensure they work properly."

**Remember:** ARIA is powerful but easy to misuse. When in doubt, use regular HTML elements. They're accessible by default!

</details>

### Resources
- [WAI-ARIA Basics](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics)

---

