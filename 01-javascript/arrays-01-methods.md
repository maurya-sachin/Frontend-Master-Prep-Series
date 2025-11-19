# Array Methods & Iteration

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What are find(), some(), and every() array methods?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain these array methods and their differences.

### Answer

These methods search arrays but return different things.

1. **find()**
   - Returns **first element** that matches
   - Returns `undefined` if not found

2. **some()**
   - Returns **boolean** - true if ANY element matches
   - Short-circuits on first match

3. **every()**
   - Returns **boolean** - true if ALL elements match
   - Short-circuits on first non-match

### Code Example

```javascript
const numbers = [1, 2, 3, 4, 5];

// 1. find() - returns first match
const firstEven = numbers.find(n => n % 2 === 0);
console.log(firstEven); // 2

const notFound = numbers.find(n => n > 10);
console.log(notFound); // undefined

// 2. some() - returns boolean (ANY)
const hasEven = numbers.some(n => n % 2 === 0);
console.log(hasEven); // true

const hasNegative = numbers.some(n => n < 0);
console.log(hasNegative); // false

// 3. every() - returns boolean (ALL)
const allPositive = numbers.every(n => n > 0);
console.log(allPositive); // true

const allEven = numbers.every(n => n % 2 === 0);
console.log(allEven); // false

// 4. PRACTICAL EXAMPLES
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: true },
  { name: "Charlie", age: 30, active: false }
];

// Find first adult
const firstAdult = users.find(u => u.age >= 18);
console.log(firstAdult.name); // "Alice"

// Check if any user is inactive
const hasInactive = users.some(u => !u.active);
console.log(hasInactive); // true

// Check if all users are adults
const allAdults = users.every(u => u.age >= 18);
console.log(allAdults); // false
```

<details>
<summary><strong>🔍 Deep Dive: V8 Implementation of Array Search Methods</strong></summary>

**How V8 Executes find(), some(), every():**

```javascript
// Simplified V8 internal implementation concept

// find() - Returns first matching element
Array.prototype.find = function(callback, thisArg) {
  const O = Object(this);  // ToObject conversion
  const len = O.length >>> 0;  // Convert to uint32

  for (let k = 0; k < len; k++) {
    if (k in O) {  // Check if index exists (sparse arrays)
      const kValue = O[k];
      if (callback.call(thisArg, kValue, k, O)) {
        return kValue;  // ✅ Return FIRST match
      }
    }
  }
  return undefined;  // Not found
};

// some() - Returns boolean (ANY match)
Array.prototype.some = function(callback, thisArg) {
  const O = Object(this);
  const len = O.length >>> 0;

  for (let k = 0; k < len; k++) {
    if (k in O) {
      if (callback.call(thisArg, O[k], k, O)) {
        return true;  // ✅ SHORT-CIRCUIT on first true
      }
    }
  }
  return false;  // No matches
};

// every() - Returns boolean (ALL match)
Array.prototype.every = function(callback, thisArg) {
  const O = Object(this);
  const len = O.length >>> 0;

  for (let k = 0; k < len; k++) {
    if (k in O) {
      if (!callback.call(thisArg, O[k], k, O)) {
        return false;  // ✅ SHORT-CIRCUIT on first false
      }
    }
  }
  return true;  // All match
};
```

**Key Implementation Details:**

1. **Sparse Array Handling**: `if (k in O)` checks if index exists
   ```javascript
   const sparse = [1, , 3, , 5];  // Has "holes"

   sparse.find((x, i) => {
     console.log(i, x);
     return false;
   });
   // Logs: 0 1, 2 3, 4 5 (skips indices 1 and 3)
   ```

2. **Short-Circuit Optimization**:
   - `some()`: Stops on FIRST `true` → O(1) best case
   - `every()`: Stops on FIRST `false` → O(1) best case
   - `find()`: Stops on FIRST match → O(1) best case

3. **Time Complexity**:
   - Best case: O(1) - match/mismatch at start
   - Average case: O(n/2) - match/mismatch in middle
   - Worst case: O(n) - match/mismatch at end or not found

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Debugging Slow Search Performance</strong></summary>

**Scenario**: You're debugging a dashboard that searches through 50,000 user records. The search is taking 2+ seconds and users are complaining.

