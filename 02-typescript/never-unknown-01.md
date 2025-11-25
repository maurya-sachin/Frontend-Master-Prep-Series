# TypeScript: Never and Unknown Types

## Question 1: What are the never and unknown types and when to use them?

### Answer

**`never` Type:**
- Represents values that never occur
- Bottom type in TypeScript's type hierarchy (subtype of every type)
- Used for functions that never return (throw errors, infinite loops)
- Used for unreachable code branches
- Empty type (no value can be assigned to it)

**`unknown` Type:**
- Top type in TypeScript's type hierarchy (supertype of every type)
- Type-safe alternative to `any`
- Requires type checking before using the value
- Any value can be assigned to `unknown`
- Cannot perform operations without narrowing first

**When to Use `never`:**
```typescript
// ✅ Functions that throw errors
function throwError(message: string): never {
  throw new Error(message);
}

// ✅ Functions with infinite loops
function infiniteLoop(): never {
  while (true) {
    // Process continuously
  }
}

// ✅ Exhaustive type checking
type Shape = 'circle' | 'square' | 'triangle';

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 10 * 10;
    case 'square':
      return 10 * 10;
    case 'triangle':
      return (10 * 10) / 2;
    default:
      // If a new shape is added, this will cause compile error
      const exhaustiveCheck: never = shape;
      throw new Error(`Unhandled shape: ${shape}`);
  }
}

// ✅ Filtering impossible types
type NonNullable<T> = T extends null | undefined ? never : T;
type Result = NonNullable<string | null | number>; // string | number
```

**When to Use `unknown`:**
```typescript
// ✅ External API responses
async function fetchData(url: string): Promise<unknown> {
  const response = await fetch(url);
  return response.json(); // We don't know the shape
}

// ✅ User input validation
function processUserInput(input: unknown): string {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  if (typeof input === 'number') {
    return input.toString();
  }
  throw new Error('Invalid input type');
}

// ✅ Safe type assertions
function parseJSON(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

// ❌ Bad: Using any
function badFetchData(url: string): Promise<any> {
  // No type safety at all
}

// ❌ Bad: Assigning unknown without checks
function badProcess(data: unknown) {
  return data.toString(); // Error: Object is of type 'unknown'
}
```

**Type Hierarchy:**
```typescript
// Type hierarchy (from specific to general)
never → specific types → union types → unknown → any

// Examples
let neverVal: never;
let stringVal: string = "hello";
let unknownVal: unknown;
let anyVal: any;

// ✅ Valid assignments (bottom to top)
unknownVal = stringVal; // string → unknown
unknownVal = neverVal;  // never → unknown

// ❌ Invalid assignments (top to bottom)
// stringVal = unknownVal; // Error
// stringVal = anyVal;     // Allowed but unsafe
```

---

<details>
<summary><strong>🔍 Deep Dive: Type System Theory and Bottom Types</strong></summary>

**Never as a Bottom Type:**

The `never` type represents the bottom of TypeScript's type system. In type theory, a bottom type (⊥) is a type that has no values and is a subtype of all other types.

**Mathematical Properties:**
```typescript
// 1. Empty Set Property
// never represents an empty set of values
type Never = never;
// There exists no value v such that v ∈ never

// 2. Subtype of Everything
// never <: T for all types T
let x: never;
let s: string = x;    // Valid: never is assignable to string
let n: number = x;    // Valid: never is assignable to number
let obj: {} = x;      // Valid: never is assignable to any type

// 3. Union Absorption
// never ∪ T = T
type Union1 = string | never;  // Simplifies to: string
type Union2 = number | never;  // Simplifies to: number

// 4. Intersection Identity
// never ∩ T = never
type Intersection1 = string & never;  // Result: never
type Intersection2 = number & never;  // Result: never
```

**Control Flow Analysis:**

TypeScript's control flow analysis uses `never` to prove code unreachability:

```typescript
// Example 1: Narrowing to never
function processValue(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2));
  } else {
    // TypeScript infers value: never here
    // All possibilities exhausted
    const exhaustive: never = value;
  }
}

// Example 2: Dead code detection
function example(x: string) {
  if (typeof x === 'string') {
    return x.length;
  } else {
    // This branch is unreachable
    // TypeScript knows x: never here
    console.log(x); // Warning: unreachable code
  }
}

// Example 3: Type predicates with never
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processUnknown(value: unknown) {
  if (isString(value)) {
    console.log(value.length); // value is string
  } else {
    // value is still unknown (not never)
    // Because unknown has infinite possibilities
  }
}
```

**Unknown as a Top Type:**

The `unknown` type is the type-safe counterpart to `any`. It's the top type (⊤) in TypeScript's type system.

**Mathematical Properties:**
```typescript
// 1. Universal Set Property
// unknown represents the set of all possible values
let x: unknown;
x = 5;
x = "hello";
x = { foo: 'bar' };
x = () => {};

// 2. Supertype of Everything
// T <: unknown for all types T
let u: unknown;
u = 'string';  // Valid: string is assignable to unknown
u = 42;        // Valid: number is assignable to unknown
u = null;      // Valid: null is assignable to unknown

// 3. Union Identity
// unknown ∪ T = unknown
type Union1 = string | unknown;  // Simplifies to: unknown
type Union2 = number | unknown;  // Simplifies to: unknown

// 4. Intersection Absorption
// unknown ∩ T = T
type Intersection1 = string & unknown;  // Simplifies to: string
type Intersection2 = number & unknown;  // Simplifies to: number
```

**Type Guard Implementation:**

TypeScript enforces type guards before using `unknown`:

```typescript
// Built-in type guards
function processUnknown(value: unknown) {
  // typeof guard
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // value is string
  }

  // instanceof guard
  if (value instanceof Date) {
    console.log(value.toISOString()); // value is Date
  }

  // in operator guard
  if (typeof value === 'object' && value !== null && 'length' in value) {
    console.log((value as { length: number }).length);
  }

  // Custom type guard
  if (isUser(value)) {
    console.log(value.name); // value is User
  }
}

function isUser(value: unknown): value is { name: string; age: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'age' in value &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).age === 'number'
  );
}
```

**Compiler Implementation:**

TypeScript compiler treats `never` and `unknown` specially:

```typescript
// Never type checking (simplified algorithm)
function isNever(type: Type): boolean {
  return type.flags & TypeFlags.Never;
}

// When checking if A is assignable to B:
function isAssignableTo(source: Type, target: Type): boolean {
  // Rule 1: never is assignable to everything
  if (isNever(source)) return true;

  // Rule 2: everything is assignable to unknown
  if (isUnknown(target)) return true;

  // Rule 3: unknown is only assignable to unknown and any
  if (isUnknown(source)) {
    return isUnknown(target) || isAny(target);
  }

  // Other rules...
}
```

**Advanced Usage Patterns:**

