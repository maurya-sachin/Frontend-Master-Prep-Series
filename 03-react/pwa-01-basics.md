# Progressive Web Apps (PWA) with React

## Question 1: How to build a PWA with React?

### Main Answer

Building a PWA with React involves creating a web application that works offline, loads instantly, and provides an app-like experience on mobile devices. The core components are:

1. **Service Worker**: A JavaScript worker that intercepts network requests and enables offline functionality
2. **Web App Manifest**: A JSON file that describes your app (name, icons, colors, display mode)
3. **HTTPS**: Required for service worker registration and security
4. **Responsive Design**: Mobile-first approach for all device sizes

**Basic implementation flow:**

```javascript
// 1. Create a manifest.json
{
  "name": "My React App",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// 2. Register service worker in React
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed:', error));
  });
}

// 3. Create service-worker.js
const CACHE_NAME = 'v1';
const urlsToCache = ['/', '/index.html', '/styles.css'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

The PWA becomes installable on home screen, works offline, and provides native app-like experience with push notifications and background sync capabilities.

---

### 🔍 Deep Dive: Service Worker Lifecycle & Caching Strategies

#### Service Worker Lifecycle

A service worker has three distinct lifecycle phases:

**1. Registration Phase**
```javascript
// The browser downloads and parses the service worker script
navigator.serviceWorker.register('/service-worker.js', {
  scope: '/' // This worker controls URLs matching this scope
})
.then(registration => {
  console.log('Registration successful:', registration);
  // Check for updates periodically
  setInterval(() => registration.update(), 60000);
})
.catch(error => {
  console.error('Registration failed:', error);
});
```

**2. Installation Phase**
```javascript
self.addEventListener('install', event => {
  console.log('Installing service worker...');

  event.waitUntil(
    caches.open('v1')
      .then(cache => {
        // Pre-cache critical assets
        return cache.addAll([
          '/',
          '/index.html',
          '/styles/main.css',
          '/js/app.js',
          '/images/offline.png'
        ]);
      })
  );

  // Force waiting service worker to become active
  self.skipWaiting();
});
```

**3. Activation Phase**
```javascript
self.addEventListener('activate', event => {
  console.log('Activating service worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old cache versions
          if (cacheName !== 'v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Control all clients immediately
  return self.clients.claim();
});
```

#### Caching Strategies

**Cache-First Strategy** (Best for static assets)
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) return response;

        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Cache successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          const responseClone = response.clone();
          caches.open('v1').then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
      .catch(() => caches.match('/offline.html'))
  );
});
```

**Network-First Strategy** (Best for dynamic content)
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open('v1').then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache on network failure
        return caches.match(event.request)
          .then(response => response || caches.match('/offline.html'));
      })
  );
});
```

**Stale-While-Revalidate Strategy** (Best for APIs)
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version immediately
        const fetchPromise = fetch(event.request)
          .then(response => {
            // Update cache in background
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open('v1').then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });

        // Return cache if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
  );
});
```

#### Workbox Integration for Simplified Management

```javascript
// Using Workbox to abstract complexity
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Configure cache strategies declaratively
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [new workbox.expiration.ExpirationPlugin({maxEntries: 100})]
  })
);

workbox.routing.registerRoute(
  ({request}) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-assets'
  })
);

workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 3
  })
);

// Precache files from build tool
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
```

---

### 🐛 Real-World Scenario: PWA Implementation Issues

#### Issue 1: Cache Invalidation & Version Mismatch

**Problem**: User installs PWA v1, then you deploy v2. Service worker continues serving v1 from cache, and user sees stale UI while API returns v2 data structure.

**Production Metrics**:
- Silent failures: 23% of users encounter API response mismatches
- UX impact: Users see incomplete/broken components
- Duration: Can persist for days if user doesn't refresh

**Debugging Steps**:
```javascript
// Track cache version mismatches in app
async function validateCacheVersion() {
  const cacheNames = await caches.keys();
  const appVersion = window.__APP_VERSION__; // From build process

  const staleCache = cacheNames.find(name =>
    !name.includes(appVersion)
  );

  if (staleCache) {
    console.warn('Stale cache detected:', staleCache);
    // Force update
    navigator.serviceWorker.controller?.postMessage({
      type: 'SKIP_WAITING'
    });
  }
}

// In service worker - listen for version updates
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**Solution**:
```javascript
// Version-aware cache management
const CACHE_VERSION = 'v2'; // Increment on deploys
const CACHE_NAME = `app-${CACHE_VERSION}`;

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          // Delete all old versions
          if (!name.includes(CACHE_VERSION)) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// In React app - check for updates on mount
