# Implement Promise.all()

## Problem Statement

Implement a custom `Promise.all()` function that takes an array of promises and returns a single promise that resolves when all input promises resolve, or rejects when any input promise rejects.

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 20-30 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Netflix

## Requirements

- [ ] Accept an array of promises
- [ ] Return a single promise
- [ ] Resolve with array of all resolved values (in original order)
- [ ] Reject immediately if any promise rejects
- [ ] Handle non-promise values in the input array
- [ ] Preserve order of results
- [ ] Handle empty array input

## Example Usage

```javascript
// Basic usage
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

promiseAll([p1, p2, p3]).then(results => {
  console.log(results); // [1, 2, 3]
});

// With rejection
const p4 = Promise.resolve(1);
const p5 = Promise.reject(new Error('Failed'));
const p6 = Promise.resolve(3);

promiseAll([p4, p5, p6])
  .then(results => {
    console.log(results); // Not called
  })
  .catch(error => {
    console.log(error.message); // "Failed"
  });

// With mixed values (promises and non-promises)
promiseAll([1, Promise.resolve(2), 3]).then(results => {
  console.log(results); // [1, 2, 3]
});

// Empty array
promiseAll([]).then(results => {
  console.log(results); // []
});

// With async operations
const fetchUser = id => new Promise(resolve => {
  setTimeout(() => resolve({ id, name: `User ${id}` }), 100);
});

promiseAll([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
]).then(users => {
  console.log(users);
  // [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }]
});
```

## Test Cases

```javascript
// Test 1: Basic resolution
test('resolves with all values in order', async () => {
  const p1 = Promise.resolve(1);
  const p2 = Promise.resolve(2);
  const p3 = Promise.resolve(3);

  const result = await promiseAll([p1, p2, p3]);
  expect(result).toEqual([1, 2, 3]);
});

// Test 2: Rejects on first failure
test('rejects when any promise rejects', async () => {
  const p1 = Promise.resolve(1);
  const p2 = Promise.reject(new Error('Failed'));
  const p3 = Promise.resolve(3);

  await expect(promiseAll([p1, p2, p3])).rejects.toThrow('Failed');
});

// Test 3: Handles non-promise values
test('handles mixed promises and values', async () => {
  const result = await promiseAll([1, Promise.resolve(2), 3]);
  expect(result).toEqual([1, 2, 3]);
});

// Test 4: Empty array
test('resolves empty array', async () => {
  const result = await promiseAll([]);
  expect(result).toEqual([]);
});

// Test 5: Preserves order with different timing
test('preserves order regardless of resolution timing', async () => {
  const slow = new Promise(resolve => setTimeout(() => resolve('slow'), 100));
  const fast = new Promise(resolve => setTimeout(() => resolve('fast'), 10));

  const result = await promiseAll([slow, fast]);
  expect(result).toEqual(['slow', 'fast']);
});

// Test 6: Stops on first rejection
test('does not wait for all promises after rejection', async () => {
  const slow = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('slow')), 100)
  );
  const fast = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('fast')), 10)
  );

  await expect(promiseAll([slow, fast])).rejects.toThrow('fast');
});
```

## Solution 1: Basic Implementation

```javascript
function promiseAll(promises) {
  // Handle empty array
  if (promises.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const results = [];
    let completedCount = 0;

    promises.forEach((promise, index) => {
      // Convert non-promise values to promises
      Promise.resolve(promise)
        .then(value => {
          results[index] = value; // Preserve order
          completedCount++;

          // Check if all promises are resolved
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          reject(error); // Reject immediately on first error
        });
    });
  });
}
```

**Time Complexity:** O(n) where n is the number of promises
**Space Complexity:** O(n) for storing results

## Solution 2: With Error Handling and Edge Cases

```javascript
function promiseAll(promises) {
  // Input validation
  if (!Array.isArray(promises)) {
    return Promise.reject(new TypeError('Argument must be an array'));
  }

  // Handle empty array
  if (promises.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let completedCount = 0;
    let hasRejected = false;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          // Don't process if already rejected
          if (hasRejected) return;

          results[index] = value;
          completedCount++;

          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          if (!hasRejected) {
            hasRejected = true;
            reject(error);
          }
        });
    });
  });
}
```

