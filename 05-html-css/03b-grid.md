# CSS Grid Layout

> Master CSS Grid for two-dimensional layouts

---

## Question 3: Flexbox vs Grid - When to Use Which?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon

### Question
When should you use Flexbox vs CSS Grid? Can you use them together?

### Answer

**Decision Framework:** Flexbox for components, Grid for layouts. They work great together!

**Key Points:**

1. **Dimensional Difference** - Flexbox = 1D (row OR column), Grid = 2D (rows AND columns)
2. **Content vs Layout** - Flexbox = content-first, Grid = layout-first
3. **Use Together** - Grid for page structure, Flexbox for components within grid areas
4. **Both Valid** - Sometimes either works, choose based on intent and flexibility needs
5. **Browser Support** - Both widely supported (95%+ browsers)

### Code Example

```css
/* =========================================== */
/* 1. FLEXBOX USE CASES */
/* =========================================== */

/* ✅ Navigation bar (one row) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ✅ Button group (one row) */
.button-group {
  display: flex;
  gap: 0.5rem;
}

/* ✅ Vertical list with dynamic spacing */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ✅ Centering single item */
.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ✅ Form row (label + input) */
.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ✅ Equal height cards in single row */
.card-row {
  display: flex;
  gap: 1rem;
}
```

```css
/* =========================================== */
/* 2. CSS GRID USE CASES */
/* =========================================== */

/* ✅ Page layout (header, sidebar, content, footer) */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
}

/* ✅ Photo gallery (rows and columns) */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* ✅ Dashboard widgets (complex grid) */
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* ✅ Form layout (labels and inputs aligned) */
.form-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;
}

/* ✅ Magazine layout (different sized items) */
.magazine {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
}
```

**Using Flexbox and Grid Together:**

```html
<!-- =========================================== -->
<!-- 3. COMBINED USAGE (Grid + Flex) -->
<!-- =========================================== -->

<div class="page-layout">
  <header class="header">
    <!-- Flex inside Grid area -->
    <nav class="navbar">
      <div class="logo">Logo</div>
      <ul class="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
      </ul>
    </nav>
  </header>

  <aside class="sidebar">
    <!-- Flex for vertical menu -->
    <ul class="menu">
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </aside>

  <main class="main">
    <!-- Grid for card layout -->
    <div class="card-grid">
      <div class="card">
        <!-- Flex for card internals -->
        <div class="card-header">
          <h3>Title</h3>
          <button>×</button>
        </div>
        <div class="card-body">Content</div>
      </div>
    </div>
  </main>

  <footer class="footer">
    <!-- Flex for footer links -->
    <div class="footer-links">
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
    </div>
  </footer>
</div>
```

```css
/* =========================================== */
/* 4. COMBINED CSS */
/* =========================================== */

/* Grid for page structure */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }

/* Flex for navbar (inside Grid area) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  list-style: none;
}

/* Flex for sidebar menu */
.menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
}

/* Grid for cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

/* Flex for card internals */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

/* Flex for footer */
.footer-links {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 1rem;
}
```

**Decision Tree:**

```plaintext
/* =========================================== */
/* 5. WHICH TO USE? */
/* =========================================== */

START: Need to layout elements?
│
├─ One direction only (row OR column)?
│  └─ YES → FLEXBOX ✅
│     Examples: navbar, button group, menu
│
├─ Need rows AND columns at same time?
│  └─ YES → CSS GRID ✅
│     Examples: page layout, photo gallery, dashboard
│
├─ Content determines size?
│  └─ YES → FLEXBOX ✅
│     Example: tags, badges, dynamic content
│
├─ Layout defines size?
│  └─ YES → CSS GRID ✅
│     Example: fixed grid, dashboard widgets
│
├─ Need equal height columns?
│  └─ Single row → FLEXBOX ✅
│  └─ Multiple rows → CSS GRID ✅
│
├─ Unknown number of items?
│  └─ Flow in one direction → FLEXBOX ✅
│  └─ Wrap to grid → CSS GRID (auto-fit) ✅
│
└─ Overlapping elements?
   └─ CSS GRID ✅ (with z-index)
      or POSITION: absolute
```

