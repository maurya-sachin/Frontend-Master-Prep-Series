# Memory Management & Optimization

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: Difference Between Stack and Heap Memory in JavaScript

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Amazon, Microsoft

### Question
Explain the difference between stack and heap memory in JavaScript. What types of data are stored where?

### Answer

JavaScript uses two types of memory allocation:

### **Stack Memory**
- **Fast access** (LIFO structure)
- **Fixed size** allocation
- **Stores**: Primitive values, execution context, references to objects
- **Automatic cleanup** when context pops off

### **Heap Memory**
- **Slower access** (unstructured)
- **Dynamic size** allocation
- **Stores**: Objects, arrays, functions (reference types)
- **Garbage collected** when no references exist

### Code Example

```javascript
// STACK vs HEAP allocation

// Primitives → Stack
let age = 25;           // Stack: age → 25
let name = "John";      // Stack: name → "John" (string primitive)
let isActive = true;    // Stack: isActive → true

// Objects → Heap (stack stores reference)
let person = {          // Stack: person → 0x001 (reference)
  name: "John",         // Heap: 0x001 { name: "John", age: 25 }
  age: 25
};

let numbers = [1, 2, 3]; // Stack: numbers → 0x002 (reference)
                         // Heap: 0x002 [1, 2, 3]

/*
MEMORY LAYOUT:
==============

STACK:                   HEAP:
┌─────────────┐         ┌──────────────────────────┐
│ age: 25     │         │ 0x001: {                 │
│ name: "John"│         │   name: "John",          │
│ isActive: t │         │   age: 25                │
│ person: 0x001 ────────┤ }                        │
│ numbers: 0x002 ───────┤ 0x002: [1, 2, 3]        │
└─────────────┘         └──────────────────────────┘
*/
```

**Primitive Assignment (Stack):**

```javascript
let a = 10;
let b = a;  // Value copied

a = 20;

console.log(a); // 20
console.log(b); // 10 (unchanged, separate copy)

/*
STACK:
a: 10  →  a: 20
b: 10     b: 10 (independent)
*/
```

**Reference Assignment (Heap):**

```javascript
let obj1 = { value: 10 };
let obj2 = obj1;  // Reference copied, not object

obj1.value = 20;

console.log(obj1.value); // 20
console.log(obj2.value); // 20 (same object!)

/*
STACK:              HEAP:
obj1: 0x001 ──────┐
obj2: 0x001 ──────┴──→ 0x001: { value: 20 }
                        ↑
                    Same object in memory!
*/
```

**Memory Implications:**

```javascript
// Example: Why understanding stack vs heap matters

function modifyPrimitive(num) {
  num = 100;  // Only modifies local copy (stack)
}

function modifyObject(obj) {
  obj.value = 100;  // Modifies actual object (heap)
}

let x = 50;
let myObj = { value: 50 };

modifyPrimitive(x);
modifyObject(myObj);

console.log(x);           // 50 (unchanged)
console.log(myObj.value); // 100 (changed!)

/*
WHY?
====
modifyPrimitive:
- 'num' is a new stack variable with copied value
- Changing 'num' doesn't affect 'x'

modifyObject:
- 'obj' is a stack reference pointing to same heap object
- Changing obj.value modifies the actual heap object
*/
```

**String Immutability:**

```javascript
// Strings are primitive (immutable) even though they can be large

let str1 = "Hello";
let str2 = str1;

str1 = str1 + " World";  // Creates NEW string

console.log(str1); // "Hello World"
console.log(str2); // "Hello" (unchanged)

/*
STACK:                 STRING POOL (Special Heap Area):
str1: ptr1 ──────────→ "Hello"
                  ↓
str1: ptr2 ──────────→ "Hello World" (new string)
str2: ptr1 ──────────→ "Hello" (original)
*/
```

### Common Mistakes

❌ **Wrong**: Thinking all small data goes to stack
```javascript
// Even small objects go to heap
let tiny = {};  // Heap, not stack (it's an object)
```

✅ **Correct**: Type determines location, not size
```javascript
let bigNumber = 999999999999999;  // Stack (primitive)
let emptyObj = {};                // Heap (object)
```

❌ **Wrong**: Trying to "copy" objects with assignment
```javascript
let original = { data: [1, 2, 3] };
let copy = original;  // ❌ Not a copy, same reference!

copy.data.push(4);
console.log(original.data); // [1, 2, 3, 4] (affected!)
```

✅ **Correct**: Proper object copying
```javascript
// Shallow copy
let copy1 = { ...original };
let copy2 = Object.assign({}, original);

// Deep copy (for nested objects)
let copy3 = JSON.parse(JSON.stringify(original));
let copy4 = structuredClone(original); // Modern API
```

### Memory Size Comparison

| Type | Location | Size |
|------|----------|------|
| Number | Stack | 8 bytes |
| Boolean | Stack | 1 byte |
| undefined/null | Stack | 1 byte |
| Reference | Stack | 4-8 bytes (pointer) |
| Object | Heap | Variable |
| Array | Heap | Variable |
| Function | Heap | Variable |

### Follow-up Questions
1. "How does garbage collection work with heap memory?"
2. "What happens to stack memory after function returns?"
3. "Can stack overflow affect heap?"
4. "How are closures stored in memory?"

