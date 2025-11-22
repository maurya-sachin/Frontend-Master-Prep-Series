# React Context API and useContext Hook

## Question 1: How does useContext work and when should you use it?

**Answer:**

The `useContext` hook provides a way to consume values from React Context without wrapping components in Consumer components. It accepts a Context object (created with `React.createContext`) and returns the current context value for that context. The current context value is determined by the nearest `<Context.Provider>` up the component tree.

**Basic Usage:**
```javascript
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Current theme: {theme}</div>;
}
```

**When to Use Context:**
- **Global State**: Theme, language, authentication status that many components need
- **Avoiding Prop Drilling**: When passing props through 3+ intermediate components
- **Dependency Injection**: Providing services, API clients, or configuration to component trees
- **Component Composition**: Compound components that need to share state

**When NOT to Use Context:**
- Frequently changing data that affects performance
- Simple parent-child communication (use props)
- Complex state management with many updates (consider Redux, Zustand)
- Data that only 1-2 components need

Context is best for low-to-medium frequency updates of data that needs to be accessible by many components at different nesting levels. It simplifies component APIs by eliminating prop drilling while maintaining React's unidirectional data flow.

### 🔍 Deep Dive

**Internal Mechanism of Context Propagation:**

When you call `useContext(MyContext)`, React performs several internal operations:

1. **Context Lookup**: React traverses up the fiber tree (React's internal representation of the component tree) to find the nearest `MyContext.Provider`.

2. **Subscription Registration**: The component subscribes to context changes. React maintains a list of all components consuming each context.

3. **Value Resolution**: If a Provider is found, React returns its `value` prop. If no Provider exists, it returns the default value passed to `createContext`.

4. **Change Detection**: When a Provider's value changes (via `Object.is` comparison), React marks all subscribed components as needing updates.

**React Fiber and Context:**

```javascript
// Simplified React internal representation
const fiber = {
  type: MyComponent,
  dependencies: {
    // List of contexts this component consumes
    contexts: [ThemeContext, UserContext],
    // Subscription to specific context values
    lanes: [/* update priorities */]
  }
}
```

When a Provider's value changes:
1. React checks if `Object.is(oldValue, newValue)` is false
2. If changed, React schedules updates for all consuming components
3. React uses the **lanes** algorithm to prioritize which updates to process first
4. Each consumer re-renders with the new context value

**Context Implementation Details:**

```javascript
// What createContext actually creates
function createContext(defaultValue) {
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,      // Current value in primary renderer
    _currentValue2: defaultValue,     // Current value in secondary renderer
    _threadCount: 0,                  // Concurrent rendering support
    Provider: {
      $$typeof: REACT_PROVIDER_TYPE,
      _context: context
    },
    Consumer: {
      $$typeof: REACT_CONTEXT_TYPE,
      _context: context
    }
  };
  return context;
}
```

**Advanced Context Patterns:**

**1. Context Selector Pattern** (avoiding unnecessary re-renders):
```javascript
// ❌ BAD: Component re-renders on ANY context change
function UserProfile() {
  const { user, theme, settings } = useContext(AppContext);
  return <div>{user.name}</div>; // Only uses user, but re-renders for theme/settings changes
}

// ✅ GOOD: Split contexts by update frequency
const UserContext = createContext();
const ThemeContext = createContext();
const SettingsContext = createContext();

function UserProfile() {
  const user = useContext(UserContext); // Only re-renders when user changes
  return <div>{user.name}</div>;
}
```

**2. Context + Reducer Pattern**:
```javascript
const StateContext = createContext();
const DispatchContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Separate contexts prevent re-renders when only dispatch is needed
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components only using dispatch don't re-render on state changes
function ActionButton() {
  const dispatch = useContext(DispatchContext); // Stable reference
  return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>;
}
```

**3. Computed Context Values** (memoization):
```javascript
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // ❌ BAD: New object every render
  const value = { user, setUser, theme, setTheme };

  // ✅ GOOD: Memoized object
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme] // Only recreate when these change
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

**Context vs Props Performance:**

Context doesn't "magically" make prop drilling faster. In fact:
- **Props**: React can bail out of re-rendering if props haven't changed (shallow comparison)
- **Context**: All consumers re-render when value changes, regardless of what part they use

The benefit is **developer experience** (cleaner code) not performance. For performance, you need optimization techniques (shown in Q2).

### 🐛 Real-World Scenario

**Problem: E-commerce App with Severe Performance Issues**

**Context:**
A Next.js e-commerce application with 15,000 products. The app uses a single AppContext for theme, user, cart, and product filters. Users reported the app freezing when adding items to cart.

**Initial Implementation:**
```javascript
// ❌ PROBLEMATIC: Single massive context
const AppContext = createContext();

function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);

  const value = {
    theme, setTheme,
    user, setUser,
    cart, setCart,
    filters, setFilters,
    products, setProducts
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Every component consuming context
function ProductCard({ productId }) {
  const { cart, setCart, theme } = useContext(AppContext);
  // Re-renders on theme, user, filter, product changes even though it only needs cart
}

function FilterSidebar() {
  const { filters, setFilters } = useContext(AppContext);
  // Re-renders when cart updates (user adding items)
}

function ProductList() {
  const { products, filters } = useContext(AppContext);
  // All 15,000 product cards re-render when cart updates
}
```

**Performance Metrics (Before Optimization):**
```
Add to Cart Action:
- Time to Interactive: 3,200ms
- Total Blocking Time: 1,800ms
- Components Re-rendered: 15,347 (entire product list + filters + header)
- JavaScript Execution: 2,100ms
- Layout Thrashing: 47 forced reflows
- Memory Usage Spike: +180MB
- FPS during animation: 12fps (target: 60fps)

Lighthouse Score:
- Performance: 38/100
- Largest Contentful Paint: 4.2s
```

**Debugging Process:**

**Step 1: Identify Re-render Culprit**
```javascript
// Added React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log({
    component: id,
    phase,
    actualDuration, // Time spent rendering
    baseDuration,   // Estimated time without memoization
  });
}

<Profiler id="ProductList" onRenderCallback={onRenderCallback}>
  <ProductList />