**Same Result, Different Methods:**

```css
/* =========================================== */
/* 6. FLEXBOX VS GRID FOR SAME LAYOUT */
/* =========================================== */

/* Three equal columns - FLEXBOX */
.flex-columns {
  display: flex;
  gap: 1rem;
}

.flex-columns .column {
  flex: 1; /* Equal width */
}

/* Three equal columns - GRID */
.grid-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Both work! Choose based on:
   - Flexbox: If content might vary, need flexibility
   - Grid: If structure is fixed, need precise control
*/
```

### Common Mistakes

❌ **Wrong**: Using Grid when Flexbox is simpler
```css
.button-group {
  display: grid; /* ❌ Overkill for simple row */
  grid-template-columns: repeat(3, auto);
}
```

✅ **Correct**: Use Flexbox for simple cases
```css
.button-group {
  display: flex;
  gap: 0.5rem;
}
```

❌ **Wrong**: Fighting Flexbox for complex layouts
```css
.complex-layout {
  display: flex; /* ❌ Hard to maintain */
  flex-wrap: wrap;
}

.item {
  flex-basis: 33.33%; /* Fragile! */
}
```

✅ **Correct**: Use Grid for complex layouts
```css
.complex-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

### Follow-up Questions
1. "Can you nest Grid inside Flexbox and vice versa?"
2. "Which has better browser support?"
3. "Which is better for responsive design?"
4. "Can you achieve the same layout with both?"

### Resources
- [Flexbox vs Grid](https://css-tricks.com/quick-whats-the-difference-between-flexbox-and-grid/)
- [MDN: Layout Cookbook](https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook)

---

## Question 4: Advanced Flexbox - gap, order, and flex-basis

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the gap property, order property, and how flex-basis works. What's the difference between flex: 1 and flex: auto?

### Answer

**Key Points:**

1. **gap Property** - Modern spacing solution, replaces margin hacks
2. **order Property** - Visual reordering without changing DOM
3. **flex-basis** - Base size before flex-grow/shrink applied
4. **flex Shorthand** - Common values have different meanings
5. **Accessibility** - Visual order vs DOM order affects screen readers

### Code Example

```css
/* =========================================== */
/* 1. GAP PROPERTY (Modern Spacing) */
/* =========================================== */

.container {
  display: flex;
  gap: 1rem; /* Space between items (NOT around) */
}

/* Before gap (old way) */
.old-way {
  display: flex;
}

.old-way .item {
  margin-right: 1rem;
}

.old-way .item:last-child {
  margin-right: 0; /* Remove margin from last item */
}

/* After gap (new way) */
.new-way {
  display: flex;
  gap: 1rem; /* ✅ Much cleaner! */
}

/* Different row/column gaps */
.container {
  display: flex;
  flex-wrap: wrap;
  row-gap: 2rem;    /* Vertical spacing */
  column-gap: 1rem; /* Horizontal spacing */
  /* Shorthand: gap: 2rem 1rem; (row column) */
}
```

```css
/* =========================================== */
/* 2. ORDER PROPERTY */
/* =========================================== */

.container {
  display: flex;
}

.item-1 {
  order: 2; /* Appears second */
}

.item-2 {
  order: 1; /* Appears first */
}

.item-3 {
  order: 3; /* Appears third */
}

/* Default order: 0
   Negative values allowed
   Visual order only (DOM unchanged)
*/

/* Practical example: Mobile reordering */
@media (max-width: 768px) {
  .sidebar {
    order: 2; /* Move sidebar after content */
  }

  .main {
    order: 1; /* Content first on mobile */
  }
}

