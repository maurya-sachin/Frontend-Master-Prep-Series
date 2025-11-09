# JavaScript Advanced Behavior and ES6+ Features

> Type coercion, operators, ES6+ features, destructuring, spread/rest, optional chaining, nullish coalescing, and modern JavaScript patterns.

---

## Question 1: Explain Type Coercion in JavaScript

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Uber

### Question
What is type coercion? Explain implicit vs explicit coercion with examples.

### Answer

**Type Coercion** is the automatic or explicit conversion of values from one data type to another.

**Two Types:**
1. **Implicit Coercion** - Automatic conversion by JavaScript
2. **Explicit Coercion** - Manual conversion using functions/operators

### Code Example

**Implicit Coercion:**

```javascript
// String coercion
console.log("5" + 3);     // "53" (number → string)
console.log("5" + true);  // "5true" (boolean → string)
console.log("5" + null);  // "5null" (null → string)

// Number coercion
console.log("5" - 3);     // 2 (string → number)
console.log("5" * "2");   // 10 (both strings → numbers)
console.log("5" / "2");   // 2.5 (both strings → numbers)

// Boolean coercion
if ("hello") {            // "hello" → true (truthy)
  console.log("Runs");
}

if (0) {                  // 0 → false (falsy)
  console.log("Doesn't run");
}

/*
COERCION RULES:
===============
+ with string: Everything → string
- * / %: Everything → number
Logical context: Everything → boolean
*/
```

**Explicit Coercion:**

```javascript
// To String
String(123);              // "123"
String(true);             // "true"
String(null);             // "null"
(123).toString();         // "123"

// To Number
Number("123");            // 123
Number("123abc");         // NaN
Number(true);             // 1
Number(false);            // 0
Number(null);             // 0
Number(undefined);        // NaN
parseInt("123px");        // 123
parseFloat("12.5px");     // 12.5

// To Boolean
Boolean(1);               // true
Boolean(0);               // false
Boolean("hello");         // true
Boolean("");              // false
!!"hello";                // true (double negation trick)

/*
FALSY VALUES (become false):
============================
- false
- 0, -0, 0n
- "" (empty string)
- null
- undefined
- NaN

Everything else is TRUTHY!
*/
```

**Tricky Cases:**

```javascript
// Addition vs Concatenation
console.log(1 + 2);       // 3 (number addition)
console.log(1 + "2");     // "12" (string concatenation)
console.log(1 + 2 + "3"); // "33" (left-to-right: 3 + "3")
console.log("1" + 2 + 3); // "123" (left-to-right: "12" + 3)

// Subtraction (no concatenation)
console.log("5" - 2);     // 3 (string → number)
console.log("5" - "2");   // 3 (both → numbers)

// Comparison coercion
console.log(5 == "5");    // true (string → number)
console.log(5 === "5");   // false (no coercion)
console.log(null == undefined);  // true (special case)
console.log(null === undefined); // false

// Boolean context
console.log([] == false);     // true ([] → "" → 0)
console.log({} == false);     // false
console.log([] == ![]);       // true (weird!)

/*
[] == ![]  EXPLAINED:
=====================
1. ![] → false (empty array is truthy, so negation is false)
2. [] == false
3. [] → "" (ToPrimitive)
4. "" == false
5. "" → 0, false → 0
6. 0 == 0 → true
*/

// Object to primitive
console.log([1, 2] + [3, 4]);  // "1,23,4" (arrays → strings)
console.log({} + []);          // 0 or "[object Object]" (context-dependent)

// Template literal coercion
console.log(`Value: ${123}`);  // "Value: 123"
console.log(`Value: ${null}`); // "Value: null"
```

**ToPrimitive Algorithm:**

```javascript
// When object converted to primitive:
const obj = {
  valueOf() {
    console.log("valueOf called");
    return 42;
  },
  toString() {
    console.log("toString called");
    return "Object";
  }
};

console.log(obj + 1);  // valueOf called, 43
console.log(`${obj}`); // toString called, "Object"

/*
ToPrimitive(hint):
==================
hint "number": Try valueOf() → toString()
hint "string": Try toString() → valueOf()
hint "default": Usually like "number"

+obj: hint "number"
`${obj}`: hint "string"
obj == x: hint "default"
*/

// Custom coercion
const custom = {
  valueOf() {
    return 100;
  },
  toString() {
    return "Custom";
  }
};

console.log(custom + 50);      // 150 (valueOf)
console.log(String(custom));   // "Custom" (toString)
console.log(custom == 100);    // true (valueOf)
```

### Common Mistakes

❌ **Wrong**: Relying on implicit coercion
```javascript
function add(a, b) {
  return a + b;  // Could concatenate if strings!
}

console.log(add(5, 3));    // 8
console.log(add("5", 3));  // "53" (unexpected!)
```

