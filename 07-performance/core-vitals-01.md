# Core Web Vitals Mastery

> Deep dive into Google's Core Web Vitals (LCP, FID/INP, CLS) with production optimization strategies, real-world scenarios, and trade-off analysis.

---

## Question 1: Core Web Vitals - What are they and why do they matter?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Vercel, Amazon, Netflix

### Question
What are Core Web Vitals and why has Google made them critical ranking factors?

### Answer

**Core Web Vitals** are three user-centric metrics that measure different aspects of web page experience:

1. **LCP (Largest Contentful Paint)** - Measures loading performance
   - The time when the largest visible element enters the viewport
   - Good: < 2.5s | Needs improvement: 2.5-4s | Poor: > 4s
   - Affects: Page loading perception

2. **INP (Interaction to Next Paint)** - Measures responsiveness (replaced FID in 2024)
   - Captures the entire duration from user interaction to visual response
   - Good: < 200ms | Needs improvement: 200-500ms | Poor: > 500ms
   - Affects: App feel and interactivity

3. **CLS (Cumulative Layout Shift)** - Measures visual stability
   - Score of unexpected layout shifts during page lifetime (0-1 scale)
   - Good: < 0.1 | Needs improvement: 0.1-0.25 | Poor: > 0.25
   - Affects: User frustration and accidental clicks

**Why Google Cares:**
- Direct correlation with user retention and conversion rates
- Official SEO ranking factor (60%+ weight in ranking algorithms)
- Mobile-first indexing prioritizes these metrics

### Code Example

```javascript
// Basic measurement with web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(metric => {
  console.log('LCP:', metric.value); // milliseconds
  // Send to analytics backend
});

onINP(metric => {
  console.log('INP:', metric.value); // milliseconds
});

onCLS(metric => {
  console.log('CLS:', metric.value); // 0-1 score
});

// Send to Google Analytics
onLCP(metric => {
  gtag('event', 'page_view', {
    'page_location': window.location.href,
    'LCP': metric.value
  });
});
```

---

<details>
<summary><strong>🔍 Deep Dive: Browser Internals and Metric Calculation</strong></summary>

### LCP (Largest Contentful Paint) Deep Dive

**What counts as contentful elements?**
- Images (img, svg image)
- Video posters
- Elements with background images
- Text nodes and text containers

**LCP Calculation Algorithm:**
```
1. Page starts loading (navigation start time = 0ms)
2. Browser renders progressively
3. After each render, check for largest visible element
4. Keep tracking until user interacts (click, scroll, key press)
5. After interaction, LCP is locked - no more updates
```

**Real-time tracking mechanism:**
```javascript
// Browser's internal PerformanceObserver algorithm
const observer = new PerformanceObserver((list) => {
  // Get all 'largest-contentful-paint' entries since last observer callback
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];

  // Entry contains:
  // - renderTime: When element became visible (most accurate)
  // - loadTime: When image finished loading (fallback)
  // - size: Byte size of content
  // - element: DOM reference to the element

  console.log(`LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
  console.log(`Size: ${lastEntry.size} bytes`);
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });
```

**Why LCP matters:**
- First 2.5 seconds are critical for user perception
- Beyond 4 seconds, bounce rate increases by 45%
- Mobile connections (3G): typically adds 1-2 seconds latency
- Images = 70% of LCP problems (lazy loading, sizing, format)

### INP (Interaction to Next Paint) Deep Dive

**What INP captures (different from FID):**
- NOT just the first interaction
- Looks at ALL interactions during page lifetime
- Measures: input delay + processing time + presentation delay

```
User clicks button
         ↓
    [Input Delay] ← FID measures this
         ↓
   Browser processes event handler
         ↓
    [Processing Time] ← INP includes this
         ↓
   Browser paints next frame
         ↓
    [Presentation Delay] ← INP includes this too
         ↓
    User sees response
```

**Why INP > FID:**
- FID only caught first interaction (false positives)
- Real apps have interactions throughout page lifetime
- INP catches the WORST interaction (p99 performance)
- More realistic representation of responsiveness

```javascript
// INP measurement - worst case across all interactions
const observer = new PerformanceObserver((list) => {
  let worstDuration = 0;

  for (const entry of list.getEntries()) {
    // Each entry has:
    // - duration: total input delay + processing + paint time
    // - interactionTarget: which element was interacted with
    // - name: "pointerdown", "pointerup", "click", "keydown", "keyup"

    if (entry.duration > worstDuration) {
      worstDuration = entry.duration;
      console.log(`Worst interaction: ${worstDuration}ms on ${entry.interactionTarget}`);
    }
  }
});

observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
```

### CLS (Cumulative Layout Shift) Deep Dive

**CLS Score calculation:**
```
CLS = Sum of all layout shift scores
      (only for shifts without user input in previous 500ms)

Session window = 5 seconds of no large shifts
Maximum session window = 5 minutes

Final CLS = largest session window score
```

**Example CLS calculation:**
```
Time 0ms: User loads page
  Shift 1: Image loads (0.05) → CLS = 0.05

Time 100ms: Video ad appears (0.12) → CLS = 0.05 + 0.12 = 0.17
  (still within 5s window)

Time 100ms: User clicks button (starts new window due to input)

Time 200ms: Modal opens (0.08) → CLS = 0.08 (new window)

Time 500ms: User hasn't interacted → can accumulate again

Final CLS = 0.17 (largest window from 0-5s period)
```

**Layout shift formula:**
```javascript
const layout_shift_score = (
  impact_fraction * distance_fraction
);

// impact_fraction = how much viewport was affected (0-1)
// distance_fraction = how far elements moved (as fraction of viewport)

// Example:
// Element moved 20% of viewport height
// Affected 60% of viewport
// shift_score = 0.60 * 0.20 = 0.12
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: E-commerce Site Performance Crisis</strong></summary>

### The Problem
E-commerce site (similar to Amazon) had:
- LCP: 6.2 seconds (Poor)
- INP: 350ms (Poor - click to search took too long)
- CLS: 0.34 (Poor - images loading pushed content around)
- Result: 15% bounce rate increase, $2.3M lost revenue annually

### Root Cause Analysis

**LCP Problem Diagnosis:**
```
Waterfall Analysis (Chrome DevTools):
0ms:   Navigation starts
150ms: HTML parsing
250ms: CSS parsing completes
300ms: JavaScript blocks rendering (bundle: 850KB)
800ms: Hero image request starts (on slow 3G: 2.5MB)
3200ms: Hero image loads
3500ms: LCP fires (hero image visible)

Actually, site was waiting for:
- Large uncompressed hero image (2.5MB JPEG)
- JavaScript bundle blocking LCP (defer/async not used)
- No image optimization or responsive sizing
```

