# React HOC and Render Props - Part A

> Higher-Order Components and Render Props patterns

---

## Question 1: What is the Render Props Pattern?

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

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

The Render Props pattern emerged in the React ecosystem around 2017 as a solution to sharing stateful logic between components before hooks existed. At its core, it leverages JavaScript's first-class functions and React's component composition model to create highly flexible, reusable components.

**How Render Props Works Internally:**

When you pass a function as a prop (whether named `render` or `children`), React treats it like any other prop. The key difference is that instead of passing data down, you're passing rendering responsibility up. The component with the render prop manages state and behavior, then delegates rendering to the consumer by calling the function prop with the current state as arguments.

```jsx
// Under the hood
function DataProvider({ render }) {
  const [data, setData] = useState(null);

  // Component manages state/effects
  useEffect(() => {
    fetchData().then(setData);
  }, []);

  // But delegates rendering to consumer
  return render({ data, setData }); // Calls the function prop
}

// React processes this as:
// 1. DataProvider renders
// 2. Calls render({ data, setData })
// 3. That function returns React elements
// 4. Those elements get rendered
```

**Children as Function vs Named Render Prop:**

Both approaches are identical in functionality, but have different ergonomics:

```jsx
// Named prop (explicit)
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// Children as function (implicit)
<Mouse>
  {({ x, y }) => <div>{x}, {y}</div>}
</Mouse>
```

The children variant feels more natural to many developers because it follows React's standard composition model. However, the named prop approach is more explicit about what's happening and allows using children for other purposes.

**Performance Considerations:**

Render props can cause unnecessary re-renders if you're not careful. Every time the parent component renders, it may create a new function reference:

```jsx
// ❌ Creates new function on every render
function App() {
  return (
    <Mouse render={({ x, y }) => <div>{x}, {y}</div>} />
  );
}

// ✅ Stable reference with useCallback
function App() {
  const renderMouse = useCallback(
    ({ x, y }) => <div>{x}, {y}</div>,
    []
  );
  return <Mouse render={renderMouse} />;
}
```

**Why Hooks Replaced Render Props:**

Custom hooks solve the same problem (sharing stateful logic) with simpler syntax and better composition. Compare:

```jsx
// Render Props (verbose, nested)
<Mouse>
  {({ x, y }) => (
    <WindowSize>
      {({ width, height }) => (
        <OnlineStatus>
          {({ online }) => (
            <div>Mouse: {x},{y} | Window: {width}x{height} | {online ? 'Online' : 'Offline'}</div>
          )}
        </OnlineStatus>
      )}
    </WindowSize>
  )}
</Mouse>

// Hooks (flat, composable)
function MyComponent() {
  const { x, y } = useMouse();
  const { width, height } = useWindowSize();
  const { online } = useOnlineStatus();

  return <div>Mouse: {x},{y} | Window: {width}x{height} | {online ? 'Online' : 'Offline'}</div>;
}
```

Hooks eliminate "wrapper hell" and make logic composition linear instead of nested. They also integrate better with React DevTools and don't add extra components to the React tree.

**When Render Props Still Make Sense:**

Despite hooks being preferred, render props are still useful for:
1. **Dynamic rendering logic** - When the consumer needs full control over rendering based on state
2. **Component libraries** - Public APIs that need maximum flexibility
3. **Incremental migration** - Existing codebases using render props can continue using them
4. **Teaching** - Understanding render props helps understand component composition

The pattern demonstrates React's flexibility and the power of treating functions as first-class citizens.

</details>

<details>
<summary><strong>🐛 Real-World Scenario</strong></summary>

**Problem: Infinite Scroll List with Poor Performance**

Your team built an infinite scroll feature using render props, but users are experiencing severe lag when scrolling through large lists. The performance monitoring dashboard shows:

- **Time to Interactive (TTI)**: 4.2s (target: <2s)
- **Frame rate during scroll**: 22 FPS (target: 60 FPS)
- **Main thread blocking**: 850ms per scroll event
- **Memory usage**: Growing from 45MB to 180MB after scrolling 500 items

**Initial Implementation (Problematic):**

```jsx
// ❌ Problematic implementation
function InfiniteScroll({ render, loadMore, hasMore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Check if near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      setLoading(true);
      loadMore().then(newItems => {
        setItems(prev => [...prev, ...newItems]); // Problem 1: Huge array concatenation
        setLoading(false);
      });
    }
  };

  return (
    <div onScroll={handleScroll} style={{ height: '100vh', overflow: 'auto' }}>
      {render({ items, loading })} {/* Problem 2: Renders ALL items */}
    </div>
  );
}

// Usage
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  render={({ items, loading }) => ( // Problem 3: New function on every render
    <>
      {items.map(item => ( // Problem 4: No virtualization
        <ExpensiveCard key={item.id} item={item} />
      ))}
      {loading && <Spinner />}
    </>
  )}
/>
```

**Root Causes Identified:**

1. **Render function recreation**: New function on every parent render causes InfiniteScroll to re-render
2. **No virtualization**: Rendering 500+ DOM nodes simultaneously
3. **Memory leak**: Items array keeps growing indefinitely
4. **Expensive scroll handler**: Runs on every scroll event (throttling needed)
5. **Props comparison**: React.memo not used, causing unnecessary re-renders

**Solution Implementation:**

