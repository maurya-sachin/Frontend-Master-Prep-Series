# Flatten Nested Object

## Problem Statement

Implement a function to flatten a deeply nested object into a single-level object with dot-notation keys. The function should handle objects nested to any depth.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-30 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb, Uber

---

## Requirements

- [ ] Flatten object of any depth
- [ ] Use dot notation for nested keys (e.g., "a.b.c")
- [ ] Handle arrays (keep as values or flatten with indices)
- [ ] Handle null and undefined values
- [ ] Don't modify the original object
- [ ] Handle edge cases (empty objects, primitive values)
- [ ] Support custom separator (optional)

---

## Real-World Use Cases

1. **Form Data Serialization** - Convert nested form state to flat structure for API
2. **Database Queries** - Flatten nested MongoDB documents for SQL storage
3. **Analytics Events** - Flatten nested event properties for tracking
4. **Configuration Files** - Flatten nested config objects for environment variables
5. **CSV Export** - Convert nested JSON to flat structure for CSV
6. **Query Parameters** - Flatten nested filters to URL query strings

---

## Example Usage

```javascript
// Basic flattening
const obj = {
  a: 1,
  b: {
    c: 2,
    d: {
      e: 3
    }
  }
};

flattenObject(obj);
// Output: { 'a': 1, 'b.c': 2, 'b.d.e': 3 }

// With arrays
const objWithArray = {
  user: {
    name: 'John',
    hobbies: ['reading', 'gaming']
  }
};

flattenObject(objWithArray);
// Output: { 'user.name': 'John', 'user.hobbies.0': 'reading', 'user.hobbies.1': 'gaming' }

// With null/undefined
const objWithNull = {
  a: 1,
  b: {
    c: null,
    d: undefined
  }
};

flattenObject(objWithNull);
// Output: { 'a': 1, 'b.c': null, 'b.d': undefined }

// Custom separator
flattenObject(obj, '_');
// Output: { 'a': 1, 'b_c': 2, 'b_d_e': 3 }
```

---

## Test Cases

```javascript
describe('flattenObject', () => {
  test('flattens simple nested object', () => {
    const input = { a: { b: 1 } };
    const expected = { 'a.b': 1 };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('flattens deeply nested object', () => {
    const input = { a: { b: { c: { d: 1 } } } };
    const expected = { 'a.b.c.d': 1 };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('handles multiple nested properties', () => {
    const input = {
      a: 1,
      b: { c: 2, d: 3 },
      e: { f: { g: 4 } }
    };
    const expected = {
      'a': 1,
      'b.c': 2,
      'b.d': 3,
      'e.f.g': 4
    };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('handles arrays with indices', () => {
    const input = {
      arr: [1, 2, { a: 3 }]
    };
    const expected = {
      'arr.0': 1,
      'arr.1': 2,
      'arr.2.a': 3
    };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('preserves null and undefined', () => {
    const input = {
      a: null,
      b: { c: undefined }
    };
    const expected = {
      'a': null,
      'b.c': undefined
    };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('handles empty objects', () => {
    expect(flattenObject({})).toEqual({});
    expect(flattenObject({ a: {} })).toEqual({});
  });

  test('handles primitives at root', () => {
    const input = { a: 1, b: 'hello', c: true };
    const expected = { a: 1, b: 'hello', c: true };
    expect(flattenObject(input)).toEqual(expected);
  });

  test('uses custom separator', () => {
    const input = { a: { b: { c: 1 } } };
    const expected = { 'a_b_c': 1 };
    expect(flattenObject(input, '_')).toEqual(expected);
  });

  test('does not modify original object', () => {
    const input = { a: { b: 1 } };
    const inputCopy = JSON.parse(JSON.stringify(input));
    flattenObject(input);
    expect(input).toEqual(inputCopy);
  });
});
```

---

## Solution 1: Recursive Approach (Simple)

