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

**[← Back to Testing README](./README.md)**

**Progress:** 8 of 18+ Jest questions completed ✅
