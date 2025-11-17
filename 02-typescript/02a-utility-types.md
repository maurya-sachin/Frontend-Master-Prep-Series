# TypeScript Utility Types

> Master built-in utility types: Partial, Required, Pick, Omit, Record, and more

---

## Question 1: What are mapped types and how do you create them?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-12 minutes
**Companies:** Microsoft, Google, Meta, Airbnb

### Question
Explain mapped types in TypeScript. How do you create custom mapped types? What are the built-in utility types based on mapped types?

### Answer

Mapped types create new types by transforming properties of an existing type.

1. **Basic Syntax**
   - `[K in keyof T]` - Iterate over keys
   - Transform property types
   - Add/remove modifiers (readonly, optional)

2. **Key Remapping**
   - `as` clause to rename keys
   - Filter keys with `never`
   - Template literal types in keys

3. **Built-in Mapped Types**
   - `Partial<T>` - Makes all properties optional
   - `Required<T>` - Makes all properties required
   - `Readonly<T>` - Makes all properties readonly
   - `Record<K, T>` - Creates type with specific keys

4. **Use Cases**
   - API response transformations
   - Form state management
   - Deep readonly/partial types
   - Property name transformations

### Code Example

```typescript
// BASIC MAPPED TYPE
type User = {
  id: number;
  name: string;
  email: string;
};

// Make all properties optional
type PartialUser = {
  [K in keyof User]?: User[K];
};

// Result:
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }

// BUILT-IN PARTIAL (equivalent to above)
type PartialUser2 = Partial<User>;

// READONLY MAPPED TYPE
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// Equivalent to Readonly<User>

// NULLABLE MAPPED TYPE
type NullableUser = {
  [K in keyof User]: User[K] | null;
};

// Result:
// {
//   id: number | null;
//   name: string | null;
//   email: string | null;
// }

// CUSTOM MAPPED TYPE: Add "Loading" suffix
type Loading<T> = {
  [K in keyof T as `${K & string}Loading`]: boolean;
};

type UserLoading = Loading<User>;
// Result:
// {
//   idLoading: boolean;
//   nameLoading: boolean;
//   emailLoading: boolean;
// }

// FILTERING PROPERTIES
type RemoveId<T> = {
  [K in keyof T as K extends 'id' ? never : K]: T[K];
};

type UserWithoutId = RemoveId<User>;
// Result:
// {
//   name: string;
//   email: string;
// }

// GETTERS TYPE
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// Result:
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
// }

// IMPLEMENTATION
const userGetters: UserGetters = {
  getId: () => 1,
  getName: () => 'John',
  getEmail: () => 'john@example.com'
};

// DEEP PARTIAL
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

type NestedUser = {
  id: number;
  profile: {
    name: string;
    address: {
      street: string;
      city: string;
    };
  };
};

type PartialNestedUser = DeepPartial<NestedUser>;
// All properties at all levels are optional

// REAL-WORLD: API Response Transformer
type APIResponse<T> = {
  data: T;
  status: 'success' | 'error';
  timestamp: number;
};

type LoadingState<T> = {
  [K in keyof T]: {
    value: T[K];
    loading: boolean;
    error: string | null;
  };
};

type UserLoadingState = LoadingState<User>;
// Result:
// {
//   id: { value: number; loading: boolean; error: string | null };
//   name: { value: string; loading: boolean; error: string | null };
//   email: { value: string; loading: boolean; error: string | null };
// }

// PICK ONLY SPECIFIC TYPES
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
};

type ProductStrings = PickByType<Product, string>;
// Result: { name: string; description: string }

type ProductNumbers = PickByType<Product, number>;
// Result: { id: number; price: number }

// TRANSFORM PROPERTY TYPES
type Stringify<T> = {
  [K in keyof T]: string;
};

type StringUser = Stringify<User>;
// Result:
// {
//   id: string;
//   name: string;
//   email: string;
// }

// REMOVE READONLY
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type ReadonlyUser2 = {
  readonly id: number;
  readonly name: string;
};

type MutableUser = Mutable<ReadonlyUser2>;
// Removes readonly modifier

// REMOVE OPTIONAL
type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

type OptionalUser = {
  id?: number;
  name?: string;
};

type RequiredUser = Concrete<OptionalUser>;
// Removes optional modifier
```

### Common Mistakes