```javascript
// ❌ SLOW: Using filter() when you only need first match
const users = Array(50000).fill().map((_, i) => ({
  id: i,
  email: `user${i}@example.com`,
  name: `User ${i}`,
  status: i % 5 === 0 ? 'inactive' : 'active'
}));

// BAD: filter() checks ALL 50,000 records
console.time('filter');
const user = users.filter(u => u.email === 'user1000@example.com')[0];
console.timeEnd('filter');  // ~15-20ms (checks all 50,000!)

// ✅ GOOD: find() stops at first match
console.time('find');
const userFast = users.find(u => u.email === 'user1000@example.com');
console.timeEnd('find');  // ~0.1ms (stops at index 1000!)

// Performance improvement: 150-200x faster!
```

**Debugging Steps:**

1. **Profile the code**:
   ```javascript
   console.time('search');
   const result = users.filter(u => u.id === targetId)[0];
   console.timeEnd('search');  // "search: 18.234ms"
   ```

2. **Identify the problem**: Using `filter()` when only one result needed

3. **Fix with find()**:
   ```javascript
   const result = users.find(u => u.id === targetId);  // Much faster!
   ```

4. **For existence checks, use some()**:
   ```javascript
   // ❌ BAD: filter() creates array
   if (users.filter(u => u.status === 'inactive').length > 0) { }

   // ✅ GOOD: some() returns boolean immediately
   if (users.some(u => u.status === 'inactive')) { }
   ```

**Real Production Fix**:
```javascript
// Before: 2000ms for validation
function validatePermissions(userId, requiredPermissions) {
  const user = users.filter(u => u.id === userId)[0];
  return requiredPermissions.filter(p =>
    user.permissions.includes(p)
  ).length === requiredPermissions.length;
}

// After: 5ms for validation
function validatePermissionsFast(userId, requiredPermissions) {
  const user = users.find(u => u.id === userId);
  return requiredPermissions.every(p => user.permissions.includes(p));
}

// 400x performance improvement!
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: find() vs filter() vs indexOf()</strong></summary>

| Method | Returns | Stops Early? | Use When | Performance |
|--------|---------|--------------|----------|-------------|
| `find()` | Element or undefined | ✅ Yes | Need first matching element | O(n) worst, O(1) best |
| `filter()` | Array of matches | ❌ No | Need ALL matches | Always O(n) |
| `some()` | Boolean | ✅ Yes | Check if ANY exists | O(n) worst, O(1) best |
| `every()` | Boolean | ✅ Yes | Check if ALL match | O(n) worst, O(1) best |
| `indexOf()` | Index or -1 | ✅ Yes | Find primitive values | O(n) worst, O(1) best |
| `includes()` | Boolean | ✅ Yes | Check primitive exists | O(n) worst, O(1) best |

**Performance Comparison** (10,000 items, target at index 100):

```javascript
const arr = Array(10000).fill().map((_, i) => ({ id: i }));

// 1. find() - FAST (stops at 100)
console.time('find');
arr.find(x => x.id === 100);
console.timeEnd('find');  // ~0.02ms

// 2. filter() - SLOW (checks all 10,000)
console.time('filter');
arr.filter(x => x.id === 100)[0];
console.timeEnd('filter');  // ~1.2ms

// 3. some() - FAST (boolean check, stops at 100)
console.time('some');
arr.some(x => x.id === 100);
console.timeEnd('some');  // ~0.02ms

// find() is 60x faster than filter() for single-match scenarios!
```

**When to Use Each:**

```javascript
// ✅ Use find() - When you need the FIRST matching element
const admin = users.find(u => u.role === 'admin');

// ✅ Use filter() - When you need ALL matching elements
const allAdmins = users.filter(u => u.role === 'admin');

// ✅ Use some() - When you only need to know IF it exists
const hasAdmin = users.some(u => u.role === 'admin');

// ✅ Use every() - When you need to validate ALL elements
const allActive = users.every(u => u.status === 'active');

// ✅ Use indexOf() / includes() - For primitive values
const hasApple = fruits.includes('apple');  // Faster than find!
const appleIndex = fruits.indexOf('apple');
```

**Memory Trade-offs:**

```javascript
// filter() creates NEW array (memory overhead)
const result = arr.filter(x => x.id > 100);  // May allocate large array

// find() returns single element (minimal memory)
const result = arr.find(x => x.id > 100);  // Returns single object

