# Objects & Collections

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What are Object.keys(), Object.values(), and Object.entries()?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain these Object methods and when you'd use each.

### Answer

These methods extract keys, values, or key-value pairs from objects.

1. **Object.keys(obj)**
   - Returns array of object's own property names
   - Only enumerable properties
   - Same order as for...in loop

2. **Object.values(obj)**
   - Returns array of object's own property values

3. **Object.entries(obj)**
   - Returns array of [key, value] pairs
   - Useful for Object destructuring

### Code Example

```javascript
const user = {
  name: "Alice",
  age: 25,
  city: "Boston"
};

// 1. Object.keys()
console.log(Object.keys(user)); // ["name", "age", "city"]

// 2. Object.values()
console.log(Object.values(user)); // ["Alice", 25, "Boston"]

// 3. Object.entries()
console.log(Object.entries(user));
// [["name", "Alice"], ["age", 25], ["city", "Boston"]]

// 4. ITERATING OVER OBJECTS
Object.keys(user).forEach(key => {
  console.log(`${key}: ${user[key]}`);
});

// With entries (cleaner)
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// 5. CONVERTING OBJECT TO MAP
const map = new Map(Object.entries(user));

// 6. FILTERING OBJECT
const filtered = Object.fromEntries(
  Object.entries(user).filter(([key, value]) => typeof value === 'string')
);
// { name: "Alice", city: "Boston" }
```

<details>
<summary><strong>🔍 Deep Dive: How V8 Implements Object Iteration</strong></summary>

**V8 Internal Object Structure:**

JavaScript objects in V8 use two storage mechanisms:
1. **Fast properties** (in-object): Direct memory layout for first ~10 properties
2. **Dictionary mode** (slow properties): Hash table for >10 or after deletions

**Object.keys() Implementation:**
```cpp
// Simplified V8 pseudo-code
Object.keys(obj) {
  if (obj.hasFastProperties()) {
    // Fast path: iterate descriptor array
    return obj.descriptors.enumerableKeys();  // ~5ns per key
  } else {
    // Slow path: hash table iteration
    return obj.dictionary.enumerableKeys();    // ~50ns per key
  }
}
```

**Performance Characteristics:**
- **Object.keys()**: Returns array → 1 allocation (~24 bytes + 8 bytes per key)
- **Object.values()**: Returns array → 1 allocation + clones values
- **Object.entries()**: Returns nested array → 2 allocations per entry
- **for...in loop**: Zero allocations (iterator pattern)

**Property Order (spec-guaranteed since ES2015):**
1. Integer keys (0, 1, 2...) in ascending order
2. String keys in insertion order
3. Symbol keys in insertion order

**Example:**
```javascript
const obj = {
  'b': 2,
  '1': 'one',
  'a': 1,
  '0': 'zero'
};

Object.keys(obj);
// ['0', '1', 'a', 'b']
// ↑ integer keys first (sorted), then string keys (insertion order)
```

**Hidden Classes and Optimization:**
```javascript
// ✅ Monomorphic (fast) - same shape
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];
users.forEach(u => Object.keys(u)); // Same hidden class → optimized

// ❌ Polymorphic (slow) - different shapes
const mixed = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', city: 'NYC' }  // Different structure!
];
mixed.forEach(u => Object.keys(u)); // Different hidden classes → slow
```

**Benchmark: Iteration Performance (10,000 objects with 10 properties each):**

```javascript
const objects = Array.from({ length: 10000 }, (_, i) => ({
  prop1: i, prop2: i * 2, prop3: i * 3, prop4: i * 4, prop5: i * 5,
  prop6: i * 6, prop7: i * 7, prop8: i * 8, prop9: i * 9, prop10: i * 10
}));

// Benchmark 1: Object.keys()
console.time('Object.keys');
objects.forEach(obj => {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    const value = obj[key];
  });
});
console.timeEnd('Object.keys'); // ~45ms

// Benchmark 2: Object.values()
console.time('Object.values');
objects.forEach(obj => {
  const values = Object.values(obj);
  values.forEach(value => {
    // Process value
  });
});
console.timeEnd('Object.values'); // ~42ms

// Benchmark 3: Object.entries()
console.time('Object.entries');
objects.forEach(obj => {
  Object.entries(obj).forEach(([key, value]) => {
    // Process key and value
  });
});
console.timeEnd('Object.entries'); // ~52ms (slowest - creates more arrays)

// Benchmark 4: for...in loop
console.time('for...in');
objects.forEach(obj => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
    }
  }
});
console.timeEnd('for...in'); // ~12ms (fastest - no allocations!)

// Benchmark 5: for...of with Object.entries()
console.time('for...of entries');
objects.forEach(obj => {
  for (const [key, value] of Object.entries(obj)) {
    // Process key and value
  });
});
console.timeEnd('for...of entries'); // ~50ms
```

**Memory Profiling:**
```javascript
// Test object
const obj = {};
for (let i = 0; i < 100; i++) {
  obj[`key${i}`] = i;
}

// Object.keys() - allocates array
const keys = Object.keys(obj);
// Memory: ~1.2KB (array object + 100 string references)

// Object.values() - allocates array + values
const values = Object.values(obj);
// Memory: ~1.6KB (array + 100 number primitives)

// Object.entries() - allocates array + nested arrays
const entries = Object.entries(obj);
// Memory: ~4.8KB (array + 100 sub-arrays + 100 keys + 100 values)

// for...in - no allocation
for (const key in obj) {
  // Memory: 0 bytes (just iterator state)
}
```

**V8 Optimization Tips:**

1. **Keep objects in fast mode:**
```javascript
// ✅ Good: Properties added in consistent order
function createUser(name, age, city) {
  return { name, age, city }; // Always same order
}

// ❌ Bad: Random property order
function createUserBad(data) {
  const user = {};
  if (data.city) user.city = data.city;
  if (data.name) user.name = data.name; // Different order!
  if (data.age) user.age = data.age;
  return user; // V8 can't optimize hidden class
}
```

2. **Avoid delete in hot paths:**
```javascript
// ❌ Bad: delete triggers dictionary mode
const obj = { a: 1, b: 2, c: 3 };
delete obj.b; // Now in dictionary mode (slow!)
Object.keys(obj); // ~10x slower

// ✅ Good: Set to undefined or null
const obj2 = { a: 1, b: 2, c: 3 };
obj2.b = undefined; // Stays in fast mode
Object.keys(obj2).filter(k => obj2[k] !== undefined);
```

3. **Limit property count:**
```javascript
// ✅ Good: <10 properties stay inline
const small = { a: 1, b: 2, c: 3 }; // Fast mode

// ⚠️ Careful: >10 properties move to dictionary
const large = {};
for (let i = 0; i < 50; i++) {
  large[`prop${i}`] = i; // Dictionary mode after 10-15 props
}
```

**Property Descriptors Impact:**
```javascript
const obj = {
  normal: 1,
  get computed() { return 2; }
};

// Non-enumerable properties
Object.defineProperty(obj, 'hidden', {
  value: 3,
  enumerable: false
});

Object.keys(obj); // ['normal', 'computed'] (only enumerable)
Object.getOwnPropertyNames(obj); // ['normal', 'computed', 'hidden'] (all)

// Symbol properties
const sym = Symbol('secret');
obj[sym] = 4;

Object.keys(obj); // ['normal', 'computed'] (no symbols)
Object.getOwnPropertySymbols(obj); // [Symbol(secret)]
```

