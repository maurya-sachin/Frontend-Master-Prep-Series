# TypeScript Fundamentals - Basics

> Core TypeScript concepts: types, interfaces, unions, intersections, and type inference

---

## Question 1: What is the difference between `type` and `interface`?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Microsoft, Amazon, Airbnb

### Question
Explain the differences between `type` and `interface` in TypeScript. When should you use each?

### Answer

Both `type` and `interface` define the shape of data, but they have different capabilities and use cases.

1. **Key Differences**
   - `interface`: Declaration merging, extends with `extends` keyword
   - `type`: Can represent primitives, unions, tuples, advanced types
   - Both can be used for objects, but `type` is more flexible

2. **Declaration Merging**
   - `interface` supports declaration merging (multiple declarations combine)
   - `type` does not support declaration merging

3. **Extending**
   - `interface` uses `extends` keyword
   - `type` uses intersection types (`&`)

4. **When to Use What**
   - `interface` for public API definitions, React props, class contracts
   - `type` for unions, tuples, mapped types, complex type manipulations

### Code Example

```typescript
// 1. BASIC USAGE

// Interface for objects
interface User {
  id: number;
  name: string;
  email: string;
}

// Type alias for objects
type Product = {
  id: number;
  name: string;
  price: number;
};

// 2. DECLARATION MERGING (interface only)

interface Window {
  title: string;
}

interface Window {
  isOpen: boolean;
}

// Automatically merged into:
// interface Window {
//   title: string;
//   isOpen: boolean;
// }

const myWindow: Window = {
  title: 'My App',
  isOpen: true
};

// Type aliases don't merge - this would be an error:
// type Config = { theme: string; }
// type Config = { mode: string; } // Error: Duplicate identifier

// 3. EXTENDING

// Interface extending interface
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const myDog: Dog = {
  name: 'Buddy',
  breed: 'Golden Retriever'
};

// Type extending type (using intersection)
type Person = {
  name: string;
};

type Employee = Person & {
  employeeId: number;
};

const employee: Employee = {
  name: 'John',
  employeeId: 123
};

// Interface can extend type
type Point = {
  x: number;
  y: number;
};

interface Point3D extends Point {
  z: number;
}

// Type can extend interface (using intersection)
interface Shape {
  color: string;
}

type Circle = Shape & {
  radius: number;
};

// 4. UNION TYPES (type only)

type Status = 'pending' | 'success' | 'error';
type ID = string | number;

// Can't do this with interface:
// interface Status = 'pending' | 'success' | 'error'; // Error

// 5. TUPLE TYPES (type only)

type Coordinate = [number, number];
type RGB = [number, number, number];

const point: Coordinate = [10, 20];
const color: RGB = [255, 0, 0];

// Interface can't represent tuples directly

// 6. MAPPED TYPES (type only)

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly<User>;

// const user: ReadonlyUser = { id: 1, name: 'John', email: 'john@example.com' };
// user.name = 'Jane'; // Error: Cannot assign to 'name' because it is a read-only property

// 7. CONDITIONAL TYPES (type only)

type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// 8. PRIMITIVE TYPES (type only)

type StringOrNumber = string | number;
type Callback = () => void;

// Interface can't represent primitives

// 9. INTERSECTION WITH CONFLICTING PROPERTIES

interface A {
  prop: string;
}

interface B {
  prop: number;
}

// This creates a type with never for prop (conflict)
type AB = A & B;
// const ab: AB = { prop: ??? }; // prop is type never

// 10. CLASSES IMPLEMENTING

interface Printable {
  print(): void;
}

class Document implements Printable {
  print() {
    console.log('Printing document...');
  }
}

// Can also use type
type Saveable = {
  save(): void;
};

class File implements Saveable {
  save() {
    console.log('Saving file...');
  }
}

// 11. FUNCTION TYPES

// Using type
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;

// Using interface
interface StringFormatter {
  (input: string): string;
}

const uppercase: StringFormatter = (input) => input.toUpperCase();

// 12. COMPUTED PROPERTIES

// Type with computed property
type DynamicKey = {
  [key in 'userId' | 'sessionId']: string;
};

const ids: DynamicKey = {
  userId: '123',
  sessionId: 'abc'
};

// Interface with index signature
interface StringMap {
  [key: string]: string;
}

const map: StringMap = {
  name: 'John',
  email: 'john@example.com'
};
```

### Common Mistakes

❌ **Mistake 1:** Using interface for union types
```typescript
// Wrong - interface can't represent unions
interface Status = 'loading' | 'success' | 'error'; // Error

// Correct - use type
type Status = 'loading' | 'success' | 'error';
```

❌ **Mistake 2:** Expecting type aliases to merge
```typescript
// Wrong - types don't merge
type Config = { theme: string; };
type Config = { mode: string; }; // Error: Duplicate identifier

// Use interface if you need merging
interface Config {
  theme: string;
}

interface Config {
  mode: string;
}
// Merged automatically
```

❌ **Mistake 3:** Using interface for complex type manipulations
```typescript
// Complex types need type alias
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Can't do this with interface
```

✅ **Correct:** Use interface for object shapes and API contracts, type for everything else

### Follow-up Questions

- "Can you use both type and interface in the same codebase?"
- "How does declaration merging work with interfaces?"
- "What are the performance differences between type and interface?"
- "When should you prefer type over interface?"
- "How do interfaces work with classes?"

### Resources

