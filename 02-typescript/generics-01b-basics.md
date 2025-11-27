# TypeScript Generics - Conditional Types

> Advanced generic patterns with conditional types

---

## Question 1: Explain Conditional Types in TypeScript

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 12 minutes
**Companies:** Google, Meta, Microsoft

### Question
What are conditional types in TypeScript? How and when would you use them in production code?

### Answer

**Conditional types** allow you to create types that depend on a condition. They use a ternary-like syntax: `T extends U ? X : Y`.

**Key Points:**

1. **Syntax** - `Type extends Condition ? TrueType : FalseType`
2. **Type-level Logic** - Make decisions about types at compile time
3. **Distributive** - Over union types automatically
4. **Built-in Utilities** - TypeScript's built-in utility types use them
5. **Advanced Patterns** - Extract, exclude, filter types

### Code Example

```typescript
// 1. BASIC CONDITIONAL TYPE
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // type: true
type B = IsString<number>;    // type: false
type C = IsString<'hello'>;   // type: true

// 2. REAL-WORLD: FUNCTION RETURN TYPE BASED ON INPUT
type ApiResponse<T> = T extends 'json' ? object : string;

function callApi<T extends 'json' | 'text'>(
  endpoint: string,
  format: T
): Promise<ApiResponse<T>> {
  return fetch(endpoint).then(res =>
    format === 'json' ? res.json() : res.text()
  ) as Promise<ApiResponse<T>>;
}

const jsonData = await callApi('/api/data', 'json');   // type: object
const textData = await callApi('/api/data', 'text');   // type: string

// 3. DISTRIBUTIVE CONDITIONAL TYPES (with unions)
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// Distributes to: ToArray<string> | ToArray<number>
// Results in: string[] | number[]

// 4. INFER KEYWORD (extract types from other types)
type ReturnTypeCustom<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string {
  return 'hello';
}

function getNumber(): number {
  return 42;
}

type GreetReturn = ReturnTypeCustom<typeof greet>;      // string
type NumberReturn = ReturnTypeCustom<typeof getNumber>;  // number

// 5. EXTRACT ARRAY ELEMENT TYPE
type ElementType<T> = T extends (infer E)[] ? E : T;

type NumArray = number[];
type Num = ElementType<NumArray>;  // number

type Str = ElementType<string>;    // string (not an array, returns itself)

// 6. REAL-WORLD: FLATTEN NESTED TYPES
type Flatten<T> = T extends any[]
  ? T[number]
  : T extends object
    ? T[keyof T]
    : T;

type Arr = Flatten<number[]>;              // number
type Obj = Flatten<{ a: string; b: number }>;  // string | number
type Prim = Flatten<string>;               // string

// 7. COMPLEX EXAMPLE: DEEP READONLY
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    ttl: number;
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// All nested properties are readonly

const config: ReadonlyConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      username: 'admin',
      password: 'secret'
    }
  },
  cache: {
    ttl: 3600
  }
};

// config.database.host = 'newhost';  // ❌ Error: readonly
// config.database.credentials.password = 'new';  // ❌ Error: readonly

// 8. PRACTICAL: EXCLUDE NULLABLE TYPES
type NonNullable<T> = T extends null | undefined ? never : T;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // string

// 9. FUNCTION PARAMETER TYPES
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

function myFunction(name: string, age: number, active: boolean) {
  return { name, age, active };
}

type MyFunctionParams = Parameters<typeof myFunction>;
// [name: string, age: number, active: boolean]
```

### Common Mistakes

```typescript
// ❌ WRONG: Forgetting distributive behavior
type WrapInArray<T> = T extends any ? T[] : never;
type Result = WrapInArray<string | number>;
// Result: string[] | number[] (distributes)
// You might expect: (string | number)[]

// ✅ CORRECT: Use tuple to prevent distribution
type WrapInArrayCorrect<T> = [T] extends [any] ? T[] : never;
type Result2 = WrapInArrayCorrect<string | number>;
// Result: (string | number)[]

// ❌ WRONG: Not handling never type
type ExtractString<T> = T extends string ? T : never;
type Test = ExtractString<never>;  // never (might be unexpected)

// ✅ CORRECT: Check for never explicitly if needed
type ExtractStringSafe<T> = [T] extends [never]
  ? 'no-type'
  : T extends string
    ? T
    : never;
```

### Follow-up Questions
1. What is the `infer` keyword and how does it work?
2. How are TypeScript's built-in utility types implemented using conditional types?
3. What are distributive conditional types?

### Resources
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type Inference in Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)

---

## 🔍 Deep Dive: Conditional Type Mechanics and Advanced Patterns

### How TypeScript Evaluates Conditional Types

Conditional types are evaluated **lazily** at the point of use. TypeScript performs pattern matching to determine which branch to take:

```typescript
// Step-by-step evaluation

type IsArray<T> = T extends any[] ? true : false;

// CASE 1: IsArray<number[]>
// 1. Check: Does number[] extend any[]?
// 2. Pattern match: number[] matches the array pattern
// 3. Result: true

// CASE 2: IsArray<string>
// 1. Check: Does string extend any[]?
// 2. Pattern match: string does NOT match array pattern
// 3. Result: false

// CASE 3: With unions (distributive)
type Result = IsArray<number[] | string>;
// 1. Distribute over union:
//    IsArray<number[]> | IsArray<string>
// 2. Evaluate each:
//    true | false
// 3. Result: boolean (true | false = boolean)
```

### Distributive Conditional Types

When a conditional type acts on a **bare type parameter** (not wrapped in tuple/array), it **distributes** over union types:

```typescript
// Distributive (bare type parameter)
type ToArray<T> = T extends any ? T[] : never;

type Distributed = ToArray<string | number>;
// Step 1: T = string | number (union)
// Step 2: Distribute → ToArray<string> | ToArray<number>
// Step 3: Evaluate → string[] | number[]
// Result: string[] | number[]

// Non-distributive (wrapped in tuple)
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type NonDistributed = ToArrayNonDist<string | number>;
// Step 1: T = string | number (union)
// Step 2: [string | number] extends [any]? YES
// Step 3: Result: (string | number)[]
// No distribution!

// Practical example: Extract function types
type FunctionType<T> = T extends Function ? T : never;

type Funcs = FunctionType<(() => void) | string | ((x: number) => number)>;
// Distributes to:
// FunctionType<() => void> | FunctionType<string> | FunctionType<(x: number) => number>
// Results in:
// (() => void) | never | ((x: number) => number)
// Simplifies to:
// (() => void) | ((x: number) => number)
```

### The `infer` Keyword: Type Pattern Matching

`infer` allows you to **extract** types from within a conditional type. It's like a type-level regex capture group:

```typescript
// Basic infer: Extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getName(): string {
  return 'John';
}

type NameType = ReturnType<typeof getName>;  // string

// How it works:
// 1. T = () => string
// 2. Pattern match: (...args: any[]) => infer R
// 3. R is inferred as: string
// 4. Return R → string

// Multiple infer: Extract first and rest
type HeadAndTail<T> = T extends [infer Head, ...infer Tail]
  ? { head: Head; tail: Tail }
  : never;

type Result1 = HeadAndTail<[1, 2, 3, 4]>;
// { head: 1; tail: [2, 3, 4] }

type Result2 = HeadAndTail<[string, number, boolean]>;
// { head: string; tail: [number, boolean] }

// Advanced: Extract promise value
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Value1 = UnwrapPromise<Promise<string>>;  // string
type Value2 = UnwrapPromise<string>;           // string (not a Promise)

// Recursive unwrap (handles Promise<Promise<T>>)
type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>
  : T;

type Nested = DeepUnwrapPromise<Promise<Promise<Promise<number>>>>;
// number (fully unwrapped)
```

### Conditional Type Constraints

You can combine conditional types with generic constraints:

```typescript
// Constraint: T must be a function
type ExtractReturnType<T extends (...args: any[]) => any> =
  T extends (...args: any[]) => infer R ? R : never;

// T is constrained, so we know it's a function
const myFunc = (x: number) => x * 2;
type MyReturn = ExtractReturnType<typeof myFunc>;  // number

// type BadReturn = ExtractReturnType<string>;
// ❌ Error: string doesn't satisfy constraint

// Advanced: Conditional based on constraint
type ProcessArray<T> = T extends readonly any[]
  ? {
      item: T[number];
      length: number;
      isReadonly: T extends readonly unknown[] ? true : false;
    }
  : never;

type Arr1 = ProcessArray<[1, 2, 3]>;
// { item: number; length: number; isReadonly: false }

type Arr2 = ProcessArray<readonly [1, 2, 3]>;
// { item: number; length: number; isReadonly: true }
```

### Recursive Conditional Types

TypeScript 4.1+ supports tail-call optimized recursive conditional types:

```typescript
// Recursive type: Flatten nested arrays
type Flatten<T> = T extends any[]
  ? T[number] extends any[]
    ? Flatten<T[number]>
    : T[number]
  : T;

type Nested1 = Flatten<number[]>;                    // number
type Nested2 = Flatten<number[][]>;                  // number
type Nested3 = Flatten<number[][][]>;                // number
type Nested4 = Flatten<string[] | number[][]>;       // string | number

// Recursive depth calculation (advanced)
type Length<T extends any[]> = T['length'];

type BuildTuple<L extends number, T extends any[] = []> =
  T['length'] extends L
    ? T
    : BuildTuple<L, [...T, any]>;

type Tuple5 = BuildTuple<5>;  // [any, any, any, any, any]

// Deep partial (make all nested properties optional)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface User {
  name: string;
  address: {
    street: string;
    city: string;
    zipCode: {
      code: string;
      plus4: string;
    };
  };
}

type PartialUser = DeepPartial<User>;
// All properties optional, including nested ones
const u: PartialUser = {
  address: {
    zipCode: {} // street, city, code, plus4 all optional
  }
};
```

### Built-in Utility Types Implementation

Here's how TypeScript's built-in utilities are implemented using conditional types:

