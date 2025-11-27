# TypeScript Compiler Configuration

## Question 1: How does the TypeScript compiler work and what is tsconfig.json?

**Answer:**

The TypeScript compiler (`tsc`) is a source-to-source compiler that transforms TypeScript code into JavaScript. The compilation process involves multiple phases: parsing, type checking, transformation, and emission. The `tsconfig.json` file is the central configuration file that controls how the TypeScript compiler behaves, specifying which files to compile, what JavaScript version to target, module system to use, and hundreds of other compilation options.

**Core Compilation Phases:**

1. **Parsing**: Source code → Abstract Syntax Tree (AST)
2. **Binding**: Creates symbol tables, resolves imports/exports
3. **Type Checking**: Validates types against declarations
4. **Transformation**: Applies code transformations (down-leveling, JSX, decorators)
5. **Emission**: Generates JavaScript files, declaration files, source maps

**tsconfig.json Structure:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

**Key Configuration Sections:**

- **compilerOptions**: Controls compiler behavior
- **include**: Specifies files to compile (glob patterns)
- **exclude**: Files to ignore (node_modules by default)
- **extends**: Inherit from base config
- **files**: Explicit list of files (alternative to include)
- **references**: Project references for monorepos

**Common Compilation Workflows:**

```bash
# Compile once
tsc

# Watch mode (recompile on changes)
tsc --watch

# Specific file (ignores tsconfig.json)
tsc file.ts

# Check types without emitting files
tsc --noEmit

# Show config after inheritance
tsc --showConfig
```

---

<details>
<summary><strong>🔍 Deep Dive: Compiler Architecture and Type System</strong></summary>

The TypeScript compiler is architected as a modular system with clear separation between parsing, type checking, and code generation. Understanding these internals helps optimize build times and troubleshoot compilation issues.

**1. Parsing and AST Generation**

The compiler uses a hand-written recursive descent parser that converts source text into an Abstract Syntax Tree (AST):

```typescript
// Source code
const add = (a: number, b: number): number => a + b;

// Simplified AST representation
{
  kind: SyntaxKind.VariableStatement,
  declarationList: {
    declarations: [{
      name: { text: "add" },
      type: {
        kind: SyntaxKind.FunctionType,
        parameters: [
          { name: "a", type: { kind: SyntaxKind.NumberKeyword } },
          { name: "b", type: { kind: SyntaxKind.NumberKeyword } }
        ],
        returnType: { kind: SyntaxKind.NumberKeyword }
      }
    }]
  }
}
```

**2. Binding and Symbol Resolution**

The binder creates a symbol table that maps names to their declarations across different scopes:

```typescript
// Example: Module resolution
import { User } from './models/User';

// Binder resolves:
// 1. Current file path: /src/services/auth.ts
// 2. Relative import: ./models/User
// 3. Resolved path: /src/services/models/User.ts
// 4. Creates symbol: User -> Declaration in User.ts
```

The binder handles:
- Scope chains (block, function, module, global)
- Import/export resolution
- Declaration merging (interfaces, namespaces)
- Type aliases and generic instantiation

**3. Type Checking Engine**

TypeScript uses structural typing (duck typing) rather than nominal typing:

```typescript
interface Point {
  x: number;
  y: number;
}

interface Vector {
  x: number;
  y: number;
}

// These are compatible (same structure)
const point: Point = { x: 1, y: 2 };
const vector: Vector = point; // ✅ Works (structural compatibility)

// Type checking algorithm:
// 1. For each property in target type (Vector)
// 2. Check if source type (Point) has compatible property
// 3. Recurse for nested objects
// 4. Allow excess properties in source
```

**Type Inference and Control Flow Analysis:**

```typescript
function processValue(x: string | number) {
  // Control flow narrows type
  if (typeof x === 'string') {
    // x is string here
    return x.toUpperCase();
  }
  // x is number here
  return x.toFixed(2);
}

// Compiler tracks:
// - Initial type: string | number
// - After typeof check: string (narrowed)
// - In else branch: number (narrowed)
```

**4. Transformation Pipeline**

Transformers convert modern TypeScript/JavaScript to target version:

```typescript
// Input (ES2020 + TypeScript)
class User {
  constructor(public name: string) {}

  greet = () => {
    console.log(`Hello, ${this.name}`);
  }
}

// Output (ES5 target)
var User = /** @class */ (function () {
  function User(name) {
    var _this = this;
    this.name = name;
    this.greet = function () {
      console.log("Hello, " + _this.name);
    };
  }
  return User;
}());
```

**Built-in Transformers:**
- TypeScript features (types, enums, namespaces)
- JSX/TSX → createElement calls
- Decorators → metadata reflection
- Async/await → generator functions (ES5 target)
- ES modules → CommonJS/AMD/UMD
- Class fields → constructor assignments

**5. Declaration File Generation**

Declaration files (`.d.ts`) contain type information without implementation:

```typescript
// source.ts
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// Generated: source.d.ts
export declare class Calculator {
  add(a: number, b: number): number;
}
```

**6. Incremental Compilation**

TypeScript stores build information to avoid recompiling unchanged files:

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

The `.tsbuildinfo` file contains:
- File hashes (detect changes)
- Dependency graph
- Type information cache
- Emit signatures

**Performance Impact:**
- First build: 8.2s
- Incremental rebuild (1 file changed): 0.3s
- Incremental rebuild (no changes): 0.1s

**7. Module Resolution Strategies**

TypeScript supports multiple resolution strategies:

```json
{
  "compilerOptions": {
    "moduleResolution": "node" // or "classic", "node16", "bundler"
  }
}
```

**Node Resolution (most common):**
```typescript
import { User } from './user';

// Resolution order:
// 1. ./user.ts
// 2. ./user.tsx
// 3. ./user.d.ts
// 4. ./user/package.json (check "types" field)
// 5. ./user/index.ts
// 6. ./user/index.d.ts

import axios from 'axios';
// Node modules resolution:
// 1. node_modules/axios/package.json ("types" field)
// 2. node_modules/axios/index.d.ts
// 3. node_modules/@types/axios/index.d.ts
```

**8. Type Acquisition for JavaScript**

TypeScript automatically downloads type definitions for JavaScript libraries:

```json
{
  "typeAcquisition": {
    "enable": true,
    "include": ["jest"],
    "exclude": ["jquery"]
  }
}
```

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Build Time Explosion in Microservices Monorepo</strong></summary>

**Context:**
A fintech company's TypeScript monorepo with 50+ microservices experienced catastrophic build times after adding shared libraries. CI/CD pipelines went from 4 minutes to 35 minutes, blocking deployments.

**Initial Metrics (Before Optimization):**
```
Total compilation time: 2,145 seconds (35.75 minutes)
Files compiled: 8,234 TypeScript files
Type checking time: 1,890 seconds (88% of total)
Incremental builds: Not working (full recompile every time)
Memory usage: 4.2GB peak
```

**Problem Investigation:**

**Issue #1: Circular Dependencies Breaking Incremental Compilation**

```typescript
// services/auth/src/index.ts
export { UserService } from './user-service';

// services/auth/src/user-service.ts
import { LoggerService } from '@company/logger';

// packages/logger/src/index.ts
import { UserService } from '@company/auth'; // ❌ Circular dependency

// Detection command:
// madge --circular --extensions ts ./
```

**Issue #2: Misconfigured Project References**

```json
// ❌ BEFORE: Root tsconfig.json
{
  "compilerOptions": {
    "composite": false, // Missing!
    "declaration": false // Missing!
  },
  "include": ["packages/**/*", "services/**/*"] // Compiling everything
}
```

**Issue #3: No Build Info Caching**

