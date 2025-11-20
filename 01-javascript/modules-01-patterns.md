# Modules & Design Patterns

> **Focus**: JavaScript fundamentals and advanced concepts

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

<details>
<summary><strong>🔍 Deep Dive: Module Loading Internals</strong></summary>

**ES6 Modules (3-phase process):**
1. **Construction**: Parse imports, build module graph
2. **Instantiation**: Allocate memory, link imports/exports
3. **Evaluation**: Run code, assign values

**CommonJS** (single-phase):
- Immediate execution + caching

**V8 Optimization**: ESM imports are live bindings (reference), CommonJS exports are value copies. ESM enables better tree shaking because static analysis knows exactly what's used.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Bundle size increased from 150KB to 2.3MB after adding moment.js library.

**Cause:** CommonJS doesn't support tree shaking. Importing one function pulls entire library.

```javascript
// ❌ CommonJS - imports ALL of moment (2.3MB)
const moment = require('moment');
const formatted = moment().format('YYYY-MM-DD');
```

**Solution:** Switch to ESM-compatible library or use dynamic imports:
```javascript
// ✅ ES6 - only imports what you need
import { format } from 'date-fns';
const formatted = format(new Date(), 'yyyy-MM-dd');
// Bundle: 15KB (93% smaller)
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| When to use ESM | When to use CommonJS |
|-----------------|----------------------|
| Modern projects | Legacy Node.js (<12) |
| Browser targets | Dynamic requires needed |
| Tree shaking critical | Conditional module loading |
| TypeScript projects | Quick scripts/prototypes |

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**ESM** = Restaurant menu you pre-order from (they know exactly what to prepare)
**CommonJS** = Buffet (everything made, you take what you want, rest wasted)

ESM analyzes imports before running → bundlers remove unused code (tree shaking)
CommonJS runs immediately → bundler can't tell what's used → includes everything

</details>

### Resources
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ES Modules: A Cartoon Deep Dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

---

## Question 2: Dynamic Import - How and When to Use It?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Netflix, Airbnb

### Question
Explain dynamic imports in JavaScript. When should you use them and what are the benefits?

### Answer

**Dynamic Import** allows you to load ES6 modules asynchronously at runtime using the `import()` function (returns a Promise).

**Key Points:**
1. **Syntax**: `import()` is a function-like expression that returns a Promise
2. **Code Splitting**: Enables splitting code into smaller chunks loaded on-demand
3. **Conditional Loading**: Load modules based on runtime conditions
4. **Performance**: Reduces initial bundle size, faster page loads
5. **Top-level await**: Can use await with dynamic imports in ES modules

### Code Example

```javascript
// 1. BASIC DYNAMIC IMPORT
// ✅ Load module when needed
button.addEventListener('click', async () => {
  const module = await import('./heavy-chart-library.js');
  module.renderChart(data);
});

// ❌ Static import loads immediately (slower initial load)
import { renderChart } from './heavy-chart-library.js';
button.addEventListener('click', () => renderChart(data));

// 2. CONDITIONAL MODULE LOADING
async function loadTranslations(locale) {
  let translations;

  if (locale === 'es') {
    translations = await import('./translations/es.js');
  } else if (locale === 'fr') {
    translations = await import('./translations/fr.js');
  } else {
    translations = await import('./translations/en.js');
  }

  return translations.default;
}

// Usage
const t = await loadTranslations('es');
console.log(t.greeting); // "Hola"

// 3. FEATURE DETECTION & POLYFILLS
async function loadPolyfills() {
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }

  if (!window.fetch) {
    await import('whatwg-fetch');
  }
}

// 4. ROUTE-BASED CODE SPLITTING (React Router example)
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.jsx')
  },
  {
    path: '/profile',
    component: () => import('./pages/Profile.jsx')
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings.jsx')
  }
];

// 5. LAZY LOADING IMAGES
async function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');

  const { default: LazyLoad } = await import('vanilla-lazyload');

  new LazyLoad({
    elements_selector: 'img[data-src]'
  });
}

// 6. ERROR HANDLING
async function safeImport(modulePath) {
  try {
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error);
    // Fallback strategy
    return import('./fallback-module.js');
  }
}

// 7. PARALLEL DYNAMIC IMPORTS
async function loadMultipleModules() {
  const [
    { default: Chart },
    { default: Table },
    { default: Map }
  ] = await Promise.all([
    import('./Chart.js'),
    import('./Table.js'),
    import('./Map.js')
  ]);

  return { Chart, Table, Map };
}

// 8. PRELOADING (hint to browser)
// Add to <head>
// <link rel="modulepreload" href="/heavy-module.js">

