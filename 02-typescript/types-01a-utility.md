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

<details>
<summary><strong>🔍 Deep Dive: Mapped Types Internals</strong></summary>

## Deep Dive: Mapped Types Internals

### How TypeScript Compiles Mapped Types

Mapped types are one of TypeScript's most powerful features for metaprogramming at the type level. Understanding their compilation mechanics reveals how TypeScript achieves zero-runtime-cost type transformations.

**Compilation Phase Processing:**

When TypeScript encounters a mapped type, it performs structural transformations during the type-checking phase. The compiler's type checker (`checker.ts` in the TypeScript codebase) processes mapped types through several steps:

1. **Key Iteration**: The `[K in keyof T]` syntax triggers the compiler to iterate over all keys in type `T`. This uses TypeScript's internal `getIndexInfoOfType` and `getPropertiesOfType` functions to extract all property keys, including string, number, and symbol keys.

2. **Type Remapping**: The `as` clause (introduced in TypeScript 4.1) allows key remapping during iteration. The compiler evaluates the remapping expression for each key, potentially filtering keys by returning `never` or transforming key names using template literal types.

3. **Property Type Transformation**: For each key, the compiler evaluates the property type expression `T[K]`, potentially applying transformations like making properties optional (`?`), readonly, or transforming the value type itself.

**Memory Representation:**

Mapped types exist only at compile-time. At runtime, TypeScript's type system is completely erased. A mapped type like `Partial<User>` produces zero JavaScript code. The type information is used solely for static analysis and developer tooling (autocomplete, error checking).

**Variance and Homomorphic Mapped Types:**

Certain mapped types are "homomorphic," meaning they preserve the optional and readonly modifiers of the original type's properties. The built-in utilities `Partial`, `Required`, `Readonly`, and `Pick` are homomorphic because they use `[K in keyof T]` directly without additional constraints.

```typescript
type User = {
  id: number;
  name?: string;  // optional
  readonly email: string;  // readonly
};

// Homomorphic: Preserves structure
type PartialUser = Partial<User>;
// Result: { id?: number; name?: string; readonly email?: string }
// Notice: readonly is preserved!

// Non-homomorphic: Creates new structure
type RecordUser = Record<keyof User, string>;
// Result: { id: string; name: string; email: string }
// Notice: readonly and optional modifiers are lost
```

**Modifier Mapping:**

The `+` and `-` modifiers control property attributes:

- `+?` or `?`: Makes property optional (default behavior)
- `-?`: Removes optional modifier (makes required)
- `+readonly` or `readonly`: Makes property readonly
- `-readonly`: Removes readonly modifier

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type Required<T> = {
  [K in keyof T]-?: T[K];
};
```

**Template Literal Types in Key Remapping:**

TypeScript 4.1 introduced template literal types, enabling sophisticated key transformations:

```typescript
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<K & string>}Change`]: (value: T[K]) => void;
};

type UserHandlers = EventHandlers<{ name: string; age: number }>;
// Result:
// {
//   onNameChange: (value: string) => void;
//   onAgeChange: (value: number) => void;
// }
```

The `K & string` intersection is necessary because `keyof T` can include symbol and number keys, but template literal types only accept string keys.

**Conditional Type Filtering:**

Mapped types can filter properties using conditional types and `never`:

```typescript
type PickByValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

type StringProps = PickByValueType<User, string>;
// Result: { name: string; email: string }
```

When a key remapping results in `never`, that property is excluded from the final type.

**Recursive Mapped Types:**

Mapped types can be recursive, enabling deep transformations:

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};
```

TypeScript's type system has depth limits (default: 50 levels) to prevent infinite recursion. Deep recursive types can hit these limits with highly nested structures.

**Performance Considerations:**

Complex mapped types can slow down TypeScript compilation, especially when:

1. Applied to large union types (distributive behavior multiplies type complexity)
2. Deeply nested with recursive definitions
3. Combined with complex conditional type logic
4. Used extensively across a large codebase

For large-scale applications, consider:
- Breaking down complex mapped types into simpler composed types
- Using type aliases to cache intermediate transformations
- Avoiding unnecessary deep recursive types
- Leveraging TypeScript's structural typing to reuse types

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: Form State Management Type Safety</strong></summary>

## Real-World Scenario: Form State Management Type Safety

### The Problem: Runtime Type Errors in Form Validation

**Company**: E-commerce platform processing 50,000+ daily orders
**Impact**: Form validation bugs causing 3.2% checkout abandonment rate
**Timeline**: 2-week sprint to fix and ship

**Initial Implementation (Buggy):**

```typescript
// ❌ BEFORE: Loose typing leading to runtime errors
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
  };
}

// Manual form state - prone to typos and mismatches
interface UserFormState {
  values: any;  // ❌ No type safety
  errors: any;  // ❌ No type safety
  touched: any; // ❌ No type safety
}

// Validation function - runtime errors possible
function validateField(fieldName: string, value: any): string | null {
  // ❌ Typo: "fistName" instead of "firstName"
  if (fieldName === 'fistName' && !value) {
    return 'First name is required';
  }
  // ❌ Checking wrong field for email validation
  if (fieldName === 'phone' && !value.includes('@')) {
    return 'Invalid email';
  }
  return null;
}
```

**Production Incident:**

```
ERROR LOG - 2024-01-15 14:23:45
User ID: 892341
Checkout Step: Payment Information
Error: Cannot read property 'street' of undefined
Stack: validateField > checkAddressComplete > processPayment

IMPACT:
- 127 failed checkouts in 2 hours
- $18,540 in lost revenue
- 89 customer support tickets
- 4.2% increase in cart abandonment
```

**Root Cause Analysis:**

1. Field name typos in validation logic ("fistName" vs "firstName")
2. No compile-time checking of nested field paths
3. Form state structure didn't match User interface
4. Missing fields in form state causing undefined errors
5. Type mismatches between form values (strings) and User model (typed values)

**The Solution: Mapped Type-Based Form State**

```typescript
// ✅ AFTER: Type-safe form state using mapped types

// Generic form state with deep path support
type FormState<T> = {
  values: DeepPartial<T>;
  errors: DeepErrorState<T>;
  touched: DeepTouchedState<T>;
};

// Deep partial for allowing incomplete form data
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K];
};

// Error state: each field can have string error or nested errors
type DeepErrorState<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? string | DeepErrorState<U>[]
      : string | DeepErrorState<T[K]>
    : string;
};

// Touched state: tracks which fields user interacted with
type DeepTouchedState<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? boolean | DeepTouchedState<U>[]
      : boolean | DeepTouchedState<T[K]>
    : boolean;
};

// Path type for type-safe field access
type Path<T> = {
  [K in keyof T & string]: T[K] extends object
    ? K | `${K}.${Path<T[K]>}`
    : K;
}[keyof T & string];

type UserPaths = Path<User>;
// Result: "id" | "firstName" | "lastName" | "email" | "phone" |
//         "address" | "address.street" | "address.city" | "address.zipCode" |
//         "address.country" | "preferences" | "preferences.newsletter" |
//         "preferences.smsNotifications"

// Type-safe form implementation
class TypeSafeForm<T> {
  private state: FormState<T>;

  constructor(initialValues: DeepPartial<T>) {
    this.state = {
      values: initialValues,
      errors: {},
      touched: {}
    };
  }

