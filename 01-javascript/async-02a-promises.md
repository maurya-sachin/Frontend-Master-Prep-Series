# Promises & Error Handling

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: How do Promises work in JavaScript? Explain promise chaining and error handling

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
What are Promises in JavaScript? How do you create them, chain them, and handle errors? What are the three states of a Promise?

### Answer

**Promise Basics:**
- A Promise is an **object representing eventual completion or failure** of an async operation
- Created with `new Promise((resolve, reject) => { })` constructor
- Returns a promise object immediately, settles (resolves/rejects) later

**Three States:**
1. **Pending:** Initial state, neither fulfilled nor rejected
2. **Fulfilled:** Operation completed successfully (resolved with value)
3. **Rejected:** Operation failed (rejected with reason/error)

**Important characteristics:**
- A promise can only settle **once** (immutable result)
- **Cannot change** from fulfilled to rejected or vice versa
- Promises are **not cancellable** once started
- Handlers (.then/.catch) always execute asynchronously (microtasks)

**Promise Chaining:**
- `.then()` returns a **new promise**, enabling chaining
- Each `.then()` can **transform** the value for the next handler
- Errors **propagate down** the chain until caught
- Return value from `.then()` becomes the resolved value for next `.then()`

### Code Example

```javascript
// ============================================
// Example 1: Creating a basic Promise
// ============================================
const promise = new Promise((resolve, reject) => {
  // Async operation
  const success = true;

  setTimeout(() => {
    if (success) {
      resolve('Operation successful!'); // Fulfills promise
    } else {
      reject(new Error('Operation failed!')); // Rejects promise
    }
  }, 1000);
});

promise
  .then(result => {
    console.log(result); // "Operation successful!"
  })
  .catch(error => {
    console.error(error.message);
  });


// ============================================
// Example 2: Promise states
// ============================================
const pendingPromise = new Promise((resolve) => {
  setTimeout(() => resolve('done'), 1000);
});

console.log(pendingPromise); // Promise { <pending> }

setTimeout(() => {
  console.log(pendingPromise); // Promise { 'done' }
}, 1500);

// Once settled, state never changes
const fulfilledPromise = Promise.resolve('value');
console.log(fulfilledPromise); // Promise { 'value' }

const rejectedPromise = Promise.reject(new Error('error'));
console.log(rejectedPromise); // Promise { <rejected> Error: error }


// ============================================
// Example 3: Promise chaining
// ============================================
fetch('/api/user/1')
  .then(response => {
    console.log('Got response');
    return response.json(); // Returns new promise
  })
  .then(user => {
    console.log('Parsed user:', user.name);
    return fetch(`/api/posts/${user.id}`); // Returns new promise
  })
  .then(response => {
    return response.json();
  })
  .then(posts => {
    console.log('User posts:', posts);
  })
  .catch(error => {
    console.error('Error anywhere in chain:', error);
  });


// ============================================
// Example 4: Transforming values in chain
// ============================================
Promise.resolve(5)
  .then(num => {
    console.log(num); // 5
    return num * 2; // Pass 10 to next .then()
  })
  .then(num => {
    console.log(num); // 10
    return num + 3; // Pass 13 to next .then()
  })
  .then(num => {
    console.log(num); // 13
    return `Result: ${num}`;
  })
  .then(result => {
    console.log(result); // "Result: 13"
  });


// ============================================
// Example 5: Error handling patterns
// ============================================

// Pattern 1: Single catch at the end
Promise.resolve()
  .then(() => {
    throw new Error('Error in step 1');
  })
  .then(() => {
    console.log('This will not execute');
  })
  .catch(error => {
    console.error('Caught:', error.message); // Catches error from any .then()
  });

// Pattern 2: Multiple catch blocks
Promise.resolve()
  .then(() => {
    throw new Error('Error 1');
  })
  .catch(error => {
    console.error('Caught error 1:', error.message);
    return 'recovered'; // Chain continues
  })
  .then(value => {
    console.log('Continuing with:', value); // "recovered"
    throw new Error('Error 2');
  })
  .catch(error => {
    console.error('Caught error 2:', error.message);
  });

// Pattern 3: finally (always executes)
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    console.log('Data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  })
  .finally(() => {
    console.log('Cleanup always runs'); // Runs regardless of success/failure
  });


// ============================================
// Example 6: Common Promise patterns
// ============================================

// Promisifying callback-based functions
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Delay utility
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

delay(1000).then(() => console.log('1 second later'));

// Timeout wrapper
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timeout]);
}

withTimeout(fetch('/api/data'), 5000)
  .then(response => console.log('Completed in time'))
  .catch(error => console.error('Timed out or failed'));


// ============================================
// Example 7: Returning promises vs values
// ============================================

// Returning a value
Promise.resolve(1)
  .then(num => {
    return num + 1; // Returns value
  })
  .then(num => {
    console.log(num); // 2
  });

// Returning a promise
Promise.resolve(1)
  .then(num => {
    return Promise.resolve(num + 1); // Returns promise
  })
  .then(num => {
    console.log(num); // 2 (unwrapped automatically)
  });

// Returning nothing (undefined)
Promise.resolve(1)
  .then(num => {
    console.log(num); // 1
    // No return statement
  })
  .then(num => {
    console.log(num); // undefined
  });


// ============================================
// Example 8: Error propagation
// ============================================
Promise.resolve()
  .then(() => {
    return fetch('/api/user'); // Might fail
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`); // Explicit throw
    }
    return response.json();
  })
  .then(user => {
    console.log('User:', user);
  })
  .catch(error => {
    // Catches network errors, parse errors, and thrown errors
    console.error('Failed to load user:', error.message);
  });


