# TypeScript Type Narrowing and Guards

## Question 1: What is type narrowing and how do type guards work?

**Answer:**

Type narrowing is TypeScript's ability to refine types to more specific types within conditional blocks based on runtime checks. When you perform certain checks (like `typeof`, `instanceof`, or equality checks), TypeScript's control flow analysis automatically narrows the type from a broader union type to a more specific type.

Type guards are expressions that perform runtime checks and inform TypeScript's type system about the type within a specific code block.

**Built-in Type Guards:**

```typescript
// typeof guard
function printValue(value: string | number) {
  if (typeof value === "string") {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  } else {
    // TypeScript knows value is number here
    console.log(value.toFixed(2));
  }
}

// instanceof guard
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows it's Dog
  } else {
    animal.meow(); // TypeScript knows it's Cat
  }
}

// Truthiness narrowing
function printLength(value: string | null) {
  if (value) {
    // TypeScript knows value is string (not null)
    console.log(value.length);
  } else {
    console.log("No value provided");
  }
}

// Equality narrowing
function compareValues(x: string | number, y: string | boolean) {
  if (x === y) {
    // TypeScript knows both are string (the only common type)
    console.log(x.toUpperCase());
    console.log(y.toLowerCase());
  }
}

// in operator narrowing
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // TypeScript knows it's Fish
  } else {
    animal.fly(); // TypeScript knows it's Bird
  }
}
```

**Control Flow Analysis:**

```typescript
function processValue(value: string | number | null) {
  // Type: string | number | null

  if (value === null) {
    console.log("Null value");
    return;
  }

  // Type narrowed to: string | number

  if (typeof value === "string") {
    console.log(value.toUpperCase());
    return;
  }

  // Type narrowed to: number
  console.log(value.toFixed(2));
}
```

**Discriminated Unions:**

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // TypeScript knows shape is Circle
      return Math.PI * shape.radius ** 2;

    case "square":
      // TypeScript knows shape is Square
      return shape.sideLength ** 2;

    case "triangle":
      // TypeScript knows shape is Triangle
      return (shape.base * shape.height) / 2;
  }
}
```

---

### <details>
<summary><strong>🔍 Deep Dive: Control Flow Analysis and Narrowing Algorithm</strong></summary>

**How TypeScript's Control Flow Analysis Works:**

TypeScript's type checker uses a sophisticated control flow analysis algorithm that tracks type information through your code's execution paths. This analysis happens at compile time and uses an abstract interpretation of your code.

**The Narrowing Algorithm:**

```typescript
// TypeScript builds a control flow graph (CFG)
function complexNarrowing(value: string | number | boolean | null) {
  // Node 1: Initial type = string | number | boolean | null

  if (value === null) {
    // Node 2: Type = null
    return "null value";
  }

  // Node 3: Type = string | number | boolean (null eliminated)

  if (typeof value === "boolean") {
    // Node 4: Type = boolean
    return value ? "true" : "false";
  }

  // Node 5: Type = string | number (boolean eliminated)

  const isString = typeof value === "string";

  if (isString) {
    // Node 6: Type = string (based on isString being true)
    return value.toUpperCase();
  }

  // Node 7: Type = number (only remaining possibility)
  return value.toFixed(2);
}
```

**Type Predicate Evaluation:**

TypeScript evaluates type predicates at each control flow node:

```typescript
// Internal representation (conceptual)
type ControlFlowNode = {
  type: Type;
  antecedent: ControlFlowNode | null;
  condition?: Expression;
};

// For each if statement, TypeScript creates:
// 1. Consequence node (condition is true)
// 2. Alternate node (condition is false)

function example(x: string | number) {
  // CFNode1: type = string | number

  if (typeof x === "string") {
    // CFNode2 (consequence): type = string
    // Antecedent: CFNode1
    // Condition: typeof x === "string" is TRUE
    console.log(x.length);
  } else {
    // CFNode3 (alternate): type = number
    // Antecedent: CFNode1
    // Condition: typeof x === "string" is FALSE
    console.log(x.toFixed());
  }

  // CFNode4 (merge point): type = string | number
}
```

**Advanced Narrowing Patterns:**

```typescript
// Array.isArray narrowing
function processInput(value: string | string[]) {
  if (Array.isArray(value)) {
    // TypeScript knows value is string[]
    value.forEach(item => console.log(item.toUpperCase()));
  } else {
    // TypeScript knows value is string
    console.log(value.toUpperCase());
  }
}

// Exhaustiveness checking with never
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

function processShape(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // If we add a new shape and forget to handle it,
      // TypeScript will error here because shape won't be never
      return assertNever(shape);
  }
}

// Assignment narrowing
function assignmentNarrowing() {
  let x: string | number;

  x = "hello";
  // TypeScript knows x is string here
  console.log(x.toUpperCase());

  x = 42;
  // TypeScript knows x is number here
  console.log(x.toFixed());
}
```

**Narrowing with Type Predicates (Internal Mechanism):**

```typescript
// When TypeScript sees a type predicate function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// TypeScript internally treats this as:
// IF isString(x) returns true THEN x's type = string

function process(value: unknown) {
  // Type: unknown

  if (isString(value)) {
    // TypeScript applies the type predicate
    // Type: string (because isString returned true)
    console.log(value.toUpperCase());
  }

  // Type: unknown (back to original)
}
```

**Limitations of Control Flow Analysis:**

```typescript
// TypeScript can't narrow across function boundaries
function isStringCheck(value: string | number): boolean {
  return typeof value === "string";
}

function broken(value: string | number) {
  if (isStringCheck(value)) {
    // TypeScript still thinks value is string | number
    // It can't know that isStringCheck returning true means string
    // value.toUpperCase(); // Error!
  }
}

// Solution: Use type predicates
function isStringPredicate(value: string | number): value is string {
  return typeof value === "string";
}

function working(value: string | number) {
  if (isStringPredicate(value)) {
    // Now TypeScript knows value is string
    console.log(value.toUpperCase()); // Works!
  }
}

// TypeScript can't narrow in callbacks
function callbackIssue(value: string | number) {
  if (typeof value === "string") {
    // value is string here

    setTimeout(() => {
      // TypeScript can't guarantee value is still string
      // (theoretically, value could be reassigned)
      // value.toUpperCase(); // Error in strict mode
    }, 100);
  }
}
```

**Performance Implications:**

The control flow analysis algorithm has complexity considerations:

```typescript
// Deeply nested conditions can slow down type checking
function deepNesting(
  a: string | number,
  b: string | boolean,
  c: number | boolean,
  d: string | number | boolean
) {
  if (typeof a === "string") {
    if (typeof b === "string") {
      if (typeof c === "number") {
        if (typeof d === "string") {
          // TypeScript must track 2^4 = 16 possible type combinations
          // across all branches
          console.log(a, b, c, d);
        }
      }
    }
  }
}

// Better: Early returns reduce CFG complexity
function betterNesting(
  a: string | number,
  b: string | boolean,
  c: number | boolean,
  d: string | number | boolean
) {
  if (typeof a !== "string") return;
  if (typeof b !== "string") return;
  if (typeof c !== "number") return;
  if (typeof d !== "string") return;

  // Linear flow is easier for TypeScript to analyze
  console.log(a, b, c, d);
}
```

</details>

---

### <details>
<summary><strong>🐛 Real-World Scenario: Type Guard Bug in E-commerce Platform</strong></summary>

**Context:**
An e-commerce platform's product filtering system had inconsistent type narrowing that caused runtime errors when filtering products by different criteria. The issue affected 15% of filter operations and caused 3,200 errors per day.

**The Buggy Code:**

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface DigitalProduct extends Product {
  downloadUrl: string;
  fileSize: number;
}

interface PhysicalProduct extends Product {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

type ProductType = DigitalProduct | PhysicalProduct;

// ❌ BROKEN: Type guard doesn't narrow correctly
function isDigitalProduct(product: ProductType): boolean {
  return 'downloadUrl' in product;
}

function processProduct(product: ProductType) {
  if (isDigitalProduct(product)) {
    // TypeScript still thinks product is ProductType (not narrowed!)
    // This compiles but causes runtime errors
    console.log(`File size: ${product.fileSize}MB`); // Error if physical product
    generateDownloadLink(product.downloadUrl); // Error if physical product
  } else {
    calculateShipping(product.weight, product.dimensions); // Error if digital product
  }
}

// This caused errors like:
// TypeError: Cannot read property 'fileSize' of undefined
// TypeError: Cannot read property 'weight' of undefined
```

