# Caching Strategies

> **Focus**: Progressive Web Apps caching patterns and performance optimization

---

## Question 1: What are the main caching strategies (cache-first, network-first, stale-while-revalidate) and when should you use each?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Netflix, Airbnb, Uber

### Question
Explain the different service worker caching strategies and provide guidance on when to use each.

### Answer

Caching strategies determine how service workers handle network requests and serve content from cache. The right strategy depends on your content type and freshness requirements.

**Main Caching Strategies:**

1. **Cache First** (Cache Falling Back to Network)
   - Check cache first, fetch from network if miss
   - Fast, works offline
   - Use for: Static assets, images, fonts

2. **Network First** (Network Falling Back to Cache)
   - Try network first, use cache if offline
   - Always fresh when online
   - Use for: HTML, API responses

3. **Stale-While-Revalidate**
   - Serve cache immediately, update in background
   - Fast + eventually fresh
   - Use for: Assets that can be slightly stale

4. **Network Only**
   - Always fetch from network, never cache
   - Use for: Real-time data, analytics

5. **Cache Only**
   - Only serve from cache, never network
   - Use for: Pre-cached app shell

### Code Example

**1. Cache First (Cache Falling Back to Network):**

```javascript
// Best for: Static assets that rarely change
// Examples: images, fonts, CSS, JS bundles

async function cacheFirst(request) {
  // Try cache first
  const cached = await caches.match(request);

  if (cached) {
    console.log('Serving from cache:', request.url);
    return cached;
  }

  // Cache miss, fetch from network
  console.log('Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open('static-v1');
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Network failed:', error);

    // Return offline fallback
    return caches.match('/offline.html');
  }
}

// Usage in service worker
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.match(/\.(png|jpg|css|js)$/)) {
    event.respondWith(cacheFirst(event.request));
  }
});

// Performance: ~5-10ms (cache hit) vs ~200-500ms (network)
// Offline: ✅ Works perfectly
// Freshness: ❌ May serve stale content
```

**2. Network First (Network Falling Back to Cache):**

```javascript
// Best for: HTML pages, API data that should be fresh
// Examples: user profiles, news feeds, product listings

async function networkFirst(request, timeout = 3000) {
  const cache = await caches.open('dynamic-v1');

  try {
    // Race network request against timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(request, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }

    console.log('Serving from network:', request.url);
    return response;

  } catch (error) {
    console.log('Network failed, using cache:', error.message);

    // Fallback to cache
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // No cache either, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Usage
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
  }
});

// Performance: ~200-500ms (network) vs ~5-10ms (cache fallback)
// Offline: ✅ Shows last cached version
// Freshness: ✅ Always fresh when online
```

**3. Stale-While-Revalidate:**

```javascript
// Best for: Assets that can be slightly stale
// Examples: avatars, thumbnails, non-critical API data

async function staleWhileRevalidate(request) {
  const cache = await caches.open('swr-v1');

  // Serve from cache immediately (if available)
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    // Update cache with fresh response
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('Background update failed:', error);
    return null;
  });

  // Return cached immediately, or wait for network if no cache
  return cachedResponse || fetchPromise;
}

// Usage
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/avatars/')) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Performance: ~5-10ms (cache) + background network update
// Offline: ✅ Serves stale content
// Freshness: ⚡ Eventually fresh (next request will be fresh)
```

**4. Network Only:**

```javascript
// Best for: Real-time data, analytics, payments
// Examples: live scores, stock prices, POST requests

async function networkOnly(request) {
  try {
    const response = await fetch(request);
    console.log('Network only:', request.url);
    return response;
  } catch (error) {
    console.error('Network only failed:', error);

    // For critical requests, show error page
    if (request.mode === 'navigate') {
      return new Response('Network required', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    throw error;
  }
}

// Usage
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/live/') ||
      event.request.method !== 'GET') {
    event.respondWith(networkOnly(event.request));
  }
});

// Performance: ~200-500ms (network only)
// Offline: ❌ Fails when offline
// Freshness: ✅ Always fresh
```

**5. Cache Only:**

```javascript
// Best for: Pre-cached app shell
// Examples: Core UI, critical CSS/JS

async function cacheOnly(request) {
  const cached = await caches.match(request);

  if (cached) {
    console.log('Cache only:', request.url);
    return cached;
  }

  throw new Error('Not in cache');
}

// Usage (typically for app shell)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // App shell should always be cached
  if (url.pathname === '/app-shell.html') {
    event.respondWith(cacheOnly(event.request));
  }
});

// Performance: ~5-10ms (always cache)
// Offline: ✅ Works perfectly if pre-cached
// Freshness: ❌ Never updates (requires SW update)
```

**6. Complete Strategy Router:**

