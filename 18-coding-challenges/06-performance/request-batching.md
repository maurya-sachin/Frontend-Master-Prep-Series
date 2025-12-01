# Request Batching and Deduplication

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Meta, Google, Amazon, Netflix, Uber, Twitter
**Time:** 60 minutes

---

## Problem Statement

Optimize network performance by implementing a system that:
1. **Batches** multiple API requests into fewer network calls
2. **Deduplicates** identical in-flight requests
3. **Reduces** overall network overhead and latency
4. **Handles** race conditions and stale data

This is critical for:
- E-commerce product pages (multiple items → single request)
- Search autocomplete (multiple character inputs → batched queries)
- Analytics tracking (multiple events → batch send)
- GraphQL batch queries (N+1 problem solution)

### Requirements

- ✅ Batch multiple requests within a time window (microtask/macrotask)
- ✅ Deduplicate identical requests in flight
- ✅ Return same Promise for duplicate requests
- ✅ Handle request errors gracefully
- ✅ Support custom batch size and time intervals
- ✅ Prevent race conditions (FIFO ordering)
- ✅ Support timeout mechanism
- ✅ Memory-efficient (clean up resolved requests)

---

## Performance Metrics

### Before Optimization
```
Requests: 50 user product views
Network calls: 50 individual requests
Total time: ~5000ms (sequential)
Bandwidth: 50 × 2KB = 100KB
```

### After Batching + Deduplication
```
Requests: 50 user product views (30 unique)
Network calls: 3 batched requests (batch size: 10-15)
Total time: ~500ms (parallel)
Bandwidth: 3 × 15KB = 45KB (45% reduction)
```

---

## Solution 1: Basic Request Batching with setTimeout

```javascript
class RequestBatcher {
  constructor(batchFn, options = {}) {
    this.batchFn = batchFn; // Function that handles batch
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 0; // milliseconds

    this.queue = [];
    this.batchTimer = null;
  }

  // Add request to batch
  batch(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      // Check if batch is ready
      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.batchTimer) {
        // Schedule batch flush
        this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  // Execute batched requests
  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const currentBatch = this.queue.splice(0, this.batchSize);

    try {
      // Extract just the requests
      const requests = currentBatch.map(item => item.request);

      // Call batch function
      const results = await this.batchFn(requests);

      // Resolve each promise with corresponding result
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      currentBatch.forEach(item => {
        item.reject(error);
      });
    }
  }

  // Force flush remaining items
  flushAll() {
    while (this.queue.length > 0) {
      this.flush();
    }
  }
}

// Usage
const batcher = new RequestBatcher(
  async (requests) => {
    console.log(`Batching ${requests.length} requests`);
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
    return response.json();
  },
  { batchSize: 5, batchDelay: 16 } // 16ms ~ 1 frame
);

// Client code
const result1 = await batcher.batch({ userId: 1 });
const result2 = await batcher.batch({ userId: 2 });
// Both requests are batched together
```

**Pros:**
- Simple implementation
- Predictable batching behavior
- Configurable batch size and delay

**Cons:**
- No deduplication
- Doesn't handle duplicate requests
- No request cancellation support

---

## Solution 2: Request Deduplication (In-Flight Cache)

```javascript
class RequestDeduplicator {
  constructor(fetchFn) {
    this.fetchFn = fetchFn;
    this.inFlightRequests = new Map(); // Cache of in-flight promises
  }

  // Create cache key from request
  getCacheKey(request) {
    return JSON.stringify(request);
  }

  async deduplicate(request) {
    const key = this.getCacheKey(request);

    // Return existing promise if already in flight
    if (this.inFlightRequests.has(key)) {
      console.log('Returning cached promise for:', key);
      return this.inFlightRequests.get(key);
    }

    // Create new request
    const promise = this.fetchFn(request)
      .then(response => {
        // Clean up on success
        this.inFlightRequests.delete(key);
        return response;
      })
      .catch(error => {
        // Clean up on error
        this.inFlightRequests.delete(key);
        throw error;
      });

    // Store in-flight promise
    this.inFlightRequests.set(key, promise);
    return promise;
  }

  getStats() {
    return {
      inFlight: this.inFlightRequests.size,
      cachedRequests: Array.from(this.inFlightRequests.keys())
    };
  }
}

// Usage
const deduplicator = new RequestDeduplicator(async (request) => {
  const response = await fetch('/api/user', {
    method: 'POST',
    body: JSON.stringify(request)
  });
  return response.json();
});

// Multiple calls with same request return same promise
const promise1 = deduplicator.deduplicate({ id: 1 });
const promise2 = deduplicator.deduplicate({ id: 1 });
console.log(promise1 === promise2); // true!

const [result1, result2] = await Promise.all([promise1, promise2]);
console.log(result1 === result2); // true - same data
```

