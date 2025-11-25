# Two Sum

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Netflix, Uber, Airbnb
**Time:** 20 minutes

---

## Problem Statement

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Requirements

- ✅ Find two numbers that sum to target
- ✅ Return their indices
- ✅ Cannot use same element twice
- ✅ Exactly one solution exists
- ✅ Optimize for time complexity

### Examples

```javascript
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9

Input: nums = [3, 2, 4], target = 6
Output: [1, 2]

Input: nums = [3, 3], target = 6
Output: [0, 1]
```

---

## Solution

### Approach 1: Brute Force (Nested Loops)

```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

// Usage
twoSum([2, 7, 11, 15], 9); // [0, 1]
```

**Pros:**
- Simple and straightforward
- No extra space needed
- Easy to understand

**Cons:**
- Inefficient: O(n²) time complexity
- Doesn't scale for large arrays

**Complexity:**
- Time: O(n²) - nested loops
- Space: O(1) - no extra space

---

### Approach 2: Hash Map (Optimized) ✅

```javascript
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Usage
twoSum([2, 7, 11, 15], 9); // [0, 1]
twoSum([3, 2, 4], 6);      // [1, 2]
twoSum([3, 3], 6);         // [0, 1]
```

**How it works:**
1. Create a hash map to store value → index mappings
2. For each element, calculate complement (target - current)
3. Check if complement exists in map
4. If yes, return [complement_index, current_index]
5. If no, add current element to map and continue

**Complexity:**
- Time: O(n) - single pass through array
- Space: O(n) - hash map storage

---

### Approach 3: Production-Ready (With Validation)

```javascript
function twoSum(nums, target) {
  // Input validation
  if (!Array.isArray(nums)) {
    throw new TypeError('First argument must be an array');
  }

  if (typeof target !== 'number' || !Number.isFinite(target)) {
    throw new TypeError('Target must be a finite number');
  }

  if (nums.length < 2) {
    throw new Error('Array must contain at least 2 elements');
  }

  // Validate all elements are numbers
  if (!nums.every(num => typeof num === 'number' && Number.isFinite(num))) {
    throw new TypeError('All array elements must be finite numbers');
  }

  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  // No solution found (shouldn't happen per problem constraints)
  return null;
}

// Usage with error handling
try {
  const result = twoSum([2, 7, 11, 15], 9);
  console.log(result); // [0, 1]
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### Approach 4: Two-Pointer (For Sorted Arrays)

```javascript
function twoSumSorted(nums, target) {
  // If array is already sorted or can be sorted
  const indexed = nums.map((num, idx) => ({ num, idx }));
  indexed.sort((a, b) => a.num - b.num);

  let left = 0;
  let right = indexed.length - 1;

  while (left < right) {
    const sum = indexed[left].num + indexed[right].num;

    if (sum === target) {
      return [indexed[left].idx, indexed[right].idx].sort((a, b) => a - b);
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}

// Usage
twoSumSorted([2, 7, 11, 15], 9); // [0, 1]
```

**Note:** This approach is O(n log n) due to sorting, so hash map is still better for unsorted arrays.

---

## Test Cases

```javascript
describe('twoSum', () => {
  test('finds indices for valid input', () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
    expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]);
  });

  test('handles duplicate values', () => {
    expect(twoSum([3, 3], 6)).toEqual([0, 1]);
    expect(twoSum([1, 1, 1, 1], 2)).toEqual([0, 1]);
  });

  test('handles negative numbers', () => {
    expect(twoSum([-1, -2, -3, -4, -5], -8)).toEqual([2, 4]);
    expect(twoSum([-3, 4, 3, 90], 0)).toEqual([0, 2]);
  });

  test('handles zero', () => {
    expect(twoSum([0, 4, 3, 0], 0)).toEqual([0, 3]);
    expect(twoSum([-1, 0, 1], 0)).toEqual([0, 2]);
  });

  test('handles large numbers', () => {
    expect(twoSum([1000000, 2000000, 3000000], 5000000)).toEqual([1, 2]);
  });

  test('throws error for invalid input', () => {
    expect(() => twoSum(null, 9)).toThrow(TypeError);
    expect(() => twoSum([1], 5)).toThrow(Error);
    expect(() => twoSum([1, 2], NaN)).toThrow(TypeError);
    expect(() => twoSum([1, 'a'], 5)).toThrow(TypeError);
  });

  test('returns null when no solution', () => {
    expect(twoSum([1, 2, 3], 10)).toBeNull();
  });

  test('handles large arrays efficiently', () => {
    const nums = Array.from({ length: 10000 }, (_, i) => i);
    const target = 19999;
    const start = Date.now();
    const result = twoSum(nums, target);
    const duration = Date.now() - start;

    expect(result).toEqual([9999, 10000 - 1]);
    expect(duration).toBeLessThan(50); // Should be fast
  });
});
```

---

## Real-World Use Cases

### 1. E-commerce Price Matching

```javascript
function findProductPair(prices, budget) {
  const map = new Map();

  for (let i = 0; i < prices.length; i++) {
    const remaining = budget - prices[i].price;

    if (map.has(remaining)) {
      const firstIndex = map.get(remaining);
      return {
        product1: prices[firstIndex],
        product2: prices[i],
        total: prices[firstIndex].price + prices[i].price
      };
    }

    map.set(prices[i].price, i);
  }

  return null;
}

