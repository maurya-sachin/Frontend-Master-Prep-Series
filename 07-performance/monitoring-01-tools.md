# Performance Monitoring and Profiling

> Web Vitals, performance APIs, monitoring tools, and profiling techniques.

---

## Question 1: Core Web Vitals

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Google, Meta, Vercel

### Question
What are Core Web Vitals and how do you measure them?

### Answer

**Core Web Vitals** - Google's metrics for user experience.

**Three key metrics:**
1. **LCP (Largest Contentful Paint)** - Loading performance
   - Good: < 2.5s
   - Needs improvement: 2.5-4s
   - Poor: > 4s

2. **FID (First Input Delay)** - Interactivity
   - Good: < 100ms
   - Needs improvement: 100-300ms
   - Poor: > 300ms

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - Good: < 0.1
   - Needs improvement: 0.1-0.25
   - Poor: > 0.25

```javascript
// Measuring with web-vitals library
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP(console.log);
onFID(console.log);
onCLS(console.log);

// Using Performance Observer API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });

// Custom reporting
function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  }
}

onCLS(sendToAnalytics);
```

### Resources
- [Web Vitals](https://web.dev/vitals/)
- [web-vitals Library](https://github.com/GoogleChrome/web-vitals)

---

<details>
<summary>🔍 <strong>Deep Dive: Core Web Vitals Internals</strong></summary>

**How Each Metric is Measured:**

**1. LCP (Largest Contentful Paint) - Algorithm:**

```javascript
// Browser's LCP detection algorithm
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1]; // Latest LCP candidate

  // LCP candidates (in order of priority):
  // 1. <img> elements
  // 2. <image> inside <svg>
  // 3. <video> poster images
  // 4. Background images via url()
  // 5. Block-level text nodes

  console.log('LCP element:', lastEntry.element);
  console.log('LCP time:', lastEntry.renderTime || lastEntry.loadTime);
  console.log('LCP size:', lastEntry.size); // pixels²
});

lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

// LCP calculation:
// 1. Browser tracks all content paints during page load
// 2. Each time a larger element renders, it becomes new LCP candidate
// 3. LCP finalizes when:
//    - User interacts (click, scroll, keypress)
//    - Tab goes to background
//    - Page unloads

// Why LCP can change:
// Time 0.5s: Hero text (50,000px²) → LCP = 0.5s
// Time 1.2s: Hero image (200,000px²) → LCP = 1.2s (updated!)
// Time 2.1s: User clicks → LCP finalizes at 1.2s
```

**LCP Optimization Priorities:**
```javascript
// Impact ranking (from Chrome team research)
const lcpOptimizations = {
  'Preload LCP image': { impact: 'Very High', avg_improvement: '-40%' },
  'Remove render-blocking JS/CSS': { impact: 'High', avg_improvement: '-30%' },
  'Use CDN for images': { impact: 'High', avg_improvement: '-25%' },
  'Optimize server response (TTFB)': { impact: 'Medium', avg_improvement: '-20%' },
  'Compress images (WebP)': { impact: 'Medium', avg_improvement: '-15%' },
  'Lazy load below-fold images': { impact: 'Low', avg_improvement: '-5%' },
};

// Example: Preload LCP image
<link rel="preload" as="image" href="hero.webp" fetchpriority="high" />
```

**2. FID (First Input Delay) / INP (Interaction to Next Paint):**

```javascript
// FID measures delay from first interaction to browser response
const fidObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('FID:', entry.processingStart - entry.startTime);
    // Example: User clicks at T=1000ms, browser starts processing at T=1080ms
    // FID = 80ms (delay caused by JavaScript blocking main thread)
  });
});
fidObserver.observe({ type: 'first-input', buffered: true });

// INP (replacing FID in 2024) - measures ALL interactions
const inpObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    const inp = entry.processingEnd - entry.startTime;
    console.log('INP:', inp); // Total time: input delay + processing + presentation
  });
});
inpObserver.observe({ type: 'event', buffered: true });

// Main thread blocking visualization
Timeline:
├─ 0-500ms: Parse HTML ████████████
├─ 500-1200ms: Execute JS (BLOCKING) ████████████████████
│   User clicks button at 1000ms ⚠️ (queued, can't respond)
├─ 1200ms: Main thread free, process click handler
└─ FID = 200ms (1200ms - 1000ms)

// Fix: Break up long tasks
// ❌ Bad: Single 700ms task
function processData() {
  for (let i = 0; i < 1000000; i++) {
    // Heavy computation (blocks main thread)
  }
}

// ✅ Good: Chunked with yielding
async function processData() {
  const chunkSize = 10000;
  for (let i = 0; i < 1000000; i += chunkSize) {
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread
    for (let j = i; j < i + chunkSize; j++) {
      // Process chunk
    }
  }
}
```

**3. CLS (Cumulative Layout Shift) - Calculation:**

```javascript
// CLS measures visual stability (unexpected layout shifts)
const clsObserver = new PerformanceObserver((list) => {
  let cls = 0;
  list.getEntries().forEach((entry) => {
    if (!entry.hadRecentInput) { // Ignore user-initiated shifts
      cls += entry.value;
      console.log('Layout shift:', entry.value);
      console.log('Affected elements:', entry.sources);
    }
  });
  console.log('Total CLS:', cls);
});
clsObserver.observe({ type: 'layout-shift', buffered: true });

// CLS formula (per shift):
// impact_fraction × distance_fraction
//
// Example:
// Element moves from 10% viewport height to 30% height (20% impact)
// Element moves 25% of viewport height down (25% distance)
// Shift score = 0.20 × 0.25 = 0.05

// Visual example:
// ┌──────────────┐
// │ Header       │ ← Stable
// ├──────────────┤
// │ [Image loads]│ ← No height reserved, pushes content down
// ├──────────────┤
// │ Text content │ ← Shifts 300px down (CLS += 0.15)
// └──────────────┘

// Fix: Reserve space
// ❌ Bad: No dimensions
<img src="photo.jpg" /> {/* Causes CLS when loaded */}

// ✅ Good: Explicit dimensions or aspect ratio
<img src="photo.jpg" width="800" height="600" />
// or
<div style={{ aspectRatio: '16/9' }}>
  <img src="photo.jpg" />
</div>
```

**Advanced Monitoring with web-vitals:**

```javascript
import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    id: metric.id, // Unique ID for this page load
    delta: metric.delta, // Change since last report
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    navigationType: metric.navigationType, // 'navigate', 'reload', 'back_forward'

    // Custom context
    url: window.location.href,
    userAgent: navigator.userAgent,
    effectiveType: navigator.connection?.effectiveType, // '4g', '3g', etc.
    deviceMemory: navigator.deviceMemory, // GB
    timestamp: Date.now(),
  };

  // Use sendBeacon (guaranteed to send even if user closes tab)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', JSON.stringify(body));
  } else {
    fetch('/analytics', { method: 'POST', body: JSON.stringify(body), keepalive: true });
  }
}

// Monitor all Core Web Vitals
onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics); // First Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte

// Attribution debugging (find root cause)
onLCP(sendToAnalytics, { reportAllChanges: true });

// Advanced: Get LCP element details
onLCP((metric) => {
  const lcpEntry = metric.entries[metric.entries.length - 1];
  console.log('LCP element:', lcpEntry.element);
  console.log('LCP element tag:', lcpEntry.element?.tagName);
  console.log('LCP resource URL:', lcpEntry.url); // If image
  console.log('LCP load time:', lcpEntry.loadTime);
  console.log('LCP render time:', lcpEntry.renderTime);
});
```

**Real User Monitoring (RUM) vs Lab Testing:**

| Metric Source | Data Type | Sample Size | Conditions | Use Case |
|---------------|-----------|-------------|------------|----------|
| **Lab (Lighthouse)** | Synthetic | Single run | Controlled (fast WiFi, desktop) | Development, CI/CD |
| **RUM (Field)** | Real users | Thousands | Real-world (3G, mobile, global) | Production monitoring |
| **CrUX (Chrome UX Report)** | Chrome users | Millions | Real Chrome users (28 days) | Benchmarking, SEO |

**Why metrics differ:**
```javascript
// Lighthouse (Lab): LCP = 1.2s (perfect conditions)
// RUM (Field): LCP = 3.8s (slow 3G, old phones, global users)
// Difference: 3.2× slower in real world!

// Always optimize for P75 (75th percentile) not average:
const metrics = [1.2, 1.5, 1.8, 2.1, 2.4, 3.2, 4.5, 8.1]; // LCP times
const p75 = metrics[Math.floor(metrics.length * 0.75)]; // 4.5s
// 75% of users experience 4.5s or better
```

</details>

---

<details>
<summary>🐛 <strong>Real-World Scenario: SaaS Dashboard Failing Core Web Vitals</strong></summary>

**Problem:**
Enterprise SaaS dashboard experiencing:
- CLS: 0.42 (target: < 0.1) - Users complaining about "jumpy UI"
- LCP: 6.2s on mobile (target: < 2.5s) - 58% bounce rate
- FID: 380ms (target: < 100ms) - Buttons feel "laggy"
- Customer support tickets: +240% about "slow/broken interface"
- Churned customers citing "poor UX" as reason: 18%

**Investigation with Chrome DevTools Performance:**

```javascript
// Step 1: Record Performance profile
// DevTools → Performance → Record → Interact → Stop

// Findings:
// 1. Main thread blocked for 4.2s during initial load
// 2. Layout shifts occurring at: 0.8s, 1.2s, 2.4s, 3.1s
// 3. LCP element: <div> with dynamic chart (renders at 6.2s)
// 4. Long tasks:
//    - analytics.js: 1,820ms
//    - charts-library.js: 2,340ms
//    - data-processing: 890ms

// Step 2: Use Coverage tool to find unused code
// DevTools → Coverage → Record
// Result: 68% of JavaScript unused on initial load (412KB wasted)

// Step 3: Identify CLS sources
const clsDebug = [];
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (!entry.hadRecentInput) {
      clsDebug.push({
        value: entry.value,
        sources: entry.sources.map(s => ({
          node: s.node,
          previousRect: s.previousRect,
          currentRect: s.currentRect,
        })),
      });
    }
  });
}).observe({ type: 'layout-shift', buffered: true });

// Results:
// Shift 1 (0.8s): Logo loads, no height → 0.12
// Shift 2 (1.2s): Navigation expands → 0.08
// Shift 3 (2.4s): Chart container resizes → 0.15
// Shift 4 (3.1s): Ads inject → 0.07
// Total CLS: 0.42
```

**Root Causes:**

1. **CLS Issues:**
   - ❌ Logo image with no width/height attributes
   - ❌ Navigation menu expands after fonts load
   - ❌ Chart container has no reserved height
   - ❌ Third-party ads inject without placeholder
   - ❌ Web fonts cause FOIT (Flash of Invisible Text)

2. **LCP Issues:**
   - ❌ Chart library (340KB) blocks rendering
   - ❌ Data fetched sequentially (waterfall)
   - ❌ Chart renders in main thread (blocking)
   - ❌ No loading skeleton/placeholder

3. **FID Issues:**
   - ❌ Heavy analytics initialization on load
   - ❌ Chart rendering blocks main thread
   - ❌ No code splitting (all JS loads upfront)

**Solution Implementation:**

```jsx
// 1. Fix CLS - Reserve space for all dynamic content

// ❌ Before: Logo causes shift
<img src="/logo.png" alt="Logo" />

// ✅ After: Dimensions prevent shift
<img src="/logo.png" alt="Logo" width="200" height="50" />

// ❌ Before: Chart container shifts
<div className="chart-container">
  {chartData && <Chart data={chartData} />}
</div>

// ✅ After: Reserved height + skeleton
<div className="chart-container" style={{ minHeight: '400px' }}>
  {chartData ? <Chart data={chartData} /> : <ChartSkeleton />}
</div>

// ❌ Before: Font swap causes text shift
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
}

// ✅ After: font-display prevents shift
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: swap; // Show fallback font immediately
}

// 2. Fix LCP - Optimize critical path

// ❌ Before: Sequential data fetching
async function loadDashboard() {
  const user = await fetch('/api/user');
  const metrics = await fetch('/api/metrics'); // Waits for user
  const chart = await fetch('/api/chart-data'); // Waits for metrics
  render(<Dashboard user={user} metrics={metrics} chart={chart} />);
}

// ✅ After: Parallel fetching + streaming
async function loadDashboard() {
  const [user, metrics, chart] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/metrics'),
    fetch('/api/chart-data'),
  ]);
  render(<Dashboard user={user} metrics={metrics} chart={chart} />);
}
// Improvement: 6.2s → 2.1s (66% faster)

// ✅ Even better: Streaming with Suspense
function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent /> {/* LCP candidate renders immediately */}
    </Suspense>
  );
}

// 3. Fix FID - Code splitting + defer heavy work

// ❌ Before: All code in main bundle
import Analytics from './analytics'; // 180KB
import Charts from './charts'; // 340KB
import Utils from './utils'; // 120KB

// ✅ After: Code splitting
import dynamic from 'next/dynamic';

const Analytics = dynamic(() => import('./analytics'), {
  ssr: false, // Don't load on server
});

const Charts = dynamic(() => import('./charts'), {
  loading: () => <ChartSkeleton />,
});

// ✅ Defer analytics initialization
useEffect(() => {
  // Wait for page interactive before loading analytics
  if (document.readyState === 'complete') {
    import('./analytics').then(module => module.init());
  } else {
    window.addEventListener('load', () => {
      import('./analytics').then(module => module.init());
    });
  }
}, []);

// ✅ Move chart rendering to Web Worker
// chart-worker.js
self.onmessage = (e) => {
  const chartData = processChartData(e.data); // Heavy computation
  self.postMessage(chartData);
};

// main.js
const chartWorker = new Worker('/chart-worker.js');
chartWorker.postMessage(rawData);
chartWorker.onmessage = (e) => {
  renderChart(e.data); // Main thread free during processing
};

// 4. Implement monitoring dashboard
// monitoring.ts
import { onCLS, onLCP, onFID } from 'web-vitals';

function setupMonitoring() {
  const vitals = { CLS: null, LCP: null, FID: null };

  onCLS((metric) => {
    vitals.CLS = metric.value;
    if (metric.value > 0.1) {
      // Alert on poor CLS
      console.error('High CLS detected:', metric.value);
      logToSentry('high-cls', { metric, entries: metric.entries });
    }
  });

  onLCP((metric) => {
    vitals.LCP = metric.value;
    if (metric.value > 2500) {
      // Alert on poor LCP
      const lcpElement = metric.entries[0]?.element;
      logToSentry('slow-lcp', {
        value: metric.value,
        element: lcpElement?.tagName,
        url: lcpElement?.src || lcpElement?.currentSrc,
      });
    }
  });

  onFID((metric) => {
    vitals.FID = metric.value;
    if (metric.value > 100) {
      logToSentry('high-fid', { metric });
    }
  });

  // Send to analytics on page unload
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon('/analytics/vitals', JSON.stringify(vitals));
  });
}
```

**Results After Optimization:**

```
Metric              Before    After     Improvement    Status
──────────────────────────────────────────────────────────────
CLS                 0.42      0.04      -90%          ✅ Good
LCP (mobile)        6.2s      2.1s      -66%          ✅ Good
LCP (desktop)       3.8s      1.4s      -63%          ✅ Good
FID                 380ms     45ms      -88%          ✅ Good
Bounce rate         58%       24%       -59%          ✅
Page load (3G)      12.4s     4.2s      -66%          ✅
Initial JS bundle   640KB     180KB     -72%          ✅
Unused JS           68%       18%       -74%          ✅
Customer tickets    +240%     -15%      -106%         ✅
Churn (UX reason)   18%       4%        -78%          ✅
```

**Monitoring Dashboard Setup:**

```javascript
// Real-time Web Vitals monitoring with percentiles
const vitalsDatabase = []; // Store all metrics

function analyzeVitals() {
  const lcp = vitalsDatabase.map(v => v.LCP).sort((a, b) => a - b);
  const cls = vitalsDatabase.map(v => v.CLS).sort((a, b) => a - b);
  const fid = vitalsDatabase.map(v => v.FID).sort((a, b) => a - b);

  console.log('LCP Analysis:');
  console.log('  P50:', lcp[Math.floor(lcp.length * 0.5)]);
  console.log('  P75:', lcp[Math.floor(lcp.length * 0.75)]);
  console.log('  P95:', lcp[Math.floor(lcp.length * 0.95)]);

  // Alert if P75 exceeds threshold
  if (lcp[Math.floor(lcp.length * 0.75)] > 2500) {
    alertTeam('LCP P75 exceeds 2.5s threshold');
  }
}

// Track by user segment
function segmentVitals(metric) {
  const segment = {
    device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    connection: navigator.connection?.effectiveType || 'unknown',
    region: getUserRegion(), // From IP geolocation
  };

  sendToAnalytics({
    ...metric,
    ...segment,
  });
}
```

</details>

---

<details>
<summary>⚖️ <strong>Trade-offs: Core Web Vitals Optimization Decisions</strong></summary>

**1. LCP Optimization Priorities:**

| Technique | Impact | Complexity | Cost | Trade-off |
|-----------|--------|------------|------|-----------|
| **Preload LCP image** | Very High | Low | Free | None (always do this) |
| **Remove render-blocking CSS** | High | Medium | Free | May see FOUC (Flash of Unstyled Content) |
| **Use CDN** | High | Low | $$$ | Ongoing cost vs performance gain |
| **Code splitting** | Medium | High | Free | More HTTP requests |
| **SSR/SSG** | Very High | Very High | $$ | Increased server costs, complexity |

**Decision Tree:**
```javascript
function optimizeLCP(scenario) {
  // Always do (no trade-offs):
  preloadLCPImage();
  compressImages();
  useCDN();

  // Trade-off decisions:
  if (isMarketingPage && !interactive) {
    return 'SSG'; // Static generation (best LCP, no server cost)
  }
  if (needsDynamicData && budget > 'high') {
    return 'SSR'; // Server rendering (great LCP, higher cost)
  }
  if (budget === 'low') {
    return 'CSR + Optimization'; // Client-side with aggressive optimization
  }
}

// Example: E-commerce product page
// Option A: SSG (Static Site Generation)
// LCP: 0.8s | Cost: Low | Trade-off: Stale data, long build times
export async function getStaticProps() {
  const product = await fetchProduct();
  return { props: { product }, revalidate: 3600 }; // ISR every hour
}

// Option B: SSR (Server-Side Rendering)
// LCP: 1.4s | Cost: High | Trade-off: Always fresh, higher server load
export async function getServerSideProps() {
  const product = await fetchProduct();
  return { props: { product } }; // Fresh on every request
}

// Option C: CSR with optimizations
// LCP: 2.2s | Cost: Very Low | Trade-off: Slower, but scalable
function ProductPage() {
  const { data } = useSWR('/api/product', { suspense: true });
  return <Product data={data} />;
}
```

**2. CLS Prevention Strategies:**

| Approach | Effectiveness | Complexity | UX Impact | Use Case |
|----------|--------------|------------|-----------|----------|
| **Reserve space (aspect-ratio)** | Very High | Low | None | Images, embeds |
| **Skeleton screens** | High | Medium | Positive (perceived performance) | Dynamic content |
| **font-display: optional** | Medium | Low | May cause FOIT (Flash of Invisible Text) | Non-critical fonts |
| **Disable animations** | Very High | Low | Negative (less engaging) | Critical flows only |

**Font Loading Trade-offs:**

```css
/* Option 1: font-display: swap (best for CLS, may cause FOUT) */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: swap; /* Show fallback immediately, swap when loaded */
}
/* Pro: Zero CLS from fonts
   Con: Flash of Unstyled Text (FOUT) - user sees font change */

/* Option 2: font-display: optional (best UX, may delay text) */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: optional; /* Only use custom font if loaded quickly */
}
/* Pro: No FOUT, no CLS
   Con: Custom font may not appear on slow connections */

/* Option 3: font-display: block (worst for CLS, no FOUT) */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: block; /* Hide text until font loads (up to 3s) */
}
/* Pro: No FOUT
   Con: FOIT (Flash of Invisible Text), poor CLS, bad UX */

// Recommendation: swap for body text, optional for headings
```

**3. FID/INP Optimization Trade-offs:**

| Technique | Impact on FID | Development Effort | Runtime Cost | Use Case |
|-----------|---------------|-------------------|--------------|----------|
| **Debounce/throttle events** | High | Low | None | Scroll/resize handlers |
| **Web Workers** | Very High | High | Medium (memory) | Heavy computation |
| **Code splitting** | Medium | Medium | Low | Large apps |
| **requestIdleCallback** | Medium | Medium | None | Non-critical tasks |

**Heavy Computation Trade-offs:**

```javascript
// Scenario: Processing 100,000 data points for chart

// Option A: Synchronous (blocks main thread)
function processData(data) {
  const result = data.map(heavyTransform); // 800ms, blocks UI
  return result;
}
// FID: 850ms (poor) | Complexity: Low | UX: Janky

// Option B: Web Worker (offload to background)
const worker = new Worker('/process-worker.js');
worker.postMessage(data);
worker.onmessage = (e) => setResult(e.data); // 800ms, doesn't block UI
// FID: 40ms (good) | Complexity: High | Memory: +15MB | UX: Smooth

// Option C: Chunked with yielding
async function processData(data) {
  const result = [];
  for (let i = 0; i < data.length; i += 1000) {
    await scheduler.yield(); // Let browser handle interactions
    result.push(...data.slice(i, i + 1000).map(heavyTransform));
  }
  return result;
}
// FID: 60ms (good) | Complexity: Medium | Processing time: 1100ms (slower) | UX: Smooth

// Decision matrix:
if (dataSize < 10000) return 'synchronous'; // Fast enough
if (dataSize < 50000) return 'chunked'; // Balance
if (dataSize > 50000) return 'web-worker'; // Heavy lifting
```

**4. Monitoring Granularity:**

| Approach | Data Volume | Cost | Insights | Use Case |
|----------|-------------|------|----------|----------|
| **Sample 1%** | Low | $ | Basic trends | Large traffic (1M+ views/day) |
| **Sample 10%** | Medium | $$ | Good insights | Medium traffic (100K-1M/day) |
| **Sample 100%** | High | $$$ | Complete picture | Small traffic (< 100K/day) or critical pages |
| **RUM + Synthetic** | Very High | $$$$ | Best of both | Enterprise |

**Sampling Strategy:**

```javascript
function shouldSampleMetric(metric) {
  // Always sample poor performance (100%)
  if (metric.value > threshold[metric.name]) {
    return true;
  }

  // Sample good performance (10%)
  return Math.random() < 0.1;
}

onLCP((metric) => {
  if (shouldSampleMetric(metric)) {
    sendToAnalytics(metric);
  }
});

// Example: 1M page views/day
// Poor performance: 200K samples (20% poor × 100% sampling)
// Good performance: 80K samples (80% good × 10% sampling)
// Total: 280K samples vs 1M (72% reduction in data/cost)
```

**5. Lab vs Field Metrics:**

| Source | Pros | Cons | Cost | Use Case |
|--------|------|------|------|----------|
| **Lighthouse (Lab)** | Consistent, fast, CI/CD | Not real users, perfect conditions | Free | Development, regression testing |
| **RUM (Field)** | Real users, real conditions | High variance, delayed | $$ | Production monitoring |
| **CrUX (Chrome UX)** | Massive dataset, free | 28-day lag, Chrome only | Free | Benchmarking, SEO |

**Monitoring Strategy:**

```javascript
// Development: Lighthouse in CI/CD
// .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    lhci autorun
    # Fail if LCP > 2.5s or CLS > 0.1

// Staging: Synthetic monitoring (Pingdom, Datadog)
// - Run every 5 minutes from multiple regions
// - Alert if metrics exceed thresholds

// Production: RUM with sampling
import { onCLS, onLCP, onFID } from 'web-vitals';

const SAMPLE_RATE = 0.1; // 10% of traffic

if (Math.random() < SAMPLE_RATE) {
  onCLS((metric) => analytics.track('CLS', metric));
  onLCP((metric) => analytics.track('LCP', metric));
  onFID((metric) => analytics.track('FID', metric));
}

// Result: Comprehensive coverage at reasonable cost
```

</details>

---

<details>
<summary>💬 <strong>Explain to Junior: Core Web Vitals Made Simple</strong></summary>

**The Restaurant Experience Analogy:**

Core Web Vitals measure three aspects of user experience, like visiting a restaurant:

**1. LCP (Largest Contentful Paint) = "How long until your food arrives?"**
- Good restaurant: Food arrives in 2.5 minutes
- Slow restaurant: Food arrives in 6 minutes (you leave!)

```javascript
// In website terms:
// LCP = When the main content appears on screen

// Example: News article
// ❌ Bad LCP (6s): User sees blank page for 6 seconds
// ✅ Good LCP (1.5s): Hero image + headline appear in 1.5 seconds

// Target: < 2.5 seconds
```

**2. FID (First Input Delay) = "How quickly does waiter respond when you call?"**
- Good restaurant: Waiter responds immediately (< 100ms)
- Bad restaurant: Waiter busy, takes 5 seconds to acknowledge (you're frustrated!)

```javascript
// In website terms:
// FID = Delay from user clicking button to browser responding

// Example: Click "Add to Cart"
// ❌ Bad FID (300ms): Button feels laggy, user clicks multiple times
// ✅ Good FID (50ms): Button responds instantly, feels snappy

// Target: < 100 milliseconds
```

**3. CLS (Cumulative Layout Shift) = "Does the menu keep moving while you're reading?"**
- Good menu: Text stays in place
- Bad menu: Text jumps around (super annoying!)

```javascript
// In website terms:
// CLS = Visual stability (content shouldn't jump)

// Example: Reading article
// ❌ Bad CLS (0.4): Image loads, text jumps down, you lose your place
// ✅ Good CLS (0.03): Image space reserved, text stays put

// Target: < 0.1 (lower is better)
```

**How to Measure (Simple Way):**

```javascript
// Install web-vitals library
npm install web-vitals

// Add to your app
import { onCLS, onFID, onLCP } from 'web-vitals';

// Log to console
onLCP(console.log); // "LCP: 1.8s"
onFID(console.log); // "FID: 45ms"
onCLS(console.log); // "CLS: 0.05"

// Or send to analytics
function sendToAnalytics(metric) {
  console.log(metric.name, metric.value);
  // Send to your analytics service
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
```

**Common Fixes (The "Quick Wins"):**

**Fix LCP (Slow Main Content):**
```html
<!-- ❌ Bad: No preloading, renders late -->
<img src="hero-image.jpg" alt="Hero" />

<!-- ✅ Good: Preload critical image -->
<link rel="preload" as="image" href="hero-image.webp" />
<img src="hero-image.webp" alt="Hero" width="1200" height="600" />

Why it helps:
- Browser starts loading image immediately (not waiting for HTML parse)
- Explicit dimensions prevent layout shift
- Result: LCP improves by 40%
```

**Fix FID (Laggy Interactions):**
```javascript
// ❌ Bad: Heavy work blocks main thread
function handleClick() {
  const result = processHugeDataset(); // 800ms - UI frozen!
  updateUI(result);
}

// ✅ Good: Break into chunks, yield to browser
async function handleClick() {
  updateUI('Loading...'); // Immediate feedback
  await new Promise(resolve => setTimeout(resolve, 0)); // Yield
  const result = await processInWorker(); // Offload to Web Worker
  updateUI(result);
}

Why it helps:
- User sees immediate response ("Loading...")
- Main thread free to handle interactions
- Result: FID improves from 800ms to 40ms
```

**Fix CLS (Jumpy Layout):**
```html
<!-- ❌ Bad: No dimensions, causes shift when loaded -->
<img src="photo.jpg" />

<!-- ✅ Good: Reserve space with dimensions -->
<img src="photo.jpg" width="800" height="600" />

<!-- ✅ Even better: Use aspect-ratio (modern CSS) -->
<img src="photo.jpg" style="aspect-ratio: 16/9; width: 100%;" />

Why it helps:
- Browser knows image size before loading
- Reserves exact space needed
- Text below doesn't jump when image loads
- Result: CLS drops from 0.4 to 0.02
```

**Interview Answer Template:**

**Q: "What are Core Web Vitals and how do you optimize them?"**

**Answer:**
"Core Web Vitals are Google's metrics for measuring user experience. There are three key metrics:

**LCP (Largest Contentful Paint)** measures loading performance - when the main content appears. Target is under 2.5 seconds. To optimize:
- Preload critical images: `<link rel='preload' as='image' href='hero.webp' />`
- Use CDN for fast delivery
- Optimize images (WebP format, proper compression)
- Remove render-blocking resources

**FID (First Input Delay)** measures interactivity - delay from user interaction to browser response. Target is under 100ms. To optimize:
- Code splitting to reduce initial JavaScript
- Defer non-critical scripts
- Use Web Workers for heavy computation
- Break long tasks into smaller chunks

**CLS (Cumulative Layout Shift)** measures visual stability - prevents unexpected layout shifts. Target is under 0.1. To optimize:
- Always specify image dimensions: `width` and `height` attributes
- Reserve space for dynamic content
- Use `font-display: swap` to prevent font-loading shifts
- Avoid injecting content above existing content

In practice, I use the `web-vitals` library to monitor these metrics in production:

```javascript
import { onCLS, onFID, onLCP } from 'web-vitals';

onLCP((metric) => sendToAnalytics(metric));
onFID((metric) => sendToAnalytics(metric));
onCLS((metric) => sendToAnalytics(metric));
```

For example, when we optimized our product page, preloading the hero image improved LCP from 4.2s to 1.8s, reducing bounce rate by 35%."

**Key Numbers to Remember:**
- LCP: < 2.5s (good), 2.5-4s (needs improvement), > 4s (poor)
- FID: < 100ms (good), 100-300ms (needs improvement), > 300ms (poor)
- CLS: < 0.1 (good), 0.1-0.25 (needs improvement), > 0.25 (poor)
- Optimize for P75 (75th percentile), not average

**Common Mistakes:**
1. ❌ Only testing on fast WiFi/desktop (test on 3G mobile!)
2. ❌ Measuring average instead of P75 percentile
3. ❌ Forgetting image dimensions (causes CLS)
4. ❌ Loading all JavaScript upfront (kills FID)
5. ❌ Not monitoring real user metrics (RUM)

</details>

---

## Question 2: Performance APIs

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Meta

### Question
How do you use the Performance API for monitoring?

### Answer

```javascript
// Navigation Timing API
const perfData = performance.getEntriesByType('navigation')[0];
console.log('DNS lookup:', perfData.domainLookupEnd - perfData.domainLookupStart);
console.log('TCP connection:', perfData.connectEnd - perfData.connectStart);
console.log('Time to first byte:', perfData.responseStart - perfData.requestStart);
console.log('DOM processing:', perfData.domComplete - perfData.domInteractive);

// Resource Timing API
const resources = performance.getEntriesByType('resource');
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// User Timing API (custom marks)
performance.mark('start-render');
// ... rendering code
performance.mark('end-render');
performance.measure('render-time', 'start-render', 'end-render');

const measure = performance.getEntriesByName('render-time')[0];
console.log('Render took:', measure.duration, 'ms');

// Memory usage (Chrome only)
if (performance.memory) {
  console.log('Used JS heap:', performance.memory.usedJSHeapSize / 1048576, 'MB');
  console.log('Total JS heap:', performance.memory.totalJSHeapSize / 1048576, 'MB');
}
```

### Resources
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)

---

<details>
<summary>🔍 <strong>Deep Dive: Performance API Internals</strong></summary>

**Performance API Architecture:**

```javascript
// High-resolution timing (μs precision vs ms in Date.now())
performance.now(); // 1234567.89 (μs since page load)
Date.now();        // 1234567000 (ms since epoch, lower precision)

// Difference:
const start = performance.now();
// ... operation
const end = performance.now();
console.log(`Took ${end - start}ms`); // 0.12ms precision!

// vs Date.now() - only 1ms precision
const start = Date.now();
// ... operation
const end = Date.now();
console.log(`Took ${end - start}ms`); // Always integer (0ms, 1ms, 2ms...)
```

**Navigation Timing API Deep Dive:**

```javascript
// Full page load timeline
const navTiming = performance.getEntriesByType('navigation')[0];

// Timeline breakdown:
const metrics = {
  // DNS lookup time
  dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,

  // TCP connection time
  tcp: navTiming.connectEnd - navTiming.connectStart,

  // TLS/SSL handshake (if HTTPS)
  tls: navTiming.secureConnectionStart > 0
    ? navTiming.connectEnd - navTiming.secureConnectionStart
    : 0,

  // Time to First Byte (TTFB) - Server response time
  ttfb: navTiming.responseStart - navTiming.requestStart,

  // Response download time
  download: navTiming.responseEnd - navTiming.responseStart,

  // DOM processing time
  domProcessing: navTiming.domComplete - navTiming.domInteractive,

  // DOM Interactive (DOMContentLoaded event)
  domInteractive: navTiming.domInteractive - navTiming.fetchStart,

  // Page complete (onLoad event)
  pageComplete: navTiming.loadEventEnd - navTiming.fetchStart,

  // Total page load
  totalLoad: navTiming.loadEventEnd - navTiming.fetchStart,
};

// Visual timeline:
// 0ms ────────────────────────────────────────────────────────────→ 3000ms
// │    DNS  │ TCP │TLS│  TTFB  │ Download │ DOM Processing │ Load │
// 0    50   100  120   500      800        2000            2800  3000

console.log('Metrics:', metrics);
// {
//   dns: 50,
//   tcp: 50,
//   tls: 20,
//   ttfb: 380,
//   download: 300,
//   domProcessing: 1200,
//   domInteractive: 800,
//   pageComplete: 3000,
//   totalLoad: 3000
// }
```

**Resource Timing API - Detailed Waterfall:**

```javascript
// Get all resources (images, scripts, CSS, etc.)
const resources = performance.getEntriesByType('resource');

// Analyze each resource
resources.forEach(resource => {
  const timing = {
    name: resource.name,
    type: resource.initiatorType, // 'script', 'img', 'css', 'fetch', etc.

    // Size analysis
    transferSize: resource.transferSize, // Actual bytes transferred (with compression)
    encodedBodySize: resource.encodedBodySize, // Compressed size
    decodedBodySize: resource.decodedBodySize, // Uncompressed size

    // Timing breakdown
    dns: resource.domainLookupEnd - resource.domainLookupStart,
    tcp: resource.connectEnd - resource.connectStart,
    ttfb: resource.responseStart - resource.requestStart,
    download: resource.responseEnd - resource.responseStart,
    total: resource.duration,

    // Cache status
    cached: resource.transferSize === 0, // From cache if 0 bytes transferred
    compression: resource.decodedBodySize > 0
      ? ((1 - resource.encodedBodySize / resource.decodedBodySize) * 100).toFixed(1) + '%'
      : '0%',
  };

  console.log(timing);
});

// Example output:
// {
//   name: 'https://example.com/app.js',
//   type: 'script',
//   transferSize: 0,      // From cache!
//   encodedBodySize: 245000,
//   decodedBodySize: 890000,
//   dns: 0,               // Cached DNS
//   tcp: 0,               // Reused connection
//   ttfb: 0,
//   download: 0,
//   total: 0.4,          // Just retrieval time
//   cached: true,
//   compression: '72.5%'  // Gzip compression ratio
// }
```

**User Timing API - Custom Performance Marks:**

```javascript
// Mark specific points in code execution
performance.mark('start-api-call');

const data = await fetch('/api/data');

performance.mark('end-api-call');
performance.measure('api-call-duration', 'start-api-call', 'end-api-call');

// Get measurement
const measure = performance.getEntriesByName('api-call-duration')[0];
console.log(`API call took ${measure.duration}ms`);

// Advanced: Measure component render time
function ProfiledComponent() {
  React.useEffect(() => {
    performance.mark('component-mount-start');

    return () => {
      performance.mark('component-mount-end');
      performance.measure(
        'component-mount-time',
        'component-mount-start',
        'component-mount-end'
      );
    };
  }, []);

  return <div>Content</div>;
}

// Measure multiple operations
const operations = ['operation-1', 'operation-2', 'operation-3'];
operations.forEach(op => {
  performance.mark(`${op}-start`);
  // ... do work
  performance.mark(`${op}-end`);
  performance.measure(op, `${op}-start`, `${op}-end`);
});

// Get all measurements
const measurements = performance.getEntriesByType('measure');
measurements.forEach(m => console.log(`${m.name}: ${m.duration}ms`));
```

**Performance Observer - Real-time Monitoring:**

```javascript
// Monitor specific performance entry types in real-time
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    // Different entry types have different properties
    switch (entry.entryType) {
      case 'navigation':
        console.log('Page navigation:', entry);
        break;
      case 'resource':
        console.log('Resource loaded:', entry.name, entry.duration);
        break;
      case 'mark':
        console.log('Performance mark:', entry.name);
        break;
      case 'measure':
        console.log('Performance measure:', entry.name, entry.duration);
        break;
      case 'paint':
        console.log('Paint timing:', entry.name, entry.startTime);
        break;
      case 'largest-contentful-paint':
        console.log('LCP:', entry.renderTime || entry.loadTime);
        break;
      case 'first-input':
        console.log('FID:', entry.processingStart - entry.startTime);
        break;
      case 'layout-shift':
        if (!entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
        break;
    }
  });
});

// Observe multiple types
observer.observe({
  entryTypes: ['navigation', 'resource', 'measure', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
});

// Or observe specific types
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.renderTime);
});
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
```

**Memory Profiling (Chrome-specific):**

```javascript
// Memory usage tracking
if (performance.memory) {
  const memoryInfo = {
    // Used memory in MB
    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),

    // Total allocated heap in MB
    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),

    // Maximum heap size in MB
    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2),

    // Usage percentage
    usage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) + '%',
  };

  console.log('Memory:', memoryInfo);
  // { used: '42.5', total: '58.3', limit: '2048.0', usage: '2.1%' }

  // Monitor for memory leaks
  setInterval(() => {
    const currentUsage = performance.memory.usedJSHeapSize;
    console.log(`Memory: ${(currentUsage / 1048576).toFixed(2)} MB`);

    if (currentUsage > performance.memory.jsHeapSizeLimit * 0.9) {
      console.warn('⚠️ High memory usage! Possible memory leak');
    }
  }, 5000);
}
```

**Long Task API - Detecting Main Thread Blocking:**

```javascript
// Detect long tasks (> 50ms) that block main thread
const longTaskObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.warn(`Long task detected: ${entry.duration}ms`);
    console.log('Attribution:', entry.attribution);

    // Send alert if task is very long
    if (entry.duration > 200) {
      console.error('⚠️ Very long task blocking main thread!');
      sendToAnalytics({
        type: 'long-task',
        duration: entry.duration,
        name: entry.name,
      });
    }
  });
});

longTaskObserver.observe({ type: 'longtask', buffered: true });

// Example output:
// Long task detected: 340ms
// Attribution: { name: 'script', entryType: 'taskattribution', ... }
```

**Complete Performance Monitoring System:**

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.setupObservers();
  }

  setupObservers() {
    // Navigation timing
    if (performance.getEntriesByType('navigation').length > 0) {
      this.collectNavigationMetrics();
    }

    // Resource timing
    this.observeResources();

    // Core Web Vitals
    this.observeCoreWebVitals();

    // Long tasks
    this.observeLongTasks();
  }

  collectNavigationMetrics() {
    const nav = performance.getEntriesByType('navigation')[0];
    this.metrics.navigation = {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domInteractive: nav.domInteractive - nav.fetchStart,
      domComplete: nav.domComplete - nav.fetchStart,
      loadComplete: nav.loadEventEnd - nav.fetchStart,
    };
  }

  observeResources() {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Track slow resources
        if (entry.duration > 1000) {
          console.warn(`Slow resource: ${entry.name} (${entry.duration}ms)`);
        }
      });
    });
    resourceObserver.observe({ type: 'resource', buffered: true });
  }

  observeCoreWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      this.metrics.fid = firstInput.processingStart - firstInput.startTime;
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
  }

  observeLongTasks() {
    new PerformanceObserver((list) => {
      this.metrics.longTasks = this.metrics.longTasks || [];
      list.getEntries().forEach((entry) => {
        this.metrics.longTasks.push({
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    }).observe({ type: 'longtask', buffered: true });
  }

  report() {
    console.log('Performance Report:', this.metrics);
    return this.metrics;
  }
}

// Usage
const monitor = new PerformanceMonitor();

window.addEventListener('load', () => {
  setTimeout(() => {
    const report = monitor.report();
    sendToAnalytics(report);
  }, 0);
});
```

</details>

---

<details>
<summary>🐛 <strong>Real-World Scenario: Debugging Slow API Responses</strong></summary>

**Problem:**
SaaS application experiencing intermittent slow API responses:
- P50: 280ms (acceptable)
- P95: 4,200ms (unacceptable!)
- P99: 12,800ms (users complaining)
- No clear pattern in server logs
- Users report "random freezes"

**Investigation with Performance API:**

```javascript
// Step 1: Instrument all API calls with User Timing API
async function fetchWithTiming(url, options) {
  const markName = `fetch-${url}-${Date.now()}`;

  performance.mark(`${markName}-start`);

  try {
    const response = await fetch(url, options);

    performance.mark(`${markName}-end`);
    performance.measure(markName, `${markName}-start`, `${markName}-end`);

    const measure = performance.getEntriesByName(markName)[0];

    // Log slow requests
    if (measure.duration > 1000) {
      console.warn(`Slow API call: ${url} took ${measure.duration}ms`);

      // Get detailed resource timing
      const resourceEntry = performance.getEntriesByName(url)[0];
      if (resourceEntry) {
        console.log('Resource timing:', {
          dns: resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart,
          tcp: resourceEntry.connectEnd - resourceEntry.connectStart,
          ttfb: resourceEntry.responseStart - resourceEntry.requestStart,
          download: resourceEntry.responseEnd - resourceEntry.responseStart,
          total: resourceEntry.duration,
        });
      }
    }

    return response;
  } catch (error) {
    performance.mark(`${markName}-error`);
    throw error;
  }
}

// Step 2: Collect all API call timings
const apiTimings = [];

const resourceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
      apiTimings.push({
        url: entry.name,
        duration: entry.duration,
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart,
        cached: entry.transferSize === 0,
        timestamp: entry.startTime,
      });
    }
  });
});

