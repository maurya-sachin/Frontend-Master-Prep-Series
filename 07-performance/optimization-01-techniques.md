# Performance Optimization Techniques

> **Master web performance - Core Web Vitals, rendering optimization, bundle size reduction, and caching strategies**

---

## Question 1: What are Core Web Vitals and how do you optimize them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Netflix, Airbnb

### Question
Explain Core Web Vitals. What are LCP, FID, and CLS? How do you measure and optimize each?

### Answer

Core Web Vitals are Google's key metrics for measuring user experience on the web.

1. **The Three Metrics**
   - **LCP (Largest Contentful Paint)** - Loading performance (should be < 2.5s)
   - **FID (First Input Delay)** - Interactivity (should be < 100ms)
   - **CLS (Cumulative Layout Shift)** - Visual stability (should be < 0.1)

2. **LCP Optimization**
   - Optimize server response time
   - Preload critical resources
   - Optimize images (WebP, lazy loading)
   - Remove render-blocking JavaScript/CSS
   - Use CDN for static assets

3. **FID Optimization**
   - Minimize JavaScript execution time
   - Code splitting and lazy loading
   - Use Web Workers for heavy tasks
   - Defer non-critical JavaScript
   - Reduce main thread work

4. **CLS Optimization**
   - Reserve space for images/ads (width/height attributes)
   - Avoid inserting content above existing content
   - Use CSS transform for animations
   - Preload fonts with font-display: swap
   - Avoid dynamic content injection

### Code Example

```javascript
// LCP OPTIMIZATION

// 1. Preload critical resources
<link rel="preload" href="/hero-image.jpg" as="image">
<link rel="preload" href="/critical-font.woff2" as="font" crossorigin>

// 2. Optimize images
<img
  src="hero.jpg"
  alt="Hero"
  width="1200"
  height="600"  // Prevents CLS
  loading="lazy"  // Lazy load below fold
  decoding="async"  // Non-blocking
/>

// 3. Modern image formats
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>

// 4. Responsive images
<img
  srcset="
    hero-small.jpg 480w,
    hero-medium.jpg 800w,
    hero-large.jpg 1200w
  "
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="hero-large.jpg"
  alt="Hero"
/>

// FID OPTIMIZATION

// 1. Code splitting with dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// 2. Defer non-critical JavaScript
<script src="analytics.js" defer></script>
<script src="chat-widget.js" async></script>

// 3. Use Web Workers for heavy computation
// main.js
const worker = new Worker('heavy-calc.js');

worker.postMessage({ data: largeDataset });

worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// heavy-calc.js (Web Worker)
self.onmessage = (e) => {
  const result = heavyCalculation(e.data);
  self.postMessage(result);
};

// 4. Request Idle Callback
function processQueue(deadline) {
  while (deadline.timeRemaining() > 0 && queue.length > 0) {
    const task = queue.shift();
    processTask(task);
  }

  if (queue.length > 0) {
    requestIdleCallback(processQueue);
  }
}

requestIdleCallback(processQueue);

// CLS OPTIMIZATION

// 1. Reserve space for images
<img
  src="banner.jpg"
  width="1200"
  height="300"  // Browser reserves space
  style={{ aspectRatio: '4/1' }}  // Modern CSS
  alt="Banner"
/>

// 2. Reserve space for ads
<div class="ad-container" style={{ minHeight: '250px' }}>
  <!-- Ad loads here -->
</div>

// 3. Avoid layout shifts from fonts
<style>
  @font-face {
    font-family: 'Custom Font';
    src: url('/font.woff2') format('woff2');
    font-display: swap;  // Show fallback until loaded
  }
</style>

// 4. Preload fonts
<link
  rel="preload"
  href="/font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>

// 5. Avoid dynamic content injection
// ❌ Bad: Causes CLS
function loadBanner() {
  const banner = document.createElement('div');
  banner.textContent = 'Breaking News!';
  document.body.prepend(banner);  // Shifts all content down
}

// ✅ Good: Reserve space
<div id="banner-slot" style={{ minHeight: '60px' }}>
  <!-- Banner loads here without shifting content -->
</div>

// 6. Use CSS transform for animations (doesn't trigger layout)
// ❌ Bad: Triggers layout
.box {
  transition: top 0.3s;
}
.box:hover {
  top: -10px;  // Triggers layout recalculation
}

// ✅ Good: GPU accelerated
.box {
  transition: transform 0.3s;
}
.box:hover {
  transform: translateY(-10px);  // GPU layer, no layout
}

// MEASURING CORE WEB VITALS

// 1. Web Vitals Library (Google)
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);

// 2. Performance Observer API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.renderTime || entry.loadTime);
    }
  }
});

observer.observe({ entryTypes: ['largest-contentful-paint'] });

// 3. Measure FID
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'first-input') {
      console.log('FID:', entry.processingStart - entry.startTime);
    }
  }
});

observer.observe({ entryTypes: ['first-input'] });

// 4. Measure CLS
let clsScore = 0;

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      console.log('CLS:', clsScore);
    }
  }
});

observer.observe({ entryTypes: ['layout-shift'] });

// REAL-WORLD: Next.js Optimization
// next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,  // Optimize CSS
  },
};

// pages/_app.js - Load analytics after interaction
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Load analytics after page is interactive
    const loadAnalytics = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          import('./analytics').then(({ init }) => init());
        });
      } else {
        setTimeout(() => {
          import('./analytics').then(({ init }) => init());
        }, 1);
      }
    };

    loadAnalytics();
  }, []);

  return <Component {...pageProps} />;
}
```

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Common Mistakes

❌ **Mistake:** Not reserving space for images
```html
<!-- Causes CLS -->
<img src="hero.jpg" alt="Hero">
```

✅ **Correct:** Always specify dimensions
```html
<img src="hero.jpg" width="1200" height="600" alt="Hero">
```

❌ **Mistake:** Blocking rendering with large JavaScript
```html
<!-- Blocks rendering -->
<script src="heavy-app.js"></script>
```

✅ **Correct:** Defer or code-split
```html
<script src="heavy-app.js" defer></script>
<!-- Or use dynamic imports for code splitting -->
```

### Follow-up Questions

- "How do you measure Core Web Vitals in production?"
- "What tools do you use for performance monitoring?"
- "How does server-side rendering affect LCP?"
- "What's the difference between FID and Total Blocking Time (TBT)?"

### Resources

