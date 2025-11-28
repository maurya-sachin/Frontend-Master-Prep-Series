# Jest Testing Fundamentals

> **Master Jest testing framework - test structure, matchers, mocking, and best practices**

---

## Question 1: What is Jest and how do you write basic tests?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
Explain Jest testing framework. What are describe blocks, test cases, and matchers?

### Answer

Jest is a JavaScript testing framework built by Facebook. It provides zero-config testing with built-in test runner, assertions, mocking, and code coverage.

**Key Concepts:**
1. **Test Structure** - describe/it/test blocks
2. **Matchers** - Assertion methods (toBe, toEqual, etc.)
3. **Setup/Teardown** - beforeEach, afterEach hooks
4. **Mocking** - Mock functions and modules
5. **Coverage** - Built-in code coverage reports

### Code Example

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

// math.test.js
import { add, divide } from './math';

describe('Math operations', () => {
  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});

// Array/Object matchers
describe('Collections', () => {
  test('array equality', () => {
    expect([1, 2, 3]).toEqual([1, 2, 3]); // Deep equal
    expect([1, 2, 3]).toContain(2); // Contains element
    expect([1, 2, 3]).toHaveLength(3); // Length check
  });

  test('object matchers', () => {
    const user = { name: 'John', age: 30 };
    expect(user).toHaveProperty('name');
    expect(user).toMatchObject({ name: 'John' });
  });
});

// Setup and teardown
describe('Database tests', () => {
  let db;

  beforeAll(() => {
    db = setupDatabase();
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.clear();
  });

  test('inserts user', () => {
    db.insert({ name: 'Alice' });
    expect(db.count()).toBe(1);
  });
});
```

### Common Matchers Cheat Sheet

```javascript
// Equality
expect(value).toBe(5); // Strict equality (===)
expect(obj).toEqual({ a: 1 }); // Deep equality
expect(value).not.toBe(3); // Negation

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(5);
expect(0.1 + 0.2).toBeCloseTo(0.3); // Floating point

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays/Iterables
expect(arr).toContain(item);
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining([1, 2]));

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ a: 1 });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);
expect(() => fn()).toThrow('error message');
```

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)

---

<details>
<summary>🔍 <b>Deep Dive: Jest Internals and Test Execution</b></summary>

**How Jest Executes Tests:**
Jest uses V8's test runner with sophisticated isolation. When you run `jest`, it:

1. **Module Resolution** - Resolves `import/require` statements using Node's module resolution algorithm
2. **Test Transformation** - Uses Babel (via `babel-jest`) to transpile code for Node.js environment
3. **Environment Setup** - Creates isolated VM context for each test file (prevents global scope pollution)
4. **Hook Execution** - Runs setup hooks in sequence: `beforeAll` → `beforeEach` → test → `afterEach` → `afterAll`
5. **Result Aggregation** - Collects pass/fail status and generates reports

**Jest's Matcher System:**
Jest matchers are chainable objects using Proxy and getter interception:

```javascript
// Inside Jest source:
function toEqual(expected) {
  const pass = deepEqual(received, expected);
  // Returns result object
  return {
    pass,
    message: () => `Expected ${received} to equal ${expected}`
  };
}

// The 'expect' function returns matcher object with all matchers
expect(value) // Returns matcherObject with toEqual, toBe, etc.

// Negation via .not proxy
expect(value).not.toBe(5) // Inverts pass/fail logic
```

**Test Isolation Strategy:**
Each test file runs in its own Node.js process or isolated V8 context:
- Global variables are NOT shared between test files
- `beforeEach`/`afterEach` clear state per test
- Mocks are automatically cleared if `clearMocks: true` in config
- This prevents flaky tests from order dependency

**Code Coverage Implementation:**
Jest uses Istanbul/NYC for coverage:
- **Instrumentation** - AST parser injects coverage tracking into code
- **Execution** - Tracks which lines/branches execute
- **Threshold checking** - Fails build if coverage < threshold
- **Report generation** - Creates LCOV HTML reports

</details>

---

<details>
<summary>🐛 <b>Real-World Scenario: Debugging a Test Coverage Gap</b></summary>

**Production Bug:** Your e-commerce app crashes when calculating tax for certain states. Coverage report shows your tax calculation function is only 60% covered.

**Investigation Process:**

```javascript
// tax-calculator.js (the buggy function)
export function calculateTax(amount, state) {
  if (state === 'CA') return amount * 0.095; // California
  if (state === 'TX') return amount * 0.0825; // Texas
  if (state === 'NY') return amount * 0.08; // New York
  if (state === 'WA') return amount * 0.065; // Washington
  // Missing case: What about federal tax? What about territories?
  throw new Error(`Unknown state: ${state}`);
}

// tax-calculator.test.js (incomplete tests)
describe('calculateTax', () => {
  test('calculates CA tax', () => {
    expect(calculateTax(100, 'CA')).toBe(9.5);
  });

  test('calculates TX tax', () => {
    expect(calculateTax(100, 'TX')).toBe(8.25);
  });
  // Only 2 of 5 branches covered! 40% coverage
});

// Running: npm run test:coverage
// Output shows:
// tax-calculator.js: 60% statements, 40% branches ⚠️

// Fix: Add comprehensive branch coverage
describe('calculateTax', () => {
  test('calculates CA tax', () => {
    expect(calculateTax(100, 'CA')).toBe(9.5);
  });

  test('calculates TX tax', () => {
    expect(calculateTax(100, 'TX')).toBe(8.25);
  });

  test('calculates NY tax', () => {
    expect(calculateTax(100, 'NY')).toBe(8);
  });

  test('calculates WA tax', () => {
    expect(calculateTax(100, 'WA')).toBe(6.5);
  });

  test('throws for unknown state', () => {
    expect(() => calculateTax(100, 'PR')).toThrow('Unknown state: PR');
  });

  // Edge case that revealed the bug:
  test('handles decimal amounts correctly', () => {
    expect(calculateTax(99.99, 'CA')).toBeCloseTo(9.4991, 4);
  });
});

// Now coverage is 100%! Bug found: PR (Puerto Rico) wasn't handled
// Real user was from Puerto Rico, got error instead of tax calculation
```

**Metrics & Impact:**
- **Before fix:** 60% coverage, 15% of customers hit the error
- **After fix:** 100% coverage, error eliminated, zero complaints
- **Time to detect:** Without proper coverage metrics, bug existed for 3 weeks
- **Time to fix:** 30 minutes once coverage gap identified

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Jest vs Vitest</b></summary>

**Jest (Established, Industry Standard):**

Pros:
- ✅ Mature ecosystem (10+ years), battle-tested by Meta/Facebook
- ✅ Zero-config setup for most projects
- ✅ Built-in coverage (Istanbul), timers, DOM mocks
- ✅ Snapshot testing first-class support
- ✅ Excellent IDE integration, community resources
- ✅ Works perfectly for React (React Testing Library integration)

Cons:
- ❌ Can be slow (100+ tests take 30+ seconds to startup)
- ❌ Heavy bundle (~100MB node_modules)
- ❌ Complex internals, harder to debug
- ❌ Node.js-only test environment (limited browser support)
- ❌ Slow module transformations with Babel

**Vitest (Modern Alternative):**

Pros:
- ✅ Lightning fast (Vite's instant module transformation)
- ✅ Native ESM support (no Babel transpilation)
- ✅ Smaller bundle, fewer dependencies
- ✅ Built on modern tech (Rollup, esbuild)
- ✅ IDE integration (HMR), hot module reload in tests
- ✅ Browser environment option (jsdom/happy-dom)

Cons:
- ❌ Newer (3 years old), smaller ecosystem
- ❌ Less community content/tutorials
- ❌ Breaking changes as it evolves
- ❌ Not universal yet (some projects still Jest-only)
- ❌ Fewer enterprise deployments

**Comparison Table:**

```
Feature                  | Jest      | Vitest
------------------------|-----------|-----------
Startup speed            | 5-10s     | <1s
Test execution (100)     | 30-45s    | 5-10s
Configuration            | Simple    | Simple
ESM support              | Limited   | Native
Watch mode               | Good      | Excellent (HMR)
TypeScript               | Via ts-jest | Native
Snapshot testing         | ✅ Built-in | ✅ Built-in
Parallel execution       | ✅         | ✅
Coverage (c8/Istanbul)   | Istanbul  | c8
IDE integration          | Great     | Great (Vite)
Community size           | Huge      | Growing
Production readiness     | Ready now | Ready now
```

**When to Use Each:**
- **Jest**: Existing projects, React apps, enterprise requirements, maximum stability
- **Vitest**: New projects, performance-critical, TypeScript-first, modern tech stack

</details>

---

<details>
<summary>💬 <b>Explain to Junior: Jest Testing Fundamentals</b></summary>

**What is Jest? (Simple Explanation)**

Jest is like a quality control inspector for your code. Imagine you're building a calculator:

```javascript
// Your calculator code
function add(a, b) {
  return a + b;
}

// Jest is like a checklist:
// ✓ Does add(2, 3) return 5? YES
// ✓ Does add(0, 0) return 0? YES
// ✓ Does add(-1, 1) return 0? YES
```

Jest automatically runs these checks every time you change code, catching bugs before users see them.

**Key Concepts Explained Simply:**

1. **describe block** = Folder that groups related tests
   ```javascript
   describe('Math operations', () => {
     // All math tests live here
   });
   ```

2. **test (or it)** = Individual test case
   ```javascript
   test('adds numbers correctly', () => {
     // This specific test
   });
   ```

3. **expect** = Your assertion/claim
   ```javascript
   expect(add(2, 3)).toBe(5); // I expect this to be true
   ```

4. **Matcher** = How you check the result
   ```javascript
   toBe(5)        // Exact match (like ===)
   toEqual({})    // Deep match (like comparing objects)
   toContain(2)   // Array contains value
   ```

**Common Matchers Explained:**

```javascript
// Checking exact values
expect(5).toBe(5);           // ✓ Exactly 5
expect([1,2]).toEqual([1,2]); // ✓ Same contents

// Checking existence
expect(value).toBeDefined();   // ✓ Not undefined
expect(null).toBeNull();       // ✓ Is null

// Checking numbers
expect(5).toBeGreaterThan(3);     // ✓ 5 > 3
expect(5).toBeLessThanOrEqual(5); // ✓ 5 ≤ 5

// Checking strings
expect('hello').toContain('ell');    // ✓ Contains substring
expect('hello').toMatch(/h\w+o/);    // ✓ Matches pattern

// Checking errors
expect(() => riskyFunction()).toThrow(); // ✓ Throws error
```

**Interview Answer Template:**

"Jest is Facebook's testing framework. It provides a complete solution: test runner, assertion library, mocking tools, and coverage reports. The main building blocks are `describe` blocks for grouping, `test` for individual tests, and `expect` with matchers for assertions. Jest automatically isolates each test file, runs setup/teardown hooks, and provides useful features like mocking external dependencies and fake timers. For example, to test a math function, I'd create a test file with describe block, write a test that calls the function with known inputs, and assert the output matches expectations."

**Why Jest is Helpful:**

```javascript
// WITHOUT Jest - Manual checking
const add = (a, b) => a + b;
console.log(add(2, 3)); // Need to check output manually
console.log(add(0, 0)); // Run every time I change code
// Easy to forget to check all cases!

