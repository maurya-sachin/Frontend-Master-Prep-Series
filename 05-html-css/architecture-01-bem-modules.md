# CSS Architecture

> BEM methodology, CSS modules, CSS-in-JS, preprocessors, PostCSS, and modern CSS organization strategies.

---

## Question 1: BEM Methodology

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Airbnb

### Question
What is BEM? Explain Block, Element, Modifier naming convention.

### Answer

**BEM** (Block Element Modifier) - A naming convention for CSS classes that makes code more maintainable and self-documenting.

**Key Points:**

1. **Block** - Standalone component (`.card`, `.nav`, `.button`)
2. **Element** - Part of block (`.__title`, `.__link`, `.__icon`)
3. **Modifier** - Variation of block/element (`--primary`, `--large`, `--active`)
4. **No Nesting** - Flat structure, avoids specificity wars
5. **Reusable** - Components work independently

### Code Example

```html
<!-- =========================================== -->
<!-- 1. BEM STRUCTURE -->
<!-- =========================================== -->

<!-- BLOCK: Standalone component -->
<div class="card">

  <!-- ELEMENT: Part of block -->
  <h2 class="card__title">Product Name</h2>
  <p class="card__description">Product description goes here.</p>
  <img class="card__image" src="product.jpg" alt="Product">
  <button class="card__button">Add to Cart</button>

  <!-- MODIFIER: Variation -->
  <button class="card__button card__button--primary">Buy Now</button>
</div>

<!-- MODIFIED BLOCK -->
<div class="card card--featured">
  <h2 class="card__title">Featured Product</h2>
  <p class="card__description">Special offer!</p>
</div>
```

```css
/* =========================================== */
/* 2. BEM CSS */
/* =========================================== */

/* BLOCK */
.card {
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  background: white;
}

/* ELEMENTS */
.card__title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.card__description {
  color: #666;
  margin-bottom: 1rem;
}

.card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.card__button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  cursor: pointer;
  border-radius: 4px;
}

/* MODIFIERS */
.card--featured {
  border-color: #gold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card__button--primary {
  background: #007bff;
  color: white;
}

.card__button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
```

```css
/* =========================================== */
/* 3. NAVIGATION EXAMPLE */
/* =========================================== */

/* Block */
.nav {
  display: flex;
  background: #333;
  padding: 1rem;
}

/* Elements */
.nav__logo {
  color: white;
  font-size: 1.5rem;
  margin-right: auto;
}

.nav__list {
  display: flex;
  list-style: none;
  gap: 1rem;
}

.nav__item {
  /* No additional styles needed */
}

.nav__link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

/* Modifiers */
.nav__link--active {
  background: #555;
  border-radius: 4px;
}

.nav--sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}
```

### Common Mistakes

❌ **Wrong**: Nesting elements in class names
```css
.card__body__title { /* ❌ Too deep */
  font-size: 1.5rem;
}
```

✅ **Correct**: Flat structure
```css
.card__title { /* ✅ Direct child of card */
  font-size: 1.5rem;
}
```

❌ **Wrong**: Using generic modifiers
```css
.button--1 { /* ❌ Meaningless */
  background: blue;
}
```

✅ **Correct**: Descriptive modifiers
```css
.button--primary { /* ✅ Clear purpose */
  background: blue;
}
```

### Follow-up Questions
1. "How does BEM compare to other methodologies like SMACSS?"
2. "Can you use BEM with CSS Modules?"
3. "How do you handle state in BEM?"
4. "What are the downsides of BEM?"