- [TypeScript Handbook: Types vs Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [TypeScript Deep Dive: Interfaces vs Types](https://basarat.gitbook.io/typescript/type-system/type-assertion)

---

<details>
<summary><strong>🔍 Deep Dive: Interface vs Type - Compiler Internals and Structural Typing</strong></summary>

### TypeScript Compiler's Representation

TypeScript treats `interface` and `type` differently at the compiler level, which explains their behavioral differences:

**1. Interface Internal Representation**

Interfaces are stored as **object type symbols** in the TypeScript compiler's symbol table. The compiler maintains a single symbol entry per interface name, allowing multiple declarations to merge into one definition:

```typescript
// Compiler creates ONE symbol for 'Window'
interface Window {
  title: string;
}

interface Window {
  isOpen: boolean;
}

// Internal representation (conceptual):
// Symbol['Window'] = {
//   kind: 'InterfaceDeclaration',
//   members: {
//     title: { type: 'string' },
//     isOpen: { type: 'boolean' }
//   }
// }
```

This design enables **declaration merging** - the compiler simply adds new members to the existing symbol. This is critical for augmenting global types (like DOM types) or library definitions without modifying the original source.

**2. Type Alias Internal Representation**

Type aliases are stored as **type alias symbols** that point to a fully resolved type expression. Each type alias is a unique, immutable binding:

```typescript
type Config = { theme: string };

// Internal representation (conceptual):
// Symbol['Config'] = {
//   kind: 'TypeAliasDeclaration',
//   typeExpression: ObjectType { theme: string }
// }

// This would create a SECOND symbol (error: duplicate identifier)
// type Config = { mode: string };
```

Type aliases are **eagerly evaluated** - the compiler resolves the entire type expression immediately, which is why they can represent unions, conditional types, and mapped types.

**3. Structural Typing Engine**

TypeScript uses **structural typing** (duck typing) for both interfaces and types. The compiler checks type compatibility based on shape, not name:

```typescript
interface Point {
  x: number;
  y: number;
}

type Coordinate = {
  x: number;
  y: number;
};

const point: Point = { x: 10, y: 20 };
const coord: Coordinate = point; // OK - same structure

function drawPoint(p: Point) {
  console.log(p.x, p.y);
}

drawPoint(coord); // OK - structural compatibility
```

The compiler performs **shape matching** during type checking:
1. Extract all properties from both types
2. Check each property's type compatibility recursively
3. Verify required vs optional properties
4. Check for excess properties (in object literals)

**4. Performance Implications**

**Compilation Speed:**
- **Interfaces**: Faster for incremental compilation because they support merging. The compiler can cache the merged result.
- **Types**: May be slower for complex type expressions (mapped types, conditional types) because they must be re-evaluated.

**Bundle Size:**
- Both interfaces and types are **completely erased** during compilation - they don't affect bundle size.
- Only runtime constructs (enums with string values, namespace declarations) remain in JavaScript output.

**Type Checking Speed:**
- **Interfaces**: Slightly faster for object shapes because the compiler caches structural checks.
- **Types**: Equivalent speed for simple aliases, but complex types (recursive, conditional) take longer.

**Real-World Benchmark (Large Codebase):**
```typescript
// Tested in a 500,000 LOC codebase (Microsoft VSCode style)

// Using interfaces for public APIs: ~12.5s compilation
interface UserProfile { /* 30 properties */ }
interface UserSettings { /* 20 properties */ }
// ... 1000+ interfaces

// Using types for same definitions: ~13.2s compilation
type UserProfile = { /* 30 properties */ }
type UserSettings = { /* 20 properties */ }
// ... 1000+ types

// Difference: ~5.6% slower (mostly due to lack of caching benefits)
```

**5. Declaration Merging Deep Dive**

Declaration merging works through the compiler's **symbol resolution phase**:

```typescript
// Step 1: First declaration creates base symbol
interface User {
  id: number;
  name: string;
}

// Step 2: Second declaration merges into existing symbol
interface User {
  email: string;
  getProfile(): UserProfile;
}

// Step 3: Third declaration merges again
interface User {
  readonly createdAt: Date;
}

// Final merged interface (what the compiler sees):
interface User {
  id: number;
  name: string;
  email: string;
  getProfile(): UserProfile;
  readonly createdAt: Date;
}
```

**Merging Rules:**
1. **Properties** must have compatible types across declarations
2. **Methods** with same name must have compatible signatures (overloads)
3. **Function signatures** are merged as overloads
4. **Conflicting types** cause compilation errors

```typescript
// Error: Subsequent property declarations must have the same type
interface Config {
  port: number;
}

interface Config {
  port: string; // Error: Type 'string' is not assignable to type 'number'
}

// Method overloading through merging
interface Logger {
  log(message: string): void;
}

interface Logger {
  log(message: string, level: 'info' | 'warn'): void;
}

// Merged result: overloaded method
const logger: Logger = {
  log(message: string, level?: 'info' | 'warn') {
    console.log(`[${level || 'info'}] ${message}`);
  }
};
```

**6. Extending Behavior**

**Interface Extends (Nominal-like Behavior):**
```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Compiler creates new symbol 'Dog' with:
// - Copy of Animal's members
// - Additional Dog-specific members
// - Reference to Animal for quick inheritance checks
```

**Type Intersection (Structural Merging):**
```typescript
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};

// Compiler creates new type alias 'Dog' with:
// - Intersection type expression
// - Lazy evaluation (resolved when needed)
```

**Performance Difference:**
- `extends` is slightly faster because it's a simple member copy
- `&` requires evaluating the intersection type expression every time

**7. Advanced: Conditional Types and Mapped Types**

Only type aliases can represent advanced type transformations:

```typescript
// Conditional type (impossible with interface)
type IsString<T> = T extends string ? true : false;

// How it works internally:
// 1. Compiler sees 'T extends string'
// 2. Performs assignability check: is T assignable to string?
// 3. Returns 'true' branch if yes, 'false' branch if no

type Test1 = IsString<string>; // Resolves to: true
type Test2 = IsString<number>; // Resolves to: false

// Mapped type (impossible with interface)
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// How it works internally:
// 1. Extract all property names from T using 'keyof T'
// 2. Iterate over each property name P
// 3. Create new property with 'readonly' modifier
// 4. Preserve property type T[P]

type User = { id: number; name: string };
type ReadonlyUser = Readonly<User>;
// Resolves to: { readonly id: number; readonly name: string }
```

**8. Real-World Usage Patterns**

**Public API Libraries (React, Express):**
```typescript
// React uses interfaces for component props (allows augmentation)
interface ButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

// Users can augment:
declare module 'react' {
  interface ButtonProps {
    customProp?: string; // Add custom prop to all buttons
  }
}
```

**Internal Application Code:**
```typescript
// Use types for domain models (no need for augmentation)
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
};

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
```

**Utility Libraries (Lodash, Ramda):**
```typescript
// Use types for complex transformations
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type NonNullable<T> = T extends null | undefined ? never : T;
```

### TypeScript Compiler Flags Impact

**`--strict` Mode:**
- Enforces stricter checking for both interfaces and types
- No behavioral difference between them

**`--noImplicitAny`:**
- Affects inference, not interface/type declaration

**`--declaration` (`.d.ts` generation):**
- Both interfaces and types appear in declaration files
- Declaration merging is preserved in `.d.ts` files

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Interface Declaration Conflict in Multi-Team Codebase</strong></summary>

### The Problem

A large e-commerce platform with 15 development teams encountered a critical bug 3 days before Black Friday launch. The checkout process was failing intermittently with TypeScript compilation errors.

**System Context:**
- **Codebase Size:** 800,000 lines of TypeScript
- **Teams:** 15 teams, 60+ developers
- **Build Time:** 8 minutes (full build)
- **Framework:** React + Next.js
- **Deployment:** Kubernetes, 50+ microservices

**Business Impact:**
- **Critical Period:** 3 days before Black Friday
- **Revenue at Risk:** $12M in projected sales
- **Customer Impact:** 45% checkout abandonment rate in staging

### The Incident

**Symptoms:**
```bash
# Production build failing with:
Error: TS2717: Subsequent property declarations must have the same type.
  Property 'trackingId' must be of type 'string', but here has type 'string | number'.

Found in: src/checkout/types/Order.d.ts:12
          src/analytics/types/Order.d.ts:8
          src/shipping/types/Order.d.ts:15

Build failed: 47 errors, 0 warnings
Time: 6m 24s
```

**Timeline:**
- **Day 1, 09:00 AM:** QA reports checkout failures in staging
- **Day 1, 09:30 AM:** DevOps confirms build is broken
- **Day 1, 10:00 AM:** Senior engineers start investigation
- **Day 1, 11:00 AM:** Root cause identified (interface conflicts)
- **Day 1, 02:00 PM:** Solution designed and reviewed
- **Day 1, 05:00 PM:** Fix deployed to staging
- **Day 1, 08:00 PM:** Production deployment complete

### Root Cause Analysis

**The Problematic Code:**

**Team A (Checkout Team):**
```typescript
// src/checkout/types/Order.d.ts
interface Order {
  orderId: string;
  customerId: string;
  trackingId: string; // Originally string
  items: OrderItem[];
  total: number;
}
```

**Team B (Analytics Team):**
```typescript
// src/analytics/types/Order.d.ts
interface Order {
  trackingId: string | number; // Changed to support legacy system
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
}
```

**Team C (Shipping Team):**
```typescript
// src/shipping/types/Order.d.ts
interface Order {
  trackingId: number; // Internal shipping uses numeric IDs
  shippingAddress: Address;
  carrier: string;
}
```

**What Went Wrong:**

1. **Declaration Merging Conflict:** All three teams declared an `Order` interface in global scope (no namespace/module scoping)
2. **Type Incompatibility:** `trackingId` had three different types: `string`, `string | number`, `number`
3. **Lack of Communication:** Teams worked in isolated feature branches, no cross-team type review
4. **Build System Issue:** Local builds passed (each team only imported their own types), but monorepo build failed

**Why It Happened:**

- **No TypeScript Governance:** No guidelines on when to use `interface` vs `type`
- **No Type Ownership:** Multiple teams owned different aspects of the same domain entity
- **Late Integration:** Feature branches merged days before release
- **Missing CI Checks:** Per-team CI didn't catch global type conflicts

### Debugging Process

**Step 1: Identify All Conflicting Declarations**
```bash
# Search for all Order interface declarations
grep -rn "interface Order" src/ --include="*.ts" --include="*.d.ts"

# Output:
src/checkout/types/Order.d.ts:5:interface Order {
src/analytics/types/Order.d.ts:3:interface Order {
src/shipping/types/Order.d.ts:7:interface Order {
src/inventory/types/Order.d.ts:10:interface Order {
src/payments/types/Order.d.ts:4:interface Order {

# 5 different teams declared Order interface!
```

**Step 2: Analyze Type Conflicts**
```typescript
// Use TypeScript compiler API to inspect merged type
import * as ts from 'typescript';

const program = ts.createProgram(['src/**/*.ts'], {});
const checker = program.getTypeChecker();

// Find Order type symbol
const orderSymbol = checker.getSymbolAtLocation(/* Order identifier */);

// Check merged declarations
console.log('Order interface has', orderSymbol.declarations.length, 'declarations');

orderSymbol.declarations.forEach((decl, index) => {
  console.log(`Declaration ${index + 1}:`, decl.getSourceFile().fileName);
  const type = checker.getTypeAtLocation(decl);
  const properties = checker.getPropertiesOfType(type);

  properties.forEach(prop => {
    const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
    console.log(`  ${prop.name}: ${checker.typeToString(propType)}`);
  });
});

// Output shows conflicts:
// trackingId: string (checkout)
// trackingId: string | number (analytics)
// trackingId: number (shipping)
// ERROR: Conflicting types for property 'trackingId'
```

**Step 3: Impact Assessment**
```bash
# Find all code using Order interface
grep -rn ": Order" src/ --include="*.ts" --include="*.tsx" | wc -l
# Result: 847 files use Order type

# Find code using trackingId specifically
grep -rn "trackingId" src/ --include="*.ts" --include="*.tsx" | wc -l
# Result: 234 files use trackingId

# High-risk files (could break at runtime)
grep -rn "order\.trackingId" src/ --include="*.ts" --include="*.tsx" > tracking_id_usage.txt
```

### The Solution

**Immediate Fix (Day 1):**

**1. Namespaced Interfaces (Short-term)**
```typescript
// src/checkout/types/Order.d.ts
declare namespace Checkout {
  interface Order {
    orderId: string;
    customerId: string;
    trackingId: string;
    items: OrderItem[];
    total: number;
  }
}

// src/analytics/types/Order.d.ts
declare namespace Analytics {
  interface Order {
    trackingId: string | number; // Supports both legacy and new
    timestamp: Date;
    source: 'web' | 'mobile' | 'api';
  }
}

// src/shipping/types/Order.d.ts
declare namespace Shipping {
  interface Order {
    trackingId: number;
    shippingAddress: Address;
    carrier: string;
  }
}

// Usage:
const checkoutOrder: Checkout.Order = { /* ... */ };
const analyticsOrder: Analytics.Order = { /* ... */ };
```

**2. Type Aliases for Domain Models (Long-term)**
```typescript
// src/types/domain/checkout.ts
export type CheckoutOrder = {
  orderId: string;
  customerId: string;
  trackingId: string;
  items: OrderItem[];
  total: number;
};

// src/types/domain/analytics.ts
export type AnalyticsOrder = {
  trackingId: string | number;
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
};

// src/types/domain/shipping.ts
export type ShippingOrder = {
  trackingId: number;
  shippingAddress: Address;
  carrier: string;
};

// Shared base type
export type BaseOrder = {
  trackingId: string; // Canonical type
  orderId: string;
};

// Type adapters for conversion
export function toAnalyticsOrder(order: CheckoutOrder): AnalyticsOrder {
  return {
    trackingId: order.trackingId, // string -> string | number (safe widening)
    timestamp: new Date(),
    source: 'web'
  };
}

export function toShippingOrder(order: CheckoutOrder): ShippingOrder {
  return {
    trackingId: parseInt(order.trackingId, 10), // string -> number (explicit conversion)
    shippingAddress: order.shippingAddress,
    carrier: 'USPS'
  };
}
```

**3. Centralized Type Registry**
```typescript
// src/types/registry.ts
/**
 * SINGLE SOURCE OF TRUTH for domain types
 *
 * Rules:
 * 1. All domain types use 'type', not 'interface'
 * 2. Use namespaces for team-specific extensions
 * 3. Never re-declare the same type name
 * 4. Use type adapters for conversions
 */

export type Order = {
  orderId: string;
  customerId: string;
  trackingId: string; // Canonical type: always string
  items: OrderItem[];
  total: number;
  createdAt: Date;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

// Team-specific extensions
export namespace Checkout {
  export type OrderWithPayment = Order & {
    paymentMethod: PaymentMethod;
    billingAddress: Address;
  };
}

export namespace Analytics {
  export type OrderEvent = Order & {
    timestamp: Date;
    source: 'web' | 'mobile' | 'api';
    sessionId: string;
  };
}

export namespace Shipping {
  export type OrderWithShipping = Order & {
    shippingAddress: Address;
    carrier: string;
    estimatedDelivery: Date;
  };
}
```

### Performance Metrics

**Before Fix:**
- **Build Success Rate:** 0% (complete failure)
- **Build Time:** N/A (failing)
- **TypeScript Errors:** 47 errors across 23 files
- **Deployment:** Blocked

**After Fix:**
- **Build Success Rate:** 100%
- **Build Time:** 8m 12s (normal)
- **TypeScript Errors:** 0
- **Deployment:** Successful
- **Production Incidents:** 0 type-related bugs

**Long-term Governance Impact:**
- **Type Conflict Rate:** Reduced from 12 conflicts/month to 0 conflicts/month
- **Build Reliability:** 99.8% success rate (previously 94%)
- **Onboarding Time:** New developers understand type system 40% faster
- **Code Reviews:** Type-related review comments reduced by 65%

### Lessons Learned

**1. Interface vs Type Decision Matrix (Established Post-Incident):**

| Use Case | Recommended | Reason |
|----------|-------------|--------|
| Public library API | `interface` | Allows consumers to augment |
| Domain models | `type` | No merging needed, prevents conflicts |
| React component props | `interface` | Enables declaration merging for extensibility |
| Utility types | `type` | Requires advanced type features |
| Global augmentation | `interface` | Explicit merging is the goal |

**2. TypeScript Governance Policies:**
- **Rule 1:** Domain types MUST use `type` alias, not `interface`
- **Rule 2:** Only library/framework APIs may use `interface`
- **Rule 3:** All types must be exported from centralized registry
- **Rule 4:** CI must check for duplicate type names across codebase
- **Rule 5:** Type ownership assigned to specific teams (CODEOWNERS)

**3. Automated Checks (Added to CI):**
```typescript
// scripts/check-type-conflicts.ts
import * as ts from 'typescript';
import * as glob from 'glob';

const program = ts.createProgram(glob.sync('src/**/*.ts'), {});
const checker = program.getTypeChecker();

const typeRegistry = new Map<string, string[]>();

// Scan all type declarations
program.getSourceFiles().forEach(sourceFile => {
  ts.forEachChild(sourceFile, node => {
    if (ts.isInterfaceDeclaration(node)) {
      const typeName = node.name.text;
      const fileName = sourceFile.fileName;

      if (!typeRegistry.has(typeName)) {
        typeRegistry.set(typeName, []);
      }
      typeRegistry.get(typeName)!.push(fileName);
    }
  });
});

// Report conflicts
let hasConflicts = false;
typeRegistry.forEach((files, typeName) => {
  if (files.length > 1 && !isAllowedMerge(typeName)) {
    console.error(`ERROR: Interface '${typeName}' declared in ${files.length} files:`);
    files.forEach(file => console.error(`  - ${file}`));
    hasConflicts = true;
  }
});

if (hasConflicts) {
  process.exit(1);
}

function isAllowedMerge(typeName: string): boolean {
  // Allow declaration merging for known global types
  const allowedMerges = ['Window', 'Document', 'NodeJS.ProcessEnv'];
  return allowedMerges.includes(typeName);
}
```

**4. Developer Training:**
- Weekly "TypeScript Office Hours" sessions
- Documentation: "When to Use Interface vs Type"
- Code review checklist includes type system guidelines

---

</details>

<details>
<summary><strong>⚖️ Trade-offs: Interface vs Type Alias - Decision Framework</strong></summary>

### Decision Matrix

The choice between `interface` and `type` isn't just about capability—it's about maintainability, team collaboration, and future extensibility. Here's a comprehensive framework:

### Trade-off #1: Extensibility vs Immutability

**Interface (Extensible by Design):**

**Pros:**
- Allows consumers to augment definitions without modifying source
- Perfect for public APIs and plugin systems
- Enables gradual type refinement across codebase

**Cons:**
- Can lead to unexpected behavior if unintentionally merged
- Global namespace pollution risk
- Harder to track "complete" type shape (must search all declarations)

**Type (Immutable by Design):**

**Pros:**
- Single source of truth - what you see is what you get
- No risk of accidental modification
- Easier to reason about in large codebases

**Cons:**
- Cannot be augmented by consumers
- Requires wrapper types for extensions
- Less flexible for evolving APIs

**Example Decision:**

```typescript
// CHOOSE INTERFACE: Building a plugin system
interface PluginAPI {
  registerCommand(name: string, handler: Function): void;
}

// Third-party plugins can augment:
declare module 'my-app' {
  interface PluginAPI {
    registerWidget(name: string, component: Component): void;
  }
}

// CHOOSE TYPE: Internal business logic
type Invoice = {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
};

// Extension requires explicit composition:
type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
};
```

**Performance Trade-off:**
- **Interface:** Slightly faster compilation for large codebases (5-8% in 500k+ LOC projects)
- **Type:** Equivalent speed for simple aliases, slower for complex mapped/conditional types

### Trade-off #2: Type Flexibility vs Clarity

**Interface (Object-Focused):**

**Best For:**
- Object shapes
- Class contracts
- React component props
- Function signatures (callable interfaces)

**Limitations:**
- Cannot represent unions: `interface Status = 'loading' | 'success'` ❌
- Cannot represent tuples: `interface Coord = [number, number]` ❌
- Cannot use mapped types: `interface Readonly<T> = { readonly [P in keyof T]: T[P] }` ❌

**Type (Universal):**

**Best For:**
- Unions: `type Status = 'loading' | 'success' | 'error'`
- Tuples: `type RGB = [number, number, number]`
- Mapped types: `type Partial<T> = { [P in keyof T]?: T[P] }`
- Conditional types: `type NonNullable<T> = T extends null ? never : T`
- Primitive aliases: `type ID = string | number`

**Example Decision:**

```typescript
// CHOOSE TYPE: Discriminated unions (state machines)
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Data: ${state.data}`; // TypeScript knows 'data' exists
    case 'error':
      return `Error: ${state.error.message}`;
  }
}

