# CSS Box Model and Positioning

> Box model, positioning, display, floats, and layout fundamentals

---

## Question 3: CSS Display Property - Block vs Inline vs Inline-Block

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the differences between `display: block`, `display: inline`, and `display: inline-block`.

### Answer

The **display property** controls how an element participates in layout and generates boxes.

**Key Points:**

1. **Block Elements** - Take full width, start on new line, accept width/height
2. **Inline Elements** - Take only content width, flow with text, ignore width/height
3. **Inline-Block Elements** - Flow like inline but accept width/height like block
4. **Default Display** - Each HTML element has a default (`div` is block, `span` is inline, etc.)
5. **Modern Layout** - Flexbox and Grid often replace display hacks

### Code Example

```css
/* =========================================== */
/* 1. BLOCK ELEMENTS */
/* =========================================== */

.block {
  display: block;
}

/*
CHARACTERISTICS:
- Takes full available width (100% of parent)
- Starts on new line
- Can set width and height
- Can set all margins and paddings
- Stacks vertically
- Examples: div, p, h1-h6, section, article

BEHAVIOR:
┌────── Container ────────┐
│  Block Element 1        │
├─────────────────────────┤
│  Block Element 2        │
├─────────────────────────┤
│  Block Element 3        │
└─────────────────────────┘
*/

div {
  display: block;
  width: 200px; /* ✅ Works */
  height: 100px; /* ✅ Works */
  margin: 20px; /* ✅ All sides work */
  padding: 15px; /* ✅ All sides work */
}
```

```css
/* =========================================== */
/* 2. INLINE ELEMENTS */
/* =========================================== */

.inline {
  display: inline;
}

/*
CHARACTERISTICS:
- Takes only content width
- Flows with text (doesn't break line)
- width and height IGNORED
- Vertical margins/padding don't push other elements
- Horizontal margins/padding work
- Examples: span, a, strong, em, img (inline by default)

BEHAVIOR:
┌────── Container ────────┐
│ Text [inline][inline]   │
│ [inline] more text      │
└─────────────────────────┘
*/

span {
  display: inline;
  width: 200px; /* ❌ IGNORED */
  height: 100px; /* ❌ IGNORED */
  margin: 20px; /* ⚠️  Only left/right work */
  padding: 15px; /* ⚠️  Top/bottom don't push other elements */
}
```

```css
/* =========================================== */
/* 3. INLINE-BLOCK ELEMENTS */
/* =========================================== */

.inline-block {
  display: inline-block;
}

/*
CHARACTERISTICS:
- Flows like inline (doesn't break line)
- Accepts width/height like block
- All margins and paddings work
- Useful for navigation menus, buttons
- Has whitespace bug (space between elements)

BEHAVIOR:
┌────── Container ────────┐
│ [I-B] [I-B] [I-B]      │
│ [I-B] text             │
└─────────────────────────┘
*/

.button {
  display: inline-block;
  width: 150px; /* ✅ Works */
  height: 40px; /* ✅ Works */
  margin: 10px; /* ✅ All sides work */
  padding: 8px 16px; /* ✅ All sides work */
}
```

**Comparison Table:**

```css
/* =========================================== */
/* 4. SIDE-BY-SIDE COMPARISON */
/* =========================================== */

/*
┌──────────────┬─────────┬────────┬──────────────┐
│ Property     │ Block   │ Inline │ Inline-Block │
├──────────────┼─────────┼────────┼──────────────┤
│ New line     │ Yes     │ No     │ No           │
│ Full width   │ Yes     │ No     │ No           │
│ Width/Height │ Yes     │ No     │ Yes          │
│ Margin (all) │ Yes     │ H only │ Yes          │
│ Padding (all)│ Yes     │ Partial│ Yes          │
│ Line wrapping│ No      │ Yes    │ Yes          │
└──────────────┴─────────┴────────┴──────────────┘
*/
```

**Practical Examples:**

```html
<nav class="navigation">
  <a href="#" class="nav-link">Home</a>
  <a href="#" class="nav-link">About</a>
  <a href="#" class="nav-link">Contact</a>
</nav>
```

