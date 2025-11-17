# Promises & Error Handling

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 3: How do Promises work in JavaScript? Explain promise chaining and error handling

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
What are Promises in JavaScript? How do you create them, chain them, and handle errors? What are the three states of a Promise?

### Answer

**Promise Basics:**
- A Promise is an **object representing eventual completion or failure** of an async operation
- Created with `new Promise((resolve, reject) => { })` constructor
- Returns a promise object immediately, settles (resolves/rejects) later

**Three States:**
1. **Pending:** Initial state, neither fulfilled nor rejected
2. **Fulfilled:** Operation completed successfully (resolved with value)
3. **Rejected:** Operation failed (rejected with reason/error)

**Important characteristics:**
- A promise can only settle **once** (immutable result)
- **Cannot change** from fulfilled to rejected or vice versa
- Promises are **not cancellable** once started
- Handlers (.then/.catch) always execute asynchronously (microtasks)

**Promise Chaining:**
- `.then()` returns a **new promise**, enabling chaining
- Each `.then()` can **transform** the value for the next handler
- Errors **propagate down** the chain until caught
- Return value from `.then()` becomes the resolved value for next `.then()`

### Code Example

```javascript
// ============================================
// Example 1: Creating a basic Promise
// ============================================
const promise = new Promise((resolve, reject) => {
  // Async operation
  const success = true;

  setTimeout(() => {
    if (success) {
      resolve('Operation successful!'); // Fulfills promise
    } else {
      reject(new Error('Operation failed!')); // Rejects promise
    }
  }, 1000);
});

promise
  .then(result => {
    console.log(result); // "Operation successful!"
  })
  .catch(error => {
    console.error(error.message);
  });


// ============================================
// Example 2: Promise states
// ============================================
const pendingPromise = new Promise((resolve) => {
  setTimeout(() => resolve('done'), 1000);
});

console.log(pendingPromise); // Promise { <pending> }

setTimeout(() => {
  console.log(pendingPromise); // Promise { 'done' }
}, 1500);

// Once settled, state never changes
const fulfilledPromise = Promise.resolve('value');
console.log(fulfilledPromise); // Promise { 'value' }

const rejectedPromise = Promise.reject(new Error('error'));
console.log(rejectedPromise); // Promise { <rejected> Error: error }


// ============================================
// Example 3: Promise chaining
// ============================================
fetch('/api/user/1')
  .then(response => {
    console.log('Got response');
    return response.json(); // Returns new promise
  })
  .then(user => {
    console.log('Parsed user:', user.name);
    return fetch(`/api/posts/${user.id}`); // Returns new promise
  })
  .then(response => {
    return response.json();
  })
  .then(posts => {
    console.log('User posts:', posts);
  })
  .catch(error => {
    console.error('Error anywhere in chain:', error);
  });


// ============================================
// Example 4: Transforming values in chain
// ============================================
Promise.resolve(5)
  .then(num => {
    console.log(num); // 5
    return num * 2; // Pass 10 to next .then()
  })
  .then(num => {
    console.log(num); // 10
    return num + 3; // Pass 13 to next .then()
  })
  .then(num => {
    console.log(num); // 13
    return `Result: ${num}`;
  })
  .then(result => {
    console.log(result); // "Result: 13"
  });


// ============================================
// Example 5: Error handling patterns
// ============================================

// Pattern 1: Single catch at the end
Promise.resolve()
  .then(() => {
    throw new Error('Error in step 1');
  })
  .then(() => {
    console.log('This will not execute');
  })
  .catch(error => {
    console.error('Caught:', error.message); // Catches error from any .then()
  });

// Pattern 2: Multiple catch blocks
Promise.resolve()
  .then(() => {
    throw new Error('Error 1');
  })
  .catch(error => {
    console.error('Caught error 1:', error.message);
    return 'recovered'; // Chain continues
  })
  .then(value => {
    console.log('Continuing with:', value); // "recovered"
    throw new Error('Error 2');
  })
  .catch(error => {
    console.error('Caught error 2:', error.message);
  });

// Pattern 3: finally (always executes)
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    console.log('Data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  })
  .finally(() => {
    console.log('Cleanup always runs'); // Runs regardless of success/failure
  });


// ============================================
// Example 6: Common Promise patterns
// ============================================

// Promisifying callback-based functions
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Delay utility
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

delay(1000).then(() => console.log('1 second later'));

// Timeout wrapper
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timeout]);
}

withTimeout(fetch('/api/data'), 5000)
  .then(response => console.log('Completed in time'))
  .catch(error => console.error('Timed out or failed'));


// ============================================
// Example 7: Returning promises vs values
// ============================================

// Returning a value
Promise.resolve(1)
  .then(num => {
    return num + 1; // Returns value
  })
  .then(num => {
    console.log(num); // 2
  });

// Returning a promise
Promise.resolve(1)
  .then(num => {
    return Promise.resolve(num + 1); // Returns promise
  })
  .then(num => {
    console.log(num); // 2 (unwrapped automatically)
  });

// Returning nothing (undefined)
Promise.resolve(1)
  .then(num => {
    console.log(num); // 1
    // No return statement
  })
  .then(num => {
    console.log(num); // undefined
  });


// ============================================
// Example 8: Error propagation
// ============================================
Promise.resolve()
  .then(() => {
    return fetch('/api/user'); // Might fail
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`); // Explicit throw
    }
    return response.json();
  })
  .then(user => {
    console.log('User:', user);
  })
  .catch(error => {
    // Catches network errors, parse errors, and thrown errors
    console.error('Failed to load user:', error.message);
  });


