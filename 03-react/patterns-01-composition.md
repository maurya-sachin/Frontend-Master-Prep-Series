# React Composition Patterns

## Question 1: What are component composition patterns in React? (children, render props, slots)

### Answer

Component composition patterns in React are techniques for building complex UIs by combining smaller, reusable components together rather than using inheritance. The primary composition patterns include:

**Children Pattern**: The most fundamental pattern where components accept `children` prop to render nested content. This allows parent components to wrap arbitrary child elements without knowing their implementation details.

**Render Props Pattern**: A technique where a component accepts a function as a prop that returns a React element. This function receives data or callbacks from the parent component, enabling flexible rendering logic while sharing stateful behavior.

**Slots Pattern**: Inspired by Web Components, this pattern uses named props (like `header`, `footer`, `sidebar`) to accept React elements, allowing precise control over where specific content appears in the component's layout.

These patterns solve the problem of code reuse and component flexibility. Instead of creating rigid component hierarchies through inheritance (which React discourages), composition allows you to build components like LEGO blocks - each piece has a specific purpose and can be combined in countless ways.

The key advantage is **inversion of control**: the parent component controls what gets rendered, while the child component provides the structure and behavior. This separation of concerns makes components more testable, maintainable, and reusable across different contexts.

React's philosophy strongly favors composition over inheritance because components naturally form a containment hierarchy rather than an is-a relationship. A `Dialog` component doesn't need to inherit from `Modal`; it can simply compose smaller pieces like `Overlay`, `CloseButton`, and accept `children` for its content.

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**React Element Tree Structure and Composition**

When you write JSX, React creates a tree of React elements (plain JavaScript objects describing what should appear on screen). Composition patterns manipulate this tree structure in powerful ways:

```javascript
// What JSX actually creates
<Card>
  <Title>Hello</Title>
</Card>

// Becomes this React element tree
{
  type: Card,
  props: {
    children: {
      type: Title,
      props: { children: "Hello" }
    }
  }
}
```

**Children Pattern Internals**

The `children` prop is special in React. It's automatically populated with any nested content and can be manipulated using React's utility methods:

```javascript
// ✅ GOOD: Flexible container component
const Card = ({ children, variant = 'default' }) => {
  return (
    <div className={`card card--${variant}`}>
      {children}
    </div>
  );
};

// Usage - complete control over content
<Card variant="elevated">
  <CardHeader>
    <h2>Profile</h2>
    <Badge count={5} />
  </CardHeader>
  <CardBody>
    <UserProfile />
  </CardBody>
</Card>

// React.Children utilities for advanced manipulation
const List = ({ children, separator }) => {
  const items = React.Children.toArray(children);

  return (
    <ul>
      {items.map((child, index) => (
        <React.Fragment key={child.key || index}>
          <li>{child}</li>
          {index < items.length - 1 && <li className="separator">{separator}</li>}
        </React.Fragment>
      ))}
    </ul>
  );
};
```

**Render Props Pattern Deep Mechanics**

Render props solve the problem of sharing stateful logic between components. Before hooks, this was one of the primary patterns for code reuse:

```javascript
// ✅ GOOD: Mouse tracking with render prop
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  };

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {/* Render prop function receives state */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

// Usage - different UIs using same logic
<MouseTracker render={({ x, y }) => (
  <h1>Mouse position: {x}, {y}</h1>
)} />

<MouseTracker render={({ x, y }) => (
  <Circle x={x} y={y} />
)} />

// Modern equivalent with hooks
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
};
```

**Slots Pattern Implementation**

The slots pattern provides named insertion points, offering more control than generic children:

```javascript
// ✅ GOOD: Modal with named slots
const Modal = ({
  header,
  body,
  footer,
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {header && (
          <div className="modal-header">
            {header}
            <button onClick={onClose} aria-label="Close">×</button>
          </div>
        )}

        <div className="modal-body">
          {body}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Usage - explicit slot assignment
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  header={<h2>Confirm Action</h2>}
  body={<p>Are you sure you want to delete this item?</p>}
  footer={
    <>
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={handleDelete} variant="danger">Delete</Button>
    </>
  }
/>
```

**Composition vs Inheritance in React**

React strongly favors composition because of how component trees work:

```javascript
// ❌ BAD: Trying to use inheritance (anti-pattern in React)
class Dialog extends React.Component {
  render() {
    return <div className="dialog">{this.renderContent()}</div>;
  }

  renderContent() {
    // Subclasses override this
    throw new Error('Must implement renderContent');
  }
}

class WelcomeDialog extends Dialog {
  renderContent() {
    return <h1>Welcome</h1>;
  }
}

// ✅ GOOD: Using composition instead
const Dialog = ({ title, children }) => (
  <div className="dialog">
    <h1>{title}</h1>
    <div className="dialog-content">{children}</div>
  </div>
);

const WelcomeDialog = () => (
  <Dialog title="Welcome">
    <p>Thank you for visiting our spacecraft!</p>
  </Dialog>
);
```

**Advanced: Component Cloning and Props Injection**

React allows you to clone elements and inject additional props, enabling powerful composition patterns:

```javascript
// ✅ GOOD: Tabs component that enhances children
const Tabs = ({ children, activeTab, onChange }) => {
  return (
    <div className="tabs">
      <div className="tabs-header">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null;

          // Clone child and inject props
          return React.cloneElement(child, {
            isActive: index === activeTab,
            onClick: () => onChange(index),
            index
          });
        })}
      </div>
    </div>
  );
};

const Tab = ({ label, isActive, onClick }) => (
  <button
    className={`tab ${isActive ? 'tab--active' : ''}`}
    onClick={onClick}
    aria-selected={isActive}
  >
    {label}
  </button>
);

// Usage
<Tabs activeTab={activeTab} onChange={setActiveTab}>
  <Tab label="Profile" />
  <Tab label="Settings" />
  <Tab label="Notifications" />
</Tabs>
```

This deep understanding of composition mechanics enables building highly flexible, reusable component libraries.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem: Building a Reusable Design System with Inconsistent Component APIs**

At a SaaS company with 50+ engineers, the UI team needed to build a design system library used across 12 different product teams. Initial metrics showed poor adoption:

