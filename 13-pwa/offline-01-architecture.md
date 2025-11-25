# Offline-First Architecture

> **Focus**: Progressive Web Apps offline capabilities and data synchronization

---

## Question 1: How do you build an offline-first architecture using service workers, IndexedDB, and background sync?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 15 minutes
**Companies:** Google, Meta, Microsoft, Twitter, Netflix

### Question
Explain how to architect a Progressive Web App with offline-first capabilities, including data storage, synchronization, and user experience considerations.

### Answer

Offline-first architecture ensures your app works without network connectivity by default, treating the network as an enhancement rather than a requirement. This involves service workers for asset caching, IndexedDB for data persistence, and background sync for deferred updates.

**Core Components:**

1. **Service Worker** - Network proxy, caching layer
2. **IndexedDB** - Client-side database for structured data
3. **Background Sync** - Queue actions when offline, sync when online
4. **Cache API** - Store HTTP responses
5. **Sync Manager** - Coordinate data synchronization

**Architecture Layers:**

```
┌─────────────────────────────────────┐
│         User Interface              │
│   (React, Vue, Vanilla JS)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Access Layer              │
│   (LocalDB wrapper, sync queue)     │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼───────┐ ┌──▼──────────────┐
│  IndexedDB    │ │ Service Worker  │
│  (App Data)   │ │ (HTTP Cache)    │
└───────────────┘ └─────────┬───────┘
                            │
                    ┌───────▼────────┐
                    │    Network     │
                    │  (API Server)  │
                    └────────────────┘
```

### Code Example

**1. Service Worker Setup:**

```javascript
// sw.js - Service worker with offline-first strategy

const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/offline.html',
  '/manifest.json'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then(names =>
        Promise.all(
          names
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Offline-first routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin
  if (url.origin !== location.origin) return;

  // Route based on request type
  if (request.mode === 'navigate') {
    event.respondWith(navigateOfflineFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiOfflineFirst(request));
  } else {
    event.respondWith(staticOfflineFirst(request));
  }
});

// Navigation: Try network, fallback to cache, then offline page
async function navigateOfflineFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

// API: Queue if offline, otherwise fetch
async function apiOfflineFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Queue for background sync if mutation
    if (request.method !== 'GET') {
      await queueRequest(request);
      return new Response(
        JSON.stringify({ queued: true, offline: true }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For GET requests, try IndexedDB cache
    const cachedData = await getCachedAPIData(request.url);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw error;
  }
}

// Static assets: Cache-first
async function staticOfflineFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}
```

**2. IndexedDB Wrapper:**

```javascript
// db.js - IndexedDB wrapper for offline data storage

class OfflineDB {
  constructor(dbName = 'OfflineAppDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('posts')) {
          const postsStore = db.createObjectStore('posts', {
            keyPath: 'id',
            autoIncrement: true
          });
          postsStore.createIndex('timestamp', 'timestamp', { unique: false });
          postsStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', {
            keyPath: 'url'
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Initialize database
const db = new OfflineDB();
await db.open();

export default db;
```

**3. Sync Queue Manager:**

```javascript
// sync-manager.js - Manages background sync and queued requests

class SyncManager {
  constructor(db) {
    this.db = db;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async queueRequest(request) {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    const id = await this.db.put('syncQueue', requestData);
    console.log('[Sync] Request queued:', id, requestData);

    // Register background sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-queue');
    }

    return id;
  }

  async processQueue() {
    if (this.syncInProgress) {
      console.log('[Sync] Already syncing...');
      return;
    }

    this.syncInProgress = true;
    console.log('[Sync] Processing queue...');

    try {
      const queue = await this.db.getAll('syncQueue');
      console.log(`[Sync] Found ${queue.length} queued requests`);

      for (const item of queue) {
        try {
          // Reconstruct request
          const request = new Request(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });

          // Attempt to send
          const response = await fetch(request);

          if (response.ok) {
            console.log('[Sync] Request successful:', item.url);
            await this.db.delete('syncQueue', item.id);
          } else {
            console.error('[Sync] Request failed:', response.status, item.url);
            // Keep in queue for retry
          }
        } catch (error) {
          console.error('[Sync] Request error:', error, item.url);
          // Keep in queue for retry
        }
      }

      console.log('[Sync] Queue processing complete');
    } finally {
      this.syncInProgress = false;
    }
  }

  handleOnline() {
    console.log('[Sync] Back online!');
    this.isOnline = true;
    this.processQueue();
  }

  handleOffline() {
    console.log('[Sync] Went offline');
    this.isOnline = false;
  }

  getQueueSize() {
    return this.db.getAll('syncQueue').then(queue => queue.length);
  }
}

export default SyncManager;
```

**4. Background Sync in Service Worker:**

```javascript
// Add to sw.js

// Background Sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  // Open IndexedDB
  const db = await openDB('OfflineAppDB', 1);

  const tx = db.transaction('syncQueue', 'readonly');
  const queue = await tx.objectStore('syncQueue').getAll();

  console.log(`[SW] Syncing ${queue.length} queued requests`);

  for (const item of queue) {
    try {
      const request = new Request(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });

      const response = await fetch(request);

      if (response.ok) {
        // Remove from queue
        const deleteTx = db.transaction('syncQueue', 'readwrite');
        await deleteTx.objectStore('syncQueue').delete(item.id);
        console.log('[SW] Synced:', item.url);

        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            url: item.url
          });
        });
      }
    } catch (error) {
      console.error('[SW] Sync failed:', error, item.url);
    }
  }
}
```