❌ **Mistake:** Not using `& string` for template literals
```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K>}`]: () => T[K];
  // ❌ Error: K might be symbol
};
```

✅ **Correct:** Use `K & string`
```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
  // ✅ Works
};
```

### Follow-up Questions

- "How do you create a deep readonly type?"
- "What's the difference between Partial and DeepPartial?"
- "How do you filter properties by type?"
- "Can you explain the '-?' and '-readonly' syntax?"

### Resources

- [TypeScript Docs: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Advanced Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)

---


## Question 2: What are conditional types?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Time:** 12-15 minutes
**Companies:** Microsoft, Google, Meta

### Question
Explain conditional types in TypeScript. How do you use `infer`? What are distributive conditional types?

### Answer

Conditional types select types based on conditions, similar to ternary operators.

1. **Basic Syntax**
   - `T extends U ? X : Y`
   - Type-level if-else
   - Checks type compatibility

2. **Infer Keyword**
   - Extract types from complex types
   - Used in conditional types
   - Common in utility types

3. **Distributive Conditional Types**
   - Automatically distribute over union types
   - `T extends U ? X : Y` where T is union
   - Each union member processed separately

4. **Use Cases**
   - Function return type extraction
   - Promise unwrapping
   - Array element type extraction
   - Type narrowing

### Code Example

```typescript
// BASIC CONDITIONAL TYPE
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// NESTED CONDITIONAL TYPES
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T1 = TypeName<string>;    // "string"
type T2 = TypeName<number>;    // "number"
type T3 = TypeName<() => void>; // "function"

// INFER KEYWORD
// Extract return type of function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'John' };
}

type User = ReturnType<typeof getUser>;
// Result: { id: number; name: string }

// Extract parameters type
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createPost(title: string, content: string, published: boolean) {
  return { title, content, published };
}

type CreatePostParams = Parameters<typeof createPost>;
// Result: [string, string, boolean]

// UNWRAP PROMISE
type Awaited<T> = T extends Promise<infer U> ? U : T;

type P1 = Awaited<Promise<string>>;  // string
type P2 = Awaited<string>;           // string

// ARRAY ELEMENT TYPE
type ElementType<T> = T extends (infer U)[] ? U : T;

type Arr1 = ElementType<string[]>;   // string
type Arr2 = ElementType<number[]>;   // number
type Arr3 = ElementType<string>;     // string (not array)

// DEEP AWAITED (recursive)
type DeepAwaited<T> =
  T extends Promise<infer U>
    ? DeepAwaited<U>
    : T;

type P3 = DeepAwaited<Promise<Promise<string>>>;  // string

// DISTRIBUTIVE CONDITIONAL TYPES
type ToArray<T> = T extends any ? T[] : never;

type T4 = ToArray<string | number>;
// Result: string[] | number[] (distributed!)

// NON-DISTRIBUTIVE (using [])
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type T5 = ToArrayNonDist<string | number>;
// Result: (string | number)[] (NOT distributed)

// EXCLUDE TYPES
type MyExclude<T, U> = T extends U ? never : T;

type T6 = MyExclude<'a' | 'b' | 'c', 'a'>;
// Result: 'b' | 'c'

// EXTRACT TYPES
type MyExtract<T, U> = T extends U ? T : never;

type T7 = MyExtract<'a' | 'b' | 'c', 'a' | 'b'>;
// Result: 'a' | 'b'

// NON-NULLABLE
type NonNullable<T> = T extends null | undefined ? never : T;

type T8 = NonNullable<string | number | null | undefined>;
// Result: string | number

// FUNCTION OVERLOAD HANDLING
type LastParameter<T extends (...args: any) => any> =
  T extends (...args: [...infer _, infer Last]) => any
    ? Last
    : never;

function example(a: string, b: number, c: boolean) {}

type LastParam = LastParameter<typeof example>;
// Result: boolean

// OBJECT KEY TYPE EXTRACTION
type GetFieldType<T, K extends string> =
  K extends keyof T ? T[K] : never;

type User2 = {
  id: number;
  name: string;
};

type UserName = GetFieldType<User2, 'name'>;  // string
type UserId = GetFieldType<User2, 'id'>;      // number
type Invalid = GetFieldType<User2, 'age'>;    // never

// FLATTEN NESTED ARRAYS
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

type Deep = Flatten<string[][][]>;  // string

// REAL-WORLD: API RESPONSE TYPE INFERENCE
type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

async function fetchUser() {
  return { id: 1, name: 'John', email: 'john@example.com' };
}

type FetchedUser = AsyncReturnType<typeof fetchUser>;
// Result: { id: number; name: string; email: string }

// COMPONENT PROPS EXTRACTION
type ComponentProps<T> =
  T extends React.ComponentType<infer P> ? P : never;

