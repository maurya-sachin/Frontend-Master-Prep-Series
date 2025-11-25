# Merge Sorted Arrays

**Difficulty:** 🟢 Easy-Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Bloomberg
**Time:** 20-30 minutes

---

## Problem Statement

Given two sorted arrays, merge them into a single sorted array. The solution should be efficient and handle various edge cases.

### Requirements

- ✅ Merge two sorted arrays into one sorted array
- ✅ Maintain sorted order in result
- ✅ Handle arrays of different lengths
- ✅ Handle empty arrays
- ✅ Don't mutate original arrays
- ✅ Optimize for time and space complexity
- ✅ Handle duplicate values
- ✅ Work with both ascending and descending order

### Examples

```javascript
mergeSorted([1, 3, 5], [2, 4, 6])
// [1, 2, 3, 4, 5, 6]

mergeSorted([1, 2, 3], [4, 5, 6])
// [1, 2, 3, 4, 5, 6]

mergeSorted([1, 3, 5, 7], [2, 4])
// [1, 2, 3, 4, 5, 7]

mergeSorted([], [1, 2, 3])
// [1, 2, 3]

mergeSorted([1, 1, 2], [1, 3, 3])
// [1, 1, 1, 2, 3, 3]
```

---

## Solution 1: Two-Pointer Technique (Optimal)

### Implementation

```javascript
function mergeSorted(arr1, arr2) {
  // Handle edge cases
  if (!arr1.length) return [...arr2];
  if (!arr2.length) return [...arr1];

  const result = [];
  let i = 0; // Pointer for arr1
  let j = 0; // Pointer for arr2

  // Compare elements and add smaller one to result
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] <= arr2[j]) {
      result.push(arr1[i]);
      i++;
    } else {
      result.push(arr2[j]);
      j++;
    }
  }

  // Add remaining elements from arr1 (if any)
  while (i < arr1.length) {
    result.push(arr1[i]);
    i++;
  }

  // Add remaining elements from arr2 (if any)
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }

  return result;
}

// Usage
console.log(mergeSorted([1, 3, 5], [2, 4, 6]));
// [1, 2, 3, 4, 5, 6]
```

### How It Works

1. **Initialization**: Create two pointers starting at index 0 of each array
2. **Comparison**: Compare elements at both pointers
3. **Selection**: Add the smaller element to result, advance that pointer
4. **Repetition**: Repeat until one array is exhausted
5. **Remaining**: Add all remaining elements from non-exhausted array
6. **Return**: Return merged result

### Complexity Analysis

- **Time Complexity:** O(n + m) - where n and m are lengths of arrays
  - We visit each element exactly once
  - Linear time relative to total elements
- **Space Complexity:** O(n + m) - for result array
  - Additional space needed for merged array
  - Cannot do better for creating new array

---

## Solution 2: Using Spread and Sort (Naive)

```javascript
function mergeSorted(arr1, arr2) {
  return [...arr1, ...arr2].sort((a, b) => a - b);
}

// Pros: Very concise, easy to understand
// Cons: O((n+m) log(n+m)) time complexity - less efficient
```

**Why This Is Less Optimal:**
- Doesn't take advantage of pre-sorted input
- JavaScript's sort is O(n log n) on average
- For pre-sorted arrays, two-pointer is always better

---

## Solution 3: Using Array.concat and Sort

```javascript
function mergeSorted(arr1, arr2) {
  return arr1.concat(arr2).sort((a, b) => a - b);
}

// Similar performance to spread operator solution
// Same time complexity: O((n+m) log(n+m))
```

---

## Solution 4: Recursive Approach

```javascript
function mergeSorted(arr1, arr2, result = []) {
  // Base cases
  if (!arr1.length && !arr2.length) return result;
  if (!arr1.length) return result.concat(arr2);
  if (!arr2.length) return result.concat(arr1);

  // Compare first elements
  if (arr1[0] <= arr2[0]) {
    result.push(arr1[0]);
    return mergeSorted(arr1.slice(1), arr2, result);
  } else {
    result.push(arr2[0]);
    return mergeSorted(arr1, arr2.slice(1), result);
  }
}

// Pros: Elegant, functional approach
// Cons: O(n+m) space for call stack, slice creates new arrays
// Not recommended for production (stack overflow risk with large arrays)
```

---

## Solution 5: In-Place Merge (Modifies First Array)