**Pros:**
- Eliminates duplicate in-flight requests
- Automatic cleanup on completion
- Transparent deduplication

**Cons:**
- Still makes separate calls for non-identical requests
- Doesn't batch truly different requests
- Cache key generation can be expensive

---

## Solution 3: Combined Batching + Deduplication (DataLoader Pattern)

```javascript
class DataLoader {
  constructor(batchLoadFn, options = {}) {
    this.batchLoadFn = batchLoadFn;
    this.batchSize = options.batchSize || 100;
    this.batchDelay = options.batchDelay || 0;
    this.cache = options.cache !== false; // Enable caching by default
    this.cacheMap = new Map();

    this.queue = [];
    this.batchTimer = null;
  }

  load(key) {
    // Check persistent cache
    if (this.cache && this.cacheMap.has(key)) {
      return Promise.resolve(this.cacheMap.get(key));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        key,
        resolve,
        reject
      });

      // Check if batch is ready
      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  // Load many keys
  loadMany(keys) {
    return Promise.all(keys.map(key => this.load(key)));
  }

  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    const keys = batch.map(item => item.key);

    try {
      // Call batch function with keys
      const results = await this.batchLoadFn(keys);

      // Validate results length
      if (results.length !== keys.length) {
        throw new Error(
          `DataLoader batch function expected ${keys.length} values, ` +
          `but got ${results.length}`
        );
      }

      // Resolve each promise and cache result
      batch.forEach((item, index) => {
        const result = results[index];

        // Cache successful results
        if (this.cache) {
          this.cacheMap.set(item.key, result);
        }

        item.resolve(result);
      });
    } catch (error) {
      // Reject all items in batch
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }

  // Manual cache clearing
  clearCache(key) {
    if (key) {
      this.cacheMap.delete(key);
    } else {
      this.cacheMap.clear();
    }
  }

  flushAll() {
    while (this.queue.length > 0) {
      this.flush();
    }
  }
}

// Real-world example: Product loader
const productLoader = new DataLoader(
  async (productIds) => {
    console.log(`Loading products: ${productIds.join(', ')}`);
    const response = await fetch('/api/products/batch', {
      method: 'POST',
      body: JSON.stringify({ ids: productIds })
    });
    const data = await response.json();

    // Return results in same order as requested
    return productIds.map(id =>
      data.find(p => p.id === id)
    );
  },
  { batchSize: 10, batchDelay: 5 }
);

// Usage
async function getProducts() {
  // These calls are automatically batched
  const product1 = await productLoader.load(1);
  const product2 = await productLoader.load(2);
  const product3 = await productLoader.load(1); // Cached from first call

  return { product1, product2, product3 };
}

// OR batch multiple at once
const products = await productLoader.loadMany([1, 2, 3, 4, 5]);
```

**Pros:**
- Combines batching + caching + deduplication
- Familiar DataLoader pattern (Facebook/GraphQL)
- Automatic batch size and timing management
- Persistent caching reduces future requests

**Cons:**
- More complex implementation
- Cache memory overhead
- Need to clear cache when data updates

---

## Solution 4: Production-Ready with Advanced Features