/* ⚠️  ACCESSIBILITY WARNING:
   Screen readers use DOM order, not visual order!
   Use sparingly, mainly for responsive adjustments
*/
```

```css
/* =========================================== */
/* 3. FLEX-BASIS EXPLAINED */
/* =========================================== */

.item {
  flex-basis: auto; /* Default: use content size */
  flex-basis: 200px; /* Start at 200px before growing/shrinking */
  flex-basis: 50%; /* 50% of container */
  flex-basis: 0; /* Ignore content size, equal distribution */
}

/* How flex-basis interacts with flex-grow */
.container {
  display: flex;
  width: 600px;
}

/* Case 1: flex-basis: auto */
.item-a {
  flex: 1 1 auto; /* Content: 100px */
}

.item-b {
  flex: 1 1 auto; /* Content: 200px */
}

/* Calculation:
   Extra space: 600 - 300 = 300px
   Item A: 100 + (300 / 2) = 250px
   Item B: 200 + (300 / 2) = 350px
   (Not equal!)
*/

/* Case 2: flex-basis: 0 */
.item-a {
  flex: 1 1 0; /* Ignore content */
}

.item-b {
  flex: 1 1 0; /* Ignore content */
}

/* Calculation:
   Extra space: 600px (all of it)
   Item A: 0 + (600 / 2) = 300px
   Item B: 0 + (600 / 2) = 300px
   (Equal!)
*/
```

```css
/* =========================================== */
/* 4. FLEX SHORTHAND DEEP DIVE */
/* =========================================== */

/* flex: <grow> <shrink> <basis> */

/* Initial (default) */
.item {
  flex: 0 1 auto;
  /* Don't grow, can shrink, base on content */
}

/* flex: 1 (most common) */
.item {
  flex: 1;
  /* Same as: flex: 1 1 0 */
  /* Grow equally, can shrink, ignore content size */
  /* Result: EQUAL width items */
}

/* flex: auto */
.item {
  flex: auto;
  /* Same as: flex: 1 1 auto */
  /* Grow, can shrink, base on content */
  /* Result: Different widths based on content */
}

/* flex: none */
.item {
  flex: none;
  /* Same as: flex: 0 0 auto */
  /* Can't grow or shrink, fixed size */
}

/* Custom values */
.item {
  flex: 2 1 300px;
  /* Grow 2x faster than items with flex-grow: 1 */
  /* Can shrink */
  /* Start at 300px */
}
```

**Practical Examples:**

```css
/* =========================================== */
/* 5. REAL-WORLD PATTERNS */
/* =========================================== */

/* Equal width columns (ignoring content) */
.equal-columns {
  display: flex;
  gap: 1rem;
}

.column {
  flex: 1; /* flex: 1 1 0 - equal widths */
}

/* Content-aware columns */
.content-columns {
  display: flex;
  gap: 1rem;
}

.column {
  flex: auto; /* flex: 1 1 auto - based on content */
}

/* Fixed sidebar + fluid main */
.layout {
  display: flex;
}

.sidebar {
  flex: 0 0 250px; /* Fixed 250px, won't grow/shrink */
}

.main {
  flex: 1; /* Take remaining space */
}

/* Priority growth */
.container {
  display: flex;
}

.small {
  flex: 1; /* Gets 1 part */
}

.large {
  flex: 2; /* Gets 2 parts (twice as much) */
}

/* Responsive order */
.mobile-first {
  display: flex;
  flex-direction: column;
}

.header { order: 1; }
.content { order: 2; }
.sidebar { order: 3; }

@media (min-width: 768px) {
  .mobile-first {
    flex-direction: row;
  }

  .sidebar { order: 2; } /* Sidebar between header and content */
  .content { order: 3; }
}
```

### Common Mistakes

❌ **Wrong**: Using margin for flex spacing
```css
.container {
  display: flex;
}

.item {
  margin-right: 1rem;
}