### Resources
- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [JavaScript Memory Model](https://blog.sessionstack.com/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec)

<details>
<summary><strong>🔍 Deep Dive: Stack vs Heap Implementation in V8</strong></summary>

**V8 Memory Architecture:**

```javascript
// V8's memory layout (simplified)

/*
┌─────────────────────────────────────┐
│         V8 MEMORY LAYOUT            │
├─────────────────────────────────────┤
│  STACK (Call Stack)                 │
│  - Fixed size: ~1MB (configurable)  │
│  - LIFO structure                   │
│  - Fast allocation/deallocation     │
│  - Thread-local                     │
├─────────────────────────────────────┤
│  HEAP (Managed Heap)                │
│  ├─ New Space (Young Generation)   │
│  │  - Size: 1-8MB                   │
│  │  - Semi-space: From/To spaces    │
│  │  - Fast allocation (bump pointer)│
│  │  - Scavenger GC (minor GC)       │
│  │                                   │
│  ├─ Old Space (Old Generation)      │
│  │  - Size: Dynamic (up to ~1.4GB)  │
│  │  - Long-lived objects             │
│  │  - Mark-Sweep-Compact GC (major) │
│  │                                   │
│  ├─ Large Object Space              │
│  │  - Objects > 1MB                 │
│  │  - Never moved by GC             │
│  │                                   │
│  ├─ Code Space                      │
│  │  - Compiled JavaScript code      │
│  │  - JIT-compiled functions        │
│  │                                   │
│  └─ Map Space                       │
│     - Hidden classes (shapes)       │
│     - Object structure metadata     │
└─────────────────────────────────────┘
*/

// Example: Tracing memory allocation
function analyzeMemoryAllocation() {
  // STACK allocations
  let age = 25;              // Stack: 8 bytes (number)
  let name = "John";         // Stack: 8 bytes (pointer to string)
  let isActive = true;       // Stack: 1 byte (boolean)

  // HEAP allocations
  let person = {             // Heap: object in New Space
    name: "John",            // Heap: string data
    age: 25,                 // Embedded in object (Smi - Small Integer)
    hobbies: ["coding"]      // Heap: array object + array data
  };

  // Stack frame structure:
  /*
  ┌─────────────────────┐ ← Stack Pointer (SP)
  │ isActive: true      │
  │ name: 0x001 ────────┼──→ Heap: "John"
  │ age: 25             │
  │ person: 0x002 ──────┼──→ Heap: { name: 0x001, age: 25, hobbies: 0x003 }
  │ Return address      │
  │ Previous frame ptr  │
  └─────────────────────┘
  */
}
```

**Pointer Tagging Optimization:**

```javascript
// V8 uses "pointer tagging" for efficient memory usage

/*
V8 Pointer Representation (64-bit):
====================================

Small Integers (Smi):
  - Range: -2³¹ to 2³¹-1
  - Stored directly in pointer (no heap allocation!)
  - Last bit = 0 (tag for Smi)
  - Example: 42 → 0x0000005400000000 (84 << 32, last bit 0)

Heap Pointers:
  - Last bit = 1 (tag for heap object)
  - Points to actual object in heap
  - Example: Object → 0x00000ABC00000001
*/

function pointerTaggingExample() {
  // These are Smis - NO heap allocation
  let a = 42;        // Stored in stack/register as tagged integer
  let b = 100;       // Stored in stack/register as tagged integer
  let c = a + b;     // Fast integer arithmetic, no heap access

  // This IS heap-allocated (exceeds Smi range)
  let big = 2**32;   // HeapNumber object in heap

  // Array of small numbers - PARTIALLY on heap
  let numbers = [1, 2, 3]; // Array object on heap, but 1,2,3 are Smis

  console.log(a, b, c); // Fast - all stack/register operations
}

/*
Performance Impact:
- Smi operations: ~0.3ns (CPU register arithmetic)
- HeapNumber operations: ~5ns (heap access + unboxing)
- ~16x faster for integers in Smi range!
*/
```

**Stack Frame Layout:**

```javascript
// Detailed stack frame structure

function outer(x) {
  let a = 10;

  function inner(y) {
    let b = 20;
    return x + y + a + b; // Closure - captures 'x' and 'a'
  }

  return inner(5);
}

outer(1);

/*
STACK FRAMES DURING EXECUTION:
===============================

When inner(5) executes:

┌─────────────────────────┐ ← Current Stack Pointer
│ inner() Stack Frame     │
├─────────────────────────┤
│ y: 5                    │ (parameter)
│ b: 20                   │ (local var)
│ Context: 0x001 ─────────┼──→ Heap: Closure context {x:1, a:10}
│ Return address          │
│ Frame pointer           │
├─────────────────────────┤
│ outer() Stack Frame     │
├─────────────────────────┤
│ x: 1                    │ (parameter) ← Moved to heap for closure!
│ a: 10                   │ (local var) ← Moved to heap for closure!
│ inner: 0x002 ───────────┼──→ Heap: Function object
│ Return address          │
│ Frame pointer           │
├─────────────────────────┤
│ global Stack Frame      │
└─────────────────────────┘

Note: Variables captured by closures (x, a) are "promoted"
from stack to heap so they survive after outer() returns!
*/
```

**Heap Object Layout:**

```javascript
// How objects are laid out in heap memory

const obj = {
  x: 1,
  y: 2,
  method() { return this.x; }
};

/*
HEAP OBJECT STRUCTURE:
======================

Address 0x1000 (obj):
┌──────────────────────────┐
│ Hidden Class Pointer     │ → Points to Map (object shape)
├──────────────────────────┤
│ Properties Pointer       │ → Points to properties array (if needed)
├──────────────────────────┤
│ Elements Pointer         │ → Points to indexed properties
├──────────────────────────┤
│ x: 1 (Smi - inline)      │ → Stored directly (fast!)
├──────────────────────────┤
│ y: 2 (Smi - inline)      │ → Stored directly (fast!)
├──────────────────────────┤
│ method: 0x2000           │ → Points to Function object
└──────────────────────────┘

Hidden Class (Map) at 0x3000:
┌──────────────────────────┐
│ Property x: offset 0     │
│ Property y: offset 8     │
│ Property method: offset 16│
│ Object shape metadata    │
└──────────────────────────┘

Total object size: ~40-60 bytes
  - Header: 12-24 bytes
  - Properties: 24 bytes (3 properties × 8 bytes)
*/
```

**Stack vs Heap Performance:**

```javascript
// Benchmark: Stack vs Heap access speed

function benchmarkStackAccess() {
  const iterations = 10_000_000;

  console.time('Stack access');
  for (let i = 0; i < iterations; i++) {
    let a = 1;      // Stack allocation
    let b = 2;      // Stack allocation
    let c = a + b;  // Stack operations
  }
  console.timeEnd('Stack access'); // ~15ms
}

function benchmarkHeapAccess() {
  const iterations = 10_000_000;

  console.time('Heap access');
  for (let i = 0; i < iterations; i++) {
    let obj = { a: 1, b: 2 };  // Heap allocation
    let c = obj.a + obj.b;     // Heap access + property lookup
  }
  console.timeEnd('Heap access'); // ~450ms
}

benchmarkStackAccess();  // ~15ms
benchmarkHeapAccess();   // ~450ms

// Heap access is ~30x slower than stack!
// Reasons:
// 1. Heap allocation overhead (finding free space)
// 2. Pointer dereferencing (extra memory access)
// 3. Property lookup (hidden class traversal)
// 4. Cache misses (heap objects scattered in memory)
```

**Memory Alignment:**

```javascript
// V8 aligns objects to word boundaries for performance

/*
64-bit System Word Size: 8 bytes
================================

Object padding example:
*/

const obj1 = { a: 1 };
// Actual memory layout (simplified):
// [Hidden Class Ptr: 8 bytes]
// [Properties Ptr: 8 bytes]
// [Elements Ptr: 8 bytes]
// [a: 8 bytes]
// Total: 32 bytes (aligned to 8-byte boundary)

const obj2 = { a: 1, b: true };
// [Hidden Class Ptr: 8 bytes]
// [Properties Ptr: 8 bytes]
// [Elements Ptr: 8 bytes]
// [a: 8 bytes]
// [b: 8 bytes] ← boolean padded to 8 bytes!
// Total: 40 bytes

// Booleans take 8 bytes in object properties (not 1 byte)
// due to alignment and pointer tagging!
```

**Copy-on-Write Optimization:**

```javascript
// V8 uses COW (Copy-on-Write) for some heap structures

// String copying
let str1 = "Hello World".repeat(1000); // Large string on heap
let str2 = str1;  // Shares same heap memory (no copy!)

str2 = str2.toUpperCase(); // NOW creates new heap memory

/*
Before toUpperCase():
str1 → [Heap: "Hello World..."] ← str2 (same pointer)

After toUpperCase():
str1 → [Heap: "Hello World..."]
str2 → [Heap: "HELLO WORLD..."] (new allocation)

Memory savings: No copy until mutation!
*/

// Array slicing (COW in some cases)
let arr1 = Array(10000).fill(1);
let arr2 = arr1.slice(); // May share backing store initially

arr2[0] = 99; // Triggers actual copy (COW)
```

**Real Production Impact:**

```javascript
// Case Study: Memory layout affecting performance

// ❌ BAD: Frequent heap allocations in hot loop
function processDataBad(items) {
  let results = [];
  for (let i = 0; i < items.length; i++) {
    // Creates NEW object every iteration (heap allocation)
    results.push({
      index: i,
      value: items[i] * 2,
      timestamp: Date.now()
    });
  }
  return results;
}

// Time for 1M items: ~850ms
// Memory: ~100MB allocated
// GC pauses: 15-20ms every ~200k items

// ✅ GOOD: Pre-allocate, reuse objects
function processDataGood(items) {
  const results = new Array(items.length); // Pre-allocate
  const result = { index: 0, value: 0, timestamp: 0 }; // Reuse object

  for (let i = 0; i < items.length; i++) {
    result.index = i;
    result.value = items[i] * 2;
    result.timestamp = Date.now();

    // Shallow copy (faster than creating new object)
    results[i] = { ...result };
  }
  return results;
}

// Time for 1M items: ~320ms (2.6x faster!)
// Memory: ~80MB allocated (20% less)
// GC pauses: 5-8ms (much better)

// Takeaway: Understanding stack vs heap matters for performance!
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Memory Leak from Reference Misunderstanding</strong></summary>

**Scenario:** Your React application's memory usage grows from 50MB to 800MB over 30 minutes of use. Users report the app becoming sluggish and eventually crashing. Investigation reveals a memory leak caused by misunderstanding stack vs heap memory.

**The Problem:**

```javascript
// ❌ BUG: Thinking copying reference creates independent objects

class EventManager {
  constructor() {
    this.listeners = []; // Heap array
  }

  addEventListener(event, callback) {
    // Developer thinks: "I'll store a copy of the callback"
    const storedCallback = callback; // ❌ This is a REFERENCE, not a copy!

    this.listeners.push({
      event,
      callback: storedCallback,
      timestamp: Date.now()
    });
  }

  removeEventListener(event, callback) {
    // This never removes anything because callback !== storedCallback
    // (different variables, but same reference... doesn't matter here)
    this.listeners = this.listeners.filter(
      listener => listener.callback !== callback
    );
  }
}

// Usage in React component:
function UserDashboard() {
  const eventManager = useRef(new EventManager()).current;

  useEffect(() => {
    // This function is recreated every render
    const handleUserUpdate = (data) => {
      console.log('User updated:', data);
    };

    eventManager.addEventListener('userUpdate', handleUserUpdate);

    return () => {
      // ❌ PROBLEM: handleUserUpdate is a NEW function each render
      // removeEventListener never finds it, so cleanup never happens!
      eventManager.removeEventListener('userUpdate', handleUserUpdate);
    };
  }, []); // Empty deps, but handleUserUpdate is still recreated!

  return <div>Dashboard</div>;
}

/*
MEMORY LEAK TIMELINE:
=====================
Initial render:
  - EventManager.listeners: 1 function reference

After 1 minute (10 re-renders):
  - EventManager.listeners: 10 function references
  - 9 are orphaned (no way to remove them)
  - Memory: +5MB

After 10 minutes (100 re-renders):
  - EventManager.listeners: 100 function references
  - 99 orphaned
  - Memory: +50MB

After 30 minutes (300 re-renders):
  - EventManager.listeners: 300 function references
  - 299 orphaned
  - Memory: +150MB

Plus: Each function closure captures component scope (props, state)
  - Each closure: ~2-5MB (references entire component tree)
  - Total leak: 300 × 3MB = 900MB!

Result: App crashes after 30-40 minutes
*/
```

**Debugging Process:**

```javascript
// Step 1: Take heap snapshots in Chrome DevTools

// Initial load:
console.log(performance.memory.usedJSHeapSize / 1024 / 1024); // 50MB

// After 10 minutes:
console.log(performance.memory.usedJSHeapSize / 1024 / 1024); // 350MB

// Step 2: Compare heap snapshots
// DevTools → Memory → Take snapshot → Compare
// Findings: EventManager.listeners array has 200 items, growing constantly

// Step 3: Add instrumentation
class EventManager {
  addEventListener(event, callback) {
    console.log('Adding listener. Total:', this.listeners.length + 1);
    this.listeners.push({ event, callback, timestamp: Date.now() });
  }

  removeEventListener(event, callback) {
    const before = this.listeners.length;
    this.listeners = this.listeners.filter(
      listener => listener.callback !== callback
    );
    const after = this.listeners.length;
    console.log(`Removed: ${before - after}. Remaining: ${after}`);
    // Output: "Removed: 0. Remaining: 201" ← AHA! Not removing anything!
  }
}

// Step 4: Identify root cause
// Every render creates NEW function (new heap object)
// cleanup tries to remove with different function reference
// References don't match → nothing removed → memory leak!
```

**Solution 1: Use useCallback:**

```javascript
// ✅ FIX: Memoize function so reference stays same

function UserDashboard() {
  const eventManager = useRef(new EventManager()).current;

  // Stable function reference across renders
  const handleUserUpdate = useCallback((data) => {
    console.log('User updated:', data);
  }, []); // Empty deps = function never recreated

  useEffect(() => {
    eventManager.addEventListener('userUpdate', handleUserUpdate);

    return () => {
      // Now cleanup works! Same function reference
      eventManager.removeEventListener('userUpdate', handleUserUpdate);
    };
  }, [handleUserUpdate]); // Depends on memoized function

  return <div>Dashboard</div>;
}

// Memory after 30 minutes: 52MB (stable!)
// listeners.length: 1 (constant)
```

**Solution 2: Store Function ID:**

```javascript
// ✅ ALTERNATIVE: Use WeakMap to track function identity

class EventManager {
  constructor() {
    this.listeners = [];
    this.functionIds = new WeakMap(); // Maps function → unique ID
    this.idCounter = 0;
  }

  addEventListener(event, callback) {
    // Generate stable ID for this function
    if (!this.functionIds.has(callback)) {
      this.functionIds.set(callback, this.idCounter++);
    }

    const id = this.functionIds.get(callback);

    this.listeners.push({
      event,
      callback,
      id,
      timestamp: Date.now()
    });
  }

  removeEventListener(event, callback) {
    const id = this.functionIds.get(callback);

    this.listeners = this.listeners.filter(
      listener => listener.id !== id
    );

    // Cleanup: remove from WeakMap if no listeners
    if (!this.listeners.some(l => l.id === id)) {
      this.functionIds.delete(callback);
    }
  }
}

// Now works even if function is recreated (same logic, different reference)
// Because we track by ID, not reference
```

**Solution 3: Event Manager with Auto-Cleanup:**

```javascript
// ✅ BEST: Use AbortController pattern (modern browser API)

class EventManager {
  constructor() {
    this.listeners = new Map(); // event → Set of callbacks
  }

  addEventListener(event, callback, signal) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(callback);

    // Auto-cleanup when signal aborts
    if (signal) {
      signal.addEventListener('abort', () => {
        this.removeEventListener(event, callback);
      }, { once: true });
    }
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);

      // Cleanup empty event entries
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

// Usage with automatic cleanup:
function UserDashboard() {
  const eventManager = useRef(new EventManager()).current;

  useEffect(() => {
    const controller = new AbortController();

    const handleUserUpdate = (data) => {
      console.log('User updated:', data);
    };

    // Pass abort signal for auto-cleanup
    eventManager.addEventListener(
      'userUpdate',
      handleUserUpdate,
      controller.signal
    );

    return () => {
      controller.abort(); // Auto-removes ALL listeners with this signal
    };
  }, []);

  return <div>Dashboard</div>;
}

// Memory: Stable at 50-55MB
// listeners cleanup: Automatic
// No manual tracking needed!
```

**Real Production Metrics:**

```javascript
/*
BEFORE FIX (useCallback solution):
===================================
Memory Usage Timeline:
  - Initial load: 50MB
  - After 5 min: 180MB
  - After 10 min: 350MB
  - After 20 min: 680MB
  - After 30 min: 980MB → CRASH

Performance:
  - Initial FPS: 60
  - After 10 min: 45 FPS
  - After 20 min: 25 FPS (janky)
  - After 30 min: 10 FPS → unresponsive

User Impact:
  - Crashes: 45% of sessions > 30 minutes
  - Support tickets: 85/week about "app slowing down"
  - User satisfaction: 2.3/5 stars
  - Bounce rate: 35% (users leaving due to poor performance)


AFTER FIX (useCallback solution):
==================================
Memory Usage Timeline:
  - Initial load: 50MB
  - After 5 min: 52MB
  - After 10 min: 54MB
  - After 30 min: 55MB (stable!)
  - After 2 hours: 58MB (minimal growth)

Performance:
  - Initial FPS: 60
  - After 10 min: 60 FPS
  - After 30 min: 59 FPS
  - After 2 hours: 58 FPS (stable!)

User Impact:
  - Crashes: 0.1% (unrelated issues)
  - Support tickets: 8/week (90% reduction)
  - User satisfaction: 4.6/5 stars
  - Bounce rate: 8% (77% improvement)
  - Revenue impact: +$45k/month (users staying longer)

Development Impact:
  - Bug fix time: 12 hours total
  - Time saved on support: 15 hours/week
  - Prevented 3 emergency hotfixes
*/
```

**Key Takeaway:**

```javascript
// Understanding stack vs heap is crucial for:

// 1. KNOWING that primitives are copied by value
let a = 5;
let b = a;  // b gets a COPY of value (independent)

// 2. KNOWING that objects are copied by reference
let obj1 = { x: 5 };
let obj2 = obj1;  // obj2 gets same REFERENCE (not independent!)

// 3. KNOWING that functions are objects (heap references)
const fn1 = () => {};
const fn2 = fn1;  // Same function reference
const fn3 = () => {};  // Different function reference (new heap object!)

console.log(fn1 === fn2); // true (same reference)
console.log(fn1 === fn3); // false (different references, even if identical code!)

// This understanding prevents:
// - Memory leaks (orphaned references)
// - Unexpected mutations (shared references)
// - Performance issues (unnecessary heap allocations)
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Stack vs Heap Memory Decisions</strong></summary>

**1. Primitive vs Object Storage:**

```javascript
// Storing multiple values: Array of primitives vs Array of objects

// Option A: Array of primitives (mostly stack, array container in heap)
const ages = [25, 30, 35, 40, 45]; // 5 numbers

// Option B: Array of objects (everything in heap)
const users = [
  { age: 25 },
  { age: 30 },
  { age: 35 },
  { age: 40 },
  { age: 45 }
]; // 5 objects
```

| Aspect | Primitives Array | Objects Array |
|--------|-----------------|---------------|
| **Memory usage** | ✅ ~100 bytes | ❌ ~400 bytes |
| **Access speed** | ✅ ~2ns | ⚠️ ~8ns |
| **Allocation** | ✅ One heap allocation | ❌ 6 heap allocations |
| **GC pressure** | ✅ Low | ❌ High (6 objects) |
| **Extensibility** | ❌ Hard to add properties | ✅ Easy to extend |
| **Semantics** | ⚠️ Less clear | ✅ Self-documenting |

**When to use each:**
- Use primitive arrays for: Performance-critical code, large datasets, simple values
- Use object arrays for: Complex data, need for extensibility, readability

**2. Closure Scope vs Parameter Passing:**

```javascript
// Scenario: Function needs access to external data

// Option A: Closure (variables promoted to heap)
function createCounter() {
  let count = 0;  // Moved to heap (closure context)
  return function() {
    return ++count;
  };
}

const counter = createCounter();
counter(); // 1

// Option B: Parameter passing (stays on stack)
function incrementCounter(count) {
  return count + 1;
}

let count = 0;
count = incrementCounter(count); // 1
```

| Aspect | Closure | Parameter Passing |
|--------|---------|------------------|
| **Memory location** | ❌ Heap | ✅ Stack |
| **State preservation** | ✅ Automatic | ❌ Manual |
| **Memory overhead** | ❌ Closure context object | ✅ None |
| **GC pressure** | ⚠️ Medium | ✅ None |
| **Simplicity** | ✅ Encapsulated | ⚠️ External state |
| **Performance** | ⚠️ Slower (~5-10ns) | ✅ Faster (~1ns) |

**When to use each:**
- Use closures for: Encapsulation, private state, event handlers, async callbacks
- Use parameters for: Pure functions, performance-critical loops, functional programming

**3. Object Literals vs Classes:**

```javascript
// Storing structured data

// Option A: Object literal (ad-hoc heap allocation)
function createUser(name, age) {
  return {
    name,
    age,
    greet() {
      return `Hello, ${this.name}`;
    }
  };
}

// Option B: Class instance (optimized hidden class)
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

function createUserClass(name, age) {
  return new User(name, age);
}
```

| Aspect | Object Literal | Class Instance |
|--------|---------------|----------------|
| **Hidden class** | ⚠️ May vary | ✅ Consistent (optimized) |
| **Method storage** | ❌ Per-object | ✅ Shared prototype |
| **Memory usage** | ❌ Higher (~80 bytes) | ✅ Lower (~40 bytes) |
| **Creation speed** | ✅ Fast | ⚠️ Slightly slower |
| **Optimization** | ⚠️ Deoptimizes easily | ✅ Highly optimizable |
| **Flexibility** | ✅ Very flexible | ⚠️ Fixed structure |

**When to use each:**
- Use object literals for: One-off objects, config objects, small datasets
- Use classes for: Many instances, performance-critical, consistent structure

**4. String Concatenation vs Template Literals:**

```javascript
// Building strings

// Option A: Concatenation (may create intermediate strings)
function buildMessage(name, age) {
  return "Hello, " + name + "! You are " + age + " years old.";
  // Creates 3 intermediate strings in heap!
}

// Option B: Template literal (single allocation)
function buildMessageTemplate(name, age) {
  return `Hello, ${name}! You are ${age} years old.`;
  // Single string allocation
}

// Option C: Array join (optimal for many parts)
function buildMessageArray(name, age) {
  return ["Hello, ", name, "! You are ", age, " years old."].join('');
  // Array allocation + single join operation
}
```

| Method | Small Strings | Large Strings | Many Parts |
|--------|--------------|---------------|------------|
| **Concatenation** | ✅ Fast | ❌ Slow (n² copies) | ❌ Many allocations |
| **Template literal** | ✅ Fast | ✅ Fast | ✅ Optimized |
| **Array.join** | ⚠️ Overhead | ✅ Fast | ✅ Best |

**Performance benchmark:**

```javascript
const iterations = 100000;

// Test 1: Concatenation
console.time('concat');
for (let i = 0; i < iterations; i++) {
  let str = "a" + "b" + "c" + "d" + "e";
}
console.timeEnd('concat'); // ~8ms

// Test 2: Template literal
console.time('template');
for (let i = 0; i < iterations; i++) {
  let str = `${"a"}${"b"}${"c"}${"d"}${"e"}`;
}
console.timeEnd('template'); // ~7ms

// Test 3: Array.join (many parts)
console.time('join');
for (let i = 0; i < iterations; i++) {
  let str = ["a", "b", "c", "d", "e"].join('');
}
console.timeEnd('join'); // ~12ms (array overhead)

// For 2-5 parts: Use template literals
// For >10 parts: Use array.join
```

**5. Pass by Value vs Pass by Reference:**

```javascript
// Function parameter strategy

// Primitive (pass by value - stack)
function updateAge(age) {
  age = age + 1;  // Modifies local copy only
  return age;
}

let myAge = 25;
updateAge(myAge);
console.log(myAge); // 25 (unchanged)

// Object (pass by reference - heap)
function updateUser(user) {
  user.age = user.age + 1;  // Modifies original object!
}

let myUser = { age: 25 };
updateUser(myUser);
console.log(myUser.age); // 26 (changed!)

// Defensive copy
function updateUserSafe(user) {
  const copy = { ...user };
  copy.age = copy.age + 1;
  return copy;  // Returns new object
}
```

| Approach | Pros | Cons |
|----------|------|------|
| **Mutate in place** | ✅ Fast, no allocation | ❌ Side effects, hard to debug |
| **Defensive copy** | ✅ Safe, predictable | ❌ Memory overhead, slower |
| **Immutable pattern** | ✅ Safe, trackable | ❌ More allocations, GC pressure |

**Decision Matrix:**

| Scenario | Best Choice | Reason |
|----------|------------|--------|
| **Hot loop (called millions of times)** | Stack/primitives | Minimize allocations |
| **Event handlers** | Closures (heap) | State preservation |
| **Large dataset processing** | Primitive arrays | Lower memory, faster |
| **Complex domain models** | Classes | Optimized, shared methods |
| **Config objects** | Object literals | Flexibility |
| **String building (<5 parts)** | Template literals | Clean, fast |
| **String building (>10 parts)** | Array.join | Optimal performance |
| **Pure functions** | Parameter passing | Predictable, testable |

</details>

<details>
<summary><strong>💬 Explain to Junior: Stack vs Heap Simplified</strong></summary>

**Simple Analogy: Desk vs Filing Cabinet**

Imagine you're working at a desk (stack) with a filing cabinet (heap) next to you:

**Stack (Your Desk):**
```javascript
function calculateTotal() {
  let price = 100;     // Write on sticky note on desk
  let tax = 10;        // Write on another sticky note
  let total = price + tax;  // Quick calculation
  return total;
  // When function ends, throw away sticky notes (automatic cleanup)
}

// Stack is like your desk:
// ✅ Small, quick notes (primitives)
// ✅ Fast to access (right in front of you)
// ✅ Limited space (desk gets full quickly)
// ✅ Auto-cleanup (clear desk when done)
```

**Heap (Filing Cabinet):**
```javascript
function createUser(name) {
  let user = {       // Put in filing cabinet (too big for desk)
    name: name,
    age: 25,
    friends: []
  };
  return user;
  // Filing cabinet keeps the folder even after function ends
}

// Heap is like a filing cabinet:
// ✅ Large storage (objects, arrays)
// ✅ Slower to access (walk to cabinet, open drawer, find folder)
// ✅ Unlimited space (can add more cabinets)
// ⚠️ Manual cleanup needed (garbage collector cleans old files)
```

**The Reference Trick:**

```javascript
// Desk (stack) stores LOCATION of file in cabinet (heap)

let user = { name: "Alice" };
// user is a sticky note on desk that says: "File #42 in cabinet"
// The actual object is in the filing cabinet

let anotherUser = user;
// anotherUser is ANOTHER sticky note that says: "File #42 in cabinet"
// Both sticky notes point to SAME file!

anotherUser.name = "Bob";
console.log(user.name); // "Bob" (same file was modified!)

/*
DESK (Stack):             FILING CABINET (Heap):
┌────────────────┐       ┌──────────────────────┐
│ user: "File #42"│ ────→│ File #42:            │
│ anotherUser:   │ ────→│   { name: "Bob" }    │
│   "File #42"   │       └──────────────────────┘
└────────────────┘
  ↑                ↑
  Both point to same file!
*/
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Thinking = copies objects
let obj1 = { value: 10 };
let obj2 = obj1;  // ❌ NOT a copy! Same file reference!

obj2.value = 20;
console.log(obj1.value); // 20 (surprised?)

// Why? obj1 and obj2 point to SAME object in heap
// It's like two people editing the same Google Doc

// ✅ FIX: Actually copy the object
let obj3 = { ...obj1 };  // Spread creates NEW object
obj3.value = 30;
console.log(obj1.value); // 20 (unchanged - different files!)


// ❌ MISTAKE 2: Expecting function to modify primitive
function tryToChange(num) {
  num = 100;  // Modifies local sticky note only
}

let myNum = 50;
tryToChange(myNum);
console.log(myNum); // 50 (unchanged!)

// Why? Function got a COPY of the value (new sticky note)
// Changing the copy doesn't affect original


// ❌ MISTAKE 3: Accidentally sharing objects
function createCounter() {
  // ❌ BAD: Shared object (same file for all counters!)
  const shared = { count: 0 };

  return {
    increment() { shared.count++; },
    get() { return shared.count; }
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

counter1.increment();
console.log(counter2.get()); // 1 (huh? we didn't touch counter2!)

// ✅ FIX: Each counter gets its own object
function createCounterFixed() {
  let count = 0;  // Each call creates separate variable

  return {
    increment() { count++; },
    get() { return count; }
  };
}
```

**Visual Memory Diagram:**

```javascript
let age = 25;
let name = "Alice";
let user = {
  name: "Alice",
  age: 25
};

/*
STACK (Fast, Small, Auto-cleanup):    HEAP (Slower, Large, GC cleanup):
┌────────────────────────┐           ┌──────────────────────────────┐
│ age: 25                │           │                              │
│ name: pointer ─────────┼──────────→│ String: "Alice"              │
│ user: pointer ─────────┼──────────→│ Object: {                    │
│                        │           │   name: pointer ────→ "Alice"│
└────────────────────────┘           │   age: 25                    │
         ↑                            │ }                            │
    Automatic cleanup                └──────────────────────────────┘
    when function ends                        ↑
                                      Garbage collected when
                                      no references exist
*/
```

**Explaining to PM:**

"Stack vs Heap is like working at a coffee shop:

**Stack (Order Counter):**
- Customer orders (function calls)
- Quick notes on cups (primitives)
- Orders processed fast (function executes)
- Cup thrown away when drink made (auto-cleanup)
- Limited counter space (small stack size)

**Heap (Storage Room):**
- Large items stored here (objects, arrays)
- Takes time to walk to storage room (slower access)
- Items stay until explicitly thrown away (garbage collection)
- Much more space available (large heap size)

**Why it matters for business:**
- Understanding this helps us:
  - Write faster apps (use stack when possible)
  - Avoid memory leaks (clean up heap references)
  - Reduce crashes (don't overflow stack)
  - Better user experience (smooth, fast app)"

**Quick Rules for Juniors:**

1. **Primitives go to stack** (fast!)
   ```javascript
   let age = 25;  // Stack
   let name = "Alice";  // Stack (pointer), string in heap
   ```

2. **Objects go to heap** (slower, but flexible)
   ```javascript
   let user = { age: 25 };  // Heap
   ```

3. **Assignment copies VALUE for primitives**
   ```javascript
   let a = 10;
   let b = a;  // b gets COPY of 10
   ```

4. **Assignment copies REFERENCE for objects**
   ```javascript
   let obj1 = { x: 10 };
   let obj2 = obj1;  // obj2 gets same reference
   ```

5. **To actually copy object, use spread**
   ```javascript
   let copy = { ...obj1 };  // New object
   ```

**Practice Exercise:**

```javascript
// What does this output?

let x = 5;
let y = x;
x = 10;
console.log(y); // ???

let obj1 = { value: 5 };
let obj2 = obj1;
obj1.value = 10;
console.log(obj2.value); // ???

// Answers:
console.log(y); // 5 (y has copy of original value)
console.log(obj2.value); // 10 (obj2 points to same object)

// Key: Primitives copy VALUE, objects copy REFERENCE
```

</details>

---

## Question 2: How Does JavaScript Handle Memory Management?

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

<details>
<summary><strong>🔍 Deep Dive: V8 Garbage Collection Internals</strong></summary>

**V8 Garbage Collection Strategy:**

```javascript
// V8 uses GENERATIONAL garbage collection
// Based on "Generational Hypothesis": Most objects die young

/*
V8 HEAP GENERATIONS:
====================

NEW SPACE (Young Generation):
┌────────────────────────────────────┐
│  From-Space  │    To-Space         │ ← Scavenger (Minor GC)
│   (1-4MB)    │    (1-4MB)          │
├────────────────────────────────────┤
│ New objects allocated here         │
│ Fast allocation: bump pointer      │
│ Frequent GC: every few seconds     │
│ 90% of objects die here!           │
└────────────────────────────────────┘

OLD SPACE (Old Generation):
┌────────────────────────────────────┐
│  Old Pointer Space                 │ ← Mark-Sweep-Compact (Major GC)
│  (Objects with pointers)           │
├────────────────────────────────────┤
│  Old Data Space                    │
│  (Objects with raw data)           │
├────────────────────────────────────┤
│ Promoted objects from New Space    │
│ Slow allocation                    │
│ Infrequent GC: when space full     │
│ Long-lived objects                 │
└────────────────────────────────────┘

LARGE OBJECT SPACE:
┌────────────────────────────────────┐
│  Objects > 1MB                     │
│  Never moved by GC                 │
│  Managed separately                │
└────────────────────────────────────┘
*/
```

**Scavenger Algorithm (Minor GC):**

```javascript
// How Scavenger works on New Space

/*
BEFORE GC (From-Space):
┌──────────────────────────────────┐
│ Obj A (live)                     │ ← Referenced
│ Obj B (dead)                     │ ← No references
│ Obj C (live)                     │ ← Referenced
│ Obj D (dead)                     │ ← No references
│ Obj E (live)                     │ ← Referenced
└──────────────────────────────────┘

GC PROCESS:
1. Stop-the-World pause (1-5ms typically)
2. Traverse from GC roots (stack, global, etc.)
3. Copy live objects to To-Space
4. Update all pointers
5. Swap From/To spaces
6. Resume execution

AFTER GC (To-Space):
┌──────────────────────────────────┐
│ Obj A (live)                     │
│ Obj C (live)                     │
│ Obj E (live)                     │
│ [free space]                     │
│ [free space]                     │
└──────────────────────────────────┘

Result:
- Dead objects (B, D) are gone (not copied)
- Live objects compacted (no fragmentation)
- From-Space completely empty (ready for next allocation)
*/

// Code example showing object lifecycle:
function demonstrateScavenger() {
  // Objects created in New Space
  let obj1 = { data: new Array(1000) };  // Allocated in From-Space
  let obj2 = { data: new Array(1000) };  // Allocated in From-Space
  let obj3 = { data: new Array(1000) };  // Allocated in From-Space

  // obj2 becomes unreachable
  obj2 = null;  // obj2 will die in next GC

  // Scavenger runs (triggered automatically)
  // obj1 and obj3 copied to To-Space
  // obj2 not copied (dead)

  // After several GCs, obj1 and obj3 promoted to Old Space
}

// Promotion to Old Space happens when:
// 1. Object survives 2 minor GCs
// 2. To-Space is > 25% full (promotes early)
```

**Mark-Sweep-Compact Algorithm (Major GC):**

```javascript
// How Major GC works on Old Space

/*
MARK PHASE:
===========
Traverse object graph from roots, mark all reachable objects

Initial heap:
┌────┬────┬────┬────┬────┬────┐
│ A  │ B  │ C  │ D  │ E  │ F  │
└────┴────┴────┴────┴────┴────┘

After marking:
┌────┬────┬────┬────┬────┬────┐
│ A✓ │ B  │ C✓ │ D  │ E✓ │ F✓ │
└────┴────┴────┴────┴────┴────┘
(✓ = marked as live, no mark = garbage)

SWEEP PHASE:
============
Scan heap, free unmarked objects

After sweeping:
┌────┬────┬────┬────┬────┬────┐
│ A✓ │    │ C✓ │    │ E✓ │ F✓ │
└────┴────┴────┴────┴────┴────┘
(blank = freed)

Problem: Fragmentation! Can't allocate large object

COMPACT PHASE:
==============
Move live objects together, update pointers

After compacting:
┌────┬────┬────┬────┬────┬────┐
│ A  │ C  │ E  │ F  │    │    │
└────┴────┴────┴────┴────┴────┘
(no fragmentation, large free block at end)
*/

// Real-world example:
function demonstrateMajorGC() {
  const arr = [];

  // Create many long-lived objects (will be promoted to Old Space)
  for (let i = 0; i < 1000; i++) {
    arr.push({
      id: i,
      data: new Array(100).fill(i),
      timestamp: Date.now()
    });
  }

  // Remove half of them (create garbage in Old Space)
  for (let i = 0; i < arr.length; i += 2) {
    arr[i] = null;  // Every other object becomes garbage
  }

  // Eventually triggers Major GC:
  // - Mark all reachable objects (arr[1], arr[3], arr[5]...)
  // - Sweep unreachable objects (arr[0], arr[2], arr[4]...)
  // - Compact remaining objects together

  // Major GC pause: 10-100ms (much longer than Minor GC!)
}
```

**Incremental Marking:**

```javascript
// V8 uses INCREMENTAL MARKING to reduce pause times

/*
TRADITIONAL MARK-SWEEP (Stop-the-World):
========================================
App running → [PAUSE: Mark all objects 50ms] → App running

User experiences: 50ms freeze (noticeable!)


INCREMENTAL MARKING:
====================
App: 10ms → [Mark: 5ms] → App: 10ms → [Mark: 5ms] → App: 10ms → [Mark: 5ms]...

Total marking time: still ~50ms
But spread across multiple pauses (5ms each)
User experiences: Smoother, less noticeable!
*/

// How it works:
function explainIncrementalMarking() {
  /*
  1. Start marking (initial pause: ~5ms)
     - Mark objects reachable from roots
     - Use tri-color marking:
       - WHITE: Not visited yet (default)
       - GRAY: Visited, but children not visited
       - BLACK: Visited, children visited

  2. Continue app execution
     - App can allocate/modify objects
     - Write barrier tracks mutations

  3. Mark more objects (pause: ~5ms)
     - Process GRAY objects
     - Mark their children

  4. Repeat until all objects marked

  5. Final pause (sweep + compact: ~10-20ms)
  */

  // Write barrier example:
  let objA = { ref: null };  // objA is BLACK (fully marked)
  let objB = { data: 123 };  // objB is WHITE (not marked yet)

  // During incremental marking:
  objA.ref = objB;  // Write barrier detects this!

  // Write barrier action:
  // - Marks objB as GRAY (needs to be processed)
  // - Ensures objB won't be missed by GC
  // - Without write barrier, objB would be collected as garbage!
}
```

**Concurrent Marking:**

```javascript
// V8 also uses CONCURRENT MARKING (parallel to app)

/*
TRADITIONAL GC:
===============
Main Thread:  [App] → [PAUSE: GC] → [App] → [PAUSE: GC] → [App]

CONCURRENT GC:
==============
Main Thread:  [App-App-App-App-App-App-App-App] → [PAUSE: Finalize 5ms]
BG Thread:      [GC-GC-GC-GC-GC-GC-GC]

Result:
- Most GC work done in background
- Only final sweep/compact pauses app
- Much shorter pause times!
*/

// Performance comparison:
const benchmark = {
  // Traditional Mark-Sweep-Compact:
  traditional: {
    pauseTime: 50,  // ms
    frequency: 'Every 10 seconds',
    impact: 'Noticeable jank',
    allocation: '100MB heap'
  },

  // Incremental + Concurrent:
  modern: {
    pauseTime: 5,   // ms (10x better!)
    frequency: 'Spread across time',
    impact: 'Barely noticeable',
    allocation: '100MB heap'
  }
};

// This is why modern JavaScript apps can have huge heaps
// without terrible GC pauses!
```

**Reference Counting (Old Approach):**

```javascript
// V8 doesn't use reference counting, but worth understanding

/*
REFERENCE COUNTING:
===================
Each object has a counter of how many references point to it

let objA = { data: 1 };  // refCount = 1
let objB = objA;         // refCount = 2
objB = null;             // refCount = 1
objA = null;             // refCount = 0 → COLLECT!

Pros:
✅ Immediate collection (refCount hits 0)
✅ Deterministic (know exactly when freed)

Cons:
❌ Can't handle cycles!
❌ Overhead (update count on every assignment)
❌ Not used by modern JS engines
*/

// Circular reference problem:
function demonstrateCircularReference() {
  let objA = {};
  let objB = {};

  objA.ref = objB;  // objA → objB
  objB.ref = objA;  // objB → objA (cycle!)

  // With reference counting:
  // objA.refCount = 2 (objA variable + objB.ref)
  // objB.refCount = 2 (objB variable + objA.ref)

  objA = null;  // objA.refCount = 1 (still has objB.ref)
  objB = null;  // objB.refCount = 1 (still has objA.ref)

  // LEAK! Both objects have refCount > 0
  // But they're unreachable from program!

  // Mark-Sweep solves this:
  // - Mark phase: Can't reach objA or objB from roots
  // - Sweep phase: Both collected (even with cycle!)
}
```

**GC Roots:**

```javascript
// What are GC roots? Starting points for mark phase

/*
GC ROOTS in JavaScript:
=======================

1. GLOBAL OBJECT (window, global, globalThis)
2. CALL STACK (local variables in active functions)
3. CLOSURES (variables captured by closures)
4. NATIVE OBJECTS (setTimeout, DOM nodes, etc.)
*/

// Example: Tracing reachability
let globalVar = { id: 1 };  // ← ROOT (global)

function outer() {
  let outerVar = { id: 2 };  // ← ROOT (stack)

  function inner() {
    let innerVar = { id: 3 };  // ← ROOT (stack)
    console.log(outerVar.id);  // Keeps outerVar alive (closure)

    let temp = { id: 4 };  // ← ROOT (stack)
    temp = null;  // No longer a root, eligible for GC
  }

  inner();
  // After inner() returns:
  // - innerVar is off stack (not a root anymore)
  // - outerVar still alive (captured by inner closure)
}

outer();

/*
REACHABILITY GRAPH:
===================

Global Object
  └─→ globalVar { id: 1 }

Call Stack (during inner())
  └─→ Outer Stack Frame
      └─→ outerVar { id: 2 }
  └─→ Inner Stack Frame
      └─→ innerVar { id: 3 }

After inner() returns:
  - innerVar UNREACHABLE → collected
  - outerVar still REACHABLE via closure → kept
*/
```

**Performance: GC Impact on Applications:**

```javascript
// Measuring GC impact

// Using Performance API:
performance.measure('gc-test');

let arr = [];
for (let i = 0; i < 1000000; i++) {
  arr.push({ id: i, data: new Array(10).fill(i) });
}

// Check memory usage
if (performance.memory) {
  const used = performance.memory.usedJSHeapSize / 1024 / 1024;
  const total = performance.memory.totalJSHeapSize / 1024 / 1024;
  console.log(`Used: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
}

// GC will trigger automatically when needed
// Minor GC: ~1-5ms pause (happens frequently)
// Major GC: ~10-100ms pause (happens occasionally)

/*
REAL APP GC METRICS (React SPA):
=================================

Development build:
- Minor GC: Every 2-5 seconds, 2-3ms pause
- Major GC: Every 30-60 seconds, 15-30ms pause
- User impact: Barely noticeable

Production build (optimized):
- Minor GC: Every 5-10 seconds, 1-2ms pause
- Major GC: Every 2-5 minutes, 5-15ms pause
- User impact: Not noticeable

Heavy app (lots of objects):
- Minor GC: Every 1-2 seconds, 5-10ms pause
- Major GC: Every 20-30 seconds, 50-100ms pause
- User impact: Noticeable stuttering

Memory leak (growing heap):
- Minor GC: Every second, 10-20ms pause
- Major GC: Every 10 seconds, 200-500ms pause
- User impact: App unusable, eventually crashes
*/
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Event Listener Memory Leak</strong></summary>

**Scenario:** Your single-page application's memory usage grows from 60MB to 1.2GB over 2 hours. The app becomes progressively slower until it crashes with "Out of Memory" error. Users report tabs freezing and browser becoming unresponsive.

**The Problem:**

```javascript
// ❌ BUG: Event listeners not cleaned up on component unmount

class Dashboard {
  constructor() {
    this.data = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now()
    }));
  }

  mount() {
    // Add event listener
    window.addEventListener('resize', this.handleResize.bind(this));

    // Problem: this.handleResize.bind(this) creates NEW function each time
    // No way to remove it later!
  }

  handleResize() {
    // Recalculate layout based on this.data
    console.log('Resizing...', this.data.length);
  }

  unmount() {
    // ❌ BUG: Can't remove listener!
    // window.removeEventListener('resize', ???)
    // We don't have reference to the bound function!

    // Developer thinks: "this.data will be garbage collected"
    // Reality: window.resize → bound function → this → this.data
    // The event listener keeps EVERYTHING alive!
  }
}

// React component (simulated)
function DashboardComponent() {
  useEffect(() => {
    const dashboard = new Dashboard();
    dashboard.mount();

    return () => {
      dashboard.unmount();  // Tries to cleanup, but fails!
    };
  }, []);  // Runs on mount and unmount

  return <div>Dashboard</div>;
}

// User navigates between routes:
// Route: / → /dashboard → / → /dashboard → / → /dashboard ...

/*
MEMORY LEAK TIMELINE:
=====================

First mount:
  - Dashboard instance: 400KB (data array)
  - Event listener registered
  - Total memory: 60MB

First unmount:
  - Dashboard instance should be freed
  - ❌ BUG: Event listener still references it
  - Dashboard KEPT ALIVE by window.resize listener
  - Total memory: 60MB (no leak yet, only 1 instance)

Second mount:
  - New Dashboard instance: 400KB
  - New event listener registered
  - Old Dashboard STILL ALIVE (held by old listener)
  - Total memory: 60MB + 400KB = 60.4MB

After 10 navigations:
  - 10 Dashboard instances: 10 × 400KB = 4MB
  - 10 event listeners
  - Total memory: 64MB

After 100 navigations (1 hour of use):
  - 100 Dashboard instances: 100 × 400KB = 40MB
  - 100 event listeners
  - Total memory: 100MB

After 1000 navigations (2 hours):
  - 1000 Dashboard instances: 1000 × 400KB = 400MB
  - 1000 event listeners (each one fires on window resize!)
  - Total memory: 460MB

After 3000 navigations (heavy user):
  - 3000 Dashboard instances: 3000 × 400KB = 1.2GB
  - 3000 event listeners
  - Total memory: 1.26GB → CRASH!

Performance degradation:
  - Each window resize triggers 3000 functions!
  - Resize event takes: 3000 × 2ms = 6 seconds (blocked!)
  - App freezes on resize
*/
```

**Debugging Process:**

```javascript
// Step 1: Take heap snapshots

// Initial load
console.log(performance.memory.usedJSHeapSize / 1024 / 1024); // 60MB

// After 10 navigations
console.log(performance.memory.usedJSHeapSize / 1024 / 1024); // 64MB

// After 50 navigations
console.log(performance.memory.usedJSHeapSize / 1024 / 1024); // 80MB

// Pattern: Memory grows with each navigation!

// Step 2: Chrome DevTools Heap Snapshot
// Memory tab → Take snapshot → Navigate → Take another snapshot → Compare

/*
Snapshot comparison shows:
  - Dashboard instances: 50 (expected: 1!)
  - Event listeners: 50
  - Retained size: 20MB (should be 400KB)

Retaining path:
Window
  └─→ resize listeners array
      └─→ Listener 1 (function)
          └─→ Dashboard instance 1
              └─→ data array (400KB)
      └─→ Listener 2 (function)
          └─→ Dashboard instance 2
              └─→ data array (400KB)
      └─→ ... (48 more!)

AHA! Window object holds all Dashboard instances via listeners!
*/

// Step 3: Profile resize event
let resizeCount = 0;
const originalResize = Dashboard.prototype.handleResize;

Dashboard.prototype.handleResize = function() {
  resizeCount++;
  console.log(`Resize handler called. Total handlers: ${resizeCount}`);
  return originalResize.apply(this, arguments);
};

// After 50 navigations, resize window:
// Output: "Resize handler called" × 50 times!
// Proof: All 50 listeners are still active!

// Step 4: Verify GC isn't working
if (global.gc) {
  global.gc();  // Force GC (Node.js --expose-gc flag)
  console.log('After GC:', performance.memory.usedJSHeapSize / 1024 / 1024);
  // Memory DOESN'T drop → objects still reachable
}
```

**Solution 1: Store Bound Function Reference:**

```javascript
// ✅ FIX: Keep reference to bound function for removal

class Dashboard {
  constructor() {
    this.data = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now()
    }));

    // Bind once in constructor, save reference
    this.handleResize = this.handleResize.bind(this);
  }

  mount() {
    // Use saved reference
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    console.log('Resizing...', this.data.length);
  }

  unmount() {
    // Remove using same reference ✅
    window.removeEventListener('resize', this.handleResize);

    // Now Dashboard can be garbage collected!
  }
}

// Memory after 1000 navigations: 60MB (stable!)
// Event listeners: 1 (old ones properly removed)
```

**Solution 2: Use Arrow Function:**

```javascript
// ✅ ALTERNATIVE: Arrow function (auto-bound)

class Dashboard {
  constructor() {
    this.data = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now()
    }));
  }

  // Arrow function is already bound
  handleResize = () => {
    console.log('Resizing...', this.data.length);
  }

  mount() {
    window.addEventListener('resize', this.handleResize);
  }

  unmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// Works because arrow function creates instance property
// this.handleResize is stable across mount/unmount
```

**Solution 3: AbortController (Modern):**

```javascript
// ✅ BEST: Use AbortController for automatic cleanup

class Dashboard {
  constructor() {
    this.data = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now()
    }));

    this.abortController = new AbortController();
  }

  mount() {
    window.addEventListener(
      'resize',
      this.handleResize.bind(this),
      { signal: this.abortController.signal }  // Magic!
    );

    // Can add multiple listeners with same signal
    window.addEventListener(
      'scroll',
      this.handleScroll.bind(this),
      { signal: this.abortController.signal }
    );
  }

  handleResize() {
    console.log('Resizing...', this.data.length);
  }

  handleScroll() {
    console.log('Scrolling...');
  }

  unmount() {
    // Remove ALL listeners at once!
    this.abortController.abort();

    // All listeners with this signal are removed
    // Dashboard can be garbage collected
  }
}

// Memory: Stable
// Cleanup: Automatic
// Code: Cleaner
```

**Solution 4: WeakMap for Auto-Cleanup:**

```javascript
// ✅ ADVANCED: Use WeakMap to auto-remove dead listeners

const listenerRegistry = new WeakMap();

class Dashboard {
  constructor() {
    this.data = new Array(10000).fill(0).map((_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now()
    }));
  }

  mount() {
    const handler = this.handleResize.bind(this);

    // Store handler in WeakMap
    listenerRegistry.set(this, {
      target: window,
      event: 'resize',
      handler
    });

    window.addEventListener('resize', handler);
  }

  handleResize() {
    console.log('Resizing...', this.data.length);
  }

  unmount() {
    const listener = listenerRegistry.get(this);
    if (listener) {
      listener.target.removeEventListener(listener.event, listener.handler);
      listenerRegistry.delete(this);
    }
  }
}

// WeakMap automatically releases Dashboard when no other references exist
// Even if unmount() is forgotten, eventual GC will cleanup
```

**Real Production Metrics:**

```javascript
/*
BEFORE FIX (memory leak):
=========================
Session 1 (30 minutes, moderate use):
  - Memory: 60MB → 180MB
  - Event listeners: 150
  - Resize performance: 300ms (janky)
  - User complaints: "App gets slow"

Session 2 (2 hours, heavy use):
  - Memory: 60MB → 1.2GB
  - Event listeners: 3000
  - Resize performance: 6 seconds (frozen)
  - Result: Tab crash

Business Impact:
  - Crashes: 25% of sessions > 1 hour
  - Support tickets: 120/week
  - User rating: 2.1/5 stars
  - Churn rate: 40% (users leaving due to performance)


AFTER FIX (AbortController solution):
======================================
Session 1 (30 minutes):
  - Memory: 60MB → 62MB (stable)
  - Event listeners: 1
  - Resize performance: 2ms (smooth)
  - User feedback: "Much faster!"

Session 2 (2 hours):
  - Memory: 60MB → 65MB (minimal growth)
  - Event listeners: 1
  - Resize performance: 2ms (consistent)
  - Result: No crashes

Business Impact:
  - Crashes: 0.1% (unrelated issues)
  - Support tickets: 12/week (90% reduction)
  - User rating: 4.7/5 stars
  - Churn rate: 8% (80% improvement)
  - Revenue impact: +$120k/month
  - Developer time saved: 20 hours/week

Development Impact:
  - Fix time: 4 hours
  - Lines changed: 3 lines per component
  - Prevented: 6 months of leak-related issues
*/
```

**Key Takeaways:**

```javascript
// Memory leak pattern recognition:

// ❌ LEAKS: Event listeners without cleanup
window.addEventListener('resize', () => { /* uses component data */ });
// Component unmounts, but listener keeps it alive!

// ❌ LEAKS: setInterval without clear
setInterval(() => { /* uses component data */ }, 1000);
// Component unmounts, but interval keeps it alive!

// ❌ LEAKS: Global references
window.myComponent = this;
// Component unmounts, but global reference keeps it alive!

// ❌ LEAKS: Closures capturing large data
element.onclick = () => {
  console.log(this.largeArray);  // Captures entire array
};
// Element removed, but closure keeps largeArray alive!


// ✅ FIXES: Always cleanup

// Cleanup listeners
componentWillUnmount() {
  window.removeEventListener('resize', this.handleResize);
}

// Cleanup intervals
componentWillUnmount() {
  clearInterval(this.intervalId);
}

// Cleanup global references
componentWillUnmount() {
  delete window.myComponent;
}

// Use AbortController (modern)
componentWillUnmount() {
  this.abortController.abort();  // Removes all listeners!
}
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Manual vs Automatic Memory Management</strong></summary>

**JavaScript (Automatic GC) vs C++ (Manual Memory):**

```javascript
// JavaScript: Automatic Memory Management

function processData(items) {
  // Allocation: Automatic
  const results = [];

  for (const item of items) {
    const processed = {
      id: item.id,
      value: item.value * 2,
      timestamp: Date.now()
    };
    results.push(processed);
  }

  return results;
  // Deallocation: Automatic (when no references)
  // No manual free() needed!
}

// When results is no longer used, GC frees it
```

```cpp
// C++: Manual Memory Management

std::vector<Result> processData(const std::vector<Item>& items) {
  std::vector<Result> results;

  for (const auto& item : items) {
    Result* processed = new Result{
      item.id,
      item.value * 2,
      getCurrentTime()
    };
    results.push_back(*processed);
    delete processed;  // MUST manually free!
  }

  return results;
  // If you forget delete → memory leak
  // If you delete twice → crash
}
```

| Aspect | Automatic (JS) | Manual (C++) |
|--------|---------------|--------------|
| **Safety** | ✅ No dangling pointers | ❌ Easy to mess up |
| **Speed** | ⚠️ GC pauses | ✅ No pauses |
| **Memory usage** | ❌ Higher (GC overhead) | ✅ Lower |
| **Determinism** | ❌ Unpredictable GC | ✅ Predictable |
| **Developer time** | ✅ Faster development | ❌ More code |
| **Bugs** | ✅ Fewer memory bugs | ❌ Common source of bugs |

**When Automatic GC is Better:**
- Web applications (user-facing, GC pauses acceptable)
- Rapid prototyping
- Business logic code
- Most applications (99% of use cases)

**When Manual is Better:**
- Real-time systems (games, audio, video)
- Embedded systems (limited memory)
- Operating systems
- High-performance computing

**2. Garbage Collection Strategies:**

```javascript
// Pattern 1: Generational GC (V8, Java)
// Assumes: Most objects die young

/*
Pros:
✅ Fast collection of young objects (common case)
✅ Less time spent on long-lived objects
✅ Good for typical app patterns

Cons:
❌ Still has pauses (minor + major GC)
❌ Not deterministic
❌ Overhead for tracking generations
*/

// Pattern 2: Reference Counting (Python, older browsers)
// Tracks: Count of references to each object

/*
Pros:
✅ Immediate collection (refCount = 0)
✅ Deterministic
✅ Simple to understand

Cons:
❌ Can't handle cycles
❌ Overhead on every assignment
❌ Slower overall
*/

// Pattern 3: Incremental/Concurrent GC (Modern V8)
// Spreads GC work over time or in background

/*
Pros:
✅ Very short pauses (<5ms)
✅ Smoother user experience
✅ Handles large heaps well

Cons:
❌ More complex implementation
❌ Some overhead (write barriers)
❌ Still occasional longer pauses
*/
```

**3. Object Pooling vs Allocation:**

```javascript
// Strategy 1: Create/destroy objects as needed

function withoutPooling() {
  const bullets = [];

  for (let i = 0; i < 1000; i++) {
    // Allocate new object
    bullets.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      velocity: { x: 5, y: 0 }
    });
  }

  // Later: bullets go off-screen
  bullets.splice(0, 500);  // Half garbage collected

  // Time: Allocation ~5ms, GC ~3ms
}