resourceObserver.observe({ type: 'resource', buffered: true });

// Step 3: Analyze patterns after 5 minutes
setTimeout(() => {
  const analysis = analyzeAPITimings(apiTimings);
  console.log('API Timing Analysis:', analysis);
  sendToAnalytics(analysis);
}, 300000);

function analyzeAPITimings(timings) {
  // Calculate percentiles
  const durations = timings.map(t => t.duration).sort((a, b) => a - b);

  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];

  // Find slow requests
  const slowRequests = timings.filter(t => t.duration > 2000);

  // Analyze bottlenecks
  const bottlenecks = slowRequests.map(req => {
    const breakdown = {
      dns: ((req.dns / req.duration) * 100).toFixed(1) + '%',
      tcp: ((req.tcp / req.duration) * 100).toFixed(1) + '%',
      ttfb: ((req.ttfb / req.duration) * 100).toFixed(1) + '%',
      download: ((req.download / req.duration) * 100).toFixed(1) + '%',
    };

    // Find primary bottleneck
    const max = Math.max(req.dns, req.tcp, req.ttfb, req.download);
    let primaryBottleneck;
    if (max === req.dns) primaryBottleneck = 'DNS';
    else if (max === req.tcp) primaryBottleneck = 'TCP';
    else if (max === req.ttfb) primaryBottleneck = 'TTFB (Server)';
    else primaryBottleneck = 'Download';

    return {
      url: req.url,
      duration: req.duration,
      breakdown,
      primaryBottleneck,
    };
  });

  return {
    totalRequests: timings.length,
    p50,
    p95,
    p99,
    slowRequests: slowRequests.length,
    bottlenecks,
  };
}
```

**Results:**

```javascript
// API Timing Analysis:
{
  totalRequests: 847,
  p50: 285,
  p95: 4180,
  p99: 12400,
  slowRequests: 42,
  bottlenecks: [
    {
      url: '/api/dashboard/widgets',
      duration: 4200,
      breakdown: { dns: '0.2%', tcp: '0.5%', ttfb: '94.3%', download: '5.0%' },
      primaryBottleneck: 'TTFB (Server)' // ← Server processing slow!
    },
    {
      url: '/api/analytics/report',
      duration: 12800,
      breakdown: { dns: '8.2%', tcp: '2.1%', ttfb: '85.7%', download: '4.0%' },
      primaryBottleneck: 'TTFB (Server)' // ← Another server issue
    },
    // Pattern: All slow requests have high TTFB = server processing issue
  ]
}
```

**Root Cause Found:**

Server team investigates and finds:
- Database query not using index (sequential scan on 10M rows)
- Query takes 4-12 seconds under load
- Only affects users with large datasets

**Solution:**

```javascript
// Client-side: Add loading states and caching
import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: fetchDashboardWidgets,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000,

    // Retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Monitor slow requests
  React.useEffect(() => {
    performance.mark('dashboard-render-start');

    return () => {
      performance.mark('dashboard-render-end');
      performance.measure(
        'dashboard-render',
        'dashboard-render-start',
        'dashboard-render-end'
      );

      const measure = performance.getEntriesByName('dashboard-render')[0];
      if (measure.duration > 3000) {
        console.warn(`Slow dashboard render: ${measure.duration}ms`);
        sendToAnalytics({
          type: 'slow-render',
          component: 'dashboard',
          duration: measure.duration,
        });
      }
    };
  }, [data]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;

  return <DashboardContent data={data} />;
}

