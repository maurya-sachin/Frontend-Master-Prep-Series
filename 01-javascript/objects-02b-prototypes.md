# Prototypes & Inheritance

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What is Object.create() and How Does it Work?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain `Object.create()` method. How does it differ from constructor functions and class syntax?

### Answer

`Object.create()` creates a new object with a specified prototype object. It's the most direct way to implement prototypal inheritance in JavaScript.

**Syntax:**
```javascript
Object.create(proto, [propertiesObject])
```

### Code Example

**Basic Usage:**

```javascript
const animal = {
  eats: true,
  walk() {
    console.log("Walking");
  }
};

// Create object with animal as prototype
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats); // true (inherited)
console.log(rabbit.jumps); // true (own)
rabbit.walk(); // "Walking" (inherited)

console.log(Object.getPrototypeOf(rabbit) === animal); // true
```

**With Property Descriptors:**

```javascript
const proto = {
  greet() {
    return `Hello, ${this.name}`;
  }
};

const person = Object.create(proto, {
  name: {
    value: "John",
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: false, // Read-only
    enumerable: true
  }
});

console.log(person.name); // "John"
console.log(person.age); // 30
console.log(person.greet()); // "Hello, John"

person.name = "Jane"; // Works (writable: true)
person.age = 31; // Fails silently (writable: false)
console.log(person.age); // 30 (unchanged)
```

**Comparison with Constructor Functions:**

```javascript
// 1. Object.create() approach
const animalProto = {
  eat() {
    console.log(`${this.name} is eating`);
  }
};

const dog1 = Object.create(animalProto);
dog1.name = "Buddy";
dog1.eat(); // "Buddy is eating"

// 2. Constructor function approach
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

const dog2 = new Animal("Max");
dog2.eat(); // "Max is eating"

/*
BOTH CREATE SAME RESULT:
========================
Object.create():
- More explicit about prototype
- No constructor function needed
- Direct prototype setting

Constructor function:
- Traditional pattern
- Initialization logic in constructor
- Works with 'new' operator
*/
```

**Creating Objects with null Prototype:**

```javascript
// Object with no prototype (not even Object.prototype)
const bareObject = Object.create(null);

bareObject.prop = "value";

console.log(bareObject.toString); // undefined (no inherited methods)
console.log(bareObject.hasOwnProperty); // undefined

// Useful for hash maps / dictionaries
const map = Object.create(null);
map['key'] = 'value';
// No inherited properties to worry about

/*
USE CASES FOR Object.create(null):
==================================
1. Pure data storage (no inherited methods)
2. Hash maps / dictionaries
3. Avoid prototype pollution
4. Performance (no prototype chain lookups)
*/
```

**Implementing Inheritance with Object.create():**

```javascript
// Parent
const Vehicle = {
  init(type) {
    this.type = type;
    return this;
  },

  describe() {
    return `This is a ${this.type}`;
  }
};

// Child inherits from Vehicle
const Car = Object.create(Vehicle);

Car.init = function(type, brand) {
  Vehicle.init.call(this, type);
  this.brand = brand;
  return this;
};

Car.describe = function() {
  return `${Vehicle.describe.call(this)} - Brand: ${this.brand}`;
};

// Create instance
const myCar = Object.create(Car).init('sedan', 'Toyota');

console.log(myCar.describe());
// "This is a sedan - Brand: Toyota"

/*
PROTOTYPE CHAIN:
================
myCar → Car → Vehicle → Object.prototype → null

This pattern is called OLOO (Objects Linked to Other Objects)
*/
```

**Polyfill for Object.create():**

```javascript
if (typeof Object.create !== 'function') {
  Object.create = function(proto, propertiesObject) {
    if (typeof proto !== 'object' && typeof proto !== 'function') {
      throw new TypeError('Object prototype may only be an Object or null');
    }

    if (propertiesObject !== undefined && propertiesObject !== null) {
      throw new Error('Second argument not supported in this polyfill');
    }

    // Create temporary constructor
    function F() {}

    // Set prototype
    F.prototype = proto;

    // Return new instance
    return new F();
  };
}

/*
HOW IT WORKS:
=============
1. Create temporary constructor function
2. Set its prototype to desired prototype
3. Return new instance (which inherits from proto)
4. F() is discarded after use
*/
```

**vs new Operator:**

```javascript
// Using new
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const john = new Person("John");

/*
NEW OPERATOR STEPS:
===================
1. Create empty object: {}
2. Set prototype: {}.__proto__ = Person.prototype
3. Call constructor with new object as this
4. Return object (unless constructor returns object)
*/

// Using Object.create (equivalent)
const jane = Object.create(Person.prototype);
Person.call(jane, "Jane");

console.log(john.greet()); // "Hi, I'm John"
console.log(jane.greet()); // "Hi, I'm Jane"

// Both create same prototype chain
console.log(Object.getPrototypeOf(john) === Person.prototype); // true
console.log(Object.getPrototypeOf(jane) === Person.prototype); // true
```

**OLOO Pattern (Objects Linked to Other Objects):**

```javascript
// Instead of constructor functions and classes,
// use Object.create() directly

const AuthModule = {
  init(username, password) {
    this.username = username;
    this.password = password;
    return this;
  },

  login() {
    console.log(`${this.username} logged in`);
  }
};

const AdminModule = Object.create(AuthModule);

AdminModule.deleteUser = function(userId) {
  console.log(`Admin ${this.username} deleted user ${userId}`);
};

// Create instances
const admin = Object.create(AdminModule).init('admin', 'pass123');
admin.login(); // "admin logged in"
admin.deleteUser(42); // "Admin admin deleted user 42"

/*
OLOO BENEFITS:
==============
1. More explicit prototype relationships
2. No constructor function confusion
3. No 'new' operator needed
4. Simpler syntax (some argue)
5. Direct object linking
*/
```

