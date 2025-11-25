# Object Get by Path (Lodash _.get)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon, Microsoft
**Time:** 20 minutes

---

## Problem Statement

Implement a function to safely access nested object properties using a path string, returning a default value if the path doesn't exist.

### Requirements

- ✅ Support dot notation (`'user.address.city'`)
- ✅ Support bracket notation (`'user[0].name'`)
- ✅ Return default value if path not found
- ✅ Handle null/undefined safely
- ✅ Support mixed notation (`'user.items[0].id'`)

---

## Solution

```javascript
function get(object, path, defaultValue) {
  // Handle null/undefined object
  if (object == null) {
    return defaultValue;
  }

  // Convert path string to array
  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)\]/g, '.$1') // Convert [0] to .0
        .split('.')
        .filter(Boolean);

  // Traverse the object
  let result = object;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }

  return result;
}

// Usage
const obj = {
  user: {
    name: 'John',
    address: {
      city: 'NYC',
      zip: 10001
    },
    hobbies: ['reading', 'coding']
  }
};

get(obj, 'user.address.city');           // 'NYC'
get(obj, 'user.hobbies[0]');             // 'reading'
get(obj, 'user.age', 25);                // 25 (default)
get(obj, 'user.address.country', 'USA'); // 'USA' (default)
```

---

## Alternative Implementation (Regex)

```javascript
function get(object, path, defaultValue) {
  if (object == null) return defaultValue;

  const keys = path.match(/[^.[\]]+/g) || [];

  const result = keys.reduce((acc, key) => {
    return acc?.[key];
  }, object);

  return result === undefined ? defaultValue : result;
}
```

---

## Production-Ready Implementation

```javascript
function get(object, path, defaultValue = undefined) {
  // Input validation
  if (object == null) {
    return defaultValue;
  }

  if (!path) {
    return defaultValue;
  }

  // Normalize path to array
  let keys;
  if (Array.isArray(path)) {
    keys = path;
  } else if (typeof path === 'string') {
    // Handle all bracket/dot notation combinations
    keys = path
      .replace(/\[['"]?(\w+)['"]?\]/g, '.$1') // ['key'] or ["key"] to .key
      .replace(/\[(\d+)\]/g, '.$1')            // [0] to .0
      .split('.')
      .filter(key => key !== '');
  } else {
    return defaultValue;
  }

  // Traverse object safely
  let result = object;
  for (let i = 0; i < keys.length; i++) {
    if (result == null) {
      return defaultValue;
    }
    result = result[keys[i]];
  }

  return result === undefined ? defaultValue : result;
}
```

---

## Test Cases

```javascript
describe('get', () => {
  const testObj = {
    a: {
      b: {
        c: 42
      }
    },
    arr: [{ name: 'first' }, { name: 'second' }],
    mixed: {
      items: [
        { id: 1, data: { value: 'test' } }
      ]
    }
  };

  test('accesses nested properties with dot notation', () => {
    expect(get(testObj, 'a.b.c')).toBe(42);
  });

  test('accesses array elements with bracket notation', () => {
    expect(get(testObj, 'arr[0].name')).toBe('first');
    expect(get(testObj, 'arr[1].name')).toBe('second');
  });

  test('handles mixed notation', () => {
    expect(get(testObj, 'mixed.items[0].data.value')).toBe('test');
  });

  test('returns default value for non-existent path', () => {
    expect(get(testObj, 'a.b.d', 'default')).toBe('default');
    expect(get(testObj, 'nonexistent.path', 100)).toBe(100);
  });

  test('handles null/undefined objects', () => {
    expect(get(null, 'a.b.c', 'default')).toBe('default');
    expect(get(undefined, 'a.b.c', 'default')).toBe('default');
  });

  test('handles undefined in path', () => {
    expect(get(testObj, 'a.b.c.d', 'default')).toBe('default');
  });

  test('accepts array path', () => {
    expect(get(testObj, ['a', 'b', 'c'])).toBe(42);
    expect(get(testObj, ['arr', 0, 'name'])).toBe('first');
  });

  test('returns undefined if no default provided', () => {
    expect(get(testObj, 'nonexistent.path')).toBeUndefined();
  });

  test('handles empty path', () => {
    expect(get(testObj, '', 'default')).toBe('default');
  });
});
```

---

## Real-World Use Cases

### 1. API Response Handling

```javascript
async function getUserCity(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  // Safely access nested API response
  const city = get(data, 'user.profile.address.city', 'Unknown');
  return city;
}
```

### 2. Form Data Processing

```javascript
function processFormData(formData) {
  return {
    name: get(formData, 'personalInfo.name', ''),
    email: get(formData, 'contact.email', ''),
    phone: get(formData, 'contact.phone', ''),
    street: get(formData, 'address.street', ''),
    city: get(formData, 'address.city', ''),
    // Safe access even if structure changes
    preferences: get(formData, 'settings.preferences', {})
  };
}
```

### 3. Configuration Management

```javascript
class Config {
  constructor(config) {
    this.config = config;
  }

  get(path, defaultValue) {
    return get(this.config, path, defaultValue);
  }
}

const config = new Config({
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: {
      max: 3,
      delay: 1000
    }
  }
});

const maxRetries = config.get('api.retries.max', 1);
const rateLimit = config.get('api.rateLimit', 100); // Uses default
```

### 4. Redux Selector

```javascript
function createSelector(path, defaultValue) {
  return (state) => get(state, path, defaultValue);
}

// Selectors
const selectUserName = createSelector('user.profile.name', 'Guest');
const selectCartItems = createSelector('cart.items', []);
const selectTheme = createSelector('settings.ui.theme', 'light');

// Usage in component
const userName = selectUserName(store.getState());
```

---

## Common Mistakes

- ❌ Not handling null/undefined objects
- ❌ Not supporting bracket notation
- ❌ Not handling mixed notation paths
- ❌ Not filtering empty strings from split

✅ Check for null/undefined early
✅ Convert all bracket notations to dots
✅ Handle array paths
✅ Return default for any missing segment

---

## Complexity Analysis

- **Time Complexity:** O(n) - where n is path depth
- **Space Complexity:** O(n) - keys array storage

---

## Related Problems

- `set(object, path, value)` - Set nested value
- `has(object, path)` - Check if path exists
- `unset(object, path)` - Delete nested value

---

[← Back to JavaScript Fundamentals](./README.md)
