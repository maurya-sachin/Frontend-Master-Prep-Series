# Destructuring & Function Parameters

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 1: What is destructuring in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain array and object destructuring. Provide examples of practical use cases.

### Answer

**Destructuring** is a syntax for extracting values from arrays or properties from objects into distinct variables.

1. **Array Destructuring**
   - Extract by position
   - Skip elements with commas
   - Rest operator to collect remaining
   - Default values for missing elements
   - Swap variables easily

2. **Object Destructuring**
   - Extract by property name
   - Rename variables during extraction
   - Default values for missing properties
   - Nested destructuring
   - Rest operator to collect remaining properties

3. **Common Use Cases**
   - Function parameters
   - API response handling
   - Multiple return values
   - Swapping variables
   - Importing specific exports

4. **Benefits**
   - Cleaner code
   - Less repetitive
   - Self-documenting
   - Avoids intermediate variables

5. **Advanced Patterns**
   - Nested destructuring
   - Mixed array/object destructuring
   - Destructuring in loops
   - Dynamic property names

### Code Example

```javascript
// 1. BASIC ARRAY DESTRUCTURING

const numbers = [1, 2, 3, 4, 5];

// Traditional way
const first = numbers[0];
const second = numbers[1];

// Destructuring way
const [a, b, c] = numbers;
console.log(a, b, c); // 1, 2, 3

// Skip elements
const [x, , y] = numbers; // Skip second element
console.log(x, y); // 1, 3

// 2. REST IN ARRAY DESTRUCTURING

const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// Get first and last
const [first, ...middle, last] = [1, 2, 3, 4, 5]; // ❌ SyntaxError!
// Rest must be last

// 3. DEFAULT VALUES IN ARRAYS

const [a = 1, b = 2, c = 3] = [10];
console.log(a, b, c); // 10, 2, 3

const [x = "default"] = [undefined];
console.log(x); // "default" (undefined triggers default)

const [y = "default"] = [null];
console.log(y); // null (null doesn't trigger default!)

// 4. SWAPPING VARIABLES

let a = 1, b = 2;

// Traditional swap
let temp = a;
a = b;
b = temp;

// Destructuring swap (no temp variable!)
[a, b] = [b, a];
console.log(a, b); // 2, 1

// 5. BASIC OBJECT DESTRUCTURING

const user = {
  name: "Alice",
  age: 25,
  city: "Boston"
};

// Traditional way
const name = user.name;
const age = user.age;

// Destructuring way
const { name, age, city } = user;
console.log(name, age, city); // "Alice", 25, "Boston"

// Order doesn't matter!
const { city: c, name: n } = user;
console.log(c, n); // "Boston", "Alice"

// 6. RENAMING DURING DESTRUCTURING

const user = { name: "Alice", age: 25 };

// Rename 'name' to 'username'
const { name: username, age: userAge } = user;
console.log(username, userAge); // "Alice", 25

// Common pattern for avoiding name conflicts
const { name: userName } = user;
const { name: productName } = product;

// 7. DEFAULT VALUES IN OBJECTS

const user = { name: "Alice" };

const { name, age = 18, city = "Unknown" } = user;
console.log(name, age, city); // "Alice", 18, "Unknown"

// With renaming AND defaults
const { name: n, age: a = 18 } = user;
console.log(n, a); // "Alice", 18

// 8. NESTED DESTRUCTURING

const user = {
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Boston",
    coords: {
      lat: 42.3601,
      lng: -71.0589
    }
  }
};

// Nested destructuring
const {
  name,
  address: {
    city,
    coords: { lat, lng }
  }
} = user;

console.log(name, city, lat, lng);
// "Alice", "Boston", 42.3601, -71.0589

// Note: 'address' and 'coords' are NOT variables!
// console.log(address); // ReferenceError

// 9. REST IN OBJECT DESTRUCTURING

const user = {
  name: "Alice",
  age: 25,
  city: "Boston",
  country: "USA",
  email: "alice@example.com"
};

// Extract some, collect rest
const { name, age, ...otherInfo } = user;
console.log(name, age); // "Alice", 25
console.log(otherInfo);
// { city: "Boston", country: "USA", email: "alice@example.com" }

// 10. FUNCTION PARAMETERS

// Traditional
function greet(user) {
  console.log(`Hello, ${user.name}! You are ${user.age} years old.`);
}

// Destructured parameters
function greetBetter({ name, age }) {
  console.log(`Hello, ${name}! You are ${age} years old.`);
}

greetBetter({ name: "Alice", age: 25 });

// With defaults
function createUser({ name = "Guest", age = 18, role = "user" } = {}) {
  return { name, age, role };
}

console.log(createUser()); // { name: "Guest", age: 18, role: "user" }
console.log(createUser({ name: "Alice" })); // { name: "Alice", age: 18, role: "user" }

// 11. MULTIPLE RETURN VALUES

function getCoordinates() {
  return [42.3601, -71.0589];
}

const [latitude, longitude] = getCoordinates();

function getUserInfo() {
  return {
    name: "Alice",
    email: "alice@example.com",
    age: 25
  };
}

const { name, email } = getUserInfo();

// 12. API RESPONSE HANDLING

async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Destructure with defaults
  const {
    name = "Unknown",
    email = "no-email",
    address: {
      city = "Unknown",
      country = "Unknown"
    } = {}
  } = data;

  return { name, email, city, country };
}

// 13. ARRAY OF OBJECTS

const users = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
  { id: 3, name: "Charlie", age: 35 }
];

// Destructure in map
const names = users.map(({ name }) => name);
console.log(names); // ["Alice", "Bob", "Charlie"]

// Destructure in forEach
users.forEach(({ name, age }) => {
  console.log(`${name} is ${age} years old`);
});

// Destructure in for...of
for (const { name, age } of users) {
  console.log(`${name}: ${age}`);
}

// 14. DYNAMIC PROPERTY NAMES

const key = "username";
const { [key]: value } = { username: "alice123" };
console.log(value); // "alice123"

const prop = "email";
const user = { email: "alice@example.com", name: "Alice" };
const { [prop]: emailValue } = user;
console.log(emailValue); // "alice@example.com"

// 15. MIXED ARRAY AND OBJECT DESTRUCTURING

const response = {
  data: {
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ],
    total: 2
  }
};

// Extract first user's name
const {
  data: {
    users: [{ name: firstName }],
    total
  }
} = response;

console.log(firstName, total); // "Alice", 2

// 16. REACT/JSX COMMON PATTERNS

// Component props destructuring
function UserCard({ name, age, avatar, onEdit }) {
  return (
    <div>
      <img src={avatar} />
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// With defaults
function Button({
  text = "Click me",
  onClick = () => {},
  disabled = false,
  ...otherProps
}) {
  return <button onClick={onClick} disabled={disabled} {...otherProps}>{text}</button>;
}

// 17. IMPORTING MODULES

// Named imports (destructuring!)
import { useState, useEffect } from 'react';
import { formatDate, parseDate } from './utils';

// With renaming
import { default as React, Component as ReactComponent } from 'react';

// 18. OBJECT METHOD DESTRUCTURING

const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

const { add, multiply } = calculator;
console.log(add(5, 3));      // 8
console.log(multiply(5, 3)); // 15
```

### Common Mistakes

- ❌ **Mistake:** Forgetting parentheses when destructuring statement
  ```javascript
  let a, b;
  { a, b } = { a: 1, b: 2 }; // ❌ SyntaxError!

  // Correct
  ({ a, b } = { a: 1, b: 2 }); // ✅ OK
  ```

- ❌ **Mistake:** Rest parameter not last
  ```javascript
  const [a, ...rest, b] = [1, 2, 3, 4]; // ❌ SyntaxError!

  // Correct
  const [a, b, ...rest] = [1, 2, 3, 4]; // ✅ OK
  ```

- ✅ **Correct:** Use destructuring for cleaner code
  ```javascript
  // Extract what you need
  const { name, email } = user;

  // Use defaults for safety
  const { age = 18, city = "Unknown" } = user;

  // Rest for remaining properties
  const { id, ...userData } = user;
  ```

<details>
<summary><strong>🔍 Deep Dive: How Destructuring Works Internally</strong></summary>

**Transpilation to ES5:**

```javascript
// Your ES6 code:
const { name, age } = user;

// Babel transpiles to ES5:
var _user = user,
    name = _user.name,
    age = _user.age;

// With defaults:
const { name = "Guest", age = 18 } = user;

// Transpiles to:
var _user = user,
    _user$name = _user.name,
    name = _user$name === undefined ? "Guest" : _user$name,
    _user$age = _user.age,
    age = _user$age === undefined ? 18 : _user$age;
```

**Why undefined triggers defaults, but null doesn't:**

```javascript
// Internal check is effectively:
function getValueWithDefault(value, defaultValue) {
  return value === undefined ? defaultValue : value;
}

const { age = 18 } = user;
// Is equivalent to:
const age = user.age === undefined ? 18 : user.age;

// Examples:
{ age = 18 } = { age: undefined }; // age = 18 (triggered)
{ age = 18 } = { age: null };      // age = null (NOT triggered)
{ age = 18 } = { age: 0 };         // age = 0 (NOT triggered)
{ age = 18 } = { age: false };     // age = false (NOT triggered)
{ age = 18 } = { age: "" };        // age = "" (NOT triggered)

// Only undefined triggers default!
```

