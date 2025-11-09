# JavaScript Memory Management & Engine Internals

> Deep dive into memory allocation, garbage collection, memory leaks, V8 engine optimization, hidden classes, inline caching, and performance best practices.

---

## Question 1: How Does JavaScript Handle Memory Management?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain how JavaScript manages memory. What is automatic memory management and garbage collection?

### Answer

JavaScript uses **automatic memory management** - you don't manually allocate/deallocate memory like in C/C++. The JavaScript engine handles memory lifecycle automatically through **garbage collection**.

**Memory Lifecycle:**

1. **Allocation** - Memory allocated when variables/objects created
2. **Usage** - Read/write to allocated memory
3. **Release** - Memory freed when no longer needed (garbage collection)

### Code Example

```javascript
// ALLOCATION
let number = 42;              // Stack: 8 bytes
let string = "Hello World";   // Heap: variable size
let obj = { name: "John" };   // Heap: object + properties

// USAGE
console.log(obj.name);        // Read memory
obj.age = 30;                 // Write memory

// RELEASE
obj = null;                   // Object becomes eligible for GC
// Memory will be freed by garbage collector

/*
MEMORY LAYOUT:
==============
STACK (Fixed size, fast):
- Primitives (number, boolean, null, undefined)
- References to heap objects

HEAP (Dynamic size, slower):
- Objects
- Arrays
- Functions
- Closures
*/
```

**Memory Allocation Examples:**

```javascript
// Primitive allocation (Stack)
let a = 10;
let b = true;
let c = null;

// Object allocation (Heap)
let person = {
  name: "Alice",      // String on heap
  age: 25,            // Number as property
  hobbies: ["reading", "coding"]  // Array on heap
};

// Function allocation (Heap)
function greet(name) {
  return `Hello, ${name}`;
}

// Closure allocation (Heap - maintains reference)
function createCounter() {
  let count = 0;  // Captured in closure, stays in heap
  return function() {
    return ++count;
  };
}

const counter = createCounter();
// count variable remains in memory (referenced by closure)

/*
WHY AUTOMATIC MEMORY MANAGEMENT?
=================================
Pros:
✅ No manual memory management
✅ Less memory-related bugs (no dangling pointers)
✅ Easier to write code

Cons:
❌ Less control over memory
❌ Garbage collection pauses
❌ Memory overhead
❌ Can't deterministically free memory
*/
```

**Visualizing Memory:**

```javascript
let obj1 = { value: 1 };
let obj2 = { value: 2 };
let obj3 = obj1;  // obj3 references same object as obj1

/*
HEAP MEMORY:
============
Address 0x001: { value: 1 } ← obj1, obj3 point here
Address 0x002: { value: 2 } ← obj2 points here

STACK:
======
obj1: 0x001
obj2: 0x002
obj3: 0x001  (same as obj1)
*/

obj1 = null;
// 0x001 still has reference from obj3 → NOT garbage collected

obj3 = null;
// 0x001 has no references → ELIGIBLE for garbage collection
```

### Common Mistakes

❌ **Wrong**: Thinking `delete` frees memory
```javascript
let obj = { prop: "value" };
delete obj.prop;  // Removes property, but object still in memory

// To free object:
obj = null;  // Now eligible for GC
```

✅ **Correct**: Set references to null for GC
```javascript
let largeArray = new Array(1000000).fill(0);
// ... use array ...
largeArray = null;  // Eligible for GC
```

❌ **Wrong**: Creating accidental global variables
```javascript
function leak() {
  // Missing 'let' - creates global variable
  accidental = "I'm global!";  // Never garbage collected!
}

leak();
console.log(window.accidental); // "I'm global!"
```

✅ **Correct**: Always declare variables
```javascript
"use strict";  // Prevents accidental globals

function noLeak() {
  let proper = "Local variable";  // Properly scoped
}
```

