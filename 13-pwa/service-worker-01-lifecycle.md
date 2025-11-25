# Service Worker Lifecycle

> **Focus**: Progressive Web Apps fundamentals and advanced concepts

---

## Question 1: What is the Service Worker lifecycle and how do install, activate, and fetch events work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Microsoft, Twitter, Airbnb

### Question
Explain the Service Worker lifecycle phases (install, activate, fetch) and when each event occurs.

### Answer

A Service Worker is a programmable network proxy that sits between your web app and the network. It follows a specific lifecycle to ensure smooth updates and caching.

**Lifecycle Phases:**

1. **Registration** - Browser downloads the service worker file
2. **Installation** - Service worker installs, cache assets
3. **Activation** - Clean up old caches, take control
4. **Fetch** - Intercept network requests
5. **Update** - Check for new service worker version

### Code Example

**1. Registration:**

```javascript
// In your main app file (app.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New SW found:', newWorker.state);

        newWorker.addEventListener('statechange', () => {
          console.log('SW state changed:', newWorker.state);
          // States: installing → installed → activating → activated
        });
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}
```

**2. Install Event:**

```javascript
// In service worker file (sw.js)
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `my-app-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/logo.png',
  '/offline.html'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Install complete');
        // Force activation (skip waiting)
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Install failed', error);
      })
  );
});

// ✅ GOOD: Cache critical assets during install
// ❌ BAD: Don't cache too many files (slow install)
```

**3. Activate Event:**

```javascript
// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(oldCache => {
              console.log('SW: Deleting old cache:', oldCache);
              return caches.delete(oldCache);
            })
        );
      })
      .then(() => {
        console.log('SW: Activate complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// ✅ GOOD: Delete old caches to free space
// ❌ BAD: Don't delete caches from other apps (filter carefully)
```

**4. Fetch Event:**

```javascript
// Fetch: Intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return; // Let browser handle external requests
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('SW: Serving from cache:', request.url);
          return cachedResponse;
        }

        console.log('SW: Fetching from network:', request.url);
        return fetch(request)
          .then(networkResponse => {
            // Clone response (can only read once)
            const responseClone = networkResponse.clone();

            // Cache successful responses
            if (networkResponse.ok) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }

            return networkResponse;
          })
          .catch(error => {
            console.error('SW: Fetch failed:', error);

            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            throw error;
          });
      })
  );
});
```

**5. Complete Lifecycle Example:**

```javascript
// sw.js - Complete service worker with lifecycle management

const VERSION = 'v2.1.0';
const CACHE_NAME = `app-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

// INSTALL: Precache static assets
self.addEventListener('install', (event) => {
  console.log(`SW ${VERSION}: Installing...`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Activate immediately
      .then(() => console.log(`SW ${VERSION}: Installed`))
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`SW ${VERSION}: Activating...`);

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys()
      .then(names =>
        Promise.all(
          names
            .filter(name => !currentCaches.includes(name))
            .map(name => {
              console.log(`SW: Deleting cache ${name}`);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim()) // Take control immediately
      .then(() => console.log(`SW ${VERSION}: Activated`))
  );
});

// FETCH: Intercept and cache requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Strategy: Cache-first for static assets, network-first for API
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// CACHE-FIRST strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// NETWORK-FIRST strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || Promise.reject(error);
  }
}

// MESSAGE: Communicate with clients
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
```

**6. Client-Side Update Handling:**

```javascript
// app.js - Notify user of updates

let refreshing = false;

navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

async function checkForUpdates() {
  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) return;

  // Check for updates every 60 seconds
  setInterval(() => {
    registration.update();
  }, 60000);

  // Handle update found
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        showUpdateNotification(newWorker);
      }
    });
  });
}

function showUpdateNotification(worker) {
  const updateBanner = document.createElement('div');
  updateBanner.innerHTML = `
    <div class="update-banner">
      New version available!
      <button id="update-btn">Update Now</button>
      <button id="dismiss-btn">Dismiss</button>
    </div>
  `;
  document.body.appendChild(updateBanner);

  document.getElementById('update-btn').addEventListener('click', () => {
    // Tell SW to skip waiting
    worker.postMessage({ action: 'skipWaiting' });
  });

  document.getElementById('dismiss-btn').addEventListener('click', () => {
    updateBanner.remove();
  });
}

checkForUpdates();
```

