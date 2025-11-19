# JavaScript Type Coercion & Conversion

> **Focus**: Deep understanding of type coercion, conversion methods, wrapper objects, and valueOf/toString behavior

---

## Question 1: How does type coercion work in JavaScript?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Uber

### Question

Explain how JavaScript's type coercion works. What is the difference between implicit and explicit coercion? How do `==` vs `===` differ? What are the rules for coercion to primitive types?

### Answer

**Type coercion** is the automatic or explicit conversion of values from one data type to another.

**Two Types of Coercion:**
1. **Implicit (Automatic)** - JavaScript converts types automatically
2. **Explicit (Manual)** - Programmer intentionally converts types

**Coercion happens with:**
- Operators (+, -, *, /, ==, etc.)
- Conditionals (if, while, etc.)
- Logical operators (&&, ||, !)
- String templates
- Number/Boolean contexts

### Code Example

```javascript
// ============================================
// 1. IMPLICIT COERCION - STRING CONCATENATION
// ============================================

// Number to String (+ operator)
console.log(1 + "2");        // "12" (number 1 becomes "1")
console.log("5" + 3);        // "53" (number 3 becomes "3")
console.log("Hello" + 42);   // "Hello42"
console.log(true + " value"); // "true value"
console.log(null + " value"); // "null value"

// Multiple types
console.log(1 + 2 + "3");    // "33" (1+2=3, then "3"+"3"="33")
console.log("1" + 2 + 3);    // "123" ("1"+"2"="12", "12"+"3"="123")

// ============================================
// 2. IMPLICIT COERCION - NUMERIC OPERATIONS
// ============================================

// String to Number (-, *, /, % operators)
console.log("5" - 2);        // 3 (string "5" becomes number 5)
console.log("10" * "2");     // 20 (both converted to numbers)
console.log("20" / "4");     // 5
console.log("15" % "4");     // 3

// With boolean
console.log(true + 1);       // 2 (true becomes 1)
console.log(false + 1);      // 1 (false becomes 0)
console.log(true * 5);       // 5

// With null and undefined
console.log(null + 1);       // 1 (null becomes 0)
console.log(undefined + 1);  // NaN (undefined becomes NaN)
console.log(null * 5);       // 0
console.log(undefined * 5);  // NaN

// Unexpected results
console.log("5" - "2");      // 3 (both to numbers)
console.log("5" + - "2");    // "5-2" (unary minus makes -2, then string concat)
console.log("5" - - "2");    // 7 (double negation: 5 - (-2) = 7)

// ============================================
// 3. BOOLEAN COERCION - FALSY VALUES
// ============================================

// 7 Falsy values in JavaScript
console.log(Boolean(false));      // false
console.log(Boolean(0));          // false
console.log(Boolean(-0));         // false
console.log(Boolean(0n));         // false (BigInt zero)
console.log(Boolean(""));         // false (empty string)
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false

// Everything else is truthy
console.log(Boolean(true));       // true
console.log(Boolean(1));          // true
console.log(Boolean(-1));         // true
console.log(Boolean("0"));        // true (non-empty string!)
console.log(Boolean("false"));    // true (non-empty string!)
console.log(Boolean([]));         // true (empty array!)
console.log(Boolean({}));         // true (empty object!)
console.log(Boolean(function(){})); // true

// Surprising truthy values
console.log(Boolean(" "));        // true (space is not empty!)
console.log(Boolean(new Boolean(false))); // true (object wrapper!)

// ============================================
// 4. LOOSE EQUALITY (==) VS STRICT EQUALITY (===)
// ============================================

// === (Strict) - No coercion, must be same type and value
console.log(5 === 5);            // true
console.log(5 === "5");          // false (different types)
console.log(null === null);      // true
console.log(null === undefined); // false
console.log(NaN === NaN);        // false (special case!)

// == (Loose) - Coerces types before comparison
console.log(5 == 5);             // true
console.log(5 == "5");           // true (string "5" coerced to number)
console.log(null == undefined);  // true (special case)
console.log(0 == false);         // true (false becomes 0)
console.log("" == false);        // true (both become 0)
console.log([] == false);        // true ([] becomes 0)

// Surprising == behavior
console.log("0" == false);       // true
console.log(0 == "");            // true
console.log(0 == "0");           // true
console.log(false == "false");   // false
console.log(false == "");        // true
console.log(false == []);        // true
console.log("" == []);           // true
console.log(null == 0);          // false (special case: null only == undefined)

// The infamous cases
console.log([] == ![]);          // true! (crazy but true)
// Explanation: ![] is false, [] == false is true

console.log([] + []);            // "" (empty string)
console.log([] + {});            // "[object Object]"
console.log({} + []);            // 0 or "[object Object]" (depends on context!)
console.log({} + {});            // "[object Object][object Object]"

// ============================================
// 5. EXPLICIT COERCION - TO STRING
// ============================================

// String() function
console.log(String(123));        // "123"
console.log(String(true));       // "true"
console.log(String(false));      // "false"
console.log(String(null));       // "null"
console.log(String(undefined));  // "undefined"
console.log(String([1, 2, 3]));  // "1,2,3"
console.log(String({ a: 1 }));   // "[object Object]"

// .toString() method
console.log((123).toString());   // "123"
console.log(true.toString());    // "true"
console.log([1, 2].toString());  // "1,2"

// Template literals
console.log(`Value: ${123}`);    // "Value: 123"
console.log(`${true}`);          // "true"
console.log(`${null}`);          // "null"

// Concatenation with empty string
console.log(123 + "");           // "123"
console.log(true + "");          // "true"

// ============================================
// 6. EXPLICIT COERCION - TO NUMBER
// ============================================

// Number() function
console.log(Number("123"));      // 123
console.log(Number("123.45"));   // 123.45
console.log(Number(""));         // 0 (empty string becomes 0!)
console.log(Number(" "));        // 0 (whitespace becomes 0!)
console.log(Number("123abc"));   // NaN (invalid number)
console.log(Number("abc"));      // NaN
console.log(Number(true));       // 1
console.log(Number(false));      // 0
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN
console.log(Number([1]));        // 1
console.log(Number([1, 2]));     // NaN
console.log(Number({}));         // NaN

// parseInt() - parses until first non-digit
console.log(parseInt("123"));    // 123
console.log(parseInt("123.45")); // 123 (stops at decimal!)
console.log(parseInt("123abc")); // 123 (stops at 'a')
console.log(parseInt("abc123")); // NaN (starts with non-digit)
console.log(parseInt("   10"));  // 10 (ignores leading whitespace)

// Always specify radix!
console.log(parseInt("10", 10)); // 10 (base 10)
console.log(parseInt("10", 2));  // 2 (base 2: binary)
console.log(parseInt("10", 16)); // 16 (base 16: hex)
console.log(parseInt("0x10"));   // 16 (hex prefix recognized)

// parseFloat()
console.log(parseFloat("123.45"));    // 123.45
console.log(parseFloat("123.45abc")); // 123.45
console.log(parseFloat(".5"));        // 0.5

// Unary plus (+)
console.log(+"123");         // 123
console.log(+"123.45");      // 123.45
console.log(+"");            // 0
console.log(+"123abc");      // NaN
console.log(+true);          // 1
console.log(+false);         // 0
console.log(+null);          // 0
console.log(+undefined);     // NaN

// Mathematical operations
console.log("123" * 1);      // 123
console.log("123" - 0);      // 123

// ============================================
// 7. EXPLICIT COERCION - TO BOOLEAN
// ============================================

// Boolean() function (most explicit)
console.log(Boolean(1));         // true
console.log(Boolean(0));         // false
console.log(Boolean("hello"));   // true
console.log(Boolean(""));        // false

// Double negation !! (common idiom)
console.log(!!1);                // true
console.log(!!0);                // false
console.log(!!"hello");          // true
console.log(!!"");               // false
console.log(!![]);               // true
console.log(!!null);             // false

// Conditional context (implicit)
if (value) { } // value is coerced to boolean

// Logical operators return original values!
console.log(true && "hello");    // "hello" (not true!)
console.log(false && "hello");   // false
console.log(true || "hello");    // true
console.log(false || "hello");   // "hello" (not true!)
console.log("" || "default");    // "default"
console.log(0 || 100);           // 100

// ============================================
// 8. TOPRIMITIVE ALGORITHM
// ============================================

// Objects convert to primitives in specific order
const obj = {
  valueOf() {
    console.log("valueOf called");
    return 42;
  },
  toString() {
    console.log("toString called");
    return "object string";
  }
};

// Numeric context: valueOf first, then toString
console.log(obj * 2);
// Logs: "valueOf called"
// Result: 84

// String context: toString first, then valueOf
console.log(String(obj));
// Logs: "toString called"
// Result: "object string"

// Default context: usually valueOf
console.log(obj + "");
// Logs: "valueOf called"
// Result: "42"

// Only toString
const obj2 = {
  toString() {
    return "42";
  }
};
console.log(obj2 * 2);  // 84 (uses toString since no valueOf)

// ============================================
// 9. SYMBOL.TOPRIMITIVE (OVERRIDE COERCION)
// ============================================

const customObj = {
  [Symbol.toPrimitive](hint) {
    console.log(`Hint: ${hint}`);

    if (hint === "number") {
      return 42;
    }
    if (hint === "string") {
      return "forty-two";
    }
    return true; // default
  }
};

console.log(+customObj);      // Hint: number → 42
console.log(`${customObj}`);  // Hint: string → "forty-two"
console.log(customObj + "");  // Hint: default → "true"

// ============================================
// 10. COMMON COERCION PITFALLS
// ============================================

// Array to number
console.log(+[]);           // 0
console.log(+[1]);          // 1
console.log(+[1, 2]);       // NaN

// Explanation:
// [].toString() => ""
// +"" => 0

// [1].toString() => "1"
// +"1" => 1

// [1,2].toString() => "1,2"
// +"1,2" => NaN

// Object to number
console.log(+{});           // NaN
// {}.toString() => "[object Object]"
// +"[object Object]" => NaN

// null vs undefined in numeric context
console.log(Number(null));      // 0
console.log(Number(undefined)); // NaN

console.log(null >= 0);         // true (null becomes 0)
console.log(null == 0);         // false (special rule!)
console.log(null > 0);          // false
console.log(null <= 0);         // true

// The infamous [] == ![]
console.log([] == ![]);
// Step 1: ![] = false (object is truthy, negated is false)
// Step 2: [] == false
// Step 3: [] converts to "" (via toString)
// Step 4: "" == false
// Step 5: 0 == 0
// Result: true ⚠️
```

<details>
<summary><strong>🔍 Deep Dive: Abstract Equality Comparison Algorithm</strong></summary>

### How == Works (Simplified)

**Algorithm steps for `x == y`:**

1. If same type → use === (strict equality)
2. If null == undefined → return true
3. If number == string → convert string to number, retry
4. If boolean == anything → convert boolean to number, retry
5. If object == primitive → convert object to primitive (ToPrimitive), retry
6. Otherwise → return false

**Complete Type Coercion Table for ==:**

```
       | undef | null | bool | num | str | obj
-------|-------|------|------|-----|-----|-----
undef  | true  | true | false|false|false|false
null   | true  | true | false|false|false|false
bool   | false |false | same | →num| →num| →prim
num    | false |false | ←num | same| →num| →prim
str    | false |false | ←num | ←num| same| →prim
obj    | false |false | ←prim| ←prim|←prim| same
```

**ToPrimitive Algorithm:**
```javascript
// Numeric hint (for - * / %)
object[Symbol.toPrimitive]("number")
|| object.valueOf()
|| object.toString()

// String hint (for String(), template literals)
object[Symbol.toPrimitive]("string")
|| object.toString()
|| object.valueOf()

// Default hint (for + ==)
object[Symbol.toPrimitive]("default")
|| object.valueOf()
|| object.toString()
```

**Examples:**

```javascript
// Case: "5" == 5
"5" == 5
→ Number("5") == 5
→ 5 == 5
→ true

// Case: [] == false
[] == false
→ [] == 0 (false becomes 0)
→ "" == 0 ([].toString() = "")
→ 0 == 0 (Number("") = 0)
→ true

// Case: null == 0
null == 0
→ special rule: null only equals undefined
→ false
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Form Validation Bug</strong></summary>

### Production Bug: Checkbox Validation Failing

**Scenario:** Form validation incorrectly accepts invalid values.

```javascript
// ❌ BUG: Using == with user input
function validateAge(input) {
  // Input comes from <input type="text">
  if (input == 0) {
    return "Age cannot be 0";
  }
  if (input < 18) {
    return "Must be 18+";
  }
  return "Valid";
}

// Test cases
console.log(validateAge("0"));      // Works: "Age cannot be 0"
console.log(validateAge(""));       // ❌ "Age cannot be 0" (should be error!)
console.log(validateAge("   "));    // ❌ "Age cannot be 0" (should be error!)
console.log(validateAge("abc"));    // ❌ "Valid" (should be error!)

// Why?
"" == 0      // true (empty string coerces to 0)
"   " == 0   // true (whitespace coerces to 0)
"abc" < 18   // false (NaN is not < 18)
```

**Fix: Use strict equality and proper validation**
```javascript
// ✅ CORRECT: Explicit type checking
function validateAge(input) {
  // Convert to number
  const age = Number(input);

  // Check for invalid number
  if (isNaN(age) || input.trim() === "") {
    return "Please enter a valid number";
  }

  // Use strict equality
  if (age === 0) {
    return "Age cannot be 0";
  }

  if (age < 18) {
    return "Must be 18+";
  }

  return "Valid";
}

console.log(validateAge("0"));      // "Age cannot be 0" ✅
console.log(validateAge(""));       // "Please enter a valid number" ✅
console.log(validateAge("   "));    // "Please enter a valid number" ✅
console.log(validateAge("abc"));    // "Please enter a valid number" ✅
console.log(validateAge("25"));     // "Valid" ✅
```

**Another Example: Array Comparison**
```javascript
// ❌ BUG: Comparing arrays with ==
function hasData(arr) {
  if (arr == []) {  // ❌ ALWAYS false!
    return false;
  }
  return true;
}

console.log(hasData([])); // true (should be false!)

