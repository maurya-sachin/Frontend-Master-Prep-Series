# TypeScript Integration with React

## Question 1: How to type React components, props, and state?

### Main Answer

TypeScript integration with React requires typing three core components: the component itself, its props, and its state. React provides several typing patterns depending on whether you're using functional components, class components, or hooks.

For **functional components**, the most common pattern is using `React.FC<Props>` or `React.VFC<Props>`, though modern TypeScript usage increasingly favors plain function types for better inference. Props are typed with an interface or type alias, and state is typed through hook generics.

**React.FC (Functional Component)** automatically includes the `children` prop, while plain functions give you explicit control:

```typescript
// ❌ Legacy approach (React.FC)
const Button: React.FC<{ label: string }> = ({ label, children }) => (
  <button>{label}{children}</button>
);

// ✅ Modern approach (implicit return type)
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({ label, variant = 'primary', onClick }: ButtonProps) => (
  <button className={`btn-${variant}`} onClick={onClick}>
    {label}
  </button>
);
```

**State typing** with hooks uses generics to specify the state shape. For `useState`, the type is typically inferred from the initial value, but you can explicitly specify it:

```typescript
// State type inference
const [count, setCount] = useState(0); // count: number
const [name, setName] = useState(''); // name: string

// Explicit typing for complex states
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
```

**Event typing** is crucial for forms and interactive elements. React provides typed event objects:

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
  setName(value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Process form
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.button); // 0, 1, or 2
};
```

**Children typing** is a common challenge. The proper type depends on what you're accepting:

```typescript
// Single child element
interface WrapperProps {
  children: React.ReactElement;
}

// Multiple children
interface ContainerProps {
  children: React.ReactNode;
}

// Function as child
interface RenderProps {
  children: (value: string) => React.ReactNode;
}
```

---

### 🔍 Deep Dive: TypeScript Inference and Component Typing

**React.FC Evolution and Its Problems**

Early React TypeScript recommended `React.FC<Props>` for all functional components. This type automatically included the `children` property in props, even if not declared:

```typescript
// This "works" but is misleading
const MyComponent: React.FC = () => <div>No children declared!</div>;
// TypeScript allows: <MyComponent>content</MyComponent>
```

This caused issues because children appeared in the type signature even when not used. React 18 introduced `React.VFC` (VoidFunctionComponent) that excludes `children`, but the community settled on **explicit function typing** which is more precise:

```typescript
interface Props {
  title: string;
  onClose?: () => void;
}

// TypeScript infers return type as JSX.Element
const Modal = ({ title, onClose }: Props) => (
  <div className="modal">
    <h2>{title}</h2>
    <button onClick={onClose}>Close</button>
  </div>
);

// Children must be explicitly added to Props if needed
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}
```

**Type Inference Chain**

When you write a component, TypeScript infers types through multiple layers:

1. **Props parameter**: Explicit type or inferred from usage
2. **Hook state**: Inferred from initial value or explicit generic
3. **Return type**: Inferred as `JSX.Element` or `React.ReactElement`
4. **Event handlers**: Must match React event types

```typescript
// Full inference example
interface FormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
}

const LoginForm = ({ onSubmit }: FormProps) => {
  const [email, setEmail] = useState(''); // string
  const [password, setPassword] = useState(''); // string
  const [error, setError] = useState<string | null>(null); // explicit

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.currentTarget has type HTMLInputElement
    // e.currentTarget.value has type string
    setEmail(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleEmailChange} type="email" />
      <input
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};
```

**Generic Components and Type Parameters**

Creating components that work with different data types requires generics. This is essential for UI libraries and reusable components:

```typescript
// Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

const List = <T,>({ items, renderItem, keyExtractor }: ListProps<T>) => (
  <ul>
    {items.map((item, i) => (
      <li key={keyExtractor(item, i)}>
        {renderItem(item, i)}
      </li>
    ))}
  </ul>
);

// Usage with explicit type
<List<User>
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

**Class Component Typing**

While less common now, class components have different typing patterns:

```typescript
interface Props {
  title: string;
}

interface State {
  count: number;
  isLoading: boolean;
}

class Counter extends React.Component<Props, State> {
  state: State = {
    count: 0,
    isLoading: false,
  };

  handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <h2>{this.props.title}</h2>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleIncrement}>Increment</button>
      </div>
    );
  }
}
```

**Ref Typing**

Refs require specific typing to access DOM element properties:

```typescript
const InputComponent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
};

// Forward ref for component props
const TextInput = React.forwardRef<HTMLInputElement, { placeholder: string }>(
  ({ placeholder }, ref) => <input ref={ref} placeholder={placeholder} />
);
```

---

### 🐛 Real-World Scenario: Debugging TypeScript Errors in Production Form

**Problem**: An e-commerce platform's checkout form has type mismatches causing runtime errors. The form component is receiving events with incorrect types, and state updates are bypassing TypeScript checks through `any` types.

**Initial Code (problematic)**:
```typescript
interface CheckoutProps {
  onSubmit: any; // ❌ Defeats TypeScript safety
}

const CheckoutForm = ({ onSubmit }: CheckoutProps) => {
  const [formData, setFormData] = useState({}); // ❌ Inferrs as type {}
  const [errors, setErrors] = useState(null); // ❌ null, not Error | null

  const handleChange = (e: any) => {
    // ❌ e has no typed properties
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    // ❌ e not typed
    e.preventDefault();
    onSubmit(formData); // No validation that formData has required fields
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} />
      <input name="cardNumber" onChange={handleChange} />
      <button type="submit">Pay</button>
    </form>
  );
};
```

**Debugging Steps**:

1. **Identify missing type definitions**: Create interfaces for all expected data
2. **Trace runtime errors**: Form validation was skipped because formData type was unknown
3. **Add explicit typing**: Type all event handlers and state

**Fixed Code**:
```typescript
interface FormData {
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface FormErrors {
  email?: string;
  cardNumber?: string;
  cvv?: string;
}

interface CheckoutProps {
  onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
}

const CheckoutForm = ({ onSubmit }: CheckoutProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    // TypeScript ensures name is one of FormData keys
    setFormData((prev) => ({
      ...prev,
      [name as keyof FormData]: value,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card must be 16 digits';
    }
    if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Don't submit if validation fails
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(formData);

      if (!response.success) {
        setErrors({ email: response.error });
      } else {
        // Show success message
        setFormData({ email: '', cardNumber: '', expiryDate: '', cvv: '' });
      }
    } catch (error) {
      setErrors({ email: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          aria-invalid={!!errors.cardNumber}
          maxLength={19}
        />
        {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="expiryDate">Expiry Date</label>
        <input
          id="expiryDate"
          type="text"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          placeholder="MM/YY"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cvv">CVV</label>
        <input
          id="cvv"
          type="text"
          name="cvv"
          value={formData.cvv}
          onChange={handleChange}
          aria-invalid={!!errors.cvv}
          maxLength={3}
        />
        {errors.cvv && <span className="error">{errors.cvv}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
};
```

**Metrics and Results**:
- **Before**: 23% of form submissions failed with cryptic "Cannot read property" errors
- **After**: 99.8% valid submissions, runtime errors reduced to <0.2%
- **Development time saved**: Type checking caught 18 potential bugs before production
- **Debugging time**: Reduced from 45 minutes per bug to 5 minutes average

---

### ⚖️ Trade-offs: Type Safety vs Developer Experience

**Type Safety (Strictest)**:
```typescript
// Maximum safety: explicit everything
interface Props {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

const Button = ({
  label,
  onClick,
  disabled,
  variant,
  size,
  className,
  ariaLabel,
}: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
};
```

**Benefits**: No runtime surprises, excellent IDE autocomplete, refactoring safety
**Drawbacks**: Verbose, requires updating types when props change, slower initial development

---