<details>
<summary><strong>🔍 Deep Dive: Service Worker Lifecycle State Machine & Browser Internals</strong></summary>

**Service Worker State Machine:**

The Service Worker lifecycle follows a strict state machine to ensure predictable behavior and prevent conflicts between versions.

**1. Registration Phase:**

```javascript
// When you call navigator.serviceWorker.register('/sw.js')
// Browser performs these steps:

// Step 1: Check if service worker already exists
const existingSW = await navigator.serviceWorker.getRegistration();

// Step 2: Download sw.js (with HTTP cache bypass if updating)
fetch('/sw.js', { cache: 'no-cache' })
  .then(response => response.text())
  .then(scriptText => {
    // Step 3: Parse JavaScript
    const parsedScript = parseServiceWorkerScript(scriptText);

    // Step 4: Compare with existing SW (byte-by-byte)
    if (existingSW && scriptText === existingSW.scriptText) {
      console.log('SW unchanged, skip installation');
      return existingSW;
    }

    // Step 5: Create new SW instance
    const newSW = new ServiceWorkerGlobalScope(parsedScript);

    // Step 6: Start installation
    newSW.state = 'installing'; // Trigger install event
  });
```

**Complete State Transition Diagram:**

```
Registration
    ↓
[parsed] → (installing) → [installed] → (activating) → [activated] → (redundant)
              ↓              ↓            ↓              ↓
           install       waiting       activate       fetch
            event                       event         events
```

**State Explanations:**

1. **parsed**: Script downloaded and parsed successfully
2. **installing**: `install` event fired, waiting for `event.waitUntil()` promises
3. **installed** (waiting): Install complete, waiting to activate
4. **activating**: `activate` event fired, waiting for `event.waitUntil()` promises
5. **activated**: Fully active, controlling clients
6. **redundant**: Replaced by newer version or failed

**2. Browser's Internal Service Worker Manager:**

```javascript
// Simplified V8/Chromium service worker manager internals

class ServiceWorkerManager {
  constructor() {
    this.registrations = new Map(); // origin → registration
    this.activeWorkers = new Map(); // scope → worker instance
    this.installingWorkers = new Map();
    this.waitingWorkers = new Map();
  }

  async register(scriptURL, options = {}) {
    const scope = options.scope || this.getDefaultScope(scriptURL);
    const origin = new URL(scriptURL).origin;

    // Security checks
    if (!this.isSecureContext()) {
      throw new Error('Service Worker requires HTTPS');
    }

    if (!this.isSameOrigin(scriptURL)) {
      throw new Error('Service Worker must be same-origin');
    }

    // Get or create registration
    let registration = this.registrations.get(`${origin}:${scope}`);

    if (!registration) {
      registration = new ServiceWorkerRegistration(scope);
      this.registrations.set(`${origin}:${scope}`, registration);
    }

    // Download and compare script
    const scriptText = await this.downloadScript(scriptURL);
    const scriptHash = this.hashScript(scriptText);

    if (registration.active?.scriptHash === scriptHash) {
      console.log('SW script unchanged');
      return registration;
    }

    // Create new service worker
    const worker = new ServiceWorker(scriptURL, scriptText, scriptHash);
    this.installWorker(worker, registration);

    return registration;
  }

  installWorker(worker, registration) {
    worker.state = 'installing';
    this.installingWorkers.set(worker.id, worker);
    registration.installing = worker;

    // Create isolated global scope
    const globalScope = this.createWorkerGlobalScope(worker);

    // Dispatch install event
    const installEvent = new ExtendableEvent('install');
    globalScope.dispatchEvent(installEvent);

    // Wait for all promises in event.waitUntil()
    Promise.all(installEvent.promises)
      .then(() => {
        worker.state = 'installed';
        this.installingWorkers.delete(worker.id);
        this.waitingWorkers.set(worker.id, worker);
        registration.waiting = worker;

        // Auto-activate if no active worker
        if (!registration.active) {
          this.activateWorker(worker, registration);
        }
      })
      .catch(error => {
        console.error('SW install failed:', error);
        worker.state = 'redundant';
        this.installingWorkers.delete(worker.id);
      });
  }

  activateWorker(worker, registration) {
    worker.state = 'activating';
    registration.activating = worker;

    const globalScope = this.getWorkerGlobalScope(worker);
    const activateEvent = new ExtendableEvent('activate');
    globalScope.dispatchEvent(activateEvent);

    Promise.all(activateEvent.promises)
      .then(() => {
        worker.state = 'activated';

        // Make old worker redundant
        if (registration.active) {
          registration.active.state = 'redundant';
          this.terminateWorker(registration.active);
        }

        registration.active = worker;
        this.activeWorkers.set(registration.scope, worker);

        // Claim clients if requested
        if (worker.claimRequested) {
          this.claimClients(worker, registration);
        }
      });
  }

  claimClients(worker, registration) {
    const clients = this.getClientsInScope(registration.scope);

    clients.forEach(client => {
      const oldController = client.controller;
      client.controller = worker;

      // Fire controllerchange event
      if (oldController !== worker) {
        client.dispatchEvent(new Event('controllerchange'));
      }
    });
  }
}
```

