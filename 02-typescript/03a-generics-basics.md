# TypeScript Generics - Basics

> Master generics: basics, constraints, and conditional types

---

## Question 1: Explain TypeScript Generics and Their Real-World Use Cases

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10 minutes
**Companies:** Google, Meta, Microsoft, Amazon, Airbnb

### Question
What are TypeScript generics? Explain how they work and provide real-world use cases where generics solve actual problems.

### Answer

**Generics** enable you to create reusable components that work with multiple types while maintaining type safety. They're like parameters for types.

**Key Points:**

1. **Type Variables** - Capture the type provided and use it throughout the function/class
2. **Reusability** - Write code once, use with any type
3. **Type Safety** - Maintain type checking across operations
4. **Flexibility** - Allow consumers to specify types they need
5. **No Type Assertions** - Avoid `any` and unsafe type casting

### Code Example

```typescript
// 1. BASIC GENERIC FUNCTION
function identity<T>(arg: T): T {
  return arg;
}

const str = identity<string>('hello');    // type: string
const num = identity<number>(42);          // type: number
const bool = identity<boolean>(true);      // type: boolean

// Type inference works too
const auto = identity('inferred');         // type: string (inferred)

// 2. GENERIC INTERFACE
interface Box<T> {
  value: T;
  getValue: () => T;
}

const stringBox: Box<string> = {
  value: 'hello',
  getValue: function() { return this.value; }
};

const numberBox: Box<number> = {
  value: 42,
  getValue: function() { return this.value; }
};

// 3. GENERIC CONSTRAINTS
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);  // Safe: we know T has length
  return arg;
}

logLength('hello');           // ✅ string has length
logLength([1, 2, 3]);         // ✅ array has length
logLength({ length: 10 });    // ✅ object with length property
// logLength(42);             // ❌ Error: number doesn't have length

// 4. MULTIPLE TYPE PARAMETERS
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p1 = pair('name', 'John');      // [string, string]
const p2 = pair('age', 30);           // [string, number]
const p3 = pair(1, { data: 'test' }); // [number, object]

// 5. REAL-WORLD: API RESPONSE HANDLER
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Type-safe API calls
const user = await fetchData<User>('/api/users/1');
console.log(user.name);  // ✅ TypeScript knows this is a string

const posts = await fetchData<Post[]>('/api/posts');
console.log(posts[0].title);  // ✅ TypeScript knows posts is an array

// 6. REAL-WORLD: GENERIC STORAGE CLASS
class Storage<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return this.items;
  }

  findById(id: number, idKey: keyof T): T | undefined {
    return this.items.find(item => item[idKey] === id);
  }
}

const userStorage = new Storage<User>();
userStorage.add({ id: 1, name: 'John', email: 'john@example.com' });
userStorage.add({ id: 2, name: 'Jane', email: 'jane@example.com' });

const users = userStorage.getAll();  // type: User[]
```

### Common Mistakes

```typescript
// ❌ WRONG: Using 'any' instead of generics
function badIdentity(arg: any): any {
  return arg;
}

const result = badIdentity('hello');  // type: any (no type safety!)

// ✅ CORRECT: Use generics
function goodIdentity<T>(arg: T): T {
  return arg;
}

const result2 = goodIdentity('hello');  // type: string (type safe!)

// ❌ WRONG: Accessing properties without constraints
function printLength<T>(arg: T): void {
  console.log(arg.length);  // Error: Property 'length' doesn't exist on type 'T'
}

// ✅ CORRECT: Use constraints
interface Lengthy {
  length: number;
}

function printLengthSafe<T extends Lengthy>(arg: T): void {
  console.log(arg.length);  // ✅ Safe
}

// ❌ WRONG: Over-constraining
function processArray<T extends any[]>(arr: T): void {
  // Now we can only use arrays, losing generic flexibility
}

// ✅ CORRECT: Constrain only what's needed
function processItems<T>(items: T[]): void {
  // Works with any array type
}
```

### Follow-up Questions
1. What are generic constraints and when would you use them?
2. How do generics work with React components (props)?
3. What are default type parameters in generics?