```typescript
// 1. Conditional type distribution with never
type Filter<T, U> = T extends U ? T : never;
type Numbers = Filter<string | number | boolean, number>; // number

// 2. Mapped type filtering
type FilterKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

interface User {
  name: string;
  age: number;
  active: boolean;
}

type StringKeys = FilterKeys<User, string>; // "name"

// 3. Never in function overloads
function create(type: 'user'): User;
function create(type: 'admin'): Admin;
function create(type: never): never; // Catch-all
function create(type: string): User | Admin {
  if (type === 'user') return { name: '', age: 0, active: true };
  if (type === 'admin') return { name: '', permissions: [] };
  throw new Error('Invalid type');
}

// 4. Unknown with conditional types
type UnknownToNull<T> = unknown extends T ? null : T;
type Result1 = UnknownToNull<unknown>; // null
type Result2 = UnknownToNull<string>;  // string

// 5. Assertion functions with never
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value must be defined');
  }
}

function example(x: string | null) {
  assertIsDefined(x);
  console.log(x.toUpperCase()); // x is string here
}
```

**Performance Implications:**

```typescript
// Type checking performance
// never-based utilities are resolved at compile time (zero runtime cost)
type NonNullable<T> = T extends null | undefined ? never : T;

// unknown-based runtime checks have minimal overhead
function safeParse(json: string): unknown {
  try {
    return JSON.parse(json); // ~1-5ms for typical JSON
  } catch {
    return null;
  }
}

// Type guard performance depends on complexity
function isComplexType(value: unknown): value is ComplexType {
  // O(n) where n = number of properties
  return (
    typeof value === 'object' &&
    value !== null &&
    'prop1' in value &&
    'prop2' in value &&
    // ... more checks
    true
  );
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Type Safety Bug in API Integration</strong></summary>

**Background:**
E-commerce platform integrating third-party payment gateway API. Initial implementation used `any` for API responses, leading to runtime errors in production.

**The Bug:**

```typescript
// ❌ BEFORE: Using any (unsafe)
interface PaymentResponse {
  status: string;
  transactionId: string;
  amount: number;
}

async function processPayment(orderId: string): Promise<PaymentResponse> {
  const response = await fetch(`/api/payments/${orderId}`);
  const data: any = await response.json(); // ⚠️ Unsafe!

  // No type checking - runtime crashes
  return {
    status: data.status,
    transactionId: data.transaction_id, // Typo: should be transactionId
    amount: data.amount
  };
}

// Production usage
async function handleCheckout() {
  try {
    const payment = await processPayment('ORD-123');
    console.log(`Transaction ${payment.transactionId} completed`);
    // Runtime error: transactionId is undefined
    // User sees "Transaction undefined completed"
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
```

**Production Impact:**
- **Error Rate**: 12% of payment transactions failed silently
- **Customer Complaints**: 340 tickets in 2 weeks
- **Revenue Loss**: $18,500 due to failed checkouts
- **Detection Time**: 4 days before pattern identified
- **Root Cause**: API changed field names (`transaction_id` → `transactionId`)

**The Fix: Using unknown + Type Guards:**

```typescript
// ✅ AFTER: Using unknown (safe)
interface PaymentResponse {
  status: string;
  transactionId: string;
  amount: number;
}

// Type guard for runtime validation
function isPaymentResponse(value: unknown): value is PaymentResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.status === 'string' &&
    typeof obj.transactionId === 'string' &&
    typeof obj.amount === 'number' &&
    obj.amount >= 0
  );
}

// Safe API call with validation
async function processPayment(orderId: string): Promise<PaymentResponse> {
  const response = await fetch(`/api/payments/${orderId}`);

  if (!response.ok) {
    throw new Error(`Payment API error: ${response.status}`);
  }

  const data: unknown = await response.json(); // Safe: unknown type

  // Runtime validation
  if (!isPaymentResponse(data)) {
    console.error('Invalid payment response:', data);
    throw new Error('Invalid payment response format');
  }

  // TypeScript knows data is PaymentResponse here
  return data;
}

// Production usage with proper error handling
async function handleCheckout() {
  try {
    const payment = await processPayment('ORD-123');
    console.log(`Transaction ${payment.transactionId} completed`);
    // Type-safe: TypeScript enforces correct property names
  } catch (error) {
    // Log validation errors to monitoring
    logToSentry(error);
    showUserError('Payment processing failed. Please try again.');
  }
}
```

**Using Zod for Enhanced Validation:**

```typescript
import { z } from 'zod';

// Schema definition
const PaymentResponseSchema = z.object({
  status: z.enum(['success', 'pending', 'failed']),
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  metadata: z.record(z.unknown()).optional()
});

type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

async function processPaymentWithZod(orderId: string): Promise<PaymentResponse> {
  const response = await fetch(`/api/payments/${orderId}`);
  const data: unknown = await response.json();

  try {
    // Automatic validation and parsing
    const validated = PaymentResponseSchema.parse(data);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      // [
      //   { path: ['transactionId'], message: 'Required' },
      //   { path: ['amount'], message: 'Expected number, received string' }
      // ]
    }
    throw new Error('Invalid payment response');
  }
}
```

**Never for Exhaustive Error Handling:**

```typescript
type PaymentStatus = 'success' | 'pending' | 'failed' | 'cancelled';

