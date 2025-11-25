# Group Array of Objects by Property

## Problem Statement

Implement a function to group an array of objects by a specified property or custom key function. Similar to SQL's GROUP BY or Lodash's `groupBy`.

**Difficulty:** 🟢 Easy to 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time to Solve:** 15-25 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Stripe, Uber

---

## Requirements

- [ ] Group array of objects by property name
- [ ] Support nested property paths (e.g., "user.name")
- [ ] Support custom key function
- [ ] Handle missing/undefined properties
- [ ] Handle multiple grouping keys
- [ ] Don't modify the original array
- [ ] Return object with grouped arrays

---

## Real-World Use Cases

1. **Data Aggregation** - Group sales data by region/month
2. **User Management** - Group users by role, status, or department
3. **Analytics Dashboards** - Group events by category/date
4. **E-commerce** - Group products by category, brand, or price range
5. **Task Management** - Group tasks by status, priority, or assignee
6. **Report Generation** - Group records for summary reports

---

## Example Usage

```javascript
// Basic grouping by property
const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' },
  { name: 'Bob', role: 'admin' },
  { name: 'Alice', role: 'user' }
];

groupBy(users, 'role');
/*
{
  admin: [
    { name: 'John', role: 'admin' },
    { name: 'Bob', role: 'admin' }
  ],
  user: [
    { name: 'Jane', role: 'user' },
    { name: 'Alice', role: 'user' }
  ]
}
*/

// Grouping with custom function
const products = [
  { name: 'Phone', price: 999 },
  { name: 'Laptop', price: 1500 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
];

groupBy(products, (item) => {
  if (item.price < 100) return 'cheap';
  if (item.price < 1000) return 'medium';
  return 'expensive';
});
/*
{
  cheap: [
    { name: 'Mouse', price: 25 },
    { name: 'Keyboard', price: 75 }
  ],
  medium: [],
  expensive: [
    { name: 'Phone', price: 999 },
    { name: 'Laptop', price: 1500 }
  ]
}
*/

// Nested property path
const orders = [
  { id: 1, customer: { country: 'USA' } },
  { id: 2, customer: { country: 'Canada' } },
  { id: 3, customer: { country: 'USA' } }
];

groupBy(orders, 'customer.country');
/*
{
  USA: [
    { id: 1, customer: { country: 'USA' } },
    { id: 3, customer: { country: 'USA' } }
  ],
  Canada: [
    { id: 2, customer: { country: 'Canada' } }
  ]
}
*/

// Multiple grouping keys
groupBy(users, (user) => `${user.role}-${user.status}`);
```

---

## Test Cases

```javascript
describe('groupBy', () => {
  test('groups by simple property', () => {
    const arr = [
      { id: 1, category: 'A' },
      { id: 2, category: 'B' },
      { id: 3, category: 'A' }
    ];

    expect(groupBy(arr, 'category')).toEqual({
      A: [{ id: 1, category: 'A' }, { id: 3, category: 'A' }],
      B: [{ id: 2, category: 'B' }]
    });
  });

  test('groups by function', () => {
    const arr = [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 },
      { name: 'Bob', age: 25 }
    ];

    expect(groupBy(arr, (item) => item.age)).toEqual({
      25: [{ name: 'John', age: 25 }, { name: 'Bob', age: 25 }],
      30: [{ name: 'Jane', age: 30 }]
    });
  });

  test('groups by nested property', () => {
    const arr = [
      { id: 1, user: { role: 'admin' } },
      { id: 2, user: { role: 'user' } },
      { id: 3, user: { role: 'admin' } }
    ];

    expect(groupBy(arr, 'user.role')).toEqual({
      admin: [
        { id: 1, user: { role: 'admin' } },
        { id: 3, user: { role: 'admin' } }
      ],
      user: [{ id: 2, user: { role: 'user' } }]
    });
  });

  test('handles missing properties', () => {
    const arr = [
      { id: 1, category: 'A' },
      { id: 2 }, // No category
      { id: 3, category: 'A' }
    ];

    expect(groupBy(arr, 'category')).toEqual({
      A: [{ id: 1, category: 'A' }, { id: 3, category: 'A' }],
      undefined: [{ id: 2 }]
    });
  });

  test('handles empty array', () => {
    expect(groupBy([], 'category')).toEqual({});
  });

  test('handles single item', () => {
    const arr = [{ id: 1, type: 'A' }];
    expect(groupBy(arr, 'type')).toEqual({
      A: [{ id: 1, type: 'A' }]
    });
  });

  test('does not modify original array', () => {
    const arr = [{ id: 1, type: 'A' }];
    const arrCopy = JSON.parse(JSON.stringify(arr));
    groupBy(arr, 'type');
    expect(arr).toEqual(arrCopy);
  });

  test('handles numeric keys', () => {
    const arr = [
      { value: 1 },
      { value: 2 },
      { value: 1 }
    ];

    expect(groupBy(arr, 'value')).toEqual({
      1: [{ value: 1 }, { value: 1 }],
      2: [{ value: 2 }]
    });
  });

  test('handles boolean keys', () => {
    const arr = [
      { active: true },
      { active: false },
      { active: true }
    ];

    expect(groupBy(arr, 'active')).toEqual({
      true: [{ active: true }, { active: true }],
      false: [{ active: false }]
    });
  });
});
```

