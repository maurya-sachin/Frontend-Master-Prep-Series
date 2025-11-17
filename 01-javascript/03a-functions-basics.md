# Functions Fundamentals

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 8: What are higher-order functions in JavaScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Apple

### Question
What are higher-order functions? Provide examples of built-in higher-order functions and explain how to create custom ones.

### Answer

A **higher-order function** is a function that either:
1. Takes one or more functions as arguments, OR
2. Returns a function as its result

Higher-order functions are a fundamental concept in functional programming and are widely used in JavaScript.

1. **Why Higher-Order Functions**
   - Code reusability
   - Abstraction
   - Function composition
   - More declarative code

2. **Built-in Higher-Order Functions**
   - Array methods: `map()`, `filter()`, `reduce()`, `forEach()`, `find()`, `some()`, `every()`
   - `setTimeout()`, `setInterval()`
   - Event listeners

3. **Benefits**
   - Separate concerns (what vs how)
   - Easier to test
   - More maintainable
   - Enables functional programming patterns

### Code Example

```javascript
// 1. FUNCTIONS THAT TAKE FUNCTIONS AS ARGUMENTS

// Array.map() - transforms array
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function(num) {
  return num * 2;
});
console.log(doubled); // [2, 4, 6, 8, 10]

// Array.filter() - filters array
const evens = numbers.filter(function(num) {
  return num % 2 === 0;
});
console.log(evens); // [2, 4]

// Array.reduce() - reduces to single value
const sum = numbers.reduce(function(acc, num) {
  return acc + num;
}, 0);
console.log(sum); // 15

// 2. FUNCTIONS THAT RETURN FUNCTIONS

// Function factory
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 3. CUSTOM HIGHER-ORDER FUNCTION

// Custom forEach implementation
function customForEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
}

customForEach([1, 2, 3], function(item, index) {
  console.log(`Index ${index}: ${item}`);
});

// 4. FUNCTION COMPOSITION

function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}

const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;

const addOneThenDouble = compose(multiplyByTwo, addOne);
console.log(addOneThenDouble(5)); // 12 (5 + 1 = 6, 6 * 2 = 12)

// 5. PRACTICAL EXAMPLE - LOGGER WRAPPER

function withLogging(fn) {
  return function(...args) {
    console.log(`Calling with args:`, args);
    const result = fn(...args);
    console.log(`Result:`, result);
    return result;
  };
}

const add = (a, b) => a + b;
const addWithLogging = withLogging(add);

addWithLogging(3, 4);
// Calling with args: [3, 4]
// Result: 7
// Returns: 7

// 6. CURRYING (HIGHER-ORDER PATTERN)

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

const sum3 = (a, b, c) => a + b + c;
const curriedSum = curry(sum3);

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6

// 7. PRACTICAL - RETRY LOGIC

function retry(fn, maxAttempts) {
  return async function(...args) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        console.log(`Attempt ${attempt} failed, retrying...`);
      }
    }
  };
}

const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const fetchWithRetry = retry(fetchData, 3);

// 8. MEMOIZATION (HIGHER-ORDER PATTERN)

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Returning cached result');
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveOperation = (n) => {
  console.log('Computing...');
  return n * n;
};

const memoized = memoize(expensiveOperation);

console.log(memoized(5)); // Computing... 25
console.log(memoized(5)); // Returning cached result 25
```

### Common Mistakes

- ❌ **Mistake:** Not returning value from callback
  ```javascript
  const numbers = [1, 2, 3];
  const doubled = numbers.map(num => {
    num * 2; // Missing return!
  });
  console.log(doubled); // [undefined, undefined, undefined]
  ```

- ❌ **Mistake:** Breaking closure scope
  ```javascript
  function createFunctions() {
    const funcs = [];
    for (var i = 0; i < 3; i++) {
      funcs.push(function() { return i; }); // All reference same i
    }
    return funcs;
  }

  const functions = createFunctions();
  console.log(functions[0]()); // 3 (not 0!)
  ```

- ✅ **Correct:** Use arrow functions and proper closures
  ```javascript
  const numbers = [1, 2, 3];
  const doubled = numbers.map(num => num * 2); // Implicit return
  console.log(doubled); // [2, 4, 6]
  ```

### Follow-up Questions

