# Critical Rendering Path

> **Focus**: Browser rendering fundamentals and performance optimization

---

## Question 1: What is the Critical Rendering Path?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the Critical Rendering Path (CRP) and its stages from HTML to pixels on screen.

### Answer

The **Critical Rendering Path (CRP)** is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on the screen. Understanding CRP is crucial for optimizing page load performance and First Contentful Paint (FCP).

**The 5 Key Stages:**

1. **DOM Construction** - Parse HTML → Build DOM tree
2. **CSSOM Construction** - Parse CSS → Build CSSOM tree
3. **Render Tree Creation** - Combine DOM + CSSOM → Render tree (only visible elements)
4. **Layout (Reflow)** - Calculate position and size of each element
5. **Paint** - Draw pixels to screen

### Code Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Stage 2: CSSOM Construction */
    .hidden { display: none; }
    .visible { color: blue; font-size: 16px; }
  </style>
</head>
<body>
  <!-- Stage 1: DOM Construction -->
  <div class="visible">Hello World</div>
  <div class="hidden">Not rendered</div>

  <script>
    // Blocks DOM construction until executed
    console.log('Script executed');
  </script>
</body>
</html>
```

**Visual Flow:**

```
HTML Bytes → Characters → Tokens → Nodes → DOM Tree
  ↓
CSS Bytes → Characters → Tokens → Nodes → CSSOM Tree
  ↓
DOM + CSSOM → Render Tree (only visible nodes)
  ↓
Layout (calculate geometry)
  ↓
Paint (draw pixels)
  ↓
Composite (layer composition)
```

**Example DOM Tree:**

```javascript
// HTML:
// <div id="root">
//   <p class="text">Hello</p>
//   <span>World</span>
// </div>

// DOM Tree:
Document
  └─ html
      ├─ head
      └─ body
          └─ div#root
              ├─ p.text
              │   └─ TextNode("Hello")
              └─ span
                  └─ TextNode("World")
```

**Example CSSOM Tree:**

```css
/* CSS: */
body { margin: 0; }
div { padding: 10px; }
.text { color: blue; }
```

```javascript
// CSSOM Tree:
body: { margin: 0 }
  └─ div: { padding: 10px }
      └─ p.text: { color: blue, padding: 10px, margin: 0 } // Inherited + cascaded