function handlePaymentStatus(status: PaymentStatus): string {
  switch (status) {
    case 'success':
      return 'Payment completed successfully';
    case 'pending':
      return 'Payment is being processed';
    case 'failed':
      return 'Payment failed';
    case 'cancelled':
      return 'Payment was cancelled';
    default:
      // Exhaustive check: if new status added, compile error here
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled payment status: ${exhaustiveCheck}`);
  }
}

// ❌ If developer adds new status but forgets to handle it:
type PaymentStatus = 'success' | 'pending' | 'failed' | 'cancelled' | 'refunded';
// TypeScript error in handlePaymentStatus:
// Type 'refunded' is not assignable to type 'never'
```

**Results After Fix:**

**Immediate Impact (Week 1):**
- Error rate dropped from 12% → 0.3%
- All API response mismatches caught at runtime
- Validation errors logged to monitoring dashboard
- Zero customer complaints about payment failures

**Long-term Benefits:**
- API changes detected immediately (build fails if types mismatch)
- New developers protected from `any` misuse
- Integration tests improved (type guards reused)
- Code review time reduced by 30% (type safety guaranteed)

**Monitoring Dashboard:**
```typescript
// Type guard failures tracked in production
interface ValidationMetrics {
  endpoint: string;
  failureCount: number;
  lastFailure: Date;
  samplePayload: unknown;
}

function trackValidationFailure(
  endpoint: string,
  payload: unknown
): void {
  logToDatadog({
    metric: 'api.validation.failure',
    endpoint,
    payload: JSON.stringify(payload),
    timestamp: Date.now()
  });
}

// Usage in type guard
function isPaymentResponse(value: unknown): value is PaymentResponse {
  const isValid = /* validation logic */;

  if (!isValid) {
    trackValidationFailure('/api/payments', value);
  }

  return isValid;
}
```

**Cost-Benefit Analysis:**
- Development time: +2 hours to add type guards
- Runtime overhead: +1-2ms per API call (validation)
- Revenue saved: $18,500/month (failed payments prevented)
- Support tickets reduced: 340 → 8 per month
- **ROI**: 925x (2 hours investment, ~1850 hours support time saved)

</details>

<details>
<summary><strong>⚖️ Trade-offs: unknown vs any, never vs void</strong></summary>

**unknown vs any:**

| Aspect | `unknown` | `any` |
|--------|-----------|-------|
| **Type Safety** | ✅ Full type safety | ❌ No type safety |
| **Type Checking** | ✅ Required before use | ❌ Bypasses all checks |
| **Errors Caught** | ✅ Compile-time | ❌ Runtime only |
| **Refactoring Safety** | ✅ Safe | ❌ Unsafe |
| **Performance** | ⚡ Minimal overhead | ⚡ No overhead |
| **Migration Effort** | 🔧 Moderate | 🔧 None |

```typescript
// Performance comparison (1 million operations)
// unknown with type guard: ~15ms (validation overhead)
// any without checks: ~10ms (no validation)
// Trade-off: 5ms for complete type safety

// Example: API response handling
interface ApiResponse {
  data: unknown;  // ✅ Safe choice
  // vs
  data: any;      // ❌ Unsafe choice
}

function processResponse(response: ApiResponse) {
  // With unknown: forced to validate
  if (typeof response.data === 'object' && response.data !== null) {
    const obj = response.data as Record<string, unknown>;
    if ('name' in obj && typeof obj.name === 'string') {
      console.log(obj.name.toUpperCase()); // ✅ Type-safe
    }
  }

  // With any: no protection
  // console.log(response.data.name.toUpperCase()); // ❌ Runtime error if malformed
}
```

**When to Use unknown:**
```typescript
// ✅ External API responses
async function fetchData(url: string): Promise<unknown> {
  const response = await fetch(url);
  return response.json();
}

// ✅ User input
function handleInput(input: unknown): void {
  if (typeof input === 'string') {
    processString(input);
  }
}

// ✅ Dynamic imports
async function loadModule(): Promise<unknown> {
  return import('./module.js');
}

// ✅ Error handling
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

**When to Use any (Sparingly):**
```typescript
// ✅ Gradual migration from JavaScript
// (temporary, with TODO to replace with proper types)
const legacyData: any = getLegacyData(); // TODO: add proper types

// ✅ Third-party library without types
declare module 'legacy-lib' {
  export function doSomething(arg: any): any;
}

// ✅ Extreme dynamic scenarios (use sparingly)
function dynamicPropertyAccess(obj: any, path: string[]): any {
  return path.reduce((acc, key) => acc?.[key], obj);
}

// ❌ NEVER use any when unknown works
function badExample(): any {  // Should be: unknown
  return fetch('/api/data').then(r => r.json());
}
```

**never vs void:**

| Aspect | `never` | `void` |
|--------|---------|--------|
| **Meaning** | Never returns | Returns undefined |
| **Use Case** | Throws/infinite loop | No return value |
| **Assignability** | Subtype of all | Only undefined |
| **Function Ends** | ❌ Never ends | ✅ Ends normally |

```typescript
// void: function completes but returns nothing
function logMessage(msg: string): void {
  console.log(msg);
  // implicitly returns undefined
}

// never: function never completes
function throwError(msg: string): never {
  throw new Error(msg);
  // execution stops here
}

function infiniteLoop(): never {
  while (true) {
    // never returns
  }
}

// Practical example
function processValue(value: string | null): string {
  if (value === null) {
    throwError('Value cannot be null'); // Type: never
    // TypeScript knows code after this is unreachable
  }

  return value.toUpperCase(); // value is string here
}
```

**Exhaustive Checking Trade-offs:**

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ With never: compile-time exhaustiveness
function handleStatus1(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return 'Done';
    case 'error':
      return 'Failed';
    default:
      const exhaustive: never = status;
      throw new Error(`Unhandled status: ${exhaustive}`);
  }
}

// ❌ Without never: runtime errors only
function handleStatus2(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    // Forgot success and error cases
    default:
      return 'Unknown'; // ⚠️ No compile error, runtime bug
  }
}

// If new status added:
type Status = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';
// handleStatus1: ✅ TypeScript error (must handle 'cancelled')
// handleStatus2: ❌ No error, returns 'Unknown' for 'cancelled'
```

**Decision Matrix:**

| Scenario | Recommended Type | Reason |
|----------|------------------|--------|
| External API | `unknown` | Requires validation |
| Function never returns | `never` | Throws or infinite |
| Function returns nothing | `void` | Completes normally |
| Temporary migration | `any` | Gradual typing |
| Type filtering | `never` | Conditional types |
| Error boundary | `unknown` | Safe error handling |
| Exhaustive checks | `never` | Compile-time safety |

**Performance Considerations:**

```typescript
// Benchmark: Type guard overhead
// Test: 1 million type checks

// unknown with simple guard: ~12ms
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// unknown with complex guard: ~45ms
function isUser(x: unknown): x is User {
  return (
    typeof x === 'object' &&
    x !== null &&
    'name' in x &&
    'age' in x &&
    typeof (x as any).name === 'string' &&
    typeof (x as any).age === 'number'
  );
}

// any with no guard: ~5ms (but unsafe)
function processAny(x: any) {
  return x.name;
}

// Trade-off: 7-40ms overhead for complete type safety
```

**Migration Strategy:**

```typescript
// Phase 1: Replace any with unknown
// Before
function fetchData(): Promise<any> { }

// After
function fetchData(): Promise<unknown> { }

// Phase 2: Add type guards
function isValidData(data: unknown): data is ValidData {
  // validation logic
}

// Phase 3: Use validated data
async function main() {
  const data = await fetchData();
  if (isValidData(data)) {
    // TypeScript knows data is ValidData
    processData(data);
  }
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior: The Safety Net Analogy</strong></summary>

**Simple Explanation:**

Imagine you're receiving packages in the mail:

**`any` = No inspection:**
"Just take whatever's in the package and use it!"
- Someone sends you a "phone" but it's actually a brick
- You try to make a call → crash!
- No one warned you it wasn't a real phone

**`unknown` = Security checkpoint:**
"Check what's in the package before using it!"
- Package arrives at security
- Security: "Is this a phone? Let me check... yes, it's a real phone!"
- Now you can safely use it
- If it's a brick, security catches it before you get hurt

**`never` = Package that never arrives:**
"This package is impossible to deliver!"
- Either the delivery truck crashed (function threw error)
- Or it's stuck in an infinite loop (never completes)
- You'll never receive it, so you can't use it

**`void` = Empty package:**
"Package delivered, but nothing inside!"
- Function completes successfully
- But returns nothing useful
- Like a confirmation email with no content

**Real-World Code Analogy:**

```typescript
// unknown: "I don't know what this is, check first!"
function openPackage(package: unknown) {
  // ✅ Check before using
  if (typeof package === 'object' && package !== null && 'value' in package) {
    console.log((package as { value: string }).value); // Safe!
  } else {
    console.log('Not what I expected!');
  }
}

// any: "YOLO, just use it!"
function openPackageYolo(package: any) {
  console.log(package.value.toUpperCase()); // ❌ Might crash!
}

// never: "This function never finishes"
function deliverPackageForever(): never {
  while (true) {
    console.log('Still delivering...');
  }
  // Never reaches here
}

// void: "Function finishes, but returns nothing"
function logDelivery(id: string): void {
  console.log(`Package ${id} delivered`);
  // Returns undefined (nothing useful)
}
```

**Key Concepts for Beginners:**

**1. Type Safety Ladder:**
```
Most Safe   → unknown (check required)
            → specific types (string, number)
            → any (no checks)
Least Safe  → any (TypeScript disabled)
```

**2. When to Use Each:**

```typescript
// ✅ Use unknown when you don't know the type
function parseJSON(json: string): unknown {
  return JSON.parse(json); // Could be anything
}

// ✅ Use never when function never returns normally
function panic(message: string): never {
  throw new Error(message);
  // Code after this is unreachable
}

// ✅ Use void when function returns no value
function printName(name: string): void {
  console.log(name);
  // Just prints, doesn't return anything
}

// ❌ Avoid any unless absolutely necessary
function dangerous(data: any) {
  // TypeScript can't help you here
}
```

**3. Exhaustive Checking Pattern:**

```typescript
// Think of it like a checklist
type TrafficLight = 'red' | 'yellow' | 'green';

function whatToDo(light: TrafficLight): string {
  switch (light) {
    case 'red':
      return 'Stop';
    case 'yellow':
      return 'Slow down';
    case 'green':
      return 'Go';
    default:
      // If we add 'blue' to TrafficLight, TypeScript will error here
      const check: never = light;
      throw new Error(`Unknown light: ${check}`);
  }
}

// Benefits:
// - If someone adds 'blue' to TrafficLight
// - TypeScript forces you to handle it
// - Prevents forgetting to update the switch
```

**Interview Answer Template:**

**Question: "What's the difference between `unknown` and `any`?"**

**Answer:**
"Both `unknown` and `any` can accept any value, but they differ in type safety:

- `any` disables type checking completely. You can do anything with it, but you get no protection from TypeScript.
- `unknown` is type-safe. You must narrow the type (using type guards) before you can use the value.

For example, if I'm fetching data from an API, I should use `unknown` because I don't know the exact shape of the response. I'll then use type guards to validate it before using it. This catches errors at compile-time instead of runtime.

I only use `any` when migrating JavaScript code or working with extremely dynamic scenarios where the overhead of type guards isn't worth it. In most cases, `unknown` is the better choice."

**Question: "What is the `never` type used for?"**

**Answer:**
"`never` represents values that never occur. It has two main use cases:

1. **Functions that never return**: Functions that throw errors or have infinite loops return `never`. This tells TypeScript that code after calling this function is unreachable.

2. **Exhaustive checking**: In switch statements or conditionals, I use `never` to ensure all cases are handled. If I add a new case to a union type but forget to handle it in my switch, TypeScript will give me a compile error.

For example, if I have a Status type with 'loading', 'success', and 'error', I can add a default case that assigns the value to `never`. If someone adds 'pending' to the Status type later, TypeScript will error until they handle it in the switch."

**Common Gotchas:**

```typescript
// ❌ Mistake 1: Treating unknown like any
function mistake1(data: unknown) {
  console.log(data.name); // Error: Object is of type 'unknown'
}

// ✅ Fix: Use type guards
function fix1(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    console.log((data as { name: unknown }).name);
  }
}

// ❌ Mistake 2: Returning never when you mean void
function mistake2(): never {
  console.log('Hello');
  // Error: A function returning 'never' cannot have a reachable end point
}

// ✅ Fix: Use void
function fix2(): void {
  console.log('Hello');
}

// ❌ Mistake 3: Not using never for exhaustiveness
type Status = 'idle' | 'loading';

function mistake3(status: Status) {
  if (status === 'idle') return 'Idle';
  // What if status === 'loading'? No error!
}

// ✅ Fix: Use never to catch missing cases
function fix3(status: Status): string {
  if (status === 'idle') return 'Idle';
  if (status === 'loading') return 'Loading';

  const exhaustive: never = status; // Compile error if case missed
  throw new Error(`Unhandled status: ${exhaustive}`);
}
```

**Quick Reference Card:**

```typescript
// Type Hierarchy (memorize this!)
never → string/number/etc → unknown → any

// Quick Decision Tree:
// "Do I know the exact type?"
//   Yes → Use specific type (string, number, User, etc)
//   No, but I'll check it → Use unknown
//   No, and I can't check it (legacy code) → Use any (temporary)

// "Does this function return?"
//   Yes, with a value → Use return type (string, number, etc)
//   Yes, but no value → Use void
//   No, never returns → Use never

// "Do I need exhaustive checking?"
//   Yes → Use never in default case
//   No → Regular error handling
```

</details>

---

## Question 2: How to use never for exhaustive checking?

### Answer

**Exhaustive checking** ensures all possible cases in a union type are handled. TypeScript's `never` type enables compile-time verification that every case has been covered.

**Basic Pattern:**

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Ready to start';
    case 'loading':
      return 'Processing...';
    case 'success':
      return 'Completed!';
    case 'error':
      return 'Failed';
    default:
      // Exhaustive check: if all cases handled, status is never
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled status: ${exhaustiveCheck}`);
  }
}

