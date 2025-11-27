# TypeScript Advanced Patterns - Part 2

> Recursive types, deep operations, and advanced patterns

---

## Questions 10-15: Advanced Type Patterns (Continued)

### Q10-12: Recursive Types & Deep Operations

```typescript
// Deep Partial
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type NestedUser = {
  info: { name: string; age: number };
  settings: { theme: string };
};

type PartialNested = DeepPartial<NestedUser>;
// All properties deeply optional

// Deep Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// Path extraction
type PathOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type Paths = PathOf<{ user: { name: string; age: number } }>;
// 'user' | 'user.name' | 'user.age'
```

---

#### 🔍 **Deep Dive: Recursive Type System and Tail Call Optimization**

Recursive types in TypeScript enable powerful transformations on deeply nested structures, but they come with important performance and complexity considerations. Understanding how the type checker processes recursion is crucial for writing efficient type-level code.

**Recursion Mechanics in TypeScript:**

TypeScript's type checker uses a depth-limited recursion strategy to prevent infinite loops and stack overflow during type evaluation:

```typescript
// Basic recursive type structure
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// How TypeScript evaluates this:
// 1. Check if T is an object type
// 2. If yes, map over all properties
// 3. For each property, recursively apply DeepPartial
// 4. Base case: If T is not an object, return T as-is

// Example evaluation for nested object:
type User = {
  profile: {
    name: string;
    address: {
      street: string;
      city: string;
    };
  };
};

type PartialUser = DeepPartial<User>;
// Step 1: T = User → is object → map properties
// Step 2: Property 'profile' → DeepPartial<User['profile']>
// Step 3: User['profile'] is object → map properties
// Step 4: Property 'address' → DeepPartial<User['profile']['address']>
// Step 5: User['profile']['address'] is object → map properties
// Step 6: Property 'street' → DeepPartial<string> → string (base case)
// Step 7: Property 'city' → DeepPartial<string> → string (base case)
```

**Instantiation Depth Limits:**

TypeScript enforces a maximum instantiation depth (default: 50) to prevent infinite recursion:

```typescript
// This will hit the instantiation depth limit
type DeepNest<T, Depth extends number = 0> =
  Depth extends 50
    ? T
    : { nested: DeepNest<T, /* increment */ > };

// TypeScript error: "Type instantiation is excessively deep and possibly infinite"

// Practical implications:
// 1. Keep nesting depth reasonable (<10 levels for most cases)
// 2. Use explicit depth limits in your type definitions
// 3. Consider iterative approaches for very deep structures

// Safe recursive type with depth limit
type SafeDeepPartial<T, Depth extends number = 5> =
  Depth extends 0
    ? T
    : T extends object
    ? { [P in keyof T]?: SafeDeepPartial<T[P], Dec<Depth>> }
    : T;

// Decrement helper (limited approach)
type Dec<N extends number> =
  N extends 5 ? 4
  : N extends 4 ? 3
  : N extends 3 ? 2
  : N extends 2 ? 1
  : 0;
```

**Tail Call Optimization (Not Fully Supported):**

Unlike functional programming languages with proper tail call elimination, TypeScript doesn't optimize recursive types in the same way:

```typescript
// Accumulator pattern (common in functional languages)
type ReverseArray<T extends any[], Acc extends any[] = []> =
  T extends [infer First, ...infer Rest]
    ? ReverseArray<Rest, [First, ...Acc]>
    : Acc;

// TypeScript still counts this against instantiation depth
// Even though it's tail-recursive in structure

// Performance characteristics:
type SmallArray = ReverseArray<[1, 2, 3, 4, 5]>; // Fast: ~2ms
type MediumArray = ReverseArray<[/* 20 items */]>; // Moderate: ~15ms
type LargeArray = ReverseArray<[/* 50+ items */]>; // Slow/Errors: >100ms or fails
```

**Deep Property Path Extraction:**

One of the most powerful applications of recursive types is extracting deep property paths:

```typescript
// Extract all possible paths as dot-notation strings
type PathOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? K | `${K}.${PathOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

// Step-by-step breakdown:
interface Config {
  server: {
    port: number;
    host: string;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
  };
}

type ConfigPaths = PathOf<Config>;
// Result: 'server' | 'server.port' | 'server.host' | 'server.ssl' |
//         'server.ssl.enabled' | 'server.ssl.cert' | 'database' | 'database.url'

// How it works:
// 1. Map over each key of Config
// 2. For 'server' (which is object):
//    - Include 'server' itself
//    - Recursively get paths from server's properties
//    - Template literal combines: 'server' + '.' + PathOf<server>
// 3. For primitive values (port, host): Just return the key
```

**Type-Safe Deep Get/Set:**

Recursive types enable runtime-safe deep property access:

```typescript
// Get value at path
type GetByPath<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? GetByPath<T[Key], Rest>
      : never
    : Path extends keyof T
    ? T[Path]
    : never;

function get<T, P extends PathOf<T>>(
  obj: T,
  path: P
): GetByPath<T, P> {
  const keys = (path as string).split('.');
  let result: any = obj;

  for (const key of keys) {
    result = result?.[key];
  }

  return result;
}

// Usage:
const config: Config = {
  server: {
    port: 8080,
    host: 'localhost',
    ssl: { enabled: true, cert: '/path/cert' }
  },
  database: { url: 'postgres://...' }
};

const port = get(config, 'server.port'); // Type: number
const enabled = get(config, 'server.ssl.enabled'); // Type: boolean
const invalid = get(config, 'server.invalid'); // ❌ Type error
```

**Recursive Type Performance Optimizations:**

```typescript
// Optimization 1: Early termination for primitives
type OptimizedDeepPartial<T> =
  T extends string | number | boolean | null | undefined | symbol | bigint
    ? T // Fast path for primitives
    : T extends Function
    ? T // Don't recurse into functions
    : T extends Array<infer U>
    ? Array<OptimizedDeepPartial<U>> // Special handling for arrays
    : T extends object
    ? { [P in keyof T]?: OptimizedDeepPartial<T[P]> }
    : T;

// Optimization 2: Union distribution prevention (when needed)
type NoDistribute<T> = T extends any ? { value: T } : never;
type UnwrapNoDistribute<T> = T extends { value: infer U } ? U : never;

// This prevents union distribution in certain recursive scenarios

// Optimization 3: Memoization-like pattern
type Computed<T> = T; // Force evaluation and cache result

type MemoizedDeepPartial<T> = Computed<
  T extends object
    ? { [P in keyof T]?: MemoizedDeepPartial<T[P]> }
    : T
>;
```

**Handling Circular References:**

TypeScript has limited support for circular type references:

```typescript
// This works (direct circular reference)
interface TreeNode {
  value: number;
  children: TreeNode[];
}

// This is problematic (indirect circular through recursive type)
type CircularProblem<T> = {
  value: T;
  next: CircularProblem<T> | null;
};

// Solution: Use interfaces or explicit recursion limits
interface LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null;
}

// For recursive types, detect and handle circularity
type SafeDeepReadonly<T, Seen = never> =
  T extends Seen
    ? T // Already processed, return as-is
    : T extends object
    ? { readonly [P in keyof T]: SafeDeepReadonly<T[P], Seen | T> }
    : T;
```

**Compiler Implementation Notes:**

The TypeScript compiler implements recursive type checking through:

1. **Type Instantiation Cache**: Stores results of type instantiations to avoid recomputation
2. **Depth Tracking**: Maintains a recursion depth counter, throws error at limit
3. **Lazy Evaluation**: Only resolves types when accessed
4. **Structural Sharing**: Reuses identical type structures across instances

```typescript
// Benchmarks (TypeScript 5.0, complex nested object with 50 properties):
// - Shallow Partial: 3ms
// - DeepPartial (5 levels): 28ms
// - DeepPartial (10 levels): 95ms
// - DeepPartial (15+ levels): Often hits instantiation limit

// Memory impact:
// - Each recursive level adds ~0.5-1MB to type checker memory
// - 100 recursive types in codebase: +50-100MB memory
```

---

#### 🐛 **Real-World Scenario: Form Validation State Type Explosion**

**Context:** Enterprise application with complex nested forms (inventory management system, 300+ form fields across 12 nested levels). TypeScript compilation time ballooned from 8s to 180s after adding deep validation types.

**The Bug:**

Engineering team implemented recursive types for form state management, but didn't account for TypeScript's instantiation depth limits and performance characteristics:

```typescript
// ❌ PROBLEM: Unconstrained recursive types causing compilation slowdown