- **Component Reuse Rate**: 23% (target: 80%)
- **Custom Implementation Time**: 4.2 hours per feature (target: 1 hour)
- **Accessibility Issues**: 67 WCAG violations across products
- **Bundle Size**: 847KB for design system (target: 300KB)

**Root Cause Analysis**

The existing component library had rigid APIs that forced developers to fork components instead of composing them:

```javascript
// ❌ BAD: Rigid component with limited flexibility
const Card = ({
  title,
  subtitle,
  imageUrl,
  actions,
  content,
  variant // only 3 variants supported
}) => {
  return (
    <div className={`card card--${variant}`}>
      {imageUrl && <img src={imageUrl} alt="" />}
      <div className="card-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="card-content">
        {content}
      </div>
      {actions && (
        <div className="card-actions">
          {actions.map(action => (
            <button key={action.label} onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Teams needed custom badges, icons, multiple images, etc.
// So they forked the component, creating 47 different Card variants!
```

**Solution: Composition-First Design System**

The team redesigned the library using composition patterns:

```javascript
// ✅ GOOD: Composition-based Card system
const Card = ({ children, variant = 'default', className }) => (
  <div className={`card card--${variant} ${className}`}>
    {children}
  </div>
);

Card.Image = ({ src, alt, position = 'top' }) => (
  <div className={`card-image card-image--${position}`}>
    <img src={src} alt={alt} loading="lazy" />
  </div>
);

Card.Header = ({ children, className }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, level = 3 }) => {
  const Tag = `h${level}`;
  return <Tag className="card-title">{children}</Tag>;
};

Card.Subtitle = ({ children }) => (
  <p className="card-subtitle">{children}</p>
);

Card.Body = ({ children }) => (
  <div className="card-body">{children}</div>
);

Card.Footer = ({ children, align = 'right' }) => (
  <div className={`card-footer card-footer--${align}`}>
    {children}
  </div>
);

// Usage - infinite flexibility through composition
<Card variant="elevated">
  <Card.Header>
    <Badge status="new">New</Badge>
    <Card.Title level={2}>Product Launch</Card.Title>
    <Card.Subtitle>Released 2 hours ago</Card.Subtitle>
  </Card.Header>

  <Card.Image src="/product.jpg" alt="Product preview" />

  <Card.Body>
    <p>Introducing our revolutionary new feature...</p>
    <Stats downloads={1200} likes={450} />
  </Card.Body>

  <Card.Footer align="space-between">
    <UserAvatar user={author} />
    <div>
      <Button variant="secondary">Learn More</Button>
      <Button variant="primary">Get Started</Button>
    </div>
  </Card.Footer>
</Card>
```

**Implementation Details**

For accessible, flexible modals using render props + context:

```javascript
// ✅ GOOD: Flexible modal with composition and context
const ModalContext = createContext();

const Modal = ({ isOpen, onClose, children }) => {
  const [focusTrap, setFocusTrap] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // Accessibility: trap focus, handle ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <ModalContext.Provider value={{ onClose }}>
      <div
        className="modal-overlay"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          ref={setFocusTrap}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
};

Modal.Header = ({ children }) => {
  const { onClose } = useContext(ModalContext);

  return (
    <div className="modal-header">
      {children}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="modal-close"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Usage across different contexts
<Modal isOpen={showDelete} onClose={closeDelete}>
  <Modal.Header>
    <h2>Confirm Deletion</h2>
  </Modal.Header>
  <Modal.Body>
    <p>This action cannot be undone.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={closeDelete}>Cancel</Button>
    <Button onClick={handleDelete} variant="danger">Delete</Button>
  </Modal.Footer>
</Modal>
```

**Results After Composition Refactor**

After 3 months of adopting composition patterns:

- **Component Reuse Rate**: 23% → 81% (+252% improvement)
- **Custom Implementation Time**: 4.2 hours → 0.9 hours (-79%)
- **Accessibility Issues**: 67 violations → 3 violations (-95.5%)
- **Bundle Size**: 847KB → 312KB (-63% via tree-shaking)
- **Design System Adoption**: 34% → 89% of teams
- **Component Variants**: 47 Card forks → 1 composable Card
- **Developer Satisfaction**: 3.2/5 → 4.7/5

**Key Lessons Learned**

1. **Start with primitives**: Build small, single-purpose components that compose well
2. **Use compound components**: Group related components under a namespace (Card.Header)
3. **Leverage context**: Share state between composed components without prop drilling
4. **Accessibility by default**: Composition patterns make it easier to bake in a11y
5. **Tree-shaking friendly**: Composition enables better code splitting and tree-shaking

</details>

---

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Children Pattern vs Render Props vs Slots**

| Pattern | Best For | Pros | Cons | Performance |
|---------|----------|------|------|-------------|
| **Children** | Simple wrappers, layouts | - Simplest API<br>- Intuitive JSX<br>- Easy to read | - Less control over rendering<br>- Can't pass data to children easily | Excellent (no extra renders) |
| **Render Props** | Sharing stateful logic | - Maximum flexibility<br>- Can pass data/callbacks<br>- Logic reuse | - Verbose syntax<br>- Callback hell potential<br>- Hooks are often better now | Good (re-renders when function identity changes) |
| **Slots** | Structured layouts | - Clear API surface<br>- Predictable placement<br>- Easy to document | - More props to manage<br>- Less flexible than children | Excellent (props are stable) |

**When to Use Each Pattern**

```javascript
// ✅ CHILDREN: Best for simple wrappers
const Container = ({ children, maxWidth = '1200px' }) => (
  <div style={{ maxWidth, margin: '0 auto' }}>
    {children}
  </div>
);

// ✅ RENDER PROPS: Best for shared stateful logic (pre-hooks)
const DataFetcher = ({ url, render }) => {
  const [data, loading, error] = useFetch(url);
  return render({ data, loading, error });
};

<DataFetcher
  url="/api/users"
  render={({ data, loading }) =>
    loading ? <Spinner /> : <UserList users={data} />
  }
/>

// ✅ SLOTS: Best for structured layouts with multiple sections
const Page = ({ header, sidebar, content, footer }) => (
  <div className="page-layout">
    <header>{header}</header>
    <aside>{sidebar}</aside>
    <main>{content}</main>
    <footer>{footer}</footer>
  </div>
);
```

