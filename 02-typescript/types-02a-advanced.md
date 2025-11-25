# TypeScript Advanced Patterns

> Advanced type patterns: template literals, recursion, and deep operations

---

## Questions 4-15: Advanced Type Patterns

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Consolidated coverage of advanced TypeScript patterns**

### Q4-6: Utility Types Deep Dive

```typescript
// Partial - Makes all properties optional
type User = { id: number; name: string; email: string };
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// Required - Makes all properties required
type RequiredUser = Required<PartialUser>;

// Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit - Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string }

// Record - Create object type with specific keys
type UserRoles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean }

// Exclude - Remove types from union
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract - Extract types from union
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;
// 'a'

// NonNullable - Remove null and undefined
type T3 = NonNullable<string | number | null | undefined>;
// string | number

// ReturnType - Extract function return type
function getUser() {
  return { id: 1, name: 'John' };
}
type User2 = ReturnType<typeof getUser>;

// Parameters - Extract function parameters
type Params = Parameters<typeof getUser>;
// []
```

---

<details>
<summary><strong>🔍 Deep Dive: Mapped Types and Conditional Type Internals</strong></summary>

#### 🔍 **Deep Dive: Mapped Types and Conditional Type Internals**

TypeScript's utility types are built on two foundational mechanisms: **mapped types** and **conditional types**. Understanding their internal implementation reveals how TypeScript performs type transformations at compile time.

**Mapped Types Mechanics:**

Mapped types iterate over keys using the `in` operator with index signatures. The syntax `[P in keyof T]` creates a new type by mapping over all properties of `T`. TypeScript processes these transformations during the type-checking phase, not at runtime.

```typescript
// Partial implementation internals
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// The `?` modifier makes each property optional
// TypeScript applies this transformation to the type structure
// Resulting in a new object type with modified property modifiers

// Required implementation (removes optional modifier)
type Required<T> = {
  [P in keyof T]-?: T[P];
};
// The `-?` syntax removes the optional modifier
// This is called a mapping modifier in TypeScript's type system

// Pick implementation using constraint
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
// K is constrained to valid keys of T
// Only specified keys are mapped to the new type
```

**Conditional Types Mechanics:**

Conditional types use the `extends` keyword for type-level branching. They follow the pattern `T extends U ? X : Y`, evaluated at compile time through TypeScript's type inference engine.

```typescript
// Exclude implementation
type Exclude<T, U> = T extends U ? never : T;

// How it works with union types (distributive conditional types):
// Exclude<'a' | 'b' | 'c', 'a'>
// = ('a' extends 'a' ? never : 'a') | ('b' extends 'a' ? never : 'b') | ('c' extends 'a' ? never : 'c')
// = never | 'b' | 'c'
// = 'b' | 'c'

// Extract implementation
type Extract<T, U> = T extends U ? T : never;

// NonNullable implementation
type NonNullable<T> = T extends null | undefined ? never : T;
```

**Advanced Inference with `infer` Keyword:**

The `infer` keyword allows TypeScript to capture types within conditional types, enabling powerful introspection capabilities.

```typescript
// ReturnType implementation
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;

// Step-by-step evaluation for: ReturnType<() => string>
// 1. T = () => string
// 2. Check: (() => string) extends (...args: any) => infer R
// 3. Pattern matches, capture R = string
// 4. Return R (which is string)

// Parameters implementation
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// Example: Parameters<(a: number, b: string) => void>
// infer P captures [number, string] as a tuple type
```

**Homomorphic vs Non-Homomorphic Mapped Types:**

Understanding this distinction is crucial for performance and behavior:

```typescript
// Homomorphic: Preserves property modifiers
type Partial<T> = { [P in keyof T]?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
// These preserve readonly/optional modifiers from the original type

// Non-Homomorphic: Creates new structure
type Record<K extends keyof any, T> = { [P in K]: T };
// Doesn't preserve modifiers; creates entirely new type

// Practical difference:
interface User {
  readonly id: number;
  name?: string;
}

type PartialUser = Partial<User>;
// { readonly id?: number; name?: string }
// Preserved readonly on id

type RecordUser = Record<'id' | 'name', string>;
// { id: string; name: string }
// No modifiers preserved
```

**Variance and Type Safety:**

TypeScript utility types demonstrate different variance behaviors:

```typescript
// Covariance in mapped types
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type AnimalBox<T> = { value: T };

// Partial<Dog> is assignable to Partial<Animal>
const dogPartial: Partial<Dog> = { breed: 'Labrador' };
const animalPartial: Partial<Animal> = dogPartial; // ✅ Works

// Contravariance in function parameters
type Fn<T> = (arg: T) => void;
type ParamType = Parameters<Fn<Dog>>[0]; // Dog
```

**Compiler Optimizations:**

TypeScript employs several optimizations when processing utility types:

1. **Type Caching**: Identical type transformations are cached to avoid recomputation
2. **Lazy Evaluation**: Types are only fully resolved when needed
3. **Structural Sharing**: Common type structures are shared in memory
4. **Instantiation Depth Limits**: Prevents infinite recursion (default limit: 50)

```typescript
// This hits instantiation depth limits
type DeepNested<T, N extends number = 0> =
  N extends 50 ? T : DeepNested<{ nested: T }, /* ... */>;
```

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Response Type Transformation Crisis</strong></summary>

#### 🐛 **Real-World Scenario: API Response Type Transformation Crisis**

**Context:** E-commerce platform with 2.3M daily active users experiencing critical type safety regression in API layer (Node.js backend + React frontend, 850+ API endpoints).

**The Bug:**

Engineering team implemented a generic API response wrapper using utility types, but incomplete type transformations led to runtime errors bypassing TypeScript's safety net:

```typescript
// ❌ PROBLEM: Unsafe response wrapper
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: number;
    requestId: string;
  };
  errors?: Array<{ code: string; message: string }>;
}

// Partial updates endpoint - BROKEN
async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
  return response.json(); // ⚠️ Type says User, but runtime is Partial<User>
}

// Frontend usage - runtime crash
const updatedUser = await updateUser('123', { name: 'John' });
console.log(updatedUser.data.email.toLowerCase());
// 💥 TypeError: Cannot read property 'toLowerCase' of undefined
// Backend only returned { name: 'John' }, not full User object
```

**Production Impact Metrics:**

- **Error Rate Spike**: 340% increase in frontend exceptions (from 0.3% to 1.32% of requests)
- **Failed Transactions**: 12,400 checkout failures over 3 days ($847,000 in abandoned carts)
- **Customer Support**: 2,100+ tickets related to "app crashes on profile update"
- **Mobile App Crashes**: 18,000+ crash reports (iOS: 11.2K, Android: 6.8K)
- **Sentry Alerts**: 450 grouped errors, impacting 34% of user sessions

**Root Cause Analysis:**

Investigation revealed multiple utility type misuses:

```typescript
// Issue 1: Return type doesn't match runtime data
type PartialUpdateResponse<T> = ApiResponse<T>; // Should be ApiResponse<Partial<T>>

// Issue 2: Omit removing required validation fields
type PublicUser = Omit<User, 'password' | 'passwordHash'>;
// Problem: Frontend code assumed 'email' exists, but some endpoints
// also omitted 'email' for privacy, causing undefined access

// Issue 3: Pick creating incomplete types for forms
type UserFormData = Pick<User, 'name' | 'email'>;
async function submitForm(data: UserFormData) {
  // Backend validation expected 'phone' field too
  // Type system didn't catch missing required field
}

// Issue 4: Record type assuming all properties exist
type FeatureFlags = Record<string, boolean>;
const flags: FeatureFlags = await fetchFlags();
if (flags.newCheckout) { /* ... */ }
// Runtime: flags.newCheckout = undefined (not false)
// Caused production feature to break silently
```

**Debugging Process:**