// Server-side: Add index + pagination
// Database migration:
CREATE INDEX idx_widgets_user_created ON widgets(user_id, created_at);

// API endpoint optimization:
// Before: SELECT * FROM widgets WHERE user_id = ? (scans 10M rows)
// After: SELECT * FROM widgets WHERE user_id = ? ORDER BY created_at LIMIT 50 (uses index)
```

**Results After Fix:**

```
Metric                Before    After     Improvement
─────────────────────────────────────────────────────
P50 API response      285ms     180ms     -37%
P95 API response      4,180ms   420ms     -90%
P99 API response      12,800ms  680ms     -95%
TTFB (slow queries)   4-12s     0.2-0.4s  -96%
Customer complaints   24/week   1/week    -96%
```

**Monitoring Dashboard:**

```javascript
// Continuous API monitoring
class APIPerformanceMonitor {
  constructor() {
    this.apiCalls = [];
    this.setupMonitoring();
  }

  setupMonitoring() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'fetch') {
          this.apiCalls.push({
            url: entry.name,
            duration: entry.duration,
            ttfb: entry.responseStart - entry.requestStart,
            timestamp: Date.now(),
          });

          // Alert on slow API call
          if (entry.duration > 2000) {
            this.alertSlowAPI(entry);
          }
        }
      });
    });

    observer.observe({ type: 'resource', buffered: true });

    // Report every 60 seconds
    setInterval(() => this.reportMetrics(), 60000);
  }

  alertSlowAPI(entry) {
    const ttfb = entry.responseStart - entry.requestStart;
    console.warn(`⚠️ Slow API detected:
      URL: ${entry.name}
      Duration: ${entry.duration}ms
      TTFB: ${ttfb}ms
      ${ttfb / entry.duration > 0.8 ? '→ Server bottleneck' : '→ Network/download bottleneck'}
    `);

    sendToSentry({
      type: 'slow-api',
      url: entry.name,
      duration: entry.duration,
      ttfb,
    });
  }

  reportMetrics() {
    const recentCalls = this.apiCalls.filter(
      call => Date.now() - call.timestamp < 60000
    );

    if (recentCalls.length === 0) return;

    const durations = recentCalls.map(c => c.duration).sort((a, b) => a - b);
    const p95 = durations[Math.floor(durations.length * 0.95)];

    console.log(`API Performance (last 60s):
      Calls: ${recentCalls.length}
      P95: ${p95}ms
    `);

    if (p95 > 1000) {
      console.warn('⚠️ High P95 latency detected');
    }
  }
}

