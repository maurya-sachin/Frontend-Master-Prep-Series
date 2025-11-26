# Promises - Static Methods

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: Explain Promise.all, Promise.race, Promise.allSettled, and Promise.any

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Meta, Amazon, Apple, Netflix

### Question
What are the differences between Promise.all, Promise.race, Promise.allSettled, and Promise.any? When would you use each one? What happens when promises reject?

### Answer

**Promise.all(promises):**
- Waits for **all** promises to fulfill
- Returns **array of results** in same order as input
- **Fails fast**: Rejects immediately if ANY promise rejects
- Use when: All operations must succeed

**Promise.race(promises):**
- Returns **first settled** promise (fulfilled or rejected)
- Ignores remaining promises (they still run, but results ignored)
- Use when: Only need fastest result, timeout implementations

**Promise.allSettled(promises):**
- Waits for **all** promises to settle (fulfill OR reject)
- **Never rejects** - always fulfills with array of results
- Each result has `{status, value}` or `{status, reason}`
- Use when: Need results from all, regardless of success/failure

**Promise.any(promises):**
- Returns **first fulfilled** promise
- Ignores rejections until all promises reject
- Rejects only if ALL promises reject (AggregateError)
- Use when: Need any successful result, fallback scenarios

### Code Example

```javascript
// ============================================
// Example 1: Promise.all - all must succeed
// ============================================

// All succeed
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});

// One fails - entire operation fails
Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3)
])
.then(results => {
  console.log('Success:', results); // Never executes
})
.catch(error => {
  console.error('Failed:', error.message); // "Failed"
  // Note: We don't know about result 1 or 3
});

// Real-world example: Loading multiple resources
async function loadPageData() {
  try {
    const [user, posts, comments] = await Promise.all([
      fetch('/api/user/1').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);

    console.log('All data loaded:', { user, posts, comments });
    return { user, posts, comments };
  } catch (error) {
    console.error('Failed to load page data:', error);
    // Can't render page if any resource fails
    throw error;
  }
}


// ============================================
// Example 2: Promise.race - first to settle wins
// ============================================

// First to resolve
Promise.race([
  new Promise(resolve => setTimeout(() => resolve('slow'), 2000)),
  new Promise(resolve => setTimeout(() => resolve('fast'), 100))
]).then(result => {
  console.log(result); // "fast"
});

// First to reject
Promise.race([
  new Promise((_, reject) => setTimeout(() => reject('error'), 100)),
  new Promise(resolve => setTimeout(() => resolve('success'), 200))
])
.then(result => {
  console.log(result); // Never executes
})
.catch(error => {
  console.error(error); // "error"
});

// Timeout implementation
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error or timeout:', error.message));

// First successful API (primary/fallback)
Promise.race([
  fetch('https://api-primary.com/data'),
  fetch('https://api-backup.com/data')
])
.then(response => response.json())
.then(data => console.log('Got data from fastest server:', data));


// ============================================
// Example 3: Promise.allSettled - all results matter
// ============================================

Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3),
  Promise.reject(new Error('Also failed'))
]).then(results => {
  console.log(results);
  /* [
    { status: 'fulfilled', value: 1 },
    { status: 'rejected', reason: Error: Failed },
    { status: 'fulfilled', value: 3 },
    { status: 'rejected', reason: Error: Also failed }
  ] */

  // Process results
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  console.log('Successful:', successful); // [1, 3]
  console.log('Failed:', failed.length); // 2
});

// Real-world: Load multiple users (some may not exist)
async function loadUsers(ids) {
  const results = await Promise.allSettled(
    ids.map(id =>
      fetch(`/api/user/${id}`)
        .then(r => {
          if (!r.ok) throw new Error(`User ${id} not found`);
          return r.json();
        })
    )
  );

  const users = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const errors = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason.message);

  console.log(`Loaded ${users.length} users, ${errors.length} failed`);

  return { users, errors };
}

loadUsers([1, 2, 999, 3, 888]).then(result => {
  console.log('Result:', result);
  // { users: [user1, user2, user3], errors: ['User 999...', 'User 888...'] }
});


// ============================================
// Example 4: Promise.any - first success wins
// ============================================

// First to fulfill
Promise.any([
  Promise.reject(new Error('Error 1')),
  new Promise(resolve => setTimeout(() => resolve('Success!'), 100)),
  Promise.reject(new Error('Error 2'))
]).then(result => {
  console.log(result); // "Success!"
});

// All rejected - AggregateError
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.reject(new Error('Error 3'))
])
.then(result => {
  console.log(result); // Never executes
})
.catch(error => {
  console.error(error); // AggregateError
  console.error(error.errors); // [Error: Error 1, Error: Error 2, Error: Error 3]
});

// Real-world: Multiple image CDNs
async function loadImageFromCDN(imagePath) {
  const cdnUrls = [
    `https://cdn1.example.com/${imagePath}`,
    `https://cdn2.example.com/${imagePath}`,
    `https://cdn3.example.com/${imagePath}`
  ];

  try {
    const response = await Promise.any(
      cdnUrls.map(url => fetch(url))
    );

    if (!response.ok) {
      throw new Error('Image not found on any CDN');
    }

    return await response.blob();
  } catch (error) {
    console.error('All CDNs failed:', error);
    throw error;
  }
}


// ============================================
// Example 5: Comparison of all four methods
// ============================================
const promises = [
  new Promise(resolve => setTimeout(() => resolve('A'), 1000)),
  new Promise((_, reject) => setTimeout(() => reject('B error'), 500)),
  new Promise(resolve => setTimeout(() => resolve('C'), 1500))
];

// Promise.all - fails fast
Promise.all(promises)
  .then(r => console.log('all:', r))
  .catch(e => console.log('all error:', e)); // "all error: B error"