```typescript
// Step 1: Add runtime validation with type guards
function isCompleteUser(user: Partial<User>): user is User {
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.phone === 'string'
  );
}

// Step 2: Instrument API responses with Zod schemas
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  createdAt: z.number()
});

const PartialUserSchema = UserSchema.partial();

// Step 3: Validate at boundary
async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<ApiResponse<Partial<User>>> { // ✅ Fixed return type
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });

  const json = await response.json();

  // Runtime validation
  const validation = PartialUserSchema.safeParse(json.data);
  if (!validation.success) {
    console.error('API response validation failed:', validation.error);
    throw new Error('Invalid API response structure');
  }

  return json;
}
```

**The Fix:**

Implemented comprehensive type-safe API layer with proper utility type usage:

```typescript
// ✅ SOLUTION: Type-safe response wrappers

// 1. Generic response types that match reality
interface ApiResponse<T> {
  data: T;
  meta: { timestamp: number; requestId: string };
  errors?: ApiError[];
}

// 2. Specific operation types
type CreateResponse<T> = ApiResponse<T>; // Returns full object
type UpdateResponse<T> = ApiResponse<Partial<T>>; // Returns partial
type DeleteResponse = ApiResponse<{ id: string; deletedAt: number }>;

// 3. Safe utility type combinations
type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>>;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional in type system
  passwordHash: string;
  createdAt: number;
}

// Public API type: Remove sensitive fields, require core fields
type PublicUser = RequiredPick<
  Omit<User, 'passwordHash'>,
  'id' | 'name' | 'email'
> & Pick<User, 'phone' | 'createdAt'>;

// 4. Form validation types
type UserUpdateForm = Partial<Pick<User, 'name' | 'email' | 'phone'>>;

// 5. Type-safe API client
class TypeSafeApiClient {
  async updateUser(
    id: string,
    updates: UserUpdateForm
  ): Promise<UpdateResponse<PublicUser>> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    // Validate response structure
    this.validateResponse(data, ['data', 'meta']);

    return data as UpdateResponse<PublicUser>;
  }

  private validateResponse(data: any, requiredKeys: string[]): void {
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new ApiValidationError(`Missing required key: ${key}`);
      }
    }
  }
}

// 6. Frontend usage with proper null checks
const client = new TypeSafeApiClient();

async function handleUserUpdate(updates: UserUpdateForm) {
  try {
    const response = await client.updateUser('123', updates);

    // TypeScript knows response.data is Partial<PublicUser>
    const { data } = response;

    // Safe access with optional chaining
    console.log(data.name ?? 'Unknown');
    console.log(data.email?.toLowerCase() ?? 'no-email');

    // Type guard for full access
    if (isCompletePublicUser(data)) {
      // Now TypeScript knows all required fields exist
      console.log(data.email.toLowerCase()); // ✅ Safe
    }
  } catch (error) {
    handleApiError(error);
  }
}

function isCompletePublicUser(
  user: Partial<PublicUser>
): user is PublicUser {
  return !!(user.id && user.name && user.email);
}
```

**Results After Fix:**

- **Error Rate**: Dropped from 1.32% to 0.18% (86% reduction)
- **Zero Runtime Type Errors**: Over 30 days post-deployment
- **Type Coverage**: Increased from 73% to 94% across API layer
- **Build-Time Catches**: 127 additional type errors caught during migration
- **Bundle Size**: No impact (utility types are compile-time only)
- **Developer Velocity**: +23% (fewer runtime debugging sessions)

**Key Lessons:**

1. **Match Types to Runtime Reality**: `Promise<ApiResponse<User>>` should only be used when backend returns complete User object
2. **Validate at Boundaries**: Use runtime validation (Zod, io-ts) where TypeScript's static analysis ends
3. **Combine Utilities Carefully**: `Required<Pick<T, K>>` ensures selected fields are required
4. **Document Type Contracts**: API responses should have explicit type documentation
5. **Use Branded Types for IDs**: Prevents string/number ID confusion

</details>

<details>
<summary><strong>⚖️ Trade-offs: Utility Type Complexity vs. Type Safety</strong></summary>

#### ⚖️ **Trade-offs: Utility Type Complexity vs. Type Safety**

**Decision Matrix: When to Use Built-in vs. Custom Utility Types**

| Scenario | Built-in Utility | Custom Type | Recommendation |
|----------|------------------|-------------|----------------|
| Form data (subset of fields) | `Pick<User, 'name' \| 'email'>` | `type FormData = { name: string; email: string }` | **Built-in** if source type is stable |
| API responses (partial updates) | `Partial<User>` | Explicit optional fields | **Custom** for critical paths |
| Removing sensitive fields | `Omit<User, 'password'>` | Explicit public type | **Custom** for security |
| Dynamic key-value objects | `Record<string, T>` | Index signature | **Built-in** for flexibility |
| Union type filtering | `Exclude<T, U>` | Manual union | **Built-in** always |
| Function signature extraction | `ReturnType<T>` | Manual typing | **Built-in** for DRY |

**Trade-off #1: Type Inference vs. Explicit Declarations**

```typescript
// Option A: Inferred with utility types (concise, DRY)
const getUser = () => ({ id: 1, name: 'John', email: 'john@example.com' });
type UserType = ReturnType<typeof getUser>;

// ✅ Pros:
// - Single source of truth (function implementation)
// - Automatic updates when function changes
// - Less code duplication

// ❌ Cons:
// - Harder to read type definition
// - IDE autocomplete less helpful
// - Type errors reference complex inferred types

// Option B: Explicit type declarations
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = (): User => ({ id: 1, name: 'John', email: 'john@example.com' });

// ✅ Pros:
// - Clear, self-documenting
// - Better IDE support
// - Easier to debug type errors

// ❌ Cons:
// - Must keep function and type in sync manually
// - More boilerplate

// Recommendation: Use explicit types for public APIs, inferred for internal utilities
```

**Trade-off #2: Partial vs. Optional Properties**

```typescript
// Option A: Partial utility type
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

type UserUpdate = Partial<User>;
// All fields optional

// ✅ Pros:
// - Single-line declaration
// - Automatically syncs with User changes
// - Clear intent: "any subset of User"

// ❌ Cons:
// - May allow unintended optional fields (e.g., 'id' should never change)
// - No control over which fields are optional

// Option B: Explicit optional fields
type UserUpdate = {
  id?: never; // Explicitly prevent id updates
  name?: string;
  email?: string;
  phone?: string;
};

// ✅ Pros:
// - Precise control over update surface
// - Can prevent dangerous operations (id updates)
// - Self-documenting business rules

// ❌ Cons:
// - Must update when User interface changes
// - More verbose

// Option C: Hybrid approach
type UserUpdate = Partial<Omit<User, 'id'>> & Pick<User, 'id'>;
// id is required, everything else optional

// ✅ Pros:
// - Best of both: DRY + safety
// - Prevents id modifications
// - Syncs with User changes

// ❌ Cons:
// - More complex type expression
// - Harder for junior developers to understand

// Performance comparison:
// - All compile to identical JavaScript (zero runtime cost)
// - Type checking time: <1ms difference for typical codebases
// - Bundle size impact: None (types are erased)

// Recommendation based on team size:
// - Small team (1-5): Partial is fine
// - Medium team (6-20): Hybrid approach
// - Large team (20+): Explicit types with documentation
```

**Trade-off #3: Record vs. Index Signature vs. Map**