// CHOOSE INTERFACE: React component props (may need augmentation)
interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  return <button onClick={onClick} className={variant}>{children}</button>;
};
```

**Clarity Trade-off:**
- **Interface:** More explicit about "this is an object shape"
- **Type:** Can be confusing when used for simple objects (looks like a variable assignment)

### Trade-off #3: Declaration Merging vs Namespace Safety

**Interface (Merging Enabled):**

**Use Cases:**
1. **Global Type Augmentation (DOM types):**
```typescript
// Extend Window object with analytics
interface Window {
  gtag: (command: string, ...args: any[]) => void;
  dataLayer: any[];
}

// Now TypeScript knows about these properties
window.gtag('event', 'page_view');
```

2. **Module Augmentation:**
```typescript
// Extend third-party library types
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}

// Now Request has user property
app.get('/profile', (req, res) => {
  console.log(req.user?.email); // TypeScript knows about 'user'
});
```

3. **API Versioning:**
```typescript
// v1 API
interface ApiResponse {
  data: any;
}

// v2 adds pagination
interface ApiResponse {
  pagination?: {
    page: number;
    totalPages: number;
  };
}

// Merged: backward compatible
```

**Risks:**
- Accidental global namespace pollution
- Hard to track all merged declarations
- Can cause conflicts in multi-team environments

**Type (No Merging):**

**Use Cases:**
1. **Strict Domain Models:**
```typescript
// Each type has single, immutable definition
type User = {
  id: string;
  email: string;
};

// Extensions are explicit
type AdminUser = User & {
  permissions: string[];
};
```

2. **Version-Specific Types:**
```typescript
// Clear separation between versions
type ApiResponseV1 = {
  data: any;
};

type ApiResponseV2 = {
  data: any;
  pagination: {
    page: number;
    totalPages: number;
  };
};
```

**Benefits:**
- No namespace conflicts
- Single source of truth
- Easier to search and refactor

**Example Decision:**

```typescript
// CHOOSE INTERFACE: Augmenting third-party library
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'admin' | 'user';
    };
  }
}

// CHOOSE TYPE: Internal domain model
type Product = {
  id: string;
  name: string;
  price: number;
};

type DiscountedProduct = Product & {
  discountPercent: number;
  finalPrice: number;
};
```

### Trade-off #4: Inheritance vs Composition

**Interface (Extends Keyword):**

**Syntax:**
```typescript
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

// Multiple inheritance
interface ServiceDog extends Dog, Trainable {
  service: string;
}
```

**Pros:**
- Clear inheritance hierarchy
- Familiar OOP syntax
- IDE shows inheritance chain

**Cons:**
- Creates tight coupling
- Can lead to deep inheritance trees
- Harder to compose multiple behaviors

**Type (Intersection Operator):**

**Syntax:**
```typescript
type Animal = {
  name: string;
  age: number;
};

type Dog = Animal & {
  breed: string;
  bark(): void;
};

// Composition of multiple types
type ServiceDog = Dog & Trainable & {
  service: string;
};
```

**Pros:**
- Flexible composition
- No coupling to inheritance structure
- Easy to combine orthogonal concerns

**Cons:**
- Less explicit relationship
- Can create complex type expressions
- Harder to visualize type hierarchy

**Example Decision:**

```typescript
// CHOOSE INTERFACE: Class-based hierarchy
interface Vehicle {
  speed: number;
  start(): void;
  stop(): void;
}

interface Car extends Vehicle {
  doors: number;
  drive(): void;
}

class Sedan implements Car {
  speed = 0;
  doors = 4;

  start() { this.speed = 10; }
  stop() { this.speed = 0; }
  drive() { console.log('Driving...'); }
}

// CHOOSE TYPE: Composing behaviors
type Loggable = {
  log(message: string): void;
};

type Serializable = {
  toJSON(): string;
};

