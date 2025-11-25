# Reflow vs Repaint

> **Focus**: Browser rendering performance and optimization

---

## Question 1: What is the difference between Reflow and Repaint?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the difference between reflow (layout) and repaint. What triggers each, and how do you optimize to avoid them?

### Answer

**Reflow (Layout)** and **Repaint** are two distinct rendering operations that occur after the initial page load when the DOM or styles change. Understanding the difference is critical for performance optimization.

**Reflow (Layout):**
- Recalculates element positions and dimensions
- Triggered by geometric changes (size, position)
- **EXPENSIVE** - requires recalculating entire layout tree
- Also called "Layout" in Chrome DevTools

**Repaint (Paint):**
- Redraws element pixels (color, visibility, background)
- Triggered by visual changes that don't affect layout
- **CHEAPER** than reflow, but still costly
- Also called "Paint" in Chrome DevTools

**Key Difference:**
- Reflow = "Where is it?" (geometry)
- Repaint = "What does it look like?" (appearance)
- **Reflow always triggers Repaint** (but not vice versa)

### Code Example

**What Triggers Reflow:**

```javascript
// ❌ EXPENSIVE REFLOWS

// 1. Changing dimensions
element.style.width = '500px';
element.style.height = '300px';

// 2. Changing position
element.style.top = '100px';
element.style.left = '200px';
element.style.margin = '20px';
element.style.padding = '10px';

// 3. Changing display/visibility
element.style.display = 'block';
element.style.float = 'left';

// 4. Changing content
element.innerHTML = 'New content';
element.innerText = 'More text';

// 5. Changing font
element.style.fontSize = '20px';
element.style.fontFamily = 'Arial';

// 6. Adding/removing elements
parent.appendChild(child);
parent.removeChild(child);

// 7. Changing classes (if affects layout)
element.classList.add('larger'); // .larger { width: 500px; }

// 8. Reading layout properties (forces synchronous reflow!)
const width = element.offsetWidth;
const height = element.offsetHeight;
const top = element.offsetTop;
const rect = element.getBoundingClientRect();
```

**What Triggers Repaint (No Reflow):**

```javascript
// ✅ CHEAPER - Only repaint, no reflow

// 1. Changing colors
element.style.color = 'red';
element.style.backgroundColor = 'blue';

// 2. Changing visibility (layout space preserved)
element.style.visibility = 'hidden'; // vs display: none

// 3. Changing borders (if width doesn't change)
element.style.borderColor = 'red';
element.style.outline = '2px solid blue';

// 4. Changing backgrounds
element.style.backgroundImage = 'url(...)';
element.style.backgroundPosition = 'center';

// 5. Changing shadows
element.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
element.style.textShadow = '1px 1px 2px black';
```

**What Triggers Neither (Compositing Only):**

```javascript
// ⚡ FASTEST - GPU-accelerated, no reflow/repaint

// 1. Transform (translate, rotate, scale)
element.style.transform = 'translateX(100px)';
element.style.transform = 'rotate(45deg)';
element.style.transform = 'scale(1.5)';

// 2. Opacity
element.style.opacity = '0.5';

// 3. Filter (with will-change or layer)
element.style.filter = 'blur(5px)';
```

**Performance Comparison:**

```javascript
const box = document.querySelector('.box');

// Test 1: Reflow (SLOWEST)
console.time('reflow');
for (let i = 0; i < 1000; i++) {
  box.style.width = `${100 + i}px`; // Forces reflow each time!
}
console.timeEnd('reflow'); // ~150ms

// Test 2: Repaint (FASTER)
console.time('repaint');
for (let i = 0; i < 1000; i++) {
  box.style.backgroundColor = `rgb(${i % 255}, 0, 0)`;
}
console.timeEnd('repaint'); // ~50ms

// Test 3: Compositing (FASTEST)
console.time('composite');
for (let i = 0; i < 1000; i++) {
  box.style.transform = `translateX(${i}px)`;
}
console.timeEnd('composite'); // ~2ms
```

**The Reflow Problem - Layout Thrashing:**