```json
// Each package lacked:
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

**Issue #4: Inefficient Type Checking**

```typescript
// packages/types/src/api-responses.ts (2,400 lines)
// Every service imported entire file:
import { UserResponse, ProductResponse, OrderResponse } from '@company/types';

// Compiler checked all 2,400 lines for each import
```

**Solution Implementation:**

**Step 1: Enable Project References (Composite Projects)**

```json
// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/logger" },
    { "path": "./packages/types" },
    { "path": "./services/auth" },
    { "path": "./services/payments" }
  ]
}

// packages/logger/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// services/auth/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../../packages/logger" },
    { "path": "../../packages/types" }
  ]
}
```

**Step 2: Enable Incremental Compilation**

```json
// tsconfig.base.json (shared config)
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",
    "skipLibCheck": true, // Skip node_modules type checking
    "skipDefaultLibCheck": true
  }
}
```

**Step 3: Fix Circular Dependencies**

```typescript
// ✅ AFTER: Introduce dependency injection
// packages/logger/src/index.ts
export class LoggerService {
  // Don't import UserService
  logUserAction(userId: string, action: string) {
    console.log(`User ${userId}: ${action}`);
  }
}

// services/auth/src/user-service.ts
import { LoggerService } from '@company/logger';

export class UserService {
  constructor(private logger: LoggerService) {}

  async createUser(data: UserData) {
    this.logger.logUserAction(data.id, 'created');
  }
}
```

**Step 4: Optimize Type Imports**

```typescript
// ❌ BEFORE: Import entire module
import { UserResponse } from '@company/types';

// ✅ AFTER: Split types into focused modules
import type { UserResponse } from '@company/types/user';
import type { ProductResponse } from '@company/types/product';

// packages/types/package.json
{
  "exports": {
    "./user": "./dist/user.d.ts",
    "./product": "./dist/product.d.ts"
  }
}
```

**Step 5: Build Script Optimization**

```json
// package.json
{
  "scripts": {
    "build": "tsc --build --verbose",
    "build:clean": "tsc --build --clean && tsc --build",
    "build:watch": "tsc --build --watch"
  }
}
```

**Results After Optimization:**

```
Total compilation time: 287 seconds (4.78 minutes) - 87% improvement
Files compiled: 8,234 (same)
Type checking time: 195 seconds (68% of total)
Incremental builds: Working (changed file rebuild: 8-15s)
Memory usage: 1.8GB peak (57% reduction)

Incremental Build Performance:
- Change in 1 service: 12s (was 35 minutes)
- Change in shared package: 45s (affects dependent services)
- No changes (verification): 3s
```

**Additional Optimizations:**

```json
{
  "compilerOptions": {
    // Don't check external types
    "skipLibCheck": true,

    // Faster module resolution
    "moduleResolution": "bundler",

    // Disable unused features
    "noEmit": true, // In packages only consumed by other TS projects

    // Parallel type checking (with fork-ts-checker-webpack-plugin)
    "incremental": true
  }
}
```

**CI/CD Pipeline Changes:**

```yaml
# .github/workflows/ci.yml
- name: Restore TypeScript build cache
  uses: actions/cache@v3
  with:
    path: |
      **/.tsbuildinfo
      **/dist
    key: ${{ runner.os }}-tsc-${{ hashFiles('**/tsconfig.json') }}

- name: Build with project references
  run: npm run build # Uses tsc --build
```

**Key Lessons:**
1. Project references are essential for monorepos (87% build time reduction)
2. Incremental compilation requires proper configuration (composite: true)
3. Circular dependencies completely break incremental builds
4. `skipLibCheck: true` saves significant time (30-40% in large projects)
5. Build info caching in CI/CD prevents redundant work

</details>

<details>
<summary><strong>⚖️ Trade-offs: TypeScript Compiler Configuration Decisions</strong></summary>

**1. Strict Mode vs. Gradual Migration**

| Aspect | `strict: true` | `strict: false` + Individual Flags |
|--------|----------------|-----------------------------------|
| **Type Safety** | Maximum (all strict checks enabled) | Incremental (enable one at a time) |
| **Migration Effort** | High (fix all errors immediately) | Low (gradual adoption) |
| **Code Quality** | Prevents most type-related bugs | Partial protection |
| **Developer Experience** | Stricter, more errors initially | Gentler learning curve |
| **Performance** | Slightly slower (more checks) | Faster (fewer checks) |

```json
// ❌ All-or-nothing approach
{
  "compilerOptions": {
    "strict": true // Enables: strictNullChecks, strictFunctionTypes, etc.
  }
}

// ✅ Gradual migration approach
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true, // Week 1
    "strictNullChecks": true, // Week 3
    "strictFunctionTypes": true, // Week 5
    "strictBindCallApply": true // Week 7
  }
}
```

**Example Impact:**

```typescript
// With strict: false
function getUser(id) { // ❌ 'id' implicitly has 'any' type (ignored)
  return users.find(u => u.id === id);
}
const user = getUser(undefined); // ❌ Runtime error (not caught)

// With strict: true
function getUser(id: string): User | undefined { // ✅ Must specify types
  return users.find(u => u.id === id);
}
const user = getUser(undefined); // ✅ Compile error: undefined not assignable to string
```

**Recommendation:**
- **New projects**: `strict: true` from day one
- **Migration projects**: Start with `noImplicitAny`, add flags progressively
- **Large teams**: Use `strict: true` with `@ts-expect-error` for legacy code

**2. Target Version: ES5 vs. ES2020+**

| Aspect | ES5 | ES2020+ |
|--------|-----|---------|
| **Browser Support** | IE11+ (legacy support) | Modern browsers only |
| **Bundle Size** | Larger (polyfills needed) | Smaller (native features) |
| **Performance** | Slower (transpiled features) | Faster (native execution) |
| **Debugging** | Harder (transpiled code) | Easier (close to source) |
| **Build Time** | Slower (more transformations) | Faster (fewer transformations) |

```json
// ES5 target (legacy support)
{
  "compilerOptions": {
    "target": "ES5",
    "lib": ["ES2020", "DOM"] // Use modern types, transpile to ES5
  }
}

// Modern target (recommended)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
```

**Example Transformation:**

```typescript
// Source code
const greet = (name: string) => `Hello, ${name}`;
class User {
  constructor(public name: string) {}
}

// Compiled to ES5 (verbose)
var greet = function (name) { return "Hello, " + name; };
var User = /** @class */ (function () {
  function User(name) {
    this.name = name;
  }
  return User;
}());

// Compiled to ES2020 (minimal change)
const greet = (name) => `Hello, ${name}`;
class User {
  constructor(name) {
    this.name = name;
  }
}
```

**Bundle Size Impact:**
- ES5 target: 245KB (with class transform, arrow function transform)
- ES2020 target: 178KB (27% smaller)

**3. Module System: CommonJS vs. ESM**

| Aspect | CommonJS | ES Modules |
|--------|----------|------------|
| **Node.js Support** | Native (all versions) | Native (Node 12+) |
| **Tree Shaking** | Limited | Excellent |
| **Import Style** | `require()` (synchronous) | `import` (static analysis) |
| **Interoperability** | Easy with `esModuleInterop` | Requires package.json "type": "module" |
| **Bundle Optimization** | Difficult | Easy (Webpack, Rollup) |

```json
// CommonJS (Node.js libraries)
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true // Allow default imports from CJS modules
  }
}

// ES Modules (modern bundlers, browser)
{
  "compilerOptions": {
    "module": "ES2020",
    "moduleResolution": "bundler"
  }
}
```

**Example:**

```typescript
// Source code
import express from 'express';
export const app = express();

// CommonJS output
const express_1 = require("express");
exports.app = (0, express_1.default)();