---

## Solution 1: Basic Implementation (String Key Only)

```javascript
function groupBy(array, key) {
  return array.reduce((result, item) => {
    // Get the grouping key value
    const groupKey = item[key];

    // Initialize array if this is first item in group
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    // Add item to group
    result[groupKey].push(item);

    return result;
  }, {});
}
```

**Time Complexity:** O(n) where n is array length
**Space Complexity:** O(n) for result object

**Pros:**
- Simple and concise
- Good performance
- Easy to understand

**Cons:**
- Only works with simple property names
- No nested path support
- No function support

---

## Solution 2: With Function Support

```javascript
function groupBy(array, keyOrFn) {
  return array.reduce((result, item) => {
    // Get key from function or property
    const groupKey = typeof keyOrFn === 'function'
      ? keyOrFn(item)
      : item[keyOrFn];

    // Initialize group if needed
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);

    return result;
  }, {});
}

// Usage
groupBy(users, 'role'); // Property name
groupBy(users, (user) => user.age > 18 ? 'adult' : 'minor'); // Function
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- Supports both string keys and functions
- Flexible for custom logic
- Still simple

**Cons:**
- No nested path support yet

---

## Solution 3: With Nested Property Support

```javascript
function groupBy(array, keyOrFn) {
  // Helper to get nested property value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((value, key) => {
      return value?.[key];
    }, obj);
  };

  return array.reduce((result, item) => {
    // Determine grouping key
    let groupKey;

    if (typeof keyOrFn === 'function') {
      groupKey = keyOrFn(item);
    } else if (typeof keyOrFn === 'string') {
      // Support nested paths like "user.address.city"
      groupKey = keyOrFn.includes('.')
        ? getNestedValue(item, keyOrFn)
        : item[keyOrFn];
    } else {
      throw new TypeError('Key must be a string or function');
    }

    // Initialize group
    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);

    return result;
  }, {});
}

// Usage
groupBy(orders, 'customer.country'); // Nested path
groupBy(orders, 'status'); // Simple property
groupBy(orders, (order) => order.total > 100 ? 'high' : 'low'); // Function
```

**Time Complexity:** O(n × d) where d is depth of nested path
**Space Complexity:** O(n)

**Pros:**
- Supports nested property paths
- Supports custom functions
- Flexible and powerful

**Cons:**
- Slightly more complex

---

## Solution 4: Production-Ready (Complete)

```javascript
function groupBy(array, keyOrFn, options = {}) {
  const {
    defaultKey = 'undefined',
    preserveOrder = false,
    caseSensitive = true
  } = options;

  // Input validation
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }

  if (typeof keyOrFn !== 'string' && typeof keyOrFn !== 'function') {
    throw new TypeError('Second argument must be a string or function');
  }

  // Helper: Get nested property value
  const getNestedValue = (obj, path) => {
    if (typeof obj !== 'object' || obj === null) {
      return undefined;
    }

    return path.split('.').reduce((value, key) => {
      return value?.[key];
    }, obj);
  };

  // Helper: Get grouping key
  const getGroupKey = (item) => {
    let key;

    if (typeof keyOrFn === 'function') {
      key = keyOrFn(item);
    } else {
      key = keyOrFn.includes('.')
        ? getNestedValue(item, keyOrFn)
        : item[keyOrFn];
    }

    // Handle undefined/null keys
    if (key === undefined || key === null) {
      return defaultKey;
    }

    // Handle case sensitivity for strings
    if (typeof key === 'string' && !caseSensitive) {
      return key.toLowerCase();
    }

    return String(key);
  };

  const result = {};
  const order = []; // Track order of first appearance

  for (const item of array) {
    const groupKey = getGroupKey(item);

    if (!result[groupKey]) {
      result[groupKey] = [];
      if (preserveOrder) {
        order.push(groupKey);
      }
    }

    result[groupKey].push(item);
  }

  // Return ordered object if preserveOrder is true
  if (preserveOrder) {
    return order.reduce((ordered, key) => {
      ordered[key] = result[key];
      return ordered;
    }, {});
  }

  return result;
}

