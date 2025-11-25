# Scope & Closures

> **Focus**: Core JavaScript concepts

---

## Question 1: What are lexical scope and block scope?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Microsoft

### Question
Explain lexical scope and block scope in JavaScript. How do they differ?

### Answer

Lexical scope means that a function's scope is determined by where it is defined in the code, not where it is called. Block scope means variables are only accessible within the block (curly braces) they're defined in.

1. **Lexical Scope (Static Scope)**
   - Determined at write-time (when code is written)
   - Functions carry their scope with them
   - Inner functions can access outer function variables
   - Enables closures

2. **Block Scope**
   - Variables scoped to nearest enclosing block `{}`
   - Introduced with ES6 (`let`, `const`)
   - More predictable than function scope
   - Prevents variable leakage

3. **Function Scope** (for comparison)
   - Variables scoped to entire function
   - Only `var` is function-scoped
   - `let` and `const` are block-scoped

### Code Example

```javascript
// 1. LEXICAL SCOPE EXAMPLE
const globalVar = 'global';

function outer() {
  const outerVar = 'outer';

  function inner() {
    const innerVar = 'inner';

    // inner() can access:
    console.log(innerVar);  // 'inner' (own scope)
    console.log(outerVar);  // 'outer' (lexical parent)
    console.log(globalVar); // 'global' (lexical grandparent)
  }

  inner();
  // console.log(innerVar); // ReferenceError (not accessible here)
}

outer();

// 2. BLOCK SCOPE WITH LET/CONST
{
  let blockScoped = 'I am block scoped';
  const alsoBlockScoped = 'Me too';
  var functionScoped = 'I am function scoped';
}

console.log(functionScoped);  // 'I am function scoped' (accessible!)
// console.log(blockScoped);  // ReferenceError
// console.log(alsoBlockScoped); // ReferenceError

// 3. BLOCK SCOPE IN IF STATEMENTS
if (true) {
  let x = 10;
  const y = 20;
  var z = 30;
}

// console.log(x); // ReferenceError
// console.log(y); // ReferenceError
console.log(z);    // 30 (var leaks out!)

// 4. BLOCK SCOPE IN LOOPS
for (let i = 0; i < 3; i++) {
  // New i binding for each iteration
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

for (var j = 0; j < 3; j++) {
  // Same j shared across iterations
  setTimeout(() => console.log(j), 100);
}
// Output: 3, 3, 3

// 5. LEXICAL SCOPE IN CLOSURES
function createCounter(start) {
  let count = start; // Lexically scoped to createCounter

  return function() {
    count++; // Closure: accesses parent's lexical scope
    return count;
  };
}

const counter1 = createCounter(0);
const counter2 = createCounter(10);

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 11 (separate lexical scope)

// 6. NESTED BLOCKS
{
  let x = 1;

  {
    let x = 2; // Different variable (shadowing)
    console.log(x); // 2

    {
      let x = 3; // Another different variable
      console.log(x); // 3
    }

    console.log(x); // 2
  }

  console.log(x); // 1
}

// 7. SWITCH STATEMENTS (NO BLOCK SCOPE!)
switch (1) {
  case 1:
    let x = 'case 1';
    break;
  case 2:
    let x = 'case 2'; // SyntaxError: Identifier 'x' has already been declared
    break;
}

// Fix: Add blocks
switch (1) {
  case 1: {
    let x = 'case 1';
    break;
  }
  case 2: {
    let x = 'case 2'; // OK now
    break;
  }
}

// 8. LEXICAL SCOPE WITH ARROW FUNCTIONS
function Timer() {
  this.seconds = 0;

  setInterval(() => {
    this.seconds++; // Arrow function uses lexical 'this'
    console.log(this.seconds);
  }, 1000);
}

new Timer();

// 9. TRY-CATCH BLOCKS
try {
  let x = 1;
  throw new Error('test');
} catch (err) {
  let x = 2; // Different variable (block-scoped to catch)
  console.log(x); // 2
}

// console.log(x); // ReferenceError (neither x is accessible)
```

<details>
<summary><strong>🔍 Deep Dive: Scope Implementation in V8</strong></summary>

**Scope Chain Construction:**

When JavaScript code is parsed, V8 builds a scope chain at compile time (lexical scoping).

**Lexical Scope Chain Creation:**

```javascript
// Source code:
const global = 'G';

function outer() {
  const outerVar = 'O';

  function inner() {
    const innerVar = 'I';
    console.log(global, outerVar, innerVar);
  }

  inner();
}

// V8 creates scope chain at parse time:
GlobalScope → { global }
  ↓
FunctionScope(outer) → { outerVar, inner }
  ↓
FunctionScope(inner) → { innerVar }
```

**Context Objects (Runtime Representation):**

```
Heap Memory:

GlobalContext = {
  global: 'G',
  outer: <function>
}

OuterContext = {
  outerVar: 'O',
  inner: <function>,
  [[Scope]]: → GlobalContext  // Hidden property
}

InnerContext = {
  innerVar: 'I',
  [[Scope]]: → OuterContext
}

Variable lookup: Check own context → [[Scope]] → [[Scope]] → ... → null
```