```javascript
// Comprehensive routing based on request type

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Route to appropriate strategy
  event.respondWith(routeRequest(request));
});

async function routeRequest(request) {
  const url = new URL(request.url);
  const method = request.method;
  const destination = request.destination;

  // 1. POST/PUT/DELETE → Network only (never cache mutations)
  if (method !== 'GET') {
    return networkOnly(request);
  }

  // 2. Navigation (HTML) → Network first
  if (request.mode === 'navigate') {
    return networkFirst(request, 5000);
  }

  // 3. Images → Cache first
  if (destination === 'image') {
    return cacheFirst(request);
  }

  // 4. Fonts → Cache first (with CORS)
  if (destination === 'font') {
    return cacheFirst(request);
  }

  // 5. Scripts/Styles → Stale-while-revalidate
  if (destination === 'script' || destination === 'style') {
    return staleWhileRevalidate(request);
  }

  // 6. API endpoints
  if (url.pathname.startsWith('/api/')) {
    // Real-time data → Network only
    if (url.pathname.includes('/live/')) {
      return networkOnly(request);
    }

    // User data → Network first
    if (url.pathname.includes('/user/')) {
      return networkFirst(request, 3000);
    }

    // Static data → Stale-while-revalidate
    return staleWhileRevalidate(request);
  }

  // Default: Network first
  return networkFirst(request, 5000);
}
```

**7. Advanced: Cache Expiration:**

```javascript
// Implement cache expiration (max-age)

const CACHE_NAME = 'timed-cache-v1';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

async function cacheFirstWithExpiration(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Check cache timestamp
    const cachedTime = cached.headers.get('sw-cache-time');

    if (cachedTime) {
      const age = Date.now() - parseInt(cachedTime, 10);

      if (age < MAX_AGE) {
        console.log(`Cache hit (age: ${Math.round(age / 1000)}s)`);
        return cached;
      }

      console.log('Cache expired, fetching fresh');
    }
  }

  // Cache miss or expired
  try {
    const response = await fetch(request);

    if (response.ok) {
      // Add timestamp header
      const responseWithTime = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'sw-cache-time': Date.now().toString()
        }
      });

      cache.put(request, responseWithTime.clone());
      return responseWithTime;
    }

    return response;
  } catch (error) {
    // Network failed, return stale cache
    if (cached) {
      console.log('Network failed, serving stale cache');
      return cached;
    }
    throw error;
  }
}
```

**8. Advanced: Cache Size Management:**

```javascript
// Limit cache size (FIFO eviction)

const CACHE_NAME = 'limited-cache-v1';
const MAX_ITEMS = 50;

async function cacheWithLimit(request, response) {
  const cache = await caches.open(CACHE_NAME);

  // Get all cached URLs
  const keys = await cache.keys();

  // If at limit, delete oldest
  if (keys.length >= MAX_ITEMS) {
    console.log('Cache full, deleting oldest entry');
    await cache.delete(keys[0]);
  }

  // Add new entry
  await cache.put(request, response);
}

async function limitedCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) {
    await cacheWithLimit(request, response.clone());
  }

  return response;
}
```

**9. Strategy Selection Decision Tree:**

```javascript
/*
REQUEST TYPE DECISION TREE:

├─ Mutation (POST/PUT/DELETE)?
│  └─ NETWORK ONLY (never cache)
│
├─ Real-time data? (stocks, scores, chat)
│  └─ NETWORK ONLY
│
├─ HTML navigation?
│  ├─ App shell? → CACHE ONLY (pre-cached)
│  └─ Content pages? → NETWORK FIRST
│
├─ Static assets? (images, fonts, videos)
│  └─ CACHE FIRST
│
├─ Versioned assets? (app.v2.js, styles.abc123.css)
│  └─ CACHE FIRST (immutable)
│
├─ API data?
│  ├─ User-specific? → NETWORK FIRST
│  ├─ Public data? → STALE-WHILE-REVALIDATE
│  └─ Analytics? → NETWORK ONLY
│
└─ Default
   └─ NETWORK FIRST (safe default)
*/

function selectStrategy(request) {
  const url = new URL(request.url);

  // Check each condition
  if (request.method !== 'GET') return 'network-only';
  if (url.pathname.includes('/live/')) return 'network-only';
  if (request.mode === 'navigate' && url.pathname === '/') return 'cache-only';
  if (request.mode === 'navigate') return 'network-first';
  if (request.destination === 'image') return 'cache-first';
  if (/\.(js|css)$/.test(url.pathname) && /\.[a-f0-9]{8,}\./.test(url.pathname)) {
    return 'cache-first'; // Versioned assets
  }
  if (url.pathname.startsWith('/api/user/')) return 'network-first';
  if (url.pathname.startsWith('/api/')) return 'stale-while-revalidate';

  return 'network-first'; // Safe default
}
```

<details>
<summary><strong>🔍 Deep Dive: Cache Strategy Performance Analysis & Browser Internals</strong></summary>

**Performance Comparison of Caching Strategies:**

Let's analyze the real-world performance characteristics of each strategy using Chrome DevTools and production metrics.

**1. Cache First Performance:**

