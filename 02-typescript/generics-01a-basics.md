# TypeScript Generics - Basics

> Master generics: basics, constraints, and conditional types

---

## Question 1: Explain TypeScript Generics and Their Real-World Use Cases

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Microsoft, Amazon, Airbnb

### Question
What are TypeScript generics? Explain how they work and provide real-world use cases where generics solve actual problems.

### Answer

**Generics** enable you to create reusable components that work with multiple types while maintaining type safety. They're like parameters for types.

**Key Points:**

1. **Type Variables** - Capture the type provided and use it throughout the function/class
2. **Reusability** - Write code once, use with any type
3. **Type Safety** - Maintain type checking across operations
4. **Flexibility** - Allow consumers to specify types they need
5. **No Type Assertions** - Avoid `any` and unsafe type casting

### Code Example

```typescript
// 1. BASIC GENERIC FUNCTION
function identity<T>(arg: T): T {
  return arg;
}

const str = identity<string>('hello');    // type: string
const num = identity<number>(42);          // type: number
const bool = identity<boolean>(true);      // type: boolean

// Type inference works too
const auto = identity('inferred');         // type: string (inferred)

// 2. GENERIC INTERFACE
interface Box<T> {
  value: T;
  getValue: () => T;
}

const stringBox: Box<string> = {
  value: 'hello',
  getValue: function() { return this.value; }
};

const numberBox: Box<number> = {
  value: 42,
  getValue: function() { return this.value; }
};

// 3. GENERIC CONSTRAINTS
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);  // Safe: we know T has length
  return arg;
}

logLength('hello');           // ✅ string has length
logLength([1, 2, 3]);         // ✅ array has length
logLength({ length: 10 });    // ✅ object with length property
// logLength(42);             // ❌ Error: number doesn't have length

// 4. MULTIPLE TYPE PARAMETERS
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p1 = pair('name', 'John');      // [string, string]
const p2 = pair('age', 30);           // [string, number]
const p3 = pair(1, { data: 'test' }); // [number, object]

// 5. REAL-WORLD: API RESPONSE HANDLER
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Type-safe API calls
const user = await fetchData<User>('/api/users/1');
console.log(user.name);  // ✅ TypeScript knows this is a string

const posts = await fetchData<Post[]>('/api/posts');
console.log(posts[0].title);  // ✅ TypeScript knows posts is an array

// 6. REAL-WORLD: GENERIC STORAGE CLASS
class Storage<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return this.items;
  }

  findById(id: number, idKey: keyof T): T | undefined {
    return this.items.find(item => item[idKey] === id);
  }
}

const userStorage = new Storage<User>();
userStorage.add({ id: 1, name: 'John', email: 'john@example.com' });
userStorage.add({ id: 2, name: 'Jane', email: 'jane@example.com' });

const users = userStorage.getAll();  // type: User[]
```

### Common Mistakes

```typescript
// ❌ WRONG: Using 'any' instead of generics
function badIdentity(arg: any): any {
  return arg;
}

const result = badIdentity('hello');  // type: any (no type safety!)

// ✅ CORRECT: Use generics
function goodIdentity<T>(arg: T): T {
  return arg;
}

const result2 = goodIdentity('hello');  // type: string (type safe!)

// ❌ WRONG: Accessing properties without constraints
function printLength<T>(arg: T): void {
  console.log(arg.length);  // Error: Property 'length' doesn't exist on type 'T'
}

// ✅ CORRECT: Use constraints
interface Lengthy {
  length: number;
}

function printLengthSafe<T extends Lengthy>(arg: T): void {
  console.log(arg.length);  // ✅ Safe
}

// ❌ WRONG: Over-constraining
function processArray<T extends any[]>(arr: T): void {
  // Now we can only use arrays, losing generic flexibility
}

// ✅ CORRECT: Constrain only what's needed
function processItems<T>(items: T[]): void {
  // Works with any array type
}
```

### Follow-up Questions
1. What are generic constraints and when would you use them?
2. How do generics work with React components (props)?
3. What are default type parameters in generics?

### Resources
- [TypeScript Generics Documentation](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Advanced Generics Patterns](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---

## 🔍 Deep Dive: How TypeScript Generics Work Internally

### Type Variable Resolution and Inference

TypeScript's generic system is purely compile-time. When you write a generic function, the compiler performs **type inference** to determine what `T` should be, or uses the explicitly provided type argument.

**Type Inference Algorithm:**

```typescript
// Example: How TypeScript infers T
function identity<T>(arg: T): T {
  return arg;
}

// Call 1: identity('hello')
// Step 1: Look at argument type → 'hello' is a string literal
// Step 2: Without annotation, TypeScript infers T = string (widened)
// Step 3: Return type becomes string
const result1 = identity('hello');  // T inferred as string

// Call 2: identity<'hello'>('hello')
// Step 1: T explicitly set to literal type 'hello'
// Step 2: Argument must match exactly
// Step 3: Return type is literal 'hello'
const result2 = identity<'hello'>('hello');  // T = 'hello' (literal)

// Call 3: Best common type inference
function merge<T, U>(a: T, b: U): T & U {
  return { ...a as any, ...b as any };
}

const obj1 = { x: 1 };
const obj2 = { y: 2 };
const merged = merge(obj1, obj2);
// T inferred as { x: number }
// U inferred as { y: number }
// Return: { x: number } & { y: number } = { x: number; y: number }
```

### Generic Type Erasure

Like Java generics, TypeScript generics are **erased at runtime**. All type information is removed during compilation to JavaScript:

```typescript
// TypeScript (compile-time)
function box<T>(value: T): Box<T> {
  return { value, type: typeof value };
}

interface Box<T> {
  value: T;
  type: string;
}

// Compiled JavaScript (runtime)
function box(value) {
  return { value: value, type: typeof value };
}

// NO generic information exists at runtime!
// This means you CANNOT do runtime type checks on T
```

**Implications:**

```typescript
// ❌ This DOESN'T work - T doesn't exist at runtime
function isString<T>(value: T): boolean {
  return typeof T === 'string';  // Error: T is not defined at runtime
}

// ✅ This works - check the value, not the type parameter
function isString<T>(value: T): value is string {
  return typeof value === 'string';
}
```

### Variance and Type Compatibility

Generics in TypeScript follow **structural typing** with variance rules:

```typescript
interface Box<T> {
  value: T;
}

// Covariance: If Dog extends Animal, Box<Dog> extends Box<Animal>
// (Only for readonly positions)
class Animal {
  name: string;
}

class Dog extends Animal {
  bark(): void {}
}

const dogBox: Box<Dog> = { value: new Dog() };
const animalBox: Box<Animal> = dogBox;  // ✅ Works (covariant)

// Invariance: For mutable positions
interface MutableBox<T> {
  value: T;
  setValue(v: T): void;
}

const mutableDogBox: MutableBox<Dog> = {
  value: new Dog(),
  setValue(d: Dog) {}
};

// const mutableAnimalBox: MutableBox<Animal> = mutableDogBox;
// ❌ Error: Invariant - could break type safety

// Why? You could do:
// mutableAnimalBox.setValue(new Cat());  // Cat extends Animal
// But mutableDogBox expects only Dogs!
```

### Generic Instantiation Process

When TypeScript encounters a generic type, it goes through instantiation:

```typescript
// Generic type definition
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Instantiation 1: Result<User, ApiError>
// TypeScript creates a NEW type by substituting:
// T → User
// E → ApiError
type UserResult = Result<User, ApiError>;
// Expands to:
// type UserResult =
//   | { ok: true; value: User }
//   | { ok: false; error: ApiError }

// Instantiation 2: Result<Post, string>
type PostResult = Result<Post, string>;
// Completely different type!

// These are SEPARATE types in TypeScript's type system
// UserResult ≠ PostResult
```

### Higher-Kinded Types Limitation

TypeScript does NOT support higher-kinded types (types that take types that take types):

```typescript
// ❌ NOT possible in TypeScript
type Functor<F<_>> = {
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
};

// This would allow:
// Functor<Array>, Functor<Promise>, Functor<Option>

// ✅ Workaround: Use specific types
interface ArrayFunctor {
  map<A, B>(arr: A[], fn: (a: A) => B): B[];
}

interface PromiseFunctor {
  map<A, B>(promise: Promise<A>, fn: (a: A) => B): Promise<B>;
}
```

### Generic Constraint Resolution

When you use `extends`, TypeScript performs structural checking:

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length);
}

// What TypeScript checks:
// 1. Does the argument structurally satisfy HasLength?
// 2. It must have a 'length' property of type number

logLength([1, 2, 3]);          // ✅ Array has length: number
logLength('hello');            // ✅ String has length: number
logLength({ length: 10 });      // ✅ Object literal with length
logLength({ length: 10, x: 1 }); // ✅ Extra properties OK (structural)

// NOT nominal typing:
class MyLength {
  length: number = 5;
}
logLength(new MyLength());  // ✅ Works even though MyLength doesn't explicitly implement HasLength
```

### Performance Implications

Generics have ZERO runtime overhead (they're erased), but complex generic types can slow down **compilation**:

```typescript
// Simple generic - fast compilation
type Identity<T> = T;