// ES Module output
import express from 'express';
export const app = express();
```

**4. Declaration Files: Generate vs. Skip**

| Aspect | `declaration: true` | `declaration: false` |
|--------|---------------------|----------------------|
| **Use Case** | Libraries, shared packages | Applications (end products) |
| **Type Safety** | Consumers get type checking | No types for importers |
| **Build Time** | +20-30% slower | Faster |
| **Bundle** | Requires separate .d.ts files | Only .js files |

```json
// Library configuration
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true, // Source map for .d.ts files
    "emitDeclarationOnly": false
  }
}

// Application configuration
{
  "compilerOptions": {
    "declaration": false,
    "noEmit": true // Type-check only, bundler handles emit
  }
}
```

**5. Source Maps: Full vs. None**

| Aspect | `sourceMap: true` | `sourceMap: false` |
|--------|-------------------|-------------------|
| **Debugging** | Original TypeScript in DevTools | Compiled JavaScript only |
| **Build Time** | +10-15% slower | Faster |
| **Bundle Size** | +40-60% (with .map files) | Smaller |
| **Production** | Security risk (exposes source) | Safer |

```json
// Development
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false // Separate .map files
  }
}

// Production
{
  "compilerOptions": {
    "sourceMap": false,
    // Or upload to error tracking service
    "sourceMap": true,
    "inlineSources": true
  }
}
```

**6. Compilation Speed vs. Type Safety**

**Fast Compilation Configuration:**
```json
{
  "compilerOptions": {
    "skipLibCheck": true, // Skip node_modules type checks
    "incremental": true,
    "noEmit": true, // Let bundler handle emit
    "isolatedModules": true // Faster, Babel-compatible
  }
}
```

**Maximum Type Safety Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Performance Comparison:**
- Fast config: 4.2s build time, catches 70% of type errors
- Maximum safety config: 7.8s build time, catches 95% of type errors

**Decision Matrix:**

| Project Type | Recommended Config |
|--------------|-------------------|
| New application | `strict: true`, `target: ES2020`, `module: ESNext` |
| Legacy migration | `strict: false` + gradual flags, `target: ES5`, `skipLibCheck: true` |
| Library/Package | `declaration: true`, `composite: true`, `strict: true` |
| Monorepo | Project references, `incremental: true`, `composite: true` |
| Rapid prototyping | `noEmit: true`, `skipLibCheck: true`, minimal strictness |

---

### 💬 Explain to Junior: Understanding TypeScript Compilation

**Analogy: TypeScript Compiler as a Multi-Stage Factory**

Imagine you're running a car manufacturing factory. Raw materials (TypeScript code) go through multiple assembly lines (compilation phases) to produce the final product (JavaScript).

**Stage 1: Blueprint Reading (Parsing)**
- **What happens**: Factory reads blueprints (your TypeScript code) and creates a digital model (AST - Abstract Syntax Tree)
- **Real code**: `const user: User = { name: 'John' }` → Computer-friendly tree structure

```typescript
// You write:
const greeting = (name: string) => `Hello, ${name}`;

// Compiler sees (simplified):
Tree Node: Variable Declaration
  ├─ Name: "greeting"
  ├─ Type: Function
  │   ├─ Parameter: "name" (type: string)
  │   └─ Return: string
  └─ Value: Arrow Function Expression
```

**Stage 2: Quality Inspector (Type Checking)**
- **What happens**: Inspector checks if parts fit together (types match)
- **Real code**: Catches errors like passing a number where string expected

```typescript
// ❌ Quality inspector catches this:
const age: string = 25; // Error: number not assignable to string

// ✅ This passes inspection:
const age: number = 25;
```

**Stage 3: Assembly Line (Transformation)**
- **What happens**: Modern parts converted to work in older cars (ES2020 → ES5)
- **Real code**: Arrow functions → regular functions

```typescript
// Input (modern TypeScript)
const add = (a: number, b: number) => a + b;

// Output (older JavaScript for IE11)
var add = function(a, b) { return a + b; };
```

**Stage 4: Packaging (Emission)**
- **What happens**: Final products packaged and shipped (JavaScript files created)
- **Real code**: `.ts` files → `.js` files + `.d.ts` type definitions

**tsconfig.json is Your Factory Settings Manual**

Think of `tsconfig.json` as the control panel for your factory:

```json
{
  "compilerOptions": {
    "target": "ES2020",        // "What vintage car should we build?"
    "strict": true,            // "How strict is quality control?"
    "outDir": "./dist",        // "Where to put finished products?"
    "sourceMap": true          // "Include assembly instructions?"
  }
}
```

**Key Settings Explained:**

1. **`target`**: "What year of car are we building?"
   - `ES5`: 2011 model (works everywhere, even old browsers)
   - `ES2020`: 2020 model (modern features, faster, smaller)

2. **`strict`**: "How careful should the quality inspector be?"
   - `true`: Catch every tiny defect (recommended)
   - `false`: Only check obvious problems (risky)

3. **`module`**: "How do we package parts?"
   - `commonjs`: Traditional boxes (Node.js standard)
   - `ES2020`: Modern shipping containers (better for bundlers)

4. **`outDir`**: "Where to put finished cars?"
   - Like choosing your shipping warehouse

**Common Beginner Mistakes:**

**Mistake 1: Not understanding compilation phases**
```typescript
// ❌ Expecting TypeScript types to exist at runtime
function getUser(id: string) {
  if (typeof id !== 'string') { // This check seems redundant...
    throw new Error('ID must be string');
  }
}

// ✅ Understanding: Types are erased after compilation!
// At runtime, JavaScript doesn't know about TypeScript types
// Runtime checks are still necessary for external data
```

**Mistake 2: Confusing `target` and `lib`**
```json
// ❌ Misunderstanding
{
  "compilerOptions": {
    "target": "ES5", // "Compile to old JavaScript"
    // Missing "lib" - defaults to ES5 types
  }
}

// Result: Can't use modern methods like Array.includes()
const nums = [1, 2, 3];
nums.includes(2); // Error: Property 'includes' does not exist on type 'number[]'

// ✅ Correct understanding
{
  "compilerOptions": {
    "target": "ES5",           // Output old JavaScript
    "lib": ["ES2020", "DOM"]   // Use modern types (polyfill at runtime)
  }
}
```

**Mistake 3: Not using incremental builds**
```json
// ❌ Slow: Full recompile every time (35 minutes)
{
  "compilerOptions": {}
}

// ✅ Fast: Only recompile changed files (12 seconds)
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

**Interview Answer Template:**

**Q: "Explain how TypeScript compilation works"**

**Template Answer:**
"TypeScript compilation happens in four main phases:

First, the **parser** converts source code into an Abstract Syntax Tree (AST). This is like creating a blueprint of your code's structure.

Second, the **type checker** validates types using structural comparison. TypeScript uses structural typing, meaning it checks if objects have the same shape rather than the same class name.

Third, **transformers** convert modern features to match your target JavaScript version. For example, if you target ES5, arrow functions become regular functions.

Finally, the **emitter** generates JavaScript files, declaration files, and source maps.

The `tsconfig.json` controls all these phases - it's the central configuration file that specifies compilation options like target version, module system, and strictness level.

For performance, TypeScript supports incremental compilation, where it stores build information and only recompiles changed files. In large projects, this can reduce build times from minutes to seconds."

**Q: "What's the difference between `target` and `lib` in tsconfig?"**

**Template Answer:**
"`target` controls the JavaScript version the compiler outputs, while `lib` controls which built-in type definitions are available.

For example, with `target: ES5`, the compiler converts modern syntax like arrow functions to ES5-compatible code. But this doesn't affect which APIs you can use in your code.