new APIPerformanceMonitor();
```

</details>

---

<details>
<summary>⚖️ <strong>Trade-offs: Performance Monitoring Strategies</strong></summary>

**1. Monitoring Granularity:**

| Level | Overhead | Insights | Cost | Use Case |
|-------|----------|----------|------|----------|
| **Basic (Navigation Timing only)** | Minimal (< 0.1ms) | Page load metrics | Free | Simple websites |
| **Medium (+ Resource Timing)** | Low (< 1ms) | All resource loads | Free | Most apps |
| **High (+ User Timing)** | Medium (1-5ms) | Custom metrics | Free | Performance-critical apps |
| **Comprehensive (+ Observers)** | High (5-10ms) | Real-time monitoring | $ (analytics) | Enterprise apps |

**Decision Matrix:**

```javascript
function chooseMonitoringLevel(appType, traffic) {
  if (appType === 'static-site') {
    return 'basic'; // Navigation Timing sufficient
  }

  if (traffic < 100000) {
    return 'medium'; // Resource Timing for all requests
  }

  if (traffic > 1000000) {
    return {
      level: 'comprehensive',
      sampling: 0.1, // 10% sampling to reduce overhead
    };
  }

  return 'high'; // Full User Timing + custom marks
}
```

**2. Custom Metrics vs Built-in Metrics:**

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Built-in only (LCP, FID, CLS)** | Standard, comparable, free | Limited to page load | Basic monitoring |
| **Custom User Timing** | Flexible, application-specific | Manual instrumentation | Measure specific features |
| **Hybrid** | Best of both | More complex | Production apps |

**Example:**

```javascript
// Built-in: Good for general page load
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP(console.log);  // ← Standardized, easy to compare
onFID(console.log);
onCLS(console.log);