// Complex recursive generic - slower compilation
type DeepPartial<T> = {
  [K in keyof T]: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K] | undefined;
};

// Very complex - can significantly slow down IDE
type Ultra<T> =
  T extends any[]
    ? UltraArray<T>
    : T extends object
      ? UltraObject<T>
      : T;

type UltraArray<T> = T extends (infer U)[]
  ? Ultra<U>[]
  : never;

type UltraObject<T> = {
  [K in keyof T]: Ultra<T[K]>
};

// On a large codebase with hundreds of usages,
// TypeScript can take 10-30s to compile instead of 2-5s
```

**TypeScript Compiler Metrics (typical project with heavy generics):**

- **Simple generics**: +5-10ms per 100 usages
- **Mapped types with generics**: +50-100ms per 100 usages
- **Recursive conditional types**: +200-500ms per 100 usages
- **Deep inference chains (5+ levels)**: +1-2s per 100 usages

**Compilation Performance Tips:**

```typescript
// ❌ BAD: Deep inference chain
type GetReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R extends Promise<infer U>
      ? U extends { data: infer D }
        ? D extends Array<infer E>
          ? E
          : D
        : U
      : R
    : never;

// ✅ BETTER: Break into smaller types
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type UnwrapData<T> = T extends { data: infer D } ? D : T;
type UnwrapArray<T> = T extends Array<infer E> ? E : T;

type GetReturnTypeFast<T> =
  T extends (...args: any[]) => infer R
    ? UnwrapArray<UnwrapData<UnwrapPromise<R>>>
    : never;

// Faster because TypeScript can cache intermediate results
```

---

## 🐛 Real-World Scenario: Generic Type Inference Fails in Production API Client

### The Problem

A fintech company building a type-safe API client ran into a critical bug where generic type inference failed for nested response types, causing runtime errors in production that weren't caught by TypeScript.

**Production Impact:**
- **Incident Duration**: 3 hours
- **Affected Users**: 45,000 customers (Payment dashboard)
- **Failed Requests**: 127,000 API calls returned undefined
- **Data Loss**: $2.3M in payment data temporarily inaccessible
- **Detection**: Customer support tickets increased 800% in 15 minutes

### The Code

```typescript
// ❌ PROBLEMATIC: Generic API client (initial implementation)
class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const data = await response.json();
    return data;  // TypeScript trusts this is T, but no runtime validation!
  }
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    total: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// Usage in component
const client = new ApiClient();

async function loadPayments() {
  // Developer expects: ApiResponse<Payment[]>
  // TypeScript infers: Promise<ApiResponse<Payment[]>>
  const response = await client.get<ApiResponse<Payment[]>>('/payments');

  // But API ACTUALLY returned (changed by backend team):
  // { payments: [...], success: true }
  // NOT: { data: [...], success: true }

  // This line crashes at runtime:
  const payments = response.data;  // undefined

  // This causes cascading failures:
  payments.forEach(payment => {
    // TypeError: Cannot read property 'forEach' of undefined
    renderPayment(payment);
  });
}
```

### Root Cause Analysis

**Why TypeScript Didn't Catch This:**

1. **Generic type parameters are compile-time only** - erased at runtime
2. **No runtime validation** - TypeScript trusts `response.json()` returns `T`
3. **Backend API changed** - response shape changed without updating types
4. **Type assertion trust** - Generics created false sense of safety

**Timeline of Failure:**

```
09:00 AM - Backend team deploys API change (wraps data in 'payments' key)
09:15 AM - Frontend deploys unchanged (still expects 'data' key)
09:30 AM - First production errors start appearing
09:35 AM - Customer support tickets spike
10:00 AM - Engineering team identifies mismatch
10:30 AM - Hotfix deployed
12:00 PM - Full resolution and postmortem
```

### The Fix: Runtime Validation with Generics

```typescript
// ✅ SOLUTION: Zod schema validation with generics
import { z } from 'zod';

// Define runtime schemas
const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string()
});

const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    pagination: z.object({
      page: z.number(),
      total: z.number()
    }).optional()
  });

// Improved API Client
class SafeApiClient {
  async get<T>(
    endpoint: string,
    schema: z.ZodType<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const json = await response.json();

    try {
      // Runtime validation!
      const validated = schema.parse(json);
      return validated;
    } catch (error) {
      // Log schema mismatch for monitoring
      this.logValidationError(endpoint, error, json);
      throw new ApiValidationError(
        `API response doesn't match expected schema for ${endpoint}`,
        error
      );
    }
  }

  private logValidationError(endpoint: string, error: any, data: any) {
    // Send to monitoring service
    logger.error('API_SCHEMA_MISMATCH', {
      endpoint,
      expected: error.issues,
      received: data,
      timestamp: new Date().toISOString()
    });
  }
}

// Usage
const client = new SafeApiClient();

async function loadPaymentsSafe() {
  const schema = ApiResponseSchema(z.array(PaymentSchema));

  try {
    const response = await client.get('/payments', schema);
    // If we reach here, response.data is GUARANTEED to match Payment[]
    const payments = response.data;

    payments.forEach(payment => {
      renderPayment(payment);  // ✅ Safe
    });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      // Show user-friendly error
      showError('Payment data format error. Please contact support.');

      // Alert engineering team
      alertOnCall(error);
    }
  }
}
```

### Metrics After Fix

**Before (broken generics):**
- **Mean Time to Detection (MTTD)**: 30 minutes
- **Mean Time to Resolution (MTTR)**: 3 hours
- **False type safety**: 100% (TypeScript didn't catch backend changes)
- **Production errors**: ~127,000 failed requests

**After (validated generics):**
- **MTTD**: 2 minutes (caught in staging with validation)
- **MTTR**: 0 (prevented before production)
- **Schema mismatch detection**: 100% caught at runtime
- **Production errors**: 0 schema-related failures in 6 months

**Cost Savings:**
- **Engineering time**: 12 hours/month → 1 hour/month on API bugs
- **Support tickets**: 80% reduction in "data not loading" issues
- **Customer trust**: NPS score improved from 42 to 68

### Debugging Steps

```typescript
// 1. Add runtime type checking
function debugGenericInference<T>(
  value: unknown,
  expectedType: string
): value is T {
  console.log('Expected:', expectedType);
  console.log('Received:', typeof value, value);

  // Check structure
  if (typeof value === 'object' && value !== null) {
    console.log('Keys:', Object.keys(value));
  }

  return true;  // For debugging only
}

// 2. Conditional validation based on environment
async function getWithValidation<T>(
  endpoint: string,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await fetch(endpoint);
  const data = await response.json();

  // Validate in development/staging
  if (process.env.NODE_ENV !== 'production' && schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error('Schema validation failed:', result.error);
      // Still throw in development to catch early
      throw new Error('Schema mismatch detected');
    }
  }

  // Always validate in production (fail gracefully)
  if (process.env.NODE_ENV === 'production' && schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      logToMonitoring('schema_mismatch', { endpoint, error: result.error });
      // Return safe default or throw based on criticality
    }
  }

  return data;
}
```

### Key Lessons

1. **Generics ≠ Runtime Safety**: Type parameters are erased at runtime
2. **Trust but Verify**: Validate external data even with strong types
3. **Schema as Documentation**: Runtime schemas document API contracts
4. **Progressive Enhancement**: Add validation without breaking existing code
5. **Monitoring is Critical**: Track schema mismatches as key metrics

---

## ⚖️ Trade-offs: When to Use Generics vs Alternatives

### Decision Matrix: Generics vs Other Approaches

| Scenario | Use Generics | Use Union Types | Use Any | Use Overloads |
|----------|--------------|-----------------|---------|---------------|
| **Reusable data structures** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Type must be preserved** | ✅ Yes | ⚠️ Maybe | ❌ No | ✅ Yes |
| **Limited known types (2-3)** | ⚠️ Overkill | ✅ Yes | ❌ No | ✅ Yes |
| **Dynamic/unknown types** | ❌ No | ❌ No | ⚠️ Temp | ❌ No |
| **Library/API code** | ✅ Yes | ❌ No | ❌ No | ⚠️ Maybe |
| **Simple application code** | ⚠️ Maybe | ✅ Yes | ❌ No | ❌ No |

### Trade-off 1: Generic Functions vs Function Overloads

**Scenario:** Type-safe event emitter

```typescript
// APPROACH 1: Generics
class GenericEventEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<keyof TEvents, Function[]>();

  on<K extends keyof TEvents>(
    event: K,
    callback: (data: TEvents[K]) => void
  ): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Usage
type Events = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'payment:complete': { amount: number; currency: string };
};

const emitter = new GenericEventEmitter<Events>();

emitter.on('user:login', (data) => {
  // data is typed as { userId: string; timestamp: number }
  console.log(data.userId);
});

emitter.emit('user:login', {
  userId: '123',
  timestamp: Date.now()
});  // ✅ Type-safe

// emitter.emit('user:login', { userId: '123' });
// ❌ Error: missing timestamp

// APPROACH 2: Function Overloads
class OverloadEventEmitter {
  private listeners = new Map<string, Function[]>();