```typescript
// 1. Extract - Extract types from union that satisfy condition
type Extract<T, U> = T extends U ? T : never;

type Nums = Extract<string | number | boolean, number | boolean>;
// number | boolean

// 2. Exclude - Opposite of Extract
type Exclude<T, U> = T extends U ? never : T;

type NotNums = Exclude<string | number | boolean, number>;
// string | boolean

// 3. NonNullable - Remove null and undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type Clean = NonNullable<string | null | undefined>;
// string

// 4. Parameters - Extract function parameters
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

function myFunc(name: string, age: number) {
  return { name, age };
}

type Params = Parameters<typeof myFunc>;
// [name: string, age: number]

// 5. ReturnType - Extract function return type
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

type MyReturn = ReturnType<typeof myFunc>;
// { name: string; age: number }

// 6. Awaited (TypeScript 4.5+) - Unwrap Promise types
type Awaited<T> = T extends Promise<infer U>
  ? Awaited<U>  // Recursively unwrap
  : T;

type Value = Awaited<Promise<Promise<string>>>;  // string
```

### Conditional Types and Type Narrowing

Conditional types can be used for sophisticated type narrowing:

```typescript
// Filter object keys by value type
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

interface User {
  name: string;
  age: number;
  email: string;
  isActive: boolean;
  lastLogin: Date;
}

type StringKeys = KeysOfType<User, string>;
// 'name' | 'email'

type NumberKeys = KeysOfType<User, number>;
// 'age'

// Pick only certain types
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type StringProps = PickByType<User, string>;
// { name: string; email: string }

type NumberProps = PickByType<User, number>;
// { age: number }

// Require certain keys
type RequireKeys<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

type UserWithRequiredEmail = RequireKeys<Partial<User>, 'email'>;
// name?, age?, email (required), isActive?, lastLogin?
```

### Performance Considerations

Conditional types can impact compilation performance:

```typescript
// FAST: Simple conditional (0.1ms per usage)
type IsString<T> = T extends string ? true : false;

// MEDIUM: Single infer (1-2ms per usage)
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// SLOW: Recursive with multiple branches (10-50ms per usage)
type DeepFlatten<T> = T extends any[]
  ? T[number] extends any[]
    ? DeepFlatten<T[number]>
    : T[number]
  : T extends object
    ? { [K in keyof T]: DeepFlatten<T[K]> }
    : T;

// VERY SLOW: Deep recursion with unions (50-200ms per usage)
type UltraDeep<T, Depth extends number = 10> = {
  [K in keyof T]: T[K] extends object
    ? Depth extends 0
      ? T[K]
      : UltraDeep<T[K], /* decrease depth */>
    : T[K];
};
```

**TypeScript Compiler Metrics (conditional types):**

- **Simple conditional**: +0.1-0.5ms per 100 usages
- **With infer**: +1-5ms per 100 usages
- **Recursive (depth 3)**: +10-30ms per 100 usages
- **Recursive (depth 5+)**: +50-200ms per 100 usages
- **Distributive over large unions**: +20-100ms per 100 usages

**Optimization Tips:**

```typescript
// ❌ SLOW: Deep nested conditionals
type Bad<T> = T extends A
  ? T extends B
    ? T extends C
      ? T extends D
        ? TypeD
        : TypeC
      : TypeB
    : TypeA
  : never;

// ✅ FASTER: Flattened with helper types
type Check<T, U> = T extends U ? T : never;
type Good<T> =
  | Check<T, A>
  | Check<T, B>
  | Check<T, C>
  | Check<T, D>;

// ❌ SLOW: Recursive without base case optimization
type SlowUnwrap<T> = T extends Promise<infer U>
  ? SlowUnwrap<U>
  : T;

// ✅ FASTER: Check for Promise first
type FastUnwrap<T> = T extends Promise<any>
  ? T extends Promise<infer U>
    ? FastUnwrap<U>
    : T
  : T;
```

---

## 🐛 Real-World Scenario: Conditional Type Bug in Type-Safe Router

### The Problem

A SaaS company building a type-safe routing library used conditional types incorrectly, causing a bug where route parameters weren't properly typed, leading to runtime errors in production that TypeScript didn't catch.

**Production Impact:**
- **Incident Duration**: 8 hours
- **Affected Users**: 180,000 customers (entire platform)
- **Failed Navigations**: 320,000 route navigations crashed
- **Data Loss**: User navigation state lost, checkout flows broken
- **Revenue Impact**: $680,000 in lost sales (abandoned carts)
- **SEO Impact**: Google crawlers encountered errors, rankings dropped

### The Code

```typescript
// ❌ PROBLEMATIC: Incorrect conditional type logic
type RouteParams<Path extends string> =
  Path extends `:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & RouteParams<Rest>
    : Path extends `:${infer Param}`
      ? { [K in Param]: string }
      : {};

// Developer uses it
type UserRoute = RouteParams<'/users/:userId/posts/:postId'>;
// Expected: { userId: string; postId: string }
// Actual: {} (empty!)

// Why? The pattern doesn't match because of leading '/'