</Profiler>
```

**Findings:**
- ProductList rendered 15,000 ProductCard components on every cart update
- Each ProductCard re-rendered even though cart data didn't affect most of them
- Context value object recreated on every state change (new reference)

**Step 2: React DevTools Component Highlights**
```javascript
// Enabled "Highlight updates when components render" in React DevTools
// Result: Entire screen flashing on single cart update
```

**Step 3: Performance Profiling**
```javascript
// Chrome DevTools Performance tab
// Call stack showed:
// 1. setCart called
// 2. AppProvider re-renders (new context value)
// 3. 15,347 components re-render
// 4. Reconciliation phase: 1,200ms
// 5. Commit phase (DOM updates): 600ms
```

**Solution Implementation:**

**Fix 1: Split Contexts by Update Frequency**
```javascript
// ✅ Separate contexts
const ThemeContext = createContext();
const UserContext = createContext();
const CartContext = createContext();
const FiltersContext = createContext();
const ProductsContext = createContext();

function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <FiltersProvider>
            <ProductsProvider>
              {children}
            </ProductsProvider>
          </FiltersProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

**Fix 2: Memoize Context Values**
```javascript
function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // ✅ Memoized value with stable function references
  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart }),
    [cart, addToCart, removeFromCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

**Fix 3: Optimize Components**
```javascript
// ✅ Only subscribe to needed context
const ProductCard = memo(({ productId }) => {
  const { addToCart } = useContext(CartContext); // Only cart context
  const theme = useContext(ThemeContext);        // Only theme context

  // Component only re-renders when theme changes, not on cart updates
  return <div className={theme}>...</div>;
});

// ✅ Use React.memo to prevent unnecessary re-renders
const FilterSidebar = memo(() => {
  const { filters, setFilters } = useContext(FiltersContext);
  return <aside>...</aside>;
});
```

**Fix 4: Virtualization for Large Lists**
```javascript
import { FixedSizeList } from 'react-window';

function ProductList() {
  const { products } = useContext(ProductsContext);
  const { filters } = useContext(FiltersContext);

  const filteredProducts = useMemo(
    () => products.filter(p => matchesFilters(p, filters)),
    [products, filters]
  );

  // ✅ Only render visible products
  return (
    <FixedSizeList
      height={800}
      itemCount={filteredProducts.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <ProductCard
          key={filteredProducts[index].id}
          productId={filteredProducts[index].id}
          style={style}
        />
      )}
    </FixedSizeList>
  );
}
```

**Performance Metrics (After Optimization):**
```
Add to Cart Action:
- Time to Interactive: 180ms (94% improvement)
- Total Blocking Time: 45ms (97% improvement)
- Components Re-rendered: 3 (header cart icon + cart drawer + button)
- JavaScript Execution: 120ms (94% improvement)
- Layout Thrashing: 2 reflows (96% improvement)
- Memory Usage Spike: +8MB (96% improvement)
- FPS during animation: 58fps (383% improvement)

Lighthouse Score:
- Performance: 96/100 (158% improvement)
- Largest Contentful Paint: 1.1s (74% improvement)
```

**Key Learnings:**
1. **Context granularity matters**: Split by update frequency
2. **Memoization is critical**: Use useMemo for context values
3. **Measure before optimizing**: React DevTools Profiler is essential
4. **Virtualization for large lists**: Don't render 15,000 components
5. **Stable references**: useCallback for functions in context

### ⚖️ Trade-offs

**Context API vs Alternative Solutions:**

**1. Context vs Props Drilling**

**Props Drilling:**
```javascript
// ✅ GOOD for shallow hierarchies (2-3 levels)
function App() {
  const [theme, setTheme] = useState('light');
  return <Layout theme={theme} setTheme={setTheme} />;
}

function Layout({ theme, setTheme }) {
  return <Header theme={theme} setTheme={setTheme} />;
}

function Header({ theme, setTheme }) {
  return <ThemeToggle theme={theme} setTheme={setTheme} />;
}
```

**Pros:**
- Explicit data flow (easy to trace)
- Type-safe (TypeScript validates all props)
- No hidden dependencies
- Better for code splitting (unused props tree-shake)

**Cons:**
- Verbose for deep hierarchies (5+ levels)
- Intermediate components must pass props they don't use
- Refactoring becomes tedious

**Context:**
```javascript
// ✅ GOOD for deep hierarchies or many consumers
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function Header() {
  return <ThemeToggle />; // No props needed
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>Toggle</button>;
}
```

**Pros:**
- Clean component APIs (no prop drilling)
- Easy to add new consumers
- Good for cross-cutting concerns (theme, auth, i18n)

**Cons:**
- Implicit dependencies (harder to trace data flow)
- All consumers re-render on value change
- Can't tree-shake unused context consumers
- Testing requires Provider wrapper

**Decision Matrix:**
- **Use Props**: 1-3 component levels, few consumers, frequently changing data
- **Use Context**: 4+ levels, many consumers, infrequently changing data

---

**2. Context vs Redux/Zustand**

**Context + useReducer:**
```javascript
const StateContext = createContext();
const DispatchContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
```

**Pros:**
- Built into React (no dependencies)
- Simple for small-to-medium apps
- Good TypeScript support
- Server-side rendering friendly

**Cons:**
- All consumers re-render on any state change
- No built-in selector optimization
- No middleware (logging, persistence)
- No DevTools time-travel debugging
- Manual optimization required (splitting contexts)

**Redux:**
```javascript
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const themeSlice = createSlice({
  name: 'theme',
  initialState: 'light',
  reducers: {
    setTheme: (state, action) => action.payload
  }
});

function ThemeToggle() {
  // ✅ Only re-renders when theme changes (built-in selector optimization)
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(setTheme('dark'))}>Toggle</button>;
}
```

**Pros:**
- Selector optimization (components only re-render when selected data changes)
- Middleware (Redux DevTools, persistence, logging)
- Better for complex state logic
- Time-travel debugging

**Cons:**
- Extra dependency (~47KB)
- More boilerplate (actions, reducers, store setup)
- Steeper learning curve
- Overkill for simple apps

**Zustand (Lightweight Alternative):**
```javascript
import create from 'zustand';

const useStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme })
}));