// WITH Jest - Automated checking
test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});

test('adds zeros', () => {
  expect(add(0, 0)).toBe(0);
});

// Jest automatically runs these EVERY TIME YOU SAVE
// If you break add(), all tests fail immediately
// You catch bugs in seconds, not in production!
```

</details>
---

## Question 2: How do you test asynchronous code in Jest?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Google, Meta, Amazon, Netflix

### Question
Explain different ways to test async code in Jest. How do you test promises, async/await, and callbacks?

### Answer

Jest provides multiple patterns for testing async code to ensure tests wait for operations to complete.

**Approaches:**
1. **Callbacks** - Use done() parameter
2. **Promises** - Return promise from test
3. **Async/Await** - Use async test functions
4. **Resolves/Rejects** - Expect helpers for promises

### Code Example

```javascript
// api.js
export function fetchUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

export async function createUser(data) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create');
  return response.json();
}

// 1. CALLBACK PATTERN
test('callback test', (done) => {
  function callback(data) {
    try {
      expect(data).toBe('success');
      done(); // Must call done()
    } catch (error) {
      done(error); // Pass errors to done
    }
  }

  fetchDataCallback(callback);
});

// 2. PROMISE PATTERN - Return promise
test('promise test', () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe('John');
  });
});

// 3. ASYNC/AWAIT PATTERN (Recommended)
test('async/await test', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});

// 4. RESOLVES/REJECTS MATCHERS
test('resolves matcher', () => {
  return expect(fetchUser(1)).resolves.toMatchObject({
    name: 'John'
  });
});

test('rejects matcher', () => {
  return expect(fetchUser(999)).rejects.toThrow('Not found');
});

// TESTING MULTIPLE ASYNC OPERATIONS
test('parallel async operations', async () => {
  const [user1, user2] = await Promise.all([
    fetchUser(1),
    fetchUser(2)
  ]);

  expect(user1.name).toBe('John');
  expect(user2.name).toBe('Jane');
});

// ERROR HANDLING
test('handles async errors', async () => {
  await expect(createUser({})).rejects.toThrow('Failed to create');
});

test('try-catch in async', async () => {
  try {
    await createUser({});
    fail('Should have thrown'); // Fail if no error
  } catch (error) {
    expect(error.message).toContain('Failed');
  }
});

// TIMEOUT HANDLING
test('async with timeout', async () => {
  const data = await fetchWithTimeout(5000);
  expect(data).toBeDefined();
}, 10000); // 10 second timeout
```

### Common Mistakes

```javascript
// ❌ WRONG: Forgetting to return/await
test('wrong async', () => {
  fetchUser(1).then(user => {
    expect(user.name).toBe('John'); // Test passes before this runs!
  });
});

// ✅ CORRECT: Return the promise
test('correct async', () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe('John');
  });
});

// ❌ WRONG: Not handling rejections
test('wrong error test', async () => {
  await fetchUser(999); // Unhandled rejection fails test
});

// ✅ CORRECT: Expect rejection
test('correct error test', async () => {
  await expect(fetchUser(999)).rejects.toThrow();
});
```

### Resources
- [Jest Async Testing](https://jestjs.io/docs/asynchronous)

---

<details>
<summary>🔍 <b>Deep Dive: Async Testing and Promise Handling</b></summary>

**Promise Chain Mechanics in Jest:**
When you return a promise from a test, Jest internally hooks into the promise chain:

```javascript
// Under the hood, Jest does something like:
function runTest(testFn) {
  try {
    const result = testFn();

    // If result is a Promise, wait for it
    if (result && typeof result.then === 'function') {
      return result.then(
        () => console.log('✓ Test passed'),
        (error) => console.log('✗ Test failed:', error)
      );
    }

    return result; // Synchronous test
  } catch (error) {
    console.log('✗ Test failed:', error);
  }
}
```

**Async/Await Transformation:**
Jest transforms `async/await` to promise chains:

```javascript
// What you write:
test('async test', async () => {
  const data = await fetchUser(1);
  expect(data).toBeDefined();
});

// What Jest actually runs (via Babel):
test('async test', () => {
  return fetchUser(1).then((data) => {
    expect(data).toBeDefined();
  });
});
```

**The `done` Callback Pattern (Legacy):**
Before promises, `done()` was the only way to signal async completion:

```javascript
test('callback done', (done) => {
  // Jest passes 'done' as parameter
  // Test waits until done() is called
  fetchData((error, data) => {
    if (error) {
      done(error); // Pass error to done
    } else {
      expect(data).toBeDefined();
      done(); // Signal completion
    }
  });
});

// Problem: If done() never called, test hangs for timeout (default 5s)
// Solution: Always use Promise/async instead of done
```

**Timeout Handling in Async Tests:**
Jest has configurable timeouts:

```javascript
// Default timeout: 5 seconds
// If promise not settled by then, test fails with "timeout exceeded"

test('slow async', async () => {
  const data = await slowFetch(); // Takes 10 seconds
}, 15000); // Custom timeout: 15 seconds

test('very slow operation', async () => {
  const data = await verySlowOperation(); // Takes 30 seconds
}, 60000); // Give it 60 seconds

// Global timeout configuration in jest.config.js:
module.exports = {
  testTimeout: 10000, // 10 seconds for all tests
};
```

**Concurrent Async Tests:**
Jest runs multiple async tests in parallel unless configured otherwise:

```javascript
// These 3 tests run SIMULTANEOUSLY, not sequentially
test('fetch user 1', async () => {
  const user = await fetchUser(1);
  expect(user.id).toBe(1);
});

test('fetch user 2', async () => {
  const user = await fetchUser(2);
  expect(user.id).toBe(2);
});

test('fetch user 3', async () => {
  const user = await fetchUser(3);
  expect(user.id).toBe(3);
});

// With Promise.all: ~3 API calls in parallel = faster
// Without await: Synchronous test runner processes all 3 simultaneously
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Fixing Async Test Race Conditions</b></summary>

**Production Issue:** Your test suite passes locally but randomly fails on CI (continuous integration). Happens on Fridays with 10% failure rate.

**Investigation:**

```javascript
// user-service.js
let userCache = null;

export async function fetchUserWithCache(id) {
  if (userCache) return userCache;

  // First call fetches from API
  userCache = await fetch(`/api/users/${id}`).then(r => r.json());
  return userCache;
}

// user-service.test.js (FLAKY TEST!)
describe('User Service', () => {
  test('fetches user 1', async () => {
    const user = await fetchUserWithCache(1);
    expect(user.id).toBe(1);
  });

  test('fetches user 2', async () => {
    const user = await fetchUserWithCache(2);
    expect(user.id).toBe(2); // FAILS! userCache is still user 1 from previous test!
  });
});

// Why it fails on CI but passes locally:
// - Locally: Tests run sequential (slower computer = serialized execution)
// - CI: Tests run parallel (faster = concurrent execution)
// - When concurrent: Both tests call fetchUserWithCache at same time
// - First test caches user 1
// - Second test gets cached user 1 instead of user 2
```

**Root Cause:** Shared mutable state (cache) not cleared between tests.

**Fix:**

```javascript
describe('User Service', () => {
  beforeEach(() => {
    // Reset cache before each test
    userCache = null;
  });

  test('fetches user 1', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ id: 1, name: 'John' })
    });

    const user = await fetchUserWithCache(1);
    expect(user.id).toBe(1);
  });

  test('fetches user 2', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ id: 2, name: 'Jane' })
    });

    const user = await fetchUserWithCache(2);
    expect(user.id).toBe(2); // NOW PASSES! Cache is clean
  });
});
```

**Before Fix:**
- 90% pass rate (flaky)
- Fails randomly on CI
- Takes 2 hours to debug

**After Fix:**
- 100% pass rate (stable)
- Passes consistently on CI
- Clear, predictable behavior

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Async Testing Patterns</b></summary>

**Pattern Comparison:**

```
Pattern          | Pros                    | Cons
</details>
-----------------|-------------------------|------------------
Callbacks        | Legacy support          | Error handling hard
(done)           |                         | Callback hell
                 |                         |
Promises         | Cleaner than callbacks  | Still need .then()
(return)         | Standard support        | Error handling verbose
                 |                         |
Async/Await      | ✅ Most readable        | Requires Babel
                 | ✅ Try/catch errors     | Slightly slower
                 | ✅ Natural control flow | (negligible)
                 |                         |
Resolves/Rejects | Matcher-based           | Limited flexibility
                 | Clean assertions        | Complex matchers
```

**When to Use Each:**

```javascript
// CALLBACK - Avoid unless dealing with legacy code
test('callback style', (done) => {
  fetchData((err, data) => {
    if (err) done(err);
    else { expect(data).toBeDefined(); done(); }
  });
});

// PROMISE - Use when API returns raw promises
test('promise style', () => {
  return fetchUser().then(user => {
    expect(user.name).toBe('John');
  });
});

// ASYNC/AWAIT - ✅ RECOMMENDED for new tests
test('async/await style', async () => {
  const user = await fetchUser();
  expect(user.name).toBe('John');
});

// RESOLVES/REJECTS - Use for quick assertions
test('quick assertions', () => {
  return expect(fetchUser()).resolves.toHaveProperty('name');
});
```

**Performance Characteristics:**

```javascript
// Sequential: Each test waits for previous
test('user 1', async () => { await fetchUser(1); }); // 100ms
test('user 2', async () => { await fetchUser(2); }); // 100ms
test('user 3', async () => { await fetchUser(3); }); // 100ms
// Total: 300ms

// Parallel (actual Jest behavior)
// All 3 run simultaneously
// Total: 100ms
```

---

<details>
<summary>💬 <b>Explain to Junior: Testing Async Code</b></summary>

**Why Async Testing is Tricky:**

Think of your test like a restaurant:

```javascript
// ❌ WRONG: Synchronous thinking
test('gets user order', () => {
  const order = placeOrder(); // Takes 1 second to arrive
  expect(order).toBeDefined(); // Checks IMMEDIATELY - order not here yet!
  // Test PASSES even though order never arrived!
});

// ✅ RIGHT: Wait for order
test('gets user order', async () => {
  const order = await placeOrder(); // Wait for order (1 second)
  expect(order).toBeDefined(); // NOW order is here, check it
  // Test only passes if order actually arrives
});
```

**3 Ways to Test Async Code:**

**1. Return Promise (Old Way):**
```javascript
test('test name', () => {
  // Jest waits for returned promise
  return fetchUser().then(user => {
    expect(user.id).toBe(1);
  });
});
```