useEffect(() => {
  const checkForUpdates = async () => {
    const registration = await navigator.serviceWorker.ready;

    // Check every 30 seconds
    const interval = setInterval(async () => {
      await registration.update();
    }, 30000);

    return () => clearInterval(interval);
  };

  checkForUpdates();
}, []);
```

#### Issue 2: Network Timeout in Stale-While-Revalidate

**Problem**: Network requests hang for 30+ seconds, then fail. User sees cached data indefinitely, unaware it's stale.

**Production Metrics**:
- Affected users: 15% on poor 3G connections
- Performance impact: Page load time increases 5-8 seconds
- Data staleness: Users unaware data is 5+ minutes old

**Debugging Steps**:
```javascript
// Monitor network timeouts in service worker
self.addEventListener('fetch', event => {
  const startTime = Date.now();

  event.respondWith(
    Promise.race([
      fetch(event.request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ])
    .then(response => {
      const duration = Date.now() - startTime;
      // Log slow requests
      if (duration > 1000) {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SLOW_REQUEST',
              url: event.request.url,
              duration
            });
          });
        });
      }
      return response;
    })
    .catch(() => caches.match(event.request))
  );
});

// In React app - show staleness indicator
const [dataAge, setDataAge] = useState(null);

useEffect(() => {
  navigator.serviceWorker?.controller?.addEventListener('message', event => {
    if (event.data?.type === 'SLOW_REQUEST') {
      setDataAge(Date.now());
    }
  });
}, []);

return (
  <div>
    {dataAge && (
      <div className="warning">
        ⚠️ Data may be stale (cached)
      </div>
    )}
  </div>
);
```

**Solution**:
```javascript
// Implement network timeout with fallback strategy
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 3, // Fail fast
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 5 * 60, // Cache for 5 minutes
        maxEntries: 50
      }),
      // Track cache staleness
      {
        handlerDidError: async () => {
          const response = await caches.match(event.request);
          if (response) {
            // Attach staleness header
            const headers = new Headers(response.headers);
            headers.append('X-Data-Source', 'cache');
            return new Response(response.body, {
              status: 200,
              headers
            });
          }
        }
      }
    ]
  })
);
```

#### Issue 3: Missing Dependencies in Offline Mode

**Problem**: Service worker serves offline page, but it references external scripts/CSS that aren't cached. Result: Offline page is broken/unstyled.

**Production Metrics**:
- Broken offline experience: 40% of offline users
- Support tickets: "App looks broken offline"
- Session recovery: Users abandon app, try competitor

**Solution**:
```javascript
// Ensure ALL offline page dependencies are pre-cached
const CRITICAL_ASSETS = [
  '/offline.html',
  '/offline.css',
  '/offline.js',
  '/images/offline-logo.png',
  '/fonts/roboto.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('critical-assets').then(cache => {
      return cache.addAll(CRITICAL_ASSETS)
        .catch(err => {
          console.error('Failed to cache critical assets:', err);
          // Alert developer - offline experience is broken
        });
    })
  );
});

