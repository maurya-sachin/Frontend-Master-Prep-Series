# JavaScript Primitive Types & Type System

> **Focus**: Deep understanding of JavaScript's type system, V8 internals, and production debugging

---

## Question 1: What are primitive and non-primitive data types in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question

Explain the difference between primitive and non-primitive (reference) data types in JavaScript. List all primitive types and explain how they're stored in memory.

### Answer

JavaScript has **7 primitive types** and **1 reference type** (objects).

**Primitive Types (7):**
- `string` - Text data ("hello")
- `number` - Numeric data (42, 3.14, Infinity, NaN)
- `bigint` - Large integers (9007199254740991n)
- `boolean` - true/false
- `undefined` - Variable declared but not assigned
- `null` - Intentional absence of value
- `symbol` - Unique identifier (Symbol('id'))

**Key Differences:**

| Aspect | Primitives | Reference Types |
|--------|-----------|-----------------|
| Storage | Stack (value) | Heap (reference) |
| Mutability | Immutable | Mutable |
| Comparison | By value | By reference |
| Copy behavior | Copies value | Copies reference |
| Memory | Fixed size | Variable size |

### Code Example

```javascript
// ============================================
// 1. PRIMITIVES - VALUE SEMANTICS
// ============================================

let a = 10;
let b = a; // Copies the VALUE
b = 20;

console.log(a); // 10 (unchanged)
console.log(b); // 20

// ============================================
// 2. REFERENCE TYPES - REFERENCE SEMANTICS
// ============================================

let obj1 = { name: "John" };
let obj2 = obj1; // Copies the REFERENCE (points to same object)
obj2.name = "Jane";

console.log(obj1.name); // "Jane" (changed!)
console.log(obj2.name); // "Jane"

// Both variables point to the same object in heap memory
console.log(obj1 === obj2); // true (same reference)

// ============================================
// 3. PRIMITIVE IMMUTABILITY
// ============================================

let str = "hello";
str[0] = "H"; // Doesn't work (immutable)
console.log(str); // "hello" (unchanged)

// String methods return NEW strings
let upper = str.toUpperCase(); // Creates new string
console.log(str);   // "hello" (original unchanged)
console.log(upper); // "HELLO" (new string)

// ============================================
// 4. TYPEOF OPERATOR
// ============================================

console.log(typeof 42);           // "number"
console.log(typeof "text");       // "string"
console.log(typeof true);         // "boolean"
console.log(typeof undefined);    // "undefined"
console.log(typeof null);         // "object" ⚠️ (historical bug!)
console.log(typeof Symbol('id')); // "symbol"
console.log(typeof 123n);         // "bigint"
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"
console.log(typeof function(){}); // "function"

// ============================================
// 5. COMPARISON BEHAVIOR
// ============================================

// Primitives: compared by value
console.log(5 === 5);           // true
console.log("hi" === "hi");     // true

// Objects: compared by reference
console.log({} === {});         // false (different objects)
console.log([] === []);         // false (different arrays)

const arr1 = [1, 2, 3];
const arr2 = arr1;
console.log(arr1 === arr2);     // true (same reference)

// ============================================
// 6. SHALLOW VS DEEP COPY
// ============================================

// Shallow copy - copies top level only
const original = {
  name: "Alice",
  address: { city: "NYC" }
};

const shallow = { ...original };
shallow.name = "Bob";              // OK: primitive copied
shallow.address.city = "LA";       // Problem: nested object shared!

console.log(original.name);        // "Alice" (unchanged)
console.log(original.address.city);// "LA" (changed! ⚠️)

// Deep copy - copies everything recursively
const deep = JSON.parse(JSON.stringify(original));
deep.address.city = "SF";

console.log(original.address.city); // "LA" (unchanged)
console.log(deep.address.city);     // "SF"
```

<details>
<summary><strong>🔍 Deep Dive: V8 Engine Internals</strong></summary>

### How V8 Stores Primitives vs Objects

