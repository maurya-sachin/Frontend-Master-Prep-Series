# React Patterns: Render Props

## Question 1: What is the render props pattern and how to implement it?

**Answer:**

The render props pattern is a React design pattern for sharing code between components using a prop whose value is a function. Instead of a component rendering its own UI, it calls a function prop (typically called `render` or `children`) and returns the result. This function receives data and callbacks as arguments, giving the calling component complete control over what gets rendered while the component with the render prop handles the logic.

The pattern emerged as a solution to the "wrapper hell" problem with Higher-Order Components (HOCs) and provides a more explicit way to share stateful logic. It leverages React's compositional model by inverting control - instead of the logic component deciding what to render, it delegates that decision to the consumer.

Key characteristics of render props:
- **Inversion of Control**: The consumer decides what to render, not the provider
- **Explicit Dependencies**: All shared state/callbacks are visible in the function signature
- **Flexible Composition**: Multiple render prop components can be easily composed
- **Type Safety**: TypeScript can infer render prop function parameters accurately

Common implementations include:
1. **Named render prop**: A prop explicitly named `render`
2. **Children as function**: Using the special `children` prop as a function
3. **Custom named props**: Any prop name that accepts a function (e.g., `renderHeader`, `renderItem`)

The pattern works by encapsulating complex logic (data fetching, subscriptions, state management) in a component that doesn't render UI itself, instead passing its state and methods to a function prop that returns JSX. This separation of concerns makes logic highly reusable across different UI presentations.

---

### 🔍 Deep Dive

**Render Props Internals and Mechanics:**

The render props pattern leverages JavaScript's first-class functions and React's component composition model. Let's examine the internal mechanics:

**1. Function Invocation Flow:**
```typescript
// Provider component internal flow
class DataProvider extends React.Component<{
  render: (data: Data) => React.ReactNode
}> {
  state = { data: null, loading: true };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const data = await fetch('/api/data').then(r => r.json());
    this.setState({ data, loading: false });
  };

  render() {
    // The render prop is invoked during render phase
    // React's reconciliation will diff the returned elements
    return this.props.render(this.state);
  }
}

// Consumer usage
<DataProvider
  render={(state) => (
    state.loading ? <Spinner /> : <DataDisplay data={state.data} />
  )}
/>
```

**2. Render Phase Behavior:**

During React's render phase, the render prop function is invoked on every render. This has important implications:

```typescript
// ❌ BAD: Creating new components in render props
<MouseTracker
  render={(x, y) => {
    // This creates a NEW component type on every render!
    const DynamicComponent = () => <div>{x}, {y}</div>;
    return <DynamicComponent />;
  }}
/>

// ✅ GOOD: Returning JSX directly
<MouseTracker
  render={(x, y) => <div>{x}, {y}</div>}
/>

// ✅ GOOD: Using stable component references
const MouseDisplay = ({ x, y }) => <div>{x}, {y}</div>;
<MouseTracker render={(x, y) => <MouseDisplay x={x} y={y} />} />
```

**3. Closure Scope and Memory:**

Render prop functions create closures that capture surrounding scope:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState({});

  return (
    <DataFetcher
      url={`/users/${userId}`}
      render={(user) => {
        // This closure captures userId and preferences
        // New closure created on every render
        return (
          <div>
            <h1>{user.name}</h1>
            <Settings
              preferences={preferences}
              onUpdate={setPreferences}
            />
          </div>
        );
      }}
    />
  );
}
```

**4. Inversion of Control Architecture:**

The render props pattern implements the Hollywood Principle ("Don't call us, we'll call you"):

```typescript
// Traditional approach: Component controls rendering
class DataDisplay extends React.Component {
  state = { data: null };

  componentDidMount() {
    fetchData().then(data => this.setState({ data }));
  }

  render() {
    // Component decides how to render
    return <div>{this.state.data?.name}</div>;
  }
}

// Render props: Consumer controls rendering
class DataProvider extends React.Component {
  state = { data: null };

  componentDidMount() {
    fetchData().then(data => this.setState({ data }));
  }

  render() {
    // Consumer decides how to render
    return this.props.render(this.state.data);
  }
}

// Maximum flexibility for consumers
<DataProvider render={(data) => <CustomView data={data} />} />
<DataProvider render={(data) => <TableView data={data} />} />
<DataProvider render={(data) => <ChartView data={data} />} />
```

**5. Advanced Pattern: Render Props with Context:**

Combining render props with Context for powerful abstractions:

```typescript
const ThemeContext = React.createContext<Theme>(defaultTheme);

class ThemeProvider extends React.Component<{
  children: (theme: Theme, toggleTheme: () => void) => React.ReactNode
}> {
  state = { theme: 'light' as Theme };

  toggleTheme = () => {
    this.setState(prev => ({
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  render() {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        {this.props.children(this.state.theme, this.toggleTheme)}
      </ThemeContext.Provider>
    );
  }
}

// Usage combines context propagation with render flexibility
<ThemeProvider>
  {(theme, toggle) => (
    <div className={theme}>
      <Header theme={theme} onToggle={toggle} />
      <Content theme={theme} />
    </div>
  )}
</ThemeProvider>
```

**6. Function as Children Pattern:**

This is a specialized form of render props using the `children` prop:

```typescript
// Generic implementation
interface ToggleProps {
  initial?: boolean;
  children: (state: {
    on: boolean;
    toggle: () => void;
    setOn: (value: boolean) => void;
  }) => React.ReactNode;
}

class Toggle extends React.Component<ToggleProps> {
  state = { on: this.props.initial ?? false };

  toggle = () => this.setState(prev => ({ on: !prev.on }));
  setOn = (on: boolean) => this.setState({ on });

  render() {
    return this.props.children({
      on: this.state.on,
      toggle: this.toggle,
      setOn: this.setOn
    });
  }
}

// Extremely flexible usage
<Toggle initial={false}>
  {({ on, toggle, setOn }) => (
    <div>
      <button onClick={toggle}>
        {on ? 'Turn Off' : 'Turn On'}
      </button>
      <button onClick={() => setOn(true)}>Force On</button>
      {on && <Content />}
    </div>
  )}
</Toggle>
```

**7. Performance Optimization Techniques:**

```typescript
// ❌ BAD: Inline function creates new reference every render
<DataProvider
  render={(data) => <DataDisplay data={data} />}
/>

// ✅ GOOD: Memoized render function
const renderData = React.useCallback(
  (data) => <DataDisplay data={data} />,
  [] // No dependencies, stable reference
);
<DataProvider render={renderData} />

// ✅ BETTER: Component reference with props
<DataProvider
  render={(data) => <DataDisplay data={data} />}
/>
// Where DataDisplay is React.memo wrapped
const DataDisplay = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

// ✅ BEST: Provider implements shouldComponentUpdate
class OptimizedProvider extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if data actually changed
    return !shallowEqual(this.state.data, nextState.data);
  }

  render() {
    return this.props.render(this.state.data);
  }
}
```

**8. TypeScript Type Safety:**

Render props work exceptionally well with TypeScript:

```typescript
interface RenderPropPattern<TData, TCallbacks> {
  render: (data: TData, callbacks: TCallbacks) => React.ReactNode;
}

interface MouseData {
  x: number;
  y: number;
}

interface MouseCallbacks {
  reset: () => void;
}

class MouseTracker extends React.Component<
  RenderPropPattern<MouseData, MouseCallbacks>
> {
  state = { x: 0, y: 0 };

  handleMouseMove = (e: React.MouseEvent) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };

  reset = () => this.setState({ x: 0, y: 0 });

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(
          { x: this.state.x, y: this.state.y },
          { reset: this.reset }
        )}
      </div>
    );
  }
}