**Impact Metrics:**
- **Errors**: 3,200 errors/day (15% of filter operations)
- **User Impact**: 850 users/day encountered filter errors
- **Revenue Impact**: $12,000/month in lost sales (users abandoned after errors)
- **Support Load**: 45 support tickets/week about "broken filters"

**Debugging Process:**

```typescript
// Step 1: Add logging to identify the issue
function processProduct(product: ProductType) {
  console.log('Product type check:', isDigitalProduct(product));
  console.log('Product keys:', Object.keys(product));

  if (isDigitalProduct(product)) {
    console.log('Processing as digital product');
    console.log('Has downloadUrl?', 'downloadUrl' in product);
    console.log('Has fileSize?', 'fileSize' in product);

    // Logs revealed: Sometimes 'downloadUrl' exists but is undefined
    // This caused the type guard to return true incorrectly
  }
}

// Step 2: Check TypeScript's understanding
function testNarrowing(product: ProductType) {
  if (isDigitalProduct(product)) {
    // Hover over 'product' in VSCode
    // Type shows: ProductType (NOT DigitalProduct!)
    // This revealed the type predicate was missing
    const p = product; // Type: ProductType
  }
}

// Step 3: Test with real data
const testProduct: PhysicalProduct = {
  id: "123",
  name: "Laptop",
  price: 999,
  category: "electronics",
  weight: 2.5,
  dimensions: { length: 30, width: 20, height: 5 }
};

// Add downloadUrl accidentally during processing
const corruptedProduct = { ...testProduct, downloadUrl: undefined };

console.log(isDigitalProduct(corruptedProduct)); // true (WRONG!)
// This explained why physical products were treated as digital
```

**The Fix:**

```typescript
// ✅ SOLUTION 1: Use type predicate
function isDigitalProduct(product: ProductType): product is DigitalProduct {
  return 'downloadUrl' in product &&
         typeof product.downloadUrl === 'string' &&
         'fileSize' in product &&
         typeof product.fileSize === 'number';
}

// ✅ SOLUTION 2: Discriminated union (better approach)
interface DigitalProduct {
  type: 'digital'; // Discriminant property
  id: string;
  name: string;
  price: number;
  category: string;
  downloadUrl: string;
  fileSize: number;
}

interface PhysicalProduct {
  type: 'physical'; // Discriminant property
  id: string;
  name: string;
  price: number;
  category: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

type ProductType = DigitalProduct | PhysicalProduct;

function processProduct(product: ProductType) {
  // TypeScript narrows automatically based on discriminant
  if (product.type === 'digital') {
    // product is DigitalProduct here
    console.log(`File size: ${product.fileSize}MB`);
    generateDownloadLink(product.downloadUrl);
  } else {
    // product is PhysicalProduct here
    calculateShipping(product.weight, product.dimensions);
  }
}

// ✅ SOLUTION 3: Assertion functions for validation
function assertDigitalProduct(
  product: ProductType
): asserts product is DigitalProduct {
  if (
    !('downloadUrl' in product) ||
    typeof product.downloadUrl !== 'string' ||
    !('fileSize' in product) ||
    typeof product.fileSize !== 'number'
  ) {
    throw new Error(`Product ${product.id} is not a digital product`);
  }
}

function processProductSafely(product: ProductType) {
  try {
    assertDigitalProduct(product);
    // TypeScript knows product is DigitalProduct after assertion
    console.log(`File size: ${product.fileSize}MB`);
    generateDownloadLink(product.downloadUrl);
  } catch (error) {
    // Handle as physical product
    if ('weight' in product) {
      calculateShipping(product.weight, product.dimensions);
    }
  }
}
```

**Validation and Testing:**

```typescript
// Comprehensive type guard tests
describe('Product Type Guards', () => {
  const digitalProduct: DigitalProduct = {
    type: 'digital',
    id: '1',
    name: 'E-book',
    price: 9.99,
    category: 'books',
    downloadUrl: 'https://example.com/download',
    fileSize: 5
  };

  const physicalProduct: PhysicalProduct = {
    type: 'physical',
    id: '2',
    name: 'Laptop',
    price: 999,
    category: 'electronics',
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 5 }
  };

  test('discriminated union narrows correctly', () => {
    expect(digitalProduct.type).toBe('digital');

    if (digitalProduct.type === 'digital') {
      // TypeScript allows this without error
      expect(digitalProduct.downloadUrl).toBeDefined();
      expect(digitalProduct.fileSize).toBe(5);
    }
  });

  test('rejects corrupted products', () => {
    const corruptedProduct = {
      ...physicalProduct,
      downloadUrl: undefined
    };

    expect(() => assertDigitalProduct(corruptedProduct as any))
      .toThrow('is not a digital product');
  });
});
```

**Results After Fix:**
- **Errors reduced**: 3,200 → 12 errors/day (99.6% reduction)
- **User impact**: 850 → 3 users/day encountering errors (99.6% reduction)
- **Revenue recovery**: $12,000/month in recovered sales
- **Support tickets**: 45 → 2 tickets/week (95% reduction)
- **Type safety**: 100% type coverage with discriminated unions

**Key Lessons:**
1. **Use type predicates**: Regular boolean functions don't narrow types
2. **Validate thoroughly**: Check both existence and type of properties
3. **Prefer discriminated unions**: Explicit type fields are more reliable than property checks
4. **Test type narrowing**: Verify TypeScript actually narrows types in your IDE
5. **Handle edge cases**: Check for undefined/null values in type guards

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: Type Guard Strategies</strong></summary>

**Strategy 1: Built-in Type Guards (typeof, instanceof)**

**Pros:**
- No extra code needed
- Fast runtime performance
- Understood by TypeScript automatically
- Simple and readable

**Cons:**
- Limited to primitive types and class instances
- Can't distinguish between interface types
- No custom validation logic
- Not suitable for complex object shapes

**Best for:**
- Primitive type checking (string, number, boolean)
- Class instance checks
- Simple union types

```typescript
// Good use case
function format(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// Bad use case (doesn't work for interfaces)
interface User {
  name: string;
}

interface Admin {
  name: string;
  permissions: string[];
}

function greet(person: User | Admin) {
  // typeof person === 'object' for both (not useful)
  // instanceof doesn't work for interfaces
}
```

**Strategy 2: Type Predicate Functions**

**Pros:**
- Works with any type structure
- Can include custom validation
- Reusable across codebase
- Explicit type narrowing

**Cons:**
- Requires writing extra functions
- Can have runtime performance cost
- Easy to write incorrect predicates
- Must be maintained alongside types

**Best for:**
- Interface differentiation
- Complex validation logic
- Reusable type checks
- API response validation

```typescript
// ✅ Good use case
interface ApiSuccess {
  status: 'success';
  data: unknown;
}

interface ApiError {
  status: 'error';
  message: string;
}

type ApiResponse = ApiSuccess | ApiError;

function isApiSuccess(response: ApiResponse): response is ApiSuccess {
  return response.status === 'success' && 'data' in response;
}

function handleResponse(response: ApiResponse) {
  if (isApiSuccess(response)) {
    // TypeScript knows response is ApiSuccess
    processData(response.data);
  } else {
    // TypeScript knows response is ApiError
    logError(response.message);
  }
}

// ❌ Dangerous: Incorrect predicate
function isBadPredicate(value: unknown): value is string {
  return true; // ALWAYS returns true, but claims type is string!
}

// This compiles but will crash at runtime
function dangerous(value: unknown) {
  if (isBadPredicate(value)) {
    // TypeScript thinks value is string, but it might be anything!
    value.toUpperCase(); // Runtime error if value is not string
  }
}
```

**Strategy 3: Discriminated Unions**

**Pros:**
- Automatic type narrowing
- No extra functions needed
- Exhaustiveness checking
- Self-documenting code
- Compile-time safety

**Cons:**
- Requires modifying type definitions
- Adds extra property to objects
- Can't be retrofitted to external APIs
- Slightly larger object size

**Best for:**
- Application-owned types
- State machines
- Event systems
- Redux actions/reducers

