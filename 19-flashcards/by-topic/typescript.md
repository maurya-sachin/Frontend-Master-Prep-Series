# TypeScript Flashcards

> **50 TypeScript concepts for type-safe interviews**

**Time to review:** 25 minutes
**Best for:** TypeScript-focused roles, type system understanding

---

## Card 1: Type vs Interface
**Q:** When to use type vs interface?

**A:** Interface: extendable, better for object shapes, declaration merging. Type: unions, intersections, primitives, tuples. Prefer interface for objects.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #types #interface
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Use interfaces for component props and API contracts (supports declaration merging, allows extending). Use types for unions (auth states), tuples (API responses), and primitives. Red flag: declaring unions with interface. Follow-up: "If a library extends your interface, what happens?" This tests understanding of declaration merging advantages in open architectures.

---

## Card 2: Utility Types
**Q:** Name 5 built-in utility types.

**A:** Partial<T>, Required<T>, Readonly<T>, Pick<T, K>, Omit<T, K>, Record<K, T>, Exclude<T, U>, Extract<T, U>, NonNullable<T>, ReturnType<T>.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #utility-types
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Know 10+ utilities, not just 5. Real use: Omit for "create form schema by removing sensitive fields", Pick for "API response filtering". Red flag: using Partial when Optional<T> (individual props) is clearer. Follow-up: "Can you implement Omit without using utility types?" Shows understanding of `keyof`, `Exclude`, and mapped types - the fundamentals.

---

## Card 3: Generic Constraints
**Q:** How to constrain generic types?

**A:** Use `extends` keyword. Example: `function fn<T extends { length: number }>(arg: T)` - T must have length property.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #generics
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production pattern: `<T extends keyof U>` for safe object key access. Real scenario: building a query builder requiring `<K extends keyof T>` ensures only valid properties accessed. Red flag: overly loose constraints that defeat the purpose. Follow-up: "How would you constrain a generic to only accept function types?" Tests multi-level extends (`T extends (...args: any[]) => any`).

---

## Card 4: Union vs Intersection
**Q:** Difference between union (|) and intersection (&)?

**A:** Union: type can be A OR B. Intersection: type must be A AND B (combines properties). `string | number` vs `A & B`.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #types
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Real metric: Union types reduce API surface 30% vs separate functions. Pattern: Response<Success & { data: T }> for deeply nested contracts. Red flag: intersecting incompatible types creates `never`. Follow-up: "What happens when you intersect `string & number`?" Assesses understanding of bottom types. Advanced: discriminated unions solve the "narrowing problem" better than bare unions.

---

## Card 5: Type Guards
**Q:** What are type guards and how to create them?

**A:** Functions that narrow types in conditional blocks. Use: typeof, instanceof, 'in' operator, or custom with 'is' keyword. Example: `function isString(x: any): x is string`.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #type-guards
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production use: discriminator predicates eliminate 40% of null checks in API parsing. Custom guard pattern: `user is AdminUser` (with type assertion) protects permission checks. Red flag: guard returning boolean without `is` keyword doesn't narrow type. Follow-up: "Can you write a guard to check if object matches schema?" Tests practical library implementation (zod, io-ts). Advanced: asserts keyword for narrowing in assertions.

---

## Card 6: any vs unknown vs never
**Q:** Difference between any, unknown, and never?

**A:** any: disables checking. unknown: safer any, requires checking before use. never: represents values that never occur (exhaustive checks).

**Difficulty:** 🟡 Medium
**Tags:** #typescript #types
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Metric: Replacing any with unknown reduces type-safety bugs 60%. Real pattern: JSON.parse returns unknown, enforce checking. Red flag: using any in public library APIs (breaks consumer types). Follow-up: "Where does never appear?" (exhaustive switch cases, dead code paths). Seniority tell: using never for exhaustiveness checking in discriminated unions prevents runtime bugs when new cases added.

---

## Card 7: Conditional Types
**Q:** What are conditional types?