  // Overload signatures
  on(event: 'user:login', callback: (data: { userId: string; timestamp: number }) => void): void;
  on(event: 'user:logout', callback: (data: { userId: string }) => void): void;
  on(event: 'payment:complete', callback: (data: { amount: number; currency: string }) => void): void;

  // Implementation
  on(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
  }

  // Same overloads for emit...
  emit(event: 'user:login', data: { userId: string; timestamp: number }): void;
  emit(event: 'user:logout', data: { userId: string }): void;
  emit(event: 'payment:complete', data: { amount: number; currency: string }): void;

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

const emitter2 = new OverloadEventEmitter();
emitter2.on('user:login', (data) => {
  console.log(data.userId);  // ✅ Typed
});
```

**Comparison:**

| Aspect | Generics | Overloads |
|--------|----------|-----------|
| **Extensibility** | ✅ Easy (just update `TEvents` type) | ❌ Must add new overload signature |
| **Code size** | ✅ Smaller (one implementation) | ❌ Larger (duplicate signatures) |
| **Autocomplete** | ✅ Excellent (IDE knows all events) | ✅ Excellent (explicit signatures) |
| **Type safety** | ✅ 100% type-safe | ✅ 100% type-safe |
| **Learning curve** | ⚠️ Medium (requires understanding generics) | ✅ Easy (straightforward) |
| **Maintenance** | ✅ Single source of truth | ❌ Must update multiple places |

**Verdict:** Use generics for extensible APIs, overloads for fixed small sets (2-4 variations).

### Trade-off 2: Generic Constraints vs Union Types

**Scenario:** Function that works with shapes

```typescript
// APPROACH 1: Generic Constraint
interface Shape {
  area(): number;
}

function calculateTotalArea<T extends Shape>(shapes: T[]): number {
  return shapes.reduce((total, shape) => total + shape.area(), 0);
}

// Can accept ANY type that implements Shape
class Circle implements Shape {
  constructor(private radius: number) {}
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area() { return this.width * this.height; }
}

class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  area() { return (this.base * this.height) / 2; }
}

const circles = [new Circle(5), new Circle(10)];
const rectangles = [new Rectangle(4, 5), new Rectangle(2, 3)];

calculateTotalArea(circles);      // ✅ Works
calculateTotalArea(rectangles);   // ✅ Works
calculateTotalArea([...circles, ...rectangles]);  // ✅ Works

// APPROACH 2: Union Types
type ShapeUnion = Circle | Rectangle | Triangle;

function calculateTotalAreaUnion(shapes: ShapeUnion[]): number {
  return shapes.reduce((total, shape) => total + shape.area(), 0);
}

// Works with known types
calculateTotalAreaUnion([new Circle(5), new Rectangle(4, 5)]);  // ✅

// But NOT extensible
class Hexagon {
  constructor(private side: number) {}
  area() { return (3 * Math.sqrt(3) / 2) * this.side ** 2; }
}

// calculateTotalAreaUnion([new Hexagon(5)]);
// ❌ Error: Hexagon is not assignable to ShapeUnion
```

**Comparison:**

| Aspect | Generic Constraint | Union Type |
|--------|-------------------|------------|
| **Extensibility** | ✅ Open (any type can implement) | ❌ Closed (must be in union) |
| **Type preservation** | ✅ Preserves exact type `T` | ❌ Widens to union |
| **Library code** | ✅ Perfect for libraries | ⚠️ Forces consumers to modify library |
| **Performance (compile)** | ✅ Fast | ⚠️ Slower with large unions |
| **IDE autocomplete** | ⚠️ Generic (less specific) | ✅ Shows exact types |

**Verdict:** Use generic constraints for open/extensible APIs, unions for closed sets of known types.

### Trade-off 3: Complex Generics vs Runtime Validation

**Scenario:** Deeply nested API response parsing

```typescript
// APPROACH 1: Complex Generic Types
type ApiResponse<T> = {
  data: T;
  meta: {
    timestamp: number;
    version: string;
  };
};

type Paginated<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

type WithRelations<T, R extends Record<string, any>> = T & {
  relations: R;
};

// Deeply nested type
type UserWithPostsResponse = ApiResponse<
  Paginated<
    WithRelations<
      User,
      { posts: Post[]; comments: Comment[] }
    >
  >
>;

// Usage
async function getUsers(): Promise<UserWithPostsResponse> {
  const response = await fetch('/api/users');
  return response.json();  // TypeScript trusts this matches
}

// APPROACH 2: Runtime Validation with Simple Types
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string()
});

const ResponseSchema = z.object({
  data: z.object({
    items: z.array(
      UserSchema.extend({
        relations: z.object({
          posts: z.array(PostSchema),
          comments: z.array(z.any())
        })
      })
    ),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number()
    })
  }),
  meta: z.object({
    timestamp: z.number(),
    version: z.string()
  })
});

async function getUsersValidated() {
  const response = await fetch('/api/users');
  const json = await response.json();

  // Throws if data doesn't match schema
  const validated = ResponseSchema.parse(json);
  return validated;
}
```

**Performance Comparison:**

| Metric | Complex Generics | Runtime Validation |
|--------|------------------|-------------------|
| **Compile time** (1000 usages) | 2-5 seconds | 0.5-1 second |
| **Runtime overhead** | 0ms | 5-20ms per validation |
| **Bundle size** | +0kb | +40kb (Zod library) |
| **Type safety (compile)** | ✅ 100% | ✅ 100% |
| **Type safety (runtime)** | ❌ 0% | ✅ 100% |
| **Catches API changes** | ❌ No | ✅ Yes |
| **Developer experience** | ⚠️ Complex types hard to debug | ✅ Clear error messages |

**Cost-Benefit Analysis:**

```
Complex Generics:
+ No runtime cost
+ No bundle size increase
- No runtime validation
- Slow compile times
- Hard to debug type errors
- False sense of security

Runtime Validation:
+ Catches actual bugs
+ Clear error messages
+ Fast compilation
- Small runtime cost (5-20ms)
- Larger bundle (+40kb)
+ Worth it for critical data flows
```

**Verdict:**

- **Use complex generics**: Internal type transformations, compile-time guarantees
- **Use runtime validation**: External API boundaries, user input, critical data
- **Best approach**: Combine both (generics for DX, validation for safety)

### Trade-off 4: Generic Classes vs Composition

**Scenario:** Configurable cache implementation

```typescript
// APPROACH 1: Generic Class
class Cache<T> {
  private store = new Map<string, { value: T; expires: number }>();

  set(key: string, value: T, ttl: number): void {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  get(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expires) {
      this.store.delete(key);
      return undefined;
    }

    return item.value;
  }
}

// Separate cache instance per type
const userCache = new Cache<User>();
const postCache = new Cache<Post>();

userCache.set('user:1', { id: '1', name: 'John' }, 60000);
const user = userCache.get('user:1');  // Type: User | undefined

// APPROACH 2: Composition with Type Guards
class UnifiedCache {
  private store = new Map<string, { value: unknown; expires: number; type: string }>();