### Common Mistakes

❌ **Wrong**: Passing non-object as prototype
```javascript
// const obj = Object.create(5); // TypeError
// const obj = Object.create("string"); // TypeError
```

✅ **Correct**: Use object or null
```javascript
const obj1 = Object.create({});
const obj2 = Object.create(null);
const obj3 = Object.create(Object.prototype); // Same as {}
```

❌ **Wrong**: Thinking it copies properties
```javascript
const original = { value: 42 };
const copy = Object.create(original);

console.log(copy.value); // 42 (inherited, not copied!)
console.log(copy.hasOwnProperty('value')); // false
```

✅ **Correct**: Understanding prototype relationship
```javascript
const original = { value: 42 };
const inherits = Object.create(original);
const copies = { ...original }; // Shallow copy

console.log(inherits.hasOwnProperty('value')); // false
console.log(copies.hasOwnProperty('value')); // true
```

### Follow-up Questions
1. "How would you implement Object.create() polyfill?"
2. "What's the difference between Object.create() and Object.setPrototypeOf()?"
3. "When would you use Object.create(null)?"
4. "Can you modify the prototype after using Object.create()?"

<details>
<summary><strong>🔍 Deep Dive: Object.create() Internals & V8 Implementation</strong></summary>

**How Object.create() Works Internally:**

```javascript
// Specification algorithm (simplified):
Object.create = function(proto, propertiesObject) {
  // 1. Validate prototype
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }

  // 2. Create new object with internal [[Prototype]] slot
  const obj = {};
  Object.setPrototypeOf(obj, proto);

  // 3. If properties provided, define them
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
};

// More accurate polyfill for older browsers:
if (typeof Object.create !== 'function') {
  Object.create = (function() {
    // Use a constructor trick
    function Temp() {}

    return function(proto, propertiesObject) {
      // Validate
      if (proto !== Object(proto) && proto !== null) {
        throw new TypeError('Object prototype may only be an Object or null');
      }

      // Set prototype via constructor
      Temp.prototype = proto || Object.prototype;
      const result = new Temp();

      // Reset for reuse
      Temp.prototype = null;

      // Add properties if provided
      if (propertiesObject !== undefined) {
        Object.defineProperties(result, propertiesObject);
      }

      // Handle null prototype case
      if (proto === null) {
        result.__proto__ = null;
      }

      return result;
    };
  })();
}
```

**V8 Engine Implementation Details:**

```javascript
// V8 creates objects with internal slots:
const obj = Object.create(proto);

// Internal representation:
{
  [[Prototype]]: proto,        // Internal prototype link
  [[Extensible]]: true,        // Can add properties
  [[PrivateProperties]]: [],   // No private properties yet
}

// Performance characteristics:
// Object.create(): ~10-15ns per call (just prototype link)
// new Constructor(): ~20-30ns per call (constructor + prototype)
// Object literal {}: ~8-12ns per call (fastest)

// Benchmark example:
console.time('Object.create');
for (let i = 0; i < 1000000; i++) {
  Object.create({ prop: 'value' });
}
console.timeEnd('Object.create'); // ~15ms

console.time('new Constructor');
function Constructor() {}
Constructor.prototype.prop = 'value';
for (let i = 0; i < 1000000; i++) {
  new Constructor();
}
console.timeEnd('new Constructor'); // ~25ms

console.time('Object literal');
for (let i = 0; i < 1000000; i++) {
  ({ __proto__: { prop: 'value' } });
}
console.timeEnd('Object literal'); // ~12ms
```

**Prototype Chain Lookup Performance:**

```javascript
// Object.create(null) - No prototype chain
const bareObject = Object.create(null);
bareObject.prop = 'value';

// Prototype lookup: 0 steps (no chain)
bareObject.toString; // undefined (~5ns lookup)

// Object.create({}) - Short chain
const normalObject = Object.create({ inherited: 'value' });
normalObject.own = 'value';

// Prototype lookup: 1 step
normalObject.inherited; // "value" (~8ns lookup)
normalObject.toString;  // function (~15ns - 2 steps: {} → Object.prototype)

// Deep chain - Performance degradation
const level1 = { a: 1 };
const level2 = Object.create(level1);
level2.b = 2;
const level3 = Object.create(level2);
level3.c = 3;
const level4 = Object.create(level3);
level4.d = 4;

// Prototype lookup: Up to 4 steps
level4.d; // Own property (~5ns)
level4.c; // 1 step (~8ns)
level4.b; // 2 steps (~12ns)
level4.a; // 3 steps (~18ns)
level4.toString; // 5 steps (~30ns - degrades significantly)

// Rule of thumb: Keep prototype chains shallow (2-3 levels max)
```

**Memory Layout & Hidden Classes:**

```javascript
// V8 creates hidden classes for object shapes
const proto = {
  method1() { return 'method1'; },
  method2() { return 'method2'; }
};

const obj1 = Object.create(proto);
obj1.a = 1;
obj1.b = 2;

const obj2 = Object.create(proto);
obj2.a = 3;
obj2.b = 4;

// obj1 and obj2 share same hidden class (same shape):
// Hidden Class C0: { [[Prototype]]: proto, a: Slot0, b: Slot1 }
// This enables inline caching and fast property access

// Breaking the hidden class (performance killer):
const obj3 = Object.create(proto);
obj3.b = 5; // Different order!
obj3.a = 6;

// obj3 gets different hidden class (different shape)
// V8 can't optimize obj3 the same way
// Lesson: Add properties in consistent order!
```

**Object.create(null) - True Hash Map:**