**Composition vs Hooks**

Since React Hooks were introduced, the trade-offs have shifted:

```javascript
// ⚠️ RENDER PROPS (pre-hooks): Verbose but works
<WindowSize>
  {({ width, height }) => (
    <MousePosition>
      {({ x, y }) => (
        <LocalStorage storageKey="theme">
          {({ value, setValue }) => (
            <App
              windowSize={{ width, height }}
              mousePos={{ x, y }}
              theme={value}
              setTheme={setValue}
            />
          )}
        </LocalStorage>
      )}
    </MousePosition>
  )}
</WindowSize>

// ✅ HOOKS (modern): Clean and readable
const App = () => {
  const windowSize = useWindowSize();
  const mousePos = useMousePosition();
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return <AppContent
    windowSize={windowSize}
    mousePos={mousePos}
    theme={theme}
    setTheme={setTheme}
  />;
};
```

**When Render Props Still Make Sense**

1. **Component-based APIs** (not logic extraction):
```javascript
// ✅ Render props still good for UI composition
<Downshift>
  {({ isOpen, getMenuProps, getInputProps }) => (
    <div>
      <input {...getInputProps()} />
      {isOpen && (
        <ul {...getMenuProps()}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )}
</Downshift>
```

2. **Dynamic rendering logic**:
```javascript
// ✅ Render props for conditional rendering strategies
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  renderEmpty={() => <EmptyState />}
  renderLoading={() => <Skeleton count={5} />}
/>
```

**Compound Components Pattern Trade-offs**

```javascript
// ✅ COMPOUND COMPONENTS: Flexible but requires understanding
<Select value={value} onChange={setValue}>
  <Select.Trigger>
    {value || 'Select an option'}
  </Select.Trigger>
  <Select.Options>
    <Select.Option value="1">Option 1</Select.Option>
    <Select.Option value="2">Option 2</Select.Option>
  </Select.Options>
</Select>

// ❌ PROP-BASED: Simple but limited
<Select
  value={value}
  onChange={setValue}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>
```

**Compound Components Pros:**
- Users can customize rendering of each piece
- Clear component hierarchy in JSX
- Easy to add custom elements between pieces
- Better for complex components (Tabs, Accordion, Select)

**Compound Components Cons:**
- More complex implementation (needs Context)
- Users must understand the component structure
- More verbose usage code
- Harder to enforce required pieces

**Performance Considerations**

```javascript
// ❌ BAD: Inline render prop creates new function every render
<DataFetcher
  url="/api/users"
  render={({ data }) => <UserList users={data} />} // new function identity
/>

// ✅ GOOD: Stable callback reference
const renderUsers = useCallback(
  ({ data }) => <UserList users={data} />,
  []
);

<DataFetcher url="/api/users" render={renderUsers} />

// ✅ BETTER: Use children instead if no data needed
<DataFetcher url="/api/users">
  {({ data }) => <UserList users={data} />}
</DataFetcher>

// ✅ BEST: Use hooks for logic, components for UI
const { data, loading } = useFetch('/api/users');
return loading ? <Spinner /> : <UserList users={data} />;
```

**Decision Matrix**

Choose **children** when:
- Simple wrapper/layout component
- No data needs to flow to children
- Maximum simplicity desired

Choose **slots** when:
- Multiple named sections needed
- Clear structure is important
- Building layout components

Choose **render props** when:
- Building component library APIs (Downshift, React Table)
- Need maximum rendering flexibility
- Can't use hooks (legacy code)

Choose **hooks** when:
- Sharing stateful logic
- Modern React codebase
- Logic extraction without UI

Choose **compound components** when:
- Building complex UI components
- Users need to customize pieces
- Creating design system components

</details>

---

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Simple Analogy: Building with LEGO Blocks**

Think of React composition like building with LEGO blocks instead of carving a sculpture from a single block of wood.

**Bad Approach (Inheritance/Rigid Components):**
Imagine you have a pre-carved wooden box. It has specific compartments already cut into it. If you need a different layout, you have to carve a whole new box. That's like creating new components for every slight variation.

**Good Approach (Composition):**
With LEGO blocks, you have small, simple pieces that snap together. Need a bigger structure? Add more blocks. Need a different shape? Rearrange the same blocks. That's composition!

**The Three Main Patterns Explained Simply**

**1. Children Pattern = Russian Nesting Dolls**

```javascript
// Think of a gift box that can hold anything
const GiftBox = ({ children }) => (
  <div className="fancy-box-with-ribbon">
    {children}  {/* Whatever you put inside shows up here */}
  </div>
);

// You can put ANYTHING inside
<GiftBox>
  <Toy />
</GiftBox>

<GiftBox>
  <Book />
  <Card />
</GiftBox>

<GiftBox>
  <AnotherGiftBox>
    <Surprise />
  </AnotherGiftBox>
</GiftBox>
```

The box doesn't care what's inside. It just provides the wrapping!

**2. Render Props = Recipe Card**

```javascript
// Like a recipe card that says "here are the ingredients, YOU decide what to cook"
const IngredientProvider = ({ render }) => {
  const ingredients = ['flour', 'eggs', 'milk'];

  return render(ingredients); // Give ingredients, you decide the recipe
};

// Make pancakes with the ingredients
<IngredientProvider
  render={(ingredients) => <Pancakes ingredients={ingredients} />}
/>

// Or make a cake with the same ingredients
<IngredientProvider
  render={(ingredients) => <Cake ingredients={ingredients} />}
/>
```

Same ingredients (data), different recipes (rendering)!

**3. Slots Pattern = Customizable Car**

```javascript
// Like ordering a car with specific customizations
const Car = ({
  engine,      // Choose your engine
  seats,       // Choose your seats
  stereo,      // Choose your stereo
  paintColor   // Choose color
}) => (
  <div className={`car car--${paintColor}`}>
    <div className="engine-bay">{engine}</div>
    <div className="interior">{seats}</div>
    <div className="dashboard">{stereo}</div>
  </div>
);

// Order your custom car
<Car
  engine={<V8Engine />}
  seats={<LeatherSeats />}
  stereo={<PremiumSound />}
  paintColor="red"
/>
```