  set<T>(key: string, value: T, ttl: number, type: string): void {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl,
      type
    });
  }

  get<T>(key: string, guard: (val: unknown) => val is T): T | undefined {
    const item = this.store.get(key);
    if (!item || Date.now() > item.expires) {
      this.store.delete(key);
      return undefined;
    }

    return guard(item.value) ? item.value : undefined;
  }

  // Shared statistics across all types
  getStats() {
    return {
      total: this.store.size,
      byType: Array.from(this.store.values()).reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Type guards
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'name' in val;
}

// Single cache instance
const cache = new UnifiedCache();

cache.set('user:1', { id: '1', name: 'John' }, 60000, 'user');
const user2 = cache.get('user:1', isUser);  // Type: User | undefined

// Can get unified stats
console.log(cache.getStats());  // { total: 1, byType: { user: 1 } }
```

**Comparison:**

| Aspect | Generic Class | Composition |
|--------|---------------|-------------|
| **Memory usage** | ⚠️ N instances (1 per type) | ✅ 1 instance |
| **Type safety** | ✅ Automatic | ⚠️ Requires guards |
| **Cross-type operations** | ❌ Difficult | ✅ Easy |
| **Code complexity** | ✅ Simple | ⚠️ More boilerplate |
| **Performance** | ✅ Slightly faster | ⚠️ Guard overhead |

**Verdict:** Generic classes for isolation, composition for unified management.

---

## 💬 Explain to Junior: Understanding TypeScript Generics Like a Pro

### The Box Analogy

Imagine you're organizing a warehouse with different types of boxes:

**Without Generics (The Old Way):**

```typescript
// You need a different box type for EVERY item
class StringBox {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

class NumberBox {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

class UserBox {
  value: User;
  constructor(value: User) {
    this.value = value;
  }
}

// This is exhausting! You need hundreds of box types!
```

**With Generics (The Smart Way):**

```typescript
// ONE box design that works for ANY type
class Box<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

// Same box, different contents
const stringBox = new Box<string>('hello');
const numberBox = new Box<number>(42);
const userBox = new Box<User>({ id: '1', name: 'John' });

// TypeScript remembers what's in each box!
const str = stringBox.value;  // TypeScript knows this is a string
const num = numberBox.value;  // TypeScript knows this is a number
```

**The Magic:** `<T>` is like a label maker. When you create `Box<string>`, TypeScript automatically labels that box as "contains strings" everywhere in the code.

### Real-World Example: A Type-Safe Playlist

Let's build a playlist that can hold different types of media:

```typescript
// Step 1: Define our generic Playlist
class Playlist<MediaType> {
  private items: MediaType[] = [];

  add(item: MediaType): void {
    this.items.push(item);
    console.log(`Added to playlist!`);
  }

  getAll(): MediaType[] {
    return this.items;
  }

  play(index: number): MediaType | undefined {
    return this.items[index];
  }
}

// Step 2: Define different media types
interface Song {
  title: string;
  artist: string;
  duration: number;  // in seconds
}

interface Podcast {
  title: string;
  host: string;
  episode: number;
  duration: number;
}

interface Video {
  title: string;
  channel: string;
  duration: number;
  resolution: '1080p' | '4K';
}

// Step 3: Create type-safe playlists
const musicPlaylist = new Playlist<Song>();
musicPlaylist.add({
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  duration: 354
});

const podcastPlaylist = new Playlist<Podcast>();
podcastPlaylist.add({
  title: 'TypeScript Deep Dive',
  host: 'John Doe',
  episode: 42,
  duration: 3600
});

// Step 4: TypeScript prevents mistakes!
const currentSong = musicPlaylist.play(0);
if (currentSong) {
  console.log(currentSong.artist);  // ✅ TypeScript knows this exists
  // console.log(currentSong.host);  // ❌ Error: Songs don't have 'host'
}

const currentPodcast = podcastPlaylist.play(0);
if (currentPodcast) {
  console.log(currentPodcast.host);     // ✅ TypeScript knows this exists
  console.log(currentPodcast.episode);  // ✅ This too
}

// Step 5: This won't compile (type safety!)
// musicPlaylist.add({ title: 'Not a song', host: 'Wrong' });
// ❌ Error: This doesn't match the Song interface
```

### Common Beginner Mistakes (and How to Avoid Them)

**Mistake #1: Using `any` Instead of Generics**

```typescript
// ❌ BAD: Loses all type information
function badGetFirst(arr: any[]): any {
  return arr[0];
}

const first = badGetFirst([1, 2, 3]);
first.toUpperCase();  // Runtime error! TypeScript doesn't warn

// ✅ GOOD: Preserves type information
function goodGetFirst<T>(arr: T[]): T {
  return arr[0];
}

const firstNumber = goodGetFirst([1, 2, 3]);
// firstNumber.toUpperCase();  // ❌ TypeScript error: number doesn't have toUpperCase
```

**Mistake #2: Forgetting Constraints**

```typescript
// ❌ BAD: Can't access properties without constraints
function badPrintLength<T>(item: T): void {
  // console.log(item.length);  // Error: T might not have 'length'
}

// ✅ GOOD: Use constraints
interface HasLength {
  length: number;
}

function goodPrintLength<T extends HasLength>(item: T): void {
  console.log(item.length);  // ✅ Safe! We know T has length
}

goodPrintLength('hello');       // ✅ Strings have length
goodPrintLength([1, 2, 3]);     // ✅ Arrays have length
// goodPrintLength(42);         // ❌ Error: Numbers don't have length
```

**Mistake #3: Over-Complicating Simple Code**

```typescript
// ❌ BAD: Using generics when you don't need them
function addNumbers<T extends number>(a: T, b: T): number {
  return a + b;  // Why use generics here?
}

// ✅ GOOD: Just use concrete types
function addNumbers(a: number, b: number): number {
  return a + b;
}

// Generics are for FLEXIBILITY, not simple operations
```

### Interview Answer Template

**When asked: "Explain generics in TypeScript"**

**Template Answer:**

> "Generics in TypeScript allow you to write reusable code that works with multiple types while maintaining type safety. Think of generics as parameters for types - just like function parameters accept values, generic type parameters accept types.
>
> For example, if I'm building a storage system, instead of creating separate `StringStorage`, `NumberStorage`, `UserStorage` classes, I create one `Storage<T>` class where `T` is a placeholder for any type. When I instantiate it as `new Storage<User>()`, TypeScript automatically knows all operations on that instance work with the `User` type.
>
> The key benefits are:
> 1. **Code reuse** - Write once, use with many types
> 2. **Type safety** - No need for type assertions or `any`
> 3. **Better IDE support** - Autocomplete works correctly
> 4. **Maintainability** - Single source of truth
>
> Common use cases include data structures (arrays, maps), API clients, React components with typed props, and utility functions like `Promise<T>` or `Array<T>`.
>
> The important thing to remember is that generics are compile-time only - they're erased at runtime. So for runtime validation of external data like API responses, you still need runtime checks even with generics."

**Follow-up: "When should you NOT use generics?"**

> "Don't use generics when:
> 1. You're working with a fixed set of 2-3 known types - union types or overloads are simpler
> 2. The code isn't reusable - generics add complexity without benefit
> 3. You need runtime type information - generics are erased at runtime
> 4. Simple operations on concrete types - `function add(a: number, b: number)` doesn't need generics
>
> Generics are powerful but they add cognitive overhead. Only use them when you're actually solving a reusability or type preservation problem."

### Practice Exercise (Junior-Friendly)

**Challenge:** Build a type-safe queue data structure

```typescript
// Your task: Implement this Queue class with generics
class Queue<T> {
  private items: T[] = [];

  // Add item to end of queue
  enqueue(item: T): void {
    // TODO: implement
  }

  // Remove and return item from front of queue
  dequeue(): T | undefined {
    // TODO: implement
  }

  // Look at front item without removing
  peek(): T | undefined {
    // TODO: implement
  }

  // Check if queue is empty
  isEmpty(): boolean {
    // TODO: implement
  }

  // Get queue size
  size(): number {
    // TODO: implement
  }
}

// Test your implementation
const numberQueue = new Queue<number>();
numberQueue.enqueue(1);
numberQueue.enqueue(2);
numberQueue.enqueue(3);

console.log(numberQueue.dequeue());  // Should print: 1
console.log(numberQueue.peek());     // Should print: 2
console.log(numberQueue.size());     // Should print: 2

const stringQueue = new Queue<string>();
stringQueue.enqueue('hello');
stringQueue.enqueue('world');
console.log(stringQueue.dequeue());  // Should print: 'hello'
```

**Solution:**

```typescript
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
```

**Key Takeaway:** Generics let you build ONE data structure that works type-safely with ANY type. That's the power of `<T>`!

---


## Question 2: What Are Generic Constraints and How Do You Use Them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Microsoft, Amazon, Shopify

### Question
Explain generic constraints in TypeScript. Why are they needed and how do you implement them?

### Answer

**Generic constraints** allow you to restrict the types that can be used with a generic. Instead of accepting ANY type, you specify that the type must have certain properties or extend a specific type.

**Key Points:**

1. **Syntax** - Use `extends` keyword: `<T extends Type>`
2. **Safety** - Access properties/methods safely within generic code
3. **Documentation** - Makes requirements clear to users
4. **Flexibility** - Still generic, but with minimum requirements
5. **Common Use** - API contracts, utility functions, React props

### Code Example

```typescript
// 1. BASIC CONSTRAINT
interface HasId {
  id: number;
}

function printId<T extends HasId>(obj: T): void {
  console.log(obj.id);  // ✅ Safe: we know T has id
}

printId({ id: 1, name: 'John' });     // ✅ Works
printId({ id: 2, age: 25 });          // ✅ Works
// printId({ name: 'John' });         // ❌ Error: no id property

// 2. CONSTRAINING TO PRIMITIVE TYPES
function toArray<T extends string | number>(value: T): T[] {
  return [value];
}

toArray('hello');   // ✅ string[]
toArray(42);        // ✅ number[]
// toArray(true);   // ❌ Error: boolean not allowed

// 3. KEYOF CONSTRAINT (very common pattern)
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
};

const name = getProperty(person, 'name');    // type: string
const age = getProperty(person, 'age');      // type: number
// getProperty(person, 'salary');            // ❌ Error: 'salary' doesn't exist

// 4. MULTIPLE CONSTRAINTS
interface Identifiable {
  id: number;
}

interface Nameable {
  name: string;
}

function process<T extends Identifiable & Nameable>(item: T): string {
  return `${item.id}: ${item.name}`;
}

process({ id: 1, name: 'Item 1' });                    // ✅ Works
process({ id: 2, name: 'Item 2', extra: 'data' });     // ✅ Works
// process({ id: 1 });                                 // ❌ Error: missing name
// process({ name: 'Item' });                          // ❌ Error: missing id

// 5. REAL-WORLD: CRUD OPERATIONS
interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class Repository<T extends Entity> {
  private items: Map<number, T> = new Map();

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date();
    const newItem = {
      ...item,
      id: this.items.size + 1,
      createdAt: now,
      updatedAt: now
    } as T;

    this.items.set(newItem.id, newItem);
    return newItem;
  }

  findById(id: number): T | undefined {
    return this.items.get(id);
  }

  update(id: number, updates: Partial<T>): T | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated = {
      ...item,
      ...updates,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }

  delete(id: number): boolean {
    return this.items.delete(id);
  }
}

// Usage with specific entity
interface User extends Entity {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const userRepo = new Repository<User>();
const user = userRepo.create({
  name: 'John',
  email: 'john@example.com',
  role: 'user'
});
// TypeScript automatically adds id, createdAt, updatedAt

// 6. CONSTRUCTOR CONSTRAINT
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}

class Dog {
  bark() {
    return 'Woof!';
  }
}

const dog = createInstance(Dog);
dog.bark();  // ✅ Works, type is Dog

// 7. ARRAY ELEMENT CONSTRAINT
function getFirst<T extends any[]>(arr: T): T[0] {
  return arr[0];
}

const first = getFirst([1, 2, 3]);     // type: number
const name = getFirst(['a', 'b']);     // type: string
```

### Common Mistakes

```typescript
// ❌ WRONG: Not using constraint when needed
function merge<T, U>(obj1: T, obj2: U) {
  return { ...obj1, ...obj2 };  // Only works with objects
}

merge({ a: 1 }, { b: 2 });   // ✅ Works
merge('hello', 'world');     // ❌ Runtime error, but TypeScript allows it

// ✅ CORRECT: Constrain to objects
function mergeSafe<T extends object, U extends object>(obj1: T, obj2: U) {
  return { ...obj1, ...obj2 };
}

// mergeSafe('hello', 'world');  // ❌ Compile error caught early

// ❌ WRONG: Over-constraining unnecessarily
function length<T extends string>(str: T): number {
  return str.length;  // We constrained to string, so it's not really generic
}

// ✅ CORRECT: Use proper constraint
function lengthSafe<T extends { length: number }>(item: T): number {
  return item.length;  // Works with strings, arrays, anything with length
}
```

### Follow-up Questions
1. How do you use `keyof` with generics?
2. What's the difference between `T extends U` and `T & U`?
3. Can you have default values for generic type parameters?

### Resources
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Using Type Parameters in Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints)

---

## 🔍 Deep Dive: Generic Constraint Mechanics and Advanced Patterns

### How TypeScript Resolves Generic Constraints

When you use `T extends SomeType`, TypeScript performs **structural subtype checking** at compile time. This is fundamentally different from nominal typing (like Java interfaces).

**Constraint Resolution Process:**

```typescript
// Step-by-step: How TypeScript checks constraints

interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// CASE 1: String literal
logLength('hello');

// TypeScript's process:
// 1. Infer T from argument → T = "hello" (literal type)
// 2. Check: Does "hello" extend Lengthwise?
// 3. Check: Does string have property 'length: number'? YES
// 4. Accept ✅

// CASE 2: Custom object
logLength({ length: 5, extra: 'data' });

// TypeScript's process:
// 1. Infer T → T = { length: number; extra: string }
// 2. Check: Does T extend Lengthwise?
// 3. Check: Does T have property 'length: number'? YES
// 4. Extra properties? ALLOWED (structural typing)
// 5. Accept ✅

// CASE 3: Number
// logLength(42);

// TypeScript's process:
// 1. Infer T → T = number
// 2. Check: Does number extend Lengthwise?
// 3. Check: Does number have 'length' property? NO
// 4. Reject ❌ Compile error
```

### Multiple Constraint Patterns

**1. Intersection Constraints (AND logic):**

```typescript
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

// T must satisfy BOTH constraints
function introduce<T extends Named & Aged>(person: T): string {
  return `${person.name} is ${person.age} years old`;
}

introduce({ name: 'John', age: 30 });           // ✅
introduce({ name: 'John', age: 30, job: 'dev' }); // ✅ Extra props OK
// introduce({ name: 'John' });                 // ❌ Missing 'age'
// introduce({ age: 30 });                      // ❌ Missing 'name'
```

**2. Conditional Constraint Narrowing:**

```typescript
// Advanced: Constraint depends on another type parameter
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// Both T and U must be objects
const result = merge({ a: 1 }, { b: 2 });  // { a: number; b: number }

// merge({ a: 1 }, 'string');  // ❌ Error: string is not assignable to object
```

**3. Recursive Generic Constraints:**

```typescript
// T must be an object with values that extend T (recursive)
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : DeepReadonly<T[K]>
    : T[K];
};

