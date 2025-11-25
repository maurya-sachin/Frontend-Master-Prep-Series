# Modules & Design Patterns

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: IIFE Pattern - What and Why?

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
<summary><strong>🔍 Deep Dive: IIFE Pattern Internals</strong></summary>

**Why IIFE Was Critical Pre-ES6:**

Before ES6, JavaScript had significant scope problems:
1. **No block scope**: `var` is function-scoped, not block-scoped
2. **No module system**: All code ran in global scope
3. **No encapsulation**: Variables leaked everywhere

```javascript
// Pre-ES6 problem: var leaks out of blocks
if (true) {
  var leakedVar = "I'm global!";
}
console.log(leakedVar); // "I'm global!" (leaked out!)

// IIFE solution: Creates function scope boundary
(function() {
  var encapsulated = "I'm private!";
})();
console.log(encapsulated); // ReferenceError (correctly isolated)
```

**How V8 Compiles IIFE:**

```javascript
// Your IIFE:
(function(x) {
  return x * 2;
})(5);

// V8's compilation steps:
// 1. Parse function expression (not declaration)
// 2. Create new execution context
// 3. Create new scope chain (closure)
// 4. Execute function immediately
// 5. Destroy execution context (garbage collect)

// Function declaration vs expression:
function foo() {} // Declaration: hoisted, named
(function foo() {}) // Expression: not hoisted, can be anonymous

// Why parentheses are needed:
function() { }(); // SyntaxError! Parser expects declaration
(function() { }()); // OK: parentheses force expression context
```

**IIFE Syntax Variations:**

```javascript
// Standard syntax (recommended)
(function() { })();

// Alternative syntax
(function() { }());

// Arrow function IIFE
(() => { })();

// Unary operators (force expression context)
!function() { }();
+function() { }();
-function() { }();
~function() { }();
void function() { }();

// All work because operators force expression context
// But: Less readable, avoid in modern code
```

**Module Pattern Implementation:**

```javascript
// How module pattern actually works:
const MyModule = (function() {
  // Private state (closure scope)
  let privateCounter = 0;
  const privateArray = [];

  // Private functions (not returned)
  function privateHelper() {
    console.log('Private helper');
  }

  // Public API (returned object)
  return {
    publicMethod() {
      privateCounter++;
      privateHelper();
      return privateCounter;
    },

    publicData: 'I am public',

    getPrivateCounter() {
      return privateCounter; // Has access to closure
    }
  };
})();

// Outside world can only access public API
MyModule.publicMethod(); // 1
MyModule.privateCounter; // undefined (not accessible!)
```

**V8 Optimization Insights:**

```javascript
// V8's TurboFan optimizes IIFE patterns:

// Cold path (first execution):
const module = (function() {
  let state = 0;
  return {
    increment() { return ++state; }
  };
})();

// After ~10,000 calls, TurboFan:
// 1. Inlines the closure access
// 2. Eliminates redundant scope lookups
// 3. Maps closure variables to memory offsets
// 4. Generates optimized machine code

// Performance benchmark:
console.time('cold');
for (let i = 0; i < 10000; i++) {
  module.increment();
}
console.timeEnd('cold'); // ~2ms (slower, not optimized yet)

console.time('hot');
for (let i = 0; i < 10000; i++) {
  module.increment();
}
console.timeEnd('hot'); // ~0.5ms (faster, optimized!)
```

**How Bundlers Use IIFE:**

```javascript
// Your ES6 module:
// userService.js
export const getUser = (id) => fetch(`/api/users/${id}`);

// Webpack bundles it as IIFE:
(function(module, exports, __webpack_require__) {
  "use strict";

  Object.defineProperty(exports, "__esModule", { value: true });

  exports.getUser = function(id) {
    return fetch("/api/users/" + id);
  };

})(module, exports, __webpack_require__);

// Why? IIFE prevents module code from polluting global scope
// Each module gets isolated scope via IIFE wrapper
```

**Memory and Performance:**

```javascript
// Benchmark: IIFE vs plain code
const iterations = 1000000;

// Test 1: Plain global variables
console.time('global');
let globalCounter = 0;
for (let i = 0; i < iterations; i++) {
  globalCounter++;
}
console.timeEnd('global'); // ~5ms

// Test 2: IIFE encapsulation
console.time('iife');
const counter = (function() {
  let count = 0;
  return {
    increment() { count++; },
    get() { return count; }
  };
})();
for (let i = 0; i < iterations; i++) {
  counter.increment();
}
console.timeEnd('iife'); // ~8ms

// IIFE is ~60% slower due to:
// - Closure scope chain lookup
// - Function call overhead
// - Object property access
// But: Worth it for encapsulation benefits in real apps
```

**IIFE Closure Behavior:**

```javascript
// IIFE creates permanent closure over variables:
const createCounters = () => {
  const counters = [];

  // Without IIFE (broken)
  for (var i = 0; i < 3; i++) {
    counters.push(() => console.log(i));
  }

  return counters;
};

const broken = createCounters();
broken[0](); // 3 (not 0!)
broken[1](); // 3 (not 1!)
broken[2](); // 3 (not 2!)
// Why? All closures reference same 'i' variable

// With IIFE (works)
const createCountersFixed = () => {
  const counters = [];

  for (var i = 0; i < 3; i++) {
    counters.push((function(index) {
      return () => console.log(index);
    })(i)); // IIFE creates new scope per iteration
  }

  return counters;
};

const fixed = createCountersFixed();
fixed[0](); // 0 ✅
fixed[1](); // 1 ✅
fixed[2](); // 2 ✅
// Why? Each IIFE creates separate closure with own 'index'
```

**Modern Alternatives:**

```javascript
// ES6 block scope (replaces many IIFE uses)
{
  const privateVar = 'encapsulated';
  console.log(privateVar); // Works
}
// console.log(privateVar); // ReferenceError

// ES6 modules (replaces module pattern)
// module.js
const privateVar = 'private';
export const publicVar = 'public';
// privateVar is module-scoped (not global)

// let/const in loops (replaces IIFE in loops)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 (each iteration has own 'i')
```

**When IIFE Still Matters:**

1. **Browser scripts without bundler**:
   ```javascript
   (function() {
     // Your library code isolated from global scope
   })();
   ```

2. **Inline scripts in HTML**:
   ```html
   <script>
   (function() {
     // Won't pollute global namespace
   })();
   </script>
   ```

3. **One-time initialization**:
   ```javascript
   const config = (function() {
     // Complex initialization logic
     const env = detectEnvironment();
     const settings = loadSettings(env);
     return processConfig(settings);
   })();
   ```

4. **Legacy codebase maintenance**:
   - Don't refactor working IIFE code unnecessarily
   - But use ES6 modules for new code

</details>

<details>
<summary><strong>🐛 Real-World Scenario: jQuery Plugin Namespace Collision</strong></summary>

**Scenario:** You're maintaining a legacy e-commerce site with multiple jQuery plugins. After adding a new carousel plugin, the image zoom plugin stops working. Users can't zoom product images anymore, causing support tickets to spike. Investigation reveals a namespace collision between two plugins both using a global `cache` variable.

**The Problem:**

```javascript
// File: jquery.imageZoom.js (installed first)
var cache = new Map(); // Global variable!

$.fn.imageZoom = function(options) {
  return this.each(function() {
    const $img = $(this);
    const src = $img.attr('src');

    // Store zoom data in cache
    if (!cache.has(src)) {
      cache.set(src, {
        zoomed: false,
        originalSize: { width: $img.width(), height: $img.height() }
      });
    }

    $img.on('click', function() {
      const data = cache.get(src);
      // Zoom logic...
    });
  });
};

// File: jquery.carousel.js (installed later - OVERWRITES cache!)
var cache = new Map(); // Same name, overwrites previous!

$.fn.carousel = function(options) {
  return this.each(function() {
    const $carousel = $(this);
    const id = $carousel.attr('id');

    // Stores carousel state
    cache.set(id, {
      currentSlide: 0,
      totalSlides: $carousel.find('.slide').length
    });

    // Carousel logic...
  });
};

// Result: imageZoom's cache is GONE!
// Clicking images crashes: cache.get(src) returns undefined
```

**Production Impact:**

```javascript
// Before fix:
// - Bug reports: 45/day ("Can't zoom product images")
// - JavaScript errors: 320/day in production logs
// - Error: "Cannot read property 'zoomed' of undefined"
// - Affected users: ~8% of product page visitors
// - Lost sales: ~$12k/week (users can't see product details)
// - Support tickets: 60/week
// - Time debugging: 6 hours (hard to reproduce, intermittent)

// Error logs from production:
/*
TypeError: Cannot read properties of undefined (reading 'zoomed')
  at HTMLImageElement.<anonymous> (jquery.imageZoom.js:15)
  at HTMLImageElement.dispatch (jquery.min.js:2)

Frequency: 320 errors/day
Pages affected: /product/* (all product detail pages)
Browsers: All
Pattern: Only happens AFTER carousel is initialized
*/
```

