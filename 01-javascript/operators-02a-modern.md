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
<summary><strong>🔍 Deep Dive: How Short-Circuit Evaluation Works Internally</strong></summary>

**V8 Engine Implementation:**

```javascript
// Your code:
const result = a || b || c;

// V8's internal algorithm (simplified):
function evaluateOR(expressions) {
  for (const expr of expressions) {
    const value = evaluate(expr);
    if (isTruthy(value)) {
      return value; // Short-circuit: stop immediately
    }
  }
  return value; // All falsy, return last
}

// Truthiness check (~1-2 CPU cycles):
function isTruthy(value) {
  // Fast path for common types
  if (value === false) return false;
  if (value === null) return false;
  if (value === undefined) return false;
  if (value === 0) return false;
  if (value === "") return false;
  if (value !== value) return false; // NaN check
  return true;
}
```

**How && Short-Circuit Works:**

```javascript
// Your code:
const result = a && b && c;

// V8's internal algorithm (simplified):
function evaluateAND(expressions) {
  for (const expr of expressions) {
    const value = evaluate(expr);
    if (!isTruthy(value)) {
      return value; // Short-circuit: stop at first falsy
    }
  }
  return value; // All truthy, return last
}

// Example execution:
true && false && expensiveFunction()
// Step 1: Evaluate true → truthy, continue
// Step 2: Evaluate false → falsy, STOP and return false
// expensiveFunction() never called!
```

**AST (Abstract Syntax Tree) Optimization:**

```javascript
// Code:
function check() {
  return isEnabled && hasPermission && isActive;
}

// TurboFan (V8's optimizing compiler) creates:
// 1. Load isEnabled
// 2. Check truthiness → if falsy, return early
// 3. Load hasPermission → if falsy, return early
// 4. Load isActive → return its value

// No function call overhead after optimization
// Pure register operations (fastest possible)
```

**Performance Benchmarks:**

```javascript
// Benchmark: 10 million iterations

// Test 1: No short-circuit (bitwise operators)
console.time('no-short-circuit');
for (let i = 0; i < 10000000; i++) {
  const result = (1 | 0) | expensiveCheck(); // Always evaluates all
}
console.timeEnd('no-short-circuit'); // ~450ms

// Test 2: With short-circuit (logical operators)
console.time('short-circuit');
for (let i = 0; i < 10000000; i++) {
  const result = 1 || 0 || expensiveCheck(); // Stops at 1
}
console.timeEnd('short-circuit'); // ~12ms

// 37x faster! Short-circuit skips expensiveCheck()

function expensiveCheck() {
  let sum = 0;
  for (let j = 0; j < 1000; j++) sum += j;
  return sum;
}
```

**Memory Efficiency:**

```javascript
// Short-circuit prevents unnecessary allocations

// ❌ Without short-circuit: Always creates array
function getUsers() {
  const cached = getCachedUsers();
  const fresh = cached || fetchUsersFromAPI(); // Always fetches!
  return fresh;
}

// Every call:
// 1. Call getCachedUsers() → may allocate array
// 2. Call fetchUsersFromAPI() → ALWAYS allocates array (wasted!)
// 3. Return one of them

// ✅ With short-circuit: Only allocates when needed
function getUsersBetter() {
  return getCachedUsers() || fetchUsersFromAPI();
}

// Only calls fetchUsersFromAPI() if getCachedUsers() returns falsy
// Saves ~50KB per call when cache hit
// With 10,000 requests/sec: Saves 500MB/sec!
```

**TurboFan Inline Caching:**

```javascript
// V8 optimizes hot paths with inline caching

function processUser(user) {
  // First 100 calls: V8 observes pattern
  // After warming up: Inline cache created
  const name = user && user.name && user.name.toUpperCase();
  return name || "GUEST";
}

// Cold state (first call):
// - Check user truthiness (slow polymorphic check)
// - Check user.name truthiness
// - Call toUpperCase()
// - Check result truthiness
// Total: ~50ns

// Hot state (after 10,000 calls):
// - V8 knows user is always object with name property
// - Inlines property access (no hash lookup)
// - Inlines toUpperCase call
// - Uses fast path for truthiness checks
// Total: ~5ns (10x faster!)
```

**Short-Circuit vs Ternary Performance:**

```javascript
// Benchmark comparison

// Pattern 1: Short-circuit
const value1 = cache || computeValue();

// Pattern 2: Ternary
const value2 = cache ? cache : computeValue();

// Pattern 3: If-else
let value3;
if (cache) {
  value3 = cache;
} else {
  value3 = computeValue();
}

// Performance (1 million iterations):
// Short-circuit: 12ms
// Ternary: 12ms (identical after optimization!)
// If-else: 14ms (slightly slower due to scope)

// Takeaway: Use short-circuit for readability, performance is equivalent
```

**Truthiness Caching in V8:**

```javascript
// V8 caches truthiness results for repeated checks

function validate(input) {
  // First check
  if (input && input.length > 0) {
    // V8 remembers: input was truthy
    // Second check (optimized)
    const processed = input && processInput(input);
    // V8 uses cached truthiness → faster!
    return processed;
  }
}

// After JIT optimization:
// - First input check: ~2ns (truthiness check)
// - Second input check: ~0.5ns (cached result)
```

**Deoptimization Traps:**

```javascript
// ❌ BAD: Polymorphic short-circuit (deoptimizes)
function getDefault(value) {
  return value || "default";
}

getDefault(undefined);     // Optimizes for undefined
getDefault(null);          // Still optimized
getDefault(0);             // Still optimized
getDefault(false);         // Still optimized
getDefault({ obj: true }); // DEOPTIMIZATION! (different type)
getDefault([1, 2, 3]);     // Another deoptimization

// V8 gives up optimizing → falls back to slow interpreter

// ✅ GOOD: Monomorphic short-circuit (stays optimized)
function getDefaultString(value) {
  return value || "default"; // Only strings or undefined
}

getDefaultString(undefined);
getDefaultString("");
getDefaultString("hello");
// All strings/undefined → stays optimized!
```

**Lazy Evaluation with Short-Circuit:**

```javascript
// Short-circuit enables lazy evaluation patterns

// Pattern: Lazy initialization
class HeavyResource {
  #instance = null;

  getInstance() {
    // Only create instance when needed
    return this.#instance || (this.#instance = new ExpensiveClass());
  }
}

// First call: Creates instance (~100ms)
// Subsequent calls: Returns cached (~1ns)

// Pattern: Lazy loading
const getConfig = () => {
  let config = null;
  return () => config || (config = loadConfigFromDisk());
};

const config = getConfig();
config(); // Loads from disk (slow)
config(); // Returns cached (fast)
config(); // Returns cached (fast)
```

**Comparison with Other Languages:**

```javascript
// JavaScript (always short-circuits):
const result = expensive1() || expensive2() || expensive3();
// Stops at first truthy

// Java (also short-circuits):
boolean result = expensive1() || expensive2() || expensive3();
// Same behavior

// Python (also short-circuits):
result = expensive1() or expensive2() or expensive3()
// Same behavior

// SQL (NO short-circuit!):
SELECT * FROM users WHERE expensive1() OR expensive2();
-- Both functions always execute!

// Bitwise OR (NO short-circuit in any language):
const result = expensive1() | expensive2(); // Always evaluates both
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Performance Crisis from Missing Short-Circuit</strong></summary>

**Scenario:** Your e-commerce site is experiencing 95% slower page loads during peak hours. Investigation reveals developers misunderstanding short-circuit evaluation, causing thousands of unnecessary API calls.

**The Problem:**

```javascript
// ❌ BUG: Using bitwise OR instead of logical OR
function checkUserPermissions(userId) {
  // Bitwise OR (|) does NOT short-circuit!
  const hasAccess =
    checkCache(userId) |           // Always executes
    checkDatabase(userId) |        // Always executes
    checkExternalAPI(userId);      // Always executes (500ms!)

  return hasAccess;
}