interface User {
  name: string;
  address: {
    street: string;
    city: string;
  };
  hobbies: string[];
}

type ReadonlyUser = DeepReadonly<User>;
// All nested properties are readonly, arrays become ReadonlyArray
```

### KeyOf Constraint Pattern (Type-Safe Property Access)

The `keyof` constraint is one of the most powerful patterns in TypeScript:

```typescript
// Basic keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30, email: 'john@example.com' };

const name = getProperty(user, 'name');    // Type: string
const age = getProperty(user, 'age');      // Type: number
// getProperty(user, 'salary');            // ❌ Error: 'salary' is not a key of user

// Advanced: Multiple key access
function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

const picked = pick(user, 'name', 'email');
// Type: { name: string; email: string }

// Advanced: Exclude certain keys
type Writeable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
  age: number;
}

type MutableUser = Writeable<ReadonlyUser>;
// All properties become mutable
```

### Constructor Type Constraints

You can constrain generics to types that have constructors:

```typescript
// Constraint: T must be constructible with new()
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}

class Dog {
  bark() { return 'Woof!'; }
}

const dog = createInstance(Dog);  // Type: Dog
dog.bark();  // ✅ Works

// Advanced: Constructor with parameters
function createInstanceWithArgs<T>(
  Constructor: new (...args: any[]) => T,
  ...args: any[]
): T {
  return new Constructor(...args);
}

class Person {
  constructor(public name: string, public age: number) {}
}

const person = createInstanceWithArgs(Person, 'John', 30);
console.log(person.name);  // 'John'

// Even more advanced: Type-safe constructor parameters
function createTypedInstance<T, Args extends any[]>(
  Constructor: new (...args: Args) => T,
  ...args: Args
): T {
  return new Constructor(...args);
}

// TypeScript infers Args from Constructor signature
const person2 = createTypedInstance(Person, 'Jane', 25);
// createTypedInstance(Person, 'Jane', '25');  // ❌ Error: '25' is not a number
```

### Generic Constraint Inheritance

Constraints can build upon each other:

```typescript
// Base constraint
interface Entity {
  id: number;
}

// Extended constraint
interface Timestamped extends Entity {
  createdAt: Date;
  updatedAt: Date;
}

// Function with base constraint
function findById<T extends Entity>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Function with extended constraint
function findRecent<T extends Timestamped>(
  items: T[],
  hours: number
): T[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return items.filter(item => item.createdAt.getTime() > cutoff);
}

// Works with any Timestamped entity
interface User extends Timestamped {
  name: string;
  email: string;
}

interface Post extends Timestamped {
  title: string;
  content: string;
}

const users: User[] = [/* ... */];
const recentUsers = findRecent(users, 24);  // Users created in last 24h
```

### Performance Characteristics of Constraints

Generic constraints have different performance impacts on compilation:

```typescript
// FAST: Simple property constraint
interface HasId {
  id: string;
}

function simple<T extends HasId>(item: T) {
  return item.id;
}
// Compilation: ~0.1ms per usage

// MEDIUM: keyof constraint
function medium<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
// Compilation: ~0.5ms per usage (must compute keyof)

// SLOW: Complex conditional constraint
type ComplexConstraint<T> = T extends Array<infer U>
  ? U extends object
    ? { [K in keyof U]: U[K] extends Function ? never : U[K] }
    : never
  : never;

function slow<T extends any[]>(arr: T): ComplexConstraint<T> {
  // Complex type operations
  return null as any;
}
// Compilation: ~5-10ms per usage (deep type operations)
```

### Constraint Variance and Type Safety

Constraints affect how generic types relate to each other:

```typescript
// Covariant constraint (safe for readonly)
interface Box<T extends object> {
  readonly value: T;
}

class Animal { name: string; }
class Dog extends Animal { bark(): void {} }

const dogBox: Box<Dog> = { value: new Dog() };
const animalBox: Box<Animal> = dogBox;  // ✅ Covariant (safe)

// Invariant constraint (unsafe for mutable)
interface MutableBox<T extends object> {
  value: T;
  setValue(val: T): void;
}

const mutableDogBox: MutableBox<Dog> = {
  value: new Dog(),
  setValue(d: Dog) {}
};

// const mutableAnimalBox: MutableBox<Animal> = mutableDogBox;
// ❌ Error: Invariant position (type safety violation)

// Why unsafe?
class Cat extends Animal { meow(): void {} }
// If assignment was allowed:
// mutableAnimalBox.setValue(new Cat());  // Would break dogBox!
```

### Default Type Parameters with Constraints

You can provide default values for constrained generics:

```typescript
// Default type parameter
interface ApiResponse<T = unknown, E = Error> {
  data?: T;
  error?: E;
  status: number;
}

// Can omit type arguments
const response1: ApiResponse = { status: 200 };
// Type: ApiResponse<unknown, Error>

// Can provide just first argument
const response2: ApiResponse<User> = { status: 200, data: { id: '1', name: 'John' } };
// Type: ApiResponse<User, Error>

// With constraints
interface Repository<T extends Entity = Entity> {
  find(id: number): T | undefined;
  save(item: T): void;
}

