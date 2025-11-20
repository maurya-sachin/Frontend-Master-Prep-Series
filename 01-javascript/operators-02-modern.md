# Modern JavaScript Operators

> **Focus**: Core JavaScript concepts

---

## Question 1: Explain short-circuit evaluation with && and || operators

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon

### Question
How does short-circuit evaluation work with `&&` and `||` operators? Provide practical examples.

### Answer

**Short-circuit evaluation** means logical operators stop evaluating as soon as the result is determined.

1. **OR Operator (||)**
   - Returns first truthy value
   - If all values are falsy, returns last value
   - Right side not evaluated if left is truthy
   - Common for default values

2. **AND Operator (&&)**
   - Returns first falsy value
   - If all values are truthy, returns last value
   - Right side not evaluated if left is falsy
   - Common for conditional execution

3. **Why Short-Circuit**
   - Performance optimization
   - Avoid unnecessary computations
   - Prevent errors (null/undefined checks)
   - Enable conditional execution

4. **Return Values**
   - **Returns the actual value**, not just true/false!
   - `||` returns first truthy or last value
   - `&&` returns first falsy or last value

5. **Modern Alternatives**
   - `??` (nullish coalescing) - only null/undefined
   - `?.` (optional chaining) - safe property access

### Code Example

```javascript
// 1. OR (||) - RETURNS FIRST TRUTHY

console.log(false || "default");        // "default"
console.log(0 || "fallback");           // "fallback"
console.log("" || "empty");             // "empty"
console.log(null || undefined || "value"); // "value"

// Returns actual values, not true/false!
console.log(5 || 10);                   // 5 (first truthy)
console.log("hello" || "world");        // "hello"

// All falsy → returns last
console.log(false || 0 || "");          // "" (last value)
console.log(null || undefined);         // undefined

// 2. AND (&&) - RETURNS FIRST FALSY

console.log(true && "value");           // "value" (last truthy)
console.log(1 && 2 && 3);              // 3 (last truthy)
console.log(false && "never");          // false (first falsy)
console.log(0 && "never");              // 0 (first falsy)
console.log("" && "never");             // "" (first falsy)

// All truthy → returns last
console.log(5 && 10 && 15);            // 15

// 3. SHORT-CIRCUIT PREVENTS EXECUTION

function expensiveOperation() {
  console.log("Expensive operation called!");
  return "result";
}

// OR - right side NOT called if left is truthy
const result1 = true || expensiveOperation();  // true (not called)
const result2 = false || expensiveOperation(); // "result" (called)

// AND - right side NOT called if left is falsy
const result3 = false && expensiveOperation(); // false (not called)
const result4 = true && expensiveOperation();  // "result" (called)

// 4. DEFAULT VALUES WITH ||

function greet(name) {
  const finalName = name || "Guest"; // Default if name is falsy
  return `Hello, ${finalName}!`;
}

console.log(greet("Alice"));   // "Hello, Alice!"
console.log(greet(""));        // "Hello, Guest!"
console.log(greet(null));      // "Hello, Guest!"
console.log(greet(undefined)); // "Hello, Guest!"

// ⚠️ Problem: 0 and false also get default!
console.log(greet(0));         // "Hello, Guest!" (might not want this)
console.log(greet(false));     // "Hello, Guest!" (might not want this)

// 5. CONDITIONAL EXECUTION WITH &&

const user = { name: "Alice", role: "admin" };

// Execute only if user exists
user && console.log(`Welcome, ${user.name}!`); // Logs

// Execute only if user is admin
user.role === "admin" && console.log("Admin access granted"); // Logs

// Common in React
const hasData = true;
hasData && renderComponent(); // Only renders if hasData is truthy

// 6. CHAINING SHORT-CIRCUITS

// OR chain - first truthy wins
const value = getFromCache() || getFromDatabase() || "default";
// Only calls each function until one returns truthy

// AND chain - first falsy stops
const result = validateInput() && processData() && saveToDatabase();
// Stops at first falsy (failed validation)

// 7. PRACTICAL - NULL/UNDEFINED CHECK

const data = { user: { name: "Alice" } };

// ❌ Without short-circuit - crashes if data.user is null
// console.log(data.user.name); // TypeError if user is null

// ✅ With && short-circuit
console.log(data && data.user && data.user.name); // "Alice"

// Better with optional chaining
console.log(data?.user?.name); // "Alice"

// 8. DEFAULT VALUES - || VS ??

const count1 = 0;
const count2 = null;

// || treats 0 as falsy
console.log(count1 || 10);  // 10 (0 is falsy!)
console.log(count2 || 10);  // 10

// ?? only treats null/undefined as nullish
console.log(count1 ?? 10);  // 0 (keeps 0!)
console.log(count2 ?? 10);  // 10

const flag1 = false;
const flag2 = null;

console.log(flag1 || true);  // true (false is falsy)
console.log(flag1 ?? true);  // false (keeps false!)

console.log(flag2 || true);  // true
console.log(flag2 ?? true);  // true

// 9. PRACTICAL - CACHING

let cache = null;

function getData() {
  // Only compute if cache is empty
  cache = cache || expensiveComputation();
  return cache;
}

// Or with lazy evaluation
function getDataLazy() {
  return cache || (cache = expensiveComputation());
}

// 10. GUARD CLAUSES

function processUser(user) {
  // Early return if user is falsy
  if (!user) return;

  // Or using && for one-liner
  user && console.log(`Processing ${user.name}`);

  // Multiple guards
  user && user.isActive && processActiveUser(user);
}

// 11. COMBINING && AND ||

// Complex conditions
const canEdit = (isOwner || isAdmin) && isActive;

// Default with validation
const name = (input && input.trim()) || "Anonymous";

// 12. PERFORMANCE OPTIMIZATION

// ❌ Bad: Always executes both
function slowCheck() {
  return expensiveCheck1() | expensiveCheck2(); // Bitwise OR, no short-circuit!
}

// ✅ Good: Short-circuits
function fastCheck() {
  return expensiveCheck1() || expensiveCheck2(); // Stops at first truthy
}

// 13. EVENT HANDLER PATTERN

function handleClick(event) {
  // Prevent default only if condition is met
  shouldPreventDefault && event.preventDefault();

  // Call handler only if it exists
  onClick && onClick(event);

  // Chain multiple checks
  isEnabled && !isLoading && performAction();
}

// 14. API RESPONSE HANDLING

function processResponse(response) {
  // Extract data with defaults
  const data = response && response.data || [];
  const status = response && response.status || 500;
  const message = response && response.message || "Error occurred";

  return { data, status, message };
}

// Better with optional chaining and nullish coalescing
function processResponseBetter(response) {
  return {
    data: response?.data ?? [],
    status: response?.status ?? 500,
    message: response?.message ?? "Error occurred"
  };
}
```

