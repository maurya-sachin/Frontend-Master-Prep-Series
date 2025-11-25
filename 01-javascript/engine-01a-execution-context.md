# Execution Context & Call Stack

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What is an Execution Context in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Uber

### Question
Explain what an execution context is in JavaScript. What are its components and types?

### Answer

An **execution context** is an abstract concept that holds information about the environment within which the current code is being executed. It's the foundation of how JavaScript code runs.

**Key Components of Execution Context:**

1. **Variable Environment**: Stores variables, function declarations, and arguments object
2. **Lexical Environment**: Stores identifier-variable mappings with reference to outer environment
3. **`this` Binding**: Determines the value of `this` keyword

**Types of Execution Context:**

1. **Global Execution Context (GEC)**
   - Created when JavaScript file first loads
   - Only one per program
   - Creates global object (`window` in browsers, `global` in Node.js)
   - Sets `this` to global object

2. **Function Execution Context (FEC)**
   - Created whenever a function is invoked
   - Each function gets its own execution context
   - Has access to arguments object

3. **Eval Execution Context** (rarely used, avoid in production)
   - Code executed inside `eval()` function

### Code Example

```javascript
// Global Execution Context is created
let globalVar = "I'm global";

function outerFunction() {
  // Function Execution Context created for outerFunction
  let outerVar = "I'm outer";

  function innerFunction() {
    // Function Execution Context created for innerFunction
    let innerVar = "I'm inner";

    console.log(globalVar); // Can access global
    console.log(outerVar);  // Can access outer
    console.log(innerVar);  // Can access own
  }

  innerFunction();
}

outerFunction();

// Execution Context Stack visualization:
// [Global Context]
// [Global Context, outerFunction Context]
// [Global Context, outerFunction Context, innerFunction Context]
// [Global Context, outerFunction Context]
// [Global Context]
```

**Visual Representation:**
```javascript
// Execution Context Structure
ExecutionContext = {
  VariableEnvironment: {
    environmentRecord: {
      // var declarations, function declarations
    },
    outer: <reference to parent>
  },
  LexicalEnvironment: {
    environmentRecord: {
      // let, const declarations
    },
    outer: <reference to parent>
  },
  ThisBinding: <value of this>
}
```

### Common Mistakes

❌ **Wrong**: Thinking each line of code creates a new context
```javascript
let a = 1;  // No new context
let b = 2;  // No new context
let c = 3;  // No new context
```

✅ **Correct**: Only function calls and global/eval create contexts
```javascript
function foo() {  // Context created when called
  let a = 1;
}
foo();  // New execution context created here
```

❌ **Wrong**: Confusing execution context with scope
- **Scope** is about variable visibility/accessibility (compile-time)
- **Execution context** is about code execution environment (runtime)

<details>
<summary><strong>🔍 Deep Dive: How V8 Manages Execution Contexts</strong></summary>

**V8 Internal Representation:**

```javascript
// V8 represents Execution Context as C++ objects internally
// Simplified representation of what V8 does:

class ExecutionContext {
  constructor(type) {
    this.type = type; // 'global', 'function', 'eval'

    // Variable Environment
    this.variableEnvironment = {
      environmentRecord: new Map(),
      outer: null // Reference to parent context
    };

    // Lexical Environment (for let/const)
    this.lexicalEnvironment = {
      environmentRecord: new Map(),
      outer: null
    };

    // This binding
    this.thisBinding = undefined;

    // Generator/Async context (if applicable)
    this.generator = null;
  }
}

// Example trace:
function outer() {
  var x = 10;
  let y = 20;

  function inner() {
    var z = 30;
    console.log(x, y, z);
  }

  inner();
}

outer();

/*
V8 CREATES THESE CONTEXTS:

1. Global Execution Context:
{
  type: 'global',
  variableEnvironment: {
    environmentRecord: {
      outer: <function>,
      x: undefined (initially)
    },
    outer: null
  },
  lexicalEnvironment: {
    environmentRecord: {},
    outer: null
  },
  thisBinding: window/global
}

2. outer() Function Context (when called):
{
  type: 'function',
  variableEnvironment: {
    environmentRecord: {
      arguments: { length: 0 },
      x: undefined (initially),
      inner: <function>
    },
    outer: <GlobalContext>
  },
  lexicalEnvironment: {
    environmentRecord: {
      y: <uninitialized> (TDZ)
    },
    outer: <GlobalContext>
  },
  thisBinding: window/undefined
}

3. inner() Function Context (when called):
{
  type: 'function',
  variableEnvironment: {
    environmentRecord: {
      arguments: { length: 0 },
      z: undefined (initially)
    },
    outer: <outerContext>
  },
  lexicalEnvironment: {
    environmentRecord: {},
    outer: <outerContext>
  },
  thisBinding: window/undefined
}
*/
```

**Call Stack Visualization in Memory:**

```javascript
// V8 uses a stack structure for execution contexts

function first() {
  console.log('First function');
  second();
  console.log('First function again');
}

function second() {
  console.log('Second function');
  third();
  console.log('Second function again');
}

function third() {
  console.log('Third function');
}

first();

/*
CALL STACK EVOLUTION:

Initial:
┌──────────────────┐
│ Global Context   │ ← Stack pointer
└──────────────────┘

After first() called:
┌──────────────────┐
│ first() Context  │ ← Stack pointer
├──────────────────┤
│ Global Context   │
└──────────────────┘

After second() called:
┌──────────────────┐
│ second() Context │ ← Stack pointer
├──────────────────┤
│ first() Context  │
├──────────────────┤
│ Global Context   │
└──────────────────┘

After third() called:
┌──────────────────┐
│ third() Context  │ ← Stack pointer (max depth: 4)
├──────────────────┤
│ second() Context │
├──────────────────┤
│ first() Context  │
├──────────────────┤
│ Global Context   │
└──────────────────┘

After third() returns:
┌──────────────────┐
│ second() Context │ ← Stack pointer
├──────────────────┤
│ first() Context  │
├──────────────────┤
│ Global Context   │
└──────────────────┘

... and so on until:

Final (all returned):
┌──────────────────┐
│ Global Context   │ ← Stack pointer
└──────────────────┘
*/
```

**Memory Allocation Strategy:**

```javascript
// V8 optimizes execution context storage

// CASE 1: Simple function (no closures) - Stack allocated
function simple(a, b) {
  var sum = a + b;
  return sum;
}

simple(5, 3);

/*
V8 optimization: Entire context on stack
Memory: ~100 bytes on stack
Destroyed immediately after return
*/

// CASE 2: Closure - Heap allocated context
function makeCounter() {
  let count = 0; // Captured by closure
  return function() {
    return ++count;
  };
}

const counter = makeCounter();

/*
V8 optimization: Moves 'count' to heap
Memory: ~40 bytes on heap (persists after makeCounter returns)
Garbage collected when counter becomes unreachable
*/

// CASE 3: Large number of variables - Optimized
function manyVars() {
  let a1, a2, a3, a4, a5; // ... 100 variables
  // V8 uses hash table for > ~20 variables
}

/*
V8 optimization:
- Few variables (<20): Direct slot access (fast)
- Many variables (>20): Hash table (slower but memory efficient)
*/
```

**Scope Chain Resolution Performance:**

```javascript
// Benchmark: Variable lookup depth

// Test 1: Local variable (fastest)
function test1() {
  let local = 10;
  console.time('local');
  for (let i = 0; i < 1000000; i++) {
    let x = local; // 0 scope hops
  }
  console.timeEnd('local'); // ~3ms
}

// Test 2: One level up
function test2() {
  let outer = 10;
  function inner() {
    console.time('1-level');
    for (let i = 0; i < 1000000; i++) {
      let x = outer; // 1 scope hop
    }
    console.timeEnd('1-level'); // ~4ms
  }
  inner();
}

// Test 3: Two levels up
function test3() {
  let outer = 10;
  function middle() {
    function inner() {
      console.time('2-levels');
      for (let i = 0; i < 1000000; i++) {
        let x = outer; // 2 scope hops
      }
      console.timeEnd('2-levels'); // ~5ms
    }
    inner();
  }
  middle();
}

// Test 4: Global variable (slowest)
var global = 10;
function test4() {
  console.time('global');
  for (let i = 0; i < 1000000; i++) {
    let x = global; // Multiple scope hops
  }
  console.timeEnd('global'); // ~6ms
}

/*
PERFORMANCE IMPACT:
- Each scope level adds ~1ms per 1M lookups
- Local variables are fastest (no scope chain traversal)
- Global variables are slowest (full chain traversal)
- TurboFan inlines and optimizes in hot code
*/
```

