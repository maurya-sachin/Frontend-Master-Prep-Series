# Find Nth Largest Element

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Amazon, Microsoft, Meta, Apple, Bloomberg
**Time:** 25 minutes

---

## Problem Statement

Find the nth largest element in an unsorted array. The nth largest element is the nth largest element in sorted order, not the nth distinct element.

### Requirements

- ✅ Find the nth largest element efficiently
- ✅ Handle duplicates correctly
- ✅ Handle edge cases (n > array length, n < 1)
- ✅ Optimize for time and space complexity
- ✅ Support both distinct and non-distinct modes

### Examples

```javascript
Input: nums = [3, 2, 1, 5, 6, 4], n = 2
Output: 5
Explanation: Sorted: [1, 2, 3, 4, 5, 6], 2nd largest is 5

Input: nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], n = 4
Output: 4
Explanation: Sorted: [1, 2, 2, 3, 3, 4, 5, 5, 6], 4th largest is 5

Input: nums = [7, 10, 4, 3, 20, 15], n = 3
Output: 10
Explanation: Sorted: [3, 4, 7, 10, 15, 20], 3rd largest is 10
```

---

## Solution

### Approach 1: Sort Entire Array (Simple but Not Optimal)

```javascript
function findNthLargest(nums, n) {
  if (n < 1 || n > nums.length) {
    throw new Error(`n must be between 1 and ${nums.length}`);
  }

  // Sort in descending order
  const sorted = [...nums].sort((a, b) => b - a);

  return sorted[n - 1];
}

// Usage
findNthLargest([3, 2, 1, 5, 6, 4], 2);  // 5
findNthLargest([7, 10, 4, 3, 20, 15], 3);  // 10
```

**Pros:**
- Simple and straightforward
- Easy to understand
- Works for any n

**Cons:**
- Inefficient: sorts entire array when only need nth element
- O(n log n) time complexity

**Complexity:**
- Time: O(n log n) - sorting
- Space: O(n) - copy of array

---

### Approach 2: Min Heap (Priority Queue) ✅

```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(val) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex] <= this.heap[index]) break;

      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.size() && this.heap[leftChild] < this.heap[smallest]) {
        smallest = leftChild;
      }

      if (rightChild < this.size() && this.heap[rightChild] < this.heap[smallest]) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

function findNthLargest(nums, n) {
  if (n < 1 || n > nums.length) {
    throw new Error(`n must be between 1 and ${nums.length}`);
  }

  const heap = new MinHeap();

  // Keep only n largest elements in heap
  for (const num of nums) {
    heap.push(num);

    if (heap.size() > n) {
      heap.pop();  // Remove smallest
    }
  }

  // Top of heap is nth largest
  return heap.peek();
}

// Usage
findNthLargest([3, 2, 1, 5, 6, 4], 2);  // 5
```

**How it works:**
1. Maintain a min heap of size n
2. As we iterate, keep only n largest elements
3. The root (minimum of heap) is the nth largest overall

**Pros:**
- Efficient for small n
- Good for streaming data
- O(n log n) but better constants than sorting

**Cons:**
- Complex implementation
- Extra space for heap

**Complexity:**
- Time: O(n log n) where n is the size of heap
- Space: O(n) for heap

---

### Approach 3: Quickselect (Optimal) ✅

```javascript
function findNthLargest(nums, n) {
  if (n < 1 || n > nums.length) {
    throw new Error(`n must be between 1 and ${nums.length}`);
  }

  // Convert to 0-indexed (nth largest = (n-1)th index in descending order)
  const k = n - 1;

  return quickSelect(nums, 0, nums.length - 1, k);
}

function quickSelect(nums, left, right, k) {
  if (left === right) return nums[left];

  // Partition and get pivot index
  const pivotIndex = partition(nums, left, right);

  if (pivotIndex === k) {
    return nums[pivotIndex];
  } else if (pivotIndex < k) {
    return quickSelect(nums, pivotIndex + 1, right, k);
  } else {
    return quickSelect(nums, left, pivotIndex - 1, k);
  }
}

function partition(nums, left, right) {
  // Choose random pivot (better for worst case)
  const randomIndex = left + Math.floor(Math.random() * (right - left + 1));
  [nums[randomIndex], nums[right]] = [nums[right], nums[randomIndex]];

  const pivot = nums[right];
  let i = left;

  // Partition: elements > pivot go left (descending order)
  for (let j = left; j < right; j++) {
    if (nums[j] > pivot) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
    }
  }

  // Place pivot in correct position
  [nums[i], nums[right]] = [nums[right], nums[i]];

  return i;
}

// Usage
findNthLargest([3, 2, 1, 5, 6, 4], 2);  // 5
findNthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4);  // 5
```

**How it works:**
1. Partition array around pivot (like quicksort)
2. If pivot is at kth position, return it
3. Otherwise, recurse on appropriate half
4. Average case: O(n), worst case: O(n²)

**Pros:**
- **Best average case: O(n)**
- In-place (modifies array)
- No extra data structures needed

**Cons:**
- Modifies original array
- Worst case O(n²) (mitigated by random pivot)