  // ✅ Type-safe field setter with autocomplete
  setFieldValue<K extends Path<T>>(field: K, value: any) {
    // TypeScript ensures 'field' is a valid path
    this.state.values = this.setNestedValue(this.state.values, field, value);
  }

  // ✅ Type-safe error setter
  setFieldError<K extends Path<T>>(field: K, error: string | null) {
    // Compiler ensures field exists
    this.state.errors = this.setNestedValue(this.state.errors, field, error);
  }

  // ✅ Type-safe touched setter
  setFieldTouched<K extends Path<T>>(field: K, touched: boolean) {
    this.state.touched = this.setNestedValue(this.state.touched, field, touched);
  }

  private setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }
}

// Usage with full type safety
const userForm = new TypeSafeForm<User>({
  firstName: '',
  lastName: '',
  email: ''
});

// ✅ Autocomplete works
userForm.setFieldValue('firstName', 'John');
userForm.setFieldValue('address.street', '123 Main St');
userForm.setFieldError('email', 'Invalid email format');

// ❌ TypeScript error: "fistName" doesn't exist
userForm.setFieldValue('fistName', 'John');
// Error: Argument of type '"fistName"' is not assignable to parameter of type 'UserPaths'

// ❌ TypeScript error: Invalid nested path
userForm.setFieldValue('address.invalid', 'test');
// Error: Argument of type '"address.invalid"' is not assignable to parameter of type 'UserPaths'
```

**Type-Safe Validation:**

```typescript
// Validator function with mapped types
type Validator<T> = {
  [K in Path<T>]?: (value: any, formState: DeepPartial<T>) => string | null;
};

const userValidators: Validator<User> = {
  firstName: (value) => !value ? 'First name is required' : null,
  lastName: (value) => !value ? 'Last name is required' : null,
  email: (value) => {
    if (!value) return 'Email is required';
    if (!value.includes('@')) return 'Invalid email format';
    return null;
  },
  'address.zipCode': (value) => {
    if (!value) return 'Zip code is required';
    if (!/^\d{5}$/.test(value)) return 'Zip code must be 5 digits';
    return null;
  },

  // ❌ TypeScript catches invalid field at compile time
  // 'invalidField': (value) => null,
  // Error: Object literal may only specify known properties
};
```

**Results After Implementation:**

```
METRICS - 4 weeks post-deployment:

Compile-Time Safety:
- 0 field name typos (was: 23 in 6 months)
- 0 invalid path access (was: 15 bugs)
- 100% autocomplete coverage for 247 form fields

Runtime Improvements:
- Cart abandonment: 12.3% → 8.1% (-34% improvement)
- Form-related errors: 145/week → 3/week (-98%)
- Checkout success rate: 91.2% → 94.8% (+3.6pp)

Business Impact:
- Additional revenue: $127K/month
- Support tickets: -67% (form issues)
- Developer velocity: +40% (form development time)

Code Quality:
- Type coverage: 67% → 94%
- Lines of validation code: -32% (more reusable)
- Test coverage: 71% → 88% (easier to test)
```

**Advanced Pattern: Conditional Validation:**

```typescript
// Validate fields based on other field values
type ConditionalValidator<T> = {
  [K in Path<T>]?: {
    validate: (value: any, formState: DeepPartial<T>) => string | null;
    dependsOn?: Path<T>[];
  };
};

const advancedValidators: ConditionalValidator<User> = {
  'address.street': {
    validate: (value, form) => {
      // Only required if country is selected
      if (form.address?.country && !value) {
        return 'Street is required when country is provided';
      }
      return null;
    },
    dependsOn: ['address.country']
  },
  phone: {
    validate: (value, form) => {
      // Required if SMS notifications enabled
      if (form.preferences?.smsNotifications && !value) {
        return 'Phone required for SMS notifications';
      }
      return null;
    },
    dependsOn: ['preferences.smsNotifications']
  }
};
```

**Key Lessons:**

1. **Mapped types eliminate entire classes of bugs** - Field name typos become compiler errors
2. **Deep path types enable nested object validation** - Type safety extends to all levels
3. **Generic form state scales across the application** - One implementation for all forms
4. **Type-driven development improves refactoring** - Renaming fields updates all references automatically
5. **Business metrics validate technical decisions** - Type safety directly improved revenue

---

</details>

<details>
<summary><strong>⚖️ Trade-offs: Choosing the Right Mapped Type Pattern</strong></summary>

## Trade-offs: Choosing the Right Mapped Type Pattern

### Decision Matrix for Mapped Type Strategies

When implementing type transformations, choosing the right mapped type pattern involves balancing type safety, developer experience, compilation performance, and maintainability.

**Pattern 1: Built-in Utility Types**

```typescript
type UserUpdate = Partial<User>;
type UserCreate = Omit<User, 'id'>;
```

**Pros:**
- Zero learning curve (standard TypeScript)
- Excellent IDE support and autocomplete
- Fast compilation (optimized by TypeScript compiler)
- Battle-tested and well-documented
- Minimal type complexity

**Cons:**
- Limited to shallow transformations
- Cannot handle conditional logic
- No custom business logic encoding
- May require combining multiple utilities

**When to use:**
- Simple CRUD operations
- API request/response typing
- Standard form state management
- Prototyping and MVPs

**Performance:** Fastest compilation, minimal impact

---

**Pattern 2: Custom Mapped Types**

```typescript
type LoadingState<T> = {
  [K in keyof T]: {
    value: T[K];
    loading: boolean;
    error: string | null;
  };
};
```

**Pros:**
- Encodes domain-specific patterns
- Reusable across similar use cases
- Type-safe and self-documenting
- Single source of truth for common patterns

**Cons:**
- Requires TypeScript knowledge
- More complex error messages
- Harder to debug type issues
- Can impact compilation time with complex types

**When to use:**
- Async state management (loading/error states)
- Event handler generation
- Property name transformations
- Consistent patterns across codebase

**Performance:** Moderate impact, scales with type complexity

---

**Pattern 3: Deep Recursive Mapped Types**

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};
```

**Pros:**
- Handles arbitrarily nested structures
- Single declaration for entire object trees
- Prevents need for manual nested type definitions
- Powerful for complex configuration objects

**Cons:**
- Significant compilation performance impact
- Can hit TypeScript's recursion depth limits (50 levels)
- Complex error messages are hard to decipher
- Difficult to understand for junior developers
- May create overly permissive types

**When to use:**
- Configuration objects with deep nesting
- Theme customization systems
- Complex form state with nested fields
- JSON schema representations

**Performance:** High impact - use sparingly

**Optimization tip:**
```typescript
// Instead of DeepPartial on everything, limit depth
type PartialConfig<T, Depth extends number = 3> = {
  [K in keyof T]?: Depth extends 0
    ? T[K]
    : T[K] extends object
    ? PartialConfig<T[K], Dec<Depth>>
    : T[K];
};
```

---

**Pattern 4: Conditional Mapped Types**

```typescript
type PickByValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};
```

**Pros:**
- Powerful filtering capabilities
- Creates precise subset types
- Reduces boilerplate in API interfaces
- Encodes business rules at type level

**Cons:**
- Complex syntax, steep learning curve
- Harder to reason about behavior
- Limited debugging tooling
- Can create confusing type errors

**When to use:**
- Extracting specific property types (all strings, all functions)
- API response filtering
- Permission-based type filtering
- Type-safe configuration subsetting

**Performance:** Moderate-to-high impact

---