**Stack Storage (Primitives):**
```
Stack Frame:
┌──────────────┐
│ a = 10       │ ← Direct value storage
│ b = 20       │ ← Another direct value
│ str = "hi"   │ ← Small strings inline (Smi)
└──────────────┘
```

**Heap Storage (Objects):**
```
Stack Frame:        Heap Memory:
┌──────────────┐   ┌────────────────┐
│ obj → 0x1234 │──→│ { name: "John" }│
│ arr → 0x5678 │──→│ [1, 2, 3]      │
└──────────────┘   └────────────────┘
```

**Smi (Small Integer) Optimization:**
- V8 stores integers from -2^30 to 2^30-1 as "Smi" (tagged pointers)
- Smi = value << 1 | 1 (LSB set to 1 to mark as integer)
- No heap allocation needed!
- Faster than heap-allocated numbers

**String Internalization:**
- V8 interns string literals in a string table
- Same string literals share memory
```javascript
const s1 = "hello";
const s2 = "hello";
// Both point to same interned string in memory!
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Reference Bug</strong></summary>

### Production Bug: Mutating Shared State

**Scenario:** Your dashboard is showing wrong user data after updates.

```javascript
// ❌ BUG: Accidentally mutating Redux state
function reducer(state = { users: [] }, action) {
  switch (action.type) {
    case 'ADD_USER':
      // NEVER do this! Mutates original state
      state.users.push(action.payload);
      return state;

    default:
      return state;
  }
}

// Why this breaks:
// - Redux relies on reference checks: oldState === newState
// - If same reference, React won't re-render
// - Data updates but UI doesn't!
```

**Fix: Always create new references**
```javascript
// ✅ CORRECT: Create new array reference
function reducer(state = { users: [] }, action) {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload] // New array!
      };

    default:
      return state;
  }
}
```

**Debugging Tips:**
1. Use `Object.freeze(state)` in development to catch mutations
2. Enable Redux DevTools immutability check
3. Use Immer library for safe mutations
4. Always check `===` before/after state updates

</details>

<details>
<summary><strong>⚖️ Trade-offs: Value vs Reference Types</strong></summary>

### Performance Considerations

**Primitives (Stack):**
- ✅ **Pros:**
  - Fast allocation/deallocation (stack pointer bump)
  - Cache-friendly (locality of reference)
  - No garbage collection overhead
  - Predictable memory usage

- ❌ **Cons:**
  - Limited size (stack overflow risk)
  - Must copy entire value
  - Can't share data efficiently

**Objects (Heap):**
- ✅ **Pros:**
  - Can store large, complex data
  - Reference sharing (multiple variables, one object)
  - Dynamic sizing

- ❌ **Cons:**
  - Slower allocation (heap fragmentation)
  - Garbage collection pauses
  - Cache misses
  - Reference bugs (unintended mutations)

**When to Use What:**

Use primitives when:
- Data is small and simple
- Immutability is desired
- Performance is critical

Use objects when:
- Data is complex/nested
- Need to share state
- Size is unpredictable

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Think of primitives like **sticky notes** and objects like **filing cabinets**.

When you copy a sticky note (primitive), you write the exact same text on a new note. Changing the new note doesn't affect the original.

```javascript
let note1 = "Buy milk";
let note2 = note1;  // Copy the text
note2 = "Buy eggs"; // Change copy

// note1 still says "Buy milk"
```

But with a filing cabinet (object), copying gives you **a key to the same cabinet**, not a whole new cabinet!

```javascript
let cabinet1 = { item: "milk" };
let cabinet2 = cabinet1;  // Copy the key
cabinet2.item = "eggs";   // Open with key, change contents