// Strategy 2: Object pooling

class BulletPool {
  constructor(size) {
    this.pool = [];
    this.active = [];

    // Pre-allocate objects
    for (let i = 0; i < size; i++) {
      this.pool.push({ x: 0, y: 0, velocity: { x: 0, y: 0 } });
    }
  }

  spawn(x, y, vx, vy) {
    let bullet = this.pool.pop() || { x: 0, y: 0, velocity: { x: 0, y: 0 } };
    bullet.x = x;
    bullet.y = y;
    bullet.velocity.x = vx;
    bullet.velocity.y = vy;
    this.active.push(bullet);
    return bullet;
  }

  despawn(bullet) {
    const index = this.active.indexOf(bullet);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(bullet);  // Reuse, don't GC!
    }
  }
}

const bulletPool = new BulletPool(1000);

function withPooling() {
  for (let i = 0; i < 1000; i++) {
    bulletPool.spawn(
      Math.random() * 100,
      Math.random() * 100,
      5, 0
    );
  }

  // Later: bullets go off-screen
  for (let i = 0; i < 500; i++) {
    bulletPool.despawn(bulletPool.active[0]);
  }

  // Time: Spawn ~2ms, despawn ~1ms, GC ~0ms!
}
```

| Aspect | No Pooling | Object Pooling |
|--------|-----------|----------------|
| **Allocation speed** | ⚠️ Medium | ✅ Fast (reuse) |
| **GC pressure** | ❌ High | ✅ Low |
| **Memory usage** | ✅ Lower (releases unused) | ⚠️ Higher (keeps pool) |
| **Code complexity** | ✅ Simple | ❌ More complex |
| **Use case** | General apps | Games, animations |

**4. Memory-Conscious Data Structures:**

```javascript
// Bad: Array of objects (heavy)
const users = [
  { id: 1, name: "Alice", age: 25, active: true },
  { id: 2, name: "Bob", age: 30, active: false },
  // ... 1000 more
];

