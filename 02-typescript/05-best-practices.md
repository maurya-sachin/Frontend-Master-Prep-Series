# TypeScript Best Practices

> Production-ready TypeScript: type safety, avoiding `any`, type guards, strict mode, and patterns for maintainable code

---

## Question 1: What Are Better Alternatives to Using `any`?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 6 minutes
**Companies:** All TypeScript companies

### Question
What are better alternatives to using `any` in TypeScript? Why is `any` problematic and how can you avoid it?

### Answer

**Key Points:**
1. **unknown** - Safer alternative, requires type checking
2. **Generics** - Maintain type safety while being flexible
3. **Union Types** - Specific set of possible types
4. **Type Guards** - Runtime type checking
5. **never use any** - Defeats the purpose of TypeScript

### Code Example

```typescript
// ❌ WRONG: Using any
function processData(data: any) {
  return data.value.toUpperCase(); // No type safety
}
processData(123); // Runtime error!

// ✅ CORRECT: Use unknown + type guards
function processDataSafe(data: unknown) {
  if (
    typeof data === 'object' &&
    data !== null &&
    'value' in data &&
    typeof (data as { value: unknown }).value === 'string'
  ) {
    return (data as { value: string }).value.toUpperCase();
  }
  throw new Error('Invalid data');
}

// ✅ CORRECT: Use generics
function identity<T>(arg: T): T {
  return arg;
}

// ✅ CORRECT: Use union types
function processValue(value: string | number | boolean) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value;
}

// ✅ CORRECT: Type guards
interface User {
  name: string;
  email: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    'email' in obj &&
    typeof obj.email === 'string'
  );
}

function greetUser(data: unknown) {
  if (isUser(data)) {
    console.log(`Hello, ${data.name}`); // Type-safe!
  }
}
```

### Resources
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## Question 2: What is Strict Mode and Why Should You Enable It?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** All modern TypeScript projects

### Question
What is TypeScript strict mode? What flags does it enable and why is it important?

### Answer

**Strict mode** enables all strict type checking options in TypeScript, catching more potential bugs at compile time.

**Key Flags Enabled:**
1. **noImplicitAny** - Error on implicit any types
2. **strictNullChecks** - null/undefined must be explicitly typed
3. **strictFunctionTypes** - Stricter function type checking
4. **strictPropertyInitialization** - Class properties must be initialized
5. **noImplicitThis** - Error when this has implicit any type

### Code Example

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // Enables all strict checks
  }
}

// 1. noImplicitAny
// ❌ Error with strict mode
function process(data) {  // Parameter 'data' implicitly has an 'any' type
  return data;
}

// ✅ Explicit type
function process(data: string) {
  return data;
}

// 2. strictNullChecks
// ❌ Error with strict mode
let name: string = null;  // Type 'null' is not assignable to type 'string'

// ✅ Explicit nullable
let name: string | null = null;
name = 'John'; // OK

// 3. strictPropertyInitialization
class User {
  // ❌ Error: Property 'name' has no initializer
  name: string;

  // ✅ Initialize in constructor
  email: string;

  // ✅ Or use definite assignment assertion (use carefully)
  id!: number;

  constructor(email: string) {
    this.email = email;
  }
}

// 4. noImplicitThis
const obj = {
  name: 'John',
  // ❌ Error: 'this' implicitly has type 'any'
  greet() {
    setTimeout(function() {
      console.log(this.name);
    }, 1000);
  },

  // ✅ Use arrow function
  greetCorrect() {
    setTimeout(() => {
      console.log(this.name);
    }, 1000);
  }
};
```

### Resources
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

## Question 3: How Do You Create Effective Type Guards?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6 minutes
**Companies:** Meta, Airbnb, Stripe

### Question
How do you create type guards in TypeScript? What are the different approaches?

### Answer

**Type guards** are functions that perform runtime checks to narrow types within a conditional block.

**Approaches:**
1. **typeof guards** - For primitives
2. **instanceof guards** - For class instances
3. **in operator** - Check for property existence
4. **Custom type predicates** - User-defined guards
5. **Discriminated unions** - Type-safe pattern matching

### Code Example

```typescript
// 1. typeof GUARDS (primitives)
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // value is string
  }
  return value.toFixed(2); // value is number
}

// 2. instanceof GUARDS (classes)
class Dog {
  bark() { return 'Woof!'; }
}

class Cat {
  meow() { return 'Meow!'; }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    return animal.bark(); // animal is Dog
  }
  return animal.meow(); // animal is Cat
}

// 3. in OPERATOR
interface Car {
  drive: () => void;
}

interface Boat {
  sail: () => void;
}

function operate(vehicle: Car | Boat) {
  if ('drive' in vehicle) {
    vehicle.drive(); // vehicle is Car
  } else {
    vehicle.sail(); // vehicle is Boat
  }
}

// 4. CUSTOM TYPE PREDICATES
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'number' &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    'email' in obj &&
    typeof obj.email === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    console.log(data.email); // data is User
  }
}

// 5. DISCRIMINATED UNIONS
interface Success {
  type: 'success';
  data: any;
}

interface Failure {
  type: 'error';
  error: Error;
}

type Result = Success | Failure;