```typescript
// ✅ Excellent for state machines
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };

function renderUsers(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return <div>Click to load</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      // state.data is available and type-safe
      return <UserList users={state.data} />;
    case 'error':
      // state.error is available and type-safe
      return <div>Error: {state.error}</div>;
  }
}

// ❌ Can't use with external APIs
interface ExternalApiResponse {
  // Can't modify this type to add discriminant
  result?: Data;
  error?: string;
}
```

**Strategy 4: Assertion Functions**

**Pros:**
- Throws errors for invalid types
- Narrows type for all subsequent code
- Good for invariant checks
- Clear error messages

**Cons:**
- Can crash application
- Requires try-catch handling
- Less flexible than type predicates
- Can make code harder to follow

**Best for:**
- Critical invariants
- Input validation
- API contract enforcement
- Development-time checks

```typescript
// ✅ Good for critical checks
function assertNonNull<T>(
  value: T,
  message: string
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

function processUser(user: User | null) {
  assertNonNull(user, 'User must be logged in');
  // TypeScript knows user is User (not null) here
  console.log(user.name.toUpperCase());
}

// ❌ Bad for expected conditions
function getUser(id: string): User | null {
  const user = findUserById(id);
  // Don't use assertion for expected null cases
  assertNonNull(user, 'User not found'); // Throws instead of handling gracefully
  return user;
}

// ✅ Better approach
function getUserSafe(id: string): User | null {
  return findUserById(id); // Return null, let caller handle it
}
```

**Performance Comparison:**

```typescript
// Benchmark: 1 million operations

// Built-in guard (typeof): ~2ms
function builtinGuard(value: string | number) {
  if (typeof value === 'string') {
    return value.length;
  }
  return value;
}

// Type predicate: ~15ms
function isString(value: string | number): value is string {
  return typeof value === 'string';
}

function predicateGuard(value: string | number) {
  if (isString(value)) {
    return value.length;
  }
  return value;
}

// Discriminated union: ~3ms (similar to built-in)
type Value = { type: 'string'; value: string } | { type: 'number'; value: number };

function discriminatedGuard(v: Value) {
  if (v.type === 'string') {
    return v.value.length;
  }
  return v.value;
}

// Assertion function: ~20ms (includes try-catch overhead)
function assertString(value: string | number): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string');
  }
}

function assertionGuard(value: string | number) {
  try {
    assertString(value);
    return value.length;
  } catch {
    return value as number;
  }
}
```

**Decision Matrix:**

| Scenario | Recommended Strategy | Reason |
|----------|---------------------|--------|
| Primitive union (string \| number) | Built-in guard | Simple, fast, no overhead |
| Interface union | Discriminated union | Automatic narrowing, self-documenting |
| External API types | Type predicate | Can't modify external types |
| Critical invariants | Assertion function | Clear contract enforcement |
| Reusable validation | Type predicate | Encapsulates logic, reusable |
| State machine | Discriminated union | Exhaustiveness checking |
| Performance-critical | Built-in guard or discriminated union | Fastest runtime performance |
| Complex validation | Type predicate | Allows custom logic |

**Combined Approach:**

```typescript
// Use different strategies for different parts of your app

// 1. External API: Type predicate
interface ApiUser {
  id: string;
  name?: string;
  email?: string;
}

function isValidUser(user: ApiUser): user is Required<ApiUser> {
  return !!user.id && !!user.name && !!user.email;
}

// 2. Internal state: Discriminated union
type UserState =
  | { type: 'loading' }
  | { type: 'loaded'; user: Required<ApiUser> }
  | { type: 'error'; message: string };

// 3. Critical checks: Assertion
function assertUserLoaded(state: UserState): asserts state is { type: 'loaded'; user: Required<ApiUser> } {
  if (state.type !== 'loaded') {
    throw new Error('User not loaded');
  }
}

// 4. Simple checks: Built-in guard
function formatId(id: string | number) {
  if (typeof id === 'string') {
    return id.toUpperCase();
  }
  return id.toString();
}
```

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: Type Narrowing and Guards</strong></summary>

**Simple Analogy:**

Imagine you have a box labeled "fruit" that could contain either an apple or an orange. Type narrowing is like opening the box and checking what's inside to know exactly which fruit you have.

```typescript
// You have a box labeled "fruit"
type Fruit = Apple | Orange;

// You open it and check
function eatFruit(fruit: Fruit) {
  // Check: Is it an apple?
  if (isApple(fruit)) {
    // Now you KNOW it's an apple
    fruit.crunchInto(); // Apples are crunchy
  } else {
    // It must be an orange
    fruit.peel(); // Oranges need peeling
  }
}
```

**What is Type Narrowing?**

Type narrowing is when TypeScript gets smarter about what type something is based on checks you do in your code.

```typescript
// TypeScript starts not knowing much
function printValue(value: string | number) {
  // At this point, TypeScript knows: "value is either string or number"

  // You do a check
  if (typeof value === "string") {
    // NOW TypeScript knows: "value is definitely a string"
    console.log(value.toUpperCase()); // Safe to use string methods
  } else {
    // TypeScript knows: "value must be a number"
    console.log(value.toFixed(2)); // Safe to use number methods
  }
}
```

**Real-World Example:**

Think of a restaurant where orders can be either dine-in or delivery:

```typescript
interface DineInOrder {
  orderType: 'dine-in';
  tableNumber: number;
  serverName: string;
}

interface DeliveryOrder {
  orderType: 'delivery';
  address: string;
  deliveryTime: string;
}

type Order = DineInOrder | DeliveryOrder;

function processOrder(order: Order) {
  // Check the order type
  if (order.orderType === 'dine-in') {
    // TypeScript KNOWS order is DineInOrder now
    console.log(`Table ${order.tableNumber}, Server: ${order.serverName}`);
  } else {
    // TypeScript KNOWS order is DeliveryOrder now
    console.log(`Deliver to ${order.address} at ${order.deliveryTime}`);
  }
}
```

**What are Type Guards?**

Type guards are the checks you do to help TypeScript narrow types. They're like security guards that check IDs:

```typescript
// Built-in type guard: typeof
function checkAge(age: string | number) {
  if (typeof age === "number") {
    // Guard passed: age is number
    console.log(`Age: ${age} years`);
  } else {
    // Guard failed: age must be string
    console.log(`Age: ${age}`);
  }
}

// Custom type guard: You create your own
interface Dog {
  bark: () => void;
  breed: string;
}

interface Cat {
  meow: () => void;
  color: string;
}

// This is a custom type guard function
function isDog(animal: Dog | Cat): animal is Dog {
  return 'bark' in animal;
}

function petAnimal(animal: Dog | Cat) {
  if (isDog(animal)) {
    // TypeScript knows animal is Dog
    console.log(`Dog breed: ${animal.breed}`);
    animal.bark();
  } else {
    // TypeScript knows animal is Cat
    console.log(`Cat color: ${animal.color}`);
    animal.meow();
  }
}
```

**Common Mistake:**

```typescript
// ❌ This doesn't work
function checkType(value: string | number): boolean {
  return typeof value === "string";
}

function broken(value: string | number) {
  if (checkType(value)) {
    // TypeScript still thinks value is string | number
    // It doesn't know checkType is doing a type check!
    value.toUpperCase(); // ERROR!
  }
}

// ✅ This works
function checkTypePredicate(value: string | number): value is string {
  //                                                   ^^^^^^^^^^^^^^
  //                                                   This tells TypeScript!
  return typeof value === "string";
}

function working(value: string | number) {
  if (checkTypePredicate(value)) {
    // TypeScript knows value is string
    console.log(value.toUpperCase()); // Works!
  }
}
```

**Interview Answer Template:**

**Question: "What is type narrowing in TypeScript?"**

**Good Answer:**
"Type narrowing is TypeScript's ability to refine types within conditional blocks based on runtime checks. When you check something like `typeof x === 'string'`, TypeScript narrows the type of `x` from a broader union type to the specific type `string` within that block.

For example, if I have a function parameter that could be `string | number`, and I check `typeof value === 'string'`, TypeScript knows inside that if-block that `value` is definitely a string, so I can safely call `.toUpperCase()` on it.

Type guards are the checks that enable this narrowing - they can be built-in like `typeof` and `instanceof`, or custom functions with type predicates like `value is Type`. The most powerful pattern is discriminated unions, where you have a common property like `type` that TypeScript uses to automatically narrow the type.

I've used this extensively when handling API responses that can be either success or error states, or when working with union types in React components."

**Common Interview Follow-ups:**

