# JavaScript Type Coercion & Conversion (Part 2)

> **Focus**: Type conversion methods and valueOf/toString behavior

---

## Question 1: What are type conversion methods in JavaScript?

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

## Question 2: What are valueOf() and toString() methods in JavaScript?

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