// Custom: Good for app-specific workflows
performance.mark('checkout-flow-start');
// ... user goes through checkout
performance.mark('checkout-flow-end');
performance.measure('checkout-flow', 'checkout-flow-start', 'checkout-flow-end');

// ← Measures what matters for YOUR business
// Can track: checkout time, form completion, video load, etc.

// Trade-off: Built-in is easy, custom is more useful for optimization
```

**3. Real-time Monitoring vs Batch Reporting:**

| Approach | Latency | Accuracy | Network Cost | Use Case |
|----------|---------|----------|--------------|----------|
| **Real-time (immediate send)** | Instant | 100% | High (many requests) | Critical systems |
| **Batch (send every 60s)** | 60s delay | 100% | Medium | Most apps |
| **On page unload** | Variable | 90% (some loss) | Low | Non-critical metrics |
| **Sampled (10%)** | Instant/batched | 90% | Very low | High traffic sites |

**Implementation:**

```javascript
// Option A: Real-time (high network cost)
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    fetch('/analytics', {
      method: 'POST',
      body: JSON.stringify(entry), // ← Sends immediately (expensive!)
    });
  });
});

// Option B: Batched (balance)
const metricsBuffer = [];

const observer = new PerformanceObserver((list) => {
  metricsBuffer.push(...list.getEntries());
});

setInterval(() => {
  if (metricsBuffer.length > 0) {
    navigator.sendBeacon('/analytics', JSON.stringify(metricsBuffer));
    metricsBuffer.length = 0; // ← Sends every 60s (efficient!)
  }
}, 60000);

// Option C: On unload (lowest cost)
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/analytics', JSON.stringify(metricsBuffer));
  // ← Sends once per session (cheapest, but may lose data)
});

// Trade-off: Real-time = instant insights, high cost
//            Batched = good balance
//            Unload = cheap, may lose data if user force-closes tab
```

**4. Client-side vs Server-side Monitoring:**

| Location | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Client (Performance API)** | Real user experience, device/network variability | Can't measure server internals | Frontend performance |
| **Server (APM tools)** | Deep server insights, database queries | Doesn't capture client rendering | Backend performance |
| **Hybrid (both)** | Complete picture | Complex setup, higher cost | Enterprise apps |

**Example scenario:**

```javascript
// Slow page load: Is it frontend or backend?

// Client-side monitoring shows:
TTFB: 2,400ms (slow!) → Server issue
DOM Processing: 180ms (fast) → Frontend OK
Conclusion: Backend optimization needed

// Server-side monitoring confirms:
Database query: 2,200ms → Add index
API processing: 150ms → OK

// Without hybrid monitoring, you'd waste time optimizing frontend!
```

**5. Memory Profiling Trade-offs:**

| Technique | Overhead | Accuracy | Browser Support | Use Case |
|-----------|----------|----------|-----------------|----------|
| **performance.memory** | Minimal | Approximate | Chrome only | Basic leak detection |
| **Chrome DevTools Heap Snapshot** | High (pause execution) | Exact | Chrome | Development debugging |
| **Continuous monitoring** | Medium | Good | Chrome | Production leak alerts |

**Implementation:**

```javascript
// Option A: Lightweight monitoring (production)
if (performance.memory) {
  setInterval(() => {
    const usedMB = performance.memory.usedJSHeapSize / 1048576;

    if (usedMB > 100) {
      console.warn(`High memory usage: ${usedMB}MB`);
      // Alert team
    }
  }, 60000);
}
// Overhead: ~0.1ms every 60s (negligible)

// Option B: Detailed profiling (development)
// Manual: Chrome DevTools → Memory → Take Heap Snapshot
// Overhead: Pauses execution for 1-5 seconds
// Use only in development!

// Trade-off: Lightweight = safe for production, approximate
//            Detailed = development only, exact leak source
```

**6. Performance Budget Enforcement:**

| Strategy | Enforcement | Feedback Speed | Blocking | Use Case |
|----------|-------------|----------------|----------|----------|
| **CI/CD Lighthouse** | Pre-merge | Fast (minutes) | Yes | Prevent regressions |
| **RUM alerts** | Post-deploy | Slow (hours/days) | No | Detect production issues |
| **Webpack bundle analyzer** | Build-time | Instant | Yes | Control bundle size |

**Implementation:**

```javascript
// CI/CD: Block merge if performance regresses
// .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm run build
    lhci autorun --config=.lighthouserc.json

// .lighthouserc.json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}

// Result: PR blocked if LCP > 2.5s
// Trade-off: Slows down CI/CD by 2-3 minutes, but prevents regressions
```

</details>

---

<details>
<summary>💬 <strong>Explain to Junior: Performance API Made Simple</strong></summary>

**The Stopwatch Analogy:**

Think of the Performance API as a super-accurate stopwatch built into your browser that can measure everything happening on your website.

**Basic Concept:**

```javascript
// Regular stopwatch (Date.now)
const start = Date.now();
// ... do something
const end = Date.now();
console.log(`Took ${end - start}ms`); // Only 1ms accuracy (rounded)

// Super stopwatch (performance.now)
const start = performance.now();
// ... do something
const end = performance.now();
console.log(`Took ${end - start}ms`); // 0.001ms accuracy (precise!)

// Example:
// Date.now(): 0ms, 1ms, 2ms (always whole numbers)
// performance.now(): 0.123ms, 1.456ms, 2.789ms (super precise!)
```

**Three Main Uses:**

**1. Measure Page Load (Navigation Timing):**

```javascript
// How long did the page take to load?
const pageLoad = performance.getEntriesByType('navigation')[0];

const timing = {
  // How long did DNS lookup take?
  dns: pageLoad.domainLookupEnd - pageLoad.domainLookupStart,

  // How long did server take to respond?
  serverResponse: pageLoad.responseStart - pageLoad.requestStart,

  // How long did page take to fully load?
  totalLoad: pageLoad.loadEventEnd - pageLoad.fetchStart,
};

