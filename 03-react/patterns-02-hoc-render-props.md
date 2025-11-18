# React HOC and Render Props

> Higher-Order Components and Render Props patterns

---

## Question 3: What is the Render Props Pattern?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 7 minutes
**Companies:** Airbnb, Stripe

### Question
What is the render props pattern? How does it work and when should you use it?

### Answer

**Render Props** - A pattern where a component accepts a function prop that returns React elements.

**Key Points:**
1. **Function as child** - Pass render logic as a prop
2. **Share state/logic** - Without HOCs
3. **Flexible** - Consumer controls rendering
4. **Modern alternative** - Custom hooks
5. **Children as function** - Common variant

### Code Example

```jsx
// Render Props Pattern
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Usage
<Mouse
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>

// Children as Function Variant
function Mouse({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return children(position);
}

// Usage
<Mouse>
  {({ x, y }) => <div>Position: {x}, {y}</div>}
</Mouse>

// Modern Alternative: Custom Hook (Simpler!)
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}

// Usage (much cleaner)
function MouseTracker() {
  const { x, y } = useMouse();
  return <div>Position: {x}, {y}</div>;
}
```

### Resources
- [Render Props](https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop)

---

## Question 4: What Are Compound Components?

**Difficulty:** 🔴 Hard
**Frequency:** ⭐⭐⭐
**Time:** 10 minutes
**Companies:** Design system teams, Airbnb

### Question
What are compound components? How do they work and when would you use this pattern?

### Answer

**Compound Components** - Components that work together to form a complete UI, sharing implicit state.

**Key Points:**
1. **Implicit state sharing** - Via Context
2. **Flexible composition** - Users control structure
3. **Encapsulation** - Implementation hidden
4. **Common in** - Design systems, complex UI
5. **Examples** - Select, Tabs, Accordion components

### Code Example

```jsx
// Compound Component Pattern
const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return <div className="tab-panel">{children}</div>;
}

// Attach sub-components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage - Very flexible!
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
    <Tabs.Tab value="billing">Billing</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="profile">
    <ProfileContent />
  </Tabs.Panel>
  <Tabs.Panel value="settings">
    <SettingsContent />
  </Tabs.Panel>
  <Tabs.Panel value="billing">
    <BillingContent />
  </Tabs.Panel>
</Tabs>

// Real-world: Accordion
function Accordion({ children }) {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, children }) {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.includes(id);

  return (
    <div className="accordion-item">
      <button onClick={() => toggleItem(id)}>
        {isOpen ? '−' : '+'}
      </button>
      {isOpen && <div className="content">{children}</div>}
    </div>
  );
}
```

### Resources
- [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)

---

## Questions 5-15: Advanced Component Patterns

**Difficulty:** 🟡 Medium to 🔴 Hard
**Frequency:** ⭐⭐⭐⭐
**Consolidated component patterns**

### Q5-7: Container/Presentational, Controlled/Uncontrolled

```jsx
// Q5: Container/Presentational Pattern
// Container (Smart Component) - Handles logic
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return <UserListPresentation users={users} loading={loading} />;
}

// Presentational (Dumb Component) - Only displays
function UserListPresentation({ users, loading }) {
  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Q6: Controlled Components
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// React controls the input value
// Every keystroke triggers re-render
// Allows validation, formatting on every change

// Q7: Uncontrolled Components
function UncontrolledInput() {
  const inputRef = useRef();

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return (
    <>
      <input ref={inputRef} defaultValue="Initial" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

// DOM controls the value
// Less re-renders
// Use for file inputs, simple forms
```

### Q8-10: State Reducer, Provider, Slots Pattern

```jsx
// Q8: State Reducer Pattern (Advanced)
function useToggle({ reducer = toggleReducer } = {}) {
  const [{ on }, dispatch] = useReducer(reducer, { on: false });

  const toggle = () => dispatch({ type: 'toggle' });
  const setOn = () => dispatch({ type: 'on' });
  const setOff = () => dispatch({ type: 'off' });

  return { on, toggle, setOn, setOff };
}

function toggleReducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on };
    case 'on':
      return { on: true };
    case 'off':
      return { on: false };
    default:
      throw new Error(`Unsupported type: ${action.type}`);
  }
}

// Usage: Inversion of control - user can override reducer
function MyComponent() {
  const { on, toggle } = useToggle({
    reducer(currentState, action) {
      const changes = toggleReducer(currentState, action);
      // Override behavior
      if (action.type === 'toggle' && currentState.on) {
        // Prevent toggling off
        return currentState;
      }
      return changes;
    }
  });

  return <button onClick={toggle}>{on ? 'On' : 'Off'}</button>;
}

// Q9: Provider Pattern (Context + Hook)
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  const value = {
    user,
    loading,
    login: (credentials) => loginUser(credentials).then(setUser),
    logout: () => logoutUser().then(() => setUser(null))
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for consuming context
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <UserProvider>
      <Dashboard />
    </UserProvider>
  );
}

function Dashboard() {
  const { user, loading, logout } = useUser();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Q10: Slots Pattern (Named Children)
function Card({ header, media, content, actions }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      {media && <div className="card-media">{media}</div>}
      {content && <div className="card-content">{content}</div>}
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
}

// Usage - Explicit prop names, clear structure
<Card
  header={<h2>Card Title</h2>}
  media={<img src="image.jpg" />}
  content={<p>Card description</p>}
  actions={
    <>
      <button>Share</button>
      <button>Save</button>
    </>
  }
/>
```