// Memory: ~100KB (objects + properties + strings)
// GC pressure: High (1002 objects to track)

// Good: Struct of Arrays (SoA) (lighter)
const users = {
  ids: [1, 2, /* ... */],
  names: ["Alice", "Bob", /* ... */],
  ages: [25, 30, /* ... */],
  active: [true, false, /* ... */]
};

// Memory: ~40KB (arrays + primitives)
// GC pressure: Low (4 arrays to track)
// Access: users.ages[0] instead of users[0].age
```

| Pattern | Object per Item | Struct of Arrays |
|---------|----------------|------------------|
| **Memory usage** | ❌ High | ✅ Low |
| **GC pressure** | ❌ High | ✅ Low |
| **Cache locality** | ❌ Poor | ✅ Excellent |
| **Readability** | ✅ Natural | ⚠️ Less intuitive |
| **Use case** | Small datasets | Large datasets |

**Decision Matrix:**

| Use Case | Recommendation | Reason |
|----------|---------------|--------|
| **Web app (typical)** | Automatic GC, no pooling | Development speed, pauses acceptable |
| **Game (60 FPS)** | Object pooling, SoA | Minimize GC pauses |
| **Data processing** | Primitives, typed arrays | Lower memory, faster |
| **Long-lived app** | Careful cleanup, WeakMaps | Prevent leaks |
| **Short-lived script** | Allocate freely | GC after script ends |

</details>

<details>
<summary><strong>💬 Explain to Junior: Garbage Collection Simplified</strong></summary>

**Simple Analogy: Recycling Service**

Imagine JavaScript memory as your house, and the garbage collector is like a recycling service:

**Without Garbage Collection (Manual - C/C++):**
```javascript
// Like having NO recycling service:

