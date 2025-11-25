# Implement Deep Clone Function

## Problem Statement

Implement a deep clone function that creates a complete copy of a nested object/array, including all nested references, without sharing any references with the original.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 25-35 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

---

## Requirements

- [ ] Clone primitive values
- [ ] Clone nested objects and arrays
- [ ] Handle circular references
- [ ] Clone Date, RegExp, Map, Set objects
- [ ] Preserve prototype chain
- [ ] Handle null and undefined
- [ ] Don't clone functions (copy reference or skip)
- [ ] Handle edge cases (symbols, getters/setters)

---

## Real-World Use Cases

1. **State Management** - Immutable state updates in Redux/Zustand
2. **Undo/Redo** - Save snapshots of application state
3. **Form Data** - Clone form state before editing
4. **API Responses** - Clone data before mutations
5. **Testing** - Create independent test data copies
6. **Canvas/Game State** - Save game checkpoints

---

## Example Usage

```javascript
const original = {
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    zip: 10001
  },
  hobbies: ['reading', 'gaming'],
  date: new Date('2024-01-01')
};

const cloned = deepClone(original);

// Modify clone
cloned.address.city = 'Boston';
cloned.hobbies.push('cooking');

console.log(original.address.city); // 'New York' (unchanged)
console.log(original.hobbies); // ['reading', 'gaming'] (unchanged)
console.log(cloned.address.city); // 'Boston'
```

---

## Test Cases

```javascript
describe('deepClone', () => {
  test('clones primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  test('clones simple objects', () => {
    const obj = { a: 1, b: 2 };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  test('clones nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const cloned = deepClone(obj);

    cloned.a.b.c = 2;
    expect(obj.a.b.c).toBe(1);
    expect(cloned.a.b.c).toBe(2);
  });

  test('clones arrays', () => {
    const arr = [1, [2, [3, 4]]];
    const cloned = deepClone(arr);

    cloned[1][1][0] = 99;
    expect(arr[1][1][0]).toBe(3);
    expect(cloned[1][1][0]).toBe(99);
  });

  test('handles circular references', () => {
    const obj = { a: 1 };
    obj.self = obj;

    const cloned = deepClone(obj);
    expect(cloned.self).toBe(cloned);
    expect(cloned.self).not.toBe(obj);
  });

  test('clones Date objects', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);

    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
    expect(cloned instanceof Date).toBe(true);
  });

  test('clones RegExp objects', () => {
    const regex = /test/gi;
    const cloned = deepClone(regex);

    expect(cloned.source).toBe(regex.source);
    expect(cloned.flags).toBe(regex.flags);
    expect(cloned).not.toBe(regex);
  });

  test('clones Map objects', () => {
    const map = new Map([['key1', 'value1'], ['key2', { nested: true }]]);
    const cloned = deepClone(map);

    cloned.get('key2').nested = false;
    expect(map.get('key2').nested).toBe(true);
  });

  test('clones Set objects', () => {
    const set = new Set([1, 2, { a: 3 }]);
    const cloned = deepClone(set);

    expect(cloned).toEqual(set);
    expect(cloned).not.toBe(set);
  });

  test('handles mixed nested structures', () => {
    const obj = {
      arr: [1, { nested: [2, 3] }],
      map: new Map([['key', [4, 5]]]),
      set: new Set([{ a: 6 }])
    };

    const cloned = deepClone(obj);
    cloned.arr[1].nested.push(99);

    expect(obj.arr[1].nested).toEqual([2, 3]);
    expect(cloned.arr[1].nested).toEqual([2, 3, 99]);
  });
});
```

---

## Solution 1: JSON.parse/JSON.stringify (Simple but Limited)

```javascript
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- Extremely simple (one line)
- Built-in, no custom code needed
- Fast for simple objects

**Cons:**
- ❌ Loses functions
- ❌ Loses undefined values
- ❌ Loses Date objects (converts to string)
- ❌ Loses RegExp (converts to empty object)
- ❌ Loses Map, Set
- ❌ Cannot handle circular references (throws error)
- ❌ Loses symbol keys

**When to use:** Only for simple, flat data structures with no special types.

---

## Solution 2: Recursive Clone (Good Balance)

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular references
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);

    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i], hash);
    }

    return arrCopy;
  }

  // Handle Object
  const objCopy = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, objCopy);

  // Clone all enumerable properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepClone(obj[key], hash);
    }
  }

  return objCopy;
}
```

**Time Complexity:** O(n) where n is total number of values
**Space Complexity:** O(d) where d is max depth of nesting

**Pros:**
- Handles circular references
- Handles Date, RegExp
- Preserves prototype chain
- Good performance

**Cons:**
- Doesn't handle Map, Set
- Doesn't clone symbol keys
- Doesn't preserve getters/setters

---