function ThemeToggle() {
  const { theme, setTheme } = useStore();
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

**Pros:**
- Minimal boilerplate (~1KB)
- Built-in selector optimization
- No Provider needed
- Simple API

**Cons:**
- External dependency
- Less ecosystem support than Redux
- No built-in DevTools (requires plugin)

**Decision Matrix:**

| Feature | Context | Redux | Zustand |
|---------|---------|-------|---------|
| Bundle Size | 0KB | 47KB | 1KB |
| Boilerplate | Low | High | Minimal |
| Selectors | Manual | Built-in | Built-in |
| DevTools | No | Excellent | Plugin |
| Middleware | No | Rich | Limited |
| Learning Curve | Easy | Steep | Easy |
| Performance | Manual optimization | Optimized | Optimized |

**When to use each:**
- **Context**: Simple global state (theme, auth), small apps, want zero dependencies
- **Redux**: Complex state logic, need DevTools/middleware, large teams
- **Zustand**: Want performance of Redux with simplicity of Context

---

**3. Context Performance Optimization Strategies**

**Strategy 1: Split Contexts by Update Frequency**
```javascript
// ❌ BAD: Mixed update frequencies
const AppContext = createContext({
  theme: 'light',        // Changes rarely
  user: null,           // Changes rarely
  cartCount: 0,         // Changes frequently
  mousePosition: {x:0}  // Changes VERY frequently
});

// ✅ GOOD: Separate by frequency
const ThemeContext = createContext();   // Rarely changes
const UserContext = createContext();    // Rarely changes
const CartContext = createContext();    // Moderately changes
const MouseContext = createContext();   // Frequently changes
```

**Strategy 2: Memoize Context Values**
```javascript
// ❌ BAD: New object every render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ GOOD: Memoized value
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

**Strategy 3: Separate State and Dispatch**
```javascript
// ✅ Components using only dispatch don't re-render
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Only re-renders on state changes
function Display() {
  const state = useContext(StateContext);
  return <div>{state.count}</div>;
}

// Never re-renders (dispatch is stable)
function Controls() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>;
}
```

**Strategy 4: Use React.memo for Context Consumers**
```javascript
// ✅ Prevents re-renders when context value hasn't changed
const ThemeToggle = memo(() => {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button>{theme}</button>;
});
```

**Performance Comparison (10,000 components consuming context):**

| Optimization | Initial Render | Update Time | Re-renders |
|--------------|----------------|-------------|------------|
| No optimization | 2,100ms | 1,800ms | 10,000 |
| Split contexts | 2,000ms | 200ms | 150 |
| + Memoized values | 1,900ms | 180ms | 150 |
| + Separate dispatch | 1,850ms | 120ms | 75 |
| + React.memo | 1,200ms | 95ms | 45 |

**Key Takeaway:** Context requires manual optimization for large-scale apps. Redux/Zustand provide this optimization out-of-the-box.

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're working in a large office building with 100 employees. You need to share the company's Wi-Fi password with everyone.

**Props Drilling Approach:**
You tell Person A, who tells Person B, who tells Person C... until all 100 people know. If the password changes, you start the chain all over again. This works but is tedious.

**Context API Approach:**
You put a poster on the main bulletin board. Anyone in the building can walk up and read the password. When it changes, you update the poster once, and everyone can see the new password. Much simpler!

**How Context Works in Code:**

**Step 1: Create a Context (the bulletin board)**
```javascript
const ThemeContext = React.createContext('light'); // 'light' is the default value
```

**Step 2: Provide a Value (put info on the board)**
```javascript
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={theme}>
      {/* All components inside can access theme */}
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}
```

**Step 3: Consume the Value (read from the board)**
```javascript
function Header() {
  const theme = useContext(ThemeContext); // Gets 'dark'
  return <header className={theme}>My App</header>;
}
```

**Why Use Context?**

**Without Context (Props Drilling):**
```javascript
// ❌ Passing theme through many components
function App() {
  const [theme, setTheme] = useState('dark');
  return <Layout theme={theme} />;
}

function Layout({ theme }) {
  return <Header theme={theme} />;
}

function Header({ theme }) {
  return <Nav theme={theme} />;
}

function Nav({ theme }) {
  return <Logo theme={theme} />;
}

function Logo({ theme }) {
  return <img className={theme} />; // Finally used here!
}
```

Notice how `Layout`, `Header`, and `Nav` don't even use `theme` - they just pass it down. This is annoying!

**With Context:**
```javascript
// ✅ Clean and simple
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function Layout() {
  return <Header />; // No theme prop needed
}

function Header() {
  return <Nav />; // No theme prop needed
}

function Logo() {
  const theme = useContext(ThemeContext); // Directly access theme
  return <img className={theme} />;
}
```

**Common Beginner Mistakes:**

**Mistake 1: Not Memoizing Context Value**
```javascript
// ❌ BAD: Creates new object every render
function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}
// Every render of App creates a new { user, setUser } object
// All consumers re-render even if user didn't change!

// ✅ GOOD: Memoized value
function App() {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return (
    <UserContext.Provider value={value}>
      <Dashboard />
    </UserContext.Provider>
  );
}
```

**Mistake 2: Using Context for Everything**
```javascript
// ❌ BAD: Context for parent-child communication
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <Child />
    </CountContext.Provider>
  );
}

function Child() {
  const count = useContext(CountContext);
  return <div>{count}</div>;
}

// ✅ GOOD: Just use props!
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} />;
}

function Child({ count }) {
  return <div>{count}</div>;
}
```

**Mistake 3: Not Providing a Default Value**
```javascript
// ❌ BAD: No default value, crashes if no Provider
const ThemeContext = createContext();

function Logo() {
  const theme = useContext(ThemeContext); // undefined if no Provider!
  return <img className={theme} />; // Crashes
}

// ✅ GOOD: Provide sensible default
const ThemeContext = createContext('light');

