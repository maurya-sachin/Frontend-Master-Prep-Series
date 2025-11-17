# Asynchronous JavaScript Fundamentals

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: Explain synchronous vs asynchronous code execution in JavaScript

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
What is the difference between synchronous and asynchronous code execution in JavaScript? Why is asynchronous programming important for web applications?

### Answer

**Synchronous execution:**
- Code runs **sequentially**, one line at a time
- Each operation must **complete** before the next one starts
- **Blocks** the main thread while waiting for operations to finish
- Simple and predictable flow of execution

**Asynchronous execution:**
- Code can run **concurrently** without blocking
- Operations can be **initiated** and continue in the background
- Allows the program to **continue** while waiting for time-consuming tasks
- Uses callbacks, promises, or async/await to handle results

**Why asynchronous is crucial:**
- **User experience:** Prevents UI freezing during network requests or heavy computations
- **Performance:** Makes efficient use of I/O operations (file reads, API calls)
- **Responsiveness:** Application remains interactive while waiting for operations
- **Scalability:** Handles multiple operations simultaneously without spawning threads

### Code Example

```javascript
// ============================================
// Example 1: Synchronous blocking code
// ============================================
console.log('Start');

function slowOperation() {
  // Simulating slow operation with blocking loop
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Blocks for 3 seconds
  }
  return 'Done';
}

console.log(slowOperation()); // Blocks here for 3 seconds
console.log('End');

// Output (takes 3+ seconds):
// Start
// Done (after 3 seconds)
// End


// ============================================
// Example 2: Asynchronous non-blocking code
// ============================================
console.log('Start');

setTimeout(() => {
  console.log('Timeout callback');
}, 3000);

console.log('End');

// Output (immediate):
// Start
// End
// Timeout callback (after 3 seconds)


// ============================================
// Example 3: Real-world API call comparison
// ============================================

// ❌ Synchronous approach (if it existed - hypothetical)
// function getUserSync(userId) {
//   const response = fetch(`/api/user/${userId}`); // Would block
//   return response.json();
// }
// console.log('Before');
// const user = getUserSync(123); // Blocks entire app
// console.log('After', user);

// ✅ Asynchronous approach (actual implementation)
function getUserAsync(userId) {
  return fetch(`/api/user/${userId}`)
    .then(response => response.json());
}

console.log('Before');
getUserAsync(123)
  .then(user => console.log('User:', user));
console.log('After'); // Executes immediately

// Output:
// Before
// After
// User: { id: 123, name: '...' } (when request completes)


// ============================================
// Example 4: Multiple async operations
// ============================================
console.log('Start fetching data...');

// All three requests start simultaneously
Promise.all([
  fetch('/api/user/1').then(r => r.json()),
  fetch('/api/user/2').then(r => r.json()),
  fetch('/api/user/3').then(r => r.json())
])
.then(users => {
  console.log('All users:', users);
});

console.log('Requests sent, continuing...');

// Output:
// Start fetching data...
// Requests sent, continuing...
// All users: [...] (when all complete)


// ============================================
// Example 5: Async/await syntax (still asynchronous)
// ============================================
async function loadUserData(userId) {
  console.log('Loading user...');

  // Non-blocking despite looking synchronous
  const user = await fetch(`/api/user/${userId}`).then(r => r.json());

  console.log('User loaded:', user.name);
  return user;
}

console.log('Before');
loadUserData(123); // Returns promise immediately
console.log('After');

// Output:
// Before
// Loading user...
// After
// User loaded: John (when request completes)


// ============================================
// Example 6: File reading comparison
// ============================================

// Node.js synchronous file read (blocks)
const fs = require('fs');

console.log('Start');
const content = fs.readFileSync('file.txt', 'utf8'); // Blocks
console.log('File content:', content);
console.log('End');

// Node.js asynchronous file read (non-blocking)
console.log('Start');
fs.readFile('file.txt', 'utf8', (err, content) => {
  console.log('File content:', content); // Executes later
});
console.log('End'); // Executes immediately

// Output:
// Start
// End
// File content: ... (when read completes)


// ============================================
// Example 7: UI responsiveness example
// ============================================

// ❌ Synchronous: Freezes UI
document.getElementById('btn').addEventListener('click', () => {
  // Heavy computation blocks UI
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += i;
  }
  console.log(result); // UI frozen during loop
});

// ✅ Asynchronous: Keeps UI responsive
document.getElementById('btn').addEventListener('click', async () => {
  console.log('Processing...');

  // Offload to Web Worker or use setTimeout
  await new Promise(resolve => {
    setTimeout(() => {
      let result = 0;
      for (let i = 0; i < 1000000000; i++) {
        result += i;
      }
      console.log(result);
      resolve();
    }, 0);
  });

  console.log('Done!');
});


// ============================================
// Example 8: Sequential vs concurrent
// ============================================

// Sequential (slower - operations wait for each other)
async function loadSequential() {
  console.time('sequential');

  const user = await fetch('/api/user/1').then(r => r.json()); // Wait
  const posts = await fetch('/api/posts/1').then(r => r.json()); // Wait
  const comments = await fetch('/api/comments/1').then(r => r.json()); // Wait

  console.timeEnd('sequential'); // ~900ms (300ms each)
  return { user, posts, comments };
}

// Concurrent (faster - operations run in parallel)
async function loadConcurrent() {
  console.time('concurrent');

  // Start all requests simultaneously
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user/1').then(r => r.json()),
    fetch('/api/posts/1').then(r => r.json()),
    fetch('/api/comments/1').then(r => r.json())
  ]);

  console.timeEnd('concurrent'); // ~300ms (all parallel)
  return { user, posts, comments };
}


// ============================================
// Example 9: Error handling comparison
// ============================================

// Synchronous error handling
try {
  const result = JSON.parse('invalid json'); // Throws immediately
  console.log(result);
} catch (error) {
  console.error('Sync error:', error.message);
}

// Asynchronous error handling
fetch('/api/data')
  .then(response => response.json())
  .catch(error => {
    console.error('Async error:', error.message);
  });

// With async/await
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Async error:', error.message);
  }
}


// ============================================
// Example 10: Real-world patterns
// ============================================

// Loading state management with async
class DataLoader {
  constructor() {
    this.loading = false;
    this.data = null;
    this.error = null;
  }

  async load(url) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(url);
      this.data = await response.json();
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }

    return this.data;
  }
}

const loader = new DataLoader();

// UI remains responsive while loading
loader.load('/api/users').then(users => {
  console.log('Loaded:', users);
});

console.log('Loading state:', loader.loading); // true immediately
```