// Every page load:
// - Checks cache (~1ms)
// - Checks database (~50ms) ← Unnecessary if cache hit
// - Calls external API (~500ms) ← Unnecessary if database hit
// Total: ~551ms PER REQUEST

// With 100 req/sec during peak:
// - 100 × 551ms = 55,100ms of work per second
// - Server can only handle ~20 req/sec
// - Queue backs up → users see 5-10 second page loads
```

**Production Metrics (Before Fix):**

```javascript
// Monitoring dashboard:
{
  avgPageLoad: "8.5 seconds",
  p95PageLoad: "15.2 seconds",
  apiCallsPerSec: 300,          // 3x expected!
  cacheHitRate: "85%",          // Good cache, but not leveraged
  databaseQueriesPerSec: 300,   // Should be ~15 (only cache misses)
  externalAPICallsPerSec: 300,  // Should be ~3 (only DB misses)
  serverCPU: "95%",             // Maxed out
  errorRate: "12%",             // Timeouts and crashes
  usersAbandoning: "45%",       // Terrible!
  revenueImpact: "-$50k/day"    // Emergency!
}
```

**Debugging Process:**

```javascript
// Step 1: Profile API calls
console.log('Cache check started');
const cacheResult = checkCache(userId);
console.log('Cache result:', cacheResult, 'Time:', Date.now());

console.log('Database check started');
const dbResult = checkDatabase(userId);
console.log('Database result:', dbResult, 'Time:', Date.now());

console.log('API check started');
const apiResult = checkExternalAPI(userId);
console.log('API result:', apiResult, 'Time:', Date.now());

// Logs show:
// Cache check started
// Cache result: 1 (true!) Time: 1000
// Database check started ← WHY? Cache hit!
// Database result: 1 Time: 1050
// API check started ← WHY? DB hit!
// API result: 1 Time: 1550

// Step 2: Identify the operator
console.log('Using operator:', '|'); // AHA! Bitwise OR!
// Bitwise | always evaluates all operands
// Logical || short-circuits

// Step 3: Reproduce in isolation
function testShortCircuit() {
  let calls = 0;

  function track(name) {
    calls++;
    console.log(`${name} called (total: ${calls})`);
    return 1;
  }

  // Test 1: Bitwise OR
  calls = 0;
  const result1 = track('A') | track('B') | track('C');
  console.log('Bitwise OR calls:', calls); // 3 (all called!)

  // Test 2: Logical OR
  calls = 0;
  const result2 = track('A') || track('B') || track('C');
  console.log('Logical OR calls:', calls); // 1 (short-circuit!)
}

testShortCircuit();
// Output:
// A called (total: 1)
// B called (total: 2)
// C called (total: 3)
// Bitwise OR calls: 3
// A called (total: 1)
// Logical OR calls: 1 ← Only one call!
```

**Solution 1: Fix Operator:**

```javascript
// ✅ FIX: Change bitwise OR to logical OR
function checkUserPermissions(userId) {
  // Logical OR (||) short-circuits!
  const hasAccess =
    checkCache(userId) ||          // Check cache first
    checkDatabase(userId) ||       // Only if cache miss
    checkExternalAPI(userId);      // Only if DB miss

  return hasAccess;
}

// Now:
// - Cache hit (85% of requests): ~1ms (skips DB + API)
// - DB hit (13% of requests): ~51ms (skips API)
// - API needed (2% of requests): ~551ms
//
// Average: (0.85 × 1) + (0.13 × 51) + (0.02 × 551) = 18.5ms
// 30x faster!
```

**Solution 2: Add Caching Layer:**

```javascript
// ✅ BETTER: Add in-memory cache with short-circuit
class PermissionChecker {
  #memoryCache = new Map();
  #CACHE_TTL = 60000; // 1 minute

  checkUserPermissions(userId) {
    // Level 1: In-memory cache (fastest, ~0.01ms)
    const cached = this.#memoryCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.#CACHE_TTL) {
      return cached.value;
    }

    // Level 2: Redis cache (~1ms)
    const redisResult = checkCache(userId);
    if (redisResult) {
      this.#memoryCache.set(userId, {
        value: redisResult,
        timestamp: Date.now()
      });
      return redisResult;
    }

    // Level 3: Database (~50ms)
    const dbResult = checkDatabase(userId);
    if (dbResult) {
      this.#memoryCache.set(userId, {
        value: dbResult,
        timestamp: Date.now()
      });
      return dbResult;
    }

    // Level 4: External API (~500ms)
    const apiResult = checkExternalAPI(userId);
    this.#memoryCache.set(userId, {
      value: apiResult,
      timestamp: Date.now()
    });
    return apiResult;
  }
}

// Performance:
// - Memory cache hit (95%): ~0.01ms
// - Redis cache hit (3%): ~1ms
// - Database hit (1.5%): ~51ms
// - API call (0.5%): ~551ms
//
// Average: (0.95 × 0.01) + (0.03 × 1) + (0.015 × 51) + (0.005 × 551) = 3.6ms
// 153x faster than original!
```

**Solution 3: Add Monitoring:**

```javascript
// ✅ BEST: Add metrics to catch issues early
class PermissionChecker {
  #metrics = {
    memoryHits: 0,
    redisHits: 0,
    dbHits: 0,
    apiCalls: 0,
    totalRequests: 0
  };

  checkUserPermissions(userId) {
    this.#metrics.totalRequests++;

    // Memory cache check
    const memCached = this.#getFromMemory(userId);
    if (memCached) {
      this.#metrics.memoryHits++;
      return memCached;
    }

    // Redis cache check
    const redisCached = checkCache(userId);
    if (redisCached) {
      this.#metrics.redisHits++;
      return redisCached;
    }

    // Database check
    const dbResult = checkDatabase(userId);
    if (dbResult) {
      this.#metrics.dbHits++;
      return dbResult;
    }

    // External API (last resort)
    this.#metrics.apiCalls++;
    return checkExternalAPI(userId);
  }

  getMetrics() {
    const total = this.#metrics.totalRequests;
    return {
      ...this.#metrics,
      memoryHitRate: `${((this.#metrics.memoryHits / total) * 100).toFixed(1)}%`,
      redisHitRate: `${((this.#metrics.redisHits / total) * 100).toFixed(1)}%`,
      dbHitRate: `${((this.#metrics.dbHits / total) * 100).toFixed(1)}%`,
      apiCallRate: `${((this.#metrics.apiCalls / total) * 100).toFixed(1)}%`
    };
  }
}

// Monitor every minute:
setInterval(() => {
  const metrics = checker.getMetrics();
  console.log('Permission check metrics:', metrics);

  // Alert if API calls too high
  if (metrics.apiCalls > 10) {
    alert('WARNING: Too many external API calls! Check cache.');
  }
}, 60000);
```

**Real Production Metrics (After Fix):**

```javascript
// After implementing Solution 2 + 3:
{
  avgPageLoad: "285ms",          // 30x faster (was 8.5s)
  p95PageLoad: "450ms",          // 33x faster (was 15.2s)
  apiCallsPerSec: 3,             // 100x fewer (was 300)
  cacheHitRate: "98%",           // Improved (was 85%)
  databaseQueriesPerSec: 15,     // 20x fewer (was 300)
  externalAPICallsPerSec: 3,     // 100x fewer (was 300)
  serverCPU: "15%",              // 80% reduction (was 95%)
  errorRate: "0.3%",             // 40x better (was 12%)
  usersAbandoning: "3%",         // 15x better (was 45%)
  revenueImpact: "+$52k/day"     // Emergency averted!
}
```

**Cost Savings:**

```javascript
// Before fix:
// - External API: $0.01 per call × 300 calls/sec × 86,400 sec/day = $259,200/day
// - Database: Overloaded, needed 10 servers @ $500/day = $5,000/day
// - Lost revenue: $50,000/day
// Total cost: $314,200/day