**Pattern 5: Template Literal Mapped Types**

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};
```

**Pros:**
- Generates consistent naming patterns
- Prevents manual property duplication
- Excellent for code generation patterns
- Type-safe accessor methods

**Cons:**
- Only works with string keys (requires `K & string`)
- Can create very large type unions
- Less intuitive autocomplete
- Harder to refactor programmatically

**When to use:**
- Event handler naming (`onChange`, `onClick`)
- Getter/setter generation
- API method naming conventions
- GraphQL resolver typing

**Performance:** Moderate impact, increases with property count

---

### Comparison: Real-World Scenario

**Scenario:** E-commerce product catalog with 50+ properties

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  category: string;
  tags: string[];
  inStock: boolean;
  inventory: {
    warehouse: string;
    quantity: number;
    reserved: number;
  };
  // ... 40+ more properties
}
```

**Approach 1: Built-in Utilities (Recommended for most cases)**

```typescript
type ProductUpdate = Partial<Omit<Product, 'id'>>;
type ProductCreate = Omit<Product, 'id'>;
type ProductPreview = Pick<Product, 'id' | 'name' | 'price' | 'inStock'>;
```

- Compilation time: 12ms
- Developer understanding: Immediate
- Maintenance burden: Low
- Type error clarity: Excellent

**Approach 2: Custom Deep Partial (Overkill for this case)**

```typescript
type ProductUpdate = DeepPartial<Omit<Product, 'id'>>;
```

- Compilation time: 89ms (7.4x slower)
- Developer understanding: Requires documentation
- Maintenance burden: Medium
- Type error clarity: Poor ("Type instantiation is excessively deep")

**Approach 3: Conditional Filtering (Good for specific needs)**

```typescript
type ProductStrings = PickByValueType<Product, string>;
type ProductNumbers = PickByValueType<Product, number>;
```

- Compilation time: 34ms
- Developer understanding: Requires TypeScript knowledge
- Maintenance burden: Low (self-updating)
- Type error clarity: Good

**Recommendation:** Use built-in utilities unless you have a specific, recurring pattern that justifies custom mapped types.

---

### Decision Tree

```
Need type transformation?
│
├─ Simple property modifications? → Use Partial/Required/Readonly/Pick/Omit
│
├─ Nested object (2-3 levels deep)?
│  ├─ Yes, uniform transformation → Custom mapped type
│  └─ Yes, complex logic → Consider if TypeScript is right tool (runtime validation?)
│
├─ Filtering by value type? → Conditional mapped type (PickByValueType)
│
├─ Property name generation? → Template literal mapped type
│
└─ Very deep nesting (4+ levels)?
   ├─ Configuration/JSON → DeepPartial/DeepReadonly (with caution)
   └─ Runtime data → Consider Zod/Yup for runtime validation instead
```

---

### Performance Budget Guidelines

Based on TypeScript compiler benchmarks (TypeScript 5.3):

- **Fast** (<50ms): Built-in utilities, simple custom mapped types
- **Moderate** (50-200ms): Conditional mapped types, shallow recursive types
- **Slow** (200ms-1s): Deep recursive types, complex conditional logic
- **Very Slow** (>1s): Multiple deep recursive types across large codebase

**Optimization strategies:**

1. **Type caching:** Use type aliases to cache intermediate results
   ```typescript
   type UserBase = Omit<User, 'id'>;  // Cache this
   type UserCreate = UserBase & { password: string };
   type UserUpdate = Partial<UserBase>;
   ```

2. **Limit recursion depth:** Add depth parameters to prevent runaway recursion

3. **Avoid type widening:** Be specific with constraints to help the compiler

4. **Use incremental builds:** Enable `incremental: true` in tsconfig.json

---

</details>

<details>
<summary><strong>💬 Explain to Junior: Mapped Types Made Simple</strong></summary>

## Explain to Junior: Mapped Types Made Simple

### The Pizza Order Analogy

Imagine you're building a pizza ordering app. You have a basic pizza type:

```typescript
type Pizza = {
  size: 'small' | 'medium' | 'large';
  crust: 'thin' | 'thick' | 'stuffed';
  toppings: string[];
  extraCheese: boolean;
};
```

Now, your manager asks you to build several features:

1. **Order customization form** - Users should be able to select ANY of these options (all optional)
2. **Menu display** - Show ALL options (all required, no partial menus)
3. **Admin panel** - Lock the menu so prices can't be changed (all readonly)

Without mapped types, you'd have to manually create three separate types:

```typescript
// ❌ Manual approach - LOTS of duplication
type PizzaForm = {
  size?: 'small' | 'medium' | 'large';
  crust?: 'thin' | 'thick' | 'stuffed';
  toppings?: string[];
  extraCheese?: boolean;
};

type PizzaMenu = {
  size: 'small' | 'medium' | 'large';
  crust: 'thin' | 'thick' | 'stuffed';
  toppings: string[];
  extraCheese: boolean;
};

type PizzaAdminView = {
  readonly size: 'small' | 'medium' | 'large';
  readonly crust: 'thin' | 'thick' | 'stuffed';
  readonly toppings: string[];
  readonly extraCheese: boolean;
};
```

**Problems with this approach:**
- If you add a new property (like `sauce: string`), you have to update ALL THREE types
- Easy to make mistakes and have types get out of sync
- Tons of repetition

**Mapped types to the rescue:**

```typescript
// ✅ Mapped type approach - Single source of truth
type PizzaForm = Partial<Pizza>;      // Makes everything optional
type PizzaMenu = Required<Pizza>;     // Makes everything required
type PizzaAdminView = Readonly<Pizza>; // Makes everything readonly
```

That's it! If you add `sauce: string` to `Pizza`, all three types automatically update.

---

### The Secret Recipe: How Mapped Types Work

Think of a mapped type as a **transformation machine**:

1. **Input:** An existing type (like `Pizza`)
2. **Process:** Apply a transformation to each property
3. **Output:** A new type with the transformation applied

The syntax `[K in keyof T]` is like saying "for each property K in type T, do something":

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// Reading this aloud:
// "For each property K in T,
//  create an optional property (?)
//  with the same type as T[K]"
```

**Visual breakdown:**

```
Input:  type Pizza = { size: string; crust: string }

Process: [K in keyof Pizza] loops through:
         K = 'size'
         K = 'crust'

Transform: For each K, create K?: Pizza[K]

Output:  type PartialPizza = { size?: string; crust?: string }
```

---

### Building Your First Custom Mapped Type

Let's say you're building a form and need to track loading states for each field:

```typescript
type User = {
  name: string;
  email: string;
  age: number;
};

// Goal: Create a type where each field has a loading state
// Desired result:
// {
//   name: boolean;    // Is name field loading?
//   email: boolean;   // Is email field loading?
//   age: boolean;     // Is age field loading?
// }
```

**Step-by-step construction:**

```typescript
// Step 1: Loop through each property
type LoadingState<T> = {
  [K in keyof T]: // "For each property K in T..."
};

// Step 2: Decide what type each property should be
type LoadingState<T> = {
  [K in keyof T]: boolean  // "...create a boolean property"
};

// Done! Now use it:
type UserLoadingState = LoadingState<User>;
// Result: { name: boolean; email: boolean; age: boolean }
```

**More practical example:** Track value + loading + error for each field:

```typescript
type FieldState<T> = {
  [K in keyof T]: {
    value: T[K];        // Original type
    loading: boolean;   // Is it loading?
    error: string | null; // Any error?
  };
};