console.log(timing);
// { dns: 45ms, serverResponse: 280ms, totalLoad: 2140ms }

// Think of it as a recipe timer:
// - DNS: Finding the restaurant (45ms)
// - Server response: Placing order (280ms)
// - Total load: Getting your food (2140ms)
```

**2. Measure Individual Resources (Resource Timing):**

```javascript
// How long did each image/script/CSS take to load?
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);

  // Was it from cache?
  if (resource.transferSize === 0) {
    console.log('  → From cache (instant!)');
  } else {
    console.log(`  → Downloaded ${resource.transferSize} bytes`);
  }
});

// Example output:
// /app.js: 450ms
//   → Downloaded 245000 bytes
// /logo.png: 0.2ms
//   → From cache (instant!)
```

**3. Measure Custom Code (User Timing):**

```javascript
// Measure YOUR specific code

// Start timer
performance.mark('fetch-data-start');

// ... fetch data from API
const data = await fetch('/api/data');

// Stop timer
performance.mark('fetch-data-end');

// Calculate duration
performance.measure('fetch-data', 'fetch-data-start', 'fetch-data-end');

// Get result
const duration = performance.getEntriesByName('fetch-data')[0].duration;
console.log(`Fetching data took ${duration}ms`);

// Like using a stopwatch for a race:
// Mark "start" → runner starts
// Mark "end" → runner finishes
// Measure → calculate time
```

**Real-World Example: Measuring Form Submission:**

```javascript
async function handleFormSubmit(event) {
  event.preventDefault();

  // Start measuring
  performance.mark('form-submit-start');

  try {
    // Submit form
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData,
    });

    performance.mark('form-submit-end');
    performance.measure('form-submit', 'form-submit-start', 'form-submit-end');

    const measure = performance.getEntriesByName('form-submit')[0];

    // Log slow submissions
    if (measure.duration > 2000) {
      console.warn(`⚠️ Slow form submission: ${measure.duration}ms`);
      // Alert team about slow API
    } else {
      console.log(`✅ Form submitted in ${measure.duration}ms`);
    }

  } catch (error) {
    console.error('Form submission failed:', error);
  }
}
```

**Performance Observer (Real-time Monitoring):**

```javascript
// Instead of checking timings manually, get notified automatically!

// Old way (manual checking):
setInterval(() => {
  const resources = performance.getEntriesByType('resource');
  // Check resources...
}, 1000);

// New way (automatic notifications):
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`Resource loaded: ${entry.name} (${entry.duration}ms)`);
  });
});

observer.observe({ type: 'resource' });

// Now you're automatically notified when ANY resource loads!
// Like setting an alarm instead of constantly checking the clock
```

**Interview Answer Template:**

**Q: "How do you use the Performance API to monitor application performance?"**

**Answer:**
"The Performance API provides high-resolution timing for measuring web performance. I use three main features:

**Navigation Timing** to measure page load:
```javascript
const nav = performance.getEntriesByType('navigation')[0];
const ttfb = nav.responseStart - nav.requestStart; // Time to First Byte
const pageLoad = nav.loadEventEnd - nav.fetchStart; // Total page load
```

**Resource Timing** to track individual resources:
```javascript
const resources = performance.getEntriesByType('resource');
resources.forEach(r => {
  if (r.duration > 1000) {
    console.warn(`Slow resource: ${r.name} (${r.duration}ms)`);
  }
});
```

**User Timing** for custom measurements:
```javascript
performance.mark('api-call-start');
await fetchData();
performance.mark('api-call-end');
performance.measure('api-call', 'api-call-start', 'api-call-end');

const duration = performance.getEntriesByName('api-call')[0].duration;
```

I also use Performance Observer for real-time monitoring:
```javascript
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.duration > 2000) {
      sendToAnalytics({ type: 'slow-request', ...entry });
    }
  });
}).observe({ type: 'resource' });
```

For example, we used this to identify that our dashboard API was taking 4+ seconds for users with large datasets. The Resource Timing breakdown showed 94% of time was TTFB (server processing), which led us to optimize the database query, reducing response time from 4.2s to 0.4s."

**Key Points to Remember:**
- performance.now() is more accurate than Date.now()
- Navigation Timing = page load metrics
- Resource Timing = individual resource loads
- User Timing = custom code measurements
- Performance Observer = real-time notifications
- transferSize === 0 means resource was cached

**Common Use Cases:**
1. Measure API response times
2. Track slow resource loads
3. Monitor page load performance
4. Detect performance regressions
5. Find bottlenecks (DNS, server, download)

</details>

---

## Question 3: React Profiler

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Meta, Vercel

### Question
How do you profile React applications?

### Answer

**React DevTools Profiler:**

1. Open React DevTools → Profiler tab
2. Click record, interact with app, stop recording
3. Analyze:
   - Flame graph (component render times)
   - Ranked chart (slowest components)
   - Component chart (why component rendered)

**Programmatic profiling:**

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id, // component id
  phase, // "mount" or "update"
  actualDuration, // time to render
  baseDuration, // estimated time without memoization
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

**Chrome DevTools Performance:**
- Record → Interact → Stop
- Analyze: Main thread activity, JS execution, rendering

### Resources
- [React Profiler](https://react.dev/reference/react/Profiler)

---

<details>
<summary>🔍 <strong>Deep Dive: React Profiler Internals</strong></summary>

**How React Profiler Works:**

```javascript
// React Profiler measures component render times using Fiber architecture

// Basic Profiler usage
import { Profiler } from 'react';

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}

// onRender callback signature
function onRenderCallback(
  id,                   // "App" - Profiler id
  phase,                // "mount" or "update"
  actualDuration,       // Time to render this update (ms)
  baseDuration,         // Estimated time without memoization (ms)
  startTime,            // When React started rendering
  commitTime,           // When React committed changes
  interactions          // Set of interactions (deprecated in React 18)
) {
  console.log(`${id} (${phase}):`, {
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
}

// Example output:
// App (mount): { actualDuration: 45.2, baseDuration: 52.8, startTime: 1234.5, commitTime: 1279.7 }
// App (update): { actualDuration: 12.3, baseDuration: 15.6, startTime: 2345.6, commitTime: 2357.9 }
```

**Profiler Metrics Explained:**

```javascript
// Understanding the metrics

// actualDuration: Time spent rendering this commit
// - Includes: Component logic, child renders, hooks, effects
// - Lower is better
const actualDuration = 45.2; // ms

// baseDuration: Estimated time if nothing was memoized
// - Theoretical worst case without React.memo, useMemo, etc.
// - Used to calculate optimization benefit
const baseDuration = 52.8; // ms

// optimization benefit
const saved = baseDuration - actualDuration; // 7.6ms
const improvement = (saved / baseDuration * 100).toFixed(1); // 14.4% faster

// phase: "mount" or "update"
// - mount: First render (component added to DOM)
// - update: Re-render (props/state changed)

// Real-world profiling
function DetailedProfiler({ id, children }) {
  return (
    <Profiler
      id={id}
      onRender={(id, phase, actualDuration, baseDuration) => {
        // Track performance
        const metrics = {
          id,
          phase,
          actualDuration,
          baseDuration,
          saved: baseDuration - actualDuration,
          timestamp: Date.now(),
        };

        // Alert on slow renders
        if (actualDuration > 16) { // 60fps = 16ms per frame
          console.warn(`⚠️ Slow render detected:`, metrics);
          sendToAnalytics({ type: 'slow-render', ...metrics });
        }

        // Log all renders in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Profiler] ${id}:`, metrics);
        }
      }}
    >
      {children}
    </Profiler>
  );
}
```

**Nested Profilers for Component Trees:**

```javascript
// Profile different parts of your app separately

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <Profiler id="ProductList" onRender={onRenderCallback}>
          <ProductList />
        </Profiler>
        <Profiler id="Cart" onRender={onRenderCallback}>
          <Cart />
        </Profiler>
      </Profiler>
      <Footer />
    </Profiler>
  );
}

// Output shows nested render times:
// App (update): 42.5ms
//   └─ MainContent (update): 38.2ms
//       ├─ ProductList (update): 24.1ms (slowest!)
//       └─ Cart (update): 3.8ms
//
// Conclusion: ProductList is the bottleneck
```

**Chrome DevTools React Profiler:**

```javascript
// React DevTools provides visual profiling (better than code-based)

// How to use:
// 1. Install React DevTools extension
// 2. Open DevTools → Profiler tab
// 3. Click "Record" (🔴)
// 4. Interact with app
// 5. Click "Stop" (⏹️)

// Features:
// - Flame graph: Visual render tree with times
// - Ranked chart: Slowest components sorted
// - Component chart: Why component rendered
// - Commits: Each state update shown separately

// Example analysis:
// ┌─────────────────────────────────────┐
// │ Flame Graph                         │
// ├─────────────────────────────────────┤
// │ App ─────────────────── 45.2ms      │
// │   Dashboard ─────────── 38.1ms      │
// │     ProductList ─────── 24.5ms ⚠️   │
// │       ProductCard ──── 2.1ms × 12   │
// │     Cart ─────────────── 3.2ms      │
// └─────────────────────────────────────┘

// Why it rendered:
// ProductList:
//   ✓ Props changed: { products: [... new array] }
//   ✗ State changed: No
//   ℹ️ Rendered 12 ProductCard children
```

**Advanced: Profiler with Analytics:**

```javascript
// Production-safe profiling with sampling

class PerformanceMonitor {
  constructor(sampleRate = 0.1) {
    this.sampleRate = sampleRate; // 10% of renders
    this.samples = [];
  }

