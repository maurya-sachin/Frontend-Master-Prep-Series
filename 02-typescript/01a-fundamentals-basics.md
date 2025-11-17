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


## Question 3: What are union and intersection types?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 7-10 minutes
**Companies:** Google, Meta, Microsoft, Amazon

### Question
Explain union and intersection types in TypeScript. Provide practical examples of when to use each.

### Answer

**Union types** (`A | B`) represent a value that can be one of several types.
**Intersection types** (`A & B`) combine multiple types into one.

1. **Union Types (OR logic)**
   - Value can be one type OR another
   - Use `|` operator
   - Type narrowing required to access specific properties

2. **Intersection Types (AND logic)**
   - Value must satisfy all types
   - Use `&` operator
   - Combines properties from all types

3. **Common Use Cases**
   - Unions: Function parameters, state values, API responses
   - Intersections: Mixing multiple interfaces, composition

### Code Example

```typescript
// 1. BASIC UNION TYPES

type StringOrNumber = string | number;

let value: StringOrNumber;
value = 'hello'; // OK
value = 42; // OK
// value = true; // Error

// 2. UNION WITH LITERAL TYPES

type Status = 'pending' | 'success' | 'error';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function setStatus(status: Status) {
  console.log(`Status: ${status}`);
}

setStatus('success'); // OK
// setStatus('loading'); // Error: not in union

// 3. TYPE NARROWING WITH UNIONS

function processValue(value: string | number) {
  // Need type narrowing to access type-specific methods
  if (typeof value === 'string') {
    return value.toUpperCase(); // OK: value is string here
  } else {
    return value.toFixed(2); // OK: value is number here
  }
}

// 4. DISCRIMINATED UNIONS (TAGGED UNIONS)

type Circle = {
  kind: 'circle';
  radius: number;
};

type Rectangle = {
  kind: 'rectangle';
  width: number;
  height: number;
};

type Square = {
  kind: 'square';
  size: number;
};

type Shape = Circle | Rectangle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // TypeScript knows it's Circle
    case 'rectangle':
      return shape.width * shape.height; // TypeScript knows it's Rectangle
    case 'square':
      return shape.size ** 2; // TypeScript knows it's Square
  }
}

// 5. BASIC INTERSECTION TYPES

type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: number;
  department: string;
};

type EmployeePerson = Person & Employee;

const employee: EmployeePerson = {
  name: 'John',
  age: 30,
  employeeId: 123,
  department: 'Engineering'
}; // Must have ALL properties

// 6. INTERSECTION WITH METHODS

type Timestamped = {
  timestamp: Date;
};

type WithAuthor = {
  author: string;
};

type BlogPost = {
  title: string;
  content: string;
} & Timestamped & WithAuthor;

const post: BlogPost = {
  title: 'TypeScript Guide',
  content: 'Learn TypeScript...',
  timestamp: new Date(),
  author: 'John Doe'
};

// 7. CONFLICTING INTERSECTIONS

type A = {
  value: string;
};

type B = {
  value: number;
};

type AB = A & B;
// value property is type never (string & number = never)

// const ab: AB = { value: ??? }; // Impossible to satisfy

// 8. UNION OF OBJECTS

type Cat = {
  type: 'cat';
  meow: () => void;
};

type Dog = {
  type: 'dog';
  bark: () => void;
};

type Pet = Cat | Dog;

function makeSound(pet: Pet) {
  if (pet.type === 'cat') {
    pet.meow(); // OK: TypeScript knows it's Cat
  } else {
    pet.bark(); // OK: TypeScript knows it's Dog
  }
}

// 9. PRACTICAL API RESPONSE TYPES

type SuccessResponse = {
  status: 'success';
  data: any;
};

type ErrorResponse = {
  status: 'error';
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

async function fetchData(): Promise<ApiResponse> {
  try {
    const data = await fetch('/api/data');
    return { status: 'success', data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

function handleResponse(response: ApiResponse) {
  if (response.status === 'success') {
    console.log(response.data); // OK
    // console.log(response.error); // Error: doesn't exist on SuccessResponse
  } else {
    console.log(response.error); // OK
  }
}

// 10. COMBINING UNIONS AND INTERSECTIONS

type Draggable = {
  drag: () => void;
};

type Resizable = {
  resize: () => void;
};

// Intersection: must be both draggable AND resizable
type InteractiveElement = Draggable & Resizable;

// Union: can be draggable OR resizable (or both)
type FlexibleElement = Draggable | Resizable;

const window1: InteractiveElement = {
  drag: () => console.log('dragging'),
  resize: () => console.log('resizing')
}; // Must have BOTH methods

const window2: FlexibleElement = {
  drag: () => console.log('dragging')
}; // Can have just one

// 11. UTILITY TYPE WITH UNIONS

type Nullable<T> = T | null;
type Optional<T> = T | undefined;

let userName: Nullable<string> = null;
userName = 'John';

let age: Optional<number> = undefined;
age = 30;

// 12. ADVANCED: DISTRIBUTIVE UNIONS

type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// Result: string[] | number[] (distributed over union)
```

### Common Mistakes

❌ **Mistake 1:** Accessing union properties without narrowing
```typescript
type Response = { success: true; data: string } | { success: false; error: string };

function handle(response: Response) {
  console.log(response.data); // Error: 'data' doesn't exist on both types
}

// Correct: use type narrowing
function handle(response: Response) {
  if (response.success) {
    console.log(response.data); // OK
  } else {
    console.log(response.error); // OK
  }
}
```

❌ **Mistake 2:** Creating impossible intersections
```typescript
type Impossible = string & number; // Type: never

const value: Impossible = ???; // No value can satisfy both string AND number
```

❌ **Mistake 3:** Confusing unions with intersections
```typescript
// Wrong: thinking & means "or"
type OneOrOther = TypeA & TypeB; // Must have ALL properties of both

// Correct: use | for "or"
type OneOrOther = TypeA | TypeB; // Can be either type
```

✅ **Correct:** Use unions for "or" logic, intersections for combining types

### Follow-up Questions

- "What are discriminated unions?"
- "How does type narrowing work with unions?"
- "What happens when intersection types have conflicting properties?"
- "What is the difference between `A | B` and `A & B`?"
- "How do you create type-safe error handling with unions?"

### Resources

- [TypeScript Handbook: Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [TypeScript Handbook: Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Advanced TypeScript: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

---