type UserFieldState = FieldState<User>;
// Result:
// {
//   name: { value: string; loading: boolean; error: string | null };
//   email: { value: string; loading: boolean; error: string | null };
//   age: { value: number; loading: boolean; error: string | null };
// }
```

---

### Interview Question: "Explain Mapped Types"

**Template answer for interviews:**

"Mapped types in TypeScript let you create new types by transforming properties of an existing type. They're like a loop that goes through each property and applies a transformation.

The basic syntax is `[K in keyof T]`, which means 'for each key K in type T'. Then you specify what to do with that property.

For example, TypeScript's `Partial<T>` makes all properties optional:

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

The `?` after `K` makes each property optional, and `T[K]` preserves the original type.

In real projects, I've used mapped types for:
- Form state management - making all fields optional for partial updates
- API response typing - transforming backend types to frontend types
- Loading state tracking - wrapping each field with loading/error states

They're powerful because they provide type safety without code duplication - if you change the original type, all mapped types update automatically."

**Follow-up question: "What's a custom mapped type you've created?"**

"I created a type that generates event handlers from a state object:

```typescript
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<K & string>}Change`]: (value: T[K]) => void;
};

type FormState = {
  username: string;
  password: string;
};

type FormHandlers = EventHandlers<FormState>;
// Result:
// {
//   onUsernameChange: (value: string) => void;
//   onPasswordChange: (value: string) => void;
// }
```

This ensured our event handler names stayed consistent and were type-safe. If we added a new field to `FormState`, TypeScript would automatically expect the corresponding handler."

---

### Common Gotchas and How to Fix Them

**Gotcha 1: Symbol and number keys with template literals**

```typescript
// ❌ Error
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K>}`]: () => T[K];
  // Error: K might be symbol or number
};

// ✅ Fix: Intersect with string
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K];
};
```

**Why?** `keyof T` includes string, number, and symbol keys. Template literals only work with strings, so you need `K & string` to narrow it down.

---

**Gotcha 2: Forgetting to preserve optional/readonly modifiers**

```typescript
type User = {
  id: number;
  name?: string;  // Optional
  readonly email: string;  // Readonly
};

// ❌ Loses modifiers
type BadTransform<T> = {
  [K in keyof T]: T[K];
};

type TransformedUser = BadTransform<User>;
// Result: { id: number; name: string; email: string }
// Lost: optional and readonly!

// ✅ Preserves modifiers (homomorphic)
type GoodTransform<T> = {
  [K in keyof T]: T[K];
};
// When used with simple `[K in keyof T]`, TypeScript preserves modifiers
```

---

**Gotcha 3: Deep types hitting recursion limits**

```typescript
// ❌ Can hit 50-level recursion limit
type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

// ✅ Add base cases
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

---

### Practice Exercise

Try creating these mapped types on your own:

1. **Stringify**: Convert all property types to strings
   ```typescript
   type User = { id: number; name: string; age: number };
   // Goal: { id: string; name: string; age: string }
   ```

2. **Nullable**: Make all properties nullable
   ```typescript
   // Goal: { id: number | null; name: string | null; age: number | null }
   ```

3. **Setters**: Generate setter methods
   ```typescript
   // Goal: {
   //   setId: (value: number) => void;
   //   setName: (value: string) => void;
   //   setAge: (value: number) => void;
   // }
   ```

**Solutions:**

```typescript
// 1. Stringify
type Stringify<T> = {
  [K in keyof T]: string;
};

// 2. Nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// 3. Setters
type Setters<T> = {
  [K in keyof T as `set${Capitalize<K & string>}`]: (value: T[K]) => void;
};
```

---

### Key Takeaways for Interviews

1. **Mapped types = type transformations** - Loop through properties and transform them
2. **Syntax:** `[K in keyof T]` means "for each key in T"
3. **Built-in utilities** (`Partial`, `Required`, `Readonly`) are mapped types
4. **Custom mapped types** solve recurring patterns in your codebase
5. **Real benefit:** Type safety without duplication - change once, update everywhere

Remember: Start simple with built-in utilities, create custom mapped types only when you see a pattern repeating across your codebase.

---

</details>

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

<details>
<summary><strong>🔍 Deep Dive: Conditional Types Type System Mechanics</strong></summary>

## Deep Dive: Conditional Types Type System Mechanics

### How TypeScript Evaluates Conditional Types

Conditional types represent one of TypeScript's most sophisticated type-level programming features, enabling types that behave like functions with branching logic. Understanding their evaluation mechanics reveals the power and limitations of TypeScript's type system.

**Basic Evaluation Model:**

The conditional type syntax `T extends U ? X : Y` creates a type-level ternary operator. TypeScript evaluates this during type checking:

1. **Type Assignability Check**: `T extends U` checks if type `T` is assignable to type `U`
2. **Branch Selection**: If true, resolve to type `X`; if false, resolve to type `Y`
3. **Deferred Evaluation**: When `T` is a type parameter, evaluation is deferred until `T` is known

**Extends Semantics:**

The `extends` keyword in conditional types has different semantics than class inheritance:

```typescript
// Structural compatibility check
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;        // true (literal extends string)
type B = IsString<string>;         // true (string extends string)
type C = IsString<'a' | 'b'>;      // Distributes! See below
type D = IsString<number>;         // false (number doesn't extend string)

// It's NOT nominal typing
type UserId = string & { __brand: 'UserId' };
type E = IsString<UserId>;         // true (branded type still extends string)
```

**Distribution Over Union Types:**

When a conditional type's checked type is a naked type parameter, TypeScript automatically distributes the conditional type over union type members:

```typescript
type ToArray<T> = T extends any ? T[] : never;

// Without distribution (hypothetical):
type Result1 = ToArray<string | number>;
// Would be: (string | number)[]

// With distribution (actual behavior):
type Result2 = ToArray<string | number>;
// Becomes: ToArray<string> | ToArray<number>
// Resolves to: string[] | number[]

// Step-by-step distribution:
// 1. T = string | number (union type)
// 2. Distribute: (string extends any ? string[] : never) | (number extends any ? number[] : never)
// 3. Simplify: string[] | number[]
```

**Preventing Distribution:**

Wrap the type parameter in a tuple to prevent distribution:

```typescript
// Distributed (default)
type Distributed<T> = T extends any ? T[] : never;
type D1 = Distributed<string | number>;  // string[] | number[]

// Non-distributed (using tuple wrapper)
type NonDistributed<T> = [T] extends [any] ? T[] : never;
type D2 = NonDistributed<string | number>;  // (string | number)[]
```

The tuple wrapper `[T]` prevents naked type parameter distribution because it's no longer a naked type parameter—it's wrapped in a structural type.

**The Infer Keyword:**

`infer` introduces a type variable within the conditional type's extends clause, allowing pattern matching and extraction:

```typescript
// Extract return type from function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// How it works:
// 1. Check if T extends function pattern
// 2. If yes, capture return type in variable R
// 3. Return R
// 4. If no, return never

function getUser() {
  return { id: 1, name: 'John' };
}

type UserType = ReturnType<typeof getUser>;
// TypeScript matches: () => { id: number; name: string }
// Infers R = { id: number; name: string }
// Returns R
```

**Multiple Infer Clauses:**

You can use multiple `infer` clauses in complex patterns:

```typescript
// Extract first and last parameter types
type FirstAndLast<T> = T extends (first: infer F, ...middle: any[], last: infer L) => any
  ? [F, L]
  : never;

type Params = FirstAndLast<(a: string, b: number, c: boolean) => void>;
// Result: [string, boolean]

// Extract nested Promise type
type UnwrapPromise<T> = T extends Promise<infer U>
  ? U extends Promise<infer V>
    ? UnwrapPromise<V>  // Recursive unwrap
    : U
  : T;

type Deep = UnwrapPromise<Promise<Promise<Promise<string>>>>;
// Result: string
```

**Infer Positioning Matters:**

The position of `infer` determines what gets captured:

```typescript
// Infer from function return
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// Infer from function parameters
type GetParams<T> = T extends (...args: infer P) => any ? P : never;

// Infer from array elements
type GetElement<T> = T extends (infer E)[] ? E : never;
type ArrayElement = GetElement<string[]>;  // string

// Infer from object property
type GetValue<T> = T extends { value: infer V } ? V : never;
type PropValue = GetValue<{ value: number }>;  // number
```

**Contravariance and Covariance:**

TypeScript uses special inference rules for function parameters (contravariant positions):

```typescript
type InferFromContravariant<T> = T extends (arg: infer P) => any ? P : never;

type Test1 = InferFromContravariant<(x: string) => void>;
// Result: string

// With union of functions
type Test2 = InferFromContravariant<
  ((x: string) => void) | ((x: number) => void)
>;
// Result: string & number (intersection!)
// In contravariant positions, unions become intersections

// With multiple infer sites
type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>;
// Result: { a: string } & { b: number }
```

**Recursive Conditional Types:**

TypeScript 4.1+ supports recursive conditional types with tail-call optimization:

```typescript
// Flatten nested arrays to any depth
type DeepFlatten<T> = T extends Array<infer U>
  ? DeepFlatten<U>
  : T;

type Nested = DeepFlatten<string[][][]>;  // string

// Build tuple of specific length (compile-time)
type Tuple<T, N extends number, R extends T[] = []> =
  R['length'] extends N
    ? R
    : Tuple<T, N, [...R, T]>;

type FiveStrings = Tuple<string, 5>;
// Result: [string, string, string, string, string]
```

**Recursion Depth Limits:**

TypeScript has a recursion depth limit (default: 50 levels) to prevent infinite loops:

```typescript
// This will hit recursion limit with deep nesting
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// Very deeply nested type (45+ levels)
type VeryDeep = { a: { b: { c: { /* ... 45+ levels ... */ } } } };
type Partial = DeepPartial<VeryDeep>;  // May hit recursion limit
```

**Performance Characteristics:**

Conditional types have varying performance impacts:

1. **Simple conditionals** (`T extends string ? X : Y`): Fast, O(1)
2. **Distributed conditionals over unions**: O(n) where n = union members
3. **Recursive conditionals**: O(depth) with potential exponential blowup
4. **Multiple infer clauses**: O(pattern complexity)

**Advanced Pattern: Template Literal Type Inference:**

TypeScript 4.1+ allows inferring parts of template literal types:

```typescript
// Extract route parameters
type ExtractParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractParams<Rest>
  : T extends `${string}:${infer Param}`
  ? Param
  : never;

type Route = '/users/:userId/posts/:postId';
type Params = ExtractParams<Route>;
// Result: 'userId' | 'postId'

// Parse version strings
type ParseVersion<T> = T extends `${infer Major}.${infer Minor}.${infer Patch}`
  ? { major: Major; minor: Minor; patch: Patch }
  : never;

type Version = ParseVersion<'1.2.3'>;
// Result: { major: '1'; minor: '2'; patch: '3' }
```

**Type Narrowing with Conditional Types:**

Conditional types enable powerful type narrowing patterns:

```typescript
// Filter out null/undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type Safe = NonNullable<string | null | undefined>;  // string

// Extract function types from union
type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type Methods = FunctionProperties<{
  name: string;
  getName: () => string;
  age: number;
  setAge: (age: number) => void;
}>;
// Result: 'getName' | 'setAge'
```

**Compiler Optimization:**

TypeScript caches conditional type resolutions for performance:

```typescript
// Cached resolution
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // Computed once
type B = IsString<string>;  // Cache hit (same type)
type C = IsString<number>;  // New computation
```

The type checker maintains a resolution cache, making repeated type checks O(1) after the first evaluation.

---

</details>

<details>
<summary><strong>🐛 Real-World Scenario: API Type Inference System</strong></summary>

## Real-World Scenario: API Type Inference System

### The Problem: Manual Type Declarations for 200+ API Endpoints

**Company**: SaaS platform with microservices architecture (12 services, 200+ endpoints)
**Impact**: 40% of production bugs from API type mismatches
**Timeline**: 3-week sprint to implement automated type inference

**Initial Implementation (Buggy):**

```typescript
// ❌ BEFORE: Manual type declarations for every endpoint

// Manual declaration for each endpoint - prone to drift
interface GetUserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;  // ❌ Should be Date but typed as string
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;  // ❌ Backend doesn't accept this field anymore
}

interface CreatePostRequest {
  title: string;
  content: string;
  authorId: number;  // ❌ Changed to string in backend
}

// API client without type safety
class APIClient {
  async getUser(id: number): Promise<GetUserResponse> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();  // ❌ No runtime validation
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<GetUserResponse> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage - runtime errors waiting to happen
async function example() {
  const user = await api.getUser(123);

  // ❌ createdAt is string, not Date - crashes at runtime
  const daysSinceCreation = Date.now() - user.createdAt.getTime();

  // ❌ Backend rejects 'age' field - API returns 400
  await api.updateUser(123, { name: 'John', age: 30 });

  // ❌ authorId type mismatch - API returns validation error
  await api.createPost({ title: 'Test', content: 'Content', authorId: 123 });
}
```

**Production Incident:**

```
ERROR LOG - 2024-02-20 09:14:32
Service: User Dashboard
Endpoint: PATCH /api/users/:id
Error: TypeError: user.createdAt.getTime is not a function

IMPACT (24 hours):
- 2,847 user dashboard errors
- 156 failed profile updates (backend rejecting unknown 'age' field)
- 89 failed post creations (authorId type mismatch)
- 12.3% increase in support tickets
- 3 hours of team debugging time

ROOT CAUSES:
1. Manual type declarations out of sync with backend (14 endpoints affected)
2. No compile-time validation of request payload structures
3. No runtime type validation
4. Backend schema changes not reflected in frontend types
5. Different string/number/Date representations between backend and frontend
```

**Root Cause Analysis:**

1. **Type drift**: Manual frontend types diverged from backend over 6 months
2. **No single source of truth**: Types duplicated across 8 frontend repositories
3. **Silent failures**: Type mismatches only discovered at runtime
4. **Refactoring hazards**: Backend breaking changes had no compile-time warnings
5. **Developer burden**: 40+ hours/month spent manually updating types

**The Solution: Conditional Type-Based API Type Inference**

