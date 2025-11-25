# Deep Merge Objects

## Problem Statement

Implement a function to deeply merge two or more objects, recursively combining nested properties. When there are conflicts, values from later objects should override earlier ones.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 25-35 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb, Netflix

---

## Requirements

- [ ] Merge multiple objects deeply
- [ ] Handle nested objects recursively
- [ ] Later values override earlier values
- [ ] Handle arrays (replace, concat, or merge)
- [ ] Don't modify source objects
- [ ] Handle null and undefined
- [ ] Support Date, RegExp, Map, Set
- [ ] Handle circular references (optional)

---

## Real-World Use Cases

1. **Configuration Merging** - Combine default config with user config
2. **Redux State Updates** - Merge partial state updates
3. **API Response Merging** - Combine data from multiple API calls
4. **Theme Customization** - Merge default theme with user overrides
5. **Plugin Configuration** - Merge plugin defaults with user options
6. **Localization** - Merge language files with fallbacks

---

## Example Usage

```javascript
// Basic deep merge
const obj1 = {
  a: 1,
  b: { c: 2, d: 3 }
};

const obj2 = {
  b: { c: 99, e: 4 },
  f: 5
};

deepMerge(obj1, obj2);
// Output: { a: 1, b: { c: 99, d: 3, e: 4 }, f: 5 }

// Multiple objects
const obj3 = { b: { d: 100 } };
deepMerge(obj1, obj2, obj3);
// Output: { a: 1, b: { c: 99, d: 100, e: 4 }, f: 5 }

// With arrays (default: replace)
const a1 = { arr: [1, 2] };
const a2 = { arr: [3, 4] };
deepMerge(a1, a2);
// Output: { arr: [3, 4] }

// With arrays (concat mode)
deepMerge(a1, a2, { arrayMerge: 'concat' });
// Output: { arr: [1, 2, 3, 4] }

// Nested complexity
const config1 = {
  server: {
    host: 'localhost',
    port: 3000,
    ssl: { enabled: false }
  },
  features: {
    auth: true
  }
};

const config2 = {
  server: {
    port: 8080,
    ssl: { enabled: true, cert: '/path/to/cert' }
  },
  features: {
    logging: true
  }
};

deepMerge(config1, config2);
/*
{
  server: {
    host: 'localhost',
    port: 8080,
    ssl: { enabled: true, cert: '/path/to/cert' }
  },
  features: {
    auth: true,
    logging: true
  }
}
*/
```

---

## Test Cases

```javascript
describe('deepMerge', () => {
  test('merges simple objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
  });

  test('merges nested objects', () => {
    const obj1 = { a: { b: 1, c: 2 } };
    const obj2 = { a: { b: 99, d: 3 } };
    expect(deepMerge(obj1, obj2)).toEqual({ a: { b: 99, c: 2, d: 3 } });
  });

  test('merges deeply nested objects', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: { d: 2 } } };
    expect(deepMerge(obj1, obj2)).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  test('merges multiple objects', () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { c: 3 };
    expect(deepMerge(obj1, obj2, obj3)).toEqual({ a: 1, b: 2, c: 3 });
  });

  test('later values override earlier values', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const obj3 = { a: 3 };
    expect(deepMerge(obj1, obj2, obj3)).toEqual({ a: 3 });
  });

  test('replaces arrays by default', () => {
    const obj1 = { arr: [1, 2] };
    const obj2 = { arr: [3, 4] };
    expect(deepMerge(obj1, obj2)).toEqual({ arr: [3, 4] });
  });

  test('handles null values', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: null };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: null });
  });

  test('handles undefined values', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: undefined };
    expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: undefined });
  });

  test('does not modify source objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const obj1Copy = JSON.parse(JSON.stringify(obj1));
    const obj2Copy = JSON.parse(JSON.stringify(obj2));

    deepMerge(obj1, obj2);

    expect(obj1).toEqual(obj1Copy);
    expect(obj2).toEqual(obj2Copy);
  });

  test('handles empty objects', () => {
    expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    expect(deepMerge({}, {})).toEqual({});
  });

  test('handles Date objects', () => {
    const date = new Date('2024-01-01');
    const obj1 = { date: new Date('2023-01-01') };
    const obj2 = { date };
    const result = deepMerge(obj1, obj2);

    expect(result.date).toEqual(date);
    expect(result.date).not.toBe(date); // Should be a clone
  });
});
```