// After fix:
// - External API: $0.01 × 3 calls/sec × 86,400 sec/day = $2,592/day
// - Database: Normal load, only 2 servers @ $500/day = $1,000/day
// - Lost revenue: $0/day
// Total cost: $3,592/day

// SAVINGS: $310,608/day = $9.3 million/month!
```

**Additional Bugs Found:**

```javascript
// During investigation, found more bitwise operator mistakes:

// ❌ BUG 2: Bitwise AND instead of logical AND
function shouldShowFeature(user) {
  // Bitwise & always evaluates all
  return user.isActive & user.isPremium & hasFeatureFlag('new-ui');
  // hasFeatureFlag() called even if user.isActive is false!
}

// ✅ FIX:
function shouldShowFeature(user) {
  return user.isActive && user.isPremium && hasFeatureFlag('new-ui');
  // Short-circuits if user.isActive is false
}

// Saved: 10,000 unnecessary feature flag checks per second
```

**Lessons Learned:**

```javascript
// 1. Always use logical operators (||, &&) for conditions
// 2. Bitwise operators (|, &) are for bit manipulation, NOT conditions
// 3. Add metrics to catch performance issues early
// 4. Leverage multiple cache layers (memory → Redis → DB → API)
// 5. Short-circuit evaluation is critical for performance
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Short-Circuit Patterns</strong></summary>

**1. Short-Circuit OR (||) vs Nullish Coalescing (??):**

```javascript
// Pattern 1: OR operator (||)
const value1 = input || "default";

// Pattern 2: Nullish coalescing (??)
const value2 = input ?? "default";
```

| Aspect | `||` Operator | `??` Operator |
|--------|--------------|---------------|
| **Handles undefined** | ✅ Yes | ✅ Yes |
| **Handles null** | ✅ Yes (treats as falsy) | ✅ Yes (treats as nullish) |
| **Handles 0** | ❌ Treats as falsy | ✅ Keeps 0 |
| **Handles false** | ❌ Treats as falsy | ✅ Keeps false |
| **Handles ""** | ❌ Treats as falsy | ✅ Keeps "" |
| **Short-circuits** | ✅ Yes | ✅ Yes |
| **Use case** | Default for any falsy | Default for null/undefined only |
| **Performance** | ✅ Slightly faster (~2%) | ⚠️ Minimal overhead |

**When to use each:**

```javascript
// ✅ Use || when you want to treat ALL falsy as missing:
function setVolume(volume) {
  return volume || 50; // 0 → 50 (intended: 0 volume = no setting)
}

// ✅ Use ?? when 0, false, "" are valid values:
function createUser(age) {
  return { age: age ?? 18 }; // 0 is valid age (baby)
}

createUser(0);  // { age: 0 } with ??, { age: 18 } with ||
createUser(25); // { age: 25 } (both work)
```

**2. Short-Circuit AND (&&) vs Ternary:**

```javascript
// Pattern 1: Short-circuit AND
const result1 = condition && expensiveOperation();

// Pattern 2: Ternary
const result2 = condition ? expensiveOperation() : undefined;

// Pattern 3: If statement
let result3;
if (condition) {
  result3 = expensiveOperation();
}
```

| Aspect | `&&` Short-Circuit | Ternary | If Statement |
|--------|-------------------|---------|--------------|
| **Conciseness** | ✅ Very concise | ⚠️ More verbose | ❌ Most verbose |
| **Readability** | ⚠️ Can be cryptic | ✅ Clear intent | ✅ Very clear |
| **Return value** | ✅ Returns result | ✅ Returns result | ⚠️ Need variable |
| **Performance** | ✅ Fastest | ✅ Same (optimized) | ⚠️ Slightly slower |
| **Use in JSX** | ✅ Common pattern | ✅ Works well | ❌ Requires IIFE |

**When to use each:**

```javascript
// ✅ Use && for conditional rendering/execution:
user.isAdmin && renderAdminPanel();
hasData && processData();

// ✅ Use ternary when you need both branches:
const greeting = user ? `Hello, ${user.name}` : "Hello, Guest";

// ✅ Use if/else for complex logic:
if (user && user.isActive && user.hasPermission('admin')) {
  grantAdminAccess();
  logAdminAction();
  sendNotification();
} else {
  denyAccess();
}
```

**3. Chained Short-Circuit vs If-Else Ladder:**

```javascript
// Pattern 1: Chained short-circuit
const value = getFromCache() || getFromDB() || getFromAPI() || "default";

// Pattern 2: If-else ladder
let value;
if (getFromCache()) {
  value = getFromCache(); // ❌ Called twice!
} else if (getFromDB()) {
  value = getFromDB(); // ❌ Called twice!
} else if (getFromAPI()) {
  value = getFromAPI(); // ❌ Called twice!
} else {
  value = "default";
}

// Pattern 3: If-else with temp variables
let value;
const cached = getFromCache();
if (cached) {
  value = cached;
} else {
  const fromDB = getFromDB();
  if (fromDB) {
    value = fromDB;
  } else {
    const fromAPI = getFromAPI();
    value = fromAPI || "default";
  }
}
```

| Aspect | Chained || | If-Else Ladder | If-Else with Temps |
|--------|-----------|----------------|-------------------|
| **Conciseness** | ✅ One line | ❌ 10+ lines | ⚠️ 8+ lines |
| **Performance** | ✅ Calls once | ❌ Calls twice | ✅ Calls once |
| **Readability** | ✅ Clear flow | ⚠️ Verbose | ⚠️ Nested |
| **Debugging** | ⚠️ Harder | ✅ Easy | ✅ Easy |

**4. Short-Circuit for Defaults vs Object.assign:**

```javascript
// Pattern 1: Short-circuit with destructuring
function createUser({ name = "Guest", age = 18 } = {}) {
  return { name, age };
}

// Pattern 2: Object.assign
function createUserAssign(options = {}) {
  return Object.assign({ name: "Guest", age: 18 }, options);
}

// Pattern 3: Spread operator
function createUserSpread(options = {}) {
  return { name: "Guest", age: 18, ...options };
}
```

| Aspect | Destructuring | Object.assign | Spread |
|--------|--------------|---------------|--------|
| **Readability** | ✅ Very clear | ⚠️ OK | ✅ Clean |
| **Performance** | ✅ Fastest | ❌ Slower (iteration) | ✅ Fast |
| **Partial override** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Works with null** | ❌ No (crashes) | ✅ Yes | ✅ Yes |
| **Extra properties** | ✅ Ignored | ✅ Copied | ✅ Copied |

**5. Guard Clauses vs Short-Circuit:**

```javascript
// Pattern 1: Short-circuit AND
function processUser(user) {
  user && user.isActive && sendNotification(user);
}

// Pattern 2: Guard clause
function processUserGuard(user) {
  if (!user) return;
  if (!user.isActive) return;
  sendNotification(user);
}

// Pattern 3: Combined check
function processUserCombined(user) {
  if (!user || !user.isActive) return;
  sendNotification(user);
}
```