```javascript
// Why Object.create(null) is special:

// 1. No inherited properties (safe for user keys)
const userInput = "__proto__";
const normalObj = {};
const bareObj = Object.create(null);

normalObj[userInput] = "hacked!"; // Dangerous! Modifies prototype
bareObj[userInput] = "safe";      // Just a property

console.log(normalObj.toString); // Inherited method
console.log(bareObj.toString);   // undefined (no prototype)

// 2. Faster property access (no prototype chain)
const map = Object.create(null);
map.key1 = 'value1';
map.key2 = 'value2';

// Lookup: 0 prototype steps (fastest possible)

// 3. JSON parsing performance
function parseJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  const safe = Object.create(null);

  // Copy properties to bare object (prevent prototype pollution)
  Object.assign(safe, parsed);
  return safe;
}

// 4. Use cases in real projects:
// - Dictionary/hash map (no collision with Object.prototype)
// - Config objects (no inherited methods interfering)
// - Cache storage (clean namespace)
// - AST nodes in parsers
// - Redux state (avoid prototype pollution)
```

**Property Descriptors with Object.create():**

```javascript
// Second parameter: property descriptors
const proto = { greet() { return 'Hello'; } };

const person = Object.create(proto, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 25,
    writable: false,    // Read-only
    enumerable: true,
    configurable: false // Can't delete or reconfigure
  },
  id: {
    value: 123,
    writable: false,
    enumerable: false,  // Hidden from loops
    configurable: false
  },
  // Getter/setter
  fullInfo: {
    get() {
      return `${this.name} (${this.age})`;
    },
    enumerable: true,
    configurable: true
  }
});

console.log(person.name);     // "Alice"
console.log(person.age);      // 25
person.age = 30;              // Fails silently (strict mode throws)
console.log(person.age);      // 25 (unchanged)

Object.keys(person);          // ["name", "age", "fullInfo"] (id is non-enumerable)

delete person.age;            // Fails (configurable: false)
console.log(person.fullInfo); // "Alice (25)"

// This level of control is impossible with object literals or constructors!
```

**Circular References & Memory:**

```javascript
// Object.create() and circular references
const nodeA = Object.create(null);
const nodeB = Object.create(null);

nodeA.next = nodeB;
nodeB.prev = nodeA;

// Creates circular reference, but no memory leak in modern engines
// V8 garbage collector handles this with mark-and-sweep

// Memory impact:
const proto = { sharedMethod() { return 'shared'; } };

// Memory efficient: All share same prototype
const instances = [];
for (let i = 0; i < 10000; i++) {
  const obj = Object.create(proto);
  obj.id = i;
  instances.push(obj);
}

// Memory usage:
// - Prototype object: ~100 bytes (shared)
// - Each instance: ~50 bytes (just own properties)
// Total: 100 + (50 * 10000) = ~500KB

// vs Constructor functions (same memory usage):
function Constructor(id) {
  this.id = id;
}
Constructor.prototype.sharedMethod = function() { return 'shared'; };

const instances2 = [];
for (let i = 0; i < 10000; i++) {
  instances2.push(new Constructor(i));
}
// Total: Same ~500KB (prototypes are shared in both approaches)
```

**TurboFan Optimization (Hot Code):**

```javascript
// V8 optimizes hot paths with Object.create()

function createPoint(x, y) {
  // After ~10,000 calls, TurboFan kicks in
  return Object.create(Point, {
    x: { value: x, writable: true, enumerable: true, configurable: true },
    y: { value: y, writable: true, enumerable: true, configurable: true }
  });
}

const Point = {
  distance() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
};

// First 10,000 calls: Interpreter (slow)
// Next calls: TurboFan optimized (5-10x faster)

// Optimization criteria:
// 1. Monomorphic (same object shape every time)
// 2. Same prototype every time
// 3. Same property descriptors every time
// If any changes: Deoptimization penalty!
```

**WeakMap Integration:**

```javascript
// Object.create() + WeakMap for private data
const privateData = new WeakMap();

const Animal = {
  init(name, age) {
    privateData.set(this, { name, age });
    return this;
  },

  getName() {
    return privateData.get(this).name;
  },

  getAge() {
    return privateData.get(this).age;
  }
};

const dog = Object.create(Animal).init('Buddy', 3);
console.log(dog.getName()); // "Buddy"
console.log(dog.getAge());  // 3

// Private data not accessible:
console.log(dog.name); // undefined (truly private!)

// WeakMap allows garbage collection of dog when no longer referenced
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Prototype Pollution Attack in Express API</strong></summary>

**Scenario:** Your Express.js API is vulnerable to prototype pollution attacks. Attackers can inject malicious properties into `Object.prototype`, affecting the entire application and leading to authentication bypasses and privilege escalation.

**The Problem:**

```javascript
// ❌ VULNERABLE: Using plain objects for user data storage
const express = require('express');
const app = express();
app.use(express.json());

// User preferences stored as plain object
const userPreferences = {};

app.post('/api/preferences', (req, res) => {
  const { userId, key, value } = req.body;

  // Store user preference
  if (!userPreferences[userId]) {
    userPreferences[userId] = {}; // Plain object - vulnerable!
  }

  userPreferences[userId][key] = value;

  res.json({ success: true });
});

app.get('/api/user/:id/role', (req, res) => {
  const userId = req.params.id;
  const user = userPreferences[userId] || {};

  // Check if user is admin (dangerous!)
  const isAdmin = user.isAdmin || false;

  res.json({ userId, isAdmin });
});

// Attacker sends this malicious request:
/*
POST /api/preferences
{
  "userId": "123",
  "key": "__proto__",
  "value": { "isAdmin": true }
}
*/

// Now ALL users become admin!
// GET /api/user/456/role
// Returns: { userId: "456", isAdmin: true }
// Even though user 456 never set isAdmin!