```typescript
// Option A: Record utility type
type UserCache = Record<string, User>;

const cache: UserCache = {
  'user123': { id: 'user123', name: 'John', email: 'john@example.com' }
};

// ✅ Pros:
// - Concise syntax
// - TypeScript enforces value type
// - Object literal syntax, familiar to developers

// ❌ Cons:
// - No autocompletion for keys
// - Prototype pollution risk
// - 'in' operator doesn't guarantee runtime existence

// Option B: Index signature
type UserCache = {
  [key: string]: User;
};

// ✅ Pros:
// - Identical to Record in behavior
// - More familiar to developers from pre-utility-types era

// ❌ Cons:
// - Same drawbacks as Record
// - More verbose than Record

// Option C: Map data structure
const cache = new Map<string, User>();

cache.set('user123', { id: 'user123', name: 'John', email: 'john@example.com' });

// ✅ Pros:
// - No prototype pollution
// - Better performance for frequent additions/deletions
// - Iterable with for...of
// - Size property

// ❌ Cons:
// - Different API (get/set instead of property access)
// - Doesn't serialize to JSON automatically
// - Less familiar to developers

// Performance benchmarks (1M operations):
// Record/Index Signature:
// - Set: 180ms
// - Get: 120ms
// - Delete: 200ms
// - Memory: 85MB

// Map:
// - Set: 150ms (-17%)
// - Get: 110ms (-8%)
// - Delete: 140ms (-30%)
// - Memory: 78MB (-8%)

// Recommendation:
// - Small collections (<100 items): Record (developer ergonomics)
// - Large collections (>1000): Map (performance)
// - Frequent mutations: Map
// - JSON serialization needed: Record
// - Type safety priority: Record with branded keys
```

**Trade-off #4: Deep vs. Shallow Utility Types**

```typescript
// Option A: Built-in Partial (shallow)
type PartialUser = Partial<User>;

interface User {
  id: string;
  profile: {
    name: string;
    address: {
      street: string;
      city: string;
    };
  };
}

// Only top-level optional:
// { id?: string; profile?: { name: string; address: { street: string; city: string } } }

// Option B: Custom DeepPartial (recursive)
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type DeepPartialUser = DeepPartial<User>;
// All nested levels optional:
// { id?: string; profile?: { name?: string; address?: { street?: string; city?: string } } }

// ✅ Shallow Pros:
// - Faster type checking (no recursion)
// - Simpler type errors
// - Encourages explicit nested updates

// ❌ Shallow Cons:
// - Must make entire nested object optional to change one field
// - Doesn't match common update patterns

// ✅ Deep Pros:
// - Matches real-world partial update APIs
// - More flexible for nested data

// ❌ Deep Cons:
// - Slower type checking (recursive evaluation)
// - Can hit instantiation depth limits
// - Complex type errors ("Type instantiation is excessively deep")

// Type checking performance (large codebase):
// Partial: 2.3s total compilation
// DeepPartial: 4.1s total compilation (+78% slower)

// Recommendation:
// - Flat data structures: Partial
// - Nested data (2-3 levels): DeepPartial
// - Deeply nested (>4 levels): Rethink data structure or use explicit types
```

**Trade-off #5: Generic Constraints vs. Type Unions**

```typescript
// Option A: Generic with constraint
type ApiResponse<T extends { id: string }> = {
  data: T;
  meta: { timestamp: number };
};

function processResponse<T extends { id: string }>(
  response: ApiResponse<T>
): void {
  console.log(response.data.id); // ✅ TypeScript knows id exists
}

// ✅ Pros:
// - Type-safe generic programming
// - Reusable across many types
// - Enforces contract at compile time

// ❌ Cons:
// - Complex for simple cases
// - Verbose call sites with explicit type parameters

// Option B: Union of specific types
type UserResponse = { data: User; meta: { timestamp: number } };
type ProductResponse = { data: Product; meta: { timestamp: number } };
type ApiResponse = UserResponse | ProductResponse;

function processResponse(response: ApiResponse): void {
  // Need type narrowing
  if ('name' in response.data) {
    // User response
  }
}

// ✅ Pros:
// - Simpler for known, finite set of types
// - No generic type parameters

// ❌ Cons:
// - Not extensible (must modify type for new APIs)
// - Requires runtime type narrowing

// Recommendation:
// - <5 response types: Union types
// - >5 response types or library/framework code: Generics
// - Public API: Generics for flexibility
```

**Decision Framework Summary:**

1. **Team Experience Level**:
   - Junior-heavy: Prefer explicit types over complex utilities
   - Senior-heavy: Leverage advanced utility combinations

2. **Codebase Size**:
   - Small (<10K lines): Simple utilities (Partial, Pick, Omit)
   - Large (>100K lines): Invest in custom type libraries

3. **Performance Requirements**:
   - Compile-time: Shallow utilities > Deep recursive types
   - Runtime: Zero difference (types are erased)

4. **Type Safety Priority**:
   - High (financial, healthcare): Explicit types with validation
   - Medium (internal tools): Utility types with guards
   - Low (prototypes): Minimal typing

</details>

<details>
<summary><strong>💬 Explain to Junior: Type Transformations Like Photo Filters</strong></summary>

#### 💬 **Explain to Junior: Type Transformations Like Photo Filters**

**The Big Picture:**

TypeScript utility types are like Instagram filters for your type definitions. Just as a photo filter transforms your image (make it black & white, add brightness, crop it), utility types transform your existing types into new variations without changing the original.

**Core Concept - Type as Template:**

Imagine you have a job application form with 10 fields:

```typescript
interface JobApplication {
  // Required fields
  fullName: string;
  email: string;
  phone: string;
  resume: File;

  // More fields
  coverLetter: string;
  linkedIn: string;
  portfolio: string;
  references: string[];
  startDate: Date;
  salary: number;
}
```

Now you need different versions of this form for different scenarios. Utility types help you create these variations automatically.

**Analogy #1: Partial - The "Draft Mode" Filter**

Think of `Partial` like saving a draft. You don't need every field filled out yet - everything becomes optional.

```typescript
type DraftApplication = Partial<JobApplication>;

// Real-world: Autosave feature
function autosaveDraft(draft: DraftApplication) {
  // User might only have filled name and email so far
  localStorage.setItem('draft', JSON.stringify(draft));
}

autosaveDraft({ fullName: 'John Doe' }); // ✅ Valid
autosaveDraft({ email: 'john@example.com', phone: '555-0100' }); // ✅ Valid
```

**Without Partial, you'd write:**
```typescript
// ❌ Tedious, error-prone
type DraftApplication = {
  fullName?: string;
  email?: string;
  phone?: string;
  resume?: File;
  coverLetter?: string;
  linkedIn?: string;
  portfolio?: string;
  references?: string[];
  startDate?: Date;
  salary?: number;
};
```

**Analogy #2: Pick - The "Crop Tool"**

`Pick` is like cropping a photo - you select only the parts you want to keep.

```typescript
// For email confirmation, only need these fields
type EmailConfirmation = Pick<JobApplication, 'fullName' | 'email'>;

function sendConfirmation(info: EmailConfirmation) {
  sendEmail({
    to: info.email,
    subject: `Application received, ${info.fullName}!`
  });
}

// TypeScript only allows these two properties
sendConfirmation({
  fullName: 'John Doe',
  email: 'john@example.com'
}); // ✅ Works

sendConfirmation({
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '555-0100' // ❌ Error: 'phone' doesn't exist on EmailConfirmation
});
```

**Analogy #3: Omit - The "Remove Background" Filter**

`Omit` removes parts you don't want, like removing the background from a photo.

```typescript
// Public profile: Remove sensitive info
type PublicProfile = Omit<JobApplication, 'salary' | 'resume' | 'references'>;

function displayPublicProfile(profile: PublicProfile) {
  // Can access all fields EXCEPT salary, resume, references
  return {
    name: profile.fullName,
    contact: profile.email,
    portfolio: profile.portfolio
  };
}
```

**Analogy #4: Record - The "Color Palette Creator"**

`Record` creates a collection where every key has the same type of value, like a color palette where every swatch is a color.

```typescript
// Track application status for multiple users
type ApplicationStatuses = Record<string, 'pending' | 'approved' | 'rejected'>;

const statuses: ApplicationStatuses = {
  'john@example.com': 'pending',
  'jane@example.com': 'approved',
  'bob@example.com': 'rejected'
};

// Every value MUST be one of the three statuses
statuses['alice@example.com'] = 'pending'; // ✅ Valid
statuses['eve@example.com'] = 'processing'; // ❌ Error: Not a valid status
```