That's where `lib` comes in. Setting `lib: ['ES2020']` tells TypeScript you can use modern APIs like Promise, Array.includes(), and optional chaining in your source code. You're responsible for providing polyfills at runtime if targeting older browsers.

This separation is useful because you might want to write modern code (using ES2020 types) but compile to ES5 for browser compatibility, then use a polyfill library like core-js to fill in missing features."

**Q: "What is `strict` mode and why use it?"**

**Template Answer:**
"`strict: true` enables all strict type-checking options in TypeScript. This includes:
- `strictNullChecks`: Prevents null/undefined errors
- `noImplicitAny`: Forces explicit type annotations
- `strictFunctionTypes`: Stricter function parameter checking
- And several others

I always recommend using strict mode because it catches the most common type-related bugs at compile time. For example, without `strictNullChecks`, you might access a property on a potentially null object, causing runtime errors.

For new projects, enable strict mode from the start. For migrating existing JavaScript, enable strict flags gradually - start with `noImplicitAny`, then add others as you fix errors.

The trade-off is more initial development time fixing type errors, but this pays off with fewer runtime bugs and better code maintainability."

</details>

**Visual Mental Model:**

```
TypeScript Source Code
        ↓
    [PARSING]
        ↓
   Abstract Syntax Tree (AST)
        ↓
    [TYPE CHECKING]
        ↓
   Validated AST
        ↓
    [TRANSFORMATION]
        ↓
   JavaScript AST (target version)
        ↓
    [EMISSION]
        ↓
JavaScript Files + Declaration Files + Source Maps
```

**Key Takeaways for Juniors:**
1. TypeScript types only exist at compile time, not runtime
2. `tsconfig.json` is required for project compilation (not for single files)
3. Strict mode prevents bugs but requires more upfront work
4. Incremental compilation is crucial for large projects
5. Choose `target` based on browser support, `module` based on runtime (Node.js vs browser)

---

## Question 2: What are important compiler options and their impact on development and production builds?

**Answer:**

TypeScript provides over 100 compiler options that significantly impact type safety, build performance, bundle size, and developer experience. Understanding these options helps optimize both development workflows and production deployments. Compiler options fall into several categories: type checking, modules, emit, interop, and performance.

**Critical Compiler Options:**

**1. Type Checking Options**

```json
{
  "compilerOptions": {
    // Strict family (recommended for all projects)
    "strict": true,                          // Master switch for all strict checks
    "noImplicitAny": true,                   // Error on implicit 'any' types
    "strictNullChecks": true,                // Null/undefined checks
    "strictFunctionTypes": true,             // Contravariance for function parameters
    "strictBindCallApply": true,             // Type-check bind/call/apply
    "strictPropertyInitialization": true,    // Ensure class properties initialized
    "noImplicitThis": true,                  // Error when 'this' has 'any' type
    "alwaysStrict": true,                    // Emit "use strict" in output

    // Additional type safety
    "noUnusedLocals": true,                  // Error on unused variables
    "noUnusedParameters": true,              // Error on unused function parameters
    "noImplicitReturns": true,               // Error if not all code paths return
    "noFallthroughCasesInSwitch": true,      // Error on fallthrough switch cases
    "exactOptionalPropertyTypes": true       // Distinguish undefined vs. missing
  }
}
```

**2. Module Resolution Options**

```json
{
  "compilerOptions": {
    "module": "commonjs",                    // Module system: commonjs, ES2020, ESNext
    "moduleResolution": "node",              // How to resolve imports: node, bundler, classic
    "baseUrl": "./",                         // Base for non-relative imports
    "paths": {                               // Path mapping
      "@models/*": ["src/models/*"],
      "@utils/*": ["src/utils/*"]
    },
    "rootDirs": ["src", "generated"],        // Treat as single root for imports
    "typeRoots": ["./typings", "./node_modules/@types"], // Type definition locations
    "types": ["node", "jest"],               // Include only these types
    "resolveJsonModule": true,               // Import JSON files
    "esModuleInterop": true,                 // Better CommonJS/ESM interop
    "allowSyntheticDefaultImports": true     // Allow default imports from non-ES modules
  }
}
```

**3. Emit Options**

```json
{
  "compilerOptions": {
    "outDir": "./dist",                      // Output directory
    "rootDir": "./src",                      // Root of source files
    "declaration": true,                     // Generate .d.ts files
    "declarationMap": true,                  // Source maps for .d.ts files
    "sourceMap": true,                       // Generate .js.map files
    "removeComments": true,                  // Strip comments from output
    "noEmit": true,                          // Don't emit (type-check only)
    "importHelpers": true,                   // Import tslib helpers (smaller bundles)
    "downlevelIteration": true,              // Correct iteration for ES5 target
    "target": "ES2020",                      // JavaScript version to emit
    "lib": ["ES2020", "DOM"]                 // Type definitions to include
  }
}
```

**4. Performance Options**

```json
{
  "compilerOptions": {
    "incremental": true,                     // Enable incremental compilation
    "tsBuildInfoFile": "./.tsbuildinfo",     // Where to store build info
    "skipLibCheck": true,                    // Skip type checking of .d.ts files
    "composite": true,                       // Enable project references
    "isolatedModules": true                  // Ensure each file can be transpiled separately
  }
}
```

**5. Interop and Compatibility**

```json
{
  "compilerOptions": {
    "allowJs": true,                         // Allow JavaScript files in project
    "checkJs": true,                         // Type-check JavaScript files
    "jsx": "react-jsx",                      // JSX emit: react, react-jsx, preserve
    "experimentalDecorators": true,          // Enable decorators
    "emitDecoratorMetadata": true,           // Emit design-type metadata for decorators
    "useDefineForClassFields": true          // Use ECMAScript-standard class fields
  }
}
```

**Common Configuration Profiles:**

**Development Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "sourceMap": true,
    "incremental": true,
    "noEmit": true,              // Let bundler (Vite/Webpack) handle emit
    "isolatedModules": true      // Fast, works with esbuild/swc
  }
}
```

**Production Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2019",           // Wider browser support
    "module": "ESNext",
    "strict": true,
    "sourceMap": false,           // Or upload to error tracking
    "removeComments": true,
    "declaration": false,
    "importHelpers": true         // Smaller bundle (use tslib)
  }
}
```

---

<details>
<summary><strong>🔍 Deep Dive: Impact of Compiler Options on Code Generation and Type Safety</strong></summary>

Understanding how compiler options affect the generated code and type system helps make informed configuration decisions.

**1. Strict Null Checks: Deep Dive**

Without `strictNullChecks`, TypeScript treats `null` and `undefined` as valid values for any type:

```typescript
// strictNullChecks: false (unsafe)
interface User {
  name: string;
  email: string;
}

function getUser(id: string): User {
  return users.find(u => u.id === id); // ❌ Returns User | undefined, but typed as User
}

const user = getUser('123');
console.log(user.email.toUpperCase()); // Runtime error if user not found!

// strictNullChecks: true (safe)
function getUser(id: string): User | undefined { // ✅ Explicit undefined
  return users.find(u => u.id === id);
}

const user = getUser('123');
console.log(user.email.toUpperCase()); // ✅ Compile error: Object is possibly 'undefined'

// Proper handling:
if (user) {
  console.log(user.email.toUpperCase()); // ✅ Type narrowed to User
}
```

**Implementation in TypeScript Compiler:**

The compiler maintains a "type flow graph" that tracks possible types at each point:

```typescript
function processValue(x: string | null) {
  // Type graph: x = string | null

  if (x === null) {
    // Type graph (true branch): x = null
    return 'No value';
  }

  // Type graph (after if): x = string (null removed)
  return x.toUpperCase(); // ✅ Safe: x is definitely string here
}
```