**3. event.waitUntil() Implementation:**

```javascript
// How ExtendableEvent.waitUntil() works internally

class ExtendableEvent extends Event {
  constructor(type) {
    super(type);
    this.promises = [];
    this.hasExtended = false;
  }

  waitUntil(promise) {
    if (!this.isTrusted) {
      throw new Error('waitUntil can only be called during event dispatch');
    }

    this.hasExtended = true;
    this.promises.push(
      Promise.resolve(promise)
        .catch(error => {
          console.error('waitUntil promise rejected:', error);
          throw error; // Fail the lifecycle phase
        })
    );
  }
}

// Usage in install event
self.addEventListener('install', (event) => {
  // event.waitUntil() extends the event lifetime
  event.waitUntil(
    caches.open('v1').then(cache => {
      // Browser waits for this promise before moving to 'installed' state
      return cache.addAll(['/index.html', '/styles.css']);
    })
  );

  // If we don't call waitUntil(), event completes immediately
  // and browser moves to next state before caching finishes!
});
```

**4. skipWaiting() and clients.claim() Internals:**

```javascript
// skipWaiting() - Forces immediate activation

// WITHOUT skipWaiting():
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('v2').then(cache => cache.addAll([...])));
  // After install completes:
  // - New SW enters 'installed' (waiting) state
  // - Stays waiting until all pages using old SW close
  // - Could wait indefinitely if user keeps tabs open!
});

// WITH skipWaiting():
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v2')
      .then(cache => cache.addAll([...]))
      .then(() => self.skipWaiting()) // ← Skip waiting state
  );
  // After install completes:
  // - skipWaiting() immediately transitions to activating
  // - Activate event fires right away
  // - Old SW terminated even if clients still using it
});

// clients.claim() - Takes control of existing clients

// WITHOUT clients.claim():
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(/* cleanup */));
  // After activation:
  // - New SW is active
  // - But existing pages still use old SW (or no SW)
  // - Only new page loads use new SW
  // - User must refresh to get new SW
});

// WITH clients.claim():
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(/* cleanup */)
      .then(() => self.clients.claim()) // ← Take control now
  );
  // After activation:
  // - New SW immediately controls all clients in scope
  // - All existing pages switch to new SW
  // - No refresh needed (but be careful of version conflicts!)
});

// Common pattern: Use both together
self.addEventListener('install', e => {
  e.waitUntil(/* cache stuff */.then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(/* cleanup */.then(() => self.clients.claim()));
});
```