// Why? Different array instances never equal
[] == []  // false (different references)

// ✅ CORRECT: Check length
function hasData(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }
  return true;
}
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: == vs ===</strong></summary>

### When to Use Each

**Use === (Strict) - PREFERRED (99% of cases)**
- ✅ Predictable behavior
- ✅ No hidden coercion bugs
- ✅ Faster (no type conversion)
- ✅ Easier to understand
- ✅ Required by most linters

```javascript
// Good uses of ===
if (count === 0) { }
if (status === "active") { }
if (user === null) { }
```

**Use == (Loose) - RARE (1% of cases)**
- ⚠️ Checking for null OR undefined
- ⚠️ When you WANT coercion (be explicit!)

```javascript
// Acceptable use: null/undefined check
if (value == null) {  // Checks both null and undefined
  // value is null OR undefined
}

// Better: be explicit
if (value === null || value === undefined) { }

// Or use nullish check
if (value ?? false) { }
```

### Performance

```javascript
// Benchmark: === vs ==
const iterations = 10000000;

console.time('===');
for (let i = 0; i < iterations; i++) {
  "5" === "5";
}
console.timeEnd('==='); // ~10ms

console.time('==');
for (let i = 0; i < iterations; i++) {
  "5" == 5;  // Coercion overhead
}
console.timeEnd('=='); // ~15ms (slower due to coercion)
```

### ESLint Rules

```javascript
// .eslintrc.js
{
  rules: {
    "eqeqeq": ["error", "always"], // Enforce ===
    "no-implicit-coercion": "error" // Prevent !!value, +value, etc.
  }
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Type coercion is like **JavaScript being overly helpful** – sometimes too helpful!

**Implicit coercion - JavaScript does it automatically:**

```javascript
"5" - 2   // 3 (JS says: "I'll turn '5' into 5 for you!")
"5" + 2   // "52" (JS says: "I'll turn 2 into '2' for you!")
```

It's like a friend who finishes your sentences – sometimes helpful, sometimes confusing!

**The 7 falsy values - things that become false:**
```javascript
if (value) { }

// These make the if SKIP:
false     // Obviously false
0         // Zero is false
""        // Empty string is false
null      // Null is false
undefined // Undefined is false
NaN       // Not-a-number is false
0n        // BigInt zero is false
```

**EVERYTHING ELSE is truthy:**
```javascript
if ("0") { }      // Runs! (string "0" is not empty)
if ([]) { }       // Runs! (empty array is still an object)
if ({}) { }       // Runs! (empty object is truthy)
if ("false") { }  // Runs! (string "false" is not empty)
```

**The == vs === battle:**

```javascript
// === is like a strict teacher
5 === "5"  // false - "Same TYPE and value, or nothing!"

// == is like a lenient teacher
5 == "5"   // true - "I'll convert them and see if they match"
```

**Rule of thumb:** Always use === unless you have a VERY good reason.

**Why?**
```javascript
"" == 0        // true ⚠️
[] == false    // true ⚠️
null == 0      // false ⚠️

// Confusing, right? Use === instead:
"" === 0       // false ✅ (different types)
[] === false   // false ✅ (different types)
null === 0     // false ✅ (different types)
```

**Key takeaway:** JavaScript tries to be helpful with automatic conversion, but it's safer to be explicit with === and manual conversion."

</details>

### Common Mistakes

❌ **Mistake 1:** Using == without understanding coercion
```javascript
if (value == false) {  // ❌ Will match 0, "", [], etc.
  // Unexpected matches
}
```

✅ **Correct:** Use explicit boolean check
```javascript
if (!value) {  // Clear intent: check for falsy
  // Or
}
if (value === false) {  // Only matches false
```

❌ **Mistake 2:** Assuming + always adds
```javascript
console.log("5" + 2);  // "52" ❌ (string concatenation!)
```

✅ **Correct:** Convert explicitly
```javascript
console.log(Number("5") + 2);  // 7 ✅
console.log(+"5" + 2);         // 7 ✅
```

❌ **Mistake 3:** Comparing arrays/objects with ==
```javascript
[1, 2] == [1, 2]  // false ❌ (different references!)
```

✅ **Correct:** Compare values
```javascript
JSON.stringify([1, 2]) === JSON.stringify([1, 2])  // true
// Or use deep equality library
```

### Follow-up Questions

1. "What are the 7 falsy values in JavaScript?"
2. "Explain the ToPrimitive algorithm"
3. "Why does [] == ![] return true?"
4. "What is the difference between Number() and parseInt()?"
5. "How does Symbol.toPrimitive work?"
6. "When is it okay to use == instead of ===?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**ToPrimitive Algorithm (V8):**
1. Check `Symbol.toPrimitive` method (highest priority)
2. If hint is "string": Call `toString()` → `valueOf()`
3. If hint is "number/default": Call `valueOf()` → `toString()`
4. If result is primitive, return; else TypeError

**V8 Optimization:** Inline cache (IC) for type checks. After warmup, `typeof` checks take ~0.3ns vs ~5ns for first call.

**7 Falsy Values (stored as tagged pointers in V8):**
- `false` (boolean primitive)
- `0`, `-0` (number primitives)
- `""` (empty string)
- `null` (special object type)
- `undefined` (special primitive)
- `NaN` (special number)

**Why `[] == ![]` is true:**
1. `![]` → `false` (object is truthy, negated)
2. `[] == false` → ToPrimitive([]) == ToNumber(false)
3. `"" == 0` → both become 0
4. `0 == 0` → `true`

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** E-commerce checkout validation bug - `if (quantity)` rejected valid 0 quantity for free items.

**Bug:**
```javascript
const quantity = 0;  // Free item
if (quantity) {  // ❌ Fails! 0 is falsy
  processOrder(quantity);
}
```

**Impact:**
- 15% of orders blocked (items with 0 price/quantity)
- Customer complaints: 200+ in 2 days
- Revenue loss: ~$50k/day

**Fix:**
```javascript
if (quantity !== undefined && quantity !== null) {  // ✅ Explicit check
  processOrder(quantity);
}
// Or use nullish check:
if (quantity ?? false !== false) {
  processOrder(quantity);
}
```

**Metrics After Fix:**
- Orders processed: 100% (no false rejections)
- Complaints: 0
- Code review rule added: "Never rely on falsy coercion for numbers"

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Comparison | `==` (Coercion) | `===` (Strict) | Winner |
|------------|----------------|----------------|--------|
| **Type Safety** | Implicit conversions (error-prone) | No conversions (predictable) | ✅ `===` |
| **Performance** | ~15ns (with ToPrimitive) | ~0.3ns (pointer compare) | ✅ `===` |
| **Code Clarity** | Requires ToPrimitive knowledge | Clear intent | ✅ `===` |
| **Null Checks** | `x == null` catches both null/undefined | Need `x === null \|\| x === undefined` | ✅ `==` (only case) |
| **Verbosity** | Shorter for null checks | More explicit everywhere | Tie |

**When to use `==`:** ONLY for `x == null` check (catches both null and undefined).

**When to use `===`:** Everywhere else (99% of cases).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Type Coercion Like Auto-Translate:**

Imagine JavaScript is a translator trying to compare two sentences:
- One in English: `"5"`
- One in Spanish: `5`

With `==`, JavaScript says: "Let me translate both to the same language first, then compare!" It converts `"5"` (string) to `5` (number), then compares: `5 == 5` → true.

With `===`, JavaScript says: "These are in different languages, so they're not the same!" → false.

**Real Analogy:**
```javascript
// Your friend asks: "Are you 18?"
const yourAge = 18;
const friendAsks = "18";  // They write it down as text

// == says: "Close enough! Both mean 18" → true
yourAge == friendAsks;  // true

// === says: "One is a number, one is text! Different!" → false
yourAge === friendAsks;  // false
```

**Rule of thumb:** Always use `===` unless you SPECIFICALLY want type conversion (which is rare and dangerous).

</details>

### Resources

- [MDN: Equality Comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [JavaScript.info: Type Conversions](https://javascript.info/type-conversions)
- [You Don't Know JS: Types & Grammar](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/types-grammar)

---

## Question 2: What are primitive wrapper objects in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Microsoft, Amazon

### Question

Explain primitive wrapper objects (String, Number, Boolean). How does JavaScript allow you to call methods on primitives? What is the difference between primitive values and their wrapper objects?

### Answer

**Primitive wrapper objects** are object versions of primitive types that JavaScript temporarily creates to allow method calls on primitives.

**The Three Wrappers:**
1. `String` - wraps string primitives
2. `Number` - wraps number primitives
3. `Boolean` - wraps boolean primitives

**How it works:** When you access a property/method on a primitive, JavaScript:
1. Temporarily wraps the primitive in its wrapper object
2. Accesses the property/method on the wrapper
3. Immediately discards the wrapper (called "autoboxing")

### Code Example

```javascript
// ============================================
// 1. PRIMITIVE vs WRAPPER OBJECT
// ============================================

// Primitive (preferred)
const strPrimitive = "hello";
const numPrimitive = 42;
const boolPrimitive = true;

console.log(typeof strPrimitive);   // "string"
console.log(typeof numPrimitive);   // "number"
console.log(typeof boolPrimitive);  // "boolean"

// Wrapper Object (avoid using new!)
const strObject = new String("hello");
const numObject = new Number(42);
const boolObject = new Boolean(true);

console.log(typeof strObject);      // "object" ⚠️
console.log(typeof numObject);      // "object" ⚠️
console.log(typeof boolObject);     // "object" ⚠️

console.log(strObject instanceof String);   // true
console.log(numObject instanceof Number);   // true
console.log(boolObject instanceof Boolean); // true

// ============================================
// 2. AUTOBOXING - TEMPORARY WRAPPER
// ============================================

// Primitive calling method
const str = "hello";
console.log(str.toUpperCase());  // "HELLO"

// What happens behind the scenes:
// 1. JavaScript creates: new String("hello")
// 2. Calls method: .toUpperCase()
// 3. Returns result: "HELLO"
// 4. Discards wrapper object

// You can't add properties to primitives (they disappear!)
str.customProperty = "value";
console.log(str.customProperty);  // undefined ⚠️

// But you CAN add to wrapper objects
const strObj = new String("hello");
strObj.customProperty = "value";
console.log(strObj.customProperty);  // "value" ✅

// ============================================
// 3. SURPRISING BEHAVIOR WITH WRAPPERS
// ============================================

// Primitive boolean
const primBool = false;
if (primBool) {
  console.log("Won't run");
}

// Wrapper object boolean
const objBool = new Boolean(false);
if (objBool) {
  console.log("RUNS!"); // ⚠️ Objects are always truthy!
}

// This is confusing:
console.log(objBool.valueOf());  // false (value inside)
console.log(Boolean(objBool));   // true (object is truthy)
console.log(!!objBool);          // true (object is truthy)

// Equality comparisons
console.log(false === false);               // true
console.log(new Boolean(false) === new Boolean(false)); // false (different objects!)
console.log(new Boolean(false) == false);   // true (coercion extracts value)

// ============================================
// 4. STRING WRAPPER METHODS
// ============================================

const str = "Hello World";

// Length property (not a method!)
console.log(str.length);  // 11

// Case conversion
console.log(str.toUpperCase());      // "HELLO WORLD"
console.log(str.toLowerCase());      // "hello world"

// Substring methods
console.log(str.slice(0, 5));        // "Hello"
console.log(str.substring(6, 11));   // "World"
console.log(str.substr(6, 5));       // "World" (deprecated)

// Search methods
console.log(str.indexOf("o"));       // 4
console.log(str.lastIndexOf("o"));   // 7
console.log(str.includes("World"));  // true
console.log(str.startsWith("Hello"));// true
console.log(str.endsWith("World"));  // true

// Split and join
console.log(str.split(" "));         // ["Hello", "World"]
console.log(str.split(""));          // ["H","e","l","l","o"," ","W","o","r","l","d"]

// Replace
console.log(str.replace("World", "JS")); // "Hello JS"
console.log(str.replaceAll("o", "0"));   // "Hell0 W0rld"

// Trim
const padded = "  hello  ";
console.log(padded.trim());          // "hello"
console.log(padded.trimStart());     // "hello  "
console.log(padded.trimEnd());       // "  hello"

// Pad
console.log("5".padStart(3, "0"));   // "005"
console.log("5".padEnd(3, "0"));     // "500"

// Repeat
console.log("Ha".repeat(3));         // "HaHaHa"

// Character access
console.log(str.charAt(0));          // "H"
console.log(str.charCodeAt(0));      // 72 (UTF-16 code)
console.log(str[0]);                 // "H" (bracket notation)

// ============================================
// 5. NUMBER WRAPPER METHODS
// ============================================

const num = 123.456789;

// Fixed decimal places
console.log(num.toFixed(2));         // "123.46" (string!)
console.log(num.toFixed(0));         // "123"

// Precision (significant digits)
console.log(num.toPrecision(5));     // "123.46"
console.log(num.toPrecision(2));     // "1.2e+2"

// Exponential notation
console.log(num.toExponential(2));   // "1.23e+2"

// Convert to string with radix
console.log((255).toString(16));     // "ff" (hexadecimal)
console.log((255).toString(2));      // "11111111" (binary)
console.log((255).toString(8));      // "377" (octal)

// Number.prototype methods available on literals
console.log((42).valueOf());         // 42

// Static methods (on Number constructor)
console.log(Number.isFinite(42));    // true
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isNaN(NaN));      // true
console.log(Number.isNaN("NaN"));    // false (string is not NaN)
console.log(Number.isInteger(42));   // true
console.log(Number.isInteger(42.1)); // false
console.log(Number.isSafeInteger(9007199254740991)); // true
console.log(Number.isSafeInteger(9007199254740992)); // false

// ============================================
// 6. BOOLEAN WRAPPER METHODS
// ============================================

const bool = true;

// Boolean has very few methods
console.log(bool.toString());        // "true"
console.log(bool.valueOf());         // true

// Mainly just for type checking
console.log(typeof bool);            // "boolean"
console.log(bool instanceof Boolean);// false (primitive)

const boolObj = new Boolean(false);
console.log(typeof boolObj);         // "object"
console.log(boolObj instanceof Boolean); // true