function createUser() {
  const user = { name: "Alice" };  // Buy a box (allocate)

  // ... use the box ...

  // MUST manually throw it away when done
  // free(user);  ← If you forget this, box piles up in your house!
  // If you throw it away twice → you throw away something you don't own (crash!)
}

// Problem: Easy to forget, easy to mess up
```

**With Garbage Collection (Automatic - JavaScript):**
```javascript
// Like having automatic recycling service:

function createUser() {
  const user = { name: "Alice" };  // Buy a box (allocate)

  // ... use the box ...

  // When function ends, user is unreachable
  // Recycling service automatically picks it up!
}

// No manual cleanup needed!
```

**How Garbage Collector Works:**

```javascript
// The GC is like a recycling truck that comes by periodically

/*
STEP 1: Mark phase (Check what's still being used)
========
GC person walks through your house:
- "Is this box still needed?" (reachable from living areas?)
- If YES → mark it with "KEEP" sticker
- If NO → no sticker (will be recycled)

STEP 2: Sweep phase (Remove unused items)
========
GC person collects all items without "KEEP" sticker
Throws them in recycling truck
*/

// Code example:
let box1 = { item: "toys" };      // Box 1 in living room
let box2 = { item: "books" };     // Box 2 in living room
let box3 = { item: "old stuff" }; // Box 3 in living room

