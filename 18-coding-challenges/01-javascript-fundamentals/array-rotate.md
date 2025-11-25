# Array Rotate

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Companies:** Amazon, Microsoft, Google, Meta, Apple, Adobe
**Time:** 20 minutes

---

## Problem Statement

Rotate an array to the right by `k` positions. Each element shifts `k` positions to the right, and elements at the end wrap around to the beginning.

### Requirements

- ✅ Rotate array by k positions to the right
- ✅ Handle k > array length (use modulo)
- ✅ Handle negative k (rotate left)
- ✅ Support both in-place and new array approaches
- ✅ Optimize for time and space complexity

### Examples

```javascript
Input: nums = [1, 2, 3, 4, 5, 6, 7], k = 3
Output: [5, 6, 7, 1, 2, 3, 4]
Explanation: Rotate 3 positions right

Input: nums = [-1, -100, 3, 99], k = 2
Output: [3, 99, -1, -100]

Input: nums = [1, 2, 3, 4, 5], k = 0
Output: [1, 2, 3, 4, 5]

Input: nums = [1, 2, 3], k = 4
Output: [3, 1, 2]
Explanation: k=4 is same as k=1 (4 % 3 = 1)
```

---

## Solution

### Approach 1: Using Slice (Simple, New Array)

```javascript
function rotateArray(nums, k) {
  const n = nums.length;

  // Handle edge cases
  if (n === 0) return nums;

  // Normalize k (handle k > n and negative k)
  k = ((k % n) + n) % n;

  // Slice and concatenate
  return [...nums.slice(n - k), ...nums.slice(0, n - k)];
}

// Usage
rotateArray([1, 2, 3, 4, 5, 6, 7], 3);  // [5, 6, 7, 1, 2, 3, 4]
rotateArray([1, 2, 3], 4);               // [3, 1, 2]
```

**How it works:**
1. Normalize k to handle wrap-around
2. Slice last k elements
3. Slice first n-k elements
4. Concatenate in reverse order

**Complexity:**
- Time: O(n) - slicing and spreading
- Space: O(n) - new array created

---

### Approach 2: Reverse Method (In-Place, Optimal) ✅

```javascript
function rotateArray(nums, k) {
  const n = nums.length;

  // Handle edge cases
  if (n === 0 || k === 0) return nums;

  // Normalize k
  k = k % n;

  // Reverse entire array
  reverse(nums, 0, n - 1);

  // Reverse first k elements
  reverse(nums, 0, k - 1);

  // Reverse remaining elements
  reverse(nums, k, n - 1);

  return nums;
}

function reverse(arr, start, end) {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
}

// Usage
const nums = [1, 2, 3, 4, 5, 6, 7];
rotateArray(nums, 3);
console.log(nums);  // [5, 6, 7, 1, 2, 3, 4]
```

**How it works (k=3):**
```
Original:  [1, 2, 3, 4, 5, 6, 7]

Step 1 - Reverse all:
          [7, 6, 5, 4, 3, 2, 1]

Step 2 - Reverse first k (3):
          [5, 6, 7, 4, 3, 2, 1]

Step 3 - Reverse remaining (k to end):
          [5, 6, 7, 1, 2, 3, 4] ✅
```

**Pros:**
- **In-place: O(1) space**
- **O(n) time**
- Elegant and efficient

**Cons:**
- Modifies original array
- Less intuitive than slice method

**Complexity:**
- Time: O(n) - three passes through array
- Space: O(1) - in-place

---

### Approach 3: Using Extra Array (Non-Mutating)

```javascript
function rotateArray(nums, k) {
  const n = nums.length;

  if (n === 0) return [];

  k = ((k % n) + n) % n;

  const result = new Array(n);

  // Place each element at new position
  for (let i = 0; i < n; i++) {
    result[(i + k) % n] = nums[i];
  }

  return result;
}

// Usage
rotateArray([1, 2, 3, 4, 5], 2);  // [4, 5, 1, 2, 3]
```

**Complexity:**
- Time: O(n)
- Space: O(n) - new array

---

### Approach 4: Cyclic Replacements (In-Place, Advanced)