```javascript
// ❌ BAD: Read-Write-Read-Write pattern (forces sync reflows)
const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
  const width = box.offsetWidth;  // READ (forces reflow)
  box.style.width = `${width + 10}px`; // WRITE (invalidates layout)
  // Next iteration: READ again forces ANOTHER reflow
});

// Performance: 1000 boxes = 1000 reflows! (~500ms)
```

**Optimized - Batch Reads, Then Batch Writes:**

```javascript
// ✅ GOOD: Separate reads and writes
const boxes = document.querySelectorAll('.box');

// 1. Read all first (triggers 1 reflow)
const widths = Array.from(boxes).map(box => box.offsetWidth);

// 2. Write all (triggers 1 reflow at end)
boxes.forEach((box, i) => {
  box.style.width = `${widths[i] + 10}px`;
});

// Performance: 1000 boxes = 2 reflows total! (~2ms)
// 250x faster!
```

**Using requestAnimationFrame:**

```javascript
// ❌ BAD: Immediate style changes (may cause layout thrashing)
function animate() {
  const box = document.querySelector('.box');
  let pos = 0;

  setInterval(() => {
    pos += 1;
    box.style.left = pos + 'px'; // Forces reflow every 16ms
  }, 16);
}

// ✅ GOOD: Batched with requestAnimationFrame
function animateOptimized() {
  const box = document.querySelector('.box');
  let pos = 0;

  function step() {
    pos += 1;
    box.style.transform = `translateX(${pos}px)`; // GPU-accelerated
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
```

**DocumentFragment for Multiple DOM Changes:**

```javascript
// ❌ BAD: Multiple reflows (adding 100 elements one by one)
const container = document.querySelector('.container');

for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div); // Reflow on every append!
}
// Performance: 100 reflows (~200ms)

// ✅ GOOD: Single reflow using DocumentFragment
const container = document.querySelector('.container');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div); // No reflow (fragment not in DOM)
}

container.appendChild(fragment); // Single reflow!
// Performance: 1 reflow (~2ms)
// 100x faster!
```

**CSS Class Toggle vs Inline Styles:**

```javascript
// ❌ BAD: Multiple inline style changes
const box = document.querySelector('.box');
box.style.width = '200px';
box.style.height = '200px';
box.style.backgroundColor = 'blue';
box.style.border = '2px solid red';
box.style.padding = '10px';
// 5 reflows!

// ✅ GOOD: Single class toggle
const box = document.querySelector('.box');
box.classList.add('highlighted');
// 1 reflow!

// CSS:
// .highlighted {
//   width: 200px;
//   height: 200px;
//   background-color: blue;
//   border: 2px solid red;
//   padding: 10px;
// }
```

<details>
<summary><strong>🔍 Deep Dive: Rendering Pipeline & Browser Internals</strong></summary>

**Full Rendering Pipeline (Chrome/Blink):**

```
JavaScript → Style Calculation → Layout → Paint → Composite
    ↓             ↓                ↓        ↓         ↓
  DOM change    Recalc styles   Reflow   Repaint   Layers
```

**Stage-by-Stage Breakdown:**

**1. JavaScript Execution:**
```javascript
// Triggers style/layout/paint changes
element.style.width = '500px';
element.classList.add('active');
element.innerHTML = 'New content';
```

**2. Style Calculation (Recalc Styles):**
```javascript
// Browser recalculates computed styles

// Example:
<div class="box" style="width: 200px;">

// Computed style (after cascade):
{
  width: '200px',           // From inline
  height: '100px',          // From .box class
  backgroundColor: 'blue',  // From .box class
  margin: '0',              // Browser default
  padding: '10px',          // From .box class
  // ... + inherited properties
}

// Cost: ~0.05ms per element (simple styles)
//       ~0.5ms per element (complex selectors)
```

**3. Layout (Reflow):**
```javascript
// Calculates geometry of each element

// Example layout calculation:
const parentWidth = 1000; // px
const element = {
  styles: {
    width: '50%',
    padding: '20px',
    margin: '10px',
    border: '5px',
    boxSizing: 'border-box'
  }
};

// Layout calculation:
const width = parentWidth * 0.5; // 500px
const contentWidth = width - (20 * 2) - (5 * 2); // 450px

const layoutBox = {
  x: 10,           // margin-left
  y: 10,           // margin-top
  width: 500,      // border-box width
  height: 'auto',  // calculated from content
  contentWidth: 450,
  contentHeight: 'auto',
};

// Cost: ~0.1-1ms per element
//       Can cascade to children (expensive!)
```

