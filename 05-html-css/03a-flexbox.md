# Flexbox Layout

> Master CSS Flexbox for one-dimensional layouts

---

## Question 1: Flexbox Fundamentals - When and How to Use It

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Uber, Airbnb

### Question
Explain Flexbox. What problems does it solve? Explain main axis, cross axis, and common flex properties.

### Answer

**Flexbox** is a one-dimensional layout method for arranging items in rows or columns. Items flex (grow/shrink) to fill available space.

**Key Points:**

1. **One-Dimensional Layout** - Works on single axis (row OR column), perfect for components
2. **Content-Based Sizing** - Items size based on content and available space
3. **Alignment Control** - Easy centering and alignment in both directions
4. **Order Control** - Visual order independent of DOM order
5. **Responsive by Default** - Items automatically adjust to container size

### Code Example

```css
/* =========================================== */
/* 1. FLEXBOX CONTAINER PROPERTIES */
/* =========================================== */

.container {
  display: flex; /* or inline-flex */

  /* Main axis direction */
  flex-direction: row; /* default: → left to right */
  /* row-reverse: ← right to left */
  /* column: ↓ top to bottom */
  /* column-reverse: ↑ bottom to top */

  /* Wrap behavior */
  flex-wrap: nowrap; /* default: single line */
  /* wrap: multi-line, top to bottom */
  /* wrap-reverse: multi-line, bottom to top */

  /* Shorthand for direction + wrap */
  flex-flow: row wrap; /* direction wrap */
}

/*
MAIN AXIS vs CROSS AXIS:
========================
flex-direction: row
Main axis:  →  (horizontal)
Cross axis: ↓  (vertical)

flex-direction: column
Main axis:  ↓  (vertical)
Cross axis: →  (horizontal)
*/
```

**Alignment Properties:**

```css
/* =========================================== */
/* 2. ALIGNMENT ON MAIN AXIS */
/* =========================================== */

.container {
  /* justify-content: align items on MAIN axis */
  justify-content: flex-start; /* default: items at start */
  /* flex-end: items at end */
  /* center: items centered */
  /* space-between: first and last at edges, equal space between */
  /* space-around: equal space around each item */
  /* space-evenly: equal space between and around */
}

/*
VISUAL COMPARISON:
==================

flex-start:
┌──────────────────┐
│ [1][2][3]        │
└──────────────────┘

flex-end:
┌──────────────────┐
│        [1][2][3] │
└──────────────────┘

center:
┌──────────────────┐
│    [1][2][3]     │
└──────────────────┘

space-between:
┌──────────────────┐
│[1]     [2]    [3]│
└──────────────────┘

space-around:
┌──────────────────┐
│ [1]   [2]   [3]  │
└──────────────────┘

space-evenly:
┌──────────────────┐
│  [1]  [2]  [3]   │
└──────────────────┘
*/
```

```css
/* =========================================== */
/* 3. ALIGNMENT ON CROSS AXIS */
/* =========================================== */

.container {
  /* align-items: align items on CROSS axis (single line) */
  align-items: stretch; /* default: fill container height */
  /* flex-start: align to start of cross axis */
  /* flex-end: align to end of cross axis */
  /* center: center on cross axis */
  /* baseline: align text baselines */

  /* align-content: align multi-line rows on CROSS axis */
  align-content: stretch; /* default */
  /* Same values as justify-content */
  /* Only works with flex-wrap: wrap */
}
```

**Flex Item Properties:**

```css
/* =========================================== */
/* 4. FLEX ITEM PROPERTIES */
/* =========================================== */

.item {
  /* flex-grow: ability to grow (take extra space) */
  flex-grow: 0; /* default: don't grow */
  /* 1: can grow, shares space with other growing items */
  /* 2: grows twice as much as items with flex-grow: 1 */

  /* flex-shrink: ability to shrink when space is limited */
  flex-shrink: 1; /* default: can shrink */
  /* 0: won't shrink below flex-basis */

  /* flex-basis: base size before growing/shrinking */
  flex-basis: auto; /* default: content size */
  /* 200px: fixed base size */
  /* 0: ignore content size */

  /* SHORTHAND */
  flex: 0 1 auto; /* grow shrink basis (default) */
  flex: 1; /* Common: 1 1 0 (equal size items) */
  flex: auto; /* Same as: 1 1 auto */
  flex: none; /* Same as: 0 0 auto (fixed size) */

  /* align-self: override align-items for this item */
  align-self: auto; /* default: inherit from align-items */
  /* flex-start | flex-end | center | baseline | stretch */

  /* order: visual order (doesn't change DOM) */
  order: 0; /* default: source order */
  /* -1: appears first, 1: appears last */
}
```

