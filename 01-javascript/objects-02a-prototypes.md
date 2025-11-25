# Prototypes & Inheritance

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What is Prototypal Inheritance in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Uber

### Question
Explain prototypal inheritance in JavaScript. How does it differ from classical inheritance?

### Answer

**Prototypal Inheritance** is JavaScript's mechanism where objects inherit properties and methods from other objects. Every object has an internal `[[Prototype]]` link to another object.

**Key Concepts:**
- Objects inherit directly from other objects (not from classes)
- Inheritance through prototype chain
- Dynamic and flexible (can modify at runtime)
- Single inheritance chain (one prototype per object)

### Code Example

```javascript
// Creating objects with prototypal inheritance

const animal = {
  eats: true,
  walk() {
    console.log("Animal walks");
  }
};

// rabbit inherits from animal
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats);  // true (inherited from animal)
console.log(rabbit.jumps); // true (own property)
rabbit.walk();             // "Animal walks" (inherited method)

/*
PROTOTYPE CHAIN:
rabbit object
  ├─ jumps: true (own property)
  └─ [[Prototype]] → animal object
       ├─ eats: true
       ├─ walk: function
       └─ [[Prototype]] → Object.prototype → null
*/
```

**Prototype Chain Visualization:**

```javascript
const grandparent = {
  surname: "Smith"
};

const parent = Object.create(grandparent);
parent.role = "parent";

const child = Object.create(parent);
child.name = "John";

console.log(child.name);    // "John" (own)
console.log(child.role);    // "parent" (1 level up)
console.log(child.surname); // "Smith" (2 levels up)

/*
LOOKUP CHAIN:
child
  ├─ name: "John"
  └─ [[Prototype]] → parent
       ├─ role: "parent"
       └─ [[Prototype]] → grandparent
            ├─ surname: "Smith"
            └─ [[Prototype]] → Object.prototype → null

Property lookup traverses chain bottom-to-top
*/
```

**Classical vs Prototypal Inheritance:**

```javascript
// CLASSICAL (Class-based) - Java, C++
/*
class Animal {
  void eat() { }
}

class Dog extends Animal {
  void bark() { }
}

- Classes are blueprints
- Objects are instances of classes
- Inheritance from classes
- Static structure (compile-time)
*/

// PROTOTYPAL (JavaScript)
const animal = {
  eat() {
    console.log("eating");
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  console.log("barking");
};

// - Objects inherit from objects directly
// - No classes needed (before ES6)
// - Dynamic (runtime modifications)
// - More flexible

/*
KEY DIFFERENCES:
================
Classical:
- Class → Instance
- Copy behavior
- Static inheritance hierarchy

Prototypal:
- Object → Object
- Delegate behavior (shared via prototype)
- Dynamic inheritance chain
*/
```

**Constructor Function Pattern (Pre-ES6):**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} barks`);
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat();  // "Buddy is eating" (inherited)
dog.bark(); // "Buddy barks" (own method)

console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true

/*
PROTOTYPE CHAIN WITH CONSTRUCTORS:
dog object
  ├─ name: "Buddy"
  ├─ breed: "Golden Retriever"
  └─ [[Prototype]] → Dog.prototype
       ├─ bark: function
       ├─ constructor: Dog
       └─ [[Prototype]] → Animal.prototype
            ├─ eat: function
            └─ [[Prototype]] → Object.prototype → null
*/
```

**Modern Class Syntax (ES6+) - Syntactic Sugar:**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat();  // "Buddy is eating"
dog.bark(); // "Buddy barks"

/*
IMPORTANT: ES6 classes are just syntactic sugar over
prototypal inheritance. Under the hood, it's still
using prototypes!

typeof Animal // "function"
typeof Dog    // "function"

Classes are still constructor functions with prototypes!
*/
```

### Common Mistakes

❌ **Wrong**: Thinking JavaScript has true classes like Java/C++
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

// Still prototypal under the hood!
console.log(typeof Person); // "function" (not a true class)
console.log(Person.prototype); // Object with constructor
```

✅ **Correct**: Understanding classes are syntactic sugar
```javascript
// ES6 class and constructor function are equivalent
class PersonClass {
  constructor(name) { this.name = name; }
}

function PersonFunction(name) {
  this.name = name;
}

// Both work the same way internally
```

❌ **Wrong**: Modifying Object.prototype
```javascript
// ❌ Never do this - affects ALL objects
Object.prototype.newMethod = function() {};

const obj = {};
console.log(obj.newMethod); // Pollutes all objects!
```

✅ **Correct**: Use own prototype or composition
```javascript
// Create custom prototype
const myPrototype = {
  newMethod() {}
};

const obj = Object.create(myPrototype);
```

### Follow-up Questions
1. "What's the difference between `__proto__` and `prototype`?"
2. "How does property shadowing work with prototypes?"
3. "Can you modify an object's prototype after creation?"
4. "What are the performance implications of long prototype chains?"

<details>
<summary><strong>🔍 Deep Dive: V8 Hidden Classes, Prototype Chains & Performance</strong></summary>

**V8 Hidden Classes & Shape-Based Optimization:**

```javascript
// V8 creates "hidden classes" (shapes) for objects
function Dog(name) {
  this.name = name; // Shape 1: { name: string }
}

Dog.prototype.bark = function() {
  return `${this.name} barks!`;
};

const dog1 = new Dog("Rex");
const dog2 = new Dog("Max");

// dog1 and dog2 share the SAME hidden class (shape)
// V8 optimizes property access based on shape:
// 1. Check object's hidden class ID
// 2. Use pre-computed offset to access property
// 3. Inline Cache (IC) caches the lookup path

// Property lookup timing (V8 TurboFan optimized):
// Own property: ~1-2ns (direct offset access)
// Prototype property (1 level): ~3-5ns (one indirection)
// Prototype property (2 levels): ~6-10ns (two indirections)
// Prototype property (3+ levels): ~10-20ns (multiple indirections)

// Example benchmark:
console.time('own-property');
for (let i = 0; i < 1000000; i++) {
  dog1.name; // Own property access
}
console.timeEnd('own-property'); // ~2ms (1M accesses = 2ns each)

console.time('prototype-method');
for (let i = 0; i < 1000000; i++) {
  dog1.bark; // Prototype property access
}
console.timeEnd('prototype-method'); // ~5ms (1M accesses = 5ns each)
```

**Inline Cache (IC) Optimization:**

```javascript
// Monomorphic IC (fastest - one shape seen)
function getProperty(obj) {
  return obj.name; // V8 sees only Dog shape → optimizes
}

const dog1 = new Dog("Rex");
getProperty(dog1); // First call: IC records Dog shape
getProperty(dog1); // Subsequent calls: ~1ns (IC hit!)

// Polymorphic IC (slower - 2-4 shapes seen)
function Cat(name) { this.name = name; }
const cat = new Cat("Whiskers");

getProperty(dog1); // Shape 1: Dog
getProperty(cat);  // Shape 2: Cat (IC becomes polymorphic)
// Now V8 checks: "Is it Dog? If not, is it Cat?"
// Slower: ~5-10ns per access

// Megamorphic IC (slowest - 5+ shapes seen)
function Bird(name) { this.name = name; }
function Fish(name) { this.name = name; }
// ... many more shapes
// V8 gives up on optimization: ~20-50ns per access
```

**Prototype Chain Lookup Algorithm (V8 Internal):**

```javascript
// Simplified V8 property lookup (C++ pseudocode)
function PropertyLookup(object, propertyName) {
  let current = object;

  while (current !== null) {
    // 1. Check own properties via hidden class
    const descriptor = current.hiddenClass.getOwnPropertyDescriptor(propertyName);
    if (descriptor) {
      return descriptor.value; // Found!
    }

    // 2. Move up prototype chain
    current = current.__proto__;
  }

  return undefined; // Not found in entire chain
}

// Real-world timing:
const obj = { a: 1 };
// Chain: obj → Object.prototype → null (2 levels)

console.time('lookup-own');
for (let i = 0; i < 1000000; i++) {
  obj.a; // Found immediately
}
console.timeEnd('lookup-own'); // ~2ms

console.time('lookup-inherited');
for (let i = 0; i < 1000000; i++) {
  obj.toString; // Traverses 1 level up
}
console.timeEnd('lookup-inherited'); // ~5ms

console.time('lookup-not-found');
for (let i = 0; i < 1000000; i++) {
  obj.nonExistent; // Traverses entire chain to null
}
console.timeEnd('lookup-not-found'); // ~8ms
```

**Memory Layout & Efficiency:**

```javascript
// WITHOUT prototype sharing (memory inefficient)
function createDogNoProto(name) {
  return {
    name: name,
    bark() { return `${this.name} barks!`; }, // NEW function each time!
    eat() { return `${this.name} eats!`; }    // NEW function each time!
  };
}

const dogs = [];
for (let i = 0; i < 1000; i++) {
  dogs.push(createDogNoProto(`Dog${i}`));
}

// Memory usage:
// - 1,000 name strings: ~10KB (10 bytes each)
// - 1,000 bark functions: ~50KB (50 bytes each, duplicated!)
// - 1,000 eat functions: ~50KB (duplicated!)
// Total: ~110KB

// WITH prototype sharing (memory efficient)
function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function() { return `${this.name} barks!`; };
Dog.prototype.eat = function() { return `${this.name} eats!`; };

const dogs2 = [];
for (let i = 0; i < 1000; i++) {
  dogs2.push(new Dog(`Dog${i}`));
}

// Memory usage:
// - 1,000 name strings: ~10KB
// - 1 bark function: ~50 bytes (SHARED!)
// - 1 eat function: ~50 bytes (SHARED!)
// - 1,000 pointers to Dog.prototype: ~8KB (8 bytes each)
// Total: ~18KB (6x less memory!)

// Savings: 110KB - 18KB = 92KB (84% reduction)
// With 100,000 instances: 11MB vs 1.8MB (9.2MB saved!)
```

**Prototype Modification Impact:**

```javascript
// Modifying prototype affects ALL instances
function User(name) {
  this.name = name;
}

const users = [];
for (let i = 0; i < 10000; i++) {
  users.push(new User(`User${i}`));
}

// Add method to prototype
console.time('add-method');
User.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};
console.timeEnd('add-method'); // ~0.01ms

// ALL 10,000 instances now have greet method immediately!
users[0].greet(); // Works instantly
users[9999].greet(); // Works instantly

// V8 optimization:
// - Doesn't copy method to each instance
// - Updates hidden class to include new prototype property
// - Inline Caches are invalidated and rebuilt on next access
```

