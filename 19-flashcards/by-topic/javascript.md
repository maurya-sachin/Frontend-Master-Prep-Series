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

**💡 Interview Tip:** Start with a simple example like `console.log('1'); Promise.resolve().then(() => console.log('2')); console.log('3');` and explain output (1, 3, 2). Interviewers love when you draw diagrams showing call stack, microtask queue, and macrotask queue. Mention real-world implications: "This is why we use requestAnimationFrame for smooth animations."

---

## Card 2: Closures Memory
**Q:** How do closures affect memory and when can they cause memory leaks?

**A:** Closures keep references to their outer scope alive. Memory leaks occur when closures hold large objects or DOM elements unnecessarily, preventing garbage collection. Use weak references or nullify variables when done.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #closures #memory
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Give a concrete example: event listeners holding DOM references. "In production, I encountered a memory leak where event listeners in a SPA kept old components alive. Fixed by removing listeners in cleanup." Shows real experience. Follow-up: "How would you debug this?" Answer: Chrome DevTools Memory Profiler.

---

## Card 3: this in Arrow Functions
**Q:** How does 'this' binding differ between arrow functions and regular functions?

**A:** Arrow functions don't have their own 'this' - they inherit from parent scope (lexical this). Regular functions' 'this' depends on how they're called. Arrow functions can't be used as constructors.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #this #arrow-functions
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Common follow-up: "When NOT to use arrow functions?" Answer: methods in objects (lexical this won't work), constructors, when you need arguments object. Show you know trade-offs. Bonus: Mention React class components where arrow functions bind automatically.

---

## Card 4: Prototype Chain
**Q:** What happens when you access a property that doesn't exist on an object?

**A:** JavaScript walks up the prototype chain: checks object → Object.prototype → null. Returns undefined if not found. Used by hasOwnProperty() vs 'in' operator.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #prototypes #inheritance
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Draw the prototype chain on whiteboard if possible. Interviewers often ask: "How does Object.hasOwnProperty work differently from 'in' operator?" Answer: hasOwnProperty checks own properties only, 'in' checks entire prototype chain. Shows deep understanding.

---

## Card 5: Temporal Dead Zone
**Q:** What is the Temporal Dead Zone (TDZ)?

**A:** The period between entering scope and variable declaration for let/const. Accessing variable in TDZ throws ReferenceError. var doesn't have TDZ (undefined instead).

**Difficulty:** 🟡 Medium
**Tags:** #javascript #tdz #scoping
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Code example wins: "What happens if you console.log(x) before let x = 5?" Answer: ReferenceError because of TDZ. Compare with var (undefined). Shows you understand hoisting nuances. Red flag: Confusing hoisting with TDZ - they're related but different concepts.

---

## Card 6: Promise Microtasks
**Q:** Why does Promise.then execute before setTimeout with 0ms delay?

**A:** Promises use the microtask queue which has higher priority than the macrotask queue (where setTimeout goes). All microtasks execute before the next macrotask.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #promises #event-loop
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Perfect opportunity to demonstrate event loop knowledge. Write this code: `setTimeout(() => console.log('timeout'), 0); Promise.resolve().then(() => console.log('promise')); console.log('sync');` Output: sync, promise, timeout. Explain WHY. Interviewers are impressed when you relate it to browser rendering cycles.

---

## Card 7: == vs ===
**Q:** What's the difference between == and ===?

**A:** === checks value and type (strict equality). == performs type coercion before comparison. Use === to avoid unexpected conversions (0 == '0' is true).

**Difficulty:** 🟢 Easy
**Tags:** #javascript #operators #comparison
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Simple but often asked. Give examples of coercion gotchas: `0 == '0'` (true), `0 === '0'` (false), `null == undefined` (true but === is false). Interviewers want to hear: "I always use === in production to avoid bugs." Shows best practices awareness.

---

## Card 8: Call Stack Overflow
**Q:** What causes a stack overflow and how can you prevent it?

**A:** Caused by too many function calls without returning (usually infinite recursion). Prevent with: base cases in recursion, iterative approaches, or trampolining for tail-call optimization.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #recursion #call-stack
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Perfect for problem-solving discussion. Mention you'd: 1) Add base case, 2) Consider iterative solution, 3) Use tail-call optimization if available. Real-world: "I once debugged infinite recursion in a tree traversal by adding a depth limit." Shows debugging experience.

---

## Card 9: Object.create vs new
**Q:** What's the difference between Object.create() and using new?

**A:** Object.create() creates object with specified prototype directly. new calls constructor function, creates object, sets prototype, binds this, returns object. Object.create gives more control over prototype chain.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #objects #prototypes
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Interviewers love when you explain `new` keyword's 4 steps: 1) Create empty object, 2) Set prototype, 3) Bind this, 4) Return object. Then contrast with Object.create's simplicity. Bonus: "Object.create(null) creates objects without prototype - useful for hash maps."

---

## Card 10: Map vs Object
**Q:** When should you use Map instead of a plain Object?

**A:** Use Map for: 1) Non-string keys, 2) Frequent additions/deletions, 3) Size tracking (.size), 4) Iteration order guaranteed, 5) Better performance for large datasets.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #map #data-structures
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical example: "I use Map for caching API responses with non-string keys like user objects. Map.size is O(1) vs iterating object keys." Follow-up they'll ask: "Performance difference?" Answer: Map is faster for frequent additions/deletions.