```javascript
function rotateArray(nums, k) {
  const n = nums.length;

  if (n === 0) return nums;

  k = k % n;
  if (k === 0) return nums;

  let count = 0;

  for (let start = 0; count < n; start++) {
    let current = start;
    let prev = nums[start];

    do {
      const next = (current + k) % n;
      [nums[next], prev] = [prev, nums[next]];
      current = next;
      count++;
    } while (start !== current);
  }

  return nums;
}

// Usage
const nums = [1, 2, 3, 4, 5, 6];
rotateArray(nums, 2);
console.log(nums);  // [5, 6, 1, 2, 3, 4]
```

**How it works:**
1. Start from index 0
2. Move element to its target position
3. Continue cycle until back to start
4. Repeat for all cycles

**Complexity:**
- Time: O(n)
- Space: O(1)

---

### Approach 5: Rotate Left (Negative k)

```javascript
function rotateArray(nums, k) {
  const n = nums.length;

  if (n === 0) return nums;

  // Normalize k (handles both positive and negative)
  k = ((k % n) + n) % n;

  // Same reverse algorithm works
  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);

  return nums;
}

// Usage
rotateArray([1, 2, 3, 4, 5], -2);  // [3, 4, 5, 1, 2] (rotate left 2)
rotateArray([1, 2, 3, 4, 5], 2);   // [4, 5, 1, 2, 3] (rotate right 2)
```

---

### Approach 6: Production-Ready (With Options)

```javascript
function rotateArray(nums, k, options = {}) {
  const {
    mutate = false,     // Modify in-place
    direction = 'right' // 'right' or 'left'
  } = options;

  // Input validation
  if (!Array.isArray(nums)) {
    throw new TypeError('First argument must be an array');
  }

  if (!Number.isInteger(k)) {
    throw new TypeError('k must be an integer');
  }

  const n = nums.length;

  // Handle empty array
  if (n === 0) {
    return mutate ? nums : [];
  }

  // Normalize k
  k = ((k % n) + n) % n;

  // Handle direction
  if (direction === 'left') {
    k = n - k;
  }

  if (k === 0) {
    return mutate ? nums : [...nums];
  }

  // Choose strategy based on mutate flag
  if (mutate) {
    // In-place reverse method
    reverse(nums, 0, n - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, n - 1);
    return nums;
  } else {
    // Non-mutating slice method
    return [...nums.slice(n - k), ...nums.slice(0, n - k)];
  }
}

function reverse(arr, start, end) {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
}

// Usage examples
const nums = [1, 2, 3, 4, 5];

// Default: non-mutating, right rotation
rotateArray(nums, 2);
// [4, 5, 1, 2, 3], nums unchanged

// In-place rotation
rotateArray(nums, 2, { mutate: true });
// nums is now [4, 5, 1, 2, 3]

// Rotate left
rotateArray(nums, 2, { direction: 'left' });
// [3, 4, 5, 1, 2]

// Handle large k
rotateArray([1, 2, 3], 10);
// [2, 3, 1] (10 % 3 = 1)
```

---

## Test Cases