**Debugging Process:**

```javascript
// Step 1: Reproduce locally
// Open product page → zoom works
// Navigate to homepage (has carousel) → go back to product
// Zoom broken!

// Step 2: Check console
console.log(cache); // Map { "carousel-1" => {...}, "carousel-2" => {...} }
// Aha! Cache only has carousel data, not zoom data!

// Step 3: Search for 'var cache' in codebase
// grep -r "var cache" plugins/
// plugins/jquery.imageZoom.js:1: var cache = new Map();
// plugins/jquery.carousel.js:1: var cache = new Map();
// Found it! Both plugins declare global 'cache'

// Step 4: Check load order
// <script src="jquery.imageZoom.js"></script>  // Loads first
// <script src="jquery.carousel.js"></script>   // Loads second, overwrites cache!

// Step 5: Verify collision
console.log(window.cache); // Global variable!
// Both plugins writing to same global variable
```

**Solution 1: IIFE Pattern (Quick Fix):**

```javascript
// ✅ FIX: Wrap each plugin in IIFE

// jquery.imageZoom.js (fixed)
(function($) {
  'use strict';

  // Private cache (scoped to this IIFE only!)
  const cache = new Map();

  $.fn.imageZoom = function(options) {
    return this.each(function() {
      const $img = $(this);
      const src = $img.attr('src');

      if (!cache.has(src)) {
        cache.set(src, {
          zoomed: false,
          originalSize: { width: $img.width(), height: $img.height() }
        });
      }

      $img.on('click', function() {
        const data = cache.get(src);
        if (data.zoomed) {
          $img.css({ width: data.originalSize.width, height: data.originalSize.height });
          data.zoomed = false;
        } else {
          $img.css({ width: '100%', height: 'auto' });
          data.zoomed = true;
        }
      });
    });
  };

})(jQuery); // Pass jQuery as parameter

// jquery.carousel.js (fixed)
(function($) {
  'use strict';

  // Private cache (separate from imageZoom's cache!)
  const cache = new Map();

  $.fn.carousel = function(options) {
    return this.each(function() {
      const $carousel = $(this);
      const id = $carousel.attr('id');

      cache.set(id, {
        currentSlide: 0,
        totalSlides: $carousel.find('.slide').length
      });

      // Carousel navigation
      $carousel.find('.next').on('click', function() {
        const state = cache.get(id);
        state.currentSlide = (state.currentSlide + 1) % state.totalSlides;
        updateCarousel($carousel, state);
      });
    });
  };

  function updateCarousel($carousel, state) {
    $carousel.find('.slide').hide();
    $carousel.find('.slide').eq(state.currentSlide).show();
  }

})(jQuery);

// Now each plugin has its own isolated 'cache' variable!
// No collision → both work perfectly
```

**Solution 2: Namespaced Approach (Better):**

```javascript
// ✅ BETTER: Namespace plugin data under jQuery

// jquery.imageZoom.js (namespaced)
(function($) {
  'use strict';

  // Store cache in jQuery namespace
  $.imageZoom = {
    cache: new Map(),

    init: function($element, options) {
      const src = $element.attr('src');

      if (!this.cache.has(src)) {
        this.cache.set(src, {
          zoomed: false,
          originalSize: { width: $element.width(), height: $element.height() }
        });
      }

      $element.on('click', () => {
        const data = this.cache.get(src);
        this.toggle($element, data);
      });
    },

    toggle: function($element, data) {
      if (data.zoomed) {
        $element.css({ width: data.originalSize.width, height: data.originalSize.height });
        data.zoomed = false;
      } else {
        $element.css({ width: '100%', height: 'auto' });
        data.zoomed = true;
      }
    }
  };

  $.fn.imageZoom = function(options) {
    return this.each(function() {
      $.imageZoom.init($(this), options);
    });
  };

})(jQuery);

// Similarly for carousel
(function($) {
  'use strict';

  $.carousel = {
    cache: new Map(),
    // ... methods
  };

  $.fn.carousel = function(options) {
    return this.each(function() {
      $.carousel.init($(this), options);
    });
  };

})(jQuery);

// Accessible as:
// $.imageZoom.cache (if you need to access programmatically)
// $.carousel.cache (separate namespace!)
```

**Solution 3: ES6 Modules (Modern Refactor):**

```javascript
// ✅ BEST: Refactor to ES6 modules (if possible)

// imageZoom.js
const cache = new Map(); // Module-scoped (private)

export function imageZoom(element, options) {
  const src = element.getAttribute('src');

  if (!cache.has(src)) {
    cache.set(src, {
      zoomed: false,
      originalSize: {
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    });
  }

  element.addEventListener('click', () => {
    const data = cache.get(src);
    toggleZoom(element, data);
  });
}

function toggleZoom(element, data) {
  if (data.zoomed) {
    element.style.width = `${data.originalSize.width}px`;
    element.style.height = `${data.originalSize.height}px`;
    data.zoomed = false;
  } else {
    element.style.width = '100%';
    element.style.height = 'auto';
    data.zoomed = true;
  }
}

// carousel.js
const cache = new Map(); // Separate module-scoped cache

export function carousel(element, options) {
  // Carousel logic with its own cache
}

// main.js
import { imageZoom } from './imageZoom.js';
import { carousel } from './carousel.js';

// No collision - each module has its own scope!
```

**Real Production Metrics After Fix:**

```javascript
// After implementing Solution 1 (IIFE wrapping):

// Deployment: 2 hours (wrap both plugins, test, deploy)
// Code changes: 4 lines added per plugin (IIFE wrapper)

// Results (24 hours after deployment):
// - Bug reports: 0/day ✅
// - JavaScript errors: 0/day ✅
// - Support tickets: 3/week (95% reduction)
// - Sales recovered: $12k/week
// - User satisfaction: +78%
// - Time saved: 5 hours/week (no more debugging this issue)

// Additional benefits:
// - Strict mode enabled per plugin (caught 2 other bugs)
// - Clear dependency injection (jQuery passed as parameter)
// - Easy to test plugins in isolation
// - No fear of variable collisions when adding new plugins
```

**Prevention Strategy:**

```javascript
// Create plugin boilerplate template:

// plugin-template.js
(function($, window, document, undefined) {
  'use strict';

  // Plugin name
  const pluginName = 'myPlugin';

  // Private variables (scoped to IIFE)
  const cache = new Map();
  const defaults = {
    // default options
  };

  // Plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.settings = $.extend({}, defaults, options);
    this.init();
  }

  // Plugin methods
  Plugin.prototype = {
    init: function() {
      // Initialization logic
    },

    destroy: function() {
      // Cleanup
      this.$element.off('.' + pluginName);
    }
  };

  // Register plugin
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);

// Team rule: ALL plugins must use this template
// Result: Zero namespace collisions in 2 years
```

**Testing After Fix:**

```javascript
// Automated test to prevent regression:

describe('jQuery Plugins Namespace Isolation', () => {
  beforeEach(() => {
    // Load both plugins
    loadScript('jquery.imageZoom.js');
    loadScript('jquery.carousel.js');
  });

  it('should not have global cache variable', () => {
    expect(window.cache).toBeUndefined();
  });

  it('imageZoom should work after carousel init', () => {
    // Initialize carousel
    $('#carousel').carousel();

    // Initialize image zoom
    const $img = $('<img src="test.jpg">').appendTo('body');
    $img.imageZoom();

    // Trigger zoom
    $img.trigger('click');

    // Should zoom (not crash)
    expect($img.css('width')).toBe('100%');
  });

  it('carousel should work after imageZoom init', () => {
    // Initialize image zoom first
    const $img = $('<img src="test.jpg">').appendTo('body');
    $img.imageZoom();

    // Initialize carousel
    const $carousel = $('#carousel').carousel();

    // Should navigate slides (not crash)
    $carousel.find('.next').trigger('click');
    expect($carousel.find('.slide:visible').index()).toBe(1);
  });
});

// Tests now run on every deployment
// CI/CD fails if namespace collision detected
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: IIFE vs Modern Patterns</strong></summary>

### 1. IIFE vs ES6 Modules

```javascript
// Pattern 1: IIFE (pre-ES6)
(function() {
  const privateVar = 'secret';

  function privateHelper() {
    return privateVar;
  }

  window.MyLibrary = {
    publicMethod() {
      return privateHelper();
    }
  };
})();

// Pattern 2: ES6 Module
// myLibrary.js
const privateVar = 'secret';

function privateHelper() {
  return privateVar;
}

