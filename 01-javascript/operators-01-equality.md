# Type Checking & Equality

> **Focus**: Core JavaScript concepts

---

## Question 1: What is the difference between == and ===?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question
Explain the difference between loose equality (==) and strict equality (===). When should you use each?

### Answer

- **`==`** (Loose/Abstract Equality): Performs type coercion before comparison
- **`===`** (Strict Equality): No type coercion, checks both type and value

1. **How == Works**
   - If types are different, JavaScript converts them to the same type
   - Follows complex coercion rules
   - Can lead to unexpected behavior
   - Special case: `null == undefined` returns `true`

2. **How === Works**
   - If types are different, immediately returns `false`
   - No type conversion
   - More predictable and explicit
   - Recommended for most comparisons

3. **Coercion Rules for ==**
   - String to number: `"5" == 5` → `true`
   - Boolean to number: `true == 1` → `true`
   - Object to primitive: `[5] == 5` → `true`
   - `null == undefined` → `true` (special case)

4. **When to Use Each**
   - Use `===` almost always (best practice)
   - Use `==` only when intentionally checking for `null` or `undefined`
   - Most style guides enforce `===`

5. **Best Practices**
   - Default to `===` for clarity and safety
   - Avoid relying on coercion
   - Explicitly convert types when needed
   - Use linters to enforce `===`

### Code Example

```javascript
// 1. BASIC COMPARISONS

// === (Strict Equality)
console.log(5 === 5);           // true (same type, same value)
console.log(5 === "5");         // false (different types)
console.log(true === 1);        // false (different types)
console.log(null === undefined); // false (different types)

// == (Loose Equality)
console.log(5 == 5);            // true
console.log(5 == "5");          // true (string coerced to number)
console.log(true == 1);         // true (boolean coerced to number)
console.log(null == undefined);  // true (special case)

// 2. TYPE COERCION EXAMPLES

// String to number
console.log("10" == 10);        // true
console.log("10" === 10);       // false

// Boolean to number
console.log(true == 1);         // true (true → 1)
console.log(false == 0);        // true (false → 0)
console.log(true === 1);        // false

// Empty string to number
console.log("" == 0);           // true ("" → 0)
console.log("" === 0);          // false

// Null and undefined
console.log(null == undefined); // true (special case)
console.log(null === undefined); // false
console.log(null == 0);         // false
console.log(undefined == 0);    // false

// 3. ARRAY AND OBJECT COMPARISONS

// Arrays to primitives
console.log([1] == 1);          // true ([1] → "1" → 1)
console.log([1] === 1);         // false

console.log([] == 0);           // true ([] → "" → 0)
console.log([] === 0);          // false

console.log([""] == 0);         // true ([""] → "" → 0)

// Objects
console.log({} == {});          // false (different references)
console.log({} === {});         // false

// 4. TRICKY CASES

console.log(false == "");       // true (both → 0)
console.log(false == "0");      // true (both → 0)
console.log("" == "0");         // false (string comparison)

console.log(0 == "");           // true
console.log(0 == "0");          // true

// The infamous case
console.log([] == ![]);         // true!
/*
Explanation:
1. ![] → false (empty array is truthy)
2. [] == false
3. [] → "" (ToPrimitive)
4. "" == false
5. "" → 0, false → 0
6. 0 == 0 → true
*/

// 5. NaN COMPARISON (SPECIAL CASE)

console.log(NaN == NaN);        // false
console.log(NaN === NaN);       // false
console.log(Object.is(NaN, NaN)); // true (use Object.is for NaN)

// Check for NaN
console.log(Number.isNaN(NaN)); // true (correct way)
console.log(isNaN("hello"));    // true (converts to number first!)
console.log(Number.isNaN("hello")); // false (doesn't convert)

// 6. +0 AND -0

console.log(+0 == -0);          // true
console.log(+0 === -0);         // true
console.log(Object.is(+0, -0)); // false

// 7. PRACTICAL - NULL/UNDEFINED CHECK

// ❌ Bad: Checking both separately
if (value === null || value === undefined) {
  console.log("Value is nullish");
}

// ✅ Good: Using == for null check (rare acceptable use)
if (value == null) {
  // true if value is null OR undefined
  console.log("Value is nullish");
}

// ✅ Better: Modern nullish check
if (value ?? false) {
  console.log("Value is not null/undefined");
}

// 8. PRACTICAL - USER INPUT VALIDATION

function validateAge(age) {
  // User input might be string or number

  // ❌ Bad: Using ==
  if (age == 18) {
    return true; // Would match "18" too
  }

  // ✅ Good: Explicit conversion + ===
  if (Number(age) === 18) {
    return true;
  }

  // ✅ Better: Type check first
  if (typeof age === 'number' && age === 18) {
    return true;
  }
}

// 9. COMPARISON ALGORITHM

// === Algorithm:
// 1. If types differ → false
// 2. If both undefined → true
// 3. If both null → true
// 4. If both numbers and same value → true
// 5. If both strings and same characters → true
// 6. If both booleans and same → true
// 7. If both reference same object → true
// 8. Otherwise → false

// == Algorithm (simplified):
// 1. If same type → compare like ===
// 2. If null/undefined → true
// 3. If number/string → convert string to number
// 4. If boolean → convert boolean to number
// 5. If object/primitive → convert object to primitive
// 6. Otherwise → false
```