// Fallback chain for offline scenarios
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Try cache first
        return caches.match(event.request)
          .then(response => {
            if (response) return response;

            // Fallback based on request type
            if (event.request.destination === 'image') {
              return caches.match('/images/offline-placeholder.png');
            }
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }

            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
```

---

<details>
<summary><strong>⚖️ Trade-offs: PWA vs Native Apps & Caching Strategies</strong></summary>

#### PWA vs Native App Trade-offs

| Aspect | PWA | Native App |
|--------|-----|-----------|
| **Development** | Single codebase (web) | Platform-specific (iOS/Android) |
| **Distribution** | Direct URL link | App Store/Play Store approval (5-10 days) |
| **Installation** | "Add to Home Screen" (2 taps) | Download and install (1-2 minutes) |
| **App Store Visibility** | Limited (no Play Store) | Full discoverability |
| **Offline Capability** | Service Worker (limited) | Native APIs (comprehensive) |
| **Performance** | Good (~80-95% native) | Best (~100%) |
| **Push Notifications** | Web Push API (not iOS) | Full platform support |
| **Camera/GPS** | Limited access | Full access |
| **Hardware Integration** | NFC, Bluetooth (limited) | Full hardware access |
| **Development Cost** | Lower (~$20-50k) | Higher ($50-200k for both platforms) |
| **Update Frequency** | Instant (server-side) | User-initiated (days for approval) |
| **Time to Market** | 1-2 weeks | 4-6 weeks (with store approval) |

**Decision Matrix**:
```
Choose PWA if:
✓ Need fast development (< 3 months)
✓ Limited budget (< $50k)
✓ Web-first users
✓ Frequent updates (daily)
✓ Browser discovery important
✓ Don't need hardware access

Choose Native if:
✓ Need 100% native performance
✓ Hardware integration critical (camera, NFC)
✓ App Store visibility important
✓ User base established on platforms
✓ Enterprise support contracts needed
```

#### Caching Strategy Trade-offs

**Cache-First Strategy**
```
✓ Pros:
  - Best offline performance
  - Minimal network calls
  - Predictable response times

✗ Cons:
  - Users see stale data indefinitely
  - Manual cache invalidation needed
  - Version mismatches with API
  - Security: Can't guarantee latest security patches
```

**Network-First Strategy**
```
✓ Pros:
  - Always get latest data
  - Better security (latest patches)
  - Users never see stale data

✗ Cons:
  - Network dependency
  - Slow on poor connections
  - Fallback to cache is delayed
  - Users wait for network timeout
```

**Stale-While-Revalidate Strategy**
```
✓ Pros:
  - Best user experience (instant + fresh)
  - Background updates
  - Good balance of fresh + fast

✗ Cons:
  - Complex implementation
  - Background network usage
  - Users may see inconsistent data
  - Higher memory usage (dual requests)
```

**Decision Framework**:
```javascript
// Choose based on content type:

STATIC ASSETS (CSS, JS, Images):
→ Cache-First (long TTL: 1 year)
  Reason: Versioned by build system

API ENDPOINTS:
→ Stale-While-Revalidate (TTL: 5-30 min)
  Reason: Need fresh but user experience matters

USER-CRITICAL DATA (Auth, Cart):
→ Network-First (timeout: 3 sec)
  Reason: Security > performance

DOCUMENTS/ARTICLES:
→ Cache-First (TTL: 1 hour)
  Reason: Unlikely to change frequently
```

---

### 💬 Explain to Junior: Analogies & Interview Template

#### Simple Analogy

Think of a service worker like a **smart convenience store manager at your home**:

1. **First time you visit** (Install): Manager learns which items you always buy. They write down the list in their notebook.

2. **Each time you need something** (Fetch): You ask the manager. If they have it (cache hit), they give it immediately. If not, they call the warehouse (network) to get it.

3. **When warehouse is closed** (Offline): Manager uses what's in their notebook (cache) to serve you.

4. **Updating inventory** (Service worker update): Manager occasionally checks if there's a new inventory list, updates their notebook.

The **caching strategy** is like the manager's policy:
- **Cache-First**: "Always check my notebook first, only call warehouse if missing"
- **Network-First**: "Call warehouse first, only check notebook if warehouse is closed"
- **Stale-While-Revalidate**: "Check my notebook immediately, but also call warehouse to update for next time"

#### Building Your First PWA - Step by Step

**Step 1: Create manifest.json**
```javascript
// What it does: Tells browser "this is an app, not a website"
// Why needed: Makes app installable, gives it identity

{
  "name": "My Chat App",           // Full name shown on install
  "short_name": "Chat",             // Name on home screen
  "start_url": "/",                 // Where to open when launched
  "display": "standalone",          // Hide browser chrome
  "theme_color": "#007bff",         // Status bar color
  "background_color": "#ffffff",    // Splash screen color
  "icons": [...]                    // App icons for different sizes
}

// Then link in index.html:
<link rel="manifest" href="/manifest.json">
```

**Step 2: Register Service Worker**
```javascript
// Do this in your React app (index.js or App.js)

if ('serviceWorker' in navigator) {
  // Only register in production
  if (process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker Ready!'))
      .catch(err => console.log('Service Worker Failed:', err));
  }
}

// Why? Service worker is a separate JavaScript file that runs
// in the background, even when your app is closed
```

**Step 3: Create service-worker.js**
```javascript
// This file is served from your root directory
// It runs separately from your main app

const CACHE = 'app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css'
];