**4. Paint:**
```javascript
// Creates paint operations (display list)

// For element with:
// background: blue;
// border: 2px solid red;
// color: white;

const paintOps = [
  { op: 'drawRect', rect: [0, 0, 500, 300], fill: 'blue' },
  { op: 'drawBorder', rect: [0, 0, 500, 300], width: 2, stroke: 'red' },
  { op: 'drawText', text: 'Hello', pos: [10, 150], fill: 'white' },
];

// Cost: ~0.5-5ms depending on complexity
```

**5. Composite:**
```javascript
// Combines layers on GPU

// Layer tree:
Document Layer
  ├─ Main Layer (CPU-painted)
  ├─ Transform Layer (GPU)
  │   └─ element with transform: translateX(...)
  ├─ Opacity Layer (GPU)
  │   └─ element with opacity: 0.5
  └─ Video Layer (GPU)

// Cost: ~1-2ms (GPU accelerated)
```

**What Properties Trigger What:**

```javascript
// Comprehensive list

// REFLOW + REPAINT (Most expensive):
const reflow Properties = [
  // Box model
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border', 'border-width',

  // Position
  'top', 'right', 'bottom', 'left',
  'position', 'float', 'clear',

  // Display
  'display', 'vertical-align', 'overflow', 'overflow-x', 'overflow-y',

  // Text
  'font-size', 'font-family', 'font-weight', 'line-height',
  'text-align', 'white-space', 'word-wrap',
];

// REPAINT only (Cheaper):
const repaintProperties = [
  // Colors
  'color', 'background', 'background-color', 'background-image',
  'background-position', 'background-repeat', 'background-size',

  // Borders (if width unchanged)
  'border-color', 'border-style',

  // Visual
  'outline', 'outline-color', 'outline-style', 'outline-width',
  'box-shadow', 'text-shadow',
  'visibility', // Note: NOT display!

  // Cursor
  'cursor',
];

// COMPOSITE only (Fastest - GPU):
const compositeProperties = [
  'transform',  // translate, rotate, scale, skew
  'opacity',
  'filter',     // blur, brightness, contrast (with will-change)
];
```

**Layout Propagation (Why Reflow is Expensive):**

```javascript
// Reflow can affect:
// 1. The element itself
// 2. All children (recursive)
// 3. All siblings after it
// 4. Parent (if size affects parent)
// 5. Entire document (worst case)

// Example:
<div id="parent">
  <div id="child1">...</div>
  <div id="child2">       ← Change this
    <div id="grandchild1">...</div>
    <div id="grandchild2">...</div>
  </div>
  <div id="child3">...</div>
  <div id="child4">...</div>
</div>

// Changing child2 width triggers layout for:
// - child2 itself
// - grandchild1, grandchild2 (children)
// - child3, child4 (following siblings)
// - Possibly parent (if flex/grid/auto size)

// Result: 5-6 elements recalculated for 1 change!
```

**Forced Synchronous Layout (Layout Thrashing):**

```javascript
// The most common performance killer

// ❌ BAD: Read → Write → Read → Write
for (let i = 0; i < 100; i++) {
  const width = element.offsetWidth;  // FORCES LAYOUT
  element.style.width = width + 1 + 'px'; // INVALIDATES LAYOUT
  // Next iteration forces ANOTHER layout!
}

// What happens internally:
// Iteration 1:
//   Read offsetWidth → Layout flag set → Force layout (2ms)
//   Write width → Invalidate layout
// Iteration 2:
//   Read offsetWidth → Layout flag set → Force layout (2ms)
//   Write width → Invalidate layout
// ... 100 times = 200ms!

// ✅ GOOD: Batch reads, then batch writes
const widths = [];
for (let i = 0; i < 100; i++) {
  widths.push(element.offsetWidth); // All reads (1 layout)
}
for (let i = 0; i < 100; i++) {
  element.style.width = widths[i] + 1 + 'px'; // All writes
}
// Result: 2 layouts total = 4ms (50x faster!)
```