**Analogy #5: Exclude/Extract - The "Filter by Color"**

Imagine sorting colored balls - `Exclude` removes specific colors, `Extract` keeps only specific colors.

```typescript
// You have different types of notifications
type AllNotifications = 'email' | 'sms' | 'push' | 'in-app' | 'webhook';

// User preferences: No webhook or in-app
type UserNotifications = Exclude<AllNotifications, 'webhook' | 'in-app'>;
// Result: 'email' | 'sms' | 'push'

// Mobile app: Only support mobile-friendly notifications
type MobileNotifications = Extract<AllNotifications, 'sms' | 'push' | 'in-app'>;
// Result: 'sms' | 'push' | 'in-app'
```

**Real-World Application Walkthrough:**

Let's build a user profile editor with proper utility types:

```typescript
// Step 1: Full user model (what database stores)
interface User {
  id: string;                    // Generated by database
  email: string;                 // Required, unique
  passwordHash: string;          // Sensitive, never expose

  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };

  settings: {
    notifications: boolean;
    darkMode: boolean;
  };

  metadata: {
    createdAt: Date;
    lastLogin: Date;
    loginCount: number;
  };
}

// Step 2: Create variations for different scenarios

// For user registration (only need email and password)
type RegistrationData = Pick<User, 'email'> & {
  password: string; // Plain password, not hash
};

function register(data: RegistrationData) {
  // Only accepts { email, password }
}

// For profile editing (exclude sensitive/system fields)
type ProfileEditForm = Omit<User, 'id' | 'passwordHash' | 'metadata'>;

// But user might not fill everything at once
type ProfileDraft = Partial<ProfileEditForm>;

function saveProfileDraft(draft: ProfileDraft) {
  // Can have any combination of fields
}

// For public display (remove ALL sensitive data)
type PublicProfile = Pick<User, 'id'> & {
  profile: Pick<User['profile'], 'firstName' | 'lastName' | 'avatar' | 'bio'>;
};

function displayProfile(user: PublicProfile) {
  // Only shows safe, public information
}

// For API responses (don't send password hash!)
type UserResponse = Omit<User, 'passwordHash'>;

function getUser(id: string): Promise<UserResponse> {
  // Returns everything except passwordHash
}
```

**Interview Answer Template:**

When asked about utility types in an interview:

**Structure your answer like this:**

1. **Definition** (10 seconds):
   "Utility types are TypeScript's built-in type transformations that create new types from existing ones, like Partial, Pick, Omit, and Record."

2. **Concrete Example** (20 seconds):
   "For example, if I have a User type with 10 properties, and I need a form that only updates the name and email, I can use `Pick<User, 'name' | 'email'>` instead of manually rewriting those fields."

3. **Why It Matters** (15 seconds):
   "This keeps types DRY - if the User interface changes, my form type automatically updates. It prevents bugs from type definitions getting out of sync."

4. **Real-World Usage** (15 seconds):
   "In my last project, we used Partial for PATCH endpoints that accept partial updates, and Omit to create public API types that exclude sensitive fields like password hashes."

**Common Interview Follow-ups:**

**Q: "How is Partial implemented?"**
**A:** "It's a mapped type that iterates over all properties and adds the optional modifier:
```typescript
type Partial<T> = { [P in keyof T]?: T[P] };
```
The `?` makes each property optional."

**Q: "What's the difference between Omit and Exclude?"**
**A:** "Omit works on object properties, Exclude works on union types. `Omit<User, 'password'>` removes the password property from an object type. `Exclude<'a' | 'b' | 'c', 'a'>` removes 'a' from a union, leaving 'b' | 'c'."

**Q: "Can you nest utility types?"**
**A:** "Yes! For example, `Partial<Pick<User, 'name' | 'email'>>` first picks name and email, then makes them optional. Or `Required<Omit<User, 'id'>>` removes id and makes everything else required."

**Memory Aid - The "PROPER" Framework:**

- **P**artial: Makes everything optional (like a draft)
- **R**ecord: Creates key-value collections (like a dictionary)
- **O**mit: Removes properties (like deleting fields)
- **P**ick: Selects properties (like cropping)
- **E**xclude: Filters out union members (like removing options)
- **R**eturnType: Extracts function return type (like copying output)

</details>

### Q7-9: Template Literal Types & String Manipulation

```typescript
// Template literal types
type Color = 'red' | 'blue' | 'green';
type Quantity = 'one' | 'two' | 'three';
type ColorQuantity = `${Quantity}-${Color}`;
// 'one-red' | 'one-blue' | ... | 'three-green'

// Uppercase, Lowercase, Capitalize, Uncapitalize
type Loud = Uppercase<'hello'>; // 'HELLO'
type Quiet = Lowercase<'WORLD'>; // 'world'
type Titled = Capitalize<'hello'>; // 'Hello'
type Untitled = Uncapitalize<'Hello'>; // 'hello'

// Event handler types
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'
```

---

<details>
<summary><strong>🔍 Deep Dive: Template Literal Type System Internals</strong></summary>

#### 🔍 **Deep Dive: Template Literal Type System Internals**

Template literal types, introduced in TypeScript 4.1, leverage the type system's pattern matching capabilities to perform compile-time string manipulations. They combine literal types with template string syntax, enabling powerful type-level string transformations.

**Type-Level String Concatenation:**

Template literal types use the same syntax as JavaScript template literals but operate entirely at the type level:

```typescript
// Basic concatenation
type Greeting = `Hello, ${string}`;
// Matches any string starting with "Hello, "

// Union distribution
type Color = 'red' | 'green' | 'blue';
type Size = 'small' | 'large';
type ColoredSize = `${Color}-${Size}`;
// Expands to: 'red-small' | 'red-large' | 'green-small' | 'green-large' | 'blue-small' | 'blue-large'

// How TypeScript processes this:
// 1. Detects template literal type with union interpolations
// 2. Performs Cartesian product of all union members
// 3. Generates all possible string literal combinations
// 4. Stores as union type in type checker

// Performance considerations:
// Type with 3 colors × 2 sizes = 6 union members
// Type with 10 colors × 5 sizes × 4 styles = 200 union members
// TypeScript has internal limits to prevent combinatorial explosion
```

**String Manipulation Intrinsics:**

TypeScript provides four intrinsic string manipulation types implemented directly in the compiler:

```typescript
// Compiler implementation (conceptual - actual impl is in C++)
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

// These are NOT implemented as TypeScript types but as compiler primitives
// Located in TypeScript compiler source: src/compiler/checker.ts

// Example usage with inference
type UppercaseGreeting<T extends string> = `HELLO ${Uppercase<T>}`;
type Result = UppercaseGreeting<'world'>; // 'HELLO WORLD'

// Conditional combinations
type SmartCase<S extends string, Mode extends 'upper' | 'lower'> =
  Mode extends 'upper' ? Uppercase<S> : Lowercase<S>;

type A = SmartCase<'Hello', 'upper'>; // 'HELLO'
type B = SmartCase<'Hello', 'lower'>; // 'hello'
```

**Advanced Pattern Matching with Template Literals:**

Template literals enable sophisticated pattern extraction through `infer` in conditional types:

```typescript
// Extract path parameters from route strings
type ExtractParams<Path extends string> =
  Path extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${infer Start}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

type RouteParams = ExtractParams<'/users/:userId/posts/:postId'>;
// Result: { userId: string; postId: string }

// Step-by-step evaluation:
// 1. Path = '/users/:userId/posts/:postId'
// 2. First match: Start='', Param='userId', Rest='posts/:postId'
// 3. Recursively extract Rest
// 4. Second match: Param='postId'
// 5. Merge all extracted params into object type

// CSS property name transformation
type CSSProperty = 'background-color' | 'font-size' | 'margin-top';

type KebabToCamel<S extends string> =
  S extends `${infer First}-${infer Rest}`
    ? `${First}${Capitalize<KebabToCamel<Rest>>}`
    : S;

type CamelCaseCSS = KebabToCamel<CSSProperty>;
// 'backgroundColor' | 'fontSize' | 'marginTop'
```