```typescript
// ✅ AFTER: Automatic type inference from API schema

// Define API endpoint schema (single source of truth)
type APISchema = {
  'GET /api/users/:id': {
    params: { id: number };
    response: {
      id: number;
      name: string;
      email: string;
      createdAt: string;  // Backend returns ISO string
      role: 'admin' | 'user' | 'guest';
    };
  };
  'PATCH /api/users/:id': {
    params: { id: number };
    body: {
      name?: string;
      email?: string;
      // Note: 'age' removed - no longer in schema
    };
    response: {
      id: number;
      name: string;
      email: string;
      createdAt: string;
      role: 'admin' | 'user' | 'guest';
    };
  };
  'POST /api/posts': {
    body: {
      title: string;
      content: string;
      authorId: string;  // ✅ Updated to string
    };
    response: {
      id: string;
      title: string;
      content: string;
      authorId: string;
      createdAt: string;
    };
  };
};

// Extract route parameters using conditional types + infer
type ExtractParams<T extends string> =
  T extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: number | string }
    : T extends `${infer Start}/:${infer Param}`
    ? { [K in Param]: number | string }
    : {};

type UserIdParam = ExtractParams<'GET /api/users/:id'>;
// Result: { id: number | string }

// Transform backend types to frontend types
type TransformResponse<T> = {
  [K in keyof T]: T[K] extends string
    ? K extends 'createdAt' | 'updatedAt'
      ? Date  // ✅ Transform ISO strings to Date objects
      : T[K]
    : T[K] extends object
    ? TransformResponse<T[K]>
    : T[K];
};

// Extract method and path from endpoint string
type ParseEndpoint<T extends string> =
  T extends `${infer Method} ${infer Path}`
    ? { method: Method; path: Path }
    : never;

type Endpoint1 = ParseEndpoint<'GET /api/users/:id'>;
// Result: { method: 'GET'; path: '/api/users/:id' }

// Get endpoint config from schema
type GetEndpoint<T extends keyof APISchema> = APISchema[T];

// Infer params type
type InferParams<T> = T extends { params: infer P } ? P : never;

// Infer body type
type InferBody<T> = T extends { body: infer B } ? B : never;

// Infer response type (with transformation)
type InferResponse<T> = T extends { response: infer R }
  ? TransformResponse<R>
  : never;

// Type-safe API client
class TypeSafeAPIClient {
  async request<E extends keyof APISchema>(
    endpoint: E,
    options: {
      params?: InferParams<GetEndpoint<E>>;
      body?: InferBody<GetEndpoint<E>>;
    } = {}
  ): Promise<InferResponse<GetEndpoint<E>>> {
    const { method, path } = this.parseEndpoint(endpoint);

    // Replace params in path
    let finalPath = path;
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, String(value));
      });
    }

    // Make request
    const response = await fetch(finalPath, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();

    // Transform response (dates, etc.)
    return this.transformResponse(data);
  }

  private parseEndpoint(endpoint: string) {
    const [method, path] = endpoint.split(' ');
    return { method, path };
  }

  private transformResponse<T>(data: T): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'object') {
      const result: any = Array.isArray(data) ? [] : {};

      for (const [key, value] of Object.entries(data)) {
        // Transform date fields
        if ((key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
          result[key] = new Date(value);
        } else if (typeof value === 'object') {
          result[key] = this.transformResponse(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    return data;
  }
}

// Usage with full type safety
const api = new TypeSafeAPIClient();

async function example() {
  // ✅ All parameters inferred and type-checked
  const user = await api.request('GET /api/users/:id', {
    params: { id: 123 }
  });

  // ✅ TypeScript knows createdAt is Date (transformed)
  const daysSinceCreation = Date.now() - user.createdAt.getTime();
  console.log(`Created ${Math.floor(daysSinceCreation / 86400000)} days ago`);

  // ✅ Type error: 'age' doesn't exist in UpdateUserRequest body type
  await api.request('PATCH /api/users/:id', {
    params: { id: 123 },
    body: { name: 'John', age: 30 }  // ❌ Error: Object literal may only specify known properties
  });

  // ✅ Correct: only valid fields
  await api.request('PATCH /api/users/:id', {
    params: { id: 123 },
    body: { name: 'John', email: 'john@example.com' }
  });

  // ✅ Type error: authorId must be string
  await api.request('POST /api/posts', {
    body: { title: 'Test', content: 'Content', authorId: 123 }  // ❌ Error: Type 'number' is not assignable to type 'string'
  });

  // ✅ Correct: authorId as string
  const post = await api.request('POST /api/posts', {
    body: { title: 'Test', content: 'Content', authorId: '123' }
  });

  // ✅ Full autocomplete for all properties
  console.log(post.id, post.title, post.authorId);
}
```

**Advanced: Generate Types from OpenAPI Schema**

```typescript
// Generate APISchema from OpenAPI/Swagger spec
type OpenAPIToAPISchema<T> = {
  [K in keyof T as `${T[K] extends { method: infer M } ? M : never} ${K & string}`]: {
    params: ExtractParams<K & string>;
    body: T[K] extends { requestBody: infer B } ? B : never;
    response: T[K] extends { response: infer R } ? R : never;
  };
};

// Runtime schema validation with Zod
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  role: z.enum(['admin', 'user', 'guest'])
});

// Combine TypeScript types with runtime validation
type ValidatedResponse<T> = TransformResponse<z.infer<typeof T>>;
```

**Results After Implementation:**

```
METRICS - 6 weeks post-deployment:

Type Safety Improvements:
- Compile-time type errors caught: 147 issues (before production)
- Runtime API type errors: 2,847/month → 12/month (-99.6%)
- Type drift incidents: 14 → 0 (schema as single source of truth)
- Test coverage: 68% → 91% (easier to test typed APIs)

Developer Experience:
- Time spent on type maintenance: 40 hrs/month → 2 hrs/month (-95%)
- API integration time: -60% (auto-inferred types)
- Autocomplete coverage: 100% for all 200+ endpoints
- Refactoring confidence: "High" (compiler catches breaking changes)

Business Impact:
- User dashboard errors: -98%
- Failed API requests: 2.3% → 0.4% (-83%)
- Support tickets (type-related): -89%
- Backend breaking changes detected pre-deployment: 23 (prevented incidents)

Code Quality:
- Lines of type code: 4,200 → 800 (-81%, schema-driven)
- Type coverage: 71% → 96%
- API client code reuse: 100% (single generic client)
```

**Key Lessons:**

1. **Conditional types enable powerful code generation** - Infer types from schema strings
2. **Single source of truth eliminates drift** - Schema drives all types
3. **Type-level programming catches errors early** - 99.6% reduction in runtime type errors
4. **Developer experience compounds productivity** - Autocomplete and type safety accelerate development
5. **Refactoring becomes safe** - Breaking changes are compiler errors

---

</details>

<details>
<summary><strong>⚖️ Trade-offs: Conditional Type Complexity vs. Simplicity</strong></summary>

## Trade-offs: Conditional Type Complexity vs. Simplicity

### Decision Matrix for Conditional Type Usage

Conditional types are powerful but come with complexity costs. Choosing when to use them requires balancing type safety, maintainability, and developer experience.

**Strategy 1: Avoid Conditional Types (Simple Manual Types)**

```typescript
// Simple manual type declarations
type User = { id: number; name: string; email: string };
type UserUpdate = { name?: string; email?: string };
type UserCreate = { name: string; email: string };
```

**Pros:**
- Immediate readability - junior developers understand instantly
- Zero learning curve
- Explicit and searchable
- Fast compilation (no type-level computation)
- Clear IDE hints and autocomplete

**Cons:**
- High duplication - must update multiple types for schema changes
- Prone to drift - types can get out of sync
- No automation - manual work for every endpoint
- Refactoring burden - must find/replace across many type declarations

**When to use:**
- Small projects (<20 types)
- Simple CRUD with stable schemas
- Teams with junior TypeScript developers
- Prototypes and MVPs
- Codebases with low type reuse

**Performance:** Fastest compilation, zero overhead