**5. Complete Offline-First App:**

```javascript
// app.js - Main application with offline support

import db from './db.js';
import SyncManager from './sync-manager.js';

class OfflineFirstApp {
  constructor() {
    this.db = db;
    this.syncManager = new SyncManager(db);
    this.isOnline = navigator.onLine;

    this.setupEventListeners();
    this.loadPosts();
  }

  setupEventListeners() {
    // Online/offline indicators
    window.addEventListener('online', () => {
      this.updateConnectionStatus(true);
    });

    window.addEventListener('offline', () => {
      this.updateConnectionStatus(false);
    });

    // Listen for sync updates from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          this.handleSyncComplete(event.data.url);
        }
      });
    }
  }

  updateConnectionStatus(online) {
    this.isOnline = online;

    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = online ? '🟢 Online' : '🔴 Offline';
    statusEl.className = online ? 'online' : 'offline';

    if (online) {
      this.showNotification('Back online! Syncing changes...');
    } else {
      this.showNotification('You are offline. Changes will be synced when back online.');
    }
  }

  async loadPosts() {
    try {
      if (this.isOnline) {
        // Fetch from API
        const response = await fetch('/api/posts');
        const posts = await response.json();

        // Update IndexedDB
        for (const post of posts) {
          await this.db.put('posts', { ...post, synced: true });
        }

        this.renderPosts(posts);
      } else {
        // Load from IndexedDB
        const posts = await this.db.getAll('posts');
        this.renderPosts(posts);
        this.showNotification('Loaded from offline storage');
      }
    } catch (error) {
      console.error('Failed to load posts:', error);

      // Fallback to IndexedDB
      const posts = await this.db.getAll('posts');
      this.renderPosts(posts);
    }
  }

  async createPost(title, content) {
    const post = {
      id: Date.now(), // Temporary ID
      title,
      content,
      timestamp: Date.now(),
      synced: false
    };

    // Save to IndexedDB immediately
    await this.db.put('posts', post);

    // Optimistically update UI
    this.addPostToUI(post);

    // Try to sync with server
    try {
      if (this.isOnline) {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post)
        });

        if (response.ok) {
          const serverPost = await response.json();

          // Update with server ID
          await this.db.delete('posts', post.id);
          await this.db.put('posts', { ...serverPost, synced: true });

          this.showNotification('Post created successfully!');
        } else {
          throw new Error('Server error');
        }
      } else {
        throw new Error('Offline');
      }
    } catch (error) {
      // Queue for background sync
      await this.syncManager.queueRequest(new Request('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      }));

      this.showNotification('Post saved offline. Will sync when online.');
    }
  }

  async deletePost(id) {
    // Optimistically remove from UI
    this.removePostFromUI(id);

    // Delete from IndexedDB
    await this.db.delete('posts', id);

    // Try to sync with server
    try {
      if (this.isOnline) {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          this.showNotification('Post deleted successfully!');
        } else {
          throw new Error('Server error');
        }
      } else {
        throw new Error('Offline');
      }
    } catch (error) {
      // Queue for background sync
      await this.syncManager.queueRequest(new Request(`/api/posts/${id}`, {
        method: 'DELETE'
      }));

      this.showNotification('Deletion queued. Will sync when online.');
    }
  }

  renderPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    posts.forEach(post => {
      this.addPostToUI(post);
    });
  }

  addPostToUI(post) {
    const container = document.getElementById('posts-container');

    const postEl = document.createElement('div');
    postEl.className = 'post';
    postEl.dataset.id = post.id;
    postEl.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>
        ${new Date(post.timestamp).toLocaleString()}
        ${post.synced ? '' : '<span class="unsynced">⏳ Not synced</span>'}
      </small>
      <button onclick="app.deletePost(${post.id})">Delete</button>
    `;

    container.appendChild(postEl);
  }

  removePostFromUI(id) {
    const postEl = document.querySelector(`[data-id="${id}"]`);
    if (postEl) postEl.remove();
  }

  handleSyncComplete(url) {
    console.log('Sync completed:', url);

    // Refresh posts to update sync status
    this.loadPosts();
    this.showNotification('Changes synced successfully!');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize app
const app = new OfflineFirstApp();

// Form submission
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = e.target.title.value;
  const content = e.target.content.value;

  await app.createPost(title, content);

  e.target.reset();
});
```

**6. Periodic Background Sync:**

```javascript
// Register periodic sync for data refresh

// In service worker
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-posts') {
    event.waitUntil(refreshPosts());
  }
});

async function refreshPosts() {
  try {
    const response = await fetch('/api/posts');
    const posts = await response.json();

    // Update IndexedDB
    const db = await openDB('OfflineAppDB', 1);
    const tx = db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');

    for (const post of posts) {
      await store.put({ ...post, synced: true });
    }

    console.log('[SW] Posts refreshed:', posts.length);

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'POSTS_REFRESHED',
        count: posts.length
      });
    });
  } catch (error) {
    console.error('[SW] Refresh failed:', error);
  }
}