**Prototype Chain vs Class Hierarchy Performance:**

```javascript
// Deep prototype chain (bad for performance)
const level1 = { prop1: 1 };
const level2 = Object.create(level1); // proto chain: 2 levels
const level3 = Object.create(level2); // proto chain: 3 levels
const level4 = Object.create(level3); // proto chain: 4 levels
const level5 = Object.create(level4); // proto chain: 5 levels
level1.method = function() { return 'data'; };

console.time('deep-chain');
for (let i = 0; i < 1000000; i++) {
  level5.method(); // Traverses 5 levels each time!
}
console.timeEnd('deep-chain'); // ~50ms

// Flat structure (good for performance)
const flatObj = Object.create(level1); // proto chain: 2 levels
flatObj.method = flatObj.__proto__.method; // Cache method

console.time('flat');
for (let i = 0; i < 1000000; i++) {
  flatObj.method(); // Direct access!
}
console.timeEnd('flat'); // ~2ms (25x faster!)

// Rule: Keep prototype chains < 3 levels for optimal performance
```

**V8 Optimization Tips:**

```javascript
// ✅ GOOD: Consistent object shape
function createUser(name, age) {
  return { name, age }; // Always same shape
}

const users = [
  createUser("Alice", 25),
  createUser("Bob", 30)
];
// V8 creates ONE hidden class for all users → fast!

// ❌ BAD: Inconsistent shapes
const users2 = [
  { name: "Alice", age: 25 },
  { name: "Bob", city: "NYC" }, // Different shape!
  { age: 30, name: "Charlie" }  // Different property order!
];
// V8 creates 3 different hidden classes → slow!

// ✅ GOOD: Add properties in same order
function User(name, age) {
  this.name = name; // Always add name first
  this.age = age;   // Always add age second
}

// ❌ BAD: Dynamic property addition
const obj = {};
obj.a = 1; // Shape change 1
obj.b = 2; // Shape change 2
obj.c = 3; // Shape change 3
// Multiple shape transitions → slower

// ✅ BETTER: Initialize all at once
const obj2 = { a: 1, b: 2, c: 3 }; // One shape from start
```

**Prototype Pollution Performance Impact:**

```javascript
// Adding to Object.prototype (BAD - slows down ALL objects)
Object.prototype.customMethod = function() {
  return "custom";
};

// Now EVERY object has to check Object.prototype for customMethod
const obj = {};
console.time('polluted-lookup');
for (let i = 0; i < 1000000; i++) {
  obj.toString; // Has to traverse polluted chain
}
console.timeEnd('polluted-lookup'); // ~10ms (slower due to pollution)

// Clean prototype chain is faster
delete Object.prototype.customMethod;

console.time('clean-lookup');
for (let i = 0; i < 1000000; i++) {
  obj.toString; // Faster lookup
}
console.timeEnd('clean-lookup'); // ~5ms (2x faster!)
```

**Key Takeaways:**

1. **Prototype sharing saves memory**: 1,000 instances = 1 method copy (84% memory reduction)
2. **Inline Caches optimize lookups**: Monomorphic (fast) > Polymorphic (ok) > Megamorphic (slow)
3. **Keep chains short**: < 3 levels for optimal performance (~5ns vs ~20ns)
4. **Consistent object shapes**: V8 optimizes when objects have same structure
5. **Avoid Object.prototype pollution**: Slows down ALL objects globally

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Prototype Pollution Breaking Production</strong></summary>

**Scenario:** Your e-commerce application crashes in production after deploying a utility library that adds a `clone` method to `Array.prototype`. The bug only appears when users filter products, and debugging shows mysterious extra properties in filtered arrays.

**The Problem:**

```javascript
// ❌ BAD: Third-party utility library added this
Array.prototype.clone = function() {
  return [...this];
};

// Your product filtering code
const products = [
  { id: 1, name: "Laptop", price: 999 },
  { id: 2, name: "Mouse", price: 29 },
  { id: 3, name: "Keyboard", price: 79 }
];

const filtered = products.filter(p => p.price < 100);

// Display products
function displayProducts(products) {
  for (const key in products) {
    console.log(key, products[key]);
    // Expected: "0", { id: 2, ... }
    //          "1", { id: 3, ... }
  }
}

displayProducts(filtered);
// Output:
// 0 { id: 2, name: "Mouse", price: 29 }
// 1 { id: 3, name: "Keyboard", price: 79 }
// clone function() { return [...this]; } ← BUG! Extra property!

// UI breaks because template expects objects, gets function
// Error: "Cannot read property 'name' of undefined"
// Users see blank product cards!
```

**Production Impact:**

```javascript
// Metrics before fix:
// - Product page crashes: 850/day (12% of traffic)
// - Revenue loss: ~$15k/day (abandoned carts)
// - User complaints: 145/week
// - Cart abandonment rate: 35% (was 8%)
// - Error rate: 4.2% (was 0.1%)
// - Customer support tickets: 78/day

// Error logs:
// TypeError: Cannot read property 'name' of undefined
// at ProductCard.render (ProductCard.jsx:24)
// Frequency: 850 errors/day across 2,500 users

// Root cause analysis (took 6 hours to find!):
// 1. for...in loop includes inherited enumerable properties
// 2. Array.prototype.clone is enumerable by default
// 3. UI code assumes array only has numeric indices
// 4. clone function passed to React component → crash
```

**Debugging Process:**

```javascript
// Step 1: Log what we're getting
function displayProducts(products) {
  console.log('Products type:', Array.isArray(products)); // true
  console.log('Products length:', products.length); // 2
  console.log('Products keys:', Object.keys(products)); // ["0", "1"]
  console.log('Products own props:', Object.getOwnPropertyNames(products));
  // ["0", "1", "length"]

  // Aha! for...in includes prototype properties!
  console.log('for...in results:');
  for (const key in products) {
    console.log(key); // "0", "1", "clone" ← FOUND IT!
  }
}

// Step 2: Check Array.prototype
console.log('Array.prototype properties:');
for (const key in []) {
  console.log(key); // "clone" - This shouldn't be here!
}

// Step 3: Check if property is enumerable
const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'clone');
console.log('clone descriptor:', descriptor);
// {
//   value: [Function: clone],
//   writable: true,
//   enumerable: true,  ← PROBLEM! Should be false
//   configurable: true
// }

// Step 4: Find who added it
console.trace('Who polluted Array.prototype?');
// Stack trace points to node_modules/utility-lib/index.js
```

**Solution 1: Fix the Library (Non-Enumerable Property):**

```javascript
// ✅ FIX: Make prototype addition non-enumerable
Object.defineProperty(Array.prototype, 'clone', {
  value: function() {
    return [...this];
  },
  writable: true,
  enumerable: false,  // Won't show up in for...in!
  configurable: true
});

// Now for...in works correctly
const products = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Mouse" }
];

for (const key in products) {
  console.log(key); // Only "0", "1" (no "clone"!)
}

// But clone method still works
console.log(products.clone()); // [{ id: 1, ... }, { id: 2, ... }]
```

**Solution 2: Fix the Code (Use Array-Specific Iteration):**

```javascript
// ✅ BETTER: Never use for...in with arrays
function displayProducts(products) {
  // Use forEach (only iterates actual elements)
  products.forEach((product, index) => {
    console.log(index, product);
  });

  // Or for...of (only iterates values)
  for (const product of products) {
    console.log(product);
  }

  // Or traditional for loop
  for (let i = 0; i < products.length; i++) {
    console.log(i, products[i]);
  }

  // Or Array methods
  products.map(product => {
    console.log(product);
  });
}

// All of these ignore prototype properties ✅
```

**Solution 3: ESLint Rule to Prevent Future Issues:**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Disallow for...in loops with arrays
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement[right.type="ArrayExpression"], ForInStatement[right.type="Identifier"][right.name=/^(arr|array|list|items)/]',
        message: 'for...in loops with arrays are forbidden. Use for...of, forEach, or map instead.'
      }
    ],

    // Warn about prototype modifications
    'no-extend-native': 'error',
  }
};

// Now ESLint catches:
for (const key in myArray) { } // ❌ Error: for...in with arrays forbidden
```

**Solution 4: Defensive HasOwnProperty Check:**

```javascript
// ✅ DEFENSIVE: Check own properties only
function displayProducts(products) {
  for (const key in products) {
    if (products.hasOwnProperty(key)) {
      console.log(key, products[key]); // Only own properties
    }
  }
}

// Or use Object.hasOwn (modern)
function displayProductsModern(products) {
  for (const key in products) {
    if (Object.hasOwn(products, key)) {
      console.log(key, products[key]);
    }
  }
}
```

**Solution 5: Remove Prototype Pollution at App Startup:**

```javascript
// ✅ WORKAROUND: Clean up polluted prototypes on app init
// In your app's entry point (index.js or main.js)
function cleanPrototypePollution() {
  const pollutedProps = ['clone', 'each', 'compact']; // Known pollutants

  pollutedProps.forEach(prop => {
    if (Array.prototype.hasOwnProperty(prop)) {
      delete Array.prototype[prop];
      console.warn(`Removed polluted Array.prototype.${prop}`);
    }
  });

  // Detect unknown pollution
  const standardProps = ['length', 'constructor'];
  for (const key in []) {
    if (!standardProps.includes(key)) {
      console.error(`Unknown prototype pollution detected: Array.prototype.${key}`);
      delete Array.prototype[key];
    }
  }
}

// Call on app startup
cleanPrototypePollution();
```

**Proper Polyfill Pattern:**

```javascript
// ✅ CORRECT WAY: Polyfill with proper checks
if (!Array.prototype.last) {
  Object.defineProperty(Array.prototype, 'last', {
    value: function() {
      return this[this.length - 1];
    },
    writable: true,
    enumerable: false,  // KEY: Non-enumerable!
    configurable: true
  });
}

// Or use a helper function instead (even better)
function last(array) {
  return array[array.length - 1];
}

// Usage
const arr = [1, 2, 3];
console.log(last(arr)); // 3 (no prototype modification!)
```

**Real Metrics After Fix:**

```javascript
// After implementing Solution 2 + 3 (fixed iteration + ESLint):
// - Product page crashes: 0/day ✅
// - Revenue recovered: $15k/day
// - User complaints: 2/week (unrelated issues)
// - Cart abandonment: 8% (back to normal)
// - Error rate: 0.1% (baseline)
// - Customer support tickets: 5/day (97% reduction)
// - Developer time saved: 20 hours/week (no more prototype debugging)