**Properties That Force Synchronous Layout:**

```javascript
// Reading these properties FORCES immediate layout:

// Geometry
element.offsetWidth
element.offsetHeight
element.offsetTop
element.offsetLeft
element.clientWidth
element.clientHeight
element.clientTop
element.clientLeft

// Scroll
element.scrollWidth
element.scrollHeight
element.scrollTop
element.scrollLeft

// Methods
element.getBoundingClientRect()
element.getClientRects()
window.getComputedStyle(element)

// Scroll methods
element.scrollIntoView()
element.scrollTo()

// Window
window.scrollX
window.scrollY
window.innerHeight
window.innerWidth

// Example:
console.time('forced-layout');
for (let i = 0; i < 1000; i++) {
  const width = element.offsetWidth; // FORCES layout 1000 times!
}
console.timeEnd('forced-layout'); // ~500ms

// Compare to:
console.time('cached-layout');
const width = element.offsetWidth; // Forces layout ONCE
for (let i = 0; i < 1000; i++) {
  const w = width; // Uses cached value
}
console.timeEnd('cached-layout'); // ~0.1ms (5000x faster!)
```

**Layout Boundaries (Containment):**

```javascript
// CSS containment creates layout boundaries

// Without containment:
<div class="container">
  <div class="item">
    <!-- Changing width here affects entire container -->
  </div>
</div>

// With containment:
<div class="container" style="contain: layout;">
  <div class="item">
    <!-- Changing width here only affects .container children -->
  </div>
</div>

// CSS contain property:
.container {
  contain: layout;        // Layout boundary
  contain: paint;         // Paint boundary
  contain: size;          // Size doesn't depend on children
  contain: style;         // Scoped counters/quotes
  contain: strict;        // All of the above
  contain: content;       // layout + paint + style
}

// Performance benefit:
// Without contain: Reflow can affect 1000s of elements
// With contain: Reflow limited to container children only
// Speedup: 10-100x depending on DOM size
```

**Content Visibility API:**

```javascript
// Modern API for ultra-efficient rendering

// Before (traditional):
.long-list-item {
  /* Always rendered, even off-screen */
}

// After (content-visibility):
.long-list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px; /* Placeholder size */
}

// How it works:
// 1. Browser skips rendering off-screen elements
// 2. Uses placeholder size for layout
// 3. Renders only when near viewport

// Performance:
// 10,000 items list:
//   Without: 2000ms initial render
//   With: 50ms initial render (40x faster!)
```

**Layer Promotion:**

```javascript
// Browser creates composite layers for:

// Automatic layer promotion:
<video>               // Always layered
<canvas>              // Always layered
<iframe>              // Always layered

// CSS-triggered layers:
.element {
  will-change: transform;     // Promotes to layer
  will-change: opacity;       // Promotes to layer
  transform: translateZ(0);   // Hack to promote
  transform: translate3d(0,0,0); // Hack to promote
}

// Why layers matter:
// - Changes to layer don't affect other layers
// - GPU-accelerated compositing
// - No reflow/repaint for transform/opacity changes

// Trade-off:
// - Each layer uses GPU memory (~1MB per layer)
// - Too many layers = performance degradation
// - Use wisely!
```

**Paint Complexity:**

```javascript
// Different paint operations have different costs

// CHEAP paint operations (~0.1ms):
- Solid colors
- Simple borders
- Text (simple fonts)

// MODERATE paint operations (~1-5ms):
- Gradients
- Box shadows (small blur)
- Border radius
- Images (already decoded)

// EXPENSIVE paint operations (~10-50ms):
- Complex gradients (multiple stops)
- Large blur radius
- SVG filters
- Complex text (custom fonts, ligatures)
- Canvas drawing

// Example:
// Simple box:
.box {
  background: blue;
  border: 1px solid red;
}
// Paint time: ~0.2ms

// Complex box:
.box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  border-radius: 10px;
  filter: blur(5px);
}
// Paint time: ~15ms (75x slower!)
```