function Logo() {
  const theme = useContext(ThemeContext); // 'light' if no Provider
  return <img className={theme} />; // Works
}
```

**Interview Answer Template:**

"useContext is a React hook that lets you consume values from a Context without wrapping components in a Consumer. You create a context with `createContext`, provide a value using a Provider component, and consume it with `useContext(MyContext)`.

I use Context for global data like theme, authentication status, or language settings that many components need. It's great for avoiding prop drilling when you have deeply nested components.

The key thing to remember is performance - you need to memoize context values with `useMemo` to prevent unnecessary re-renders, and consider splitting contexts by update frequency.

For example, in my last project, we used separate contexts for theme (rarely changes) and cart data (changes often), which improved performance significantly."

**When Asked in Interview:**
1. **Explain basic usage** (createContext, Provider, useContext)
2. **Give a real example** (theme, auth, or project-specific)
3. **Mention performance** (memoization, splitting contexts)
4. **Compare to alternatives** (props vs Context vs Redux)

---

## Question 2: What are the performance implications of Context API?

**Answer:**

The Context API has significant performance implications that developers must understand to build efficient React applications. The primary issue is that **all components consuming a context re-render whenever the context value changes**, regardless of whether they use the changed part of the value. This can lead to severe performance problems in large applications.

**Key Performance Characteristics:**

1. **No Selector Optimization**: Unlike Redux, Context doesn't have built-in selectors. If you consume `{ user, theme, cart }` but only use `user`, your component still re-renders when `theme` or `cart` changes.

2. **Reference Equality**: Context uses `Object.is()` to detect changes. Even if the data is the same, a new object reference triggers re-renders of all consumers.

3. **Propagation Depth**: Context updates propagate from Provider down through all consumers, potentially causing massive re-render cascades.

4. **No Batching Across Contexts**: Multiple context updates in the same event handler do batch, but complex apps with many contexts can still have performance issues.

**Performance Optimization Strategies:**

**1. Split Contexts**: Create separate contexts for different data domains or update frequencies.

**2. Memoize Values**: Use `useMemo` for context values and `useCallback` for functions.

**3. Separate State and Dispatch**: Use separate contexts for state and updater functions.

**4. React.memo**: Wrap consumer components in `memo()` to prevent re-renders when context value hasn't changed.

**5. Composition**: Use children props to prevent re-renders of large subtrees.

Without these optimizations, Context can be slower than prop drilling for frequently updating data. With proper optimization, it's suitable for medium-scale applications, but large apps with complex state may benefit from Redux or Zustand's built-in optimizations.

### 🔍 Deep Dive

**React's Context Update Mechanism:**

When a Context Provider's value changes, React performs these steps:

**1. Change Detection Phase:**
```javascript
// React internal pseudocode
function updateContextProvider(workInProgress, renderLanes) {
  const providerType = workInProgress.type;
  const context = providerType._context;

  const newValue = workInProgress.pendingProps.value;
  const oldValue = context._currentValue;

  // Object.is comparison
  if (!Object.is(oldValue, newValue)) {
    // Value changed, propagate to consumers
    propagateContextChange(workInProgress, context, renderLanes);
  }

  // Update the current value
  context._currentValue = newValue;
}
```

**Key Insight:** Even if your data is deeply equal (same properties, same values), a new object reference (`{}` !== `{}`) triggers updates.

**2. Consumer Identification Phase:**

React maintains a list of all fibers (component instances) that consume each context:

```javascript
// Simplified fiber structure
const fiber = {
  type: MyComponent,
  dependencies: {
    // Contexts this component depends on
    firstContext: {
      context: ThemeContext,
      observedBits: 1  // For future optimization
    },
    next: {
      context: UserContext,
      observedBits: 1
    }
  }
}
```

When a context changes, React traverses the fiber tree:

```javascript
function propagateContextChange(workInProgress, context, renderLanes) {
  let fiber = workInProgress.child;

  while (fiber !== null) {
    // Check if this fiber consumes the changed context
    let dependency = fiber.dependencies;

    if (dependency !== null) {
      let context = dependency.firstContext;

      while (context !== null) {
        if (context.context === context) {
          // This fiber consumes this context, schedule update
          scheduleWorkOnFiber(fiber, renderLanes);
        }
        context = context.next;
      }
    }

    // Traverse child fibers
    fiber = fiber.child;
  }
}
```

**3. Re-render Scheduling:**

React schedules updates for all consumers, but uses **lanes** (priority system) to determine which to process first:

```javascript
// React priority lanes
const SyncLane = 0b0000000000000000000000000000001;      // Sync updates
const InputContinuousLane = 0b0000000000000000000000100; // User input
const DefaultLane = 0b0000000000000000000010000;         // Default priority
const TransitionLane = 0b0000000000000001000000000;      // Transitions
```

**Performance Deep Dive: Why Context Can Be Slow**

**Scenario: 10,000 Component App**

```javascript
// Single context with mixed concerns
const AppContext = createContext();

function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [data, setData] = useState([/* 10,000 items */]);

  // ❌ New object on EVERY render (even if data unchanged)
  const value = { theme, setTheme, user, setUser, data, setData };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function DataItem({ id }) {
  // Only uses data, but re-renders on theme/user changes
  const { data } = useContext(AppContext);
  return <div>{data.find(item => item.id === id).name}</div>;
}

function ThemeToggle() {
  // Only uses theme, but re-renders on data/user changes
  const { theme, setTheme } = useContext(AppContext);
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

**Performance Impact:**
- **Parent re-render**: AppProvider re-renders (state change)
- **Context value creation**: New object `{ theme, user, data, ... }`
- **Change detection**: React sees new object reference → propagate changes
- **Consumer updates**: All 10,000 DataItem components scheduled for re-render
- **Reconciliation**: React diffs 10,000 components
- **Commit**: DOM updates for changed components

**Measured Metrics (Chrome DevTools):**
```
Single theme change:
- Render phase: 1,200ms
- Commit phase: 300ms
- Total: 1,500ms
- Components re-rendered: 10,000
- JavaScript heap: +45MB
```

**Optimization Strategy 1: Split Contexts**

```javascript
// ✅ Separate contexts by concern
const ThemeContext = createContext();
const UserContext = createContext();
const DataContext = createContext();

function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function DataItem({ id }) {
  // Only subscribes to DataContext
  const { data } = useContext(DataContext);
  return <div>{data.find(item => item.id === id).name}</div>;
}

function ThemeToggle() {
  // Only subscribes to ThemeContext
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

**Performance Impact After Split:**
```
Single theme change:
- Render phase: 12ms
- Commit phase: 3ms
- Total: 15ms
- Components re-rendered: 5 (ThemeToggle + 4 theme-aware components)
- JavaScript heap: +0.5MB

Improvement: 99% faster (1,500ms → 15ms)
```

**Optimization Strategy 2: Memoization**

```javascript
// ❌ BAD: New object every render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // New object reference on every render
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ GOOD: Memoized value
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // Stable object reference (only changes when dependencies change)
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme] // setUser/setTheme are stable from useState
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

**Why This Matters:**
```javascript
// Parent re-renders (e.g., state change in ancestor)
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Provider>
        <ChildApp />
      </Provider>
    </>
  );
}

// WITHOUT useMemo:
// - Parent re-renders (count changes)
// - Provider re-renders
// - New context value object created
// - All consumers re-render (new object reference)

// WITH useMemo:
// - Parent re-renders (count changes)
// - Provider re-renders
// - useMemo returns SAME object (dependencies unchanged)
// - React skips consumer updates (Object.is sees same reference)
```

**Optimization Strategy 3: Separate State and Dispatch**

```javascript
// ✅ Dispatch context has stable reference (never changes)
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch is stable (never changes)
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// Components that only dispatch don't re-render on state changes
function AddButton() {
  const dispatch = useContext(DispatchContext); // Stable reference
  return (
    <button onClick={() => dispatch({ type: 'ADD' })}>
      Add Item
    </button>
  );
  // Never re-renders (dispatch never changes)
}

// Components that read state re-render only on state changes
function ItemList() {
  const state = useContext(StateContext);
  return <ul>{state.items.map(item => <li>{item}</li>)}</ul>;
}
```

