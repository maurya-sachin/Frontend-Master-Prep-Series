# Promise.any Polyfill

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Companies:** Google, Meta
**Time:** 20 minutes

---

## Problem Statement

Implement `Promise.any()` which resolves as soon as ANY promise fulfills, or rejects if ALL promises reject (with AggregateError).

### Requirements

- ✅ Resolve with first fulfilled promise value
- ✅ Reject only if ALL promises reject
- ✅ Throw AggregateError with all rejection reasons
- ✅ Handle empty array
- ✅ Ignore rejections until all fail
- ✅ Handle non-promise values

---

## Solution

```javascript
class AggregateError extends Error {
  constructor(errors, message) {
    super(message);
    this.errors = errors;
    this.name = 'AggregateError';
  }
}

function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors = [];
    let rejectedCount = 0;
    const total = promises.length;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          // First fulfilled promise wins
          resolve(value);
        })
        .catch((error) => {
          errors[index] = error;
          rejectedCount++;

          // All promises rejected
          if (rejectedCount === total) {
            reject(new AggregateError(
              errors,
              'All promises were rejected'
            ));
          }
        });
    });
  });
}

// Usage
const promises = [
  Promise.reject('Error 1'),
  Promise.resolve('Success!'),
  Promise.reject('Error 2')
];

promiseAny(promises)
  .then(value => console.log(value)) // 'Success!'
  .catch(err => console.error(err));
```

---

## Alternative Implementation (ES6+ Clean)

```javascript
function promiseAny(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise).then(
        val => Promise.reject(val),  // Swap success to failure
        err => Promise.resolve(err)  // Swap failure to success
      )
    )
  )
    .then(
      errors => Promise.reject(new AggregateError(
        errors,
        'All promises were rejected'
      ))
    )
    .catch(val => Promise.resolve(val)); // First success
}
```

---

## Test Cases

```javascript
describe('promiseAny', () => {
  test('resolves with first fulfilled promise', async () => {
    const promises = [
      Promise.reject('error1'),
      Promise.resolve('success'),
      Promise.reject('error2')
    ];

    const result = await promiseAny(promises);
    expect(result).toBe('success');
  });

  test('rejects with AggregateError if all reject', async () => {
    const promises = [
      Promise.reject('error1'),
      Promise.reject('error2'),
      Promise.reject('error3')
    ];

    await expect(promiseAny(promises)).rejects.toThrow(AggregateError);
    await expect(promiseAny(promises)).rejects.toHaveProperty(
      'errors',
      ['error1', 'error2', 'error3']
    );
  });

  test('resolves immediately with first success', async () => {
    const start = Date.now();

    const promises = [
      new Promise((resolve) => setTimeout(() => resolve('slow'), 100)),
      Promise.resolve('fast'),
      new Promise((resolve) => setTimeout(() => resolve('slower'), 200))
    ];

    const result = await promiseAny(promises);
    const duration = Date.now() - start;

    expect(result).toBe('fast');
    expect(duration).toBeLessThan(50); // Much faster than 100ms
  });

  test('handles non-promise values', async () => {
    const promises = [42, 'string', true];
    const result = await promiseAny(promises);
    expect(result).toBe(42); // First value
  });

  test('handles empty array', async () => {
    await expect(promiseAny([])).rejects.toThrow(AggregateError);
  });

  test('waits for first fulfillment even if earlier rejections', async () => {
    const promises = [
      Promise.reject('error1'),
      new Promise((resolve) => setTimeout(() => resolve('success'), 50)),
      Promise.reject('error2')
    ];

    const result = await promiseAny(promises);
    expect(result).toBe('success');
  });
});
```

---

## Comparison with Other Promise Methods

```javascript
// Promise.race - first settled (fulfilled OR rejected)
Promise.race([
  Promise.reject('error'),
  Promise.resolve('success')
])
  .catch(err => console.log('Race rejects:', err)); // 'error'

// Promise.any - first FULFILLED only
Promise.any([
  Promise.reject('error'),
  Promise.resolve('success')
])
  .then(val => console.log('Any resolves:', val)); // 'success'

// Promise.all - ALL must succeed
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
])
  .catch(err => console.log('All rejects:', err)); // 'error'

// Promise.allSettled - waits for all, never rejects
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
])
  .then(results => console.log('AllSettled:', results));
  // [{ status: 'fulfilled', value: 1 }, ...]
```

---

## Real-World Use Cases

### 1. Fastest Resource Wins

```javascript
async function fetchFastestMirror(urls) {
  const fetchPromises = urls.map(url =>
    fetch(url).then(r => r.json())
  );

  try {
    // Use whichever server responds first
    const data = await promiseAny(fetchPromises);
    return data;
  } catch (err) {
    // All servers failed
    throw new Error('All mirrors are down');
  }
}

// Usage
const mirrors = [
  'https://mirror1.example.com/api/data',
  'https://mirror2.example.com/api/data',
  'https://mirror3.example.com/api/data'
];

fetchFastestMirror(mirrors)
  .then(data => console.log('Got data from fastest mirror:', data));
```

### 2. Multiple Authentication Providers

```javascript
async function authenticateWithAnyProvider(providers) {
  const authAttempts = providers.map(provider =>
    provider.authenticate()
      .catch(err => {
        console.warn(`${provider.name} auth failed:`, err);
        throw err;
      })
  );

  try {
    const auth = await promiseAny(authAttempts);
    console.log('Authenticated with:', auth.provider);
    return auth;
  } catch (aggErr) {
    console.error('All auth providers failed:', aggErr.errors);
    throw new Error('Authentication failed with all providers');
  }
}
```

### 3. Database Query with Replicas

```javascript
async function queryWithReplicas(query, replicas) {
  const queries = replicas.map(replica =>
    replica.execute(query)
      .catch(err => {
        console.warn(`Replica ${replica.id} failed:`, err);
        throw err;
      })
  );

  try {
    // Use result from fastest replica
    const result = await promiseAny(queries);
    return result;
  } catch (aggErr) {
    // All replicas failed
    throw new Error('Query failed on all database replicas');
  }
}
```

### 4. Feature Detection with Fallbacks

```javascript
async function detectFeatureSupport(features) {
  const checks = features.map(feature =>
    feature.isSupported()
      .then(supported => {
        if (!supported) {
          throw new Error(`${feature.name} not supported`);
        }
        return feature;
      })
  );

  try {
    const supportedFeature = await promiseAny(checks);
    return supportedFeature;
  } catch (err) {
    // No features supported
    throw new Error('No compatible features found');
  }
}
```

---

## Common Mistakes

- ❌ Resolving with first settled (should be first FULFILLED)
- ❌ Not collecting all errors for AggregateError
- ❌ Rejecting on first rejection (should wait for all)
- ❌ Not handling empty array

✅ Only resolve on fulfillment
✅ Collect all rejection reasons
✅ Wait until all promises settle if no fulfillment
✅ Handle edge cases properly

---

## Complexity Analysis

- **Time Complexity:** O(n) - where n is number of promises
- **Space Complexity:** O(n) - storing errors array
- **Actual Runtime:** O(fastest fulfilling promise)

---

[← Back to JavaScript Fundamentals](./README.md)
