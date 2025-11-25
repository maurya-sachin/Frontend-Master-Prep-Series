# Form Accessibility

> **Focus**: Accessible form design with proper labels, fieldsets, and error handling

---

## Question 1: How do you make forms accessible with proper labels and fieldsets?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Microsoft, Amazon, Apple, Salesforce

### Question
Explain best practices for creating accessible forms, including proper labeling, fieldset usage, and error message handling.

### Answer

**Accessible forms** ensure all users can understand and complete forms, regardless of ability or assistive technology used.

**Core Principles:**

1. **Every input must have a label** - Screen readers need labels to announce what each field is for
2. **Use semantic HTML** - `<label>`, `<fieldset>`, `<legend>` provide structure
3. **Provide clear error messages** - Users need to know what went wrong and how to fix it
4. **Keyboard accessible** - All form controls must be reachable and usable with keyboard alone

### Code Example

**Proper Label Association:**

```html
<!-- ❌ BAD: No label -->
<input type="text" placeholder="Enter your name">
<!-- Screen reader: "edit, blank" (user doesn't know what field is for!) -->

<!-- ❌ BAD: Label not associated -->
<label>Name</label>
<input type="text">
<!-- Label and input are not connected programmatically -->

<!-- ✅ GOOD: Explicit label association (recommended) -->
<label for="userName">Name</label>
<input type="text" id="userName" name="userName">
<!-- Screen reader: "Name, edit, blank" -->
<!-- User knows this field is for their name -->

<!-- ✅ GOOD: Implicit label association (wrapping) -->
<label>
  Name
  <input type="text" name="userName">
</label>
<!-- Also works, but explicit (for/id) is more flexible -->

<!-- ✅ GOOD: Multiple inputs with distinct labels -->
<label for="firstName">First Name</label>
<input type="text" id="firstName" name="firstName">

<label for="lastName">Last Name</label>
<input type="text" id="lastName" name="lastName">
```

**Fieldset and Legend (Grouping Related Fields):**

```html
<!-- ❌ BAD: No grouping for related fields -->
<h3>Shipping Address</h3>
<label for="shipStreet">Street</label>
<input type="text" id="shipStreet">

<label for="shipCity">City</label>
<input type="text" id="shipCity">

<h3>Billing Address</h3>
<label for="billStreet">Street</label>
<input type="text" id="billStreet">
<!-- Screen reader doesn't know these are grouped as "shipping" vs "billing" -->

<!-- ✅ GOOD: Use fieldset/legend for grouping -->
<fieldset>
  <legend>Shipping Address</legend>

  <label for="shipStreet">Street</label>
  <input type="text" id="shipStreet" name="shipStreet">

  <label for="shipCity">City</label>
  <input type="text" id="shipCity" name="shipCity">

  <label for="shipZip">Zip Code</label>
  <input type="text" id="shipZip" name="shipZip">
</fieldset>

<fieldset>
  <legend>Billing Address</legend>

  <label for="billStreet">Street</label>
  <input type="text" id="billStreet" name="billStreet">

  <label for="billCity">City</label>
  <input type="text" id="billCity" name="billCity">

  <label for="billZip">Zip Code</label>
  <input type="text" id="billZip" name="billZip">
</fieldset>
<!-- Screen reader announces: "Shipping Address, group, Street, edit, blank..." -->
<!-- User knows "Street" belongs to "Shipping Address" -->
```

**Radio Buttons and Checkboxes:**

```html
<!-- ❌ BAD: Radio buttons without fieldset/legend -->
<label><input type="radio" name="size" value="S"> Small</label>
<label><input type="radio" name="size" value="M"> Medium</label>
<label><input type="radio" name="size" value="L"> Large</label>
<!-- Screen reader: "Small, radio button, unchecked" -->
<!-- User doesn't know these are for "Size" selection -->

<!-- ✅ GOOD: Radio buttons with fieldset/legend -->
<fieldset>
  <legend>Select Size</legend>

  <label>
    <input type="radio" name="size" value="S" id="sizeS">
    Small
  </label>

  <label>
    <input type="radio" name="size" value="M" id="sizeM">
    Medium
  </label>

  <label>
    <input type="radio" name="size" value="L" id="sizeL">
    Large
  </label>
</fieldset>
<!-- Screen reader: "Select Size, group, Small, radio button, unchecked, 1 of 3" -->

<!-- ✅ GOOD: Checkboxes for multiple selections -->
<fieldset>
  <legend>Select Features</legend>

  <label>
    <input type="checkbox" name="features" value="wifi" id="featureWifi">
    WiFi
  </label>

  <label>
    <input type="checkbox" name="features" value="parking" id="featureParking">
    Parking
  </label>

  <label>
    <input type="checkbox" name="features" value="pool" id="featurePool">
    Pool
  </label>
</fieldset>
```

**Required Fields:**

```html
<!-- ❌ BAD: Visual-only indicator (asterisk) -->
<label for="email">Email *</label>
<input type="email" id="email" required>
<!-- Asterisk is visual only - screen reader doesn't announce "required" -->

<!-- ✅ GOOD: Use required attribute + visible text -->
<label for="email">
  Email <span aria-label="required">*</span>
</label>
<input type="email" id="email" name="email" required>
<!-- Screen reader: "Email, required, edit, blank" -->

<!-- ✅ BETTER: Explicit text + aria-required -->
<label for="email">Email (required)</label>
<input
  type="email"
  id="email"
  name="email"
  required
  aria-required="true">

<!-- ✅ BEST: Legend explains required fields -->
<form>
  <p>Fields marked with <span aria-label="asterisk indicates required">*</span> are required.</p>

  <label for="name">Name *</label>
  <input type="text" id="name" required aria-required="true">

  <label for="email">Email *</label>
  <input type="email" id="email" required aria-required="true">
</form>
```

**Error Messages:**

```html
<!-- ❌ BAD: Error message not associated with input -->
<label for="email">Email</label>
<input type="email" id="email">
<p style="color: red;">Invalid email format</p>
<!-- Screen reader doesn't connect error to input -->

<!-- ✅ GOOD: Use aria-describedby for errors -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<p id="email-error" class="error">
  Invalid email format. Please use format: user@example.com
</p>
<!-- Screen reader: "Email, invalid entry, Invalid email format..." -->

<!-- ✅ BETTER: Live region for dynamic errors -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error email-hint"
  aria-invalid="true">

<p id="email-hint" class="hint">
  Example: user@example.com
</p>

<div id="email-error" role="alert" aria-live="assertive">
  Invalid email format. Please use format: user@example.com
</div>
<!-- role="alert" causes screen reader to announce error immediately -->

<!-- ✅ BEST: Error summary at top of form -->
<div role="alert" aria-labelledby="error-heading" tabindex="-1" id="error-summary">
  <h2 id="error-heading">There are 2 errors in this form</h2>
  <ul>
    <li><a href="#email">Email: Invalid format</a></li>
    <li><a href="#password">Password: Must be at least 8 characters</a></li>
  </ul>
</div>

<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<p id="email-error" class="error">Invalid format. Use: user@example.com</p>

<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="password-error"
  aria-invalid="true">
<p id="password-error" class="error">Must be at least 8 characters</p>
```

**Help Text and Instructions:**

```html
<!-- ❌ BAD: Help text not associated -->
<label for="password">Password</label>
<input type="password" id="password">
<p>Must be at least 8 characters</p>

<!-- ✅ GOOD: Use aria-describedby for help text -->
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="password-hint">
<p id="password-hint">
  Must be at least 8 characters and include a number
</p>
<!-- Screen reader: "Password, edit, blank, Must be at least 8 characters..." -->

<!-- ✅ GOOD: Multiple descriptions (hint + error) -->
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="password-hint password-error"
  aria-invalid="true">

<p id="password-hint">
  Must be at least 8 characters and include a number
</p>

<p id="password-error" class="error">
  Password is too short
</p>
<!-- Screen reader reads BOTH hint and error -->
```