type Cacheable = {
  cacheKey: string;
  ttl: number;
};

type ApiClient = Loggable & Serializable & Cacheable & {
  fetch<T>(url: string): Promise<T>;
};
```

### Trade-off #5: Error Messages

**Interface Error Messages:**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John'
  // Missing 'email'
};

// Error: Type '{ id: number; name: string; }' is not assignable to type 'User'.
//   Property 'email' is missing in type '{ id: number; name: string; }'
//   but required in type 'User'.
```

**Type Error Messages:**
```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

const user: User = {
  id: 1,
  name: 'John'
  // Missing 'email'
};

// Error: Type '{ id: number; name: string; }' is not assignable to type 'User'.
//   Property 'email' is missing in type '{ id: number; name: string; }'
//   but required in type 'User'.
```

**Result:** Error messages are nearly identical. No significant difference.

**Complex Type Errors:**
```typescript
// Type with complex intersection
type ComplexType = Loggable & Serializable & Cacheable & { fetch(): void };

const obj: ComplexType = { /* incomplete */ };

// Error shows full expanded type (can be verbose)
// Error: Type '{}' is missing the following properties from type
// 'Loggable & Serializable & Cacheable & { fetch(): void }':
// log, toJSON, cacheKey, ttl, fetch
```

**Trade-off:** Type aliases with complex intersections can produce verbose error messages, while interfaces tend to show clearer type names.

### Trade-off #6: TypeScript Version Compatibility

**Interface:**
- Supported since TypeScript 1.0
- Declaration merging since TypeScript 1.0
- Stable, no breaking changes

**Type:**
- Basic type aliases since TypeScript 1.4
- Advanced features (mapped types, conditional types) added in TypeScript 2.1+
- Newer features may require minimum TypeScript version

**Example Decision:**

```typescript
// CHOOSE INTERFACE: Supporting older TypeScript versions (< 2.1)
interface LegacyConfig {
  apiUrl: string;
  timeout: number;
}

// CHOOSE TYPE: Using modern TypeScript features (2.1+)
type ModernConfig = {
  [K in 'apiUrl' | 'timeout']: K extends 'timeout' ? number : string;
};
```

### Decision Framework Summary

**Use `interface` when:**
1. Defining public API that consumers may need to augment
2. Building plugin/extension systems
3. Working with classes (implements clause)
4. Need declaration merging for global types (DOM, third-party libs)
5. Want clear object shape semantics
6. Supporting older TypeScript versions

**Use `type` when:**
1. Defining domain models (no augmentation needed)
2. Creating unions, tuples, or primitive aliases
3. Using advanced type features (mapped, conditional, template literal types)
4. Want single source of truth (no merging)
5. Composing orthogonal behaviors with intersections
6. Building utility types or type transformations
7. Working in large multi-team codebases (avoid conflicts)

**Performance Considerations:**

| Scenario | Interface | Type | Winner |
|----------|-----------|------|--------|
| Compilation speed (large codebase) | Slightly faster | Slightly slower | Interface (~5%) |
| Type checking speed | Equal | Equal | Tie |
| Bundle size | Zero (erased) | Zero (erased) | Tie |
| IDE autocomplete | Slightly faster | Slightly slower | Interface |
| Error messages (simple) | Clear | Clear | Tie |
| Error messages (complex) | Clear | Can be verbose | Interface |

**Real-World Codebase Guidelines:**

**React Application (Airbnb Style):**
- Component props: `interface` (allows testing library augmentation)
- State types: `type` (unions for state machines)
- API responses: `type` (discriminated unions)
- Utility types: `type` (mapped types)

**Node.js Backend (Stripe Style):**
- API route handlers: `interface` (augment Express types)
- Database models: `type` (immutable domain models)
- Configuration: `type` (literal types for environment)
- Middleware contracts: `interface` (extensible)

**Library/NPM Package (React, Lodash Style):**
- Public API: `interface` (allows consumer augmentation)
- Internal utilities: `type` (no external access)
- Generic utilities: `type` (advanced type features)

---

</details>

<details>
<summary><strong>💬 Explain to Junior: Understanding Interface vs Type in TypeScript</strong></summary>

### The Simple Analogy

Think of TypeScript types like **blueprints** for building things:

**Interface** = A blueprint that anyone can add rooms to later
**Type** = A blueprint that's locked once created

### Real-World Example: Building a House

**Interface (Extensible Blueprint):**
```typescript
// You start with a basic house blueprint
interface House {
  bedrooms: number;
  bathrooms: number;
}

// Later, the city says "all houses need fire alarms"
interface House {
  hasFireAlarm: boolean;
}

// Even later, the HOA says "all houses need a garage"
interface House {
  garageSize: number;
}

// Final house has ALL these requirements combined:
const myHouse: House = {
  bedrooms: 3,
  bathrooms: 2,
  hasFireAlarm: true,
  garageSize: 2
};
```

**Type (Locked Blueprint):**
```typescript
// You create a house blueprint
type House = {
  bedrooms: number;
  bathrooms: number;
};

// You CANNOT add more to it later:
// type House = {  // ERROR: Duplicate identifier
//   hasFireAlarm: boolean;
// };

// Instead, you create a NEW blueprint that includes the old one:
type ModernHouse = House & {
  hasFireAlarm: boolean;
  garageSize: number;
};

const myHouse: ModernHouse = {
  bedrooms: 3,
  bathrooms: 2,
  hasFireAlarm: true,
  garageSize: 2
};
```

### When to Use What: Simple Rules

**Rule #1: Use `interface` for objects you might extend later**

```typescript
// React component props - might add more props later
interface ButtonProps {
  onClick: () => void;
  text: string;
}

// Easy to add more later
interface ButtonProps {
  disabled?: boolean;
}
```

**Rule #2: Use `type` for things that can't be objects**

```typescript
// Unions - can only use 'type'
type Status = 'loading' | 'success' | 'error';

// Tuples - can only use 'type'
type Coordinate = [number, number];

// Primitives - can only use 'type'
type ID = string | number;
```

**Rule #3: Use `type` for data models in your app**

```typescript
// User data from database
type User = {
  id: string;
  email: string;
  name: string;
};

// This prevents accidental modification
```

### Common Beginner Mistakes

**Mistake #1: Trying to use interface for unions**
```typescript
// WRONG - this doesn't work
interface Status = 'loading' | 'success' | 'error'; // ERROR!

// CORRECT - use type
type Status = 'loading' | 'success' | 'error'; // ✓
```

**Mistake #2: Expecting types to merge**
```typescript
// WRONG - types don't merge
type Config = { theme: 'light' };
type Config = { mode: 'auto' }; // ERROR: Duplicate identifier

// CORRECT - interfaces merge automatically
interface Config { theme: 'light' }
interface Config { mode: 'auto' }
// Merged: { theme: 'light'; mode: 'auto' }
```

**Mistake #3: Using interface for everything**
```typescript
// WRONG - too rigid
interface UserID = string; // ERROR: can't do this

// CORRECT - use type for aliases
type UserID = string; // ✓
```

### Interview Answer Template

**Question:** "What's the difference between `interface` and `type`?"

**Perfect Answer (2-3 minutes):**

"Both `interface` and `type` define the shape of data in TypeScript, but they have key differences:

**Declaration Merging:** Interfaces support declaration merging - if you declare the same interface twice, TypeScript combines them. Types don't merge; you'll get a duplicate identifier error.

**Flexibility:** Types are more flexible - they can represent unions, tuples, and primitives. Interfaces are mainly for object shapes.

**Use Cases:** I use interfaces for React component props and public APIs because they can be extended later. I use types for domain models, unions, and internal data structures because they're immutable and prevent accidental modification.

For example:
- Interface for component props: `interface ButtonProps { onClick: () => void }`
- Type for state: `type Status = 'loading' | 'success' | 'error'`
- Type for domain model: `type User = { id: string; name: string }`

In practice, both work for object shapes, but the choice depends on whether you need extensibility (interface) or immutability (type)."

**Follow-up Handling:**

*"Can you use both in the same codebase?"*
"Absolutely! Use interfaces for public APIs and component props where extensibility matters. Use types for domain models, unions, and internal types where immutability prevents conflicts."

*"What about performance?"*
"At runtime, both are completely erased - zero performance difference. At compile time, interfaces are slightly faster for large codebases because TypeScript can cache merged results, but the difference is negligible (around 5% in massive projects)."

*"When would you choose one over the other?"*
"I ask myself: Will this need to be extended by other code? If yes, use interface (like React props). Does this need to represent multiple types or complex logic? If yes, use type (like state machines with unions). For simple domain models, I prefer types to avoid accidental merging."

### Visual Mental Model

```
INTERFACE = 📦 Open Box
- Anyone can add items later
- Automatically combines duplicates
- Great for public APIs
- Can only hold objects

TYPE = 🔒 Sealed Container
- Locked once created
- Can't add more later
- Great for data models
- Can hold anything (unions, tuples, primitives)
```

### Practical Coding Examples

**Example 1: React Component**
```typescript
// Use interface - might extend props later
interface CardProps {
  title: string;
  content: string;
}

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
};

// Later, add more props easily
interface CardProps {
  footer?: string;
}
```

**Example 2: API Response**
```typescript
// Use type - union for different response states
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.status === 'loading') {
    return 'Loading...';
  } else if (response.status === 'success') {
    return response.data; // TypeScript knows 'data' exists here
  } else {
    return response.error; // TypeScript knows 'error' exists here
  }
}
```

**Example 3: Form State**
```typescript
// Use type - state machine with unions
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; error: string };

function FormComponent() {
  const [state, setState] = React.useState<FormState>({ status: 'idle' });

  const handleSubmit = async () => {
    setState({ status: 'submitting' });

    try {
      await submitForm();
      setState({ status: 'success', message: 'Form submitted!' });
    } catch (error) {
      setState({ status: 'error', error: error.message });
    }
  };

  // Render based on state
  if (state.status === 'submitting') return <div>Submitting...</div>;
  if (state.status === 'success') return <div>{state.message}</div>;
  if (state.status === 'error') return <div>Error: {state.error}</div>;

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Quick Decision Flowchart

```
Do you need unions/tuples/primitives?
├─ YES → Use TYPE
└─ NO → Continue

