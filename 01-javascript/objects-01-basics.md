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

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Object Transformation Performance</strong></summary>

**Problem:** Dashboard API returns 10,000 user records. Frontend needs to filter/transform specific fields, causing 3-second lag.

**Inefficient Code:**
```javascript
// ❌ Creates 60,000 arrays (keys, values, entries for each object)
const transformedUsers = users.map(user => {
  const keys = Object.keys(user);      // Allocation 1
  const values = Object.values(user);  // Allocation 2
  const entries = Object.entries(user); // Allocation 3

  const transformed = {};
  entries.forEach(([key, value]) => {
    if (typeof value === 'string') {
      transformed[key] = value.toUpperCase();
    }
  });
  return transformed;
});

// Time: 3200ms
// Memory: 12MB allocations
// GC pauses: 6 × 50ms = 300ms
```

**Optimized Code:**
```javascript
// ✅ Single iteration, minimal allocations
const transformedUsers = users.map(user => {
  const transformed = {};

  for (const key in user) {
    if (!user.hasOwnProperty(key)) continue;

    const value = user[key];
    if (typeof value === 'string') {
      transformed[key] = value.toUpperCase();
    }
  }

  return transformed;
});

// Time: 180ms (94% faster!)
// Memory: 800KB allocations
// GC pauses: 1 × 15ms
```

**Why It's Faster:**
1. **for...in**: No array allocation (uses iterator)
2. **Single pass**: Checks type during iteration
3. **No intermediate arrays**: Directly assigns to result
4. **Better cache locality**: Sequential property access

**When to use each:**
- **Object.keys/values/entries**: When you need array methods (map, filter, reduce)
- **for...in**: When performance critical, large objects, or streaming data
- **Object.entries + destructuring**: When readability > performance

**Benchmark Results (1,000 objects with 20 properties each):**
```
Object.entries() + forEach:  42ms
Object.keys() + map:         38ms
for...in loop:               8ms  (80% faster)
for...of Object.entries():   45ms
```

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

**Rule of Thumb:**
- **Small objects (<100 props)**: Use Object.entries() for readability
- **Large objects or hot paths**: Use for...in for speed
- **Unknown object size**: Measure first!

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

Think of an object as a filing cabinet:

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

</details>

### Resources