// Prevention measures:
// - ESLint rule catches for...in with arrays
// - Code review checklist includes prototype check
// - Automated tests cover prototype pollution scenarios
// - Dependency audit flags libraries that modify natives
```

**Complex Example: Framework Conflict:**

```javascript
// Real-world scenario: Two libraries fighting over Array.prototype

// Library A adds:
Array.prototype.first = function() { return this[0]; };

// Library B also adds (different implementation):
Array.prototype.first = function() {
  return this.length > 0 ? this[0] : undefined;
};

// Your code breaks because implementation changed mid-runtime!
const items = [1, 2, 3];
const firstItem = items.first(); // Which implementation runs? Unknown!

// ✅ SOLUTION: Use composition instead of inheritance
const ArrayUtils = {
  first(arr) {
    return arr.length > 0 ? arr[0] : undefined;
  },
  last(arr) {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
  },
  clone(arr) {
    return [...arr];
  }
};

// Usage (no prototype pollution!)
const firstItem = ArrayUtils.first(items);
const lastItem = ArrayUtils.last(items);
const cloned = ArrayUtils.clone(items);

// Or create instances with methods (class-based approach)
class EnhancedArray extends Array {
  first() {
    return this.length > 0 ? this[0] : undefined;
  }

  last() {
    return this.length > 0 ? this[this.length - 1] : undefined;
  }

  clone() {
    return new EnhancedArray(...this);
  }
}

const items2 = new EnhancedArray(1, 2, 3);
items2.first(); // 1
items2.last();  // 3
// No global prototype pollution!
```

**Lesson Learned:**

1. **Never modify native prototypes** (Array, Object, String, etc.) in production code
2. **Use non-enumerable properties** if you MUST add to prototypes (polyfills only)
3. **Never use for...in with arrays** - Use `for...of`, `forEach`, or `map`
4. **Add ESLint rules** to prevent prototype modifications
5. **Use composition over inheritance** - Helper functions, not prototype methods

</details>

<details>
<summary><strong>⚖️ Trade-offs: Prototypal Inheritance vs Alternatives</strong></summary>

### 1. Prototypal Inheritance vs Factory Functions

```javascript
// Pattern 1: Prototypal inheritance (constructor + prototype)
function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function() {
  return `${this.name} barks`;
};

const dog1 = new Dog("Rex");

// Pattern 2: Factory function (closure)
function createDog(name) {
  return {
    name,
    bark() {
      return `${name} barks`;
    }
  };
}

const dog2 = createDog("Max");
```

| Aspect | Prototypal Inheritance | Factory Functions |
|--------|----------------------|-------------------|
| **Memory (1,000 instances)** | ✅ ~18KB (1 method) | ❌ ~110KB (1,000 methods) |
| **Performance** | ✅ Faster (~2ns access) | ⚠️ Slower (~5ns access) |
| **instanceof works** | ✅ Yes | ❌ No |
| **Method sharing** | ✅ All instances share | ❌ Each has own copy |
| **Privacy** | ⚠️ No private vars | ✅ Closure provides privacy |
| **this binding** | ⚠️ Can be confusing | ✅ No this issues |
| **Inheritance** | ✅ Easy to extend | ⚠️ Harder to compose |
| **Debugging** | ✅ Clear constructor name | ⚠️ Generic object |

**When to use each:**

```javascript
// ✅ Use prototypal inheritance when:
// - Creating many instances (memory efficiency)
// - Need instanceof checks
// - Want classical OOP patterns
// - Building class hierarchies

function User(name, email) {
  this.name = name;
  this.email = email;
}

User.prototype.sendEmail = function(subject, body) {
  // Shared method across all users
};

const users = Array.from({ length: 10000 }, (_, i) => new User(`User${i}`, `user${i}@example.com`));
// Memory: ~100KB (vs 5MB with factory functions!)


// ✅ Use factory functions when:
// - Need true private variables
// - Few instances (< 100)
// - Avoiding 'this' complexity
// - Functional programming style

function createCounter() {
  let count = 0; // Private variable (closure)

  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment();
console.log(counter.count); // undefined (private!)
console.log(counter.getCount()); // 1
```

### 2. Classical Inheritance vs Prototypal Inheritance

```javascript
// Classical (Java/C++ style via ES6 classes)
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    return `${this.name} eats`;
  }
}

class Dog extends Animal {
  bark() {
    return `${this.name} barks`;
  }
}

// Prototypal (pure JavaScript)
const animal = {
  eat() {
    return `${this.name} eats`;
  }
};

const dog = Object.create(animal);
dog.bark = function() {
  return `${this.name} barks`;
};
```

| Aspect | Classical (ES6 class) | Prototypal (Object.create) |
|--------|---------------------|---------------------------|
| **Syntax** | ✅ Familiar (Java-like) | ⚠️ Less familiar |
| **Static analysis** | ✅ Better (TypeScript) | ⚠️ Harder to type |
| **Flexibility** | ⚠️ Rigid structure | ✅ Very flexible |
| **Runtime changes** | ⚠️ Limited | ✅ Fully dynamic |
| **Performance** | ✅ Same (under hood) | ✅ Same |
| **Tooling support** | ✅ Excellent | ⚠️ Limited |
| **Learning curve** | ✅ Easier for OOP devs | ⚠️ Steeper |

**Decision matrix:**

```javascript
// ✅ Use ES6 classes when:
// - Team familiar with OOP
// - Using TypeScript
// - Need clear structure
// - Building large apps

class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUser(id) {
    return await this.db.users.findById(id);
  }
}

// ✅ Use prototypal when:
// - Need maximum flexibility
// - Functional programming style
// - Runtime object composition
// - Dynamic behavior changes

const userService = Object.create(baseService);
userService.getUser = async function(id) {
  return await this.db.users.findById(id);
};

// Can modify at runtime
userService.cacheResults = true;
if (userService.cacheResults) {
  userService.getUser = cacheWrapper(userService.getUser);
}
```

### 3. Prototype Chain Depth Trade-offs

```javascript
// Shallow chain (2 levels)
function User(name) {
  this.name = name;
}
User.prototype.greet = function() { return `Hi, ${this.name}`; };

const user = new User("Alice");
// Chain: user → User.prototype → Object.prototype → null (3 levels)

// Deep chain (5 levels)
function Entity() {}
Entity.prototype.id = 1;

function Person() {}
Person.prototype = Object.create(Entity.prototype);

function Employee() {}
Employee.prototype = Object.create(Person.prototype);

function Manager() {}
Manager.prototype = Object.create(Employee.prototype);

const manager = new Manager();
// Chain: manager → Manager.prototype → Employee.prototype → Person.prototype → Entity.prototype → Object.prototype → null (7 levels!)
```

| Chain Depth | Property Lookup Time | Memory | Debugging | Recommended? |
|-------------|---------------------|--------|-----------|--------------|
| **1-2 levels** | ~2-5ns | ✅ Minimal | ✅ Easy | ✅ Yes |
| **3-4 levels** | ~6-10ns | ✅ Ok | ⚠️ Harder | ⚠️ Use sparingly |
| **5+ levels** | ~10-20ns | ⚠️ Overhead | ❌ Very hard | ❌ Avoid |

**Performance comparison:**

```javascript
// Benchmark: 1M property lookups

// Shallow chain (2 levels)
console.time('shallow');
for (let i = 0; i < 1000000; i++) {
  user.greet; // 2 levels up
}
console.timeEnd('shallow'); // ~5ms

// Deep chain (5 levels)
console.time('deep');
for (let i = 0; i < 1000000; i++) {
  manager.id; // 5 levels up!
}
console.timeEnd('deep'); // ~20ms (4x slower!)
```

**Best practice:**

```javascript
// ❌ AVOID: Deep inheritance hierarchies
class Entity {}
class LivingThing extends Entity {}
class Animal extends LivingThing {}
class Mammal extends Animal {}
class Dog extends Mammal {} // 5 levels deep!

// ✅ PREFER: Composition over inheritance
class Dog {
  constructor() {
    this.entity = new Entity();
    this.traits = new MammalTraits();
    this.behaviors = new AnimalBehaviors();
  }

  // Delegate to composed objects
  getId() { return this.entity.id; }
  breathe() { return this.traits.breathe(); }
  eat() { return this.behaviors.eat(); }
}

// Flat structure: only 2 levels in prototype chain!
```

### 4. Shared State via Prototype (Gotcha!)

```javascript
// ⚠️ DANGEROUS: Mutable objects on prototype are SHARED!

function User(name) {
  this.name = name;
}

User.prototype.friends = []; // ❌ BAD: Shared array!

const alice = new User("Alice");
const bob = new User("Bob");

alice.friends.push("Charlie");
console.log(bob.friends); // ["Charlie"] ← BUG! Bob didn't add Charlie!

// Both instances share the SAME array!
console.log(alice.friends === bob.friends); // true (same reference)
```

| Pattern | Shared State | Safe? |
|---------|-------------|-------|
| **Primitive on prototype** | ✅ Each instance can override | ✅ Safe |
| **Method on prototype** | ✅ Shared (intended) | ✅ Safe |
| **Mutable object on prototype** | ❌ Shared (unintended!) | ❌ DANGEROUS |
| **Mutable object in constructor** | ✅ Each instance has own | ✅ Safe |

**Solution:**

```javascript
// ✅ CORRECT: Initialize mutable state in constructor
function User(name) {
  this.name = name;
  this.friends = []; // Each instance gets own array
}

const alice = new User("Alice");
const bob = new User("Bob");

alice.friends.push("Charlie");
console.log(bob.friends); // [] ✅ Bob's array is separate
console.log(alice.friends === bob.friends); // false
```

### 5. Performance: Prototypes vs Copying

```javascript
// Pattern 1: Prototype (shared methods)
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() { return "woof"; };

// Pattern 2: Copy methods to each instance
function DogCopy(name) {
  this.name = name;
  this.bark = function() { return "woof"; }; // New function each time
}

// Create 10,000 instances
const dogs1 = Array.from({ length: 10000 }, (_, i) => new Dog(`Dog${i}`));
const dogs2 = Array.from({ length: 10000 }, (_, i) => new DogCopy(`Dog${i}`));

// Memory usage:
// dogs1: ~80KB (1 bark function shared)
// dogs2: ~500KB (10,000 bark functions)