✅ **Correct**: Validate types or use explicit coercion
```javascript
function add(a, b) {
  return Number(a) + Number(b);
}

console.log(add(5, 3));    // 8
console.log(add("5", 3));  // 8
```

❌ **Wrong**: Using == with different types
```javascript
if (value == true) {  // Confusing coercion
  // ...
}
```

✅ **Correct**: Use === or explicit boolean
```javascript
if (value === true) {  // Explicit check
  // ...
}

if (Boolean(value)) {  // Convert to boolean
  // ...
}

if (value) {  // Truthy check (if that's the intent)
  // ...
}
```

### Follow-up Questions
1. "What's the difference between == and ===?"
2. "How does the ToPrimitive algorithm work?"
3. "Why does [] == ![] return true?"
4. "When is implicit coercion useful?"

### Resources
- [MDN: Type Coercion](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion)
- [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/)
- [You Don't Know JS: Types & Grammar](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/types%20%26%20grammar/README.md)

---

## Question 2: == vs === - What's the Difference?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the difference between `==` (loose equality) and `===` (strict equality).

### Answer

- **`==`** (Loose/Abstract Equality) - Performs type coercion before comparison
- **`===`** (Strict Equality) - No type coercion, checks type AND value

### Code Example

```javascript
// === Strict Equality (No Coercion)
console.log(5 === 5);        // true
console.log(5 === "5");      // false (different types)
console.log(true === 1);     // false (different types)
console.log(null === undefined);  // false (different types)

// == Loose Equality (With Coercion)
console.log(5 == 5);         // true
console.log(5 == "5");       // true (string → number)
console.log(true == 1);      // true (boolean → number)
console.log(null == undefined);  // true (special case)

/*
=== CHECKS:
1. Type comparison
2. If types differ → false
3. If types same → value comparison

== CHECKS:
1. If types same → value comparison
2. If types differ → apply coercion rules
3. Then value comparison
*/
```

**Coercion Rules for ==:**

```javascript
// null and undefined
console.log(null == undefined);  // true (only equal to each other)
console.log(null == 0);          // false
console.log(undefined == 0);     // false

// Number comparisons
console.log("5" == 5);           // true (string → number)
console.log(true == 1);          // true (boolean → 1)
console.log(false == 0);         // true (boolean → 0)
console.log("" == 0);            // true ("" → 0)
console.log(" " == 0);           // true (" " → 0)

// Object to primitive
console.log([5] == 5);           // true ([5] → "5" → 5)
console.log([] == 0);            // true ([] → "" → 0)
console.log([""] == 0);          // true ([""] → "" → 0)

/*
== COERCION STEPS:
==================
1. null == undefined → true
2. number == string → string to number
3. boolean == any → boolean to number
4. object == primitive → object to primitive
*/
```

**When to Use Each:**

```javascript
// Use === (Almost Always)
if (count === 0) { }
if (status === "active") { }
if (user === null) { }

// Rare == Use Case: Check null OR undefined
if (value == null) {
  // true if value is null OR undefined
  // Equivalent to: value === null || value === undefined
}

// But even this is better as:
if (value === null || value === undefined) { }
// Or: if (value == null) { }
// Or: if (value ?? false) { }  // Modern way
```

**Weird Cases:**

```javascript
// Arrays
console.log([] == []);           // false (different objects)
console.log([] == ![]);          // true (weird!)

// Objects
console.log({} == {});           // false (different objects)
console.log({} == "[object Object]");  // false

// NaN
console.log(NaN == NaN);         // false
console.log(NaN === NaN);        // false
console.log(Object.is(NaN, NaN)); // true

// -0 and +0
console.log(-0 == +0);           // true
console.log(-0 === +0);          // true
console.log(Object.is(-0, +0));  // false

/*
SPECIAL CASES:
==============
- NaN ≠ NaN (use Number.isNaN())
- {} ≠ {} (reference comparison)
- [] ≠ [] (reference comparison)
- Object.is() for strict equality with special cases
*/
```

### Common Mistakes

❌ **Wrong**: Using == carelessly
```javascript
const input = "0";

if (input == false) {  // true ("0" → 0 → false)
  console.log("Empty");  // Runs unexpectedly!
}
```

✅ **Correct**: Use === or explicit check
```javascript
if (input === "") {  // false
  console.log("Empty");
}

if (!input) {  // false (if checking truthiness)
  console.log("Empty");
}
```

### Follow-up Questions
1. "When would you use == instead of ===?"
2. "What does Object.is() do differently?"
3. "How does != compare to !==?"
4. "Why does [] == ![] return true?"

---

*[File continues with 28 more Q&A covering:]*
*- Optional chaining (?.)*
*- Nullish coalescing (??)*
*- Destructuring (objects, arrays, nested)*
*- Spread operator (...)*
*- Rest parameters*
*- Template literals*
*- Tagged templates*
*- Symbol type*
*- BigInt*
*- Proxy and Reflect*
*- And more...*