// Install: Prepare for offline (cache important files)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Fetch: Intercept network requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)      // Check cache first
      .then(r => r || fetch(event.request))  // Fall back to network
      .catch(() => caches.match('/offline.html'))  // If everything fails
  );
});
```

#### Interview Answer Template

**Q: "How would you add PWA functionality to a React app?"**

**Template Answer** (2-3 minutes):
```
"To build a PWA with React, I'd do three things:

1. CREATE MANIFEST
   - Make a manifest.json file that describes the app
   - Include icons, colors, start URL, and display mode
   - Link it in index.html with a <link> tag
   - This lets browsers know your site is installable

2. REGISTER SERVICE WORKER
   - In my React app (like useEffect in App.js), I register a service worker
   - Service worker is a JavaScript file that runs in the background
   - It intercepts network requests even when the app is closed

3. IMPLEMENT CACHING STRATEGY
   - For static assets: Cache-first (serve from cache, fallback to network)
   - For APIs: Network-first (try network first, use cache on timeout)
   - For important data: Stale-while-revalidate (serve cache immediately, update in background)

The key benefit is offline functionality - users can use the app even without internet. I'd use Workbox library to simplify the complexity.

For example, I'd cache all images, CSS, JS at install time, so if the network goes down, users still see the app shell. For real-time data, I'd fetch from API but use cached version as fallback."
```

**Follow-up Q: "How do you handle cache invalidation?"**

```
"Great question - this is tricky. Two approaches:

1. VERSION-BASED CACHING
   - Name caches by version: 'app-v1', 'app-v2'
   - In service worker activate, delete old versions
   - On deploy, increment cache name

2. URL VERSIONING
   - Build tools add hash to asset URLs: app.abc123.js
   - Webpack does this automatically
   - Browser treats hash-changed URL as new request
   - Old version stays in cache but isn't used

The key is: never rely on cache busting, always version your caches.
For APIs, use a short TTL (5 minutes) instead of indefinite caching."
```

**Follow-up Q: "What's the difference between Cache-First and Network-First?"**

```
"Two opposite strategies:

CACHE-FIRST (for static assets):
- Check cache FIRST (instant response)
- Only network if NOT in cache
- Perfect for CSS, JS, images (rarely change)
- Fast but users never get updates until cache expires
- Implementation: match cache, then fetch

NETWORK-FIRST (for dynamic content):
- Try NETWORK first (always fresh)
- Only cache if network fails or times out
- Perfect for APIs (data changes often)
- Slower but users get latest data
- Implementation: fetch with timeout, fall back to cache

ANALOGY: Cache-First is like having yesterday's newspaper on your desk (super fast but outdated). Network-First is like calling the news station (slower but accurate). Stale-While-Revalidate is like checking your old newspaper while ordering a new one."
```

---

## Question 2: How to implement offline functionality and service workers?

### Main Answer

Offline functionality with service workers involves caching assets strategically and intercepting network requests to serve cached content when the network is unavailable. The implementation has three main components:

1. **Pre-caching critical assets** during service worker installation
2. **Intercepting fetch requests** to decide cache vs network
3. **Updating the cache** when fresh data becomes available

**Complete offline implementation:**

```javascript
// service-worker.js - Production-ready example

const CACHE_VERSION = 'v1';
const CACHE_NAME = `app-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Assets to cache on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/app.js',
  '/offline.html',
  '/offline-icon.png'
];

// Install: Pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CRITICAL_ASSETS))
      .then(() => console.log('Cache installed'))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== STATIC_CACHE && name !== DYNAMIC_CACHE) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Route requests based on type
self.addEventListener('fetch', event => {
  const {request} = event;
  const {origin, pathname} = new URL(request.url);

  // Skip non-GET, chrome extensions, and external APIs
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // API requests: Network-first
  if (pathname.startsWith('/api/')) {
    event.respondWith(networkFirstFetch(request));
    return;
  }

  // Static assets: Cache-first
  event.respondWith(cacheFirstFetch(request));
});

// Network-first strategy
function networkFirstFetch(request) {
  return fetch(request)
    .then(response => {
      if (!response || response.status !== 200) return response;

      // Cache successful responses
      const clone = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(request, clone);
      });
      return response;
    })
    .catch(() => {
      // Fall back to cache on network error
      return caches.match(request)
        .then(response => response || caches.match('/offline.html'));
    });
}

// Cache-first strategy
function cacheFirstFetch(request) {
  return caches.match(request)
    .then(response => {
      if (response) return response;

      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200) return response;

          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match('/offline.html'));
    });
}
```

