# Accessible Names

> **Focus**: Accessibility fundamentals

---

## Question 1: What is the accessible name calculation and why does it matter?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Microsoft, Amazon

### Question
Explain how browsers calculate accessible names for elements, the priority order of different naming methods, and best practices.

### Answer

The **accessible name** is the text that assistive technologies (screen readers, voice control) use to identify an element. When multiple naming methods are present on the same element, browsers follow a strict priority order to determine which one to use.

**Accessible Name Calculation Priority (highest to lowest):**

1. **aria-labelledby** - References other element(s) by ID
2. **aria-label** - Direct text label
3. **Native label** - `<label>`, `alt`, `<caption>`, `<legend>`, etc.
4. **title** - Tooltip attribute (last resort)
5. **Placeholder** - NOT used for accessible name (only hint)

**Why it matters:**
- Screen readers announce the accessible name to identify controls
- Voice control software uses names for commands ("Click Submit")
- Wrong priority can cause confusing or incorrect announcements
- Missing names make elements unusable for assistive technology users

### Code Example

**Priority Order Demonstration:**

```html
<!-- Example 1: All naming methods present -->
<button
  id="submit"
  aria-labelledby="submitLabel"
  aria-label="Submit the form"
  title="Click to submit"
>
  Send
</button>

<span id="submitLabel">Submit Form Now</span>

<!--
Screen reader announces: "Submit Form Now"
Why? aria-labelledby has highest priority
(Even though aria-label and text content are also present)
-->

<!-- Example 2: Remove aria-labelledby -->
<button
  aria-label="Submit the form"
  title="Click to submit"
>
  Send
</button>

<!--
Screen reader announces: "Submit the form"
Why? aria-label is next in priority
(title and text content ignored)
-->

<!-- Example 3: Remove aria-label too -->
<button title="Click to submit">
  Send
</button>

<!--
Screen reader announces: "Send"
Why? Text content (native label) takes priority over title
-->

<!-- Example 4: Button with no text -->
<button title="Click to submit">
  <svg>...</svg>
</button>

<!--
Screen reader announces: "Click to submit"
Why? title is used when no other name exists
(But this is a fallback - prefer aria-label)
-->
```

**Form Inputs - Common Patterns:**

```html
<!-- ✅ GOOD: Native label (preferred) -->
<label for="email">Email Address:</label>
<input type="email" id="email">
<!-- Announces: "Email Address" -->

<!-- ✅ GOOD: aria-label (when visual label not desired) -->
<input
  type="search"
  aria-label="Search products"
  placeholder="Search..."
>
<!-- Announces: "Search products" (placeholder NOT used) -->

<!-- ✅ GOOD: aria-labelledby (combine multiple text sources) -->
<h2 id="paymentHeading">Payment Information</h2>
<label id="cardLabel" for="cardNumber">Card Number:</label>
<input
  type="text"
  id="cardNumber"
  aria-labelledby="paymentHeading cardLabel"
>
<!-- Announces: "Payment Information Card Number:" -->

<!-- ❌ WRONG: Placeholder as only label -->
<input type="email" placeholder="Enter your email">
<!-- Announces: "" (no accessible name!) -->
<!-- Problems:
  1. Placeholder disappears when typing
  2. Not used for accessible name calculation
  3. Often low contrast (hard to read)
-->

<!-- ❌ WRONG: title as primary label -->
<input type="email" title="Email Address">
<!-- Announces: "Email Address" (works, but bad practice) -->
<!-- Problems:
  1. title is last resort, not primary label
  2. Mobile users may not see tooltips
  3. Some screen readers don't announce title consistently
-->

<!-- ❌ WRONG: aria-label + visual label mismatch -->
<label for="email">Email:</label>
<input
  type="email"
  id="email"
  aria-label="Enter your email address"
>
<!-- Announces: "Enter your email address" (aria-label overrides label!) -->
<!-- Problems:
  1. Visual users see "Email"
  2. Screen reader users hear "Enter your email address"
  3. Confusing mismatch between visual and accessible name
  4. Voice control users might say "Click Email" (fails)
-->
```

**Complex Widgets - aria-labelledby:**

