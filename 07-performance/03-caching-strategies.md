# Caching Strategies

> Browser caching, service workers, CDN caching, cache invalidation, and performance optimization.

---

## Question 1: Browser Caching Strategies

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Netflix

### Question
Explain browser caching strategies. How do Cache-Control headers work?

### Answer

**Cache-Control Directives:**
- `no-cache` - Revalidate before using
- `no-store` - Don't cache at all
- `public` - Can be cached by any cache
- `private` - Only browser cache
- `max-age=3600` - Cache for 1 hour

```javascript
// HTTP Headers
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// Service Worker caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/css/style.css', '/js/app.js']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Strategies:**
1. **Cache-First** - Use cache, fallback to network
2. **Network-First** - Try network, fallback to cache
3. **Stale-While-Revalidate** - Return cache, update in background

### Resources
- [HTTP Caching](https://web.dev/http-cache/)

---

<details>
<summary>🔍 <strong>Deep Dive: Caching Mechanisms Under the Hood</strong></summary>

**HTTP Cache Hierarchy:**

```
Browser Request Flow:
1. Check Memory Cache (fastest, ~50ms)
   ↓ miss
2. Check Disk Cache (fast, ~100-200ms)
   ↓ miss
3. Check Service Worker Cache (fast, ~50-150ms)
   ↓ miss
4. Check CDN Edge Cache (medium, ~200-500ms)
   ↓ miss
5. Check CDN Origin Shield (slower, ~500-1000ms)
   ↓ miss
6. Fetch from Origin Server (slowest, ~1000-3000ms)
```

**Cache-Control Header Deep Dive:**

```javascript
// Cache-Control directive combinations and their effects

// 1. Immutable assets (hashed filenames: app.a3f8b2.js)
'Cache-Control: public, max-age=31536000, immutable'
// - public: Any cache can store (CDN, proxy, browser)
// - max-age=31536000: Cache for 1 year (31,536,000 seconds)
// - immutable: Never revalidate (file won't change, hash will)
// Result: Single request, cached forever until hash changes

// 2. API responses (frequently changing data)
'Cache-Control: private, no-cache, must-revalidate'
// - private: Only browser cache (not CDN/proxies)
// - no-cache: Revalidate with server before using (ETag check)
// - must-revalidate: Don't serve stale even if offline
// Result: Every request checks server (uses ETag for 304 Not Modified)

// 3. Semi-static content (blog posts, product pages)
'Cache-Control: public, max-age=3600, stale-while-revalidate=86400'
// - max-age=3600: Cache for 1 hour
// - stale-while-revalidate=86400: Can serve stale for 24h while fetching fresh
// Result: Instant response from cache, updates in background

// 4. Never cache (user-specific data)
'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
// - no-store: Don't cache anywhere
// - no-cache: Don't use without revalidation
// Result: Every request hits origin server
```

**ETag Validation Mechanism:**

```javascript
// How ETag revalidation works (304 Not Modified flow)

// 1. First request
Client:  GET /api/products
Server:  HTTP/1.1 200 OK
         ETag: "v1.2.3-abc123"
         Cache-Control: no-cache
         [4KB JSON payload]

// 2. Subsequent request (cache expired or no-cache)
Client:  GET /api/products
         If-None-Match: "v1.2.3-abc123"
Server:  HTTP/1.1 304 Not Modified
         ETag: "v1.2.3-abc123"
         [0 bytes - use cached version]

// Savings: 4KB → 0 bytes (100% bandwidth reduction)
// Speed: 2000ms → 200ms (90% faster)

// ETag generation strategies
function generateETag(content) {
  // Strong ETag (byte-for-byte identical)
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;

  // Weak ETag (semantically identical)
  return `W/"${lastModified}-${contentLength}"`;
}
```

**Service Worker Caching Strategies:**

```javascript
// 1. Cache-First (static assets: CSS, JS, fonts)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
// Pro: Instant response if cached
// Con: May serve stale content

// 2. Network-First (API, frequently changing)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open('v1').then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // Fallback to cache
  );
});
// Pro: Always fresh data when online
// Con: Slower when online, only caches after first success

// 3. Stale-While-Revalidate (best of both)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('v1').then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise; // Return cached immediately, update in background
      });
    })
  );
});
// Pro: Instant response + always updating
// Con: User may see stale data briefly