**Custom Form Controls (ARIA):**

```html
<!-- Custom dropdown (select alternative) -->
<div class="custom-select">
  <label id="country-label" for="country-button">Country</label>

  <button
    type="button"
    id="country-button"
    aria-haspopup="listbox"
    aria-labelledby="country-label"
    aria-expanded="false">
    Select a country
  </button>

  <ul
    role="listbox"
    aria-labelledby="country-label"
    tabindex="-1"
    hidden>
    <li role="option" aria-selected="false" id="option-us">
      United States
    </li>
    <li role="option" aria-selected="false" id="option-ca">
      Canada
    </li>
    <li role="option" aria-selected="false" id="option-uk">
      United Kingdom
    </li>
  </ul>
</div>

<!-- Custom checkbox (toggle switch) -->
<label for="notifications">
  Enable Notifications
</label>
<button
  type="button"
  role="switch"
  id="notifications"
  aria-checked="false"
  aria-labelledby="notifications-label">
  <span class="switch-slider"></span>
</button>
```

**Form Validation (Accessible):**

```html
<!-- HTML5 validation with custom messages -->
<form novalidate>
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-describedby="email-error"
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">

  <span id="email-error" role="alert"></span>

  <button type="submit">Submit</button>
</form>

<script>
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');

emailInput.addEventListener('blur', function() {
  if (emailInput.validity.valueMissing) {
    emailError.textContent = 'Email is required';
    emailInput.setAttribute('aria-invalid', 'true');
  } else if (emailInput.validity.patternMismatch) {
    emailError.textContent = 'Please enter a valid email address';
    emailInput.setAttribute('aria-invalid', 'true');
  } else {
    emailError.textContent = '';
    emailInput.setAttribute('aria-invalid', 'false');
  }
});
</script>
```

<details>
<summary><strong>🔍 Deep Dive: Screen Reader Form Navigation & ARIA Form Patterns</strong></summary>

**How Screen Readers Navigate Forms:**

Screen readers have specialized modes for form interaction:

**1. Forms Mode vs Browse Mode:**

```html
<!-- In Browse Mode (reading page content): -->
<!-- User reads linearly with arrow keys -->
<!-- Forms are announced but not interactive -->

<!-- Example page: -->
<h1>Contact Us</h1>
<p>Please fill out the form below.</p>

<form>
  <label for="name">Name</label>
  <input type="text" id="name">
</form>

<!-- NVDA Browse Mode navigation: -->
<!-- ↓ Arrow: "Contact Us, heading level 1" -->
<!-- ↓ Arrow: "Please fill out the form below" -->
<!-- ↓ Arrow: "Name, edit, blank" ← Announces field but doesn't enter it -->

<!-- In Forms Mode (interacting with form): -->
<!-- Activated automatically when Tab lands on form control -->
<!-- Or manually with Insert+Space (NVDA) / Enter (JAWS) -->

<!-- NVDA Forms Mode: -->
<!-- Tab: "Name, edit, blank" ← Cursor now in field, can type -->
<!-- Type: "John" → "John" (echoes characters) -->
<!-- Tab: Moves to next field -->

<!-- Key differences: -->
// Browse Mode: Read-only, arrow keys navigate
// Forms Mode: Interactive, typing goes into fields
```

**2. Label Announcement Order:**

Different screen readers announce labels in different orders:

```html
<label for="email">
  Email Address
  <span class="required">*</span>
  <span class="hint">(required)</span>
</label>
<input
  type="email"
  id="email"
  required
  aria-describedby="email-hint">
<span id="email-hint">We'll never share your email</span>

<!-- NVDA announcement order: -->
// 1. Label text: "Email Address"
// 2. Input type: "edit"
// 3. Required attribute: "required"
// 4. Current value: "blank" (if empty)
// 5. aria-describedby: "We'll never share your email"
// Full: "Email Address, required, edit, blank, We'll never share your email"

<!-- JAWS announcement order: -->
// 1. Label text: "Email Address"
// 2. Required attribute: "required"
// 3. Input type: "edit"
// 4. aria-describedby: "We'll never share your email"
// 5. Position in form: "Press Alt+Down to open suggestions"

<!-- VoiceOver announcement order: -->
// 1. Label text: "Email Address"
// 2. Input type: "edit text"
// 3. Required attribute: "required"
// 4. Hint: "We'll never share your email"
// 5. Instructions: "Type text"
```

**3. Fieldset/Legend Announcement:**

```html
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street</label>
  <input type="text" id="street">

  <label for="city">City</label>
  <input type="text" id="city">
</fieldset>

<!-- First field (street): -->
// NVDA: "Shipping Address, grouping, Street, edit, blank"
// JAWS: "Shipping Address, Street, edit"
// VoiceOver: "Shipping Address, group, Street, edit text"

<!-- Second field (city): -->
// NVDA: "City, edit, blank" (legend NOT repeated)
// JAWS: "City, edit" (legend NOT repeated)
// VoiceOver: "City, edit text" (legend NOT repeated)

<!-- User settings can change legend announcement behavior: -->
// JAWS setting: "Announce fieldset borders" (on/off)
// NVDA setting: "Report groupings" (on/off)

// Best practice: Keep legends CONCISE (announced on every field in group)
```

**4. Radio Button Group Navigation:**

```html
<fieldset>
  <legend>Subscription Plan</legend>

  <label>
    <input type="radio" name="plan" value="free" checked>
    Free - $0/month
  </label>

  <label>
    <input type="radio" name="plan" value="basic">
    Basic - $9/month
  </label>

  <label>
    <input type="radio" name="plan" value="pro">
    Pro - $29/month
  </label>
</fieldset>

<!-- Screen reader navigation: -->
// Tab to group: "Subscription Plan, Free - $0/month, radio button, checked, 1 of 3"

// Arrow keys navigate WITHIN group:
// ↓ Arrow: "Basic - $9/month, radio button, not checked, 2 of 3"
// ↓ Arrow: "Pro - $29/month, radio button, not checked, 3 of 3"
// ↑ Arrow: "Basic - $9/month, radio button, not checked, 2 of 3"

// Space key: Selects current radio button
// Tab key: Leaves group (moves to next form control)

// Important: Arrow keys SELECT radio buttons automatically in some browsers!
// Chrome/Firefox: Arrow changes selection
// Safari: Arrow moves focus, Space selects
```

**5. Error Message Discovery:**

Users need multiple ways to discover errors:

```javascript
// Method 1: Error summary at top (best for multiple errors)
function showErrorSummary(errors) {
  const summary = document.createElement('div');
  summary.setAttribute('role', 'alert');
  summary.setAttribute('aria-labelledby', 'error-heading');
  summary.setAttribute('tabindex', '-1');
  summary.id = 'error-summary';

  const heading = document.createElement('h2');
  heading.id = 'error-heading';
  heading.textContent = `There ${errors.length === 1 ? 'is' : 'are'} ${errors.length} error${errors.length === 1 ? '' : 's'} in this form`;

  const list = document.createElement('ul');
  errors.forEach(error => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${error.fieldId}`;
    link.textContent = `${error.label}: ${error.message}`;

    // Focus field when link is clicked
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const field = document.getElementById(error.fieldId);
      field.focus();
    });

    item.appendChild(link);
    list.appendChild(item);
  });

  summary.appendChild(heading);
  summary.appendChild(list);

  // Insert at top of form
  const form = document.querySelector('form');
  form.insertBefore(summary, form.firstChild);

  // Focus summary (screen reader announces it)
  summary.focus();
}