**Polyfill Understanding:**
```javascript
// How Object.entries() could be implemented
if (!Object.entries) {
  Object.entries = function(obj) {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
}

// Shows why entries() is slower:
// 1. Calls Object.keys() (allocation 1)
// 2. Creates result array (allocation 2)
// 3. Creates sub-arrays for each entry (allocations 3...n)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Object Transformation Performance Crisis</strong></summary>

**Scenario:** E-commerce dashboard loading 10,000 product records. Frontend freezes for 3+ seconds when transforming API response. Users complaining about "app hanging" when viewing inventory. Mobile devices completely unusable.

**Production Impact:**
- Page load time: 8.2 seconds (target: <2s)
- Time to Interactive: 5.8 seconds
- First Input Delay: 3.1 seconds
- User complaints: 45/week about slow dashboard
- Mobile bounce rate: 68% (desktop: 22%)
- Revenue impact: $12k/week lost sales (users give up)

**The Buggy Code:**
```javascript
// ❌ PERFORMANCE DISASTER
async function loadInventory() {
  const response = await fetch('/api/products?limit=10000');
  const { products } = await response.json();

  // Transform products for display
  const transformedProducts = products.map(product => {
    // MISTAKE 1: Multiple Object method calls per product
    const keys = Object.keys(product);          // Allocation 1
    const values = Object.values(product);      // Allocation 2
    const entries = Object.entries(product);    // Allocation 3

    // MISTAKE 2: Creating intermediate objects
    const uppercase = {};
    entries.forEach(([key, value]) => {
      if (typeof value === 'string') {
        uppercase[key] = value.toUpperCase();   // Allocation 4+
      }
    });

    // MISTAKE 3: Multiple filtering passes
    const stringProps = Object.entries(product)  // Allocation 5
      .filter(([k, v]) => typeof v === 'string');

    const numberProps = Object.entries(product)  // Allocation 6
      .filter(([k, v]) => typeof v === 'number');

    // MISTAKE 4: Object.assign in loop
    return Object.assign({}, product, uppercase, {  // Allocation 7
      stringCount: stringProps.length,
      numberCount: numberProps.length,
      keys: keys,
      values: values
    });
  });

  renderProducts(transformedProducts);
}

// Performance metrics (10,000 products):
// - Total time: 3,847ms
// - Memory allocated: 125MB
// - GC pauses: 8 collections × 180ms = 1,440ms
// - Main thread blocked: 3.8 seconds
// - Frame rate during load: 4 FPS (target: 60 FPS)
// - Mobile devices: 8-12 seconds, some crash (out of memory)
```

**Debugging with Chrome DevTools:**
```javascript
// Performance profiling showed:
// 1. Object.entries() called 30,000 times (3× per product)
// 2. 280,000+ array allocations
// 3. GC spending 37% of time cleaning up
// 4. forEach callbacks: 62% of CPU time

// Memory Timeline:
// 0ms: 18MB (initial)
// 500ms: 45MB (first 1,300 products)
// 1000ms: 78MB
// 1500ms: 112MB
// 2000ms: 145MB (peak)
// 2200ms: GC kicks in (pause: 180ms)
// 2400ms: 95MB (after GC)
// 2800ms: 125MB (all products)
// 3000ms: GC again (pause: 220ms)
```

**Root Cause Analysis:**
1. **Unnecessary method calls**: 3 Object methods per product × 10,000 = 30,000 calls
2. **Allocations in hot loop**: 7+ allocations per product × 10,000 = 70,000+ objects
3. **Multiple passes**: Same data iterated 3-4 times per product
4. **No data chunking**: Processing all 10,000 at once blocks main thread
5. **Inefficient string concatenation**: In nested loops

**Solution 1: Single-Pass Iteration (Optimized):**
```javascript
// ✅ FIX: Single for...in loop, minimal allocations
function transformProducts(products) {
  const transformed = new Array(products.length);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const result = { ...product }; // Shallow copy (1 allocation)

    let stringCount = 0;
    let numberCount = 0;

    // Single pass through properties
    for (const key in product) {
      if (!product.hasOwnProperty(key)) continue;

      const value = product[key];
      const type = typeof value;

      if (type === 'string') {
        result[key] = value.toUpperCase();
        stringCount++;
      } else if (type === 'number') {
        numberCount++;
      }
    }

    result.stringCount = stringCount;
    result.numberCount = numberCount;
    transformed[i] = result;
  }

  return transformed;
}

// Performance: 10,000 products
// - Total time: 186ms (94% faster!)
// - Memory allocated: 8MB (94% less!)
// - GC pauses: 1 collection × 12ms
// - Main thread blocked: 186ms
// - Frame rate: 58 FPS
```

**Solution 2: Chunked Processing (For Large Datasets):**
```javascript
// ✅ BETTER: Process in chunks, don't block main thread
async function transformProductsChunked(products, chunkSize = 500) {
  const transformed = [];
  const totalChunks = Math.ceil(products.length / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, products.length);
    const chunk = products.slice(start, end);

    // Process chunk
    const chunkResult = chunk.map(product => {
      const result = { ...product };
      let stringCount = 0;
      let numberCount = 0;

      for (const key in product) {
        if (!product.hasOwnProperty(key)) continue;
        const value = product[key];

        if (typeof value === 'string') {
          result[key] = value.toUpperCase();
          stringCount++;
        } else if (typeof value === 'number') {
          numberCount++;
        }
      }

      result.stringCount = stringCount;
      result.numberCount = numberCount;
      return result;
    });

    transformed.push(...chunkResult);

    // Yield to browser between chunks
    if (i < totalChunks - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));

      // Optional: Update progress
      updateProgress((i + 1) / totalChunks);
    }
  }

  return transformed;
}

// Performance: 10,000 products
// - Total time: 245ms (spread across multiple frames)
// - Max frame time: 28ms (smooth 60 FPS)
// - Perceived responsiveness: Excellent
// - Can show progress bar
```

**Solution 3: Web Worker for Heavy Processing:**
```javascript
// ✅ BEST: Offload to Web Worker
// worker.js
self.onmessage = function(e) {
  const products = e.data;
  const transformed = new Array(products.length);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const result = { ...product };
    let stringCount = 0;
    let numberCount = 0;

    for (const key in product) {
      if (!product.hasOwnProperty(key)) continue;
      const value = product[key];

      if (typeof value === 'string') {
        result[key] = value.toUpperCase();
        stringCount++;
      } else if (typeof value === 'number') {
        numberCount++;
      }
    }

    result.stringCount = stringCount;
    result.numberCount = numberCount;
    transformed[i] = result;
  }

  self.postMessage(transformed);
};

// main.js
async function loadInventory() {
  const response = await fetch('/api/products?limit=10000');
  const { products } = await response.json();

  return new Promise((resolve, reject) => {
    const worker = new Worker('worker.js');

    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };

    worker.onerror = reject;
    worker.postMessage(products);
  });
}

// Performance: 10,000 products
// - Main thread: Not blocked at all!
// - Worker processing: 175ms
// - UI remains responsive
// - 60 FPS maintained throughout
```

**Real Production Metrics After Fix:**

```javascript
// Before (Object methods abuse):
// - Desktop load time: 3.8s → Users complained
// - Mobile load time: 8.2s → 68% bounce rate
// - Memory peak: 145MB → Mobile crashes
// - GC pauses: 1.4s total → Janky UX
// - Support tickets: 45/week
// - Revenue loss: $12k/week

// After (Solution 1 - Optimized single pass):
// - Desktop load time: 0.2s → 95% improvement ✅
// - Mobile load time: 0.8s → 90% improvement ✅
// - Memory peak: 22MB → No crashes ✅
// - GC pauses: 12ms → Smooth ✅
// - Support tickets: 2/week
// - Revenue recovered: $11k/week

// After (Solution 3 - Web Worker):
// - Desktop load time: 0.18s → 95% improvement ✅
// - Mobile load time: 0.6s → 93% improvement ✅
// - Main thread: Never blocked → Perfect 60 FPS ✅
// - User satisfaction: +92%
// - Mobile bounce rate: 12% (was 68%)
```

**Key Lessons:**
1. **Avoid multiple Object method calls in loops**: One for...in > 3× Object methods
2. **Single-pass iteration**: Process all transformations in one loop
3. **Minimize allocations**: Reuse, don't recreate
4. **Chunk large datasets**: Don't block main thread
5. **Web Workers for heavy work**: Keep UI responsive
6. **Profile before optimizing**: DevTools shows bottlenecks

**Comparison Matrix:**

| Approach | Time (10k) | Memory | Main Thread | Complexity |
|----------|-----------|---------|-------------|------------|
| Original (Object methods) | 3,847ms | 145MB | Blocked | Low |
| Optimized (for...in) | 186ms | 8MB | Blocked | Low |
| Chunked | 245ms | 12MB | Responsive | Medium |
| Web Worker | 175ms | 10MB | Never blocked | High |

</details>

<details>
<summary><strong>⚖️ Trade-offs: Object Iteration Methods</strong></summary>

| Method | Speed | Memory | Use Case |
|--------|-------|--------|----------|
| **for...in** | Fastest | Minimal | Performance-critical, large objects |
| **Object.keys()** | Fast | Medium | Array methods needed, functional style |
| **Object.values()** | Medium | Medium | Only values needed |
| **Object.entries()** | Slowest | Highest | Need both key & value, destructuring |

**Functional Programming vs Performance:**
```javascript
// Functional (readable, composable) - 45ms
const result = Object.entries(obj)
  .filter(([key, val]) => val > 10)
  .map(([key, val]) => [key, val * 2])
  .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