// ============================================
// Example 9: Promise constructor patterns
// ============================================

// Async operation wrapper
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Simulating API call
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: 'John' });
      } else {
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}

fetchUserData(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error.message));

// Validation wrapper
function validateAndFetch(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL'));
      return; // Important: exit after reject
    }

    fetch(url)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}


// ============================================
// Example 10: Anti-patterns to avoid
// ============================================

// ❌ Anti-pattern 1: Nesting promises (promise hell)
fetch('/api/user')
  .then(response => {
    return response.json().then(user => {
      return fetch(`/api/posts/${user.id}`).then(response => {
        return response.json().then(posts => {
          console.log(posts); // Deeply nested
        });
      });
    });
  });

// ✅ Correct: Flat promise chain
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts));

// ❌ Anti-pattern 2: Not returning promises
fetch('/api/user')
  .then(response => {
    response.json(); // Missing return!
  })
  .then(user => {
    console.log(user); // undefined!
  });

// ✅ Correct: Always return
fetch('/api/user')
  .then(response => response.json()) // Returns promise
  .then(user => console.log(user)); // Gets user object

// ❌ Anti-pattern 3: Uncaught rejections
const promise = Promise.reject(new Error('Failed'));
// No .catch() handler - unhandled rejection warning

// ✅ Correct: Always handle rejections
Promise.reject(new Error('Failed'))
  .catch(error => console.error('Handled:', error.message));


// ============================================
// Example 11: Advanced chaining scenarios
// ============================================

// Conditional chaining
function loadUserAndMaybePosts(userId, includePosts = false) {
  return fetch(`/api/user/${userId}`)
    .then(response => response.json())
    .then(user => {
      if (includePosts) {
        return fetch(`/api/posts/${userId}`)
          .then(response => response.json())
          .then(posts => ({ ...user, posts })); // Merge user and posts
      }
      return user; // Return user only
    });
}

// Parallel operations within chain
fetch('/api/user/1')
  .then(response => response.json())
  .then(user => {
    // Start multiple operations in parallel
    return Promise.all([
      fetch(`/api/posts/${user.id}`).then(r => r.json()),
      fetch(`/api/comments/${user.id}`).then(r => r.json()),
      fetch(`/api/likes/${user.id}`).then(r => r.json())
    ]).then(([posts, comments, likes]) => {
      return { user, posts, comments, likes };
    });
  })
  .then(data => {
    console.log('All data loaded:', data);
  });


// ============================================
// Example 12: Real-world usage patterns
// ============================================

// API client with error handling
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  request(endpoint, options = {}) {
    return fetch(`${this.baseURL}${endpoint}`, options)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .then(error => {
              throw new Error(error.message || 'Request failed');
            })
            .catch(() => {
              throw new Error(`HTTP ${response.status}`);
            });
        }
        return response.json();
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error; // Re-throw for caller to handle
      });
  }

  getUser(id) {
    return this.request(`/users/${id}`);
  }

  updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

const api = new APIClient('https://api.example.com');

api.getUser(123)
  .then(user => {
    console.log('User loaded:', user);
    return api.updateUser(123, { name: 'Updated' });
  })
  .then(updatedUser => {
    console.log('User updated:', updatedUser);
  })
  .catch(error => {
    console.error('Operation failed:', error.message);
  });


// ============================================
// Example 13: Promise static methods
// ============================================

// Promise.resolve() - immediately resolved
const resolved = Promise.resolve('value');
resolved.then(v => console.log(v)); // 'value'

// Promise.reject() - immediately rejected
const rejected = Promise.reject(new Error('error'));
rejected.catch(e => console.error(e.message)); // 'error'