- [Web Vitals](https://web.dev/vitals/)
- [Optimize LCP](https://web.dev/optimize-lcp/)
- [Optimize FID](https://web.dev/optimize-fid/)
- [Optimize CLS](https://web.dev/optimize-cls/)

---

<details>
<summary><strong>🔍 Deep Dive: Core Web Vitals Measurement Internals</strong></summary>

### How LCP is Measured

LCP tracks the render time of the largest visible content element in the viewport. The browser uses a sophisticated algorithm to determine this:

**Browser Implementation:**

1. **Performance Observer API**: The browser creates `PerformanceObserver` entries for every paint operation. The LCP candidate changes as larger elements appear during page load.

2. **Element Selection Process**:
   - Browser tracks all "contentful" elements (images, video posters, text blocks, SVG)
   - Only considers elements visible in viewport (above the fold)
   - Updates LCP candidate when larger element appears
   - Stops tracking after first user interaction (click, scroll, keypress)

3. **Timing Calculation**:
   ```
   LCP = renderTime || loadTime
   ```
   - `renderTime`: When element finished painting (for images loaded from cache)
   - `loadTime`: When resource finished loading (for network-loaded images)

4. **What Counts as LCP Element**:
   - `<img>` elements
   - `<image>` inside `<svg>`
   - `<video>` poster images
   - Elements with CSS `background-image`
   - Block-level text nodes

**Chrome Implementation Details:**

```cpp
// Chromium source (simplified)
class LargestContentfulPaintCalculator {
  void OnPaint(Element* element) {
    if (!element->IsVisible() || !element->IsInViewport()) return;

    double size = element->GetSize();
    if (size > largest_size_) {
      largest_size_ = size;
      largest_element_ = element;
      lcp_time_ = CurrentTime();
    }
  }

  void OnUserInput() {
    // Stop tracking LCP after first interaction
    is_tracking_ = false;
  }
};
```

### How FID is Measured

FID measures the delay between when a user first interacts with your page and when the browser can actually respond.

**Browser Event Loop Mechanics:**

1. **Input Event Queue**: When user clicks/types, browser adds event to input queue
2. **Main Thread Blocking**: If JavaScript is executing, event waits in queue
3. **FID Calculation**:
   ```
   FID = event.processingStart - event.startTime
   ```
   - `startTime`: When input event occurred
   - `processingStart`: When main thread became available to process it

**Why FID Matters - JavaScript Task Breakdown:**

```javascript
// Long task (blocks main thread for 200ms)
function longTask() {
  const start = performance.now();
  while (performance.now() - start < 200) {
    // Blocking computation
  }
}

// User clicks during this task → FID = 200ms (poor!)

// Solution: Break into chunks
function chunkedTask() {
  function processChunk(data, index) {
    // Process small chunk
    processData(data[index]);

    if (index < data.length - 1) {
      // Yield to browser, allow user input
      setTimeout(() => processChunk(data, index + 1), 0);
    }
  }

  processChunk(largeDataset, 0);
}
```

**Chrome's Input Delay Tracking:**

```cpp
class FirstInputDelayTracker {
  void OnInput(InputEvent* event) {
    if (first_input_recorded_) return;

    double delay = event->processingStart - event->timeStamp;
    ReportFID(delay);
    first_input_recorded_ = true;
  }
};
```

### How CLS is Calculated

CLS measures visual stability by tracking unexpected layout shifts.

**Layout Shift Score Formula:**

```
layout shift score = impact fraction × distance fraction
```

**Impact Fraction**: Percentage of viewport affected by shift
**Distance Fraction**: Distance elements moved relative to viewport

**Example Calculation:**

```javascript
// Element shifts from top: 100px to top: 200px
// Viewport height: 800px
// Element height: 100px

// Impact fraction = (100 + 100) / 800 = 0.25 (25% of viewport)
// Distance fraction = 100 / 800 = 0.125 (12.5% movement)
// Layout shift score = 0.25 × 0.125 = 0.03125

// CLS = sum of all layout shift scores during page lifetime
```

**What Triggers Layout Shifts:**

1. **Images without dimensions**: Browser reserves 0px, then expands when loaded
2. **Web fonts**: FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text)
3. **Dynamic content injection**: Ads, embeds, iframes
4. **Animations using CSS properties that trigger layout**: `top`, `left`, `width`, `height`

**Chrome's Layout Shift Detection:**

```cpp
class LayoutShiftTracker {
  void OnLayoutChange(Element* element) {
    if (element->hadRecentInput()) return; // Ignore user-initiated shifts

    Rect oldBounds = element->previousBounds();
    Rect newBounds = element->currentBounds();

    double impactFraction = CalculateImpactFraction(oldBounds, newBounds);
    double distanceFraction = CalculateDistanceFraction(oldBounds, newBounds);

    double shiftScore = impactFraction * distanceFraction;
    cumulative_cls_score_ += shiftScore;
  }
};
```

### Advanced Measurement with PerformanceObserver

```javascript
// Comprehensive monitoring of all Core Web Vitals
class CoreWebVitalsMonitor {
  constructor() {
    this.metrics = {
      lcp: [],
      fid: null,
      cls: 0,
      clsEntries: []
    };

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      // LCP candidate can change, track all
      entries.forEach(entry => {
        this.metrics.lcp.push({
          time: entry.renderTime || entry.loadTime,
          size: entry.size,
          element: entry.element,
          url: entry.url
        });
      });
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        // Only first input matters for FID
        if (!this.metrics.fid) {
          this.metrics.fid = {
            delay: entry.processingStart - entry.startTime,
            name: entry.name, // "click", "keydown", etc.
            startTime: entry.startTime,
            duration: entry.duration
          };
        }
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  observeCLS() {
    let sessionValue = 0;
    let sessionEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Ignore layout shifts from user input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // New session if > 1 second gap or > 5 seconds total
          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          // Update max session value
          if (sessionValue > this.metrics.cls) {
            this.metrics.cls = sessionValue;
            this.metrics.clsEntries = [...sessionEntries];
          }
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }

  // Send to analytics
  reportMetrics() {
    // Get final LCP value (largest)
    const finalLCP = this.metrics.lcp[this.metrics.lcp.length - 1];

    return {
      lcp: finalLCP?.time,
      fid: this.metrics.fid?.delay,
      cls: this.metrics.cls,
      // Additional context
      lcpElement: finalLCP?.element.tagName,
      lcpUrl: finalLCP?.url,
      fidEvent: this.metrics.fid?.name,
      clsElements: this.metrics.clsEntries.map(e => ({
        element: e.sources?.[0]?.node.tagName,
        score: e.value
      }))
    };
  }
}

// Usage
const monitor = new CoreWebVitalsMonitor();

// Report on page hide (user leaving)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const metrics = monitor.reportMetrics();
    navigator.sendBeacon('/analytics', JSON.stringify(metrics));
  }
});
```

### Field Data vs Lab Data

**Field Data (Real User Monitoring)**:
- Collected from actual users via Chrome User Experience Report (CrUX)
- Reflects real network conditions, devices, user behaviors
- Used for ranking in Google Search
- Tools: Chrome UX Report, PageSpeed Insights, Search Console

**Lab Data (Synthetic Testing)**:
- Simulated in controlled environment
- Consistent, reproducible
- Good for debugging, development
- Tools: Lighthouse, WebPageTest, Chrome DevTools

**Why Both Matter:**

```javascript
// Field data might show LCP = 4.5s (poor)
// Lab data shows LCP = 2.1s (good)

// Reasons for discrepancy:
// - Users on slow 3G connections
// - Users on low-end devices
// - Users in distant geographic regions
// - Third-party scripts blocking render
// - Ad networks injecting heavy content

// Solution: Test with throttling
// Chrome DevTools → Network → Slow 3G
// Chrome DevTools → Performance → CPU 6x slowdown
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Site Core Web Vitals Crisis</strong></summary>

### The Problem

**Company**: Major e-commerce platform (10M monthly users)
**Impact**: Google Search traffic dropped 35% after Core Web Vitals became ranking factor
**Revenue Loss**: $2.3M monthly

**Initial Metrics (Field Data - CrUX)**:
```
LCP: 4.8s (Poor - 85th percentile)
FID: 340ms (Poor - 95th percentile)
CLS: 0.42 (Poor - 90th percentile)

Google Search Console:
- 78% of pages flagged as "Poor" experience
- Mobile performance worse than desktop
- Organic traffic down 35% YoY
```

### Root Cause Analysis

**Step 1: Set Up Monitoring**

```javascript
// Added comprehensive RUM (Real User Monitoring)
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics({ name, value, id, delta }) {
  const body = JSON.stringify({
    metric: name,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    id,
    delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
    // Device context
    deviceType: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    connection: navigator.connection?.effectiveType,
    // Page context
    page: window.location.pathname,
    // User context
    userId: getCookie('userId'),
    sessionId: getCookie('sessionId')
  });

  navigator.sendBeacon('/analytics/web-vitals', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

**Step 2: Segment Data**

After 1 week of data collection:

```
Desktop Users:
LCP: 2.8s (Needs Improvement)
FID: 120ms (Needs Improvement)
CLS: 0.15 (Needs Improvement)

Mobile Users (70% of traffic):
LCP: 6.2s (Poor!) ← PRIMARY ISSUE
FID: 450ms (Poor!)
CLS: 0.58 (Poor!)

By Page Type:
Product Detail Pages: LCP 7.1s, CLS 0.64
Category Pages: LCP 5.8s, CLS 0.52
Homepage: LCP 4.2s, CLS 0.35
```

**Step 3: Lighthouse Debugging**

```bash
# Mobile throttling (3G, CPU 4x slowdown)
lighthouse https://example.com/product/12345 \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --only-categories=performance \
  --output=json

# Results revealed:
# - LCP element: <img> hero product image (2.4MB!)
# - Blocking resources: 1.2s render-blocking CSS
# - Long tasks: 8 tasks over 50ms (total 3.2s)
# - Layout shifts: Multiple from ads, reviews, related products
```

### The Fixes (Prioritized by Impact)

**Fix 1: LCP Optimization - Product Images**

Problem: 2.4MB unoptimized JPEG hero images

```javascript
// Before: Single large image
<img src="/products/hero-12345.jpg" alt="Product" />
// Size: 2.4MB, Format: JPEG, Dimensions: 4000×4000px

// After: Responsive, modern formats, optimized
<picture>
  <source
    type="image/avif"
    srcset="
      /products/hero-12345-400.avif 400w,
      /products/hero-12345-800.avif 800w,
      /products/hero-12345-1200.avif 1200w
    "
  />
  <source
    type="image/webp"
    srcset="
      /products/hero-12345-400.webp 400w,
      /products/hero-12345-800.webp 800w,
      /products/hero-12345-1200.webp 1200w
    "
  />
  <img
    src="/products/hero-12345-800.jpg"
    srcset="
      /products/hero-12345-400.jpg 400w,
      /products/hero-12345-800.jpg 800w,
      /products/hero-12345-1200.jpg 1200w
    "
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="Product"
    width="1200"
    height="1200"
    fetchpriority="high"
  />
</picture>

// Image optimization results:
// AVIF 400w: 18KB (99% reduction!)
// WebP 400w: 32KB (98.6% reduction)
// JPEG 400w: 45KB (98.1% reduction)
```

**Image CDN Configuration (Cloudinary)**:

```javascript
// Automatic format conversion, responsive sizing
const imageUrl = cloudinary.url('products/hero-12345', {
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }, // Auto AVIF/WebP
    { width: 'auto', crop: 'scale', dpr: 'auto' }
  ]
});
```

**Fix 2: FID Optimization - Code Splitting**

Problem: 1.8MB JavaScript bundle blocking main thread

```javascript
// Before: Monolithic bundle
import React from 'react';
import { ProductDetails } from './ProductDetails';
import { Reviews } from './Reviews';
import { RelatedProducts } from './RelatedProducts';
import { RecentlyViewed } from './RecentlyViewed';
import { Recommendations } from './Recommendations';
import { ChatWidget } from './ChatWidget';

function ProductPage() {
  return (
    <>
      <ProductDetails />
      <Reviews />
      <RelatedProducts />
      <RecentlyViewed />
      <Recommendations />
      <ChatWidget />
    </>
  );
}

// Bundle size: 1.8MB (minified)
// Main thread blocking: 3.2s
```

```javascript
// After: Aggressive code splitting
import React, { lazy, Suspense } from 'react';
import { ProductDetails } from './ProductDetails'; // Critical, loaded immediately

// Lazy load everything below the fold
const Reviews = lazy(() => import('./Reviews'));
const RelatedProducts = lazy(() => import('./RelatedProducts'));
const RecentlyViewed = lazy(() => import('./RecentlyViewed'));
const Recommendations = lazy(() => import('./Recommendations'));
const ChatWidget = lazy(() => import('./ChatWidget'));

function ProductPage() {
  return (
    <>
      {/* Critical: Render immediately */}
      <ProductDetails />

      {/* Below fold: Lazy load with Intersection Observer */}
      <Suspense fallback={<Skeleton />}>
        <LazyLoad>
          <Reviews />
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <LazyLoad>
          <RelatedProducts />
        </LazyLoad>
      </Suspense>

      {/* Load chat widget after interaction */}
      <Suspense fallback={null}>
        <IdleLoad>
          <ChatWidget />
        </IdleLoad>
      </Suspense>
    </>
  );
}

// Custom lazy loading components
function LazyLoad({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load 100px before visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible && children}</div>;
}

function IdleLoad({ children }) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setIsIdle(true), { timeout: 2000 });
    } else {
      setTimeout(() => setIsIdle(true), 2000);
    }
  }, []);

  return isIdle ? children : null;
}

// Results:
// Initial bundle: 250KB (86% reduction)
// Main thread blocking: 0.4s (87.5% reduction)
// FID: 95ms (79% improvement)
```

**Fix 3: CLS Optimization - Layout Reservations**

Problem: Multiple layout shifts from dynamic content

```html
<!-- Before: No space reserved for reviews section -->
<div id="reviews">
  <!-- Reviews loaded via JavaScript, causing 350px shift -->
</div>

<!-- After: Reserve minimum height -->
<div id="reviews" style="min-height: 400px;">
  <!-- Loading skeleton shown while reviews load -->
  <div class="skeleton-reviews">
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
    <div class="skeleton-item"></div>
  </div>
</div>
```

```css
/* Skeleton styles prevent layout shift */
.skeleton-reviews {
  min-height: 400px;
}

.skeleton-item {
  height: 120px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Font Loading Optimization**:

```css
/* Before: FOIT (Flash of Invisible Text) causing CLS */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
}

/* After: Use fallback until loaded, no layout shift */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: swap; /* Show fallback immediately */
}

/* Size-adjust to match fallback metrics */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 107%; /* Match x-height of custom font */
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}

body {
  font-family: 'CustomFont', 'CustomFont-Fallback', Arial, sans-serif;
}
```

### Results After Optimization

**Timeline**:
- Week 1-2: Infrastructure setup, CDN migration
- Week 3: Code splitting, lazy loading implementation
- Week 4: Image optimization, format migration
- Week 5-6: CLS fixes, font optimization
- Week 7-8: Monitoring, fine-tuning

**Before vs After (75th Percentile - Field Data)**:

```
Metric        Before    After      Improvement
─────────────────────────────────────────────────
LCP           4.8s      2.1s       -56% ✅
FID           340ms     78ms       -77% ✅
CLS           0.42      0.08       -81% ✅

Google Search Console:
Good URLs:    22%       91%        +314%
Traffic:      Baseline  +42%       Revenue +$3.1M/mo
Conversion:   2.1%      2.8%       +33%
```

**Cost-Benefit Analysis**:
- Development cost: $45,000 (3 engineers × 2 months)
- CDN costs increased: +$2,000/month
- Revenue increase: +$3.1M/month
- ROI: 6,778% (payback in 2 weeks!)

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Core Web Vitals Optimization Decisions</strong></summary>

### Trade-off 1: Image Quality vs Load Speed

**Scenario**: Product detail page hero images

**Option A: Maximum Quality**
- Format: PNG
- Quality: 100%
- Size: 2.4MB
- LCP: 6.2s (mobile 3G)
- Pros: Perfect image quality, no compression artifacts
- Cons: Poor LCP, high bandwidth costs, slow on mobile

**Option B: Aggressive Optimization**
- Format: AVIF
- Quality: auto (60-70%)
- Size: 45KB
- LCP: 1.8s
- Pros: Excellent LCP, low bandwidth, fast mobile experience
- Cons: Slight quality reduction (barely noticeable on most screens)

**Option C: Adaptive (RECOMMENDED)**
```javascript
// Serve different quality based on connection speed
function getImageQuality() {
  const connection = navigator.connection?.effectiveType;

  if (connection === '4g') return 'auto:best'; // ~85% quality
  if (connection === '3g') return 'auto:good'; // ~70% quality
  if (connection === '2g' || connection === 'slow-2g') return 'auto:low'; // ~50% quality

  return 'auto:good'; // Default
}

const imageUrl = cloudinary.url('product-hero', {
  quality: getImageQuality(),
  fetch_format: 'auto' // AVIF/WebP
});
```

**Decision Matrix**:
```
Connection   Quality   Size     LCP      User Experience
────────────────────────────────────────────────────────
4G           85%       120KB    1.2s     Excellent
3G           70%       45KB     1.8s     Very Good
2G           50%       18KB     2.4s     Good (fast > quality)
```

### Trade-off 2: Code Splitting Granularity

**Scenario**: React application bundle size

**Option A: No Code Splitting (Monolithic)**
```javascript
// Single bundle
import Everything from './app';
```
- Bundle size: 1.8MB
- Initial load: Slow (3.2s on 3G)
- Navigation: Instant (everything cached)
- Complexity: Low (simple deployment)
- FID: Poor (long tasks block input)

**Option B: Aggressive Splitting (Micro-chunks)**
```javascript
// Every component lazy loaded
const Button = lazy(() => import('./Button'));
const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));
// ... 100+ lazy imports
```
- Bundle size: 200 chunks @ ~10KB each
- Initial load: Fast (only 50KB)
- Navigation: Slower (many network requests)
- Complexity: High (waterfall issues, debugging hard)
- FID: Good (small chunks)

**Option C: Route-Based + Strategic (RECOMMENDED)**
```javascript
// Routes split, critical components eager, non-critical lazy
// Immediate load (critical)
import Header from './Header';
import Footer from './Footer';