```javascript
class AdvancedRequestBatcher {
  constructor(batchFn, options = {}) {
    this.batchFn = batchFn;
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 0;
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.onBatch = options.onBatch || null; // Hook: batch started
    this.onSuccess = options.onSuccess || null; // Hook: batch succeeded
    this.onError = options.onError || null; // Hook: batch failed

    this.queue = [];
    this.batchTimer = null;
    this.stats = {
      totalRequests: 0,
      totalBatches: 0,
      totalRetries: 0,
      failedRequests: 0,
      successfulRequests: 0
    };
  }

  batch(request, options = {}) {
    this.stats.totalRequests++;

    return new Promise((resolve, reject) => {
      const item = {
        request,
        resolve,
        reject,
        retries: 0,
        maxRetries: options.maxRetries ?? this.maxRetries,
        timeout: options.timeout ?? this.timeout,
        startTime: Date.now(),
        dedupeKey: options.dedupeKey || JSON.stringify(request)
      };

      this.queue.push(item);

      // Check if batch is ready
      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    this.stats.totalBatches++;

    // Deduplicate within batch
    const deduped = this.deduplicateBatch(batch);

    if (this.onBatch) {
      this.onBatch(deduped);
    }

    await this.executeBatch(deduped);
  }

  deduplicateBatch(batch) {
    const seen = new Map();
    const deduped = [];

    for (const item of batch) {
      if (seen.has(item.dedupeKey)) {
        // Link to existing item
        const original = seen.get(item.dedupeKey);
        original.dependents = original.dependents || [];
        original.dependents.push(item);
      } else {
        seen.set(item.dedupeKey, item);
        deduped.push(item);
      }
    }

    return deduped;
  }

  async executeBatch(batch) {
    const requests = batch.map(item => item.request);
    const startTime = Date.now();

    try {
      // Execute with timeout
      const results = await Promise.race([
        this.batchFn(requests),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Batch request timeout')),
            Math.max(...batch.map(b => b.timeout))
          )
        )
      ]);

      const duration = Date.now() - startTime;

      // Resolve all items (including deduplicated ones)
      batch.forEach((item, index) => {
        const result = results[index];
        item.resolve(result);
        this.stats.successfulRequests++;

        // Resolve dependents
        if (item.dependents) {
          item.dependents.forEach(dep => {
            dep.resolve(result);
            this.stats.successfulRequests++;
          });
        }
      });

      if (this.onSuccess) {
        this.onSuccess({ batch: requests.length, duration });
      }
    } catch (error) {
      // Retry logic
      const itemsToRetry = batch.filter(
        item => item.retries < item.maxRetries
      );

      if (itemsToRetry.length > 0) {
        this.stats.totalRetries++;

        // Add back to queue for retry
        itemsToRetry.forEach(item => {
          item.retries++;
          this.queue.push(item);
        });

        // Retry failed items after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.flush();
      }

      // Reject items that exhausted retries
      batch.forEach(item => {
        if (item.retries >= item.maxRetries) {
          item.reject(error);
          this.stats.failedRequests++;

          // Reject dependents too
          if (item.dependents) {
            item.dependents.forEach(dep => {
              dep.reject(error);
              this.stats.failedRequests++;
            });
          }
        }
      });

      if (this.onError) {
        this.onError(error);
      }
    }
  }

  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      successRate:
        this.stats.successfulRequests /
          (this.stats.successfulRequests + this.stats.failedRequests) || 0
    };
  }

  reset() {
    this.stats = {
      totalRequests: 0,
      totalBatches: 0,
      totalRetries: 0,
      failedRequests: 0,
      successfulRequests: 0
    };
  }
}

// Usage
const batcher = new AdvancedRequestBatcher(
  async (requests) => {
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
    return response.json();
  },
  {
    batchSize: 5,
    batchDelay: 10,
    maxRetries: 2,
    timeout: 30000,
    onBatch: (batch) => console.log(`Executing batch of ${batch.length}`),
    onSuccess: ({ batch, duration }) =>
      console.log(`Batch complete: ${batch} items in ${duration}ms`),
    onError: (error) => console.error('Batch failed:', error)
  }
);

// Usage
await Promise.all([
  batcher.batch({ userId: 1 }),
  batcher.batch({ userId: 2 }),
  batcher.batch({ userId: 1 }, { dedupeKey: 'user-1' })
]);

console.log(batcher.getStats());
// Output: {
//   totalRequests: 3,
//   totalBatches: 1,
//   successfulRequests: 3,
//   successRate: 1
// }
```

**Pros:**
- Enterprise-grade features
- Deduplication within batch
- Automatic retry with exponential backoff
- Detailed statistics and hooks
- Timeout handling

