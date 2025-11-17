# TypeScript Advanced Patterns

> Advanced type patterns: template literals, recursion, and deep operations

---

## Questions 4-15: Advanced Type Patterns

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Consolidated coverage of advanced TypeScript patterns**

### Q4-6: Utility Types Deep Dive

```typescript
// Partial - Makes all properties optional
type User = { id: number; name: string; email: string };
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// Required - Makes all properties required
type RequiredUser = Required<PartialUser>;

// Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit - Exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string }

// Record - Create object type with specific keys
type UserRoles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean }

// Exclude - Remove types from union
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract - Extract types from union
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;
// 'a'

// NonNullable - Remove null and undefined
type T3 = NonNullable<string | number | null | undefined>;
// string | number

// ReturnType - Extract function return type
function getUser() {
  return { id: 1, name: 'John' };
}
type User2 = ReturnType<typeof getUser>;

// Parameters - Extract function parameters
type Params = Parameters<typeof getUser>;
// []
```

### Q7-9: Template Literal Types & String Manipulation

```typescript
// Template literal types
type Color = 'red' | 'blue' | 'green';
type Quantity = 'one' | 'two' | 'three';
type ColorQuantity = `${Quantity}-${Color}`;
// 'one-red' | 'one-blue' | ... | 'three-green'

// Uppercase, Lowercase, Capitalize, Uncapitalize
type Loud = Uppercase<'hello'>; // 'HELLO'
type Quiet = Lowercase<'WORLD'>; // 'world'
type Titled = Capitalize<'hello'>; // 'Hello'
type Untitled = Uncapitalize<'Hello'>; // 'hello'

// Event handler types
type EventName = 'click' | 'focus' | 'blur';
type EventHandler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'
```

### Q10-12: Recursive Types & Deep Operations

```typescript
// Deep Partial
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type NestedUser = {
  info: { name: string; age: number };
  settings: { theme: string };
};

type PartialNested = DeepPartial<NestedUser>;
// All properties deeply optional

// Deep Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// Path extraction
type PathOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type Paths = PathOf<{ user: { name: string; age: number } }>;
// 'user' | 'user.name' | 'user.age'
```

### Q13-15: Advanced Patterns & Best Practices

```typescript
// Builder pattern with fluent API
class QueryBuilder<T = {}> {
  private query: T = {} as T;

  select<K extends string>(
    field: K
  ): QueryBuilder<T & Record<K, any>> {
    return this as any;
  }

  build(): T {
    return this.query;
  }
}

const query = new QueryBuilder()
  .select('id')
  .select('name')
  .build();
// Type: { id: any; name: any }

// Type-safe event emitter
type Events = {
  click: { x: number; y: number };
  keypress: { key: string };
};

class TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void
  ): void {}

  emit<K extends keyof T>(event: K, data: T[K]): void {}
}

const emitter = new TypedEmitter<Events>();
emitter.on('click', (data) => {
  console.log(data.x, data.y); // Type-safe!
});

// Branded types for nominal typing
type Brand<K, T> = K & { __brand: T };
type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

const usd = 100 as USD;
const eur = 100 as EUR;
// Can't mix: const total: USD = usd + eur; // Error!
```

### Resources
- [TypeScript Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

[← Back to TypeScript README](./README.md)

**Progress:** 15 of 15 advanced type questions completed ✅