// Generic repository
const repo1: Repository = { /* ... */ };
// Type: Repository<Entity>

// Specific repository
const userRepo: Repository<User> = { /* ... */ };
// Type: Repository<User>
```

---

## 🐛 Real-World Scenario: Generic Constraint Bugs in E-Commerce Search

### The Problem

An e-commerce platform implemented a generic search function with incorrect constraints, causing a production bug where product searches returned invalid results. The type system didn't catch the error because the constraint was too loose.

**Production Impact:**
- **Incident Duration**: 6 hours
- **Affected Users**: 230,000 customers
- **Search Results**: 78% of searches returned wrong products
- **Revenue Loss**: $450,000 in lost sales
- **Customer Complaints**: 12,000+ support tickets
- **SEO Impact**: Google Search Console errors increased 300%

### The Code

```typescript
// ❌ PROBLEMATIC: Too loose generic constraint
interface Searchable {
  // Missing critical constraints!
}

class SearchEngine<T extends Searchable> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  // BUG: Assumes all T have searchable properties
  search(query: string): T[] {
    return this.items.filter(item => {
      // Runtime error: 'name' might not exist on T!
      const name = (item as any).name?.toLowerCase() || '';
      const description = (item as any).description?.toLowerCase() || '';
      return name.includes(query.toLowerCase()) ||
             description.includes(query.toLowerCase());
    });
  }

  // BUG: Assumes all T can be sorted by price
  sortByPrice(): T[] {
    return [...this.items].sort((a, b) => {
      // Runtime error: 'price' might not exist!
      return ((a as any).price || 0) - ((b as any).price || 0);
    });
  }
}

// Developer creates search engine for products
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
}

const productSearch = new SearchEngine<Product>();

// Works fine initially
productSearch.add({
  id: '1',
  name: 'Laptop',
  description: 'Gaming laptop',
  price: 1200,
  inStock: true
});

const results = productSearch.search('laptop');  // ✅ Works

// BUT THEN... another developer uses it for categories
interface Category {
  id: string;
  categoryName: string;  // Different property name!
  slug: string;
}

const categorySearch = new SearchEngine<Category>();

categorySearch.add({
  id: 'electronics',
  categoryName: 'Electronics',
  slug: 'electronics'
});

// BUG: Search doesn't work because Category has 'categoryName', not 'name'!
const categoryResults = categorySearch.search('electronics');
console.log(categoryResults);  // [] - Empty! Users see "No results found"

// BUG: Sort crashes because Category has no 'price'
const sorted = categorySearch.sortByPrice();
// Returns [{ id: 'electronics', categoryName: 'Electronics', slug: 'electronics' }]
// Sorted by 0 - 0, meaningless!
```

### Root Cause Analysis

**Why TypeScript Didn't Catch This:**

1. **Empty constraint** - `Searchable` interface had no required properties
2. **Type assertions** - Using `as any` bypassed type checking
3. **Optional chaining abuse** - `?.` hid the actual type mismatch
4. **No structural requirements** - Constraint didn't enforce shape of T

**Timeline of Failure:**

```
Monday 10:00 AM - Feature team adds Category search using SearchEngine
Monday 10:30 AM - Code review passes (TypeScript compiles without errors)
Monday 11:00 AM - Deployed to production
Monday 11:15 AM - First user reports: "Can't find electronics category"
Monday 12:00 PM - Support tickets increase rapidly
Monday 2:00 PM - Engineering investigates, finds constraint issue
Monday 4:00 PM - Hotfix deployed
Monday 5:00 PM - Full resolution, postmortem scheduled
```

### The Fix: Proper Generic Constraints

```typescript
// ✅ SOLUTION: Properly constrained generics

// Define what "searchable" actually means
interface Searchable {
  name: string;
  description: string;
}

// Define what "priceable" means
interface Priceable {
  price: number;
}

// Combine constraints
interface SearchableProduct extends Searchable, Priceable {
  id: string;
}

// Generic search engine with PROPER constraints
class SafeSearchEngine<T extends Searchable> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  // NOW type-safe: We KNOW T has name and description
  search(query: string): T[] {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item => {
      // ✅ TypeScript guarantees these exist
      const name = item.name.toLowerCase();
      const description = item.description.toLowerCase();
      return name.includes(lowerQuery) || description.includes(lowerQuery);
    });
  }

  // Separate method with additional constraint
  sortByPrice<U extends T & Priceable>(this: SafeSearchEngine<U>): U[] {
    return [...this.items].sort((a, b) => a.price - b.price);
  }

  // Method for custom sorting (flexible)
  sortBy<K extends keyof T>(key: K, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...this.items].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }
}

// Product conforms to SearchableProduct
interface Product extends SearchableProduct {
  inStock: boolean;
  category: string;
}

const productSearch = new SafeSearchEngine<Product>();

productSearch.add({
  id: '1',
  name: 'Laptop',
  description: 'Gaming laptop',
  price: 1200,
  inStock: true,
  category: 'electronics'
});

const results = productSearch.search('laptop');  // ✅ Works
const sorted = productSearch.sortByPrice();       // ✅ Works (Product has price)

// Category - needs adapter pattern
interface Category {
  id: string;
  categoryName: string;
  slug: string;
}

// Create adapter to make Category searchable
interface SearchableCategory extends Searchable {
  id: string;
  slug: string;
}

function categoryToSearchable(category: Category): SearchableCategory {
  return {
    id: category.id,
    name: category.categoryName,  // Map categoryName → name
    description: `Category: ${category.categoryName}`,
    slug: category.slug
  };
}

const categorySearch = new SafeSearchEngine<SearchableCategory>();

const electronicsCategory: Category = {
  id: 'electronics',
  categoryName: 'Electronics',
  slug: 'electronics'
};

// Adapt before adding
categorySearch.add(categoryToSearchable(electronicsCategory));

// NOW it works!
const categoryResults = categorySearch.search('electronics');
console.log(categoryResults);  // ✅ Returns results

// This CORRECTLY throws compile error:
// categorySearch.sortByPrice();
// ❌ Error: SearchableCategory doesn't extend Priceable
```

### Additional Safety: Runtime Validation

```typescript
// Combine compile-time constraints with runtime validation
import { z } from 'zod';

const SearchableSchema = z.object({
  name: z.string(),
  description: z.string()
});

const PriceableSchema = z.object({
  price: z.number().positive()
});

class ValidatedSearchEngine<T extends Searchable> {
  private items: T[] = [];
  private schema: z.ZodType<T>;

  constructor(schema: z.ZodType<T>) {
    this.schema = schema;
  }

  add(item: T): void {
    // Runtime validation
    try {
      const validated = this.schema.parse(item);
      this.items.push(validated);
    } catch (error) {
      throw new Error(`Invalid item: ${error}`);
    }
  }

  search(query: string): T[] {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item => {
      const name = item.name.toLowerCase();
      const description = item.description.toLowerCase();
      return name.includes(lowerQuery) || description.includes(lowerQuery);
    });
  }
}

// Define runtime + compile-time types
const ProductSchema = SearchableSchema.merge(PriceableSchema).extend({
  id: z.string(),
  inStock: z.boolean(),
  category: z.string()
});

type ValidatedProduct = z.infer<typeof ProductSchema>;

const safeProductSearch = new ValidatedSearchEngine<ValidatedProduct>(ProductSchema);

// Valid product
safeProductSearch.add({
  id: '1',
  name: 'Laptop',
  description: 'Gaming laptop',
  price: 1200,
  inStock: true,
  category: 'electronics'
});  // ✅ Passes validation

// Invalid product (caught at runtime)
try {
  safeProductSearch.add({
    id: '2',
    name: 'Mouse',
    description: 'Gaming mouse',
    price: -50,  // ❌ Negative price!
    inStock: true,
    category: 'electronics'
  });
} catch (error) {
  console.error('Validation failed:', error);
  // Alert monitoring system
}
```

### Metrics After Fix

**Before (broken constraints):**
- **Search accuracy**: 22% (78% wrong results)
- **Type safety coverage**: 30% (lots of `as any`)
- **Production bugs**: 5-8 per month related to search
- **Developer confusion**: High (unclear what T must have)

**After (proper constraints):**
- **Search accuracy**: 99.7%
- **Type safety coverage**: 95% (enforced by constraints)
- **Production bugs**: 0 search-related bugs in 8 months
- **Developer confusion**: Low (constraints document requirements)

**Business Impact:**
- **Revenue recovery**: $450K/month saved
- **Support tickets**: 95% reduction in search issues
- **Developer velocity**: 40% faster feature development (less debugging)
- **Code review time**: 30% reduction (type system catches issues)

### Key Lessons

1. **Empty constraints are useless** - Define actual requirements
2. **Avoid `as any` in generics** - Defeats the purpose of constraints
3. **Document through types** - Constraints are living documentation
4. **Combine compile + runtime** - Use Zod for external data
5. **Use adapter pattern** - Don't force types to conform, adapt them

---

## ⚖️ Trade-offs: Generic Constraints vs Type Unions vs Overloads

### Decision Matrix: When to Use Each Approach

| Scenario | Generic Constraints | Union Types | Function Overloads | No Generics |
|----------|-------------------|-------------|-------------------|-------------|
| **Open extension (library)** | ✅ Best | ❌ Closed | ❌ Closed | ❌ Inflexible |
| **Fixed set (2-4 types)** | ⚠️ Overkill | ✅ Best | ✅ Best | ✅ Consider |
| **Type preservation needed** | ✅ Best | ⚠️ Widens | ✅ Good | ❌ No |
| **Property access** | ✅ Best | ⚠️ Limited | ⚠️ Verbose | ❌ No |
| **Simple operations** | ❌ Overkill | ⚠️ Maybe | ❌ Overkill | ✅ Best |
| **Complex relationships** | ✅ Best | ❌ Can't express | ❌ Verbose | ❌ No |

### Trade-off 1: Constrained Generics vs Union Types

**Scenario:** Repository pattern for different entity types

```typescript
// APPROACH 1: Generic Constraints
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class GenericRepository<T extends Entity> {
  private items = new Map<string, T>();

  save(item: T): void {
    item.updatedAt = new Date();
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  // Type-preserving method
  update(id: string, updates: Partial<T>): T | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;  // Returns exact type T
  }
}

