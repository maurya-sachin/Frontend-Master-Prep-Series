# JavaScript Type Coercion & Conversion (Part 3)

> **Focus**: JSON serialization and toJSON() method

---

## Question 1: How does JSON.stringify() handle type conversion? What is toJSON()?

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
<summary><strong>🔍 Deep Dive: JSON.stringify() Algorithm & Internals</strong></summary>

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
<summary><strong>🐛 Real-World Scenario: Password Leak in API Logs</strong></summary>

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
<summary><strong>⚖️ Trade-offs: toJSON() vs Replacer vs Whitelisting</strong></summary>

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
<summary><strong>💬 Explain to Junior Developer: Type Conversion Simplified</strong></summary>

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
<summary><strong>🔍 Deep Dive: Number() vs parseInt() Algorithms</strong></summary>

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
<summary><strong>🐛 Real-World Scenario: Port Number Parsing Bug</strong></summary>

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
<summary><strong>⚖️ Trade-offs: Number() vs parseInt() vs parseFloat()</strong></summary>

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
<summary><strong>💬 Explain to Junior: valueOf() and toString() as Translators</strong></summary>

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
