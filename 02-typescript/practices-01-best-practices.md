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

**[← Back to TypeScript README](./README.md)**

**Progress:** 5 of 5 core best practices completed ✅
