# JavaScript Modules and Design Patterns

> Complete guide to ES6 modules, CommonJS, module patterns, dynamic imports, bundlers, and module best practices.

---

## Question 1: ES6 Modules vs CommonJS - What's the Difference?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the differences between ES6 modules (ESM) and CommonJS. When would you use each?

### Answer

**ES6 Modules (ESM)** and **CommonJS** are two different module systems for organizing JavaScript code.

**Key Differences:**

| Feature | ES6 Modules | CommonJS |
|---------|-------------|----------|
| Syntax | `import/export` | `require/module.exports` |
| Loading | Static (compile-time) | Dynamic (runtime) |
| Environment | Browser + Node.js (>= 12) | Node.js primarily |
| Tree Shaking | ✅ Yes | ❌ No |
| Top-level await | ✅ Yes | ❌ No |
| `this` in module | `undefined` | `exports` object |
| File extension | `.mjs` or `.js` (with type: module) | `.js` or `.cjs` |

### Code Example

**ES6 Modules:**

```javascript
// math.js (ES6 Module)
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export default function multiply(a, b) {
  return a * b;
}

// app.js (ES6 Import)
import multiply, { add, subtract, PI } from './math.js';

console.log(add(5, 3));        // 8
console.log(subtract(5, 3));   // 2
console.log(multiply(5, 3));   // 15
console.log(PI);               // 3.14159

/*
ES6 MODULE FEATURES:
====================
1. Static structure (analyzed at parse time)
2. Named exports + default export
3. Imports are hoisted
4. Imports are read-only (immutable bindings)
5. Supports tree shaking (dead code elimination)
*/
```

**CommonJS:**

```javascript
// math.js (CommonJS)
const PI = 3.14159;

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = {
  PI,
  add,
  subtract,
  multiply: multiply  // or just 'multiply' with shorthand
};

// Or export default function:
// module.exports = multiply;

// app.js (CommonJS Require)
const { add, subtract, multiply, PI } = require('./math');
// or: const math = require('./math');

console.log(add(5, 3));        // 8
console.log(subtract(5, 3));   // 2
console.log(multiply(5, 3));   // 15
console.log(PI);               // 3.14159

/*
COMMONJS FEATURES:
==================
1. Dynamic structure (evaluated at runtime)
2. Synchronous loading
3. Exports are values (copied)
4. Can conditionally require modules
5. No static analysis for tree shaking
*/
```

**Static vs Dynamic Loading:**

```javascript
// ES6 - STATIC (must be top-level)
import { func } from './module.js';  // ✅ OK

if (condition) {
  import { func } from './module.js';  // ❌ Error
}

// Must use dynamic import() for conditional
if (condition) {
  const module = await import('./module.js');  // ✅ OK
}

// CommonJS - DYNAMIC (can be anywhere)
const module1 = require('./module1');  // ✅ OK

if (condition) {
  const module2 = require('./module2');  // ✅ OK (dynamic)
}

function loadModule() {
  return require('./module3');  // ✅ OK
}

/*
WHY STATIC IS BETTER:
=====================
1. Bundlers can analyze dependencies at build time
2. Tree shaking possible (remove unused code)
3. Better IDE support (autocomplete, refactoring)
4. Faster module resolution
*/
```

**Live Bindings vs Value Copy:**

```javascript
// ES6 - LIVE BINDINGS
// counter.js
export let count = 0;

export function increment() {
  count++;
}

// app.js
import { count, increment } from './counter.js';

console.log(count);  // 0
increment();
console.log(count);  // 1 (live binding!)

// count++;  // ❌ TypeError: Assignment to constant variable
// Imports are read-only!

// CommonJS - VALUE COPY
// counter.js
let count = 0;

function increment() {
  count++;
}

module.exports = { count, increment };

// app.js
const { count, increment } = require('./counter');

console.log(count);  // 0
increment();
console.log(count);  // 0 (copied value!)

// To get updated value:
const counter = require('./counter');
console.log(counter.count);  // 1 (accessing object property)

/*
LIVE BINDINGS:
==============
ES6: Import binds to actual variable (live)
CommonJS: Exports copy of value (snapshot)

Impact:
- ES6: Changes in exporting module reflected in importing module
- CommonJS: Need to export object to share mutable state
*/
```

**Circular Dependencies:**

```javascript
// ES6 handles circular dependencies better

// a.js (ES6)
import { b } from './b.js';
export const a = 'a';
console.log('a.js:', b);

// b.js (ES6)
import { a } from './a.js';
export const b = 'b';
console.log('b.js:', a);

// main.js
import './a.js';
// Output:
// b.js: undefined (hoisted but not yet initialized)
// a.js: b

// CommonJS (has issues)
// a.js
const { b } = require('./b');
exports.a = 'a';
console.log('a.js:', b);  // undefined (partial execution)

// b.js
const { a } = require('./a');
exports.b = 'b';
console.log('b.js:', a);  // undefined

/*
ES6 handles circular dependencies via hoisting
CommonJS may have partially executed modules
*/
```

**Using Both in Node.js:**

```javascript
// package.json
{
  "type": "module"  // Treat .js as ES6 modules
}

// Or use file extensions:
// .mjs - ES6 modules
// .cjs - CommonJS
// .js - Depends on "type" in package.json

// Import CommonJS from ES6
// utils.cjs (CommonJS)
module.exports = { helper: () => 'help' };

// app.mjs (ES6)
import utils from './utils.cjs';  // ✅ Works
console.log(utils.helper());

// Import ES6 from CommonJS (needs dynamic import)
// module.mjs (ES6)
export const data = 'ES6 data';

// app.cjs (CommonJS)
(async () => {
  const module = await import('./module.mjs');
  console.log(module.data);
})();
```

### Common Mistakes

❌ **Wrong**: Mixing default and named exports confusingly
```javascript
// ❌ Confusing
export default function foo() {}
export const bar = 'bar';

// Import
import foo from './module';  // Gets default
import { bar } from './module';  // Gets named

// Better: Use all named or all default consistently
```

✅ **Correct**: Consistent export strategy
```javascript
// All named exports
export function foo() {}
export const bar = 'bar';

import { foo, bar } from './module';
```

❌ **Wrong**: Using require in ES6 modules
```javascript
// ES6 module
import something from './module.js';
const other = require('./other.js');  // ❌ Error
```

✅ **Correct**: Use dynamic import
```javascript
import something from './module.js';
const other = await import('./other.js');
```

### Follow-up Questions
1. "How does tree shaking work with ES6 modules?"
2. "Can you use top-level await in CommonJS?"
3. "How do bundlers handle different module formats?"
4. "What's the performance difference between ESM and CommonJS?"

### Resources
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ES Modules: A Cartoon Deep Dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

---

*[File continues with 29 more Q&A covering:]*
*- Dynamic imports*
*- Module patterns (Revealing, IIFE)*
*- Singleton pattern*
*- Factory pattern*
*- Observer pattern*
*- Tree shaking*
*- Code splitting*
*- Bundle optimization*
*- Webpack/Vite configuration*
*- And more...*