Q: "What's the difference between a type predicate and a regular boolean function?"

A: "A regular boolean function just returns true/false, but TypeScript doesn't know what that means for the type. A type predicate uses the `value is Type` syntax to tell TypeScript 'if this function returns true, then value is definitely Type'. This enables type narrowing in the calling code.

For example:
```typescript
// Regular boolean - doesn't narrow
function isString(x: unknown): boolean {
  return typeof x === 'string';
}

// Type predicate - narrows the type
function isStringPredicate(x: unknown): x is string {
  return typeof x === 'string';
}
```

Without the type predicate, TypeScript can't narrow the type because it doesn't know what the boolean means."

Q: "When would you use discriminated unions vs type guards?"

A: "Discriminated unions are my go-to when I control the type definitions, especially for state machines or event systems, because TypeScript narrows automatically based on a literal property. Type guards are necessary when I'm working with external types I can't modify, or when I need complex validation logic.

For example, Redux actions are perfect for discriminated unions with a `type` property, while validating API responses needs custom type guards with predicates."

**Key Takeaways for Beginners:**

1. **Type narrowing** = TypeScript getting smarter about types
2. **Type guards** = Checks that help TypeScript narrow types
3. **Built-in guards** = `typeof`, `instanceof`, `in` operator
4. **Custom guards** = Functions with `value is Type` syntax
5. **Discriminated unions** = Objects with a common `type` property
6. **Always test** = Hover over variables in VSCode to verify TypeScript narrowed correctly

</details>

---

## Question 2: How to create custom type guards with type predicates?

**Answer:**

Custom type guards use type predicates (the `value is Type` syntax) to tell TypeScript how to narrow types. They're essential when built-in guards like `typeof` or `instanceof` aren't sufficient, particularly for interface types, complex validation, or API response handling.

**Basic Type Predicate Syntax:**

```typescript
function isType(value: unknown): value is TargetType {
  //                               ^^^^^^^^^^^^^^^^^^^
  //                               Type predicate
  return /* validation logic */;
}
```

**Simple Examples:**

```typescript
// Example 1: String validation
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string
    console.log(value.toUpperCase());
  }
}

// Example 2: Number validation
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Example 3: Array validation
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) &&
         value.every(item => typeof item === 'string');
}
```

**Interface Type Guards:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
  role: 'admin';
}

// Type guard for User interface
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  );
}

// Type guard for AdminUser
function isAdminUser(value: unknown): value is AdminUser {
  return (
    isUser(value) && // Reuse base type guard
    'permissions' in value &&
    'role' in value &&
    Array.isArray((value as AdminUser).permissions) &&
    (value as AdminUser).role === 'admin'
  );
}

function greetUser(user: unknown) {
  if (isAdminUser(user)) {
    // TypeScript knows user is AdminUser
    console.log(`Admin ${user.name} with ${user.permissions.length} permissions`);
  } else if (isUser(user)) {
    // TypeScript knows user is User
    console.log(`User ${user.name}`);
  } else {
    console.log('Invalid user');
  }
}
```

**API Response Validation:**

```typescript
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
  code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Generic type guard
function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccess<T> {
  return response.success === true && 'data' in response;
}

function isApiError<T>(
  response: ApiResponse<T>
): response is ApiError {
  return response.success === false && 'error' in response;
}

async function fetchUser(id: string) {
  const response: ApiResponse<User> = await fetch(`/api/users/${id}`).then(r => r.json());

  if (isApiSuccess(response)) {
    // TypeScript knows response.data is User
    console.log(response.data.name);
  } else if (isApiError(response)) {
    // TypeScript knows response.error and response.code exist
    console.error(`Error ${response.code}: ${response.error}`);
  }
}
```

**Complex Nested Type Guards:**

```typescript
interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

interface UserProfile {
  user: User;
  address: Address;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

function isAddress(value: unknown): value is Address {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Address).street === 'string' &&
    typeof (value as Address).city === 'string' &&
    typeof (value as Address).country === 'string' &&
    typeof (value as Address).zipCode === 'string'
  );
}

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const profile = value as UserProfile;

  return (
    isUser(profile.user) &&
    isAddress(profile.address) &&
    typeof profile.preferences === 'object' &&
    profile.preferences !== null &&
    (profile.preferences.theme === 'light' || profile.preferences.theme === 'dark') &&
    typeof profile.preferences.notifications === 'boolean'
  );
}
```

**Utility Type Guards:**

```typescript
// Non-null type guard
function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Array of specific type
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}

// Usage
const maybeUsers: unknown = [{ id: '1', name: 'John', email: 'john@example.com' }];

if (isArrayOf(maybeUsers, isUser)) {
  // TypeScript knows maybeUsers is User[]
  maybeUsers.forEach(user => console.log(user.name));
}

// Record type guard
function isRecord<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is Record<string, T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(guard);
}

// Usage
const userMap: unknown = {
  '1': { id: '1', name: 'John', email: 'john@example.com' },
  '2': { id: '2', name: 'Jane', email: 'jane@example.com' }
};

if (isRecord(userMap, isUser)) {
  // TypeScript knows userMap is Record<string, User>
  Object.values(userMap).forEach(user => console.log(user.name));
}
```

**Assertion Functions:**

```typescript
// Assertion function (alternative to type predicate)
function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error('Value is not a valid User');
  }
}

function processUserData(data: unknown) {
  // Throws if not a user, otherwise narrows type
  assertIsUser(data);

  // TypeScript knows data is User here
  console.log(data.name.toUpperCase());
}

// Generic assertion
function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message: string
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message);
  }
}

// Usage
function handleApiResponse(response: unknown) {
  assertType(
    response,
    isApiSuccess,
    'Expected successful API response'
  );

  // TypeScript knows response is ApiSuccess
  console.log(response.data);
}
```

</details>

---

### <details>
<summary><strong>🔍 Deep Dive: Type Predicate Implementation and Advanced Patterns</strong></summary>

**How Type Predicates Work Internally:**

When TypeScript encounters a type predicate function, it creates a special control flow node that affects type narrowing:

```typescript
// TypeScript's internal representation (conceptual)
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// When called:
if (isString(x)) {
  // TypeScript creates a control flow node:
  // - Type of x in consequent branch: string
  // - Type of x in alternate branch: Exclude<typeof x, string>
}

// Compare with regular boolean:
function isStringBoolean(value: unknown): boolean {
  return typeof value === 'string';
}

if (isStringBoolean(x)) {
  // TypeScript creates a control flow node:
  // - Type of x in consequent branch: unknown (unchanged!)
  // - Type of x in alternate branch: unknown (unchanged!)
}
```

**Advanced Type Guard Patterns:**

**1. Branded Types:**

```typescript
// Create branded types for runtime validation
type ValidatedEmail = string & { __brand: 'ValidatedEmail' };
type ValidatedPhone = string & { __brand: 'ValidatedPhone' };

function isValidEmail(value: string): value is ValidatedEmail {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function isValidPhone(value: string): value is ValidatedPhone {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
}

function sendEmail(email: ValidatedEmail) {
  // Only accepts validated emails
  console.log(`Sending email to ${email}`);
}

function processContact(contact: string) {
  if (isValidEmail(contact)) {
    // TypeScript knows contact is ValidatedEmail
    sendEmail(contact); // Type-safe!
  } else if (isValidPhone(contact)) {
    // TypeScript knows contact is ValidatedPhone
    sendSMS(contact);
  }
}
```

**2. Zod-style Schema Validation:**

```typescript
// Create runtime validators with type inference
interface Schema<T> {
  parse(value: unknown): T;
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: string };
  is(value: unknown): value is T;
}

function createSchema<T>(
  validator: (value: unknown) => boolean,
  parser: (value: unknown) => T
): Schema<T> {
  return {
    parse(value: unknown): T {
      if (!validator(value)) {
        throw new Error('Validation failed');
      }
      return parser(value);
    },

    safeParse(value: unknown) {
      if (!validator(value)) {
        return { success: false, error: 'Validation failed' };
      }
      return { success: true, data: parser(value) };
    },

    is(value: unknown): value is T {
      return validator(value);
    }
  };
}

// Usage
const userSchema = createSchema<User>(
  (value): value is User => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'name' in value &&
      'email' in value
    );
  },
  (value) => value as User
);

