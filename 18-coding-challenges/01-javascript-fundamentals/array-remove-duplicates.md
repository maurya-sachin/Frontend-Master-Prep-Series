# Array Remove Duplicates

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Amazon, Microsoft, Meta, Apple, Netflix
**Time:** 20 minutes

---

## Problem Statement

Remove duplicate elements from an array. Return a new array with unique values, preserving the original order (or modify in-place for certain variations).

### Requirements

- ✅ Remove all duplicate values
- ✅ Preserve order of first occurrence
- ✅ Handle primitive types (numbers, strings, booleans)
- ✅ Optionally handle objects/arrays
- ✅ Support both in-place and new array approaches

### Examples

```javascript
Input: [1, 2, 2, 3, 4, 4, 5]
Output: [1, 2, 3, 4, 5]

Input: ['a', 'b', 'a', 'c', 'b']
Output: ['a', 'b', 'c']

Input: [1, 1, 1, 1]
Output: [1]

Input: []
Output: []
```

---

## Solution

### Approach 1: Using Set (Best for Primitives) ✅

```javascript
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

// Or using Array.from
function removeDuplicates(arr) {
  return Array.from(new Set(arr));
}

// Usage
removeDuplicates([1, 2, 2, 3, 4, 4, 5]);  // [1, 2, 3, 4, 5]
removeDuplicates(['a', 'b', 'a', 'c']);   // ['a', 'b', 'c']
```

**How it works:**
1. `Set` automatically removes duplicates
2. Spread operator or `Array.from` converts back to array
3. Order is preserved (insertion order)

**Pros:**
- Simplest and cleanest
- O(n) time complexity
- Built-in, no manual logic

**Cons:**
- Doesn't work for objects (reference comparison)
- Creates new array (memory overhead)

**Complexity:**
- Time: O(n)
- Space: O(n)

---

### Approach 2: Using filter() + indexOf()

```javascript
function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// Usage
removeDuplicates([1, 2, 2, 3, 4, 4, 5]);  // [1, 2, 3, 4, 5]
```

**How it works:**
1. For each element, check if its first occurrence index equals current index
2. Keep only first occurrences

**Complexity:**
- Time: O(n²) - indexOf is O(n) inside filter
- Space: O(n)

**Note:** Not recommended for large arrays due to O(n²).

---

### Approach 3: Using reduce() + includes()

```javascript
function removeDuplicates(arr) {
  return arr.reduce((unique, item) => {
    return unique.includes(item) ? unique : [...unique, item];
  }, []);
}

// More efficient with mutation
function removeDuplicates(arr) {
  return arr.reduce((unique, item) => {
    if (!unique.includes(item)) {
      unique.push(item);
    }
    return unique;
  }, []);
}

// Usage
removeDuplicates([1, 2, 2, 3, 4, 4, 5]);  // [1, 2, 3, 4, 5]
```

**Complexity:**
- Time: O(n²) - includes is O(n)
- Space: O(n)

---

### Approach 4: Using Map/Object for O(n)

```javascript
function removeDuplicates(arr) {
  const seen = new Map();
  const result = [];

  for (const item of arr) {
    if (!seen.has(item)) {
      seen.set(item, true);
      result.push(item);
    }
  }

  return result;
}

// Or using object (for primitives only)
function removeDuplicates(arr) {
  const seen = {};
  const result = [];

  for (const item of arr) {
    if (!seen[item]) {
      seen[item] = true;
      result.push(item);
    }
  }

  return result;
}

// Usage
removeDuplicates([1, 2, 2, 3, 4, 4, 5]);  // [1, 2, 3, 4, 5]
```

**Complexity:**
- Time: O(n)
- Space: O(n)

---

### Approach 5: In-Place (Two-Pointer) for Sorted Arrays

```javascript
function removeDuplicatesInPlace(arr) {
  if (arr.length === 0) return 0;

  let writeIndex = 1;

  for (let readIndex = 1; readIndex < arr.length; readIndex++) {
    if (arr[readIndex] !== arr[readIndex - 1]) {
      arr[writeIndex] = arr[readIndex];
      writeIndex++;
    }
  }

  // Trim array to unique length
  arr.length = writeIndex;
  return arr;
}

// Usage
const sorted = [1, 1, 2, 2, 3, 4, 4, 5];
removeDuplicatesInPlace(sorted);  // [1, 2, 3, 4, 5]
console.log(sorted);               // [1, 2, 3, 4, 5]
```

**Complexity:**
- Time: O(n)
- Space: O(1) - in-place

**Note:** Only works on sorted arrays.

---

### Approach 6: For Objects/Arrays (Deep Comparison)

```javascript
function removeDuplicatesDeep(arr) {
  const seen = new Set();
  const result = [];

  for (const item of arr) {
    const key = JSON.stringify(item);

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

// Usage
const arr = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 1, name: 'John' }  // Duplicate
];

removeDuplicatesDeep(arr);
// [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
```

**Complexity:**
- Time: O(n × m) where m is object size
- Space: O(n)

**Limitations:**
- Loses functions, undefined, Symbol
- Property order matters
- Slower than primitive comparison

---