// Deeply nested form structure
interface InventoryForm {
  product: {
    details: {
      name: string;
      sku: string;
      category: {
        primary: string;
        secondary: string;
        tags: string[];
      };
    };
    pricing: {
      base: number;
      discount: {
        type: 'percentage' | 'fixed';
        value: number;
        conditions: {
          minQuantity: number;
          startDate: Date;
          endDate: Date;
        };
      };
    };
    inventory: {
      warehouses: Array<{
        location: string;
        quantity: number;
        bins: Array<{
          code: string;
          capacity: number;
        }>;
      }>;
    };
  };
  shipping: {
    // ... another 8 levels deep
  };
}

// Problematic recursive validation types
type DeepValidation<T> = T extends object
  ? {
      [P in keyof T]: {
        value: T[P];
        errors: string[];
        touched: boolean;
        validation: DeepValidation<T[P]>; // ❌ Infinite recursion for arrays!
      };
    }
  : never;

type FormState = DeepValidation<InventoryForm>;
// TypeScript compilation: 180+ seconds
// Memory usage: 4.5GB
```

**Production Impact Metrics:**

- **Build Time**: Increased from 8s to 180s (2,150% slower)
- **Developer Experience**: Hot reload took 45s, breaking dev workflow
- **CI/CD Pipeline**: Failed builds due to 10-minute timeout
- **Memory Consumption**: TypeScript process using 4.5GB RAM (OOM errors in CI)
- **IDE Performance**: VSCode became unresponsive, 30s lag on autocomplete
- **Team Productivity**: -60% velocity due to slow feedback loops

**Root Cause Analysis:**

Multiple recursion anti-patterns compounded the issue:

```typescript
// Issue 1: No depth limit on recursion
type UnboundedRecursion<T> = {
  [P in keyof T]: UnboundedRecursion<T[P]>;
}; // Recurses until instantiation limit

// Issue 2: Array handling caused exponential expansion
type BadArrayHandling<T> = T extends Array<infer U>
  ? Array<BadArrayHandling<U>> // Recursive array elements
  : T extends object
  ? { [P in keyof T]: BadArrayHandling<T[P]> }
  : T;

// For arrays of objects, this creates nested recursion:
// Array<{ bins: Array<{ ... }> }> → exponential type complexity

// Issue 3: Unnecessary property wrapping at every level
type OverlyComplex<T> = {
  value: T;
  meta: { timestamp: number; user: string };
  validation: T extends object ? OverlyComplex<T> : never;
};
// Each property adds multiple new properties, multiplying complexity

// Issue 4: Union types in deep structures
type UnionProblem<T> = T extends object
  ? { [P in keyof T]: UnionProblem<T[P]> | null | undefined }
  : T;
// Each level multiplies union members: 3^depth combinations
```

**Debugging Process:**

```typescript
// Step 1: Measure type complexity with --extendedDiagnostics
// tsc --extendedDiagnostics shows:
// "Type instantiations: 1,200,000"
// "Time checking types: 175.3s"

// Step 2: Identify hot spots by commenting out types
// Found: DeepValidation type was the culprit

// Step 3: Test depth limits
type TestDepth<T, D extends number = 0> =
  D extends 20 ? "TOO DEEP"
  : T extends object
  ? { [P in keyof T]: TestDepth<T[P], Inc<D>> }
  : T;

// Discovered form structure was 12 levels deep
// With validation wrapper, became 24 levels (over limit!)

// Step 4: Profile memory usage
// Found that each instantiation consumed ~200KB
// 1.2M instantiations × 200KB = 240GB theoretical (garbage collected, but still huge)
```

**The Fix:**

Implemented pragmatic recursive type strategy with depth limits and optimizations:

```typescript
// ✅ SOLUTION: Bounded, optimized recursive types

// 1. Depth-limited recursion
type DeepValidation<T, Depth extends number = 5> =
  Depth extends 0
    ? FormFieldMeta // Base case: stop recursing, use simple type
    : T extends any[] // Handle arrays specially
    ? ArrayValidation<T>
    : T extends object
    ? {
        [P in keyof T]: {
          value: T[P];
          errors: string[];
          touched: boolean;
        } & (T[P] extends object
          ? { nested: DeepValidation<T[P], Dec<Depth>> }
          : {});
      }
    : never;

// Decrement helper (limited range)
type Dec<N extends number> =
  N extends 5 ? 4
  : N extends 4 ? 3
  : N extends 3 ? 2
  : N extends 2 ? 1
  : 0;

// Base validation metadata
interface FormFieldMeta {
  errors: string[];
  touched: boolean;
  dirty: boolean;
}

// Array validation (non-recursive for elements)
type ArrayValidation<T extends any[]> = {
  items: T;
  errors: string[];
  touched: boolean;
};

// 2. Selective recursion (only for specific paths)
type SelectiveDeepValidation<T> = {
  [P in keyof T]: P extends 'product' | 'shipping' // Only recurse into these
    ? T[P] extends object
      ? DeepValidation<T[P], 3> // Limited depth for selected paths
      : FormFieldMeta
    : FormFieldMeta; // Flat validation for other fields
};

// 3. Flattened path approach (alternative strategy)
type FlattenedPaths<T> = PathOf<T>; // Get all paths as strings

type FlatValidationState<T> = {
  [P in FlattenedPaths<T>]: FormFieldMeta;
};

// Example: Instead of nested { product: { details: { name: {...} } } }
// Use flat: { 'product.details.name': {...}, 'product.details.sku': {...} }

// 4. Hybrid approach (best of both worlds)
type SmartValidation<T> = {
  // Top-level properties get full metadata
  [P in keyof T]: {
    value: T[P];
    errors: string[];
    touched: boolean;
  };
} & {
  // Deep paths use flattened structure
  _paths: {
    [Path in FlattenedPaths<T>]: {
      error?: string;
      touched: boolean;
    };
  };
};

// Usage
type FormState = SmartValidation<InventoryForm>;

// Access patterns:
function setFieldError<T, P extends FlattenedPaths<T>>(
  state: SmartValidation<T>,
  path: P,
  error: string
) {
  state._paths[path].error = error;
}

// 5. Code generation for deeply nested forms
// Instead of recursive types, generate explicit types
// Using custom TypeScript transformer or build script

// Generated from InventoryForm:
type GeneratedFormState = {
  product_details_name: FormFieldMeta;
  product_details_sku: FormFieldMeta;
  product_pricing_base: FormFieldMeta;
  // ... 300+ fields, all explicit
};

// Trade-off: More code, but O(1) type checking instead of O(n^depth)
```

**Performance Results:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Compilation time | 180s | 12s | 93% faster |
| Memory usage | 4.5GB | 680MB | 85% reduction |
| IDE autocomplete | 30s lag | <100ms | 99.7% faster |
| Type instantiations | 1.2M | 8,400 | 99.3% reduction |
| Hot reload | 45s | 3s | 93% faster |

**Key Lessons:**

1. **Set Explicit Depth Limits**: Use depth counter parameter, default to 3-5 levels max
2. **Avoid Recursive Arrays**: Flatten array validation or use non-recursive element types
3. **Flatten When Possible**: Dot-notation paths often better than deep nesting
4. **Profile Early**: Use `--extendedDiagnostics` to catch type complexity issues
5. **Consider Code Generation**: For very large/deep forms, generate explicit types
6. **Use Selective Recursion**: Only recurse where actually needed, use simple types elsewhere

---

#### ⚖️ **Trade-offs: Recursive Type Complexity vs. Type Precision**

**Decision Matrix: When to Use Recursive Types**

| Use Case | Recursive Types | Explicit Types | Flattened Types | Recommendation |
|----------|----------------|----------------|-----------------|----------------|
| Form validation (3-5 levels) | `DeepValidation<T>` | Manual per-field | Dot-notation paths | **Recursive** with depth limit |
| Form validation (8+ levels) | Too slow | Tedious to maintain | `{ "a.b.c": Meta }` | **Flattened** paths |
| Config object access | `PathOf<T>` | Manual paths | N/A | **Recursive** PathOf |
| JSON schema validation | Recursive schema | Explicit types | Hybrid | **Hybrid** (recursive + limits) |
| Deep readonly | `DeepReadonly<T>` | Manual readonly | N/A | **Recursive** if <10 levels |
| Large API responses | Recursive parsing | Explicit interfaces | N/A | **Explicit** (performance) |

**Trade-off #1: Recursive vs. Explicit Type Definitions**

```typescript
// Option A: Recursive type
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

interface Config {
  database: { host: string; port: number };
  cache: { ttl: number };
}

type ReadonlyConfig = DeepReadonly<Config>;

// ✅ Pros:
// - DRY: One type definition handles all depth
// - Automatic updates when Config changes
// - Reusable across different types