```html
<!-- ✅ GOOD: Combine heading + label for context -->
<div class="form-section">
  <h3 id="billingHeading">Billing Address</h3>

  <label id="streetLabel" for="street">Street:</label>
  <input
    type="text"
    id="street"
    aria-labelledby="billingHeading streetLabel"
  >
  <!-- Announces: "Billing Address Street:" -->

  <label id="cityLabel" for="city">City:</label>
  <input
    type="text"
    id="city"
    aria-labelledby="billingHeading cityLabel"
  >
  <!-- Announces: "Billing Address City:" -->
</div>

<!-- ✅ GOOD: Dynamic pricing widget -->
<div class="product-price">
  <span id="productName">Premium Headphones</span>
  <span id="price">$129.99</span>
  <span id="discount" class="sr-only">20% off, save $26</span>

  <button
    aria-labelledby="productName price discount"
    onclick="addToCart('HP-001')"
  >
    Add to Cart
  </button>
  <!-- Announces: "Premium Headphones $129.99 20% off, save $26 Add to Cart" -->
</div>

<!-- ✅ GOOD: Delete button with context -->
<table>
  <caption>Shopping Cart</caption>
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td id="product1">Headphones</td>
      <td>$129.99</td>
      <td>
        <button
          aria-labelledby="deleteLabel product1"
          onclick="removeItem(1)"
        >
          <span id="deleteLabel" class="sr-only">Remove</span>
          <svg aria-hidden="true">...</svg> <!-- X icon -->
        </button>
        <!-- Announces: "Remove Headphones" -->
      </td>
    </tr>
  </tbody>
</table>
```

**Images - alt vs aria-label vs aria-labelledby:**

```html
<!-- ✅ GOOD: Informative image with alt -->
<img
  src="product.jpg"
  alt="Wireless headphones with noise cancellation"
>
<!-- Announces: "Wireless headphones with noise cancellation" -->

<!-- ❌ WRONG: aria-label overrides alt (unnecessary) -->
<img
  src="product.jpg"
  alt="Wireless headphones with noise cancellation"
  aria-label="Headphones"
>
<!-- Announces: "Headphones" (aria-label wins, loses detail!) -->

<!-- ✅ GOOD: Decorative image (hidden from screen readers) -->
<img src="decorative-border.svg" alt="">
<!-- Announces: (nothing, image ignored) -->

<!-- Or -->
<img src="decorative-border.svg" role="presentation">
<!-- Announces: (nothing, image ignored) -->

<!-- ✅ GOOD: Image button with context -->
<button>
  <img src="delete-icon.svg" alt=""> <!-- alt="" hides image -->
  Delete
</button>
<!-- Announces: "Delete" (text content, not image) -->

<!-- ❌ WRONG: Image button with competing names -->
<button aria-label="Remove item">
  <img src="delete-icon.svg" alt="Delete"> <!-- Conflict! -->
  Delete
</button>
<!-- Announces: "Remove item" (aria-label wins) -->
<!-- Problems:
  1. Image alt="Delete" is ignored
  2. Text "Delete" is ignored
  3. Only aria-label is announced
  4. Confusing for developers maintaining code
-->
```

**Fallback Chain Example:**

```html
<!-- Test: How name is calculated with different combinations -->

<!-- Test 1: aria-labelledby (highest priority) -->
<span id="label1">Label from aria-labelledby</span>
<button
  aria-labelledby="label1"
  aria-label="Label from aria-label"
  title="Label from title"
>
  Label from text content
</button>
<!-- Result: "Label from aria-labelledby" ✅ -->

<!-- Test 2: Remove aria-labelledby -->
<button
  aria-label="Label from aria-label"
  title="Label from title"
>
  Label from text content
</button>
<!-- Result: "Label from aria-label" ✅ -->

<!-- Test 3: Remove aria-label -->
<button title="Label from title">
  Label from text content
</button>
<!-- Result: "Label from text content" ✅ -->
<!-- Note: title is ignored because text content exists -->

<!-- Test 4: Remove text content -->
<button title="Label from title">
  <svg aria-hidden="true">...</svg>
</button>
<!-- Result: "Label from title" ✅ -->
<!-- title is used as last resort -->

<!-- Test 5: No naming method -->
<button>
  <svg>...</svg> <!-- No alt, no aria-hidden -->
</button>
<!-- Result: "" (no accessible name - FAILS WCAG!) ❌ -->
```

**ARIA Hidden vs Visible Names:**

```html
<!-- ✅ GOOD: Visually hidden text for screen readers -->
<button>
  <span class="sr-only">Delete item</span>
  <svg aria-hidden="true">...</svg>
</button>
<!-- Announces: "Delete item" -->
<!-- Visual: Shows only icon -->

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

<!-- ❌ WRONG: display: none hides from screen readers -->
<button>
  <span style="display: none">Delete item</span>
  <svg>...</svg>
</button>
<!-- Announces: "" (display:none removes from accessibility tree!) -->

<!-- ❌ WRONG: visibility: hidden also hides from screen readers -->
<button>
  <span style="visibility: hidden">Delete item</span>
  <svg>...</svg>
</button>
<!-- Announces: "" (visibility:hidden removes from accessibility tree!) -->
```