// Usage in router
interface Router {
  navigate<Path extends string>(
    path: Path,
    params: RouteParams<Path>
  ): void;
}

const router: Router = {
  navigate(path, params) {
    // Replace :param with actual values
    let finalPath = path;
    for (const key in params) {
      finalPath = finalPath.replace(`:${key}`, params[key]);
    }
    window.location.href = finalPath;
  }
};

// This compiles but is WRONG:
router.navigate('/users/:userId/posts/:postId', {});
// TypeScript accepts {} because RouteParams returned {}
// Runtime: URL becomes /users/:userId/posts/:postId (not replaced!)

// User clicks "View Post" button
// App crashes with: "User not found" (userId is literally ":userId")
```

### Root Cause Analysis

**Why TypeScript Didn't Catch This:**

1. **Pattern mismatch** - Conditional type pattern didn't account for leading `/`
2. **Empty object fallback** - Returns `{}` on failure, which TypeScript accepts for any object type
3. **No runtime validation** - Type system promised safety but didn't deliver
4. **Complex string parsing** - Hard to reason about conditional type logic

**Timeline of Failure:**

```
Monday 9:00 AM - Router library v2.0 deployed to production
Monday 9:15 AM - First error reports: "User profile not loading"
Monday 9:30 AM - Errors cascade: checkout, settings, dashboard all broken
Monday 10:00 AM - Support tickets flood in (2,000+ tickets/hour)
Monday 11:00 AM - Engineering rollback attempted, but cache issues persist
Monday 2:00 PM - Full investigation reveals conditional type bug
Monday 4:00 PM - Fix deployed with proper pattern matching
Monday 5:00 PM - Cache cleared, services restarted
Monday 5:30 PM - Full recovery confirmed
```

### The Fix: Correct Conditional Type Patterns

```typescript
// ✅ SOLUTION: Properly handle all path patterns

// Helper: Remove leading slash
type RemoveLeadingSlash<S extends string> =
  S extends `/${infer Rest}` ? Rest : S;

// Helper: Extract single param
type ExtractParam<Path extends string> =
  Path extends `:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParam<Rest>
    : Path extends `:${infer Param}`
      ? { [K in Param]: string }
      : Path extends `${string}/:${infer Param}/${infer Rest}`
        ? { [K in Param]: string } & ExtractParam<Rest>
        : Path extends `${string}/:${infer Param}`
          ? { [K in Param]: string }
          : {};

// Main type: Combine helpers
type RouteParams<Path extends string> = ExtractParam<RemoveLeadingSlash<Path>>;

// Test cases
type Test1 = RouteParams<'/users/:userId/posts/:postId'>;
// ✅ { userId: string; postId: string }

type Test2 = RouteParams<'/users/:userId'>;
// ✅ { userId: string }

type Test3 = RouteParams<'/about'>;
// ✅ {} (no params)

type Test4 = RouteParams<'/:category/items/:itemId'>;
// ✅ { category: string; itemId: string }

// Improved router with validation
interface SafeRouter {
  navigate<Path extends string>(
    path: Path,
    ...args: {} extends RouteParams<Path>
      ? [params?: RouteParams<Path>]
      : [params: RouteParams<Path>]
  ): void;
}

const safeRouter: SafeRouter = {
  navigate(path, params = {}) {
    let finalPath: string = path;

    // Validate all required params are provided
    const requiredParams = path.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];
    for (const param of requiredParams) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      finalPath = finalPath.replace(`:${param}`, params[param]);
    }

    // Ensure all params were replaced
    if (finalPath.includes(':')) {
      throw new Error(`Not all parameters were replaced: ${finalPath}`);
    }

    window.location.href = finalPath;
  }
};

// Now TypeScript enforces correct usage:
safeRouter.navigate('/users/:userId/posts/:postId', {
  userId: '123',
  postId: '456'
});  // ✅ Works

// safeRouter.navigate('/users/:userId/posts/:postId', {});
// ❌ Error: params required

// safeRouter.navigate('/users/:userId/posts/:postId', { userId: '123' });
// ❌ Error: missing postId

// safeRouter.navigate('/about');
// ✅ Works (no params needed)
```

### Additional Safety: Runtime Schema Validation

