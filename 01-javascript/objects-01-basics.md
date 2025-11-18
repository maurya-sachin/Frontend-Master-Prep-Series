# Objects & Collections

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 28: What are Object.keys(), Object.values(), and Object.entries()?

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

### Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Map vs Object in JavaScript](https://www.javascripttutorial.net/es6/javascript-map-vs-object/)

---