// Method 2: Inline errors (aria-describedby)
function showInlineError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorId = `${fieldId}-error`;

  // Create or update error element
  let errorElement = document.getElementById(errorId);
  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.id = errorId;
    errorElement.className = 'error';
    errorElement.setAttribute('role', 'alert');
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  errorElement.textContent = message;

  // Associate error with field
  const describedBy = field.getAttribute('aria-describedby');
  if (!describedBy || !describedBy.includes(errorId)) {
    field.setAttribute(
      'aria-describedby',
      describedBy ? `${describedBy} ${errorId}` : errorId
    );
  }

  // Mark field as invalid
  field.setAttribute('aria-invalid', 'true');

  // Add visual styling
  field.classList.add('error-field');
}

// Method 3: Live region for single-field validation
function validateFieldLive(field) {
  const liveRegion = document.getElementById('form-live-region');

  field.addEventListener('blur', () => {
    const validation = validateField(field);

    if (!validation.valid) {
      // Announce error via live region
      liveRegion.textContent = `${field.labels[0].textContent}: ${validation.message}`;

      // Also show inline error
      showInlineError(field.id, validation.message);
    } else {
      // Clear error
      clearError(field.id);
      liveRegion.textContent = '';
    }
  });
}

// Create live region once on page load
function createLiveRegion() {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'form-live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);
}
```

**6. Required Field Indication:**

Different ways screen readers detect required fields:

```html
<!-- Method 1: required attribute (most reliable) -->
<label for="email">Email</label>
<input type="email" id="email" required>
<!-- NVDA: "Email, required, edit, blank" -->
<!-- JAWS: "Email, required, edit" -->
<!-- VoiceOver: "Email, required, edit text" -->

<!-- Method 2: aria-required (fallback for custom controls) -->
<label for="email">Email</label>
<input type="email" id="email" aria-required="true">
<!-- Same announcement as required attribute -->

<!-- Method 3: Visual indicator + text -->
<label for="email">
  Email
  <span aria-label="required">*</span>
</label>
<input type="email" id="email" required>
<!-- NVDA: "Email, required, edit, blank" -->
<!-- Asterisk is announced as "required" -->

<!-- Method 4: Legend explanation (for entire form) -->
<form>
  <p id="required-legend">Fields marked with * are required</p>

  <label for="name">Name *</label>
  <input type="text" id="name" required aria-describedby="required-legend">

  <label for="email">Email *</label>
  <input type="email" id="email" required aria-describedby="required-legend">
</form>
<!-- Each field announces: "Name, required, edit, Fields marked with * are required" -->

<!-- ❌ AVOID: Asterisk without aria-label -->
<label for="email">Email *</label>
<input type="email" id="email" required>
<!-- NVDA: "Email, star, required, edit" (confusing - "star" is meaningless) -->

<!-- ✅ BEST: Combination approach -->
<label for="email">
  Email <abbr title="required" aria-label="required">*</abbr>
</label>
<input type="email" id="email" required aria-required="true">
<!-- Screen reader: "Email, required, edit" (clean, clear) -->
<!-- Visual users: See asterisk with tooltip -->
```

**7. Custom Select (Accessible Pattern):**

```html
<!-- Native select (most accessible baseline) -->
<label for="country">Country</label>
<select id="country" name="country">
  <option value="">Select a country</option>
  <option value="US">United States</option>
  <option value="CA">Canada</option>
  <option value="UK">United Kingdom</option>
</select>

<!-- Custom select (ARIA Listbox pattern) -->
<div class="custom-select">
  <label id="country-label" for="country-button">Country</label>

  <button
    type="button"
    id="country-button"
    aria-haspopup="listbox"
    aria-labelledby="country-label"
    aria-expanded="false"
    aria-controls="country-listbox">
    <span id="country-value">Select a country</span>
    <span aria-hidden="true">▼</span>
  </button>

  <ul
    id="country-listbox"
    role="listbox"
    aria-labelledby="country-label"
    tabindex="-1"
    hidden>
    <li role="option" id="option-us" aria-selected="false">
      United States
    </li>
    <li role="option" id="option-ca" aria-selected="false">
      Canada
    </li>
    <li role="option" id="option-uk" aria-selected="false">
      United Kingdom
    </li>
  </ul>

  <!-- Hidden input to store value for form submission -->
  <input type="hidden" name="country" id="country" value="">
</div>

<script>
// Custom select JavaScript (simplified)
class AccessibleSelect {
  constructor(container) {
    this.container = container;
    this.button = container.querySelector('[aria-haspopup="listbox"]');
    this.listbox = container.querySelector('[role="listbox"]');
    this.options = container.querySelectorAll('[role="option"]');
    this.hiddenInput = container.querySelector('input[type="hidden"]');
    this.valueDisplay = container.querySelector('#country-value');

    this.currentFocus = -1;
    this.selectedIndex = -1;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Button click: toggle listbox
    this.button.addEventListener('click', () => this.toggle());

    // Button keyboard: arrow down opens listbox
    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.open();
        this.focusOption(0);
      }
    });

    // Listbox keyboard navigation
    this.listbox.addEventListener('keydown', (e) => this.handleListboxKeydown(e));

    // Option click: select option
    this.options.forEach((option, index) => {
      option.addEventListener('click', () => {
        this.selectOption(index);
        this.close();
        this.button.focus();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    const isExpanded = this.button.getAttribute('aria-expanded') === 'true';
    isExpanded ? this.close() : this.open();
  }

  open() {
    this.button.setAttribute('aria-expanded', 'true');
    this.listbox.hidden = false;
    this.listbox.focus();

    // Announce to screen readers
    this.listbox.setAttribute('aria-activedescendant', this.options[this.currentFocus]?.id || '');
  }

  close() {
    this.button.setAttribute('aria-expanded', 'false');
    this.listbox.hidden = true;
    this.currentFocus = -1;
  }

  focusOption(index) {
    if (index < 0 || index >= this.options.length) return;

    // Remove previous focus
    this.options.forEach(opt => opt.classList.remove('focused'));

    // Add current focus
    this.currentFocus = index;
    this.options[index].classList.add('focused');
    this.options[index].scrollIntoView({ block: 'nearest' });

    // Update aria-activedescendant for screen readers
    this.listbox.setAttribute('aria-activedescendant', this.options[index].id);
  }

  selectOption(index) {
    // Remove previous selection
    this.options.forEach(opt => opt.setAttribute('aria-selected', 'false'));

    // Set new selection
    this.selectedIndex = index;
    this.options[index].setAttribute('aria-selected', 'true');

    // Update displayed value
    const value = this.options[index].textContent.trim();
    this.valueDisplay.textContent = value;

    // Update hidden input for form submission
    this.hiddenInput.value = this.options[index].id.replace('option-', '');

    // Announce selection to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `${value} selected`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  handleListboxKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusOption((this.currentFocus + 1) % this.options.length);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.focusOption((this.currentFocus - 1 + this.options.length) % this.options.length);
        break;

      case 'Home':
        e.preventDefault();
        this.focusOption(0);
        break;

      case 'End':
        e.preventDefault();
        this.focusOption(this.options.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.currentFocus >= 0) {
          this.selectOption(this.currentFocus);
          this.close();
          this.button.focus();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.close();
        this.button.focus();
        break;

      default:
        // Type-ahead: find option starting with typed character
        const char = e.key.toLowerCase();
        if (char.length === 1) {
          const matchIndex = Array.from(this.options).findIndex((opt, i) =>
            i > this.currentFocus && opt.textContent.trim().toLowerCase().startsWith(char)
          );
          if (matchIndex >= 0) {
            this.focusOption(matchIndex);
          }
        }
    }
  }
}

// Initialize custom select
const customSelect = new AccessibleSelect(document.querySelector('.custom-select'));
</script>

<!-- Screen reader experience: -->
<!-- Tab to button: "Country, Select a country, button, collapsed" -->
<!-- Click/Space: "Country, listbox, United States, 1 of 3" -->
<!-- Arrow down: "Canada, 2 of 3" -->
<!-- Enter: "Canada selected" (live announcement) -->
<!-- Button focus: "Country, Canada, button, collapsed" -->
```

**8. Form Validation Timing:**

When to show errors affects accessibility:

```javascript
// Strategy 1: On submit (best for first attempt)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const errors = validateForm(form);

  if (errors.length > 0) {
    showErrorSummary(errors);
    // Focus error summary
    document.getElementById('error-summary').focus();
  } else {
    submitForm(form);
  }
});