// Why? Because attacker polluted Object.prototype:
console.log({}.isAdmin); // true (ALL objects have it now!)

// Production impact:
// - Authentication bypass: Any user can become admin
// - Data breach: Access to all user data
// - Privilege escalation: Execute admin-only operations
// - System compromise: Full control of application

// Real-world examples:
// - Lodash CVE-2019-10744 (prototype pollution via _.merge)
// - jQuery CVE-2019-11358 (prototype pollution via $.extend)
// - Express sessions vulnerable to pollution
// - MongoDB query injection via __proto__
```

**Debugging Process:**

```javascript
// Step 1: Identify the vulnerability
console.log('Before attack:');
const testUser = {};
console.log(testUser.isAdmin); // undefined ✅

// Simulate attacker's request
userPreferences['attacker'] = {};
userPreferences['attacker']['__proto__'] = { isAdmin: true };

console.log('After attack:');
console.log(testUser.isAdmin); // true ❌ (polluted!)
console.log({}.isAdmin);       // true ❌ (ALL objects!)

// Step 2: Check Object.prototype
console.log(Object.prototype.isAdmin); // true (prototype polluted!)

// Step 3: Trace how it happened
// userPreferences['attacker']['__proto__'] = { isAdmin: true }
// This is equivalent to:
// userPreferences['attacker'].__proto__ = { isAdmin: true }
// Which modifies Object.prototype!

// Step 4: Check all affected objects
const anyObject = { name: 'test' };
console.log(anyObject.isAdmin); // true (inherited from polluted prototype!)
```

**Solution 1: Use Object.create(null) for Dictionaries:**

```javascript
// ✅ FIX: Use prototype-less objects for user data
const userPreferences = Object.create(null); // No prototype!

app.post('/api/preferences', (req, res) => {
  const { userId, key, value } = req.body;

  // Create user object without prototype
  if (!userPreferences[userId]) {
    userPreferences[userId] = Object.create(null); // Safe!
  }

  userPreferences[userId][key] = value;

  res.json({ success: true });
});

// Now attacker's request fails safely:
userPreferences['attacker'] = Object.create(null);
userPreferences['attacker']['__proto__'] = { isAdmin: true };

// Safe! __proto__ is just a property, not the actual prototype
console.log(userPreferences['attacker']['__proto__']); // { isAdmin: true }
console.log(userPreferences['attacker'].isAdmin);      // undefined ✅
console.log({}.isAdmin);                               // undefined ✅ (no pollution!)

// Object.prototype is safe:
console.log(Object.prototype.isAdmin); // undefined ✅
```

**Solution 2: Input Validation & Sanitization:**

```javascript
// ✅ BETTER: Validate and block dangerous keys
const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

function isSafeKey(key) {
  return !dangerousKeys.includes(key);
}

app.post('/api/preferences', (req, res) => {
  const { userId, key, value } = req.body;

  // Validate key
  if (!isSafeKey(key)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid key name'
    });
  }

  if (!userPreferences[userId]) {
    userPreferences[userId] = Object.create(null);
  }

  userPreferences[userId][key] = value;

  res.json({ success: true });
});

// Attacker's request is blocked:
// POST /api/preferences { "key": "__proto__", ... }
// Response: 400 Bad Request - Invalid key name
```

**Solution 3: Use Map Instead:**

```javascript
// ✅ BEST: Use Map for key-value storage
const userPreferences = new Map();

app.post('/api/preferences', (req, res) => {
  const { userId, key, value } = req.body;

  if (!userPreferences.has(userId)) {
    userPreferences.set(userId, new Map()); // Map has no prototype pollution risk
  }

  const userPrefs = userPreferences.get(userId);
  userPrefs.set(key, value);

  res.json({ success: true });
});

app.get('/api/user/:id/role', (req, res) => {
  const userId = req.params.id;
  const userPrefs = userPreferences.get(userId) || new Map();

  // Safe: Map.get() doesn't traverse prototype chain
  const isAdmin = userPrefs.get('isAdmin') || false;

  res.json({ userId, isAdmin });
});

// Attacker's request has no effect:
const attackerPrefs = new Map();
attackerPrefs.set('__proto__', { isAdmin: true });

console.log(attackerPrefs.get('__proto__')); // { isAdmin: true } (stored safely)
console.log(attackerPrefs.get('isAdmin'));   // undefined ✅ (not polluted)
console.log({}.isAdmin);                     // undefined ✅ (safe!)
```

**Solution 4: Object.freeze() for Config Objects:**

```javascript
// ✅ DEFENSIVE: Freeze Object.prototype (last resort)
Object.freeze(Object.prototype);

// Now pollution attempts fail:
try {
  Object.prototype.isAdmin = true; // TypeError in strict mode
} catch (e) {
  console.error('Prototype pollution blocked:', e.message);
}

console.log({}.isAdmin); // undefined ✅ (frozen prototype)

// Warning: This prevents ALL modifications to Object.prototype
// Including legitimate libraries that extend it
// Use with caution!
```

**Real Production Metrics:**

```javascript
// Before fix (plain objects):
// - Vulnerability discovered: CVE-2023-XXXX (Critical severity)
// - Attack attempts detected: 150/day
// - Successful privilege escalations: 12/week
// - Unauthorized admin access: 45 incidents
// - Data breach: 1,500 user records compromised
// - Downtime: 8 hours (emergency patch)
// - Security audit cost: $25,000
// - Customer trust impact: -30% retention
// - Regulatory fines: $50,000 (GDPR violation)

