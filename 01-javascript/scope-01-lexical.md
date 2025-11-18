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

### Resources

- [MDN: Variable Shadowing](https://developer.mozilla.org/en-US/docs/Glossary/Scope#shadowing)
- [JavaScript.info: Variable Scope](https://javascript.info/closure)

---

## Question 3: What is closure in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Netflix

### Question
Explain what a closure is in JavaScript. Provide practical examples of when and why you would use closures.

### Answer

A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.

1. **Key Concept: Lexical Scoping**
   - Functions are executed using the scope chain that was in effect when they were defined
   - Inner functions have access to outer function variables

2. **Closure Formation**
   - Created when a function is defined inside another function
   - Inner function "closes over" outer function's variables
   - Variables remain accessible even after outer function returns

3. **Common Use Cases**
   - Data privacy (private variables)
   - Factory functions
   - Event handlers
   - Callbacks
   - Partial application and currying
   - Module pattern

4. **Memory Considerations**
   - Closures keep references to outer variables
   - Can lead to memory leaks if not careful
   - Variables aren't garbage collected while closure exists

### Code Example

```javascript
// 1. BASIC CLOSURE EXAMPLE
function createCounter() {
  let count = 0; // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
console.log(counter.count);       // undefined (private!)

// 2. CLOSURE IN LOOPS (CLASSIC PROBLEM)
// ❌ Problem with var
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3 (all reference same i)
  }, 1000);
}

// ✅ Solution 1: Use let (creates new binding each iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 1000);
}

// ✅ Solution 2: Use IIFE to create closure
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j); // 0, 1, 2
    }, 1000);
  })(i);
}

// 3. DATA PRIVACY
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private

  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        return balance;
      }
    },
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return balance;
      }
      return "Insufficient funds";
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(1000);
console.log(account.deposit(500));   // 1500
console.log(account.withdraw(200));  // 1300
console.log(account.balance);        // undefined (can't access directly!)

// 4. FUNCTION FACTORY
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 5. EVENT HANDLER WITH CLOSURE
function createButton(label) {
  let clickCount = 0;

  const button = document.createElement('button');
  button.textContent = label;

  button.addEventListener('click', function() {
    clickCount++; // Closure over clickCount
    console.log(`${label} clicked ${clickCount} times`);
  });

  return button;
}

// 6. MODULE PATTERN
const calculator = (function() {
  // Private variables and functions
  let result = 0;

  function log(message) {
    console.log(`[Calculator] ${message}`);
  }

  // Public API
  return {
    add(n) {
      result += n;
      log(`Added ${n}, result: ${result}`);
      return this;
    },
    subtract(n) {
      result -= n;
      log(`Subtracted ${n}, result: ${result}`);
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

calculator.add(10).add(5).subtract(3);
console.log(calculator.getResult()); // 12

// 7. PARTIAL APPLICATION
function multiply(a, b) {
  return a * b;
}

function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

const multiplyBy5 = partial(multiply, 5);
console.log(multiplyBy5(4)); // 20
console.log(multiplyBy5(10)); // 50
```

<details>
<summary><strong>🔍 Deep Dive: How Closures Work in V8</strong></summary>

**Closure Creation:**

When a function is created, V8 analyzes which variables from outer scopes it references. These variables are stored in a **Context object** on the heap.

```javascript
function outer() {
  let count = 0;  // Will be captured by closure
  let temp = 'temp';  // NOT captured (never used by inner)

  return function inner() {
    count++;  // References outer variable
    return count;
  };
}

const counter = outer();
```

**Memory Structure:**

```
Heap:
┌─────────────────────────────┐
│ Context (outer's scope)     │
│  - count: 0                 │  ← Kept alive by closure!
│  (temp not stored here)     │
└─────────────────────────────┘
         ↑
         │ [[Scope]] reference
         │
┌─────────────────────────────┐
│ Function: inner             │
│  - [[Scope]]: → Context     │
│  - bytecode: ...            │
└─────────────────────────────┘

Stack (when outer() is called):
- temp: 'temp'  ← Freed when outer() returns
```

**Key Insight:** V8 only puts captured variables in the Context. Non-captured variables stay on the stack and are freed normally.

**Context Sharing:**

Multiple closures from the same function share the same Context:

```javascript
function createCounter() {
  let count = 0;

  return {
    increment() { return ++count; },  // Both closures
    decrement() { return --count; }   // share same Context
  };
}

// Memory structure:
SharedContext: { count: 0 }
  ↑         ↑
  │         │
increment  decrement
  (both reference same Context)
```

**Closure Optimization:**

V8 optimizes closures aggressively:

**Optimization 1: Scope Slot Caching**
```javascript
function outer() {
  let x = 10;

  return function inner() {
    console.log(x);  // First access: lookup + cache
    console.log(x);  // Second access: use cached slot
    console.log(x);  // Subsequent: use cache
  };
}

// V8 caches: "x is in parent scope, slot 0"
// No repeated lookups needed
```

**Optimization 2: Inlining**
```javascript
function add(a) {
  return function(b) {
    return a + b;  // Simple closure, inlined!
  };
}

const add5 = add(5);
add5(10);  // Entire closure inlined to: return 5 + 10;
```

**Optimization 3: Context Elimination**
```javascript
function example() {
  const x = 10;  // Constant, never changes

  return function() {
    return x * 2;  // V8 can inline the value!
  };
}

// Optimized to:
function() {
  return 10 * 2;  // No context lookup needed!
}
```

**Memory Leak Warning:**

```javascript
function createLeak() {
  const hugeArray = new Array(1000000).fill('data');  // 8MB!

  return function() {
    // Doesn't use hugeArray, but...
    console.log('Hello');
  };
}

// Problem: hugeArray is in the same scope as the returned function
// V8 must keep entire Context alive, including hugeArray!
// Solution: Use separate scopes or null out unused variables
```

**Proper Pattern:**

```javascript
function createNoLeak() {
  {
    const hugeArray = new Array(1000000).fill('data');
    // Use hugeArray...
    const summary = hugeArray.length;
  }  // Block scope ends, hugeArray is GC'd

  return function() {
    console.log('Hello');  // Only captures summary, not hugeArray
  };
}
```

**Performance:**

```
Benchmark (1 million calls):

No closure (local variable):    ~1.0ms
Closure (single level):         ~1.2ms  (20% slower)
Closure (nested 3 levels):      ~1.8ms  (80% slower)
Closure (optimized away):       ~1.0ms  (same as no closure!)

Real-world impact: Negligible for most apps
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: React useEffect Stale Closure</strong></summary>

**Scenario:** You're building a chat app where the message count sometimes shows the wrong number after sending messages.

**The Bug:**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = connectToSocket(roomId);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);

      // ❌ BUG: This closure captures initial unreadCount (0)
      setUnreadCount(unreadCount + 1);  // Always 0 + 1 = 1!
    });

    return () => socket.disconnect();
  }, [roomId]);  // unreadCount NOT in dependencies!

  return (
    <div>
      <h2>Unread: {unreadCount}</h2>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}

// What happens:
// 1. Initial render: unreadCount = 0
// 2. useEffect runs, socket.on callback CLOSES OVER unreadCount = 0
// 3. Message 1 arrives: setUnreadCount(0 + 1) → unreadCount = 1 ✓
// 4. Message 2 arrives: setUnreadCount(0 + 1) → unreadCount = 1 ❌ (STALE!)
// 5. The callback still references the OLD unreadCount (0)
```

**Why It Happens (Closures):**

```jsx
// Simplified execution:

// Render 1:
function ChatRoom() {
  const unreadCount = 0;  // ← Captured by closure

  useEffect(() => {
    socket.on('message', (msg) => {
      // This closure captures unreadCount = 0
      setUnreadCount(unreadCount + 1);  // 0 + 1
    });
  }, []);

  // Later renders create NEW unreadCount variables
  // But the socket callback still references the OLD one!
}
```

**Fix #1: Use Functional Updates**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = connectToSocket(roomId);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);

      // ✅ FIX: Use functional update
      setUnreadCount(prev => prev + 1);  // Always current!
    });

    return () => socket.disconnect();
  }, [roomId]);

  return (
    <div>
      <h2>Unread: {unreadCount}</h2>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}

// Why it works:
// setUnreadCount(prev => prev + 1) doesn't capture unreadCount
// React passes the CURRENT value as 'prev' parameter
```

**Fix #2: Add to Dependencies (Re-create Closure)**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = connectToSocket(roomId);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
      setUnreadCount(unreadCount + 1);  // Now captures current value
    });

    return () => socket.disconnect();
  }, [roomId, unreadCount]);  // ✅ FIX: Add unreadCount to deps

  // Downside: Effect re-runs on EVERY message
  // Socket disconnects and reconnects (expensive!)
}
```