```jsx
// ✅ Optimized implementation
const InfiniteScrollOptimized = React.memo(
  function InfiniteScroll({ render, loadMore, hasMore }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    // Throttled scroll handler
    const handleScroll = useCallback(
      throttle(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
          setLoading(true);
          loadMore().then(newItems => {
            setItems(prev => {
              // Limit max items in memory
              const updated = [...prev, ...newItems];
              return updated.length > 1000 ? updated.slice(-1000) : updated;
            });
            setLoading(false);
          });
        }
      }, 200),
      [hasMore, loading, loadMore]
    );

    useEffect(() => {
      const container = containerRef.current;
      container?.addEventListener('scroll', handleScroll, { passive: true });
      return () => container?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Memoize render result
    const rendered = useMemo(
      () => render({ items, loading }),
      [render, items, loading]
    );

    return (
      <div ref={containerRef} style={{ height: '100vh', overflow: 'auto' }}>
        {rendered}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.hasMore === nextProps.hasMore &&
           prevProps.loadMore === nextProps.loadMore &&
           prevProps.render === nextProps.render;
  }
);

// ✅ Better: Use custom hook instead (modern approach)
function useInfiniteScroll({ loadMore, hasMore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const handleScroll = useCallback(
    throttle(() => {
      const container = containerRef.current;
      if (!container || !hasMore || loading) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        setLoading(true);
        loadMore().then(newItems => {
          setItems(prev => {
            const updated = [...prev, ...newItems];
            return updated.length > 1000 ? updated.slice(-1000) : updated;
          });
          setLoading(false);
        });
      }
    }, 200),
    [hasMore, loading, loadMore]
  );

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll, { passive: true });
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { items, loading, containerRef };
}

// Usage with hook (much cleaner)
function ProductList() {
  const { items, loading, containerRef } = useInfiniteScroll({
    loadMore: fetchNextPage,
    hasMore: hasNextPage
  });

  return (
    <div ref={containerRef} style={{ height: '100vh', overflow: 'auto' }}>
      <VirtualList items={items} renderItem={(item) => <ProductCard item={item} />} />
      {loading && <Spinner />}
    </div>
  );
}
```

**Results After Optimization:**

- **TTI**: 4.2s → 1.4s (67% improvement)
- **Frame rate**: 22 FPS → 58 FPS (163% improvement)
- **Main thread blocking**: 850ms → 45ms per scroll (95% reduction)
- **Memory usage**: Capped at 65MB (64% reduction)
- **User complaints**: Dropped from 45/week to 2/week

**Key Learnings:**

1. **Always memoize render prop functions** with useCallback
2. **Consider hooks over render props** for better composition and performance
3. **Add virtualization** for long lists (react-window, react-virtualized)
4. **Throttle scroll events** to reduce main thread work
5. **Implement memory limits** to prevent unbounded growth
6. **Use React.memo with custom comparison** for render props components

</details>

<details>
<summary><strong>⚖️ Trade-offs</strong></summary>

**Render Props vs Custom Hooks vs HOC:**

| Aspect | Render Props | Custom Hooks | HOC |
|--------|--------------|--------------|-----|
| **Syntax Complexity** | Medium (nested functions) | Low (flat composition) | Medium (wrapping components) |
| **Composition** | Nested (callback hell) | Linear (easy to compose) | Wrapped (can stack, harder to debug) |
| **Performance** | Can cause re-renders if not memoized | Efficient (no extra components) | Extra component in tree |
| **Flexibility** | High (consumer controls rendering) | Medium (no rendering control) | Low (predefined behavior) |
| **TypeScript Support** | Good (generic types) | Excellent (type inference) | Complex (higher-order types) |
| **DevTools** | Shows extra components | Clean tree | Shows wrapper components |
| **Learning Curve** | Medium | Low | High |
| **Modern Usage** | Legacy (2017-2019) | Preferred (2019+) | Legacy (2015-2019) |

**When to Use Render Props (Despite Hooks Being Preferred):**

**Use Render Props When:**

1. **Consumer needs rendering control**:
```jsx
// Render props gives full control
<DataFetcher url="/api/users">
  {({ data, loading, error }) => {
    if (error) return <CustomErrorUI error={error} />;
    if (loading) return <SkeletonLoader rows={5} />;
    return <UserTable data={data} />;
  }}
</DataFetcher>

// Hook limits rendering flexibility
function UserList() {
  const { data, loading, error } = useFetch('/api/users');
  // Component must handle all rendering
}
```

2. **Building public component libraries**:
```jsx
// Libraries like Downshift use render props for maximum flexibility
<Downshift>
  {({ getInputProps, getMenuProps, isOpen }) => (
    <div>
      <input {...getInputProps()} />
      {isOpen && <ul {...getMenuProps()}>...</ul>}
    </div>
  )}
</Downshift>
```

3. **Incremental migration from class components**:
Render props work with both class and functional components, making migration easier.

**Use Custom Hooks When:**

1. **Sharing stateful logic** (90% of cases):
```jsx
// Clean, composable, no nesting
function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data } = useFetch('/api/stats');

  return <div>...</div>;
}
```

2. **Better composition needed**:
```jsx
// Hooks compose linearly
function useFormWithValidation(initialValues) {
  const form = useForm(initialValues);
  const validation = useValidation(form.values);
  const submission = useSubmission(form.values);

  return { ...form, ...validation, ...submission };
}

// Render props would nest deeply
```

3. **TypeScript projects**:
Hooks have superior type inference and don't require complex generic types.

**Use HOC When:**

1. **Cross-cutting concerns** (logging, analytics, auth):
```jsx
const EnhancedComponent = withAuth(
  withLogging(
    withAnalytics(Component)
  )
);
```

2. **Legacy codebases**:
If your codebase extensively uses HOCs, continue the pattern for consistency.

**Performance Comparison:**

```jsx
// Render Props: Extra component + function call overhead
<Mouse render={(pos) => <Display {...pos} />} />
// React tree: Mouse → Function → Display

// Hook: No extra components
function Tracker() {
  const pos = useMouse();
  return <Display {...pos} />;
}
// React tree: Tracker → Display

// Profiler shows hooks are ~15-20% faster for simple cases
```

**Decision Matrix:**

- **Need rendering flexibility?** → Render Props
- **Simple logic sharing?** → Custom Hooks
- **Public library API?** → Render Props or Hooks (both)
- **Legacy codebase?** → Match existing pattern
- **New project?** → Custom Hooks (default choice)
- **Cross-cutting concerns?** → HOC or Hooks with composition

**Migration Path (Render Props → Hooks):**

```jsx
// Step 1: Render props
<Mouse render={({ x, y }) => <div>{x}, {y}</div>} />

// Step 2: Extract hook from render props component
function useMouse() {
  // Copy logic from Mouse component
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return position;
}

// Step 3: Use hook
function Tracker() {
  const { x, y } = useMouse();
  return <div>{x}, {y}</div>;
}

// Step 4: Keep render props for backward compatibility
function Mouse({ render, children }) {
  const position = useMouse(); // Reuse hook
  const fn = render || children;
  return fn(position);
}
```

</details>

<details>
<summary><strong>💬 Explain to Junior</strong></summary>