// Usage
const products = [
  { id: 1, name: 'Laptop', price: 800 },
  { id: 2, name: 'Mouse', price: 200 },
  { id: 3, name: 'Keyboard', price: 100 },
  { id: 4, name: 'Monitor', price: 300 }
];

const pair = findProductPair(products, 500);
// { product1: { id: 2 }, product2: { id: 4 }, total: 500 }
```

### 2. Financial Transactions Reconciliation

```javascript
function findMatchingTransactions(transactions, targetAmount) {
  const map = new Map();
  const matches = [];

  for (let i = 0; i < transactions.length; i++) {
    const complement = targetAmount - transactions[i].amount;

    if (map.has(complement)) {
      matches.push({
        debit: transactions[map.get(complement)],
        credit: transactions[i],
        reconciled: true
      });
    } else {
      map.set(transactions[i].amount, i);
    }
  }

  return matches;
}
```

### 3. Gaming - Finding Weapon Combinations

```javascript
function findWeaponCombo(weapons, targetDamage) {
  const map = new Map();

  for (let i = 0; i < weapons.length; i++) {
    const needed = targetDamage - weapons[i].damage;

    if (map.has(needed)) {
      return {
        weapon1: weapons[map.get(needed)],
        weapon2: weapons[i],
        totalDamage: weapons[map.get(needed)].damage + weapons[i].damage
      };
    }

    map.set(weapons[i].damage, i);
  }

  return null;
}
```

### 4. Chemistry - Molecular Weight Matching

```javascript
function findMolecularPair(molecules, targetWeight) {
  const map = new Map();

  for (let i = 0; i < molecules.length; i++) {
    const complement = targetWeight - molecules[i].weight;

    if (map.has(complement)) {
      return [
        molecules[map.get(complement)].formula,
        molecules[i].formula
      ];
    }

    map.set(molecules[i].weight, i);
  }

  return null;
}
```

---

## Common Mistakes

### ❌ Using Same Element Twice

```javascript
// WRONG: Can use same index twice
function twoSumWrong(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);
  }

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [i, map.get(complement)]; // Might return [i, i]
    }
  }
}
```

### ❌ Not Handling Duplicates

```javascript
// WRONG: Overwrites duplicate indices
function twoSumWrong(nums, target) {
  const map = {};

  for (let i = 0; i < nums.length; i++) {
    map[nums[i]] = i; // Last occurrence overwrites
  }

  // This won't work for [3, 3] target 6
}
```

### ❌ Inefficient Brute Force

```javascript
// WRONG: O(n²) when O(n) is possible
function twoSumSlow(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
}
```

### ✅ Correct Approach

```javascript
// CORRECT: Hash map with single pass
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Check BEFORE adding to avoid same index
    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}
```

---

## Performance Optimization

### Benchmark Comparison

```javascript
function benchmark(fn, nums, target, iterations = 1000) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn(nums, target);
  }

  const end = performance.now();
  return (end - start) / iterations;
}

const testArray = Array.from({ length: 1000 }, (_, i) => i);

console.log('Brute Force:', benchmark(twoSumBruteForce, testArray, 1999));
// ~0.5ms per call

console.log('Hash Map:', benchmark(twoSum, testArray, 1999));
// ~0.01ms per call - 50x faster!
```

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Brute Force | O(n²) | O(1) | Too slow for large arrays |
| Hash Map | **O(n)** | O(n) | **Best approach** |
| Two-Pointer | O(n log n) | O(n) | Only if sorting is cheap |
| Binary Search | O(n log n) | O(1) | Not optimal here |

---

## Follow-up Questions

**Q1: What if you can't use extra space?**
- Use two-pointer approach after sorting (modifies array)
- Or accept O(n²) brute force

**Q2: What if there are multiple solutions?**
- Return all pairs: `const results = []; ... results.push([idx1, idx2])`
- Or return first/last found

**Q3: What if you need to find three numbers that sum to target (3Sum)?**
- Fix one number, apply two-sum on remaining
- Time: O(n²), Space: O(1)

**Q4: What if input array is sorted?**
- Two-pointer approach is optimal: O(n) time, O(1) space

**Q5: How to handle very large arrays (millions of elements)?**
- Hash map still best: O(n)
- Consider streaming if doesn't fit in memory

**Q6: What if target sum appears multiple times?**
- Return first occurrence or collect all pairs

---

## Related Problems

- **3Sum** - Find three numbers that sum to target
- **4Sum** - Find four numbers that sum to target
- **Two Sum II** - Input array is sorted
- **Two Sum III** - Data structure design
- **Two Sum IV** - BST variation
- **Subarray Sum Equals K** - Continuous subarray
- **Pair with Target Sum** - Two-pointer variation

---

## Resources

- [LeetCode #1 - Two Sum](https://leetcode.com/problems/two-sum/)
- [Hash Map vs Array Performance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Time Complexity Analysis](https://www.bigocheatsheet.com/)

---

[← Back to JavaScript Fundamentals](./README.md)