In React, handle offline detection:

```javascript
// useOffline.js hook
import {useEffect, useState} from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

// Usage in component
function App() {
  const isOffline = useOffline();

  return (
    <div>
      {isOffline && <div className="offline-banner">Offline Mode</div>}
      <MainContent />
    </div>
  );
}
```

---

### 🔍 Deep Dive: Service Worker Fetch Interception & Advanced Patterns

#### Understanding Fetch Interception

When a service worker is active, every fetch request from your page is intercepted:

```javascript
// Detailed request interception flow:

self.addEventListener('fetch', event => {
  console.log('Intercepted:', event.request.url);
  console.log('Method:', event.request.method);
  console.log('Destination:', event.request.destination); // 'image', 'style', 'script', 'document'

  // You have THREE choices:

  // 1. Let it through to network
  // (don't use event.respondWith, just return)

  // 2. Respond with cache
  event.respondWith(caches.match(event.request));

  // 3. Respond with custom response
  event.respondWith(new Response('Custom response'));
});
```

#### Advanced: Granular Request Routing

```javascript
self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);

  // Route 1: Navigation requests (when user visits URL)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache HTML pages for offline viewing
          const clone = response.clone();
          caches.open('pages').then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)
          .then(r => r || caches.match('/offline.html')))
    );
    return;
  }

  // Route 2: API requests (XMLHttpRequest, fetch to API)
  if (url.pathname.startsWith('/api/')) {
    // Network-first with timeout
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        )
      ])
      .then(response => {
        // Update cache in background
        const clone = response.clone();
        caches.open('api').then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request)
        .then(r => r || errorResponse('API unavailable')))
    );
    return;
  }

  // Route 3: Images (cache-first, with expiration)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) return response;

          return fetch(request).then(response => {
            if (!response.ok) return response;

            const clone = response.clone();
            caches.open('images').then(cache => cache.put(request, clone));
            return response;
          });
        })
        .catch(() => new Response(placeholderImage(), {
          headers: {'Content-Type': 'image/svg+xml'}
        }))
    );
    return;
  }

  // Route 4: Style and Script (cache-first)
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then(r => r || fetch(request))
    );
    return;
  }

  // Default: Pass through
  event.respondWith(fetch(request));
});

function errorResponse(message) {
  return new Response(JSON.stringify({error: message}), {
    status: 503,
    headers: {'Content-Type': 'application/json'}
  });
}

function placeholderImage() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect fill="#ddd" width="200" height="200"/>
      <text x="50%" y="50%" fill="#999">Offline</text>
    </svg>
  `;
}
```

#### Background Sync for Offline Mutations

When user is offline and tries to POST/PUT/DELETE, queue it for later:

```javascript
// In React component - intercept mutations when offline
async function saveDataOffline(data) {
  try {
    // Try to POST to API
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'}
    });

    if (!response.ok) throw new Error('API error');
    return response.json();
  } catch (error) {
    // Network error - queue for later
    if (!navigator.onLine) {
      await queueForSync('post-item', data);
      return {queued: true, data};
    }
    throw error;
  }
}

// Queue in IndexedDB
async function queueForSync(tag, data) {
  const db = await openDB('sync-queue');
  const tx = db.transaction('queue', 'readwrite');

  tx.store.add({
    tag,
    data,
    timestamp: Date.now(),
    attempts: 0
  });

  await tx.done;
}

// Service Worker - sync queued items when online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  const db = await openDB('sync-queue');
  const items = await db.getAll('queue');

  for (const item of items) {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        await db.delete('queue', item.id);
      }
    } catch (error) {
      // Retry later
      item.attempts++;
      if (item.attempts < 3) {
        await db.put('queue', item);
      }
    }
  }
}
```

#### Workbox Advanced Patterns

```javascript
// Using Workbox for sophisticated caching