export function publicMethod() {
  return privateHelper();
}
```

| Aspect | IIFE | ES6 Modules |
|--------|------|-------------|
| **Browser support** | ✅ All browsers | ⚠️ Modern only (or bundler) |
| **Syntax** | ⚠️ Verbose | ✅ Clean |
| **Tree shaking** | ❌ Not possible | ✅ Dead code elimination |
| **Lazy loading** | ❌ No | ✅ `import()` dynamic |
| **Dependency management** | ❌ Manual | ✅ Automatic |
| **Scope isolation** | ✅ Yes | ✅ Yes |
| **Testing** | ⚠️ Harder | ✅ Easier |
| **Bundler needed** | ❌ No | ⚠️ Usually yes |

**When to use IIFE:**
- Legacy browsers without bundler
- Inline `<script>` tags
- Quick prototypes
- Maintaining old codebases

**When to use ES6 modules:**
- Modern applications
- Build process available
- Need tree shaking
- Better developer experience

---

### 2. IIFE vs Block Scope

```javascript
// Pattern 1: IIFE
(function() {
  var temp = 'temporary';
  console.log(temp);
})();

// Pattern 2: Block scope
{
  const temp = 'temporary';
  console.log(temp);
}
```

| Aspect | IIFE | Block Scope `{}` |
|--------|------|-----------------|
| **Readability** | ⚠️ More verbose | ✅ Cleaner |
| **Purpose** | ⚠️ Less obvious | ✅ Clear intent |
| **Scope** | Function scope | Block scope |
| **`this` binding** | ⚠️ Changes | ✅ Unchanged |
| **Return value** | ✅ Can return | ❌ Cannot return |
| **Use with var** | ✅ Needed | ⚠️ Still leaks |
| **Performance** | ⚠️ Slower | ✅ Faster |

**When to use IIFE:**
- Need to return a value
- Complex initialization
- Working with `var`
- Need function scope

**When to use block scope:**
- Simple encapsulation
- Using `let`/`const`
- Cleaner code
- No return value needed

```javascript
// ✅ IIFE: Need return value
const result = (function() {
  const a = 1;
  const b = 2;
  return a + b;
})();

// ✅ Block: Simple encapsulation
{
  const temp = 'I am isolated';
  doSomething(temp);
}
// temp not accessible here
```

---

### 3. IIFE vs Namespace Objects

```javascript
// Pattern 1: IIFE Module
const MyApp = (function() {
  let state = 0;

  return {
    increment() { state++; },
    getState() { return state; }
  };
})();

// Pattern 2: Namespace Object
const MyApp = {
  state: 0,

  increment() {
    this.state++;
  },

  getState() {
    return this.state;
  }
};
```

| Aspect | IIFE Module | Namespace Object |
|--------|------------|-----------------|
| **Private variables** | ✅ Yes (closure) | ❌ No (all public) |
| **Encapsulation** | ✅ Strong | ❌ Weak |
| **Memory** | ⚠️ Closure overhead | ✅ Lighter |
| **Mutability** | ✅ Private state safe | ❌ Anyone can modify |
| **Simplicity** | ⚠️ More complex | ✅ Simple |
| **Testing** | ⚠️ Harder to mock | ✅ Easy to mock |

**When to use IIFE Module:**
- Need true privacy
- Protect internal state
- Public API with private helpers
- Library development

**When to use Namespace Object:**
- All methods are public
- No sensitive data
- Simple organization
- Easy testing needed

---

### 4. IIFE vs Class

```javascript
// Pattern 1: IIFE Singleton
const Counter = (function() {
  let count = 0;

  return {
    increment() { count++; },
    getCount() { return count; }
  };
})();

// Pattern 2: Class
class Counter {
  #count = 0;

  increment() {
    this.#count++;
  }

  getCount() {
    return this.#count;
  }
}

const counter = new Counter();
```

| Aspect | IIFE Singleton | Class |
|--------|---------------|-------|
| **Private fields** | ✅ Closure | ✅ # syntax (modern) |
| **Instances** | ❌ Single only | ✅ Multiple |
| **Inheritance** | ❌ Hard | ✅ Easy |
| **this binding** | ⚠️ Tricky | ✅ Clear |
| **Browser support** | ✅ All | ⚠️ Modern (or transpile) |
| **Memory** | ✅ One instance | ⚠️ Per instance |
| **Use case** | Singletons | Multiple instances |

**When to use IIFE:**
- Need exactly one instance (singleton)
- Legacy browser support
- Simple state management
- No inheritance needed

**When to use Class:**
- Multiple instances
- OOP patterns
- Inheritance/polymorphism
- Modern codebase

---

### 5. Performance Comparison

```javascript
// Benchmark: 1 million operations

// Test 1: IIFE module
const iifeModule = (function() {
  let state = 0;
  return {
    increment() { state++; },
    get() { return state; }
  };
})();

console.time('iife');
for (let i = 0; i < 1000000; i++) {
  iifeModule.increment();
}
console.timeEnd('iife'); // ~8ms

