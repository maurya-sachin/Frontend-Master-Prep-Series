# Advanced Function Concepts

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What is memoization? Implement a custom memoize() function.

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb

### Question
Explain memoization in JavaScript. Implement a custom `memoize()` function that caches function results.

### Answer

**Memoization** is an optimization technique that caches the results of expensive function calls and returns the cached result when the same inputs occur again.

1. **How Memoization Works**
   - Store function results in a cache (usually Map or object)
   - On function call, check if result exists in cache
   - If cached, return cached result (fast)
   - If not cached, compute result, store in cache, return

2. **When to Use Memoization**
   - Expensive computations (factorial, fibonacci)
   - Recursive functions
   - API calls with same parameters
   - Pure functions only (same input = same output)

3. **Benefits**
   - Improved performance (avoid redundant calculations)
   - Reduced API calls
   - Better user experience (faster responses)

4. **Trade-offs**
   - Memory usage (cache stores results)
   - Only works with pure functions
   - Cache invalidation can be complex

### Code Example

```javascript
// 1. BASIC MEMOIZATION IMPLEMENTATION

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Cache hit!');
      return cache.get(key);
    }

    console.log('Computing...');
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Test basic memoization
function expensiveSum(a, b) {
  // Simulate expensive operation
  for (let i = 0; i < 1000000000; i++) {}
  return a + b;
}

const memoizedSum = memoize(expensiveSum);

console.time('First call');
console.log(memoizedSum(5, 10)); // Computing... 15
console.timeEnd('First call'); // ~1000ms

console.time('Second call');
console.log(memoizedSum(5, 10)); // Cache hit! 15
console.timeEnd('Second call'); // ~0ms

// 2. MEMOIZED FIBONACCI (CLASSIC EXAMPLE)

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.time('Fib without memoization');
console.log(fibonacci(40)); // Very slow!
console.timeEnd('Fib without memoization'); // ~1000ms+

console.time('Fib with memoization');
console.log(memoizedFib(40)); // Much faster!
console.timeEnd('Fib with memoization'); // ~10ms

// 3. ADVANCED MEMOIZATION - WITH CUSTOM KEY FUNCTION

function memoizeWithKeyFn(fn, keyFn) {
  const cache = new Map();

  return function(...args) {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Custom key function for objects
const getUser = ({ id }) => {
  console.log(`Fetching user ${id}...`);
  return { id, name: `User ${id}`, email: `user${id}@example.com` };
};

const memoizedGetUser = memoizeWithKeyFn(
  getUser,
  (user) => user.id // Custom key: just use id
);

console.log(memoizedGetUser({ id: 1 })); // Fetching user 1...
console.log(memoizedGetUser({ id: 1 })); // (cached, no log)

// 4. MEMOIZATION WITH CACHE SIZE LIMIT (LRU)

function memoizeWithLimit(fn, limit = 100) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn.apply(this, args);

    // Remove oldest if limit reached
    if (cache.size >= limit) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
}

// 5. MEMOIZATION WITH EXPIRATION (TTL)

function memoizeWithTTL(fn, ttl = 5000) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log('Cache hit (not expired)');
      return cached.value;
    }

    console.log('Computing or cache expired...');
    const result = fn.apply(this, args);

    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  };
}

// Test TTL memoization
function getCurrentData(id) {
  return { id, timestamp: Date.now() };
}

const memoizedData = memoizeWithTTL(getCurrentData, 2000); // 2s TTL

console.log(memoizedData(1)); // Computing...
setTimeout(() => {
  console.log(memoizedData(1)); // Cache hit (not expired)
}, 1000);

setTimeout(() => {
  console.log(memoizedData(1)); // Computing or cache expired...
}, 3000);

// 6. MEMOIZATION CLASS-BASED

class Memoizer {
  constructor(fn) {
    this.fn = fn;
    this.cache = new Map();
  }

  call(...args) {
    const key = JSON.stringify(args);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = this.fn(...args);
    this.cache.set(key, result);
    return result;
  }

  clear() {
    this.cache.clear();
  }

  has(...args) {
    return this.cache.has(JSON.stringify(args));
  }

  delete(...args) {
    this.cache.delete(JSON.stringify(args));
  }
}

const sumMemoizer = new Memoizer((a, b) => a + b);
console.log(sumMemoizer.call(5, 10)); // 15
console.log(sumMemoizer.has(5, 10)); // true
sumMemoizer.clear();
console.log(sumMemoizer.has(5, 10)); // false

// 7. REACT USEMEMO HOOK PATTERN

// Simulated React useMemo behavior
function useMemo(factory, deps) {
  const cache = useMemo.cache || (useMemo.cache = new Map());
  const key = JSON.stringify(deps);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const value = factory();
  cache.set(key, value);
  return value;
}

// Usage
function ExpensiveComponent({ items }) {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a - b),
    [items]
  );

  return sortedItems;
}

// 8. PRACTICAL - API CALL MEMOIZATION

async function fetchUser(userId) {
  console.log(`Fetching user ${userId} from API...`);
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}

const memoizedFetchUser = memoizeWithTTL(fetchUser, 60000); // 1 min cache

// First call: hits API
await memoizedFetchUser(123);

// Second call within 1 min: returns cached result
await memoizedFetchUser(123);

// 9. DEBUGGING MEMOIZED FUNCTIONS

function memoizeWithStats(fn) {
  const cache = new Map();
  const stats = { hits: 0, misses: 0 };

  const memoized = function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      stats.hits++;
      return cache.get(key);
    }

    stats.misses++;
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.stats = () => ({ ...stats });
  memoized.clear = () => cache.clear();

  return memoized;
}

const computeWithStats = memoizeWithStats((n) => n * n);

computeWithStats(5);
computeWithStats(5);
computeWithStats(10);

console.log(computeWithStats.stats()); // { hits: 1, misses: 2 }
```