**5. Update Detection Algorithm:**

```javascript
// How browser checks for service worker updates

// Trigger points for update checks:
// 1. Navigation to in-scope page
// 2. Functional events (push, sync) if 24h passed since last check
// 3. Manual call to registration.update()

async function checkForServiceWorkerUpdate(registration) {
  const existingSW = registration.active;
  const scriptURL = existingSW.scriptURL;

  // Step 1: Fetch SW script with cache bypass
  const response = await fetch(scriptURL, {
    cache: 'no-cache', // ← Force revalidation
    headers: {
      'Service-Worker': 'script' // Special header for SW requests
    }
  });

  const newScriptText = await response.text();

  // Step 2: Byte-by-byte comparison
  const newHash = sha256(newScriptText);
  const oldHash = existingSW.scriptHash;

  if (newHash === oldHash) {
    console.log('SW script unchanged');
    return false; // No update needed
  }

  // Step 3: Parse imported scripts
  const importedScripts = extractImportScripts(newScriptText);

  for (const importURL of importedScripts) {
    const importResponse = await fetch(importURL, { cache: 'no-cache' });
    const importText = await importResponse.text();

    // If ANY imported script changed, trigger update
    if (sha256(importText) !== existingSW.importHashes.get(importURL)) {
      console.log('Imported script changed:', importURL);
      return true; // Trigger update
    }
  }

  console.log('SW updated:', scriptURL);
  return true; // Trigger update
}

// Note: Even changing one character triggers update!
// v1: self.addEventListener('install', e => { /* cache */ });
// v2: self.addEventListener('install', e => { /* cache  */ }); ← Extra space
// Result: Full reinstall triggered
```

**6. Cache Storage Internals:**

```javascript
// How Cache API works under the hood (simplified)

class CacheStorage {
  constructor() {
    // Stored in IndexedDB with prefix "caches"
    this.db = indexedDB.open('CacheStorage', 1);
    this.caches = new Map(); // name → Cache instance
  }

  async open(cacheName) {
    if (this.caches.has(cacheName)) {
      return this.caches.get(cacheName);
    }

    // Create new cache in IndexedDB
    const tx = this.db.transaction(['caches'], 'readwrite');
    const store = tx.objectStore('caches');

    const cache = new Cache(cacheName);
    store.put({ name: cacheName, entries: [] });

    this.caches.set(cacheName, cache);
    return cache;
  }

  async delete(cacheName) {
    const tx = this.db.transaction(['caches'], 'readwrite');
    const store = tx.objectStore('caches');
    await store.delete(cacheName);

    this.caches.delete(cacheName);
    return true;
  }

  async keys() {
    const tx = this.db.transaction(['caches'], 'readonly');
    const store = tx.objectStore('caches');
    const request = store.getAllKeys();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

class Cache {
  constructor(name) {
    this.name = name;
    this.entries = new Map(); // Request → Response
  }

  async put(request, response) {
    // Serialize request as key
    const key = await this.serializeRequest(request);

    // Clone and serialize response
    const serialized = await this.serializeResponse(response);

    // Store in IndexedDB
    this.entries.set(key, serialized);
    await this.persistToIndexedDB(key, serialized);
  }

  async match(request) {
    const key = await this.serializeRequest(request);
    const cached = this.entries.get(key);

    if (!cached) return undefined;

    // Deserialize and return Response
    return this.deserializeResponse(cached);
  }

  async serializeRequest(request) {
    // Key: method + URL + headers (Vary header affects this)
    const url = request.url;
    const method = request.method;
    const varyHeaders = request.headers.get('Vary');

    let key = `${method}:${url}`;

    // Include Vary headers in key
    if (varyHeaders) {
      const headers = varyHeaders.split(',').map(h => {
        const name = h.trim();
        return `${name}:${request.headers.get(name)}`;
      }).join(';');

      key += `:${headers}`;
    }

    return key;
  }

  async serializeResponse(response) {
    // Store: status, headers, body
    const blob = await response.blob();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()),
      body: blob,
      timestamp: Date.now()
    };
  }
}

// Cache size limits (per origin):
// - Chrome: ~10% of free disk space (up to ~80% of total space)
// - Firefox: ~50% of free disk space
// - Safari: ~1GB (prompts user after 500MB)

// Quota API to check available space:
const estimate = await navigator.storage.estimate();
console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
console.log(`${((estimate.usage / estimate.quota) * 100).toFixed(1)}% used`);
```