**Practical Examples:**

```html
<!-- =========================================== -->
<!-- 5. PERFECT CENTERING -->
<!-- =========================================== -->

<div class="center-box">
  <div class="content">Perfectly Centered!</div>
</div>
```

```css
.center-box {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center;     /* Center vertically */
  min-height: 100vh;       /* Full viewport height */
}

/* Most famous Flexbox use case! */
```

```html
<!-- =========================================== -->
<!-- 6. NAVIGATION BAR -->
<!-- =========================================== -->

<nav class="navbar">
  <div class="logo">Logo</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <button class="login-btn">Login</button>
</nav>
```

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Logo left, nav middle, button right */
  padding: 1rem 2rem;
  background: #333;
  color: white;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
}
```

```html
<!-- =========================================== -->
<!-- 7. EQUAL HEIGHT CARDS -->
<!-- =========================================== -->

<div class="card-container">
  <div class="card">
    <h3>Card 1</h3>
    <p>Short content</p>
  </div>
  <div class="card">
    <h3>Card 2</h3>
    <p>This card has much longer content that spans multiple lines, making it taller than the others.</p>
  </div>
  <div class="card">
    <h3>Card 3</h3>
    <p>Medium length content here.</p>
  </div>
</div>
```

```css
.card-container {
  display: flex;
  gap: 1.5rem;
}