**2. Module Interop: esModuleInterop Deep Dive**

JavaScript has two main module systems with incompatible semantics:

```typescript
// CommonJS (default exports don't exist at language level)
module.exports = function express() { /* ... */ };
// Or: exports.default = function express() { /* ... */ };

// ES Modules (explicit default export)
export default function express() { /* ... */ }
```

**Without esModuleInterop (problematic):**

```typescript
// TypeScript code
import express from 'express'; // Error: has no default export
import * as express from 'express'; // ✅ Works but awkward

// Generated JavaScript (incorrect)
const express = require('express'); // Gets module.exports directly
```

**With esModuleInterop: true (correct):**

```typescript
// TypeScript code
import express from 'express'; // ✅ Works naturally

// Generated JavaScript (correct)
const express_1 = require('express');
const express = express_1.default || express_1; // Handles both CJS styles
```

**What esModuleInterop does:**
1. Imports `__importDefault` and `__importStar` helpers from tslib
2. Wraps CommonJS modules to have proper default/namespace semantics
3. Enables `allowSyntheticDefaultImports` automatically

**3. Downlevel Iteration: Why It Matters**

When targeting ES5, TypeScript must transpile modern iteration features:

```typescript
// Modern code
const arr = [1, 2, 3];
const copy = [...arr]; // Spread operator
for (const num of arr) { // for-of loop
  console.log(num);
}

// Without downlevelIteration (INCORRECT for iterables)
var copy = arr.slice(); // ❌ Only works for arrays, not iterables
var _i = 0;
for (_i = 0; _i < arr.length; _i++) { // ❌ Only works for arrays
  var num = arr[_i];
  console.log(num);
}

// With downlevelIteration: true (CORRECT)
var __read = (this && this.__read) || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
    try { if (r && !r.done && (m = i["return"])) m.call(i); }
    finally { if (e) throw e.error; }
  }
  return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
    to[j] = from[i];
  return to;
};
var copy = __spreadArray([], __read(arr)); // ✅ Works with iterables
```

**When you need downlevelIteration:**
- Using spread with iterables (not just arrays)
- Using for-of with iterables
- Destructuring iterables
- Targeting ES5 or ES3

**Bundle size impact:**
- Without: Smaller but potentially incorrect for iterables
- With: +2-4KB for helper functions but correct behavior

**4. Import Helpers: Bundle Optimization**

TypeScript emits helper functions for various features:

```typescript
// Source code with async/await + class inheritance
class UserService extends BaseService {
  async getUser(id: string) {
    return await this.fetch(`/users/${id}`);
  }
}

// Without importHelpers (duplicated in every file)
var __extends = (this && this.__extends) || (function () {
  // 20 lines of inheritance helper code
})();
var __awaiter = (this && this.__awaiter) || (function () {
  // 30 lines of async/await helper code
})();

// Every file with classes/async duplicates these helpers!
```

**With importHelpers: true + tslib:**

```typescript
// Each file imports shared helpers
var __extends = require("tslib").__extends;
var __awaiter = require("tslib").__awaiter;

// Single copy in tslib package
```

**Bundle size comparison (10 files with async + classes):**
- Without importHelpers: 500KB (helpers duplicated 10 times)
- With importHelpers: 52KB (helpers in tslib once)
- Savings: ~90% reduction in helper code

**5. Isolated Modules: Fast Transpilation**

When `isolatedModules: true`, TypeScript enforces that each file can be independently transpiled:

```typescript
// ❌ Error with isolatedModules: true
export { User }; // Error: Cannot re-export a type when --isolatedModules is enabled

// ✅ Correct
export type { User }; // Explicit type export
export { UserImpl as User }; // Or export implementation

// Why this matters:
// Fast transpilers (esbuild, swc) process files independently
// They can't resolve cross-file type information
// isolatedModules ensures your code works with these tools
```

**Other restrictions with isolatedModules:**
- Can't use `const enum` (requires inlining from other files)
- Must use `export type` for type-only exports
- Can't use namespaces merged across files

**Performance benefit:**
- TypeScript with isolatedModules: 4.2s
- esbuild with isolatedModules-compliant code: 0.3s (14x faster)

**6. Skip Lib Check: Performance vs. Safety**

```json
{
  "compilerOptions": {
    "skipLibCheck": true // Skip type-checking node_modules/**/*.d.ts
  }
}
```

**What gets skipped:**
- All `.d.ts` files in node_modules
- Type definitions from @types packages
- Your own declaration files (if in node_modules)

**Performance impact (large project with 200+ dependencies):**
- skipLibCheck: false → 12.4s compilation
- skipLibCheck: true → 4.1s compilation (67% faster)

**Safety trade-off:**
```typescript
// Scenario: Conflicting type definitions
// @types/react version 17: MouseEvent has 'nativeEvent'
// @types/react version 18: MouseEvent structure changed

// With skipLibCheck: false
// Error: Duplicate identifier 'MouseEvent' (catches incompatible types)

// With skipLibCheck: true
// No error (may cause runtime issues if types mismatch)
```

**Recommendation:**
- Development: `skipLibCheck: true` (faster iteration)
- CI/CD: `skipLibCheck: false` (catch dependency issues)
- Or use `skipLibCheck: true` with lockfile (npm/yarn) to prevent type conflicts

**7. Exact Optional Property Types**

```typescript
interface User {
  name: string;
  age?: number; // Optional property
}

// Without exactOptionalPropertyTypes (permissive)
const user1: User = { name: 'John', age: undefined }; // ✅ Allowed
const user2: User = { name: 'Jane' }; // ✅ Allowed

// With exactOptionalPropertyTypes: true (strict)
const user3: User = { name: 'John', age: undefined }; // ❌ Error
const user4: User = { name: 'Jane' }; // ✅ Allowed

// Why it matters:
// Reflects actual JavaScript semantics
// 'age' in user3 === true (property exists with undefined value)
// 'age' in user4 === false (property doesn't exist)
```

**Use cases:**
- JSON serialization: `undefined` vs missing property matters
- Object.keys() behavior: Returns keys even if value is undefined
- Spread operators: `undefined` values are copied

