# Memoize Function

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Meta, Amazon, Google, Microsoft
**Time:** 30 minutes

---

## Problem Statement

Implement a `memoize` function that caches the results of expensive function calls and returns the cached result when the same inputs occur again.

### Requirements

- ✅ Cache function results based on arguments
- ✅ Support multiple arguments
- ✅ Handle primitive and object arguments
- ✅ Provide cache management (clear, size)
- ✅ Support TTL (time-to-live) for cache entries
- ✅ Handle edge cases (undefined, null, etc.)

---

## Example Usage

```javascript
// Basic usage
function expensiveCalculation(a, b) {
  console.log('Computing...');
  return a + b;
}

const memoized = memoize(expensiveCalculation);

console.log(memoized(1, 2)); // "Computing..." → 3
console.log(memoized(1, 2)); // 3 (from cache, no "Computing...")
console.log(memoized(2, 3)); // "Computing..." → 5

// With objects
function getUserData(userId) {
  console.log(`Fetching user ${userId}...`);
  return { id: userId, name: 'John' };
}

const memoizedGet = memoize(getUserData);
console.log(memoizedGet(1)); // Fetches
console.log(memoizedGet(1)); // From cache
```

---

## Solution

### Approach 1: Basic Memoization (Simple Arguments)

```javascript
function memoize(fn) {
  const cache = {};

  return function(...args) {
    // Create cache key from arguments
    const key = JSON.stringify(args);

    // Return cached result if exists
    if (key in cache) {
      return cache[key];
    }

    // Compute and cache result
    const result = fn.apply(this, args);
    cache[key] = result;

    return result;
  };
}

// ❌ PROBLEMS WITH THIS APPROACH:
// 1. JSON.stringify doesn't handle functions, undefined, symbols
// 2. Argument order matters: [1,2] !== [2,1]
// 3. No cache size limit - memory leak
// 4. No TTL support
// 5. Can't clear individual cache entries
```

**Complexity:**
- Time: O(1) cache hit, O(n) for fn execution + JSON.stringify
- Space: O(n) where n is number of unique argument combinations

---

### Approach 2: Advanced Memoization with WeakMap

```javascript
function memoize(fn, options = {}) {
  const {
    maxSize = Infinity,
    ttl = Infinity,
    resolver = null
  } = options;

  const cache = new Map();
  const timestamps = new Map();

  // Generate cache key
  function generateKey(args) {
    if (resolver) {
      return resolver(...args);
    }

    // Handle primitives and objects separately
    if (args.length === 1 && (typeof args[0] === 'object' || typeof args[0] === 'function')) {
      // Use WeakMap for objects to allow garbage collection
      return args[0];
    }

    // For primitives, stringify
    return JSON.stringify(args);
  }

  function memoized(...args) {
    const key = generateKey(args);
    const now = Date.now();

    // Check if cached and not expired
    if (cache.has(key)) {
      const cachedTime = timestamps.get(key);

      // Check TTL
      if (ttl === Infinity || now - cachedTime < ttl) {
        return cache.get(key);
      } else {
        // Expired, remove from cache
        cache.delete(key);
        timestamps.delete(key);
      }
    }

    // Compute result
    const result = fn.apply(this, args);

    // Manage cache size
    if (cache.size >= maxSize) {
      // Remove oldest entry (FIFO strategy)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      timestamps.delete(firstKey);
    }

    // Cache result
    cache.set(key, result);
    timestamps.set(key, now);

    return result;
  }

  // Cache management methods
  memoized.clear = function() {
    cache.clear();
    timestamps.clear();
  };

  memoized.delete = function(...args) {
    const key = generateKey(args);
    cache.delete(key);
    timestamps.delete(key);
  };

  memoized.has = function(...args) {
    const key = generateKey(args);
    return cache.has(key);
  };

  memoized.size = function() {
    return cache.size;
  };

  return memoized;
}
```

**Complexity:**
- Time: O(1) cache hit, O(n) for fn execution
- Space: O(min(calls, maxSize))

---

### Approach 3: Production-Ready with LRU Cache