| Aspect | Short-Circuit | Guard Clause | Combined Check |
|--------|--------------|--------------|----------------|
| **Readability** | ⚠️ Can be cryptic | ✅ Very clear | ✅ Clear |
| **Debuggability** | ❌ Hard | ✅ Easy | ✅ Easy |
| **Line count** | ✅ One line | ⚠️ Multiple | ⚠️ Two lines |
| **Explicitness** | ⚠️ Implicit | ✅ Explicit | ✅ Explicit |

**When to use:**
- **Short-circuit:** Simple conditions, one-liners, React JSX
- **Guard clauses:** Complex logic, multiple conditions, better debugging
- **Combined:** Balance of conciseness and clarity

**6. Performance Trade-offs:**

```javascript
// Scenario: Checking expensive conditions

// ❌ BAD: Expensive condition first
const result = expensiveDatabaseCheck() || quickMemoryCheck();
// Always does expensive check first

// ✅ GOOD: Cheap condition first
const result = quickMemoryCheck() || expensiveDatabaseCheck();
// Often short-circuits before expensive check

// Performance impact:
// Bad: 100% of calls do expensive check (~50ms)
// Good: Only 5% do expensive check (95% short-circuit)
// Savings: 95% × 50ms = 47.5ms average
```

**Optimization priorities:**
1. Cheapest checks first (memory > cache > DB > API)
2. Most likely to succeed first (80% success rate before 20%)
3. Least side effects first (reads before writes)

**7. Readability Trade-offs:**

```javascript
// Complex short-circuit (hard to read)
const data =
  user?.preferences?.theme ||
  getUserDefaults()?.theme ||
  getSystemDefaults()?.theme ||
  "light";

// Clearer alternative
function getUserTheme(user) {
  if (user?.preferences?.theme) {
    return user.preferences.theme;
  }

  const userDefaults = getUserDefaults();
  if (userDefaults?.theme) {
    return userDefaults.theme;
  }

  const systemDefaults = getSystemDefaults();
  return systemDefaults?.theme || "light";
}
```

**Rule of thumb:**
- **1-2 short-circuits:** Use inline
- **3-4 short-circuits:** Consider readability
- **5+ short-circuits:** Use if/else or function extraction

</details>

<details>
<summary><strong>💬 Explain to Junior: Short-Circuit Evaluation Simplified</strong></summary>

**Simple Analogy: Lazy Decision Making**

Think of short-circuit evaluation like being lazy (in a good way!):

```javascript
// Scenario: Checking if you should go to the gym

// WITHOUT short-circuit (check everything):
const shouldGoToGym =
  hasTime() &
  hasEnergy() &
  hasCleanClothes() &
  gymIsOpen();

// Must check ALL conditions even if you don't have time!

// WITH short-circuit (stop early):
const shouldGoToGym =
  hasTime() &&
  hasEnergy() &&
  hasCleanClothes() &&
  gymIsOpen();

// If hasTime() is false, don't bother checking the rest!
```

**Real-World Example:**

```javascript
// You're choosing where to eat:

// OR (||): "Give me the first available option"
const restaurant =
  fridgeHasFood() ||      // Check fridge first (easiest)
  orderDelivery() ||      // If fridge empty, order food
  goToRestaurant();       // Last resort: go out

// Stops as soon as one returns true!
// If fridge has food, never even looks at delivery

// AND (&&): "Only proceed if everything is good"
const canCook =
  hasIngredients() &&     // Have ingredients?
  hasTime() &&            // Have time?
  knowsRecipe();          // Know how to cook?

// If no ingredients, doesn't check time or recipe
```

**The Key Rule:**

```javascript
// OR (||): Returns first TRUTHY value (or last if all falsy)
console.log(false || 0 || "hello" || "world");  // "hello" (stops here!)
console.log(false || 0 || "");                  // "" (returns last)

// AND (&&): Returns first FALSY value (or last if all truthy)
console.log(true && 5 && "hello" && "world");   // "world" (all truthy!)
console.log(true && 0 && "hello");              // 0 (stops at first falsy!)
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Using & instead of &&
function check() {
  return isAdmin & hasPermission(); // ❌ Bitwise AND (always evaluates both!)
}

// ✅ CORRECT:
function check() {
  return isAdmin && hasPermission(); // ✅ Logical AND (short-circuits!)
}


// ❌ MISTAKE 2: Thinking || always returns true/false
const name = "" || "Guest";
console.log(name); // "Guest" (not true!)

// || returns the actual value, not true/false!


// ❌ MISTAKE 3: Using || with 0 or false
function setCount(count) {
  return count || 0; // ❌ If count is 0, returns 0 anyway (redundant!)
}

setCount(0);  // 0 (wanted 0, but || treats it as falsy)
setCount(5);  // 5

// ✅ CORRECT: Use ?? for numbers
function setCount(count) {
  return count ?? 0; // Only defaults if null/undefined
}

setCount(0);  // 0 ✅
setCount(5);  // 5 ✅
setCount(undefined); // 0 ✅
```

**Visual Example - Why It Matters:**

```javascript
// Scenario: Check if user can access admin panel

// ❌ WITHOUT short-circuit (slow!):
function canAccessAdmin(user) {
  const isAdmin = user.role === "admin";           // Fast (1ms)
  const hasPermission = checkDatabase(user.id);    // Slow (50ms)
  const isVerified = callExternalAPI(user.email);  // Very slow (500ms)

  return isAdmin && hasPermission && isVerified;
  // Total time: 551ms EVERY TIME
}

// ✅ WITH short-circuit (fast!):
function canAccessAdmin(user) {
  return user.role === "admin" &&      // Fast (1ms)
         checkDatabase(user.id) &&     // Only if admin (50ms)
         callExternalAPI(user.email);  // Only if DB check passed (500ms)
}

// If user is NOT admin (90% of cases):
// - Old way: 551ms (checks everything)
// - New way: 1ms (stops immediately)
// 550x faster!
```

**Practical Tips:**

```javascript
// 1. Put cheapest/fastest checks FIRST
// ❌ BAD: Expensive first
const result = checkDatabase() && checkMemory();

// ✅ GOOD: Cheap first
const result = checkMemory() && checkDatabase();


// 2. Put most likely to succeed FIRST (for OR)
// ❌ BAD: Unlikely first
const data = fetchFromAPI() || getFromCache();

// ✅ GOOD: Likely first (cache usually has it)
const data = getFromCache() || fetchFromAPI();


// 3. Put most likely to FAIL FIRST (for AND)
// ❌ BAD: Expensive check first
const canProceed = complexValidation() && simpleCheck();

// ✅ GOOD: Simple check first (fails fast)
const canProceed = simpleCheck() && complexValidation();
```

**Explaining to a PM:**

"Short-circuit evaluation is like being smart about checking things:

**WITHOUT short-circuit:**
- Like checking your wallet, bank account, AND credit cards before buying coffee
- Even if your wallet has money, you check everything
- Wastes time on unnecessary checks

**WITH short-circuit:**
- Check wallet first
- If it has money, stop there! Buy coffee
- Only check bank if wallet is empty
- Only check credit cards if wallet AND bank are empty

**Business Value:**
- Page loads 10-100x faster (better user experience)
- Server costs reduced 90% (fewer database/API calls)
- Fewer crashes (avoid calling functions on null/undefined)
- Example: Our admin check went from 551ms to 1ms for 90% of users"

**Key Takeaways:**

1. **||** = "Give me first truthy" (or last if all falsy)
2. **&&** = "Give me first falsy" (or last if all truthy)
3. **Stops early** = Don't waste time checking everything
4. **Put cheap checks first** = Optimize for common case
5. **Returns actual values** = Not just true/false!

**Quick Quiz:**