**Voice Control Implications:**

```html
<!-- ✅ GOOD: Visual label matches accessible name -->
<button>Submit</button>
<!-- Visual: "Submit" -->
<!-- Screen reader: "Submit" -->
<!-- Voice command: "Click Submit" ✅ Works! -->

<!-- ❌ WRONG: Mismatch between visual and accessible name -->
<button aria-label="Submit the form">
  Send
</button>
<!-- Visual: "Send" -->
<!-- Screen reader: "Submit the form" -->
<!-- Voice command: "Click Send" ❌ Fails! -->
<!-- Voice command: "Click Submit" ❌ Might fail (ambiguous)! -->

<!-- ✅ GOOD: Add context without changing visible text -->
<button>
  <span aria-hidden="true">×</span>
  <span class="sr-only">Close dialog</span>
</button>
<!-- Visual: "×" -->
<!-- Screen reader: "Close dialog" -->
<!-- Voice command: "Click Close" ✅ Works! -->
```

<details>
<summary><strong>🔍 Deep Dive: Accessible Name Calculation Algorithm</strong></summary>

**W3C Accessible Name and Description Computation Specification:**

The browser follows a detailed algorithm to compute accessible names. Here's the step-by-step process:

**Algorithm Steps (Simplified):**

```javascript
// Conceptual implementation of accessible name calculation

function computeAccessibleName(element) {
  // Step 1: Check aria-labelledby
  if (element.hasAttribute('aria-labelledby')) {
    const ids = element.getAttribute('aria-labelledby').split(' ');
    const texts = ids.map(id => {
      const refElement = document.getElementById(id);
      if (!refElement) return '';

      // Recursively compute name of referenced element
      return computeAccessibleName(refElement);
    });

    const name = texts.join(' ').trim();
    if (name) return name;
  }

  // Step 2: Check aria-label
  if (element.hasAttribute('aria-label')) {
    const label = element.getAttribute('aria-label').trim();
    if (label) return label;
  }

  // Step 3: Check native label associations
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    // Check for <label> element
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }

    // Check if input is wrapped in <label>
    const parentLabel = element.closest('label');
    if (parentLabel) {
      // Clone and remove the input to get label text only
      const clone = parentLabel.cloneNode(true);
      clone.querySelector('input, textarea, select')?.remove();
      return clone.textContent.trim();
    }
  }

  // Step 4: Check native naming for specific elements
  if (element.tagName === 'IMG') {
    const alt = element.getAttribute('alt');
    if (alt !== null) return alt.trim(); // Even if empty
  }

  if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    // Use text content
    return getTextContent(element);
  }

  // Step 5: Check title attribute (last resort)
  if (element.hasAttribute('title')) {
    const title = element.getAttribute('title').trim();
    if (title) return title;
  }

  // Step 6: No accessible name found
  return '';
}

function getTextContent(element) {
  // Get visible text, excluding aria-hidden elements
  let text = '';

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip aria-hidden elements
      if (node.getAttribute('aria-hidden') === 'true') {
        continue;
      }

      // Recursively get text from child elements
      text += getTextContent(node);
    }
  }

  return text.trim();
}

// Test examples:
const button1 = document.querySelector('#button1');
console.log(computeAccessibleName(button1)); // "Submit Form Now"

const button2 = document.querySelector('#button2');
console.log(computeAccessibleName(button2)); // "Submit the form"
```

**Circular References (Edge Case):**

```html
<!-- ❌ WRONG: Circular aria-labelledby -->
<div id="label1" aria-labelledby="label2">Label 1</div>
<div id="label2" aria-labelledby="label1">Label 2</div>

<button aria-labelledby="label1">Click me</button>

<!--
Browser detects circular reference:
1. Compute name for button
2. Check aria-labelledby → "label1"
3. Compute name for #label1
4. Check aria-labelledby → "label2"
5. Compute name for #label2
6. Check aria-labelledby → "label1" (already visited!)
7. Break cycle, use text content
Result: "Label 1" (from #label1 text content)
-->

<script>
// Circular reference detection:
function computeAccessibleNameSafe(element, visited = new Set()) {
  // Prevent infinite loops
  if (visited.has(element)) {
    // Use text content as fallback
    return element.textContent.trim();
  }

  visited.add(element);

  if (element.hasAttribute('aria-labelledby')) {
    const ids = element.getAttribute('aria-labelledby').split(' ');
    const texts = ids.map(id => {
      const refElement = document.getElementById(id);
      if (!refElement) return '';

      // Pass visited set to detect cycles
      return computeAccessibleNameSafe(refElement, new Set(visited));
    });

    return texts.join(' ').trim();
  }

  // ... rest of algorithm
}
</script>
```

