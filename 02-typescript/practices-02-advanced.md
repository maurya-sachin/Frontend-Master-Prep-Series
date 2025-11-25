# TypeScript Advanced Best Practices

> Advanced patterns: naming conventions, code organization, performance optimization, testing, and migration strategies

---

## Question 1: What Are the Naming Conventions in TypeScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** All TypeScript companies

### Question
What naming conventions should you follow in TypeScript for types, interfaces, classes, and variables?

### Answer

**Key Conventions:**
1. **PascalCase** - Types, interfaces, classes, enums
2. **camelCase** - Variables, functions, methods, parameters
3. **UPPER_SNAKE_CASE** - Constants
4. **No 'I' prefix** - Modern convention (interfaces)
5. **Descriptive names** - Self-documenting code

### Code Example

```typescript
// ✅ CORRECT: PascalCase for types, interfaces, classes
interface UserProfile {
  id: number;
  name: string;
}

type RequestStatus = 'pending' | 'success' | 'error';

class DataService {
  fetchData() {}
}

// ✅ CORRECT: camelCase for variables, functions, methods
const userName = 'John';
function getUserById(id: number) {}

// ✅ CORRECT: UPPER_SNAKE_CASE for constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ CORRECT: Prefix interfaces with 'I' only if necessary
// Modern convention: No prefix
interface User {} // Good
interface IUser {} // Acceptable but old style

// ✅ CORRECT: Type aliases for unions, complex types
type ID = string | number;
type ApiResponse<T> = Success<T> | Error;
```

### Resources
- [TypeScript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)

---

## Question 2: How Should You Organize TypeScript Files?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6 minutes
**Companies:** Meta, Google, Airbnb

### Question
What are best practices for organizing TypeScript files and avoiding circular dependencies?

### Answer

**Key Strategies:**
1. **Co-locate types** - Keep types with implementation when possible
2. **Shared types folder** - For types used across modules
3. **Index files** - Clean exports and imports
4. **Avoid circular deps** - Extract shared types to common file
5. **Path mapping** - Use TypeScript path aliases

### Code Example

```typescript
// ✅ GOOD: Co-locate types with implementation
// user.service.ts
export interface User {
  id: number;
  name: string;
}

export class UserService {
  async getUser(id: number): Promise<User> {
    // ...
  }
}

// ✅ BETTER: Separate types file for shared types
// types/user.ts
export interface User {
  id: number;
  name: string;
}

export interface UserCreateInput {
  name: string;
  email: string;
}

// services/user.service.ts
import { User, UserCreateInput } from '@/types/user';

// Index Files for Clean Imports
// types/index.ts
export * from './user';
export * from './post';
export * from './common';

// Usage
import { User, Post, ApiResponse } from '@/types';

// ❌ WRONG: Circular dependencies
// file-a.ts
import { TypeB } from './file-b';
export interface TypeA {
  b: TypeB;
}

// file-b.ts
import { TypeA } from './file-a'; // Circular!
export interface TypeB {
  a: TypeA;
}

// ✅ CORRECT: Extract to shared file
// types.ts
export interface TypeA {
  b: TypeB;
}
export interface TypeB {
  a: TypeA;
}
```

### Resources
- [Project Structure Best Practices](https://khalilstemmler.com/articles/typescript-domain-driven-design/ddd-frontend/)

---

## Question 3: How Do You Optimize TypeScript Compilation Performance?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 7 minutes
**Companies:** Large monorepos (Meta, Google)

### Question
What are strategies for improving TypeScript compilation speed in large projects?

### Answer

**Key Optimizations:**
1. **Project References** - Split monorepo into composable projects
2. **skipLibCheck** - Skip type checking of .d.ts files
3. **Incremental** - Cache compilation results
4. **Type Inference** - Let TypeScript infer when safe
5. **Avoid type widening** - Use const assertions

### Code Example

```typescript
// 1. Type Inference vs Explicit Types
// ✅ GOOD: Let TypeScript infer simple types
const name = 'John'; // Inferred as string
const age = 30; // Inferred as number
const items = [1, 2, 3]; // Inferred as number[]

// ✅ BETTER: Explicit types for function parameters & returns
function processUser(user: User): UserDTO {
  return mapUserToDTO(user);
}

// ✅ BEST: Explicit for complex types that may change
const config: AppConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

// 2. Avoid Type Widening Issues
// ❌ WRONG: Type is widened
const status = 'pending'; // Type: string (too wide)

// ✅ CORRECT: Use const assertion
const status = 'pending' as const; // Type: 'pending'

// ✅ CORRECT: Use enum or const object
enum Status {
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

type StatusValue = typeof STATUS[keyof typeof STATUS];

// 3. Compiler Performance Tips
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  }
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "references": [
    { "path": "../core" }
  ]
}

// ✅ GOOD: Use skipLibCheck to speed up compilation
{
  "compilerOptions": {
    "skipLibCheck": true // Skip type checking of .d.ts files
  }
}

// ✅ GOOD: Incremental compilation
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

### Resources
- [Performance](https://github.com/microsoft/TypeScript/wiki/Performance)

---

## Question 4: How Do You Test Types in TypeScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 6 minutes
**Companies:** Stripe, Airbnb

### Question
How do you write type-level tests and create type-safe mocks in TypeScript?

### Answer

**Key Approaches:**
1. **tsd library** - Type-level testing
2. **jest.Mocked** - Type-safe mocks
3. **Partial mocks** - Incomplete test data
4. **Factory functions** - Generate test objects
5. **Type assertions** - Verify types compile correctly

### Code Example

```typescript
// 1. Testing Types with tsd
import { expectType, expectError } from 'tsd';

// Type-level tests
interface User {
  id: number;
  name: string;
}

function getUser(): User {
  return { id: 1, name: 'John' };
}

// Test that function returns correct type
expectType<User>(getUser());

// Test that certain usage causes type error
expectError(getUser().invalid);

// 2. Mock Types for Testing
import { jest } from '@jest/globals';

// ✅ GOOD: Type-safe mocks
interface UserService {
  getUser(id: number): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

const mockUserService: jest.Mocked<UserService> = {
  getUser: jest.fn(),
  deleteUser: jest.fn(),
};

// Type-safe usage
mockUserService.getUser.mockResolvedValue({
  id: 1,
  name: 'John',
});

// ✅ GOOD: Partial mocks
const partialUser: Partial<User> = {
  name: 'John',
  // id is optional
};

// ✅ GOOD: Factory functions for test data
function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}

// Usage
const user = createMockUser({ name: 'Custom Name' });
```

### Resources
- [tsd - Test TypeScript definitions](https://github.com/SamVerschueren/tsd)

---

## Question 5: How Do You Migrate from JavaScript to TypeScript?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All companies with legacy codebases

### Question
What is the recommended strategy for gradually migrating a JavaScript codebase to TypeScript?

### Answer

**Migration Steps:**
1. **Enable allowJs** - Allow JS and TS files together
2. **Add JSDoc types** - Type existing JS files
3. **Enable checkJs** - Find type issues
4. **Rename .js → .ts** - Gradually convert files
5. **Increase strictness** - Add strict flags one by one

### Code Example

```typescript
// Step 1: Enable TypeScript with allowJs
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false, // Don't type-check JS files yet
    "outDir": "./dist"
  }
}