// Promise.race - first to settle
Promise.race(promises)
  .then(r => console.log('race:', r))
  .catch(e => console.log('race error:', e)); // "race error: B error" (first to settle)

// Promise.allSettled - all results
Promise.allSettled(promises)
  .then(r => console.log('allSettled:', r));
  // All three results with status

// Promise.any - first success
Promise.any(promises)
  .then(r => console.log('any:', r)) // "any: A" (first success)
  .catch(e => console.log('any error:', e));


// ============================================
// Example 6: Timing and performance
// ============================================

// Promise.all - waits for slowest
console.time('all');
Promise.all([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('all'); // ~300ms (slowest)
});

// Promise.race - waits for fastest
console.time('race');
Promise.race([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('race'); // ~100ms (fastest)
});

// Promise.allSettled - waits for slowest (like .all)
console.time('allSettled');
Promise.allSettled([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('allSettled'); // ~300ms (slowest)
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================
// Example 7: Practical use cases
// ============================================

// Use case 1: Parallel validation (all must pass)
async function validateForm(formData) {
  try {
    await Promise.all([
      validateEmail(formData.email),
      validatePassword(formData.password),
      validateUsername(formData.username)
    ]);

    console.log('All validations passed');
    return true;
  } catch (error) {
    console.error('Validation failed:', error.message);
    return false;
  }
}

// Use case 2: Competitive requests (fastest wins)
async function getCurrencyRate(from, to) {
  const apis = [
    fetch(`https://api1.com/rate/${from}/${to}`),
    fetch(`https://api2.com/rate/${from}/${to}`),
    fetch(`https://api3.com/rate/${from}/${to}`)
  ];

  try {
    const response = await Promise.race(apis);
    return await response.json();
  } catch (error) {
    console.error('All APIs too slow or failed');
    throw error;
  }
}

// Use case 3: Partial success acceptable
async function sendNotifications(users, message) {
  const results = await Promise.allSettled(
    users.map(user => sendEmail(user.email, message))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Sent: ${sent}, Failed: ${failed}`);

  return {
    sent,
    failed,
    details: results
  };
}

// Use case 4: Fallback servers (any success)
async function fetchFromMirrors(path) {
  const mirrors = [
    fetch(`https://mirror1.com/${path}`),
    fetch(`https://mirror2.com/${path}`),
    fetch(`https://mirror3.com/${path}`)
  ];

  try {
    const response = await Promise.any(mirrors);
    return await response.json();
  } catch (error) {
    console.error('All mirrors failed:', error.errors);
    throw new Error('Resource unavailable from all mirrors');
  }
}


// ============================================
// Example 8: Custom implementations
// ============================================

// Implementing Promise.all manually
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // Fail fast
    });
  });
}

// Implementing Promise.allSettled manually
function promiseAllSettled(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}


// ============================================
// Example 9: Error handling patterns
// ============================================

// With Promise.all
async function loadAllOrNone() {
  try {
    const data = await Promise.all([
      fetchData1(),
      fetchData2(),
      fetchData3()
    ]);
    return data;
  } catch (error) {
    console.error('Operation failed, no partial results');
    throw error;
  }
}

// With Promise.allSettled
async function loadAllWithPartial() {
  const results = await Promise.allSettled([
    fetchData1(),
    fetchData2(),
    fetchData3()
  ]);

  const data = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (data.length === 0) {
    throw new Error('All requests failed');
  }

  return data; // Return whatever succeeded
}

// With Promise.any
async function loadFirstSuccess() {
  try {
    const data = await Promise.any([
      fetchData1(),
      fetchData2(),
      fetchData3()
    ]);
    return data;
  } catch (error) {
    console.error('All sources failed:', error.errors);
    throw new Error('No data available from any source');
  }
}


// ============================================
// Example 10: Advanced patterns
// ============================================

// Batch processing with concurrency limit
async function processBatchesWithLimit(items, batchSize, processor) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );

    results.push(...batchResults);

    console.log(`Processed batch ${i / batchSize + 1}`);
  }

  return results;
}

// Retry with fallbacks
async function fetchWithFallbacks(urls, maxRetries = 3) {
  for (const url of urls) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log(`${url} attempt ${attempt} failed`);

        if (attempt === maxRetries) {
          console.log(`${url} exhausted, trying next URL`);
        }
      }
    }
  }

  throw new Error('All URLs and retries exhausted');
}

// First N successes
async function getFirstNSuccesses(promises, n) {
  const results = [];

  for (const promise of promises) {
    try {
      const result = await promise;
      results.push(result);

      if (results.length === n) {
        return results;
      }
    } catch (error) {
      // Continue to next promise
      console.log('Promise failed, trying next');
    }
  }

  if (results.length < n) {
    throw new Error(`Only got ${results.length} successes, needed ${n}`);
  }

  return results;
}
```

### Common Mistakes

- ❌ **Mistake:** Using Promise.all when partial success is acceptable
  ```javascript
  // Fails if any request fails
  const data = await Promise.all([
    fetchOptionalData1(), // Might not exist
    fetchOptionalData2(),
    fetchOptionalData3()
  ]);
  // Should use Promise.allSettled instead
  ```

- ❌ **Mistake:** Thinking Promise.race cancels other promises
  ```javascript
  Promise.race([
    longRunningTask(),
    timeout(1000)
  ]);
  // longRunningTask() continues running even after timeout wins!
  ```

- ❌ **Mistake:** Not handling AggregateError from Promise.any
  ```javascript
  Promise.any([...promises])
    .catch(error => {
      console.log(error.message); // Not enough info
      // Should check error.errors array
    });
  ```

- ✅ **Correct:** Choose the right method for your use case
  ```javascript
  // All must succeed
  await Promise.all(criticalRequests);

  // Get all results regardless
  await Promise.allSettled(nonCriticalRequests);

  // Need any one success
  await Promise.any(fallbackSources);

  // Need fastest result
  await Promise.race([primary, backup]);
  ```

<details>
<summary><strong>🔍 Deep Dive: Promise Combinator Internals</strong></summary>

**V8 Implementation of Promise.all:**

```javascript
// Simplified V8 internal algorithm for Promise.all
Promise.all = function(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    const results = new Array(promises.length);
    let remainingCount = promises.length;

    // Edge case: empty array
    if (remainingCount === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      // Wrap in Promise.resolve to handle non-promise values
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value; // Preserve order
          remainingCount--;

          if (remainingCount === 0) {
            resolve(results); // All succeeded
          }
        },
        (reason) => {
          reject(reason); // FAIL FAST - reject immediately
        }
      );
    });
  });
};