// ============================================
// 7. CREATING WRAPPERS - WITH vs WITHOUT NEW
// ============================================

// WITHOUT new - Type conversion (returns primitive)
const str1 = String(123);
const num1 = Number("456");
const bool1 = Boolean(1);

console.log(typeof str1);   // "string" ✅
console.log(typeof num1);   // "number" ✅
console.log(typeof bool1);  // "boolean" ✅

// WITH new - Creates wrapper object (avoid!)
const str2 = new String(123);
const num2 = new Number("456");
const bool2 = new Boolean(1);

console.log(typeof str2);   // "object" ⚠️
console.log(typeof num2);   // "object" ⚠️
console.log(typeof bool2);  // "object" ⚠️

// ============================================
// 8. EXTRACTING PRIMITIVE FROM WRAPPER
// ============================================

const strObj = new String("hello");

// valueOf() - get primitive value
console.log(strObj.valueOf());       // "hello" (primitive)
console.log(typeof strObj.valueOf());// "string"

// toString() - convert to string
console.log(strObj.toString());      // "hello"

// Unary plus (numbers only)
const numObj = new Number(42);
console.log(+numObj);                // 42 (primitive)

// Double negation (boolean)
const boolObj = new Boolean(false);
console.log(!!boolObj);              // true ⚠️ (object is truthy!)
console.log(boolObj.valueOf());      // false (actual value)

// ============================================
// 9. IMMUTABILITY - PRIMITIVES CAN'T BE CHANGED
// ============================================

// Strings are immutable
let str = "Hello";
str[0] = "h";  // No effect!
console.log(str);  // "Hello" (unchanged)

// String methods return NEW strings
let str2 = "hello";
str2.toUpperCase();  // Returns "HELLO"
console.log(str2);   // Still "hello" (original unchanged!)

let str3 = str2.toUpperCase();
console.log(str3);   // "HELLO" (new string)

// ============================================
// 10. NULL AND UNDEFINED - NO WRAPPERS!
// ============================================

// null and undefined have NO wrapper objects
console.log(null.toString());      // ❌ TypeError!
console.log(undefined.toString()); // ❌ TypeError!

// You cannot call methods on null/undefined
// const x = null;
// x.method();  // TypeError: Cannot read property 'method' of null

// Symbol and BigInt - Special primitives
const sym = Symbol("id");
console.log(typeof sym);           // "symbol"
console.log(sym.toString());       // "Symbol(id)" ✅ (has methods!)
console.log(sym.description);      // "id"

const big = 123n;
console.log(typeof big);           // "bigint"
console.log(big.toString());       // "123" ✅ (has methods!)

// But you can't use new Symbol() or new BigInt()
// new Symbol();  // ❌ TypeError
// new BigInt(123); // ❌ TypeError
```

<details>
<summary><strong>🔍 Deep Dive: Autoboxing Performance</strong></summary>

### How Autoboxing Works in V8

**Behind the scenes:**
```javascript
// Your code:
"hello".toUpperCase()

// V8 optimization:
// 1. Fast path: Check if method is on String.prototype
// 2. No temporary object created! (inline cache)
// 3. Call method directly with string as 'this'
```

**V8 avoids creating wrapper objects:**
- Uses "inline caching" for common operations
- Stores method lookup results
- Calls methods without boxing (in most cases)

**Performance test:**
```javascript
// Test 1: Method calls on primitives (optimized)
console.time('primitive-methods');
for (let i = 0; i < 1000000; i++) {
  "hello".toUpperCase();
}
console.timeEnd('primitive-methods'); // ~10ms

// Test 2: Explicit wrapper objects (slower)
console.time('wrapper-objects');
for (let i = 0; i < 1000000; i++) {
  new String("hello").toUpperCase();
}
console.timeEnd('wrapper-objects'); // ~200ms (20x slower!)
```

**Memory impact:**
```javascript
// Primitives: no heap allocation
const str = "hello";  // Stack/small string optimization

// Wrapper objects: heap allocation
const obj = new String("hello");  // Heap object + GC overhead
```

**Rule:** Never use `new String()`, `new Number()`, `new Boolean()` – primitives are faster!

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Boolean Wrapper Bug</strong></summary>

### Production Bug: Feature Flag Always On

**Scenario:** Feature flag stored as Boolean wrapper causes unexpected behavior.

```javascript
// ❌ BUG: Developer used wrapper object
const featureFlags = {
  newUI: new Boolean(false),  // ⚠️ Object wrapper!
  darkMode: true
};

function isFeatureEnabled(flag) {
  if (featureFlags[flag]) {
    return true;
  }
  return false;
}

// Test it
console.log(isFeatureEnabled('newUI'));    // true ⚠️ (should be false!)
console.log(isFeatureEnabled('darkMode')); // true ✅

// Why? Objects are always truthy!
if (new Boolean(false)) {
  console.log("This runs!"); // ⚠️ Runs!
}

// Even though the VALUE inside is false:
console.log(new Boolean(false).valueOf()); // false
```

**Fix: Always use primitives**
```javascript
// ✅ CORRECT: Use primitive booleans
const featureFlags = {
  newUI: false,        // ✅ Primitive
  darkMode: true       // ✅ Primitive
};

function isFeatureEnabled(flag) {
  return !!featureFlags[flag]; // Explicit boolean coercion
}

console.log(isFeatureEnabled('newUI'));    // false ✅
console.log(isFeatureEnabled('darkMode')); // true ✅
```

**Real Example: LocalStorage Trap**
```javascript
// ❌ COMMON BUG: localStorage stores strings
localStorage.setItem('darkMode', true);
localStorage.setItem('newUI', false);

// Later...
if (localStorage.getItem('darkMode')) {
  console.log('Dark mode ON'); // ✅ Correct
}

if (localStorage.getItem('newUI')) {
  console.log('New UI ON'); // ⚠️ Runs! (string "false" is truthy)
}

// ✅ FIX: Parse to boolean
const darkMode = localStorage.getItem('darkMode') === 'true';
const newUI = localStorage.getItem('newUI') === 'true';

if (newUI) {
  console.log('New UI ON'); // Doesn't run ✅
}
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Primitives vs Wrapper Objects</strong></summary>

### Comparison Matrix

| Aspect | Primitive | Wrapper Object |
|--------|-----------|----------------|
| **Type** | "string"/"number"/"boolean" | "object" |
| **Speed** | ⚡️ Fast | ⚡️ Slower (allocation) |
| **Memory** | ✅ Efficient | ❌ More overhead |
| **Truthiness** | Follows rules | ⚠️ Always truthy |
| **Equality** | Value-based | Reference-based |
| **Methods** | ✅ Yes (autoboxed) | ✅ Yes |
| **Properties** | ❌ Can't add | ✅ Can add |
| **Recommended** | ✅ Always use | ❌ Never use `new` |

### When (if ever) to use Wrapper Objects

**Never use with `new`:**
```javascript
// ❌ DON'T
const str = new String("hello");
const num = new Number(42);
const bool = new Boolean(true);
```

**DO use for type conversion (without `new`):**
```javascript
// ✅ DO
const str = String(123);      // "123" (primitive)
const num = Number("456");    // 456 (primitive)
const bool = Boolean(1);      // true (primitive)
```

**Edge case - Adding properties to strings:**
```javascript
// If you REALLY need properties on strings (rare)
const strWithMeta = Object.assign(new String("hello"), {
  author: "Alice",
  timestamp: Date.now()
});

console.log(strWithMeta.author); // "Alice"
console.log(strWithMeta.toUpperCase()); // "HELLO"

// But this is better:
const betterApproach = {
  value: "hello",
  author: "Alice",
  timestamp: Date.now()
};
```

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Primitive wrappers are like **JavaScript's invisible helper assistants**.

**The Setup:**
```javascript
const name = "Alice";  // This is just text (primitive)

// But you can do this:
name.toUpperCase();  // "ALICE"
```

**Wait, how can text have methods?**

JavaScript has three helper objects: `String`, `Number`, and `Boolean`. When you call a method on a primitive, JavaScript:

1. **Wraps** it temporarily: `new String("Alice")`
2. **Calls** the method: `.toUpperCase()`
3. **Throws away** the wrapper

It happens so fast you don't see it! This is called **"autoboxing"**.

**Visual:**
```javascript
// You write:
"hello".toUpperCase()

// JavaScript does:
Step 1: temp = new String("hello")
Step 2: result = temp.toUpperCase()
Step 3: delete temp
Step 4: return result
```

**Why you should NEVER use `new`:**
```javascript
// ❌ BAD - Creates an object
const wrong = new Boolean(false);

if (wrong) {
  console.log("This runs!"); // ⚠️ Objects are always truthy!
}

// ✅ GOOD - Primitive
const right = false;

if (right) {
  console.log("Doesn't run"); // ✅ Correct behavior
}
```

**Key rule:** Let JavaScript do the wrapping automatically. Never use `new String()`, `new Number()`, or `new Boolean()`.

**Type conversion without `new` is okay:**
```javascript
String(123)    // "123" ✅ (primitive string)
Number("456")  // 456 ✅ (primitive number)
Boolean(0)     // false ✅ (primitive boolean)
```

**Think of it like:** Primitives are the actual values, wrappers are temporary gift boxes that JavaScript puts them in when needed, then immediately unwraps."

</details>

### Common Mistakes

❌ **Mistake 1:** Using `new` with wrapper constructors
```javascript
const num = new Number(0);
if (!num) {  // ❌ Never runs (object is truthy!)
  console.log("Zero");
}
```

✅ **Correct:** Use primitives
```javascript
const num = 0;
if (!num) {  // ✅ Runs correctly
  console.log("Zero");
}
```

❌ **Mistake 2:** Comparing wrapper objects
```javascript
new String("hello") === new String("hello")  // false ❌ (different objects)
```

✅ **Correct:** Use primitives or .valueOf()
```javascript
"hello" === "hello"  // true ✅
new String("hello").valueOf() === "hello"  // true ✅
```

❌ **Mistake 3:** Expecting properties to stick to primitives
```javascript
const str = "hello";
str.custom = "value";
console.log(str.custom);  // undefined ❌ (property disappeared!)
```

### Follow-up Questions

1. "What is autoboxing in JavaScript?"
2. "Why are wrapper objects always truthy?"
3. "Can you add properties to primitive values?"
4. "What's the difference between String('hello') and new String('hello')?"
5. "Do Symbol and BigInt have wrapper objects?"
6. "How does V8 optimize method calls on primitives?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Autoboxing in V8:**
When you call `"hello".toUpperCase()`:
1. V8 creates temporary `String` wrapper object (stack allocation, ~20ns)
2. Calls method on wrapper
3. Immediately discards wrapper after method returns
4. Result: No heap allocation for common cases (optimized via inline cache)

**Why Wrapper Objects Are Truthy:**
```javascript
Boolean(new Boolean(false));  // true ❌
```
Wrapper objects are **objects**, not primitives. All objects are truthy in JavaScript (even if they wrap false!).

**V8 Tagged Pointers:**
- Primitives: Stored directly in tagged pointers (last bit = 0)
- Objects (including wrappers): Stored as heap pointers (last bit = 1)
- V8 can distinguish primitive vs object in single bitwise operation (~0.1ns)

