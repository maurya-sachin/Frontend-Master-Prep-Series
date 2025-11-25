# Array Reverse

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Companies:** Amazon, Microsoft, Google, Meta, Apple
**Time:** 15 minutes

---

## Problem Statement

Reverse an array in-place or create a new reversed array. Implement multiple approaches including iterative, recursive, and built-in methods.

### Requirements

- ✅ Reverse the order of elements
- ✅ Support both in-place and new array approaches
- ✅ Handle empty arrays
- ✅ Handle single-element arrays
- ✅ Preserve original data types

### Examples

```javascript
Input: [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]

Input: ['a', 'b', 'c']
Output: ['c', 'b', 'a']

Input: []
Output: []

Input: [1]
Output: [1]
```

---

## Solution

### Approach 1: Built-in reverse() - Mutates Original ⚠️

```javascript
function reverseArray(arr) {
  return arr.reverse();
}

// Usage
const nums = [1, 2, 3, 4, 5];
reverseArray(nums); // [5, 4, 3, 2, 1]
console.log(nums);  // [5, 4, 3, 2, 1] - MUTATED!
```

**Pros:**
- Simple one-liner
- Built-in and optimized
- Fast

**Cons:**
- **Mutates original array** (side effect)
- Not suitable when original must be preserved

**Complexity:**
- Time: O(n)
- Space: O(1)

---

### Approach 2: New Array (Non-Mutating) ✅

```javascript
function reverseArray(arr) {
  const result = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }

  return result;
}

// Usage
const nums = [1, 2, 3, 4, 5];
const reversed = reverseArray(nums); // [5, 4, 3, 2, 1]
console.log(nums);                   // [1, 2, 3, 4, 5] - UNCHANGED
```

**Complexity:**
- Time: O(n)
- Space: O(n) - new array created

---

### Approach 3: In-Place Two-Pointer Swap ✅

```javascript
function reverseInPlace(arr) {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    // Swap elements
    [arr[left], arr[right]] = [arr[right], arr[left]];

    left++;
    right--;
  }

  return arr;
}

// Usage
const nums = [1, 2, 3, 4, 5];
reverseInPlace(nums); // [5, 4, 3, 2, 1]
console.log(nums);    // [5, 4, 3, 2, 1] - MUTATED
```

**How it works:**
1. Two pointers: start and end
2. Swap elements at pointers
3. Move pointers toward center
4. Stop when pointers meet

**Complexity:**
- Time: O(n/2) → O(n)
- Space: O(1) - in-place

---

### Approach 4: Using Spread + reverse() (Non-Mutating)

```javascript
function reverseArray(arr) {
  return [...arr].reverse();
}

// Or using slice
function reverseArray(arr) {
  return arr.slice().reverse();
}

// Usage
const nums = [1, 2, 3, 4, 5];
const reversed = reverseArray(nums); // [5, 4, 3, 2, 1]
console.log(nums);                   // [1, 2, 3, 4, 5] - UNCHANGED
```

**Complexity:**
- Time: O(n) - copy + reverse
- Space: O(n) - new array

---

### Approach 5: Recursive Solution

```javascript
function reverseRecursive(arr, start = 0, end = arr.length - 1) {
  // Base case
  if (start >= end) {
    return arr;
  }

  // Swap
  [arr[start], arr[end]] = [arr[end], arr[start]];

  // Recursive call
  return reverseRecursive(arr, start + 1, end - 1);
}

// Usage
const nums = [1, 2, 3, 4, 5];
reverseRecursive(nums); // [5, 4, 3, 2, 1]
```

**Complexity:**
- Time: O(n)
- Space: O(n) - recursion stack

---

### Approach 6: Using reduceRight

```javascript
function reverseArray(arr) {
  return arr.reduceRight((acc, val) => {
    acc.push(val);
    return acc;
  }, []);
}

// Or simply
function reverseArray(arr) {
  return arr.reduceRight((acc, val) => [...acc, val], []);
}

// Usage
reverseArray([1, 2, 3, 4, 5]); // [5, 4, 3, 2, 1]
```

---

### Approach 7: Production-Ready (With Validation)

```javascript
function reverseArray(arr, { mutate = false } = {}) {
  // Input validation
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }

  // Handle empty or single element
  if (arr.length <= 1) {
    return mutate ? arr : [...arr];
  }

  // Choose strategy based on mutate flag
  if (mutate) {
    // In-place reversal
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
      [arr[left], arr[right]] = [arr[right], arr[left]];
      left++;
      right--;
    }

    return arr;
  } else {
    // Non-mutating reversal
    return [...arr].reverse();
  }
}

// Usage
const nums = [1, 2, 3, 4, 5];

// Non-mutating (default)
const reversed1 = reverseArray(nums);
// nums: [1, 2, 3, 4, 5], reversed1: [5, 4, 3, 2, 1]

// Mutating
const reversed2 = reverseArray(nums, { mutate: true });
// nums: [5, 4, 3, 2, 1], reversed2: [5, 4, 3, 2, 1]
```