**Multiple aria-labelledby References:**

```html
<!-- ✅ GOOD: Combine multiple IDs for rich context -->
<h2 id="section">Billing Information</h2>
<span id="required" class="sr-only">required field</span>

<label id="nameLabel" for="name">Full Name:</label>
<input
  type="text"
  id="name"
  aria-labelledby="section nameLabel required"
  required
>

<!--
Calculation:
1. Get text from #section: "Billing Information"
2. Get text from #nameLabel: "Full Name:"
3. Get text from #required: "required field"
4. Concatenate: "Billing Information Full Name: required field"
Result: "Billing Information Full Name: required field"
-->

<script>
// Implementation:
function computeMultipleLabelledBy(element) {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (!labelledBy) return '';

  const ids = labelledBy.split(/\s+/).filter(id => id); // Split on whitespace

  const names = ids.map(id => {
    const ref = document.getElementById(id);
    if (!ref) {
      console.warn(`aria-labelledby references non-existent ID: ${id}`);
      return '';
    }

    return computeAccessibleName(ref);
  });

  // Join with spaces, collapse multiple spaces
  return names.join(' ').replace(/\s+/g, ' ').trim();
}
</script>
```

**Hidden Elements in Name Calculation:**

```html
<!-- Different hiding methods affect name calculation -->

<!-- Test 1: aria-hidden on referenced element -->
<span id="label1" aria-hidden="true">Hidden Label</span>
<button aria-labelledby="label1">Click</button>
<!-- Result: "Hidden Label" ✅ (aria-hidden NOT ignored in name calculation) -->

<!-- Test 2: display: none on referenced element -->
<span id="label2" style="display: none">Display None Label</span>
<button aria-labelledby="label2">Click</button>
<!-- Result: "Display None Label" ✅ (still included in name) -->

<!-- Test 3: visibility: hidden on referenced element -->
<span id="label3" style="visibility: hidden">Visibility Hidden Label</span>
<button aria-labelledby="label3">Click</button>
<!-- Result: "Visibility Hidden Label" ✅ (still included in name) -->

<!-- Test 4: Visually hidden with CSS -->
<span id="label4" class="sr-only">Visually Hidden Label</span>
<button aria-labelledby="label4">Click</button>
<!-- Result: "Visually Hidden Label" ✅ (included in name) -->

<!--
Key insight: When referenced by aria-labelledby, content is ALWAYS
included in name calculation, regardless of visual hiding method.
This allows visually hidden text to contribute to accessible names.
-->

<script>
// Browser behavior:
function computeAccessibleName(element) {
  if (element.hasAttribute('aria-labelledby')) {
    const ids = element.getAttribute('aria-labelledby').split(' ');

    return ids.map(id => {
      const ref = document.getElementById(id);
      if (!ref) return '';

      // IMPORTANT: Even if ref is aria-hidden="true", display:none,
      // or visibility:hidden, its text content IS included when
      // explicitly referenced by aria-labelledby

      return getTextContentIncludingHidden(ref);
    }).join(' ').trim();
  }

  // For non-referenced content, aria-hidden elements are excluded
  return getTextContent(element);
}

function getTextContentIncludingHidden(element) {
  // Includes text even if element is hidden
  return element.textContent.trim();
}

function getTextContent(element) {
  // Excludes aria-hidden elements (normal traversal)
  let text = '';

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip aria-hidden (not referenced by aria-labelledby)
      if (node.getAttribute('aria-hidden') === 'true') continue;

      text += getTextContent(node);
    }
  }

  return text.trim();
}
</script>
```

**Native Semantics Override:**

```html
<!-- ARIA can override native semantics -->

<!-- Native button with text -->
<button id="btn1">Submit</button>
<!-- Name: "Submit" (native text content) -->

<!-- Override with aria-label -->
<button id="btn2" aria-label="Send Form">Submit</button>
<!-- Name: "Send Form" (aria-label overrides text content) -->

<!-- Native image with alt -->
<img id="img1" src="icon.png" alt="Settings icon">
<!-- Name: "Settings icon" (native alt attribute) -->

<!-- Override with aria-label -->
<img id="img2" src="icon.png" alt="Settings icon" aria-label="Configure">
<!-- Name: "Configure" (aria-label overrides alt) -->

<!-- Input with label -->
<label for="email">Email:</label>
<input id="email" type="email">
<!-- Name: "Email:" (native label association) -->

<!-- Override with aria-label -->
<label for="email2">Email:</label>
<input id="email2" type="email" aria-label="Work Email">
<!-- Name: "Work Email" (aria-label overrides label) -->

<!--
Lesson: ARIA attributes take precedence over native semantics.
Use with caution - can cause mismatches between visual and accessible names.
-->
```