**7. Multiple Service Workers Conflict Resolution:**

```javascript
// What happens if you register multiple SWs?

// Scenario 1: Different scopes (allowed)
navigator.serviceWorker.register('/sw-app.js', { scope: '/app/' });
navigator.serviceWorker.register('/sw-admin.js', { scope: '/admin/' });

// Result: Both SWs coexist peacefully
// - /app/* requests → sw-app.js
// - /admin/* requests → sw-admin.js
// - /* requests → no service worker

// Scenario 2: Overlapping scopes (most specific wins)
navigator.serviceWorker.register('/sw-root.js', { scope: '/' });
navigator.serviceWorker.register('/sw-api.js', { scope: '/api/' });

// Result: Most specific scope wins
// - /api/users → sw-api.js (more specific)
// - /index.html → sw-root.js (less specific)

// Scenario 3: Same scope (replacement)
navigator.serviceWorker.register('/sw-v1.js', { scope: '/' });
// Later...
navigator.serviceWorker.register('/sw-v2.js', { scope: '/' });

// Result: sw-v2.js replaces sw-v1.js
// - Only one SW can control a scope
// - New registration triggers update check
```

**8. Service Worker Thread Model:**

```javascript
// Service workers run on separate thread from main page

// Main Thread (window)
console.log('Main thread:', self.constructor.name); // "Window"

// Service Worker Thread
self.addEventListener('install', () => {
  console.log('SW thread:', self.constructor.name); // "ServiceWorkerGlobalScope"

  // No access to:
  console.log(window); // ❌ ReferenceError: window is not defined
  console.log(document); // ❌ ReferenceError: document is not defined
  console.log(localStorage); // ❌ ReferenceError: localStorage is not defined

  // Can access:
  console.log(self); // ✅ ServiceWorkerGlobalScope
  console.log(caches); // ✅ CacheStorage
  console.log(indexedDB); // ✅ IDBFactory
  console.log(fetch); // ✅ fetch API
  console.log(clients); // ✅ Clients API
});

// Communication via postMessage
// Main → SW
navigator.serviceWorker.controller.postMessage({ type: 'PING' });

// SW → Main
self.addEventListener('message', (event) => {
  event.source.postMessage({ type: 'PONG' });
});
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Service Worker Update Issues</strong></summary>

**Scenario**: You've deployed a critical bug fix to your PWA, but users report still seeing the old broken version even after multiple refreshes. The service worker isn't updating as expected. Support tickets are piling up, and users are frustrated. Analytics show 78% of users still on the buggy v1.2.3, even though v1.2.4 was deployed 6 hours ago.

**Production Metrics (Before Fix):**
- Users stuck on old version: 78% (390,000 of 500,000 active users)
- Average time to update: 24-72 hours (unacceptable!)
- Support tickets: 127 in 6 hours
- User frustration: High (social media complaints)
- Cache size per user: 45MB (growing)
- Failed update attempts: 23,000+

**The Problem Code:**

```javascript
// ❌ BAD: Service worker doesn't update reliably