**Execution Context Stack Limits:**

```javascript
// Maximum call stack size

function recursion(depth) {
  if (depth === 0) return 'done';
  return recursion(depth - 1);
}

try {
  // Different engines have different limits:
  // V8 (Chrome/Node): ~10,000-15,000 frames
  // SpiderMonkey (Firefox): ~50,000 frames
  // JavaScriptCore (Safari): ~100,000 frames

  recursion(100000);
} catch (e) {
  console.error(e.message);
  // "Maximum call stack size exceeded"
}

/*
Why the limit?
- Each execution context: ~100-200 bytes
- Stack size: typically 1MB (browser) or 984KB (Node)
- Max depth ≈ Stack size / Context size
- 1MB / 100 bytes = ~10,000 frames
*/

// Tail Call Optimization (not widely supported)
'use strict';

function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc); // Tail call
}

// In strict mode with TCO: No stack growth!
// Without TCO: Stack grows O(n) → RangeError
```

**TurboFan Optimization (Hot Functions):**

```javascript
// V8's TurboFan optimizes hot execution contexts

function add(a, b) {
  return a + b;
}

// Cold: Interpreter executes (slow)
add(1, 2); // ~50ns per call

// After ~10,000 calls: TurboFan optimizes
for (let i = 0; i < 10000; i++) {
  add(i, i + 1);
}

// Hot: Native code executes (fast)
add(1, 2); // ~5ns per call (10x faster!)

/*
TurboFan optimizations:
1. Inline function body (no context creation)
2. Skip this binding
3. Eliminate dead code
4. Type specialization (assumes numbers)

Deoptimization triggers:
- Type change: add("string", 1) → Deopt back to interpreter
- Hidden class change
- Bailout to slow path
*/
```

**Memory Profiling Execution Contexts:**

```javascript
// Detecting context memory leaks

// BAD: Unintentional closure keeps context alive
const buttons = document.querySelectorAll('button');

buttons.forEach((button, index) => {
  button.addEventListener('click', function() {
    console.log(`Button ${index} clicked`);
    // This closure captures entire forEach context!
    // Includes: buttons array, button variable, index
    // Memory leak: 100 buttons × 1KB context = 100KB leaked
  });
});

// GOOD: Minimal closure
buttons.forEach((button, index) => {
  const buttonIndex = index; // Only capture what's needed
  button.addEventListener('click', function() {
    console.log(`Button ${buttonIndex} clicked`);
    // Only captures buttonIndex (8 bytes)
    // Memory: 100 buttons × 8 bytes = 800 bytes
  });
});

// BETTER: No closure at all
buttons.forEach((button, index) => {
  button.dataset.index = index; // Store in DOM
  button.addEventListener('click', function() {
    console.log(`Button ${this.dataset.index} clicked`);
    // No closure! No context captured!
    // Memory: 0 bytes of context leaks
  });
});
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Stack Overflow from Deep Recursion</strong></summary>

**Scenario:** Your e-commerce site crashes with "Maximum call stack size exceeded" when users navigate deeply nested category trees (Electronics > Computers > Laptops > Gaming Laptops > High-End > ASUS > ROG Series...). The category rendering function uses recursion and creates too many execution contexts.

**The Problem:**

```javascript
// ❌ BUG: Unoptimized recursive category rendering
function renderCategory(category) {
  // Each call creates new execution context!
  const html = `
    <div class="category">
      <h3>${category.name}</h3>
      ${category.children.map(child => renderCategory(child)).join('')}
    </div>
  `;
  return html;
}