```

**Render Tree (Combines DOM + CSSOM):**

```javascript
// Only visible nodes
RenderObject(div#root)
  ├─ RenderObject(p.text) { color: blue, padding: 10px }
  └─ RenderObject(span) { padding: 10px }

// Note: Elements with display:none are NOT in render tree
```

**Critical Rendering Path Metrics:**

```javascript
// Measuring CRP in DevTools
window.addEventListener('load', () => {
  const perfData = window.performance.timing;

  const domConstruction = perfData.domInteractive - perfData.domLoading;
  const cssomConstruction = perfData.domContentLoadedEventStart - perfData.domLoading;
  const renderTree = perfData.domComplete - perfData.domInteractive;

  console.log('DOM Construction:', domConstruction, 'ms');
  console.log('CSSOM Construction:', cssomConstruction, 'ms');
  console.log('Render Tree + Layout + Paint:', renderTree, 'ms');
});
```

**Blocking vs Non-Blocking Resources:**

```html
<!-- CSS blocks rendering (render-blocking) -->
<link rel="stylesheet" href="styles.css">

<!-- JavaScript blocks DOM construction (parser-blocking) -->
<script src="app.js"></script>

<!-- Async scripts don't block DOM construction -->
<script async src="analytics.js"></script>

<!-- Defer scripts execute after DOM is ready -->
<script defer src="main.js"></script>

<!-- Preload critical resources -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image">
```

**Optimizing CRP - Critical CSS:**

```html
<head>
  <!-- Inline critical CSS for above-the-fold content -->
  <style>
    /* Critical CSS - blocks rendering but small payload */
    .hero { height: 400px; background: blue; }
    .nav { height: 60px; }
  </style>

  <!-- Non-critical CSS loaded asynchronously -->
  <link rel="preload" href="non-critical.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
</head>
```

**JavaScript Impact on CRP:**

```html
<!-- ❌ BAD: Blocks DOM construction -->
<head>
  <script src="large-bundle.js"></script>
</head>
<body>
  <h1>Page content...</h1>
</body>

<!-- ✅ GOOD: Deferred or at end of body -->
<head>
  <script defer src="main.js"></script>
</head>
<body>
  <h1>Page content...</h1>
</body>

<!-- ✅ BEST: Async for independent scripts -->
<head>
  <script async src="analytics.js"></script>
  <script defer src="main.js"></script>
</head>
```

<details>
<summary><strong>🔍 Deep Dive: Browser Internals & Rendering Engine Architecture</strong></summary>

**Browser Rendering Engine Architecture:**

Different browsers use different rendering engines with similar CRP stages:

**Chrome/Edge (Blink):**
```
HTML Parser → DOM Tree
CSS Parser → CSSOM Tree
  ↓
Style Calculation (Recalc Styles)
  ↓
Layout (Blink LayoutObject tree)
  ↓
Paint (SkPicture recording)
  ↓
Composite (GPU layers)
```

**Firefox (Gecko):**
```
HTML Parser → Content Tree
CSS Parser → Style Rules
  ↓
Frame Construction (Reflow)
  ↓
Painting
  ↓
Compositing
```

**Safari (WebKit):**
```
HTML Parser → DOM Tree
CSS Parser → Style Sheets
  ↓
Render Tree Construction
  ↓
Layout
  ↓
Painting
  ↓
Compositing
```

**Detailed DOM Construction Process:**

```javascript
// Example HTML parsing
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="app">
      <h1>Hello</h1>
      <script src="app.js"></script>
      <p>World</p>
    </div>
  </body>
</html>
`;

// Browser parsing sequence:
// 1. Tokenization (HTML → Tokens)
// 2. Tree Construction (Tokens → Nodes)
// 3. Script Execution (blocks until script loads/runs)
// 4. Continue parsing after script

// Timeline:
// 0ms: Start HTML parsing
// 2ms: DOM node: html
// 3ms: DOM node: head
// 4ms: DOM node: title, TextNode("Example")
// 5ms: Discover <link> → Fetch style.css (doesn't block DOM, blocks render)
// 6ms: DOM node: body
// 7ms: DOM node: div#app
// 8ms: DOM node: h1, TextNode("Hello")
// 9ms: Discover <script> → BLOCK! Fetch app.js
// 150ms: app.js loaded and executed
// 151ms: Resume parsing, DOM node: p, TextNode("World")
// 152ms: DOM construction complete (domInteractive)
// 200ms: CSS loaded, CSSOM ready
// 201ms: Render tree construction begins
// 205ms: Layout calculation
// 210ms: Paint
// 215ms: First Contentful Paint (FCP)
```

**CSSOM Construction Deep Dive:**

```javascript
// CSS parsing is INCREMENTAL but render is BLOCKING
// Browser builds CSSOM while downloading CSS

// Example CSS:
const css = `
body { margin: 0; font-family: Arial; }
.container { max-width: 1200px; margin: 0 auto; }
.button { padding: 10px 20px; background: blue; }
.button:hover { background: darkblue; }
`;

// CSSOM Structure (simplified):
{
  body: {
    margin: '0',
    fontFamily: 'Arial',
    // + browser defaults
  },
  '.container': {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  '.button': {
    padding: '10px 20px',
    background: 'blue',
  },
  '.button:hover': {
    background: 'darkblue',
  }
}

// CSS specificity calculation:
// Inline styles: 1000 points
// IDs: 100 points
// Classes/attributes/pseudo-classes: 10 points
// Elements/pseudo-elements: 1 point

// Example:
// div.container#main { ... }  → 100 + 10 + 1 = 111
// .button:hover { ... }        → 10 + 10 = 20
```

**Style Calculation (Recalc Styles):**

```javascript
// After DOM + CSSOM ready, browser calculates final styles

// Example DOM node:
<div class="container primary" id="main" style="color: red;">

// Style calculation order:
// 1. Browser default styles (user agent stylesheet)
// 2. External stylesheets
// 3. <style> tags
// 4. Inline styles (highest priority)
// 5. !important declarations override all

// Computed style result:
{
  // From browser defaults
  display: 'block',
  boxSizing: 'content-box',

  // From external stylesheet
  maxWidth: '1200px',
  margin: '0 auto',
  backgroundColor: 'blue',

  // From inline style (overrides)
  color: 'red',

  // Inherited from parent
  fontFamily: 'Arial',
  fontSize: '16px',

  // Calculated values
  width: '1200px', // resolved from max-width
  height: 'auto',
}
```

**Render Tree Construction Algorithm:**

```javascript
// Pseudo-code for render tree construction
function buildRenderTree(domNode, cssom) {
  // Skip non-visual elements
  if (domNode.tagName === 'script' ||
      domNode.tagName === 'meta' ||
      domNode.tagName === 'link') {
    return null;
  }

  // Calculate styles for this node
  const computedStyle = calculateStyles(domNode, cssom);

  // Skip if display: none
  if (computedStyle.display === 'none') {
    return null;
  }

  // Create render object
  const renderObject = {
    type: domNode.tagName,
    styles: computedStyle,
    children: []
  };

  // Recursively process children
  for (const child of domNode.children) {
    const childRenderObject = buildRenderTree(child, cssom);
    if (childRenderObject) {
      renderObject.children.push(childRenderObject);
    }
  }

  return renderObject;
}

// Example usage:
const domTree = document.documentElement;
const cssom = /* ... */;
const renderTree = buildRenderTree(domTree, cssom);
```

**Layout Calculation (Box Model):**

```javascript
// Layout phase calculates exact pixel positions

// Example element:
<div style="
  width: 50%;
  padding: 20px;
  margin: 10px;
  border: 5px solid black;
  box-sizing: border-box;
">

// Parent width: 1000px

// Layout calculation:
const parentWidth = 1000;
const width = parentWidth * 0.5; // 500px

// box-sizing: border-box means width INCLUDES padding + border
const contentWidth = width - (20 * 2) - (5 * 2); // 500 - 40 - 10 = 450px

// Final box dimensions:
{
  marginBox: { width: 520, height: 'auto' },  // 500 + 10*2
  borderBox: { width: 500, height: 'auto' },  // specified width
  paddingBox: { width: 490, height: 'auto' }, // 500 - 5*2
  contentBox: { width: 450, height: 'auto' }, // 500 - 40 - 10

  position: {
    x: 10, // margin-left
    y: 10, // margin-top
  }
}
```

**Paint Phase Optimization:**

```javascript
// Browser creates paint records (display list)

// Example paint operations for:
// <div style="background: blue; border: 2px solid red; color: white;">
//   Hello
// </div>

const paintOperations = [
  { op: 'drawRect', rect: [0, 0, 100, 50], color: 'blue' },
  { op: 'drawBorder', rect: [0, 0, 100, 50], width: 2, color: 'red' },
  { op: 'drawText', text: 'Hello', pos: [10, 30], color: 'white', font: 'Arial 16px' },
];

// Browser optimizes:
// - Groups similar operations
// - Culls off-screen elements
// - Caches paint records
```

**Composite Layers:**

```javascript
// Browser creates compositing layers for:
// - 3D transforms
// - will-change
// - <video>, <canvas>
// - Elements with opacity animations
// - overflow: scroll

// Example layer tree:
<div class="page">
  <header style="position: fixed;">...</header>  // Layer 1
  <main>
    <div style="transform: translateZ(0);">...</div>  // Layer 2
    <video>...</video>  // Layer 3
  </main>
</div>

// Compositor thread combines layers:
// GPU Process:
//   Layer 1 (fixed header) → GPU Texture
//   Layer 2 (3D transform) → GPU Texture
//   Layer 3 (video) → GPU Texture
//
//   Final frame = composite all textures
```

**CRP Performance Metrics:**

```javascript
// Using Performance API
const perfEntries = performance.getEntriesByType('navigation')[0];

const metrics = {
  // DNS lookup
  dns: perfEntries.domainLookupEnd - perfEntries.domainLookupStart,

  // TCP connection
  tcp: perfEntries.connectEnd - perfEntries.connectStart,

  // Request + Response
  request: perfEntries.responseStart - perfEntries.requestStart,
  response: perfEntries.responseEnd - perfEntries.responseStart,

  // DOM Processing
  domLoading: perfEntries.domInteractive - perfEntries.domLoading,
  domInteractive: perfEntries.domInteractive,
  domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.domContentLoadedEventStart,
  domComplete: perfEntries.domComplete,

  // Load event
  loadEvent: perfEntries.loadEventEnd - perfEntries.loadEventStart,

  // Total time
  totalTime: perfEntries.loadEventEnd - perfEntries.fetchStart,
};

console.table(metrics);

// Chrome-specific: paint timing
const paintEntries = performance.getEntriesByType('paint');
const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
const lcp = paintEntries.find(e => e.name === 'largest-contentful-paint');

console.log('First Contentful Paint:', fcp?.startTime);
console.log('Largest Contentful Paint:', lcp?.startTime);
```

**Critical Path Length:**

```javascript
// CRP length = number of round trips required

// Example 1: Minimal CRP (1 round trip)
// - Inline CSS, inline JS, no external resources
// CRP Length: 1

// Example 2: External CSS (2 round trips)
// - HTML fetch → Discover CSS → CSS fetch
// CRP Length: 2

// Example 3: CSS + Blocking JS (3 round trips)
// - HTML → CSS → Blocking JS
// CRP Length: 3

// Optimization: Reduce CRP length
// ✅ Inline critical CSS
// ✅ Defer non-critical JS
// ✅ Async non-critical resources
// ✅ Preload critical resources
```

**Preload & Resource Hints:**

```html
<!-- DNS prefetch (resolve DNS early) -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- Preconnect (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://api.example.com">

<!-- Preload (high priority fetch) -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.woff2" as="font" crossorigin>

<!-- Prefetch (low priority, for next navigation) -->
<link rel="prefetch" href="next-page.html">

<!-- Prerender (speculatively render page) -->
<link rel="prerender" href="likely-next.html">
```

**Service Worker Impact on CRP:**

```javascript
// Service worker can intercept requests and serve from cache

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - skip network entirely!
      if (response) {
        return response; // CRP: 0 round trips!
      }

      // Cache miss - fetch from network
      return fetch(event.request);
    })
  );
});

// With aggressive caching:
// - HTML: from cache (0ms)
// - CSS: from cache (0ms)
// - JS: from cache (0ms)
// - Images: from cache (0ms)
//
// Total CRP time: ~10ms (parsing only!)
// vs 500-2000ms without cache
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Slow First Contentful Paint</strong></summary>

**Scenario**: Your e-commerce homepage has a First Contentful Paint (FCP) of 4.2 seconds on 3G networks, causing a 35% bounce rate. Google Search Console shows "Slow FCP" warnings affecting SEO rankings. Marketing reports $50,000/month revenue loss from poor mobile performance.

**Production Metrics (Before Fix):**
- **FCP**: 4,200ms (Target: <1,800ms)
- **LCP**: 6,800ms (Target: <2,500ms)
- **TTI**: 8,500ms (Target: <3,800ms)
- **Bounce rate**: 35% (mobile)
- **Revenue impact**: -$50,000/month
- **SEO ranking**: Dropped 15 positions
- **User complaints**: 127 tickets/month about "slow loading"

**The Problem Code:**

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ❌ PROBLEM 1: Render-blocking CSS (450KB!) -->
  <link rel="stylesheet" href="bootstrap.css">
  <link rel="stylesheet" href="font-awesome.css">
  <link rel="stylesheet" href="slick-carousel.css">
  <link rel="stylesheet" href="custom-styles.css">
  <link rel="stylesheet" href="responsive.css">

  <!-- ❌ PROBLEM 2: Web fonts blocking render -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=auto" rel="stylesheet">

  <!-- ❌ PROBLEM 3: Parser-blocking JavaScript in <head> -->
  <script src="jquery-3.6.0.min.js"></script>
  <script src="bootstrap.bundle.min.js"></script>
  <script src="slick.min.js"></script>
  <script src="analytics.js"></script>
  <script src="main.js"></script>
</head>
<body>
  <!-- Above-the-fold content -->
  <header class="hero">
    <h1>Welcome to Our Store</h1>
    <img src="hero-image-4k.jpg" alt="Hero"> <!-- ❌ 2.5MB image! -->
  </header>

  <!-- Below-the-fold content -->
  <section class="products">
    <!-- 50 product cards with images -->
  </section>
</body>
</html>
```

**Chrome DevTools Analysis:**

```javascript
// Performance timeline shows:

// 0ms: Navigation start
// 50ms: HTML received (25KB)
// 100ms: DOM parsing starts
// 150ms: Discovers 5 CSS files
// 150ms-1200ms: Downloading CSS (450KB total)
//   ↓ RENDER BLOCKED - WHITE SCREEN
// 1200ms: CSSOM ready
// 1250ms: Discovers 5 JS files in <head>
//   ↓ PARSER BLOCKED - Still WHITE SCREEN
// 1250ms-2800ms: Downloading + executing JS (850KB total)
// 2800ms: DOM parsing resumes
// 2900ms: Discovers hero-image-4k.jpg
// 2900ms-4200ms: Downloading hero image (2.5MB)
// 4200ms: First Contentful Paint ⚠️ (WAY TOO SLOW!)
// 6800ms: Largest Contentful Paint
// 8500ms: Time to Interactive

// Critical Rendering Path issues:
// 1. CRP length: 4 (HTML → CSS → JS → Images)
// 2. Total blocking time: 4200ms
// 3. Render-blocking CSS: 1050ms
// 4. Parser-blocking JS: 1600ms
// 5. Unnecessary resources in critical path
```

**Debugging Process:**

**Step 1: Identify Critical Resources**

```javascript
// Use Coverage tool in Chrome DevTools
// Results:
// - bootstrap.css: 85% unused (only need 15%)
// - font-awesome.css: 95% unused (only 3 icons)
// - slick-carousel.css: 100% unused above-fold
// - custom-styles.css: 40% critical, 60% below-fold
// - responsive.css: 30% critical

// JavaScript coverage:
// - jquery.js: 70% unused
// - bootstrap.bundle.js: 90% unused above-fold
// - slick.js: 100% unused above-fold
// - analytics.js: Not needed for rendering
// - main.js: 20% critical, 80% event handlers
```

**Step 2: Measure CRP with PerformanceObserver**

```javascript
// Add monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'resource') {
      console.log(`${entry.name}:
        Duration: ${entry.duration}ms
        Blocking: ${entry.renderBlockingStatus}
        Size: ${entry.transferSize} bytes
      `);
    }
  }
});

observer.observe({ entryTypes: ['resource', 'paint', 'navigation'] });

// Results show:
// bootstrap.css: 450ms download, render-blocking
// jquery.js: 380ms download + 120ms parse, parser-blocking
// hero-image-4k.jpg: 1300ms download, blocks LCP
```

**Step 3: Optimize Critical CSS**

```html
<head>
  <!-- ✅ FIX 1: Inline critical CSS (above-the-fold only) -->
  <style>
    /* Critical CSS extracted with tools like Critical or Penthouse */
    /* Only styles needed for above-the-fold content */
    .hero {
      height: 400px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero h1 {
      font-size: 48px;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    }
    /* Total: ~3KB inlined */
  </style>

  <!-- ✅ FIX 2: Async load non-critical CSS -->
  <link rel="preload" href="non-critical.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>

  <!-- ✅ FIX 3: Optimize web fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">

  <!-- ✅ FIX 4: Defer non-critical JavaScript -->
  <script defer src="main.js"></script>
  <script async src="analytics.js"></script>

  <!-- ✅ FIX 5: Preload critical resources -->
  <link rel="preload" href="hero-image-optimized.webp" as="image">
</head>
<body>
  <header class="hero">
    <h1>Welcome to Our Store</h1>
    <!-- ✅ FIX 6: Optimized image with srcset -->
    <img
      src="hero-image-optimized.webp"
      srcset="hero-small.webp 640w, hero-medium.webp 1280w, hero-large.webp 1920w"
      sizes="100vw"
      alt="Hero"
      width="1920"
      height="400"
      loading="eager"
    >
    <!-- Image size: 2.5MB → 85KB (WebP + compression) -->
  </header>

  <!-- ✅ FIX 7: Lazy load below-fold content -->
  <section class="products">
    <img src="product1.webp" loading="lazy" alt="Product 1">
    <img src="product2.webp" loading="lazy" alt="Product 2">
    <!-- ... -->
  </section>
</body>
</html>
```

**Step 4: Bundle Optimization**

```javascript
// webpack.config.js - Split bundles

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Critical code (inline or high priority)
        critical: {
          test: /critical/,
          priority: 20,
        },
        // Vendor code (cached separately)
        vendor: {
          test: /node_modules/,
          priority: 10,
        },
        // Everything else (lazy loaded)
        default: {
          priority: 0,
        },
      },
    },
  },
};

// Result:
// Before: 1 bundle (850KB)
// After:
//   - critical.js (12KB) - inlined
//   - vendor.js (200KB) - defer loaded
//   - main.js (150KB) - defer loaded
//   - analytics.js (50KB) - async loaded
```

**Step 5: Resource Hints & Preload**

```html
<head>
  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://cdn.example.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Preload critical resources -->
  <link rel="preload" href="critical.css" as="style">
  <link rel="preload" href="hero.webp" as="image">
  <link rel="preload" href="main.woff2" as="font" type="font/woff2" crossorigin>

  <!-- DNS prefetch for non-critical origins -->
  <link rel="dns-prefetch" href="https://analytics.google.com">
</head>
```

**Production Metrics (After Fix):**

```javascript
// Performance improvements:

// Before:
// - FCP: 4,200ms
// - LCP: 6,800ms
// - TTI: 8,500ms
// - Total CSS: 450KB (5 files)
// - Total JS: 850KB (5 files)
// - Hero image: 2.5MB
// - CRP length: 4
// - Render blocking time: 1,050ms
// - Parser blocking time: 1,600ms

// After:
// - FCP: 1,200ms (↓ 71%, 3.5x faster!) ✅
// - LCP: 1,800ms (↓ 74%, 3.8x faster!) ✅
// - TTI: 2,400ms (↓ 72%, 3.5x faster!) ✅
// - Critical CSS: 3KB (inlined)
// - Non-critical CSS: 95KB (async)
// - Critical JS: 12KB (inlined)
// - Deferred JS: 350KB
// - Hero image: 85KB WebP (↓ 97%)
// - CRP length: 1 (HTML only!)
// - Render blocking time: 0ms ✅
// - Parser blocking time: 0ms ✅

// Business impact:
// - Bounce rate: 35% → 12% (↓ 66%)
// - Revenue: +$85,000/month (+170%)
// - SEO ranking: Recovered +22 positions
// - User complaints: 127 → 8/month (↓ 94%)
// - Mobile conversion: +45%
// - Core Web Vitals: All green ✅
// - Lighthouse score: 45 → 96 (+51 points)
```

**Advanced Optimization: HTTP/2 Server Push**

```javascript
// Server-side (Node.js + HTTP/2)
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
});

server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    // Push critical resources before HTML
    stream.pushStream({ ':path': '/critical.css' }, (err, pushStream) => {
      pushStream.respondWithFile('critical.css');
    });

    stream.pushStream({ ':path': '/critical.js' }, (err, pushStream) => {
      pushStream.respondWithFile('critical.js');
    });

    // Then send HTML
    stream.respondWithFile('index.html');
  }
});

// Result: Resources arrive before browser even requests them!
// FCP: 1,200ms → 800ms (↓ 33%)
```

**Key Lessons Learned:**

```javascript
// ❌ MISTAKES THAT KILLED PERFORMANCE:
// 1. All CSS in <head> blocking render (1,050ms wasted)
// 2. All JS in <head> blocking parse (1,600ms wasted)
// 3. Massive libraries for tiny features (95% unused code)
// 4. Unoptimized images (2.5MB hero image)
// 5. No resource prioritization
// 6. No code splitting
// 7. Synchronous loading of everything

// ✅ WHAT FIXED IT:
// 1. Inline critical CSS (~3KB above-fold only)
// 2. Async load non-critical CSS
// 3. Defer all JavaScript
// 4. Remove unused code (tree shaking)
// 5. WebP images + compression (97% size reduction)
// 6. Resource hints (preconnect, preload)
// 7. Code splitting (critical vs non-critical)
// 8. Lazy loading below-fold content
// 9. HTTP/2 server push for critical resources
// 10. Service worker caching for repeat visits
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Critical CSS vs Full Stylesheet</strong></summary>

| Approach | FCP | Maintenance | Cache | Complexity |
|----------|-----|-------------|-------|------------|
| **Inline Critical CSS** | ⚡ Fast (no request) | 😰 High (extract/update) | ❌ No (in HTML) | 🔴 High |
| **External CSS (sync)** | 🐌 Slow (blocks render) | ✅ Easy | ✅ Yes | 🟢 Low |
| **External CSS (async)** | ⚡ Medium (FOUC risk) | ✅ Easy | ✅ Yes | 🟡 Medium |
| **CSS-in-JS** | 🐌 Slow (runtime cost) | ✅ Easy (component) | ❌ Limited | 🟡 Medium |

**Performance Comparison (3G network, 10KB critical CSS):**

```javascript
// Scenario 1: External CSS (traditional)
// HTML (25KB): 200ms
// CSS (50KB): 800ms ← BLOCKS RENDER
// FCP: 1000ms
// TTI: 1500ms

// Scenario 2: Inline Critical CSS
// HTML (25KB + 10KB inline CSS): 280ms
// Non-critical CSS (40KB): 600ms (async, doesn't block)
// FCP: 280ms ✅ (3.6x faster!)
// TTI: 900ms

// Scenario 3: All CSS inlined
// HTML (25KB + 50KB CSS): 600ms
// FCP: 600ms
// TTI: 800ms
// Issue: No caching, large HTML, wasted bandwidth on revisits

// Winner: Inline critical + async non-critical
```

**When to Use Each:**

```javascript
// ✅ Inline Critical CSS when:
// - FCP is critical metric (e-commerce, landing pages)
// - Above-fold content is small and stable
// - You have build tooling to extract critical CSS
// - Target: <3KB critical CSS

// ✅ External CSS (defer) when:
// - Content changes frequently
// - Large CSS file (>50KB)
// - Strong caching strategy
// - Team lacks build tooling

// ✅ CSS-in-JS when:
// - Component-based architecture (React, Vue)
// - Dynamic theming required
// - You can afford runtime cost
// - SSR available to mitigate FOUC

// ❌ Avoid external sync CSS when:
// - FCP is critical
// - Mobile performance matters
// - CSS file is large (>20KB)
```

**Code Splitting Strategies:**

```javascript
// Strategy 1: Route-based splitting
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));