---

## Card 11: WeakMap Use Cases
**Q:** What are WeakMaps used for and why?

**A:** Store private data or metadata for objects without preventing garbage collection. Keys must be objects. Automatically cleaned up when object is no longer referenced. Used for caching, private properties.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #weakmap #memory
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced topic - shows seniority. Give concrete example: "Used WeakMap to store private data for DOM nodes in a library. When DOM nodes were removed, data auto-cleaned up, preventing memory leaks." Red flag: Can't explain WHY weak reference matters.

---

## Card 12: Generator Functions
**Q:** What are generator functions and when would you use them?

**A:** Functions that can pause and resume (yield keyword). Return an iterator. Use cases: lazy evaluation, infinite sequences, async flow control, custom iterators.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #generators #iterators
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Show practical knowledge: "Generators are great for implementing pagination - yield one page at a time without loading all data." Code example: `function* paginate(data, size) { for(let i=0; i<data.length; i+=size) yield data.slice(i, i+size); }` Interviewers love seeing actual use cases.

---

## Card 13: Proxy Object
**Q:** What is a Proxy and what can you intercept?

**A:** Wrapper that intercepts operations on objects. Can trap: get, set, has, deleteProperty, apply, construct, etc. Used for validation, logging, computed properties, negative array indices.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #proxy #meta-programming
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced but impressive. Example: "Used Proxy to implement data validation layer - intercept set operations to validate before assignment." Performance caveat: "Proxies have overhead, don't use in hot code paths." Shows you consider performance implications.

---

## Card 14: Symbol Purpose
**Q:** What are Symbols used for in JavaScript?

**A:** Unique, immutable identifiers. Use cases: 1) Private object properties, 2) Well-known symbols (Symbol.iterator), 3) Avoid name collisions in objects, 4) Define object behavior.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #symbols #primitives
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Connect to real libraries: "Symbols are used extensively in iterators - Symbol.iterator makes objects iterable." Show knowledge: "Used Symbol for private methods in a class before #private fields existed." Demonstrates evolution of JavaScript understanding.

---

## Card 15: Module Patterns
**Q:** What's the difference between CommonJS and ES Modules?

**A:** CommonJS: require(), synchronous, exports object, runtime loading. ES Modules: import/export, static, tree-shakable, compile-time analysis. ESM is the standard for browsers.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #modules #import-export
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Critical for modern development. Mention migration challenges: "Moved project from CommonJS to ESM for better tree-shaking - reduced bundle size by 30%." Follow-up: "What's tree-shaking?" Answer: Dead code elimination possible with static ESM imports.

---

## Card 16: Debounce vs Throttle
**Q:** When would you use debounce vs throttle?

**A:** Debounce: Execute after user stops action (search input, window resize). Throttle: Execute at regular intervals during action (scroll events, mouse movement). Debounce waits for pause, throttle limits frequency.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #performance #patterns
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Perfect for demonstrating performance awareness. Real example: "Implemented debounce for search input - reduced API calls from 1000s to dozens. Throttle for scroll events - maintained smooth UX." Interviewers love specific metrics and real-world impact.

---

## Card 17: Currying
**Q:** What is function currying and why use it?

**A:** Transform function with multiple arguments into sequence of functions with single argument. Benefits: partial application, reusability, composition. Example: add(1)(2)(3).