**The Restaurant Menu Analogy:**

Imagine you're a chef (the component with state) and you're serving customers (consumer components). You have three ways to serve them:

**1. Render Props (Chef gives ingredients, customer cooks):**
```jsx
<Chef>
  {(ingredients) => (
    // Customer decides how to cook
    <Dish cook={ingredients} style="my-way" />
  )}
</Chef>
```
The chef provides ingredients (state/data), but the customer decides exactly how to cook and present the dish. Maximum flexibility, but the customer needs to know how to cook.

**2. Custom Hooks (Chef gives pre-prepped ingredients):**
```jsx
function MyCafe() {
  const ingredients = useChef(); // Get ingredients
  return <Dish cook={ingredients} />; // Cook my way
}
```
The chef still provides ingredients, but without wrapping you in a component. Cleaner, simpler, same flexibility.

**3. HOC (Chef serves complete dish, you just eat):**
```jsx
const MyDish = withChef(SimplePlate);
```
The chef wraps your plate and serves you a complete dish. You don't control how it's cooked.

**Why Hooks Won:**

Render props had a problem called "wrapper hell":

```jsx
// Render Props (pyramid of doom)
<MouseTracker>
  {(mouse) => (
    <WindowSize>
      {(size) => (
        <OnlineStatus>
          {(online) => (
            <ThemeProvider>
              {(theme) => (
                <div>Finally my component! But I'm buried 5 levels deep...</div>
              )}
            </ThemeProvider>
          )}
        </OnlineStatus>
      )}
    </WindowSize>
  )}
</MouseTracker>

// Hooks (flat and clean)
function MyComponent() {
  const mouse = useMouse();
  const size = useWindowSize();
  const online = useOnlineStatus();
  const theme = useTheme();

  return <div>My component! Clean and readable!</div>;
}
```

**When You SHOULD Use Render Props (Yes, Still!):**

Even though hooks are preferred, render props shine when the consumer needs full control over rendering:

```jsx
// Autocomplete with render props
<Autocomplete
  options={users}
  renderInput={(props) => <CustomInput {...props} icon={<SearchIcon />} />}
  renderOption={(user) => (
    <div className="fancy-option">
      <Avatar src={user.avatar} />
      <span>{user.name}</span>
    </div>
  )}
  renderEmpty={() => <EmptyState message="No users found" />}
/>

// This level of rendering control is hard with just hooks
```

**Interview Answer Template:**

"Render props is a pattern where a component accepts a function prop that returns React elements. The component manages state and behavior, then calls that function with the state to let the consumer decide how to render.

For example, a Mouse component could track mouse position and pass it to a render prop function, letting the consumer decide whether to show coordinates, draw graphics, or trigger animations based on position.

While render props were popular before hooks, they're now mostly replaced by custom hooks because hooks avoid nesting and compose better. However, render props are still useful in component libraries where consumers need maximum control over rendering, like in Downshift or React Table.

The main downside is 'wrapper hell' when you nest multiple render props, which makes code hard to read. Hooks solve this by allowing linear composition instead of nested callbacks. In modern React, I'd use custom hooks for logic sharing and only reach for render props when consumers need explicit rendering control."

**Common Mistakes to Avoid:**

```jsx
// ❌ Mistake 1: Creating new function on every render
function App() {
  return <Mouse render={({ x, y }) => <div>{x}, {y}</div>} />;
  // This creates a new function every render!
}

// ✅ Fix: Memoize with useCallback
function App() {
  const renderMouse = useCallback(({ x, y }) => <div>{x}, {y}</div>, []);
  return <Mouse render={renderMouse} />;
}

// ❌ Mistake 2: Render props wrapper hell
<A>{a => <B>{b => <C>{c => <div>{a}{b}{c}</div>}</C>}</B>}</A>

// ✅ Fix: Use hooks instead
function MyComponent() {
  const a = useA();
  const b = useB();
  const c = useC();
  return <div>{a}{b}{c}</div>;
}

// ❌ Mistake 3: Forgetting render props don't need to be named "render"
<Mouse render={(pos) => <div>{pos.x}</div>} /> // Works
<Mouse children={(pos) => <div>{pos.x}</div>} /> // Also works!
<Mouse>{(pos) => <div>{pos.x}</div>}</Mouse> // Same thing!
```

**Quick Reference:**

- **What**: Function prop that returns React elements
- **Why**: Share stateful logic with rendering control
- **When**: Consumer needs full control over rendering (rare now)
- **Modern alternative**: Custom hooks (preferred for 90% of cases)
- **Key benefit**: Maximum flexibility
- **Key drawback**: Nesting and verbosity

---

## Question 2: What Are Compound Components?

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

</details>

---

<details>
<summary><strong>🔍 Deep Dive</strong></summary>

Compound Components is an advanced React pattern that enables multiple components to work together while sharing implicit state through Context. This pattern is heavily used in design systems and component libraries because it provides flexibility without exposing internal implementation details.

**The Core Mechanism:**

Compound components work by establishing a parent-child relationship where:
1. The parent component manages state and exposes it via Context
2. Child components consume that context to access shared state
3. Sub-components are attached to the parent component as properties (e.g., `Tabs.List`, `Tabs.Tab`)

This creates an API that feels intuitive and declarative while maintaining encapsulation.

```jsx
// Implementation breakdown
const TabsContext = createContext();

// 1. Parent manages state
function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // State is shared via context value
  const value = { activeTab, setActiveTab };

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}

// 2. Child components consume context
function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  // Child knows about parent state without prop drilling
  const isActive = activeTab === value;

  return (
    <button
      className={isActive ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// 3. Attach children to parent (namespace pattern)
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

**Why Attach Sub-Components?**

Attaching sub-components like `Tabs.Tab` instead of exporting separately provides several benefits:

1. **Namespacing**: Clear relationship between components
2. **Discoverability**: IntelliSense shows available sub-components
3. **API clarity**: Obvious that Tab belongs to Tabs
4. **Import convenience**: Single import gets entire compound component

```jsx
// Without attachment
import { Tabs, TabList, Tab, TabPanel } from './tabs';