**Block Scope Implementation:**

```javascript
// Source:
{
  let x = 10;
  const y = 20;
}

// V8 creates:
BlockContext = {
  x: 10,
  y: 20,
  [[Scope]]: → ParentContext
}

// After block exits, BlockContext becomes eligible for GC
// (unless captured by closure)
```

**Optimization: Scope Slot Allocation:**

V8 analyzes scope usage and optimizes storage:

```javascript
function example() {
  let a = 1;  // Stack slot (fast)
  let b = 2;  // Stack slot (fast)

  return function() {
    return a + b;  // a,b must be on heap (captured by closure)
  };
}

// Initial allocation: both a, b on stack
// Analysis detects: inner function needs a, b
// Re-allocation: move a, b to heap context
```

**Fast vs Slow Scopes:**

**Fast Scope (Stack):**
- Local variables not captured by closures
- Fastest access (~1-2 CPU cycles)
- Automatically freed when function returns

**Slow Scope (Heap Context):**
- Variables captured by closures
- Slightly slower access (~3-5 CPU cycles)
- Persists until all closures garbage collected

**Block Scope Cost:**

```javascript
// No cost if not used:
{
  let x = 10;
  console.log(x);
}
// x allocated on stack, freed immediately

// Cost if captured:
let closure;
{
  let x = 10;
  closure = () => x;  // x must live on heap
}
// BlockContext persists in memory
```

**Scope Lookup Optimization:**

V8 uses **scope slot caching** to speed up repeated lookups:

```javascript
function outer() {
  let count = 0;

  return function inner() {
    count++;  // First access: lookup + cache
    count++;  // Second access: cached slot
    return count;
  };
}

// Cached as: "count is in parent scope, slot 0"
// No re-lookup needed on subsequent accesses
```

**Why Block Scope is Cheap:**

Modern engines optimize block scopes aggressively:

```javascript
for (let i = 0; i < 1000000; i++) {
  let temp = i * 2;  // New block scope each iteration
  console.log(temp);
}

// V8 optimization:
// - Reuses same stack slot for 'temp' across iterations
// - No allocation/deallocation overhead
// - Same speed as var
```

**Benchmark (1 million operations):**

```
var (function scope):        ~1.2ms
let (block scope, no closure): ~1.2ms  (same!)
let (block scope, closure):  ~1.5ms  (heap allocation)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: React useState Scope Bug</strong></summary>

**Scenario:** You're building a todo app where deleting an item sometimes deletes the wrong one.

**The Bug:**

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Walk dog' },
    { id: 3, text: 'Code' }
  ]);

  // ❌ BUG: All delete handlers reference same 'i'
  return (
    <ul>
      {todos.map((todo, i) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => {
            // This captures 'i' from render scope
            // But i changes as React re-renders!
            const newTodos = [...todos];
            newTodos.splice(i, 1);
            setTodos(newTodos);
          }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

// What happens:
// 1. Initial render: buttons created with i = 0, 1, 2
// 2. Delete item 0 → re-render
// 3. New render: buttons created with i = 0, 1 (only 2 items left)
// 4. Old button handlers still reference old 'i' values!
// 5. Clicking button shows stale 'i' = 2 (but array only has 2 items!)
// 6. Deletes wrong item or causes error
```

**Why It Happens (Lexical Scope):**

```jsx
// Simplified visualization:
function TodoList() {
  // Render #1 Scope:
  const todos = [item1, item2, item3];

  // map creates closures:
  button1.onClick = () => splice(todos, 0);  // Captures i=0
  button2.onClick = () => splice(todos, 1);  // Captures i=1
  button3.onClick = () => splice(todos, 2);  // Captures i=2

  // Render #2 Scope (after deleting item 0):
  const todos = [item2, item3];  // New array!

  // New buttons:
  button1.onClick = () => splice(todos, 0);  // New closure, i=0
  button2.onClick = () => splice(todos, 1);  // New closure, i=1

  // But OLD button handlers still reference OLD todos array!
  // If old button somehow survives, it operates on stale data
}
```

**Actual Root Cause:**

The real issue is using array index instead of stable ID:

```jsx
// The problem:
{todos.map((todo, i) => (
  <li key={todo.id}>  {/* Key is ID, but... */}
    <button onClick={() => {
      newTodos.splice(i, 1);  // ...we use INDEX! */}
    }}>
      Delete
    </button>
  </li>
))}

// React reconciliation:
// 1. Item 0 deleted
// 2. React sees keys: [2, 3] (IDs)
// 3. React reuses button DOM nodes
// 4. But callbacks still reference old indices!
```

**Fix #1: Use ID Instead of Index**

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Buy milk' },
    { id: 2, text: 'Walk dog' },
    { id: 3, text: 'Code' }
  ]);

  // ✅ FIX: Use ID to find and delete
  const deleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

