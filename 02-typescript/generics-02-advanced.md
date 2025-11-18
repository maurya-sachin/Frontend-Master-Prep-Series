# TypeScript Generics - Advanced

> Advanced generics: mapped types, utility types, and real-world patterns

---

## Question 4: What Are Mapped Types in TypeScript?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Meta, Microsoft, Airbnb

### Question
Explain mapped types in TypeScript. How do they work and what are common use cases?

### Answer

**Mapped types** allow you to create new types by transforming properties of an existing type. They iterate over the keys of a type and apply transformations.

**Key Points:**

1. **Syntax** - `{ [K in keyof T]: Transformation }`
2. **Transformation** - Modify property types, add modifiers (readonly, optional)
3. **Built-in Utilities** - `Partial`, `Required`, `Readonly`, `Pick` use mapped types
4. **Key Remapping** - Change property names with `as`
5. **Common Use** - DTOs, API responses, form states

### Code Example

```typescript
// 1. BASIC MAPPED TYPE
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; }

const user: ReadonlyUser = { id: 1, name: 'John' };
// user.name = 'Jane';  // ❌ Error: readonly

// 2. MAKING PROPERTIES OPTIONAL
type Partial<T> = {
  [K in keyof T]?: T[K];
};

type PartialUser = Partial<User>;
// { id?: number; name?: string; }

const partialUser: PartialUser = { name: 'John' };  // ✅ id is optional

// 3. MAKING PROPERTIES REQUIRED
type Required<T> = {
  [K in keyof T]-?: T[K];  // -? removes optional modifier
};

interface Config {
  host?: string;
  port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number; }

// 4. NULLABLE TO NON-NULLABLE
type NonNullable<T> = {
  [K in keyof T]: Exclude<T[K], null | undefined>;
};

interface Data {
  name: string | null;
  age: number | undefined;
  email: string;
}

type CleanData = NonNullable<Data>;
// { name: string; age: number; email: string; }

// 5. KEY REMAPPING (TypeScript 4.1+)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 6. REAL-WORLD: API RESPONSE TYPES
type ApiResponse<T> = {
  [K in keyof T]: {
    data: T[K];
    loading: boolean;
    error: Error | null;
  };
};

interface Entities {
  users: User[];
  posts: Post[];
}

type EntitiesState = ApiResponse<Entities>;
// {
//   users: { data: User[]; loading: boolean; error: Error | null; };
//   posts: { data: Post[]; loading: boolean; error: Error | null; };
// }

// 7. CONDITIONAL PROPERTY TRANSFORMATION
type StringifyProperties<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : string;
};

interface Mixed {
  name: string;
  age: number;
  active: boolean;
}

type StringifiedMixed = StringifyProperties<Mixed>;
// { name: string; age: string; active: string; }

// 8. PICK SPECIFIC PROPERTIES
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type UserNameAndEmail = Pick<User, 'name' | 'email'>;
// { name: string; email: string; }

// 9. OMIT SPECIFIC PROPERTIES
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutId = Omit<User, 'id'>;
// { name: string; email: string; }

// 10. REAL-WORLD: FORM STATE
interface FormFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormState<T> = {
  [K in keyof T]: {
    value: T[K];
    error: string | null;
    touched: boolean;
  };
};

type MyFormState = FormState<FormFields>;
// {
//   username: { value: string; error: string | null; touched: boolean; };
//   email: { value: string; error: string | null; touched: boolean; };
//   ...
// }

const formState: MyFormState = {
  username: { value: '', error: null, touched: false },
  email: { value: '', error: null, touched: false },
  password: { value: '', error: null, touched: false },
  confirmPassword: { value: '', error: null, touched: false }
};

// 11. REMOVE SPECIFIC TYPE FROM UNION
type Exclude<T, U> = T extends U ? never : T;

type PrimitiveTypes = string | number | boolean | null | undefined;
type NonNullableTypes = Exclude<PrimitiveTypes, null | undefined>;
// string | number | boolean

// 12. EXTRACT SPECIFIC TYPE FROM UNION
type Extract<T, U> = T extends U ? T : U;

type StringAndNumber = Extract<PrimitiveTypes, string | number>;
// string | number
```

### Common Mistakes