**Solution Implemented:**
```javascript
// BEFORE (blocking JavaScript)
<script src="bundle.js"></script> <!-- 850KB -->
<img src="hero.jpg" /> <!-- 2.5MB -->

// AFTER (optimized LCP)
<link rel="preload" as="image" href="hero.webp" imagesrcset="...">
<script src="bundle.js" async></script>
<img
  src="hero.webp"
  srcset="
    hero-small.webp 480w,
    hero-medium.webp 960w,
    hero-large.webp 1920w
  "
  sizes="min(100vw, 1200px)"
/>

// WebP format: 60% size reduction (2.5MB → 1MB)
// Responsive sizing: 50% reduction on mobile
// Async JS: removed 500ms blocking time
// Result: LCP improved to 1.8s (within good threshold)
```

**INP Problem Diagnosis:**
```
Performance Timeline showed:
User clicks "Add to Cart" button
         ↓
Event handler executes (120ms) - too long!
- DOM query: document.querySelectorAll('.cart-item') - O(n) on page
- Update state: React rerender (100+ components)
- API call: network request
         ↓
Paint: 150ms
         ↓
Total INP: 270ms (poor)

Root cause: Event handler was doing too much work synchronously
```

**Solution Implemented:**
```javascript
// BEFORE - Blocking handler
button.addEventListener('click', () => {
  // 1. Slow DOM query (O(n))
  const items = document.querySelectorAll('.cart-item');
  const count = items.length;

  // 2. Update state (triggers re-render of 100+ components)
  setCart(prev => ({ ...prev, itemCount: count + 1 }));

  // 3. Blocking API call
  const response = await fetch('/api/cart', { ... });
});

// AFTER - Optimized with useTransition
button.addEventListener('click', async () => {
  // 1. Immediately paint response (startTransition)
  startTransition(async () => {
    // 2. Use cached item count (O(1))
    const count = cartState.itemCount;
    setCart(prev => ({ ...prev, itemCount: count + 1 }));

    // 3. Non-blocking state update
    const response = await fetch('/api/cart', { ... });
    setCart(prev => ({ ...prev, synced: true }));
  });
});

// Results:
// - Input delay: 5ms (was 20ms)
// - Processing: 50ms (was 120ms) - startTransition defers non-critical work
// - Paint: 20ms (was 150ms)
// - Total INP: 75ms ✓ (well within good range)
```

**CLS Problem Diagnosis:**
```
Timeline of shifts:
0s:    Page loads
100ms: Ads load above fold (0.15 score) - images no height
400ms: Logo images load in header (0.08 score)
600ms: Font loads, text reflows (0.12 score)

Problem: No reserved space for ads, images, fonts
Result: User's viewport shifts 3 times = 0.35 CLS
```

**Solution Implemented:**
```html
<!-- BEFORE - No space reserved -->
<div class="ad-container">
  <img src="ad.jpg" /> <!-- size unknown until loaded -->
</div>

<!-- AFTER - Reserved with aspect ratio -->
<div class="ad-container" style="aspect-ratio: 300/250;">
  <img src="ad.jpg" alt="..." />
</div>

<!-- Images with known dimensions -->
<img
  src="logo.png"
  width="200"
  height="100"
  alt="Logo"
/>

<!-- Custom fonts with font-display: swap -->
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* Avoid layout shift when font loads */
}

<!-- Results:
Before: CLS = 0.35 (poor)
After:  CLS = 0.02 (good)
Method: Reserved space prevents all shifts
-->
```

### Results
- LCP: 6.2s → 1.8s (-71%, now good)
- INP: 350ms → 75ms (-78%, now good)
- CLS: 0.34 → 0.02 (-94%, now good)
- Bounce rate: -15% drop → +8% increase (15%+8%)
- Revenue impact: +$2.8M annually

### Lessons Learned
1. Image optimization yields 40-60% LCP improvements
2. Event handler optimization requires profiling (not guessing)
3. Reserved space (aspect-ratio, width/height) eliminates CLS
4. Async/defer on scripts saves 300-500ms of blocking time

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Performance vs Functionality</strong></summary>

### LCP Trade-offs

**Trade-off 1: Image Quality vs Load Time**
```
Option A: Serve JPEG 2.5MB (beautiful but slow)
- LCP: 3.5s
- Visual quality: 100%
- User perception: "Why is this so slow?"

Option B: Optimize with WebP + responsive sizing
- LCP: 1.8s
- Visual quality: 98% (imperceptible difference)
- User perception: "This is fast!"
- Tradeoff: Requires image optimization pipeline

Recommendation: Always optimize. Users prefer speed over imperceptible quality loss.
```

**Trade-off 2: JavaScript Framework Features vs Initial Load**
```
Option A: Full React with all features
- Bundle size: 850KB
- LCP: 3.2s (JS blocking)
- Features: All interactive

Option B: Progressive enhancement
- Initial HTML: 50KB (no JS)
- LCP: 0.8s
- Then load JS async for enhancements
- Tradeoff: More server-side rendering complexity

Decision tree:
- If LCP critical (ecommerce): Use SSR + progressive enhancement
- If LCP less critical (internal tools): Full JS is fine
```

### INP Trade-offs

**Trade-off 1: Instant Feedback vs Accuracy**
```
Option A: Show loading spinner immediately (good UX)
- User sees feedback at 50ms
- But actual API call takes 1s
- INP: 50ms (good metrics, but misleading)
- Problem: Users think response is slow due to visible lag

Option B: Debounce requests + batching
- Wait 200ms to debounce
- Batch multiple requests
- INP: 200ms + processing
- Benefit: Fewer API calls, better backend performance

Tradeoff: Instant feedback vs efficient processing
Decision: Use startTransition to show feedback while processing continues
```

**Trade-off 2: Form Validation Depth vs Response Time**
```
Option A: Real-time validation on every keystroke
- Checks: Email regex, API unique validation, password strength
- Processing: 150-300ms per keystroke
- INP: Poor if validation blocking
- User experience: Very responsive to validation results

Option B: Debounced validation (500ms delay)
- User sees results after short pause
- INP: < 100ms (immediate keystroke response)
- Validation: Still real-time, just not per-keystroke

Recommendation: Use debounce + startTransition for non-blocking validation
```

### CLS Trade-offs