// With attachment (cleaner)
import { Tabs } from './tabs';
// Tabs.List, Tabs.Tab, Tabs.Panel available automatically
```

**Context Provider Pattern:**

The pattern relies on React Context to share state implicitly. This avoids prop drilling while maintaining flexibility:

```jsx
// Without compound components (prop drilling)
function Tabs({ activeTab, onChange, children }) {
  return (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onChange })
      )}
    </div>
  );
}

// With compound components (context)
// No need to pass props explicitly, context handles it
<Tabs defaultValue="home">
  <Tabs.Tab value="home">Home</Tabs.Tab>
  <Tabs.Tab value="profile">Profile</Tabs.Tab>
</Tabs>
```

**Flexible Composition:**

Users can compose compound components however they want because the parent doesn't enforce structure:

```jsx
// Different layouts, same components
// Horizontal tabs
<Tabs defaultValue="1">
  <Tabs.List>
    <Tabs.Tab value="1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="1">Content 1</Tabs.Panel>
  <Tabs.Panel value="2">Content 2</Tabs.Panel>
</Tabs>

// Vertical tabs
<Tabs defaultValue="1">
  <div className="flex">
    <Tabs.List className="flex-col">
      <Tabs.Tab value="1">Tab 1</Tabs.Tab>
      <Tabs.Tab value="2">Tab 2</Tabs.Tab>
    </Tabs.List>
    <div className="flex-grow">
      <Tabs.Panel value="1">Content 1</Tabs.Panel>
      <Tabs.Panel value="2">Content 2</Tabs.Panel>
    </div>
  </div>
</Tabs>

// User controls structure, component provides behavior
```

**Advanced: Context Validation:**

Production compound components should validate that sub-components are used within their parent:

```jsx
function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tab components must be used within <Tabs>');
  }

  return context;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useTabsContext(); // Validates usage
  // ...
}

// This prevents misuse:
// ❌ Error: Tab components must be used within <Tabs>
<Tab value="home">Home</Tab>
```

**Compound Components vs Other Patterns:**

| Aspect | Compound Components | Props-Based | Render Props |
|--------|---------------------|-------------|--------------|
| Flexibility | High (user controls structure) | Low (fixed structure) | High (full render control) |
| Complexity | Medium (context + composition) | Low (simple props) | High (function props) |
| Coupling | Implicit (context) | Explicit (props) | Explicit (function) |
| Use Case | Complex UI with shared state | Simple components | Dynamic rendering |

The pattern shines when you need flexible composition with shared state, like in Tabs, Accordion, Select, Menu, and other complex UI components.

### 🐛 Real-World Scenario

**Problem: Design System Accordion Breaking with Nested State**

Your design system team built an Accordion component using compound components, but bug reports are flooding in from different teams:

- **Bug #1**: Accordion items close unexpectedly when nested accordions are used
- **Bug #2**: Performance degradation with 50+ accordion items (frame drops to 18 FPS)
- **Bug #3**: Screen readers announce incorrect expanded/collapsed state
- **Bug #4**: Accordion state resets when parent component re-renders

**Performance Metrics:**

- **Initial render time**: 620ms for 50 items (target: <100ms)
- **Interaction latency**: 240ms click-to-expand (target: <50ms)
- **Memory usage**: 145MB for accordion component (target: <30MB)
- **Accessibility score**: 68/100 (target: >90)

**Initial Implementation (Problematic):**

```jsx
// ❌ Problematic implementation
const AccordionContext = createContext();

function Accordion({ children, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id];
      } else {
        // Problem 1: Doesn't handle nested accordions
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  // Problem 2: Context value changes on every render
  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, title, children }) {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.includes(id);

  // Problem 3: Re-renders all items when any item toggles
  return (
    <div className="accordion-item">
      <button onClick={() => toggleItem(id)}>
        {isOpen ? '−' : '+'}
        {title}
      </button>
      {/* Problem 4: Renders children even when closed */}
      {isOpen && <div className="content">{children}</div>}
    </div>
  );
}

// Problem 5: No accessibility attributes
// Problem 6: No way to nest accordions properly
```

**Root Causes:**

1. **Context value recreation**: New object on every render causes all consumers to re-render
2. **No memoization**: AccordionItem re-renders when siblings toggle
3. **No nested context isolation**: Nested accordions share same context, causing state conflicts
4. **Missing accessibility**: No ARIA attributes for screen readers
5. **Eager rendering**: Children render even when closed, wasting resources

**Solution Implementation:**

```jsx
// ✅ Optimized implementation with fixes
const AccordionContext = createContext(undefined);

function Accordion({ children, allowMultiple = false, defaultOpen = [] }) {
  const [openItems, setOpenItems] = useState(defaultOpen);

  // Memoize callbacks to prevent context value changing
  const toggleItem = useCallback((id) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  }, [allowMultiple]);

  const isItemOpen = useCallback((id) => openItems.includes(id), [openItems]);

  // Stable context value with useMemo
  const value = useMemo(
    () => ({ openItems, toggleItem, isItemOpen }),
    [openItems, toggleItem, isItemOpen]
  );

  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion" role="region">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Custom hook with validation
function useAccordion() {
  const context = useContext(AccordionContext);

  if (context === undefined) {
    throw new Error('AccordionItem must be used within Accordion');
  }

  return context;
}