### Common Mistakes

- ❌ **Mistake:** Using synchronous APIs in the browser (blocking UI)
  ```javascript
  // No synchronous fetch exists (good thing!)
  // This would freeze the entire browser
  const data = fetchSync('/api/data'); // Doesn't exist
  ```

- ❌ **Mistake:** Not understanding that async code doesn't execute immediately
  ```javascript
  let user = null;
  fetch('/api/user').then(data => {
    user = data;
  });
  console.log(user); // null! Promise hasn't resolved yet
  ```

- ❌ **Mistake:** Using async when not needed (adds unnecessary complexity)
  ```javascript
  // Overkill for synchronous operations
  async function add(a, b) {
    return a + b; // No async operation here
  }
  ```

- ✅ **Correct:** Understand execution order and use async for I/O operations
  ```javascript
  let user = null;

  fetch('/api/user')
    .then(data => {
      user = data;
      console.log(user); // Correct: logs when data arrives
    });

  console.log(user); // null - this runs first
  ```

### Follow-up Questions

- "What is the JavaScript event loop and how does it enable asynchronous execution?"
- "Can you explain the difference between parallelism and concurrency in JavaScript?"
- "How would you handle multiple async operations that depend on each other?"
- "What are the performance implications of using too many async operations?"
- "How does Node.js handle asynchronous I/O differently from the browser?"

### Resources