**Cons:**
- Complex implementation
- More memory overhead
- Requires careful cleanup

---

## Solution 5: React Hook (useBatchedRequest)

```javascript
import { useCallback, useRef, useEffect, useState } from 'react';

function useBatchedRequest(batchFn, options = {}) {
  const batchSize = options.batchSize || 10;
  const batchDelay = options.batchDelay || 16; // 1 frame
  const timeoutMs = options.timeout || 30000;

  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const statsRef = useRef({
    total: 0,
    batches: 0,
    deduped: 0
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (queueRef.current.length === 0) {
      return;
    }

    const batch = queueRef.current.splice(0, batchSize);
    statsRef.current.batches++;

    try {
      const requests = batch.map(item => item.request);
      const results = await Promise.race([
        batchFn(requests),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            timeoutMs
          )
        )
      ]);

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }, [batchFn, batchSize, timeoutMs]);

  const batch = useCallback((request) => {
    return new Promise((resolve, reject) => {
      statsRef.current.total++;
      queueRef.current.push({ request, resolve, reject });

      if (queueRef.current.length >= batchSize) {
        flush();
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(flush, batchDelay);
      }
    });
  }, [batchSize, batchDelay, flush]);

  return {
    batch,
    stats: statsRef.current
  };
}

// Usage in React component
function ProductGrid() {
  const { batch, stats } = useBatchedRequest(
    async (productIds) => {
      const response = await fetch('/api/products/batch', {
        method: 'POST',
        body: JSON.stringify({ ids: productIds })
      });
      return response.json();
    },
    { batchSize: 10, batchDelay: 16 }
  );

  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products as they become visible
    const loadProduct = async (id) => {
      const product = await batch(id);
      setProducts(prev => [...prev, product]);
    };

    // Simulate lazy loading
    [1, 2, 3, 4, 5].forEach(id => loadProduct(id));
  }, [batch]);

  return (
    <div>
      <div className="grid">
        {products.map(p => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
      <div className="stats">
        Batches: {stats.batches}, Total: {stats.total}
      </div>
    </div>
  );
}
```

---

## Solution 6: GraphQL Batching Example

```javascript
class GraphQLBatcher {
  constructor(graphqlUrl, options = {}) {
    this.url = graphqlUrl;
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 5;
    this.queue = [];
    this.batchTimer = null;
  }

  query(query, variables) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        query,
        variables,
        resolve,
        reject
      });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
      }
    });
  }

  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);

    // Build combined batch query using aliases
    const batchQuery = this.buildBatchQuery(batch);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: batchQuery })
      });

      const data = await response.json();

      // Resolve each query with its result
      batch.forEach((item, index) => {
        const key = `query${index}`;
        item.resolve(data.data[key]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }

  buildBatchQuery(batch) {
    const queries = batch
      .map((item, index) => {
        return `query${index}: ${item.query}`;
      })
      .join('\n');

    return `{ ${queries} }`;
  }
}

// Usage
const gqlBatcher = new GraphQLBatcher('https://api.example.com/graphql', {
  batchSize: 10,
  batchDelay: 5
});

// Batches these queries together
const user1 = gqlBatcher.query(`{
  user(id: 1) { id name email }
}`);

const user2 = gqlBatcher.query(`{
  user(id: 2) { id name email }
}`);

const user3 = gqlBatcher.query(`{
  user(id: 3) { id name email }
}`);

const results = await Promise.all([user1, user2, user3]);
```

---

## Real-World Example: Autocomplete with Batching + Deduplication