.card {
  flex: 1; /* ✅ Equal width AND equal height automatically! */
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* Flexbox magic: all cards same height as tallest */
```

```html
<!-- =========================================== -->
<!-- 8. SIDEBAR LAYOUT -->
<!-- =========================================== -->

<div class="layout">
  <aside class="sidebar">Sidebar (fixed width)</aside>
  <main class="main-content">Main content (fills remaining space)</main>
</div>
```

```css
.layout {
  display: flex;
  min-height: 100vh;
  gap: 0; /* No gap */
}

.sidebar {
  flex-basis: 250px; /* Fixed width */
  flex-shrink: 0;     /* Never shrink below 250px */
  flex-grow: 0;       /* Don't grow */
  background: #f5f5f5;
  padding: 1rem;
}

/* Shorthand: flex: 0 0 250px */

.main-content {
  flex: 1; /* Take all remaining space */
  padding: 2rem;
}
```

```html
<!-- =========================================== -->
<!-- 9. HOLY GRAIL HEADER -->
<!-- =========================================== -->

<header class="header">
  <div class="logo">Logo</div>
  <nav class="nav">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Services</a>
  </nav>
  <div class="actions">
    <button>Sign Up</button>
  </div>
</header>
```

```css
.header {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.logo {
  flex-shrink: 0; /* Don't shrink */
}

.nav {
  flex: 1; /* Take remaining space, pushes .actions to right */
  display: flex;
  gap: 1rem;
  justify-content: center; /* Center nav items */
}

.actions {
  flex-shrink: 0;
}
```

```css
/* =========================================== */
/* 10. RESPONSIVE FLEXBOX */
/* =========================================== */

.responsive-cards {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping */
  gap: 1rem;
}

.card {
  flex: 1 1 300px; /* Grow, shrink, min 300px */
  /* Automatically wraps to new line if < 300px */
}

/* On small screens: stacks vertically
   On large screens: multiple columns */
```

### Common Mistakes

❌ **Wrong**: Forgetting flex container only affects direct children
```html
<div class="container" style="display: flex;">
  <div class="wrapper">
    <div class="item">I'm NOT a flex item!</div>
  </div>
</div>
<!-- Only .wrapper is a flex item, not .item -->
```

✅ **Correct**: Apply flex to correct parent
```html
<div class="container">
  <div class="wrapper" style="display: flex;">
    <div class="item">I AM a flex item!</div>
  </div>
</div>
```

❌ **Wrong**: Using width on flex items (can cause confusion)
```css
.item {
  flex: 1;
  width: 300px; /* ❌ Conflicts with flex: 1 */
}
```

✅ **Correct**: Use flex-basis for size
```css
.item {
  flex: 0 0 300px; /* ✅ Clear intention: fixed 300px */
}
```

### Follow-up Questions
1. "What's the difference between flex: 1 and flex: auto?"
2. "How does flex-basis interact with width/height?"
3. "What's the difference between space-around and space-evenly?"
4. "Can you use margin: auto in flex containers?"

### Resources
- [MDN: Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [CSS Tricks: Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Flexbox Froggy](https://flexboxfroggy.com/)

---

## Question 2: CSS Grid - Two-Dimensional Layouts

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain CSS Grid. How does it differ from Flexbox? Demonstrate grid template areas and common patterns.

### Answer

**CSS Grid** is a two-dimensional layout system for rows AND columns simultaneously. More powerful than Flexbox for complex layouts.

**Key Points:**

1. **Two-Dimensional** - Controls rows AND columns at same time
2. **Layout-First** - Define structure first, place items second
3. **Explicit Placement** - Precise control over item positioning
4. **Named Areas** - Semantic grid-template-areas for readable layouts
5. **Responsive Built-in** - Auto-fit/auto-fill for responsive grids without media queries

### Code Example

```css
/* =========================================== */
/* 1. BASIC GRID SETUP */
/* =========================================== */

.container {
  display: grid; /* or inline-grid */

  /* Define columns */
  grid-template-columns: 200px 200px 200px; /* 3 columns, fixed width */
  grid-template-columns: 1fr 1fr 1fr; /* 3 equal columns (fr = fraction) */
  grid-template-columns: repeat(3, 1fr); /* Shorthand */
  grid-template-columns: 200px 1fr 200px; /* Fixed, fluid, fixed */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive! */

  /* Define rows */
  grid-template-rows: 100px auto 100px; /* Header, content, footer */
  grid-template-rows: repeat(3, 200px); /* 3 rows, 200px each */

  /* Gaps (gutters) */
  gap: 1rem; /* Both row and column gap */
  row-gap: 1rem;
  column-gap: 2rem;
}

/*
FR UNIT (fraction):
===================
1fr = 1 part of available space
2fr = 2 parts of available space

Example:
grid-template-columns: 1fr 2fr 1fr;
└─ 25% ─┘─ 50% ─┘─ 25% ─┘
*/
```

**Grid Item Placement:**

```css
/* =========================================== */
/* 2. ITEM PLACEMENT (LINE NUMBERS) */
/* =========================================== */

.item {
  /* By line numbers (1-based indexing) */
  grid-column-start: 1;
  grid-column-end: 3; /* Spans columns 1-2 */

  /* Shorthand */
  grid-column: 1 / 3; /* start / end */
  grid-column: 1 / span 2; /* start / span count */
  grid-column: 1 / -1; /* start to end (-1 = last line) */

  /* Rows */
  grid-row: 1 / 3;
  grid-row: 2 / span 2;

  /* Both in one */
  grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
}

/*
GRID LINE NUMBERS:
==================
    1       2       3       4
1   ┌───────┬───────┬───────┐
    │ Cell  │ Cell  │ Cell  │
2   ├───────┼───────┼───────┤
    │ Cell  │ Cell  │ Cell  │
3   ├───────┼───────┼───────┤
    │ Cell  │ Cell  │ Cell  │
4   └───────┴───────┴───────┘

Line numbers start at 1
Negative numbers count from end (-1 = last line)
*/
```

**Grid Template Areas (Most Readable!):**

```css
/* =========================================== */
/* 3. NAMED GRID AREAS */
/* =========================================== */

.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

/* Place items in named areas */
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }

/*
VISUAL LAYOUT:
==============
┌──────────────────────────────┐
│          header              │
├──────┬──────────────┬────────┤
│      │              │        │
│sidebar│    main     │ aside  │
│      │              │        │
├──────┴──────────────┴────────┤
│          footer              │
└──────────────────────────────┘

Very readable and maintainable!
*/
```

**Common Patterns:**

```html
<!-- =========================================== -->
<!-- 4. RESPONSIVE CARD GRID (Auto-fit) -->
<!-- =========================================== -->

<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/*
auto-fit: Fit as many columns as possible
minmax(300px, 1fr): Min 300px, max equal width

RESPONSIVE BEHAVIOR:
====================
1200px wide: [Card][Card][Card][Card]
900px wide:  [Card][Card][Card]
600px wide:  [Card][Card]
300px wide:  [Card]

No media queries needed!
*/
```

```css
/* =========================================== */
/* 5. MAGAZINE/MASONRY LAYOUT */
/* =========================================== */

.magazine {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px; /* Each row 200px */
  gap: 1rem;
}

/* Featured article (spans 2x2) */
.feature {
  grid-column: span 2;
  grid-row: span 2;
}

/* Small item (1x1) */
.small {
  grid-column: span 1;
  grid-row: span 1;
}

/* Wide item (2x1) */
.wide {
  grid-column: span 2;
  grid-row: span 1;
}

/*
VISUAL RESULT:
==============
┌───────┬───────┬───┬───┐
│       │       │ S │ S │
│Feature│Feature│───┼───┤
│       │       │ S │ S │
├───────┴───────┼───┴───┤
│     Wide      │ Small │
└───────────────┴───────┘
*/
```

```css
/* =========================================== */
/* 6. DASHBOARD LAYOUT */
/* =========================================== */

.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12-column grid */
  gap: 1.5rem;
  padding: 1.5rem;
}