**Trade-off 1: Ad Revenue vs Visual Stability**
```
Baseline: Homepage without ads
- CLS: 0.02 (excellent)
- Monthly ad revenue: $100k

Option A: Add ads above fold
- CLS: 0.15 (poor, loses ranking)
- Monthly ad revenue: $150k
- SEO penalty: -20% traffic = -$80k value
- Net: -$30k loss despite higher CPM

Option B: Reserve ad space (aspect-ratio)
- CLS: 0.05 (still good)
- Ad revenue: $140k (slightly less due to smaller perceived real estate)
- No SEO penalty
- Net: +$40k gain

Better approach: Let users opt-in to ads below fold
- CLS: 0.01 (excellent)
- Ad revenue: $120k
- No SEO penalty
- Happier users
```

**Trade-off 2: Personalization vs Layout Stability**
```
Option A: Server personalize all content
- CLS: 0.02 (no shifts)
- Server response time: +500ms (fetching personalization data)
- LCP: 3.0s (slow)

Option B: Client-side personalization after load
- LCP: 1.2s (fast initial load)
- CLS: 0.08 (some shifts from personalization)
- Trade-off: Some layout shift for faster perceived speed

Decision: Use skeleton screens (CLS-safe) + client-side personalization
- Show placeholders initially (no shift): LCP 1.2s, CLS 0
- Personalize content in placeholders: CLS remains 0
- Best of both worlds
```

### Monitoring Trade-offs

**Trade-off: Real User Monitoring (RUM) vs Synthetic Monitoring**
```
RUM (Real User Monitoring):
- Pro: Measures actual user experience
- Con: High variance, needs statistical significance (>1000 samples)
- Delay: 5-10 minutes to see data
- Cost: $$ (CDNs charge for RUM)
- Use when: Production health monitoring

Synthetic Monitoring (Lab):
- Pro: Reproducible, immediate results
- Con: Doesn't capture real user network conditions
- Delay: Instant (but less accurate)
- Cost: $ (run in CI)
- Use when: Development, pre-release testing

Best practice: Both
- Use synthetic in CI/staging for quick feedback
- Use RUM in production for actual metrics
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Core Web Vitals Simplified</strong></summary>

### LCP - "Loading Speed" (Simplest Way to Think About It)

**Analogy: Restaurant Food Service**
```
LCP = Time from ordering until first dish arrives

Good restaurant (< 2.5s):
"I ordered, and boom - appetizer arrives quickly!"

Poor restaurant (> 4s):
"I'm waiting... waiting... getting frustrated..."
People leave before their food arrives.

What makes it slow:
- Chef is busy with other orders (JS blocking)
- Slow supplier for ingredients (large images)
- Bad kitchen workflow (inefficient rendering)

How to fix it:
- Hire more staff (code splitting)
- Use local suppliers (optimize images)
- Better kitchen process (critical CSS inlining)
```

**Interview Answer Template:**
"LCP measures how fast the main content appears on the page. Think of it like a restaurant serving your appetizer - if it takes more than 2.5 seconds, you're getting impatient. We optimize it by:
1. Making images smaller and using modern formats (WebP)
2. Not blocking the page load with JavaScript
3. Serving critical content first
Good LCP means happy users and better Google rankings."

### INP - "Responsiveness" (How the App Feels)

**Analogy: Elevator Response**
```
INP = Time from pressing elevator button until doors open

Good elevator (< 200ms):
- Press button → immediate feedback (door closes)
- Feels responsive and snappy

Bad elevator (> 500ms):
- Press button → wait... wait... door finally starts
- Feels broken, like button didn't register

What causes delay:
- Overloaded (too many requests happening)
- Slow mechanical system (JavaScript processing too much)
- Bad wiring (inefficient code)

How to fix:
- Install dedicated elevator (separate worker threads)
- Simplify operations (reduce work in event handlers)
- Better feedback (show loading state while processing)
```

**Interview Answer Template:**
"INP measures how quickly the page responds to user interactions like clicks and keyboard input. If I click a button and nothing happens for 500ms, it feels broken - like the button didn't register. We keep it good (< 200ms) by:
1. Not doing heavy processing when user clicks (defer non-critical work)
2. Keeping event handlers lightweight
3. Using React's startTransition for non-blocking updates
Users perceive the app as fast and responsive."

### CLS - "Stability" (Content Doesn't Jump Around)

**Analogy: Magazine Reading Experience**
```
CLS = How much content jumps around while you're reading

Good magazine (CLS < 0.1):
- Layout is stable
- Text doesn't move mid-sentence
- Comfortable reading experience

Bad magazine (CLS > 0.25):
- Images load and push text down
- You lose your place
- You're annoyed

What causes jumping:
- Images with no reserved space (loading late)
- Ads appearing unexpectedly
- Fonts loading and changing text size
- Animations triggering layout recalculations

How to fix:
- Tell browser space needed upfront (aspect-ratio attribute)
- Load critical assets early
- Use stable fonts from start
```

**Interview Answer Template:**
"CLS measures how much your page's content jumps around. If I'm reading an article and ads suddenly push my text down, that's bad CLS. Google penalizes this because it frustrates users. We prevent it by:
1. Reserving space for images before they load (aspect-ratio CSS)
2. Specifying dimensions for dynamic content
3. Avoiding unsized images and fonts
A good CLS (< 0.1) means content is stable and predictable for users."

### Why All Three Matter Together

**Real Example: Your Website**
```
Good LCP (1.8s) + Poor INP (400ms) + Good CLS (0.05)
= User verdict: "Site loads fast but feels sluggish when I interact"
= Result: Bounce rate increase (fast doesn't matter if it feels unresponsive)

Good LCP (1.8s) + Good INP (75ms) + Poor CLS (0.35)
= User verdict: "Site is fast but keeps jumping, I misclicked and bought wrong item"
= Result: Higher error rates, support tickets, refunds

All three good:
= User verdict: "This site is excellent - fast, responsive, stable"
= Result: Lower bounce rate, higher conversion, better rankings
```

### Quick Debugging Flow for Junior Developers

**"My LCP is bad (> 2.5s)"**
```
1. Check image sizes: "Are my hero images huge JPEGs?"
   → Convert to WebP, add responsive srcset

2. Check JavaScript: "Is JS blocking render?"
   → Add defer or async attributes

3. Check fonts: "Am I loading web fonts that block text?"
   → Use font-display: swap or preload

4. Check server: "Is my server slow?"
   → Check Time to First Byte (TTFB)
```

**"My INP is bad (> 200ms)"**
```
1. Open DevTools Performance tab
2. Click your button and record
3. Look for long tasks (anything > 50ms)
4. Check what code caused them
5. Either optimize that code or defer it with startTransition

Common causes:
- Event handler doing too much (loops, calculations)
- React rendering too many components at once
- API calls blocking interaction
```

**"My CLS is bad (> 0.1)"**
```
1. Don't scroll or interact (this locks CLS)
2. Wait for all async content to load
3. Look in DevTools for "Layout Shift" entries
4. Check what elements moved
5. Add dimensions/aspect-ratio to those elements

Common causes:
- Images without height/width
- Ads loading without reserved space
- Web fonts causing text reflow
- Animations shifting layout
```

---

## Question 2: How do you optimize each metric in production?

**Difficulty:** 🟡 Medium-Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 12 minutes
**Companies:** Google, Meta, Vercel, Shopify, Stripe

### Question
Walk through a complete optimization strategy for all three Core Web Vitals in a production application.

### Answer

### Optimization Strategy Framework

**The Pyramid Approach:**
```
         Monitoring (continuous)
        /                      \
    Diagnostics            Measurement
    /        \              /        \
  Profiling  Root Cause   RUM        Lab
  /    \        /   \       /  \      / \
Code  Rendering JS   CSS   Field  Synthetic
```

**Step 1: Measure Current State**

```javascript
// 1a. Add web-vitals library to track metrics
import { onLCP, onINP, onCLS } from 'web-vitals';

const reportMetric = (metric) => {
  // Send to analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id
  });

  // Use sendBeacon for reliability (survives page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('https://api.example.com/metrics', body);
  }
};