// ❌ Cons:
// - Compilation overhead (recursive evaluation)
// - Complex error messages
// - Can hit instantiation limits on deep structures

// Option B: Explicit readonly
type ReadonlyConfig = {
  readonly database: {
    readonly host: string;
    readonly port: number;
  };
  readonly cache: {
    readonly ttl: number;
  };
};

// ✅ Pros:
// - Fast compilation (no recursion)
// - Clear error messages
// - Explicit structure visible in IDE

// ❌ Cons:
// - Must manually sync with Config changes
// - Repetitive for large types
// - Not reusable

// Benchmark (1000 type instantiations):
// DeepReadonly: 180ms compilation
// Explicit: 15ms compilation

// Recommendation:
// - <5 levels, frequently changing: Recursive
// - >5 levels, performance-critical: Explicit
// - Public library API: Recursive (flexibility)
// - Internal application: Explicit (performance)
```

**Trade-off #2: Deep Recursion vs. Flattened Paths**

```typescript
// Option A: Deep nested validation
type NestedValidation<T> = T extends object
  ? { [P in keyof T]: { value: T[P]; error?: string; nested: NestedValidation<T[P]> } }
  : never;

interface Form {
  user: {
    profile: {
      name: string;
    };
  };
}

type FormState = NestedValidation<Form>;
// Access: formState.user.nested.profile.nested.name.error

// ✅ Pros:
// - Mirrors data structure
// - Type-safe property access
// - Natural dot notation

// ❌ Cons:
// - Verbose access (.nested at each level)
// - Slow type checking for deep structures
// - Hits instantiation limits quickly

// Option B: Flattened paths
type FlatValidation<T> = {
  [P in PathOf<T>]: { value: GetByPath<T, P>; error?: string };
};

type FormState = FlatValidation<Form>;
// Access: formState['user.profile.name'].error

// ✅ Pros:
// - Fast type checking (no deep recursion)
// - Simpler access pattern
// - No instantiation limit issues

// ❌ Cons:
// - Lose autocomplete on intermediate paths
// - Must use string keys
// - Less intuitive structure

// Hybrid: Shallow nesting + flattened paths
type HybridValidation<T> = {
  [P in keyof T]: {
    value: T[P];
    error?: string;
  };
} & {
  paths: { [Path in PathOf<T>]: { error?: string } };
};

// Access: formState.user.value (top-level)
//         formState.paths['user.profile.name'].error (deep)

// Recommendation:
// - <4 levels: Deep nested
// - 4-8 levels: Hybrid
// - >8 levels: Flattened paths
```

**Trade-off #3: Depth Limits vs. Full Recursion**

```typescript
// Option A: Unlimited recursion
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// ✅ Pros:
// - Handles any depth
// - Simple implementation
// - Works with unknown structure depth

// ❌ Cons:
// - Can hit instantiation limits (depth 50)
// - No explicit safeguards
// - Unpredictable performance

// Option B: Fixed depth limit
type LimitedDeepPartial<T, Depth extends number = 5> =
  Depth extends 0
    ? T
    : T extends object
    ? { [P in keyof T]?: LimitedDeepPartial<T[P], Dec<Depth>> }
    : T;

// ✅ Pros:
// - Guaranteed termination
// - Predictable performance
// - Explicit depth budget

// ❌ Cons:
// - Fails for deeper structures (falls back to original type)
// - Must implement decrement type
// - Less flexible

// Option C: Adaptive depth (stop at certain types)
type SmartDeepPartial<T> =
  T extends Date | RegExp | Function
    ? T // Don't recurse into special types
    : T extends Array<infer U>
    ? Array<SmartDeepPartial<U>> // Recurse into array elements
    : T extends object
    ? { [P in keyof T]?: SmartDeepPartial<T[P]> }
    : T;

// ✅ Pros:
// - Naturally terminates at leaves
// - Handles common cases efficiently
// - More ergonomic than explicit counter

// ❌ Cons:
// - Still can hit limits on very deep objects
// - Special cases may be missed

// Recommendation:
// - Known shallow structures (<5 levels): Unlimited
// - Unknown or variable depth: Fixed limit (Depth = 5)
// - Production libraries: Adaptive with limit fallback
```

**Trade-off #4: Type Instantiation Cost vs. Runtime Flexibility**

```typescript
// Option A: Complex recursive type for exhaustive safety
type DeepPick<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? { [K in Key]: DeepPick<T[Key], Rest> }
      : never
    : Path extends keyof T
    ? { [K in Path]: T[Path] }
    : never;

// Usage:
type UserName = DeepPick<User, 'profile.name'>;

// ✅ Pros:
// - Compile-time path validation
// - Full type safety
// - IDE autocomplete for paths

// ❌ Cons:
// - Slow for many paths (10+ paths: 500ms+ compilation)
// - Complex error messages
// - Large type definitions

// Option B: Runtime path resolution with simple types
function get<T, K extends PathOf<T>>(obj: T, path: K): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj as any);
}

// ✅ Pros:
// - Fast compilation (simple types)
// - Flexible at runtime
// - Small type footprint

// ❌ Cons:
// - Returns `any` (loses type safety)
// - No compile-time path validation
// - Runtime errors for invalid paths

// Option C: Hybrid with type assertion
function getTyped<T, K extends PathOf<T>, R>(
  obj: T,
  path: K,
  returnType: R
): R {
  return path.split('.').reduce((acc, key) => acc?.[key], obj as any) as R;
}

// Usage: getTyped(user, 'profile.name', '' as string);

// Recommendation:
// - <20 paths, critical types: Complex recursive
// - >20 paths, performance matters: Runtime with type assertion
// - Libraries: Provide both options
```

**Trade-off #5: Recursive Types vs. Code Generation**

```typescript
// Option A: Recursive types (runtime cost: zero)
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// Compile time: 50ms for deep type
// Runtime: 0ms (types erased)
// Bundle size: 0 bytes

// Option B: Code generation (compile cost: zero)
// Script generates:
type GeneratedReadonly = {
  readonly user: {
    readonly profile: {
      readonly name: string;
    };
  };
};

// Compile time: 2ms (explicit type, no recursion)
// Build time: +200ms (run generator script)
// Bundle size: 0 bytes
// Code size: +50 lines per type

// Recommendation:
// - Dev builds: Recursive types (fast iteration)
// - Prod builds: Consider code generation if compilation is slow
// - Large monorepos: Code generation (amortized across builds)
// - Small projects: Recursive types (simplicity)
```

**Decision Framework:**

1. **Measure First**:
   - Use `--extendedDiagnostics` to measure type checking time
   - If >10% of build time spent on type checking, optimize

2. **Depth Assessment**:
   - <3 levels: Any approach works
   - 3-7 levels: Recursive with depth limit
   - >7 levels: Flattened or code generation

3. **Change Frequency**:
   - Often changing: Recursive (DRY)
   - Stable: Explicit (performance)

4. **Team Size**:
   - Small (<5): Optimize for developer experience (recursive)
   - Large (>20): Optimize for build time (explicit/generated)

---

#### 💬 **Explain to Junior: Recursion Like Russian Nesting Dolls**

**The Big Picture:**

Recursive types in TypeScript are like Russian nesting dolls (matryoshka dolls) - they're types that refer to themselves, unpacking layer by layer. Just like each doll contains a smaller version of itself until you reach the smallest one, recursive types process structures level by level until they hit a base case.

**Core Concept: Types Calling Themselves**

Think of recursion as a function that keeps calling itself with smaller problems:

```typescript
// Function recursion (runtime)
function countdown(n: number): void {
  if (n === 0) return; // Base case: stop
  console.log(n);
  countdown(n - 1); // Recursive call
}

// Type recursion (compile-time)
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> } // Recursive call
  : T; // Base case: stop

// They follow the same pattern:
// 1. Check if we should stop (base case)
// 2. If not, break problem into smaller pieces
// 3. Call ourselves on the smaller pieces
// 4. Combine the results
```

**Analogy #1: Unwrapping Nested Boxes (DeepPartial)**

Imagine you have boxes inside boxes, and you want to put a "FRAGILE" sticker on every box:

```typescript
// Your nested boxes
interface Storage {
  bigBox: {
    mediumBox: {
      smallBox: {
        item: string;
      };
    };
  };
}

// Manual approach (tedious):
type PartialStorage = {
  bigBox?: { // Add ? to big box
    mediumBox?: { // Add ? to medium box
      smallBox?: { // Add ? to small box
        item?: string; // Add ? to item
      };
    };
  };
};

// Recursive approach (automatic):
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type AutoPartialStorage = DeepPartial<Storage>;