// Strategy 2: On blur (after user leaves field)
inputs.forEach(input => {
  input.addEventListener('blur', () => {
    const error = validateField(input);
    if (error) {
      showInlineError(input.id, error);
    } else {
      clearError(input.id);
    }
  });
});

// Strategy 3: On input (live validation - use cautiously)
input.addEventListener('input', debounce(() => {
  const error = validateField(input);

  if (error) {
    // Don't announce every keystroke - use debounce
    showInlineError(input.id, error);
  } else {
    clearError(input.id);
    // Announce success (optional, can be noisy)
    announceLiveMessage(`${input.labels[0].textContent} is valid`);
  }
}, 500));

// Strategy 4: Hybrid (best UX)
// - On submit: Show all errors
// - After first submit: Show errors on blur
// - After field is valid: Show errors on input (catch new mistakes immediately)

let hasSubmitted = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  hasSubmitted = true;

  const errors = validateForm(form);
  if (errors.length > 0) {
    showErrorSummary(errors);
  } else {
    submitForm(form);
  }
});

inputs.forEach(input => {
  let wasValid = false;

  input.addEventListener('blur', () => {
    if (hasSubmitted) {
      const error = validateField(input);
      if (error) {
        showInlineError(input.id, error);
        wasValid = false;
      } else {
        clearError(input.id);
        wasValid = true;
      }
    }
  });

  input.addEventListener('input', debounce(() => {
    if (hasSubmitted && wasValid) {
      // Only validate on input if field was previously valid
      const error = validateField(input);
      if (error) {
        showInlineError(input.id, error);
        wasValid = false;
      }
    }
  }, 300));
});
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Checkout Form Accessibility Crisis</strong></summary>

**Scenario**: You're called in to fix a major e-commerce site where checkout abandonment rate is 78% among screen reader users (vs 35% for sighted users). User testing reveals that screen reader users can't complete purchases due to inaccessible forms. The company is losing an estimated $2.4M/year in revenue and facing ADA lawsuits from 12 users.