// Key characteristics:
// 1. Creates ONE result promise
// 2. Tracks completion count
// 3. Rejects on FIRST failure (fail-fast)
// 4. Preserves order (results[index])
// 5. Handles non-promise values via Promise.resolve
```

**V8 Implementation of Promise.race:**

```javascript
// Simplified V8 internal algorithm for Promise.race
Promise.race = function(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);

    // Edge case: empty array (never settles)
    if (promises.length === 0) {
      return; // Promise stays pending forever
    }

    promises.forEach((promise) => {
      Promise.resolve(promise).then(
        (value) => resolve(value),   // First to resolve wins
        (reason) => reject(reason)   // First to reject wins
      );
    });
  });
};

// Key characteristics:
// 1. First settled promise wins (fulfilled OR rejected)
// 2. Other promises are NOT cancelled (still run)
// 3. Empty array = pending forever
// 4. No order preservation (first is first)
```

**V8 Implementation of Promise.allSettled:**

```javascript
// Simplified V8 internal algorithm for Promise.allSettled
Promise.allSettled = function(iterable) {
  return new Promise((resolve) => { // Note: NEVER rejects
    const promises = Array.from(iterable);
    const results = new Array(promises.length);
    let remainingCount = promises.length;

    if (remainingCount === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = {
            status: 'fulfilled',
            value: value
          };
          remainingCount--;
          if (remainingCount === 0) resolve(results);
        },
        (reason) => {
          results[index] = {
            status: 'rejected',
            reason: reason
          };
          remainingCount--;
          if (remainingCount === 0) resolve(results);
        }
      );
    });
  });
};

// Key characteristics:
// 1. NEVER rejects (always resolves)
// 2. Waits for ALL promises to settle
// 3. Each result has status + value/reason
// 4. Preserves order
// 5. Useful for partial success scenarios
```

**V8 Implementation of Promise.any:**

```javascript
// Simplified V8 internal algorithm for Promise.any
Promise.any = function(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    const errors = [];
    let rejectionCount = 0;

    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          resolve(value); // First success wins
        },
        (reason) => {
          errors[index] = reason;
          rejectionCount++;

          if (rejectionCount === promises.length) {
            // All rejected - aggregate errors
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};

// Key characteristics:
// 1. First fulfilled promise wins
// 2. Ignores rejections until ALL reject
// 3. Rejects with AggregateError (contains all errors)
// 4. Empty array = immediate AggregateError
```

**Memory Usage Comparison:**

```javascript
// Scenario: 1,000 promises, each 1KB result

// Promise.all
// - 1 result promise
// - 1 results array (1,000 elements)
// - Temporary: 1,000 promise wrappers
// Memory: ~1MB results + ~50KB overhead = ~1.05MB

// Promise.race
// - 1 result promise
// - No results array
// - Temporary: 1,000 promise wrappers
// - Winner's result stored
// Memory: ~1KB result + ~50KB overhead = ~51KB (20x less!)

// Promise.allSettled
// - 1 result promise
// - 1 results array with status objects (2x size)
// Memory: ~2MB results + ~50KB overhead = ~2.05MB (2x Promise.all)

// Promise.any
// - 1 result promise
// - 1 errors array (if all fail)
// - Winner's result stored
// Memory: ~1KB result (success) OR ~1MB errors (all fail) + ~50KB overhead
```

**Microtask Queue Behavior:**

```javascript
// How combinators interact with microtask queue

console.log('1: Sync start');

Promise.all([
  Promise.resolve('A'),
  Promise.resolve('B'),
  Promise.resolve('C')
]).then(results => {
  console.log('3: Promise.all resolved:', results);
});

console.log('2: Sync end');

// Execution order:
// 1: Sync start
// 2: Sync end
// 3: Promise.all resolved: ['A', 'B', 'C']

// Why?
// 1. Synchronous code runs first (1, 2)
// 2. Promise.all schedules microtask
// 3. After call stack empty, microtask runs (3)

// With mixed async/sync:
Promise.all([
  Promise.resolve('instant'),
  new Promise(resolve => setTimeout(() => resolve('delayed'), 100))
]).then(results => {
  console.log('All done:', results);
});
// Waits for slowest promise before resolving
```

**Performance Optimizations in V8:**

```javascript
// V8 optimizations for promise combinators

// 1. Fast path for already-resolved promises
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
];

// V8 can optimize this to synchronous-like execution
// No setTimeout delays, minimal overhead
Promise.all(promises).then(r => console.log(r));
// Runs in ~0.01ms instead of ~1ms

// 2. TurboFan optimization after warmup
async function heavyLoop() {
  for (let i = 0; i < 1000; i++) {
    await Promise.all([
      fetchData(i),
      fetchData(i + 1)
    ]);
  }
}