**Debugging Reflow/Repaint:**

```javascript
// Chrome DevTools techniques

// 1. Performance tab:
// Record → Perform action → Analyze timeline
// Look for purple bars (Layout) and green bars (Paint)

// 2. Rendering tab:
// ✅ Paint flashing (shows repaint regions)
// ✅ Layout Shift Regions (shows layout changes)
// ✅ Layer borders (shows composite layers)
// ✅ Frame Rendering Stats (shows FPS)

// 3. Coverage tab:
// Shows unused CSS (causes unnecessary style recalc)

// 4. Console logging:
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 16) { // Slower than 60fps
      console.warn('Slow frame:', entry.duration, 'ms');
    }
  }
});
observer.observe({ entryTypes: ['measure'] });

// 5. Manual timing:
performance.mark('start-layout');
// ... layout-triggering code ...
performance.mark('end-layout');
performance.measure('layout-duration', 'start-layout', 'end-layout');
const measures = performance.getEntriesByName('layout-duration');
console.log('Layout took:', measures[0].duration, 'ms');
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Janky Scroll Performance</strong></summary>

**Scenario**: Your infinite scroll product listing page is stuttering and janky on mobile devices. Users report "laggy scrolling" and "freezing". Google PageSpeed Insights shows "Avoid large layout shifts" warnings. The page has 500+ product cards, and scroll performance drops to 15 FPS (target: 60 FPS).

**Production Metrics (Before Fix):**
- **Scroll FPS**: 15-20 FPS (Target: 60 FPS)
- **Layout time per frame**: 45ms (Budget: 10ms)
- **Paint time per frame**: 25ms (Budget: 2ms)
- **Total frame time**: 80ms (Budget: 16ms for 60 FPS)
- **User complaints**: 85 tickets/week about "laggy scroll"
- **Bounce rate**: 28% on mobile
- **Cumulative Layout Shift (CLS)**: 0.42 (Target: <0.1)

**The Problem Code:**

```javascript
// ❌ CRITICAL BUG: Layout thrashing during scroll

const productCards = document.querySelectorAll('.product-card');

window.addEventListener('scroll', () => {
  productCards.forEach(card => {
    // ❌ PROBLEM 1: Reading offsetTop forces synchronous layout
    const cardTop = card.offsetTop;
    const windowBottom = window.scrollY + window.innerHeight;

    // ❌ PROBLEM 2: Reading getBoundingClientRect() AGAIN
    const rect = card.getBoundingClientRect();

    if (rect.top < windowBottom) {
      // ❌ PROBLEM 3: Modifying class triggers style recalc
      card.classList.add('visible');

      // ❌ PROBLEM 4: Changing width triggers reflow
      card.style.width = `${card.offsetWidth * 1.05}px`; // 5% grow on visible

      // ❌ PROBLEM 5: Animating height triggers reflow every frame
      const img = card.querySelector('.product-image');
      img.style.height = `${img.offsetHeight + 2}px`; // Grow slowly
    }
  });

  // ❌ PROBLEM 6: Scroll listener with NO throttle
  // Fires 100+ times per second during scroll!
});

// Performance analysis:
// - 500 cards × (2 forced layouts + 2 style changes + 2 reflows) = 3000 operations per scroll event
// - Scroll events: ~100/sec
// - Total: 300,000 operations/sec
// - Frame time: 80ms (should be 16ms)
// - FPS: 12 (should be 60)
// Result: COMPLETELY JANKY SCROLL
```

**Debugging Process:**

**Step 1: Chrome DevTools Performance Analysis**

```javascript
// Record scroll performance in DevTools

// Timeline shows:
// ┌─────────────────────────────────────┐
// │ Frame 1 (80ms) ⚠️                  │
// ├─────────────────────────────────────┤
// │ Script: 15ms                         │
// │ Layout: 45ms ⚠️ (FORCED 500 TIMES!) │
// │ Paint: 25ms ⚠️                      │
// │ Composite: 5ms                       │
// └─────────────────────────────────────┘
//
// Warning: "Forced synchronous layout"
// Warning: "Long task" (>50ms)
// Warning: "Layout thrashing"