**Complexity:**
- Time: O(n) average, O(n²) worst
- Space: O(1) iterative, O(log n) recursive stack

---

### Approach 4: Find Nth Distinct Largest

```javascript
function findNthDistinctLargest(nums, n) {
  // Remove duplicates and sort descending
  const unique = [...new Set(nums)].sort((a, b) => b - a);

  if (n < 1 || n > unique.length) {
    throw new Error(`n must be between 1 and ${unique.length}`);
  }

  return unique[n - 1];
}

// Usage
findNthDistinctLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4);  // 3
// Unique sorted: [6, 5, 4, 3, 2, 1], 4th distinct is 3
```

---

### Approach 5: Production-Ready (With Options)

```javascript
function findNthLargest(nums, n, options = {}) {
  const {
    distinct = false,    // Find nth distinct largest
    mutate = false       // Allow array mutation
  } = options;

  // Input validation
  if (!Array.isArray(nums)) {
    throw new TypeError('First argument must be an array');
  }

  if (nums.length === 0) {
    throw new Error('Array cannot be empty');
  }

  if (!Number.isInteger(n) || n < 1) {
    throw new Error('n must be a positive integer');
  }

  // Handle distinct mode
  let arr = nums;
  if (distinct) {
    arr = [...new Set(nums)];
  }

  if (n > arr.length) {
    throw new Error(`n (${n}) exceeds array length (${arr.length})`);
  }

  // For small arrays, sorting is efficient
  if (arr.length < 10) {
    const sorted = mutate ? arr.sort((a, b) => b - a) : [...arr].sort((a, b) => b - a);
    return sorted[n - 1];
  }

  // For large arrays, use quickselect if mutation allowed
  if (mutate) {
    return quickSelect(arr, 0, arr.length - 1, n - 1);
  }

  // Otherwise, use heap (no mutation)
  return findNthLargestHeap([...arr], n);
}

// Usage
const nums = [3, 2, 1, 5, 6, 4];

findNthLargest(nums, 2);
// 5 (original array unchanged)

findNthLargest(nums, 2, { mutate: true });
// 5 (array may be modified)

findNthLargest([3, 2, 3, 1, 2, 4], 2, { distinct: true });
// 3 (2nd distinct: [4, 3, 2, 1])
```

---

## Test Cases

```javascript
describe('findNthLargest', () => {
  test('finds 2nd largest element', () => {
    expect(findNthLargest([3, 2, 1, 5, 6, 4], 2)).toBe(5);
  });

  test('finds 4th largest with duplicates', () => {
    expect(findNthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)).toBe(5);
  });

  test('finds 3rd largest', () => {
    expect(findNthLargest([7, 10, 4, 3, 20, 15], 3)).toBe(10);
  });

  test('finds largest (n=1)', () => {
    expect(findNthLargest([1, 2, 3, 4, 5], 1)).toBe(5);
  });

  test('finds smallest (n=length)', () => {
    expect(findNthLargest([1, 2, 3, 4, 5], 5)).toBe(1);
  });

  test('handles single element', () => {
    expect(findNthLargest([42], 1)).toBe(42);
  });

  test('handles all same values', () => {
    expect(findNthLargest([5, 5, 5, 5], 2)).toBe(5);
  });

  test('handles negative numbers', () => {
    expect(findNthLargest([-1, -2, -3, -4, -5], 2)).toBe(-2);
  });

  test('handles distinct mode', () => {
    expect(findNthLargest([3, 2, 3, 1, 2, 4], 2, { distinct: true })).toBe(3);
  });

  test('throws error for invalid n', () => {
    expect(() => findNthLargest([1, 2, 3], 0)).toThrow(Error);
    expect(() => findNthLargest([1, 2, 3], 4)).toThrow(Error);
    expect(() => findNthLargest([1, 2, 3], -1)).toThrow(Error);
  });

  test('throws error for empty array', () => {
    expect(() => findNthLargest([], 1)).toThrow(Error);
  });

  test('handles large arrays efficiently', () => {
    const large = Array.from({ length: 100000 }, () => Math.floor(Math.random() * 1000));
    const start = Date.now();
    findNthLargest(large, 50);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);  // Should be fast
  });
});
```

---

## Real-World Use Cases

### 1. Finding Top K Salaries

```javascript
function findKthHighestSalary(employees, k) {
  const salaries = employees.map(emp => emp.salary);
  return findNthLargest(salaries, k, { distinct: true });
}

const employees = [
  { name: 'John', salary: 100000 },
  { name: 'Jane', salary: 120000 },
  { name: 'Bob', salary: 100000 },
  { name: 'Alice', salary: 150000 }
];

findKthHighestSalary(employees, 2);  // 120000 (2nd highest distinct)
```

### 2. Leaderboard Rankings

```javascript
function getPlayerRank(scores, playerScore) {
  // Find how many scores are greater than player's
  const rank = scores.filter(s => s > playerScore).length + 1;

  // Find nth largest to determine tier
  if (rank <= 3) {
    return { rank, tier: 'Gold' };
  } else if (rank <= 10) {
    return { rank, tier: 'Silver' };
  } else {
    return { rank, tier: 'Bronze' };
  }
}
```