// First 100 iterations: ~10ms each (interpreter)
// After warmup: ~3ms each (TurboFan optimized)
// 3x faster!

// 3. Hidden classes for result objects
// Promise.allSettled creates many {status, value/reason} objects
// V8 optimizes with hidden classes (shapes)
const results = await Promise.allSettled(promises);
// All result objects share same hidden class
// Faster property access: 30% improvement
```

**Internal State Tracking:**

```cpp
// V8 internal state for Promise.all
class PromiseAllResolveElementContext {
  int remaining_elements_;           // Count of pending promises
  JSArray* values_;                  // Result array
  bool is_rejected_;                 // Fast path: already rejected?
  PromiseCapability* capability_;    // The outer promise
  int index_;                        // Position in array
};

// When promise at index 3 resolves:
// 1. values_[3] = resolved_value
// 2. remaining_elements_--
// 3. if (remaining_elements_ == 0) resolve(capability_)

// When any promise rejects:
// 1. if (!is_rejected_) { is_rejected_ = true; reject(capability_) }
// 2. Other promises still run (no cancellation)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Promise.all Failure in Production</strong></summary>

**Scenario:** Your e-commerce checkout page has a 15% failure rate, causing significant revenue loss. Users report "checkout failed" errors even when their payment succeeds.

**The Problem:**

```javascript
// ❌ PROBLEM: Using Promise.all for mixed critical/optional data
class CheckoutService {
  async processOrder(cart, user) {
    try {
      // Loading ALL data in parallel
      const [
        inventory,       // CRITICAL
        userProfile,     // CRITICAL
        paymentMethods,  // CRITICAL
        shippingOptions, // CRITICAL
        taxInfo,         // OPTIONAL (can estimate)
        promoCode        // OPTIONAL (can skip)
      ] = await Promise.all([
        this.checkInventory(cart.items),        // 98% success
        this.getUserProfile(user.id),           // 99% success
        this.getPaymentMethods(user.id),        // 98% success
        this.getShippingOptions(cart.total),    // 99% success
        this.getTaxInfo(cart.items),            // 85% success (3rd party)
        this.validatePromoCode(cart.promoCode)  // 90% success (can fail)
      ]);

      // If ANY fails, entire checkout fails
      return this.createOrder({
        inventory,
        userProfile,
        paymentMethods,
        shippingOptions,
        taxInfo,
        promoCode
      });
    } catch (error) {
      // Generic error - user has no idea what failed
      throw new Error('Unable to process order. Please try again.');
    }
  }
}

// Production metrics (7-day average):
// - Total checkout attempts: 10,000
// - Successful checkouts: 8,500 (85%)
// - Failed checkouts: 1,500 (15%)
// - Revenue impact: $50,000/month in abandoned carts
// - User frustration: High (support tickets +300%)

// Failure breakdown:
// - taxInfo fails: 800 failures (8% of attempts)
// - promoCode fails: 500 failures (5% of attempts)
// - Other services: 200 failures (2% of attempts)
```

**Debugging Steps:**

```javascript
// Step 1: Add detailed error logging
class CheckoutService {
  async processOrder(cart, user) {
    const startTime = Date.now();

    try {
      console.log('[Checkout] Starting order processing', {
        userId: user.id,
        cartTotal: cart.total,
        timestamp: new Date().toISOString()
      });

      const [inventory, userProfile, paymentMethods, shippingOptions, taxInfo, promoCode] =
        await Promise.all([
          this.checkInventory(cart.items).catch(err => {
            console.error('[Checkout] Inventory check failed:', err);
            throw err;
          }),
          this.getUserProfile(user.id).catch(err => {
            console.error('[Checkout] User profile failed:', err);
            throw err;
          }),
          this.getPaymentMethods(user.id).catch(err => {
            console.error('[Checkout] Payment methods failed:', err);
            throw err;
          }),
          this.getShippingOptions(cart.total).catch(err => {
            console.error('[Checkout] Shipping options failed:', err);
            throw err;
          }),
          this.getTaxInfo(cart.items).catch(err => {
            console.error('[Checkout] Tax info failed:', err); // Logging reveals this fails often!
            throw err;
          }),
          this.validatePromoCode(cart.promoCode).catch(err => {
            console.error('[Checkout] Promo code failed:', err); // This too!
            throw err;
          })
        ]);

      console.log('[Checkout] All data loaded successfully', {
        duration: Date.now() - startTime
      });

      return this.createOrder({ inventory, userProfile, paymentMethods, shippingOptions, taxInfo, promoCode });
    } catch (error) {
      console.error('[Checkout] Order processing failed:', {
        error: error.message,
        userId: user.id,
        duration: Date.now() - startTime
      });
      throw new Error('Unable to process order. Please try again.');
    }
  }
}

// Logs reveal:
// - 8% failures from taxInfo (3rd party API timeout)
// - 5% failures from promoCode (validation service issues)
// - These are OPTIONAL but blocking checkout!
```

**Solution 1: Separate Critical from Optional (Promise.allSettled)**