// After fix (Object.create(null) + Map):
// - Attack attempts: 200/day (attackers still trying)
// - Successful attacks: 0 ✅
// - Privilege escalations: 0 ✅
// - Data breaches: 0 ✅
// - Security audit: Passed with A+ rating
// - Customer trust: Restored (+15% retention)
// - Developer confidence: +100%
// - No regulatory issues
```

**Complex Real-World Example: Redux Store Pollution:**

```javascript
// Real bug in Redux application:
const initialState = {
  users: {},
  settings: {}
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER_PROPERTY':
      // ❌ VULNERABLE: Spreading can pollute prototype
      return {
        ...state,
        users: {
          ...state.users,
          [action.userId]: {
            ...state.users[action.userId],
            [action.key]: action.value // Dangerous!
          }
        }
      };

    default:
      return state;
  }
}

// Attacker dispatches:
dispatch({
  type: 'SET_USER_PROPERTY',
  userId: 'attacker',
  key: '__proto__',
  value: { isAdmin: true }
});

// Now entire app's state is polluted!
console.log(state.users.anyUser.isAdmin); // true (polluted!)

// ✅ FIX: Use Object.create(null) for state slices
const initialState = {
  users: Object.create(null),
  settings: Object.create(null)
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER_PROPERTY':
      // Create safe objects
      const newUsers = Object.create(null);
      Object.assign(newUsers, state.users);

      const userId = action.userId;
      const userObj = Object.create(null);
      Object.assign(userObj, newUsers[userId]);

      // Validate key before setting
      if (['__proto__', 'constructor', 'prototype'].includes(action.key)) {
        console.warn('Blocked dangerous key:', action.key);
        return state;
      }

      userObj[action.key] = action.value;
      newUsers[userId] = userObj;

      return {
        ...state,
        users: newUsers
      };

    default:
      return state;
  }
}

// Now safe from pollution:
dispatch({
  type: 'SET_USER_PROPERTY',
  userId: 'attacker',
  key: '__proto__',
  value: { isAdmin: true }
});