Each slot has a specific purpose, but you choose what goes in it!

**Real Example: Building a Modal (Step by Step)**

```javascript
// Step 1: Start simple - a wrapper with children
const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {children}  {/* Everything goes here for now */}
      </div>
    </div>
  );
};

// Step 2: Users need more structure - add compound components
Modal.Header = ({ children }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Step 3: Now users can compose their own modals!
<Modal isOpen={true} onClose={handleClose}>
  <Modal.Header>
    <h2>Delete Account?</h2>
  </Modal.Header>

  <Modal.Body>
    <p>This cannot be undone!</p>
    <WarningIcon />
  </Modal.Body>

  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleDelete} danger>Delete</Button>
  </Modal.Footer>
</Modal>
```

**Common Mistake: Over-Engineering**

```javascript
// ❌ BAD: Junior developers often create props for everything
const Card = ({
  title,
  titleColor,
  titleSize,
  subtitle,
  subtitleColor,
  image,
  imagePosition,
  imageSize,
  content,
  contentAlign,
  hasButton,
  buttonText,
  buttonColor,
  buttonSize,
  onButtonClick
  // ... 50 more props!
}) => {
  // Impossible to handle all combinations!
};

// ✅ GOOD: Use composition instead
<Card>
  <Card.Image src="/pic.jpg" position="top" size="large" />
  <Card.Header>
    <h2 style={{ color: 'blue', fontSize: '24px' }}>Title</h2>
    <p style={{ color: 'gray' }}>Subtitle</p>
  </Card.Header>
  <Card.Body align="center">
    Any content here!
  </Card.Body>
  <Card.Footer>
    <Button color="red" size="large" onClick={handleClick}>
      Click Me
    </Button>
  </Card.Footer>
</Card>
```

**Interview Answer Template**

> "React uses composition instead of inheritance to build UIs. The three main patterns are:
>
> 1. **Children pattern** - components accept a `children` prop for nested content. This is like a container that can hold anything.
>
> 2. **Render props** - components accept a function that returns JSX. This lets the component share data or logic while the parent controls rendering. Though hooks have largely replaced this for logic reuse, it's still useful for component APIs.
>
> 3. **Slots pattern** - components accept named props like `header`, `footer`, `sidebar` for specific content placement. This gives more structure than generic children.
>
> I prefer composition because it makes components more flexible and reusable. For example, [give Modal or Card example from above]. This approach is better than creating separate components for every variation."

**When Interviewer Asks: "Why Composition Over Inheritance?"**

> "React favors composition because components represent a containment hierarchy, not an is-a relationship. A Dialog doesn't need to 'be a' Modal through inheritance - it can simply compose smaller pieces like Overlay, CloseButton, and accept children for content.
>
> Composition is more flexible. With inheritance, you're locked into a hierarchy. With composition, you can mix and match components like LEGO blocks. It also makes components easier to test in isolation and reuse across different contexts."

**Key Takeaway**

Composition = Building blocks you combine
Inheritance = Pre-built structures you extend

React chose composition because it's more flexible, testable, and matches how UIs actually work!

---

## Question 2: How to implement compound components pattern?

### Answer

The compound components pattern is an advanced React pattern where multiple components work together to form a cohesive UI element while sharing implicit state through Context API. These components are designed to be used together as a group, with each component handling a specific part of the functionality.

**Core Concept**: The parent component manages state and provides it via Context, while child components consume that context to access shared state and behaviors. This creates an intuitive API where the structure is defined through JSX composition rather than complex prop configurations.

**Key Characteristics**:

1. **Implicit State Sharing**: Child components automatically access parent state without explicit prop drilling
2. **Flexible Composition**: Users can arrange and customize child components freely
3. **Namespace Organization**: Child components are attached to parent (e.g., `Tabs.Panel`, `Accordion.Item`)
4. **Enforced Relationships**: Components only work correctly when used together

**Implementation Pattern**:

```javascript
// Parent provides context
const Parent = ({ children, value, onChange }) => {
  const contextValue = { value, onChange };

  return (
    <ParentContext.Provider value={contextValue}>
      <div className="parent-wrapper">
        {children}
      </div>
    </ParentContext.Provider>
  );
};

// Children consume context
Parent.Child = ({ id, children }) => {
  const { value, onChange } = useContext(ParentContext);
  const isActive = value === id;

  return (
    <div
      onClick={() => onChange(id)}
      className={isActive ? 'active' : ''}
    >
      {children}
    </div>
  );
};
```

This pattern is particularly powerful for building design systems and component libraries where you want to provide flexibility without sacrificing ease of use. It's commonly seen in UI libraries like Reach UI, Radix UI, and Headless UI.

</details>

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

**Architectural Foundation of Compound Components**

The compound components pattern leverages three React features: Context API, component namespacing, and React element composition. Understanding how these work together is crucial:

**1. Context Architecture**

```javascript
// Create typed context with default value
const TabsContext = createContext({
  activeTab: null,
  setActiveTab: () => {},
  orientation: 'horizontal',
  variant: 'default'
});

// Custom hook for consuming context with error handling
const useTabsContext = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }

  return context;
};

// Root component: state manager and context provider
const Tabs = ({
  children,
  defaultTab,
  onChange,
  orientation = 'horizontal',
  variant = 'default'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  }, [onChange]);

  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab: handleTabChange,
    orientation,
    variant
  }), [activeTab, handleTabChange, orientation, variant]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={`tabs tabs--${orientation} tabs--${variant}`}
        role="tablist"
        aria-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};
```

**2. Child Component Implementation with Accessibility**