// Register periodic sync (in app)
async function registerPeriodicSync() {
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('refresh-posts', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      });
      console.log('Periodic sync registered');
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
    }
  }
}
```

**7. Conflict Resolution:**

```javascript
// Handle conflicts when syncing offline changes

async function syncWithConflictResolution(localData, remoteData) {
  const conflicts = [];

  for (const localItem of localData) {
    const remoteItem = remoteData.find(r => r.id === localItem.id);

    if (remoteItem) {
      // Check if timestamps conflict
      if (remoteItem.updatedAt > localItem.updatedAt) {
        // Server is newer
        conflicts.push({
          id: localItem.id,
          local: localItem,
          remote: remoteItem,
          resolution: 'server-wins'
        });
      } else if (localItem.updatedAt > remoteItem.updatedAt) {
        // Local is newer
        conflicts.push({
          id: localItem.id,
          local: localItem,
          remote: remoteItem,
          resolution: 'client-wins'
        });
      }
    }
  }

  // Resolve conflicts
  for (const conflict of conflicts) {
    if (conflict.resolution === 'server-wins') {
      // Update local with server data
      await db.put('posts', conflict.remote);
    } else {
      // Push local changes to server
      await fetch(`/api/posts/${conflict.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conflict.local)
      });
    }
  }

  return conflicts;
}
```

<details>
<summary><strong>🔍 Deep Dive: IndexedDB Performance & Browser Storage Quotas</strong></summary>

**IndexedDB Architecture & Performance:**

IndexedDB is a transactional database system built into browsers, providing structured storage for offline-first apps. Unlike localStorage (5-10MB limit), IndexedDB can store gigabytes of data.

**1. IndexedDB vs Other Storage Options:**

```javascript
// Storage comparison

// ┌─────────────┬──────────────┬──────────┬──────────┬────────────┐
// │ Storage     │ Limit        │ Sync/    │ Types    │ Use Case   │
// │ Type        │              │ Async    │          │            │
// ├─────────────┼──────────────┼──────────┼──────────┼────────────┤
// │ localStorage│ 5-10MB       │ Sync     │ String   │ Small data │
// │ sessionStor │ 5-10MB       │ Sync     │ String   │ Temp data  │
// │ IndexedDB   │ 10GB+        │ Async    │ Any      │ Offline DB │
// │ Cache API   │ Varies       │ Async    │ Response │ HTTP cache │
// │ OPFS        │ 10GB+        │ Async    │ Binary   │ Files      │
// └─────────────┴──────────────┴──────────┴──────────┴────────────┘

// Performance comparison (1000 writes):
console.time('localStorage');
for (let i = 0; i < 1000; i++) {
  localStorage.setItem(`key${i}`, JSON.stringify({ data: i }));
}
console.timeEnd('localStorage'); // ~150ms (BLOCKS main thread!)

console.time('IndexedDB');
const db = await openDB('test', 1);
const tx = db.transaction('store', 'readwrite');
for (let i = 0; i < 1000; i++) {
  tx.objectStore('store').put({ id: i, data: i });
}
await tx.complete;
console.timeEnd('IndexedDB'); // ~45ms (async, doesn't block!)

// Winner: IndexedDB (3x faster + non-blocking)
```

**2. IndexedDB Transaction Model:**

```javascript
// IndexedDB uses ACID transactions

class TransactionDemo {
  async demonstrateTransactions() {
    const db = await openDB('demo', 1, {
      upgrade(db) {
        db.createObjectStore('users', { keyPath: 'id' });
        db.createObjectStore('posts', { keyPath: 'id' });
      }
    });

    // Transaction scope: Single store
    const singleStoreTx = db.transaction('users', 'readwrite');
    await singleStoreTx.objectStore('users').put({ id: 1, name: 'Alice' });
    await singleStoreTx.complete; // ✅ Commits

    // Transaction scope: Multiple stores
    const multiStoreTx = db.transaction(['users', 'posts'], 'readwrite');

    await multiStoreTx.objectStore('users').put({ id: 2, name: 'Bob' });
    await multiStoreTx.objectStore('posts').put({ id: 1, userId: 2, title: 'Hello' });

    await multiStoreTx.complete; // ✅ Commits atomically

    // Transaction rollback on error
    try {
      const rollbackTx = db.transaction('users', 'readwrite');

      await rollbackTx.objectStore('users').put({ id: 3, name: 'Charlie' });

      // Simulate error
      throw new Error('Oops!');

      await rollbackTx.complete;
    } catch (error) {
      // Transaction automatically rolled back
      // Charlie was NOT saved
      console.log('Transaction rolled back');
    }

    // Verify rollback
    const users = await db.getAll('users');
    console.log(users); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    // No Charlie! ✅
  }
}

// Transaction isolation levels:
// READ UNCOMMITTED: Not supported
// READ COMMITTED: Default (reads committed data only)
// REPEATABLE READ: Supported via version change transactions
// SERIALIZABLE: Not supported

// Performance impact:
// - Short transactions: ~1-5ms overhead
// - Long transactions: Can block other operations
// - Best practice: Keep transactions small and focused
```

**3. IndexedDB Indexing Performance:**

```javascript
// Indexes dramatically improve query performance

async function benchmarkIndexes() {
  const db = await openDB('benchmark', 1, {
    upgrade(db) {
      const store = db.createObjectStore('users', {
        keyPath: 'id',
        autoIncrement: true
      });

      // Create indexes
      store.createIndex('email', 'email', { unique: true });
      store.createIndex('age', 'age');
      store.createIndex('country', 'country');
    }
  });

  // Insert 10,000 users
  console.time('Insert 10k users');
  const tx = db.transaction('users', 'readwrite');
  for (let i = 0; i < 10000; i++) {
    tx.objectStore('users').put({
      email: `user${i}@example.com`,
      age: 18 + (i % 50),
      country: ['US', 'UK', 'CA', 'AU'][i % 4]
    });
  }
  await tx.complete;
  console.timeEnd('Insert 10k users'); // ~250ms

  // Query WITHOUT index (full table scan)
  console.time('Find user WITHOUT index');
  const allUsers = await db.getAll('users');
  const userByEmail = allUsers.find(u => u.email === 'user5000@example.com');
  console.timeEnd('Find user WITHOUT index'); // ~45ms ❌ SLOW!

  // Query WITH index (direct lookup)
  console.time('Find user WITH index');
  const index = db.transaction('users').objectStore('users').index('email');
  const indexedUser = await index.get('user5000@example.com');
  console.timeEnd('Find user WITH index'); // ~1.2ms ✅ FAST! (37x faster)

  // Range query WITH index
  console.time('Find users aged 25-30');
  const ageIndex = db.transaction('users').objectStore('users').index('age');
  const ageRange = IDBKeyRange.bound(25, 30);
  const usersInRange = await ageIndex.getAll(ageRange);
  console.timeEnd('Find users aged 25-30'); // ~3ms ✅

  // Compound queries (requires multiple indexes)
  console.time('Find US users aged 25-30');
  const countryIndex = db.transaction('users').objectStore('users').index('country');
  const usCountry = await countryIndex.getAll('US');
  const filtered = usCountry.filter(u => u.age >= 25 && u.age <= 30);
  console.timeEnd('Find US users aged 25-30'); // ~12ms ⚠️

  // Lesson: Compound queries slower without compound index
  // Consider denormalization for complex queries
}

// Index overhead:
// - Storage: ~10-20% per index
// - Write performance: ~5-10% slower per index
// - Read performance: 10-100x faster with right index
// - Recommendation: Index frequently queried fields only
```

**4. Browser Storage Quotas:**

```javascript
// Understanding storage quotas across browsers

async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();

    console.log('Storage Estimate:');
    console.log(`  Usage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Quota: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Percent: ${((estimate.usage / estimate.quota) * 100).toFixed(2)}%`);

    // Breakdown by storage type (Chrome 108+)
    if (estimate.usageDetails) {
      console.log('Usage Details:');
      console.log(`  IndexedDB: ${(estimate.usageDetails.indexedDB / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Cache API: ${(estimate.usageDetails.caches / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Service Workers: ${(estimate.usageDetails.serviceWorkerRegistrations / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}

// Storage quotas by browser (2024):
// ┌──────────┬────────────────────────────────────────┬──────────────┐
// │ Browser  │ Quota Calculation                      │ Eviction     │
// ├──────────┼────────────────────────────────────────┼──────────────┤
// │ Chrome   │ 60% of free disk space                 │ LRU per      │
// │          │ (Max: 80% of total disk)               │ origin       │
// │          │ Example: 100GB free → 60GB quota       │              │
// ├──────────┼────────────────────────────────────────┼──────────────┤
// │ Firefox  │ 50% of free disk space                 │ LRU per      │
// │          │ (Max: 10GB per group, 2GB per origin)  │ origin       │
// ├──────────┼────────────────────────────────────────┼──────────────┤
// │ Safari   │ ~1GB (prompts user at ~200MB)          │ Prompt at    │
// │          │ Can request more via persistent storage│ 200MB        │
// ├──────────┼────────────────────────────────────────┼──────────────┤
// │ Edge     │ Same as Chrome (Chromium-based)        │ LRU per      │
// │          │                                        │ origin       │
// └──────────┴────────────────────────────────────────┴──────────────┘

// Request persistent storage (won't be evicted)
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();

    if (isPersistent) {
      console.log('✅ Persistent storage granted');
    } else {
      console.log('❌ Persistent storage denied');
      console.log('Data may be evicted under storage pressure');
    }

    // Check current persistence
    const persisted = await navigator.storage.persisted();
    console.log('Is persisted:', persisted);
  }
}

// Browsers grant persistent storage if:
// - Site is bookmarked
// - Site has high engagement (Chrome)
// - Site is installed as PWA
// - User explicitly grants permission
```

**5. IndexedDB Versioning & Migrations:**

```javascript
// Safe schema migrations

const DB_NAME = 'MyApp';
let CURRENT_VERSION = 3;

async function openDBWithMigrations() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, CURRENT_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;

      console.log(`Upgrading from v${oldVersion} to v${newVersion}`);

      // Migration v0 → v1
      if (oldVersion < 1) {
        console.log('Creating users store...');
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
      }

      // Migration v1 → v2
      if (oldVersion < 2) {
        console.log('Adding posts store...');
        const postsStore = db.createObjectStore('posts', { keyPath: 'id' });
        postsStore.createIndex('userId', 'userId');
        postsStore.createIndex('timestamp', 'timestamp');
      }

      // Migration v2 → v3
      if (oldVersion < 3) {
        console.log('Adding age index to users...');
        const tx = event.target.transaction;
        const usersStore = tx.objectStore('users');

        // Check if index exists (idempotent migrations)
        if (!usersStore.indexNames.contains('age')) {
          usersStore.createIndex('age', 'age');
        }
      }

      // Future migrations:
      // if (oldVersion < 4) { ... }
      // if (oldVersion < 5) { ... }
    };
  });
}

// Best practices for migrations:
// 1. Never decrease version number
// 2. Migrations should be idempotent
// 3. Test migrations with real data
// 4. Don't delete old stores immediately (keep for rollback)
// 5. Version schema changes, not data changes
```

**6. IndexedDB Performance Optimization:**

```javascript
// Production-grade optimization techniques

class OptimizedDB {
  constructor() {
    this.db = null;
    this.transactionPool = new Map();
  }

  // Optimization 1: Reuse transactions
  async batchWrite(storeName, items) {
    console.time('Batch write');

    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Write all items in single transaction
    const promises = items.map(item => store.put(item));

    await Promise.all(promises);
    await tx.complete;

    console.timeEnd('Batch write');
    // Batch: ~50ms for 1000 items
    // Individual txs: ~800ms for 1000 items (16x slower!)
  }

  // Optimization 2: Use cursors for large datasets
  async processByChunks(storeName, chunkSize = 100, processor) {
    console.time('Cursor processing');

    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    let cursor = await store.openCursor();
    let chunk = [];
    let count = 0;

    while (cursor) {
      chunk.push(cursor.value);
      count++;

      if (chunk.length >= chunkSize) {
        await processor(chunk);
        chunk = [];
      }

      cursor = await cursor.continue();
    }

    // Process remaining items
    if (chunk.length > 0) {
      await processor(chunk);
    }

    console.timeEnd('Cursor processing');
    console.log(`Processed ${count} items`);

    // Cursor: ~200ms for 10k items, low memory
    // getAll: ~180ms for 10k items, high memory (50MB+)
  }

  // Optimization 3: Index-only queries (avoid main store lookup)
  async getEmailsOnly() {
    console.time('Index-only query');

    const tx = this.db.transaction('users', 'readonly');
    const index = tx.objectStore('users').index('email');

    // Get all keys from index (fast, no object deserialization)
    const emails = await index.getAllKeys();

    console.timeEnd('Index-only query');
    // Index-only: ~8ms for 10k emails
    // Full objects: ~35ms for 10k users (4x slower)

    return emails;
  }

  // Optimization 4: Lazy initialization
  async lazyOpen() {
    if (this.db) return this.db;

    this.db = await openDB('MyApp', 1);
    return this.db;
  }

  // Optimization 5: Connection pooling (avoid repeated opens)
  static instance = null;

  static async getInstance() {
    if (!OptimizedDB.instance) {
      OptimizedDB.instance = new OptimizedDB();
      await OptimizedDB.instance.lazyOpen();
    }
    return OptimizedDB.instance;
  }
}

// Usage
const db = await OptimizedDB.getInstance();
await db.batchWrite('users', users);
```

**7. Storage Cleanup Strategies:**

```javascript
// Automatic cleanup to stay within quota

class StorageManager {
  constructor(db) {
    this.db = db;
    this.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  async cleanup() {
    console.log('[Cleanup] Starting storage cleanup...');

    // Strategy 1: Remove old entries
    await this.removeOldEntries();

    // Strategy 2: Remove least recently used
    await this.removeLRU();

    // Strategy 3: Compress data
    await this.compressData();

    const estimate = await navigator.storage.estimate();
    console.log(`[Cleanup] After cleanup: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
  }

  async removeOldEntries() {
    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('timestamp');

    const cutoff = Date.now() - this.maxAge;
    const oldEntries = await index.getAll(IDBKeyRange.upperBound(cutoff));

    console.log(`[Cleanup] Removing ${oldEntries.length} old entries`);

    for (const entry of oldEntries) {
      await store.delete(entry.url);
    }
  }

  async removeLRU() {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage / estimate.quota;

    if (usage < 0.8) return; // Only cleanup if > 80% full

    console.log('[Cleanup] Storage > 80%, removing LRU entries');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('lastAccessed');

    // Get least recently accessed
    const cursor = await index.openCursor();
    let removed = 0;

    while (cursor && usage > 0.7) {
      await cursor.delete();
      removed++;
      cursor = await cursor.continue();

      // Check usage again
      const newEstimate = await navigator.storage.estimate();
      usage = newEstimate.usage / newEstimate.quota;
    }

    console.log(`[Cleanup] Removed ${removed} LRU entries`);
  }

  async compressData() {
    // Use CompressionStream API (Chrome 80+)
    if ('CompressionStream' in window) {
      const tx = this.db.transaction('posts', 'readwrite');
      const store = tx.objectStore('posts');
      const posts = await store.getAll();

      for (const post of posts) {
        if (!post.compressed && post.content.length > 1000) {
          const compressed = await this.compress(post.content);

          if (compressed.byteLength < post.content.length * 0.7) {
            post.content = compressed;
            post.compressed = true;
            await store.put(post);
          }
        }
      }
    }
  }

  async compress(text) {
    const stream = new Blob([text])
      .stream()
      .pipeThrough(new CompressionStream('gzip'));

    const buffer = await new Response(stream).arrayBuffer();
    return buffer;
  }
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Building Offline-First Notes App</strong></summary>

**Scenario**: You're building a notes app that must work reliably offline. Users report data loss when their internet connection drops mid-edit. Syncing is unreliable, and conflicts aren't handled properly. Users are losing important notes and leaving angry reviews.

**Production Metrics (Before Fix):**
- Data loss incidents: 47 per week
- Sync failures: 23% of all sync attempts
- Conflict resolution: Manual intervention required
- User frustration: 1.8/5 star rating
- Churn rate: 35% monthly
- Support tickets: 89 per week about data loss

**The Problem Code:**

```javascript
// ❌ BAD: Naive implementation with race conditions

// Save note (directly to server, no offline support)
async function saveNote(note) {
  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note)
    });

    if (!response.ok) throw new Error('Save failed');

    alert('Note saved!');
  } catch (error) {
    alert('Failed to save note'); // ❌ Data lost!
  }
}

// Problems:
// 1. No offline storage
// 2. No retry mechanism
// 3. No conflict resolution
// 4. Network errors = data loss
// 5. No sync queue
```

**Complete Offline-First Solution:**

```javascript
// ✅ FIXED: Production-grade offline-first notes app

// 1. IndexedDB Schema
const DB_NAME = 'NotesApp';
const DB_VERSION = 2;

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('updatedAt', 'updatedAt');
        notesStore.createIndex('synced', 'synced');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true
        });
      }

      // Conflicts store
      if (!db.objectStoreNames.contains('conflicts')) {
        db.createObjectStore('conflicts', { keyPath: 'noteId' });
      }
    };
  });
}

