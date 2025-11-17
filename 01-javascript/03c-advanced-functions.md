# Advanced Function Concepts

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 10: What is memoization? Implement a custom memoize() function.

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

### Resources

- [MDN: Memoization](https://developer.mozilla.org/en-US/docs/Glossary/Memoization)
- [JavaScript.info: Decorators and Forwarding](https://javascript.info/call-apply-decorators)
- [Understanding Memoization](https://www.freecodecamp.org/news/memoization-in-javascript-and-react/)

---