Is this a public API that others might extend?
├─ YES → Use INTERFACE
└─ NO → Continue

Is this a domain model/data structure?
├─ YES → Use TYPE (prevent accidental merging)
└─ NO → Either is fine (personal preference)
```

### Memory Tricks

**"I" in Interface = "Inherits" / "Incremental"**
- Interfaces can be incrementally added to
- Interfaces work well with class inheritance

**"T" in Type = "Total" / "Transformable"**
- Types give you the total picture (no hidden merges)
- Types are transformable (mapped types, conditional types)

### Practice Exercise

**Try this:**
```typescript
// Fix these mistakes:

// 1. Wrong tool for union
interface Color = 'red' | 'green' | 'blue'; // Fix: Use type

// 2. Expecting types to merge
type Settings = { theme: string };
type Settings = { language: string }; // Fix: Use interface or rename

// 3. Using type for extendable API
type PluginConfig = { name: string };
// Fix: Use interface if plugins need to extend this

// Correct versions:
type Color = 'red' | 'green' | 'blue';

interface Settings {
  theme: string;
}
interface Settings {
  language: string;
}

interface PluginConfig {
  name: string;
}
```

### Summary for Interview

**One-Sentence Summary:**
"Use `interface` for object shapes that might need extending (like component props), and `type` for everything else (unions, domain models, complex types)."

**Three Key Points:**
1. **Merging:** Interfaces merge, types don't
2. **Flexibility:** Types can represent anything, interfaces are for objects
3. **Use Case:** Interfaces for APIs, types for models and unions

**What Not to Say:**
- "Interfaces are better" (depends on use case)
- "Types are more modern" (both are equally valid)
- "Always use one over the other" (use both appropriately)

---


## Question 2: What is type inference in TypeScript?

**Difficulty:** 🟢 Easy
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** All companies using TypeScript

### Question
Explain how type inference works in TypeScript. When does TypeScript infer types automatically?

### Answer

Type inference is TypeScript's ability to automatically deduce types without explicit annotations.

1. **How It Works**
   - Analyzes variable initialization
   - Looks at function return values
   - Examines context (contextual typing)
   - Uses best common type algorithm

2. **When Types Are Inferred**
   - Variable declarations with initialization
   - Function return types
   - Array and object literals
   - Generic function calls

3. **Benefits**
   - Less verbose code
   - Maintains type safety
   - Reduces redundant type annotations
   - Better developer experience

### Code Example

```typescript
// 1. VARIABLE TYPE INFERENCE

// Type inferred as number
let count = 0; // number

// Type inferred as string
let message = 'Hello'; // string

// Type inferred as boolean
let isActive = true; // boolean

// No inference without initialization
let value; // type: any
value = 5;
value = 'text'; // OK, but loses type safety

// 2. BEST COMMON TYPE

// Inferred as (number | string)[]
let mixed = [1, 'two', 3]; // (number | string)[]

// Inferred as number[]
let numbers = [1, 2, 3]; // number[]

// Inferred as string[]
let names = ['Alice', 'Bob']; // string[]

// 3. CONTEXTUAL TYPING

window.addEventListener('click', (event) => {
  // event is inferred as MouseEvent
  console.log(event.clientX, event.clientY);
});

[1, 2, 3].map((num) => {
  // num is inferred as number
  return num * 2;
});

// 4. FUNCTION RETURN TYPE INFERENCE

function add(a: number, b: number) {
  return a + b; // Return type inferred as number
}

function greet(name: string) {
  return `Hello, ${name}`; // Return type inferred as string
}

function process(value: number) {
  if (value > 0) {
    return value; // number
  }
  return 'negative'; // string
}
// Return type inferred as number | string

// 5. OBJECT LITERAL INFERENCE

const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
};
// Type inferred as:
// {
//   name: string;
//   age: number;
//   email: string;
// }

// 6. ARRAY METHOD INFERENCE

const nums = [1, 2, 3];

const doubled = nums.map(n => n * 2); // number[]
const strings = nums.map(n => n.toString()); // string[]
const evens = nums.filter(n => n % 2 === 0); // number[]

// 7. GENERIC FUNCTION INFERENCE

function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // T inferred as number
const str = identity('hello'); // T inferred as string

// 8. PROMISE INFERENCE

async function fetchUser() {
  return { id: 1, name: 'John' };
}

// Return type inferred as Promise<{ id: number; name: string; }>

const userPromise = fetchUser();
// Type: Promise<{ id: number; name: string; }>

// 9. DESTRUCTURING INFERENCE

const person = { name: 'Alice', age: 25 };

const { name, age } = person;
// name: string
// age: number

const [first, second] = [1, 2, 3];
// first: number
// second: number

// 10. AS CONST ASSERTION

const colors = ['red', 'green', 'blue'];
// Type: string[]

const colorsConst = ['red', 'green', 'blue'] as const;
// Type: readonly ['red', 'green', 'blue']

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;
// All properties become readonly and literal types

// 11. DISCRIMINATED UNIONS

type Success = { status: 'success'; data: string };
type Error = { status: 'error'; error: string };
type Result = Success | Error;

function handleResult(result: Result) {
  if (result.status === 'success') {
    // TypeScript narrows type to Success
    console.log(result.data); // OK
    // console.log(result.error); // Error: Property 'error' does not exist
  } else {
    // TypeScript narrows type to Error
    console.log(result.error); // OK
  }
}

// 12. CONTROL FLOW ANALYSIS

function processValue(value: string | number) {
  if (typeof value === 'string') {
    // Type narrowed to string
    console.log(value.toUpperCase());
  } else {
    // Type narrowed to number
    console.log(value.toFixed(2));
  }
}
```

### Common Mistakes

❌ **Mistake 1:** Relying on inference when explicit types are clearer
```typescript
// Unclear inference
const result = processData(); // What type is this?

// Better - explicit return type
function processData(): UserData {
  // ...
}
```

❌ **Mistake 2:** Losing type information
```typescript
let value; // type: any (no inference without initialization)
value = 5;
value = 'text'; // OK, but not type-safe

// Better
let value: number;
value = 5;
// value = 'text'; // Error
```

❌ **Mistake 3:** Widening types too much
```typescript
const status = 'pending'; // Type: string (too wide)

// Better - use const assertion
const status = 'pending' as const; // Type: 'pending'

// Or use explicit literal type
const status: 'pending' = 'pending';
```

✅ **Correct:** Let TypeScript infer simple cases, be explicit for complex types and public APIs

### Follow-up Questions

- "What is contextual typing?"
- "How does TypeScript's type narrowing work?"
- "When should you explicitly annotate types?"
- "What is the 'as const' assertion?"
- "How does TypeScript infer generic types?"

### Resources

- [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Deep Dive: Type Inference](https://basarat.gitbook.io/typescript/type-system/type-inference)

---

</details>

<details>
<summary><strong>🔍 Deep Dive: TypeScript's Type Inference Algorithm</strong></summary>

### How the Compiler Infers Types

TypeScript's type inference system is one of its most powerful features, reducing boilerplate while maintaining safety. Understanding how it works requires diving into the compiler's type-checking algorithms.

**The Type Inference Pipeline:**

When TypeScript encounters a declaration like `const x = 42`, the compiler goes through several phases:

1. **Lexical Analysis** - Tokenizes the code
2. **Parsing** - Builds an Abstract Syntax Tree (AST)
3. **Binding** - Creates symbols and builds the symbol table
4. **Type Checking** - Infers and validates types

**Phase 1: Literal Type Inference**

For primitive literals, TypeScript uses different inference strategies based on the declaration keyword:

```typescript
let x = 42;       // Inferred as 'number' (wide type)
const y = 42;     // Inferred as '42' (literal type)
var z = 42;       // Inferred as 'number' (wide type)

let str = 'hello';      // Inferred as 'string'
const str2 = 'hello';   // Inferred as 'hello' (literal type in TS 3.4+)
```

**Why the difference?** The compiler uses **type widening** for `let` and `var` because the value might change. For `const`, it uses narrow literal types because the value is immutable.

**Internally**, the compiler's `getWidenedLiteralType()` function handles this:

```typescript
// Simplified TypeScript compiler logic
function getWidenedLiteralType(type: Type): Type {
  if (type.flags & TypeFlags.StringLiteral) {
    return stringType; // Widen to 'string'
  }
  if (type.flags & TypeFlags.NumberLiteral) {
    return numberType; // Widen to 'number'
  }
  return type;
}
```

**Phase 2: Best Common Type Algorithm**

When TypeScript encounters an array literal or similar structure with multiple types, it uses the **best common type** algorithm:

```typescript
const arr = [1, 'two', 3];
// TypeScript considers:
// - number (from 1 and 3)
// - string (from 'two')
// Best common type: (number | string)[]
```

The algorithm:
1. Collects all element types
2. Checks if one type is a supertype of all others
3. If no supertype exists, creates a union type
4. Applies the union to the array type

**Real compiler behavior:**

```typescript
const nums = [1, 2, 3];           // number[]
const mixed = [1, null];          // (number | null)[]
const objs = [{ x: 1 }, { y: 2 }]; // { x: number; y?: undefined } | { y: number; x?: undefined }[]

// With type annotation to guide inference:
const objs2: Array<{ x?: number; y?: number }> = [{ x: 1 }, { y: 2 }]; // Better!
```

**Phase 3: Contextual Typing (Reverse Inference)**

TypeScript can infer types **backwards** from the usage context. This is called **contextual typing**:

```typescript
// Example 1: Event handler
window.addEventListener('click', (event) => {
  // 'event' is inferred as MouseEvent because:
  // 1. addEventListener's signature specifies (event: MouseEvent) => void
  // 2. TypeScript infers the callback parameter from the expected type
  console.log(event.clientX); // OK - TypeScript knows about clientX
});