**Type-Safe Event Handler Generation:**

One of the most powerful real-world applications is auto-generating type-safe event handlers:

```typescript
// Generate event handler types from event names
type EventMap = {
  click: MouseEvent;
  keypress: KeyboardEvent;
  focus: FocusEvent;
  custom: CustomEvent<{ data: string }>;
};

// Generate handler property names
type EventHandlers = {
  [K in keyof EventMap as `on${Capitalize<K>}`]: (event: EventMap[K]) => void;
};

// Result:
// {
//   onClick: (event: MouseEvent) => void;
//   onKeypress: (event: KeyboardEvent) => void;
//   onFocus: (event: FocusEvent) => void;
//   onCustom: (event: CustomEvent<{ data: string }>) => void;
// }

// Key mapped types with template literal type transformation
// The `as` clause remaps keys using template literal type

// Usage in React-like component
interface ComponentProps extends EventHandlers {
  children: React.ReactNode;
}

function Component(props: ComponentProps) {
  // TypeScript knows exact event types for each handler
  props.onClick?.({ /* MouseEvent properties */ } as MouseEvent);
}
```

**String Literal Type Inference:**

Template literal types work with type inference to extract patterns:

```typescript
// URL query parameter extraction
function parseQuery<T extends string>(
  url: `${string}?${T}`
): ParseQueryParams<T> {
  const [, query] = url.split('?');
  // Implementation...
  return {} as ParseQueryParams<T>;
}

type ParseQueryParams<T extends string> =
  T extends `${infer Key}=${infer Value}&${infer Rest}`
    ? { [K in Key]: string } & ParseQueryParams<Rest>
    : T extends `${infer Key}=${infer Value}`
    ? { [K in Key]: string }
    : {};

const params = parseQuery('https://api.com/users?id=123&sort=desc');
// Type inferred: { id: string; sort: string }

// TypeScript flow:
// 1. Infer T from argument: T = 'id=123&sort=desc'
// 2. Apply ParseQueryParams<'id=123&sort=desc'>
// 3. Pattern match and recurse
// 4. Build object type from extracted keys
```

**Recursive Template Literal Types:**

Complex transformations can be achieved through recursion:

```typescript
// Split string into array of literals
type Split<S extends string, D extends string> =
  S extends `${infer First}${D}${infer Rest}`
    ? [First, ...Split<Rest, D>]
    : S extends ''
    ? []
    : [S];

type PathParts = Split<'users/profile/settings', '/'>;
// ['users', 'profile', 'settings']

// Join array of literals into string
type Join<T extends string[], D extends string> =
  T extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest extends []
      ? First
      : `${First}${D}${Join<Rest, D>}`
    : '';

type Path = Join<['users', 'profile', 'settings'], '/'>;
// 'users/profile/settings'

// Performance note: Deep recursion can be slow
// TypeScript limits recursion depth (tail recursion optimization in some cases)
```

**Compiler Performance Characteristics:**

```typescript
// Fast: Simple template literals
type FastType = `prefix-${string}`;

// Moderate: Small unions
type ModerateType = `${A}-${B}`; // A has 5 members, B has 5 members = 25 combinations

// Slow: Large combinatorial explosion
type Color = 'red' | 'green' | 'blue' | 'yellow' | 'orange';
type Size = 'xs' | 's' | 'm' | 'l' | 'xl';
type Variant = 'solid' | 'outline' | 'ghost';
type SlowType = `${Color}-${Size}-${Variant}`;
// 5 × 5 × 3 = 75 union members

// Very slow: Deeply nested recursion
type VerySlowType = DeepRecursion<LargeType, 20>;

// Benchmarks (TypeScript 5.0):
// - 10 union members: <5ms
// - 100 union members: ~50ms
// - 1000 union members: ~500ms (not recommended)
// - Deep recursion (>15 levels): Can timeout or hit instantiation limits
```

**Brand Types with Template Literals:**

Template literals enable sophisticated nominal typing patterns:

```typescript
// Create branded types with template literals
type Brand<T, B extends string> = T & { __brand: B };

type UserId = Brand<string, 'UserId'>;
type Email = Brand<string, `Email:${string}`>;
type ISO8601 = Brand<string, `ISO:${number}-${number}-${number}`>;

// Runtime validator with type predicate
function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sendEmail(to: Email) {
  // Guaranteed to be email format at type level
}

const userInput = 'user@example.com';
if (isEmail(userInput)) {
  sendEmail(userInput); // ✅ Type narrows to Email
}

sendEmail('not-validated'); // ❌ Error: string not assignable to Email
```

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Route Type Safety Catastrophe</strong></summary>

#### 🐛 **Real-World Scenario: API Route Type Safety Catastrophe**

**Context:** SaaS platform with 480+ API endpoints serving 1.8M requests/day. After migration to TypeScript, route parameter extraction was still error-prone, causing 200+ production incidents in 2 months.

**The Bug:**

Development team manually typed route parameters, leading to mismatches between route definitions and handler implementations:

```typescript
// ❌ PROBLEM: Manual route parameter typing
const router = express.Router();

// Route definition (string)
router.get('/users/:userId/posts/:postId/comments/:commentId', async (req, res) => {
  // Manual typing - prone to typos and inconsistency
  const { userId, postId, commentId } = req.params as {
    userId: string;
    postId: string;
    commentId: string; // Typo: should be commentId but someone might type commentID
  };

  // Business logic assumes these exist
  const user = await db.users.findById(userId);
  const post = await db.posts.findById(postId);
  const comment = await db.comments.findById(commentId);

  res.json({ user, post, comment });
});

// Different file - inconsistent typing
router.delete('/users/:userId/posts/:postId/comments/:commentId', async (req, res) => {
  const { userId, postID, commentId } = req.params as {
    userId: string;
    postID: string; // ❌ Inconsistent: postID vs postId
    commentId: string;
  };

  // Runtime error: postID is undefined (wrong parameter name)
  await db.posts.delete(postID);
});
```

**Production Impact Metrics:**

- **500 Errors**: 14,200 requests failed with "Cannot read property of undefined"
- **Data Corruption**: 38 posts deleted using wrong IDs (user complaints about missing content)
- **API Latency**: P95 latency increased 340ms due to error handling overhead
- **Customer Impact**: 890 support tickets about "profile not found" errors
- **Developer Time**: 120 hours spent debugging route parameter issues over 2 months
- **Deployment Rollbacks**: 8 hotfix deployments to correct parameter extraction bugs

**Root Cause Analysis:**

Manual type assertions created multiple failure modes:

```typescript
// Issue 1: Typos in parameter names
router.get('/orders/:orderId/items/:itemId', (req, res) => {
  const { orderID, itemId } = req.params as { orderID: string; itemId: string };
  // ❌ Route has :orderId but code expects orderID
  // Runtime: orderID = undefined
});

// Issue 2: Missing parameters in type assertion
router.get('/api/:version/users/:userId', (req, res) => {
  const { userId } = req.params as { userId: string };
  // ❌ Forgot to include 'version' parameter
  // TypeScript doesn't catch this
});

// Issue 3: Refactored route, forgot to update type
// Route changed from /posts/:id to /posts/:postId
router.get('/posts/:postId', (req, res) => {
  const { id } = req.params as { id: string }; // ❌ Outdated type
  // Runtime: id = undefined
});

// Issue 4: Inconsistent casing across codebase
router.get('/categories/:categoryId', (req, res) => {
  const { categoryID } = req.params as { categoryID: string }; // camelCase vs kebab-case mismatch
});
```

**Debugging Process:**

