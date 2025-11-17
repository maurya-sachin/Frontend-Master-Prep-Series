# JavaScript Primitive Types & Type System

> **Focus**: Core JavaScript concepts

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

## Question 23: What is Symbol in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta

### Question

Explain the Symbol primitive type. When would you use it?

### Answer

**Symbol** is a unique, immutable primitive type used as object property keys. Each Symbol is guaranteed to be unique.

1. **Characteristics**
   - Every Symbol is unique
   - Immutable
   - Can be used as object keys
   - Not enumerable in for...in loops
   - Not serialized by JSON.stringify

2. **Use Cases**
   - Private object properties
   - Avoiding property name collisions
   - Defining object metadata
   - Well-known symbols (Symbol.iterator, etc.)

### Code Example

```javascript
// 1. CREATING SYMBOLS
const sym1 = Symbol();
const sym2 = Symbol();

console.log(sym1 === sym2); // false (each is unique!)

const sym3 = Symbol("description");
const sym4 = Symbol("description");
console.log(sym3 === sym4); // false (still unique despite same description!)

// 2. SYMBOL AS OBJECT KEY
const id = Symbol("id");
const user = {
  name: "Alice",
  [id]: 12345  // Symbol as property key
};

console.log(user[id]);  // 12345
console.log(user.id);   // undefined (not the same as string "id")

// 3. SYMBOLS ARE NOT ENUMERABLE
const secret = Symbol("secret");
const obj = {
  name: "Alice",
  age: 25,
  [secret]: "hidden value"
};

// Symbols hidden from normal enumeration
console.log(Object.keys(obj));        // ["name", "age"]
console.log(JSON.stringify(obj));     // {"name":"Alice","age":25}

// But can be accessed if you have the symbol
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(secret)]

// 4. GLOBAL SYMBOL REGISTRY
const globalSym1 = Symbol.for("app.id");
const globalSym2 = Symbol.for("app.id");

console.log(globalSym1 === globalSym2); // true (same symbol!)

console.log(Symbol.keyFor(globalSym1)); // "app.id"

// 5. WELL-KNOWN SYMBOLS
const iterableObj = {
  items: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this.items[index++],
        done: index > this.items.length
      })
    };
  }
};

for (const item of iterableObj) {
  console.log(item); // 1, 2, 3
}
```

### Resources