// Wrapping non-promise values
Promise.resolve(42).then(v => console.log(v)); // 42
Promise.resolve(Promise.resolve(42)).then(v => console.log(v)); // 42 (flattened)
```

### Common Mistakes

- ❌ **Mistake:** Forgetting to return promises in chain
  ```javascript
  fetch('/api/user')
    .then(response => {
      response.json(); // Missing return!
    })
    .then(user => {
      console.log(user); // undefined
    });
  ```

- ❌ **Mistake:** Creating promise hell with nesting
  ```javascript
  fetch('/api/user').then(r1 => {
    r1.json().then(user => {
      fetch('/api/posts').then(r2 => {
        r2.json().then(posts => {
          // Too nested!
        });
      });
    });
  });
  ```

- ❌ **Mistake:** Not handling rejections
  ```javascript
  const promise = fetch('/api/data').then(r => r.json());
  // No .catch() - unhandled rejection if fetch fails
  ```

- ✅ **Correct:** Proper chaining and error handling
  ```javascript
  fetch('/api/user')
    .then(response => response.json()) // Return promise
    .then(user => fetch(`/api/posts/${user.id}`)) // Return promise
    .then(response => response.json()) // Return promise
    .then(posts => console.log(posts))
    .catch(error => console.error(error)); // Handle all errors
  ```

<details>
<summary><strong>🔍 Deep Dive: V8 Promise Implementation</strong></summary>

**Internal Architecture:**

Promises in V8 are implemented as **PromiseCapability** objects with internal slots:

```cpp
// Simplified V8 internal representation
class JSPromise {
  PromiseState state_;        // pending, fulfilled, rejected
  JSAny result_;              // value or reason
  PromiseReaction* reactions_; // list of .then() handlers
  bool has_handler_;           // for unhandled rejection tracking
};

enum PromiseState {
  kPending,    // 0
  kFulfilled,  // 1
  kRejected    // 2
};
```

**Promise State Machine:**

```javascript
// When you create a promise, V8 allocates a PromiseCapability

const promise = new Promise((resolve, reject) => {
  // V8 creates:
  // - PromiseCapability { [[Promise]], [[Resolve]], [[Reject]] }
  // - [[Promise]]: The promise object
  // - [[Resolve]]: Internal resolve function
  // - [[Reject]]: Internal reject function

  setTimeout(() => {
    resolve('value'); // Calls internal [[Resolve]]
  }, 1000);
});

// Internal state transitions (irreversible):
// pending → fulfilled (with value)
// pending → rejected (with reason)
// Cannot transition from fulfilled/rejected to any other state
```

**Promise Chaining Mechanism:**

```javascript
// Every .then() creates a new promise

const p1 = Promise.resolve(1);

const p2 = p1.then(value => {
  return value * 2;
});

// Internally, V8:
// 1. Creates new promise (p2)
// 2. Registers reaction on p1
// 3. When p1 fulfills, reaction fires
// 4. Reaction result fulfills p2

// V8 uses PromiseReaction objects:
class PromiseReaction {
  PromiseCapability capability;  // The new promise
  JobCallback handler;           // The .then() callback
  PromiseReaction* next;         // Linked list
};
```

**Microtask Queue Integration:**

```javascript
// Promises use the microtask queue (higher priority than timers)

console.log('1: Sync');

Promise.resolve().then(() => {
  console.log('2: Microtask');
});

setTimeout(() => {
  console.log('3: Macrotask');
}, 0);

console.log('4: Sync');

// V8 execution:
// 1. Execute sync code: "1: Sync", "4: Sync"
// 2. Call stack empty → check microtask queue
// 3. Execute microtask: "2: Microtask"
// 4. Microtask queue empty → check macrotask queue
// 5. Execute macrotask: "3: Macrotask"
```

**Promise Resolution Procedure:**

```javascript
// V8 follows spec's Promise Resolution Procedure

// Case 1: Resolve with value
Promise.resolve(42)
  .then(v => console.log(v)); // 42

// Case 2: Resolve with promise (flattening)
Promise.resolve(Promise.resolve(42))
  .then(v => console.log(v)); // 42 (not Promise)

// Internally, V8 unwraps nested promises:
function resolvePromise(promise, value) {
  if (value === promise) {
    // TypeError: Cannot resolve promise with itself
    rejectPromise(promise, new TypeError('Chaining cycle'));
  } else if (value instanceof Promise) {
    // Unwrap: adopt the state of the inner promise
    value.then(
      (v) => resolvePromise(promise, v),
      (r) => rejectPromise(promise, r)
    );
  } else {
    // Regular value: fulfill immediately
    fulfillPromise(promise, value);
  }
}
```

**Memory Layout:**

```javascript
// Promise memory structure in V8

const promise = new Promise((resolve) => {
  setTimeout(() => resolve('value'), 1000);
});