// Property access speed:
console.time('prototype-access');
for (let i = 0; i < 1000000; i++) {
  dogs1[0].bark();
}
console.timeEnd('prototype-access'); // ~3ms

console.time('own-property-access');
for (let i = 0; i < 1000000; i++) {
  dogs2[0].bark();
}
console.timeEnd('own-property-access'); // ~2ms

// Trade-off: Prototype is 6x less memory but 50% slower access
```

**Rule of thumb:**

| Scenario | Best Choice | Reason |
|----------|-------------|--------|
| **10,000+ instances** | Prototype | Memory savings >> speed loss |
| **< 100 instances** | Either | Negligible difference |
| **Hot path (called millions of times)** | Own property | Speed matters |
| **Infrequent calls** | Prototype | Memory matters |

### 6. Debugging: Prototype Chain vs Flat Objects

```javascript
// Prototype chain (harder to debug)
function User(name) {
  this.name = name;
}
User.prototype.greet = function() { return `Hi, ${this.name}`; };

const user = new User("Alice");

console.log(user);
// Output in DevTools:
// User {
//   name: "Alice"
//   [[Prototype]]: Object
//     greet: f()
//     constructor: f User(name)
//     [[Prototype]]: Object
// }
// Need to expand [[Prototype]] to see methods!

// Flat object (easier to debug)
const user2 = {
  name: "Alice",
  greet() { return `Hi, ${this.name}`; }
};

console.log(user2);
// Output in DevTools:
// {
//   name: "Alice"
//   greet: f greet()
// }
// All properties visible immediately!
```

**Summary Decision Matrix:**

| Use Case | Recommended Pattern | Reason |
|----------|-------------------|--------|
| **Many instances (1000+)** | Prototype | Memory efficiency |
| **Few instances (< 100)** | Factory/Flat object | Simplicity |
| **Need privacy** | Factory + closure | True private vars |
| **OOP patterns** | ES6 classes | Familiarity |
| **Maximum flexibility** | Object.create | Dynamic composition |
| **Performance critical** | Own properties | Faster access |
| **Library/Framework** | Prototype | Consistent API |

</details>

<details>
<summary><strong>💬 Explain to Junior: Prototypes Made Simple</strong></summary>

**Simple Analogy: Shared Instruction Manual**

Think of a prototype like a shared instruction manual for all objects of the same type:

```javascript
// Creating a "Dog" type
function Dog(name) {
  this.name = name; // Each dog has its OWN name (unique)
}

// Put shared instructions in the manual (prototype)
Dog.prototype.bark = function() {
  return `${this.name} says woof!`;
};

Dog.prototype.eat = function() {
  return `${this.name} is eating`;
};

// Create two dogs
const rex = new Dog('Rex');
const max = new Dog('Max');

rex.bark(); // "Rex says woof!"
max.bark(); // "Max says woof!"

// Rex and Max share the SAME bark function
console.log(rex.bark === max.bark); // true (same manual!)
```

**Why It's Like a Manual:**
- Each dog has its own NAME (unique to them)
- But they ALL share the same INSTRUCTIONS for barking and eating
- 1 manual for 1,000 dogs = saves paper (memory!)
- If you UPDATE the manual, ALL dogs get the new instructions instantly

**Visual Representation:**

```
┌─────────────┐      ┌─────────────┐
│   rex       │      │   max       │
│ name: "Rex" │      │ name: "Max" │
└──────┬──────┘      └──────┬──────┘
       │                    │
       └────────┬───────────┘
                ▼
        ┌───────────────┐
        │ Dog.prototype │  ← Shared manual!
        │               │
        │ bark() {...}  │  ← All dogs use this
        │ eat()  {...}  │
        └───────────────┘
```

**Real-World Example: Game Characters**

```javascript
// Without prototypes (BAD - wastes memory)
function createWarrior(name) {
  return {
    name: name,
    health: 100,
    attack() { return `${name} attacks!`; },    // New function every time!
    defend() { return `${name} defends!`; },    // New function every time!
    heal() { return `${name} heals!`; }         // New function every time!
  };
}

const warrior1 = createWarrior("Aragorn");
const warrior2 = createWarrior("Legolas");
const warrior3 = createWarrior("Gimli");

// Memory: 3 warriors × 3 functions = 9 function copies in memory!
console.log(warrior1.attack === warrior2.attack); // false (different functions!)


// With prototypes (GOOD - saves memory)
function Warrior(name) {
  this.name = name;
  this.health = 100; // Each warrior has own health
}

// Shared methods on prototype
Warrior.prototype.attack = function() {
  return `${this.name} attacks!`;
};

Warrior.prototype.defend = function() {
  return `${this.name} defends!`;
};

Warrior.prototype.heal = function() {
  return `${this.name} heals!`;
  this.health += 20;
};

const warrior1 = new Warrior("Aragorn");
const warrior2 = new Warrior("Legolas");
const warrior3 = new Warrior("Gimli");

// Memory: 3 warriors share 3 functions = only 3 function copies!
console.log(warrior1.attack === warrior2.attack); // true (same function!)

// 1,000 warriors? Still only 3 functions in memory! 🎉
```

**The Prototype Chain: Looking Up**

When you ask for a property, JavaScript looks in multiple places:

```javascript
function Dog(name) {
  this.name = name; // Step 1: Own property
}

Dog.prototype.species = "Canine"; // Step 2: Prototype
Dog.prototype.bark = function() { return "Woof!"; };

const rex = new Dog("Rex");

// When you access rex.name:
console.log(rex.name);
// 1. Check rex object → FOUND "Rex"! ✅ Return it
// 2. (Doesn't need to check prototype)

// When you access rex.species:
console.log(rex.species);
// 1. Check rex object → NOT found
// 2. Check Dog.prototype → FOUND "Canine"! ✅ Return it

// When you access rex.toString (built-in):
console.log(rex.toString());
// 1. Check rex object → NOT found
// 2. Check Dog.prototype → NOT found
// 3. Check Object.prototype → FOUND toString()! ✅ Return it

// When you access rex.nonExistent:
console.log(rex.nonExistent);
// 1. Check rex object → NOT found
// 2. Check Dog.prototype → NOT found
// 3. Check Object.prototype → NOT found
// 4. Check null (end of chain) → ❌ Return undefined
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Putting arrays/objects on prototype
function User(name) {
  this.name = name;
}

User.prototype.friends = []; // BAD! Shared array!

const alice = new User("Alice");
const bob = new User("Bob");

alice.friends.push("Charlie");
console.log(bob.friends); // ["Charlie"] ← BUG!
// Alice and Bob share the SAME friends array!

// ✅ FIX: Put arrays/objects in constructor
function User(name) {
  this.name = name;
  this.friends = []; // Each user gets own array
}


// ❌ MISTAKE 2: Forgetting 'new' keyword
function Dog(name) {
  this.name = name; // 'this' is the new dog object
}

const rex = Dog("Rex"); // ❌ Forgot 'new'!
console.log(rex); // undefined
console.log(window.name); // "Rex" (accidentally created global variable!)

// ✅ FIX: Always use 'new'
const rex = new Dog("Rex"); // ✅ Creates new object


// ❌ MISTAKE 3: Overwriting prototype instead of adding to it
function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function() { return "Woof"; };

// Later...
Dog.prototype = { // ❌ Overwrites entire prototype!
  eat() { return "Eating"; }
};

const rex = new Dog("Rex");
rex.bark(); // Error: bark is not a function (lost it!)

// ✅ FIX: Add to existing prototype
Dog.prototype.eat = function() { return "Eating"; };
// Now both bark() and eat() exist!
```

**Explaining to PM:**

"Prototypes are like shared equipment in an office:

**Without prototypes** (everyone has their own stapler):
- 100 employees = 100 staplers
- If stapler design changes, need to replace 100 staplers
- Wastes money and space

**With prototypes** (shared supply room):
- 100 employees share 5 staplers in supply room
- If stapler design changes, replace 5 staplers
- Saves money and space

**In programming:**
- 1,000 objects sharing 10 methods = 10 function copies
- 1,000 objects each with 10 methods = 10,000 function copies
- Prototype saves 99% memory! 🎉

**Business value:**
- Apps run faster (less memory = better performance)
- Can handle more users (memory efficient)
- Code is easier to update (change prototype = all objects updated)
- Industry standard (every JavaScript developer knows this)"

**Practice Exercise:**

```javascript
// Create a Car prototype system

// 1. Constructor for Car
function Car(brand, model) {
  this.brand = brand;
  this.model = model;
  this.speed = 0;
}

// 2. Add shared methods to prototype
Car.prototype.accelerate = function() {
  this.speed += 10;
  return `${this.brand} ${this.model} is now going ${this.speed} km/h`;
};

Car.prototype.brake = function() {
  this.speed = Math.max(0, this.speed - 10);
  return `${this.brand} ${this.model} slowed to ${this.speed} km/h`;
};

Car.prototype.describe = function() {
  return `This is a ${this.brand} ${this.model}`;
};

// 3. Create instances
const tesla = new Car("Tesla", "Model 3");
const toyota = new Car("Toyota", "Camry");

console.log(tesla.describe()); // "This is a Tesla Model 3"
console.log(tesla.accelerate()); // "Tesla Model 3 is now going 10 km/h"
console.log(tesla.accelerate()); // "Tesla Model 3 is now going 20 km/h"

console.log(toyota.describe()); // "This is a Toyota Camry"
console.log(toyota.accelerate()); // "Toyota Camry is now going 10 km/h"

// 4. Verify they share methods but have different speeds
console.log(tesla.accelerate === toyota.accelerate); // true (shared!)
console.log(tesla.speed === toyota.speed); // false (different speeds!)
```

**Key Takeaways for Juniors:**

1. **Own properties** = Unique to each object (name, age, speed, etc.)
2. **Prototype properties** = Shared by all objects (methods, constants)
3. **Memory rule**: Put methods on prototype, data in constructor
4. **Lookup rule**: Own properties first, then prototype, then prototype's prototype, until null
5. **Always use `new`** when creating instances from constructor functions

**Interview Answer Template:**

"Prototypal inheritance is JavaScript's way of sharing behavior between objects. Instead of copying methods to each object, objects link to a prototype object that contains shared methods. This saves memory because 1,000 objects can share one set of methods instead of having 1,000 copies. For example, [give Dog/Car example]. The prototype chain is how JavaScript looks up properties - it checks the object first, then its prototype, then the prototype's prototype, until it finds the property or reaches null."

</details>

### Resources
- [MDN: Inheritance and the Prototype Chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [Understanding Prototypal Inheritance](https://javascript.info/prototype-inheritance)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)

---

## Question 2: Explain the Prototype Chain

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Netflix

### Question
What is the prototype chain? How does property lookup work through the chain?

### Answer

The **Prototype Chain** is a series of links between objects where each object has a reference to its prototype. Property lookup traverses this chain from the object up to `Object.prototype` and finally `null`.

### Property Lookup Algorithm

1. Check if property exists on object itself
2. If not, check object's `[[Prototype]]`
3. Continue up chain until property found or reach `null`
4. If not found in entire chain → `undefined`

### Code Example

```javascript
const obj = {
  a: 1
};