**Iterator Protocol for Array Destructuring:**

```javascript
// Array destructuring uses the iterator protocol
const [a, b, c] = [1, 2, 3];

// Internal algorithm (simplified):
function destructureArray(iterable, pattern) {
  const iterator = iterable[Symbol.iterator]();
  const results = [];

  for (let i = 0; i < pattern.length; i++) {
    const { value, done } = iterator.next();
    results[i] = done ? undefined : value;
  }

  return results;
}

// This means you can destructure ANY iterable:
const [x, y, z] = "abc"; // Works! x="a", y="b", z="c"
const [first] = new Set([1, 2, 3]); // first = 1
const [a, b] = new Map([["key1", "val1"], ["key2", "val2"]]);
// a = ["key1", "val1"], b = ["key2", "val2"]

// Custom iterator example:
const fib = {
  [Symbol.iterator]() {
    let a = 0, b = 1;
    return {
      next() {
        [a, b] = [b, a + b];
        return { value: a, done: false };
      }
    };
  }
};

const [first, second, third] = fib; // 1, 1, 2 (Fibonacci!)
```

**Performance: Destructuring vs Direct Access:**

```javascript
// Benchmark: 1 million iterations

// Test 1: Direct property access
console.time('direct');
for (let i = 0; i < 1000000; i++) {
  const user = { name: "Alice", age: 25, city: "Boston" };
  const name = user.name;
  const age = user.age;
  const city = user.city;
}
console.timeEnd('direct'); // ~45ms

// Test 2: Destructuring
console.time('destructuring');
for (let i = 0; i < 1000000; i++) {
  const user = { name: "Alice", age: 25, city: "Boston" };
  const { name, age, city } = user;
}
console.timeEnd('destructuring'); // ~47ms

// Test 3: Nested destructuring
console.time('nested-destructuring');
for (let i = 0; i < 1000000; i++) {
  const user = {
    name: "Alice",
    address: { city: "Boston", zip: "02101" }
  };
  const { address: { city, zip } } = user;
}
console.timeEnd('nested-destructuring'); // ~52ms

// Destructuring is ~4-10% slower
// But: Readability benefit usually outweighs tiny performance cost
// And: Modern JS engines optimize destructuring well
```

**TurboFan Optimization:**

```javascript
// V8's TurboFan can optimize destructuring patterns

// Cold (first few calls):
function extractUser(user) {
  const { name, age, city } = user;
  return { name, age, city };
}

// After ~10,000 calls, TurboFan optimizes:
// 1. Inlines property access
// 2. Skips intermediate object creation
// 3. Maps directly to memory offsets

// Hot function performance approaches direct access speed
```

**Nested Destructuring Variable Lifetime:**

```javascript
// Important: Intermediate objects are NOT variables!

const user = {
  name: "Alice",
  address: {
    city: "Boston",
    coords: { lat: 42, lng: -71 }
  }
};

// Nested destructuring
const {
  name,
  address: {
    city,
    coords: { lat, lng }
  }
} = user;

// Variables created: name, city, lat, lng
// Variables NOT created: address, coords

console.log(name);    // "Alice"
console.log(city);    // "Boston"
console.log(address); // ReferenceError: address is not defined!

// If you need intermediate objects:
const {
  name,
  address,
  address: {
    city,
    coords,
    coords: { lat, lng }
  }
} = user;

// Now all are variables: name, address, city, coords, lat, lng
```

**Rest Operator Implementation:**

```javascript
// Object rest uses Object.assign-like behavior
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };

// Transpiles to:
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  const target = {};
  const sourceKeys = Object.keys(source);

  for (const key of sourceKeys) {
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

const a = source.a;
const b = source.b;
const rest = _objectWithoutProperties(source, ["a", "b"]);

// Note: Only enumerable own properties are copied
// Symbols and non-enumerable properties are NOT included
```

**Memory Implications:**

```javascript
// ✅ GOOD: Destructure only what you need
async function processUser(userId) {
  const user = await fetchUserWithEverything(userId); // 10MB object!

  const { id, name } = user; // Extract what you need (100 bytes)

  // user object can now be garbage collected
  return processUserData({ id, name });
}

// ❌ BAD: Keeping entire object
async function processUserBad(userId) {
  const user = await fetchUserWithEverything(userId); // 10MB

  return processUserData(user); // Holds 10MB in memory unnecessarily
}

// Memory: processUser uses 100 bytes vs processUserBad uses 10MB
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: React Props Destructuring Bug</strong></summary>

**Scenario:** Your React component crashes in production with "Cannot read property 'name' of undefined." The issue only happens when certain users navigate to the profile page. Investigation reveals the problem is in how props are destructured.

**The Problem:**

```javascript
// ❌ UNSAFE: Crashes if user is undefined
function UserProfile({ user: { name, email, avatar } }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h1>{name}</h1>
      <p>{email}</p>
    </div>
  );
}

// When component receives:
<UserProfile user={undefined} />

// Error: Cannot read properties of undefined (reading 'name')
// Because trying to destructure undefined crashes!

// Production scenario:
// - API sometimes returns null user (deleted account)
// - Race condition: user prop updates from loading → null
// - Component crashes, entire app white screen

// Error logs:
// TypeError: Cannot destructure property 'name' of 'undefined' as it is undefined
// at UserProfile (UserProfile.jsx:5)
// Frequency: 0.5% of profile page views (~500 crashes/day)
```

**Debugging:**

```javascript
// Step 1: Identify the pattern
console.log("Props received:", props);
// Sometimes shows: { user: undefined }
// Sometimes shows: { user: null }

// Step 2: Check when it happens
// - User deleted their account but URL still accessible
// - API returns { success: false, user: null }
// - Loading state transitions incorrectly

// Step 3: Reproduce
function TestCase() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Simulate API that returns null
    setTimeout(() => setUser(null), 100);
  }, []);

  return <UserProfile user={user} />; // Crashes!
}
```

**Solution 1: Default Value in Destructuring:**

```javascript
// ✅ FIX: Provide default object
function UserProfile({ user = {} }) {
  const { name = "Unknown", email = "N/A", avatar = "/default-avatar.png" } = user;

  return (
    <div>
      <img src={avatar} alt={name} />
      <h1>{name}</h1>
      <p>{email}</p>
    </div>
  );
}

// Now handles:
// - user = undefined → uses defaults
// - user = null → null doesn't trigger default, but spread still works
// - user = {} → uses property defaults
// - user = { name: "Alice" } → uses actual values + property defaults

// Result: No crashes!
```

**Solution 2: Nested Default:**

```javascript
// ✅ BETTER: Default for parameter AND properties
function UserProfile({
  user: {
    name = "Unknown User",
    email = "noemail@example.com",
    avatar = "/default-avatar.png"
  } = {}
} = {}) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h1>{name}</h1>
      <p>{email}</p>
    </div>
  );
}

// Handles all cases:
<UserProfile />                           // Works (no props)
<UserProfile user={undefined} />          // Works (undefined user)
<UserProfile user={null} />               // Works (null user)
<UserProfile user={{}} />                 // Works (empty object)
<UserProfile user={{ name: "Alice" }} />  // Works (partial data)
```

**Solution 3: Guard Clause with Early Return:**

```javascript
// ✅ BEST: Explicit null check with better UX
function UserProfile({ user }) {
  // Guard clause
  if (!user) {
    return (
      <div className="empty-state">
        <p>User not found</p>
        <Link to="/users">Back to users</Link>
      </div>
    );
  }

  // Safe to destructure now
  const { name, email, avatar } = user;

  return (
    <div>
      <img src={avatar} alt={name} />
      <h1>{name}</h1>
      <p>{email}</p>
    </div>
  );
}

// Better UX: Shows meaningful message instead of default values
```

**Real Production Metrics:**

```javascript
// Before fix (nested destructuring crash):
// - Crashes: 500/day (0.5% of profile views)
// - User complaints: 15/week
// - Error reports: "Can't see user profile"
// - Bounce rate: 35% after crash
// - Revenue loss: ~$5k/month (users leaving after crash)

// After fix (Solution 3: Guard clause):
// - Crashes: 0/day
// - User complaints: 2/week (unrelated)
// - Better UX: Shows "User not found" instead of crash
// - Bounce rate: 8% (normal)
// - User satisfaction: +92%
// - Revenue recovered: $5k/month
```

**Complex Example: API Response Destructuring:**

```javascript
// Real-world API response structure:
const apiResponse = {
  success: true,
  data: {
    user: {
      id: 1,
      profile: {
        name: "Alice",
        contact: {
          email: "alice@example.com",
          phone: null // Phone might be null!
        }
      },
      settings: {
        // Settings might be missing entirely
      }
    }
  }
};

// ❌ UNSAFE: Will crash if structure is different
const {
  data: {
    user: {
      profile: {
        name,
        contact: { email, phone }
      },
      settings: { theme, notifications }
    }
  }
} = apiResponse;
// Error if settings is undefined!

// ✅ SAFE: Defensive destructuring with defaults
const {
  success = false,
  data: {
    user: {
      profile: {
        name = "Unknown",
        contact: {
          email = "no-email",
          phone = null
        } = {}
      } = {},
      settings: {
        theme = "light",
        notifications = true
      } = {}
    } = {}
  } = {}
} = apiResponse || {};