onLCP(reportMetric);
onINP(reportMetric);
onCLS(reportMetric);

// 1b. Set up performance monitoring dashboard
// Tool: Google Analytics 4, Sentry, DataDog, or custom solution
// Goal: Baseline current metrics for all user segments
```

**Step 2: Identify Bottlenecks**

```javascript
// For LCP: Find what's causing slowness
const observer = new PerformanceObserver((list) => {
  const lastEntry = list.getEntries()[list.getEntries().length - 1];
  console.log('LCP element:', lastEntry.element);
  console.log('LCP size:', lastEntry.size, 'bytes');
  console.log('LCP renderTime:', lastEntry.renderTime, 'ms');
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });

// For INP: Record worst interaction
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Interaction:', {
      target: entry.interactionTarget,
      duration: entry.duration,
      processingDuration: entry.processingDuration,
      duration: entry.duration
    });
  }
});

observer.observe({ type: 'event', durationThreshold: 40, buffered: true });

// For CLS: Find elements causing shifts
const observer = new PerformanceObserver((list) => {
  let totalCLS = 0;
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) { // Only count non-user-caused shifts
      console.log('Layout shift:', {
        value: entry.value,
        element: entry.sources[0].node,
        hadRecentInput: entry.hadRecentInput
      });
      totalCLS += entry.value;
    }
  }
  console.log('Total CLS:', totalCLS);
});

observer.observe({ type: 'layout-shift', buffered: true });
```

**Step 3: Optimize Images (Biggest LCP Impact)**

```html
<!-- BEFORE: Slow image loading -->
<img src="hero.jpg" alt="Hero" />
<!-- Results: 2.5MB, loads at 3.2s -->

<!-- AFTER: Optimized image loading -->
<!-- 1. Use modern format (WebP with fallback) -->
<!-- 2. Responsive sizes -->
<!-- 3. Lazy loading for below-fold images -->
<!-- 4. Explicit dimensions (prevents CLS) -->

<picture>
  <!-- WebP format: 60% size reduction -->
  <source
    srcset="
      /images/hero-small.webp 480w,
      /images/hero-medium.webp 960w,
      /images/hero-large.webp 1920w
    "
    type="image/webp"
    sizes="min(100vw, 1200px)"
  />
  <!-- JPEG fallback for old browsers -->
  <img
    src="/images/hero-medium.jpg"
    alt="Hero"
    loading="lazy"
    width="1920"
    height="1080"
    fetchpriority="high" <!-- Prioritize hero image -->
  />
</picture>

<!-- Results: 900KB (64% smaller), loads at 1.8s, no CLS -->
```

**Step 4: Optimize JavaScript (LCP + INP)**

```javascript
// BEFORE: Large, blocking bundle
<script src="bundle.js"></script> <!-- 850KB -->

// AFTER: Code splitting + lazy loading
<!-- Split bundle into multiple chunks -->
<script src="runtime.js" defer></script>
<script src="vendor.js" defer></script>
<script src="main.js" defer></script>

<!-- Lazy load non-critical bundles -->
<script>
  // Load analytics only after page interactive
  window.addEventListener('load', () => {
    import('analytics.js');
  });

  // Load modals only when needed
  document.querySelector('.open-modal-btn').addEventListener('click', async () => {
    const Modal = await import('./Modal.js');
    Modal.show();
  });
</script>

<!-- Use preload for critical chunks -->
<link rel="preload" href="critical.js" as="script" />

<!-- Results:
Before: 850KB bundle, blocking rendering
After: 250KB critical JS, 600KB lazy loaded
Effect: LCP improved by 500ms
-->
```

**Step 5: Optimize React Rendering (INP)**

```javascript
// BEFORE: Heavy rendering blocks interaction
function SearchPage() {
  const [query, setQuery] = useState('');

  // Every keystroke triggers re-render of entire tree
  const results = useMemo(() => {
    // Heavy processing on every keystroke
    return filterResults(allData, query);
  }, [query]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)} <!-- Blocking -->
      placeholder="Search..."
    />
  );
}

// AFTER: Non-blocking updates
import { useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          const newQuery = e.target.value;
          setQuery(newQuery); // Immediate update

          // Heavy processing doesn't block
          startTransition(() => {
            const filtered = filterResults(allData, newQuery);
            setResults(filtered);
          });
        }}
        placeholder="Search..."
      />
      {isPending && <LoadingSpinner />}
      <ResultsList items={results} />
    </>
  );
}

// Results:
// Before: Keystroke response at 150ms (user sees lag)
// After: Keystroke response at 50ms (feels instant), processing continues
```

**Step 6: Fix Layout Shift (CLS)**

```html
<!-- BEFORE: Unsized images cause shift -->
<div class="ad-container">
  <img src="ad.jpg" />
</div>
<!-- Problem: Browser doesn't know ad height until loaded -->

<!-- AFTER: Reserve space with aspect-ratio -->
<div class="ad-container" style="aspect-ratio: 300/250;">
  <img src="ad.jpg" alt="Advertisement" />
</div>

<!-- OR: Explicit dimensions -->
<img src="hero.jpg" width="1920" height="1080" alt="Hero" />

<!-- For dynamic content, use skeleton screens -->
<div class="user-card" style="min-height: 200px;">
  {loading ? (
    <Skeleton height={200} />
  ) : (
    <UserProfile user={data} />
  )}
</div>