// Test 2: Class
class ClassModule {
  #state = 0;
  increment() { this.#state++; }
  get() { return this.#state; }
}
const classModule = new ClassModule();

console.time('class');
for (let i = 0; i < 1000000; i++) {
  classModule.increment();
}
console.timeEnd('class'); // ~6ms

// Test 3: Plain object
const plainModule = {
  state: 0,
  increment() { this.state++; },
  get() { return this.state; }
};

console.time('plain');
for (let i = 0; i < 1000000; i++) {
  plainModule.increment();
}
console.timeEnd('plain'); // ~5ms

// Results:
// Plain object: Fastest (no privacy overhead)
// Class: Middle (private fields optimized)
// IIFE: Slowest (closure scope lookup)
//
// But: Performance difference is negligible for most apps
// Choose based on encapsulation needs, not raw speed
```

---

### 6. Bundle Size Comparison

```javascript
// Source code (same functionality):

// IIFE version (120 bytes minified)
const a=(function(){let t=0;return{inc(){t++},get(){return t}}})();

// Class version (90 bytes minified)
class A{#t=0;inc(){this.#t++}get(){return this.#t}}const a=new A;

// ES6 module version (80 bytes minified)
let t=0;export const inc=()=>t++;export const get=()=>t;

// ES6 modules: Smallest (tree-shakeable)
// Class: Middle
// IIFE: Largest (wrapping overhead)
```

---

### 7. Migration Path

```javascript
// Legacy IIFE code:
const OldApp = (function() {
  const config = { theme: 'dark' };

  return {
    getConfig() { return config; },
    setTheme(theme) { config.theme = theme; }
  };
})();

// Step 1: Extract to module (easy migration)
// app.js
const config = { theme: 'dark' };

export function getConfig() {
  return config;
}

export function setTheme(theme) {
  config.theme = theme;
}

// Step 2: Refactor to class (if needed)
export class App {
  #config = { theme: 'dark' };

  getConfig() {
    return this.#config;
  }

  setTheme(theme) {
    this.#config.theme = theme;
  }
}

// Migration is straightforward: unwrap IIFE, export functions
```

---

### Decision Matrix

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **Legacy browser, no bundler** | IIFE | Only option |
| **Modern app with bundler** | ES6 modules | Best DX, tree shaking |
| **Singleton pattern** | IIFE or ES6 module | Both work well |
| **Multiple instances** | Class | Designed for it |
| **Simple grouping** | Namespace object | Simplest |
| **Library (published to npm)** | ES6 modules | Standard |
| **Inline script tag** | IIFE | Scope isolation |
| **jQuery plugin** | IIFE | Convention |
| **React/Vue component** | ES6 modules + Class/Function | Framework standard |

---

### Real-World Recommendations

**For new projects:**
- ✅ Use ES6 modules everywhere
- ✅ Use classes for OOP patterns
- ✅ Use plain objects/functions for simple logic
- ❌ Avoid IIFE unless specific need

**For legacy projects:**
- ✅ Keep existing IIFE code (don't rewrite)
- ✅ Use ES6 modules for new features
- ✅ Gradually migrate when touching code
- ⚠️ Don't mix patterns unnecessarily

**For libraries:**
- ✅ Provide ES6 module build
- ✅ Provide UMD build (includes IIFE)
- ✅ Let bundlers tree-shake
- ✅ Document which to use when

</details>

<details>
<summary><strong>💬 Explain to Junior: IIFE Simplified</strong></summary>

**Simple Analogy: Private Meeting Room**

Think of IIFE like a **soundproof meeting room**:

```javascript
// Regular code (open office):
var idea = "my secret idea"; // Everyone can hear!
console.log(idea); // "my secret idea"

// IIFE (private meeting room):
(function() {
  var idea = "my secret idea"; // Only people in room can hear
  console.log(idea); // "my secret idea" (works inside)
})();

console.log(idea); // ReferenceError (outside can't hear!)
```

**What happens:**
1. Create a soundproof room (function)
2. Go inside and talk (execute code)
3. Leave and lock the door (function ends)
4. No one outside knows what you said (variables are private)

---

**Breaking Down the Syntax:**

```javascript
// Regular function (doesn't run automatically):
function sayHello() {
  console.log("Hello!");
}
// Function exists, but doesn't run yet
sayHello(); // Need to call it manually

// IIFE (runs immediately):
(function sayHello() {
  console.log("Hello!");
})(); // Runs automatically!
// Output: "Hello!"

// Why the weird syntax?
// ( ) = Makes it a function expression
// function() { } = The function itself
// () = Calls it immediately
```

**Visual Breakdown:**

```javascript
(         // Start wrapper
  function() {
    console.log("I run immediately!");
  }
)         // End wrapper (makes it an expression)
();       // Execute now!

// Think of it as:
// 1. (function) → Create the function
// 2. () → Call it right away
```

---

**Real-World Example: Counter**

```javascript
// ❌ BAD: Global pollution
var count = 0;

function increment() {
  count++;
}

function getCount() {
  return count;
}

increment();
console.log(getCount()); // 1

// Problem: Anyone can mess with 'count'
count = 999; // Oops! Someone changed it
console.log(getCount()); // 999 (broken!)


// ✅ GOOD: IIFE protection
const counter = (function() {
  // Private variables (inside the room)
  var count = 0;

  // Public methods (door to the room)
  return {
    increment: function() {
      count++;
    },
    getCount: function() {
      return count;
    }
  };
})();

counter.increment();
console.log(counter.getCount()); // 1

// Try to mess with it:
counter.count = 999; // Doesn't work (count is private!)
console.log(counter.getCount()); // Still 1 (protected!)
console.log(counter.count); // undefined (not accessible)
```

---

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Forgetting parentheses
function() {
  console.log("Oops!");
}(); // SyntaxError!

// Why? JavaScript parser thinks you're declaring a function,
// then sees () and gets confused

// ✅ FIX: Wrap in parentheses
(function() {
  console.log("Works!");
})();


// ❌ MISTAKE 2: Trying to call it later
(function() {
  console.log("I run once!");
})();

// Can't call it again - it's gone!
// It ran once and disappeared


// ❌ MISTAKE 3: Expecting variables to leak out
(function() {
  var message = "Hello";
})();

console.log(message); // ReferenceError!
// message is locked inside the IIFE
```

---

**When Would You Actually Use This?**

**Scenario 1: Avoid Name Collisions**

```javascript
// Multiple scripts on one page:

// script1.js
var data = [1, 2, 3];

// script2.js
var data = [4, 5, 6]; // Overwrites script1's data!

// Problem: Both use same variable name


// ✅ FIX with IIFE:

// script1.js
(function() {
  var data = [1, 2, 3]; // Private to script1
  // Do stuff with data
})();

// script2.js
(function() {
  var data = [4, 5, 6]; // Private to script2
  // Do stuff with data
})();

// No collision! Each has its own 'data'
```

**Scenario 2: Plugin Pattern**

```javascript
// jQuery plugin using IIFE
(function($) {
  // $ = jQuery (passed in as parameter)

  $.fn.myPlugin = function() {
    return this.css('color', 'red');
  };

})(jQuery); // Pass jQuery to IIFE

// Now you can use:
$('.element').myPlugin();

// Why? Prevents conflicts if $ is used by other libraries
```

---

**Explaining to PM:**

"IIFE is like having a **private workspace** for your code.

**Without IIFE:**
- All your files throw stuff into one big shared pile (global scope)
- Files accidentally overwrite each other's variables
- Hard to track what belongs to what
- Bugs everywhere

**With IIFE:**
- Each file has its own locked drawer (IIFE)
- Files can't mess with each other's stuff
- Clear boundaries
- Fewer bugs

**Business value:**
- Prevents name collisions between libraries
- Makes code more maintainable
- Reduces bugs (saves time and money)
- Standard pattern used by every major library (jQuery, Lodash, etc.)

**Example:**
Imagine you have 10 developers working on 10 different features. Without IIFE, they might accidentally use the same variable names and break each other's code. With IIFE, each feature is isolated - no accidental overwrites, no mysterious bugs."

---

**Modern Alternative (ES6):**

```javascript
// Old way (IIFE):
(function() {
  var privateVar = 'private';
  console.log(privateVar);
})();

// Modern way (ES6 modules):
// module.js
const privateVar = 'private'; // Automatically scoped to module
console.log(privateVar);

export const publicVar = 'public';

// main.js
import { publicVar } from './module.js';
// Can only access publicVar, not privateVar
```

**When to use IIFE today:**
- Working on legacy codebases
- Writing jQuery plugins
- No build tool / bundler available
- Quick inline scripts in HTML

**When to use ES6 modules instead:**
- Modern applications
- Have a bundler (Webpack, Vite, etc.)
- Writing new code
- Better developer experience

---

**Practice Exercise:**

```javascript
// Challenge: Create a private counter that:
// - Starts at 0
// - Can increment
// - Can decrement
// - Can get current count
// - Can't be modified directly

// Try it yourself! (Scroll down for answer)
//
//
//
//
//
//

// Answer:
const counter = (function() {
  let count = 0; // Private!

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    getCount() {
      return count;
    }
  };
})();

counter.increment();
counter.increment();
counter.decrement();
console.log(counter.getCount()); // 1
console.log(counter.count); // undefined (private!)
```

---

**Key Takeaways:**

1. **IIFE = Immediately Invoked Function Expression**
   - Runs as soon as it's defined
   - Creates private scope
   - Variables inside can't escape

2. **Syntax:** `(function() { /* code */ })()`
   - Wrap function in `()`
   - Add `()` at end to call it

3. **Use cases:**
   - Avoid global pollution
   - Create private variables
   - Module pattern
   - jQuery plugins

4. **Modern alternative:** ES6 modules (better for new code)

5. **Legacy pattern:** Still see it in old code and libraries

</details>

### Resources
- [MDN: IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
- [JavaScript Module Pattern](https://www.patterns.dev/posts/module-pattern/)

---

## Question 2: Singleton Pattern - Implementation and Use Cases

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
<summary><strong>🔍 Deep Dive: Singleton Pattern Internals</strong></summary>

**How Singleton Works in JavaScript:**

JavaScript doesn't have traditional class-based singletons like Java or C#. Instead, it uses closures and object references:

```javascript
// Method 1: Closure-based singleton
const Singleton = (function() {
  let instance; // Private variable (closure)

  function createInstance() {
    // Private constructor logic
    const object = { value: Math.random() };
    return object;
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance(); // Lazy initialization
      }
      return instance; // Always return same instance
    }
  };
})();

const s1 = Singleton.getInstance();
const s2 = Singleton.getInstance();
console.log(s1 === s2); // true (same reference!)

// Why it works:
// 1. IIFE creates closure over 'instance' variable
// 2. First call: instance is undefined → createInstance() runs
// 3. Subsequent calls: instance exists → return cached value
// 4. 'instance' persists in closure (never garbage collected)
```

**ES6 Class Singleton Pattern:**

```javascript
// Method 2: ES6 class with static property
class Singleton {
  constructor() {
    // Check if instance already exists
    if (Singleton.instance) {
      return Singleton.instance; // Return existing instance
    }

    // Initialize
    this.data = [];
    this.timestamp = Date.now();

    // Store instance
    Singleton.instance = this;
  }

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

// Both work:
const a = new Singleton();
const b = new Singleton();
console.log(a === b); // true

const c = Singleton.getInstance();
console.log(a === c); // true (all same instance!)
```

**Why Constructor Can Return Different Object:**

```javascript
// Special JavaScript behavior: Constructor can return object

class Test {
  constructor() {
    // Normally returns 'this' implicitly
    // But can explicitly return different object!
    return { custom: 'object' };
  }
}

const instance = new Test();
console.log(instance); // { custom: 'object' } (not Test instance!)

// This is how Singleton returns cached instance:
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance; // Return cached instead of 'this'
    }
    Singleton.instance = this;
  }
}
```

**Module Scope as Natural Singleton:**

```javascript
// ES6 modules are inherently singletons!

// config.js
let config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

export function getConfig() {
  return config;
}

export function setConfig(newConfig) {
  config = { ...config, ...newConfig };
}

// main.js
import { getConfig, setConfig } from './config.js';

setConfig({ timeout: 10000 });
const config1 = getConfig();

// other-file.js
import { getConfig } from './config.js';

const config2 = getConfig();

// config1 === config2 (same module instance!)

// Why? Module system ensures each module loads once
// All imports reference same module instance
```

**Memory Implications:**

```javascript
// Singleton holds reference forever (never garbage collected)

class Cache {
  constructor() {
    if (Cache.instance) {
      return Cache.instance;
    }

    this.data = new Map(); // This Map never gets garbage collected!
    Cache.instance = this;
  }

  set(key, value) {
    this.data.set(key, value);
  }

  clear() {
    this.data.clear(); // Clears entries but Map object persists
  }
}

const cache = new Cache();

// Add 1 million items
for (let i = 0; i < 1000000; i++) {
  cache.set(`key${i}`, { data: new Array(100).fill(i) });
}

// Memory: ~800MB used

cache.clear(); // Clears entries
// Memory: Still ~100MB (Map object and closure overhead remain)

// Singleton instance stays in memory forever!
// Even if you stop using it, it won't be garbage collected
```

**Thread Safety (Conceptual):**

```javascript
// JavaScript is single-threaded, but async can cause issues:

class AsyncSingleton {
  static instance = null;
  static initPromise = null;

  static async getInstance() {
    // ❌ RACE CONDITION:
    if (!AsyncSingleton.instance) {
      // Multiple calls here before first completes!
      AsyncSingleton.instance = await fetch('/api/config').then(r => r.json());
    }
    return AsyncSingleton.instance;
  }
}

// Problem:
const p1 = AsyncSingleton.getInstance(); // Starts fetching
const p2 = AsyncSingleton.getInstance(); // Starts fetching again!
// Two fetch requests! Not a true singleton during initialization

// ✅ FIX: Promise caching
class AsyncSingletonFixed {
  static instance = null;
  static initPromise = null;

  static getInstance() {
    if (AsyncSingletonFixed.instance) {
      return Promise.resolve(AsyncSingletonFixed.instance);
    }

    if (!AsyncSingletonFixed.initPromise) {
      AsyncSingletonFixed.initPromise = fetch('/api/config')
        .then(r => r.json())
        .then(config => {
          AsyncSingletonFixed.instance = config;
          return config;
        });
    }

    return AsyncSingletonFixed.initPromise;
  }
}

// Now multiple calls share same promise:
const p1 = AsyncSingletonFixed.getInstance(); // Starts fetch
const p2 = AsyncSingletonFixed.getInstance(); // Returns same promise
// Only one fetch request!
```

**Inheritance with Singleton:**

```javascript
// Singleton + inheritance is tricky

class BaseSingleton {
  constructor() {
    if (BaseSingleton.instance) {
      return BaseSingleton.instance;
    }
    BaseSingleton.instance = this;
  }
}

class DerivedSingleton extends BaseSingleton {
  constructor() {
    super();
    this.derivedData = 'specific';
  }
}

const base = new BaseSingleton();
const derived = new DerivedSingleton();

console.log(base === derived); // true (same instance!)
// Problem: Derived gets base instance, not new derived instance!

// ✅ FIX: Per-class instances
class BaseSingletonFixed {
  constructor() {
    const TargetClass = this.constructor;

    if (TargetClass.instance) {
      return TargetClass.instance;
    }

    TargetClass.instance = this;
  }
}

class DerivedSingletonFixed extends BaseSingletonFixed {
  constructor() {
    super();
    this.derivedData = 'specific';
  }
}

const base2 = new BaseSingletonFixed();
const derived2 = new DerivedSingletonFixed();

console.log(base2 === derived2); // false (separate singletons!)
console.log(base2 instanceof BaseSingletonFixed); // true
console.log(derived2 instanceof DerivedSingletonFixed); // true
```

**Proxy Pattern for Lazy Initialization:**

```javascript
// Use Proxy to create singleton lazily

const DatabaseConnection = {
  _connection: null,

  connect() {
    if (!this._connection) {
      console.log('Creating connection...');
      this._connection = {
        host: 'localhost',
        port: 5432,
        query(sql) {
          console.log(`Executing: ${sql}`);
        }
      };
    }
    return this._connection;
  }
};

// ✅ Even better: Proxy for automatic lazy initialization
const createLazySingleton = (factory) => {
  let instance = null;

  return new Proxy({}, {
    get(target, prop) {
      if (!instance) {
        instance = factory();
      }
      return instance[prop];
    }
  });
};

const db = createLazySingleton(() => ({
  host: 'localhost',
  query(sql) {
    console.log(`Executing: ${sql}`);
  }
}));

// First access creates instance
db.query('SELECT * FROM users'); // Creates + executes
db.query('SELECT * FROM posts'); // Reuses instance
```

**V8 Optimization:**

```javascript
// V8 can inline singleton access in hot code

class Config {
  static instance = null;

  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get(key) {
    return this.settings[key];
  }
}

// Cold path (first ~10,000 calls):
for (let i = 0; i < 10000; i++) {
  const config = Config.getInstance();
  config.get('apiUrl');
}
// V8 interprets, instance check every time

// Hot path (after optimization):
for (let i = 0; i < 1000000; i++) {
  const config = Config.getInstance();
  config.get('apiUrl');
}
// V8's TurboFan inlines getInstance(), eliminates instance check
// Direct memory access to singleton instance
// ~10x faster than cold path
```

**Serialization Issues:**

```javascript
// Singleton breaks when serialized/deserialized

class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.data = { count: 0 };
    Singleton.instance = this;
  }

  increment() {
    this.data.count++;
  }
}

const original = new Singleton();
original.increment();

// Serialize
const serialized = JSON.stringify(original);

// Deserialize
const deserialized = JSON.parse(serialized);

// Problem: deserialized is NOT the singleton!
console.log(original === deserialized); // false
console.log(deserialized instanceof Singleton); // false

// ✅ FIX: Custom reviver
class SerializableSingleton {
  static instance = null;

  constructor() {
    if (SerializableSingleton.instance) {
      return SerializableSingleton.instance;
    }
    this.data = { count: 0 };
    SerializableSingleton.instance = this;
  }

  toJSON() {
    return this.data;
  }

  static fromJSON(data) {
    if (!SerializableSingleton.instance) {
      SerializableSingleton.instance = new SerializableSingleton();
    }
    SerializableSingleton.instance.data = data;
    return SerializableSingleton.instance;
  }
}
```

**When Singleton Breaks:**

```javascript
// 1. Multiple windows/iframes (separate contexts)
// window1.html
const singleton1 = Config.getInstance();

// window2.html (iframe)
const singleton2 = Config.getInstance();

// singleton1 !== singleton2 (different JavaScript contexts!)

// 2. Web Workers (separate threads)
// main.js
const mainSingleton = Cache.getInstance();

// worker.js
const workerSingleton = Cache.getInstance();

// Different instances! Workers have separate global scope

// 3. Module bundlers with different entry points
// Can create duplicate modules if not configured correctly
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Database Connection Pool Duplication</strong></summary>

**Scenario:** Your Node.js API server is running out of database connections during peak traffic. Investigation reveals that different parts of the application are creating separate database connection pools instead of sharing one. Each pool has 20 connections, and with 10 different modules creating pools, you have 200 connections when you only need 20! This causes "too many connections" errors and crashes the application.

**The Problem:**

```javascript
// File: database.js (utility module)
const pg = require('pg');

function createPool() {
  return new pg.Pool({
    host: 'localhost',
    database: 'myapp',
    max: 20, // Max 20 connections per pool
    idleTimeoutMillis: 30000
  });
}

module.exports = { createPool };

// File: userService.js
const { createPool } = require('./database');
const pool = createPool(); // Creates pool #1

async function getUser(id) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
  client.release();
  return result.rows[0];
}

// File: orderService.js
const { createPool } = require('./database');
const pool = createPool(); // Creates pool #2 (duplicate!)

async function getOrders(userId) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  client.release();
  return result.rows;
}

// File: productService.js
const { createPool } = require('./database');
const pool = createPool(); // Creates pool #3 (duplicate!)

async function getProducts() {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM products LIMIT 100');
  client.release();
  return result.rows;
}

// ... 7 more services doing the same thing!

// Result: 10 pools × 20 connections = 200 total connections!
// PostgreSQL max_connections = 100 (default)
// Application crashes: "sorry, too many clients already"
```

**Production Impact:**

```javascript
// Before fix (multiple pools):
// - Database errors: 450/hour during peak traffic
// - Error: "sorry, too many clients already"
// - Connection pool count: 10 pools (200 potential connections)
// - Active connections during peak: 150-180 (exceeds database limit of 100)
// - Server crashes: 8 times/day (OOM from too many pools)
// - API response time: 2-5 seconds (slow due to connection waiting)
// - Downtime: 3 hours/week total
// - Lost revenue: ~$25k/week
// - Customer complaints: 120/week
// - On-call incidents: 15/week (team exhausted)

// Error logs:
/*
Error: sorry, too many clients already
  at Connection.parseE (/node_modules/pg/lib/connection.js:554:11)
  at Connection.parseMessage (/node_modules/pg/lib/connection.js:379:19)

Frequency: 450 errors/hour (peak: 3pm-5pm daily)
Servers affected: All 5 app servers
Pattern: Happens when traffic > 500 req/min
Database connection count: 180/100 (over limit!)
*/

// AWS RDS metrics showing:
// - CPU: 85% (handling connection requests)
// - Connections: 180/100 (80% over limit)
// - Connection errors: Spiking
// - Disk IOPS: Exhausted
```

**Debugging Process:**

```javascript
// Step 1: Check active database connections
// From psql:
SELECT count(*) FROM pg_stat_activity WHERE datname = 'myapp';
// Result: 180 connections (way over 100 limit!)

// Step 2: Check where connections are coming from
SELECT application_name, count(*)
FROM pg_stat_activity
WHERE datname = 'myapp'
GROUP BY application_name;
// Result:
// nodejs-app | 180 (all from same app!)

// Step 3: Add logging to createPool
function createPool() {
  console.trace('Creating new pool'); // Stack trace
  const pool = new pg.Pool({ /* ... */ });
  console.log('Total pools created:', ++poolCount);
  return pool;
}

// Output:
// Creating new pool (userService.js:5)
// Total pools created: 1
// Creating new pool (orderService.js:5)
// Total pools created: 2
// Creating new pool (productService.js:5)
// Total pools created: 3
// ... (continues to 10!)

// Step 4: Check module structure
// grep -r "createPool()" services/
// Found: 10 services all calling createPool()!

// Aha! Each service creates its own pool instead of sharing one
```

**Solution 1: Singleton Pool (Quick Fix):**

```javascript
// ✅ FIX: database.js (Singleton pattern)
const pg = require('pg');

class DatabasePool {
  constructor() {
    // Return existing instance if already created
    if (DatabasePool.instance) {
      console.log('Returning existing pool instance');
      return DatabasePool.instance;
    }

    console.log('Creating new pool instance');

    // Create the actual pool
    this.pool = new pg.Pool({
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Max connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    // Event listeners
    this.pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
    });

    this.pool.on('connect', () => {
      console.log('New client connected to pool');
    });

    this.pool.on('remove', () => {
      console.log('Client removed from pool');
    });

    // Store instance
    DatabasePool.instance = this;
  }

  // Get a client from pool
  async getClient() {
    return await this.pool.connect();
  }

  // Execute query directly
  async query(text, params) {
    return await this.pool.query(text, params);
  }

  // Get pool stats
  getStats() {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount
    };
  }

  // Graceful shutdown
  async close() {
    await this.pool.end();
    console.log('Pool has ended');
  }
}

// Export singleton instance getter
module.exports = new DatabasePool();

// Now all services use the SAME pool:

// userService.js
const db = require('./database');

async function getUser(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// orderService.js
const db = require('./database'); // Same instance!

async function getOrders(userId) {
  const result = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  return result.rows;
}

// productService.js
const db = require('./database'); // Same instance!

async function getProducts() {
  const result = await db.query('SELECT * FROM products LIMIT 100');
  return result.rows;
}

// All 10 services now share ONE pool with 20 connections!
```

**Solution 2: ES6 Module Singleton (Better):**

```javascript
// ✅ BETTER: database.js (ES6 module - naturally a singleton)
import pg from 'pg';

// Module-level variable (only created once)
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Pool event handlers
pool.on('error', (err, client) => {
  console.error('Unexpected pool error:', err);
  process.exit(-1); // Exit on pool error
});

pool.on('connect', (client) => {
  console.log('Client connected to pool');
});

// Export pool methods
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: result.rowCount });
  return result;
}