// Example 2: Array methods
[1, 2, 3].map((item) => {
  // 'item' is inferred as 'number' because:
  // 1. Array is number[]
  // 2. map's signature: (callbackfn: (value: T) => U)
  // 3. T is inferred as 'number' from array type
  return item * 2;
});
```

**Compiler implementation:**

```typescript
// Simplified contextual typing logic
function getContextualType(node: Expression): Type | undefined {
  const parent = node.parent;

  if (isCallExpression(parent)) {
    // Get the parameter type from the function signature
    return getTypeOfParameterAtPosition(parent, node);
  }

  if (isArrayLiteralExpression(parent)) {
    // Get the element type from the array type
    return getArrayElementType(parent);
  }

  return undefined;
}
```

**Phase 4: Generic Type Inference**

For generic functions, TypeScript uses **type argument inference**:

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);
// TypeScript infers T = number
// Process:
// 1. Sees generic parameter T
// 2. Looks at argument: 42 (type: number literal)
// 3. Unifies T with the argument type
// 4. Widens 42 to number
// Result: T = number

const obj = identity({ name: 'John' });
// T = { name: string }
```

**Advanced: Inference from Multiple Arguments**

```typescript
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const result = merge({ x: 1 }, { y: 2 });
// T = { x: number }
// U = { y: number }
// Return type: { x: number } & { y: number }
```

**The compiler's unification algorithm:**
1. Create type variables for each generic parameter
2. For each argument, attempt to unify its type with the parameter type
3. Collect constraints on type variables
4. Solve the constraint system to determine actual types
5. If unsolvable, report an error

**Phase 5: Return Type Inference**

TypeScript infers function return types by analyzing all return statements:

```typescript
function process(x: number) {
  if (x > 0) {
    return x;        // return type: number
  }
  return 'negative'; // return type: string
}
// Inferred return type: number | string (union of all returns)
```

**Control flow analysis:**

The compiler builds a **control flow graph** to track which types are possible at each return point:

```typescript
function example(x: string | number) {
  if (typeof x === 'string') {
    return x.length; // return type: number
  }
  return x * 2;      // return type: number
}
// Both branches return number → inferred return type: number
```

**Phase 6: Type Widening vs. Narrowing**

TypeScript balances between **widening** (making types more general) and **narrowing** (making types more specific):

**Widening:**
```typescript
let x = 'hello';  // Widened to 'string'
let y = null;     // Widened to 'any' (in non-strict mode) or 'null' (strict)

// Without strictNullChecks:
let z = null;     // Type: any (widened too much!)
z = 'test';       // OK (unsafe!)

// With strictNullChecks:
let w = null;     // Type: null (good!)
// w = 'test';    // Error!
```

**Preventing excessive widening with `as const`:**

```typescript
const colors = ['red', 'green', 'blue'];
// Type: string[] (widened)

const colors2 = ['red', 'green', 'blue'] as const;
// Type: readonly ['red', 'green', 'blue'] (no widening!)

const config = {
  apiUrl: 'https://api.example.com',
  port: 3000
};
// Type: { apiUrl: string; port: number } (properties widened)

const config2 = {
  apiUrl: 'https://api.example.com',
  port: 3000
} as const;
// Type: { readonly apiUrl: 'https://api.example.com'; readonly port: 3000 }
```

**Type Guards Enable Narrowing:**

```typescript
function process(value: string | number) {
  // Type: string | number

  if (typeof value === 'string') {
    // Type narrowed to: string
    console.log(value.toUpperCase());
  } else {
    // Type narrowed to: number
    console.log(value.toFixed(2));
  }

  // Type: string | number (widened again after the if block)
}
```

**The compiler's narrowing algorithm:**
1. Recognize type guard constructs (`typeof`, `instanceof`, `in`, custom guards)
2. Create a narrowed type for the true branch
3. Create a complementary type for the false branch
4. Update the control flow graph with narrowed types

**Performance Implications:**

Type inference isn't free. For large codebases:
- **Simple literal inference**: ~0.001ms per variable
- **Array literal inference (10 elements)**: ~0.01ms
- **Complex generic inference**: ~0.1-1ms
- **Deep object literal inference**: ~1-5ms

In a 100k LOC codebase, type inference typically adds 2-5 seconds to compilation time.

**Optimization: Explicit Annotations**

Adding explicit types can speed up compilation:

```typescript
// Slower: compiler must infer complex return type
function processData(items) {
  return items.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date()
  }));
}

// Faster: explicit return type skips inference
function processData(items: Item[]): ProcessedItem[] {
  return items.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date()
  }));
}
```

For library code and public APIs, explicit types are recommended both for performance and clarity.

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Type Inference Bug in Production</strong></summary>

### Case Study: Overly Permissive Inference Causing Runtime Crashes

**Company:** SaaS Analytics Platform (React + TypeScript)
**Impact:** 250+ runtime errors/day, data integrity issues
**Team Size:** 12 frontend engineers
**Timeline:** 3-week investigation and fix

**The Problem: Type Widening Gone Wrong**

Our analytics dashboard had a critical bug where user filters were being incorrectly applied, causing data corruption and incorrect metrics displays. The issue stemmed from TypeScript's type widening behavior.

**Initial Problematic Code:**

```typescript
// dashboard/filters.ts
export const createFilter = (config) => {
  // No type annotation! TypeScript infers 'any'
  return {
    type: config.type,
    value: config.value,
    operator: config.operator
  };
};

// dashboard/FilterPanel.tsx
const userFilter = createFilter({
  type: 'date',
  value: null, // Placeholder for user input
  operator: 'equals'
});

// Later in the code:
function applyFilter(filter) {
  // TypeScript inferred 'any' for filter, no safety!
  if (filter.operator === 'equals') {
    return data.filter(item => item[filter.type] === filter.value);
  }
  // ... more logic
}

const results = applyFilter(userFilter);
// Runtime error: Can't read property 'undefined' of undefined
```

**The Runtime Failure:**

```typescript
// User selects date filter
const dateFilter = createFilter({
  type: 'createdAt',
  value: null, // User hasn't selected date yet
  operator: 'between' // Typo! Should be 'equals' or 'range'
});

// Later, when applying filter:
applyFilter(dateFilter);

// Runtime crash:
// TypeError: Cannot read property 'between' of undefined
// filter.operator 'between' not handled in switch statement
```

**Metrics Before Fix:**
- Runtime errors: 250+/day
- Affected users: ~1,200/day (8% of daily active users)
- Data integrity issues: 45 reports/week
- Support tickets: 80/week
- Customer churn: 2.3% increase over 2 months
- Revenue impact: ~$12k/month in churned subscriptions

**Root Cause Analysis:**

**1. Implicit Any Everywhere**

```bash
$ npx tsc --noImplicitAny --noEmit
# 1,247 errors!

src/dashboard/filters.ts:12:25 - error TS7006:
  Parameter 'config' implicitly has an 'any' type.

src/dashboard/FilterPanel.tsx:45:18 - error TS7006:
  Parameter 'filter' implicitly has an 'any' type.
```

**2. Type Widening on `null`**

```typescript
// Problem: TypeScript widened 'null' to 'any' in non-strict mode
const filter = {
  type: 'date',
  value: null, // Type widened to 'any'!
  operator: 'equals'
};

// TypeScript inferred:
// filter: {
//   type: string;
//   value: any;  // DANGER!
//   operator: string;
// }

// Should have been:
// filter: {
//   type: string;
//   value: null;
//   operator: string;
// }
```

**3. No Discriminated Union for Operators**

```typescript
// Operators were just strings, no type safety
type Operator = string; // Too permissive!

// Should have been:
type Operator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between' | 'contains';
```

**Debugging Process:**

**Step 1: Enable Strict TypeScript (Day 1)**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true
  }
}
```

```bash
$ npx tsc --noEmit
# 1,247 errors revealed!
```

**Step 2: Add Type Annotations (Day 2-5)**

```typescript
// ✅ FIXED: Explicit type definitions
type FilterType = 'date' | 'string' | 'number' | 'boolean';

type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

type FilterValue = string | number | Date | null;

interface Filter {
  type: FilterType;
  value: FilterValue;
  operator: FilterOperator;
}

// Now createFilter has proper typing:
export const createFilter = (config: {
  type: FilterType;
  value: FilterValue;
  operator: FilterOperator;
}): Filter => {
  return {
    type: config.type,
    value: config.value,
    operator: config.operator
  };
};
```

**Step 3: Use Discriminated Unions for Type Safety (Day 6-8)**

```typescript
// ✅ BETTER: Discriminated union for different filter types

type DateFilter = {
  type: 'date';
  value: Date | null;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'between';
};

type StringFilter = {
  type: 'string';
  value: string | null;
  operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith';
};

type NumberFilter = {
  type: 'number';
  value: number | null;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between';
};

type BooleanFilter = {
  type: 'boolean';
  value: boolean | null;
  operator: 'equals';
};

type Filter = DateFilter | StringFilter | NumberFilter | BooleanFilter;

// Now TypeScript enforces correct operator for each type!
function applyFilter(filter: Filter, data: any[]) {
  switch (filter.type) {
    case 'date':
      // TypeScript knows filter is DateFilter
      if (filter.operator === 'between') { // Only valid operators allowed!
        // Compile-time safety!
      }
      break;

    case 'string':
      // TypeScript knows filter is StringFilter
      if (filter.operator === 'contains') { // OK!
        // TypeScript prevents using 'between' here (compile error)
      }
      break;

    // ... other cases
  }
}
```

**Step 4: Add Runtime Validation (Day 9-10)**

```typescript
// Even with TypeScript, validate at runtime (data from API might be wrong)
import { z } from 'zod';

const DateFilterSchema = z.object({
  type: z.literal('date'),
  value: z.date().nullable(),
  operator: z.enum(['equals', 'greaterThan', 'lessThan', 'between'])
});

const StringFilterSchema = z.object({
  type: z.literal('string'),
  value: z.string().nullable(),
  operator: z.enum(['equals', 'notEquals', 'contains', 'startsWith', 'endsWith'])
});

const FilterSchema = z.discriminatedUnion('type', [
  DateFilterSchema,
  StringFilterSchema,
  // ... other schemas
]);

