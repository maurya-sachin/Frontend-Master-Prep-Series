# Implement Curry Function

## Problem Statement

Implement a curry function that transforms a function with multiple arguments into a sequence of functions, each taking a single argument. The function should support partial application and work with any number of parameters.

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 25-35 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple, Airbnb, Uber

---

## Requirements

- [ ] Convert f(a, b, c) to f(a)(b)(c) or f(a, b)(c) or f(a)(b, c)
- [ ] Support partial application (flexible argument counts)
- [ ] Preserve function context (this binding)
- [ ] Handle variable number of arguments
- [ ] Work with functions that have rest parameters
- [ ] Support placeholder arguments (advanced)
- [ ] Handle edge cases (0 arguments, already curried functions)
- [ ] Maintain original function length property

---

## Real-World Use Cases

1. **Function Composition** - Building reusable function pipelines
2. **Event Handlers** - Pre-configuring event callbacks with partial data
3. **Redux Actions** - Creating action creators with bound parameters
4. **Validation Functions** - Building validators with preset configurations
5. **API Requests** - Pre-configuring request handlers with auth tokens
6. **React HOCs** - Creating higher-order components with configuration
7. **Functional Programming** - Point-free style programming

---

## Example Usage

```javascript
// Basic currying
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6

// Partial application
const add5 = curriedAdd(5);
console.log(add5(10)(15)); // 30
console.log(add5(3, 7)); // 15

// With context
const obj = {
  multiplier: 10,
  multiply: curry(function(a, b, c) {
    return (a + b + c) * this.multiplier;
  })
};

console.log(obj.multiply(1)(2)(3)); // 60

// Function composition
const map = curry((fn, arr) => arr.map(fn));
const filter = curry((fn, arr) => arr.filter(fn));
const reduce = curry((fn, init, arr) => arr.reduce(fn, init));

const numbers = [1, 2, 3, 4, 5];

const double = n => n * 2;
const isEven = n => n % 2 === 0;
const sum = (acc, n) => acc + n;

const doubleNumbers = map(double);
const filterEven = filter(isEven);
const sumAll = reduce(sum, 0);

console.log(doubleNumbers(numbers)); // [2, 4, 6, 8, 10]
console.log(filterEven(numbers)); // [2, 4]
console.log(sumAll(numbers)); // 15

// Redux-style action creators
const createAction = curry((type, payload, meta) => ({
  type,
  payload,
  meta
}));

const userAction = createAction('USER_ACTION');
const loginAction = userAction({ userId: 123 });
console.log(loginAction({ timestamp: Date.now() }));
// { type: 'USER_ACTION', payload: { userId: 123 }, meta: { timestamp: ... } }

// Event handlers with pre-configured data
const handleClick = curry((apiEndpoint, userId, event) => {
  event.preventDefault();
  fetch(`${apiEndpoint}/users/${userId}`)
    .then(res => res.json())
    .then(data => console.log(data));
});

const handleUserClick = handleClick('/api/v1');
const handleUser123Click = handleUserClick(123);

// Can now use: handleUser123Click(event)
```

---

## Test Cases