// How it works step-by-step:
// 1. Start with Storage
// 2. Is Storage an object? Yes → process each property
// 3. Property 'bigBox' → is bigBox's type an object? Yes
// 4. Recurse: DeepPartial<bigBox's type>
// 5. Process mediumBox (object) → Recurse again
// 6. Process smallBox (object) → Recurse again
// 7. Process item (string, NOT object) → Stop, return string
// 8. Unwind: Build the type back up with ? on each property
```

**Analogy #2: Following a Trail (Path Extraction)**

Imagine you're documenting all possible routes through a building:

```typescript
interface Building {
  floor1: {
    room101: string;
    room102: string;
  };
  floor2: {
    room201: string;
    room202: {
      closet: string;
    };
  };
}

// Manual listing (error-prone):
type Paths =
  | 'floor1'
  | 'floor1.room101'
  | 'floor1.room102'
  | 'floor2'
  | 'floor2.room201'
  | 'floor2.room202'
  | 'floor2.room202.closet';

// Recursive listing (automatic):
type PathOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathOf<T[K]>}` // Room + paths inside room
          : K // Just the room (no sub-rooms)
        : never;
    }[keyof T]
  : never;

type AutoPaths = PathOf<Building>;

// Step-by-step for 'floor2.room202.closet':
// 1. Process Building → includes 'floor2'
// 2. floor2 is object → recurse: PathOf<floor2's type>
// 3. Includes 'room202'
// 4. room202 is object → recurse: PathOf<room202's type>
// 5. Includes 'closet'
// 6. closet is string (not object) → stop, return 'closet'
// 7. Unwind: combine 'room202' + '.' + 'closet' = 'room202.closet'
// 8. Combine 'floor2' + '.' + 'room202.closet' = 'floor2.room202.closet'
```

**Analogy #3: Making Everything Readonly (Security Seals)**

Like sealing every container with tamper-proof seals:

```typescript
interface Document {
  title: string;
  sections: {
    intro: string;
    body: string;
  };
  metadata: {
    author: string;
    date: Date;
  };
}

// Want to prevent ALL modifications at ANY level
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

type ProtectedDocument = DeepReadonly<Document>;

const doc: ProtectedDocument = {
  title: 'Report',
  sections: { intro: '...', body: '...' },
  metadata: { author: 'John', date: new Date() }
};

doc.title = 'New Title'; // ❌ Error: readonly
doc.sections.intro = 'New Intro'; // ❌ Error: deeply readonly
doc.metadata.author = 'Jane'; // ❌ Error: deeply readonly

// Without DeepReadonly (shallow readonly):
type ShallowReadonly = Readonly<Document>;

const shallowDoc: ShallowReadonly = /* ... */;
shallowDoc.title = 'New'; // ❌ Error: readonly
shallowDoc.sections.intro = 'New'; // ✅ No error! (only top level is readonly)
```

**Real-World Example: Type-Safe Form Path Access**

Building a form library that accesses nested fields safely:

```typescript
// Complex form data
interface UserForm {
  personal: {
    firstName: string;
    lastName: string;
    address: {
      street: string;
      city: string;
      zip: string;
    };
  };
  account: {
    email: string;
    password: string;
  };
}

// Step 1: Extract all possible paths
type PathOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type FormPaths = PathOf<UserForm>;
// Result: 'personal' | 'personal.firstName' | 'personal.lastName' |
//         'personal.address' | 'personal.address.street' | ... etc

// Step 2: Get the type at a specific path
type GetByPath<T, P extends string> =
  P extends `${infer First}.${infer Rest}`
    ? First extends keyof T
      ? GetByPath<T[First], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

// Step 3: Type-safe getter function
function getFormValue<P extends FormPaths>(
  form: UserForm,
  path: P
): GetByPath<UserForm, P> {
  const keys = path.split('.');
  let value: any = form;

  for (const key of keys) {
    value = value[key];
  }

  return value;
}

// Step 4: Usage with full type safety
const firstName = getFormValue(form, 'personal.firstName'); // Type: string
const city = getFormValue(form, 'personal.address.city'); // Type: string
const email = getFormValue(form, 'account.email'); // Type: string

getFormValue(form, 'personal.age'); // ❌ TypeScript error: invalid path
getFormValue(form, 'account.username'); // ❌ TypeScript error: invalid path
```

**Interview Answer Template:**

When asked about recursive types:

**1. Definition** (10 seconds):
"Recursive types are types that reference themselves in their definition. They're used to process nested or tree-like data structures by applying transformations at each level."

**2. Concrete Example** (20 seconds):
"For example, `DeepPartial` makes all properties optional at every level:
```typescript
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
```
It checks if T is an object, makes each property optional, and recursively applies itself to the property types."

**3. Why It Matters** (15 seconds):
"Recursive types handle arbitrary nesting depth automatically. Without them, you'd manually define types for each nesting level, which doesn't scale and breaks when structure changes."

**4. Real-World Usage** (15 seconds):
"I've used recursive types for form validation states (nested field errors), configuration access (type-safe dot paths), and deep readonly (preventing mutations at any level in a data structure)."

**Common Interview Follow-ups:**

**Q: "What's the base case in a recursive type?"**
**A:** "The base case is when the type stops recursing. For `DeepPartial`, it's when the type is not an object (like `string` or `number`). At that point, return the type as-is instead of recursing further."

**Q: "What happens if you don't have a base case?"**
**A:** "You get infinite recursion, hitting TypeScript's instantiation depth limit (default 50). TypeScript throws an error: 'Type instantiation is excessively deep and possibly infinite.' You need a stopping condition."

**Q: "When would you avoid recursive types?"**
**A:** "When the nesting is very deep (>7 levels) or when you have arrays of objects creating exponential complexity. In those cases, I'd use flattened path notation or explicit type generation instead, because recursive types become slow to compile and hit instantiation limits."

**Memory Aid - The "BRU" Framework:**

- **B**ase case: When to stop recursing (primitives, depth limit)
- **R**ecursive case: Call the type on nested parts (object properties)
- **U**nwinding: Build result from recursive calls (combine with mapped types)

### Q13-15: Advanced Patterns & Best Practices

```typescript
// Builder pattern with fluent API
class QueryBuilder<T = {}> {
  private query: T = {} as T;

  select<K extends string>(
    field: K
  ): QueryBuilder<T & Record<K, any>> {
    return this as any;
  }

  build(): T {
    return this.query;
  }
}

const query = new QueryBuilder()
  .select('id')
  .select('name')
  .build();
// Type: { id: any; name: any }

// Type-safe event emitter
type Events = {
  click: { x: number; y: number };
  keypress: { key: string };
};

class TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void
  ): void {}

  emit<K extends keyof T>(event: K, data: T[K]): void {}
}

const emitter = new TypedEmitter<Events>();
emitter.on('click', (data) => {
  console.log(data.x, data.y); // Type-safe!
});

// Branded types for nominal typing
type Brand<K, T> = K & { __brand: T };
type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

const usd = 100 as USD;
const eur = 100 as EUR;
// Can't mix: const total: USD = usd + eur; // Error!
```

---

#### 🔍 **Deep Dive: Advanced Type Pattern Architectures**

Advanced TypeScript patterns combine multiple type system features—generics, conditional types, mapped types, and template literals—to create robust, type-safe abstractions. Understanding these patterns requires knowledge of how different type features interact and compose.

**Builder Pattern with Type Accumulation:**

The fluent builder pattern leverages TypeScript's ability to accumulate type information across method chains:

```typescript
// Basic builder with type accumulation
class QueryBuilder<T = {}> {
  private fields: T = {} as T;

  // Each select() call adds to the type
  select<K extends string>(field: K): QueryBuilder<T & Record<K, any>> {
    (this.fields as any)[field] = true;
    return this as any; // Type assertion needed for type transformation
  }

  where<K extends keyof T>(field: K, value: any): QueryBuilder<T> {
    // where() doesn't change type, just filters
    return this;
  }

  build(): T {
    return this.fields;
  }
}

// How type accumulation works:
const q1 = new QueryBuilder(); // Type: QueryBuilder<{}>
const q2 = q1.select('id'); // Type: QueryBuilder<{ id: any }>
const q3 = q2.select('name'); // Type: QueryBuilder<{ id: any } & { name: any }>
const result = q3.build(); // Type: { id: any } & { name: any } → { id: any; name: any }

// TypeScript simplifies intersection types:
// { id: any } & { name: any } → { id: any; name: any }
// This is called type normalization

// Advanced: Type-safe field types
class TypedQueryBuilder<Schema, Selected = {}> {
  select<K extends keyof Schema>(
    field: K
  ): TypedQueryBuilder<Schema, Selected & Pick<Schema, K>> {
    return this as any;
  }

  build(): Selected {
    return {} as Selected;
  }
}

interface UserSchema {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new TypedQueryBuilder<UserSchema>()
  .select('id') // Type: TypedQueryBuilder<UserSchema, { id: number }>
  .select('name') // Type: TypedQueryBuilder<UserSchema, { id: number; name: string }>
  .build(); // Type: { id: number; name: string }

// TypeScript knows exact types, not just 'any'!
```