  onRender = (id, phase, actualDuration, baseDuration) => {
    // Sample only X% of renders to reduce overhead
    if (Math.random() > this.sampleRate) return;

    const metric = {
      id,
      phase,
      actualDuration,
      baseDuration,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.samples.push(metric);

    // Send to analytics if buffer full
    if (this.samples.length >= 50) {
      this.flush();
    }

    // Alert on extremely slow renders
    if (actualDuration > 100) {
      this.alertSlowRender(metric);
    }
  };

  flush() {
    if (this.samples.length === 0) return;

    navigator.sendBeacon(
      '/analytics/render-times',
      JSON.stringify(this.samples)
    );

    this.samples = [];
  }

  alertSlowRender(metric) {
    console.error('🐌 Very slow render:', metric);
    // Send immediate alert
    fetch('/analytics/slow-render', {
      method: 'POST',
      body: JSON.stringify(metric),
      keepalive: true,
    });
  }

  analyze() {
    // Calculate percentiles
    const durations = this.samples
      .map(s => s.actualDuration)
      .sort((a, b) => a - b);

    return {
      count: durations.length,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    };
  }
}

// Usage
const monitor = new PerformanceMonitor(0.1); // 10% sampling

function App() {
  return (
    <Profiler id="App" onRender={monitor.onRender}>
      <Dashboard />
    </Profiler>
  );
}

// Send metrics on page unload
window.addEventListener('beforeunload', () => {
  monitor.flush();
});

// Periodically analyze
setInterval(() => {
  console.log('Render performance:', monitor.analyze());
}, 60000);
```

**React Concurrent Features Impact:**

```javascript
// React 18 Concurrent Mode affects profiling

import { startTransition, useDeferredValue } from 'react';

function SearchResults({ query }) {
  // useDeferredValue = lower priority render
  const deferredQuery = useDeferredValue(query);

  return (
    <Profiler id="SearchResults" onRender={(id, phase, actualDuration) => {
      console.log(`Search render: ${actualDuration}ms`);
      // With useDeferredValue, this render can be interrupted
      // actualDuration may be split across multiple paints
    }}>
      <Results query={deferredQuery} />
    </Profiler>
  );
}

// startTransition = non-urgent update
function handleChange(value) {
  setInputValue(value); // Urgent (immediate)

  startTransition(() => {
    setSearchQuery(value); // Non-urgent (can be interrupted)
  });

  // Profiler shows:
  // - Input update: 2ms (fast, high priority)
  // - Search update: 45ms (slower, low priority, interruptible)
}
```

**Profiler Performance Overhead:**

```javascript
// Profiler adds ~1-2ms overhead per commit

// Without Profiler:
// Render time: 10ms

// With Profiler:
// Render time: 11-12ms (10-20% overhead)

// Recommendation:
// - Use in development: Always
// - Use in production: Only with sampling (1-10%)

// Production-safe approach:
const ProfilerWrapper = process.env.NODE_ENV === 'development'
  ? Profiler
  : React.Fragment; // No profiling in production

function App() {
  return (
    <ProfilerWrapper id="App" onRender={onRenderCallback}>
      <Dashboard />
    </ProfilerWrapper>
  );
}
```

</details>

---

<details>
<summary>🐛 <strong>Real-World Scenario: Debugging Dashboard Re-render Storm</strong></summary>

**Problem:**
Admin dashboard experiencing performance issues:
- UI freezes when filtering data (3-5 second delays)
- CPU usage spikes to 100% during interactions
- Users report "app becomes unusable after filtering"
- No clear performance issues in production monitoring

**Investigation with React Profiler:**

```javascript
// Step 1: Add Profiler to identify hot spots

import { Profiler } from 'react';

function Dashboard() {
  return (
    <Profiler id="Dashboard" onRender={logRenderMetrics}>
      <Filters />
      <DataTable />
      <Charts />
    </Profiler>
  );
}

function logRenderMetrics(id, phase, actualDuration, baseDuration) {
  console.log(`[${id}] ${phase}:`, {
    duration: actualDuration,
    baseline: baseDuration,
    timestamp: new Date().toISOString(),
  });
}

// Initial interaction: Apply filter
// Console output:
// [Dashboard] update: { duration: 3245.8, baseline: 3401.2, timestamp: ... }
// ⚠️ 3.2 seconds to render! Way too slow
```

**Step 2: Use Chrome DevTools Profiler for detailed analysis:**

```javascript
// Chrome DevTools → Profiler → Record → Apply filter → Stop

// Flame graph shows:
// Dashboard ────────────────────────── 3245ms
//   Filters ─────────────── 12ms
//   DataTable ──────────────────────── 2980ms ⚠️ (92% of time!)
//     TableRow ──── 5.2ms × 500 rows = 2600ms
//   Charts ──────────────── 253ms

// Ranked view (slowest first):
// 1. DataTable: 2980ms
// 2. Charts: 253ms
// 3. Filters: 12ms

// Component chart shows why DataTable re-rendered:
// ✓ Props changed: { data: [... new filtered array] }
// ✓ State changed: No
// ℹ️ All 500 rows re-rendered (not virtualized!)
```

**Root Causes Found:**

```javascript
// Problem 1: DataTable renders all 500 rows on every filter
function DataTable({ data }) {
  return (
    <table>
      {data.map(row => (
        <TableRow key={row.id} data={row} /> // ← 500 rows × 5ms = 2500ms!
      ))}
    </table>
  );
}

// Problem 2: TableRow not memoized, re-renders even if data unchanged
function TableRow({ data }) {
  // Heavy computation on every render
  const formattedData = formatCellData(data); // 3ms per row
  return <tr>{formattedData}</tr>;
}

// Problem 3: Charts recalculate on every render
function Charts({ data }) {
  const chartData = processChartData(data); // 200ms processing!
  return <ChartComponent data={chartData} />;
}
```

**Solution Implementation:**

```javascript
// Fix 1: Add virtualization to DataTable

import { useVirtualizer } from '@tanstack/react-virtual';

function DataTable({ data }) {
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Row height
    overscan: 5, // Render 5 extra rows outside viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const row = data[virtualRow.index];
          return (
            <TableRow
              key={row.id}
              data={row}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Fix 2: Memoize TableRow

const TableRow = React.memo(function TableRow({ data, style }) {
  // useMemo for expensive computation
  const formattedData = React.useMemo(() => {
    return formatCellData(data);
  }, [data]);

  return <tr style={style}>{formattedData}</tr>;
});

// Fix 3: Memoize chart processing

function Charts({ data }) {
  const chartData = React.useMemo(() => {
    console.log('Processing chart data...');
    return processChartData(data);
  }, [data]);

  return <ChartComponent data={chartData} />;
}

// Fix 4: Add detailed profiling to monitor improvements

function ProfiledDashboard() {
  const [renderMetrics, setRenderMetrics] = React.useState([]);

  const onRender = React.useCallback((id, phase, actualDuration) => {
    const metric = {
      id,
      phase,
      duration: actualDuration,
      timestamp: Date.now(),
    };

    setRenderMetrics(prev => [...prev.slice(-10), metric]); // Keep last 10

    // Alert on slow renders
    if (actualDuration > 16) {
      console.warn(`⚠️ Slow render: ${id} took ${actualDuration}ms`);
    }
  }, []);

  return (
    <>
      <Profiler id="Dashboard" onRender={onRender}>
        <Dashboard />
      </Profiler>

      {/* Dev-only metrics panel */}
      {process.env.NODE_ENV === 'development' && (
        <MetricsPanel metrics={renderMetrics} />
      )}
    </>
  );
}

function MetricsPanel({ metrics }) {
  const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  const maxDuration = Math.max(...metrics.map(m => m.duration));

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#222', color: '#fff', padding: '10px' }}>
      <h4>Render Metrics</h4>
      <div>Avg: {avgDuration.toFixed(1)}ms</div>
      <div>Max: {maxDuration.toFixed(1)}ms</div>
      <div>Last 10 renders:</div>
      <ul>
        {metrics.map((m, i) => (
          <li key={i} style={{ color: m.duration > 16 ? 'red' : 'green' }}>
            {m.duration.toFixed(1)}ms
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Results After Optimization:**

```
Metric                     Before    After     Improvement
──────────────────────────────────────────────────────────
Filter interaction time    3,245ms   45ms      -99%
DataTable render time      2,980ms   28ms      -99%
Rows rendered (viewport)   500       ~20       -96%
Charts processing          Every render  Once (memoized)  ✓
CPU usage on filter        100%      12%       -88%
User satisfaction         "Unusable" "Snappy"   ✓

// Chrome DevTools Profiler after optimization:
// Dashboard ──────────── 45ms
//   Filters ─────────── 12ms
//   DataTable ───────── 28ms ✓ (only 20 visible rows)
//   Charts ──────────── 5ms  ✓ (memoized, no recalculation)
```

**Continuous Monitoring:**

```javascript
// Production monitoring with sampling

class DashboardPerformanceMonitor {
  constructor() {
    this.samples = [];
    this.slowRenders = [];
  }

  onRender = (id, phase, actualDuration) => {
    // Sample 10% of renders
    if (Math.random() < 0.1) {
      this.samples.push({
        id,
        phase,
        duration: actualDuration,
        timestamp: Date.now(),
      });
    }

    // Always track slow renders
    if (actualDuration > 100) {
      this.slowRenders.push({
        id,
        duration: actualDuration,
        timestamp: Date.now(),
        stack: new Error().stack,
      });

      // Alert immediately
      fetch('/api/analytics/slow-render', {
        method: 'POST',
        body: JSON.stringify({
          component: id,
          duration: actualDuration,
          url: window.location.href,
        }),
        keepalive: true,
      });
    }
  };

  report() {
    const durations = this.samples.map(s => s.duration).sort((a, b) => a - b);

    return {
      samples: this.samples.length,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      slowRenders: this.slowRenders.length,
      slowestRender: Math.max(...durations),
    };
  }
}

const monitor = new DashboardPerformanceMonitor();

function App() {
  React.useEffect(() => {
    // Report metrics every 5 minutes
    const interval = setInterval(() => {
      const report = monitor.report();
      console.log('Performance report:', report);
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify(report));
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Profiler id="App" onRender={monitor.onRender}>
      <Dashboard />
    </Profiler>
  );
}
```

**Key Learnings:**

1. **Virtualization is critical** for large lists (500 rows → 20 visible)
2. **React.memo prevents unnecessary re-renders** of child components
3. **useMemo** caches expensive computations
4. **Profiler overhead is ~10-20%** (use sampling in production)
5. **Chrome DevTools Profiler** > programmatic Profiler (better visualization)
6. **Monitor P95, not average** (outliers matter for UX)

</details>

---

<details>
<summary>⚖️ <strong>Trade-offs: React Profiling Strategies</strong></summary>

**1. Profiler Component vs Chrome DevTools:**

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **`<Profiler>` component** | Production-safe, programmable, analytics | Limited visualization, overhead | Automated monitoring, A/B testing |
| **Chrome DevTools Profiler** | Rich visualization, no overhead, detailed | Development only, manual | Debugging, optimization |
| **Both** | Best of both | More complex setup | Ideal approach |

**Example:**

```javascript
// Development: Chrome DevTools for debugging
// Just open DevTools → Profiler → Record

// Production: <Profiler> with sampling for monitoring
function ProductionApp() {
  return (
    <Profiler
      id="App"
      onRender={(id, phase, actualDuration) => {
        if (Math.random() < 0.1) { // 10% sampling
          sendToAnalytics({ id, phase, actualDuration });
        }
      }}
    >
      <App />
    </Profiler>
  );
}

// Trade-off: DevTools = detailed but manual, Profiler = automated but overhead
```

**2. Sampling Rate Trade-offs:**

| Rate | Overhead | Data Quality | Cost | Use Case |
|------|----------|--------------|------|----------|
| **100% (all renders)** | High (10-20%) | Perfect | High (storage) | Development only |
| **10% sampling** | Low (1-2%) | Good | Medium | Most production apps |
| **1% sampling** | Minimal (0.1-0.2%) | Basic trends | Low | High-traffic sites |
| **Adaptive (slow only)** | Very Low | Biased (only problems) | Low | Performance alerts |

**Implementation:**

```javascript
// Option A: Fixed 10% sampling
<Profiler
  id="App"
  onRender={(id, phase, duration) => {
    if (Math.random() < 0.1) { // 10% of all renders
      sendMetric({ id, phase, duration });
    }
  }}
>
  <App />
</Profiler>

// Option B: Adaptive (only slow renders)
<Profiler
  id="App"
  onRender={(id, phase, duration) => {
    if (duration > 16) { // Only renders > 16ms (dropped frames)
      sendMetric({ id, phase, duration });
    }
  }}
>
  <App />
</Profiler>

// Trade-off: Fixed = complete picture, Adaptive = only problems (cheaper)
```

**3. Granularity: Whole App vs Specific Components:**

| Scope | Detail | Overhead | Actionability | Use Case |
|-------|--------|----------|---------------|----------|
| **Whole app** | Low | Low | Hard to debug | Overview metrics |
| **Per-page** | Medium | Medium | Good | Page performance |
| **Per-component** | High | High | Excellent | Targeted optimization |

**Example:**

```javascript
// Coarse: Profile entire app (low overhead, less actionable)
<Profiler id="App" onRender={onRender}>
  <App /> {/* Single measurement for everything */}
</Profiler>

// Medium: Profile per-page (balanced)
function Dashboard() {
  return (
    <Profiler id="Dashboard" onRender={onRender}>
      <DashboardContent />
    </Profiler>
  );
}

// Fine: Profile specific components (high overhead, very actionable)
function ProductList({ products }) {
  return (
    <Profiler id="ProductList" onRender={onRender}>
      {products.map(p => (
        <Profiler key={p.id} id={`Product-${p.id}`} onRender={onRender}>
          <ProductCard product={p} />
        </Profiler>
      ))}
    </Profiler>
  );
}

// Trade-off: More granular = more actionable but higher overhead
```

**4. Render Metrics: actualDuration vs baseDuration:**

| Metric | Meaning | Use Case |
|--------|---------|----------|
| **actualDuration** | Real render time (with optimizations) | Monitor production performance |
| **baseDuration** | Theoretical time without memoization | Measure optimization effectiveness |
| **Difference** | Optimization benefit | Justify React.memo/useMemo |

**Example:**

```javascript
<Profiler
  id="ProductList"
  onRender={(id, phase, actualDuration, baseDuration) => {
    const saved = baseDuration - actualDuration;
    const improvement = (saved / baseDuration * 100).toFixed(1);

    console.log(`Optimization saved ${saved}ms (${improvement}% faster)`);

    // If actualDuration ≈ baseDuration, memoization isn't helping!
    if (saved < 5) {
      console.warn('Memoization not effective, consider removing');
    }
  }}
>
  <ProductList />
</Profiler>

// Trade-off: actualDuration = what users experience
//            baseDuration = what it would be without optimization
```

**5. Development vs Production Profiling:**

| Environment | Profiling Approach | Overhead | Detail | Use Case |
|-------------|-------------------|----------|--------|----------|
| **Development** | Chrome DevTools | None (when not recording) | Very high | Finding issues |
| **Staging** | <Profiler> 100% | High (10-20%) | High | Pre-release testing |
| **Production** | <Profiler> 1-10% sampled | Low (0.1-2%) | Medium | Monitoring |

**Implementation:**

```javascript
// Development: Use Chrome DevTools (no code changes)
// Just open DevTools → Profiler tab

// Staging: Full profiling
const ProfilerWrapper = process.env.NODE_ENV === 'staging'
  ? Profiler
  : React.Fragment;

// Production: Sampled profiling
function ProductionProfiler({ id, children, onRender }) {
  const shouldProfile = React.useMemo(() => {
    return Math.random() < (process.env.PROFILE_RATE || 0.1);
  }, []);

  if (!shouldProfile) return children;

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

// Trade-off: More profiling = more overhead but better insights
```

**6. Real-time Alerts vs Batch Analytics:**

| Approach | Latency | Cost | Actionability | Use Case |
|----------|---------|------|---------------|----------|
| **Real-time (immediate)** | Instant | High (many requests) | Immediate fixes | Critical issues |
| **Batch (every 60s)** | ~60s | Medium | Good | Most metrics |
| **On page unload** | Variable | Low | Delayed | Non-critical |

**Implementation:**

```javascript
// Real-time: Send immediately on slow render
<Profiler
  id="App"
  onRender={(id, phase, duration) => {
    if (duration > 100) { // Critical threshold
      fetch('/api/alert/slow-render', {
        method: 'POST',
        body: JSON.stringify({ id, duration }),
        keepalive: true,
      });
    }
  }}
>
  <App />
</Profiler>

// Batched: Collect metrics, send every 60s
const metricsBuffer = [];

<Profiler
  id="App"
  onRender={(id, phase, duration) => {
    metricsBuffer.push({ id, phase, duration, timestamp: Date.now() });
  }}
>
  <App />
</Profiler>

setInterval(() => {
  if (metricsBuffer.length > 0) {
    navigator.sendBeacon('/api/metrics', JSON.stringify(metricsBuffer));
    metricsBuffer.length = 0;
  }
}, 60000);

// Trade-off: Real-time = instant feedback, high cost
//            Batched = efficient, delayed insights
```

</details>

---

<details>
<summary>💬 <strong>Explain to Junior: React Profiler Made Simple</strong></summary>

**The Race Timer Analogy:**

React Profiler is like a race timer that measures how long each component takes to render - just like timing runners in a race.

**Basic Concept:**

```javascript
import { Profiler } from 'react';

// Wrap your component with Profiler
function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}

// This function gets called every time App renders
function onRenderCallback(
  id,               // "App" - which component
  phase,            // "mount" or "update"
  actualDuration    // How long it took (ms)
) {
  console.log(`${id} took ${actualDuration}ms to render`);
}

// Example output:
// App took 45.2ms to render

// Like a race timer:
// Runner: "App component"
// Time: 45.2ms
```

**Why Use It:**

```javascript
// Imagine your app feels slow. Which part is the problem?

<App>              {/* Slow (3000ms total) */}
  <Header />       {/* Fast (10ms) */}
  <Dashboard />    {/* Slow! (2950ms) ← Found it! */}
  <Footer />       {/* Fast (40ms) */}
</App>

// Without Profiler: You'd guess blindly
// With Profiler: You know Dashboard is the problem!
```

**Two Ways to Use Profiler:**

**1. In Code (Programmatic):**

```javascript
// Good for: Production monitoring, automated alerts

function App() {
  return (
    <Profiler
      id="App"
      onRender={(id, phase, duration) => {
        // Alert if slow
        if (duration > 100) {
          console.warn(`⚠️ Slow render: ${duration}ms`);
        }
      }}
    >
      <Dashboard />
    </Profiler>
  );
}

// Pros: Can send to analytics, automated
// Cons: Adds ~10% overhead
```

**2. Chrome DevTools (Visual):**

```javascript
// Good for: Development, debugging

// Steps:
// 1. Install React DevTools extension
// 2. Open DevTools → Profiler tab
// 3. Click Record (🔴)
// 4. Interact with app (click button, etc.)
// 5. Click Stop (⏹️)
// 6. See beautiful visualization!

// Pros: No code changes, rich visuals, no overhead
// Cons: Development only, manual process
```

**Understanding the Metrics:**

```javascript
<Profiler
  id="ProductList"
  onRender={(id, phase, actualDuration, baseDuration) => {
    console.log(`
      Component: ${id}
      Phase: ${phase}              // mount or update
      Took: ${actualDuration}ms     // Actual time
      Without optimization: ${baseDuration}ms  // Theoretical time
    `);
  }}
>
  <ProductList />
</Profiler>

// Example output:
// Component: ProductList
// Phase: update
// Took: 42ms                   ← With React.memo
// Without optimization: 78ms   ← Without React.memo
// You saved: 36ms (46% faster!)
```

**Real Example: Finding Slow Components:**

```javascript
// Problem: Dashboard feels slow

function Dashboard() {
  return (
    <div>
      <Profiler id="Header" onRender={logTime}>
        <Header />
      </Profiler>
      <Profiler id="ProductList" onRender={logTime}>
        <ProductList products={products} />
      </Profiler>
      <Profiler id="Cart" onRender={logTime}>
        <Cart />
      </Profiler>
    </div>
  );
}

function logTime(id, phase, duration) {
  console.log(`${id}: ${duration}ms`);
}

// Output when you click "Filter" button:
// Header: 5ms       ✓ Fast
// ProductList: 2800ms  ⚠️ SLOW! (found the problem)
// Cart: 12ms        ✓ Fast

// Now you know: Optimize ProductList!
```

**Common Fixes After Profiling:**

```javascript
// If Profiler shows ProductList is slow (2800ms):

// Problem: Rendering 500 rows
<ProductList products={allProducts} /> // 500 items

// Fix 1: Virtualization (only render visible rows)
import { useVirtualizer } from '@tanstack/react-virtual';
// Result: 2800ms → 45ms (98% faster!)

// Fix 2: Memoization (prevent re-renders)
const ProductList = React.memo(function ProductList({ products }) {
  // Only re-renders if products actually changed
});
// Result: Skip unnecessary renders entirely

// Fix 3: useMemo (cache expensive calculations)
function ProductList({ products }) {
  const sortedProducts = React.useMemo(() => {
    return products.sort((a, b) => a.price - b.price);
  }, [products]); // Only recalculate when products change

  return <div>{sortedProducts.map(...)}</div>;
}
```

**Production-Safe Profiling (Sampling):**

```javascript
// Don't profile every render in production (expensive!)
// Instead, sample 10% of renders:

<Profiler
  id="App"
  onRender={(id, phase, duration) => {
    // Only log 10% of renders
    if (Math.random() < 0.1) {
      sendToAnalytics({ id, phase, duration });
    }

    // But always log VERY slow renders
    if (duration > 100) {
      console.error(`⚠️ Very slow: ${duration}ms`);
      alertTeam();
    }
  }}
>
  <App />
</Profiler>

// This way:
// - Low overhead (only 1% extra cost)
// - Still catch performance issues
// - Get statistical insights
```

**Interview Answer Template:**

**Q: "How do you use React Profiler to optimize performance?"**

**Answer:**
"React Profiler helps identify slow-rendering components. There are two ways to use it:

**Chrome DevTools Profiler** for development:
- Open React DevTools → Profiler tab
- Record interactions and see visual flame graphs
- Identify which components take the longest to render
- Great for debugging specific performance issues

**Programmatic `<Profiler>` component** for production monitoring:
```javascript
<Profiler
  id="ProductList"
  onRender={(id, phase, actualDuration) => {
    if (actualDuration > 100) {
      sendToAnalytics({ component: id, duration: actualDuration });
    }
  }}
>
  <ProductList />
</Profiler>
```

The onRender callback provides:
- `actualDuration`: How long the render took
- `baseDuration`: How long it would take without optimizations (React.memo, useMemo)
- The difference shows optimization effectiveness

For example, we used Profiler to discover our DataTable was taking 2.9 seconds to render 500 rows. By implementing virtualization (only rendering ~20 visible rows), we reduced render time to 28ms - a 99% improvement. The Profiler showed us exactly where the bottleneck was, which guided our optimization efforts."

**Key Points to Remember:**
- Profiler measures component render times
- Use Chrome DevTools in development (rich visuals, no overhead)
- Use `<Profiler>` component in production (automated, sampled)
- actualDuration = real time, baseDuration = theoretical without optimization
- Sample 1-10% of renders in production to reduce overhead
- Target: < 16ms per render (60fps)

**Common Mistakes:**
1. ❌ Profiling 100% of renders in production (high overhead!)
2. ❌ Only looking at averages (check P95 for outliers)
3. ❌ Not using Chrome DevTools (best for debugging)
4. ❌ Forgetting to remove Profiler after optimization
5. ❌ Not measuring before/after optimization

</details>

---