// Heap allocation:
// ┌─────────────────────────┐
// │ JSPromise               │
// │  state: kPending        │ ← 4 bytes
// │  result: undefined      │ ← pointer (8 bytes on 64-bit)
// │  reactions: [...]       │ ← pointer to linked list
// │  has_handler: false     │ ← 1 byte
// └─────────────────────────┘
// Total: ~32 bytes (+ reactions list)

// After resolution:
// ┌─────────────────────────┐
// │ JSPromise               │
// │  state: kFulfilled      │
// │  result: 'value'        │ ← now points to string
// │  reactions: null        │ ← cleared after settlement
// │  has_handler: true      │
// └─────────────────────────┘

// Reactions are garbage collected after promise settles
```

**Performance Characteristics:**

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| Create promise | O(1) | Allocates PromiseCapability |
| Add .then() handler | O(1) | Appends to reactions list |
| Resolve promise | O(n) | Where n = number of handlers |
| Chain promises | O(1) | Creates new promise |
| Promise.resolve() | O(1) | Immediate if not thenable |

**Optimization - Promise Inlining:**

```javascript
// V8 can optimize simple promise chains via TurboFan

// Unoptimized (generic promise handling):
function fetchUser(id) {
  return fetch(`/api/user/${id}`)
    .then(r => r.json());
}

// After warming up (10+ calls), TurboFan:
// 1. Inlines the .then() callback
// 2. Eliminates intermediate promise allocations
// 3. Direct jump to callback when promise resolves
// → 30-50% faster execution

// Benchmark:
console.time('cold');
for (let i = 0; i < 10; i++) {
  await fetchUser(i);
}
console.timeEnd('cold'); // ~150ms

console.time('hot');
for (let i = 0; i < 10; i++) {
  await fetchUser(i);
}
console.timeEnd('hot'); // ~100ms (optimized!)
```

**Error Handling Internals:**

```javascript
// V8 tracks unhandled rejections

const promise = Promise.reject(new Error('Failed'));
// No .catch() handler!

// V8's behavior:
// 1. Promise transitions to rejected state
// 2. Check: has_handler === false
// 3. Add to unhandled rejection list
// 4. On next microtask checkpoint:
//    - Trigger 'unhandledrejection' event
//    - Console warning in development
//    - Crash in strict mode (Node.js --unhandled-rejections=strict)

// Later, if you add a handler:
promise.catch(err => console.error(err));
// V8 removes from unhandled list
// Triggers 'rejectionhandled' event
```

**Thenable Support:**

```javascript
// V8 recognizes "thenable" objects (duck typing)

const thenable = {
  then(onFulfilled, onRejected) {
    setTimeout(() => onFulfilled('value'), 1000);
  }
};

// V8 treats this as promise-like:
Promise.resolve(thenable)
  .then(value => console.log(value)); // 'value'

// Internally, V8 calls the .then() method
// and waits for it to call onFulfilled/onRejected
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Promise Chain Memory Leak</strong></summary>

**Scenario**: Your single-page application (SPA) becomes slower over time, memory usage grows continuously, and after 30 minutes of use, the browser tab crashes with "Out of Memory" error.

**The Problem:**

```javascript
// ❌ MEMORY LEAK: Promises holding references

class DataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async fetchUser(userId) {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    // Check if request is already in progress
    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId);
    }

    // Create new request
    const promise = fetch(`/api/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        this.cache.set(userId, user);
        this.pendingRequests.delete(userId); // ⚠️ Deletes AFTER promise resolves
        return user;
      })
      .catch(error => {
        console.error(`Failed to fetch user ${userId}:`, error);
        this.pendingRequests.delete(userId);
        throw error;
      });

    // Store pending promise
    this.pendingRequests.set(userId, promise);
    return promise;
  }

  clearCache() {
    this.cache.clear();
    // ❌ BUG: Forgot to clear pendingRequests!
    // Promises keep references to old data
  }
}

// Usage in SPA (router changes every 5 seconds):
const service = new DataService();

setInterval(() => {
  // Load 100 users on each page
  const userIds = Array.from({length: 100}, (_, i) => i);

  userIds.forEach(id => {
    service.fetchUser(id)
      .then(user => displayUser(user))
      .catch(err => showError(err));
  });

  // Clear cache after page load
  setTimeout(() => {
    service.clearCache(); // Doesn't clear pendingRequests!
  }, 1000);
}, 5000);

