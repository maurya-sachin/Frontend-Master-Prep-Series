# Object Set by Path (Lodash _.set)

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Companies:** Google, Meta, Amazon
**Time:** 25 minutes

---

## Problem Statement

Implement a function to set a value at a nested object path, creating missing intermediate objects/arrays as needed.

### Requirements

- ✅ Support dot notation (`'user.address.city'`)
- ✅ Support bracket notation (`'user[0].name'`)
- ✅ Create missing intermediate paths
- ✅ Handle arrays (create if number, object if string)
- ✅ Return the object
- ✅ Mutate the original object

---

## Solution

```javascript
function set(object, path, value) {
  if (object == null) {
    return object;
  }

  // Parse path into keys array
  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);

  // Traverse and create missing paths
  let current = object;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // If path doesn't exist, create it
    if (current[key] == null) {
      // Create array if next key is number, object otherwise
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }

    current = current[key];
  }

  // Set the final value
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;

  return object;
}

// Usage
const obj = {};

set(obj, 'user.name', 'John');
console.log(obj);
// { user: { name: 'John' } }

set(obj, 'user.hobbies[0]', 'reading');
console.log(obj);
// { user: { name: 'John', hobbies: ['reading'] } }

set(obj, 'user.address.city', 'NYC');
console.log(obj);
// { user: { name: 'John', hobbies: ['reading'], address: { city: 'NYC' } } }
```

---

## Production Implementation

```javascript
function set(object, path, value) {
  // Handle edge cases
  if (object == null) {
    return object;
  }

  if (!path) {
    return object;
  }

  // Clone if immutability needed
  // const result = Array.isArray(object) ? [...object] : { ...object };

  // Normalize path to array
  let keys;
  if (Array.isArray(path)) {
    keys = path;
  } else if (typeof path === 'string') {
    keys = path
      .replace(/\[['"]?(\w+)['"]?\]/g, '.$1')
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(key => key !== '');
  } else {
    return object;
  }

  // Nothing to set
  if (keys.length === 0) {
    return object;
  }

  // Traverse object, creating missing paths
  let current = object;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // Check if current key exists and is an object
    if (current[key] == null || typeof current[key] !== 'object') {
      // Determine if next level should be array or object
      const isNextArray = /^\d+$/.test(nextKey);
      current[key] = isNextArray ? [] : {};
    }

    current = current[key];
  }

  // Set final value
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;

  return object;
}

// Immutable version
function setImmutable(object, path, value) {
  if (object == null) {
    return object;
  }

  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

  const result = Array.isArray(object) ? [...object] : { ...object };

  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (current[key] == null) {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    } else {
      // Clone intermediate objects/arrays
      current[key] = Array.isArray(current[key])
        ? [...current[key]]
        : { ...current[key] };
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}
```

---

## Test Cases

```javascript
describe('set', () => {
  test('sets simple property', () => {
    const obj = {};
    set(obj, 'name', 'John');
    expect(obj).toEqual({ name: 'John' });
  });

  test('sets nested property', () => {
    const obj = {};
    set(obj, 'user.name', 'John');
    expect(obj).toEqual({ user: { name: 'John' } });
  });

  test('sets deeply nested property', () => {
    const obj = {};
    set(obj, 'a.b.c.d', 42);
    expect(obj).toEqual({ a: { b: { c: { d: 42 } } } });
  });

  test('sets array element', () => {
    const obj = {};
    set(obj, 'arr[0]', 'first');
    expect(obj).toEqual({ arr: ['first'] });
  });

  test('sets nested array element', () => {
    const obj = {};
    set(obj, 'users[0].name', 'Alice');
    expect(obj).toEqual({ users: [{ name: 'Alice' }] });
  });

  test('overwrites existing value', () => {
    const obj = { name: 'John' };
    set(obj, 'name', 'Jane');
    expect(obj).toEqual({ name: 'Jane' });
  });

  test('handles mixed notation', () => {
    const obj = {};
    set(obj, 'data.items[0].id', 1);
    expect(obj).toEqual({ data: { items: [{ id: 1 }] } });
  });

  test('accepts array path', () => {
    const obj = {};
    set(obj, ['a', 'b', 'c'], 'value');
    expect(obj).toEqual({ a: { b: { c: 'value' } } });
  });

  test('returns the object', () => {
    const obj = {};
    const result = set(obj, 'a.b', 1);
    expect(result).toBe(obj);
  });
});
```

---

## Real-World Use Cases

### 1. Form State Management

```javascript
function updateFormField(formState, fieldPath, value) {
  return set({ ...formState }, fieldPath, value);
}

const form = {
  personal: {
    firstName: '',
    lastName: ''
  }
};

updateFormField(form, 'personal.firstName', 'John');
updateFormField(form, 'contact.email', 'john@example.com');
```

### 2. Configuration Builder

```javascript
class ConfigBuilder {
  constructor() {
    this.config = {};
  }

  set(path, value) {
    set(this.config, path, value);
    return this;
  }

  build() {
    return this.config;
  }
}

const config = new ConfigBuilder()
  .set('api.baseUrl', 'https://api.example.com')
  .set('api.timeout', 5000)
  .set('features.darkMode.enabled', true)
  .build();
```

### 3. Redux-like State Updates

```javascript
function updateState(state, action) {
  const newState = { ...state };

  switch (action.type) {
    case 'SET_USER_NAME':
      return set(newState, 'user.profile.name', action.payload);

    case 'ADD_TODO':
      const todos = get(newState, 'todos', []);
      return set(newState, `todos[${todos.length}]`, action.payload);

    default:
      return state;
  }
}
```

### 4. API Response Transformation

```javascript
function transformAPIResponse(response) {
  const transformed = {};

  set(transformed, 'user.id', response.userId);
  set(transformed, 'user.name', response.fullName);
  set(transformed, 'user.profile.avatar', response.avatarUrl);
  set(transformed, 'meta.timestamp', Date.now());

  return transformed;
}
```

---

## Common Mistakes

- ❌ Not creating intermediate objects
- ❌ Not handling array indices correctly
- ❌ Creating objects when arrays needed (or vice versa)
- ❌ Not returning the object

✅ Create missing paths automatically
✅ Detect arrays vs objects from next key
✅ Handle mixed notation properly
✅ Return modified object for chaining

---

## Complexity Analysis

- **Time Complexity:** O(n) - where n is path depth
- **Space Complexity:** O(n) - for keys array + created objects

---

## Related Problems

- `get(object, path)` - Get nested value
- `has(object, path)` - Check if path exists
- `unset(object, path)` - Delete nested value
- `merge(object, source)` - Deep merge objects

---

[← Back to JavaScript Fundamentals](./README.md)