// 2. Notes Manager with Offline Support
class NotesManager {
  constructor(db) {
    this.db = db;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    // Auto-sync on connection restore
    window.addEventListener('online', () => this.handleOnline());
  }

  // Generate unique ID (works offline)
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save note (offline-first)
  async saveNote(note) {
    const now = Date.now();

    const noteData = {
      id: note.id || this.generateId(),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt || now,
      updatedAt: now,
      synced: false,
      version: (note.version || 0) + 1
    };

    // Save to IndexedDB immediately (optimistic update)
    await this.saveToIndexedDB(noteData);

    // Update UI
    this.updateUI(noteData);

    // Try to sync with server
    if (this.isOnline) {
      await this.syncNote(noteData);
    } else {
      await this.queueForSync(noteData);
      this.showNotification('Saved offline. Will sync when online.');
    }

    return noteData;
  }

  async saveToIndexedDB(note) {
    const tx = this.db.transaction('notes', 'readwrite');
    await tx.objectStore('notes').put(note);
  }

  async syncNote(note) {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });

      if (response.ok) {
        const serverNote = await response.json();

        // Check for conflicts
        if (serverNote.version > note.version) {
          await this.handleConflict(note, serverNote);
        } else {
          // Update local note with server confirmation
          note.synced = true;
          note.version = serverNote.version;
          await this.saveToIndexedDB(note);

          this.showNotification('Note synced successfully');
        }
      } else if (response.status === 409) {
        // Conflict detected
        const serverNote = await response.json();
        await this.handleConflict(note, serverNote);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      await this.queueForSync(note);
    }
  }

  async queueForSync(note) {
    const tx = this.db.transaction('syncQueue', 'readwrite');
    await tx.objectStore('syncQueue').put({
      noteId: note.id,
      action: 'update',
      data: note,
      timestamp: Date.now()
    });
  }

  async handleConflict(localNote, serverNote) {
    console.log('Conflict detected:', localNote.id);

    // Strategy: Last-write-wins (can be customized)
    if (localNote.updatedAt > serverNote.updatedAt) {
      // Local is newer, push to server
      const response = await fetch(`/api/notes/${localNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': serverNote.version // Optimistic concurrency
        },
        body: JSON.stringify(localNote)
      });

      if (response.ok) {
        localNote.synced = true;
        await this.saveToIndexedDB(localNote);
        this.showNotification('Conflict resolved (local version kept)');
      }
    } else {
      // Server is newer, ask user
      await this.saveConflict(localNote, serverNote);
      this.showConflictDialog(localNote, serverNote);
    }
  }

  async saveConflict(localNote, serverNote) {
    const tx = this.db.transaction('conflicts', 'readwrite');
    await tx.objectStore('conflicts').put({
      noteId: localNote.id,
      local: localNote,
      server: serverNote,
      timestamp: Date.now()
    });
  }

  showConflictDialog(localNote, serverNote) {
    const dialog = document.createElement('div');
    dialog.className = 'conflict-dialog';
    dialog.innerHTML = `
      <h3>Conflict detected for "${localNote.title}"</h3>
      <div class="conflict-options">
        <div class="option">
          <h4>Your version (local)</h4>
          <p>Last edited: ${new Date(localNote.updatedAt).toLocaleString()}</p>
          <pre>${localNote.content.substring(0, 200)}...</pre>
          <button onclick="notesManager.resolveConflict('${localNote.id}', 'local')">
            Keep this version
          </button>
        </div>
        <div class="option">
          <h4>Server version</h4>
          <p>Last edited: ${new Date(serverNote.updatedAt).toLocaleString()}</p>
          <pre>${serverNote.content.substring(0, 200)}...</pre>
          <button onclick="notesManager.resolveConflict('${localNote.id}', 'server')">
            Use server version
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
  }

  async resolveConflict(noteId, choice) {
    const tx = this.db.transaction('conflicts', 'readonly');
    const conflict = await tx.objectStore('conflicts').get(noteId);

    const chosenNote = choice === 'local' ? conflict.local : conflict.server;

    // Save chosen version
    chosenNote.synced = false;
    await this.saveToIndexedDB(chosenNote);
    await this.syncNote(chosenNote);

    // Remove from conflicts
    const deleteTx = this.db.transaction('conflicts', 'readwrite');
    await deleteTx.objectStore('conflicts').delete(noteId);

    // Close dialog
    document.querySelector('.conflict-dialog').remove();

    this.showNotification(`Conflict resolved (${choice} version kept)`);
  }

  async handleOnline() {
    console.log('Back online! Syncing queued changes...');
    this.isOnline = true;

    if (this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      // Get queued items
      const tx = this.db.transaction('syncQueue', 'readonly');
      const queue = await tx.objectStore('syncQueue').getAll();

      console.log(`Syncing ${queue.length} queued items`);

      for (const item of queue) {
        try {
          const tx = this.db.transaction('notes', 'readonly');
          const note = await tx.objectStore('notes').get(item.noteId);

          if (note) {
            await this.syncNote(note);
          }

          // Remove from queue
          const deleteTx = this.db.transaction('syncQueue', 'readwrite');
          await deleteTx.objectStore('syncQueue').delete(item.id);
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }

      this.showNotification('All changes synced!');
    } finally {
      this.syncInProgress = false;
    }
  }

  async getAllNotes() {
    const tx = this.db.transaction('notes', 'readonly');
    const notes = await tx.objectStore('notes').getAll();

    // Sort by updatedAt desc
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteNote(noteId) {
    // Optimistic delete
    const tx = this.db.transaction('notes', 'readwrite');
    await tx.objectStore('notes').delete(noteId);

    this.removeFromUI(noteId);

    // Sync deletion
    if (this.isOnline) {
      try {
        await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      } catch (error) {
        // Queue for later
        await this.queueForSync({ id: noteId, _deleted: true });
      }
    } else {
      await this.queueForSync({ id: noteId, _deleted: true });
    }
  }

  updateUI(note) {
    const noteEl = document.querySelector(`[data-note-id="${note.id}"]`);

    if (noteEl) {
      noteEl.querySelector('.title').textContent = note.title;
      noteEl.querySelector('.content').textContent = note.content;
      noteEl.querySelector('.status').textContent = note.synced ? '✅' : '⏳';
    } else {
      this.addNoteToUI(note);
    }
  }

  addNoteToUI(note) {
    const container = document.getElementById('notes-list');
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.dataset.noteId = note.id;
    noteEl.innerHTML = `
      <h3 class="title">${note.title}</h3>
      <p class="content">${note.content.substring(0, 100)}...</p>
      <small>
        ${new Date(note.updatedAt).toLocaleString()}
        <span class="status">${note.synced ? '✅' : '⏳'}</span>
      </small>
      <button onclick="notesManager.deleteNote('${note.id}')">Delete</button>
    `;

    container.prepend(noteEl);
  }

  removeFromUI(noteId) {
    const noteEl = document.querySelector(`[data-note-id="${noteId}"]`);
    if (noteEl) noteEl.remove();
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// 3. Initialize app
let notesManager;

async function initApp() {
  const db = await initDB();
  notesManager = new NotesManager(db);

  // Load notes
  const notes = await notesManager.getAllNotes();
  notes.forEach(note => notesManager.addNoteToUI(note));

  // Connection status indicator
  updateConnectionStatus();
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

function updateConnectionStatus() {
  const statusEl = document.getElementById('connection-status');
  statusEl.textContent = navigator.onLine ? '🟢 Online' : '🔴 Offline';
}

// 4. Form handling
document.getElementById('note-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = e.target.title.value;
  const content = e.target.content.value;

  await notesManager.saveNote({ title, content });

  e.target.reset();
});

initApp();
```

**Production Metrics (After Fix):**

```javascript
// Before fix:
// - Data loss: 47 incidents/week
// - Sync failures: 23%
// - User rating: 1.8/5 stars
// - Churn: 35%/month
// - Support tickets: 89/week

// After fix:
// - Data loss: 0 incidents/week ✅
// - Sync success: 99.7% ✅
// - User rating: 4.6/5 stars ✅
// - Churn: 8%/month (77% reduction) ✅
// - Support tickets: 12/week (87% reduction) ✅
// - Offline usage: 45% of all sessions ✅
// - Sync queue avg: 2.3 items
// - Conflict rate: 0.8% (well handled)
```

**Key Improvements:**

1. **No data loss** - Everything saved locally first
2. **Automatic sync** - Queues offline changes, syncs when online
3. **Conflict resolution** - Detects and handles conflicts gracefully
4. **Optimistic updates** - UI updates immediately
5. **Offline indicator** - Users know connection status
6. **Retry logic** - Failed syncs automatically retry

</details>

<details>
<summary><strong>⚖️ Trade-offs: Offline-First Architecture Decisions</strong></summary>

**Storage Options:**

| Storage | Capacity | Performance | Offline | Sync | Best For |
|---------|----------|-------------|---------|------|----------|
| localStorage | 5-10MB | Fast (sync) | ✅ | Manual | Settings, tokens |
| IndexedDB | 10GB+ | Fast (async) | ✅ | Manual | Structured data |
| Cache API | Varies | Fast | ✅ | Manual | HTTP responses |
| OPFS | 10GB+ | Very fast | ✅ | Manual | Large files |

**Sync Strategies:**

```javascript
// 1. Immediate sync (best for small changes)
// Pros: Fresh data, simple
// Cons: Network overhead, battery drain
async function immediateSync(data) {
  await saveToIndexedDB(data);
  await fetch('/api/data', { method: 'POST', body: JSON.stringify(data) });
}

// 2. Debounced sync (best for frequent edits)
// Pros: Reduces network calls, better UX
// Cons: Slight delay before sync
const debouncedSync = debounce(async (data) => {
  await saveToIndexedDB(data);
  await fetch('/api/data', { method: 'POST', body: JSON.stringify(data) });
}, 1000);

// 3. Background sync (best for reliability)
// Pros: Handles offline, no user wait
// Cons: Delayed sync, requires service worker
async function backgroundSync(data) {
  await saveToIndexedDB(data);
  await registration.sync.register('sync-data');
}

// 4. Periodic sync (best for data refresh)
// Pros: Always up-to-date, works in background
// Cons: Battery drain, limited to once per day
await registration.periodicSync.register('refresh-data', {
  minInterval: 24 * 60 * 60 * 1000
});
```

**Conflict Resolution Strategies:**

```javascript
// 1. Last-write-wins (simplest)
// Use server timestamp to determine winner
if (serverNote.updatedAt > localNote.updatedAt) {
  return serverNote; // Server wins
} else {
  return localNote; // Local wins
}

// 2. Manual resolution (most accurate)
// Show both versions, let user choose
showConflictDialog(localNote, serverNote);

// 3. Three-way merge (most sophisticated)
// Merge changes from both versions
const merged = mergeNotes(baseNote, localNote, serverNote);

// 4. Operational transformation (real-time collab)
// Apply transformations to resolve conflicts
const resolved = applyOT(localOps, serverOps);
```

**Recommendation Matrix:**

| App Type | Storage | Sync | Conflict Resolution |
|----------|---------|------|---------------------|
| Note-taking | IndexedDB | Background | Manual |
| To-do list | IndexedDB | Debounced | Last-write-wins |
| E-commerce | Cache API + IndexedDB | Immediate | Server-wins |
| Social media | IndexedDB | Background | Three-way merge |
| Collaborative docs | IndexedDB | Immediate | OT/CRDT |

</details>

<details>
<summary><strong>💬 Explain to Junior: Offline-First Architecture</strong></summary>

**Simple Explanation:**

Think of offline-first like having a **local notebook** that syncs with a **cloud notebook**:

**Without Offline-First (Online-Only):**
- You write directly in cloud notebook
- No internet = can't write anything
- Changes lost if connection drops mid-write

**With Offline-First:**
- You write in local notebook first (IndexedDB)
- App copies to cloud notebook when online
- No internet? No problem, write in local notebook
- When online again, sync everything

**Visual Flow:**

```
User edits note
     ↓
Save to IndexedDB (instant!) ⚡
     ↓
Show in UI (optimistic update)
     ↓
Is online?
  ├─ YES → Sync to server → Update "synced" status
  └─ NO  → Queue for later → Show "pending sync" status
           ↓
        Wait for online
           ↓
        Auto-sync queue
```

**Real-World Analogy:**

**Google Docs Offline:**
- You can edit documents on airplane (offline)
- Changes saved to your computer
- When Wi-Fi connects, all changes upload automatically
- If someone else edited, you see conflict dialog

**Same principles:**
1. **Local-first**: Save to device immediately
2. **Sync when possible**: Upload when online
3. **Conflict resolution**: Handle when both versions changed

**Code Example (Simple):**

```javascript
// Save note (offline-first)
async function saveNote(note) {
  // Step 1: Save locally (always works)
  await db.put('notes', note);
  console.log('✅ Saved locally');

  // Step 2: Show in UI immediately
  updateUI(note);

  // Step 3: Try to sync with server
  if (navigator.onLine) {
    try {
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      });
      console.log('✅ Synced to server');
    } catch (error) {
      console.log('⏳ Will sync later');
      queueForSync(note);
    }
  } else {
    console.log('📴 Offline, will sync later');
    queueForSync(note);
  }
}

// When back online
window.addEventListener('online', async () => {
  console.log('🌐 Back online! Syncing...');
  await syncQueue();
});
```

**Benefits Explained:**

1. **Fast**: No waiting for network (save locally first)
2. **Reliable**: Works offline, no data loss
3. **Resilient**: Auto-retry failed syncs
4. **Better UX**: Instant feedback, no loading spinners

</details>

### Resources

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Google: Offline-First Web Apps](https://web.dev/offline/)
- [Jake Archibald: Offline Cookbook](https://jakearchibald.com/2014/offline-cookbook/)
- [Background Sync API](https://developer.chrome.com/docs/capabilities/periodic-background-sync)

---