```css
/* =========================================== */
/* 5. PRACTICAL USE CASES */
/* =========================================== */

/* ❌ BAD: Inline links ignore dimensions */
.nav-link {
  display: inline; /* Default for <a> */
  width: 120px; /* IGNORED */
  padding: 15px 20px; /* Vertical padding doesn't push */
}

/* ✅ GOOD: Inline-block for clickable area */
.nav-link {
  display: inline-block;
  width: 120px; /* ✅ Works */
  padding: 15px 20px; /* ✅ Expands click area */
  text-align: center;
}

/* Modern alternative: Flexbox */
.navigation {
  display: flex;
  gap: 10px;
}

.nav-link {
  padding: 15px 20px;
  /* No need to set display: inline-block */
}
```

**Inline-Block Whitespace Bug:**

```html
<div class="container">
  <div class="box">1</div>
  <div class="box">2</div>
  <div class="box">3</div>
</div>
```

```css
/* =========================================== */
/* 6. INLINE-BLOCK WHITESPACE BUG */
/* =========================================== */

.box {
  display: inline-block;
  width: 100px;
  height: 100px;
}

/*
PROBLEM: Whitespace in HTML creates gaps between boxes!

SOLUTIONS:
*/

/* Solution 1: Remove HTML whitespace */
<div class="box">1</div><div class="box">2</div><div class="box">3</div>

/* Solution 2: Negative margin */
.box {
  margin-right: -4px;
}

/* Solution 3: Font size 0 on parent */
.container {
  font-size: 0;
}
.box {
  font-size: 16px;
}

/* ✅ Solution 4: Use Flexbox instead */
.container {
  display: flex;
  gap: 0;
}
.box {
  /* No display: inline-block needed */
}
```

### Common Mistakes

❌ **Wrong**: Trying to set width on inline elements
```css
span {
  display: inline;
  width: 200px; /* Ignored */
  height: 50px; /* Ignored */
}
```

✅ **Correct**: Use inline-block or block
```css
span {
  display: inline-block;
  width: 200px; /* ✅ Works */
  height: 50px; /* ✅ Works */
}
```

❌ **Wrong**: Using inline-block for layout
```css
.column {
  display: inline-block;
  width: 33.33%;
  /* Whitespace bug causes wrapping */
}
```

✅ **Correct**: Use Flexbox or Grid
```css
.container {
  display: flex;
}
.column {
  flex: 1;
}
```

### Follow-up Questions
1. "What's the difference between `display: none` and `visibility: hidden`?"
2. "How does `display: contents` work?"
3. "What is the difference between `display: flex` and `display: inline-flex`?"
4. "Can you explain `display: table` and its use cases?"