**8. Path Mapping: Module Resolution Control**

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@models/*": ["src/models/*"],
      "@utils/*": ["src/utils/*"],
      "@/*": ["src/*"]
    }
  }
}
```

**Before path mapping:**
```typescript
import { User } from '../../../models/User';
import { formatDate } from '../../../utils/formatters';
```

**After path mapping:**
```typescript
import { User } from '@models/User';
import { formatDate } from '@utils/formatters';
```

**Important: Path mapping is TypeScript-only**

TypeScript doesn't rewrite imports in emitted JavaScript:

```typescript
// Your TypeScript code
import { User } from '@models/User';

// Emitted JavaScript (UNCHANGED)
import { User } from '@models/User'; // ❌ Won't resolve at runtime!
```

**Solution: Configure your bundler/runtime**

```javascript
// Webpack config
module.exports = {
  resolve: {
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};

// Vite config
export default {
  resolve: {
    alias: {
      '@models': '/src/models',
      '@utils': '/src/utils'
    }
  }
};

// Jest config
module.exports = {
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  }
};

// tsconfig-paths (Node.js runtime)
// package.json
{
  "scripts": {
    "start": "node -r tsconfig-paths/register dist/index.js"
  }
}
```

---

### 🐛 Real-World Scenario: Misconfigured Compiler Options Causing Production Crash

**Context:**
An e-commerce platform running on Node.js deployed a major refactor to production. Within 10 minutes, checkout failures spiked to 100%, causing $42,000 in lost sales during a Black Friday sale.

**Initial Error Report:**

```
TypeError: Cannot read property 'toUpperCase' of undefined
  at OrderService.createOrder (order-service.js:142)
  at async POST /api/orders (routes.js:89)

Error rate: 2,847 errors in 10 minutes
Affected users: 1,293 unique sessions
Revenue impact: $42,000 estimated lost sales
```

**Problem Investigation:**

**Issue #1: Missing strictNullChecks**

```typescript
// TypeScript code (looked safe)
interface OrderRequest {
  userId: string;
  items: CartItem[];
  couponCode?: string; // Optional coupon
}

function createOrder(request: OrderRequest) {
  // ❌ Developer assumed couponCode would be undefined if missing
  const normalizedCoupon = request.couponCode.toUpperCase();
  return validateCoupon(normalizedCoupon);
}

// tsconfig.json (development environment)
{
  "compilerOptions": {
    "strict": false, // ❌ Legacy configuration
    "strictNullChecks": false // ❌ Allowed unsafe null access
  }
}
```

**What happened:**
- TypeScript didn't catch the unsafe property access
- Compiled to JavaScript without errors
- Production requests without coupons → `couponCode` is `undefined`
- Calling `undefined.toUpperCase()` → runtime crash

**Issue #2: Different Configs Between Dev and Production**

```json
// Development tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": false,
    "skipLibCheck": true
  }
}

// Production build used different config (CI/CD script)
// tsconfig.prod.json
{
  "compilerOptions": {
    "target": "ES5", // ❌ Different target
    "strict": false, // ❌ Still not strict
    "removeComments": true,
    "downlevelIteration": false // ❌ Missing flag
  }
}
```

**Additional failure from downlevelIteration:**

```typescript
// Code using spread with Set
const uniqueCategories = new Set(['electronics', 'books', 'electronics']);
const categoryArray = [...uniqueCategories]; // [Symbol.iterator] usage

// Without downlevelIteration, compiled to:
var categoryArray = uniqueCategories.slice(); // ❌ Set doesn't have .slice()!
// Runtime error: uniqueCategories.slice is not a function
```

**Issue #3: Missing Type Definitions Check**

```typescript
// Using third-party library
import { processPayment } from 'payment-gateway-sdk';

// ❌ No type definitions for this package
// Developer assumed signature:
const result = processPayment(orderTotal, currency);

// Actual signature (found in docs):
// processPayment(amount: number, currency: string, options: PaymentOptions)
// Third parameter is REQUIRED

// With skipLibCheck: true, no error during compilation
// Runtime: SDK throws error on missing required parameter
```

**Root Cause Analysis:**

1. **Insufficient type checking**: `strict: false` allowed unsafe code
2. **Config divergence**: Dev and prod used different tsconfig files
3. **Missing runtime validation**: No fallback checks for edge cases
4. **Inadequate testing**: Tests didn't cover null/undefined scenarios
5. **Fast-tracked deployment**: Skipped type-checking step in CI/CD

**Solution Implementation:**

**Step 1: Enable Strict Mode Gradually**

```json
// Week 1: Enable noImplicitAny
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
// Fixed 247 implicit 'any' types across codebase

// Week 2: Enable strictNullChecks
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true // ✅ Catches null/undefined access
  }
}
// Fixed 1,834 potential null reference errors!

// Week 3: Enable all strict flags
{
  "compilerOptions": {
    "strict": true // ✅ All strict checks enabled
  }
}
```

**Step 2: Fix Null Safety Issues**

```typescript
// ✅ AFTER: Safe with strictNullChecks
function createOrder(request: OrderRequest) {
  // Option 1: Optional chaining + nullish coalescing
  const normalizedCoupon = request.couponCode?.toUpperCase() ?? '';

  // Option 2: Explicit null check
  if (request.couponCode) {
    const normalizedCoupon = request.couponCode.toUpperCase();
    return validateCoupon(normalizedCoupon);
  }

  // Option 3: Runtime assertion with type guard
  if (!request.couponCode) {
    throw new Error('Coupon code required');
  }
  const normalizedCoupon = request.couponCode.toUpperCase(); // ✅ TypeScript knows it's defined
}
```

**Step 3: Unify Configuration**

```json
// tsconfig.base.json (shared config)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "downlevelIteration": true, // ✅ Always include
    "importHelpers": true,
    "sourceMap": true
  }
}

// tsconfig.json (development)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "incremental": true,
    "noEmit": true // Let ts-node handle execution
  }
}

// tsconfig.prod.json (production build)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "removeComments": true,
    "sourceMap": false, // Or upload to error tracking
    "declaration": true
  }
}
```

**Step 4: Add CI/CD Type-Checking Gate**

```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: npm run type-check # tsc --noEmit (must pass)

- name: Lint
  run: npm run lint

- name: Test
  run: npm run test

- name: Build
  run: npm run build
  # Only runs if type-check passed
```

**Step 5: Add Runtime Validation Layer**

```typescript
// Even with TypeScript, validate external data
import { z } from 'zod';

const OrderRequestSchema = z.object({
  userId: z.string().min(1),
  items: z.array(CartItemSchema).min(1),
  couponCode: z.string().optional()
});

// Express route handler
app.post('/api/orders', async (req, res) => {
  // Validate runtime data (TypeScript types can't help here)
  const validation = OrderRequestSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  // Now TypeScript types match runtime reality
  const order = await createOrder(validation.data);
  res.json(order);
});
```

**Step 6: Add Missing Type Definitions**

```bash
# Check for packages without types
npm install --save-dev @types/payment-gateway-sdk

# If no @types package exists, create local types
# typings/payment-gateway-sdk/index.d.ts
declare module 'payment-gateway-sdk' {
  export interface PaymentOptions {
    merchant: string;
    callback: string;
  }

  export function processPayment(
    amount: number,
    currency: string,
    options: PaymentOptions
  ): Promise<PaymentResult>;
}
```

**Results After Fix:**

```
Deployment time: +15 minutes (added type-check gate)
Type errors caught in CI: 1,834 potential bugs prevented
Production errors: 2,847 → 0 (100% reduction)
Revenue impact: $0 lost (vs. $42k in incident)

Build metrics:
- Type check time: 8.4s (new CI step)
- Build time: 12.1s (unchanged)
- Total CI time: 4min 23s → 4min 38s (+15s acceptable)

Developer feedback:
- Initial friction: "Strict mode is too strict!"
- After 2 weeks: "Caught 3 bugs before production - worth it"
- After 1 month: "Can't imagine coding without it"
```

**Additional Improvements:**

```json
// Added even stricter checks
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,       // Remove dead code
    "noUnusedParameters": true,    // Clean function signatures
    "noImplicitReturns": true,     // Ensure all paths return
    "noFallthroughCasesInSwitch": true, // Prevent switch fallthrough bugs
    "exactOptionalPropertyTypes": true  // Distinguish undefined vs. missing
  }
}
```

**Key Lessons:**
1. **Strict mode is non-negotiable** for production TypeScript projects
2. **Unify configs** across dev/prod to prevent divergence
3. **Type checking is a CI/CD gate**, not optional
4. **Runtime validation is still required** for external data (APIs, user input)
5. **Gradual migration is okay** - better late than never
6. **Type definitions matter** - missing types defeat TypeScript's purpose

---

### ⚖️ Trade-offs: Compiler Options Decision Matrix

**1. Strict Mode: All-At-Once vs. Gradual Adoption**

| Approach | Enable `strict: true` Immediately | Enable Individual Flags Gradually |
|----------|----------------------------------|-----------------------------------|
| **Initial Effort** | High (fix all errors upfront) | Low (fix incrementally) |
| **Time to Full Safety** | Immediate | Weeks/months |
| **Team Disruption** | High (all features blocked) | Low (work continues) |
| **Bug Prevention** | Maximum from day 1 | Partial initially |
| **Risk** | Deployment delay | Interim bugs possible |
| **Best For** | New projects, small codebases | Large migrations, tight deadlines |

**Example Migration Timeline:**

```json
// Week 1: noImplicitAny
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
// Impact: 247 errors, 8 hours to fix

// Week 3: strictNullChecks (most impactful)
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
// Impact: 1,834 errors, 40 hours to fix

// Week 5: All strict flags
{
  "compilerOptions": {
    "strict": true
  }
}
// Impact: 312 additional errors, 12 hours to fix
```

**Recommendation:**
- New projects: Start with `strict: true`
- Migrations: Gradual adoption (prioritize `strictNullChecks` first)

**2. Target Version: Browser Support vs. Bundle Size**

| Target | ES5 | ES2017 | ES2020 |
|--------|-----|--------|--------|
| **Browser Support** | IE11+ (99.9% coverage) | Modern browsers (95% coverage) | Latest browsers (90% coverage) |
| **Bundle Size** | Largest (all features transpiled) | Medium (async/await native) | Smallest (most features native) |
| **Runtime Performance** | Slowest (transpiled features) | Fast (native async) | Fastest (native everything) |
| **Build Time** | Slowest (many transforms) | Medium | Fastest (minimal transforms) |
| **Polyfills Needed** | Core-js (200KB+) | Minimal (20-50KB) | Almost none |

**Real-world comparison (same codebase):**

```json
// target: ES5
{
  "compilerOptions": {
    "target": "ES5",
    "lib": ["ES2020", "DOM"],
    "downlevelIteration": true
  }
}
// Bundle size: 487KB (minified)
// With polyfills: 712KB
// Build time: 14.2s

// target: ES2020
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"]
  }
}
// Bundle size: 298KB (minified) - 39% smaller
// With polyfills: 310KB - 56% smaller
// Build time: 6.1s - 57% faster
```

**Decision Matrix:**

| Requirement | Recommended Target |
|-------------|-------------------|
| Support IE11 | ES5 (no choice) |
| Corporate environment (older browsers) | ES2017 |
| Modern web app (no IE) | ES2020 |
| Node.js backend | ES2022 |
| Bleeding edge / internal tools | ESNext |

**3. Module System: CommonJS vs. ES Modules**

| Aspect | CommonJS | ES Modules |
|--------|----------|------------|
| **Node.js Support** | Native (all versions) | Native (v12.17+) |
| **Tree Shaking** | Poor (requires special handling) | Excellent (static analysis) |
| **Dynamic Imports** | `require()` (synchronous) | `import()` (async, native) |
| **Bundle Optimization** | Difficult (Webpack special config) | Easy (works out of the box) |
| **Interop** | Easy (everything uses it) | Requires `esModuleInterop` |
| **Top-level await** | Not supported | Supported |

**Use Cases:**

```json
// Node.js library (published to npm)
{
  "compilerOptions": {
    "module": "commonjs", // ✅ Maximum compatibility
    "target": "ES2018"
  }
}

// Modern web app (Vite/Webpack)
{
  "compilerOptions": {
    "module": "ESNext", // ✅ Best tree shaking
    "target": "ES2020"
  }
}

// Hybrid (publish both formats)
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2020"
  }
}
// package.json
{
  "main": "./dist/cjs/index.js",     // CJS entry
  "module": "./dist/esm/index.js",   // ESM entry
  "exports": {
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.js"
  }
}
```

**Tree Shaking Impact:**

```typescript
// utils.ts (100 functions)
export function add(a: number, b: number) { return a + b; }
export function subtract(a: number, b: number) { return a - b; }
// ... 98 more functions

// app.ts
import { add } from './utils';
console.log(add(1, 2));

// CommonJS output (bundle includes ALL 100 functions)
// Bundle size: 45KB

// ES Modules output (bundle includes only 'add')
// Bundle size: 2KB (96% reduction!)
```

**4. Source Maps: Developer Experience vs. Security**

| Aspect | Full Source Maps | No Source Maps | Upload to Error Tracking |
|--------|------------------|----------------|--------------------------|
| **Development** | Perfect debugging | No TypeScript in DevTools | Perfect debugging |
| **Production Debugging** | Easy (see original code) | Hard (minified JS only) | Easy (via service) |
| **Security Risk** | High (source code exposed) | None | Low (requires auth) |
| **Bundle Size** | +50-70% (with .map files) | Baseline | Baseline |
| **Performance** | No impact (maps loaded on demand) | Fastest | No impact |

**Configuration strategies:**

```json
// Development (always use source maps)
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false // Separate .map files
  }
}

// Production (option 1: No source maps)
{
  "compilerOptions": {
    "sourceMap": false
  }
}
// Pros: Smallest bundle, no source exposure
// Cons: Debugging production issues is nightmare

// Production (option 2: Upload to error tracking)
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
// Build script:
npm run build
sentry-cli sourcemaps upload --release=1.0.0 ./dist
rm ./dist/**/*.map // Delete from deployment bundle