// TypeScript infers all types correctly
<MouseTracker
  render={(data, callbacks) => (
    // data.x, data.y are typed as number
    // callbacks.reset is typed as () => void
    <div>
      Position: {data.x}, {data.y}
      <button onClick={callbacks.reset}>Reset</button>
    </div>
  )}
/>
```

---

### 🐛 Real-World Scenario

**Scenario: Performance Degradation in Dashboard with Multiple Render Props**

**Context:**
A SaaS analytics platform had a dashboard using render props for sharing data fetching logic. After adding more widgets, users reported the dashboard became sluggish, with visible lag when interacting with controls.

**Initial Implementation:**

```typescript
// Dashboard.tsx - Performance problems
function Dashboard() {
  return (
    <div className="dashboard">
      {/* Multiple nested render props */}
      <UserDataProvider
        render={(user) => (
          <AnalyticsProvider
            userId={user.id}
            render={(analytics) => (
              <NotificationsProvider
                userId={user.id}
                render={(notifications) => (
                  <SettingsProvider
                    userId={user.id}
                    render={(settings) => (
                      // Render all widgets
                      <>
                        <Header
                          user={user}
                          notifications={notifications}
                        />
                        <Sidebar settings={settings} />
                        <MainContent
                          analytics={analytics}
                          settings={settings}
                        />
                        <Footer user={user} />
                      </>
                    )}
                  />
                )}
              />
            )}
          />
        )}
      />
    </div>
  );
}

// Generic data provider
class DataProvider extends React.Component {
  state = { data: null, loading: true };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // Re-fetch if URL changed
    if (prevProps.url !== this.props.url) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    this.setState({ loading: true });
    const data = await fetch(this.props.url).then(r => r.json());
    this.setState({ data, loading: false });
  };

  render() {
    return this.props.render(this.state);
  }
}
```

**Performance Metrics Before Fix:**
- **Time to Interactive (TTI)**: 4.2 seconds
- **First Contentful Paint (FCP)**: 2.8 seconds
- **Interaction Latency**: 150-200ms for button clicks
- **Re-renders on Settings Toggle**: 127 components
- **Bundle Size**: 340 KB (gzipped)
- **Memory Usage**: 85 MB for dashboard page

**Root Cause Analysis:**

**1. Callback Hell and Deep Nesting:**
```typescript
// Every state update triggered re-render of entire tree
<A render={() =>
  <B render={() =>
    <C render={() =>
      <D render={() =>
        // All providers re-render when any state changes
      } />
    } />
  } />
} />
```

**2. Inline Function Creation:**
```typescript
// ❌ New function created on every render
<DataProvider
  render={(data) => <Display data={data} />}
/>
// Each re-render creates new render prop function
// Causes child components to re-mount instead of update
```

**3. Unnecessary Re-renders:**
```typescript
class DataProvider extends React.Component {
  render() {
    // No shouldComponentUpdate optimization
    // Re-renders even when data unchanged
    return this.props.render(this.state);
  }
}
```

**4. Multiple Subscriptions:**
Each provider subscribed to real-time updates independently, causing cascading re-renders.

**Debugging Steps:**

```typescript
// Step 1: React DevTools Profiler
// Recorded interaction and identified:
// - 127 component re-renders on single state change
// - Render duration: 280ms
// - Main culprits: Nested render props causing full tree re-renders

// Step 2: Why Did You Render
import whyDidYouRender from '@welldone-software/why-did-you-render';
whyDidYouRender(React, {
  trackAllPureComponents: true,
});

// Output showed:
// "DataProvider re-rendered because render prop changed"
// (inline functions creating new references)

// Step 3: Chrome DevTools Performance
// Identified multiple expensive calculations in render props
// Long tasks blocking main thread: 15 tasks > 50ms

// Step 4: React DevTools Components
// Highlighted components updated on every provider state change
// Even unrelated components were re-rendering
```

**Solution Implementation:**

```typescript
// Solution 1: Convert to Custom Hooks
// ✅ GOOD: Replace render props with hooks
function useUserData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData().then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

function useAnalytics(userId: string) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchAnalytics(userId).then(setAnalytics);
  }, [userId]);

  return analytics;
}

// Dashboard simplified
function Dashboard() {
  const { data: user, loading: userLoading } = useUserData();
  const analytics = useAnalytics(user?.id);
  const notifications = useNotifications(user?.id);
  const settings = useSettings(user?.id);

  if (userLoading) return <Spinner />;

  return (
    <div className="dashboard">
      <Header user={user} notifications={notifications} />
      <Sidebar settings={settings} />
      <MainContent analytics={analytics} settings={settings} />
      <Footer user={user} />
    </div>
  );
}

// Solution 2: Memoization for Remaining Render Props
const MemoizedDataProvider = React.memo(
  DataProvider,
  (prev, next) => {
    // Custom comparison
    return prev.url === next.url &&
           shallowEqual(prev.data, next.data);
  }
);

// Solution 3: Stable Render Functions
function DashboardWithRenderProps() {
  // Memoize render functions
  const renderUser = useCallback(
    (user) => (
      <UserDisplay user={user} />
    ),
    [] // No dependencies = stable reference
  );

  return (
    <UserDataProvider render={renderUser} />
  );
}

// Solution 4: Context + Hooks for Shared State
const DashboardContext = createContext(null);

function DashboardProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    analytics: null,
    notifications: null,
    settings: null
  });

  // Single data fetching orchestration
  useEffect(() => {
    Promise.all([
      fetchUser(),
      fetchAnalytics(),
      fetchNotifications(),
      fetchSettings()
    ]).then(([user, analytics, notifications, settings]) => {
      setState({ user, analytics, notifications, settings });
    });
  }, []);

  return (
    <DashboardContext.Provider value={state}>
      {children}
    </DashboardContext.Provider>
  );
}

// Components consume only what they need
function Header() {
  const { user, notifications } = useContext(DashboardContext);
  return <header>{user.name} - {notifications.length} new</header>;
}

// Solution 5: Component Splitting
// Split large render prop trees into smaller chunks
function DashboardSection({ userId }) {
  return (
    <AnalyticsProvider userId={userId}>
      {(analytics) => <AnalyticsWidget data={analytics} />}
    </AnalyticsProvider>
  );
}
```

**Performance Metrics After Fix:**
- **Time to Interactive (TTI)**: 1.8 seconds (↓ 57%)
- **First Contentful Paint (FCP)**: 1.2 seconds (↓ 57%)
- **Interaction Latency**: 35-50ms (↓ 75%)
- **Re-renders on Settings Toggle**: 8 components (↓ 94%)
- **Bundle Size**: 295 KB (↓ 13% after removing render prop wrappers)
- **Memory Usage**: 52 MB (↓ 39%)

**Key Lessons:**
1. **Render props create deep nesting** that's hard to optimize
2. **Inline functions break memoization** and cause unnecessary re-renders
3. **Hooks provide better composition** for sharing stateful logic
4. **Context + Hooks** often superior to nested render props for shared state
5. **Profile before optimizing** - measure actual performance impact

**When to Still Use Render Props:**
- Component libraries exposing flexible APIs
- When you need explicit control over rendering
- Legacy codebases where hooks migration is complex
- Specific use cases like virtualization components

---

### ⚖️ Trade-offs

**Render Props vs Hooks vs HOCs: Comprehensive Comparison**

**1. Composition and Nesting:**

```typescript
// Render Props: Pyramid of doom
<UserProvider render={user =>
  <ThemeProvider render={theme =>
    <DataProvider render={data =>
      <NotificationsProvider render={notifications =>
        // Deeply nested, hard to read
        <App
          user={user}
          theme={theme}
          data={data}
          notifications={notifications}
        />
      )} />
    )} />
  )} />
} />

// Hooks: Flat, readable
function App() {
  const user = useUser();
  const theme = useTheme();
  const data = useData();
  const notifications = useNotifications();

  return <AppContent />;
}