```javascript
// ✅ FIX: Use Promise.all for critical, Promise.allSettled for optional
class CheckoutService {
  async processOrder(cart, user) {
    // STEP 1: Load CRITICAL data (must succeed)
    let criticalData;
    try {
      criticalData = await Promise.all([
        this.checkInventory(cart.items),
        this.getUserProfile(user.id),
        this.getPaymentMethods(user.id),
        this.getShippingOptions(cart.total)
      ]);
    } catch (error) {
      console.error('[Checkout] Critical data load failed:', error);
      throw new Error('Unable to load checkout data. Please try again.');
    }

    const [inventory, userProfile, paymentMethods, shippingOptions] = criticalData;

    // STEP 2: Load OPTIONAL data (partial success OK)
    const optionalResults = await Promise.allSettled([
      this.getTaxInfo(cart.items),
      this.validatePromoCode(cart.promoCode)
    ]);

    // Extract optional data with fallbacks
    const taxInfo = optionalResults[0].status === 'fulfilled'
      ? optionalResults[0].value
      : {
          estimated: true,
          rate: 0.08, // Default tax rate
          message: 'Tax rate estimated'
        };

    const promoCode = optionalResults[1].status === 'fulfilled'
      ? optionalResults[1].value
      : null; // No promo code, continue without it

    // Log optional failures for monitoring
    optionalResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const service = index === 0 ? 'taxInfo' : 'promoCode';
        console.warn(`[Checkout] Optional service ${service} failed:`, result.reason);
      }
    });

    // Create order with available data
    return this.createOrder({
      inventory,
      userProfile,
      paymentMethods,
      shippingOptions,
      taxInfo,
      promoCode,
      metadata: {
        taxEstimated: taxInfo.estimated,
        promoCodeApplied: promoCode !== null
      }
    });
  }
}

// After fix:
// - Success rate: 99% (from 85%)
// - Revenue recovered: $45,000/month
// - Support tickets: -280 (93% reduction)
// - User satisfaction: +40%
```

**Solution 2: Timeout + Fallback Strategy**

```javascript
// ✅ BETTER: Add timeouts and progressive enhancement
class CheckoutService {
  async processOrder(cart, user) {
    // Critical data with aggressive timeout
    const criticalData = await Promise.all([
      this.withTimeout(
        this.checkInventory(cart.items),
        3000,
        'Inventory check timeout'
      ),
      this.withTimeout(
        this.getUserProfile(user.id),
        2000,
        'User profile timeout'
      ),
      this.withTimeout(
        this.getPaymentMethods(user.id),
        3000,
        'Payment methods timeout'
      ),
      this.withTimeout(
        this.getShippingOptions(cart.total),
        2000,
        'Shipping options timeout'
      )
    ]);

    // Optional data with shorter timeout + fallback
    const optionalData = await Promise.allSettled([
      this.withTimeout(
        this.getTaxInfo(cart.items),
        1000, // Shorter timeout (it's optional)
        'Tax info timeout'
      ),
      this.withTimeout(
        this.validatePromoCode(cart.promoCode),
        1000,
        'Promo code timeout'
      )
    ]);

    const [inventory, userProfile, paymentMethods, shippingOptions] = criticalData;

    // Smart fallbacks for optional data
    const taxInfo = this.extractOrFallback(
      optionalData[0],
      () => this.estimateTax(cart.items)
    );

    const promoCode = this.extractOrFallback(
      optionalData[1],
      () => null
    );

    return this.createOrder({
      inventory,
      userProfile,
      paymentMethods,
      shippingOptions,
      taxInfo,
      promoCode
    });
  }

  withTimeout(promise, ms, errorMessage) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), ms)
      )
    ]);
  }

  extractOrFallback(result, fallbackFn) {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    console.warn('Using fallback due to:', result.reason.message);
    return fallbackFn();
  }

  estimateTax(items) {
    // Quick estimation based on item types
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    return {
      estimated: true,
      amount: totalPrice * 0.08, // Default 8%
      rate: 0.08,
      message: 'Tax rate estimated (actual rate will be calculated on confirmation)'
    };
  }
}

// Performance improvement:
// - Checkout speed: 2.5s avg (from 3.2s)
// - Success rate: 99.2%
// - Timeouts prevent hanging requests
```

**Solution 3: Progressive Enhancement with Retry**

```javascript
// ✅ BEST: Multi-tiered approach with retry
class CheckoutService {
  async processOrder(cart, user) {
    // Tier 1: Critical data (with retry)
    const criticalData = await Promise.all([
      this.retry(() => this.checkInventory(cart.items), 2),
      this.retry(() => this.getUserProfile(user.id), 2),
      this.retry(() => this.getPaymentMethods(user.id), 2),
      this.retry(() => this.getShippingOptions(cart.total), 2)
    ]);

    const [inventory, userProfile, paymentMethods, shippingOptions] = criticalData;

    // Tier 2: Optional data (single attempt, fast timeout)
    const optionalData = await Promise.allSettled([
      this.withTimeout(this.getTaxInfo(cart.items), 1500),
      this.withTimeout(this.validatePromoCode(cart.promoCode), 1000)
    ]);

    // Tier 3: Deferred data (load after order created)
    const deferredData = this.loadDeferredData(user.id);

    const taxInfo = this.extractWithFallback(optionalData[0], () =>
      this.estimateTax(cart.items)
    );

    const promoCode = this.extractWithFallback(optionalData[1], () => null);

    const order = await this.createOrder({
      inventory,
      userProfile,
      paymentMethods,
      shippingOptions,
      taxInfo,
      promoCode
    });

    // Trigger deferred data load (doesn't block order creation)
    deferredData.then(data => {
      this.enhanceOrder(order.id, data);
    });

    return order;
  }

  async retry(fn, maxAttempts, delay = 500) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  async loadDeferredData(userId) {
    // Load recommendations, recently viewed, etc. after checkout
    return Promise.allSettled([
      this.getRecommendations(userId),
      this.getRecentlyViewed(userId),
      this.getSimilarProducts(userId)
    ]);
  }

  extractWithFallback(result, fallbackFn) {
    return result.status === 'fulfilled' ? result.value : fallbackFn();
  }
}

// Final metrics:
// - Success rate: 99.5% (from 85%)
// - Checkout speed: 2.1s (from 3.2s)
// - Revenue recovered: $47,000/month
// - Retry resolves: 3% of requests (transient failures)
```

**Performance Comparison:**