## Solution 3: Production-Ready (Complete)

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // Primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Circular reference check
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    const flags = obj.flags;
    const clone = new RegExp(obj.source, flags);
    clone.lastIndex = obj.lastIndex;
    return clone;
  }

  // Handle Map
  if (obj instanceof Map) {
    const mapClone = new Map();
    hash.set(obj, mapClone);

    obj.forEach((value, key) => {
      mapClone.set(deepClone(key, hash), deepClone(value, hash));
    });

    return mapClone;
  }

  // Handle Set
  if (obj instanceof Set) {
    const setClone = new Set();
    hash.set(obj, setClone);

    obj.forEach(value => {
      setClone.add(deepClone(value, hash));
    });

    return setClone;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrClone = [];
    hash.set(obj, arrClone);

    obj.forEach((item, index) => {
      arrClone[index] = deepClone(item, hash);
    });

    return arrClone;
  }

  // Handle Object
  const objClone = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, objClone);

  // Clone all own properties (including non-enumerable and symbols)
  Reflect.ownKeys(obj).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor.value !== undefined) {
      // Regular property
      Object.defineProperty(objClone, key, {
        ...descriptor,
        value: deepClone(descriptor.value, hash)
      });
    } else {
      // Getter/setter
      Object.defineProperty(objClone, key, descriptor);
    }
  });

  return objClone;
}
```

**Time Complexity:** O(n)
**Space Complexity:** O(d)

**Pros:**
- ✅ Handles all common types
- ✅ Circular references
- ✅ Map, Set support
- ✅ Symbol keys
- ✅ Preserves property descriptors
- ✅ Preserves getters/setters
- ✅ Prototype chain preserved

**Cons:**
- More complex code
- Doesn't clone functions (by design)

---

## Common Mistakes

### ❌ Mistake 1: Shallow clone instead of deep

```javascript
// Wrong - shallow clone
function deepClone(obj) {
  return { ...obj }; // Only copies first level
}

const original = { a: { b: 1 } };
const cloned = deepClone(original);
cloned.a.b = 2;
console.log(original.a.b); // 2 (modified!)
```

### ❌ Mistake 2: Not handling circular references

```javascript
// Wrong - causes infinite recursion
function deepClone(obj) {
  if (typeof obj !== 'object') return obj;

  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    clone[key] = deepClone(obj[key]); // Infinite loop!
  }
  return clone;
}

const obj = { a: 1 };
obj.self = obj;
deepClone(obj); // Stack overflow!
```

### ✅ Correct: Use WeakMap to track visited objects

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (hash.has(obj)) {
    return hash.get(obj); // Return cached clone
  }

  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (const key in obj) {
    clone[key] = deepClone(obj[key], hash);
  }

  return clone;
}
```

### ❌ Mistake 3: Not handling special objects

```javascript
// Wrong - Date becomes empty object
const date = new Date();
const cloned = { ...date }; // {}
```

### ✅ Correct: Check instance types

```javascript
if (obj instanceof Date) {
  return new Date(obj);
}
```

---

## Edge Cases

1. **Functions** - Usually don't clone (can't truly clone closures)
2. **DOM nodes** - Don't clone (use cloneNode)
3. **Symbols** - Clone symbol-keyed properties
4. **Getters/Setters** - Preserve property descriptors
5. **Non-enumerable properties** - Use Reflect.ownKeys
6. **__proto__** - Preserve prototype chain

---

## Practical Example: Immutable State Update

```javascript
// Redux-style immutable update
function updateUserAddress(state, userId, newAddress) {
  // Deep clone entire state
  const newState = deepClone(state);

  // Find and update user
  const user = newState.users.find(u => u.id === userId);
  if (user) {
    user.address = newAddress;
  }

  return newState;
}

// Usage
const state = {
  users: [
    { id: 1, name: 'John', address: { city: 'NYC' } },
    { id: 2, name: 'Jane', address: { city: 'LA' } }
  ]
};

const newState = updateUserAddress(state, 1, { city: 'Boston' });

console.log(state.users[0].address.city); // 'NYC' (unchanged)
console.log(newState.users[0].address.city); // 'Boston'
```

---

## Performance Comparison

```javascript
const obj = {
  /* large nested object */
};

// JSON method: ~15ms
console.time('JSON');
JSON.parse(JSON.stringify(obj));
console.timeEnd('JSON');

// Recursive method: ~25ms
console.time('Recursive');
deepClone(obj);
console.timeEnd('Recursive');

// Native structuredClone: ~10ms (fastest, modern browsers)
console.time('structuredClone');
structuredClone(obj);
console.timeEnd('structuredClone');
```

---

## Modern Alternative: structuredClone

```javascript
// Modern browsers (2022+) have built-in deep clone
const cloned = structuredClone(original);

// Supports:
// ✅ Nested objects/arrays
// ✅ Date, RegExp, Map, Set
// ✅ Circular references
// ✅ Typed arrays
// ❌ Functions
// ❌ DOM nodes
```

**When to use:** If targeting modern browsers only.

---

## Follow-up Questions

1. **"Why can't you truly clone a function?"**
   - Functions have closures over their scope
   - Can't recreate the scope chain
   - Would need to serialize entire lexical environment

2. **"How would you handle very large objects?"**
   - Use streaming/chunked cloning
   - Clone only needed properties (partial clone)
   - Consider if you really need deep clone

3. **"What about cloning class instances?"**
   - Need to preserve prototype
   - May need custom clone methods
   - Use Object.create(Object.getPrototypeOf(obj))

4. **"Performance concerns with deep cloning?"**
   - O(n) time complexity unavoidable
   - Can optimize by caching
   - Consider immutable data structures instead

5. **"When to use shallow vs deep clone?"**
   - Shallow: First level independence needed
   - Deep: Complete isolation required
   - Deep: More expensive, use judiciously

---

## Resources

- [MDN: structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [Lodash cloneDeep](https://lodash.com/docs/4.17.15#cloneDeep)
- [Understanding Deep Clone](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy)

---

[← Back: Throttle](./throttle.md) | [JavaScript Fundamentals](./README.md) | [Next: Promise.all →](./promise-all.md)
