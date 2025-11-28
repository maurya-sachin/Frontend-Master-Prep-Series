# Next.js Performance Optimization

> Techniques and strategies for optimizing Next.js application performance.

---

## Question 1: Performance Optimization Strategies

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All companies

### Question
How do you optimize Next.js application performance? What are the key techniques?

### Answer

**Performance Optimizations:**
1. **Image optimization** - Next.js Image component
2. **Code splitting** - Automatic and manual
3. **Font optimization** - next/font
4. **Bundle analysis** - Identify large dependencies
5. **Caching strategies** - Maximize cache hits

**Key Points:**
1. **Use built-in optimizations** - Image, Font, Script components
2. **Minimize JavaScript** - Use Server Components when possible
3. **Lazy load** - Load components/images on demand
4. **Measure** - Use Lighthouse, Web Vitals
5. **Cache aggressively** - CDN, ISR, browser cache

### Code Example

```typescript
// 1. IMAGE OPTIMIZATION
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div>
      {/* ❌ BAD: Regular img tag */}
      <img src={product.image} alt={product.name} />

      {/* ✅ GOOD: Next.js Image */}
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL={product.blurHash}
        loading="lazy"
        quality={85}
      />
    </div>
  );
}

// 2. FONT OPTIMIZATION
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

// 3. DYNAMIC IMPORTS (Code Splitting)
import dynamic from 'next/dynamic';

// Load component only when needed
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
});

function Page() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(true)}>Load</button>
      {show && <HeavyComponent />}
    </div>
  );
}

// Load library only on client
const ChartComponent = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  { ssr: false }
);

// 4. SCRIPT OPTIMIZATION
import Script from 'next/script';

function Page() {
  return (
    <div>
      {/* ❌ BAD */}
      <script src="https://example.com/script.js"></script>

      {/* ✅ GOOD: Deferred loading */}
      <Script
        src="https://example.com/analytics.js"
        strategy="lazyOnload" // Load after page interactive
      />

      {/* Critical script */}
      <Script
        src="https://example.com/critical.js"
        strategy="beforeInteractive"
      />
    </div>
  );
}

// 5. BUNDLE ANALYSIS
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}

// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // your config
});

// 6. PREFETCHING
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      {/* Prefetch on hover (default) */}
      <Link href="/products">Products</Link>

      {/* Disable prefetch for less important links */}
      <Link href="/terms" prefetch={false}>
        Terms
      </Link>
    </nav>
  );
}

// Programmatic prefetch
import { useRouter } from 'next/router';

function Component() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch likely next page
    router.prefetch('/checkout');
  }, [router]);
}

// 7. API ROUTE OPTIMIZATION
// pages/api/data.ts
export default async function handler(req, res) {
  // Set cache headers
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120'
  );

  const data = await fetchData();
  res.json(data);
}

// 8. COMPRESSION
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression (default: true)

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96]
  },

  // Minify JavaScript
  swcMinify: true // Use SWC for faster minification
};

// 9. REDUCING JAVASCRIPT
// Use Server Components (App Router)
async function ProductList() {
  const products = await fetchProducts();

  return (
    <div>
      {products.map(product => (
        // No JS sent to client for static content
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// 10. WEB VITALS MONITORING
// pages/_app.tsx
export function reportWebVitals(metric) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(metric); // { id, name, label, value }

    // Send to analytics service
    analytics.track('Web Vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id
    });
  }
}

// 11. REDUCE BUNDLE SIZE
// Import only what you need
// ❌ BAD
import _ from 'lodash';

// ✅ GOOD
import debounce from 'lodash/debounce';

// Or use tree-shakeable alternative
import { debounce } from 'lodash-es';

// 12. EDGE MIDDLEWARE
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Run at edge (faster)
  const response = NextResponse.next();

  // Add cache headers
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  );

  return response;
}
```

---

<details>
<summary><strong>🔍 Deep Dive: Next.js Performance Optimization Architecture</strong></summary>

### Image Optimization Pipeline

**Next.js Image Component Internals:**