**Symbol/BigInt Wrappers:**
- `Symbol()` and `BigInt()` exist as functions but throw if used with `new`
- No wrapper objects to prevent confusion (they're always primitive)

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Comparison bug in payment processing - wrapper objects broke validation.

**Bug:**
```javascript
const userInput = new String("premium");  // ❌ Accidentally created wrapper
const expectedPlan = "premium";

if (userInput === expectedPlan) {  // false! Object !== string
  applyDiscount();
}
```

**Impact:**
- 5% of premium users didn't get discounts
- Revenue loss: ~$2,000/day
- Detection time: 3 days (60 user complaints)

**Root Cause:**
Legacy code used `new String(getValue())` instead of `String(getValue())`.

**Fix:**
```javascript
// Always use conversion functions WITHOUT new:
const userInput = String(getValue());  // ✅ Primitive string

// Or add validation:
const normalize = (val) => val?.valueOf?.() ?? val;
if (normalize(userInput) === expectedPlan) {
  applyDiscount();
}
```

**Prevention:**
- ESLint rule: `no-new-wrappers`
- TypeScript: Banned `String`/`Number`/`Boolean` as types (use lowercase)
- Incidents after fix: 0

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Approach | Primitive | Wrapper Object | Winner |
|----------|-----------|----------------|--------|
| **Type** | `typeof "hi"` → "string" | `typeof new String("hi")` → "object" | ✅ Primitive |
| **Equality** | `"hi" === "hi"` → true | `new String("hi") === new String("hi")` → false | ✅ Primitive |
| **Performance** | Stack allocation (~0.1ns) | Heap allocation (~50ns) | ✅ Primitive (500x faster) |
| **Memory** | 8 bytes (tagged pointer) | 40+ bytes (object header + value) | ✅ Primitive (5x smaller) |
| **Truthiness** | `Boolean("")` → false | `Boolean(new String(""))` → true | ✅ Primitive (predictable) |
| **Method Access** | Autoboxing (temporary wrapper) | Direct property access | Tie (both work) |

**When to use wrapper objects:** NEVER. There's no valid use case.

**When to use conversion functions:** Always (`String(x)`, `Number(x)`, not `new String(x)`).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Wrapper Objects Like Gift Wrapping:**

Imagine primitive strings are naked gifts (just the toy). When you call a method like `.toUpperCase()`, JavaScript temporarily wraps the gift in a box (wrapper object), uses the method, then immediately throws away the box.

**But if you manually create a wrapper with `new`:**
```javascript
const toy = "car";           // Naked toy (primitive)
const wrapped = new String("car");  // Permanently wrapped toy (object)
```

Now you have a problem: The toy is stuck in the box forever! When you compare:
```javascript
toy === "car";      // true (compare toys directly)
wrapped === "car";  // false (comparing box to toy!)
```

**Real Example:**
```javascript
// JavaScript doing autoboxing (smart):
"hello".toUpperCase();
// 1. Wraps "hello" in temporary box
// 2. Calls toUpperCase() on box
// 3. Throws away box
// 4. Returns "HELLO"

// You manually wrapping (bad):
const str = new String("hello");  // ❌
// Now it's ALWAYS in a box, can't compare with regular strings!
```

**Rule:** Never use `new` with String/Number/Boolean. Let JavaScript handle wrapping automatically.

</details>

### Resources

- [MDN: String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [MDN: Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

---

## Question 3: What are type conversion methods in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Amazon, Microsoft, Meta

### Question

Explain the different type conversion methods in JavaScript (`String()`, `Number()`, `Boolean()`, `parseInt()`, `parseFloat()`). When would you use each? What are the edge cases and gotchas?

### Answer

JavaScript provides explicit type conversion functions to convert values between types. Understanding these is critical for handling user input, API responses, and preventing coercion bugs.

**Main Conversion Functions:**
1. **String()** - Convert any value to string
2. **Number()** - Convert to number (strict)
3. **Boolean()** - Convert to boolean
4. **parseInt()** - Parse integer from string
5. **parseFloat()** - Parse floating-point from string

### Code Example

```javascript
// ============================================
// 1. STRING() - CONVERTING TO STRING
// ============================================

// Primitives
console.log(String(123));           // "123"
console.log(String(123.45));        // "123.45"
console.log(String(true));          // "true"
console.log(String(false));         // "false"
console.log(String(null));          // "null"
console.log(String(undefined));     // "undefined"
console.log(String(Symbol('id')));  // "Symbol(id)"
console.log(String(123n));          // "123"

// Objects and arrays
console.log(String([1, 2, 3]));     // "1,2,3"
console.log(String([1]));           // "1"
console.log(String([]));            // ""
console.log(String({ a: 1 }));      // "[object Object]"
console.log(String(new Date()));    // "Mon Jan 01 2024..." (date string)

// Special values
console.log(String(NaN));           // "NaN"
console.log(String(Infinity));      // "Infinity"
console.log(String(-Infinity));     // "-Infinity"

// Functions
console.log(String(function(){}));  // "function(){}"
console.log(String(() => {}));      // "() => {}"

// String() vs .toString()
const value = null;
// console.log(value.toString());   // ❌ TypeError!
console.log(String(value));         // "null" ✅ (safe)

// ============================================
// 2. NUMBER() - CONVERTING TO NUMBER (STRICT)
// ============================================

// Numeric strings
console.log(Number("123"));         // 123
console.log(Number("123.45"));      // 123.45
console.log(Number("0.5"));         // 0.5
console.log(Number(".5"));          // 0.5
console.log(Number("123e5"));       // 12300000 (scientific notation)
console.log(Number("0xFF"));        // 255 (hex)
console.log(Number("0b1010"));      // 10 (binary)
console.log(Number("0o17"));        // 15 (octal)

// Whitespace handling
console.log(Number("   123   "));   // 123 (trims whitespace)
console.log(Number(""));            // 0 ⚠️ (empty string!)
console.log(Number(" "));           // 0 ⚠️ (whitespace!)

// Invalid numbers
console.log(Number("123abc"));      // NaN (stops at non-digit)
console.log(Number("abc"));         // NaN
console.log(Number("12.34.56"));    // NaN (multiple decimals)

// Boolean to number
console.log(Number(true));          // 1
console.log(Number(false));         // 0

// null and undefined
console.log(Number(null));          // 0 ⚠️
console.log(Number(undefined));     // NaN

// Arrays (weird behavior!)
console.log(Number([]));            // 0 ([].toString() = "")
console.log(Number([5]));           // 5 ([5].toString() = "5")
console.log(Number([1, 2]));        // NaN ([1,2].toString() = "1,2")

// Objects
console.log(Number({}));            // NaN
console.log(Number({ valueOf: () => 42 })); // 42

// Special cases
console.log(Number("Infinity"));    // Infinity
console.log(Number("-Infinity"));   // -Infinity
console.log(Number("NaN"));         // NaN

// BigInt
console.log(Number(123n));          // 123 (loses precision if too large!)

// ============================================
// 3. BOOLEAN() - CONVERTING TO BOOLEAN
// ============================================

// Falsy values (8 total)
console.log(Boolean(false));        // false
console.log(Boolean(0));            // false
console.log(Boolean(-0));           // false
console.log(Boolean(0n));           // false
console.log(Boolean(""));           // false
console.log(Boolean(null));         // false
console.log(Boolean(undefined));    // false
console.log(Boolean(NaN));          // false

// Everything else is truthy!
console.log(Boolean(true));         // true
console.log(Boolean(1));            // true
console.log(Boolean(-1));           // true
console.log(Boolean("0"));          // true ⚠️ (non-empty string!)
console.log(Boolean("false"));      // true ⚠️
console.log(Boolean([]));           // true ⚠️ (empty array!)
console.log(Boolean({}));           // true ⚠️ (empty object!)
console.log(Boolean(function(){})); // true
console.log(Boolean(Infinity));     // true
console.log(Boolean(new Boolean(false))); // true ⚠️ (wrapper!)

// Common idiom: Double negation
console.log(!!0);                   // false
console.log(!!"");                  // false
console.log(!!"hello");             // true
console.log(!![]);                  // true

// ============================================
// 4. PARSEINT() - PARSING INTEGERS
// ============================================

// Basic usage
console.log(parseInt("123"));       // 123
console.log(parseInt("123.45"));    // 123 (stops at decimal!)
console.log(parseInt("123abc"));    // 123 (stops at non-digit)
console.log(parseInt("   123"));    // 123 (ignores leading whitespace)

// Stops at first non-numeric character
console.log(parseInt("42px"));      // 42
console.log(parseInt("$100"));      // NaN (starts with non-digit!)
console.log(parseInt("abc123"));    // NaN (starts with letter)

// With radix (base) parameter - ALWAYS SPECIFY!
console.log(parseInt("10", 10));    // 10 (decimal)
console.log(parseInt("10", 2));     // 2 (binary: 1*2 + 0)
console.log(parseInt("10", 8));     // 8 (octal: 1*8 + 0)
console.log(parseInt("10", 16));    // 16 (hex: 1*16 + 0)
console.log(parseInt("FF", 16));    // 255 (hex)
console.log(parseInt("0xFF"));      // 255 (auto-detects hex)

// Why always specify radix
console.log(parseInt("08"));        // 8 in modern JS
// In old JS: 0 (interpreted as octal!) ⚠️

console.log(parseInt("0x10"));      // 16 (auto hex)
console.log(parseInt("0b10"));      // 0 (stops at 'b')

// Edge cases
console.log(parseInt(""));          // NaN (empty)
console.log(parseInt(" "));         // NaN (whitespace only)
console.log(parseInt("Infinity"));  // NaN
console.log(parseInt(null));        // NaN (converts to "null")
console.log(parseInt(undefined));   // NaN (converts to "undefined")
console.log(parseInt(true));        // NaN (converts to "true")
console.log(parseInt([]));          // NaN ([].toString() = "")
console.log(parseInt([5]));         // 5 ([5].toString() = "5")

// ============================================
// 5. PARSEFLOAT() - PARSING FLOATING-POINT
// ============================================

// Basic usage
console.log(parseFloat("123"));     // 123
console.log(parseFloat("123.45"));  // 123.45
console.log(parseFloat("123.45.67"));// 123.45 (stops at second decimal!)
console.log(parseFloat(".5"));      // 0.5
console.log(parseFloat("0.5"));     // 0.5

// Stops at first non-numeric
console.log(parseFloat("3.14px"));  // 3.14
console.log(parseFloat("$100.50")); // NaN (starts with $)

// Scientific notation
console.log(parseFloat("1.23e5"));  // 123000
console.log(parseFloat("1e-5"));    // 0.00001

// No radix parameter (always base 10)
console.log(parseFloat("0xFF"));    // 0 (stops at x)
console.log(parseFloat("0x10"));    // 0

// Edge cases
console.log(parseFloat(""));        // NaN
console.log(parseFloat("Infinity"));// Infinity ✅
console.log(parseFloat("-Infinity"));// -Infinity ✅
console.log(parseFloat("NaN"));     // NaN
console.log(parseFloat(null));      // NaN
console.log(parseFloat(undefined)); // NaN

// ============================================
// 6. COMPARISON: NUMBER() VS PARSEINT/FLOAT
// ============================================

const inputs = ["123", "123.45", "123abc", "", " ", null];

inputs.forEach(input => {
  console.log(`Input: "${input}"`);
  console.log(`  Number():      ${Number(input)}`);
  console.log(`  parseInt():    ${parseInt(input, 10)}`);
  console.log(`  parseFloat():  ${parseFloat(input)}`);
});

/*
Input: "123"
  Number():      123
  parseInt():    123
  parseFloat():  123

Input: "123.45"
  Number():      123.45
  parseInt():    123
  parseFloat():  123.45

Input: "123abc"
  Number():      NaN (strict!)
  parseInt():    123 (stops at 'a')
  parseFloat():  123 (stops at 'a')

Input: ""
  Number():      0 ⚠️
  parseInt():    NaN
  parseFloat():  NaN

Input: " "
  Number():      0 ⚠️
  parseInt():    NaN
  parseFloat():  NaN

Input: "null"
  Number():      0 ⚠️
  parseInt():    NaN
  parseFloat():  NaN
*/

// ============================================
// 7. UNARY PLUS (+) - SHORTHAND FOR NUMBER()
// ============================================

console.log(+"123");                // 123
console.log(+"123.45");             // 123.45
console.log(+"123abc");             // NaN
console.log(+"");                   // 0
console.log(+true);                 // 1
console.log(+false);                // 0
console.log(+null);                 // 0
console.log(+undefined);            // NaN

// Same as Number()
console.log(+"42" === Number("42")); // true

// Common usage
const age = "25";
const nextAge = +age + 1;           // 26

// ============================================
// 8. TEMPLATE LITERALS - STRING CONVERSION
// ============================================

// Automatically converts to string
console.log(`Value: ${123}`);       // "Value: 123"
console.log(`Value: ${true}`);      // "Value: true"
console.log(`Value: ${null}`);      // "Value: null"
console.log(`Value: ${undefined}`); // "Value: undefined"
console.log(`Value: ${[1, 2]}`);    // "Value: 1,2"
console.log(`Value: ${{ a: 1 }}`);  // "Value: [object Object]"

// ============================================
// 9. TYPE CONVERSION BEST PRACTICES
// ============================================

// User input validation
function validateAge(input) {
  // Trim whitespace first
  const trimmed = input.trim();

  // Check if empty
  if (trimmed === "") {
    return { valid: false, error: "Age is required" };
  }

  // Convert to number
  const age = Number(trimmed);

  // Check if valid number
  if (isNaN(age)) {
    return { valid: false, error: "Age must be a number" };
  }

  // Check if integer
  if (!Number.isInteger(age)) {
    return { valid: false, error: "Age must be a whole number" };
  }

  // Check range
  if (age < 0 || age > 150) {
    return { valid: false, error: "Age must be between 0 and 150" };
  }

  return { valid: true, value: age };
}

console.log(validateAge("25"));     // { valid: true, value: 25 }
console.log(validateAge(""));       // { valid: false, error: "Age is required" }
console.log(validateAge("abc"));    // { valid: false, error: "Age must be a number" }
console.log(validateAge("25.5"));   // { valid: false, error: "Age must be a whole number" }
console.log(validateAge("200"));    // { valid: false, error: "Age must be between 0 and 150" }

// ============================================
// 10. COMMON GOTCHAS AND PITFALLS
// ============================================

// Gotcha 1: Empty string becomes 0
console.log(Number(""));            // 0 ⚠️
console.log(Boolean(""));           // false ✅

// Gotcha 2: Arrays have weird conversion
console.log(Number([]));            // 0
console.log(Number([5]));           // 5
console.log(Number([1, 2]));        // NaN

// Gotcha 3: null becomes 0
console.log(Number(null));          // 0 ⚠️
console.log(parseInt(null));        // NaN ✅

// Gotcha 4: parseInt without radix (old bug)
// In old browsers:
// parseInt("08") could be 0 (octal)
// Always use: parseInt("08", 10) ✅

// Gotcha 5: Boolean string is truthy!
console.log(Boolean("false"));      // true ⚠️
// Must compare:
console.log("false" === "true");    // false ✅

// Gotcha 6: Leading zeros in hex/octal
console.log(parseInt("08", 10));    // 8 ✅
console.log(parseInt("010", 10));   // 10 ✅
console.log(parseInt("010", 8));    // 8 (octal)
console.log(parseInt("0xFF", 16));  // 255 (hex)
```

<details>
<summary><strong>🔍 Deep Dive: Type Conversion Algorithm Internals</strong></summary>

### How Number() Works Internally

**Algorithm:**
1. If primitive → convert directly
2. If object → call ToPrimitive with "number" hint
3. Process result:
   - `undefined` → NaN
   - `null` → 0
   - `true` → 1, `false` → 0
   - `string` → parse as number (empty string = 0)

**String to Number Parsing:**
```javascript
// Step-by-step for Number("  123.45  ")
1. Trim whitespace → "123.45"
2. Check for sign → positive
3. Check for special (Infinity, NaN) → no
4. Parse digits → 123.45
5. Return number → 123.45

// For Number("")
1. Trim whitespace → ""
2. Empty string → 0 (special case!)
```

**parseInt() vs Number():**
```javascript
// parseInt: Lenient (stops at first non-digit)
"123abc"
→ Parse "123" → 123 ✅
→ Stop at "a" → ignore rest

// Number: Strict (entire string must be valid)
"123abc"
→ Not a valid number → NaN
```

### Performance Comparison

```javascript
const iterations = 1000000;

console.time('Number()');
for (let i = 0; i < iterations; i++) {
  Number("123");
}
console.timeEnd('Number()'); // ~15ms

console.time('parseInt()');
for (let i = 0; i < iterations; i++) {
  parseInt("123", 10);
}
console.timeEnd('parseInt()'); // ~20ms

console.time('Unary +');
for (let i = 0; i < iterations; i++) {
  +"123";
}
console.timeEnd('Unary +'); // ~15ms (same as Number)

console.time('parseFloat()');
for (let i = 0; i < iterations; i++) {
  parseFloat("123.45");
}
console.timeEnd('parseFloat()'); // ~25ms
```

**Fastest:** `Number()` or unary `+`
**Slower:** `parseInt()`, `parseFloat()` (string parsing overhead)

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Form Input Parsing Bug</strong></summary>

### Production Bug: Credit Card Validation Fails

**Scenario:** E-commerce site incorrectly validates credit card numbers.

```javascript
// ❌ BUG: Using Number() for card number
function validateCardNumber(input) {
  const cardNumber = Number(input);

  if (isNaN(cardNumber)) {
    return "Invalid card number";
  }

  // Check if 16 digits
  if (cardNumber.toString().length !== 16) {
    return "Card number must be 16 digits";
  }

  return "Valid";
}

// Test it
console.log(validateCardNumber("4532015112830366")); // "Valid" ✅
console.log(validateCardNumber("4532 0151 1283 0366")); // ❌ "Invalid card number" (spaces!)
console.log(validateCardNumber("0000000000000000")); // ❌ "Card number must be 16 digits" (leading zeros!)

// Why?
Number("4532 0151 1283 0366"); // NaN (spaces not allowed)
Number("0000000000000000");     // 0 (leading zeros removed!)
```

**Fix: Treat as string, remove formatting**
```javascript
// ✅ CORRECT: Validate as string
function validateCardNumber(input) {
  // Remove spaces and dashes
  const cleaned = input.replace(/[\s-]/g, "");

  // Check if all digits
  if (!/^\d+$/.test(cleaned)) {
    return "Invalid characters in card number";
  }

  // Check length
  if (cleaned.length !== 16) {
    return "Card number must be 16 digits";
  }

  return "Valid";
}

console.log(validateCardNumber("4532015112830366"));       // "Valid" ✅
console.log(validateCardNumber("4532 0151 1283 0366"));    // "Valid" ✅
console.log(validateCardNumber("0000000000000000"));       // "Valid" ✅
console.log(validateCardNumber("4532-0151-1283-0366"));    // "Valid" ✅
```

**Another Example: Price Parsing**
```javascript
// ❌ BUG: parseInt for currency
function parsePrice(priceString) {
  // Input: "$19.99"
  return parseInt(priceString, 10); // 19 ⚠️ (stops at decimal!)
}

console.log(parsePrice("$19.99")); // NaN (starts with $)

// ✅ FIX: Remove currency symbols first
function parsePrice(priceString) {
  // Remove $, commas, etc.
  const cleaned = priceString.replace(/[$,]/g, "");
  return parseFloat(cleaned);
}

console.log(parsePrice("$19.99"));     // 19.99 ✅
console.log(parsePrice("$1,234.56"));  // 1234.56 ✅
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Which Conversion Method to Use</strong></summary>

### Decision Matrix

| Use Case | Best Method | Why |
|----------|-------------|-----|
| **String needed** | `String()` | Safe for null/undefined |
| **Template string** | Template literals | Concise, readable |
| **Number (strict)** | `Number()` or `+` | Validates entire string |
| **Parse integer** | `parseInt(x, 10)` | Stops at non-digits |
| **Parse decimal** | `parseFloat()` | Handles decimals |
| **Boolean check** | `Boolean()` or `!!` | Explicit intent |
| **Conditional** | Just use `if (value)` | Implicit coercion |
| **User input** | `Number()` + validation | Catch all errors |

### When to Use Each

**String():**
```javascript
// When you need null/undefined to become strings
String(null);      // "null" ✅
String(undefined); // "undefined" ✅

// Display to user
console.log(`User ID: ${String(userId)}`);
```

**Number():**
```javascript
// When entire string must be valid
Number("123");    // 123 ✅
Number("123abc"); // NaN (strict!)

// User input that should be purely numeric
const age = Number(userInput);
if (isNaN(age)) {
  showError("Please enter a valid number");
}
```

**parseInt():**
```javascript
// When you want to extract integer from mixed string
parseInt("123px", 10);    // 123 ✅
parseInt("Chapter 5", 10); // NaN (doesn't start with digit)

// CSS values
parseInt("16px", 10);      // 16
```

**parseFloat():**
```javascript
// When you need decimal values
parseFloat("3.14");        // 3.14 ✅
parseFloat("3.14159px");   // 3.14159

// Extracted measurements
parseFloat("19.99");       // 19.99
```

**Boolean():**
```javascript
// When you need explicit boolean
const hasData = Boolean(data);

// Feature flags
const isEnabled = Boolean(config.feature);
```

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Type conversion functions are like **different kinds of translators** for JavaScript values.

**String() - The Universal Translator**
```javascript
String(123);        // "123" - Turn anything into text
String(null);       // "null" - Even empty values!
String(undefined);  // "undefined"
```

Think of it like pressing 'Convert to Text' in a document - everything becomes readable text.

**Number() - The Strict Teacher**
```javascript
Number("123");      // 123 ✅ - Perfect score!
Number("123abc");   // NaN ❌ - Fail! Not a valid number!
Number("");         // 0 ⚠️ - Empty gets special treatment
```

Number() is like a strict math teacher: \"The ENTIRE answer must be a number, or you fail!\"

**parseInt() - The Forgiving Teacher**
```javascript
parseInt("123abc", 10);  // 123 ✅ - Partial credit!
parseInt("42px", 10);    // 42 ✅ - I'll take what I can get
parseInt("abc123", 10);  // NaN ❌ - Must START with a number
```

parseInt() is like: \"I'll give you credit for the number part at the start, then I'll stop reading.\"

**parseFloat() - parseInt's Decimal-Friendly Sibling**
```javascript
parseFloat("3.14");      // 3.14 ✅ - Handles decimals!
parseFloat("3.14159px"); // 3.14159 ✅
parseInt("3.14", 10);    // 3 ⚠️ - Throws away decimals!
```

**Boolean() - The True/False Decider**
```javascript
Boolean(0);          // false - These 8 are FALSE
Boolean("");         // false
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
Boolean(false);      // false
Boolean(-0);         // false
Boolean(0n);         // false

Boolean("anything else"); // true - Everything else is TRUE!
Boolean([]);             // true (even empty arrays!)
Boolean({});             // true (even empty objects!)
```

**Key Rules:**
1. Use `String()` when you need text (safe for everything)
2. Use `Number()` for strict validation (user input)
3. Use `parseInt()` when extracting numbers from strings ("123px" → 123)
4. Use `parseFloat()` when you need decimals
5. Always specify radix for parseInt: `parseInt(value, 10)`

**Common mistake:**
```javascript
// ❌ BAD
parseInt("08");  // Could be 0 in old browsers! (octal)

// ✅ GOOD
parseInt("08", 10);  // 8 (always specify base 10!)
```
"

</details>

### Common Mistakes

❌ **Mistake 1:** Using parseInt() for decimal numbers
```javascript
const price = parseInt("19.99", 10);  // 19 ❌ (lost cents!)
```

✅ **Correct:** Use parseFloat() or Number()
```javascript
const price = parseFloat("19.99");    // 19.99 ✅
const price2 = Number("19.99");       // 19.99 ✅
```

❌ **Mistake 2:** Forgetting radix in parseInt()
```javascript
parseInt("08");  // Could be 0 in old browsers!
```

✅ **Correct:** Always specify radix
```javascript
parseInt("08", 10);  // 8 ✅
```

❌ **Mistake 3:** Assuming empty string is NaN
```javascript
console.log(Number(""));  // 0 ❌ (not NaN!)
```

✅ **Correct:** Check for empty string first
```javascript
if (input === "") {
  // Handle empty
} else {
  const num = Number(input);
}
```

❌ **Mistake 4:** Using Boolean() on string "false"
```javascript
console.log(Boolean("false"));  // true ⚠️ (non-empty string!)
```

✅ **Correct:** Compare explicitly
```javascript
console.log(value === "true");  // Check string value
console.log(value === true);    // Check boolean value
```

### Follow-up Questions

1. "What's the difference between Number() and parseInt()?"
2. "Why does Number('') return 0 instead of NaN?"
3. "When should you use parseFloat() vs Number()?"
4. "Why must you always specify radix in parseInt()?"
5. "How does parseInt handle leading zeros?"
6. "What's the difference between String(value) and value.toString()?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Number() vs parseInt() Algorithm:**

**Number():**
1. Calls ToPrimitive (if object)
2. Trims whitespace
3. Parses entire string as number
4. Returns NaN if ANY character is invalid

**parseInt():**
1. Converts to string first
2. Trims whitespace
3. Parses from left until invalid character
4. Returns number parsed so far (or NaN if first char invalid)
5. Uses radix (base 2-36)

**V8 Optimization:**
- `Number()`: Fast path for simple strings (~5ns)
- `parseInt()`: Slower (~50ns) due to radix logic + partial parsing
- Both use TurboFan JIT compilation after warmup

**Why Number('') → 0:**
ECMAScript spec: Empty string coerces to 0 (historical decision for backward compatibility). Many consider this a design flaw.

**String() vs toString():**
- `String(null)` → "null" ✅
- `null.toString()` → TypeError ❌
- `String()` calls `ToString` abstract operation (handles null/undefined)
- `.toString()` is a method (throws on null/undefined)

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Port number parsing bug caused 404 errors on custom ports.

**Bug:**
```javascript
const port = "8080abc";  // User input from config
const portNum = parseInt(port);  // 8080 ✅ (silently ignores "abc")

// Server starts on port 8080, but...
const validPort = Number(port);  // NaN ❌
if (validPort > 1024) {  // false! NaN > 1024 is false
  startServer(validPort);  // Never runs
}
```

**Impact:**
- 30% of users with invalid configs got silent failures
- Port defaulted to 3000 (wrong port)
- 404 errors: 500+/day
- Detection time: 2 weeks

**Fix:**
```javascript
const parsePort = (input) => {
  const num = Number(input);
  if (isNaN(num) || num <= 0 || num > 65535 || !Number.isInteger(num)) {
    throw new Error(`Invalid port: ${input}`);
  }
  return num;
};

// Or use parseInt with validation:
const num = parseInt(input, 10);
if (String(num) !== input.trim()) {  // Detect trailing chars
  throw new Error(`Port has invalid characters: ${input}`);
}
```

**Metrics After Fix:**
- Validation errors: Clear error messages (no silent failures)
- 404 errors: 0 (invalid ports rejected early)
- Config validation pass rate: 95% → 100%

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Method | Number() | parseInt() | parseFloat() | Winner |
|--------|----------|-----------|--------------|--------|
| **Partial Parsing** | ❌ Returns NaN | ✅ Parses until invalid | ✅ Parses until invalid | parseInt/parseFloat |
| **Strictness** | ✅ Rejects "123abc" | ❌ Accepts "123abc" → 123 | ❌ Accepts "123.45abc" → 123.45 | ✅ Number() |
| **Empty String** | 0 (confusing) | NaN (expected) | NaN (expected) | parseInt/parseFloat |
| **Radix Support** | ❌ No radix | ✅ Base 2-36 | ❌ Base 10 only | parseInt |
| **Performance** | ~5ns (fastest) | ~50ns | ~45ns | ✅ Number() |
| **Decimals** | ✅ Parses | ❌ Ignores after dot | ✅ Parses | Number/parseFloat |

**When to use:**
- `Number()`: Strict conversion (API responses, calculations)
- `parseInt()`: User input with known format (CSS pixels, radix conversion)
- `parseFloat()`: Scientific notation, decimals from strings

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Number() vs parseInt() Like Reading a Book:**

**Number() is strict teacher:**
"Read the ENTIRE book from start to finish. If you encounter even ONE word you don't understand, fail the class."

```javascript
Number("123");     // ✅ "Entire book is numbers, A+"
Number("123abc");  // ❌ "Found letters! Failed! NaN"
Number("");        // 0 (weird exception)
```

**parseInt() is lenient teacher:**
"Read as far as you can. Stop when you hit something you don't understand. I'll grade what you read."

```javascript
parseInt("123");     // 123 ✅ "Read whole thing"
parseInt("123abc");  // 123 ✅ "Read until 'a', good enough"
parseInt("abc123");  // NaN ❌ "Couldn't even start"
```

**Real Example:**
```javascript
// User enters CSS value: "100px"
Number("100px");    // NaN ❌ (strict: "px is invalid!")
parseInt("100px");  // 100 ✅ (lenient: "got the number, ignoring px")

// But be careful:
parseInt("08");     // 8 (correct)
parseInt("08", 10); // 8 (ALWAYS specify radix!)
parseInt("08", 8);  // 8 in base 8 = 8 in base 10
```

**Rule:** Use `Number()` for data you control (API responses). Use `parseInt(x, 10)` for user input where trailing chars are expected.

</details>

### Resources

- [MDN: Type Conversion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion)
- [MDN: parseInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
- [MDN: parseFloat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat)

---

## Question 4: What are valueOf() and toString() methods in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Microsoft

### Question

Explain the `valueOf()` and `toString()` methods. How do they relate to type coercion? When does JavaScript call each method? Can you override them to customize conversion behavior?

### Answer

**valueOf()** and **toString()** are methods that objects use to convert themselves to primitive values during type coercion.

**Key Concepts:**
- Both methods exist on `Object.prototype`
- Called automatically during type coercion
- Can be overridden to customize conversion
- Part of the ToPrimitive algorithm

**When they're called:**
- **toString()** - String context (String(), template literals, +)
- **valueOf()** - Numeric context (Math operations, comparisons)
- **Symbol.toPrimitive** - Can override both (highest priority)

### Code Example

```javascript
// ============================================
// 1. DEFAULT TOSTRING() BEHAVIOR
// ============================================

// Primitives
console.log((42).toString());         // "42"
console.log(true.toString());         // "true"
console.log("hello".toString());      // "hello"

// Objects (default: "[object Type]")
console.log({}.toString());           // "[object Object]"
console.log([].toString());           // ""
console.log([1, 2, 3].toString());    // "1,2,3"
console.log(new Date().toString());   // "Mon Jan 01 2024..."

// Functions
function myFunc() {}
console.log(myFunc.toString());       // "function myFunc() {}"

// null and undefined have NO toString()
// console.log(null.toString());      // ❌ TypeError!
// console.log(undefined.toString()); // ❌ TypeError!

// Object.prototype.toString (most reliable type check)
console.log(Object.prototype.toString.call([]));        // "[object Array]"
console.log(Object.prototype.toString.call({}));        // "[object Object]"
console.log(Object.prototype.toString.call(null));      // "[object Null]"
console.log(Object.prototype.toString.call(undefined)); // "[object Undefined]"
console.log(Object.prototype.toString.call(42));        // "[object Number]"
console.log(Object.prototype.toString.call("hi"));      // "[object String]"

// ============================================
// 2. DEFAULT VALUEOF() BEHAVIOR
// ============================================

// Primitives return themselves
console.log((42).valueOf());          // 42
console.log(true.valueOf());          // true
console.log("hello".valueOf());       // "hello"

// Objects return the object itself (usually not useful)
const obj = { a: 1 };
console.log(obj.valueOf());           // { a: 1 } (same object)
console.log(obj.valueOf() === obj);   // true

// Arrays
console.log([1, 2].valueOf());        // [1, 2] (same array)

// Date objects return timestamp!
const date = new Date("2024-01-01");
console.log(date.valueOf());          // 1704067200000 (milliseconds)
console.log(+date);                   // 1704067200000 (uses valueOf!)

// ============================================
// 3. WHEN JAVASCRIPT CALLS TOSTRING()
// ============================================

const obj = {
  toString() {
    console.log("toString called!");
    return "custom string";
  },
  valueOf() {
    console.log("valueOf called!");
    return 42;
  }
};

// String context → toString()
String(obj);           // Logs: "toString called!"
`${obj}`;              // Logs: "toString called!"
obj + "";              // Logs: "valueOf called!" (default hint uses valueOf first!)

// Alert (requires string)
// alert(obj);         // Logs: "toString called!"

// ============================================
// 4. WHEN JAVASCRIPT CALLS VALUEOF()
// ============================================

const obj2 = {
  toString() {
    console.log("toString called!");
    return "100";
  },
  valueOf() {
    console.log("valueOf called!");
    return 50;
  }
};

// Numeric context → valueOf()
console.log(obj2 * 2);      // Logs: "valueOf called!" → 100
console.log(obj2 + 10);     // Logs: "valueOf called!" → 60
console.log(obj2 - 5);      // Logs: "valueOf called!" → 45
console.log(+obj2);         // Logs: "valueOf called!" → 50

// Comparison → valueOf()
console.log(obj2 > 30);     // Logs: "valueOf called!" → true
console.log(obj2 < 100);    // Logs: "valueOf called!" → true

// ============================================
// 5. TOPRIMITIVE ALGORITHM ORDER
// ============================================

// When converting to primitive, JavaScript tries:
// 1. Symbol.toPrimitive (if exists)
// 2. For "string" hint: toString(), then valueOf()
// 3. For "number" hint: valueOf(), then toString()
// 4. For "default" hint: valueOf(), then toString()

const testObj = {
  toString() {
    console.log("→ toString()");
    return "string value";
  },
  valueOf() {
    console.log("→ valueOf()");
    return 100;
  }
};

console.log("\n--- String hint:");
String(testObj);           // → toString()

console.log("\n--- Number hint:");
Number(testObj);           // → valueOf()
console.log(+testObj);     // → valueOf()
console.log(testObj * 2);  // → valueOf()

console.log("\n--- Default hint:");
console.log(testObj + ""); // → valueOf() (default uses valueOf first!)
console.log(testObj == 100); // → valueOf()

// ============================================
// 6. CUSTOM TOSTRING() - EXAMPLES
// ============================================

// Example 1: User object
class User {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  toString() {
    return `User(${this.name})`;
  }

  valueOf() {
    return this.id;
  }
}

const user = new User("Alice", 123);

console.log(String(user));      // "User(Alice)"
console.log(`User: ${user}`);   // "User: User(Alice)"
console.log(+user);             // 123
console.log(user * 2);          // 246

// Example 2: Money class
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  toString() {
    return `${this.amount} ${this.currency}`;
  }

  valueOf() {
    return this.amount;
  }
}

const price = new Money(19.99, "USD");

console.log(String(price));     // "19.99 USD"
console.log(`Price: ${price}`); // "Price: 19.99 USD"
console.log(+price);            // 19.99
console.log(price + 5);         // 24.99

// Example 3: Coordinate
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  valueOf() {
    // Return distance from origin
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

const point = new Point(3, 4);

console.log(String(point));     // "(3, 4)"
console.log(+point);            // 5 (distance: √(3²+4²) = 5)

// ============================================
// 7. SYMBOL.TOPRIMITIVE - HIGHEST PRIORITY
// ============================================

const customObj = {
  toString() {
    return "toString result";
  },
  valueOf() {
    return 100;
  },
  [Symbol.toPrimitive](hint) {
    console.log(`Symbol.toPrimitive called with hint: ${hint}`);

    if (hint === "number") {
      return 42;
    }
    if (hint === "string") {
      return "custom string";
    }
    return true; // default
  }
};

// Symbol.toPrimitive takes priority!
console.log(String(customObj));    // Hint: string → "custom string"
console.log(Number(customObj));    // Hint: number → 42
console.log(+customObj);           // Hint: number → 42
console.log(customObj + "");       // Hint: default → "true"

// ============================================
// 8. PRACTICAL EXAMPLE: RANGE OBJECT
// ============================================

class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  toString() {
    return `${this.from}...${this.to}`;
  }

  valueOf() {
    // Return the size of the range
    return this.to - this.from;
  }

  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);

console.log(String(range));        // "1...5"
console.log(`Range: ${range}`);    // "Range: 1...5"
console.log(+range);               // 4 (size)
console.log([...range]);           // [1, 2, 3, 4, 5]

// ============================================
// 9. ARRAYS AND OBJECTS - SPECIAL BEHAVIOR
// ============================================

// Arrays: toString() joins elements
console.log([1, 2, 3].toString());      // "1,2,3"
console.log([].toString());             // ""
console.log([[1, 2], [3, 4]].toString()); // "1,2,3,4"

// Arrays: valueOf() returns array itself
console.log([1, 2, 3].valueOf());       // [1, 2, 3]

// In coercion, arrays use toString()
console.log([1, 2, 3] + "");            // "1,2,3"
console.log([] + "");                   // ""
console.log([5] + "");                  // "5"

// Objects: toString() returns "[object Object]"
console.log({}.toString());             // "[object Object]"
console.log({ a: 1 }.toString());       // "[object Object]"

// Objects: valueOf() returns object itself
console.log({}.valueOf());              // {}

// ============================================
// 10. COMMON PITFALLS
// ============================================

// Pitfall 1: Objects always use valueOf first for default hint
const weirdObj = {
  toString: () => "5",
  valueOf: () => 10
};

console.log(weirdObj + "");  // "10" (valueOf wins!)
console.log(String(weirdObj)); // "5" (explicit string context)

// Pitfall 2: Date is special
const date = new Date();
console.log(date + "");      // String representation (Date overrides!)
console.log(+date);          // Timestamp (valueOf)

// Pitfall 3: Returning non-primitive is ignored
const badObj = {
  valueOf() {
    return { notPrimitive: true }; // Object, not primitive!
  },
  toString() {
    return "fallback";
  }
};

console.log(+badObj);        // NaN (valueOf didn't return primitive, toString did, but "fallback" → NaN)
```

<details>
<summary><strong>🔍 Deep Dive: ToPrimitive Algorithm</strong></summary>

### Complete ToPrimitive Algorithm

**Step-by-step for `ToPrimitive(input, hint)`:**

```
1. If input is primitive → return input

2. If Symbol.toPrimitive exists:
   result = input[Symbol.toPrimitive](hint)
   if result is primitive → return result
   else → throw TypeError

3. If hint is "string":
   Try toString() → if primitive, return it
   Try valueOf() → if primitive, return it
   throw TypeError

4. If hint is "number" or "default":
   Try valueOf() → if primitive, return it
   Try toString() → if primitive, return it
   throw TypeError
```

**Hint determination:**
```javascript
// "string" hint:
String(obj)
`${obj}`
obj.toString()

// "number" hint:
Number(obj)
+obj
obj * 2
Math.max(obj, 10)

// "default" hint:
obj + ""      // Could be string or number!
obj == 5
obj + 5       // Could concat or add!
```

**Visual Example:**
```
obj + ""
↓
ToPrimitive(obj, "default")
↓
1. Check Symbol.toPrimitive? No
2. Hint is "default"
3. Try valueOf() → returns 42
4. Is 42 primitive? Yes!
5. Return 42
↓
Result: 42 + "" = "42"
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Date Comparison Bug</strong></summary>

### Production Bug: Inconsistent Date Handling

**Scenario:** Date comparison logic behaves unexpectedly.

```javascript
// ❌ BUG: Date coercion confusion
const date1 = new Date("2024-01-01");
const date2 = new Date("2024-01-02");

console.log(date1 + date2);  // String concatenation! ⚠️
// "Mon Jan 01 2024...Tue Jan 02 2024..."

console.log(date1 - date2);  // -86400000 ✅ (milliseconds difference)

// Why different behavior?
// + operator uses "default" hint → Date overrides to prefer string!
// - operator uses "number" hint → valueOf() returns timestamp
```

**Fix: Be explicit with date operations**
```javascript
// ✅ CORRECT: Use explicit methods
const date1 = new Date("2024-01-01");
const date2 = new Date("2024-01-02");

// For comparison
console.log(date1.getTime() - date2.getTime()); // -86400000

// For display
console.log(date1.toString());                  // Full string
console.log(date1.toISOString());              // "2024-01-01T00:00:00.000Z"
console.log(date1.toLocaleDateString());       // "1/1/2024"

// For timestamps
console.log(+date1);                           // 1704067200000
console.log(date1.valueOf());                  // 1704067200000
```

**Another Example: Custom Object Equality**
```javascript
// ❌ BUG: Assuming valueOf determines equality
class Price {
  constructor(amount) {
    this.amount = amount;
  }

  valueOf() {
    return this.amount;
  }
}

const price1 = new Price(10);
const price2 = new Price(10);

console.log(price1 == price2);   // false ⚠️ (different objects!)
console.log(price1 === price2);  // false

// ✅ FIX: Implement comparison method
class Price {
  constructor(amount) {
    this.amount = amount;
  }

  valueOf() {
    return this.amount;
  }

  equals(other) {
    return other instanceof Price && this.amount === other.amount;
  }
}

const price3 = new Price(10);
const price4 = new Price(10);

console.log(price3.equals(price4));  // true ✅
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Overriding valueOf() and toString()</strong></summary>

### When to Override

**Override toString():**
- ✅ Want custom string representation
- ✅ Logging/debugging needs
- ✅ Display to users
- ✅ Serialization for simple formats

```javascript
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  toString() {
    return `${this.name}: $${this.price}`;
  }
}
```

**Override valueOf():**
- ✅ Object represents a numeric value
- ✅ Want custom comparison behavior
- ✅ Math operations should work

```javascript
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  valueOf() {
    return this.celsius;
  }
}

