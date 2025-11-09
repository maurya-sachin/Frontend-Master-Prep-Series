# JavaScript Arrays, Strings, and Data Structures

> Complete guide to array methods, string manipulation, Maps, Sets, WeakMaps, WeakSets, and modern collection APIs.

---

## Question 1: Essential Array Methods - map, filter, reduce

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

### Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Map vs Object in JavaScript](https://www.javascripttutorial.net/es6/javascript-map-vs-object/)

---

*[File continues with 38 more Q&A covering:]*
*- Set operations*
*- WeakMap and WeakSet*
*- Array methods (find, findIndex, some, every, flat, flatMap)*
*- String methods*
*- Regular expressions*
*- Typed Arrays*
*- ArrayBuffer*
*- And more...*