function handleData(data: unknown) {
  const result = userSchema.safeParse(data);

  if (result.success) {
    // TypeScript knows result.data is User
    console.log(result.data.name);
  } else {
    console.error(result.error);
  }
}
```

**3. Composable Type Guards:**

```typescript
// Build complex guards from simple ones
type TypeGuard<T> = (value: unknown) => value is T;

function and<A, B>(
  guardA: TypeGuard<A>,
  guardB: TypeGuard<B>
): TypeGuard<A & B> {
  return (value: unknown): value is A & B => {
    return guardA(value) && guardB(value);
  };
}

function or<A, B>(
  guardA: TypeGuard<A>,
  guardB: TypeGuard<B>
): TypeGuard<A | B> {
  return (value: unknown): value is A | B => {
    return guardA(value) || guardB(value);
  };
}

function not<T>(guard: TypeGuard<T>): TypeGuard<Exclude<unknown, T>> {
  return (value: unknown): value is Exclude<unknown, T> => {
    return !guard(value);
  };
}

// Usage
const isPositiveNumber: TypeGuard<number> = (value): value is number => {
  return typeof value === 'number' && value > 0;
};

const isNonEmptyString: TypeGuard<string> = (value): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const isValidId = or(isPositiveNumber, isNonEmptyString);

function processId(id: unknown) {
  if (isValidId(id)) {
    // TypeScript knows id is number | string
    console.log(id);
  }
}
```

**4. Recursive Type Guards:**

```typescript
// Handle recursive data structures
interface TreeNode {
  value: string;
  children?: TreeNode[];
}

function isTreeNode(value: unknown): value is TreeNode {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const node = value as TreeNode;

  if (typeof node.value !== 'string') {
    return false;
  }

  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      return false;
    }

    // Recursive validation
    return node.children.every(isTreeNode);
  }

  return true;
}

// Circular reference handling
interface LinkedListNode {
  value: number;
  next?: LinkedListNode;
}

function isLinkedListNode(
  value: unknown,
  visited = new WeakSet<object>()
): value is LinkedListNode {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Prevent infinite recursion
  if (visited.has(value)) {
    return true;
  }
  visited.add(value);

  const node = value as LinkedListNode;

  if (typeof node.value !== 'number') {
    return false;
  }

  if (node.next !== undefined) {
    return isLinkedListNode(node.next, visited);
  }

  return true;
}
```

**5. Performance-Optimized Guards:**

```typescript
// Memoized type guards for expensive validation
function createMemoizedGuard<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => value is T {
  const cache = new WeakMap<object, boolean>();

  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) {
      return guard(value);
    }

    // Check cache
    if (cache.has(value)) {
      return cache.get(value)!;
    }

    // Run guard and cache result
    const result = guard(value);
    cache.set(value, result);
    return result;
  };
}

// Usage with expensive validation
const isComplexUser = createMemoizedGuard((value: unknown): value is User => {
  // Expensive validation logic
  return isUser(value) && expensiveEmailValidation((value as User).email);
});

// Guard is only run once per object instance
function processUsers(users: unknown[]) {
  users.forEach(user => {
    if (isComplexUser(user)) {
      console.log(user.name);
    }
  });
}
```

**6. Type-Safe Error Handling:**

```typescript
// Type guards with error context
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

function validateWithErrors<T>(
  value: unknown,
  validators: Array<{
    check: (value: unknown) => boolean;
    error: string;
  }>
): ValidationResult<T> {
  const errors: string[] = [];

  for (const validator of validators) {
    if (!validator.check(value)) {
      errors.push(validator.error);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: value as T };
}

// Usage
function validateUser(data: unknown): ValidationResult<User> {
  return validateWithErrors<User>(data, [
    {
      check: (v) => typeof v === 'object' && v !== null,
      error: 'Must be an object'
    },
    {
      check: (v) => 'id' in (v as object) && typeof (v as any).id === 'string',
      error: 'Must have string id'
    },
    {
      check: (v) => 'name' in (v as object) && typeof (v as any).name === 'string',
      error: 'Must have string name'
    },
    {
      check: (v) => 'email' in (v as object) && typeof (v as any).email === 'string',
      error: 'Must have string email'
    }
  ]);
}

function handleUserData(data: unknown) {
  const result = validateUser(data);

  if (result.success) {
    // TypeScript knows result.data is User
    console.log(result.data.name);
  } else {
    // TypeScript knows result.errors exists
    console.error('Validation errors:', result.errors.join(', '));
  }
}
```

**7. Generic Constraints with Guards:**

```typescript
// Ensure generic parameters satisfy runtime constraints
function processArray<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(arr)) {
    throw new Error('Expected array');
  }

  const result: T[] = [];

  for (const item of arr) {
    if (guard(item)) {
      result.push(item);
    }
  }

  return result;
}

// Usage with automatic type inference
const users = processArray(unknownData, isUser);
// TypeScript infers users as User[]

// Type-safe filtering
function filterByGuard<T, U extends T>(
  arr: T[],
  guard: (item: T) => item is U
): U[] {
  return arr.filter(guard);
}

// Usage
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark: () => void;
}

const animals: Animal[] = [
  { name: 'Buddy', bark: () => console.log('Woof') } as Dog,
  { name: 'Mittens' }
];

function isDog(animal: Animal): animal is Dog {
  return 'bark' in animal;
}

const dogs = filterByGuard(animals, isDog);
// TypeScript knows dogs is Dog[]
```

</details>

---

### <details>
<summary><strong>🐛 Real-World Scenario: Type Guard Bug in Payment Processing System</strong></summary>

**Context:**
A payment processing system used custom type guards to validate payment method data from multiple providers (Stripe, PayPal, bank transfer). Incorrect type guards caused failed transactions worth $180,000/month and created severe data integrity issues.

**The Buggy Code:**

```typescript
interface StripePayment {
  provider: 'stripe';
  cardToken: string;
  customerId: string;
}

interface PayPalPayment {
  provider: 'paypal';
  email: string;
  transactionId: string;
}

interface BankTransfer {
  provider: 'bank';
  accountNumber: string;
  routingNumber: string;
}

type PaymentMethod = StripePayment | PayPalPayment | BankTransfer;

// ❌ BROKEN: Incomplete validation
function isStripePayment(payment: unknown): payment is StripePayment {
  return (
    typeof payment === 'object' &&
    payment !== null &&
    (payment as StripePayment).provider === 'stripe'
    // Missing cardToken and customerId validation!
  );
}

function isPayPalPayment(payment: unknown): payment is PayPalPayment {
  return (
    typeof payment === 'object' &&
    payment !== null &&
    (payment as PayPalPayment).provider === 'paypal'
    // Missing email and transactionId validation!
  );
}

function processPayment(payment: unknown) {
  if (isStripePayment(payment)) {
    // TypeScript thinks this is safe, but it's not!
    chargeStripe(payment.cardToken, payment.customerId);
    // Runtime error if cardToken or customerId is missing!
  } else if (isPayPalPayment(payment)) {
    chargePayPal(payment.email, payment.transactionId);
    // Runtime error if email or transactionId is missing!
  }
}

// Real data that caused issues:
const corruptedPayment = {
  provider: 'stripe',
  // Missing cardToken and customerId!
};

isStripePayment(corruptedPayment); // Returns true (WRONG!)
processPayment(corruptedPayment); // Runtime error!
```

**Impact Metrics:**
- **Failed transactions**: 1,850 failures/month ($180,000 in failed payments)
- **Data corruption**: 340 payment records with incomplete data
- **User complaints**: 420 support tickets/month about "payment failed"
- **Revenue impact**: $180,000/month in failed transactions
- **Operational cost**: $35,000/month in manual payment reconciliation
- **Compliance risk**: PCI-DSS audit findings due to incomplete validation

**Debugging Process:**

```typescript
// Step 1: Add comprehensive logging
function isStripePayment(payment: unknown): payment is StripePayment {
  console.log('Validating Stripe payment:', JSON.stringify(payment));

  const result = (
    typeof payment === 'object' &&
    payment !== null &&
    (payment as StripePayment).provider === 'stripe'
  );

  console.log('Validation result:', result);
  console.log('Has cardToken?', 'cardToken' in (payment as object));
  console.log('Has customerId?', 'customerId' in (payment as object));

  return result;
}

// Logs revealed:
// Validation result: true
// Has cardToken? false  ← PROBLEM!
// Has customerId? false ← PROBLEM!