// Route-based splits
const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));

// Strategic lazy loading (heavy, non-critical)
const ChatWidget = lazy(() => import('./ChatWidget'));
const Reviews = lazy(() => import('./Reviews'));
```
- Bundle size: 10-15 chunks @ 100-200KB each
- Initial load: Fast (250KB)
- Navigation: Fast (1 chunk per route)
- Complexity: Medium (manageable)
- FID: Good (balanced)

**When to Choose Each**:
- Monolithic: Internal tools, admin panels, desktop-only apps
- Aggressive: Multi-page app with distinct sections, slow connections common
- Route-based: E-commerce, SaaS products, content sites (MOST COMMON)

### Trade-off 3: Server-Side Rendering (SSR) vs Client-Side Rendering (CSR)

**Impact on Core Web Vitals:**

**CSR (Client-Side Rendering)**:
```
Timeline:
0ms     HTML received (empty <div id="root"></div>)
200ms   JavaScript downloaded
400ms   JavaScript executed
600ms   React hydrated
800ms   First paint

LCP: 800-1200ms
FID: 100-300ms (depends on hydration)
CLS: Low (0.05) if skeleton used
```

**SSR (Server-Side Rendering)**:
```
Timeline:
0ms     HTML received (fully rendered)
50ms    First paint (immediate!)
200ms   JavaScript downloaded
400ms   React hydrated
600ms   Interactive

LCP: 50-200ms ✅ (excellent!)
FID: 150-400ms (hydration can block)
CLS: Higher risk (0.1-0.2) if hydration shifts layout
```

**Real Example - E-commerce Product Page**:

```javascript
// CSR Approach
function ProductPage() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch('/api/product/123')
      .then(res => res.json())
      .then(setProduct);
  }, []);

  if (!product) return <Skeleton />;

  return <ProductDetails product={product} />;
}

// Metrics:
// LCP: 1200ms (after API call)
// FID: 120ms
// CLS: 0.05 (skeleton prevents shift)
```

```javascript
// SSR Approach (Next.js)
export async function getServerSideProps({ params }) {
  const product = await fetch(`/api/product/${params.id}`).then(r => r.json());
  return { props: { product } };
}

function ProductPage({ product }) {
  return <ProductDetails product={product} />;
}

// Metrics:
// LCP: 280ms ✅ (HTML includes product)
// FID: 180ms (hydration blocks briefly)
// CLS: 0.12 (hydration can shift)
```

**Trade-off Decision Matrix**:

```
Scenario                    Recommendation       Why
────────────────────────────────────────────────────────────────
SEO-critical pages         SSR/SSG              Better LCP, crawlability
Authenticated dashboards   CSR                  No SEO need, simpler
E-commerce product pages   SSG (Static)         Best LCP, cacheable
Real-time data (stocks)    CSR + SWR            Data always fresh
Marketing landing pages    SSG                  Maximum performance
Admin panels              CSR                  Complexity not worth it
```

### Trade-off 4: Third-Party Scripts (Analytics, Ads, Chat)

**The Dilemma**: Third-party scripts essential for business but ruin Core Web Vitals

**Measurement**:
```javascript
// Block main thread for 2.3 seconds total!
<script src="https://analytics.com/tag.js"></script>      // 800ms
<script src="https://ads.network.com/ads.js"></script>    // 1100ms
<script src="https://chat.widget.com/widget.js"></script> // 400ms

// Result:
// FID: 450ms (poor!)
// LCP delayed by 2.3s
// CLS: 0.3 (ads inject without space)
```

**Strategy 1: Delay Until Interactive**
```javascript
// Load after page is interactive
function loadThirdPartyScripts() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadAnalytics();
      loadChatWidget();
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      loadAnalytics();
      loadChatWidget();
    }, 2000);
  }
}

// Only load after user interaction
window.addEventListener('scroll', loadAds, { once: true });
window.addEventListener('click', loadAds, { once: true });

// Metrics improvement:
// FID: 85ms ✅ (81% better)
// LCP: 1.8s ✅ (scripts don't block)
```

**Strategy 2: Facade Pattern (Delayed Interaction)**
```javascript
// Show fake YouTube embed, load real one on click
function YouTubeFacade({ videoId }) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div
        className="youtube-facade"
        style={{
          backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`,
          cursor: 'pointer'
        }}
        onClick={() => setLoaded(true)}
      >
        <div className="play-button">▶</div>
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
      allow="autoplay"
    />
  );
}

// Savings:
// Initial page: 0KB (just thumbnail image)
// After click: 1.2MB (YouTube player)
// LCP improvement: 2.1s → 0.8s
```

**Strategy 3: Partytown (Web Worker Isolation)**
```javascript
// Run third-party scripts in Web Worker (off main thread!)
import { Partytown } from '@builder.io/partytown/react';

function App() {
  return (
    <>
      <Partytown forward={['dataLayer.push']} />

      {/* Scripts run in worker, don't block main thread */}
      <script type="text/partytown" src="https://analytics.com/tag.js" />
      <script type="text/partytown" src="https://ads.network.com/ads.js" />
    </>
  );
}

// FID improvement: 450ms → 65ms ✅
// Main thread freed for user interaction
```

**Business vs Performance Matrix**:
```
Script Type       Business Value    Performance Cost    Strategy
────────────────────────────────────────────────────────────────────
Analytics         Medium           High                Delay to idle
Error tracking    High             Low                 Load immediately
A/B testing       High             Medium              Load early, async
Ads               High (revenue)   Very High           Facade + delay
Chat widget       Medium           High                Delay to interaction
Social embeds     Low              Very High           Facade pattern
Heatmaps          Low              High                Load on demand
```

### Trade-off 5: Preloading vs Over-Fetching

**Aggressive Preloading**:
```html
<!-- Preload everything that might be needed -->
<link rel="preload" href="/hero.jpg" as="image">
<link rel="preload" href="/font.woff2" as="font" crossorigin>
<link rel="preload" href="/product-api-data.json" as="fetch" crossorigin>
<link rel="prefetch" href="/next-page-bundle.js">
<link rel="preconnect" href="https://api.example.com">

<!-- Result:
     - LCP: Excellent (1.2s) - hero image loads fast
     - Bandwidth: 2.3MB on initial load
     - Cost: High for users on metered connections
     - Wasted: 40% of prefetched resources never used
-->
```

**Conservative Approach**:
```html
<!-- Only preload critical resources -->
<link rel="preload" href="/hero.jpg" as="image">
<link rel="preconnect" href="https://api.example.com">

<!-- Result:
     - LCP: Good (1.8s)
     - Bandwidth: 800KB on initial load
     - Navigation: Slower (resources fetched on demand)
-->
```

**Adaptive Preloading (RECOMMENDED)**:
```javascript
// Preload based on connection speed
if (navigator.connection) {
  const { effectiveType, saveData } = navigator.connection;

  if (!saveData && (effectiveType === '4g')) {
    // Aggressive preloading on fast connections
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/next-page-bundle.js';
    document.head.appendChild(link);
  }
}

// Intersection-based prefetch (hover intent)
const links = document.querySelectorAll('a[data-prefetch]');
links.forEach(link => {
  link.addEventListener('mouseenter', () => {
    const href = link.getAttribute('href');
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  }, { once: true });
});
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Core Web Vitals in Simple Terms</strong></summary>

### The Restaurant Analogy

Imagine you're running a restaurant, and Google is sending food critics (users) to review the experience. Core Web Vitals are like three specific criteria they judge:

**LCP (Largest Contentful Paint) = "How fast is the main dish served?"**

When a customer sits down, they want to see their food quickly. In web terms:

```
Customer walks in (user loads page)
        ↓
Waiter brings menu (HTML loads)
        ↓
Customer orders (browser requests resources)
        ↓
⏱️ MAIN DISH ARRIVES ⏱️ ← This is LCP!
        ↓
Customer starts eating (user sees content)

Good restaurant: Main dish in 2.5 minutes ✅
Slow restaurant: Main dish in 6 minutes ❌
```

**Real Example**:
```javascript
// Slow restaurant (poor LCP)
<img src="huge-hero-image.jpg" />  // 2.4MB, takes 6 seconds on mobile

// Fast restaurant (good LCP)
<img
  src="optimized-hero.webp"        // 45KB, loads in 1.8 seconds
  width="1200"
  height="600"
  fetchpriority="high"             // "This is the main dish!"
/>
```

**FID (First Input Delay) = "How quickly does the waiter respond?"**

Customer raises hand to ask for water. How long until waiter notices and responds?

```
Customer raises hand (user clicks button)
        ↓
Waiter is busy with 10 other tasks (JavaScript executing)
        ↓
⏱️ WAITER NOTICES AND RESPONDS ⏱️ ← This is FID!
        ↓
Customer gets water (browser processes click)

Attentive waiter: Responds in <100ms ✅
Distracted waiter: Responds in >300ms ❌
```

**Real Example**:
```javascript
// Distracted waiter (poor FID)
// Giant JavaScript bundle blocks main thread for 3 seconds
import EverythingAtOnce from './massive-bundle'; // 1.8MB!

// User clicks button during this time → waits 3 seconds → frustrating!

// Attentive waiter (good FID)
// Small bundles, quick to respond
import CriticalStuff from './small-bundle'; // 250KB

// Everything else loads in background
lazy(() => import('./non-critical-stuff'));

// User clicks → instant response ✅
```

**CLS (Cumulative Layout Shift) = "How stable is the table?"**

Imagine sitting at a wobbly table where dishes keep sliding around. Annoying, right?

```
Customer sits down
        ↓
Starts reading menu
        ↓
💥 SOUP ARRIVES, PUSHES MENU DOWN
        ↓
Customer was about to click "Desserts"
        ↓
Accidentally clicks "Kids Menu" instead
        ↓
Frustration!

Stable table: Nothing shifts unexpectedly ✅
Wobbly table: Constant movement, misclicks ❌
```

**Real Example**:
```html
<!-- Wobbly table (poor CLS) -->
<img src="banner.jpg">  <!-- No size specified -->
<!-- Page shows text first, then image loads and pushes everything down -->

<!-- Stable table (good CLS) -->
<img
  src="banner.jpg"
  width="1200"
  height="300"  <!-- Browser reserves space before image loads -->
>
<!-- Everything stays in place ✅ -->
```

### Interview Answer Template

**Q: "What are Core Web Vitals and why do they matter?"**

**Template Answer**:
```
"Core Web Vitals are three key performance metrics that Google uses to measure
user experience:

1. LCP (Largest Contentful Paint): Measures loading performance - how quickly
   the main content appears. Should be under 2.5 seconds. For example, on an
   e-commerce site, this is typically the product image or hero banner.

2. FID (First Input Delay): Measures interactivity - how quickly the page
   responds to user input. Should be under 100ms. This matters when users
   click buttons or fill forms during page load.

3. CLS (Cumulative Layout Shift): Measures visual stability - how much the
   page layout shifts unexpectedly. Should be under 0.1. Common causes are
   images without dimensions or ads that load dynamically.

They matter because:
- Google uses them as ranking factors in search results
- They directly correlate with user satisfaction and conversion rates
- Studies show 1-second improvement in LCP can increase conversions by 7-8%

At my previous company, we improved LCP from 4.8s to 2.1s by optimizing
images and code splitting, which increased organic traffic by 42%."
```

### Common Gotchas (Things That Trip Up Juniors)

**Gotcha #1: "Just make images smaller, right?"**

Not quite! Example:

```javascript
// Junior approach: Reduce all images
<img src="tiny-hero.jpg" width="200" height="200" />
// Image is small (20KB) ✅ but looks terrible on big screens ❌

// Senior approach: Responsive images
<img
  srcset="
    hero-400.webp 400w,
    hero-800.webp 800w,
    hero-1200.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  src="hero-800.webp"
/>
// Small file on mobile (35KB), larger on desktop (120KB), always sharp ✅
```

**Gotcha #2: "Use useMemo everywhere for better FID!"**

Careful - over-optimization can backfire:

```javascript
// Junior: Memoize everything
const Component = () => {
  const value = useMemo(() => 2 + 2, []); // Overkill!
  const name = useMemo(() => 'John', []); // Wasteful!

  // Actually makes code SLOWER (memoization overhead > computation)
};

// Senior: Memoize expensive operations only
const Component = ({ data }) => {
  const value = 4; // Simple, no memo needed
  const name = 'John'; // Cheap, no memo needed

  // Only memoize heavy calculations
  const filteredData = useMemo(() => {
    return data.filter(/* complex logic */).map(/* expensive transformation */);
  }, [data]); // Worth it!
};
```

**Gotcha #3: "Reserve space for images to fix CLS"**

Yes, but also watch out for fonts!

```css
/* You fix images: */
img {
  width: 1200px;
  height: 600px; /* CLS prevented ✅ */
}

/* But forget about fonts: */
@font-face {
  font-family: 'CustomFont';
  src: url('/font.woff2');
  /* No font-display = FOIT = CLS! ❌ */
}

/* Correct approach: */
@font-face {
  font-family: 'CustomFont';
  src: url('/font.woff2');
  font-display: swap; /* Show fallback immediately, no shift ✅ */
}
```

### How to Practice

**Exercise 1: Audit Any Website**

```bash
# Open Chrome DevTools (F12)
# 1. Lighthouse tab → Run audit
# 2. Check Core Web Vitals scores
# 3. Identify issues in report
# 4. Think: "How would I fix this?"

Example output:
LCP: 4.2s ❌
  → Largest element: <img> banner (1.8MB)
  → Fix: Optimize to WebP, add fetchpriority="high"

FID: 280ms ❌
  → Long tasks: 8 tasks blocking main thread
  → Fix: Code split, use React.lazy()

CLS: 0.24 ❌
  → Sources: Images without dimensions, web fonts
  → Fix: Add width/height, use font-display: swap
```

**Exercise 2: Before/After Comparison**

Create two versions of a page:

```html
<!-- Version A: Slow (learn what NOT to do) -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://heavy-analytics.com/tag.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=CustomFont" rel="stylesheet">
</head>
<body>
  <img src="huge-hero.jpg"> <!-- 2MB, no dimensions -->
  <script src="app-bundle.js"></script> <!-- 1.5MB -->
</body>
</html>

<!-- Lighthouse score: 25/100 ❌ -->
```

```html
<!-- Version B: Fast (best practices) -->
<!DOCTYPE html>
<html>
<head>
  <link rel="preload" href="/hero-800.webp" as="image">
  <style>
    @font-face {
      font-family: 'CustomFont';
      src: url('/font.woff2');
      font-display: swap;
    }
  </style>
</head>
<body>
  <img src="hero-800.webp" width="1200" height="600" fetchpriority="high">
  <script src="app.js" defer></script> <!-- 200KB, code-split -->
  <script>
    // Load analytics after idle
    requestIdleCallback(() => {
      const script = document.createElement('script');
      script.src = 'https://heavy-analytics.com/tag.js';
      document.head.appendChild(script);
    });
  </script>
</body>
</html>

<!-- Lighthouse score: 95/100 ✅ -->
```

**Mental Model: The Three Questions**

Before adding ANYTHING to your page, ask:

1. **"Does this block LCP?"** (Is it above the fold? Is it huge?)
2. **"Does this block FID?"** (Is it JavaScript? Does it run on load?)
3. **"Could this cause CLS?"** (Does it have unknown dimensions? Will it load after content?)

If answer is YES to any → Find alternative approach!

</details>

---

## Question 2: How do you optimize JavaScript bundle size?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Netflix

### Question
Explain techniques for reducing JavaScript bundle size. How do code splitting, tree shaking, and lazy loading work?

### Answer

Reducing bundle size improves load time and performance, especially on slower networks.

1. **Code Splitting**
   - Split code into chunks
   - Load only what's needed
   - Route-based and component-based splitting

2. **Tree Shaking**
   - Remove unused code
   - ES modules required
   - Works with static imports

3. **Lazy Loading**
   - Load components on demand
   - React.lazy() and dynamic imports
   - Reduce initial bundle

4. **Dependency Optimization**
   - Analyze bundle with tools
   - Replace heavy libraries
   - Import only what you need

### Code Example

```javascript
// CODE SPLITTING

// 1. Route-based splitting (React Router)
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 2. Component-based splitting
function HeavyFeature() {
  const [showChart, setShowChart] = useState(false);
  const [Chart, setChart] = useState(null);

  const loadChart = async () => {
    const module = await import('./Chart');
    setChart(() => module.default);
    setShowChart(true);
  };

  return (
    <div>
      <button onClick={loadChart}>Show Chart</button>
      {showChart && Chart && <Chart />}
    </div>
  );
}

// 3. Webpack magic comments for chunk naming
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './Dashboard')
);