// Now each closure captures stable ID:
// button1.onClick = () => deleteTodo(1);
// button2.onClick = () => deleteTodo(2);
// button3.onClick = () => deleteTodo(3);
```

**Fix #2: Inline the Logic**

```jsx
function TodoList() {
  const [todos, setTodos] = useState([...]);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => {
            // ✅ Closure captures 'todo' object, not index
            setTodos(prev => prev.filter(t => t.id !== todo.id));
          }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Key Lessons:**

1. **Lexical scope captures variables, not values**
   - Closures reference the variable itself
   - If variable changes, closure sees new value (unless captured at definition time)

2. **Array indices are unstable**
   - Use stable IDs for identifying items
   - Index changes when items are added/removed

3. **React's reconciliation affects closures**
   - DOM nodes may be reused with old event handlers
   - Always use stable identifiers (keys and IDs)

4. **Block scope helps in loops**
   ```jsx
   // ✅ Each iteration creates new block scope
   {todos.map((todo, i) => {
     const index = i;  // Block-scoped, captured by closure
     // Each closure has its own 'index'
   })}
   ```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Scope Strategies</strong></summary>

### Function Scope (var)

```javascript
function example() {
  var x = 1;

  if (true) {
    var x = 2;  // Same variable!
  }

  console.log(x);  // 2
}
```

**Pros:**
- ✅ Simpler mental model (fewer scopes)
- ✅ Compatible with old browsers
- ✅ Slightly faster (fewer scope checks)

**Cons:**
- ❌ Variables "leak" out of blocks
- ❌ Harder to reason about
- ❌ More naming conflicts
- ❌ Classic closure bugs in loops

---

### Block Scope (let/const)

```javascript
function example() {
  let x = 1;

  if (true) {
    let x = 2;  // Different variable
  }

  console.log(x);  // 1
}
```

**Pros:**
- ✅ Predictable behavior
- ✅ Avoids variable leakage
- ✅ Safer (TDZ catches errors)
- ✅ Better for loops

**Cons:**
- ❌ More scopes to track
- ❌ TDZ learning curve
- ❌ Slightly slower (scope checks + TDZ)

---

### Global Scope

```javascript
// Global scope
var globalVar = 'global';
window.globalProp = 'also global';

function useGlobal() {
  console.log(globalVar);  // Accessible
}
```

**Pros:**
- ✅ Easy access from anywhere
- ✅ Simple for small scripts
- ✅ No passing parameters

**Cons:**
- ❌ Namespace pollution
- ❌ Hard to test (global dependencies)
- ❌ Security risks (window manipulation)
- ❌ Name collisions
- ❌ Memory leaks (never freed)

**When to use:** Never in production apps, only in tiny scripts

---

### Module Scope (ES6 Modules)

```javascript
// module.js
const privateVar = 'private';  // Not global!

export const publicVar = 'public';

export function helper() {
  return privateVar;  // Can access private
}
```

**Pros:**
- ✅ True privacy (not on window)
- ✅ Explicit exports
- ✅ Tree-shaking friendly
- ✅ No global pollution

**Cons:**
- ❌ Requires build tools (historically)
- ❌ More boilerplate
- ❌ Import/export syntax

**When to use:** Always in modern apps

---

### Closure Scope (Private Variables)

```javascript
function createCounter() {
  let count = 0;  // Private

  return {
    increment() { return ++count; },
    getCount() { return count; }
  };
}
```

**Pros:**
- ✅ True data privacy
- ✅ Encapsulation
- ✅ No global pollution
- ✅ Multiple instances

**Cons:**
- ❌ Memory overhead (context objects)
- ❌ Can't access from outside (by design)
- ❌ Slightly slower method calls
- ❌ Debugging harder (private vars)

**When to use:** Factory functions, module pattern, data hiding

---

### Performance Comparison

**Benchmark (1 million accesses):**

```
Global variable:          ~0.8ms  (fastest)
Function scope (var):     ~1.0ms
Block scope (let):        ~1.2ms
Closure variable:         ~1.5ms  (context object lookup)
Module scope:             ~1.0ms  (optimized like function scope)
```

**Memory Usage:**

```
Global scope:      0 overhead (always in memory)
Function scope:    ~40 bytes per context
Block scope:       ~40 bytes per block (if closures)
Closure:          ~100 bytes per closure
Module:            ~60 bytes per module
```

**Real-world impact:** Negligible unless creating millions of closures

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Junior:** "I'm confused about scope. Why does this work?"

```javascript
function outer() {
  let name = 'Alice';

  function inner() {
    console.log(name);  // Works! Why?
  }

  inner();
}

outer();  // Prints "Alice"
```

**Senior:** "Great question! This is **lexical scope** - one of JavaScript's most important concepts. Think of it like boxes within boxes."

**Visual Analogy:**

```
┌─ Global Box ────────────────────┐
│                                  │
│  ┌─ outer() Box ───────────┐   │
│  │                          │   │
│  │  let name = 'Alice'      │   │
│  │                          │   │
│  │  ┌─ inner() Box ──────┐ │   │
│  │  │                     │ │   │
│  │  │  console.log(name)  │ │   │
│  │  │  ↑ Looks for 'name' │ │   │
│  │  │  ↑ Not in my box... │ │   │
│  │  │  ↑ Check parent box → │   │
│  │  │    Found it! ✅      │ │   │
│  │  └─────────────────────┘ │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

**Junior:** "So inner() can 'see' into outer()'s box?"

**Senior:** "Exactly! In JavaScript, inner functions can access variables from their parent functions. This is called **lexical scoping** because it's based on WHERE the function is written in your code, not where it's called."

**Junior:** "What about block scope? I keep hearing about that."

**Senior:** "Block scope is similar, but for curly braces `{}`. Let me show you the difference between `var` and `let`:"

```javascript
// var (function scope):
function example1() {
  if (true) {
    var x = 10;  // Function-scoped
  }
  console.log(x);  // 10 ✅ (accessible!)
}

// let (block scope):
function example2() {
  if (true) {
    let y = 10;  // Block-scoped
  }
  console.log(y);  // ❌ ReferenceError!
}
```

**Junior:** "So `let` is more strict?"

**Senior:** "Exactly! `let` and `const` are block-scoped - they only exist inside the nearest `{}`. Think of blocks like mini-boxes:"

```
function example() {
  ┌─ if block ──────┐
  │  let x = 10     │  ← x only lives here
  └─────────────────┘

  console.log(x);  // ❌ x is gone!
}
```

**Junior:** "Which one should I use?"

**Senior:** "Always use `let` or `const`, never `var`. Block scope is more predictable. Here's why:"

**The Classic Loop Bug:**

```javascript
// ❌ var problem:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 (all see the same i!)

// ✅ let solution:
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2 (each iteration gets its own i!)
```

**Junior:** "Whoa, why does that happen?"

**Senior:** "Because `var` is function-scoped, there's only ONE `i` variable shared by all three setTimeout callbacks. With `let`, each iteration of the loop creates a NEW `i` variable in its own block scope."

**Visual:**

```
// var (one i):
function {
  var i;  ← All callbacks share this

  for (i = 0; i < 3; i++) {
    setTimeout(() => console.log(i));
  }
  // After loop: i = 3
  // All callbacks print 3
}

// let (three i's):
function {
  ┌ iteration 0: let i = 0 ┐ ← callback 1 sees this
  ┌ iteration 1: let i = 1 ┐ ← callback 2 sees this
  ┌ iteration 2: let i = 2 ┐ ← callback 3 sees this
}
```

**Junior:** "Got it! So the rule is: use `let`/`const` for block scope, and inner functions can see parent scope?"

**Senior:** "Perfect! And remember: it's called **lexical** scope because it's determined by the structure of your code (where you write it), not by how your code runs (where you call it). That's what makes it predictable!"

</details>

### Common Mistakes

- ❌ **Mistake:** Expecting var to be block-scoped
  ```javascript
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 (var is NOT block-scoped!)
  ```

- ❌ **Mistake:** Confusing lexical scope with dynamic scope
  ```javascript
  const x = 'global';

  function func() {
    console.log(x); // Always 'global' (lexical)
    // NOT affected by where func is called
  }

  function test() {
    const x = 'local';
    func(); // Still logs 'global'
  }
  ```

- ✅ **Correct:** Use let/const for block scope
  ```javascript
  if (true) {
    let x = 10;    // Block-scoped
    const y = 20;  // Block-scoped
  }
  // x and y are not accessible here
  ```

### Follow-up Questions

- "What is the difference between lexical and dynamic scope?"
- "How does lexical scope enable closures?"
- "Why is block scope better than function scope?"
- "What is variable shadowing?"
- "How does 'this' relate to lexical scope?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Lexical vs Dynamic Scope:**
- **Lexical (JavaScript):** Variable lookup determined by WHERE code is WRITTEN (static analysis)
- **Dynamic (Bash, old Lisp):** Variable lookup determined by WHERE code is CALLED (runtime call stack)

**V8 Implementation:**
- Block scope: Creates Environment Record (hash table) for `let`/`const`
- Function scope: Creates Activation Record for `var`
- TDZ (Temporal Dead Zone): `let`/`const` exist but uninitialized until declaration line
- Performance: Block-scoped variables use stack allocation (~2ns), function-scoped use heap (~50ns)

**How Lexical Scope Enables Closures:**
Inner functions capture reference to outer Lexical Environment (not values). V8 marks outer variables as "captured" → stored on heap instead of stack (survives function return).

**`this` Is NOT Lexically Scoped:**
`this` is dynamically bound (depends on call site), unlike lexical variables. Arrow functions break this rule by capturing outer `this` lexically.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Loop bug - all event handlers logged same value (10).

**Bug:**
```javascript
for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i);  // Always logs 10 ❌
  }, 100);
}
```

**Why:** `var` is function-scoped. All 10 closures share same `i` variable (not 10 separate copies).

**Impact:**
- Carousel showed wrong slide (all buttons clicked → last slide)
- User complaints: 80+ in 3 days
- Debug time: 6 hours

**Fix - Block Scope:**
```javascript
for (let i = 0; i < 10; i++) {  // ✅ Block-scoped
  setTimeout(() => {
    console.log(i);  // Logs 0, 1, 2... (separate `i` per iteration)
  }, 100);
}
```

**Metrics:**
- Carousel navigation: 100% accurate
- ESLint rule added: `no-var` (errors on `var` usage)
- Bugs after migration: 0

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Feature | Block Scope (`let`/`const`) | Function Scope (`var`) | Winner |
|---------|---------------------------|----------------------|--------|
| **Predictability** | Variables live in nearest `{}` block | Variables hoisted to function top | ✅ Block |
| **TDZ Safety** | ReferenceError if accessed before declaration | `undefined` (silently) | ✅ Block |
| **Loop Behavior** | New binding per iteration | Shared binding across iterations | ✅ Block |
| **Memory** | Released after block ends | Released after function ends | ✅ Block |
| **Performance** | ~2ns (stack allocation) | ~50ns (heap allocation) | ✅ Block |
| **Legacy Support** | ES6+ only | All browsers | var |

**When to use `var`:** NEVER in modern code. Only if supporting IE10 or older (without transpilation).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Lexical Scope Like Addresses:**

Imagine you're writing a letter. Lexical scope means the address (variable location) is determined by WHERE you write the letter (code position), not WHERE you mail it (runtime).

```javascript
// House 1 (Global scope)
const street = "Main St";