// Step 2: Analyze failed transactions
const failedPayments = await db.query(`
  SELECT * FROM payments
  WHERE status = 'failed'
  AND error_message LIKE '%undefined%'
  ORDER BY created_at DESC
  LIMIT 100
`);

console.log('Failed payment samples:');
failedPayments.forEach(p => {
  console.log({
    id: p.id,
    provider: p.provider,
    hasCardToken: !!p.card_token,
    hasCustomerId: !!p.customer_id,
    hasEmail: !!p.email,
    hasTransactionId: !!p.transaction_id
  });
});

// Results:
// { id: 1, provider: 'stripe', hasCardToken: false, hasCustomerId: false }
// { id: 2, provider: 'paypal', hasEmail: false, hasTransactionId: false }
// Pattern: All failures had provider but missing required fields!

// Step 3: Test type guard with edge cases
const testCases = [
  { provider: 'stripe' }, // Missing required fields
  { provider: 'stripe', cardToken: '' }, // Empty string
  { provider: 'stripe', cardToken: null, customerId: null }, // Null values
  { provider: 'stripe', cardToken: 'tok_123' }, // Missing customerId
  { provider: 'stripe', cardToken: 'tok_123', customerId: 'cus_123' } // Valid
];

testCases.forEach((testCase, index) => {
  const isValid = isStripePayment(testCase);
  console.log(`Test case ${index}:`, testCase, '→', isValid);
});

// All returned true! Type guard was accepting everything with provider: 'stripe'
```

**The Fix:**

```typescript
// ✅ SOLUTION 1: Comprehensive type guards
function isStripePayment(payment: unknown): payment is StripePayment {
  if (typeof payment !== 'object' || payment === null) {
    return false;
  }

  const p = payment as Partial<StripePayment>;

  return (
    p.provider === 'stripe' &&
    typeof p.cardToken === 'string' &&
    p.cardToken.length > 0 &&
    typeof p.customerId === 'string' &&
    p.customerId.length > 0
  );
}

function isPayPalPayment(payment: unknown): payment is PayPalPayment {
  if (typeof payment !== 'object' || payment === null) {
    return false;
  }

  const p = payment as Partial<PayPalPayment>;

  return (
    p.provider === 'paypal' &&
    typeof p.email === 'string' &&
    p.email.includes('@') && // Basic email validation
    typeof p.transactionId === 'string' &&
    p.transactionId.length > 0
  );
}

function isBankTransfer(payment: unknown): payment is BankTransfer {
  if (typeof payment !== 'object' || payment === null) {
    return false;
  }

  const p = payment as Partial<BankTransfer>;

  return (
    p.provider === 'bank' &&
    typeof p.accountNumber === 'string' &&
    /^\d{8,17}$/.test(p.accountNumber) && // Validate account number format
    typeof p.routingNumber === 'string' &&
    /^\d{9}$/.test(p.routingNumber) // Validate routing number format (US)
  );
}

// ✅ SOLUTION 2: Schema-based validation with detailed errors
type ValidationError = {
  field: string;
  message: string;
};

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

function validateStripePayment(payment: unknown): ValidationResult<StripePayment> {
  const errors: ValidationError[] = [];

  if (typeof payment !== 'object' || payment === null) {
    return {
      success: false,
      errors: [{ field: 'payment', message: 'Must be an object' }]
    };
  }

  const p = payment as Partial<StripePayment>;

  if (p.provider !== 'stripe') {
    errors.push({ field: 'provider', message: 'Must be "stripe"' });
  }

  if (typeof p.cardToken !== 'string') {
    errors.push({ field: 'cardToken', message: 'Must be a string' });
  } else if (p.cardToken.length === 0) {
    errors.push({ field: 'cardToken', message: 'Cannot be empty' });
  } else if (!p.cardToken.startsWith('tok_')) {
    errors.push({ field: 'cardToken', message: 'Invalid format (must start with tok_)' });
  }

  if (typeof p.customerId !== 'string') {
    errors.push({ field: 'customerId', message: 'Must be a string' });
  } else if (p.customerId.length === 0) {
    errors.push({ field: 'customerId', message: 'Cannot be empty' });
  } else if (!p.customerId.startsWith('cus_')) {
    errors.push({ field: 'customerId', message: 'Invalid format (must start with cus_)' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: p as StripePayment };
}

function processPaymentSafely(payment: unknown) {
  // Validate payment method
  const stripeResult = validateStripePayment(payment);

  if (stripeResult.success) {
    // TypeScript knows stripeResult.data is StripePayment
    try {
      chargeStripe(stripeResult.data.cardToken, stripeResult.data.customerId);
      logSuccess('stripe', stripeResult.data);
    } catch (error) {
      logError('stripe', stripeResult.data, error);
      throw error;
    }
    return;
  }

  // Try other payment methods...
  const paypalResult = validatePayPalPayment(payment);

  if (paypalResult.success) {
    chargePayPal(paypalResult.data.email, paypalResult.data.transactionId);
    return;
  }

  // No valid payment method
  const allErrors = [
    ...stripeResult.errors,
    ...paypalResult.errors
  ];

  throw new Error(
    'Invalid payment method: ' +
    allErrors.map(e => `${e.field}: ${e.message}`).join(', ')
  );
}

// ✅ SOLUTION 3: Discriminated union with runtime validation
type ValidatedPayment = {
  _validated: true; // Brand for validated payments
  method: PaymentMethod;
};

function validatePayment(payment: unknown): ValidatedPayment {
  // Run all validations
  const stripeResult = validateStripePayment(payment);
  if (stripeResult.success) {
    return { _validated: true, method: stripeResult.data };
  }

  const paypalResult = validatePayPalPayment(payment);
  if (paypalResult.success) {
    return { _validated: true, method: paypalResult.data };
  }

  const bankResult = validateBankTransfer(payment);
  if (bankResult.success) {
    return { _validated: true, method: bankResult.data };
  }

  // Collect all errors for detailed reporting
  throw new Error(
    'Payment validation failed:\n' +
    'Stripe: ' + stripeResult.errors.map(e => e.message).join(', ') + '\n' +
    'PayPal: ' + paypalResult.errors.map(e => e.message).join(', ') + '\n' +
    'Bank: ' + bankResult.errors.map(e => e.message).join(', ')
  );
}

// Only accept validated payments
function processValidatedPayment(validated: ValidatedPayment) {
  const { method } = validated;

  switch (method.provider) {
    case 'stripe':
      // TypeScript knows method is StripePayment
      chargeStripe(method.cardToken, method.customerId);
      break;

    case 'paypal':
      // TypeScript knows method is PayPalPayment
      chargePayPal(method.email, method.transactionId);
      break;

    case 'bank':
      // TypeScript knows method is BankTransfer
      processBankTransfer(method.accountNumber, method.routingNumber);
      break;
  }
}
```

**Testing and Monitoring:**

```typescript
// Comprehensive test suite
describe('Payment Type Guards', () => {
  describe('isStripePayment', () => {
    test('accepts valid Stripe payment', () => {
      const valid = {
        provider: 'stripe',
        cardToken: 'tok_123abc',
        customerId: 'cus_456def'
      };
      expect(isStripePayment(valid)).toBe(true);
    });

    test('rejects missing cardToken', () => {
      const invalid = {
        provider: 'stripe',
        customerId: 'cus_456def'
      };
      expect(isStripePayment(invalid)).toBe(false);
    });

    test('rejects empty cardToken', () => {
      const invalid = {
        provider: 'stripe',
        cardToken: '',
        customerId: 'cus_456def'
      };
      expect(isStripePayment(invalid)).toBe(false);
    });

    test('rejects null values', () => {
      const invalid = {
        provider: 'stripe',
        cardToken: null,
        customerId: null
      };
      expect(isStripePayment(invalid)).toBe(false);
    });
  });

  describe('validateStripePayment', () => {
    test('returns detailed errors for invalid payment', () => {
      const invalid = {
        provider: 'stripe',
        cardToken: '',
        customerId: 'invalid'
      };

      const result = validateStripePayment(invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: 'cardToken',
          message: 'Cannot be empty'
        });
        expect(result.errors).toContainEqual({
          field: 'customerId',
          message: 'Invalid format (must start with cus_)'
        });
      }
    });
  });
});