// ✅ All cases handled: compiles successfully

// ❌ If we add 'pending' to Status but don't handle it:
type Status = 'idle' | 'loading' | 'success' | 'error' | 'pending';
// TypeScript error in default case:
// Type 'pending' is not assignable to type 'never'
```

**How It Works:**

1. TypeScript tracks which cases have been handled
2. In the default branch, it knows which cases remain
3. If all cases are handled, the remaining type is `never`
4. If any case is missing, the remaining type includes that case
5. Assigning non-never to `never` causes a compile error

**Advanced Patterns:**

```typescript
// Pattern 1: Discriminated Unions
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      const exhaustiveCheck: never = shape;
      throw new Error(`Unknown shape: ${exhaustiveCheck}`);
  }
}

// Pattern 2: If-Else Chains
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function handleRequest(method: HttpMethod): void {
  if (method === 'GET') {
    console.log('Fetching data');
  } else if (method === 'POST') {
    console.log('Creating data');
  } else if (method === 'PUT') {
    console.log('Updating data');
  } else if (method === 'DELETE') {
    console.log('Deleting data');
  } else {
    const exhaustiveCheck: never = method;
    throw new Error(`Unsupported method: ${exhaustiveCheck}`);
  }
}

// Pattern 3: Helper Function
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

type Color = 'red' | 'green' | 'blue';

function getHexColor(color: Color): string {
  switch (color) {
    case 'red':
      return '#FF0000';
    case 'green':
      return '#00FF00';
    case 'blue':
      return '#0000FF';
    default:
      return assertNever(color); // Cleaner syntax
  }
}

// Pattern 4: Multiple Discriminants
type Action =
  | { type: 'INCREMENT'; amount: number }
  | { type: 'DECREMENT'; amount: number }
  | { type: 'RESET' }
  | { type: 'SET'; value: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREMENT':
      return state + action.amount;
    case 'DECREMENT':
      return state - action.amount;
    case 'RESET':
      return 0;
    case 'SET':
      return action.value;
    default:
      return assertNever(action);
  }
}
```

**Benefits:**

1. **Compile-time safety**: Catches missing cases during development
2. **Refactoring confidence**: Adding new union members forces updates
3. **Documentation**: Explicitly shows all cases are handled
4. **Runtime safety**: Throws error if unexpected value reaches default

**Limitations:**

```typescript
// ❌ Doesn't work with runtime values
function handleDynamic(status: string): string {
  // Can't use exhaustive checking - status is too broad
  switch (status) {
    case 'idle':
      return 'Idle';
    default:
      return 'Unknown';
  }
}