---

**Strategy 2: Simple Conditional Types (Built-in Utilities)**

```typescript
type UserUpdate = Partial<User>;
type UserRequired = Required<User>;
type UserReadonly = Readonly<User>;
```

**Pros:**
- Moderate learning curve (standard TypeScript)
- DRY - single source of truth
- Refactoring-friendly - change User once
- Good IDE support
- Low complexity

**Cons:**
- Limited to simple transformations
- Cannot encode complex business logic
- May need multiple utility combinations
- Less explicit than manual types

**When to use:**
- Medium projects (20-100 types)
- Standard transformations (optional, readonly, pick, omit)
- Teams comfortable with TypeScript basics
- Stable schemas with occasional updates

**Performance:** Fast compilation, minimal overhead

---

**Strategy 3: Custom Conditional Types (Moderate Complexity)**

```typescript
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

type StringFields = PickByType<User, string>;
```

**Pros:**
- Encodes domain patterns
- Highly reusable
- Type-safe and self-documenting
- Powerful filtering/transformation

**Cons:**
- Requires TypeScript expertise
- Harder to debug type errors
- Steeper learning curve for team
- Can impact compilation performance

**When to use:**
- Large projects (100+ types)
- Recurring patterns across codebase
- Teams with strong TypeScript skills
- Complex domain models
- Type-driven development workflows

**Performance:** Moderate impact (50-200ms for complex types)

---

**Strategy 4: Advanced Conditional Types (High Complexity)**

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type ExtractParams<T extends string> =
  T extends `${string}:${infer P}/${infer R}`
    ? { [K in P | keyof ExtractParams<R>]: string }
    : T extends `${string}:${infer P}`
    ? { [K in P]: string }
    : {};
```

**Pros:**
- Maximum automation and code generation
- Extremely DRY - schemas generate all types
- Powerful type inference (API routes, GraphQL, etc.)
- Catches entire classes of errors

**Cons:**
- Very steep learning curve
- Complex error messages ("Type instantiation is excessively deep")
- Significant compilation performance impact
- Difficult to maintain and debug
- Can hit TypeScript recursion limits

**When to use:**
- Large-scale systems (200+ endpoints, complex schemas)
- Schema-driven development (OpenAPI, GraphQL)
- Teams with TypeScript experts
- High type safety requirements
- Code generation pipelines

**Performance:** High impact (200ms-2s for deep recursive types)

**Mitigation strategies:**
- Add depth limits to recursive types
- Use type caching with intermediate aliases
- Enable `incremental` compilation
- Document complex types thoroughly

---

### Comparison: E-commerce Product Catalog (500+ Products, 30+ Fields)

**Scenario:** Product catalog with complex filtering and transformations

**Approach 1: Manual Types (Simple)**

```typescript
type Product = { id: string; name: string; price: number; /* ...30 fields */ };
type ProductPreview = { id: string; name: string; price: number };
type ProductUpdate = { name?: string; price?: number; /* ...15 optional fields */ };
type ProductStrings = { name: string; description: string; category: string };
```

- Lines of code: ~200
- Duplication: High
- Compilation: <10ms
- Maintenance: 4-6 hours/month for schema updates

**Approach 2: Built-in Utilities (Moderate)**

```typescript
type Product = { /* 30 fields */ };
type ProductPreview = Pick<Product, 'id' | 'name' | 'price'>;
type ProductUpdate = Partial<Omit<Product, 'id' | 'createdAt'>>;
```

- Lines of code: ~50
- Duplication: Low
- Compilation: <50ms
- Maintenance: 1-2 hours/month

**Approach 3: Custom Conditional Types (Advanced)**

```typescript
type Product = { /* 30 fields */ };
type PickByType<T, U> = { [K in keyof T as T[K] extends U ? K : never]: T[K] };
type ProductStrings = PickByType<Product, string>;
type ProductNumbers = PickByType<Product, number>;
type ProductUpdate = Partial<Omit<Product, 'id' | `${string}At`>>;  // Auto-exclude timestamp fields
```

- Lines of code: ~30
- Duplication: Minimal
- Compilation: ~120ms
- Maintenance: <30 minutes/month (mostly automatic)

**Recommendation:**
- <50 products → Manual types
- 50-200 products → Built-in utilities
- 200+ products, complex schema → Custom conditional types

---

### Decision Tree

```
Need type transformation?
│
├─ Team TypeScript level?
│  ├─ Beginner → Manual types or simple utilities only
│  ├─ Intermediate → Built-in utilities + simple custom types
│  └─ Advanced → Full conditional types allowed
│
├─ Codebase size?
│  ├─ <20 types → Manual types (simplicity wins)
│  ├─ 20-100 types → Built-in utilities
│  └─ 100+ types → Custom conditional types
│
├─ Schema stability?
│  ├─ Frequent changes → Conditional types (DRY principle)
│  └─ Stable schema → Manual types acceptable
│
└─ Type safety requirements?
   ├─ Low (internal tools) → Simple manual types
   ├─ Medium (B2B SaaS) → Built-in utilities
   └─ High (fintech, healthcare) → Advanced conditional types
```

---

### Performance Budget

TypeScript 5.3 benchmarks for 1,000 type evaluations:

| Strategy | Compilation Time | Memory Usage | Error Quality |
|----------|------------------|--------------|---------------|
| Manual types | 8ms | 12 MB | Excellent |
| Built-in utilities | 42ms | 24 MB | Good |
| Custom conditionals | 156ms | 48 MB | Moderate |
| Deep recursive | 1,240ms | 120 MB | Poor |

**Best practices:**

1. **Progressive enhancement**: Start simple, add complexity only when justified
2. **Type caching**: Alias intermediate complex types to improve performance
3. **Avoid premature optimization**: Don't use conditional types "because it's cool"
4. **Document complex types**: Add JSDoc explaining what advanced types do
5. **Team alignment**: Ensure entire team understands chosen complexity level

---

</details>

<details>
<summary><strong>💬 Explain to Junior: Conditional Types Made Simple</strong></summary>

## Explain to Junior: Conditional Types Made Simple

### The Traffic Light Analogy

Imagine you're building a type system that acts like a traffic light for your code:

```typescript
type CanDrive<Age extends number> = Age extends 16 | 17 | 18 | 19 | 20 /* etc */
  ? 'Yes, you can drive'
  : 'No, too young';

type Minor = CanDrive<15>;  // 'No, too young'
type Adult = CanDrive<18>;  // 'Yes, you can drive'
```

That's a conditional type! It checks a condition (`Age extends allowed ages`) and returns one type if true, another if false.

**The basic pattern:**

```typescript
type ConditionalType<T> = T extends SomeType ? TypeIfTrue : TypeIfFalse;
```

Think of it as a type-level `if-else` statement:

```typescript
// Runtime JavaScript if-else
function canDrive(age: number) {
  if (age >= 16) {
    return 'Yes';
  } else {
    return 'No';
  }
}

// Type-level conditional
type CanDrive<Age extends number> = Age extends 16
  ? 'Yes'
  : 'No';
```

---

### The Magic of Infer: Pattern Matching for Types

`infer` is like a detective that extracts information from types. Think of it as "capture this part of the type pattern."

**Real-world analogy:** Extracting information from a sentence

```typescript
// Sentence: "The user's name is John"
// Pattern: "The user's name is [NAME]"
// Extract: "John"

// Type version:
type ExtractName<T> = T extends `The user's name is ${infer Name}`
  ? Name
  : never;

