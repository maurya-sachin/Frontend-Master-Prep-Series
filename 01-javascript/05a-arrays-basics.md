# Array Methods & Iteration

> **Focus**: JavaScript fundamentals and advanced concepts

---

## Question 29: What are find(), some(), and every() array methods?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Meta, Amazon

### Question
Explain these array methods and their differences.

### Answer

These methods search arrays but return different things.

1. **find()**
   - Returns **first element** that matches
   - Returns `undefined` if not found

2. **some()**
   - Returns **boolean** - true if ANY element matches
   - Short-circuits on first match

3. **every()**
   - Returns **boolean** - true if ALL elements match
   - Short-circuits on first non-match

### Code Example

```javascript
const numbers = [1, 2, 3, 4, 5];

// 1. find() - returns first match
const firstEven = numbers.find(n => n % 2 === 0);
console.log(firstEven); // 2

const notFound = numbers.find(n => n > 10);
console.log(notFound); // undefined

// 2. some() - returns boolean (ANY)
const hasEven = numbers.some(n => n % 2 === 0);
console.log(hasEven); // true

const hasNegative = numbers.some(n => n < 0);
console.log(hasNegative); // false

// 3. every() - returns boolean (ALL)
const allPositive = numbers.every(n => n > 0);
console.log(allPositive); // true

const allEven = numbers.every(n => n % 2 === 0);
console.log(allEven); // false

// 4. PRACTICAL EXAMPLES
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: true },
  { name: "Charlie", age: 30, active: false }
];

// Find first adult
const firstAdult = users.find(u => u.age >= 18);
console.log(firstAdult.name); // "Alice"

// Check if any user is inactive
const hasInactive = users.some(u => !u.active);
console.log(hasInactive); // true

// Check if all users are adults
const allAdults = users.every(u => u.age >= 18);
console.log(allAdults); // false
```

### Resources