// Imperative (performant) - 8ms
const result = {};
for (const key in obj) {
  const val = obj[key];
  if (val > 10) {
    result[key] = val * 2;
  }
}
```

**Decision Matrix:**

### When to Use for...in
```javascript
// ✅ Large objects (>100 properties)
const bigObject = {};
for (let i = 0; i < 10000; i++) {
  bigObject[`key${i}`] = i;
}

for (const key in bigObject) {
  if (bigObject.hasOwnProperty(key)) {
    // Process - no allocation overhead
  }
}

// ✅ Hot paths (called millions of times)
function hotPath(obj) {
  let sum = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sum += obj[key];
    }
  }
  return sum;
}

// ✅ Streaming/iterative processing
for (const key in dataStream) {
  processChunk(key, dataStream[key]);
  // Can break early without allocating full array
  if (shouldStop()) break;
}
```

### When to Use Object.keys()
```javascript
// ✅ Need array methods
const keys = Object.keys(user);
const hasEmail = keys.includes('email');
const upperKeys = keys.map(k => k.toUpperCase());

// ✅ Functional composition
Object.keys(products)
  .filter(id => products[id].inStock)
  .map(id => products[id].name);

// ✅ Small-medium objects (<100 props)
const settings = { theme: 'dark', lang: 'en', notifications: true };
Object.keys(settings).forEach(key => {
  console.log(key, settings[key]);
});
```

### When to Use Object.values()
```javascript
// ✅ Only need values, not keys
const prices = { apple: 1.5, banana: 0.8, orange: 1.2 };
const total = Object.values(prices).reduce((sum, price) => sum + price, 0);

// ✅ Value-based operations
const users = { u1: { age: 25 }, u2: { age: 30 }, u3: { age: 22 } };
const averageAge = Object.values(users)
  .reduce((sum, u) => sum + u.age, 0) / Object.values(users).length;

// ✅ Checking all values
const allInStock = Object.values(inventory).every(item => item.stock > 0);
```

### When to Use Object.entries()
```javascript
// ✅ Need both key and value
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// ✅ Converting to Map
const map = new Map(Object.entries(obj));

// ✅ Filtering object properties
const filtered = Object.fromEntries(
  Object.entries(user).filter(([key, value]) => value !== null)
);

// ✅ Object transformation
const doubled = Object.fromEntries(
  Object.entries(prices).map(([fruit, price]) => [fruit, price * 2])
);
```

**Performance Comparison (1,000 objects with 20 properties each):**
```javascript
const testData = Array.from({ length: 1000 }, (_, i) => {
  const obj = {};
  for (let j = 0; j < 20; j++) {
    obj[`prop${j}`] = j;
  }
  return obj;
});

// Benchmark 1: for...in
console.time('for...in');
testData.forEach(obj => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
    }
  }
});
console.timeEnd('for...in'); // ~8ms

// Benchmark 2: Object.keys()
console.time('Object.keys');
testData.forEach(obj => {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
  });
});
console.timeEnd('Object.keys'); // ~38ms

// Benchmark 3: Object.entries()
console.time('Object.entries');
testData.forEach(obj => {
  Object.entries(obj).forEach(([key, value]) => {
    // Use key and value
  });
});
console.timeEnd('Object.entries'); // ~45ms

// Benchmark 4: for...of + Object.entries()
console.time('for...of entries');
testData.forEach(obj => {
  for (const [key, value] of Object.entries(obj)) {
    // Use key and value
  }
});
console.timeEnd('for...of entries'); // ~47ms
```

**Memory Usage Comparison (1 object with 1,000 properties):**
```javascript
const largeObj = {};
for (let i = 0; i < 1000; i++) {
  largeObj[`prop${i}`] = i;
}

// for...in: 0 bytes allocated (iterator only)
for (const key in largeObj) {
  // No allocation
}

// Object.keys(): ~12KB (array + 1000 string references)
const keys = Object.keys(largeObj);

// Object.values(): ~16KB (array + 1000 number values)
const values = Object.values(largeObj);

// Object.entries(): ~48KB (array + 1000 sub-arrays + keys + values)
const entries = Object.entries(largeObj);
```

**Rule of Thumb:**
- **Small objects (<20 props)**: Use Object.entries() for readability
- **Medium objects (20-100 props)**: Use Object.keys() if need array methods
- **Large objects (>100 props)**: Use for...in for best performance
- **Hot paths**: Always use for...in
- **Unknown object size**: Measure first with DevTools!

**Readability vs Performance:**
```javascript
// When readability matters more (most code):
const filtered = Object.fromEntries(
  Object.entries(user).filter(([k, v]) => v != null)
); // Clear intent

// When performance matters more (hot paths, large data):
const filtered = {};
for (const key in user) {
  if (user.hasOwnProperty(key) && user[key] != null) {
    filtered[key] = user[key];
  }
} // 5-10x faster
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Object Iteration Simplified</strong></summary>

Think of an object as a **filing cabinet**:

**Object.keys()** = Get list of all drawer labels
```javascript
const cabinet = { photos: 50, documents: 120, books: 30 };
Object.keys(cabinet); // ['photos', 'documents', 'books']
```

**Object.values()** = Count items in each drawer (ignore labels)
```javascript
Object.values(cabinet); // [50, 120, 30]
```

**Object.entries()** = Get both labels AND counts
```javascript
Object.entries(cabinet);
// [['photos', 50], ['documents', 120], ['books', 30]]
```

**When to use:**
- **keys()**: "What are my options?" (dropdown menu items)
- **values()**: "How many total?" (sum all quantities)
- **entries()**: "Show me everything" (display table with labels)

**Common Pattern - Transform Object:**
```javascript
const prices = { apple: 1, banana: 0.5, orange: 0.75 };

// Double all prices
const doubled = Object.fromEntries(
  Object.entries(prices).map(([fruit, price]) => [fruit, price * 2])
);
// { apple: 2, banana: 1, orange: 1.5 }
```

**Gotcha - Prototype Properties:**
```javascript
const obj = { own: 'yes' };
obj.__proto__.inherited = 'no';

Object.keys(obj);    // ['own'] - only own properties ✅
for (let key in obj) // 'own', 'inherited' - includes prototype ❌
```

Always use `hasOwnProperty()` with `for...in` to skip inherited properties!

**Simple Examples:**

1. **Check if object is empty:**
```javascript
const isEmpty = Object.keys(obj).length === 0;
```

2. **Get all values and sum them:**
```javascript
const prices = { apple: 1, banana: 2, orange: 3 };
const total = Object.values(prices).reduce((sum, price) => sum + price, 0);
// total = 6
```

3. **Loop through object:**
```javascript
const user = { name: 'Alice', age: 25, city: 'Boston' };

// Method 1: entries (cleanest)
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}

// Method 2: keys
for (const key of Object.keys(user)) {
  console.log(`${key}: ${user[key]}`);
}

// Method 3: for...in (fastest, but verbose)
for (const key in user) {
  if (user.hasOwnProperty(key)) {
    console.log(`${key}: ${user[key]}`);
  }
}
```

4. **Filter object properties:**
```javascript
const user = { name: 'Alice', age: null, city: 'Boston', email: null };

// Remove null values
const filtered = Object.fromEntries(
  Object.entries(user).filter(([key, value]) => value !== null)
);
// { name: 'Alice', city: 'Boston' }
```

**Interview Answer Template:**

"Object.keys(), Object.values(), and Object.entries() are methods to extract data from objects.