**Developer Experience (Flexible)**:
```typescript
// More lenient: inference and optional typing
interface Props {
  label: string;
  onClick?: () => void;
  [key: string]: any; // ❌ Escape hatch for additional props
}

const Button = ({ label, onClick, ...rest }: Props) => {
  return (
    <button onClick={onClick} {...rest}>
      {label}
    </button>
  );
};

// Easy to use, but easy to misuse
<Button label="Click" disabled={false} unknown-prop="value" />
```

**Benefits**: Fast prototyping, flexible, less boilerplate
**Drawbacks**: Runtime errors possible, refactoring risky, harder to track props

---

**Balanced Approach (Recommended)**:
```typescript
// Type safety where it matters, flexibility where needed
interface BaseProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

// Use React.ButtonHTMLAttributes for native HTML props
interface Props extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {}

const Button = ({ label, onClick, disabled, ...rest }: Props) => {
  return (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {label}
    </button>
  );
};

// Now you get:
// - Type safety for custom props
// - All native button props automatically supported
// - IDE autocomplete for standard attributes
<Button label="Click" className="custom" aria-label="Submit form" onClick={() => {}} />
```

**Comparison Matrix**:

| Aspect | Strict Types | Flexible | Balanced |
|--------|-------------|----------|----------|
| Type safety | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Development speed | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Refactoring safety | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Boilerplate | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Runtime errors | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| IDE support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### 💬 Explain to Junior: Understanding React Component Types

**Simple Analogy**:

Think of a React component like a function at a restaurant:

- **Props** = The order details (what the customer requests)
- **State** = The chef's internal notes (what they're currently working on)
- **Events** = Customer actions (ordering, asking questions)
- **TypeScript** = The menu system that ensures orders are valid

Without TypeScript, the chef might get confused:
- "Did the customer ask for spicy? I'm not sure, they mumbled"
- "Is this a dessert or appetizer? I don't know, no specification"
- "What sauce goes with this dish? I'll guess"

With TypeScript, the menu is crystal clear:
- "Spicy: Yes/No (must be specified)"
- "Course: appetizer | main | dessert (must be one of these)"
- "Sauce: tomato | cream | oil (only these options)"

**Breaking Down Component Types**:

```typescript
// Step 1: Define what props you accept (like a menu)
interface MenuItemProps {
  name: string;        // Required
  price: number;       // Required
  description?: string; // Optional (the ? means optional)
  onOrder?: () => void; // Optional function (for when customer orders)
}

// Step 2: Create the component (use the menu)
const MenuItem = ({ name, price, description, onOrder }: MenuItemProps) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>${price}</p>
      {description && <p>{description}</p>}
      {onOrder && <button onClick={onOrder}>Order</button>}
    </div>
  );
};

// Step 3: Use the component (follow the menu)
// ✅ Correct - all required fields provided
<MenuItem name="Pizza" price={12.99} onOrder={() => alert('Ordered!')} />

// ❌ Wrong - TypeScript catches this immediately
<MenuItem name="Pizza" /> // Error: price is required

// ❌ Wrong - type mismatch
<MenuItem name="Pizza" price="12.99" /> // Error: price should be number, not string
```

**Understanding State**:

```typescript
// State = the component's memory
const Counter = () => {
  // This means: "I'm remembering a number, starting at 0"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

// TypeScript knows count is a number because we started with 0
// So it knows count + 1 is valid (adding numbers)
// But it would catch: setCount("five") as an error (string != number)
```

**Understanding Events**:

```typescript
// Events = when the user does something

const Form = () => {
  const [email, setEmail] = useState('');

  // This is what happens when the user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e = the event object
    // e.currentTarget = the input element
    // e.currentTarget.value = what the user typed
    const value = e.currentTarget.value;
    setEmail(value);
  };

  // This is what happens when user submits
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // e = the form event
    // e.preventDefault() = stop the page from refreshing
    e.preventDefault();
    console.log('Email:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} value={email} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

**Interview Answer Template**:

*"React component typing in TypeScript involves three main parts:*

*First, props - you define an interface with all the properties the component accepts, marking required vs optional with the question mark.*

*Second, state - you use useState with either inference from the initial value or explicit typing with the generic parameter.*

*Third, event handlers - you use React's built-in event types like ChangeEvent and MouseEvent to properly type the event object.*

*The key pattern is: interface for props, useState<Type> for state, and React.ChangeEvent<HTMLElement> for events. Modern React encourages plain functions over React.FC because it's more explicit about what you're accepting.*

*For example, a form component would have an interface for FormData, useState<FormData> for state, and React.FormEvent<HTMLFormElement> for the submit event. This gives you full type safety and IDE autocomplete."*

---

## Question 2: What are advanced TypeScript patterns for React? (generics, utility types)

### Main Answer

Advanced TypeScript patterns in React enable building flexible, reusable, and type-safe components for complex applications. These patterns include generic components, utility types, conditional types, and higher-order components.

**Generic Components** allow components to work with different data types while maintaining type safety:

```typescript
// Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

const List = <T,>({ items, renderItem, keyExtractor }: ListProps<T>) => (
  <ul>
    {items.map((item) => (
      <li key={keyExtractor(item)}>
        {renderItem(item)}
      </li>
    ))}
  </ul>
);

// Usage with automatic type inference
interface User {
  id: number;
  name: string;
}

const users: User[] = [{ id: 1, name: 'Alice' }];

<List
  items={users}
  renderItem={(user) => `${user.name} (#${user.id})`}
  keyExtractor={(user) => user.id}
/>
```

**Utility Types** like `Omit`, `Pick`, and `Record` simplify type definitions:

```typescript
// Start with a complete interface
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // shouldn't expose
  role: 'admin' | 'user';
}

// Create subset types
type UserDisplay = Omit<User, 'password'>; // All except password
type UserPreview = Pick<User, 'name' | 'role'>; // Only these fields
type UserFormData = Record<'name' | 'email' | 'role', string>; // name, email, role all strings
```

**Conditional Types** allow type selection based on conditions:

```typescript
// Extract the element type from an array
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number

// Useful for component props:
type ArrayElement<T extends any[]> = T extends (infer E)[] ? E : never;

interface TableProps<T extends any[]> {
  data: T;
  renderRow: (item: ArrayElement<T>) => React.ReactNode;
}
```

**Higher-Order Components with TypeScript** wrap components and add functionality:

```typescript
// HOC that adds loading state
interface WithLoadingProps {
  isLoading: boolean;
  error?: string;
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  return ({ isLoading, error, ...props }: P & WithLoadingProps) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <Component {...(props as P)} />;
  };
}

interface CardProps {
  title: string;
  content: string;
}

const Card = ({ title, content }: CardProps) => (
  <div className="card">
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
);

const CardWithLoading = withLoading(Card);

// Now you can use:
<CardWithLoading
  title="My Card"
  content="Content"
  isLoading={false}
  error={undefined}
/>
```

**Readonly and Recursive Types** ensure immutability and handle nested structures:

```typescript
// Make all properties readonly
type ReadonlyUser = Readonly<User>;

// Deep readonly for nested objects
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Recursive component props
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

const TreeComponent = <T,>({ node }: { node: TreeNode<T> }) => (
  <div>
    {node.value}
    {node.children?.map((child) => (
      <TreeComponent key={String(child.value)} node={child} />
    ))}
  </div>
);
```

---

### 🔍 Deep Dive: Generic Components and Type Inference

**Understanding Generic Constraints**

Generics in React become powerful when combined with constraints. A constraint limits what types can be used:

```typescript
// Unconstrained generic - T can be anything
function log<T>(value: T): T {
  console.log(value);
  return value;
}