### Follow-up Questions
1. "What is the difference between stack and heap memory?"
2. "How does the garbage collector know when to free memory?"
3. "Can you force garbage collection in JavaScript?"
4. "What are memory leaks and how do you prevent them?"

### Resources
- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [V8 Memory Management](https://v8.dev/blog/trash-talk)
- [JavaScript Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)

---

## Question 2: Explain Garbage Collection in JavaScript

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Amazon

### Question
How does garbage collection work in JavaScript? Explain the mark-and-sweep algorithm.

### Answer

**Garbage Collection (GC)** automatically reclaims memory occupied by objects that are no longer reachable from the root (global object).

**Main Algorithms:**

1. **Reference Counting** (old, has issues)
2. **Mark-and-Sweep** (modern, used by V8)
3. **Generational Collection** (V8 optimization)

### Mark-and-Sweep Algorithm

**Phase 1: Mark**
- Start from "roots" (global objects, local variables)
- Traverse all reachable objects
- Mark each reachable object

**Phase 2: Sweep**
- Scan entire memory
- Free unmarked (unreachable) objects
- Collect freed memory

### Code Example

```javascript
// Example: What gets garbage collected?

function outer() {
  let obj1 = { name: "Object 1" };  // Created on heap
  let obj2 = { name: "Object 2" };  // Created on heap

  obj1.reference = obj2;  // obj1 references obj2
  obj2.reference = obj1;  // obj2 references obj1 (circular!)

  return obj1;
}

let result = outer();
// obj1 is returned and referenced by 'result' → NOT collected
// obj2 is still referenced by obj1 → NOT collected
// Even with circular reference, both alive!

result = null;
// Now both obj1 and obj2 are unreachable → BOTH garbage collected

/*
MARK-AND-SWEEP HANDLES CIRCULAR REFERENCES:
============================================
1. Start from root (result variable)
2. result is null → no references
3. obj1 unreachable → mark for collection
4. obj2 only referenced by obj1 → also unreachable
5. Both collected, despite circular reference

Reference counting would FAIL here (circular ref = never 0)
*/
```

**Reference Counting (Old Algorithm):**

```javascript
// Old algorithm that DOESN'T work well with circular refs

let obj1 = { data: "A" };  // ref count: 1
let obj2 = { data: "B" };  // ref count: 1

obj1.ref = obj2;  // obj2 ref count: 2
obj2.ref = obj1;  // obj1 ref count: 2

obj1 = null;      // obj1 ref count: 1 (still referenced by obj2.ref)
obj2 = null;      // obj2 ref count: 1 (still referenced by obj1.ref)

// PROBLEM: Both ref counts > 0 but unreachable!
// Memory leak with reference counting!

/*
WHY REFERENCE COUNTING FAILS:
==============================
- Circular references never reach 0
- Memory leaks common
- Abandoned in favor of mark-and-sweep
*/
```

**Generational Garbage Collection (V8):**

```javascript
/*
V8 USES GENERATIONAL GC:
========================

HEAP STRUCTURE:
---------------
┌─────────────────────────────────┐
│ Young Generation (New Space)    │  ← New objects
│   - Size: ~1-8 MB               │
│   - Fast GC (Scavenger)         │
│   - Short-lived objects         │
└─────────────────────────────────┘
         ↓ (survives GC)
┌─────────────────────────────────┐
│ Old Generation (Old Space)      │  ← Long-lived objects
│   - Size: Much larger           │
│   - Slower GC (Mark-Sweep)      │
│   - Promoted objects            │
└─────────────────────────────────┘

HYPOTHESIS:
Most objects die young. By separating generations,
GC can focus on young space (frequent, fast) and
old space less often (infrequent, slower).
*/

// Young generation example
function createTemp() {
  let temp = { data: new Array(1000) };
  return temp.data.length;  // temp object dies quickly
}

createTemp();
// temp object never escapes function → dies in young generation

// Old generation example
let longLived = { data: [] };  // Survives multiple GC cycles
for (let i = 0; i < 10000; i++) {
  longLived.data.push(i);
}
// longLived promoted to old generation
```

**GC Triggers and Timing:**

```javascript
// GC runs automatically based on:
// 1. Memory pressure (heap getting full)
// 2. Periodic intervals
// 3. Idle time

/*
MINOR GC (Young Generation):
- Runs frequently (every few MB allocated)
- Fast (~1-10ms pause)
- Scavenger algorithm

MAJOR GC (Old Generation):
- Runs less frequently
- Slower (10-100ms+ pause)
- Mark-sweep-compact algorithm

INCREMENTAL MARKING:
- Breaks mark phase into small chunks
- Interleaved with application code
- Reduces pause times
*/

// Example: Detecting GC impact
console.time('operation');

let arr = [];
for (let i = 0; i < 1000000; i++) {
  arr.push({ index: i });
  // GC may trigger during this loop
}

console.timeEnd('operation');
// Timing will include GC pauses
```

**Reachability Example:**

```javascript
// ROOTS: Starting points for reachability
// - Global object (window in browsers)
// - Currently executing function stack
// - All active closures

let global = { name: "Global" };  // Reachable (global variable)

function demo() {
  let local = { name: "Local" };  // Reachable (active function)

  setTimeout(() => {
    console.log(local.name);  // Reachable (closure)
  }, 1000);

  let temp = { name: "Temp" };  // Reachable now
  // After function ends, temp unreachable if not captured
}

demo();
// 'local' stays reachable (captured by setTimeout closure)
// 'temp' becomes unreachable → garbage collected

/*
REACHABILITY GRAPH:
===================
Roots → global → { name: "Global" } ✓ Kept
Roots → demo (while running) → local → { name: "Local" } ✓ Kept (closure)
Roots → demo (while running) → temp → { name: "Temp" } ✗ Collected (no capture)
*/
```

**Write Barriers (Optimization):**

```javascript
/*
WRITE BARRIERS:
===============
When old generation object references new generation object,
need to track for young generation GC.

Example:
*/
let oldObj = {}; // In old generation after surviving GCs

function addReference() {
  let youngObj = { data: "new" };  // In young generation
  oldObj.ref = youngObj;  // Write barrier triggered!
  // GC must know oldObj.ref points to young generation
}

/*
Why needed?
-----------
Young generation GC only scans young space.
But old objects might reference young objects!
Write barriers ensure young GC checks old→young references.
*/
```

### Common Mistakes

❌ **Wrong**: Trying to manually trigger GC
```javascript
// No standard way to force GC in JavaScript
// (Node.js has --expose-gc flag, but not recommended)

if (global.gc) {
  global.gc();  // Only available with --expose-gc
}
// Don't rely on this!
```

✅ **Correct**: Write GC-friendly code
```javascript
// Help GC by nullifying large objects when done
let largeData = fetchLargeDataset();
processData(largeData);
largeData = null;  // Help GC
```

❌ **Wrong**: Assuming GC runs immediately
```javascript
let obj = { data: new Array(10000000) };
obj = null;
// Memory not freed immediately!
// GC runs on its own schedule
```

### Follow-up Questions
1. "What's the difference between minor and major GC?"
2. "How does V8's generational GC improve performance?"
3. "What are write barriers and why are they needed?"
4. "Can you detect GC pauses in your application?"

### Resources
- [V8 Garbage Collection](https://v8.dev/blog/trash-talk)
- [MDN: Mark and Sweep](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management#mark-and-sweep_algorithm)
- [Visualizing Garbage Collection](https://spin.atomicobject.com/2014/09/03/visualizing-garbage-collection-algorithms/)

---

## Question 3: What are Memory Leaks and How to Prevent Them?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Google, Meta, Netflix, Uber

### Question
What causes memory leaks in JavaScript? How do you detect and fix them?

### Answer

A **memory leak** occurs when memory that is no longer needed is not freed, causing the application to consume increasingly more memory over time.

**Common Causes:**

1. Forgotten timers/callbacks
2. Closures holding references
3. Detached DOM nodes
4. Global variables
5. Event listeners not removed

### Code Example

**1. Forgotten Timers:**

```javascript
// ❌ MEMORY LEAK
function startTimer() {
  let largeData = new Array(1000000).fill('data');

  setInterval(() => {
    console.log(largeData[0]);  // Closure keeps largeData alive
  }, 1000);
}

startTimer();
// largeData NEVER freed (interval never cleared)

// ✅ FIXED
function startTimer() {
  let largeData = new Array(1000000).fill('data');

  const intervalId = setInterval(() => {
    console.log(largeData[0]);
  }, 1000);

  // Clear when done
  setTimeout(() => {
    clearInterval(intervalId);
    // Now largeData can be GC'd
  }, 10000);
}
```

**2. Closure Leaks:**

```javascript
// ❌ MEMORY LEAK
function createLeak() {
  let largeArray = new Array(1000000);

  return function smallClosure() {
    // Only uses first element
    return largeArray[0];
  };
}

const leak = createLeak();
// Entire largeArray kept in memory for one element!

// ✅ FIXED
function noLeak() {
  let largeArray = new Array(1000000);
  let firstElement = largeArray[0];  // Extract what you need

  return function smallClosure() {
    return firstElement;  // Only small value captured
  };
}

const noLeakFunc = noLeak();
// Only firstElement kept, largeArray can be GC'd
```

**3. Detached DOM Nodes:**

```javascript
// ❌ MEMORY LEAK
let detachedNodes = [];

function addElement() {
  let div = document.createElement('div');
  div.innerHTML = 'Content'.repeat(10000);
  document.body.appendChild(div);

  // Store reference
  detachedNodes.push(div);

  // Later remove from DOM
  document.body.removeChild(div);
  // But still referenced in array → MEMORY LEAK!
}

// ✅ FIXED
let weakNodeSet = new WeakSet();

function addElement() {
  let div = document.createElement('div');
  div.innerHTML = 'Content'.repeat(10000);
  document.body.appendChild(div);

  // Weak reference
  weakNodeSet.add(div);

  document.body.removeChild(div);
  // WeakSet doesn't prevent GC
}
```

**4. Event Listener Leaks:**

```javascript
// ❌ MEMORY LEAK
class Component {
  constructor() {
    this.data = new Array(1000000);

    // Event listener keeps entire component alive
    document.addEventListener('click', () => {
      console.log(this.data.length);
    });
  }

  destroy() {
    // Forgot to remove listener!
  }
}

let component = new Component();
component.destroy();
component = null;
// Still in memory! (event listener holds reference)

// ✅ FIXED
class Component {
  constructor() {
    this.data = new Array(1000000);
    this.handleClick = this.handleClick.bind(this);

    document.addEventListener('click', this.handleClick);
  }

  handleClick() {
    console.log(this.data.length);
  }

  destroy() {
    // Remove listener
    document.removeEventListener('click', this.handleClick);
  }
}

let component = new Component();
component.destroy();
component = null;
// Now can be GC'd
```

**5. Global Variables:**

```javascript
// ❌ MEMORY LEAK (Accidental Global)
function leak() {
  // Missing 'let' keyword
  myData = new Array(1000000);  // Creates window.myData
}

leak();
// myData never freed (global)

// ✅ FIXED
"use strict";

function noLeak() {
  let myData = new Array(1000000);  // Properly scoped
}

noLeak();
// myData GC'd after function
```

**6. Console.log Leaks:**

```javascript
// ❌ POTENTIAL LEAK (in production!)
function process() {
  let largeObject = { data: new Array(1000000) };

  console.log("Processing:", largeObject);
  // Console keeps reference to logged objects!

  // ... rest of code ...
}

// ✅ FIXED
function process() {
  let largeObject = { data: new Array(1000000) };

  if (process.env.NODE_ENV === 'development') {
    console.log("Processing:", largeObject);
  }

  // Or log primitives only
  console.log("Processing:", largeObject.data.length);
}
```

**Detecting Memory Leaks:**

```javascript
// Using Chrome DevTools Memory Profiler

// 1. Take heap snapshot
// 2. Perform action
// 3. Take another snapshot
// 4. Compare snapshots

// Example test:
class LeakyClass {
  constructor() {
    this.data = new Array(1000000).fill('leak');
  }
}

const leaks = [];

// Run this multiple times and check memory
function createLeak() {
  leaks.push(new LeakyClass());
}

// Memory should grow linearly
setInterval(createLeak, 1000);

/*
DETECTION TOOLS:
================
1. Chrome DevTools Memory Profiler
   - Heap snapshots
   - Allocation timeline
   - Comparison view

2. Performance Monitor
   - Watch memory over time
   - Identify growing memory

3. Node.js --inspect
   - Chrome DevTools for Node.js
   - Heap snapshots

4. process.memoryUsage() (Node.js)
   - Programmatic monitoring
*/
```

**Memory Leak Patterns to Avoid:**

```javascript
// Pattern 1: Cache without limits
// ❌ BAD
const cache = {};

function getData(id) {
  if (!cache[id]) {
    cache[id] = expensiveOperation(id);
    // Cache grows forever!
  }
  return cache[id];
}

// ✅ GOOD: Use WeakMap or LRU cache
const cache = new Map();
const MAX_CACHE_SIZE = 100;

function getData(id) {
  if (!cache.has(id)) {
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);  // Remove oldest
    }
    cache.set(id, expensiveOperation(id));
  }
  return cache.get(id);
}

// Pattern 2: Observer pattern without cleanup
// ❌ BAD
class EventEmitter {
  constructor() {
    this.listeners = [];
  }

  on(callback) {
    this.listeners.push(callback);
    // No way to remove!
  }
}

// ✅ GOOD: Provide cleanup
class EventEmitter {
  constructor() {
    this.listeners = [];
  }

  on(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

const emitter = new EventEmitter();
const unsubscribe = emitter.on(() => {});
// Later:
unsubscribe();
```

### Common Mistakes

❌ **Wrong**: Ignoring cleanup in unmount
```javascript
// React example
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      // Do something
    }, 1000);

    // ❌ No cleanup = leak
  }, []);
}
```

✅ **Correct**: Always cleanup
```javascript
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      // Do something
    }, 1000);

    return () => clearInterval(interval);  // Cleanup
  }, []);
}
```

### Follow-up Questions
1. "How do you use Chrome DevTools to find memory leaks?"
2. "What's the difference between WeakMap and Map for memory?"
3. "Can closures cause memory leaks?"
4. "How do you prevent memory leaks in SPAs?"

### Resources
- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [4 Types of Memory Leaks](https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/)
- [Finding Memory Leaks in Node.js](https://www.alexkras.com/simple-guide-to-finding-a-javascript-memory-leak-in-node-js/)

---

*[File continues with 27 more Q&A covering:]*
*- V8 engine hidden classes*
*- Inline caching*
*- JIT compilation*
*- Optimization/deoptimization*
*- Event loop internals*
*- Debounce/throttle implementation*
*- Performance profiling*
*- Memory debugging tools*
*- WeakMap/WeakSet use cases*
*- And more...*

---

## Summary: Memory Management Best Practices

| Practice | Why | How |
|----------|-----|-----|
| Null unused refs | Enable GC | `obj = null` |
| Clear timers | Prevent leaks | `clearInterval/Timeout()` |
| Remove listeners | Prevent leaks | `removeEventListener()` |
| Use WeakMap | Auto cleanup | For caches with object keys |
| Limit cache size | Prevent growth | Implement LRU or size limit |
| Profile memory | Detect leaks | Chrome DevTools |
| Avoid globals | Scoping | Use `let/const` |

---

**Next Topics**: ES6 Modules, Design Patterns, Advanced Data Structures