```typescript
// Step 1: Add runtime logging to detect undefined params
router.use((req, res, next) => {
  const routeParams = req.route?.path.match(/:(\w+)/g) || [];
  const expectedParams = routeParams.map(p => p.slice(1));
  const actualParams = Object.keys(req.params);

  const missing = expectedParams.filter(p => !(p in req.params));
  const extra = actualParams.filter(p => !expectedParams.includes(p));

  if (missing.length > 0 || extra.length > 0) {
    console.error('Route parameter mismatch:', {
      route: req.route.path,
      expected: expectedParams,
      actual: actualParams,
      missing,
      extra
    });
  }

  next();
});

// Step 2: Discovered 230+ route parameter mismatches across codebase
// Common patterns:
// - camelCase vs snake_case
// - singular vs plural (userId vs userIds)
// - abbreviations (id vs Id vs ID)
```

**The Fix:**

Implemented template literal types to auto-extract route parameters:

```typescript
// ✅ SOLUTION: Type-safe route parameter extraction

// 1. Extract parameters from route string
type ExtractRouteParams<Path extends string> =
  Path extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<`/${Rest}`>]: string }
    : Path extends `${infer Start}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

// 2. Create type-safe route handler
type RouteHandler<Path extends string> = (
  req: { params: ExtractRouteParams<Path> },
  res: Response
) => void | Promise<void>;

// 3. Type-safe router wrapper
class TypeSafeRouter {
  get<Path extends string>(
    path: Path,
    handler: RouteHandler<Path>
  ): void {
    router.get(path, handler as any);
  }

  post<Path extends string>(
    path: Path,
    handler: RouteHandler<Path>
  ): void {
    router.post(path, handler as any);
  }

  delete<Path extends string>(
    path: Path,
    handler: RouteHandler<Path>
  ): void {
    router.delete(path, handler as any);
  }
}

const typedRouter = new TypeSafeRouter();

// 4. Usage - TypeScript enforces correct parameter names
typedRouter.get('/users/:userId/posts/:postId/comments/:commentId', (req, res) => {
  // ✅ TypeScript knows exact parameters
  const { userId, postId, commentId } = req.params;
  // Type: { userId: string; postId: string; commentId: string }

  // ❌ TypeScript error if you mistype
  const { userID } = req.params; // Error: Property 'userID' does not exist

  // ✅ Autocomplete shows available params
  req.params. // IDE shows: userId, postId, commentId
});

// 5. Advanced: Support for optional and wildcard params
type ExtractAdvancedParams<Path extends string> =
  Path extends `${infer Start}/:${infer Param}?${infer Rest}`
    ? { [K in Param]?: string } & ExtractAdvancedParams<Rest>
    : Path extends `${infer Start}/*${infer Name}${infer Rest}`
    ? { [K in Name]: string } & ExtractAdvancedParams<Rest>
    : ExtractRouteParams<Path>;

// 6. Query parameter type safety
type ExtractQueryParams<Schema> = {
  [K in keyof Schema]: string | string[] | undefined;
};

function createHandler<
  Path extends string,
  QuerySchema extends Record<string, any>
>(
  path: Path,
  querySchema: QuerySchema,
  handler: (req: {
    params: ExtractRouteParams<Path>;
    query: ExtractQueryParams<QuerySchema>;
  }, res: Response) => void
) {
  return { path, handler };
}

// Usage with query params
const getUserPosts = createHandler(
  '/users/:userId/posts',
  { page: String, limit: String, sort: String },
  (req, res) => {
    const { userId } = req.params; // ✅ Type-safe
    const { page, limit, sort } = req.query; // ✅ All optional strings
  }
);
```

**Advanced Pattern: Full-Stack Type Safety:**

```typescript
// Share route definitions between frontend and backend
type ApiRoutes = {
  getUser: '/users/:userId';
  getUserPosts: '/users/:userId/posts/:postId';
  createPost: '/posts';
  deletePost: '/posts/:postId';
};

// Backend: Type-safe route registration
function registerRoute<K extends keyof ApiRoutes>(
  name: K,
  path: ApiRoutes[K],
  handler: RouteHandler<ApiRoutes[K]>
) {
  router.get(path, handler as any);
}

registerRoute('getUser', '/users/:userId', (req, res) => {
  const { userId } = req.params; // ✅ Exact type from route definition
});

// Frontend: Type-safe API client
function createApiClient<Routes extends Record<string, string>>() {
  return {
    get<K extends keyof Routes>(
      route: K,
      params: ExtractRouteParams<Routes[K]>
    ): Promise<any> {
      const url = Object.entries(params).reduce(
        (path, [key, value]) => path.replace(`:${key}`, value),
        routes[route] as string
      );
      return fetch(url).then(r => r.json());
    }
  };
}

const api = createApiClient<ApiRoutes>();

// ✅ TypeScript enforces correct parameters
await api.get('getUser', { userId: '123' });
await api.get('getUserPosts', { userId: '123', postId: '456' });

// ❌ TypeScript errors
await api.get('getUser', { userID: '123' }); // Error: wrong parameter name
await api.get('getUser', {}); // Error: missing required parameter
```

**Results After Implementation:**

- **500 Errors**: Dropped to 0 route parameter errors (100% elimination)
- **Type Safety Coverage**: 100% of 480 API routes type-safe
- **Developer Productivity**: -45% time spent on route-related bugs
- **Deployment Confidence**: Zero route parameter hotfixes in 6 months post-migration
- **Refactoring Safety**: Route refactors caught by TypeScript (23 instances during testing)
- **Build Time**: +3.2s compilation time (acceptable trade-off for safety)
- **Bundle Size**: Zero impact (types erased at runtime)

**Key Lessons:**

1. **Template Literals for String Validation**: Extract constraints from string literals
2. **Single Source of Truth**: Route definitions auto-generate types
3. **Compile-Time Guarantees**: Catch mismatches before deployment
4. **Full-Stack Consistency**: Share type definitions across layers
5. **Gradual Migration**: Can be adopted incrementally per-route

</details>

<details>
<summary><strong>⚖️ Trade-offs: Template Literal Complexity vs. Type Precision</strong></summary>

#### ⚖️ **Trade-offs: Template Literal Complexity vs. Type Precision**

**Decision Matrix: When to Use Template Literal Types**

| Use Case | Template Literal Type | Manual String Types | Recommendation |
|----------|----------------------|---------------------|----------------|
| Event handler names | `on${Capitalize<EventName>}` | Manual property names | **Template** for consistency |
| API route parameters | Extract params from path | Manual type assertion | **Template** for safety |
| CSS properties (kebab→camel) | Recursive transformation | Hardcoded mappings | **Template** if <50 properties |
| Branded string types | `Brand<string, pattern>` | Opaque types | **Template** for documentation |
| Large union generation | `${A}-${B}-${C}` | Individual literals | **Manual** if >100 combinations |
| Dynamic key generation | Computed property names | String literals | **Template** for DRY |

**Trade-off #1: Auto-Generated vs. Manual String Types**

```typescript
// Option A: Template literal auto-generation
type EventName = 'click' | 'focus' | 'blur' | 'submit';
type EventHandlers = {
  [K in EventName as `on${Capitalize<K>}`]: (event: Event) => void;
};
// Auto-generates: onClick, onFocus, onBlur, onSubmit

// ✅ Pros:
// - DRY: Single source of truth (EventName)
// - Automatic updates when events change
// - Guaranteed naming consistency

// ❌ Cons:
// - More complex type definition
// - Harder to debug type errors
// - Requires understanding of mapped + template literal types

// Option B: Manual property definitions
type EventHandlers = {
  onClick: (event: Event) => void;
  onFocus: (event: Event) => void;
  onBlur: (event: Event) => void;
  onSubmit: (event: Event) => void;
};

// ✅ Pros:
// - Explicit, easy to understand
// - Simple IDE autocomplete
// - Clear error messages

// ❌ Cons:
// - Manual synchronization required
// - Prone to naming inconsistencies
// - Must update in multiple places

// Performance comparison:
// Template literal: Type checking ~15ms for 20 events
// Manual: Type checking ~5ms
// Difference negligible for typical use cases