// sw.js v1.2.3 (buggy version with broken checkout)
const VERSION = '1.2.3';
const CACHE_NAME = `app-cache-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/app.js',
        '/styles.css'
      ]))
  );
  // ❌ NO skipWaiting() - waits indefinitely!
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME)
          .map(n => caches.delete(n))
      )
    )
  );
  // ❌ NO clients.claim() - doesn't control existing clients!
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
  // ❌ CACHE-FIRST strategy - never updates from network!
});

// app.js (client-side)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
  // ❌ No update checking!
  // ❌ No user notification!
}
```

**Why Users Are Stuck:**

1. **No skipWaiting()**: New SW installs but waits for old tabs to close
2. **No clients.claim()**: Even after activation, old tabs use old SW
3. **Cache-first strategy**: Serves cached sw.js indefinitely
4. **No update checks**: Only checks on navigation (users keep tabs open for days)
5. **No user notification**: Users don't know an update is available

**Debugging Process:**

**Step 1: Check Service Worker State**

```javascript
// In DevTools Console (on user's machine)

// Check current SW version
navigator.serviceWorker.controller?.scriptURL;
// "https://app.com/sw.js?v=1.2.3" ← Still on old version!

// Check registration state
const reg = await navigator.serviceWorker.getRegistration();
console.log('Active:', reg.active?.scriptURL);
console.log('Waiting:', reg.waiting?.scriptURL);
console.log('Installing:', reg.installing?.scriptURL);

// Output:
// Active: sw.js?v=1.2.3
// Waiting: sw.js?v=1.2.4 ← New version waiting!
// Installing: null

// AHA! New SW is installed but waiting indefinitely
```

**Step 2: Check Cache Headers**

```javascript
// Check how sw.js is cached

await fetch('/sw.js', { cache: 'no-cache' })
  .then(r => {
    console.log('Cache-Control:', r.headers.get('cache-control'));
    console.log('ETag:', r.headers.get('etag'));
  });

// Output:
// Cache-Control: public, max-age=31536000 ← 1 YEAR CACHE! ❌
// ETag: "abc123"

// Problem: sw.js itself is cached by HTTP cache
// Browser never fetches new version!
```

**Step 3: Fix Service Worker Update Issues**

```javascript
// ✅ FIXED sw.js v1.2.4

const VERSION = '1.2.4';
const CACHE_NAME = `app-cache-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// FIX 1: Add skipWaiting() to activate immediately
self.addEventListener('install', (event) => {
  console.log(`SW ${VERSION}: Installing...`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/app.js',
        '/styles.css',
        '/offline.html'
      ]))
      .then(() => {
        console.log(`SW ${VERSION}: Installed, skipping waiting`);
        return self.skipWaiting(); // ← FIX: Activate immediately
      })
  );
});

// FIX 2: Add clients.claim() to control existing clients
self.addEventListener('activate', (event) => {
  console.log(`SW ${VERSION}: Activating...`);

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];

  event.waitUntil(
    // Delete old caches
    caches.keys()
      .then(names =>
        Promise.all(
          names
            .filter(n => !currentCaches.includes(n))
            .map(n => {
              console.log(`Deleting old cache: ${n}`);
              return caches.delete(n);
            })
        )
      )
      .then(() => {
        console.log(`SW ${VERSION}: Taking control of clients`);
        return self.clients.claim(); // ← FIX: Control all clients now
      })
      .then(() => {
        // Notify all clients of new version
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: VERSION
            });
          });
        });
      })
  );
});