```javascript
// Detailed performance measurements

async function cacheFirstWithMetrics(request) {
  const cacheStart = performance.now();
  const cached = await caches.match(request);
  const cacheTime = performance.now() - cacheStart;

  if (cached) {
    console.log(`Cache hit in ${cacheTime.toFixed(2)}ms`);

    // Cache hit breakdown:
    // - Cache API lookup: ~2-5ms
    // - Response clone: ~1-3ms
    // - Total: ~3-8ms (vs 200-500ms network!)

    return cached;
  }

  console.log(`Cache miss in ${cacheTime.toFixed(2)}ms, fetching...`);

  const fetchStart = performance.now();
  const response = await fetch(request);
  const fetchTime = performance.now() - fetchStart;

  console.log(`Network fetch in ${fetchTime.toFixed(2)}ms`);

  // Cache miss breakdown:
  // - Cache lookup: ~2-5ms (miss)
  // - Network request: ~100-500ms (varies by latency)
  // - DNS: ~20-120ms (if not cached)
  // - TCP: ~40-200ms (if not reused)
  // - TLS: ~40-200ms (if not resumed)
  // - Server: ~50-300ms
  // - Download: ~10-100ms

  if (response.ok) {
    const cacheStoreStart = performance.now();
    const cache = await caches.open('static-v1');
    await cache.put(request, response.clone());
    const cacheStoreTime = performance.now() - cacheStoreStart;

    console.log(`Cached in ${cacheStoreTime.toFixed(2)}ms`);
    // Cache storage: ~5-15ms
  }

  return response;
}

// Production benchmark results:
// ┌────────────────┬──────────┬──────────┬──────────┐
// │ Metric         │ Cache    │ Network  │ Speedup  │
// ├────────────────┼──────────┼──────────┼──────────┤
// │ First load     │ N/A      │ 380ms    │ N/A      │
// │ Second load    │ 6ms      │ 420ms    │ 70x      │
// │ Offline        │ 5ms      │ FAIL     │ ∞        │
// │ Slow 3G        │ 7ms      │ 2,400ms  │ 343x     │
// │ Fast 3G        │ 6ms      │ 680ms    │ 113x     │
// │ 4G             │ 5ms      │ 310ms    │ 62x      │
// └────────────────┴──────────┴──────────┴──────────┘
```

**2. Network First with Timeout:**

```javascript
// Sophisticated network-first with timeout + cache fallback

async function networkFirstAdvanced(request, timeout = 3000) {
  const cache = await caches.open('dynamic-v1');

  // Create AbortController for timeout
  const controller = new AbortController();
  const signal = controller.signal;

  // Set up timeout
  const timeoutId = setTimeout(() => {
    console.log(`Network timeout after ${timeout}ms, falling back to cache`);
    controller.abort();
  }, timeout);

  try {
    const networkStart = performance.now();

    const response = await fetch(request, { signal });

    clearTimeout(timeoutId);

    const networkTime = performance.now() - networkStart;
    console.log(`Network success in ${networkTime.toFixed(2)}ms`);

    // Cache in background (don't block response)
    if (response.ok) {
      cache.put(request, response.clone()).catch(err => {
        console.warn('Background cache failed:', err);
      });
    }

    return response;

  } catch (error) {
    clearTimeout(timeoutId);

    // Check if timeout or real network error
    if (error.name === 'AbortError') {
      console.log('Request aborted due to timeout');
    } else {
      console.log('Network error:', error.message);
    }

    // Fallback to cache
    const cachedStart = performance.now();
    const cached = await cache.match(request);

    if (cached) {
      const cacheTime = performance.now() - cachedStart;
      console.log(`Cache fallback in ${cacheTime.toFixed(2)}ms`);

      // Add header to indicate stale content
      const staleResponse = new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...Object.fromEntries(cached.headers.entries()),
          'X-Served-From': 'service-worker-cache',
          'X-Cache-Stale': 'true'
        }
      });

      return staleResponse;
    }

    // No cache, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Performance characteristics:
// Good network (< 200ms):
//   - Serves fresh content: 150-250ms
//   - Cache hit: Never used
//
// Slow network (> timeout):
//   - Timeout after: 3000ms
//   - Fallback to cache: ~5ms
//   - Total: ~3005ms (but shows stale content faster)
//
// Offline:
//   - Immediate error detection: ~50ms
//   - Cache fallback: ~5ms
//   - Total: ~55ms
```

**3. Stale-While-Revalidate Internals:**