**2. Async/Await (Modern, Recommended):**
```javascript
test('test name', async () => {
  // Wait for promise to complete
  const user = await fetchUser();
  expect(user.id).toBe(1);
});
```

**3. Use Helpers (Quick Checks):**
```javascript
test('test name', () => {
  // Special helper for promises
  return expect(fetchUser()).resolves.toHaveProperty('id');
});
```

**Common Mistakes to Avoid:**

```javascript
// ❌ MISTAKE 1: Forget to return/await
test('bad async', () => {
  fetchUser().then(user => {
    expect(user.id).toBe(1); // Never runs!
  });
  // Test passes before promise settles
});

// ✅ FIX: Return or await
test('good async', async () => {
  const user = await fetchUser();
  expect(user.id).toBe(1);
});

// ❌ MISTAKE 2: Forget to wait for mocks
test('bad mock', async () => {
  mockFunction.mockResolvedValue(data);
  mockFunction(); // Returns promise but don't await
  expect(data).toEqual(expected); // Might not be ready
});

// ✅ FIX: Await the call
test('good mock', async () => {
  mockFunction.mockResolvedValue(data);
  await mockFunction(); // Wait for it
  expect(data).toEqual(expected);
});
```

**Interview Answer Template:**

"To test async code in Jest, I have several options. The most modern approach is async/await: I mark the test function as `async`, then use `await` to wait for promises to resolve. This is readable and feels natural. Alternatively, I can return a promise directly from the test, and Jest will wait for it. I avoid the callback `done()` pattern since it's error-prone. For mocking async functions, I use `mockResolvedValue()` or `mockRejectedValue()` to control the outcome. I also make sure to await any async operations before making assertions, otherwise the test finishes before the promise settles."

</details>
---

## Question 3: How do you mock functions and modules in Jest?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain mocking in Jest. How do you mock functions, modules, and external dependencies?

### Answer

Mocking isolates code under test by replacing dependencies with controlled test doubles.

**Types of Mocks:**
1. **Mock Functions** - jest.fn()
2. **Module Mocks** - jest.mock()
3. **Spy Functions** - jest.spyOn()
4. **Timer Mocks** - jest.useFakeTimers()
5. **Manual Mocks** - __mocks__ directory

### Code Example

```javascript
// 1. MOCK FUNCTIONS
test('mock function', () => {
  const mockFn = jest.fn();

  mockFn('hello');
  mockFn('world');

  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith('hello');
  expect(mockFn).toHaveBeenLastCalledWith('world');
});

// Mock with return value
test('mock return value', () => {
  const mockFn = jest.fn()
    .mockReturnValue(42)
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2);

  expect(mockFn()).toBe(1);
  expect(mockFn()).toBe(2);
  expect(mockFn()).toBe(42);
});

// Mock implementation
test('mock implementation', () => {
  const mockFn = jest.fn((x) => x * 2);

  expect(mockFn(5)).toBe(10);
  expect(mockFn).toHaveBeenCalledWith(5);
});

// 2. MODULE MOCKING
// axios.js
import axios from 'axios';

export async function fetchUsers() {
  const response = await axios.get('/api/users');
  return response.data;
}

// axios.test.js
import axios from 'axios';
import { fetchUsers } from './axios';

jest.mock('axios');

test('fetches users', async () => {
  const users = [{ id: 1, name: 'John' }];
  axios.get.mockResolvedValue({ data: users });

  const result = await fetchUsers();

  expect(result).toEqual(users);
  expect(axios.get).toHaveBeenCalledWith('/api/users');
});

// 3. PARTIAL MODULE MOCK
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'), // Keep other exports
  fetchData: jest.fn() // Mock only this
}));

// 4. SPY ON METHODS
test('spy on object method', () => {
  const user = {
    getName: () => 'John'
  };

  const spy = jest.spyOn(user, 'getName');

  user.getName();

  expect(spy).toHaveBeenCalled();
  spy.mockRestore(); // Restore original
});

// 5. TIMER MOCKS
test('timer mocks', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  setTimeout(callback, 1000);

  jest.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
  jest.useRealTimers();
});

// 6. MANUAL MOCKS
// __mocks__/axios.js
export default {
  get: jest.fn(() => Promise.resolve({ data: {} }))
};

// 7. MOCK IMPLEMENTATIONS PER TEST
describe('User service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock state
  });

  test('successful fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: { name: 'John' } });
    const user = await fetchUser(1);
    expect(user.name).toBe('John');
  });

  test('failed fetch', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(fetchUser(1)).rejects.toThrow('Network error');
  });
});

// 8. MOCK CHAINING
test('mock method chaining', () => {
  const mockFetch = jest.fn(() => ({
    then: jest.fn(() => ({
      catch: jest.fn()
    }))
  }));

  mockFetch().then().catch();
  expect(mockFetch).toHaveBeenCalled();
});
```

### Mock Properties

```javascript
const mockFn = jest.fn();
mockFn('arg1', 'arg2');

// Check calls
mockFn.mock.calls; // [['arg1', 'arg2']]
mockFn.mock.results; // [{ type: 'return', value: undefined }]
mockFn.mock.instances; // this values

// Clear/Reset
mockFn.mockClear(); // Clear calls/results
mockFn.mockReset(); // Clear + remove implementation
mockFn.mockRestore(); // Restore original (for spies)
```

### Resources
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)

---

<details>
<summary>🔍 <b>Deep Dive: Jest Mocking Architecture</b></summary>

**How jest.fn() Works Internally:**
Jest mock functions are Proxy-wrapped functions that intercept all calls:

```javascript
// Simplified jest.fn() implementation
function createMockFn() {
  const mock = function(...args) {
    mock.mock.calls.push(args); // Track call

    // Call mock implementation if exists
    if (mock._implementation) {
      return mock._implementation(...args);
    }

    // Otherwise return mock return value
    return mock._mockReturnValue;
  };

  // Add mock metadata
  mock.mock = {
    calls: [],        // All calls: [['arg1', 'arg2'], ...]
    results: [],      // Return values: [{ type: 'return', value: X }]
    instances: [],    // 'this' values: [this1, this2, ...]
  };

  // Add chainable methods
  mock.mockReturnValue = (value) => {
    mock._mockReturnValue = value;
    return mock;
  };

  mock.mockImplementation = (fn) => {
    mock._implementation = fn;
    return mock;
  };

  return mock;
}
```

**Module Mocking Mechanism:**
When you call `jest.mock('module')`, Jest:

1. Finds the module in node_modules or relative path
2. Replaces it with a mock factory
3. Creates __mocks__ directory variant if exists
4. Returns mock throughout test file

```javascript
// Original module: axios.js
const axios = {
  get: async (url) => fetch(url).then(r => r.json()),
  post: async (url, data) => fetch(url, { method: 'POST', body: data })
};

// Jest automatic mock (what jest.mock('axios') creates)
const axios = {
  get: jest.fn(),
  post: jest.fn(),
  // All methods become jest.fn()
};
```

**Hoisting Behavior:**
`jest.mock()` calls are hoisted to the top of test file by Jest:

```javascript
import { fetchUser } from './api';
import axios from 'axios';

jest.mock('axios'); // Hoisted to TOP automatically
// axios is now mocked BEFORE any imports

describe('API tests', () => {
  test('test', () => {
    axios.get.mockResolvedValue({ data: [] });
  });
});

// Jest transforms this to:

jest.mock('axios'); // Runs FIRST
import { fetchUser } from './api';
import axios from 'axios';
```

**Mock Scope and Isolation:**
- Mocks are module-level, not function-level
- Must clear between tests with `beforeEach(() => jest.clearAllMocks())`
- Without clearing, state persists across tests

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Fixing a Mock That Broke Production</b></summary>

**Situation:** Your checkout API calls fail in production with "Network error", but tests pass. The issue: mocks in tests are too naive.

```javascript
// payment.js (real code)
export async function processPayment(cardToken, amount) {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: cardToken, amount })
    });

    if (!response.ok) {
      throw new Error(`Payment failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Real error handling
    console.error('Payment error:', error);
    throw error;
  }
}

// BROKEN TEST (passes but doesn't catch real issues)
describe('Payment Processing', () => {
  test('processes payment', async () => {
    // Mock is too simple
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    const result = await processPayment('token123', 100);
    expect(result.success).toBe(true);

    // ❌ Test passes, but doesn't test:
    // - Network errors
    // - HTTP error status codes
    // - Timeout scenarios
    // - Malformed responses
  });
});

// PRODUCTION BUG: User network drops mid-request, but test never covered it
// Real error: fetch() throws on network error, but test never mocked that
```

**Comprehensive Mock That Catches Real Bugs:**

```javascript
describe('Payment Processing - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processes valid payment', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'pay_123', success: true })
    });

    const result = await processPayment('token123', 100);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/payments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'token123', amount: 100 })
      })
    );
  });

  test('throws on HTTP error status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 402, // Payment Required
      json: async () => ({ error: 'Insufficient funds' })
    });

    await expect(processPayment('token123', 100)).rejects.toThrow(
      'Payment failed: 402'
    );
  });

  test('throws on network error', async () => {
    // Network error - fetch() itself throws
    global.fetch = jest.fn().mockRejectedValue(
      new Error('Network error: Connection timeout')
    );

    await expect(processPayment('token123', 100)).rejects.toThrow(
      'Network error'
    );
  });

  test('throws on malformed response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new Error('Invalid JSON'); }
    });

    await expect(processPayment('token123', 100)).rejects.toThrow(
      'Invalid JSON'
    );
  });
});

// METRICS:
// Before: Test coverage 100%, but 5 production errors
// After: Test coverage 100%, 0 production errors (all edge cases covered)
```

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Mocking Strategies</b></summary>

**Mock Granularity Comparison:**

```
Strategy              | Use Case           | Pros              | Cons
</details>
---------------------|-------------------|------------------|------------------
Manual jest.fn()      | Unit tests        | Explicit control  | Verbose
                      | Fine-grained      | Easy to debug     | Repetitive
                      |                   |                   |
jest.mock()           | Module tests      | Simple setup      | Less specific
(auto-mock)           | Isolation         | Hoisted properly  | Hard to debug
                      |                   |                   |
Manual __mocks__/     | Complex modules   | Reusable          | Slow to update
(custom mocks)        | Multiple tests    | Shared fixtures   | Easy to forget
                      |                   |                   |
Partial mocks         | Mixed real+mock   | Flexible          | Confusing
(require actual)      | Some parts real   | Good for hybrids  | Race conditions
```

**When to Use Each:**

```javascript
// Unit Test: Fine-grained control
test('processPayment', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true })
  });
  global.fetch = mockFetch;

  await processPayment('token', 100);

  expect(mockFetch).toHaveBeenCalledWith('/api/payments', expect.any(Object));
});

// Integration Test: Mock entire modules
jest.mock('axios');
import axios from 'axios';

test('integration', async () => {
  axios.get.mockResolvedValue({ data: [] });
  const result = await fetchUsers();
  expect(result).toEqual([]);
});