```javascript
describe('rotateArray', () => {
  test('rotates array by k positions right', () => {
    expect(rotateArray([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([5, 6, 7, 1, 2, 3, 4]);
  });

  test('handles k larger than array length', () => {
    expect(rotateArray([1, 2, 3], 4)).toEqual([3, 1, 2]);
    expect(rotateArray([1, 2, 3], 7)).toEqual([2, 3, 1]);
  });

  test('handles k = 0', () => {
    expect(rotateArray([1, 2, 3, 4, 5], 0)).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles k = array length', () => {
    expect(rotateArray([1, 2, 3, 4], 4)).toEqual([1, 2, 3, 4]);
  });

  test('handles negative k (rotate left)', () => {
    expect(rotateArray([1, 2, 3, 4, 5], -2)).toEqual([3, 4, 5, 1, 2]);
  });

  test('handles single element', () => {
    expect(rotateArray([1], 5)).toEqual([1]);
  });

  test('handles empty array', () => {
    expect(rotateArray([], 3)).toEqual([]);
  });

  test('handles two elements', () => {
    expect(rotateArray([1, 2], 1)).toEqual([2, 1]);
    expect(rotateArray([1, 2], 3)).toEqual([2, 1]);
  });

  test('does not mutate original (default)', () => {
    const original = [1, 2, 3, 4, 5];
    const rotated = rotateArray(original, 2);

    expect(rotated).toEqual([4, 5, 1, 2, 3]);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });

  test('mutates when mutate flag is true', () => {
    const original = [1, 2, 3, 4, 5];
    const rotated = rotateArray(original, 2, { mutate: true });

    expect(rotated).toEqual([4, 5, 1, 2, 3]);
    expect(original).toEqual([4, 5, 1, 2, 3]);
  });

  test('rotates left when direction is left', () => {
    expect(rotateArray([1, 2, 3, 4, 5], 2, { direction: 'left' })).toEqual([3, 4, 5, 1, 2]);
  });

  test('throws error for invalid input', () => {
    expect(() => rotateArray(null, 2)).toThrow(TypeError);
    expect(() => rotateArray([1, 2, 3], 2.5)).toThrow(TypeError);
  });

  test('handles large arrays efficiently', () => {
    const large = Array.from({ length: 100000 }, (_, i) => i);
    const start = Date.now();
    rotateArray(large, 50000, { mutate: true });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });
});
```

---

## Real-World Use Cases

### 1. Carousel/Slider Rotation

```javascript
class Carousel {
  constructor(items) {
    this.items = items;
    this.currentIndex = 0;
  }

  next(steps = 1) {
    this.items = rotateArray(this.items, steps, { mutate: true });
    return this.items[0];
  }

  prev(steps = 1) {
    this.items = rotateArray(this.items, -steps, { mutate: true });
    return this.items[0];
  }

  getCurrent() {
    return this.items[0];
  }
}

const carousel = new Carousel(['img1.jpg', 'img2.jpg', 'img3.jpg']);
carousel.next();  // 'img2.jpg' now first
carousel.next();  // 'img3.jpg' now first
carousel.prev();  // 'img2.jpg' now first
```

### 2. Shift Work Schedule Rotation

```javascript
function rotateSchedule(employees, weeks) {
  const daysPerWeek = 7;
  const rotations = weeks % employees.length;

  return rotateArray(employees, rotations);
}

const employees = ['Alice', 'Bob', 'Charlie', 'David'];
rotateSchedule(employees, 2);
// ['Charlie', 'David', 'Alice', 'Bob'] - rotated by 2 positions
```

### 3. Caesar Cipher

```javascript
function caesarCipher(text, shift) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const rotated = rotateArray(alphabet, shift);

  return text
    .toLowerCase()
    .split('')
    .map(char => {
      const index = alphabet.indexOf(char);
      return index !== -1 ? rotated[index] : char;
    })
    .join('');
}

caesarCipher('hello', 3);  // 'khoor'
```

### 4. Circular Buffer / Ring Buffer

```javascript
class CircularBuffer {
  constructor(size) {
    this.buffer = new Array(size).fill(null);
    this.writeIndex = 0;
  }

  write(value) {
    this.buffer[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
  }

  read(offset = 0) {
    return rotateArray(this.buffer, offset)[0];
  }

  getAll() {
    return rotateArray(this.buffer, -this.writeIndex);
  }
}
```

### 5. Time Zone Conversion Display

```javascript
function getTimeZones(baseTimeZone, rotations) {
  const timeZones = [
    'PST', 'MST', 'CST', 'EST',
    'GMT', 'CET', 'IST', 'JST'
  ];

  const baseIndex = timeZones.indexOf(baseTimeZone);
  return rotateArray(timeZones, -baseIndex).slice(0, 4);
}

getTimeZones('EST', 0);  // ['EST', 'GMT', 'CET', 'IST']
```

### 6. Game - Rotating Game Board

```javascript
class GameBoard {
  constructor(rows, cols) {
    this.board = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => i * cols + j)
    );
  }

  rotateRow(rowIndex, k) {
    this.board[rowIndex] = rotateArray(this.board[rowIndex], k, { mutate: true });
  }

  rotateColumn(colIndex, k) {
    const column = this.board.map(row => row[colIndex]);
    const rotated = rotateArray(column, k);

    rotated.forEach((val, i) => {
      this.board[i][colIndex] = val;
    });
  }

  display() {
    return this.board.map(row => row.join(' ')).join('\n');
  }
}
```

