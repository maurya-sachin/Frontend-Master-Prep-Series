# Scope & Closures

> **Focus**: Core JavaScript concepts

---

## Question 6: What are lexical scope and block scope?

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

## Question 7: What is variable shadowing and illegal shadowing?

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

### Follow-up Questions

- "Why is var shadowing let/const illegal?"
- "How does shadowing relate to closures?"
- "What happens with shadowing in nested functions?"
- "Can function parameters shadow outer variables?"

### Resources

- [MDN: Variable Shadowing](https://developer.mozilla.org/en-US/docs/Glossary/Scope#shadowing)
- [JavaScript.info: Variable Scope](https://javascript.info/closure)

---

## Question 4: What is closure in JavaScript?

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

## Question 5: What is Lexical Environment?

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

### Resources
- [ECMA-262: Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- [JavaScript Visualized: Scope Chain](https://dev.to/lydiahallie/javascript-visualized-scope-chain-13pd)

---