// Hybrid Test: Mock specific parts
jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  get: jest.fn() // Only mock get, keep post real
}));
```

---

<details>
<summary>💬 <b>Explain to Junior: Mocking Fundamentals</b></summary>

**Why Do We Mock?**

Imagine testing a weather app:

```javascript
// ❌ NO MOCK - Real API problems
test('shows weather', async () => {
  const weather = await fetchWeather('London');
  expect(weather.temp).toBeGreaterThan(-50);
  // Test fails if:
  // - Internet is down
  // - API is slow
  // - API changed response format
  // - Rate limit exceeded
  // Very FLAKY!
});

// ✅ WITH MOCK - Controlled, fast, reliable
test('shows weather', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ temp: 20, city: 'London' })
  });

  const weather = await fetchWeather('London');
  expect(weather.temp).toBe(20);
  // Test always passes, takes 1ms, no internet needed
  // RELIABLE!
});
```

**Three Types of Test Doubles:**

```javascript
// 1. MOCK - Fake object that tracks calls
const mockFetch = jest.fn().mockResolvedValue({ data: [] });
// Use when you care HOW the function was called

// 2. STUB - Fake object that returns fixed data
const stubFetch = jest.fn(() => { data: [] });
// Use when you only care WHAT it returns

// 3. SPY - Wrapper that tracks calls but uses real function
const spy = jest.spyOn(localStorage, 'getItem');
// Use when you want to test real behavior with tracking
```

**Common Patterns:**

```javascript
// Pattern 1: Mock return value
const mockUser = { id: 1, name: 'John' };
jest.fn().mockReturnValue(mockUser);

// Pattern 2: Mock resolved value (promises)
jest.fn().mockResolvedValue(mockUser);

// Pattern 3: Mock implementation (custom behavior)
jest.fn((x) => x * 2);

// Pattern 4: Mock module
jest.mock('axios', () => ({
  get: jest.fn()
}));
```

**Interview Answer Template:**

"I use mocking to isolate units of code and test them independently. Instead of calling real APIs or databases, I create fake versions (mocks) that return predictable data. Jest provides `jest.fn()` to create mock functions with call tracking, and `jest.mock()` to replace entire modules. For example, when testing a payment service, I mock the fetch API to return success/failure responses without actually charging cards. I verify not just the output, but also that functions were called correctly with `toHaveBeenCalledWith()`. This makes tests fast, reliable, and independent of external services."

</details>
---

## Question 4: How do you test code coverage with Jest?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6-8 minutes
**Companies:** All major companies

### Question
Explain code coverage in Jest. How do you measure and improve coverage? What are coverage thresholds?

### Answer

Code coverage measures how much of your code is executed during tests.

**Coverage Metrics:**
1. **Statements** - % of statements executed
2. **Branches** - % of if/else branches taken
3. **Functions** - % of functions called
4. **Lines** - % of lines executed

### Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};

// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### Example Coverage Report

```bash
# Run coverage
npm run test:coverage

# Output
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   92.5  |   85.3   |   90.0  |   92.8  |
 utils.js          |  100.0  |  100.0   |  100.0  |  100.0  |
 api.js            |   85.7  |   75.0   |   80.0  |   87.5  |
-------------------|---------|----------|---------|---------|
```

### Improving Coverage

```javascript
// api.js - Initial (poor coverage)
export function processData(data) {
  if (!data) return null;
  if (data.type === 'a') return data.value * 2;
  if (data.type === 'b') return data.value + 10;
  return data.value;
}

// api.test.js - Incomplete (50% branch coverage)
test('processes data', () => {
  expect(processData({ type: 'a', value: 5 })).toBe(10);
});

// api.test.js - Complete (100% branch coverage)
describe('processData', () => {
  test('returns null for falsy input', () => {
    expect(processData(null)).toBeNull();
  });

  test('handles type a', () => {
    expect(processData({ type: 'a', value: 5 })).toBe(10);
  });

  test('handles type b', () => {
    expect(processData({ type: 'b', value: 5 })).toBe(15);
  });

  test('handles default case', () => {
    expect(processData({ type: 'c', value: 5 })).toBe(5);
  });
});
```

### Coverage Best Practices

```javascript
// ✅ GOOD: Test edge cases
test('handles empty array', () => {
  expect(sum([])).toBe(0);
});

test('handles negative numbers', () => {
  expect(sum([-1, -2])).toBe(-3);
});

// ✅ GOOD: Test error paths
test('throws on invalid input', () => {
  expect(() => divide(10, 0)).toThrow();
});

// ❌ BAD: Don't test just for coverage
test('pointless test', () => {
  const result = complexFunction();
  expect(result).toBeDefined(); // Not actually testing behavior
});

// ✅ GOOD: Test behavior
test('meaningful test', () => {
  const result = complexFunction({ input: 'test' });
  expect(result.processed).toBe(true);
  expect(result.value).toBe('PROCESSED: test');
});
```

### Resources
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean)

---

<details>
<summary>🔍 <b>Deep Dive: Code Coverage Instrumentation and Analysis</b></summary>

**How Istanbul Coverage Works:**
Jest uses Istanbul (now NYC) for coverage tracking. It uses AST transformation to inject tracking code:

```javascript
// Original function
function calculateTax(amount, state) {
  if (state === 'CA') return amount * 0.095;
  if (state === 'TX') return amount * 0.0825;
  return amount;
}

// After Istanbul instrumentation
const __cov__ = {}; // Coverage tracker
function calculateTax(amount, state) {
  __cov__.calculateTax = __cov__.calculateTax || 0;
  __cov__.calculateTax++;

  if (state === 'CA') {
    __cov__.line3 = __cov__.line3 || 0;
    __cov__.line3++;
    return amount * 0.095;
  }

  if (state === 'TX') {
    __cov__.line4 = __cov__.line4 || 0;
    __cov__.line4++;
    return amount * 0.0825;
  }

  return amount;
}
```

**Coverage Metrics Explained:**

1. **Statements** - Individual statements executed
   - `let x = 5;` is 1 statement
   - `if (x > 3) { y = 10; }` is 2 statements

2. **Branches** - Different code paths in conditionals
   - `if (x) { a } else { b }` has 2 branches
   - Ternary `x ? a : b` has 2 branches
   - Switch with 3 cases has 3 branches

3. **Functions** - Function declarations/calls
   - Must call function to count as covered

4. **Lines** - Physical lines of code
   - Line count ≈ source code file size

**Coverage Report Generation:**
Jest generates multiple formats:

```bash
# Text format (console output)
npm test -- --coverage

# HTML format (visualize coverage)
open coverage/lcov-report/index.html

# LCOV format (for CI/CD tools)
# Consumed by Codecov, Coveralls, SonarQube

# JSON format (for programmatic analysis)
coverage/coverage-final.json
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Coverage Paradox - Good Coverage, Bad Quality</b></summary>

**Situation:** Your codebase has 95% coverage, but production bugs still slip through. The coverage is HIGH but MEANINGLESS.

```javascript
// stats-calculator.js - Complex calculation logic
export function calculateStats(data) {
  if (!data || data.length === 0) return null;

  let sum = 0;
  let min = data[0];
  let max = data[0];

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  const avg = sum / data.length;
  const variance = data.reduce((acc, val) => {
    return acc + Math.pow(val - avg, 2);
  }, 0) / data.length;

  return {
    sum,
    avg,
    min,
    max,
    variance,
    stdDev: Math.sqrt(variance)
  };
}

// COVERAGE PARADOX TEST - 100% Coverage, 0% Correctness
describe('calculateStats - Bad Coverage', () => {
  test('calculates stats', () => {
    // This test is MEANINGLESS but gives 100% coverage
    const result = calculateStats([1, 2, 3, 4, 5]);
    expect(result).toBeDefined(); // ✓ Passes - but what does it check?
    // Coverage: 100% statements, 100% branches, 100% functions
    // But BUGS:
    // - Never test negative numbers
    // - Never test decimals
    // - Never test single element
    // - Never test duplicates
    // - Never validate actual calculations
  });
});

// PRODUCTION BUG: User uploads [1.5, 2.7, 3.9]
// Expected avg: 2.7
// Got: NaN (variance calculation fails with decimals)
// But test passed! Coverage was 100%!
```

**Real Coverage That Actually Catches Bugs:**

```javascript
describe('calculateStats - Real Coverage', () => {
  // Edge case: null input
  test('returns null for null input', () => {
    expect(calculateStats(null)).toBeNull();
  });

  // Edge case: empty array
  test('returns null for empty array', () => {
    expect(calculateStats([])).toBeNull();
  });

  // Basic case: positive integers
  test('calculates stats for positive integers', () => {
    const result = calculateStats([1, 2, 3, 4, 5]);
    expect(result.sum).toBe(15);
    expect(result.avg).toBe(3);
    expect(result.min).toBe(1);
    expect(result.max).toBe(5);
  });

  // Edge case: single element
  test('calculates stats for single element', () => {
    const result = calculateStats([42]);
    expect(result.sum).toBe(42);
    expect(result.avg).toBe(42);
    expect(result.min).toBe(42);
    expect(result.max).toBe(42);
    expect(result.variance).toBe(0); // No deviation
    expect(result.stdDev).toBe(0);
  });

  // Edge case: negative numbers
  test('calculates stats for negative numbers', () => {
    const result = calculateStats([-5, -2, 0, 3]);
    expect(result.sum).toBe(-4);
    expect(result.avg).toBe(-1);
    expect(result.min).toBe(-5);
    expect(result.max).toBe(3);
  });

  // Edge case: decimals
  test('calculates stats for decimal numbers', () => {
    const result = calculateStats([1.5, 2.5, 3.5]);
    expect(result.avg).toBeCloseTo(2.5, 5);
    expect(result.min).toBe(1.5);
    expect(result.max).toBe(3.5);
  });

  // Edge case: duplicates
  test('calculates stats with duplicates', () => {
    const result = calculateStats([2, 2, 2, 2]);
    expect(result.avg).toBe(2);
    expect(result.variance).toBe(0);
    expect(result.stdDev).toBe(0);
  });

  // Large dataset
  test('calculates stats for large dataset', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    const result = calculateStats(data);
    expect(result.sum).toBe(499500); // 0+1+...+999
    expect(result.min).toBe(0);
    expect(result.max).toBe(999);
  });
});

// METRICS:
// Before: 100% coverage, but 6 bugs in production
// After: 100% coverage, 0 bugs, all edge cases tested
// Key insight: Coverage measures EXECUTION, not CORRECTNESS
```

**Key Lesson:** High coverage + weak assertions = false confidence.

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Coverage Thresholds and Quality</b></summary>

**Coverage vs Effort Matrix:**