// cabinet1.item is now "eggs" too! (same cabinet)
```

To actually duplicate a cabinet, you need to build a new one and copy each drawer:

```javascript
let newCabinet = { ...cabinet1 }; // Build new cabinet
```

**Key takeaway:** Primitives copy values, objects copy references (addresses)."

</details>

### Common Mistakes

❌ **Mistake 1:** Thinking `typeof null` returns "null"
```javascript
console.log(typeof null); // "object" (not "null"!)
```
This is a 25+ year old bug that can't be fixed without breaking the web.

❌ **Mistake 2:** Assuming arrays have their own type
```javascript
console.log(typeof []); // "object" (not "array")
// Use Array.isArray() instead
console.log(Array.isArray([])); // true
```

❌ **Mistake 3:** Shallow copying nested objects
```javascript
const obj = { nested: { count: 0 } };
const copy = { ...obj }; // Shallow copy!
copy.nested.count = 1;
console.log(obj.nested.count); // 1 (mutated! ⚠️)
```

✅ **Correct:** Deep copy when needed
```javascript
const deep = JSON.parse(JSON.stringify(obj));
// or use structuredClone() or libraries like lodash.cloneDeep
```

### Follow-up Questions

1. "What is the difference between `null` and `undefined`?"
2. "Why does `typeof null` return 'object'?"
3. "How would you check if a variable is an array?"
4. "What is the difference between shallow and deep copy?"
5. "Can you mutate a const object? Why or why not?"
6. "How does JavaScript store numbers in memory?"
7. "What happens when you exceed the stack size?"

### Resources

- [MDN: JavaScript Data Types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [V8 Blog: Fast Properties](https://v8.dev/blog/fast-properties)
- [JavaScript.info: Data Types](https://javascript.info/types)

---

---

## Question 2: What is the difference between null and undefined?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix

### Question

Explain the difference between `null` and `undefined`. When should you use each? How does JavaScript treat them differently?

### Answer

Both represent "no value", but with different semantics:

**`undefined`:**
- Default value for uninitialized variables
- Function parameters without arguments
- Missing object properties
- Function without explicit return
- Automatically assigned by JavaScript

**`null`:**
- Explicitly assigned by programmer
- Represents intentional absence
- "I know there's no value here"
- Used in APIs to indicate "no object"

### Code Example

```javascript
// ============================================
// 1. UNDEFINED - AUTOMATIC
// ============================================

// Uninitialized variable
let x;
console.log(x); // undefined

// Missing function parameter
function greet(name) {
  console.log(name); // undefined if not passed
}
greet();

// Missing object property
const obj = { a: 1 };
console.log(obj.b); // undefined

// Function without return
function noReturn() {
  // no return statement
}
console.log(noReturn()); // undefined

// Explicit return undefined
function explicitUndefined() {
  return undefined;
}
console.log(explicitUndefined()); // undefined

// Array holes (sparse arrays)
const arr = [1, , 3]; // Middle element is undefined
console.log(arr[1]); // undefined
console.log(arr.length); // 3

// ============================================
// 2. NULL - INTENTIONAL
// ============================================

// Explicitly set to null
let user = null; // "No user logged in"
console.log(user); // null

// API responses
const response = {
  data: null,  // "No data available"
  error: null  // "No error occurred"
};

// Clearing references
let bigData = { /* large object */ };
bigData = null; // Help garbage collector

// DOM APIs return null
document.getElementById('nonexistent'); // null (not undefined!)

// RegExp match returns null
'hello'.match(/\d+/); // null (no match)

// Object.getPrototypeOf(Object.prototype)
console.log(Object.getPrototypeOf(Object.prototype)); // null (end of chain)

// ============================================
// 3. TYPE CHECKING
// ============================================

console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" ⚠️ (bug!)

// Equality checks
console.log(undefined == null);  // true (loose equality)
console.log(undefined === null); // false (strict equality)

// ============================================
// 4. CHECKING FOR BOTH
// ============================================

function processValue(value) {
  // Check for null OR undefined
  if (value == null) {  // Covers both!
    console.log('No value');
    return;
  }

  // Or more explicit:
  if (value === null || value === undefined) {
    console.log('No value');
    return;
  }

  console.log('Has value:', value);
}