```javascript
function mergeInPlace(arr1, arr2) {
  let i = arr1.length - 1;
  let j = arr2.length - 1;
  let k = arr1.length + arr2.length - 1;

  // Resize arr1 to accommodate all elements
  arr1.length = k + 1;

  // Merge from the end to avoid overwriting
  while (j >= 0) {
    if (i >= 0 && arr1[i] > arr2[j]) {
      arr1[k--] = arr1[i--];
    } else {
      arr1[k--] = arr2[j--];
    }
  }

  return arr1;
}

// Used in LeetCode 88: Merge Sorted Array
// Modifies arr1 in-place, O(1) extra space
```

---

## Advanced Solutions

### With Comparator Function (Flexible Sorting)

```javascript
function mergeSortedWithComparator(arr1, arr2, comparator = (a, b) => a - b) {
  if (!arr1.length) return [...arr2];
  if (!arr2.length) return [...arr1];

  const result = [];
  let i = 0, j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (comparator(arr1[i], arr2[j]) <= 0) {
      result.push(arr1[i++]);
    } else {
      result.push(arr2[j++]);
    }
  }

  return result.concat(arr1.slice(i), arr2.slice(j));
}

// Usage
const descending = (a, b) => b - a;
mergeSortedWithComparator([5, 3, 1], [6, 4, 2], descending);
// [6, 5, 4, 3, 2, 1]
```

### Merge Multiple Sorted Arrays

```javascript
function mergeMultipleSorted(arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  // Merge pairs recursively
  while (arrays.length > 1) {
    const merged = [];
    for (let i = 0; i < arrays.length; i += 2) {
      if (i + 1 < arrays.length) {
        merged.push(mergeSorted(arrays[i], arrays[i + 1]));
      } else {
        merged.push(arrays[i]);
      }
    }
    arrays = merged;
  }

  return arrays[0];
}

// Usage
mergeMultipleSorted([
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9]
]);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Using Priority Queue (For K Sorted Arrays)

```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(val, arrayIndex, elementIndex) {
    this.heap.push({ val, arrayIndex, elementIndex });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].val <= this.heap[index].val) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  bubbleDown(index) {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.heap[left].val < this.heap[smallest].val) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].val < this.heap[smallest].val) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  size() {
    return this.heap.length;
  }
}

function mergeKSorted(arrays) {
  const heap = new MinHeap();
  const result = [];

  // Insert first element of each array
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      heap.insert(arrays[i][0], i, 0);
    }
  }

  // Extract min and add next element from same array
  while (heap.size() > 0) {
    const { val, arrayIndex, elementIndex } = heap.extractMin();
    result.push(val);

    const nextIndex = elementIndex + 1;
    if (nextIndex < arrays[arrayIndex].length) {
      heap.insert(arrays[arrayIndex][nextIndex], arrayIndex, nextIndex);
    }
  }

  return result;
}