export async function getClient() {
  const client = await pool.connect();
  const originalRelease = client.release;

  // Wrap release to add logging
  client.release = () => {
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

export function getStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };
}

export async function close() {
  await pool.end();
  console.log('Pool closed gracefully');
}

// Usage in services:
// userService.js
import { query } from './database.js';

export async function getUser(id) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// ES6 modules are singletons by design!
// All imports get the same pool instance
```

**Solution 3: Connection Pool with Monitoring:**

```javascript
// ✅ PRODUCTION-READY: With monitoring and health checks

import pg from 'pg';
import prometheus from 'prom-client';

// Prometheus metrics
const connectionPoolGauge = new prometheus.Gauge({
  name: 'db_pool_connections',
  help: 'Database pool connection count',
  labelNames: ['state'] // total, idle, waiting
});

const queryDurationHistogram = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

class DatabaseSingleton {
  static #instance = null;

  constructor() {
    if (DatabaseSingleton.#instance) {
      return DatabaseSingleton.#instance;
    }

    this.pool = new pg.Pool({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: parseInt(process.env.DB_POOL_SIZE) || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      application_name: 'myapp-node'
    });

    // Error handling
    this.pool.on('error', (err) => {
      console.error('Pool error:', err);
      // Alert ops team
      this.alertOps('db_pool_error', err);
    });

    // Track metrics every 10 seconds
    setInterval(() => {
      connectionPoolGauge.set({ state: 'total' }, this.pool.totalCount);
      connectionPoolGauge.set({ state: 'idle' }, this.pool.idleCount);
      connectionPoolGauge.set({ state: 'waiting' }, this.pool.waitingCount);
    }, 10000);

    DatabaseSingleton.#instance = this;
  }