// Handles:
// - apiResponse is null/undefined
// - Any nested property is missing
// - Any nested property is null
// Never crashes!
```

**TypeScript Integration:**

```typescript
// TypeScript + destructuring defaults
interface User {
  name: string;
  email?: string;
  age?: number;
}

function UserCard({
  user: {
    name,
    email = "noemail@example.com",
    age = 0
  } = {} as User
}: {
  user?: User
}) {
  return <div>{name} - {email}</div>;
}

// TypeScript catches issues at compile time
// Runtime defaults handle edge cases
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Destructuring Patterns</strong></summary>

**1. Direct Access vs Destructuring:**

```javascript
// Pattern 1: Direct property access
function displayUser(user) {
  console.log(user.name);
  console.log(user.age);
  console.log(user.city);
}

// Pattern 2: Destructuring
function displayUserDestructured(user) {
  const { name, age, city } = user;
  console.log(name);
  console.log(age);
  console.log(city);
}
```

| Aspect | Direct Access | Destructuring |
|--------|--------------|---------------|
| **Readability** | ⚠️ Repetitive (`user.` repeated) | ✅ Clean |
| **Performance** | ✅ Slightly faster (~2-5%) | ⚠️ Minimal overhead |
| **Null safety** | ⚠️ Crashes on null | ⚠️ Crashes on null (unless defaults) |
| **Auto-complete** | ✅ Works well | ✅ Works well |
| **One property** | ✅ Better | ❌ Overkill |
| **Many properties** | ❌ Verbose | ✅ Much better |

**When to use each:**
- Use direct access for 1-2 properties
- Use destructuring for 3+ properties or function parameters

**2. Parameter Destructuring vs Regular Parameters:**

```javascript
// Pattern 1: Regular parameters
function createUser(name, age, email, city, country) {
  return { name, age, email, city, country };
}

createUser("Alice", 25, "alice@example.com", "Boston", "USA");
// Hard to remember order!

// Pattern 2: Object parameter with destructuring
function createUserBetter({ name, age, email, city, country }) {
  return { name, age, email, city, country };
}

createUserBetter({
  name: "Alice",
  email: "alice@example.com", // Order doesn't matter
  age: 25,
  city: "Boston",
  country: "USA"
});
```

| Aspect | Regular Parameters | Object Destructuring |
|--------|-------------------|---------------------|
| **Order matters** | ❌ Yes | ✅ No |
| **Easy to add params** | ❌ Breaks callers | ✅ Backward compatible |
| **Self-documenting** | ❌ Need to check signature | ✅ Property names clear |
| **Performance** | ✅ Slightly faster | ⚠️ Minimal overhead |
| **TypeScript** | ✅ Good | ✅ Excellent |
| **Best for** | 1-3 simple params | 3+ params or optional params |

**3. Nested Destructuring vs Flat Access:**

```javascript
// Pattern 1: Nested destructuring
const {
  user: {
    profile: {
      name,
      address: { city, zip }
    }
  }
} = response;

// Pattern 2: Flat access
const user = response.user;
const profile = user.profile;
const name = profile.name;
const city = profile.address.city;
const zip = profile.address.zip;
```

| Aspect | Nested Destructuring | Flat Access |
|--------|---------------------|-------------|
| **Conciseness** | ✅ Very concise | ❌ Verbose |
| **Readability** | ⚠️ Can be confusing | ✅ Clear |
| **Null safety** | ❌ Crashes deep | ⚠️ Crashes but controllable |
| **Debugging** | ❌ Harder to debug | ✅ Easy to debug |
| **Intermediate values** | ❌ Lost | ✅ Available |

**Best practice:**
- Max 2-3 levels of nesting
- Use optional chaining for deep access: `response?.user?.profile?.name`
- Flat access for complex nested structures

**4. Destructuring with Defaults vs Nullish Coalescing:**

```javascript
// Pattern 1: Destructuring defaults
function greet({ name = "Guest", greeting = "Hello" } = {}) {
  return `${greeting}, ${name}!`;
}

// Pattern 2: Nullish coalescing
function greetNullish({ name, greeting } = {}) {
  const finalName = name ?? "Guest";
  const finalGreeting = greeting ?? "Hello";
  return `${finalGreeting}, ${finalName}!`;
}
```

| Aspect | Destructuring Defaults | Nullish Coalescing |
|--------|----------------------|-------------------|
| **Handles undefined** | ✅ Yes | ✅ Yes |
| **Handles null** | ❌ No | ✅ Yes |
| **Readability** | ✅ Concise | ⚠️ More code |
| **Flexibility** | ⚠️ At parameter level | ✅ Can use anywhere |
| **Conditional defaults** | ❌ No | ✅ Yes |

```javascript
// Example: Sometimes null should use default, sometimes not
function process({ value, fallback = "default" } = {}) {
  // Destructuring: null doesn't trigger default
  return value ?? fallback; // Nullish coalescing handles null
}

process({ value: undefined }); // "default" (undefined)
process({ value: null });      // "default" (null treated as missing)
process({ value: 0 });         // 0 (valid value)
```

**5. Array Destructuring vs Array Methods:**

```javascript
// Pattern 1: Array destructuring
const [first, second, third] = array;

// Pattern 2: Array methods
const first = array[0];
const second = array[1];
const third = array[2];

// Pattern 3: Array methods with checks
const first = array.at(0);
const second = array.at(1);
const third = array.at(2);
```

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **First few items** | Destructuring | Cleaner |
| **Specific index** | Direct access `[i]` | Clearer intent |
| **Last item** | `.at(-1)` | Better than `[length-1]` |
| **Swap variables** | Destructuring `[a,b]=[b,a]` | No temp variable |
| **Rest of array** | Destructuring with rest | One line |

**6. Rest Operator Placement:**

```javascript
// Collect remaining properties
const { name, age, ...rest } = user;
// rest = { city, country, email, ... }

// vs keeping specific properties
const { name, age } = user;
const filteredUser = { name, age };

// When to use rest:
// ✅ Removing properties (spreading to child components)
// ✅ Logging (want to see "everything else")
// ✅ Forwarding unknown props

// When NOT to use rest:
// ❌ If you only need specific props (extract them explicitly)
// ❌ If you need to validate props (rest bypasses validation)
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Destructuring Simplified</strong></summary>

**Simple Analogy: Unpacking a Delivery Box**

Regular way = Take out each item separately:
```javascript
// You have a box (object)
const box = {
  phone: "iPhone",
  laptop: "MacBook",
  tablet: "iPad"
};

// Old way: Take out one by one
const phone = box.phone;     // Reach in, grab phone
const laptop = box.laptop;   // Reach in, grab laptop
const tablet = box.tablet;   // Reach in, grab tablet
```

Destructuring = Unpack everything at once:
```javascript
// New way: Unpack all at once!
const { phone, laptop, tablet } = box;

// Now you have: phone, laptop, tablet as separate variables
// Much faster and cleaner!
```

**Array Destructuring: Taking Items by Position**

```javascript
// Like numbered lockers:
const lockers = ["backpack", "lunchbox", "jacket"];

// Old way: Open each locker
const locker1 = lockers[0]; // "backpack"
const locker2 = lockers[1]; // "lunchbox"
const locker3 = lockers[2]; // "jacket"

// New way: Grab all at once!
const [item1, item2, item3] = lockers;
console.log(item1); // "backpack"
console.log(item2); // "lunchbox"
console.log(item3); // "jacket"

// Skip items you don't want
const [first, , third] = lockers; // Skip lunchbox
console.log(first);  // "backpack"
console.log(third);  // "jacket"
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Wrong syntax with existing variables
let a, b;
{ a, b } = { a: 1, b: 2 }; // SyntaxError!

// Right: Wrap in parentheses
({ a, b } = { a: 1, b: 2 }); // ✅ Works!

// Or declare with const/let
const { a, b } = { a: 1, b: 2 }; // ✅ Works!


// ❌ MISTAKE 2: Expecting null to use defaults
const { name = "Guest" } = { name: null };
console.log(name); // null (NOT "Guest"!)

// Only undefined triggers defaults
const { age = 18 } = { age: undefined };
console.log(age); // 18 ✅

const { city = "Boston" } = {};
console.log(city); // "Boston" ✅ (missing property = undefined)


// ❌ MISTAKE 3: Rest not last
const [first, ...middle, last] = [1, 2, 3, 4]; // SyntaxError!

// Right: Rest must be last
const [first, second, ...rest] = [1, 2, 3, 4]; // ✅ Works!
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4]
```

**Explaining to PM:**

"Destructuring is like having a smart assistant unpack things for you:

**Without destructuring:**
- You get a package with 10 items
- You manually take out each item one by one: 'Give me the name', 'Give me the age', 'Give me the email'...
- Takes 10 lines of code
- Repetitive and boring

**With destructuring:**
- You say: 'Unpack name, age, and email for me'
- Assistant unpacks all three at once
- Takes 1 line of code
- Much faster to write

**Business value:**
- Developers write code 50% faster
- Easier to read and maintain
- Fewer bugs from typos (`user.naem` vs destructured `name`)
- Industry standard (all modern codebases use it)"

**Visual Example: React Component**

```javascript
// ❌ OLD WAY: Repetitive
function UserCard(props) {
  return (
    <div>
      <h1>{props.name}</h1>
      <p>Age: {props.age}</p>
      <p>City: {props.city}</p>
      <p>Email: {props.email}</p>
    </div>
  );
}
// Write "props." 4 times - annoying!