function applyFilter(rawFilter: unknown, data: any[]) {
  // Runtime validation
  const filter = FilterSchema.parse(rawFilter);

  // Now we're safe both compile-time AND runtime!
  // ...
}
```

**Step 5: Improve Type Inference with Helper Functions (Day 11-12)**

```typescript
// ✅ Type-safe factory functions with proper inference

function createDateFilter(
  value: Date | null,
  operator: DateFilter['operator']
): DateFilter {
  return { type: 'date', value, operator };
}

function createStringFilter(
  value: string | null,
  operator: StringFilter['operator']
): StringFilter {
  return { type: 'string', value, operator };
}

// Usage: TypeScript infers everything correctly!
const filter1 = createDateFilter(new Date(), 'between'); // ✅ Type: DateFilter
const filter2 = createStringFilter('test', 'contains'); // ✅ Type: StringFilter

// TypeScript catches errors:
// const filter3 = createDateFilter(new Date(), 'contains'); // ❌ Error: 'contains' not valid for DateFilter
```

**Step 6: Migration Strategy (Day 13-18)**

```typescript
// Gradual migration using branded types
type LegacyFilter = any; // Old code
type SafeFilter = Filter; // New code

// Adapter function for migration period
function toLegacyFilter(filter: SafeFilter): LegacyFilter {
  return filter as any; // Escape hatch during migration
}

function fromLegacyFilter(filter: LegacyFilter): SafeFilter {
  // Runtime validation during migration
  return FilterSchema.parse(filter);
}

// Migrate module by module:
// Week 1: FilterPanel.tsx
// Week 2: FilterService.ts
// Week 3: API integration
```

**Results After Fix:**

**Metrics After Fix (Week 4):**
- Runtime errors: 12/day (95% reduction from 250/day)
- Affected users: 0-2/day (99% reduction from 1,200/day)
- Data integrity issues: 0 reports/week (100% reduction from 45/week)
- Support tickets: 5/week (94% reduction from 80/week)
- Customer churn: Returned to baseline (-2.3% correction)
- Revenue recovered: ~$12k/month
- Compilation time: Increased by 2 seconds (from 8s to 10s) - acceptable!

**Developer Experience Improvements:**
- Autocomplete works perfectly (knows valid operators per filter type)
- Refactoring is safe (TypeScript catches all usages)
- Onboarding new developers: 40% faster (types are self-documenting)

**Long-term Governance:**

```json
// tsconfig.json (enforced via CI)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

```typescript
// .eslintrc.js
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn'
  }
};
```

**Key Lessons:**

1. **Enable strict mode from day 1** - Inference is powerful but can be too permissive
2. **Annotate public APIs explicitly** - Don't rely on inference for critical types
3. **Use discriminated unions** for state machines and conditional logic
4. **Combine compile-time types with runtime validation** (Zod, io-ts, etc.)
5. **Type widening on `null` and `undefined`** can be dangerous without strict null checks

**Financial Impact:**
- Revenue protected: $12k/month in prevented churn
- Engineering time saved: ~60 hours/month (less debugging, fewer support escalations)
- Customer satisfaction: NPS improved from 38 to 62 over 3 months

This scenario demonstrates why understanding type inference deeply matters—overly permissive inference can introduce subtle bugs that manifest at runtime despite TypeScript's static typing.

---

</details>

<details>
<summary><strong>⚖️ Trade-offs: Type Inference vs. Explicit Annotations</strong></summary>

### When to Infer, When to Annotate

TypeScript's type inference is powerful, but relying on it too much—or too little—has trade-offs. Here's a comprehensive decision framework.

**Trade-off #1: Conciseness vs. Clarity**

**Inference (Concise):**

```typescript
// Inference makes code shorter
const user = { name: 'John', age: 30 };
const numbers = [1, 2, 3, 4, 5];
const double = (x) => x * 2; // Parameter 'x' implicitly any (error in strict mode)

function fetchData() {
  return fetch('/api/data').then(res => res.json());
}
// Return type: Promise<any> - too wide!
```

**Pros:**
- Less boilerplate
- Faster to write
- Self-evident for simple cases

**Cons:**
- Can infer overly wide types (`any`, `string` instead of literal)
- Hard to understand complex inferred types
- Changes in implementation can break consumers

**Explicit Annotations (Clear):**

```typescript
// Explicit types improve readability and safety
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'John', age: 30 };
const numbers: number[] = [1, 2, 3, 4, 5];
const double = (x: number): number => x * 2;

interface ApiData {
  id: string;
  value: number;
}

async function fetchData(): Promise<ApiData> {
  const res = await fetch('/api/data');
  return res.json();
}
```

**Pros:**
- Clear contracts for functions and APIs
- Better error messages (mentions type names)
- IDE autocomplete is faster
- Changes to implementation don't break API contract

**Cons:**
- More verbose
- Duplication (type + implementation)
- Maintenance overhead (update in two places)

**Decision Guide:**
- **Use inference for**: Local variables, array literals, simple object literals
- **Use annotations for**: Function parameters, return types, public APIs, complex types

---

**Trade-off #2: Compile-Time Performance**

**Inference-Heavy Code:**

```typescript
// Complex inference is expensive
const processData = (items) =>
  items
    .map(item => ({
      ...item,
      computed: item.value * 2,
      nested: {
        ...item.nested,
        derived: item.nested.value + 1
      }
    }))
    .filter(item => item.computed > 10);

// Compiler must:
// 1. Infer 'items' parameter type (likely 'any' without annotation)
// 2. Infer intermediate map type (complex object shape)
// 3. Infer filter return type
// Cost: ~5-10ms per function in large codebases
```

**Explicit Type Code:**

```typescript
interface Item {
  value: number;
  nested: { value: number };
}

interface ProcessedItem extends Item {
  computed: number;
  nested: Item['nested'] & { derived: number };
}

const processData = (items: Item[]): ProcessedItem[] =>
  items
    .map(item => ({
      ...item,
      computed: item.value * 2,
      nested: {
        ...item.nested,
        derived: item.nested.value + 1
      }
    }))
    .filter(item => item.computed > 10);

// Compiler can skip inference, use provided types
// Cost: ~0.5-1ms per function
```

**Benchmarks (10,000 functions, similar complexity):**
- **Inference-heavy**: 15-20 seconds compilation
- **Annotation-heavy**: 8-12 seconds compilation
- **Difference**: ~40% faster with explicit types

**Decision Guide:**
- **Use inference for**: Small projects (<10k LOC), local variables
- **Use annotations for**: Large projects (>50k LOC), library code, performance-critical paths

---

**Trade-off #3: Refactoring Safety**

**Inference (Brittle):**

```typescript
// Initial implementation
function getUser() {
  return { id: 1, name: 'John' };
}

const user = getUser();
// Inferred type: { id: number; name: string; }

// Later, you refactor getUser:
function getUser() {
  return { id: 1, name: 'John', email: 'john@example.com' };
}

// PROBLEM: All consumers now see 'email' property
// This might break code that relied on the old shape
// No compile error, but behavior changes!
```

**Explicit Annotations (Robust):**

```typescript
interface User {
  id: number;
  name: string;
}

function getUser(): User {
  return { id: 1, name: 'John' };
}

const user = getUser();
// Type: User (stable contract)

// Later, you refactor:
function getUser(): User {
  return { id: 1, name: 'John', email: 'john@example.com' }; // Error!
  // Type '{ id: number; name: string; email: string; }' is not assignable to type 'User'
  // Object literal may only specify known properties
}

// Compiler catches breaking changes!
```

**Decision Guide:**
- **Use inference for**: Private functions, internal utilities
- **Use annotations for**: Public APIs, exported functions, team boundaries

---

**Trade-off #4: Error Message Quality**

**Inference Errors (Confusing):**

```typescript
const data = [
  { id: 1, value: 'a' },
  { id: 2, value: 'b' },
  { id: 3, val: 'c' } // Typo!
];

// Inferred type: ({id: number, value: string, val?: undefined} | {id: number, val: string, value?: undefined})[]

// Error message when you try to use it:
data.forEach(item => console.log(item.value.toUpperCase()));
// Error: Object is possibly 'undefined'.
// (Confusing! Which item? Why?)
```

**Explicit Type Errors (Clear):**

```typescript
interface DataItem {
  id: number;
  value: string;
}

const data: DataItem[] = [
  { id: 1, value: 'a' },
  { id: 2, value: 'b' },
  { id: 3, val: 'c' } // Error immediately!
];

// Error: Type '{ id: number; val: string; }' is not assignable to type 'DataItem'.
//   Object literal may only specify known properties, and 'val' does not exist in type 'DataItem'.
//   Did you mean to write 'value'?
```

**Decision Guide:**
- **Use annotations for**: Arrays of objects, complex data structures
- **Use inference for**: Simple primitives, well-structured data

---

**Trade-off #5: `as const` vs Explicit Literal Types**

**Using `as const` (Inference-based):**

```typescript
const routes = {
  home: '/',
  about: '/about',
  contact: '/contact'
} as const;

// Inferred type:
// {
//   readonly home: '/';
//   readonly about: '/about';
//   readonly contact: '/contact';
// }

type RouteKeys = keyof typeof routes; // 'home' | 'about' | 'contact'
type RoutePaths = typeof routes[RouteKeys]; // '/' | '/about' | '/contact'
```

**Pros:**
- Automatic literal types
- Readonly inference
- Less duplication

**Cons:**
- Can't rename properties easily
- `typeof` gymnastics needed
- Harder to extend

**Using Explicit Types:**

```typescript
type Route = '/' | '/about' | '/contact';

const routes: Record<string, Route> = {
  home: '/',
  about: '/about',
  contact: '/contact'
};

// OR with mapped types:
type RouteName = 'home' | 'about' | 'contact';
type Routes = Record<RouteName, string>;

const routes: Routes = {
  home: '/',
  about: '/about',
  contact: '/contact'
};
```

**Pros:**
- Clear, named types
- Easy to extend
- Can add JSDoc comments

**Cons:**
- More verbose
- Duplication between type and value

**Decision Guide:**
- **Use `as const` for**: Configuration objects, constant arrays, test data
- **Use explicit types for**: Extensible enums, domain models, shared types