  async query(text, params) {
    const start = Date.now();

    try {
      const result = await this.pool.query(text, params);
      const duration = (Date.now() - start) / 1000;

      queryDurationHistogram.observe(duration);

      return result;
    } catch (error) {
      console.error('Query error:', { text, error: error.message });
      throw error;
    }
  }

  async healthCheck() {
    try {
      const result = await this.pool.query('SELECT 1');
      return {
        status: 'healthy',
        pool: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async close() {
    await this.pool.end();
    console.log('Database pool closed');
  }

  alertOps(event, details) {
    // Send to PagerDuty, Slack, etc.
    console.error('ALERT:', event, details);
  }
}

export default new DatabaseSingleton();

// Health check endpoint
// app.js
import express from 'express';
import db from './database.js';

const app = express();

app.get('/health', async (req, res) => {
  const health = await db.healthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...');
  await db.close();
  process.exit(0);
});
```

**Real Production Metrics After Fix:**

```javascript
// After implementing Singleton pattern:

// Deployment: 4 hours (code changes + testing + rollout)
// Code changes: 1 file modified (database.js), all services updated imports

// Results (24 hours after deployment):
// - Database errors: 0/hour ✅
// - Connection pool count: 1 pool (20 connections max)
// - Active connections during peak: 18-20 (well under limit)
// - Server crashes: 0 (was 8/day) ✅
// - API response time: 120ms average (was 2-5 seconds) ✅
// - Downtime: 0 hours ✅
// - Revenue recovered: $25k/week
// - Customer satisfaction: +92%
// - On-call incidents: 1/week (unrelated)

// Database metrics (AWS RDS):
// - CPU: 25% average (was 85%)
// - Connections: 18-20/100 (was 180/100)
// - Connection errors: 0 (was 450/hour)
// - Disk IOPS: Normal (was exhausted)
// - Query latency: -75% improvement

// Additional benefits:
// - Easier monitoring (single pool to track)
// - Clearer error handling (centralized)
// - Better resource utilization
// - Simplified debugging
// - Lower AWS bills ($500/month saved on overprovisioned RDS)
```

**Testing Strategy:**

```javascript
// Unit tests for Singleton

describe('DatabasePool Singleton', () => {
  afterEach(() => {
    // Reset singleton for testing
    DatabasePool.instance = null;
  });

  it('should return same instance when called multiple times', () => {
    const db1 = new DatabasePool();
    const db2 = new DatabasePool();
    const db3 = new DatabasePool();

    expect(db1).toBe(db2);
    expect(db2).toBe(db3);
  });

  it('should only create pool once', () => {
    const spy = jest.spyOn(pg, 'Pool');

    new DatabasePool();
    new DatabasePool();
    new DatabasePool();

    expect(spy).toHaveBeenCalledTimes(1); // Pool created only once!
  });

  it('should share connections across services', async () => {
    const db = new DatabasePool();

    // Simulate multiple services using pool
    const promises = Array.from({ length: 10 }, (_, i) =>
      db.query(`SELECT ${i}`)
    );

    const results = await Promise.all(promises);

    // All queries succeeded with single pool
    expect(results).toHaveLength(10);

    // Pool stats show single pool
    const stats = db.getStats();
    expect(stats.total).toBeLessThanOrEqual(20); // Max pool size
  });
});
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Singleton vs Other Patterns</strong></summary>

### 1. Singleton vs Multiple Instances

```javascript
// Pattern 1: Singleton
class ConfigSingleton {
  constructor() {
    if (ConfigSingleton.instance) {
      return ConfigSingleton.instance;
    }
    this.settings = {};
    ConfigSingleton.instance = this;
  }
}

const config1 = new ConfigSingleton();
const config2 = new ConfigSingleton();
console.log(config1 === config2); // true

// Pattern 2: Regular class (multiple instances)
class Config {
  constructor() {
    this.settings = {};
  }
}

const cfg1 = new Config();
const cfg2 = new Config();
console.log(cfg1 === cfg2); // false
```

| Aspect | Singleton | Multiple Instances |
|--------|-----------|-------------------|
| **Memory usage** | ✅ One instance only | ⚠️ Memory per instance |
| **State sharing** | ✅ Shared state | ❌ Isolated state |
| **Testing** | ❌ Hard to isolate | ✅ Easy to mock |
| **Coupling** | ❌ High (global state) | ✅ Low |
| **Thread safety** | ⚠️ Need synchronization | ✅ No shared state |
| **Flexibility** | ❌ One size fits all | ✅ Customizable |

**Use Singleton when:**
- Need exactly one instance (database pool, logger)
- Global configuration
- Resource expensive to create
- Shared state is beneficial

**Use Multiple Instances when:**
- Need different configurations
- Parallel operations
- Testing is important
- Avoid global state

---

### 2. Singleton vs Dependency Injection

```javascript
// Pattern 1: Singleton (tight coupling)
class UserService {
  constructor() {
    this.db = Database.getInstance(); // Hard-coded dependency
    this.cache = Cache.getInstance();
  }

  async getUser(id) {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

// Hard to test - can't mock Database!


// Pattern 2: Dependency Injection (loose coupling)
class UserServiceDI {
  constructor(db, cache) {
    this.db = db; // Injected
    this.cache = cache;
  }

  async getUser(id) {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

// Easy to test - inject mocks!
const userService = new UserServiceDI(mockDb, mockCache);
```

| Aspect | Singleton | Dependency Injection |
|--------|-----------|---------------------|
| **Coupling** | ❌ Tight (hard-coded) | ✅ Loose |
| **Testing** | ❌ Hard to mock | ✅ Easy to mock |
| **Flexibility** | ❌ Fixed dependencies | ✅ Swappable |
| **Simplicity** | ✅ Simple usage | ⚠️ More setup |
| **Hidden dependencies** | ❌ Yes | ✅ Explicit |
| **IoC container** | ❌ Not needed | ⚠️ May be needed |

**Best practice:** Use DI even with Singletons!

```javascript
// ✅ BEST: Combine both
class UserService {
  constructor(db = Database.getInstance(), cache = Cache.getInstance()) {
    this.db = db; // Default to singleton, but injectable for tests
    this.cache = cache;
  }
}

// Production: Uses singletons
const prodService = new UserService();

// Testing: Inject mocks
const testService = new UserService(mockDb, mockCache);
```

---

### 3. Singleton vs Static Methods

```javascript
// Pattern 1: Singleton instance
class ConfigSingleton {
  constructor() {
    if (ConfigSingleton.instance) {
      return ConfigSingleton.instance;
    }
    this.settings = { theme: 'dark' };
    ConfigSingleton.instance = this;
  }

  get(key) {
    return this.settings[key];
  }
}

const config = ConfigSingleton.getInstance();
config.get('theme');

// Pattern 2: Static methods (no instances)
class ConfigStatic {
  static settings = { theme: 'dark' };

  static get(key) {
    return this.settings[key];
  }
}

ConfigStatic.get('theme'); // No instantiation needed
```

| Aspect | Singleton | Static Methods |
|--------|-----------|---------------|
| **Instantiation** | ⚠️ Need to create instance | ✅ No instantiation |
| **Inheritance** | ✅ Can extend | ⚠️ Harder to extend |
| **Polymorphism** | ✅ Yes | ❌ No |
| **Interface** | ✅ Can implement | ❌ No |
| **this context** | ✅ Has this | ⚠️ Points to class |
| **Memory** | ⚠️ Instance overhead | ✅ No instance |

**When to use each:**
- **Singleton**: Need state, inheritance, polymorphism
- **Static**: Utility functions, no state needed

---

### 4. Singleton vs ES6 Module

```javascript
// Pattern 1: Singleton class
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = createConnection();
    Database.instance = this;
  }
}

export default new Database();

// Pattern 2: ES6 Module
const connection = createConnection();

export function query(sql) {
  return connection.query(sql);
}

export function close() {
  return connection.close();
}
```

| Aspect | Singleton Class | ES6 Module |
|--------|----------------|-----------|
| **Syntax** | ⚠️ More verbose | ✅ Cleaner |
| **State encapsulation** | ✅ Class properties | ✅ Module scope |
| **Tree shaking** | ⚠️ Harder | ✅ Easier |
| **Methods** | ✅ Clear grouping | ⚠️ Exported functions |
| **Inheritance** | ✅ Can extend | ❌ No inheritance |
| **Testing** | ⚠️ Need to reset instance | ⚠️ Need to mock module |

**Modern recommendation:** Use ES6 modules!

```javascript
// ✅ MODERN: ES6 module (natural singleton)
// database.js
const pool = createPool();

export async function query(sql, params) {
  return pool.query(sql, params);
}

// Module loads once - pool is singleton by default!
```

---

### 5. Global Object vs Singleton

```javascript
// Pattern 1: Global object
window.appConfig = {
  apiUrl: 'https://api.example.com',
  get(key) {
    return this[key];
  }
};

// Pattern 2: Singleton
class Config {
  static instance = null;

  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    this.apiUrl = 'https://api.example.com';
    Config.instance = this;
  }
}
```

| Aspect | Global Object | Singleton |
|--------|--------------|-----------|
| **Namespace pollution** | ❌ Yes | ✅ Controlled |
| **Encapsulation** | ❌ None | ✅ Private members |
| **Initialization control** | ❌ Manual | ✅ Lazy/eager |
| **Simplicity** | ✅ Very simple | ⚠️ More code |
| **Best practices** | ❌ Antipattern | ✅ Acceptable |

---

### Decision Matrix

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **Database connection pool** | ES6 Module Singleton | Natural singleton, clean syntax |
| **Application config** | ES6 Module or Singleton | Shared config needed |
| **Logger** | ES6 Module Singleton | One log stream |
| **Cache** | Singleton or DI | Shared cache, testable |
| **API client** | DI with singleton default | Flexibility + performance |
| **Utility functions** | Static methods | No state needed |
| **Business logic** | Regular class with DI | Testability crucial |
| **React state** | Context API | Framework-specific |

---

### Performance Comparison

```javascript
// Benchmark: 1 million accesses

// Test 1: Singleton getInstance
class SingletonTest {
  static instance = null;
  static getInstance() {
    if (!this.instance) {
      this.instance = new SingletonTest();
    }
    return this.instance;
  }
}

console.time('singleton');
for (let i = 0; i < 1000000; i++) {
  SingletonTest.getInstance();
}
console.timeEnd('singleton'); // ~10ms (instance check overhead)

// Test 2: Module-scoped
const instance = new SingletonTest();
export default instance;

console.time('module');
for (let i = 0; i < 1000000; i++) {
  const x = instance; // Direct reference
}
console.timeEnd('module'); // ~2ms (no check needed)

// Test 3: Direct global
window.instance = new SingletonTest();

console.time('global');
for (let i = 0; i < 1000000; i++) {
  const x = window.instance;
}
console.timeEnd('global'); // ~3ms

// Winner: Module-scoped (fastest + clean)
```

---

### Anti-patterns to Avoid

```javascript
// ❌ ANTI-PATTERN 1: Singleton for everything
class EverythingIsSingleton {
  // This should NOT be a singleton!
  // Users can have multiple instances
}

// ❌ ANTI-PATTERN 2: Mutable global state
class GlobalState {
  static data = {}; // Anyone can mutate!

  static set(key, value) {
    this.data[key] = value; // Race conditions!
  }
}

// ❌ ANTI-PATTERN 3: Hidden dependencies
class Service {
  constructor() {
    this.db = DB.getInstance(); // Hidden dependency!
    // Tests can't inject mock DB
  }
}

// ✅ BETTER: Make dependencies explicit
class ServiceBetter {
  constructor(db = DB.getInstance()) {
    this.db = db; // Explicit + default to singleton
  }
}
```

---

### Real-World Recommendations

**Use Singleton for:**
- ✅ Database connection pools
- ✅ Application logger
- ✅ Global configuration
- ✅ Cache manager
- ✅ WebSocket connection
- ✅ Analytics tracker

**Avoid Singleton for:**
- ❌ Business logic
- ❌ User-specific state
- ❌ Request handlers
- ❌ Anything that needs multiple instances
- ❌ Code that needs heavy testing

**Modern Best Practices:**
1. Prefer ES6 modules over explicit Singleton pattern
2. Use dependency injection even with singletons
3. Make dependencies explicit in constructor
4. Avoid global mutable state
5. Consider if you truly need Singleton or just shared state

</details>

<details>
<summary><strong>💬 Explain to Junior: Singleton Simplified</strong></summary>

**Simple Analogy: The One and Only CEO**

Think of a Singleton like a company having exactly **one CEO**:

```javascript
class CEO {
  constructor(name) {
    // Check if CEO already exists
    if (CEO.instance) {
      console.log(`We already have CEO ${CEO.instance.name}. Can't hire ${name}!`);
      return CEO.instance; // Return existing CEO
    }

    // First hire
    this.name = name;
    console.log(`${name} is now the CEO`);
    CEO.instance = this;
  }