// FIX 3: Use network-first for HTML, stale-while-revalidate for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin
  if (url.origin !== location.origin) return;

  // Strategy based on request type
  if (request.mode === 'navigate') {
    // HTML: Network-first (get latest)
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API: Network-only (always fresh)
    event.respondWith(fetch(request));
  } else {
    // Static assets: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  // Return cached immediately, update in background
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}
```

**Step 4: Fix Client-Side Update Handling**

```javascript
// ✅ FIXED app.js - Proper update detection

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none' // ← FIX: Bypass HTTP cache for sw.js
    });

    console.log('SW registered:', registration.scope);

    // FIX 4: Check for updates every 60 seconds
    setInterval(() => {
      registration.update();
    }, 60000);

    // FIX 5: Handle updates immediately
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('New SW found, state:', newWorker.state);

      newWorker.addEventListener('statechange', () => {
        console.log('SW state changed:', newWorker.state);

        if (newWorker.state === 'activated') {
          // If we used skipWaiting + claim, reload to get new version
          if (!navigator.serviceWorker.controller) {
            window.location.reload();
          }
        }
      });
    });

    // FIX 6: Listen for SW messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SW_UPDATED') {
        console.log('SW updated to version:', event.data.version);
        showUpdateNotification(event.data.version);
      }
    });

    // FIX 7: Handle controller change (SW replaced)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('SW controller changed, reloading...');
      window.location.reload();
    });

  } catch (error) {
    console.error('SW registration failed:', error);
  }
}

// FIX 8: User-friendly update notification
function showUpdateNotification(version) {
  // Check if user is idle before showing notification
  const idleTime = Date.now() - lastActivityTime;

  if (idleTime > 30000) {
    // User idle for 30s, reload automatically
    console.log('User idle, auto-updating to', version);
    window.location.reload();
    return;
  }

  // User active, show notification
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <strong>New version available!</strong>
      <p>Version ${version} is ready. Click to update.</p>
      <button id="update-now">Update Now</button>
      <button id="update-later">Later</button>
    </div>
  `;

  document.body.appendChild(notification);

  document.getElementById('update-now').onclick = () => {
    window.location.reload();
  };

  document.getElementById('update-later').onclick = () => {
    notification.remove();
    // Auto-update in 5 minutes
    setTimeout(() => window.location.reload(), 300000);
  };
}

let lastActivityTime = Date.now();
['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, () => {
    lastActivityTime = Date.now();
  }, { passive: true });
});

registerServiceWorker();
```

**Step 5: Fix Server-Side Caching**

```javascript
// ✅ FIXED: Server headers for sw.js

// Express.js example
app.get('/sw.js', (req, res) => {
  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache, no-store, must-revalidate', // ← FIX!
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Nginx example
location = /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

**Step 6: Force Clear Old Service Workers (One-Time)**

```javascript
// emergency-clear.js - Deploy once to force clear stuck SWs

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => {
      reg.unregister();
      console.log('Unregistered SW:', reg.scope);
    });
  });

  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('Deleted cache:', name);
    });
  });

  // Reload after 1 second
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}
```

**Production Metrics (After Fix):**

```javascript
// Before fix:
// - 78% stuck on old version (6 hours after deploy)
// - Average update time: 24-72 hours
// - Support tickets: 127 in 6 hours
// - Cache size: 45MB per user

// After fix:
// - 95% updated within 5 minutes ✅
// - Average update time: 2.3 minutes ✅
// - Support tickets: 3 in first hour (93% reduction) ✅
// - User complaints: Dropped to near zero ✅
// - Cache size: 12MB per user (73% reduction) ✅
// - Successful auto-updates: 99.2% ✅

// Update timeline:
// 0-5 min:    45% updated (active users with auto-reload)
// 5-15 min:   35% updated (users clicked "Update Now")
// 15-60 min:  15% updated (idle users auto-reloaded)
// 60+ min:    5% updated (long-idle users)
```

**Key Lessons Learned:**

1. **Always use skipWaiting() + clients.claim()** for immediate updates
2. **Never cache sw.js** with long max-age (use no-cache)
3. **Implement periodic update checks** (setInterval)
4. **Notify users of updates** (don't force reload silently)
5. **Use updateViaCache: 'none'** in registration
6. **Monitor SW state transitions** in production
7. **Have emergency clear script** ready for critical bugs

</details>

<details>
<summary><strong>⚖️ Trade-offs: skipWaiting() + claim() vs Graceful Updates</strong></summary>

**Aggressive Updates (skipWaiting + claim):**

```javascript
// AGGRESSIVE: Immediate updates
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v2')
      .then(cache => cache.addAll([...]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    cleanup().then(() => self.clients.claim())
  );
});
```

**Pros:**
- ✅ Users get fixes immediately
- ✅ No multi-version coexistence issues
- ✅ Simple mental model
- ✅ Good for critical bug fixes

**Cons:**
- ❌ Can break in-progress actions (form submissions, etc.)
- ❌ Version mismatch between SW and cached pages
- ❌ No user control over update timing
- ❌ Potential data loss if user has unsaved work

**Graceful Updates (Default behavior):**

```javascript
// GRACEFUL: Wait for user action
self.addEventListener('install', e => {
  e.waitUntil(caches.open('v2').then(cache => cache.addAll([...])));
  // No skipWaiting() - waits for old clients to close
});