- **Object.keys()** returns an array of property names
- **Object.values()** returns an array of values
- **Object.entries()** returns an array of [key, value] pairs

They're useful for iterating over objects, transforming data, and working with array methods like map, filter, and reduce. All three only return enumerable own properties, not inherited ones.

For example, if I have a user object with name, age, and city, I can use Object.entries() with array destructuring to loop through and log each property cleanly."

</details>

### Resources

- [MDN: Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- [MDN: Object.values()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
- [MDN: Object.entries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)

---

## Question 2: Map vs Object - When to Use Which?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain the differences between Map and Object in JavaScript. When should you use each?

### Answer

**Map** is a collection of keyed data items, like Object, but with key differences in behavior and capabilities.

**Key Differences:**

| Feature | Map | Object |
|---------|-----|--------|
| Key Types | Any type | String/Symbol only |
| Key Order | Insertion order | Not guaranteed* |
| Size | `map.size` | Manual counting |
| Iteration | Built-in iterators | Need `Object.keys()` etc. |
| Performance | Better for frequent add/delete | Better for simple storage |
| JSON | Not serializable | Direct `JSON.stringify()` |
| Prototype | No inherited keys | Has prototype chain |

*Modern JS maintains insertion order for string keys

### Code Example

**Map Basics:**

```javascript
// Creating Maps
const map = new Map();

// Setting values
map.set('name', 'John');
map.set(1, 'number key');
map.set(true, 'boolean key');

// Objects as keys (powerful feature!)
const objKey = { id: 1 };
map.set(objKey, 'object value');

// Getting values
console.log(map.get('name'));     // "John"
console.log(map.get(1));          // "number key"
console.log(map.get(objKey));     // "object value"

// Size
console.log(map.size);  // 4

// Checking existence
console.log(map.has('name'));  // true
console.log(map.has('age'));   // false

// Deleting
map.delete('name');
console.log(map.has('name'));  // false

// Clear all
map.clear();
console.log(map.size);  // 0
```

**Object as Key (Map's Superpower):**

```javascript
// Map: Objects as keys
const map = new Map();

const user1 = { name: "Alice" };
const user2 = { name: "Bob" };

map.set(user1, "User 1 data");
map.set(user2, "User 2 data");

console.log(map.get(user1));  // "User 1 data"
console.log(map.get(user2));  // "User 2 data"

// Object: Can't use objects as keys effectively
const obj = {};
obj[user1] = "User 1 data";  // Converts to string "[object Object]"
obj[user2] = "User 2 data";  // Same key! Overwrites!

console.log(Object.keys(obj));  // ["[object Object]"]
console.log(obj[user1]);        // "User 2 data" (overwritten!)
```

**Iteration:**

```javascript
const map = new Map([
  ['name', 'John'],
  ['age', 30],
  ['city', 'NYC']
]);

// forEach
map.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// for...of (natural iteration)
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// Keys
for (const key of map.keys()) {
  console.log(key);
}

// Values
for (const value of map.values()) {
  console.log(value);
}

// Entries
for (const [key, value] of map.entries()) {
  console.log(key, value);
}

// Object iteration (more complex)
const obj = { name: 'John', age: 30, city: 'NYC' };

// Need Object methods
for (const key of Object.keys(obj)) {
  console.log(`${key}: ${obj[key]}`);
}

// Or Object.entries
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key}: ${value}`);
}
```

**Converting Between Map and Object:**

```javascript
// Object to Map
const obj = { a: 1, b: 2, c: 3 };
const map = new Map(Object.entries(obj));

console.log(map);  // Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 }

// Map to Object
const mapToObj = Object.fromEntries(map);
console.log(mapToObj);  // { a: 1, b: 2, c: 3 }

// Or manually:
const obj2 = {};
for (const [key, value] of map) {
  obj2[key] = value;
}
```

**When to Use Map:**

```javascript
// 1. Non-string keys
const userRoles = new Map();
userRoles.set(userObject, 'admin');  // Object as key

// 2. Frequent additions/deletions
const cache = new Map();
cache.set(key1, value1);
cache.delete(key1);  // Faster than delete obj[key1]

// 3. Need size
console.log(cache.size);  // Direct property

// 4. Need iteration order
const ordered = new Map();
ordered.set('first', 1);
ordered.set('second', 2);
ordered.set('third', 3);
// Guaranteed to iterate in insertion order

// 5. No prototype pollution
const safeMap = new Map();
safeMap.set('__proto__', 'safe');  // No issues
safeMap.set('constructor', 'safe');

// vs Object (can be dangerous):
const obj = {};
obj['__proto__'] = 'danger';  // Can cause issues
```

**When to Use Object:**

```javascript
// 1. Simple key-value storage with string keys
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// 2. JSON serialization needed
const data = { name: 'John', age: 30 };
const json = JSON.stringify(data);  // Works!

// Map requires conversion:
const map = new Map([['name', 'John']]);
// JSON.stringify(map);  // "{}" (loses data!)
const mapJson = JSON.stringify(Object.fromEntries(map));  // Must convert

// 3. Property access syntax
console.log(config.apiUrl);    // Clean
console.log(config['apiUrl']); // Or bracket notation

// vs Map:
console.log(map.get('apiUrl'));  // Must use .get()

// 4. Object literal syntax
const settings = {
  theme: 'dark',
  language: 'en',
  notifications: true
};

// vs Map (more verbose):
const mapSettings = new Map([
  ['theme', 'dark'],
  ['language', 'en'],
  ['notifications', true]
]);
```

**Performance Comparison:**

```javascript
// Benchmark: Frequent additions/deletions
const map = new Map();
const obj = {};

console.time('Map operations');
for (let i = 0; i < 1000000; i++) {
  map.set(i, i);
  map.delete(i);
}
console.timeEnd('Map operations');

console.time('Object operations');
for (let i = 0; i < 1000000; i++) {
  obj[i] = i;
  delete obj[i];
}
console.timeEnd('Object operations');

// Map is generally faster for add/delete operations
```

### Common Mistakes

❌ **Wrong**: Using bracket notation with Map
```javascript
const map = new Map();
map['key'] = 'value';  // ❌ Wrong! Sets property, not Map entry

console.log(map.get('key'));  // undefined
console.log(map['key']);      // 'value' (property, not Map entry)
```

✅ **Correct**: Use .set() and .get()
```javascript
map.set('key', 'value');
console.log(map.get('key'));  // 'value'
```

❌ **Wrong**: Expecting Map to work with JSON.stringify
```javascript
const map = new Map([['a', 1]]);
console.log(JSON.stringify(map));  // "{}" (empty!)
```

✅ **Correct**: Convert to Object first
```javascript
const obj = Object.fromEntries(map);
console.log(JSON.stringify(obj));  // '{"a":1}'
```

### Follow-up Questions
1. "What about WeakMap? How is it different?"
2. "Can you use functions as Map keys?"
3. "How do you clone a Map?"
4. "What's the time complexity of Map operations?"

<details>
<summary><strong>🔍 Deep Dive: V8 Implementation Differences</strong></summary>

**Object Storage in V8:**
```
Object (fast properties mode):
┌─────────────────────────┐
│ Hidden Class Pointer    │ → Points to shape/structure
├─────────────────────────┤
│ Properties (inline)     │ → Direct memory access (fastest)
│ prop1: value1          │
│ prop2: value2          │
└─────────────────────────┘

Object (dictionary mode - after >10 props or delete):
┌─────────────────────────┐
│ Hidden Class Pointer    │
├─────────────────────────┤
│ Hash Table Pointer      │ → Hash lookup required (slower)
└─────────────────────────┘
```

**Map Storage in V8:**
```
Map (always uses ordered hash table):
┌─────────────────────────┐
│ Table Pointer           │ → Ordered hash table
│ Size Counter            │ → Constant-time .size
└─────────────────────────┘
  ↓
OrderedHashTable:
[hash] → [key, value] pairs in insertion order
```

**Performance Characteristics:**

| Operation | Object (fast props) | Object (dict mode) | Map |
|-----------|---------------------|-------------------|-----|
| Set property | 1-2ns | 10-15ns | 8-12ns |
| Get property | 1-2ns | 10-15ns | 8-12ns |
| Delete property | Slow (→ dict mode) | 10-15ns | 8-12ns |
| Iteration | 5ns/prop | 50ns/prop | 8ns/entry |
| Size check | O(n) | O(n) | O(1) |

**Detailed Benchmarks (1 million operations):**

```javascript
// Test 1: Set operations
const iterations = 1000000;

// Object set (fast mode)
console.time('Object set (fast mode)');
const obj1 = {};
for (let i = 0; i < iterations; i++) {
  obj1[`key${i}`] = i;
}
console.timeEnd('Object set (fast mode)'); // ~180ms

// Map set
console.time('Map set');
const map1 = new Map();
for (let i = 0; i < iterations; i++) {
  map1.set(`key${i}`, i);
}
console.timeEnd('Map set'); // ~280ms

// Test 2: Get operations
console.time('Object get');
for (let i = 0; i < iterations; i++) {
  const val = obj1[`key${i}`];
}
console.timeEnd('Object get'); // ~35ms

console.time('Map get');
for (let i = 0; i < iterations; i++) {
  const val = map1.get(`key${i}`);
}
console.timeEnd('Map get'); // ~120ms

// Test 3: Delete operations
console.time('Object delete');
const obj2 = { ...obj1 };
for (let i = 0; i < 10000; i++) {
  delete obj2[`key${i}`];
}
console.timeEnd('Object delete'); // ~45ms (forces dictionary mode)

console.time('Map delete');
const map2 = new Map(map1);
for (let i = 0; i < 10000; i++) {
  map2.delete(`key${i}`);
}
console.timeEnd('Map delete'); // ~8ms (much faster!)

// Test 4: Iteration
console.time('Object iteration (for...in)');
for (const key in obj1) {
  const val = obj1[key];
}
console.timeEnd('Object iteration (for...in)'); // ~85ms

console.time('Map iteration (for...of)');
for (const [key, val] of map1) {
  // Process
}
console.timeEnd('Map iteration (for...of)'); // ~75ms

// Test 5: Size check
console.time('Object size');
const objSize = Object.keys(obj1).length;
console.timeEnd('Object size'); // ~65ms (O(n))

console.time('Map size');
const mapSize = map1.size;
console.timeEnd('Map size'); // ~0.001ms (O(1))
```

**Key Differences:**

1. **Property Access:**
   - Object: `obj.key` or `obj['key']` (optimized by IC - Inline Cache)
   - Map: `map.get(key)` (always hash lookup)

2. **Memory Overhead:**
   - Object: 24-40 bytes + 8 bytes per property
   - Map: 56 bytes + 24 bytes per entry (key + value + hash)

3. **Key Types:**
   - Object: Strings and Symbols only (others converted to strings)
   - Map: Any type (objects, functions, primitives)

**Example - Object coerces keys:**
```javascript
const obj = {};
const key1 = { id: 1 };
const key2 = { id: 2 };

obj[key1] = 'first';
obj[key2] = 'second';  // Overwrites first!

console.log(obj);
// { '[object Object]': 'second' }
// Both keys converted to same string!

const map = new Map();
map.set(key1, 'first');
map.set(key2, 'second');

console.log(map.size);  // 2 - distinct keys!
```

**Hidden Class Transitions:**
```javascript
// Object loses fast mode when properties deleted
const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };

console.time('Access before delete');
for (let i = 0; i < 1000000; i++) {
  const val = obj.a; // Fast property access
}
console.timeEnd('Access before delete'); // ~8ms

delete obj.c; // Triggers dictionary mode!

console.time('Access after delete');
for (let i = 0; i < 1000000; i++) {
  const val = obj.a; // Now slower hash lookup
}
console.timeEnd('Access after delete'); // ~42ms (5x slower!)

// Map doesn't suffer from this
const map = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);

console.time('Map access before delete');
for (let i = 0; i < 1000000; i++) {
  const val = map.get('a');
}
console.timeEnd('Map access before delete'); // ~120ms

map.delete('c');

console.time('Map access after delete');
for (let i = 0; i < 1000000; i++) {
  const val = map.get('a');
}
console.timeEnd('Map access after delete'); // ~120ms (same!)
```

**Optimization Tips:**

✅ **Use Object when:**
- Keys are known strings at compile time
- Need fast property access (dot notation)
- Serialization with JSON.stringify needed
- Small number of properties (<20)
- No deletions (stay in fast mode)

✅ **Use Map when:**
- Keys are dynamic or non-string types
- Frequent additions/deletions
- Need .size property (O(1) vs O(n))
- Order of insertion matters
- >100 entries (Map scales better)
- Security-sensitive (no prototype pollution)

**Memory Profiling:**
```javascript
// 10,000 entries comparison
const obj = {};
for (let i = 0; i < 10000; i++) {
  obj[`key${i}`] = i;
}
// Memory: ~450KB (fast mode)
// After delete: ~680KB (dictionary mode overhead)

const map = new Map();
for (let i = 0; i < 10000; i++) {
  map.set(`key${i}`, i);
}
// Memory: ~720KB (consistent, no mode changes)
```

**Prototype Chain Performance:**
```javascript
// Object - can have prototype lookup overhead
const obj = Object.create({ inherited: 'value' });
obj.own = 'own value';

console.time('Object property access');
for (let i = 0; i < 1000000; i++) {
  const val = obj.own; // Fast (own property)
  const val2 = obj.inherited; // Slower (prototype lookup)
}
console.timeEnd('Object property access'); // ~65ms

// Map - no prototype chain
const map = new Map([['own', 'own value']]);

console.time('Map get');
for (let i = 0; i < 1000000; i++) {
  const val = map.get('own'); // Always hash lookup
}
console.timeEnd('Map get'); // ~120ms
```

**Key Hashing Algorithm:**
```javascript
// Map uses SameValueZero algorithm
const map = new Map();

// Different object instances = different keys
map.set({ id: 1 }, 'first');
map.set({ id: 1 }, 'second');
console.log(map.size); // 2 (different object references)

// Same reference = same key
const key = { id: 1 };
map.set(key, 'first');
map.set(key, 'second'); // Overwrites
console.log(map.size); // 3 total

// Special cases
map.set(NaN, 'nan value');
map.set(NaN, 'another nan'); // Overwrites (NaN === NaN in Map!)
console.log(map.get(NaN)); // 'another nan'

map.set(0, 'zero');
map.set(-0, 'negative zero'); // Overwrites (0 === -0 in Map)
console.log(map.size); // 4 total
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Memory Leak with Object Keys</strong></summary>

**Scenario:** Single Page Application (SPA) tracking user sessions causes memory leak. App crashes after 6 hours with 2GB+ memory usage. Users report "app becomes sluggish after extended use" and "browser tab freezes."

**Production Impact:**
- Memory leak rate: 3.5MB/minute
- Time to crash: 6 hours (2GB limit)
- Affected users: 35% (power users with long sessions)
- Browser crashes: 120/day
- Lost work: Users lose unsaved data
- Support tickets: 85/week
- Customer churn: 12 high-value customers/month

**The Buggy Code:**
```javascript
// ❌ MEMORY LEAK - Using Object with object keys
class UserSessionTracker {
  constructor() {
    this.sessionCache = {}; // Object used as cache
    this.userCount = 0;
  }

  trackUser(userId, userName) {
    const userObj = {
      id: userId,
      name: userName,
      timestamp: Date.now(),
      actions: []
    };

    // BUG: Using object as key → converted to '[object Object]'!
    this.sessionCache[userObj] = {
      sessionId: Math.random().toString(36),
      startTime: Date.now(),
      lastActive: Date.now(),
      pageViews: 0,
      interactions: []
    };

    this.userCount++;
    console.log(`Tracking user ${userId}. Total users: ${this.userCount}`);
  }

  updateActivity(userId, action) {
    // Can't find the right session because all keys are '[object Object]'
    // This creates more entries instead of updating
    const userObj = { id: userId };
    if (this.sessionCache[userObj]) {
      this.sessionCache[userObj].lastActive = Date.now();
      this.sessionCache[userObj].interactions.push(action);
    }
  }

  getActiveSessionCount() {
    // Returns 1 even though we think we have many sessions!
    return Object.keys(this.sessionCache).length;
  }
}

const tracker = new UserSessionTracker();

// Simulating user activity
setInterval(() => {
  const userId = Math.floor(Math.random() * 1000);
  const userName = `User${userId}`;
  tracker.trackUser(userId, userName);
}, 100); // 10 users per second

// After 1 hour:
// - trackUser called 36,000 times
// - sessionCache has 1 entry (all users share key '[object Object]')
// - BUT: 36,000 userObj objects still in memory!
// - Memory leak: 36,000 × 250 bytes = 9MB
// After 6 hours: 54MB leak (just from userObj references)
// Plus: 36,000 × 2KB (session data) = 72MB
// Total leak: ~126MB per hour → 756MB after 6 hours
// Plus application overhead → 2GB crash
```