// HOCs: Wrapper hell
const EnhancedApp = withUser(
  withTheme(
    withData(
      withNotifications(App)
    )
  )
);
// Plus props naming conflicts
```

**Winner: Hooks** - Flat composition, no nesting issues

**2. Type Safety (TypeScript):**

```typescript
// Render Props: Excellent type inference
interface RenderProp<T> {
  render: (data: T) => React.ReactNode;
}

<DataProvider<User>
  render={(user) => {
    // TypeScript knows user is User type
    return <div>{user.name}</div>;
  }}
/>

// Hooks: Good type inference
function useData<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null);
  return data;
}
const user = useData<User>('/api/user');
// user is typed as User | null

// HOCs: Type inference challenges
function withData<P extends { data: User }>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'data'>> {
  // Complex type gymnastics
  // Often requires manual type assertions
}
```

**Winner: Render Props** - Most explicit type information flow

**3. Performance:**

```typescript
// Render Props: Can cause unnecessary re-renders
class Provider extends React.Component {
  render() {
    // Calls render prop on every parent re-render
    return this.props.render(this.state.data);
  }
}

// Requires manual optimization
const memoizedRender = useCallback(
  (data) => <Display data={data} />,
  []
);

// Hooks: Easier to optimize
function useOptimizedData() {
  const [data, setData] = useState(null);

  // useMemo for expensive computations
  const processed = useMemo(
    () => processData(data),
    [data]
  );

  return processed;
}

// HOCs: Can optimize with React.memo
const withData = (Component) => {
  return React.memo((props) => {
    const data = fetchData();
    return <Component {...props} data={data} />;
  });
};
```

**Winner: Hooks** - Built-in optimization primitives (useMemo, useCallback)

**4. Code Reusability:**

```typescript
// Render Props: Reusable but verbose
<MouseTracker
  render={(x, y) => <Display x={x} y={y} />}
/>
<MouseTracker
  render={(x, y) => <Chart x={x} y={y} />}
/>
<MouseTracker
  render={(x, y) => <CustomView x={x} y={y} />}
/>

// Hooks: Highly reusable, composable
function ComponentA() {
  const { x, y } = useMousePosition();
  return <Display x={x} y={y} />;
}

function ComponentB() {
  const { x, y } = useMousePosition();
  const position = useWindowSize(); // Compose multiple hooks
  return <Chart x={x} y={y} size={position} />;
}

// HOCs: Reusable but rigid
const DisplayWithMouse = withMouseTracking(Display);
const ChartWithMouse = withMouseTracking(Chart);
// Hard to customize behavior
```

**Winner: Hooks** - Most composable and flexible

**5. Testing:**

```typescript
// Render Props: Test component and render logic separately
// Test provider
test('MouseTracker provides position', () => {
  let receivedX, receivedY;
  render(
    <MouseTracker
      render={(x, y) => {
        receivedX = x;
        receivedY = y;
        return null;
      }}
    />
  );
  fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  expect(receivedX).toBe(100);
  expect(receivedY).toBe(50);
});

// Hooks: Test hook and component separately
import { renderHook, act } from '@testing-library/react-hooks';

test('useMousePosition returns position', () => {
  const { result } = renderHook(() => useMousePosition());

  act(() => {
    fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  });

  expect(result.current.x).toBe(100);
  expect(result.current.y).toBe(50);
});

// HOCs: Must test wrapped component
test('withMouseTracking provides position', () => {
  const Component = ({ x, y }) => <div>{x}, {y}</div>;
  const Enhanced = withMouseTracking(Component);

  const { getByText } = render(<Enhanced />);
  fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  expect(getByText('100, 50')).toBeInTheDocument();
});
```

**Winner: Hooks** - Dedicated testing utilities, easier isolation

**6. Bundle Size:**

```typescript
// Render Props: Minimal overhead
class MouseTracker extends React.Component {
  // Only the component code
}

// Hooks: Minimal overhead
function useMousePosition() {
  // Only the hook code
}

// HOCs: Additional wrapper components
function withData(Component) {
  return function Wrapper(props) {
    // Extra wrapper in component tree
    const data = useData();
    return <Component {...props} data={data} />;
  };
}
```

**Winner: Tie (Hooks/Render Props)** - Both minimal, HOCs add wrapper overhead

**7. Learning Curve:**

```typescript
// Render Props: Medium complexity
// Need to understand:
// - Functions as props
// - Inversion of control
// - Closure scope

// Hooks: Rules to learn
// Need to understand:
// - Rules of hooks (top-level only, order matters)
// - Dependency arrays
// - useEffect mental model

// HOCs: Higher-order functions
// Need to understand:
// - Higher-order functions
// - Component composition
// - Props forwarding
// - Static hoisting
```

**Winner: Render Props** - More intuitive, no special rules

**8. Use Case Suitability:**

| Use Case | Best Pattern | Reason |
|----------|--------------|--------|
| Sharing stateful logic | Hooks | Flat composition, easy to combine |
| Component libraries | Render Props | Explicit API, flexible rendering |
| Cross-cutting concerns | Hooks/Context | Avoid wrapper hell |
| Animation/Virtualization | Render Props | Need precise render control |
| Form management | Hooks | Complex state + validation logic |
| Authentication/Routing | Context + Hooks | Global state access |
| Legacy codebases | HOCs/Render Props | If already using class components |
| TypeScript projects | Render Props | Superior type inference |

**Decision Matrix:**

```typescript
// Use Render Props when:
✅ Building component libraries with flexible APIs
✅ Need explicit render control (virtualization, animation)
✅ Working with TypeScript and want best type inference
✅ Component logic is purely presentational wrapper
✅ Consumers need full control over rendering

// Use Hooks when:
✅ Building application code (not libraries)
✅ Need to compose multiple pieces of logic
✅ Want optimal performance with built-in optimizations
✅ Working on modern React codebase (16.8+)
✅ Team is familiar with hooks mental model

// Use HOCs when:
✅ Maintaining legacy class component codebase
✅ Need to enhance components with additional props
✅ Pattern is already established in codebase
✅ Logic doesn't require consumer customization

// Avoid Render Props when:
❌ Nesting becomes deep (3+ levels)
❌ Performance is critical and re-renders are expensive
❌ Logic is better suited for hooks (most application code)
```

**Modern Best Practice (2024):**

```typescript
// Primary: Use Hooks for most logic sharing
function MyComponent() {
  const user = useUser();
  const theme = useTheme();
  const data = useData();

  return <Content />;
}

// Secondary: Use Render Props for flexible library APIs
<VirtualizedList
  items={items}
  renderItem={(item, index) => (
    <CustomItem item={item} index={index} />
  )}
  renderEmpty={() => <EmptyState />}
/>

// Tertiary: Context + Hooks for global state
const ThemeContext = createContext(null);

function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

### 💬 Explain to Junior

**Simple Explanation:**

Imagine you're building a photo gallery app. You have a component that handles fetching photos, but different screens want to display them differently - some want a grid, some want a carousel, some want a list.

**Without render props**, you'd need multiple components:
```typescript
<PhotoGridFetcher />    // Fetches AND displays grid
<PhotoCarouselFetcher /> // Fetches AND displays carousel
<PhotoListFetcher />     // Fetches AND displays list
```

That's a lot of duplicate fetching logic!

**With render props**, you separate "fetching logic" from "display logic":
```typescript
<PhotoFetcher
  render={(photos) => <PhotoGrid photos={photos} />}
/>

<PhotoFetcher
  render={(photos) => <PhotoCarousel photos={photos} />}
/>

<PhotoFetcher
  render={(photos) => <PhotoList photos={photos} />}
/>
```