// Then import when needed
const module = await import('./heavy-module.js'); // Already preloaded!

// 9. DYNAMIC IMPORT WITH DESTRUCTURING
const { helper, util, formatter } = await import('./utils.js');

// 10. IMPORT WITH FALLBACK
async function importWithFallback(primaryPath, fallbackPath) {
  try {
    return await import(primaryPath);
  } catch {
    return await import(fallbackPath);
  }
}

// Usage
const module = await importWithFallback(
  './cdn-module.js',
  './local-module.js'
);

// 11. VITE/WEBPACK GLOB IMPORTS (build-time)
// Vite
const modules = import.meta.glob('./modules/*.js');
// Returns: { './modules/a.js': () => import('./modules/a.js'), ... }

for (const path in modules) {
  modules[path]().then(mod => console.log(mod));
}

// 12. DYNAMIC IMPORT IN NODE.JS
// ES module (Node >= 12)
const config = await import('./config.json', {
  assert: { type: 'json' }
});

// 13. REACT LAZY LOADING
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 14. ANALYTICS TRACKING (load after page interactive)
window.addEventListener('load', async () => {
  const { initAnalytics } = await import('./analytics.js');
  initAnalytics();
});

// 15. A/B TESTING
async function loadExperiment(variant) {
  if (variant === 'A') {
    return import('./experiments/variant-a.js');
  } else {
    return import('./experiments/variant-b.js');
  }
}
```

### Common Mistakes

❌ **Wrong**: Not handling Promise rejection
```javascript
const module = await import('./module.js'); // May crash app
```

✅ **Correct**: Always use try-catch
```javascript
try {
  const module = await import('./module.js');
} catch (error) {
  console.error('Module load failed:', error);
}
```

❌ **Wrong**: Using dynamic import for critical above-fold code
```javascript
// Header component (critical!)
const Header = await import('./Header.js'); // ❌ Slower
```

✅ **Correct**: Static import for critical path
```javascript
import Header from './Header.js'; // ✅ Bundled, immediate
```

### Follow-up Questions
1. "How does dynamic import affect bundle size?"
2. "Can you use dynamic import in CommonJS?"
3. "What's the difference between import() and require()?"
4. "How do bundlers handle dynamic imports?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**How Webpack handles `import()`:**
- Creates separate chunk with unique ID
- Generates JSONP request at runtime
- Caches loaded modules in `webpackJsonp` array
- Each dynamic import → separate network request (~100-200ms overhead)

**Performance**: Initial bundle loads 60% faster, but route transitions add 100-300ms delay for chunk loading.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** React app initial load time 8.5 seconds (3.2MB bundle).

**Solution:** Code splitting with dynamic imports reduced main bundle to 450KB. Route-specific chunks load on demand.

```javascript
const Dashboard = lazy(() => import('./Dashboard')); // 800KB chunk
const Settings = lazy(() => import('./Settings'));   // 200KB chunk
// Initial load: 8.5s → 2.1s (75% faster)
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Dynamic Import Pros**: Smaller initial bundle, faster first load, better caching
**Cons**: Network latency on route change, complexity, waterfall requests

**Use when**: Routes, modals, tabs, admin features
**Avoid for**: Critical path, above-fold content, small modules (<20KB)

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

Think of your app as a pizza restaurant:
- **Static imports** = Pre-make all pizzas (slow start, fast serve)
- **Dynamic imports** = Make on order (fast start, small wait per order)

Use dynamic imports for "premium toppings" (features) most users don't need immediately.

</details>