processValue(undefined); // "No value"
processValue(null);      // "No value"
processValue(0);         // "Has value: 0"
processValue('');        // "Has value: "

// ============================================
// 5. NULLISH COALESCING (??)
// ============================================

// Returns right side if left is null OR undefined
const value1 = null ?? 'default';
console.log(value1); // "default"

const value2 = undefined ?? 'default';
console.log(value2); // "default"

const value3 = 0 ?? 'default';
console.log(value3); // 0 (not replaced!)

const value4 = '' ?? 'default';
console.log(value4); // "" (not replaced!)

// Compare with OR (||)
console.log(0 || 'default');  // "default" (0 is falsy)
console.log(0 ?? 'default');  // 0 (0 is not nullish)

// ============================================
// 6. OPTIONAL CHAINING (?.)
// ============================================

const user = {
  name: "Alice",
  address: {
    street: "Main St"
  }
};

// Safe property access
console.log(user?.address?.street); // "Main St"
console.log(user?.address?.city);   // undefined (not error!)
console.log(user?.contact?.email);  // undefined (contact doesn't exist)

// Without optional chaining (old way)
const email = user && user.contact && user.contact.email;

// ============================================
// 7. JSON SERIALIZATION
// ============================================

const obj = {
  a: undefined,
  b: null,
  c: 0,
  d: false
};

console.log(JSON.stringify(obj));
// {"b":null,"c":0,"d":false}
// Note: undefined is REMOVED, null is kept!

// In arrays
console.log(JSON.stringify([undefined, null, 0]));
// [null,null,0]
// undefined becomes null in arrays!

// ============================================
// 8. FUNCTION PARAMETERS
// ============================================

function greet(name = 'Guest') {
  // Default parameter only applies to undefined
  console.log(`Hello, ${name}!`);
}

greet();          // "Hello, Guest!" (undefined → default)
greet(undefined); // "Hello, Guest!" (undefined → default)
greet(null);      // "Hello, null!" (null doesn't trigger default!)

// Better: check for nullish
function greetBetter(name) {
  const finalName = name ?? 'Guest';
  console.log(`Hello, ${finalName}!`);
}

greetBetter(null);      // "Hello, Guest!"
greetBetter(undefined); // "Hello, Guest!"
```

<details>
<summary><strong>🔍 Deep Dive: Why typeof null === "object"?</strong></summary>

### The Historical Bug

In the first JavaScript implementation (1995):
- Values were represented as type tag + value
- Type tags: 000 (object), 001 (int), 010 (double), etc.
- `null` was represented as 0x00 (all zeros)
- 0x00 matched the "object" type tag!

```
Binary representation:
null:   00000000 00000000 00000000 00000000
         ^^^
         000 = object type tag!
```

**Why not fixed?**
- Billions of websites rely on this behavior
- Changing it would break `typeof null === "object"` checks
- TC39 proposed fix in 2013, rejected due to backward compatibility

**Workaround:**
```javascript
function isNull(value) {
  return value === null;
}