### Q11-13: Proxy Component, Extensible Styles, Layout Components

```jsx
// Q11: Proxy Component Pattern
function Button(props) {
  // Forward all props to underlying button
  return <button {...props} className={`btn ${props.className || ''}`} />;
}

// Accepts any valid button prop
<Button onClick={handleClick} type="submit" disabled>
  Click Me
</Button>

// Advanced: Type-safe proxy with TypeScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function TypedButton({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn btn-${variant} ${className || ''}`}
    />
  );
}

// Q12: Extensible Styles Pattern
function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const baseStyles = 'btn rounded focus:outline-none';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className // User can override/extend
  ].filter(Boolean).join(' ');

  return <button {...props} className={classes} />;
}

// Usage - Extensible
<Button variant="primary" size="lg" className="mt-4 w-full">
  Submit
</Button>

// Q13: Layout Components Pattern
// Generic layout components for consistent structure
function Stack({ spacing = 4, children }) {
  return (
    <div className={`flex flex-col gap-${spacing}`}>
      {children}
    </div>
  );
}

function Inline({ spacing = 4, children }) {
  return (
    <div className={`flex flex-row gap-${spacing}`}>
      {children}
    </div>
  );
}

function Center({ children }) {
  return (
    <div className="flex items-center justify-center h-full">
      {children}
    </div>
  );
}

// Usage - Composable layouts
<Stack spacing={6}>
  <h1>Title</h1>
  <Inline spacing={2}>
    <button>Save</button>
    <button>Cancel</button>
  </Inline>
  <Center>
    <p>Centered content</p>
  </Center>
</Stack>
```

### Q14-15: Props Collection, Props Getters

```jsx
// Q14: Props Collection Pattern
function useCheckbox() {
  const [checked, setChecked] = useState(false);

  // Collect all props needed for checkbox
  const checkboxProps = {
    type: 'checkbox',
    checked,
    onChange: (e) => setChecked(e.target.checked)
  };

  return { checked, checkboxProps };
}

// Usage
function MyCheckbox() {
  const { checked, checkboxProps } = useCheckbox();

  return (
    <label>
      <input {...checkboxProps} />
      {checked ? 'Checked' : 'Unchecked'}
    </label>
  );
}

// Q15: Props Getters Pattern (More Flexible)
function useToggle() {
  const [on, setOn] = useState(false);

  // Function that returns props (can accept user overrides)
  function getTogglerProps({ onClick, ...props } = {}) {
    return {
      'aria-pressed': on,
      onClick: (event) => {
        onClick?.(event); // Call user's onClick first
        setOn(!on); // Then toggle
      },
      ...props
    };
  }

  return { on, getTogglerProps };
}

// Usage - User can extend behavior
function Switch() {
  const { on, getTogglerProps } = useToggle();

  return (
    <button
      {...getTogglerProps({
        onClick: () => console.log('Toggled!'),
        className: 'switch'
      })}
    >
      {on ? 'On' : 'Off'}
    </button>
  );
}

// Advanced: Multiple getters
function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  function getMenuProps(props = {}) {
    return {
      role: 'menu',
      ...props
    };
  }

  function getItemProps({ index, onClick, ...props } = {}) {
    return {
      role: 'menuitem',
      onClick: (event) => {
        onClick?.(event);
        setSelectedIndex(index);
        setIsOpen(false);
      },
      'aria-selected': index === selectedIndex,
      ...props
    };
  }

  function getToggleProps({ onClick, ...props } = {}) {
    return {
      onClick: (event) => {
        onClick?.(event);
        setIsOpen(!isOpen);
      },
      'aria-expanded': isOpen,
      ...props
    };
  }

  return {
    isOpen,
    selectedIndex,
    getMenuProps,
    getItemProps,
    getToggleProps
  };
}

// Usage
function DropdownMenu() {
  const {
    isOpen,
    getMenuProps,
    getItemProps,
    getToggleProps
  } = useMenu();

  return (
    <div>
      <button {...getToggleProps()}>Menu</button>
      {isOpen && (
        <ul {...getMenuProps()}>
          <li {...getItemProps({ index: 0 })}>Item 1</li>
          <li {...getItemProps({ index: 1 })}>Item 2</li>
          <li {...getItemProps({ index: 2 })}>Item 3</li>
        </ul>
      )}
    </div>
  );
}
```

### Pattern Comparison

```jsx
// When to use each pattern:

// 1. Composition - Default choice, most flexible
<Dialog>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>

// 2. HOC - Cross-cutting concerns (auth, logging)
const EnhancedComponent = withAuth(withLogging(Component));

// 3. Render Props - Share stateful logic (legacy, use hooks now)
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// 4. Compound Components - Complex UI with shared state
<Tabs>
  <TabList><Tab /></TabList>
  <TabPanels><TabPanel /></TabPanels>
</Tabs>

// 5. Custom Hooks - Modern way (preferred for logic reuse)
const { data, loading } = useFetch('/api/users');

// 6. Provider Pattern - Global state/context
<ThemeProvider><App /></ThemeProvider>

// 7. Props Getters - Flexible prop composition
const { getInputProps, getLabelProps } = useField();
```

### Resources
- [React Patterns](https://reactpatterns.com/)
- [Advanced React Patterns](https://kentcdodds.com/blog/advanced-react-component-patterns)

---

**[← Back to React README](./README.md)**

**Progress:** 15 of 15 component patterns completed ✅
