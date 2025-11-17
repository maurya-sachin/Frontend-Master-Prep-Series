# Variables & Declarations

> **Focus**: Core JavaScript concepts

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

## Question 25: What is strict mode in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain strict mode (`"use strict"`). What does it do and why use it?

### Answer

**Strict mode** is an opt-in mode that enforces stricter parsing and error handling.

1. **What It Does**
   - Eliminates silent errors (throws instead)
   - Fixes mistakes that make optimization difficult
   - Prohibits problematic syntax
   - Disallows future reserved words

2. **Key Changes**
   - No implicit global variables
   - `this` is `undefined` in functions (not global)
   - No duplicate parameters
   - No octal literals
   - Can't delete undeletable properties

3. **How to Enable**
   - File/script level: `"use strict";` at top
   - Function level: `"use strict";` in function
   - Modules: Always strict (no need to declare)

### Code Example

```javascript
// 1. ENABLE STRICT MODE
"use strict";

// Now all code runs in strict mode

// 2. NO IMPLICIT GLOBALS
// ❌ Without strict mode
function sloppy() {
  x = 10; // Creates global variable (bad!)
}

// ✅ With strict mode
function strict() {
  "use strict";
  y = 10; // ReferenceError: y is not defined
}

// 3. THIS IN FUNCTIONS
function showThis() {
  "use strict";
  console.log(this); // undefined in strict mode
  // (window in non-strict)
}

showThis();

// 4. NO DUPLICATE PARAMETERS
// ❌ Allowed in non-strict
function duplicate(a, a, b) {
  return a + b; // Which 'a'?
}

// ✅ Error in strict mode
function duplicateStrict(a, a, b) {
  "use strict";
  // SyntaxError: Duplicate parameter name
}

// 5. CAN'T DELETE UNDELETABLE
"use strict";

delete Object.prototype; // TypeError (can't delete)

var x = 10;
delete x; // SyntaxError (can't delete variables)

// 6. NO OCTAL LITERALS
"use strict";

const num = 0o10; // ✅ OK (ES6 syntax)
const bad = 010;  // ❌ SyntaxError (old octal syntax)

// 7. MODULES ARE ALWAYS STRICT
// No need for "use strict" in modules
export function myFunction() {
  // Already in strict mode!
  x = 10; // ReferenceError
}
```

### Resources

- [MDN: Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)

---