---

## Test Cases

```javascript
describe('reverseArray', () => {
  test('reverses array of numbers', () => {
    expect(reverseArray([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
  });

  test('reverses array of strings', () => {
    expect(reverseArray(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
  });

  test('handles empty array', () => {
    expect(reverseArray([])).toEqual([]);
  });

  test('handles single element', () => {
    expect(reverseArray([1])).toEqual([1]);
  });

  test('handles two elements', () => {
    expect(reverseArray([1, 2])).toEqual([2, 1]);
  });

  test('handles mixed types', () => {
    expect(reverseArray([1, 'a', true, null])).toEqual([null, true, 'a', 1]);
  });

  test('handles nested arrays', () => {
    expect(reverseArray([[1, 2], [3, 4], [5, 6]])).toEqual([[5, 6], [3, 4], [1, 2]]);
  });

  test('does not mutate original (default)', () => {
    const original = [1, 2, 3];
    const reversed = reverseArray(original);

    expect(reversed).toEqual([3, 2, 1]);
    expect(original).toEqual([1, 2, 3]);
  });

  test('mutates when mutate flag is true', () => {
    const original = [1, 2, 3];
    const reversed = reverseArray(original, { mutate: true });

    expect(reversed).toEqual([3, 2, 1]);
    expect(original).toEqual([3, 2, 1]);
  });

  test('throws error for non-array input', () => {
    expect(() => reverseArray(123)).toThrow(TypeError);
    expect(() => reverseArray('abc')).toThrow(TypeError);
    expect(() => reverseArray(null)).toThrow(TypeError);
  });

  test('handles large arrays efficiently', () => {
    const large = Array.from({ length: 100000 }, (_, i) => i);
    const start = Date.now();
    reverseArray(large);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

---

## Real-World Use Cases

### 1. Reverse String (Interview Classic)

```javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}

// Or without built-in reverse
function reverseString(str) {
  const chars = str.split('');
  let left = 0;
  let right = chars.length - 1;

  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }

  return chars.join('');
}

reverseString('hello'); // 'olleh'
```

### 2. Undo/Redo Stack

```javascript
class UndoManager {
  constructor() {
    this.history = [];
    this.future = [];
  }

  do(action) {
    this.history.push(action);
    this.future = []; // Clear redo stack
    action.execute();
  }

  undo() {
    if (this.history.length === 0) return;

    const action = this.history.pop();
    this.future.push(action);
    action.undo();
  }

  redo() {
    if (this.future.length === 0) return;

    const action = this.future.pop();
    this.history.push(action);
    action.execute();
  }

  getHistory() {
    return [...this.history].reverse(); // Most recent first
  }
}
```

### 3. Breadcrumb Navigation

```javascript
function generateBreadcrumbs(path) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [];

  for (let i = 0; i < parts.length; i++) {
    breadcrumbs.push({
      label: parts[i],
      path: '/' + parts.slice(0, i + 1).join('/')
    });
  }

  return breadcrumbs;
}

// Reverse for right-to-left display
const path = '/products/electronics/phones/iphone';
const crumbs = generateBreadcrumbs(path);
const reversed = reverseArray(crumbs); // Display: iPhone > Phones > Electronics > Products
```

### 4. Chat Messages (Newest First)

```javascript
function getRecentMessages(messages, limit = 10) {
  // Get last N messages in reverse order (newest first)
  return messages.slice(-limit).reverse();
}

const messages = [
  { id: 1, text: 'Hello', timestamp: 1000 },
  { id: 2, text: 'Hi', timestamp: 2000 },
  { id: 3, text: 'How are you?', timestamp: 3000 }
];

getRecentMessages(messages, 2);
// [{ id: 3, ... }, { id: 2, ... }] - Newest first
```

### 5. Stack Implementation

```javascript
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  reverse() {
    this.items.reverse();
    return this;
  }

  toArray() {
    return [...this.items].reverse(); // LIFO order
  }
}
```

### 6. Timeline Display (Reverse Chronological)

```javascript
function renderTimeline(events) {
  // Sort by date descending
  const sorted = events.sort((a, b) => b.date - a.date);

  return sorted.map(event => ({
    ...event,
    relativeTime: getRelativeTime(event.date)
  }));
}