**Event Emitter Pattern with Discriminated Unions:**

Type-safe event emitters use mapped types and generics to enforce event-data type relationships:

```typescript
// Advanced event emitter implementation
type EventMap = Record<string, any>; // Base constraint

class TypedEventEmitter<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<(data: Events[K]) => void>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Type-safe removeListener
  off<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {
    const handlers = this.listeners[event];
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// Usage with strict typing
type AppEvents = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'data:update': { collection: string; id: string; data: unknown };
  'error': Error;
};

const emitter = new TypedEventEmitter<AppEvents>();

// TypeScript enforces correct event-data pairs
emitter.on('user:login', (data) => {
  // data is typed as { userId: string; timestamp: number }
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

emitter.emit('user:login', { userId: '123', timestamp: Date.now() }); // ✅ Correct

emitter.emit('user:login', { userId: '123' }); // ❌ Error: missing 'timestamp'
emitter.emit('user:login', { userId: 123, timestamp: Date.now() }); // ❌ Error: userId is number

// Advanced: Once-only listeners
class AdvancedEventEmitter<Events extends EventMap> extends TypedEventEmitter<Events> {
  once<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {
    const wrappedHandler = (data: Events[K]) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }
}
```

**Branded Types for Nominal Typing:**

TypeScript uses structural typing by default, but branded types enable nominal typing patterns:

```typescript
// Brand implementation
type Brand<K, T> = K & { readonly __brand: T };

// Or with unique symbol (more robust)
declare const brand: unique symbol;
type BrandWithSymbol<K, T> = K & { readonly [brand]: T };

// Currency example
type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;
type JPY = Brand<number, 'JPY'>;

// Helper functions for creating branded values
function usd(amount: number): USD {
  return amount as USD;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

// Conversion functions maintain type safety
function usdToEur(amount: USD, rate: number): EUR {
  return (amount as number * rate) as EUR;
}

// Usage
const price = usd(100);
const eurPrice = eur(85);

// ❌ Can't mix currencies accidentally
const total: USD = price + eurPrice; // Type error!

// ✅ Must explicitly convert
const converted = usdToEur(price, 0.85);
const total: EUR = converted + eurPrice; // Works!

// Real-world application: Safe IDs
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;
type CommentId = Brand<string, 'CommentId'>;

function getUser(id: UserId): User { /* ... */ }
function getPost(id: PostId): Post { /* ... */ }

const userId: UserId = 'user-123' as UserId;
const postId: PostId = 'post-456' as PostId;

getUser(userId); // ✅ Correct
getUser(postId); // ❌ Error: PostId is not assignable to UserId

// Even though both are strings at runtime, TypeScript prevents mixing!

// Advanced: Branded types with validation
function createUserId(id: string): UserId {
  if (!id.startsWith('user-')) {
    throw new Error('Invalid user ID format');
  }
  return id as UserId;
}

// Now you can't accidentally create invalid IDs:
const validId = createUserId('user-123'); // ✅ Works
const invalidId = createUserId('post-123'); // ❌ Throws at runtime
```

**Variance and Type Transformation:**

Understanding variance is crucial for advanced pattern design:

```typescript
// Covariance: Can substitute more specific type for general type
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type ReadOnlyContainer<T> = {
  readonly value: T;
  get(): T;
};

const dogContainer: ReadOnlyContainer<Dog> = {
  value: { name: 'Rex', breed: 'Labrador' },
  get() { return this.value; }
};

// ✅ Covariant: Dog is more specific than Animal
const animalContainer: ReadOnlyContainer<Animal> = dogContainer;

// Contravariance: Function parameters are contravariant
type Handler<T> = (arg: T) => void;

const animalHandler: Handler<Animal> = (animal) => {
  console.log(animal.name);
};

// ❌ Contravariant: Can't assign specific handler to general type
const dogHandler: Handler<Dog> = animalHandler; // Error in strict mode

// But reverse works:
const dogSpecificHandler: Handler<Dog> = (dog) => {
  console.log(dog.breed);
};

// ✅ Contravariant: General type can accept specific handler
const animalGeneralHandler: Handler<Animal> = dogSpecificHandler; // Error!

// Invariance: Both in and out positions (read/write)
type MutableContainer<T> = {
  value: T;
  get(): T;
  set(value: T): void;
};

const dogMutableContainer: MutableContainer<Dog> = {
  value: { name: 'Rex', breed: 'Labrador' },
  get() { return this.value; },
  set(value: Dog) { this.value = value; }
};

// ❌ Invariant: Can't substitute in either direction
const animalMutableContainer: MutableContainer<Animal> = dogMutableContainer; // Error!
```

**Phantom Types for Compile-Time State Machines:**

Phantom types encode state at the type level without runtime representation:

```typescript
// State machine using phantom types
type State = 'idle' | 'loading' | 'loaded' | 'error';

class Resource<S extends State> {
  private constructor(private data?: any) {}

  // Factory: Start in idle state
  static create(): Resource<'idle'> {
    return new Resource<'idle'>();
  }

  // Transition: idle → loading
  load(this: Resource<'idle'>): Resource<'loading'> {
    // Fetch data...
    return new Resource<'loading'>();
  }

  // Transition: loading → loaded | error
  complete(this: Resource<'loading'>, data: any): Resource<'loaded'> {
    return new Resource<'loaded'>(data);
  }

  error(this: Resource<'loading'>, err: Error): Resource<'error'> {
    return new Resource<'error'>(err);
  }

  // Can only access data when loaded
  getData(this: Resource<'loaded'>): any {
    return this.data;
  }

  // Can only retry from error state
  retry(this: Resource<'error'>): Resource<'loading'> {
    return new Resource<'loading'>();
  }
}

// Usage enforces state machine transitions
const resource = Resource.create(); // Type: Resource<'idle'>
const loading = resource.load(); // Type: Resource<'loading'>
const loaded = loading.complete({ user: 'John' }); // Type: Resource<'loaded'>
const data = loaded.getData(); // ✅ Allowed in 'loaded' state

// ❌ Invalid transitions caught at compile time
resource.complete(data); // Error: 'idle' resource doesn't have complete()
loading.getData(); // Error: 'loading' resource doesn't have getData()
loaded.load(); // Error: 'loaded' resource doesn't have load()

// Valid state machine flow:
Resource.create() // idle
  .load() // loading
  .complete(data) // loaded
  .getData(); // access data ✅
```

**Higher-Kinded Types Simulation:**

TypeScript doesn't support higher-kinded types natively, but we can simulate them:

```typescript
// Simulate higher-kinded types for generic container transformations
interface HKT<A> {
  readonly _A?: A;
}

interface ArrayHKT extends HKT<any> {
  readonly type: Array<this['_A']>;
}

interface PromiseHKT extends HKT<any> {
  readonly type: Promise<this['_A']>;
}

interface OptionHKT extends HKT<any> {
  readonly type: Option<this['_A']>;
}

type Option<A> = { readonly _tag: 'Some'; readonly value: A } | { readonly _tag: 'None' };

// Generic map over any HKT
type Map<F extends HKT<any>, A, B> = F extends HKT<A>
  ? (F & { readonly _A: B })['type']
  : never;

// Usage:
type MappedArray = Map<ArrayHKT, number, string>; // Array<string>
type MappedPromise = Map<PromiseHKT, number, string>; // Promise<string>
type MappedOption = Map<OptionHKT, number, string>; // Option<string>

// Functor interface
interface Functor<F extends HKT<any>> {
  map<A, B>(fa: (F & { _A: A })['type'], f: (a: A) => B): (F & { _A: B })['type'];
}

// Implementation for Array
const ArrayFunctor: Functor<ArrayHKT> = {
  map: (fa, f) => fa.map(f)
};

// Implementation for Option
const OptionFunctor: Functor<OptionHKT> = {
  map: (fa, f) => fa._tag === 'Some' ? { _tag: 'Some', value: f(fa.value) } : fa
};
```

---

#### 🐛 **Real-World Scenario: Type-Safe State Management Library Bugs**