// Call tree analysis:
// scroll event handler (80ms)
//   └─ forEach loop (75ms)
//       ├─ offsetTop getter (30ms) ← FORCED LAYOUT 500x
//       ├─ getBoundingClientRect() (20ms) ← FORCED LAYOUT 500x
//       ├─ classList.add() (10ms)
//       └─ style changes (15ms) ← TRIGGERS REFLOW
```

**Step 2: Identify Forced Synchronous Layouts**

```javascript
// Add performance marks to pinpoint issues

window.addEventListener('scroll', () => {
  performance.mark('scroll-start');

  productCards.forEach((card, i) => {
    performance.mark(`card-${i}-start`);

    const cardTop = card.offsetTop; // ⚠️ DevTools highlights this line!
    // Warning: "Forced reflow while executing JavaScript"

    performance.mark(`card-${i}-end`);
  });

  performance.mark('scroll-end');
  performance.measure('scroll-handler', 'scroll-start', 'scroll-end');

  const measure = performance.getEntriesByName('scroll-handler')[0];
  if (measure.duration > 16) {
    console.warn(`Scroll handler took ${measure.duration}ms (budget: 16ms)`);
  }
});

// Output:
// ⚠️ Scroll handler took 82ms (budget: 16ms)
// ⚠️ Forced reflow: 500 times
// ⚠️ Frame dropped: Yes
```

**Step 3: Fix with Intersection Observer (Eliminates Layout Reads)**

```javascript
// ✅ FIX 1: Use Intersection Observer instead of scroll listener

// Intersection Observer is:
// - Async (doesn't block main thread)
// - No layout thrashing
// - Optimized by browser
// - Fires only when visibility changes (not every scroll pixel)

const observerOptions = {
  root: null, // viewport
  rootMargin: '50px', // Start loading 50px before visible
  threshold: 0.1, // Trigger when 10% visible
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;

      // ✅ FIX 2: Use class toggle (1 style recalc)
      card.classList.add('visible');

      // No layout reads needed!
      // Browser tells us visibility via entry.isIntersecting
    }
  });
}, observerOptions);

// Observe all product cards
productCards.forEach(card => observer.observe(card));

// Performance:
// - Before: 80ms per scroll event, 500 forced layouts
// - After: ~0.5ms when card enters viewport, 0 forced layouts
// - Speedup: 160x faster!
```

**Step 4: Fix Animations with CSS Transforms (GPU-Accelerated)**

```javascript
// ❌ BAD: Animating width/height (triggers reflow)
card.style.width = `${card.offsetWidth * 1.05}px`;
img.style.height = `${img.offsetHeight + 2}px`;

// ✅ GOOD: Use CSS transforms (compositing only)
// CSS:
.product-card {
  transition: transform 0.3s ease;
}

.product-card.visible {
  transform: scale(1.05); // GPU-accelerated!
}

// JavaScript:
if (entry.isIntersecting) {
  card.classList.add('visible'); // Triggers CSS transition
}

// Performance:
// - Before: 15ms reflow per card
// - After: 0ms reflow (GPU handles it)
```

**Step 5: Batch DOM Reads and Writes**

```javascript
// If you MUST read layout properties, batch them

// ❌ BAD: Read-write-read-write
cards.forEach(card => {
  const width = card.offsetWidth; // Read
  card.style.width = width + 10 + 'px'; // Write
  const height = card.offsetHeight; // Read (FORCES LAYOUT AGAIN)
  card.style.height = height + 10 + 'px'; // Write
});
// Result: 4 layouts per card × 500 cards = 2000 layouts

// ✅ GOOD: Read all, then write all
const dimensions = cards.map(card => ({
  width: card.offsetWidth,
  height: card.offsetHeight,
}));
// 1 layout for all reads

cards.forEach((card, i) => {
  card.style.width = dimensions[i].width + 10 + 'px';
  card.style.height = dimensions[i].height + 10 + 'px';
});
// 1 layout for all writes

// Result: 2 layouts total (1000x improvement!)
```

**Step 6: Use requestAnimationFrame for Animations**

```javascript
// ❌ BAD: setInterval for animations
setInterval(() => {
  card.style.left = position + 'px'; // May not align with frame
}, 16);