**Production Metrics (Before Fix):**
- Checkout completion rate (screen reader users): 22%
- Checkout completion rate (sighted users): 65%
- Average time to complete checkout (SR): 18 minutes (vs 4 minutes sighted)
- Form abandonment points: 87% abandon at payment form, 56% at shipping address
- Error recovery success rate: 31% (users can't find/fix errors)
- ADA lawsuits: 12 pending ($500K+ potential liability)
- Lost revenue (annual): $2.4M

**The Problem Code:**

```html
<!-- ❌ CRITICAL ISSUES: Checkout form -->

<!-- Issue 1: No labels on inputs (placeholder-only) -->
<form id="checkout-form">
  <h2>Shipping Information</h2>

  <input type="text" name="name" placeholder="Full Name">
  <input type="email" name="email" placeholder="Email Address">
  <input type="tel" name="phone" placeholder="Phone Number">
  <!-- Screen reader: "edit, blank" (no context about what field is!) -->

  <!-- Issue 2: No fieldset/legend for address groups -->
  <h3>Billing Address</h3>
  <input type="text" name="billStreet" placeholder="Street Address">
  <input type="text" name="billCity" placeholder="City">
  <select name="billState">
    <option value="">State</option>
    <option value="CA">California</option>
  </select>

  <h3>Shipping Address</h3>
  <input type="text" name="shipStreet" placeholder="Street Address">
  <input type="text" name="shipCity" placeholder="City">
  <select name="shipState">
    <option value="">State</option>
  </select>
  <!-- Screen reader: "Street Address, edit" ← Which address? Billing or shipping? -->

  <!-- Issue 3: Radio buttons without grouping -->
  <p>Shipping Method</p>
  <input type="radio" id="standardShip" name="shipping" value="standard">
  <label for="standardShip">Standard (5-7 days) - Free</label>

  <input type="radio" id="expressShip" name="shipping" value="express">
  <label for="expressShip">Express (2-3 days) - $9.99</label>
  <!-- Screen reader: "Standard (5-7 days) - Free, radio button" -->
  <!-- User doesn't know these are for "Shipping Method" -->

  <!-- Issue 4: Required fields with no indication -->
  <input type="text" name="cardNumber" placeholder="Card Number *">
  <!-- Asterisk is inside placeholder - disappears when typing! -->

  <!-- Issue 5: Errors shown visually only -->
  <input
    type="text"
    name="cardNumber"
    class="error-border"
    placeholder="Card Number">
  <span class="error-text" style="color: red;">Invalid card number</span>
  <!-- Error not associated with input - screen reader doesn't announce it -->

  <!-- Issue 6: Custom dropdown with no ARIA -->
  <div class="custom-dropdown" id="country-dropdown">
    <div class="dropdown-header" onclick="toggleDropdown()">
      Select Country
    </div>
    <div class="dropdown-options" style="display: none;">
      <div onclick="selectCountry('US')">United States</div>
      <div onclick="selectCountry('CA')">Canada</div>
    </div>
  </div>
  <!-- Not keyboard accessible, no screen reader support -->

  <!-- Issue 7: Submit button doesn't indicate loading state -->
  <button type="submit" onclick="processPayment()">
    Place Order
  </button>
  <!-- After click, button text changes to "Processing..." but screen reader not notified -->
</form>

<script>
function processPayment() {
  // Shows loading spinner (visual only)
  document.querySelector('button[type="submit"]').innerHTML = 'Processing...';

  // No announcement to screen readers!
  // User doesn't know if form is submitting or stuck
}
</script>
```

**Debugging Process:**

**Step 1: Screen Reader User Testing (NVDA)**

```
User task: "Complete checkout for a $50 product"

0:00 - User tabs to first field
SR: "edit, blank"
User: "What is this field for? I hear no label."
User tries to guess, types name anyway

0:15 - User tabs to second field
SR: "edit, blank"
User: "Again, no label. Is this email? Phone? Address?"
User types email (correct guess)

0:45 - User reaches address section
SR: "Street Address, edit, blank"
User types billing street address

1:10 - User tabs to next field
SR: "Street Address, edit, blank"
User: "Wait, I just filled that out. Is this a duplicate? Or is it asking for shipping address?"
User confused, tabs backward to check

2:30 - User reaches shipping method radios
SR: "Standard (5-7 days) - Free, radio button, not checked"
User: "Standard what? Shipping method? Payment method?"
User selects Standard (correct guess)

4:20 - User reaches card number field
SR: "edit, blank"
User: "No label again. I assume this is for payment?"
User types card number incorrectly (missing digit)

4:45 - User clicks Submit
SR: "Place Order, button"
(Form validation fails, errors shown visually in red)
SR: (silence - no error announcement)

User: "Did it submit? Is it processing? What happened?"

5:30 - User tabs through form looking for errors
SR: "edit, blank... edit, blank... edit, blank..."
User: "I don't hear any error messages. Let me try submitting again."

6:15 - User clicks Submit again
(Same result - visual errors, no screen reader feedback)

7:00 - User gives up, abandons cart
User: "This site is impossible to use. I can't tell what's happening."

RESULT: Checkout abandoned after 7 minutes of frustration
```

**Step 2: Automated Accessibility Audit**

```javascript
// Run axe-core on checkout form
const { axe } = require('axe-core');

axe.run('#checkout-form', {
  rules: [
    'label',
    'label-content-name-mismatch',
    'form-field-multiple-labels',
    'aria-required-attr',
    'aria-valid-attr-value',
    'button-name',
    'input-button-name',
  ]
}).then(results => {
  console.log('Violations:', results.violations.length);

  results.violations.forEach(violation => {
    console.log(`
      Rule: ${violation.id}
      Impact: ${violation.impact}
      Description: ${violation.description}
      Affected elements: ${violation.nodes.length}
    `);
  });
});

// Output:
// Violations: 47
//
// Rule: label
// Impact: critical
// Description: Form elements must have labels
// Affected elements: 18
//
// Rule: aria-required-attr
// Impact: serious
// Description: Required fields must be marked as required
// Affected elements: 12
//
// Rule: button-name
// Impact: serious
// Description: Buttons must have accessible names
// Affected elements: 3 (custom dropdown buttons)
```

**Step 3: Fix Implementation**

```html
<!-- ✅ FIXED: Accessible checkout form -->

<form id="checkout-form" novalidate>
  <!-- Fix: Error summary (shown on submit if errors exist) -->
  <div id="error-summary" role="alert" tabindex="-1" hidden>
    <h2 id="error-heading">There are errors in your order</h2>
    <p>Please correct the following errors to proceed:</p>
    <ul id="error-list"></ul>
  </div>

  <!-- Fix: Proper section heading + fieldset for contact info -->
  <fieldset>
    <legend>Contact Information</legend>

    <div class="form-group">
      <label for="name">
        Full Name
        <abbr title="required" aria-label="required">*</abbr>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        aria-required="true"
        aria-describedby="name-hint"
        autocomplete="name">
      <p id="name-hint" class="hint">First and last name</p>
      <p id="name-error" class="error" role="alert" hidden></p>
    </div>

    <div class="form-group">
      <label for="email">
        Email Address
        <abbr title="required" aria-label="required">*</abbr>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        aria-required="true"
        aria-describedby="email-hint"
        autocomplete="email">
      <p id="email-hint" class="hint">We'll send your receipt here</p>
      <p id="email-error" class="error" role="alert" hidden></p>
    </div>

    <div class="form-group">
      <label for="phone">
        Phone Number
        <abbr title="required" aria-label="required">*</abbr>
      </label>
      <input
        type="tel"
        id="phone"
        name="phone"
        required
        aria-required="true"
        aria-describedby="phone-hint"
        autocomplete="tel">
      <p id="phone-hint" class="hint">For delivery updates</p>
      <p id="phone-error" class="error" role="alert" hidden></p>
    </div>
  </fieldset>

  <!-- Fix: Fieldset/legend for billing address -->
  <fieldset>
    <legend>Billing Address</legend>

    <div class="form-group">
      <label for="billStreet">Street Address</label>
      <input
        type="text"
        id="billStreet"
        name="billStreet"
        required
        aria-required="true"
        autocomplete="billing street-address">
      <p id="billStreet-error" class="error" role="alert" hidden></p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="billCity">City</label>
        <input
          type="text"
          id="billCity"
          name="billCity"
          required
          aria-required="true"
          autocomplete="billing address-level2">
        <p id="billCity-error" class="error" role="alert" hidden></p>
      </div>

      <div class="form-group">
        <label for="billState">State</label>
        <select
          id="billState"
          name="billState"
          required
          aria-required="true"
          autocomplete="billing address-level1">
          <option value="">Select a state</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
        </select>
        <p id="billState-error" class="error" role="alert" hidden></p>
      </div>

      <div class="form-group">
        <label for="billZip">ZIP Code</label>
        <input
          type="text"
          id="billZip"
          name="billZip"
          required
          aria-required="true"
          autocomplete="billing postal-code"
          pattern="[0-9]{5}">
        <p id="billZip-error" class="error" role="alert" hidden></p>
      </div>
    </div>
  </fieldset>

  <!-- Fix: Checkbox for same as billing -->
  <div class="form-group">
    <label>
      <input
        type="checkbox"
        id="sameAsBilling"
        onchange="toggleShippingAddress()">
      Shipping address same as billing
    </label>
  </div>

  <!-- Fix: Shipping address fieldset -->
  <fieldset id="shipping-address">
    <legend>Shipping Address</legend>
    <!-- Same structure as billing address -->
  </fieldset>

  <!-- Fix: Radio group with fieldset/legend -->
  <fieldset>
    <legend>Shipping Method</legend>

    <div class="radio-group">
      <label class="radio-label">
        <input
          type="radio"
          name="shipping"
          value="standard"
          id="standardShip"
          checked>
        <span class="radio-label-text">
          <strong>Standard Shipping</strong> (5-7 business days) - Free
        </span>
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="shipping"
          value="express"
          id="expressShip">
        <span class="radio-label-text">
          <strong>Express Shipping</strong> (2-3 business days) - $9.99
        </span>
      </label>

      <label class="radio-label">
        <input
          type="radio"
          name="shipping"
          value="overnight"
          id="overnightShip">
        <span class="radio-label-text">
          <strong>Overnight Shipping</strong> (next business day) - $24.99
        </span>
      </label>
    </div>
  </fieldset>

  <!-- Fix: Payment information with proper labels -->
  <fieldset>
    <legend>Payment Information</legend>

    <div class="form-group">
      <label for="cardNumber">
        Card Number
        <abbr title="required" aria-label="required">*</abbr>
      </label>
      <input
        type="text"
        id="cardNumber"
        name="cardNumber"
        required
        aria-required="true"
        aria-describedby="cardNumber-hint"
        autocomplete="cc-number"
        inputmode="numeric"
        pattern="[0-9]{13,19}">
      <p id="cardNumber-hint" class="hint">16-digit number on your card</p>
      <p id="cardNumber-error" class="error" role="alert" hidden></p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="cardExpiry">Expiration Date</label>
        <input
          type="text"
          id="cardExpiry"
          name="cardExpiry"
          required
          aria-required="true"
          aria-describedby="cardExpiry-hint"
          placeholder="MM/YY"
          autocomplete="cc-exp"
          pattern="(0[1-9]|1[0-2])\/[0-9]{2}">
        <p id="cardExpiry-hint" class="hint">MM/YY</p>
        <p id="cardExpiry-error" class="error" role="alert" hidden></p>
      </div>

      <div class="form-group">
        <label for="cardCVV">
          Security Code (CVV)
          <button
            type="button"
            aria-label="What is CVV?"
            onclick="showCVVHelp()">
            ?
          </button>
        </label>
        <input
          type="text"
          id="cardCVV"
          name="cardCVV"
          required
          aria-required="true"
          aria-describedby="cardCVV-hint"
          autocomplete="cc-csc"
          inputmode="numeric"
          pattern="[0-9]{3,4}">
        <p id="cardCVV-hint" class="hint">3-digit code on back of card</p>
        <p id="cardCVV-error" class="error" role="alert" hidden></p>
      </div>
    </div>
  </fieldset>

  <!-- Fix: Submit button with loading state -->
  <button
    type="submit"
    id="submit-button"
    aria-describedby="submit-hint">
    <span id="submit-text">Place Order - $50.00</span>
    <span id="submit-spinner" class="spinner" hidden aria-hidden="true"></span>
  </button>
  <p id="submit-hint" class="hint">
    By placing your order, you agree to our Terms of Service
  </p>

  <!-- Live region for status updates -->
  <div id="form-status" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
</form>

<script>
// Form validation and submission
const form = document.getElementById('checkout-form');
const submitButton = document.getElementById('submit-button');
const submitText = document.getElementById('submit-text');
const submitSpinner = document.getElementById('submit-spinner');
const formStatus = document.getElementById('form-status');
const errorSummary = document.getElementById('error-summary');
const errorList = document.getElementById('error-list');

let hasSubmitted = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hasSubmitted = true;

  const errors = validateForm();

  if (errors.length > 0) {
    // Show error summary
    showErrorSummary(errors);

    // Focus error summary
    errorSummary.hidden = false;
    errorSummary.focus();

    // Announce to screen readers
    formStatus.textContent = `There are ${errors.length} errors in the form. Please correct them and try again.`;
  } else {
    // Show loading state
    submitButton.disabled = true;
    submitText.textContent = 'Processing...';
    submitSpinner.hidden = false;

    // Announce loading
    formStatus.textContent = 'Processing your order, please wait.';

    try {
      // Submit form
      await submitOrder(new FormData(form));

      // Success
      formStatus.textContent = 'Order placed successfully! Redirecting to confirmation page.';

      setTimeout(() => {
        window.location.href = '/order-confirmation';
      }, 2000);

    } catch (error) {
      // Error
      submitButton.disabled = false;
      submitText.textContent = 'Place Order - $50.00';
      submitSpinner.hidden = true;

      formStatus.textContent = 'Error processing order. Please try again or contact support.';

      alert('Error: ' + error.message);
    }
  }
});

// Validate individual field on blur (after first submit attempt)
form.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('blur', () => {
    if (hasSubmitted) {
      validateField(field);
    }
  });
});

function validateForm() {
  const errors = [];
  const fields = form.querySelectorAll('input[required], select[required]');

  fields.forEach(field => {
    const error = getFieldError(field);
    if (error) {
      errors.push({
        field: field,
        label: field.labels[0]?.textContent.trim() || field.name,
        message: error
      });

      showFieldError(field, error);
    } else {
      clearFieldError(field);
    }
  });

  return errors;
}

function validateField(field) {
  const error = getFieldError(field);

  if (error) {
    showFieldError(field, error);
  } else {
    clearFieldError(field);
  }
}

function getFieldError(field) {
  if (field.validity.valueMissing) {
    return 'This field is required';
  }

  if (field.validity.typeMismatch) {
    if (field.type === 'email') {
      return 'Please enter a valid email address';
    }
    if (field.type === 'url') {
      return 'Please enter a valid URL';
    }
  }

  if (field.validity.patternMismatch) {
    if (field.id === 'cardNumber') {
      return 'Please enter a valid 16-digit card number';
    }
    if (field.id === 'cardExpiry') {
      return 'Please enter expiration date in MM/YY format';
    }
    if (field.id === 'cardCVV') {
      return 'Please enter a valid 3-digit CVV';
    }
    if (field.id.includes('Zip')) {
      return 'Please enter a valid 5-digit ZIP code';
    }
  }

  if (field.validity.tooShort) {
    return `Must be at least ${field.minLength} characters`;
  }

  if (field.validity.tooLong) {
    return `Must be no more than ${field.maxLength} characters`;
  }

  return null;
}

function showFieldError(field, message) {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  // Mark field as invalid
  field.setAttribute('aria-invalid', 'true');

  // Associate error with field
  const describedBy = field.getAttribute('aria-describedby') || '';
  if (!describedBy.includes(errorId)) {
    field.setAttribute('aria-describedby', `${describedBy} ${errorId}`.trim());
  }

  // Visual styling
  field.classList.add('error-field');
}

function clearFieldError(field) {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.hidden = true;
  }

  field.setAttribute('aria-invalid', 'false');
  field.classList.remove('error-field');
}

function showErrorSummary(errors) {
  errorList.innerHTML = '';

  errors.forEach(error => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${error.field.id}`;
    link.textContent = `${error.label}: ${error.message}`;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      error.field.focus();
    });

    li.appendChild(link);
    errorList.appendChild(li);
  });
}