- [MDN: Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)
- [JavaScript.info: Introduction to callbacks](https://javascript.info/callbacks)
- [JavaScript.info: Promise](https://javascript.info/promise-basics)
- [Understanding the Event Loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

---

## Question 2: Explain the JavaScript event loop, call stack, and callback queue

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Netflix, Uber

### Question
How does the JavaScript event loop work? Explain the role of the call stack, callback queue (task queue), and microtask queue in the execution model.

### Answer

**Call Stack:**
- **LIFO** (Last In, First Out) data structure
- Keeps track of **function execution contexts**
- JavaScript is **single-threaded**, so only one stack
- When stack is empty, event loop checks queues

**Callback Queue (Task Queue/Macrotask Queue):**
- Holds **callbacks** from async operations (setTimeout, setInterval, I/O)
- Processed **after** call stack is empty
- **One task per event loop iteration**
- Examples: setTimeout, setInterval, setImmediate (Node.js)

**Microtask Queue:**
- **Higher priority** than callback queue
- Processed **immediately** after current task completes
- **All microtasks** execute before next macrotask
- Examples: Promise callbacks (.then, .catch, .finally), queueMicrotask, MutationObserver

**Event Loop Process:**
1. Execute code on call stack
2. When stack is empty, check microtask queue
3. Execute **all** microtasks
4. Check callback queue, execute **one** macrotask
5. Repeat from step 2

### Code Example

```javascript
// ============================================
// Example 1: Basic event loop demonstration
// ============================================
console.log('1: Start');

setTimeout(() => {
  console.log('2: setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Promise');
});

console.log('4: End');

// Output:
// 1: Start
// 4: End
// 3: Promise (microtask - executes first)
// 2: setTimeout (macrotask - executes after microtasks)

// Explanation:
// 1. "Start" and "End" execute synchronously on call stack
// 2. setTimeout callback goes to macrotask queue
// 3. Promise callback goes to microtask queue
// 4. Microtasks execute before macrotasks


// ============================================
// Example 2: Call stack visualization
// ============================================
function third() {
  console.log('third');
  // Call stack: [global, first, second, third]
}

function second() {
  console.log('second');
  third();
  // Call stack: [global, first, second]
}

function first() {
  console.log('first');
  second();
  // Call stack: [global, first]
}

first();
// Call stack: [global]

// Call stack evolution:
// [global] → [global, first] → [global, first, second]
// → [global, first, second, third] → [global, first, second]
// → [global, first] → [global] → []


// ============================================
// Example 3: Multiple microtasks vs macrotasks
// ============================================
console.log('Start');

setTimeout(() => console.log('Timeout 1'), 0);
setTimeout(() => console.log('Timeout 2'), 0);

Promise.resolve().then(() => console.log('Promise 1'));
Promise.resolve().then(() => console.log('Promise 2'));

console.log('End');

// Output:
// Start
// End
// Promise 1
// Promise 2
// Timeout 1
// Timeout 2

// All microtasks (Promise 1 & 2) complete before any macrotask (Timeout 1 & 2)


// ============================================
// Example 4: Nested microtasks and macrotasks
// ============================================
console.log('Script start');

setTimeout(() => {
  console.log('setTimeout 1');

  Promise.resolve().then(() => {
    console.log('Promise in setTimeout 1');
  });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');

    setTimeout(() => {
      console.log('setTimeout in Promise 1');
    }, 0);
  })
  .then(() => {
    console.log('Promise 2');
  });

console.log('Script end');

// Output:
// Script start
// Script end
// Promise 1
// Promise 2
// setTimeout 1
// Promise in setTimeout 1
// setTimeout in Promise 1


// ============================================
// Example 5: Chained promises (all microtasks)
// ============================================
Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('Promise 2');
  })
  .then(() => {
    console.log('Promise 3');
  });

setTimeout(() => {
  console.log('Timeout');
}, 0);

console.log('Sync');

// Output:
// Sync
// Promise 1
// Promise 2
// Promise 3
// Timeout


// ============================================
// Example 6: Stack overflow example
// ============================================

// ❌ Synchronous recursion - stack overflow
function recursiveSync(n) {
  if (n === 0) return;
  recursiveSync(n - 1); // Grows call stack
}

// recursiveSync(100000); // RangeError: Maximum call stack size exceeded

// ✅ Async recursion - no stack overflow
function recursiveAsync(n) {
  if (n === 0) return;

  setTimeout(() => {
    recursiveAsync(n - 1); // Stack clears between calls
  }, 0);
}

recursiveAsync(100000); // Works! Each call starts with empty stack


// ============================================
// Example 7: queueMicrotask API
// ============================================
console.log('Start');

setTimeout(() => console.log('Timeout'), 0);

queueMicrotask(() => {
  console.log('Microtask 1');
});

Promise.resolve().then(() => {
  console.log('Promise');
});

queueMicrotask(() => {
  console.log('Microtask 2');
});

console.log('End');

// Output:
// Start
// End
// Microtask 1
// Promise
// Microtask 2
// Timeout


// ============================================
// Example 8: Complex event loop scenario
// ============================================
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end'); // Microtask
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end (microtask)
// promise2 (microtask)
// setTimeout (macrotask)


// ============================================
// Example 9: Visualizing with delays
// ============================================
console.log('1: Sync');

setTimeout(() => {
  console.log('2: Macro 1');

  Promise.resolve().then(() => {
    console.log('3: Micro inside Macro 1');
  });

  setTimeout(() => {
    console.log('4: Macro inside Macro 1');
  }, 0);
}, 0);

Promise.resolve()
  .then(() => {
    console.log('5: Micro 1');

    return new Promise(resolve => {
      setTimeout(() => {
        console.log('6: Macro inside Micro 1');
        resolve();
      }, 0);
    });
  })
  .then(() => {
    console.log('7: Micro 2');
  });

console.log('8: Sync');

// Output:
// 1: Sync
// 8: Sync
// 5: Micro 1
// 2: Macro 1
// 3: Micro inside Macro 1
// 6: Macro inside Micro 1
// 7: Micro 2
// 4: Macro inside Macro 1


// ============================================
// Example 10: Blocking the event loop
// ============================================

// ❌ Bad: Long-running task blocks event loop
function blockingTask() {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Blocks event loop for 3 seconds
  }
  console.log('Blocking task done');
}

setTimeout(() => console.log('This will be delayed'), 0);
blockingTask(); // Blocks everything
// "This will be delayed" won't execute until blockingTask completes

// ✅ Good: Break into chunks
async function nonBlockingTask() {
  for (let i = 0; i < 1000; i++) {
    // Do some work

    if (i % 100 === 0) {
      // Yield to event loop every 100 iterations
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  console.log('Non-blocking task done');
}

setTimeout(() => console.log('This will execute'), 0);
nonBlockingTask(); // Event loop can process other tasks


// ============================================
// Example 11: Node.js setImmediate vs setTimeout
// ============================================
// In Node.js, setImmediate has special behavior

setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});

// Output order is NOT guaranteed outside I/O cycle
// But within I/O cycle, setImmediate always executes first

const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('setTimeout in I/O');
  }, 0);

  setImmediate(() => {
    console.log('setImmediate in I/O'); // Always first
  });
});


// ============================================
// Example 12: MutationObserver (microtask in browser)
// ============================================
const observer = new MutationObserver(() => {
  console.log('DOM mutation'); // Microtask
});

observer.observe(document.body, { childList: true });

console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

document.body.appendChild(document.createElement('div')); // Triggers observer

console.log('End');

// Output:
// Start
// End
// DOM mutation (microtask)
// Timeout (macrotask)
```

### Common Mistakes

- ❌ **Mistake:** Thinking setTimeout(fn, 0) executes immediately
  ```javascript
  setTimeout(() => console.log('Later'), 0);
  console.log('Now');
  // Output: Now, Later (not Later, Now)
  ```

- ❌ **Mistake:** Not understanding microtask priority
  ```javascript
  setTimeout(() => console.log('Timeout'), 0);
  Promise.resolve().then(() => console.log('Promise'));
  // Output: Promise, Timeout (not Timeout, Promise)
  ```

- ❌ **Mistake:** Blocking the event loop with long-running sync code
  ```javascript
  // This freezes the entire app
  while (true) {
    // CPU-intensive work
  }
  ```

- ✅ **Correct:** Understand execution order and break up long tasks
  ```javascript
  // Proper order understanding
  console.log('1: Sync');
  setTimeout(() => console.log('3: Macro'), 0);
  Promise.resolve().then(() => console.log('2: Micro'));

  // Breaking up long tasks
  async function processLargeArray(items) {
    for (let i = 0; i < items.length; i++) {
      processItem(items[i]);

      if (i % 1000 === 0) {
        await new Promise(r => setTimeout(r, 0)); // Yield
      }
    }
  }
  ```

### Follow-up Questions

- "What happens if a microtask creates another microtask infinitely?"
- "How would you debug an event loop blocking issue in production?"
- "What is the difference between process.nextTick and setImmediate in Node.js?"
- "Can you explain the phases of the Node.js event loop?"
- "How do Web Workers relate to the event loop?"

### Resources

- [MDN: Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [JavaScript.info: Event loop](https://javascript.info/event-loop)
- [What the heck is the event loop anyway? (Video)](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [Jake Archibald: In The Loop (Video)](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

## Question 6: Explain microtasks vs macrotasks and their execution order

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Meta, Netflix, Uber

### Question
What is the difference between microtasks and macrotasks in JavaScript? How does their execution order work in the event loop? Give examples of each.

### Answer

**Macrotasks (Task Queue):**
- **Examples:** setTimeout, setInterval, setImmediate (Node.js), I/O operations, UI rendering
- Added to **task queue**
- **One macrotask** processed per event loop iteration
- Lower priority than microtasks
- Represent "major" units of work

**Microtasks (Microtask Queue):**
- **Examples:** Promise callbacks (.then, .catch, .finally), queueMicrotask, MutationObserver, process.nextTick (Node.js)
- Added to **microtask queue**
- **ALL microtasks** processed before next macrotask
- Higher priority - always execute before macrotasks
- Represent "smaller" units of work that should complete quickly

**Execution Order:**
1. Execute synchronous code (call stack)
2. Execute **ALL** microtasks in queue
3. Render UI (if needed)
4. Execute **ONE** macrotask
5. Repeat from step 2

**Key Difference:**
- Macrotasks: One per loop iteration
- Microtasks: ALL before next macrotask

### Code Example

```javascript
// ============================================
// Example 1: Basic microtask vs macrotask
// ============================================
console.log('1: Sync start');

setTimeout(() => {
  console.log('2: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Microtask (Promise)');
});

console.log('4: Sync end');

// Output:
// 1: Sync start
// 4: Sync end
// 3: Microtask (Promise)
// 2: Macrotask (setTimeout)


// ============================================
// Example 2: Multiple microtasks before macrotask
// ============================================
console.log('Start');

setTimeout(() => console.log('Timeout 1'), 0);
setTimeout(() => console.log('Timeout 2'), 0);

Promise.resolve().then(() => console.log('Promise 1'));
Promise.resolve().then(() => console.log('Promise 2'));
Promise.resolve().then(() => console.log('Promise 3'));

console.log('End');

// Output:
// Start
// End
// Promise 1
// Promise 2
// Promise 3
// Timeout 1
// Timeout 2

// All 3 microtasks complete before any macrotask


// ============================================
// Example 3: Nested microtasks
// ============================================
console.log('Start');

Promise.resolve()
  .then(() => {
    console.log('Promise 1');

    // Creates new microtask
    Promise.resolve().then(() => {
      console.log('Promise 2 (nested)');
    });

    console.log('Promise 1 continued');
  })
  .then(() => {
    console.log('Promise 3');
  });

setTimeout(() => console.log('Timeout'), 0);

console.log('End');

// Output:
// Start
// End
// Promise 1
// Promise 1 continued
// Promise 2 (nested)
// Promise 3
// Timeout


// ============================================
// Example 4: queueMicrotask API
// ============================================
console.log('Start');

setTimeout(() => console.log('Macrotask'), 0);

queueMicrotask(() => {
  console.log('Microtask 1');

  queueMicrotask(() => {
    console.log('Microtask 2 (nested)');
  });
});

Promise.resolve().then(() => console.log('Promise'));

console.log('End');

// Output:
// Start
// End
// Microtask 1
// Promise
// Microtask 2 (nested)
// Macrotask


// ============================================
// Example 5: Microtask queue starvation
// ============================================

// ⚠️ Warning: This creates infinite microtasks
function infiniteMicrotasks() {
  Promise.resolve().then(() => {
    console.log('Microtask');
    infiniteMicrotasks(); // Creates another microtask
  });
}

// infiniteMicrotasks(); // Never reaches macrotask queue!

// Macrotasks allow other work between iterations
function safeMacrotasks() {
  setTimeout(() => {
    console.log('Macrotask');
    safeMacrotasks(); // Allows other tasks to run
  }, 0);
}


// ============================================
// Example 6: Event loop iteration visualization
// ============================================
console.log('=== Iteration 1 ===');
console.log('Sync 1');

setTimeout(() => console.log('Macro 1'), 0);
setTimeout(() => console.log('Macro 2'), 0);

Promise.resolve().then(() => {
  console.log('Micro 1');

  setTimeout(() => console.log('Macro 3'), 0);

  Promise.resolve().then(() => console.log('Micro 2'));
});

console.log('Sync 2');

// Execution breakdown:
//
// Call Stack (Synchronous):
//   - Sync 1
//   - Sync 2
//
// Microtask Queue (All execute):
//   - Micro 1 → adds Macro 3 and Micro 2
//   - Micro 2
//
// Macrotask Queue (One per iteration):
//   - Iteration 2: Macro 1
//   - Iteration 3: Macro 2
//   - Iteration 4: Macro 3


// ============================================
// Example 7: Promise timing nuances
// ============================================
Promise.resolve().then(() => {
  console.log('Promise then 1');
}).then(() => {
  console.log('Promise then 2');
});

queueMicrotask(() => {
  console.log('queueMicrotask');
});

// Output:
// Promise then 1
// queueMicrotask
// Promise then 2

// Why? First .then() completes, adding second .then() to queue
// queueMicrotask was already in queue before second .then()


// ============================================
// Example 8: Async/await and microtasks
// ============================================
async function asyncFunc() {
  console.log('Async start');

  await Promise.resolve(); // Yields to microtask queue

  console.log('After await'); // Microtask
}

console.log('Start');

setTimeout(() => console.log('Timeout'), 0);

asyncFunc();

console.log('End');

// Output:
// Start
// Async start
// End
// After await (microtask)
// Timeout (macrotask)


// ============================================
// Example 9: Node.js process.nextTick (special microtask)
// ============================================
// In Node.js, process.nextTick has even higher priority

console.log('Start');

setTimeout(() => console.log('Timeout'), 0);

Promise.resolve().then(() => console.log('Promise'));

process.nextTick(() => console.log('nextTick'));

console.log('End');

// Output (Node.js):
// Start
// End
// nextTick (highest priority)
// Promise (regular microtask)
// Timeout (macrotask)


// ============================================
// Example 10: Real-world implications
// ============================================

// Problem: UI blocking with too many microtasks
function processItems(items) {
  items.forEach(item => {
    // Each creates microtask - blocks UI rendering
    Promise.resolve().then(() => processItem(item));
  });
}

// Solution: Break into macrotasks
async function processItemsSafe(items) {
  for (const item of items) {
    processItem(item);

    // Yield to event loop every 100 items
    if (items.indexOf(item) % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}


// ============================================
// Example 11: Detailed execution trace
// ============================================
console.log('1: Script start');

setTimeout(() => {
  console.log('2: setTimeout 1');

  Promise.resolve().then(() => {
    console.log('3: Promise in setTimeout 1');
  });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('4: Promise 1');

    setTimeout(() => {
      console.log('5: setTimeout in Promise 1');
    }, 0);
  })
  .then(() => {
    console.log('6: Promise 2');
  });

setTimeout(() => {
  console.log('7: setTimeout 2');
}, 0);

Promise.resolve().then(() => {
  console.log('8: Promise 3');
});

console.log('9: Script end');

// Output:
// 1: Script start
// 9: Script end
// 4: Promise 1
// 8: Promise 3
// 6: Promise 2
// 2: setTimeout 1
// 3: Promise in setTimeout 1
// 7: setTimeout 2
// 5: setTimeout in Promise 1


// ============================================
// Example 12: Browser rendering and tasks
// ============================================

// Microtasks can delay rendering
button.addEventListener('click', () => {
  // Starts paint cycle
  element.style.background = 'red';

  // Blocks painting (runs before render)
  Promise.resolve().then(() => {
    doHeavyWork(); // Delays paint
  });
});

// Macrotasks allow rendering between tasks
button.addEventListener('click', () => {
  element.style.background = 'red';

  // Allows paint to happen first
  setTimeout(() => {
    doHeavyWork();
  }, 0);
});


// ============================================
// Example 13: Complex nesting scenario
// ============================================
console.log('A');

setTimeout(() => {
  console.log('B');
  Promise.resolve().then(() => console.log('C'));
}, 0);

Promise.resolve()
  .then(() => {
    console.log('D');
    setTimeout(() => console.log('E'), 0);
  })
  .then(() => {
    console.log('F');
  });

setTimeout(() => {
  console.log('G');
  Promise.resolve().then(() => console.log('H'));
}, 0);

Promise.resolve().then(() => {
  console.log('I');
});

console.log('J');

// Output:
// A
// J
// D
// I
// F
// B
// C
// G
// H
// E


// ============================================
// Example 14: Understanding "run to completion"
// ============================================

// Each task runs to completion before next task
setTimeout(() => {
  console.log('Task 1 start');

  // Long-running synchronous code blocks everything
  for (let i = 0; i < 1000000000; i++) {}

  console.log('Task 1 end');
}, 0);

setTimeout(() => {
  console.log('Task 2'); // Waits for Task 1 to complete
}, 0);


// ============================================
// Example 15: Microtask checkpoint timing
// ============================================
console.log('Start');

// Macrotask 1
setTimeout(() => {
  console.log('Timeout 1');

  // Adds to microtask queue
  Promise.resolve()
    .then(() => console.log('Micro A'))
    .then(() => console.log('Micro B'));
}, 0);

// Macrotask 2
setTimeout(() => {
  console.log('Timeout 2');

  Promise.resolve().then(() => console.log('Micro C'));
}, 0);

console.log('End');

// Output:
// Start
// End
// Timeout 1 (first macrotask)
// Micro A (microtasks after macrotask)
// Micro B
// Timeout 2 (second macrotask)
// Micro C (microtasks after second macrotask)
```

### Common Mistakes

- ❌ **Mistake:** Thinking setTimeout(fn, 0) executes before promises
  ```javascript
  setTimeout(() => console.log('Timeout'), 0);
  Promise.resolve().then(() => console.log('Promise'));
  // Output: Promise, Timeout (not Timeout, Promise)
  ```

- ❌ **Mistake:** Creating too many microtasks (starving macrotasks)
  ```javascript
  // Blocks event loop indefinitely
  function recurse() {
    Promise.resolve().then(recurse);
  }
  recurse(); // UI freezes, no rendering
  ```

- ❌ **Mistake:** Not understanding microtask queue draining
  ```javascript
  Promise.resolve().then(() => {
    console.log('A');
    Promise.resolve().then(() => console.log('B'));
  });
  setTimeout(() => console.log('C'), 0);

  // Output: A, B, C
  // B executes before C (all microtasks first)
  ```

- ✅ **Correct:** Understand execution phases and priorities
  ```javascript
  // Synchronous code → Microtasks → Macrotask → repeat
  console.log('1: Sync');
  Promise.resolve().then(() => console.log('2: Micro'));
  setTimeout(() => console.log('3: Macro'), 0);
  // Always: 1, 2, 3
  ```

### Follow-up Questions

- "How does queueMicrotask differ from Promise.resolve().then()?"
- "What is process.nextTick in Node.js and how does it fit into the event loop?"
- "Can you have too many microtasks? What happens to performance?"
- "How do MutationObserver callbacks fit into this model?"
- "What is the relationship between requestAnimationFrame and these queues?"

### Resources

- [MDN: Microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [JavaScript.info: Microtasks](https://javascript.info/microtask-queue)
- [Jake Archibald: Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [Node.js: Event Loop Phases](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