### Common Mistakes

- ❌ **Mistake:** Using || with 0, false, or ""
  ```javascript
  const count = 0;
  const display = count || "No items"; // "No items" (wrong!)

  // Use ?? instead
  const display = count ?? "No items"; // 0 (correct!)
  ```

- ❌ **Mistake:** Forgetting operators return values
  ```javascript
  const result = true && "value";
  console.log(result); // "value", not true!
  ```

- ✅ **Correct:** Use appropriate operator
  ```javascript
  // For defaults with falsy values: use ||
  const name = input || "default";

  // For defaults with only null/undefined: use ??
  const count = value ?? 0;

  // For safe access: use ?.
  const city = user?.address?.city;
  ```

### Follow-up Questions

- "What is the difference between `||` and `??`?"
- "How does short-circuit evaluation improve performance?"
- "What is optional chaining (`?.`) and when should you use it?"
- "Can you use short-circuit for conditional execution?"
- "What are the pitfalls of using `||` for default values?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**V8 Short-circuit**: Evaluates left operand, checks truthiness (~1ns), skips right if can determine result. Saves function call overhead (10-50ns) when right side is expensive operation.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** `user.isAdmin && fetchAdminData()` called expensive API even for non-admins due to missing short-circuit understanding.

**Fix**: Understanding short-circuit saved 95% of unnecessary API calls (4,000 → 200 calls/day).

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Short-circuit pros**: Performance optimization, concise conditional logic
**Cons**: Can be cryptic, harder to debug

**Use when**: Performance matters, simple conditions. Avoid for complex logic (use if/else for clarity).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Short-circuit** = Stop checking as soon as answer is obvious.

```javascript
false && anything  // Returns false (doesn't check "anything")
true || anything   // Returns true (doesn't check "anything")
```

Like asking "Is it raining AND did I forget umbrella?" - If not raining, don't need to check umbrella!

</details>

### Resources

