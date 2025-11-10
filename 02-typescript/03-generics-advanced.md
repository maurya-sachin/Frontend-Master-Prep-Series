# TypeScript Generics and Advanced Types

> Generics, constraints, conditional types, mapped types, utility types, and advanced TypeScript patterns.

---

## Question 1: TypeScript Generics

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Microsoft

### Question
Explain TypeScript generics. Why and when to use them?

### Answer

**Generics** - Create reusable components that work with multiple types.

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

identity<string>('hello');  // T is string
identity<number>(42);       // T is number

// Generic interface
interface Box<T> {
  value: T;
}

const stringBox: Box<string> = { value: 'hello' };
const numberBox: Box<number> = { value: 42 };

// Generic constraints
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length);
}

logLength('hello');      // ✅ string has length
logLength([1, 2, 3]);    // ✅ array has length
// logLength(42);        // ❌ number doesn't have length
```

**Real-World Example:**

```typescript
// API response handler
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}

interface User {
  id: number;
  name: string;
}

const user = await fetchData<User>('/api/user/1');
// user is typed as User
```

### Resources
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

