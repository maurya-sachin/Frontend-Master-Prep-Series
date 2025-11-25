# Promise.race Implementation

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Companies:** Google, Microsoft, Amazon
**Time:** 20 minutes

---

## Problem Statement

Implement `Promise.race` that returns a promise that resolves or rejects as soon as one of the promises in an iterable resolves or rejects, with the value or reason from that promise.

### Requirements

- ✅ Return a promise that settles with the first settled promise
- ✅ Support both resolved and rejected promises
- ✅ Handle empty array input
- ✅ Handle non-promise values
- ✅ Support any iterable (arrays, sets, etc.)
- ✅ Properly handle edge cases

---

## Example Usage

```javascript
const promise1 = new Promise((resolve) => setTimeout(() => resolve('one'), 500));
const promise2 = new Promise((resolve) => setTimeout(() => resolve('two'), 100));

Promise.race([promise1, promise2]).then((value) => {
  console.log(value); // "two" (first to resolve)
});

// With rejection
const slow = new Promise((resolve) => setTimeout(() => resolve('slow'), 200));
const fast = new Promise((_, reject) => setTimeout(() => reject('fast error'), 100));

Promise.race([slow, fast]).catch((error) => {
  console.log(error); // "fast error"
});
```

---

## Solution

### Approach 1: Basic Implementation

```javascript
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    // Handle empty array
    if (!promises || promises.length === 0) {
      return; // Never settles
    }

    // Attach handlers to all promises
    for (const promise of promises) {
      // Convert non-promises to promises
      Promise.resolve(promise)
        .then(resolve)  // First to resolve wins
        .catch(reject); // First to reject wins
    }
  });
}

// ✅ CORRECT: Simple and effective
// ❌ LIMITED: Doesn't validate inputs thoroughly
```

**Complexity:**
- Time: O(n) to attach handlers
- Space: O(1) constant space

---

### Approach 2: Production Implementation

```javascript
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    // Validate input
    if (iterable == null) {
      throw new TypeError('promiseRace requires an iterable');
    }

    // Convert to array if not already
    const promises = Array.from(iterable);

    // Empty iterable - never settles (matches native behavior)
    if (promises.length === 0) {
      return;
    }

    // Track if already settled
    let settled = false;

    promises.forEach((promise, index) => {
      // Convert non-promise values to promises
      Promise.resolve(promise)
        .then(
          (value) => {
            if (!settled) {
              settled = true;
              resolve(value);
            }
          },
          (reason) => {
            if (!settled) {
              settled = true;
              reject(reason);
            }
          }
        );
    });
  });
}
```

**Complexity:**
- Time: O(n) where n is number of promises
- Space: O(n) for array conversion

---

### Approach 3: With Detailed Error Handling

```javascript
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    // Type checking
    if (iterable == null) {
      return reject(
        new TypeError(`${iterable} is not iterable (cannot read property Symbol(Symbol.iterator))`)
      );
    }

    // Check if iterable
    if (typeof iterable[Symbol.iterator] !== 'function') {
      return reject(
        new TypeError(`${typeof iterable} is not iterable`)
      );
    }

    let promises;
    try {
      promises = Array.from(iterable);
    } catch (error) {
      return reject(error);
    }

    // Empty iterable never settles
    if (promises.length === 0) {
      return;
    }

    // Use flag to ensure we only settle once
    let hasSettled = false;

    const settle = (callback) => (value) => {
      if (!hasSettled) {
        hasSettled = true;
        callback(value);
      }
    };

    promises.forEach((item) => {
      // Wrap in Promise.resolve to handle thenable objects
      Promise.resolve(item).then(
        settle(resolve),
        settle(reject)
      );
    });
  });
}
```

**Complexity:**
- Time: O(n)
- Space: O(n)

---

## Test Cases