// Memoized item to prevent unnecessary re-renders
const AccordionItem = React.memo(function AccordionItem({ id, title, children }) {
  const { isItemOpen, toggleItem } = useAccordion();
  const isOpen = isItemOpen(id);

  // Generate unique IDs for accessibility
  const buttonId = `accordion-button-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className="accordion-item">
      <h3>
        <button
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => toggleItem(id)}
          className="accordion-trigger"
        >
          <span className="accordion-icon" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
          {title}
        </button>
      </h3>
      {/* Lazy render: Only mount children when open */}
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="accordion-content"
        >
          {children}
        </div>
      )}
    </div>
  );
});

// Attach sub-components
Accordion.Item = AccordionItem;

// Usage - supports nesting correctly now
<Accordion defaultOpen={['item1']}>
  <Accordion.Item id="item1" title="Section 1">
    <p>Content 1</p>
    {/* Nested accordion uses its own context */}
    <Accordion defaultOpen={['nested1']}>
      <Accordion.Item id="nested1" title="Nested 1">
        <p>Nested content</p>
      </Accordion.Item>
    </Accordion>
  </Accordion.Item>
  <Accordion.Item id="item2" title="Section 2">
    <p>Content 2</p>
  </Accordion.Item>
</Accordion>
```

**Additional Optimization: Virtualization for Large Lists:**

```jsx
// For 50+ items, use virtualization
import { VariableSizeList } from 'react-window';

function VirtualizedAccordion({ items }) {
  const [openItems, setOpenItems] = useState([]);

  const getItemSize = (index) => {
    const item = items[index];
    return openItems.includes(item.id) ? 200 : 50; // Collapsed vs expanded height
  };

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Accordion.Item id={items[index].id} title={items[index].title}>
            {items[index].content}
          </Accordion.Item>
        </div>
      )}
    </VariableSizeList>
  );
}
```

**Results After Optimization:**

- **Initial render**: 620ms → 85ms (86% improvement)
- **Interaction latency**: 240ms → 32ms (87% improvement)
- **Memory usage**: 145MB → 24MB (83% reduction)
- **Accessibility score**: 68 → 94 (38% improvement)
- **Nested accordion bugs**: 23 → 0 (100% fixed)
- **Frame rate during interaction**: 18 FPS → 60 FPS

**Key Learnings:**

1. **Always memoize context values** to prevent unnecessary re-renders
2. **Use React.memo for compound component children** that don't need to re-render when siblings change
3. **Validate context usage** with custom hooks that throw errors if used incorrectly
4. **Add ARIA attributes** for accessibility (aria-expanded, aria-controls, role)
5. **Lazy render content** - only mount children when open
6. **Virtualize long lists** with react-window for 50+ items
7. **Test nested usage** - each parent should have its own context instance

### ⚖️ Trade-offs

**Compound Components vs Alternative Patterns:**

| Aspect | Compound Components | Single Component with Props | Renderless Components (Hooks) |
|--------|---------------------|----------------------------|-------------------------------|
| **Flexibility** | High (user controls structure) | Low (fixed structure) | Highest (full control) |
| **API Complexity** | Medium (multiple components) | Low (one component) | High (manual wiring) |
| **Learning Curve** | Medium (context + composition) | Low (just props) | Medium-High (hooks + composition) |
| **Type Safety** | Good (TypeScript can type each sub-component) | Excellent (single interface) | Excellent (hook return types) |
| **Bundle Size** | Larger (multiple components) | Smaller (one component) | Smallest (just logic) |
| **Accessibility** | Easier (semantic structure) | Harder (must handle in one component) | Manual (developer responsibility) |
| **Composition** | Flexible (mix and match parts) | Rigid (fixed structure) | Very Flexible (use logic anywhere) |
| **Debugging** | Harder (context flow) | Easier (explicit props) | Medium (hook dependencies) |

**When to Use Compound Components:**

**1. Complex UI with Shared State (Best Use Case):**

```jsx
// ✅ Compound Components excel here
<Select defaultValue="1">
  <Select.Trigger>
    <Select.Value placeholder="Select option" />
    <Select.Icon />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Fruits</Select.Label>
      <Select.Item value="1">Apple</Select.Item>
      <Select.Item value="2">Banana</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Vegetables</Select.Label>
      <Select.Item value="3">Carrot</Select.Item>
    </Select.Group>
  </Select.Content>
</Select>

// ❌ Single component would be too rigid
<Select
  options={[
    { group: 'Fruits', items: [{ value: '1', label: 'Apple' }] },
    // Limited control over structure
  ]}
/>
```

**2. Design Systems (Library Components):**

Compound components are perfect for design systems because they provide:
- Flexibility for various layouts
- Consistent behavior across all compositions
- Clear semantic structure
- Easy to document (each sub-component has clear purpose)

```jsx
// Radix UI, Chakra UI, Headless UI all use this pattern
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog>
```

**When NOT to Use Compound Components:**

**1. Simple Components (Overkill):**

```jsx
// ❌ Over-engineered
<Button>
  <Button.Icon><Plus /></Button.Icon>
  <Button.Text>Add Item</Button.Text>
</Button>

// ✅ Props are simpler
<Button icon={<Plus />}>Add Item</Button>
```

**2. No Shared State (Unnecessary Complexity):**

```jsx
// ❌ No state sharing needed
<Layout>
  <Layout.Header>Header</Layout.Header>
  <Layout.Main>Main</Layout.Main>
  <Layout.Footer>Footer</Layout.Footer>
</Layout>

// ✅ Just use composition
<Layout
  header={<Header />}
  main={<Main />}
  footer={<Footer />}
/>
```

**3. Deep Prop Drilling Alternative (Use Context Directly):**

```jsx
// ❌ Compound components to avoid prop drilling
<UserProfile>
  <UserProfile.Avatar /> {/* Gets user from context */}
  <UserProfile.Name />
  <UserProfile.Email />
</UserProfile>

// ✅ Just use context provider + consumer hook
<UserProvider user={user}>
  <Avatar />
  <Name />
  <Email />
</UserProvider>
// Each component uses useUser() hook
```

**Performance Considerations:**

```jsx
// ❌ Context causes all consumers to re-render
const TabsContext = createContext();

function Tabs({ children }) {
  const [active, setActive] = useState(0);

  // New object every render
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

// ✅ Memoize context value
function Tabs({ children }) {
  const [active, setActive] = useState(0);

  const value = useMemo(() => ({ active, setActive }), [active]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}
```

**Compound Components vs Headless Components:**

```jsx
// Compound Components: Structure + Behavior
<Tabs defaultValue="1">
  <Tabs.List>
    <Tabs.Tab value="1">Tab 1</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="1">Content</Tabs.Panel>
</Tabs>

// Headless (Hook-based): Behavior Only
function MyTabs() {
  const { activeTab, getTabProps, getPanelProps } = useTabs();

  return (
    <div>
      <button {...getTabProps({ value: '1' })}>Tab 1</button>
      <div {...getPanelProps({ value: '1' })}>Content</div>
    </div>
  );
}

// Compound: Better DX, less control
// Headless: More control, more work
```

**Decision Matrix:**

| Requirement | Pattern Choice |
|-------------|----------------|
| Complex UI with shared state (tabs, accordion, select) | Compound Components |
| Simple component with few options | Props |
| Design system reusable component | Compound Components or Headless |
| Maximum flexibility needed | Headless (Hooks) |
| Need semantic HTML structure | Compound Components |
| Performance critical with many instances | Headless (no context overhead) |
| Rapid prototyping | Props (simplest) |
| Public library API | Compound Components (best DX) |

**Migration Path:**

```jsx
// Step 1: Props-based
<Accordion items={items} />

// Step 2: Add compound components alongside
<Accordion>
  <Accordion.Item title="Item 1">Content</Accordion.Item>
</Accordion>

// Step 3: Extract hook for advanced users
function MyAccordion() {
  const { isOpen, toggle } = useAccordion();
  // Full control
}

// Keep all three for different use cases
```

### 💬 Explain to Junior

**The LEGO Blocks Analogy:**

Imagine you're building with LEGO. You have three ways to build:

**1. Compound Components (LEGO Blocks):**
```jsx
<House>
  <House.Roof color="red" />
  <House.Walls color="blue" />
  <House.Door position="center" />
  <House.Window position="left" />
  <House.Window position="right" />
</House>
```
The House component provides the rules (structure, how pieces connect), but you decide where each piece goes. Want two windows? Add two. Want door on the left? Put it there. The pieces automatically know how to work together.

**2. Props-Based (Pre-Built LEGO Set):**
```jsx
<House
  roofColor="red"
  wallsColor="blue"
  doorPosition="center"
  windows={['left', 'right']}
/>
```
Everything is controlled by the instruction manual (props). Less flexible, but easier if you just want a standard house.

**3. Headless/Hooks (Raw LEGO Pieces):**
```jsx
function MyHouse() {
  const { roof, walls, door, window } = useHouseParts();
  // You manually assemble everything yourself
  return <div>{roof}{walls}{door}{window}</div>;
}
```
Maximum control, but you do all the work yourself.

**Why Compound Components Are Special:**

They share "invisible connections" (Context) so pieces know about each other:

```jsx
<Tabs defaultValue="home">
  {/* These Tab components "magically" know which tab is active */}
  <Tabs.Tab value="home">Home</Tabs.Tab> {/* I'm active! */}
  <Tabs.Tab value="profile">Profile</Tabs.Tab> {/* I'm not */}

  {/* These panels know too, without you telling them! */}
  <Tabs.Panel value="home">Home content</Tabs.Panel> {/* Showing */}
  <Tabs.Panel value="profile">Profile content</Tabs.Panel> {/* Hidden */}
</Tabs>

// How? The Tabs parent shares state via Context:
// active = "home" → All children know this through context
```

**Real-World Example (Accordion):**

```jsx
// You build it like this:
<Accordion>
  <Accordion.Item id="1" title="What is React?">
    <p>React is a JavaScript library...</p>
  </Accordion.Item>
  <Accordion.Item id="2" title="What are hooks?">
    <p>Hooks are functions that...</p>
  </Accordion.Item>
</Accordion>

// Behind the scenes, Accordion tracks: openItems = ["1"]
// Each AccordionItem automatically knows if it should be open:
// Item 1: openItems.includes("1") → true → show content
// Item 2: openItems.includes("2") → false → hide content

// You didn't pass isOpen prop manually. Context did it!
```

**Interview Answer Template:**

"Compound components is a pattern where multiple components work together by sharing state implicitly through Context. The parent component manages state and provides it via Context, while child components consume that context to access shared state.

For example, a Tabs component might have Tabs.List, Tabs.Tab, and Tabs.Panel as sub-components. The Tabs parent tracks which tab is active in state, shares it via context, and all sub-components access that context to know if they're active or not.

This pattern is great for complex UI components like tabs, accordions, selects, and menus because it gives users flexibility in how they compose the UI while the component handles the coordination. Users can arrange sub-components however they want, and they'll still work correctly.

The main benefits are flexibility and encapsulation. The implementation is hidden (how state is managed), but the API is flexible (users control structure). It's commonly used in design systems like Radix UI, Chakra UI, and Headless UI.

The trade-off is complexity - you need to understand Context and manage context value memoization to avoid performance issues. For simple components, using props is often simpler."

**Common Mistakes:**

```jsx
// ❌ Mistake 1: Forgetting to memoize context value
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  // This creates new object every render → all consumers re-render
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

// ✅ Fix: Memoize it
const value = useMemo(() => ({ active, setActive }), [active]);

// ❌ Mistake 2: Using compound components when props are simpler
<Button>
  <Button.Icon><Plus /></Button.Icon>
  <Button.Text>Add</Button.Text>
</Button>

// ✅ Just use props
<Button icon={<Plus />}>Add</Button>

// ❌ Mistake 3: Forgetting to validate context usage
function Tab() {
  const context = useContext(TabsContext); // Might be undefined!
  // ...
}

// ✅ Validate with custom hook
function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Must use within <Tabs>');
  return context;
}
```

**When to Use (Decision Tree):**

1. Is it a simple component? → Use **props**
2. Need flexible composition with shared state? → Use **compound components**
3. Need maximum control? → Use **headless (hooks)**
4. Building a design system component? → **Compound components** (best DX)

**Quick Reference:**

- **What**: Multiple components that share state via Context
- **Why**: Flexible composition + encapsulated implementation
- **When**: Complex UI (tabs, accordion, select, menu, dialog)
- **How**: Parent provides Context, children consume it
- **Gotcha**: Must memoize context value to avoid re-renders
- **Example libraries**: Radix UI, Reach UI, Chakra UI

---

## Question 3: Container/Presentational Pattern

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 7 minutes
**Companies:** Most companies

### Question
What is the Container/Presentational pattern? When should you use it?

### Answer

**Container/Presentational Pattern** - Separates components into smart (logic) and dumb (UI) components.

**Key Points:**
1. **Containers** - Handle state, effects, logic
2. **Presentational** - Receive props, render UI
3. **Separation of concerns** - Logic vs display
4. **Testability** - Easier to test presentational
5. **Modern alternative** - Custom hooks

### Code Example

```jsx
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
```

### 🔍 Deep Dive

The Container/Presentational pattern was popularized by Dan Abramov in 2015 as a way to separate business logic from UI rendering. While modern React with hooks has made this pattern less rigid, understanding it helps with component organization and testability.

**Container Components (Smart):**
- Manage state and side effects
- Handle data fetching and business logic
- Connect to Redux/Context/other state managers
- Pass data down as props
- Usually have no or minimal markup
- Focus on "how things work"

**Presentational Components (Dumb):**
- Receive data via props
- Focus purely on rendering UI
- No state management (except UI state like hover)
- Highly reusable across different containers
- Easy to test (pure functions of props)
- Focus on "how things look"

```jsx
// Container: Handles logic
function ProductListContainer() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(filter)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setLoading(true);
    setFilter(newFilter);
  };

  return (
    <ProductListPresentation
      products={products}
      filter={filter}
      loading={loading}
      onFilterChange={handleFilterChange}
    />
  );
}

// Presentational: Only displays
function ProductListPresentation({ products, filter, loading, onFilterChange }) {
  if (loading) return <Spinner />;

  return (
    <div>
      <FilterButtons filter={filter} onChange={onFilterChange} />
      <ProductGrid products={products} />
    </div>
  );
}
```

**Modern Alternative with Hooks:**

Custom hooks now handle logic extraction more elegantly:

```jsx
// Hook replaces container
function useProducts(filter) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(filter).then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, [filter]);

  return { products, loading };
}

// Component combines logic + UI
function ProductList() {
  const [filter, setFilter] = useState('all');
  const { products, loading } = useProducts(filter);

  if (loading) return <Spinner />;

  return (
    <div>
      <FilterButtons filter={filter} onChange={setFilter} />
      <ProductGrid products={products} />
    </div>
  );
}
```

This hook-based approach maintains separation of concerns (logic in hook, UI in component) without the rigid container/presentational split.

### 🐛 Real-World Scenario

**Problem:** E-commerce dashboard has 42 container components, each duplicating similar data-fetching logic. Adding error handling or loading states requires updating all 42 files. Team velocity dropped by 35% due to maintenance burden.

**Solution:** Migrated to custom hooks pattern. Created `useQuery` hook that all components share:

```jsx
// Before: 42 different container implementations
function OrdersContainer() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return <OrdersList orders={orders} loading={loading} error={error} />;
}

// After: One reusable hook
function Orders() {
  const { data: orders, loading, error } = useQuery(fetchOrders);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <OrdersList orders={orders} />;
}
```

**Results:** Code reduced by 68%, bugs dropped by 82%, team velocity increased by 45%.

### ⚖️ Trade-offs

| Aspect | Container/Presentational | Hooks Pattern |
|--------|--------------------------|---------------|
| **Separation of Concerns** | Strict (separate files) | Flexible (colocated or separate) |
| **Reusability** | High (presentational easily reused) | High (hooks reused, components too) |
| **Boilerplate** | Higher (2 components per feature) | Lower (1 component + hooks) |
| **Testing** | Easier (presentational is pure) | Easy (test hooks + components separately) |
| **Learning Curve** | Medium | Low |
| **Modern Usage** | Legacy (pre-hooks) | Preferred (2019+) |

**When to still use Container/Presentational:**
- Large legacy codebases already using this pattern
- Teams prefer strict file organization
- Presentational components highly reused across multiple containers

**When to use Hooks instead:**
- New projects (default choice)
- Need flexible composition
- Want less boilerplate

### 💬 Explain to Junior

Think of a restaurant: **Container = Kitchen (logic)**, **Presentational = Waiter (display)**.

Kitchen (Container) handles all the cooking logic - what ingredients, how to prepare, timing. Waiter (Presentational) just takes the finished dish and presents it beautifully to customers. The waiter doesn't need to know how to cook, just how to serve.

**Interview Answer:** "Container/Presentational pattern separates components into smart (containers) that handle logic and state, and dumb (presentational) that only render UI. Containers fetch data and pass it to presentational components via props. This makes presentational components highly reusable and easy to test. However, modern React favors custom hooks for logic extraction, which provides similar benefits with less boilerplate."

---

## Question 4: Controlled Components

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 5 minutes
**Companies:** All companies

### Question
What are controlled components in React? How do they work?

### Answer

**Controlled Components** - Form inputs whose value is controlled by React state.

**Key Points:**
1. **Single source of truth** - State controls value
2. **React controls** - Value via props
3. **onChange handler** - Updates state
4. **Immediate validation** - On every keystroke
5. **Predictable** - Easier to debug

### Code Example

```jsx
// Controlled Component
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
```

### 🔍 Deep Dive

Controlled components are the React way of handling form inputs where React state is the single source of truth. Every character typed updates React state, which then flows back to the input value creating a one-way data flow loop.

**How It Works:**
1. User types in input
2. onChange event fires
3. Event handler updates React state
4. Component re-renders
5. New state value flows to input's value prop
6. Input displays new value

This creates a controlled feedback loop where React always knows the current form state.

```jsx
// Full controlled form example
function UserForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    age: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Immediate validation
    let error = '';
    if (name === 'email' && !value.includes('@')) {
      error = 'Invalid email';
    }
    if (name === 'age' && value < 18) {
      error = 'Must be 18+';
    }

    // Update state
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  return (
    <form>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />

      <input
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
      />
      {errors.age && <span>{errors.age}</span>}
    </form>
  );
}
```

**Benefits:**
- Single source of truth (React state)
- Instant validation on every keystroke
- Easy to format/transform input values
- Can disable submit until valid
- Easier to implement complex forms

**Drawbacks:**
- Re-renders on every keystroke
- More code (state + onChange handler)
- Performance impact with many inputs

### 🐛 Real-World Scenario

**Problem:** Complex multi-step checkout form with 45 inputs experiencing severe lag. Users typing fast see delays of 380ms between keystroke and character appearing. Profiler shows 15 re-renders per keystroke.

**Root Cause:** Each input change triggered validation on all 45 fields, plus re-rendering parent component.

**Solution:**
```jsx
// Before: All fields in one state object
const [formData, setFormData] = useState({ /* 45 fields */ });

const handleChange = (e) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  validateAllFields(); // ❌ Validates all 45 fields on every keystroke!
};

// After: Split state + debounced validation
const [formData, setFormData] = useState({ /* 45 fields */ });
const debouncedValidate = useMemo(() => debounce(validateAllFields, 300), []);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  debouncedValidate(); // Only validates after 300ms pause
};
```

**Results:** Input latency dropped from 380ms to 12ms, user complaints reduced by 94%.

### ⚖️ Trade-offs

| Aspect | Controlled | Uncontrolled |
|--------|------------|--------------|
| **Source of Truth** | React state | DOM |
| **Validation** | Real-time (every keystroke) | On submit/blur |
| **Re-renders** | Every change | None (until form submit) |
| **Code Complexity** | Higher (state + handlers) | Lower (just refs) |
| **Use Case** | Most forms, instant feedback needed | Simple forms, file inputs |
| **Performance** | Slower (re-renders) | Faster (no re-renders) |

**When to Use Controlled:**
- Need instant validation/feedback
- Transform input (uppercase, currency formatting)
- Conditional logic based on values
- Complex forms with interdependent fields
- Most React forms (default choice)

**When to Use Uncontrolled:**
- Simple forms without validation
- File inputs (must be uncontrolled)
- Integrating with non-React code
- Performance-critical with many inputs

### 💬 Explain to Junior

**Controlled = React is the boss of the input.**

React state says "your value is 'hello'" → input shows "hello". User types "hi" → onChange tells React → React updates state to "hi" → input now shows "hi".

It's like React is a control freak parent who needs to approve everything you type!

**Interview Answer:** "Controlled components are form inputs whose value is controlled by React state. Every change updates state via onChange, and state flows back to the input's value prop. This gives React full control for validation and formatting, but causes re-renders on every keystroke. It's the recommended pattern for most React forms."

**Code Example:**
```jsx
// ✅ Controlled (React controls value)
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />

// ❌ Uncontrolled (DOM controls value)
<input defaultValue="initial" />
```

---

## Question 5: Uncontrolled Components

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐
**Time:** 5 minutes
**Companies:** Most companies

### Question
What are uncontrolled components? When would you use them over controlled components?

### Answer

**Uncontrolled Components** - Form inputs that maintain their own state in the DOM.

**Key Points:**
1. **DOM controls** - Value stored in DOM
2. **Refs** - Access value when needed
3. **Less re-renders** - Better performance
4. **defaultValue** - Set initial value
5. **Use cases** - File inputs, simple forms

### Code Example

```jsx
// Uncontrolled Component
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

### 🔍 Deep Dive

Uncontrolled components let the DOM handle form state, using refs to access values only when needed (like on submit). This is closer to traditional HTML forms where the browser manages input values.

**How It Works:**
1. Input maintains its own state in the DOM
2. React has no knowledge of current value
3. Use `ref` to access value when needed
4. Use `defaultValue` for initial value (not `value`)
5. No re-renders on input changes

```jsx
// Full uncontrolled form
function QuickForm() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const fileRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Access all values at once
    const formData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
      file: fileRef.current.files[0] // File inputs MUST be uncontrolled
    };

    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={emailRef}
        name="email"
        type="email"
        defaultValue="user@example.com"
      />
      <input
        ref={passwordRef}
        name="password"
        type="password"
      />
      {/* File input must be uncontrolled */}
      <input ref={fileRef} type="file" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Benefits:**
- Better performance (no re-renders)
- Less code (no state, no onChange)
- File inputs require this approach
- Easier integration with non-React libraries

**Drawbacks:**
- No instant validation
- Can't prevent invalid input
- Harder to implement complex forms
- DOM is source of truth (less "React-like")

### 🐛 Real-World Scenario

**Problem:** Image upload form with preview feature causing excessive re-renders. Every time user types in image title field, the 5MB preview image re-renders, causing 420ms lag.

**Root Cause:** Controlled component for title field triggers parent re-render, which re-renders preview image.

**Solution:** Switch title to uncontrolled, only read value on submit:
```jsx
// Before: Controlled (laggy)
const [title, setTitle] = useState('');
<input value={title} onChange={(e) => setTitle(e.target.value)} />
// Every keystroke re-renders entire form including image preview!

// After: Uncontrolled (fast)
const titleRef = useRef();
<input ref={titleRef} defaultValue="" />
// No re-renders, read value on submit only
```

**Results:** Input lag dropped from 420ms to 8ms, upload completion rate increased 34%.

### ⚖️ Trade-offs

| Aspect | Uncontrolled | Controlled |
|--------|--------------|------------|
| **Performance** | Fast (no re-renders) | Slower (re-renders) |
| **Code** | Less (just refs) | More (state + handlers) |
| **Validation** | On submit/blur only | Real-time |
| **Complexity** | Simple | Complex |
| **React Philosophy** | Less React-like | More React-like |
| **Required For** | File inputs | Most inputs |

**When to Use Uncontrolled:**
- **File inputs** (MUST be uncontrolled, React can't control file objects)
- Simple forms without validation
- Performance-critical forms
- Integrating with jQuery or other DOM libraries
- Quick prototypes

**When to Use Controlled:**
- Need instant feedback/validation
- Transform input values
- Disable submit based on values
- Complex forms with dependencies
- Most React applications (default)

### 💬 Explain to Junior

**Uncontrolled = DOM is the boss, React just asks for value when needed.**

User types "hello" → DOM stores it → React knows nothing until you click submit → React asks "what's the value?" → DOM says "hello".

It's like letting your kid manage their own money, and you only check their bank account when they want to buy something big!

**Interview Answer:** "Uncontrolled components let the DOM handle input state. We use refs to access values when needed, like on form submit. This is faster because there are no re-renders on input changes. It's required for file inputs since React can't control file objects. However, most React forms use controlled components for instant validation and better data flow."

**Key Difference:**
```jsx
// ✅ Uncontrolled (DOM controls)
const ref = useRef();
<input ref={ref} defaultValue="initial" />
// Access with: ref.current.value

// ✅ Controlled (React controls)
const [value, setValue] = useState('initial');
<input value={value} onChange={(e) => setValue(e.target.value)} />
```

**Common Use Case - File Upload:**
```jsx
function FileUpload() {
  const fileRef = useRef();

  const handleSubmit = () => {
    const file = fileRef.current.files[0];
    // File inputs MUST be uncontrolled!
  };

  return <input ref={fileRef} type="file" />;
}
```

---

**[← Back to React README](./README.md)**

**Progress:** 5 of 15 component patterns (Part A) ✅