// For large datasets, find() is more memory efficient!
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Array Search Methods</strong></summary>

**Simple Explanation:**

Imagine you're looking through a stack of 100 resumes to hire developers:

**find()** = "Find me the FIRST person who knows React"
- You stop reading as soon as you find ONE person who knows React
- You get that person's resume back
- If nobody knows React, you get `undefined`

```javascript
const firstReactDev = resumes.find(resume =>
  resume.skills.includes('React')
);
// Returns: { name: "Alice", skills: ["React", "Node"] }
```

**some()** = "Does ANYONE know React?"
- You stop reading as soon as you find ONE person
- You just answer YES or NO
- Much faster when you only need to know if it exists

```javascript
const hasReactDev = resumes.some(resume =>
  resume.skills.includes('React')
);
// Returns: true (found at least one)
```

**every()** = "Does EVERYONE know JavaScript?"
- You stop reading as soon as you find ONE person who doesn't
- You answer YES only if ALL match
- Used for validation

```javascript
const allKnowJS = resumes.every(resume =>
  resume.skills.includes('JavaScript')
);
// Returns: false (Bob doesn't know JS, stopped checking)
```

**Analogy for a PM:**

"Think of it like searching for a restaurant:
- **find()**: 'Show me the first Italian restaurant' → Returns the restaurant
- **some()**: 'Are there any Italian restaurants?' → Returns yes/no
- **every()**: 'Are all restaurants Italian?' → Returns yes/no

The key benefit? If you find what you're looking for early, you stop searching. With filter(), you'd check every restaurant even if the first one was Italian!"

**Visual Example:**

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// find() - Looking for first number > 5
// Checks: 1? no, 2? no, 3? no, 4? no, 5? no, 6? YES! → Returns 6
numbers.find(n => n > 5);  // 6

// some() - Is ANY number > 5?
// Checks: 1? no, 2? no, 3? no, 4? no, 5? no, 6? YES! → Returns true
numbers.some(n => n > 5);  // true

// every() - Are ALL numbers > 5?
// Checks: 1? no → Returns false immediately!
numbers.every(n => n > 5);  // false
```

**Common Mistake to Avoid:**

```javascript
// ❌ DON'T do this (wasteful):
if (users.filter(u => u.role === 'admin').length > 0) {
  // Checks ALL users, creates array, then checks length
}

// ✅ DO this instead (efficient):
if (users.some(u => u.role === 'admin')) {
  // Stops at first admin, returns boolean immediately
}
```

</details>

### Resources

- [MDN: Array.prototype.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

---

## Question 2: Essential Array Methods - map, filter, reduce

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Uber, Netflix

### Question
Explain map(), filter(), and reduce(). Provide examples and explain when to use each.

### Answer

These are **higher-order functions** that take a callback and return new values without mutating the original array.

### Code Example

**map() - Transform Each Element:**

```javascript
// Syntax: array.map(callback(element, index, array))
// Returns: New array with transformed elements

const numbers = [1, 2, 3, 4, 5];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// Extract property from objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 }
];

const names = users.map(user => user.name);
console.log(names);  // ["Alice", "Bob", "Charlie"]

// With index
const indexed = numbers.map((num, index) => ({
  value: num,
  index: index
}));
console.log(indexed);
// [{ value: 1, index: 0 }, { value: 2, index: 1 }, ...]

/*
USE CASES:
- Transform data structure
- Extract specific properties
- Convert data types
- Return same length array with modifications
*/
```

**filter() - Select Elements:**

```javascript
// Syntax: array.filter(callback(element, index, array))
// Returns: New array with elements that pass the test

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Get even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens);  // [2, 4, 6, 8, 10]

// Filter objects
const users = [
  { name: "Alice", age: 17, active: true },
  { name: "Bob", age: 25, active: false },
  { name: "Charlie", age: 30, active: true }
];

const adults = users.filter(user => user.age >= 18);
const activeUsers = users.filter(user => user.active);
const activeAdults = users.filter(user => user.age >= 18 && user.active);

console.log(activeAdults);
// [{ name: "Charlie", age: 30, active: true }]

/*
USE CASES:
- Remove unwanted elements
- Search/find matching items
- Validation filtering
- Return subset of original array
*/
```

**reduce() - Reduce to Single Value:**

```javascript
// Syntax: array.reduce(callback(accumulator, current, index, array), initialValue)
// Returns: Single accumulated value