```javascript
// Deep dive into SWR implementation

async function staleWhileRevalidateAdvanced(request) {
  const cache = await caches.open('swr-v1');

  // Check cache age to decide strategy
  const cached = await cache.match(request);
  let cacheAge = Infinity;

  if (cached) {
    const cachedTime = cached.headers.get('sw-cached-at');
    if (cachedTime) {
      cacheAge = Date.now() - parseInt(cachedTime, 10);
    }
  }

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        // Add cache metadata
        const responseWithMeta = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'sw-cached-at': Date.now().toString(),
            'sw-revalidated': 'true'
          }
        });

        // Update cache
        await cache.put(request, responseWithMeta.clone());

        console.log('Background revalidation complete');

        // Notify clients of new content
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            url: request.url,
            age: cacheAge
          });
        });

        return responseWithMeta;
      }
      return response;
    })
    .catch(error => {
      console.log('Background fetch failed:', error);
      return null;
    });

  // Return cached immediately if available
  if (cached) {
    console.log(`Serving stale (age: ${Math.round(cacheAge / 1000)}s)`);
    return cached;
  }

  // No cache, wait for network
  console.log('No cache, waiting for network');
  const networkResponse = await fetchPromise;

  if (!networkResponse) {
    throw new Error('No cache and network failed');
  }

  return networkResponse;
}

// Timeline visualization:
// t=0ms:    Request arrives
// t=2ms:    Cache lookup starts
// t=5ms:    Cache found (age: 2 hours)
// t=5ms:    Return stale cache ← USER SEES THIS FAST!
// t=5ms:    Network fetch starts (in background)
// t=180ms:  Network returns
// t=185ms:  Cache updated
// t=186ms:  Clients notified
//
// User experience:
// - Instant page load (5ms from cache)
// - Fresh data on next load
// - No loading spinners!
```

**4. Browser Cache Storage Architecture:**

```javascript
// How Cache API is implemented in browsers

// Cache Storage Architecture:
// ┌─────────────────────────────────────────────┐
// │           ServiceWorkerGlobalScope          │
// │                                             │
// │  caches.open('v1') ────────────────────┐   │
// │                                         ↓   │
// │  ┌──────────────────────────────────────┐  │
// │  │      CacheStorage (per origin)       │  │
// │  │                                      │  │
// │  │  ┌────────────┐  ┌────────────┐    │  │
// │  │  │ Cache 'v1' │  │ Cache 'v2' │    │  │
// │  │  │            │  │            │    │  │
// │  │  │ Request →  │  │ Request →  │    │  │
// │  │  │ Response   │  │ Response   │    │  │
// │  │  └────────────┘  └────────────┘    │  │
// │  └──────────────────────────────────────┘  │
// │                    ↓                        │
// │         IndexedDB (disk storage)            │
// └─────────────────────────────────────────────┘

// Cache.match() internals:
class Cache {
  constructor(name) {
    this.name = name;
    this.db = indexedDB.open(`cache_${name}`, 1);
  }

  async match(request, options = {}) {
    // 1. Normalize request to string key
    const key = await this.createCacheKey(request, options);

    // 2. Lookup in IndexedDB
    const tx = this.db.transaction(['responses'], 'readonly');
    const store = tx.objectStore('responses');
    const dbRequest = store.get(key);

    const entry = await new Promise((resolve, reject) => {
      dbRequest.onsuccess = () => resolve(dbRequest.result);
      dbRequest.onerror = () => reject(dbRequest.error);
    });

    if (!entry) return undefined;

    // 3. Deserialize Response from stored data
    return this.deserializeResponse(entry);
  }

  async createCacheKey(request, options) {
    // Default: URL + method
    let key = `${request.method}:${request.url}`;

    // Check Vary header for additional keys
    if (!options.ignoreVary) {
      const varyHeader = await this.getVaryHeader(request);
      if (varyHeader) {
        const varyKeys = varyHeader.split(',').map(h => {
          const header = h.trim().toLowerCase();
          return `${header}:${request.headers.get(header) || ''}`;
        }).join(';');

        key += `:vary:${varyKeys}`;
      }
    }

    // Search params handling
    if (options.ignoreSearch) {
      const url = new URL(request.url);
      url.search = '';
      key = `${request.method}:${url.toString()}`;
    }

    return key;
  }

  async deserializeResponse(entry) {
    // Reconstruct Response from stored data
    const { status, statusText, headers, body } = entry;

    return new Response(body, {
      status,
      statusText,
      headers: new Headers(headers)
    });
  }
}

// Cache storage limits by browser:
// ┌──────────┬────────────────┬──────────────────┐
// │ Browser  │ Quota          │ Eviction         │
// ├──────────┼────────────────┼──────────────────┤
// │ Chrome   │ ~10% free disk │ LRU per origin   │
// │ Firefox  │ ~50% free disk │ LRU per origin   │
// │ Safari   │ ~1GB           │ Prompt at 200MB  │
// │ Edge     │ ~10% free disk │ LRU per origin   │
// └──────────┴────────────────┴──────────────────┘

// Check quota:
const quota = await navigator.storage.estimate();
console.log(`Used: ${quota.usage.toLocaleString()} bytes`);
console.log(`Quota: ${quota.quota.toLocaleString()} bytes`);
console.log(`Percent: ${((quota.usage / quota.quota) * 100).toFixed(2)}%`);

// Typical cache entry size:
// - Small JSON (1KB): ~2KB stored (includes headers)
// - Image (100KB): ~100KB stored
// - HTML page (50KB): ~55KB stored
// - Full app (1000 entries): ~50-200MB
```

**5. Cache Versioning Strategy:**