// Constrained generic - T must be an object
function getProperty<T extends object>(obj: T, key: keyof T) {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name'); // ✅ Works
getProperty(user, 'unknown'); // ❌ Error: 'unknown' is not a key of user
```

**Multi-Parameter Generics in Components**

Complex components often need multiple generic parameters:

```typescript
// Pagination component with two types: data and filter
interface PaginationProps<TData, TFilter> {
  items: TData[];
  filter: TFilter;
  onFilterChange: (filter: TFilter) => void;
  renderItem: (item: TData) => React.ReactNode;
  itemsPerPage: number;
}

const Pagination = <TData, TFilter>({
  items,
  filter,
  onFilterChange,
  renderItem,
  itemsPerPage,
}: PaginationProps<TData, TFilter>) => {
  const [page, setPage] = useState(0);
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = items.slice(start, end);

  return (
    <div>
      <div className="items">
        {paginatedItems.map((item) => (
          <div key={String(item)}>{renderItem(item)}</div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setPage(Math.max(0, page - 1))}>Previous</button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

// Usage with specific types
interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

<Pagination<Product, ProductFilter>
  items={products}
  filter={{ minPrice: 10 }}
  onFilterChange={setFilter}
  renderItem={(p) => `${p.name} - $${p.price}`}
  itemsPerPage={10}
/>
```

**Keyof and Mapped Types**

The `keyof` operator extracts all keys from a type, and mapped types recreate types with transformations:

```typescript
// keyof example
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // 'id' | 'name' | 'email'

function getUserProperty<K extends keyof User>(user: User, key: K): User[K] {
  return user[key]; // Type is correctly inferred
}

// Usage
const user: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
const name = getUserProperty(user, 'name'); // name: string
const id = getUserProperty(user, 'id'); // id: number

// Mapped types - transform all keys
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type UserGetters = Getters<User>;
// Results in:
// {
//   id: () => number;
//   name: () => string;
//   email: () => string;
// }

// Practical form validation example
type FormErrors<T> = {
  [K in keyof T]?: string; // Optional string error for each field
};

const validateForm = <T extends object>(
  data: T,
  validators: Record<keyof T, (value: any) => boolean>
): FormErrors<T> => {
  const errors: FormErrors<T> = {};

  for (const key in validators) {
    if (!validators[key](data[key])) {
      errors[key] = `Invalid ${key}`;
    }
  }

  return errors;
};

// Usage ensures validators match data shape
type LoginData = { email: string; password: string };

const errors = validateForm<LoginData>(
  { email: 'test@example.com', password: '123' },
  {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: (pwd) => pwd.length >= 8,
  }
);
```

**Conditional Types for Smart Props**

Conditional types create different types based on conditions:

```typescript
// If T is an array, get its element type; otherwise return T
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Result1 = Awaited<Promise<string>>; // string
type Result2 = Awaited<number>; // number

// Practical React example: different props based on data type
type DataProps<T> = T extends any[]
  ? { items: T; renderItem: (item: T[0]) => React.ReactNode }
  : { item: T; render: (item: T) => React.ReactNode };

// For array data
const arrayComponent = <T extends any[]>(props: DataProps<T>) => {
  if (Array.isArray(props.items)) {
    return <div>{props.items.map(props.renderItem)}</div>;
  }
};

// For single item
const itemComponent = <T>(props: DataProps<T>) => {
  if (!Array.isArray(props.item)) {
    return <div>{props.render(props.item)}</div>;
  }
};
```

**Type Inference with As Const**

The `as const` assertion creates precise literal types:

```typescript
// Without as const - types are too broad
const options = { light: 'light', dark: 'dark' };
type Theme = typeof options[keyof typeof options]; // string

// With as const - types are precise
const options2 = { light: 'light', dark: 'dark' } as const;
type Theme2 = typeof options2[keyof typeof options2]; // 'light' | 'dark'

// Practical for component variants
const buttonVariants = {
  primary: { bg: 'blue', text: 'white' },
  secondary: { bg: 'gray', text: 'black' },
  danger: { bg: 'red', text: 'white' },
} as const;

type Variant = keyof typeof buttonVariants; // 'primary' | 'secondary' | 'danger'

interface ButtonProps {
  variant: Variant; // Only allows these exact strings
}

const Button = ({ variant }: ButtonProps) => {
  const style = buttonVariants[variant]; // TypeScript knows this always succeeds
  return <button style={style} />;
};
```

---

### 🐛 Real-World Scenario: Building Type-Safe Form Library

**Problem**: A team is building a form library that needs to handle various data types (strings, numbers, dates, arrays). Without proper TypeScript patterns, validation logic is duplicated, types are unclear, and form usage is error-prone.

**Initial Problematic Code**:
```typescript
// ❌ No generics - types are unclear
const createForm = (schema: any) => {
  return {
    fields: schema.fields,
    validate: (data: any) => {
      const errors: any = {};
      // Validation logic mixed with unclear types
      return errors;
    },
  };
};

// ❌ When using, no type safety
const userForm = createForm({ fields: ['name', 'email'] });
const validationResult = userForm.validate({ name: 123 }); // No error - should be string
```

**Advanced Solution with Generics**:

```typescript
// Step 1: Define field type
type FieldType = 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'select';

interface FieldConfig<T> {
  type: FieldType;
  label: string;
  required?: boolean;
  validate?: (value: T) => boolean | string;
  options?: T[];
}

// Step 2: Define form schema
interface FormSchema<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FieldConfig<T[K]>;
  };
}

// Step 3: Create form with proper typing
class TypedForm<T extends Record<string, any>> {
  constructor(private schema: FormSchema<T>) {}

  validate(data: Partial<T>): Record<keyof T, string | undefined> {
    const errors: Record<keyof T, string | undefined> = {} as any;

    for (const key in this.schema.fields) {
      const field = this.schema.fields[key as keyof T];
      const value = data[key as keyof T];

      // Check required
      if (field.required && (value === undefined || value === '')) {
        errors[key as keyof T] = `${field.label} is required`;
        continue;
      }

      // Run custom validator
      if (field.validate && value !== undefined) {
        const result = field.validate(value);
        if (result !== true) {
          errors[key as keyof T] = typeof result === 'string' ? result : `${field.label} is invalid`;
        }
      }
    }

    return errors;
  }

  render() {
    return this.schema;
  }
}

// Step 4: Use with specific data type
interface UserFormData {
  name: string;
  email: string;
  age: number;
  newsletter: boolean;
  role: 'admin' | 'user' | 'guest';
}

const userFormSchema: FormSchema<UserFormData> = {
  fields: {
    name: {
      type: 'text',
      label: 'Full Name',
      required: true,
      validate: (value) => value.length >= 2 || 'Name must be at least 2 characters',
    },
    email: {
      type: 'email',
      label: 'Email Address',
      required: true,
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email',
    },
    age: {
      type: 'number',
      label: 'Age',
      validate: (value) => value >= 18 || 'Must be 18 or older',
    },
    newsletter: {
      type: 'checkbox',
      label: 'Subscribe to newsletter',
    },
    role: {
      type: 'select',
      label: 'User Role',
      required: true,
      options: ['admin', 'user', 'guest'],
    },
  },
};

const userForm = new TypedForm(userFormSchema);

// ✅ Now validation is type-safe
const testData: Partial<UserFormData> = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 25,
};

const errors = userForm.validate(testData);
// errors has type: { name?: string; email?: string; age?: string; newsletter?: string; role?: string }

// If trying to pass wrong type:
const badData = {
  name: 123, // ❌ TypeScript error: number is not assignable to string
};

// Step 5: React component for form
interface FormFieldProps<T> {
  field: FieldConfig<T>;
  value: T;
  error?: string;
  onChange: (value: T) => void;
}

const FormField = <T,>({ field, value, error, onChange }: FormFieldProps<T>) => {
  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <div className="field">
          <label>{field.label}</label>
          <input
            type={field.type}
            value={String(value)}
            onChange={(e) => onChange(e.target.value as T)}
          />
          {error && <span className="error">{error}</span>}
        </div>
      );
    case 'number':
      return (
        <div className="field">
          <label>{field.label}</label>
          <input
            type="number"
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value) as T)}
          />
          {error && <span className="error">{error}</span>}
        </div>
      );
    case 'checkbox':
      return (
        <div className="field">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked as T)}
          />
          <label>{field.label}</label>
          {error && <span className="error">{error}</span>}
        </div>
      );
    case 'select':
      return (
        <div className="field">
          <label>{field.label}</label>
          <select value={String(value)} onChange={(e) => onChange(e.target.value as T)}>
            {Array.isArray(field.options) &&
              field.options.map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {String(opt)}
                </option>
              ))}
          </select>
          {error && <span className="error">{error}</span>}
        </div>
      );
    default:
      return null;
  }
};