**Context:** Open-source state management library with 50K+ GitHub stars. After adding "type-safe" builder pattern for state updates, users reported 1,200+ issues about confusing type errors and unexpected runtime behavior.

**The Bug:**

Library authors implemented a fluent builder API for state updates but made critical mistakes in type design:

```typescript
// ❌ PROBLEM: Broken builder pattern with unsafe type transformations

// Library's state interface
interface AppState {
  user: { id: string; name: string; email: string };
  settings: { theme: 'light' | 'dark'; notifications: boolean };
  data: { items: any[]; loading: boolean };
}

// Problematic builder implementation
class StateBuilder<T> {
  private updates: Partial<T> = {};

  // Issue 1: Unsafe type widening
  set<K extends keyof T>(key: K, value: any): StateBuilder<T> {
    this.updates[key] = value; // Accepts 'any' - no type safety!
    return this;
  }

  // Issue 2: Nested updates lose type information
  setNested(path: string, value: any): StateBuilder<T> {
    // String path loses type safety entirely
    const keys = path.split('.');
    let current: any = this.updates;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return this;
  }

  // Issue 3: Build() doesn't validate completeness
  build(): T {
    return this.updates as T; // Unsafe cast!
  }
}

// User code that compiles but crashes at runtime:
const state = new StateBuilder<AppState>()
  .set('user', { id: 123 }) // ❌ Should error: id must be string, missing name/email
  .setNested('settings.theme', 'blue') // ❌ Should error: 'blue' not valid theme
  .build(); // ❌ Returns incomplete state as complete!

// Runtime crash:
console.log(state.user.name.toUpperCase()); // TypeError: Cannot read property 'toUpperCase' of undefined
```

**Production Impact Metrics:**

- **GitHub Issues**: 1,200+ issues filed in 3 months (800+ about type safety)
- **StackOverflow Questions**: 450+ questions tagged with library name + "type error"
- **npm Downloads**: Dropped 35% month-over-month after issues surfaced
- **User Complaints**: "Types are worse than JavaScript", "False sense of security"
- **Breaking Changes**: Required in 4 consecutive patch versions to fix type issues
- **Community Trust**: 30% of issues tagged "types are broken"

**Root Cause Analysis:**

```typescript
// Issue 1: Lost type information through 'any'
set<K extends keyof T>(key: K, value: any): StateBuilder<T>
// Should be: set<K extends keyof T>(key: K, value: T[K]): StateBuilder<T>

// Issue 2: String paths bypass type checking
setNested(path: string, value: any): StateBuilder<T>
// String paths can't be validated:
// 'user.zzz' accepted (doesn't exist)
// 'settings.theme' = 123 accepted (wrong type)

// Issue 3: Partial<T> cast to T without validation
build(): T {
  return this.updates as T; // Partial might be missing required fields!
}

// Issue 4: No method chaining type safety
const broken = new StateBuilder<AppState>()
  .set('user', { wrongProperty: true }) // ❌ Compiles but wrong shape
  .set('settings', 'not an object') // ❌ Compiles but wrong type
  .build(); // ❌ Returns broken state

// Issue 5: Type assertions everywhere
return this as any; // Used throughout to "fix" type errors
```

**Debugging Process:**

```typescript
// Step 1: Analyze type errors users reported
// Common pattern: "Type 'X' is not assignable to type 'Y'"
// But errors pointed to deep library internals, not user code

// Step 2: Test with --strict flag
// Discovered 200+ type errors in library code
// All hidden by 'as any' type assertions

// Step 3: Create reproduction cases
interface TestState {
  count: number;
  name: string;
}

const test = new StateBuilder<TestState>()
  .set('count', 'not a number') // Should error but doesn't
  .set('wrongKey', 123) // Should error but doesn't
  .build(); // Should error (incomplete) but doesn't

// All compiled successfully - total loss of type safety
```

**The Fix:**

Complete redesign with proper type safety:

```typescript
// ✅ SOLUTION: Properly type-safe builder pattern

// 1. Type-safe set method
class TypeSafeStateBuilder<T, Built = {}> {
  private updates: Built = {} as Built;

  // Type-safe set: value must match property type
  set<K extends keyof T>(
    key: K,
    value: T[K]
  ): TypeSafeStateBuilder<T, Built & Pick<T, K>> {
    (this.updates as any)[key] = value;
    return this as any;
  }

  // Type-safe nested updates using path extraction
  setNested<P extends PathOf<T>>(
    path: P,
    value: GetByPath<T, P>
  ): TypeSafeStateBuilder<T, Built & NestedUpdate<T, P>> {
    const keys = (path as string).split('.');
    let current: any = this.updates;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return this as any;
  }

  // Build only when all required fields are set
  build(this: TypeSafeStateBuilder<T, T>): T {
    return this.updates as T;
  }
}

// Helper types
type PathOf<T> = /* ... implementation from previous section ... */;
type GetByPath<T, P> = /* ... implementation from previous section ... */;
type NestedUpdate<T, P extends string> = /* complex implementation */;

// 2. Usage with full type safety
const state = new TypeSafeStateBuilder<AppState>()
  .set('user', { id: '123', name: 'John', email: 'john@example.com' }) // ✅ Correct type
  .set('settings', { theme: 'light', notifications: true }) // ✅ Correct type
  .set('data', { items: [], loading: false }); // ✅ Correct type

state.build(); // ✅ All fields set, can build

// Type errors for invalid usage:
const broken = new TypeSafeStateBuilder<AppState>()
  .set('user', { id: 123 }) // ❌ Error: id must be string, missing name/email
  .setNested('settings.theme', 'blue') // ❌ Error: 'blue' not valid theme
  .build(); // ❌ Error: missing required fields

// 3. Alternative: Immer-style draft API
function produce<T>(base: T, recipe: (draft: T) => void): T {
  const draft = JSON.parse(JSON.stringify(base)) as T;
  recipe(draft);
  return draft;
}

const newState = produce(currentState, (draft) => {
  draft.user.name = 'Jane'; // ✅ Type-safe
  draft.settings.theme = 'dark'; // ✅ Type-safe
  draft.user.age = 30; // ❌ Error: 'age' doesn't exist
  draft.settings.theme = 'blue'; // ❌ Error: 'blue' not valid
});

// 4. Advanced: Lens-based updates (functional approach)
type Lens<S, A> = {
  get: (s: S) => A;
  set: (a: A) => (s: S) => S;
};

function lens<S, K extends keyof S>(key: K): Lens<S, S[K]> {
  return {
    get: (s) => s[key],
    set: (value) => (s) => ({ ...s, [key]: value })
  };
}

const userLens = lens<AppState, 'user'>('user');
const nameLens = lens<AppState['user'], 'name'>('name');

// Compose lenses for nested updates
const userNameLens = {
  get: (s: AppState) => nameLens.get(userLens.get(s)),
  set: (name: string) => (s: AppState) => ({
    ...s,
    user: { ...s.user, name }
  })
};

const updated = userNameLens.set('Jane')(currentState); // ✅ Type-safe
```

**Results After Fix:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Type errors caught | 20% | 95% | 375% increase |
| Runtime crashes | 1,200 issues | 35 issues | 97% reduction |
| "Type broken" issues | 800 | 12 | 98.5% reduction |
| npm downloads | -35% MoM | +45% MoM | Trend reversed |
| StackOverflow questions | 450/month | 80/month | 82% reduction |
| User satisfaction | 2.1/5 stars | 4.6/5 stars | +119% |

**Key Lessons:**

1. **Never Use 'any' in Builder APIs**: Always constrain value types to actual property types
2. **Validate at Build Time**: Use conditional types to ensure all required fields are set
3. **Type-Safe Paths**: Template literals or branded strings, never plain strings
4. **Avoid Unsafe Casts**: If you need `as any`, your types are wrong
5. **Test with --strict**: Catch type holes before users do
6. **Progressive Type Accumulation**: Track what's been set in the type parameter

---

#### ⚖️ **Trade-offs: Pattern Complexity vs. Developer Experience**

**Decision Matrix: Choosing Advanced Patterns**

| Pattern | Complexity | Type Safety | DX | Use When |
|---------|-----------|-------------|-----|----------|
| Builder (basic) | Low | Medium | Good | Simple object construction |
| Builder (type-safe) | High | Very High | Medium | Complex state management |
| Branded types | Low | High | Good | Preventing ID/currency mixing |
| Phantom types | Very High | Very High | Poor | State machines, safety-critical |
| Event emitter | Medium | High | Good | Event-driven architecture |
| Lens | Very High | Very High | Poor | Functional updates, immutability |

**Trade-off #1: Type-Safe Builder vs. Plain Object Construction**

