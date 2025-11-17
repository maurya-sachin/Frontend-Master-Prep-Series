# CSS Selectors and Specificity

> Master CSS selectors, specificity, cascade, and selector strategies

---

## Question 1: Explain the CSS Box Model

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb

### Question
What is the CSS box model? Explain content, padding, border, and margin. What's the difference between `box-sizing: content-box` and `border-box`?

### Answer

The **CSS Box Model** describes how elements are rendered as rectangular boxes with content, padding, border, and margin.

**Key Points:**

1. **Four Layers** - Every element has content, padding, border, and margin areas
2. **box-sizing Property** - Controls how width/height are calculated (`content-box` vs `border-box`)
3. **Margin Collapse** - Vertical margins collapse; horizontal margins don't
4. **Border-box is Modern Standard** - Simplifies layout calculations and prevents overflow
5. **Visual Debugging** - Use browser DevTools to visualize box model for any element

### Code Example

```css
/* =========================================== */
/* 1. BOX MODEL COMPONENTS */
/* =========================================== */

.box {
  /* Content area */
  width: 200px;
  height: 100px;

  /* Padding (inside border, adds to size) */
  padding: 20px;

  /* Border (around padding) */
  border: 5px solid black;

  /* Margin (outside border, doesn't add to size) */
  margin: 10px;
}

/*
VISUAL REPRESENTATION:
======================

┌────────────── Margin (10px) ──────────────┐
│                                             │
│  ┌────────── Border (5px) ────────────┐   │
│  │                                      │   │
│  │  ┌──── Padding (20px) ────┐        │   │
│  │  │                          │        │   │
│  │  │  Content (200×100)      │        │   │
│  │  │                          │        │   │
│  │  └──────────────────────────┘        │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘

DEFAULT (content-box) TOTAL SIZE:
- Width: 200 (content) + 40 (padding) + 10 (border) = 250px
- Height: 100 (content) + 40 (padding) + 10 (border) = 150px
- Margin adds 10px space around but doesn't affect element size
*/
```

**box-sizing: content-box vs border-box:**

```css
/* =========================================== */
/* 2. BOX-SIZING PROPERTY */
/* =========================================== */

/* ❌ DEFAULT: content-box (old behavior) */
.content-box {
  box-sizing: content-box; /* default */
  width: 200px;
  padding: 20px;
  border: 5px solid black;
}
/*
CALCULATION:
- Specified width: 200px (content only)
- Total width: 200 + 40 (padding) + 10 (border) = 250px
- Content area: 200px
*/

/* ✅ MODERN: border-box (recommended) */
.border-box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid black;
}
/*
CALCULATION:
- Specified width: 200px (includes padding & border)
- Total width: 200px
- Content area: 200 - 40 (padding) - 10 (border) = 150px
*/

/* ✅ BEST PRACTICE: Apply globally */
*,
*::before,
*::after {
  box-sizing: border-box;
}
/* Now all elements use intuitive border-box sizing */
```

**Practical Layout Example:**

```html
<div class="container">
  <div class="box box-1">Box 1</div>
  <div class="box box-2">Box 2</div>
</div>
```

```css
/* =========================================== */
/* 3. REAL-WORLD EXAMPLE */
/* =========================================== */

.container {
  width: 400px;
  background: #f0f0f0;
  padding: 20px;
}

/* ❌ WITHOUT border-box - boxes overflow! */
.box {
  /* box-sizing: content-box; */ /* default */
  width: 50%; /* 200px */
  padding: 20px; /* adds 40px */
  border: 5px solid blue; /* adds 10px */
  /* Total: 250px each - OVERFLOWS 400px container! */
  float: left;
}

/* ✅ WITH border-box - boxes fit perfectly */
.box {
  box-sizing: border-box;
  width: 50%; /* 200px total including padding & border */
  padding: 20px;
  border: 5px solid blue;
  float: left;
  /* Content shrinks to: 200 - 40 - 10 = 150px */
}
```

**Margin Collapse:**