```javascript
// TabList: Container for tab buttons
Tabs.List = ({ children, className }) => {
  const { orientation } = useTabsContext();

  return (
    <div
      className={`tabs-list ${className}`}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
};

// Tab: Individual tab button
Tabs.Tab = ({ id, children, disabled = false }) => {
  const { activeTab, setActiveTab, orientation } = useTabsContext();
  const isActive = activeTab === id;
  const tabRef = useRef(null);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const tabs = Array.from(
      tabRef.current.parentElement.querySelectorAll('[role="tab"]')
    );
    const currentIndex = tabs.indexOf(tabRef.current);

    let nextIndex;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') nextIndex = currentIndex + 1;
      if (e.key === 'ArrowLeft') nextIndex = currentIndex - 1;
    } else {
      if (e.key === 'ArrowDown') nextIndex = currentIndex + 1;
      if (e.key === 'ArrowUp') nextIndex = currentIndex - 1;
    }

    if (nextIndex !== undefined) {
      nextIndex = (nextIndex + tabs.length) % tabs.length;
      tabs[nextIndex].click();
      tabs[nextIndex].focus();
      e.preventDefault();
    }
  };

  return (
    <button
      ref={tabRef}
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`tab ${isActive ? 'tab--active' : ''}`}
      onClick={() => !disabled && setActiveTab(id)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
};

// Panel: Content container for each tab
Tabs.Panel = ({ id, children }) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="tabs-panel"
    >
      {children}
    </div>
  );
};
```

**3. Advanced Pattern: Accordion with Multiple Open Panels**

```javascript
const AccordionContext = createContext();

const Accordion = ({
  children,
  allowMultiple = false,
  defaultOpen = []
}) => {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggleItem = useCallback((id) => {
    setOpenItems(prev => {
      const next = new Set(prev);

      if (allowMultiple) {
        // Allow multiple panels open
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        // Only one panel open at a time
        if (next.has(id)) {
          next.clear();
        } else {
          next.clear();
          next.add(id);
        }
      }

      return next;
    });
  }, [allowMultiple]);

  const contextValue = useMemo(() => ({
    openItems,
    toggleItem,
    allowMultiple
  }), [openItems, toggleItem, allowMultiple]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be within <Accordion>');
  }
  return context;
};

Accordion.Item = ({ id, children }) => {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.has(id);

  return (
    <div className={`accordion-item ${isOpen ? 'accordion-item--open' : ''}`}>
      {children}
    </div>
  );
};

Accordion.Trigger = ({ id, children }) => {
  const { openItems, toggleItem } = useAccordionContext();
  const isOpen = openItems.has(id);

  return (
    <button
      className="accordion-trigger"
      onClick={() => toggleItem(id)}
      aria-expanded={isOpen}
      aria-controls={`panel-${id}`}
    >
      {children}
      <ChevronIcon
        className={`chevron ${isOpen ? 'chevron--rotate' : ''}`}
      />
    </button>
  );
};

Accordion.Panel = ({ id, children }) => {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.has(id);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      id={`panel-${id}`}
      className="accordion-panel"
      style={{ height: `${height}px` }}
      aria-hidden={!isOpen}
    >
      <div ref={contentRef} className="accordion-panel-content">
        {children}
      </div>
    </div>
  );
};

// Usage with full accessibility
<Accordion allowMultiple defaultOpen={['item1']}>
  <Accordion.Item id="item1">
    <Accordion.Trigger id="item1">
      What is React?
    </Accordion.Trigger>
    <Accordion.Panel id="item1">
      React is a JavaScript library for building user interfaces.
    </Accordion.Panel>
  </Accordion.Item>

  <Accordion.Item id="item2">
    <Accordion.Trigger id="item2">
      What are hooks?
    </Accordion.Trigger>
    <Accordion.Panel id="item2">
      Hooks let you use state and React features in function components.
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

**4. Advanced: Select/Dropdown with Downshift Pattern**

```javascript
const SelectContext = createContext();

const Select = ({
  children,
  value,
  onChange,
  placeholder = 'Select an option'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const contextValue = useMemo(() => ({
    isOpen,
    setIsOpen,
    value,
    onChange,
    placeholder,
    highlightedIndex,
    setHighlightedIndex
  }), [isOpen, value, onChange, placeholder, highlightedIndex]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="select">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

Select.Trigger = ({ children }) => {
  const { isOpen, setIsOpen, value, placeholder } = useContext(SelectContext);

  return (
    <button
      className="select-trigger"
      onClick={() => setIsOpen(!isOpen)}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      {value || placeholder}
      <ChevronIcon className={isOpen ? 'rotate' : ''} />
    </button>
  );
};

Select.Options = ({ children }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <ul role="listbox" className="select-options">
      {children}
    </ul>
  );
};

Select.Option = ({ value, children }) => {
  const {
    value: selectedValue,
    onChange,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex
  } = useContext(SelectContext);

  const isSelected = selectedValue === value;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      className={`select-option ${isSelected ? 'selected' : ''}`}
      onClick={() => {
        onChange(value);
        setIsOpen(false);
      }}
    >
      {children}
      {isSelected && <CheckIcon />}
    </li>
  );
};
```

This deep implementation shows how compound components handle complex state management, accessibility, and user interactions while maintaining a clean, composable API.

</details>

---

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem: Rebuilding a Legacy Form Library with Poor Accessibility**

A fintech company with 200+ forms across their platform faced critical issues with their custom form library:

**Metrics Before Refactor:**
- **Accessibility Score**: 42/100 (Lighthouse)
- **WCAG Violations**: 127 critical issues across forms
- **Screen Reader Success Rate**: 31% of forms usable
- **Keyboard Navigation**: 18% of forms fully keyboard-navigable
- **Development Time**: 6.4 hours per complex form
- **Bug Reports**: 83 form-related bugs in backlog

**Root Cause: Monolithic Form Components**

```javascript
// ❌ BAD: Legacy monolithic form component
const Form = ({
  fields,  // array of 20+ config objects
  validation,
  onSubmit,
  layout,
  sections,
  // ... 30+ more props
}) => {
  // 800+ lines of complex logic
  // Impossible to customize
  // Zero accessibility
  // No keyboard support
};

// Usage was a nightmare
<Form
  fields={[
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      validation: { required: true, email: true },
      placeholder: 'Enter email',
      helpText: 'We will never share your email',
      customRenderer: CustomEmailInput,
      conditionalRender: (values) => values.subscribeToNewsletter,
      // ... 15 more options per field
    },
    // ... 50 more field configs
  ]}
  sections={[/* complex section config */]}
  layout="grid"
  // Developers spent hours configuring this
/>
```

**Solution: Compound Components Form Library**

The team rebuilt the library using compound components pattern:

```javascript
// ✅ GOOD: Compound components form architecture
const FormContext = createContext();

