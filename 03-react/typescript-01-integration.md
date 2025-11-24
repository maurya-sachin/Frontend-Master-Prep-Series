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

**React.FC Evolution and the Shift to Explicit Typing**

The history of React component typing reveals important lessons about TypeScript design patterns and demonstrates how the community's understanding of best practices evolves over time. Early React TypeScript documentation heavily promoted `React.FC<Props>` (or `React.FunctionComponent<Props>`) as the standard way to type functional components. This generic type provided automatic typing for common component features, most notably the implicit inclusion of the `children` prop. At the time of its introduction around 2018-2019, this seemed like a helpful convenience that would reduce boilerplate and make TypeScript adoption easier for React developers transitioning from JavaScript.

```typescript
// Legacy React.FC approach (2018-2020 common pattern)
const Card: React.FC<{ title: string }> = ({ title }) => (
  <div className="card">
    <h2>{title}</h2>
  </div>
);

// Problem: children is implicitly in props even though not declared
<Card title="Example">
  <p>This content works despite children not being in the type!</p>
</Card>
```

This automatic inclusion seemed convenient initially but created several significant issues that only became apparent as codebases scaled. First, it made the type signature misleading—components appeared to accept children when they might not handle them properly in their implementation. A developer could pass children to a component that silently ignored them, creating confusion about expected behavior. Second, it made migration difficult when React changed the `children` default behavior in React 18, requiring widespread refactoring across codebases. Third, it prevented explicit control over whether children should be allowed, making it impossible to statically enforce that certain components should never receive children. Fourth, it added an implicit dependency on React types even when children weren't used, increasing the coupling between component code and React's type definitions.

The React team recognized these problems through community feedback and real-world usage patterns, eventually deprecating automatic children inclusion in React 18. They introduced `React.VFC` (VoidFunctionComponent) as a temporary solution for components without children, but this created a bifurcation in the type system—developers had to choose between `React.FC` and `React.VFC`, adding cognitive overhead. The community ultimately moved toward **plain function typing** as the recommended approach, which the React TypeScript documentation now officially endorses.

The modern pattern uses explicit function signatures with typed parameters, letting TypeScript infer the return type automatically. This approach provides better clarity by making all props explicit, more precise control over component contracts, and aligns with TypeScript's design philosophy of explicit over implicit typing. It also reduces bundle size slightly by eliminating unnecessary type imports and improves performance in TypeScript's type checker by avoiding complex generic inference chains.

```typescript
// ✅ Modern recommended approach
interface CardProps {
  title: string;
  description: string;
  // Children explicitly declared only when needed
  children?: React.ReactNode;
}

const Card = ({ title, description, children }: CardProps) => (
  <div className="card">
    <h2>{title}</h2>
    <p>{description}</p>
    {children && <div className="card-content">{children}</div>}
  </div>
);
```

**Understanding TypeScript's Type Inference Chain in React**

TypeScript's type inference in React components operates through a sophisticated chain of inferences that work together to provide comprehensive type safety without requiring excessive manual annotations. This inference system represents one of TypeScript's most powerful features—the ability to deduce types automatically based on usage patterns, initial values, and contextual information. Understanding this chain helps developers write more maintainable code, debug type errors effectively, and make informed decisions about when explicit typing is necessary versus when inference is sufficient.

The **props inference** starts at component usage and flows backward to the component definition in a bidirectional type checking process. When you use `<Button label="Click" onClick={handler} />`, TypeScript performs several checks simultaneously: it verifies that `label` is assignable to the expected string type, that `onClick` matches the expected function signature in `ButtonProps`, and that no required props are missing. This bidirectional type checking catches errors at both definition sites (where you write the component) and usage sites (where you use the component), providing comprehensive safety. The type checker also validates that you're not passing extra props that aren't defined in the interface, preventing typos and ensuring API consistency.

The **state inference** with hooks demonstrates TypeScript's ability to infer complex types from initial values through contextual typing. When you write `const [count, setCount] = useState(0)`, TypeScript infers `count: number` based on the initial value zero, and it infers `setCount` has the signature `(value: number | ((prev: number) => number)) => void`, automatically understanding that state setters accept both direct values and updater functions. This inference works for simple primitives like numbers, strings, and booleans without any explicit type annotations. However, for more complex state structures—objects, arrays, union types, or state that can be null—explicit typing becomes necessary to give TypeScript sufficient information about all possible state shapes.

```typescript
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Without explicit typing, TypeScript can't infer the full structure
const [state, setState] = useState<UserState>({
  user: null,
  isLoading: false,
  error: null,
});

// Now setState is properly typed to accept UserState or updater function
setState(prev => ({ ...prev, isLoading: true }));
```

The **event handler inference** requires understanding React's synthetic event system and how TypeScript maps native browser events to React's type definitions. React wraps native browser events in `SyntheticEvent` wrappers for cross-browser consistency, normalizing behavior across different browsers and providing a consistent API. TypeScript provides specific types for each event-element combination, ensuring you can only access properties that actually exist on the specific event type. This prevents common errors like trying to access `e.currentTarget.value` on a button click event (where value doesn't exist) or `e.currentTarget.checked` on a text input (where checked doesn't exist). The type system encodes the relationship between event types and element types, providing precise autocomplete and compile-time validation:

```typescript
// Different event types for different elements
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value; // string
  const checked = e.currentTarget.checked; // boolean (for checkbox)
};

const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.currentTarget.value; // string
  const rows = e.currentTarget.rows; // number
};

const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  const button = e.button; // 0 = left, 1 = middle, 2 = right
  const altKey = e.altKey; // boolean
};
```

**Generic Components and Constraint-Based Type Safety**

Generic components represent one of TypeScript's most powerful features for building reusable UI libraries. A generic component accepts a type parameter that determines the shape of data it operates on, enabling a single component implementation to work with unlimited data types while maintaining full type safety.

The basic generic component pattern uses a type parameter in angle brackets:

```typescript
interface DataDisplayProps<T> {
  data: T;
  render: (item: T) => React.ReactNode;
}

// The <T,> syntax (with trailing comma) is required in .tsx files
// to distinguish from JSX syntax
const DataDisplay = <T,>({ data, render }: DataDisplayProps<T>) => (
  <div>{render(data)}</div>
);

// TypeScript infers T from usage
<DataDisplay data={{ name: 'Alice', age: 30 }} render={user => user.name} />
```

**Generic constraints** limit what types can be used, preventing nonsensical combinations and enabling operations that require specific properties:

```typescript
// Constraint: T must have an 'id' property
interface Identifiable {
  id: string | number;
}

interface SortableListProps<T extends Identifiable> {
  items: T[];
  sortBy: keyof T;
  renderItem: (item: T) => React.ReactNode;
}

const SortableList = <T extends Identifiable>({
  items,
  sortBy,
  renderItem,
}: SortableListProps<T>) => {
  const sorted = [...items].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  return (
    <ul>
      {sorted.map(item => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
};
```

**Ref Typing and DOM Element Access**