const temp = new Temperature(25);
console.log(temp > 20); // true (uses valueOf)
```

**Override Symbol.toPrimitive:**
- ✅ Need different behavior for different contexts
- ✅ Want maximum control
- ✅ Complex conversion logic

```javascript
class SmartValue {
  constructor(num, str) {
    this.num = num;
    this.str = str;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.num;
    if (hint === "string") return this.str;
    return this.num; // default
  }
}
```

### Potential Issues

**⚠️ Don't return non-primitives:**
```javascript
// ❌ BAD
class BadClass {
  valueOf() {
    return { value: 42 }; // Object! Not primitive!
  }
}

// Results in TypeError or unexpected NaN
```

**⚠️ Don't make valueOf and toString inconsistent:**
```javascript
// ⚠️ CONFUSING
class ConfusingClass {
  valueOf() {
    return 100;
  }
  toString() {
    return "fifty";
  }
}

const obj = new ConfusingClass();
console.log(+obj);       // 100
console.log(String(obj)); // "fifty"
// Inconsistent!
```

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"valueOf() and toString() are like **two translators** that objects use to introduce themselves.

**toString() - The String Translator:**
```javascript
const user = {
  name: "Alice",
  age: 25,
  toString() {
    return `${this.name}, age ${this.age}`;
  }
};