```css
/* =========================================== */
/* 4. MARGIN COLLAPSE */
/* =========================================== */

/* Vertical margins collapse (take larger value) */
.section-1 {
  margin-bottom: 30px;
}

.section-2 {
  margin-top: 20px;
}

/*
ACTUAL GAP: 30px (not 50px!)
Vertical margins collapse - larger value wins

WHY? Prevents excessive spacing in vertical flow layouts
*/

/* Horizontal margins DON'T collapse */
.inline-box-1 {
  display: inline-block;
  margin-right: 30px;
}

.inline-box-2 {
  display: inline-block;
  margin-left: 20px;
}

/* ACTUAL GAP: 50px (30px + 20px) */

/* Preventing margin collapse */
.parent {
  padding: 1px; /* Creates BFC, prevents collapse */
  /* OR */
  border: 1px solid transparent;
  /* OR */
  overflow: hidden;
}
```

**Padding vs Margin:**

```css
/* =========================================== */
/* 5. PADDING VS MARGIN */
/* =========================================== */

.clickable-button {
  padding: 15px 30px; /* ✅ Expands click area */
  margin: 10px; /* ✅ Space from other elements */
  background: blue;
  color: white;
}

/*
PADDING:
- Inside element
- Expands background/border area
- Included in click/hover area
- Can't be negative
- Use for: Internal spacing, clickable area

MARGIN:
- Outside element
- Creates space between elements
- Not part of click/hover area
- Can be negative (overlap elements)
- Use for: External spacing, element separation
*/

/* Negative margins */
.overlap {
  margin-top: -20px; /* Moves element up, can overlap */
}
```

### Common Mistakes

❌ **Wrong**: Not using border-box globally
```css
.container {
  width: 300px;
}

.child {
  width: 100%;
  padding: 20px; /* Makes it 340px - overflow! */
}
```

✅ **Correct**: Use border-box
```css
*, *::before, *::after {
  box-sizing: border-box;
}

.child {
  width: 100%; /* Stays 300px total */
  padding: 20px; /* Included in width */
}
```

❌ **Wrong**: Confusing margin and padding
```css
/* Don't use margin for internal spacing */
.card {
  margin: 20px; /* ❌ Won't expand background */
}

/* Don't use padding for element separation */
.section {
  padding-bottom: 40px; /* ❌ Expands section unnecessarily */
}
```

✅ **Correct**: Use appropriate spacing
```css
.card {
  padding: 20px; /* ✅ Internal spacing with background */
  margin-bottom: 20px; /* ✅ Space from other cards */
}
```

### Follow-up Questions
1. "Why does margin collapse happen and when doesn't it occur?"
2. "Can you have negative padding? Why or why not?"
3. "How does outline differ from border?"
4. "What is a Block Formatting Context (BFC)?"