The `PhotoFetcher` component handles fetching, but YOU decide how to display the photos by passing a function that returns JSX.

**Real-World Analogy:**

Think of render props like a restaurant kitchen:

- **The Kitchen (Render Props Component)**: Prepares ingredients (data, state, callbacks)
- **The Chef's Instructions (render prop function)**: You tell the kitchen how to plate the food
- **The Final Dish**: Your custom UI with the kitchen's prepared ingredients

The kitchen doesn't decide what the final dish looks like - you do! The kitchen just gives you high-quality ingredients to work with.

**Basic Implementation:**

```typescript
// Step 1: Component with logic (no UI decisions)
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
      <div onMouseMove={this.handleMouseMove}>
        {/* Call the render prop function with our data */}
        {this.props.render(this.state.x, this.state.y)}
      </div>
    );
  }
}

// Step 2: Different UIs using the same logic
function App() {
  return (
    <div>
      {/* Simple text display */}
      <MouseTracker
        render={(x, y) => (
          <h1>Mouse position: {x}, {y}</h1>
        )}
      />

      {/* Visual dot following mouse */}
      <MouseTracker
        render={(x, y) => (
          <div
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'red'
            }}
          />
        )}
      />

      {/* Coordinate grid */}
      <MouseTracker
        render={(x, y) => (
          <table>
            <tr><td>X:</td><td>{x}</td></tr>
            <tr><td>Y:</td><td>{y}</td></tr>
          </table>
        )}
      />
    </div>
  );
}
```

**Common Patterns:**

**1. Function as Children (special case of render props):**
```typescript
// Instead of prop named "render", use "children"
<DataFetcher url="/api/users">
  {(data, loading) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
</DataFetcher>

// Implementation
class DataFetcher extends React.Component {
  state = { data: null, loading: true };

  componentDidMount() {
    fetch(this.props.url)
      .then(res => res.json())
      .then(data => this.setState({ data, loading: false }));
  }

  render() {
    // Call children as function
    return this.props.children(this.state.data, this.state.loading);
  }
}
```

**2. Multiple Render Props (maximum flexibility):**
```typescript
<DataTable
  data={users}
  renderHeader={(columns) => (
    <thead>
      {columns.map(col => <th key={col}>{col}</th>)}
    </thead>
  )}
  renderRow={(user, index) => (
    <tr key={user.id}>
      <td>{user.name}</td>
      <td>{user.email}</td>
    </tr>
  )}
  renderEmpty={() => (
    <div>No users found</div>
  )}
/>
```

**Common Mistakes to Avoid:**

```typescript
// ❌ MISTAKE 1: Creating component inside render prop
<MouseTracker
  render={(x, y) => {
    const Display = () => <div>{x}, {y}</div>;
    return <Display />;
  }}
/>
// Problem: New component type created every render = poor performance

// ✅ CORRECT: Return JSX directly or use stable component
const Display = ({ x, y }) => <div>{x}, {y}</div>;
<MouseTracker
  render={(x, y) => <Display x={x} y={y} />}
/>

// ❌ MISTAKE 2: Not providing fallbacks
<DataFetcher
  render={(data) => (
    <ul>
      {data.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  )}
/>
// Problem: Crashes if data is null/undefined during loading

// ✅ CORRECT: Handle loading/error states
<DataFetcher
  render={(data, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    if (!data) return null;

    return (
      <ul>
        {data.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    );
  }}
/>

// ❌ MISTAKE 3: Deeply nested render props
<A render={a =>
  <B render={b =>
    <C render={c =>
      <D render={d =>
        // Callback hell - hard to read
      } />
    } />
  } />
} />

// ✅ CORRECT: Use hooks instead for multiple dependencies
function Component() {
  const a = useA();
  const b = useB();
  const c = useC();
  const d = useD();

  return <UI a={a} b={b} c={c} d={d} />;
}
```

**Interview Answer Template:**

**Question: "Explain render props and when you'd use them."**

**Answer Structure:**
1. **Definition**: "Render props is a pattern where a component receives a function prop that returns React elements, allowing the component to delegate rendering to the caller while sharing logic."

2. **Example**: "For instance, if I have a `DataFetcher` component that handles API calls, different screens might want to display that data differently - a table, a chart, or a list. With render props, the `DataFetcher` handles fetching, and consumers control the UI via the render function."

3. **When to use**: "I'd use render props when building reusable components that need flexible rendering, like virtualized lists, mouse tracking, or data fetching utilities. However, for most application code today, I'd prefer custom hooks since they compose better and avoid nesting."

4. **Trade-off awareness**: "The main downside is deep nesting when combining multiple render props, which hooks solve elegantly. But render props still shine in component libraries where you want consumers to have full control over rendering."

**Practical Example:**
```typescript
// Interview live coding: Toggle component with render props
class Toggle extends React.Component {
  state = { on: false };

  toggle = () => {
    this.setState(prev => ({ on: !prev.on }));
  };

  render() {
    return this.props.children({
      on: this.state.on,
      toggle: this.toggle
    });
  }
}

// Usage shows flexibility
<Toggle>
  {({ on, toggle }) => (
    <div>
      <button onClick={toggle}>
        {on ? 'Hide' : 'Show'} Content
      </button>
      {on && <div>Toggleable content!</div>}
    </div>
  )}
</Toggle>
```

**Key Takeaways for Interviews:**
1. Render props = sharing logic without sharing UI
2. Function prop receives data/callbacks, returns JSX
3. Great for libraries, but hooks are often better for apps
4. Watch for performance issues with inline functions
5. TypeScript loves render props (excellent type inference)

---

## Question 2: When to use render props vs hooks vs HOCs?

**Answer:**

The choice between render props, hooks, and Higher-Order Components (HOCs) depends on several factors including the React version, use case, team preferences, and specific requirements. Each pattern solves the problem of code reusability but with different trade-offs.

**Use Render Props when:**
- Building a **component library** that needs to expose flexible APIs to consumers
- You need **explicit control over rendering** (e.g., virtualization, animation libraries)
- Working with **TypeScript** and want the best type inference for shared logic
- The logic is a **pure presentational wrapper** that doesn't dictate UI structure
- Consumers need **complete control** over what and how things are rendered
- Supporting **legacy codebases** that can't upgrade to hooks (React < 16.8)

**Use Hooks when:**
- Building **application code** (not libraries) with React 16.8+
- You need to **compose multiple pieces of logic** in a single component
- Performance optimization is important (built-in `useMemo`, `useCallback`)
- Avoiding **wrapper hell** and keeping component trees flat
- The team is comfortable with hooks' **rules and mental model**
- You want **cleaner, more readable code** without deep nesting

**Use HOCs when:**
- Maintaining a **legacy codebase** with class components
- You need to **enhance existing components** with additional props/behavior
- The pattern is **already established** in your codebase (consistency)
- Implementing **cross-cutting concerns** like logging, analytics, or feature flags
- Logic doesn't require consumer customization (fixed behavior injection)

**Modern Best Practice (2024):**
Hooks are the primary choice for most scenarios. Use render props for library APIs that need rendering flexibility, and reserve HOCs for legacy code maintenance. The React team recommends hooks as the default pattern for sharing stateful logic, with render props as a complementary pattern for specialized use cases.

**Key Decision Factor:**
If you're building a library that others will consume, render props provide the most flexibility. If you're building application features, hooks provide the best developer experience and performance.

---

### 🔍 Deep Dive

**Architectural Differences and Internal Mechanics:**

**1. Composition Models:**