// Step 2: Add JSDoc types to existing JS files
// user.js
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 */

/**
 * @param {number} id
 * @returns {Promise<User>}
 */
export async function getUser(id) {
  // ...
}

// Step 3: Enable checkJs to find issues
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true // Now check JS files
  }
}

// Step 4: Rename files gradually .js → .ts
// user.ts
interface User {
  id: number;
  name: string;
}

export async function getUser(id: number): Promise<User> {
  // ...
}

// Step 5: Increase strictness gradually
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true, // Enable one at a time
    // ... add more strict flags gradually
  }
}

// Advanced tsconfig.json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Module Resolution
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    "downlevelIteration": true,

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Performance
    "skipLibCheck": true,
    "incremental": true,

    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### Resources
- [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)

---

## Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Using any everywhere
function process(data: any): any {
  return data.value;
}

// ✅ CORRECT: Use proper types
function process<T extends { value: string }>(data: T): string {
  return data.value;
}

// ❌ WRONG: Type assertions everywhere
const value = data as string as number; // Double assertion!

// ✅ CORRECT: Use type guards
if (typeof data === 'number') {
  const value = data; // Properly narrowed
}

// ❌ WRONG: Ignoring errors with @ts-ignore
// @ts-ignore
const result = someFunction();

// ✅ CORRECT: Fix the underlying issue or use proper types
const result = someFunction() as ExpectedType;

// ❌ WRONG: Non-null assertions everywhere
const value = possiblyNull!.property!.method!();

// ✅ CORRECT: Handle null cases
if (possiblyNull?.property) {
  const value = possiblyNull.property.method();
}

// ❌ WRONG: Mutation of readonly types
interface Config {
  readonly apiUrl: string;
}

const config: Config = { apiUrl: 'https://api.example.com' };
(config as any).apiUrl = 'changed'; // Defeats readonly

// ✅ CORRECT: Create new object
const newConfig: Config = {
  ...config,
  apiUrl: 'https://new-api.example.com',
};

// ❌ WRONG: Using enums when const objects work better
enum Color {
  Red = '#ff0000',
  Green = '#00ff00',
  Blue = '#0000ff',
}

// ✅ BETTER: Use const object (tree-shakeable)
const COLOR = {
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
} as const;

type Color = typeof COLOR[keyof typeof COLOR];
```

## Additional Best Practices

```typescript
// 1. Use readonly for immutable data
interface User {
  readonly id: number;
  readonly createdAt: Date;
  name: string; // Mutable
}

// 2. Prefer interfaces over type aliases for objects
// ✅ GOOD: Interface (better for extension)
interface User {
  name: string;
}

interface Admin extends User {
  role: 'admin';
}

// ✅ GOOD: Type for unions, intersections, utilities
type Status = 'active' | 'inactive';
type UserWithStatus = User & { status: Status };

// 3. Use discriminated unions for state management
type LoadingState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// 4. Avoid deep nesting with type aliases
// ❌ WRONG: Deep nesting
type NestedType = {
  level1: {
    level2: {
      level3: {
        value: string;
      };
    };
  };
};

// ✅ CORRECT: Break into smaller types
type Level3 = { value: string };
type Level2 = { level3: Level3 };
type Level1 = { level2: Level2 };
type FlatType = { level1: Level1 };

// 5. Use utility types effectively
type UserKeys = keyof User; // Get all keys
type UserName = Pick<User, 'name'>; // Pick specific keys
type UserWithoutId = Omit<User, 'id'>; // Omit keys
type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<PartialUser>; // All properties required
type ReadonlyUser = Readonly<User>; // All properties readonly
```

### Resources
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Effective TypeScript Book](https://effectivetypescript.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)

---

**[← Back to TypeScript README](./README.md)**

**Progress:** 5 of 5 advanced practices completed ✅