```javascript
class LRUMemoize {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || Infinity;
    this.resolver = options.resolver || null;

    // Use Map for LRU ordering (insertion order)
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  generateKey(args) {
    if (this.resolver) {
      return this.resolver(...args);
    }

    // Custom serialization that handles more types
    return args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'function') return arg.toString();
      if (typeof arg === 'symbol') return arg.toString();
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return Object.prototype.toString.call(arg);
        }
      }
      return String(arg);
    }).join('|');
  }

  get(...args) {
    const key = this.generateKey(args);

    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      const now = Date.now();

      // Check TTL
      if (this.ttl === Infinity || now - entry.timestamp < this.ttl) {
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);

        this.stats.hits++;
        return entry.value;
      } else {
        // Expired
        this.cache.delete(key);
      }
    }

    // Cache miss
    this.stats.misses++;
    const result = this.fn(...args);

    // Add to cache
    const entry = {
      value: result,
      timestamp: Date.now()
    };

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    this.cache.set(key, entry);
    return result;
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  delete(...args) {
    const key = this.generateKey(args);
    return this.cache.delete(key);
  }

  has(...args) {
    const key = this.generateKey(args);
    if (!this.cache.has(key)) return false;

    // Check TTL
    const entry = this.cache.get(key);
    const now = Date.now();

    if (this.ttl !== Infinity && now - entry.timestamp >= this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size() {
    return this.cache.size;
  }

  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      size: this.cache.size
    };
  }
}

// Factory function
function memoize(fn, options) {
  const memoizer = new LRUMemoize(fn, options);

  const memoized = function(...args) {
    return memoizer.get(...args);
  };

  // Expose methods
  memoized.clear = () => memoizer.clear();
  memoized.delete = (...args) => memoizer.delete(...args);
  memoized.has = (...args) => memoizer.has(...args);
  memoized.size = () => memoizer.size();
  memoized.stats = () => memoizer.getStats();

  return memoized;
}
```

**Complexity:**
- Time: O(1) amortized
- Space: O(maxSize)

---

## Test Cases

```javascript
describe('Memoize', () => {
  test('caches function results', () => {
    let calls = 0;
    const fn = (a, b) => {
      calls++;
      return a + b;
    };

    const memoized = memoize(fn);

    expect(memoized(1, 2)).toBe(3);
    expect(calls).toBe(1);

    expect(memoized(1, 2)).toBe(3);
    expect(calls).toBe(1); // No additional call

    expect(memoized(2, 3)).toBe(5);
    expect(calls).toBe(2);
  });

  test('handles different argument types', () => {
    let calls = 0;
    const fn = (...args) => {
      calls++;
      return args;
    };

    const memoized = memoize(fn);

    memoized(1, 'test', true);
    memoized(1, 'test', true);
    expect(calls).toBe(1);

    memoized(1, 'test', false);
    expect(calls).toBe(2);
  });

  test('respects maxSize limit', () => {
    const fn = (x) => x * 2;
    const memoized = memoize(fn, { maxSize: 2 });

    memoized(1); // cache: [1]
    memoized(2); // cache: [1, 2]
    memoized(3); // cache: [2, 3] (1 evicted)

    expect(memoized.size()).toBe(2);
  });

  test('respects TTL', (done) => {
    let calls = 0;
    const fn = (x) => {
      calls++;
      return x * 2;
    };

    const memoized = memoize(fn, { ttl: 100 });

    expect(memoized(5)).toBe(10);
    expect(calls).toBe(1);

    expect(memoized(5)).toBe(10);
    expect(calls).toBe(1);

    setTimeout(() => {
      expect(memoized(5)).toBe(10);
      expect(calls).toBe(2); // Cache expired, recomputed
      done();
    }, 150);
  });

  test('supports custom resolver', () => {
    let calls = 0;
    const fn = (obj) => {
      calls++;
      return obj.value;
    };

    // Only cache by id property
    const memoized = memoize(fn, {
      resolver: (obj) => obj.id
    });

    memoized({ id: 1, value: 'a' });
    memoized({ id: 1, value: 'b' }); // Same id, uses cache
    expect(calls).toBe(1);

    memoized({ id: 2, value: 'c' });
    expect(calls).toBe(2);
  });

  test('cache management methods work', () => {
    const fn = (x) => x * 2;
    const memoized = memoize(fn);

    memoized(1);
    memoized(2);
    memoized(3);

    expect(memoized.size()).toBe(3);
    expect(memoized.has(1)).toBe(true);

    memoized.delete(1);
    expect(memoized.size()).toBe(2);
    expect(memoized.has(1)).toBe(false);

    memoized.clear();
    expect(memoized.size()).toBe(0);
  });

  test('tracks statistics', () => {
    const fn = (x) => x * 2;
    const memoized = memoize(fn, { maxSize: 2 });

    memoized(1); // miss
    memoized(1); // hit
    memoized(2); // miss
    memoized(3); // miss, evict 1
    memoized(2); // hit

    const stats = memoized.stats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(3);
    expect(stats.evictions).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.4);
  });

  test('preserves this context', () => {
    const obj = {
      multiplier: 10,
      calculate: memoize(function(x) {
        return x * this.multiplier;
      })
    };

    expect(obj.calculate(5)).toBe(50);
    expect(obj.calculate(5)).toBe(50);
  });

  test('handles undefined and null', () => {
    const fn = (x) => x;
    const memoized = memoize(fn);

    expect(memoized(undefined)).toBe(undefined);
    expect(memoized(null)).toBe(null);
    expect(memoized(0)).toBe(0);
    expect(memoized('')).toBe('');
  });
});
```