// ✅ NEW WAY: Clean with destructuring
function UserCard({ name, age, city, email }) {
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
      <p>City: {city}</p>
      <p>Email: {email}</p>
    </div>
  );
}
// Much cleaner, instantly see what props are used
```

**Practical Exercise:**

```javascript
// Challenge: Extract user data from API response

const apiResponse = {
  success: true,
  data: {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    address: {
      city: "Boston",
      zip: "02101"
    }
  }
};

// Task 1: Extract name and email
// Old way:
const name = apiResponse.data.name;
const email = apiResponse.data.email;

// Your turn: Use destructuring! (Scroll down for answer)
//
//
//
// Answer:
const { data: { name, email } } = apiResponse;


// Task 2: Extract city and zip from address
// Your turn: Use nested destructuring! (Scroll down for answer)
//
//
//
// Answer:
const {
  data: {
    address: { city, zip }
  }
} = apiResponse;


// Task 3: Swap two variables
let x = 5;
let y = 10;

// Old way:
let temp = x;
x = y;
y = temp;

// Your turn: Use destructuring! (Scroll down for answer)
//
//
//
// Answer:
[x, y] = [y, x];
console.log(x, y); // 10, 5
```

**Key Rules for Juniors:**

1. **Object destructuring** uses `{ }` and matches property names
   ```javascript
   const { name, age } = user;
   ```

2. **Array destructuring** uses `[ ]` and matches by position
   ```javascript
   const [first, second] = array;
   ```

3. **Default values** use `=`
   ```javascript
   const { name = "Guest", age = 18 } = user;
   ```

4. **Rest operator** collects remaining items (must be last)
   ```javascript
   const [first, ...rest] = [1, 2, 3, 4];
   // first = 1, rest = [2, 3, 4]
   ```

5. **Renaming** uses `:` in objects
   ```javascript
   const { name: userName } = user;
   // Creates variable called userName (not name)
   ```

</details>

### Follow-up Questions

- "How do you swap variables using destructuring?"
- "Can you use default values with destructuring?"
- "What is the difference between `undefined` and `null` in destructuring?"
- "How does destructuring work with nested objects?"
- "Can you rename variables during destructuring?"

### Resources

- [MDN: Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [JavaScript.info: Destructuring](https://javascript.info/destructuring-assignment)
- [ES6 Destructuring](https://www.freecodecamp.org/news/destructuring-in-javascript/)

---

## Question 2: What are rest parameters in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain rest parameters (`...args`). How are they different from the `arguments` object?

### Answer

**Rest parameters** collect all remaining arguments into a real array using `...` syntax.

1. **What Rest Does**
   - Collects multiple arguments into array
   - Must be last parameter
   - Creates real Array (not array-like)
   - Named parameter (unlike arguments)

2. **Rest vs Arguments**
   - Rest is real array (has array methods)
   - Arguments is array-like object
   - Rest only collects remaining args
   - Arguments collects all args

3. **Common Use Cases**
   - Variable number of arguments
   - Wrapper functions
   - Flexible APIs
   - Collecting array elements

4. **Benefits**
   - Cleaner than arguments
   - Works with arrow functions
   - Real array (map, filter, reduce)
   - Better parameter names

5. **Limitations**
   - Must be last parameter
   - Can only have one rest parameter
   - Doesn't include named parameters

### Code Example

```javascript
// 1. BASIC REST PARAMETERS

function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(sum()); // 0 (empty array)

// 2. REST WITH NAMED PARAMETERS

function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

console.log(greet("Hello", "Alice")); // "Hello, Alice!"
console.log(greet("Hi", "Bob", "Charlie")); // "Hi, Bob and Charlie!"
console.log(greet("Hey", "Alice", "Bob", "Charlie"));
// "Hey, Alice and Bob and Charlie!"

// 3. REST VS ARGUMENTS

// Old way: arguments object
function oldSum() {
  // arguments is array-like, not real array
  console.log(Array.isArray(arguments)); // false

  // Need to convert to array
  const args = Array.from(arguments);
  return args.reduce((total, num) => total + num, 0);
}

// Modern way: rest parameters
function modernSum(...numbers) {
  console.log(Array.isArray(numbers)); // true (real array!)
  return numbers.reduce((total, num) => total + num, 0);
}

// 4. REST MUST BE LAST

function example(first, ...rest, last) {
  // ❌ SyntaxError! Rest must be last parameter
}

function correct(first, second, ...rest) {
  // ✅ OK
  console.log(first);  // First arg
  console.log(second); // Second arg
  console.log(rest);   // Array of remaining args
}

correct(1, 2, 3, 4, 5);
// first: 1
// second: 2
// rest: [3, 4, 5]

// 5. REST IN ARROW FUNCTIONS

// ❌ arguments doesn't work in arrow functions
const arrowSum1 = () => {
  return arguments.reduce((a, b) => a + b); // ReferenceError!
};

// ✅ Rest parameters work perfectly
const arrowSum2 = (...numbers) => {
  return numbers.reduce((a, b) => a + b, 0);
};

console.log(arrowSum2(1, 2, 3, 4)); // 10

// 6. WRAPPER FUNCTIONS

function logAndExecute(fn, ...args) {
  console.log(`Calling function with args:`, args);
  return fn(...args); // Spread args back out
}

function add(a, b) {
  return a + b;
}

console.log(logAndExecute(add, 5, 3));
// Calling function with args: [5, 3]
// 8

// 7. ARRAY METHODS WITH REST

function findMax(...numbers) {
  return Math.max(...numbers);
}

function average(...numbers) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function sortNumbers(...numbers) {
  return numbers.sort((a, b) => a - b);
}

console.log(findMax(5, 2, 9, 1)); // 9
console.log(average(1, 2, 3, 4)); // 2.5
console.log(sortNumbers(5, 2, 9, 1)); // [1, 2, 5, 9]

// 8. REST IN DESTRUCTURING

const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5]

const { name, age, ...otherProps } = {
  name: "Alice",
  age: 25,
  city: "Boston",
  email: "alice@example.com"
};

console.log(name);  // "Alice"
console.log(age);   // 25
console.log(otherProps); // { city: "Boston", email: "alice@example.com" }

// 9. PRACTICAL - FLEXIBLE API

class Calculator {
  add(...numbers) {
    return numbers.reduce((sum, n) => sum + n, 0);
  }

  multiply(...numbers) {
    return numbers.reduce((product, n) => product * n, 1);
  }
}

const calc = new Calculator();
console.log(calc.add(1, 2));           // 3
console.log(calc.add(1, 2, 3, 4, 5));  // 15
console.log(calc.multiply(2, 3, 4));   // 24

// 10. REST WITH DEFAULTS

function createUser(name, role = "user", ...permissions) {
  return {
    name,
    role,
    permissions
  };
}

console.log(createUser("Alice"));
// { name: "Alice", role: "user", permissions: [] }

console.log(createUser("Bob", "admin", "read", "write", "delete"));
// { name: "Bob", role: "admin", permissions: ["read", "write", "delete"] }
```

### Common Mistakes

- ❌ **Mistake:** Rest not last parameter
  ```javascript
  function wrong(...rest, last) { } // SyntaxError!
  ```

- ❌ **Mistake:** Multiple rest parameters
  ```javascript
  function wrong(...args1, ...args2) { } // SyntaxError!
  ```

- ✅ **Correct:** Rest as last parameter, spread when calling
  ```javascript
  function collect(first, ...rest) {
    // rest collects remaining args into array
  }

  function spread(a, b, c) {
    // ...
  }

  const args = [1, 2, 3];
  spread(...args); // spread expands array into args
  ```

### Follow-up Questions

- "What is the difference between rest parameters and the arguments object?"
- "Can you use rest parameters in arrow functions?"
- "Can rest parameters be combined with default parameters?"
- "What is the difference between rest and spread operators?"

### Resources

- [MDN: Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [JavaScript.info: Rest Parameters](https://javascript.info/rest-parameters-spread)

<details>
<summary><strong>🔍 Deep Dive: Rest Parameters Implementation</strong></summary>

**How V8 Compiles Rest Parameters:**

```javascript
// Your code:
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// V8 creates array from arguments:
function sum() {
  const numbers = Array.prototype.slice.call(arguments, 0);
  return numbers.reduce((a, b) => a + b, 0);
}

// Modern optimization (faster):
function sum() {
  const numbers = new Array(arguments.length);
  for (let i = 0; i < arguments.length; i++) {
    numbers[i] = arguments[i];
  }
  return numbers.reduce((a, b) => a + b, 0);
}
```

**Performance: Rest vs Arguments:**

```javascript
// Benchmark: 1 million calls
const iterations = 1000000;

// Test 1: arguments object
function sumArgs() {
  let sum = 0;
  for (let i = 0; i < arguments.length; i++) {
    sum += arguments[i];
  }
  return sum;
}

console.time('arguments');
for (let i = 0; i < iterations; i++) {
  sumArgs(1, 2, 3, 4, 5);
}
console.timeEnd('arguments'); // ~50ms

// Test 2: rest parameters
function sumRest(...nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum;
}

console.time('rest');
for (let i = 0; i < iterations; i++) {
  sumRest(1, 2, 3, 4, 5);
}
console.timeEnd('rest'); // ~55ms