box3 = null;  // Box 3 moved to garage (not used anymore)

// GC comes by:
// - box1: Still in living room → KEEP ✅
// - box2: Still in living room → KEEP ✅
// - box3: In garage, nobody using it → RECYCLE ♻️

// After GC: box1 and box2 remain, box3 is gone!
```

**Generational GC (How V8 Optimizes):**

```javascript
// Smart recycling service knows: Most new items are thrown away quickly!

/*
NEW SPACE (New purchases):
- Small area for new boxes
- GC checks VERY OFTEN (every few minutes)
- 90% of boxes here get recycled quickly

OLD SPACE (Long-term storage):
- Large area for boxes you've kept for a while
- GC checks RARELY (every few hours)
- These boxes probably staying

FLOW:
Buy box → New Space → Still using after 2 GCs? → Move to Old Space
*/

// Example:
function processOrder() {
  // These are temporary (New Space)
  const temp1 = { data: "processing" };
  const temp2 = { data: "calculation" };

  // Used briefly, then gone (recycled from New Space quickly)
}

const globalCache = {};  // Long-lived (promoted to Old Space)
```

**Common Memory Leaks:**

```javascript
// ❌ LEAK 1: Forgot to cleanup event listener

let bigData = new Array(1000000).fill(0);

window.addEventListener('resize', function() {
  console.log(bigData.length);  // Uses bigData
});