// Prototype chain: obj → Object.prototype → null

console.log(obj.a); // 1 (found on obj)
console.log(obj.toString()); // "[object Object]" (from Object.prototype)
console.log(obj.nonExistent); // undefined (not in chain)

/*
LOOKUP PROCESS:
===============
obj.a:
1. Check obj → found! Return 1

obj.toString:
1. Check obj → not found
2. Check Object.prototype → found! Return function

obj.nonExistent:
1. Check obj → not found
2. Check Object.prototype → not found
3. Check null → end of chain
4. Return undefined
*/
```

**Multi-Level Chain:**

```javascript
const level1 = {
  prop1: "Level 1"
};

const level2 = Object.create(level1);
level2.prop2 = "Level 2";

const level3 = Object.create(level2);
level3.prop3 = "Level 3";

console.log(level3.prop3); // "Level 3" (found immediately)
console.log(level3.prop2); // "Level 2" (1 level up)
console.log(level3.prop1); // "Level 1" (2 levels up)

/*
CHAIN VISUALIZATION:
====================
level3 { prop3: "Level 3" }
  ↓ [[Prototype]]
level2 { prop2: "Level 2" }
  ↓ [[Prototype]]
level1 { prop1: "Level 1" }
  ↓ [[Prototype]]
Object.prototype { toString, valueOf, ... }
  ↓ [[Prototype]]
null (end of chain)
*/
```

**Checking Prototype Chain:**

```javascript
const parent = { inherited: true };
const child = Object.create(parent);
child.own = true;

// hasOwnProperty - checks only own properties
console.log(child.hasOwnProperty('own'));       // true
console.log(child.hasOwnProperty('inherited')); // false

// 'in' operator - checks entire prototype chain
console.log('own' in child);       // true
console.log('inherited' in child); // true

// Object.getPrototypeOf - get prototype
console.log(Object.getPrototypeOf(child) === parent); // true

// isPrototypeOf - check if object is in another's chain
console.log(parent.isPrototypeOf(child)); // true
console.log(Object.prototype.isPrototypeOf(child)); // true
```

**Constructor Function Prototype Chain:**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

const john = new Person("John");

console.log(john.name); // "John" (own property)
console.log(john.greet()); // "Hello, I'm John" (from Person.prototype)
console.log(john.toString()); // "[object Object]" (from Object.prototype)

/*
PROTOTYPE CHAIN:
================
john
  ├─ name: "John" (own)
  └─ [[Prototype]] → Person.prototype
       ├─ greet: function
       ├─ constructor: Person
       └─ [[Prototype]] → Object.prototype
            ├─ toString: function
            ├─ valueOf: function
            ├─ hasOwnProperty: function
            └─ [[Prototype]] → null
*/

// Verify chain
console.log(Object.getPrototypeOf(john) === Person.prototype); // true
console.log(Object.getPrototypeOf(Person.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null
```

**Property Shadowing:**

```javascript
const parent = {
  value: 10,
  getValue() {
    return this.value;
  }
};

const child = Object.create(parent);
console.log(child.value); // 10 (inherited)

// Shadow the property
child.value = 20;
console.log(child.value); // 20 (own property shadows inherited)

// Parent unchanged
console.log(parent.value); // 10

// Delete own property reveals inherited
delete child.value;
console.log(child.value); // 10 (inherited again)

/*
SHADOWING:
==========
Before child.value = 20:
child → [[Prototype]] → parent { value: 10 }

After child.value = 20:
child { value: 20 } ← stops here
  ↓
parent { value: 10 } ← not reached

After delete child.value:
child → [[Prototype]] → parent { value: 10 } ← found here
*/
```

**Method Delegation:**

```javascript
const calculator = {
  add(a, b) {
    return a + b;
  }
};

const advancedCalc = Object.create(calculator);
advancedCalc.multiply = function(a, b) {
  return a * b;
};

advancedCalc.addAndMultiply = function(a, b, c) {
  // Delegates to parent's add method
  const sum = this.add(a, b);
  return this.multiply(sum, c);
};

console.log(advancedCalc.addAndMultiply(2, 3, 4)); // (2+3)*4 = 20

/*
DELEGATION:
-----------
advancedCalc.add() → not found on advancedCalc
                   → delegates to calculator.add()

This is the essence of prototypal inheritance:
behavior delegation, not copying!
*/
```

**Arrays and Prototype Chain:**

```javascript
const arr = [1, 2, 3];

/*
ARRAY PROTOTYPE CHAIN:
======================
arr
  ├─ 0: 1
  ├─ 1: 2
  ├─ 2: 3
  ├─ length: 3
  └─ [[Prototype]] → Array.prototype
       ├─ push: function
       ├─ pop: function
       ├─ map: function
       ├─ filter: function
       └─ [[Prototype]] → Object.prototype
            └─ [[Prototype]] → null
*/

console.log(arr.hasOwnProperty('0')); // true (element)
console.log(arr.hasOwnProperty('push')); // false (inherited)
console.log('push' in arr); // true (in prototype chain)

// Verify chain
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(Array.prototype.isPrototypeOf(arr)); // true
```

**Functions and Prototype Chain:**

```javascript
function myFunction() {}

/*
FUNCTION PROTOTYPE CHAIN:
=========================
myFunction
  ├─ name: "myFunction"
  ├─ length: 0
  ├─ prototype: { constructor: myFunction }
  └─ [[Prototype]] → Function.prototype
       ├─ call: function
       ├─ apply: function
       ├─ bind: function
       └─ [[Prototype]] → Object.prototype
            └─ [[Prototype]] → null
*/

console.log(typeof myFunction); // "function"
console.log(myFunction.call); // [Function: call]
console.log(myFunction.hasOwnProperty('call')); // false
```

### Common Mistakes

❌ **Wrong**: Confusing `__proto__` with `prototype`
```javascript
function Person() {}

const john = new Person();

// ❌ Confusion
console.log(john.prototype); // undefined (instances don't have prototype property)

// ✅ Correct
console.log(john.__proto__ === Person.prototype); // true
console.log(Object.getPrototypeOf(john) === Person.prototype); // true
```

✅ **Understanding:**
- `prototype`: Property on constructor functions
- `__proto__` / `[[Prototype]]`: Internal link on instances
- `Object.getPrototypeOf()`: Standard way to access `[[Prototype]]`

❌ **Wrong**: Thinking property lookup is fast for long chains
```javascript
// Long chain can impact performance
const level1 = {};
const level2 = Object.create(level1);
const level3 = Object.create(level2);
const level4 = Object.create(level3);
const level5 = Object.create(level4);

level1.prop = "value";

// Multiple lookups to find prop
console.log(level5.prop); // 4 prototype jumps!
```

✅ **Better**: Keep chains short or cache frequently accessed properties
```javascript
const level5 = Object.create(level4);
level5.prop = level1.prop; // Cache if accessed frequently
```

### Follow-up Questions
1. "What's at the end of every prototype chain?"
2. "How does `Object.create(null)` affect the prototype chain?"
3. "Can circular prototype chains exist?"
4. "How do you break a prototype chain?"

<details>
<summary><strong>🔍 Deep Dive: Prototype Chain Lookup Mechanics & Optimization</strong></summary>

**V8 Property Lookup Algorithm (Step-by-Step):**

```javascript
// Internal V8 property lookup (simplified C++ → JavaScript)
function V8PropertyLookup(object, propertyName) {
  let current = object;
  let depth = 0;

  while (current !== null) {
    depth++;

    // 1. Check hidden class (shape) for property descriptor
    const hiddenClass = getHiddenClass(current);
    const descriptor = hiddenClass.properties.get(propertyName);

    if (descriptor) {
      // Found! Access property based on descriptor type
      if (descriptor.isDataProperty) {
        return current[descriptor.offset]; // Direct memory offset (~1-2ns)
      } else if (descriptor.isAccessorProperty) {
        return descriptor.getter.call(current); // Call getter (~5-10ns)
      }
    }

    // 2. Move up prototype chain
    current = Object.getPrototypeOf(current);
  }

  // 3. Not found in entire chain
  return undefined;
}

// Real-world performance:
const obj = { a: 1 };

// Own property (depth 0): ~1-2ns
obj.a; // Immediately found in hidden class

// Inherited property (depth 1): ~3-5ns
obj.toString; // Found in Object.prototype (1 level up)

// Not found (depth 2): ~6-8ns
obj.nonExistent; // Traverses obj → Object.prototype → null
```

**Inline Cache (IC) Optimization Deep Dive:**

```javascript
// V8 uses Inline Caches to speed up repeated property access

function getProperty(obj) {
  return obj.name; // V8 remembers the shape of obj
}

const dog = { name: "Rex" };

// FIRST CALL (Cold - no optimization):
getProperty(dog);
// V8 process:
// 1. Check obj's hidden class ID: Shape_Dog_123
// 2. Find 'name' in Shape_Dog_123 at offset 0
// 3. Cache: "For Shape_Dog_123, 'name' is at offset 0"
// Time: ~20ns (first lookup is slow)

// SUBSEQUENT CALLS (Hot - optimized via IC):
getProperty(dog);
getProperty(dog);
getProperty(dog);
// V8 process (optimized):
// 1. Quick check: Is hidden class still Shape_Dog_123? YES
// 2. Direct memory access at cached offset 0
// 3. No prototype chain traversal needed!
// Time: ~1-2ns (100x faster!)

// MONOMORPHIC IC (fastest - one shape seen):
for (let i = 0; i < 1000000; i++) {
  getProperty(dog); // Always same shape → super fast
}
// ~2ms for 1M calls

// POLYMORPHIC IC (slower - 2-4 shapes seen):
const cat = { name: "Whiskers", species: "Cat" }; // Different shape!

for (let i = 0; i < 1000000; i++) {
  getProperty(i % 2 === 0 ? dog : cat); // Two shapes → slower
}
// ~8ms for 1M calls (4x slower)

// IC now checks: "Is it Shape_Dog_123 OR Shape_Cat_456?"
// More comparisons = slower

// MEGAMORPHIC IC (slowest - 5+ shapes seen):
const shapes = [
  { name: "A" },
  { name: "B", age: 1 },
  { name: "C", age: 2, city: "NYC" },
  { name: "D", age: 3, city: "LA", country: "USA" },
  { name: "E", age: 4, city: "SF", country: "USA", zip: "94102" }
];

for (let i = 0; i < 1000000; i++) {
  getProperty(shapes[i % 5]); // 5 different shapes!
}
// ~30ms for 1M calls (15x slower!)

// V8 gives up on caching: "Too many shapes, use generic lookup"
```