When you use `<Image />`, Next.js performs sophisticated optimization:

```
1. Build Time (next build):
   ├─ Scan all Image imports
   ├─ Determine optimal sizes needed
   ├─ Pre-generate critical images
   └─ Optimize with AVIF + WebP + JPEG

2. Request Time (first user request):
   ├─ Detect device (viewport)
   ├─ Select best image size
   ├─ Check cache
   ├─ If not cached, optimize on-the-fly
   ├─ Cache result (CDN)
   └─ Serve to user

3. Browser Rendering:
   ├─ Picture tag with multiple formats
   ├─ Browser picks best format (AVIF > WebP > JPEG)
   ├─ Lazy loading by default
   ├─ Placeholder (blur hash or LQIP)
   └─ Load only when needed
```

**Before vs After:**

```
OLD: <img src="photo.jpg" />
├─ Size: 2.5MB (full resolution)
├─ Format: JPEG (not optimized)
├─ Loads: Immediately (not lazy)
└─ User sees: Slow, unoptimized

NEW: <Image src="photo.jpg" width={300} height={200} />
├─ Size: 45KB (optimized for mobile)
├─ Format: AVIF (if supported) or WebP
├─ Loads: On-demand (lazy by default)
├─ Display: Blur placeholder while loading
└─ User sees: Fast, professional
```

**Performance Metrics Impact:**

```
Metric          Before    After     Improvement
───────────────────────────────────────────────
Image Size      2.5MB     45KB      98% reduction
TTFB            1200ms    150ms     87% reduction
LCP             2100ms    800ms     62% reduction
Time to 1st img 2500ms    400ms     84% reduction
Page load       5.2s      1.8s      65% reduction
```

### Bundle Size Analysis & Optimization

**How to identify bloat:**

```typescript
// pages/_app.tsx
export function reportWebVitals(metric) {
  if (metric.name === 'JS') {
    console.log(`JS Bundle: ${metric.value / 1024}KB`);
    // Target: <200KB for fast networks
    // Target: <400KB for slow networks
  }
}
```

**Common bundle killers:**

```
Library                 Size        Issue              Fix
─────────────────────────────────────────────────────────
lodash                  70KB        Unused functions   Use lodash-es + tree-shake
moment                  67KB        Date parsing       Use date-fns or dayjs
react-icons            200KB        Icon library       Import specific icons
recharts               180KB        Charts lib         Dynamic import with ssr:false
date-fns               70KB         Use all functions  Tree-shake, imports only needed
three.js              500KB        3D library         Dynamic import, split scenes
pdf.js                300KB        PDF rendering      Code split by feature
socket.io             150KB        WebSocket          Only when needed
apollo-client         200KB        GraphQL            Code split by page
```

**Smart code splitting strategy:**

```typescript
// ❌ BAD: Load everything upfront
import HeavyComponent from './HeavyComponent';

function Page() {
  return <HeavyComponent />;
}

// ✅ GOOD: Load on demand
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
});

function Page() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(true)}>Load Feature</button>
      {show && <HeavyComponent />}
    </>
  );
}

// Result:
// Initial bundle: 50KB (without HeavyComponent)
// After click: +150KB loaded (HeavyComponent)
// User only waits if they interact
```

### Web Vitals & Measurement

**Core Web Vitals - What matters:**

```
LCP (Largest Contentful Paint)
├─ What: Largest image/text visible in viewport
├─ Target: < 2.5 seconds (75th percentile)
├─ Optimized: Load images, defer non-critical CSS
└─ Example: Product image should load by 2.5s

INP (Interaction to Next Paint)
├─ What: Time from user interaction to next render
├─ Target: < 200ms
├─ Optimized: Debounce handlers, lazy evaluate
└─ Example: Form input should respond instantly

CLS (Cumulative Layout Shift)
├─ What: Unexpected layout changes during load
├─ Target: < 0.1
├─ Optimized: Set image dimensions, reserve space
└─ Example: Don't add banner after page loads
```

**Measuring in production:**