function house2() {
  // House 2 (Function scope)
  const number = 123;

  {
    // Apartment 2A (Block scope)
    const room = "Bedroom";

    console.log(street, number, room);  // ✅ Can see all levels
  }

  console.log(room);  // ❌ Can't see inside apartment!
}
```

**Block Scope Like Apartment Walls:**
```javascript
{
  let secret = "password123";  // Inside apartment
}
console.log(secret);  // ❌ Wall blocks access!

var public = "hello";  // In shared hallway (function scope)
// Everyone in the function can see it
```

**Real Example:**
```javascript
if (true) {
  var leaky = "I escape!";    // Function-scoped (escapes block)
  let contained = "Trapped";  // Block-scoped (stays in block)
}
console.log(leaky);      // "I escape!" ✅
console.log(contained);  // ❌ ReferenceError
```

**Rule:** Always use `let`/`const` (block scope) instead of `var` (function scope) for safer, more predictable code.

</details>

### Resources

- [MDN: Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [JavaScript.info: Variable Scope](https://javascript.info/closure)
- [Understanding Scope in JavaScript](https://www.freecodecamp.org/news/javascript-lexical-scope-tutorial/)

---

## Question 2: What is variable shadowing and illegal shadowing?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta

### Question
Explain variable shadowing and illegal shadowing in JavaScript. When does shadowing cause errors?

### Answer

**Variable shadowing** occurs when a variable declared in an inner scope has the same name as a variable in an outer scope, effectively "hiding" the outer variable.

**Illegal shadowing** happens when you try to shadow a `let` or `const` variable with a `var` declaration in the same scope, which is not allowed.

1. **Legal Shadowing**
   - let/const can shadow let/const
   - let/const can shadow var
   - var can shadow var in different function scopes

2. **Illegal Shadowing**
   - var cannot shadow let/const in the same scope
   - Results in SyntaxError

3. **Why It Matters**
   - Prevents accidental global pollution
   - Helps catch scoping errors
   - Maintains block scope integrity

### Code Example

```javascript
// 1. LEGAL SHADOWING - let shadows let
let x = 10;