function getRelativeTime(date) {
  const now = Date.now();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

---

## Common Mistakes

### ❌ Mutating When You Shouldn't

```javascript
// WRONG: Mutates original array unexpectedly
function processData(data) {
  const reversed = data.reverse(); // Mutates data!
  return reversed;
}

const original = [1, 2, 3];
const result = processData(original);
console.log(original); // [3, 2, 1] - Oops!
```

### ❌ Inefficient Copy

```javascript
// WRONG: Unnecessary operations
function reverseArray(arr) {
  return JSON.parse(JSON.stringify(arr)).reverse();
  // Slow and loses functions, undefined, etc.
}
```

### ❌ Manual Loop Errors

```javascript
// WRONG: Off-by-one error
function reverseInPlace(arr) {
  for (let i = 0; i <= arr.length / 2; i++) { // Should be <
    [arr[i], arr[arr.length - 1 - i]] = [arr[arr.length - 1 - i], arr[i]];
  }
}
```

### ❌ Not Handling Edge Cases

```javascript
// WRONG: Fails on empty array
function reverseArray(arr) {
  const result = [];
  for (let i = arr.length - 1; i >= 0; i--) { // Works, but...
    result.push(arr[i]);
  }
  return result;
}

reverseArray([]); // Works, but should be validated
```

### ✅ Correct Approaches

```javascript
// CORRECT: Non-mutating with spread
function reverseArray(arr) {
  return [...arr].reverse();
}

// CORRECT: In-place with clear intent
function reverseInPlace(arr) {
  return arr.reverse(); // Caller knows it mutates
}

// CORRECT: With validation
function reverseArray(arr, mutate = false) {
  if (!Array.isArray(arr)) throw new TypeError('Expected array');
  return mutate ? arr.reverse() : [...arr].reverse();
}
```

---

## Performance Optimization

### Benchmark Different Approaches

```javascript
function benchmark(fn, arr, iterations = 10000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn([...arr]); // Fresh copy each time
  }
  return (performance.now() - start) / iterations;
}

const testArray = Array.from({ length: 1000 }, (_, i) => i);

console.log('Built-in reverse():', benchmark(arr => arr.reverse(), testArray));
// ~0.003ms

console.log('Two-pointer:', benchmark(reverseInPlace, testArray));
// ~0.005ms

console.log('New array loop:', benchmark(reverseArray, testArray));
// ~0.008ms

console.log('Recursive:', benchmark(reverseRecursive, testArray));
// ~0.020ms (slower due to stack)
```

**Winner:** Built-in `reverse()` is fastest for most cases.

---

## Complexity Analysis

| Approach | Time | Space | Mutates |
|----------|------|-------|---------|
| Built-in reverse() | O(n) | O(1) | Yes ⚠️ |
| Spread + reverse | O(n) | O(n) | No ✅ |
| Two-pointer swap | O(n) | O(1) | Yes ⚠️ |
| New array loop | O(n) | O(n) | No ✅ |
| Recursive | O(n) | O(n) | Yes ⚠️ |
| reduceRight | O(n) | O(n) | No ✅ |

---

## Follow-up Questions

**Q1: How to reverse only part of an array?**
```javascript
function reverseRange(arr, start, end) {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
  return arr;
}
```

**Q2: How to reverse a linked list?**
- Iterative: O(n) time, O(1) space
- Recursive: O(n) time, O(n) space

**Q3: How to reverse words in a sentence?**
```javascript
function reverseWords(str) {
  return str.split(' ').reverse().join(' ');
}
```

**Q4: What about Unicode/emoji safety?**
```javascript
function reverseString(str) {
  return [...str].reverse().join(''); // Handles emoji correctly
}
```

**Q5: How to reverse number digits?**
```javascript
function reverseNumber(num) {
  return parseInt(String(Math.abs(num)).split('').reverse().join('')) * Math.sign(num);
}
```

---

## Related Problems

- **Rotate Array** - Rotate k positions
- **Palindrome Check** - Compare with reverse
- **Reverse Linked List** - Pointer manipulation
- **Reverse String** - Character array reversal
- **Reverse Words** - Split, reverse, join
- **Reverse Integer** - Math operations
- **K-Reverse** - Reverse in groups of k

---

## Resources

- [MDN - Array.prototype.reverse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [Two-Pointer Technique](https://leetcode.com/articles/two-pointer-technique/)
- [In-Place Algorithms](https://en.wikipedia.org/wiki/In-place_algorithm)

---

[← Back to JavaScript Fundamentals](./README.md)