**Performance Considerations:**

```javascript
// Name calculation can be expensive

// Scenario 1: Deep aria-labelledby chain
<span id="l1" aria-labelledby="l2">Level 1</span>
<span id="l2" aria-labelledby="l3">Level 2</span>
<span id="l3" aria-labelledby="l4">Level 3</span>
<span id="l4">Level 4</span>

<button aria-labelledby="l1">Click</button>

// Browser must traverse:
// button → l1 → l2 → l3 → l4 (5 lookups)
// Result: "Level 4"

// Benchmark:
console.time('name-calculation-deep');
for (let i = 0; i < 1000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('name-calculation-deep'); // ~15ms

// Scenario 2: Direct aria-label
<button aria-label="Click">Click</button>

console.time('name-calculation-direct');
for (let i = 0; i < 1000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('name-calculation-direct'); // ~2ms

// Lesson: aria-label is faster than aria-labelledby chains
// Use aria-labelledby only when concatenating multiple sources is needed
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Voice Control Failing Due to Name Mismatches</strong></summary>

**Scenario**: You're supporting a SaaS dashboard used by enterprise clients. Several users who rely on voice control software (Dragon NaturallySpeaking, Voice Control on macOS) report that voice commands aren't working: "I say 'Click Save' but nothing happens", "The delete buttons don't respond to voice commands". Your support team receives **15-20 tickets per week** about this issue.

**Production Metrics (Before Fix):**
- Voice control failure rate: 34%
- Support tickets (voice control issues): 18/week
- User frustration incidents: 25/week
- Task completion time (voice users): 3.2x longer than sighted mouse users
- Accessibility compliance rating: 2.8/5.0
- Legal complaints (ADA): 2 in past 6 months

**The Problem Code:**

```html
<!-- ❌ BAD: Mismatched visual and accessible names -->

<!-- Problem 1: aria-label doesn't match visible text -->
<button
  class="btn-primary"
  aria-label="Save changes to document"
  onclick="saveDocument()"
>
  Save
</button>

<!--
Visual users see: "Save"
Screen readers announce: "Save changes to document"
Voice command: "Click Save" ❌ Fails!
Voice command: "Click Save changes" ❌ Fails (ambiguous)!
-->

<!-- Problem 2: Icon buttons with missing context -->
<button class="icon-btn" onclick="deleteItem(123)">
  <svg class="icon">
    <use xlink:href="#trash-icon"></use>
  </svg>
</button>

<!--
Visual users see: 🗑️ (trash icon)
Screen readers announce: "" (no accessible name!)
Voice command: "Click Delete" ❌ Fails (no name to match)!
-->

<!-- Problem 3: Inconsistent naming across similar buttons -->
<div class="item-list">
  <div class="item">
    <span>Report Q1.pdf</span>
    <button aria-label="Delete Report Q1.pdf">×</button>
  </div>
  <div class="item">
    <span>Report Q2.pdf</span>
    <button aria-label="Remove Report Q2.pdf">×</button>
  </div>
  <div class="item">
    <span>Report Q3.pdf</span>
    <button aria-label="Delete item Report Q3.pdf">×</button>
  </div>
</div>

<!--
Visual users see: × × × (all look the same)
Screen readers announce different names for each
Voice command: "Click Delete" ❌ Fails (multiple matches, inconsistent names)!
-->

<!-- Problem 4: aria-labelledby with hidden text -->
<span id="actionLabel" style="display: none">Submit form</span>
<button aria-labelledby="actionLabel">
  Go
</button>

<!--
Visual users see: "Go"
Screen readers announce: "Submit form"
Voice command: "Click Go" ❌ Fails!
Voice command: "Click Submit" ❌ May fail (not visible)!
-->
```

**Debugging Process:**

**Step 1: Reproduce with Voice Control Software**

Tested with Dragon NaturallySpeaking and macOS Voice Control:

```
Test 1: "Click Save" on Save button
Expected: Button activated
Actual: "No matching element found"
Reason: Accessible name is "Save changes to document", not "Save"

Test 2: "Click Delete" on delete icon buttons
Expected: Delete button activated
Actual: "No matching element found"
Reason: Buttons have no accessible name

Test 3: "Show numbers" (Voice Control grid mode)
Expected: Numbers overlay all interactive elements
Actual: Some buttons missing numbers
Reason: Elements without accessible names are not recognized as actionable

Test 4: "Click number 5" on delete button
Expected: Button activated
Actual: Works! (but inefficient - user must use grid numbers instead of semantic names)
```

**Step 2: Accessibility Audit**

Used Chrome DevTools and axe extension:

```javascript
// Scan for accessible name issues