**Performance Comparison (1,000 action buttons + 1,000 display components):**

| Pattern | State Update Time | Re-renders |
|---------|-------------------|------------|
| Single context (state + dispatch) | 450ms | 2,000 |
| Separate contexts | 180ms | 1,000 |

**Optimization Strategy 4: Context Selector Pattern (Manual)**

React doesn't have built-in selectors, but you can build them:

```javascript
// ❌ Without selectors: component re-renders on any state change
function UserProfile() {
  const { user, theme, settings, cart } = useContext(AppContext);
  return <div>{user.name}</div>; // Only uses user, but re-renders for everything
}

// ✅ With custom selector hook
function useContextSelector(context, selector) {
  const value = useContext(context);
  const selectedValue = selector(value);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const selectedRef = useRef(selectedValue);

  useEffect(() => {
    if (!Object.is(selectedRef.current, selectedValue)) {
      selectedRef.current = selectedValue;
      forceUpdate();
    }
  });

  return selectedValue;
}

function UserProfile() {
  // Only re-renders when user changes
  const user = useContextSelector(AppContext, state => state.user);
  return <div>{user.name}</div>;
}
```

**Note:** This pattern is complex. For apps needing selectors, use Redux or Zustand instead.

**Advanced: React 18 `useSyncExternalStore` for Context Selectors**

```javascript
import { useSyncExternalStore } from 'react';

function createContextWithSelector(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  return {
    Provider({ value: newValue, children }) {
      value = newValue;
      subscribers.forEach(callback => callback());
      return children;
    },
    useSelector(selector) {
      return useSyncExternalStore(
        (callback) => {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },
        () => selector(value),
        () => selector(value)
      );
    }
  };
}

const AppContext = createContextWithSelector({ user: null, theme: 'light' });

function UserProfile() {
  const user = AppContext.useSelector(state => state.user);
  return <div>{user?.name}</div>; // Only re-renders when user changes
}
```

This is still complex - better to use a library like Zustand which does this for you.

### 🐛 Real-World Scenario

**Problem: Social Media Dashboard with Crippling Performance**

**Context:**
A React-based social media analytics dashboard displaying real-time metrics for influencers. The app shows follower count, engagement rates, post analytics, and live comments. Users reported the dashboard becoming unresponsive when viewing posts with many comments.

**Initial Architecture:**
```javascript
// ❌ PROBLEMATIC: Single context for entire dashboard
const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [followers, setFollowers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [liveComments, setLiveComments] = useState([]);
  const [analytics, setAnalytics] = useState({});

  // WebSocket for live comments (updates every 2-3 seconds)
  useEffect(() => {
    const ws = new WebSocket('wss://api.socialanalytics.com/comments');
    ws.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      setLiveComments(prev => [newComment, ...prev]);
      // This triggers re-render of ENTIRE app every 2-3 seconds!
    };
    return () => ws.close();
  }, []);

  // ❌ New object on every render
  const value = {
    user, setUser,
    theme, setTheme,
    followers, setFollowers,
    posts, setPosts,
    liveComments, setLiveComments,
    analytics, setAnalytics
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Components all consuming same context
function FollowerChart() {
  const { followers, theme } = useContext(DashboardContext);
  // Re-renders every 2-3 seconds due to liveComments updates!
  return <LineChart data={followers} theme={theme} />;
}

function PostList() {
  const { posts, theme } = useContext(DashboardContext);
  // Re-renders every 2-3 seconds!
  return posts.map(post => <PostCard key={post.id} post={post} />);
}

function LiveCommentFeed() {
  const { liveComments } = useContext(DashboardContext);
  return liveComments.map(comment => <Comment key={comment.id} {...comment} />);
}
```

**Performance Metrics (Before Optimization):**
```
Dashboard with 500 posts + 1,000 followers + live comments:

Metrics (every comment update, ~2-3 seconds):
- Total Blocking Time: 850ms
- Render phase: 680ms
- Commit phase: 170ms
- Components re-rendered: 1,547
  - FollowerChart: 1 (expensive D3 chart re-calculation)
  - PostList: 500 PostCard components
  - Sidebar: 20 components
  - Header: 8 components
  - LiveCommentFeed: 1,000+ comment components
- JavaScript Execution: 920ms
- Memory per update: +12MB
- Main thread blocked: 850ms per update
- FPS: 8fps (target: 60fps)
- User interaction delay: 800-1,200ms

Lighthouse Score:
- Performance: 24/100
- Total Blocking Time: 4,200ms (over 5s test)
- First Input Delay: 890ms
```

**User Experience Impact:**
- Scrolling felt laggy and janky
- Clicking buttons had 1+ second delay
- Charts "jumped" every few seconds (re-rendering)
- Typing in search box had severe input lag
- CPU usage: 95-100% constant

**Debugging Process:**

**Step 1: React DevTools Profiler**
```javascript
// Wrapped app in Profiler
import { Profiler } from 'react';

function Dashboard() {
  return (
    <Profiler id="Dashboard" onRender={onRenderCallback}>
      <DashboardProvider>
        <App />
      </DashboardProvider>
    </Profiler>
  );
}

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime, interactions
) {
  console.table({
    component: id,
    phase,
    renderTime: `${actualDuration.toFixed(2)}ms`,
    idealTime: `${baseDuration.toFixed(2)}ms`,
  });
}
```

**Output:**
```
Every 2-3 seconds:
┌─────────────────────┬─────────────┬────────────┐
│ Component           │ Render Time │ Ideal Time │
├─────────────────────┼─────────────┼────────────┤
│ Dashboard           │ 680.23ms    │ 45.12ms    │
│ FollowerChart       │ 230.45ms    │ 0.15ms     │
│ PostList            │ 380.67ms    │ 40.23ms    │
│ LiveCommentFeed     │ 45.34ms     │ 4.56ms     │
└─────────────────────┴─────────────┴────────────┘
```

**Key Finding:** Actual render time 15x higher than ideal. FollowerChart taking 230ms (should be <1ms on no-op renders).

**Step 2: React DevTools "Highlight Updates"**
Enabled "Highlight updates when components render" → **entire screen flashing every 2-3 seconds**.