```javascript
// Production-grade cache versioning

const APP_VERSION = '2.1.0';
const CACHES = {
  static: `static-${APP_VERSION}`,
  dynamic: `dynamic-${APP_VERSION}`,
  images: `images-${APP_VERSION}`
};

// Install: Create new versioned caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHES.static).then(cache =>
        cache.addAll(['/app.js', '/styles.css'])
      ),
      caches.open(CACHES.dynamic),
      caches.open(CACHES.images)
    ]).then(() => self.skipWaiting())
  );
});

// Activate: Delete old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names
          .filter(name => !Object.values(CACHES).includes(name))
          .map(oldCache => {
            console.log('Deleting old cache:', oldCache);
            return caches.delete(oldCache);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Multi-cache strategy router
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.match(/\.(js|css)$/)) {
    // Static assets: cache-first from static cache
    event.respondWith(
      caches.match(event.request, { cacheName: CACHES.static })
        .then(cached => cached || fetch(event.request))
    );
  } else if (url.pathname.match(/\.(jpg|png|svg)$/)) {
    // Images: cache-first from images cache
    event.respondWith(
      caches.match(event.request, { cacheName: CACHES.images })
        .then(async (cached) => {
          if (cached) return cached;

          const response = await fetch(event.request);
          const cache = await caches.open(CACHES.images);
          cache.put(event.request, response.clone());
          return response;
        })
    );
  } else {
    // HTML/API: network-first from dynamic cache
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          const cache = await caches.open(CACHES.dynamic);
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Cache upgrade path:
// v1.0.0 → v2.0.0 update:
// 1. SW v2.0.0 installs (creates static-2.0.0, dynamic-2.0.0)
// 2. SW v2.0.0 activates (deletes static-1.0.0, dynamic-1.0.0)
// 3. Clients use new caches
// 4. Old caches garbage collected
//
// Zero-downtime deployment!
```

**6. Request Matching Algorithm:**

```javascript
// How Cache.match() compares requests

async function demonstrateCacheMatching() {
  const cache = await caches.open('test');

  // Store a request
  const request1 = new Request('https://api.com/users?page=1');
  const response1 = new Response('data');
  await cache.put(request1, response1);

  // Test 1: Exact match (✅ matches)
  const match1 = await cache.match('https://api.com/users?page=1');
  console.log('Exact URL:', match1 !== undefined); // true

  // Test 2: Different query params (❌ no match)
  const match2 = await cache.match('https://api.com/users?page=2');
  console.log('Different params:', match2 !== undefined); // false

  // Test 3: Ignore search params (✅ matches with option)
  const match3 = await cache.match('https://api.com/users?page=2', {
    ignoreSearch: true
  });
  console.log('Ignore search:', match3 !== undefined); // true

  // Test 4: Case sensitivity (❌ no match - URLs are case-sensitive)
  const match4 = await cache.match('https://api.com/Users?page=1');
  console.log('Different case:', match4 !== undefined); // false

  // Test 5: Vary header matching
  const request5 = new Request('https://api.com/data', {
    headers: { 'Accept-Language': 'en-US' }
  });
  const response5 = new Response('English data', {
    headers: { 'Vary': 'Accept-Language' }
  });
  await cache.put(request5, response5);

  // Same URL, different Accept-Language (❌ no match due to Vary)
  const match5 = await cache.match(
    new Request('https://api.com/data', {
      headers: { 'Accept-Language': 'fr-FR' }
    })
  );
  console.log('Different Vary header:', match5 !== undefined); // false

  // Same URL, same Accept-Language (✅ matches)
  const match6 = await cache.match(
    new Request('https://api.com/data', {
      headers: { 'Accept-Language': 'en-US' }
    })
  );
  console.log('Same Vary header:', match6 !== undefined); // true
}

// Matching algorithm summary:
// 1. URL must match exactly (protocol + host + path + search)
// 2. Method must match (GET vs POST)
// 3. Vary headers must match (if present in response)
// 4. Options can modify matching:
//    - ignoreSearch: Ignore query parameters
//    - ignoreMethod: Ignore HTTP method
//    - ignoreVary: Ignore Vary header
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Optimizing E-Commerce Product Images</strong></summary>

**Scenario**: Your e-commerce site serves 50,000+ product images. Users complain that browsing is slow, especially on repeat visits. Analytics show high bounce rates (35%) on category pages. Images are re-downloaded on every page visit, wasting bandwidth and slowing load times.

**Production Metrics (Before Fix):**
- Average page load time: 4.2 seconds
- Image load time: 2.8 seconds (67% of total)
- Bandwidth per session: 15MB
- Bounce rate: 35%
- Repeat visitor load time: 4.1 seconds (no improvement!)
- Monthly bandwidth cost: $8,400
- User complaints: "Site is too slow"

**The Problem Code:**

```javascript
// ❌ BAD: No caching strategy for images

self.addEventListener('fetch', (event) => {
  // No caching at all - images re-downloaded every time!
  event.respondWith(fetch(event.request));
});