{
  let x = 20; // Different variable (shadowing)
  console.log(x); // 20
}

console.log(x); // 10 (outer x unchanged)

// 2. LEGAL SHADOWING - let shadows var
var y = 10;

{
  let y = 20; // Legal shadowing
  console.log(y); // 20
}

console.log(y); // 10

// 3. LEGAL SHADOWING - var shadows var (function scope)
var z = 10;

function test() {
  var z = 20; // Legal (different function scope)
  console.log(z); // 20
}

test();
console.log(z); // 10

// 4. ILLEGAL SHADOWING - var shadows let/const
let a = 10;

{
  var a = 20; // SyntaxError: Identifier 'a' has already been declared
}

// 5. ILLEGAL SHADOWING - var shadows const
const b = 10;

{
  var b = 20; // SyntaxError: Identifier 'b' has already been declared
}

// 6. WHY ILLEGAL SHADOWING EXISTS
// let/const are block-scoped
// var is function-scoped
// var would "leak" into outer scope, conflicting with let/const

{
  let c = 10; // Block-scoped to this block
  {
    var c = 20; // Would leak to outer block! Not allowed
  }
}

// 7. NESTED FUNCTION SHADOWING (LEGAL)
let outer = 'outer';

function first() {
  let outer = 'first'; // Shadows global

  function second() {
    let outer = 'second'; // Shadows first()
    console.log(outer); // 'second'
  }

  second();
  console.log(outer); // 'first'
}

first();
console.log(outer); // 'outer'

// 8. PARAMETER SHADOWING
let value = 100;

function compute(value) { // Parameter shadows outer value
  console.log(value); // Uses parameter, not outer variable
}