```javascript
// What do these return?

// Q1:
false || 0 || "hello" || "world"
// Answer: "hello" (first truthy)

// Q2:
true && 5 && 0 && "never"
// Answer: 0 (first falsy)

// Q3:
null || undefined || "" || 0
// Answer: 0 (all falsy, returns last)

// Q4:
true && "hello" && "world" && 42
// Answer: 42 (all truthy, returns last)
```

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
<summary><strong>🔍 Deep Dive: Optional Chaining Implementation</strong></summary>

**V8 Engine Implementation:**

```javascript
// Your code:
const city = user?.address?.city;

// V8's internal algorithm (simplified):
function optionalChain(obj, ...properties) {
  let current = obj;

  for (const prop of properties) {
    // Null/undefined check at each step
    if (current == null) {  // Checks both null and undefined
      return undefined;
    }
    current = current[prop];
  }

  return current;
}

// Equivalent to:
const city = optionalChain(user, 'address', 'city');

// Step-by-step execution:
// 1. Check: user == null? → No, proceed
// 2. Access: user.address → get value
// 3. Check: user.address == null? → No, proceed
// 4. Access: user.address.city → return value
```

**Babel Transpilation (for older browsers):**

```javascript
// Your ES2020 code:
const city = user?.address?.city;

// Babel transpiles to ES5:
var _user, _user$address;

const city = (_user = user) === null || _user === void 0
  ? void 0
  : (_user$address = _user.address) === null || _user$address === void 0
    ? void 0
    : _user$address.city;

// void 0 is always undefined (safer than using undefined variable)
// Checks for both null and undefined at each step
```

**Performance Benchmarks:**

```javascript
// Benchmark: 1 million iterations

const user = {
  address: {
    city: "Boston",
    zip: "02101"
  }
};

// Test 1: Direct access (no null check)
console.time('direct');
for (let i = 0; i < 1000000; i++) {
  const city = user.address.city;
}
console.timeEnd('direct'); // ~8ms

// Test 2: Manual null checks
console.time('manual-checks');
for (let i = 0; i < 1000000; i++) {
  const city = user && user.address && user.address.city;
}
console.timeEnd('manual-checks'); // ~12ms

// Test 3: Optional chaining
console.time('optional-chaining');
for (let i = 0; i < 1000000; i++) {
  const city = user?.address?.city;
}
console.timeEnd('optional-chaining'); // ~10ms

// Results:
// - Direct access: 100% (baseline)
// - Manual checks: ~50% slower
// - Optional chaining: ~25% slower
//
// Overhead is ~2ns per operation (negligible for most apps)
```

**Memory Impact:**

```javascript
// Optional chaining doesn't allocate extra memory

// Direct access:
const city = user.address.city; // 0 bytes allocated

// Optional chaining:
const city = user?.address?.city; // 0 bytes allocated

// Both access the same memory location
// No intermediate objects created

// Comparison with defensive copying:
const userCopy = user ? { ...user } : null; // Allocates new object!
const addressCopy = userCopy?.address ? { ...userCopy.address } : null;
const city = addressCopy?.city;

// This creates 2 new objects → wastes memory
// Don't do this! Use optional chaining directly
```

**TurboFan Optimization:**

```javascript
// V8's TurboFan can inline optional chaining

function getCity(user) {
  return user?.address?.city;
}

// Cold (first 100 calls):
// 1. Check user nullish
// 2. Load user.address (hash lookup)
// 3. Check address nullish
// 4. Load address.city (hash lookup)
// Total: ~50ns

// Hot (after 10,000 calls):
// 1. Type check: user is object (inline cache hit)
// 2. Load user.address at known offset (no hash lookup)
// 3. Type check: address is object
// 4. Load address.city at known offset
// Total: ~8ns (6x faster!)

// TurboFan inlines the entire chain into a few CPU instructions
```

**Comparison with Logical AND:**

```javascript
// Pattern 1: Optional chaining
const city1 = user?.address?.city;

// Pattern 2: Logical AND
const city2 = user && user.address && user.address.city;

// Differences:

// 1. Nullish vs Falsy:
const user = { address: { city: "" } };

user?.address?.city;            // "" (keeps empty string)
user && user.address && user.address.city; // "" (but would fail if city was 0)

const user2 = { address: { city: 0 } };
user2?.address?.city;           // 0 (keeps 0)
user2 && user2.address && user2.address.city; // 0 (falsy, might cause issues)

// 2. Short-circuiting behavior:
let calls = 0;
function track() {
  calls++;
  return { city: "Boston" };
}

// Optional chaining:
calls = 0;
const city1 = null?.address?.city ?? track();
console.log(calls); // 1 (track called because chain returned undefined)

// Logical AND:
calls = 0;
const city2 = null && null.address && null.address.city || track();
console.log(calls); // 1 (same behavior)
```

**Optional Call Chaining:**

```javascript
// Optional function/method calls

const obj = {
  method() {
    return "result";
  }
};

// Check if method exists before calling
obj.method?.(); // "result"
obj.missing?.(); // undefined (no error!)

// Without optional chaining:
if (obj.method && typeof obj.method === 'function') {
  obj.method(); // Verbose!
}

// Transpiles to:
var _obj$method;

(_obj$method = obj.method) === null || _obj$method === void 0
  ? void 0
  : _obj$method.call(obj);

// Performance:
// - Optional call: ~15ns
// - Manual check: ~20ns
// - Direct call: ~10ns
```

**Optional Array Access:**

```javascript
// Arrays with optional chaining

const users = [
  { name: "Alice" },
  { name: "Bob" }
];

users[0]?.name;  // "Alice"
users[10]?.name; // undefined (no crash!)

// Null array:
const nullArray = null;
nullArray?.[0];  // undefined (safe!)

// Dynamic index:
const index = 5;
users[index]?.name; // undefined (safe even if index out of bounds)

// Transpiles to:
var _users$index;

(_users$index = users[index]) === null || _users$index === void 0
  ? void 0
  : _users$index.name;
```

**Edge Cases:**

```javascript
// 1. Optional chaining with delete
const obj = { a: { b: { c: 1 } } };

delete obj?.a?.b?.c; // Works! (deletes c)
delete obj?.x?.y?.z; // Safe! (no error even though x doesn't exist)

// 2. Optional chaining with in operator
'name' in user?.profile; // SyntaxError! (not allowed)

// Must use:
user?.profile && 'name' in user.profile;

// 3. Optional chaining on left side of assignment
obj?.prop = value; // SyntaxError! (not allowed)

// Must check manually:
if (obj) {
  obj.prop = value;
}

// 4. Optional chaining with new
new Constructor?.(); // SyntaxError! (not allowed)

// Must use ternary:
Constructor ? new Constructor() : undefined;
```

**Nullish Coalescing Integration:**

```javascript
// Optional chaining returns undefined
// Nullish coalescing provides defaults

const city = user?.address?.city ?? "Unknown";

// Combines:
// - ?. for safe access (returns undefined if path breaks)
// - ?? for default value (only if undefined or null)

// Perfect for nested data with fallbacks:
const theme = user?.settings?.theme ?? "light";
const email = user?.contact?.email ?? "no-email@example.com";
const age = user?.profile?.age ?? 18;

// More complex example:
function getUserInfo(user) {
  return {
    name: user?.profile?.name ?? "Guest",
    email: user?.contact?.email ?? "noemail@example.com",
    city: user?.address?.city ?? "Unknown",
    country: user?.address?.country ?? "Unknown",
    phone: user?.contact?.phone?.number ?? "No phone"
  };
}

// Handles missing user, profile, contact, address, phone gracefully
```

**Performance in Tight Loops:**