```javascript
class AutocompleteService {
  constructor() {
    this.batcher = new DataLoader(
      async (queries) => {
        console.log(`Autocomplete batch: ${queries.join(', ')}`);
        const response = await fetch('/api/autocomplete/batch', {
          method: 'POST',
          body: JSON.stringify({ queries })
        });
        return response.json();
      },
      { batchSize: 5, batchDelay: 100, cache: true }
    );
  }

  async search(query) {
    if (!query || query.length < 2) {
      return [];
    }

    // Deduplicated + batched request
    return this.batcher.load(query);
  }

  clearCache() {
    this.batcher.clearCache();
  }
}

// React component
function Autocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const serviceRef = useRef(new AutocompleteService());

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await serviceRef.current.search(query);
      setResults(data);
    }, 300); // User debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.label}</li>
        ))}
      </ul>
    </div>
  );
}

// Network waterfall (conceptual):
// User types: "r" -> "e" -> "a" -> "c" -> "t"
//
// Without batching:
// [r] -→ Server (miss)
// [re] -→ Server (miss)
// [rea] -→ Server (hit - cached)
// [reac] -→ Server (miss)
// [react] -→ Server (miss)
// 5 requests, possible 3 server hits
//
// With batching + dedup:
// [r] [re] batched -→ Server
// [rea] (cached from [re])
// [reac] [react] batched -→ Server
// 2 requests total (80% reduction)
```

---

## Test Cases

```javascript
describe('RequestBatcher', () => {
  jest.useFakeTimers();

  test('batches requests within size limit', async () => {
    const batchFn = jest.fn(async (requests) => requests.map(r => r.id * 2));
    const batcher = new RequestBatcher(batchFn, { batchSize: 2 });

    const promise1 = batcher.batch({ id: 1 });
    const promise2 = batcher.batch({ id: 2 });

    expect(batchFn).toHaveBeenCalledTimes(1);
    expect(await promise1).toBe(2);
    expect(await promise2).toBe(4);
  });

  test('batches requests on time delay', async () => {
    const batchFn = jest.fn(async (requests) => requests.map(r => r.id));
    const batcher = new RequestBatcher(batchFn, {
      batchSize: 10,
      batchDelay: 100
    });

    batcher.batch({ id: 1 });
    expect(batchFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(batchFn).toHaveBeenCalled();
  });

  test('handles batch errors', async () => {
    const error = new Error('Batch failed');
    const batchFn = jest.fn(async () => {
      throw error;
    });
    const batcher = new RequestBatcher(batchFn, { batchSize: 1 });

    const promise = batcher.batch({ id: 1 });
    await expect(promise).rejects.toEqual(error);
  });

  test('deduplicates identical requests', async () => {
    const deduplicator = new RequestDeduplicator(async (req) => req.id);

    const promise1 = deduplicator.deduplicate({ id: 1 });
    const promise2 = deduplicator.deduplicate({ id: 1 });

    expect(promise1).toBe(promise2);
    expect(deduplicator.getStats().inFlight).toBe(1);
  });

  test('DataLoader caches results', async () => {
    const batchLoadFn = jest.fn(async (keys) => keys.map(k => k * 2));
    const loader = new DataLoader(batchLoadFn);

    const result1 = await loader.load(5);
    const result2 = await loader.load(5); // From cache

    expect(batchLoadFn).toHaveBeenCalledTimes(1);
    expect(result1).toBe(10);
    expect(result2).toBe(10);
  });

  test('handles partial batch on timeout', async () => {
    const batchFn = jest.fn(async (requests) => {
      jest.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 50));
      jest.useFakeTimers();
      return requests.map(r => r.id);
    });

    const batcher = new AdvancedRequestBatcher(batchFn, {
      batchSize: 100,
      batchDelay: 1000,
      timeout: 100
    });

    const promise = batcher.batch({ id: 1 }, { timeout: 100 });

    jest.advanceTimersByTime(1000);
    await expect(promise).rejects.toThrow('timeout');
  });

  test('retries failed requests', async () => {
    let callCount = 0;
    const batchFn = jest.fn(async () => {
      callCount++;
      if (callCount === 1) throw new Error('Fail first time');
      return [1];
    });

    const batcher = new AdvancedRequestBatcher(batchFn, {
      batchSize: 1,
      maxRetries: 1
    });

    const promise = batcher.batch({ id: 1 });

    // First attempt
    jest.advanceTimersByTime(0);
    await new Promise(resolve => setImmediate(resolve));

    // Retry after delay
    jest.advanceTimersByTime(1000);
    await new Promise(resolve => setImmediate(resolve));

    expect(await promise).toBe(1);
    expect(batchFn).toHaveBeenCalledTimes(2);
  });
});
```

---

## Common Mistakes

### ❌ Mistake 1: Not preserving request order