### Common Mistakes

- ❌ **Mistake:** Memoizing impure functions
  ```javascript
  // Won't work correctly - result depends on external state
  let multiplier = 2;

  const compute = memoize((n) => n * multiplier);

  console.log(compute(5)); // 10
  multiplier = 3;
  console.log(compute(5)); // 10 (cached, but should be 15!)
  ```

- ❌ **Mistake:** Memory leaks from unbounded cache
  ```javascript
  const memoized = memoize(expensiveFunction);

  // Cache grows infinitely!
  for (let i = 0; i < 1000000; i++) {
    memoized(i);
  }
  ```

- ✅ **Correct:** Use memoization with pure functions and cache limits
  ```javascript
  const memoized = memoizeWithLimit(pureFn, 100);
  ```

### Follow-up Questions

- "When should you NOT use memoization?"
- "How does memoization relate to dynamic programming?"
- "What is the difference between memoization and caching?"
- "How would you implement WeakMap-based memoization?"
- "How does React's useMemo hook work?"

<details>
<summary><strong>🔍 Deep Dive: How V8 Optimizes Memoized Functions</strong></summary>

**V8 Engine Perspective:**

When you memoize a function, V8's optimization pipeline treats it differently:

1. **Initial Execution (Ignition Interpreter)**
   - First call: Memoized wrapper → cache lookup → original function
   - V8 creates bytecode for both wrapper and original function
   - Cache miss triggers full execution

2. **Hot Function Detection**
   - After ~10-100 calls, V8 marks memoized function as "hot"
   - TurboFan compiler kicks in for optimization

3. **Inline Caching (IC)**
   - V8 uses inline caching for Map.get/has operations
   - Monomorphic IC: ~1ns overhead per cache lookup
   - Polymorphic IC: ~5-10ns overhead (multiple cache key types)

4. **Memory Layout**
   ```
   Memoized Function Object (72 bytes)
   ├─ Function pointer (8 bytes)
   ├─ Context/Scope (8 bytes)
   ├─ Prototype link (8 bytes)
   └─ Cache Map reference (8 bytes)

   Map Cache Entry (~56 bytes per entry)
   ├─ Key (24 bytes - serialized args)
   ├─ Value (24 bytes - result)
   └─ Map overhead (8 bytes)
   ```

5. **Optimization Opportunities**
   - **Escape Analysis**: If cache never escapes scope, V8 may stack-allocate
   - **Dead Code Elimination**: Unused cache entries can be eliminated
   - **Inline Cache**: Map.has() gets inlined in hot loops

6. **Performance Characteristics**
   - Cache hit: 5-15ns (Map lookup + return)
   - Cache miss: Original function time + 10-20ns (Map set)
   - JSON.stringify overhead: 50-200ns for complex args
   - Optimal: Custom key function (0 serialization)

**Example - Measuring Overhead:**
```javascript
function expensiveCalc(n) {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) sum += i;
  return sum + n;
}

const memoized = memoize(expensiveCalc);

console.time('First call');
memoized(42); // ~50ms (calculation time)
console.timeEnd('First call');

console.time('Cached call');
memoized(42); // ~0.015ms (cache lookup)
console.timeEnd('Cached call');

// Cache overhead: 0.015ms (15,000ns) - negligible
// Speedup: 3,333x faster
```

**V8 Deoptimization Triggers:**
- ❌ Changing cache from Map to Object mid-execution
- ❌ Storing different types in cache (polymorphism)
- ❌ Deleting cache entries (creates holes in Map)
- ✅ Use consistent types, avoid mutations

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Memory Leak in Production Dashboard</strong></summary>

**Problem:** Dashboard displaying stock prices crashed after 6 hours with "JavaScript heap out of memory" error.

