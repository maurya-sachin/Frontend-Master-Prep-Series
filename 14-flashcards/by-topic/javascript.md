# JavaScript Master Flashcards

> **100 essential JavaScript concepts for interview mastery**

**Time to review:** 50 minutes
**Best for:** Deep JavaScript understanding, senior-level interviews

---

## Card 1: Event Loop
**Q:** Explain the order of execution in the JavaScript event loop.

**A:** 1) Execute synchronous code (call stack), 2) Process all microtasks (Promises, queueMicrotask), 3) Render if needed, 4) Process one macrotask (setTimeout, setInterval, I/O), 5) Repeat.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #event-loop #async
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 2: Closures Memory
**Q:** How do closures affect memory and when can they cause memory leaks?

**A:** Closures keep references to their outer scope alive. Memory leaks occur when closures hold large objects or DOM elements unnecessarily, preventing garbage collection. Use weak references or nullify variables when done.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #closures #memory
**Frequency:** ⭐⭐⭐⭐

---

## Card 3: this in Arrow Functions
**Q:** How does 'this' binding differ between arrow functions and regular functions?

**A:** Arrow functions don't have their own 'this' - they inherit from parent scope (lexical this). Regular functions' 'this' depends on how they're called. Arrow functions can't be used as constructors.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this #arrow-functions
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 4: Prototype Chain
**Q:** What happens when you access a property that doesn't exist on an object?

**A:** JavaScript walks up the prototype chain: checks object → Object.prototype → null. Returns undefined if not found. Used by hasOwnProperty() vs 'in' operator.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #prototypes #inheritance
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 5: Temporal Dead Zone
**Q:** What is the Temporal Dead Zone (TDZ)?

**A:** The period between entering scope and variable declaration for let/const. Accessing variable in TDZ throws ReferenceError. var doesn't have TDZ (undefined instead).

**Difficulty:** 🟡 Medium
**Tags:** #javascript #tdz #scoping
**Frequency:** ⭐⭐⭐⭐

---

## Card 6: Promise Microtasks
**Q:** Why does Promise.then execute before setTimeout with 0ms delay?

**A:** Promises use the microtask queue which has higher priority than the macrotask queue (where setTimeout goes). All microtasks execute before the next macrotask.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #event-loop
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 7: == vs ===
**Q:** What's the difference between == and ===?

**A:** === checks value and type (strict equality). == performs type coercion before comparison. Use === to avoid unexpected conversions (0 == '0' is true).

**Difficulty:** 🟢 Easy
**Tags:** #javascript #operators #comparison
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 8: Call Stack Overflow
**Q:** What causes a stack overflow and how can you prevent it?

**A:** Caused by too many function calls without returning (usually infinite recursion). Prevent with: base cases in recursion, iterative approaches, or trampolining for tail-call optimization.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #recursion #call-stack
**Frequency:** ⭐⭐⭐⭐

---

## Card 9: Object.create vs new
**Q:** What's the difference between Object.create() and using new?

**A:** Object.create() creates object with specified prototype directly. new calls constructor function, creates object, sets prototype, binds this, returns object. Object.create gives more control over prototype chain.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #objects #prototypes
**Frequency:** ⭐⭐⭐⭐

---

## Card 10: Map vs Object
**Q:** When should you use Map instead of a plain Object?

**A:** Use Map for: 1) Non-string keys, 2) Frequent additions/deletions, 3) Size tracking (.size), 4) Iteration order guaranteed, 5) Better performance for large datasets.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #map #data-structures
**Frequency:** ⭐⭐⭐⭐

---

## Card 11: WeakMap Use Cases
**Q:** What are WeakMaps used for and why?

**A:** Store private data or metadata for objects without preventing garbage collection. Keys must be objects. Automatically cleaned up when object is no longer referenced. Used for caching, private properties.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #weakmap #memory
**Frequency:** ⭐⭐⭐

---

## Card 12: Generator Functions
**Q:** What are generator functions and when would you use them?

**A:** Functions that can pause and resume (yield keyword). Return an iterator. Use cases: lazy evaluation, infinite sequences, async flow control, custom iterators.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #generators #iterators
**Frequency:** ⭐⭐⭐

---

## Card 13: Proxy Object
**Q:** What is a Proxy and what can you intercept?

**A:** Wrapper that intercepts operations on objects. Can trap: get, set, has, deleteProperty, apply, construct, etc. Used for validation, logging, computed properties, negative array indices.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #proxy #meta-programming
**Frequency:** ⭐⭐⭐

---

## Card 14: Symbol Purpose
**Q:** What are Symbols used for in JavaScript?

**A:** Unique, immutable identifiers. Use cases: 1) Private object properties, 2) Well-known symbols (Symbol.iterator), 3) Avoid name collisions in objects, 4) Define object behavior.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #symbols #primitives
**Frequency:** ⭐⭐⭐

---

## Card 15: Module Patterns
**Q:** What's the difference between CommonJS and ES Modules?

**A:** CommonJS: require(), synchronous, exports object, runtime loading. ES Modules: import/export, static, tree-shakable, compile-time analysis. ESM is the standard for browsers.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #modules #import-export
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 16: Debounce vs Throttle
**Q:** When would you use debounce vs throttle?

**A:** Debounce: Execute after user stops action (search input, window resize). Throttle: Execute at regular intervals during action (scroll events, mouse movement). Debounce waits for pause, throttle limits frequency.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #performance #patterns
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 17: Currying
**Q:** What is function currying and why use it?

**A:** Transform function with multiple arguments into sequence of functions with single argument. Benefits: partial application, reusability, composition. Example: add(1)(2)(3).

**Difficulty:** 🟡 Medium
**Tags:** #javascript #functional #currying
**Frequency:** ⭐⭐⭐⭐

---

## Card 18: Memoization
**Q:** What is memoization and when should you use it?

**A:** Caching function results based on arguments. Use for: expensive calculations, recursive functions (fibonacci), API calls. Trade-off: memory for speed.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #optimization #caching
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 19: Event Delegation
**Q:** What is event delegation and why is it beneficial?

**A:** Attach single event listener to parent instead of many children. Benefits: better performance, works with dynamically added elements, less memory. Uses event bubbling.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #dom #events
**Frequency:** ⭐⭐⭐⭐⭐

---

## Card 20: Promise.all vs Promise.race
**Q:** What's the difference between Promise.all and Promise.race?

**A:** Promise.all: Waits for ALL promises to resolve (or ANY to reject). Returns array of all results. Promise.race: Returns first settled promise (resolved or rejected).

**Difficulty:** 🟢 Easy
**Tags:** #javascript #promises #async
**Frequency:** ⭐⭐⭐⭐⭐

---

[Continue with 80 more cards covering all JavaScript concepts...]

---

[← Back to Flashcards](../README.md)