const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 15

// Find maximum
const max = numbers.reduce((acc, num) => Math.max(acc, num), -Infinity);
console.log(max);  // 5

// Count occurrences
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count);  // { apple: 3, banana: 2, orange: 1 }

// Group by property
const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Charlie", role: "admin" }
];

const grouped = users.reduce((acc, user) => {
  const role = user.role;
  if (!acc[role]) acc[role] = [];
  acc[role].push(user);
  return acc;
}, {});

console.log(grouped);
/*
{
  admin: [{ name: "Alice", role: "admin" }, { name: "Charlie", role: "admin" }],
  user: [{ name: "Bob", role: "user" }]
}
*/

// Flatten array
const nested = [[1, 2], [3, 4], [5, 6]];
const flattened = nested.reduce((acc, arr) => acc.concat(arr), []);
console.log(flattened);  // [1, 2, 3, 4, 5, 6]

// Build object from array
const keyValue = [["name", "John"], ["age", 30], ["city", "NYC"]];
const obj = keyValue.reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {});
console.log(obj);  // { name: "John", age: 30, city: "NYC" }

/*
USE CASES:
- Sum, average, min, max calculations
- Counting and grouping
- Flattening nested structures
- Converting arrays to objects
- Implementing other array methods
- Complex transformations
*/
```

**Chaining Methods:**

```javascript
const users = [
  { name: "Alice", age: 25, score: 85 },
  { name: "Bob", age: 17, score: 92 },
  { name: "Charlie", age: 30, score: 78 },
  { name: "David", age: 22, score: 95 }
];

// Get average score of adult users
const avgAdultScore = users
  .filter(user => user.age >= 18)        // Filter adults
  .map(user => user.score)                // Extract scores
  .reduce((sum, score, idx, arr) => {     // Calculate average
    return idx === arr.length - 1
      ? (sum + score) / arr.length
      : sum + score;
  }, 0);

console.log(avgAdultScore);  // 86

// Or cleaner:
const avgScore = users
  .filter(u => u.age >= 18)
  .reduce((sum, u, i, arr) => {
    sum += u.score;
    return i === arr.length - 1 ? sum / arr.length : sum;
  }, 0);
```

**Implementing map/filter with reduce:**

```javascript
// map implementation using reduce
Array.prototype.myMap = function(callback) {
  return this.reduce((acc, item, index, array) => {
    acc.push(callback(item, index, array));
    return acc;
  }, []);
};

// filter implementation using reduce
Array.prototype.myFilter = function(callback) {
  return this.reduce((acc, item, index, array) => {
    if (callback(item, index, array)) {
      acc.push(item);
    }
    return acc;
  }, []);
};

// Test
const nums = [1, 2, 3, 4, 5];
console.log(nums.myMap(x => x * 2));      // [2, 4, 6, 8, 10]
console.log(nums.myFilter(x => x % 2 === 0));  // [2, 4]
```

### Common Mistakes

❌ **Wrong**: Forgetting to return in map
```javascript
const doubled = [1, 2, 3].map(num => {
  num * 2;  // ❌ No return!
});
console.log(doubled);  // [undefined, undefined, undefined]
```

✅ **Correct**: Always return in map
```javascript
const doubled = [1, 2, 3].map(num => num * 2);
// Or with explicit return:
const doubled2 = [1, 2, 3].map(num => {
  return num * 2;
});
```

❌ **Wrong**: Forgetting initial value in reduce
```javascript
const nums = [];
const sum = nums.reduce((acc, num) => acc + num);  // ❌ Error!
// TypeError: Reduce of empty array with no initial value
```

✅ **Correct**: Always provide initial value
```javascript
const sum = nums.reduce((acc, num) => acc + num, 0);  // 0
```

❌ **Wrong**: Mutating in map/filter
```javascript
const users = [{ name: "Alice" }, { name: "Bob" }];

const modified = users.map(user => {
  user.role = "admin";  // ❌ Mutates original!
  return user;
});

console.log(users[0].role);  // "admin" (original mutated!)
```

✅ **Correct**: Return new objects
```javascript
const modified = users.map(user => ({
  ...user,
  role: "admin"
}));

console.log(users[0].role);  // undefined (original unchanged)
```

<details>
<summary><strong>🔍 Deep Dive: V8 Implementation & Optimization</strong></summary>

**How V8 Executes map(), filter(), reduce():**

```javascript
// Simplified V8 internals