type UserName = ExtractName<'The user's name is John'>;
// Result: 'John'
```

**Common use case: Extracting function return types**

```typescript
// Without infer (impossible)
type ReturnType<T> = /* How do we get the return type?? */

// With infer (captures return type in variable R)
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'John' };
}

type User = ReturnType<typeof getUser>;
// Result: { id: number; name: string }

// What happened:
// 1. TypeScript checks: Does getUser match (...args: any[]) => something?
// 2. Yes! It's a function
// 3. Capture the "something" (return type) in variable R
// 4. Return R
```

---

### Understanding Distribution: Conditional Types with Unions

This is where conditional types get "magical" (and sometimes confusing).

**The rule:** When a conditional type sees a union, it processes each member separately.

```typescript
type ToArray<T> = T extends any ? T[] : never;

// Input: string | number
// Step 1: TypeScript sees a union, so it distributes
// Step 2: Process separately
//   - ToArray<string> = string[]
//   - ToArray<number> = number[]
// Step 3: Combine results
//   - string[] | number[]

type Result = ToArray<string | number>;
// Result: string[] | number[]  (NOT (string | number)[])
```

**Visual breakdown:**

```
Without distribution (hypothetical):
ToArray<string | number>
→ (string | number)[]
→ Array that can hold strings OR numbers

With distribution (actual behavior):
ToArray<string | number>
→ ToArray<string> | ToArray<number>
→ string[] | number[]
→ Array of ONLY strings OR array of ONLY numbers
```

**When you don't want distribution:**

```typescript
// Wrap in tuple to prevent distribution
type NoDistribute<T> = [T] extends [any] ? T[] : never;

type Result1 = NoDistribute<string | number>;
// Result: (string | number)[]  (NOT distributed)

type Result2 = ToArray<string | number>;
// Result: string[] | number[]  (distributed)
```

---

### Building Your First Conditional Type

**Goal:** Create a type that extracts the first element type from an array.

**Step-by-step:**

```typescript
// Step 1: Check if it's an array pattern
type GetFirst<T> = T extends Array<any> ? /* something */ : never;

// Step 2: Use infer to capture element type
type GetFirst<T> = T extends Array<infer Element> ? Element : never;

// Step 3: Extract just the first element (advanced)
type GetFirst<T> = T extends [infer First, ...any[]] ? First : never;

// Test it
type StringArray = GetFirst<[string, number, boolean]>;
// Result: string

type NumberArray = GetFirst<number[]>;
// Result: number

type NotArray = GetFirst<string>;
// Result: never (not an array)
```

---

### Interview Question: "Explain Conditional Types"

**Template answer for interviews:**

"Conditional types in TypeScript let you choose between types based on a condition, similar to a ternary operator for types. The syntax is `T extends U ? X : Y`.

For example, here's a type that checks if something is a string:

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;  // true
type B = IsString<number>;   // false
```

One powerful feature is the `infer` keyword, which lets you extract types from patterns. For example, extracting a function's return type:

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'John' };
}

type User = ReturnType<typeof getUser>;
// Result: { id: number; name: string }
```

Conditional types also distribute over unions, meaning they process each union member separately:

```typescript
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
// Result: string[] | number[] (NOT (string | number)[])
```

In real projects, I've used conditional types for:
- Extracting API response types from endpoint definitions
- Creating type-safe form builders
- Unwrapping Promise types for async functions
- Building utility types like `NonNullable` and `Awaited`

They're especially useful when you want types that adapt based on their input, making your codebase more maintainable."

**Follow-up: "What's the difference between `infer` in functions vs objects?"**

"`infer` works the same way in both—it captures a type from a pattern—but the pattern differs:

For functions, you typically infer return types or parameter types:

```typescript
// Infer return type
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;

// Infer parameters
type GetParams<T> = T extends (...args: infer P) => any ? P : never;
```

For objects, you infer property value types:

```typescript
// Infer property type
type GetProp<T, K extends keyof T> = T extends { [Key in K]: infer V } ? V : never;

type User = { name: string; age: number };
type Name = GetProp<User, 'name'>;  // string
```

The key difference is the pattern you're matching against—function patterns use `(...) => ...`, while object patterns use `{ prop: ... }`."

---

### Common Gotchas and Fixes

**Gotcha 1: Distribution when you don't want it**

```typescript
// ❌ Distributes (probably not what you want)
type WrapInArray<T> = T extends any ? T[] : never;
type Result = WrapInArray<string | number>;
// Result: string[] | number[]

// ✅ Prevent distribution with tuple
type WrapInArray<T> = [T] extends [any] ? T[] : never;
type Result = WrapInArray<string | number>;
// Result: (string | number)[]
```

---

**Gotcha 2: Forgetting `never` in the false branch**

```typescript
// ❌ Might return unexpected types
type StringsOnly<T> = T extends string ? T : unknown;

// ✅ Use never to filter out non-matching types
type StringsOnly<T> = T extends string ? T : never;

type Filtered = StringsOnly<'a' | 'b' | 1 | 2>;
// Result: 'a' | 'b' (numbers filtered out)
```

---

**Gotcha 3: Circular types without base case**

```typescript
// ❌ Infinite recursion
type DeepArray<T> = T extends Array<infer U> ? DeepArray<U> : T;

// ✅ Add base case
type DeepArray<T> = T extends Array<infer U>
  ? U extends Array<any>
    ? DeepArray<U>  // Recurse only if still an array
    : U
  : T;
```

---

### Practice Exercises

**Exercise 1:** Create a type that unwraps Promises

```typescript
type Awaited<T> = // Your code here

type Test1 = Awaited<Promise<string>>;  // Should be: string
type Test2 = Awaited<Promise<Promise<number>>>;  // Should be: number
type Test3 = Awaited<string>;  // Should be: string
```

**Solution:**

```typescript
type Awaited<T> = T extends Promise<infer U>
  ? Awaited<U>  // Recursive unwrap
  : T;
```

---

**Exercise 2:** Extract all function types from an object

```typescript
type FunctionProps<T> = // Your code here

type Obj = {
  name: string;
  getName: () => string;
  age: number;
  getAge: () => number;
};

type Functions = FunctionProps<Obj>;
// Should be: 'getName' | 'getAge'
```

**Solution:**

```typescript
type FunctionProps<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
```

---

**Exercise 3:** Create a type that makes properties readonly if they're objects

```typescript
type DeepReadonlyObjects<T> = // Your code here

type Test = DeepReadonlyObjects<{
  name: string;           // Not readonly (string)
  age: number;            // Not readonly (number)
  address: {              // Readonly (object)
    street: string;
    city: string;
  };
}>;
```

**Solution:**

```typescript
type DeepReadonlyObjects<T> = {
  [K in keyof T]: T[K] extends object
    ? Readonly<T[K]>
    : T[K];
};
```

---

### Key Takeaways for Interviews

1. **Conditional types = type-level if-else** - `T extends U ? X : Y`
2. **Infer = pattern matching** - Capture types from patterns
3. **Distribution over unions** - Processes each union member separately
4. **Prevent distribution with tuples** - `[T] extends [any]`
5. **Use never for filtering** - False branch should usually be `never`
6. **Add base cases for recursion** - Prevent infinite type loops

Remember: Conditional types are advanced TypeScript—use them when simpler approaches (like `Pick`, `Omit`) don't suffice. Start simple, add complexity only when justified.

</details>

---