// ✅ Works only with literal union types
type Status = 'idle' | 'loading'; // Literal types
function handleStatus(status: Status): string {
  // Exhaustive checking works here
}
```

---

<details>
<summary><strong>🔍 Deep Dive: Type Theory Behind Exhaustive Checking</strong></summary>

**Control Flow Analysis (CFA):**

TypeScript's type checker uses control flow analysis to track which types are possible at each point in the code. This is the foundation of exhaustive checking.

**How CFA Works:**

```typescript
type Animal = 'dog' | 'cat' | 'bird';

function makeSound(animal: Animal): string {
  // At this point: animal = 'dog' | 'cat' | 'bird'

  if (animal === 'dog') {
    // TypeScript narrows: animal = 'dog'
    return 'Woof!';
  }
  // After if block: animal = 'cat' | 'bird' (dog eliminated)

  if (animal === 'cat') {
    // TypeScript narrows: animal = 'cat'
    return 'Meow!';
  }
  // After second if: animal = 'bird' (dog and cat eliminated)

  if (animal === 'bird') {
    // TypeScript narrows: animal = 'bird'
    return 'Tweet!';
  }
  // After all ifs: animal = never (all possibilities eliminated)

  const exhaustive: never = animal; // ✅ Type checks!
  throw new Error(`Unknown animal: ${exhaustive}`);
}
```

**Type Narrowing Algorithm:**

TypeScript's compiler implements type narrowing through several steps:

```typescript
// Simplified TypeScript compiler logic
interface Type {
  kind: string;
  // ... other properties
}

interface UnionType extends Type {
  kind: 'union';
  types: Type[];
}

// Narrowing algorithm (simplified)
function narrowType(originalType: Type, eliminatedType: Type): Type {
  if (originalType.kind === 'union') {
    const remainingTypes = (originalType as UnionType).types.filter(
      t => !isSubtypeOf(t, eliminatedType)
    );

    if (remainingTypes.length === 0) {
      return NeverType; // All possibilities eliminated
    }

    if (remainingTypes.length === 1) {
      return remainingTypes[0]; // Single type remaining
    }

    return createUnionType(remainingTypes); // Multiple types remaining
  }

  return originalType;
}
```

**Practical Example of Narrowing:**

```typescript
type Result<T> =
  | { success: true; value: T }
  | { success: false; error: Error };

function processResult<T>(result: Result<T>): T {
  // result type: { success: true; value: T } | { success: false; error: Error }

  if (result.success) {
    // TypeScript narrows to: { success: true; value: T }
    // Can safely access: result.value
    return result.value;
  }

  // TypeScript narrows to: { success: false; error: Error }
  // Can safely access: result.error
  throw result.error;

  // No code after this point (both branches return/throw)
  // If code existed here, result would be type 'never'
}
```

**Switch Statement Exhaustiveness:**

TypeScript handles switch statements specially for exhaustive checking:

```typescript
type Direction = 'north' | 'south' | 'east' | 'west';

function move(direction: Direction): { x: number; y: number } {
  let x = 0, y = 0;

  switch (direction) {
    case 'north':
      y = 1;
      break;
    case 'south':
      y = -1;
      break;
    case 'east':
      x = 1;
      break;
    case 'west':
      x = -1;
      break;
    // No default needed - all cases covered
  }

  return { x, y };
}

// TypeScript's compiler checks:
// 1. Are all union members present in cases? ✅
// 2. Is there unreachable code? ❌
// 3. Is default branch needed? ❌ (all cases covered)
```

**Advanced Pattern: Exhaustive Mapping:**

```typescript
// Type-safe exhaustive object mapping
type Status = 'idle' | 'loading' | 'success' | 'error';

// This object MUST have all Status keys
const statusMessages: { [K in Status]: string } = {
  idle: 'Ready',
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed'
  // If we miss any status, TypeScript error!
};

// Using the mapping
function getMessage(status: Status): string {
  return statusMessages[status]; // Always safe, no default needed
}

// Compare with non-exhaustive version:
const partialMessages: Partial<{ [K in Status]: string }> = {
  idle: 'Ready',
  loading: 'Loading...'
  // Missing success and error - but TypeScript allows it
};

function getBadMessage(status: Status): string {
  return partialMessages[status] ?? 'Unknown'; // Needs fallback
}
```

**Discriminated Unions Deep Dive:**

Discriminated unions are TypeScript's most powerful exhaustive checking tool:

```typescript
// The discriminant property enables exhaustive checking
type NetworkState =
  | { state: 'loading' }
  | { state: 'success'; response: string }
  | { state: 'error'; code: number };

function handleState(network: NetworkState): string {
  // TypeScript uses 'state' property to discriminate
  switch (network.state) {
    case 'loading':
      // network is { state: 'loading' }
      return 'Loading...';

    case 'success':
      // network is { state: 'success'; response: string }
      return `Success: ${network.response}`;

    case 'error':
      // network is { state: 'error'; code: number }
      return `Error ${network.code}`;

    default:
      // network is never
      const exhaustive: never = network;
      throw new Error(`Unhandled state: ${exhaustive}`);
  }
}

// Compiler's discriminant analysis:
// 1. Identify common property ('state')
// 2. Check if it's a literal type (✅ string literals)
// 3. Use it for narrowing in switch/if statements
// 4. Track exhaustiveness based on discriminant values
```

**Mapped Types for Exhaustive Handling:**

```typescript
// Ensure handler exists for every union member
type EventType = 'click' | 'hover' | 'scroll';

// This type ensures handlers object has all event types
type EventHandlers = {
  [K in EventType]: (event: Event) => void;
};

const handlers: EventHandlers = {
  click: (e) => console.log('Clicked'),
  hover: (e) => console.log('Hovered'),
  scroll: (e) => console.log('Scrolled')
  // Missing any event type = TypeScript error
};

// Using the handlers
function dispatchEvent(type: EventType, event: Event): void {
  // No need for exhaustive check - mapping guarantees coverage
  handlers[type](event);
}
```

**Conditional Types for Exhaustiveness:**

```typescript
// Extract never if exhaustive
type CheckExhaustive<T, U> = T extends U ? (U extends T ? 'exhaustive' : 'not exhaustive') : 'not exhaustive';

type Status = 'idle' | 'loading' | 'success';
type HandledCases = 'idle' | 'loading' | 'success';

type IsExhaustive = CheckExhaustive<Status, HandledCases>; // 'exhaustive'

// If we miss a case:
type IncompleteHandledCases = 'idle' | 'loading';
type IsIncomplete = CheckExhaustive<Status, IncompleteHandledCases>; // 'not exhaustive'
```

**Performance Implications:**

Exhaustive checking has **zero runtime cost** - it's purely compile-time:

```typescript
// This code:
function handleStatus(status: Status): string {
  switch (status) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      const exhaustive: never = status;
      throw new Error(`Unhandled: ${exhaustive}`);
  }
}

// Compiles to JavaScript (never appears nowhere):
function handleStatus(status) {
  switch (status) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      const exhaustive = status;
      throw new Error(`Unhandled: ${exhaustive}`);
  }
}

// Benchmark (1 million calls):
// With exhaustive check: ~45ms
// Without exhaustive check: ~45ms
// Overhead: 0ms (compile-time only!)
```

**Advanced Use Case: Redux Reducers:**

```typescript
// Type-safe Redux reducer with exhaustive action handling
type State = { count: number; user: string | null };

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_USER'; payload: string }
  | { type: 'CLEAR_USER' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };

    case 'DECREMENT':
      return { ...state, count: state.count - 1 };

    case 'SET_USER':
      // TypeScript knows action.payload exists
      return { ...state, user: action.payload };

    case 'CLEAR_USER':
      return { ...state, user: null };

    default:
      // If new action added, this line causes compile error
      const exhaustiveCheck: never = action;
      console.warn(`Unhandled action: ${exhaustiveCheck}`);
      return state;
  }
}