// map() - Transform each element
Array.prototype.map = function(callback, thisArg) {
  const O = Object(this);
  const len = O.length >>> 0;  // Convert to uint32
  const A = new Array(len);     // Pre-allocate result array

  for (let k = 0; k < len; k++) {
    if (k in O) {  // Sparse array check
      const kValue = O[k];
      A[k] = callback.call(thisArg, kValue, k, O);
    }
  }
  return A;
};

// filter() - Select elements
Array.prototype.filter = function(callback, thisArg) {
  const O = Object(this);
  const len = O.length >>> 0;
  const A = [];  // Dynamic array (size unknown)

  for (let k = 0; k < len; k++) {
    if (k in O) {
      const kValue = O[k];
      if (callback.call(thisArg, kValue, k, O)) {
        A.push(kValue);  // Add to result
      }
    }
  }
  return A;
};

// reduce() - Accumulate to single value
Array.prototype.reduce = function(callback, initialValue) {
  const O = Object(this);
  const len = O.length >>> 0;

  if (len === 0 && arguments.length < 2) {
    throw new TypeError('Reduce of empty array with no initial value');
  }

  let k = 0;
  let accumulator;

  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    // Find first existing element as initial
    while (k < len && !(k in O)) k++;
    accumulator = O[k++];
  }

  for (; k < len; k++) {
    if (k in O) {
      accumulator = callback(accumulator, O[k], k, O);
    }
  }

  return accumulator;
};
```

**V8 Optimization Strategies:**

1. **Inline Caching**:
   ```javascript
   // V8 optimizes repeated operations
   const arr = [1, 2, 3, 4, 5];

   // First call: Creates IC (Inline Cache)
   arr.map(x => x * 2);

   // Subsequent calls: Uses cached optimized code path
   arr.map(x => x * 2);  // Much faster!
   ```

2. **Hidden Classes & Fast Properties**:
   ```javascript
   // ✅ GOOD: Consistent object shape (V8 optimizes)
   const users = [
     { name: "Alice", age: 25 },
     { name: "Bob", age: 30 }
   ];
   users.map(u => u.age);  // Fast property access

   // ❌ BAD: Inconsistent shapes (de-optimizes)
   const mixed = [
     { name: "Alice", age: 25 },
     { name: "Bob" }  // Missing age property
   ];
   mixed.map(u => u.age);  // Slower (polymorphic)
   ```

3. **Array Packing**:
   ```javascript
   // Packed array (fast):
   const packed = [1, 2, 3, 4, 5];
   packed.map(x => x * 2);  // Optimized path

   // Holey array (slower):
   const holey = [1, , 3, , 5];  // Has holes
   holey.map(x => x * 2);  // Deoptimized path
   ```

**Memory Allocation:**

- **map()**: Pre-allocates array of same length (efficient)
- **filter()**: Dynamic allocation (grows as needed)
- **reduce()**: No array allocation (single accumulator)

**Performance Characteristics:**

| Method | Time | Space | Mutates? |
|--------|------|-------|----------|
| map() | O(n) | O(n) | No |
| filter() | O(n) | O(k) where k ≤ n | No |
| reduce() | O(n) | O(1) | No |

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Performance Bug in Production</strong></summary>

**Scenario**: E-commerce dashboard with 10,000 products is freezing. Users report 5-second delays when filtering products.

```javascript
// ❌ PROBLEM CODE (Causing freezes)
const products = Array(10000).fill().map((_, i) => ({
  id: i,
  name: `Product ${i}`,
  price: Math.random() * 1000,
  category: ['electronics', 'clothing', 'food'][i % 3]
}));