// Rest is ~10% slower due to array creation overhead
// But: Better readability and arrow function compatibility
```

**Memory Impact:**

```javascript
// arguments object: No allocation (built-in)
function withArguments() {
  return arguments; // Just returns reference
}

// Rest parameters: Allocates new array
function withRest(...args) {
  return args; // Creates new array in memory
}

// Memory cost per call:
// arguments: 0 bytes (reference only)
// rest: 40-80 bytes (array object + backing store)

// When it matters:
// Hot paths called millions of times → use arguments
// Everywhere else → use rest (readability wins)
```

</details>

<details>
<parameter name="🐛 Real-World Scenario: Logger Function Bug</strong></summary>

**Scenario:** Your logging utility isn't capturing all arguments in production, causing incomplete error reports.

**The Problem:**

```javascript
// ❌ BUG: Using arguments in arrow function
const logger = {
  level: 'INFO',

  log: () => {
    // Arrow function doesn't have 'arguments'!
    const message = Array.from(arguments).join(' ');
    console.log(`[${this.level}]`, message);
    // ReferenceError: arguments is not defined
  }
};

logger.log('User', 'logged', 'in'); // Crashes!

// Production impact:
// - Error tracking broken
// - Can't debug customer issues
// - Missing critical log data
```

**Debugging:**

```javascript
// Step 1: Reproduce locally
const logger = {
  level: 'INFO',
  log: () => {
    try {
      console.log(arguments); // Check if arguments exists
    } catch (e) {
      console.error('Error:', e.message);
      // "arguments is not defined"
    }
  }
};

// Step 2: Check function type
console.log(logger.log.toString());
// "() => { ... }" - Arrow function! That's the problem

// Arrow functions don't have arguments object
```

**Solution 1: Use Rest Parameters:**

```javascript
// ✅ FIX: Rest parameters work in arrow functions
const logger = {
  level: 'INFO',

  log: (...messages) => {
    const message = messages.join(' ');
    console.log(`[INFO]`, message);
  }
};

logger.log('User', 'logged', 'in'); // Works! ✅
// Output: [INFO] User logged in
```

**Solution 2: Use Regular Function:**

```javascript
// ✅ ALTERNATIVE: Regular function with arguments
const logger = {
  level: 'INFO',

  log: function(...messages) {
    // Can also access 'this' correctly now
    const message = messages.join(' ');
    console.log(`[${this.level}]`, message);
  }
};

logger.log('User', 'logged', 'in');
// Output: [INFO] User logged in
```

**Production Logger with Features:**

```javascript
// ✅ PRODUCTION-READY: Full-featured logger
class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  #formatMessage(level, ...messages) {
    const timestamp = new Date().toISOString();
    const formattedMessages = messages.map(msg =>
      typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
    );

    return `[${timestamp}] [${this.serviceName}] [${level}] ${formattedMessages.join(' ')}`;
  }

  info(...messages) {
    console.log(this.#formatMessage('INFO', ...messages));
  }

  error(...messages) {
    console.error(this.#formatMessage('ERROR', ...messages));

    // Send to error tracking service
    this.#sendToErrorTracking('ERROR', messages);
  }

  warn(...messages) {
    console.warn(this.#formatMessage('WARN', ...messages));
  }

  debug(...messages) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.#formatMessage('DEBUG', ...messages));
    }
  }

  #sendToErrorTracking(level, messages) {
    // Send to Sentry, DataDog, etc.
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({
        level,
        service: this.serviceName,
        messages,
        timestamp: Date.now()
      })
    });
  }
}

// Usage:
const logger = new Logger('UserService');

logger.info('User logged in', { userId: 123, email: 'user@example.com' });
// [2025-11-13T10:00:00.000Z] [UserService] [INFO] User logged in {"userId":123,"email":"user@example.com"}

logger.error('Payment failed', { orderId: 456, amount: 99.99, error: 'Card declined' });
// Logs + sends to error tracking
```

**Real Metrics After Fix:**

```javascript
// Before (broken arrow function logger):
// - Error reports: 45% incomplete (missing context)
// - Time to debug: 4 hours average
// - Customer complaints: 25/week about unclear errors

// After (rest parameters logger):
// - Error reports: 100% complete with full context
// - Time to debug: 45 minutes average (5x faster)
// - Customer complaints: 3/week
// - Developer productivity: +60%
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Rest Parameters vs Arguments</strong></summary>

### Comparison Matrix

| Aspect | arguments | Rest Parameters |
|--------|-----------|-----------------|
| **Type** | Array-like object | Real Array |
| **Methods** | None (length only) | All array methods |
| **Arrow functions** | ❌ Not available | ✅ Works |
| **Performance** | ✅ Faster (~10%) | ⚠️ Slightly slower |
| **Memory** | ✅ No allocation | ❌ Allocates array |
| **Readability** | ⚠️ Unclear | ✅ Self-documenting |
| **Named params** | ⚠️ Includes all | ✅ Only remaining |
| **Modern code** | ❌ Avoid | ✅ Preferred |

### When to Use arguments

```javascript
// ✅ Use arguments when:
// 1. Hot path performance-critical code
function hotPath() {
  // Called millions of times
  let sum = 0;
  for (let i = 0; i < arguments.length; i++) {
    sum += arguments[i];
  }
  return sum;
}

// 2. Legacy code maintenance (don't rewrite)
// 3. Need to access all parameters including named ones
function legacy(a, b, c) {
  console.log(arguments[0], arguments[1], arguments[2]);
  // Gets a, b, c even though named
}
```

### When to Use Rest Parameters

```javascript
// ✅ Use rest parameters when:
// 1. Arrow functions (no choice - arguments doesn't exist)
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);

// 2. Need array methods
function multiply(...numbers) {
  return numbers.reduce((a, b) => a * b, 1); // Array method!
}

// 3. Want readable, self-documenting code
function createUser(name, email, ...roles) {
  // Clear: roles is array of remaining args
  return { name, email, roles };
}

// 4. Modern codebases (ES6+)
// 5. TypeScript projects (better type inference)
```

### Hybrid Approach

```javascript
// Use both when appropriate
class MathUtils {
  // Rest for public API (readability)
  static sum(...numbers) {
    return this.#sumInternal(...numbers);
  }

  // arguments for internal hot path (performance)
  static #sumInternal() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
      total += arguments[i];
    }
    return total;
  }
}

// Public API: clean and modern
MathUtils.sum(1, 2, 3, 4, 5);

// Internal: optimized for performance
```

</details>

<details>
<summary><strong>💬 Explain to Junior: Rest Parameters Simplified</strong></summary>

**Simple Analogy: Collecting Leftover Items**

Think of function parameters like a **buffet line**:

```javascript
function serveMeal(mainDish, sideDish, ...extras) {
  console.log('Main:', mainDish);    // "Steak"
  console.log('Side:', sideDish);    // "Fries"
  console.log('Extras:', extras);    // ["Salad", "Soup", "Bread"]
}

serveMeal("Steak", "Fries", "Salad", "Soup", "Bread");
```

- **Named parameters** (`mainDish`, `sideDish`): Reserved spots on your tray
- **Rest parameter** (`...extras`): Bag for everything else you grab

**Why It's Useful:**

```javascript
// Without rest - have to know exact count
function oldAdd(a, b, c, d, e) {
  return a + b + c + d + e;
}
oldAdd(1, 2); // NaN (c, d, e are undefined!)

// With rest - works with any number
function newAdd(...numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}
newAdd(1, 2);           // 3
newAdd(1, 2, 3, 4, 5);  // 15
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Rest not last
function wrong(...allArgs, last) {
  // SyntaxError: Rest parameter must be last
}

// ✅ Correct:
function correct(first, ...allTheRest) {
  // Works! Rest collects everything after 'first'
}


// ❌ MISTAKE 2: Multiple rest parameters
function wrong(...args1, ...args2) {
  // SyntaxError: Only one rest parameter allowed
}

// ✅ Correct: Use one rest, then process it
function correct(...allArgs) {
  const firstHalf = allArgs.slice(0, allArgs.length / 2);
  const secondHalf = allArgs.slice(allArgs.length / 2);
}


// ❌ MISTAKE 3: Confusing rest vs spread
function func(...args) {
  console.log(args); // args is array
}

const numbers = [1, 2, 3];
func(numbers);  // [[1,2,3]] - passes array as single argument
func(...numbers); // [1,2,3] - spreads array into separate arguments
```

**Explaining to PM:**

"Rest parameters are like a shopping cart for function arguments.

**Without rest parameters:**
- Function is like a fixed number of shopping bags
- If you have more items than bags, tough luck!
- If you have fewer items, empty bags are wasted

**With rest parameters:**
- Function has a magical expanding cart
- No matter how many items (arguments) you bring, it fits them all
- The cart gives you an organized list of everything

**Business value:**
- Functions are more flexible
- Less code to maintain (one function handles all cases)
- Fewer bugs (no 'undefined' issues with varying argument counts)
- Better developer experience"

**Key Rules:**

1. **Use three dots before parameter name:** `...args`
2. **Must be last parameter:** `function (first, second, ...rest)`
3. **Creates a real array:** Can use `.map()`, `.filter()`, etc.
4. **Works in arrow functions:** `const sum = (...nums) => ...`
5. **Only one rest parameter per function**

</details>

---

## Question 3: What are default parameters in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain default parameters. How do they work and when should you use them?