```typescript
// ❌ WRONG: Modifying the original type
interface User {
  id: number;
  name: string;
}

// This doesn't work - you can't modify interface in place
// User = Readonly<User>;  // Error

// ✅ CORRECT: Create new type
type ReadonlyUser = Readonly<User>;

// ❌ WRONG: Not using keyof
type BadMap<T> = {
  [K in T]: string;  // Error: T is not assignable to string | number | symbol
};

// ✅ CORRECT: Use keyof T
type GoodMap<T> = {
  [K in keyof T]: string;
};
```

### Follow-up Questions
1. How do you combine mapped types with conditional types?
2. What's the difference between `Partial<T>` and `Partial<T> & Required<Pick<T, 'id'>>`?
3. How would you create a `DeepPartial<T>` type?

### Resources
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Key Remapping in Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)

---

## Question 5: Explain TypeScript Utility Types

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** All major companies

### Question
What are TypeScript's built-in utility types? Explain the most commonly used ones with examples.

### Answer

**Utility types** are built-in TypeScript types that help with common type transformations. They're implemented using mapped types and conditional types.

**Key Utility Types:**

1. **Partial<T>** - All properties optional
2. **Required<T>** - All properties required
3. **Readonly<T>** - All properties readonly
4. **Pick<T, K>** - Select subset of properties
5. **Omit<T, K>** - Exclude properties
6. **Record<K, T>** - Create object type with keys K and values T
7. **Exclude<T, U>** - Exclude types from union
8. **Extract<T, U>** - Extract types from union
9. **NonNullable<T>** - Remove null and undefined
10. **ReturnType<T>** - Extract function return type

### Code Example

```typescript
// 1. Partial<T> - Make all properties optional
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

function updateTodo(todo: Todo, updates: Partial<Todo>): Todo {
  return { ...todo, ...updates };
}

const todo: Todo = {
  title: 'Learn TypeScript',
  description: 'Study utility types',
  completed: false
};

const updated = updateTodo(todo, { completed: true });
// Only need to provide properties we're updating

// 2. Required<T> - Make all properties required
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}

const requiredConfig: Required<Config> = {
  host: 'localhost',
  port: 3000,
  timeout: 5000
  // All properties must be provided
};

// 3. Readonly<T> - Make all properties readonly
interface Point {
  x: number;
  y: number;
}

const point: Readonly<Point> = { x: 10, y: 20 };
// point.x = 5;  // ❌ Error: readonly

// 4. Pick<T, K> - Select specific properties
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type UserPreview = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string; }

// Perfect for API responses where you don't want to expose sensitive data
function getUserPreview(user: User): UserPreview {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

// 5. Omit<T, K> - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;
// { id: number; name: string; email: string; createdAt: Date; }

// Great for creating DTOs
type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; password: string; }

// 6. Record<K, T> - Create object type
type Role = 'admin' | 'user' | 'guest';
type Permissions = 'read' | 'write' | 'delete';

type RolePermissions = Record<Role, Permissions[]>;

const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};

// Another example: Cache
type Cache = Record<string, any>;

const cache: Cache = {
  'user:1': { name: 'John' },
  'user:2': { name: 'Jane' },
  'config': { theme: 'dark' }
};

// 7. Exclude<T, U> - Remove types from union
type AllTypes = string | number | boolean | null | undefined;
type PrimitiveTypes = Exclude<AllTypes, null | undefined>;
// string | number | boolean

type EventType = 'click' | 'scroll' | 'mousemove' | 'keypress';
type ClickEvent = Exclude<EventType, 'scroll' | 'mousemove'>;
// 'click' | 'keypress'

// 8. Extract<T, U> - Extract types from union
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; sideLength: number }
  | { kind: 'triangle'; base: number; height: number };

type CircleOrSquare = Extract<Shape, { kind: 'circle' | 'square' }>;
// { kind: 'circle'; radius: number } | { kind: 'square'; sideLength: number }

// 9. NonNullable<T> - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // string

function processValue(value: MaybeString): NonNullable<MaybeString> {
  if (value === null || value === undefined) {
    return 'default';
  }
  return value;
}

// 10. ReturnType<T> - Extract function return type
function createUser() {
  return {
    id: 1,
    name: 'John',
    email: 'john@example.com'
  };
}

type User = ReturnType<typeof createUser>;
// { id: number; name: string; email: string; }

// 11. Parameters<T> - Extract function parameter types
function greet(name: string, age: number) {
  return `Hello ${name}, you are ${age} years old`;
}

type GreetParams = Parameters<typeof greet>;
// [name: string, age: number]

function callGreet(params: GreetParams) {
  return greet(...params);
}

// 12. REAL-WORLD COMBINATION
interface ApiUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Creating user (exclude auto-generated fields)
type CreateUser = Omit<ApiUser, 'id' | 'createdAt' | 'updatedAt'>;

// Updating user (all fields optional, exclude id)
type UpdateUser = Partial<Omit<ApiUser, 'id' | 'createdAt' | 'updatedAt'>>;

// Public user (exclude sensitive data)
type PublicUser = Omit<ApiUser, 'password'>;

// User state in frontend
type UserState = Readonly<PublicUser>;

const createUserDto: CreateUser = {
  username: 'john',
  email: 'john@example.com',
  password: 'secret',
  role: 'user'
};

const updateUserDto: UpdateUser = {
  email: 'newemail@example.com'
  // Only updating email, everything else optional
};
```