Refs in TypeScript require explicit typing to access DOM element methods and properties safely. The `useRef` hook accepts a generic parameter specifying the element type, and the ref value is initially `null` until React attaches it:

```typescript
const AutoFocusInput = () => {
  // HTMLInputElement | null - null until mounted
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Optional chaining handles null case
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" placeholder="Auto-focused" />;
};

// Different element types for different ref purposes
const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// forwardRef for component refs
interface CustomInputProps {
  placeholder: string;
  onValueChange?: (value: string) => void;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ placeholder, onValueChange }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.currentTarget.value);
    };

    return <input ref={ref} placeholder={placeholder} onChange={handleChange} />;
  }
);

// Usage: parent can access input methods
const Parent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => inputRef.current?.focus();

  return (
    <>
      <CustomInput ref={inputRef} placeholder="Enter text" />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
};
```

**Class Component Typing Patterns**

Although class components are less common in modern React development, understanding their TypeScript patterns remains valuable for maintaining legacy codebases and understanding the evolution of React typing:

```typescript
interface CounterProps {
  initialCount: number;
  onCountChange?: (count: number) => void;
}

interface CounterState {
  count: number;
  isIncrementing: boolean;
}

class Counter extends React.Component<CounterProps, CounterState> {
  // State must match CounterState interface
  state: CounterState = {
    count: this.props.initialCount,
    isIncrementing: false,
  };

  // Event handlers are automatically typed from React.Component
  handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState(
      prevState => ({ count: prevState.count + 1 }),
      () => {
        // Callback after state update
        this.props.onCountChange?.(this.state.count);
      }
    );
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}
```

The class component pattern `React.Component<Props, State>` provides type checking for `this.props` and `this.state`, ensuring that all property accesses and state updates conform to the defined interfaces. This pattern remains useful when working with component lifecycle methods that haven't been fully replaced by hooks in certain scenarios.

---

### 🐛 Real-World Scenario: Debugging TypeScript Errors in Production Form

**Problem Context**: A high-traffic e-commerce platform (500K daily checkouts, $12M monthly GMV) experienced a surge in payment failures after deploying a refactored checkout form during a major Black Friday promotion weekend. Error logs showed cryptic runtime errors like "Cannot read property 'email' of undefined" and "cardNumber is not a function," but with no clear pattern about which browsers or user flows triggered them. Investigation revealed that the development team had used `any` types extensively during rapid prototyping to meet an aggressive deadline, bypassing TypeScript's type checking entirely and shipping code that "compiled" but had no actual type safety. This created a ticking time bomb where type mismatches only surfaced at runtime when real users with unpredictable input patterns interacted with the form. The team had assumed TypeScript would catch type errors, but by using `any` everywhere, they had essentially turned TypeScript into JavaScript with extra syntax.

**Impact Metrics**:
- Payment failure rate increased from 2.3% to 18.7% (8x increase)
- Average debugging time per error: 45 minutes
- Customer support tickets increased 340% in 48 hours
- Revenue loss: ~$89,000 over 2 days
- Developer hours wasted: 47 hours tracking down type-related bugs

**Initial Problematic Code**:
```typescript
interface CheckoutProps {
  onSubmit: any; // ❌ Defeats TypeScript safety completely
}

const CheckoutForm = ({ onSubmit }: CheckoutProps) => {
  // ❌ Inferred as type {}, not the actual form shape
  const [formData, setFormData] = useState({});

  // ❌ Inferred as null, can't later assign string errors
  const [errors, setErrors] = useState(null);

  const handleChange = (e: any) => {
    // ❌ e has no typed properties - e.target could be anything
    const { name, value } = e.target;

    // ❌ formData type is {}, can't validate this spread
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    // ❌ e is implicitly any - no type checking
    e.preventDefault();

    // ❌ No validation that formData has required fields
    // onSubmit could expect anything - no type safety
    onSubmit(formData);
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

**Why This Failed in Production**:
1. **Type `{}` doesn't mean empty object** - it means "any non-nullish value", so formData could be a number, function, or anything
2. **Event `any` masked wrong element types** - code assumed `e.target` but should be `e.currentTarget` for React synthetic events
3. **State updates bypassed validation** - `setFormData({ ...formData, [name]: value })` could create malformed state
4. **No compile-time errors** - all bugs only surfaced at runtime when users entered data

**Debugging Steps and Investigation**:

1. **Enable strict TypeScript checking** - Added `"strict": true` to tsconfig.json to catch implicit any types
2. **Review error logs** - 73% of errors originated from form submission with malformed data structures
3. **Trace type flow** - Used TypeScript's `noImplicitAny` to identify all untyped variables
4. **Create explicit interfaces** - Defined exact shapes for all form data, errors, and callbacks
5. **Add runtime validation** - Implemented validation before submission to catch edge cases

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

**Metrics and Results After Fix**:

**Error Rate Improvements**:
- Payment failure rate: 18.7% → 0.2% (93% reduction)
- Form validation errors caught at compile-time: 0 → 34 errors
- Runtime type errors: 127 per day → 2 per day (98.4% reduction)
- User-facing errors: 18.7% → 0.2%

**Development Productivity**:
- Average debugging time: 45 minutes → 5 minutes per bug (89% reduction)
- Type checking caught 34 potential bugs before deployment
- Code review time reduced by 60% (types document expected behavior)
- Onboarding time for new developers: 3 days → 1 day (types serve as documentation)

**Business Impact**:
- Customer support tickets reduced by 91% within 72 hours
- Revenue recovered: Payment success rate back to 97.7%
- Developer confidence increased: 100% of team adopted strict typing for new features
- Technical debt reduced: Eliminated 2,847 lines of any-typed code across codebase

**Key Learnings**:
1. **Never use `any` for public props** - Breaks type safety contract at component boundaries
2. **Explicit state typing prevents bugs** - Generic useState with interface catches errors at write-time
3. **React event types are specific** - `ChangeEvent<HTMLInputElement>` provides autocomplete and safety
4. **Type inference has limits** - Complex state requires explicit generic parameters
5. **Strict mode is essential** - `"strict": true` catches implicit any and null issues early

---

### ⚖️ Trade-offs: Type Safety vs Developer Experience

The debate between maximum type safety and developer experience represents one of the central tensions in TypeScript React development, touching on fundamental questions about software engineering priorities, team dynamics, and project lifecycle management. Teams must balance the long-term benefits of strict typing—fewer bugs, better refactoring, self-documenting code—against the short-term costs of writing more explicit code, learning complex type patterns, and dealing with verbose type definitions. This tension becomes especially acute in startups and fast-moving projects where time-to-market pressure conflicts with code quality ideals. Understanding these trade-offs helps make informed decisions based on project needs, team size, codebase maturity, product lifecycle stage, and the specific business context in which development occurs.

**Maximum Type Safety Approach (Strictest)**:

The strictest typing approach requires explicit types for every prop, state variable, and function parameter. This approach provides the highest level of compile-time safety but comes with increased verbosity:

```typescript
// Explicit types for everything
interface ButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean; // Required, not optional
  variant: 'primary' | 'secondary' | 'danger'; // Exact strings only
  size: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  testId?: string;
  icon?: React.ReactElement;
}

