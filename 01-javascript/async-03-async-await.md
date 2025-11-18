# Async/Await & Modern Patterns

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 4: Explain async/await syntax. How does it differ from promises?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Netflix, Airbnb

### Question
What is async/await in JavaScript? How does it compare to using promises with .then()? What are the advantages and potential pitfalls of async/await?

### Answer

**Async/Await Basics:**
- **Syntactic sugar** over promises, not a replacement
- `async` function **always returns a promise**
- `await` **pauses** function execution until promise settles
- Makes asynchronous code **look synchronous**

**Key Characteristics:**
- `await` can only be used inside `async` functions (or top-level in modules)
- `await` unwraps promise value (no need for .then())
- Errors can be caught with **try/catch** blocks
- Still **non-blocking** - other code continues to execute
- Returns are automatically wrapped in `Promise.resolve()`

**Advantages over .then():**
- More **readable**, resembles synchronous code
- Easier **error handling** with try/catch
- Better **debugging** (clearer stack traces)
- Simpler **conditionals and loops** with async operations

**Potential Pitfalls:**
- Sequential `await` calls may be **slower** than Promise.all
- Easy to forget `await`, getting promise instead of value
- Try/catch can hide errors if not careful
- Cannot await in regular functions

### Code Example

```javascript
// ============================================
// Example 1: Basic async/await syntax
// ============================================

// Promise-based approach
function getUserPromise(id) {
  return fetch(`/api/user/${id}`)
    .then(response => response.json())
    .then(user => {
      console.log('User:', user);
      return user;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

// Async/await approach (cleaner)
async function getUserAsync(id) {
  try {
    const response = await fetch(`/api/user/${id}`);
    const user = await response.json();
    console.log('User:', user);
    return user;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


// ============================================
// Example 2: Async functions always return promises
// ============================================
async function returnNumber() {
  return 42; // Automatically wrapped in Promise.resolve(42)
}

returnNumber().then(num => {
  console.log(num); // 42
});

// Equivalent to:
function returnNumberPromise() {
  return Promise.resolve(42);
}

// Throwing in async function creates rejected promise
async function throwError() {
  throw new Error('Failed'); // Automatically wrapped in Promise.reject()
}

throwError().catch(error => {
  console.error(error.message); // 'Failed'
});


// ============================================
// Example 3: Error handling comparison
// ============================================

// With promises - single catch
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error('Error:', error));

// With async/await - try/catch
async function loadUserAndPosts() {
  try {
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();

    const postsResponse = await fetch(`/api/posts/${user.id}`);
    const posts = await postsResponse.json();

    console.log(posts);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Multiple try/catch blocks for granular error handling
async function loadDataWithGranularErrors() {
  let user;

  try {
    const response = await fetch('/api/user');
    user = await response.json();
  } catch (error) {
    console.error('Failed to load user:', error);
    return; // Exit early
  }

  try {
    const response = await fetch(`/api/posts/${user.id}`);
    const posts = await response.json();
    console.log('Posts:', posts);
  } catch (error) {
    console.error('Failed to load posts (continuing anyway):', error);
    // Continue with user data only
  }

  return user;
}


// ============================================
// Example 4: Sequential vs parallel execution
// ============================================

// ❌ Slow: Sequential execution (3 seconds total)
async function loadSequential() {
  const user1 = await fetch('/api/user/1').then(r => r.json()); // 1s
  const user2 = await fetch('/api/user/2').then(r => r.json()); // 1s
  const user3 = await fetch('/api/user/3').then(r => r.json()); // 1s

  return [user1, user2, user3];
}

// ✅ Fast: Parallel execution (1 second total)
async function loadParallel() {
  const [user1, user2, user3] = await Promise.all([
    fetch('/api/user/1').then(r => r.json()),
    fetch('/api/user/2').then(r => r.json()),
    fetch('/api/user/3').then(r => r.json())
  ]);

  return [user1, user2, user3];
}

// Alternative parallel syntax
async function loadParallelAlt() {
  // Start all requests simultaneously
  const promise1 = fetch('/api/user/1').then(r => r.json());
  const promise2 = fetch('/api/user/2').then(r => r.json());
  const promise3 = fetch('/api/user/3').then(r => r.json());

  // Wait for all to complete
  const user1 = await promise1;
  const user2 = await promise2;
  const user3 = await promise3;

  return [user1, user2, user3];
}


// ============================================
// Example 5: Conditional logic with async/await
// ============================================

// Complex with promises
function loadUserDataPromise(userId, includePosts) {
  return fetch(`/api/user/${userId}`)
    .then(response => response.json())
    .then(user => {
      if (includePosts) {
        return fetch(`/api/posts/${userId}`)
          .then(response => response.json())
          .then(posts => {
            user.posts = posts;
            return user;
          });
      }
      return user;
    });
}

// Cleaner with async/await
async function loadUserDataAsync(userId, includePosts) {
  const response = await fetch(`/api/user/${userId}`);
  const user = await response.json();

  if (includePosts) {
    const postsResponse = await fetch(`/api/posts/${userId}`);
    user.posts = await postsResponse.json();
  }

  return user;
}


// ============================================
// Example 6: Loops with async/await
// ============================================

// Processing items sequentially
async function processItemsSequential(items) {
  const results = [];

  for (const item of items) {
    const result = await processItem(item); // Wait for each
    results.push(result);
  }

  return results;
}

// Processing items in parallel (faster)
async function processItemsParallel(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises);
}

// Processing with concurrency limit
async function processItemsWithLimit(items, limit = 5) {
  const results = [];

  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }

  return results;
}


// ============================================
// Example 7: Top-level await (ES2022)
// ============================================

// In module files (.mjs or type: "module")
// No need for async wrapper

// Old way:
(async () => {
  const data = await fetch('/api/data').then(r => r.json());
  console.log(data);
})();

// New way (top-level await):
const data = await fetch('/api/data').then(r => r.json());
console.log(data);

// Useful for module initialization
const config = await fetch('/config.json').then(r => r.json());
export default config;


// ============================================
// Example 8: Async/await with Promise.all variants
// ============================================

// Promise.all - fails fast
async function loadAllUsers(ids) {
  try {
    const users = await Promise.all(
      ids.map(id => fetch(`/api/user/${id}`).then(r => r.json()))
    );
    return users; // All succeeded
  } catch (error) {
    console.error('At least one request failed:', error);
    return [];
  }
}

// Promise.allSettled - never rejects
async function loadAllUsersSettled(ids) {
  const results = await Promise.allSettled(
    ids.map(id => fetch(`/api/user/${id}`).then(r => r.json()))
  );

  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  console.log(`Loaded ${successful.length}, failed ${failed.length}`);
  return successful;
}

// Promise.race - first to settle
async function loadWithFallback(primaryUrl, fallbackUrl) {
  try {
    const result = await Promise.race([
      fetch(primaryUrl).then(r => r.json()),
      fetch(fallbackUrl).then(r => r.json())
    ]);
    return result; // Whichever completes first
  } catch (error) {
    console.error('Both requests failed:', error);
    throw error;
  }
}


// ============================================
// Example 9: Retry logic with async/await
// ============================================
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json(); // Success
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed, retrying...`);

      // Wait before retry (exponential backoff)
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Usage
try {
  const data = await fetchWithRetry('/api/data', 3);
  console.log('Data:', data);
} catch (error) {
  console.error('All retries exhausted:', error.message);
}