**Prototype Chain Depth Impact (Benchmark):**

```javascript
// Create chains of different depths
const level1 = { prop: "value" };

const level2 = Object.create(level1);
// Chain: level2 → level1 → Object.prototype → null (3 levels)

const level3 = Object.create(level2);
// Chain: level3 → level2 → level1 → Object.prototype → null (4 levels)

const level4 = Object.create(level3);
// Chain: level4 → level3 → level2 → level1 → Object.prototype → null (5 levels)

const level5 = Object.create(level4);
// Chain: level5 → level4 → level3 → level2 → level1 → Object.prototype → null (6 levels)

// Benchmark: Access property at end of chain
console.time('depth-1');
for (let i = 0; i < 1000000; i++) {
  level1.prop; // Immediate access
}
console.timeEnd('depth-1'); // ~2ms

console.time('depth-2');
for (let i = 0; i < 1000000; i++) {
  level2.prop; // 1 hop up
}
console.timeEnd('depth-2'); // ~5ms (2.5x slower)

console.time('depth-3');
for (let i = 0; i < 1000000; i++) {
  level3.prop; // 2 hops up
}
console.timeEnd('depth-3'); // ~8ms (4x slower)

console.time('depth-4');
for (let i = 0; i < 1000000; i++) {
  level4.prop; // 3 hops up
}
console.timeEnd('depth-4'); // ~12ms (6x slower)

console.time('depth-5');
for (let i = 0; i < 1000000; i++) {
  level5.prop; // 4 hops up
}
console.timeEnd('depth-5'); // ~18ms (9x slower)

// Rule: Each additional level adds ~3-4ms per 1M accesses (~3-4ns per access)
```

**hasOwnProperty vs `in` Operator (Performance):**

```javascript
const parent = { inherited: true };
const child = Object.create(parent);
child.own = true;

// hasOwnProperty (fast - checks only own properties):
console.time('hasOwnProperty');
for (let i = 0; i < 1000000; i++) {
  child.hasOwnProperty('own'); // true
  child.hasOwnProperty('inherited'); // false (stops at object level)
}
console.timeEnd('hasOwnProperty'); // ~15ms

// 'in' operator (slower - checks entire prototype chain):
console.time('in-operator');
for (let i = 0; i < 1000000; i++) {
  'own' in child; // true
  'inherited' in child; // true (traverses prototype chain)
}
console.timeEnd('in-operator'); // ~25ms (60% slower)

// Object.hasOwn (modern, slightly faster than hasOwnProperty):
console.time('hasOwn');
for (let i = 0; i < 1000000; i++) {
  Object.hasOwn(child, 'own'); // true
  Object.hasOwn(child, 'inherited'); // false
}
console.timeEnd('hasOwn'); // ~12ms (fastest!)
```

**Property Shadowing Performance:**

```javascript
const parent = {
  value: 10,
  getValue() { return this.value; }
};

const child1 = Object.create(parent);
// child1 inherits value (no shadowing)

const child2 = Object.create(parent);
child2.value = 20; // Shadows parent.value

// Access performance (own vs inherited):
console.time('inherited-access');
for (let i = 0; i < 1000000; i++) {
  child1.value; // Traverses 1 level up
}
console.timeEnd('inherited-access'); // ~5ms

console.time('shadowed-access');
for (let i = 0; i < 1000000; i++) {
  child2.value; // Direct own property access
}
console.timeEnd('shadowed-access'); // ~2ms (2.5x faster!)

// Lesson: Shadowing (own properties) is faster than inheriting
// But uses more memory (each object stores its own value)
```

**Object.create(null) for Maximum Performance:**

```javascript
// Normal object (has prototype chain)
const normalObj = {};
// Chain: normalObj → Object.prototype → null

// Null-prototype object (NO prototype chain)
const nullProtoObj = Object.create(null);
// Chain: nullProtoObj → null (only 1 level!)

// Performance comparison:
console.time('normal-lookup-found');
for (let i = 0; i < 1000000; i++) {
  normalObj.nonExistent; // Checks obj → Object.prototype → null
}
console.timeEnd('normal-lookup-found'); // ~8ms

console.time('null-proto-lookup');
for (let i = 0; i < 1000000; i++) {
  nullProtoObj.nonExistent; // Checks obj → null (stops immediately!)
}
console.timeEnd('null-proto-lookup'); // ~3ms (2.7x faster!)

// Use Object.create(null) for:
// - Hash maps / dictionaries (no inherited properties pollution)
// - Performance-critical lookups
// - When you don't need Object.prototype methods
```

**Hidden Class Transitions (Shape Changes):**

```javascript
// Creating objects with consistent shape (fast):
function createUser1(name, age) {
  const obj = {};
  obj.name = name; // Transition: {} → { name }
  obj.age = age;   // Transition: { name } → { name, age }
  return obj;
}

// Creating objects all at once (faster):
function createUser2(name, age) {
  return { name, age }; // One shape from the start!
}

// Benchmark:
console.time('shape-transitions');
for (let i = 0; i < 1000000; i++) {
  createUser1("Alice", 25); // 2 shape transitions per object
}
console.timeEnd('shape-transitions'); // ~80ms

console.time('single-shape');
for (let i = 0; i < 1000000; i++) {
  createUser2("Alice", 25); // 1 shape, no transitions
}
console.timeEnd('single-shape'); // ~50ms (60% faster!)

// Rule: Initialize all properties at object creation for best performance
```

**TurboFan Optimization (JIT Compilation):**

```javascript
// Cold function (not optimized yet):
function getUser(user) {
  return user.name; // V8 doesn't know what shape user will have
}

// After ~10,000 calls with same shape, V8's TurboFan optimizes:
const user = { name: "Alice", age: 25 };

for (let i = 0; i < 100000; i++) {
  getUser(user);
}

// Now TurboFan has compiled optimized machine code:
// - Assumes user always has shape { name, age }
// - Direct memory offset access (no property lookup needed!)
// - Inlines property access into calling code
// - Performance: ~0.5ns per call (4x faster than unoptimized)

// Deoptimization (if shape changes):
getUser({ name: "Bob" }); // Different shape! (no 'age')
// V8 deoptimizes and falls back to generic lookup
// Performance drops back to ~2ns per call
```

**Memory Overhead of Prototype Chains:**

```javascript
// Each object in the chain has memory overhead:

// Object with direct properties:
const directObj = {
  prop1: 1,
  prop2: 2,
  prop3: 3
};
// Memory: ~48 bytes (object header + 3 properties)

// Object with prototype chain:
const proto = { prop1: 1, prop2: 2, prop3: 3 };
const chainObj = Object.create(proto);
// Memory:
// - proto: ~48 bytes
// - chainObj: ~24 bytes (object header + [[Prototype]] pointer)
// - Total: ~72 bytes (1.5x more)

// But with 1,000 instances:
const direct1000 = Array.from({ length: 1000 }, () => ({
  prop1: 1, prop2: 2, prop3: 3
}));
// Memory: ~48KB (1,000 × 48 bytes)

const chain1000 = Array.from({ length: 1000 }, () => Object.create(proto));
// Memory: ~24KB + 48 bytes = ~24KB (50% less!)
```

**Key Performance Rules:**

1. **Keep chains short** (<3 levels): Each level adds ~3-4ns per access
2. **Use consistent shapes**: V8 optimizes monomorphic call sites (1 shape)
3. **Initialize all properties at once**: Avoid shape transitions
4. **Cache frequently accessed properties**: Own property > prototype chain
5. **Use Object.create(null) for dictionaries**: Fastest lookups (no prototype chain)
6. **Avoid megamorphic ICs**: Don't mix >5 different shapes in hot paths

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Deep Prototype Chain Causing Performance Degradation</strong></summary>

**Scenario:** Your SaaS dashboard application shows significant performance degradation after migrating to a new UI framework. Users complain of lag when scrolling large data tables (10,000+ rows). Profiling reveals that property access in custom collection objects is taking 40% longer than expected.

**The Problem:**

```javascript
// ❌ BAD: Framework uses deep inheritance hierarchy for collections
class BaseCollection {}
class IterableCollection extends BaseCollection {}
class SortableCollection extends IterableCollection {}
class FilterableCollection extends SortableCollection {}
class PaginatedCollection extends FilterableCollection {}
class SearchableCollection extends PaginatedCollection {}
class CustomDataCollection extends SearchableCollection {}
class UserTableData extends CustomDataCollection {}

// Prototype chain depth: 8 levels!
// UserTableData → CustomDataCollection → SearchableCollection →
// PaginatedCollection → FilterableCollection → SortableCollection →
// IterableCollection → BaseCollection → Object.prototype → null

const tableData = new UserTableData(users);

// Rendering loop (called for every row, every scroll)
function renderRow(index) {
  const user = tableData.get(index); // .get() is defined 8 levels up!
  return `<tr><td>${user.name}</td><td>${user.email}</td></tr>`;
}

// Performance issue:
// - 10,000 rows × scrolling through table
// - Each .get() call traverses 8 prototype levels
// - Property lookup: ~20ns per call (vs ~2ns for shallow chain)
// - Total overhead: 10,000 × 18ns = 180,000ns = 0.18ms per frame
// - With re-renders: 0.18ms × 60fps = 10.8ms/frame (target: 16.67ms)
// - Result: Janky scrolling, dropped frames
```

**Production Impact:**