---

## Common Mistakes

- ❌ **Using simple object as cache:** `{}` doesn't preserve insertion order for LRU
- ❌ **Not handling circular references:** JSON.stringify throws on circular objects
- ❌ **Ignoring memory leaks:** No cache size limit leads to unbounded growth
- ❌ **Not considering this context:** Use arrow functions incorrectly
- ❌ **Stringifying functions:** Different functions can have same .toString()
- ❌ **Not handling TTL properly:** Stale data returned without expiration check

✅ **Use Map for cache storage**
✅ **Implement cache size limits**
✅ **Support custom key resolvers**
✅ **Add TTL support**
✅ **Preserve function context**
✅ **Track cache statistics**

---

## Real-World Applications

1. **API Response Caching**
```javascript
const fetchUser = memoize(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  { ttl: 60000 } // 1 minute cache
);
```

2. **Expensive Calculations**
```javascript
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // Fast with memoization!
```

3. **React Selector Functions**
```javascript
const selectFilteredItems = memoize(
  (items, filter) => items.filter(filter),
  {
    resolver: (items, filter) => `${items.length}-${filter.toString()}`
  }
);
```

4. **Database Query Caching**
```javascript
const queryDB = memoize(
  (query) => db.execute(query),
  {
    maxSize: 100,
    ttl: 300000 // 5 minutes
  }
);
```

---

## Follow-up Questions

1. **How would you implement a memoize function that supports async functions?**
   - Cache promises instead of values
   - Handle promise rejection (don't cache failures)
   - Support cache invalidation during pending requests

2. **What's the difference between memoization and caching?**
   - Memoization is specific to function results
   - Caching is broader (API responses, computed values, etc.)
   - Memoization typically uses function arguments as keys

3. **How would you handle cache invalidation strategies?**
   - Time-based (TTL)
   - Event-based (invalidate on data change)
   - Size-based (LRU, LFU eviction)
   - Manual (explicit cache.delete())

4. **How would you implement a shared memoization cache across multiple functions?**
   - Create a cache manager class
   - Use namespaced keys
   - Support different eviction policies per namespace

5. **What are the trade-offs between WeakMap and Map for caching?**
   - WeakMap: Automatic garbage collection, but only object keys
   - Map: Any key type, but manual memory management needed
   - Choose based on key types and memory requirements

---

## Resources

- [Lodash _.memoize](https://lodash.com/docs/#memoize)
- [React.memo](https://react.dev/reference/react/memo)
- [Memoization in JavaScript](https://www.freecodecamp.org/news/understanding-memoize-in-javascript-51d07d19430e/)
- [LRU Cache Algorithm](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU))

---

[← Back to JavaScript Fundamentals](./README.md)