// Pros: Full debugging capability, source not publicly exposed
// Cons: Requires error tracking service (Sentry, Datadog, etc.)
```

**5. Declaration Files: Library vs. Application**

| Project Type | `declaration: true` | `declaration: false` |
|--------------|---------------------|----------------------|
| **npm Library** | Required (consumers need types) | Unusable by TypeScript consumers |
| **Application** | Unnecessary (no external consumers) | Faster builds |
| **Monorepo Package** | Required (other packages need types) | Breaks project references |

**Performance impact:**

```
With declaration: true
- Build time: 18.4s
- Output: .js, .d.ts, .d.ts.map files

With declaration: false
- Build time: 12.1s (34% faster)
- Output: .js files only
```

**6. skipLibCheck: Speed vs. Safety**

| Aspect | `skipLibCheck: true` | `skipLibCheck: false` |
|--------|----------------------|----------------------|
| **Build Time** | Fast (skip node_modules) | Slow (check all .d.ts) |
| **Type Safety** | Misses dependency conflicts | Catches all type errors |
| **Use Case** | Active development | CI/CD, final verification |

**Real example:**

```typescript
// Two dependencies with conflicting types
// node_modules/@types/react/index.d.ts (v17)
interface MouseEvent { nativeEvent: Event }

// node_modules/@types/react/index.d.ts (v18 - different version)
interface MouseEvent { nativeEvent: NativeEvent }

// With skipLibCheck: false
// Error: Duplicate identifier 'MouseEvent' (build fails)

// With skipLibCheck: true
// No error (may cause runtime issues if using both versions)
```

**Recommended approach:**

```json
// Development tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true // Fast iteration
  }
}

// CI/CD check (separate script)
// package.json
{
  "scripts": {
    "type-check:full": "tsc --noEmit --skipLibCheck false",
    "type-check:fast": "tsc --noEmit --skipLibCheck true"
  }
}

// .github/workflows/ci.yml
- name: Full type check (weekly)
  run: npm run type-check:full
  if: github.event.schedule
```

**7. Incremental Compilation: Build Speed vs. Disk Space**

| Aspect | `incremental: true` | `incremental: false` |
|--------|---------------------|----------------------|
| **First Build** | Slower (create .tsbuildinfo) | Fast |
| **Rebuild (1 file changed)** | Very fast (0.3-2s) | Slow (full recompile) |
| **Rebuild (no changes)** | Instant (0.1s) | Slow (full recompile) |
| **Disk Space** | +5-50MB (.tsbuildinfo file) | None |

**Performance data (large codebase):**

```
Without incremental:
- Clean build: 32.4s
- Rebuild (1 file changed): 31.8s
- Rebuild (no changes): 31.2s