```javascript
// In performance-critical code, optional chaining has slight overhead

// ❌ SLOWER: Optional chaining in hot loop
for (let i = 0; i < 1000000; i++) {
  const city = users[i]?.address?.city;
  // Each iteration: 2 null checks
}

// ✅ FASTER: Hoist checks outside loop
for (let i = 0; i < 1000000; i++) {
  if (users[i] && users[i].address) {
    const city = users[i].address.city; // Direct access (faster)
  }
}

// Benchmark:
// Optional chaining loop: ~45ms
// Hoisted checks loop: ~32ms
// 30% faster with manual checks

// Trade-off: Readability vs performance
// Use optional chaining unless proven bottleneck
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Crash Storm from Missing Optional Chaining</strong></summary>

**Scenario:** Your React app experiences 15,000 crashes per day from "Cannot read property of undefined" errors. Users complain about white screens and lost work. Investigation reveals deeply nested API responses without proper null handling.

**The Problem:**

```javascript
// ❌ BUG: No null checks on nested API response
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data.user)); // data.user might be null/undefined!
  }, [userId]);

  return (
    <div>
      <h1>{user.profile.name}</h1>
      {/* ❌ CRASH if user is null! */}

      <p>{user.profile.contact.email}</p>
      {/* ❌ CRASH if profile is null! */}

      <p>{user.address.city}, {user.address.state}</p>
      {/* ❌ CRASH if address is null! */}

      <img src={user.profile.avatar.url} />
      {/* ❌ CRASH if avatar is null! */}
    </div>
  );
}

// API sometimes returns:
// 1. { user: null } → User deleted
// 2. { user: { profile: null } } → Profile not created yet
// 3. { user: { profile: { contact: null } } } → Contact info pending
// 4. { user: { address: undefined } } → Address not provided
//
// Each case causes crash → white screen → user frustration
```

**Production Metrics (Before Fix):**

```javascript
// Error tracking dashboard:
{
  totalCrashes: 15000 / day,
  errorTypes: {
    "Cannot read property 'name' of null": 5000,
    "Cannot read property 'email' of undefined": 3500,
    "Cannot read property 'city' of null": 2500,
    "Cannot read property 'url' of undefined": 4000
  },
  affectedUsers: "35% of daily users",
  bounceRate: "62%",
  avgSessionDuration: "45 seconds (before crash)",
  userComplaints: "450/week",
  revenueImpact: "-$25k/week"
}

// Example error stack:
// TypeError: Cannot read property 'name' of null
//   at UserProfile (UserProfile.jsx:12:28)
//   at renderWithHooks (react-dom.js:14985)
//   at mountIndeterminateComponent (react-dom.js:17811)
//
// Happens when:
// - User navigates to profile page too fast (data not loaded)
// - API returns partial data (profile still loading)
// - User deleted their account but URL still accessible
// - Network race condition (state updates out of order)
```

**Debugging Process:**

```javascript
// Step 1: Reproduce the crash
function TestCrash() {
  const [user, setUser] = useState(null);

  // Simulate API returning null
  useEffect(() => {
    setTimeout(() => {
      setUser({ user: null }); // Crash incoming!
    }, 100);
  }, []);

  return <UserProfile user={user} />;
}

// Result: White screen + error in console

// Step 2: Add logging
function UserProfile({ user }) {
  console.log('User:', user);
  console.log('User profile:', user.profile); // undefined if user is null
  console.log('User profile name:', user.profile.name); // CRASH HERE

  // Never reaches return due to crash
}

// Logs show:
// User: null
// (then crash, no more logs)

// Step 3: Identify all unsafe accesses
function findUnsafeAccess(user) {
  // All of these can crash:
  user.profile.name                    // 3 levels deep
  user.profile.contact.email           // 4 levels deep
  user.address.city                    // 3 levels deep
  user.profile.avatar.url              // 4 levels deep
  user.preferences.theme.colors.primary // 5 levels deep!

  // Each level is a potential crash point
}
```

**Solution 1: Add Optional Chaining:**

```javascript
// ✅ FIX: Optional chaining at every level
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, [userId]);

  // Loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user?.profile?.name ?? "No name"}</h1>
      <p>{user?.profile?.contact?.email ?? "No email"}</p>
      <p>
        {user?.address?.city ?? "Unknown city"},
        {user?.address?.state ?? "Unknown state"}
      </p>
      <img
        src={user?.profile?.avatar?.url ?? "/default-avatar.png"}
        alt={user?.profile?.name ?? "User"}
      />
    </div>
  );
}

// Now handles:
// - user is null → Shows "Loading..."
// - profile is null → Shows "No name", "No email"
// - address is null → Shows "Unknown city"
// - avatar is null → Shows default image
// No more crashes!
```

**Solution 2: TypeScript + Zod Validation:**

```javascript
// ✅ BETTER: Type-safe with runtime validation
import { z } from 'zod';

const UserSchema = z.object({
  profile: z.object({
    name: z.string().nullable(),
    contact: z.object({
      email: z.string().email().nullable()
    }).nullable(),
    avatar: z.object({
      url: z.string().url()
    }).nullable()
  }).nullable(),
  address: z.object({
    city: z.string(),
    state: z.string()
  }).nullable()
});

type User = z.infer<typeof UserSchema>;

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        try {
          const validated = UserSchema.parse(data.user);
          setUser(validated);
        } catch (err) {
          console.error('Invalid user data:', err);
          setError('Invalid user data');
        }
      })
      .catch(err => setError(err.message));
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.profile?.name ?? "No name"}</h1>
      <p>{user.profile?.contact?.email ?? "No email"}</p>
      <p>
        {user.address?.city ?? "Unknown"},
        {user.address?.state ?? "Unknown"}
      </p>
      <img
        src={user.profile?.avatar?.url ?? "/default-avatar.png"}
        alt={user.profile?.name ?? "User"}
      />
    </div>
  );
}

// Benefits:
// - TypeScript catches type errors at compile time
// - Zod validates data at runtime
// - Optional chaining handles null/undefined safely
// - Three layers of protection!
```

**Solution 3: Custom Hook with Optional Chaining:**

```javascript
// ✅ BEST: Reusable hook with built-in safety
function useUser(userId) {
  const [data, setData] = useState({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    setData(prev => ({ ...prev, loading: true }));

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(json => {
        setData({
          user: json.user,
          loading: false,
          error: null
        });
      })
      .catch(err => {
        setData({
          user: null,
          loading: false,
          error: err.message
        });
      });
  }, [userId]);

  // Helper functions with built-in optional chaining
  const getName = () => data.user?.profile?.name ?? "Guest";
  const getEmail = () => data.user?.profile?.contact?.email ?? "noemail@example.com";
  const getCity = () => data.user?.address?.city ?? "Unknown";
  const getState = () => data.user?.address?.state ?? "Unknown";
  const getAvatar = () => data.user?.profile?.avatar?.url ?? "/default-avatar.png";

  return {
    ...data,
    getName,
    getEmail,
    getCity,
    getState,
    getAvatar
  };
}

// Usage:
function UserProfile({ userId }) {
  const { user, loading, error, getName, getEmail, getCity, getState, getAvatar } = useUser(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{getName()}</h1>
      <p>{getEmail()}</p>
      <p>{getCity()}, {getState()}</p>
      <img src={getAvatar()} alt={getName()} />
    </div>
  );
}

// Benefits:
// - Centralized null handling
// - Reusable across components
// - Easy to test
// - No crashes possible!
```

**Real Production Metrics (After Fix):**

```javascript
// After implementing Solution 3:
{
  totalCrashes: 15 / day,              // 1000x fewer (was 15,000)
  errorTypes: {
    "Network timeout": 10,              // Legitimate errors
    "Invalid JSON": 5
  },
  affectedUsers: "0.05%",               // 99.95% crash-free (was 35%)
  bounceRate: "12%",                    // 50% reduction (was 62%)
  avgSessionDuration: "8 minutes",      // 10x longer (was 45 seconds)
  userComplaints: "8/week",             // 98% reduction (was 450/week)
  revenueImpact: "+$30k/week",          // $55k swing!
  userSatisfaction: "+95%"
}