const Form = ({
  onSubmit,
  initialValues = {},
  validation,
  children
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Validate on change
    if (validation?.[name]) {
      const error = validation[name](value, values);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validation, values]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const allErrors = {};
    Object.keys(validation || {}).forEach(name => {
      const error = validation[name](values[name], values);
      if (error) allErrors[name] = error;
    });

    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      await onSubmit(values);
    }
  };

  const contextValue = useMemo(() => ({
    values,
    errors,
    touched,
    setValue,
    setFieldTouched
  }), [values, errors, touched, setValue, setFieldTouched]);

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
};

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form components must be within <Form>');
  }
  return context;
};

// Field component with full accessibility
Form.Field = ({
  name,
  label,
  required = false,
  helpText,
  children
}) => {
  const { errors, touched } = useFormContext();
  const error = touched[name] && errors[name];
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>

      <div className="form-input-wrapper">
        {React.cloneElement(children, {
          id,
          name,
          'aria-invalid': !!error,
          'aria-describedby': [
            error ? errorId : null,
            helpText ? helpId : null
          ].filter(Boolean).join(' ') || undefined
        })}
      </div>

      {helpText && (
        <div id={helpId} className="form-help">
          {helpText}
        </div>
      )}

      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Input component
Form.Input = ({
  name,
  type = 'text',
  placeholder,
  ...props
}) => {
  const { values, setValue, setFieldTouched } = useFormContext();

  return (
    <input
      type={type}
      name={name}
      value={values[name] || ''}
      onChange={(e) => setValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name)}
      placeholder={placeholder}
      className="form-input"
      {...props}
    />
  );
};

// Select component
Form.Select = ({ name, options, ...props }) => {
  const { values, setValue, setFieldTouched } = useFormContext();

  return (
    <select
      name={name}
      value={values[name] || ''}
      onChange={(e) => setValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name)}
      className="form-select"
      {...props}
    >
      <option value="">Select an option</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

// Checkbox component
Form.Checkbox = ({ name, children, ...props }) => {
  const { values, setValue } = useFormContext();

  return (
    <label className="form-checkbox">
      <input
        type="checkbox"
        name={name}
        checked={values[name] || false}
        onChange={(e) => setValue(name, e.target.checked)}
        {...props}
      />
      <span>{children}</span>
    </label>
  );
};

// Section for grouping
Form.Section = ({ title, children }) => (
  <fieldset className="form-section">
    {title && <legend className="form-section-title">{title}</legend>}
    {children}
  </fieldset>
);

// Submit button
Form.Submit = ({ children, loading = false }) => (
  <button
    type="submit"
    className="form-submit"
    disabled={loading}
  >
    {loading ? 'Submitting...' : children}
  </button>
);
```

**Real Usage Example**

```javascript
// ✅ EXCELLENT: Clean, accessible, customizable
const RegistrationForm = () => {
  const handleSubmit = async (values) => {
    await api.register(values);
  };

  const validation = {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be 8+ characters';
    },
    confirmPassword: (value, values) => {
      if (value !== values.password) return 'Passwords must match';
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validation={validation}
      initialValues={{ newsletter: true }}
    >
      <Form.Section title="Account Information">
        <Form.Field
          name="email"
          label="Email Address"
          required
          helpText="We'll never share your email"
        >
          <Form.Input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Form.Field>

        <Form.Field name="password" label="Password" required>
          <Form.Input
            name="password"
            type="password"
            placeholder="Enter password"
            autoComplete="new-password"
          />
        </Form.Field>

        <Form.Field name="confirmPassword" label="Confirm Password" required>
          <Form.Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </Form.Field>
      </Form.Section>

      <Form.Section title="Preferences">
        <Form.Field name="country" label="Country" required>
          <Form.Select
            name="country"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'in', label: 'India' },
              { value: 'uk', label: 'United Kingdom' }
            ]}
          />
        </Form.Field>

        <Form.Checkbox name="newsletter">
          Subscribe to our newsletter
        </Form.Checkbox>

        <Form.Checkbox name="terms">
          I agree to the Terms and Conditions *
        </Form.Checkbox>
      </Form.Section>

      <Form.Submit>Create Account</Form.Submit>
    </Form>
  );
};
```

**Results After Compound Components Refactor**

After 4 months of migration to the new form library:

- **Accessibility Score**: 42/100 → 96/100 (+129% improvement)
- **WCAG Violations**: 127 → 4 (-97% reduction)
- **Screen Reader Success**: 31% → 94% (+203% improvement)
- **Keyboard Navigation**: 18% → 100% (+456% improvement)
- **Development Time**: 6.4 hours → 1.8 hours (-72%)
- **Bug Reports**: 83 → 12 (-86% reduction)
- **Form Completion Rate**: 64% → 81% (+26.5%)
- **Code Reuse**: 23% → 87% (+278%)

**Additional Benefits:**

1. **Custom inputs work seamlessly**:
```javascript
<Form.Field name="avatar" label="Profile Picture">
  <CustomImageUpload name="avatar" />
</Form.Field>
```

2. **Conditional fields are trivial**:
```javascript
{values.subscribeToNewsletter && (
  <Form.Field name="emailFrequency" label="Email Frequency">
    <Form.Select name="emailFrequency" options={frequencies} />
  </Form.Field>
)}
```

3. **Third-party components integrate easily**:
```javascript
<Form.Field name="birthday" label="Birthday">
  <DatePicker name="birthday" />