**Debugging the Memory Leak:**
```javascript
// Step 1: Take heap snapshot in Chrome DevTools
// Memory → Take snapshot
// Filter by "Detached" or search for session objects
// Found: 36,000 userObj instances retained in memory

// Step 2: Analyze retainers
// Each userObj is retained by:
// - sessionCache (as stringified key)
// - V8 internal reference table
// - Never garbage collected!

// Step 3: Log what's actually happening
console.log('Session cache keys:', Object.keys(tracker.sessionCache));
// ['[object Object]']  ← Only ONE key for all users!

console.log('Session cache:', tracker.sessionCache);
// {
//   '[object Object]': { ... last user's data ... }
// }

// Step 4: Reproduce minimal case
const cache = {};
const users = [];

for (let i = 0; i < 10000; i++) {
  const userObj = { id: i, name: `User${i}` };
  users.push(userObj); // Keep reference
  cache[userObj] = `Data for user ${i}`;
}

console.log('Cache size:', Object.keys(cache).length); // 1 ❌
console.log('Users in memory:', users.length); // 10,000 ✅
// All userObj instances leak!
```

**Why the Leak Happens:**
1. Object converts `userObj` to string `'[object Object]'` using `.toString()`
2. All users map to same string key → single cache entry
3. Original `userObj` references are kept internally by V8
4. Garbage collector can't free them (still "reachable")
5. Each new user creates new object that never gets freed
6. Memory grows unbounded

**Real Memory Timeline:**
```javascript
// Memory profiling over 6 hours:
// 0 min: 45MB (baseline)
// 30 min: 185MB (+140MB)
// 1 hour: 320MB (+135MB)
// 2 hours: 595MB (+275MB)
// 3 hours: 870MB (+275MB)
// 4 hours: 1.15GB (+280MB)
// 5 hours: 1.43GB (+280MB)
// 6 hours: 1.71GB (+280MB)
// 6h 15m: CRASH (2GB limit exceeded)

// Breakdown per hour (~280MB):
// - userObj instances: 18,000 × 250 bytes = 4.5MB
// - Session data: 18,000 × 2KB = 36MB
// - Interaction arrays: 18,000 × 5KB = 90MB
// - String allocations: ~20MB
// - V8 overhead: ~30MB
// - Other app memory: ~100MB
```

**Solution 1: Use Map with Object Keys:**
```javascript
// ✅ FIX: Map allows object keys properly
class UserSessionTracker {
  constructor() {
    this.sessionCache = new Map(); // Use Map instead of Object
    this.userCount = 0;
  }

  trackUser(userId, userName) {
    const userObj = {
      id: userId,
      name: userName,
      timestamp: Date.now()
    };

    this.sessionCache.set(userObj, {
      sessionId: Math.random().toString(36),
      startTime: Date.now(),
      lastActive: Date.now(),
      pageViews: 0,
      interactions: []
    });

    this.userCount++;
  }

  getActiveSessionCount() {
    return this.sessionCache.size; // Correct count!
  }
}

// Problem: Still leaks because Map holds strong references
// Need to manually clean up old sessions
```

**Solution 2: Use WeakMap (Automatic GC):**
```javascript
// ✅✅ BEST: WeakMap - automatic cleanup!
class UserSessionTracker {
  constructor() {
    this.sessionCache = new WeakMap(); // Weak references
    this.sessionById = new Map(); // For lookup by ID
  }

  trackUser(userId, userName) {
    const userObj = {
      id: userId,
      name: userName,
      timestamp: Date.now()
    };

    const sessionData = {
      sessionId: Math.random().toString(36),
      startTime: Date.now(),
      lastActive: Date.now(),
      pageViews: 0,
      interactions: []
    };

    this.sessionCache.set(userObj, sessionData);
    this.sessionById.set(userId, userObj);

    // When userObj has no other references → GC removes from WeakMap
  }

  updateActivity(userId, action) {
    const userObj = this.sessionById.get(userId);
    if (userObj) {
      const session = this.sessionCache.get(userObj);
      if (session) {
        session.lastActive = Date.now();
        session.interactions.push(action);
      }
    }
  }

  endSession(userId) {
    const userObj = this.sessionById.get(userId);
    this.sessionById.delete(userId);
    // userObj is now unreferenced → WeakMap automatically cleans up
  }
}

// Memory now stabilizes at active users only!
```

**Solution 3: Use String Keys with Cleanup:**
```javascript
// ✅ MOST EFFICIENT: String keys with TTL cleanup
class UserSessionTracker {
  constructor() {
    this.sessionCache = {}; // Object with string keys
    this.sessionTTL = 3600000; // 1 hour

    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  trackUser(userId, userName) {
    const key = `user:${userId}`; // String key

    this.sessionCache[key] = {
      id: userId,
      name: userName,
      sessionId: Math.random().toString(36),
      startTime: Date.now(),
      lastActive: Date.now(),
      pageViews: 0,
      interactions: []
    };
  }

  updateActivity(userId, action) {
    const key = `user:${userId}`;
    if (this.sessionCache[key]) {
      this.sessionCache[key].lastActive = Date.now();
      this.sessionCache[key].interactions.push(action);
    }
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const key in this.sessionCache) {
      const session = this.sessionCache[key];
      if (now - session.lastActive > this.sessionTTL) {
        delete this.sessionCache[key];
        cleaned++;
      }
    }

    console.log(`Cleaned up ${cleaned} expired sessions`);
  }

  getActiveSessionCount() {
    return Object.keys(this.sessionCache).length;
  }
}

// Memory stays under control with automatic cleanup
```

**Solution 4: LRU Cache with Size Limit:**
```javascript
// ✅ PRODUCTION-READY: LRU cache with max size
class LRUSessionCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Maintains insertion order
  }

  set(userId, sessionData) {
    const key = `user:${userId}`;

    // If exists, delete and re-add to move to end (most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, {
      ...sessionData,
      lastActive: Date.now()
    });

    // Evict oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`Evicted oldest session: ${firstKey}`);
    }
  }

  get(userId) {
    const key = `user:${userId}`;
    const session = this.cache.get(key);

    if (session) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, {
        ...session,
        lastActive: Date.now()
      });
    }

    return session;
  }

  delete(userId) {
    const key = `user:${userId}`;
    return this.cache.delete(key);
  }

  get size() {
    return this.cache.size;
  }
}

class UserSessionTracker {
  constructor() {
    this.sessions = new LRUSessionCache(1000); // Max 1000 sessions
  }

  trackUser(userId, userName) {
    this.sessions.set(userId, {
      id: userId,
      name: userName,
      sessionId: Math.random().toString(36),
      startTime: Date.now(),
      pageViews: 0,
      interactions: []
    });
  }

  updateActivity(userId, action) {
    const session = this.sessions.get(userId);
    if (session) {
      session.interactions.push(action);
      this.sessions.set(userId, session); // Update & move to end
    }
  }

  getActiveSessionCount() {
    return this.sessions.size;
  }
}

// Memory capped at ~1000 sessions × 5KB = ~5MB (stable)
```

**Real Production Metrics After Fix:**

