# Promise.allSettled Polyfill

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Companies:** Google, Microsoft, Amazon
**Time:** 20 minutes

---

## Problem Statement

Implement `Promise.allSettled()` which waits for all promises to settle (either fulfilled or rejected) and returns an array of objects describing the outcome of each promise.

### Requirements

- ✅ Wait for all promises to settle
- ✅ Return array of result objects
- ✅ Never rejects (always resolves)
- ✅ Handle empty array
- ✅ Preserve order
- ✅ Handle non-promise values

---

## Solution

```javascript
function promiseAllSettled(promises) {
  // Handle empty array
  if (promises.length === 0) {
    return Promise.resolve([]);
  }

  // Convert to array if not already
  const promiseArray = Array.from(promises);

  // Map each promise to a settled promise
  const settledPromises = promiseArray.map((promise) => {
    // Convert non-promise values to promises
    return Promise.resolve(promise)
      .then((value) => ({
        status: 'fulfilled',
        value: value
      }))
      .catch((reason) => ({
        status: 'rejected',
        reason: reason
      }));
  });

  // Wait for all to settle
  return Promise.all(settledPromises);
}

// Usage
const promises = [
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3),
  Promise.reject('another error')
];

promiseAllSettled(promises).then((results) => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 },
  //   { status: 'rejected', reason: 'another error' }
  // ]
});
```

---

## Alternative Implementation

```javascript
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    const total = promises.length;

    if (total === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch((reason) => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completed++;
          if (completed === total) {
            resolve(results);
          }
        });
    });
  });
}
```

---

## Test Cases

```javascript
describe('promiseAllSettled', () => {
  test('handles all fulfilled promises', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];

    const results = await promiseAllSettled(promises);

    expect(results).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 3 }
    ]);
  });

  test('handles all rejected promises', async () => {
    const promises = [
      Promise.reject('error1'),
      Promise.reject('error2'),
      Promise.reject('error3')
    ];

    const results = await promiseAllSettled(promises);

    expect(results).toEqual([
      { status: 'rejected', reason: 'error1' },
      { status: 'rejected', reason: 'error2' },
      { status: 'rejected', reason: 'error3' }
    ]);
  });

  test('handles mix of fulfilled and rejected', async () => {
    const promises = [
      Promise.resolve('success'),
      Promise.reject('error'),
      Promise.resolve(42)
    ];

    const results = await promiseAllSettled(promises);

    expect(results).toEqual([
      { status: 'fulfilled', value: 'success' },
      { status: 'rejected', reason: 'error' },
      { status: 'fulfilled', value: 42 }
    ]);
  });

  test('handles non-promise values', async () => {
    const promises = [1, 'string', Promise.resolve(3)];

    const results = await promiseAllSettled(promises);

    expect(results).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 'string' },
      { status: 'fulfilled', value: 3 }
    ]);
  });

  test('handles empty array', async () => {
    const results = await promiseAllSettled([]);
    expect(results).toEqual([]);
  });

  test('preserves order', async () => {
    const promises = [
      new Promise((resolve) => setTimeout(() => resolve(3), 30)),
      new Promise((resolve) => setTimeout(() => resolve(1), 10)),
      new Promise((resolve) => setTimeout(() => resolve(2), 20))
    ];

    const results = await promiseAllSettled(promises);

    expect(results.map(r => r.value)).toEqual([3, 1, 2]);
  });
});
```

---

## Comparison with Promise.all

```javascript
// Promise.all - rejects if ANY promise rejects
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
])
  .then(console.log)   // Won't execute
  .catch(console.error); // 'error'

// Promise.allSettled - always resolves with all results
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
])
  .then(console.log); // All results, both fulfilled and rejected
```

---

## Real-World Use Cases

### 1. Multiple API Calls (Continue on Failure)

```javascript
async function fetchMultipleResources(urls) {
  const promises = urls.map(url =>
    fetch(url)
      .then(r => r.json())
      .catch(err => ({ error: err.message, url }))
  );

  const results = await promiseAllSettled(promises);

  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  return { successful, failed };
}
```

### 2. Batch Operations with Partial Failures

```javascript
async function processBatch(items) {
  const operations = items.map(item =>
    processItem(item).catch(err => ({
      itemId: item.id,
      error: err.message
    }))
  );

  const results = await promiseAllSettled(operations);

  const summary = {
    total: items.length,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    results: results
  };

  return summary;
}
```

### 3. Cleanup Multiple Resources

```javascript
async function cleanupResources(resources) {
  // Try to cleanup all resources, even if some fail
  const cleanupPromises = resources.map(resource =>
    resource.cleanup().catch(err => {
      console.warn(`Failed to cleanup ${resource.id}:`, err);
      return null;
    })
  );

  const results = await promiseAllSettled(cleanupPromises);

  // Log which cleanups failed
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Resource ${resources[index].id} cleanup failed`);
    }
  });
}
```

---

## Common Mistakes

- ❌ Not converting non-promise values with `Promise.resolve()`
- ❌ Returning rejected promise (should always resolve)
- ❌ Not preserving array order
- ❌ Forgetting to handle empty array case

✅ Wrap each promise to catch rejections
✅ Always resolve (never reject)
✅ Use index to preserve order
✅ Handle edge cases

---

## Complexity Analysis

- **Time Complexity:** O(n) - where n is number of promises
- **Space Complexity:** O(n) - storing results array

---

[← Back to JavaScript Fundamentals](./README.md)