- [MDN: Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

---

## Question 24: What is BigInt in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta

### Question

Explain BigInt. When would you use it instead of Number?

### Answer

**BigInt** is a numeric primitive for representing integers larger than 2^53 - 1 (Number.MAX_SAFE_INTEGER).

1. **Characteristics**
   - Can represent arbitrarily large integers
   - Created with `n` suffix or `BigInt()` function
   - Cannot mix with Number in operations
   - No decimal/fractional values

2. **Use Cases**
   - Large integer calculations
   - Cryptography
   - High-precision timestamps
   - Database IDs

### Code Example

```javascript
// 1. CREATING BIGINTS
const bigInt1 = 1234567890123456789012345678901234567890n;
const bigInt2 = BigInt("1234567890123456789012345678901234567890");

console.log(typeof bigInt1); // "bigint"

// 2. NUMBER LIMITATIONS
console.log(Number.MAX_SAFE_INTEGER);      // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);  // 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 2);  // 9007199254740992 (wrong!)

// 3. BIGINT SOLVES THIS
const bigNum1 = 9007199254740991n;
const bigNum2 = bigNum1 + 1n;
const bigNum3 = bigNum1 + 2n;

console.log(bigNum2); // 9007199254740992n (correct!)
console.log(bigNum3); // 9007199254740993n (correct!)

// 4. OPERATIONS
const a = 10n;
const b = 20n;

console.log(a + b);  // 30n
console.log(a * b);  // 200n
console.log(a - b);  // -10n
console.log(b / a);  // 2n (integer division!)

// 5. CANNOT MIX WITH NUMBER
const num = 10;
const big = 20n;

// console.log(num + big); // TypeError!

// Must convert:
console.log(BigInt(num) + big);  // 30n
console.log(num + Number(big));  // 30

// 6. COMPARISONS
console.log(10n === 10);   // false (different types)
console.log(10n == 10);    // true (type coercion)
console.log(10n < 20);     // true (works across types)
```

### Resources

- [MDN: BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

---

## Question 13: What is the difference between typeof and instanceof?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon

### Question

Explain the difference between `typeof` and `instanceof` operators. When would you use each?

### Answer

- **`typeof`**: Returns a string indicating the type of a value
- **`instanceof`**: Tests whether an object is an instance of a specific class/constructor

1. **typeof Operator**
   - Returns primitive type as string
   - Works with any value
   - Returns `"object"` for `null` (bug)
   - Returns `"function"` for functions
   - Cannot distinguish between object types

2. **instanceof Operator**
   - Tests prototype chain
   - Only works with objects
   - Can distinguish between different object types
   - Can be fooled by prototype manipulation
   - Doesn't work across different execution contexts (iframes)

3. **typeof Return Values**
   - `"string"`, `"number"`, `"boolean"`, `"undefined"`
   - `"object"`, `"function"`, `"symbol"`, `"bigint"`
   - Special case: `typeof null === "object"`

4. **instanceof Usage**
   - Check if object created by constructor
   - Check inheritance chain
   - Custom class instances
   - Built-in types (Array, Date, RegExp)

5. **When to Use Each**
   - Use `typeof` for primitive type checking
   - Use `instanceof` for object type checking
   - Use `Array.isArray()` for arrays specifically
   - Use `Object.prototype.toString.call()` for reliable type checking

### Code Example

```javascript
// 1. TYPEOF - PRIMITIVE TYPES

console.log(typeof 42);              // "number"
console.log(typeof "hello");         // "string"
console.log(typeof true);            // "boolean"
console.log(typeof undefined);       // "undefined"
console.log(typeof Symbol('id'));    // "symbol"
console.log(typeof 123n);            // "bigint"

// 2. TYPEOF - OBJECTS AND FUNCTIONS

console.log(typeof {});              // "object"
console.log(typeof []);              // "object" (arrays are objects!)
console.log(typeof null);            // "object" (historical bug!)
console.log(typeof function(){});    // "function"
console.log(typeof class{});         // "function" (classes are functions)

// 3. TYPEOF - LIMITATIONS

// Can't distinguish object types
console.log(typeof []);              // "object"
console.log(typeof {});              // "object"
console.log(typeof new Date());      // "object"
console.log(typeof /regex/);         // "object"

// null quirk
console.log(typeof null);            // "object" (not "null"!)

// 4. INSTANCEOF - OBJECT TYPE CHECKING

// Arrays
const arr = [1, 2, 3];
console.log(arr instanceof Array);   // true
console.log(arr instanceof Object);  // true (Array inherits from Object)

// Dates
const date = new Date();
console.log(date instanceof Date);   // true
console.log(date instanceof Object); // true

// RegExp
const regex = /test/;
console.log(regex instanceof RegExp); // true
console.log(regex instanceof Object); // true

// 5. INSTANCEOF - CUSTOM CLASSES

class Person {
  constructor(name) {
    this.name = name;
  }
}

class Employee extends Person {
  constructor(name, role) {
    super(name);
    this.role = role;
  }
}

const john = new Person("John");
const jane = new Employee("Jane", "Developer");

console.log(john instanceof Person);      // true
console.log(john instanceof Employee);    // false
console.log(john instanceof Object);      // true

console.log(jane instanceof Employee);    // true
console.log(jane instanceof Person);      // true (inheritance!)
console.log(jane instanceof Object);      // true

// 6. INSTANCEOF - DOESN'T WORK WITH PRIMITIVES

console.log("hello" instanceof String);   // false (primitive)
console.log(new String("hello") instanceof String); // true (object)

console.log(42 instanceof Number);        // false
console.log(new Number(42) instanceof Number); // true

console.log(true instanceof Boolean);     // false
console.log(new Boolean(true) instanceof Boolean); // true

// 7. COMBINING TYPEOF AND INSTANCEOF

function checkType(value) {
  // Use typeof for primitives
  if (typeof value !== "object") {
    return typeof value;
  }

  // Handle null
  if (value === null) {
    return "null";
  }

  // Use instanceof for objects
  if (value instanceof Array) return "array";
  if (value instanceof Date) return "date";
  if (value instanceof RegExp) return "regexp";
  if (value instanceof Error) return "error";

  return "object";
}

console.log(checkType(42));            // "number"
console.log(checkType("hello"));       // "string"
console.log(checkType(null));          // "null"
console.log(checkType([1, 2, 3]));     // "array"
console.log(checkType(new Date()));    // "date"
console.log(checkType({ a: 1 }));      // "object"

// 8. RELIABLE TYPE CHECKING

function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType(42));              // "number"
console.log(getType("hello"));         // "string"
console.log(getType(null));            // "null"
console.log(getType(undefined));       // "undefined"
console.log(getType([]));              // "array"
console.log(getType({}));              // "object"
console.log(getType(new Date()));      // "date"
console.log(getType(/regex/));         // "regexp"
console.log(getType(function(){}));    // "function"

// 9. ARRAY CHECKING (BEST PRACTICES)

const arr = [1, 2, 3];

// ❌ Using typeof
console.log(typeof arr);               // "object" (not helpful!)

// ❌ Using instanceof (can fail across frames)
console.log(arr instanceof Array);     // true (but can fail)

// ✅ Using Array.isArray()
console.log(Array.isArray(arr));       // true (reliable!)

// 10. PROTOTYPE CHAIN AND INSTANCEOF

function Animal(name) {
  this.name = name;
}

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const buddy = new Dog("Buddy", "Golden");

console.log(buddy instanceof Dog);     // true
console.log(buddy instanceof Animal);  // true (prototype chain!)
console.log(buddy instanceof Object);  // true

// 11. INSTANCEOF WITH NULL/UNDEFINED

try {
  console.log(null instanceof Object);      // false
  console.log(undefined instanceof Object); // false
} catch (e) {
  // No error, just false
}

// 12. MANIPULATING PROTOTYPE CHAIN

const obj = {};
console.log(obj instanceof Object);    // true

// Change prototype
Object.setPrototypeOf(obj, null);
console.log(obj instanceof Object);    // false (no longer in chain!)

// 13. PRACTICAL TYPE GUARDS (TYPESCRIPT PATTERN)

function isString(value) {
  return typeof value === "string";
}

function isArray(value) {
  return Array.isArray(value);
}

function isDate(value) {
  return value instanceof Date;
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    value.constructor === Object
  );
}

// Use type guards
if (isString(someValue)) {
  console.log(someValue.toUpperCase());
}

if (isArray(someValue)) {
  console.log(someValue.length);
}
```

### Common Mistakes

- ❌ **Mistake:** Using typeof for arrays

  ```javascript
  const arr = [1, 2, 3];
  if (typeof arr === "array") { // ❌ Never true!
    // typeof arr is "object"
  }
  ```

- ❌ **Mistake:** Using instanceof for primitives

  ```javascript
  console.log("hello" instanceof String); // false (primitive!)
  // Only works with object wrappers
  ```

- ✅ **Correct:** Use appropriate checks

  ```javascript
  // For arrays
  if (Array.isArray(arr)) { }

  // For strings
  if (typeof value === "string") { }

  // For objects
  if (value !== null && typeof value === "object") { }
  ```

### Follow-up Questions

- "Why does `typeof null` return 'object'?"
- "How does instanceof work internally?"
- "What is the difference between `instanceof` and `isPrototypeOf()`?"
- "How would you implement a custom instanceof?"
- "What are the limitations of instanceof with iframes?"

### Resources

- [MDN: typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
- [Understanding typeof vs instanceof](https://www.freecodecamp.org/news/javascript-typeof-vs-instanceof/)

---