console.log(`User: ${user}`);  // "User: Alice, age 25"
```

Think of it like: \"How should I describe myself as text?\"

**valueOf() - The Number Translator:**
```javascript
const score = {
  points: 100,
  valueOf() {
    return this.points;
  }
};

console.log(score + 50);  // 150 (uses valueOf!)
```

Think of it like: \"What's my numeric value?\"

**When JavaScript picks which one:**

**1. String context** (needs text):
```javascript
String(obj)      // Uses toString()
`${obj}`         // Uses toString()
obj.toString()   // Obviously toString()
```

**2. Number context** (needs number):
```javascript
+obj             // Uses valueOf()
obj * 2          // Uses valueOf()
obj > 10         // Uses valueOf()
```

**3. Ambiguous context** (could be either):
```javascript
obj + ""         // Usually valueOf() first!
obj + 5          // valueOf() first
```

**Real-world example - Money:**
```javascript
class Money {
  constructor(amount) {
    this.amount = amount;
  }

  toString() {
    return `$${this.amount}`;  // For display
  }

  valueOf() {
    return this.amount;        // For math
  }
}

const price = new Money(20);

console.log(`Price: ${price}`);  // "Price: $20" (toString)
console.log(price + 5);          // 25 (valueOf)
console.log(price * 2);          // 40 (valueOf)
```

**Key insight:** These methods let your objects behave naturally with strings and numbers, without having to write special code every time!"

</details>

### Common Mistakes

❌ **Mistake 1:** Returning non-primitive from valueOf/toString
```javascript
const obj = {
  valueOf() {
    return { value: 42 }; // ❌ Object, not primitive!
  }
};
console.log(+obj);  // NaN or TypeError
```

✅ **Correct:** Always return primitive
```javascript
const obj = {
  valueOf() {
    return 42; // ✅ Number is primitive
  }
};
```

❌ **Mistake 2:** Forgetting null/undefined have no toString()
```javascript
const value = null;
// value.toString();  // ❌ TypeError!
```

✅ **Correct:** Use String() or check first
```javascript
String(value);  // "null" ✅
value?.toString(); // undefined (safe with optional chaining)
```

❌ **Mistake 3:** Assuming + uses valueOf for strings
```javascript
const obj = {
  valueOf: () => 100,
  toString: () => "hello"
};