// ============================================
// Example 9: Promise constructor patterns
// ============================================

// Async operation wrapper
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Simulating API call
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: 'John' });
      } else {
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}

fetchUserData(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error.message));

// Validation wrapper
function validateAndFetch(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL'));
      return; // Important: exit after reject
    }

    fetch(url)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}


// ============================================
// Example 10: Anti-patterns to avoid
// ============================================

// ❌ Anti-pattern 1: Nesting promises (promise hell)
fetch('/api/user')
  .then(response => {
    return response.json().then(user => {
      return fetch(`/api/posts/${user.id}`).then(response => {
        return response.json().then(posts => {
          console.log(posts); // Deeply nested
        });
      });
    });
  });

// ✅ Correct: Flat promise chain
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts));

// ❌ Anti-pattern 2: Not returning promises
fetch('/api/user')
  .then(response => {
    response.json(); // Missing return!
  })
  .then(user => {
    console.log(user); // undefined!
  });

// ✅ Correct: Always return
fetch('/api/user')
  .then(response => response.json()) // Returns promise
  .then(user => console.log(user)); // Gets user object

// ❌ Anti-pattern 3: Uncaught rejections
const promise = Promise.reject(new Error('Failed'));
// No .catch() handler - unhandled rejection warning

// ✅ Correct: Always handle rejections
Promise.reject(new Error('Failed'))
  .catch(error => console.error('Handled:', error.message));


// ============================================
// Example 11: Advanced chaining scenarios
// ============================================

// Conditional chaining
function loadUserAndMaybePosts(userId, includePosts = false) {
  return fetch(`/api/user/${userId}`)
    .then(response => response.json())
    .then(user => {
      if (includePosts) {
        return fetch(`/api/posts/${userId}`)
          .then(response => response.json())
          .then(posts => ({ ...user, posts })); // Merge user and posts
      }
      return user; // Return user only
    });
}

// Parallel operations within chain
fetch('/api/user/1')
  .then(response => response.json())
  .then(user => {
    // Start multiple operations in parallel
    return Promise.all([
      fetch(`/api/posts/${user.id}`).then(r => r.json()),
      fetch(`/api/comments/${user.id}`).then(r => r.json()),
      fetch(`/api/likes/${user.id}`).then(r => r.json())
    ]).then(([posts, comments, likes]) => {
      return { user, posts, comments, likes };
    });
  })
  .then(data => {
    console.log('All data loaded:', data);
  });