// Blocked! State remains clean ✅
```

**Automated Security Testing:**

```javascript
// Add tests to catch prototype pollution
describe('Prototype Pollution Prevention', () => {
  beforeEach(() => {
    // Verify Object.prototype is clean before each test
    expect(Object.prototype.isAdmin).toBeUndefined();
  });

  it('should not allow __proto__ key to pollute prototype', () => {
    const store = Object.create(null);
    store['__proto__'] = { isAdmin: true };

    // Should be stored as regular property
    expect(store['__proto__']).toEqual({ isAdmin: true });

    // Should NOT pollute Object.prototype
    expect({}.isAdmin).toBeUndefined();
    expect(Object.prototype.isAdmin).toBeUndefined();
  });

  it('should reject dangerous keys in API', async () => {
    const response = await request(app)
      .post('/api/preferences')
      .send({
        userId: 'test',
        key: '__proto__',
        value: { isAdmin: true }
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid key name');

    // Verify no pollution
    expect({}.isAdmin).toBeUndefined();
  });

  afterEach(() => {
    // Verify Object.prototype is still clean after test
    expect(Object.prototype.isAdmin).toBeUndefined();
  });
});
```

**Key Lessons:**

1. **Never use plain objects for user-controlled data**
   - Use `Object.create(null)` for dictionaries
   - Use `Map` for dynamic key-value storage
   - Use `Set` for collections

2. **Validate all user input keys**
   - Block `__proto__`, `constructor`, `prototype`
   - Whitelist allowed keys when possible

3. **Test for prototype pollution in CI/CD**
   - Automated security tests
   - Dependency vulnerability scanning
   - Regular security audits

4. **Use TypeScript strict mode**
   - Catches some pollution attempts at compile time
   - Type safety reduces attack surface

</details>

<details>
<summary><strong>⚖️ Trade-offs: Object.create() vs Other Patterns</strong></summary>

### 1. Object.create() vs Constructor Functions

```javascript
// Pattern 1: Object.create() (OLOO pattern)
const AnimalProto = {
  init(name, age) {
    this.name = name;
    this.age = age;
    return this;
  },

  eat() {
    console.log(`${this.name} is eating`);
  }
};

const dog = Object.create(AnimalProto).init('Buddy', 3);

// Pattern 2: Constructor Function
function Animal(name, age) {
  this.name = name;
  this.age = age;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

const cat = new Animal('Whiskers', 2);
```

| Aspect | Object.create() | Constructor Function |
|--------|----------------|---------------------|
| **Syntax** | ✅ More explicit prototype chain | ⚠️ Implicit via `new` |
| **Initialization** | ⚠️ Manual (via init method) | ✅ Automatic via constructor |
| **Performance** | ✅ ~15-20% faster (no constructor call) | ⚠️ Slower (constructor overhead) |
| **Familiar to devs** | ❌ Less common pattern | ✅ Traditional OOP pattern |
| **instanceof** | ❌ Doesn't work out of box | ✅ Works automatically |
| **this binding** | ⚠️ Must be careful | ✅ Handled by `new` |
| **ES6 classes** | ❌ Different paradigm | ✅ Similar to classes |
| **TypeScript support** | ⚠️ Less type-safe | ✅ Better type inference |

**When to use Object.create():**
- Creating simple prototype chains
- Need explicit prototype control
- Building dictionary objects (with null prototype)
- Performance-critical code (hot paths)
- Functional programming style

**When to use Constructor:**
- Team familiar with OOP patterns
- Need `instanceof` checks
- Complex initialization logic
- TypeScript projects
- Large codebases (consistency)

---

### 2. Object.create() vs ES6 Classes

```javascript
// Pattern 1: Object.create()
const Shape = {
  init(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },

  area() {
    throw new Error('Must implement area()');
  }
};

const Rectangle = Object.create(Shape);
Rectangle.area = function() {
  return this.width * this.height;
};

const rect = Object.create(Rectangle).init(0, 0);
rect.width = 10;
rect.height = 5;

// Pattern 2: ES6 Classes
class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  area() {
    throw new Error('Must implement area()');
  }
}

class Rectangle extends Shape {
  constructor(x, y, width, height) {
    super(x, y);
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

const rect2 = new Rectangle(0, 0, 10, 5);
```

| Aspect | Object.create() | ES6 Classes |
|--------|----------------|------------|
| **Readability** | ⚠️ Less intuitive | ✅ Clear, familiar syntax |
| **Performance** | ✅ Slightly faster | ⚠️ Same after optimization |
| **Inheritance** | ⚠️ Manual setup | ✅ Built-in `extends` |
| **super keyword** | ❌ No super | ✅ Has super |
| **Private fields** | ❌ No native support | ✅ `#privateField` syntax |
| **Static methods** | ⚠️ Manual | ✅ `static` keyword |
| **TypeScript** | ⚠️ Limited support | ✅ Full support |
| **Debugging** | ⚠️ Harder to trace | ✅ Better stack traces |
| **Modern code** | ❌ Less common | ✅ Industry standard |

**When to use Object.create():**
- Already using OLOO pattern
- Need Object.create(null) for dictionaries
- Prototypal inheritance purist
- Avoiding class syntax complexity

**When to use ES6 Classes:**
- Modern codebases (post-2015)
- TypeScript projects
- Team familiar with OOP
- Need private fields/methods
- Better tooling support

---

### 3. Object.create(null) vs Plain Object vs Map

```javascript
// Pattern 1: Object.create(null)
const dict1 = Object.create(null);
dict1.key = 'value';

// Pattern 2: Plain Object
const dict2 = {};
dict2.key = 'value';

// Pattern 3: Map
const dict3 = new Map();
dict3.set('key', 'value');
```

| Aspect | Object.create(null) | Plain Object {} | Map |
|--------|-------------------|-----------------|-----|
| **Prototype pollution** | ✅ Immune | ❌ Vulnerable | ✅ Immune |
| **Inherited properties** | ✅ None | ❌ Has Object.prototype | ✅ None |
| **Key types** | ⚠️ Strings only | ⚠️ Strings/Symbols | ✅ Any type |
| **Performance (set)** | ✅ Fast (~10ns) | ✅ Fast (~10ns) | ⚠️ Slower (~15ns) |
| **Performance (get)** | ✅ Fast (~5ns) | ⚠️ Medium (~8ns) | ⚠️ Slower (~12ns) |
| **Memory** | ✅ Efficient | ✅ Efficient | ⚠️ Larger overhead |
| **Iteration** | ⚠️ for...in | ⚠️ for...in | ✅ forEach, for...of |
| **Size property** | ❌ Manual count | ❌ Manual count | ✅ .size property |
| **JSON.stringify** | ✅ Works | ✅ Works | ❌ Doesn't work |
| **TypeScript** | ⚠️ Record<string, T> | ✅ Good | ✅ Excellent |

**Performance Comparison (1 million operations):**

```javascript
// Set performance
console.time('Object.create(null) set');
const bare = Object.create(null);
for (let i = 0; i < 1000000; i++) {
  bare['key' + i] = i;
}
console.timeEnd('Object.create(null) set'); // ~10ms

console.time('Plain object set');
const plain = {};
for (let i = 0; i < 1000000; i++) {
  plain['key' + i] = i;
}
console.timeEnd('Plain object set'); // ~10ms

console.time('Map set');
const map = new Map();
for (let i = 0; i < 1000000; i++) {
  map.set('key' + i, i);
}
console.timeEnd('Map set'); // ~15ms

// Get performance
console.time('Object.create(null) get');
for (let i = 0; i < 1000000; i++) {
  const val = bare['key' + i];
}
console.timeEnd('Object.create(null) get'); // ~5ms

console.time('Plain object get');
for (let i = 0; i < 1000000; i++) {
  const val = plain['key' + i];
}
console.timeEnd('Plain object get'); // ~8ms (prototype lookup overhead)

console.time('Map get');
for (let i = 0; i < 1000000; i++) {
  const val = map.get('key' + i);
}
console.timeEnd('Map get'); // ~12ms
```

**When to use Object.create(null):**
- Dictionary/hash map with string keys
- User-controlled keys (prevent pollution)
- Need JSON serialization
- Maximum performance (hot path)
- No need for methods like `.size`

**When to use Plain Object:**
- Configuration objects
- Simple data structures
- Need JSON.stringify/parse
- Compatibility with older code

**When to use Map:**
- Non-string keys (objects, functions)
- Need `.size` property
- Frequent additions/deletions
- Need guaranteed iteration order
- Avoiding prototype pollution

---

### 4. Object.create() vs Object.setPrototypeOf()

```javascript
// Pattern 1: Object.create() (creation time)
const proto = { greet() { console.log('Hello'); } };
const obj1 = Object.create(proto);

// Pattern 2: Object.setPrototypeOf() (after creation)
const obj2 = {};
Object.setPrototypeOf(obj2, proto);
```

| Aspect | Object.create() | Object.setPrototypeOf() |
|--------|----------------|------------------------|
| **Timing** | ✅ At creation | ⚠️ After creation |
| **Performance** | ✅ Very fast (~10ns) | ❌ Slow (~1000ns, 100x slower!) |
| **V8 optimization** | ✅ Optimized | ❌ Deoptimization trigger |
| **Use case** | ✅ New objects | ⚠️ Modifying existing |
| **Hidden classes** | ✅ Stable | ❌ Breaks hidden classes |
| **Best practice** | ✅ Recommended | ❌ Avoid in hot paths |

**Performance Impact:**

```javascript
// Benchmark: 100,000 iterations

// Test 1: Object.create()
console.time('Object.create');
for (let i = 0; i < 100000; i++) {
  const obj = Object.create({ method() {} });
}
console.timeEnd('Object.create'); // ~1ms

// Test 2: Object.setPrototypeOf()
console.time('Object.setPrototypeOf');
for (let i = 0; i < 100000; i++) {
  const obj = {};
  Object.setPrototypeOf(obj, { method() {} });
}
console.timeEnd('Object.setPrototypeOf'); // ~100ms (100x slower!)

// Why? setPrototypeOf breaks V8's hidden class optimization
```

**Rule: Never use Object.setPrototypeOf() in performance-critical code!**

---

### 5. Property Descriptors: Object.create() vs Object.defineProperty()

```javascript
// Pattern 1: Object.create() with descriptors
const obj1 = Object.create(proto, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 25,
    writable: false
  }
});

// Pattern 2: Object.defineProperty() after creation
const obj2 = Object.create(proto);
Object.defineProperty(obj2, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true
});
Object.defineProperty(obj2, 'age', {
  value: 25,
  writable: false
});
```

| Aspect | Object.create() | Object.defineProperty() |
|--------|----------------|------------------------|
| **Syntax** | ✅ Declarative, all at once | ⚠️ Imperative, one by one |
| **Readability** | ✅ Clear structure | ⚠️ Verbose |
| **Performance** | ✅ Faster (single call) | ⚠️ Slower (multiple calls) |
| **Flexibility** | ⚠️ Only at creation | ✅ Modify existing |

**When to use Object.create():**
- Creating objects with specific descriptors from scratch
- Immutable objects (writable: false everywhere)

**When to use Object.defineProperty():**
- Adding properties to existing objects
- Dynamic property creation

---

### Decision Matrix

| Use Case | Best Choice | Reason |
|----------|------------|--------|
| **Dictionary/hash map** | `Object.create(null)` | No prototype pollution |
| **Class-based OOP** | ES6 Classes | Modern, clear syntax |
| **Functional style** | `Object.create()` | Explicit prototypes |
| **Non-string keys** | Map | Supports any key type |
| **Performance-critical** | `Object.create(null)` | Fastest lookups |
| **Config objects** | Plain object `{}` | Simple, familiar |
| **Inheritance** | ES6 Classes | Built-in `extends` |
| **TypeScript project** | ES6 Classes | Better type inference |
| **Legacy codebase** | Constructor functions | Consistency |
| **Modifying prototype** | NEVER `setPrototypeOf` | Performance killer |

---

### Real-World Example: When to Use Each

```javascript
// 1. Dictionary with user-controlled keys → Object.create(null)
const userCache = Object.create(null);
userCache[userId] = userData; // Safe from pollution

// 2. Class hierarchy → ES6 Classes
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} makes a sound`); }
}

class Dog extends Animal {
  speak() { console.log(`${this.name} barks`); }
}

// 3. Complex keys (objects) → Map
const objectCache = new Map();
objectCache.set(domElement, handlerFunction);

// 4. Simple config → Plain object
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// 5. Prototype-based delegation → Object.create()
const defaultSettings = { theme: 'light', locale: 'en' };
const userSettings = Object.create(defaultSettings);
userSettings.theme = 'dark'; // Override specific setting
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Object.create() Simplified</strong></summary>

**Simple Analogy: Family Inheritance**

Think of `Object.create()` like a family tree where children inherit traits from their parents.

```javascript
// Parent has some traits
const parent = {
  eyeColor: 'blue',
  canWalk: true,
  walk() {
    console.log('Walking...');
  }
};

// Child inherits from parent
const child = Object.create(parent);

// Child can use parent's traits:
console.log(child.eyeColor); // "blue" (inherited)
console.log(child.canWalk);  // true (inherited)
child.walk();                // "Walking..." (inherited method)

// Child can have their own traits:
child.name = 'Tommy';
child.age = 10;

console.log(child.name); // "Tommy" (own property)
console.log(parent.name); // undefined (parent doesn't have it)

// The magic: child "looks up" traits in parent if it doesn't have them
```

**Visual Representation:**

```javascript
const animal = {
  eats: true,
  breathes: true,
  move() {
    console.log('Moving...');
  }
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

const whiteRabbit = Object.create(rabbit);
whiteRabbit.color = 'white';

// Prototype chain:
// whiteRabbit → rabbit → animal → Object.prototype → null

console.log(whiteRabbit.color);    // "white" (own property)
console.log(whiteRabbit.jumps);    // true (from rabbit)
console.log(whiteRabbit.eats);     // true (from animal)
console.log(whiteRabbit.toString); // function (from Object.prototype)

// If whiteRabbit doesn't have a property, JavaScript:
// 1. Checks whiteRabbit - not found
// 2. Checks rabbit - not found
// 3. Checks animal - found! Returns it
```

**The Special Case: Object.create(null)**

```javascript
// Normal object - inherits from Object.prototype
const normalObj = {};
console.log(normalObj.toString); // function (inherited!)
console.log(normalObj.hasOwnProperty); // function (inherited!)

// Bare object - NO inheritance at all
const bareObj = Object.create(null);
console.log(bareObj.toString); // undefined (no prototype!)
console.log(bareObj.hasOwnProperty); // undefined (no prototype!)

// Think of it as: "Create an object with NO parent"
// Perfect for dictionaries where you don't want inherited junk
```

**Why Use Object.create(null)? Real Example:**

```javascript
// Problem: Using normal object as dictionary
const settings = {};

// Works fine for normal keys:
settings.theme = 'dark';
settings.fontSize = 16;

// But what about these keys?
settings['toString'] = 'my custom value';
console.log(settings.toString); // [Function: toString] ❌ Not our value!

// The key 'toString' collides with inherited method!

// Solution: Use Object.create(null)
const safeSettings = Object.create(null);
safeSettings['toString'] = 'my custom value';
console.log(safeSettings.toString); // "my custom value" ✅ Works!

// Now 'toString' is just a regular property, no collision!
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Thinking Object.create() copies properties
const original = { name: 'Alice', age: 25 };
const copy = Object.create(original);

console.log(copy.name); // "Alice" (looks like it copied?)
console.log(copy.age);  // 25 (looks like it copied?)

// BUT:
console.log(copy.hasOwnProperty('name')); // false! (inherited, not copied)
console.log(copy.hasOwnProperty('age'));  // false! (inherited, not copied)

// Object.create() creates INHERITANCE, not a COPY!

// If you want a copy:
const realCopy = { ...original }; // Shallow copy
console.log(realCopy.hasOwnProperty('name')); // true ✅


// ❌ MISTAKE 2: Passing non-object as prototype
const obj = Object.create(5); // TypeError!
const obj = Object.create("hello"); // TypeError!

// Only objects or null:
const obj1 = Object.create({}); // ✅ OK
const obj2 = Object.create(null); // ✅ OK


// ❌ MISTAKE 3: Modifying prototype affects all children
const parent = { count: 0 };
const child1 = Object.create(parent);
const child2 = Object.create(parent);

console.log(child1.count); // 0
console.log(child2.count); // 0

// Modifying parent affects BOTH children:
parent.count = 10;
console.log(child1.count); // 10 (changed!)
console.log(child2.count); // 10 (changed!)

// But setting on child creates OWN property:
child1.count = 5;
console.log(child1.count); // 5 (own property now)
console.log(child2.count); // 10 (still inherited)
console.log(parent.count); // 10 (unchanged)
```

**Practical Examples:**

```javascript
// 1. Default settings pattern
const defaultConfig = {
  theme: 'light',
  fontSize: 14,
  language: 'en'
};

// User overrides only what they want
const userConfig = Object.create(defaultConfig);
userConfig.theme = 'dark'; // Override theme

console.log(userConfig.theme);    // "dark" (overridden)
console.log(userConfig.fontSize); // 14 (inherited default)
console.log(userConfig.language); // "en" (inherited default)


// 2. Safe dictionary for user input
const userPreferences = Object.create(null);

// User can enter ANY key without breaking things:
userPreferences['__proto__'] = 'some value'; // Safe!
userPreferences['constructor'] = 'another value'; // Safe!
userPreferences['toString'] = 'custom'; // Safe!

// All are just regular properties, no weird behavior!


// 3. Creating object with specific prototype
const methods = {
  greet() {
    return `Hello, I'm ${this.name}`;
  },

  age() {
    return new Date().getFullYear() - this.birthYear;
  }
};