// Crash breakdown (before → after):
// - Profile crashes: 5,000/day → 0/day ✅
// - Contact crashes: 3,500/day → 0/day ✅
// - Address crashes: 2,500/day → 0/day ✅
// - Avatar crashes: 4,000/day → 0/day ✅
```

**Additional Improvements:**

```javascript
// Also fixed other unsafe patterns found during investigation:

// ❌ BUG 1: Array access without optional chaining
const firstItem = items[0].name; // Crashes if items is empty

// ✅ FIX:
const firstItem = items[0]?.name ?? "No items";


// ❌ BUG 2: Method call without optional chaining
onClick(event); // Crashes if onClick is undefined

// ✅ FIX:
onClick?.(event); // Safe optional call


// ❌ BUG 3: Nested object destructuring
const { user: { profile: { name } } } = response; // Crashes if user is null

// ✅ FIX:
const name = response?.user?.profile?.name ?? "Unknown";


// ❌ BUG 4: Chained method calls
const upper = user.getName().toUpperCase(); // Crashes if getName returns null

// ✅ FIX:
const upper = user.getName()?.toUpperCase() ?? "UNKNOWN";
```

**Lessons Learned:**

```javascript
// 1. Always use optional chaining for API data
// 2. Combine ?. with ?? for defaults
// 3. Add loading and error states
// 4. Validate data at runtime (Zod, Yup, etc.)
// 5. Use TypeScript for compile-time safety
// 6. Create reusable hooks for common patterns
// 7. Monitor crashes to catch issues early

// Cost of NOT using optional chaining:
// - 15,000 crashes per day
// - 35% of users affected
// - $25k/week revenue lost
// - 450 support tickets per week
// - Terrible user experience
//
// Cost of using optional chaining:
// - 5 minutes to add ?. operators
// - Minimal performance overhead (~2ns per access)
// - Crashes reduced by 1000x
// - Revenue increased by $55k/week
//
// ROI: Infinite! Always use optional chaining for API data.
```

</details>

<details>
<summary><strong>⚖️ Trade-offs: Optional Chaining Patterns</strong></summary>

**1. Optional Chaining vs Manual Null Checks:**

```javascript
// Pattern 1: Optional chaining
const city = user?.address?.city;

// Pattern 2: Manual null checks
const city = user && user.address && user.address.city;

// Pattern 3: If-else
let city;
if (user) {
  if (user.address) {
    city = user.address.city;
  }
}
```

| Aspect | Optional Chaining | Manual && Checks | If-Else |
|--------|------------------|------------------|---------|
| **Readability** | ✅ Very clean | ⚠️ Repetitive | ❌ Verbose |
| **Performance** | ✅ Fast (~10ns) | ⚠️ Slower (~12ns) | ✅ Fast (~10ns) |
| **Handles null** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Handles 0** | ✅ Keeps 0 | ❌ Treats as falsy | ✅ Keeps 0 |
| **Handles ""** | ✅ Keeps "" | ❌ Treats as falsy | ✅ Keeps "" |
| **Browser support** | ⚠️ ES2020+ | ✅ All browsers | ✅ All browsers |
| **Code size** | ✅ Smallest | ⚠️ Moderate | ❌ Largest |

**When to use each:**

```javascript
// ✅ Use optional chaining for most cases:
const email = user?.profile?.contact?.email;

// ✅ Use && when you need falsy coercion:
const isValid = user && user.isActive && user.hasPermission;

// ✅ Use if/else for complex logic:
if (user && user.isActive) {
  grantAccess();
  logActivity();
} else {
  denyAccess();
}
```

**2. Optional Chaining vs Try-Catch:**

```javascript
// Pattern 1: Optional chaining
const city = user?.address?.city ?? "Unknown";

// Pattern 2: Try-catch
let city;
try {
  city = user.address.city;
} catch {
  city = "Unknown";
}
```

| Aspect | Optional Chaining | Try-Catch |
|--------|------------------|-----------|
| **Performance** | ✅ Fast (~10ns) | ❌ Slow (~1000ns on error) |
| **Readability** | ✅ Clear | ⚠️ Verbose |
| **Catches errors** | ❌ No | ✅ Yes (all errors) |
| **Specific to null** | ✅ Yes | ❌ Catches everything |
| **Best for** | Null/undefined | Exceptions, parsing |

**3. Shallow vs Deep Optional Chaining:**

```javascript
// Pattern 1: Deep chaining (4+ levels)
const value = user?.profile?.settings?.theme?.colors?.primary;

// Pattern 2: Intermediate variables
const profile = user?.profile;
const settings = profile?.settings;
const theme = settings?.theme;
const colors = theme?.colors;
const primary = colors?.primary;

// Pattern 3: Hybrid (group logically)
const theme = user?.profile?.settings?.theme;
const primary = theme?.colors?.primary;
```

| Aspect | Deep Chaining | Intermediate Variables | Hybrid |
|--------|--------------|----------------------|--------|
| **Readability** | ⚠️ Hard to read | ✅ Very clear | ✅ Clear |
| **Debugging** | ❌ Hard | ✅ Easy | ✅ Easy |
| **Performance** | ✅ Fast | ⚠️ Slightly slower | ✅ Fast |
| **Line count** | ✅ One line | ❌ Many lines | ⚠️ Few lines |

**Rule of thumb:**
- **1-2 levels:** Use inline chaining
- **3-4 levels:** Consider readability
- **5+ levels:** Use intermediate variables or refactor

**4. Optional Chaining with Defaults:**

```javascript
// Pattern 1: Nullish coalescing
const city = user?.address?.city ?? "Unknown";

// Pattern 2: OR operator
const city = user?.address?.city || "Unknown";

// Pattern 3: Ternary
const city = user?.address?.city ? user.address.city : "Unknown";
```

| Aspect | Nullish ?? | OR \|\| | Ternary |
|--------|-----------|---------|---------|
| **Handles undefined** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Handles null** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Keeps 0** | ✅ Yes | ❌ No (uses default) | ✅ Yes |
| **Keeps ""** | ✅ Yes | ❌ No (uses default) | ✅ Yes |
| **Keeps false** | ✅ Yes | ❌ No (uses default) | ✅ Yes |
| **Readability** | ✅ Clean | ✅ Clean | ⚠️ Redundant |

**When to use:**
- **?? (nullish):** When 0, false, "" are valid values
- **|| (OR):** When you want to treat falsy as missing
- **Ternary:** When you need complex default logic

**5. Optional Chaining in Loops:**

```javascript
// Scenario: Process array of users

// Pattern 1: Optional chaining in loop
for (const user of users) {
  const city = user?.address?.city ?? "Unknown";
  console.log(city);
}

// Pattern 2: Filter first, then access
const usersWithAddress = users.filter(u => u?.address);
for (const user of usersWithAddress) {
  const city = user.address.city; // Safe now
  console.log(city);
}

// Pattern 3: Map with optional chaining
const cities = users.map(u => u?.address?.city ?? "Unknown");
```

| Aspect | In-Loop Chaining | Filter First | Map with Chaining |
|--------|-----------------|--------------|------------------|
| **Performance** | ⚠️ Check every iteration | ✅ Filter once | ⚠️ Check every iteration |
| **Readability** | ✅ Clear | ✅ Clear | ✅ Very clear |
| **Null handling** | ✅ Automatic | ⚠️ Manual | ✅ Automatic |
| **Best for** | Small arrays | Large arrays | Transformations |

**6. Required vs Optional Fields:**

```javascript
// Scenario: User object with mixed required/optional fields