| Approach | Success Rate | Avg Time | Revenue Lost/Month | User Experience |
|----------|-------------|----------|-------------------|-----------------|
| **Original (Promise.all)** | 85% | 3.2s | $50,000 | ❌ Poor |
| **Separated (allSettled)** | 99% | 2.8s | $5,000 | ✅ Good |
| **Timeout + Fallback** | 99.2% | 2.5s | $4,000 | ✅ Good |
| **Progressive + Retry** | 99.5% | 2.1s | $2,500 | ✅✅ Excellent |

**Key Lessons:**

1. **Don't use Promise.all for mixed critical/optional data**
2. **Always add timeouts to prevent hanging requests**
3. **Provide fallbacks for optional services**
4. **Retry transient failures with exponential backoff**
5. **Monitor metrics to identify failure patterns**

</details>

<details>
<summary><strong>⚖️ Trade-offs: Choosing the Right Combinator</strong></summary>

**1. Promise.all vs Promise.allSettled**

```javascript
// Scenario: Loading dashboard widgets

// Promise.all - Fail fast (all-or-nothing)
async function loadDashboardAll() {
  try {
    const [weather, news, stocks, calendar] = await Promise.all([
      fetchWeather(),
      fetchNews(),
      fetchStocks(),
      fetchCalendar()
    ]);

    return { weather, news, stocks, calendar };
  } catch (error) {
    // If ANY widget fails, show error page
    return { error: 'Failed to load dashboard' };
  }
}

// Promise.allSettled - Partial success (graceful degradation)
async function loadDashboardSettled() {
  const results = await Promise.allSettled([
    fetchWeather(),
    fetchNews(),
    fetchStocks(),
    fetchCalendar()
  ]);

  return {
    weather: results[0].status === 'fulfilled' ? results[0].value : null,
    news: results[1].status === 'fulfilled' ? results[1].value : null,
    stocks: results[2].status === 'fulfilled' ? results[2].value : null,
    calendar: results[3].status === 'fulfilled' ? results[3].value : null,
    errors: results.filter(r => r.status === 'rejected').length
  };
  // Show dashboard with available widgets, empty states for failed ones
}
```

**Trade-off Matrix:**

| Requirement | Use Promise.all | Use Promise.allSettled |
|-------------|----------------|----------------------|
| All data required | ✅ Yes | ❌ No |
| Partial data acceptable | ❌ No | ✅ Yes |
| Fast failure needed | ✅ Yes | ❌ No |
| Want all error details | ❌ Limited | ✅ Yes |
| User experience | All-or-nothing | Graceful degradation |
| Network efficiency | Stops early | Always waits for all |

**2. Promise.race vs Promise.any**

```javascript
// Scenario: Loading image from multiple CDNs

// Promise.race - First to settle (success OR failure)
async function loadImageRace(cdns) {
  try {
    const blob = await Promise.race(
      cdns.map(cdn => fetch(`${cdn}/image.jpg`).then(r => r.blob()))
    );
    return blob;
  } catch (error) {
    // If fastest CDN fails, entire operation fails
    throw error;
  }
}

// Promise.any - First to fulfill (only success)
async function loadImageAny(cdns) {
  try {
    const blob = await Promise.any(
      cdns.map(cdn => fetch(`${cdn}/image.jpg`).then(r => r.blob()))
    );
    return blob;
  } catch (error) {
    // Only fails if ALL CDNs fail
    throw new AggregateError(error.errors, 'All CDNs failed');
  }
}
```

**Comparison:**

| Combinator | Returns | When | Best For |
|------------|---------|------|----------|
| **Promise.race** | First settled (success/fail) | Fastest wins | Timeout implementation |
| **Promise.any** | First fulfilled | First success | Fallback sources |

**Use Cases:**

```javascript
// ✅ Promise.race: Timeout pattern
const data = await Promise.race([
  fetchData('/api/data'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);
// If timeout wins, request fails (even if it would have succeeded later)

// ✅ Promise.any: Fallback sources
const data = await Promise.any([
  fetchData('https://cdn1.com/data'),
  fetchData('https://cdn2.com/data'),
  fetchData('https://cdn3.com/data')
]);
// Returns first successful response, ignores failures
```

**3. Sequential vs Parallel Execution**

```javascript
// Scenario: Processing 1,000 user uploads

// Sequential (slow but safe)
async function processSequential(uploads) {
  const results = [];
  for (const upload of uploads) {
    results.push(await processUpload(upload));
  }
  return results;
}
// Time: 1,000 uploads × 100ms = 100 seconds
// Memory: 1 upload at a time (~10MB)
// Server load: 1 concurrent request

// Parallel all-at-once (fast but risky)
async function processParallelAll(uploads) {
  return await Promise.all(
    uploads.map(upload => processUpload(upload))
  );
}
// Time: ~100ms (limited by slowest upload)
// Memory: 1,000 uploads at once (~10GB!)
// Server load: 1,000 concurrent requests (may crash server)

// Parallel batched (balanced)
async function processParallelBatched(uploads, batchSize = 50) {
  const results = [];
  for (let i = 0; i < uploads.length; i += batchSize) {
    const batch = uploads.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(upload => processUpload(upload))
    );
    results.push(...batchResults);
  }
  return results;
}
// Time: 1,000 / 50 batches × 100ms = 2 seconds
// Memory: 50 uploads at a time (~500MB)
// Server load: 50 concurrent requests (manageable)
```

**Performance vs Safety Trade-off:**

| Approach | Time | Memory | Server Load | Crash Risk |
|----------|------|--------|-------------|------------|
| **Sequential** | Slowest (100s) | Lowest (10MB) | Lowest (1 req) | None |
| **All-at-once** | Fastest (0.1s) | Highest (10GB) | Highest (1000 req) | High |
| **Batched** | Medium (2s) | Medium (500MB) | Medium (50 req) | Low |