// 4. Cache-Only (offline-first, pre-cached shell)
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request));
});
// Pro: Fastest possible, works offline
// Con: Never updates (only for app shell)
```

**CDN Cache Invalidation:**

```javascript
// Cache invalidation strategies

// 1. Cache Busting (hashed filenames)
// Before: app.js
// After: app.a3f8b2c4.js
// Pro: Instant invalidation, no purge needed
// Con: Requires build step

// 2. Purge API (Cloudflare/Fastly)
await fetch('https://api.cloudflare.com/client/v4/zones/{zone}/purge_cache', {
  method: 'POST',
  headers: { 'X-Auth-Key': API_KEY },
  body: JSON.stringify({
    files: ['https://example.com/app.js']
  })
});
// Pro: Invalidate specific files
// Con: ~30s propagation time

// 3. Surrogate-Control (origin tells CDN how to cache)
res.setHeader('Surrogate-Control', 'max-age=3600');
res.setHeader('Cache-Control', 'max-age=60');
// CDN caches for 1 hour, browser for 1 minute
// Pro: Different cache times for CDN vs browser
```

**Browser Memory vs Disk Cache:**

```javascript
// Memory Cache (fast, volatile)
// - Capacity: ~50-100MB
// - Speed: 50ms access time
// - Lifetime: Until tab closes
// - Stores: Recently accessed images, CSS, JS

// Disk Cache (slower, persistent)
// - Capacity: ~100MB-1GB
// - Speed: 100-200ms access time
// - Lifetime: Until cleared or max-age expires
// - Stores: All cached resources

// Browser decides which cache based on:
1. Resource size (small → memory, large → disk)
2. Access frequency (frequent → memory)
3. Available memory (low memory → disk)
```

</details>

---

<details>
<summary>🐛 <strong>Real-World Scenario: News Site Caching Disaster</strong></summary>

**Problem:**
High-traffic news website experiencing:
- Server costs: $18K/month (excessive origin requests)
- Breaking news updates taking 4-6 hours to appear for users
- CDN hit rate: 34% (should be 90%+)
- Mobile users seeing 12-hour old articles
- API costs: $4K/month for unnecessary repeated requests

**Investigation Steps:**

```bash
# Step 1: Check cache headers
curl -I https://news-site.com/article/123

HTTP/1.1 200 OK
Cache-Control: no-cache, no-store  # ❌ Problem: Never caching!
ETag: "abc123"
Age: 0
X-Cache: MISS  # ❌ Every request misses cache

# Step 2: Analyze CDN logs
grep "X-Cache: MISS" cdn-logs.txt | wc -l
# Result: 2.4M misses/day (66% miss rate)

# Step 3: Check Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log(reg); // null - ❌ No service worker!
});

# Step 4: Analyze origin requests
# Articles fetched 50,000 times/day despite only 200 updates/day
# 99.6% of requests are for unchanged content!
```

**Root Causes:**
1. ❌ Articles use `Cache-Control: no-cache, no-store` (legacy security policy)
2. ❌ No Service Worker for offline/instant loading
3. ❌ API responses never cached (dynamic cache headers)
4. ❌ No stale-while-revalidate strategy
5. ❌ CDN not configured to ignore query strings (`?utm_source=...`)

**Solution Implementation:**

```javascript
// 1. Fix HTTP headers (Next.js middleware)
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const url = request.nextUrl.pathname;

  if (url.match(/\.(js|css|woff2|png|jpg|webp)$/)) {
    // Static assets (hashed filenames)
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  } else if (url.startsWith('/api/')) {
    // API responses
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=3600'
    );
    // Cache for 1 minute, serve stale for 1 hour while updating
  } else if (url.startsWith('/article/')) {
    // Article pages
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=86400'
    );
    // Cache for 5 minutes, serve stale for 24 hours while updating
    response.headers.set('ETag', generateETag(content));
  }

  return response;
}

// 2. Implement Service Worker
// service-worker.js
const CACHE_NAME = 'news-v1';
const ARTICLE_CACHE = 'articles-v1';

// Install: Pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/app.js',
        '/images/logo.svg'
      ]);
    })
  );
});

// Fetch: Stale-while-revalidate for articles
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('/article/')) {
    event.respondWith(
      caches.open(ARTICLE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            // Update cache in background
            cache.put(request, response.clone());
            return response;
          });

          // Return cached immediately (instant), update in background
          return cached || fetchPromise;
        });
      })
    );
  } else {
    event.respondWith(fetch(request));
  }
});