```
Coverage | Time Investment | Bug Detection | Reality Check
</details>
---------|-----------------|---------------|-------------------
50%      | 1 day           | ~50% bugs     | Initial coverage
70%      | 3-4 days        | ~75% bugs     | Comfortable
80%      | 1 week          | ~85% bugs     | Professional
90%      | 2-3 weeks       | ~92% bugs     | Excellent
95%+     | 1+ month        | ~95% bugs     | Overkill (diminishing returns)
```

**When to Target Each Level:**

```javascript
// 50% Coverage: Quick prototype, startup MVP
// Test only happy paths
test('user login', () => {
  const token = login('email@test.com', 'password');
  expect(token).toBeDefined();
});

// 70% Coverage: Production app
// Test happy paths + common error cases
test('user login with wrong password', () => {
  expect(() => login('email@test.com', 'wrong')).toThrow('Invalid password');
});

// 80% Coverage: Mission-critical app
// Test all major branches
test('user login with invalid email', () => {
  expect(() => login('invalid', 'password')).toThrow('Invalid email format');
});

// 90%+ Coverage: Financial/healthcare systems
// Test all branches + edge cases
test('user login with empty string', () => {
  expect(() => login('', '')).toThrow();
});
```

---

<details>
<summary>💬 <b>Explain to Junior: Understanding Coverage</b></summary>

**What Does Coverage Actually Mean?**

Think of testing a product:

```javascript
// Manual testing WITHOUT code coverage:
// You: "Let me use this app"
// ✓ Click button - works
// ✓ Type text - works
// ✓ Submit form - works
// Conclusion: "App works!"
// But you never tested: what if form is empty? What if network fails?

// Testing WITH code coverage:
// Coverage checks: "Did every line of code execute?"
// - Button click: ✓ Tested
// - Text input: ✓ Tested
// - Form submit success: ✓ Tested
// - Form submit error: ✗ NOT TESTED - Coverage reports this!
```

**Coverage Metric Explained Simply:**

```javascript
// 100 lines of code
// 85 lines executed during tests
// Coverage: 85%

// What it means: 15% of code paths were never tested
// What it doesn't mean: The code is 85% correct

// Real world:
// 85% coverage doesn't guarantee 85% bug-free
// 100% coverage doesn't guarantee 0% bugs
```

**Coverage Report Interpretation:**

```javascript
function checkout(cart) {
  if (cart.length === 0) {
    throw new Error('Empty cart');     // Line 1 - Branch A
  }

  const total = cart.reduce((sum, item) => {
    return sum + item.price;           // Line 2 - Branch B
  }, 0);

  if (total > 10000) {
    throw new Error('Too much money');  // Line 3 - Branch C
  }

  return processPayment(total);         // Line 4
}

// Test 1: checkout([{ price: 100 }])
// Covers: Line 1 (NO), Line 2 (YES), Line 3 (NO), Line 4 (YES)
// Coverage: 50% statements, 25% branches

// Test 2: checkout([])
// Covers: Line 1 (YES)
// Coverage with both tests: 100% statements? No! Line 1 exits early

// Full coverage requires:
test('valid cart', () => {
  expect(checkout([{ price: 100 }])).toBeDefined();
  // Covers: Lines 1 (NO check), 2, 3 (NO check), 4
});

test('empty cart', () => {
  expect(() => checkout([])).toThrow('Empty cart');
  // Covers: Line 1 (YES check)
});

test('cart too expensive', () => {
  expect(() => checkout([{ price: 20000 }])).toThrow('Too much');
  // Covers: Line 3 (YES check)
});
// Now: 100% statement coverage, 100% branch coverage
```

**Interview Answer Template:**

"Code coverage measures how much of your code is executed during tests. Jest uses Istanbul to instrument code and track which lines, branches, and functions run. Coverage has 4 metrics: statements (lines executed), branches (if/else paths), functions (declared functions called), and lines (physical lines). However, coverage is not a quality metric - 100% coverage with weak assertions is useless. I always aim for meaningful coverage where tests verify actual behavior, not just execution. For example, a test that just calls a function and expects it to be defined (not null) gives coverage but doesn't ensure correctness. I focus on testing edge cases, error scenarios, and critical business logic rather than chasing high coverage numbers."

</details>
---

## Question 5: How do you organize and structure Jest tests?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7-9 minutes
**Companies:** All companies

### Question
Explain best practices for organizing Jest tests. How do you structure test files, group tests, and share setup code?

### Answer

Well-organized tests are easier to maintain and understand.

**Best Practices:**
1. **File Structure** - Mirror source structure
2. **Test Grouping** - Logical describe blocks
3. **Setup/Teardown** - Shared fixtures
4. **Test Data** - Factories and builders
5. **Naming** - Descriptive test names

### File Structure

```
src/
├── components/
│   ├── Button.jsx
│   ├── Button.test.jsx
│   └── __tests__/
│       └── Button.integration.test.jsx
├── utils/
│   ├── math.js
│   └── math.test.js
└── __tests__/
    └── setup.js

tests/
├── unit/
├── integration/
└── e2e/
```

### Test Organization

```javascript
// Button.test.jsx - Well organized
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    test('renders with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    test('applies variant classes', () => {
      render(<Button variant="primary">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });
  });

  describe('Interactions', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByText('Click'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click</Button>);

      fireEvent.click(screen.getByText('Click'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles null children', () => {
      render(<Button>{null}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

### Shared Setup Code

```javascript
// tests/helpers/setup.js
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides
  };
}

export function setupDatabase() {
  const db = new Map();
  return {
    get: (key) => db.get(key),
    set: (key, value) => db.set(key, value),
    clear: () => db.clear()
  };
}

// Using helpers
import { createMockUser, setupDatabase } from './helpers/setup';

describe('User Service', () => {
  let db;

  beforeEach(() => {
    db = setupDatabase();
  });

  test('saves user', () => {
    const user = createMockUser({ name: 'Alice' });
    db.set(user.id, user);

    expect(db.get(user.id)).toEqual(user);
  });
});
```

### Test Data Factories

```javascript
// tests/factories/user.factory.js
let nextId = 1;

export const UserFactory = {
  build: (overrides = {}) => ({
    id: nextId++,
    name: 'Test User',
    email: `test${nextId}@example.com`,
    role: 'user',
    active: true,
    createdAt: new Date(),
    ...overrides
  }),

  buildList: (count, overrides = {}) => {
    return Array.from({ length: count }, () => UserFactory.build(overrides));
  }
};

// Usage
test('processes multiple users', () => {
  const users = UserFactory.buildList(3);
  expect(users).toHaveLength(3);
  expect(users[0].id).not.toBe(users[1].id);
});
```

### Resources
- [Jest Best Practices](https://jestjs.io/docs/setup-teardown)

---

<details>
<summary>🔍 <b>Deep Dive: Test Suite Architecture and Fixture Management</b></summary>

**Hook Execution Order:**
Jest executes hooks in a strict sequence per test:

```javascript
// Execution timeline for 2 tests:
describe('Suite', () => {
  beforeAll(() => {
    console.log('1. beforeAll - runs ONCE at start');
  });

  beforeEach(() => {
    console.log('2. beforeEach - runs BEFORE EACH test');
  });

  test('Test 1', () => {
    console.log('3. Test 1 runs');
  });

  afterEach(() => {
    console.log('4. afterEach - runs AFTER EACH test');
  });

  test('Test 2', () => {
    console.log('5. Test 2 runs');
  });

  afterAll(() => {
    console.log('6. afterAll - runs ONCE at end');
  });
});

// Actual execution order:
// 1. beforeAll
// 2. beforeEach
// 3. Test 1
// 4. afterEach
// 2. beforeEach (again for Test 2)
// 5. Test 2
// 4. afterEach (again)
// 6. afterAll
```

**Nested describe Scope:**
Hooks cascade down through nested describe blocks:

```javascript
describe('Outer', () => {
  beforeAll(() => console.log('Outer beforeAll'));

  describe('Inner', () => {
    beforeAll(() => console.log('Inner beforeAll'));

    test('test', () => {
      console.log('Test runs');
    });
  });
});

// Execution:
// Outer beforeAll
// Inner beforeAll
// Test runs
```

**Fixture Management Patterns:**
Different fixture strategies for different scenarios:

```javascript
// Strategy 1: beforeEach - Fresh state per test
describe('User Service', () => {
  let service;

  beforeEach(() => {
    service = new UserService(); // Fresh instance
  });

  test('test 1', () => {
    service.addUser({ id: 1 });
    expect(service.users.length).toBe(1);
  });

  test('test 2', () => {
    // service.users is empty, not affected by test 1
    expect(service.users.length).toBe(0);
  });
});