```javascript
describe('curry', () => {
  test('curries a function with 3 arguments', () => {
    const add = (a, b, c) => a + b + c;
    const curriedAdd = curry(add);

    expect(curriedAdd(1)(2)(3)).toBe(6);
    expect(curriedAdd(1, 2)(3)).toBe(6);
    expect(curriedAdd(1)(2, 3)).toBe(6);
    expect(curriedAdd(1, 2, 3)).toBe(6);
  });

  test('supports partial application', () => {
    const multiply = (a, b, c) => a * b * c;
    const curriedMultiply = curry(multiply);

    const multiplyBy2 = curriedMultiply(2);
    const multiplyBy2And3 = multiplyBy2(3);

    expect(multiplyBy2And3(4)).toBe(24);
    expect(multiplyBy2(3, 4)).toBe(24);
  });

  test('preserves this context', () => {
    const obj = {
      value: 10,
      add: curry(function(a, b) {
        return this.value + a + b;
      })
    };

    expect(obj.add(5)(10)).toBe(25);
    expect(obj.add(5, 10)).toBe(25);
  });

  test('works with single argument functions', () => {
    const identity = x => x;
    const curriedIdentity = curry(identity);

    expect(curriedIdentity(5)).toBe(5);
  });

  test('handles functions with no required arguments', () => {
    const greet = () => 'Hello';
    const curriedGreet = curry(greet);

    expect(curriedGreet()).toBe('Hello');
  });

  test('can curry already curried functions', () => {
    const add = (a, b, c) => a + b + c;
    const curriedOnce = curry(add);
    const curriedTwice = curry(curriedOnce);

    expect(curriedTwice(1)(2)(3)).toBe(6);
  });

  test('works with variable length functions', () => {
    function sum(...args) {
      return args.reduce((a, b) => a + b, 0);
    }
    sum.length = 3; // Explicitly set length

    const curriedSum = curry(sum);
    expect(curriedSum(1)(2)(3)).toBe(6);
    expect(curriedSum(1, 2)(3)).toBe(6);
  });

  test('returns new function on each call', () => {
    const add = (a, b, c) => a + b + c;
    const curriedAdd = curry(add);

    const add1 = curriedAdd(1);
    const add1and2 = add1(2);

    expect(add1and2(3)).toBe(6);
    expect(add1(5, 10)).toBe(16); // Original add1 still works
  });
});
```

---

## Solution 1: Basic Curry

```javascript
function curry(fn) {
  return function curried(...args) {
    // If we have enough arguments, call the function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    // Otherwise, return a new function that accepts more arguments
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}
```

**Time Complexity:** O(n) where n is the number of arguments
**Space Complexity:** O(n) for storing accumulated arguments

**Pros:**
- Simple and easy to understand
- Handles basic currying scenarios
- Preserves context with apply

**Cons:**
- No placeholder support
- Limited flexibility
- Doesn't handle edge cases well

---

## Solution 2: Enhanced Curry with Better Partial Application

```javascript
function curry(fn, arity = fn.length) {
  return function curried(...args) {
    // If we have all required arguments
    if (args.length >= arity) {
      return fn.apply(this, args);
    }

    // Return a function that collects more arguments
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// Usage with flexible arity
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSum = curry(sum, 3); // Specify arity

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- Supports explicit arity specification
- Handles rest parameters
- Better partial application support

**Cons:**
- Still no placeholder support
- Cannot un-curry once curried

---

## Solution 3: Production-Ready Curry

```javascript
function curry(fn, arity = fn.length, ...accumulated) {
  // Return a function that collects arguments
  return function curried(...args) {
    // Combine previously accumulated arguments with new ones
    const allArgs = [...accumulated, ...args];

    // If we have enough arguments, invoke the original function
    if (allArgs.length >= arity) {
      return fn.apply(this, allArgs);
    }

    // Otherwise, return a new curried function with accumulated arguments
    return curry(fn, arity, ...allArgs);
  };
}

// Enhanced version with validation
function curryWithValidation(fn, arity) {
  // Input validation
  if (typeof fn !== 'function') {
    throw new TypeError('First argument must be a function');
  }

  // Use provided arity or function length
  const length = arity !== undefined ? arity : fn.length;

  // If no arguments needed, just return the function result
  if (length === 0) {
    return fn;
  }

  return function curried(...args) {
    // Filter out undefined to allow skipping
    const validArgs = args.filter(arg => arg !== undefined);

    // Check if we have enough arguments
    if (validArgs.length >= length) {
      return fn.apply(this, validArgs.slice(0, length));
    }

    // Return new curried function
    return function(...nextArgs) {
      return curried.apply(this, [...validArgs, ...nextArgs]);
    };
  };
}
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- Robust error handling
- Supports explicit arity
- Clean recursive implementation
- Filters invalid arguments

**Cons:**
- More complex
- Still limited placeholder support

---

## Solution 4: Advanced Curry with Placeholders (TypeScript)