// Even if you set bigData = null later:
bigData = null;

// The event listener STILL holds reference to bigData!
// It's like: You moved box to garage, but tied a string to it from living room
// GC sees string → thinks box is still needed → doesn't recycle


// ✅ FIX: Remove event listener

const handler = function() {
  console.log(bigData.length);
};

window.addEventListener('resize', handler);

// Later, cleanup:
window.removeEventListener('resize', handler);
bigData = null;  // Now GC can recycle it!
```

```javascript
// ❌ LEAK 2: Accidental global variable

function processData() {
  // Missing 'let' keyword!
  result = { data: new Array(1000000) };  // Becomes window.result
}

processData();

// result is now global → never recycled!
// It's like putting box in front yard → always visible → never picked up


// ✅ FIX: Always use let/const

function processData() {
  let result = { data: new Array(1000000) };
}

processData();
// result is local → recycled when function ends
```

**Explaining to PM:**

"Garbage collection is like having a cleaning service:

**Without GC (Manual memory - C/C++):**
- You have to tell the cleaning service exactly what to clean
- 'Clean this room, throw away that box, vacuum this area'
- If you forget something → mess piles up (memory leak)
- If you tell them to clean something twice → they break your stuff (crash)
- Developers spend 30% of time managing cleanup

**With GC (Automatic - JavaScript):**
- Cleaning service is smart → knows what's trash
- They check periodically: 'Is anyone using this?'
- If nobody's using it → they throw it away automatically
- Developers focus on features, not cleanup
- ~10x faster development time

**Trade-off:**
- Cleaning service takes small breaks (GC pauses: 1-10ms)
- Users might notice tiny freezes (rarely)
- But saves developers 100s of hours
- 99% of apps: The trade-off is worth it!"

**Visual Example:**

```javascript
// Lifecycle of an object:

function createPost() {
  let post = {                    // ← BORN (allocated in memory)
    title: "Hello World",
    content: "My first post",
    comments: []
  };

  // post is ALIVE (being used)
  console.log(post.title);

  return post;
}

let myPost = createPost();        // post LIVES ON (returned)
console.log(myPost.content);      // Still ALIVE (being used)

myPost = null;                    // post DIES (no references)

// GC comes by:
// - Sees post has no references
// - Marks it for collection
// - RECYCLES it (memory freed)

/*
TIMELINE:
=========
0ms:   post created         [Memory: +200 bytes]
10ms:  post returned        [Memory: +200 bytes]
20ms:  post used            [Memory: +200 bytes]
30ms:  post = null          [Memory: +200 bytes] (not freed yet)
35ms:  GC runs              [Memory: +0 bytes]   (freed!)

The GC doesn't run IMMEDIATELY when you set to null
It runs periodically (every few seconds)
*/
```

**Quick Rules for Juniors:**

1. **Don't worry about memory in most cases**
   - GC handles it automatically
   - Focus on writing correct code

2. **Clean up event listeners**
   - addEventListener → removeEventListener
   - Or use AbortController

3. **Clear intervals/timeouts**
   - setInterval → clearInterval
   - setTimeout → clearTimeout

4. **Avoid accidental globals**
   - Always use `let` or `const`
   - Enable strict mode: `"use strict"`

5. **Don't hold onto large data unnecessarily**
   ```javascript
   // ❌ BAD
   const cache = {};  // Keeps everything forever!

   // ✅ GOOD
   const cache = new Map();  // Can clear when needed
   cache.clear();  // Cleanup when appropriate
   ```

**Practice Quiz:**

```javascript
// Will this leak memory?

// Question 1:
function test1() {
  let data = new Array(1000);
  window.addEventListener('click', () => {
    console.log(data.length);
  });
}

test1();
// Answer: YES, leaks! Event listener keeps data alive


// Question 2:
function test2() {
  let data = new Array(1000);
  setTimeout(() => {
    console.log(data.length);
  }, 1000);
}

test2();
// Answer: NO leak! Timeout runs once, then data is released


// Question 3:
function test3() {
  let data = new Array(1000);
  return function() {
    console.log(data.length);
  };
}

const fn = test3();
// Answer: NO leak (yet)! data is kept alive by closure, but that's intended
// Only leaks if you forget about fn and never clean it up


// Question 4:
let obj1 = { name: "A" };
let obj2 = { name: "B" };
obj1.ref = obj2;
obj2.ref = obj1;
obj1 = null;
obj2 = null;
// Answer: NO leak! GC can handle circular references
```

</details>

---