// Adding new action forces update:
type Action = /* existing actions */ | { type: 'RESET' };
// Compiler error: Type '{ type: "RESET"; }' is not assignable to type 'never'
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Payment State Machine Bug</strong></summary>

**Background:**
Fintech company processing online payments. State machine handled payment lifecycle with 4 states initially. New "refund pending" state added without updating all handlers, causing payments to get stuck.

**The Bug:**

```typescript
// ❌ BEFORE: No exhaustive checking
type PaymentState = 'initiated' | 'processing' | 'completed' | 'failed';

interface Payment {
  id: string;
  amount: number;
  state: PaymentState;
}

function getPaymentMessage(payment: Payment): string {
  switch (payment.state) {
    case 'initiated':
      return 'Payment initiated';
    case 'processing':
      return 'Payment processing';
    case 'completed':
      return 'Payment completed successfully';
    // ⚠️ Missing 'failed' case - but no compile error!
    default:
      return 'Unknown state';
  }
}

function canRetryPayment(payment: Payment): boolean {
  if (payment.state === 'initiated') return true;
  if (payment.state === 'processing') return false;
  if (payment.state === 'completed') return false;
  // ⚠️ Missing 'failed' case - returns undefined!
  return false;
}

// Later, developer adds 'refund_pending' state
type PaymentState = 'initiated' | 'processing' | 'completed' | 'failed' | 'refund_pending';

// ❌ No compile errors, but:
// - getPaymentMessage returns "Unknown state" for 'failed' and 'refund_pending'
// - canRetryPayment returns false for 'failed' (should be true) and 'refund_pending'
```

**Production Impact:**

**Week 1 (After adding 'refund_pending'):**
- 450 payments stuck in 'refund_pending' state
- User dashboard shows "Unknown state" message
- Support tickets: 127 complaints
- Manual intervention required for each stuck payment
- Developer time wasted: 18 hours investigating

**Week 3 (After discovering 'failed' case missing):**
- 890 failed payments couldn't be retried (UI disabled retry button)
- Customers forced to initiate new payments (double charges)
- Chargebacks filed: 34 cases ($12,800)
- Payment processor fees: Extra $445 (double processing)

**Total Impact:**
- Revenue locked: $67,500 (stuck refunds)
- Chargebacks: $12,800
- Support hours: 45 hours ($3,150 cost)
- Developer hours: 28 hours ($4,200 cost)
- **Total cost: $88,095**
- **Detection time: 3 weeks** (discovered during unrelated code review)

**The Fix: Exhaustive Checking:**

```typescript
// ✅ AFTER: Exhaustive checking with never
type PaymentState = 'initiated' | 'processing' | 'completed' | 'failed' | 'refund_pending';

interface Payment {
  id: string;
  amount: number;
  state: PaymentState;
}

// Helper function for exhaustive checking
function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

function getPaymentMessage(payment: Payment): string {
  switch (payment.state) {
    case 'initiated':
      return 'Payment initiated. Please wait...';
    case 'processing':
      return 'Payment is being processed';
    case 'completed':
      return 'Payment completed successfully';
    case 'failed':
      return 'Payment failed. Please retry.';
    case 'refund_pending':
      return 'Refund is being processed';
    default:
      // ✅ TypeScript error if any case missing!
      return assertNever(payment.state);
  }
}

function canRetryPayment(payment: Payment): boolean {
  switch (payment.state) {
    case 'initiated':
    case 'failed':
      return true; // ✅ Can retry

    case 'processing':
    case 'completed':
    case 'refund_pending':
      return false; // ✅ Cannot retry

    default:
      // ✅ Compile error if missing case
      return assertNever(payment.state);
  }
}

// ✅ Now when adding new state:
type PaymentState = /* existing */ | 'cancelled';
// Immediate TypeScript errors in:
// - getPaymentMessage (default case)
// - canRetryPayment (default case)
// Developer forced to handle 'cancelled' before compiling
```

**Enhanced Implementation with State Transitions:**

```typescript
// Define valid state transitions
type StateTransition = {
  [K in PaymentState]: PaymentState[];
};

const validTransitions: StateTransition = {
  initiated: ['processing', 'failed', 'cancelled'],
  processing: ['completed', 'failed'],
  completed: ['refund_pending'],
  failed: ['initiated'], // Can retry
  refund_pending: ['completed'], // Refund completed
  cancelled: [] // Terminal state
  // ✅ TypeScript enforces all states present
};

function canTransition(from: PaymentState, to: PaymentState): boolean {
  // Type-safe - validTransitions has all states
  return validTransitions[from].includes(to);
}

// State machine with exhaustive checking
function transitionPayment(
  payment: Payment,
  newState: PaymentState
): Payment {
  // Validate transition
  if (!canTransition(payment.state, newState)) {
    throw new Error(
      `Invalid transition: ${payment.state} → ${newState}`
    );
  }

  // Update state with side effects
  switch (newState) {
    case 'initiated':
      logEvent('payment_initiated', payment.id);
      return { ...payment, state: newState };

    case 'processing':
      logEvent('payment_processing', payment.id);
      notifyPaymentProcessor(payment);
      return { ...payment, state: newState };

    case 'completed':
      logEvent('payment_completed', payment.id);
      sendReceiptEmail(payment);
      return { ...payment, state: newState };

    case 'failed':
      logEvent('payment_failed', payment.id);
      notifyUser('Payment failed', payment);
      return { ...payment, state: newState };

    case 'refund_pending':
      logEvent('refund_pending', payment.id);
      initiateRefund(payment);
      return { ...payment, state: newState };

    case 'cancelled':
      logEvent('payment_cancelled', payment.id);
      return { ...payment, state: newState };

    default:
      // ✅ Compile error if missing state
      return assertNever(newState);
  }
}
```

**Automated Testing Integration:**

```typescript
// Test ALL state transitions (generated from exhaustive type)
describe('Payment state machine', () => {
  // Type-safe test generation
  const allStates: PaymentState[] = [
    'initiated',
    'processing',
    'completed',
    'failed',
    'refund_pending',
    'cancelled'
  ];

  allStates.forEach(state => {
    it(`should handle ${state} state`, () => {
      const payment: Payment = {
        id: 'test',
        amount: 100,
        state: state
      };

      // Test each function with every state
      expect(() => getPaymentMessage(payment)).not.toThrow();
      expect(() => canRetryPayment(payment)).not.toThrow();
    });
  });

  // ✅ If new state added, this test fails until we add it to allStates
  // This prompts developer to test the new state
});
```

**Monitoring Dashboard Integration:**