**Fix #3: Use useRef (Mutable Reference)**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRef = useRef(0);  // ✅ Mutable reference

  useEffect(() => {
    unreadRef.current = unreadCount;  // Keep ref in sync
  }, [unreadCount]);

  useEffect(() => {
    const socket = connectToSocket(roomId);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);

      // ✅ FIX: Read from ref (always current)
      unreadRef.current++;
      setUnreadCount(unreadRef.current);
    });

    return () => socket.disconnect();
  }, [roomId]);  // unreadCount NOT needed in deps

  return (
    <div>
      <h2>Unread: {unreadCount}</h2>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}
```

**Key Lessons:**

1. **Closures capture variables at creation time**
   - useEffect callbacks close over state from that render
   - Stale values persist in closures

2. **Functional updates avoid stale closures**
   - `setState(prev => prev + 1)` always uses current value
   - Preferred solution for simple state updates

3. **useRef for mutable values**
   - Refs don't cause re-renders when changed
   - Good for values that change but don't need to trigger renders

4. **Dependency arrays create new closures**
   - Adding deps recreates the effect
   - Can be expensive (socket reconnects, etc.)

</details>

<details>
<summary><strong>⚖️ Trade-offs: Closure Patterns</strong></summary>

### Pattern 1: Factory Functions

```javascript
function createCounter(start) {
  let count = start;

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter1 = createCounter(0);
const counter2 = createCounter(10);
```

**Pros:**
- ✅ True privacy (can't access count directly)
- ✅ Multiple independent instances
- ✅ Clean API
- ✅ No `this` binding issues

**Cons:**
- ❌ Memory overhead (each instance has own methods)
- ❌ Can't share methods via prototype
- ❌ Debugging harder (private vars not visible)
- ❌ ~2-3x memory usage vs classes

**When to use:** Small number of instances, privacy critical

---

### Pattern 2: Classes with Private Fields

```javascript
class Counter {
  #count = 0;  // Private field

  increment() { return ++this.#count; }
  decrement() { return --this.#count; }
  getCount() { return this.#count; }
}

const counter1 = new Counter();
const counter2 = new Counter();
```

**Pros:**
- ✅ True privacy (private fields)
- ✅ Methods shared via prototype (memory efficient)
- ✅ Standard syntax
- ✅ Better performance (fewer closures)

**Cons:**
- ❌ Requires modern JavaScript (ES2022)
- ❌ `this` binding issues (need arrow functions or .bind())
- ❌ Less flexible than closures

**When to use:** Many instances, performance matters, modern environment

---

### Pattern 3: Module Pattern (IIFE)

```javascript
const calculator = (function() {
  let result = 0;  // Private

  return {
    add(n) { result += n; return this; },
    subtract(n) { result -= n; return this; },
    getResult() { return result; }
  };
})();

calculator.add(10).subtract(3);
```

**Pros:**
- ✅ Singleton pattern
- ✅ True privacy
- ✅ No `new` keyword needed
- ✅ Namespace protection

**Cons:**
- ❌ Only one instance
- ❌ Memory overhead (all methods in closure)
- ❌ Hard to test (singleton)
- ❌ Less idiomatic in modern JS (use ES6 modules)

**When to use:** Legacy code, need singleton, no modules

---

### Pattern 4: ES6 Modules

```javascript
// counter.js
let count = 0;  // Private to module

export function increment() { return ++count; }
export function decrement() { return --count; }
export function getCount() { return count; }

// app.js
import { increment, getCount } from './counter.js';
```

**Pros:**
- ✅ True module-level privacy
- ✅ Standard syntax
- ✅ Tree-shaking friendly
- ✅ Better tooling support
- ✅ Static analysis

**Cons:**
- ❌ Only one instance per module
- ❌ Harder to test (module state)
- ❌ Requires build tools (historically)

**When to use:** Modern apps, need modules, singleton is fine

---

### Performance Comparison

**Memory (1000 instances):**
```
Classes (shared methods):     ~100 KB
Factory functions (closures): ~250 KB  (2.5x more)
Module pattern (singleton):   ~1 KB    (but only 1 instance)
```

**Speed (1 million calls):**
```
Class methods:           ~8ms   (fastest)
Closure methods:         ~10ms  (25% slower)
Module exports:          ~8ms   (same as class)
```

**Recommendation:** Use classes with private fields for most cases, closures when you need extreme flexibility

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Junior:** "I keep hearing about closures, but I don't get what the big deal is. Isn't it just functions inside functions?"

**Senior:** "It's more than that! A closure is a function that 'remembers' variables from where it was created, even after that place no longer exists. Let me show you with a practical example:"

```javascript
function createGreeting(name) {
  // name is a local variable here

  return function() {
    console.log(`Hello, ${name}!`);
  };
}

const greetAlice = createGreeting('Alice');
const greetBob = createGreeting('Bob');

// createGreeting has finished executing
// But...

greetAlice();  // "Hello, Alice!" ← Still remembers 'name'!
greetBob();    // "Hello, Bob!"   ← Different 'name'!
```

**Junior:** "Wait, how does it still remember 'name' after createGreeting finished?"

**Senior:** "Great question! Think of it like a backpack:"

**Visual Analogy:**

```
When you call createGreeting('Alice'):

1. Function created:
   ┌─────────────────────────┐
   │ function() {            │
   │   console.log(`Hello,   │
   │   ${name}!`);           │
   │ }                       │
   └─────────────────────────┘
          ↓
   Packs a backpack 🎒
          ↓
   ┌─────────────────────┐
   │ Backpack contains:  │
   │ - name: 'Alice'     │
   └─────────────────────┘

The function CARRIES this backpack wherever it goes!
Even after createGreeting() is gone!
```

**Junior:** "So it's like the function has a hidden storage area?"

**Senior:** "Exactly! That's the closure. Now let me show you why this is super useful:"

**Use Case 1: Private Variables**

```javascript
// Without closure (anyone can modify):
let count = 0;

function increment() {
  count++;
}

// ❌ Problem: anyone can mess with count!
count = 999;  // Oops!

// With closure (private):
function createCounter() {
  let count = 0;  // Private!

  return {
    increment() {
      count++;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2

// ✅ Can't access count directly!
// counter.count → undefined
// Only through the methods we provided
```

**Junior:** "Oh! So closures are like private variables?"

**Senior:** "That's one use! Here's another super common one - event handlers:"

**Use Case 2: Event Handlers**

```javascript
// ❌ Problem: All buttons log the same number!
for (var i = 1; i <= 3; i++) {
  const button = document.createElement('button');
  button.textContent = `Button ${i}`;

  button.onclick = function() {
    console.log(`Clicked button ${i}`);
  };
  // All functions share same 'i'!
}
// All buttons log: "Clicked button 4" (final value of i)

// ✅ Solution: Closure captures each i separately
for (let i = 1; i <= 3; i++) {  // Note: let!
  const button = document.createElement('button');
  button.textContent = `Button ${i}`;

  button.onclick = function() {
    console.log(`Clicked button ${i}`);
  };
  // Each closure has its own 'i' in its backpack!
}
// Button 1: "Clicked button 1" ✓
// Button 2: "Clicked button 2" ✓
// Button 3: "Clicked button 3" ✓
```

**Junior:** "Whoa! So using `let` creates a new closure for each iteration?"

**Senior:** "Exactly! Each iteration gets its own 'i' in its own backpack. This is one of the most common closure bugs - using `var` instead of `let` in loops."

**Junior:** "Are there any downsides to closures?"

**Senior:** "Yes - memory! Every closure keeps its variables alive:"

```javascript
function createBigClosure() {
  const hugeArray = new Array(1000000).fill('data');  // 8MB!

  return function() {
    console.log('Hello');
    // Doesn't use hugeArray, but it's still kept in memory!
  };
}

const fn = createBigClosure();
// hugeArray is now stuck in memory until fn is garbage collected
```

**Junior:** "So closures can cause memory leaks?"

**Senior:** "They can! The rule is: only close over what you actually need. If you're not using a variable in the inner function, try not to reference it."

**Junior:** "Got it! So closures are: functions that remember variables from where they were created, useful for privacy and callbacks, but watch out for memory!"

**Senior:** "Perfect summary! You've got it! 🎯"

</details>

### Common Mistakes

- ❌ **Mistake:** Closure in loop with var
  ```javascript
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
  }
  // Outputs: 3, 3, 3 (all closures reference same i)
  ```

- ❌ **Mistake:** Memory leaks from unused closures
  ```javascript
  function createElement() {
    const hugeData = new Array(1000000).fill('data');

    return function() {
      // hugeData is retained even if never used!
      console.log('Created');
    };
  }
  ```

- ✅ **Correct:** Clear unused references
  ```javascript
  function createElement() {
    let hugeData = new Array(1000000).fill('data');

    // Use the data
    const summary = hugeData.length;

    // Clear reference
    hugeData = null;

    return function() {
      console.log(`Created with ${summary} items`);
    };
  }
  ```

### Follow-up Questions

- "What is the difference between scope and closure?"
- "How do closures relate to memory management?"
- "Can you explain closure in the context of React hooks?"
- "What are the performance implications of using closures?"
- "How would you debug a closure-related memory leak?"

### Resources

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Closure](https://javascript.info/closure)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)
- [Understanding Closures](https://www.freecodecamp.org/news/javascript-closures-explained-with-examples/)

---

## Question 4: What is Lexical Environment?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Microsoft

### Question
Explain what a Lexical Environment is in JavaScript. How does it relate to scope and closures?

### Answer

A **Lexical Environment** is a structure that holds identifier-variable mapping and a reference to the outer (parent) lexical environment. It's created every time a code block (`{}`) or function is executed.

**Components:**

1. **Environment Record**: Stores variables and function declarations
2. **Outer Environment Reference**: Link to parent lexical environment

### Code Example

```javascript
// Lexical Environment hierarchy

const globalVar = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";

    console.log(innerVar);  // Found in inner's LE
    console.log(outerVar);  // Found in outer's LE (via outer reference)
    console.log(globalVar); // Found in global LE (via chain)
  }

  inner();
}

outer();

/*
LEXICAL ENVIRONMENT CHAIN:
===========================

innerLexicalEnvironment = {
  environmentRecord: {
    innerVar: "inner"
  },
  outer: outerLexicalEnvironment ──┐
}                                   │
                                    ↓
outerLexicalEnvironment = {
  environmentRecord: {
    outerVar: "outer",
    inner: <function>
  },
  outer: globalLexicalEnvironment ──┐
}                                    │
                                     ↓
globalLexicalEnvironment = {
  environmentRecord: {
    globalVar: "global",
    outer: <function>
  },
  outer: null (end of chain)
}

Variable lookup traverses this chain!
*/
```

**Lexical Scope (Determined at Write Time):**

```javascript
function makeCounter() {
  let count = 0;  // Stored in makeCounter's Lexical Environment

  return function() {
    count++;      // Accesses outer LE (closure)
    return count;
  };
}

const counter1 = makeCounter();
const counter2 = makeCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (separate LE!)

/*
MEMORY STRUCTURE:
=================

counter1LexicalEnvironment = {
  environmentRecord: {},
  outer: makeCounterLE1 ──→ { count: 2 }
}

counter2LexicalEnvironment = {
  environmentRecord: {},
  outer: makeCounterLE2 ──→ { count: 1 }
}

Each counter has its own makeCounter LE!
*/
```

**Block-Level Lexical Environment:**

```javascript
let globalLet = "global";

{
  let blockLet = "block";
  const blockConst = "const";

  {
    let innerBlock = "inner";

    console.log(innerBlock);  // Own LE
    console.log(blockLet);    // Parent block LE
    console.log(globalLet);   // Global LE
  }

  // console.log(innerBlock); // ReferenceError (not in LE chain)
}

/*
LEXICAL ENVIRONMENT FOR BLOCKS:
================================

innerBlockLE = {
  environmentRecord: { innerBlock: "inner" },
  outer: blockLE
}

blockLE = {
  environmentRecord: {
    blockLet: "block",
    blockConst: "const"
  },
  outer: globalLE
}

globalLE = {
  environmentRecord: { globalLet: "global" },
  outer: null
}
*/
```

**Lexical Environment vs Variable Environment:**

```javascript
function example() {
  var varVariable = "var";      // Variable Environment
  let letVariable = "let";       // Lexical Environment
  const constVariable = "const"; // Lexical Environment

  function inner() {
    var innerVar = "inner var";
    let innerLet = "inner let";
  }
}

/*
exampleExecutionContext = {
  VariableEnvironment: {
    environmentRecord: {
      varVariable: "var",
      inner: <function>
    },
    outer: globalVariableEnvironment
  },
  LexicalEnvironment: {
    environmentRecord: {
      letVariable: "let",
      constVariable: "const"
    },
    outer: globalLexicalEnvironment
  },
  ThisBinding: <value>
}

Key Difference:
- VariableEnvironment: var and function declarations (function-scoped)
- LexicalEnvironment: let, const, class (block-scoped)
*/
```

### Closures and Lexical Environment

```javascript
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

/*
CLOSURE MAINTAINS LEXICAL ENVIRONMENT:
======================================

doubleLexicalEnvironment = {
  environmentRecord: {},
  outer: {  // createMultiplier LE preserved!
    environmentRecord: { multiplier: 2 },
    outer: globalLE
  }
}

tripleLexicalEnvironment = {
  environmentRecord: {},
  outer: {  // Different createMultiplier LE!
    environmentRecord: { multiplier: 3 },
    outer: globalLE
  }
}

The outer LE doesn't get garbage collected
because returned function references it!
*/
```

**Practical Example: Module Pattern**

```javascript
const calculator = (function() {
  // Private variables in module's Lexical Environment
  let memory = 0;

  // Private function
  function validateNumber(num) {
    return typeof num === 'number' && !isNaN(num);
  }

  // Public API (closures over module LE)
  return {
    add(num) {
      if (validateNumber(num)) {
        memory += num;
      }
      return this;
    },

    subtract(num) {
      if (validateNumber(num)) {
        memory -= num;
      }
      return this;
    },

    getResult() {
      return memory;
    }
  };
})();

calculator.add(10).subtract(3);
console.log(calculator.getResult()); // 7

// calculator.memory        // undefined (private!)
// calculator.validateNumber // undefined (private!)

/*
LEXICAL ENVIRONMENT STRUCTURE:
===============================

calculatorModuleLE = {
  environmentRecord: {
    memory: 7,
    validateNumber: <function>
  },
  outer: globalLE
}

publicAPIObjectLE = {
  environmentRecord: {},
  outer: calculatorModuleLE  // Closure!
}

Public methods close over private variables!
*/
```

### Common Mistakes

❌ **Wrong**: Confusing lexical environment with dynamic scope
```javascript
const name = "Global";

function outer() {
  const name = "Outer";
  inner();
}

function inner() {
  console.log(name); // "Global" (lexical scope, not "Outer")
}

outer();
// Lexical scope determined by WHERE function is defined,
// not WHERE it's called!
```

✅ **Correct**: Understanding lexical (static) scoping
```javascript
const name = "Global";

function outer() {
  const name = "Outer";

  function inner() {
    console.log(name); // "Outer" (lexical scope)
  }

  inner();
}

outer();
```

### Follow-up Questions
1. "How does garbage collection handle lexical environments?"
2. "What's the difference between lexical and dynamic scope?"
3. "How do closures preserve lexical environments?"
4. "Can you modify the outer lexical environment from inner?"

<details>
<summary><strong>🔍 Deep Dive: Lexical Environment Internals</strong></summary>

**How V8 Implements Lexical Environments:**

V8 creates **Context objects** on the heap to represent lexical environments at runtime.

**Context Object Structure:**

```
Context (Heap Object):
┌─────────────────────────────────┐
│ Header (object metadata)        │
│ Previous Context Reference      │ ← outer environment reference
│ Scope Info (which vars exist)   │
│ Slot 0: variable1               │
│ Slot 1: variable2               │
│ Slot 2: variable3               │
│ ...                             │
└─────────────────────────────────┘
```

**Example Context Chain:**

```javascript
const global = 'G';

function outer() {
  const outerVar = 'O';
  let count = 0;

  function inner() {
    const innerVar = 'I';
    console.log(global, outerVar, count, innerVar);
  }

  return inner;
}

const fn = outer();
fn();

// V8 creates:
GlobalContext = {
  previous: null,
  scopeInfo: ['global', 'outer'],
  slots: ['G', <function outer>]
}

OuterContext = {
  previous: GlobalContext,
  scopeInfo: ['outerVar', 'count', 'inner'],
  slots: ['O', 0, <function inner>]
}

InnerContext = {
  previous: OuterContext,
  scopeInfo: ['innerVar'],
  slots: ['I']
}
```

**Variable Lookup Algorithm:**

```
When accessing a variable 'x':
1. Check current context's scope info
2. If found → return slot value (fast)
3. If not found → check previous context (slower)
4. Repeat until found or previous = null
5. If not found → ReferenceError

Example lookup for 'count':
inner() context → not found
outer() context → found at slot 1 → return value
```

**Optimization: Scope Slot Caching:**

```javascript
function outer() {
  let x = 10;

  return function inner() {
    console.log(x);  // First access: search + cache
    console.log(x);  // Second: use cache
    console.log(x);  // Subsequent: use cache
  };
}

// V8 caches: "x is in parent context, slot 0"
// Subsequent accesses skip the search
```

**Environment Records (Spec vs Implementation):**

The ECMAScript spec defines two types of Environment Records:

**1. Declarative Environment Record:**
```javascript
// For let, const, function, class
{
  let x = 10;
  const y = 20;
  function fn() {}
}

// Creates:
DeclarativeEnvironmentRecord {
  x: 10,
  y: 20,
  fn: <function>
}
```

**2. Object Environment Record:**
```javascript
// For global var and with statements
var globalVar = 'global';

// Creates:
ObjectEnvironmentRecord {
  bindingObject: window,  // global object
  // All properties are on the window object
}
```

**Block-Level Environment Creation:**

```javascript
let outer = 'outer';

{
  let block = 'block';
  {
    let inner = 'inner';
    console.log(inner, block, outer);
  }
}

// V8 creates 3 contexts:
GlobalContext → { outer: 'outer' }
BlockContext1 → { block: 'block', previous: GlobalContext }
BlockContext2 → { inner: 'inner', previous: BlockContext1 }

// After inner block exits:
BlockContext2 → eligible for GC (unless captured by closure)
```

**Closure Optimization:**

V8 analyzes which variables are captured by closures and optimizes accordingly:

```javascript
function example() {
  let captured = 1;     // Used by closure → heap
  let notCaptured = 2;  // Not used → stack

  return function() {
    return captured + 1;
  };
}

// V8 optimization:
// - 'captured' goes in Context (heap)
// - 'notCaptured' stays on stack, freed when example() returns
```

**Performance Implications:**

```
Variable Access Speed:
Local variable (stack):        ~1 ns
Closure variable (1 level):    ~2 ns (context lookup)
Closure variable (3 levels):   ~4 ns (chain traversal)
Global variable:               ~3 ns (global object lookup)

Context Creation Cost:
Function call (no closure):    ~10 ns
Function call (with closure):  ~15 ns (context allocation)
```

**Memory Layout:**

```
Stack:
┌────────────────┐
│ Local vars     │  ← Fast, auto-freed
│ (not captured) │
└────────────────┘

Heap:
┌────────────────┐
│ Context 1      │  ← Closures
│ Context 2      │  ← Persists until GC
│ Context 3      │
└────────────────┘
```

**Garbage Collection:**

```javascript
function outer() {
  let data = new Array(1000000);  // 8MB

  return function() {
    // 'data' is in outer's context
    // Even if never used, it's retained!
  };
}

const fn = outer();
// 'data' stays in memory until fn is GC'd

// Solution: Separate scopes
function outer() {
  {
    let data = new Array(1000000);
    // Use data...
  }  // data's context can be GC'd

  return function() {
    console.log('Clean!');
  };
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Memory Leak from Retained Lexical Environments</strong></summary>

**Scenario:** You're building a data analytics dashboard that loads large datasets. After navigating between views, memory keeps growing and the app becomes slow.

**The Bug:**

```javascript
// chart-component.js
function createChartHandler(data) {
  // data is a huge array (100MB+)
  const chartData = processChartData(data);  // 50MB

  // Event handler that doesn't need the original data
  return function onChartClick(event) {
    // ❌ BUG: This closure captures entire lexical environment
    // including 'data' (100MB) and 'chartData' (50MB)
    // even though it only needs event coordinates!

    const x = event.clientX;
    const y = event.clientY;

    showTooltip(x, y, chartData);
    // Only needs chartData, but 'data' is also retained!
  };
}

// Usage:
const data = fetchHugeDataset();  // 100MB
const handler = createChartHandler(data);

chart.addEventListener('click', handler);

// Problem: Even after unmounting chart, handler keeps
// 150MB (data + chartData) in memory!
```

**Why It Happens:**

```javascript
// Lexical Environment structure:
createChartHandlerLE = {
  environmentRecord: {
    data: [100MB array],      // ❌ Retained but not used!
    chartData: [50MB array],  // ✅ Actually needed
    onChartClick: <function>
  },
  outer: globalLE
}

onChartClickLE = {
  environmentRecord: {},
  outer: createChartHandlerLE  // References entire parent LE!
}

// V8 can't selectively free 'data' because
// entire LE must be kept for the closure
```

**How to Debug:**

```javascript
// Chrome DevTools → Memory → Heap Snapshot

// Look for:
// 1. Detached DOM trees (event listeners not cleaned up)
// 2. Large arrays in closures
// 3. Multiple Context objects retaining same data

// Before fix: 150MB per chart instance
// After fix: 50MB per chart instance (66% reduction!)
```

**Fix #1: Separate Scopes**

```javascript
function createChartHandler(data) {
  // Process in separate scope
  let chartData;
  {
    chartData = processChartData(data);
    // 'data' is block-scoped here
  }  // Block exits, 'data' can be GC'd!

  // ✅ FIX: Closure only captures chartData
  return function onChartClick(event) {
    const x = event.clientX;
    const y = event.clientY;
    showTooltip(x, y, chartData);
    // Only 50MB retained, not 150MB!
  };
}
```

**Fix #2: Extract Only What You Need**

```javascript
function createChartHandler(data) {
  // ✅ FIX: Extract minimal data needed
  const chartData = processChartData(data);

  // Explicitly null out large reference
  data = null;  // Free 100MB!

  return function onChartClick(event) {
    const x = event.clientX;
    const y = event.clientY;
    showTooltip(x, y, chartData);
  };
}
```

**Fix #3: Use WeakMap for Large Data**

```javascript
const chartDataCache = new WeakMap();

function createChartHandler(data) {
  // Store data outside closure
  const dataId = Symbol();
  chartDataCache.set(dataId, processChartData(data));

  // ✅ FIX: Closure only captures small dataId
  return function onChartClick(event) {
    const chartData = chartDataCache.get(dataId);
    if (!chartData) return;  // Already GC'd

    const x = event.clientX;
    const y = event.clientY;
    showTooltip(x, y, chartData);
  };
}
```

**Real Production Debugging:**

```javascript
// Step 1: Identify the leak
// Chrome DevTools → Performance → Record → Take heap snapshot

// Step 2: Compare snapshots
// Before: 500MB memory
// After navigating: 650MB memory (should drop, but doesn't!)

// Step 3: Find retained objects
// Look at Retainers tree in heap snapshot:
// → Array (100MB)
//   → Context (createChartHandlerLE)
//     → [[Scopes]] of onChartClick
//       → Event listener on <chart>

// Step 4: Verify fix
// Before: Memory grows from 500MB → 650MB → 800MB → 950MB
// After: Memory grows then drops: 500MB → 650MB → 520MB → 530MB (GC working!)
```

**Key Lessons:**

1. **Closures retain entire lexical environment**
   - Not just variables you use, but ALL variables in scope
   - V8 can't selectively free unused variables from context

2. **Use block scopes to limit retention**
   ```javascript
   {
     const temp = expensiveOperation();
     // Use temp...
   }  // temp's context freed here
   ```

3. **Explicitly null out large objects**
   ```javascript
   let bigData = fetchData();
   const summary = processBigData(bigData);
   bigData = null;  // Free memory!
   ```

4. **Profile with DevTools**
   - Take heap snapshots
   - Look for detached DOM and retained contexts
   - Compare before/after to verify fixes

</details>

<details>
<summary><strong>⚖️ Trade-offs: Lexical Environment Strategies</strong></summary>

### Strategy 1: Global Scope

```javascript
// Everything in global lexical environment
var config = { api: 'https://api.example.com' };
var userData = null;

function fetchUser() {
  userData = fetch(config.api + '/user');
}

function displayUser() {
  render(userData);
}
```

**Pros:**
- ✅ Simple, no closures needed
- ✅ Fast access (no scope chain traversal)
- ✅ Easy to debug (everything visible in DevTools)

**Cons:**
- ❌ Namespace pollution
- ❌ No encapsulation or privacy
- ❌ Hard to test (global dependencies)
- ❌ Memory never freed (global scope never GC'd)
- ❌ Name collisions

**When to use:** Never in production, only in tiny scripts

---

### Strategy 2: Module-Level Lexical Environment

```javascript
// module.js
const config = { api: 'https://api.example.com' };  // Module LE
let userData = null;

export function fetchUser() {
  userData = fetch(config.api + '/user');
}

export function displayUser() {
  render(userData);
}
```

**Pros:**
- ✅ Encapsulation (module scope)
- ✅ No global pollution
- ✅ Tree-shaking friendly
- ✅ Fast access (module LE is shallow)
- ✅ Standard approach

**Cons:**
- ❌ One instance per module
- ❌ Harder to mock in tests
- ❌ State persists across imports

**When to use:** Modern applications, singleton patterns

---

### Strategy 3: Function Closures (Factory Pattern)

```javascript
function createUser(name) {
  // Private lexical environment
  let loginCount = 0;
  let lastLogin = null;

  return {
    login() {
      loginCount++;
      lastLogin = new Date();
      return `Welcome ${name}!`;
    },
    getStats() {
      return { loginCount, lastLogin };
    }
  };
}

const user1 = createUser('Alice');
const user2 = createUser('Bob');
```

**Pros:**
- ✅ True privacy (private variables)
- ✅ Multiple independent instances
- ✅ Clean API
- ✅ No `this` binding issues

**Cons:**
- ❌ Memory overhead (each instance has own context)
- ❌ Methods not shared (higher memory usage)
- ❌ Slower method calls (closure lookup)
- ❌ ~2-3x memory vs classes

**When to use:** Few instances, privacy critical, avoid `this` issues

**Memory benchmark (1000 instances):**
```
Factory functions: ~250 KB  (each has own methods + context)
Classes:          ~100 KB  (shared methods, less context)
```

---

### Strategy 4: Classes with Private Fields

```javascript
class User {
  #loginCount = 0;    // Private field
  #lastLogin = null;

  constructor(name) {
    this.name = name;
  }

  login() {
    this.#loginCount++;
    this.#lastLogin = new Date();
    return `Welcome ${this.name}!`;
  }

  getStats() {
    return {
      loginCount: this.#loginCount,
      lastLogin: this.#lastLogin
    };
  }
}

const user1 = new User('Alice');
const user2 = new User('Bob');
```

**Pros:**
- ✅ True privacy (private fields)
- ✅ Methods shared via prototype (memory efficient)
- ✅ Fast method calls (no closure lookup)
- ✅ Standard syntax (ES2022)

**Cons:**
- ❌ `this` binding issues (need arrow functions or .bind())
- ❌ Requires modern environment
- ❌ Less flexible than closures

**When to use:** Many instances, performance matters, modern environment

---

### Strategy 5: Nested Lexical Environments (Deep Closures)

```javascript
function createApp() {
  const config = { theme: 'dark' };

  return function createModule() {
    const moduleState = {};

    return function createComponent() {
      const componentState = {};

      return {
        render() {
          // Accesses 3 lexical environments!
          console.log(config.theme, moduleState, componentState);
        }
      };
    };
  };
}

const component = createApp()()();
```

**Pros:**
- ✅ Granular encapsulation
- ✅ Hierarchical privacy
- ✅ Flexible structure

**Cons:**
- ❌ Deep scope chain (slower lookups)
- ❌ Complex to debug
- ❌ More memory (multiple contexts)
- ❌ ~3-4x slower than flat structure

**When to use:** Rarely - prefer flat modules

**Performance comparison (1 million accesses):**
```
Direct access (no closure):    ~1.0ms
1-level closure:               ~1.2ms
3-level closure:               ~1.8ms  (80% slower!)
5-level closure:               ~2.5ms  (150% slower!)
```

---

### Strategy 6: Minimal Lexical Environments (Optimized)

```javascript
// ✅ Good: Only capture what's needed
function createHandler(userId) {
  // userId is small (8 bytes)
  return function onClick(event) {
    fetch(`/api/users/${userId}`);
  };
}

// ❌ Bad: Capture entire large object
function createHandler(user) {
  // user object is large (1KB+)
  return function onClick(event) {
    fetch(`/api/users/${user.id}`);  // Only needs id!
  };
}

// ✅ Better: Extract minimal data
function createHandler(user) {
  const userId = user.id;  // Extract only what's needed

  return function onClick(event) {
    fetch(`/api/users/${userId}`);
  };
}
```

**Key Principles:**
1. Extract minimal data before creating closure
2. Use block scopes to free large temporaries
3. Profile with heap snapshots
4. Aim for <100 bytes per closure

---

### Recommendation Matrix

| Scenario | Best Strategy | Why |
|----------|---------------|-----|
| Singleton state | Module LE | Standard, fast, encapsulated |
| Many instances | Classes | Memory efficient, fast |
| Few instances | Factory functions | Privacy, no `this` issues |
| Deep hierarchy | Avoid! | Use flat modules instead |
| Large data | Minimal LE | Extract only needed data |

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Junior:** "I keep hearing about Lexical Environments in interviews. What are they exactly?"

**Senior:** "Great question! Think of a Lexical Environment like a phone book that JavaScript creates every time a function runs. It has two things: a list of variables (the phone book entries) and a reference to the parent phone book."

**Visual Analogy:**

```
When you run this code:

const global = 'G';

function outer() {
  const outerVar = 'O';

  function inner() {
    const innerVar = 'I';
    console.log(innerVar, outerVar, global);
  }

  inner();
}

JavaScript creates 3 "phone books":

📕 Global Phone Book
   Variables: global = 'G', outer = <function>
   Parent: none

📗 Outer Phone Book
   Variables: outerVar = 'O', inner = <function>
   Parent: 📕 Global Phone Book

📘 Inner Phone Book
   Variables: innerVar = 'I'
   Parent: 📗 Outer Phone Book
```

**Junior:** "So when inner() tries to access 'global', it looks in its phone book, doesn't find it, then checks the parent?"

**Senior:** "Exactly! Let's trace the lookup:"

```javascript
// In inner():
console.log(innerVar, outerVar, global);

// Looking for 'innerVar':
1. Check 📘 Inner Phone Book → Found! 'I'

// Looking for 'outerVar':
1. Check 📘 Inner Phone Book → Not found
2. Check parent (📗 Outer) → Found! 'O'

// Looking for 'global':
1. Check 📘 Inner Phone Book → Not found
2. Check parent (📗 Outer) → Not found
3. Check parent (📕 Global) → Found! 'G'
```

**Junior:** "What happens if it's not in any phone book?"

**Senior:** "Then you get a ReferenceError!"

```javascript
function example() {
  console.log(doesNotExist);  // ReferenceError!
}

// Lookup chain:
// 1. Check example's LE → not found
// 2. Check global LE → not found
// 3. No more parents → ReferenceError!
```

**Junior:** "How does this relate to closures?"

**Senior:** "Closures are functions that 'keep' their parent phone book even after the parent function is done!"

```javascript
function makeGreeting(name) {
  // 📗 makeGreeting's Phone Book
  //    Variables: name = 'Alice'

  return function() {
    console.log(`Hello, ${name}!`);
    // ☝️ This function keeps a reference to parent phone book!
  };
}

const greet = makeGreeting('Alice');

// makeGreeting finished executing
// But greet STILL has access to makeGreeting's phone book!

greet();  // "Hello, Alice!" ✓
```

**Junior:** "Wait, doesn't the phone book get thrown away when the function finishes?"

**Senior:** "Normally yes, but NOT if a closure references it! Look:"

```
Normal function (no closure):
function example() {
  let x = 10;
  console.log(x);
}
example();
// 📕 Phone book created
// 📕 Phone book destroyed (no one needs it)

With closure:
function outer() {
  let x = 10;
  return function inner() {
    console.log(x);  // References parent phone book!
  };
}
const fn = outer();
// 📕 Phone book created
// 📕 Phone book KEPT ALIVE (inner needs it)
fn();  // Can still access x!
```

**Junior:** "So that's why closures use more memory?"

**Senior:** "Exactly! Each closure keeps its parent phone book alive. If the phone book has large data, it stays in memory:"

```javascript
// ❌ Memory leak example
function createHandler() {
  const hugeArray = new Array(1000000).fill('data');  // 8MB!

  return function onClick() {
    console.log('Clicked!');
    // Doesn't use hugeArray, but entire phone book is retained!
  };
}

const handler = createHandler();
// 8MB stuck in memory!

// ✅ Better:
function createHandler() {
  {
    const hugeArray = new Array(1000000).fill('data');
    // Use hugeArray...
  }  // Block ends, phone book freed!

  return function onClick() {
    console.log('Clicked!');
    // Only this has its own tiny phone book
  };
}
```

**Junior:** "So the rule is: closures keep parent phone books alive, and we should be careful about what's in those phone books?"

**Senior:** "Perfect! And one more thing: these phone books are created at **write time** (when you write the code), not at **run time** (when you call it). That's why it's called **lexical** scope - 'lexical' means 'related to the text/structure of the code'."

```javascript
const x = 'global';

function outer() {
  const x = 'outer';
  inner();  // Where we CALL inner
}

function inner() {
  console.log(x);  // Where inner is DEFINED
}

outer();  // Prints 'global', not 'outer'!

// Because inner's parent phone book is determined by
// WHERE IT'S WRITTEN (next to global),
// not WHERE IT'S CALLED (inside outer)
```

**Junior:** "Got it! Lexical Environment = phone book with variables + parent reference. Closures = functions that keep their parent phone book. And it's all determined by where code is written, not where it's called!"

**Senior:** "Perfect summary! You're ready for interviews! 🎯"

</details>

### Follow-up Questions
1. "How does garbage collection handle lexical environments?"
2. "What's the difference between lexical and dynamic scope?"
3. "How do closures preserve lexical environments?"
4. "Can you modify the outer lexical environment from inner?"

### Resources
- [ECMA-262: Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- [JavaScript Visualized: Scope Chain](https://dev.to/lydiahallie/javascript-visualized-scope-chain-13pd)

---

## Question 5: How does the scope chain work in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain how the scope chain works in JavaScript. How does JavaScript resolve variable lookups?

### Answer

The **scope chain** is the mechanism JavaScript uses to resolve variable names by traversing through nested scopes from innermost to outermost until the variable is found or a ReferenceError is thrown.

**Key Concepts:**

1. **Chain Formation**: Each function/block has a reference to its outer lexical environment, forming a chain
2. **Lookup Direction**: Always goes from inner → outer, never the reverse
3. **First Match Wins**: Stops at the first occurrence of the variable name
4. **Determined at Write Time**: Scope chain is fixed when code is written (lexical scoping)

**Scope Chain Structure:**

```
Inner Scope → Outer Scope → Global Scope → null
```

### Code Example

```javascript
// 1. BASIC SCOPE CHAIN
const global = 'Global';

function outer() {
  const outerVar = 'Outer';

  function middle() {
    const middleVar = 'Middle';

    function inner() {
      const innerVar = 'Inner';

      // Variable resolution follows scope chain:
      console.log(innerVar);   // Found in inner scope (1st level)
      console.log(middleVar);  // Found in middle scope (2nd level)
      console.log(outerVar);   // Found in outer scope (3rd level)
      console.log(global);     // Found in global scope (4th level)
      // console.log(notDefined); // ReferenceError (not in chain)
    }

    inner();
  }

  middle();
}

outer();

/*
SCOPE CHAIN VISUALIZATION:
==========================

innerScope = {
  variables: { innerVar: 'Inner' },
  outer: middleScope ──┐
}                       │
                        ↓
middleScope = {
  variables: { middleVar: 'Middle' },
  outer: outerScope ──┐
}                      │
                       ↓
outerScope = {
  variables: { outerVar: 'Outer' },
  outer: globalScope ──┐
}                       │
                        ↓
globalScope = {
  variables: { global: 'Global', outer: <function> },
  outer: null (end of chain)
}
*/

// 2. SCOPE CHAIN WITH SHADOWING
let name = 'Global';

function first() {
  let name = 'First';

  function second() {
    let name = 'Second';

    function third() {
      // Scope chain lookup stops at FIRST match
      console.log(name); // 'Second' (not 'First' or 'Global')
    }

    third();
  }

  second();
}

first();

// Scope chain: third → second → first → global
// Lookup for 'name': third (not found) → second (FOUND!) → stops

// 3. SCOPE CHAIN IS NOT CALL STACK
const x = 'global x';

function a() {
  const x = 'a x';
  b(); // Call b from a
}

function b() {
  // b's scope chain: b → global (NOT b → a → global!)
  console.log(x); // 'global x' (lexical scope, not dynamic)
}

a();

// Call Stack: global → a() → b()
// Scope Chain for b: b → global
// Scope chain is about WHERE code is WRITTEN, not WHERE it's CALLED

// 4. SCOPE CHAIN WITH CLOSURES
function createCounter() {
  let count = 0;
  const createdAt = new Date();

  return {
    increment() {
      count++;
      return count;
    },
    getInfo() {
      // This scope chain persists even after createCounter returns!
      return {
        count,
        createdAt,
        // Both methods share same scope chain
      };
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getInfo());   // { count: 1, createdAt: ... }

/*
CLOSURE SCOPE CHAIN:
===================

incrementScope = {
  variables: {},
  outer: createCounterScope ──┐
}                              │
                               ↓
createCounterScope = {
  variables: {
    count: 1,
    createdAt: <Date>,
    increment: <function>,
    getInfo: <function>
  },
  outer: globalScope
}

Scope chain preserved in memory!
*/

// 5. BLOCK SCOPE CHAIN
const outerBlock = 'outer';

{
  const middleBlock = 'middle';

  {
    const innerBlock = 'inner';

    console.log(innerBlock);   // Own scope
    console.log(middleBlock);  // Parent block scope
    console.log(outerBlock);   // Grandparent scope
  }

  // console.log(innerBlock); // ReferenceError (not in scope chain)
}

// Scope chain: inner block → middle block → outer scope → global

// 6. SCOPE CHAIN WITH FUNCTION DECLARATIONS VS EXPRESSIONS
// Function Declaration (hoisted):
function hoisted() {
  console.log(declaredFunc); // <function> (hoisted)

  function declaredFunc() {
    return 'I am hoisted';
  }
}

// Function Expression (not hoisted):
function notHoisted() {
  // console.log(expressionFunc); // ReferenceError (TDZ)

  const expressionFunc = function() {
    return 'I am not hoisted';
  };

  console.log(expressionFunc); // <function>
}

hoisted();
notHoisted();

// Scope chain traversal happens AFTER hoisting phase

// 7. SCOPE CHAIN OPTIMIZATION (V8)
function outer() {
  let frequently = 'accessed';
  let rarely = 'accessed';

  return function inner() {
    // V8 caches frequently accessed scope chain slots
    for (let i = 0; i < 1000000; i++) {
      console.log(frequently); // Cached after first lookup
    }

    console.log(rarely); // Not worth caching
  };
}

// 8. WITH STATEMENT (AVOID - BREAKS SCOPE CHAIN OPTIMIZATION)
const obj = { x: 10, y: 20 };

with (obj) {
  // ❌ NEVER USE: Adds obj to scope chain at runtime
  // Makes scope chain unpredictable
  console.log(x); // 10 (from obj)
  console.log(y); // 20 (from obj)
  // V8 can't optimize this!
}

// Modern alternative (explicit):
const { x, y } = obj;
console.log(x, y); // Same result, optimizable

// 9. EVAL SCOPE CHAIN (ALSO AVOID)
function example() {
  let x = 10;

  // ❌ NEVER USE: eval can modify scope chain at runtime
  eval('var y = 20'); // Adds y to current scope!

  console.log(x); // 10
  console.log(y); // 20 (injected by eval!)
}

example();

// Modern alternative: Use functions or modules

// 10. SCOPE CHAIN IN MODULES
// module1.js
const moduleVar = 'module-private';

export function publicFunc() {
  // Scope chain: publicFunc → module scope → global
  console.log(moduleVar); // Accessible
}

// module2.js
import { publicFunc } from './module1.js';

publicFunc(); // Works
// console.log(moduleVar); // Error (not in this module's scope chain)

// Each module has its own scope chain!
```

<details>
<summary><strong>🔍 Deep Dive: Scope Chain Implementation in V8</strong></summary>

**How V8 Builds the Scope Chain:**

When JavaScript code is parsed, V8 creates a **scope tree** at compile time:

```javascript
const global = 'G';

function outer() {
  const outerVar = 'O';

  function inner() {
    const innerVar = 'I';
    console.log(innerVar, outerVar, global);
  }

  inner();
}

// V8 Parse Phase:
// Creates scope tree:
GlobalScope
  ├─ variables: [global, outer]
  └─ children:
      OuterScope
        ├─ variables: [outerVar, inner]
        └─ children:
            InnerScope
              └─ variables: [innerVar]
```

**Runtime Context Chain:**

At runtime, V8 creates **Context objects** (heap-allocated) that mirror the scope chain:

```
Stack (during execution):
┌─────────────────┐
│ inner() frame   │
│ - locals        │
│ - context ptr ──┼──┐
└─────────────────┘  │
                     │
Heap:                │
┌─────────────────┐  │
│ InnerContext    │◄─┘
│ - variables: {} │
│ - previous: ────┼──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │
│ OuterContext    │◄─┘
│ - outerVar: 'O' │
│ - previous: ────┼──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │
│ GlobalContext   │◄─┘
│ - global: 'G'   │
│ - previous: null│
└─────────────────┘
```

**Variable Lookup Algorithm:**

```
Pseudocode for variable lookup:

function resolveVariable(name, currentContext) {
  // 1. Check current context
  if (currentContext.has(name)) {
    return currentContext.get(name);
  }

  // 2. Check parent context (follow scope chain)
  if (currentContext.previous !== null) {
    return resolveVariable(name, currentContext.previous);
  }

  // 3. Not found in entire chain
  throw ReferenceError(`${name} is not defined`);
}

// Example:
resolveVariable('outerVar', InnerContext)
  → Not in InnerContext
  → Check InnerContext.previous (OuterContext)
  → Found in OuterContext! Return 'O'
```

**Optimization: Scope Slot Caching:**

V8 caches scope chain lookups to avoid repeated traversals:

```javascript
function outer() {
  let x = 10; // Slot 0 in OuterContext

  return function inner() {
    // First access of x:
    console.log(x); // Lookup: inner → outer (found at slot 0)
                    // Cache: "x is in parent context, slot 0"

    // Subsequent accesses:
    console.log(x); // Use cached slot (no lookup!)
    console.log(x); // Use cached slot
  };
}

// Cached as bytecode instruction:
// LdaContextSlot <context_depth=1> <slot_index=0>
// Directly accesses slot 0 of parent context
```

**Optimization: Scope Analysis:**

V8 performs **scope analysis** at compile time to determine which variables need heap allocation (captured by closures):

```javascript
function example() {
  let captured = 1;     // Used by closure → heap (context)
  let notCaptured = 2;  // Not used → stack (local)

  return function() {
    return captured;  // References outer variable
  };
}

// V8 analysis:
// - Scan inner function: references 'captured'
// - Mark 'captured' as "needs context"
// - Leave 'notCaptured' as stack-allocated
```

**Performance Characteristics:**

```
Variable Access Time (approximate):
- Local variable (stack):         ~1 ns  (fastest)
- Parent context (1 level):        ~2 ns  (scope chain: 1 hop)
- Grandparent context (2 levels):  ~3 ns  (scope chain: 2 hops)
- Great-grandparent (3 levels):    ~4 ns  (scope chain: 3 hops)
- Global variable:                 ~3 ns  (special optimization)

Scope Chain Creation Cost:
- Function with no closure:        ~10 ns  (stack frame only)
- Function with closure:           ~15 ns  (+ context allocation)
- Deep closure (3+ levels):        ~25 ns  (multiple contexts)
```

**Why `with` and `eval` Break Optimization:**

```javascript
// Normal function (optimizable):
function normal() {
  let x = 10;
  return x + 1;
  // V8 knows: x is at stack offset 0
  // Compiles to: ADD r0, #1
}

// With 'with' (not optimizable):
function withStatement(obj) {
  with (obj) {
    return x + 1;  // Is x from obj? Or outer scope?
    // V8 can't know until runtime!
    // Must use slow property lookup
  }
}

// With 'eval' (not optimizable):
function withEval() {
  let x = 10;
  eval('x = 20');  // Might modify x, or might not!
  return x;
  // V8 can't optimize: eval can inject variables at runtime
}
```

**Scope Chain vs Prototype Chain:**

```
Scope Chain (for variables):
inner → outer → global

Prototype Chain (for object properties):
obj → Object.prototype → null

Different chains, different purposes!

Example:
const obj = { x: 10 };

function outer() {
  const y = 20;

  return function inner() {
    console.log(y);      // Scope chain: inner → outer
    console.log(obj.x);  // Property access: obj → Object.prototype
  };
}

// Two separate lookups!
```

**Modern V8 Optimizations:**

1. **Inline Caching (IC)**: Caches scope slot locations
2. **Hidden Classes**: Optimizes object property access (not scope chain)
3. **Escape Analysis**: Determines if variables can stay on stack
4. **Scope Flattening**: Reduces nested context depth when possible

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Scope Chain Performance Bug</strong></summary>

**Scenario:** You're building a data processing pipeline that handles millions of records. The processing is unexpectedly slow, and profiling shows excessive time spent in a simple helper function.

**The Bug:**

```javascript
// data-processor.js
const config = {
  batchSize: 1000,
  timeout: 5000,
  retries: 3,
  // ... 50+ configuration properties
};

const logger = {
  debug() { /* ... */ },
  info() { /* ... */ },
  warn() { /* ... */ },
  error() { /* ... */ }
};

const metrics = {
  processed: 0,
  errors: 0,
  startTime: Date.now()
};

function processRecords(records) {
  return records.map(record => {
    // ❌ BUG: This function is called millions of times
    // Each call must traverse scope chain to find helpers
    return transformRecord(record);
  });
}

function transformRecord(record) {
  // Scope chain: transformRecord → processRecords → module scope → global
  // Must traverse 3 scopes to find 'config', 'logger', 'metrics'!

  metrics.processed++;  // Scope chain lookup!

  if (!validate(record)) {
    logger.error('Invalid record');  // Scope chain lookup!
    metrics.errors++;  // Scope chain lookup!
    return null;
  }

  // Process with config.batchSize...  // Scope chain lookup!
  return processData(record);
}

// Performance:
// Processing 1 million records
// Each record: 4 scope chain lookups × 3 hops = 12 scope traversals
// Total: 12 million scope chain traversals!
// Time: ~500ms just for scope lookups (30% of total time!)
```

**Why It's Slow:**

```javascript
// Every call to transformRecord:
transformRecord(record)
  → metrics.processed++
    → Lookup 'metrics':
      1. Check transformRecord scope → not found
      2. Check processRecords scope → not found
      3. Check module scope → FOUND!
  → logger.error()
    → Lookup 'logger':
      1. Check transformRecord scope → not found
      2. Check processRecords scope → not found
      3. Check module scope → FOUND!
  → config.batchSize
    → Lookup 'config':
      1. Check transformRecord scope → not found
      2. Check processRecords scope → not found
      3. Check module scope → FOUND!

// Repeated millions of times!
```

**How to Debug:**

```javascript
// Chrome DevTools → Performance → Record
// Look for "hot" functions with high self-time

// Before optimization:
// transformRecord: 500ms (30% of total)
//   - Variable resolution: 300ms (most of the time!)
//   - Actual processing: 200ms

// Profiler shows: Time spent in scope chain lookups!
```

**Fix #1: Bring Variables Into Scope**

```javascript
function processRecords(records) {
  // ✅ FIX: Capture frequently accessed variables in inner scope
  const cfg = config;
  const log = logger;
  const stats = metrics;

  return records.map(record => {
    return transformRecord(record, cfg, log, stats);
  });
}

function transformRecord(record, cfg, log, stats) {
  // Now all variables are in local scope (no traversal!)
  stats.processed++;

  if (!validate(record)) {
    log.error('Invalid record');
    stats.errors++;
    return null;
  }

  // Process with cfg.batchSize...
  return processData(record);
}

// Performance after fix:
// Processing 1 million records
// Scope chain lookups: ~50ms (down from 300ms!)
// 6x faster!
```

**Fix #2: Extract to Parameters**

```javascript
function processRecords(records) {
  // ✅ FIX: Extract only what's needed
  const batchSize = config.batchSize;

  let processed = 0;
  let errors = 0;

  return records.map(record => {
    processed++;

    if (!validate(record)) {
      logger.error('Invalid record');
      errors++;
      return null;
    }

    return processData(record, batchSize);
  });
}

// Even better: local variables, no scope chain at all!
```

**Fix #3: Use Object Destructuring**

```javascript
function processRecords(records) {
  // ✅ FIX: Destructure at function start
  const { batchSize, timeout, retries } = config;
  const { debug, info, warn, error } = logger;

  let { processed, errors } = metrics;

  return records.map(record => {
    processed++;

    if (!validate(record)) {
      error('Invalid record');
      errors++;
      return null;
    }

    return processData(record, batchSize);
  });
}

// All variables now in local scope, no traversal needed!
```

**Real Production Benchmarks:**

```javascript
// Test: Process 1 million records

// Before optimization (deep scope chain):
// Time: 1,650ms
// Breakdown:
//   - Scope chain lookups: 500ms (30%)
//   - Validation: 400ms (24%)
//   - Processing: 750ms (46%)

// After Fix #1 (pass as parameters):
// Time: 1,150ms (30% faster!)
// Breakdown:
//   - Scope chain lookups: 50ms (4%)  ← Much better!
//   - Validation: 400ms (35%)
//   - Processing: 700ms (61%)

// After Fix #2 (extract to locals):
// Time: 1,100ms (33% faster!)
// Breakdown:
//   - Scope chain lookups: 10ms (1%)  ← Excellent!
//   - Validation: 390ms (35%)
//   - Processing: 700ms (64%)
```

**Key Lessons:**

1. **Hot paths matter**
   - Functions called millions of times need optimization
   - Scope chain lookups add up in loops

2. **Bring frequently accessed variables into local scope**
   - Extract to parameters or local variables
   - Destructure at function start

3. **Profile before optimizing**
   - Use Chrome DevTools to find bottlenecks
   - Measure before and after

4. **Trade-offs**
   - More parameters = better performance
   - But: harder to read, more boilerplate
   - Only optimize hot paths!

</details>

<details>
<summary><strong>⚖️ Trade-offs: Scope Chain Strategies</strong></summary>

### Strategy 1: Shallow Scope Chain (Fast)

```javascript
// Flat structure, minimal nesting
const data = 'value';

function process() {
  const result = transform(data);
  return result;
}

// Scope chain: process → global (2 levels)
```

**Pros:**
- ✅ Fast variable lookups (1-2 hops max)
- ✅ Easy to debug
- ✅ Good for hot paths

**Cons:**
- ❌ Less encapsulation
- ❌ More namespace pollution
- ❌ Harder to organize large codebases

**When to use:** Performance-critical code, simple applications

---

### Strategy 2: Deep Scope Chain (Organized)

```javascript
// Nested structure, more organization
function createApp() {
  const appConfig = {};

  return function createModule() {
    const moduleConfig = {};

    return function createComponent() {
      const componentConfig = {};

      return function render() {
        // Access all configs through scope chain
        return combine(appConfig, moduleConfig, componentConfig);
      };
    };
  };
}

// Scope chain: render → component → module → app → global (5 levels)
```

**Pros:**
- ✅ Better organization
- ✅ Clear hierarchy
- ✅ Strong encapsulation

**Cons:**
- ❌ Slower lookups (4-5 hops)
- ❌ More memory (multiple contexts)
- ❌ Complex debugging

**When to use:** Rarely - prefer flat modules

**Performance impact:**
```
1-level scope chain:   ~2 ns per lookup
3-level scope chain:   ~4 ns per lookup
5-level scope chain:   ~6 ns per lookup (3x slower!)
```

---

### Strategy 3: Parameter Passing (Explicit)

```javascript
const config = { timeout: 5000 };
const logger = console;

function process(data, config, logger) {
  // All dependencies as parameters (local scope)
  logger.log('Processing', data);
  return transform(data, config.timeout);
}

// Scope chain: process → global (2 levels, but rarely used)
```

**Pros:**
- ✅ Fastest (local variables)
- ✅ Explicit dependencies
- ✅ Easy to test (inject mocks)
- ✅ No closure overhead

**Cons:**
- ❌ More boilerplate
- ❌ Longer function signatures
- ❌ Repeated parameter passing

**When to use:** Hot paths, testable code, explicit APIs

---

### Strategy 4: Module Scope (Balanced)

```javascript
// module.js
const config = { timeout: 5000 };
const logger = console;

export function process(data) {
  // Access module-level variables
  logger.log('Processing', data);
  return transform(data, config.timeout);
}

// Scope chain: process → module scope → global (3 levels)
```

**Pros:**
- ✅ Good balance of speed and organization
- ✅ Module-level encapsulation
- ✅ Standard approach
- ✅ Tree-shaking friendly

**Cons:**
- ❌ One instance per module
- ❌ Harder to mock (module state)
- ❌ Scope chain still has 2-3 levels

**When to use:** Most modern applications (recommended)

---

### Strategy 5: Local Caching (Optimized)

```javascript
const globalConfig = { /* large object */ };
const globalLogger = { /* large object */ };

function processMany(items) {
  // ✅ OPTIMIZATION: Cache in local scope
  const config = globalConfig;
  const logger = globalLogger;

  // Now inner functions use cached locals (faster)
  return items.map(item => {
    logger.log(item);
    return transform(item, config);
  });
}

// First access: scope chain lookup
// Subsequent: local variable (fast!)
```

**Pros:**
- ✅ Fast inner access (local variables)
- ✅ Minimal code changes
- ✅ Best of both worlds

**Cons:**
- ❌ Slight memory overhead (cached references)
- ❌ Only helps in loops/hot paths
- ❌ More variables to track

**When to use:** Hot paths with repeated scope lookups

---

### Performance Comparison (1 million operations)

```javascript
// Test: Access variable 1 million times

// Strategy 1: Shallow scope chain
function test1() {
  for (let i = 0; i < 1000000; i++) {
    doSomething(globalVar);  // 2 hops
  }
}
// Time: ~80ms

// Strategy 2: Deep scope chain (5 levels)
function test2() {
  return function() {
    return function() {
      return function() {
        for (let i = 0; i < 1000000; i++) {
          doSomething(deepVar);  // 5 hops
        }
      };
    };
  };
}
// Time: ~150ms (87% slower!)

// Strategy 3: Parameter passing
function test3(localVar) {
  for (let i = 0; i < 1000000; i++) {
    doSomething(localVar);  // 0 hops (local)
  }
}
// Time: ~50ms (fastest!)

// Strategy 5: Local caching
function test5() {
  const cached = globalVar;  // Cache once
  for (let i = 0; i < 1000000; i++) {
    doSomething(cached);  // 0 hops (local)
  }
}
// Time: ~52ms (almost as fast as #3)
```

---

### Recommendation Matrix

| Scenario | Best Strategy | Why |
|----------|---------------|-----|
| Hot path (loops) | Local caching (#5) | Fastest, minimal changes |
| Testable code | Parameters (#3) | Explicit dependencies, easy mocks |
| General app code | Module scope (#4) | Standard, balanced performance |
| Simple scripts | Shallow chain (#1) | Simple, fast enough |
| Complex hierarchy | Avoid deep nesting (#2) | Use flat modules instead |

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Junior:** "I keep hearing about the scope chain. What is it exactly?"

**Senior:** "Imagine you're in your bedroom and you need your phone. Here's how you'd search for it:"

```
1. Check your bedroom (innermost scope)
2. Not there? Check living room (parent scope)
3. Not there? Check kitchen (grandparent scope)
4. Not there? Check garage (global scope)
5. Still not there? Give up! (ReferenceError)

This search path is the "scope chain"!
```

**Visual Example:**

```javascript
const phone = 'in garage'; // Global scope

function livingRoom() {
  const remote = 'on couch'; // Living room scope

  function bedroom() {
    const pillow = 'on bed'; // Bedroom scope

    // Looking for phone:
    console.log(phone);
    // 1. Check bedroom → not found
    // 2. Check living room → not found
    // 3. Check garage → FOUND!
  }

  bedroom();
}

livingRoom();
```

**Junior:** "So JavaScript checks from inner to outer until it finds the variable?"

**Senior:** "Exactly! And it stops at the FIRST match:"

```javascript
const name = 'Global';

function outer() {
  const name = 'Outer';

  function inner() {
    const name = 'Inner';

    console.log(name); // 'Inner' (stops at first match!)
    // Doesn't keep searching for other 'name' variables
  }

  inner();
}

outer();

// Scope chain: inner → outer → global
// Lookup: inner (FOUND 'Inner') → STOP
```

**Junior:** "What if the variable isn't anywhere in the chain?"

**Senior:** "Then you get a ReferenceError!"

```javascript
function example() {
  console.log(doesNotExist);
  // Scope chain: example → global
  // Check example → not found
  // Check global → not found
  // End of chain → ReferenceError!
}

example(); // ReferenceError: doesNotExist is not defined
```

**Junior:** "Is the scope chain the same as the call stack?"

**Senior:** "Great question! NO - they're completely different! Let me show you:"

```javascript
const x = 'global';

function a() {
  const x = 'a';
  b(); // Call b from inside a
}

function b() {
  console.log(x); // What does this print?
}

a();

// Call Stack: global → a() → b()
// But b's scope chain: b → global (NOT b → a!)
// Because b is DEFINED next to global, not inside a

// Output: 'global' (from scope chain, not call stack)
```

**Visual Comparison:**

```
Call Stack (where you ARE):
┌─────────┐
│   b()   │ ← Currently executing
├─────────┤
│   a()   │ ← Called from here
├─────────┤
│ global  │ ← Started here
└─────────┘

Scope Chain (where b was WRITTEN):
b() → global
(b was defined at global level, so its parent is global)
```

**Junior:** "So scope chain is about where code is WRITTEN, not where it's CALLED?"

**Senior:** "Perfect! That's why it's called **lexical** scope - 'lexical' means 'about the text/structure'. It's determined when you write the code, not when you run it."

**Junior:** "Why does this matter for performance?"

**Senior:** "Because looking up the chain takes time! Imagine this:"

```javascript
// Slow (deep scope chain):
function level1() {
  return function level2() {
    return function level3() {
      return function level4() {
        // To find 'config', must check 4 scopes!
        console.log(config); // 4 hops!
      };
    };
  };
}

// Fast (shallow scope chain):
function level1() {
  const cfg = config; // Cache in local scope

  return function level4() {
    console.log(cfg); // 1 hop!
  };
}
```

**Junior:** "So shorter chains are faster?"

**Senior:** "Yep! Here's a real-world example:"

```javascript
// ❌ Slow in loops:
const config = { timeout: 5000 };

function processItems(items) {
  return items.map(item => {
    // Each iteration: lookup config (3 hops!)
    return process(item, config.timeout);
  });
}

// ✅ Fast in loops:
function processItems(items) {
  const timeout = config.timeout; // Cache once!

  return items.map(item => {
    // Each iteration: use local variable (0 hops!)
    return process(item, timeout);
  });
}

// If processing 1 million items:
// Slow: 1 million × 3 hops = 3 million lookups!
// Fast: 1 × 3 hops = 3 lookups! (999,997 fewer!)
```

**Junior:** "Got it! So the scope chain is the path JavaScript follows to find variables, from inner to outer, and shorter chains are faster!"

**Senior:** "Perfect! And remember: the chain is determined by WHERE code is WRITTEN (lexical scope), not WHERE it's CALLED (dynamic scope). That's the key difference! 🎯"

</details>

### Common Mistakes

- ❌ **Mistake:** Confusing scope chain with call stack
  ```javascript
  const x = 'global';

  function a() {
    const x = 'a';
    b();
  }

  function b() {
    console.log(x); // 'global' (scope chain), not 'a' (call stack)
  }

  a();
  ```

- ❌ **Mistake:** Expecting scope chain to be dynamic
  ```javascript
  function outer() {
    const name = 'outer';
    inner();
  }

  function inner() {
    console.log(name); // ReferenceError (not in inner's scope chain)
  }

  outer();
  // inner's scope chain: inner → global (fixed at write time)
  ```

- ✅ **Correct:** Understanding lexical (static) scope chain
  ```javascript
  function outer() {
    const name = 'outer';

    function inner() {
      console.log(name); // 'outer' (inner's scope chain includes outer)
    }

    inner();
  }

  outer();
  // inner's scope chain: inner → outer → global
  ```

### Follow-up Questions

- "What's the difference between scope chain and prototype chain?"
- "How does the scope chain affect closure performance?"
- "Why do `with` and `eval` break scope chain optimization?"
- "How can you optimize deep scope chains?"

### Resources

- [MDN: Scope Chain](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [JavaScript.info: Variable Scope and Closure](https://javascript.info/closure)
- [Understanding Scope Chain](https://www.freecodecamp.org/news/javascript-scope-and-scope-chain/)

---