const person1 = Object.create(methods);
person1.name = 'Alice';
person1.birthYear = 1995;

const person2 = Object.create(methods);
person2.name = 'Bob';
person2.birthYear = 1990;

console.log(person1.greet()); // "Hello, I'm Alice"
console.log(person1.age());   // 30 (current year - 1995)

console.log(person2.greet()); // "Hello, I'm Bob"
console.log(person2.age());   // 35 (current year - 1990)

// Both share the same methods (memory efficient!)
```

**Explaining to PM:**

"Object.create() is like creating a template system for objects.

**Without Object.create():**
- Every object copies all methods
- Like printing 1000 copies of the same manual
- Wastes memory (each copy takes space)

**With Object.create():**
- Objects share methods from a prototype
- Like 1000 people referencing ONE master manual
- Saves memory (only one copy of methods)

**Real-world analogy:**
- Company has ONE employee handbook
- Every employee can read it (inherit)
- Employees can add personal notes (own properties)
- Changes to handbook affect everyone (prototype changes)
- Personal notes don't affect others (own property changes)

**Business value:**
- **Memory efficient**: 10,000 objects share same methods
- **Flexible**: Easy to add/change shared behavior
- **Secure**: Object.create(null) prevents security bugs
- **Performance**: Faster lookups, better for dictionaries
- **Real impact**: Prevents prototype pollution attacks (saved company $50k in one case!)"

**Quick Test - What's the Output?**

```javascript
const food = {
  type: 'edible',
  eat() {
    console.log('Eating...');
  }
};