```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendMetrics(metric) {
  // Send to analytics
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating // 'good' | 'needs-improvement' | 'poor'
  });
}

getCLS(sendMetrics);
getFID(sendMetrics);
getFCP(sendMetrics);
getLCP(sendMetrics);
getTTFB(sendMetrics);
```

### Caching Strategy Matrix

**Multi-layer caching approach:**

```
Layer 1: Browser Cache
├─ Immutable assets: max-age=31536000 (1 year)
├─ Versioned by content hash
├─ CSS/JS: script.abc123.js
└─ Examples: Images, fonts, static assets

Layer 2: CDN Cache (Edge)
├─ HTML pages: s-maxage=3600 (1 hour)
├─ API routes: s-maxage=60 (1 minute)
├─ Distributed globally
└─ Revalidate at origin automatically

Layer 3: Server Cache
├─ Redis: In-memory cache
├─ TTL: 5-300 seconds
├─ Used for: Database results, API responses
└─ Invalidation: Webhook or time-based

Layer 4: Database Cache
├─ Query result cache
├─ Query plan cache
├─ Connection pooling
└─ Can't directly control (database-specific)
```

**Setting cache headers properly:**

```typescript
// pages/api/data.ts
export default async function handler(req, res) {
  // Static asset (never changes)
  if (req.query.type === 'logo') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // HTML page (revalidate hourly)
  else if (req.query.type === 'page') {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }
  // API response (revalidate every minute)
  else if (req.query.type === 'api') {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  }
  // Dynamic data (no cache)
  else if (req.query.type === 'real-time') {
    res.setHeader('Cache-Control', 'no-store');
  }

  res.json({ data: '...' });
}
```

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario: Performance Optimization at Scale</strong></summary>

### The Problem: Slow SaaS Application

**Company:** Project management SaaS (100K active users)

**Initial Performance:**

```
Metrics (P95 performance):
- Initial Load: 4.2 seconds
- First Contentful Paint: 3.1 seconds
- Largest Contentful Paint: 4.8 seconds
- Time to Interactive: 6.2 seconds
- JavaScript bundle: 680KB
- Total page size: 2.1MB
- Bounce rate: 28% (users leave before interaction)
- Annual revenue impact: $450K lost in churn
```

**Performance Bottlenecks (identified via profiling):**

1. **Large JavaScript bundle (680KB)**
   - React: 35KB (OK)
   - React DOM: 130KB (OK)
   - Redux: 80KB (fine)
   - Lodash: 70KB (unused!)
   - React Grid: 200KB (never used!)
   - Charts: 120KB (rare feature)
   - Socket.io: 150KB (rarely needed)

2. **Images not optimized**
   - Dashboard avatar: 850KB PNG
   - Background images: 2.3MB total
   - Not lazy-loaded
   - Not responsive

3. **No caching strategy**
   - Every request hits database
   - API responses vary per user
   - No Redis layer

### Optimization Strategy

**Phase 1: Bundle Optimization (Week 1)**

```typescript
// BEFORE: Import everything
import _ from 'lodash'; // 70KB!

// AFTER: Import only what's needed
import debounce from 'lodash-es/debounce'; // 1KB!

// Result: -69KB from bundle

// Dynamic imports for heavy features
import dynamic from 'next/dynamic';

const AdvancedChart = dynamic(
  () => import('./AdvancedChart'),
  { ssr: false, loading: () => <Spinner /> }
); // 120KB only loaded when feature used

const SocketConnection = dynamic(
  () => import('./SocketConnection'),
  { ssr: false }
); // 150KB only for users who enable real-time
```

**Bundle impact:**

```
Before:
├─ React: 35KB
├─ React DOM: 130KB
├─ Redux: 80KB
├─ Lodash: 70KB ❌ (removed)
├─ React Grid: 200KB ❌ (dynamic import)
├─ Charts: 120KB ❌ (dynamic import)
├─ Socket.io: 150KB ❌ (dynamic import)
└─ Total: 680KB

After:
├─ React: 35KB
├─ React DOM: 130KB
├─ Redux: 80KB
├─ Lodash-es (only debounce): 1KB
├─ Other deps: 50KB
└─ Total: 296KB

Improvement: -384KB (56% reduction!)
```