// ============================================
// Example 10: Timeout with async/await
// ============================================
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
}

async function fetchWithTimeout(url, ms = 5000) {
  try {
    const response = await Promise.race([
      fetch(url),
      timeout(ms)
    ]);

    return await response.json();
  } catch (error) {
    if (error.message === 'Timeout') {
      console.error(`Request timed out after ${ms}ms`);
    }
    throw error;
  }
}

// Usage
try {
  const data = await fetchWithTimeout('/api/slow-endpoint', 3000);
  console.log('Data:', data);
} catch (error) {
  console.error('Request failed:', error.message);
}


// ============================================
// Example 11: Common pitfalls
// ============================================

// ❌ Pitfall 1: Forgetting await
async function loadUserPitfall(id) {
  const user = fetch(`/api/user/${id}`).then(r => r.json());
  console.log(user); // Promise, not user data!
  return user;
}

// ✅ Correct: Always await
async function loadUserCorrect(id) {
  const user = await fetch(`/api/user/${id}`).then(r => r.json());
  console.log(user); // Actual user data
  return user;
}

// ❌ Pitfall 2: Using await in non-async function
function regularFunction() {
  // const data = await fetch('/api/data'); // SyntaxError!
}

// ✅ Correct: Make function async
async function asyncFunction() {
  const data = await fetch('/api/data');
  return data;
}

// ❌ Pitfall 3: Swallowing errors with empty catch
async function silentFailure() {
  try {
    await fetch('/api/data');
  } catch (error) {
    // Empty catch - error disappears!
  }
}

// ✅ Correct: Handle or re-throw errors
async function properErrorHandling() {
  try {
    await fetch('/api/data');
  } catch (error) {
    console.error('Error occurred:', error);
    throw error; // Or handle appropriately
  }
}