// Runtime monitoring
function monitorPaymentValidation(payment: unknown) {
  const startTime = Date.now();

  try {
    const validated = validatePayment(payment);

    // Log successful validation
    logMetric('payment.validation.success', {
      provider: validated.method.provider,
      duration: Date.now() - startTime
    });

    return validated;
  } catch (error) {
    // Log validation failure
    logMetric('payment.validation.failure', {
      error: error.message,
      duration: Date.now() - startTime,
      paymentData: JSON.stringify(payment)
    });

    // Alert if validation failures spike
    if (getRecentFailureRate() > 0.05) {
      alertOncall('High payment validation failure rate detected');
    }

    throw error;
  }
}
```

**Results After Fix:**
- **Failed transactions**: 1,850 → 23 failures/month (98.8% reduction)
- **Data integrity**: 100% of payments now have complete required fields
- **User complaints**: 420 → 8 support tickets/month (98.1% reduction)
- **Revenue recovery**: $180,000/month in previously failed transactions now succeeding
- **Operational savings**: $35,000/month (eliminated manual reconciliation)
- **Compliance**: Passed PCI-DSS audit with zero findings
- **Validation coverage**: 100% of payment fields validated before processing

**Key Lessons:**
1. **Validate every required field**: Don't just check discriminant properties
2. **Validate types AND values**: Check both `typeof` and actual value constraints
3. **Use detailed error reporting**: Help debug issues quickly
4. **Test edge cases**: Empty strings, null, undefined, malformed data
5. **Monitor validation failures**: Spike in failures indicates data quality issues
6. **Consider schema libraries**: Zod, Yup, io-ts for production-grade validation

</details>

---

### <details>
<summary><strong>⚖️ Trade-offs: Type Predicate Implementation Strategies</strong></summary>

**Strategy 1: Simple Type Predicates**

**Pros:**
- Easy to write and understand
- Fast runtime performance
- No dependencies
- Type-safe

**Cons:**
- Verbose for complex types
- No built-in error messages
- Easy to write incomplete validation
- Hard to compose

**Best for:**
- Simple interfaces (2-5 properties)
- Performance-critical code
- When you control both types and data
- Internal application logic

```typescript
// ✅ Good use case: Simple type
interface Point {
  x: number;
  y: number;
}

function isPoint(value: unknown): value is Point {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof (value as Point).x === 'number' &&
    typeof (value as Point).y === 'number'
  );
}

// ❌ Bad use case: Complex type (too verbose)
interface ComplexConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  // ... 20+ more properties
}

// Writing isComplexConfig by hand is error-prone and verbose
```

**Strategy 2: Schema Validation Libraries (Zod, Yup, io-ts)**

**Pros:**
- Concise schema definitions
- Automatic type inference
- Built-in error messages
- Composable validators
- Runtime and compile-time safety
- Wide ecosystem support

**Cons:**
- External dependency
- Larger bundle size
- Learning curve
- Slight performance overhead
- Can be overkill for simple cases

**Best for:**
- API request/response validation
- Form validation
- Configuration file parsing
- Complex nested structures
- When you need detailed error messages

```typescript
import { z } from 'zod';

// ✅ Excellent for complex validation
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  role: z.enum(['user', 'admin', 'moderator']),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  }),
  createdAt: z.date()
});

type User = z.infer<typeof userSchema>;

function validateUser(data: unknown): User {
  return userSchema.parse(data); // Throws with detailed errors
}

// Safe parsing
function safeValidateUser(data: unknown) {
  const result = userSchema.safeParse(data);

  if (result.success) {
    // TypeScript knows result.data is User
    return result.data;
  } else {
    // TypeScript knows result.error exists
    console.error(result.error.errors);
    return null;
  }
}

// Automatic type guard
function processData(data: unknown) {
  const result = userSchema.safeParse(data);

  if (result.success) {
    // Can use result.data as User
    console.log(result.data.email);
  }
}
```

**Strategy 3: Assertion Functions**

**Pros:**
- Narrows type for entire scope
- Clear error handling
- Good for invariants
- No boolean checks needed

**Cons:**
- Throws exceptions (not always desired)
- Harder to handle errors gracefully
- Can make debugging harder
- Not suitable for validation pipelines

**Best for:**
- Critical invariants
- Development-time checks
- When failure should halt execution
- Guard clauses

```typescript
// ✅ Good for invariants
function assertNonNull<T>(
  value: T,
  name: string
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`${name} must not be null or undefined`);
  }
}

function processUser(user: User | null) {
  assertNonNull(user, 'user');
  // user is User for all code below (no if-block needed)
  console.log(user.name);
  console.log(user.email);
}

// ❌ Bad for expected conditions
function getUser(id: string): User {
  const user = findUserById(id);
  assertNonNull(user, 'user'); // Throws even if user not found is expected
  return user;
}

// ✅ Better approach for expected nulls
function getUserSafe(id: string): User | null {
  return findUserById(id); // Let caller decide how to handle null
}
```

**Strategy 4: Branded Types**

**Pros:**
- Compile-time AND runtime safety
- Prevents misuse of validated data
- Self-documenting code
- Zero runtime overhead after validation

**Cons:**
- Requires casting after validation
- Can be confusing for team members
- Verbose type definitions
- Not suitable for all use cases

**Best for:**
- Security-critical data (emails, passwords)
- Domain-specific types (currency, measurements)
- Preventing primitive obsession
- Ensuring validation happened

```typescript
// ✅ Excellent for domain modeling
type ValidatedEmail = string & { __brand: 'ValidatedEmail' };
type ValidatedPhone = string & { __brand: 'ValidatedPhone' };
type PositiveNumber = number & { __brand: 'PositiveNumber' };

function validateEmail(email: string): ValidatedEmail | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? (email as ValidatedEmail) : null;
}

function sendEmail(to: ValidatedEmail, subject: string, body: string) {
  // Can only be called with validated emails
  console.log(`Sending to ${to}`);
}

// ❌ Compiler prevents this
const rawEmail = "user@example.com";
sendEmail(rawEmail, "Hello", "World"); // Error: string not assignable to ValidatedEmail

// ✅ Must validate first
const validatedEmail = validateEmail(rawEmail);
if (validatedEmail) {
  sendEmail(validatedEmail, "Hello", "World"); // OK
}

// Prevents accidental misuse
function calculatePrice(amount: PositiveNumber, tax: PositiveNumber): PositiveNumber {
  return (amount + tax) as PositiveNumber;
}

// Can't pass negative numbers (at compile time)
const price = -100;
calculatePrice(price, 0.1); // Error: number not assignable to PositiveNumber
```

**Performance Comparison:**

```typescript
// Benchmark: Validate 100,000 objects

// Simple type predicate: ~50ms
function isUserSimple(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// Zod schema: ~180ms
const userSchemaZod = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
});

// io-ts codec: ~150ms
import * as t from 'io-ts';
const userCodec = t.type({
  id: t.string,
  name: t.string,
  email: t.string
});

// Yup schema: ~220ms
import * as yup from 'yup';
const userSchemaYup = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  email: yup.string().required()
});

// Branded type (after validation): ~0ms (compile-time only)
type ValidatedUser = User & { __brand: 'ValidatedUser' };
// No runtime cost, just type system
```

**Decision Matrix:**

| Scenario | Recommended Strategy | Reason |
|----------|---------------------|--------|
| Simple interfaces (< 5 fields) | Type predicate | Easy, fast, no dependencies |
| Complex nested objects | Zod/Yup | Concise, maintainable, good errors |
| API validation | Zod/io-ts | Automatic type inference, detailed errors |
| Form validation | Yup | Rich validation rules, UI integration |
| Critical invariants | Assertion function | Clear contract, fails fast |
| Domain modeling | Branded types | Prevents misuse, self-documenting |
| Performance-critical | Type predicate | Fastest runtime, no overhead |
| External APIs | Type predicate or Zod | Can't modify types, need validation |
| Internal types | Discriminated union | Automatic narrowing, no functions needed |
| Large teams | Zod/Yup | Easier to learn and maintain |

**Combined Approach Example:**

```typescript
// Use different strategies for different purposes

// 1. API validation: Zod
const apiUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// 2. Internal domain types: Branded types
type ValidatedEmail = string & { __brand: 'ValidatedEmail' };
type UserId = string & { __brand: 'UserId' };

// 3. Domain entities: Discriminated unions
type UserState =
  | { status: 'pending'; tempId: string }
  | { status: 'active'; userId: UserId; email: ValidatedEmail }
  | { status: 'suspended'; userId: UserId; reason: string };