function handleResult(result: Result) {
  if (result.type === 'success') {
    console.log(result.data); // result is Success
  } else {
    console.error(result.error); // result is Failure
  }
}
```

### Resources
- [Type Guards and Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

## Question 4: When Should You Use Type Assertions vs Type Guards?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 5 minutes
**Companies:** Google, Microsoft

### Question
What's the difference between type assertions and type guards? When should you use each?

### Answer

**Type Assertions** - Tell TypeScript what type you know it is (compile-time only)
**Type Guards** - Runtime checks that narrow types

**Key Points:**
1. **Type assertions** bypass type checking (use sparingly)
2. **Type guards** are type-safe and runtime verified
3. **Prefer type guards** for safety
4. **Use assertions** only when you know more than TypeScript
5. **Never use** assertions to force incompatible types

### Code Example

```typescript
// TYPE ASSERTIONS (as keyword)
let value: unknown = 'hello';

// ❌ DANGEROUS: No runtime check
let str1 = value as string;
str1.toUpperCase(); // Works, but risky

// ❌ VERY DANGEROUS: Forcing incompatible types
let num = value as any as number; // Compiles but wrong!

// ✅ SAFE: When you know from context
const element = document.getElementById('myInput') as HTMLInputElement;
element.value = 'text'; // Safe if you're sure it's an input

// TYPE GUARDS (runtime checks)
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

if (isString(value)) {
  let str2 = value; // Type is narrowed to string
  str2.toUpperCase(); // Type-safe!
}

// WHEN TO USE ASSERTIONS:
// 1. DOM elements (you know the type)
const input = document.querySelector('.email-input') as HTMLInputElement;

// 2. Third-party libraries with incomplete types
const config = JSON.parse(jsonString) as Config;

// 3. Type narrowing when TypeScript can't infer
interface Cat { meow: () => void; }
interface Dog { bark: () => void; }

const animals: (Cat | Dog)[] = getAnimals();
const cats = animals.filter((a): a is Cat => 'meow' in a);

// WHEN TO USE GUARDS:
// 1. Runtime data validation
function processApiResponse(data: unknown) {
  if (isValidUser(data)) {
    // Type-safe processing
    console.log(data.email);
  }
}

// 2. Discriminated unions
type Shape = Circle | Square;

function getArea(shape: Shape) {
  if (shape.kind === 'circle') { // Type guard
    return Math.PI * shape.radius ** 2;
  }
  return shape.size ** 2;
}
```

### Resources
- [Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)

---

## Question 5: How Do You Handle Errors in TypeScript?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 6 minutes
**Companies:** All companies

### Question
What are best practices for error handling in TypeScript? How do you type errors properly?

### Answer

**Key Points:**
1. **unknown in catch** - TypeScript 4.4+ catches are unknown by default
2. **Custom Error Classes** - Create typed error hierarchies
3. **Result Type** - Type-safe alternative to throwing
4. **Discriminated Unions** - Type-safe error states
5. **Never throw non-Error** - Always throw Error instances

### Code Example

```typescript
// 1. TYPING CATCH BLOCKS
try {
  riskyOperation();
} catch (error) {
  // error is unknown (TypeScript 4.4+)
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// 2. CUSTOM ERROR CLASSES
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

function validateUser(user: unknown) {
  if (!isUser(user)) {
    throw new ValidationError(
      'Invalid user data',
      'user',
      user
    );
  }
}

try {
  validateUser(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`${error.field}: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.error(`HTTP ${error.statusCode}: ${error.message}`);
  }
}

// 3. RESULT TYPE (functional approach)
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return {
      success: false,
      error: new Error('Division by zero')
    };
  }
  return {
    success: true,
    value: a / b
  };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.value); // Type-safe access
} else {
  console.error(result.error);
}

// 4. ASYNC ERROR HANDLING
async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return {
        success: false,
        error: new NetworkError(
          'Failed to fetch user',
          response.status
        )
      };
    }
    const user = await response.json();
    return { success: true, value: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error
        ? error
        : new Error('Unknown error')
    };
  }
}

// 5. STATE MANAGEMENT WITH ERRORS
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderUser(state: FetchState<User>) {
  switch (state.status) {
    case 'idle':
      return 'Click to load';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Hello, ${state.data.name}`;
    case 'error':
      return `Error: ${state.error.message}`;
  }
}
```

### Resources
- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables)

---

## Questions 6-15: Advanced Best Practices

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐⭐
**Consolidated TypeScript best practices**

### Q6-8: Naming Conventions & Code Organization

```typescript
// Q6: Naming Conventions
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

// Q7: File Organization
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

// Q8: Index Files for Clean Imports
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

### Q9-11: Performance & Compiler Optimization

```typescript
// Q9: Type Inference vs Explicit Types
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

// Q10: Avoid Type Widening Issues
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

// Q11: Compiler Performance Tips
// ✅ GOOD: Use project references for large codebases
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

### Q12-13: Testing & Type Safety

```typescript
// Q12: Testing Types with Jest
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

// Q13: Mock Types for Testing
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

### Q14-15: Advanced Configuration & Migration

```typescript
// Q14: Advanced tsconfig.json
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

// Q15: Gradual Migration from JavaScript
// Step 1: Enable TypeScript with allowJs
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
```

### Anti-Patterns to Avoid

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

### Additional Best Practices

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

**Progress:** 15 of 15 TypeScript best practices completed ✅