### Common Mistakes

- ❌ **Mistake:** Using == carelessly
  ```javascript
  const input = "0";

  if (input == false) { // true! (unexpected)
    console.log("Empty");
  }
  ```

- ❌ **Mistake:** Thinking == is "more flexible"
  ```javascript
  function isEqual(a, b) {
    return a == b; // Dangerous! Hidden coercion
  }

  console.log(isEqual("1", 1));    // true
  console.log(isEqual(true, 1));   // true
  console.log(isEqual([], ""));    // true (unexpected!)
  ```

- ✅ **Correct:** Use === by default
  ```javascript
  if (input === "") {
    console.log("Empty");
  }

  // Explicit conversion when needed
  if (Number(input) === 0) {
    console.log("Zero");
  }
  ```

### Follow-up Questions

- "What are the coercion rules for the == operator?"
- "Why does `[] == ![]` return true?"
- "When is it acceptable to use ==?"
- "What is Object.is() and how is it different?"
- "How does != differ from !==?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**V8 Equality Algorithm:**
- `===`: Type check (1ns) → Value check (1-5ns) = ~2-6ns total
- `==`: Type check → ToPrimitive conversion (~10-50ns) → Compare = ~12-60ns

**Performance**: `===` is 3-10x faster. Always prefer strict equality unless specifically need coercion.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** `if (user.age == '18')` passed validation but caused insurance calculation bugs (string vs number).

**Fix:** Use `===` everywhere. ESLint rule `eqeqeq: "error"` catches all instances. Bugs dropped 40%.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Use `===`**: 99% of cases (explicit, predictable, faster)
**Use `==`**: Only when checking `null` or `undefined` (`x == null` checks both)

**Rule**: Default to `===`, use `==` only with explicit comment explaining why.

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**`===`** = Strict. Must match type AND value.
**`==`** = Loose. Converts types first, then compares.

```javascript
5 === "5"  // false (number vs string)
5 == "5"   // true (converts "5" → 5, then compares)
```

**Gotcha**: `[] == ![]` is `true` (both sides coerce to 0). Always use `===` to avoid surprises!

</details>

### Resources

