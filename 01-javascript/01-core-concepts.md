# JavaScript Core Concepts

> **Fundamentals every JavaScript developer must know - primitives, types, hoisting, scope, closures, and more**

---

## Question 1: What are primitive and non-primitive data types in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 3-5 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain the difference between primitive and non-primitive (reference) data types in JavaScript. List all primitive types.

### Answer

JavaScript has **7 primitive types** and **1 reference type** (objects).

1. **Primitives are Immutable**
   - Stored directly in the variable
   - Cannot be altered (any operation creates a new value)
   - Compared by value
   - Stored in stack memory

2. **Primitive Types (7)**
   - `string` - Text data ("hello")
   - `number` - Numeric data (42, 3.14)
   - `bigint` - Large integers (9007199254740991n)
   - `boolean` - true/false
   - `undefined` - Variable declared but not assigned
   - `null` - Intentional absence of value
   - `symbol` - Unique identifier (Symbol('id'))

3. **Reference Types are Mutable**
   - Objects, Arrays, Functions, Dates, RegExp, etc.
   - Stored as reference/pointer
   - Compared by reference (memory address)
   - Stored in heap memory

### Code Example

```javascript
// Primitives - stored by value
let a = 10;
let b = a; // Copy of value
b = 20;
console.log(a); // 10 (unchanged)
console.log(b); // 20

// Reference types - stored by reference
let obj1 = { name: "John" };
let obj2 = obj1; // Copy of reference (same object)
obj2.name = "Jane";
console.log(obj1.name); // "Jane" (changed!)
console.log(obj2.name); // "Jane"

// Primitive immutability
let str = "hello";
str[0] = "H"; // Doesn't work (immutable)
console.log(str); // "hello" (unchanged)

// typeof operator
console.log(typeof 42);           // "number"
console.log(typeof "text");       // "string"
console.log(typeof true);         // "boolean"
console.log(typeof undefined);    // "undefined"
console.log(typeof null);         // "object" (historical bug)
console.log(typeof Symbol('id')); // "symbol"
console.log(typeof 123n);         // "bigint"
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"
console.log(typeof function(){}); // "function"
```

### Common Mistakes

- ❌ **Mistake:** Thinking `typeof null` returns "null"
  ```javascript
  console.log(typeof null); // "object" (not "null"!)
  ```
  - This is a historical bug in JavaScript that can't be fixed without breaking existing code

- ❌ **Mistake:** Assuming arrays have their own type
  ```javascript
  console.log(typeof []); // "object" (not "array")
  // Use Array.isArray() instead
  console.log(Array.isArray([])); // true
  ```

- ✅ **Correct:** Understanding value vs reference
  ```javascript
  // Always be aware of reference vs value semantics
  const original = { count: 0 };
  const copy = { ...original }; // Shallow copy
  copy.count = 1;
  console.log(original.count); // 0 (separate object)
  ```

### Follow-up Questions

- "What is the difference between `null` and `undefined`?"
- "Why does `typeof null` return 'object'?"
- "How would you check if a variable is an array?"
- "What is the difference between shallow and deep copy?"
- "Can you mutate a const object? Why or why not?"

### Resources