---

**Trade-off #6: Generic Inference vs Explicit Type Arguments**

**Letting TypeScript Infer Generics:**

```typescript
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const numbers = [1, 2, 3];
const strings = mapArray(numbers, n => n.toString());
// TypeScript infers: T = number, U = string
// Result type: string[]
```

**Pros:**
- Concise
- Works automatically
- Type-safe

**Cons:**
- Can infer overly specific types
- Harder to debug when inference fails

**Providing Explicit Type Arguments:**

```typescript
const strings = mapArray<number, string>(numbers, n => n.toString());
// Explicit: T = number, U = string
```

**Pros:**
- Clear intent
- Overrides incorrect inference
- Better for complex scenarios

**Cons:**
- Verbose
- Redundant in simple cases

**Example Where Explicit Helps:**

```typescript
// Without explicit type, inference might be wrong
const result = fetch('/api/data').then(res => res.json());
// Type: Promise<any> (too wide!)

// With explicit type argument:
const result = fetch('/api/data').then<ApiResponse>(res => res.json());
// Type: Promise<ApiResponse> (correct!)

// Better: Annotate variable
const result: Promise<ApiResponse> = fetch('/api/data').then(res => res.json());
```

**Decision Guide:**
- **Let TypeScript infer generics when**: Inference is correct and obvious
- **Provide type arguments when**: Working with `any`, complex generics, or inference fails

---

**Best Practice Matrix:**

| Context | Recommendation | Example |
|---------|---------------|---------|
| Local variables | Infer | `const x = 5;` |
| Function parameters | Annotate | `(x: number)` |
| Function return types | Annotate (public APIs) | `: Promise<User>` |
| Object literals (simple) | Infer | `{ name: 'John' }` |
| Object literals (complex) | Annotate | `const user: User = { ... }` |
| Array literals | Infer | `[1, 2, 3]` |
| Generic function calls | Infer | `identity(42)` |
| Library/public APIs | Annotate everything | All types explicit |
| Internal utilities | Infer where obvious | Mix based on complexity |
| Configuration objects | `as const` | `const config = { ... } as const` |
| Enums/unions | Explicit types | `type Status = ...` |

---

**Recommended Approach (Industry Standard):**

1. **Start with inference** for new code (faster iteration)
2. **Add annotations when**:
   - Function is exported
   - Type is complex or non-obvious
   - Refactoring breaks consumers
   - Compiler errors are unclear
3. **Always annotate**:
   - Public APIs and library code
   - Function parameters and return types
   - React component props
   - API request/response types

**TypeScript Config Recommendations:**

```json
{
  "compilerOptions": {
    // Force explicit types where it matters:
    "noImplicitAny": true,           // Prevent implicit 'any'
    "strictNullChecks": true,        // Prevent null/undefined bugs
    "noImplicitReturns": true,       // Ensure all code paths return
    "noUncheckedIndexedAccess": true // Safer array/object access
  }
}
```

---

</details>

<details>
<summary><strong>💬 Explain to Junior: Type Inference Made Simple</strong></summary>

### The Auto-Complete Analogy

Think of TypeScript's type inference like your phone's autocorrect and predictive text.

**What is Type Inference?**

When you write code, TypeScript "reads your mind" and figures out what type of data you're working with, without you having to spell it out every time.

```typescript
const age = 25;
// TypeScript thinks: "25 is a number, so 'age' must be a number!"
// You didn't have to write: const age: number = 25;
```

### Real-World Example: Coffee Shop Order

Imagine you're at a coffee shop:

**WITHOUT inference (annoying!):**
```typescript
// You have to specify everything explicitly
const drink: 'coffee' = 'coffee';
const size: 'medium' = 'medium';
const price: number = 4.50;
const isHot: boolean = true;
```

**WITH inference (smart!):**
```typescript
// TypeScript figures it out from the values
const drink = 'coffee';     // TypeScript knows: string
const size = 'medium';      // TypeScript knows: string
const price = 4.50;         // TypeScript knows: number
const isHot = true;         // TypeScript knows: boolean
```

### How TypeScript Infers Types

**Rule #1: Look at the value**

```typescript
let name = 'Alice';
// TypeScript sees 'Alice' (a string) → type is 'string'

let count = 10;
// TypeScript sees 10 (a number) → type is 'number'

let active = true;
// TypeScript sees true (a boolean) → type is 'boolean'
```

**Rule #2: Look at arrays**

```typescript
const numbers = [1, 2, 3];
// TypeScript sees: all elements are numbers → type is 'number[]'

const mixed = [1, 'two', 3];
// TypeScript sees: some numbers, some strings → type is '(number | string)[]'
```

**Rule #3: Look at functions**

```typescript
function add(a: number, b: number) {
  return a + b;
}
// TypeScript sees: a + b returns a number → return type is 'number'

function greet(name: string) {
  return `Hello, ${name}`;
}
// TypeScript sees: string template → return type is 'string'
```

**Rule #4: Context matters (smart inference!)**

```typescript
// TypeScript knows the type from context
window.addEventListener('click', (event) => {
  // You didn't type 'event', but TypeScript knows:
  // "addEventListener for 'click' receives a MouseEvent"
  console.log(event.clientX); // Works! TypeScript knows about clientX
});

[1, 2, 3].map((num) => {
  // TypeScript knows 'num' is a number because the array is number[]
  return num * 2;
});
```

### Common Mistakes Beginners Make

**Mistake #1: Forgetting to initialize**

```typescript
let value;
// TypeScript doesn't know what type!
// Type: any (unsafe!)

value = 5;
value = 'text'; // No error, but dangerous!

// Fix: Initialize immediately
let value = 5; // Type: number ✓
// value = 'text'; // Error! ✓
```

**Mistake #2: Expecting narrow types**

```typescript
const status = 'pending';
// Type: string (not 'pending'!)

// Why? TypeScript thinks you might change it later:
// status = 'approved'; // Would be allowed

// Fix: Use 'as const' for literal types
const status = 'pending' as const;
// Type: 'pending' (exact literal!) ✓
```

**Mistake #3: Ignoring function return types**

```typescript
function getData() {
  return fetch('/api/data').then(res => res.json());
}
// Return type: Promise<any> (unsafe!)

const data = getData();
// data.anyTypo; // No error! TypeScript doesn't know what's inside

// Fix: Annotate return type
interface ApiData {
  id: string;
  value: number;
}

function getData(): Promise<ApiData> {
  return fetch('/api/data').then(res => res.json());
}
// Now TypeScript knows what getData returns! ✓
```

### When to Let TypeScript Infer vs When to Spell It Out

**Let TypeScript infer (good for):**

```typescript
// 1. Simple variables
const userName = 'Alice';
const userAge = 30;

// 2. Array literals
const numbers = [1, 2, 3];

// 3. Object literals (simple)
const user = { name: 'Alice', age: 30 };
```

**Spell it out explicitly (better for):**

```typescript
// 1. Function parameters (always!)
function greet(name: string) {
  //           ^^^^^^^ Always type parameters!
  return `Hello, ${name}`;
}

// 2. Function return types (public APIs)
function fetchUser(): Promise<User> {
  //                ^^^^^^^^^^^^^^^^ Explicit return type
  return fetch('/api/user').then(res => res.json());
}

// 3. Complex objects
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'Alice',
  email: 'alice@example.com'
};
```

### Interview Answer Template

**Question:** "What is type inference in TypeScript?"

**Perfect Answer:**

"Type inference is TypeScript's ability to automatically figure out types without explicit annotations. When you write `const x = 5`, TypeScript infers `x` is a `number`.

TypeScript infers types in several ways:
1. **From values** - `const name = 'Alice'` infers type `string`
2. **From context** - In `arr.map(item => ...)`, TypeScript knows `item`'s type from the array
3. **From function returns** - `function add(a: number, b: number) { return a + b }` infers return type `number`

**Benefits**: Less boilerplate, faster coding, still type-safe.

**When I use it**: Local variables, simple objects, array literals.

**When I don't**: Function parameters (always annotate), public APIs (explicit types for clarity), complex types (better error messages).

Example:
```typescript
// Good use of inference
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

// Better with annotation
function getUsers(): User[] {
  return fetch('/api/users').then(res => res.json());
}
```

Type inference makes TypeScript feel lightweight while keeping safety."

**Follow-up Handling:**

*"What's the difference between inference and 'any'?"*
"Inference deduces specific types like `string` or `number`. `any` means 'I don't know the type, allow anything' - it's unsafe. Inference maintains type safety, `any` disables it."

*"When should you explicitly annotate types?"*
"Always for function parameters and return types, especially in public APIs. Also when the inferred type is too wide (like `any`) or when you want to enforce a contract that won't change if implementation changes."

### Visual Mental Model

```
WITHOUT INFERENCE (Tedious):
You: "This is a number. This is a string. This is a boolean..."
TypeScript: "Okay, I'll remember that."

WITH INFERENCE (Smart):
You: "x = 5"
TypeScript: "I see 5 is a number, so x is a number!"

WITH CONTEXTUAL INFERENCE (Genius):
You: "addEventListener('click', event => ...)"
TypeScript: "I know 'click' events are MouseEvents, so 'event' is MouseEvent!"
```

### Quick Decision Flowchart

```
Is it a local variable with obvious value?
├─ YES → Let TypeScript infer (const x = 5)
└─ NO → Continue

Is it a function parameter?
├─ YES → ALWAYS annotate (name: string)
└─ NO → Continue

Is it a public API or exported function?
├─ YES → Annotate return type ((): User => ...)
└─ NO → Let TypeScript infer (if simple)

Is the inferred type too wide (any, string vs 'pending')?
├─ YES → Annotate explicitly or use 'as const'
└─ NO → Inference is fine!
```

### Memory Tricks

**"TypeScript is a detective"**
- Give it clues (values), it solves the mystery (type)
- Sometimes you need to tell it the answer (explicit annotation)
- Context clues help (event handlers, array methods)

**When in doubt:**
- Simple variables → Infer
- Functions → Annotate
- Public APIs → Always annotate

</details>

---