// ❌ BAD: Treat everything as optional
function displayUser(user) {
  return {
    name: user?.name ?? "No name",           // Required field!
    email: user?.email ?? "No email",        // Required field!
    city: user?.address?.city ?? "Unknown"   // Actually optional
  };
}

// Problem: Hides bugs when required data is missing

// ✅ GOOD: Only use ?. for truly optional fields
function displayUserBetter(user) {
  if (!user || !user.name || !user.email) {
    throw new Error('User, name, and email are required');
  }

  return {
    name: user.name,                         // Direct access (fail fast)
    email: user.email,                       // Direct access (fail fast)
    city: user.address?.city ?? "Unknown"    // Optional chaining
  };
}

// Benefit: Catches data issues early instead of silently using defaults
```

**7. Optional Chaining with Assignment:**

```javascript
// ❌ LIMITATION: Can't use on left side of assignment
user?.address?.city = "Boston"; // SyntaxError!

// ✅ WORKAROUND 1: Check before assign
if (user && user.address) {
  user.address.city = "Boston";
}

// ✅ WORKAROUND 2: Nullish coalescing assignment
user.address ??= {}; // Create address if missing
user.address.city = "Boston"; // Now safe
```

**Decision Matrix:**

| Use Case | Best Pattern | Reason |
|----------|-------------|--------|
| **API responses** | Optional chaining | Uncertain structure |
| **Required fields** | Direct access | Fail fast on missing data |
| **Default values** | ?. + ?? | Clean syntax |
| **Falsy defaults** | ?. + \|\| | Treat falsy as missing |
| **Function calls** | ?.() | Safe optional calls |
| **Array access** | ?.[index] | Safe array access |
| **Deep nesting (5+)** | Intermediate vars | Better debugging |
| **Hot loops** | Filter + direct | Better performance |

</details>

<details>
<summary><strong>💬 Explain to Junior: Optional Chaining Simplified</strong></summary>

**Simple Analogy: Asking Politely**

Think of optional chaining like asking "Can I?" before each step:

```javascript
// WITHOUT optional chaining (rude!):
const city = user.address.city;
// "Give me city NOW!" → Crashes if address doesn't exist

// WITH optional chaining (polite!):
const city = user?.address?.city;
// "Do you have address? If yes, do you have city?"
// → Returns undefined politely if anything is missing
```

**Real-World Example:**

```javascript
// Scenario: Getting information from a friend

// WITHOUT optional chaining:
const friend = getPerson("John");
const phoneNumber = friend.contact.phone.number;
// Crashes if John doesn't have contact info!

// WITH optional chaining:
const phoneNumber = friend?.contact?.phone?.number;
// Returns undefined if any step fails
// "Does John exist? Does he have contact? Does he have phone?"
```

**The Key Rule:**

```javascript
// ?. = "Check if exists at each step"

user?.address?.city
// Step 1: Is user defined? → Yes → Continue
// Step 2: Is address defined? → Yes → Continue
// Step 3: Get city → Return value

user?.address?.city
// Step 1: Is user defined? → NO → Return undefined immediately
// Never even tries to access address or city!
```

**Common Beginner Mistakes:**

```javascript
// ❌ MISTAKE 1: Using ?. for required fields
function processOrder(order) {
  const orderId = order?.id; // BAD! id is required!
  sendToServer(orderId);     // Might send undefined
}

// ✅ CORRECT: Direct access for required fields
function processOrder(order) {
  if (!order || !order.id) {
    throw new Error('Order and id are required');
  }

  sendToServer(order.id); // Guaranteed to exist
}


// ❌ MISTAKE 2: Trying to assign with ?.
user?.address?.city = "Boston"; // SyntaxError!

// ✅ CORRECT: Check before assign
if (user?.address) {
  user.address.city = "Boston";
}


// ❌ MISTAKE 3: Forgetting to provide defaults
const city = user?.address?.city; // undefined if missing

function welcomeMessage() {
  console.log(`Welcome to ${city}`); // "Welcome to undefined"
}

// ✅ CORRECT: Use ?? for defaults
const city = user?.address?.city ?? "your city";

function welcomeMessage() {
  console.log(`Welcome to ${city}`); // "Welcome to your city"
}
```

**Visual Comparison:**

```javascript
// OLD WAY: Nested if checks (ugly!)
let city;
if (user) {
  if (user.address) {
    if (user.address.city) {
      city = user.address.city;
    }
  }
}

// Better, but still ugly:
const city = user && user.address && user.address.city;

// MODERN WAY: Optional chaining (beautiful!)
const city = user?.address?.city;
```

**Practical Examples:**

```javascript
// 1. API responses
fetch('/api/user/123')
  .then(res => res.json())
  .then(data => {
    const name = data?.user?.name ?? "Unknown";
    const email = data?.user?.email ?? "No email";
    console.log(name, email);
  });

// 2. Event handlers
function handleClick(event) {
  event?.preventDefault(); // Only if event exists
  onClick?.(event);        // Only call if function exists
}

// 3. Array access
const firstUser = users[0]?.name ?? "No users";
const fifthUser = users[4]?.name ?? "Less than 5 users";

// 4. Function calls
const result = obj.method?.() ?? "No method";
const computed = user.getFullName?.() ?? "No name function";

// 5. React components
function UserCard({ user }) {
  return (
    <div>
      <h1>{user?.name ?? "Guest"}</h1>
      <p>{user?.email ?? "No email"}</p>
      <img src={user?.avatar?.url ?? "/default.png"} />
    </div>
  );
}
```

**Explaining to a PM:**

"Optional chaining is like having a smart assistant who checks before doing things:

**WITHOUT optional chaining:**
- You ask: 'Get me the city from John's address'
- Assistant crashes into wall if John doesn't have address
- Your app stops working (white screen of death!)

**WITH optional chaining:**
- You ask: 'Get me the city from John's address if possible'
- Assistant checks each step:
  - Does John exist? ✓
  - Does he have address? ✗ → Stop, return 'not found'
- App keeps working, shows 'Unknown city' instead

**Business Value:**
- 99% fewer crashes (from 15,000/day to 15/day in our case)
- Users don't see white screens
- Better user experience (shows 'Unknown' instead of crashing)
- Developers write safer code faster
- Example: Saved us $55k/week by preventing crashes"

**Key Takeaways:**

1. **Use ?. for API data** (uncertain structure)
2. **Don't use ?. for required fields** (hides bugs)
3. **Combine with ?? for defaults** (`?.` + `??` = perfect pair)
4. **Can't assign with ?.** (only for reading, not writing)
5. **Works everywhere:** properties, methods, arrays

**Quick Quiz:**

```javascript
// What do these return?

const user = {
  name: "Alice",
  address: {
    city: "Boston"
  }
};

// Q1:
user?.address?.city
// Answer: "Boston" (all exist)

// Q2:
user?.profile?.name
// Answer: undefined (profile doesn't exist)

// Q3:
user?.address?.city ?? "Unknown"
// Answer: "Boston" (city exists, default not used)

// Q4:
user?.profile?.name ?? "Guest"
// Answer: "Guest" (profile is undefined, default used)

// Q5:
const users = [{ name: "Alice" }];
users[5]?.name
// Answer: undefined (index 5 doesn't exist)

// Q6:
const users = null;
users?.[0]?.name
// Answer: undefined (users is null, safe!)
```

</details>

### Resources

- [MDN: Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [JavaScript.info: Optional Chaining](https://javascript.info/optional-chaining)
- [TC39 Optional Chaining Proposal](https://github.com/tc39/proposal-optional-chaining)

---