**Step 3: Chrome DevTools Performance Profiling**
```
Call Stack (single comment update):
1. WebSocket onmessage: 2ms
2. setLiveComments: 1ms
3. DashboardProvider re-render: 5ms
4. Context value creation: 1ms
5. Context propagation: 3ms
6. FollowerChart re-render: 230ms
   ├─ D3 chart recalculation: 180ms
   ├─ SVG element diffing: 45ms
   └─ Layout thrashing: 5ms
7. PostList re-render: 380ms
   ├─ 500 PostCard reconciliations: 350ms
   └─ Image loading checks: 30ms
8. Other components: 60ms

Total: 680ms (main thread blocked)
```

**Root Cause Identified:**
1. Single context for all dashboard data
2. Live comment updates every 2-3 seconds
3. Context value not memoized (new object every update)
4. All components re-render on ANY context change
5. Expensive components (charts) recalculating unnecessarily

**Solution Implementation:**

**Fix 1: Split Contexts by Update Frequency**
```javascript
// ✅ Separate contexts
const ThemeContext = createContext();
const UserContext = createContext();
const FollowersContext = createContext();
const PostsContext = createContext();
const LiveCommentsContext = createContext();
const AnalyticsContext = createContext();

function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <FollowersProvider>
          <PostsProvider>
            <LiveCommentsProvider>
              <AnalyticsProvider>
                {children}
              </AnalyticsProvider>
            </LiveCommentsProvider>
          </PostsProvider>
        </FollowersProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function LiveCommentsProvider({ children }) {
  const [liveComments, setLiveComments] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('wss://api.socialanalytics.com/comments');
    ws.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      setLiveComments(prev => [newComment, ...prev.slice(0, 999)]); // Limit to 1000
    };
    return () => ws.close();
  }, []);

  // ✅ Memoized value
  const value = useMemo(
    () => ({ liveComments, setLiveComments }),
    [liveComments]
  );

  return (
    <LiveCommentsContext.Provider value={value}>
      {children}
    </LiveCommentsContext.Provider>
  );
}
```

**Fix 2: Memoize Expensive Components**
```javascript
// ✅ FollowerChart only re-renders when followers or theme change
const FollowerChart = memo(function FollowerChart() {
  const { followers } = useContext(FollowersContext);
  const { theme } = useContext(ThemeContext);

  // ✅ Memoize chart data calculation
  const chartData = useMemo(
    () => calculateChartData(followers),
    [followers]
  );

  return <LineChart data={chartData} theme={theme} />;
});

// ✅ PostCard only re-renders when post data changes
const PostCard = memo(function PostCard({ post }) {
  const { theme } = useContext(ThemeContext);
  return <article className={theme}>{post.content}</article>;
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if post ID or data changed
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.content === nextProps.post.content;
});
```

**Fix 3: Optimize LiveCommentFeed with Virtualization**
```javascript
import { FixedSizeList } from 'react-window';

function LiveCommentFeed() {
  const { liveComments } = useContext(LiveCommentsContext);

  return (
    <FixedSizeList
      height={600}
      itemCount={liveComments.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <Comment
          key={liveComments[index].id}
          comment={liveComments[index]}
          style={style}
        />
      )}
    </FixedSizeList>
  );
}

// ✅ Memoized comment component
const Comment = memo(({ comment, style }) => {
  return (
    <div style={style}>
      <strong>{comment.author}</strong>: {comment.text}
    </div>
  );
});
```

**Fix 4: Debounce High-Frequency Updates**
```javascript
function LiveCommentsProvider({ children }) {
  const [liveComments, setLiveComments] = useState([]);
  const pendingCommentsRef = useRef([]);

  useEffect(() => {
    const ws = new WebSocket('wss://api.socialanalytics.com/comments');

    ws.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      pendingCommentsRef.current.push(newComment);
    };

    // ✅ Batch updates every 500ms instead of every comment
    const interval = setInterval(() => {
      if (pendingCommentsRef.current.length > 0) {
        setLiveComments(prev => [
          ...pendingCommentsRef.current,
          ...prev.slice(0, 1000 - pendingCommentsRef.current.length)
        ]);
        pendingCommentsRef.current = [];
      }
    }, 500);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({ liveComments, setLiveComments }),
    [liveComments]
  );

  return (
    <LiveCommentsContext.Provider value={value}>
      {children}
    </LiveCommentsContext.Provider>
  );
}
```

**Performance Metrics (After Optimization):**
```
Dashboard with 500 posts + 1,000 followers + live comments:

Metrics (every comment batch, ~500ms):
- Total Blocking Time: 28ms (97% improvement)
- Render phase: 18ms (97% improvement)
- Commit phase: 10ms (94% improvement)
- Components re-rendered: 12 (99% improvement)
  - LiveCommentFeed: 1 (only new comments via virtualization)
  - Header comment counter: 1
  - No FollowerChart re-renders
  - No PostList re-renders
- JavaScript Execution: 32ms (96% improvement)
- Memory per update: +0.3MB (97% improvement)
- Main thread blocked: 28ms (97% improvement)
- FPS: 57fps (612% improvement)
- User interaction delay: 15-30ms (97% improvement)

Lighthouse Score:
- Performance: 94/100 (292% improvement)
- Total Blocking Time: 180ms (96% improvement)
- First Input Delay: 24ms (97% improvement)
```

**Side-by-side Comparison:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Render Time | 680ms | 18ms | 97% |
| Re-renders | 1,547 | 12 | 99% |
| FPS | 8fps | 57fps | 612% |
| Memory/Update | +12MB | +0.3MB | 97% |
| Input Delay | 890ms | 24ms | 97% |
| Lighthouse | 24/100 | 94/100 | 292% |

**Key Learnings:**
1. **Context granularity is critical**: Split by update frequency and domain
2. **Memoization is mandatory**: Use `useMemo` for context values, `memo()` for components
3. **Debounce high-frequency updates**: Batch updates to reduce re-render frequency
4. **Virtualization for large lists**: Don't render 1,000+ DOM nodes
5. **Profile before optimizing**: React DevTools Profiler reveals the real bottlenecks

**Additional Optimization: Code Splitting**
```javascript
// Lazy load expensive chart component
const FollowerChart = lazy(() => import('./FollowerChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <FollowerChart />
    </Suspense>
  );
}
```

This reduced initial bundle size by 120KB and improved Time to Interactive by 400ms.

### ⚖️ Trade-offs

**Performance Optimization Trade-offs:**

**1. Context Splitting vs Code Complexity**

**Single Context:**
```javascript
// ✅ Simple, easy to understand
const AppContext = createContext();

function App() {
  const [state, setState] = useState({ theme: 'light', user: null });
  return (
    <AppContext.Provider value={{ state, setState }}>
      <Dashboard />
    </AppContext.Provider>
  );
}
```

**Pros:**
- Simple mental model
- Easy to add new state
- Less boilerplate
- Single Provider to wrap