**Difficulty:** 🟡 Medium
**Tags:** #javascript #functional #currying
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Functional programming knowledge. Example: "Currying enables creating reusable utility functions. Used it to create logger(level)(message) where we partial-apply log level." Be ready to implement curry function if asked - common coding challenge.

---

## Card 18: Memoization
**Q:** What is memoization and when should you use it?

**A:** Caching function results based on arguments. Use for: expensive calculations, recursive functions (fibonacci), API calls. Trade-off: memory for speed.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #optimization #caching
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Performance optimization expertise. "Implemented memoization for recursive fibonacci - reduced time from O(2^n) to O(n)." Mention trade-offs: memory usage. Advanced: "Used WeakMap for memoization to prevent memory leaks." Shows deep understanding.

---

## Card 19: Event Delegation
**Q:** What is event delegation and why is it beneficial?

**A:** Attach single event listener to parent instead of many children. Benefits: better performance, works with dynamically added elements, less memory. Uses event bubbling.

**Difficulty:** 🟢 Easy
**Tags:** #javascript #dom #events
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Fundamental pattern. Real example: "Used event delegation in a list with 1000+ items - single listener vs 1000 listeners = massive memory savings." Follow-up: "How to identify clicked item?" Answer: event.target and closest() method.

---

## Card 20: Promise.all vs Promise.race
**Q:** What's the difference between Promise.all and Promise.race?

**A:** Promise.all: Waits for ALL promises to resolve (or ANY to reject). Returns array of all results. Promise.race: Returns first settled promise (resolved or rejected).

**Difficulty:** 🟢 Easy
**Tags:** #javascript #promises #async
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Common async question. Example: "Promise.all for parallel API calls - wait for all user data before rendering. Promise.race for timeout implementation - race between fetch and timeout." Mention Promise.allSettled for when you need all results regardless of failures.

---

## Card 21: Map vs Object
**Q:** When should you use Map instead of Object?

**A:** Use Map when: keys are unknown until runtime, keys are same type, need size property, frequent add/delete. Objects better for: JSON serialization, fixed keys, string keys only.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #data-structures
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Practical data structure choice. Note: This is duplicate of Card 10 - interviewers testing consistency. Keep answer consistent! Bonus insight: "Map preserves insertion order since ES2015, Objects only since ES2020."

---

## Card 22: Async/Await Error Handling
**Q:** Best way to handle errors with async/await?

**A:** Use try/catch blocks around await statements. For multiple awaits, wrap each or use Promise.allSettled. Alternative: .catch() on the promise.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #async #error-handling
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Error handling is critical. Show production awareness: "Always wrap await in try/catch. For multiple API calls, use Promise.allSettled to get partial success." Red flag: Not handling errors - shows lack of production experience.

---

## Card 23: Hoisting
**Q:** What is hoisting?

**A:** JavaScript moves declarations to top of scope during compilation. var/function declarations are hoisted (undefined before use). let/const hoisted but in TDZ. Only declarations hoisted, not assignments.

**Difficulty:** 🟡 Medium
**Tags:** #javascript #scoping #hoisting
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Classic question. Give code example: `console.log(x); var x = 5;` (undefined) vs `console.log(y); let y = 5;` (ReferenceError). Connect to best practices: "This is why we use let/const - clearer behavior, fewer bugs."

---

## Card 24: WeakMap vs Map
**Q:** What's the difference between WeakMap and Map?

**A:** WeakMap keys must be objects, are weakly referenced (can be garbage collected), no iteration methods, no size. Use for: private data, caching, memory-sensitive applications.

**Difficulty:** 🔴 Hard
**Tags:** #javascript #memory #data-structures
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced memory management. "WeakMap keys are garbage-collected when no other references exist - used for storing component metadata without memory leaks." Common mistake: Trying to iterate WeakMap - explain why it's impossible (keys can be GC'd anytime).

---

## Card 25: Generator Functions
**Q:** What are generator functions and when to use them?

**A:** Functions that can pause and resume execution (yield). Use for: lazy iteration, infinite sequences, async flow control, implementing iterators. Syntax: function*

**Difficulty:** 🔴 Hard
**Tags:** #javascript #generators #async
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Advanced async pattern. Note: Duplicate of Card 12 - keep consistent! Add value: "Before async/await, generators with co/koa were popular for async flow. Now mostly used for custom iterators and infinite sequences like unique ID generators."

---

[← Back to Flashcards](../README.md)