### Answer

**Default parameters** allow named parameters to have default values if no value or `undefined` is passed.

1. **Basic Behavior**
   - Triggered by `undefined` (not by `null`!)
   - Evaluated at call time (not define time)
   - Can reference earlier parameters
   - Can be any expression

2. **vs Old Pattern**
   - Old: `value = value || default` (problematic with 0, false, "")
   - New: `function(value = default)` (only undefined triggers)

3. **Common Use Cases**
   - Optional function parameters
   - Configuration objects
   - API default values
   - Fallback values

### Code Example

```javascript
// 1. BASIC DEFAULT PARAMETERS
function greet(name = "Guest", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

console.log(greet());                    // "Hello, Guest!"
console.log(greet("Alice"));             // "Hello, Alice!"
console.log(greet("Bob", "Hi"));         // "Hi, Bob!"
console.log(greet(undefined, "Hey"));    // "Hey, Guest!"

// 2. UNDEFINED VS NULL
function test(value = "default") {
  console.log(value);
}

test();        // "default" (undefined triggers default)
test(undefined); // "default" (explicitly passing undefined)
test(null);    // null (null does NOT trigger default!)
test(0);       // 0 (0 does NOT trigger default)
test(false);   // false (false does NOT trigger default)
test("");      // "" (empty string does NOT trigger default)

// 3. OLD WAY VS NEW WAY
// ❌ Old problematic way
function oldWay(value) {
  value = value || "default"; // Problem: replaces 0, false, ""
  console.log(value);
}

oldWay(0);     // "default" (wanted 0!)
oldWay(false); // "default" (wanted false!)

// ✅ New correct way
function newWay(value = "default") {
  console.log(value);
}

newWay(0);     // 0 (correct!)
newWay(false); // false (correct!)

// 4. DEFAULT PARAMETERS WITH DESTRUCTURING
function createUser({ name = "Guest", age = 18, role = "user" } = {}) {
  return { name, age, role };
}

console.log(createUser());                          // { name: "Guest", age: 18, role: "user" }
console.log(createUser({ name: "Alice" }));         // { name: "Alice", age: 18, role: "user" }
console.log(createUser({ name: "Bob", age: 25 })); // { name: "Bob", age: 25, role: "user" }

// 5. REFERENCING EARLIER PARAMETERS
function makeArray(length = 10, value = length * 2) {
  return Array(length).fill(value);
}

console.log(makeArray(3));    // [6, 6, 6] (value defaults to length * 2)
console.log(makeArray(3, 10)); // [10, 10, 10]

// ❌ Can't reference later parameters
function wrong(a = b, b = 2) {
  // ReferenceError: Cannot access 'b' before initialization
}

// 6. FUNCTION CALL AS DEFAULT
function getDefaultName() {
  console.log("getDefaultName called");
  return "Guest";
}

function greet(name = getDefaultName()) {
  console.log(`Hello, ${name}!`);
}

greet("Alice");  // Doesn't call getDefaultName
greet();         // Calls getDefaultName, logs "Hello, Guest!"

// 7. REQUIRED PARAMETERS PATTERN
function required(paramName) {
  throw new Error(`Parameter ${paramName} is required`);
}

function createUser(name = required('name'), email = required('email')) {
  return { name, email };
}

// createUser(); // Error: Parameter name is required
createUser("Alice", "alice@example.com"); // OK
```

### Common Mistakes

- ❌ **Mistake:** Expecting null to trigger default
  ```javascript
  function test(value = "default") {
    console.log(value);
  }
  test(null); // null (not "default"!)
  ```

- ✅ **Correct:** Only undefined triggers defaults
  ```javascript
  function test(value = "default") {
    console.log(value);
  }
  test();         // "default"
  test(undefined); // "default"
  test(null);     // null
  ```

### Resources

- [MDN: Default Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)

<details>
<summary><strong>🔍 Deep Dive: Default Parameters Implementation</strong></summary>

**How V8 Handles Default Parameters:**

```javascript
// Your code:
function greet(name = "Guest", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

// V8 transpiles to (simplified):
function greet(name, greeting) {
  if (name === undefined) name = "Guest";
  if (greeting === undefined) greeting = "Hello";
  return `${greeting}, ${name}!`;
}

// Important: Only checks for undefined, not null!
```

**Evaluation Timing:**

```javascript
// Default expressions evaluated EVERY call
let counter = 0;

function test(value = counter++) {
  console.log(value);
}

test();  // 0 (counter++ evaluated, now counter = 1)
test();  // 1 (counter++ evaluated again, now counter = 2)
test(5); // 5 (counter++ NOT evaluated, counter still = 2)
test();  // 2 (counter++ evaluated, now counter = 3)

// Key: Defaults are lazy-evaluated (only when needed)
```

**TDZ (Temporal Dead Zone) in Default Parameters:**

```javascript
// Parameters are evaluated left-to-right
function test(a = b, b = 2) {
  console.log(a, b);
}

test(); // ReferenceError: Cannot access 'b' before initialization
// Because 'a' tries to use 'b' before 'b' is initialized

// ✅ This works (left-to-right order):
function correct(a = 1, b = a * 2) {
  console.log(a, b);
}

correct(); // 1, 2 (a is initialized when b's default is evaluated)
```

**Scope Chain for Default Parameters:**

```javascript
// Default parameters have their own scope
function outer() {
  const x = 10;

  function inner(y = x) {
    // y defaults to x from outer scope (lexical)
    const x = 20; // Different x in function scope
    console.log(y); // 10 (uses outer x, not inner x!)
  }

  inner(); // 10
}

outer();

// Default parameters are evaluated in an intermediate scope:
// outer scope → parameter scope → function body scope
```

**Performance: Defaults vs Manual Checks:**

```javascript
// Benchmark: 1 million calls
const iterations = 1000000;

// Test 1: Manual undefined check
function manualCheck(value) {
  if (value === undefined) value = "default";
  return value;
}

console.time('manual');
for (let i = 0; i < iterations; i++) {
  manualCheck();
}
console.timeEnd('manual'); // ~15ms

// Test 2: Default parameters
function defaultParam(value = "default") {
  return value;
}

console.time('default');
for (let i = 0; i < iterations; i++) {
  defaultParam();
}
console.timeEnd('default'); // ~16ms

// Performance: Nearly identical (~5% difference)
// Modern JS engines optimize default parameters well
```

**Complex Default Expressions:**

```javascript
// Defaults can be any expression
function createUser(
  name = prompt("Enter name:"),
  id = Math.random().toString(36).substr(2, 9),
  timestamp = Date.now(),
  roles = getUserRoles(), // Function call
  settings = { theme: "dark", notifications: true } // Object literal
) {
  return { name, id, timestamp, roles, settings };
}

// Each default is evaluated only if argument is undefined
// This means:
// - prompt() only called if name is undefined
// - Math.random() only called if id is undefined
// - Date.now() called at invocation time, not definition time
```

**Default Parameters with Destructuring:**

```javascript
// Nested defaults in destructuring
function setupServer({
  host = "localhost",
  port = 3000,
  ssl = {
    enabled = true,
    cert = "/path/to/cert.pem",
    key = "/path/to/key.pem"
  } = {}
} = {}) {
  console.log(host, port, ssl);
}

// All work:
setupServer(); // All defaults
setupServer({}); // All defaults
setupServer({ host: "example.com" }); // Custom host, other defaults
setupServer({ ssl: { enabled: false } }); // Partial SSL override

// Transpiles to complex nested checks for undefined at each level
```

**Memory Implications:**

```javascript
// ✅ GOOD: Simple default values (no allocation)
function greet(name = "Guest") {
  return `Hello, ${name}`;
}
// "Guest" string literal is reused, no allocation per call

// ⚠️ CAREFUL: Object/array defaults (new allocation per call!)
function createUser(settings = { theme: "dark", notifications: true }) {
  return settings;
}

createUser() === createUser(); // false (new object each time!)

// Memory: New object allocated every call when default is used
// If called 1M times: 1M separate objects in memory!

// ✅ BETTER: Reuse shared default
const DEFAULT_SETTINGS = { theme: "dark", notifications: true };
function createUserBetter(settings = DEFAULT_SETTINGS) {
  return settings;
}

createUserBetter() === createUserBetter(); // true (same object!)
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Default Values Bug</strong></summary>

**Scenario:** Your API handler crashes when users pass `null` values instead of omitting fields. The team assumed null would trigger defaults, but it doesn't!

**The Problem:**

```javascript
// ❌ BUG: Assuming null triggers defaults
function createProduct({
  name,
  price = 0,
  category = "uncategorized",
  inStock = true,
  featured = false
} = {}) {
  return {
    name,
    price,
    category,
    inStock,
    featured
  };
}

// Frontend sends this:
const product = createProduct({
  name: "Widget",
  price: 99.99,
  category: null, // User cleared category dropdown
  inStock: null,  // Checkbox state inconsistency
  featured: null  // Default unchecked but sent as null
});

console.log(product);
// {
//   name: "Widget",
//   price: 99.99,
//   category: null,  // ❌ Expected "uncategorized"!
//   inStock: null,   // ❌ Expected true!
//   featured: null   // ❌ Expected false!
// }