**Cons:**
- All consumers re-render on any change
- Poor performance for large apps
- No granular control over updates

**Split Contexts:**
```javascript
// ⚖️ More complex, but performant
const ThemeContext = createContext();
const UserContext = createContext();
const DataContext = createContext();

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <DataProvider>
          <Dashboard />
        </DataProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

**Pros:**
- Excellent performance (granular updates)
- Components only re-render when needed
- Clear separation of concerns

**Cons:**
- More boilerplate
- "Provider hell" (nested Providers)
- More files to maintain
- Need to know which context to use where

**Decision Matrix:**
- **Use single context**: Small apps (<50 components), infrequent updates
- **Use split contexts**: Medium-large apps (50+ components), frequent updates
- **Use state management library**: Large apps (200+ components), complex state logic

---

**2. Manual Memoization vs Automatic (Redux/Zustand)**

**Context with Manual Memoization:**
```javascript
function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // ⚖️ Must remember to memoize
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ⚖️ Must remember to memoize components
const UserProfile = memo(() => {
  const { user } = useContext(UserContext);
  return <div>{user?.name}</div>;
});
```

**Pros:**
- No external dependencies
- Full control over optimization
- Works with Server Components (React 18+)

**Cons:**
- Easy to forget memoization
- Verbose (useMemo, useCallback, memo everywhere)
- Performance bugs hard to spot (forgotten memo)
- Manual optimization required

**Redux with Built-in Selectors:**
```javascript
import { useSelector } from 'react-redux';

// ✅ Automatic optimization (no memo needed)
function UserProfile() {
  const user = useSelector(state => state.user);
  // Only re-renders when state.user changes (built-in shallow comparison)
  return <div>{user?.name}</div>;
}
```

**Pros:**
- Automatic optimization
- No manual memoization needed
- Selector pattern enforced
- Less room for performance bugs

**Cons:**
- External dependency (+47KB)
- More boilerplate (actions, reducers)
- Steeper learning curve
- Doesn't work with Server Components (yet)

**Zustand (Best of Both Worlds):**
```javascript
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// ✅ Automatic optimization, minimal boilerplate
function UserProfile() {
  const user = useStore(state => state.user);
  return <div>{user?.name}</div>;
}
```

**Pros:**
- Minimal boilerplate
- Automatic optimization
- Small bundle (+1KB)
- Works with Server Components

**Cons:**
- External dependency (though tiny)
- Smaller ecosystem than Redux
- Less DevTools support

**Performance Benchmark (10,000 components, 100 state updates):**

| Solution | Total Render Time | Re-renders | Bundle Size | Code Lines |
|----------|-------------------|------------|-------------|------------|
| Context (no memo) | 8,200ms | 1,000,000 | 0KB | 50 |
| Context (with memo) | 180ms | 1,000 | 0KB | 120 |
| Redux Toolkit | 150ms | 1,000 | 47KB | 180 |
| Zustand | 145ms | 1,000 | 1KB | 60 |

**Recommendation:**
- **Small apps (<1,000 components)**: Context with manual memoization
- **Medium apps (1,000-5,000 components)**: Zustand
- **Large apps (5,000+ components) or complex state**: Redux Toolkit

---

**3. Composition vs Context**

**Problem: Avoid re-renders of large subtrees**

**Context Approach:**
```javascript
// ❌ Theme changes re-render entire app
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main>
        <Sidebar />
        <Content />
        <Footer />
      </Main>
    </ThemeContext.Provider>
  );
}

// All these components consume theme context
function Header() {
  const theme = useContext(ThemeContext);
  return <header className={theme}>...</header>;
}

function Sidebar() {
  const theme = useContext(ThemeContext);
  return <aside className={theme}>...</aside>;
}

// When theme changes, entire app re-renders
```

**Composition Approach:**
```javascript
// ✅ Theme changes only re-render App, children don't re-render
function App() {
  const [theme, setTheme] = useState('light');

  // Children are already rendered before theme changes
  return (
    <div className={theme}>
      <Header />
      <Main>
        <Sidebar />
        <Content />
        <Footer />
      </Main>
    </div>
  );
}

// These components don't need to know about theme
function Header() {
  return <header>...</header>; // CSS inherits theme via className on parent
}
```

**Performance Comparison (theme toggle):**

| Approach | Re-renders | Render Time |
|----------|------------|-------------|
| Context | 47 components | 120ms |
| Composition | 1 component (App) | 8ms |

**Composition with Children Prop:**
```javascript
// ✅ Optimal pattern
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // children is already rendered, won't re-render on theme change
  return <div className={theme}>{children}</div>;
}

function App() {
  return (
    <ThemeProvider>
      <Header />      {/* Rendered once */}
      <Main />        {/* Rendered once */}
      <Footer />      {/* Rendered once */}
    </ThemeProvider>
  );
}
```

**When theme changes:**
- ThemeProvider re-renders
- div gets new className
- children prop reference is stable (same elements)
- React skips re-rendering children

**Decision Matrix:**
- **Use Composition**: When parent state doesn't need to be accessed deep in tree (styling, layout)
- **Use Context**: When many deeply nested components need to read/write state

---

**4. Context vs URL State**

**Problem: Filters for data table**

**Context Approach:**
```javascript
const FilterContext = createContext();

function DataTable() {
  const [filters, setFilters] = useState({ search: '', category: 'all' });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      <FilterSidebar />
      <DataGrid />
    </FilterContext.Provider>
  );
}
```

**Pros:**
- Simple implementation
- Works without routing

**Cons:**
- Filters lost on refresh
- Can't share filtered view (no URL)
- Can't bookmark or back-navigate

**URL State Approach (Next.js):**
```javascript
import { useRouter } from 'next/router';

function DataTable() {
  const router = useRouter();
  const filters = {
    search: router.query.search || '',
    category: router.query.category || 'all'
  };

  const setFilters = (newFilters) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, ...newFilters }
    }, undefined, { shallow: true });
  };

  return (
    <>
      <FilterSidebar filters={filters} setFilters={setFilters} />
      <DataGrid filters={filters} />
    </>
  );
}
```

**Pros:**
- Shareable URLs (`/products?category=electronics&search=laptop`)
- Survives refresh
- Browser back/forward works
- Bookmarkable

**Cons:**
- Tied to routing (need router)
- URL length limits
- Serialization constraints (strings only)

**Decision Matrix:**
- **Use Context**: Ephemeral UI state (modal open, accordion expanded)
- **Use URL**: Shareable state (filters, pagination, tabs)

---

**5. Server vs Client Context (React Server Components)**

**Client Context (React 18 App Router):**
```javascript
'use client'; // ⚠️ Required for context

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Trade-offs:**
- **Pros**: Interactive, can use hooks
- **Cons**: Client-side only, increases bundle size, no SSR benefits