```typescript
// Render Props: Inversion of Control
// Consumer controls rendering, provider controls logic
class DataProvider extends React.Component {
  state = { data: null };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const data = await fetch(this.props.url).then(r => r.json());
    this.setState({ data });
  };

  render() {
    // Provider says: "You decide what to render"
    return this.props.render(this.state);
  }
}

// Usage: Explicit rendering control
<DataProvider
  url="/api/users"
  render={(state) => (
    state.data ? <UserList users={state.data} /> : <Spinner />
  )}
/>

// Hooks: Direct Logic Injection
// Logic is directly injected into component
function useData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, [url]);

  return data;
}

// Usage: Logic and rendering in same component
function Users() {
  const users = useData('/api/users');
  return users ? <UserList users={users} /> : <Spinner />;
}

// HOCs: Component Wrapping
// Enhances component by wrapping it
function withData(url) {
  return function (Component) {
    return class extends React.Component {
      state = { data: null };

      componentDidMount() {
        fetch(url).then(r => r.json()).then(data => {
          this.setState({ data });
        });
      }

      render() {
        // HOC injects data as props
        return <Component {...this.props} data={this.state.data} />;
      }
    };
  };
}

// Usage: Component is wrapped/enhanced
const UsersWithData = withData('/api/users')(UserList);
<UsersWithData />
```

**2. React Component Tree Differences:**

```typescript
// Render Props Component Tree:
<DataProvider>           // Provider component
  └─ <div>               // Wrapper from provider
       └─ [render prop result]  // Your custom rendering

// Hooks Component Tree:
<YourComponent>          // Your component directly
  └─ [your JSX]          // No wrappers

// HOC Component Tree:
<WithDataWrapper>        // HOC wrapper
  └─ <YourComponent>     // Your component wrapped
       └─ [your JSX]

// Multiple Compositions:

// Render Props: Nested pyramid
<UserProvider render={user =>
  <ThemeProvider render={theme =>
    <DataProvider render={data =>
      <YourComponent user={user} theme={theme} data={data} />
    )} />
  )} />
} />

// Hooks: Flat structure
function YourComponent() {
  const user = useUser();
  const theme = useTheme();
  const data = useData();
  return <div>...</div>;
}

// HOCs: Wrapper onion
const Enhanced = withUser(withTheme(withData(YourComponent)));
```

**3. Type System Interactions:**

```typescript
// Render Props: Excellent Type Flow
interface RenderPropComponent<TData> {
  url: string;
  render: (data: TData, loading: boolean) => React.ReactNode;
}

class DataProvider<T> extends React.Component<RenderPropComponent<T>> {
  // TypeScript tracks generic T through render prop
  render() {
    return this.props.render(this.state.data as T, this.state.loading);
  }
}

// Usage with perfect inference
<DataProvider<User[]>
  url="/api/users"
  render={(users, loading) => {
    // TypeScript knows: users is User[], loading is boolean
    return users.map(u => <div key={u.id}>{u.name}</div>);
  }}
/>

// Hooks: Good Type Inference
function useData<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  return { data, loading };
}

// Usage requires explicit generic
const { data: users, loading } = useData<User[]>('/api/users');
// TypeScript knows: users is User[] | null

// HOCs: Complex Type Gymnastics
function withData<P extends { data: User[] }>(url: string) {
  return function<TProps extends P>(
    Component: React.ComponentType<TProps>
  ): React.ComponentType<Omit<TProps, 'data'>> {
    return class extends React.Component<Omit<TProps, 'data'>> {
      // Complex type manipulation
      // Often requires manual assertions
      render() {
        return <Component {...(this.props as TProps)} data={[]} />;
      }
    };
  };
}

// Usage requires careful typing
interface Props {
  data: User[];
  otherProp: string;
}
const UserList: React.FC<Props> = ({ data, otherProp }) => { /*...*/ };
const Enhanced = withData<Props>('/api/users')(UserList);
// Type inference often breaks, needs manual fixes
```

**4. Lifecycle and Rendering Behavior:**

```typescript
// Render Props: Render triggered by parent
class Provider extends React.Component {
  state = { count: 0 };

  render() {
    console.log('Provider render');
    // Render prop called on every Provider render
    return this.props.render(this.state.count);
  }
}

// Every parent re-render calls render prop function
<Parent>
  <Provider render={(count) => {
    console.log('Render prop called');
    return <Display count={count} />;
  }} />
</Parent>

// Hooks: Integrated into component lifecycle
function Component() {
  const count = useCount();
  // Hook called during component render
  // Part of same render cycle
  return <Display count={count} />;
}

// HOC: Separate component lifecycle
function withCount(Component) {
  return class Wrapper extends React.Component {
    // Wrapper has its own lifecycle
    componentDidMount() {
      console.log('Wrapper mounted');
    }

    render() {
      console.log('Wrapper render');
      return <Component count={this.state.count} />;
    }
  };
}
```

**5. Performance Optimization Strategies:**

```typescript
// Render Props: Manual optimization needed
// Problem: Inline functions create new references
<Provider
  render={(data) => <Display data={data} />}
/>
// New function every render = Display re-renders

// Solution 1: Memoize render function
const renderDisplay = useCallback(
  (data) => <Display data={data} />,
  []
);
<Provider render={renderDisplay} />

// Solution 2: Provider optimization
class OptimizedProvider extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if data changed
    return this.state.data !== nextState.data;
  }

  render() {
    return this.props.render(this.state.data);
  }
}

// Hooks: Built-in optimization primitives
function useOptimizedData(url) {
  const [data, setData] = useState(null);

  // Memoize expensive computation
  const processed = useMemo(
    () => expensiveProcessing(data),
    [data]
  );

  // Memoize callbacks
  const refresh = useCallback(() => {
    fetchData(url).then(setData);
  }, [url]);

  return { data: processed, refresh };
}

// HOC: Wrap with React.memo
function withData(Component) {
  const Wrapper = (props) => {
    const data = useData();
    return <Component {...props} data={data} />;
  };

  // Prevent unnecessary re-renders
  return React.memo(Wrapper, (prev, next) => {
    return prev.data === next.data;
  });
}
```

**6. Error Boundaries Integration:**

```typescript
// Render Props: Can wrap render prop result
class DataProvider extends React.Component {
  state = { data: null, error: null };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.render(this.state.data);
  }
}

// Hooks: Requires separate ErrorBoundary component
function DataComponent() {
  const data = useData(); // Hook can throw
  return <Display data={data} />;
}

// Must wrap with ErrorBoundary
<ErrorBoundary>
  <DataComponent />
</ErrorBoundary>

// HOC: Can include error boundary
function withErrorBoundary(Component) {
  return class extends React.Component {
    state = { error: null };

    componentDidCatch(error) {
      this.setState({ error });
    }

    render() {
      if (this.state.error) {
        return <ErrorDisplay />;
      }
      return <Component {...this.props} />;
    }
  };
}
```

**7. Testing Strategies:**

```typescript
// Render Props: Test provider and consumer separately
// Test provider logic
test('Provider fetches data', () => {
  let receivedData;
  render(
    <DataProvider
      render={(data) => {
        receivedData = data;
        return null;
      }}
    />
  );
  await waitFor(() => {
    expect(receivedData).toEqual(mockData);
  });
});

// Hooks: Use renderHook utility
import { renderHook, act } from '@testing-library/react-hooks';

test('useData fetches data', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useData('/api/users')
  );

  expect(result.current.loading).toBe(true);

  await waitForNextUpdate();

  expect(result.current.data).toEqual(mockData);
  expect(result.current.loading).toBe(false);
});

// HOC: Test enhanced component
test('withData provides data prop', async () => {
  const Component = ({ data }) => <div>{data.length}</div>;
  const Enhanced = withData('/api/users')(Component);

  const { getByText } = render(<Enhanced />);

  await waitFor(() => {
    expect(getByText('5')).toBeInTheDocument();
  });
});
```

**8. Migration Paths:**