```typescript
// Track state distribution with exhaustive metrics
type StateMetrics = {
  [K in PaymentState]: number;
};

function getStateMetrics(payments: Payment[]): StateMetrics {
  // Initialize with all states (exhaustive)
  const metrics: StateMetrics = {
    initiated: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    refund_pending: 0,
    cancelled: 0
    // ✅ TypeScript error if missing any state
  };

  payments.forEach(payment => {
    metrics[payment.state]++; // Type-safe
  });

  return metrics;
}

// Dashboard display (all states guaranteed)
function displayMetrics(metrics: StateMetrics): void {
  // Each state explicitly shown
  console.log('Payment States:');
  console.log(`  Initiated: ${metrics.initiated}`);
  console.log(`  Processing: ${metrics.processing}`);
  console.log(`  Completed: ${metrics.completed}`);
  console.log(`  Failed: ${metrics.failed}`);
  console.log(`  Refund Pending: ${metrics.refund_pending}`);
  console.log(`  Cancelled: ${metrics.cancelled}`);

  // ✅ If new state added, TypeScript forces us to display it
}
```

**Results After Fix:**

**Immediate Impact:**
- 6 compile errors revealed missing cases (across 4 files)
- All cases fixed before deploying
- Zero stuck payments after fix
- State transitions validated at compile-time

**Long-term Benefits (6 months):**
- New states added: 2 ('disputed', 'chargeback')
- Bugs caught at compile-time: 11 instances
- Support tickets related to state bugs: 0
- Developer confidence increased (surveys)
- Code review time reduced 40% (type safety guaranteed)

**Cost Savings:**
- **Before fix**: $88k cost from missing cases (one incident)
- **After fix**: $0 cost (bugs caught at compile-time)
- **Development overhead**: 4 hours to add exhaustive checks
- **ROI**: $88k saved / 4 hours = $22k per hour invested

</details>

<details>
<summary><strong>⚖️ Trade-offs: Exhaustive Checking Patterns</strong></summary>

**Pattern 1: assertNever Helper vs Inline Checks:**

| Approach | Pros | Cons |
|----------|------|------|
| **assertNever helper** | Reusable, cleaner syntax, stack traces | Extra function call (negligible overhead) |
| **Inline checks** | No function overhead, explicit | Repetitive code, harder to maintain |

```typescript
// Option A: assertNever helper (recommended)
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function handle1(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      return assertNever(value); // ✅ Clean
  }
}

// Option B: Inline check
function handle2(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      const exhaustive: never = value;
      throw new Error(`Unexpected: ${exhaustive}`); // ❌ Repetitive
  }
}

// Performance (1 million calls):
// assertNever: ~48ms (function call overhead)
// Inline: ~46ms (slightly faster)
// Difference: 2ms (negligible)
```

**Pattern 2: Switch vs If-Else:**

| Approach | Best For | Readability | Performance |
|----------|----------|-------------|-------------|
| **Switch** | 3+ cases | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ (jump table) |
| **If-Else** | 2 cases, complex conditions | ⭐⭐⭐ | ⚡⚡⚡ (sequential) |

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';

// Switch: Best for simple equality checks
function getPriority1(priority: Priority): number {
  switch (priority) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    case 'critical': return 4;
    default:
      return assertNever(priority);
  }
}

// If-Else: Better for complex conditions
function getPriority2(priority: Priority, urgent: boolean): number {
  if (priority === 'critical' || urgent) {
    return 4;
  } else if (priority === 'high') {
    return 3;
  } else if (priority === 'medium') {
    return 2;
  } else if (priority === 'low') {
    return 1;
  } else {
    return assertNever(priority);
  }
}

// Benchmark (1 million calls, 4 cases):
// Switch: ~42ms (jump table optimization)
// If-Else: ~55ms (sequential checks)
```

**Pattern 3: Object Mapping vs Switch:**

| Approach | Pros | Cons |
|----------|------|------|
| **Object mapping** | Declarative, no default needed | Limited to simple mappings |
| **Switch** | Complex logic, side effects | Needs default case |

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

// Object mapping: Best for simple value lookups
const statusMessages: { [K in Status]: string } = {
  idle: 'Ready',
  loading: 'Loading...',
  success: 'Done',
  error: 'Failed'
};

function getMessage1(status: Status): string {
  return statusMessages[status]; // ✅ No default needed
}

// Switch: Better for complex logic
function getMessage2(status: Status, context: Context): string {
  switch (status) {
    case 'idle':
      return 'Ready to start';
    case 'loading':
      return `Loading ${context.resource}...`;
    case 'success':
      return `Successfully loaded ${context.count} items`;
    case 'error':
      return `Error: ${context.error.message}`;
    default:
      return assertNever(status);
  }
}

// Performance (1 million calls):
// Object mapping: ~12ms (direct property access)
// Switch: ~42ms (jump table + logic)
// Object mapping is 3.5x faster for simple cases
```

**Pattern 4: Discriminated Unions vs Simple Unions:**

| Approach | Type Safety | Code Complexity | Refactoring |
|----------|-------------|-----------------|-------------|
| **Discriminated** | ⭐⭐⭐⭐⭐ | Medium | Easy |
| **Simple unions** | ⭐⭐⭐ | Low | Harder |

```typescript
// Simple union: Less overhead
type SimpleStatus = 'idle' | 'loading' | 'success' | 'error';

function handleSimple(status: SimpleStatus): void {
  switch (status) {
    case 'idle': /* ... */; break;
    case 'loading': /* ... */; break;
    case 'success': /* ... */; break;
    case 'error': /* ... */; break;
    default: assertNever(status);
  }
}

// Discriminated union: More powerful
type DiscriminatedStatus =
  | { state: 'idle' }
  | { state: 'loading'; progress: number }
  | { state: 'success'; data: string }
  | { state: 'error'; error: Error };

function handleDiscriminated(status: DiscriminatedStatus): void {
  switch (status.state) {
    case 'idle': break;
    case 'loading':
      console.log(`Progress: ${status.progress}%`); // ✅ Type-safe
      break;
    case 'success':
      console.log(`Data: ${status.data}`); // ✅ Type-safe
      break;
    case 'error':
      console.log(`Error: ${status.error.message}`); // ✅ Type-safe
      break;
    default:
      assertNever(status);
  }
}

// Trade-off: Discriminated unions require more boilerplate
// but provide better type safety for complex states
```

**Pattern 5: Exhaustive Check Placement:**

```typescript
// Option A: Return in default (functional style)
function handle1(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      return assertNever(value); // ✅ Functional
  }
}

// Option B: Throw in default (imperative style)
function handle2(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      assertNever(value); // Throws
  }
  // ⚠️ TypeScript knows this is unreachable
}

// Option C: Both return and throw (defensive)
function handle3(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      assertNever(value);
      return 'Unknown'; // Dead code, but satisfies linters
  }
}

// Recommendation: Option A (return in default)
// - Clearest intent
// - No dead code
// - Satisfies all linters
```

**Decision Matrix:**

| Scenario | Recommended Pattern | Reason |
|----------|---------------------|---------|
| Simple value mapping | Object mapping | Fastest, most declarative |
| 2 cases | If-else | Simpler than switch |
| 3+ cases | Switch with assertNever | Jump table optimization |
| Complex logic per case | Switch with assertNever | Supports side effects |
| State with data | Discriminated unions | Type-safe data access |
| Redux reducers | Switch with assertNever | Industry standard |
| Router handlers | Object mapping or switch | Depends on complexity |

**When NOT to Use Exhaustive Checking:**