**Server Components Alternative:**
```javascript
// ✅ No context needed, just pass props
async function Layout({ children }) {
  const theme = cookies().get('theme')?.value || 'light';

  return (
    <div className={theme}>
      {children}
    </div>
  );
}
```

**Pros:**
- Zero JavaScript to client
- SEO-friendly
- Fast initial load

**Cons:**
- No interactivity (need Client Component for setTheme)
- Can't use React state

**Hybrid Approach:**
```javascript
// Server Component (no 'use client')
async function Layout({ children }) {
  const theme = cookies().get('theme')?.value || 'light';

  return (
    <div className={theme}>
      <ThemeToggle initialTheme={theme} /> {/* Client Component */}
      {children}
    </div>
  );
}

// Client Component
'use client';
function ThemeToggle({ initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  // Update cookie when theme changes
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

**Decision Matrix:**
- **Server Components**: Static data, SEO-critical, no interactivity needed
- **Client Context**: Interactive UI, user-specific state, real-time updates

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're organizing a big party with 100 guests. You need to tell everyone the party theme ("tropical beach").

**Bad Approach (No Memoization):**
Every time someone new arrives, you announce the theme to EVERYONE again, even though it hasn't changed. Exhausting!

**Good Approach (Memoization):**
You write the theme on a big whiteboard at the entrance. Only change the whiteboard when the theme actually changes. People check it once and remember.

**Real-World Example:**

**Scenario:** You're building a shopping app with a theme toggle (light/dark mode).

**Without Optimization:**
```javascript
// ❌ BAD: Every component re-renders on theme change
function App() {
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([/* 1,000 products */]);

  // New object every time App re-renders (even if theme unchanged)
  const value = { theme, setTheme, cart, setCart, products, setProducts };

  return (
    <AppContext.Provider value={value}>
      <ProductList /> {/* 1,000 products */}
      <Cart />
      <ThemeToggle />
    </AppContext.Provider>
  );
}

function ProductList() {
  const { products } = useContext(AppContext);
  // Re-renders when theme changes, even though it doesn't use theme!
  return products.map(p => <ProductCard key={p.id} product={p} />);
}
```

**Result:** Clicking theme toggle re-renders all 1,000 products. Laggy!

**With Optimization:**
```javascript
// ✅ GOOD: Split contexts
const ThemeContext = createContext();
const CartContext = createContext();
const ProductsContext = createContext();

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <ProductsProvider>
          <ProductList />
          <Cart />
          <ThemeToggle />
        </ProductsProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // ✅ Only create new object when theme actually changes
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function ProductList() {
  const { products } = useContext(ProductsContext);
  // Only re-renders when products change, NOT on theme change!
  return products.map(p => <ProductCard key={p.id} product={p} />);
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  // Only this component re-renders on theme change
  return <button onClick={() => setTheme('dark')}>Toggle</button>;
}
```

**Result:** Clicking theme toggle only re-renders ThemeToggle. Fast!

**Common Beginner Mistakes:**

**Mistake 1: Forgetting useMemo**
```javascript
// ❌ BAD: New object every render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ GOOD: Memoized
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

**Why it matters:**
```javascript
{ user, setUser } === { user, setUser } // false! (new object every time)

const obj1 = { user, setUser };
const obj2 = obj1;
obj1 === obj2 // true (same reference)
```

React compares context values with `Object.is()`. New object = all consumers re-render.

**Mistake 2: Putting Everything in One Context**
```javascript
// ❌ BAD: Kitchen sink context
const AppContext = createContext({
  theme: 'light',
  user: null,
  cart: [],
  products: [],
  settings: {},
  notifications: []
});

// Component only needs theme, but re-renders when cart updates
function Header() {
  const { theme } = useContext(AppContext);
  return <header className={theme}>My App</header>;
}

// ✅ GOOD: Separate contexts
const ThemeContext = createContext('light');
const CartContext = createContext([]);

function Header() {
  const theme = useContext(ThemeContext);
  // Only re-renders when theme changes, NOT on cart updates
  return <header className={theme}>My App</header>;
}
```

**Mistake 3: Not Using memo() for Expensive Components**
```javascript
// ❌ BAD: Chart recalculates on every parent re-render
function ExpensiveChart() {
  const { data } = useContext(DataContext);
  const chartData = calculateExpensiveChart(data); // 200ms calculation
  return <BarChart data={chartData} />;
}

// ✅ GOOD: Memoize component and calculation
const ExpensiveChart = memo(() => {
  const { data } = useContext(DataContext);
  const chartData = useMemo(
    () => calculateExpensiveChart(data),
    [data]
  );
  return <BarChart data={chartData} />;
});
```

**Simple Performance Check:**

**Before optimizing:**
1. Open React DevTools
2. Enable "Highlight updates when components render"
3. Change some state
4. Watch how much of the screen flashes

**Goal:** Only components that NEED the changed data should flash.

**Interview Answer Template:**

"Context API has performance implications because all consumers re-render when the context value changes, even if they don't use the changed part. This is different from Redux which has built-in selector optimization.

To optimize Context performance, I follow these strategies:

1. **Split contexts**: Separate by update frequency (theme context, cart context, user context)
2. **Memoize values**: Use `useMemo` for context values to prevent unnecessary re-renders
3. **Separate state and dispatch**: Use separate contexts so components that only dispatch don't re-render
4. **Memoize components**: Wrap expensive components in `React.memo`

In my last project, we had performance issues with a dashboard re-rendering thousands of components on every update. We split one large context into five smaller contexts and memoized the values, which reduced render time from 800ms to 45ms.

For large-scale apps with frequent updates, I'd consider Redux or Zustand which have built-in optimization, but for small-to-medium apps, optimized Context works great."

**When Asked: "Context vs Redux?"**

"Context is built into React (zero dependencies) and great for simple global state like theme or authentication. Redux is better for complex state logic with frequent updates because it has built-in selector optimization and middleware.

I choose Context when I need simple state sharing with infrequent updates, and Redux when I need advanced features like time-travel debugging, middleware, or when the app has very complex state logic."

**Red Flags in Interviews:**
- ❌ "Context is slower than props" (technically true but missing the point)
- ❌ "Always use Redux instead of Context" (overkill for small apps)
- ✅ "Context requires manual optimization, but works great when optimized properly"
- ✅ "Split contexts by concern and memoize values for best performance"