**Phase 2: Image Optimization (Week 2)**

```typescript
// OLD: Raw image tags
<img src="/avatar.png" alt="User" />
// Size: 850KB, loading immediately

// NEW: Next.js Image with optimization
<Image
  src="/avatar.png"
  alt="User"
  width={60}
  height={60}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // LQIP
  loading="lazy"
  quality={75} // Reduce quality (imperceptible to users)
/>
// Size: 12KB (98% smaller!), loads on-demand

// Responsive images
<Image
  src="/background.jpg"
  alt="Background"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
// Generates: 320px, 640px, 960px, 1280px, 1920px versions
// Browser picks correct size
```

**Image impact:**

```
Before:
├─ Avatar: 850KB
├─ Background: 2.3MB
├─ Team photos: 1.5MB
└─ Total: 4.65MB

After (optimized + lazy-loaded):
├─ Avatar: 12KB (above fold)
├─ Background: 45KB (above fold)
├─ Team photos: 80KB (lazy-loaded)
└─ Total above fold: 57KB
└─ Total if all loaded: 450KB (90% reduction!)
```

**Phase 3: Caching & API Optimization (Week 3)**

```typescript
// API route: Add Redis caching
// pages/api/dashboard.ts
import { redis } from '@/lib/redis';

export default async function handler(req, res) {
  const userId = req.user.id;
  const cacheKey = `dashboard:${userId}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.json(JSON.parse(cached));
  }

  // Cache miss - fetch from database
  const dashboard = await db.dashboards.findUnique({
    where: { userId }
  });

  // Cache for 60 seconds
  await redis.setex(cacheKey, 60, JSON.stringify(dashboard));

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.json(dashboard);
}

// CLIENT: Cache in SWR
function Dashboard() {
  const { data } = useSWR('/api/dashboard', fetcher, {
    dedupingInterval: 60000, // Don't fetch if already requested in last minute
    focusThrottleInterval: 300000, // Don't refetch if focus regained within 5 min
  });
}
```

**Caching impact:**

```
Before:
- First request: 450ms (database)
- Second request: 450ms (database again!)
- Peak load: Database overwhelmed

After:
- First request: 450ms (database)
- Second request: 5ms (Redis cache!)
- Peak load: 5 concurrent database queries (vs 500)
- Cost: $100/month Redis vs $5000/month database scaling
```

### Results

**Performance metrics after optimization:**

```
Metric                Before    After     Improvement
─────────────────────────────────────────────────────
Initial Load          4.2s      1.8s      57% faster
FCP                   3.1s      0.9s      71% faster
LCP                   4.8s      1.2s      75% faster
TTI                   6.2s      1.4s      77% faster

Bundle Size           680KB     296KB     56% smaller
JavaScript            680KB     240KB     65% smaller
Images                4.65MB    400KB     91% smaller
Total page size       2.1MB     800KB     62% smaller

Bounce Rate           28%       8%        71% reduction
Avg Session Time      3.2m      8.1m      153% increase
Revenue Impact        -$450K    +$280K    $730K improvement
```

**Cost Savings:**

```
Before:
├─ CDN (unoptimized): $4,200/month
├─ Database (high load): $8,000/month
├─ Servers (auto-scaling): $3,500/month
└─ Total: $15,700/month

After:
├─ CDN (optimized): $800/month
├─ Database (normal load): $2,000/month
├─ Servers (baseline): $1,500/month
├─ Redis cache: $100/month
└─ Total: $4,400/month

Annual savings: $135,600!
```

### Key Optimization Techniques Applied

1. **Tree-shaking unused dependencies** (-69KB)
2. **Dynamic imports for rare features** (-350KB)
3. **Image optimization + lazy-loading** (-4.2MB initial)
4. **Redis caching for API responses** (5ms vs 450ms)
5. **Browser cache headers for static assets** (repeat visitors fast)
6. **Code splitting by route** (load only what's needed)

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Performance vs Feature Completeness</strong></summary>

### When Optimization Hurts

```
Goal: Optimize initial load
└─ Trade-off: Features load later