```typescript
// ❌ Don't use for runtime strings
function handleDynamic(input: string): void {
  // input is too broad - can't exhaust all strings
  switch (input) {
    case 'foo': /* ... */; break;
    case 'bar': /* ... */; break;
    default:
      // Don't use assertNever here - input is string, not never
      console.log('Unknown input');
  }
}

// ❌ Don't use for numbers
function handleNumber(n: number): void {
  // Can't exhaust all numbers
  switch (n) {
    case 0: /* ... */; break;
    case 1: /* ... */; break;
    default:
      // Don't use assertNever
      console.log('Other number');
  }
}

// ✅ DO use for literal unions
type Action = 'start' | 'stop' | 'pause';
function handleAction(action: Action): void {
  switch (action) {
    case 'start': /* ... */; break;
    case 'stop': /* ... */; break;
    case 'pause': /* ... */; break;
    default:
      assertNever(action); // ✅ Correct usage
  }
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior: The Checklist Analogy</strong></summary>

**Simple Explanation:**

Imagine you're a waiter taking orders at a restaurant. The menu has 4 items: burger, pizza, salad, pasta.

**Without Exhaustive Checking (Bad Waiter):**
```typescript
function takeOrder(item: string) {
  if (item === 'burger') {
    console.log('Making burger...');
  } else if (item === 'pizza') {
    console.log('Making pizza...');
  } else {
    console.log('I don\'t know what that is'); // Forgot salad and pasta!
  }
}

// Customer orders salad → "I don't know what that is" ❌
```

**With Exhaustive Checking (Good Waiter):**
```typescript
type MenuItem = 'burger' | 'pizza' | 'salad' | 'pasta';

function takeOrder(item: MenuItem) {
  switch (item) {
    case 'burger':
      console.log('Making burger...');
      break;
    case 'pizza':
      console.log('Making pizza...');
      break;
    case 'salad':
      console.log('Making salad...');
      break;
    case 'pasta':
      console.log('Making pasta...');
      break;
    default:
      // TypeScript: "Hey! You handled all 4 items perfectly!"
      const exhaustive: never = item;
      throw new Error(`Unknown item: ${exhaustive}`);
  }
}

// ✅ All menu items handled
```

**What Happens When Menu Changes:**

```typescript
// Restaurant adds 'soup' to menu
type MenuItem = 'burger' | 'pizza' | 'salad' | 'pasta' | 'soup';

// Without exhaustive check:
// ❌ No error - but soup orders return "I don't know what that is"

// With exhaustive check:
// ✅ TypeScript ERROR: "You forgot to handle soup!"
// Forces you to add soup case before code compiles
```

**Real Code Example:**

```typescript
// Traffic light states
type TrafficLight = 'red' | 'yellow' | 'green';

// Helper function (like a checklist validator)
function assertNever(value: never): never {
  throw new Error(`Forgot to handle: ${value}`);
}

// What to do at each light
function whatToDo(light: TrafficLight): string {
  switch (light) {
    case 'red':
      return 'STOP';
    case 'yellow':
      return 'SLOW DOWN';
    case 'green':
      return 'GO';
    default:
      // If all cases handled, light is 'never' here
      return assertNever(light);
  }
}

// ✅ All 3 lights handled - TypeScript is happy

// If city adds 'flashing red':
type TrafficLight = 'red' | 'yellow' | 'green' | 'flashing-red';

// TypeScript ERROR in default case:
// "Type 'flashing-red' is not assignable to type 'never'"
// Translation: "You forgot to handle flashing-red!"
```

**Why This Matters:**

**Without Exhaustive Checking:**
```typescript
// Developer adds 'cancelled' status
type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

// But forgets to update this function
function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Order is pending';
    case 'shipped':
      return 'Order has shipped';
    case 'delivered':
      return 'Order delivered';
    // Forgot 'cancelled'!
    default:
      return 'Unknown status'; // ❌ Wrong message for cancelled orders
  }
}

// Result: Users see "Unknown status" for cancelled orders
// Bug discovered: 2 weeks later, 340 support tickets
```

**With Exhaustive Checking:**
```typescript
function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Order is pending';
    case 'shipped':
      return 'Order has shipped';
    case 'delivered':
      return 'Order delivered';
    default:
      return assertNever(status); // ✅ TypeScript catches missing 'cancelled'
  }
}

// TypeScript ERROR immediately:
// "Type 'cancelled' is not assignable to type 'never'"
// Developer forced to add cancelled case before deploying
```

**Interview Answer Template:**

**Question: "What is exhaustive checking and how do you implement it?"**

**Answer:**
"Exhaustive checking ensures all cases in a union type are handled. I use TypeScript's `never` type to catch missing cases at compile-time.

Here's how it works: In a switch statement's default case, I assign the value to a variable of type `never`. If all union members are handled, TypeScript infers the value is `never` in the default branch, so the assignment succeeds. If I miss any case, TypeScript knows that case could reach the default branch, making the value NOT `never`, which causes a compile error.

For example, with a Status type of 'loading', 'success', 'error', I'd create a helper function `assertNever` and call it in the default case. If I add a 'pending' status later but forget to handle it, TypeScript immediately errors, forcing me to update the switch.

This prevents bugs where new union members are added but not handled everywhere. It's especially valuable in Redux reducers, state machines, and anywhere I need to guarantee all cases are covered."

**Common Mistakes for Beginners:**

```typescript
// ❌ Mistake 1: Using never with broad types
function mistake1(value: string) {
  switch (value) {
    case 'foo': return 'Foo';
    default:
      const x: never = value; // ERROR: string not assignable to never
  }
}
// Fix: Only use with literal union types

// ❌ Mistake 2: Forgetting to return/throw in default
function mistake2(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    default:
      const x: never = value;
      // Forgot to return/throw - function can return undefined!
  }
}
// Fix: Always return or throw after assertNever

// ❌ Mistake 3: Using any instead of never
function mistake3(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    default:
      const x: any = value; // ⚠️ No error, defeats purpose
      return 'Unknown';
  }
}
// Fix: Use never, not any

// ✅ Correct pattern
function correct(value: Status): string {
  switch (value) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading';
    default:
      return assertNever(value); // ✅ Perfect
  }
}
```

**Quick Reference Checklist:**

```typescript
// Step-by-step guide for beginners:

// 1. Define union type
type Status = 'idle' | 'loading' | 'success';

// 2. Create assertNever helper (copy this!)
function assertNever(x: never): never {
  throw new Error(`Unhandled value: ${x}`);
}

// 3. Handle all cases in switch
function handle(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Idle';
    case 'loading':
      return 'Loading';
    case 'success':
      return 'Success';
    default:
      // 4. Call assertNever in default
      return assertNever(status);
  }
}

// 5. Test by adding new case
type Status = 'idle' | 'loading' | 'success' | 'error';
// TypeScript error → add 'error' case → error gone ✅
```

**Visual Mental Model:**

```
Union Type: 🔴 🟡 🟢 (red, yellow, green)

Switch Statement:
  🔴 handled ✅
  🟡 handled ✅
  🟢 handled ✅

Default case:
  What's left? → NOTHING (never) ✅

If you add 🔵 (blue):
  🔴 handled ✅
  🟡 handled ✅
  🟢 handled ✅

Default case:
  What's left? → 🔵 (blue) ❌
  TypeScript: "ERROR! Blue is not never!"
  You: "Oh, I forgot blue! Let me add it."
```

This mental model helps you remember: **never means "nothing left to handle"**. If something's left, it's not never, and TypeScript complains.

</details>