// Step 6: Full form component
interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
}

const UserFormComponent = ({ onSubmit }: UserFormProps) => {
  const [data, setData] = useState<Partial<UserFormData>>({});
  const [errors, setErrors] = useState<Record<keyof UserFormData, string | undefined>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = userForm.validate(data);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== undefined);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data as UserFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {(Object.keys(userFormSchema.fields) as Array<keyof UserFormData>).map((key) => (
        <FormField<UserFormData[typeof key]>
          key={String(key)}
          field={userFormSchema.fields[key]}
          value={data[key]}
          error={errors[key]}
          onChange={(value) => handleChange(key, value)}
        />
      ))}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

**Results**:
- Validation logic reusable across forms
- Type-safe for any data shape (no casting needed)
- Form fields automatically match data types
- TypeScript prevents passing wrong data
- 40% less code duplication compared to ad-hoc forms

---

### ⚖️ Trade-offs: Generic Complexity vs Simplicity

**Simple Approach (Non-Generic)**:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button = ({ label, onClick, disabled }: ButtonProps) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

// ✅ Easy to understand
// ✅ Fast to write
// ❌ Not reusable for different button types
// ❌ Can't handle different button variants with different props
```

**Complex Approach (With Generics)**:
```typescript
interface GenericButtonProps<T extends Record<string, any>> {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  data?: T;
  onDataChange?: (data: T) => void;
}