### Resources
- [BEM Official](https://getbem.com/)
- [BEM 101](https://css-tricks.com/bem-101/)

---

## Question 2: CSS Modules vs CSS-in-JS

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Netflix

### Question
What are CSS Modules? How do they differ from CSS-in-JS solutions?

### Answer

**CSS Modules** - Locally scoped CSS files that generate unique class names
**CSS-in-JS** - Writing CSS in JavaScript (Styled Components, Emotion)

**Key Points:**

1. **Scoping** - Both solve global namespace issues
2. **Tooling** - CSS Modules need bundler, CSS-in-JS runtime or build-time
3. **Performance** - CSS Modules = static CSS, CSS-in-JS varies
4. **Developer Experience** - Trade-offs in each approach
5. **Use Cases** - CSS Modules for traditional apps, CSS-in-JS for component libraries

### Code Example

```css
/* =========================================== */
/* 1. CSS MODULES */
/* =========================================== */

/* Button.module.css */
.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background: #007bff;
  color: white;
}

.secondary {
  background: #6c757d;
  color: white;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={styles[variant]}>
      {children}
    </button>
  );
}

// Rendered HTML:
<button class="Button_primary__a1b2c">Click me</button>
// Unique hash prevents conflicts!
```

```jsx
/* =========================================== */
/* 2. CSS-IN-JS (Styled Components) */
/* =========================================== */

import styled from 'styled-components';

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

// Usage
<Button primary>Primary</Button>
<Button>Secondary</Button>

// Generates unique class names automatically
```

```jsx
/* =========================================== */
/* 3. COMPARISON */
/* =========================================== */

/* CSS MODULES */
// ✅ Static CSS extraction
// ✅ Familiar CSS syntax
// ✅ Good performance
// ✅ No runtime overhead
// ❌ No dynamic styling (need inline styles)
// ❌ Requires bundler configuration

/* CSS-IN-JS */
// ✅ Dynamic styling with props
// ✅ Component co-location
// ✅ Theming built-in
// ✅ Dead code elimination
// ❌ Runtime overhead (unless extracted)
// ❌ Larger bundle size
// ❌ Harder to debug
```

### Common Mistakes

❌ **Wrong**: Global styles in CSS Modules
```css
/* styles.module.css */
button { /* ❌ Not scoped! */
  padding: 1rem;
}
```

✅ **Correct**: Use :global for intentional globals
```css
/* styles.module.css */
.button { /* ✅ Scoped */
  padding: 1rem;
}

:global(.legacy-button) { /* ✅ Explicitly global */
  padding: 1rem;
}
```

### Follow-up Questions
1. "What are the performance implications of CSS-in-JS?"
2. "How do CSS Modules handle composition?"
3. "What is zero-runtime CSS-in-JS?"
4. "How do you handle media queries in CSS-in-JS?"

### Resources
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Styled Components](https://styled-components.com/)

---

## Question 3: CSS Preprocessors - Sass/SCSS

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Microsoft

### Question
What are CSS preprocessors? What features do they provide?

### Answer

**CSS Preprocessors** (Sass, Less, Stylus) - Extend CSS with programming features, compile to regular CSS.

**Key Points:**

1. **Variables** - Store reusable values
2. **Nesting** - Organize related styles
3. **Mixins** - Reusable chunks of styles
4. **Functions** - Calculate values dynamically
5. **Compilation** - Transpiles to standard CSS

### Code Example

```scss
/* =========================================== */
/* 1. VARIABLES */
/* =========================================== */

// Define variables
$primary-color: #007bff;
$secondary-color: #6c757d;
$border-radius: 4px;
$spacing: 1rem;

.button {
  background: $primary-color;
  border-radius: $border-radius;
  padding: $spacing;
}

/* Compiles to: */
.button {
  background: #007bff;
  border-radius: 4px;
  padding: 1rem;
}
```

```scss
/* =========================================== */
/* 2. NESTING */
/* =========================================== */

.nav {
  background: #333;

  &__list {
    list-style: none;
  }

  &__item {
    display: inline-block;
  }

  &__link {
    color: white;

    &:hover {
      color: #007bff;
    }

    &--active {
      font-weight: bold;
    }
  }
}

/* Compiles to: */
.nav { background: #333; }
.nav__list { list-style: none; }
.nav__item { display: inline-block; }
.nav__link { color: white; }
.nav__link:hover { color: #007bff; }
.nav__link--active { font-weight: bold; }
```

```scss
/* =========================================== */
/* 3. MIXINS */
/* =========================================== */

// Define mixin
@mixin button-base {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

// Mixin with parameters
@mixin button-variant($bg-color, $text-color) {
  background: $bg-color;
  color: $text-color;

  &:hover {
    background: darken($bg-color, 10%);
  }
}

// Usage
.button-primary {
  @include button-base;
  @include button-variant(#007bff, white);
}

.button-secondary {
  @include button-base;
  @include button-variant(#6c757d, white);
}
```

```scss
/* =========================================== */
/* 4. FUNCTIONS */
/* =========================================== */

// Custom function
@function rem($pixels) {
  @return #{$pixels / 16}rem;
}

.element {
  font-size: rem(18); // 1.125rem
  padding: rem(16); // 1rem
  margin: rem(24); // 1.5rem
}

// Built-in functions
$primary: #007bff;

.button {
  background: $primary;
  border-color: darken($primary, 10%);

  &:hover {
    background: lighten($primary, 10%);
  }
}
```

### Common Mistakes

❌ **Wrong**: Over-nesting
```scss
.nav {
  .list {
    .item {
      .link {
        .icon {
          /* ❌ Too deep, high specificity */
        }
      }
    }
  }
}
```

✅ **Correct**: Limit nesting (max 3 levels)
```scss
.nav {
  .nav__link {
    &:hover { /* ✅ Shallow nesting */
      color: blue;
    }
  }
}
```

### Follow-up Questions
1. "What's the difference between Sass and SCSS?"
2. "Are preprocessors still relevant with modern CSS?"
3. "How do you handle variables in native CSS vs Sass?"
4. "What is PostCSS and how does it compare?"

### Resources
- [Sass Documentation](https://sass-lang.com/)
- [Sass Guidelines](https://sass-guidelin.es/)

---

## Summary Table

| Topic | Purpose | Best For |
|-------|---------|----------|
| BEM | Naming convention | Large teams, maintainability |
| CSS Modules | Local scoping | React/Vue apps |
| CSS-in-JS | Component styling | Component libraries, dynamic styles |
| Sass/SCSS | Enhanced CSS | Complex stylesheets, DRY code |

---

**Next Topics**: Modern CSS, Custom Properties, Container Queries