const AdminPanel = lazy(() =>
  import(/* webpackChunkName: "admin" */ './AdminPanel')
);

// 4. Prefetch for likely routes
<link rel="prefetch" href="/dashboard.chunk.js" />

// TREE SHAKING

// ❌ Bad: Imports entire library
import _ from 'lodash';  // 70KB!
const result = _.uniq([1, 2, 2, 3]);

// ✅ Good: Import only what you need
import uniq from 'lodash/uniq';  // 2KB
const result = uniq([1, 2, 2, 3]);

// ❌ Bad: CommonJS prevents tree shaking
const { format } = require('date-fns');

// ✅ Good: ES modules enable tree shaking
import { format } from 'date-fns';

// Ensure sideEffects in package.json
{
  "name": "my-app",
  "sideEffects": false  // All files can be tree-shaken
}

// Or specify files with side effects
{
  "sideEffects": ["*.css", "*.scss"]
}

// DEPENDENCY OPTIMIZATION

// 1. Analyze bundle
// package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  }
}

// Next.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});

// 2. Replace heavy libraries
// ❌ moment.js: 67KB
import moment from 'moment';
const date = moment().format('YYYY-MM-DD');

// ✅ date-fns: 2-3KB (tree-shakeable)
import { format } from 'date-fns';
const date = format(new Date(), 'yyyy-MM-dd');

// ✅ dayjs: 2KB
import dayjs from 'dayjs';
const date = dayjs().format('YYYY-MM-DD');

// 3. Remove duplicate dependencies
// Use npm dedupe or yarn dedupe
npm dedupe
yarn dedupe

// 4. Use lighter alternatives
// ❌ axios: 13KB
import axios from 'axios';

// ✅ fetch (native): 0KB
const response = await fetch('/api/data');

// ✅ ky: 3KB (fetch wrapper)
import ky from 'ky';
const data = await ky.get('/api/data').json();

// LAZY LOADING IMAGES

// 1. Native lazy loading
<img src="image.jpg" loading="lazy" alt="Description" />

// 2. Intersection Observer
function LazyImage({ src, alt }) {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
}

// DYNAMIC IMPORTS FOR UTILITIES

// utils.js
export function heavyCalculation(data) { /* ... */ }
export function lightHelper(str) { /* ... */ }

// ❌ Bad: Imports everything
import { heavyCalculation } from './utils';

// ✅ Good: Load only when needed
async function processData(data) {
  const { heavyCalculation } = await import('./utils');
  return heavyCalculation(data);
}

// WEBPACK OPTIMIZATION

// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor bundle
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        // Common code shared across routes
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Minimize bundle
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // Remove console.logs
          },
        },
      }),
    ],
  },
};

// NEXT.JS OPTIMIZATION

// next.config.js
module.exports = {
  // Webpack bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy modules
        'moment': 'dayjs',
      };
    }
    return config;
  },

  // Dynamic imports
  experimental: {
    optimizeCss: true,
    modern Build: true,
  },
};

// PROGRESSIVE HYDRATION (React)
function App() {
  return (
    <div>
      {/* Critical content hydrates immediately */}
      <Header />
      <MainContent />

      {/* Non-critical components hydrate later */}
      <ClientOnly>
        <Comments />
        <RelatedArticles />
      </ClientOnly>
    </div>
  );
}

function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return children;
}

// REAL-WORLD: Conditional polyfills
// Load polyfills only for browsers that need them
if (!('IntersectionObserver' in window)) {
  import('intersection-observer');
}

if (!('fetch' in window)) {
  import('whatwg-fetch');
}
```

### Bundle Size Optimization Checklist

- [ ] Analyze bundle with webpack-bundle-analyzer
- [ ] Implement route-based code splitting
- [ ] Use React.lazy() for heavy components
- [ ] Import only needed functions from libraries
- [ ] Replace heavy libraries (moment → date-fns)
- [ ] Remove unused dependencies
- [ ] Enable tree shaking (ES modules)
- [ ] Minimize production bundle
- [ ] Use compression (gzip/brotli)
- [ ] Implement lazy loading for images
- [ ] Use CDN for static assets
- [ ] Set proper cache headers

### Common Mistakes

❌ **Mistake:** Importing entire library
```javascript
import _ from 'lodash';  // 70KB
import * as R from 'ramda';  // 50KB
```

✅ **Correct:** Import specific functions
```javascript
import debounce from 'lodash/debounce';  // 2KB
import pipe from 'ramda/src/pipe';  // 1KB
```

### Follow-up Questions

- "How do you analyze your bundle size?"
- "What's the difference between defer and async for scripts?"
- "How does webpack's splitChunks work?"
- "What are the tradeoffs of code splitting?"

### Resources

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Code Splitting](https://reactjs.org/docs/code-splitting.html)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)

---

<details>
<summary><strong>🔍 Deep Dive: JavaScript Bundle Internals and Optimization Mechanics</strong></summary>

### How Webpack Creates Bundles

Webpack's bundling process involves several complex phases that directly impact final bundle size:

**Phase 1: Module Resolution and Dependency Graph**

When webpack starts, it traverses your entire codebase starting from entry points, building a dependency graph:

```javascript
// Entry point: index.js
import { Button } from './components/Button';
import { format } from 'date-fns';

// Webpack creates a graph:
// index.js
//   ├── components/Button.js
//   │   ├── react (from node_modules)
//   │   └── utils/classnames.js
//   │       └── (no dependencies)
//   └── date-fns (1,600+ modules)
//       ├── date-fns/format.js
//       ├── date-fns/locale/en-US/index.js
//       └── ... (many more)
```

The dependency graph determines what gets included in your bundle. The problem: Even if you only use `format()` from date-fns, webpack must understand the entire library structure.

**Phase 2: Module Concatenation (Scope Hoisting)**

Without optimization, each module gets wrapped in a function:

```javascript
// Without scope hoisting
var modules = {
  'utils.js': function(module, exports, require) {
    function add(a, b) { return a + b; }
    exports.add = add;
  },
  'app.js': function(module, exports, require) {
    var add = require('utils.js').add;
    console.log(add(2, 3));
  }
};
```

Webpack's scope hoisting flattens this:

```javascript
// With scope hoisting (modern webpack)
function add(a, b) { return a + b; }
console.log(add(2, 3));
// Result: Smaller bundle, better performance!
```

**Performance Impact:**
- Without hoisting: 1.8MB (with function wrappers)
- With hoisting: 1.6MB (8.6% smaller)
- Plus: Faster execution (no function call overhead)

### Tree Shaking Deep Analysis

Tree shaking requires **static module structure**. Here's why it's so finicky:

```javascript
// ✅ Can be tree-shaken (static)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

import { add } from './math'; // Only add is imported

// Result: subtract is tree-shaken (removed)

// ❌ Cannot be tree-shaken (dynamic)
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

const op = 'add';
const result = operations[op](2, 3); // Can't determine at compile time!

// Result: Both functions kept (can't determine which is used)

// ❌ Cannot be tree-shaken (indirect reference)
export function process(data) {
  return filter(data); // filter might be called dynamically
}

function filter(data) {
  return data.filter(x => x > 0);
}

// Result: filter kept (might be used indirectly)
```

**Dead Code Elimination in Webpack:**

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // Essential! Enables tree shaking + minification

  optimization: {
    usedExports: true,  // Mark unused exports
    sideEffects: false, // Tell webpack files have no side effects
  }
};

// package.json
{
  "sideEffects": false  // Entire package can be tree-shaken
  // OR
  "sideEffects": ["*.css"]  // Only .css files have side effects
}
```

### Code Splitting: The Critical Path Analysis

When splitting code, webpack must solve:

**1. Chunk Dependency Resolution:**

```
Entry Point: index.js (250KB)
├── Common Dependencies → common.js (150KB)
│   ├── react (125KB)
│   └── react-dom (25KB)
│
├── Route: /dashboard → dashboard.js (400KB)
│   ├── recharts (300KB)
│   └── components (100KB)
│
├── Route: /admin → admin.js (350KB)
│   ├── ag-grid (250KB)
│   └── components (100KB)
│
└── Shared components → vendors~dashboard~admin.js (100KB)
    └── shared UI library

Total with splitting: 250 + 150 + 400 + 350 + 100 = 1,250KB
Initial load: 250 + 150 = 400KB ✅ (80% reduction!)
```

