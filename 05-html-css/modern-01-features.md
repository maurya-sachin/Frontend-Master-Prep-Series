# Modern CSS Features

> CSS custom properties, :has() selector, :is/:where, CSS layers, modern selectors, and cutting-edge CSS features.

---

## Question 1: CSS Custom Properties (CSS Variables)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain CSS custom properties. How do they differ from Sass variables? Show practical use cases.

### Answer

**CSS Custom Properties** (CSS Variables) - Native CSS variables that cascade and can be updated at runtime.

**Key Points:**

1. **Runtime Values** - Can be changed with JavaScript
2. **Cascade & Inheritance** - Follow normal CSS cascade rules
3. **Scoping** - Can be scoped to elements, not just global
4. **Theming** - Perfect for dark mode, dynamic themes
5. **Performance** - No compilation needed, work in browser

### Code Example

```css
/* =========================================== */
/* 1. BASIC CUSTOM PROPERTIES */
/* =========================================== */

:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --border-radius: 4px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

/* Fallback values */
.element {
  color: var(--text-color, #333); /* Uses #333 if --text-color undefined */
}
```

```css
/* =========================================== */
/* 2. THEMING WITH CUSTOM PROPERTIES */
/* =========================================== */

:root {
  --bg-color: white;
  --text-color: #333;
  --border-color: #ddd;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #444;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}

.card {
  border: 1px solid var(--border-color);
}
```

```js
// Toggle theme with JavaScript
document.documentElement.setAttribute('data-theme', 'dark');

// Or update specific property
document.documentElement.style.setProperty('--primary-color', 'red');
```

```css
/* =========================================== */
/* 3. SCOPED VARIABLES */
/* =========================================== */

.card {
  --card-padding: 1.5rem;
  --card-bg: white;

  padding: var(--card-padding);
  background: var(--card-bg);
}

.card--large {
  --card-padding: 2.5rem; /* Override for this variant */
}

/* Component-specific variables */
.button {
  --button-color: var(--primary-color);
  --button-hover: var(--primary-dark);

  background: var(--button-color);
}

.button:hover {
  background: var(--button-hover);
}
```

```css
/* =========================================== */
/* 4. CALCULATIONS WITH VARIABLES */
/* =========================================== */

:root {
  --base-size: 16px;
  --scale: 1.5;
}

.heading {
  font-size: calc(var(--base-size) * var(--scale)); /* 24px */
}

/* Responsive spacing */
:root {
  --spacing: clamp(1rem, 5vw, 3rem);
}

.section {
  padding: var(--spacing);
}
```

```css
/* =========================================== */
/* 5. CSS VARIABLES VS SASS VARIABLES */
/* =========================================== */

/* SASS VARIABLES (compile-time) */
$primary: #007bff;

.button {
  background: $primary; /* Compiled to #007bff */
}

/* Can't change at runtime with JS */

/* CSS VARIABLES (runtime) */
:root {
  --primary: #007bff;
}

.button {
  background: var(--primary); /* Stays as var() */
}

/* ✅ Can change with JS */
document.documentElement.style.setProperty('--primary', 'red');
```

### Common Mistakes

❌ **Wrong**: Using without var()
```css
.element {
  color: --primary-color; /* ❌ Doesn't work */
}
```

✅ **Correct**: Wrap with var()
```css
.element {
  color: var(--primary-color); /* ✅ Correct */
}
```

❌ **Wrong**: No fallback for unsupported browsers
```css
.element {
  color: var(--primary-color); /* ❌ Breaks in old browsers */
}
```

✅ **Correct**: Provide fallback
```css
.element {
  color: #007bff; /* Fallback */
  color: var(--primary-color); /* ✅ Progressive enhancement */
}
```

### Follow-up Questions
1. "Can CSS variables be used in media queries?"
2. "How do CSS variables affect performance?"
3. "What's the inheritance behavior of CSS variables?"
4. "Can you use CSS variables in @keyframes?"