---

## Common Mistakes

### ❌ Not Handling k > n

```javascript
// WRONG: Doesn't handle k larger than array length
function rotateArray(nums, k) {
  return [...nums.slice(k), ...nums.slice(0, k)];
  // Fails for k > nums.length
}

rotateArray([1, 2, 3], 5);  // []
```

### ❌ Not Handling Negative k

```javascript
// WRONG: Doesn't handle negative rotations
function rotateArray(nums, k) {
  k = k % nums.length;  // -2 % 5 = -2 (not 3!)
  // ...
}
```

### ❌ Off-by-One in Reverse Method

```javascript
// WRONG: Incorrect reversal bounds
function rotateArray(nums, k) {
  reverse(nums, 0, nums.length);  // Should be length - 1
  reverse(nums, 0, k);            // Should be k - 1
  reverse(nums, k, nums.length);  // Should be length - 1
}
```

### ❌ Mutating When Shouldn't

```javascript
// WRONG: Uses splice which mutates
function rotateArray(nums, k) {
  const rotated = nums.splice(nums.length - k);
  return [...rotated, ...nums];  // nums is now modified!
}
```

### ✅ Correct Approaches

```javascript
// CORRECT: Normalize k properly
function rotateArray(nums, k) {
  k = ((k % nums.length) + nums.length) % nums.length;
  return [...nums.slice(-k), ...nums.slice(0, -k)];
}

// CORRECT: Reverse method with proper bounds
function rotateArray(nums, k) {
  k = k % nums.length;
  reverse(nums, 0, nums.length - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, nums.length - 1);
  return nums;
}
```

---

## Performance Optimization

### Benchmark Comparison

```javascript
function benchmark(fn, arr, k, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn([...arr], k);
  }
  return (performance.now() - start) / iterations;
}

const testArray = Array.from({ length: 1000 }, (_, i) => i);

console.log('Slice method:', benchmark(rotateArraySlice, testArray, 500));
// ~0.02ms

console.log('Reverse method:', benchmark(rotateArrayReverse, testArray, 500));
// ~0.01ms - FASTER (in-place)

console.log('Extra array:', benchmark(rotateArrayExtra, testArray, 500));
// ~0.025ms

console.log('Cyclic:', benchmark(rotateArrayCyclic, testArray, 500));
// ~0.012ms
```

**Winner:** Reverse method (in-place) is fastest.

---

## Complexity Analysis

| Approach | Time | Space | Mutates |
|----------|------|-------|---------|
| Slice | O(n) | O(n) | No ✅ |
| Reverse | **O(n)** | **O(1)** | Yes ⚠️ |
| Extra Array | O(n) | O(n) | No ✅ |
| Cyclic | O(n) | O(1) | Yes ⚠️ |

**Best:** Reverse method for in-place, Slice for non-mutating.

---

## Follow-up Questions

**Q1: How to rotate 2D matrix 90 degrees?**
- Transpose + reverse each row

**Q2: How to rotate linked list?**
- Find new head, reconnect pointers

**Q3: What if we need to rotate multiple times?**
- Combine rotations: `(k1 + k2) % n`

**Q4: How to rotate only part of array?**
- Apply reverse method to subarray

**Q5: What about circular shift vs rotation?**
- Same concept, different terminology

---

## Related Problems

- **Reverse Array** - Used in rotation
- **Rotate Matrix** - 2D rotation
- **Rotate List** - Linked list version
- **Shift 2D Grid** - Matrix shifting
- **Circular Array Loop** - Detection problem
- **Next Permutation** - Array transformation

---

## Resources

- [LeetCode #189 - Rotate Array](https://leetcode.com/problems/rotate-array/)
- [Reversal Algorithm](https://www.geeksforgeeks.org/array-rotation/)
- [Circular Array Algorithms](https://en.wikipedia.org/wiki/Circular_buffer)

---

[← Back to JavaScript Fundamentals](./README.md)