<!-- For web fonts, use font-display: swap -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap; /* Show fallback first, no reflow when custom loads -->
  }
</style>
```

**Step 7: Continuous Monitoring**

```javascript
// Set up alerts for metric degradation
const setupAlerts = () => {
  // Alert if LCP exceeds 3 seconds
  onLCP((metric) => {
    if (metric.value > 3000 && metric.rating === 'poor') {
      sendAlert(`LCP degraded: ${metric.value}ms`);
    }
  });

  // Alert if INP exceeds 250ms
  onINP((metric) => {
    if (metric.value > 250) {
      sendAlert(`INP degraded: ${metric.value}ms`);
    }
  });

  // Alert if CLS exceeds 0.15
  onCLS((metric) => {
    if (metric.value > 0.15) {
      sendAlert(`CLS degraded: ${metric.value}`);
    }
  });
};

// Daily reports
const generateDailyReport = async () => {
  const metrics = await fetch('/api/metrics/daily').then(r => r.json());

  return `
    Daily Vitals Report:
    LCP: ${metrics.lcp.p75}ms (${metrics.lcp.trend > 0 ? '📈' : '📉'})
    INP: ${metrics.inp.p75}ms (${metrics.inp.trend > 0 ? '📈' : '📉'})
    CLS: ${metrics.cls.p75} (${metrics.cls.trend > 0 ? '📈' : '📉'})

    ${metrics.lcp.p75 > 2500 ? '⚠️ LCP needs optimization' : '✓ LCP good'}
    ${metrics.inp.p75 > 200 ? '⚠️ INP needs optimization' : '✓ INP good'}
    ${metrics.cls.p75 > 0.1 ? '⚠️ CLS needs optimization' : '✓ CLS good'}
  `;
};
```

### Checklist for Complete Optimization

```
LCP Optimization Checklist:
[ ] Images optimized (WebP, responsive sizes, correct format)
[ ] Critical CSS inlined
[ ] JavaScript deferred/async
[ ] Preload critical resources
[ ] Minimize server response time (TTFB)
[ ] Content Delivery Network (CDN) enabled
[ ] Fonts optimized (preload, font-display: swap)

INP Optimization Checklist:
[ ] Event handlers are lightweight
[ ] Long tasks broken up (< 50ms)
[ ] React updates non-blocking (startTransition)
[ ] No heavy calculations in event handlers
[ ] Worker threads for background processing
[ ] API calls debounced

CLS Optimization Checklist:
[ ] All images have width/height or aspect-ratio
[ ] Web fonts have font-display: swap
[ ] Ads/embedded content have reserved space
[ ] No content insertion above fold without user interaction
[ ] Animations use transform/opacity (not layout properties)
[ ] Dynamic content doesn't shift existing content
```

---

<details>
<summary><strong>🔍 Deep Dive: LCP Image Optimization Deep Technical Details</strong></summary>

### Image Format Comparison

**JPEG (Old Standard)**
- Compression: Lossy, good for photos
- Size: 100% (baseline)
- Browser support: All browsers
- Use case: Photos, photorealistic images

**WebP (Modern Standard)**
- Compression: Lossy/lossless, 25-35% smaller than JPEG
- Size: 65-75% (30-35% savings)
- Browser support: 96% of browsers (IE11 excluded)
- Use case: Photos, most images

**AVIF (Newest)**
- Compression: Lossy/lossless, 30-50% smaller than JPEG
- Size: 50-70% (30-50% savings, best compression)
- Browser support: 85% of browsers (newer browsers)
- Use case: Photo-heavy sites where compatibility not critical

**PNG (Lossless)**
- Compression: Lossless, larger than JPEG
- Size: 150-200% of JPEG
- Use case: Images requiring transparency, graphics
- Alternative: Use WebP with transparency support

```javascript
// Serve optimal format based on browser support
<picture>
  <!-- AVIF: Best compression for modern browsers -->
  <source srcset="image.avif" type="image/avif" />

  <!-- WebP: Good compression with wider support -->
  <source srcset="image.webp" type="image/webp" />

  <!-- JPEG: Fallback for all browsers -->
  <img src="image.jpg" alt="..." />
</picture>
```

### Responsive Image Sizing

**Problem: Wrong size for screen**
```
Desktop user: Shows 500KB image on 480px phone screen (waste)
Mobile user: Downloads large image when small suffices

Solution: Use srcset to serve right size for device
```

**Implementation:**
```html
<img
  src="image-medium.webp" <!-- Fallback for old browsers -->
  srcset="
    image-small.webp 480w,
    image-medium.webp 960w,
    image-large.webp 1920w,
    image-xl.webp 2560w
  "
  sizes="
    (max-width: 480px) 100vw,
    (max-width: 960px) 80vw,
    (max-width: 1440px) 60vw,
    50vw
  "
  alt="..."
/>

<!-- How browser uses this:
1. Device is 375px wide (iPhone)
2. Matches (max-width: 480px) rule → uses 100vw
3. 100vw on 375px device = 375px
4. Selects closest match from srcset: image-small.webp (480w)
5. Loads image-small.webp (~200KB instead of 500KB)
-->
```

### Image Priority Hints

```html
<!-- HIGH PRIORITY: Hero image, above fold, immediately visible -->
<img
  src="hero.webp"
  fetchpriority="high"
  alt="..."
/>

<!-- MEDIUM (default): Regular in-viewport images -->
<img src="product.webp" alt="..." />

<!-- LOW: Below-fold images, lazy load -->
<img
  src="footer-image.webp"
  loading="lazy"
  fetchpriority="low"
  alt="..."
/>

<!-- Optimization effect:
Hero image (high priority): Starts at 100ms (loads first)
Product image (default): Starts at 300ms (after hero)
Footer image (lazy): Loads only when entering viewport
Result: LCP measured at hero time (100ms baseline + fetch time)
-->
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario 2: Mobile-First Website</strong></summary>

### Problem Setup
Mobile-first news site with:
- Mobile LCP: 4.8s
- Desktop LCP: 2.1s (acceptable)
- Mobile users: 65% of traffic
- Revenue per user: Mobile worth less due to ads

### Root Cause

**Mobile network analysis (Chrome DevTools throttled to "Slow 4G"):**
```
Time: 0ms
  └─ Navigation starts

Time: 100ms
  └─ HTML received (50KB)
  └─ Parse HTML

Time: 150ms
  └─ CSS downloaded (200KB)
  └─ Parse CSS + block rendering

Time: 450ms
  └─ CSS parsing complete
  └─ Start rendering

Time: 500ms
  └─ Hero image request starts (2MB JPEG)

Time: 3200ms
  └─ Hero image finishes (slow 4G: 2MB at ~600KB/s)

Time: 3500ms
  └─ Hero image visible
  └─ LCP fires at 3500ms (Poor!)
```

### Optimization 1: Preload Critical Resources

```html
<!-- BEFORE: Default loading order -->
<head>
  <link rel="stylesheet" href="style.css">
  <script src="bundle.js"></script>
</head>
<body>
  <img src="hero.jpg" alt="...">
</body>

<!-- AFTER: Preload hero, defer JS -->
<head>
  <!-- Preload hero image to start immediately -->
  <link rel="preload" as="image" href="hero.webp" imagesrcset="..." />

  <!-- Preload critical CSS font -->
  <link rel="preload" href="fonts/font.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Inline critical CSS to avoid blocking -->
  <style>
    /* Critical styling for above-fold content only */
    body { margin: 0; }
    .hero { width: 100%; }
    .headline { font-size: 24px; }
  </style>

  <!-- Non-critical CSS as async -->
  <link rel="stylesheet" href="style.css" media="print" onload="this.media='all'">

  <!-- JavaScript deferred (not blocking) -->
  <script src="bundle.js" defer></script>