import {registerRoute, NavigationRoute} from 'workbox-routing';
import {CacheFirst, NetworkFirst, StaleWhileRevalidate} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';
import {precacheAndRoute} from 'workbox-precaching';

// Precache build artifacts
precacheAndRoute(self.__WB_MANIFEST);

// Static assets: Cache with expiration
registerRoute(
  ({request}) =>
    request.destination === 'image' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// API: Network-first with fallback
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
);

// HTML pages: Stale-while-revalidate
registerRoute(
  ({request}) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'pages'
  })
);

// CSS/JS: Stale-while-revalidate
registerRoute(
  ({request}) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'assets'
  })
);
```

---

### 🐛 Real-World Scenario: Offline Sync Failures & Cache Corruption

#### Issue 1: Partial Offline Sync Causing Data Loss

**Problem**: User creates item offline, app queues it, goes online. Sync starts but browser closes mid-request. Item never syncs, data lost.

**Production Metrics**:
- Data loss rate: 8-12% of offline-created items
- User frustration: "My changes disappeared!"
- Support tickets: "Lost data, account corrupted"

**Debugging Steps**:
```javascript
// Monitor sync failures in detail
const syncQueue = new Map();

async function saveOffline(data) {
  const id = generateUID();
  syncQueue.set(id, {
    data,
    status: 'pending',
    timestamp: Date.now(),
    attempts: 0
  });

  // Persist to IndexedDB immediately
  const db = await openDB('sync-queue');
  await db.add('queue', {id, ...syncQueue.get(id)});

  // Log to monitoring service
  analytics.track('offline_item_queued', {
    itemId: id,
    timestamp: Date.now()
  });

  return {queued: true, id};
}

// In service worker - detailed sync tracking
async function syncWithTracking() {
  const db = await openDB('sync-queue');
  const items = await db.getAll('queue');

  for (const item of items) {
    const startTime = performance.now();

    try {
      const response = await fetchWithTimeout('/api/items', {
        method: 'POST',
        body: JSON.stringify(item.data),
        signal: AbortSignal.timeout(5000) // Fail fast
      }, 5000);

      if (response.ok) {
        // SUCCESS: Remove from queue
        await db.delete('queue', item.id);

        // Notify clients about success
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              itemId: item.id,
              duration: performance.now() - startTime
            });
          });
        });
      } else {
        // API rejected - don't retry
        await db.delete('queue', item.id);

        // Notify client of failure
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_FAILED',
              itemId: item.id,
              status: response.status,
              reason: response.statusText
            });
          });
        });
      }
    } catch (error) {
      // Network error - retry with backoff
      item.attempts++;
      item.nextRetry = Date.now() + (Math.pow(2, item.attempts) * 1000);

      await db.put('queue', item);

      // Notify client
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_RETRY',
            itemId: item.id,
            attempt: item.attempts,
            nextRetryIn: item.nextRetry - Date.now()
          });
        });
      });
    }
  }
}
```

**Solution**:
```javascript
// Atomic sync with confirmation

