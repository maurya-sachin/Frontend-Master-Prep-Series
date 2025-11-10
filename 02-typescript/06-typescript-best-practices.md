# TypeScript Best Practices

> Type safety, avoiding `any`, utility types, type guards, and production TypeScript patterns.

---

## Question 1: Avoiding `any` - Better Alternatives

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Microsoft, Google

### Question
What are better alternatives to using `any` in TypeScript?

### Answer

```typescript
// ❌ Using any (loses type safety)
function process(data: any) {
  return data.value; // No type checking
}

// ✅ Better alternatives:

// 1. unknown (safer than any)
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
}

// 2. Generics
function process<T>(data: T): T {
  return data;
}

// 3. Union types
function process(data: string | number | boolean) {
  return data;
}

// 4. Type guards
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'email' in obj
  );
}
```

### Resources
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