```typescript
const _ = Symbol('placeholder');

type Placeholder = typeof _;
type CurriedFunction<Args extends any[], Return> =
  Args extends [infer First, ...infer Rest]
    ? (arg: First | Placeholder) => CurriedFunction<Rest, Return>
    : Return;

function curry<T extends any[], R>(
  fn: (...args: T) => R,
  arity: number = fn.length
): CurriedFunction<T, R> {
  return function curried(...args: any[]): any {
    // Separate placeholders from real arguments
    const filledArgs: any[] = [];
    const placeholderIndices: number[] = [];

    args.forEach((arg, index) => {
      if (arg === _) {
        placeholderIndices.push(index);
      }
      filledArgs.push(arg);
    });

    // Count actual arguments (non-placeholders)
    const actualArgCount = args.filter(arg => arg !== _).length;

    // If we have enough real arguments, call the function
    if (actualArgCount >= arity && placeholderIndices.length === 0) {
      return fn.apply(this, filledArgs.slice(0, arity));
    }

    // Return a new function that fills in placeholders
    return function(...nextArgs: any[]): any {
      const combinedArgs = [...filledArgs];
      let nextArgIndex = 0;

      // Fill in placeholders first
      for (const placeholderIndex of placeholderIndices) {
        if (nextArgIndex < nextArgs.length) {
          combinedArgs[placeholderIndex] = nextArgs[nextArgIndex++];
        }
      }

      // Add remaining arguments
      while (nextArgIndex < nextArgs.length) {
        combinedArgs.push(nextArgs[nextArgIndex++]);
      }

      return curried.apply(this, combinedArgs);
    };
  } as CurriedFunction<T, R>;
}

// Usage with placeholders
const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(_, 2)(1)(3)); // 6
console.log(curriedAdd(1, _, 3)(2)); // 6
console.log(curriedAdd(_, _, 3)(1, 2)); // 6
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- Full placeholder support
- Type-safe with TypeScript
- Maximum flexibility
- Production-ready

**Cons:**
- More complex implementation
- Requires understanding of placeholders

---

## Common Mistakes

### ❌ Mistake 1: Not preserving context

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // Wrong: loses 'this' context
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}
```

### ✅ Correct: Use apply to preserve context

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args); // Preserves 'this'
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}
```

### ❌ Mistake 2: Using arrow functions for curried function

```javascript
// Wrong: Arrow function has no 'this' binding
function curry(fn) {
  return (...args) => {
    if (args.length >= fn.length) {
      return fn.apply(this, args); // 'this' is lexical, not dynamic
    }
    return (...nextArgs) => curry(fn)(...args, ...nextArgs);
  };
}
```

### ✅ Correct: Use regular function expression

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}
```

### ❌ Mistake 3: Not handling arity correctly

```javascript
// Wrong: Doesn't work with rest parameters
function curry(fn) {
  return function curried(...args) {
    // fn.length is 0 for rest parameters!
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSum = curry(sum); // Breaks! fn.length === 0
```

### ✅ Correct: Allow explicit arity parameter

```javascript
function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSum = curry(sum, 3); // Works!
```

### ❌ Mistake 4: Mutating accumulated arguments

```javascript
// Wrong: Mutates the args array
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      args.push(...nextArgs); // Mutation!
      return curried.apply(this, args);
    };
  };
}
```

### ✅ Correct: Create new arrays

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]); // New array
    };
  };
}
```

---

## Edge Cases

1. **Zero argument functions** - Should return result immediately
2. **Functions with rest parameters** - Need explicit arity
3. **Already curried functions** - Should work transparently
4. **Context binding** - Must preserve `this` through curry chain
5. **Too many arguments** - Should only use required number
6. **Undefined arguments** - Should count or skip based on design
7. **Placeholder arguments** - Advanced feature for flexible partial application

---

## Real-World Applications

### 1. Redux Action Creators

```javascript
// Without curry
const createAction = (type, payload, meta) => ({ type, payload, meta });

// With curry
const curriedCreateAction = curry(createAction);

// Create specialized action creators
const userAction = curriedCreateAction('USER_ACTION');
const loginAction = userAction({ userId: 123 });
const completeLoginAction = loginAction({ timestamp: Date.now() });

// Usage in Redux
dispatch(completeLoginAction);
```

### 2. React Event Handlers

```javascript
// Without curry - verbose event handlers
const handleDelete = (id, event) => {
  event.preventDefault();
  deleteItem(id);
};

// JSX
<button onClick={(e) => handleDelete(item.id, e)}>Delete</button>

// With curry - cleaner
const handleDelete = curry((id, event) => {
  event.preventDefault();
  deleteItem(id);
});

