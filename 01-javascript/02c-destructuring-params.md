# Destructuring & Function Parameters

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 18: What is destructuring in JavaScript?

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

## Question 20: What are rest parameters in JavaScript?

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

---

## Question 21: What are default parameters in JavaScript?

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

---