- [MDN: Logical OR (||)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)
- [MDN: Logical AND (&&)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
- [JavaScript.info: Logical Operators](https://javascript.info/logical-operators)

---

## Question 2: What is optional chaining (?.) in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain optional chaining (`?.`) operator. How does it work and when should you use it?

### Answer

**Optional chaining** (`?.`) allows you to safely access nested object properties without checking if each reference is null/undefined.

1. **What It Does**
   - Returns `undefined` if reference is null/undefined
   - Short-circuits the rest of the chain
   - Prevents "Cannot read property of undefined" errors
   - Works with properties, methods, and array indexes

2. **Three Forms**
   - `obj?.prop` - property access
   - `obj?.[expr]` - computed property access
   - `func?.()` - function call

3. **When to Use**
   - Accessing deeply nested properties
   - Optional API response fields
   - Optional callback functions
   - Dynamic property access

4. **When NOT to Use**
   - Required properties (hides bugs!)
   - Where null/undefined should error
   - Simple one-level access
   - Performance-critical code (slight overhead)

5. **Combination with ??**
   - `obj?.prop ?? defaultValue` - safe access with default
   - Common pattern for nested data with fallbacks

### Code Example

```javascript
// 1. BASIC PROPERTY ACCESS

const user = {
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Boston"
  }
};

// ❌ Without optional chaining - crashes!
const user2 = { name: "Bob" }; // No address
// console.log(user2.address.city); // TypeError!

// ✅ With optional chaining
console.log(user2.address?.city); // undefined (safe!)

// Traditional way (verbose)
const city = user2.address && user2.address.city;

// Modern way (clean)
const city2 = user2.address?.city;

// 2. DEEPLY NESTED ACCESS

const data = {
  user: {
    profile: {
      settings: {
        theme: "dark"
      }
    }
  }
};

// ❌ Traditional - verbose!
const theme = data && data.user && data.user.profile &&
              data.user.profile.settings &&
              data.user.profile.settings.theme;

// ✅ Optional chaining - clean!
const theme2 = data?.user?.profile?.settings?.theme;

// If any part is null/undefined → undefined
const missing = data?.user?.profile?.missing?.prop; // undefined

// 3. OPTIONAL METHOD CALLS

const obj = {
  greet() {
    return "Hello!";
  }
};

// ✅ Method exists
console.log(obj.greet?.()); // "Hello!"

// ✅ Method doesn't exist
console.log(obj.missing?.()); // undefined (no error!)

// ❌ Without optional chaining
// console.log(obj.missing()); // TypeError!

// 4. OPTIONAL ARRAY ACCESS

const users = [
  { name: "Alice" },
  { name: "Bob" }
];

console.log(users[0]?.name);  // "Alice"
console.log(users[10]?.name); // undefined (index doesn't exist)

// With null array
const nullArray = null;
console.log(nullArray?.[0]);  // undefined (safe!)

// 5. COMPUTED PROPERTY ACCESS

const key = "address";
const user = { name: "Alice", address: "123 Main" };

// Traditional bracket notation
console.log(user[key]); // "123 Main"

// Optional computed access
console.log(user?.[key]); // "123 Main"

const nullObj = null;
console.log(nullObj?.[key]); // undefined (safe!)

// 6. COMBINING WITH NULLISH COALESCING

const user = { name: "Alice" };

// Get nested value with default
const city = user?.address?.city ?? "Unknown";
console.log(city); // "Unknown"

const theme = user?.settings?.theme ?? "light";
console.log(theme); // "light"

// Without optional chaining (verbose)
const city2 = (user && user.address && user.address.city) || "Unknown";

// 7. OPTIONAL CALLBACKS

function processData(data, onSuccess, onError) {
  try {
    const result = process(data);
    onSuccess?.(result); // Call only if function exists
  } catch (error) {
    onError?.(error); // Call only if function exists
  }
}

// Call without callbacks (no error!)
processData(someData);

// Call with only onSuccess
processData(someData, (result) => console.log(result));

// 8. OPTIONAL EVENT HANDLERS

class Button {
  constructor(options) {
    this.onClick = options.onClick;
    this.onHover = options.onHover;
  }

  handleClick(event) {
    // Call handler only if defined
    this.onClick?.(event);
  }

  handleHover(event) {
    this.onHover?.(event);
  }
}

// Create button without all handlers (no error!)
const btn = new Button({
  onClick: (e) => console.log("Clicked!")
  // onHover not provided - that's OK!
});

// 9. API RESPONSE HANDLING

async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Safely access optional fields
  return {
    name: data?.name ?? "Unknown",
    email: data?.contact?.email ?? "No email",
    city: data?.address?.city ?? "Unknown",
    phone: data?.contact?.phone?.number ?? "No phone"
  };
}

// 10. REACT COMPONENT EXAMPLE

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user?.name ?? "Guest"}</h1>
      <p>{user?.address?.city}</p>
      <img src={user?.avatar?.url ?? "/default-avatar.png"} />
      {user?.isAdmin && <AdminBadge />}
    </div>
  );
}

// Works even if user is null/undefined
<UserProfile user={null} /> // No crash!

// 11. SHORT-CIRCUITING

let count = 0;

function increment() {
  count++;
  return { value: count };
}

const obj = null;

// increment() is NOT called (short-circuit!)
console.log(obj?.prop?.nested?.increment());
console.log(count); // 0 (increment never called)

// 12. DELETE WITH OPTIONAL CHAINING

const config = {
  theme: "dark",
  settings: {
    notifications: true
  }
};

// Safe delete
delete config?.settings?.advanced; // No error even if doesn't exist
delete config?.missing?.prop; // No error

// 13. LIMITATIONS

// ❌ Can't use on left side of assignment
// obj?.prop = "value"; // SyntaxError!

// ✅ Must use regular access for assignment
if (obj) {
  obj.prop = "value";
}

// ❌ Doesn't work with optional construction
// const instance = new Constructor?.(); // SyntaxError!

// ✅ Use conditional instead
const instance = Constructor ? new Constructor() : null;

// 14. PERFORMANCE CONSIDERATION

// For tight loops, optional chaining has slight overhead
for (let i = 0; i < 1000000; i++) {
  // Slightly slower
  const value = obj?.prop?.nested;

  // Slightly faster (if you know obj exists)
  const value2 = obj.prop?.nested;
}

// In most cases, the overhead is negligible
```

### Common Mistakes

- ❌ **Mistake:** Using for required properties
  ```javascript
  // Bad - hides bugs!
  function processUser(user) {
    console.log(user?.name); // undefined if user is null - should error!
  }

  // Good - fail fast for required data
  function processUser(user) {
    if (!user) throw new Error("User required");
    console.log(user.name);
  }
  ```

- ❌ **Mistake:** Trying to use for assignment
  ```javascript
  obj?.prop = "value"; // SyntaxError!
  ```

- ✅ **Correct:** Use for optional access with defaults
  ```javascript
  const name = user?.name ?? "Guest";
  const city = user?.address?.city ?? "Unknown";
  ```

### Follow-up Questions

- "What's the difference between `?.` and `&&` for null checks?"
- "Can you use optional chaining on the left side of an assignment?"
- "How does optional chaining work with nullish coalescing?"
- "What are the performance implications of optional chaining?"
- "When should you NOT use optional chaining?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**V8 Implementation**: Checks each step for null/undefined before proceeding. Adds ~2-5ns overhead per `?.` vs direct access. Negligible for most apps.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Nested API response caused "Cannot read property of undefined" crashes:
```javascript
const city = response.data.user.address.city;  // ❌ Crash if any null
```

**Fix**: Optional chaining prevented 90% of production errors:
```javascript
const city = response.data?.user?.address?.city;  // ✅ Returns undefined safely
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Optional chaining pros**: Prevents crashes, cleaner code, handles uncertain data
**Cons**: Hides bugs (silently returns undefined), slight performance cost

**Use for**: API responses, optional props. **Avoid for**: Required data (masks bugs).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Optional chaining (`?.`)** = "Check if exists before accessing".

```javascript
user.address.city  // Crashes if address is null
user?.address?.city  // Returns undefined if anything null (safe!)
```

Think of it as asking "Does this exist?" at each step before proceeding.

</details>

### Resources

- [MDN: Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [JavaScript.info: Optional Chaining](https://javascript.info/optional-chaining)
- [TC39 Optional Chaining Proposal](https://github.com/tc39/proposal-optional-chaining)

---

## Question 3: What is nullish coalescing (??) operator?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the nullish coalescing (`??`) operator. How is it different from the OR (`||`) operator?

### Answer

**Nullish coalescing** (`??`) returns the right operand when the left operand is `null` or `undefined`. Unlike `||`, it doesn't treat other falsy values (0, false, "") as triggers.

1. **What is Nullish**
   - Only `null` and `undefined` are nullish
   - All other values are NOT nullish (including 0, false, "")
   - Different from falsy (which includes 0, false, "", etc.)

2. **|| vs ??**
   - `||` returns right side for ANY falsy value
   - `??` returns right side ONLY for null/undefined
   - Use `||` when you want to filter all falsy values
   - Use `??` when 0, false, "" are valid values

3. **Common Use Cases**
   - Default values where 0 is valid
   - Boolean flags where false is valid
   - Strings where empty string is valid

4. **Assignment Variants**
   - `??=` - nullish coalescing assignment
   - Only assigns if current value is null/undefined

5. **Chaining and Precedence**
   - Cannot directly mix `??` with `&&` or `||`
   - Must use parentheses for clarity

### Code Example

```javascript
// 1. BASIC COMPARISON: || VS ??

// || returns right side for ANY falsy value
console.log(0 || 10);        // 10 (0 is falsy)
console.log("" || "default"); // "default" ("" is falsy)
console.log(false || true);   // true (false is falsy)

// ?? returns right side ONLY for null/undefined
console.log(0 ?? 10);        // 0 (0 is not nullish!)
console.log("" ?? "default"); // "" (empty string is not nullish!)
console.log(false ?? true);   // false (false is not nullish!)

// Both behave same for null/undefined
console.log(null || 10);      // 10
console.log(null ?? 10);      // 10
console.log(undefined || 10); // 10
console.log(undefined ?? 10); // 10

// 2. PRACTICAL - COUNT/NUMBER VALUES

function setCount(count) {
  // ❌ Wrong with ||: treats 0 as invalid
  const value1 = count || 5;
  console.log(value1); // 5 if count is 0!

  // ✅ Correct with ??: keeps 0
  const value2 = count ?? 5;
  console.log(value2); // 0 if count is 0
}

setCount(0);    // || gives 5, ?? gives 0
setCount(null); // Both give 5

// 3. PRACTICAL - BOOLEAN FLAGS

function enableFeature(isEnabled) {
  // ❌ Wrong with ||: treats false as disabled
  const enabled1 = isEnabled || true;
  console.log(enabled1); // true even if isEnabled is false!

  // ✅ Correct with ??: respects false
  const enabled2 = isEnabled ?? true;
  console.log(enabled2); // false if isEnabled is false
}

enableFeature(false);     // || gives true, ?? gives false
enableFeature(undefined); // Both give true

// 4. PRACTICAL - EMPTY STRING

function setName(name) {
  // ❌ Wrong with ||: treats "" as invalid
  const finalName1 = name || "Anonymous";
  console.log(finalName1); // "Anonymous" if name is ""

  // ✅ Correct with ??: keeps ""
  const finalName2 = name ?? "Anonymous";
  console.log(finalName2); // "" if name is ""
}

setName("");        // || gives "Anonymous", ?? gives ""
setName(undefined); // Both give "Anonymous"

// 5. REAL-WORLD EXAMPLE - USER SETTINGS

const userSettings = {
  volume: 0,          // 0 is valid!
  notifications: false, // false is valid!
  username: ""        // "" might be valid during editing
};

// ❌ Wrong with ||
const volume1 = userSettings.volume || 50;
const notifications1 = userSettings.notifications || true;
const username1 = userSettings.username || "Guest";

console.log(volume1);        // 50 (wanted 0!)
console.log(notifications1); // true (wanted false!)
console.log(username1);      // "Guest" (wanted ""!)

// ✅ Correct with ??
const volume2 = userSettings.volume ?? 50;
const notifications2 = userSettings.notifications ?? true;
const username2 = userSettings.username ?? "Guest";

console.log(volume2);        // 0 (correct!)
console.log(notifications2); // false (correct!)
console.log(username2);      // "" (correct!)

// 6. NULLISH COALESCING ASSIGNMENT (??=)

let config = {
  timeout: undefined,
  retries: 0,
  cache: null
};

// Only assign if current value is null/undefined
config.timeout ??= 5000;  // Assigned (was undefined)
config.retries ??= 3;     // NOT assigned (0 is not nullish)
config.cache ??= {};      // Assigned (was null)

console.log(config);
// { timeout: 5000, retries: 0, cache: {} }

// 7. COMBINING WITH OPTIONAL CHAINING

const user = {
  name: "Alice",
  settings: {
    theme: null,
    fontSize: 0
  }
};

// Get nested value with default
const theme = user?.settings?.theme ?? "light";
const fontSize = user?.settings?.fontSize ?? 14;

console.log(theme);    // "light" (theme was null)
console.log(fontSize); // 0 (fontSize was 0, not nullish!)

// 8. CHAINING NULLISH COALESCING

const value = input1 ?? input2 ?? input3 ?? "default";
// Returns first non-nullish value

const a = null;
const b = undefined;
const c = 0;
const d = "value";

const result = a ?? b ?? c ?? d ?? "default";
console.log(result); // 0 (first non-nullish!)

// 9. PRECEDENCE AND MIXING OPERATORS

// ❌ Cannot directly mix with && or ||
// const result = a ?? b || c; // SyntaxError!
// const result = a && b ?? c; // SyntaxError!

// ✅ Must use parentheses
const result1 = (a ?? b) || c;  // OK
const result2 = a ?? (b || c);  // OK
const result3 = (a && b) ?? c;  // OK

// 10. FUNCTION PARAMETERS WITH DEFAULTS

// Traditional default parameter
function greet1(name = "Guest") {
  console.log(`Hello, ${name}!`);
}

greet1();        // "Hello, Guest!"
greet1(null);    // "Hello, null!" (null passes through!)
greet1("");      // "Hello, !" ("" passes through!)

// Using ?? for more control
function greet2(name) {
  const finalName = name ?? "Guest";
  console.log(`Hello, ${finalName}!`);
}

greet2();        // "Hello, Guest!"
greet2(null);    // "Hello, Guest!"
greet2("");      // "Hello, !" ("" is not nullish)

// 11. API RESPONSE HANDLING

async function fetchUserData(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  return {
    id: data.id ?? -1,                    // -1 if missing
    name: data.name ?? "Unknown",         // "Unknown" if null/undefined
    age: data.age ?? 0,                   // 0 if null/undefined
    isActive: data.isActive ?? false,     // false if null/undefined
    score: data.score ?? 0,               // Keep 0 if it's 0
    verified: data.verified ?? false      // Keep false if it's false
  };
}

// 12. CONDITIONAL RENDERING (REACT)

function Component({ count, showZero }) {
  return (
    <div>
      {/* ❌ Wrong: hides when count is 0 */}
      {count || <EmptyState />}

      {/* ✅ Correct: shows 0 */}
      {count ?? <EmptyState />}

      {/* ✅ Best: explicit check */}
      {count !== undefined && count !== null ? count : <EmptyState />}
    </div>
  );
}

// 13. DECISION TABLE

const value = /* some value */;

// When to use ||
value || defaultValue  // Use when ANY falsy value should trigger default

// When to use ??
value ?? defaultValue  // Use when ONLY null/undefined should trigger default

// Examples:
const count = 0;
count || 10   // 10 (0 is replaced)
count ?? 10   // 0 (0 is kept)

const flag = false;
flag || true  // true (false is replaced)
flag ?? true  // false (false is kept)

const text = "";
text || "N/A"  // "N/A" ("" is replaced)
text ?? "N/A"  // "" ("" is kept)
```

### Common Mistakes

- ❌ **Mistake:** Using || when 0, false, or "" are valid
  ```javascript
  const volume = settings.volume || 50;  // Replaces 0 with 50!

  // Correct
  const volume = settings.volume ?? 50;  // Keeps 0
  ```

- ❌ **Mistake:** Mixing ?? with && or || without parentheses
  ```javascript
  const result = a ?? b || c;  // SyntaxError!

  // Correct
  const result = (a ?? b) || c;  // OK
  ```

- ✅ **Correct:** Use ?? for values where 0, false, "" are meaningful
  ```javascript
  const count = value ?? 0;
  const enabled = flag ?? false;
  const name = input ?? "";
  ```

### Follow-up Questions

- "What is the difference between `??` and `||`?"
- "What values are considered 'nullish'?"
- "Can you mix `??` with `&&` or `||`?"
- "What is `??=` (nullish coalescing assignment)?"
- "When should you use `??` vs `||`?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Nullish values**: Only `null` and `undefined`. NOT false, 0, "", NaN (those are falsy but not nullish).

**Performance**: Same as `||` (~2ns). V8 optimizes both identically.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** User volume setting of 0 replaced with default 50 using `||`:
```javascript
const volume = userSettings.volume || 50;  // 0 → 50 (wrong!)
```

**Fix**: Using `??` preserved 0 as valid:
```javascript
const volume = userSettings.volume ?? 50;  // 0 stays 0 ✅
```

Fixed 200+ user complaints about "volume resets".

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**`??`**: Only replaces null/undefined (strict)
**`||`**: Replaces all falsy values (0, false, "", null, undefined)

**Use `??` for**: Numbers, booleans, strings (where 0/""/false are valid)
**Use `||` for**: Boolean-only checks

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**`??`** = "Use default only if actually missing (null/undefined)".

```javascript
0 ?? 100    // 0 (0 is valid, not "missing")
null ?? 100 // 100 (null is "missing")
```

vs `||` = "Use default if falsy":
```javascript
0 || 100    // 100 (0 is falsy)
null || 100 // 100 (null is falsy)
```

Use `??` when 0, false, or "" are valid values!

</details>

### Resources

- [MDN: Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [JavaScript.info: Nullish Coalescing](https://javascript.info/nullish-coalescing-operator)
- [TC39 Nullish Coalescing Proposal](https://github.com/tc39/proposal-nullish-coalescing)

---

## Question 4: What is the spread operator (...) in JavaScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain the spread operator (`...`). Provide examples of its use with arrays and objects.

### Answer

The **spread operator** (`...`) expands iterables (arrays, strings) or object properties into individual elements.

1. **Array Operations**
   - Copy arrays (shallow)
   - Concatenate arrays
   - Pass array as function arguments
   - Add elements easily

2. **Object Operations**
   - Copy objects (shallow)
   - Merge objects
   - Add/override properties
   - Clone with modifications

3. **Key Behaviors**
   - Creates shallow copies (nested objects are references!)
   - Later properties override earlier ones
   - Works with any iterable
   - Syntactically simple

4. **Common Use Cases**
   - Immutable updates
   - React state updates
   - Merging configurations
   - Function argument spreading

5. **Spread vs Rest**
   - Spread: **expands** into individual elements
   - Rest: **collects** individual elements into array

### Code Example

```javascript
// 1. ARRAY SPREADING - COPY

const original = [1, 2, 3];
const copy = [...original];

console.log(copy); // [1, 2, 3]
console.log(copy === original); // false (new array!)

copy.push(4);
console.log(original); // [1, 2, 3] (unchanged)
console.log(copy);     // [1, 2, 3, 4]

// 2. ARRAY SPREADING - CONCATENATE

const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// Traditional
const combined1 = arr1.concat(arr2);

// Spread
const combined2 = [...arr1, ...arr2];
console.log(combined2); // [1, 2, 3, 4, 5, 6]

// Add elements in between
const mixed = [0, ...arr1, 3.5, ...arr2, 7];
console.log(mixed); // [0, 1, 2, 3, 3.5, 4, 5, 6, 7]

// 3. ARRAY SPREADING - FUNCTION ARGUMENTS

function sum(a, b, c) {
  return a + b + c;
}

const numbers = [1, 2, 3];

// Traditional
sum.apply(null, numbers); // 6

// Spread
sum(...numbers); // 6

// With Math functions
const nums = [5, 2, 8, 1, 9];
console.log(Math.max(...nums)); // 9
console.log(Math.min(...nums)); // 1

// 4. OBJECT SPREADING - COPY

const user = { name: "Alice", age: 25 };
const userCopy = { ...user };

console.log(userCopy); // { name: "Alice", age: 25 }
console.log(userCopy === user); // false (new object!)

userCopy.age = 26;
console.log(user.age); // 25 (unchanged)

// 5. OBJECT SPREADING - MERGE

const defaults = { theme: "light", language: "en" };
const userSettings = { theme: "dark", notifications: true };

const settings = { ...defaults, ...userSettings };
console.log(settings);
// { theme: "dark", language: "en", notifications: true }
// userSettings.theme overrides defaults.theme

// 6. OBJECT SPREADING - ADD/OVERRIDE PROPERTIES

const user = { name: "Alice", age: 25 };

// Add property
const withEmail = { ...user, email: "alice@example.com" };

// Override property
const withNewAge = { ...user, age: 26 };

// Multiple changes
const updated = {
  ...user,
  age: 26,
  city: "Boston",
  isActive: true
};

// 7. SHALLOW COPY WARNING!

const original = {
  name: "Alice",
  address: {
    city: "Boston"
  }
};

const copy = { ...original };

// Top-level property: independent
copy.name = "Bob";
console.log(original.name); // "Alice" (unchanged)

// Nested object: SHARED REFERENCE!
copy.address.city = "NYC";
console.log(original.address.city); // "NYC" (changed!)

// Deep copy needed for nested objects
const deepCopy = {
  ...original,
  address: { ...original.address }
};

// 8. STRING SPREADING

const str = "hello";
const chars = [...str];
console.log(chars); // ["h", "e", "l", "l", "o"]

// Create array from string
const letters = [..."abc"];
console.log(letters); // ["a", "b", "c"]

// 9. SET AND MAP SPREADING

const set = new Set([1, 2, 3, 4, 5]);
const arr = [...set];
console.log(arr); // [1, 2, 3, 4, 5]

// Remove duplicates from array
const nums = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(nums)];
console.log(unique); // [1, 2, 3, 4]

// 10. REACT STATE UPDATES (IMMUTABLE PATTERN)

// Array state
const [items, setItems] = useState([1, 2, 3]);

// Add item
setItems([...items, 4]);

// Remove item
setItems(items.filter(item => item !== 2));

// Update item
setItems(items.map(item => item === 2 ? 20 : item));

// Object state
const [user, setUser] = useState({ name: "Alice", age: 25 });

// Update property
setUser({ ...user, age: 26 });

// Update nested property
setUser({
  ...user,
  address: {
    ...user.address,
    city: "NYC"
  }
});

// 11. FUNCTION DEFAULT PARAMETERS WITH SPREADING

function createUser(overrides = {}) {
  const defaults = {
    name: "Guest",
    age: 18,
    role: "user",
    active: true
  };

  return { ...defaults, ...overrides };
}

console.log(createUser());
// { name: "Guest", age: 18, role: "user", active: true }

console.log(createUser({ name: "Alice", role: "admin" }));
// { name: "Alice", age: 18, role: "admin", active: true }

// 12. COMBINING ARRAYS AND OBJECTS

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

// Add new user
const newUsers = [...users, { id: 3, name: "Charlie" }];

// Update user
const updatedUsers = users.map(user =>
  user.id === 2 ? { ...user, name: "Robert" } : user
);

// 13. SPREAD VS REST

// Spread: Expands array into individual elements
const nums = [1, 2, 3];
console.log(...nums); // 1 2 3 (three separate arguments)

// Rest: Collects individual elements into array
function sum(...numbers) { // rest parameter
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

// 14. PRACTICAL - MERGING CONFIGURATIONS

const defaultConfig = {
  timeout: 5000,
  retries: 3,
  cache: true,
  headers: {
    "Content-Type": "application/json"
  }
};

const userConfig = {
  timeout: 10000,
  headers: {
    "Authorization": "Bearer token"
  }
};

// Naive merge (headers get completely replaced!)
const config1 = { ...defaultConfig, ...userConfig };
console.log(config1.headers);
// { Authorization: "Bearer token" }
// Lost Content-Type!

// Correct merge (deep merge headers)
const config2 = {
  ...defaultConfig,
  ...userConfig,
  headers: {
    ...defaultConfig.headers,
    ...userConfig.headers
  }
};
console.log(config2.headers);
// { "Content-Type": "application/json", "Authorization": "Bearer token" }
```

### Common Mistakes

- ❌ **Mistake:** Thinking spread creates deep copy
  ```javascript
  const original = { name: "Alice", address: { city: "Boston" } };
  const copy = { ...original };

  copy.address.city = "NYC";
  console.log(original.address.city); // "NYC" (changed!)
  ```

- ❌ **Mistake:** Wrong spread order
  ```javascript
  const defaults = { theme: "light" };
  const user = { theme: "dark" };

  // Wrong: defaults override user
  const settings = { ...user, ...defaults };
  // theme: "light" (wanted "dark"!)

  // Correct
  const settings = { ...defaults, ...user };
  // theme: "dark"
  ```

- ✅ **Correct:** Use spread for shallow copies and immutable updates
  ```javascript
  // Shallow copy is fine for primitives
  const newUser = { ...user, age: 26 };

  // Deep copy for nested objects
  const newConfig = {
    ...config,
    headers: { ...config.headers, newHeader: "value" }
  };
  ```

### Follow-up Questions

- "What is the difference between spread and rest operators?"
- "Does spread create a deep copy or shallow copy?"
- "How do you merge two objects with nested properties?"
- "Can you use spread with strings?"
- "What happens when spreading objects with duplicate keys?"

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Spread creates shallow copy**: Copies first level only. Nested objects/arrays still referenced. For deep copy, use `structuredClone()` or libraries.

**Performance**: Array spread ~O(n). Object spread slower (~2-3x array) due to property descriptor checks.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** Spread used for "deep clone" but nested objects shared reference, causing mutation bugs:
```javascript
const copy = {...original};  // Shallow only!
copy.nested.value = 'changed';  // ❌ Mutates original.nested too
```

**Fix**: Deep clone for nested structures:
```javascript
const copy = structuredClone(original);  // True deep copy ✅
```

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Spread pros**: Concise, immutable updates, flexible merging
**Cons**: Shallow copy only, slower than `.slice()` for arrays

**Use for**: Immutable state updates (React), merging objects. **Avoid for**: Deep structures (use structuredClone).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Spread (`...`)** = "Unpack" items from array/object.

```javascript
const arr = [1, 2, 3];
const copy = [...arr];  // [1, 2, 3] (new array, same values)

const obj = {a: 1};
const merged = {...obj, b: 2};  // {a: 1, b: 2}
```

Like emptying a bag of items onto a table. Items stay same, but now spread out.

</details>

### Resources

- [MDN: Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [JavaScript.info: Spread Operator](https://javascript.info/rest-parameters-spread#spread-syntax)

---

## Question 5: What are template literals in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain template literals (template strings). What are their advantages?

### Answer

**Template literals** are string literals allowing embedded expressions, multi-line strings, and string interpolation using backticks (\`).

1. **Features**
   - String interpolation with `${expression}`
   - Multi-line strings (no \n needed)
   - Expression evaluation
   - Tagged templates (advanced)

2. **Advantages**
   - Cleaner string concatenation
   - No escape characters for quotes
   - Embedded expressions
   - Better readability

### Code Example

```javascript
// 1. STRING INTERPOLATION
const name = "Alice";
const age = 25;

// Old way
const greeting1 = "Hello, " + name + "! You are " + age + " years old.";

// Template literal way
const greeting2 = `Hello, ${name}! You are ${age} years old.`;

// 2. EXPRESSIONS
const a = 5;
const b = 10;

console.log(`Sum: ${a + b}`);        // "Sum: 15"
console.log(`Product: ${a * b}`);    // "Product: 50"
console.log(`Comparison: ${a < b}`); // "Comparison: true"

// 3. MULTI-LINE STRINGS
// Old way
const html1 = "<div>\n" +
              "  <h1>Title</h1>\n" +
              "  <p>Content</p>\n" +
              "</div>";

// Template literal way
const html2 = `<div>
  <h1>Title</h1>
  <p>Content</p>
</div>`;

// 4. FUNCTION CALLS
function getGreeting(time) {
  return time < 12 ? "Good morning" : "Good afternoon";
}

const time = 10;
console.log(`${getGreeting(time)}, Alice!`); // "Good morning, Alice!"

// 5. NESTED TEMPLATES
const user = { name: "Alice", isAdmin: true };
const message = `User: ${user.name} (${user.isAdmin ? "Admin" : "User"})`;

// 6. TAGGED TEMPLATES (ADVANCED)
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return `${result}${str}<strong>${values[i] || ""}</strong>`;
  }, "");
}

