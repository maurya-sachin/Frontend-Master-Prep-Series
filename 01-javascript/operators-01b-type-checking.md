# Type Checking & Coercion

> **Focus**: Core JavaScript concepts

---

## Question 1: What are truthy and falsy values in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain truthy and falsy values in JavaScript. List all falsy values.

### Answer

In JavaScript, values are converted to boolean (`true` or `false`) in boolean contexts (if statements, logical operators, etc.).

**Falsy Values** (only 8 values):
1. `false`
2. `0` (zero)
3. `-0` (negative zero)
4. `0n` (BigInt zero)
5. `""` (empty string)
6. `null`
7. `undefined`
8. `NaN`

**Everything else is truthy!**

1. **Common Truthy Values**
   - All numbers except 0, -0 (including negative numbers)
   - All strings except "" (including "0", "false")
   - All objects and arrays (even empty `{}` and `[]`)
   - Functions
   - `Infinity` and `-Infinity`

2. **Boolean Contexts**
   - if statements: `if (value)`
   - while loops: `while (condition)`
   - Logical operators: `&&`, `||`, `!`
   - Ternary operator: `condition ? a : b`

3. **Explicit Conversion**
   - `Boolean(value)` - convert to boolean
   - `!!value` - double negation trick
   - Comparison with boolean: avoid using `== true/false`

4. **Practical Use Cases**
   - Input validation
   - Default values
   - Short-circuit evaluation
   - Conditional rendering