// ✅ GOOD: requestAnimationFrame (syncs with browser's paint cycle)
function animate() {
  // All DOM writes here happen in one batch
  card.style.transform = `translateX(${position}px)`;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Benefits:
// - Automatically throttles to 60 FPS
// - Pauses when tab inactive (saves battery)
// - Batches with browser's rendering pipeline
```

**Step 7: Virtual Scrolling for Large Lists**

```javascript
// For 1000s of items, only render visible ones

// ✅ Virtual scrolling implementation
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleItems = [];

    this.render();
    this.container.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.render());
    });
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;

    // Calculate visible range
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / this.itemHeight);

    // Only render visible items
    this.container.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      if (this.items[i]) {
        const item = this.createItem(this.items[i], i);
        this.container.appendChild(item);
      }
    }
  }

  createItem(data, index) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = `${index * this.itemHeight}px`;
    div.textContent = data;
    return div;
  }
}

// Usage:
const scroller = new VirtualScroller(
  document.querySelector('.product-list'),
  products, // 10,000 items
  200 // px per item
);

// Performance:
// - Before: Render 10,000 items = 5000ms
// - After: Render ~10 visible items = 5ms (1000x faster!)
```

**Production Metrics (After All Fixes):**

```javascript
// Before optimization:
// - Scroll FPS: 15-20 FPS
// - Layout time: 45ms/frame
// - Paint time: 25ms/frame
// - Frame time: 80ms
// - User complaints: 85/week
// - Bounce rate: 28%
// - CLS: 0.42

// After optimization:
// - Scroll FPS: 60 FPS ✅
// - Layout time: 0.5ms/frame (↓ 90x) ✅
// - Paint time: 1.5ms/frame (↓ 17x) ✅
// - Frame time: 4ms (↓ 20x) ✅
// - User complaints: 2/week (↓ 98%) ✅
// - Bounce rate: 8% (↓ 71%) ✅
// - CLS: 0.02 (↓ 95%) ✅
// - Mobile performance score: 45 → 94 (+49 points)

// Techniques used:
// 1. Intersection Observer (eliminated scroll listener)
// 2. CSS transforms (eliminated reflow-triggering animations)
// 3. Batch DOM reads/writes (eliminated layout thrashing)
// 4. requestAnimationFrame (aligned with browser paint cycle)
// 5. Virtual scrolling (rendered only visible items)
// 6. will-change hints (promoted animated elements to layers)
// 7. content-visibility: auto (deferred off-screen rendering)

// Business impact:
// - Mobile conversion: +35%
// - Page views per session: +22%
// - User satisfaction: +88%
// - Support costs: -$12,000/month
```

**Key Lessons Learned:**

1. **Layout thrashing is the #1 scroll performance killer**
2. **Intersection Observer > scroll listeners** (async, optimized)
3. **Transform/opacity > width/height** (compositing > reflow)
4. **Batch reads, then batch writes** (minimize layouts)
5. **requestAnimationFrame > setInterval** (sync with browser)
6. **Virtual scrolling for 500+ items** (render only visible)
7. **Profile first, optimize second** (measure, don't guess)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Performance Optimization Strategies</strong></summary>

| Technique | Performance | Complexity | Browser Support | Memory |
|-----------|-------------|------------|-----------------|--------|
| **Intersection Observer** | ⚡ Excellent | 🟢 Low | ✅ Modern browsers | 🟢 Low |
| **Virtual Scrolling** | ⚡ Excellent | 🔴 High | ✅ All browsers | 🟡 Medium |
| **CSS Transforms** | ⚡ Excellent | 🟢 Low | ✅ All browsers | 🟢 Low |
| **will-change** | ⚡ Good | 🟢 Low | ✅ Modern browsers | 🔴 High (GPU) |
| **DocumentFragment** | ⚡ Good | 🟢 Low | ✅ All browsers | 🟢 Low |
| **RequestAnimationFrame** | ⚡ Excellent | 🟢 Low | ✅ All browsers | 🟢 Low |
| **CSS Containment** | ⚡ Excellent | 🟢 Low | 🟡 Limited | 🟢 Low |
| **content-visibility** | ⚡ Excellent | 🟢 Low | 🟡 Chromium only | 🟢 Low |

**Decision Matrix:**

```javascript
// Scenario 1: Scroll-based visibility detection
// ✅ BEST: Intersection Observer
// - Async, no layout thrashing
// - 100x faster than scroll listener
// - Native browser optimization