**2. Waterfall Problem:**

```
Without code splitting:
[======= 1.8MB bundle ========] → Execute → Done (3.2s total)

With naive splitting (too many chunks):
[=250KB=] → [=100KB=] → [=80KB=] → [=90KB=] → ... (8+ requests, 2.8s with network latency!)

Optimal splitting:
[=250KB=] → Execute → [=400KB=] (1 request, 2.1s total)
```

### Bundle Analyzer Deep Dive

Modern bundle analyzers show:

```javascript
// Output from webpack-bundle-analyzer:
// common.js (125KB)
//   ├── react: 89KB (71%)
//   ├── react-dom: 25KB (20%)
//   └── other: 11KB (9%)
//
// dashboard.js (400KB)
//   ├── recharts: 300KB (75%)
//   │   ├── d3-shape: 145KB
//   │   ├── d3-scale: 89KB
//   │   └── other d3 modules: 66KB
//   └── components: 100KB (25%)
```

This reveals the real problems:
- React/React-DOM are unavoidable (core dependency)
- Recharts brings 8 d3 libraries (investigate if all are needed)
- Custom components could be optimized

### Modern Bundler Optimizations

**Vite's Approach (ESM-based):**

```javascript
// With Vite (uses ES modules natively):
// ✅ No bundling during dev (instant HMR)
// ✅ Smaller chunks due to better tree-shaking
// ✅ Dynamic imports = separate chunks (auto)

// Webpack comparison:
// ❌ Full bundle analysis at dev time
// ❌ Larger chunks due to CJS limitations
// ❌ Manual chunk configuration needed
```

**Turbopack (Next.js 13+):**

```javascript
// Turbopack uses incremental bundling:
// 1. First load: Full bundle analysis
// 2. Dev changes: Only affected modules re-bundled
// 3. Result: 10x faster than webpack in some cases

// Speed improvement:
// - Webpack HMR: 2-5 seconds
// - Turbopack HMR: 200-500ms
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: SaaS App Bundle Bloat Crisis</strong></summary>

### The Problem

**Company:** B2B SaaS analytics platform
**Users:** 50,000+ active
**Issue:** Initial page load on mobile taking 8+ seconds, causing 45% bounce rate

**Initial Metrics:**
```
Bundle size: 4.2MB (minified, gzipped: 1.1MB)
JavaScript execution time: 4.8 seconds
Time to Interactive: 8.3 seconds

Performance impact:
- Mobile users: 23% conversion rate (baseline)
- Users with <4s load: 47% conversion rate
- Users with >4s load: 23% conversion rate
→ Every second of improvement = +7-9% conversion

Monthly revenue impact: $2.1M lost (45% bounce × $180k revenue)
```

### Root Cause Analysis

**Step 1: Bundle Analysis**

```bash
# Used webpack-bundle-analyzer to identify bloat
npm run build -- --analyze

# Results revealed:
# chartjs: 320KB (18 charts, but using only 3)
# date-fns: 65KB (full library, using 2 functions)
# lodash: 70KB (entire library, using 5 functions)
# three.js: 650KB (3D graphics, using <5% of features)
# recharts: 400KB (built on top of d3-shape which was also imported separately)
```

**Step 2: Import Audit**

```javascript
// audit-imports.js - Script to find unnecessary imports
const fs = require('fs');
const path = require('path');

// Scan all .js files
function auditImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Find problematic imports
      if (content.includes("import _ from 'lodash'")) {
        console.log(`⚠️ ${fullPath}: Full lodash import`);
      }
      if (content.includes("import * as moment from 'moment'")) {
        console.log(`⚠️ ${fullPath}: Full moment import`);
      }
    }
  });
}

// Results:
// ⚠️ src/utils/formatting.js: Uses _.debounce, _.throttle (2 functions from 70KB lib)
// ⚠️ src/utils/date.js: Uses moment.format, moment.parse (2 functions from 67KB lib)
// ⚠️ src/chart/factory.js: Imports ChartJS but only uses Bar, Line, Pie charts
```

### The Fixes

**Fix 1: Replace Heavy Libraries**

```javascript
// Before: moment.js (67KB)
import moment from 'moment';
import 'moment/locale/de';

const date = moment().format('YYYY-MM-DD');
const localized = moment().locale('de').format('LLLL');

// After: date-fns (3KB, tree-shakeable)
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const date = format(new Date(), 'yyyy-MM-dd');
const localized = format(new Date(), 'PPPP', { locale: de });

// Size reduction: 67KB → 3KB
// Performance improvement: 8x faster on large date operations
```

**Fix 2: Smart Library Import (lodash)**

```javascript
// Before: 70KB
import _ from 'lodash';

function formatData(data) {
  return _.chain(data)
    .debounce(() => {}, 300)  // Wait, debounce is used wrong anyway!
    .value();
}

// After: Specific imports + native replacements (0.5KB)
import { debounce } from 'lodash-es';  // Tree-shakeable version

// Even better: Use native JavaScript
function formatData(data) {
  let timeoutId;
  return function debounced() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Logic here
    }, 300);
  };
}

// Size reduction: 70KB → 0KB (with debounce helper, ~1KB)
// Better: No external dependency!
```

**Fix 3: Chart Library Optimization**

```javascript
// Before: Import all chart types (400KB for recharts)
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  AreaChart, Area, RadarChart, Radar, ScatterChart,
  ComposedChart, CartesianGrid, XAxis, YAxis, Legend,
  Tooltip, ResponsiveContainer
} from 'recharts';

// After: Lazy load heavy charts
// Core charts only (50KB)
import { BarChart, LineChart, PieChart } from 'recharts-core';

// Advanced charts loaded on demand
const RadarChart = lazy(() =>
  import('recharts').then(m => ({ default: m.RadarChart }))
);

const ScatterChart = lazy(() =>
  import('recharts').then(m => ({ default: m.ScatterChart }))
);

// Size reduction: 400KB → 50KB initial + 350KB lazy
// Impact: Initial bundle 80% smaller!
```

**Fix 4: Code Splitting by Route**

```javascript
// Before: Monolithic app.js (4.2MB)
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

// After: Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Admin = lazy(() => import('./pages/Admin'));

// next.config.js (if using Next.js)
module.exports = {
  swcMinify: true,  // Faster minification
  optimizeFonts: true,
  experimental: {
    optimizeCss: true,
  },
};
```

**Fix 5: Tree Shaking Configuration**

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // Critical!

  optimization: {
    usedExports: true,  // Mark used/unused exports
    sideEffects: false, // No side effects
    minimize: true,

    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // React/DOM shared across all routes
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendors-react',
          priority: 20,
          reuseExistingChunk: true,
        },

        // UI libraries
        ui: {
          test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
          name: 'vendors-ui',
          priority: 15,
          reuseExistingChunk: true,
        },

        // Everything else
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },

        // Shared between 2+ chunks
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "src/polyfills/index.js"  // Polyfills have side effects
  ]
}
```

### Results

**Timeline:**
- Week 1: Bundle analysis and library audit
- Week 2: Replace heavy libraries, code splitting
- Week 3: Tree shaking optimization, testing
- Week 4: Deployment and monitoring

**Before vs After:**

```
Metric                  Before      After       Improvement
─────────────────────────────────────────────────────────────
Bundle size (gzip)      1.1MB       320KB       -71% ✅
Initial chunk           1.1MB       180KB       -84% ✅
JS execution time       4.8s        1.2s        -75% ✅
Time to Interactive     8.3s        3.1s        -63% ✅
Mobile 4G load time     8.4s        2.9s        -65% ✅
Mobile 3G load time     21.2s       8.7s        -59% ✅

Conversion impact:
Mobile conversion:      23%         31%         +35% ✅
Revenue increase:       $2.1M/mo    $2.9M/mo    +$800k/mo
```

**Cost-Benefit:**
- Development time: 80 hours (2 engineers, 2 weeks)
- CDN bandwidth savings: -$8,000/month
- Revenue increase: +$800,000/month
- ROI: 100x (payback in 12 minutes!)

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Bundle Optimization Decisions</strong></summary>

### Trade-off 1: Bundle Size vs Development Velocity

**Scenario:** Adding a charting library to visualization dashboard

**Option A: Lightest Bundle**
- Use SVG with canvas drawing (custom)
- Bundle size: +0KB
- Development time: 3 weeks
- Maintenance: High
- Feature completeness: 60% (complex features missing)

```javascript
// Canvas-based implementation
function renderChart(data) {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  // Manual coordinate calculation
  const chartHeight = canvas.height - 40;
  const maxValue = Math.max(...data.map(d => d.value));

  data.forEach((point, index) => {
    const x = (index / data.length) * canvas.width;
    const y = chartHeight - (point.value / maxValue) * chartHeight;

    ctx.fillRect(x, 10, 20, y);
  });
}
// Result: 0KB added, but takes 3 weeks and is hard to maintain
```

**Option B: Mid-range Library**
- Use nivo or visx (lightweight wrappers)
- Bundle size: +120KB
- Development time: 3-5 days
- Maintenance: Medium
- Feature completeness: 90%

```javascript
// Visx: Bare-bones but tree-shakeable
import { BarSeries, XAxis, YAxis } from '@visx/xy-chart';

function Chart({ data }) {
  return (
    <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
      <BarSeries dataKey="value" data={data} />
      <XAxis />
      <YAxis />
    </XYChart>
  );
}
// Result: 120KB, minimal boilerplate
```

**Option C: Feature-Rich Library**
- Use recharts or chart.js
- Bundle size: +400KB
- Development time: 1-2 days
- Maintenance: Low
- Feature completeness: 100%

```javascript
// Recharts: Everything included
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

function Chart({ data }) {
  return (
    <BarChart data={data}>
      <Bar dataKey="value" />
      <XAxis dataKey="name" />
      <YAxis />
    </BarChart>
  );
}
// Result: 400KB, but done in 1 day
```

**Decision Matrix:**

```
Scenario                         Recommendation
─────────────────────────────────────────────────────
Startup (speed > perfection)     Option C (recharts)
Performance-critical app         Option B (visx)
Complex enterprise dashboard     Option C (recharts)
Educational/hobby project       Option A (custom)
Real-time data viz               Option B (visx)
```

**Recommendation for Most Cases:** Option B (visx) - Best balance

### Trade-off 2: Code Splitting Granularity

**Scenario:** E-commerce app with 30 routes

**Option A: Single Bundle**
```
All 30 routes in one file
Size: 2.5MB
Load time: 8.2s (mobile 3G)
Navigation: Instant (cached)
Network requests: 1
```

**Option B: Per-Route Splitting**
```
30 separate chunks (one per route)
Sizes: 50-150KB each
Load time: 2.1s (initial route)
Navigation: 0.8-1.2s per route (network latency)
Network requests: 30+ (chained)

Waterfall problem:
Home loads → clicks Category → requests category.js (500ms network)
→ clicks Product → requests product.js (500ms network)
→ clicks Admin → requests admin.js (500ms network)
Total: 3 navigation clicks = 1.5s extra waiting
```

**Option C: Strategic Splitting (RECOMMENDED)**
```
Chunks by section:
- common.js (react, ui lib) - 250KB
- home.js (homepage) - 180KB
- commerce/ (product, category, checkout) - 650KB
- account/ (profile, orders, wishlist) - 200KB
- admin/ (admin panel) - 380KB

Load home first: 250KB + 180KB = 430KB (1.4s)
User browses products: commerce.js (already prefetched via link rel="prefetch")
No additional wait!
```

**Network request analysis:**

```
Single bundle:
[========= 2.5MB =========] → Done (8.2s)

Per-route (30 chunks):
[=50KB=] → click → [=80KB=] → click → [=100KB=] → click...
With latency: 1 + 0.5 + 0.5 + 0.5 + ... (adds up!)

Strategic:
[250KB] [180KB] → [prefetch 650KB in bg] → User navigates instantly!
Best of both worlds
```

### Trade-off 3: Preload vs On-Demand Loading

**Scenario:** Analytics dashboard with multiple visualization tabs