// Result after 30 minutes:
// - 360 page loads × 100 users = 36,000 user fetches
// - Many failed requests stay in pendingRequests Map
// - Each promise holds closure over response data
// - Memory grows: 0MB → 500MB → 1GB → CRASH
```

**Debugging Steps:**

1. **Take heap snapshots in Chrome DevTools**:
   ```javascript
   // Before page load
   // Memory: 50MB

   // After 10 minutes
   // Memory: 300MB (should be ~50MB)

   // Heap snapshot comparison shows:
   // - 10,000+ Promise objects retained
   // - 10,000+ pending fetch responses
   // - Closure scopes holding large objects
   ```

2. **Identify memory growth**:
   ```javascript
   console.log('Cache size:', service.cache.size);
   // 100 (as expected - cleared regularly)

   console.log('Pending requests:', service.pendingRequests.size);
   // 5,234 (PROBLEM! Should be ~0)

   // Failed requests never get deleted from pendingRequests
   ```

3. **Analyze promise chain**:
   ```javascript
   // Chrome DevTools → Memory → Heap Snapshot
   // Search for "Promise"
   // Find retained promises with closure scopes
   // Holding references to old DOM nodes, data, event listeners
   ```

**Solution 1: Proper cleanup**

```javascript
// ✅ FIX: Clean up properly

class DataService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.abortControllers = new Map(); // NEW: Track abort controllers
  }

  async fetchUser(userId) {
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId);
    }

    // Create abort controller
    const controller = new AbortController();
    this.abortControllers.set(userId, controller);

    const promise = fetch(`/api/user/${userId}`, {
      signal: controller.signal
    })
      .then(response => response.json())
      .then(user => {
        this.cache.set(userId, user);
        return user;
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log(`Request for user ${userId} was aborted`);
          return null;
        }
        console.error(`Failed to fetch user ${userId}:`, error);
        throw error;
      })
      .finally(() => {
        // CRITICAL: Always clean up
        this.pendingRequests.delete(userId);
        this.abortControllers.delete(userId);
      });

    this.pendingRequests.set(userId, promise);
    return promise;
  }

  clearCache() {
    this.cache.clear();

    // Abort all pending requests
    for (const [userId, controller] of this.abortControllers) {
      controller.abort();
    }

    this.pendingRequests.clear();
    this.abortControllers.clear();
  }

  destroy() {
    // Call on component unmount
    this.clearCache();
    this.cache = null;
    this.pendingRequests = null;
    this.abortControllers = null;
  }
}
```

**Solution 2: WeakMap for automatic cleanup**

```javascript
// ✅ BETTER: Use WeakMap for automatic garbage collection

class DataService {
  constructor() {
    // WeakMap allows garbage collection of unused keys
    this.cache = new WeakMap();
    this.pendingRequests = new Map(); // Still need Map for iteration
    this.requestTimeouts = new Map();
    this.MAX_PENDING_TIME = 30000; // 30 seconds
  }

  async fetchUser(userKey, userId) {
    // userKey is an object (for WeakMap)
    // userId is the actual ID to fetch

    if (this.cache.has(userKey)) {
      return this.cache.get(userKey);
    }

    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId);
    }

    const promise = fetch(`/api/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        this.cache.set(userKey, user); // WeakMap
        return user;
      })
      .finally(() => {
        this.pendingRequests.delete(userId);
        clearTimeout(this.requestTimeouts.get(userId));
        this.requestTimeouts.delete(userId);
      });

    this.pendingRequests.set(userId, promise);

    // Auto-cleanup after timeout
    const timeoutId = setTimeout(() => {
      this.pendingRequests.delete(userId);
      this.requestTimeouts.delete(userId);
      console.warn(`Cleaned up stale request for user ${userId}`);
    }, this.MAX_PENDING_TIME);

    this.requestTimeouts.set(userId, timeoutId);

    return promise;
  }
}

// Usage with WeakMap:
const userKeys = {}; // Create object keys
const service = new DataService();

// When userKey goes out of scope, WeakMap entry is garbage collected
let userKey = { id: 1 };
service.fetchUser(userKey, 1);

userKey = null; // Cache entry can now be GC'd
```

**Solution 3: LRU Cache with size limit**

```javascript
// ✅ BEST: Implement LRU cache with automatic eviction

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

class DataService {
  constructor() {
    this.cache = new LRUCache(100); // Max 100 cached users
    this.pendingRequests = new Map();

    // Periodic cleanup of old pending requests
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [userId, data] of this.pendingRequests) {
        if (now - data.timestamp > 30000) {
          this.pendingRequests.delete(userId);
          console.log(`Cleaned up stale request for user ${userId}`);
        }
      }
    }, 60000); // Every minute
  }

  async fetchUser(userId) {
    const cached = this.cache.get(userId);
    if (cached) return cached;

    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId).promise;
    }

    const timestamp = Date.now();
    const promise = fetch(`/api/user/${userId}`)
      .then(response => response.json())
      .then(user => {
        this.cache.set(userId, user);
        return user;
      })
      .finally(() => {
        this.pendingRequests.delete(userId);
      });

    this.pendingRequests.set(userId, { promise, timestamp });
    return promise;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
    this.pendingRequests.clear();
  }
}
```

**Performance Comparison:**

| Approach | Memory (30 min) | Request Speed | Cleanup Complexity |
|----------|----------------|---------------|-------------------|
| **Original (leak)** | 1GB+ (crash) | Fast | None |
| **Manual cleanup** | 50-80MB | Fast | High |
| **WeakMap** | 60-90MB | Fast | Medium |
| **LRU Cache** | 40-60MB | Fast | Low (automatic) |

**Production Metrics After Fix:**

```javascript
// Before (Memory leak):
// - Memory after 30 min: 1GB+
// - Pending requests: 10,000+
// - Browser crashes
// - User complaints: "Page becomes slow and freezes"

// After (LRU Cache):
// - Memory after 30 min: 50MB (stable)
// - Pending requests: <10 (healthy)
// - No crashes
// - Cache hit rate: 85%
// - User satisfaction: "Fast and smooth"
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Promise Patterns</strong></summary>

**1. Promise Creation: new Promise() vs Promise.resolve()**

```javascript
// Pattern 1: new Promise() - Full control
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve('success');
    } else {
      reject(new Error('failed'));
    }
  }, 1000);
});