// Scenario 2: Animating position
// ✅ BEST: CSS transform
// - GPU-accelerated
// - No reflow/repaint
// - Smooth 60 FPS

// Scenario 3: Large lists (1000+ items)
// ✅ BEST: Virtual scrolling
// - Only render visible items
// - Constant performance regardless of list size
// - Trade-off: More complex code

// Scenario 4: Adding many DOM nodes
// ✅ BEST: DocumentFragment
// - Single reflow vs N reflows
// - Simple API
// - 100x faster for 100+ nodes

// Scenario 5: Complex animations
// ✅ BEST: requestAnimationFrame + transform
// - Syncs with browser paint
// - GPU-accelerated
// - Pauses when tab hidden
```

**Performance Budget Guidelines:**

```javascript
// For 60 FPS: Budget is 16ms per frame

// Frame time breakdown:
// - JavaScript: <3ms
// - Style calculation: <1ms
// - Layout: <2ms
// - Paint: <2ms
// - Composite: <2ms
// - Browser overhead: ~6ms
// Total: 16ms ✅

// Red flags:
// ⚠️ Layout > 10ms: Layout thrashing likely
// ⚠️ Paint > 10ms: Complex painting or too many layers
// ⚠️ Script > 50ms: Long tasks, blocking main thread
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Reflow vs Repaint</strong></summary>

**Simple Explanation:**

Imagine you're rearranging furniture in your house:

**Reflow** = Moving furniture (expensive, hard work)
- Browser recalculates WHERE everything goes
- "The couch moved, so the table needs to move too"
- Triggered by changing size, position, adding/removing elements

**Repaint** = Painting furniture (cheaper, less work)
- Browser redraws WHAT it looks like
- "The couch is in the same place, just a different color now"
- Triggered by changing color, background, shadows

**Key Difference:**
- Reflow = "Where is it?" → Expensive (must recalculate all positions)
- Repaint = "What does it look like?" → Cheaper (just redraw pixels)

**Visual Example:**

```javascript
// Reflow (SLOW - like rearranging furniture):
element.style.width = '500px'; // "Move everything to make room!"

// Repaint (FAST - like repainting furniture):
element.style.backgroundColor = 'blue'; // "Just change the color!"

// Composite (FASTEST - like using a mirror):
element.style.transform = 'translateX(100px)'; // "GPU magic!"
```

**Analogy for a PM:**

"Think of a web page like a document in Google Docs:

1. **Reflow** = Changing font size or margins
   - Everything shifts around, page numbers change
   - Slow because it affects the whole document

2. **Repaint** = Highlighting text in yellow
   - Just the color changes, everything stays in place
   - Faster because no shifting

3. **Composite** = Using the 'Suggestions' mode
   - Overlay appears instantly, no document reflow
   - Fastest because it's a separate layer

That's why animating `transform` (composite) is faster than animating `width` (reflow)!"

**Common Mistake:**

```javascript
// ❌ SLOW (100 reflows):
for (let i = 0; i < 100; i++) {
  card.style.width = `${i}px`; // Reflow on every change!
}

// ✅ FAST (1 reflow):
card.style.transform = `scaleX(${scale})`; // GPU handles it!
```

**Key Takeaway:**
- Use `transform` and `opacity` for animations (GPU-accelerated, no reflow)
- Avoid changing `width`, `height`, `top`, `left` during animations
- Batch DOM reads together, then batch DOM writes together

</details>

### Resources

- [MDN: Reflow and Repaint](https://developer.mozilla.org/en-US/docs/Glossary/Reflow)
- [Google Developers: Rendering Performance](https://developers.google.com/web/fundamentals/performance/rendering)
- [CSS Triggers](https://csstriggers.com/)