---

## Solution 1: Basic Recursive Merge

```javascript
function deepMerge(...objects) {
  // Helper function to check if value is object
  const isObject = (obj) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  // Merge two objects
  function mergeTwo(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (isObject(sourceValue) && isObject(targetValue)) {
          // Recursively merge nested objects
          result[key] = mergeTwo(targetValue, sourceValue);
        } else {
          // Override with source value
          result[key] = sourceValue;
        }
      }
    }

    return result;
  }

  // Reduce all objects into one
  return objects.reduce((acc, obj) => mergeTwo(acc, obj), {});
}
```

**Time Complexity:** O(n × m) where n is number of objects, m is total properties
**Space Complexity:** O(d) where d is maximum depth

**Pros:**
- Simple and clean
- Handles nested objects
- Immutable (doesn't modify inputs)

**Cons:**
- Doesn't handle arrays specially
- Doesn't clone Date, RegExp
- No circular reference handling

---

## Solution 2: With Array Handling Options

```javascript
function deepMerge(...args) {
  // Extract options if last argument is options object
  let objects = args;
  let options = { arrayMerge: 'replace' }; // 'replace', 'concat', or 'merge'

  if (args.length > 0 && args[args.length - 1]?.arrayMerge) {
    options = args[args.length - 1];
    objects = args.slice(0, -1);
  }

  const isObject = (obj) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  function mergeTwo(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;

      const sourceValue = source[key];
      const targetValue = result[key];

      // Handle arrays based on option
      if (Array.isArray(sourceValue)) {
        if (options.arrayMerge === 'concat' && Array.isArray(targetValue)) {
          result[key] = [...targetValue, ...sourceValue];
        } else if (options.arrayMerge === 'merge' && Array.isArray(targetValue)) {
          // Merge by index
          result[key] = sourceValue.map((item, idx) => {
            if (isObject(item) && isObject(targetValue[idx])) {
              return mergeTwo(targetValue[idx], item);
            }
            return item;
          });
        } else {
          // Replace (default)
          result[key] = [...sourceValue];
        }
      }
      // Handle nested objects
      else if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = mergeTwo(targetValue, sourceValue);
      }
      // Primitive values, null, undefined
      else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  return objects.reduce((acc, obj) => mergeTwo(acc, obj), {});
}

// Usage
deepMerge({ arr: [1, 2] }, { arr: [3, 4] }, { arrayMerge: 'concat' });
// Output: { arr: [1, 2, 3, 4] }
```

**Time Complexity:** O(n × m)
**Space Complexity:** O(d)

**Pros:**
- Flexible array handling
- Configurable behavior
- Still immutable

**Cons:**
- More complex API
- Still missing special object handling

---

## Solution 3: Production-Ready (Complete)

```javascript
function deepMerge(...args) {
  // Parse arguments
  const objects = [];
  let options = {
    arrayMerge: 'replace', // 'replace' | 'concat' | 'merge'
    clone: true
  };

  for (const arg of args) {
    if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
      if (arg.arrayMerge || arg.clone !== undefined) {
        options = { ...options, ...arg };
      } else {
        objects.push(arg);
      }
    }
  }

  // Type checking utilities
  const isObject = (obj) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  };

  const isPlainObject = (obj) => {
    if (!isObject(obj)) return false;
    const proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
  };

  // Clone special objects
  function cloneSpecial(obj) {
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }
    if (obj instanceof Map) {
      return new Map(obj);
    }
    if (obj instanceof Set) {
      return new Set(obj);
    }
    return obj;
  }

  // Main merge function
  function mergeTwo(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;

      const sourceValue = source[key];
      const targetValue = result[key];

      // Handle special objects (Date, RegExp, etc.)
      if (sourceValue instanceof Date || sourceValue instanceof RegExp ||
          sourceValue instanceof Map || sourceValue instanceof Set) {
        result[key] = options.clone ? cloneSpecial(sourceValue) : sourceValue;
      }
      // Handle arrays
      else if (Array.isArray(sourceValue)) {
        if (options.arrayMerge === 'concat' && Array.isArray(targetValue)) {
          result[key] = options.clone
            ? [...targetValue, ...sourceValue.map(v => isObject(v) ? { ...v } : v)]
            : [...targetValue, ...sourceValue];
        } else if (options.arrayMerge === 'merge' && Array.isArray(targetValue)) {
          const maxLength = Math.max(targetValue.length, sourceValue.length);
          result[key] = Array.from({ length: maxLength }, (_, idx) => {
            if (idx >= sourceValue.length) return targetValue[idx];
            if (idx >= targetValue.length) return sourceValue[idx];

            if (isPlainObject(sourceValue[idx]) && isPlainObject(targetValue[idx])) {
              return mergeTwo(targetValue[idx], sourceValue[idx]);
            }
            return sourceValue[idx];
          });
        } else {
          // Replace (default)
          result[key] = options.clone ? [...sourceValue] : sourceValue;
        }
      }
      // Handle plain objects
      else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = mergeTwo(targetValue, sourceValue);
      }
      // Primitive values, null, undefined
      else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  // Merge all objects
  return objects.reduce((acc, obj) => {
    if (!isObject(obj)) {
      throw new TypeError('All arguments must be objects');
    }
    return mergeTwo(acc, obj);
  }, {});
}

// Usage examples
deepMerge(obj1, obj2, { arrayMerge: 'concat', clone: true });
```

**Time Complexity:** O(n × m)
**Space Complexity:** O(d)

**Pros:**
- ✅ Handles all data types
- ✅ Configurable array merging
- ✅ Clones special objects
- ✅ Input validation
- ✅ Production-ready
- ✅ Immutable by default

**Cons:**
- More complex code
- Larger bundle size

---

## Common Mistakes

### ❌ Mistake 1: Shallow merge instead of deep

```javascript
// Wrong - only merges first level
function deepMerge(obj1, obj2) {
  return { ...obj1, ...obj2 }; // Shallow!
}

const obj1 = { a: { b: 1 } };
const obj2 = { a: { c: 2 } };
deepMerge(obj1, obj2);
// Output: { a: { c: 2 } } - Lost obj1.a.b!
// Expected: { a: { b: 1, c: 2 } }
```

### ❌ Mistake 2: Mutating source objects

```javascript
// Wrong - modifies obj1
function deepMerge(obj1, obj2) {
  for (const key in obj2) {
    if (typeof obj2[key] === 'object') {
      obj1[key] = obj1[key] || {};
      deepMerge(obj1[key], obj2[key]); // Mutates obj1!
    } else {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}
```

### ✅ Correct: Create new object

```javascript
function deepMerge(obj1, obj2) {
  const result = { ...obj1 }; // New object
  // ... merge into result
  return result;
}
```

### ❌ Mistake 3: Not handling null properly

```javascript
// Wrong - null is typeof 'object'
function deepMerge(obj1, obj2) {
  const result = {};

  for (const key in obj2) {
    if (typeof obj2[key] === 'object') {
      // This includes null! Will cause error
      result[key] = deepMerge(obj1[key] || {}, obj2[key]);
    } else {
      result[key] = obj2[key];
    }
  }

  return result;
}

deepMerge({ a: 1 }, { a: null }); // Error!
```

### ✅ Correct: Check for null

```javascript
if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
  // Safe to merge
}
```

---

## Edge Cases

1. **Circular references** - Need WeakMap tracking
2. **Prototype chain** - Should preserve or flatten?
3. **Symbol keys** - Use Reflect.ownKeys()
4. **Non-enumerable properties** - Usually skip
5. **Getters/setters** - May trigger side effects
6. **Class instances** - Merge or replace?

---

## Practical Example: Configuration Merging

```javascript
// Real-world: Merge app config with environment overrides
const defaultConfig = {
  server: {
    host: 'localhost',
    port: 3000,
    ssl: {
      enabled: false,
      cert: null,
      key: null
    },
    cors: {
      enabled: true,
      origins: ['http://localhost:3000']
    }
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp',
    pool: {
      min: 2,
      max: 10
    }
  },
  features: {
    auth: true,
    logging: true,
    metrics: false
  }
};

const productionConfig = {
  server: {
    host: '0.0.0.0',
    port: 8080,
    ssl: {
      enabled: true,
      cert: '/etc/ssl/cert.pem',
      key: '/etc/ssl/key.pem'
    },
    cors: {
      origins: ['https://example.com']
    }
  },
  database: {
    host: 'db.example.com',
    pool: {
      max: 50
    }
  },
  features: {
    metrics: true
  }
};

const finalConfig = deepMerge(defaultConfig, productionConfig);
console.log(finalConfig);
/*
{
  server: {
    host: '0.0.0.0',
    port: 8080,
    ssl: {
      enabled: true,
      cert: '/etc/ssl/cert.pem',
      key: '/etc/ssl/key.pem'
    },
    cors: {
      enabled: true,
      origins: ['https://example.com']
    }
  },
  database: {
    host: 'db.example.com',
    port: 5432,
    name: 'myapp',
    pool: {
      min: 2,
      max: 50
    }
  },
  features: {
    auth: true,
    logging: true,
    metrics: true
  }
}
*/
```

---

## Practical Example: Redux State Update

```javascript
// Redux-style state merging
const currentState = {
  user: {
    id: 1,
    profile: {
      name: 'John',
      email: 'john@example.com'
    },
    preferences: {
      theme: 'dark',
      notifications: true
    }
  },
  ui: {
    sidebar: { open: true },
    modal: { visible: false }
  }
};

const stateUpdate = {
  user: {
    profile: {
      name: 'John Doe' // Update name only
    }
  },
  ui: {
    modal: { visible: true, content: 'Welcome!' }
  }
};

const newState = deepMerge(currentState, stateUpdate);
// user.profile.email is preserved
// ui.sidebar is preserved
// user.profile.name and ui.modal are updated
```

---

## Performance Comparison

```javascript
const obj1 = { /* 1000 nested properties */ };
const obj2 = { /* 1000 nested properties */ };

console.time('deepMerge (recursive)');
deepMerge(obj1, obj2);
console.timeEnd('deepMerge (recursive)'); // ~3ms

console.time('Lodash merge');
_.merge({}, obj1, obj2);
console.timeEnd('Lodash merge'); // ~2ms (optimized)

console.time('Shallow spread');
const result = { ...obj1, ...obj2 };
console.timeEnd('Shallow spread'); // ~0.1ms (but incorrect for nested)
```

---

## Follow-up Questions

1. **"How would you handle circular references?"**
   - Track visited objects in WeakMap
   - Detect cycle and either throw or skip
   - Similar to deep clone circular handling

2. **"What about merging class instances?"**
   - Usually replace, not merge
   - Can add custom merge logic per class
   - Use `instanceof` checks

3. **"Should array merging be by index or concatenation?"**
   - Depends on use case
   - Config: usually replace
   - Collections: often concat
   - Make it configurable

4. **"How to optimize for performance?"**
   - Avoid unnecessary cloning
   - Use Object.assign for shallow levels
   - Consider if deep merge is needed

5. **"What's the difference from Object.assign()?"**
   - Object.assign is shallow
   - deepMerge is recursive
   - deepMerge handles nested objects

---

## Resources

- [Lodash merge](https://lodash.com/docs/4.17.15#merge)
- [MDN: Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Deep Merge Algorithm Explained](https://www.npmjs.com/package/deepmerge)

---

[← Back: Object Flatten](./object-flatten.md) | [JavaScript Fundamentals](./README.md) | [Next: Object Group By →](./object-group-by.md)