### Resources
- [MDN: CSS Box Model](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model)
- [CSS Tricks: Box Sizing](https://css-tricks.com/box-sizing/)

---

## Question 2: Explain CSS Specificity and the Cascade

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
How does CSS specificity work? Explain the cascade and specificity calculation.

### Answer

**CSS Specificity** determines which styles apply when multiple rules target the same element. **The Cascade** is the algorithm browsers use to combine styles from multiple sources.

**Key Points:**

1. **Specificity is Calculated** - Each selector has a weight: inline styles (1000), IDs (100), classes/attributes/pseudo-classes (10), elements/pseudo-elements (1)
2. **Cascade Order Matters** - When specificity is equal, last rule wins
3. **!important Overrides** - `!important` beats everything (use sparingly)
4. **Inheritance** - Some properties inherit from parent (color, font-family) while others don't (margin, padding)
5. **Specificity Wars** - Avoid overly specific selectors; use classes over IDs for styling

### Code Example

```css
/* =========================================== */
/* 1. SPECIFICITY CALCULATION */
/* =========================================== */

/*
SPECIFICITY WEIGHT:
===================
Inline style:      1,0,0,0 (1000 points)
ID:                0,1,0,0 (100 points)
Class/Attribute:   0,0,1,0 (10 points)
Element:           0,0,0,1 (1 point)
Universal (*):     0,0,0,0 (0 points)
*/

/* Specificity: 0,0,0,1 (1 point) */
p {
  color: black;
}

/* Specificity: 0,0,1,0 (10 points) */
.text {
  color: blue; /* ✅ WINS over 'p' */
}

/* Specificity: 0,1,0,0 (100 points) */
#heading {
  color: red; /* ✅ WINS over '.text' */
}

/* Specificity: 1,0,0,0 (1000 points) */
<p style="color: green;">Text</p> /* ✅ WINS over all CSS rules */

/* !important overrides everything */
p {
  color: purple !important; /* ✅ WINS over inline styles */
}
```

**Specificity Examples:**

```css
/* =========================================== */
/* 2. CALCULATING SPECIFICITY */
/* =========================================== */

/* Specificity: 0,0,0,1 */
div { color: black; }

/* Specificity: 0,0,0,2 */
div p { color: blue; }

/* Specificity: 0,0,1,1 */
div .text { color: green; }

/* Specificity: 0,0,2,1 */
div.container .text { color: red; }

/* Specificity: 0,1,0,1 */
div#main { color: purple; }

/* Specificity: 0,1,1,2 */
div#main .content p { color: orange; }

/* Specificity: 0,2,1,1 */
#header #nav .link { color: yellow; }

/*
REMEMBER:
- ID always beats class
- Class always beats element
- More specific selector wins
- Same specificity? Last one wins
*/
```

**The Cascade:**

```css
/* =========================================== */
/* 3. CASCADE ORDER */
/* =========================================== */

/* 1. User agent styles (browser defaults) */
p {
  display: block;
  margin: 1em 0;
}

/* 2. User styles (user's browser settings) */

/* 3. Author styles (your CSS) */
p {
  color: blue; /* Overrides browser default */
}

p {
  color: red; /* ✅ WINS - same specificity, comes last */
}

/* 4. !important author styles */
p {
  color: green !important; /* ✅ WINS - !important */
}

/* 5. !important user styles */

/* 6. !important user agent styles */

/*
CASCADE PRIORITY (high to low):
1. !important user agent declarations
2. !important user declarations
3. !important author declarations
4. Normal author declarations
5. Normal user declarations
6. Normal user agent declarations
*/
```

**Inheritance:**

```css
/* =========================================== */
/* 4. INHERITANCE */
/* =========================================== */

.parent {
  /* These properties INHERIT to children */
  color: blue;
  font-family: Arial;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;

  /* These properties DON'T inherit */
  margin: 20px;
  padding: 10px;
  border: 1px solid black;
  background: yellow;
  width: 300px;
}

.child {
  /* Inherits: color, font-family, font-size, line-height, text-align */
  /* Doesn't inherit: margin, padding, border, background, width */
}

/* Force inheritance */
.child {
  border: inherit; /* Inherit parent's border */
  all: inherit; /* Inherit ALL properties from parent */
}

/* Reset inheritance */
.child {
  color: initial; /* Reset to initial value */
  all: unset; /* Remove all inherited/set values */
}
```

**Practical Example:**

```html
<div id="container" class="wrapper">
  <p class="text highlight">Hello World</p>
</div>
```

```css
/* =========================================== */
/* 5. REAL-WORLD SPECIFICITY BATTLE */
/* =========================================== */

/* Specificity: 0,0,0,1 - WON'T APPLY */
p {
  color: black;
}

/* Specificity: 0,0,1,0 - WON'T APPLY */
.text {
  color: blue;
}

/* Specificity: 0,0,2,0 - WON'T APPLY */
.text.highlight {
  color: green;
}

/* Specificity: 0,1,0,1 - WON'T APPLY */
#container p {
  color: red;
}

/* Specificity: 0,1,2,1 - ✅ WINS! */
#container .text.highlight {
  color: purple;
}

/* Override with !important (avoid in production) */
.text {
  color: orange !important; /* ✅ WINS over everything */
}
```

### Common Mistakes

❌ **Wrong**: Using IDs for styling
```css
#header { /* 0,1,0,0 - Too specific! */
  background: blue;
}

#header .nav { /* 0,1,1,0 - Even worse! */
  color: white;
}
/* Hard to override later */
```

✅ **Correct**: Use classes
```css
.header { /* 0,0,1,0 - Flexible */
  background: blue;
}

.header__nav { /* BEM naming */
  color: white;
}
```

❌ **Wrong**: Overusing !important
```css
.button {
  background: blue !important;
  color: white !important;
  padding: 10px !important; /* ❌ Specificity war! */
}
```

✅ **Correct**: Increase specificity properly
```css
.page .button {
  background: blue;
  color: white;
  padding: 10px;
}
```

### Follow-up Questions
1. "How does the universal selector affect specificity?"
2. "What happens when two selectors have the same specificity?"
3. "Can you explain the :not() pseudo-class specificity?"
4. "How do CSS custom properties (variables) inherit?"

### Resources
- [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [Specificity Calculator](https://specificity.keegan.st/)

---