</Form.Field>
```

**Key Lessons**

1. **Accessibility comes free**: Compound components enforce proper ARIA attributes
2. **Flexibility without complexity**: Users compose what they need
3. **Context prevents prop drilling**: No passing values through 5 layers
4. **Easier to test**: Each component can be tested in isolation
5. **Better DX**: Developers prefer JSX composition over config objects

</details>

---

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Compound Components vs Alternative Patterns**

| Pattern | API Complexity | Flexibility | Learning Curve | Best For |
|---------|---------------|-------------|----------------|----------|
| **Compound Components** | Medium | High | Medium | Design systems, complex UI |
| **Prop-based Config** | Low | Low | Low | Simple components, rapid prototyping |
| **Render Props** | High | High | High | Maximum customization |
| **Hooks + Components** | Medium | Medium | Low | Logic + UI separation |

**When to Use Compound Components**

✅ **Good fit when:**
- Building reusable design system components
- Component has multiple related pieces (Tabs, Accordion, Select)
- Users need to customize individual parts
- Accessibility is critical (enforced through structure)
- Complex state needs to be shared between parts

❌ **Not ideal when:**
- Component is very simple (just use props)
- Users won't need to customize pieces
- Team unfamiliar with advanced React patterns
- Performance is critical (Context can cause re-renders)

**Example Comparison**

```javascript
// ❌ TOO COMPLEX for simple button
const Button = ({ children }) => <button>{children}</button>;
Button.Icon = ({ icon }) => <span className="icon">{icon}</span>;
Button.Text = ({ children }) => <span>{children}</span>;

// Overkill usage
<Button>
  <Button.Icon icon="search" />
  <Button.Text>Search</Button.Text>
</Button>

// ✅ BETTER: Simple props
<Button icon="search">Search</Button>

// ✅ PERFECT for complex select
<Select value={value} onChange={setValue}>
  <Select.Trigger />
  <Select.Options>
    <Select.Option value="1">Option 1</Select.Option>
    <Select.Option value="2">Option 2</Select.Option>
  </Select.Options>
</Select>
```

**Performance Trade-offs**

```javascript
// ⚠️ POTENTIAL ISSUE: Context causes all children to re-render
const TabsContext = createContext();

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  // ❌ BAD: New object every render
  const value = { activeTab, setActiveTab };

  return (
    <TabsContext.Provider value={value}>
      {children} {/* All children re-render when activeTab changes */}
    </TabsContext.Provider>
  );
};

// ✅ GOOD: Memoize context value
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const value = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab]
  );

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

// ✅ BETTER: Split contexts to reduce re-renders
const TabsStateContext = createContext();  // Changes often
const TabsAPIContext = createContext();    // Stable

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const api = useMemo(() => ({ setActiveTab }), []);

  return (
    <TabsAPIContext.Provider value={api}>
      <TabsStateContext.Provider value={activeTab}>
        {children}
      </TabsStateContext.Provider>
    </TabsAPIContext.Provider>
  );
};

// Only components that need activeTab will re-render
const useActiveTab = () => useContext(TabsStateContext);
const useTabsAPI = () => useContext(TabsAPIContext);
```

**API Design Trade-offs**

```javascript
// OPTION 1: Strict structure (less flexible)
<Tabs>
  <Tabs.List>
    <Tabs.Tab>Tab 1</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel>Content 1</Tabs.Panel>
  </Tabs.Panels>
</Tabs>

// OPTION 2: Flexible structure (more freedom)
<Tabs>
  <Tabs.Tab id="1">Tab 1</Tabs.Tab>
  <Tabs.Tab id="2">Tab 2</Tabs.Tab>

  <SomeCustomWrapper>
    <Tabs.Panel id="1">Content 1</Tabs.Panel>
    <Tabs.Panel id="2">Content 2</Tabs.Panel>
  </SomeCustomWrapper>
</Tabs>

// OPTION 3: Hybrid (best of both)
<Tabs defaultTab="1">
  <Tabs.List>
    <Tabs.Tab id="1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="2">Tab 2</Tabs.Tab>
    {/* Custom elements allowed here */}
    <CustomBadge />
  </Tabs.List>

  {/* Panels can be anywhere */}
  <div className="custom-layout">
    <Tabs.Panel id="1">Content 1</Tabs.Panel>
    <Tabs.Panel id="2">Content 2</Tabs.Panel>
  </div>
</Tabs>
```

**Validation and Error Handling Trade-offs**

```javascript
// OPTION 1: Runtime validation (flexible but slower)
const Tabs = ({ children }) => {
  useEffect(() => {
    const tabs = React.Children.toArray(children).filter(
      child => child.type === Tabs.Tab
    );

    if (tabs.length === 0) {
      console.error('Tabs must contain at least one Tabs.Tab');
    }
  }, [children]);

  // ...
};

// OPTION 2: TypeScript (fast but compile-time only)
type TabsProps = {
  children: React.ReactElement<typeof Tabs.Tab>[];
};

// OPTION 3: Custom error hook (best of both)
const useTabsValidation = () => {
  if (process.env.NODE_ENV !== 'production') {
    // Only run validation in development
    const context = useTabsContext();

    if (!context.hasValidStructure) {
      throw new Error(
        'Invalid Tabs structure. Must contain Tabs.List and Tabs.Panel'
      );
    }
  }
};
```

**Bundle Size Implications**

```javascript
// Large compound component (12KB)
import { Tabs } from 'design-system';

// Only imports what you use (3KB) - if tree-shakable
import { Tabs, TabsList, Tab, TabPanel } from 'design-system';

// ✅ GOOD: Export individual components for tree-shaking
export { Tabs } from './Tabs';
export { TabsList } from './TabsList';
export { Tab } from './Tab';
export { TabPanel } from './TabPanel';

// Allow both import styles
export default Tabs;
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

**Decision Matrix**

Choose **Compound Components** when:
- Building design system (Tabs, Accordion, Select, Modal)
- Need accessibility out of the box
- Users need customization flexibility
- Related components share state

Choose **Simple Props** when:
- Component is simple (Button, Badge, Avatar)
- One clear way to use it
- Minimal customization needed
- Performance is critical

Choose **Render Props** when:
- Need maximum rendering control
- Building headless UI libraries
- Logic is complex, UI is varied

Choose **Hooks + Components** when:
- Separating logic from UI
- Logic can be used without specific UI
- Building modern React codebase

</details>

---

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**Simple Analogy: Toy Building Set**

Think of compound components like a toy building set (like LEGO), where pieces only work when used together correctly.

**Without Compound Components (One Big Piece):**

Imagine a pre-built toy castle. It comes as one piece. You can't rearrange the towers, move the drawbridge, or swap the flags. If you want a different castle, you need to buy a whole new one.

```javascript
// ❌ Like a pre-built toy - one configuration only
<Castle
  towers={4}
  drawbridge={true}
  flags={['red', 'blue']}
  moat={true}
/>

// Want 3 towers instead of 4? Tough luck!
// Want the drawbridge on the left side? Can't do it!
```