function Button(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

type ButtonProps = ComponentProps<typeof Button>;
// Result: { label: string; onClick: () => void }

// CONDITIONAL DEEP TYPES
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type Config = {
  api: {
    url: string;
    timeout: number;
  };
  features: string[];
};

type ReadonlyConfig = DeepReadonly<Config>;
// All nested properties are readonly

// TUPLE TO UNION
type TupleToUnion<T extends readonly any[]> =
  T[number];

type Tuple = ['a', 'b', 'c'];
type Union = TupleToUnion<Tuple>;  // 'a' | 'b' | 'c'

// UNION TO INTERSECTION (advanced)
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

type U1 = { a: string } | { b: number };
type I1 = UnionToIntersection<U1>;
// Result: { a: string } & { b: number }
```

### Distributive vs Non-Distributive

```typescript
// Distributive (default for naked type parameters)
type Dist<T> = T extends any ? T[] : never;
type Result1 = Dist<string | number>;
// Result: string[] | number[]
// Process: (string extends any ? string[] : never) | (number extends any ? number[] : never)

// Non-distributive (using [T] or tuple)
type NonDist<T> = [T] extends [any] ? T[] : never;
type Result2 = NonDist<string | number>;
// Result: (string | number)[]
// Process: [string | number] extends [any] ? (string | number)[] : never
```

### Common Mistakes

❌ **Mistake:** Forgetting `infer` creates new type variable
```typescript
type ReturnType<T> = T extends (...args: any[]) => R ? R : never;
// ❌ Error: R is not defined
```

✅ **Correct:** Use `infer` keyword
```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// ✅ Works
```

### Follow-up Questions

- "What's the difference between distributive and non-distributive conditional types?"
- "How do you prevent distribution in conditional types?"
- "Can you explain how UnionToIntersection works?"
- "What are the limitations of `infer`?"

### Resources

- [TypeScript Docs: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Advanced Type Inference](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)

---


## Question 3: What are utility types and how do you use them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 8-10 minutes
**Companies:** Microsoft, Google, Meta, Amazon, Netflix

### Question
Explain TypeScript's built-in utility types. When should you use Partial, Pick, Omit, Record, etc.?

### Answer

Utility types are built-in generic types that perform common type transformations.

1. **Property Transformation**
   - `Partial<T>` - All optional
   - `Required<T>` - All required
   - `Readonly<T>` - All readonly

2. **Property Selection**
   - `Pick<T, K>` - Select properties
   - `Omit<T, K>` - Exclude properties

3. **Type Construction**
   - `Record<K, T>` - Create object type
   - `Exclude<T, U>` - Exclude from union
   - `Extract<T, U>` - Extract from union
   - `NonNullable<T>` - Remove null/undefined

4. **Function Types**
   - `ReturnType<T>` - Function return type
   - `Parameters<T>` - Function parameter types
   - `ConstructorParameters<T>` - Constructor params
   - `InstanceType<T>` - Constructor instance type

### Code Example

```typescript
// PARTIAL - Make all properties optional
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

type PartialUser = Partial<User>;
// Result:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
// }

// Use case: Update function
function updateUser(id: number, updates: Partial<User>) {
  // Can pass any subset of User properties
}

updateUser(1, { name: 'John' }); // ✅ Valid
updateUser(2, { email: 'john@example.com', age: 30 }); // ✅ Valid

// REQUIRED - Make all properties required
type OptionalUser = {
  id?: number;
  name?: string;
  email?: string;
};

type RequiredUser = Required<OptionalUser>;
// Result: All properties are required (no ?)

// READONLY - Make all properties readonly
type ReadonlyUser = Readonly<User>;
// Cannot modify any properties

const user: ReadonlyUser = { id: 1, name: 'John', email: 'john@example.com', age: 30 };
user.name = 'Jane'; // ❌ Error: Cannot assign to 'name' because it is read-only

// PICK - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// Result: { id: number; name: string }

// Use case: API response optimization
function getUserPreview(id: number): UserPreview {
  return { id, name: 'John' };
}

// OMIT - Exclude specific properties
type UserWithoutId = Omit<User, 'id'>;
// Result: { name: string; email: string; age: number }

// Use case: Create user (no id yet)
function createUser(data: Omit<User, 'id'>): User {
  return { id: Date.now(), ...data };
}

createUser({ name: 'John', email: 'john@example.com', age: 30 });

// RECORD - Create object type with specific keys
type Role = 'admin' | 'user' | 'guest';
type Permissions = Record<Role, string[]>;
// Result:
// {
//   admin: string[];
//   user: string[];
//   guest: string[];
// }

const permissions: Permissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};

// EXCLUDE - Remove from union
type T1 = 'a' | 'b' | 'c';
type T2 = Exclude<T1, 'a'>;  // 'b' | 'c'