### Resources
- [MDN: Display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [CSS Display Property](https://css-tricks.com/almanac/properties/d/display/)

---

## Question 4: CSS Positioning - Static, Relative, Absolute, Fixed, Sticky

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain the different CSS positioning values: static, relative, absolute, fixed, and sticky.

### Answer

The **position property** controls how an element is positioned in the document flow.

**Key Points:**

1. **Static** - Default, normal flow, ignores top/left/right/bottom
2. **Relative** - Positioned relative to its normal position, reserves original space
3. **Absolute** - Removed from flow, positioned relative to nearest positioned ancestor
4. **Fixed** - Removed from flow, positioned relative to viewport, stays on scroll
5. **Sticky** - Hybrid of relative and fixed, toggles based on scroll position

### Code Example

```css
/* =========================================== */
/* 1. STATIC POSITIONING (DEFAULT) */
/* =========================================== */

.static {
  position: static; /* Default value */
  top: 100px; /* IGNORED */
  left: 50px; /* IGNORED */
}

/*
- Normal document flow
- top, right, bottom, left have no effect
- z-index has no effect
- Default for all elements
*/
```

```css
/* =========================================== */
/* 2. RELATIVE POSITIONING */
/* =========================================== */

.relative {
  position: relative;
  top: 20px; /* Move 20px DOWN from original position */
  left: 30px; /* Move 30px RIGHT from original position */
}

/*
- Positioned relative to its NORMAL position
- Original space is RESERVED (doesn't affect other elements)
- Can use top, right, bottom, left
- Creates positioning context for absolute children
- Stays in document flow

VISUAL:
┌─────────────────┐
│ Element 1       │
├─────────────────┤
│ [empty space]   │ ← Original position reserved
│     Element 2   │ ← Shifted by top/left
├─────────────────┤
│ Element 3       │
└─────────────────┘
*/
```

```css
/* =========================================== */
/* 3. ABSOLUTE POSITIONING */
/* =========================================== */

.container {
  position: relative; /* Create positioning context */
}

.absolute {
  position: absolute;
  top: 20px; /* 20px from TOP of .container */
  right: 10px; /* 10px from RIGHT of .container */
}

/*
- Removed from document flow (doesn't reserve space)
- Positioned relative to nearest POSITIONED ancestor
  (ancestor with position: relative/absolute/fixed/sticky)
- If no positioned ancestor, uses <html>
- Can use top, right, bottom, left
- Can overlap other elements

VISUAL (without positioned parent):
┌─────────────────┐
│ Element 1       │
├─────────────────┤
│ Element 2       │ ← Absolute element overlaps here
└─────────────────┘
    ┌──────────┐
    │ Absolute │
    └──────────┘

VISUAL (with positioned parent):
┌──── .container ──────┐
│                 ┌───┐│ ← Absolute positioned
│ Element 1      │Abs││
│                └───┘│
│ Element 2            │
└──────────────────────┘
*/
```

```css
/* =========================================== */
/* 4. FIXED POSITIONING */
/* =========================================== */

.fixed {
  position: fixed;
  top: 0; /* Stick to TOP of viewport */
  right: 0; /* Stick to RIGHT of viewport */
}

/*
- Removed from document flow
- Positioned relative to VIEWPORT
- Stays in same position during scroll
- Common for: headers, modals, chat widgets

USE CASES:
- Fixed navigation bar
- Floating action button
- Cookie consent banner
- Back to top button
*/

/* Fixed Header Example */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  z-index: 1000;
}

/* Compensate for fixed header */
.content {
  margin-top: 60px; /* Header height */
}
```

```css
/* =========================================== */
/* 5. STICKY POSITIONING */
/* =========================================== */

.sticky {
  position: sticky;
  top: 0; /* Stick when reaching TOP of container */
}

/*
- Hybrid: relative + fixed
- Behaves like relative until scroll threshold
- Then behaves like fixed within parent container
- Returns to flow when parent scrolls out
- Requires threshold (top, right, bottom, or left)

COMMON USES:
- Table headers
- Section headings
- Sidebar navigation
- Scroll progress indicators
*/

/* Sticky Table Header */
thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

/* Sticky Sidebar */
.sidebar {
  position: sticky;
  top: 20px; /* 20px from top when stuck */
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
```

**Positioning Context:**

```html
<div class="grandparent">
  <div class="parent">
    <div class="child">
      <div class="absolute">I'm absolutely positioned</div>
    </div>
  </div>
</div>
```

```css
/* =========================================== */
/* 6. POSITIONING CONTEXT */
/* =========================================== */

.grandparent {
  /* position: static; */ /* Not a positioning context */
}

.parent {
  position: relative; /* ✅ Creates positioning context */
  width: 400px;
  height: 300px;
  background: lightblue;
}

.child {
  /* position: static; */ /* Not a positioning context */
}

.absolute {
  position: absolute;
  top: 10px; /* Relative to .parent (nearest positioned ancestor) */
  left: 10px;
}

/*
RULE: Absolute elements position relative to nearest ancestor with:
- position: relative
- position: absolute
- position: fixed
- position: sticky

If none exist, positions relative to <html>
*/
```

**Centering with Absolute:**

```css
/* =========================================== */
/* 7. CENTERING TECHNIQUES */
/* =========================================== */

/* Method 1: Absolute + Transform */
.center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Method 2: Absolute + Margin Auto */
.center-margin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 200px; /* Must have width */
  height: 100px; /* Must have height */
}

/* Method 3: Absolute + Calc */
.center-calc {
  position: absolute;
  top: calc(50% - 50px); /* 50px = half height */
  left: calc(50% - 100px); /* 100px = half width */
  width: 200px;
  height: 100px;
}
```

### Common Mistakes

❌ **Wrong**: Forgetting to set positioning context
```css
.child {
  position: absolute;
  top: 20px;
  /* Positions relative to <html>, not parent! */
}
```

✅ **Correct**: Set parent to relative
```css
.parent {
  position: relative; /* Create context */
}

.child {
  position: absolute;
  top: 20px; /* Now relative to .parent */
}
```

❌ **Wrong**: Using fixed for content that should scroll
```css
.article {
  position: fixed; /* ❌ Won't scroll with page */
}
```

✅ **Correct**: Use static or relative
```css
.article {
  position: relative; /* ✅ Scrolls normally */
}
```

❌ **Wrong**: Sticky without threshold
```css
.sticky-header {
  position: sticky; /* ❌ Won't work without threshold */
}
```

✅ **Correct**: Set top/bottom/left/right
```css
.sticky-header {
  position: sticky;
  top: 0; /* ✅ Required threshold */
}
```

### Follow-up Questions
1. "How does z-index work with different positioning values?"
2. "What happens if you set both top and bottom on an absolute element?"
3. "Can you explain containing blocks?"
4. "How does position: sticky work with overflow: hidden parent?"

### Resources
- [MDN: Position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [CSS Positioning Explained](https://css-tricks.com/almanac/properties/p/position/)

---

## Question 5: What is z-index and How Does Stacking Context Work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain z-index and stacking context. Why doesn't z-index always work as expected?

### Answer

**z-index** controls the stacking order of positioned elements along the z-axis (depth). **Stacking contexts** are groups of elements with their own stacking order.

**Key Points:**

1. **Requires Positioning** - z-index only works on positioned elements (not static)
2. **Stacking Contexts** - Created by various CSS properties, elements inside can't escape their context
3. **Higher Wins** - Within same context, higher z-index appears on top
4. **Context Hierarchy** - Parent context always wins over child z-index
5. **Common Triggers** - position + z-index, opacity < 1, transform, filter, etc.

### Code Example

```css
/* =========================================== */
/* 1. BASIC Z-INDEX */
/* =========================================== */

.box-1 {
  position: relative;
  z-index: 1;
  background: red;
}

.box-2 {
  position: relative;
  z-index: 2; /* ✅ Appears on top */
  background: blue;
}

.box-3 {
  position: relative;
  z-index: 3; /* ✅ Appears on top of both */
  background: green;
}

/*
RULE: Higher z-index = closer to viewer
- Default z-index: auto (0)
- Can be negative (goes behind)
- Only works on positioned elements
*/
```

```css
/* =========================================== */
/* 2. Z-INDEX WITHOUT POSITIONING (DOESN'T WORK) */
/* =========================================== */

.static-box {
  position: static; /* Default */
  z-index: 9999; /* ❌ IGNORED - no effect! */
}

.relative-box {
  position: relative; /* Any value except static */
  z-index: 1; /* ✅ Works */
}

/*
Z-INDEX REQUIRES ONE OF:
- position: relative
- position: absolute
- position: fixed
- position: sticky
*/
```

```css
/* =========================================== */
/* 3. STACKING CONTEXT */
/* =========================================== */

.parent-1 {
  position: relative;
  z-index: 1; /* ✅ Creates stacking context */
}

.child-1 {
  position: relative;
  z-index: 9999; /* ❌ Can't escape parent context! */
}

.parent-2 {
  position: relative;
  z-index: 2; /* ✅ Wins over parent-1 */
}

.child-2 {
  position: relative;
  z-index: 1; /* Still appears on top of child-1! */
}

/*
STACKING CONTEXT CREATED BY:
1. Root element (<html>)
2. position + z-index (not auto)
3. position: fixed or sticky
4. flex/grid child + z-index
5. opacity < 1
6. transform (not none)
7. filter (not none)
8. will-change
9. isolation: isolate
*/
```

**Visual Example:**

```html
<div class="context-1">
  <div class="box-a">Box A (z-index: 9999)</div>
</div>

<div class="context-2">
  <div class="box-b">Box B (z-index: 1)</div>
</div>
```

```css
/* =========================================== */
/* 4. STACKING CONTEXT TRAP */
/* =========================================== */

.context-1 {
  position: relative;
  z-index: 1; /* Parent context z-index: 1 */
}

.box-a {
  position: relative;
  z-index: 9999; /* ❌ Trapped in context-1 */
  background: red;
}

.context-2 {
  position: relative;
  z-index: 2; /* Parent context z-index: 2 WINS */
}

.box-b {
  position: relative;
  z-index: 1; /* ✅ Appears on top because parent wins */
  background: blue;
}

/*
RESULT: box-b appears on top even though box-a has higher z-index!
WHY? Stacking contexts are independent
     Parent context-2 (z-index: 2) > context-1 (z-index: 1)
*/
```

**Common Stacking Context Triggers:**

```css
/* =========================================== */
/* 5. PROPERTIES THAT CREATE STACKING CONTEXT */
/* =========================================== */

/* 1. Positioned with z-index */
.positioned {
  position: relative;
  z-index: 1; /* ✅ Creates context */
}

/* 2. Opacity */
.transparent {
  opacity: 0.99; /* ✅ Creates context */
}

/* 3. Transform */
.transformed {
  transform: translateX(0); /* ✅ Creates context */
}

/* 4. Filter */
.filtered {
  filter: blur(0); /* ✅ Creates context */
}

/* 5. Flex/Grid children */
.flex-container {
  display: flex;
}

.flex-child {
  z-index: 1; /* ✅ Creates context (even without position) */
}

/* 6. Isolation */
.isolated {
  isolation: isolate; /* ✅ Creates context explicitly */
}

/* 7. Will-change */
.will-change {
  will-change: transform; /* ✅ Creates context */
}
```

**Debugging Stacking Issues:**

```css
/* =========================================== */
/* 6. DEBUGGING Z-INDEX PROBLEMS */
/* =========================================== */

/* Problem: Modal behind other elements */
.modal {
  position: fixed;
  z-index: 999; /* ❌ Still behind some elements */
}

/* Cause: Parent has stacking context */
.modal-container {
  position: relative;
  z-index: 1; /* Creates context, traps modal */
  opacity: 0.99; /* Also creates context! */
}

/* ✅ Solution 1: Move modal outside stacking context */
/* Render modal at root level in DOM */
<body>
  <div class="app">...</div>
  <div class="modal">Modal</div> <!-- Outside app context -->
</body>

/* ✅ Solution 2: Remove stacking context from parent */
.modal-container {
  /* Remove position, opacity, transform, etc. */
}

/* ✅ Solution 3: Increase parent z-index */
.modal-container {
  z-index: 1000; /* Higher than competing contexts */
}
```

**Natural Stacking Order (No z-index):**

```css
/* =========================================== */
/* 7. DEFAULT STACKING ORDER (BOTTOM TO TOP) */
/* =========================================== */

/*
1. Root element background and borders
2. Non-positioned blocks (in document order)
3. Non-positioned floats
4. Non-positioned inline elements
5. Positioned elements with z-index: auto or z-index: 0
6. Positioned elements with positive z-index (lowest to highest)

EXAMPLE:
*/

.background {
  /* 1. Rendered first (bottom) */
}

.static-block {
  /* 2. On top of background */
}

.float {
  float: left; /* 3. On top of static blocks */
}

.inline {
  display: inline; /* 4. On top of floats */
}

.positioned-auto {
  position: relative; /* 5. On top of inline */
  /* z-index: auto (default) */
}

.positioned-positive {
  position: relative;
  z-index: 1; /* 6. On top of everything (top) */
}
```

### Common Mistakes

❌ **Wrong**: Using extremely high z-index
```css
.modal {
  z-index: 999999999; /* ❌ Overkill, causes maintainability issues */
}
```

✅ **Correct**: Use reasonable values with system
```css
/* Define z-index scale */
:root {
  --z-dropdown: 100;
  --z-modal: 200;
  --z-tooltip: 300;
}

.modal {
  z-index: var(--z-modal); /* ✅ Maintainable */
}
```

❌ **Wrong**: Forgetting stacking context trap
```css
.parent {
  opacity: 0.99; /* Creates stacking context */
}

.child {
  z-index: 9999; /* ❌ Trapped in parent context */
}
```

✅ **Correct**: Understand context hierarchy
```css
/* Move element outside stacking context in DOM */
/* Or remove context-creating properties from parent */
```

### Follow-up Questions
1. "How do you debug z-index issues in DevTools?"
2. "What's the difference between `z-index: 0` and `z-index: auto`?"
3. "Can you have negative z-index values?"
4. "How does `isolation: isolate` work?"

### Resources
- [MDN: Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [What The Heck, z-index??](https://www.joshwcomeau.com/css/stacking-contexts/)

---

## Summary Table

| Topic | Key Concept | Common Pitfall |
|-------|-------------|----------------|
| Box Model | border-box includes padding/border in width | Forgetting content-box adds to width |
| Specificity | ID (100) > Class (10) > Element (1) | Overusing IDs and !important |
| Display | Block vs Inline vs Inline-block | Setting width on inline elements |
| Position | Absolute relative to positioned ancestor | Forgetting to set parent to relative |
| Z-index | Requires positioning, stacking contexts | Not understanding stacking context traps |

---

**Next Topics**: Flexbox, Grid, Responsive Design, Animations