async function submitOrder(formData) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success
      resolve({ orderId: '12345' });

      // Simulate error:
      // reject(new Error('Payment processing failed'));
    }, 2000);
  });
}
</script>
```

**Production Metrics (After Fix):**

```javascript
// Before optimization:
// - Checkout completion (SR users): 22%
// - Average time (SR users): 18 minutes
// - Form abandonment: 87% at payment, 56% at shipping
// - Error recovery: 31%
// - Lawsuits: 12 pending
// - Lost revenue: $2.4M/year

// After optimization:
// - Checkout completion (SR users): 68% (+209% improvement!) ✅
// - Average time (SR users): 5.5 minutes (69% faster!) ✅
// - Form abandonment: 28% at payment, 18% at shipping (67% reduction) ✅
// - Error recovery: 89% (+187% improvement!) ✅
// - Lawsuits: 0 new (12 settled for $80K vs $500K+ potential) ✅
// - Lost revenue: $0.4M/year (83% reduction, $2M saved!) ✅

// Additional benefits:
// - WCAG 2.1 Level AA compliance: PASSED ✅
// - Conversion rate (all users): +12% (clear labels help everyone!)
// - Customer satisfaction: +156%
// - Support tickets: -67% (fewer form-related issues)
// - Mobile usability: +34% (labels work better on small screens)
// - SEO: +8% (semantic HTML improves crawlability)
```

**Key Lessons:**

1. **Labels are non-negotiable**: Every input MUST have an associated label
2. **Fieldset/legend for grouping**: Critical for radio buttons and related fields
3. **Error recovery is key**: Users need to find and fix errors easily
4. **Loading states matter**: Communicate processing status to all users
5. **Test with real users**: Automated tools miss critical UX issues

</details>

<details>
<summary><strong>⚖️ Trade-offs: Form Validation Timing Strategies</strong></summary>

**When should you validate form fields and show errors?**

| Strategy | Timing | Pros | Cons | Best For |
|----------|--------|------|------|----------|
| **On Submit** | After user clicks submit button | Non-intrusive, doesn't interrupt typing, clear validation moment | User discovers all errors at end, longer feedback loop | Simple forms, first-time users |
| **On Blur** | When user leaves field (blur event) | Immediate feedback per field, catches errors early | Can be annoying if user tabs through quickly | Complex forms, experienced users |
| **On Input** | As user types (input event with debounce) | Real-time feedback, prevents errors before submission | Very intrusive, can be frustrating | Password strength, username availability |
| **Hybrid** | On submit first, then blur/input after first attempt | Best balance: non-intrusive first time, helpful after | More complex to implement | Most production forms ✅ |

**Performance & UX Comparison:**

```html
<!-- Test: Registration form with email validation -->

<!-- Strategy 1: On Submit Only -->
<form id="form-submit-only">
  <label for="email1">Email</label>
  <input type="email" id="email1" required>

  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('form-submit-only').addEventListener('submit', (e) => {
  e.preventDefault();

  // Validate all fields at once
  const errors = validateAll();

  if (errors.length > 0) {
    showErrors(errors);
  } else {
    submitForm();
  }
});

// Metrics:
// - User experience: Good for first attempt (not interrupted)
// - Error discovery: Delayed (only at submit)
// - Completion time: Longer (must fix all errors and re-submit)
// - User frustration: Medium (late feedback)
// - Best for: Simple forms (1-5 fields)
</script>