// Pattern 2: Promise.resolve() - Immediate resolution
const promise2 = Promise.resolve('success');

// Pattern 3: Async function - Cleaner syntax
async function createPromise() {
  await delay(1000);
  if (Math.random() > 0.5) {
    return 'success';
  }
  throw new Error('failed');
}
```

| Approach | Use When | Pros | Cons |
|----------|----------|------|------|
| **new Promise()** | Wrapping callbacks, complex logic | Full control, explicit | Verbose, easy to forget reject |
| **Promise.resolve()** | Wrapping known values | Fast, simple | Limited use cases |
| **async/await** | Modern code, readability | Clean syntax, try-catch works | Requires function wrapper |

**2. Error Handling: .catch() vs try-catch**

```javascript
// Pattern 1: .catch() at end of chain
fetch('/api/data')
  .then(r => r.json())
  .then(data => processData(data))
  .then(result => saveResult(result))
  .catch(error => {
    console.error('Error anywhere in chain:', error);
  });

// Pattern 2: Multiple .catch() blocks
fetch('/api/data')
  .then(r => r.json())
  .catch(parseError => {
    console.error('Parse failed, using default');
    return { default: true };
  })
  .then(data => processData(data))
  .catch(processError => {
    console.error('Process failed');
    throw processError;
  });

// Pattern 3: try-catch with async/await
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    const result = await processData(data);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Pattern 4: try-catch per operation
async function loadDataDetailed() {
  let response;
  try {
    response = await fetch('/api/data');
  } catch (fetchError) {
    console.error('Fetch failed:', fetchError);
    throw new Error('Network error');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Parse failed:', parseError);
    throw new Error('Invalid JSON');
  }

  return data;
}
```

| Approach | Granularity | Readability | Error Detail | Use Case |
|----------|-------------|-------------|--------------|----------|
| **.catch() at end** | Coarse | Good | Low | Simple chains |
| **Multiple .catch()** | Fine | Medium | High | Recovery logic |
| **Single try-catch** | Coarse | Excellent | Low | Clean code |
| **Multiple try-catch** | Fine | Good | High | Detailed errors |

**3. Promise Chaining vs Promise.all()**

```javascript
// Scenario: Load user data + posts + comments

// Pattern 1: Sequential (slow)
async function loadSequential(userId) {
  console.time('sequential');

  const user = await fetchUser(userId);      // 300ms
  const posts = await fetchPosts(userId);    // 300ms
  const comments = await fetchComments(userId); // 300ms

  console.timeEnd('sequential'); // ~900ms total
  return { user, posts, comments };
}

// Pattern 2: Parallel (fast)
async function loadParallel(userId) {
  console.time('parallel');

  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchComments(userId)
  ]);

  console.timeEnd('parallel'); // ~300ms total (3x faster!)
  return { user, posts, comments };
}