// Database constraints fail:
// - category column is NOT NULL
// - inStock column is BOOLEAN (not nullable)
//
// Result: 500 Internal Server Error
// Users can't create products!
```

**Production Impact:**

```javascript
// Metrics before fix:
// - Product creation failures: 15% (150/day)
// - 500 errors: 450/day
// - Customer support tickets: 35/week
// - Revenue lost: ~$8k/week (abandoned carts due to errors)
// - Developer time: 8 hours/week debugging null issues

// Error logs:
// "Cannot insert null into non-nullable column 'category'"
// "Type error: Expected boolean, got null for 'inStock'"
```

**Debugging Process:**

```javascript
// Step 1: Log received data
function createProduct(data) {
  console.log('Received data:', JSON.stringify(data, null, 2));
  // {
  //   "name": "Widget",
  //   "price": 99.99,
  //   "category": null,
  //   "inStock": null,
  //   "featured": null
  // }

  // Step 2: Check types
  console.log('category type:', typeof data.category); // "object" (null!)
  console.log('category === undefined:', data.category === undefined); // false
  console.log('category === null:', data.category === null); // true

  // Aha! Frontend sends null, but defaults only trigger for undefined
}
```

**Solution 1: Nullish Coalescing:**

```javascript
// ✅ FIX: Use nullish coalescing to handle both null and undefined
function createProduct({
  name,
  price,
  category,
  inStock,
  featured
} = {}) {
  return {
    name,
    price: price ?? 0,
    category: category ?? "uncategorized",
    inStock: inStock ?? true,
    featured: featured ?? false
  };
}

// Now handles both undefined and null:
createProduct({ name: "Widget", category: null });
// { name: "Widget", price: 0, category: "uncategorized", inStock: true, featured: false }

createProduct({ name: "Widget", category: undefined });
// { name: "Widget", price: 0, category: "uncategorized", inStock: true, featured: false }

createProduct({ name: "Widget" });
// { name: "Widget", price: 0, category: "uncategorized", inStock: true, featured: false }
```

**Solution 2: Preprocessing Layer:**

```javascript
// ✅ BETTER: Normalize null to undefined at API boundary
function normalizeNullToUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === null ? undefined : value
    ])
  );
}

function createProduct({
  name,
  price = 0,
  category = "uncategorized",
  inStock = true,
  featured = false
} = {}) {
  return { name, price, category, inStock, featured };
}

// API handler:
app.post('/api/products', (req, res) => {
  const normalizedData = normalizeNullToUndefined(req.body);
  const product = createProduct(normalizedData);
  // Now defaults work as expected!
});
```

**Solution 3: Zod Schema with Transforms:**

```javascript
// ✅ BEST: Use validation library with transforms
import { z } from 'zod';

const productSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative().default(0),
  category: z.string().default("uncategorized"),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false)
}).transform(data => ({
  ...data,
  // Transform null to undefined so defaults work
  price: data.price ?? 0,
  category: data.category ?? "uncategorized",
  inStock: data.inStock ?? true,
  featured: data.featured ?? false
}));

function createProduct(data) {
  // Validates + applies defaults + handles null
  const validated = productSchema.parse(data);
  return validated;
}

// Usage:
try {
  const product = createProduct({
    name: "Widget",
    price: 99.99,
    category: null,
    inStock: null,
    featured: null
  });

  console.log(product);
  // {
  //   name: "Widget",
  //   price: 99.99,
  //   category: "uncategorized", ✅
  //   inStock: true,             ✅
  //   featured: false            ✅
  // }
} catch (error) {
  console.error('Validation failed:', error);
}
```

**Frontend Fix:**

```javascript
// ✅ ALSO FIX FRONTEND: Don't send null
// Old frontend code:
const formData = {
  name: nameInput.value,
  price: priceInput.value,
  category: categoryDropdown.value, // "" when cleared → sent as null by JSON.stringify
  inStock: inStockCheckbox.checked, // false → sent as null by some form libraries
  featured: featuredCheckbox.checked
};

// New frontend code:
const formData = {
  name: nameInput.value,
  price: parseFloat(priceInput.value) || undefined,
  category: categoryDropdown.value || undefined,
  inStock: inStockCheckbox.checked || undefined,
  featured: featuredCheckbox.checked || undefined
};

// Don't send null values at all:
const cleanData = Object.fromEntries(
  Object.entries(formData).filter(([_, value]) => value !== null && value !== undefined)
);

// Or explicitly convert null to undefined:
const cleanData = Object.fromEntries(
  Object.entries(formData).map(([key, value]) => [key, value ?? undefined])
);
```

**Real Metrics After Fix:**

```javascript
// After implementing Solution 3 (Zod + nullish coalescing):
// - Product creation failures: 0.5% (5/day, unrelated issues)
// - 500 errors from null: 0/day ✅
// - Customer support tickets: 3/week (90% reduction)
// - Revenue recovered: $8k/week
// - Developer time saved: 7 hours/week
// - Customer satisfaction: +85%
// - Data integrity issues: 0 (was 15/day)
```

**Complex Real-World Example:**

```javascript
// Production-ready API handler with comprehensive defaults
import { z } from 'zod';

const createProductSchema = z.object({
  // Required fields
  name: z.string().min(1),

  // Optional with defaults (handles null gracefully)
  price: z.number().nonnegative().nullable().transform(val => val ?? 0),
  category: z.string().nullable().transform(val => val ?? "uncategorized"),
  inStock: z.boolean().nullable().transform(val => val ?? true),
  featured: z.boolean().nullable().transform(val => val ?? false),

  // Optional nested object with defaults
  metadata: z.object({
    tags: z.array(z.string()).nullable().transform(val => val ?? []),
    weight: z.number().nullable().transform(val => val ?? 0),
    dimensions: z.object({
      length: z.number().nullable().transform(val => val ?? 0),
      width: z.number().nullable().transform(val => val ?? 0),
      height: z.number().nullable().transform(val => val ?? 0)
    }).nullable().transform(val => val ?? { length: 0, width: 0, height: 0 })
  }).nullable().transform(val => val ?? {
    tags: [],
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  })
});