```typescript
// Render Props → Hooks (recommended for apps)
// Before (Render Props)
<MouseTracker
  render={(x, y) => <Display x={x} y={y} />}
/>

// After (Hooks)
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return position;
}

function Display() {
  const { x, y } = useMousePosition();
  return <div>{x}, {y}</div>;
}

// HOC → Hooks (recommended for modernization)
// Before (HOC)
const Enhanced = withAuth(withTheme(Component));

// After (Hooks)
function Component() {
  const auth = useAuth();
  const theme = useTheme();
  return <div>{/* Use auth and theme */}</div>;
}
```

---

### 🐛 Real-World Scenario

**Scenario: Component Library Migration - Render Props to Hooks with Backwards Compatibility**

**Context:**
A popular UI component library (10k+ weekly downloads) provided a `<DataTable>` component using render props for customization. After React Hooks became stable, users requested a hooks-based API, but the library couldn't break existing APIs without a major version bump. The maintainers needed to support both patterns simultaneously.

**Initial Implementation (Render Props Only):**

```typescript
// v2.x - Render props only
interface DataTableProps<T> {
  data: T[];
  loading?: boolean;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderHeader?: (columns: string[]) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
}

class DataTable<T> extends React.Component<DataTableProps<T>> {
  render() {
    const { data, loading, renderRow, renderHeader, renderEmpty, renderLoading } = this.props;

    if (loading && renderLoading) {
      return <div className="data-table">{renderLoading()}</div>;
    }

    if (!data.length && renderEmpty) {
      return <div className="data-table">{renderEmpty()}</div>;
    }

    return (
      <div className="data-table">
        {renderHeader?.(['Name', 'Email', 'Role'])}
        <div className="data-table-body">
          {data.map((item, index) => (
            <div key={index} className="data-table-row">
              {renderRow(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

// Usage (v2.x)
<DataTable
  data={users}
  loading={loading}
  renderRow={(user, index) => (
    <>
      <div>{user.name}</div>
      <div>{user.email}</div>
      <div>{user.role}</div>
    </>
  )}
  renderHeader={(columns) => (
    <div className="header">
      {columns.map(col => <div key={col}>{col}</div>)}
    </div>
  )}
  renderEmpty={() => <div>No users found</div>}
  renderLoading={() => <Spinner />}
/>
```

**User Feedback & Requirements:**

**GitHub Issues:**
- Issue #234: "Please add hooks API - render props are verbose"
- Issue #289: "Composition is difficult with nested render props"
- Issue #312: "TypeScript inference breaks with complex render props"
- Issue #345: "Performance issues with inline render functions"

**Requirements:**
1. Maintain backwards compatibility (no breaking changes)
2. Provide hooks-based API for new users
3. Allow gradual migration from render props to hooks
4. Keep bundle size minimal (no code duplication)
5. Maintain excellent TypeScript support for both APIs

**Performance Metrics Before Migration:**

**Render Props API Issues:**
- **Bundle Size**: 45 KB (gzipped: 12 KB)
- **Render Time**: 180ms for 100 rows (inline render functions)
- **Memory Usage**: 8 MB per table instance
- **Re-renders**: 15 component re-renders on data update
- **Developer Complaints**: "Too much boilerplate", "Nesting makes code unreadable"

**Solution Implementation:**

**Phase 1: Add Hooks API Alongside Render Props**

```typescript
// v3.0 - Dual API support

// New hooks for table composition
export function useTableData<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (fetcher: () => Promise<T[]>) => {
    setLoading(true);
    try {
      const newData = await fetcher();
      setData(newData);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, refresh, setData };
}

export function useTableSelection<T>(data: T[]) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(data.map((_, i) => i)));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  return { selected, toggleSelection, selectAll, clearSelection };
}

export function useTableSorting<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  return { sortedData, sortConfig, requestSort };
}

// Updated DataTable component supporting BOTH APIs
interface DataTableProps<T> {
  data?: T[];
  loading?: boolean;
  children?: React.ReactNode;
  // Render props (backwards compatible)
  renderRow?: (item: T, index: number) => React.ReactNode;
  renderHeader?: (columns: string[]) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
}

function DataTable<T>({
  data,
  loading,
  children,
  renderRow,
  renderHeader,
  renderEmpty,
  renderLoading
}: DataTableProps<T>) {
  // Determine which API is being used
  const isRenderPropsAPI = !children && renderRow;

  if (isRenderPropsAPI) {
    // Legacy render props path
    if (loading && renderLoading) {
      return <div className="data-table">{renderLoading()}</div>;
    }

    if (!data?.length && renderEmpty) {
      return <div className="data-table">{renderEmpty()}</div>;
    }

    return (
      <div className="data-table">
        {renderHeader?.([])}
        <div className="data-table-body">
          {data?.map((item, index) => (
            <div key={index} className="data-table-row">
              {renderRow!(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // New hooks-based composition API
  return (
    <div className="data-table">
      {children}
    </div>
  );
}

// Composable components for hooks API
DataTable.Header = function Header({ children }: { children: React.ReactNode }) {
  return <div className="data-table-header">{children}</div>;
};

DataTable.Body = function Body({ children }: { children: React.ReactNode }) {
  return <div className="data-table-body">{children}</div>;
};

DataTable.Row = function Row({ children }: { children: React.ReactNode }) {
  return <div className="data-table-row">{children}</div>;
};

DataTable.Cell = function Cell({ children }: { children: React.ReactNode }) {
  return <div className="data-table-cell">{children}</div>;
};

DataTable.Empty = function Empty({ children }: { children: React.ReactNode }) {
  return <div className="data-table-empty">{children}</div>;
};

DataTable.Loading = function Loading({ children }: { children: React.ReactNode }) {
  return <div className="data-table-loading">{children}</div>;
};
```

**New Hooks-Based Usage (v3.0):**

```typescript
// Clean, composable hooks API
function UsersTable() {
  const { data, loading, refresh } = useTableData<User>([]);
  const { selected, toggleSelection, selectAll } = useTableSelection(data);
  const { sortedData, sortConfig, requestSort } = useTableSorting(data);

  useEffect(() => {
    refresh(() => fetch('/api/users').then(r => r.json()));
  }, [refresh]);

  if (loading) {
    return (
      <DataTable>
        <DataTable.Loading>
          <Spinner />
        </DataTable.Loading>
      </DataTable>
    );
  }

  if (!sortedData.length) {
    return (
      <DataTable>
        <DataTable.Empty>
          No users found
        </DataTable.Empty>
      </DataTable>
    );
  }

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Cell>
          <input
            type="checkbox"
            onChange={() => selectAll()}
            checked={selected.size === data.length}
          />
        </DataTable.Cell>
        <DataTable.Cell onClick={() => requestSort('name')}>
          Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </DataTable.Cell>
        <DataTable.Cell onClick={() => requestSort('email')}>
          Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
        </DataTable.Cell>
      </DataTable.Header>

      <DataTable.Body>
        {sortedData.map((user, index) => (
          <DataTable.Row key={user.id}>
            <DataTable.Cell>
              <input
                type="checkbox"
                checked={selected.has(index)}
                onChange={() => toggleSelection(index)}
              />
            </DataTable.Cell>
            <DataTable.Cell>{user.name}</DataTable.Cell>
            <DataTable.Cell>{user.email}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable.Body>
    </DataTable>
  );
}
```

**Backwards Compatible Render Props Usage (v3.0):**

```typescript
// Old code still works without changes!
<DataTable
  data={users}
  loading={loading}
  renderRow={(user, index) => (
    <>
      <div>{user.name}</div>
      <div>{user.email}</div>
    </>
  )}
  renderEmpty={() => <div>No users found</div>}
  renderLoading={() => <Spinner />}
/>
```

**Performance Metrics After Migration:**