```typescript
// Combine compile-time + runtime safety
import { z } from 'zod';

// Define route schema
const routeSchema = z.object({
  path: z.string(),
  params: z.record(z.string())
});

// Type-safe + runtime-validated router
class ValidatedRouter {
  private routes = new Map<string, z.ZodType<any>>();

  registerRoute<Path extends string>(
    path: Path,
    paramSchema: z.ZodType<RouteParams<Path>>
  ) {
    this.routes.set(path, paramSchema);
  }

  navigate<Path extends string>(
    path: Path,
    params: RouteParams<Path>
  ): void {
    const schema = this.routes.get(path);

    if (schema) {
      // Runtime validation
      try {
        const validated = schema.parse(params);
        this.performNavigation(path, validated);
      } catch (error) {
        console.error('Invalid route params:', error);
        // Log to monitoring
        logError('ROUTE_PARAMS_INVALID', { path, params, error });
        throw new Error(`Invalid parameters for route: ${path}`);
      }
    } else {
      this.performNavigation(path, params);
    }
  }

  private performNavigation(path: string, params: Record<string, string>) {
    let finalPath = path;
    for (const [key, value] of Object.entries(params)) {
      finalPath = finalPath.replace(`:${key}`, value);
    }

    if (finalPath.includes(':')) {
      throw new Error(`Unreplaced parameters in: ${finalPath}`);
    }

    window.location.href = finalPath;
  }
}

// Usage
const router = new ValidatedRouter();

// Register routes with schemas
router.registerRoute(
  '/users/:userId/posts/:postId',
  z.object({
    userId: z.string().uuid(),
    postId: z.string().uuid()
  })
);

// Valid navigation
router.navigate('/users/:userId/posts/:postId', {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  postId: '987fcdeb-51a2-43f1-b123-456789abcdef'
});  // ✅ Works

// Invalid navigation (caught at runtime)
try {
  router.navigate('/users/:userId/posts/:postId', {
    userId: 'not-a-uuid',
    postId: '987fcdeb-51a2-43f1-b123-456789abcdef'
  });
} catch (error) {
  // Error logged to monitoring
  // User sees friendly error message
}
```

### Metrics After Fix

**Before (broken conditional types):**
- **Type safety**: 0% (empty object fallback)
- **Runtime errors**: 320,000 failed navigations
- **Mean Time to Detection (MTTD)**: 15 minutes
- **Mean Time to Resolution (MTTR)**: 8 hours
- **Developer confidence**: Low (unclear if types were correct)

**After (fixed conditional types + validation):**
- **Type safety**: 100% (compile-time + runtime)
- **Runtime errors**: 0 routing errors in 9 months
- **MTTD**: N/A (caught before production)
- **MTTR**: 0 (prevented)
- **Developer confidence**: High (types proven correct)

**Business Impact:**
- **Revenue recovery**: $680K/month saved
- **Support tickets**: 98% reduction in routing issues
- **Developer velocity**: 50% faster feature development (confident refactoring)
- **SEO recovery**: Rankings restored within 2 weeks

### Debugging Steps

```typescript
// 1. Test conditional types with concrete examples
type TestRoute1 = RouteParams<'/users/:userId'>;
// Hover in IDE to see result

type TestRoute2 = RouteParams<'/users/:userId/posts/:postId'>;
// Check if params are extracted correctly

// 2. Build helper to visualize type transformations
type Debug<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type DebugRoute = Debug<RouteParams<'/users/:userId/posts/:postId'>>;
// Expands type for easier reading

// 3. Add compile-time tests
type Assert<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : false
  : false;

type Test1Passes = Assert<
  RouteParams<'/users/:userId'>,
  { userId: string }
>;  // Should be true

// If false, type doesn't match expectation

// 4. Runtime validation during development
function validateRoute<Path extends string>(
  path: Path,
  params: RouteParams<Path>
) {
  const paramNames = path.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];
  const providedKeys = Object.keys(params);

  console.log('Expected params:', paramNames);
  console.log('Provided params:', providedKeys);

  const missing = paramNames.filter(p => !providedKeys.includes(p));
  if (missing.length > 0) {
    throw new Error(`Missing params: ${missing.join(', ')}`);
  }
}
```

### Key Lessons

1. **Test conditional types thoroughly** - Use concrete examples, not just theory
2. **Fallback to safe defaults** - Never return `{}` on failure, use `never` or explicit error
3. **Combine compile-time + runtime** - Types alone aren't enough for external inputs
4. **Pattern matching is tricky** - Edge cases (leading `/`, trailing `/`, etc.) break easily
5. **Validate assumptions** - Add runtime checks even with strong types

---

## ⚖️ Trade-offs: Conditional Types vs Alternatives

### Decision Matrix: When to Use Conditional Types

| Scenario | Conditional Types | Function Overloads | Union Types | Type Guards |
|----------|------------------|-------------------|-------------|-------------|
| **Type transformation** | ✅ Best | ❌ Can't do | ❌ Can't do | ❌ Runtime only |
| **Extract from types** | ✅ Best (with infer) | ❌ Can't do | ❌ Can't do | ❌ Can't do |
| **2-3 fixed variations** | ⚠️ Overkill | ✅ Best | ✅ Best | ⚠️ Maybe |
| **Complex logic** | ✅ Best | ❌ Verbose | ❌ Can't express | ❌ Runtime only |
| **Runtime checks** | ❌ Compile-time only | ❌ Compile-time | ❌ Compile-time | ✅ Best |
| **Library/utility types** | ✅ Best | ⚠️ Limited | ❌ No | ❌ No |

### Trade-off 1: Conditional Types vs Function Overloads

**Scenario:** API client with different response types based on request type