const Button = ({
  label,
  onClick,
  disabled,
  variant,
  size,
  className,
  ariaLabel,
  testId,
  icon,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      aria-label={ariaLabel || label}
      data-testid={testId}
    >
      {icon && <span className="icon">{icon}</span>}
      {label}
    </button>
  );
};

// Usage requires all required props
<Button
  label="Submit"
  onClick={(e) => console.log(e.button)}
  disabled={false}
  variant="primary"
  size="md"
/>
```

**Benefits of Strict Typing**:
- **Zero runtime surprises** - All type errors caught at compile-time, preventing production bugs
- **Excellent IDE support** - Full autocomplete, inline documentation, and parameter hints
- **Refactoring safety** - Renaming or changing types updates all usages automatically
- **Self-documenting code** - Types serve as inline documentation for expected values
- **Team scalability** - Large teams benefit from explicit contracts between components

**Drawbacks of Strict Typing**:
- **High verbosity** - More code to write and maintain for every component
- **Slower initial development** - Type definitions slow down prototyping and experimentation
- **Frequent type updates** - Changing requirements means updating multiple type definitions
- **Steeper learning curve** - Junior developers struggle with complex type patterns
- **Diminishing returns** - Simple components don't benefit much from excessive typing

---

**Flexible Developer Experience Approach**:

The flexible approach prioritizes speed and ease of use, relying on inference and loose typing:

```typescript
// Minimal typing with escape hatches
interface ButtonProps {
  label: string;
  onClick?: () => void;
  [key: string]: any; // ❌ Allows any additional props
}

const Button = ({ label, onClick, ...rest }: ButtonProps) => {
  return (
    <button onClick={onClick} {...rest}>
      {label}
    </button>
  );
};

// Easy to use, accepts anything
<Button
  label="Click"
  disabled={false}
  unknown-prop="value" // TypeScript won't complain
  data-random={123}
/>
```

**Benefits of Flexible Typing**:
- **Rapid prototyping** - Quick iteration without type definition overhead
- **Less boilerplate** - Minimal type annotations needed
- **Easy to learn** - Approachable for developers new to TypeScript
- **Flexible usage** - Components accept unexpected props without errors

**Drawbacks of Flexible Typing**:
- **Runtime errors** - Type mismatches only discovered when code runs
- **Poor refactoring** - Changes break code in unpredictable ways
- **Weak IDE support** - Limited autocomplete and parameter hints
- **Hidden bugs** - Typos and wrong types pass type checking silently
- **Technical debt** - Accumulates problems that become costly to fix later

---

**Balanced Approach (Recommended for Most Projects)**:

The balanced approach combines strict typing for custom props with flexibility for standard HTML attributes:

```typescript
// Custom props strictly typed
interface BaseButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Extend with native HTML button attributes
interface ButtonProps
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {}

const Button = ({ label, onClick, disabled, variant = 'primary', ...rest }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...rest}
    >
      {label}
    </button>
  );
};

// Usage gets type safety + flexibility
<Button
  label="Submit"
  onClick={(e) => console.log(e.button)} // Typed event
  className="custom-class" // Native HTML prop
  aria-label="Submit form" // Autocompleted
  data-testid="submit-btn" // Supported
/>
```

**Why Balanced Works Best**:
1. **Custom props are explicit** - Your component API is clearly defined
2. **HTML props are automatic** - No need to manually type standard attributes
3. **Type safety preserved** - Custom props prevent typos and wrong types
4. **Flexibility maintained** - Standard HTML attributes work without extra code
5. **Best IDE experience** - Autocomplete for both custom and native props

**Decision Matrix - When to Use Each Approach**:

| Aspect | Strict Types | Flexible | Balanced |
|--------|-------------|----------|----------|
| Type safety | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Development speed | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Refactoring safety | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| Boilerplate code | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Runtime errors prevented | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| IDE autocomplete | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Learning curve | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Team scalability | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**Practical Recommendations**:

- **Use strict typing for**: Public component libraries, critical business logic (checkout, payments), large team projects, long-lived codebases
- **Use flexible typing for**: Rapid prototypes, proof-of-concepts, internal tools with single developer, short-lived experiments
- **Use balanced typing for**: Production applications, medium-large teams, components that wrap HTML elements, reusable UI component libraries

**Performance Considerations**:

TypeScript type checking happens at compile-time only and has zero runtime performance impact. The choice between approaches affects development speed, bug discovery time, and maintenance cost—not runtime performance. However, the balanced approach often leads to smaller bundle sizes because it avoids redundant type definitions.

---

### 💬 Explain to Junior: Understanding React Component Types

**The Restaurant Menu Analogy**:

Imagine you're working at a busy restaurant during dinner rush, and think of a React component like how the kitchen operates. This analogy will help you understand why TypeScript is so valuable for React development and how each piece fits together.

- **Props** = The order slip from the customer (specific details about what they want—burger cooked medium, extra pickles, no onions)
- **State** = The chef's scratch paper (internal notes that change during cooking—timer for 5 minutes, oven set to 350°F, current step in recipe)
- **Events** = Customer actions (clicking "Order" button, typing in a search box, selecting menu items)
- **TypeScript** = The standardized order system that prevents miscommunication between waitstaff, kitchen, and customers

**Without TypeScript** (chaos in the kitchen):
- Chef: "Did they want spicy? I don't know, the waiter mumbled."
- Chef: "Is this an appetizer or dessert? The order slip doesn't say."
- Chef: "Which sauce? I'll just guess marinara and hope for the best."
- Result: Wrong orders, unhappy customers, food sent back.

**With TypeScript** (smooth operations):
- Order system: "Spicy: Yes or No (must choose one)"
- Order system: "Course: appetizer | main | dessert (only these three options)"
- Order system: "Sauce: marinara | alfredo | pesto (pick from list)"
- Result: Every order is clear, chef knows exactly what to make, customers happy.

**Breaking Down Component Typing Step-by-Step**:

Let's build a `MenuItem` component to display food on a menu:

```typescript
// Step 1: Define your component's "order form" (interface)
interface MenuItemProps {
  name: string;        // Required: every menu item must have a name
  price: number;       // Required: must be a number (not "12.99" string)
  description?: string; // Optional: the ? means "this is nice to have, but not required"
  category: 'appetizer' | 'main' | 'dessert'; // Must be exactly one of these strings
  onOrder?: () => void; // Optional: function to call when customer orders
}

// Step 2: Create the component using the interface
const MenuItem = ({ name, price, description, category, onOrder }: MenuItemProps) => {
  return (
    <div className={`menu-item ${category}`}>
      <h3>{name}</h3>
      <p className="price">${price.toFixed(2)}</p>
      {description && <p className="description">{description}</p>}
      <span className="category">{category}</span>
      {onOrder && <button onClick={onOrder}>Order Now</button>}
    </div>
  );
};