```javascript
// Metrics before fix:
// - FPS during scroll: 35-45 fps (target: 60 fps)
// - Frame render time: 22ms (target: <16.67ms)
// - Property access time: ~20ns (should be ~2ns)
// - User complaints: 234/week about laggy tables
// - Bounce rate on dashboard page: 28% (was 8%)
// - Performance score (Lighthouse): 42/100 (was 85/100)

// Error logs:
// No errors, just slow performance
// DevTools Performance tab shows:
// - "Long Task" warnings during scroll
// - Yellow frames (dropped frames)
// - High CPU usage in JavaScript execution
```

**Debugging Process:**

```javascript
// Step 1: Profile with Chrome DevTools
// Performance tab → Record → Scroll table → Stop
// Shows: 65% of time in property access (.get() method)

// Step 2: Check prototype chain depth
const tableData = new UserTableData([]);
let depth = 0;
let current = tableData;

while (current !== null) {
  console.log(`Level ${depth}:`, current.constructor.name);
  current = Object.getPrototypeOf(current);
  depth++;
}

// Output:
// Level 0: UserTableData
// Level 1: CustomDataCollection
// Level 2: SearchableCollection
// Level 3: PaginatedCollection
// Level 4: FilterableCollection
// Level 5: SortableCollection
// Level 6: IterableCollection
// Level 7: BaseCollection
// Level 8: Object
// Level 9: null
// DEPTH: 9 levels! (7 levels too deep!)

// Step 3: Benchmark property access
console.time('deep-chain-access');
for (let i = 0; i < 1000000; i++) {
  tableData.get(0); // Traverses 8 levels every time!
}
console.timeEnd('deep-chain-access'); // 25ms

// Compare to shallow chain:
class FlatCollection {
  constructor(data) {
    this.data = data;
  }
  get(index) {
    return this.data[index];
  }
}

const flatData = new FlatCollection(users);

console.time('shallow-chain-access');
for (let i = 0; i < 1000000; i++) {
  flatData.get(0); // Only 1 level up!
}
console.timeEnd('shallow-chain-access'); // 5ms (5x faster!)
```

**Solution 1: Flatten Inheritance Hierarchy (Composition over Inheritance):**

```javascript
// ✅ FIX: Use composition instead of deep inheritance
class UserTableData {
  constructor(data) {
    this.data = data;

    // Compose functionality instead of inheriting
    this.iterator = new Iterator(this);
    this.sorter = new Sorter(this);
    this.filterer = new Filterer(this);
    this.paginator = new Paginator(this);
    this.searcher = new Searcher(this);
  }

  // Direct methods (no inheritance - fast!)
  get(index) {
    return this.data[index]; // Own method, not inherited
  }

  // Delegate to composed objects when needed
  sort(compareFn) {
    return this.sorter.sort(compareFn);
  }

  filter(predicate) {
    return this.filterer.filter(predicate);
  }

  search(query) {
    return this.searcher.search(query);
  }
}

// Prototype chain: UserTableData → Object.prototype → null (only 2 levels!)

const tableData = new UserTableData(users);

// Now .get() is found immediately (own method)
console.time('composed-access');
for (let i = 0; i < 1000000; i++) {
  tableData.get(0); // Direct access!
}
console.timeEnd('composed-access'); // 2ms (12.5x faster!)
```

**Solution 2: Cache Frequently Accessed Methods:**

```javascript
// ✅ ALTERNATIVE: If you can't change the framework, cache methods
class UserTableDataOptimized extends CustomDataCollection {
  constructor(data) {
    super(data);

    // Cache inherited methods as own properties
    this.get = this.get.bind(this); // Now .get is own property!
  }
}

// Or cache during construction:
class UserTableDataCached extends CustomDataCollection {
  constructor(data) {
    super(data);

    // Copy inherited methods to own properties
    const proto = Object.getPrototypeOf(this);
    this.get = function(index) {
      return proto.get.call(this, index);
    };
  }
}

const cachedData = new UserTableDataCached(users);

console.time('cached-access');
for (let i = 0; i < 1000000; i++) {
  cachedData.get(0); // Found immediately on instance!
}
console.timeEnd('cached-access'); // 2.5ms (10x faster!)
```

**Solution 3: Use Mixins for Horizontal Composition:**

```javascript
// ✅ BEST: Mixins provide functionality without deep chains
const IterableMixin = {
  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }
};

const SortableMixin = {
  sort(compareFn) {
    return this.data.sort(compareFn);
  }
};

const FilterableMixin = {
  filter(predicate) {
    return this.data.filter(predicate);
  }
};

const SearchableMixin = {
  search(query) {
    return this.data.filter(item =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    );
  }
};

class UserTableData {
  constructor(data) {
    this.data = data;

    // Apply mixins (copy methods to instance or prototype)
    Object.assign(this, IterableMixin, SortableMixin, FilterableMixin, SearchableMixin);
  }

  get(index) {
    return this.data[index];
  }
}

// All methods are own properties! No prototype chain traversal
const mixinData = new UserTableData(users);

console.time('mixin-access');
for (let i = 0; i < 1000000; i++) {
  mixinData.get(0); // Immediate access!
  mixinData.sort; // Also immediate!
  mixinData.filter; // Also immediate!
}
console.timeEnd('mixin-access'); // 1.8ms (fastest!)
```

**Real Metrics After Fix:**

```javascript
// After implementing Solution 1 (Composition):
// - FPS during scroll: 58-60 fps ✅ (was 35-45)
// - Frame render time: 10ms ✅ (was 22ms)
// - Property access time: ~2ns ✅ (was ~20ns)
// - User complaints: 12/week (95% reduction)
// - Bounce rate: 9% (back to normal)
// - Performance score: 88/100 (86% improvement)
// - Page load time: 1.2s (was 2.8s)
// - Time to Interactive: 1.5s (was 3.5s)

// Memory comparison:
// Deep inheritance: ~120KB for 10,000 instances
// Composition: ~85KB for 10,000 instances (29% less)
// Mixins: ~90KB for 10,000 instances (25% less)
```

**Benchmark Comparison (1M property accesses):**

```javascript
// Deep inheritance (8 levels): ~25ms
// Composition (2 levels): ~2ms (12.5x faster)
// Cached methods (own property): ~2.5ms (10x faster)
// Mixins (own property): ~1.8ms (13.9x faster)

// Real-world impact (10,000 row table):
// Deep: 10,000 × 20ns = 200,000ns = 0.2ms overhead
// Composition: 10,000 × 2ns = 20,000ns = 0.02ms overhead
// Savings: 0.18ms per render × 60fps = 10.8ms/s saved!
```

**Preventing Future Issues (ESLint + Architecture):**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'max-classes-per-file': ['error', 1],
    'max-depth': ['error', 3], // Max 3 levels of inheritance

    // Custom rule to check prototype chain depth
    'no-deep-inheritance': ['error', { maxDepth: 3 }]
  }
};

// Architecture guidelines:
// 1. Prefer composition over inheritance
// 2. Max 2-3 levels of inheritance
// 3. Use mixins for horizontal composition
// 4. Cache frequently accessed methods
// 5. Profile before shipping
```

**Visual Comparison:**

```
❌ BEFORE (Deep Inheritance):
UserTableData
  ↓ extends
CustomDataCollection
  ↓ extends
SearchableCollection
  ↓ extends
PaginatedCollection
  ↓ extends
FilterableCollection
  ↓ extends
SortableCollection
  ↓ extends
IterableCollection
  ↓ extends
BaseCollection
  ↓ [[Prototype]]
Object.prototype
  ↓ [[Prototype]]
null

Depth: 9 levels
Property lookup: ~20ns


✅ AFTER (Composition):
UserTableData
  ├─ data
  ├─ iterator (composed)
  ├─ sorter (composed)
  ├─ filterer (composed)
  ├─ paginator (composed)
  ├─ searcher (composed)
  └─ [[Prototype]]
Object.prototype
  └─ [[Prototype]]
null

Depth: 2 levels
Property lookup: ~2ns (10x faster!)
```

**Lesson Learned:**

1. **Keep prototype chains shallow** (<3 levels for optimal performance)
2. **Prefer composition over inheritance** (horizontal over vertical structure)
3. **Profile before shipping** (catch performance regressions early)
4. **Use mixins for shared behavior** (no inheritance overhead)
5. **Cache hot methods** if stuck with deep chains (workaround)
6. **Monitor prototype chain depth** in code reviews

</details>

<details>
<summary><strong>⚖️ Trade-offs: Prototype Chain Design Patterns</strong></summary>

### Chain Depth Comparison

| Chain Depth | Lookup Time (1M ops) | Memory | Debugging | Best For |
|-------------|---------------------|--------|-----------|----------|
| **1-2 levels** | ~2-5ms | ✅ Minimal | ✅ Easy | Most use cases |
| **3-4 levels** | ~6-12ms | ✅ Ok | ⚠️ Moderate | Complex domain models |
| **5-6 levels** | ~15-25ms | ⚠️ Overhead | ❌ Hard | ❌ Avoid |
| **7+ levels** | ~30-50ms | ❌ High | ❌ Very hard | ❌ Never |

### Pattern Comparison

**Pattern 1: Deep Inheritance**
```javascript
class A {}
class B extends A {}
class C extends B {}
class D extends C {}

const obj = new D();
```

| Pros | Cons |
|------|------|
| ✅ Clear hierarchy | ❌ Slow property lookups (>3 levels) |
| ✅ Familiar to OOP developers | ❌ Tight coupling |
| ✅ instanceof works | ❌ Hard to refactor |
| ✅ Automatic method sharing | ❌ Fragile base class problem |

**Use when**: Modeling clear "is-a" relationships with < 3 levels

**Pattern 2: Composition**
```javascript
class D {
  constructor() {
    this.a = new A();
    this.b = new B();
    this.c = new C();
  }

  method() {
    return this.a.method();
  }
}
```

| Pros | Cons |
|------|------|
| ✅ Fast (shallow chain) | ⚠️ More boilerplate |
| ✅ Flexible (runtime composition) | ⚠️ No instanceof |
| ✅ Loose coupling | ⚠️ Must delegate manually |
| ✅ Easy to test | ⚠️ Less familiar pattern |

**Use when**: Need flexibility, performance matters, >3 levels of hierarchy

**Pattern 3: Mixins**
```javascript
const MixinA = { methodA() {} };
const MixinB = { methodB() {} };