- [MDN: JavaScript Data Types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [JavaScript.info: Data Types](https://javascript.info/types)

---

## Question 2: What is the difference between var, let, and const?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
Explain the differences between `var`, `let`, and `const` in terms of scope, hoisting, and mutability.

### Answer

The three keywords differ in **scope**, **hoisting behavior**, and **reassignment**.

1. **Scope**
   - `var`: Function-scoped (or globally scoped)
   - `let`: Block-scoped
   - `const`: Block-scoped

2. **Hoisting**
   - `var`: Hoisted and initialized with `undefined`
   - `let`: Hoisted but NOT initialized (TDZ - Temporal Dead Zone)
   - `const`: Hoisted but NOT initialized (TDZ)

3. **Reassignment**
   - `var`: Can be reassigned
   - `let`: Can be reassigned
   - `const`: Cannot be reassigned (but objects can be mutated)

4. **Redeclaration**
   - `var`: Can be redeclared in same scope
   - `let`: Cannot be redeclared in same scope
   - `const`: Cannot be redeclared in same scope

### Code Example

```javascript
// 1. SCOPE DIFFERENCE
function scopeTest() {
  if (true) {
    var x = 10;  // Function-scoped
    let y = 20;  // Block-scoped
    const z = 30; // Block-scoped
  }
  console.log(x); // 10 (accessible)
  console.log(y); // ReferenceError: y is not defined
  console.log(z); // ReferenceError: z is not defined
}

// 2. HOISTING DIFFERENCE
console.log(a); // undefined (var is hoisted)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
var a = 5;
let b = 10;

// 3. REASSIGNMENT
var varVar = 1;
varVar = 2; // ✅ OK

let letVar = 1;
letVar = 2; // ✅ OK

const constVar = 1;
constVar = 2; // ❌ TypeError: Assignment to constant variable

// 4. CONST WITH OBJECTS (Mutable)
const obj = { name: "John" };
obj.name = "Jane"; // ✅ OK (mutating object)
obj.age = 30;      // ✅ OK (adding property)
obj = {};          // ❌ TypeError: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4);       // ✅ OK (mutating array)
arr = [];          // ❌ TypeError: Assignment to constant variable

// 5. REDECLARATION
var x = 1;
var x = 2; // ✅ OK (var allows redeclaration)

let y = 1;
let y = 2; // ❌ SyntaxError: Identifier 'y' has already been declared

// 6. LOOP BEHAVIOR
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (var is function-scoped)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// Output: 0, 1, 2 (let creates new binding each iteration)
```

### Common Mistakes

- ❌ **Mistake:** Using `var` in modern JavaScript
  ```javascript
  // Avoid var - it has confusing scoping rules
  for (var i = 0; i < 3; i++) { /* ... */ }
  console.log(i); // 3 (leaked outside loop!)
  ```

- ❌ **Mistake:** Thinking `const` makes objects immutable
  ```javascript
  const obj = { count: 0 };
  obj.count++; // This works! const prevents reassignment, not mutation
  ```

- ✅ **Correct:** Use `let` for variables that change, `const` for constants
  ```javascript
  const PI = 3.14159; // Never changes
  let counter = 0;    // Will change

  // For objects/arrays that will be mutated, use const
  const users = [];
  users.push({ name: "John" }); // OK
  ```

### Follow-up Questions

- "What is the Temporal Dead Zone (TDZ)?"
- "Why does the var loop problem occur with setTimeout?"
- "How would you make an object truly immutable?"
- "When would you use let vs const?"
- "What happens if you use a variable before declaring it with let?"

### Resources

- [MDN: var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [JavaScript.info: Variables](https://javascript.info/variables)

---

## Question 3: What is hoisting in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain what hoisting is in JavaScript and how it affects variable and function declarations.

### Answer

Hoisting is JavaScript's behavior of **moving declarations to the top** of their scope during the compilation phase.

1. **What Gets Hoisted**
   - Variable declarations (`var`, `let`, `const`)
   - Function declarations
   - Class declarations

2. **How Hoisting Works**
   - Only the declaration is hoisted, not the initialization
   - Happens during the creation phase of execution context
   - Code doesn't physically move - it's conceptual

3. **var Hoisting**
   - Hoisted and initialized with `undefined`
   - Can be accessed before declaration (returns `undefined`)

4. **let/const Hoisting**
   - Hoisted but NOT initialized
   - Accessing before declaration causes ReferenceError (TDZ)

5. **Function Hoisting**
   - Function declarations are fully hoisted (declaration + definition)
   - Function expressions are not hoisted

### Code Example

```javascript
// 1. VAR HOISTING
console.log(myVar); // undefined (not ReferenceError!)
var myVar = 5;
console.log(myVar); // 5

// How JavaScript interprets it:
var myVar; // Declaration hoisted
console.log(myVar); // undefined
myVar = 5; // Assignment stays in place

// 2. LET/CONST HOISTING (TDZ)
console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization
let myLet = 10;

console.log(myConst); // ReferenceError
const myConst = 20;

// 3. FUNCTION DECLARATION HOISTING
sayHello(); // "Hello!" (works!)

function sayHello() {
  console.log("Hello!");
}

// Function declaration is fully hoisted

// 4. FUNCTION EXPRESSION (NOT HOISTED)
sayHi(); // TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// Only the var declaration is hoisted, not the function

// 5. CLASS HOISTING (TDZ)
const instance = new MyClass(); // ReferenceError

class MyClass {
  constructor() {
    this.value = 42;
  }
}

// 6. HOISTING IN DIFFERENT SCOPES
function outerFunc() {
  console.log(innerVar); // undefined (hoisted in function scope)
  var innerVar = 100;

  if (true) {
    console.log(blockVar); // ReferenceError (TDZ)
    let blockVar = 200;
  }
}

// 7. HOISTING WITH SAME NAME
console.log(typeof myFunc); // "function" (function hoisted first)

var myFunc = 5;

function myFunc() {
  return "I'm a function";
}

console.log(typeof myFunc); // "number" (variable assignment executed)
```

### Common Mistakes

- ❌ **Mistake:** Relying on hoisting behavior
  ```javascript
  // Bad practice - confusing and error-prone
  x = 5;
  console.log(x);
  var x;
  ```

- ❌ **Mistake:** Thinking let/const are not hoisted
  ```javascript
  // They ARE hoisted, but not initialized (TDZ)
  console.log(x); // ReferenceError (not undefined!)
  let x = 5;
  ```

- ✅ **Correct:** Declare variables at the top
  ```javascript
  // Clear and predictable
  const PI = 3.14159;
  let counter = 0;

  // Use them
  console.log(PI);
  counter++;
  ```

### Follow-up Questions

- "What is the Temporal Dead Zone (TDZ)?"
- "Why does function declaration hoist but function expression doesn't?"
- "What happens when you have a function and variable with the same name?"
- "How does hoisting work with nested functions?"
- "Why was hoisting designed this way?"

### Resources

- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [JavaScript.info: Variable Scope](https://javascript.info/closure)
- [Understanding Hoisting in JavaScript](https://www.freecodecamp.org/news/what-is-hoisting-in-javascript/)

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

## Question 5: What is the Temporal Dead Zone (TDZ)?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the Temporal Dead Zone (TDZ) in JavaScript and how it relates to let and const declarations.

### Answer

The Temporal Dead Zone (TDZ) is the period between entering a scope and the variable being declared during which the variable cannot be accessed.

1. **What is TDZ**
   - Time from start of scope until variable declaration
   - Applies to `let`, `const`, and `class` declarations
   - Accessing variable in TDZ throws ReferenceError

2. **Why TDZ Exists**
   - Catch errors earlier (accessing uninitialized variables)
   - Make `const` behavior more consistent
   - Avoid confusing behavior of `var`

3. **How It Works**
   - Variables are hoisted but not initialized
   - Remain in TDZ until declaration line is executed
   - After declaration, variables become accessible

4. **Does NOT Apply To**
   - `var` declarations (initialized with `undefined`)
   - Function declarations (fully hoisted)
   - Function parameters

### Code Example

```javascript
// 1. BASIC TDZ EXAMPLE
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5;

// Timeline:
// [ START OF SCOPE ]
// |-- TDZ starts
// |-- console.log(x) <- ReferenceError!
// |-- TDZ ends
// let x = 5;
// |-- Variable is now accessible

// 2. VAR HAS NO TDZ
console.log(y); // undefined (no TDZ)
var y = 10;

// 3. TDZ IN BLOCK SCOPE
{
  // TDZ starts
  console.log(a); // ReferenceError
  console.log(b); // ReferenceError

  let a = 1;
  // a's TDZ ends

  const b = 2;
  // b's TDZ ends

  console.log(a); // 1 (OK)
  console.log(b); // 2 (OK)
}

// 4. TYPEOF IN TDZ
console.log(typeof undeclaredVar); // "undefined" (OK)
console.log(typeof x); // ReferenceError! (x is in TDZ)
let x = 5;

// 5. FUNCTION PARAMETERS AND TDZ
function example(a = b, b = 2) {
  return [a, b];
}

example(); // ReferenceError: Cannot access 'b' before initialization
// b is in TDZ when a tries to use it

// Correct order:
function example2(a = 2, b = a) {
  return [a, b];
}

example2(); // [2, 2] (OK - a is initialized before b uses it)

// 6. TDZ IN NESTED SCOPES
let x = 'outer';

function test() {
  // TDZ starts for inner x
  console.log(x); // ReferenceError (looking for inner x, which is in TDZ)
  let x = 'inner';
  // TDZ ends
}

test();

// 7. CLASS AND TDZ
const instance = new MyClass(); // ReferenceError
class MyClass {}

// 8. TDZ WITH DESTRUCTURING
const { prop } = obj; // ReferenceError if obj is in TDZ
let obj = { prop: 'value' };

// 9. TEMPORAL ASPECT OF TDZ
function logValue() {
  console.log(value); // ReferenceError
}

let value = 42;

// logValue(); // Would throw error even though declaration is "before" call
// because execution happens before declaration during call

// 10. TDZ IN SWITCH STATEMENTS
switch (true) {
  case true:
    console.log(x); // ReferenceError
    let x = 1;
    break;
}
```

### Common Mistakes

- ❌ **Mistake:** Thinking let/const are not hoisted
  ```javascript
  {
    // x IS hoisted, but in TDZ
    console.log(x); // ReferenceError (not undefined!)
    let x = 5;
  }
  ```

- ❌ **Mistake:** Using typeof to check TDZ variables
  ```javascript
  console.log(typeof x); // ReferenceError!
  let x = 5;

  // typeof with undeclared variables is OK:
  console.log(typeof completelyUndeclared); // "undefined"
  ```

- ✅ **Correct:** Declare variables at the top of scope
  ```javascript
  function example() {
    // Declare all variables at top
    let x = 1;
    let y = 2;
    const z = 3;

    // Use them
    console.log(x, y, z); // No TDZ issues
  }
  ```

### Follow-up Questions

- "Why does `var` not have a TDZ?"
- "How does TDZ help prevent bugs?"
- "What happens if you try to use typeof on a TDZ variable?"
- "How does TDZ work with default parameters?"
- "Can you explain the difference between hoisting and TDZ?"

### Resources

- [MDN: Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [JavaScript.info: Variables](https://javascript.info/variables)
- [Understanding the Temporal Dead Zone](https://www.freecodecamp.org/news/what-is-the-temporal-dead-zone/)

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

## Question 8: What are higher-order functions in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
What are higher-order functions? Provide examples of built-in higher-order functions and explain how to create custom ones.

### Answer

A **higher-order function** is a function that either:
1. Takes one or more functions as arguments, OR
2. Returns a function as its result

Higher-order functions are a fundamental concept in functional programming and are widely used in JavaScript.

1. **Why Higher-Order Functions**
   - Code reusability
   - Abstraction
   - Function composition
   - More declarative code

2. **Built-in Higher-Order Functions**
   - Array methods: `map()`, `filter()`, `reduce()`, `forEach()`, `find()`, `some()`, `every()`
   - `setTimeout()`, `setInterval()`
   - Event listeners

3. **Benefits**
   - Separate concerns (what vs how)
   - Easier to test
   - More maintainable
   - Enables functional programming patterns

### Code Example

```javascript
// 1. FUNCTIONS THAT TAKE FUNCTIONS AS ARGUMENTS

// Array.map() - transforms array
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function(num) {
  return num * 2;
});
console.log(doubled); // [2, 4, 6, 8, 10]

// Array.filter() - filters array
const evens = numbers.filter(function(num) {
  return num % 2 === 0;
});
console.log(evens); // [2, 4]

// Array.reduce() - reduces to single value
const sum = numbers.reduce(function(acc, num) {
  return acc + num;
}, 0);
console.log(sum); // 15

// 2. FUNCTIONS THAT RETURN FUNCTIONS

// Function factory
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 3. CUSTOM HIGHER-ORDER FUNCTION

// Custom forEach implementation
function customForEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
}

customForEach([1, 2, 3], function(item, index) {
  console.log(`Index ${index}: ${item}`);
});

// 4. FUNCTION COMPOSITION

function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;

const addOneThenDouble = compose(multiplyByTwo, addOne);
console.log(addOneThenDouble(5)); // 12 (5 + 1 = 6, 6 * 2 = 12)

// 5. PRACTICAL EXAMPLE - LOGGER WRAPPER

function withLogging(fn) {
  return function(...args) {
    console.log(`Calling with args:`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

const add = (a, b) => a + b;
const addWithLogging = withLogging(add);

addWithLogging(3, 4);
// Calling with args: [3, 4]
// Result: 7
// Returns: 7

// 6. CURRYING (HIGHER-ORDER PATTERN)

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

const sum3 = (a, b, c) => a + b + c;
const curriedSum = curry(sum3);

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6

// 7. PRACTICAL - RETRY LOGIC

function retry(fn, maxAttempts) {
  return async function(...args) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
  };
}

const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const fetchWithRetry = retry(fetchData, 3);

// 8. MEMOIZATION (HIGHER-ORDER PATTERN)

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Returning cached result');
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveOperation = (n) => {
  console.log('Computing...');
  return n * n;
};

const memoized = memoize(expensiveOperation);

console.log(memoized(5)); // Computing... 25
console.log(memoized(5)); // Returning cached result 25
```

### Common Mistakes

- ❌ **Mistake:** Not returning value from callback
  ```javascript
  const numbers = [1, 2, 3];
  const doubled = numbers.map(num => {
    num * 2; // Missing return!
  });
  console.log(doubled); // [undefined, undefined, undefined]
  ```

- ❌ **Mistake:** Breaking closure scope
  ```javascript
  function createFunctions() {
    const funcs = [];
    for (var i = 0; i < 3; i++) {
      funcs.push(function() { return i; }); // All reference same i
    }
    return funcs;
  }

  const functions = createFunctions();
  console.log(functions[0]()); // 3 (not 0!)
  ```

- ✅ **Correct:** Use arrow functions and proper closures
  ```javascript
  const numbers = [1, 2, 3];
  const doubled = numbers.map(num => num * 2); // Implicit return
  console.log(doubled); // [2, 4, 6]
  ```

### Follow-up Questions

- "What is the difference between map() and forEach()?"
- "How does reduce() work internally?"
- "What is function currying?"
- "Explain the concept of function composition"
- "How do higher-order functions help with code reusability?"

### Resources

- [MDN: Higher-Order Functions](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function)
- [JavaScript.info: Function Object](https://javascript.info/function-object)
- [Eloquent JavaScript: Higher-Order Functions](https://eloquentjavascript.net/05_higher_order.html)

---

## Question 9: What is a pure function?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain what a pure function is in JavaScript. Why are pure functions important and how do they differ from impure functions?

### Answer

A **pure function** is a function that:
1. Always returns the same output for the same input (deterministic)
2. Has no side effects (doesn't modify external state)

Pure functions are a key concept in functional programming.

1. **Characteristics of Pure Functions**
   - Deterministic (same input = same output)
   - No side effects
   - No external dependencies
   - Easier to test
   - Predictable behavior

2. **Side Effects (What Pure Functions Avoid)**
   - Modifying global variables
   - Modifying input parameters
   - Making HTTP requests
   - Writing to database
   - Logging to console
   - Modifying DOM
   - Getting current time

3. **Benefits of Pure Functions**
   - Easier to test (no mocking needed)
   - Easier to debug
   - Cacheable (memoization)
   - Parallelizable
   - Easier to reason about

### Code Example

```javascript
// 1. PURE FUNCTIONS - Same input = Same output, No side effects

// Pure: Simple calculation
function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // Always 5
console.log(add(2, 3)); // Always 5

// Pure: Array transformation (doesn't modify input)
function double(numbers) {
  return numbers.map(n => n * 2);
}

const nums = [1, 2, 3];
console.log(double(nums)); // [2, 4, 6]
console.log(nums); // [1, 2, 3] (unchanged)

// Pure: String manipulation
function capitalize(str) {
  return str.toUpperCase();
}

// 2. IMPURE FUNCTIONS - Side effects or non-deterministic

// Impure: Modifies external state
let counter = 0;

function incrementCounter() {
  counter++; // Side effect: modifying global variable
  return counter;
}

console.log(incrementCounter()); // 1
console.log(incrementCounter()); // 2 (different output!)

// Impure: Non-deterministic (depends on external state)
function getCurrentTime() {
  return new Date().getTime(); // Different each call
}

// Impure: Modifies input parameter
function addToArray(arr, item) {
  arr.push(item); // Mutates input!
  return arr;
}

// Impure: Console logging
function calculateAndLog(a, b) {
  const result = a + b;
  console.log(result); // Side effect: I/O
  return result;
}

// 3. CONVERTING IMPURE TO PURE

// Impure version
let total = 0;

function addToTotal(value) {
  total += value; // Modifies external state
  return total;
}

// Pure version
function addToValue(currentTotal, value) {
  return currentTotal + value; // Returns new value, doesn't modify
}

let total2 = 0;
total2 = addToValue(total2, 5); // 5
total2 = addToValue(total2, 10); // 15

// 4. PURE ARRAY OPERATIONS

// Pure: map, filter, reduce
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2); // Pure: returns new array
const evens = numbers.filter(n => n % 2 === 0); // Pure
const sum = numbers.reduce((acc, n) => acc + n, 0); // Pure

console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)

// Impure: push, pop, splice (modify original)
const arr = [1, 2, 3];
arr.push(4); // Impure: modifies arr

// 5. PURE OBJECT OPERATIONS

// Impure: mutates object
function updateUserAge(user, age) {
  user.age = age; // Mutates input!
  return user;
}

// Pure: returns new object
function setUserAge(user, age) {
  return { ...user, age }; // New object
}

const user = { name: 'John', age: 25 };
const updated = setUserAge(user, 26);

console.log(user.age); // 25 (unchanged)
console.log(updated.age); // 26

// 6. TESTING PURE VS IMPURE

// Pure function: Easy to test
function calculateDiscount(price, discountPercent) {
  return price * (1 - discountPercent / 100);
}

// Test (no setup needed)
console.assert(calculateDiscount(100, 10) === 90);
console.assert(calculateDiscount(100, 10) === 90); // Always same result

// Impure function: Harder to test
let tax = 0.1;

function calculateTotal(price) {
  return price * (1 + tax); // Depends on external variable
}

// Test (need to control external state)
tax = 0.1;
console.assert(calculateTotal(100) === 110); // Fragile!

// 7. MEMOIZATION WITH PURE FUNCTIONS

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Only works reliably with pure functions
const fibonacci = memoize(function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

// 8. PURE FUNCTIONS IN REACT

// Pure component (same props = same output)
function UserCard({ name, age }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

// Impure (uses external state)
let theme = 'dark';

function UserCardImpure({ name, age }) {
  return (
    <div className={theme}> {/* Depends on external state */}
      <h2>{name}</h2>
    </div>
  );
}
```

### Common Mistakes

- ❌ **Mistake:** Mutating input parameters
  ```javascript
  function addItem(arr, item) {
    arr.push(item); // Impure: mutates input!
    return arr;
  }
  ```

- ❌ **Mistake:** Depending on external state
  ```javascript
  let multiplier = 2;

  function multiply(n) {
    return n * multiplier; // Impure: depends on external variable
  }
  ```

- ✅ **Correct:** Return new values, don't mutate
  ```javascript
  function addItem(arr, item) {
    return [...arr, item]; // Pure: returns new array
  }

  function multiply(n, multiplier) {
    return n * multiplier; // Pure: all inputs are parameters
  }
  ```

### Follow-up Questions

- "What are side effects in JavaScript?"
- "How do pure functions relate to Redux reducers?"
- "Can async functions be pure?"
- "What is referential transparency?"
- "How do pure functions help with testing?"

### Resources

- [MDN: Pure Functions](https://developer.mozilla.org/en-US/docs/Glossary/Pure_function)
- [JavaScript.info: Function Purity](https://javascript.info/function-basics)
- [Understanding Pure Functions](https://www.freecodecamp.org/news/what-is-a-pure-function-in-javascript-acb887375dfe/)

---

## Question 10: What is memoization? Implement a custom memoize() function.

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb

### Question
Explain memoization in JavaScript. Implement a custom `memoize()` function that caches function results.

### Answer

**Memoization** is an optimization technique that caches the results of expensive function calls and returns the cached result when the same inputs occur again.

1. **How Memoization Works**
   - Store function results in a cache (usually Map or object)
   - On function call, check if result exists in cache
   - If cached, return cached result (fast)
   - If not cached, compute result, store in cache, return

2. **When to Use Memoization**
   - Expensive computations (factorial, fibonacci)
   - Recursive functions
   - API calls with same parameters
   - Pure functions only (same input = same output)

3. **Benefits**
   - Improved performance (avoid redundant calculations)
   - Reduced API calls
   - Better user experience (faster responses)

4. **Trade-offs**
   - Memory usage (cache stores results)
   - Only works with pure functions
   - Cache invalidation can be complex

### Code Example

```javascript
// 1. BASIC MEMOIZATION IMPLEMENTATION

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Cache hit!');
      return cache.get(key);
    }

    console.log('Computing...');
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Test basic memoization
function expensiveSum(a, b) {
  // Simulate expensive operation
  for (let i = 0; i < 1000000000; i++) {}
  return a + b;
}

const memoizedSum = memoize(expensiveSum);

console.time('First call');
console.log(memoizedSum(5, 10)); // Computing... 15
console.timeEnd('First call'); // ~1000ms

console.time('Second call');
console.log(memoizedSum(5, 10)); // Cache hit! 15
console.timeEnd('Second call'); // ~0ms

// 2. MEMOIZED FIBONACCI (CLASSIC EXAMPLE)

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.time('Fib without memoization');
console.log(fibonacci(40)); // Very slow!
console.timeEnd('Fib without memoization'); // ~1000ms+

console.time('Fib with memoization');
console.log(memoizedFib(40)); // Much faster!
console.timeEnd('Fib with memoization'); // ~10ms

// 3. ADVANCED MEMOIZATION - WITH CUSTOM KEY FUNCTION

function memoizeWithKeyFn(fn, keyFn) {
  const cache = new Map();

  return function(...args) {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Custom key function for objects
const getUser = ({ id }) => {
  console.log(`Fetching user ${id}...`);
  return { id, name: `User ${id}`, email: `user${id}@example.com` };
};

const memoizedGetUser = memoizeWithKeyFn(
  getUser,
  (user) => user.id // Custom key: just use id
);

console.log(memoizedGetUser({ id: 1 })); // Fetching user 1...
console.log(memoizedGetUser({ id: 1 })); // (cached, no log)

// 4. MEMOIZATION WITH CACHE SIZE LIMIT (LRU)

function memoizeWithLimit(fn, limit = 100) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn.apply(this, args);

    // Remove oldest if limit reached
    if (cache.size >= limit) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
}

// 5. MEMOIZATION WITH EXPIRATION (TTL)

function memoizeWithTTL(fn, ttl = 5000) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log('Cache hit (not expired)');
      return cached.value;
    }

    console.log('Computing or cache expired...');
    const result = fn.apply(this, args);

    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  };
}

// Test TTL memoization
function getCurrentData(id) {
  return { id, timestamp: Date.now() };
}

const memoizedData = memoizeWithTTL(getCurrentData, 2000); // 2s TTL

console.log(memoizedData(1)); // Computing...
setTimeout(() => {
  console.log(memoizedData(1)); // Cache hit (not expired)
}, 1000);

setTimeout(() => {
  console.log(memoizedData(1)); // Computing or cache expired...
}, 3000);

// 6. MEMOIZATION CLASS-BASED

class Memoizer {
  constructor(fn) {
    this.fn = fn;
    this.cache = new Map();
  }

  call(...args) {
    const key = JSON.stringify(args);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = this.fn(...args);
    this.cache.set(key, result);
    return result;
  }

  clear() {
    this.cache.clear();
  }

  has(...args) {
    return this.cache.has(JSON.stringify(args));
  }

  delete(...args) {
    this.cache.delete(JSON.stringify(args));
  }
}

const sumMemoizer = new Memoizer((a, b) => a + b);
console.log(sumMemoizer.call(5, 10)); // 15
console.log(sumMemoizer.has(5, 10)); // true
sumMemoizer.clear();
console.log(sumMemoizer.has(5, 10)); // false

// 7. REACT USEMEMO HOOK PATTERN

// Simulated React useMemo behavior
function useMemo(factory, deps) {
  const cache = useMemo.cache || (useMemo.cache = new Map());
  const key = JSON.stringify(deps);

  if (cache.has(key)) {
    return cache.get(key);
  }

  const value = factory();
  cache.set(key, value);
  return value;
}

// Usage
function ExpensiveComponent({ items }) {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a - b),
    [items]
  );

  return sortedItems;
}

// 8. PRACTICAL - API CALL MEMOIZATION

async function fetchUser(userId) {
  console.log(`Fetching user ${userId} from API...`);
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
}

const memoizedFetchUser = memoizeWithTTL(fetchUser, 60000); // 1 min cache

// First call: hits API
await memoizedFetchUser(123);

// Second call within 1 min: returns cached result
await memoizedFetchUser(123);

// 9. DEBUGGING MEMOIZED FUNCTIONS

function memoizeWithStats(fn) {
  const cache = new Map();
  const stats = { hits: 0, misses: 0 };

  const memoized = function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      stats.hits++;
      return cache.get(key);
    }

    stats.misses++;
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.stats = () => ({ ...stats });
  memoized.clear = () => cache.clear();

  return memoized;
}

const computeWithStats = memoizeWithStats((n) => n * n);

computeWithStats(5);
computeWithStats(5);
computeWithStats(10);

console.log(computeWithStats.stats()); // { hits: 1, misses: 2 }
```

### Common Mistakes

- ❌ **Mistake:** Memoizing impure functions
  ```javascript
  // Won't work correctly - result depends on external state
  let multiplier = 2;

  const compute = memoize((n) => n * multiplier);

  console.log(compute(5)); // 10
  multiplier = 3;
  console.log(compute(5)); // 10 (cached, but should be 15!)
  ```

- ❌ **Mistake:** Memory leaks from unbounded cache
  ```javascript
  const memoized = memoize(expensiveFunction);

  // Cache grows infinitely!
  for (let i = 0; i < 1000000; i++) {
    memoized(i);
  }
  ```

- ✅ **Correct:** Use memoization with pure functions and cache limits
  ```javascript
  const memoized = memoizeWithLimit(pureFn, 100);
  ```

### Follow-up Questions

- "When should you NOT use memoization?"
- "How does memoization relate to dynamic programming?"
- "What is the difference between memoization and caching?"
- "How would you implement WeakMap-based memoization?"
- "How does React's useMemo hook work?"

### Resources

- [MDN: Memoization](https://developer.mozilla.org/en-US/docs/Glossary/Memoization)
- [JavaScript.info: Decorators and Forwarding](https://javascript.info/call-apply-decorators)
- [Understanding Memoization](https://www.freecodecamp.org/news/memoization-in-javascript-and-react/)

---

[← Back to JavaScript README](./README.md) | [Next: Execution Context →](./02-async-javascript.md)

**Progress:** 10 of 20 core concept questions completed