// 3. API response caching with react-query
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Consider data fresh for 1 minute
      cacheTime: 60 * 60 * 1000, // Keep in cache for 1 hour
      refetchOnWindowFocus: true, // Refresh when user returns to tab
    },
  },
});

function ArticlePage({ id }) {
  const { data } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetch(`/api/article/${id}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes for articles
  });

  return <Article data={data} />;
}

// 4. CDN configuration (Cloudflare)
// cloudflare.json
{
  "cache_by_device_type": false,
  "cache_deception_armor": true,
  "cache_level": "aggressive",
  "browser_cache_ttl": 300,
  "edge_cache_ttl": 3600,
  "ignore_query_strings": ["utm_source", "utm_medium", "fbclid"]
}
```

**Results After Optimization:**

```
Metric                     Before     After      Improvement
──────────────────────────────────────────────────────────────
CDN Hit Rate               34%        92%        +170%
Origin Requests/Day        2.4M       192K       -92%
Server Costs               $18K/mo    $2.1K/mo   -88%
API Costs                  $4K/mo     $480/mo    -88%
TTFB (cached)              1,200ms    80ms       -93%
Breaking News Delay        4-6hrs     5min       -98%
Bandwidth Costs            $3.2K/mo   $420/mo    -87%
Total Monthly Savings                            $22.3K/mo
```

**Cache Monitoring Dashboard:**

```javascript
// Track cache effectiveness
const cacheMetrics = {
  hits: 0,
  misses: 0,
  staleServed: 0,
  bytesServed: 0,
};

performance.getEntriesByType('resource').forEach((entry) => {
  if (entry.transferSize === 0) {
    cacheMetrics.hits++; // From cache (0 bytes transferred)
  } else if (entry.transferSize < entry.encodedBodySize) {
    cacheMetrics.staleServed++; // 304 Not Modified
  } else {
    cacheMetrics.misses++; // Full download
  }
  cacheMetrics.bytesServed += entry.transferSize;
});

const hitRate = (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
// Target: 90%+ for production apps
```

</details>

---

<details>
<summary>⚖️ <strong>Trade-offs: Caching Strategy Decisions</strong></summary>

**1. Cache Duration Trade-offs:**

| Duration | Freshness | Bandwidth | Server Load | Use Case |
|----------|-----------|-----------|-------------|----------|
| **No cache** | Always fresh | High (100%) | High | User-specific data, admin dashboards |
| **1 minute** | Very fresh | Medium (90%) | Medium | API responses, frequently updated |
| **1 hour** | Fresh enough | Low (20%) | Low | Semi-static content, blog posts |
| **1 day** | May be stale | Very low (5%) | Very low | Rarely changing content |
| **1 year** | Never updates | Minimal (1%) | Minimal | Hashed static assets |

**Decision Matrix:**
```javascript
function chooseCacheDuration(contentType, updateFrequency) {
  const strategies = {
    'user-data': { maxAge: 0, revalidate: false },
    'api-frequent': { maxAge: 60, revalidate: 'stale-while-revalidate=3600' },
    'api-infrequent': { maxAge: 3600, revalidate: 'stale-while-revalidate=86400' },
    'article': { maxAge: 300, revalidate: 'stale-while-revalidate=86400' },
    'static-hashed': { maxAge: 31536000, immutable: true },
  };

  return strategies[contentType];
}

// Example: Blog post updated once/day
// maxAge: 300 (5 min), stale-while-revalidate: 86400 (24h)
// - First 5 min: Serve from cache (instant)
// - After 5 min: Serve stale, fetch fresh in background
// - Result: Always instant, updates within 5 min of publish
```

**2. Caching Strategy Comparison:**

| Strategy | Speed (Cache Hit) | Freshness | Offline Support | Complexity | Use Case |
|----------|------------------|-----------|-----------------|------------|----------|
| **Cache-First** | Instant (50ms) | Stale | Excellent | Low | Static assets, images |
| **Network-First** | Slow (1000ms+) | Always fresh | Poor | Low | API, user data |
| **Stale-While-Revalidate** | Instant (50ms) | Eventually fresh | Good | Medium | Most content |
| **Cache-Only** | Instant (50ms) | Stale | Perfect | Low | App shell, offline pages |
| **Network-Only** | Slow (1000ms+) | Always fresh | None | Low | Security-critical data |

**Visual Comparison:**
```
User Experience Over Time:

Cache-First:
T=0s:  Instant load (cached) ⚡
T=10s: Still cached (may be stale) ⚡
T=60s: Still cached (may be very stale) ⚡
Updates: Only when cache expires or manual invalidation

Network-First:
T=0s:  Slow (network request) 🐌
T=10s: Slow (network request) 🐌
T=60s: Slow (network request) 🐌
Updates: Always fresh

Stale-While-Revalidate:
T=0s:  Instant (cached) ⚡
T=10s: Instant (cached), updating in background ⚡🔄
T=60s: Instant (fresh cache from background update) ⚡
Updates: Immediate perception, fresh within 1-2 requests
```

**3. Public vs Private Caching:**

| Directive | CDN Cache | Proxy Cache | Browser Cache | Use Case |
|-----------|-----------|-------------|---------------|----------|
| `public` | ✅ | ✅ | ✅ | Static assets, public pages |
| `private` | ❌ | ❌ | ✅ | User-specific data |
| `no-store` | ❌ | ❌ | ❌ | Sensitive data (passwords, tokens) |

**Security Trade-off:**
```javascript
// Scenario: Product page with personalized recommendations

// Option A: Cache entire page as public
'Cache-Control: public, max-age=3600'
// Pro: Excellent performance, CDN caching
// Con: Shows same recommendations to all users (privacy issue!)

// Option B: Cache page as private
'Cache-Control: private, max-age=3600'
// Pro: Secure (each user gets own cache)
// Con: Can't use CDN, higher server load

// Option C: Hybrid (best approach)
// - Cache public content (product details) as public
// - Fetch personalized content (recommendations) client-side
<ProductPage> {/* Cached public */}
  <ProductDetails /> {/* From cache */}
  <Recommendations userId={user.id} /> {/* Client-side fetch, private */}
</ProductPage>

'Cache-Control: public, max-age=3600' // For base page
'Cache-Control: private, max-age=300' // For recommendations API
```

**4. ETag vs Last-Modified:**

| Header | Accuracy | Bandwidth | Complexity | Use Case |
|--------|----------|-----------|------------|----------|
| **ETag** | Exact (content hash) | Low (304 response) | High (compute hash) | APIs, dynamic content |
| **Last-Modified** | Approximate (timestamp) | Low (304 response) | Low (timestamp only) | Static files |
| **Both** | Best | Lowest | Highest | Critical content |

**Performance Impact:**
```javascript
// ETag generation cost
function generateETag(content) {
  const start = performance.now();
  const hash = crypto.createHash('md5').update(content).digest('hex');
  console.log(`ETag generated in ${performance.now() - start}ms`);
  return hash;
}
// Cost: ~5ms for 1MB file (acceptable)
// Benefit: 99% bandwidth reduction on 304 responses

// Trade-off decision:
// - Small files (< 100KB): Always use ETag
// - Large files (> 10MB): Last-Modified only (hash too expensive)
// - APIs: Always use ETag (content changes unpredictably)
```

**5. Cache Invalidation Strategies:**

| Strategy | Speed | Complexity | Risk | Cost | Use Case |
|----------|-------|------------|------|------|----------|
| **Time-based (max-age)** | Instant | Low | Stale content | Free | Most content |
| **Manual purge** | ~30s | Medium | Human error | $ (API calls) | Breaking news |
| **Cache busting (hashing)** | Instant | High (build step) | None | Free | Static assets |
| **Event-driven (webhooks)** | ~5s | Very high | Complexity | $ (infrastructure) | Real-time apps |

**Example Decision Tree:**
```javascript
if (contentType === 'static-asset' && hasBuildStep) {
  return 'cache-busting'; // Best for JS/CSS
}
if (updateFrequency === 'unpredictable' && isCritical) {
  return 'event-driven-purge'; // Breaking news
}
if (updateFrequency === 'hourly') {
  return 'time-based-max-age'; // Most content
}
return 'manual-purge'; // Fallback
```

</details>

---

<details>
<summary>💬 <strong>Explain to Junior: Caching Made Simple</strong></summary>

**The Library Book Analogy:**

Imagine you're researching and need a book from the library every day:

**Without caching:**
- Every day: Walk to library (10 min), find book (5 min), walk back (10 min)
- Total: 25 minutes per day

**With caching:**
- Day 1: Walk to library, borrow book, keep at home (25 min)
- Day 2-30: Read book at home (instant!)
- Day 31: Return book, borrow again if needed

**That's caching!** Store content close to you for instant access.

**Basic Concepts:**

**1. Cache-Control Headers = "Storage Instructions"**

```javascript
// Tell browser: "Keep this for 1 hour"
Cache-Control: max-age=3600

// Think of it like:
"Store this milk in your fridge. It's good for 1 hour."

// Tell browser: "Always ask me before using"
Cache-Control: no-cache

// Think of it like:
"Check with me (call me) before drinking this milk, even if it's in your fridge."

// Tell browser: "Never store this"
Cache-Control: no-store

// Think of it like:
"Don't keep this in your fridge at all. Get fresh every time."
```

**2. Three Cache Strategies Explained:**

**Cache-First (like keeping snacks in your desk):**
```javascript
// Check desk drawer first, go to vending machine only if not there
if (snackInDrawer) {
  return snackInDrawer; // Instant!
} else {
  snack = getFromVendingMachine(); // Slow
  putInDrawer(snack); // Save for later
  return snack;
}
```
**Use when:** Content doesn't change often (images, logos)

**Network-First (like checking restaurant menu online):**
```javascript
// Always check latest menu online, use old paper menu only if WiFi down
try {
  return getLatestMenuOnline(); // May be slow but always fresh
} catch (noWiFi) {
  return oldPaperMenu; // Backup
}
```
**Use when:** Content changes frequently (news, stock prices)

**Stale-While-Revalidate (BEST OF BOTH):**
```javascript
// Show old menu immediately, fetch new one in background
showMenu(oldMenu); // Instant!
fetchNewMenu().then(newMenu => {
  saveForNext(newMenu); // Ready for next visit
});
```
**Use when:** Most websites! (fast + fresh)

**3. ETag = "Version Check"**

```html
Analogy: TV show episodes

First time:
You: "Give me Episode 5"
Netflix: "Here's Episode 5 (version abc123)" [downloads 500MB]

Next time:
You: "Give me Episode 5, I have version abc123"
Netflix: "You already have the latest! Use yours" [downloads 0MB]

Saved: 500MB bandwidth, 30 seconds download time!
```

**In code:**
```javascript
// Request 1
GET /api/products
Response:
  ETag: "v123"
  [4KB data]

// Request 2 (1 minute later)
GET /api/products
If-None-Match: "v123"

Response:
  304 Not Modified (data unchanged)
  [0KB - use cached version]

// Result: 4KB → 0KB (instant response!)
```

**4. Service Worker = "Smart Assistant"**

```javascript
// Service Worker is like a smart assistant between browser and server

Normal request:
Browser → Server → Wait → Response → Display
(1000ms)

With Service Worker:
Browser → Service Worker → Check Cache → Found! → Display
(50ms - 20x faster!)

// Service Worker says:
"I'll check my storage first. If I don't have it, I'll ask the server."
```

**Interview Answer Template:**

**Q: "How do browser caching and Service Workers work?"**

**Answer:**
"Browser caching uses HTTP headers to store resources locally for faster subsequent loads. The key header is `Cache-Control` which tells the browser how long to keep items.

For example, static assets like JavaScript files use:
```javascript
Cache-Control: public, max-age=31536000, immutable
```
This means 'cache for 1 year and never check again' because we use hashed filenames like `app.a3f8b2.js`.

For dynamic content like API responses, we use:
```javascript
Cache-Control: public, max-age=60, stale-while-revalidate=3600
```
This means 'cache for 1 minute, then serve stale content while fetching fresh in background' - giving users instant responses while ensuring freshness.

Service Workers add a programmable cache layer. We can implement strategies like:
- **Cache-First**: Instant for static assets
- **Network-First**: Fresh data for APIs
- **Stale-While-Revalidate**: Best of both (instant + fresh)

Together, these reduced our news site's origin requests by 92% and cut server costs from $18K to $2K/month while improving TTFB from 1200ms to 80ms."

**Key Numbers to Remember:**
- Static assets: cache 1 year (`max-age=31536000`)
- API responses: cache 1-5 minutes with `stale-while-revalidate`
- Target CDN hit rate: 90%+
- ETag can save 100% bandwidth on unchanged content

**Common Mistakes:**
1. ❌ Using `no-cache, no-store` for everything (kills performance)
2. ❌ Not using ETags (missing 90%+ bandwidth savings)
3. ❌ Caching user-specific data as `public` (privacy leak!)
4. ❌ Same cache duration for all content types
5. ❌ Not monitoring cache hit rates

</details>

---