.item:last-child {
  margin-right: 0; /* ❌ Extra code needed */
}
```

✅ **Correct**: Use gap
```css
.container {
  display: flex;
  gap: 1rem; /* ✅ Clean and simple */
}
```

❌ **Wrong**: Overusing order for layout
```css
.item-1 { order: 5; }
.item-2 { order: 1; }
.item-3 { order: 3; }
/* ❌ Confusing, bad for accessibility */
```

✅ **Correct**: Use order sparingly, mainly for responsive
```css
@media (max-width: 768px) {
  .sidebar {
    order: 2; /* ✅ Legitimate responsive use */
  }
}
```

### Follow-up Questions
1. "Does gap work with Grid?"
2. "How does order affect tab navigation?"
3. "What's the difference between flex-basis and width?"
4. "Can flex-basis be negative?"

### Resources
- [MDN: gap](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
- [MDN: flex-basis](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis)

---

## Question 5: Advanced Grid - Implicit Grid, Grid Auto, and Subgrid

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain implicit vs explicit grid. What is grid-auto-flow and grid-auto-rows? How does subgrid work?

### Answer

**Key Points:**

1. **Explicit Grid** - Rows/columns you define with grid-template
2. **Implicit Grid** - Automatically created rows/columns for overflow items
3. **Grid Auto Properties** - Control implicit grid behavior
4. **Subgrid** - Nested grid inherits parent grid tracks
5. **Auto-placement** - Algorithm for placing items automatically

### Code Example

```css
/* =========================================== */
/* 1. EXPLICIT VS IMPLICIT GRID */
/* =========================================== */

.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Explicit: 3 columns */
  grid-template-rows: 100px 100px; /* Explicit: 2 rows */
  gap: 1rem;
}

/* If you have 9 items, but only defined 2 rows (6 cells):
   Rows 1-2: Explicit (100px each)
   Row 3: Implicit (auto-sized to fit content)
*/

/* Control implicit grid size */
.container {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px 100px; /* Explicit rows */
  grid-auto-rows: 150px; /* Implicit rows will be 150px */
}

/* Multiple implicit row sizes */
.container {
  grid-auto-rows: 100px 200px; /* Alternating pattern */
  /* Row 3: 100px, Row 4: 200px, Row 5: 100px, etc. */
}

/* minmax for flexible implicit rows */
.container {
  grid-auto-rows: minmax(100px, auto);
  /* At least 100px, grows to fit content */
}
```

```css
/* =========================================== */
/* 2. GRID-AUTO-FLOW */
/* =========================================== */

.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: row; /* Default: fill rows first */
}

/*
grid-auto-flow: row (default)
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘
*/

.container {
  grid-auto-flow: column; /* Fill columns first */
}

/*
grid-auto-flow: column
┌───┬───┬───┐
│ 1 │ 3 │ 5 │
├───┼───┼───┤
│ 2 │ 4 │ 6 │
└───┴───┴───┘
*/

.container {
  grid-auto-flow: dense; /* Fill holes in grid */
}

/*
grid-auto-flow: row dense
Without dense (holes):
┌───┬───────┬───┐
│ 1 │   2   │   │ ← Hole
├───┼───────┼───┤
│ 3 │   4   │ 5 │
└───┴───────┴───┘

With dense (packed):
┌───┬───────┬───┐
│ 1 │   2   │ 5 │ ← Filled
├───┼───────┼───┤
│ 3 │   4   │   │
└───┴───────┴───┘

Useful for masonry layouts!
*/
```

```css
/* =========================================== */
/* 3. GRID-AUTO-COLUMNS */
/* =========================================== */

.container {
  display: grid;
  grid-template-rows: 100px 100px;
  grid-auto-flow: column; /* Flow in columns */
  grid-auto-columns: 200px; /* Implicit columns 200px */
}

/* If items exceed defined structure, creates columns automatically */

/* Responsive auto columns */
.container {
  grid-auto-flow: column;
  grid-auto-columns: minmax(300px, 1fr);
  overflow-x: auto; /* Horizontal scroll for overflow */
}
```

```css
/* =========================================== */
/* 4. SUBGRID (CSS Grid Level 2) */
/* =========================================== */