// Step 3: Use the component - TypeScript checks your "order"
// ✅ CORRECT - all required fields provided, types match
<MenuItem
  name="Margherita Pizza"
  price={12.99}
  category="main"
  description="Fresh mozzarella and basil"
  onOrder={() => alert('Pizza ordered!')}
/>

// ❌ ERROR - TypeScript catches this before you even run the code
<MenuItem name="Pizza" />
// Error: Property 'price' is missing
// Error: Property 'category' is missing

// ❌ ERROR - wrong type
<MenuItem name="Pizza" price="12.99" category="main" />
// Error: Type 'string' is not assignable to type 'number'
// TypeScript wants: price={12.99}, not price="12.99"

// ❌ ERROR - invalid category
<MenuItem name="Pizza" price={12.99} category="snack" />
// Error: Type '"snack"' is not assignable to type '"appetizer" | "main" | "dessert"'
```

**Understanding State (Component Memory)**:

State is like the component's notepad—it remembers things between renders:

```typescript
const Counter = () => {
  // useState tells React: "I need to remember a number, starting at 0"
  // TypeScript sees the 0 and knows: count is a number
  const [count, setCount] = useState(0);

  // TypeScript knows these work:
  setCount(count + 1);      // ✅ Adding numbers
  setCount(5);              // ✅ Setting to a number
  setCount(prev => prev + 1); // ✅ Using previous value

  // TypeScript catches these mistakes:
  // setCount("five");      // ❌ Error: string is not a number
  // setCount(true);        // ❌ Error: boolean is not a number

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};
```

For more complex state, tell TypeScript explicitly what you're storing:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

const UserProfile = () => {
  // Explicitly tell TypeScript: "I'm storing a User or null"
  const [user, setUser] = useState<User | null>(null);

  // TypeScript knows user might be null, so it requires checking:
  return (
    <div>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Age: {user.age}</p>
        </div>
      ) : (
        <p>No user loaded</p>
      )}
    </div>
  );
};
```

**Understanding Events (User Actions)**:

Events are what happen when users interact with your component. TypeScript ensures you handle events correctly:

```typescript
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // When user types in input field
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e = the event object (contains all info about what happened)
    // e.currentTarget = the specific input element that triggered the event
    // e.currentTarget.value = what the user typed
    setEmail(e.currentTarget.value);
  };

  // When user submits the form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault() = stop the browser from refreshing the page
    e.preventDefault();

    // Now process the login
    console.log('Login attempt:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

**Different Events for Different Elements**:

```typescript
// Button click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Mouse button:', e.button); // 0=left, 1=middle, 2=right
  console.log('Alt key pressed?', e.altKey); // true/false
};

// Input change
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log('Value:', e.currentTarget.value); // What user typed
  console.log('Is checkbox checked?', e.currentTarget.checked); // For checkboxes
};

// Textarea change
const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  console.log('Text:', e.currentTarget.value);
};

// Form submit
const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // ALWAYS do this first to prevent page reload
  const formData = new FormData(e.currentTarget);
  console.log('Form data:', Object.fromEntries(formData));
};
```

**Key Takeaways for Beginners**:

1. **Props are the contract** - Interface defines what the component needs to work
2. **? means optional** - Props without ? are required
3. **State remembers values** - useState creates component memory
4. **Events need types** - React.ChangeEvent, React.MouseEvent, etc.
5. **TypeScript catches mistakes early** - Errors show in editor, not production

**Common Mistakes to Avoid**:

```typescript
// ❌ DON'T: Use any (defeats the purpose of TypeScript)
const handleChange = (e: any) => { ... }

// ✅ DO: Use specific event type
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }

// ❌ DON'T: Forget to specify complex state types
const [user, setUser] = useState(null); // TypeScript thinks it's always null

// ✅ DO: Explicitly type complex state
const [user, setUser] = useState<User | null>(null);

// ❌ DON'T: Use e.target (can be wrong element in bubbling)
const value = e.target.value;

// ✅ DO: Use e.currentTarget (always the element with the handler)
const value = e.currentTarget.value;
```

**Interview Answer Template**:

*"TypeScript integration with React involves typing three core areas: props, state, and events, each requiring specific patterns for maximum type safety and developer experience.*

*For props, I define an interface that describes all the properties my component accepts. Required props are listed directly without any syntax modifier, while optional props use the question mark syntax. For example, `name: string` is required and TypeScript will error if it's missing, but `description?: string` is optional and can be omitted. I avoid using React.FC in modern code because it implicitly included children in earlier React versions, which was deprecated in React 18. Instead, I use plain function components with explicitly typed parameters, which gives me full control and better type inference.*

*For state, I rely on TypeScript's type inference for simple values like numbers and strings. When I write `useState(0)`, TypeScript automatically infers the state is a number. However, for complex state like objects, arrays, or union types, I explicitly provide the type using the generic syntax: `useState<User | null>(null)`. This is crucial when the initial value doesn't reveal the full type—if you initialize with null, TypeScript can't infer what non-null values should look like.*

*For events, I use React's specific event types which combine the event type with the element type. For example, `React.ChangeEvent<HTMLInputElement>` for input changes, `React.MouseEvent<HTMLButtonElement>` for button clicks, and `React.FormEvent<HTMLFormElement>` for form submissions. These types provide accurate autocomplete for event properties like `currentTarget.value` or `button` and prevent mistakes like trying to access `.value` on a button.*

*When wrapping native HTML elements, I extend native attributes using `Omit` to remove conflicting props and intersection types to combine custom props with HTML attributes. This pattern provides type safety for both custom and standard props: `interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> { type: 'submit' | 'button' }`. This gives users full HTML button functionality plus my custom type constraints.*

*This typing strategy catches errors at compile-time before they reach production, provides excellent IDE support with autocomplete and inline documentation, enables safe refactoring where renaming types updates all usages, and serves as living documentation for how components should be used."*

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

**The Power and Complexity of Generic Constraints**

Generic constraints represent one of TypeScript's most powerful yet often misunderstood features, forming the foundation of advanced type-safe component design. A constraint limits which types can be passed to a generic parameter, enabling type-safe operations that wouldn't be possible with unconstrained generics. Without constraints, generic parameters accept literally any type, which provides maximum flexibility but minimal safety—you can't safely perform any operations on the generic value because TypeScript knows nothing about its structure. Constraints solve this problem by requiring the generic type to extend a base type or interface, giving TypeScript enough information to validate operations while maintaining reusability. Understanding constraints is essential for building flexible, reusable React components that maintain type safety, prevent runtime errors, and provide excellent developer experience through accurate autocomplete and compile-time validation.

**Unconstrained vs Constrained Generics**:

An unconstrained generic accepts any type whatsoever, which provides maximum flexibility but minimal type safety:

```typescript
// Unconstrained - T can be literally anything
function identity<T>(value: T): T {
  return value;
}