### Approach 7: Production-Ready (With Options)

```javascript
function removeDuplicates(arr, options = {}) {
  const {
    key = null,        // Extract key for objects
    mutate = false,    // In-place modification
    compareDeep = false // Deep object comparison
  } = options;

  // Input validation
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }

  // Handle empty or single element
  if (arr.length <= 1) {
    return mutate ? arr : [...arr];
  }

  // If mutate and sorted, use two-pointer
  if (mutate && isSorted(arr)) {
    return removeDuplicatesInPlace(arr);
  }

  // Handle objects with key extractor
  if (key) {
    const seen = new Set();
    const result = [];

    for (const item of arr) {
      const keyValue = typeof key === 'function' ? key(item) : item[key];

      if (!seen.has(keyValue)) {
        seen.add(keyValue);
        result.push(item);
      }
    }

    if (mutate) {
      arr.length = 0;
      arr.push(...result);
      return arr;
    }
    return result;
  }

  // Handle deep comparison
  if (compareDeep) {
    return removeDuplicatesDeep(arr);
  }

  // Default: Set for primitives
  const result = [...new Set(arr)];

  if (mutate) {
    arr.length = 0;
    arr.push(...result);
    return arr;
  }

  return result;
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

// Usage examples
removeDuplicates([1, 2, 2, 3]);
// [1, 2, 3]

removeDuplicates(
  [{ id: 1 }, { id: 2 }, { id: 1 }],
  { key: 'id' }
);
// [{ id: 1 }, { id: 2 }]

removeDuplicates(
  [{ id: 1 }, { id: 2 }, { id: 1 }],
  { key: obj => obj.id }
);
// [{ id: 1 }, { id: 2 }]
```

---

## Test Cases

```javascript
describe('removeDuplicates', () => {
  test('removes duplicates from number array', () => {
    expect(removeDuplicates([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  test('removes duplicates from string array', () => {
    expect(removeDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  test('preserves order of first occurrence', () => {
    expect(removeDuplicates([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });

  test('handles all duplicates', () => {
    expect(removeDuplicates([1, 1, 1, 1])).toEqual([1]);
  });

  test('handles no duplicates', () => {
    expect(removeDuplicates([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  test('handles empty array', () => {
    expect(removeDuplicates([])).toEqual([]);
  });

  test('handles single element', () => {
    expect(removeDuplicates([1])).toEqual([1]);
  });

  test('handles mixed types', () => {
    expect(removeDuplicates([1, '1', 1, '1', true])).toEqual([1, '1', true]);
  });

  test('handles null and undefined', () => {
    expect(removeDuplicates([null, undefined, null, undefined])).toEqual([null, undefined]);
  });

  test('handles NaN correctly', () => {
    expect(removeDuplicates([NaN, NaN, 1, 2])).toEqual([NaN, 1, 2]);
  });

  test('does not mutate original (default)', () => {
    const original = [1, 2, 2, 3];
    const result = removeDuplicates(original);

    expect(result).toEqual([1, 2, 3]);
    expect(original).toEqual([1, 2, 2, 3]);
  });

  test('removes duplicates by key', () => {
    const arr = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 1, name: 'Jack' }
    ];

    expect(removeDuplicates(arr, { key: 'id' })).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });

  test('handles large arrays efficiently', () => {
    const large = Array.from({ length: 100000 }, (_, i) => i % 1000);
    const start = Date.now();
    const result = removeDuplicates(large);
    const duration = Date.now() - start;

    expect(result.length).toBe(1000);
    expect(duration).toBeLessThan(100);
  });
});
```

---

## Real-World Use Cases

### 1. Remove Duplicate User IDs

```javascript
function getUniqueUsers(users) {
  return removeDuplicates(users, { key: 'id' });
}

const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
  { id: 1, name: 'John Doe', email: 'john@example.com' }  // Duplicate ID
];

getUniqueUsers(users);
// [{ id: 1, ... }, { id: 2, ... }]
```

### 2. Unique Tags/Categories

```javascript
function getUniqueTags(posts) {
  const allTags = posts.flatMap(post => post.tags);
  return removeDuplicates(allTags);
}

const posts = [
  { id: 1, tags: ['javascript', 'react', 'web'] },
  { id: 2, tags: ['react', 'typescript', 'web'] },
  { id: 3, tags: ['javascript', 'node', 'backend'] }
];

getUniqueTags(posts);
// ['javascript', 'react', 'web', 'typescript', 'node', 'backend']
```

### 3. Autocomplete Suggestions

```javascript
function getSearchSuggestions(query, history, maxResults = 5) {
  const suggestions = history.filter(item =>
    item.toLowerCase().startsWith(query.toLowerCase())
  );

  return removeDuplicates(suggestions).slice(0, maxResults);
}

const searchHistory = [
  'javascript array',
  'javascript object',
  'javascript array methods',
  'javascript array',  // Duplicate
  'java tutorial'
];

getSearchSuggestions('java', searchHistory);
// ['javascript array', 'javascript object', 'javascript array methods', 'java tutorial']
```

### 4. Merge Arrays Without Duplicates