**With Compound Components (Build It Yourself):**

Now imagine a LEGO castle set. You get towers, walls, flags, and a drawbridge as separate pieces. You can arrange them however you want! Put the drawbridge on any side, add as many towers as you like, mix and match flags.

```javascript
// ✅ Like LEGO - arrange pieces however you want!
<Castle>
  <Castle.Tower position="front-left" />
  <Castle.Tower position="front-right" />
  <Castle.Tower position="back" />

  <Castle.Drawbridge side="left" />

  <Castle.Flag color="red" />
  <Castle.Flag color="blue" />
  <Castle.Flag color="gold" />

  <Castle.Moat />
</Castle>
```

The `<Castle>` wrapper keeps all pieces working together (sharing rules like "drawbridge can only be on one side"), but you get to decide the arrangement!

**Real Code Example: Building Tabs**

Let's build a simple tabs component step-by-step:

**Step 1: The Problem - Rigid Tabs**

```javascript
// ❌ BAD: Pre-built tabs - you can only pass data
<Tabs
  tabs={[
    { id: 1, title: 'Profile', content: <ProfilePage /> },
    { id: 2, title: 'Settings', content: <SettingsPage /> }
  ]}
/>

// What if you want an icon in the tab?
// What if you want a badge showing count?
// What if you want custom styling?
// You're stuck! Have to add more props or fork the component.
```

**Step 2: The Solution - Compound Components**

```javascript
// ✅ GOOD: Compound components - compose what you need
<Tabs>
  <Tabs.Tab id="profile">
    <UserIcon />
    Profile
    <Badge count={5} />
  </Tabs.Tab>

  <Tabs.Tab id="settings">
    <SettingsIcon />
    Settings
  </Tabs.Tab>

  <Tabs.Panel id="profile">
    <ProfilePage />
  </Tabs.Panel>

  <Tabs.Panel id="settings">
    <SettingsPage />
  </Tabs.Panel>
</Tabs>
```

**Step 3: How It Works (The Magic)**

The secret is **Context** - like a walkie-talkie system where all pieces can talk to each other:

```javascript
// The parent (Tabs) has a walkie-talkie
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(null);

  // This is like a walkie-talkie channel
  // All children can listen and talk on this channel
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Each child (Tab) has a walkie-talkie tuned to the same channel
Tabs.Tab = ({ id, children }) => {
  // Listen to the walkie-talkie
  const { activeTab, setActiveTab } = useContext(TabsContext);

  // Am I the active tab?
  const isActive = activeTab === id;

  return (
    <button
      className={isActive ? 'active' : ''}
      onClick={() => setActiveTab(id)}  // Tell parent I'm clicked
    >
      {children}
    </button>
  );
};

// Panel also listens
Tabs.Panel = ({ id, children }) => {
  const { activeTab } = useContext(TabsContext);

  // Only show if I'm the active panel
  if (activeTab !== id) return null;

  return <div>{children}</div>;
};
```

**Another Example: Form Fields**

```javascript
// ✅ GOOD: Form with compound components
const LoginForm = () => {
  return (
    <Form onSubmit={handleLogin}>
      {/* Each field knows about the form through Context */}

      <Form.Field name="email" label="Email">
        <Form.Input type="email" name="email" />
      </Form.Field>

      {/* Form automatically shows errors */}
      {/* Field knows if it's been touched */}
      {/* Input knows its current value */}
      {/* All through Context! */}

      <Form.Field name="password" label="Password">
        <Form.Input type="password" name="password" />
      </Form.Field>

      <Form.Checkbox name="remember">
        Remember me
      </Form.Checkbox>

      <Form.Submit>Login</Form.Submit>
    </Form>
  );
};
```

The `<Form>` parent keeps track of:
- All field values
- Which fields have errors
- Which fields were touched

Each `<Form.Field>` child:
- Listens to the Form
- Shows its value
- Shows its error
- Updates the Form when changed

**Common Beginner Mistakes**

```javascript
// ❌ MISTAKE 1: Using components outside their parent
<Tabs.Tab id="profile">Profile</Tabs.Tab>
// Error! Tab needs to be inside <Tabs>

// ✅ CORRECT
<Tabs>
  <Tabs.Tab id="profile">Profile</Tabs.Tab>
</Tabs>


// ❌ MISTAKE 2: Not passing required props
<Tabs.Panel>Content</Tabs.Panel>  // Missing 'id'!

// ✅ CORRECT
<Tabs.Panel id="profile">Content</Tabs.Panel>


// ❌ MISTAKE 3: Creating new context in wrong place
const MyTabs = () => {
  // Don't create context here! It's already in <Tabs>
  const { activeTab } = useContext(TabsContext);

  return <div>{activeTab}</div>;
};
```

**Interview Answer Template**

> "Compound components are a pattern where multiple components work together as a set, sharing state through Context API. For example, a Tabs component might have Tabs.Tab and Tabs.Panel as children that all communicate through shared context.
>
> The parent component manages state and provides it via Context. Child components consume that context to access shared data without prop drilling.
>
> [Give example]: In a Tabs component, the parent tracks which tab is active. Each Tab child can update the active tab, and each Panel child can check if it should render. They communicate through Context.
>
> The benefits are:
> 1. **Flexible composition** - users arrange components how they want
> 2. **Clean API** - no prop drilling through multiple levels
> 3. **Enforced relationships** - components only work together correctly
> 4. **Built-in accessibility** - structure enforces proper ARIA
>
> It's commonly used in design systems for components like Tabs, Accordion, Select, and Modal."

**When to Use (Simple Rules)**

✅ **Use compound components** when:
- You're building Tabs, Accordion, Select, Modal, Menu
- Component has 3+ related pieces
- Users will want to customize the parts

❌ **Don't use** when:
- Component is simple (just use props)
- You're a beginner (learn basics first)
- Only one way to use the component

**Key Takeaway**

Compound components = LEGO blocks that talk to each other through walkie-talkies (Context)!

The parent holds the walkie-talkie transmitter (Provider), and all children have receivers (useContext) tuned to the same channel.

</details>