// Issue 1: Buttons without names
const buttons = document.querySelectorAll('button');
const buttonsWithoutNames = Array.from(buttons).filter(btn => {
  const name = computeAccessibleName(btn);
  return !name || name.trim() === '';
});

console.log(`Buttons without accessible names: ${buttonsWithoutNames.length}`);
// Found: 12 buttons (all icon buttons)

// Issue 2: Name/visible text mismatches
const mismatches = Array.from(buttons).filter(btn => {
  const accessibleName = computeAccessibleName(btn);
  const visibleText = btn.textContent.trim();

  // Check if accessible name starts with visible text
  // (Voice control matches on beginning of name)
  return visibleText && !accessibleName.toLowerCase().startsWith(visibleText.toLowerCase());
});

console.log(`Buttons with name/text mismatches: ${mismatches.length}`);
// Found: 8 buttons

// Issue 3: Inconsistent naming patterns
const deleteButtons = document.querySelectorAll('[onclick*="delete"]');
const deleteNames = Array.from(deleteButtons).map(btn => computeAccessibleName(btn));
console.log('Delete button names:', deleteNames);
// Found: ["Delete Report Q1.pdf", "Remove Report Q2.pdf", "Delete item Report Q3.pdf"]
// Problem: Inconsistent verbs (Delete vs Remove vs Delete item)
```

**Step 3: Implement Consistent, Accessible Naming**

```html
<!-- ✅ FIXED: Proper accessible names for all elements -->

<!-- Fix 1: Match aria-label to visible text (or remove aria-label) -->
<button
  class="btn-primary"
  onclick="saveDocument()"
>
  Save
</button>

<!--
Visual: "Save"
Accessible name: "Save" (from text content)
Voice command: "Click Save" ✅ Works!

Alternative with context (if needed):
-->
<button
  class="btn-primary"
  onclick="saveDocument()"
  aria-label="Save"
  title="Save changes to document"
>
  Save
</button>
<!--
Visual: "Save"
Accessible name: "Save" (aria-label matches visible text)
Tooltip: "Save changes to document" (extra context on hover)
Voice command: "Click Save" ✅ Works!
-->

<!-- Fix 2: Icon buttons with visible context -->
<button
  class="icon-btn"
  onclick="deleteItem(123)"
  aria-label="Delete"
>
  <span class="sr-only">Delete</span>
  <svg aria-hidden="true" class="icon">
    <use xlink:href="#trash-icon"></use>
  </svg>
</button>

<!--
Visual: 🗑️ (but screen magnification shows "Delete" on hover/focus)
Accessible name: "Delete"
Voice command: "Click Delete" ✅ Works!
-->

<!-- Fix 3: Consistent naming with dynamic context -->
<div class="item-list">
  <div class="item">
    <span id="file1">Report Q1.pdf</span>
    <button
      aria-labelledby="deleteLabel file1"
      onclick="deleteItem(1)"
    >
      <span id="deleteLabel" class="sr-only">Delete</span>
      <svg aria-hidden="true">...</svg>
    </button>
    <!-- Accessible name: "Delete Report Q1.pdf" -->
  </div>

  <div class="item">
    <span id="file2">Report Q2.pdf</span>
    <button
      aria-labelledby="deleteLabel file2"
      onclick="deleteItem(2)"
    >
      <span id="deleteLabel" class="sr-only">Delete</span>
      <svg aria-hidden="true">...</svg>
    </button>
    <!-- Accessible name: "Delete Report Q2.pdf" -->
  </div>

  <div class="item">
    <span id="file3">Report Q3.pdf</span>
    <button
      aria-labelledby="deleteLabel file3"
      onclick="deleteItem(3)"
    >
      <span id="deleteLabel" class="sr-only">Delete</span>
      <svg aria-hidden="true">...</svg>
    </button>
    <!-- Accessible name: "Delete Report Q3.pdf" -->
  </div>
</div>

<!--
Visual: × × × (consistent icons)
Accessible names:
  - "Delete Report Q1.pdf"
  - "Delete Report Q2.pdf"
  - "Delete Report Q3.pdf"

Voice commands:
- "Click Delete Report Q1" ✅ Works! (unique match)
- "Click Delete Report Q2" ✅ Works!
- "Show numbers" then "Click number 5" ✅ Works!
-->

<!-- Fix 4: Avoid hidden text mismatches -->
<button onclick="submitForm()">
  Submit
</button>

<!--
Visual: "Submit"
Accessible name: "Submit" (from text content)
Voice command: "Click Submit" ✅ Works!

If extra context needed:
-->
<button
  onclick="submitForm()"
  title="Submit form and proceed to next step"