const GenericButton = <T extends Record<string, any>>({
  label,
  onClick,
  disabled,
  data,
  onDataChange,
}: GenericButtonProps<T>) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

// ✅ Reusable for any button variant
// ✅ Type-safe even with complex data
// ❌ More complex to understand
// ❌ Slower to write initially
// ❌ May be overkill for simple cases
```

**Comparison Matrix**:

| Aspect | Simple | Generic | Recommendation |
|--------|--------|---------|-----------------|
| Learning curve | ⭐⭐ | ⭐⭐⭐⭐⭐ | Simple for beginners |
| Reusability | ⭐⭐ | ⭐⭐⭐⭐⭐ | Generic for libraries |
| Type safety | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Generic is safer |
| Maintenance | ⭐⭐⭐⭐ | ⭐⭐⭐ | Simple is easier |
| Flexibility | ⭐⭐ | ⭐⭐⭐⭐⭐ | Generic is flexible |
| Lines of code | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Simple is shorter |

**When to Use Each**:

- **Simple types**: Use for single-purpose components (Button, Input, Card)
- **Generics**: Use for reusable libraries, data containers, form handlers
- **Balanced**: Extract reusable logic but keep component props simple

---

### 💬 Explain to Junior: Advanced Patterns Made Simple

**Generic Components - Analogy**:

Imagine you're creating a box storage system:

**Non-generic** (specific box):
```typescript
// This box only holds apples
interface AppleBoxProps {
  apples: Apple[];
  onSelectApple: (apple: Apple) => void;
}

const AppleBox = ({ apples, onSelectApple }: AppleBoxProps) => (
  <div>
    {apples.map((apple) => (
      <div onClick={() => onSelectApple(apple)} key={apple.id}>
        {apple.name}
      </div>
    ))}
  </div>
);
```

**Generic** (universal box):
```typescript
// This box holds ANY type of fruit
interface BoxProps<T> {
  items: T[];
  onSelectItem: (item: T) => void;
  renderItem: (item: T) => string;
}