### 3. Stock Price Analysis

```javascript
function analyzeStockPrices(prices, topN = 5) {
  const highest = [];

  for (let i = 1; i <= topN; i++) {
    highest.push(findNthLargest(prices, i));
  }

  return {
    highest,
    average: highest.reduce((a, b) => a + b) / highest.length,
    median: highest[Math.floor(highest.length / 2)]
  };
}
```

### 4. Rate Limiting / Throttling

```javascript
function shouldThrottle(responseTimes, threshold = 95) {
  // Check if 95th percentile response time is too high
  const n = Math.ceil(responseTimes.length * (1 - threshold / 100));
  const nthSlowest = findNthLargest(responseTimes, n);

  return nthSlowest > 1000;  // > 1 second
}
```

### 5. Outlier Detection

```javascript
function detectOutliers(data, sensitivity = 5) {
  // Find top N values that might be outliers
  const topValues = [];

  for (let i = 1; i <= sensitivity; i++) {
    topValues.push(findNthLargest(data, i));
  }

  const mean = data.reduce((a, b) => a + b) / data.length;
  const stdDev = Math.sqrt(
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  );

  return topValues.filter(val => val > mean + 2 * stdDev);
}
```

---

## Common Mistakes

### ❌ Sorting When Not Needed

```javascript
// WRONG: Sorts entire array (O(n log n)) when quickselect (O(n)) is better
function findNthLargest(nums, n) {
  return nums.sort((a, b) => b - a)[n - 1];
}
```

### ❌ Not Handling Duplicates

```javascript
// WRONG: Assumes all elements are distinct
function findNthLargest(nums, n) {
  const unique = [...new Set(nums)];  // Removes duplicates!
  return unique[n - 1];  // Wrong for non-distinct mode
}
```

### ❌ Off-by-One Errors

```javascript
// WRONG: n=1 should return largest, not 2nd largest
function findNthLargest(nums, n) {
  return nums.sort((a, b) => b - a)[n];  // Should be n-1
}
```

### ❌ Mutating Original Array

```javascript
// WRONG: Modifies input array
function findNthLargest(nums, n) {
  return nums.sort((a, b) => b - a)[n - 1];  // Mutates nums!
}
```

### ✅ Correct Approaches

```javascript
// CORRECT: Non-mutating sort
function findNthLargest(nums, n) {
  return [...nums].sort((a, b) => b - a)[n - 1];
}

// CORRECT: Quickselect for O(n) average
function findNthLargest(nums, n) {
  return quickSelect([...nums], 0, nums.length - 1, n - 1);
}

// CORRECT: Heap for controlled space
function findNthLargest(nums, n) {
  return findNthLargestHeap(nums, n);
}
```

---

## Performance Comparison

```javascript
function benchmark(fn, arr, n, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn([...arr], n);
  }
  return (performance.now() - start) / iterations;
}

const testArray = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));

console.log('Sort:', benchmark(findNthLargestSort, testArray, 500));
// ~3ms

console.log('Heap:', benchmark(findNthLargestHeap, testArray, 500));
// ~2.5ms

console.log('Quickselect:', benchmark(findNthLargestQuickselect, testArray, 500));
// ~0.8ms - FASTEST on average
```

---

## Complexity Analysis

| Approach | Time (Avg) | Time (Worst) | Space | Notes |
|----------|------------|--------------|-------|-------|
| Sort | O(n log n) | O(n log n) | O(n) | Simple but not optimal |
| Min Heap | O(n log k) | O(n log k) | O(k) | Good for small k |
| Quickselect | **O(n)** | O(n²) | O(1) | **Best average case** |
| Max Heap | O(n + k log n) | O(n + k log n) | O(n) | Build heap + extract k times |

**Best choice:** Quickselect for average case, Heap for guaranteed O(n log k).

---

## Follow-up Questions

**Q1: What if array is sorted?**
- Simply return `nums[nums.length - n]` in O(1)

**Q2: What if we need top K elements, not just Kth?**
- Use heap and extract K times: O(n + k log n)

**Q3: What about streaming data?**
- Maintain min heap of size K as data arrives

**Q4: How to handle very large datasets (can't fit in memory)?**
- External sorting or distributed quickselect (MapReduce)

**Q5: What if we need both Kth largest and smallest?**
- Run quickselect twice or use two heaps

---

## Related Problems

- **Kth Smallest Element** - Same but reverse
- **Top K Frequent Elements** - Frequency + nth largest
- **Median of Two Sorted Arrays** - Special case of nth element
- **Sliding Window Maximum** - Uses max heap/deque
- **Kth Largest in Stream** - Online algorithm
- **Find K Pairs with Smallest Sums** - Min heap

---

## Resources

- [LeetCode #215 - Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Quickselect Algorithm](https://en.wikipedia.org/wiki/Quickselect)
- [Heap Data Structure](https://www.bigocheatsheet.com/)

---

[← Back to JavaScript Fundamentals](./README.md)