**Context:**
- Real-time stock dashboard for 500 companies
- Updates every 5 seconds
- Memoized price calculation function
- Users reported crashes during overnight trading sessions

**Initial Implementation (BUGGY):**
```javascript
// ❌ MEMORY LEAK
function calculateStockMetrics(stockData) {
  const { symbol, price, volume, timestamp } = stockData;

  // Expensive calculation: technical indicators
  const sma = calculateSMA(stockData);
  const rsi = calculateRSI(stockData);
  const macd = calculateMACD(stockData);

  return { symbol, sma, rsi, macd };
}

// Naive memoization - unbounded cache!
const memoizedCalculate = memoize(calculateStockMetrics);

// Called every 5 seconds for 500 stocks
setInterval(() => {
  stocks.forEach(stock => {
    const metrics = memoizedCalculate(stock); // Each call adds to cache!
    updateDashboard(metrics);
  });
}, 5000);
```

**Metrics:**
- Cache entries after 1 hour: 500 stocks × 720 updates = 360,000 entries
- Memory per entry: ~450 bytes (serialized stock data + result)
- Total memory: 360,000 × 450 = 162 MB
- After 6 hours: 972 MB → heap exhausted
- Crash frequency: Every 6-8 hours during active trading

**Root Causes:**
1. **Unbounded cache growth**: Each new timestamp creates unique cache key
2. **JSON.stringify key generation**: Includes timestamp → never matches
3. **No cache invalidation**: Old data never removed
4. **High cardinality keys**: 500 stocks × frequent updates

**Solution 1 - Custom Key Function (Symbol Only):**
```javascript
function memoizeStockCalc(fn) {
  const cache = new Map();

  return function(stockData) {
    // Key by symbol only, ignore timestamp
    const key = stockData.symbol;

    // Cache recent result (last 10 seconds)
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < 10000) {
      return cached.value;
    }

    const result = fn(stockData);
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  };
}

const memoizedCalculate = memoizeStockCalc(calculateStockMetrics);
```

**Result:**
- Cache entries stabilized at 500 (one per stock)
- Memory usage: 500 × 450 bytes = 225 KB
- 99.9% reduction in memory usage
- No crashes in 30-day test period

**Solution 2 - LRU Cache with Size Limit:**
```javascript
class LRUCache {
  constructor(limit = 1000) {
    this.limit = limit;
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
    // Remove oldest if at limit
    if (this.cache.size >= this.limit && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.delete(key); // Remove if exists
    this.cache.set(key, value); // Add at end
  }
}

function memoizeWithLRU(fn, limit = 1000) {
  const cache = new LRUCache(limit);

  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== undefined) return cached;

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const memoizedCalculate = memoizeWithLRU(calculateStockMetrics, 500);
```

**Production Metrics After Fix:**
- Peak memory: 225 KB (vs 972 MB)
- Cache hit rate: 85% (5-second TTL prevents stale data)
- CPU reduction: 78% (fewer recalculations)
- Uptime: 99.99% (no crashes in 6 months)

**Key Lessons:**
1. Always set cache limits for production memoization
2. Use custom key functions for high-frequency data
3. Add TTL for time-sensitive data
4. Monitor cache size and hit rate
5. Test under realistic load (overnight sessions)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Memoization Strategies</strong></summary>

## Cache Key Strategies

| Strategy | Pros | Cons | Use Case |
|----------|------|------|----------|
| **JSON.stringify** | Simple, works with objects | Slow (50-200ns), order-sensitive | Simple args, low frequency |
| **Custom key function** | Fast, flexible | Requires manual implementation | High frequency, known structure |
| **WeakMap (object keys)** | Auto GC, no memory leaks | Only works with objects | Object-heavy operations |
| **Primitive args only** | Fastest (no serialization) | Limited to primitives | Math operations, counters |

## Cache Eviction Strategies

| Strategy | Memory Usage | Complexity | Best For |
|----------|--------------|------------|----------|
| **No eviction** | Unbounded ❌ | Simple | Pure functions, finite inputs |
| **TTL (Time-To-Live)** | Bounded ✅ | Medium | Time-sensitive data |
| **LRU (Least Recently Used)** | Bounded ✅ | Complex | Varying access patterns |
| **LFU (Least Frequently Used)** | Bounded ✅ | Very complex | Known hot/cold data |
| **FIFO (First In First Out)** | Bounded ✅ | Simple | Uniform importance |

## When to Use Memoization

**✅ Good Use Cases:**
- Recursive algorithms (fibonacci, factorial)
- Expensive pure calculations (prime factorization, complex math)
- API calls with identical parameters
- React component computations (useMemo)
- Build-time computations (static site generation)
- Parsing/serialization with repeated inputs