self.addEventListener('activate', e => {
  e.waitUntil(cleanup());
  // No claim() - only controls new clients
});

// Notify user
navigator.serviceWorker.addEventListener('controllerchange', () => {
  showUpdateBanner('New version available! Click to update.');
});
```

**Pros:**
- ✅ No interrupted user actions
- ✅ User controls when to update
- ✅ No version mismatches
- ✅ Better UX for long-running SPAs

**Cons:**
- ❌ Users may stay on old version indefinitely
- ❌ Critical bugs persist longer
- ❌ More complex update flow
- ❌ Need to handle multiple versions

**Recommendation:**

```javascript
// HYBRID: Aggressive for critical fixes, graceful for features

const VERSION = '1.2.4';
const IS_CRITICAL_FIX = false; // ← Set true for security/critical bugs

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll([...]))
      .then(() => {
        if (IS_CRITICAL_FIX) {
          return self.skipWaiting(); // Force immediate update
        }
      })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    cleanup().then(() => {
      if (IS_CRITICAL_FIX) {
        return self.clients.claim(); // Take control now
      }
    })
  );
});
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Service Worker Lifecycle</strong></summary>

**Simple Explanation:**

Think of a Service Worker like a **building's concierge**:

**Installation (Move-in Day):**
- New concierge arrives at the building
- They stock their desk with important papers (caching static files)
- They learn the building layout and rules
- Once ready, they're "installed" but not working yet

```javascript
self.addEventListener('install', (event) => {
  // "I'm the new concierge, let me stock my desk"
  event.waitUntil(
    caches.open('my-desk').then(desk =>
      desk.addAll(['directory', 'floor-plan', 'rules'])
    )
  );
});
```

**Activation (First Day on the Job):**
- Old concierge leaves, new one starts working
- They clean out old files from previous concierge
- They officially take over all duties

```javascript
self.addEventListener('activate', (event) => {
  // "Old concierge is gone, I'm cleaning up old files"
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== 'my-desk').map(old => caches.delete(old))
      )
    )
  );
});
```

**Fetch (Daily Work):**
- Resident asks concierge for something
- Concierge checks their desk first (cache)
- If not there, they call the warehouse (network)

```javascript
self.addEventListener('fetch', (event) => {
  // "Let me check my desk first, then I'll call the warehouse"
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

**Updates:**
- New concierge arrives while old one is still working
- Old concierge finishes their shift (waits for pages to close)
- New concierge takes over next shift

**skipWaiting()** = "Old concierge leaves immediately, new one starts now!"
**clients.claim()** = "New concierge takes over ALL residents, even those who were helped by old concierge"

**Visual Timeline:**

```
User visits site
     ↓
Download sw.js ────→ [Register]
     ↓
Parse & Install ───→ [Installing] → Cache files
     ↓
Wait for old SW ───→ [Installed/Waiting] → (skipWaiting to skip)
     ↓
User closes tabs ──→ [Activating] → Clean up
     ↓
Ready to work ─────→ [Activated] → (claim to control now)
     ↓
Intercept requests → [Fetch events]
```

</details>

### Resources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google: Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [Jake Archibald: The Service Worker Lifecycle](https://jakearchibald.com/2014/service-worker-lifecycle/)

---