function isObject(value) {
  return typeof value === 'object' && value !== null;
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Response Handling</strong></summary>

### Production Bug: Confusing null vs undefined

**Scenario:** Your app crashes when parsing API responses.

```javascript
// ❌ BUG: Not handling null properly
function getUserEmail(userId) {
  const response = api.getUser(userId);

  // Assumes email always exists
  return response.user.email.toLowerCase(); // 💥 Crashes!
}

// API returns: { user: { email: null } } when no email
// Or: { user: null } when user not found
```

**Fix: Proper null/undefined checking**
```javascript
// ✅ CORRECT: Handle all cases
function getUserEmail(userId) {
  const response = api.getUser(userId);

  // Check each level
  if (!response?.user?.email) {
    return 'No email available';
  }

  return response.user.email.toLowerCase();
}

// Or with nullish coalescing
function getUserEmail(userId) {
  const response = api.getUser(userId);
  const email = response?.user?.email ?? 'No email';
  return email === 'No email' ? email : email.toLowerCase();
}
```

**Best Practice: Define API contracts**
```typescript
// Use TypeScript to document what can be null
interface User {
  id: string;
  email: string | null;  // Explicitly nullable
  name: string;          // Never null
}

interface ApiResponse {
  user: User | null;  // User might not exist
  error?: string;     // Error is optional
}
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: When to Use Each</strong></summary>

### Decision Matrix

**Use `undefined` when:**
- Variable hasn't been initialized yet
- Optional function parameters
- Letting JavaScript handle defaults
- Property doesn't exist

```javascript
function fetch(url, options) {
  // options is undefined if not passed
  const timeout = options?.timeout ?? 3000;
}
```

**Use `null` when:**
- Explicitly clearing a value
- API contracts (value exists but is empty)
- Garbage collection hints
- End of linked structures

```javascript
class LinkedList {
  constructor() {
    this.head = null; // Explicit: no head yet
  }
}

// Clear expensive object
let bigCache = { /* GB of data */ };
bigCache = null; // Help GC
```

**Use neither (throw error) when:**
- Value is required
- Invalid state
- Programming error

```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero'); // Don't return null!
  }
  return a / b;
}
```

### Performance Impact

**Checking for nullish:**
```javascript
// Fastest (V8 optimized)
if (value == null) { } // Covers both

// Slower (two comparisons)
if (value === null || value === undefined) { }

// Slowest (property access)
if (typeof value === 'undefined') { }
```

</details>

<details>
<summary><strong>💬 Explain to Junior Developer</strong></summary>

"Think of `undefined` as **'I don't know'** and `null` as **'I know there's nothing'**.

**undefined** is like a form field you haven't filled out yet:
```javascript
let phoneNumber; // undefined
// You haven't decided what to put there yet
```

**null** is like writing 'N/A' on the form:
```javascript
let phoneNumber = null; // explicitly no phone
// You KNOW they don't have a phone number
```

**Real-world example:**
```javascript
const person = {
  name: "Alice",
  email: "alice@example.com",
  phone: null,        // Has no phone (we know this!)
  // address: ???     // Undefined (not on object at all)
};

console.log(person.phone);   // null (we know she has no phone)
console.log(person.address); // undefined (we never asked!)
```

**Key difference:**
- `undefined` = **'not set yet'** or **'doesn't exist'**
- `null` = **'intentionally empty'** or **'no value'**
"

</details>

### Common Mistakes

❌ **Mistake 1:** Using `undefined` for intentional absence
```javascript
function findUser(id) {
  if (!userExists(id)) {
    return undefined; // ❌ Unclear intent
  }
  return user;
}
```

✅ **Better:** Use `null` for explicit "not found"
```javascript
function findUser(id) {
  if (!userExists(id)) {
    return null; // ✅ Clear: user doesn't exist
  }
  return user;
}
```

❌ **Mistake 2:** Checking with `==` when you want only `null`
```javascript
if (value == null) {
  // Matches BOTH null AND undefined!
}
```

✅ **Better:** Be explicit when needed
```javascript
if (value === null) {
  // Only matches null
}
```

❌ **Mistake 3:** Forgetting null in default parameters
```javascript
function greet(name = 'Guest') {
  console.log(name);
}
greet(null); // Prints "null" (null doesn't trigger default!)
```

✅ **Better:** Use nullish coalescing
```javascript
function greet(name) {
  const finalName = name ?? 'Guest';
  console.log(finalName);
}
greet(null); // Prints "Guest"
```

### Follow-up Questions

1. "Why does `typeof null` return 'object'?"
2. "When should you use `==` vs `===` with null/undefined?"
3. "How does JSON.stringify handle null vs undefined?"
4. "What is nullish coalescing and how is it different from ||?"
5. "Can you have an undefined property that passes `hasOwnProperty`?"
6. "How do default parameters handle null vs undefined?"

### Resources

- [MDN: null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)
- [MDN: undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [MDN: Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