// Usage with options
groupBy(users, 'role', {
  defaultKey: 'unknown',
  preserveOrder: true,
  caseSensitive: false
});
```

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Pros:**
- ✅ Input validation
- ✅ Nested property support
- ✅ Function support
- ✅ Handle undefined/null
- ✅ Case-insensitive option
- ✅ Preserve insertion order
- ✅ Production-ready

**Cons:**
- More complex API
- Larger code size

---

## Solution 5: Using Map (ES6)

```javascript
function groupBy(array, keyOrFn) {
  const result = new Map();

  for (const item of array) {
    const key = typeof keyOrFn === 'function'
      ? keyOrFn(item)
      : item[keyOrFn];

    if (!result.has(key)) {
      result.set(key, []);
    }

    result.get(key).push(item);
  }

  // Convert Map to Object
  return Object.fromEntries(result);
}

// Or return Map directly
function groupByMap(array, keyOrFn) {
  const result = new Map();

  for (const item of array) {
    const key = typeof keyOrFn === 'function'
      ? keyOrFn(item)
      : item[keyOrFn];

    if (!result.has(key)) {
      result.set(key, []);
    }

    result.get(key).push(item);
  }

  return result; // Returns Map
}
```

**Pros:**
- Preserves insertion order
- Can use any type as key (objects, symbols, etc.)
- Cleaner key checks with Map.has()

**Cons:**
- Returns Map instead of plain object (may need conversion)

---

## Modern Alternative: Object.groupBy() (ES2024)

```javascript
// Native JavaScript (ES2024 / ES15)
// Browser support: Chrome 117+, Firefox 119+, Safari 17.4+

const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' }
];

// Using Object.groupBy
const grouped = Object.groupBy(users, (user) => user.role);
// { admin: [...], user: [...] }

// Using Map.groupBy (returns Map)
const groupedMap = Map.groupBy(users, (user) => user.role);

// Polyfill if needed
if (!Object.groupBy) {
  Object.groupBy = function(array, keyFn) {
    return array.reduce((result, item) => {
      const key = keyFn(item);
      (result[key] = result[key] || []).push(item);
      return result;
    }, {});
  };
}
```

---

## Common Mistakes

### ❌ Mistake 1: Not initializing group array

```javascript
// Wrong - will throw error
function groupBy(array, key) {
  return array.reduce((result, item) => {
    result[item[key]].push(item); // Error if group doesn't exist!
    return result;
  }, {});
}
```

### ✅ Correct: Initialize before push

```javascript
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}
```

### ❌ Mistake 2: Mutating original array items

```javascript
// Wrong - modifies original items
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    delete item[key]; // Mutates original!
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {});
}
```

### ❌ Mistake 3: Not handling undefined keys

```javascript
// Wrong - undefined becomes "undefined" string
function groupBy(array, key) {
  return array.reduce((result, item) => {
    result[item[key]] = result[item[key]] || [];
    result[item[key]].push(item);
    return result;
  }, {});
}

const arr = [{ id: 1 }, { id: 2, type: 'A' }];
groupBy(arr, 'type');
// { undefined: [{ id: 1 }], A: [{ id: 2, type: 'A' }] }
// Key is string "undefined", not actual undefined
```

---

## Practical Example: Sales Data Aggregation

```javascript
const salesData = [
  { id: 1, product: 'Phone', category: 'Electronics', region: 'North', amount: 999 },
  { id: 2, product: 'Laptop', category: 'Electronics', region: 'South', amount: 1500 },
  { id: 3, product: 'Desk', category: 'Furniture', region: 'North', amount: 300 },
  { id: 4, product: 'Chair', category: 'Furniture', region: 'South', amount: 150 },
  { id: 5, product: 'Monitor', category: 'Electronics', region: 'North', amount: 400 }
];