- [MDN: Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

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

**Key Differences:**

1. **Property Access:**
   - Object: `obj.key` or `obj['key']` (optimized by IC)
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

**Optimization Tips:**

✅ **Use Object when:**
- Keys are known strings at compile time
- Need fast property access (dot notation)
- Serialization with JSON.stringify needed
- Small number of properties (<20)

✅ **Use Map when:**
- Keys are dynamic or non-string types
- Frequent additions/deletions
- Need .size property
- Order of insertion matters
- >100 entries (Map scales better)

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Memory Leak with Object Keys</strong></summary>

**Problem:** SPA tracking user sessions caused memory leak. App crashed after 6 hours with 2GB+ memory usage.

**Buggy Code:**
```javascript
// ❌ MEMORY LEAK
const sessionCache = {};  // Object used as cache

function trackUser(user) {
  const userObj = { id: user.id, name: user.name };

  // Using object as key → converted to '[object Object]'!
  sessionCache[userObj] = {
    timestamp: Date.now(),
    actions: []
  };

  // All users map to same key → single entry
  // BUT userObj never garbage collected!
}

// After 1000 users:
// - sessionCache has 1 entry (all users share key '[object Object]')
// - 1000 user objects still in memory (referenced by V8)
// - Memory leak: 1000 × 200 bytes = 200KB
// After 100,000 users → 20MB leak
```

**Why the leak:**
1. Object converts `userObj` to string `'[object Object]'`
2. All users share same key
3. But original `userObj` still referenced internally
4. Garbage collector can't free them

**Solution 1 - Use Map with Object Keys:**
```javascript
// ✅ Map with object keys (no leak)
const sessionCache = new Map();

function trackUser(user) {
  const userObj = { id: user.id, name: user.name };

  sessionCache.set(userObj, {
    timestamp: Date.now(),
    actions: []
  });
}

// Map allows object keys → each user gets unique entry
// When userObj goes out of scope, GC can collect it
// BUT: sessionCache still holds reference → manual cleanup needed
```

**Solution 2 - Use WeakMap (Automatic GC):**
```javascript
// ✅✅ WeakMap - automatic cleanup!
const sessionCache = new WeakMap();

function trackUser(user) {
  const userObj = { id: user.id, name: user.name };

  sessionCache.set(userObj, {
    timestamp: Date.now(),
    actions: []
  });

  // When userObj has no other references → GC removes from WeakMap
}

// Memory stabilizes: only active users in cache
```

**Solution 3 - Use String Keys:**
```javascript
// ✅ String keys (most efficient)
const sessionCache = {};

function trackUser(user) {
  const key = `user:${user.id}`;  // String key

  sessionCache[key] = {
    timestamp: Date.now(),
    actions: []
  };
}

// Add cleanup for old sessions
setInterval(() => {
  const now = Date.now();
  for (const key in sessionCache) {
    if (now - sessionCache[key].timestamp > 3600000) {
      delete sessionCache[key];  // Remove after 1 hour
    }
  }
}, 60000);
```

**Results:**
- **Before**: 2GB memory after 6 hours → crash
- **After (WeakMap)**: 45MB stable → no crash in 30-day test
- **After (String keys + cleanup)**: 12MB stable

**Key Lessons:**
1. Objects as keys → use Map or WeakMap
2. Caches need eviction strategy (TTL, LRU, size limit)
3. WeakMap for temporary references (automatic cleanup)
4. Monitor memory usage in production

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
   ```

3. **Frequent Add/Delete:**
   ```javascript
   // LRU cache implementation
   cache.set(key, value);
   cache.delete(oldestKey);  // Fast with Map
   ```

4. **Need .size:**
   ```javascript
   if (cache.size > 100) {
     cache.delete(cache.keys().next().value);
   }
   ```

5. **Ordered Iteration:**
   ```javascript
   map.forEach((val, key) => {
     // Guaranteed insertion order
   });
   ```

## When to Use Object

**✅ Use Object for:**

1. **Fixed Schema:**
   ```javascript
   const user = {
     id: 1,
     name: 'Alice',
     email: 'alice@example.com'
   };
   ```

2. **JSON Serialization:**
   ```javascript
   const config = { theme: 'dark', lang: 'en' };
   localStorage.setItem('config', JSON.stringify(config));
   ```

3. **String Keys (known at compile time):**
   ```javascript
   const routes = {
     '/home': HomeComponent,
     '/about': AboutComponent
   };
   ```

4. **Property Access Syntax:**
   ```javascript
   console.log(user.name);  // Cleaner than user.get('name')
   ```

## Performance Comparison

**Small Dataset (<20 entries):**
```
Object: Faster (inline properties)
Map: Slightly slower (hash lookup)
Winner: Object (10-20% faster)
```

**Medium Dataset (20-1000 entries):**
```
Object: Dictionary mode (slower)
Map: Consistent performance
Winner: Map (30-40% faster for iteration)
```

**Large Dataset (>1000 entries):**
```
Object: Degrades with size
Map: Scales linearly
Winner: Map (50-80% faster)
```

## Memory Comparison

**1,000 string keys with primitive values:**
- Object: ~40KB
- Map: ~62KB (55% more)

**1,000 object keys:**
- Object: Not recommended (key coercion)
- Map: ~86KB

## Real-World Guidelines

| Scenario | Choice | Reason |
|----------|--------|--------|
| User preferences | Object | JSON serialization needed |
| Event listeners (DOM → handler) | Map | Object keys |
| LRU cache | Map | Frequent delete, .size |
| API response data | Object | Fixed schema, JSON |
| Session storage | WeakMap | Auto GC when ref lost |
| Route config | Object | String keys, compile-time |
| Memoization cache | Map | Dynamic keys, size tracking |

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Map vs Object** - Think of it like two types of storage:

**Object = Bookshelf with labels**
- Labels (keys) must be strings
- Fast if you know the label: `book.title`
- Converting to JSON easy (for saving/sharing)

```javascript
const book = {
  title: "JavaScript Basics",
  author: "Alice",
  year: 2024
};

console.log(book.title);  // "JavaScript Basics"
JSON.stringify(book);     // Works!
```

**Map = Digital database**
- Any type can be a key (numbers, objects, anything!)
- Built-in tools: `.size`, ordered iteration
- Better for lots of changing data

```javascript
const ratings = new Map();

// Can use objects as keys!
const book1 = { title: "Book 1" };
const book2 = { title: "Book 2" };

ratings.set(book1, 5);
ratings.set(book2, 4);

console.log(ratings.get(book1));  // 5
console.log(ratings.size);        // 2
```

**When to use each:**

**Use Object when:**
- ✅ You know all the keys (like `user.name`, `user.email`)
- ✅ You need to save as JSON
- ✅ Keys are always strings

**Use Map when:**
- ✅ Keys are objects, numbers, or mixed types
- ✅ Adding/removing lots of items
- ✅ Need to count items (`.size`)
- ✅ Order matters (Map remembers insertion order)

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

console.log(cache.size);      // 2 (separate entries!)
console.log(cache.get(user1)); // "data1"
console.log(cache.get(user2)); // "data2"
```

**Rule of Thumb:**
- Simple data with string keys → **Object**
- Complex keys or lots of changes → **Map**

</details>

### Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Map vs Object in JavaScript](https://www.javascripttutorial.net/es6/javascript-map-vs-object/)

---

