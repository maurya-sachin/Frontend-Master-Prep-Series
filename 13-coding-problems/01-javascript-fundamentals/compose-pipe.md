# Compose and Pipe Functions

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Airbnb
**Time:** 20 minutes

---

## Problem Statement

Implement `compose` (right-to-left) and `pipe` (left-to-right) functions that combine multiple functions into a single function.

### Requirements

- ✅ Execute functions in correct order
- ✅ Pass result of one function to next
- ✅ Handle any number of functions
- ✅ Support async functions (bonus)
- ✅ Type-safe implementation

---

## Solution

### Compose (Right-to-Left)

```javascript
function compose(...fns) {
  return function(initialValue) {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

// Usage
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composed = compose(square, double, addOne);
console.log(composed(3)); // square(double(addOne(3))) = square(double(4)) = square(8) = 64
```

### Pipe (Left-to-Right)

```javascript
function pipe(...fns) {
  return function(initialValue) {
    return fns.reduce((acc, fn) => fn(acc), initialValue);
  };
}

// Usage
const piped = pipe(addOne, double, square);
console.log(piped(3)); // square(double(addOne(3))) = square(double(4)) = square(8) = 64
```

---

## Advanced Implementation

### With Multiple Arguments

```javascript
function compose(...fns) {
  if (fns.length === 0) {
    return arg => arg;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return fns.reduce((acc, fn) => {
    return (...args) => acc(fn(...args));
  });
}

function pipe(...fns) {
  if (fns.length === 0) {
    return arg => arg;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return fns.reduce((acc, fn) => {
    return (...args) => fn(acc(...args));
  });
}
```

### Async Compose/Pipe

```javascript
function composeAsync(...fns) {
  return async function(initialValue) {
    let result = initialValue;
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i](result);
    }
    return result;
  };
}

function pipeAsync(...fns) {
  return async function(initialValue) {
    let result = initialValue;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

// Usage
const fetchUser = async id => ({ id, name: 'John' });
const addMetadata = async user => ({ ...user, timestamp: Date.now() });
const saveToDb = async user => { /* save */ return user; };

const processUser = pipeAsync(fetchUser, addMetadata, saveToDb);
await processUser(123);
```

---

## TypeScript Implementation

```typescript
type Func<T = any> = (arg: T) => T;

function compose<T>(...fns: Func<T>[]): Func<T> {
  return (initialValue: T): T => {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

function pipe<T>(...fns: Func<T>[]): Func<T> {
  return (initialValue: T): T => {
    return fns.reduce((acc, fn) => fn(acc), initialValue);
  };
}

// Advanced: With type inference
type UnaryFunction<T, R> = (arg: T) => R;

function compose<A, B>(f1: UnaryFunction<A, B>): UnaryFunction<A, B>;
function compose<A, B, C>(
  f2: UnaryFunction<B, C>,
  f1: UnaryFunction<A, B>
): UnaryFunction<A, C>;
function compose<A, B, C, D>(
  f3: UnaryFunction<C, D>,
  f2: UnaryFunction<B, C>,
  f1: UnaryFunction<A, B>
): UnaryFunction<A, D>;
function compose(...fns: UnaryFunction<any, any>[]): UnaryFunction<any, any> {
  return (initialValue: any): any => {
    return fns.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}
```

---

## Test Cases

```javascript
describe('compose', () => {
  test('composes functions right-to-left', () => {
    const addOne = x => x + 1;
    const double = x => x * 2;

    const composed = compose(double, addOne);
    expect(composed(3)).toBe(8); // double(addOne(3)) = double(4) = 8
  });

  test('works with multiple functions', () => {
    const add = x => x + 2;
    const multiply = x => x * 3;
    const subtract = x => x - 1;

    const composed = compose(subtract, multiply, add);
    expect(composed(5)).toBe(20); // subtract(multiply(add(5))) = subtract(multiply(7)) = subtract(21) = 20
  });

  test('handles single function', () => {
    const double = x => x * 2;
    const composed = compose(double);
    expect(composed(5)).toBe(10);
  });

  test('handles no functions', () => {
    const composed = compose();
    expect(composed(5)).toBe(5);
  });

  test('works with objects', () => {
    const addField = obj => ({ ...obj, added: true });
    const incrementId = obj => ({ ...obj, id: obj.id + 1 });

    const composed = compose(incrementId, addField);
    expect(composed({ id: 1 })).toEqual({ id: 2, added: true });
  });
});

describe('pipe', () => {
  test('pipes functions left-to-right', () => {
    const addOne = x => x + 1;
    const double = x => x * 2;

    const piped = pipe(addOne, double);
    expect(piped(3)).toBe(8); // double(addOne(3)) = double(4) = 8
  });

  test('order is opposite of compose', () => {
    const add = x => x + 2;
    const multiply = x => x * 3;

    const composed = compose(multiply, add);
    const piped = pipe(add, multiply);

    expect(composed(5)).toBe(piped(5));
  });
});
```

---

## Real-World Use Cases

### 1. Data Transformation Pipeline

```javascript
const processUserData = pipe(
  validateUser,
  normalizeFields,
  addTimestamps,
  encryptSensitiveData,
  saveToDatabase
);

processUserData(rawUserInput);
```

### 2. Redux Middleware

```javascript
const applyMiddleware = (...middlewares) => {
  return createStore => (...args) => {
    const store = createStore(...args);
    let dispatch = () => {};

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
};
```

### 3. Express-like Middleware

```javascript
function createMiddlewareChain(middlewares) {
  return pipe(...middlewares);
}

const authMiddleware = (req) => {
  if (!req.headers.authorization) throw new Error('Unauthorized');
  return { ...req, user: { id: 1 } };
};

const loggingMiddleware = (req) => {
  console.log(`${req.method} ${req.url}`);
  return req;
};

const middleware = createMiddlewareChain([loggingMiddleware, authMiddleware]);
```

### 4. Form Validation

```javascript
const validateForm = compose(
  checkPasswordStrength,
  validateEmailFormat,
  checkRequiredFields,
  sanitizeInputs
);

const validationResult = validateForm(formData);
```

### 5. String Processing

```javascript
const processText = pipe(
  trim,
  lowercase,
  removeSpecialChars,
  capitalizeWords,
  addPunctuation
);

const processedText = processText(userInput);
```

---

## Common Mistakes

- ❌ Confusing compose vs pipe order
- ❌ Not handling edge cases (0 or 1 function)
- ❌ Not supporting multiple arguments for first function
- ❌ Forgetting to handle async functions

✅ Remember: compose is right-to-left, pipe is left-to-right
✅ Handle empty and single-function cases
✅ Allow first function to accept multiple args
✅ Provide async versions when needed

---

## Complexity Analysis

- **Time Complexity:** O(n) - where n is number of functions
- **Space Complexity:** O(1) - no additional space for result

---

## Interview Follow-ups

1. **What's the difference between compose and pipe?**
   - Order of execution: compose is right-to-left, pipe is left-to-right

2. **How would you handle async functions?**
   - Use async/await and iterate instead of reduce

3. **Can you make it type-safe in TypeScript?**
   - Yes, with function overloads

4. **How is this used in Redux?**
   - Redux's compose is used to apply middleware

5. **What are the benefits of function composition?**
   - Reusability, testability, readability, separation of concerns

---

[← Back to JavaScript Fundamentals](./README.md)