// Group by category
const byCategory = groupBy(salesData, 'category');
console.log(byCategory);
/*
{
  Electronics: [
    { id: 1, product: 'Phone', ... },
    { id: 2, product: 'Laptop', ... },
    { id: 5, product: 'Monitor', ... }
  ],
  Furniture: [
    { id: 3, product: 'Desk', ... },
    { id: 4, product: 'Chair', ... }
  ]
}
*/

// Group by region
const byRegion = groupBy(salesData, 'region');

// Group by amount range (custom function)
const byPriceRange = groupBy(salesData, (item) => {
  if (item.amount < 500) return '0-499';
  if (item.amount < 1000) return '500-999';
  return '1000+';
});

// Calculate totals per group
const categoryTotals = Object.entries(byCategory).map(([category, items]) => ({
  category,
  total: items.reduce((sum, item) => sum + item.amount, 0),
  count: items.length
}));

console.log(categoryTotals);
/*
[
  { category: 'Electronics', total: 2899, count: 3 },
  { category: 'Furniture', total: 450, count: 2 }
]
*/
```

---

## Practical Example: User Activity Grouping

```javascript
const activities = [
  { userId: 1, action: 'login', timestamp: '2024-01-01T10:00:00Z' },
  { userId: 2, action: 'purchase', timestamp: '2024-01-01T11:00:00Z' },
  { userId: 1, action: 'view', timestamp: '2024-01-01T12:00:00Z' },
  { userId: 1, action: 'purchase', timestamp: '2024-01-02T09:00:00Z' },
  { userId: 3, action: 'login', timestamp: '2024-01-02T10:00:00Z' }
];

// Group by user
const byUser = groupBy(activities, 'userId');

// Group by action
const byAction = groupBy(activities, 'action');

// Group by date (custom function)
const byDate = groupBy(activities, (activity) => {
  return activity.timestamp.split('T')[0]; // Extract date part
});

console.log(byDate);
/*
{
  '2024-01-01': [login, purchase, view],
  '2024-01-02': [purchase, login]
}
*/

// Multi-level grouping
const byUserAndAction = Object.entries(byUser).reduce((result, [userId, activities]) => {
  result[userId] = groupBy(activities, 'action');
  return result;
}, {});

console.log(byUserAndAction);
/*
{
  '1': {
    login: [{ userId: 1, action: 'login', ... }],
    view: [{ userId: 1, action: 'view', ... }],
    purchase: [{ userId: 1, action: 'purchase', ... }]
  },
  '2': { ... },
  '3': { ... }
}
*/
```

---

## Performance Comparison

```javascript
const largeArray = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  category: ['A', 'B', 'C'][i % 3]
}));

console.time('reduce');
groupBy(largeArray, 'category');
console.timeEnd('reduce'); // ~10ms

console.time('for loop');
groupByForLoop(largeArray, 'category');
console.timeEnd('for loop'); // ~8ms (slightly faster)

console.time('native Object.groupBy');
Object.groupBy(largeArray, (item) => item.category);
console.timeEnd('native Object.groupBy'); // ~5ms (fastest)
```

---

## Follow-up Questions

1. **"How would you group by multiple keys?"**
   - Combine keys into composite key: `${item.a}-${item.b}`
   - Or nest groupBy calls for hierarchical grouping
   - Or create multi-dimensional object

2. **"What if you need to count items per group?"**
```javascript
function countBy(array, keyOrFn) {
  const grouped = groupBy(array, keyOrFn);
  return Object.entries(grouped).reduce((counts, [key, items]) => {
    counts[key] = items.length;
    return counts;
  }, {});
}
```

3. **"How to handle large datasets efficiently?"**
   - Use for loop instead of reduce (slightly faster)
   - Consider streaming/chunking for huge datasets
   - Use Map if you need non-string keys

4. **"Can you group by multiple properties at once?"**
```javascript
function groupByMultiple(array, keys) {
  return array.reduce((result, item) => {
    const compositeKey = keys.map(k => item[k]).join('-');
    (result[compositeKey] = result[compositeKey] || []).push(item);
    return result;
  }, {});
}
```

5. **"What's the difference from SQL GROUP BY?"**
   - SQL GROUP BY typically aggregates (SUM, COUNT, etc.)
   - JavaScript groupBy just groups items
   - Need additional step for aggregation

---

## Resources

- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [Lodash groupBy](https://lodash.com/docs/4.17.15#groupBy)
- [TC39 Proposal: Array Grouping](https://github.com/tc39/proposal-array-grouping)

---

[← Back: Object Deep Merge](./object-deep-merge.md) | [JavaScript Fundamentals](./README.md) | [Next Problem →](./README.md)