console.log(obj + "");  // "100" (valueOf!) ⚠️
```

✅ **Correct:** Be explicit
```javascript
String(obj);  // "hello" (toString)
Number(obj);  // 100 (valueOf)
```

### Follow-up Questions

1. "What is the ToPrimitive algorithm?"
2. "When does JavaScript call toString() vs valueOf()?"
3. "What is Symbol.toPrimitive and how does it work?"
4. "Can you override both methods? What happens?"
5. "Why does Date have special coercion behavior?"
6. "What happens if valueOf() returns a non-primitive?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**ToPrimitive Algorithm (ECMAScript Spec):**

```
ToPrimitive(input, preferredType)
1. If input is primitive, return it
2. If Symbol.toPrimitive exists, call it with hint:
   - hint "string" → string context
   - hint "number" → numeric context
   - hint "default" → default context (+ operator, ==)
3. If no Symbol.toPrimitive or returns non-primitive:
   - If preferredType is "string": Try toString() → valueOf()
   - If preferredType is "number": Try valueOf() → toString()
4. If result is primitive, return it
5. Else throw TypeError
```

**V8 Implementation:**
- Fast path: Checks object's hidden class for cached conversion result
- Inline cache: Subsequent conversions ~1ns (vs ~50ns first time)
- Optimization: Common objects (Date, String wrapper) have optimized paths

**Date Special Behavior:**
Date objects prefer `toString()` for default hint (not `valueOf()`), unlike other objects.

**valueOf() Returning Non-Primitive:**
Falls back to `toString()`. If both return non-primitives, throws TypeError.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Price comparison bug - objects compared as strings instead of numbers.

**Bug:**
```javascript
const price1 = { amount: 100, currency: "USD" };
const price2 = { amount: 50, currency: "USD" };

// Implicit coercion in comparison:
if (price1 > price2) {  // Both become "[object Object]"
  console.log("price1 is higher");
}
// Comparison: "[object Object]" > "[object Object]" → false ❌
```

**Impact:**
- Price sorting broken on product pages
- Expensive items appeared cheaper
- Cart totals incorrect
- Revenue loss: ~$5,000/day (undercharging)
- User complaints: 150+ in first week

**Fix - Add Symbol.toPrimitive:**
```javascript
class Price {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.amount;  // Use amount for numeric operations
    }
    if (hint === "string") {
      return `${this.amount} ${this.currency}`;
    }
    return this.amount;  // Default to number
  }
}

const price1 = new Price(100, "USD");
const price2 = new Price(50, "USD");

price1 > price2;  // true ✅ (compares 100 > 50)
String(price1);   // "100 USD" ✅
```

**Metrics After Fix:**
- Sorting accuracy: 100%
- Cart calculation errors: 0
- Revenue recovery: $5,000/day
- Code review: All object comparisons now use explicit methods

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Approach | toString() | valueOf() | Symbol.toPrimitive | Winner |
|----------|-----------|-----------|-------------------|--------|
| **Priority** | Called 2nd (string hint) | Called 1st (number hint) | Highest priority | ✅ Symbol.toPrimitive |
| **Control** | Only string conversion | Only number conversion | All conversions (hint-aware) | ✅ Symbol.toPrimitive |
| **Performance** | ~20ns (method call) | ~20ns (method call) | ~25ns (slightly slower) | toString/valueOf |
| **Compatibility** | ES3+ (universal) | ES3+ (universal) | ES6+ (modern only) | toString/valueOf |
| **Clarity** | Intent unclear | Intent unclear | Explicit hint parameter | ✅ Symbol.toPrimitive |
| **Default Behavior** | Returns "[object Object]" | Returns `this` | Must implement or TypeError | toString/valueOf |

**When to use:**
- `Symbol.toPrimitive`: Custom objects with complex coercion needs (Price, Duration, Quantity)
- `valueOf()`: Simple numeric wrappers (legacy compatibility)
- `toString()`: Simple string representations (debugging, logging)

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**valueOf() and toString() Like Translators:**

Imagine you have a French book (JavaScript object). When someone asks "What does this say?":

**toString():** "Translate to English (string)"
```javascript
const book = { title: "Les Misérables", pages: 1200 };
book.toString();  // "[object Object]" (useless default!)

// Custom translator:
book.toString = function() {
  return `${this.title} (${this.pages} pages)`;
};
book.toString();  // "Les Misérables (1200 pages)" ✅
```

**valueOf():** "What's the core value (number)?"
```javascript
book.valueOf = function() {
  return this.pages;  // Core numeric value
};
+book;  // 1200 ✅ (used in numeric context)
```

**Symbol.toPrimitive:** "Smart translator (knows context)"
```javascript
book[Symbol.toPrimitive] = function(hint) {
  if (hint === "string") {
    return `${this.title} (${this.pages} pages)`;
  }
  if (hint === "number") {
    return this.pages;
  }
  return this.title;  // Default
};

String(book);  // "Les Misérables (1200 pages)"
+book;         // 1200
book + "";     // "Les Misérables" (default hint)
```

**Real Example:**
```javascript
const duration = {
  hours: 2,
  minutes: 30,
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.hours * 60 + this.minutes;  // Total minutes
    return `${this.hours}h ${this.minutes}m`;  // Human-readable
  }
};

duration + 60;      // 210 (150 + 60 minutes)
`Duration: ${duration}`;  // "Duration: 2h 30m"
```

</details>

### Resources

- [MDN: valueOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf)
- [MDN: toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
- [MDN: Symbol.toPrimitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)

---

## Question 5: How does JSON.stringify() handle type conversion? What is toJSON()?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8-12 minutes
**Companies:** Google, Amazon, Microsoft, Stripe, PayPal

### Question

Explain how `JSON.stringify()` converts JavaScript values to JSON strings. What types are not serializable? How does the `toJSON()` method work? What are the parameters of `JSON.stringify()` and how can you customize serialization?

### Answer

**JSON.stringify()** converts JavaScript values to JSON strings, with specific rules for type conversion.

**Basic Conversion Rules:**
1. **Strings, Numbers, Booleans** → JSON primitives
2. **null** → `"null"`
3. **Objects, Arrays** → Recursively serialized
4. **undefined, Functions, Symbols** → Omitted (in objects) or `null` (in arrays)
5. **Date** → ISO string (via `toISOString()`)
6. **NaN, Infinity** → `"null"`
7. **BigInt** → TypeError (not serializable)

**toJSON() Method:**
- Custom serialization for objects
- Called automatically by `JSON.stringify()`
- Returns the value to be serialized

### Code Example

```javascript
// ============================================
// 1. BASIC SERIALIZATION
// ============================================

const obj = {
  name: "Alice",
  age: 30,
  active: true,
  balance: null
};

console.log(JSON.stringify(obj));
// {"name":"Alice","age":30,"active":true,"balance":null}

// ============================================
// 2. VALUES THAT ARE OMITTED OR CONVERTED
// ============================================

const withSpecialValues = {
  func: () => {},           // ❌ Omitted
  sym: Symbol("id"),        // ❌ Omitted
  undef: undefined,         // ❌ Omitted
  nan: NaN,                 // → null
  inf: Infinity,            // → null
  date: new Date()          // → ISO string
};

console.log(JSON.stringify(withSpecialValues));
// {"nan":null,"inf":null,"date":"2025-01-15T10:30:00.000Z"}

// Arrays keep structure with null
const arr = [1, undefined, () => {}, Symbol(), NaN];
console.log(JSON.stringify(arr));
// [1,null,null,null,null]

// ============================================
// 3. CUSTOM SERIALIZATION WITH toJSON()
// ============================================

class User {
  constructor(name, password, createdAt) {
    this.name = name;
    this.password = password;  // Sensitive!
    this.createdAt = createdAt;
  }

  // Custom serialization - exclude password
  toJSON() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      // password excluded ✅
    };
  }
}

const user = new User("alice", "secret123", new Date());
console.log(JSON.stringify(user));
// {"name":"alice","createdAt":"2025-01-15T10:30:00.000Z"}
// Password not included! ✅

// ============================================
// 4. REPLACER FUNCTION (2nd parameter)
// ============================================

const data = {
  name: "Bob",
  age: 25,
  password: "secret",
  apiKey: "abc123"
};

// Filter out sensitive fields
const safeJSON = JSON.stringify(data, (key, value) => {
  if (key === "password" || key === "apiKey") {
    return undefined; // Omit these fields
  }
  return value;
});

console.log(safeJSON);
// {"name":"Bob","age":25}

// ============================================
// 5. SPACE PARAMETER (3rd parameter)
// ============================================

const formatted = JSON.stringify(
  { name: "Alice", nested: { value: 42 } },
  null,
  2  // 2-space indentation
);

console.log(formatted);
/*
{
  "name": "Alice",
  "nested": {
    "value": 42
  }
}
*/

// ============================================
// 6. CIRCULAR REFERENCES
// ============================================

const circular = { name: "Alice" };
circular.self = circular;

try {
  JSON.stringify(circular);
} catch (error) {
  console.log(error);
  // TypeError: Converting circular structure to JSON
}

// Solution: Use replacer to handle circular refs
const seen = new WeakSet();
const safeCircular = JSON.stringify(circular, (key, value) => {
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
  }
  return value;
});

console.log(safeCircular);
// {"name":"Alice","self":"[Circular]"}

// ============================================
// 7. PRACTICAL EXAMPLE - API RESPONSE
// ============================================

class Product {
  constructor(id, name, price, internalCost) {
    this.id = id;
    this.name = name;
    this.price = price;
    this._internalCost = internalCost; // Private data
    this._createdAt = new Date();
  }

  toJSON() {
    // Only expose public data for API
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      // _internalCost excluded ✅
      timestamp: this._createdAt.toISOString()
    };
  }
}

const product = new Product(1, "Laptop", 999, 600);
const apiResponse = JSON.stringify(product);
console.log(apiResponse);
// {"id":1,"name":"Laptop","price":999,"timestamp":"2025-01-15T10:30:00.000Z"}
// Internal cost not exposed! ✅
```

<details>
<summary><strong>🔍 Deep Dive: JSON.stringify() Internals</strong></summary>

**Algorithm (Simplified):**

```javascript
// Pseudocode for JSON.stringify() internals
function stringifyValue(value, replacer, space, seen) {
  // 1. Check for toJSON() method
  if (value && typeof value.toJSON === "function") {
    value = value.toJSON();
  }

  // 2. Apply replacer if provided
  if (replacer) {
    value = replacer(currentKey, value);
  }

  // 3. Handle primitives
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") {
    return isFinite(value) ? String(value) : "null";
  }
  if (typeof value === "string") {
    return escapeString(value);
  }

  // 4. Handle special cases
  if (typeof value === "undefined") return undefined;
  if (typeof value === "function") return undefined;
  if (typeof value === "symbol") return undefined;
  if (typeof value === "bigint") throw TypeError();

  // 5. Handle objects/arrays
  if (typeof value === "object") {
    // Check for circular reference
    if (seen.has(value)) {
      throw TypeError("Converting circular structure to JSON");
    }
    seen.add(value);

    if (Array.isArray(value)) {
      // Array: keep structure, use null for undefined
      return "[" + value.map(v =>
        stringifyValue(v, replacer, space, seen) ?? "null"
      ).join(",") + "]";
    }

    // Object: omit undefined/function/symbol values
    const props = Object.keys(value)
      .filter(k => {
        const v = value[k];
        return v !== undefined &&
               typeof v !== "function" &&
               typeof v !== "symbol";
      })
      .map(k => `"${k}":${stringifyValue(value[k], replacer, space, seen)}`)
      .join(",");

    return "{" + props + "}";
  }
}
```

**Why These Rules?**

1. **undefined/functions omitted in objects:** JSON has no representation for these
2. **null in arrays:** Preserves array indices `[1, null, 3]` vs `[1, 3]`
3. **Date → string:** JSON has no Date type, ISO string is standard
4. **NaN/Infinity → null:** JSON numbers must be finite
5. **BigInt throws:** No standard JSON representation yet (would lose precision)

**V8 Optimization:**
- Fast path for plain objects (no getters, no prototype methods)
- String builder for efficient concatenation
- Caches property lookups for repeated serialization

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Data Leak</strong></summary>

**Scenario:** You're debugging a security incident where user passwords appeared in API logs.

**The Bug:**

```javascript
class User {
  constructor(email, password, role) {
    this.email = email;
    this.password = password;  // Sensitive!
    this.role = role;
    this.loginAttempts = 0;
    this._sessionToken = null; // Very sensitive!
  }

  login(inputPassword) {
    if (inputPassword === this.password) {
      this._sessionToken = generateToken();
      return true;
    }
    this.loginAttempts++;
    return false;
  }
}

// API endpoint
app.post("/api/login", (req, res) => {
  const user = getUserByEmail(req.body.email);

  if (user.login(req.body.password)) {
    // ❌ BUG: Logging entire user object!
    logger.info("Login success:", JSON.stringify(user));

    // ❌ BUG: Sending entire object to client!
    res.json({ success: true, user });
  }
});

// What gets logged/sent:
// {
//   "email": "alice@example.com",
//   "password": "secret123",        // ❌ LEAKED!
//   "role": "admin",
//   "_sessionToken": "abc123xyz",   // ❌ LEAKED!
//   "loginAttempts": 0
// }
```

**Why It Happened:**
- `JSON.stringify()` serializes ALL enumerable properties
- Even "private" properties (with `_` prefix) are serialized
- No filtering by default

**The Fix:**

```javascript
class User {
  constructor(email, password, role) {
    this.email = email;
    this.password = password;
    this.role = role;
    this.loginAttempts = 0;
    this._sessionToken = null;
  }

  // ✅ FIX: Define what's safe to serialize
  toJSON() {
    return {
      email: this.email,
      role: this.role,
      // password and _sessionToken excluded ✅
    };
  }