```typescript
// APPROACH 1: Conditional Types
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type ResponseType<Method extends RequestMethod> =
  Method extends 'GET'
    ? { data: any }
    : Method extends 'POST'
      ? { data: any; id: string }
      : Method extends 'PUT'
        ? { data: any; updated: boolean }
        : { success: boolean };

async function request<M extends RequestMethod>(
  method: M,
  url: string
): Promise<ResponseType<M>> {
  const response = await fetch(url, { method });
  return response.json();
}

// Usage
const getResponse = await request('GET', '/users');
// Type: { data: any }

const postResponse = await request('POST', '/users');
// Type: { data: any; id: string }

// APPROACH 2: Function Overloads
async function requestOverload(method: 'GET', url: string): Promise<{ data: any }>;
async function requestOverload(method: 'POST', url: string): Promise<{ data: any; id: string }>;
async function requestOverload(method: 'PUT', url: string): Promise<{ data: any; updated: boolean }>;
async function requestOverload(method: 'DELETE', url: string): Promise<{ success: boolean }>;

async function requestOverload(method: RequestMethod, url: string): Promise<any> {
  const response = await fetch(url, { method });
  return response.json();
}

// Usage
const getResponse2 = await requestOverload('GET', '/users');
// Type: { data: any }
```

**Comparison:**

| Aspect | Conditional Types | Overloads |
|--------|------------------|-----------|
| **Code size** | ✅ Single definition | ❌ N+1 definitions |
| **Extensibility** | ✅ Easy to add methods | ❌ Must add new overload |
| **Type computation** | ✅ Automatic | ❌ Manual per overload |
| **Readability** | ⚠️ Complex for juniors | ✅ Straightforward |
| **Compile performance** | ✅ Fast | ✅ Fast |

**Verdict:** Use conditional types for extensible type-safe APIs, overloads for simple 2-4 variations.

### Trade-off 2: Conditional Types with `infer` vs Manual Type Extraction

**Scenario:** Extract element type from arrays

```typescript
// APPROACH 1: Conditional with infer
type ElementType<T> = T extends (infer E)[] ? E : T;

type Arr1 = ElementType<number[]>;        // number
type Arr2 = ElementType<string[]>;        // string
type Arr3 = ElementType<[1, 2, 3]>;       // 1 | 2 | 3
type Arr4 = ElementType<readonly string[]>; // string

// Works with any array type automatically

// APPROACH 2: Manual indexed access
type ElementTypeManual<T extends any[]> = T[number];

type ManArr1 = ElementTypeManual<number[]>;   // number
type ManArr2 = ElementTypeManual<string[]>;   // string
// type ManArr3 = ElementTypeManual<string>; // ❌ Error: string not assignable to any[]

// Must be array
```

**Comparison:**

| Aspect | Conditional + infer | Manual indexed |
|--------|-------------------|----------------|
| **Flexibility** | ✅ Works on non-arrays too | ❌ Arrays only |
| **Code clarity** | ⚠️ Requires understanding infer | ✅ Simple |
| **Performance** | ⚠️ Slightly slower (infer overhead) | ✅ Fast |
| **Error messages** | ⚠️ Can be cryptic | ✅ Clear |

**Verdict:** Use `infer` for flexible type extraction, indexed access for simple array element types.

### Trade-off 3: Recursive Conditional Types vs Iterative Approaches

**Scenario:** Deep readonly transformation

```typescript
// APPROACH 1: Recursive Conditional
type DeepReadonlyRecursive<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonlyRecursive<T[K]>
    : T[K];
};

interface User {
  name: string;
  address: {
    street: string;
    city: {
      name: string;
      zip: string;
    };
  };
}

type ReadonlyUser = DeepReadonlyRecursive<User>;
// All nested properties readonly

// APPROACH 2: Fixed depth levels
type Readonly1<T> = { readonly [K in keyof T]: T[K] };

type Readonly2<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? Readonly1<T[K]>
    : T[K];
};

type Readonly3<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? Readonly2<T[K]>
    : T[K];
};

// Must choose depth manually
type ReadonlyUserLevel3 = Readonly3<User>;
```

**Performance & Complexity:**

| Metric | Recursive | Fixed Depth |
|--------|-----------|-------------|
| **Compile time** (depth 3) | 10-20ms | 5-10ms |
| **Compile time** (depth 5) | 50-100ms | 15-25ms |
| **Flexibility** | ✅ Any depth | ❌ Fixed |
| **Type errors** | ⚠️ Hard to debug | ✅ Clear |
| **Maintenance** | ✅ Single definition | ❌ Multiple levels |

**Verdict:**

- **Recursive**: For library code, unknown depth, reusability
- **Fixed depth**: For application code, known structure, performance-critical

### Trade-off 4: Complex Conditional Types vs Runtime Logic

**Scenario:** Form field validation based on type

