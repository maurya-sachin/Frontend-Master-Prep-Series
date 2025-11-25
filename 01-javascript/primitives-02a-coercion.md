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
<summary><strong>🔍 Deep Dive: ToPrimitive Algorithm Internals</strong></summary>

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