// ============================================
// Example 12: Real-world usage patterns
// ============================================

// API client with error handling
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  request(endpoint, options = {}) {
    return fetch(`${this.baseURL}${endpoint}`, options)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .then(error => {
              throw new Error(error.message || 'Request failed');
            })
            .catch(() => {
              throw new Error(`HTTP ${response.status}`);
            });
        }
        return response.json();
      })
      .catch(error => {
        console.error('API request failed:', error);
        throw error; // Re-throw for caller to handle
      });
  }

  getUser(id) {
    return this.request(`/users/${id}`);
  }

  updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

const api = new APIClient('https://api.example.com');

api.getUser(123)
  .then(user => {
    console.log('User loaded:', user);
    return api.updateUser(123, { name: 'Updated' });
  })
  .then(updatedUser => {
    console.log('User updated:', updatedUser);
  })
  .catch(error => {
    console.error('Operation failed:', error.message);
  });


// ============================================
// Example 13: Promise static methods
// ============================================

// Promise.resolve() - immediately resolved
const resolved = Promise.resolve('value');
resolved.then(v => console.log(v)); // 'value'

// Promise.reject() - immediately rejected
const rejected = Promise.reject(new Error('error'));
rejected.catch(e => console.error(e.message)); // 'error'

// Wrapping non-promise values
Promise.resolve(42).then(v => console.log(v)); // 42
Promise.resolve(Promise.resolve(42)).then(v => console.log(v)); // 42 (flattened)
```

### Common Mistakes

- ❌ **Mistake:** Forgetting to return promises in chain
  ```javascript
  fetch('/api/user')
    .then(response => {
      response.json(); // Missing return!
    })
    .then(user => {
      console.log(user); // undefined
    });
  ```

- ❌ **Mistake:** Creating promise hell with nesting
  ```javascript
  fetch('/api/user').then(r1 => {
    r1.json().then(user => {
      fetch('/api/posts').then(r2 => {
        r2.json().then(posts => {
          // Too nested!
        });
      });
    });
  });
  ```

- ❌ **Mistake:** Not handling rejections
  ```javascript
  const promise = fetch('/api/data').then(r => r.json());
  // No .catch() - unhandled rejection if fetch fails
  ```

- ✅ **Correct:** Proper chaining and error handling
  ```javascript
  fetch('/api/user')
    .then(response => response.json()) // Return promise
    .then(user => fetch(`/api/posts/${user.id}`)) // Return promise
    .then(response => response.json()) // Return promise
    .then(posts => console.log(posts))
    .catch(error => console.error(error)); // Handle all errors
  ```

### Follow-up Questions

- "What is the difference between Promise.all and Promise.allSettled?"
- "How would you implement a retry mechanism for failed promises?"
- "Can you cancel a promise? If not, how would you work around it?"
- "What is promise resolve thenable, and how does it work?"
- "How do you handle promise memory leaks in long-running applications?"

### Resources

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info: Promises](https://javascript.info/promise-basics)
- [JavaScript.info: Promise chaining](https://javascript.info/promise-chaining)
- [You Don't Know JS: Async & Performance](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/async%20&%20performance/ch3.md)

---

## Question 5: Explain Promise.all, Promise.race, Promise.allSettled, and Promise.any

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Meta, Amazon, Apple, Netflix

### Question
What are the differences between Promise.all, Promise.race, Promise.allSettled, and Promise.any? When would you use each one? What happens when promises reject?

### Answer

**Promise.all(promises):**
- Waits for **all** promises to fulfill
- Returns **array of results** in same order as input
- **Fails fast**: Rejects immediately if ANY promise rejects
- Use when: All operations must succeed

**Promise.race(promises):**
- Returns **first settled** promise (fulfilled or rejected)
- Ignores remaining promises (they still run, but results ignored)
- Use when: Only need fastest result, timeout implementations

**Promise.allSettled(promises):**
- Waits for **all** promises to settle (fulfill OR reject)
- **Never rejects** - always fulfills with array of results
- Each result has `{status, value}` or `{status, reason}`
- Use when: Need results from all, regardless of success/failure

**Promise.any(promises):**
- Returns **first fulfilled** promise
- Ignores rejections until all promises reject
- Rejects only if ALL promises reject (AggregateError)
- Use when: Need any successful result, fallback scenarios

### Code Example

```javascript
// ============================================
// Example 1: Promise.all - all must succeed
// ============================================