// ============================================
// Example 12: Real-world patterns
// ============================================

// Data fetching with loading states
class DataLoader {
  constructor() {
    this.cache = new Map();
  }

  async fetchUser(id) {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    try {
      const response = await fetch(`/api/user/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const user = await response.json();

      // Cache result
      this.cache.set(id, user);

      return user;
    } catch (error) {
      console.error(`Failed to load user ${id}:`, error);
      throw error;
    }
  }

  async fetchMultipleUsers(ids) {
    const results = await Promise.allSettled(
      ids.map(id => this.fetchUser(id))
    );

    return results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
  }
}

// Usage
const loader = new DataLoader();

async function displayUsers() {
  try {
    const users = await loader.fetchMultipleUsers([1, 2, 3]);
    console.log('Loaded users:', users);
  } catch (error) {
    console.error('Failed to display users:', error);
  }
}


// ============================================
// Example 13: Async iterators
// ============================================
async function* fetchPages(url) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    yield data.items; // Yield page data

    hasMore = data.hasNext;
    page++;
  }
}

// Usage
async function processAllPages() {
  for await (const items of fetchPages('/api/items')) {
    console.log('Processing page:', items.length);
    // Process items...
  }
}
```

### Common Mistakes

- ❌ **Mistake:** Forgetting to await async function calls
  ```javascript
  async function getData() {
    const data = fetchData(); // Missing await!
    console.log(data); // Promise, not data
  }
  ```

- ❌ **Mistake:** Making everything sequential when it doesn't need to be
  ```javascript
  // Slow: 6 seconds total
  const user = await fetchUser();
  const posts = await fetchPosts();
  const comments = await fetchComments();

  // Fast: 2 seconds total (all parallel)
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  ```

- ❌ **Mistake:** Using async/await with array methods incorrectly
  ```javascript
  // Doesn't work as expected!
  const results = items.map(async item => {
    return await processItem(item);
  }); // results is array of promises!

  // Correct:
  const results = await Promise.all(
    items.map(async item => await processItem(item))
  );
  ```

- ✅ **Correct:** Understand when to parallelize and how to handle arrays
  ```javascript
  // Sequential when order matters
  for (const item of items) {
    await processItem(item);
  }

  // Parallel when order doesn't matter
  await Promise.all(items.map(item => processItem(item)));
  ```

### Follow-up Questions

- "How would you implement a queue system for async operations with concurrency control?"
- "What happens if you don't await an async function - where does the error go?"
- "Can you use async/await with setTimeout? How would you implement sleep()?"
- "How do async generators work and when would you use them?"
- "What are the performance implications of using async/await vs raw promises?"

### Resources

- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [JavaScript.info: Async/await](https://javascript.info/async-await)
- [Async/Await Best Practices](https://maximorlov.com/linting-rules-for-asynchronous-code-in-javascript/)

---

## Question 8: Explain async iteration - for-await-of and async generators

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Netflix

### Question
How do async iterators work in JavaScript? Explain for-await-of loops and async generators with practical examples.

### Answer

**Async Iteration** allows you to iterate over data that arrives asynchronously (streams, paginated APIs, etc.) using `for-await-of` loops and async generator functions.

**Key Concepts:**

1. **for-await-of Loop** - Iterates over async iterables (promises, async generators)
2. **Async Generators** - Functions that use `async function*` and `yield` to produce async values
3. **AsyncIterator Protocol** - Objects with `next()` method that returns promises
4. **Use Cases** - Streaming data, paginated APIs, file processing, event streams
5. **Error Handling** - try-catch works naturally with for-await-of

### Code Example

```javascript
// ============================================
// 1. BASIC FOR-AWAIT-OF LOOP
// ============================================

// Array of promises
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
];

async function iteratePromises() {
  for await (const value of promises) {
    console.log(value);
  }
}

iteratePromises();
// Output:
// 1
// 2
// 3


// ============================================
// 2. ASYNC GENERATOR FUNCTION
// ============================================

async function* numberGenerator() {
  yield 1;
  await new Promise(resolve => setTimeout(resolve, 1000));
  yield 2;
  await new Promise(resolve => setTimeout(resolve, 1000));
  yield 3;
}

async function useGenerator() {
  for await (const num of numberGenerator()) {
    console.log(num);
  }
}

useGenerator();
// Output (1 second between each):
// 1
// 2
// 3


// ============================================
// 3. PAGINATED API FETCHING
// ============================================

async function* fetchPaginatedUsers(baseUrl) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${baseUrl}?page=${page}&limit=10`);
    const data = await response.json();

    // Yield each user
    for (const user of data.users) {
      yield user;
    }

    hasMore = data.hasMore;
    page++;
  }
}

// Usage
async function processUsers() {
  for await (const user of fetchPaginatedUsers('/api/users')) {
    console.log(user.name);
    // Process user without loading all pages into memory
  }
}


// ============================================
// 4. ASYNC ITERATOR PROTOCOL (Manual Implementation)
// ============================================

const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0;

    return {
      async next() {
        if (i < 3) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

async function iterate() {
  for await (const value of asyncIterable) {
    console.log(value);
  }
}

iterate();
// Output (500ms between each):
// 0
// 1
// 2


// ============================================
// 5. STREAMING FILE PROCESSING
// ============================================

async function* readLargeFile(filePath) {
  const fileHandle = await openFile(filePath);
  const chunkSize = 1024 * 64; // 64KB chunks

  try {
    let chunk;
    while ((chunk = await fileHandle.read(chunkSize))) {
      if (chunk.length === 0) break;
      yield chunk;
    }
  } finally {
    await fileHandle.close();
  }
}

// Usage
async function processFile() {
  let totalBytes = 0;

  for await (const chunk of readLargeFile('large-file.txt')) {
    totalBytes += chunk.length;
    processChunk(chunk);
  }

  console.log(`Processed ${totalBytes} bytes`);
}


// ============================================
// 6. ASYNC GENERATOR WITH ERROR HANDLING
// ============================================

async function* fetchWithRetry(urls) {
  for (const url of urls) {
    let retries = 3;

    while (retries > 0) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        yield { url, data, success: true };
        break;
      } catch (error) {
        retries--;

        if (retries === 0) {
          yield { url, error: error.message, success: false };
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
}

// Usage
async function fetchAll() {
  const urls = ['/api/data1', '/api/data2', '/api/data3'];

  for await (const result of fetchWithRetry(urls)) {
    if (result.success) {
      console.log('Success:', result.url, result.data);
    } else {
      console.error('Failed:', result.url, result.error);
    }
  }
}


// ============================================
// 7. COMBINING ASYNC GENERATORS
// ============================================

async function* mergeAsyncGenerators(...generators) {
  const iterators = generators.map(g => g[Symbol.asyncIterator]());

  while (iterators.length > 0) {
    const results = await Promise.all(
      iterators.map(it => it.next())
    );

    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].done) {
        iterators.splice(i, 1);
      } else {
        yield results[i].value;
      }
    }
  }
}

// Usage
async function* gen1() {
  yield 1; await delay(100);
  yield 2; await delay(100);
}

async function* gen2() {
  yield 'a'; await delay(100);
  yield 'b'; await delay(100);
}

async function combine() {
  for await (const value of mergeAsyncGenerators(gen1(), gen2())) {
    console.log(value);
  }
}


// ============================================
// 8. ASYNC QUEUE IMPLEMENTATION
// ============================================

class AsyncQueue {
  constructor() {
    this.queue = [];
    this.resolvers = [];
  }

  enqueue(item) {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift();
      resolve({ value: item, done: false });
    } else {
      this.queue.push(item);
    }
  }

  end() {
    for (const resolve of this.resolvers) {
      resolve({ done: true });
    }
    this.resolvers = [];
  }

  [Symbol.asyncIterator]() {
    return {
      next: () => {
        if (this.queue.length > 0) {
          return Promise.resolve({
            value: this.queue.shift(),
            done: false
          });
        }

        return new Promise(resolve => {
          this.resolvers.push(resolve);
        });
      }
    };
  }
}

// Usage
const queue = new AsyncQueue();

// Producer
setTimeout(() => queue.enqueue('First'), 1000);
setTimeout(() => queue.enqueue('Second'), 2000);
setTimeout(() => queue.enqueue('Third'), 3000);
setTimeout(() => queue.end(), 4000);

// Consumer
async function consume() {
  for await (const item of queue) {
    console.log('Received:', item);
  }
  console.log('Queue ended');
}

consume();


// ============================================
// 9. REAL-TIME EVENT STREAM
// ============================================

async function* watchServerEvents(url) {
  const eventSource = new EventSource(url);

  try {
    while (true) {
      const event = await new Promise((resolve, reject) => {
        eventSource.onmessage = resolve;
        eventSource.onerror = reject;
      });

      yield JSON.parse(event.data);
    }
  } finally {
    eventSource.close();
  }
}

// Usage
async function processEvents() {
  try {
    for await (const event of watchServerEvents('/api/events')) {
      console.log('Event received:', event);

      if (event.type === 'shutdown') {
        break;
      }
    }
  } catch (error) {
    console.error('Event stream error:', error);
  }
}


// ============================================
// 10. ASYNC GENERATOR WITH THROTTLING
// ============================================

async function* throttle(iterable, delay) {
  const startTime = Date.now();
  let count = 0;

  for await (const value of iterable) {
    count++;
    const elapsed = Date.now() - startTime;
    const expectedTime = count * delay;
    const waitTime = expectedTime - elapsed;

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    yield value;
  }
}

// Usage
async function* fastSource() {
  for (let i = 0; i < 10; i++) {
    yield i;
  }
}

async function throttledProcessing() {
  // Process at most 1 item per 500ms
  for await (const value of throttle(fastSource(), 500)) {
    console.log(value);
  }
}


// ============================================
// 11. ASYNC GENERATOR RETURN VALUE
// ============================================

async function* generatorWithReturn() {
  yield 1;
  yield 2;
  return 'Final value'; // Return value
}

async function useReturnValue() {
  const gen = generatorWithReturn();

  console.log(await gen.next()); // { value: 1, done: false }
  console.log(await gen.next()); // { value: 2, done: false }
  console.log(await gen.next()); // { value: 'Final value', done: true }

  // for-await-of ignores return value
  for await (const value of generatorWithReturn()) {
    console.log(value); // Only logs 1, 2 (not 'Final value')
  }
}


// ============================================
// 12. TRANSFORMING ASYNC STREAMS
// ============================================

async function* map(iterable, fn) {
  for await (const value of iterable) {
    yield await fn(value);
  }
}

async function* filter(iterable, predicate) {
  for await (const value of iterable) {
    if (await predicate(value)) {
      yield value;
    }
  }
}

async function* take(iterable, count) {
  let i = 0;
  for await (const value of iterable) {
    if (i++ >= count) break;
    yield value;
  }
}

// Usage
async function processStream() {
  const numbers = async function*() {
    for (let i = 1; i <= 100; i++) {
      yield i;
    }
  };

  const stream = take(
    filter(
      map(numbers(), async n => n * 2),
      async n => n % 3 === 0
    ),
    5
  );

  for await (const value of stream) {
    console.log(value); // First 5 multiples of 6
  }
}


// ============================================
// 13. ERROR HANDLING IN ASYNC ITERATION
// ============================================

async function* faultyGenerator() {
  yield 1;
  yield 2;
  throw new Error('Generator error!');
  yield 3; // Never reached
}

async function handleErrors() {
  try {
    for await (const value of faultyGenerator()) {
      console.log(value);
    }
  } catch (error) {
    console.error('Caught error:', error.message);
  }
  console.log('Continued after error');
}

handleErrors();
// Output:
// 1
// 2
// Caught error: Generator error!
// Continued after error
```

### Common Mistakes

- ❌ **Mistake:** Using regular for-of with async iterators
  ```javascript
  // ❌ Won't work!
  for (const value of asyncIterable) {
    console.log(value); // Logs promises, not values!
  }

  // ✅ Correct
  for await (const value of asyncIterable) {
    console.log(value); // Logs actual values
  }
  ```

- ❌ **Mistake:** Forgetting async in generator function
  ```javascript
  // ❌ Wrong - not async
  function* generator() {
    yield await fetch('/api'); // Error!
  }

  // ✅ Correct
  async function* generator() {
    yield await fetch('/api').then(r => r.json());
  }
  ```

- ❌ **Mistake:** Not handling errors in async iteration
  ```javascript
  // ❌ Unhandled errors
  for await (const item of fetchData()) {
    process(item); // If fetchData throws, crashes
  }

  // ✅ Proper error handling
  try {
    for await (const item of fetchData()) {
      process(item);
    }
  } catch (error) {
    console.error('Error during iteration:', error);
  }
  ```

- ✅ **Best Practice:** Clean up resources
  ```javascript
  async function* resourceGenerator() {
    const resource = await openResource();

    try {
      yield* processResource(resource);
    } finally {
      await resource.close(); // Always cleanup
    }
  }
  ```

### Follow-up Questions

- "How would you implement an async iterator that polls an API every N seconds?"
- "What's the difference between for-await-of and Promise.all?"
- "How do you cancel an async generator?"
- "Can you convert a Node.js stream to an async iterable?"
- "How would you implement backpressure in an async generator?"

### Resources

- [MDN: for-await-of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [MDN: Async iteration and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*)
- [JavaScript.info: Async iteration and generators](https://javascript.info/async-iterators-generators)

---