async function createProduct(req, res) {
  try {
    // Validate and apply defaults
    const productData = createProductSchema.parse(req.body);

    // Save to database
    const product = await db.products.create(productData);

    res.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Now handles:
// - Missing fields → defaults applied
// - null values → converted to defaults
// - Invalid types → validation error (400)
// - Nested null objects → full default structure
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Default Parameters vs Other Patterns</strong></summary>

### 1. Default Parameters vs || Operator

```javascript
// Pattern 1: Old || operator pattern
function greet(name) {
  name = name || "Guest";
  console.log(`Hello, ${name}`);
}

// Pattern 2: Default parameters
function greetModern(name = "Guest") {
  console.log(`Hello, ${name}`);
}
```

| Aspect | `||` Operator | Default Parameters |
|--------|--------------|-------------------|
| **Handles undefined** | ✅ Yes | ✅ Yes |
| **Handles null** | ✅ Yes | ❌ No (null passes through) |
| **Handles 0** | ❌ No (0 becomes default) | ✅ Yes (0 is valid) |
| **Handles false** | ❌ No (false becomes default) | ✅ Yes (false is valid) |
| **Handles ""** | ❌ No ("" becomes default) | ✅ Yes ("" is valid) |
| **Readability** | ⚠️ Less clear | ✅ Self-documenting |
| **Performance** | ✅ Slightly faster | ⚠️ Minimal overhead |

**When to use each:**

```javascript
// ✅ Use || when you want to treat falsy as missing:
function setVolume(volume) {
  volume = volume || 50; // 0 becomes 50 (intended behavior)
  return volume;
}
setVolume(0); // 50 (treat 0 as "no volume set")

// ✅ Use defaults when 0/false/"" are valid:
function createUser(age = 18) {
  return { age };
}
createUser(0); // { age: 0 } (0 is valid age for baby)
```

### 2. Default Parameters vs Nullish Coalescing

```javascript
// Pattern 1: Default parameters (undefined only)
function config(port = 3000) {
  return port;
}

// Pattern 2: Nullish coalescing (undefined + null)
function configNullish(port) {
  return port ?? 3000;
}
```

| Aspect | Default Parameters | Nullish Coalescing |
|--------|-------------------|-------------------|
| **Handles undefined** | ✅ Yes | ✅ Yes |
| **Handles null** | ❌ No | ✅ Yes |
| **Parameter level** | ✅ Yes | ❌ No (used in body) |
| **Flexibility** | ⚠️ Fixed at signature | ✅ Use anywhere |
| **Conditional defaults** | ❌ No | ✅ Yes |

**When to use each:**

```javascript
// ✅ Use default parameters for simple cases:
function greet(name = "Guest") {
  return `Hello, ${name}`;
}

// ✅ Use ?? when you need to handle null too:
function greet(name) {
  const finalName = name ?? "Guest"; // Handles null and undefined
  return `Hello, ${finalName}`;
}

// ✅ Use ?? for conditional logic:
function process(value, multiplier) {
  const finalValue = (value ?? 0) * (multiplier ?? 1);
  // More flexible than defaults
}
```

### 3. Default Parameters vs Object.assign

```javascript
// Pattern 1: Default parameters
function createConfig({
  host = "localhost",
  port = 3000,
  ssl = false
} = {}) {
  return { host, port, ssl };
}

// Pattern 2: Object.assign
function createConfigAssign(options = {}) {
  return Object.assign({
    host: "localhost",
    port: 3000,
    ssl: false
  }, options);
}
```

| Aspect | Default Parameters | Object.assign |
|--------|-------------------|--------------|
| **Readability** | ✅ Very clear | ⚠️ More verbose |
| **Partial overrides** | ✅ Easy | ✅ Easy |
| **Nested defaults** | ⚠️ Complex | ⚠️ Shallow only |
| **Performance** | ✅ Faster | ⚠️ Slower (object creation) |
| **Flexibility** | ⚠️ Fixed structure | ✅ Dynamic keys |

**When to use each:**

```javascript
// ✅ Use defaults for fixed known parameters:
function createUser({ name = "Guest", age = 18 } = {}) {
  return { name, age };
}

// ✅ Use Object.assign for dynamic config merging:
function mergeConfig(userConfig = {}) {
  const defaults = { host: "localhost", port: 3000, ssl: false };
  return Object.assign({}, defaults, userConfig); // Merge user config
}

// ✅ Use spread for shallow merge (modern):
function mergeConfigSpread(userConfig = {}) {
  return {
    host: "localhost",
    port: 3000,
    ssl: false,
    ...userConfig // Override defaults
  };
}
```

### 4. Required Parameters Pattern

```javascript
// Pattern 1: Throw in default
function required(param) {
  throw new Error(`Parameter ${param} is required`);
}

function createUser(name = required('name')) {
  return { name };
}

// Pattern 2: Manual check
function createUserManual(name) {
  if (name === undefined) {
    throw new Error('Parameter name is required');
  }
  return { name };
}
```

| Aspect | Default = required() | Manual Check |
|--------|---------------------|--------------|
| **Readability** | ✅ Self-documenting | ⚠️ More code |
| **Parameter list** | ✅ Shows required | ❌ Not obvious |
| **Performance** | ⚠️ Minimal overhead | ✅ Slightly faster |
| **TypeScript** | ⚠️ Still optional | ✅ Required type |

### 5. Complex Defaults Trade-offs

```javascript
// ✅ Simple default (good)
function simple(count = 0) {
  return count;
}

// ⚠️ Object default (careful - new object each call)
function objectDefault(config = { theme: "dark" }) {
  return config;
}
objectDefault() === objectDefault(); // false!

// ✅ Shared default (better)
const DEFAULT_CONFIG = { theme: "dark" };
function objectShared(config = DEFAULT_CONFIG) {
  return config;
}
objectShared() === objectShared(); // true

// ⚠️ Function call default (evaluated every time)
function expensive(data = loadFromDatabase()) {
  return data; // loadFromDatabase() called every time undefined!
}

// ✅ Lazy evaluation pattern
function expensiveLazy(data) {
  return data ?? loadFromDatabase(); // Only loads if needed
}
```

### Decision Matrix

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **Simple primitives** | Default parameters | Clear, fast |
| **Handle null** | Nullish coalescing `??` | Covers both |
| **Falsy = missing** | `||` operator | Intended behavior |
| **Object config** | Default params + spread | Readable + flexible |
| **Required params** | Default = required() | Self-documenting |
| **Expensive default** | Lazy with `??` | Avoid unnecessary work |
| **Dynamic keys** | Object.assign / spread | Flexibility |

</details>

<details>
<summary><strong>💬 Explain to Junior: Default Parameters Simplified</strong></summary>

**Simple Analogy: Restaurant Order**

Think of function parameters like ordering food at a restaurant:

```javascript
function orderCoffee(size = "medium", milk = "regular", sugar = 1) {
  console.log(`${size} coffee with ${milk} milk and ${sugar} sugar`);
}

// If you don't specify, you get defaults:
orderCoffee();
// "medium coffee with regular milk and 1 sugar"

// You can customize some:
orderCoffee("large");
// "large coffee with regular milk and 1 sugar"

// Or customize all:
orderCoffee("small", "oat", 0);
// "small coffee with oat milk and 0 sugar"
```

- **No parameters?** You get the "usual" (defaults)
- **Some parameters?** Customize those, keep rest default
- **All parameters?** Full custom order

**The undefined Surprise:**

```javascript
function setVolume(volume = 50) {
  console.log(`Volume: ${volume}`);
}

// What do you think these do?
setVolume();        // Volume: 50 ✅ (no argument = undefined)
setVolume(undefined); // Volume: 50 ✅ (explicitly undefined)
setVolume(null);    // Volume: null ❌ (null is NOT undefined!)
setVolume(0);       // Volume: 0 ✅ (0 is a valid number)
setVolume(false);   // Volume: false ✅ (false is a valid boolean)

// Rule: Only undefined triggers default, nothing else!
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Expecting null to use default
function greet(name = "Guest") {
  console.log(`Hello, ${name}`);
}

greet(null); // "Hello, null" (not "Hello, Guest"!)

// Why? null is a value, not "missing"
// Only undefined means "use default"


// ❌ MISTAKE 2: Using || for defaults with numbers
function oldWay(count) {
  count = count || 10; // Dangerous!
  console.log(count);
}

oldWay(0); // 10 (wanted 0, but 0 is falsy!)
oldWay(5); // 5 (correct)

// ✅ FIX: Use default parameters
function newWay(count = 10) {
  console.log(count);
}

newWay(0); // 0 ✅ (0 is valid, only undefined triggers default)
newWay(5); // 5 ✅


// ❌ MISTAKE 3: Referencing later parameters
function wrong(a = b, b = 2) {
  console.log(a, b);
}

wrong(); // ReferenceError: Cannot access 'b' before initialization

// Why? Parameters evaluated left-to-right
// 'a' tries to use 'b', but 'b' doesn't exist yet!

// ✅ FIX: Reference earlier parameters only
function correct(a = 1, b = a * 2) {
  console.log(a, b);
}

correct(); // 1, 2 ✅ ('a' exists when 'b' is evaluated)
```

**Practical Examples:**

```javascript
// 1. Array generation
function makeArray(length = 5, value = 0) {
  return Array(length).fill(value);
}

console.log(makeArray());        // [0, 0, 0, 0, 0]
console.log(makeArray(3));       // [0, 0, 0]
console.log(makeArray(3, 'x'));  // ['x', 'x', 'x']


// 2. User creation
function createUser({
  name = "Guest",
  age = 18,
  role = "user"
} = {}) {
  return { name, age, role };
}

console.log(createUser());
// { name: "Guest", age: 18, role: "user" }

console.log(createUser({ name: "Alice" }));
// { name: "Alice", age: 18, role: "user" }


// 3. API call with retry
function fetchWithRetry(url, retries = 3, delay = 1000) {
  console.log(`Fetching ${url} (${retries} retries, ${delay}ms delay)`);
  // ... fetch logic ...
}

fetchWithRetry('/api/users');
// "Fetching /api/users (3 retries, 1000ms delay)"

fetchWithRetry('/api/posts', 5);
// "Fetching /api/posts (5 retries, 1000ms delay)"
```

**Explaining to PM:**

"Default parameters are like having a standard order at your favorite restaurant.

**Without defaults:**
- You have to specify EVERY detail every time
- 'I want a sandwich with bread, lettuce, tomato, cheese, mayo...'
- If you forget something, you get an incomplete sandwich (bugs!)

**With defaults:**
- You just say 'my usual' and get your standard order
- But you CAN customize: 'my usual, but no mayo'
- Saves time, fewer mistakes

**Business value:**
- Code is more reliable (fewer bugs from missing values)
- Developers write code faster (less boilerplate)
- APIs are easier to use (sensible defaults)
- Better user experience (forms work without filling everything)
- Example: Sign-up form doesn't break if user skips 'country' field"

**Visual Example:**

```javascript
// ❌ OLD: Without defaults (brittle)
function sendEmail(to, from, subject, body) {
  if (!to) throw new Error('to required');
  if (!from) from = 'noreply@example.com'; // Manual check
  if (!subject) subject = 'No Subject';
  if (!body) body = '';

  console.log(`Sending email...`);
}

// You MUST provide 4 arguments (annoying!)
sendEmail('user@example.com', null, null, null); // Ugly!


// ✅ NEW: With defaults (clean)
function sendEmailBetter(
  to,
  from = 'noreply@example.com',
  subject = 'No Subject',
  body = ''
) {
  if (!to) throw new Error('to required');
  console.log(`Sending email...`);
}

// Only provide what you need:
sendEmailBetter('user@example.com'); // Clean! ✅
sendEmailBetter('user@example.com', undefined, 'Welcome'); // Skip 'from'
```

**Key Rules:**

1. **Only undefined triggers defaults** (not null, not 0, not false, not "")
2. **Parameters evaluated left-to-right** (can reference earlier params)
3. **Evaluated at call time** (not definition time - fresh each call)
4. **Works with destructuring** (object/array defaults)
5. **Use for sensible defaults** (not complex logic)

**Quick Test:**

```javascript
// What do these output?
function test(a = 1, b = a * 2, c = 3) {
  console.log(a, b, c);
}

test();           // ?
test(5);          // ?
test(5, undefined, 7); // ?
test(null, 10, 20);    // ?

// Answers:
test();           // 1, 2, 3 (all defaults)
test(5);          // 5, 10, 3 (b = a * 2 = 5 * 2 = 10)
test(5, undefined, 7); // 5, 10, 7 (undefined triggers b's default)
test(null, 10, 20);    // null, 10, 20 (null does NOT trigger default!)
```

</details>

---