**Option A: Aggressive Preloading**
```javascript
// Preload ALL chart libraries upfront
<link rel="preload" href="/recharts.chunk.js" as="script">
<link rel="preload" href="/mapbox.chunk.js" as="script">
<link rel="preload" href="/d3-advanced.chunk.js" as="script">

// Result:
// Initial bundle: 650KB (includes unused libraries)
// Page load: 3.1s
// User clicks "Maps" tab: Instant ✅
// User never opens "3D Charts": Wasted 120KB ❌
```

**Option B: Pure On-Demand**
```javascript
// Load only when user opens tab
function VisualizationTabs() {
  const [activeTab, setActiveTab] = useState('charts');
  const [ChartsLibrary, setChartsLibrary] = useState(null);
  const [MapsLibrary, setMapsLibrary] = useState(null);

  useEffect(() => {
    if (activeTab === 'charts' && !ChartsLibrary) {
      import('./recharts-ui').then(lib => setChartsLibrary(() => lib.default));
    }
  }, [activeTab]);

  // Result:
  // Initial bundle: 180KB
  // Click "Maps" tab: 1.2s wait (network latency to load 280KB) ❌
  // User experience: Janky, loading spinner shows
}
```

**Option C: Smart Prefetch (RECOMMENDED)**
```javascript
// Prefetch on hover/intent
function VisualizationTabs() {
  const [activeTab, setActiveTab] = useState('charts');
  const tabsRef = useRef();

  useEffect(() => {
    const tabs = tabsRef.current?.querySelectorAll('[data-prefetch]');

    tabs?.forEach(tab => {
      // Prefetch when user hovers (high intent)
      tab.addEventListener('mouseenter', () => {
        const chunkName = tab.dataset.prefetch;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'script';
        link.href = `/chunks/${chunkName}.js`;
        document.head.appendChild(link);
      });
    });
  }, []);

  // Result:
  // Initial bundle: 180KB ✅
  // Hover "Maps" → Prefetch in background
  // Click "Maps" → Already loaded, instant ✅
  // Never hovered "3D Charts" → Never loaded ✅
}
```

**Decision Matrix:**

```
User Behavior         Initial Load    User Experience    Recommendation
─────────────────────────────────────────────────────────────────────
Visits 1-2 tabs       Preload worse   On-demand better   Option B
Visits all tabs       Preload better  Preload better     Option A
Normal usage pattern  Mixed results   Prefetch wins      Option C
```

### Trade-off 4: Tree Shaking vs CommonJS Ecosystem

**Scenario:** Migrating legacy codebase from CommonJS to ESM

**Option A: Keep CommonJS**
```javascript
// CommonJS (can't tree-shake)
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
};

// Usage
const math = require('./math');
console.log(math.add(2, 3));

// Problem: ALL functions included in bundle
// Size: 1.5KB (all functions)
```

**Option B: Pure ESM**
```javascript
// ESM (can tree-shake)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => a / b;

// Usage
import { add } from './math';
console.log(add(2, 3));

// Benefit: Only add() included
// Size: 150B (only used function)
```

**Option C: Hybrid (ESM with CommonJS interop)**
```javascript
// package.json
{
  "type": "module",  // Node.js: Use ESM by default
  "exports": {
    ".": {
      "require": "./dist/cjs/index.js",   // CommonJS for legacy
      "import": "./dist/esm/index.js"     // ESM for modern
    }
  }
}

// Build both versions
```

**Ecosystem Migration Reality:**

```
Current state (2024):
- 65% of npm packages support ESM
- 35% CommonJS-only
- Many popular libs dual-publish

Migration cost: 2-3 weeks per 50k LOC codebase

Decision:
- New projects: ESM only (Option B)
- Established projects: Gradual migration (Option C)
- Legacy maintenance: Keep CommonJS (Option A, accept larger bundles)
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Bundle Size in Simple Terms</strong></summary>

### The Jar Analogy

Imagine your JavaScript bundle as a glass jar:

```
Goal: Fill jar with only essentials you need
Problem: Many libraries include "just in case" items

❌ Bad packing (monolithic):
[====== Entire kitchen =======] → 4.2MB
- You need: Fork, knife, spoon
- Got: Fork, knife, spoon, plates, bowls, pans, knives, utensils...

✅ Good packing (tree-shaking):
[= Fork =][= Knife =][= Spoon =] → 42KB
- You need: Fork, knife, spoon
- Got: EXACTLY those items

The journey:
1. Bundle Creation: Webpack packs everything your code imports
2. Tree Shaking: Remove items you don't use (requires ESM)
3. Code Splitting: Don't carry extra jars on trips you don't need them
4. Minification: Compress items to fit in smaller jar
```

### Interview Answer Template

**Q: "Explain how code splitting works and why it matters"**

**Template Answer:**
```
Code splitting breaks one large bundle into smaller chunks that load on demand.

Here's how it works:
1. Identify chunks by route/feature (e.g., Dashboard, Admin, Products)
2. Webpack creates separate files for each chunk
3. Initial page loads only critical chunk (fast!)
4. Other chunks load when user navigates (invisible)

Example performance impact:
- Monolithic app: 2.5MB bundle, 8.2s to interactive
- After code splitting: 180KB initial, 2.1s to interactive
  (80% faster for initial load!)

Why this matters:
- Users get interactive page faster
- Unused code never downloads (saves bandwidth)
- Better mobile experience (critical for conversion)

Tree shaking complements this:
- Removes unused exports from each chunk
- Requires ES modules (not CommonJS)
- Further reduces bundle sizes

At my previous company, we combined code splitting with tree shaking
to reduce our bundle from 4.2MB to 320KB, which increased
mobile conversions by 35%.
```

### Common Misconceptions

**Misconception #1: "Minification makes code 10x smaller"**

Reality:
```
Original: 1.5MB
After minification: 420KB (28% of original)
After gzip: 95KB (6% of original)

Most savings comes from gzip compression, not minification!
Minification saves only variable names, spaces, etc.
```

**Misconception #2: "Tree shaking removes dead code automatically"**

Reality:
```javascript
// This code is NOT tree-shaken:
import _ from 'lodash';  // Entire library loaded
console.log('Hello');     // lodash never used!

// This IS tree-shaken:
import { debounce } from 'lodash-es';  // Only debounce loaded
const myDebounce = debounce(myFunc, 300);

// Webpack can't know you won't use lodash later
// You must tell it: "I only need debounce"
```

**Misconception #3: "Code splitting creates many slow requests"**

Reality:
```
Modern browsers:
- HTTP/2: Multiplexes 100+ requests simultaneously
- QUIC: Even faster than HTTP/2
- Prefetching: Next chunk loads while user reads

Waterfall myth (old days):
Request A → Wait → Request B → Wait → Request C
(slow, serial)

Modern reality:
[Request A] [Request B] [Request C] (parallel!)
(fast, concurrent)

Better yet, prefetch non-critical chunks:
<link rel="prefetch" href="/admin.chunk.js">
User never waits, even if they navigate to admin
```

### Practical Debugging

**When to use webpack-bundle-analyzer:**

```bash
# Build with analysis
npm run build -- --analyze

# Output shows:
# - Actual bundle composition
# - Duplicate packages (surprise!)
# - Large dependencies

# Common findings:
# ⚠️ moment.js: 67KB (should use date-fns)
# ⚠️ lodash: 70KB (import specific functions)
# ⚠️ recharts: 400KB (is all of it needed?)
```

**Mental Model: The Loading Sequence**

```
0ms:   User loads page
50ms:  Initial HTML (100KB gzip)
450ms: JavaScript parses (200KB gzip)
700ms: React mounts
800ms: LCP content visible ← Want this ASAP!
1200ms: Page interactive
5000ms: Background chunks loaded via prefetch

Goal: Get LCP content visible in <2500ms
Strategy: Only load code needed for initial view
```

### Practice Exercise

**Task: Audit any website's bundle**

```bash
# 1. Open DevTools (F12)
# 2. Network tab → Filter by JS
# 3. Check sizes (look for > 200KB files)
# 4. Coverage tab → Show unused JavaScript
# 5. Lighthouse → Performance metrics

Example analysis:
bundle.js: 1.8MB ❌ (Too large!)
vendor.js: 800KB (Probably OK if it's react + libs)
unused code: 34% of bundle ❌ (Tree-shake opportunity!)

Questions to ask:
- Is there a moment.js library? (Replace with date-fns)
- Is lodash imported as whole? (Import specific functions)
- Are charts/maps loaded for every page? (Code split!)
- What's the largest single library? (Can it be replaced?)
```

</details>

---

---

## Question 3: How do you optimize React rendering performance?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Meta, Google, Amazon, Netflix, Airbnb

### Question
Explain React rendering optimization techniques. When should you use React.memo, useMemo, useCallback? What are the pitfalls?

### Answer

React re-renders can be expensive. Optimization prevents unnecessary renders and computations.

1. **Prevent Re-renders**
   - React.memo for components
   - PureComponent for classes
   - Key prop for list stability

2. **Memoization**
   - useMemo for expensive calculations
   - useCallback for function identity
   - Avoid premature optimization

3. **Virtualization**
   - React Window / React Virtualized
   - Render only visible items
   - Essential for long lists

4. **React 18 Features**
   - Concurrent rendering
   - Automatic batching
   - useTransition for non-urgent updates
   - useDeferredValue

### Code Example

```javascript
// REACT.MEMO

// ❌ Bad: Re-renders every time parent renders
function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
}

// ✅ Good: Only re-renders when props change
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
});

// Custom comparison function
const MemoizedComponent = React.memo(
  Component,
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    return prevProps.id === nextProps.id &&
           prevProps.name === nextProps.name;
  }
);

// USEMEMO

function SearchResults({ query, items }) {
  // ❌ Bad: Recalculates on every render
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ Good: Only recalculates when dependencies change
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, items]);

  return <List items={filteredItems} />;
}

// USECALLBACK

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ Bad: New function on every render
  const handleClick = () => {
    console.log('Clicked', count);
  };

  // ✅ Good: Same function reference if count hasn't changed
  const handleClick = useCallback(() => {
    console.log('Clicked', count);
  }, [count]);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}

const MemoizedChild = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

// LIST VIRTUALIZATION (React Window)
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// REACT 18: useTransition
import { useState, useTransition } from 'react';

function SearchApp() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);  // Urgent: Update input immediately

    // Non-urgent: Mark search as low priority
    startTransition(() => {
      const filtered = heavySearch(value);
      setResults(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results items={results} />
    </div>
  );
}

// REACT 18: useDeferredValue
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => {
    return heavySearch(deferredQuery);
  }, [deferredQuery]);

  return <List items={results} />;
}

// LAZY INITIALIZATION
function ExpensiveComponent() {
  // ❌ Bad: Runs on every render
  const [state, setState] = useState(expensiveCalculation());

  // ✅ Good: Runs only once
  const [state, setState] = useState(() => expensiveCalculation());
}

// SPLIT STATE TO PREVENT UNNECESSARY RENDERS
function Form() {
  // ❌ Bad: Single state causes all fields to re-render
  const [formData, setFormData] = useState({ name: '', email: '', age: 0 });

  // ✅ Good: Independent state updates
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
}

// CONTEXT OPTIMIZATION
// ❌ Bad: All consumers re-render on any state change
const AppContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({});

  const value = { user, setUser, theme, setTheme, settings, setSettings };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ✅ Good: Split contexts by update frequency
const UserContext = createContext();
const ThemeContext = createContext();
const SettingsContext = createContext();

function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({});

  return (
    <UserContext.Provider value={useMemo(() => ({ user, setUser }), [user])}>
      <ThemeContext.Provider value={useMemo(() => ({ theme, setTheme }), [theme])}>
        <SettingsContext.Provider value={useMemo(() => ({ settings, setSettings }), [settings])}>
          {children}
        </SettingsContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// DEBOUNCE INPUT
function SearchInput({ onSearch }) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onSearch(value);
      }, 300),
    [onSearch]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);  // Update input immediately
    debouncedSearch(value);  // Debounced API call
  };

  return <input value={query} onChange={handleChange} />;
}

// KEYS FOR LIST STABILITY
function TodoList({ todos }) {
  // ❌ Bad: Using index as key (unstable on reorder/filter)
  return todos.map((todo, index) => (
    <Todo key={index} {...todo} />
  ));

  // ✅ Good: Using stable ID
  return todos.map(todo => (
    <Todo key={todo.id} {...todo} />
  ));
}

// PROFILER API
import { Profiler } from 'react';