```typescript
// Option A: Type-safe builder pattern
class UserBuilder<Built = {}> {
  set<K extends keyof User>(
    key: K,
    value: User[K]
  ): UserBuilder<Built & Pick<User, K>> {
    return this as any;
  }

  build(this: UserBuilder<User>): User {
    return this as any;
  }
}

const user = new UserBuilder()
  .set('id', '123')
  .set('name', 'John')
  .set('email', 'john@example.com')
  .build();

// ✅ Pros:
// - Fluent, chainable API
// - Enforces all required fields at build()
// - Clear intent (builder pattern familiar)

// ❌ Cons:
// - Complex type implementation
// - Verbose for simple cases
// - 'this: UserBuilder<User>' constraint confusing

// Option B: Plain object with validation
function createUser(data: User): User {
  // Runtime validation
  if (!data.id || !data.name || !data.email) {
    throw new Error('Missing required fields');
  }
  return data;
}

const user = createUser({
  id: '123',
  name: 'John',
  email: 'john@example.com'
});

// ✅ Pros:
// - Simple, straightforward
// - TypeScript already validates shape
// - No complex types needed

// ❌ Cons:
// - Less discoverable (what fields needed?)
// - No step-by-step guidance
// - Runtime validation overhead

// Recommendation:
// - <5 required fields: Plain object
// - >5 fields or complex validation: Builder
// - Public API: Builder (better DX)
// - Internal code: Plain object (simplicity)
```

**Trade-off #2: Branded Types vs. Wrapper Types**

```typescript
// Option A: Branded types (nominal typing)
type UserId = string & { __brand: 'UserId' };
type PostId = string & { __brand: 'PostId' };

function getUserId(id: string): UserId {
  return id as UserId; // Runtime: just a string
}

// ✅ Pros:
// - Zero runtime overhead
// - Simple implementation
// - Prevents accidental mixing

// ❌ Cons:
// - Requires type assertions
// - No runtime validation
// - Can be bypassed with 'as'

// Option B: Wrapper classes (nominal + runtime)
class UserId {
  private constructor(public readonly value: string) {}

  static create(id: string): UserId {
    if (!id.startsWith('user-')) {
      throw new Error('Invalid user ID');
    }
    return new UserId(id);
  }
}

class PostId {
  private constructor(public readonly value: string) {}

  static create(id: string): PostId {
    if (!id.startsWith('post-')) {
      throw new Error('Invalid post ID');
    }
    return new PostId(id);
  }
}

// ✅ Pros:
// - Runtime validation
// - True nominal typing (can't bypass)
// - Can add methods (equals, toString, etc.)

// ❌ Cons:
// - Runtime overhead (object creation)
// - Must call .value to get string
// - More boilerplate

// Option C: Hybrid (branded + validation function)
type UserId = string & { __brand: 'UserId' };

function isUserId(value: string): value is UserId {
  return value.startsWith('user-');
}

function assertUserId(value: string): asserts value is UserId {
  if (!isUserId(value)) {
    throw new Error('Invalid user ID');
  }
}

// ✅ Pros:
// - Zero runtime overhead when valid
// - Optional validation
// - Best of both worlds

// Recommendation:
// - Internal IDs: Branded types
// - User input: Wrapper classes or hybrid
// - Hot path: Branded (performance)
// - API boundaries: Hybrid (validate once)
```

**Trade-off #3: Event Emitter vs. Observer Pattern**

```typescript
// Option A: Type-safe event emitter
class EventEmitter<Events extends Record<string, any>> {
  on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): void {}
}

type Events = {
  'user:login': User;
  'data:update': { id: string };
};

const emitter = new EventEmitter<Events>();
emitter.on('user:login', (user) => { /* ... */ });

// ✅ Pros:
// - Decoupled publishers/subscribers
// - Multiple listeners per event
// - String event names (easy to debug)

// ❌ Cons:
// - Global event namespace
// - No compile-time check for emit/on pairs
// - Hard to track event flow

// Option B: Observer pattern with callbacks
class Subject<T> {
  private observers: Array<(data: T) => void> = [];

  subscribe(observer: (data: T) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index !== -1) this.observers.splice(index, 1);
    };
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer(data));
  }
}

class UserStore {
  userLogin = new Subject<User>();
  dataUpdate = new Subject<{ id: string }>();
}

const store = new UserStore();
const unsubscribe = store.userLogin.subscribe((user) => { /* ... */ });

// ✅ Pros:
// - Explicit event channels
// - Easier to track dependencies
// - Strong typing per subject

// ❌ Cons:
// - More boilerplate (one Subject per event)
// - Verbose for many events
// - No global event bus

// Recommendation:
// - <10 event types: Observer pattern
// - >10 events or dynamic events: Event emitter
// - Framework integration: Event emitter
// - State management: Observer (RxJS observables)
```

**Trade-off #4: Phantom Types vs. Runtime State Machines**

```typescript
// Option A: Phantom types (compile-time state machine)
class Connection<State extends 'closed' | 'connecting' | 'connected'> {
  connect(this: Connection<'closed'>): Connection<'connecting'> {
    return this as any;
  }

  send(this: Connection<'connected'>, data: string): void {
    /* ... */
  }
}

// ✅ Pros:
// - Zero runtime overhead
// - Invalid transitions impossible
// - Self-documenting state flow

// ❌ Cons:
// - Complex type gymnastics
// - Hard to debug type errors
// - Can't inspect state at runtime

// Option B: Runtime state machine
type ConnectionState = 'closed' | 'connecting' | 'connected';

class Connection {
  private state: ConnectionState = 'closed';

  connect(): void {
    if (this.state !== 'closed') {
      throw new Error('Can only connect from closed state');
    }
    this.state = 'connecting';
  }

  send(data: string): void {
    if (this.state !== 'connected') {
      throw new Error('Can only send when connected');
    }
    /* ... */
  }

  getState(): ConnectionState {
    return this.state;
  }
}

// ✅ Pros:
// - Can inspect state
// - Clear error messages
// - Easy to debug

// ❌ Cons:
// - Runtime overhead (validation)
// - Errors only at runtime
// - Must remember to check state

// Recommendation:
// - Safety-critical: Phantom types
// - Complex states (>5): Runtime
// - Library code: Phantom types
// - Application code: Runtime (easier to debug)
```

**Trade-off #5: Fluent API vs. Configuration Object**

```typescript
// Option A: Fluent API
const query = new QueryBuilder()
  .select('id', 'name')
  .where('age', '>', 18)
  .orderBy('name', 'asc')
  .limit(10)
  .build();

// ✅ Pros:
// - Discoverable (IDE autocomplete)
// - Reads like natural language
// - Step-by-step construction

// ❌ Cons:
// - Complex type implementation
// - Can't easily serialize/deserialize
// - Harder to compose programmatically

// Option B: Configuration object
const query = createQuery({
  select: ['id', 'name'],
  where: { age: { gt: 18 } },
  orderBy: { name: 'asc' },
  limit: 10
});

// ✅ Pros:
// - Easy to serialize (JSON)
// - Composable (spread, merge objects)
// - Simple implementation

// ❌ Cons:
// - Less discoverable
// - All-at-once (no incremental build)
// - Harder to validate step-by-step

// Recommendation:
// - DSLs/query builders: Fluent API
// - Configuration/options: Object
// - Serializable: Object
// - Complex workflows: Fluent API
```

**Decision Framework:**

1. **Measure Complexity Cost**:
   - Simple pattern (types <100 lines): Usually worth it
   - Complex pattern (types >300 lines): Needs strong justification

2. **Developer Experience**:
   - Public API: Optimize for clarity, even if complex internally
   - Internal: Optimize for simplicity

3. **Performance Requirements**:
   - Hot path: Zero runtime overhead (branded types, phantoms)
   - Cold path: Runtime safety acceptable

4. **Team TypeScript Skill**:
   - Junior: Stick to simple patterns
   - Senior: Advanced patterns acceptable

---

#### 💬 **Explain to Junior: Design Patterns Like LEGO Instructions**

**The Big Picture:**

Advanced TypeScript patterns are like specialized LEGO instruction sets. Just as LEGO has instructions for building specific things (cars, houses, spaceships), TypeScript patterns are recipes for solving specific problems (building objects step-by-step, preventing type mixing, handling events safely).

**Core Concept: Patterns Solve Recurring Problems**

Instead of reinventing solutions every time, we use proven patterns:

```typescript
// Problem: Building complex objects is error-prone
// ❌ Easy to forget required fields
const user = {
  id: '123',
  name: 'John'
  // Oops, forgot email!
};

// ✅ Builder pattern guides you:
const user = new UserBuilder()
  .setId('123')
  .setName('John')
  .setEmail('john@example.com') // Can't forget!
  .build(); // TypeScript ensures all fields set
```