// Strategy 2: Lazy initialization - Performance optimization
describe('Database', () => {
  let db;

  beforeAll(async () => {
    db = await setupDB(); // Expensive, do once
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(() => {
    db.clear(); // Fast cleanup per test
  });
});

// Strategy 3: Factory pattern - Flexible fixtures
const createUser = (overrides = {}) => ({
  id: Math.random(),
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

test('users', () => {
  const admin = createUser({ role: 'admin' });
  const guest = createUser({ role: 'guest' });
  // Explicit, readable test setup
});
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Test Suite Becomes Hard to Maintain</b></summary>

**Problem:** Your test suite has 50 tests, but they're unorganized and often fail due to shared state.

```javascript
// POORLY ORGANIZED - Causes flaky tests
const testData = {}; // SHARED state across all tests!

describe('API Tests', () => {
  test('fetches users', async () => {
    const users = await fetchUsers();
    testData.users = users; // Mutates shared state
    expect(users.length).toBeGreaterThan(0);
  });

  test('fetches user 1', async () => {
    // Depends on previous test's side effects!
    const user = testData.users[0];
    expect(user.id).toBe(1);
    // FAILS if previous test runs first, but not if it runs second!
  });

  test('creates user', async () => {
    const user = await createUser({ name: 'Alice' });
    testData.user = user;
    expect(user.id).toBeDefined();
  });

  test('deletes user', async () => {
    // Depends on testData.user from previous test
    await deleteUser(testData.user.id);
    // FAILS if tests run in different order!
  });
});

// Symptoms:
// - Tests pass locally but fail on CI
// - Tests fail when run in isolation
// - Tests pass Monday but fail Friday (random order)
```

**Well-Organized Solution:**

```javascript
// WELL-ORGANIZED - Each test is independent
describe('User API', () => {
  // Group 1: Read Operations
  describe('fetching', () => {
    let mockUsers;

    beforeEach(() => {
      // Fresh state per test
      mockUsers = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ];
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => mockUsers
      });
    });

    test('fetches all users', async () => {
      const users = await fetchUsers();
      expect(users).toEqual(mockUsers);
    });

    test('fetches single user', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => mockUsers[0]
      });
      const user = await fetchUser(1);
      expect(user.id).toBe(1);
    });
  });

  // Group 2: Write Operations
  describe('creation', () => {
    test('creates user with valid data', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ id: 3, name: 'Charlie' })
      });
      const user = await createUser({ name: 'Charlie' });
      expect(user.id).toBe(3);
    });

    test('rejects invalid email', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new Error('Invalid email')
      );
      await expect(createUser({ email: 'invalid' })).rejects.toThrow();
    });
  });

  // Group 3: Delete Operations
  describe('deletion', () => {
    test('deletes user by id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ success: true })
      });
      const result = await deleteUser(1);
      expect(result.success).toBe(true);
    });

    test('rejects deletion of non-existent user', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new Error('User not found')
      );
      await expect(deleteUser(999)).rejects.toThrow();
    });
  });
});

// Results:
// - All tests independent
// - Can run in any order
// - No shared state
// - Easy to find and modify related tests
```

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Test Organization Strategies</b></summary>

**Strategy Comparison:**

```
Strategy          | Pros                   | Cons
</details>
------------------|------------------------|---
One big file      | Simple for small tests | Hard to find tests
(flat)            | Easy to search         | Confusing structure
                  |                        |
Multiple files    | Easy to locate tests   | Scattered related tests
(by function)     | Good for imports       | Harder to run related
                  |                        |
Nested describes  | ✅ Logical grouping   | Deep nesting confusing
(by functionality)| ✅ Shared fixtures    | Scope issues
                  | ✅ Easy to run group  |
                  |                        |
Mirror structure  | ✅ Matches source     | Extra directory
(src/test pairs)  | ✅ Easy navigation    | More files
```

---

<details>
<summary>💬 <b>Explain to Junior: Organizing Tests</b></summary>

**Why Organization Matters:**

Imagine a restaurant kitchen with 100 recipes scattered randomly on papers vs organized by meal type:

```javascript
// ❌ DISORGANIZED - Hard to find and maintain
test('makes pasta', () => {});
test('prepares salad', () => {});
test('bakes bread', () => {}); // Where's the dessert test?
test('cooks chicken', () => {});
test('makes dessert', () => {}); // Found it! But where's the sauce test?

// ✅ ORGANIZED - Clear structure
describe('Main courses', () => {
  test('cooks chicken', () => {});
  test('makes pasta', () => {});
});

describe('Sides', () => {
  test('prepares salad', () => {});
  test('makes sauce', () => {});
});

describe('Bread and desserts', () => {
  test('bakes bread', () => {});
  test('makes dessert', () => {});
});
```

**Basic Organization Pattern:**

```javascript
describe('Component: UserCard', () => {
  // Setup phase - shared for all tests
  beforeEach(() => {
    // Reset state
  });

  // Feature group 1
  describe('Rendering', () => {
    test('displays user name', () => {});
    test('displays user avatar', () => {});
  });

  // Feature group 2
  describe('Interactions', () => {
    test('opens edit modal on click', () => {});
    test('disables buttons when disabled prop is true', () => {});
  });

  // Feature group 3
  describe('Edge cases', () => {
    test('handles missing user gracefully', () => {});
    test('handles very long names', () => {});
  });
});
```

**Interview Answer Template:**

"I organize tests by feature or component, using nested `describe` blocks to group related tests. Each group shares `beforeEach` hooks for setup, ensuring tests are isolated and don't depend on each other. I avoid shared mutable state and create fresh fixtures per test. For file organization, I mirror my source code structure - for `src/components/Button.js`, I create `src/components/Button.test.js`. Within each test file, I use describe blocks to organize by feature (rendering, interactions, edge cases). This makes tests easy to find, modify, and run independently. I also use factory functions for creating test data, making tests readable and maintainable."

</details>
---

## Question 6: How do you debug failing Jest tests?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6-8 minutes
**Companies:** All companies

### Question
Explain techniques for debugging Jest tests. How do you investigate test failures and fix flaky tests?

### Answer

Effective debugging helps identify root causes quickly.

**Debugging Techniques:**
1. **Focused Tests** - Run only failing tests
2. **Verbose Output** - Detailed error messages
3. **Debug Mode** - Node debugger
4. **Console Logs** - Strategic logging
5. **Test Isolation** - Remove shared state

### Running Specific Tests

```bash
# Run single test file
npm test -- Button.test.js

# Run tests matching pattern
npm test -- --testNamePattern="handles click"

# Run only changed files
npm test -- --onlyChanged

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Test Debugging

```javascript
// 1. FOCUSED TESTS
describe('Button', () => {
  test.only('this test runs', () => {
    // Only this test runs
  });

  test('this is skipped', () => {
    // Skipped
  });
});

// Skip tests
test.skip('skipped test', () => {
  // Won't run
});

// 2. VERBOSE OUTPUT
test('detailed error', () => {
  const result = complexCalculation();

  // Bad error message
  expect(result).toBe(42); // Expected: 42, Received: 43

  // Good error message
  expect(result).toBe(42); // Add context
  console.log('Calculation input:', input);
  console.log('Calculation result:', result);
});

// 3. DEBUG HELPERS
test('debug test', () => {
  const data = getData();

  // Log to see data structure
  console.log(JSON.stringify(data, null, 2));

  // Inspect mock calls
  console.log(mockFn.mock.calls);

  expect(data.value).toBe(expected);
});

// 4. SNAPSHOT DEBUGGING
test('component snapshot', () => {
  const { container } = render(<Component />);

  // Output HTML to debug
  console.log(container.innerHTML);

  expect(container).toMatchSnapshot();
});

// 5. ASYNC DEBUGGING
test('async debug', async () => {
  console.log('Before fetch');
  const data = await fetchData();
  console.log('After fetch:', data);

  expect(data).toBeDefined();
});
```

### Fixing Flaky Tests

```javascript
// ❌ FLAKY: Race condition
test('flaky test', async () => {
  startAsyncOperation();
  const result = getResult(); // May not be ready!
  expect(result).toBeDefined();
});

// ✅ FIXED: Wait for completion
test('stable test', async () => {
  await startAsyncOperation();
  const result = getResult();
  expect(result).toBeDefined();
});

// ❌ FLAKY: Shared state
let counter = 0;

test('test 1', () => {
  counter++;
  expect(counter).toBe(1); // Passes if run first
});

test('test 2', () => {
  counter++;
  expect(counter).toBe(1); // Fails if run after test 1
});

// ✅ FIXED: Isolated state
describe('counter tests', () => {
  let counter;

  beforeEach(() => {
    counter = 0; // Reset before each test
  });

  test('test 1', () => {
    counter++;
    expect(counter).toBe(1);
  });

  test('test 2', () => {
    counter++;
    expect(counter).toBe(1);
  });
});

// ❌ FLAKY: Time-dependent
test('flaky timeout', (done) => {
  setTimeout(() => {
    expect(value).toBe(true);
    done();
  }, 100); // Might fail on slow systems
});

// ✅ FIXED: Use fake timers
test('stable timeout', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  setTimeout(callback, 100);
  jest.advanceTimersByTime(100);

  expect(callback).toHaveBeenCalled();
  jest.useRealTimers();
});
```

### Resources
- [Jest CLI Options](https://jestjs.io/docs/cli)

---

<details>
<summary>🔍 <b>Deep Dive: Test Debugging Techniques and Tools</b></summary>

**Jest Debug Mode - Node Inspector:**
Jest integrates with Node's debugger for step-through debugging:

```bash
# Terminal 1: Start debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Terminal 2: Open Chrome DevTools
# Navigate to: chrome://inspect
# Click "Inspect" next to running process
# Set breakpoints, step through code
```

**Console Output Inspection:**
Jest captures console output, allowing you to log data:

```javascript
test('debug with console', () => {
  const data = { id: 1, name: 'Test' };

  // Logs appear when test fails
  console.log('Data structure:', JSON.stringify(data, null, 2));
  console.log('Keys:', Object.keys(data));

  expect(data.id).toBe(2); // FAILS - console output shows why

  // Output:
  // Data structure: {
  //   "id": 1,
  //   "name": "Test"
  // }
  // Keys: [ 'id', 'name' ]
});
```

**Custom Error Messages:**
Jest shows custom messages for better debugging:

```javascript
expect(value).toBe(expected); // Generic error message

// vs

expect(value).toBe(expected); // Custom error message
// Error: "Value validation failed - expected positive number but got negative"
```

**Snapshot Debugging:**
Jest shows diffs when snapshots fail:

```javascript
test('snapshot', () => {
  const rendered = renderComponent();
  expect(rendered).toMatchSnapshot();
  // If fails, shows EXACTLY what changed:
  // - <h1>Old Title</h1>
  // + <h1>New Title</h1>
});
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Hunting Down a Flaky Test</b></summary>

**Problem:** Test passes 90% of the time but randomly fails. Symptoms appear only on CI, not locally.

```javascript
// FLAKY TEST - Race condition, timing dependent
let request = null;

test('processes request', (done) => {
  function handleResponse() {
    expect(request.status).toBe('completed');
    done();
  }

  request = startAsyncRequest();
  setTimeout(handleResponse, 100); // Timing assumption!

  // On slow CI servers, request takes 200ms
  // handleResponse fires at 100ms before request completes
  // TEST FAILS RANDOMLY
});

// Debugging process:
// 1. Run locally: PASSES (machine is fast enough)
// 2. Run on CI: FAILS (machine is slower)
// 3. Run with longer timeout: PASSES (covers the race)
// 4. Root cause: Test assumes timing that's not guaranteed
```

**Debugging Tools and Techniques:**

```javascript
// Technique 1: Console logging with context
test('debug request flow', async () => {
  console.log('[TEST] Starting request');

  try {
    const response = await fetchData();
    console.log('[TEST] Received response:', response);

    expect(response.status).toBe(200);
  } catch (error) {
    console.log('[TEST] Error occurred:', error.message);
    console.log('[TEST] Stack trace:', error.stack);
    throw error;
  }
});

// Technique 2: Temporary test.only to isolate
describe('API tests', () => {
  test.only('failing test', async () => {
    // Only this test runs
    // Helps isolate the problem
  });

  test('other test', () => {
    // Skipped
  });
});

// Technique 3: Verbose mock inspection
test('debug mocks', () => {
  const mockFn = jest.fn();

  mockFn('arg1', 'arg2');
  mockFn('arg3');

  console.log('All calls:', mockFn.mock.calls);
  // Output: [['arg1', 'arg2'], ['arg3']]

  console.log('Call count:', mockFn.mock.calls.length);
  // Output: 2

  expect(mockFn).toHaveBeenCalledTimes(2);
});

// Technique 4: Snapshot inspection
test('debug snapshot', () => {
  const html = renderComponent();

  // First run: creates snapshot
  // Next run: compares with snapshot
  // If fails, shows exact diff
  expect(html).toMatchSnapshot();

  // Update snapshots with: jest -u
});
```

**Fixing the Flaky Test:**

```javascript
// FIXED - Proper async handling
test('processes request - fixed', async () => {
  console.log('[TEST] Starting request');

  const request = startAsyncRequest();
  console.log('[TEST] Request started, waiting for completion');

  // Actually wait for completion, not assume timing
  const response = await request;
  console.log('[TEST] Request completed:', response.status);

  expect(response.status).toBe('completed');
  // Now always passes, regardless of machine speed
});

// Alternative fix using waitFor:
test('processes request - with waitFor', async () => {
  const request = startAsyncRequest();

  await waitFor(() => {
    expect(request.status).toBe('completed');
  }, { timeout: 5000 }); // Wait UP TO 5s, not exactly 100ms
});
```

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Debugging Strategies</b></summary>

**Strategy Comparison:**

```
Strategy          | Pros              | Cons
</details>
------------------|-------------------|------------------
Console.log       | ✅ Simple         | Output noise
                  | ✅ No setup       | Hard to follow
                  |                   |
Node debugger     | Precise step-through | Slow
                  | Set breakpoints   | Requires terminal
                  |                   |
test.only         | ✅ Quick isolation | Manual process
                  | ✅ Clear focus    | Forget to remove
                  |                   |
Snapshot testing  | Shows exact diffs | Can hide issues
                  | Visual feedback   | Snapshot bloat
```

---

<details>
<summary>💬 <b>Explain to Junior: Debugging Tests</b></summary>

**Why Tests Fail:**

```javascript
// Reason 1: Wrong assertion
test('math', () => {
  expect(2 + 2).toBe(5); // I made a mistake in my code!
  // Error: Expected 5 but got 4
});

// Reason 2: Async not handled properly
test('async', () => {
  fetchData().then(data => {
    expect(data).toBeDefined(); // Never runs!
  });
  // Test passes before promise settles
});

// Reason 3: Mock not set up
test('with mock', () => {
  // fetch not mocked
  const data = await fetchData();
  // Real network call fails
});

// Reason 4: Shared state between tests
let counter = 0;

test('test 1', () => {
  counter++;
  expect(counter).toBe(1); // Passes
});

test('test 2', () => {
  counter++; // Counter still 1 from test 1!
  expect(counter).toBe(1); // FAILS! counter is 2
});
```

**Debugging Checklist:**

```javascript
// When a test fails, check:

// 1. Is the assertion correct?
expect(result).toBe(5); // Check this value

// 2. Is async handled?
test('async', async () => { // Add 'async'
  const data = await fetchData(); // Add 'await'
  expect(data).toBeDefined();
});

// 3. Are mocks set up?
jest.mock('axios');
import axios from 'axios';
axios.get.mockResolvedValue({ data: [] }); // Set up BEFORE using

// 4. Is state shared?
beforeEach(() => {
  // Reset state
  counter = 0;
});

// 5. Run test in isolation
test.only('this test', () => {
  // If this passes in isolation, it's a shared state issue
});
```

**Interview Answer Template:**

"When debugging failing tests, I start by running the test in isolation using `test.only()` to see if the failure is consistent or intermittent. For synchronous failures, I check the assertion itself - is it testing what I think? For async failures, I ensure I'm using `async/await` or returning promises. I check that mocks are properly configured with `mockResolvedValue()` or `mockRejectedValue()`. For flaky tests that pass sometimes, I look for race conditions, timing assumptions, or shared state between tests. I use console.log strategically to output intermediate values, and inspect `jest.mock.calls` to verify mocks were called correctly. For snapshot mismatches, I check if the change is intentional and update with `jest -u`. I also run tests with `--verbose` for more detailed output and use Node's debugger with `--inspect-brk` for step-through debugging when needed."

</details>
---

## Question 7: How do you test React components with Jest and React Testing Library?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Meta, Google, Airbnb, Netflix

### Question
Explain how to test React components using Jest and React Testing Library. What are the best practices?

### Answer

React Testing Library encourages testing components as users interact with them.

**Key Principles:**
1. **User-Centric** - Test like a user
2. **Accessibility** - Query by ARIA roles
3. **No Implementation Details** - Avoid testing state directly
4. **Async Handling** - waitFor, findBy queries
5. **Events** - fireEvent, userEvent

### Code Example

```javascript
// UserProfile.jsx
import { useState, useEffect } from 'react';

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => alert('Edit')}>Edit</button>
    </div>
  );
}

// UserProfile.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

// Mock fetch
global.fetch = jest.fn();

describe('UserProfile', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UserProfile userId={1} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays user data after loading', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    fetch.mockResolvedValueOnce({
      json: async () => mockUser
    });

    render(<UserProfile userId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('shows error on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  test('calls edit when button clicked', async () => {
    const mockUser = { name: 'John', email: 'john@test.com' };
    fetch.mockResolvedValueOnce({ json: async () => mockUser });

    window.alert = jest.fn();
    const user = userEvent.setup();

    render(<UserProfile userId={1} />);

    await screen.findByText('John');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(window.alert).toHaveBeenCalledWith('Edit');
  });
});
```

### Query Methods

```javascript
// Queries - Fail if not found
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Username');
screen.getByPlaceholderText('Enter email');
screen.getByText(/hello world/i);
screen.getByDisplayValue('John');
screen.getByAltText('Profile picture');
screen.getByTitle('Close');
screen.getByTestId('custom-element');

// Async queries - Wait for element
await screen.findByText('Loaded!');
await screen.findByRole('button');

// Query variants
screen.queryByText('Not found'); // Returns null if not found
screen.getAllByRole('listitem'); // Returns array
```

### User Interactions

```javascript
import userEvent from '@testing-library/user-event';

test('user interactions', async () => {
  const user = userEvent.setup();
  render(<Form />);

  // Type in input
  await user.type(screen.getByLabelText('Email'), 'test@example.com');

  // Click button
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Clear input
  await user.clear(screen.getByLabelText('Email'));

  // Select option
  await user.selectOptions(screen.getByRole('combobox'), 'option1');

  // Upload file
  const file = new File(['content'], 'test.png', { type: 'image/png' });
  await user.upload(screen.getByLabelText('Upload'), file);
});
```

### Resources
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

<details>
<summary>🔍 <b>Deep Dive: React Component Testing Architecture</b></summary>

**React Testing Library Philosophy:**
RTL emphasizes testing like users interact with components (behavior, not implementation):

```javascript
// ❌ IMPLEMENTATION DETAIL - Testing internal state
test('state', () => {
  const { container } = render(<Counter />);
  const state = container.instance.state; // Direct access
  expect(state.count).toBe(0); // Testing internals
});

// ✅ USER BEHAVIOR - Testing visible behavior
test('behavior', () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
  // Testing what user sees
});
```

**Query Priority Hierarchy:**
RTL queries ordered by accessibility and user preference:

```javascript
// TIER 1: Preferred (most accessible)
screen.getByRole('button') // ARIA role - best for users with screen readers
screen.getByLabelText('Email') // Proper form labels
screen.getByPlaceholderText('Enter text') // Placeholder text
screen.getByText('Submit') // Display text

// TIER 2: Acceptable
screen.getByDisplayValue('current value') // Form inputs
screen.getByAltText('profile pic') // Images
screen.getByTitle('tooltip') // Title attributes

// TIER 3: Last resort (implementation details)
screen.getByTestId('custom-elem') // Only when nothing else works
```

**Async Testing Pattern with waitFor:**
RTL provides utilities to handle async updates:

```javascript
// User events trigger updates
const user = userEvent.setup();
render(<AsyncForm />);

const input = screen.getByRole('textbox');
await user.type(input, 'search query');

// Component fetches data, updates UI
// Use waitFor to wait for updates
await waitFor(() => {
  expect(screen.getByText('Results loaded')).toBeInTheDocument();
});

// Under the hood:
// waitFor polls: Does condition pass? No? Wait, try again.
// Repeats until timeout (default 1000ms) or condition passes
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Test That Doesn't Match Reality</b></summary>

**Problem:** Test passes but component breaks for users.

```javascript
// UserProfile.jsx
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => alert('Edit')}>Edit</button>
    </div>
  );
}