// Or even worse:
self.addEventListener('fetch', (event) => {
  // Network-first for everything (slow!)
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Problems:
// 1. Images downloaded on every page view
// 2. No offline support
// 3. Slow on poor connections
// 4. High bandwidth costs
// 5. Poor user experience
```

**Debugging Process:**

**Step 1: Analyze Network Waterfall**

```javascript
// Chrome DevTools → Network tab analysis:

// Category page (50 products):
// ├─ HTML: 45KB, 280ms
// ├─ CSS: 120KB, 180ms
// ├─ JS: 450KB, 320ms
// └─ Images (50x):
//    ├─ product1.jpg: 85KB, 420ms ⚠️
//    ├─ product2.jpg: 92KB, 380ms ⚠️
//    ├─ product3.jpg: 78KB, 450ms ⚠️
//    └─ ... (47 more)
//    Total: 4.2MB, 2.8s average ⚠️

// On repeat visit (same category):
// └─ Images: Still downloading all 50 again! ❌
//    Cache-Control: private, max-age=3600
//    But browser cache cleared or ignored!

// Aha! Images should be cached by service worker
```

**Step 2: Identify Image Request Patterns**

```javascript
// Analyze image URLs and usage patterns

// Product images:
// - Thumbnails: /images/products/thumb_123.jpg (30-50KB)
// - Full size: /images/products/full_123.jpg (100-200KB)
// - Total unique images: ~50,000
// - Images per page: 20-50
// - Image reuse: High (same products on multiple pages)

// User behavior:
// - Average session: 5-8 pages
// - 70% of images seen multiple times per session
// - 40% of users return within 7 days
// - Same images likely viewed again

// Conclusion: Cache-first strategy would be perfect!
```

**Step 3: Implement Cache-First for Images**

```javascript
// ✅ FIXED: Cache-first strategy for images

const CACHE_VERSION = 'v1';
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const MAX_IMAGE_CACHE_SIZE = 100; // Limit to 100 images

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache images from our domain
  if (url.origin === location.origin &&
      url.pathname.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
    event.respondWith(cacheFirstImages(event.request));
  }
});