compute(50); // 50
console.log(value); // 100 (unchanged)
```

### Common Mistakes

- ❌ **Mistake:** Trying to use var in block with let/const
  ```javascript
  let x = 1;
  {
    var x = 2; // SyntaxError!
  }
  ```

- ❌ **Mistake:** Unintentional shadowing causing confusion
  ```javascript
  let count = 0;

  function processItems(items) {
    let count = items.length; // Shadows outer count
    // Now can't access outer count
  }
  ```

- ✅ **Correct:** Use different variable names when shadowing is not needed
  ```javascript
  let globalCount = 0;

  function processItems(items) {
    let itemCount = items.length; // Clear distinction
    globalCount += itemCount;
  }
  ```

<details>
<summary><strong>🔍 Deep Dive: Why Illegal Shadowing Exists</strong></summary>

**The Problem var Shadowing Creates:**

```javascript
// Why this is illegal:
let x = 10;
{
  var x = 20;  // SyntaxError!
}

// What WOULD happen if allowed:
let x = 10;  // Lexical Environment: x = 10
{
  var x = 20;  // Variable Environment: x = 20
  // Now we have TWO different 'x' variables!
  // Which one does console.log(x) access?
}

// The scoping conflict:
// - let x is block-scoped (exists only in block)
// - var x is function-scoped (would leak into outer scope)
// - Both would try to occupy the same scope → conflict!
```

**Why let/const Shadowing Works:**

```javascript
// This IS allowed:
let x = 10;
{
  let x = 20;  // Different scope, no conflict
  console.log(x);  // 20
}
console.log(x);  // 10

// Two separate bindings:
OuterLexicalEnvironment: { x: 10 }
BlockLexicalEnvironment: { x: 20, outer: OuterLE }
```

**The Technical Reason:**

JavaScript has two environment types:
1. **Variable Environment** - for `var` and `function` (function-scoped)
2. **Lexical Environment** - for `let`, `const`, `class` (block-scoped)

```javascript
function example() {
  let a = 1;    // Lexical Environment
  const b = 2;  // Lexical Environment
  var c = 3;    // Variable Environment

  {
    let a = 10;    // New Lexical Environment ✅
    const b = 20;  // New Lexical Environment ✅
    var c = 30;    // SAME Variable Environment! ❌ Conflict!
  }
}

// Scope structure:
FunctionScope {
  VariableEnvironment: { c: 3 (or 30?) }  ← Conflict!
  LexicalEnvironment: { a: 1, b: 2 }
    BlockLexicalEnvironment: { a: 10, b: 20 }
}
```

**Why var Can't Shadow let/const:**

```javascript
// Illegal:
let x = 1;
{
  var x = 2;  // var is function-scoped
  // Would try to create binding in function's VariableEnvironment
  // But 'x' already exists in LexicalEnvironment!
  // → Naming conflict → SyntaxError
}

// Legal:
var x = 1;
{
  let x = 2;  // let is block-scoped
  // Creates NEW binding in block's LexicalEnvironment
  // Doesn't conflict with var in VariableEnvironment
}
```

**V8 Implementation:**

```
// When parsing "var x":
1. Check if 'x' exists in current function's VariableEnvironment
   - If yes, reassign (redeclaration allowed)
   - If no, create new binding

2. Check if 'x' exists in any parent LexicalEnvironment
   - If yes in SAME scope → SyntaxError: Identifier already declared
   - If yes in PARENT scope → OK (shadowing)

// When parsing "let x":
1. Check if 'x' exists in current block's LexicalEnvironment
   - If yes → SyntaxError: Identifier already declared
   - If no, create new binding

2. Check if 'x' exists in VariableEnvironment
   - If yes → SyntaxError: Identifier already declared
   - If no → OK
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Webpack Module Shadowing Bug</strong></summary>

**Scenario:** You're upgrading a legacy codebase to use ES6 modules, and suddenly `var` declarations start throwing errors.

**The Bug:**

```javascript
// legacy-code.js (old code with var):
var API_KEY = 'legacy-key-123';

function init() {
  var API_KEY = 'init-key-456';  // Shadowing with var (works)
  console.log(API_KEY);  // 'init-key-456'
}

// Refactored to use let:
let API_KEY = 'legacy-key-123';

function init() {
  var API_KEY = 'init-key-456';  // SyntaxError! ❌
  console.log(API_KEY);
}
```

**Why It Breaks:**

```javascript
// With var (legal):
var API_KEY = 'outer';  // Function/global scoped

function init() {
  var API_KEY = 'inner';  // New function scope ✅
}

// With let (illegal):
let API_KEY = 'outer';  // Block scoped

function init() {
  var API_KEY = 'inner';  // Tries to shadow let with var ❌
  // var is function-scoped, would leak into outer scope
  // Conflicts with let API_KEY
}
```

**Real Production Bug:**

```javascript
// utils.js - Shared module
let cache = {};  // Module-level cache

export function getData(key) {
  if (cache[key]) {
    return cache[key];
  }

  // ❌ BUG: Trying to shadow module-level 'cache'
  var cache = fetchFromAPI(key);  // SyntaxError!
  return cache;
}

// Developer thought: "I'm in a function, var should work!"
// Reality: Module scope uses let/const, var shadowing fails
```

**Fix #1: Use Different Name**

```javascript
let cache = {};

export function getData(key) {
  if (cache[key]) {
    return cache[key];
  }

  // ✅ FIX: Different variable name
  var result = fetchFromAPI(key);
  cache[key] = result;
  return result;
}
```