**4. Memory Trade-offs: Storing Promises vs Results**

```javascript
// Pattern 1: Store all promises (higher memory during execution)
const promises = [];
for (let i = 0; i < 10000; i++) {
  promises.push(fetchData(i));
}
const results = await Promise.all(promises);

// Memory during execution:
// - 10,000 pending promises: ~1MB
// - 10,000 results after resolution: ~10MB
// - Peak memory: ~11MB

// Pattern 2: Process in batches (lower peak memory)
const results = [];
for (let i = 0; i < 10000; i += 100) {
  const batch = Array.from({ length: 100 }, (_, j) => i + j);
  const batchResults = await Promise.all(
    batch.map(id => fetchData(id))
  );
  results.push(...batchResults);
}

// Memory during execution:
// - 100 pending promises per batch: ~0.01MB
// - Results accumulate: grows to ~10MB
// - Peak memory: ~10MB (10% less)

// Pattern 3: Stream processing (lowest memory)
async function* processStream(count) {
  for (let i = 0; i < count; i++) {
    yield await fetchData(i);
  }
}

for await (const result of processStream(10000)) {
  handleResult(result); // Process immediately, don't store
}

// Memory during execution:
// - 1 promise at a time: ~0.0001MB
// - No result accumulation: ~0MB
// - Peak memory: ~0.001MB (99.99% less!)
```

**5. Error Recovery Trade-offs**

```javascript
// Strategy 1: Fail fast (Promise.all)
async function loadAllOrFail(urls) {
  return await Promise.all(urls.map(fetch));
}
// ✅ Simple, clear semantics
// ✅ Fast failure (stops early)
// ❌ No partial data
// ❌ Wastes successful requests

// Strategy 2: Load all, filter failures (Promise.allSettled)
async function loadAllFilterFailed(urls) {
  const results = await Promise.allSettled(urls.map(fetch));
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}
// ✅ Partial data available
// ✅ All errors available for debugging
// ❌ Slower (waits for all)
// ❌ More complex code

// Strategy 3: Retry failed (Custom)
async function loadWithRetry(urls, maxRetries = 3) {
  let failed = urls;
  let results = [];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const attemptResults = await Promise.allSettled(
      failed.map(fetch)
    );

    results.push(
      ...attemptResults
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
    );

    failed = attemptResults
      .filter(r => r.status === 'rejected')
      .map((_, i) => failed[i]);

    if (failed.length === 0) break;

    await delay(1000 * Math.pow(2, attempt)); // Exponential backoff
  }

  return { results, failed: failed.length };
}
// ✅ Recovers from transient failures
// ✅ Partial data with failure count
// ❌ Much slower
// ❌ Complex implementation
```

**Decision Tree:**

```
Do all operations MUST succeed?
├─ YES → Use Promise.all (fail fast)
└─ NO → Are failures common?
    ├─ YES → Use Promise.allSettled (partial success)
    └─ NO → Can you retry?
        ├─ YES → Custom retry with Promise.all
        └─ NO → Use Promise.allSettled

Do you need the FASTEST result?
├─ YES → Do failures matter?
│   ├─ YES → Use Promise.race (first settled)
│   └─ NO → Use Promise.any (first success)
└─ NO → See above

Are you processing MANY items?
├─ < 100 → Promise.all (all at once)
├─ 100-1000 → Batched Promise.all
└─ > 1000 → Stream processing or batched

Is memory constrained?
├─ YES → Sequential or small batches
└─ NO → Large batches or all-at-once
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Promise Combinators</strong></summary>

**Simple Analogy: Food Delivery Apps**

Think of promise combinators like different strategies for ordering food:

**Promise.all - Group Order (everyone must agree)**

```javascript
// Like ordering food for your team
// If ANYONE doesn't get their food, the whole order is considered failed

const teamLunch = await Promise.all([
  orderFor('Alice'),  // Pizza
  orderFor('Bob'),    // Burger
  orderFor('Carol'),  // Salad
  orderFor('Dave')    // Sushi
]);

// If Bob's burger is unavailable:
// ❌ Entire order fails
// ❌ Alice, Carol, and Dave don't get food either
// ❌ Everyone is hungry!

// Real output:
// Success: [{pizza}, {burger}, {salad}, {sushi}]
// Failure: Error: "Burger unavailable" (no one gets food)
```

**Promise.allSettled - Individual Orders (everyone orders separately)**

```javascript
// Like everyone ordering for themselves
// You get your food regardless of others

const teamLunch = await Promise.allSettled([
  orderFor('Alice'),  // Pizza ✅
  orderFor('Bob'),    // Burger ❌ (out of stock)
  orderFor('Carol'),  // Salad ✅
  orderFor('Dave')    // Sushi ✅
]);

// Bob's burger failed, but others still get food
// ✅ Alice: Pizza delivered
// ❌ Bob: Order failed (hungry)
// ✅ Carol: Salad delivered
// ✅ Dave: Sushi delivered

// Output: [
//   { status: 'fulfilled', value: {pizza} },
//   { status: 'rejected', reason: Error },
//   { status: 'fulfilled', value: {salad} },
//   { status: 'fulfilled', value: {sushi} }
// ]
```

**Promise.race - First Delivery Wins**

```javascript
// Like ordering from 3 restaurants
// Eat whichever arrives first, cancel others

const dinner = await Promise.race([
  orderFrom('Restaurant A'), // Delivers in 30 min
  orderFrom('Restaurant B'), // Delivers in 20 min ⚡
  orderFrom('Restaurant C')  // Delivers in 25 min
]);