// JSX
<button onClick={handleDelete(item.id)}>Delete</button>
```

### 3. Function Composition Pipeline

```javascript
const map = curry((fn, arr) => arr.map(fn));
const filter = curry((fn, arr) => arr.filter(fn));
const reduce = curry((fn, init, arr) => arr.reduce(fn, init));

// Compose a data processing pipeline
const processNumbers = (numbers) => {
  const double = n => n * 2;
  const isEven = n => n % 2 === 0;
  const sum = (acc, n) => acc + n;

  return reduce(sum, 0)(
    filter(isEven)(
      map(double)(numbers)
    )
  );
};

console.log(processNumbers([1, 2, 3, 4, 5])); // 12
```

### 4. API Request Builder

```javascript
const makeRequest = curry((method, baseUrl, endpoint, params) => {
  return fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
});

// Pre-configure API client
const apiClient = makeRequest('POST', 'https://api.example.com');

// Create endpoint-specific functions
const createUser = apiClient('/users');
const createPost = apiClient('/posts');

// Use in application
await createUser({ name: 'John', email: 'john@example.com' });
await createPost({ title: 'Hello', content: 'World' });
```

---

## Follow-up Questions

1. **"What's the difference between curry and partial application?"**
   - **Curry:** Transforms f(a, b, c) → f(a)(b)(c) - always one argument at a time
   - **Partial:** Pre-fills some arguments but accepts multiple: f(a, b, c) → f(a)(b, c)
   - Curry is automatic, partial is manual

2. **"How would you implement a curry function that supports placeholders?"**
   - Use a special symbol (like lodash's `_`) to mark placeholder positions
   - Track placeholder indices and fill them when arguments arrive
   - More complex but allows flexible argument ordering

3. **"Can currying cause memory leaks?"**
   - Yes! Each curried function creates a closure over previous arguments
   - Long curry chains hold references to all accumulated arguments
   - Mitigation: Use curry only when needed, clear references when done

4. **"How does curry affect performance?"**
   - Creates additional function calls (overhead)
   - More closures mean more memory usage
   - Trade-off: Developer ergonomics vs. performance
   - Only significant in very hot code paths

5. **"When should you use curry vs regular functions?"**
   - **Use curry when:**
     - Building function composition pipelines
     - Creating reusable partial applications
     - Working in functional programming style
   - **Avoid curry when:**
     - Performance is critical
     - Function signatures are unstable
     - Team unfamiliar with FP concepts

6. **"How would you implement auto-curry (curry that detects when to execute)?"**
   - Check if curried function is called with no arguments
   - Execute original function when empty call detected
   - Useful for optional chaining: `add(1)(2)()` executes

---

## Practical Example: Form Validation Pipeline

```javascript
// Build a curried validation system
const validate = curry((validatorFn, errorMessage, value) => {
  return validatorFn(value) ? { valid: true, value } : { valid: false, error: errorMessage };
});

// Create specific validators
const required = validate(val => val != null && val !== '', 'Field is required');
const minLength = curry((min, val) => val && val.length >= min);
const validateMinLength = (min) => validate(minLength(min), `Minimum ${min} characters required`);
const email = validate(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email');

// Use in form
const validateEmail = (value) => {
  const result = required(value);
  if (!result.valid) return result;
  return email(value);
};

const validatePassword = (value) => {
  const result = required(value);
  if (!result.valid) return result;
  return validateMinLength(8)(value);
};

// Usage
console.log(validateEmail('test@example.com')); // { valid: true, value: 'test@example.com' }
console.log(validatePassword('short')); // { valid: false, error: 'Minimum 8 characters required' }
```

---

## Resources

- [MDN: Function.prototype.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
- [Lodash: curry](https://lodash.com/docs/4.17.15#curry)
- [Functional-Light JavaScript: Curry](https://github.com/getify/Functional-Light-JS/blob/master/manuscript/ch3.md#currying)
- [JavaScript Allongé: Currying](https://leanpub.com/javascriptallongesix/read#currying)
- [Why Curry Helps](https://hughfdjackson.com/javascript/why-curry-helps/)

---

[← Back to JavaScript Fundamentals](./README.md) | [Next: Bind Polyfill →](./bind-polyfill.md)