```javascript
// Before (Object with object keys):
// - Memory: 45MB → 2GB crash in 6 hours
// - Leak rate: 3.5MB/minute
// - Browser crashes: 120/day
// - Support tickets: 85/week
// - Customer churn: 12/month
// - Lost revenue: ~$18k/month

// After (Solution 3: String keys + TTL cleanup):
// - Memory: Stable 25-35MB (no crash in 30-day test)
// - Leak rate: 0MB/minute ✅
// - Browser crashes: 0/day ✅
// - Support tickets: 8/week (90% reduction)
// - Customer churn: 1/month
// - Revenue recovered: $17k/month
// - User satisfaction: +88%

// After (Solution 4: LRU cache):
// - Memory: Capped at 12MB (predictable) ✅
// - Leak rate: 0MB/minute ✅
// - Performance: 95% faster lookups (Map vs Object)
// - Cache hit rate: 98%
// - Zero crashes in production
```

**Key Lessons:**
1. **Never use objects as Object keys** → always converts to `"[object Object]"`
2. **Use Map for object keys** → preserves object identity
3. **Use WeakMap for temporary references** → automatic garbage collection
4. **Use string keys when possible** → most efficient
5. **Implement cache eviction** → TTL, LRU, or size limits
6. **Monitor memory in production** → catch leaks early
7. **Profile with DevTools** → heap snapshots reveal retainers

**Common Pitfalls:**
```javascript
// ❌ PITFALL 1: Object key coercion
const cache = {};
cache[{ id: 1 }] = 'data1';
cache[{ id: 2 }] = 'data2';
console.log(Object.keys(cache)); // ["[object Object]"] ← Only 1 key!

// ✅ FIX: Use Map or string keys
const mapCache = new Map();
mapCache.set({ id: 1 }, 'data1');
mapCache.set({ id: 2 }, 'data2');
console.log(mapCache.size); // 2 ✅

// ❌ PITFALL 2: No cleanup strategy
const sessions = new Map();
users.forEach(u => sessions.set(u, createSession()));
// Grows forever!

// ✅ FIX: Add eviction
const MAX_SIZE = 1000;
if (sessions.size >= MAX_SIZE) {
  const oldest = sessions.keys().next().value;
  sessions.delete(oldest);
}

// ❌ PITFALL 3: WeakMap without proper references
const weak = new WeakMap();
weak.set({ id: 1 }, 'data');
console.log(weak.get({ id: 1 })); // undefined ← Different object reference!

// ✅ FIX: Keep reference to key
const keyRef = { id: 1 };
weak.set(keyRef, 'data');
console.log(weak.get(keyRef)); // 'data' ✅
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Map vs Object Decision Matrix</strong></summary>

## When to Use Map

**✅ Use Map for:**

1. **Dynamic/Unknown Keys:**
   ```javascript
   // User IDs from database
   const userCache = new Map();
   users.forEach(u => userCache.set(u.id, u));
   ```

2. **Non-String Keys:**
   ```javascript
   // DOM elements as keys
   const listenerMap = new Map();
   listenerMap.set(button, handleClick);
   listenerMap.set(input, validateInput);

   // Functions as keys
   const memoCache = new Map();
   memoCache.set(expensiveFunction, results);

   // Numbers as keys (not converted to strings)
   const indexMap = new Map();
   indexMap.set(0, 'first');
   indexMap.set(1, 'second');
   ```

3. **Frequent Add/Delete:**
   ```javascript
   // LRU cache implementation
   const cache = new Map();

   function get(key) {
     const value = cache.get(key);
     if (value) {
       // Move to end (most recent)
       cache.delete(key);
       cache.set(key, value);
     }
     return value;
   }

   function set(key, value) {
     cache.set(key, value);
     if (cache.size > 100) {
       const firstKey = cache.keys().next().value;
       cache.delete(firstKey); // Fast delete
     }
   }
   ```

4. **Need .size Property:**
   ```javascript
   const cache = new Map();

   if (cache.size > 100) {
     cache.delete(cache.keys().next().value);
   }

   // vs Object (expensive)
   const objCache = {};
   if (Object.keys(objCache).length > 100) { // O(n) operation!
     // ...
   }
   ```

5. **Ordered Iteration:**
   ```javascript
   const orderedEvents = new Map();
   orderedEvents.set('click', handler1);
   orderedEvents.set('hover', handler2);
   orderedEvents.set('focus', handler3);

   // Guaranteed insertion order
   orderedEvents.forEach((handler, event) => {
     // Executes in order: click, hover, focus
   });
   ```

6. **Security (No Prototype Pollution):**
   ```javascript
   // ✅ Map is safe
   const safeMap = new Map();
   safeMap.set('__proto__', 'malicious');
   safeMap.set('constructor', 'payload');
   // No security issues!

   // ❌ Object can be dangerous
   const obj = {};
   obj['__proto__'] = 'malicious'; // Can pollute prototype!
   obj['constructor'] = 'payload';
   ```

## When to Use Object

**✅ Use Object for:**

1. **Fixed Schema:**
   ```javascript
   const user = {
     id: 1,
     name: 'Alice',
     email: 'alice@example.com',
     role: 'admin'
   };

   // Static, known properties
   ```

2. **JSON Serialization:**
   ```javascript
   const config = { theme: 'dark', lang: 'en', notifications: true };

   // Direct serialization
   localStorage.setItem('config', JSON.stringify(config)); ✅

   // Map requires conversion
   const mapConfig = new Map([['theme', 'dark']]);
   localStorage.setItem('config', JSON.stringify(Object.fromEntries(mapConfig))); ⚠️
   ```

3. **String Keys (known at compile time):**
   ```javascript
   const routes = {
     '/home': HomeComponent,
     '/about': AboutComponent,
     '/contact': ContactComponent
   };

   const component = routes[window.location.pathname];
   ```

4. **Property Access Syntax:**
   ```javascript
   // Object: Clean dot notation
   console.log(user.name); ✅
   console.log(user.email); ✅

   // Map: Must use .get()
   console.log(userMap.get('name')); ⚠️
   console.log(userMap.get('email')); ⚠️
   ```

5. **Small Data (<20 properties):**
   ```javascript
   // Object is faster for small datasets
   const settings = {
     volume: 50,
     brightness: 80,
     contrast: 60
   };

   // Accessing settings.volume is 2-3x faster than map.get('volume')
   ```

## Performance Comparison

**Small Dataset (<20 entries):**
```javascript
// Benchmark: 1 million accesses
const smallObj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
const smallMap = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]]);

console.time('Object access');
for (let i = 0; i < 1000000; i++) {
  const val = smallObj.a;
}
console.timeEnd('Object access'); // ~8ms

console.time('Map access');
for (let i = 0; i < 1000000; i++) {
  const val = smallMap.get('a');
}
console.timeEnd('Map access'); // ~85ms

// Winner: Object (10x faster for small datasets)
```

**Medium Dataset (20-1000 entries):**
```javascript
// Benchmark: Create + iterate + delete
const size = 500;

console.time('Object operations');
const obj = {};
for (let i = 0; i < size; i++) {
  obj[`key${i}`] = i;
}
for (const key in obj) {
  const val = obj[key];
}
for (let i = 0; i < size; i++) {
  delete obj[`key${i}`]; // Slow! Triggers dictionary mode
}
console.timeEnd('Object operations'); // ~28ms

console.time('Map operations');
const map = new Map();
for (let i = 0; i < size; i++) {
  map.set(`key${i}`, i);
}
for (const [key, val] of map) {
  // Iterate
}
for (let i = 0; i < size; i++) {
  map.delete(`key${i}`); // Fast!
}
console.timeEnd('Map operations'); // ~18ms

// Winner: Map (35% faster for medium datasets with deletions)
```

**Large Dataset (>1000 entries):**
```javascript
// Benchmark: 10,000 entries
const size = 10000;

console.time('Object large');
const largeObj = {};
for (let i = 0; i < size; i++) {
  largeObj[`key${i}`] = i;
}
for (let i = 0; i < size; i++) {
  const val = largeObj[`key${i}`];
}
console.timeEnd('Object large'); // ~125ms

console.time('Map large');
const largeMap = new Map();
for (let i = 0; i < size; i++) {
  largeMap.set(`key${i}`, i);
}
for (let i = 0; i < size; i++) {
  const val = largeMap.get(`key${i}`);
}
console.timeEnd('Map large'); // ~78ms

// Winner: Map (60% faster for large datasets)
```

## Memory Comparison

**1,000 string keys with primitive values:**
```javascript
const obj = {};
const map = new Map();

