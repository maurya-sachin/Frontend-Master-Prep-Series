# Flatten Nested Array

## Problem Statement

Implement a function to flatten a deeply nested array into a single-level array. The function should handle arrays nested to any depth.

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 15-20 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb, LinkedIn

## Requirements

- [ ] Flatten array of any depth
- [ ] Handle mixed types (numbers, strings, objects, etc.)
- [ ] Support optional depth parameter
- [ ] Handle empty arrays
- [ ] Don't modify the original array
- [ ] Handle edge cases (null, undefined, non-arrays)

## Example Usage

```javascript
// Basic flattening
flatten([1, [2, 3], [4, [5, 6]]]);
// Output: [1, 2, 3, 4, 5, 6]

// Deep nesting
flatten([1, [2, [3, [4, [5]]]]]);
// Output: [1, 2, 3, 4, 5]

// Mixed types
flatten([1, 'a', [2, 'b', [3, 'c']]]);
// Output: [1, 'a', 2, 'b', 3, 'c']

// With depth parameter
flatten([1, [2, [3, [4]]]], 1);
// Output: [1, 2, [3, [4]]]

flatten([1, [2, [3, [4]]]], 2);
// Output: [1, 2, 3, [4]]

// Empty arrays
flatten([1, [], [2, [[], 3]]]);
// Output: [1, 2, 3]

// Objects and arrays
flatten([1, { a: 1 }, [2, [{ b: 2 }]]]);
// Output: [1, { a: 1 }, 2, { b: 2 }]
```

## Test Cases

```javascript
describe('flatten', () => {
  test('flattens simple nested array', () => {
    expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  });

  test('flattens deeply nested array', () => {
    expect(flatten([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles empty arrays', () => {
    expect(flatten([1, [], [2, [[]], 3]])).toEqual([1, 2, 3]);
  });

  test('handles mixed types', () => {
    const input = [1, 'a', [2, 'b', [true, { key: 'value' }]]];
    const expected = [1, 'a', 2, 'b', true, { key: 'value' }];
    expect(flatten(input)).toEqual(expected);
  });

  test('respects depth parameter', () => {
    expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);
    expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
  });

  test('returns empty array for empty input', () => {
    expect(flatten([])).toEqual([]);
  });

  test('returns shallow copy for non-nested array', () => {
    const input = [1, 2, 3];
    const output = flatten(input);
    expect(output).toEqual([1, 2, 3]);
    expect(output).not.toBe(input);
  });

  test('does not modify original array', () => {
    const input = [1, [2, [3]]];
    const inputCopy = JSON.parse(JSON.stringify(input));
    flatten(input);
    expect(input).toEqual(inputCopy);
  });
});
```

## Solution 1: Recursive Approach

```javascript
function flatten(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }

  return result;
}
```

**Time Complexity:** O(n) where n is total number of elements
**Space Complexity:** O(d) where d is maximum depth (recursion stack)

## Solution 2: With Depth Parameter

```javascript
function flatten(arr, depth = Infinity) {
  if (depth === 0) {
    return arr.slice(); // Return shallow copy
  }

  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

// Usage
flatten([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
```

## Solution 3: Using reduce()

```javascript
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item) && depth > 0) {
      return acc.concat(flatten(item, depth - 1));
    }
    return acc.concat(item);
  }, []);
}
```

## Solution 4: Iterative with Stack

```javascript
function flatten(arr) {
  const stack = [...arr];
  const result = [];

  while (stack.length) {
    const item = stack.pop();

    if (Array.isArray(item)) {
      stack.push(...item); // Add array items back to stack
    } else {
      result.unshift(item); // Add to front to maintain order
    }
  }

  return result;
}
```

## Solution 5: Using Generator

```javascript
function* flattenGenerator(arr, depth = Infinity) {
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      yield* flattenGenerator(item, depth - 1);
    } else {
      yield item;
    }
  }
}

function flatten(arr, depth = Infinity) {
  return [...flattenGenerator(arr, depth)];
}
```

## Solution 6: One-liner using flat()

```javascript
// Using ES2019 Array.prototype.flat()
function flatten(arr, depth = Infinity) {
  return arr.flat(depth);
}

// Polyfill for flat() if needed
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth = 1) {
    const result = [];

    const flattenHelper = (arr, currentDepth) => {
      for (const item of arr) {
        if (Array.isArray(item) && currentDepth > 0) {
          flattenHelper(item, currentDepth - 1);
        } else {
          result.push(item);
        }
      }
    };

    flattenHelper(this, depth);
    return result;
  };
}
```

## Solution 7: Production-Ready with Error Handling

```javascript
function flatten(arr, depth = Infinity) {
  // Input validation
  if (!Array.isArray(arr)) {
    throw new TypeError('First argument must be an array');
  }

  if (typeof depth !== 'number' || depth < 0) {
    throw new TypeError('Depth must be a non-negative number');
  }

  // Base case
  if (depth === 0) {
    return arr.slice();
  }

  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      // Recursively flatten
      const flattened = flatten(item, depth - 1);
      result.push(...flattened);
    } else {
      result.push(item);
    }
  }

  return result;
}
```