**Fix #2: Use let for Shadowing**

```javascript
let cache = {};

export function getData(key) {
  if (cache[key]) {
    return cache[key];
  }

  // ✅ FIX: Use let instead of var
  let cache = fetchFromAPI(key);  // Legal shadowing
  return cache;
}
```

**Key Lessons:**
1. **Illegal shadowing catches refactoring bugs**
   - Moving from `var` to `let` exposes hidden conflicts
   - Forces you to use clear variable names

2. **Modules use strict scoping**
   - Module-level variables are `let`/`const` by default
   - `var` in modules can cause unexpected conflicts

3. **var is function-scoped, not block-scoped**
   - `var` in a function tries to shadow outer scope
   - Conflicts with `let`/`const` in the same scope hierarchy

</details>

<details>
<summary><strong>⚖️ Trade-offs: Shadowing Strategies</strong></summary>

### Intentional Shadowing

```javascript
const config = { timeout: 1000 };

function processWithTimeout(data) {
  const config = { timeout: 500 };  // Shadow global
  // Use local config without affecting global
}
```

**Pros:**
- ✅ Reuse familiar names
- ✅ Localize changes
- ✅ Clear intent (this is MY config)

**Cons:**
- ❌ Can confuse readers
- ❌ Harder to access outer variable if needed
- ❌ Potential bugs if shadowing unintentional

---

### Avoid Shadowing (Unique Names)

```javascript
const globalConfig = { timeout: 1000 };

function processWithTimeout(data) {
  const localConfig = { timeout: 500 };
  // Clear distinction
}
```

**Pros:**
- ✅ No ambiguity
- ✅ Can access both variables
- ✅ Easier to debug
- ✅ Self-documenting

**Cons:**
- ❌ More verbose naming
- ❌ Namespace pollution
- ❌ Harder to refactor

---

### ESLint Rules

**no-shadow (Prevent All Shadowing):**
```javascript
// ESLint error:
let x = 1;
function test() {
  let x = 2;  // Error: 'x' is already declared
}
```

**Pros:**
- ✅ Catches accidental shadowing
- ✅ Forces unique names
- ✅ Prevents confusion

**Cons:**
- ❌ Sometimes shadowing is intentional
- ❌ Can be too strict for large codebases

**no-shadow-restricted-names (Prevent Builtins):**
```javascript
// ESLint error:
function test() {
  let undefined = 5;  // Error: Shadowing built-in
  let Math = {};     // Error: Shadowing built-in
}
```

**Recommendation:** Use `no-shadow-restricted-names` always, `no-shadow` for strict projects

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Junior:** "Why does this code work but this other one doesn't?"

```javascript
// Works:
let x = 1;
{
  let x = 2;  // ✅ OK
}

// Doesn't work:
let x = 1;
{
  var x = 2;  // ❌ SyntaxError!
}
```

**Senior:** "Great question! This is called **illegal shadowing**. Let me explain with a simple analogy."

**Think of it like labels on boxes:**

```
Kitchen (outer scope):
┌─────────────────┐
│ x = cookies 🍪  │  ← let x (block-scoped label)
│                 │
│  ┌─ Pantry ───┐ │
│  │ x = chips 🥨│ │  ← let x (new label, different box) ✅
│  └────────────┘ │
└─────────────────┘

// Each box can have its own "x" label
// They don't conflict because they're in different boxes
```

**But with var, it's different:**

```
Kitchen (outer scope):
┌─────────────────┐
│ x = cookies 🍪  │  ← let x (block-scoped)
│                 │
│  ┌─ Pantry ───┐ │
│  │ x = chips?  │ │  ← var x tries to REPLACE kitchen label! ❌
│  └────────────┘ │
└─────────────────┘

// var is function-scoped, not block-scoped
// It tries to modify the KITCHEN's x, not create a new one
// But there's already a let x in the kitchen → conflict!
```

**Junior:** "Oh! So `var` leaks out of the pantry into the kitchen?"

**Senior:** "Exactly! `var` doesn't respect block boundaries (the `{}`), it only respects function boundaries. So when you write `var x` inside a block, it tries to create/modify a variable in the outer function scope, which conflicts with the `let x` that's already there."

**Junior:** "Why does `let` shadowing `var` work then?"

```javascript
var x = 1;
{
  let x = 2;  // This works!
}
```

**Senior:** "Because `let` creates a brand new label in its OWN box (the block). It doesn't try to modify anything outside. Look:"

```
Kitchen:
┌─────────────────┐
│ var x = cookies │  ← Kitchen-wide variable
│                 │
│  ┌─ Pantry ───┐ │
│  │ let x = chips │  ← Pantry's OWN variable ✅
│  │ (different box)│
│  └────────────┘ │
└─────────────────┘

// The pantry's "let x" is like a sticky note
// It's only visible inside the pantry
// Doesn't touch the kitchen's "var x"
```

**Junior:** "So the rule is: `var` can't shadow `let`/`const`, but `let`/`const` can shadow anything?"

**Senior:** "Perfect! And in modern JavaScript, we just don't use `var` anymore, so this is rarely a problem. But if you're maintaining old code and adding `let`, you might see this error."