```typescript
// APPROACH 1: Compile-time conditional types
type FieldValidation<T> = T extends string
  ? { minLength?: number; maxLength?: number; pattern?: RegExp }
  : T extends number
    ? { min?: number; max?: number }
    : T extends boolean
      ? {}
      : never;

interface FormField<T> {
  name: string;
  value: T;
  validation: FieldValidation<T>;
}

const nameField: FormField<string> = {
  name: 'username',
  value: '',
  validation: { minLength: 3, maxLength: 20 }
};  // ✅ Correct validation for string

const ageField: FormField<number> = {
  name: 'age',
  value: 0,
  validation: { min: 18, max: 100 }
};  // ✅ Correct validation for number

// const badField: FormField<string> = {
//   name: 'bad',
//   value: '',
//   validation: { min: 5 }  // ❌ Error: wrong validation for string
// };

// APPROACH 2: Runtime validation
interface GenericFormField {
  name: string;
  value: any;
  validation: {
    type: 'string' | 'number' | 'boolean';
    rules: any;
  };
}

function validateField(field: GenericFormField): boolean {
  if (field.validation.type === 'string') {
    const rules = field.validation.rules as {
      minLength?: number;
      maxLength?: number;
    };

    if (rules.minLength && field.value.length < rules.minLength) {
      return false;
    }

    // ... more validation
  }

  // Runtime checks
  return true;
}

const runtimeField: GenericFormField = {
  name: 'username',
  value: '',
  validation: {
    type: 'string',
    rules: { min: 5 }  // ✅ Compiles, but wrong! Caught at runtime
  }
};
```

**Comparison:**

| Aspect | Conditional Types | Runtime Logic |
|--------|------------------|---------------|
| **Compile-time safety** | ✅ 100% | ❌ 0% |
| **Runtime cost** | ✅ 0ms (erased) | ⚠️ Validation overhead |
| **Flexibility** | ⚠️ Type system limits | ✅ Unlimited |
| **Error detection** | ✅ Before deployment | ❌ In production |
| **Complex rules** | ❌ Hard to express | ✅ Easy |

**Verdict:** Use conditional types for type safety, runtime validation for complex/dynamic rules. Combine both for best results.

---

## 💬 Explain to Junior: Conditional Types Made Simple

### What Are Conditional Types?

Think of conditional types like an **if-else statement for types**:

```typescript
// Regular JavaScript if-else:
function getMessage(isError: boolean) {
  if (isError) {
    return "Error occurred";
  } else {
    return "Success";
  }
}

// TypeScript conditional type (type-level if-else):
type Message<IsError extends boolean> =
  IsError extends true
    ? "Error occurred"
    : "Success";

type ErrorMsg = Message<true>;    // "Error occurred"
type SuccessMsg = Message<false>;  // "Success"
```

The pattern: `T extends U ? X : Y`

- **If** `T` matches pattern `U`, return type `X`
- **Else**, return type `Y`

### Real-World Analogy: Vending Machine

Imagine a vending machine that gives you different types of containers based on what you buy:

```typescript
// The vending machine's logic:
type Container<Item> =
  Item extends 'soda' ? 'Can' :
  Item extends 'water' ? 'Bottle' :
  Item extends 'chips' ? 'Bag' :
  'Box';

// What container do you get?
type SodaCont = Container<'soda'>;   // 'Can'
type WaterCont = Container<'water'>;  // 'Bottle'
type ChipsCont = Container<'chips'>;  // 'Bag'
type CandyCont = Container<'candy'>;  // 'Box' (default)
```

### Practical Example: Type-Safe API Response

```typescript
// Step 1: Define different response types
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// Step 2: Conditional type based on success flag
type ApiResponse<T, Success extends boolean> =
  Success extends true
    ? SuccessResponse<T>
    : ErrorResponse;

// Step 3: Use in function
function handleResponse<T, S extends boolean>(
  success: S,
  dataOrError: S extends true ? T : string
): ApiResponse<T, S> {
  if (success) {
    return {
      success: true,
      data: dataOrError
    } as ApiResponse<T, S>;
  } else {
    return {
      success: false,
      error: dataOrError as string
    } as ApiResponse<T, S>;
  }
}

// Step 4: TypeScript knows the exact type!
const goodResponse = handleResponse(true, { id: 1, name: 'John' });
// Type: SuccessResponse<{ id: number; name: string }>
console.log(goodResponse.data.name);  // ✅ TypeScript knows this exists

const badResponse = handleResponse(false, 'User not found');
// Type: ErrorResponse
console.log(badResponse.error);  // ✅ TypeScript knows this exists
// console.log(badResponse.data);  // ❌ Error: 'data' doesn't exist on ErrorResponse
```

### The Magic `infer` Keyword

`infer` is like a **type-level variable** that captures parts of a type:

```typescript
// Regular JavaScript: Extract value from object
function getValue(obj: { value: any }) {
  const value = obj.value;  // Extract the value
  return value;
}

// Conditional type: Extract type from array
type ExtractElement<T> =
  T extends (infer Element)[]  // If T is an array, capture the element type
    ? Element                   // Return the element type
    : never;                    // Otherwise, return never

type Numbers = ExtractElement<number[]>;  // number (captured from number[])
type Strings = ExtractElement<string[]>;  // string (captured from string[])
type NotArray = ExtractElement<number>;    // never (not an array)
```

**Real-World Use: Extract Promise Value**