.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 1rem;
}

.nested-grid {
  grid-column: span 2; /* Takes 2 parent columns */
  display: grid;
  grid-template-columns: subgrid; /* ✅ Inherits parent's 2 columns */
  grid-template-rows: subgrid; /* Inherits parent's rows */
  gap: 0.5rem; /* Can override gap */
}

/*
WITHOUT SUBGRID:
Parent:  [────1────][────2────][────3────][────4────]
Nested:  [──a──][──b──] (independent grid)

WITH SUBGRID:
Parent:  [────1────][────2────][────3────][────4────]
Nested:  [────1────][────2────] (aligns with parent!)

Perfect for aligning nested card grids!
*/
```

**Practical Examples:**

```css
/* =========================================== */
/* 5. AUTO-PLACEMENT MASONRY LAYOUT */
/* =========================================== */

.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 20px; /* Small row units */
  grid-auto-flow: dense; /* Fill holes */
  gap: 1rem;
}

.masonry .item {
  /* Items span different row counts */
  grid-row-end: span 10; /* Default span */
}

.masonry .item.tall {
  grid-row-end: span 20; /* Taller items */
}

/* Creates Pinterest-like masonry layout */
```

```css
/* =========================================== */
/* 6. INFINITE SCROLL GRID */
/* =========================================== */

.infinite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 400px; /* All implicit rows 400px */
  gap: 2rem;
}

/* As new items load, grid auto-creates rows at 400px each */
```

```css
/* =========================================== */
/* 7. PRACTICAL SUBGRID EXAMPLE */
/* =========================================== */

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid; /* Align all card sections */
  grid-row: span 3; /* Span 3 parent rows */
  gap: 1rem;
}

/*
RESULT: All cards have aligned sections
┌────────┐ ┌────────┐ ┌────────┐
│ Header │ │ Header │ │ Header │ ← All same height
├────────┤ ├────────┤ ├────────┤
│  Body  │ │  Body  │ │  Body  │ ← All same height
├────────┤ ├────────┤ ├────────┤
│ Footer │ │ Footer │ │ Footer │ ← All same height
└────────┘ └────────┘ └────────┘

Without subgrid, each card's sections would be independent heights!
*/
```

### Common Mistakes

❌ **Wrong**: Not defining implicit grid size
```css
.container {
  grid-template-columns: repeat(3, 1fr);
  /* ❌ Implicit rows will be auto-sized (tiny!) */
}
```

✅ **Correct**: Control implicit grid
```css
.container {
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto); /* ✅ Minimum height */
}
```

❌ **Wrong**: Confusing subgrid with nested grid
```css
.nested {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* ❌ Creates independent grid, doesn't align with parent */
}
```

✅ **Correct**: Use subgrid for alignment
```css
.nested {
  display: grid;
  grid-template-columns: subgrid;
  /* ✅ Inherits parent columns, perfect alignment */
}
```

### Follow-up Questions
1. "What's the browser support for subgrid?"
2. "How do you debug implicit grid tracks?"
3. "Can you use auto-fill with explicit tracks?"
4. "What happens when grid-auto-flow: dense reorders accessibility?"

### Resources
- [MDN: Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid)
- [Grid by Example: Auto-placement](https://gridbyexample.com/examples/#example19)

---

## Summary Table

| Topic | Use Case | Key Property |
|-------|----------|-------------|
| Flexbox | 1D layouts, components | flex, justify-content, align-items |
| Grid | 2D layouts, page structure | grid-template, grid-area |
| Flex vs Grid | 1D vs 2D decision | display: flex vs display: grid |
| Gap | Spacing between items | gap (works in both) |
| Subgrid | Align nested grids | grid-template-columns: subgrid |

---

**Next Topics**: Responsive Design, Media Queries, Container Queries