// 4. Simple helpers: Type predicates
function isActiveUser(user: UserState): user is { status: 'active'; userId: UserId; email: ValidatedEmail } {
  return user.status === 'active';
}

// 5. Critical checks: Assertions
function assertActiveUser(user: UserState): asserts user is { status: 'active'; userId: UserId; email: ValidatedEmail } {
  if (user.status !== 'active') {
    throw new Error('User must be active');
  }
}

// Usage
async function fetchAndProcessUser(id: string) {
  // Validate API response with Zod
  const apiResponse = await fetch(`/api/users/${id}`).then(r => r.json());
  const validatedData = apiUserSchema.parse(apiResponse);

  // Create domain entity with branded types
  const user: UserState = {
    status: 'active',
    userId: id as UserId,
    email: validatedData.email as ValidatedEmail
  };

  // Check state with type predicate
  if (isActiveUser(user)) {
    sendWelcomeEmail(user.email);
  }

  // Assert critical invariant
  assertActiveUser(user);
  processActiveUser(user);
}
```

</details>

---

### <details>
<summary><strong>💬 Explain to Junior: Custom Type Guards with Type Predicates</strong></summary>

**Simple Analogy:**

Imagine you're a bouncer at a club checking IDs. A regular function just tells you "this person has an ID" (boolean), but a type predicate tells you "this person is over 21" (type information that TypeScript can use).

```typescript
// Regular function: Just returns yes/no
function hasId(person: unknown): boolean {
  return typeof person === 'object' && person !== null && 'id' in person;
}

// Type predicate: Tells TypeScript what the type is
function isAdult(person: unknown): person is { id: string; age: number } {
  //                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                                This is the type predicate!
  return (
    typeof person === 'object' &&
    person !== null &&
    'id' in person &&
    'age' in person &&
    (person as any).age >= 21
  );
}

// Now TypeScript knows more:
function enterClub(person: unknown) {
  if (isAdult(person)) {
    // TypeScript KNOWS person has id and age properties
    console.log(`Welcome, ID: ${person.id}, Age: ${person.age}`);
  }
}
```

**What is a Type Predicate?**

A type predicate is a special return type (`value is Type`) that tells TypeScript: "If this function returns true, then the value is definitely this type."

**Basic Pattern:**

```typescript
function isTypeName(value: unknown): value is TypeName {
  //                                  ^^^^^^^^^^^^^^^^^^
  //                                  Type predicate syntax

  // Validation logic that returns true/false
  return /* checks */;
}
```

**Step-by-Step Example:**

```typescript
// Let's build a type guard for a User

// 1. Define the type
interface User {
  id: string;
  name: string;
  email: string;
}

// 2. Create the type guard
function isUser(value: unknown): value is User {
  // Check 1: Is it an object?
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Now we can safely cast to check properties
  const obj = value as any;

  // Check 2: Does it have all required properties with correct types?
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

// 3. Use it!
function greetUser(data: unknown) {
  if (isUser(data)) {
    // TypeScript KNOWS data is User here
    console.log(`Hello, ${data.name}!`); // Safe to use data.name
    console.log(`Email: ${data.email}`);  // Safe to use data.email
  } else {
    console.log('Invalid user data');
  }
}
```

**Why Do We Need Type Predicates?**

Without type predicates, TypeScript can't narrow types across function boundaries:

```typescript
// ❌ WITHOUT type predicate (doesn't work)
function checkIsString(value: unknown): boolean {
  return typeof value === 'string';
}

function broken(value: unknown) {
  if (checkIsString(value)) {
    // TypeScript still thinks value is unknown!
    value.toUpperCase(); // ERROR!
  }
}

// ✅ WITH type predicate (works!)
function checkIsStringPredicate(value: unknown): value is string {
  //                                              ^^^^^^^^^^^^^^^^
  //                                              This makes it work!
  return typeof value === 'string';
}

function working(value: unknown) {
  if (checkIsStringPredicate(value)) {
    // TypeScript knows value is string
    console.log(value.toUpperCase()); // Works!
  }
}
```

**Common Patterns:**

**1. Checking Property Existence:**

```typescript
interface Dog {
  bark: () => void;
  breed: string;
}

interface Cat {
  meow: () => void;
  color: string;
}

function isDog(animal: Dog | Cat): animal is Dog {
  // Check if 'bark' property exists
  return 'bark' in animal;
}

function petAnimal(animal: Dog | Cat) {
  if (isDog(animal)) {
    console.log(`${animal.breed} says:`);
    animal.bark();
  } else {
    console.log(`${animal.color} cat says:`);
    animal.meow();
  }
}
```

**2. Validating Nested Objects:**

```typescript
interface Address {
  street: string;
  city: string;
}

interface Person {
  name: string;
  address: Address;
}

function isAddress(value: unknown): value is Address {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Address).street === 'string' &&
    typeof (value as Address).city === 'string'
  );
}

function isPerson(value: unknown): value is Person {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as any;

  return (
    typeof obj.name === 'string' &&
    isAddress(obj.address) // Reuse the address guard!
  );
}
```

**3. Array Type Guards:**

```typescript
// Check if something is an array of strings
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === 'string')
  );
}

function processArray(data: unknown) {
  if (isStringArray(data)) {
    // TypeScript knows data is string[]
    data.forEach(str => console.log(str.toUpperCase()));
  }
}
```

**Common Mistakes:**

**Mistake 1: Forgetting to check for null**

```typescript
// ❌ BAD: Crashes if value is null
function isBroken(value: unknown): value is User {
  return typeof value === 'object' && 'name' in value;
  // 'in' operator throws if value is null!
}

// ✅ GOOD: Check for null first
function isGood(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null && // Check null first!
    'name' in value
  );
}
```

**Mistake 2: Not checking property types**

```typescript
// ❌ BAD: Only checks if properties exist
function isBrokenUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value
  );
}

// This would pass:
const fakeUser = { name: 123, email: true };
isBrokenUser(fakeUser); // true, but name and email are wrong types!

// ✅ GOOD: Check property types
function isGoodUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).name === 'string' && // Check type!
    typeof (value as User).email === 'string'   // Check type!
  );
}
```

**Interview Answer Template:**

**Question: "How do you create a custom type guard in TypeScript?"**

**Good Answer:**
"A custom type guard uses a type predicate with the `value is Type` syntax to tell TypeScript how to narrow types. The pattern is:

```typescript
function isType(value: unknown): value is Type {
  return /* validation logic */;
}
```

The key difference from a regular boolean function is the `value is Type` return type. This tells TypeScript that if the function returns true, the value is definitely that type.

For example, to validate a User interface:

```typescript
interface User {
  id: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).name === 'string'
  );
}
```

After calling this guard in an if-statement, TypeScript knows the value is a User and allows you to access its properties safely.

I use custom type guards frequently when validating API responses or handling union types where built-in guards like `typeof` or `instanceof` aren't sufficient."

**Common Interview Follow-ups:**

Q: "What's the difference between a type guard and a type assertion?"

A: "A type guard is a runtime check that validates the type and narrows it safely. A type assertion (`as Type`) is a compile-time-only instruction that tells TypeScript to treat a value as a certain type without any runtime validation.

Type guards are safer because they actually check the data:
```typescript
// Type guard (safe)
if (isUser(data)) {
  // data was validated
  console.log(data.name);
}

// Type assertion (unsafe)
const user = data as User;
console.log(user.name); // Might crash if data isn't actually a User!
```

I prefer type guards for external data like API responses, and only use assertions when I'm absolutely certain of the type, like after validation."

Q: "Can you use type guards with generic types?"

A: "Yes! You can create generic type guards by accepting a guard function as a parameter:

```typescript
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}

// Usage
const data: unknown = [{ id: '1', name: 'John' }];

if (isArrayOf(data, isUser)) {
  // TypeScript knows data is User[]
  data.forEach(user => console.log(user.name));
}
```

This pattern lets you build reusable validation utilities that work with any type."

**Key Takeaways for Beginners:**

1. **Type predicates** = `value is Type` return type
2. **Always check null/undefined** before using `in` operator
3. **Validate property types**, not just existence
4. **Reuse type guards** for nested objects
5. **Test your guards** with edge cases
6. **Use `unknown`** as input type for maximum safety

</details>