// Pattern 3: Dependent sequential
async function loadDependent(userId) {
  console.time('dependent');

  const user = await fetchUser(userId);        // 300ms

  // These depend on user data, must wait
  const [posts, comments] = await Promise.all([
    fetchPosts(user.id),                       // 300ms (parallel)
    fetchComments(user.id)
  ]);

  console.timeEnd('dependent'); // ~600ms total
  return { user, posts, comments };
}
```

**Performance Impact:**

| Pattern | Time | Network Usage | Complexity | Use When |
|---------|------|---------------|------------|----------|
| **Sequential** | 900ms | 1 request at a time | Low | Dependencies exist |
| **Parallel** | 300ms | 3 concurrent requests | Low | Independent data |
| **Mixed** | 600ms | Optimized | Medium | Partial dependencies |

**4. Memory Trade-offs:**

```javascript
// Pattern 1: Store all promises (high memory)
const promises = [];
for (let i = 0; i < 10000; i++) {
  promises.push(fetchData(i));
}
await Promise.all(promises);
// Memory: 10,000 promises × ~100 bytes = ~1MB

// Pattern 2: Process in batches (lower memory)
for (let i = 0; i < 10000; i += 100) {
  const batch = Array.from({length: 100}, (_, j) => i + j);
  const promises = batch.map(id => fetchData(id));
  await Promise.all(promises);
}
// Memory: 100 promises × ~100 bytes = ~10KB per batch

// Pattern 3: Sequential (lowest memory, slowest)
for (let i = 0; i < 10000; i++) {
  await fetchData(i);
}
// Memory: 1 promise × ~100 bytes = ~100 bytes
```

| Approach | Time | Peak Memory | Throughput | Server Load |
|----------|------|-------------|------------|-------------|
| **All at once** | Fast (~1s) | High (1MB) | High | Spike (10k concurrent) |
| **Batched** | Medium (~10s) | Low (10KB) | Medium | Steady (100 concurrent) |
| **Sequential** | Slow (~50s) | Lowest (100B) | Low | Minimal (1 at a time) |

**5. Error Recovery Strategies:**

```javascript
// Strategy 1: Fail fast (Promise.all)
try {
  await Promise.all([fetch1(), fetch2(), fetch3()]);
} catch (error) {
  // If ANY fails, entire operation fails
  // Use when: All data is critical
}

// Strategy 2: Partial success (Promise.allSettled)
const results = await Promise.allSettled([fetch1(), fetch2(), fetch3()]);
const successful = results.filter(r => r.status === 'fulfilled');
// Use when: Some data is acceptable

// Strategy 3: Retry on failure
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
// Use when: Transient failures expected

// Strategy 4: Fallback sources
async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      return await fetch(url);
    } catch (error) {
      console.log(`${url} failed, trying next...`);
    }
  }
  throw new Error('All sources failed');
}
// Use when: Multiple data sources available
```

**Decision Matrix:**

| Requirement | Choose | Why |
|-------------|--------|-----|
| **All must succeed** | Promise.all + fail fast | Simplest, clearest intent |
| **Some can fail** | Promise.allSettled | Partial data acceptable |
| **Fastest result** | Promise.race | Timeout or fallback |
| **Any success** | Promise.any | Multiple sources |
| **Dependencies** | Sequential await | Order matters |
| **Independent** | Promise.all parallel | Maximize speed |
| **Many requests** | Batched | Control concurrency |

</details>

<details>
<summary><strong>💬 Explain to Junior: Promises Explained</strong></summary>

**Simple Analogy: Restaurant Order**

Imagine you're at a restaurant:

**Synchronous (Blocking):**
- You order food
- You **stand at the counter waiting** until it's ready
- You can't do anything else
- When food arrives, you eat
- **Total time**: 30 minutes of standing

**Asynchronous (Promise):**
- You order food → Get a **receipt with order number** (Promise)
- You go sit down (continue with life)
- When food is ready, they call your number (Promise resolves)
- You go get your food
- **Total time**: 2 minutes waiting at counter + 28 minutes doing other things

```javascript
// Synchronous (blocking)
function orderFoodSync() {
  const food = waitForFood(); // Blocks for 30 minutes!
  eat(food);
}

// Asynchronous (Promise)
function orderFoodAsync() {
  const receipt = orderFood(); // Returns immediately

  receipt.then(food => {
    // Called when food is ready
    eat(food);
  });

  // Can do other things while waiting!
  checkPhone();
  chatWithFriends();
}
```

**Promise States = Order Status**

```javascript
// 1. PENDING: Order is being prepared
const order = new Promise((resolve) => {
  setTimeout(() => resolve('🍕 Pizza'), 1000);
});
console.log(order); // Promise { <pending> }

// 2. FULFILLED: Order is ready!
setTimeout(() => {
  console.log(order); // Promise { '🍕 Pizza' }
}, 1500);

// 3. REJECTED: Kitchen ran out of ingredients
const failedOrder = new Promise((resolve, reject) => {
  reject(new Error('Out of pizza dough'));
});
console.log(failedOrder); // Promise { <rejected> Error }
```

**Promise Chaining = Multi-step Order**

```javascript
// Step 1: Order pizza
// Step 2: Wait for pizza
// Step 3: Get drinks
// Step 4: Find table
// Step 5: Eat!