interface User extends Entity {
  name: string;
  email: string;
}

interface Post extends Entity {
  title: string;
  content: string;
  authorId: string;
}

// Can extend to ANY entity type
const userRepo = new GenericRepository<User>();
const postRepo = new GenericRepository<Post>();

const user = userRepo.findById('1');
if (user) {
  console.log(user.email);  // ✅ Typed as User
}

// APPROACH 2: Union Types
type EntityUnion = User | Post;

class UnionRepository {
  private items = new Map<string, EntityUnion>();

  save(item: EntityUnion): void {
    item.updatedAt = new Date();
    this.items.set(item.id, item);
  }

  findById(id: string): EntityUnion | undefined {
    return this.items.get(id);
  }

  update(id: string, updates: Partial<EntityUnion>): EntityUnion | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;  // Returns EntityUnion (widened)
  }
}

const repo = new UnionRepository();
repo.save({ id: '1', name: 'John', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() });

const found = repo.findById('1');
if (found) {
  // ❌ Must use type guards
  if ('email' in found) {
    console.log(found.email);  // Works but verbose
  }
}
```

**Comparison:**

| Aspect | Generic Constraints | Union Types |
|--------|-------------------|-------------|
| **Extensibility** | ✅ Infinite (any Entity) | ❌ Closed (must modify union) |
| **Type preservation** | ✅ Returns exact type T | ❌ Widens to union |
| **Memory usage** | ⚠️ N instances | ✅ 1 instance |
| **Type guards needed** | ❌ No | ✅ Yes (verbose) |
| **Compile performance** | ✅ Fast | ⚠️ Slower with large unions |
| **Use case** | Libraries, reusable code | Application-specific fixed types |

**Verdict:** Use generic constraints for extensible systems, unions for closed application-specific types.

### Trade-off 2: Generic Constraints vs Function Overloads

**Scenario:** Type-safe configuration getter

```typescript
// APPROACH 1: Generic with keyof Constraint
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
  debugMode: boolean;
  features: {
    darkMode: boolean;
    analytics: boolean;
  };
}

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  debugMode: false,
  features: {
    darkMode: true,
    analytics: false
  }
};

// Generic approach
function getConfig<K extends keyof Config>(key: K): Config[K] {
  return config[key];
}

const url = getConfig('apiUrl');      // Type: string
const timeout = getConfig('timeout');  // Type: number
const features = getConfig('features'); // Type: { darkMode: boolean; analytics: boolean }
// getConfig('invalid');               // ❌ Error: not a key of Config

// APPROACH 2: Function Overloads
function getConfigOverload(key: 'apiUrl'): string;
function getConfigOverload(key: 'timeout'): number;
function getConfigOverload(key: 'retries'): number;
function getConfigOverload(key: 'debugMode'): boolean;
function getConfigOverload(key: 'features'): { darkMode: boolean; analytics: boolean };

function getConfigOverload(key: keyof Config): any {
  return config[key];
}

const url2 = getConfigOverload('apiUrl');      // Type: string
const timeout2 = getConfigOverload('timeout');  // Type: number
// getConfigOverload('invalid');               // ❌ Error: not in overload signatures
```

**Comparison:**

| Aspect | Generic keyof | Overloads |
|--------|--------------|-----------|
| **Code size** | ✅ 1 line | ❌ N+1 lines (N overload signatures + implementation) |
| **Extensibility** | ✅ Auto-updates when Config changes | ❌ Must manually add overload |
| **Type safety** | ✅ 100% | ✅ 100% |
| **Autocomplete** | ✅ Excellent | ✅ Excellent |
| **Learning curve** | ⚠️ Must understand generics | ✅ Straightforward |
| **Maintenance** | ✅ Single source of truth | ❌ Multiple places to update |

**Verdict:** Use generics with `keyof` for DRY and maintainable code, overloads when you need only 2-4 specific signatures.

### Trade-off 3: Complex Constraints vs Simple Types + Validation

**Scenario:** Form validation system

```typescript
// APPROACH 1: Complex Generic Constraints
type FormField = {
  value: string;
  required: boolean;
  validator?: (val: string) => boolean;
};

type FormSchema = Record<string, FormField>;

type ValidatedForm<T extends FormSchema> = {
  [K in keyof T]: T[K]['required'] extends true
    ? string  // Required fields return string
    : string | undefined;  // Optional fields return string | undefined
};

function validateForm<T extends FormSchema>(
  schema: T,
  data: Record<string, string>
): ValidatedForm<T> | null {
  const result = {} as ValidatedForm<T>;

  for (const key in schema) {
    const field = schema[key];
    const value = data[key];

    // Check required
    if (field.required && !value) {
      console.error(`${key} is required`);
      return null;
    }

    // Run validator
    if (field.validator && value && !field.validator(value)) {
      console.error(`${key} failed validation`);
      return null;
    }

    result[key] = value as any;
  }

  return result;
}

// Usage
const loginSchema = {
  email: {
    value: '',
    required: true,
    validator: (v: string) => v.includes('@')
  },
  password: {
    value: '',
    required: true,
    validator: (v: string) => v.length >= 8
  },
  rememberMe: {
    value: '',
    required: false
  }
} as const;

const validated = validateForm(loginSchema, {
  email: 'john@example.com',
  password: 'password123'
});

if (validated) {
  console.log(validated.email);      // Type: string
  console.log(validated.rememberMe);  // Type: string | undefined
}

// APPROACH 2: Simple Types + Runtime Validation (Zod)
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.string().optional()
});

type LoginForm = z.infer<typeof LoginSchema>;

function validateFormSimple(data: unknown): LoginForm | null {
  try {
    return LoginSchema.parse(data);
  } catch (error) {
    console.error('Validation failed:', error);
    return null;
  }
}

const validated2 = validateFormSimple({
  email: 'john@example.com',
  password: 'password123'
});

if (validated2) {
  console.log(validated2.email);      // Type: string
  console.log(validated2.rememberMe);  // Type: string | undefined
}
```

**Performance & Complexity Comparison:**

| Metric | Complex Constraints | Simple + Zod |
|--------|-------------------|--------------|
| **Compile time** | 500ms-1s (complex types) | 50-100ms |
| **Runtime performance** | 0.5ms | 2-5ms (validation overhead) |
| **Bundle size** | +0kb | +40kb (Zod library) |
| **Type errors** | ⚠️ Cryptic (type system errors) | ✅ Clear (Zod errors) |
| **DX (autocomplete)** | ✅ Good | ✅ Good |
| **Maintenance** | ⚠️ Hard to debug | ✅ Easy |
| **Validation features** | ⚠️ Manual | ✅ Rich (email, min, max, regex, etc.) |

**Verdict:**

- **Complex constraints**: Internal type transformations, no runtime overhead critical
- **Simple + validation**: User input, API boundaries, better error messages
- **Best**: Combine both (types for structure, Zod for validation)

### Trade-off 4: No Constraints vs Proper Constraints

**Scenario:** Data transformation pipeline

```typescript
// APPROACH 1: No Constraints (BAD)
class PipelineBad<T> {
  constructor(private value: T) {}

  map<U>(fn: (val: T) => U): PipelineBad<U> {
    return new PipelineBad(fn(this.value));
  }

  // BUG: Assumes T is an array
  filter(predicate: (val: any) => boolean): PipelineBad<T> {
    if (Array.isArray(this.value)) {
      return new PipelineBad(this.value.filter(predicate) as T);
    }
    throw new Error('Value is not an array');  // Runtime error!
  }

  get(): T {
    return this.value;
  }
}

// TypeScript allows this but it WILL crash:
const pipeline1 = new PipelineBad(42);
// pipeline1.filter(x => x > 10);  // Runtime error!

// APPROACH 2: Proper Constraints (GOOD)
class PipelineArray<T> {
  constructor(private value: T[]) {}

  map<U>(fn: (val: T) => U): PipelineArray<U> {
    return new PipelineArray(this.value.map(fn));
  }

  filter(predicate: (val: T) => boolean): PipelineArray<T> {
    return new PipelineArray(this.value.filter(predicate));
  }

  get(): T[] {
    return this.value;
  }
}