```javascript
function mergeUnique(...arrays) {
  return removeDuplicates(arrays.flat());
}

const arr1 = [1, 2, 3];
const arr2 = [3, 4, 5];
const arr3 = [5, 6, 7];

mergeUnique(arr1, arr2, arr3);
// [1, 2, 3, 4, 5, 6, 7]
```

### 5. Email List Deduplication

```javascript
function deduplicateEmails(emails) {
  return removeDuplicates(
    emails.map(email => email.toLowerCase().trim())
  );
}

const emailList = [
  'john@example.com',
  'JOHN@example.com ',
  'jane@example.com',
  'john@example.com'
];

deduplicateEmails(emailList);
// ['john@example.com', 'jane@example.com']
```

### 6. Shopping Cart Unique Products

```javascript
function mergeCartItems(items) {
  const uniqueItems = removeDuplicates(items, { key: 'productId' });

  // Aggregate quantities for duplicates
  return items.reduce((cart, item) => {
    const existing = cart.find(i => i.productId === item.productId);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({ ...item });
    }

    return cart;
  }, []);
}
```

---

## Common Mistakes

### ❌ Using indexOf in Large Arrays

```javascript
// WRONG: O(n²) complexity
function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// For large arrays (10000+ elements), this is very slow
```

### ❌ Not Handling NaN Correctly

```javascript
// WRONG: NaN !== NaN in JavaScript
const arr = [NaN, NaN, 1, 2];
[...new Set(arr)];  // [NaN, 1, 2] ✅ Set handles this correctly

arr.filter((item, index) => arr.indexOf(item) === index);
// [NaN, NaN, 1, 2] ❌ indexOf can't find NaN
```

### ❌ Object Comparison by Reference

```javascript
// WRONG: Objects compared by reference
const arr = [{ id: 1 }, { id: 1 }];
[...new Set(arr)];  // [{ id: 1 }, { id: 1 }] - Still duplicates!

// CORRECT: Use key or deep comparison
removeDuplicates(arr, { key: 'id' });
```

### ❌ Mutating Unexpectedly

```javascript
// WRONG: Modifies original array
function removeDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) !== i) {
      arr.splice(i, 1);
      i--;  // Adjust index after removal
    }
  }
  return arr;
}
```

### ✅ Correct Approaches

```javascript
// CORRECT: Set for primitives (O(n))
const unique = [...new Set(arr)];

// CORRECT: Map for O(n) with custom logic
function removeDuplicates(arr) {
  const seen = new Map();
  return arr.filter(item => {
    if (seen.has(item)) return false;
    seen.set(item, true);
    return true;
  });
}

// CORRECT: Key-based deduplication for objects
removeDuplicates(arr, { key: 'id' });
```

---

## Performance Comparison

```javascript
function benchmark(fn, arr, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn([...arr]);
  }
  return (performance.now() - start) / iterations;
}

const testArray = Array.from({ length: 1000 }, (_, i) => i % 100);

console.log('Set:', benchmark(arr => [...new Set(arr)], testArray));
// ~0.015ms - FASTEST

console.log('Map:', benchmark(removeDuplicatesMap, testArray));
// ~0.025ms

console.log('filter + indexOf:', benchmark(removeDuplicatesFilter, testArray));
// ~2.5ms - SLOWEST (O(n²))

console.log('reduce + includes:', benchmark(removeDuplicatesReduce, testArray));
// ~2.0ms
```

**Winner:** `Set` is fastest for primitive deduplication.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Set | **O(n)** | O(n) | **Best for primitives** |
| Map/Object | O(n) | O(n) | Good for custom logic |
| filter + indexOf | O(n²) | O(n) | Avoid for large arrays |
| reduce + includes | O(n²) | O(n) | Avoid for large arrays |
| Two-pointer (sorted) | O(n) | O(1) | In-place, sorted only |
| JSON stringify | O(n × m) | O(n) | Deep comparison |

---

## Follow-up Questions

**Q1: How to find duplicate elements (not remove)?**
```javascript
const duplicates = arr.filter((item, index) => arr.indexOf(item) !== index);
```

**Q2: How to count occurrences?**
```javascript
const counts = arr.reduce((acc, val) => {
  acc[val] = (acc[val] || 0) + 1;
  return acc;
}, {});
```

**Q3: How to remove duplicates from 2D array?**
```javascript
const unique = removeDuplicates(arr2D, { compareDeep: true });
```

**Q4: How to deduplicate case-insensitively?**
```javascript
removeDuplicates(arr.map(s => s.toLowerCase()));
```

**Q5: In-place removal without sorting?**
```javascript
// Use Set, then clear and repopulate original array
```

---

## Related Problems

- **Find Duplicates** - Return duplicate elements
- **Intersection of Arrays** - Common elements
- **Union of Arrays** - Merge without duplicates
- **Symmetric Difference** - Elements in either, not both
- **Longest Consecutive Sequence** - Requires deduplication
- **Group Anagrams** - Deduplication by pattern

---

## Resources

- [MDN - Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [LeetCode #26 - Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [Hash Tables Explained](https://www.bigocheatsheet.com/)

---

[← Back to JavaScript Fundamentals](./README.md)