## Solution 8: TypeScript Version

```typescript
type NestedArray<T> = Array<T | NestedArray<T>>;

function flatten<T>(arr: NestedArray<T>, depth: number = Infinity): T[] {
  if (!Array.isArray(arr)) {
    throw new TypeError('First argument must be an array');
  }

  if (typeof depth !== 'number' || depth < 0 || !Number.isFinite(depth)) {
    throw new TypeError('Depth must be a non-negative finite number');
  }

  if (depth === 0) {
    return arr.slice() as T[];
  }

  const result: T[] = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item as NestedArray<T>, depth - 1));
    } else {
      result.push(item as T);
    }
  }

  return result;
}

// Usage with type safety
const numbers: NestedArray<number> = [1, [2, [3, [4]]]];
const flattened: number[] = flatten(numbers); // [1, 2, 3, 4]
```

## Common Mistakes

❌ **Mistake 1:** Mutating the original array
```javascript
// Wrong - modifies input
function flatten(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      arr.splice(i, 1, ...arr[i]); // Modifies arr!
    }
  }
  return arr;
}
```

❌ **Mistake 2:** Not handling depth correctly
```javascript
// Wrong - infinite recursion with depth
function flatten(arr, depth = Infinity) {
  if (depth < 0) return arr; // Should be depth === 0 or depth <= 0

  return arr.reduce((acc, item) =>
    Array.isArray(item)
      ? acc.concat(flatten(item, depth)) // Forgot to decrement depth!
      : acc.concat(item),
    []
  );
}
```

❌ **Mistake 3:** Inefficient string concatenation
```javascript
// Wrong - very slow for large arrays
function flatten(arr) {
  return JSON.parse('[' + JSON.stringify(arr).replace(/\[|\]/g, '') + ']');
}
```

✅ **Correct:** Use proper recursion with depth parameter and don't mutate

## Real-World Applications

1. **Flattening nested menu structures**
```javascript
const menu = [
  { id: 1, name: 'Home' },
  {
    id: 2,
    name: 'Products',
    children: [
      { id: 3, name: 'Electronics' },
      {
        id: 4,
        name: 'Computers',
        children: [
          { id: 5, name: 'Laptops' },
          { id: 6, name: 'Desktops' }
        ]
      }
    ]
  }
];

function flattenMenu(items) {
  return flatten(
    items.map(item => [item, ...(item.children || [])])
  ).filter(item => !item.children);
}
```

2. **Flattening tree structures**
```javascript
function flattenTree(node) {
  if (!node) return [];

  const children = node.children || [];
  return [node, ...flatten(children.map(flattenTree))];
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3 }
  ]
};

flattenTree(tree); // [{ value: 1, ... }, { value: 2, ... }, ...]
```

3. **Processing nested API responses**
```javascript
const apiResponse = {
  users: [
    { id: 1, posts: [{ id: 1 }, { id: 2 }] },
    { id: 2, posts: [{ id: 3 }] }
  ]
};

const allPosts = flatten(apiResponse.users.map(user => user.posts));
```

## Follow-up Questions

1. **How would you flatten an object with nested properties?**
```javascript
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }

    return acc;
  }, {});
}

flattenObject({ a: { b: { c: 1 } } }); // { 'a.b.c': 1 }
```

2. **What's the difference between your solution and Array.prototype.flat()?**
   - Native `flat()` is optimized and faster
   - Your implementation gives more control and understanding
   - Polyfill needed for older browsers

3. **How would you unflatten an array back to nested structure?**
   - Requires metadata about original structure
   - Can use depth information or markers

4. **How does this perform with very deep nesting?**
   - Recursive solution may hit call stack limit (~10,000 deep)
   - Iterative solution with stack is safer
   - Generator solution is memory-efficient

## Performance Comparison

```javascript
// Benchmark different approaches
const deepArray = [1, [2, [3, [4, [5, [6, [7, [8, [9, [10]]]]]]]]]]];

console.time('Recursive');
flattenRecursive(deepArray);
console.timeEnd('Recursive'); // ~0.1ms

console.time('Iterative');
flattenIterative(deepArray);
console.timeEnd('Iterative'); // ~0.15ms

console.time('Native flat()');
deepArray.flat(Infinity);
console.timeEnd('Native flat()'); // ~0.05ms (fastest)
```

## Edge Cases to Handle

1. Sparse arrays: `[1, , 3]`
2. null/undefined values
3. Circular references (advanced)
4. Very deep nesting (stack overflow)
5. Non-array iterables

## Resources

- [MDN: Array.prototype.flat()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
- [MDN: Array.prototype.flatMap()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
- [TC39 Proposal: Array.prototype.flat](https://github.com/tc39/proposal-flatMap)

---

[← Back to JavaScript Fundamentals](./README.md) | [Next Problem →](./curry-function.md)