const fruit = Object.create(food);
fruit.sweet = true;

const apple = Object.create(fruit);
apple.color = 'red';

// Questions:
console.log(apple.color);  // ?
console.log(apple.sweet);  // ?
console.log(apple.type);   // ?
apple.eat();               // ?

console.log(apple.hasOwnProperty('color')); // ?
console.log(apple.hasOwnProperty('sweet')); // ?
console.log(apple.hasOwnProperty('type'));  // ?

// Answers:
console.log(apple.color);  // "red" (own property)
console.log(apple.sweet);  // true (from fruit)
console.log(apple.type);   // "edible" (from food)
apple.eat();               // "Eating..." (from food)

console.log(apple.hasOwnProperty('color')); // true (own)
console.log(apple.hasOwnProperty('sweet')); // false (inherited)
console.log(apple.hasOwnProperty('type'));  // false (inherited)

// Chain: apple → fruit → food → Object.prototype → null
```

**Key Takeaways:**

1. **Object.create(proto)** creates a new object that inherits from `proto`
2. **Prototype chain**: If property not found, JavaScript looks in parent, then grandparent, etc.
3. **Object.create(null)** creates object with NO prototype (perfect for dictionaries)
4. **NOT a copy**: Properties are inherited, not copied
5. **Own vs inherited**: Use `hasOwnProperty()` to check if property is own or inherited
6. **Memory efficient**: Multiple objects can share same prototype methods

</details>

### Resources
- [MDN: Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [OLOO Pattern Explained](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/ch6.md)

---