orderPizza()
  .then(pizza => {
    console.log('Got pizza!');
    return getDrinks(); // Next step
  })
  .then(drinks => {
    console.log('Got drinks!');
    return findTable(); // Next step
  })
  .then(table => {
    console.log('Found table!');
    return 'Ready to eat!';
  })
  .then(status => {
    console.log(status);
  })
  .catch(error => {
    console.error('Something went wrong:', error);
  });

// vs Callback hell (nested):
orderPizza((pizza) => {
  getDrinks((drinks) => {
    findTable((table) => {
      console.log('Ready to eat!'); // Deeply nested!
    });
  });
});
```

**Explaining to PM:**

"Promises are like tracking numbers for packages:

1. **Order package** (create promise)
   - You get a tracking number immediately
   - You can check status anytime
   - You can tell others the tracking number

2. **Package in transit** (pending)
   - You're not stuck waiting at door
   - You do other things
   - Check status occasionally

3. **Package delivered** (fulfilled)
   - Notification arrives
   - You get your package
   - Happy!

4. **Package lost** (rejected)
   - Notification of problem
   - You handle it (refund, reorder)
   - Not happy, but you know what happened

**Why it matters:**
- Users can keep browsing while we load data
- App doesn't freeze
- Better user experience
- We can handle errors gracefully"

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Not returning promises
fetch('/api/user')
  .then(response => {
    response.json(); // MISSING return!
  })
  .then(user => {
    console.log(user); // undefined! ❌
  });

// ✅ CORRECT: Always return
fetch('/api/user')
  .then(response => response.json()) // return!
  .then(user => console.log(user)); // Works! ✅


// ❌ MISTAKE 2: Nesting promises (callback hell 2.0)
fetch('/api/user').then(response => {
  response.json().then(user => {
    fetch('/api/posts').then(response => {
      response.json().then(posts => {
        // Nested mess! ❌
      });
    });
  });
});

// ✅ CORRECT: Flat chain
fetch('/api/user')
  .then(r => r.json())
  .then(user => fetch('/api/posts'))
  .then(r => r.json())
  .then(posts => console.log(posts)); // Clean! ✅


// ❌ MISTAKE 3: Forgetting error handling
fetch('/api/data')
  .then(r => r.json())
  .then(data => console.log(data));
// No .catch() - error goes unhandled! ❌

// ✅ CORRECT: Always catch errors
fetch('/api/data')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(error => {
    console.error('Failed:', error);
    showErrorMessage('Could not load data');
  }); // Handled! ✅
```

**Visual Execution Order:**

```javascript
console.log('1: Start');

Promise.resolve()
  .then(() => console.log('2: Promise'));

console.log('3: End');

// Output:
// 1: Start
// 3: End
// 2: Promise

// Why?
// 1. Synchronous code runs first (1, 3)
// 2. Promises go to microtask queue
// 3. After synchronous code, microtasks run (2)
```

**Practice Exercise:**

```javascript
// Guess the output:

console.log('A');

Promise.resolve()
  .then(() => {
    console.log('B');
    return Promise.resolve();
  })
  .then(() => console.log('C'));

setTimeout(() => console.log('D'), 0);

console.log('E');

// Answer: A, E, B, C, D

// Why?
// A, E: Synchronous (run immediately)
// B, C: Microtasks (Promise callbacks)
// D: Macrotask (setTimeout) - runs last
```

**Key Takeaways for Juniors:**

1. **Promises are objects** representing future values
2. **Three states**: pending → fulfilled or rejected
3. **Always return** in .then() to chain
4. **Always catch** errors with .catch()
5. **Don't nest** - keep chains flat
6. **Microtasks run before macrotasks** (Promises before setTimeout)

**When to Use What:**

```javascript
// ✅ Use Promise when:
// - Working with APIs (fetch)
// - Any async operation
// - Need to handle success/failure

// ✅ Use async/await when:
// - Writing new code (cleaner syntax)
// - Multiple async operations
// - Need try-catch for errors

// ❌ Don't use callbacks when:
// - Promises are available (avoid callback hell)
// - You control the API (use Promises instead)
```

</details>

### Follow-up Questions

- "What is the difference between Promise.all and Promise.allSettled?"
- "How would you implement a retry mechanism for failed promises?"
- "Can you cancel a promise? If not, how would you work around it?"
- "What is promise resolve thenable, and how does it work?"
- "How do you handle promise memory leaks in long-running applications?"

### Resources

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [JavaScript.info: Promise chaining](https://javascript.info/promise-chaining)
- [You Don't Know JS: Async & Performance](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/async%20&%20performance/ch3.md)

---