>
  Submit
</button>

<!--
Visual: "Submit"
Accessible name: "Submit"
Tooltip (hover): "Submit form and proceed to next step"
Voice command: "Click Submit" ✅ Works!
-->

<!-- Fix 5: Form labels matching inputs -->
<label for="email">Email:</label>
<input
  type="email"
  id="email"
  autocomplete="email"
>

<!--
Visual: "Email:"
Accessible name: "Email:" (from label)
Voice command: "Click Email" ✅ Works!
(Voice control can focus inputs by label name)
-->

<!-- DON'T add aria-label that differs from visible label -->
```

**Production Metrics (After Fix):**

```javascript
// Before optimization:
// - Voice control failure rate: 34%
// - Support tickets: 18/week
// - Task completion time (voice users): 3.2x longer
// - Accessibility rating: 2.8/5.0
// - Legal complaints: 2 in 6 months

// After optimization:
// - Voice control failure rate: 2% ✅ (94% reduction!)
// - Support tickets: 1/week ✅ (94% reduction!)
// - Task completion time (voice users): 1.1x ✅ (66% faster!)
// - Accessibility rating: 4.7/5.0 ✅ (68% improvement!)
// - Legal complaints: 0 ✅
// - User satisfaction (voice users): +92%
// - Productivity gain (voice users): +185%

// Voice command success rates:
// - "Click Save": 98% (was 0%)
// - "Click Delete": 96% (was 0%)
// - "Click Delete Report Q1": 99% (was N/A - no unique names)
// - Overall command accuracy: 97% (was 66%)

// Additional benefits:
// - Reduced support costs: $3,200/month
// - Avoided ADA lawsuits (estimated savings: $50,000+)
// - Expanded user base (voice control users)
// - Improved brand reputation
// - WCAG 2.1 AA compliant
```

**User Feedback After Fix:**

```
User A (Dragon NaturallySpeaking):
"Finally! I can use voice commands reliably. Before, I had to use
the mouse grid for everything, which was painfully slow. Now I can
just say 'Click Save' and it works every time."

User B (macOS Voice Control):
"The consistency is a game-changer. All the delete buttons respond
to 'Click Delete' now. I can actually be productive."

User C (Voice Control + Screen Reader):
"As someone who uses both voice control and a screen reader, the
matching names are perfect. No more confusion between what I hear
and what voice commands work."
```

**Key Lessons:**

1. **Match accessible names to visible text** - Critical for voice control
2. **Consistent naming patterns** - Same action = same verb across all instances
3. **Don't over-describe with aria-label** - Visible text is often enough
4. **Icon buttons need visible text** - Use `.sr-only` spans or aria-label that matches expected voice command
5. **Test with actual voice control software** - Automated tools won't catch voice control issues

</details>

<details>
<summary><strong>⚖️ Trade-offs: Naming Methods</strong></summary>

| Method | When to Use | Pros | Cons |
|--------|-------------|------|------|
| **aria-labelledby** | Combine multiple text sources | Most flexible, can reference any element(s) | More complex, requires IDs |
| **aria-label** | Icon buttons, visual label not desired | Simple, doesn't require separate element | Can mismatch visible text |
| **Native label** (`<label>`, `alt`, etc.) | Whenever possible (preferred) | Best compatibility, matches visual | Limited to specific elements |
| **title** | Tooltips, last resort only | Universally supported | Inconsistent screen reader support, mobile issues |
| **Placeholder** | Hints only (never for labels) | Useful for examples | NOT used for accessible name, disappears |

**Performance Comparison:**

```javascript
// Benchmark: Name calculation speed

// Test 1: aria-label (fastest)
<button aria-label="Submit">Send</button>