## Solution 3: Using async/await

```javascript
async function promiseAll(promises) {
  if (!Array.isArray(promises)) {
    throw new TypeError('Argument must be an array');
  }

  if (promises.length === 0) {
    return [];
  }

  const results = [];

  for (let i = 0; i < promises.length; i++) {
    try {
      results[i] = await Promise.resolve(promises[i]);
    } catch (error) {
      throw error;
    }
  }

  return results;
}

// Note: This solution resolves sequentially, not in parallel!
// Not recommended for Promise.all() behavior
```

## Solution 4: Production-Ready with TypeScript

```typescript
function promiseAll<T>(
  promises: Array<Promise<T> | T>
): Promise<T[]> {
  if (!Array.isArray(promises)) {
    return Promise.reject(
      new TypeError('promiseAll expects an array of promises')
    );
  }

  if (promises.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise<T[]>((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    let completedCount = 0;
    let rejected = false;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value: T) => {
          if (rejected) return;

          results[index] = value;
          completedCount++;

          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch((error: Error) => {
          if (!rejected) {
            rejected = true;
            reject(error);
          }
        });
    });
  });
}
```

## Common Mistakes

❌ **Mistake 1:** Not preserving order
```javascript
// Wrong - results might be out of order
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];

    promises.forEach(promise => {
      promise.then(value => {
        results.push(value); // Wrong! Not preserving order
      });
    });
  });
}
```

❌ **Mistake 2:** Using async/await sequentially
```javascript
// Wrong - resolves sequentially, not in parallel
async function promiseAll(promises) {
  const results = [];
  for (const promise of promises) {
    results.push(await promise); // Waits for each one!
  }
  return results;
}
```

❌ **Mistake 3:** Not handling non-promise values
```javascript
// Wrong - fails if input contains non-promises
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      promise.then(...); // Error if promise is not a Promise!
    });
  });
}
```

✅ **Correct:** Use Promise.resolve() to handle mixed values
```javascript
Promise.resolve(promise).then(value => {
  // Works for both promises and regular values
});
```

## Real-World Applications

1. **Parallel API Calls**
```javascript
const userIds = [1, 2, 3, 4, 5];

const users = await promiseAll(
  userIds.map(id => fetch(`/api/users/${id}`).then(r => r.json()))
);
```

2. **Loading Multiple Resources**
```javascript
const resources = await promiseAll([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json())
]);

const [user, posts, comments] = resources;
```

3. **Image Preloading**
```javascript
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const images = await promiseAll([
  loadImage('/img1.jpg'),
  loadImage('/img2.jpg'),
  loadImage('/img3.jpg')
]);
```

## Follow-up Questions

1. **How would you implement `Promise.allSettled()`?**
   - Unlike Promise.all(), it waits for all promises to settle (resolve or reject)
   - Returns array of objects: `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`

2. **What's the difference between Promise.all() and Promise.race()?**
   - `Promise.all()`: Waits for all, rejects on first failure
   - `Promise.race()`: Resolves/rejects with first settled promise

3. **How would you handle timeouts with Promise.all()?**
   ```javascript
   function withTimeout(promise, ms) {
     const timeout = new Promise((_, reject) =>
       setTimeout(() => reject(new Error('Timeout')), ms)
     );
     return Promise.race([promise, timeout]);
   }

   await promiseAll(promises.map(p => withTimeout(p, 5000)));
   ```

4. **How can you limit concurrency with Promise.all()?**
   - Use a queue or pool to limit parallel executions
   - Process promises in batches

## Performance Considerations

1. **Parallelism:** All promises execute in parallel (unlike sequential await)
2. **Early Termination:** Rejects immediately on first failure, but other promises continue executing
3. **Memory:** Stores all results in memory until all promises settle

## Related Problems

- Promise.race() implementation
- Promise.any() implementation
- Promise.allSettled() implementation
- Async queue with concurrency limit
- Retry logic with Promise.all()

## Resources

- [MDN: Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [JavaScript.info: Promise API](https://javascript.info/promise-api)
- [Promises/A+ Specification](https://promisesaplus.com/)

---

[← Back to JavaScript Fundamentals](./README.md) | [Next Problem →](./event-emitter.md)
