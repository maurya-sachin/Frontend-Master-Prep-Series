# Mocking Strategies in Testing

> Mocking functions, modules, timers, APIs, and advanced mocking patterns in Jest and React Testing Library.

---

## Question 1: Mocking Functions with Jest

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Meta, Amazon

### Question
How do you mock functions in Jest?

### Answer

**Jest provides multiple ways to mock functions:**

```javascript
// 1. jest.fn() - Create mock function
const mockFn = jest.fn();
mockFn('test');
expect(mockFn).toHaveBeenCalledWith('test');

// 2. Mock implementation
const mockAdd = jest.fn((a, b) => a + b);
expect(mockAdd(2, 3)).toBe(5);

// 3. Mock return value
const mockGetUser = jest.fn().mockReturnValue({ name: 'John' });
expect(mockGetUser()).toEqual({ name: 'John' });

// 4. Mock resolved promise
const mockFetch = jest.fn().mockResolvedValue({ data: 'success' });
await expect(mockFetch()).resolves.toEqual({ data: 'success' });

// 5. Mock rejected promise
const mockError = jest.fn().mockRejectedValue(new Error('Failed'));
await expect(mockError()).rejects.toThrow('Failed');

// 6. Multiple return values
const mockCounter = jest.fn()
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(3);
expect(mockCounter()).toBe(1);
expect(mockCounter()).toBe(2);
expect(mockCounter()).toBe(3);
expect(mockCounter()).toBe(3);
```

### Resources
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)

---

## Question 2: Mocking Modules

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Meta, Google

### Question
How do you mock entire modules in Jest?

### Answer

**Use jest.mock() to replace module implementations:**

```javascript
// api.js
export const fetchUser = async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
};

// component.test.js
import { fetchUser } from './api';
import { render, screen } from '@testing-library/react';

// Mock entire module
jest.mock('./api');

test('displays user data', async () => {
  // Mock implementation
  fetchUser.mockResolvedValue({ name: 'John', email: 'john@example.com' });

  render(<UserProfile userId={1} />);

  expect(await screen.findByText('John')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});

// Partial module mock
jest.mock('./api', () => ({
  ...jest.requireActual('./api'),
  fetchUser: jest.fn()
}));

// Manual mock (__mocks__/api.js)
export const fetchUser = jest.fn();
```

### Resources
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)

---

## Question 3: Mocking Timers

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Amazon

### Question
How do you test code with setTimeout/setInterval in Jest?

### Answer

**Use jest.useFakeTimers() to control time:**

```javascript
// Mocking timers
test('debounce function', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedFn = debounce(callback, 1000);

  debouncedFn('test1');
  debouncedFn('test2');
  debouncedFn('test3');

  // Fast-forward time
  jest.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith('test3');

  jest.useRealTimers();
});

// Testing setInterval
test('runs every second', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  setInterval(callback, 1000);

  jest.advanceTimersByTime(3000);

  expect(callback).toHaveBeenCalledTimes(3);

  jest.clearAllTimers();
  jest.useRealTimers();
});
```

### Resources
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)

---