function getProductStats(category) {
  // BUG 1: Multiple iterations through same array
  const categoryProducts = products.filter(p => p.category === category);
  const count = categoryProducts.length;
  const prices = categoryProducts.map(p => p.price);
  const total = prices.reduce((sum, price) => sum + price, 0);
  const avg = total / count;
  const max = prices.reduce((m, p) => Math.max(m, p), 0);
  const min = prices.reduce((m, p) => Math.min(m, p), Infinity);

  return { count, total, avg, max, min };
  // Result: 5 iterations through 10,000 items! (~50ms)
}
```

**Debugging Steps:**

1. **Profile with Chrome DevTools**:
   ```javascript
   console.time('getProductStats');
   getProductStats('electronics');
   console.timeEnd('getProductStats');
   // "getProductStats: 52.4ms"
   ```

2. **Identify redundant iterations**: Multiple passes through same array

3. **Optimize with single reduce()**:
   ```javascript
   // ✅ FIXED: Single iteration
   function getProductStatsFast(category) {
     const stats = products.reduce((acc, product) => {
       if (product.category === category) {
         acc.count++;
         acc.total += product.price;
         acc.max = Math.max(acc.max, product.price);
         acc.min = Math.min(acc.min, product.price);
       }
       return acc;
     }, { count: 0, total: 0, max: 0, min: Infinity });

     stats.avg = stats.total / stats.count;
     return stats;
     // Result: 1 iteration through 10,000 items! (~8ms)
   }

   // 6x performance improvement!
   ```

**Real Production Bug #2: Memory Leak**:

```javascript
// ❌ MEMORY LEAK: Creating massive arrays unnecessarily
function processOrders(orders) {
  // Problem: Creates 3 arrays of 50k orders each
  return orders
    .map(order => ({ ...order, processed: true }))     // 50k objects
    .filter(order => order.status === 'pending')       // ~20k objects
    .map(order => order.id);                           // ~20k ids

  // Peak memory: ~120MB for this operation!
}

// ✅ FIXED: Single pass with reduce
function processOrdersFast(orders) {
  return orders.reduce((ids, order) => {
    if (order.status === 'pending') {
      ids.push(order.id);
    }
    return ids;
  }, []);

  // Peak memory: ~4MB
  // 30x memory reduction!
}
```

**Lesson**: Chain map/filter sparingly. Use reduce() for complex aggregations.

</details>

<details>
<summary><strong>⚖️ Trade-offs: map vs forEach, Chaining vs reduce</strong></summary>

**1. map() vs forEach():**

| Aspect | map() | forEach() |
|--------|-------|-----------|
| Returns | New array | undefined |
| Use case | Transformation | Side effects only |
| Chainable | ✅ Yes | ❌ No |
| Performance | Allocates array | No allocation |

```javascript
// ✅ Use map() when you need the result
const doubled = numbers.map(n => n * 2);
const names = users.map(u => u.name);

// ✅ Use forEach() for side effects only
numbers.forEach(n => console.log(n));
users.forEach(u => sendEmail(u));

// ❌ DON'T do this:
const names = [];
users.forEach(u => names.push(u.name));  // Use map() instead!
```

**2. Chaining vs Single reduce():**

| Aspect | Chaining | Single reduce() |
|--------|----------|-----------------|
| Readability | ✅ Clearer | ❌ More complex |
| Performance | ❌ Multiple iterations | ✅ Single iteration |
| Memory | ❌ Intermediate arrays | ✅ No intermediates |

```javascript
const numbers = Array(10000).fill().map((_, i) => i);

// Chaining: Multiple iterations
console.time('chain');
const result1 = numbers
  .filter(n => n % 2 === 0)   // Pass 1: Filter
  .map(n => n * 2)             // Pass 2: Transform
  .reduce((sum, n) => sum + n, 0);  // Pass 3: Sum
console.timeEnd('chain');  // ~3.5ms

// Single reduce: One iteration
console.time('reduce');
const result2 = numbers.reduce((sum, n) => {
  if (n % 2 === 0) {
    sum += n * 2;
  }
  return sum;
}, 0);
console.timeEnd('reduce');  // ~1.2ms

// reduce() is 3x faster!
```

**When to Chain:**
```javascript
// ✅ GOOD: Small datasets, readability matters
const topUsers = users
  .filter(u => u.active)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

// ✅ GOOD: Simple transformations
const prices = products
  .filter(p => p.inStock)
  .map(p => p.price);
```

**When to Use reduce():**
```javascript
// ✅ GOOD: Large datasets (>1000 items)
// ✅ GOOD: Complex aggregations
// ✅ GOOD: Performance-critical code

const stats = largeArray.reduce((acc, item) => {
  if (item.valid) {
    acc.count++;
    acc.sum += item.value;
  }
  return acc;
}, { count: 0, sum: 0 });
```

**3. reduce() vs for loop:**

```javascript
// reduce() - Functional, immutable
const sum = numbers.reduce((acc, n) => acc + n, 0);