class D {
  constructor() {
    Object.assign(this, MixinA, MixinB);
  }
}
```

| Pros | Cons |
|------|------|
| ✅ Fastest (own properties) | ❌ Memory overhead (copies methods) |
| ✅ Multiple inheritance | ❌ Name collisions possible |
| ✅ Flat structure | ❌ No super calls |
| ✅ Easy to understand | ⚠️ Less tooling support |

**Use when**: Need multiple unrelated behaviors, performance critical

### Decision Matrix

| Scenario | Best Pattern | Reason |
|----------|-------------|--------|
| **Simple models** | Shallow inheritance (1-2 levels) | Clear, fast enough |
| **Complex models** | Composition | Flexibility over speed |
| **Performance critical** | Mixins / Own properties | Fastest access |
| **Need super calls** | Inheritance | Only way to call parent methods |
| **Multiple behaviors** | Mixins | Horizontal composition |
| **Runtime flexibility** | Composition | Can swap implementations |

### Real-World Trade-off Examples

**Example 1: E-commerce Product Hierarchy**

```javascript
// ❌ DEEP INHERITANCE (slow for large catalogs)
class Product {}
class PhysicalProduct extends Product {}
class Electronics extends PhysicalProduct {}
class Computer extends Electronics {}
class Laptop extends Computer {}

// Property lookup for laptop.price: 5 levels up! (~15ns)

// ✅ COMPOSITION (faster)
class Laptop {
  constructor() {
    this.product = new Product();
    this.physical = new PhysicalProduct();
    this.electronics = new Electronics();
  }

  getPrice() {
    return this.product.price; // 1 level up (~2ns)
  }
}
```

**Performance impact**:
- 10,000 products × 100 property accesses each
- Deep: 10,000 × 100 × 15ns = 15ms
- Composition: 10,000 × 100 × 2ns = 2ms
- **7.5x faster with composition!**

**Example 2: UI Component Library**

```javascript
// Trade-off: Memory vs Speed

// Pattern A: Prototype sharing (less memory, slower)
function Button(text) {
  this.text = text;
}
Button.prototype.render = function() { return `<button>${this.text}</button>`; };

const buttons = Array.from({ length: 1000 }, (_, i) => new Button(`Button ${i}`));
// Memory: ~50KB (1 render function shared)
// Access time: ~3ns (1 level up)

// Pattern B: Own methods (more memory, faster)
function ButtonFast(text) {
  this.text = text;
  this.render = function() { return `<button>${this.text}</button>`; };
}

const buttonsFast = Array.from({ length: 1000 }, (_, i) => new ButtonFast(`Button ${i}`));
// Memory: ~500KB (1,000 render functions)
// Access time: ~1ns (own property)

// Decision:
// - Use Pattern A: If creating 1,000+ instances (memory matters)
// - Use Pattern B: If < 100 instances (speed matters)
```

**Example 3: Data Access Layer**

```javascript
// Trade-off: hasOwnProperty vs 'in' operator

const model = Object.create({ deletedAt: null }); // Prototype property
model.id = 1; // Own property

// hasOwnProperty (fast - checks only own):
console.time('hasOwn');
for (let i = 0; i < 1000000; i++) {
  model.hasOwnProperty('id'); // ~12ms
}
console.timeEnd('hasOwn');

// 'in' operator (slower - checks chain):
console.time('in');
for (let i = 0; i < 1000000; i++) {
  'id' in model; // ~20ms (67% slower)
}
console.timeEnd('in');

// Use hasOwnProperty when:
// - Only care about own properties
// - Performance matters
// - Working with dictionaries

// Use 'in' when:
// - Need to check inherited properties
// - Readability matters more than speed
```

### Summary Guidelines

| Factor | Shallow Chain | Deep Chain | Composition | Mixins |
|--------|--------------|------------|-------------|--------|
| **Speed** | ✅ Fast | ❌ Slow | ✅ Fast | ✅ Fastest |
| **Memory (1000 instances)** | ✅ Low | ✅ Low | ⚠️ Medium | ❌ High |
| **Debugging** | ✅ Easy | ❌ Hard | ✅ Easy | ✅ Easy |
| **Flexibility** | ⚠️ Limited | ⚠️ Limited | ✅ High | ✅ High |
| **Tooling** | ✅ Excellent | ✅ Excellent | ⚠️ Good | ⚠️ Fair |

**Golden Rule**:
- < 100 instances → Use what's clearest (pattern doesn't matter much)
- 100-1,000 instances → Shallow chain or composition
- 1,000+ instances → Prototype sharing (memory matters)
- Hot paths (millions of calls) → Own properties or mixins (speed matters)

</details>

<details>
<summary><strong>💬 Explain to Junior: Prototype Chain Like a Scavenger Hunt</strong></summary>

**Simple Analogy: Looking for Your Keys**

Think of the prototype chain like looking for your keys in your house:

```javascript
const myRoom = { phone: "iPhone" };
const myHouse = Object.create(myRoom);
myHouse.tv = "Samsung";

const myCity = Object.create(myHouse);
myCity.keys = "Car keys";

// When you look for your keys:
console.log(myCity.keys);
// 1. Check my city → FOUND! "Car keys" ✅

// When you look for your phone:
console.log(myCity.phone);
// 1. Check my city → NOT found
// 2. Check my house → NOT found
// 3. Check my room → FOUND! "iPhone" ✅

// When you look for something that doesn't exist:
console.log(myCity.wallet);
// 1. Check my city → NOT found
// 2. Check my house → NOT found
// 3. Check my room → NOT found
// 4. Reached the end → undefined ❌
```

**Visual Representation:**

```
myCity { keys: "Car keys" }
  ↓ [[Prototype]]
myHouse { tv: "Samsung" }
  ↓ [[Prototype]]
myRoom { phone: "iPhone" }
  ↓ [[Prototype]]
Object.prototype { toString, valueOf, ... }
  ↓ [[Prototype]]
null (end of chain)
```

**Why It's Called a "Chain":**

Each object has a link (like a chain link) to the next object. JavaScript follows this chain from bottom to top until it finds what it's looking for or reaches the end (null).

**Real Example: Game Characters**

```javascript
const character = {
  health: 100,
  attack: 10
};

const warrior = Object.create(character);
warrior.weapon = "Sword";

const knight = Object.create(warrior);
knight.armor = "Plate";

console.log(knight.armor);   // "Plate" (found immediately - own property)
console.log(knight.weapon);  // "Sword" (1 level up - from warrior)
console.log(knight.health);  // 100 (2 levels up - from character)

// Lookup process for knight.health:
// Step 1: Check knight object → not found
// Step 2: Check warrior object (knight's prototype) → not found
// Step 3: Check character object (warrior's prototype) → FOUND! 100
```

**Common Beginner Confusion:**

```javascript
// ❌ MISTAKE: Thinking inherited properties are "copied"
const parent = { value: 10 };
const child = Object.create(parent);

console.log(child.value); // 10

// Change parent:
parent.value = 20;

console.log(child.value); // 20 (NOT 10!)
// child doesn't have own copy - it looks up the chain every time!

// ✅ To create own copy (shadowing):
const child2 = Object.create(parent);
child2.value = 30; // Now child has OWN value

console.log(child2.value); // 30 (own property)
parent.value = 40;
console.log(child2.value); // Still 30 (not affected by parent change)
```

**Practical Example: Web Page Elements**

```javascript
// Base element
const htmlElement = {
  display: "block",
  getStyle() {
    return `display: ${this.display}`;
  }
};

// Button inherits from htmlElement
const button = Object.create(htmlElement);
button.backgroundColor = "blue";
button.text = "Click me";

// Submit button inherits from button
const submitButton = Object.create(button);
submitButton.type = "submit";

console.log(submitButton.text); // "Click me" (1 level up)
console.log(submitButton.display); // "block" (2 levels up)
console.log(submitButton.getStyle()); // "display: block" (2 levels up)

// Chain:
// submitButton → button → htmlElement → Object.prototype → null
```

**Why the Chain Stops at null:**

```javascript
// End of the chain is always null
const obj = {};

let current = obj;
while (current !== null) {
  console.log(current);
  current = Object.getPrototypeOf(current);
}

// Output:
// {} (your object)
// Object.prototype (built-in prototype)
// null (end!)

// null means "no more prototypes to check"
// This prevents infinite loops
```

**Checking Own vs Inherited Properties:**

```javascript
const parent = { inherited: "from parent" };
const child = Object.create(parent);
child.own = "my property";

// Check if property exists (anywhere in chain):
console.log('own' in child); // true
console.log('inherited' in child); // true

// Check if property is OWN (not inherited):
console.log(child.hasOwnProperty('own')); // true
console.log(child.hasOwnProperty('inherited')); // false

// Get all OWN properties:
console.log(Object.keys(child)); // ["own"]

// Loop through OWN properties only:
for (const key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key); // Only logs "own"
  }
}
```

**Explaining to PM:**

"The prototype chain is like a company org chart:

**Employee** (you) → **Manager** → **Director** → **CEO**

When you need approval for something:
1. First check if you can approve it yourself (own property)
2. If not, ask your manager (1 level up)
3. If manager can't, ask director (2 levels up)
4. If director can't, ask CEO (3 levels up)
5. If CEO can't, request denied (reached end of chain)

**In JavaScript:**
- Each object checks itself first
- Then asks its prototype (parent)
- Keeps going up until found or reaches null
- Faster if found early in chain (you can approve)
- Slower if needs to go all the way up (needs CEO approval)

**Business value:**
- Saves memory (shared methods instead of copies)
- Objects can inherit common behavior
- Easy to update all objects (change prototype)
- Industry standard (all JavaScript code uses this)"

**Key Rules for Juniors:**

1. **Lookup order**: Own properties first → prototype → prototype's prototype → ... → null
2. **End of chain**: Always ends at null (prevents infinite loops)
3. **Own vs inherited**: Use `hasOwnProperty()` to check if property is own or inherited
4. **Shadowing**: If object has own property, it "shadows" (hides) inherited one
5. **Dynamic**: Changing prototype affects all objects using it (live connection)

**Interview Answer Template:**

"The prototype chain is JavaScript's lookup mechanism for properties. When you access a property, JavaScript first checks the object itself. If not found, it checks the object's prototype, then the prototype's prototype, and so on, until it either finds the property or reaches null (the end of the chain). For example, [give parent-child example]. This is how JavaScript implements inheritance - objects delegate property lookups up the chain instead of copying properties."

</details>

### Resources
- [MDN: Prototype Chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript Prototype in Plain Language](http://javascriptissexy.com/javascript-prototype-in-plain-detailed-language/)

---