```javascript
describe('Promise.race', () => {
  test('resolves with first resolved promise', async () => {
    const p1 = new Promise((resolve) => setTimeout(() => resolve('slow'), 100));
    const p2 = new Promise((resolve) => setTimeout(() => resolve('fast'), 10));
    const p3 = new Promise((resolve) => setTimeout(() => resolve('slower'), 200));

    const result = await promiseRace([p1, p2, p3]);
    expect(result).toBe('fast');
  });

  test('rejects with first rejected promise', async () => {
    const p1 = new Promise((resolve) => setTimeout(() => resolve('slow'), 100));
    const p2 = new Promise((_, reject) => setTimeout(() => reject('error'), 10));

    await expect(promiseRace([p1, p2])).rejects.toBe('error');
  });

  test('handles non-promise values', async () => {
    const p1 = new Promise((resolve) => setTimeout(() => resolve('async'), 100));
    const immediate = 'immediate';

    const result = await promiseRace([p1, immediate]);
    expect(result).toBe('immediate');
  });

  test('handles empty array', async () => {
    const promise = promiseRace([]);

    // Should never settle
    const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), 100));
    const result = await Promise.race([promise, timeout]);

    expect(result).toBe('timeout');
  });

  test('handles mixed values and promises', async () => {
    const values = [
      Promise.resolve('promise'),
      'immediate',
      Promise.reject('error'),
      42
    ];

    const result = await promiseRace(values);
    expect(result).toBe('immediate');
  });

  test('resolves even if later promises reject', async () => {
    const p1 = Promise.resolve('quick');
    const p2 = new Promise((_, reject) => setTimeout(() => reject('slow error'), 100));

    const result = await promiseRace([p1, p2]);
    expect(result).toBe('quick');
  });

  test('handles thenable objects', async () => {
    const thenable = {
      then(resolve) {
        resolve('thenable value');
      }
    };

    const p = new Promise((resolve) => setTimeout(() => resolve('promise'), 100));

    const result = await promiseRace([p, thenable]);
    expect(result).toBe('thenable value');
  });

  test('throws TypeError for null/undefined', async () => {
    await expect(promiseRace(null)).rejects.toThrow(TypeError);
    await expect(promiseRace(undefined)).rejects.toThrow(TypeError);
  });

  test('throws TypeError for non-iterables', async () => {
    await expect(promiseRace(123)).rejects.toThrow(TypeError);
    await expect(promiseRace({})).rejects.toThrow(TypeError);
  });

  test('works with other iterables', async () => {
    const set = new Set([
      Promise.resolve('from set'),
      new Promise((resolve) => setTimeout(() => resolve('slow'), 100))
    ]);

    const result = await promiseRace(set);
    expect(result).toBe('from set');
  });
});
```

---

## Common Mistakes

- ❌ **Not converting non-promises:** Assuming all inputs are promises
- ❌ **Not handling empty arrays:** Should never settle, not throw
- ❌ **Multiple settlements:** Not guarding against settling twice
- ❌ **Not supporting iterables:** Only working with arrays
- ❌ **Poor error handling:** Not validating input types
- ❌ **Memory leaks:** Not cleaning up pending promises

✅ **Use Promise.resolve() for all values**
✅ **Check for iterable protocol**
✅ **Guard against multiple settlements**
✅ **Handle edge cases properly**
✅ **Support all iterables, not just arrays**

---

## Real-World Applications

1. **Timeout Implementation**
```javascript
function timeout(promise, ms) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );

  return promiseRace([promise, timeoutPromise]);
}

// Usage
const fetchWithTimeout = timeout(
  fetch('/api/data'),
  5000
);
```

2. **Fastest API Response**
```javascript
async function getFastestResponse(urls) {
  const requests = urls.map(url => fetch(url));
  return promiseRace(requests);
}

// Use first responding server
const data = await getFastestResponse([
  'https://api1.example.com/data',
  'https://api2.example.com/data',
  'https://api3.example.com/data'
]);
```

3. **User Action with Timeout**
```javascript
function waitForUserAction(eventType, timeout) {
  const userAction = new Promise((resolve) => {
    const handler = (event) => {
      document.removeEventListener(eventType, handler);
      resolve(event);
    };
    document.addEventListener(eventType, handler);
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject('User did not respond'), timeout)
  );

  return promiseRace([userAction, timeoutPromise]);
}
```

4. **Cache-First Strategy**
```javascript
async function getCachedOrFetch(key, fetcher) {
  return promiseRace([
    cache.get(key),
    fetcher().then(data => {
      cache.set(key, data);
      return data;
    })
  ]);
}
```

---

## Follow-up Questions

1. **How would you implement Promise.race with cancellation?**
   - Use AbortController
   - Cancel pending operations when first settles
   - Clean up resources properly

2. **What happens to other promises after one settles?**
   - They continue running
   - No way to cancel them in standard Promise.race
   - May want custom implementation with cleanup

3. **How would you implement Promise.any (opposite of Promise.race for errors)?**
   - Wait for first fulfilled promise
   - Only reject if all promises reject
   - Collect all rejection reasons

4. **How do you handle cleanup in Promise.race?**
   - Not possible with standard Promises
   - Need custom implementation with cancellation tokens
   - Consider using AbortSignal pattern

---

## Resources

- [MDN: Promise.race()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [Promise.race vs Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [Promises/A+ Spec](https://promisesaplus.com/)

---

[← Back to JavaScript Fundamentals](./README.md)