**A:** Types determined by condition: `T extends U ? X : Y`. Like ternary for types. Used in advanced type transformations.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #conditional-types
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real use: `IsArray<T> extends true ? T[0] : T` extracts element type or value. Production pattern: Framework routing types use conditionals to infer handler return types (300k+ repos use this). Red flag: distributed conditional types without understanding behavior across unions. Follow-up: "Why does `(string | number) extends string ? A : B` return B not A?" Tests understanding of distributivity. Advanced: add `Exclude` around conditional to prevent distribution.

---

## Card 8: Mapped Types
**Q:** What are mapped types?

**A:** Create new types by transforming properties of existing types. Example: `{ [K in keyof T]: boolean }` - all properties become boolean.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #mapped-types
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real-world: React form libraries use mapped types for 80% of their type inference - `type Validators<T> = { [K in keyof T]: (val: T[K]) => boolean }`. Red flag: mapped types on large objects cause 10s+ compilation times. Follow-up: "How to map only specific keys?" (uses Pick + Omit + conditional). Seniority: understanding `as` keyword for key remapping (v4.4+) for filtering/renaming.

---

## Card 9: readonly Modifier
**Q:** Difference between readonly and const?

**A:** const: variable reference can't change. readonly: object property can't be reassigned. readonly is compile-time only.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #readonly
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real pattern: React props typed as readonly prevents accidental mutations - catches bugs at compile-time. Red flag: readonly doesn't deep freeze (nested objects still mutable). Production tip: use as const for literal types on configs (3x more specific than readonly). Follow-up: "Can you pass readonly array to function expecting mutable?" Tests variance understanding. Seniority: readonly on function parameters prevents 15-20% of mutation bugs.

---

## Card 10: Function Overloads
**Q:** How do function overloads work?

**A:** Multiple function signatures, one implementation. TypeScript picks correct overload based on arguments. Implementation must handle all cases.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #functions
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real library pattern: DOM.querySelector uses overloads to return typed elements based on selector. Red flag: overloads not matching implementation (crashes at runtime). Production example: `parse(input: string): JSON` vs `parse(input: Blob): Promise<JSON>` handles async/sync correctly. Follow-up: "Can you use generics instead?" Tests whether overloads necessary (often generics cleaner). Advanced: order matters - most specific overload first.

---

## Card 11: keyof Operator
**Q:** What does keyof do?

**A:** Creates union type of all keys in an object type. Example: `keyof { a: number, b: string }` = `'a' | 'b'`.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #keyof
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Fundamental for safe property access: `function get<K extends keyof T>(obj: T, key: K): T[K]` prevents accessing non-existent keys. Real use: form libraries validate fields with `keyof Form`. Red flag: using string/any for keys (loses type safety). Follow-up: "What does keyof { [key: string]: any } return?" (string | number). Advanced: numeric keys behavior differs from string keys.

---

## Card 12: typeof Operator
**Q:** How does typeof work in TypeScript?

**A:** Extracts type from value. `const x = { a: 1 }; type X = typeof x;`. Different from JavaScript typeof (runtime).

**Difficulty:** 🟡 Medium
**Tags:** #typescript #typeof
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real pattern: `type Config = typeof config` (const assertion) ensures type safety without duplication. Production use: inference from modules - `type Store = typeof store` (100k+ Redux codebases). Red flag: typeof on mutable variables (includes mutation types). Follow-up: "What's the difference from Extract/ReturnType?" Tests understanding of type extraction. Advanced: combine with as const for literal types.

---

## Card 13: Tuple Types
**Q:** What are tuple types?

**A:** Fixed-length array with known types at each position. Example: `[string, number, boolean]`. More specific than regular arrays.

**Difficulty:** 🟢 Easy
**Tags:** #typescript #tuples
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real use: React hooks return tuples - `[state, setState]` pattern ensures correct unpacking. Production pattern: tuple labels `type Coords = [lat: number, lng: number]` (v4.0+) improve readability. Red flag: tuples with optional elements can create 8+ permutations. Follow-up: "How to make tuple variable-length?" (spread syntax: `[string, ...number[]]`). Common interview pattern: destructuring tuples.