  login(inputPassword) {
    if (inputPassword === this.password) {
      this._sessionToken = generateToken();
      return true;
    }
    this.loginAttempts++;
    return false;
  }
}

// Now safe:
logger.info("Login success:", JSON.stringify(user));
// {"email":"alice@example.com","role":"admin"}

res.json({ success: true, user });
// {"success":true,"user":{"email":"alice@example.com","role":"admin"}}
```

**Alternative Fix with Replacer:**

```javascript
// Global serialization filter
const sensitiveFields = ["password", "_sessionToken", "apiKey"];

function safeStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (sensitiveFields.includes(key)) {
      return undefined; // Omit sensitive fields
    }
    return value;
  });
}

logger.info("Login success:", safeStringify(user));
```

**Lessons Learned:**
1. ALWAYS implement `toJSON()` for classes with sensitive data
2. NEVER trust default serialization for security
3. Use replacer functions for additional safety
4. Test what actually gets serialized to logs/APIs
5. Consider using libraries like `serialize-error` for structured logging

</details>

<details>
<summary><strong>⚖️ Trade-offs: JSON.stringify() Approaches</strong></summary>

### Approach 1: toJSON() Method

```javascript
class User {
  toJSON() {
    return { email: this.email, role: this.role };
  }
}
```

**Pros:**
- ✅ Encapsulated - serialization logic with the class
- ✅ Type-safe - works for all instances
- ✅ Performance - no runtime filtering
- ✅ Consistent - same serialization everywhere

**Cons:**
- ❌ Inflexible - same serialization for all contexts
- ❌ Can't serialize differently for logs vs API
- ❌ Harder to serialize third-party classes

**When to use:** Classes you control, consistent serialization needs

---

### Approach 2: Replacer Function

```javascript
JSON.stringify(user, (key, value) => {
  return sensitiveFields.includes(key) ? undefined : value;
});
```

**Pros:**
- ✅ Flexible - different serialization per context
- ✅ Works with any object (including third-party)
- ✅ Centralized filtering logic
- ✅ Easy to update globally

**Cons:**
- ❌ Runtime cost - function called for every property
- ❌ Not type-safe - string-based key checks
- ❌ Less discoverable - serialization logic separated from class
- ❌ Performance overhead for large objects

**When to use:** Third-party objects, context-specific serialization, security filtering

---

### Approach 3: Whitelisting Properties

```javascript
const safe = { email: user.email, role: user.role };
JSON.stringify(safe);
```

**Pros:**
- ✅ Explicit - exactly what you want serialized
- ✅ No magic - clear and obvious
- ✅ Fast - no extra processing
- ✅ Type-safe (with TypeScript)

**Cons:**
- ❌ Verbose - must list every property
- ❌ Error-prone - easy to forget properties
- ❌ Not DRY - repeated in multiple places
- ❌ Maintenance burden - update every usage

**When to use:** One-off serialization, very security-sensitive contexts

---

### Approach 4: Libraries (e.g., class-transformer)

```javascript
import { classToPlain, Exclude } from "class-transformer";

class User {
  email: string;

  @Exclude()  // Don't serialize
  password: string;
}

JSON.stringify(classToPlain(user));
```

**Pros:**
- ✅ Declarative - decorators show intent
- ✅ Powerful - many serialization options
- ✅ Type-safe (TypeScript)
- ✅ Validation + serialization together

**Cons:**
- ❌ Dependency - extra library
- ❌ Learning curve - library-specific API
- ❌ Bundle size - adds KB to your app
- ❌ TypeScript only - requires decorators

**When to use:** Large TypeScript projects, complex serialization needs

---

**Performance Comparison (1000 objects):**
```
toJSON():              ~0.5ms  (fastest)
Replacer function:     ~2.1ms  (4x slower)
Whitelisting:          ~0.6ms  (nearly as fast as toJSON)
class-transformer:     ~3.5ms  (7x slower, includes validation)
```

**Security Ranking (most → least secure):**
1. Whitelisting (only specified fields)
2. toJSON() (controlled by class)
3. Replacer function (relies on blacklist)
4. Default stringify (no protection)

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

**Senior:** "Hey, quick question - why are you using `JSON.stringify()` on the entire user object in that API response?"

**Junior:** "Well, I need to send the user data back to the client, and `JSON.stringify()` converts it to JSON automatically..."

**Senior:** "Right, but do you know what `JSON.stringify()` actually includes?"

**Junior:** "Uh... everything in the object?"

**Senior:** "Exactly! And that's the problem. Look:"

```javascript
const user = {
  email: "alice@example.com",
  password: "secret123",  // ⚠️ This too!
  role: "admin"
};

JSON.stringify(user);
// {"email":"alice@example.com","password":"secret123","role":"admin"}
```

**Junior:** "Oh no, the password is in there!"

**Senior:** "Yep. `JSON.stringify()` doesn't know which fields are sensitive - it just converts everything. You have three ways to fix this:"

**Option 1: Only pick what you need (simplest)**

```javascript
const safe = { email: user.email, role: user.role };
res.json(safe);  // ✅ Only email and role
```

**Option 2: Add a toJSON() method (best for classes)**

```javascript
class User {
  constructor(email, password, role) {
    this.email = email;
    this.password = password;
    this.role = role;
  }

  toJSON() {
    // Return only safe fields
    return {
      email: this.email,
      role: this.role
      // password excluded!
    };
  }
}

JSON.stringify(user);  // ✅ Only email and role
```

**Junior:** "Oh! So `toJSON()` tells `JSON.stringify()` what to include?"

**Senior:** "Exactly! It's like a custom recipe for serialization. When `JSON.stringify()` sees an object with a `toJSON()` method, it calls that method first and serializes whatever it returns."

**Option 3: Use a replacer function (for filtering)**

```javascript
JSON.stringify(user, (key, value) => {
  // Skip the password field
  if (key === "password") {
    return undefined;  // Omit this field
  }
  return value;
});
```

**Junior:** "Which one should I use?"

**Senior:** "It depends:
- **Pick specific fields** if it's a one-time thing
- **toJSON()** if it's a class that's serialized often
- **Replacer** if you need to filter many objects consistently

For security-critical stuff like user data, I always use `toJSON()` - it's the safest because the class controls exactly what gets exposed."

**Junior:** "Got it! So the rule is: never blindly stringify objects that might have sensitive data."

**Senior:** "Exactly! Always be intentional about what you serialize. And test it - actually log `JSON.stringify(user)` to see what would get sent before pushing to production!"

</details>

### Common Mistakes

❌ **Mistake 1:** Forgetting BigInt throws
```javascript
const data = { id: 123n };  // BigInt
JSON.stringify(data);  // ❌ TypeError!
```

✅ **Correct:** Convert BigInt to string first
```javascript
const data = { id: 123n };
JSON.stringify(data, (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);
// {"id":"123"}
```

❌ **Mistake 2:** Not handling circular references
```javascript
const obj = { name: "Alice" };
obj.self = obj;
JSON.stringify(obj);  // ❌ TypeError: Converting circular structure
```

✅ **Correct:** Use replacer to detect cycles
```javascript
const seen = new WeakSet();
JSON.stringify(obj, (key, value) => {
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
  }
  return value;
});
```

❌ **Mistake 3:** Assuming toJSON() is inherited
```javascript
class Base {
  toJSON() { return { type: "base" }; }
}

class Derived extends Base {
  constructor() {
    super();
    this.value = 42;
  }
}

JSON.stringify(new Derived());
// {"type":"base"}  // ⚠️ value is missing!
```

✅ **Correct:** Override toJSON() in derived class
```javascript
class Derived extends Base {
  constructor() {
    super();
    this.value = 42;
  }

  toJSON() {
    return {
      ...super.toJSON(),  // Include base
      value: this.value   // Add derived
    };
  }
}

JSON.stringify(new Derived());
// {"type":"base","value":42}  ✅
```

### Follow-up Questions

1. "What happens when you stringify undefined vs null?"
2. "How does toJSON() interact with the replacer parameter?"
3. "Can you parse back a BigInt from JSON?"
4. "What's the performance cost of the replacer function?"
5. "How would you handle circular references in a production app?"
6. "Why doesn't JSON.stringify() throw on functions instead of omitting them?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**JSON.stringify() Algorithm (V8):**

1. **Type Checking:**
   - `undefined`, `Function`, `Symbol` → omitted (object properties) or `null` (array elements)
   - `null` → `"null"`
   - `Boolean`, `Number`, `String` → primitive JSON
   - `BigInt` → TypeError (not JSON-compatible)
   - `Date` → calls `toISOString()`
   - `Object`/`Array` → recursive serialization

2. **toJSON() Priority:**
   - If object has `toJSON()` method, call it BEFORE replacer
   - Result is what gets stringified (not original object)
   - Built-in: `Date.prototype.toJSON()` returns ISO string

3. **Replacer Interaction:**
   - `toJSON()` runs first → replacer receives toJSON result
   - Replacer can further transform/filter
   - Order: toJSON() → replacer → JSON serialization

**V8 Optimization:**
- Fast path for simple objects (no getters, no toJSON): ~500ns per object
- Inline cache for property access: Subsequent stringifications ~50% faster
- String builder: Preallocates buffer to avoid reallocations

**Circular Reference Handling:**
V8 maintains Set of visited objects during traversal. Throws TypeError on cycle detection.

**Why Functions Are Omitted (Not Error):**
JSON spec targets data interchange, not code. Silently omitting is safer than throwing (partial data > no data).

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** API response logging crashed with "Converting circular structure to JSON" error.

**Bug:**
```javascript
const user = {
  id: 123,
  name: "Alice",
  posts: []
};

const post = {
  id: 456,
  title: "Hello",
  author: user  // Circular reference!
};

user.posts.push(post);

// Crash on logging:
JSON.stringify(user);  // TypeError: Converting circular structure to JSON
```

**Impact:**
- Server crashes: 50+ per day
- Monitoring system down (couldn't log responses)
- Debug time wasted: ~10 hours/week
- Production incidents untracked

**Fix - Custom Circular Detector:**
```javascript
function safeStringify(obj, space = 2) {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    // Handle primitives and null
    if (typeof value !== "object" || value === null) {
      return value;
    }

    // Detect circular reference
    if (seen.has(value)) {
      return "[Circular]";  // Replace with marker
    }

    seen.add(value);
    return value;
  }, space);
}

safeStringify(user);
// ✅ Works! Replaces circular refs with "[Circular]"
```

**Alternative - Use Library:**
```javascript
// fast-json-stable-stringify (npm)
const stringify = require('fast-json-stable-stringify');
stringify(user);  // Handles cycles automatically
```

**Metrics After Fix:**
- Crashes: 0 (from 50+/day)
- All API responses logged successfully
- Debug time saved: 10 hours/week
- Monitoring uptime: 100%

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

| Approach | Native JSON.stringify | Custom Replacer | toJSON() | Library (fast-json-stable-stringify) | Winner |
|----------|----------------------|----------------|----------|-------------------------------------|--------|
| **Circular Refs** | ❌ Throws TypeError | ✅ Can handle | ✅ Can handle | ✅ Handles automatically | Library |
| **Performance** | ~500ns (fastest) | ~2μs (4x slower) | ~800ns | ~1.5μs | ✅ Native |
| **BigInt Support** | ❌ Throws | ✅ Can convert to string | ✅ Can convert | ✅ Configurable | Replacer/toJSON/Library |
| **Undefined Handling** | Omits properties | ✅ Can convert to null | ✅ Can convert | ✅ Configurable | Replacer/toJSON/Library |
| **Custom Types** | ❌ Limited | ✅ Full control | ✅ Full control | ✅ Plugins | Replacer/toJSON/Library |
| **Code Complexity** | Zero (built-in) | Medium | Medium (per-class) | Low (import) | ✅ Native |
| **Bundle Size** | 0 bytes | 0 bytes | 0 bytes | ~5KB | ✅ Native/Replacer/toJSON |

**When to use:**
- **Native:** Simple objects, no edge cases, performance-critical
- **Replacer:** One-off transformations, filtering sensitive data
- **toJSON():** Class-specific serialization (Date, custom classes)
- **Library:** Production apps with complex data (circular refs, BigInt, undefined)

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**JSON.stringify() Like Packing for a Trip:**

Imagine you're packing your belongings to send overseas. JSON.stringify() is like a strict packing service with rules:

**What Gets Packed:**
```javascript
const luggage = {
  clothes: "shirts",      // ✅ Packed
  money: 100,             // ✅ Packed
  passport: null,         // ✅ Packed as "empty envelope"
  secrets: undefined,     // ❌ LEFT BEHIND (omitted!)
  pet: function() {},     // ❌ LIVING THINGS NOT ALLOWED (omitted!)
  crypto: 123n            // ❌ THROWS ERROR (not supported)
};

JSON.stringify(luggage);
// {"clothes":"shirts","money":100,"passport":null}
```

**toJSON() Like Custom Packing Instructions:**
```javascript
class Phone {
  constructor(brand, model, privateKey) {
    this.brand = brand;
    this.model = model;
    this.privateKey = privateKey;  // Don't want to send this!
  }

  toJSON() {
    // Custom packing: only send brand and model
    return {
      brand: this.brand,
      model: this.model
      // privateKey omitted for security
    };
  }
}

const phone = new Phone("Apple", "iPhone 15", "secret123");
JSON.stringify(phone);
// {"brand":"Apple","model":"iPhone 15"}  ✅ (privateKey not sent!)
```

**Circular References Like Infinite Loop:**
```javascript
const parent = { name: "Dad" };
const child = { name: "Kid", parent: parent };
parent.child = child;  // ❌ Parent points to child, child points to parent!

JSON.stringify(parent);  // TypeError! (infinite loop detected)
```

**Fix with Replacer:**
```javascript
const seen = new WeakSet();
JSON.stringify(parent, (key, value) => {
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[Already packed]";  // Stop circular!
    seen.add(value);
  }
  return value;
});
```

**Rule:** Use toJSON() for classes, replacer for one-off filtering, libraries for complex production needs.

</details>

### Resources

- [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN: toJSON()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON)
- [JSON Specification](https://www.json.org/)
- [ECMAScript: JSON.stringify Algorithm](https://tc39.es/ecma262/#sec-json.stringify)

---