### Resources
- [MDN: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Variables Guide](https://www.smashingmagazine.com/2017/04/start-using-css-custom-properties/)

---

## Question 2: Modern Selectors - :has(), :is(), :where()

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta

### Question
Explain modern CSS selectors: :has(), :is(), and :where(). What problems do they solve?

### Answer

**Modern Selectors** - New pseudo-classes that simplify complex selection patterns.

**Key Points:**

1. **:has()** - "Parent selector", style based on children
2. **:is()** - Matches any selector in list, simplifies grouping
3. **:where()** - Like :is() but zero specificity
4. **Specificity** - :is() uses highest specificity, :where() has zero
5. **Browser Support** - :has() newest, good modern browser support

### Code Example

```css
/* =========================================== */
/* 1. :has() - PARENT SELECTOR */
/* =========================================== */

/* Style form when it has an error */
form:has(.error) {
  border-color: red;
}

/* Style card based on children */
.card:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}

.card:not(:has(img)) {
  padding: 2rem; /* More padding when no image */
}

/* Proximity selector */
label:has(+ input:focus) {
  color: blue; /* Style label when next input focused */
}

/* Powerful combinations */
article:has(> h2) {
  /* Article with direct h2 child */
}

section:has(> img, > video) {
  /* Section with image OR video child */
}
```

```css
/* =========================================== */
/* 2. :is() - SELECTOR LIST */
/* =========================================== */

/* ❌ OLD WAY: Repetitive */
header a:hover,
footer a:hover,
nav a:hover {
  color: blue;
}

/* ✅ NEW WAY: :is() */
:is(header, footer, nav) a:hover {
  color: blue;
}

/* Complex selectors simplified */
:is(h1, h2, h3, h4, h5, h6) {
  font-weight: bold;
  margin-bottom: 0.5em;
}

/* Nested :is() */
article :is(h1, h2):is(.title, .heading) {
  color: blue;
}

/* Specificity: Uses highest in list */
:is(#id, .class) {
  /* Specificity: 1,0,0 (from #id) */
}
```

```css
/* =========================================== */
/* 3. :where() - ZERO SPECIFICITY */
/* =========================================== */

/* Same as :is() but specificity = 0 */
:where(h1, h2, h3, h4, h5, h6) {
  margin-bottom: 0.5em;
}

/* Easy to override */
h2 {
  margin-bottom: 1em; /* ✅ Overrides :where() */
}

/* Compare with :is() */
:is(h1, h2, h3) {
  color: blue; /* Specificity: 0,0,1 */
}

h2 {
  color: red; /* ❌ Won't override :is() without !important */
}

/* Use :where() for defaults */
:where(button, .btn) {
  padding: 0.5rem 1rem; /* Easy defaults */
  cursor: pointer;
}

button {
  padding: 1rem 2rem; /* ✅ Easily overrides */
}
```

```css
/* =========================================== */
/* 4. PRACTICAL EXAMPLES */
/* =========================================== */

/* Accordion that's open */
.accordion:has(.panel.open) {
  border-color: blue;
}

/* Table row with error */
tr:has(.error) {
  background: #ffe6e6;
}

/* Form validation states */
input:has(+ .error-message) {
  border-color: red;
}

/* Navigation active state */
nav:has(a.active) {
  background: #f0f0f0;
}

/* List with nested lists */
ul:has(> li > ul) {
  padding-left: 2rem;
}

/* Card layouts */
.card:has(> .card__image) {
  display: grid;
  grid-template-columns: 1fr 2fr;
}

.card:not(:has(> .card__image)) {
  text-align: center;
}
```

```css
/* =========================================== */
/* 5. :is() VS :where() COMPARISON */
/* =========================================== */

/* :is() - Normal specificity */
:is(.foo, #bar) {
  /* Specificity: 1,0,0 (takes #bar's specificity) */
  color: blue;
}

.foo {
  color: red; /* ❌ Won't win, lower specificity */
}

/* :where() - Zero specificity */
:where(.foo, #bar) {
  /* Specificity: 0,0,0 (always zero) */
  color: blue;
}

.foo {
  color: red; /* ✅ Wins, any specificity beats :where() */
}

/* Use :where() for default styles */
:where(a) {
  color: blue;
  text-decoration: none;
}

/* Easy to override anywhere */
nav a {
  color: white; /* ✅ Works */
}
```

### Common Mistakes

❌ **Wrong**: Assuming :has() works like jQuery :has()
```css
div:has(.child) {
  /* ❌ Not the same as jQuery's .has() */
  /* This selects divs that CONTAIN .child */
}
```

✅ **Correct**: Understand it's a parent selector
```css
div:has(> .child) {
  /* ✅ Selects div with direct .child */
}
```

### Follow-up Questions
1. "What's the browser support for :has()?"
2. "Can you use :has() with pseudo-elements?"
3. "How does :is() affect specificity calculation?"
4. "When should you use :where() over :is()?"

### Resources
- [MDN: :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [MDN: :is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is)
- [MDN: :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)

---

## Question 3: CSS Cascade Layers (@layer)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta

### Question
What are CSS Cascade Layers? How do they solve specificity problems?

### Answer

**Cascade Layers** - Control the cascade order of stylesheets independently of specificity.

**Key Points:**

1. **Control Cascade** - Layer order matters more than specificity
2. **Organization** - Organize styles into logical layers
3. **Override Control** - Later layers override earlier ones
4. **Specificity Isolation** - Specificity only matters within same layer
5. **Framework Integration** - Separate framework CSS from custom styles

### Code Example

```css
/* =========================================== */
/* 1. BASIC LAYERS */
/* =========================================== */

/* Define layer order */
@layer base, components, utilities;

/* Base layer (lowest priority) */
@layer base {
  h1 {
    font-size: 2rem;
    color: black;
  }
}

/* Components layer */
@layer components {
  .heading {
    font-size: 3rem; /* ✅ Wins over base layer */
  }
}

/* Utilities layer (highest priority) */
@layer utilities {
  .text-sm {
    font-size: 1rem !important; /* Usually don't need !important */
  }
}
```

```css
/* =========================================== */
/* 2. LAYER ORDER MATTERS */
/* =========================================== */

@layer components {
  #button {
    /* Specificity: 1,0,0 */
    background: blue;
  }
}

@layer utilities {
  .bg-red {
    /* Specificity: 0,1,0 */
    background: red; /* ✅ WINS even with lower specificity! */
  }
}

/* Layer order trumps specificity */
```

```css
/* =========================================== */
/* 3. PRACTICAL EXAMPLE */
/* =========================================== */

/* Define structure */
@layer reset, base, components, utilities;

/* Reset layer */
@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

/* Base styles */
@layer base {
  body {
    font-family: system-ui;
    line-height: 1.5;
  }

  h1, h2, h3 {
    margin-bottom: 0.5em;
  }
}

/* Components */
@layer components {
  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .card {
    padding: 1.5rem;
    border: 1px solid #ddd;
  }
}

/* Utilities (highest priority) */
@layer utilities {
  .mt-4 { margin-top: 1rem; }
  .text-center { text-align: center; }
  .hidden { display: none; }
}
```

```css
/* =========================================== */
/* 4. FRAMEWORK INTEGRATION */
/* =========================================== */

/* Framework styles in lower layer */
@layer framework {
  /* Import Bootstrap, Tailwind, etc */
  @import url('framework.css');
}

/* Your custom styles in higher layer */
@layer custom {
  .button {
    /* ✅ Automatically overrides framework */
    /* No need for high specificity or !important */
  }
}
```

### Common Mistakes

❌ **Wrong**: Relying on specificity across layers
```css
@layer base {
  #id {
    color: blue; /* High specificity */
  }
}

@layer utilities {
  .class {
    color: red; /* ✅ Still wins despite lower specificity */
  }
}
```

✅ **Correct**: Understand layer order matters most
```css
/* Order determines winner, not specificity */
@layer base, utilities;
```

### Follow-up Questions
1. "How do unlayered styles interact with layers?"
2. "Can you nest layers?"
3. "What's the browser support for @layer?"
4. "How do layers work with !important?"

### Resources
- [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Cascade Layers Explainer](https://developer.chrome.com/blog/cascade-layers/)

---

## Summary Table

| Feature | Purpose | Browser Support |
|---------|---------|-----------------|
| Custom Properties | Runtime theming | ✅ Excellent |
| :has() | Parent selector | ✅ Modern browsers |
| :is() / :where() | Simplify selectors | ✅ Excellent |
| @layer | Cascade control | ✅ Modern browsers |

---

**Completed HTML/CSS Section** - All 8 files with comprehensive Q&A!