// Time: O(N log K) where N = total elements, K = number of arrays
// Space: O(K) for heap
```

---

## Test Cases

```javascript
describe('mergeSorted', () => {
  test('merges two sorted arrays', () => {
    expect(mergeSorted([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('handles arrays of different lengths', () => {
    expect(mergeSorted([1, 3, 5, 7, 9], [2, 4])).toEqual([1, 2, 3, 4, 5, 7, 9]);
    expect(mergeSorted([1, 2], [3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('handles empty arrays', () => {
    expect(mergeSorted([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(mergeSorted([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(mergeSorted([], [])).toEqual([]);
  });

  test('handles duplicate values', () => {
    expect(mergeSorted([1, 1, 2], [1, 3, 3])).toEqual([1, 1, 1, 2, 3, 3]);
    expect(mergeSorted([1, 1, 1], [1, 1, 1])).toEqual([1, 1, 1, 1, 1, 1]);
  });

  test('handles non-overlapping arrays', () => {
    expect(mergeSorted([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(mergeSorted([4, 5, 6], [1, 2, 3])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('handles negative numbers', () => {
    expect(mergeSorted([-3, -1, 2], [-2, 0, 3])).toEqual([-3, -2, -1, 0, 2, 3]);
  });

  test('handles single element arrays', () => {
    expect(mergeSorted([1], [2])).toEqual([1, 2]);
    expect(mergeSorted([2], [1])).toEqual([1, 2]);
  });

  test('does not mutate original arrays', () => {
    const arr1 = [1, 3, 5];
    const arr2 = [2, 4, 6];
    mergeSorted(arr1, arr2);
    expect(arr1).toEqual([1, 3, 5]);
    expect(arr2).toEqual([2, 4, 6]);
  });

  test('handles arrays with all same values', () => {
    expect(mergeSorted([1, 1, 1], [1, 1, 1])).toEqual([1, 1, 1, 1, 1, 1]);
  });

  test('merges multiple sorted arrays', () => {
    expect(mergeMultipleSorted([[1, 4], [2, 5], [3, 6]])).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
```

---

## Real-World Use Cases

### 1. Merge Sort Algorithm

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return mergeSorted(left, right);
}

// Classic divide-and-conquer sorting
// Time: O(n log n), Space: O(n)
```

### 2. Merging Paginated API Results

```javascript
async function fetchAllSortedData(baseUrl, pageCount) {
  // Fetch all pages in parallel
  const promises = Array.from({ length: pageCount }, (_, i) =>
    fetch(`${baseUrl}?page=${i + 1}`).then(r => r.json())
  );

  const pages = await Promise.all(promises);

  // Merge all sorted pages into one sorted result
  return mergeMultipleSorted(pages);
}

// Useful when API returns sorted pages
// E.g., timestamp-sorted logs, user activity feeds
```

### 3. Database Query Merging

```javascript
async function mergeQueryResults(db) {
  // Get sorted results from multiple shards
  const [shard1, shard2, shard3] = await Promise.all([
    db.query('SELECT * FROM users_shard1 ORDER BY created_at'),
    db.query('SELECT * FROM users_shard2 ORDER BY created_at'),
    db.query('SELECT * FROM users_shard3 ORDER BY created_at'),
  ]);

  // Merge sorted results
  return mergeMultipleSorted([shard1, shard2, shard3]);
}

// Common in distributed databases
```

### 4. Time Series Data Merging

```javascript
function mergeTimeSeries(series1, series2) {
  // Each series is sorted by timestamp
  return mergeSorted(series1, series2).map(point => ({
    timestamp: point.timestamp,
    value: point.value,
  }));
}

// Example: Merging stock price data from multiple sources
const nasdaq = [
  { timestamp: 1000, value: 100 },
  { timestamp: 3000, value: 102 },
];
const nyse = [
  { timestamp: 2000, value: 101 },
  { timestamp: 4000, value: 103 },
];

mergeTimeSeries(nasdaq, nyse);
```

### 5. Event Log Merging

```javascript
function mergeLogs(serverLogs, clientLogs) {
  // Both logs sorted by timestamp
  const comparator = (a, b) => a.timestamp - b.timestamp;

  return mergeSortedWithComparator(serverLogs, clientLogs, comparator);
}

// Useful for debugging distributed systems
// Combine logs from multiple sources chronologically
```

### 6. Real-Time Feed Aggregation

```javascript
class FeedAggregator {
  constructor() {
    this.feeds = new Map();
  }

  addFeed(source, items) {
    // Each feed is sorted by recency
    this.feeds.set(source, items);
  }

  getMergedFeed() {
    const allFeeds = Array.from(this.feeds.values());
    return mergeMultipleSorted(allFeeds);
  }
}

// Example: Social media feed aggregator
const aggregator = new FeedAggregator();
aggregator.addFeed('twitter', twitterPosts);
aggregator.addFeed('facebook', facebookPosts);
aggregator.addFeed('instagram', instagramPosts);

const unifiedFeed = aggregator.getMergedFeed();
```

---

## Performance Optimization Tips

### 1. Pre-allocate Result Array

```javascript
function mergeSortedOptimized(arr1, arr2) {
  const result = new Array(arr1.length + arr2.length);
  let i = 0, j = 0, k = 0;

  while (i < arr1.length && j < arr2.length) {
    result[k++] = arr1[i] <= arr2[j] ? arr1[i++] : arr2[j++];
  }

  while (i < arr1.length) result[k++] = arr1[i++];
  while (j < arr2.length) result[k++] = arr2[j++];

  return result;
}

// Slightly faster due to pre-allocation
// Avoids dynamic array resizing
```

### 2. Use TypedArrays for Numeric Data

```javascript
function mergeSortedNumbers(arr1, arr2) {
  const result = new Int32Array(arr1.length + arr2.length);
  let i = 0, j = 0, k = 0;

  while (i < arr1.length && j < arr2.length) {
    result[k++] = arr1[i] <= arr2[j] ? arr1[i++] : arr2[j++];
  }

  while (i < arr1.length) result[k++] = arr1[i++];
  while (j < arr2.length) result[k++] = arr2[j++];

  return result;
}

// Much faster for large numeric arrays
// Fixed memory layout, better CPU cache usage
```

---

## Common Mistakes

### ❌ Mistake 1: Not Handling Empty Arrays

```javascript
function mergeSorted(arr1, arr2) {
  const result = [];
  let i = 0, j = 0;

  // This will fail if arr1 or arr2 is empty
  while (i < arr1.length && j < arr2.length) {
    // ...
  }

  return result; // Missing remaining elements!
}
```

✅ **Correct:** Handle edge cases first

```javascript
if (!arr1.length) return [...arr2];
if (!arr2.length) return [...arr1];
```

### ❌ Mistake 2: Mutating Original Arrays

```javascript
function mergeSorted(arr1, arr2) {
  while (arr2.length) {
    arr1.push(arr2.shift()); // Mutates arr2!
  }
  return arr1.sort(); // Mutates arr1!
}
```

✅ **Correct:** Create new array

```javascript
const result = [];
// Work with result, never modify arr1 or arr2
```

### ❌ Mistake 3: Using Wrong Comparison

```javascript
if (arr1[i] < arr2[j]) { // Missing equals case!
  result.push(arr1[i]);
  i++;
}
```

✅ **Correct:** Use `<=` for stability

```javascript
if (arr1[i] <= arr2[j]) {
  result.push(arr1[i]);
  i++;
}
```

### ❌ Mistake 4: Inefficient Concatenation

```javascript
// Adding elements one by one is slow
while (i < arr1.length) {
  result.push(arr1[i]);
  i++;
}
```

✅ **Better:** Use slice + concat for remaining

```javascript
return result.concat(arr1.slice(i), arr2.slice(j));
```

---

## Interview Tips

### What Interviewers Look For

1. **Edge Case Handling**
   - Empty arrays
   - Arrays of different lengths
   - Duplicate values

2. **Complexity Analysis**
   - Can you explain O(n + m) time?
   - Why is this better than sort?

3. **Code Quality**
   - Clean, readable code
   - Meaningful variable names
   - Proper comments

4. **Follow-up Handling**
   - Can extend to multiple arrays?
   - Can do in-place?
   - Can handle custom comparators?

### Common Follow-up Questions

1. **"What if arrays are very large?"**
   - Use generators for memory efficiency
   - Stream processing instead of loading all

2. **"How would you merge K sorted arrays?"**
   - Use min-heap approach: O(N log K)
   - Or divide-and-conquer: O(N log K)

3. **"Can you do this in-place?"**
   - Yes, if we can modify arr1
   - Merge from end to beginning

4. **"What if arrays are sorted in descending order?"**
   - Reverse comparison logic
   - Or use custom comparator

5. **"How would you test this function?"**
   - Edge cases, normal cases, large inputs
   - Property-based testing (result always sorted)

---

## Related Problems

- **Merge Intervals** - Merge overlapping time intervals
- **Merge K Sorted Lists** - Linked list version
- **Median of Two Sorted Arrays** - Find median efficiently
- **Intersection of Two Sorted Arrays** - Find common elements
- **Union of Two Sorted Arrays** - Combine without duplicates
- **Merge Sort Implementation** - Full sorting algorithm

---

## Complexity Summary

| Solution | Time | Space | Best For |
|----------|------|-------|----------|
| Two-pointer | O(n + m) | O(n + m) | General use ✅ |
| Spread + sort | O((n+m) log(n+m)) | O(n + m) | Quick prototyping |
| In-place | O(n + m) | O(1) | Memory-constrained |
| Recursive | O(n + m) | O(n + m) | Functional style |
| Min-heap (K arrays) | O(N log K) | O(K) | Multiple arrays |

---

## Resources

- [LeetCode 88: Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)
- [LeetCode 21: Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- [Merge Sort Algorithm](https://en.wikipedia.org/wiki/Merge_sort)
- [Two Pointers Technique](https://leetcode.com/articles/two-pointer-technique/)

---

[← Back to JavaScript Fundamentals](./README.md)