// All succeed
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});

// One fails - entire operation fails
Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3)
])
.then(results => {
  console.log('Success:', results); // Never executes
})
.catch(error => {
  console.error('Failed:', error.message); // "Failed"
  // Note: We don't know about result 1 or 3
});

// Real-world example: Loading multiple resources
async function loadPageData() {
  try {
    const [user, posts, comments] = await Promise.all([
      fetch('/api/user/1').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);

    console.log('All data loaded:', { user, posts, comments });
    return { user, posts, comments };
  } catch (error) {
    console.error('Failed to load page data:', error);
    // Can't render page if any resource fails
    throw error;
  }
}


// ============================================
// Example 2: Promise.race - first to settle wins
// ============================================

// First to resolve
Promise.race([
  new Promise(resolve => setTimeout(() => resolve('slow'), 2000)),
  new Promise(resolve => setTimeout(() => resolve('fast'), 100))
]).then(result => {
  console.log(result); // "fast"
});

// First to reject
Promise.race([
  new Promise((_, reject) => setTimeout(() => reject('error'), 100)),
  new Promise(resolve => setTimeout(() => resolve('success'), 200))
])
.then(result => {
  console.log(result); // Never executes
})
.catch(error => {
  console.error(error); // "error"
});

// Timeout implementation
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error or timeout:', error.message));

// First successful API (primary/fallback)
Promise.race([
  fetch('https://api-primary.com/data'),
  fetch('https://api-backup.com/data')
])
.then(response => response.json())
.then(data => console.log('Got data from fastest server:', data));


// ============================================
// Example 3: Promise.allSettled - all results matter
// ============================================

Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3),
  Promise.reject(new Error('Also failed'))
]).then(results => {
  console.log(results);
  /* [
    { status: 'fulfilled', value: 1 },
    { status: 'rejected', reason: Error: Failed },
    { status: 'fulfilled', value: 3 },
    { status: 'rejected', reason: Error: Also failed }
  ] */

  // Process results
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  console.log('Successful:', successful); // [1, 3]
  console.log('Failed:', failed.length); // 2
});

// Real-world: Load multiple users (some may not exist)
async function loadUsers(ids) {
  const results = await Promise.allSettled(
    ids.map(id =>
      fetch(`/api/user/${id}`)
        .then(r => {
          if (!r.ok) throw new Error(`User ${id} not found`);
          return r.json();
        })
    )
  );

  const users = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const errors = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason.message);

  console.log(`Loaded ${users.length} users, ${errors.length} failed`);

  return { users, errors };
}

loadUsers([1, 2, 999, 3, 888]).then(result => {
  console.log('Result:', result);
  // { users: [user1, user2, user3], errors: ['User 999...', 'User 888...'] }
});


// ============================================
// Example 4: Promise.any - first success wins
// ============================================

// First to fulfill
Promise.any([
  Promise.reject(new Error('Error 1')),
  new Promise(resolve => setTimeout(() => resolve('Success!'), 100)),
  Promise.reject(new Error('Error 2'))
]).then(result => {
  console.log(result); // "Success!"
});

// All rejected - AggregateError
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.reject(new Error('Error 3'))
])
.then(result => {
  console.log(result); // Never executes
})
.catch(error => {
  console.error(error); // AggregateError
  console.error(error.errors); // [Error: Error 1, Error: Error 2, Error: Error 3]
});