</head>

<!-- Effect on timeline:
Before:
  150-450ms: CSS blocks rendering
  3500ms: LCP (waiting for hero image)

After:
  0ms: Hero image starts preloading (no render block)
  100ms: Inline CSS ready immediately
  500ms: HTML parsed, rendering starts
  2800ms: Hero image arrives (preload benefit)
  3000ms: LCP fires

Result: LCP improved from 3500ms to 3000ms (14% improvement)
Note: Preload doesn't change fetch time, but starts it earlier
-->
```

### Optimization 2: Image Optimization for Mobile

```javascript
// BEFORE: Same image served to all devices
<img src="hero.jpg" alt="..." /> <!-- 2MB, 1920x1080 -->

// AFTER: Responsive images + modern format
<picture>
  <!-- AVIF format, highest compression -->
  <source
    srcset="
      hero-small.avif 480w,
      hero-medium.avif 960w,
      hero-large.avif 1920w
    "
    type="image/avif"
    sizes="
      (max-width: 480px) 100vw,
      (max-width: 960px) 80vw,
      (max-width: 1440px) 60vw,
      50vw
    "
  />

  <!-- WebP format fallback -->
  <source
    srcset="
      hero-small.webp 480w,
      hero-medium.webp 960w,
      hero-large.webp 1920w
    "
    type="image/webp"
    sizes="
      (max-width: 480px) 100vw,
      (max-width: 960px) 80vw,
      (max-width: 1440px) 60vw,
      50vw
    "
  />

  <!-- JPEG fallback for old browsers -->
  <img
    src="hero-medium.jpg"
    alt="..."
    width="1920"
    height="1080"
    fetchpriority="high"
  />
</picture>

/* File sizes:
Device: iPhone (375px, Slow 4G)
  Format         Size    Load time @ 600KB/s
  JPEG 480w:     500KB   833ms
  WebP 480w:     300KB   500ms
  AVIF 480w:     150KB   250ms

Desktop (1920px):
  JPEG 1920w:    2MB     3333ms
  WebP 1920w:    1.2MB   2000ms
  AVIF 1920w:    600KB   1000ms

Result: Mobile LCP improved from 3500ms to 2250ms (35% improvement)
*/
```

### Optimization 3: Inlining Critical CSS

```html
<!-- BEFORE: External CSS blocks rendering -->
<head>
  <link rel="stylesheet" href="styles.css"> <!-- 200KB -->
  <!-- 150-450ms: Blocked waiting for CSS -->
</head>

<!-- AFTER: Inline critical CSS, defer rest -->
<head>
  <!-- Inline only above-fold critical styles (~5KB) -->
  <style>
    /* Critical path CSS - styles for initial render */
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.5;
    }
    .hero {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
    }
    .headline {
      font-size: clamp(24px, 5vw, 48px);
      margin: 20px;
    }
    /* ... other critical styles ... */
  </style>

  <!-- Defer non-critical CSS -->
  <link rel="stylesheet" href="components.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="animations.css" media="print" onload="this.media='all'">

  <!-- Or use async variant -->
  <link rel="stylesheet" href="styles-async.css" as="style" onload="this.rel='stylesheet'">
</head>

<!-- Effect:
Before:
  0ms: HTML starts downloading
  100ms: HTML parsed, requests CSS
  150ms: CSS starts downloading (200KB)
  450ms: CSS finished, rendering can start

After:
  0ms: HTML starts downloading
  100ms: HTML parsed, inline CSS ready immediately
  110ms: Rendering can start (110ms vs 450ms)
  300ms: Non-critical CSS starts downloading (non-blocking)

Result: Reduced render-blocking time by 340ms
-->
```

### Results
- Mobile LCP: 4.8s → 2.1s (-56%, now good)
- Image bytes: 2MB → 150KB (mobile AVIF)
- Render-blocking time: 300ms → 0ms
- Time to Interactive: 5.2s → 2.8s
- Mobile conversion rate: +18% increase

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Mobile vs Desktop Optimization</strong></summary>

**Trade-off 1: Image Format Compatibility**
```
Option A: Serve AVIF (30% size reduction)
- Pro: Best compression, faster on modern devices
- Con: 15% of users on old browsers see no image
- Solution: Use <picture> element with fallbacks

Option B: Serve WebP (20% size reduction)
- Pro: Wide support (96% of browsers)
- Con: Slightly larger than AVIF
- Solution: Good compromise between compatibility and size

Option C: Stick with JPEG
- Pro: Universal support
- Con: Largest file size
- Impact: 3-4s LCP on mobile (unacceptable)

Decision: Use <picture> with AVIF/WebP/JPEG cascade (no users left behind)
```

**Trade-off 2: Responsive Images Overhead**
```
Option A: Serve single size for all devices
- Benefit: Simpler HTML/CSS
- Cost: Mobile users waste 70% of bandwidth
- LCP impact: Mobile 4.8s vs 2.1s (2.7s penalty)

Option B: Dynamic srcset based on device
- Benefit: Right size for every device
- Cost: Slightly more HTML
- LCP impact: 2.1s good for all devices
- Trade: 5KB more HTML (negligible vs 1.8MB image saved)

Decision: Always use responsive images (the savings far outweigh complexity)
```

**Trade-off 3: Preload vs Bandwidth**
```
Option A: No preload, natural loading order
- Pro: Simpler, less bandwidth for users who leave
- Con: Slower LCP (waiting for CSS to parse first)
- Scenario: 10% of users bounce before LCP
- LCP: 3.5s (poor)

Option B: Aggressively preload all resources
- Pro: Fast LCP
- Con: Users who bounce still download all bytes
- Scenario: 10% bounce rate × 500KB preloaded = 50MB wasted
- LCP: 1.8s (good)
- Wasted bandwidth: 50MB × price per GB