5. **Common Pitfalls**
   - `"0"` is truthy (string, not number)
   - `[]` and `{}` are truthy (even when empty)
   - `"false"` is truthy (it's a string)

### Code Example

```javascript
// 1. ALL FALSY VALUES (ONLY 8!)

console.log(Boolean(false));      // false
console.log(Boolean(0));          // false
console.log(Boolean(-0));         // false
console.log(Boolean(0n));         // false
console.log(Boolean(""));         // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false

// 2. COMMON TRUTHY VALUES

console.log(Boolean(true));       // true
console.log(Boolean(1));          // true
console.log(Boolean(-1));         // true
console.log(Boolean("hello"));    // true
console.log(Boolean("0"));        // true (string!)
console.log(Boolean("false"));    // true (string!)
console.log(Boolean([]));         // true (array!)
console.log(Boolean({}));         // true (object!)
console.log(Boolean(function(){})); // true
console.log(Boolean(Infinity));   // true
console.log(Boolean(-Infinity));  // true

// 3. IF STATEMENT EXAMPLES

if (0) {
  console.log("Never runs"); // 0 is falsy
}

if ("") {
  console.log("Never runs"); // empty string is falsy
}

if (null) {
  console.log("Never runs"); // null is falsy
}

if ("0") {
  console.log("Runs!"); // "0" is truthy (string)
}

if ([]) {
  console.log("Runs!"); // empty array is truthy
}

if ({}) {
  console.log("Runs!"); // empty object is truthy
}

// 4. LOGICAL OPERATORS WITH TRUTHY/FALSY

// OR operator (||) - returns first truthy value
console.log(0 || "default");         // "default"
console.log("" || "fallback");       // "fallback"
console.log(null || undefined || 5); // 5
console.log(false || 0 || "");       // "" (all falsy, returns last)

// AND operator (&&) - returns first falsy value or last truthy
console.log(true && "value");        // "value"
console.log(1 && 2 && 3);           // 3 (all truthy, returns last)
console.log(1 && 0 && 2);           // 0 (first falsy)
console.log("" && "never");         // "" (first falsy)

// NOT operator (!) - converts to boolean and negates
console.log(!0);                    // true
console.log(!"");                   // true
console.log(!null);                 // true
console.log(!"hello");              // false
console.log(![]);                   // false (array is truthy)

// 5. DOUBLE NEGATION TRICK

console.log(!!0);                   // false
console.log(!!"hello");             // true
console.log(!![]);                  // true
console.log(!!null);                // false

// Same as Boolean()
console.log(Boolean(0));            // false
console.log(Boolean("hello"));      // true

// 6. COMMON TRAPS

// ❌ Trap 1: "0" is truthy!
if ("0") {
  console.log("Runs!"); // "0" is a non-empty string
}

// ❌ Trap 2: Empty arrays/objects are truthy!
if ([]) {
  console.log("Runs!"); // empty array is truthy
}

if ({}) {
  console.log("Runs!"); // empty object is truthy
}

// ❌ Trap 3: "false" is truthy!
const value = "false";
if (value) {
  console.log("Runs!"); // string "false" is truthy
}

// 7. PRACTICAL - INPUT VALIDATION

function validateInput(input) {
  if (!input) {
    return "Input is required"; // Catches "", null, undefined, 0
  }
  return "Valid input";
}

console.log(validateInput(""));        // "Input is required"
console.log(validateInput(null));      // "Input is required"
console.log(validateInput(undefined)); // "Input is required"
console.log(validateInput("hello"));   // "Valid input"

// ⚠️ Problem: Also catches 0 as invalid!
console.log(validateInput(0)); // "Input is required" (might not want this)

// Better: Be specific
function validateInputBetter(input) {
  if (input == null || input === "") {
    return "Input is required";
  }
  return "Valid input";
}

console.log(validateInputBetter(0)); // "Valid input" (0 is now valid)

// 8. DEFAULT VALUES

// ❌ Using || (problem with 0, false, "")
function setCount(count) {
  const finalCount = count || 10; // Problem if count is 0
  return finalCount;
}

console.log(setCount(5));    // 5
console.log(setCount(0));    // 10 (wanted 0, got 10!)
console.log(setCount(null)); // 10

// ✅ Using ?? (nullish coalescing)
function setCountBetter(count) {
  const finalCount = count ?? 10; // Only null/undefined trigger default
  return finalCount;
}

console.log(setCountBetter(5));    // 5
console.log(setCountBetter(0));    // 0 (correct!)
console.log(setCountBetter(null)); // 10

// 9. ARRAY/OBJECT CHECKS

const items = [];
const data = {};

// ❌ Wrong: Checking truthiness
if (items) {
  console.log("Has items"); // Runs even if empty!
}

// ✅ Correct: Check length/keys
if (items.length > 0) {
  console.log("Has items");
}

if (Object.keys(data).length > 0) {
  console.log("Has data");
}

// 10. COMPARING WITH BOOLEAN (AVOID!)

// ❌ Bad: Comparing with true/false
if (value == true) { // Complex coercion!
  // ...
}

// ✅ Good: Use truthy/falsy directly
if (value) {
  // ...
}

// ✅ Or be explicit
if (value === true) {
  // ...
}

// Examples of confusion:
console.log("0" == true);    // false (confusing!)
console.log("0" == false);   // true (confusing!)
console.log([] == true);     // false
console.log([] == false);    // true (wat!)

// 11. SHORT-CIRCUIT WITH FUNCTIONS

function expensive() {
  console.log("Called expensive function");
  return "result";
}

// Function only called if left side is truthy
const result1 = true && expensive();  // "Called expensive function"
const result2 = false && expensive(); // (not called)

// Function only called if left side is falsy
const result3 = true || expensive();  // (not called)
const result4 = false || expensive(); // "Called expensive function"
```

### Common Mistakes

- ❌ **Mistake:** Thinking "0" is falsy
  ```javascript
  if ("0") {
    console.log("Runs!"); // "0" is a truthy string
  }
  ```

- ❌ **Mistake:** Thinking empty array/object is falsy
  ```javascript
  if ([]) {
    console.log("Runs!"); // Empty array is truthy
  }

  if ({}) {
    console.log("Runs!"); // Empty object is truthy
  }
  ```

- ✅ **Correct:** Know the 8 falsy values and use appropriate checks
  ```javascript
  // Check array length
  if (arr.length > 0) { }

  // Check object keys
  if (Object.keys(obj).length > 0) { }

  // Use nullish coalescing for defaults
  const count = value ?? 0;
  ```

### Follow-up Questions

- "Why are empty arrays and objects truthy?"
- "What is the difference between `||` and `??`?"
- "How does short-circuit evaluation work?"
- "What are the pitfalls of using `||` for default values?"
- "Why should you avoid comparing with `== true`?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Boolean Conversion (ToBoolean):**
V8 has fast-path for 8 falsy values (hardcoded check). Everything else → true. Conversion ~1-2ns.

**Falsy values**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` (memorize these 8!)

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** `const count = items.length || 0` broke when array was empty (length = 0 is falsy).

**Fix**: Use nullish coalescing:
```javascript
const count = items.length ?? 0;  // Only replaces null/undefined
```

Lesson: `||` treats 0 as falsy. Use `??` for numeric defaults.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**`||`** (OR): Returns first truthy value (treats 0, "" as falsy)
**`??`** (Nullish): Returns first non-nullish value (only null/undefined are "empty")

**Use `??`** for numbers and strings. Use `||` for boolean checks only.

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Falsy values** = Things that act like `false` in conditions. Only 8 exist:

```javascript
if (0) // false
if ("") // false
if (null) // false
if (undefined) // false
if (NaN) // false
if (false) // false

// EVERYTHING ELSE IS TRUTHY:
if ("0") // true (non-empty string!)
if ([]) // true (empty array!)
if ({}) // true (empty object!)
```

Gotcha: Empty arrays/objects are TRUTHY. Only empty string "" is falsy.

</details>

### Resources

- [MDN: Truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)
- [MDN: Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
- [JavaScript.info: Type Conversions](https://javascript.info/type-conversions)

---

## Question 2: Explain Type Coercion in JavaScript

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

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**ToPrimitive Algorithm:**
1. Check `[Symbol.toPrimitive]` method
2. If hint="number": try `valueOf()` then `toString()`
3. If hint="string": try `toString()` then `valueOf()`

**Performance**: Implicit coercion adds 10-50ns overhead. Explicit conversion (Number(), String()) is same speed as implicit.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** `"10" + 5` returned "105" instead of 15, breaking sum calculation in cart total.

**Fix**: Parse strings explicitly:
```javascript
const total = Number(price) + quantity;  // Explicit
```

TypeScript caught 80% of these at compile time. Remaining 20% caught by tests.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Implicit coercion pros**: Shorter code, flexible
**Cons**: Confusing, error-prone, hard to debug

**Rule**: Avoid implicit coercion. Use explicit conversions (Number(), String(), Boolean()) for clarity.

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Coercion** = JS automatically converting types.

```javascript
"5" + 3    // "53" (number → string, then concatenate)
"5" - 3    // 2   (string → number, then subtract)
```

**Why confusing:**
- `+` with string → concatenation
- `-` always → math (converts to number)

**Safe practice**: Always convert explicitly:
```javascript
Number("5") + 3  // 8 (clear intent)
String(5) + "3"  // "53" (clear intent)
```

</details>

### Resources
- [MDN: Type Coercion](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion)
- [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/)
- [You Don't Know JS: Types & Grammar](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/types%20%26%20grammar/README.md)

---