// Real-world: Multiple image CDNs
async function loadImageFromCDN(imagePath) {
  const cdnUrls = [
    `https://cdn1.example.com/${imagePath}`,
    `https://cdn2.example.com/${imagePath}`,
    `https://cdn3.example.com/${imagePath}`
  ];

  try {
    const response = await Promise.any(
      cdnUrls.map(url => fetch(url))
    );

    if (!response.ok) {
      throw new Error('Image not found on any CDN');
    }

    return await response.blob();
  } catch (error) {
    console.error('All CDNs failed:', error);
    throw error;
  }
}


// ============================================
// Example 5: Comparison of all four methods
// ============================================
const promises = [
  new Promise(resolve => setTimeout(() => resolve('A'), 1000)),
  new Promise((_, reject) => setTimeout(() => reject('B error'), 500)),
  new Promise(resolve => setTimeout(() => resolve('C'), 1500))
];

// Promise.all - fails fast
Promise.all(promises)
  .then(r => console.log('all:', r))
  .catch(e => console.log('all error:', e)); // "all error: B error"

// Promise.race - first to settle
Promise.race(promises)
  .then(r => console.log('race:', r))
  .catch(e => console.log('race error:', e)); // "race error: B error" (first to settle)

// Promise.allSettled - all results
Promise.allSettled(promises)
  .then(r => console.log('allSettled:', r));
  // All three results with status

// Promise.any - first success
Promise.any(promises)
  .then(r => console.log('any:', r)) // "any: A" (first success)
  .catch(e => console.log('any error:', e));


// ============================================
// Example 6: Timing and performance
// ============================================

// Promise.all - waits for slowest
console.time('all');
Promise.all([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('all'); // ~300ms (slowest)
});

// Promise.race - waits for fastest
console.time('race');
Promise.race([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('race'); // ~100ms (fastest)
});

// Promise.allSettled - waits for slowest (like .all)
console.time('allSettled');
Promise.allSettled([
  delay(100),
  delay(200),
  delay(300)
]).then(() => {
  console.timeEnd('allSettled'); // ~300ms (slowest)
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ============================================
// Example 7: Practical use cases
// ============================================

// Use case 1: Parallel validation (all must pass)
async function validateForm(formData) {
  try {
    await Promise.all([
      validateEmail(formData.email),
      validatePassword(formData.password),
      validateUsername(formData.username)
    ]);

    console.log('All validations passed');
    return true;
  } catch (error) {
    console.error('Validation failed:', error.message);
    return false;
  }
}

// Use case 2: Competitive requests (fastest wins)
async function getCurrencyRate(from, to) {
  const apis = [
    fetch(`https://api1.com/rate/${from}/${to}`),
    fetch(`https://api2.com/rate/${from}/${to}`),
    fetch(`https://api3.com/rate/${from}/${to}`)
  ];

  try {
    const response = await Promise.race(apis);
    return await response.json();
  } catch (error) {
    console.error('All APIs too slow or failed');
    throw error;
  }
}

// Use case 3: Partial success acceptable
async function sendNotifications(users, message) {
  const results = await Promise.allSettled(
    users.map(user => sendEmail(user.email, message))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Sent: ${sent}, Failed: ${failed}`);

  return {
    sent,
    failed,
    details: results
  };
}

// Use case 4: Fallback servers (any success)
async function fetchFromMirrors(path) {
  const mirrors = [
    fetch(`https://mirror1.com/${path}`),
    fetch(`https://mirror2.com/${path}`),
    fetch(`https://mirror3.com/${path}`)
  ];

  try {
    const response = await Promise.any(mirrors);
    return await response.json();
  } catch (error) {
    console.error('All mirrors failed:', error.errors);
    throw new Error('Resource unavailable from all mirrors');
  }
}


// ============================================
// Example 8: Custom implementations
// ============================================

// Implementing Promise.all manually
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject); // Fail fast
    });
  });
}