.stats {
  grid-column: span 3; /* Takes 3 columns */
}

.chart {
  grid-column: span 9; /* Takes 9 columns */
}

.sidebar {
  grid-column: span 4;
  grid-row: span 2;
}

/* Responsive version */
@media (max-width: 768px) {
  .stats,
  .chart,
  .sidebar {
    grid-column: span 12; /* Full width on mobile */
  }
}
```

```css
/* =========================================== */
/* 7. CENTERING WITH GRID */
/* =========================================== */

.center-grid {
  display: grid;
  place-items: center; /* Shorthand: align-items + justify-items */
  min-height: 100vh;
}

/* Equivalent to */
.center-grid-explicit {
  display: grid;
  align-items: center;    /* Vertical */
  justify-items: center;  /* Horizontal */
  min-height: 100vh;
}
```

**Auto-fit vs Auto-fill:**

```css
/* =========================================== */
/* 8. AUTO-FIT VS AUTO-FILL */
/* =========================================== */

/* auto-fit: Collapse empty tracks */
.auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* auto-fill: Keep empty tracks (no collapse) */
.auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/*
DIFFERENCE (with 3 items in 800px container):
==============================================

auto-fit (400px each):
┌─────────┬─────────┐
│  Item1  │  Item2  │
├─────────┴─────────┤
│      Item3        │
└───────────────────┘

auto-fill (200px each):
┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │   │ ← Empty track
└───┴───┴───┴───┘

auto-fit: Expands items to fill
auto-fill: Creates ghost columns
*/
```

### Common Mistakes

❌ **Wrong**: Using Grid for simple one-axis layouts
```css
.simple-navbar {
  display: grid; /* ❌ Overkill for single row */
  grid-template-columns: auto 1fr auto;
}
```

✅ **Correct**: Use Flexbox for one-dimensional layouts
```css
.simple-navbar {
  display: flex;
  justify-content: space-between;
}
```

❌ **Wrong**: Confusing grid-template-columns with width
```css
.item {
  grid-template-columns: 3; /* ❌ Doesn't work! */
}
```

✅ **Correct**: Use grid-column span
```css
.item {
  grid-column: span 3; /* ✅ Spans 3 columns */
}
```

### Follow-up Questions
1. "What's the difference between fr unit and percentage?"
2. "How does minmax() work in grid-template-columns?"
3. "Can you explain implicit vs explicit grid?"
4. "What's the difference between justify-items and justify-content?"

### Resources
- [MDN: CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [CSS Tricks: Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Grid Garden](https://cssgridgarden.com/)

---