  announce() {
    console.log(`${this.name} speaking...`);
  }
}

// Try to hire CEOs
const ceo1 = new CEO('Alice');   // "Alice is now the CEO"
const ceo2 = new CEO('Bob');     // "We already have CEO Alice. Can't hire Bob!"
const ceo3 = new CEO('Charlie'); // "We already have CEO Alice. Can't hire Charlie!"

ceo1.announce(); // "Alice speaking..."
ceo2.announce(); // "Alice speaking..." (same person!)
ceo3.announce(); // "Alice speaking..." (same person!)

console.log(ceo1 === ceo2); // true (all are same object!)
console.log(ceo2 === ceo3); // true
```

**What happened?**
- First `new CEO('Alice')` creates the CEO
- Second `new CEO('Bob')` tries to create another, but returns Alice instead!
- Third `new CEO('Charlie')` also returns Alice
- There can only be ONE CEO!

---

**Breaking Down How It Works:**

```javascript
class Singleton {
  constructor() {
    // Step 1: Check if instance already exists
    if (Singleton.instance) {
      // Yes! Return existing instance
      return Singleton.instance;
    }

    // Step 2: First time! Create new instance
    this.data = 'I am the one and only';

    // Step 3: Store instance for future use
    Singleton.instance = this;
  }
}