**❌ Bad Use Cases:**
- Impure functions (results vary with same input)
- Functions with side effects (API writes, logging)
- Highly variable inputs (never repeat)
- Cheap operations (overhead exceeds benefit)
- Time-sensitive operations (stock prices, real-time data)
- Memory-constrained environments

## Performance Characteristics

```javascript
// Benchmark: When does memoization pay off?

// Fast function - DON'T memoize
function add(a, b) { return a + b; }
// Overhead: 15ns cache lookup > 1ns execution ❌

// Medium function - MAYBE memoize
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
// Break-even: ~5 calls with same input ✅

// Expensive function - DEFINITELY memoize
function fibonacci(n) {
  return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}
// fib(40): 331ms → 0.05ms (6,620x faster) ✅✅✅
```

## Rule of Thumb

**Memoize when:**
```
(Function execution time) > (Cache overhead + lookup time)
AND
(Cache hit probability) > 10%
```

**Example Calculation:**
- Function time: 100ms
- Cache overhead: 0.015ms
- Hit probability: 50%
- Expected speedup: 50% × (100ms / 0.015ms) = 3,333x ✅

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Analogy:** Memoization is like a chef's prep station.

**Without Memoization (Cook Everything Fresh):**
```javascript
function makePasta(type, sauce) {
  // Every time:
  console.log('Boiling water...');
  console.log('Cooking pasta...');
  console.log('Making sauce...');
  return `${type} pasta with ${sauce}`;
}

makePasta('penne', 'marinara'); // Takes 20 minutes
makePasta('penne', 'marinara'); // Takes ANOTHER 20 minutes (same order!)
```

**With Memoization (Prep and Store):**
```javascript
const memoizedMakePasta = memoize(makePasta);

memoizedMakePasta('penne', 'marinara');
// First time: Cooks fresh (20 minutes)
// Stores in warming tray

memoizedMakePasta('penne', 'marinara');
// Second time: Serves from tray (30 seconds!)
```

**How It Works (Step by Step):**

```javascript
// 1. Create memoized function
function memoize(fn) {
  const cache = new Map();  // Recipe book with results

  return function(...args) {
    const key = JSON.stringify(args);  // Recipe name

    // Check recipe book
    if (cache.has(key)) {
      console.log('Found it! Serving from cache.');
      return cache.get(key);
    }

    // Not in book, cook it
    console.log('Not cached, cooking fresh...');
    const result = fn(...args);

    // Save recipe result
    cache.set(key, result);
    return result;
  };
}

// 2. Test it
function expensive(n) {
  console.log('Computing...');
  let sum = 0;
  for (let i = 0; i < 1000000000; i++) sum += i;
  return sum + n;
}

const fast = memoize(expensive);

fast(5);  // "Computing..." → takes 1 second
fast(5);  // "Found it!" → takes 0.001 seconds
fast(10); // "Computing..." → takes 1 second (different input)
fast(5);  // "Found it!" → takes 0.001 seconds
```

**Real Example - Fibonacci:**

```javascript
// Slow version (no memory)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);  // Recalculates same values!
}

fib(40); // Calls fibonacci 331 MILLION times! 🐌

// Fast version (with memory)
const memoFib = memoize(fib);

memoFib(40); // Calls fibonacci 40 times total! 🚀
// Each result saved → never recalculated
```

**Visual:**
```
Without Memoization:
fib(5) → fib(4) → fib(3) → fib(2) → fib(1)
              ↓       ↓       ↓
            fib(3) → fib(2) → fib(1)  (RECALCULATED!)
                       ↓
                     fib(2) → fib(1)  (RECALCULATED AGAIN!)

With Memoization:
fib(5) → fib(4) → fib(3) → fib(2) → fib(1) ✅ Saved
              ↓       ↓
         [cache hit] [cache hit] ✅ Reused
```

**When to Use:**
- ✅ Same input → Same output (pure functions)
- ✅ Expensive operations (lots of math, API calls)
- ✅ Repeated calls with same data

**When NOT to Use:**
- ❌ Results change (random numbers, current time)
- ❌ Side effects (saving to database, logging)
- ❌ Simple operations (addition, string concatenation)

**Memory Warning:**
```javascript
// ❌ BAD: Cache grows forever
const memo = memoize(fn);
for (let i = 0; i < 1000000; i++) {
  memo(i);  // 1 million cache entries!
}

// ✅ GOOD: Limited cache
const memoLimited = memoizeWithLimit(fn, 100);
for (let i = 0; i < 1000000; i++) {
  memoLimited(i);  // Only keeps 100 most recent
}
```

</details>

### Resources

- [MDN: Memoization](https://developer.mozilla.org/en-US/docs/Glossary/Memoization)
- [JavaScript.info: Decorators and Forwarding](https://javascript.info/call-apply-decorators)
- [Understanding Memoization](https://www.freecodecamp.org/news/memoization-in-javascript-and-react/)

---