<!-- Strategy 2: On Blur -->
<form id="form-blur">
  <label for="email2">Email</label>
  <input type="email" id="email2" required>

  <button type="submit">Sign Up</button>
</form>

<script>
const email2 = document.getElementById('email2');

email2.addEventListener('blur', () => {
  const error = validateEmail(email2.value);

  if (error) {
    showError(email2, error);
  } else {
    clearError(email2);
  }
});

// Metrics:
// - User experience: Can be annoying (error before user finishes)
// - Error discovery: Immediate (as soon as user leaves field)
// - Completion time: Faster (fix errors as you go)
// - User frustration: Medium-High (feels "naggy")
// - Best for: Long forms (10+ fields) where immediate feedback helps
</script>

<!-- Strategy 3: On Input (Debounced) -->
<form id="form-input">
  <label for="email3">Email</label>
  <input type="email" id="email3" required>

  <button type="submit">Sign Up</button>
</form>

<script>
const email3 = document.getElementById('email3');

// Debounce to avoid validating on every keystroke
let timeout;
email3.addEventListener('input', () => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    const error = validateEmail(email3.value);

    if (error) {
      showError(email3, error);
    } else {
      clearError(email3);
    }
  }, 500); // Wait 500ms after user stops typing
});

// Metrics:
// - User experience: Very intrusive (error while typing)
// - Error discovery: Real-time (as soon as typing stops)
// - Completion time: Fastest (immediate correction)
// - User frustration: High (feels "aggressive")
// - Best for: Specific fields (password strength, username availability)
</script>

<!-- Strategy 4: Hybrid (Recommended) -->
<form id="form-hybrid">
  <label for="email4">Email</label>
  <input type="email" id="email4" required aria-describedby="email4-error">
  <p id="email4-error" role="alert" hidden></p>

  <button type="submit">Sign Up</button>
</form>

<script>
const email4 = document.getElementById('email4');
let hasSubmitted = false;
let wasValid = false;

// Phase 1: On Submit (first attempt)
document.getElementById('form-hybrid').addEventListener('submit', (e) => {
  e.preventDefault();
  hasSubmitted = true;

  const errors = validateAll();

  if (errors.length > 0) {
    showErrorSummary(errors);
    // Don't submit
  } else {
    submitForm();
  }
});

// Phase 2: On Blur (after first submit)
email4.addEventListener('blur', () => {
  if (hasSubmitted) {
    const error = validateEmail(email4.value);

    if (error) {
      showError(email4, error);
      wasValid = false;
    } else {
      clearError(email4);
      wasValid = true;
    }
  }
});

// Phase 3: On Input (after field becomes valid, to catch new errors)
let debounceTimeout;
email4.addEventListener('input', () => {
  if (hasSubmitted && wasValid) {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      const error = validateEmail(email4.value);

      if (error) {
        showError(email4, error);
        wasValid = false;
      }
    }, 300);
  }
});

// Metrics (Hybrid approach):
// - User experience: Excellent (not intrusive first time, helpful after)
// - Error discovery: Balanced (late for new users, early for repeat attempts)
// - Completion time: Optimal (fast error correction without annoyance)
// - User frustration: Low (feels "smart" and helpful)
// - Best for: All production forms ✅
</script>
```

**Accessibility Trade-offs:**

```html
<!-- Screen reader announcements with different strategies -->

<!-- Strategy 1: On Submit (Error Summary) -->
<form onsubmit="return false;">
  <label for="email">Email</label>
  <input type="email" id="email">

  <button type="submit">Submit</button>
</form>

<!-- On submit: -->
<div role="alert" aria-labelledby="error-heading" tabindex="-1">
  <h2 id="error-heading">There is 1 error</h2>
  <ul>
    <li><a href="#email">Email: Invalid format</a></li>
  </ul>
</div>

<!-- Screen reader announces: -->
<!-- "There is 1 error, Email: Invalid format" -->
<!-- Pros: Clear, summarizes all errors -->
<!-- Cons: User must navigate to error, longer flow -->

<!-- Strategy 2: Inline Errors with aria-describedby -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<p id="email-error" role="alert">
  Invalid email format
</p>

<!-- Screen reader announces (on focus): -->
<!-- "Email, invalid entry, Invalid email format" -->
<!-- Pros: Immediate context when user focuses field -->
<!-- Cons: Only announced when field is focused, easy to miss if tabbing quickly -->

<!-- Strategy 3: Live Region (Real-time) -->
<label for="email">Email</label>
<input type="email" id="email">

<div aria-live="polite" aria-atomic="true" class="sr-only">
  Invalid email format
</div>

<!-- Screen reader announces: -->
<!-- "Invalid email format" (immediately when error appears) -->
<!-- Pros: Interrupts user immediately (good for critical errors) -->
<!-- Cons: Can be annoying if errors appear while typing -->
</script>

**Decision Matrix:**

```javascript
function chooseValidationStrategy(form) {
  const fieldCount = form.querySelectorAll('input, select, textarea').length;
  const hasComplexValidation = form.querySelector('[pattern], [type="email"], [type="url"]') !== null;
  const isCheckout = form.id.includes('checkout') || form.id.includes('payment');
  const hasRealTimeFields = form.querySelector('[data-validate-live]') !== null;

  // Decision tree
  if (fieldCount <= 3 && !hasComplexValidation) {
    return {
      strategy: 'on-submit',
      reason: 'Simple form - on-submit validation is sufficient'
    };
  }

  if (fieldCount > 15) {
    return {
      strategy: 'hybrid',
      reason: 'Long form - hybrid validation prevents late error discovery'
    };
  }

  if (isCheckout) {
    return {
      strategy: 'hybrid-aggressive',
      reason: 'Critical flow - validate on blur after first attempt'
    };
  }

  if (hasRealTimeFields) {
    return {
      strategy: 'mixed',
      reason: 'Some fields need real-time (password strength, username), others on-blur'
    };
  }

  // Default
  return {
    strategy: 'hybrid',
    reason: 'Standard form - hybrid approach balances UX and error prevention'
  };
}

// Example usage
const form = document.querySelector('form');
const recommendation = chooseValidationStrategy(form);
console.log(recommendation);
// Output: { strategy: 'hybrid', reason: '...' }
```

**Performance Considerations:**

```javascript
// Test: Validation performance for 100-field form

// Strategy 1: Validate all on submit
console.time('validate-all');
const errors = [];
for (let i = 0; i < 100; i++) {
  const field = document.getElementById(`field${i}`);
  const error = validateField(field);
  if (error) errors.push(error);
}
console.timeEnd('validate-all');
// Time: ~15ms (blocks UI thread)
// Impact: Noticeable lag on submit for very large forms

// Strategy 2: Validate incrementally (on blur)
// Each field validated separately (not measured, but ~0.15ms per field)
// Total validation happens over time as user fills form
// Time: Distributed across user interaction (no perceived lag)
// Impact: No UI blocking, smoother UX

// Strategy 3: Debounced validation (on input)
// Validation triggered 500ms after typing stops
// Time: 0.15ms per field (when triggered)
// Impact: Minimal, but many DOM updates (error show/hide) can cause reflows

// Winner: Hybrid (best performance + UX)
```

**Recommendation Summary:**

| Form Type | Recommended Strategy | Implementation Notes |
|-----------|---------------------|----------------------|
| Simple (1-5 fields) | On Submit | Show error summary at top |
| Standard (6-15 fields) | Hybrid | Submit → Blur → Input (progressive) |
| Long (16+ fields) | Hybrid + Section Summary | Group errors by fieldset |
| Checkout / Payment | Hybrid Aggressive | Blur validation after first submit |
| Search / Filters | On Input (debounced) | Real-time feedback acceptable |
| Password / Username | On Input (debounced) + Server Check | Show strength meter, check availability |