```typescript
// Problem: You have Promise<string> and want just 'string'
type UnwrapPromise<T> =
  T extends Promise<infer Value>  // If T is a Promise, capture the value type
    ? Value                        // Return the value type
    : T;                           // Otherwise, return T itself

type StringPromise = Promise<string>;
type JustString = UnwrapPromise<StringPromise>;  // string

type NumberPromise = Promise<number>;
type JustNumber = UnwrapPromise<NumberPromise>;  // number

type NotPromise = UnwrapPromise<string>;  // string (already unwrapped)
```

### Common Beginner Mistakes

**Mistake #1: Forgetting Distributive Behavior**

```typescript
// ❌ Unexpected: Distributes over unions
type WrapInArray<T> = T extends any ? T[] : never;

type Result = WrapInArray<string | number>;
// You might expect: (string | number)[]
// Actually get: string[] | number[]  (distributed!)

// ✅ Fix: Wrap in tuple to prevent distribution
type WrapCorrect<T> = [T] extends [any] ? T[] : never;

type Result2 = WrapCorrect<string | number>;
// Now: (string | number)[]  ✅
```

**Mistake #2: Not Handling Edge Cases**

```typescript
// ❌ Doesn't handle null/undefined
type GetName<T> = T extends { name: string } ? T['name'] : never;

type UserName = GetName<{ name: 'John' }>;  // 'John' ✅
type Oops = GetName<null>;                   // never ✅
// But in real code, null might sneak in!

// ✅ Better: Explicitly handle null
type GetNameSafe<T> =
  T extends null | undefined
    ? never
    : T extends { name: string }
      ? T['name']
      : never;
```

**Mistake #3: Over-Complicating Simple Cases**

```typescript
// ❌ BAD: Using conditional types when union is simpler
type Size<T> = T extends 'small' ? 10 :
               T extends 'medium' ? 20 :
               T extends 'large' ? 30 :
               never;

// ✅ GOOD: Just use a mapped type or object
type Size = {
  small: 10;
  medium: 20;
  large: 30;
};

const size: Size['small'] = 10;  // Much simpler!
```

### Interview Answer Template

**When asked: "What are conditional types in TypeScript?"**

> "Conditional types allow you to create types that depend on a condition, similar to if-else statements but at the type level. The syntax is `T extends U ? X : Y`, which means 'if type T matches pattern U, return type X, otherwise return type Y.'
>
> The key features are:
> 1. **Type-level logic** - Make decisions about types at compile time
> 2. **Distributive** - Automatically distribute over union types
> 3. **infer keyword** - Extract types from patterns (like regex capture groups)
> 4. **Utility types** - TypeScript's built-in utilities like `ReturnType`, `Exclude`, `Extract` use conditional types
>
> For example, I can create a type that extracts the return type of a function:
> ```typescript
> type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
> ```
>
> Common use cases include:
> - Type transformations (unwrap Promise, extract array elements)
> - Building utility types (Pick, Omit, Exclude, Extract)
> - Type-safe APIs where response type depends on request type
> - Advanced type narrowing and filtering
>
> The important thing to remember is conditional types are purely compile-time - they don't exist at runtime. They're a powerful tool for building type-safe libraries and APIs."

**Follow-up: "What is the `infer` keyword?"**

> "`infer` is used within conditional types to extract and capture a type from a pattern. It's like declaring a type variable within the condition.
>
> For example, to extract the return type of a function:
> ```typescript
> type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
> ```
>
> Here, `infer R` captures whatever type the function returns. If the function returns `string`, then `R` becomes `string`.
>
> It's commonly used for:
> - Extracting return types from functions
> - Extracting element types from arrays
> - Extracting value types from Promises
> - Deconstructing complex types
>
> Without `infer`, we'd have to manually specify types or use hacky workarounds."

### Practice Challenge

**Build a type that extracts keys with specific value types:**

```typescript
// Your task: Implement FilterByType
type FilterByType<T, ValueType> = /* TODO */;

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// Should work like this:
type StringKeys = FilterByType<User, string>;
// Expected: 'name' | 'email'

type NumberKeys = FilterByType<User, number>;
// Expected: 'id' | 'age'
```

**Solution:**

```typescript
type FilterByType<T, ValueType> = {
  [K in keyof T]: T[K] extends ValueType ? K : never;
}[keyof T];

// How it works:
// 1. Map over all keys: { id: ..., name: ..., email: ..., age: ..., isActive: ... }
// 2. For each key, check if value type matches ValueType
// 3. If match: keep the key name (K)
// 4. If no match: use 'never'
// 5. Result: { id: 'id', name: 'name', email: 'email', age: 'age', isActive: never }
// 6. [keyof T] extracts all values: 'id' | 'name' | 'email' | 'age' | never
// 7. 'never' is removed from unions automatically
// 8. Final: 'id' | 'name' | 'email' | 'age'

type StringKeys = FilterByType<User, string>;  // 'name' | 'email'
type NumberKeys = FilterByType<User, number>;   // 'id' | 'age'
type BoolKeys = FilterByType<User, boolean>;    // 'isActive'
```

**Key Takeaway:** Conditional types let you write type-level logic that makes your code more flexible and type-safe. They're like if-else for types!

---