function onRenderCallback(
  id,  // Component ID
  phase,  // "mount" or "update"
  actualDuration,  // Time spent rendering
  baseDuration,  // Estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="Dashboard" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

### When to Optimize

**DO optimize:**
- Large lists (100+ items)
- Expensive calculations
- High-frequency updates
- Deep component trees
- Identified performance bottlenecks (measured!)

**DON'T optimize prematurely:**
- Small lists (<50 items)
- Simple components
- Infrequent updates
- Without measuring first

### Common Mistakes

❌ **Mistake:** Using useMemo/useCallback everywhere
```javascript
// Over-optimization (unnecessary)
const Component = () => {
  const value = useMemo(() => 2 + 2, []);  // Overkill!
  const handleClick = useCallback(() => {}, []);  // Unnecessary if parent isn't memoized
};
```

✅ **Correct:** Optimize based on measurements
```javascript
// Only optimize when needed
const Component = () => {
  const value = 4;  // Simple calculation
  const handleClick = () => {};  // OK if child isn't memoized

  // Only add useMemo for truly expensive operations
  const expensiveResult = useMemo(() => {
    return heavyCalculation(data);  // Worth memoizing
  }, [data]);
};
```

### Follow-up Questions

- "When is useMemo actually beneficial?"
- "How do you identify performance bottlenecks in React?"
- "What's the difference between React.memo and useMemo?"
- "How does React's reconciliation algorithm work?"

### Resources

- [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)
- [React.memo](https://react.dev/reference/react/memo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [useMemo](https://react.dev/reference/react/useMemo)

---

<details>
<summary><strong>🔍 Deep Dive: React Rendering Mechanics and Optimization Internals</strong></summary>

### Understanding React's Reconciliation Algorithm

React's performance heavily depends on how efficiently it reconciles the Virtual DOM with the actual DOM. Here's the deep internal structure:

**Phase 1: Render Phase (No DOM Changes)**

When state changes, React starts a "render" phase:

```javascript
// User interaction triggers state update
const [count, setCount] = useState(0);

setCount(count + 1);  // Triggers render phase

// React's internal flow:
// 1. Call function component again
function Counter() {
  // JSX executed again (this is "rendering")
  return <div>Count: {count}</div>;
}

// 2. Create new Virtual DOM tree
// 3. Compare old and new trees (reconciliation)
// 4. Determine what changed
// 5. Create list of updates (work queue)

// At this point: NO DOM changes yet!
// This phase can be interrupted/suspended
```

**Phase 2: Commit Phase (Actual DOM Updates)**

Once React knows what changed, it commits:

```javascript
// 1. Apply DOM updates (synchronous, can't interrupt)
element.textContent = 'Count: 1';

// 2. Run layout effects
// 3. Run passive effects (useEffect)
// 4. Paint to screen
```

**Performance Implication:**

The render phase is where you can optimize! The commit phase is unavoidable once changes are determined.

```javascript
// Bad: Large component tree re-renders unnecessarily
function App() {
  const [count, setCount] = useState(0);

  // This entire tree re-renders when count changes!
  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <ExpensiveList items={items} />  {/* Re-renders even though items didn't change */}
      <Chart data={chartData} />        {/* Re-renders even though data didn't change */}
    </div>
  );
}

// Good: Prevent unnecessary re-renders
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <MemoizedList items={items} />    {/* Won't re-render unless items change */}
      <MemoizedChart data={chartData} /> {/* Won't re-render unless data changes */}
    </div>
  );
}
```

### React.memo Internals: Shallow Comparison

```javascript
// React.memo does shallow prop comparison:
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// Internally, React.memo:
function MemoComponent(props) {
  const previousProps = /* stored reference */;

  // Shallow comparison
  if (previousProps === props) {
    // Same reference = skip render
    return previousResult;
  }

  // Different reference = render and store result
  const result = MyComponent(props);
  previousProps = props;
  return result;
}

// GOTCHA: Shallow comparison = only checks object identity, not deep equality
const obj1 = { id: 1 };
const obj2 = { id: 1 };

obj1 === obj2;  // false! Even though content is identical

// This causes unnecessary re-renders:
function Parent() {
  // New object created on every render
  const user = { id: 1, name: 'John' };

  return <MemoizedChild user={user} />; // Always re-renders!
}

// Fix: Memoize the object
function Parent() {
  const user = useMemo(() => ({ id: 1, name: 'John' }), []);

  return <MemoizedChild user={user} />; // Uses same reference
}
```

### useMemo and useCallback Overhead

These hooks have a cost that must be justified:

```javascript
// useMemo overhead breakdown:
// 1. Closure creation (~0.1ms)
// 2. Dependency array comparison (~0.05ms)
// 3. Callback function invocation (~0.05ms)
// Total: ~0.2ms per useMemo

// Computation cost if NOT memoized:
function expensiveCalculation(data) {
  // Filter and sort 1000 items
  return data
    .filter(x => x.active)
    .sort((a, b) => b.value - a.value);
  // Takes ~2ms
}

// Decision:
// - If computation < 0.2ms: DON'T use useMemo (overhead > benefit)
// - If computation > 2ms: USE useMemo (benefit > overhead)
// - If computation 0.2-2ms: MEASURE before deciding

// Real example:
const Component = React.memo(function List({ items }) {
  // BAD: useMemo overhead (0.2ms) > computation (0.1ms)
  const sorted = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  // GOOD: Computation (5ms) > useMemo overhead (0.2ms)
  const filtered = useMemo(
    () => items.filter(item => {
      // Complex filtering logic
      return complexFilter(item);
    }),
    [items]
  );

  return <div>{filtered.map(item => <Item key={item.id} {...item} />)}</div>;
});
```

### The Profiler API Deep Dive

React's Profiler measures actual render times:

```javascript
import { Profiler } from 'react';

// Each profiler tracks render time
function onRenderCallback(
  id,              // Component ID
  phase,           // "mount" or "update"
  actualDuration,  // Time spent rendering THIS component
  baseDuration,    // Estimated time without memoization
  startTime,       // When render started
  commitTime,      // When React painted to DOM
  interactions     // Trace interactions
) {
  // baseDuration = time if every child also re-rendered
  // actualDuration = time with optimizations

  if (baseDuration - actualDuration > 10) {
    console.warn(`${id} optimization saved ${baseDuration - actualDuration}ms`);
  }
}

function App() {
  return (
    <>
      {/* Track Dashboard rendering */}
      <Profiler id="Dashboard" onRender={onRenderCallback}>
        <Dashboard />
      </Profiler>

      {/* Track List rendering */}
      <Profiler id="LargeList" onRender={onRenderCallback}>
        <LargeList items={items} />
      </Profiler>
    </>
  );
}

// Example output:
// Dashboard (update) took 45ms actual, 120ms base → saved 75ms with optimizations!
// LargeList (mount) took 200ms actual, 200ms base → NO optimizations yet!
```

### React 18: Concurrent Rendering Benefits

React 18 enables splitting long renders into chunks:

```javascript
// React 17 (legacy):
// If rendering takes 100ms, user input waits 100ms ❌

// React 18 (concurrent):
// Long render can be split:
// [=20ms render=] → [yield to browser] → [=20ms render=] → [handle input] → [=20ms render=]
// User sees input response immediately!

// This is automatic with Suspense + useTransition
function SearchApp() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // Urgent: Update input immediately
    setQuery(value);

    // Non-urgent: Low priority search
    startTransition(() => {
      // This render can be interrupted if user input arrives
      const results = heavySearch(value);
      setResults(results);
    });
  };

  // React 18 internally:
  // 1. Check if urgent state update → handle immediately
  // 2. Check if non-urgent update → defer if input arrives
  // 3. Re-check priorities constantly
  // 4. Commit updates when safe
}

// Performance impact:
// - Input feels instant (< 100ms response)
// - Search still updates in background
// - User never feels janky
```

### Virtual List Internals (react-window)

```javascript
// Without virtualization: Render all 10,000 items
// DOM nodes: 10,000 elements = 50MB memory
// Render time: 2-3 seconds
// Scroll performance: Janky

// With virtualization: Render only visible items (20-30)
// DOM nodes: 30 elements = 150KB memory
// Render time: 50ms
// Scroll performance: Smooth 60fps

import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {/* React-window handles positioning */}
      <Item item={items[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}           // Viewport height
      itemCount={items.length}  // Total items
      itemSize={35}          // Height of each item
      width="100%"
      overscanCount={5}      // Render 5 extra items outside viewport (prevent pop-in)
    >
      {Row}
    </FixedSizeList>
  );
}

// React-window's magic:
// 1. Calculate which items are in viewport
// 2. Only render those + overscan
// 3. Use transform/scroll positioning (GPU accelerated)
// 4. As user scrolls, update which items are rendered
// 5. Reuse DOM nodes for new items
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Product List Performance Collapse</strong></summary>

### The Problem

**Company:** Major online retailer
**Feature:** Product list page with infinite scroll
**Issue:** 5,000+ products loaded, page becomes unusable

**Initial Metrics:**
```
Initial render: 8,500ms (8.5 seconds!)
Items rendered: 5,000 DOM nodes (takes 3 minutes to scroll to bottom)
Memory usage: 120MB just for React state + DOM
Interaction delay: 2,000-3,000ms (user clicks button, waits 3 seconds for response)
Mobile: Completely unusable (crashes on 4GB RAM devices)

Business impact:
- Mobile conversion: 0.3% (should be 5-8%)
- Average session time: 12 seconds (bounce rate 78%)
- Revenue loss: $200k/month
```

### Root Cause Analysis

**Issue 1: All Products in DOM**

```javascript
// Before: Render all products
function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// DOM tree with 5,000 items:
// <div>
//   <ProductCard /> (takes 5ms to render)
//   <ProductCard /> (takes 5ms)
//   ...
//   <ProductCard /> × 5,000 = 25,000ms minimum!
//
// But wait, that's just rendering. Browser also:
// - Layout calculation: 8,000ms
// - Paint: 5,000ms
// - Total: 38,000ms = 38 seconds for initial page!
```

**Issue 2: Each ProductCard Causes Full List Re-render**

```javascript
// Before: No memoization
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product">
      <img src={product.image} />
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
}

function ProductList({ products }) {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (productId) => {
    setCart([...cart, productId]);
  };

  // Problem: Every product re-renders when cart changes!
  // cart change → ProductList re-renders → ALL ProductCards re-render
  // 5,000 cards × 5ms = 25,000ms per cart update!
  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}  {/* New function reference every render */}
        />
      ))}
    </div>
  );
}
```

**Issue 3: Intersection Observer Not Used**

Infinite scroll was implemented poorly:

```javascript
// Before: No virtualization
function InfiniteScroll({ onLoadMore }) {
  useEffect(() => {
    const handleScroll = () => {
      // This fires HUNDREDS of times per second!
      onLoadMore();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onLoadMore]);

  // Result: API called hundreds of times
  // Server: 500+ requests per minute (should be 1-2)
  // User: All 5,000 items loaded at once (instead of gradual)
}
```

### The Fixes

**Fix 1: Implement Virtualization**

```javascript
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

// After: Only render visible products
function VirtualizedProductList({ products, hasMore, onLoadMore }) {
  const isItemLoaded = (index) => {
    // Check if we've loaded this item yet
    return index < products.length;
  };

  const itemCount = hasMore ? products.length + 1 : products.length;

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="skeleton">
          <Skeleton height={200} />
        </div>
      );
    }

    return (
      <div style={style}>
        <ProductCard product={products[index]} />
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={onLoadMore}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          ref={ref}
          onItemsRendered={onItemsRendered}
          height={800}
          itemCount={itemCount}
          itemSize={250}  // Height of product card
          width="100%"
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}

// Results:
// - Only 20-30 products in DOM (instead of 5,000)
// - Initial render: 150ms (instead of 8,500ms)
// - Memory: 2MB (instead of 120MB)
// - Scroll performance: 60fps smooth
```

**Fix 2: Memoize ProductCard**

```javascript
// After: Prevent unnecessary re-renders
const ProductCard = React.memo(
  function ProductCard({ product, onAddToCart }) {
    return (
      <div className="product">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"  {/* Also lazy load images */}
        />
        <h3>{product.name}</h3>
        <p className="price">${product.price}</p>
        <button onClick={() => onAddToCart(product.id)}>
          Add to Cart
        </button>
      </div>
    );
  },
  // Custom comparison: Only re-render if product changes
  (prevProps, nextProps) => {
    // Return true if props are equal (DON'T render)
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.inStock === nextProps.product.inStock
    );
  }
);