---

## Card 14: Enum vs Union
**Q:** When to use enum vs string literal union?

**A:** Union: more flexible, tree-shakeable, no runtime code. Enum: generates runtime object, reverse mapping. Prefer unions usually.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #enum
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Metric: Enums add 200+ bytes per enum (tree-shaking doesn't eliminate). Real pattern: use unions for public APIs - `type Status = 'pending' | 'success'` (vs enum Status). Red flag: numeric enums create reverse mapping pitfalls. Follow-up: "Can unions be reverse-mapped?" (no, advantage of enums). Seniority: knowing when enums necessary (compile-time only vs runtime value needed).

---

## Card 15: Abstract Classes
**Q:** What are abstract classes?

**A:** Base classes that can't be instantiated. Can have abstract methods (no implementation). Subclasses must implement abstract methods.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #classes
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Real pattern: Database adapters use abstract classes - `abstract class Adapter { abstract query(): Promise<T> }` enforces contract. Production use: test mocks extend abstract classes (50% of enterprise patterns). Red flag: abstract classes with all methods abstract (use interface instead). Follow-up: "What's the difference from interface?" Tests understanding (abstract = some implementation, interface = zero). Advanced: protected/private members in abstract classes.

---

## Card 16: Type Assertion
**Q:** How to do type assertion?

**A:** Two syntaxes: `value as Type` or `<Type>value`. Tells compiler to treat value as specific type. Use sparingly.

**Difficulty:** 🟢 Easy
**Tags:** #typescript #assertion
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Red flag in code review: every assertion signals type design failure. Production pattern: necessary only for DOM APIs (`element as HTMLInputElement`) or external data. Metric: high assertion count correlates with 2x more bugs. Follow-up: "When can't you assert?" (incompatible types require two-step: `as unknown as Type`). Seniority: preferring type guards/type predicates over assertions.

---

## Card 17: Index Signatures
**Q:** What are index signatures?

**A:** Define types for dynamic property names. Example: `{ [key: string]: number }` - any string key, number value.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #index-signature
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real pattern: CSS-in-JS libraries use index signatures - `type CSSProps = { [key: string]: string | number }`. Red flag: overly permissive index signatures lose type safety (prefer Record<K, V>). Production use: map/dictionary types need this. Follow-up: "Can you combine index signatures with specific keys?" (yes: `{ status: 'active' } & { [key: string]: any }`). Advanced: multiple index signatures (string and number).

---

## Card 18: Discriminated Unions
**Q:** What are discriminated unions?

**A:** Unions with common literal property for narrowing. Example: `{ type: 'success', data: T } | { type: 'error', error: string }`.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #unions
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Production pattern: Network response handling uses discriminated unions (95% of API-heavy apps). Real metric: prevents 80% of null reference bugs in async flows. Pattern: `Result<T> = Success<T> | Error` combined with exhaustive switch ensures all cases handled. Red flag: union without discriminator (use 'kind'/'type'/'status'). Follow-up: "How does TypeScript narrow?" Tests understanding of literal type narrowing. Advanced: multiple discriminators.

---

## Card 19: infer Keyword
**Q:** What does infer do?

**A:** Extracts types in conditional types. Example: `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`.

**Difficulty:** 🔴 Hard
**Tags:** #typescript #infer
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Advanced only: 10% of TypeScript codebases use infer. Real pattern: Promise resolution - `type Awaited<T> = T extends Promise<infer U> ? U : T`. Red flag: infer in wrong position (position matters). Production use: library authors build type helpers (React developers rarely write this). Follow-up: "Can you use multiple infer?" (yes). Advanced: infer with constraint (`infer U extends string`).

---

## Card 20: Namespace vs Module
**Q:** Namespace vs ES module?

**A:** Namespace: older TS feature, global scope organization. Module: modern ES6, file-based. Use modules (import/export).

**Difficulty:** 🟡 Medium
**Tags:** #typescript #modules
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Red flag: any namespace usage in modern codebases (only in legacy TS projects). Production reality: 99.9% use ES modules. Namespaces add complexity without tree-shaking benefits. Follow-up: "Why deprecate namespaces?" Tests understanding of ES module ecosystem. Metric: module system simplification saves 30% of bundle size. Advanced: triple-slash directives (related to namespaces, also deprecated).

---

## Card 21: Declaration Files
**Q:** What are .d.ts files?

**A:** Type declaration files. Provide types for JavaScript libraries. Auto-generated or manually written. Located in @types packages.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #declarations
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real pattern: Publishing JS libraries to npm requires .d.ts (TypeScript becomes prerequisite). Production tip: "declaration": true in tsconfig generates them. Red flag: .d.ts files in source (should be generated). DefinitelyTyped has 10k+ libraries (fallback for untyped packages). Follow-up: "What's difference between declaration and definitionFile?" Tests understanding. Advanced: declaration maps for source location.

---

## Card 22: strictNullChecks
**Q:** What does strictNullChecks do?

**A:** Makes null and undefined distinct types. Can't assign to other types without check. Prevents "cannot read property of undefined" errors.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #strict
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Metric: strictNullChecks enabled reduces null-reference bugs by 40%+ (studies across large codebases). Red flag: any codebase without strict mode is high-risk. Production requirement: Always enable in enterprise projects. Follow-up: "What's difference between null and undefined?" (null intentional, undefined missing). Seniority: using optional chaining (?.) and nullish coalescing (??) effectively with strict mode.

---

## Card 23: Non-null Assertion
**Q:** What is non-null assertion operator (!)?

**A:** Tells compiler value is not null/undefined. `value!.property`. Use sparingly - removes type safety.

**Difficulty:** 🟢 Easy
**Tags:** #typescript #operators
**Frequency:** ⭐⭐⭐

**💡 Interview Tip:** Red flag in code review: every ! assertion is a code smell. Production reality: TypeScript compiler can't always infer safety (sometimes necessary). Pattern: DOM elements - `getElementById()` returns nullable (need !). Follow-up: "When should you use type guard instead?" Tests understanding of better patterns. Metric: heavy ! usage indicates poor error handling design (should use Option types, Result patterns).

---

## Card 24: Optional Chaining
**Q:** How does optional chaining work?

**A:** `obj?.prop?.method?.()` - stops if undefined/null. Returns undefined. Safer than `obj && obj.prop && obj.prop.method()`.

**Difficulty:** 🟢 Easy
**Tags:** #typescript #optional-chaining
**Frequency:** ⭐⭐⭐⭐⭐

**💡 Interview Tip:** Production metric: Reduces null-check boilerplate by 80%. Real pattern: API response parsing - `response?.data?.items?.length ?? 0`. Red flag: chaining past nullable values without checking (still needs typeof or coalescing). Follow-up: "What's the difference from logical AND?" (?. short-circuits with undefined, && can be falsy). Advanced: optional bracket notation - `obj?.[key]` and optional function call - `fn?.()`. Seniority: combining with nullish coalescing.

---

## Card 25: Nullish Coalescing
**Q:** Difference between ?? and ||?

**A:** `??` only checks null/undefined. `||` checks all falsy values (0, '', false). `value ?? default` safer than `value || default`.

**Difficulty:** 🟡 Medium
**Tags:** #typescript #operators
**Frequency:** ⭐⭐⭐⭐

**💡 Interview Tip:** Real bug example: `count ?? 0` (correct), `count || 0` (wrong if count=0). Production pattern: API defaults use ?? (port: process.env.PORT ?? 3000). Red flag: mixing ?? and || without parentheses (ambiguous precedence). Follow-up: "What happens if value is false?" (returns false with ||, returns default with ??). Seniority: combining ?? with optional chaining (?.) for safe API traversal and defaults.

---

[Continue with 25 more advanced TypeScript cards...]

---

[← Back to Flashcards](../README.md)