const name = "Alice";
const score = 95;
const result = highlight`${name} scored ${score} points`;
// "<strong>Alice</strong> scored <strong>95</strong> points"
```

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**V8 Optimization**: Template literals compiled to string concatenation. Performance identical to `+` operator after JIT compilation (~5-10ns per interpolation).

**Tagged templates** enable custom string processing (sanitization, i18n, SQL queries).

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem:** SQL injection vulnerability from string concatenation:
```javascript
const query = "SELECT * FROM users WHERE id = " + userId;  // ❌ Unsafe!
```

**Fix**: Tagged template with parameter escaping:
```javascript
const query = sql`SELECT * FROM users WHERE id = ${userId}`;  // ✅ Escaped
```

Tagged templates sanitize inputs automatically, preventing injection.

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Template literals pros**: Readable, multi-line, expression support, tagged templates
**Cons**: Slightly larger bundle size (backticks less compressible than quotes)

**Use for**: Dynamic strings, HTML/SQL generation, multi-line. **Avoid for**: Static strings (use regular strings).

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Template literals** = Strings with superpowers using backticks (\`).

```javascript
const name = "Alice";
const age = 25;

// Old way (hard to read):
"Hello, " + name + "! You are " + age + " years old."

// Template literal (easy to read):
`Hello, ${name}! You are ${age} years old.`
```

**${...}** = Insert any JavaScript expression into string.

</details>

### Resources

- [MDN: Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

---