Decision: Preload only critical resources (hero, critical fonts)
Cost-benefit: 400ms LCP improvement vs small bandwidth waste = worth it
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Optimization Strategies</strong></summary>

### "Why should we care about these metrics?"

**From user perspective:**
```
Fast page (LCP < 2.5s):
- "I can start reading/using immediately"
- Stay on site, convert, return

Slow page (LCP > 4s):
- "This site is broken, it's too slow"
- Leave immediately (bounce rate +45%)
- Never return

From business perspective:
- SEO: Google ranks fast sites higher
- Conversion: 1s delay = 7% conversion loss
- Revenue: 1M visitors × 7% × $100 value = $7M loss
```

### "How do I debug LCP?"

**Step-by-step debugging:**

```javascript
// 1. Check what element is LCP
const observer = new PerformanceObserver((list) => {
  const lastEntry = list.getEntries()[list.getEntries().length - 1];
  console.log('LCP element:', lastEntry.element.tagName);
  console.log('LCP element ID:', lastEntry.element.id);
  console.log('LCP element classes:', lastEntry.element.className);
  console.log('LCP size:', lastEntry.size, 'bytes');
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });

// 2. If it's an image:
//    - Is image huge? → Optimize format and size
//    - Is it lazy-loaded? → Remove loading="lazy" or add fetchpriority="high"
//    - Is it late in HTML? → Move it earlier

// 3. If it's text:
//    - Is font blocking? → Add font-display: swap
//    - Is CSS slow? → Inline critical CSS
//    - Is JavaScript blocking? → Add defer to <script> tags

// 4. If it's generic element:
//    - Is it waiting for JavaScript? → Move critical JS earlier
//    - Is it waiting for API data? → Preload API response
//    - Is it below fold? → Might be measuring wrong element
```

### "How do I optimize without breaking functionality?"

**Principle: Progressive Enhancement**

```html
<!-- Start with bare minimum for fast LCP -->
<main>
  <img
    src="hero.webp"
    alt="Hero"
    width="1920"
    height="1080"
    fetchpriority="high"
  />
  <h1>Welcome to our site</h1>
  <p>Content loads immediately...</p>
</main>

<!-- Then enhance with JavaScript (doesn't block rendering) -->
<script>
  // After page interactive, add interactivity
  window.addEventListener('load', () => {
    // Initialize analytics (non-critical)
    import('analytics.js');

    // Initialize form validation (non-critical)
    import('form-validator.js');

    // Initialize carousels (non-critical)
    import('carousel.js');
  });
</script>

/* Benefits:
- LCP measures at minimum viable page (fast)
- User can see and read content immediately
- Enhancements load after (non-blocking)
- Total time to full functionality same, but PERCEIVED as faster
*/
```

### Common Optimization Quick Wins

**1. Add missing image dimensions (prevents CLS)**
```html
<!-- BEFORE: CLS > 0.1 -->
<img src="image.jpg" />

<!-- AFTER: CLS fixed -->
<img src="image.jpg" width="1200" height="600" alt="..." />

<!-- Effort: 10 seconds per image -->
<!-- Impact: 0.15 CLS point improvement -->
```

**2. Add defer to scripts (improves LCP)**
```html
<!-- BEFORE: Script blocks rendering -->
<script src="bundle.js"></script>

<!-- AFTER: Script doesn't block -->
<script src="bundle.js" defer></script>

<!-- Effort: Change 1 word -->
<!-- Impact: 300-500ms LCP improvement -->
```

**3. Inline critical CSS (improves LCP)**
```html
<!-- BEFORE: CSS blocks rendering for 300ms -->
<link rel="stylesheet" href="styles.css">

<!-- AFTER: CSS doesn't block -->
<style>
  /* Critical styles only (~5KB) */
</style>
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">

<!-- Effort: Extract critical styles (1-2 hours) -->
<!-- Impact: 200-300ms LCP improvement -->
<!-- Tools: critical-css npm package automates this -->
```

</details>

---

## Question 3: How do you monitor and debug Core Web Vitals in production?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Netflix, Stripe, Shopify

### Question
What tools and strategies do you use to monitor Core Web Vitals in production and identify which users are affected?

### Answer

### Monitoring Architecture

**Complete monitoring stack:**
```
                    Production Users
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Real User Data    Synthetic Tests    Error Logs
        │                   │                   │
        ├─ web-vitals lib   ├─ Lighthouse      ├─ RUM errors
        ├─ sendBeacon       ├─ WebPageTest     ├─ Crashes
        └─ Custom events    └─ CI integration  └─ Regressions
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    Analytics Backend
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    Dashboard           Alerts            Reports
    - Metrics trends    - Degradation     - Hourly
    - User segments     - Thresholds      - Daily
    - Device breakdown  - Automated       - Weekly
```

### Real User Monitoring (RUM) Implementation

```javascript
// 1. Collect metrics from actual users
import { onLCP, onINP, onCLS } from 'web-vitals';

// 2. Add contextual data
const getSessionContext = () => {
  return {
    // Device info
    deviceType: getDeviceType(),
    connectionSpeed: navigator.connection?.effectiveType, // 4g, 3g, 2g
    deviceMemory: navigator.deviceMemory, // RAM available

    // User behavior
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
    pageUrl: window.location.href,

    // Page type
    pageType: detectPageType(), // homepage, product, checkout

    // Network info
    rtt: navigator.connection?.rtt, // Round trip time
    downlink: navigator.connection?.downlink, // Mbps
  };
};

// 3. Send metrics with context
const reportMetric = (metric) => {
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,

    // Add context
    ...getSessionContext(),

    // Add timestamp
    timestamp: Date.now(),

    // URL for grouping
    url: window.location.href,
  };

  // Send via sendBeacon (survives page unload)
  const body = JSON.stringify(payload);
  navigator.sendBeacon('/api/vitals', body);
};

onLCP(reportMetric);
onINP(reportMetric);
onCLS(reportMetric);

// 4. Error handling for metrics collection
window.addEventListener('error', (event) => {
  // Track if web-vitals library itself fails
  navigator.sendBeacon('/api/vitals-errors', JSON.stringify({
    error: event.message,
    timestamp: Date.now(),
  }));
});
```

### Segmentation Analysis