for (let i = 0; i < 1000; i++) {
  obj[`key${i}`] = i;
  map.set(`key${i}`, i);
}

// Object: ~40KB
// Map: ~62KB (55% more memory overhead)
```

**1,000 object keys:**
```javascript
const map = new Map();
for (let i = 0; i < 1000; i++) {
  const key = { id: i };
  map.set(key, i);
}

// Map with object keys: ~86KB
// Object: Not recommended (key coercion issues)
```

## Real-World Guidelines

| Scenario | Choice | Reason |
|----------|--------|--------|
| User preferences | Object | JSON serialization, fixed schema |
| Event listeners (DOM → handler) | Map | Object keys, frequent add/delete |
| LRU cache | Map | Ordered, frequent delete, .size |
| API response data | Object | Fixed schema, JSON |
| Session storage (temp) | WeakMap | Auto GC when ref lost |
| Route config | Object | String keys, compile-time known |
| Memoization cache | Map | Dynamic keys, size tracking |
| Form state | Object | JSON, fixed fields |
| WebSocket messages | Map | High frequency add/delete |
| Shopping cart | Map | Dynamic items, .size useful |

## Mixed Approach

```javascript
// Use both where appropriate
class DataStore {
  constructor() {
    // Object for fixed config
    this.config = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3
    };

    // Map for dynamic user data
    this.users = new Map();

    // WeakMap for DOM element metadata
    this.elementData = new WeakMap();
  }

  addUser(id, data) {
    this.users.set(id, data); // Fast add/delete
  }

  getConfig(key) {
    return this.config[key]; // Fast property access
  }

  attachMetadata(element, data) {
    this.elementData.set(element, data); // Auto cleanup
  }
}
```

**Summary Table:**

| Aspect | Object (fast mode) | Object (dict mode) | Map |
|--------|-------------------|-------------------|-----|
| **Set** | ⚡ 1-2ns | ⚠️ 10-15ns | ✅ 8-12ns |
| **Get** | ⚡ 1-2ns | ⚠️ 10-15ns | ✅ 8-12ns |
| **Delete** | ❌ Slow (breaks fast mode) | ⚠️ 10-15ns | ⚡ 8-12ns |
| **Iterate** | ✅ 5ns/prop | ❌ 50ns/prop | ✅ 8ns/entry |
| **Size** | ❌ O(n) | ❌ O(n) | ⚡ O(1) |
| **Memory** | ⚡ Low | ⚠️ Medium | ⚠️ Medium-High |
| **Key types** | ⚠️ String/Symbol only | ⚠️ String/Symbol only | ⚡ Any type |
| **Order** | ✅ Guaranteed (ES2015+) | ✅ Guaranteed | ⚡ Always guaranteed |
| **JSON** | ⚡ Direct | ⚡ Direct | ❌ Needs conversion |
| **Security** | ⚠️ Prototype pollution | ⚠️ Prototype pollution | ⚡ Safe |

</details>

<details>
<summary><strong>💬 Explain to Junior: Map vs Object Simplified</strong></summary>

**Map vs Object** - Think of it like two types of storage:

**Object = Bookshelf with labels**
- Labels (keys) must be strings (or Symbols)
- Fast if you know the label: `book.title`
- Converting to JSON easy (for saving/sharing)
- Great for fixed data (user profile, settings)

```javascript
const book = {
  title: "JavaScript Basics",
  author: "Alice",
  year: 2024
};

console.log(book.title);  // "JavaScript Basics" ✅
JSON.stringify(book);     // Works! ✅
```

**Map = Digital database**
- Any type can be a key (numbers, objects, anything!)
- Built-in tools: `.size`, ordered iteration
- Better for lots of changing data
- Can't directly save to JSON

```javascript
const ratings = new Map();

// Can use objects as keys!
const book1 = { title: "Book 1" };
const book2 = { title: "Book 2" };

ratings.set(book1, 5);
ratings.set(book2, 4);

console.log(ratings.get(book1));  // 5 ✅
console.log(ratings.size);        // 2 ✅
```

**When to use each:**

**Use Object when:**
- ✅ You know all the keys (like `user.name`, `user.email`)
- ✅ You need to save as JSON
- ✅ Keys are always strings
- ✅ Small amount of data (<20 properties)
- ✅ Want simple dot notation: `obj.key`

**Use Map when:**
- ✅ Keys are objects, numbers, or mixed types
- ✅ Adding/removing lots of items frequently
- ✅ Need to count items easily (`.size`)
- ✅ Order matters (Map remembers insertion order)
- ✅ Large dataset (>100 entries)
- ✅ Need to delete items often

**Example - Wrong Tool:**
```javascript
// ❌ Using object with object keys
const cache = {};
const user1 = { id: 1 };
const user2 = { id: 2 };

cache[user1] = "data1";
cache[user2] = "data2";  // Overwrites data1!

console.log(cache);
// { '[object Object]': 'data2' }
// Both users became same key!
```

**Example - Right Tool:**
```javascript
// ✅ Using Map with object keys
const cache = new Map();
const user1 = { id: 1 };
const user2 = { id: 2 };

cache.set(user1, "data1");
cache.set(user2, "data2");

console.log(cache.size);       // 2 (separate entries!) ✅
console.log(cache.get(user1)); // "data1" ✅
console.log(cache.get(user2)); // "data2" ✅
```

**Real-World Examples:**

1. **User Settings (Use Object):**
```javascript
const userSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  volume: 75
};

// Easy to save
localStorage.setItem('settings', JSON.stringify(userSettings));

// Easy to access
if (userSettings.notifications) {
  showNotification();
}
```

2. **Shopping Cart (Use Map):**
```javascript
const cart = new Map();

const product1 = { id: 1, name: 'Laptop' };
const product2 = { id: 2, name: 'Mouse' };

cart.set(product1, { quantity: 1, price: 999 });
cart.set(product2, { quantity: 2, price: 25 });

console.log(`Cart has ${cart.size} items`); // Easy count!

// Easy to add/remove items
cart.delete(product2);
```

3. **DOM Event Handlers (Use Map):**
```javascript
const listeners = new Map();

const button1 = document.querySelector('#btn1');
const button2 = document.querySelector('#btn2');

// DOM elements as keys!
listeners.set(button1, () => console.log('Button 1 clicked'));
listeners.set(button2, () => console.log('Button 2 clicked'));

// Later: Get handler for specific button
const handler = listeners.get(button1);
```

**Performance Tip:**
```javascript
// Object: Fast for small data
const small = { a: 1, b: 2, c: 3 };
console.log(small.a); // Super fast! ~1ns

// Map: Better for large data with changes
const large = new Map();
for (let i = 0; i < 10000; i++) {
  large.set(i, i * 2);
}
large.delete(5000); // Fast delete!
large.size; // Instant count!
```

**Common Mistake:**
```javascript
// ❌ WRONG: Using bracket notation with Map
const map = new Map();
map['key'] = 'value'; // This sets a property, NOT a Map entry!

console.log(map.get('key')); // undefined ❌
console.log(map['key']);      // 'value' (not in Map!)

// ✅ RIGHT: Use .set() and .get()
map.set('key', 'value');
console.log(map.get('key')); // 'value' ✅
```

**Rule of Thumb:**
- Simple data with string keys → **Object** (like user profiles, settings)
- Complex keys or lots of changes → **Map** (like caches, event handlers)
- Need JSON → **Object**
- Need object keys → **Map**

**Interview Answer Template:**

"Map and Object both store key-value pairs, but they differ in several ways.

**Main differences:**
- Map can use any type as a key (objects, numbers, etc.), while Object keys are always strings or Symbols
- Map has a `.size` property for instant count, Object requires `Object.keys().length`
- Map maintains insertion order, Object does too (since ES2015)
- Map has better performance for frequent additions and deletions

**When to use:**
- Use Object for simple data with string keys, especially when you need JSON serialization
- Use Map for dynamic data, non-string keys, or when you need frequent add/delete operations

For example, storing user settings would use an Object because it's fixed data that needs to be saved as JSON. But an event listener registry would use Map because DOM elements are the keys."

</details>

### Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [Map vs Object in JavaScript](https://www.javascripttutorial.net/es6/javascript-map-vs-object/)

---