// Restaurant B arrives first at 20 min
// ✅ Eat from Restaurant B
// ❌ A and C arrive later (wasted, or give to someone else)

// Note: Other restaurants still deliver!
// You just ignore them
```

**Promise.any - First Successful Delivery**

```javascript
// Like having backup plans
// Keep trying until ONE restaurant successfully delivers

const dinner = await Promise.any([
  orderFrom('Restaurant A'), // Closed ❌
  orderFrom('Restaurant B'), // Out of delivery area ❌
  orderFrom('Restaurant C'), // Success! ✅
  orderFrom('Restaurant D')  // Also delivers, but too late
]);

// A failed, B failed, C succeeded first
// ✅ Eat from Restaurant C
// ✅ D's delivery ignored (C already succeeded)

// Only fails if ALL restaurants fail
```

**Visual Timeline:**

```
Time →  0s    10s   20s   30s   40s   50s

Promise.all:
Alice   |====|✅    (order ready)
Bob     |=====|❌   (failed - everyone loses)
Carol   |======|    (cancelled - no point)
Dave    |=======|   (cancelled - no point)
Result: ❌ ALL FAILED at 20s

Promise.allSettled:
Alice   |====|✅    (got pizza)
Bob     |=====|❌   (no burger, but others OK)
Carol   |======|✅   (got salad)
Dave    |=======|✅  (got sushi)
Result: ✅ 3/4 succeeded at 35s

Promise.race:
Rest A  |====|✅    (winner!)
Rest B  |=====|✅   (ignored)
Rest C  |======|✅  (ignored)
Result: ✅ FIRST at 20s

Promise.any:
Rest A  |====|❌    (failed)
Rest B  |=====|❌   (failed)
Rest C  |======|✅  (first success!)
Rest D  |=======|✅ (ignored)
Result: ✅ FIRST SUCCESS at 30s
```

**Explaining to PM (Non-technical):**

"These are like different strategies for hiring contractors:

**Promise.all** = 'All contractors must finish'
- Building a house: need foundation, walls, roof ALL done
- If electrician fails, entire project stops
- Use when: Everything is critical

**Promise.allSettled** = 'Get whoever finishes'
- Planning a conference: want catering, venue, speakers
- If DJ cancels, conference still happens (no music, but OK)
- Use when: Some things are optional

**Promise.race** = 'Hire fastest to respond'
- Need a plumber ASAP: call 3 plumbers, hire first to pick up
- Others might still call back, but you already hired someone
- Use when: Speed matters most

**Promise.any** = 'Hire first available'
- Need a graphic designer: email 5 designers
- First one to say 'yes' gets the job
- Others might respond later, but position filled
- Use when: You need ONE success, don't care who"

**Common Junior Mistakes:**

```javascript
// ❌ MISTAKE 1: Using wrong combinator
// Scenario: Loading dashboard widgets (some can fail)
const widgets = await Promise.all([
  loadWeather(),  // Critical
  loadNews(),     // Optional
  loadStocks(),   // Optional
  loadCalendar()  // Critical
]);
// If news fails, entire dashboard fails!

// ✅ CORRECT: Separate critical from optional
const [critical, optional] = await Promise.all([
  Promise.all([loadWeather(), loadCalendar()]), // Must succeed
  Promise.allSettled([loadNews(), loadStocks()]) // Can fail
]);


// ❌ MISTAKE 2: Thinking Promise.race cancels others
const result = await Promise.race([
  expensiveQuery1(), // Starts running
  expensiveQuery2(), // Starts running
  expensiveQuery3()  // Starts running
]);
// All 3 queries run to completion!
// race just returns first result, doesn't cancel

// ✅ CORRECT: Use AbortController to cancel
const controller = new AbortController();
const result = await Promise.race([
  fetch('/api/1', { signal: controller.signal }),
  fetch('/api/2', { signal: controller.signal }),
  fetch('/api/3', { signal: controller.signal })
]);
controller.abort(); // Cancel losers


// ❌ MISTAKE 3: Not checking AggregateError
Promise.any([promise1, promise2, promise3])
  .catch(error => {
    console.log(error.message); // "All promises rejected"
    // But WHY did they reject?
  });

// ✅ CORRECT: Check errors array
Promise.any([promise1, promise2, promise3])
  .catch(error => {
    console.log('All failed:', error.errors);
    error.errors.forEach((err, i) => {
      console.log(`Promise ${i + 1}:`, err.message);
    });
  });
```

**Practice Exercise:**

```javascript
// Which combinator would you use?

// 1. Loading user profile + posts (both critical)
// Answer: Promise.all (all must succeed)

// 2. Trying 3 different image CDNs (need one to work)
// Answer: Promise.any (first success)

// 3. Timeout implementation (5 seconds max)
// Answer: Promise.race (fetch vs timeout)

// 4. Sending notifications to 1000 users (some may fail)
// Answer: Promise.allSettled (partial success OK)

// 5. Loading dashboard: profile (critical) + widgets (optional)
// Answer: Promise.all for profile, Promise.allSettled for widgets
```

**Memory Trick: "ARAS"**

- **A**ll = **A**ll must succeed (fail-fast)
- **R**ace = **R**eturns first to finish
- **A**llSettled = **A**ll results (success + failures)
- **any** = **S**uccess needed (first success)

</details>

### Follow-up Questions

- "How would you implement a Promise.some that resolves when N promises succeed?"
- "What happens to promises that 'lose' in Promise.race - do they get cancelled?"
- "How would you implement a timeout for Promise.all?"
- "Can you implement Promise.map with concurrency limit using these methods?"
- "What are the memory implications of using Promise.allSettled with many promises?"

### Resources

- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN: Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [MDN: Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [MDN: Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [JavaScript.info: Promise API](https://javascript.info/promise-api)

---