- [MDN: Array.prototype.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

---

## Question 1: Essential Array Methods - map, filter, reduce

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Uber, Netflix

### Question
Explain map(), filter(), and reduce(). Provide examples and explain when to use each.

### Answer

These are **higher-order functions** that take a callback and return new values without mutating the original array.

### Code Example

**map() - Transform Each Element:**

```javascript
// Syntax: array.map(callback(element, index, array))
// Returns: New array with transformed elements

const numbers = [1, 2, 3, 4, 5];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// Extract property from objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 }
];

const names = users.map(user => user.name);
console.log(names);  // ["Alice", "Bob", "Charlie"]

// With index
const indexed = numbers.map((num, index) => ({
  value: num,
  index: index
}));
console.log(indexed);
// [{ value: 1, index: 0 }, { value: 2, index: 1 }, ...]

/*
USE CASES:
- Transform data structure
- Extract specific properties
- Convert data types
- Return same length array with modifications
*/
```

**filter() - Select Elements:**

```javascript
// Syntax: array.filter(callback(element, index, array))
// Returns: New array with elements that pass the test

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Get even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens);  // [2, 4, 6, 8, 10]

// Filter objects
const users = [
  { name: "Alice", age: 17, active: true },
  { name: "Bob", age: 25, active: false },
  { name: "Charlie", age: 30, active: true }
];

const adults = users.filter(user => user.age >= 18);
const activeUsers = users.filter(user => user.active);
const activeAdults = users.filter(user => user.age >= 18 && user.active);

console.log(activeAdults);
// [{ name: "Charlie", age: 30, active: true }]

/*
USE CASES:
- Remove unwanted elements
- Search/find matching items
- Validation filtering
- Return subset of original array
*/
```

**reduce() - Reduce to Single Value:**

```javascript
// Syntax: array.reduce(callback(accumulator, current, index, array), initialValue)
// Returns: Single accumulated value

const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 15

// Find maximum
const max = numbers.reduce((acc, num) => Math.max(acc, num), -Infinity);
console.log(max);  // 5

// Count occurrences
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count);  // { apple: 3, banana: 2, orange: 1 }

// Group by property
const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Charlie", role: "admin" }
];

const grouped = users.reduce((acc, user) => {
  const role = user.role;
  if (!acc[role]) acc[role] = [];
  acc[role].push(user);
  return acc;
}, {});

console.log(grouped);
/*
{
  admin: [{ name: "Alice", role: "admin" }, { name: "Charlie", role: "admin" }],
  user: [{ name: "Bob", role: "user" }]
}
*/

// Flatten array
const nested = [[1, 2], [3, 4], [5, 6]];
const flattened = nested.reduce((acc, arr) => acc.concat(arr), []);
console.log(flattened);  // [1, 2, 3, 4, 5, 6]

// Build object from array
const keyValue = [["name", "John"], ["age", 30], ["city", "NYC"]];
const obj = keyValue.reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {});
console.log(obj);  // { name: "John", age: 30, city: "NYC" }

/*
USE CASES:
- Sum, average, min, max calculations
- Counting and grouping
- Flattening nested structures
- Converting arrays to objects
- Implementing other array methods
- Complex transformations
*/
```

**Chaining Methods:**

```javascript
const users = [
  { name: "Alice", age: 25, score: 85 },
  { name: "Bob", age: 17, score: 92 },
  { name: "Charlie", age: 30, score: 78 },
  { name: "David", age: 22, score: 95 }
];

// Get average score of adult users
const avgAdultScore = users
  .filter(user => user.age >= 18)        // Filter adults
  .map(user => user.score)                // Extract scores
  .reduce((sum, score, idx, arr) => {     // Calculate average
    return idx === arr.length - 1
      ? (sum + score) / arr.length
      : sum + score;
  }, 0);

console.log(avgAdultScore);  // 86

// Or cleaner:
const avgScore = users
  .filter(u => u.age >= 18)
  .reduce((sum, u, i, arr) => {
    sum += u.score;
    return i === arr.length - 1 ? sum / arr.length : sum;
  }, 0);
```

**Implementing map/filter with reduce:**

```javascript
// map implementation using reduce
Array.prototype.myMap = function(callback) {
  return this.reduce((acc, item, index, array) => {
    acc.push(callback(item, index, array));
    return acc;
  }, []);
};

// filter implementation using reduce
Array.prototype.myFilter = function(callback) {
  return this.reduce((acc, item, index, array) => {
    if (callback(item, index, array)) {
      acc.push(item);
    }
    return acc;
  }, []);
};

// Test
const nums = [1, 2, 3, 4, 5];
console.log(nums.myMap(x => x * 2));      // [2, 4, 6, 8, 10]
console.log(nums.myFilter(x => x % 2 === 0));  // [2, 4]
```

### Common Mistakes

❌ **Wrong**: Forgetting to return in map
```javascript
const doubled = [1, 2, 3].map(num => {
  num * 2;  // ❌ No return!
});
console.log(doubled);  // [undefined, undefined, undefined]
```

✅ **Correct**: Always return in map
```javascript
const doubled = [1, 2, 3].map(num => num * 2);
// Or with explicit return:
const doubled2 = [1, 2, 3].map(num => {
  return num * 2;
});
```

❌ **Wrong**: Forgetting initial value in reduce
```javascript
const nums = [];
const sum = nums.reduce((acc, num) => acc + num);  // ❌ Error!
// TypeError: Reduce of empty array with no initial value
```

✅ **Correct**: Always provide initial value
```javascript
const sum = nums.reduce((acc, num) => acc + num, 0);  // 0
```

❌ **Wrong**: Mutating in map/filter
```javascript
const users = [{ name: "Alice" }, { name: "Bob" }];

const modified = users.map(user => {
  user.role = "admin";  // ❌ Mutates original!
  return user;
});

console.log(users[0].role);  // "admin" (original mutated!)
```

✅ **Correct**: Return new objects
```javascript
const modified = users.map(user => ({
  ...user,
  role: "admin"
}));

console.log(users[0].role);  // undefined (original unchanged)
```

### Follow-up Questions
1. "How would you implement your own map/filter/reduce?"
2. "What's the time complexity of these methods?"
3. "Can you break out of a reduce early?"
4. "What's the difference between forEach and map?"

### Resources
- [MDN: Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN: Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)

---