identity(42);           // T is number
identity("hello");      // T is string
identity({ x: 1 });     // T is { x: number }
identity(null);         // T is null
identity(undefined);    // T is undefined
```

The problem with unconstrained generics is that you can't safely perform operations on the value because TypeScript doesn't know anything about T. The type parameter T is a black box—it could be a number, string, object, array, function, null, undefined, or any other type. Without constraints, TypeScript must assume the worst case and disallow all operations except those that work on absolutely every type (like assignment or typeof checking). This makes unconstrained generics useful only for pass-through operations where you don't need to inspect or manipulate the value:

```typescript
function logLength<T>(value: T): number {
  return value.length; // ❌ Error: Property 'length' does not exist on type 'T'
  // TypeScript doesn't know if T has a 'length' property
  // T could be number, boolean, object without length, etc.
}
```

Constraints solve this by requiring T to have specific properties or extend specific types, establishing a contract that gives TypeScript enough information to validate operations safely. When you add `extends HasLength` to the generic parameter, you're telling TypeScript "I promise that whatever type is passed in will have all the properties of HasLength," which allows TypeScript to validate property access and method calls:

```typescript
// Constraint: T must have a length property
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): number {
  return value.length; // ✅ Works! TypeScript knows T has .length
}

logLength("hello");           // ✅ Strings have .length
logLength([1, 2, 3]);         // ✅ Arrays have .length
logLength({ length: 42 });    // ✅ Object with .length
logLength(42);                // ❌ Error: Numbers don't have .length
```

**Generic Constraints in React Components**:

React components frequently use constraints to ensure props contain required properties while remaining flexible about additional properties. This pattern is particularly valuable when building reusable data display components like lists, tables, cards, and grids that need to work with different data types while maintaining certain guarantees. For example, any list component needs to generate unique React keys for each item, which requires each item to have some form of unique identifier. By constraining the generic type parameter to extend an Identifiable interface, you ensure compile-time safety that all items will have the required id property, preventing runtime errors from missing keys:

```typescript
// Constraint: All items must have an 'id' for React keys
interface Identifiable {
  id: string | number;
}

interface DataListProps<T extends Identifiable> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}

const DataList = <T extends Identifiable>({
  items,
  renderItem,
  onItemClick,
}: DataListProps<T>) => (
  <ul>
    {items.map((item) => (
      <li
        key={item.id} // ✅ TypeScript knows item.id exists
        onClick={onItemClick ? () => onItemClick(item) : undefined}
      >
        {renderItem(item)}
      </li>
    ))}
  </ul>
);

// Usage with different types, all guaranteed to have 'id'
interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
}

<DataList<User>
  items={users}
  renderItem={(user) => `${user.name} (${user.email})`}
  onItemClick={(user) => console.log('Clicked user:', user.id)}
/>

<DataList<Product>
  items={products}
  renderItem={(product) => `${product.title} - $${product.price}`}
/>
```

**Multi-Parameter Generics for Complex Components**:

Real-world components often need multiple generic parameters to handle different aspects of component behavior independently, allowing each type parameter to represent a distinct concern in the component's API. This separation of concerns through multiple generics enables more flexible and maintainable component designs. Consider a pagination component that needs to handle both the data type being displayed and the filter type being applied—these are independent concerns that should be parameterized separately. Using two generic parameters (TData for the items and TFilter for the filter state) allows the component to work with any combination of data and filter types while maintaining full type safety for both:

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

**Keyof and Mapped Types for Type-Safe Property Access**

The `keyof` operator extracts all keys from a type as a union of string literals, and mapped types iterate over those keys to recreate types with transformations. Together, these features enable powerful type-safe patterns for property access, validation, and transformation. The keyof operator is fundamental to many advanced TypeScript patterns because it creates a tight coupling between object types and their property names, ensuring that property access is validated at compile-time. When combined with mapped types, you can create sophisticated type transformations that maintain perfect synchronization between data structures and their derived types:

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

**Conditional Types for Smart Props and Type-Level Logic**

Conditional types create different types based on conditions, enabling type-level if/else logic that adapts component types based on input types. This feature allows you to write component APIs that intelligently adjust their prop requirements based on the data they receive, creating more ergonomic and type-safe interfaces. Conditional types use the `extends` keyword combined with the ternary operator syntax (`T extends U ? X : Y`) to select between two type branches, similar to how JavaScript's ternary operator selects between two value branches. This pattern is particularly powerful for creating components with polymorphic APIs that adapt to their input:

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

**Type Inference with As Const - Precise Literal Types**

The `as const` assertion is a powerful TypeScript feature that creates immutable, precise literal types instead of broader general types, fundamentally changing how TypeScript infers types from object and array literals. Without `as const`, TypeScript infers the widest reasonable type—string instead of "blue", number instead of 42, mutable arrays instead of readonly tuples. This default behavior makes sense for most code where values change, but for configuration objects, constant data, and variant systems, you want precise literal types that match exactly what you wrote. The `as const` assertion tells TypeScript "treat this as deeply readonly and infer the narrowest possible types," which is particularly useful for configuration objects, variant systems, and constant data in React components where you want compile-time guarantees about specific values:

**Without `as const`**, TypeScript infers broad types:

```typescript
// TypeScript infers broad string type
const colors = { primary: 'blue', secondary: 'gray' };
type Color = typeof colors[keyof typeof colors]; // string (too broad!)

// This allows invalid assignments:
const invalidColor: Color = "purple"; // ✅ Allowed, but wrong!
```

**With `as const`**, TypeScript creates exact literal types:

```typescript
// as const makes everything readonly and literal
const colors = { primary: 'blue', secondary: 'gray' } as const;
type Color = typeof colors[keyof typeof colors]; // 'blue' | 'gray' (exact!)

const validColor: Color = 'blue';    // ✅ Works
const invalidColor: Color = 'purple'; // ❌ Error: not in union
```

**Practical React Application - Variant System**:

```typescript
// Define button variants with exact types
const buttonVariants = {
  primary: {
    bg: 'bg-blue-600',
    text: 'text-white',
    hover: 'hover:bg-blue-700',
  },
  secondary: {
    bg: 'bg-gray-200',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-300',
  },
  danger: {
    bg: 'bg-red-600',
    text: 'text-white',
    hover: 'hover:bg-red-700',
  },
} as const;

// Extract variant names as union type
type Variant = keyof typeof buttonVariants; // 'primary' | 'secondary' | 'danger'

interface ButtonProps {
  variant: Variant; // Must be exactly one of these
  children: React.ReactNode;
}

const Button = ({ variant, children }: ButtonProps) => {
  const styles = buttonVariants[variant]; // TypeScript knows variant is valid key

  return (
    <button className={`${styles.bg} ${styles.text} ${styles.hover} px-4 py-2 rounded`}>
      {children}
    </button>
  );
};

// Usage with type safety
<Button variant="primary">Submit</Button>     // ✅ Works
<Button variant="secondary">Cancel</Button>   // ✅ Works
<Button variant="success">Save</Button>       // ❌ Error: 'success' not in Variant
```

**Advanced Pattern - Configuration with Inference**:

```typescript
// Route configuration with as const
const routes = [
  { path: '/', component: 'Home' },
  { path: '/about', component: 'About' },
  { path: '/contact', component: 'Contact' },
] as const;