// Implementing Promise.allSettled manually
function promiseAllSettled(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}


// ============================================
// Example 9: Error handling patterns
// ============================================

// With Promise.all
async function loadAllOrNone() {
  try {
    const data = await Promise.all([
      fetchData1(),
      fetchData2(),
      fetchData3()
    ]);
    return data;
  } catch (error) {
    console.error('Operation failed, no partial results');
    throw error;
  }
}

// With Promise.allSettled
async function loadAllWithPartial() {
  const results = await Promise.allSettled([
    fetchData1(),
    fetchData2(),
    fetchData3()
  ]);

  const data = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (data.length === 0) {
    throw new Error('All requests failed');
  }

  return data; // Return whatever succeeded
}

// With Promise.any
async function loadFirstSuccess() {
  try {
    const data = await Promise.any([
      fetchData1(),
      fetchData2(),
      fetchData3()
    ]);
    return data;
  } catch (error) {
    console.error('All sources failed:', error.errors);
    throw new Error('No data available from any source');
  }
}


// ============================================
// Example 10: Advanced patterns
// ============================================

// Batch processing with concurrency limit
async function processBatchesWithLimit(items, batchSize, processor) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );

    results.push(...batchResults);

    console.log(`Processed batch ${i / batchSize + 1}`);
  }

  return results;
}

// Retry with fallbacks
async function fetchWithFallbacks(urls, maxRetries = 3) {
  for (const url of urls) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log(`${url} attempt ${attempt} failed`);

        if (attempt === maxRetries) {
          console.log(`${url} exhausted, trying next URL`);
        }
      }
    }
  }

  throw new Error('All URLs and retries exhausted');
}

// First N successes
async function getFirstNSuccesses(promises, n) {
  const results = [];

  for (const promise of promises) {
    try {
      const result = await promise;
      results.push(result);

      if (results.length === n) {
        return results;
      }
    } catch (error) {
      // Continue to next promise
      console.log('Promise failed, trying next');
    }
  }

  if (results.length < n) {
    throw new Error(`Only got ${results.length} successes, needed ${n}`);
  }

  return results;
}
```

### Common Mistakes

- ❌ **Mistake:** Using Promise.all when partial success is acceptable
  ```javascript
  // Fails if any request fails
  const data = await Promise.all([
    fetchOptionalData1(), // Might not exist
    fetchOptionalData2(),
    fetchOptionalData3()
  ]);
  // Should use Promise.allSettled instead
  ```

- ❌ **Mistake:** Thinking Promise.race cancels other promises
  ```javascript
  Promise.race([
    longRunningTask(),
    timeout(1000)
  ]);
  // longRunningTask() continues running even after timeout wins!
  ```

- ❌ **Mistake:** Not handling AggregateError from Promise.any
  ```javascript
  Promise.any([...promises])
    .catch(error => {
      console.log(error.message); // Not enough info
      // Should check error.errors array
    });
  ```

- ✅ **Correct:** Choose the right method for your use case
  ```javascript
  // All must succeed
  await Promise.all(criticalRequests);

  // Get all results regardless
  await Promise.allSettled(nonCriticalRequests);

  // Need any one success
  await Promise.any(fallbackSources);

  // Need fastest result
  await Promise.race([primary, backup]);
  ```

### Follow-up Questions

- "How would you implement a Promise.some that resolves when N promises succeed?"
- "What happens to promises that 'lose' in Promise.race - do they get cancelled?"
- "How would you implement a timeout for Promise.all?"
- "Can you implement Promise.map with concurrency limit using these methods?"
- "What are the memory implications of using Promise.allSettled with many promises?"

### Resources

- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN: Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [MDN: Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [MDN: Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [JavaScript.info: Promise API](https://javascript.info/promise-api)

---

## Question 11: What are common async error handling strategies?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
How do you handle errors in async code? Explain different strategies for error handling, retry logic, and graceful degradation.

### Answer

**Async error handling** requires careful consideration to prevent unhandled rejections, provide user feedback, and maintain application stability.

**Key Strategies:**

1. **Try-Catch with Async/Await** - Wrap async operations in try-catch blocks
2. **Promise .catch()** - Handle rejections in promise chains
3. **Error Boundaries** - Catch errors at component level (React)
4. **Retry Logic** - Automatically retry failed operations with backoff
5. **Graceful Degradation** - Continue with partial data when some operations fail

### Code Example

```javascript
// ============================================
// 1. BASIC TRY-CATCH
// ============================================