// With memoization:
// Cart update → ProductList re-renders → Product cards DON'T re-render (different reference)
// Benefit: Only 1-2 cards re-render, not 5,000!
```

**Fix 3: Use useCallback for Event Handlers**

```javascript
// After: Stable callback reference
function ProductListContainer({ products }) {
  const [cart, setCart] = useState([]);

  // Stable callback reference (doesn't change unless items changes)
  const handleAddToCart = useCallback(
    (productId) => {
      setCart(prevCart => [...prevCart, productId]);
    },
    []  // No dependencies, so function is created once
  );

  return (
    <VirtualizedProductList
      products={products}
      onAddToCart={handleAddToCart}
    />
  );
}

// Result:
// - ProductCard receives same onAddToCart reference
// - ProductCard doesn't re-render unnecessarily
// - Scroll remains smooth even after cart updates
```

**Fix 4: Optimize Image Loading**

```javascript
// Before: All images load immediately
<img src={product.image} />

// After: Lazy load + blur-up effect
<img
  src={product.thumbImage}  // Tiny placeholder (2KB)
  srcSet={`
    ${product.smallImage} 480w,
    ${product.mediumImage} 800w,
    ${product.largeImage} 1200w
  `}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"  // Don't load until visible
  decoding="async"  // Non-blocking decode
  onLoad={(e) => {
    // Swap to full image
    e.target.src = product.image;
  }}
  alt={product.name}
/>

// Results:
// - Initial page: No images load yet (0KB image bytes)
// - User scrolls: Images load as visible (progressive)
// - Perceived performance: Much faster!
```

### Results

**Before vs After:**

```
Metric                        Before      After       Improvement
─────────────────────────────────────────────────────────────────
Initial page load             8,500ms     350ms       -96% ✅
Time to interactive           8,500ms     500ms       -94% ✅
DOM nodes                     5,000       25          -99.5% ✅
Memory usage                  120MB       4MB         -97% ✅
Scroll interaction delay      2,000ms     50ms        -97.5% ✅

Mobile (4GB RAM)
Crash rate                    85%         0%          100% ✅
Conversion rate               0.3%        6.2%        +2,000% ✅
Session duration              12s         4m 32s      +2,160% ✅

Business metrics:
Mobile revenue/month          $20k        $410k       +$390k/mo ✅
```

**Development Cost vs Benefit:**
- 40 hours (1 engineer, 1 week)
- Revenue increase: +$390,000/month
- ROI: 360x (payback in 2 hours!)

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: React Optimization Decisions</strong></summary>

### Trade-off 1: React.memo Everywhere vs Selective Memoization

**Option A: Memoize Everything**
```javascript
// Every component wrapped in React.memo
const Header = React.memo(function Header() { return <header />; });
const Footer = React.memo(function Footer() { return <footer />; });
const Button = React.memo(function Button() { return <button />; });

// Pros:
// - Simple rule (always memoize)
// - Can't accidentally miss optimization

// Cons:
// - Overhead: React.memo comparison costs (~0.1ms per component)
// - 100 memoized components = 10ms comparison overhead per render
// - Often costs MORE than just re-rendering
```

**Option B: Never Memoize**
```javascript
// Simple components, never optimize
function Header() { return <header />; }
function Footer() { return <footer />; }

// Pros:
// - No optimization overhead
// - Simpler code
// - React 18's concurrent rendering helps naturally

// Cons:
// - Large component trees might be slow
// - No control over performance
// - Hard to optimize when needed
```

**Option C: Strategic Memoization (RECOMMENDED)**
```javascript
// Memoize ONLY when:
// 1. Component receives heavy props (objects, arrays)
// 2. Component is expensive to render (large list, chart)
// 3. Parent updates frequently but this child shouldn't

// Memoize these:
const ProductCard = React.memo(function ProductCard({ product }) {
  // Expensive render, receives heavy prop object
  return <div>{/* complex JSX */}</div>;
});

const UserList = React.memo(function UserList({ users }) {
  // Large list of items
  return users.map(u => <User key={u.id} {...u} />);
});

// Don't memoize these:
function PageHeader() { return <h1>Products</h1>; }  // Simple, no props
function Divider() { return <div style={{ borderTop: '1px solid #eee' }} />; }  // Always same
```

### Trade-off 2: useMemo for Expensive Calculations

**Option A: Always Use useMemo**
```javascript
// Every calculation wrapped in useMemo
const doubled = useMemo(() => count * 2, [count]);
const message = useMemo(() => `Count: ${count}`, [count]);
const colors = useMemo(() => ['red', 'blue'], []);

// Overhead per useMemo:
// - Closure creation: 0.1ms
// - Dependency comparison: 0.05ms
// - Total: ~0.15ms per useMemo

// For 100 useMemos: 15ms overhead per render!
```

**Option B: Never Use useMemo**
```javascript
// No memoization
const doubled = count * 2;
const message = `Count: ${count}`;
const colors = ['red', 'blue'];

// Simple calculations are instant (<0.01ms)
// But might pass unstable references to memoized children
```

**Option C: Measure and Decide (RECOMMENDED)**
```javascript
// Use Profiler to measure actual impact
import { Profiler } from 'react';

function MeasureRender({ name, children }) {
  const startTime = performance.now();

  return (
    <Profiler
      id={name}
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} took ${actualDuration.toFixed(2)}ms`);
      }}
    >
      {children}
    </Profiler>
  );
}

// Example: If calculation takes 3ms and useMemo overhead is 0.2ms:
// Benefit: 3ms - 0.2ms = 2.8ms saved ✅ → USE useMemo

// Example: If calculation takes 0.05ms and useMemo overhead is 0.15ms:
// Loss: 0.05ms → 0.15ms (3x slower!) ❌ → Don't use useMemo
```

### Trade-off 3: Virtual Lists vs Pagination

**Option A: Virtual Lists (Infinite Scroll)**
- Pros: Seamless UX, no "Load More" clicks
- Cons: Complex implementation, memory management needed
- Use when: E-commerce, social feeds, continuous browsing

```javascript
import { FixedSizeList } from 'react-window';

function InfiniteProductList() {
  const [products, setProducts] = useState([]);

  return (
    <FixedSizeList height={800} itemCount={products.length} itemSize={250}>
      {({ index, style }) => (
        <div style={style}>
          <ProductCard product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Option B: Pagination**
- Pros: Simple, predictable, SEO-friendly
- Cons: Extra clicks, page reloads
- Use when: Admin panels, traditional content sites

```javascript
function PaginatedProducts({ pageNumber }) {
  const products = useQuery(`/api/products?page=${pageNumber}`);

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
      <Pagination currentPage={pageNumber} totalPages={100} />
    </div>
  );
}
```

**Option C: Hybrid (RECOMMENDED for most)**
```javascript
// Virtual list for currently visible items
// Pagination for jumping to sections
function HybridProductList() {
  const [section, setSection] = useState(0);  // Section: 0-99
  const [localProducts, setLocalProducts] = useState([]);

  // Load 1 section (50 products) at a time
  useEffect(() => {
    fetch(`/api/products?section=${section}`).then(setLocalProducts);
  }, [section]);

  return (
    <div>
      {/* Virtual list for this section */}
      <VirtualList items={localProducts} />

      {/* Pagination to jump sections */}
      <PageSelector
        current={section}
        total={100}
        onChange={setSection}
      />
    </div>
  );
}
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: React Rendering in Simple Terms</strong></summary>

### The Cook in a Kitchen Analogy

Imagine React as a restaurant kitchen:

```
Customer (user) asks for order
         ↓
Cook (React) makes the dish
         ↓
Plating team (commit phase) arranges on plate
         ↓
Waiter (browser) serves to customer

React's optimization problem:
- Without optimization: Cook re-makes ENTIRE menu for every order change
- With optimization: Cook only re-makes the changed dish
```

**The Re-render Problem:**

```
Bad: Parent state changes → Parent re-renders → ALL children re-render

function Parent() {
  const [cartCount, setCartCount] = useState(0);

  // When cartCount changes:
  // Parent re-renders ← cartCount changed
  // ProductCard re-renders ← parent re-rendered
  // ProductCard re-renders ← parent re-rendered
  // ProductCard re-renders ← parent re-rendered
  // ProductCard re-renders ← parent re-rendered (5,000 times!)
  // = 25 seconds

  return (
    <>
      <Cart count={cartCount} />
      <Product1 /> {/* Doesn't use cartCount, but re-renders anyway! */}
      <Product2 />
      <Product3 />
      {/* ... 5,000 more products */}
    </>
  );
}

Good: Prevent child re-renders with React.memo

const Product = React.memo(function Product() {
  // Only re-renders if props actually change
  return <div>Product</div>;
});
```

### Interview Answer Template

**Q: "Explain React rendering optimization and when to use React.memo, useMemo, useCallback"**

**Template Answer:**
```
React's rendering happens in two phases: the render phase and the commit phase.
The render phase is where we can optimize.

React.memo prevents component re-renders when props haven't changed:
- Use it for components with expensive renders (large lists, calculations)
- Use it when parent updates frequently but this child shouldn't
- Don't use it for simple components (overhead > benefit)

Example: Product list page. When cart updates, product cards shouldn't
re-render because their product prop didn't change. React.memo prevents this.

useMemo memoizes expensive calculations:
- Use it when calculation takes > 2ms
- Don't use it for simple math (overhead costs more)
- Common case: Filter/sort large arrays before passing to memoized child

Example: Filtering 10,000 products takes 5ms. useMemo (0.2ms overhead)
saves the difference if calculation would otherwise happen every render.

useCallback memoizes function references:
- Use it when passing function to memoized child component
- Without useCallback, function re-created every render → child thinks prop changed
- Similar decision as useMemo: measure first

Benchmark example at my last company:
- Large product list with 5,000 items
- Without optimizations: 8 seconds initial load, 2 second interaction delay
- With React.memo on product cards: 350ms initial load, 50ms interaction delay
- Cost: 1 day of engineering
- Benefit: +35% mobile conversion rate
```

### Common Misconceptions

**Misconception #1: "Memoization always makes things faster"**

Reality:
```javascript
// This makes things SLOWER:
const greeting = useMemo(
  () => `Hello ${name}`,  // Takes 0.01ms to create
  [name]
);

// useMemo overhead: 0.15ms
// Net effect: 15x slower!

// Correct: Just use the string
const greeting = `Hello ${name}`;
```

**Misconception #2: "React always re-renders children when parent re-renders"**

Reality:
```javascript
// With React 18 and modern practices, you CAN prevent child re-renders:

const Parent = () => {
  const [count, setCount] = useState(0);

  // This component doesn't re-render if props haven't changed
  return <MemoizedChild onClick={() => setCount(count + 1)} />;
};

const MemoizedChild = React.memo(function Child({ onClick }) {
  // Won't re-render because onClick reference stayed same (if memoized)
  return <button onClick={onClick}>Click</button>;
});
```

**Misconception #3: "Virtual lists are always better than pagination"**

Reality:
```
Virtual lists: Best for: infinite scroll, feeds, continuous browsing
Pagination: Best for: search results, admin panels, SEO
Hybrid: Best for: large catalogs with sections

Example: E-commerce product page
- 10,000 products total
- Show 50 per page with pagination
- Within each page, use virtual list for smooth scrolling
- Result: Small initial load + smooth UX
```

### Practice Exercise

**Task: Identify optimization opportunities**

```javascript
// Code to analyze:
function ProductPage({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(5);

  // Q1: Does this need optimization?
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Q2: Will ProductCard re-render unnecessarily?
  const handleAddToCart = () => setCart([...cart, productId]);

  // Q3: What's wrong with this?
  return (
    <div>
      <ProductCard product={product} onAddToCart={handleAddToCart} />
      <Reviews
        reviews={reviews}
        selectedRating={selectedRating}
        onFilterChange={setSelectedRating}
      />
    </div>
  );
}

// Answers:
// Q1: No - calculateRating only runs 1-2 times (data rarely changes)
//     useMemo would add overhead. Keep it simple.

// Q2: Yes - handleAddToCart is new function every render
//     Solution: useCallback(() => setCart([...cart, productId]), [cart, productId])

// Q3: Reviews component might be expensive with 1,000 items
//     Solution: Memoize it, and memoize the callback to filter
```

</details>

---

[← Back to Performance README](./README.md)

**Progress:** 3 of 5 performance questions