// Extract path type from configuration
type Route = typeof routes[number]['path']; // '/' | '/about' | '/contact'

// Type-safe navigation
function navigate(route: Route) {
  // TypeScript ensures route is valid
  window.location.href = route;
}

navigate('/about');    // ✅ Works
navigate('/invalid');  // ❌ Error: not a valid route
```

This pattern ensures configuration and code stay in sync. If you add a route, TypeScript automatically includes it in the `Route` type. If you remove a route, usages immediately show errors.

---

### 🐛 Real-World Scenario: Building Type-Safe Form Library

**Problem Context**: A rapidly growing SaaS company building an internal admin dashboard needed a reusable form library to handle dozens of different form types across their platform—user registration, product creation, invoice management, customer support tickets, analytics configuration, billing settings, and many more. The admin panel served 47 different internal teams with 200+ daily active users (internal staff), and each team had unique data entry requirements. The initial implementation, built under pressure to ship features quickly, used `any` types everywhere to avoid fighting with TypeScript during prototyping. This led to a maintenance nightmare where form validation logic was duplicated across 47 different forms, type errors slipped into production causing data corruption, and new developers spent days struggling to understand which fields were required, which validations applied, and how form state was managed. The lack of type safety meant refactoring any part of the form system had unpredictable ripple effects across the entire application.

**Impact of Poor Typing**:
- **Validation bugs**: 34 production incidents in 3 months from invalid form data
- **Developer time lost**: Average 2.3 hours per form to debug type-related issues
- **Code duplication**: 1,847 lines of duplicate validation logic across forms
- **Onboarding friction**: New developers took 5+ days to understand form patterns
- **Refactoring risk**: Changing form structure broke 12-18 forms on average

**Initial Problematic Code**:
```typescript
// ❌ No type safety - accepts anything
const createForm = (schema: any) => {
  return {
    fields: schema.fields,
    validate: (data: any) => {
      const errors: any = {};
      // Validation logic is unclear
      // No guarantee data matches schema
      return errors;
    },
    submit: (data: any) => {
      // What shape is data? Unknown!
      fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };
};

// ❌ Usage provides zero type safety
const userForm = createForm({ fields: ['name', 'email'] });

// These should be errors but TypeScript allows them:
userForm.validate({ name: 123, email: true }); // ❌ Wrong types
userForm.submit({ randomField: 'value' });     // ❌ Unexpected field
```

**Why This Failed**:
1. **No schema validation** - Schema could contain any structure
2. **Data shape unknown** - Validation had no way to ensure data matched schema
3. **Runtime failures** - API rejections after form submission (too late!)
4. **No autocomplete** - Developers had to memorize field names
5. **Maintenance nightmare** - Changing one form structure had unknown ripple effects

**Advanced Solution with Generic Type System**:

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

**Results After Generic Type Implementation**:

**Error Reduction**:
- Production incidents from form validation: 34 in 3 months → 2 in 6 months (94% reduction)
- Type errors caught at compile-time: 0 → 147 errors prevented before deployment
- API rejection rate due to invalid data: 8.7% → 0.3% (96% reduction)
- Runtime form errors: 23 per week → 1 per month (98% reduction)

**Development Productivity**:
- Time to create new form: 4.5 hours → 45 minutes (83% faster)
- Debugging time per form issue: 2.3 hours → 15 minutes (89% reduction)
- Code duplication eliminated: Removed 1,847 lines of duplicate validation logic
- Onboarding time for new developers: 5 days → 1.5 days (70% faster)

**Code Quality Improvements**:
- Forms now self-document through types
- IDE autocomplete reduced typos by 92%
- Refactoring safety: Zero breaking changes across 47 forms after major refactor
- Validation logic centralized in reusable TypedForm class
- Form fields automatically match data structure types

**Business Impact**:
- Customer satisfaction improved (fewer form submission errors)
- Developer satisfaction increased (type safety reduces frustration)
- Faster feature delivery (new forms take 83% less time)
- Reduced technical debt (centralized, typed validation logic)

---

### ⚖️ Trade-offs: Generic Complexity vs Simplicity

The decision to use generic TypeScript patterns versus simple, non-generic approaches represents a fundamental trade-off between flexibility/reusability and simplicity/maintainability, with far-reaching implications for project architecture, team collaboration, and long-term evolution. This choice significantly impacts code complexity, initial development velocity, team onboarding time, debugging difficulty, refactoring safety, and long-term maintainability. The decision isn't binary—it exists on a spectrum from maximally simple (concrete types for everything) to maximally generic (parameterized types everywhere), and the optimal point depends on factors like team expertise, project maturity, reuse requirements, and maintenance burden tolerance.

**Simple Non-Generic Approach**:

Simple components use explicit, concrete types with no generic parameters. This approach maximizes clarity and minimizes cognitive load:

```typescript
// Explicit, non-generic button
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button = ({ label, onClick, disabled, variant = 'primary' }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant}`}
  >
    {label}
  </button>
);

// Usage is straightforward
<Button label="Submit" onClick={handleSubmit} variant="primary" />
```

**Benefits of Simple Approach**:
- **Low cognitive load** - Junior developers understand immediately
- **Fast to write** - No generic syntax or type parameters to manage
- **Easy to debug** - Error messages are clear and specific
- **Straightforward refactoring** - Changes have obvious, local impact
- **Better for small teams** - Less TypeScript expertise required

**Drawbacks of Simple Approach**:
- **Limited reusability** - Each component variant needs separate implementation
- **Code duplication** - Similar logic repeated across multiple components
- **Inflexible** - Hard to extend for new use cases without modification
- **Type narrowing issues** - Can't handle dynamic data shapes
- **Scaling problems** - Becomes unwieldy with many similar components

---

**Generic Advanced Approach**:

Generic components use type parameters to handle multiple data shapes with a single implementation:

```typescript
// Generic button that can handle different data types
interface GenericButtonProps<TData extends Record<string, any>> {
  label: string;
  onClick: (data?: TData) => void;
  disabled?: boolean;
  data?: TData;
  validateData?: (data: TData) => boolean;
}

const GenericButton = <TData extends Record<string, any>>({
  label,
  onClick,
  disabled,
  data,
  validateData,
}: GenericButtonProps<TData>) => {
  const handleClick = () => {
    if (data && validateData && !validateData(data)) {
      console.error('Invalid data');
      return;
    }
    onClick(data);
  };

  return (
    <button onClick={handleClick} disabled={disabled}>
      {label}
    </button>
  );
};

// Usage with different data types
interface UserData {
  id: number;
  name: string;
}

interface FormData {
  email: string;
  message: string;
}

<GenericButton<UserData>
  label="Save User"
  onClick={(data) => saveUser(data)}
  data={{ id: 1, name: 'Alice' }}
  validateData={(d) => d.name.length > 0}
/>

<GenericButton<FormData>
  label="Send Message"
  onClick={(data) => sendMessage(data)}
  data={{ email: 'test@example.com', message: 'Hello' }}
/>
```

**Benefits of Generic Approach**:
- **High reusability** - Single component handles unlimited data types
- **Type safety preserved** - Full type checking for each usage
- **DRY principle** - Logic written once, reused everywhere
- **Flexible** - Adapts to new use cases without modification
- **Scales well** - Adding types doesn't require new components

**Drawbacks of Generic Approach**:
- **High complexity** - Requires solid TypeScript knowledge
- **Slower initial development** - More time to write generic infrastructure
- **Complex error messages** - TypeScript errors can be cryptic
- **Harder to debug** - Generic code paths harder to trace
- **Over-engineering risk** - May be overkill for simple use cases

---

**Decision Matrix - When to Use Each**:

| Aspect | Simple | Generic | Winner |
|--------|--------|---------|--------|
| Learning curve | ⭐⭐ (easy) | ⭐⭐⭐⭐⭐ (hard) | Simple |
| Reusability | ⭐⭐ (limited) | ⭐⭐⭐⭐⭐ (excellent) | Generic |
| Type safety | ⭐⭐⭐ (good) | ⭐⭐⭐⭐⭐ (excellent) | Generic |
| Maintenance | ⭐⭐⭐⭐ (easy) | ⭐⭐⭐ (moderate) | Simple |
| Flexibility | ⭐⭐ (limited) | ⭐⭐⭐⭐⭐ (excellent) | Generic |
| Lines of code | ⭐⭐⭐⭐⭐ (minimal) | ⭐⭐⭐ (verbose) | Simple |
| IDE support | ⭐⭐⭐⭐ (good) | ⭐⭐⭐⭐⭐ (excellent) | Generic |
| Team scalability | ⭐⭐⭐ (medium) | ⭐⭐⭐⭐⭐ (excellent) | Generic |

---

**Practical Guidelines - When to Choose Each**:

**Use Simple Non-Generic Types When**:
- Building application-specific UI components (LoginButton, CheckoutForm)
- Team has limited TypeScript experience
- Component has single, well-defined purpose
- Prototype or MVP phase prioritizing speed
- Component won't be reused across different contexts
- Maintenance simplicity is priority over flexibility

**Use Generic Types When**:
- Building reusable component libraries (shared across projects)
- Component handles multiple data shapes (List, Table, Form)
- Type safety across varied use cases is critical
- Team has strong TypeScript expertise
- Long-term maintenance and scalability important
- DRY principle and code reusability are priorities

**Balanced Approach (Recommended for Most Teams)**:
- Use simple types for application components
- Use generics for truly reusable utilities (data display, forms, tables)
- Start simple, refactor to generic only when reuse pattern emerges
- Extract generic patterns after seeing duplication 3+ times
- Keep generic components in shared library, simple components in application code

**Real-World Team Strategy**:
1. **Week 1-2**: Build quickly with simple types (MVP phase)
2. **Week 3-4**: Identify duplication patterns across components
3. **Week 5**: Extract 2-3 most common patterns into generic components
4. **Week 6+**: Refactor application code to use generic library components
5. **Ongoing**: Add generics only when clear reuse benefit exists

This phased approach balances initial speed with long-term maintainability, preventing both over-engineering early and technical debt accumulation later.

---

### 💬 Explain to Junior: Advanced Patterns Made Simple

**The Universal Container Analogy**:

Imagine you're organizing a large storage warehouse for a company that ships many different products. You have different types of items to store: apples, books, tools, toys, electronics, furniture, and hundreds of other product categories. Each type has different requirements—apples need climate control, books need dry storage, electronics need static protection. You face a choice: build a completely different storage system for each product type (requiring hundreds of specialized systems), or build one universal, flexible system that can adapt to store anything safely. This is exactly the choice between non-generic and generic TypeScript components.

**Non-Generic Approach (Separate System for Each Item)**:

```typescript
// Specific box for apples only
interface AppleBoxProps {
  apples: Apple[];
  onSelectApple: (apple: Apple) => void;
}

const AppleBox = ({ apples, onSelectApple }: AppleBoxProps) => (
  <div className="apple-storage">
    {apples.map((apple) => (
      <div onClick={() => onSelectApple(apple)} key={apple.id}>
        {apple.variety} - {apple.color}
      </div>
    ))}
  </div>
);

// Now you need a separate box for books...
interface BookBoxProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

const BookBox = ({ books, onSelectBook }: BookBoxProps) => (
  <div className="book-storage">
    {books.map((book) => (
      <div onClick={() => onSelectBook(book)} key={book.isbn}>
        {book.title} - {book.author}
      </div>
    ))}
  </div>
);

// And another for tools... you see the pattern? Lots of duplication!
```

**Generic Approach (One Universal System)**:

```typescript
// Universal box that works for ANY type
interface UniversalBoxProps<T> {
  items: T[];                                  // Array of any type
  onSelectItem: (item: T) => void;            // Callback with that type
  renderItem: (item: T) => React.ReactNode;   // Function to display that type
  getId: (item: T) => string | number;        // Function to get unique ID
}

// The <T,> syntax means "this component works with any type T"
const UniversalBox = <T,>({
  items,
  onSelectItem,
  renderItem,
  getId,
}: UniversalBoxProps<T>) => (
  <div className="universal-storage">
    {items.map((item) => (
      <div onClick={() => onSelectItem(item)} key={getId(item)}>
        {renderItem(item)}
      </div>
    ))}
  </div>
);

// Now use it for apples
<UniversalBox<Apple>
  items={apples}
  onSelectItem={(apple) => console.log('Selected:', apple.variety)}
  renderItem={(apple) => `${apple.variety} - ${apple.color}`}
  getId={(apple) => apple.id}
/>

// Same component works for books!
<UniversalBox<Book>
  items={books}
  onSelectItem={(book) => console.log('Selected:', book.title)}
  renderItem={(book) => `${book.title} by ${book.author}`}
  getId={(book) => book.isbn}
/>

// And tools, and toys, and anything else!
```

**Why This Is Powerful**:
- Write the component ONCE, use it EVERYWHERE
- TypeScript knows the exact type in each usage
- Adding new item types requires ZERO code changes
- Full autocomplete and type safety

---

**Utility Types - The Type Transformer Toolbox**:

Think of utility types as tools that transform existing types into new ones, similar to how power tools transform raw materials into finished products. Just as a woodworker might use a saw to cut a board, a plane to smooth it, and a drill to make holes, TypeScript developers use utility types like Omit, Pick, and Record to transform base types into exactly the shapes they need. These built-in utilities save enormous amounts of time and prevent errors by providing tested, reliable transformations instead of requiring you to manually recreate types. Let's explore the most important utilities and when to use each one:

**Omit - The "Remove Tool"**:

```typescript
// You have a complete user object
interface User {
  id: number;
  name: string;
  email: string;
  password: string;    // Sensitive!
  ssn: string;         // Very sensitive!
  createdAt: Date;
}

// Omit creates a new type WITHOUT certain fields
type PublicUser = Omit<User, 'password' | 'ssn'>;
// Result: User without password and ssn

// Now you can send user data to frontend safely
const sendToClient = (user: PublicUser) => {
  // This has: id, name, email, createdAt
  // But NOT: password, ssn
};
```

**Pick - The "Select Tool"**:

```typescript
// Pick creates a new type WITH ONLY certain fields
type UserPreview = Pick<User, 'name' | 'email'>;
// Result: { name: string; email: string; }

// Perfect for card previews
const UserCard = ({ user }: { user: UserPreview }) => (
  <div>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
    {/* Can't access user.password - it doesn't exist in this type! */}
  </div>
);
```

**Record - The "Create Multiple Fields Tool"**:

```typescript
// Record creates an object type with specific keys and value type
type FormState = Record<'name' | 'email' | 'password', string>;
// Result: { name: string; email: string; password: string; }

// Or create a validation state
type FieldValidation = Record<'name' | 'email', boolean>;
// Result: { name: boolean; email: boolean; }

const validation: FieldValidation = {
  name: true,    // Valid
  email: false,  // Invalid
};
```

---

**Conditional Types - The "If/Else for Types"**:

Conditional types let you create different types based on a condition, just like if/else in regular code, but operating at the type level instead of the value level. While regular if/else statements control program flow at runtime ("if this value is true, do X, otherwise do Y"), conditional types control type selection at compile-time ("if this type matches this pattern, use type X, otherwise use type Y"). This enables incredibly powerful patterns where your types can adapt intelligently based on input, creating APIs that feel magical but remain totally type-safe. Think of conditional types as smart type transformers that inspect their input and produce different outputs accordingly:

```typescript
// Basic example: Unwrap arrays
type Unwrap<T> = T extends any[] ? T[0] : T;

// If T is an array, give me what's inside (T[0])
// Otherwise, just give me T

type Test1 = Unwrap<string[]>;  // Result: string (unwrapped the array)
type Test2 = Unwrap<number>;    // Result: number (can't unwrap, return as-is)

// Practical React example: Different props based on data type
type ComponentProps<T> = T extends any[]
  ? {
      items: T;                           // Array of items
      renderItem: (item: T[0]) => JSX.Element;
      emptyMessage: string;
    }
  : {
      item: T;                            // Single item
      render: (item: T) => JSX.Element;
    };

// For array data, you get items + renderItem
const arrayProps: ComponentProps<User[]> = {
  items: [user1, user2],
  renderItem: (user) => <div>{user.name}</div>,
  emptyMessage: 'No users found',
};

// For single data, you get item + render
const singleProps: ComponentProps<User> = {
  item: user1,
  render: (user) => <div>{user.name}</div>,
};
```

---

**Mapped Types - The "Apply to All Fields" Tool**:

Mapped types iterate over all properties in a type and transform them, applying the same transformation to every field automatically. Think of mapped types like a factory assembly line that processes every item the same way—if you have 100 fields in an object type, mapped types can transform all 100 fields with a single type definition instead of manually rewriting each field. This is incredibly powerful for creating variations of existing types where every field undergoes the same transformation—making all fields optional, readonly, nullable, or converting them to different types. Mapped types use the `in keyof` syntax to iterate over keys and apply transformations systematically:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

// Make all fields optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type OptionalUser = Optional<User>;
// Result:
// {
//   name?: string;
//   email?: string;
//   age?: number;
// }

// Make all fields readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type ReadonlyUser = Readonly<User>;
// Result:
// {
//   readonly name: string;
//   readonly email: string;
//   readonly age: number;
// }

// Turn all fields into getter functions
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type UserGetters = Getters<User>;
// Result:
// {
//   name: () => string;
//   email: () => string;
//   age: () => number;
// }
```

---

**Key Takeaways for Beginners**:

1. **Generics** = Write once, use with any type (like templates that work with placeholders)
2. **Omit** = Remove fields you don't want (create public API types without sensitive data)
3. **Pick** = Select only fields you want (create preview/summary types)
4. **Record** = Create object with specific keys and value type (perfect for form state)
5. **Conditional Types** = If/else for types (smart APIs that adapt based on input)
6. **Mapped Types** = Apply transformation to all fields (make everything optional/readonly/nullable at once)
7. **As Const** = Lock values to exact literals (for configuration objects and variant systems)
8. **Keyof** = Extract all keys from a type (for type-safe property access)

**When to Use Advanced Patterns**:
- Building reusable libraries → Use generics
- Hiding sensitive data → Use Omit
- Creating preview types → Use Pick
- Form state → Use Record
- Dynamic props → Use Conditional Types
- Transform all fields → Use Mapped Types

---

**Interview Answer Template**:

*"Advanced TypeScript patterns enable building flexible, reusable, and type-safe React components that adapt to different data types while maintaining comprehensive compile-time validation.*

*Generic components use type parameters like <T> to work with any data type while maintaining full type safety through constraints and inference. For example, a List<T extends Identifiable> component can display User arrays, Product arrays, or any other type that has an 'id' property. The constraint ensures the component can safely access item.id for React keys, while the generic parameter allows it to work with any data structure. The trailing comma in <T,> is required in .tsx files to distinguish the syntax from JSX tags.*

*Utility types transform existing types systematically. Omit removes specific fields, which I use to create public API types by removing sensitive data like password or SSN from User types. Pick selects only specific fields, perfect for creating preview types like UserCard that needs only name and email. Record creates object types with specific keys and a uniform value type, which I use frequently for form state where all fields are strings or form validation where all fields map to boolean validity.*

*Conditional types use the 'extends' keyword with ternary syntax to create type-level if/else logic. The pattern `T extends U ? X : Y` checks if type T is assignable to U, selecting type X if true or Y if false. This enables components with polymorphic props that adapt based on input—for example, a DataComponent that requires different props for array data versus single items. I've used this pattern with the 'infer' keyword to extract types from complex structures like unwrapping Promise types or extracting array element types.*

*Mapped types iterate over object keys using the `[K in keyof T]` syntax to transform every property systematically. Partial<T> makes all fields optional, Readonly<T> makes them readonly, and you can create custom transformations like converting all fields to getter functions. I often combine mapped types with conditional types for advanced transformations like making only specific property types optional.*

*The 'as const' assertion is crucial for creating exact literal types from constant data. Without it, TypeScript infers broad types like string; with it, you get precise literals like 'primary' | 'secondary'. I use this extensively for variant systems, configuration objects, and route definitions where I want autocomplete for specific string values.*

*The key benefit is writing DRY, type-safe code that scales. Instead of creating separate components for each data type—duplicating logic and creating maintenance burden—one generic component handles all cases with full type checking and IDE autocomplete. This reduces code duplication by 70-80% in component libraries, prevents runtime type errors through compile-time validation, provides excellent developer experience through precise autocomplete, and makes refactoring safe because type changes propagate automatically through the system."*

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