### Resources
- [TypeScript Generics Documentation](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Advanced Generics Patterns](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---


## Question 2: What Are Generic Constraints and How Do You Use Them?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 8 minutes
**Companies:** Microsoft, Amazon, Shopify

### Question
Explain generic constraints in TypeScript. Why are they needed and how do you implement them?

### Answer

**Generic constraints** allow you to restrict the types that can be used with a generic. Instead of accepting ANY type, you specify that the type must have certain properties or extend a specific type.

**Key Points:**

1. **Syntax** - Use `extends` keyword: `<T extends Type>`
2. **Safety** - Access properties/methods safely within generic code
3. **Documentation** - Makes requirements clear to users
4. **Flexibility** - Still generic, but with minimum requirements
5. **Common Use** - API contracts, utility functions, React props

### Code Example

```typescript
// 1. BASIC CONSTRAINT
interface HasId {
  id: number;
}

function printId<T extends HasId>(obj: T): void {
  console.log(obj.id);  // ✅ Safe: we know T has id
}

printId({ id: 1, name: 'John' });     // ✅ Works
printId({ id: 2, age: 25 });          // ✅ Works
// printId({ name: 'John' });         // ❌ Error: no id property

// 2. CONSTRAINING TO PRIMITIVE TYPES
function toArray<T extends string | number>(value: T): T[] {
  return [value];
}

toArray('hello');   // ✅ string[]
toArray(42);        // ✅ number[]
// toArray(true);   // ❌ Error: boolean not allowed

// 3. KEYOF CONSTRAINT (very common pattern)
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
};

const name = getProperty(person, 'name');    // type: string
const age = getProperty(person, 'age');      // type: number
// getProperty(person, 'salary');            // ❌ Error: 'salary' doesn't exist

// 4. MULTIPLE CONSTRAINTS
interface Identifiable {
  id: number;
}

interface Nameable {
  name: string;
}

function process<T extends Identifiable & Nameable>(item: T): string {
  return `${item.id}: ${item.name}`;
}

process({ id: 1, name: 'Item 1' });                    // ✅ Works
process({ id: 2, name: 'Item 2', extra: 'data' });     // ✅ Works
// process({ id: 1 });                                 // ❌ Error: missing name
// process({ name: 'Item' });                          // ❌ Error: missing id

// 5. REAL-WORLD: CRUD OPERATIONS
interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

class Repository<T extends Entity> {
  private items: Map<number, T> = new Map();

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date();
    const newItem = {
      ...item,
      id: this.items.size + 1,
      createdAt: now,
      updatedAt: now
    } as T;

    this.items.set(newItem.id, newItem);
    return newItem;
  }

  findById(id: number): T | undefined {
    return this.items.get(id);
  }

  update(id: number, updates: Partial<T>): T | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated = {
      ...item,
      ...updates,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }

  delete(id: number): boolean {
    return this.items.delete(id);
  }
}

// Usage with specific entity
interface User extends Entity {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const userRepo = new Repository<User>();
const user = userRepo.create({
  name: 'John',
  email: 'john@example.com',
  role: 'user'
});
// TypeScript automatically adds id, createdAt, updatedAt

// 6. CONSTRUCTOR CONSTRAINT
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}

class Dog {
  bark() {
    return 'Woof!';
  }
}

const dog = createInstance(Dog);
dog.bark();  // ✅ Works, type is Dog

// 7. ARRAY ELEMENT CONSTRAINT
function getFirst<T extends any[]>(arr: T): T[0] {
  return arr[0];
}

const first = getFirst([1, 2, 3]);     // type: number
const name = getFirst(['a', 'b']);     // type: string
```

### Common Mistakes

```typescript
// ❌ WRONG: Not using constraint when needed
function merge<T, U>(obj1: T, obj2: U) {
  return { ...obj1, ...obj2 };  // Only works with objects
}

merge({ a: 1 }, { b: 2 });   // ✅ Works
merge('hello', 'world');     // ❌ Runtime error, but TypeScript allows it

// ✅ CORRECT: Constrain to objects
function mergeSafe<T extends object, U extends object>(obj1: T, obj2: U) {
  return { ...obj1, ...obj2 };
}

// mergeSafe('hello', 'world');  // ❌ Compile error caught early

// ❌ WRONG: Over-constraining unnecessarily
function length<T extends string>(str: T): number {
  return str.length;  // We constrained to string, so it's not really generic
}

// ✅ CORRECT: Use proper constraint
function lengthSafe<T extends { length: number }>(item: T): number {
  return item.length;  // Works with strings, arrays, anything with length
}
```

### Follow-up Questions
1. How do you use `keyof` with generics?
2. What's the difference between `T extends U` and `T & U`?
3. Can you have default values for generic type parameters?

### Resources
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Using Type Parameters in Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints)

---