// BROKEN TEST - Doesn't test user flow
describe('UserProfile - Broken', () => {
  test('renders user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ name: 'John', email: 'john@test.com' })
    });

    render(<UserProfile userId={1} />);

    // Test passes immediately without waiting for load
    // Never waits for actual user interaction flow
    expect(fetch).toHaveBeenCalled();
  });
});

// REAL SCENARIO: User sees Loading, then data, then clicks Edit
// The test never simulates this!
```

**Real Test That Matches User Behavior:**

```javascript
describe('UserProfile - Real', () => {
  test('shows loading then user data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ name: 'John', email: 'john@test.com' })
    });

    render(<UserProfile userId={1} />);

    // User sees loading state first
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // User waits for data to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // User sees the full profile
    expect(screen.getByText('john@test.com')).toBeInTheDocument();

    // User can click edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  test('handles missing user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => null // No user returned
    });

    render(<UserProfile userId={999} />);

    // User sees loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After loading, user sees "not found"
    await waitFor(() => {
      expect(screen.getByText('No user found')).toBeInTheDocument();
    });
  });

  test('refetches on userId change', async () => {
    const { rerender } = render(<UserProfile userId={1} />);

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ name: 'User 1' })
    });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // User navigates to different user
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ name: 'User 2' })
    });

    rerender(<UserProfile userId={2} />);

    // Component refetches and shows new user
    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
```

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Testing Approaches</b></summary>

**Approach Comparison:**

```
Approach          | Pros              | Cons
</details>
------------------|-------------------|------------------
Shallow render    | Fast              | Misses integration
                  | Isolated          | Unrealistic
                  |                   |
Full render       | ✅ Real behavior  | Slower
                  | ✅ Realistic      | External deps
                  | ✅ User flow      |
                  |                   |
Component tests   | Quick to write    | Implementation details
(state/props)     | Granular          | Fragile
                  |                   |
Behavior tests    | ✅ User-centric   | Less precise
(RTL)             | ✅ Robust         | More setup
```

---

<details>
<summary>💬 <b>Explain to Junior: Testing React Components</b></summary>

**How React Components Work:**

```javascript
// Component lifecycle:
// 1. Component renders
// 2. User interacts (click, type, etc.)
// 3. Component updates
// 4. Component re-renders

// Test should simulate this flow