// Use case: Filter event types
type AllEvents = 'click' | 'scroll' | 'resize' | 'keydown';
type MouseEvents = Exclude<AllEvents, 'keydown'>;  // 'click' | 'scroll' | 'resize'

// EXTRACT - Keep only matching types from union
type T3 = Extract<T1, 'a' | 'b'>;  // 'a' | 'b'

// Use case: Get only specific events
type ClickEvents = Extract<AllEvents, 'click' | 'dblclick'>;  // 'click'

// NON-NULLABLE - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // string

// RETURN TYPE - Extract function return type
function getUser() {
  return { id: 1, name: 'John', email: 'john@example.com' };
}

type GetUserReturn = ReturnType<typeof getUser>;
// Result: { id: number; name: string; email: string }

// PARAMETERS - Extract function parameter types
function createPost(title: string, content: string, published: boolean) {
  return { title, content, published };
}

type CreatePostParams = Parameters<typeof createPost>;
// Result: [string, string, boolean]

// Use case: Wrapper function
function logAndCreatePost(...args: CreatePostParams) {
  console.log('Creating post:', args);
  return createPost(...args);
}

// AWAITED - Unwrap Promise type
type P1 = Awaited<Promise<string>>;  // string
type P2 = Awaited<Promise<Promise<number>>>;  // number

// Use case: Async function return type
async function fetchData() {
  return { data: [1, 2, 3] };
}

type FetchDataReturn = Awaited<ReturnType<typeof fetchData>>;
// Result: { data: number[] }

// CONSTRUCTOR PARAMETERS
class UserClass {
  constructor(public name: string, public age: number) {}
}

type UserConstructorParams = ConstructorParameters<typeof UserClass>;
// Result: [string, number]

// INSTANCE TYPE
type UserInstance = InstanceType<typeof UserClass>;
// Result: UserClass

// COMBINING UTILITIES
type UserUpdate = Partial<Omit<User, 'id'>>;
// Result: Optional properties, excluding id

type UserCreate = Required<Omit<User, 'id'>> & { password: string };
// Result: All properties except id are required, plus password

// REAL-WORLD: Form State
type FormState<T> = {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
};

type UserFormState = FormState<User>;
// Result:
// {
//   values: Partial<User>;
//   errors: { id?: string; name?: string; email?: string; age?: string };
//   touched: { id?: boolean; name?: boolean; email?: boolean; age?: boolean };
// }

// REAL-WORLD: API Response
type APIResponse<T> = {
  data: T;
  meta: {
    status: number;
    timestamp: number;
  };
};

type UserResponse = APIResponse<User>;
type UserListResponse = APIResponse<User[]>;
type PartialUserResponse = APIResponse<Partial<User>>;

// REAL-WORLD: Redux Action
type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P };

type FetchUserAction = Action<'FETCH_USER', { userId: number }>;
type LogoutAction = Action<'LOGOUT'>;

// REAL-WORLD: Deep Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Config = {
  api: {
    url: string;
    timeout: number;
  };
  features: {
    darkMode: boolean;
  };
};

type PartialConfig = DeepPartial<Config>;
// All nested properties are optional
```

### Utility Type Cheat Sheet

| Type | Purpose | Example |
|------|---------|---------|
| `Partial<T>` | Make all optional | Update functions |
| `Required<T>` | Make all required | Form validation |
| `Readonly<T>` | Make all readonly | Config objects |
| `Pick<T, K>` | Select properties | API optimization |
| `Omit<T, K>` | Exclude properties | Create functions |
| `Record<K, T>` | Create object type | Lookup tables |
| `Exclude<T, U>` | Remove from union | Filter types |
| `Extract<T, U>` | Keep from union | Type narrowing |
| `NonNullable<T>` | Remove null/undefined | Null safety |
| `ReturnType<T>` | Function return | Type inference |
| `Parameters<T>` | Function params | Wrapper functions |
| `Awaited<T>` | Unwrap Promise | Async types |

### Common Mistakes

❌ **Mistake:** Using Partial for required fields
```typescript
function createUser(data: Partial<User>) {
  // ❌ name and email should be required
  return data;
}
```

✅ **Correct:** Make specific fields optional
```typescript
type CreateUser = Omit<User, 'id'> & { age?: number };

function createUser(data: CreateUser) {
  // ✅ name and email required, id excluded, age optional
  return { id: Date.now(), age: 0, ...data };
}
```

### Follow-up Questions

- "How do you create a DeepPartial type?"
- "What's the difference between Pick and Extract?"
- "Can you combine multiple utility types?"
- "How do you make specific properties optional?"

### Resources

- [TypeScript Docs: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Advanced Utility Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---