Example: Charts library
├─ Unoptimized: Load all charts upfront (120KB)
└─ Optimized: Load charts on-demand (+delay for users wanting charts)

Solution: Intelligent defaults
├─ Pre-load if user likely needs it
├─ Pre-load if on fast network (4G LTE)
├─ Pre-load if on high-power device
└─ Delay load on slow network (3G)
```

### Performance vs Quality

```
Image optimization:
├─ Original: 850KB PNG (perfect quality)
├─ Optimized: 12KB WebP (75% quality)
├─ Trade-off: Imperceptible to users, huge file size savings

Code minification:
├─ Readable: 500KB JavaScript
├─ Minified: 120KB JavaScript
├─ Trade-off: Unreadable but faster to download

Bundle size vs developer experience:
├─ Include everything: Easy coding (+500KB)
├─ Tree-shake imports: Optimized (-350KB) but more tedious
└─ Use package size checker: Best of both
```

</details>

---

<details>
<summary><strong>💬 Explain to Junior: Performance Optimization Mindset</strong></summary>

### The Performance Checklist (Priority Order)

**1. Rendering Strategy (Biggest impact)**

```
Choice of SSG vs ISR vs SSR:
├─ SSG: 10ms TTFB (best)
├─ ISR: 50ms TTFB (great)
├─ SSR: 500ms TTFB (slow)
└─ Impact: 50x difference!

Lesson: Choose rendering strategy first, optimization second.
```

**2. Image Optimization (Second biggest)**

```
Typical site breakdown:
├─ Images: 80% of page size
├─ JavaScript: 15%
├─ CSS: 3%
├─ HTML: 2%

Optimizing images gives most ROI.
```

**3. JavaScript Bundle Size (Third)**

```
Optimize code:
├─ Remove unused imports
├─ Dynamic import heavy components
├─ Use smaller alternatives (date-fns vs moment)
├─ Tree-shake dependencies

Impact: 50-100KB reduction = 1-2 second improvement
```

**4. Caching Strategy (Fourth)**

```
Add multiple layers:
├─ Browser cache (1 year for static)
├─ CDN cache (1 hour for HTML)
├─ Redis cache (1 minute for API)

Impact: 90% cache hit rate = 99.5% fast requests
```

### Interview Example

**"How would you optimize a slow Next.js app?"**

```
1. Measure first (don't guess)
   └─ npm run analyze (bundle size)
   └─ Lighthouse (performance score)
   └─ DevTools (identify slow operations)

2. Rendering strategy
   └─ Use SSG for static content
   └─ Use ISR for semi-dynamic content
   └─ Use SSR only when necessary

3. Images
   └─ Use Next.js Image component
   └─ Set quality=75-85 (imperceptible loss)
   └─ Lazy-load below-fold images
   └─ Serve multiple formats (AVIF, WebP, JPEG)

4. JavaScript
   └─ Analyze bundle (npm run analyze)
   └─ Remove unused dependencies
   └─ Dynamic import heavy components
   └─ Consider lighter alternatives

5. Caching
   └─ Set proper Cache-Control headers
   └─ Add Redis for API responses
   └─ Leverage browser cache for static assets

6. Measure impact
   └─ Track Core Web Vitals
   └─ Monitor bundle size
   └─ A/B test changes
```

---

### Common Mistakes

- ❌ Not using Next.js Image component
- ❌ Loading all JavaScript upfront
- ❌ Not analyzing bundle size
- ❌ Ignoring Web Vitals metrics
- ✅ Use built-in optimization components
- ✅ Lazy load non-critical resources
- ✅ Monitor and measure performance regularly

### Follow-up Questions

1. How does Next.js Image component optimize images?
2. What's the difference between `prefetch` and `preload`?
3. How do you optimize for Core Web Vitals?

### Resources
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)

---

</details>

---

**[← Back to Next.js README](./README.md)**