- "What is the difference between map() and forEach()?"
- "How does reduce() work internally?"
- "What is function currying?"
- "Explain the concept of function composition"
- "How do higher-order functions help with code reusability?"

### Resources

- [MDN: Higher-Order Functions](https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function)
- [JavaScript.info: Function Object](https://javascript.info/function-object)
- [Eloquent JavaScript: Higher-Order Functions](https://eloquentjavascript.net/05_higher_order.html)

---

## Question 9: What is a pure function?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5-7 minutes
**Companies:** Google, Meta, Amazon, Airbnb

### Question
Explain what a pure function is in JavaScript. Why are pure functions important and how do they differ from impure functions?

### Answer

A **pure function** is a function that:
1. Always returns the same output for the same input (deterministic)
2. Has no side effects (doesn't modify external state)

Pure functions are a key concept in functional programming.

1. **Characteristics of Pure Functions**
   - Deterministic (same input = same output)
   - No side effects
   - No external dependencies
   - Easier to test
   - Predictable behavior

2. **Side Effects (What Pure Functions Avoid)**
   - Modifying global variables
   - Modifying input parameters
   - Making HTTP requests
   - Writing to database
   - Logging to console
   - Modifying DOM
   - Getting current time

3. **Benefits of Pure Functions**
   - Easier to test (no mocking needed)
   - Easier to debug
   - Cacheable (memoization)
   - Parallelizable
   - Easier to reason about

### Code Example

```javascript
// 1. PURE FUNCTIONS - Same input = Same output, No side effects

// Pure: Simple calculation
function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // Always 5
console.log(add(2, 3)); // Always 5

// Pure: Array transformation (doesn't modify input)
function double(numbers) {
  return numbers.map(n => n * 2);
}

const nums = [1, 2, 3];
console.log(double(nums)); // [2, 4, 6]
console.log(nums); // [1, 2, 3] (unchanged)

// Pure: String manipulation
function capitalize(str) {
  return str.toUpperCase();
}

// 2. IMPURE FUNCTIONS - Side effects or non-deterministic

// Impure: Modifies external state
let counter = 0;

function incrementCounter() {
  counter++; // Side effect: modifying global variable
  return counter;
}

console.log(incrementCounter()); // 1
console.log(incrementCounter()); // 2 (different output!)

// Impure: Non-deterministic (depends on external state)
function getCurrentTime() {
  return new Date().getTime(); // Different each call
}

// Impure: Modifies input parameter
function addToArray(arr, item) {
  arr.push(item); // Mutates input!
  return arr;
}

// Impure: Console logging
function calculateAndLog(a, b) {
  const result = a + b;
  console.log(result); // Side effect: I/O
  return result;
}

// 3. CONVERTING IMPURE TO PURE

// Impure version
let total = 0;

function addToTotal(value) {
  total += value; // Modifies external state
  return total;
}

// Pure version
function addToValue(currentTotal, value) {
  return currentTotal + value; // Returns new value, doesn't modify
}

let total2 = 0;
total2 = addToValue(total2, 5); // 5
total2 = addToValue(total2, 10); // 15

// 4. PURE ARRAY OPERATIONS

// Pure: map, filter, reduce
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(n => n * 2); // Pure: returns new array
const evens = numbers.filter(n => n % 2 === 0); // Pure
const sum = numbers.reduce((acc, n) => acc + n, 0); // Pure

console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)

// Impure: push, pop, splice (modify original)
const arr = [1, 2, 3];
arr.push(4); // Impure: modifies arr

// 5. PURE OBJECT OPERATIONS

// Impure: mutates object
function updateUserAge(user, age) {
  user.age = age; // Mutates input!
  return user;
}

// Pure: returns new object
function setUserAge(user, age) {
  return { ...user, age }; // New object
}

const user = { name: 'John', age: 25 };
const updated = setUserAge(user, 26);

console.log(user.age); // 25 (unchanged)
console.log(updated.age); // 26

// 6. TESTING PURE VS IMPURE

// Pure function: Easy to test
function calculateDiscount(price, discountPercent) {
  return price * (1 - discountPercent / 100);
}

// Test (no setup needed)
console.assert(calculateDiscount(100, 10) === 90);
console.assert(calculateDiscount(100, 10) === 90); // Always same result

// Impure function: Harder to test
let tax = 0.1;

function calculateTotal(price) {
  return price * (1 + tax); // Depends on external variable
}

// Test (need to control external state)
tax = 0.1;
console.assert(calculateTotal(100) === 110); // Fragile!

// 7. MEMOIZATION WITH PURE FUNCTIONS

function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Only works reliably with pure functions
const fibonacci = memoize(function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

// 8. PURE FUNCTIONS IN REACT

// Pure component (same props = same output)
function UserCard({ name, age }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

// Impure (uses external state)
let theme = 'dark';

function UserCardImpure({ name, age }) {
  return (
    <div className={theme}> {/* Depends on external state */}
      <h2>{name}</h2>
    </div>
  );
}
```

### Common Mistakes

- ❌ **Mistake:** Mutating input parameters
  ```javascript
  function addItem(arr, item) {
    arr.push(item); // Impure: mutates input!
    return arr;
  }
  ```

- ❌ **Mistake:** Depending on external state
  ```javascript
  let multiplier = 2;

  function multiply(n) {
    return n * multiplier; // Impure: depends on external variable
  }
  ```

- ✅ **Correct:** Return new values, don't mutate
  ```javascript
  function addItem(arr, item) {
    return [...arr, item]; // Pure: returns new array
  }

  function multiply(n, multiplier) {
    return n * multiplier; // Pure: all inputs are parameters
  }
  ```

### Follow-up Questions

- "What are side effects in JavaScript?"
- "How do pure functions relate to Redux reducers?"
- "Can async functions be pure?"
- "What is referential transparency?"
- "How do pure functions help with testing?"

### Resources

- [MDN: Pure Functions](https://developer.mozilla.org/en-US/docs/Glossary/Pure_function)
- [JavaScript.info: Function Purity](https://javascript.info/function-basics)
- [Understanding Pure Functions](https://www.freecodecamp.org/news/what-is-a-pure-function-in-javascript-acb887375dfe/)

---

## Question 26: Arrow Functions vs Regular Functions - What's the difference?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Google, Meta, Amazon, Microsoft

### Question
What are the differences between arrow functions and regular functions?

### Answer

**Arrow functions** have different `this` binding, no `arguments`, cannot be constructors, and have concise syntax.

1. **Key Differences**
   - Lexical `this` (doesn't bind own `this`)
   - No `arguments` object
   - Cannot be used as constructors
   - No `prototype` property
   - Cannot be generators

2. **When to Use Arrow**
   - Callbacks and higher-order functions
   - Methods that don't need own `this`
   - Preserving outer `this` context

3. **When NOT to Use Arrow**
   - Object methods that need `this`
   - Event handlers that need `this`
   - Functions needing `arguments`
   - Constructor functions

### Code Example

```javascript
// 1. THIS BINDING
const obj = {
  name: "Alice",

  // Regular function: own 'this'
  regularMethod() {
    console.log(this.name); // "Alice"
  },

  // Arrow function: lexical 'this' (from surrounding scope)
  arrowMethod: () => {
    console.log(this.name); // undefined (this from outer scope)
  }
};

// 2. CALLBACKS
const numbers = [1, 2, 3];

// Regular function
numbers.map(function(n) {
  return n * 2;
});

// Arrow function (concise!)
numbers.map(n => n * 2);

// 3. ARGUMENTS OBJECT
function regularFunc() {
  console.log(arguments); // [1, 2, 3]
}

const arrowFunc = () => {
  console.log(arguments); // ReferenceError!
};

regularFunc(1, 2, 3);

// 4. CONSTRUCTOR
function RegularFunc() {
  this.value = 42;
}

const ArrowFunc = () => {
  this.value = 42;
};

new RegularFunc(); // OK
// new ArrowFunc(); // TypeError!

// 5. PRACTICAL - REACT COMPONENT
class Component {
  state = { count: 0 };

  // ❌ Regular method loses 'this' when passed as callback
  regularIncrement() {
    this.setState({ count: this.state.count + 1 });
  }

  // ✅ Arrow function preserves 'this'
  arrowIncrement = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <button onClick={this.arrowIncrement}>+</button>
    );
  }
}
```

### Resources

- [MDN: Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

---