async function atomicSync(item) {
  // 1. Create transaction
  const txId = generateUID();
  const db = await openDB('sync-queue');

  // 2. Mark as "in-progress"
  item.txId = txId;
  item.status = 'syncing';
  await db.put('queue', item);

  // 3. Attempt sync with timeout
  try {
    const response = await fetchWithTimeout(
      '/api/items',
      {
        method: 'POST',
        body: JSON.stringify(item.data),
        headers: {
          'X-TX-ID': txId // Server uses this to prevent duplicates
        }
      },
      5000
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // 4. Confirm deletion only after server confirms
    const result = await response.json();
    if (result.txId === txId) {
      await db.delete('queue', item.id);
      return {success: true, serverId: result.id};
    }
  } catch (error) {
    // 5. Leave item in queue, retry next sync
    item.status = 'pending';
    item.error = error.message;
    await db.put('queue', item);
    throw error;
  }
}

// Server-side idempotency (Node.js example)
const seenTransactions = new Map(); // Or Redis in production

app.post('/api/items', (req, res) => {
  const txId = req.headers['x-tx-id'];

  // Check if we've seen this transaction before
  if (seenTransactions.has(txId)) {
    return res.json({
      txId,
      id: seenTransactions.get(txId),
      duplicate: true
    });
  }

  // Process request...
  const item = db.create(req.body);

  // Remember this transaction
  seenTransactions.set(txId, item.id);

  res.json({txId, id: item.id});
});
```

#### Issue 2: Cache Corruption from Concurrent Requests

**Problem**: Two tabs open same app. Tab 1 caches outdated API response. Tab 2 shows stale data. Both tabs keep refreshing, never converging on fresh data.

**Production Metrics**:
- Affected: 15% of multi-tab users
- Duration: 2-5 minutes of data inconsistency
- Impact: User confusion, potential form submissions with wrong data

**Solution**:
```javascript
// Cache versioning with request deduplication

const pendingRequests = new Map();

async function fetchWithDedup(url, options) {
  // If request is already in-flight, wait for it
  const key = `${url}:${JSON.stringify(options)}`;

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Fetch and cache result
  const promise = fetch(url, options)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .finally(() => pendingRequests.delete(key));

  pendingRequests.set(key, promise);
  return promise;
}

// Use in React
function useAPI(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithDedup(url)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [url]);

  return {data, loading};
}
```

</details>

---

<details>
<summary><strong>⚖️ Trade-offs: Offline-First vs Online-First Architecture</strong></summary>

#### Design Decision Matrix

| Aspect | Offline-First | Online-First |
|--------|---------------|-------------|
| **Complexity** | High (queuing, sync) | Low (simple caching) |
| **Consistency** | Eventually consistent | Immediate consistency |
| **User Experience** | Works everywhere | Limited offline |
| **Storage** | IndexedDB + Cache API | Cache API only |
| **Backend Sync** | Server handles conflict resolution | No conflicts |
| **Development Time** | 4-6 weeks | 1-2 weeks |
| **Testing Complexity** | Complex (many states) | Simple |
| **Battery Impact** | Higher (background sync) | Lower |
| **Data Freshness** | 5-30 min typical | Real-time |

**When to choose Offline-First**:
```
✓ Collaborative apps (Figma, Notion)
✓ Field apps (sales, inspections)
✓ Critical user flows (checkout, forms)
✓ Poor connectivity regions
✓ Mobile-first products
```

**When to choose Online-First**:
```
✓ Real-time data critical (trading, dashboards)
✓ Conflict resolution complex
✓ Simple CRUD operations
✓ Team small, features many
✓ Single-player apps
```

#### Sync Strategy Comparison

```javascript
// Strategy 1: Pessimistic (Online-first)
// Always assume online, sync failures are errors

async function createItem(data) {
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    throw error; // User sees error, must retry manually
  }
}

// Pro: Simple, no conflicts, always consistent
// Con: Fails completely offline, users must retry

// Strategy 2: Optimistic (Offline-friendly)
// Assume success, queue failures for retry

async function createItem(data) {
  const id = generateUID();

  // Show optimistically (assume success)
  addItemToUI({...data, id});

  // Try to sync in background
  fetch('/api/items', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .catch(() => {
    // Queue for retry
    queueForSync('create-item', {id, data});
    showNotification('Saved offline, will sync when online');
  });

  return id;
}

// Pro: Works offline, instant feedback
// Con: More complex, potential conflicts

// Strategy 3: Hybrid (Recommended for most apps)
// Sync critical operations pessimistically, non-critical optimistically

async function createItem(data) {
  if (navigator.onLine) {
    // Online: sync pessimistically (wait for response)
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  } else {
    // Offline: optimistic (queue immediately)
    const id = generateUID();
    addItemToUI({...data, id});
    await queueForSync('create-item', {id, data});
    return {id, synced: false};
  }
}

// Pro: Best UX online, still works offline
// Con: Slightly more complex than pure strategies
```

---

### 💬 Explain to Junior: Offline Patterns & Interview Template

#### Simple Analogy

Think of offline functionality like **a reliable librarian at a remote location**:

1. **First visit** (Install): Librarian pre-orders books they know you'll want. These arrive and sit on your shelf.

2. **When you ask for a book** (Fetch):
   - **Available on shelf** (cache hit): Librarian gives it instantly
   - **Not on shelf** (cache miss): Librarian calls warehouse (network) to get it
   - **Warehouse is closed** (offline): "I have this book from last time, want it instead?"

3. **Multiple requests at once** (Concurrency): Librarian keeps a list so they don't order the same book twice

4. **Writing notes offline** (Background sync): You write notes, leave with librarian. When warehouse reopens, librarian mails them for you.

#### Building Offline Features - Practical Steps

**Step 1: Add Offline Banner**
```javascript
// Tell users when they're offline

import {useState, useEffect} from 'react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return !isOnline && (
    <div className="offline-banner">
      📡 You're offline. Changes will sync when online.
    </div>
  );
}
```

**Step 2: Queue Mutations When Offline**
```javascript
// When user tries to save data offline, queue it