**Hooks API Benefits:**
- **Bundle Size**: 42 KB (gzipped: 11 KB) - 6.7% reduction
- **Render Time**: 95ms for 100 rows (↓ 47%) - memoized components
- **Memory Usage**: 5 MB per table instance (↓ 37.5%)
- **Re-renders**: 3 component re-renders on data update (↓ 80%)
- **Developer Satisfaction**: "Much cleaner", "Easy to compose features"

**Migration Statistics (6 months post-release):**
- 45% of users migrated to hooks API
- 55% still using render props (backwards compatibility working)
- 0 breaking change complaints
- 23% increase in library adoption
- 92% positive feedback on dual API approach

**Key Lessons:**

1. **Backwards Compatibility is Critical**: Supporting both APIs prevented breaking existing users
2. **Hooks Enable Better Composition**: Multiple hooks compose better than nested render props
3. **Performance Gains from Memoization**: Hooks make optimization more straightforward
4. **Gradual Migration Path**: Users can migrate feature-by-feature, not all-at-once
5. **Documentation is Key**: Clear migration guides helped adoption

**When This Approach Makes Sense:**
- Maintaining public libraries with large user bases
- Can't afford breaking changes
- Want to modernize API without alienating existing users
- Have resources to support dual APIs temporarily

**When to Just Pick One:**
- New projects: Use hooks exclusively
- Internal company libraries: Can coordinate breaking changes
- Small user base: Easier to communicate migration

---

### ⚖️ Trade-offs

**Comprehensive Decision Framework: Render Props vs Hooks vs HOCs**

**1. Use Case Suitability Matrix:**

| Scenario | Best Choice | Why | Example |
|----------|-------------|-----|---------|
| **Component Libraries** | Render Props | Flexible API, consumer controls rendering | `<VirtualList renderItem={...} />` |
| **Application State Logic** | Hooks | Clean composition, no nesting | `useAuth()`, `useData()` |
| **Cross-Cutting Concerns** | Hooks + Context | Avoid prop drilling | `useTheme()`, `useI18n()` |
| **Legacy Class Components** | HOCs or Render Props | Hooks require function components | `withRouter()`, `<Consumer render={...} />` |
| **Animation/Virtualization** | Render Props | Precise render control needed | `<Spring render={...} />` |
| **Form Management** | Hooks | Complex state + validation | `useForm()`, `useField()` |
| **Data Fetching** | Hooks | Easier composition + caching | `useSWR()`, `useQuery()` |
| **Mouse/Scroll Tracking** | Hooks | Simpler API | `useMousePosition()` |
| **Feature Flags** | HOCs or Hooks | Conditional rendering | `withFeatureFlag()` or `useFeature()` |
| **TypeScript Projects** | Render Props | Best type inference | Explicit generic parameters |

**2. Performance Comparison:**

```typescript
// Benchmark: 1000 components updating on state change

// Render Props: Inline functions
const RenderPropsExample = () => (
  <DataProvider
    render={(data) => <Display data={data} />}
  />
);
// Result: 280ms average render time
// Issue: New function reference every render

// Render Props: Memoized
const memoizedRender = useCallback(
  (data) => <Display data={data} />,
  []
);
const MemoizedRenderProps = () => (
  <DataProvider render={memoizedRender} />
);
// Result: 95ms average render time (↓ 66%)

// Hooks: Basic
const HooksExample = () => {
  const data = useData();
  return <Display data={data} />;
};
// Result: 85ms average render time
// Built-in optimization with useMemo/useCallback

// Hooks: Optimized
const OptimizedHooks = () => {
  const data = useData();
  const MemoizedDisplay = useMemo(
    () => <Display data={data} />,
    [data]
  );
  return MemoizedDisplay;
};
// Result: 60ms average render time (↓ 29%)

// HOCs: Basic
const withData = (Component) => {
  return (props) => {
    const data = useData();
    return <Component {...props} data={data} />;
  };
};
const DisplayWithData = withData(Display);
const HOCExample = () => <DisplayWithData />;
// Result: 90ms average render time

// HOCs: Memoized
const withOptimizedData = (Component) => {
  const Wrapper = (props) => {
    const data = useData();
    return <Component {...props} data={data} />;
  };
  return React.memo(Wrapper);
};
// Result: 70ms average render time
```

**Performance Winner: Hooks** (with proper optimization)

**3. Developer Experience Comparison:**

```typescript
// Scenario: Component needs user, theme, and data

// Render Props: Pyramid of doom
<UserProvider render={user => (
  <ThemeProvider render={theme => (
    <DataProvider render={data => (
      <Component user={user} theme={theme} data={data} />
    )} />
  )} />
)} />
// Lines of code: 8
// Nesting depth: 3 levels
// Readability: ⭐⭐ (2/5)

// Hooks: Flat and clean
function Component() {
  const user = useUser();
  const theme = useTheme();
  const data = useData();
  return <div>...</div>;
}
// Lines of code: 5
// Nesting depth: 0 levels
// Readability: ⭐⭐⭐⭐⭐ (5/5)

// HOCs: Wrapper hell
const Enhanced = withUser(
  withTheme(
    withData(Component)
  )
);
<Enhanced />
// Lines of code: 6
// Component tree depth: 3 wrappers
// Readability: ⭐⭐⭐ (3/5)
// Issue: Props conflicts, hard to debug
```

**DX Winner: Hooks** (flat, readable, composable)

**4. Type Safety Evaluation:**

```typescript
// Render Props: Excellent inference
interface MouseTrackerProps {
  render: (x: number, y: number, reset: () => void) => React.ReactNode;
}

<MouseTracker
  render={(x, y, reset) => {
    // TypeScript knows all types perfectly
    // x: number, y: number, reset: () => void
    return <div onClick={reset}>{x}, {y}</div>;
  }}
/>
// Type safety: ⭐⭐⭐⭐⭐ (5/5)
// Inference quality: Excellent
// Generic support: Perfect

// Hooks: Good inference with explicit types
function useMousePosition(): { x: number; y: number; reset: () => void } {
  // Implementation
}

function Component() {
  const { x, y, reset } = useMousePosition();
  // TypeScript knows all types
  return <div onClick={reset}>{x}, {y}</div>;
}
// Type safety: ⭐⭐⭐⭐ (4/5)
// Inference quality: Good (return type needed)
// Generic support: Good

// HOCs: Complex, often breaks
function withMouse<P extends { x: number; y: number }>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'x' | 'y'>> {
  // Complex type gymnastics
}

interface Props {
  x: number;
  y: number;
  name: string;
}

const Component: React.FC<Props> = ({ x, y, name }) => <div />;
const Enhanced = withMouse(Component);
// Often requires manual type assertions
// Type safety: ⭐⭐ (2/5)
// Inference quality: Poor
// Generic support: Difficult
```

**Type Safety Winner: Render Props**

**5. Testing Complexity:**

```typescript
// Render Props: Test separately
// Test logic provider
test('MouseTracker provides position', () => {
  let x, y;
  render(
    <MouseTracker
      render={(px, py) => {
        x = px;
        y = py;
        return null;
      }}
    />
  );
  fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  expect(x).toBe(100);
  expect(y).toBe(50);
});

// Test consumer separately
test('Display shows position', () => {
  const { getByText } = render(<Display x={100} y={50} />);
  expect(getByText('100, 50')).toBeInTheDocument();
});
// Test complexity: ⭐⭐⭐ (3/5) - Need to test separately

// Hooks: Use renderHook utility
import { renderHook, act } from '@testing-library/react-hooks';

test('useMousePosition returns position', () => {
  const { result } = renderHook(() => useMousePosition());

  act(() => {
    fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  });

  expect(result.current.x).toBe(100);
  expect(result.current.y).toBe(50);
});
// Test complexity: ⭐⭐⭐⭐ (4/5) - Dedicated testing library

// HOCs: Must test wrapped component
test('withMouse provides position', () => {
  const Component = ({ x, y }) => <div>{x}, {y}</div>;
  const Enhanced = withMouse(Component);

  const { getByText } = render(<Enhanced />);
  fireEvent.mouseMove(document, { clientX: 100, clientY: 50 });
  expect(getByText('100, 50')).toBeInTheDocument();
});
// Test complexity: ⭐⭐ (2/5) - Hard to isolate logic
```