// for loop - Imperative, faster for simple operations
let sum = 0;
for (let i = 0; i < numbers.length; i++) {
  sum += numbers[i];
}

// Benchmark (1M items):
// for loop: ~1.5ms
// reduce(): ~2.5ms
// Difference: 1ms for 1 MILLION items (negligible for most cases)
```

**Verdict**: Use what's most readable. Optimize only if profiling shows it's a bottleneck.

</details>

<details>
<summary><strong>💬 Explain to Junior: map, filter, reduce</strong></summary>

**Simple Explanation:**

Imagine you have a box of LEGOs (an array):

**map()** = "Transform each LEGO"
- You go through each LEGO and paint it a different color
- You get back a NEW box with all painted LEGOs
- Same number of LEGOs, just transformed

```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
// Like painting each LEGO: [2, 4, 6, 8, 10]
```

**filter()** = "Pick specific LEGOs"
- You go through and only keep the red LEGOs
- You get back a NEW box with fewer LEGOs
- Only the ones that match your criteria

```javascript
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
// Like keeping only even numbers: [2, 4]
```

**reduce()** = "Combine all LEGOs into one thing"
- You take all LEGOs and build ONE big structure
- You get back a SINGLE value, not an array
- Like adding them all together

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((total, n) => total + n, 0);
// Like adding all together: 15
```

**Analogy for a PM:**

"Think of it like processing customer orders:
- **map()**: Convert each order from dollars to euros
- **filter()**: Keep only orders over $100
- **reduce()**: Calculate total revenue from all orders

The key benefit? You never modify the original data. You always get new results, keeping your original orders safe."

**Visual Example:**

```javascript
const students = [
  { name: "Alice", grade: 85 },
  { name: "Bob", grade: 92 },
  { name: "Charlie", grade: 78 },
  { name: "David", grade: 95 }
];

// map() - Get all names (transform each student → name)
const names = students.map(s => s.name);
// ["Alice", "Bob", "Charlie", "David"]

// filter() - Get students who passed (grade >= 80)
const passed = students.filter(s => s.grade >= 80);
// [{ name: "Alice", grade: 85 }, { name: "Bob", grade: 92 }, { name: "David", grade: 95 }]

// reduce() - Get average grade (combine all grades → single number)
const average = students.reduce((sum, s) => sum + s.grade, 0) / students.length;
// (85 + 92 + 78 + 95) / 4 = 87.5
```

**Combining Them (Recipe Analogy):**

```javascript
// You have a list of ingredients with prices
const ingredients = [
  { name: "Flour", price: 3, inStock: true },
  { name: "Sugar", price: 2, inStock: false },
  { name: "Eggs", price: 4, inStock: true },
  { name: "Butter", price: 5, inStock: true }
];

// Step 1: filter() - Keep only items in stock
const available = ingredients.filter(i => i.inStock);
// [Flour, Eggs, Butter]

// Step 2: map() - Get just the prices
const prices = available.map(i => i.price);
// [3, 4, 5]

// Step 3: reduce() - Calculate total cost
const total = prices.reduce((sum, price) => sum + price, 0);
// 3 + 4 + 5 = 12

// Or all in one chain:
const totalCost = ingredients
  .filter(i => i.inStock)
  .map(i => i.price)
  .reduce((sum, p) => sum + p, 0);
// 12
```

**Common Beginner Mistakes:**

```javascript
// ❌ Mistake 1: Forgetting to return in map
const doubled = [1, 2, 3].map(n => {
  n * 2;  // Oops! No return
});
// Result: [undefined, undefined, undefined]

// ✅ Fix: Always return
const doubled = [1, 2, 3].map(n => n * 2);

// ❌ Mistake 2: Using map when you want filter
const evens = [1, 2, 3, 4].map(n => {
  if (n % 2 === 0) return n;
});
// Result: [undefined, 2, undefined, 4] (NOT what you want!)

// ✅ Fix: Use filter
const evens = [1, 2, 3, 4].filter(n => n % 2 === 0);
// Result: [2, 4]
```

</details>

### Follow-up Questions
1. "How would you implement your own map/filter/reduce?"
2. "What's the time complexity of these methods?"
3. "Can you break out of a reduce early?"
4. "What's the difference between forEach and map?"

### Resources
- [MDN: Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN: Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)

---