**Junior:** "Got it! Use `let`/`const`, avoid `var`, and if I need to reuse a variable name, make sure both are `let`/`const`."

**Senior:** "Exactly! And personally, I prefer using different names anyway - it makes the code clearer:"

```javascript
// Clear:
let globalCounter = 0;
function example() {
  let localCounter = 0;  // Obviously different
}

// Confusing:
let counter = 0;
function example() {
  let counter = 0;  // Wait, which counter?
}
```

</details>

### Follow-up Questions

- "Why is var shadowing let/const illegal?"
- "How does shadowing relate to closures?"
- "What happens with shadowing in nested functions?"
- "Can function parameters shadow outer variables?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Why `var` Can't Shadow `let`/`const` (Illegal Shadowing):**
V8 creates Environment Records for blocks. `let`/`const` bind to Environment Record (block scope). `var` binds to Variable Object (function scope). If `var` tried to shadow `let`/`const`, it would create TWO bindings with same name in overlapping scopes → ambiguity. ECMAScript spec forbids this.

**Technical Example:**
```javascript
{
  let x = 1;   // Environment Record: { x: 1 }
  var x = 2;   // Tries to add to Variable Object (function scope)
               // Conflict! SyntaxError
}
```

**Shadowing in Closures:**
Each closure captures its own shadowing variable's Lexical Environment. Inner closure "sees" inner variable, outer sees outer variable.

**Function Parameters Shadowing:**
Parameters are treated as local variables. They CAN shadow outer variables (legal shadowing).

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Accidental shadowing caused payment processing bug.

**Bug:**
```javascript
const TAX_RATE = 0.08;  // Company-wide constant

function calculateTotal(items) {
  let total = 0;

  items.forEach(item => {
    const TAX_RATE = 0.1;  // ❌ Developer accidentally shadowed!
    total += item.price * (1 + TAX_RATE);
  });

  return total;
}
```

**Impact:**
- Wrong tax calculated (10% instead of 8%)
- Overcharging: $15k+ over 1 week
- Customer refunds: 200+ requests
- Detection time: 5 days (customer complaint triggered investigation)

**Fix - ESLint Rule:**
```javascript
// .eslintrc.js
rules: {
  'no-shadow': ['error', { builtinGlobals: true }]
}

// Now shadowing TAX_RATE throws linting error
```

**Alternative Fix - Rename:**
```javascript
items.forEach(item => {
  const SPECIAL_TAX = 0.1;  // ✅ Different name
  total += item.price * (1 + (item.special ? SPECIAL_TAX : TAX_RATE));
});
```

**Metrics After Fix:**
- Tax calculation accuracy: 100%
- Shadow-related bugs: 0
- Linter catches: 15 potential shadowing issues (prevented bugs)

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Shadowing Type | Legal? | Risk | Use Case | Winner |
|---------------|--------|------|----------|--------|
| **`let` shadows `let`** | ✅ Yes | Low (intentional) | Reuse common names in nested scopes | ✅ Safe |
| **`const` shadows `const`** | ✅ Yes | Low | Reuse common names immutably | ✅ Safe |
| **`var` shadows `var`** | ✅ Yes | High (confusing hoisting) | Legacy code only | ❌ Avoid |
| **`var` shadows `let`/`const`** | ❌ SyntaxError | N/A | N/A | N/A |
| **`let`/`const` shadows `var`** | ✅ Yes | Medium (confusing mix) | Migration from `var` | ⚠️ Caution |
| **Parameter shadows outer** | ✅ Yes | Low (common pattern) | Function encapsulation | ✅ Safe |

**Best Practice:** Enable `no-shadow` ESLint rule to catch accidental shadowing (most shadowing is unintentional and buggy).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Shadowing Like Naming Conflicts:**

Imagine two people named "John" in a building:
- John 1: Lives on Floor 1 (outer scope)
- John 2: Lives on Floor 2 (inner scope)

When you're on Floor 2 and say "John", you mean John 2 (inner shadows outer).

```javascript
let john = "Floor 1 John";  // Outer John

function floor2() {
  let john = "Floor 2 John";  // Inner John (shadows outer)
  console.log(john);  // "Floor 2 John" (sees inner first)
}

console.log(john);  // "Floor 1 John" (outer scope)
```

**Illegal Shadowing (var vs let):**
```javascript
{
  let john = "Block John";   // Lives in apartment (block scope)
  var john = "Function John";  // ❌ Tries to live in entire floor (function scope)
  // Conflict! Can't have same name in overlapping spaces
}
```

**Real Example - Parameter Shadowing:**
```javascript
const username = "global_user";

function login(username) {  // Parameter shadows global
  console.log(username);  // Uses parameter, not global ✅
}

login("alice");  // "alice"
console.log(username);  // "global_user" (outer unchanged)
```

**Rule:** Avoid shadowing unless intentional (for encapsulation). Use ESLint to catch accidents.

</details>

### Resources

- [MDN: Variable Shadowing](https://developer.mozilla.org/en-US/docs/Glossary/Scope#shadowing)
- [JavaScript.info: Variable Scope](https://javascript.info/closure)

---