// Recommendation:
// - <10 properties: Manual is fine
// - >10 properties or frequently changing: Template literals
// - Public API surface: Template literals for consistency
// - Internal utilities: Manual for simplicity
```

**Trade-off #2: Recursive Template Literals vs. Hardcoded Transformations**

```typescript
// Option A: Recursive template literal transformation
type KebabToCamel<S extends string> =
  S extends `${infer First}-${infer Rest}`
    ? `${First}${Capitalize<KebabToCamel<Rest>>}`
    : S;

type CSSProp = 'background-color' | 'font-size' | 'border-top-width';
type CamelCSS = KebabToCamel<CSSProp>;
// 'backgroundColor' | 'fontSize' | 'borderTopWidth'

// ✅ Pros:
// - Works for any kebab-case string
// - Reusable utility
// - Handles arbitrary depth

// ❌ Cons:
// - Slow for deep recursion (>5 segments)
// - Complex type errors
// - Can hit instantiation depth limits

// Option B: Hardcoded mappings
type CSSPropMapping = {
  'background-color': 'backgroundColor';
  'font-size': 'fontSize';
  'border-top-width': 'borderTopWidth';
};

type CamelCSS = CSSPropMapping[keyof CSSPropMapping];

// ✅ Pros:
// - Fast type checking
// - Simple error messages
// - No recursion limits

// ❌ Cons:
// - Must manually maintain mappings
// - Not reusable for different property sets
// - Prone to typos in mappings

// Benchmark (TypeScript 5.0, 100 CSS properties):
// Recursive: 280ms compilation
// Hardcoded: 45ms compilation

// Recommendation:
// - Small sets (<20 items): Recursive template literals
// - Large sets (>50 items): Hardcoded or code generation
// - Critical path code: Hardcoded for faster compilation
// - Libraries/frameworks: Recursive for flexibility
```

**Trade-off #3: Union Explosion vs. Type Narrowing**

```typescript
// Option A: Full union expansion
type Size = 'xs' | 's' | 'm' | 'l' | 'xl';
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'orange';
type Variant = 'solid' | 'outline' | 'ghost';

type ButtonClass = `${Size}-${Color}-${Variant}`;
// Generates: 5 × 5 × 3 = 75 union members

// ✅ Pros:
// - Exhaustive type checking
// - Autocomplete shows all possibilities
// - Catches invalid combinations at compile time

// ❌ Cons:
// - Slow compilation for large unions
// - Overwhelming autocomplete
// - Type hover is unreadable

// Option B: Constrained template without expansion
type ButtonClass = `${Size}-${Color}-${Variant}`;
// TypeScript treats as generic template, doesn't expand

// Or use string branding:
type ButtonClass = string & { __brand: 'ButtonClass' };

function createButtonClass(
  size: Size,
  color: Color,
  variant: Variant
): ButtonClass {
  return `${size}-${color}-${variant}` as ButtonClass;
}

// ✅ Pros:
// - Fast compilation
// - Readable types
// - Runtime validation still possible

// ❌ Cons:
// - No autocomplete for valid values
// - Can't catch invalid combinations at type level
// - Requires runtime validation

// Compilation benchmarks:
// 75 union members: ~50ms
// 500 union members: ~400ms
// 2000+ union members: TypeScript may refuse to expand

// Memory usage:
// 100 members: +2MB type checker memory
// 1000 members: +15MB type checker memory

// Recommendation:
// - <100 combinations: Full expansion
// - 100-500: Consider if autocomplete value justifies cost
// - >500: Use branded strings + runtime validation
// - Dynamic/user-generated: Never expand unions
```

**Trade-off #4: Type-Level vs. Runtime String Validation**

```typescript
// Option A: Type-level validation with template literals
type EmailFormat = `${string}@${string}.${string}`;
type PhoneFormat = `${number}-${number}-${number}`;

function sendEmail(to: EmailFormat) {
  // TypeScript ensures format at type level
}

sendEmail('user@example.com'); // ✅ Passes type check
sendEmail('invalid'); // ❌ Type error

// ✅ Pros:
// - Compile-time validation
// - Self-documenting function signatures
// - Zero runtime overhead

// ❌ Cons:
// - Limited validation depth (can't validate TLD, local part rules)
// - False sense of security (type assertions bypass)
// - Can accept invalid formats that match pattern

// Option B: Runtime validation with branded types
type Email = string & { __brand: 'Email' };

function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sendEmail(to: Email) {
  // Guaranteed valid by runtime check
}

const input = getUserInput();
if (isEmail(input)) {
  sendEmail(input); // ✅ Type narrows
}

// ✅ Pros:
// - Accurate validation with regex
// - Can enforce complex rules
// - Prevents type assertion bypass

// ❌ Cons:
// - Runtime performance cost
// - Requires validation at boundaries
// - More boilerplate (type guards)

// Hybrid approach (recommended):
type Email = `${string}@${string}` & { __brand: 'Email' };

function validateEmail(value: string): value is Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Invalid email');
  }
  return true;
}

// Benefits:
// - Type-level documentation (template literal)
// - Runtime safety (validation function)
// - Nominal typing (brand prevents mixing strings)

// Recommendation:
// - Type-level only: Documentation purposes, internal APIs
// - Runtime only: User input, external data
// - Hybrid: Public API boundaries, critical data
```

**Trade-off #5: Compile-Time String Building vs. Runtime String Manipulation**

```typescript
// Option A: Compile-time route building
type APIRoute = `/api/${'v1' | 'v2'}/users/${string}`;

const route: APIRoute = '/api/v1/users/123'; // ✅ Valid
const route2: APIRoute = '/api/v3/users/123'; // ❌ Type error

// ✅ Pros:
// - Catches route errors at compile time
// - Self-documenting API structure
// - IDE autocomplete for route prefixes

// ❌ Cons:
// - Can't build routes dynamically from config
// - Type becomes complex for many route segments
// - Doesn't validate parameter format

// Option B: Runtime route building with validation
function buildRoute(version: 'v1' | 'v2', userId: string): string {
  return `/api/${version}/users/${userId}`;
}

// ✅ Pros:
// - Flexible for dynamic configuration
// - Simple implementation
// - Can add runtime parameter validation

// ❌ Cons:
// - No compile-time route validation
// - Typos caught only at runtime
// - No autocomplete for route structure

// Hybrid: Type-safe route builder
const routes = {
  getUser: (userId: string) => `/api/v1/users/${userId}` as const,
  getPost: (postId: string) => `/api/v1/posts/${postId}` as const
} as const;

type RouteBuilder = typeof routes;
type RouteName = keyof RouteBuilder;

// Usage:
const userRoute = routes.getUser('123'); // Type: "/api/v1/users/${string}"

// Recommendation:
// - Static routes: Template literal types
// - Dynamic routes: Type-safe builder functions
// - Complex routing: Router library with type definitions
```

**Decision Framework:**

1. **Compilation Time Budget**:
   - <5s total: Use template literals freely
   - 5-15s: Be selective, measure impact
   - >15s: Avoid large union expansions

2. **Team TypeScript Proficiency**:
   - Beginners: Simple template literals only
   - Intermediate: Mapped + template combinations
   - Advanced: Recursive template types

3. **Type Safety Requirements**:
   - Critical (payments, auth): Runtime + type-level validation
   - Important (APIs): Template literal types
   - Nice-to-have (internal): Manual types

4. **Codebase Maintenance**:
   - Frequently changing: Template literals (DRY)
   - Stable: Manual types (simplicity)
   - Large team: Template literals (consistency)

</details>

<details>
<summary><strong>💬 Explain to Junior: String Types Like Mad Libs</strong></summary>

#### 💬 **Explain to Junior: String Types Like Mad Libs**

**The Big Picture:**

Template literal types are like playing Mad Libs with your type system. Remember Mad Libs? "I went to the __[place]__ and saw a __[adjective]__ __[animal]__." Template literal types let you create type "fill-in-the-blanks" that TypeScript fills in automatically.

**Core Concept: Type-Level String Templates**

Think of template literal types as creating patterns that strings must match:

```typescript
// Regular JavaScript template literal (runtime)
const greeting = `Hello, ${name}!`;