With incremental:
- Clean build: 34.1s (+5% slower)
- Rebuild (1 file changed): 1.2s (96% faster)
- Rebuild (no changes): 0.2s (99% faster)

.tsbuildinfo size: 18MB
```

**Recommendation:**
- Always use `incremental: true` for development
- Add `.tsbuildinfo` to `.gitignore`
- Use in CI if caching build artifacts (GitHub Actions cache)

---

### 💬 Explain to Junior: Choosing the Right Compiler Options

**Analogy: Compiler Options as Car Safety Features**

Imagine buying a car. You can choose different safety features (compiler options) that affect safety, cost, and performance.

**Strict Mode = Full Safety Package**

```typescript
// Without strict mode (no safety features)
function divide(a, b) {
  return a / b; // ❌ What if b is 0? What if they're not numbers?
}

divide(10, 0); // Infinity (runtime surprise)
divide("10", "2"); // "5" (string concatenation, not division)

// With strict mode (full safety)
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

divide(10, 0); // ✅ Compile error: Division by zero
divide("10", "2"); // ✅ Compile error: Argument of type 'string' not assignable to 'number'
```

**Think of strict mode as:**
- Airbags (prevent crashes)
- Anti-lock brakes (catch errors early)
- Blind spot monitoring (warn about edge cases)

**Cost:** More upfront work (fixing type errors)
**Benefit:** Prevent 90% of runtime crashes

**Target Version = Engine Type**

```json
{
  "compilerOptions": {
    "target": "ES5" // Like a 2011 car engine (works everywhere)
  }
}

{
  "compilerOptions": {
    "target": "ES2020" // Like a 2020 car engine (efficient, modern)
  }
}
```

**ES5 target:**
- Works in old browsers (IE11)
- Bigger bundle (needs extra parts/polyfills)
- Slower (transpiled features)

**ES2020 target:**
- Modern browsers only
- Smaller bundle (uses native features)
- Faster (native execution)

**Real example:**

```typescript
// Your code (modern syntax)
const greet = (name) => `Hello, ${name}`;

// ES5 output (verbose, compatible)
var greet = function (name) { return "Hello, " + name; };

// ES2020 output (unchanged, efficient)
const greet = (name) => `Hello, ${name}`;
```

**Source Maps = GPS for Debugging**

```json
{
  "compilerOptions": {
    "sourceMap": true // Include "GPS coordinates" to original code
  }
}
```

**Without source maps:**
- Error in production: "Error at line 14287 in bundle.min.js"
- You: "What code is that?!" (impossible to debug)

**With source maps:**
- Error in production: "Error at line 42 in UserService.ts: user.email.toUpperCase()"
- You: "Ah, null check missing!" (easy to fix)

**Trade-off:**
- Development: Always use (debugging is easy)
- Production: Optional (exposes source code to users)
- Solution: Upload to error tracking service (Sentry), delete from public bundle

**Module System = Packaging Format**

```json
{
  "compilerOptions": {
    "module": "commonjs" // Old-school boxes (Node.js traditional)
  }
}

{
  "compilerOptions": {
    "module": "ESNext" // Modern shipping containers (better optimization)
  }
}
```

**CommonJS (old standard):**
```typescript
// How code is packaged
const express = require('express'); // Synchronous loading
module.exports = app;
```

**ES Modules (modern standard):**
```typescript
// How code is packaged
import express from 'express'; // Static analysis (tree-shaking works)
export default app;
```

**Why ES Modules are better for web apps:**

```typescript
// You import one function from lodash
import { debounce } from 'lodash';

// CommonJS: Entire lodash library included (500KB)
// ES Modules: Only debounce function included (5KB)
```

**Savings: 99% smaller bundle!**

**Common Beginner Questions:**

**Q: "Why do I need so many compiler options?"**

**A:** TypeScript is flexible to support many use cases:
- Web apps (need modern features, small bundles)
- Node.js servers (need CommonJS compatibility)
- Libraries (need type definitions for consumers)
- Legacy migrations (need gradual strictness)

Each project has different needs. The options let you optimize for your specific case.

**Q: "What's the minimum config I need to start?"**

**A:** For a new project, this is perfect:

```json
{
  "compilerOptions": {
    "target": "ES2020",           // Modern JavaScript
    "module": "ESNext",            // Modern modules
    "strict": true,                // All safety features
    "esModuleInterop": true,       // Easy imports
    "skipLibCheck": true,          // Fast builds
    "outDir": "./dist"             // Output folder
  },
  "include": ["src/**/*"],         // Compile everything in src/
  "exclude": ["node_modules"]      // Ignore dependencies
}
```

**Q: "When should I enable strict mode?"**

**A:** Always! There's no downside except initial effort.

```typescript
// Without strict mode
function getUser(id) {
  return users.find(u => u.id === id);
}
const user = getUser(123);
console.log(user.name); // ❌ Might crash if user not found

// With strict mode
function getUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}
const user = getUser('123');
if (user) {
  console.log(user.name); // ✅ Safe, TypeScript forced you to check
}
```

**Q: "Why is my bundle so big?"**

**A:** Check these options:

```json
{
  "compilerOptions": {
    "target": "ES2020",        // Use modern target (not ES5)
    "module": "ESNext",         // Enable tree-shaking
    "importHelpers": true,      // Share helper functions
    "removeComments": true      // Strip comments from output
  }
}
```

Also use a bundler (Webpack, Vite) with minification:
- Before: 847KB (with ES5 target, duplicated helpers, comments)
- After: 142KB (with optimizations above + minification)

**Interview Answer Templates:**

**Q: "What compiler options would you use for a new React project?"**

**Template Answer:**
"For a new React project, I'd use these compiler options:

First, `strict: true` for maximum type safety. This catches null reference errors, implicit any types, and other common mistakes.

Second, `target: ES2020` because modern browsers support it, giving us smaller bundles and better performance. If we need to support IE11, I'd use ES5 with polyfills.

Third, `module: ESNext` with `moduleResolution: bundler` because modern bundlers like Vite handle this optimally with tree-shaking.

Fourth, `jsx: react-jsx` for the modern JSX transform that doesn't require importing React in every file.

Fifth, `esModuleInterop: true` for better CommonJS/ES module compatibility.

Finally, `skipLibCheck: true` for faster compilation during development, and `incremental: true` for fast rebuilds.

For production builds, I'd add `removeComments: true` and use source maps uploaded to error tracking rather than shipping them to users."

**Q: "How do compiler options affect performance?"**

**Template Answer:**
"Compiler options impact performance in three ways:

First, build-time performance. Options like `incremental: true` and `skipLibCheck: true` dramatically speed up compilation. In large projects, incremental builds reduce rebuild time from 30+ seconds to under 1 second.

Second, bundle size. Choosing `target: ES2020` over ES5 can reduce bundle size by 30-40% because modern browsers don't need features transpiled. Using `importHelpers: true` eliminates duplicate helper functions.

Third, runtime performance. Code targeting modern JavaScript runs faster because browsers execute native features more efficiently than transpiled polyfills. For example, native async/await is significantly faster than transpiled generator functions.

The key is balancing these trade-offs based on your browser support requirements. For modern apps, I'd prioritize runtime performance with ES2020 target. For broader support, I'd use ES5 with selective polyfills."

**Key Takeaways:**
1. Start with `strict: true` - it prevents most bugs
2. Choose `target` based on browser support needs
3. Use `ESNext` modules for modern bundlers (better tree-shaking)
4. Enable `incremental: true` for fast rebuilds
5. `skipLibCheck: true` speeds up development (use `false` in CI)
6. Source maps are essential for debugging (but secure them in production)

</details>