async function cacheFirstImages(request) {
  const cache = await caches.open(IMAGE_CACHE);

  // Try cache first
  const cached = await cache.match(request);

  if (cached) {
    console.log('Image from cache:', request.url);
    return cached;
  }

  // Cache miss, fetch from network
  console.log('Image from network:', request.url);

  try {
    const response = await fetch(request);

    if (response.ok) {
      // Manage cache size before adding
      await manageCacheSize(cache, MAX_IMAGE_CACHE_SIZE);

      // Cache the image
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Image fetch failed:', error);

    // Return placeholder image
    return caches.match('/images/placeholder.png');
  }
}

// Limit cache size (LRU eviction)
async function manageCacheSize(cache, maxSize) {
  const keys = await cache.keys();

  if (keys.length >= maxSize) {
    // Delete oldest entry (first in array)
    console.log('Cache full, evicting oldest image');
    await cache.delete(keys[0]);
  }
}

// Initial result:
// - First visit: 4.2s (same as before)
// - Second visit: 1.8s (57% faster!) ✅
// - Third+ visits: 1.5s (64% faster!) ✅
// - Bandwidth saved: 4.2MB → 0.5MB per session ✅
```

**Step 4: Add Progressive Enhancement**

```javascript
// ✅ EVEN BETTER: Smart caching with priorities

const CACHE_VERSION = 'v2';
const CACHES = {
  critical: `critical-images-${CACHE_VERSION}`,  // Logo, icons
  products: `product-images-${CACHE_VERSION}`,    // Product photos
  usergen: `user-images-${CACHE_VERSION}`         // User uploads
};

const CACHE_LIMITS = {
  critical: 50,    // Small, essential images
  products: 200,   // Product images (higher limit)
  usergen: 100     // User-generated content
};

self.addEventListener('install', (event) => {
  // Pre-cache critical images
  event.waitUntil(
    caches.open(CACHES.critical).then(cache =>
      cache.addAll([
        '/images/logo.png',
        '/images/icons/cart.svg',
        '/images/icons/user.svg',
        '/images/placeholder.png'
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!url.pathname.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
    return; // Not an image
  }

  // Route to appropriate cache
  if (url.pathname.includes('/icons/') || url.pathname.includes('/logo')) {
    event.respondWith(cacheOnly(event.request, CACHES.critical));
  } else if (url.pathname.includes('/products/')) {
    event.respondWith(
      cacheFirstWithLimit(
        event.request,
        CACHES.products,
        CACHE_LIMITS.products
      )
    );
  } else if (url.pathname.includes('/user-uploads/')) {
    event.respondWith(
      staleWhileRevalidate(event.request, CACHES.usergen)
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

// Cache-only for critical images (pre-cached)
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  console.warn('Critical image not in cache:', request.url);
  return fetch(request);
}

// Cache-first with size limit
async function cacheFirstWithLimit(request, cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log(`[${cacheName}] Cache hit`);
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    // Check cache size
    const keys = await cache.keys();

    if (keys.length >= maxSize) {
      // Evict oldest
      await cache.delete(keys[0]);
      console.log(`[${cacheName}] Evicted oldest entry`);
    }

    await cache.put(request, response.clone());
    console.log(`[${cacheName}] Cached new image`);
  }

  return response;
}

// Stale-while-revalidate for user content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}
```

**Step 5: Add Smart Preloading**

```javascript
// Preload images in viewport + next page

// In service worker
self.addEventListener('message', (event) => {
  if (event.data.type === 'PRELOAD_IMAGES') {
    const urls = event.data.urls;
    preloadImages(urls);
  }
});

async function preloadImages(urls) {
  const cache = await caches.open(CACHES.products);

  for (const url of urls) {
    const cached = await cache.match(url);

    if (!cached) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('Preloaded:', url);
        }
      } catch (error) {
        console.warn('Preload failed:', url, error);
      }
    }
  }
}

// In page (app.js)
function preloadVisibleImages() {
  const images = Array.from(document.querySelectorAll('img[data-product]'));

  // Get images in viewport + next 10
  const observer = new IntersectionObserver((entries) => {
    const visibleUrls = entries
      .filter(e => e.isIntersecting)
      .map(e => e.target.src);

    if (visibleUrls.length > 0 && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_IMAGES',
        urls: visibleUrls
      });
    }
  }, {
    rootMargin: '200px' // Preload 200px ahead
  });

  images.forEach(img => observer.observe(img));
}

preloadVisibleImages();
```

**Production Metrics (After Fix):**

```javascript
// Before optimization:
// - Average page load: 4.2s
// - Image load time: 2.8s
// - Bandwidth per session: 15MB
// - Bounce rate: 35%
// - Monthly bandwidth cost: $8,400

// After optimization:
// - First visit: 4.0s (5% faster - preload critical) ✅
// - Repeat visit: 1.4s (67% faster!) ✅
// - Image load time: 0.3s (89% faster!) ✅
// - Bandwidth per session: 3.2MB (79% less!) ✅
// - Bounce rate: 18% (49% reduction!) ✅
// - Monthly bandwidth cost: $2,100 (75% reduction!) ✅
// - Offline browsing: Works perfectly ✅
// - User satisfaction: +85% ✅

// Performance breakdown:
// ┌──────────────┬────────┬────────┬──────────┐
// │ Visit Type   │ Before │ After  │ Improve  │
// ├──────────────┼────────┼────────┼──────────┤
// │ First visit  │ 4.2s   │ 4.0s   │ 5%       │
// │ Same page    │ 4.1s   │ 0.8s   │ 80%      │
// │ Next page    │ 3.8s   │ 1.2s   │ 68%      │
// │ Offline      │ FAIL   │ 0.5s   │ ∞        │
// └──────────────┴────────┴────────┴──────────┘

// Cache efficiency:
// - Cache hit rate: 92%
// - Average cache size: 48MB (200 images)
// - Cache hits per session: 35-40 images
// - Network requests saved: 87%
```

**Key Lessons:**

1. **Use cache-first for immutable assets** (images, fonts, videos)
2. **Implement cache size limits** to prevent unbounded growth
3. **Separate caches by priority** (critical vs nice-to-have)
4. **Preload intelligently** (viewport + next page)
5. **Monitor cache hit rates** in production
6. **Calculate ROI** (bandwidth savings, performance gains, UX improvements)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Caching Strategy Selection Matrix</strong></summary>

**Decision Matrix:**

| Content Type | Freshness Need | Network Reliability | Best Strategy |
|-------------|----------------|-------------------|---------------|
| Static assets (JS/CSS) | Low | Any | Cache First |
| Product images | Low | Any | Cache First |
| User avatars | Medium | Any | Stale-While-Revalidate |
| API data (public) | Medium | Good | Stale-While-Revalidate |
| API data (user) | High | Good | Network First |
| Real-time data | Critical | Good | Network Only |
| Analytics | Low | Good | Network Only |
| App shell | None | Any | Cache Only |
| HTML pages | Medium-High | Good | Network First |

**Strategy Comparison:**

```javascript
// Latency comparison (3G network, 400ms RTT):

// Cache First:
// - Cache hit: 5ms ⚡
// - Cache miss: 405ms (5ms cache + 400ms network)
// - Offline: Works ✅
// - Freshness: May be stale ⚠️

// Network First:
// - Online: 400ms
// - Timeout → cache: 3005ms (3s timeout)
// - Offline: 55ms (cache fallback)
// - Freshness: Always fresh when online ✅

// Stale-While-Revalidate:
// - First request: 400ms (network)
// - Second request: 5ms (stale cache) ⚡
// - Background update: 400ms (async)
// - Freshness: Eventually fresh ✅

// Network Only:
// - Online: 400ms
// - Offline: Fails ❌
// - Freshness: Always fresh ✅

// Cache Only:
// - Always: 5ms ⚡
// - Offline: Works ✅
// - Freshness: Never updates ❌
```

**Bandwidth Comparison:**

```javascript
// Typical session (5 pages, slow 3G):

// No caching:
// - Total requests: 150
// - Total bandwidth: 15MB
// - Total time: 45s

// Cache First:
// - First page: 30 requests, 3MB, 9s
// - Pages 2-5: 10 requests each, 0.5MB, 2s
// - Total: 70 requests, 5MB, 17s
// - Savings: 67% bandwidth, 62% time ✅

// Network First (3s timeout):
// - First page: 30 requests, 3MB, 9s
// - Pages 2-5: 30 requests each, 3MB, 6s (timeouts)
// - Total: 150 requests, 15MB, 33s
// - Savings: 0% bandwidth, 27% time ⚠️

// Stale-While-Revalidate:
// - First page: 30 requests, 3MB, 9s
// - Pages 2-5: 30 stale + 30 background, 3MB, 1s
// - Total: 150 requests, 15MB, 13s
// - Savings: 0% bandwidth, 71% time ✅
```

**Recommendation by Use Case:**

```javascript
// E-commerce site
const strategies = {
  '/': 'network-first',              // Homepage (fresh deals)
  '/products/*': 'network-first',    // Product pages (prices change)
  '/api/cart': 'network-only',       // Cart (always fresh)
  '/images/*': 'cache-first',        // Product images (immutable)
  '/static/*': 'cache-first',        // JS/CSS (versioned)
  '/api/reviews': 'stale-revalidate' // Reviews (can be stale)
};

// News site
const strategies = {
  '/': 'network-first',              // Homepage (breaking news)
  '/article/*': 'stale-revalidate',  // Articles (mostly immutable)
  '/api/trending': 'network-first',  // Trending (changes often)
  '/images/*': 'cache-first',        // Article images
  '/api/comments': 'network-first'   // Comments (fresh)
};

// Social media
const strategies = {
  '/feed': 'network-first',          // Feed (always fresh)
  '/profile/*': 'stale-revalidate',  // Profiles (update async)
  '/api/posts': 'network-first',     // Posts (real-time)
  '/avatars/*': 'cache-first',       // Avatars (rarely change)
  '/api/messages': 'network-only'    // Messages (must be fresh)
};
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Caching Strategies</strong></summary>

**Simple Explanation:**

Think of caching strategies like different ways to get your coffee:

**Cache First = "Check the fridge first"**
- You brewed coffee earlier and put it in a thermos
- Check thermos first (super fast!)
- Only make fresh coffee if thermos is empty
- Best for: Things that don't change often (like tea bags)

```javascript
// Check fridge (cache) → If empty, buy from store (network)
const coffee = fridge.has('coffee')
  ? fridge.get('coffee')  // Fast! ⚡
  : buyFromStore('coffee'); // Slow but fresh
```

**Network First = "Always buy fresh, use fridge as backup"**
- Try to buy fresh coffee from the store first
- If store is closed, use yesterday's coffee from fridge
- Best for: Things that should be fresh (like news)

```javascript
// Try store first → If closed, use fridge backup
try {
  const coffee = await buyFromStore('coffee'); // Fresh!
} catch (storeClosed) {
  const coffee = fridge.get('coffee'); // Backup
}
```

**Stale-While-Revalidate = "Drink old coffee while brewing fresh"**
- Give customer yesterday's coffee immediately (fast!)
- Start brewing fresh coffee in background
- Next customer gets fresh coffee
- Best for: Things that can be slightly stale (like avatars)

```javascript
// Serve old coffee now, brew fresh in background
const oldCoffee = fridge.get('coffee');
serveTo(customer, oldCoffee); // Fast! ⚡

// Meanwhile, brew fresh (async)
brewFresh('coffee').then(fresh => {
  fridge.put('coffee', fresh); // Ready for next customer
});
```

**Visual Timeline:**

```
Cache First (fast!):
0ms: Check cache ────────→ 5ms: Found! Return ⚡
                           (No network request!)

Network First (fresh):
0ms: Network request ──→ 400ms: Response ✓
     If fail ──→ Check cache ──→ 405ms: Return

Stale-While-Revalidate (best of both!):
0ms: Check cache ──→ 5ms: Return stale ⚡
0ms: Network request ──→ 400ms: Update cache
     (Next request gets fresh!)
```

**When to Use Each (Simple Rules):**

```javascript
// Images, fonts, CSS → Cache First
// "These don't change often, serve fast!"

// News, prices, user data → Network First
// "These should be fresh when online"

// Avatars, thumbnails → Stale-While-Revalidate
// "Serve fast, update in background"

// Live scores, payments → Network Only
// "Must be real-time, no cache!"
```

</details>

### Resources

- [MDN: Service Worker Caching Strategies](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)
- [Google Workbox: Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview/)
- [Jake Archibald: Caching Best Practices](https://jakearchibald.com/2014/offline-cookbook/)

---