async function fetchUser(id) {
  try {
    const response = await fetch(`/api/user/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error; // Re-throw or handle
  }
}


// ============================================
// 2. RETRY WITH EXPONENTIAL BACKOFF
// ============================================

async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry(attempt, waitTime, error);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError.message}`);
}

// Usage
const data = await retry(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 5,
    delay: 1000,
    backoff: 2,
    onRetry: (attempt, wait) => {
      console.log(`Retry ${attempt} after ${wait}ms`);
    }
  }
);


// ============================================
// 3. CIRCUIT BREAKER PATTERN
// ============================================

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn('Circuit breaker opened!');
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

try {
  const data = await breaker.execute(() =>
    fetch('/api/data').then(r => r.json())
  );
} catch (error) {
  console.error('Request failed or circuit open:', error);
}


// ============================================
// 4. GRACEFUL DEGRADATION
// ============================================

async function loadDashboard(userId) {
  const results = await Promise.allSettled([
    fetchUserProfile(userId),
    fetchUserPosts(userId),
    fetchRecommendations(userId),
    fetchNotifications(userId)
  ]);

  const [profile, posts, recommendations, notifications] = results;

  // Critical data - must succeed
  if (profile.status === 'rejected') {
    throw new Error('Cannot load dashboard without user profile');
  }

  // Build dashboard with available data
  return {
    user: profile.value,
    posts: posts.status === 'fulfilled' ? posts.value : [],
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
    notifications: notifications.status === 'fulfilled' ? notifications.value : [],
    errors: results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message)
  };
}


// ============================================
// 5. GLOBAL ERROR HANDLER
// ============================================

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Report to error tracking service
  reportError(event.reason);

  // Prevent default browser behavior
  event.preventDefault();
});

// Catch global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  reportError(event.error);
});


// ============================================
// 6. TIMEOUT WITH ERROR
// ============================================

async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}


// ============================================
// 7. ERROR AGGREGATION
// ============================================

async function fetchMultiple(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(r => r.json()))
  );

  const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected').map(r => ({
    url: urls[results.indexOf(r)],
    error: r.reason.message
  }));

  if (failed.length > 0) {
    console.warn(`${failed.length} requests failed:`, failed);
  }

  if (successful.length === 0) {
    throw new Error('All requests failed');
  }

  return { data: successful, errors: failed };
}
```

### Common Mistakes

- ❌ **Mistake:** Not handling errors in async functions
  ```javascript
  // ❌ Unhandled error!
  async function loadData() {
    const data = await fetch('/api/data').then(r => r.json());
    return data; // What if fetch fails?
  }

  // ✅ Always wrap in try-catch
  async function loadData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    }
  }
  ```

- ❌ **Mistake:** Swallowing errors silently
  ```javascript
  // ❌ Silent failure!
  try {
    await fetchData();
  } catch (error) {
    // Do nothing - user never knows it failed
  }

  // ✅ At minimum, log the error
  try {
    await fetchData();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    showErrorToUser('Unable to load data');
  }
  ```

### Follow-up Questions

- "How would you implement a retry with jitter to avoid thundering herd?"
- "What's the difference between fail-fast and fail-safe strategies?"
- "How do you test error handling in async code?"
- "When should you use circuit breaker vs simple retry?"

### Resources

- [Error Handling in JavaScript](https://javascript.info/try-catch)
- [Promise Error Handling](https://javascript.info/promise-error-handling)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)

---