// Only loads CSS for current route

// Strategy 2: Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}

// Strategy 3: Conditional loading
if (window.matchMedia('(min-width: 1024px)').matches) {
  import('./desktop-styles.css');
} else {
  import('./mobile-styles.css');
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Critical Rendering Path</strong></summary>

**Simple Explanation:**

Imagine you're building a house. The Critical Rendering Path is the fastest route from "empty lot" to "house you can see and touch."

**The 5 Steps (House Analogy):**

1. **DOM Construction** = Reading the blueprint
   - Browser reads HTML like a contractor reads blueprints
   - Builds a tree of what elements exist (walls, doors, windows)

2. **CSSOM Construction** = Reading the paint/design plan
   - Browser reads CSS to know colors, sizes, positions
   - "The living room wall should be blue, the door should be 6 feet tall"

3. **Render Tree** = Combining blueprint + design
   - Only includes things you can actually SEE
   - Skips hidden elements (display: none)
   - Like ignoring internal wiring in the blueprint (you don't see it)

4. **Layout** = Measuring and marking positions
   - Calculate exact pixel positions: "Button goes at x=100, y=200"
   - Like marking floor where furniture will go

5. **Paint** = Actually building/painting
   - Draw pixels to screen
   - Like actually painting walls, placing furniture

**Visual Timeline:**

```
Your HTML:                  What Browser Does:
-----------                 ------------------
<html>                  →   Start reading (DOM)
  <head>
    <style>             →   Read styles (CSSOM)
      h1 { color: blue; }
    </style>
  </head>
  <body>
    <h1>Hello</h1>      →   Combine (Render Tree)
  </body>                   Calculate position (Layout)
</html>                     Draw on screen (Paint)

                            You see: Blue "Hello"
```

**Why Speed Matters:**

```javascript
// Slow website = People leave
// Every 1 second delay = 7% fewer sales

// ❌ Slow Critical Path (4 seconds):
<head>
  <link rel="stylesheet" href="huge-file.css">  // Browser waits...
  <script src="huge-app.js"></script>          // Still waiting...
</head>
// User sees: WHITE SCREEN for 4 seconds → User leaves! 😞

// ✅ Fast Critical Path (<1 second):
<head>
  <style>/* Small critical CSS here */</style>
  <script defer src="app.js"></script>  // Doesn't block!
</head>
// User sees: Content in 1 second → User stays! 😊
```

**Analogy for a PM:**

"The Critical Rendering Path is like a restaurant kitchen preparing your meal. If the chef has to:

1. ❌ **Slow way**: Walk to the grocery store (fetch CSS), come back, then start cooking
   - You wait 30 minutes, get frustrated, leave

2. ✅ **Fast way**: Have ingredients ready (inline CSS), cook immediately
   - You get food in 5 minutes, happy customer

That's why we inline critical CSS and defer JavaScript – we're 'prepping ingredients' so the 'meal' (webpage) is ready instantly!"

**Common Beginner Mistakes:**

```html
<!-- ❌ MISTAKE: Everything in <head> -->
<head>
  <link rel="stylesheet" href="bootstrap.css">
  <link rel="stylesheet" href="main.css">
  <script src="jquery.js"></script>
  <script src="app.js"></script>
</head>
<!-- Browser downloads everything before showing ANYTHING -->

<!-- ✅ CORRECT: Optimize the critical path -->
<head>
  <style>/* Critical CSS only (small!) */</style>
  <script defer src="app.js"></script>
</head>
<body>
  <!-- Content shows FAST -->
</body>
```

**Key Takeaways:**

1. **Critical Path = Shortest route to visible content**
2. **CSS blocks rendering** (no CSS = no paint)
3. **JS blocks parsing** (browser waits for scripts)
4. **Inline critical CSS** (< 3KB for above-fold)
5. **Defer non-critical resources** (load later)
6. **Optimize images** (biggest files, slowest load)

</details>

### Resources

- [MDN: Critical Rendering Path](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path)
- [Google Developers: Render-Blocking Resources](https://developers.google.com/web/tools/lighthouse/audits/blocking-resources)
- [Web.dev: Optimize CSS](https://web.dev/optimize-css/)