</details>

<details>
<summary><strong>💬 Explain to Junior: Form Accessibility Basics</strong></summary>

**Simple Explanation:**

Imagine you're filling out a form while blindfolded, and someone is reading the form aloud to you. Would you be able to complete it?

**That's exactly what form accessibility is about** - making sure people using screen readers (or other assistive tech) can fill out forms as easily as sighted users.

**The Three Critical Rules:**

1. **Every input needs a label** (so screen reader users know what to type)
2. **Errors must be announced** (so users know what's wrong and how to fix it)
3. **Everything must work with keyboard** (no mouse-only interactions)

**Real Examples:**

```html
<!-- ❌ BAD: No label -->
<input type="text" placeholder="Enter your name">

<!-- What screen reader says: "edit, blank" -->
<!-- User thinks: "Edit WHAT? This is useless!" -->

<!-- ✅ GOOD: Proper label -->
<label for="name">Name</label>
<input type="text" id="name">

<!-- What screen reader says: "Name, edit, blank" -->
<!-- User thinks: "Ah, they want my name. Got it!" -->
```

**The "Connect the Label" Rule:**

Labels must be *programmatically connected* to inputs (not just visually near them).

```html
<!-- ❌ WRONG: Label and input are just sitting next to each other -->
<label>Email</label>
<input type="email">
<!-- They LOOK connected, but screen reader doesn't know they're related -->

<!-- ✅ RIGHT: Use for/id to connect them -->
<label for="userEmail">Email</label>
<input type="email" id="userEmail">
<!-- Now screen reader knows "userEmail" is for "Email" label -->

<!-- ✅ ALSO RIGHT: Wrap input inside label -->
<label>
  Email
  <input type="email">
</label>
<!-- This also connects them (but for/id is more flexible) -->
```

**Grouping Related Fields:**

Use `<fieldset>` and `<legend>` when fields are related (like address fields or radio buttons).

```html
<!-- ❌ BAD: No grouping -->
<h3>Shipping Address</h3>
<label for="street">Street</label>
<input type="text" id="street">

<label for="city">City</label>
<input type="text" id="city">

<!-- Screen reader: "Street, edit" -->
<!-- User thinks: "Street for what? Home? Work? Shipping?" -->

<!-- ✅ GOOD: Use fieldset/legend -->
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street</label>
  <input type="text" id="street">

  <label for="city">City</label>
  <input type="text" id="city">
</fieldset>

<!-- Screen reader: "Shipping Address, group, Street, edit" -->
<!-- User thinks: "Ah, this is for shipping address. Clear!" -->
```

**Showing Errors Accessibly:**

Errors must be *announced* to screen readers, not just shown in red.

```html
<!-- ❌ BAD: Error shown visually only -->
<label for="email">Email</label>
<input type="email" id="email" style="border: 2px solid red;">
<p style="color: red;">Invalid email</p>

<!-- Screen reader: "Email, edit, blank" -->
<!-- User has NO IDEA there's an error! -->

<!-- ✅ GOOD: Connect error to input -->
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<p id="email-error" role="alert">
  Invalid email format. Please use format: user@example.com
</p>

<!-- Screen reader: "Email, invalid entry, Invalid email format. Please use format: user@example.com" -->
<!-- User knows: (1) Field is invalid, (2) What's wrong, (3) How to fix it -->
```

**The "Phone Call Test":**

Imagine describing your form to someone over the phone:

```html
<!-- Your form: -->
<form>
  <input type="text" placeholder="Name">
  <input type="email" placeholder="Email">
  <button>Submit</button>
</form>

<!-- Phone call: -->
Friend: "What fields are on the form?"
You: "Um... there are two blank boxes and a button. I can see placeholders that say 'Name' and 'Email' inside the boxes."
Friend: "So the boxes have no actual labels? How do I know what they're for after I start typing and the placeholder disappears?"
You: "Oh... good point. That's a problem."

<!-- NOW TRY THIS: -->
<form>
  <label for="name">Name</label>
  <input type="text" id="name">

  <label for="email">Email</label>
  <input type="email" id="email">

  <button>Submit</button>
</form>

<!-- Phone call: -->
Friend: "What fields are on the form?"
You: "There's a 'Name' field, an 'Email' field, and a Submit button."
Friend: "Perfect! I can fill that out."
```

**Common Junior Mistakes:**

```html
<!-- ❌ MISTAKE 1: Using placeholder instead of label -->
<input type="text" placeholder="Enter your name">
<!-- Problem: Placeholder disappears when typing, and it's not a real label -->

<!-- ✅ FIX: Use both (label is required, placeholder is optional hint) -->
<label for="name">Name</label>
<input type="text" id="name" placeholder="First and last name">

<!-- ❌ MISTAKE 2: Forgetting required field indication -->
<label for="email">Email *</label>
<input type="email" id="email">
<!-- Problem: Asterisk is visual-only, screen reader doesn't announce "required" -->

<!-- ✅ FIX: Use required attribute + aria-label on asterisk -->
<label for="email">
  Email <abbr title="required" aria-label="required">*</abbr>
</label>
<input type="email" id="email" required>

<!-- ❌ MISTAKE 3: Error messages not associated with field -->
<label for="password">Password</label>
<input type="password" id="password">
<p class="error">Password too short</p>
<!-- Problem: Screen reader doesn't connect error to input -->

<!-- ✅ FIX: Use aria-describedby -->
<label for="password">Password</label>
<input type="password" id="password" aria-describedby="password-error" aria-invalid="true">
<p id="password-error">Password must be at least 8 characters</p>
```

**Quick Checklist for Accessible Forms:**

```
✅ Every input has a <label> with for/id connection
✅ Required fields marked with required attribute (not just *)
✅ Fieldset/legend used for radio buttons and related fields
✅ Errors connected with aria-describedby + aria-invalid
✅ Error summary shown at top after submit (for multiple errors)
✅ All form controls keyboard accessible (can tab to everything)
✅ Submit button describes action ("Sign Up", not "Submit")
✅ Help text connected with aria-describedby
```

**Analogy for a PM:**

"Form accessibility is like providing turn-by-turn navigation instead of just a map.

A map (visual form) is great if you can see it, but useless if you're blind or in a dark tunnel.

Turn-by-turn navigation (accessible form) tells you:
- Where you are ('Name field')
- What's required ('Required')
- If you made a mistake ('Invalid email format')
- How to fix it ('Use format: user@example.com')

Both get you to the destination, but one works for everyone."

</details>

### Common Mistakes

❌ **Wrong**: No label on input
```html
<input type="text" placeholder="Name">
```

✅ **Correct**: Proper label association
```html
<label for="name">Name</label>
<input type="text" id="name" placeholder="First and last name">
```

❌ **Wrong**: Error not associated
```html
<input type="email" id="email">
<p style="color: red;">Invalid email</p>
```

✅ **Correct**: Error connected with ARIA
```html
<input type="email" id="email" aria-describedby="email-error" aria-invalid="true">
<p id="email-error" role="alert">Invalid email format</p>
```

### Follow-up Questions

1. When should you use fieldset/legend vs div grouping?
2. How do you handle dynamic form validation accessibly?
3. What's the difference between `aria-describedby` and `aria-labelledby`?
4. How do you make custom form controls (like dropdowns) accessible?
5. What are best practices for multi-step forms?

### Resources

- [W3C: Form Instructions](https://www.w3.org/WAI/tutorials/forms/)
- [WebAIM: Creating Accessible Forms](https://webaim.org/techniques/forms/)
- [ARIA: Form Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