```javascript
// Analyze metrics by user segment
const analyzeMetricsBySegment = async () => {
  const metrics = await fetchMetricsFromBackend();

  // Group by device type
  const byDevice = groupBy(metrics, 'deviceType');
  console.log('Mobile LCP:', calculateP75(byDevice.mobile).lcp);
  console.log('Desktop LCP:', calculateP75(byDevice.desktop).lcp);

  // Group by connection
  const byConnection = groupBy(metrics, 'connectionSpeed');
  console.log('4G LCP:', calculateP75(byConnection['4g']).lcp);
  console.log('3G LCP:', calculateP75(byConnection['3g']).lcp);

  // Group by page type
  const byPage = groupBy(metrics, 'pageType');
  console.log('Homepage LCP:', calculateP75(byPage.homepage).lcp);
  console.log('Product LCP:', calculateP75(byPage.product).lcp);

  // Group by browser
  const byBrowser = groupBy(metrics, 'userAgent');
  console.log('Chrome LCP:', calculateP75(byBrowser.chrome).lcp);
  console.log('Safari LCP:', calculateP75(byBrowser.safari).lcp);

  // Result: Identify which segment has problems
  // If mobile 3G has LCP 5s vs desktop 4G 1.8s:
  // → Focus optimization on mobile image loading
};

// Calculate percentile (p75 = 75th percentile)
const calculateP75 = (metrics) => {
  const sorted = metrics.sort((a, b) => a.value - b.value);
  const index = Math.ceil(sorted.length * 0.75) - 1;
  return sorted[index];
};
```

### Synthetic Monitoring (Lab Testing)

```javascript
// Run Lighthouse in CI/CD pipeline
// Detects regressions before production

// .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: GoogleChrome/lighthouse-ci@v0
        with:
          configPath: './lighthouserc.json'
          temporaryPublicStorage: true

// lighthouserc.json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }],
        "performance": ["error", { "minScore": 0.80 }]
      }
    }
  }
}

// Benefits:
// - Every PR checked for performance regressions
// - Lighthouse scores before merge
// - CI fails if metrics degrade (prevents bad deploys)
// - Lab metrics complement RUM data
```

### Dashboard and Alerting

```javascript
// Real-time monitoring dashboard
const createDashboard = () => {
  // Example using Google Analytics 4
  gtag('event', 'page_view', {
    'page_path': window.location.pathname,
  });

  // Track Core Web Vitals
  import { onLCP, onINP, onCLS } from 'web-vitals';

  onLCP(metric => {
    gtag('event', 'LCP', {
      'value': Math.round(metric.value),
      'event_category': 'web-vitals',
      'event_label': metric.rating,
    });
  });

  onINP(metric => {
    gtag('event', 'INP', {
      'value': Math.round(metric.value),
      'event_category': 'web-vitals',
      'event_label': metric.rating,
    });
  });

  onCLS(metric => {
    gtag('event', 'CLS', {
      'value': Math.round(metric.value * 1000), // Convert to 0-1000 scale
      'event_category': 'web-vitals',
      'event_label': metric.rating,
    });
  });
};

// Set up alerts
const setupAlerts = () => {
  // Alert if LCP degrades by 20% in last hour
  const checkLcpDegradation = async () => {
    const lastHour = await fetchMetrics('1h');
    const last24h = await fetchMetrics('24h');

    const lastHourP75 = calculateP75(lastHour);
    const day24hP75 = calculateP75(last24h);

    const degradation = (lastHourP75 - day24hP75) / day24hP75;

    if (degradation > 0.20) {
      sendAlert(`LCP degraded by ${degradation * 100}%`);
      postToSlack({
        text: `LCP Alert: ${degradation * 100}% worse than 24h average`,
        blocks: [...]
      });
    }
  };

  // Run checks every 5 minutes
  setInterval(checkLcpDegradation, 5 * 60 * 1000);
};
```

### Tools Comparison

| Tool | Type | Cost | Best For | Integration |
|------|------|------|----------|-------------|
| **web-vitals library** | RUM | Free | First-party data collection | Easy (npm) |
| **Google Analytics 4** | RUM + Dashboard | Free | Basic monitoring | SDK injection |
| **Sentry** | RUM + Error tracking | $ | Performance + errors | SDK |
| **DataDog** | RUM + Analytics | $$ | Enterprise monitoring | SDK |
| **Lighthouse CI** | Synthetic | Free | CI/CD automation | GitHub Actions |
| **WebPageTest** | Synthetic | Free | Deep analysis | Manual |
| **Speedcurve** | Continuous | $$$ | Enterprise monitoring | API |
| **New Relic** | RUM + Backend | $$ | Full stack | SDK |

### Debugging Specific Issues

**"LCP is poor on product pages (4.2s) but good on homepage (1.8s)"**

```javascript
const debugPageTypeDifference = async () => {
  const metrics = await fetchMetrics();

  // Group by page type
  const homepage = metrics.filter(m => m.pageType === 'homepage');
  const product = metrics.filter(m => m.pageType === 'product');

  console.log('Homepage LCP p75:', calculateP75(homepage));
  console.log('Product LCP p75:', calculateP75(product));

  // Hypothesis: Product pages load larger/more images
  const productImages = getPageImages('product');
  const homepageImages = getPageImages('homepage');

  console.log('Product avg image size:',
    productImages.reduce((a, b) => a + b.size, 0) / productImages.length);
  console.log('Homepage avg image size:',
    homepageImages.reduce((a, b) => a + b.size, 0) / homepageImages.length);

  // If product images are 5x larger:
  // → Apply aggressive image optimization to product pages
  // → Use AVIF format for product photos
  // → Implement lazy loading for below-fold images
};
```

**"INP is poor (300ms) but only for search interactions"**

```javascript
const debugSearchInteractionDifference = async () => {
  const metrics = await fetchMetrics();

  // Filter to search-related interactions
  const searchInteractions = metrics.filter(m =>
    m.interactionTarget?.includes('search')
  );

  console.log('Search INP p75:', calculateP75(searchInteractions).inp);

  // Record performance timeline for search
  performance.mark('search-start');
  // ... search handler code ...
  performance.mark('search-end');
  performance.measure('search-duration', 'search-start', 'search-end');

  // Check what's slow in search handler
  // Likely causes:
  // - Filter large dataset (O(n²))
  // - Re-render many components
  // - API call blocking

  // Solution: Debounce search, use virtual scrolling, async rendering
};
```

---

## More depth sections following the same pattern as above...

(Continuing with comprehensive content for remaining dimensions of each metric, but I'll keep this at reasonable length)

---

## Summary of Core Web Vitals

**Three metrics, three dimensions, infinite optimization opportunities:**

1. **LCP** - Make it load fast (images, CSS, JS)
2. **INP** - Make it feel responsive (light event handlers, async processing)
3. **CLS** - Keep it stable (reserved space, no surprises)

**Monitoring** - Measure from real users, test in lab, alert on degradation
**Optimization** - Iterate, measure, improve (data-driven decisions)
**Trade-offs** - Balance performance vs functionality vs compatibility

</details>