const Box = <T,>({ items, onSelectItem, renderItem }: BoxProps<T>) => (
  <div>
    {items.map((item, i) => (
      <div onClick={() => onSelectItem(item)} key={i}>
        {renderItem(item)}
      </div>
    ))}
  </div>
);

// Now it works with apples, oranges, bananas, anything!
<Box<Apple> items={apples} onSelectItem={...} renderItem={(a) => a.name} />
<Box<Orange> items={oranges} onSelectItem={...} renderItem={(o) => o.juiciness} />
```

**Utility Types - Analogy**:

Think of utilities like shortcuts:

```typescript
// Full user object
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Omit = remove unwanted things
// It's like saying "I want a user, but hide the password"
type PublicUser = Omit<User, 'password'>; // User without password

// Pick = choose what you want
// It's like saying "Give me just name and email"
type UserPreview = Pick<User, 'name' | 'email'>;

// Record = create multiple fields of same type
// It's like saying "Create a checklist with these items, all boolean"
type Checklist = Record<'name' | 'email' | 'password', boolean>;
// Results in: { name: boolean; email: boolean; password: boolean }
```

**Conditional Types - Analogy**:

Think of conditional types like if/else statements for types:

```typescript
// If T is an array, give me what's inside. Otherwise, give me T itself.
type Unwrap<T> = T extends any[] ? T[0] : T;

type StringArray = Unwrap<string[]>; // Unwrapped to: string
type JustNumber = Unwrap<number>; // Can't unwrap, so: number

// Practical React example:
type ReactProps<T> = T extends any[]
  ? { items: T; renderItem: (item: T[0]) => JSX.Element }
  : { item: T; render: (item: T) => JSX.Element };

// For array of users:
const userListProps: ReactProps<User[]> = {
  items: users,
  renderItem: (user) => <div>{user.name}</div>,
};

// For single user:
const userProps: ReactProps<User> = {
  item: user,
  render: (user) => <div>{user.name}</div>,
};
```

**Mapped Types - Analogy**:

Think of mapped types like "apply this rule to every field":

```typescript
// Original user interface
interface User {
  name: string;
  email: string;
  age: number;
}

// Make every field optional
type PartialUser = {
  [K in keyof User]?: User[K];
};
// Results in:
// {
//   name?: string;
//   email?: string;
//   age?: number;
// }

// Make every field a getter function
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type UserGetters = Getters<User>;
// Results in:
// {
//   name: () => string;
//   email: () => string;
//   age: () => number;
// }
```

**Interview Answer Template**:

*"Advanced TypeScript patterns in React allow building extremely flexible and type-safe components. The main patterns are:*

*First, generic components - you create a component that works with any data type. For example, a List component that accepts any array and a render function. You write it once with a generic type parameter <T>, and it works with User arrays, Product arrays, anything.*

*Second, utility types like Omit and Pick - these create new types by modifying existing ones. For instance, Omit<User, 'password'> creates a User type without the password field. This is useful for sending data to clients or APIs without sensitive information.*

*Third, conditional types - these use the 'extends' keyword to create different types based on conditions. If T is an array, extract the element type; otherwise return T as-is. This enables smart prop inference.*

*Fourth, mapped types - these iterate over all keys in a type and transform them. You can make all fields readonly, optional, or into functions.*

*The key benefit is writing less code that's more type-safe. Instead of duplicate component logic, you have one generic component that works everywhere with full type checking."*

---

## Summary

These two comprehensive questions cover React TypeScript integration from basics (typing props, state, events) to advanced patterns (generics, utility types, conditional types). The content includes:

**Q1 Focus**: Foundation knowledge
- Component typing (React.FC alternatives)
- Props and state typing
- Event handler typing
- Real-world form debugging scenario

**Q2 Focus**: Advanced patterns
- Generic components and constraints
- Utility types (Omit, Pick, Record)
- Conditional types
- Form library case study

Each question provides 4 depth sections for interview preparation and real-world application.
