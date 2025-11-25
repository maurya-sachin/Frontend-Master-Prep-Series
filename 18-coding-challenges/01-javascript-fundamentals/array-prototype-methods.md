# Array Prototype Methods (map, filter, reduce)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** All FAANG companies
**Time:** 45 minutes

---

## Problem Statement

Implement the core Array prototype methods: `map`, `filter`, and `reduce` from scratch.

### Requirements

- ✅ Implement `Array.prototype.map`
- ✅ Implement `Array.prototype.filter`
- ✅ Implement `Array.prototype.reduce`
- ✅ Handle callback parameters correctly (element, index, array)
- ✅ Support `thisArg` parameter
- ✅ Handle sparse arrays properly
- ✅ Match native behavior exactly

---

## Solution

### Array.prototype.map

```javascript
Array.prototype.myMap = function(callback, thisArg) {
  // Validate callback
  if (typeof callback !== 'function') {
    throw new TypeError(`${callback} is not a function`);
  }

  // Get array length
  const length = this.length;
  const result = new Array(length);

  // Iterate and apply callback
  for (let i = 0; i < length; i++) {
    // Skip holes in sparse arrays
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }

  return result;
};

// Usage
const numbers = [1, 2, 3, 4];
const doubled = numbers.myMap(x => x * 2);
console.log(doubled); // [2, 4, 6, 8]
```

### Array.prototype.filter

```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  // Validate callback
  if (typeof callback !== 'function') {
    throw new TypeError(`${callback} is not a function`);
  }

  const length = this.length;
  const result = [];

  // Iterate and filter
  for (let i = 0; i < length; i++) {
    // Skip holes in sparse arrays
    if (i in this) {
      const value = this[i];
      // Add to result if callback returns truthy
      if (callback.call(thisArg, value, i, this)) {
        result.push(value);
      }
    }
  }

  return result;
};

// Usage
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.myFilter(x => x % 2 === 0);
console.log(evens); // [2, 4]
```

### Array.prototype.reduce

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  // Validate callback
  if (typeof callback !== 'function') {
    throw new TypeError(`${callback} is not a function`);
  }

  const length = this.length;
  let accumulator;
  let startIndex = 0;

  // Handle initial value
  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    // No initial value - use first element
    // Find first non-empty index
    let found = false;
    for (let i = 0; i < length; i++) {
      if (i in this) {
        accumulator = this[i];
        startIndex = i + 1;
        found = true;
        break;
      }
    }

    // Empty array without initial value
    if (!found) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
  }

  // Reduce
  for (let i = startIndex; i < length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};

// Usage
const numbers = [1, 2, 3, 4];
const sum = numbers.myReduce((acc, val) => acc + val, 0);
console.log(sum); // 10
```

---

## Test Cases

```javascript
describe('Array Methods', () => {
  describe('myMap', () => {
    test('maps values correctly', () => {
      const arr = [1, 2, 3];
      const result = arr.myMap(x => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });

    test('passes index and array to callback', () => {
      const arr = ['a', 'b', 'c'];
      const result = arr.myMap((val, idx, array) => {
        expect(array).toBe(arr);
        return `${val}-${idx}`;
      });
      expect(result).toEqual(['a-0', 'b-1', 'c-2']);
    });

    test('handles thisArg', () => {
      const multiplier = { factor: 10 };
      const arr = [1, 2, 3];
      const result = arr.myMap(function(x) {
        return x * this.factor;
      }, multiplier);
      expect(result).toEqual([10, 20, 30]);
    });

    test('handles sparse arrays', () => {
      const arr = [1, , 3];
      const result = arr.myMap(x => x * 2);
      expect(result).toEqual([2, , 6]);
      expect(1 in result).toBe(false);
    });

    test('throws on non-function callback', () => {
      expect(() => [1, 2].myMap('not a function')).toThrow(TypeError);
    });
  });

  describe('myFilter', () => {
    test('filters values correctly', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = arr.myFilter(x => x % 2 === 0);
      expect(result).toEqual([2, 4]);
    });

    test('passes correct arguments to callback', () => {
      const arr = [10, 20, 30];
      const result = arr.myFilter((val, idx, array) => {
        expect(array).toBe(arr);
        return idx > 0;
      });
      expect(result).toEqual([20, 30]);
    });

    test('handles thisArg', () => {
      const threshold = { min: 5 };
      const arr = [1, 6, 3, 8];
      const result = arr.myFilter(function(x) {
        return x > this.min;
      }, threshold);
      expect(result).toEqual([6, 8]);
    });

    test('handles sparse arrays', () => {
      const arr = [1, , 3, , 5];
      const result = arr.myFilter(x => x > 2);
      expect(result).toEqual([3, 5]);
    });
  });

  describe('myReduce', () => {
    test('reduces with initial value', () => {
      const arr = [1, 2, 3, 4];
      const result = arr.myReduce((acc, val) => acc + val, 0);
      expect(result).toBe(10);
    });

    test('reduces without initial value', () => {
      const arr = [1, 2, 3, 4];
      const result = arr.myReduce((acc, val) => acc + val);
      expect(result).toBe(10);
    });

    test('passes correct arguments to callback', () => {
      const arr = [1, 2, 3];
      const indices = [];
      arr.myReduce((acc, val, idx, array) => {
        expect(array).toBe(arr);
        indices.push(idx);
        return acc + val;
      }, 0);
      expect(indices).toEqual([0, 1, 2]);
    });

    test('handles sparse arrays', () => {
      const arr = [1, , 3, , 5];
      const result = arr.myReduce((acc, val) => acc + val, 0);
      expect(result).toBe(9);
    });

    test('throws on empty array without initial value', () => {
      expect(() => [].myReduce((acc, val) => acc + val)).toThrow(TypeError);
    });

    test('works with objects', () => {
      const arr = [{x: 1}, {x: 2}, {x: 3}];
      const result = arr.myReduce((acc, obj) => acc + obj.x, 0);
      expect(result).toBe(6);
    });
  });
});
```

---

## Common Mistakes

- ❌ **Not handling sparse arrays:** Iterating over empty slots
- ❌ **Not passing all callback parameters:** Missing index or array
- ❌ **Ignoring thisArg:** Not binding callback context
- ❌ **Wrong reduce initialization:** Not handling missing initial value
- ❌ **Not validating callback type:** Assuming it's always a function
- ❌ **Mutating original array:** Changing array during iteration

✅ **Check `i in this` for sparse arrays**
✅ **Pass element, index, array to callback**
✅ **Use callback.call(thisArg, ...)**
✅ **Handle both reduce signatures**
✅ **Throw TypeError for invalid callbacks**
✅ **Never mutate original array**

---

## Real-World Applications

```javascript
// 1. Transform data structures
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const userMap = users.myReduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

// 2. Chain transformations
const numbers = [1, 2, 3, 4, 5];

const result = numbers
  .myFilter(x => x % 2 === 0)
  .myMap(x => x * x)
  .myReduce((acc, val) => acc + val, 0);

console.log(result); // 20 (4 + 16)

// 3. Group by property
const items = [
  { type: 'fruit', name: 'apple' },
  { type: 'vegetable', name: 'carrot' },
  { type: 'fruit', name: 'banana' }
];

const grouped = items.myReduce((acc, item) => {
  (acc[item.type] = acc[item.type] || []).push(item);
  return acc;
}, {});
```

---

## Follow-up Questions

1. **How would you implement `flatMap`?**
2. **What's the difference between `reduce` and `reduceRight`?**
3. **How would you optimize these for large arrays?**
4. **Can you implement `some` and `every`?**

---

[← Back to JavaScript Fundamentals](./README.md)