## Question 3: Explain Conditional Types in TypeScript

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 12 minutes
**Companies:** Google, Meta, Microsoft

### Question
What are conditional types in TypeScript? How and when would you use them in production code?

### Answer

**Conditional types** allow you to create types that depend on a condition. They use a ternary-like syntax: `T extends U ? X : Y`.

**Key Points:**

1. **Syntax** - `Type extends Condition ? TrueType : FalseType`
2. **Type-level Logic** - Make decisions about types at compile time
3. **Distributive** - Over union types automatically
4. **Built-in Utilities** - TypeScript's built-in utility types use them
5. **Advanced Patterns** - Extract, exclude, filter types

### Code Example

```typescript
// 1. BASIC CONDITIONAL TYPE
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;    // type: true
type B = IsString<number>;    // type: false
type C = IsString<'hello'>;   // type: true

// 2. REAL-WORLD: FUNCTION RETURN TYPE BASED ON INPUT
type ApiResponse<T> = T extends 'json' ? object : string;

function callApi<T extends 'json' | 'text'>(
  endpoint: string,
  format: T
): Promise<ApiResponse<T>> {
  return fetch(endpoint).then(res =>
    format === 'json' ? res.json() : res.text()
  ) as Promise<ApiResponse<T>>;
}

const jsonData = await callApi('/api/data', 'json');   // type: object
const textData = await callApi('/api/data', 'text');   // type: string

// 3. DISTRIBUTIVE CONDITIONAL TYPES (with unions)
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// Distributes to: ToArray<string> | ToArray<number>
// Results in: string[] | number[]

// 4. INFER KEYWORD (extract types from other types)
type ReturnTypeCustom<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string {
  return 'hello';
}

function getNumber(): number {
  return 42;
}

type GreetReturn = ReturnTypeCustom<typeof greet>;      // string
type NumberReturn = ReturnTypeCustom<typeof getNumber>;  // number

// 5. EXTRACT ARRAY ELEMENT TYPE
type ElementType<T> = T extends (infer E)[] ? E : T;

type NumArray = number[];
type Num = ElementType<NumArray>;  // number

type Str = ElementType<string>;    // string (not an array, returns itself)

// 6. REAL-WORLD: FLATTEN NESTED TYPES
type Flatten<T> = T extends any[]
  ? T[number]
  : T extends object
    ? T[keyof T]
    : T;

type Arr = Flatten<number[]>;              // number
type Obj = Flatten<{ a: string; b: number }>;  // string | number
type Prim = Flatten<string>;               // string

// 7. COMPLEX EXAMPLE: DEEP READONLY
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    ttl: number;
  };
}

type ReadonlyConfig = DeepReadonly<Config>;
// All nested properties are readonly

const config: ReadonlyConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      username: 'admin',
      password: 'secret'
    }
  },
  cache: {
    ttl: 3600
  }
};

// config.database.host = 'newhost';  // ❌ Error: readonly
// config.database.credentials.password = 'new';  // ❌ Error: readonly

// 8. PRACTICAL: EXCLUDE NULLABLE TYPES
type NonNullable<T> = T extends null | undefined ? never : T;

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // string

// 9. FUNCTION PARAMETER TYPES
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

function myFunction(name: string, age: number, active: boolean) {
  return { name, age, active };
}

type MyFunctionParams = Parameters<typeof myFunction>;
// [name: string, age: number, active: boolean]
```

### Common Mistakes

```typescript
// ❌ WRONG: Forgetting distributive behavior
type WrapInArray<T> = T extends any ? T[] : never;
type Result = WrapInArray<string | number>;
// Result: string[] | number[] (distributes)
// You might expect: (string | number)[]

// ✅ CORRECT: Use tuple to prevent distribution
type WrapInArrayCorrect<T> = [T] extends [any] ? T[] : never;
type Result2 = WrapInArrayCorrect<string | number>;
// Result: (string | number)[]

// ❌ WRONG: Not handling never type
type ExtractString<T> = T extends string ? T : never;
type Test = ExtractString<never>;  // never (might be unexpected)

// ✅ CORRECT: Check for never explicitly if needed
type ExtractStringSafe<T> = [T] extends [never]
  ? 'no-type'
  : T extends string
    ? T
    : never;
```

### Follow-up Questions
1. What is the `infer` keyword and how does it work?
2. How are TypeScript's built-in utility types implemented using conditional types?
3. What are distributive conditional types?

### Resources
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Type Inference in Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)

---