// First call: Creates instance
const first = new Singleton();
console.log(Singleton.instance); // Object exists now

// Second call: Returns stored instance
const second = new Singleton();
console.log(first === second); // true (same object!)

// No matter how many times you call 'new', you get the same object
const third = new Singleton();
const fourth = new Singleton();
console.log(first === third); // true
console.log(first === fourth); // true
```

---

**Real-World Example: Database Connection**

```javascript
// Imagine connecting to database is EXPENSIVE (takes time and resources)

class DatabaseConnection {
  constructor() {
    // Don't create duplicate connections!
    if (DatabaseConnection.instance) {
      console.log('Reusing existing connection');
      return DatabaseConnection.instance;
    }

    // First time: Create connection (expensive!)
    console.log('Creating new connection (expensive!)');
    this.connection = this.connect(); // Pretend this takes 2 seconds
    DatabaseConnection.instance = this;
  }

  connect() {
    return { host: 'database.example.com', port: 5432 };
  }

  query(sql) {
    console.log(`Executing: ${sql}`);
    return this.connection;
  }
}

// UserService.js
const db1 = new DatabaseConnection(); // "Creating new connection (expensive!)"
db1.query('SELECT * FROM users');

// OrderService.js
const db2 = new DatabaseConnection(); // "Reusing existing connection"
db2.query('SELECT * FROM orders');

// ProductService.js
const db3 = new DatabaseConnection(); // "Reusing existing connection"
db3.query('SELECT * FROM products');

console.log(db1 === db2); // true (all share same connection!)
console.log(db2 === db3); // true

// Benefit: Created connection ONCE, used everywhere!
```

---

**Why Would You Use Singleton?**

**Scenario 1: Expensive Resource**
```javascript
// Creating logger is expensive (opens file, allocates buffer)
class Logger {
  constructor() {
    if (Logger.instance) return Logger.instance;

    // Expensive setup
    this.logFile = openFile('/var/log/app.log');
    this.buffer = allocateBuffer(1024);
    Logger.instance = this;
  }

  log(message) {
    this.logFile.write(`[${new Date()}] ${message}\n`);
  }
}

// All parts of app share one logger (one file, one buffer)
const logger = new Logger();
```

**Scenario 2: Shared State**
```javascript
// Application config should be same everywhere
class Config {
  constructor() {
    if (Config.instance) return Config.instance;

    this.settings = {
      apiUrl: 'https://api.example.com',
      theme: 'dark',
      timeout: 5000
    };
    Config.instance = this;
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
  }
}

// moduleA.js
const config = new Config();
config.set('theme', 'light');

// moduleB.js
const config2 = new Config();
console.log(config2.get('theme')); // 'light' (same config!)
```

---

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Forgetting to return existing instance
class WrongSingleton {
  constructor() {
    if (WrongSingleton.instance) {
      // Forgot to return!
    }
    WrongSingleton.instance = this;
  }
}

const a = new WrongSingleton();
const b = new WrongSingleton();
console.log(a === b); // false (created two instances!)


// ❌ MISTAKE 2: Using Singleton for everything
class User {
  constructor(name) {
    if (User.instance) return User.instance; // BAD!
    this.name = name;
    User.instance = this;
  }
}

const user1 = new User('Alice');
const user2 = new User('Bob'); // Returns Alice, not Bob!
// Problem: You WANT multiple users, not a singleton!


// ❌ MISTAKE 3: Not understanding when to use it
class CalculatorSingleton {
  // Why is this a singleton? Multiple calculators are fine!
  constructor() {
    if (CalculatorSingleton.instance) return CalculatorSingleton.instance;
    CalculatorSingleton.instance = this;
  }
}
```

---

**When to Use Singleton:**

✅ **USE when:**
- Only one instance makes sense (database pool, logger)
- Resource is expensive to create
- Need to share state globally
- Configuration that should be consistent

❌ **DON'T USE when:**
- You might need multiple instances
- Each user/request needs own instance
- Testing is important (singletons hard to test)
- "Just because" (most classes shouldn't be singletons!)

---

**Modern Alternative: ES6 Modules**

```javascript
// Old way (Singleton class):
class Config {
  constructor() {
    if (Config.instance) return Config.instance;
    this.settings = {};
    Config.instance = this;
  }
}

export default new Config();

// Modern way (ES6 module - automatically a singleton!):
// config.js
const settings = {
  apiUrl: 'https://api.example.com',
  theme: 'dark'
};

export function get(key) {
  return settings[key];
}

export function set(key, value) {
  settings[key] = value;
}

// Import in multiple files:
// file1.js
import * as config from './config.js';
config.set('theme', 'light');

// file2.js
import * as config from './config.js';
console.log(config.get('theme')); // 'light' (same module instance!)

// ES6 modules are singletons by default - simpler!
```

---

**Explaining to PM:**

"Singleton is like having **one shared whiteboard** in the office instead of everyone having their own.

**Without Singleton:**
- Everyone has their own whiteboard (wasted money!)
- Updates on one board don't show on others (inconsistent)
- Hard to know the 'true' state
- Resource waste

**With Singleton:**
- One shared whiteboard
- Everyone sees same info
- Updates visible to all
- Saves resources

**Business value:**
- **Cost savings**: Database connections are expensive ($$). One pool of 20 connections vs. 10 pools of 20 (200 total) = huge savings
- **Consistency**: All parts of app use same configuration
- **Performance**: Don't recreate expensive resources
- **Real example**: Switching to singleton database pool saved us $500/month in AWS costs and eliminated crashes"

---

**Quick Test:**

```javascript
// Challenge: Create a Singleton cart for shopping site
// Requirements:
// - Only one cart per user session
// - Can add items
// - Can get items
// - Can clear cart

// Try it yourself! (Scroll down for answer)
//
//
//
//
//

// Answer:
class ShoppingCart {
  constructor() {
    if (ShoppingCart.instance) {
      return ShoppingCart.instance;
    }

    this.items = [];
    ShoppingCart.instance = this;
  }

  addItem(item) {
    this.items.push(item);
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = [];
  }
}

// Usage:
const cart1 = new ShoppingCart();
cart1.addItem({ name: 'Laptop', price: 1000 });

const cart2 = new ShoppingCart(); // Same cart!
cart2.addItem({ name: 'Mouse', price: 20 });

console.log(cart1.getItems()); // [Laptop, Mouse]
console.log(cart2.getItems()); // [Laptop, Mouse] (same cart!)
console.log(cart1 === cart2);  // true
```

---

**Key Takeaways:**

1. **Singleton = exactly one instance** of a class
2. **First creation wins** - subsequent calls return first instance
3. **Use for:** expensive resources, shared state, global config
4. **Don't overuse:** Most classes don't need to be singletons
5. **Modern alternative:** ES6 modules (simpler, cleaner)
6. **Remember:** Just because you CAN make it a singleton doesn't mean you SHOULD

</details>

### Resources
- [Singleton Pattern](https://www.patterns.dev/posts/singleton-pattern/)
- [JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)

---