```javascript
function flattenObject(obj, separator = '.') {
  const result = {};

  function flatten(current, prefix = '') {
    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        const value = current[key];
        const newKey = prefix ? `${prefix}${separator}${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Recursively flatten nested objects
          flatten(value, newKey);
        } else if (Array.isArray(value)) {
          // Flatten arrays with indices
          value.forEach((item, index) => {
            const arrayKey = `${newKey}${separator}${index}`;
            if (typeof item === 'object' && item !== null) {
              flatten(item, arrayKey);
            } else {
              result[arrayKey] = item;
            }
          });
        } else {
          result[newKey] = value;
        }
      }
    }
  }

  flatten(obj);
  return result;
}
```

**Time Complexity:** O(n) where n is total number of properties
**Space Complexity:** O(d) where d is maximum depth (recursion stack)

**Pros:**
- Clean and readable
- Handles nested objects and arrays
- Preserves null/undefined
- Supports custom separator

**Cons:**
- Uses recursion (stack overflow risk for very deep objects)
- Creates closure for each recursion

---

## Solution 2: Iterative with Stack

```javascript
function flattenObject(obj, separator = '.') {
  const result = {};
  const stack = [[obj, '']]; // [object, prefix]

  while (stack.length > 0) {
    const [current, prefix] = stack.pop();

    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        const value = current[key];
        const newKey = prefix ? `${prefix}${separator}${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          stack.push([value, newKey]);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const arrayKey = `${newKey}${separator}${index}`;
            if (typeof item === 'object' && item !== null) {
              stack.push([item, arrayKey]);
            } else {
              result[arrayKey] = item;
            }
          });
        } else {
          result[newKey] = value;
        }
      }
    }
  }

  return result;
}
```

**Time Complexity:** O(n)
**Space Complexity:** O(d)

**Pros:**
- No recursion (avoids stack overflow)
- Better for very deep objects
- Same functionality as recursive

**Cons:**
- Slightly more complex
- Manual stack management

---

## Solution 3: Using reduce() (Functional)

```javascript
function flattenObject(obj, separator = '.', prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(acc, flattenObject(value, separator, newKey));
    } else if (Array.isArray(value)) {
      // Flatten arrays
      value.forEach((item, index) => {
        const arrayKey = `${newKey}${separator}${index}`;
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flattenObject(item, separator, arrayKey));
        } else {
          acc[arrayKey] = item;
        }
      });
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
}
```

**Time Complexity:** O(n)
**Space Complexity:** O(d)

**Pros:**
- Functional programming style
- Immutable approach
- Concise

**Cons:**
- Still uses recursion
- Object.assign creates intermediate objects

---

## Solution 4: Production-Ready with Options

```javascript
function flattenObject(obj, options = {}) {
  const {
    separator = '.',
    includeArrays = true,
    maxDepth = Infinity,
    skipNull = false,
    skipUndefined = false
  } = options;

  // Input validation
  if (obj === null || typeof obj !== 'object') {
    throw new TypeError('Input must be an object');
  }

  const result = {};

  function flatten(current, prefix = '', depth = 0) {
    // Check max depth
    if (depth > maxDepth) {
      result[prefix] = current;
      return;
    }

    for (const key in current) {
      if (!current.hasOwnProperty(key)) continue;

      const value = current[key];
      const newKey = prefix ? `${prefix}${separator}${key}` : key;

      // Skip null/undefined if configured
      if ((skipNull && value === null) || (skipUndefined && value === undefined)) {
        continue;
      }

      // Handle objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if empty object
        if (Object.keys(value).length === 0) {
          continue; // Skip empty objects
        }
        flatten(value, newKey, depth + 1);
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        if (includeArrays) {
          value.forEach((item, index) => {
            const arrayKey = `${newKey}${separator}${index}`;
            if (typeof item === 'object' && item !== null) {
              flatten(item, arrayKey, depth + 1);
            } else {
              result[arrayKey] = item;
            }
          });
        } else {
          result[newKey] = value; // Keep array as value
        }
      }
      // Primitive values
      else {
        result[newKey] = value;
      }
    }
  }

  flatten(obj);
  return result;
}

// Usage with options
flattenObject(obj, {
  separator: '_',
  includeArrays: false,
  maxDepth: 2,
  skipNull: true
});
```

**Time Complexity:** O(n)
**Space Complexity:** O(d)

**Pros:**
- ✅ Configurable behavior
- ✅ Input validation
- ✅ Max depth protection
- ✅ Skip null/undefined option
- ✅ Array handling options
- ✅ Production-ready

**Cons:**
- More complex API
- More configuration to understand

---

## Common Mistakes

### ❌ Mistake 1: Not handling arrays properly

```javascript
// Wrong - arrays become objects
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

flattenObject({ arr: [1, 2] });
// Output: { 'arr.0': 1, 'arr.1': 2 } - looks right but treats array as object
// Should explicitly check Array.isArray()
```

### ❌ Mistake 2: Not handling null values

```javascript
// Wrong - null is typeof 'object', causes error
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object') {
      // This includes null! Will try to iterate over null
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
```

### ✅ Correct: Always check for null

```javascript
if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
  // Safe to recurse
}
```

### ❌ Mistake 3: Modifying original object

```javascript
// Wrong - mutates input
function flattenObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      const nested = obj[key];
      delete obj[key];
      Object.assign(obj, flattenObject(nested)); // Mutates obj!
    }
  }
  return obj;
}
```

### ✅ Correct: Create new object

```javascript
function flattenObject(obj) {
  const result = {}; // New object
  // ... populate result
  return result;
}
```

---

## Edge Cases

1. **Empty objects** - Skip or include as empty key?
2. **Circular references** - Need detection (WeakMap)
3. **Date objects** - Keep as value or convert?
4. **RegExp objects** - Keep as value
5. **Symbol keys** - Use Reflect.ownKeys()
6. **Getters/setters** - May trigger side effects
7. **Non-enumerable properties** - Skip by default

---

## Practical Example: Form Data Serialization

```javascript
// Real-world scenario: Flatten nested form state for API
const formState = {
  user: {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      age: 30
    },
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001'
    }
  },
  preferences: {
    notifications: {
      email: true,
      sms: false
    }
  }
};

// Flatten for API submission
const flatData = flattenObject(formState);
console.log(flatData);
/*
{
  'user.profile.firstName': 'John',
  'user.profile.lastName': 'Doe',
  'user.profile.age': 30,
  'user.address.street': '123 Main St',
  'user.address.city': 'New York',
  'user.address.zip': '10001',
  'preferences.notifications.email': true,
  'preferences.notifications.sms': false
}
*/

// Convert to FormData
const formData = new FormData();
Object.entries(flatData).forEach(([key, value]) => {
  formData.append(key, value);
});
```

---

## Practical Example: Database Migration

```javascript
// MongoDB document to SQL-friendly flat structure
const mongoDoc = {
  _id: '123',
  user: {
    name: 'John Doe',
    contact: {
      email: 'john@example.com',
      phone: '555-1234'
    }
  },
  metadata: {
    createdAt: new Date('2024-01-01'),
    tags: ['premium', 'verified']
  }
};

const flatDoc = flattenObject(mongoDoc, {
  separator: '_',
  includeArrays: true
});

console.log(flatDoc);
/*
{
  '_id': '123',
  'user_name': 'John Doe',
  'user_contact_email': 'john@example.com',
  'user_contact_phone': '555-1234',
  'metadata_createdAt': Date,
  'metadata_tags_0': 'premium',
  'metadata_tags_1': 'verified'
}
*/
```

---

## Related Problem: Unflatten Object

```javascript
function unflattenObject(flatObj, separator = '.') {
  const result = {};

  for (const key in flatObj) {
    const keys = key.split(separator);
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      const nextKey = keys[i + 1];

      // Check if next key is a number (array index)
      if (!isNaN(nextKey)) {
        current[k] = current[k] || [];
      } else {
        current[k] = current[k] || {};
      }

      current = current[k];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = flatObj[key];
  }

  return result;
}

// Usage
const flat = { 'a.b.c': 1, 'a.b.d': 2 };
unflattenObject(flat);
// Output: { a: { b: { c: 1, d: 2 } } }
```

---

## Performance Comparison

```javascript
const largeObj = {
  /* deeply nested object with 1000+ properties */
};

console.time('Recursive');
flattenObjectRecursive(largeObj);
console.timeEnd('Recursive'); // ~2ms

console.time('Iterative');
flattenObjectIterative(largeObj);
console.timeEnd('Iterative'); // ~1.8ms (slightly faster)

console.time('Reduce');
flattenObjectReduce(largeObj);
console.timeEnd('Reduce'); // ~2.5ms (slowest due to Object.assign overhead)
```

---

## Follow-up Questions

1. **"How would you handle circular references?"**
   - Use WeakMap to track visited objects
   - Throw error or skip circular references
   - Similar to deep clone circular reference handling

2. **"What about preserving type information?"**
   - Could add type suffix: `'user.age:number': 30`
   - Useful for schema validation
   - Need custom unflatten logic

3. **"How to optimize for very large objects?"**
   - Use iterative approach (avoid stack overflow)
   - Stream processing for huge datasets
   - Consider if flattening is necessary

4. **"Should arrays be flattened or kept as values?"**
   - Depends on use case
   - API submission: often flatten with indices
   - CSV export: keep as comma-separated string
   - Make it configurable

5. **"How to handle Date, RegExp, and other special objects?"**
   - Usually keep as leaf values (don't flatten)
   - Can add special handling per type
   - Document expected behavior

---

## Resources

- [Lodash flatten](https://lodash.com/docs/4.17.15#flatten)
- [How to Flatten an Object in JavaScript](https://www.freecodecamp.org/news/how-to-flatten-an-object-in-javascript/)
- [Stack Overflow: Flatten Object](https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects)

---

[← Back: Object Set Path](./object-set-path.md) | [JavaScript Fundamentals](./README.md) | [Next: Object Deep Merge →](./object-deep-merge.md)