// User's category tree:
const categories = {
  name: 'All Products',
  children: [
    {
      name: 'Electronics',
      children: [
        {
          name: 'Computers',
          children: [
            {
              name: 'Laptops',
              children: [
                // ... 50 more levels deep!
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Attempt to render:
try {
  const html = renderCategory(categories);
} catch (error) {
  console.error(error);
  // RangeError: Maximum call stack size exceeded
  // Site crashes, user sees blank page!
}

/*
Production impact:
- Crashes: 25 per day
- Affected pages: Deep category pages (15% of catalog)
- User complaints: "Category page won't load"
- Lost revenue: ~$3k/day (users can't browse → can't buy)
- Call stack depth when crashing: ~12,000 frames
- Memory before crash: ~100MB just for execution contexts
*/
```

**Debugging:**

```javascript
// Step 1: Measure recursion depth
function renderCategoryDebug(category, depth = 0) {
  console.log(`Depth: ${depth}, Category: ${category.name}`);

  if (depth > 100) {
    console.error('DANGER: Depth exceeds 100!');
    console.trace(); // Print stack trace
  }

  const html = `
    <div class="category">
      <h3>${category.name}</h3>
      ${category.children.map(child => renderCategoryDebug(child, depth + 1)).join('')}
    </div>
  `;
  return html;
}

// Output shows depth reaching 150+ levels before crash!

// Step 2: Check execution context count
let contextCount = 0;

function renderCategoryCount(category) {
  contextCount++;
  console.log(`Active contexts: ${contextCount}`);

  const html = `...`;

  contextCount--;
  return html;
}

// Peak context count: 12,483 contexts!
// Each context: ~100 bytes
// Total stack memory: 12,483 × 100 = 1.2MB (exceeds limit!)
```

**Solution 1: Iterative with Explicit Stack:**

```javascript
// ✅ FIX: Use iteration instead of recursion
function renderCategoryIterative(rootCategory) {
  let html = '';
  const stack = [{ category: rootCategory, depth: 0 }];

  while (stack.length > 0) {
    const { category, depth } = stack.pop();

    // Open div
    html += `<div class="category" style="margin-left: ${depth * 20}px">`;
    html += `<h3>${category.name}</h3>`;

    // Add children to stack (in reverse for correct order)
    for (let i = category.children.length - 1; i >= 0; i--) {
      stack.push({ category: category.children[i], depth: depth + 1 });
    }

    html += '</div>';
  }

  return html;
}

/*
Benefits:
- No recursion → no call stack growth
- Single execution context reused
- Memory: Constant O(1) vs O(n) for recursion
- Can handle unlimited depth
- Performance: Same or better than recursion
*/

// Result:
const html = renderCategoryIterative(categories); // ✅ Works!
// Max stack.length: ~150 (manageable)
// Memory: ~15KB (vs 1.2MB before)
```

**Solution 2: Tail Call with Accumulator (ES6 Strict):**

```javascript
// ✅ ALTERNATIVE: Tail-recursive with accumulator
'use strict';

function renderCategoryTail(category, html = '') {
  html += `<div class="category"><h3>${category.name}</h3>`;

  // Process children tail-recursively
  return processChildren(category.children, 0, html);
}

function processChildren(children, index, html) {
  if (index >= children.length) {
    return html + '</div>';
  }

  // Tail call: Last operation is function call
  return processChildren(
    children,
    index + 1,
    html + renderCategoryTail(children[index])
  );
}

/*
Note: Tail Call Optimization (TCO) not widely supported!
- Safari: ✅ Supports TCO
- Chrome/Firefox: ❌ No TCO (will still crash)
- Solution 1 (iterative) is more reliable
*/
```

**Solution 3: Lazy Loading with Depth Limit:**

```javascript
// ✅ BEST: Render only visible levels, lazy-load deep ones
function renderCategoryLazy(category, depth = 0, maxDepth = 5) {
  let html = `<div class="category" data-id="${category.id}">`;
  html += `<h3>${category.name}</h3>`;

  if (depth < maxDepth && category.children.length > 0) {
    // Render children normally
    html += category.children
      .map(child => renderCategoryLazy(child, depth + 1, maxDepth))
      .join('');
  } else if (category.children.length > 0) {
    // Show "Load more" button for deep levels
    html += `
      <button
        class="load-more"
        data-category-id="${category.id}"
        onclick="loadSubcategories(${category.id})">
        Load ${category.children.length} subcategories
      </button>
    `;
  }

  html += '</div>';
  return html;
}

// AJAX function to load more
function loadSubcategories(categoryId) {
  fetch(`/api/categories/${categoryId}/children`)
    .then(res => res.json())
    .then(children => {
      const container = document.querySelector(`[data-id="${categoryId}"]`);
      container.innerHTML += children
        .map(child => renderCategoryLazy(child, 0, 5))
        .join('');
    });
}

/*
Benefits:
- Max recursion depth: 5 (safe!)
- Faster initial page load
- Better UX: Progressive disclosure
- Reduced memory: Only render visible categories
- Works with any depth tree
*/
```

**Solution 4: Virtual Scrolling for Large Trees:**

```javascript
// ✅ PRODUCTION: Virtual scrolling + flattened tree
function flattenCategoryTree(category, depth = 0) {
  const result = [{ ...category, depth }];

  if (category.children) {
    category.children.forEach(child => {
      result.push(...flattenCategoryTree(child, depth + 1));
    });
  }

  return result;
}

// Flatten once (can handle any depth)
const flatCategories = flattenCategoryTree(categories);
// flatCategories: Array of 500 items (instead of nested tree)

// Render only visible items (virtual scrolling)
function renderVisibleCategories(startIndex, endIndex) {
  return flatCategories
    .slice(startIndex, endIndex)
    .map(category => `
      <div class="category" style="margin-left: ${category.depth * 20}px">
        <h3>${category.name}</h3>
      </div>
    `)
    .join('');
}

// On scroll: Update visible range
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const itemHeight = 50;

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = startIndex + 20; // Show 20 items

  document.getElementById('category-container').innerHTML =
    renderVisibleCategories(startIndex, endIndex);
});

/*
Benefits:
- Flattening: O(n) single pass (safe)
- Rendering: O(20) always (constant!)
- Memory: Minimal (only 20 DOM nodes)
- Smooth scrolling with 1000+ categories
- No recursion limits!
*/
```

**Real Metrics After Fix:**

```javascript
// Before (recursive):
// - Crashes: 25/day
// - Max depth: 12,000 frames → crash
// - Page load time: 8s → crash
// - Memory: 100MB+ → crash
// - Lost revenue: $3k/day

// After (Solution 3: Lazy loading):
// - Crashes: 0/day ✅
// - Max depth: 5 frames (safe)
// - Page load time: 1.2s ✅
// - Memory: 5MB (95% reduction)
// - Revenue recovered: $3k/day
// - User satisfaction: +78%
// - Bonus: Faster page loads for shallow categories too!
```

**Performance Comparison:**

```javascript
// Benchmark: 500-node category tree

console.time('Recursive');
renderCategory(hugeTree); // Crash after 12,000 nodes
console.timeEnd('Recursive'); // Never finishes

console.time('Iterative');
renderCategoryIterative(hugeTree); // ✅ 45ms
console.timeEnd('Iterative');

console.time('Lazy (depth 5)');
renderCategoryLazy(hugeTree, 0, 5); // ✅ 8ms (only renders top 5 levels)
console.timeEnd('Lazy');

console.time('Virtual scrolling');
const flat = flattenCategoryTree(hugeTree); // ✅ 12ms (flatten)
renderVisibleCategories(0, 20); // ✅ 2ms (render visible)
console.timeEnd('Virtual scrolling'); // Total: 14ms

/*
Winner: Lazy loading for < 1000 nodes
Winner: Virtual scrolling for > 1000 nodes
*/
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Execution Context Patterns</strong></summary>

**1. Recursion vs Iteration:**

```javascript
// Pattern 1: Recursion (creates many contexts)
function sumRecursive(arr, index = 0) {
  if (index >= arr.length) return 0;
  return arr[index] + sumRecursive(arr, index + 1);
}

// Pattern 2: Iteration (single context)
function sumIterative(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}
```

| Aspect | Recursion | Iteration |
|--------|-----------|-----------|
| **Execution contexts** | O(n) - one per call | O(1) - single context |
| **Memory** | ❌ Stack grows O(n) | ✅ Constant O(1) |
| **Stack overflow risk** | ⚠️ High (depth > 10k) | ✅ None |
| **Readability** | ✅ Often cleaner | ⚠️ Sometimes verbose |
| **Performance** | ⚠️ Slower (context overhead) | ✅ Faster |
| **Best for** | Tree traversal, divide-conquer | Loops, large data |

**When to use each:**

```javascript
// ✅ Use recursion for:
// 1. Tree/graph traversal (natural fit)
function traverseDOM(node) {
  console.log(node.tagName);
  node.children.forEach(child => traverseDOM(child));
}

// 2. Divide and conquer (merge sort, quick sort)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

// ✅ Use iteration for:
// 1. Large datasets (avoid stack overflow)
function processLargeArray(arr) {
  for (const item of arr) {
    process(item); // No stack growth
  }
}

// 2. Performance-critical loops
function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i]; // Fastest
  }
  return sum;
}
```

**2. Global vs Function vs Block Scope:**

```javascript
// Pattern 1: Global context
var globalVar = 'global';

// Pattern 2: Function context
function func() {
  var funcVar = 'function';
}

// Pattern 3: Block context (ES6)
{
  let blockVar = 'block';
}
```

| Aspect | Global Context | Function Context | Block Scope |
|--------|---------------|-----------------|-------------|
| **Lifetime** | Entire program | Function call | Block execution |
| **Memory** | ❌ Never freed | ✅ Freed on return | ✅ Freed on block exit |
| **Namespace pollution** | ❌ High risk | ✅ Isolated | ✅ Isolated |
| **this binding** | window/global | Depends on call | N/A (inherits) |
| **Performance** | ⚠️ Slower lookup | ✅ Fast | ✅ Fastest (local) |

**3. Closures vs Passing Data:**

```javascript
// Pattern 1: Closure (preserves execution context)
function makeCounter() {
  let count = 0; // Captured in closure
  return function() {
    return ++count;
  };
}

const counter = makeCounter();

// Pattern 2: Passing data explicitly
function createCounter(state) {
  return {
    increment: () => state.count++,
    get: () => state.count
  };
}

const state = { count: 0 };
const counter2 = createCounter(state);
```

| Aspect | Closure | Explicit State |
|--------|---------|---------------|
| **Memory** | ⚠️ Context kept alive | ✅ Explicit allocation |
| **Encapsulation** | ✅ True private vars | ⚠️ External object |
| **Debugging** | ❌ Harder (hidden state) | ✅ Visible state |
| **Garbage collection** | ⚠️ Manual (careful!) | ✅ Clear ownership |
| **Performance** | ⚠️ Context lookup | ✅ Direct property access |

**4. Arrow Functions vs Regular Functions:**

```javascript
// Pattern 1: Regular function (creates full context)
const obj1 = {
  name: 'Alice',
  greet: function() {
    console.log(this.name); // New this binding
  }
};

// Pattern 2: Arrow function (lexical this, minimal context)
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name); // Inherits this, no binding
  }
};
```

| Aspect | Regular Function | Arrow Function |
|--------|-----------------|----------------|
| **this binding** | ✅ Dynamic (call-time) | ✅ Lexical (define-time) |
| **arguments object** | ✅ Available | ❌ Not available |
| **new constructor** | ✅ Can use | ❌ Cannot use |
| **Context overhead** | ⚠️ Full context | ✅ Minimal context |
| **Memory** | ⚠️ Slightly more | ✅ Slightly less |

**5. Depth Limit Strategies:**

| Strategy | Max Depth | Memory | Performance | Use Case |
|----------|-----------|--------|-------------|----------|
| **Direct recursion** | ~10,000 | ❌ O(n) stack | ⚠️ Medium | Small trees |
| **Tail recursion** | ~10,000* | ⚠️ O(n) (no TCO) | ✅ Fast | Limited (Safari only) |
| **Iteration + stack** | ∞ | ✅ O(max depth) | ✅ Fast | Any depth |
| **Trampoline** | ∞ | ✅ O(1) | ⚠️ Slower | Deep recursion |
| **Lazy loading** | ∞ | ✅ O(visible) | ✅ Fastest | UI rendering |

*Tail Call Optimization only in Safari (strict mode)

**Example: Trampoline Pattern:**

```javascript
// Trampoline eliminates recursion depth limit
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result(); // Execute next step
    }
    return result;
  };
}

// Trampolined factorial (no stack growth!)
const factorial = trampoline(function fact(n, acc = 1) {
  if (n <= 1) return acc;
  return () => fact(n - 1, n * acc); // Return function
});

factorial(100000); // ✅ Works! (regular recursion would crash)
```

**Decision Matrix:**

| Scenario | Best Pattern | Reason |
|----------|-------------|--------|
| **Simple loop** | Iteration | Fastest, safest |
| **Tree traversal** | Recursion (depth < 100) | Clean code |
| **Deep tree** | Iteration + stack | No depth limit |
| **UI rendering** | Lazy loading | Best UX |
| **Private data** | Closure | True encapsulation |
| **Method binding** | Arrow function | Lexical this |
| **Constructor** | Regular function | Need this binding |

</details>

<details>
<summary><strong>💬 Explain to Junior: Execution Context Simplified</strong></summary>

**Simple Analogy: Restaurant Kitchen**

Think of JavaScript execution like a restaurant kitchen:

```javascript
// Global context = Main kitchen (always exists)
let restaurantName = "Joe's Diner";

// Function = Individual cooking station
function makeBurger(pattyType) {
  // Function context = Chef's workspace
  let bun = "sesame";
  let patty = pattyType;

  function addToppings() {
    // Nested function = Helper chef's area
    let toppings = "lettuce, tomato";
    console.log(`Making ${patty} burger with ${toppings}`);
  }

  addToppings();
  return "Burger ready!";
}

makeBurger("beef");
```

**What happens:**

1. **Global context** (main kitchen):
   - Always running
   - Has: restaurantName, makeBurger function
   - Like: Main kitchen that's always open

2. **makeBurger context** (cooking station):
   - Created when makeBurger is called
   - Has: pattyType parameter, bun, patty variables, addToppings function
   - Like: Chef goes to station, uses tools there
   - Destroyed: After function returns

3. **addToppings context** (helper area):
   - Created when addToppings is called
   - Has: toppings variable
   - Can see: patty, bun from parent (like looking at nearby station)
   - Destroyed: After it returns

**The Call Stack:**

```javascript
function first() {
  console.log("First");
  second();
  console.log("First again");
}

function second() {
  console.log("Second");
  third();
  console.log("Second again");
}

function third() {
  console.log("Third");
}

first();

/*
Stack evolution:

Start: [Global]

Call first(): [Global, first]
  Print "First"

Call second(): [Global, first, second]
  Print "Second"

Call third(): [Global, first, second, third]
  Print "Third"

Return third(): [Global, first, second]
  Print "Second again"

Return second(): [Global, first]
  Print "First again"

Return first(): [Global]

Output:
First
Second
Third
Second again
First again
*/
```

**Visual Example:**

```
Stack of plates = Call stack
Each plate = Execution context

┌────────────┐
│   third    │ ← Top (currently running)
├────────────┤
│   second   │
├────────────┤
│   first    │
├────────────┤
│   Global   │ ← Bottom (always there)
└────────────┘

When third() finishes:
- Remove top plate
- second() continues
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Thinking variables persist after function returns
function test() {
  let x = 10;
  console.log(x); // 10
}

test();
console.log(x); // ReferenceError: x is not defined
// x was destroyed when test() returned!


// ❌ MISTAKE 2: Not understanding closure
function outer() {
  let count = 0;

  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

const counter = outer();
counter(); // 1
counter(); // 2
// Why does count persist?
// Because inner() keeps outer's context alive (closure!)


// ❌ MISTAKE 3: Stack overflow from infinite recursion
function infinite() {
  infinite(); // Calls itself forever
}

infinite(); // RangeError: Maximum call stack size exceeded
// Each call adds context to stack → stack full → crash!
```

**Explaining to PM:**

"Execution context is like how your computer manages running programs.

**Without execution context:**
- All code runs in one big mess
- Variables from different functions collide
- Can't track what's running

**With execution context:**
- Each function gets its own workspace
- Variables are isolated
- Clear tracking: What's running? Where to return?

**Real-world example:**

When user clicks 'Buy Now':
1. Global context: Website is running
2. handleClick() context: Created, has event data
3. validateCart() context: Created, checks items
4. processPayment() context: Created, charges card
5. sendConfirmation() context: Created, emails user

Each step gets its own workspace, then cleans up.

**Business value:**
- Prevents bugs (isolated workspaces)
- Enables features (callbacks, promises, async)
- Manages memory (cleanup after functions)
- Powers entire web (without it, no modern JavaScript!)"

**Key Rules:**

1. **Global context**: Created once, exists forever
2. **Function context**: Created on call, destroyed on return
3. **Call stack**: Tracks active contexts (like stack of plates)
4. **Closures**: Inner functions keep parent context alive
5. **Stack limit**: ~10,000 calls → crash (avoid deep recursion!)

**Quick Visual:**

```javascript
// What contexts exist at each moment?

let global = 'exists always'; // Global context

function a() {
  let varA = 'a'; // a's context created
  b();            // b's context created
  // b's context destroyed after b() returns
} // a's context destroyed here

function b() {
  let varB = 'b'; // b's context
} // b's context destroyed here

a(); // Starts chain

/*
Timeline:
t0: [Global]
t1: [Global, a] - a called
t2: [Global, a, b] - b called
t3: [Global, a] - b returned
t4: [Global] - a returned
*/
```

</details>

### Follow-up Questions
1. "How does the execution context differ from scope?"
2. "What happens to the execution context after function returns?"
3. "How does `this` binding work in different execution contexts?"
4. "Can you explain the creation phase vs execution phase?"

### Resources
- [MDN: Execution Context](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [ECMA-262 Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts)
- [JavaScript.info: Execution Context](https://javascript.info/closure)

---

## Question 2: Explain the Creation and Execution Phases of Execution Context

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon

### Question
What happens during the creation phase and execution phase of an execution context? Explain with hoisting examples.

### Answer

JavaScript execution context goes through **two distinct phases**:

### **Phase 1: Creation Phase (Memory Allocation)**

During creation phase, JavaScript engine:

1. **Creates the Variable Object (VO) / Activation Object (AO)**
   - Scans for function declarations → creates properties, stores reference
   - Scans for variable declarations → creates properties, initializes as `undefined`
   - Sets up arguments object (for function contexts)

2. **Creates the Scope Chain**
   - Determines variable accessibility
   - Links outer environment references

3. **Determines `this` binding**
   - Sets value of `this` keyword

### **Phase 2: Execution Phase**

- Code executes line by line
- Variable assignments happen
- Function calls create new execution contexts

### Code Example

```javascript
// Let's trace execution context phases

console.log(x);        // undefined (not ReferenceError!)
console.log(greet);    // [Function: greet]
console.log(name);     // ReferenceError: Cannot access before initialization

var x = 10;
let name = "John";

function greet() {
  console.log("Hello");
}

/*
CREATION PHASE:
================
GlobalExecutionContext = {
  VariableEnvironment: {
    x: undefined,          // var hoisted, initialized as undefined
    greet: <function>      // function fully hoisted
  },
  LexicalEnvironment: {
    name: <uninitialized>  // let in Temporal Dead Zone (TDZ)
  },
  ThisBinding: window
}

EXECUTION PHASE:
================
Line 1: console.log(x)     → Reads x from VO → undefined
Line 2: console.log(greet) → Reads greet from VO → function reference
Line 3: console.log(name)  → name still in TDZ → ReferenceError

Line 5: x = 10             → Assignment happens, x updated to 10
Line 6: name = "John"      → Assignment happens, name gets value
Line 8-10: Already processed in creation phase
*/
```

**Detailed Function Context Example:**

```javascript
function multiply(a, b) {
  var result = a * b;

  function display() {
    console.log(result);
  }

  return display;
}

const showResult = multiply(5, 3);
showResult();

/*
WHEN multiply(5, 3) IS CALLED:
================================

CREATION PHASE:
multiplyExecutionContext = {
  VariableEnvironment: {
    arguments: { 0: 5, 1: 3, length: 2 },
    a: 5,
    b: 3,
    result: undefined,
    display: <function>
  },
  LexicalEnvironment: {
    // empty for this example
  },
  ThisBinding: window (or undefined in strict mode)
}

EXECUTION PHASE:
Line 2: result = a * b  → result assigned 15
Line 4-6: display already in memory
Line 8: return display  → Returns function reference (closure formed)
*/
```

### Hoisting Explained Through Phases

```javascript
// Example showing different hoisting behaviors

console.log(varVariable);    // undefined
console.log(letVariable);    // ReferenceError
console.log(constVariable);  // ReferenceError
console.log(funcDecl);       // [Function: funcDecl]
console.log(funcExpr);       // undefined
console.log(arrowFunc);      // ReferenceError

var varVariable = "var";
let letVariable = "let";
const constVariable = "const";

function funcDecl() {
  return "function declaration";
}

var funcExpr = function() {
  return "function expression";
};

const arrowFunc = () => "arrow function";

/*
CREATION PHASE BREAKDOWN:
==========================

var varVariable: undefined       ✅ Hoisted, initialized
let letVariable: <uninitialized> ⚠️ Hoisted, but in TDZ
const constVariable: <uninit>    ⚠️ Hoisted, but in TDZ

function funcDecl: <function>    ✅ Fully hoisted
var funcExpr: undefined          ⚠️ Only var hoisted, not function
const arrowFunc: <uninit>        ⚠️ In TDZ

TDZ = Temporal Dead Zone (from start of scope to initialization)
*/
```

### Common Mistakes

❌ **Wrong**: Thinking let/const are not hoisted
```javascript
// They ARE hoisted, but not initialized
let x = 1;
{
  console.log(x); // ReferenceError (not 1!)
  let x = 2;      // x is hoisted to block scope
}
```

✅ **Correct**: Understanding TDZ
```javascript
// let/const hoisted but in Temporal Dead Zone
let x = 1;
{
  // TDZ starts here for block-scoped x
  // console.log(x); // ReferenceError
  let x = 2; // TDZ ends, initialization happens
  console.log(x); // 2
}
```

❌ **Wrong**: Function expressions hoist like function declarations
```javascript
// This will error:
myFunc(); // TypeError: myFunc is not a function
var myFunc = function() {
  console.log("Hello");
};
// Only the var myFunc is hoisted (as undefined)
```

<details>
<summary><strong>🔍 Deep Dive: V8's Two-Phase Execution Model</strong></summary>

**How V8 Implements Creation and Execution Phases:**

```javascript
// V8 internal algorithm (simplified)

class V8ExecutionContext {
  constructor(codeBlock) {
    // === CREATION PHASE ===
    this.creationPhase(codeBlock);

    // === EXECUTION PHASE ===
    this.executionPhase(codeBlock);
  }

  creationPhase(code) {
    // Step 1: Create environment records
    this.variableEnvironment = new Map();
    this.lexicalEnvironment = new Map();

    // Step 2: Scan for declarations
    this.scanDeclarations(code);

    // Step 3: Set up scope chain
    this.setupScopeChain();

    // Step 4: Determine this binding
    this.determineThisBinding();
  }

  scanDeclarations(code) {
    // First pass: Collect function declarations
    for (const node of code.functionDeclarations) {
      this.variableEnvironment.set(node.name, node.functionObject);
      // ✅ Function fully hoisted!
    }

    // Second pass: Collect var declarations
    for (const node of code.varDeclarations) {
      if (!this.variableEnvironment.has(node.name)) {
        this.variableEnvironment.set(node.name, undefined);
        // ✅ Var hoisted as undefined
      }
    }

    // Third pass: Collect let/const declarations
    for (const node of code.letConstDeclarations) {
      this.lexicalEnvironment.set(node.name, '<uninitialized>');
      // ⚠️ Let/const in TDZ (Temporal Dead Zone)
    }
  }

  executionPhase(code) {
    // Execute code line by line
    for (const statement of code.statements) {
      this.execute(statement);
    }
  }

  execute(statement) {
    // Assignment, function calls, etc.
    // Variables get their actual values here
  }
}
```

**Example Traced Through V8:**

```javascript
console.log(x);        // What happens?
console.log(foo);      // What happens?
console.log(bar);      // What happens?
console.log(name);     // What happens?

var x = 10;
function foo() { return 'foo'; }
var bar = function() { return 'bar'; };
let name = 'Alice';

/*
CREATION PHASE (before any code executes):
==========================================

Step 1: Scan for function declarations
variableEnvironment: {
  foo: <function foo>  ✅ Complete function object
}

Step 2: Scan for var declarations
variableEnvironment: {
  foo: <function foo>,
  x: undefined,        ✅ Hoisted as undefined
  bar: undefined       ✅ Hoisted as undefined
}

Step 3: Scan for let/const
lexicalEnvironment: {
  name: <uninitialized> ⚠️ TDZ starts
}

EXECUTION PHASE (code runs line by line):
==========================================

Line 1: console.log(x)
→ Look up 'x' in variableEnvironment
→ Found: undefined
→ Output: undefined ✅

Line 2: console.log(foo)
→ Look up 'foo' in variableEnvironment
→ Found: <function foo>
→ Output: [Function: foo] ✅

Line 3: console.log(bar)
→ Look up 'bar' in variableEnvironment
→ Found: undefined
→ Output: undefined ✅ (function expression not hoisted!)

Line 4: console.log(name)
→ Look up 'name' in lexicalEnvironment
→ Found: <uninitialized> (still in TDZ!)
→ ReferenceError: Cannot access 'name' before initialization ❌

Line 6: x = 10
→ Update variableEnvironment.x to 10

Line 7: foo already created in creation phase (skip)

Line 8: bar = function() { ... }
→ Update variableEnvironment.bar to function object

Line 9: name = 'Alice'
→ TDZ ends! Update lexicalEnvironment.name to 'Alice'
*/
```

**Temporal Dead Zone (TDZ) Implementation:**

```javascript
// TDZ is enforced by V8's lexical environment

{
  // TDZ starts for 'x'
  console.log(typeof x); // ReferenceError! (not "undefined")

  // Still in TDZ
  let x = 10;
  // TDZ ends

  console.log(x); // 10 (safe now)
}

/*
V8's TDZ checks:

1. Variable declared with let/const
2. Access before initialization line
3. → Throw ReferenceError

Why TDZ exists:
- Catch bugs (accessing before declaration)
- Const semantics (must have value)
- Block scoping clarity
*/

// TDZ edge cases:

// Case 1: Function parameter default values
function test(a = b, b = 2) {
  console.log(a, b);
}

test(); // ReferenceError: Cannot access 'b' before initialization
// Why? Parameters evaluated left-to-right
// When evaluating 'a = b', 'b' is still in TDZ!

// Case 2: Nested scopes
let x = 1;
{
  console.log(x); // ReferenceError!
  let x = 2;
  // Inner 'x' shadows outer, but it's in TDZ
}

// Case 3: typeof operator
console.log(typeof undeclaredVar); // "undefined" (no error)
console.log(typeof declaredLet);   // ReferenceError!
let declaredLet;
// typeof doesn't bypass TDZ for let/const!
```

**Hoisting Performance Implications:**

```javascript
// Benchmark: var vs let hoisting impact

// Test 1: var (hoisted as undefined)
console.time('var-hoisting');
for (let i = 0; i < 1000000; i++) {
  var x = 10; // Hoisted to function scope
  x = x + 1;
}
console.timeEnd('var-hoisting'); // ~12ms

// Test 2: let (TDZ check required)
console.time('let-hoisting');
for (let i = 0; i < 1000000; i++) {
  let y = 10; // TDZ check before initialization
  y = y + 1;
}
console.timeEnd('let-hoisting'); // ~13ms

/*
Performance difference: ~8% slower for let
Reason: TDZ check adds minimal overhead
Trade-off: Slightly slower but safer (catches bugs)

In practice: Modern JS engines optimize this away
In hot code: Negligible difference after JIT compilation
*/
```

**Function Hoisting Internals:**

```javascript
// Why function declarations hoist completely

// V8 creates function objects during parsing:

function foo() {
  return 'foo';
}

/*
Creation phase:
1. V8 parser encounters function declaration
2. Creates function object immediately:
   {
     name: 'foo',
     code: compiled bytecode for function body,
     scope: reference to enclosing scope,
     prototype: {}
   }
3. Stores in variableEnvironment

Result: Function callable before declaration line!
*/

// Function expressions behave differently:

var bar = function() {
  return 'bar';
};

/*
Creation phase:
1. Only 'var bar' hoisted (as undefined)
2. Function object NOT created yet

Execution phase:
1. Reach line: bar = function() { ... }
2. Create function object now
3. Assign to bar

Result: bar is undefined until assignment line!
*/

// Named function expressions (tricky!):

var baz = function namedBaz() {
  console.log(typeof namedBaz); // "function"
  return 'baz';
};

console.log(typeof namedBaz); // "undefined"
console.log(typeof baz);      // "function"

/*
Why?
- 'namedBaz' only exists inside function scope
- 'baz' is the variable name in outer scope
- Useful for recursion and stack traces
*/
```

**VariableEnvironment vs LexicalEnvironment:**

```javascript
// They serve different purposes

function example() {
  var varVariable = 'var';     // Goes to VariableEnvironment
  let letVariable = 'let';     // Goes to LexicalEnvironment
  const constVariable = 'const'; // Goes to LexicalEnvironment

  function nested() {
    // Has access to both environments through scope chain
    console.log(varVariable, letVariable, constVariable);
  }

  nested();
}

/*
Why two environments?

VariableEnvironment:
- Stores var and function declarations
- Follows function scope rules
- Legacy compatibility (ES3/ES5 behavior)
- More permissive (hoisting, re-declaration)

LexicalEnvironment:
- Stores let, const, class declarations
- Follows block scope rules
- Modern JavaScript (ES6+)
- Stricter rules (TDZ, no re-declaration)

Both:
- Reference same outer scope
- Part of same execution context
- Separate for cleaner scope semantics
*/

// Practical difference:

if (true) {
  var functionScoped = 'visible outside'; // VariableEnvironment
  let blockScoped = 'not visible outside'; // LexicalEnvironment
}

console.log(functionScoped); // "visible outside"
console.log(blockScoped);    // ReferenceError!

/*
V8 implementation:
- VariableEnvironment promoted to function scope
- LexicalEnvironment destroyed after block
- Optimization: V8 may merge if no conflict
*/
```

**Memory Allocation During Phases:**

```javascript
// What happens in memory?

function demo() {
  var a = 1;
  let b = 2;
  const c = 3;

  function inner() {
    var d = 4;
    let e = 5;
  }

  inner();
}

demo();

/*
CREATION PHASE MEMORY:

Stack allocation for demo() context:
┌─────────────────────────────────┐
│ VariableEnvironment:            │
│   a: undefined (8 bytes)        │
│   inner: <function> (8 bytes)   │ ← Function object on heap
├─────────────────────────────────┤
│ LexicalEnvironment:             │
│   b: <uninitialized> (0 bytes)  │ ← Just marker
│   c: <uninitialized> (0 bytes)  │
└─────────────────────────────────┘

Heap allocation:
┌─────────────────────────────────┐
│ Function object for inner:      │
│   ~100-200 bytes                │
└─────────────────────────────────┘

EXECUTION PHASE MEMORY:

After line: var a = 1
┌─────────────────────────────────┐
│ a: 1 (8 bytes)                  │
└─────────────────────────────────┘

After line: let b = 2
┌─────────────────────────────────┐
│ b: 2 (8 bytes allocated now)    │
└─────────────────────────────────┘

When inner() called:
New stack frame created (same two-phase process)

When inner() returns:
Stack frame destroyed, memory freed

When demo() returns:
Entire context destroyed, all local memory freed
*/
```

**Strict Mode Effects on Creation Phase:**

```javascript
// Strict mode changes behavior

'use strict';

function strictExample() {
  // 1. this binding different
  console.log(this); // undefined (not window!)

  // 2. Duplicate parameters forbidden
  // function bad(a, a) {} // SyntaxError in strict mode

  // 3. with statement forbidden
  // with (obj) {} // SyntaxError

  // 4. Octal literals forbidden
  // var x = 010; // SyntaxError

  // 5. Assignment to undeclared variable
  // y = 10; // ReferenceError (implicit global forbidden)
}

/*
Creation phase differences in strict mode:

Non-strict:
- this = window/global
- Allows duplicate params
- Allows with statement
- Creates implicit globals

Strict:
- this = undefined (for functions)
- Rejects duplicate params
- Rejects with statement
- Throws on implicit globals
- Better performance (optimizations)
*/
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Hoisting Bug in React Component</strong></summary>

**Scenario:** Your React app crashes on load with "Cannot access 'API_URL' before initialization." The bug only appears in production build, not development. Investigation reveals a hoisting/TDZ issue with configuration constants.

**The Problem:**

```javascript
// ❌ BUG: Accessing const before declaration
import React from 'react';

function UserProfile() {
  // Try to fetch user data immediately
  const fetchUser = async () => {
    const response = await fetch(API_URL + '/user/profile');
    // ReferenceError: Cannot access 'API_URL' before initialization
    return response.json();
  };

  // API_URL declared here (TDZ!)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}

/*
Why it works in dev but fails in production:

Development:
- React Fast Refresh re-runs component
- fetchUser not called immediately
- By the time useEffect runs, API_URL initialized
- Bug hidden!

Production:
- Minification reorders code
- fetchUser might be called earlier
- API_URL in TDZ when fetchUser accesses it
- Crash!

Production impact:
- Crashes: 100% of users
- Error: "Cannot access 'API_URL' before initialization"
- Site completely broken
- Time to detect: 2 hours (after deploy to prod)
- Revenue lost: $15k (site down for 2 hours)
*/
```

**Debugging:**

```javascript
// Step 1: Reproduce in development
function UserProfile() {
  console.log('1. Component function starts');

  const fetchUser = async () => {
    console.log('2. fetchUser called');
    console.log('3. API_URL value:', API_URL); // Check if accessible
    const response = await fetch(API_URL + '/user/profile');
    return response.json();
  };

  console.log('4. Before API_URL declaration');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  console.log('5. After API_URL declaration:', API_URL);

  // If fetchUser is called before line 5, it crashes!
}

// Step 2: Check declaration order
// Use ESLint rule: no-use-before-define
// npm install --save-dev eslint-plugin-react

// .eslintrc.js
module.exports = {
  rules: {
    'no-use-before-define': ['error', { variables: true }]
  }
};

// ESLint would catch: fetchUser references API_URL before declaration!
```

**Solution 1: Move Declaration Before Usage:**

```javascript
// ✅ FIX: Declare constants at the top
import React from 'react';

// Move to module scope (outside component)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function UserProfile() {
  // Now API_URL is accessible
  const fetchUser = async () => {
    const response = await fetch(API_URL + '/user/profile');
    return response.json();
  };

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}

// Result: No TDZ issue, works in both dev and prod!
```

**Solution 2: Use Centralized Config:**

```javascript
// ✅ BETTER: Centralized configuration file

// config.js
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  apiTimeout: 5000,
  retryAttempts: 3
};

// UserProfile.js
import React from 'react';
import { config } from './config';

function UserProfile() {
  const fetchUser = async () => {
    const response = await fetch(`${config.apiUrl}/user/profile`);
    return response.json();
  };

  // ... rest of component
}

/*
Benefits:
- No hoisting issues (config imported at top)
- Single source of truth
- Easy to test (mock config)
- Type-safe with TypeScript
*/
```

**Solution 3: Use Environment Variables Properly:**

```javascript
// ✅ BEST: Create typed config with validation

// config.ts
interface Config {
  apiUrl: string;
  apiTimeout: number;
  environment: 'development' | 'production' | 'test';
}

function validateConfig(): Config {
  const apiUrl = process.env.REACT_APP_API_URL;

  if (!apiUrl) {
    throw new Error('REACT_APP_API_URL environment variable is required');
  }

  return {
    apiUrl,
    apiTimeout: parseInt(process.env.REACT_APP_TIMEOUT || '5000', 10),
    environment: (process.env.NODE_ENV as Config['environment']) || 'development'
  };
}

// Validate once at app startup (not in component)
export const config = validateConfig();

// UserProfile.tsx
import React from 'react';
import { config } from './config';

function UserProfile() {
  const fetchUser = async () => {
    const response = await fetch(`${config.apiUrl}/user/profile`, {
      timeout: config.apiTimeout
    });
    return response.json();
  };

  // ... rest of component
}

/*
Benefits:
- Config validated at startup (fail fast)
- TypeScript ensures type safety
- No TDZ issues (config created before components)
- Clear error messages if env vars missing
*/
```

**Real Production Example with Multiple Components:**

```javascript
// ❌ BAD: Each component declares its own config (duplication + TDZ risk)

// ComponentA.js
function ComponentA() {
  const API_URL = process.env.REACT_APP_API_URL; // Might be in TDZ
  // ...
}

// ComponentB.js
function ComponentB() {
  const API_URL = process.env.REACT_APP_API_URL; // Duplicate!
  // ...
}

// ComponentC.js
function ComponentC() {
  const fetchData = () => {
    fetch(API_URL); // ReferenceError if called before declaration
  };
  const API_URL = process.env.REACT_APP_API_URL;
}

// ✅ GOOD: Shared config module

// config/index.js
class AppConfig {
  constructor() {
    // Creation phase: Initialize all config
    this.apiUrl = this.getEnv('REACT_APP_API_URL', 'http://localhost:3000');
    this.apiKey = this.getEnv('REACT_APP_API_KEY');
    this.environment = process.env.NODE_ENV;

    // Validate required config
    this.validate();
  }

  getEnv(key, defaultValue = null) {
    const value = process.env[key];
    if (value === undefined && defaultValue === null) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue;
  }

  validate() {
    if (!this.apiUrl.startsWith('http')) {
      throw new Error('API_URL must start with http:// or https://');
    }
  }

  // Getter methods (lazy evaluation if needed)
  getApiUrl(endpoint) {
    return `${this.apiUrl}${endpoint}`;
  }
}

// Export singleton instance (created once)
export const config = new AppConfig();

// All components use shared instance:

// ComponentA.js
import { config } from './config';

function ComponentA() {
  const fetchUser = async () => {
    const response = await fetch(config.getApiUrl('/users'));
    return response.json();
  };
  // ...
}

// ComponentB.js
import { config } from './config';

function ComponentB() {
  const fetchPosts = async () => {
    const response = await fetch(config.getApiUrl('/posts'));
    return response.json();
  };
  // ...
}

/*
Benefits:
- No TDZ issues (config created once at import)
- No duplication
- Centralized validation
- Easy to mock in tests
- TypeScript support
*/
```

**Real Metrics After Fix:**

```javascript
// Before (TDZ bug):
// - Production crashes: 100% of users
// - Time to detect: 2 hours after deploy
// - Time to fix: 30 minutes
// - Total downtime: 2.5 hours
// - Revenue lost: $15k
// - User trust impact: -25%

// After (centralized config):
// - Production crashes: 0%
// - Config errors caught at build time
// - No runtime TDZ errors
// - TypeScript prevents typos
// - Developer productivity: +40% (no config hunting)
// - Test coverage: +30% (easy to mock config)
```

**Complex Example: Hoisting in Class Fields:**

```javascript
// Modern JavaScript: Class fields hoisting

class UserService {
  // ❌ BUG: Class field uses another field before declaration
  apiClient = this.createClient(this.baseUrl);
  baseUrl = 'https://api.example.com'; // Declared after usage!

  createClient(url) {
    console.log('Creating client with URL:', url);
    return { url };
  }
}

const service = new UserService();
console.log(service.apiClient);
// Output: Creating client with URL: undefined
// Bug: baseUrl is undefined when apiClient is initialized!

/*
Why?
- Class fields initialized in order of declaration
- apiClient initialized first
- this.baseUrl doesn't exist yet → undefined
- No TDZ error (class fields use this, not direct reference)
*/

// ✅ FIX 1: Reorder fields
class UserServiceFixed {
  baseUrl = 'https://api.example.com'; // Declare first
  apiClient = this.createClient(this.baseUrl); // Use after

  createClient(url) {
    return { url };
  }
}

// ✅ FIX 2: Use constructor
class UserServiceBetter {
  constructor() {
    // Execution phase: All assignments in order
    this.baseUrl = 'https://api.example.com';
    this.apiClient = this.createClient(this.baseUrl);
  }

  createClient(url) {
    return { url };
  }
}

// ✅ FIX 3: Lazy initialization
class UserServiceBest {
  baseUrl = 'https://api.example.com';

  // Getter: Created on first access
  get apiClient() {
    if (!this._apiClient) {
      this._apiClient = this.createClient(this.baseUrl);
    }
    return this._apiClient;
  }

  createClient(url) {
    return { url };
  }
}

const bestService = new UserServiceBest();
console.log(bestService.apiClient); // Created only when accessed
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Hoisting and Declaration Patterns</strong></summary>

**1. var vs let/const:**

```javascript
// Pattern 1: var (hoisted as undefined)
function testVar() {
  console.log(x); // undefined (no error)
  var x = 10;
  console.log(x); // 10
}

// Pattern 2: let/const (TDZ)
function testLet() {
  console.log(y); // ReferenceError!
  let y = 20;
  console.log(y);
}
```

| Aspect | var | let/const |
|--------|-----|-----------|
| **Hoisting** | ✅ Yes (as undefined) | ⚠️ Yes (but in TDZ) |
| **TDZ protection** | ❌ No | ✅ Yes (catches bugs) |
| **Scope** | Function scope | Block scope |
| **Re-declaration** | ✅ Allowed | ❌ Error |
| **Performance** | ✅ Slightly faster | ⚠️ Minimal overhead (TDZ check) |
| **Best for** | Legacy code | Modern code |

**2. Function Declaration vs Expression:**

```javascript
// Pattern 1: Function declaration (fully hoisted)
foo(); // Works!
function foo() {
  return 'foo';
}

// Pattern 2: Function expression (not hoisted)
bar(); // TypeError: bar is not a function
var bar = function() {
  return 'bar';
};
```

| Aspect | Function Declaration | Function Expression |
|--------|---------------------|-------------------|
| **Hoisting** | ✅ Complete function | ⚠️ Only var (undefined) |
| **Can call before declaration** | ✅ Yes | ❌ No |
| **Conditional declaration** | ⚠️ Problematic | ✅ Works well |
| **Anonymous** | ❌ Must have name | ✅ Can be anonymous |
| **Best for** | Utilities, helpers | Callbacks, conditionals |

**When to use each:**

```javascript
// ✅ Use function declarations for:
// 1. Utilities used throughout file
function formatDate(date) {
  return date.toISOString();
}

// 2. Helper functions (readability - define at bottom)
function main() {
  const formatted = formatDate(new Date());
  return formatted;
}

// ✅ Use function expressions for:
// 1. Conditional functions
const getUserType = isAdmin ?
  function() { return 'admin'; } :
  function() { return 'user'; };

// 2. Callbacks
button.addEventListener('click', function() {
  console.log('Clicked');
});

// 3. IIFE
(function() {
  const private = 'data';
})();
```

**3. Top-level Declaration vs Inline:**

```javascript
// Pattern 1: Top-level (hoisted to top of scope)
function component() {
  const CONFIG = { api: 'url' }; // Declared at top

  function fetchData() {
    return fetch(CONFIG.api);
  }

  return fetchData();
}

// Pattern 2: Inline (declared when needed)
function componentInline() {
  function fetchData() {
    const CONFIG = { api: 'url' }; // Declared inline
    return fetch(CONFIG.api);
  }

  return fetchData();
}
```

| Aspect | Top-level Declaration | Inline Declaration |
|--------|----------------------|-------------------|
| **Scope** | Entire function | Limited to block |
| **Reusability** | ✅ Multiple uses | ⚠️ Single use |
| **Memory** | ⚠️ Lives longer | ✅ Freed sooner |
| **Clarity** | ✅ Shows all vars upfront | ⚠️ Vars scattered |
| **Best for** | Shared constants | One-time values |

**4. Module-level vs Component-level Config:**

```javascript
// Pattern 1: Module-level (created once)
const API_URL = 'https://api.example.com';

function ComponentA() {
  fetch(API_URL); // Reuses same constant
}

function ComponentB() {
  fetch(API_URL); // Reuses same constant
}

// Pattern 2: Component-level (created each render)
function ComponentC() {
  const API_URL = 'https://api.example.com'; // New constant each render
  fetch(API_URL);
}
```

| Aspect | Module-level | Component-level |
|--------|-------------|----------------|
| **Creation** | Once (at import) | Every function call |
| **Memory** | ✅ Single instance | ❌ Multiple instances |
| **Sharing** | ✅ Across components | ❌ Isolated |
| **Testing** | ⚠️ Harder to mock | ✅ Easy to mock |
| **Best for** | True constants | Component-specific |

**5. Hoisting vs Explicit Initialization:**

```javascript
// Pattern 1: Rely on hoisting
function usingHoisting() {
  console.log(foo()); // Works due to hoisting

  function foo() {
    return 'foo';
  }
}

// Pattern 2: Explicit order
function explicitOrder() {
  function foo() {
    return 'foo';
  }

  console.log(foo()); // Clear order
}
```

| Aspect | Hoisting | Explicit Order |
|--------|----------|---------------|
| **Readability** | ⚠️ Less clear | ✅ Very clear |
| **Debugging** | ⚠️ Harder | ✅ Easier |
| **Performance** | ✅ Same | ✅ Same |
| **Best practice** | ⚠️ Avoid | ✅ Preferred |

**Decision Matrix:**

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **Constants** | Module-level const | Single instance |
| **Utilities** | Function declaration | Hoisted, reusable |
| **Callbacks** | Function expression | Clear scope |
| **Config** | Centralized module | No TDZ, shared |
| **Component state** | Component-level const | Isolated |
| **Conditional logic** | Function expression | Avoids hoisting issues |

**Anti-patterns to Avoid:**

```javascript
// ❌ BAD: Relying on hoisting for readability
function messyCode() {
  // Code that uses helpers
  doSomething();
  doSomethingElse();

  // Helpers defined at bottom (hard to find!)
  function doSomething() { }
  function doSomethingElse() { }
}

// ✅ GOOD: Define before use (or at top)
function cleanCode() {
  // Helpers at top (easy to find)
  function doSomething() { }
  function doSomethingElse() { }

  // Code that uses helpers
  doSomething();
  doSomethingElse();
}

// ❌ BAD: Duplicate declarations in multiple components
function ComponentA() {
  const API_URL = process.env.REACT_APP_API_URL;
}

function ComponentB() {
  const API_URL = process.env.REACT_APP_API_URL; // Duplicate!
}

// ✅ GOOD: Single source of truth
// config.js
export const API_URL = process.env.REACT_APP_API_URL;

// Components import shared constant
import { API_URL } from './config';
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Creation and Execution Phases Simplified</strong></summary>

**Simple Analogy: Setting Up a Workspace**

Think of execution phases like preparing for a school project:

**Creation Phase** = Getting your workspace ready:
```javascript
// JavaScript does this BEFORE running code:
// 1. "What functions do I need?" → Put them on desk
// 2. "What variables do I need?" → Label empty boxes
// 3. "Where can I find things?" → Map out where stuff is

function makeProject() {
  console.log(materials); // undefined (box is labeled but empty)
  console.log(helper);    // [Function] (helper is ready to use!)

  var materials = "paper, glue, scissors";

  function helper() {
    return "I help!";
  }
}
```

**Execution Phase** = Actually doing the work:
```javascript
// Now JavaScript runs code line by line:
// Line 1: Print materials → Check box → Empty (undefined)
// Line 2: Print helper → Check desk → Function is there!
// Line 4: Put "paper, glue, scissors" in materials box
// Line 6-8: helper function already on desk (skip)
```

**Visual Timeline:**

```
BEFORE CODE RUNS (Creation Phase):
==================================
Desk (VariableEnvironment):
📦 materials: [empty box]
📋 helper: [complete instruction sheet]

RUNNING CODE (Execution Phase):
================================
Line 1: Look in 'materials' box → Empty! → Print "undefined"
Line 2: Look at 'helper' sheet → Found! → Print "[Function]"
Line 4: Fill 'materials' box with actual stuff
Line 6: helper sheet already there (nothing to do)
```

**The TDZ (Temporal Dead Zone) Explained:**

```javascript
// TDZ = "Box exists but has alarm on it!"

{
  console.log(safeBox);      // undefined (old var - no alarm)
  console.log(alarmBox);     // ALARM! ReferenceError

  var safeBox = "accessible";
  let alarmBox = "protected";
}

/*
Why the alarm?
- var = Old-style box (empty but safe to check)
- let = New-style box (empty + alarm until filled)
- Alarm protects you from using empty box by mistake!
*/

// Real-world example:

function orderPizza() {
  // Can we eat pizza? Let's check!
  eatPizza(); // ❌ ReferenceError: Can't eat before it arrives!

  // Pizza arrives
  const eatPizza = () => {
    console.log("Eating pizza!");
  };

  eatPizza(); // ✅ Now we can eat!
}

// TDZ = Time between "order pizza" and "pizza arrives"
// Can't eat during TDZ!
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Thinking undefined means error
function test() {
  console.log(x); // undefined (not error!)
  var x = 10;
  console.log(x); // 10
}

// Why no error?
// Creation phase prepared 'x' box as empty
// Execution phase prints empty box → "undefined"


// ❌ MISTAKE 2: Expecting function expression to hoist
function test() {
  foo(); // ✅ Works! (function declaration)
  bar(); // ❌ Error! (function expression)

  function foo() {
    console.log("foo");
  }

  var bar = function() {
    console.log("bar");
  };
}

// Why different?
// foo: Complete function prepared in creation phase
// bar: Only variable prepared (as undefined)


// ❌ MISTAKE 3: Accessing let/const before declaration
function test() {
  console.log(name); // ReferenceError!
  let name = "Alice";
}

// Why error?
// let/const have TDZ protection
// JavaScript says: "Don't use before declaring!"
```

**Explaining to PM:**

"Creation and execution phases are like how you prepare for a meeting:

**Creation Phase** (Prep):
- Check agenda: What topics? (scan for functions/variables)
- Gather materials: Bring laptop, notes (allocate memory)
- Plan seating: Where is everyone? (scope chain)
- Know your role: Are you presenting? (this binding)

**Execution Phase** (Meeting):
- Follow agenda item by item (run code line by line)
- Use materials you brought (access variables)
- Update notes (assign values)
- Make decisions (if statements, loops)

**Business value:**
- Hoisting lets you organize code naturally
- TDZ catches bugs early (using before ready)
- Two phases = faster execution (prep once, run many times)
- Understanding this = write better, bug-free code

**Example:**

```javascript
// Bad (relies on hoisting, confusing):
function processOrder() {
  validatePayment();
  calculateTotal();

  function calculateTotal() { }
  function validatePayment() { }
}

// Good (explicit order, clear):
function processOrder() {
  function calculateTotal() { }
  function validatePayment() { }

  validatePayment();
  calculateTotal();
}
```"

**Key Rules:**

1. **Creation phase happens first** (before any code runs)
2. **var hoisted as undefined** (safe but can cause bugs)
3. **let/const in TDZ** (error if accessed early - safer!)
4. **Functions hoisted completely** (can use before declaration)
5. **Function expressions not hoisted** (treat like var)

**Quick Test:**

```javascript
// What will this output?

console.log(a);
console.log(b);
console.log(c);
console.log(foo());

var a = 1;
let b = 2;
const c = 3;
function foo() {
  return 'foo';
}

// Answers:
// console.log(a);     → undefined (var hoisted)
// console.log(b);     → ReferenceError (TDZ)
// console.log(c);     → ReferenceError (TDZ)
// console.log(foo()); → "foo" (function hoisted)
```

**Memory Aid:**

```
Creation Phase Checklist:
✅ Find all function declarations → Store complete function
✅ Find all var declarations → Store as undefined
✅ Find all let/const → Mark as "don't touch yet!" (TDZ)
✅ Set up scope chain → Link to parent
✅ Determine this → Based on how function called

Execution Phase Checklist:
✅ Run code top to bottom
✅ Assign actual values to variables
✅ Execute function calls
✅ Create new contexts for function calls
```

</details>

### Follow-up Questions
1. "What is the Temporal Dead Zone (TDZ)?"
2. "Why do function declarations hoist completely but function expressions don't?"
3. "What's the difference between VariableEnvironment and LexicalEnvironment?"
4. "How does strict mode affect the creation phase?"

### Resources
- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [Understanding Execution Context and Stack](https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0)

---