- [MDN: Equality Comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/)
- [Understanding == vs ===](https://www.freecodecamp.org/news/loose-vs-strict-equality-in-javascript/)

---

## Question 2: What is the difference between null and undefined?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain the difference between `null` and `undefined` in JavaScript. When would you use each?

### Answer

Both represent absence of value, but with different meanings:
- **`undefined`**: Variable declared but not assigned, or missing property
- **`null`**: Intentional absence of value (explicit)

1. **undefined Characteristics**
   - Default value for uninitialized variables
   - Default return value for functions
   - Missing object properties
   - Type: `undefined`
   - Represents "not yet defined"

2. **null Characteristics**
   - Must be explicitly assigned
   - Represents intentional absence
   - Type: `object` (historical bug)
   - Represents "intentionally empty"

3. **When Variables Become undefined**
   - Declared but not initialized
   - Function parameters not passed
   - Accessing non-existent object properties
   - Function without return statement

4. **When to Use null**
   - Explicitly clear a value
   - Indicate "no object" (API returns)
   - Reset object references
   - Intentionally empty state

5. **Checking for null/undefined**
   - Use `== null` to check both
   - Use `=== null` or `=== undefined` for specific check
   - Use nullish coalescing (`??`) for default values
   - Use optional chaining (`?.`) for safe access

### Code Example

```javascript
// 1. UNDEFINED - UNINITIALIZED VARIABLES

let x;
console.log(x);        // undefined
console.log(typeof x); // "undefined"

var y;
console.log(y);        // undefined

// 2. NULL - EXPLICIT ABSENCE

let user = null; // Explicitly "no user"
console.log(user);        // null
console.log(typeof user); // "object" (historical bug!)

// 3. FUNCTION RETURN VALUES

function noReturn() {
  // No return statement
}

console.log(noReturn()); // undefined

function explicitNull() {
  return null; // Explicit no value
}

console.log(explicitNull()); // null

// 4. FUNCTION PARAMETERS

function greet(name) {
  console.log(name); // undefined if not passed
}

greet(); // undefined

// 5. OBJECT PROPERTIES

const obj = { name: "John" };

console.log(obj.name);  // "John"
console.log(obj.age);   // undefined (property doesn't exist)
console.log(obj.city);  // undefined

// Explicit null
const user = {
  name: "Alice",
  email: null // Explicitly no email
};

console.log(user.email); // null

// 6. ARRAY ELEMENTS

const arr = [1, 2, 3];
console.log(arr[10]);    // undefined (index doesn't exist)

const arr2 = [1, null, 3];
console.log(arr2[1]);    // null (explicitly set)

// 7. CHECKING FOR NULL VS UNDEFINED

let value1;
let value2 = null;

// Checking undefined
console.log(value1 === undefined);  // true
console.log(typeof value1 === "undefined"); // true

// Checking null
console.log(value2 === null);       // true
console.log(value2 === undefined);  // false

// Checking both (nullish)
console.log(value1 == null);        // true
console.log(value2 == null);        // true

// 8. TYPE CHECKING

console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" (bug!)

// Correct null check
console.log(null === null);         // true
console.log(value2 === null);       // true

// 9. PRACTICAL - DEFAULT VALUES

// ❌ Using undefined
function getUser(id) {
  if (id === 1) {
    return { name: "John" };
  }
  return undefined; // Don't do this
}

// ✅ Using null
function getUserBetter(id) {
  if (id === 1) {
    return { name: "John" };
  }
  return null; // Clear intent: no user found
}

// 10. NULLISH COALESCING

let username;
let savedName = null;

// ❌ Using || (treats 0, "", false as falsy)
const name1 = username || "Guest";    // "Guest"
const name2 = savedName || "Guest";   // "Guest"

// ✅ Using ?? (only null/undefined)
const name3 = username ?? "Guest";    // "Guest"
const name4 = savedName ?? "Guest";   // "Guest"

// Difference:
const count = 0;
console.log(count || 10);  // 10 (0 is falsy)
console.log(count ?? 10);  // 0 (0 is not null/undefined)

// 11. OPTIONAL CHAINING

const user = {
  name: "Alice",
  address: null
};

// ❌ Without optional chaining
console.log(user.address.city); // TypeError!

// ✅ With optional chaining
console.log(user.address?.city); // undefined (safe)
console.log(user.settings?.theme); // undefined

// 12. CLEARING REFERENCES

let largeObject = { /* huge data */ };

// Clear reference to allow garbage collection
largeObject = null;

// 13. API RESPONSES

// Common pattern: null means "no data"
function fetchUser(id) {
  const users = {
    1: { name: "Alice" },
    2: { name: "Bob" }
  };

  return users[id] || null; // null if not found
}

console.log(fetchUser(1)); // { name: "Alice" }
console.log(fetchUser(99)); // null (not found)

// 14. DESTRUCTURING WITH DEFAULTS

const { name = "Guest", age = 18 } = {};
console.log(name); // "Guest" (undefined → default)
console.log(age);  // 18

const { city = "NYC" } = { city: null };
console.log(city); // null (null doesn't trigger default!)

// Use nullish coalescing for true default
const { country } = { country: null };
console.log(country ?? "USA"); // "USA"

// 15. TYPEOF VS STRICT EQUALITY

function isUndefined(value) {
  // ✅ Method 1: Strict equality
  return value === undefined;

  // ✅ Method 2: typeof (safer for undeclared variables)
  return typeof value === "undefined";
}

function isNull(value) {
  // ✅ Only strict equality works
  return value === null;

  // ❌ typeof doesn't help
  // typeof null === "object"
}

// 16. JSON SERIALIZATION

const data = {
  name: "John",
  age: undefined,
  city: null
};

console.log(JSON.stringify(data));
// {"name":"John","city":null}
// undefined is omitted, null is preserved!
```

### Common Mistakes

- ❌ **Mistake:** Using typeof for null check
  ```javascript
  if (typeof value === "null") { // ❌ Never true!
    // typeof null is "object"
  }
  ```

- ❌ **Mistake:** Not distinguishing between null and undefined
  ```javascript
  function getUserAge(user) {
    return user.age; // undefined if missing, but could be null
  }

  // Better: be explicit
  function getUserAge(user) {
    return user.age !== undefined ? user.age : null;
  }
  ```

- ✅ **Correct:** Use appropriate checks
  ```javascript
  // Check specifically
  if (value === null) { }
  if (value === undefined) { }

  // Check either (nullish)
  if (value == null) { }

  // Use nullish coalescing
  const result = value ?? defaultValue;
  ```

### Follow-up Questions

- "Why does `typeof null` return 'object'?"
- "When should you explicitly return null?"
- "What is the difference between `== null` and `=== null`?"
- "How does JSON.stringify handle null vs undefined?"
- "What is nullish coalescing and when would you use it?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**typeof null Bug:**
In V8, values are tagged: object = 000, null = all zeros. Type check reads first 3 bits → sees 000 → thinks "object". Historical bug kept for compatibility.

**Memory**: Both `null` and `undefined` are singletons (one instance globally). No memory waste from multiple references.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** API returned `{data: null}` vs `{data: undefined}` inconsistently. Frontend checks broke.

**Fix**: Normalize at API boundary:
```javascript
const data = response.data ?? null;  // Convert undefined → null
```

Consistent handling reduced edge case bugs by 60%.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**null**: Explicit "no value", intentional absence, API returns
**undefined**: Uninitialized, missing property, default parameter

**Convention**: Use `null` for intentional absence, let `undefined` mean "not set yet".

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**undefined** = Variable exists but has no value assigned yet.
**null** = Explicitly saying "this is empty/nothing".

```javascript
let a;           // undefined (no value assigned)
let b = null;    // null (explicitly set to nothing)
```

Think of it like a box: undefined = box exists but empty, null = box with label "intentionally empty".

</details>

### Resources

- [MDN: null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
- [MDN: undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [JavaScript.info: null and undefined](https://javascript.info/types#null)

---

## Question 3: What are truthy and falsy values in JavaScript?

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
- "What are the pitfalls of using `|| for default values?"
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

## Question 4: Explain Type Coercion in JavaScript

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