// Template literal type (compile-time)
type Greeting = `Hello, ${string}!`;

// This means: any string that starts with "Hello, " and ends with "!"
const valid: Greeting = "Hello, World!"; // ✅ Matches pattern
const valid2: Greeting = "Hello, TypeScript!"; // ✅ Matches pattern
const invalid: Greeting = "Hi there!"; // ❌ Doesn't match pattern
```

**Analogy #1: Event Handler Name Generator (The Prefix Machine)**

Imagine you have a label maker that automatically adds "on" and capitalizes the first letter:

```typescript
// Events in your app
type EventName = 'click' | 'submit' | 'change';

// Label maker: adds "on" prefix and capitalizes
type EventHandler = `on${Capitalize<EventName>}`;
// Result: 'onClick' | 'onSubmit' | 'onChange'

// Real-world usage: React component
interface ButtonProps {
  onClick?: () => void;
  onSubmit?: () => void;
  onChange?: () => void;
}

// Instead of manually typing each handler, generate from events!
interface AutoProps {
  [K in EventName as `on${Capitalize<K>}`]?: () => void;
}
// Identical to ButtonProps, but auto-generated

// Why this matters:
// Add new event: type EventName = 'click' | 'submit' | 'change' | 'focus';
// Automatically get: onClick, onSubmit, onChange, onFocus
// No manual updates needed!
```

**Analogy #2: API Route Builder (The Path Template)**

Think of building LEGO: you have fixed pieces and flexible pieces.

```typescript
// API route pattern: /users/:userId/posts/:postId
// Fixed parts: "/users/", "/posts/"
// Flexible parts: userId, postId

// Without template literals (manual typing)
function getPost(userId: string, postId: string) {
  return `/users/${userId}/posts/${postId}`;
}

// Problem: TypeScript doesn't know what parameters the route has
// If you change route to /users/:userId/posts/:id, nothing warns you

// With template literal types (automatic extraction)
type Route = '/users/:userId/posts/:postId';

// TypeScript can extract the :userId and :postId automatically!
type ExtractParams<Path> =
  Path extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : Path extends `${string}/:${infer Param}`
    ? Param
    : never;

type RouteParams = ExtractParams<Route>;
// Result: 'userId' | 'postId'

// Now make an object type with those keys
type ParamObject = { [K in RouteParams]: string };
// Result: { userId: string; postId: string }
```

**Analogy #3: CSS Property Name Converter (The Translator)**

Converting between naming styles is like translating languages:

```typescript
// CSS uses kebab-case: background-color, font-size
// JavaScript uses camelCase: backgroundColor, fontSize

// Manual translation (tedious):
type CSSInJS = {
  'background-color': string;
  'font-size': string;
};

// Use in code:
const styles: CSSInJS = {
  'background-color': 'red', // ❌ Quotes required, awkward
  'font-size': '16px'
};

// Automatic translation with template literals:
type KebabToCamel<S> =
  S extends `${infer First}-${infer Rest}`
    ? `${First}${Capitalize<KebabToCamel<Rest>>}`
    : S;

type CSSprop = 'background-color' | 'font-size';
type JSProp = KebabToCamel<CSSprop>;
// Result: 'backgroundColor' | 'fontSize'

// Now you can use normal JavaScript object syntax:
type Styles = { [K in JSProp]: string };

const styles: Styles = {
  backgroundColor: 'red', // ✅ Clean JavaScript syntax
  fontSize: '16px'
};
```

**Analogy #4: String Case Transformers (The Text Formatter)**

Like Microsoft Word's format tools (UPPERCASE, lowercase, Title Case):

```typescript
// Built-in string transformers
type Loud = Uppercase<'hello world'>; // 'HELLO WORLD'
type Quiet = Lowercase<'HELLO WORLD'>; // 'hello world'
type Title = Capitalize<'hello world'>; // 'Hello world'
type NoTitle = Uncapitalize<'Hello World'>; // 'hello World'

// Real-world: Database column names → TypeScript properties
type DBColumn = 'user_id' | 'first_name' | 'email_address';

// Convert snake_case to camelCase
type SnakeToCamel<S> =
  S extends `${infer First}_${infer Rest}`
    ? `${First}${Capitalize<SnakeToCamel<Rest>>}`
    : S;

type TSProperty = SnakeToCamel<DBColumn>;
// 'userId' | 'firstName' | 'emailAddress'

// Usage:
interface User {
  userId: string;
  firstName: string;
  emailAddress: string;
}

// Maps cleanly to database columns, but uses JavaScript conventions
```

**Real-World Example: Building a Type-Safe Router**

Let's build a simple router that auto-extracts route parameters:

```typescript
// Step 1: Define your routes
const routes = {
  home: '/',
  userProfile: '/users/:userId',
  blogPost: '/blog/:category/:postId',
  settings: '/settings'
};

// Step 2: Extract parameters from route string
type ExtractParams<Path> =
  Path extends `${string}/:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : Path extends `${string}/:${infer Param}`
    ? { [K in Param]: string }
    : {}; // No parameters

// Step 3: Create type-safe navigation function
function navigate<Path extends string>(
  path: Path,
  params: ExtractParams<Path>
): string {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}

// Step 4: Use it!
navigate('/users/:userId', { userId: '123' });
// ✅ Result: '/users/123'

navigate('/blog/:category/:postId', { category: 'tech', postId: '456' });
// ✅ Result: '/blog/tech/456'

navigate('/blog/:category/:postId', { category: 'tech' });
// ❌ TypeScript error: missing required parameter 'postId'

navigate('/settings', {});
// ✅ No parameters needed

// TypeScript knows exactly what each route needs!
```

**Interview Answer Template:**

When asked about template literal types:

**1. Definition** (10 seconds):
"Template literal types use template string syntax at the type level to create string patterns and transformations. They let you build types by combining string literals and unions."

**2. Concrete Example** (20 seconds):
"For example, if I have event names like 'click' | 'focus' | 'blur', I can auto-generate handler names using:
```typescript
type EventHandler = `on${Capitalize<EventName>}`;
```
This gives me 'onClick' | 'onFocus' | 'onBlur' automatically."

**3. Why It Matters** (15 seconds):
"This keeps types DRY and prevents inconsistencies. If I add a new event, the handler type updates automatically. No manual synchronization needed."

**4. Real-World Usage** (15 seconds):
"In my last project, we used template literals to extract API route parameters. The route '/users/:userId/posts/:postId' automatically inferred the parameter object type `{ userId: string; postId: string }`."

**Common Interview Follow-ups:**

**Q: "What's the difference between template literals in values vs. types?"**
**A:** "Template literals in values (`const str = \`Hello ${name}\``) run at runtime and produce strings. Template literal types (`type T = \`Hello ${string}\``) run at compile time and define string patterns. They use similar syntax but operate in different worlds."

**Q: "How do you extract parts from a template literal type?"**
**A:** "Using `infer` in conditional types. For example:
```typescript
type GetParam<T> = T extends `/:${infer Param}` ? Param : never;
```
This extracts the parameter name from a route segment."

**Q: "When would you avoid template literal types?"**
**A:** "When they create too many union combinations. For example, `${Color}-${Size}-${Variant}` with 10 colors × 5 sizes × 3 variants = 150 union members. This slows compilation and creates overwhelming autocomplete. In that case, I'd use branded strings with runtime validation instead."

**Memory Aid - The "STEM" Framework:**

- **S**tring patterns: Match formats (URLs, emails)
- **T**ransformations: Change case (Uppercase, Capitalize)
- **E**xtraction: Pull out parts with `infer`
- **M**apping: Convert between naming conventions (kebab → camel)

</details>