**Testing Winner: Hooks** (dedicated testing utilities)

**6. Bundle Size Impact:**

```typescript
// Render Props: Minimal overhead
class MouseTracker extends React.Component {
  // ~2 KB minified
}

// Hooks: Minimal overhead
function useMousePosition() {
  // ~1 KB minified
}

// HOCs: Additional wrapper overhead
function withMouse(Component) {
  return function Wrapper(props) {
    // Extra wrapper component in tree
    // ~1.5 KB minified per HOC
  };
}

// Multiple compositions:
// Render Props: <A render={<B render={<C />} />} />
// Size: 6 KB for 3 providers

// Hooks: useA(); useB(); useC();
// Size: 3 KB for 3 hooks

// HOCs: withA(withB(withC(Component)))
// Size: 4.5 KB for 3 HOCs + wrappers
```

**Bundle Size Winner: Hooks**

**7. Migration Path Difficulty:**

```typescript
// Render Props → Hooks: Straightforward
// Before
<MouseTracker render={(x, y) => <div>{x}, {y}</div>} />

// After
function Component() {
  const { x, y } = useMousePosition();
  return <div>{x}, {y}</div>;
}
// Migration difficulty: ⭐⭐ (2/5) - Easy

// HOCs → Hooks: Moderate
// Before
const Enhanced = withMouse(Component);

// After
function Component() {
  const { x, y } = useMousePosition();
  // Original component logic
}
// Migration difficulty: ⭐⭐⭐ (3/5) - Need to refactor props

// Render Props → HOCs: Wrapper extraction
// Before
<Provider render={(data) => <Component data={data} />} />

// After
const withData = (Component) => (props) => (
  <Provider render={(data) => <Component {...props} data={data} />} />
);
// Migration difficulty: ⭐⭐⭐⭐ (4/5) - Complex wrapping
```

**Migration Winner: Render Props → Hooks** (easiest path)

**8. Final Recommendation Matrix:**

```typescript
// Decision Tree:

// Are you building a library that others will consume?
if (library) {
  // Provide render props for maximum flexibility
  return 'Render Props';
}

// Are you working with React < 16.8 or class components?
if (legacyCodebase) {
  return 'HOCs or Render Props';
}

// Do you need multiple pieces of logic in one component?
if (multipleLogicPieces) {
  return 'Hooks'; // Compose easily
}

// Is TypeScript type inference critical?
if (typeInferenceCritical) {
  return 'Render Props'; // Best inference
}

// Do you need precise control over rendering? (e.g., virtualization)
if (preciseFenderControl) {
  return 'Render Props';
}

// Default for modern React applications:
return 'Hooks';
```

**Summary Table:**

| Criteria | Render Props | Hooks | HOCs |
|----------|--------------|-------|------|
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DX** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Testing** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Bundle Size** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Composability** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Library APIs** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Learning Curve** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Overall Winner: Hooks** for most modern React applications

---

### 💬 Explain to Junior

**Simple Explanation:**

Imagine you're organizing a party and need to decide how to share the guest list with different party planners:

**Render Props = Event Coordinator Who Gives You Options**
- The coordinator has the guest list but asks YOU how to arrange the seating
- You provide instructions (a function), they provide the data
- Example: "Here are 50 guests, tell me how you want them seated"

**Hooks = Direct Access to Party Planning Tools**
- You directly use party planning tools yourself
- No middleman, you just grab what you need
- Example: You use `useGuestList()` and arrange seating yourself

**HOCs = Pre-Packaged Party Plans**
- Someone wraps your party with a pre-made plan
- Less flexibility, but works for standard parties
- Example: Your party gets "premium decorations" added automatically

**Real Code Examples:**

```typescript
// Render Props: You control the rendering
<UserDataProvider
  render={(user) => {
    // YOU decide how to display the user
    return <div>Hello, {user.name}!</div>;
  }}
/>

// Hooks: Direct access to data
function Greeting() {
  const user = useUser(); // Get data directly
  return <div>Hello, {user.name}!</div>; // Use it however you want
}

// HOC: Your component gets enhanced automatically
const GreetingWithUser = withUser(Greeting);
// User data is automatically passed as props
```

**When to Use Each (Simple Rules):**

**Use Render Props when:**
```typescript
// Building a library that others will use
// Example: A virtualized list library
<VirtualList
  items={thousands of items}
  renderItem={(item) => {
    // Library users control HOW each item looks
    return <CustomItemDisplay item={item} />;
  }}
/>

// Why? Users need flexibility to render items their way
```

**Use Hooks when:**
```typescript
// Building regular app features
function ProfilePage() {
  // Grab multiple pieces of data easily
  const user = useUser();
  const posts = usePosts(user.id);
  const friends = useFriends(user.id);

  return (
    <div>
      <Profile user={user} />
      <Posts posts={posts} />
      <Friends friends={friends} />
    </div>
  );
}

// Why? Clean, no nesting, easy to read
```

**Use HOCs when:**
```typescript
// Working with old class component code
class UserProfile extends React.Component {
  render() {
    return <div>{this.props.user.name}</div>;
  }
}

// Can't use hooks in classes, so wrap with HOC
const UserProfileWithData = withUser(UserProfile);

// Why? Only option for class components
```

**Common Mistake Example:**

```typescript
// ❌ WRONG: Deep render prop nesting (hard to read)
<UserProvider render={user => (
  <ThemeProvider render={theme => (
    <DataProvider render={data => (
      <NotificationsProvider render={notifications => (
        // Too deeply nested!
        <Dashboard
          user={user}
          theme={theme}
          data={data}
          notifications={notifications}
        />
      )} />
    )} />
  )} />
)} />

// ✅ RIGHT: Use hooks instead (flat and clean)
function Dashboard() {
  const user = useUser();
  const theme = useTheme();
  const data = useData();
  const notifications = useNotifications();

  return <div>Everything is here!</div>;
}
```

**Interview Answer Template:**

**Question: "When would you use render props vs hooks?"**

**Answer:**
"I'd use **hooks** for most application code because they're cleaner and compose better. For example, if I need user data and theme information, I can just call `useUser()` and `useTheme()` in my component without nesting.

I'd use **render props** when building a library where I want consumers to have full control over rendering. For instance, a virtualized list component would use render props so users can customize how each item looks.

HOCs were useful before hooks, but now I'd only use them when maintaining legacy class component code that can't be refactored to hooks yet.

The key trade-off is flexibility vs simplicity: render props give consumers maximum control but create nesting, while hooks are simpler but the library makes more decisions about the API."

**Quick Decision Guide:**

```typescript
// Question: What pattern should I use?

// Building a library?
→ Render Props ✅
// Example: <DataTable renderRow={...} />

// Building app features?
→ Hooks ✅
// Example: const data = useData();

// Working with class components?
→ HOCs or Render Props ✅
// Example: withAuth(Component)

// Need to compose multiple pieces of logic?
→ Hooks ✅
// Example: useAuth(); useTheme(); useData();

// Need consumers to fully control rendering?
→ Render Props ✅
// Example: <Animation render={(progress) => ...} />
```

**Remember:**
- **Hooks**: Default choice for modern React (2024)
- **Render Props**: Special cases (libraries, flexible APIs)
- **HOCs**: Legacy code only

**Key Takeaway**: Start with hooks, use render props only when you need consumers to control rendering, and avoid HOCs in new code.