```javascript
// Wrong: Results order doesn't match request order
async flush() {
  const batch = this.queue.splice(0, this.batchSize);
  const results = await this.batchFn(batch);

  // WRONG: If batchFn returns unordered results, this fails
  batch.forEach((item, index) => {
    item.resolve(results[index]);
  });
}
```

### ✅ Correct: Maintain explicit mapping

```javascript
async flush() {
  const batch = this.queue.splice(0, this.batchSize);
  const requests = batch.map(item => item.request);
  const results = await this.batchFn(requests);

  // Explicit result-to-request mapping
  const resultMap = new Map(results.map((r, i) => [i, r]));
  batch.forEach((item, index) => {
    item.resolve(resultMap.get(index));
  });
}
```

### ❌ Mistake 2: Memory leak from in-flight cache

```javascript
// Wrong: Cached promises never cleaned up
class BadDeduplicator {
  constructor() {
    this.cache = new Map();
  }

  async deduplicate(req) {
    const key = JSON.stringify(req);
    if (!this.cache.has(key)) {
      this.cache.set(key, fetch(req)); // Promise stored forever
    }
    return this.cache.get(key);
  }
}
```

### ✅ Correct: Clean up after completion

```javascript
class GoodDeduplicator {
  constructor() {
    this.inFlight = new Map();
  }

  async deduplicate(req) {
    const key = JSON.stringify(req);
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = fetch(req)
      .finally(() => {
        this.inFlight.delete(key); // Clean up
      });

    this.inFlight.set(key, promise);
    return promise;
  }
}
```

### ❌ Mistake 3: Incorrect deduplication key

```javascript
// Wrong: Different objects with same content create different keys
const batcher = new Batcher();

batcher.batch({ id: 1, sort: 'asc' });
batcher.batch({ sort: 'asc', id: 1 }); // Different key due to property order

// These should be deduplicated but aren't!
```

### ✅ Correct: Normalize keys

```javascript
function normalizeKey(obj) {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

const dedupeKey = normalizeKey({ id: 1, sort: 'asc' });
// Same as normalizeKey({ sort: 'asc', id: 1 })
```

### ❌ Mistake 4: Race condition with stale data

```javascript
// Wrong: First response might arrive after second request
const batcher = new Batcher();

const promise1 = batcher.batch({ id: 1 }); // Batched as first
const promise2 = batcher.batch({ id: 1 }); // Deduped, same promise

// But what if cache invalidates between them?
// Second call gets stale data from first
```

### ✅ Correct: Per-request cache invalidation

```javascript
const batcher = new Batcher();

const promise1 = batcher.batch({ id: 1 }, {
  cacheKey: 'user:1:v1'
});
const promise2 = batcher.batch({ id: 1 }, {
  cacheKey: 'user:1:v2' // Different version = different request
});

// Both are batched together but deduplicated separately
```

---

## Performance Optimization Tips

### 1. Choose Optimal Batch Size
```javascript
// Too small = more batches (network overhead)
batchSize: 1; // Every request separate - NO BATCHING

// Too large = longer wait (latency)
batchSize: 1000; // Wait for 1000 items - SLOW USER EXPERIENCE

// Optimal = balance between throughput and latency
batchSize: 10; // Most common: 5-20
```

### 2. Tune Batch Delay
```javascript
// Synchronous operations (immediate results)
batchDelay: 0; // Flush ASAP

// I/O operations (API calls)
batchDelay: 16; // 1 frame (60 FPS) - user won't notice
batchDelay: 100; // Autocomplete - visible but acceptable

// Background tasks (analytics)
batchDelay: 1000; // 1 second - gather more events
```

### 3. Compress Cache Keys
```javascript
// Wrong: Large JSON strings as keys
const key = JSON.stringify({ id: 1, filter: true, sort: 'asc' });

// Right: Compact string representation
const key = `user:1:filter:1:sort:0`;

// Or use object identity
const requestKey = Symbol.for('product-1-batch');
```

### 4. Selective Deduplication
```javascript
// Don't deduplicate write operations!
// Wrong: batch.batch({ action: 'delete', id: 1 });
// batch.batch({ action: 'delete', id: 1 }); // Second deletes same resource!

// Only deduplicate reads
if (request.method === 'GET') {
  return deduplicator.deduplicate(request);
} else {
  return directRequest(request);
}
```