// Constraint enforced at compile time
const pipeline2 = new PipelineArray([1, 2, 3, 4, 5]);
const result = pipeline2
  .filter(x => x > 2)
  .map(x => x * 2)
  .get();  // [6, 8, 10]

// This correctly fails at compile time:
// const invalid = new PipelineArray(42);
// ❌ Error: number is not assignable to T[]
```

**Impact Analysis:**

| Aspect | No Constraints | Proper Constraints |
|--------|---------------|-------------------|
| **Compile-time safety** | ❌ 0% | ✅ 100% |
| **Runtime errors** | ⚠️ High risk | ✅ Zero |
| **Developer experience** | ❌ Confusing | ✅ Clear |
| **API documentation** | ❌ Unclear requirements | ✅ Self-documenting |
| **Refactoring safety** | ❌ Breaks easily | ✅ Type system helps |

**Verdict:** ALWAYS use proper constraints. Never use unconstrained generics that assume properties.

---

## 💬 Explain to Junior: Generic Constraints Made Simple

### What Are Generic Constraints?

Think of generic constraints like hiring requirements for a job:

**Without Constraints (Too Loose):**
```typescript
// Like a job posting: "Hiring: Anyone"
function hire<T>(person: T) {
  // We don't know if person can code, design, or do anything!
  return person;
}

// You might hire a cat
hire(myCat);  // ✅ TypeScript allows this (probably not what you want)
```

**With Constraints (Proper Requirements):**
```typescript
// Like a job posting: "Hiring: Software Developer (must know TypeScript)"
interface Developer {
  canCode: boolean;
  knowsTypeScript: boolean;
}

function hireDeveloper<T extends Developer>(person: T) {
  // We KNOW person can code and knows TypeScript
  if (person.canCode && person.knowsTypeScript) {
    return person;
  }
}

// TypeScript enforces the requirement
hireDeveloper(myCat);  // ❌ Error: Cat doesn't satisfy Developer
hireDeveloper({ canCode: true, knowsTypeScript: true, name: 'John' });  // ✅ Works
```

### The Restaurant Menu Analogy

Imagine a restaurant with a generic "customize your dish" option:

```typescript
// BAD: No constraints (chaos in the kitchen!)
class Restaurant<T> {
  cook(ingredient: T) {
    // How do we cook this? Is it even food?
    return ingredient;
  }
}

const restaurant1 = new Restaurant();
restaurant1.cook(myCar);  // ✅ TypeScript allows, but chef is confused!

// GOOD: Constrained (chef knows how to handle it)
interface Cookable {
  needsCooking: boolean;
  cookingTime: number;  // in minutes
}

class SmartRestaurant<T extends Cookable> {
  cook(ingredient: T): T {
    if (ingredient.needsCooking) {
      console.log(`Cooking for ${ingredient.cookingTime} minutes`);
    }
    return ingredient;
  }
}

interface Steak extends Cookable {
  type: 'rare' | 'medium' | 'well-done';
  needsCooking: true;
  cookingTime: 15;
}

const restaurant2 = new SmartRestaurant<Steak>();
restaurant2.cook({ type: 'medium', needsCooking: true, cookingTime: 15 });  // ✅ Chef knows what to do!
```

### Real-World Example: Type-Safe Shopping Cart

```typescript
// Step 1: Define what can be bought
interface Purchasable {
  id: string;
  name: string;
  price: number;
}

// Step 2: Generic cart that ONLY accepts Purchasable items
class ShoppingCart<T extends Purchasable> {
  private items: T[] = [];

  addItem(item: T): void {
    this.items.push(item);
    console.log(`Added ${item.name} ($${item.price})`);
  }

  // We KNOW T has price (guaranteed by constraint)
  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getItems(): T[] {
    return this.items;
  }
}

// Step 3: Different product types
interface Book extends Purchasable {
  author: string;
  pages: number;
}

interface Electronics extends Purchasable {
  warranty: number;  // months
  brand: string;
}

// Step 4: Create type-safe carts
const bookCart = new ShoppingCart<Book>();
bookCart.addItem({
  id: '1',
  name: 'TypeScript Handbook',
  price: 29.99,
  author: 'Microsoft',
  pages: 400
});

console.log(`Total: $${bookCart.getTotal()}`);  // Total: $29.99

const electronicsCart = new ShoppingCart<Electronics>();
electronicsCart.addItem({
  id: '2',
  name: 'Laptop',
  price: 1200,
  warranty: 24,
  brand: 'Apple'
});

// Step 5: TypeScript prevents mistakes
// bookCart.addItem({ name: 'Random item', author: 'Unknown' });
// ❌ Error: Missing 'id' and 'price' (required by Purchasable)
```

### Common Beginner Mistakes

**Mistake #1: Forgetting the Constraint**

```typescript
// ❌ BAD: No constraint, assumes 'length' exists
function printLength<T>(item: T) {
  // console.log(item.length);  // Error: T might not have 'length'
}

// ✅ GOOD: Add constraint
interface HasLength {
  length: number;
}

function printLengthSafe<T extends HasLength>(item: T) {
  console.log(item.length);  // ✅ Safe!
}

printLengthSafe('hello');       // ✅ Works
printLengthSafe([1, 2, 3]);     // ✅ Works
// printLengthSafe(42);         // ❌ Error: number doesn't have length
```

**Mistake #2: Over-Constraining**

```typescript
// ❌ BAD: Too specific (defeats purpose of generics)
function processArray<T extends number[]>(arr: T): number {
  return arr.reduce((sum, n) => sum + n, 0);
}

// ✅ GOOD: Just the right constraint
function processArray<T extends number>(arr: T[]): number {
  return arr.reduce((sum, n) => sum + n, 0);
}

processArray([1, 2, 3]);           // ✅ Works
processArray([10, 20, 30]);        // ✅ Works
```

**Mistake #3: Using `any` Instead of Constraints**

```typescript
// ❌ BAD: Defeats purpose of TypeScript
function sort<T>(items: T[], key: any): T[] {
  return items.sort((a, b) => {
    return a[key] > b[key] ? 1 : -1;  // No type safety!
  });
}

// ✅ GOOD: Use keyof constraint
function sortSafe<T, K extends keyof T>(items: T[], key: K): T[] {
  return items.sort((a, b) => {
    return a[key] > b[key] ? 1 : -1;
  });
}

const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];

sortSafe(users, 'age');       // ✅ Works
// sortSafe(users, 'salary'); // ❌ Error: 'salary' is not a key
```

### Interview Answer Template

**When asked: "What are generic constraints?"**

> "Generic constraints let you specify requirements for the type parameter. Instead of accepting ANY type with `<T>`, you use `<T extends SomeType>` to say 'T must have at least these properties or behaviors.'
>
> For example, if I'm writing a function that needs to access the `length` property, I use `<T extends { length: number }>` to guarantee that whatever type T is, it WILL have a `length` property.
>
> The main benefits are:
> 1. **Type safety** - Access properties without errors
> 2. **Clear requirements** - Constraint documents what T must have
> 3. **Better errors** - TypeScript catches misuse at compile time
> 4. **Still flexible** - T can be any type that satisfies the constraint
>
> Common patterns include `keyof` constraints for property access (`<K extends keyof T>`), interface constraints (`<T extends Identifiable>`), and intersection constraints (`<T extends A & B>`).
>
> The key is to constrain just enough - not too loose (allows invalid types) and not too tight (loses generics benefits)."

**Follow-up: "When do you use `keyof` with generics?"**

> "`keyof` with generics creates type-safe property accessors. If I have `function get<T, K extends keyof T>(obj: T, key: K)`, TypeScript ensures `key` is actually a property of `obj`, and the return type is automatically `T[K]` - the exact type of that property.
>
> This is perfect for utility functions like `pick`, `omit`, `pluck`, or any time you're accessing object properties dynamically but want full type safety. Without `keyof`, you'd need string keys and lose type information."

### Practice Challenge

**Build a type-safe notification system:**

```typescript
// Your task: Add proper constraints

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

class NotificationCenter<T /* Add constraint here */> {
  private notifications: T[] = [];

  send(notification: T): void {
    // Add implementation
  }

  getRecent(hours: number): T[] {
    // Filter by timestamp (only works if T has timestamp!)
    // Add implementation
  }

  findById(id: string): T | undefined {
    // Find by id (only works if T has id!)
    // Add implementation
  }
}

// Test it with different notification types
interface EmailNotification extends Notification {
  subject: string;
  recipientEmail: string;
}

interface PushNotification extends Notification {
  deviceId: string;
  sound: boolean;
}
```

**Solution:**

```typescript
interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

class NotificationCenter<T extends Notification> {
  private notifications: T[] = [];

  send(notification: T): void {
    this.notifications.push(notification);
    console.log(`Sent: ${notification.message}`);
  }

  getRecent(hours: number): T[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.notifications.filter(n =>
      n.timestamp.getTime() > cutoff
    );
  }

  findById(id: string): T | undefined {
    return this.notifications.find(n => n.id === id);
  }
}

// Now TypeScript ensures T has id, message, and timestamp!
```

**Key Takeaway:** Constraints are like a contract - they guarantee that your generic type T will have specific properties, letting you write safe, reusable code!

---