console.time('aria-label');
for (let i = 0; i < 10000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('aria-label'); // ~5ms

// Test 2: Text content (fast)
<button>Submit</button>

console.time('text-content');
for (let i = 0; i < 10000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('text-content'); // ~8ms

// Test 3: aria-labelledby (moderate)
<span id="label">Submit</span>
<button aria-labelledby="label"></button>

console.time('aria-labelledby-single');
for (let i = 0; i < 10000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('aria-labelledby-single'); // ~15ms

// Test 4: aria-labelledby multiple (slower)
<span id="l1">Submit</span>
<span id="l2">Form</span>
<span id="l3">Now</span>
<button aria-labelledby="l1 l2 l3"></button>

console.time('aria-labelledby-multiple');
for (let i = 0; i < 10000; i++) {
  computeAccessibleName(button);
}
console.timeEnd('aria-labelledby-multiple'); // ~35ms

// Lesson: aria-label is fastest, but use native methods when possible
// Performance difference negligible for normal use (microseconds per element)
```

**Voice Control Compatibility:**

```javascript
// Voice control software matches on BEGINNING of accessible name

// ✅ GOOD: Accessible name starts with visible text
<button>Save</button>
<!-- Visual: "Save" -->
<!-- Name: "Save" -->
<!-- Voice: "Click Save" ✅ Works! -->

<button aria-label="Save changes">Save</button>
<!-- Visual: "Save" -->
<!-- Name: "Save changes" -->
<!-- Voice: "Click Save" ✅ Works! (matches beginning) -->

// ❌ BAD: Accessible name doesn't start with visible text
<button aria-label="Submit the form">Save</button>
<!-- Visual: "Save" -->
<!-- Name: "Submit the form" -->
<!-- Voice: "Click Save" ❌ Fails! (no match) -->
<!-- Voice: "Click Submit" ❌ May fail! (not visible) -->
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Accessible Names</strong></summary>

**Simple Explanation:**

Imagine every button, link, and input field has a "nametag" that assistive technologies read. The accessible name is that nametag.

When you use multiple naming methods (like both a `<label>` and `aria-label`), the browser picks ONE based on priority:

**Priority (highest to lowest):**
1. **aria-labelledby** - "Use the text from THIS other element"
2. **aria-label** - "Here's a custom nametag"
3. **Native label** - The regular `<label>` element
4. **title** - Tooltip text (last resort)

**Code Example:**

```html
<!-- Simple button - uses text content -->
<button>Save</button>
<!-- Nametag: "Save" ✅ -->

<!-- Button with aria-label -->
<button aria-label="Save changes">Save</button>
<!-- Nametag: "Save changes" (aria-label wins!) -->

<!-- Button with aria-labelledby -->
<span id="myLabel">Submit Form</span>
<button aria-labelledby="myLabel" aria-label="Save changes">Save</button>
<!-- Nametag: "Submit Form" (aria-labelledby beats aria-label!) -->
```

**Analogy for a PM:**

"Think of accessible names like contact names in your phone:

- **aria-labelledby**: 'Use the name from my contacts app' (references another source)
- **aria-label**: 'Use this nickname I created' (custom override)
- **Native label**: 'Use their real name' (default, proper way)
- **title**: 'Use their email address' (last resort, not ideal)

If you set a nickname (`aria-label`), your phone shows the nickname instead of the real name. If you link to your contacts app (`aria-labelledby`), it uses that contact's name.

The same happens with buttons - browsers pick the 'name' in priority order."

**Visual Example:**

```javascript
// ❌ MISTAKE: Mismatch between visual and accessible name
<button aria-label="Submit the form">
  Save
</button>

// User sees: "Save"
// Screen reader says: "Submit the form"
// Voice control user says: "Click Save" ❌ Doesn't work!
// Why? Accessible name is "Submit the form", not "Save"

// ✅ CORRECT: Match visible text
<button>Save</button>

// User sees: "Save"
// Screen reader says: "Save"
// Voice control user says: "Click Save" ✅ Works!
```

</details>

### Common Mistakes

❌ **Wrong**: aria-label differs from visible text
```html
<button aria-label="Submit the form">Save</button>
<!-- Voice control fails - mismatch -->
```

✅ **Correct**: Match visible text
```html
<button>Save</button>
<!-- Or if context needed: -->
<button aria-label="Save" title="Save changes to document">Save</button>
```

❌ **Wrong**: Using placeholder as label
```html
<input type="email" placeholder="Enter email">
<!-- No accessible name! -->
```

✅ **Correct**: Use proper label
```html
<label for="email">Email:</label>
<input type="email" id="email" placeholder="name@example.com">
```

❌ **Wrong**: Icon button without name
```html
<button onclick="delete()">
  <svg>...</svg>
</button>
<!-- No accessible name - unusable! -->
```

✅ **Correct**: Add accessible name
```html
<button onclick="delete()" aria-label="Delete">
  <svg aria-hidden="true">...</svg>
</button>
```

### Follow-up Questions

1. **Can aria-labelledby reference multiple elements?**
   - Yes, space-separated IDs: `aria-labelledby="id1 id2 id3"`
   - Browser concatenates text from each element in order

2. **What if aria-labelledby references a non-existent ID?**
   - Browser skips that ID, falls back to next priority method
   - May result in no accessible name if no fallbacks exist

3. **Should I use aria-label or aria-labelledby for forms?**
   - Prefer native `<label>` for best compatibility
   - Use `aria-labelledby` when combining multiple text sources
   - Use `aria-label` only when visual label not desired

### Resources

- [W3C: Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/)
- [MDN: aria-labelledby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby)
- [MDN: aria-label](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)