test('component flow', async () => {
  // 1. RENDER: Show initial UI
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  // 2. INTERACT: User does something
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  // 3. UPDATE & RE-RENDER: Component updates
  // Usually happens instantly for sync updates
  // Or takes time for async updates

  // 4. VERIFY: Check new UI
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

**Query Selection Guide:**

```javascript
// Which query to use?

// For buttons, links, etc.
screen.getByRole('button', { name: /save/i })
// Human readable, accessible, user-centric

// For form inputs
screen.getByLabelText('Email') // Has proper <label>
// Accessible, clear intent

// For text content
screen.getByText('Welcome') // Visible to user
// Simple, user-centric

// As last resort
screen.getByTestId('special-element')
// When element has no accessible attributes
```

**Interview Answer Template:**

"I test React components using React Testing Library, which emphasizes testing like users interact with components. I prioritize testing user behavior over implementation details - testing what users see and do, not internal state or props. I render components and use queries like `getByRole`, `getByLabelText`, and `getByText` in order of accessibility preference. For async operations, I use `waitFor` to wait for the UI to update instead of using arbitrary timeouts. I mock external dependencies like fetch and API calls, but keep internal component logic real. I test complete user flows: render → interact → verify. I avoid testing implementation details like checking state directly, which makes tests fragile when internals change. This approach ensures tests accurately reflect real user behavior and catch integration issues."

</details>
---

## Question 8: How do you test custom React hooks?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7-9 minutes
**Companies:** Meta, Airbnb, Netflix

### Question
Explain how to test custom React hooks. What tools and patterns should you use?

### Answer

Custom hooks need special testing because they can't be called outside components.

**Approach:** Use `@testing-library/react-hooks` or `renderHook` from React Testing Library.

### Code Example

```javascript
// useCounter.js
import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  test('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  test('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});

// Testing hooks with dependencies
// useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// useFetch.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

global.fetch = jest.fn();

describe('useFetch', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValueOnce({
      json: async () => mockData
    });

    const { result } = renderHook(() => useFetch('/api/data'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  test('handles fetch error', async () => {
    const mockError = new Error('Failed to fetch');
    fetch.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFetch('/api/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  test('refetches on url change', async () => {
    fetch.mockResolvedValue({ json: async () => ({ id: 1 }) });

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/users/1' } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Change URL
    rerender({ url: '/api/users/2' });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### Resources
- [Testing React Hooks](https://react-hooks-testing-library.com/)

---

<details>
<summary>🔍 <b>Deep Dive: Hook Testing with renderHook and act()</b></summary>

**Why Hooks Need Special Testing:**
Hooks can only run inside React components. You can't call them directly:

```javascript
// ❌ THIS FAILS - Hooks can only run inside components
test('hook test', () => {
  const { count, increment } = useCounter(); // Error! Not in component
  increment();
  expect(count).toBe(1);
});

// ✅ THIS WORKS - Use renderHook to create component wrapper
test('hook test', () => {
  const { result } = renderHook(() => useCounter());
  // result.current has hook's return value
  expect(result.current.count).toBe(0);
});
```

**The act() Function:**
`act()` batches state updates and ensures they're processed before assertions:

```javascript
// ❌ WITHOUT act() - State updates aren't processed
test('without act', () => {
  const { result } = renderHook(() => useState(0));
  result.current[1](5); // setState call
  expect(result.current[0]).toBe(5); // May fail! Update not processed
});

// ✅ WITH act() - State updates are processed
test('with act', () => {
  const { result } = renderHook(() => useState(0));
  act(() => {
    result.current[1](5); // setState call
  });
  expect(result.current[0]).toBe(5); // Always works
});
```

**Hook Dependencies and Rerender:**
`rerender()` updates hook props to test dependency changes:

```javascript
// Hook with dependencies
function useEffect(effect, deps) {
  // Runs effect only if deps changed
}

// Test dependency updates:
const { result, rerender } = renderHook(
  ({ value }) => useMemo(() => value * 2, [value]),
  { initialProps: { value: 5 } }
);

expect(result.current).toBe(10); // 5 * 2

// Change prop (simulates parent update)
rerender({ value: 10 });
expect(result.current).toBe(20); // 10 * 2
```

</details>
---

<details>
<summary>🐛 <b>Real-World Scenario: Testing Complex Hook with Multiple Responsibilities</b></summary>

**Problem:** Hook with `useEffect`, `useState`, `useCallback` - hard to test all scenarios.

```javascript
// custom-hook.js - Complex hook with async behavior
export function useFetchUser(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);

    return fetchUser(userId)
      .then((user) => {
        setData(user);
        return user;
      })
      .catch((err) => {
        setError(err);
        throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    fetch(); // Auto-fetch on mount
  }, [userId, fetch]);

  return { data, loading, error, refetch: fetch };
}

// INCOMPLETE TESTS - Misses edge cases
describe('useFetchUser - Incomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ id: 1, name: 'John' })
    });

    const { result } = renderHook(() => useFetchUser(1));

    // Test only happy path
    // Misses: error handling, refetch, dependency updates
  });
});

// COMPREHENSIVE TESTS - All scenarios covered
describe('useFetchUser - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with null data', () => {
    const { result } = renderHook(() => useFetchUser(1));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetches user on mount', async () => {
    const mockUser = { id: 1, name: 'John' };
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => mockUser
    });

    const { result } = renderHook(() => useFetchUser(1));

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  test('refetches when userId changes', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ id: 1, name: 'User 1' })
      })
      .mockResolvedValueOnce({
        json: async () => ({ id: 2, name: 'User 2' })
      });

    const { result, rerender } = renderHook(
      ({ userId }) => useFetchUser(userId),
      { initialProps: { userId: 1 } }
    );

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.data?.name).toBe('User 1');
    });

    // Change userId
    rerender({ userId: 2 });

    // Should refetch with new userId
    await waitFor(() => {
      expect(result.current.data?.name).toBe('User 2');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('handles errors', async () => {
    const mockError = new Error('Network error');
    global.fetch = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetchUser(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  test('manual refetch works', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ id: 1, name: 'John' })
    });

    const { result } = renderHook(() => useFetchUser(1));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    // Manually trigger refetch
    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
```

</details>
---

<details>
<summary>⚖️ <b>Trade-offs: Hook Testing Strategies</b></summary>

**Strategy Comparison:**

```
Strategy          | Pros              | Cons
</details>
------------------|-------------------|------------------
Direct in tests   | Detailed control  | Violates rules
                  | Granular          | Hard to debug
                  |                   |
renderHook        | ✅ Official way  | Adds abstraction
                  | ✅ Tests hooks    | Slower than direct
                  | ✅ Handles act()  |
                  |                   |
Component wrapper | Tests real usage  | Harder to debug
                  | Integration test  | Includes component
                  |                   |
```

---

<details>
<summary>💬 <b>Explain to Junior: Testing Custom Hooks</b></summary>

**Why Hooks are Different:**

```javascript
// Regular function - Easy to test
function add(a, b) {
  return a + b;
}

test('add', () => {
  expect(add(2, 3)).toBe(5); // Just call it!
});

// Hook - Can't call directly
function useCounter() {
  const [count, setCount] = useState(0);
  // ...
}

test('hook', () => {
  const { count } = useCounter(); // ERROR! Not in component
});

// Solution: Use renderHook
test('hook', () => {
  const { result } = renderHook(() => useCounter());
  // result.current is the hook's return value
  expect(result.current.count).toBe(0);
});
```

**Hook Testing Pattern:**

```javascript
// Step 1: Render the hook
const { result } = renderHook(() => useCounter());

// Step 2: Verify initial state
expect(result.current.count).toBe(0);

// Step 3: Perform action (wrapped in act())
act(() => {
  result.current.increment();
});

// Step 4: Verify new state
expect(result.current.count).toBe(1);
```

**Testing Hooks with Dependencies:**

```javascript
// Hook depends on props
function useSearch(query) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      searchAPI(query).then(setResults);
    }
  }, [query]);

  return results;
}

// Test prop changes
const { result, rerender } = renderHook(
  ({ query }) => useSearch(query),
  { initialProps: { query: 'react' } }
);

// Change prop
rerender({ query: 'hooks' });

// Hook should re-run effect with new query
expect(result.current).toEqual(/* new results */);
```

**Interview Answer Template:**

"To test custom React hooks, I use the `renderHook` function from React Testing Library, which creates a wrapper component to execute the hook. I can't call hooks directly outside components, so `renderHook` solves this. I use `act()` to wrap state updates and ensure they're processed before asserting. For hooks with side effects, I use `waitFor` to wait for async operations. I test the full lifecycle: initial state, state updates, dependency changes, and error scenarios. For hooks with parameters, I use the `rerender` function to change props and verify the hook responds correctly. I avoid testing implementation details and instead focus on testing the hook's behavior from a user's perspective."

</details>
---

**[← Back to Testing README](./README.md)**

**Progress:** 8 of 18+ Jest questions completed with FULL 4-DIMENSION DEPTH ✅

## Depth Addition Summary

All 8 questions now have comprehensive 4-dimension depth sections:

**Question 1:** Jest Basics
- Deep Dive: Jest internals, execution, matchers, isolation, coverage (Istanbul)
- Real-World: Tax calculator coverage gap discovery and debugging
- Trade-offs: Jest vs Vitest comparison
- Explain to Junior: Simple calculator analogy, matcher types, interview templates

**Question 2:** Async Testing
- Deep Dive: Promise mechanics, async/await transformation, timeouts, concurrency
- Real-World: Race condition debugging on CI systems
- Trade-offs: Callbacks vs Promises vs Async/Await vs Resolves/Rejects
- Explain to Junior: Restaurant order analogy, 3 async patterns, common mistakes

**Question 3:** Mocking
- Deep Dive: jest.fn() internals, module mocking mechanism, hoisting, scope
- Real-World: Payment service mock that missed edge cases (network errors, timeouts)
- Trade-offs: Mock granularity strategies (manual vs auto vs hybrid)
- Explain to Junior: Why mocking matters, 3 types of test doubles, common patterns

**Question 4:** Coverage
- Deep Dive: Istanbul instrumentation, coverage metrics (statements/branches/functions/lines)
- Real-World: Coverage paradox (95% coverage but bugs still shipped)
- Trade-offs: Coverage vs effort trade-offs (50%, 70%, 80%, 90%, 95%+)
- Explain to Junior: What coverage actually means, metric interpretation, checklist

**Question 5:** Organization
- Deep Dive: Hook execution order, nested describe scope, fixture management patterns
- Real-World: Disorganized test suite that's flaky and hard to maintain
- Trade-offs: Organization strategies (flat, by function, nested describes, mirror structure)
- Explain to Junior: Kitchen recipe analogy, basic pattern, organization principles

**Question 6:** Debugging
- Deep Dive: Node debugger integration, console logging, snapshot debugging
- Real-World: Hunting flaky test that passes locally but fails on CI
- Trade-offs: Debugging strategies (console.log, debugger, test.only, snapshots)
- Explain to Junior: Why tests fail, debugging checklist, investigation techniques

**Question 7:** React Components
- Deep Dive: RTL philosophy, query priority hierarchy, async patterns with waitFor
- Real-World: Test that passes but component breaks for users (unrealistic test)
- Trade-offs: Testing approaches (shallow vs full render vs component vs behavior tests)
- Explain to Junior: Component lifecycle simulation, query selection guide, user-centric testing

**Question 8:** Custom Hooks
- Deep Dive: Why hooks need special testing, renderHook, act(), dependencies with rerender
- Real-World: Complex hook with async, error handling, manual refetch
- Trade-offs: Hook testing strategies (direct, renderHook, component wrapper)
- Explain to Junior: Hooks are different from functions, testing pattern, dependency testing

**Total Lines Added:** 2,000+ lines of ultra-comprehensive depth content across all 8 questions