### Common Mistakes

```typescript
// ❌ WRONG: Using Partial when you need specific optionals
interface User {
  id: number;
  name: string;
  email: string;
}

type UpdateUser = Partial<User>;  // Makes ALL optional, including id

// ✅ CORRECT: Use Omit + Partial for specific behavior
type UpdateUserCorrect = Partial<Omit<User, 'id'>> & Pick<User, 'id'>;
// id is required, name and email are optional

// ❌ WRONG: Trying to use utility types on unions incorrectly
type Status = 'pending' | 'success' | 'error';
type PickStatus = Pick<Status, 'pending'>;  // Error: Status is not an object

// ✅ CORRECT: Use Extract for unions
type PickStatusCorrect = Extract<Status, 'pending'>;
```

### Follow-up Questions
1. How would you implement `Partial<T>` from scratch?
2. When would you use `Record<K, T>` vs a regular object type?
3. How do you combine multiple utility types for complex transformations?

### Resources
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---

## Questions 6-15: Advanced Generic Patterns

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Consolidated advanced generics coverage**

### Q6-8: Generic Constraints & Conditional Types

```typescript
// Generic constraints with extends
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Multiple generic constraints
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// Conditional types with generics
type ArrayOrSingle<T> = T extends any[] ? T : T[];
type Result1 = ArrayOrSingle<number>; // number[]
type Result2 = ArrayOrSingle<number[]>; // number[]

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type StrArrOrNumArr = ToArray<string | number>;
// string[] | number[] (distributed)
```

### Q9-11: Generic Utility Type Construction

```typescript
// Custom Readonly deep
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// Recursive Pick
type DeepPick<T, K extends string> = K extends `${infer K1}.${infer K2}`
  ? K1 extends keyof T
    ? { [P in K1]: DeepPick<T[K1], K2> }
    : never
  : K extends keyof T
  ? { [P in K]: T[P] }
  : never;

// Mutable (opposite of Readonly)
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Optional to Required
type OptionalToRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
```

### Q12-15: Real-World Generic Patterns

```typescript
// Generic API Response
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}

// Generic Repository Pattern
interface Repository<T> {
  find(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class UserRepository implements Repository<User> {
  async find(id: string) { /* ... */ }
  async findAll() { /* ... */ }
  async create(item: Omit<User, 'id'>) { /* ... */ }
  async update(id: string, item: Partial<User>) { /* ... */ }
  async delete(id: string) { /* ... */ }
}

// Generic State Management
type Action<T extends string, P = void> = P extends void
  ? { type: T }
  : { type: T; payload: P };

type Actions =
  | Action<'INCREMENT'>
  | Action<'DECREMENT'>
  | Action<'SET_VALUE', number>;

function reducer(state: number, action: Actions): number {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'SET_VALUE':
      return action.payload; // Type-safe!
    default:
      return state;
  }
}
```

### Resources
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Advanced Generic Patterns](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

---

**[← Back to TypeScript README](./README.md)**

**Progress:** 15 of 15 generics questions completed ✅