**Pattern #1: Builder (Step-by-Step Construction)**

Think of building a burger at a restaurant - you choose each component:

```typescript
// Building a burger
class BurgerBuilder {
  private burger: Partial<Burger> = {};

  addPatty(type: 'beef' | 'chicken' | 'veggie'): this {
    this.burger.patty = type;
    return this; // Return 'this' for chaining
  }

  addCheese(type: 'cheddar' | 'swiss'): this {
    this.burger.cheese = type;
    return this;
  }

  addToppings(...toppings: string[]): this {
    this.burger.toppings = toppings;
    return this;
  }

  build(): Burger {
    // Make sure patty is required
    if (!this.burger.patty) {
      throw new Error('Burger needs a patty!');
    }
    return this.burger as Burger;
  }
}

// Usage - each method call adds one piece
const myBurger = new BurgerBuilder()
  .addPatty('beef')
  .addCheese('cheddar')
  .addToppings('lettuce', 'tomato', 'onion')
  .build();

// Why this is better than plain object:
// 1. Clear what options are available (autocomplete shows methods)
// 2. Can't forget required parts (build() validates)
// 3. Reads like English: "add patty, add cheese, add toppings, build"
```

**Pattern #2: Branded Types (ID Tags for Similar Things)**

Like luggage tags at an airport - all suitcases look similar, but tags prevent mix-ups:

```typescript
// Without brands: Easy to mix up IDs
function getUser(id: string) { /* ... */ }
function getPost(id: string) { /* ... */ }

const userId = 'user-123';
const postId = 'post-456';

getUser(postId); // ❌ Oops! Used wrong ID, but TypeScript doesn't catch it

// With brands: TypeScript prevents mix-ups
type UserId = string & { __brand: 'UserId' };
type PostId = string & { __brand: 'PostId' };

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId = 'user-123' as UserId; // Tag it as UserId
const postId = 'post-456' as PostId; // Tag it as PostId

getUser(postId); // ❌ TypeScript error: PostId is not UserId!
getUser(userId); // ✅ Correct type

// Real-world analogy:
// - All bills are paper, but $1, $5, $10 are different
// - All strings are strings, but UserId, PostId, Email are different
// - Branded types make TypeScript treat them differently
```

**Pattern #3: Event Emitter (Message Board)**

Like a community message board - people post messages, others subscribe to topics:

```typescript
// Message board for app events
class AppEvents {
  private listeners = new Map<string, Array<Function>>();

  // Subscribe to a topic
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Post a message to topic
  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// Usage
const events = new AppEvents();

// Someone subscribes to "user-logged-in" messages
events.on('user-logged-in', (user) => {
  console.log(`Welcome ${user.name}!`);
});

events.on('user-logged-in', (user) => {
  // Someone else also listening
  console.log(`Logging user ${user.id} to analytics`);
});

// Later, someone posts a "user-logged-in" message
events.emit('user-logged-in', { id: '123', name: 'John' });

// Output:
// Welcome John!
// Logging user 123 to analytics

// Type-safe version ensures message types match:
type Events = {
  'user-logged-in': { id: string; name: string };
  'data-updated': { timestamp: number };
};

class TypedEvents<E extends Record<string, any>> {
  on<K extends keyof E>(
    event: K,
    callback: (data: E[K]) => void
  ): void {
    // TypeScript knows exact type of 'data' for each event!
  }
}
```

**Pattern #4: Phantom Types (Permission Slips)**

Like permission slips for field trips - you can only go if you have the right slip:

```typescript
// Door that requires the right key
class Door<State extends 'locked' | 'unlocked'> {
  // Can only lock an unlocked door
  lock(this: Door<'unlocked'>): Door<'locked'> {
    console.log('Locking door...');
    return this as any;
  }

  // Can only unlock a locked door
  unlock(this: Door<'locked'>): Door<'unlocked'> {
    console.log('Unlocking door...');
    return this as any;
  }

  // Can only open an unlocked door
  open(this: Door<'unlocked'>): void {
    console.log('Door opened!');
  }
}

// Usage
const door = new Door<'locked'>(); // Start with locked door

door.open(); // ❌ TypeScript error: locked door can't open!
door.unlock().open(); // ✅ Works: unlock first, then open

const unlocked = door.unlock(); // Now it's unlocked
unlocked.lock(); // ✅ Can lock an unlocked door
unlocked.unlock(); // ❌ Error: can't unlock what's already unlocked!

// Why this is useful:
// - Prevents invalid operations (opening locked door)
// - Compiler enforces correct sequence
// - No runtime checks needed (zero cost abstraction)
```

**Real-World Example: Online Form Builder**

Combining patterns to build a type-safe form:

```typescript
// Form with different states
type FormState = 'empty' | 'filling' | 'validating' | 'complete';

class Form<State extends FormState, Data = {}> {
  private data: Data = {} as Data;

  // Start empty
  static create(): Form<'empty', {}> {
    return new Form();
  }

  // Add field (moves to 'filling' state)
  addField<K extends string, V>(
    this: Form<'empty' | 'filling', Data>,
    name: K,
    value: V
  ): Form<'filling', Data & Record<K, V>> {
    (this.data as any)[name] = value;
    return this as any;
  }

  // Validate (moves to 'validating' state)
  validate(this: Form<'filling', Data>): Form<'validating', Data> {
    console.log('Validating form...');
    // Validation logic here
    return this as any;
  }

  // Submit (only works after validation)
  submit(this: Form<'validating', Data>): Form<'complete', Data> {
    console.log('Submitting:', this.data);
    return this as any;
  }

  // Get data (only when complete)
  getData(this: Form<'complete', Data>): Data {
    return this.data;
  }
}

// Usage enforces correct flow:
const form = Form.create() // 'empty' state
  .addField('name', 'John') // 'filling' state, data = { name: string }
  .addField('email', 'john@example.com') // still 'filling', data = { name, email }
  .validate() // 'validating' state
  .submit(); // 'complete' state

const data = form.getData(); // ✅ Can get data when complete
// Type of data: { name: string; email: string }

// Invalid flows caught by TypeScript:
Form.create().submit(); // ❌ Error: can't submit empty form
Form.create().addField('name', 'John').submit(); // ❌ Error: must validate first
form.addField('age', 30); // ❌ Error: can't add fields to completed form
```

**Interview Answer Template:**

When asked about advanced TypeScript patterns:

**1. Definition** (10 seconds):
"Advanced TypeScript patterns use combinations of generics, mapped types, and conditional types to solve common problems like safe object construction (Builder), preventing type mixing (Branded Types), or encoding state in types (Phantom Types)."

**2. Concrete Example** (20 seconds):
"For example, the Builder pattern lets you construct objects step-by-step with type safety:
```typescript
new UserBuilder()
  .setId('123')
  .setName('John')
  .build(); // TypeScript enforces all required fields
```
TypeScript tracks which fields you've set and only allows build() when all are complete."

**3. Why It Matters** (15 seconds):
"These patterns catch errors at compile time instead of runtime. For instance, branded types prevent accidentally mixing user IDs with post IDs, even though both are strings. This eliminates entire categories of bugs."

**4. Real-World Usage** (15 seconds):
"I've used builders for complex configuration objects, branded types for database IDs and currency values, and event emitters for decoupled component communication. Each pattern has specific use cases where it shines."

**Common Interview Follow-ups:**

**Q: "When would you use a builder pattern?"**
**A:** "When object construction has many required fields, optional configurations, or complex validation. For example, API client configuration with endpoints, auth, retries, timeouts - a builder guides you through required settings and makes optional ones discoverable."

**Q: "What's the cost of branded types?"**
**A:** "Zero runtime cost - they're erased during compilation. At runtime, a branded `UserId` is just a string. The type safety exists only at compile time, so you get safety without performance impact."

**Q: "How do phantom types work?"**
**A:** "Phantom types use a type parameter that doesn't affect the runtime value, only compile-time checking. Like `Door<'locked'>` vs `Door<'unlocked'>` - both are the same class at runtime, but TypeScript treats them differently and enforces which methods can be called on each."

**Memory Aid - The "BEP" Pattern Framework:**

- **B**uilder: Step-by-step construction with type accumulation
- **E**vents: Decoupled communication with type-safe message passing
- **P**hantom: State encoded in types for compile-time state machines

### Resources
- [TypeScript Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

[← Back to TypeScript README](./README.md)

**Progress:** 15 of 15 advanced type questions completed ✅