async function handleSave(data) {
  if (!navigator.onLine) {
    // Offline: queue it
    await queueForSync('save-item', data);
    showNotification('Saved offline, will sync when online');
    return;
  }

  // Online: save immediately
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showNotification('Saved successfully!');
  } catch (error) {
    showNotification('Save failed, will retry offline');
    await queueForSync('save-item', data);
  }
}
```

**Step 3: Sync When Online**
```javascript
// When user comes back online, sync queued items

useEffect(() => {
  const handleOnline = async () => {
    // User came back online
    await syncQueue();
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);

async function syncQueue() {
  const items = await getQueuedItems();

  for (const item of items) {
    try {
      const response = await fetch('/api/items', {
        method: item.method || 'POST',
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        await removeFromQueue(item.id);
        showNotification('Offline changes synced!');
      }
    } catch (error) {
      // Will retry on next online event
      console.log('Sync will retry', error);
    }
  }
}
```

#### Interview Answer Template

**Q: "How do you handle offline functionality in a React PWA?"**

**Answer** (2-3 minutes):
```
"Offline functionality involves three parts:

1. PRE-CACHE CRITICAL ASSETS
   - During service worker install, cache the app shell
   - Cache HTML, CSS, JS, and essential images
   - This lets app load even without network

2. INTERCEPT NETWORK REQUESTS
   - Service worker intercepts fetch requests
   - For static assets: serve from cache (fast)
   - For APIs: try network first, fall back to cache if offline

3. QUEUE MUTATIONS OFFLINE
   - When user tries to POST/PUT/DELETE offline, queue it
   - Store in IndexedDB so it survives page reload
   - When user comes back online, sync queued items
   - Use transaction IDs to prevent duplicates

Example: User writing a message offline. App saves it locally, shows 'pending'. When online, service worker syncs to server. Once server confirms, remove from queue.

The tricky part is handling conflicts - if user edits something offline and someone else edits it online, we need a strategy. Usually last-write-wins or merge the changes."
```

**Follow-up Q: "What problems can occur with offline sync?"**

```
"Good question - three main issues:

1. DATA LOSS
   - If browser closes before syncing, queued item is lost
   - Solution: Use IndexedDB for persistent storage
   - Mark items as 'syncing' to track in-flight requests

2. DUPLICATES
   - Network fails after server accepts but before response
   - Server doesn't know request already succeeded
   - Solution: Use transaction IDs (idempotent requests)
   - Server checks if it's seen this transaction before

3. CONFLICTS
   - User A edits offline, User B edits online
   - A's offline change wins when syncing (stale)
   - Solution: Check timestamp, use merge strategies
   - Or: conflict resolution on client (ask user to review)

The key is: design your API for offline-first, not as an afterthought."
```

---

## Additional Resources & Patterns

### Manifest.json Complete Example

```json
{
  "name": "My React Progressive Web App",
  "short_name": "MyApp",
  "description": "A complete offline-capable application",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#007bff",
  "background_color": "#ffffff",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["productivity"],
  "screenshots": [
    {
      "src": "/screenshots/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/screenshot2.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Workbox Configuration

```javascript
// workbox.config.js for use with webpack or other build tools

module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{js,css,html,woff2}'
  ],
  globIgnores: [
    '**/node_modules/**/*',
    '**/*.map'
  ],
  swDest: 'build/service-worker.js',
  clientsClaim: true,
  skipWaiting: true,
  cacheId: 'myapp-v1',
  offlineGoogleAnalytics: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300
        }
      }
    }
  ]
};
```

</details>
