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
<summary><strong>🔍 Deep Dive</strong></summary>

**V8 Hidden Classes & Prototypes:**
- Each object has hidden class (shape) pointing to prototype
- Property lookup: Own properties → Prototype → Prototype's prototype → null
- Inline Cache (IC) optimizes repeated lookups (~1ns after warmup)

**Memory**: Shared methods on prototype save memory. 1,000 instances sharing prototype = 1 method copy vs 1,000 copies.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Array polyfill added to `Array.prototype` caused conflicts across library updates.

**Solution:** Use `Object.defineProperty` with `enumerable: false` to prevent iteration pollution:
```javascript
Object.defineProperty(Array.prototype, 'last', {
  value: function() { return this[this.length - 1]; },
  enumerable: false  // Won't show in for...in
});
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Prototypal inheritance pros**: Memory efficient, dynamic updates to all instances
**Cons**: Slower than class-based (property lookup overhead), harder to debug

**Use when**: Sharing methods across many instances, need dynamic behavior
**Avoid when**: Performance-critical paths, simple data objects

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Prototype** = Template/blueprint. Like a cookie cutter for objects.

```javascript
function Dog(name) {
  this.name = name;  // Own property (unique per dog)
}

Dog.prototype.bark = function() {  // Shared method (all dogs use same function)
  return `${this.name} says woof!`;
};

const dog1 = new Dog('Rex');
const dog2 = new Dog('Max');

dog1.bark();  // Looks in dog1 → not found → checks Dog.prototype → found!
```

All dog instances share one `bark` function → saves memory.

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
<summary><strong>🔍 Deep Dive</strong></summary>

**Property Lookup Algorithm (V8):**
1. Check own properties (hidden class descriptor array)
2. Check `[[Prototype]]` → repeat until found or null
3. Each lookup: ~1-5ns (own) or ~10-50ns (prototype chain)

**Long chains (>5 levels)** degrade performance: Each level adds ~10ns overhead.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Framework extended native `Array.prototype` with 8 levels of inheritance. Array operations 40% slower.

**Fix:** Flattened to 2 levels using composition over inheritance. Performance restored.

Lesson: Keep prototype chains short (<3 levels). Use composition for deep hierarchies.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Short chains (<3)**: Fast lookups, clear structure
**Long chains (>5)**: Slow lookups, confusing debugging, hard to maintain

**Prefer**: Composition over inheritance when possible. Mixin pattern better than deep chains.

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Prototype chain** = Family tree lookup.

```javascript
const grandparent = { wisdom: 'Always backup' };
const parent = Object.create(grandparent);
parent.skill = 'Coding';

const child = Object.create(parent);
child.name = 'Alice';

console.log(child.wisdom);
// Looks: child (no) → parent (no) → grandparent (yes!) → 'Always backup'
```

JS walks up the chain until it finds property or reaches end (null).

</details>

### Resources
- [MDN: Prototype Chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript Prototype in Plain Language](http://javascriptissexy.com/javascript-prototype-in-plain-detailed-language/)

---

## Question 3: What is Object.create() and How Does it Work?

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
<summary><strong>🔍 Deep Dive</strong></summary>

**Object.create() Polyfill:**
```javascript
if (!Object.create) {
  Object.create = function(proto) {
    function F() {}
    F.prototype = proto;
    return new F();
  };
}
```

**V8**: Creates new object with `[[Prototype]]` set to proto. No constructor execution. Faster than `new` for simple inheritance (~10-15ns vs ~20-30ns).

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Dictionary object inherited `toString()` from Object.prototype, causing bugs when user input key = "toString".

**Solution:** Use `Object.create(null)` for truly empty objects (no prototype):
```javascript
const dict = Object.create(null);
dict['toString'] = 'safe!';  // No collision
```

Perfect for hash maps, config objects, JSON parsers.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Object.create() vs new:**
- `Object.create`: Simple inheritance, no constructor logic, lighter
- `new`: Full initialization, constructor runs, familiar pattern

**Use Object.create when**: Pure inheritance needed, avoiding constructors, creating dictionary objects
**Use new when**: Need initialization logic, traditional class pattern

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Object.create()** = Create object that inherits from another.

```javascript
const animal = {
  eat: function() { console.log('Eating...'); }
};

const dog = Object.create(animal);
dog.bark = function() { console.log('Woof!'); };

dog.eat();   // Inherited from animal
dog.bark();  // Own method
```

**Special case - Object.create(null):**
```javascript
const clean = Object.create(null);  // No prototype at all!
clean.toString();  // Error - no inherited methods
// Perfect for dictionaries/maps
```

</details>

### Resources
- [MDN: Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [OLOO Pattern Explained](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/ch6.md)

---