### Resources
- [MDN: Dynamic Import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [webpack: Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite: Dynamic Import](https://vitejs.dev/guide/features.html#dynamic-import)

---

## Question 3: IIFE Pattern - What and Why?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6-8 minutes
**Companies:** Meta, Amazon, Netflix

### Question
Explain the IIFE (Immediately Invoked Function Expression) pattern. When is it useful?

### Answer

**IIFE (Immediately Invoked Function Expression)** is a JavaScript design pattern where a function is defined and executed immediately.

**Key Points:**
1. **Syntax**: `(function() { })()` or `(() => { })()`
2. **Scope Isolation**: Creates private scope, preventing global pollution
3. **Legacy Use**: Before ES6 modules, used for module pattern
4. **Modern Use**: Less common now, but still useful for initialization
5. **Avoid var Hoisting**: Pre-ES6 way to avoid var scope issues

### Code Example

```javascript
// 1. BASIC IIFE SYNTAX
(function() {
  console.log('IIFE executed!');
})();

// Alternative syntax
(function() {
  console.log('Alternative syntax');
}());

// Arrow function IIFE
(() => {
  console.log('Arrow IIFE');
})();

// 2. PRIVATE VARIABLES (scope isolation)
// ❌ Without IIFE - global pollution
var counter = 0;
function increment() { counter++; }
// 'counter' is global (bad!)

// ✅ With IIFE - encapsulated
const counterModule = (function() {
  let counter = 0; // Private!

  return {
    increment() { counter++; },
    decrement() { counter--; },
    getCount() { return counter; }
  };
})();

counterModule.increment();
console.log(counterModule.getCount()); // 1
console.log(counterModule.counter); // undefined (private!)

// 3. MODULE PATTERN (pre-ES6)
const Calculator = (function() {
  // Private variables
  let result = 0;

  // Private function
  function log(operation) {
    console.log(`${operation}: ${result}`);
  }

  // Public API
  return {
    add(num) {
      result += num;
      log('Add');
      return this;
    },
    subtract(num) {
      result -= num;
      log('Subtract');
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

Calculator.add(10).subtract(3);
console.log(Calculator.getResult()); // 7

// 4. AVOIDING var HOISTING ISSUES
// ❌ Problem with var in loops
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function() {
    console.log(i); // All print 3!
  });
}
funcs.forEach(f => f()); // 3, 3, 3

// ✅ IIFE creates new scope per iteration
var funcs2 = [];
for (var i = 0; i < 3; i++) {
  funcs2.push((function(index) {
    return function() {
      console.log(index);
    };
  })(i));
}
funcs2.forEach(f => f()); // 0, 1, 2

// Modern solution: use let
for (let i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
}

// 5. NAMESPACE PATTERN
const MyApp = (function() {
  // Private
  const config = { apiUrl: 'https://api.example.com' };

  function init() {
    console.log('App initialized');
  }

  // Public
  return {
    start() {
      init();
    },
    getConfig() {
      return { ...config }; // Return copy
    }
  };
})();

MyApp.start();

// 6. REVEALING MODULE PATTERN
const DataService = (function() {
  let cache = {};

  function fetchData(id) {
    if (cache[id]) return cache[id];
    const data = `Data for ${id}`;
    cache[id] = data;
    return data;
  }

  function clearCache() {
    cache = {};
  }

  // Reveal public methods
  return {
    fetchData,
    clearCache
  };
})();

// 7. JQUERY PLUGIN PATTERN
(function($) {
  $.fn.myPlugin = function(options) {
    const settings = $.extend({
      color: 'red',
      size: '10px'
    }, options);

    return this.css({
      color: settings.color,
      fontSize: settings.size
    });
  };
})(jQuery);

// Usage: $('p').myPlugin({ color: 'blue' });

// 8. ASYNC IIFE (top-level await alternative)
(async function() {
  const response = await fetch('/api/data');
  const data = await response.json();
  console.log(data);
})();

// Modern: top-level await in ES modules
// await fetch('/api/data');

// 9. DEPENDENCY INJECTION
const app = (function(window, document, $) {
  // Use injected dependencies
  function init() {
    $(document).ready(() => {
      console.log('App ready');
    });
  }

  return { init };
})(window, document, jQuery);

// 10. SINGLETON PATTERN
const Singleton = (function() {
  let instance;

  function createInstance() {
    const object = { value: Math.random() };
    return object;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const a = Singleton.getInstance();
const b = Singleton.getInstance();
console.log(a === b); // true (same instance)

// 11. INITIALIZATION CODE
(function() {
  // Run once on page load
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
  });

  // Setup event listeners
  setupEventListeners();

  // Initialize app
  init();
})();

// 12. IIFE WITH PARAMETERS
const result = (function(a, b) {
  return a + b;
})(5, 10);

console.log(result); // 15

// 13. STRICT MODE ISOLATION
(function() {
  'use strict';
  // Strict mode only in this scope
  undeclaredVar = 10; // ReferenceError
})();

// 14. MODERN ALTERNATIVE: BLOCK SCOPE
// Instead of IIFE
{
  const privateVar = 'encapsulated';
  console.log(privateVar);
}
// console.log(privateVar); // ReferenceError

// 15. WEBPACK MODULE WRAPPER (what bundlers do)
// Webpack wraps each module in IIFE
(function(module, exports, __webpack_require__) {
  // Your module code
  const dependency = __webpack_require__(1);
  module.exports = { /* exports */ };
})(/* module */, /* exports */, /* require */);
```

### Common Mistakes

❌ **Wrong**: Forgetting parentheses
```javascript
function() { console.log('hi'); }(); // SyntaxError
```

✅ **Correct**: Wrap in parentheses
```javascript
(function() { console.log('hi'); })();
```

❌ **Wrong**: Using IIFE everywhere (modern code)
```javascript
(function() {
  const data = 'private';
})(); // Unnecessary in ES6 modules
```

✅ **Correct**: Use ES6 modules for encapsulation
```javascript
// module.js
const data = 'private'; // Already encapsulated!
export const publicData = 'public';
```

### Follow-up Questions
1. "How does IIFE relate to closures?"
2. "When would you use IIFE in modern JavaScript?"
3. "What's the difference between IIFE and block scope?"
4. "How do bundlers use IIFE pattern?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Why IIFE was needed pre-ES6:**
- No block scope (`var` is function-scoped)
- No module system (everything global)
- No way to encapsulate code

**V8 Optimization**: IIFE creates function scope → private variables stay in closure. Modern bundlers wrap each module in IIFE to prevent global pollution.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** jQuery plugin namespace collision - two plugins using same global variable `cache`.

**Solution:** IIFE pattern isolates each plugin:
```javascript
(function($) {
  const cache = new Map(); // Private to this plugin
  $.fn.myPlugin = function() { /* uses cache */ };
})(jQuery);
```

Each IIFE creates separate scope → no collision.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Use IIFE when**: Legacy code, browser scripts (no bundler), isolating library code
**Use ES6 modules when**: Modern apps, bundler available, Node.js projects

IIFE is legacy pattern - ES6 modules solve same problem better.

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**IIFE** = Private room for your code. Variables inside can't escape to global scope.

```javascript
(function() {
  const secret = "hidden"; // Only accessible here
})();
console.log(secret); // Error - can't access!
```

It's like a function that runs itself immediately and throws away the key.

</details>

### Resources
- [MDN: IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
- [JavaScript Module Pattern](https://www.patterns.dev/posts/module-pattern/)

---

## Question 4: Singleton Pattern - Implementation and Use Cases

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Amazon, Microsoft

### Question
Implement the Singleton pattern in JavaScript. When should you use it and what are the potential pitfalls?

### Answer

**Singleton Pattern** ensures a class has only one instance and provides a global point of access to it.

**Key Points:**
1. **Single Instance**: Only one instance exists throughout application lifetime
2. **Global Access**: Accessible from anywhere in the application
3. **Lazy Initialization**: Instance created when first needed
4. **Use Cases**: Database connections, configuration, logging, cache
5. **Caution**: Can be anti-pattern (global state, testing issues)

### Code Example

```javascript
// 1. BASIC SINGLETON (ES6 CLASS)
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }

    this.data = [];
    Singleton.instance = this;
  }

  addData(item) {
    this.data.push(item);
  }

  getData() {
    return this.data;
  }
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true (same instance!)

s1.addData('item1');
console.log(s2.getData()); // ['item1']

// 2. SINGLETON WITH PRIVATE CONSTRUCTOR (using closure)
const DatabaseConnection = (function() {
  let instance;

  function createInstance() {
    const connection = {
      host: 'localhost',
      port: 5432,
      connect() {
        console.log(`Connected to ${this.host}:${this.port}`);
      },
      query(sql) {
        console.log(`Executing: ${sql}`);
      }
    };
    return connection;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true

// 3. MODERN SINGLETON (ES6 MODULE)
// config.js
let instance = null;

class Config {
  constructor() {
    if (instance) {
      throw new Error('Use Config.getInstance()');
    }

    this.settings = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3
    };
  }

  static getInstance() {
    if (!instance) {
      instance = new Config();
    }
    return instance;
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
  }
}

export default Config.getInstance();

// app.js
import config from './config.js';
console.log(config.get('apiUrl'));

// 4. SINGLETON WITH INITIALIZATION
class Logger {
  static instance = null;

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logs = [];
    this.level = 'info';
    Logger.instance = this;
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message, level = 'info') {
    const entry = {
      timestamp: new Date(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  error(message) {
    this.log(message, 'error');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  getLogs() {
    return [...this.logs];
  }
}

// Usage
const logger = Logger.getInstance();
logger.log('App started');
logger.error('Something went wrong');

// 5. CACHE SINGLETON
class Cache {
  static instance = null;

  constructor() {
    if (Cache.instance) {
      return Cache.instance;
    }

    this.cache = new Map();
    this.maxSize = 100;
    Cache.instance = this;
  }

  static getInstance() {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key, value, ttl = Infinity) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = Cache.getInstance();
cache.set('user:1', { name: 'John' }, 60000);

// 6. THREAD-SAFE SINGLETON (conceptual - JS is single-threaded)
class ThreadSafeSingleton {
  static instance = null;
  static lock = false;

  constructor() {
    if (ThreadSafeSingleton.instance) {
      return ThreadSafeSingleton.instance;
    }

    this.data = [];
    ThreadSafeSingleton.instance = this;
  }

  static async getInstance() {
    // Wait for lock
    while (ThreadSafeSingleton.lock) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (!ThreadSafeSingleton.instance) {
      ThreadSafeSingleton.lock = true;
      ThreadSafeSingleton.instance = new ThreadSafeSingleton();
      ThreadSafeSingleton.lock = false;
    }

    return ThreadSafeSingleton.instance;
  }
}

// 7. SINGLETON WITH DEPENDENCY INJECTION
class ApiClient {
  constructor(config) {
    if (ApiClient.instance) {
      return ApiClient.instance;
    }

    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.headers = config.headers || {};
    ApiClient.instance = this;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers },
      timeout: this.timeout
    });
    return response.json();
  }
}

// Initialize once
const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  headers: { 'Authorization': 'Bearer token' }
});

// 8. TESTING SINGLETON (reset for tests)
class TestableService {
  constructor() {
    if (TestableService.instance) {
      return TestableService.instance;
    }

    this.data = [];
    TestableService.instance = this;
  }

  static reset() {
    TestableService.instance = null;
  }

  // ... methods
}

// In tests
beforeEach(() => {
  TestableService.reset();
});

// 9. REACT CONTEXT AS SINGLETON (anti-pattern)
// ❌ Bad: Global singleton in React
const globalStore = new Store();

function App() {
  return <div>{globalStore.data}</div>;
}

// ✅ Good: Use Context for scoped singleton
const StoreContext = createContext();

function App() {
  const [store] = useState(() => new Store());

  return (
    <StoreContext.Provider value={store}>
      <Component />
    </StoreContext.Provider>
  );
}

// 10. WHEN NOT TO USE SINGLETON
// ❌ Over-using singletons creates tight coupling
class UserService {
  constructor() {
    this.db = Database.getInstance(); // Tight coupling!
    this.cache = Cache.getInstance();
  }
}

// ✅ Better: Dependency injection
class UserService {
  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }
}

// Usage
const userService = new UserService(
  Database.getInstance(),
  Cache.getInstance()
);
```

### Common Mistakes

❌ **Wrong**: Not preventing direct instantiation
```javascript
class Singleton {
  // Anyone can create new instances!
}
```

✅ **Correct**: Enforce single instance
```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }
}
```

❌ **Wrong**: Using singleton for everything (global state hell)
```javascript
// Makes testing hard, tight coupling
const config = Config.getInstance();
const db = DB.getInstance();
const cache = Cache.getInstance();
```

✅ **Correct**: Use dependency injection when possible
```javascript
class Service {
  constructor(config, db, cache) {
    this.config = config;
    this.db = db;
    this.cache = cache;
  }
}
```

### Follow-up Questions
1. "How would you test code that uses singletons?"
2. "What are alternatives to the singleton pattern?"
3. "Can you implement a singleton in TypeScript?"
4. "How does ES6 module system relate to singletons?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Why Singleton works in JavaScript:**
- Function-scoped `instance` variable (closure)
- Constructor returns existing instance if present
- Static property persists across all instantiations

**ES6 modules are natural singletons**: Each module exports same object reference. Importing module twice gives same instance.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Multiple logger instances created with different configurations causing inconsistent logging format.

**Solution:** Singleton Logger ensures one configuration:
```javascript
class Logger {
  constructor(config) {
    if (Logger.instance) return Logger.instance;
    this.config = config;
    Logger.instance = this;
  }
  log(msg) { console.log(`[${this.config.level}] ${msg}`); }
}

const logger = new Logger({ level: 'INFO' });
// All future instances use same config
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Singleton Pros**: Controlled access, memory efficient (one instance), global state management
**Cons**: Hard to test, tight coupling, hidden dependencies, violates Single Responsibility

**Use for**: Logger, config manager, cache, database connection
**Avoid for**: Business logic, services with state, anything needing multiple instances

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Singleton** = Only one instance allowed. Like there's only one company CEO.

```javascript
class CEO {
  constructor(name) {
    if (CEO.instance) return CEO.instance;
    this.name = name;
    CEO.instance = this;
  }
}

const ceo1 = new CEO('Alice');
const ceo2 = new CEO('Bob');  // Still returns Alice!
console.log(ceo1 === ceo2);   // true
```

First creation wins. All future attempts return same object.

</details>

### Resources
- [Singleton Pattern](https://www.patterns.dev/posts/singleton-pattern/)
- [JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)

---