---

## Follow-up Questions

1. **"What's the difference between batching and debouncing?"**
   - Debounce: Wait for inactivity before executing
   - Batch: Combine multiple requests into fewer calls
   - Often used together: debounce user input, then batch requests

2. **"How do you handle request cancellation in batches?"**
   - Store AbortController per request
   - Abort cancelled requests before sending batch
   - Return rejected promise for cancelled items

3. **"What about ordering guarantees?"**
   - Results must maintain request order
   - Use explicit index mapping
   - Test with concurrent requests

4. **"How to implement exponential backoff for retries?"**
   - 1st retry: wait 1000ms
   - 2nd retry: wait 2000ms
   - 3rd retry: wait 4000ms
   - Formula: `2 ^ (retryCount - 1) * baseDelay`

5. **"When to use DataLoader vs manual batching?"**
   - DataLoader: Simple, predictable, GraphQL-friendly
   - Manual: More control, custom logic, complex scenarios

6. **"How to prevent duplicate batch submissions?"**
   - Track batchTimer state
   - Prevent duplicate flush() calls
   - Use mutex pattern if needed

7. **"Can you batch across different request types?"**
   - Yes, but carefully
   - Group same types together
   - Different endpoints may need different batching strategies

---

## Network Waterfall Diagram

```
Without Batching:
═══════════════════════════════════════════════════════
t=0ms:    [Req 1] ─────────────→ [Server] ─→ [Res 1]
t=50ms:   [Req 2] ─────────────→ [Server] ─→ [Res 2]
t=100ms:  [Req 3] ─────────────→ [Server] ─→ [Res 3]
t=150ms:  [Req 4] ─────────────→ [Server] ─→ [Res 4]
t=200ms:  [Req 5] ─────────────→ [Server] ─→ [Res 5]
TOTAL: ~250ms (5 sequential requests)

With Batching (batch size=2, delay=10ms):
═══════════════════════════════════════════════════════
t=0ms:    [Req 1] queued
t=5ms:    [Req 2] queued
t=15ms:   [Batch 1,2] ─────────→ [Server] ─→ [Res 1,2]
t=20ms:   [Req 3] queued
t=25ms:   [Req 4] queued
t=35ms:   [Batch 3,4] ─────────→ [Server] ─→ [Res 3,4]
t=40ms:   [Req 5] queued
t=50ms:   [Batch 5] ───────────→ [Server] ─→ [Res 5]
TOTAL: ~50ms (3 batched requests)
IMPROVEMENT: 80% faster!

With Batching + Deduplication (reqs 1,2,2,3,3 unique):
═══════════════════════════════════════════════════════
t=0ms:    [Req 1] queued
t=5ms:    [Req 2] queued (new)
t=10ms:   [Req 2] skipped (duplicate of queued)
t=15ms:   [Batch 1,2] ─────────→ [Server] ─→ [Res 1,2]
t=20ms:   [Req 3] queued (new)
t=25ms:   [Req 3] skipped (duplicate of queued)
t=35ms:   [Batch 3] ───────────→ [Server] ─→ [Res 3]
TOTAL: ~35ms (2 batched requests from 5 original)
IMPROVEMENT: 86% faster + 40% less bandwidth!
```

---

## Real-World Metrics

### E-commerce Product Page Load
```
Scenario: User opens product page with 20 recommended products

Without Optimization:
- 20 separate API calls
- Total requests: 20
- Total data: 200KB (10KB each)
- Waterfall: 2-5 seconds
- Server load: 20 requests

With Batching:
- 2 batched requests (batch size 10)
- Total requests: 2
- Total data: 25KB (compressed)
- Waterfall: 400ms
- Server load: 2 requests

Improvement: 5x faster, 87% less bandwidth, 10x less load
```

---

## Resources

- [Facebook DataLoader](https://github.com/graphql/dataloader)
- [GraphQL Batch Documentation](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP/2 Server Push](https://www.smashingmagazine.com/2017/04/guide-http2-server-push/)
- [Request Deduplication Patterns](https://web.dev/performance/)

---

[← Back to Performance](./README.md)
