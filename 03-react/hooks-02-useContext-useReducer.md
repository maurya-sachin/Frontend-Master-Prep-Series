# React Hooks - useContext and useReducer

> Master useContext and useReducer for advanced state management patterns

---

## Question 1: How does useContext work and when should you use it?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Netflix, Airbnb

### Question
Explain the useContext hook. How does it solve prop drilling? When should you use Context vs props? What are the performance implications?

### Answer

`useContext` provides a way to pass data through the component tree without having to pass props down manually at every level (solving "prop drilling").

**1. Basic Concept**
   - Creates global state accessible to any component in the tree
   - Consumer components re-render when context value changes
   - Eliminates intermediate prop passing
   - Combines with Provider pattern

**2. When to Use Context**
   - Theme configuration (dark/light mode)
   - User authentication state
   - Locale/language preferences
   - Global app settings
   - Features needed by many components at different nesting levels

**3. When NOT to Use Context**
   - Frequently changing values (performance issues)
   - Props only needed by 1-2 levels down
   - Component-specific state
   - Data that doesn't need global access

**4. Performance Considerations**
   - ALL consumers re-render when value changes
   - No built-in optimization
   - Split contexts by change frequency
   - Use useMemo to prevent unnecessary value changes

### Code Example

```javascript
import { createContext, useContext, useState, useMemo } from 'react';

// ===== BASIC USAGE =====

// 1. Create Context
const ThemeContext = createContext(undefined);

// 2. Create Provider Component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create Custom Hook for Type Safety
function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

// 4. Consume Context
function ThemedButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme ({theme})
    </button>
  );
}

// 5. App Structure
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

// ===== AUTHENTICATION EXAMPLE =====

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const login = async (credentials) => {
    const user = await loginAPI(credentials);
    setUser(user);
  };

  const logout = async () => {
    await logoutAPI();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, loading }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
}

// ===== MULTIPLE CONTEXTS =====

// Split by concern and change frequency
const UserContext = createContext();
const SettingsContext = createContext();
const NotificationsContext = createContext();

function AppProviders({ children }) {
  return (
    <UserProvider>
      <SettingsProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </SettingsProvider>
    </UserProvider>
  );
}

// Components can consume multiple contexts
function UserProfile() {
  const { user } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { notifications } = useContext(NotificationsContext);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Theme: {settings.theme}</p>
      <p>Unread: {notifications.unread.length}</p>
    </div>
  );
}

// ===== CONTEXT WITH REDUCER =====

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const value = useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ===== PERFORMANCE OPTIMIZATION =====

// ❌ BAD: Inline object causes all consumers to re-render
function BadProvider({ children }) {
  const [state, setState] = useState({});

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ GOOD: Memoized value prevents unnecessary re-renders
function GoodProvider({ children }) {
  const [state, setState] = useState({});

  const value = useMemo(
    () => ({ state, setState }),
    [state]
  );

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ BETTER: Split contexts by change frequency
const DataContext = createContext(); // Changes often
const ActionsContext = createContext(); // Never changes

function OptimizedProvider({ children }) {
  const [data, setData] = useState({});

  // Actions don't depend on data - can be memoized once
  const actions = useMemo(
    () => ({
      update: (newData) => setData(newData),
      reset: () => setData({})
    }),
    []
  );

  return (
    <DataContext.Provider value={data}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </DataContext.Provider>
  );
}

// Components only re-render when their context changes
function DataDisplay() {
  const data = useContext(DataContext); // Re-renders when data changes
  return <div>{JSON.stringify(data)}</div>;
}

function ActionButtons() {
  const actions = useContext(ActionsContext); // Never re-renders
  return <button onClick={actions.reset}>Reset</button>;
}
```

### Common Mistakes

❌ **Mistake 1:** Not checking if context exists
```javascript
function useMyContext() {
  return useContext(MyContext); // ❌ No validation
}

// Component renders with undefined context
function Component() {
  const { data } = useMyContext(); // ❌ Runtime error!
}
```

❌ **Mistake 2:** Creating new objects in Provider value
```javascript
function Provider({ children }) {
  const [state, setState] = useState({});

  // ❌ New object on every render = all consumers re-render
  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
}
```

❌ **Mistake 3:** Using context for frequently changing values
```javascript
// ❌ Mouse position changes 60 times/second
function MouseProvider({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // ❌ All consumers re-render 60 times/second!
  return (
    <MouseContext.Provider value={position}>
      {children}
    </MouseContext.Provider>
  );
}
```

✅ **Correct:** Validate context, memoize values, use appropriate tools
```javascript
// ✅ Custom hook with validation
function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}

// ✅ Memoize provider value
function Provider({ children }) {
  const [state, setState] = useState({});

  const value = useMemo(
    () => ({ state, setState }),
    [state]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// ✅ Use ref or event listeners for high-frequency updates
function MouseTracker() {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Access position when needed, doesn't trigger re-renders
  return <div>Move your mouse</div>;
}
```

---

### 🔍 Deep Dive: Context Implementation & Fiber Architecture

**How Context Works Internally**

The Context API is built on React's Fiber architecture. Understanding the internals helps optimize usage and debug performance issues.

**1. Context Propagation Mechanism**

```javascript
// Simplified React internal representation
class FiberNode {
  constructor() {
    this.memoizedState = null; // Component state/hooks
    this.dependencies = null;  // Context dependencies
    this.child = null;         // First child
    this.sibling = null;       // Next sibling
    this.return = null;        // Parent
  }
}

// When Provider renders
function updateContextProvider(workInProgress, context, newValue) {
  const oldValue = workInProgress.memoizedProps.value;

  // Check if value changed (using Object.is comparison)
  if (Object.is(oldValue, newValue)) {
    return; // Skip propagation if unchanged
  }

  // Mark all consumers in subtree as needing update
  propagateContextChange(workInProgress, context, newValue);
}

// Propagation walks the fiber tree
function propagateContextChange(workInProgress, context, newValue) {
  let fiber = workInProgress.child;

  while (fiber !== null) {
    // Check if this fiber consumes the context
    const dependencies = fiber.dependencies;

    if (dependencies !== null) {
      let dependency = dependencies.firstContext;

      while (dependency !== null) {
        if (dependency.context === context) {
          // Found a consumer! Schedule update
          scheduleUpdateOnFiber(fiber);
        }
        dependency = dependency.next;
      }
    }

    // Continue traversing tree
    fiber = fiber.child || fiber.sibling || fiber.return?.sibling;
  }
}
```

**Key Insight:** Context uses Object.is() for comparison, not deep equality. This is why inline objects cause unnecessary re-renders.

```javascript
// Understanding Object.is() comparison
const obj1 = { theme: 'dark' };
const obj2 = { theme: 'dark' };

Object.is(obj1, obj2); // false - different references
Object.is(obj1, obj1); // true - same reference

// This is why this causes re-renders
<Provider value={{ theme: 'dark' }}>  // ❌ New object every render

// While this doesn't
const value = useMemo(() => ({ theme: 'dark' }), []); // ✅ Same reference
<Provider value={value}>
```

**2. Context Subscription Algorithm**

When a component calls `useContext(MyContext)`, React:

1. **Adds dependency to fiber node**
```javascript
function readContext(context) {
  const value = context._currentValue;

  // Add to fiber's dependency list
  const contextItem = {
    context: context,
    next: null,
    memoizedValue: value
  };

  if (currentlyRenderingFiber.dependencies === null) {
    currentlyRenderingFiber.dependencies = {
      lanes: NoLanes,
      firstContext: contextItem
    };
  } else {
    lastContextDependency.next = contextItem;
  }

  lastContextDependency = contextItem;
  return value;
}
```

2. **Checks for updates during render**
```javascript
function updateFunctionComponent(current, workInProgress) {
  const dependencies = workInProgress.dependencies;

  if (dependencies !== null) {
    let dependency = dependencies.firstContext;

    while (dependency !== null) {
      const context = dependency.context;
      const newValue = context._currentValue;
      const oldValue = dependency.memoizedValue;

      if (!Object.is(newValue, oldValue)) {
        // Context changed! Component needs to re-render
        return true;
      }

      dependency = dependency.next;
    }
  }

  return false;
}
```

**3. Provider Stack Mechanism**

React maintains a stack of Provider values to handle nested Providers:

```javascript
// Global stack (simplified)
const contextStack = [];

function pushProvider(context, nextValue) {
  // Save previous value
  contextStack.push({
    context: context,
    value: context._currentValue
  });

  // Set new value
  context._currentValue = nextValue;
}

function popProvider(context) {
  // Restore previous value
  const stackEntry = contextStack.pop();
  context._currentValue = stackEntry.value;
}

// Example with nested providers
<ThemeContext.Provider value="dark">     {/* Stack: [dark] */}
  <Component />                          {/* Reads: dark */}
  <ThemeContext.Provider value="light">  {/* Stack: [dark, light] */}
    <Component />                        {/* Reads: light */}
  </ThemeContext.Provider>               {/* Stack: [dark] */}
  <Component />                          {/* Reads: dark */}
</ThemeContext.Provider>                 {/* Stack: [] */}
```

**4. Performance Characteristics**

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| Create Context | O(1) | Just creates object |
| Provider render | O(n) | Walks fiber tree to find consumers |
| useContext call | O(1) | Reads from fiber dependency |
| Value change | O(consumers) | Re-renders all consumers |

**Real-World Performance Example:**

```javascript
// Measuring context performance
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="ThemeProvider" onRender={onRenderCallback}>
      <ThemeProvider>
        <DeepComponentTree /> {/* 1000 components */}
      </ThemeProvider>
    </Profiler>
  );
}

// Benchmark Results:
// Initial render: ~150ms
// Theme change (all consumers): ~120ms
// Theme change (split context): ~40ms (67% faster)
```

**5. Advanced Optimization: Context Selectors**

React doesn't provide built-in context selectors, but you can build them:

```javascript
// Custom implementation of context selectors
function createContextWithSelector() {
  const Context = createContext();

  function Provider({ value, children }) {
    const listeners = useRef(new Set());

    const contextValue = useMemo(() => ({
      value,
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      }
    }), [value]);

    // Notify only affected subscribers
    useEffect(() => {
      listeners.current.forEach(listener => listener(value));
    }, [value]);

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  }

  function useContextSelector(selector) {
    const context = useContext(Context);
    const [state, setState] = useState(() => selector(context.value));

    useEffect(() => {
      return context.subscribe((newValue) => {
        const newState = selector(newValue);
        if (!Object.is(state, newState)) {
          setState(newState);
        }
      });
    }, [context, selector, state]);

    return state;
  }

  return { Provider, useContextSelector };
}

// Usage: Only re-renders when selected value changes
const { Provider, useContextSelector } = createContextWithSelector();

function UserName() {
  // Only re-renders when name changes, not when age/email change
  const name = useContextSelector(state => state.user.name);
  return <div>{name}</div>;
}
```

**6. Memory Implications**

```javascript
// Each context consumer adds to fiber's dependency list
function ComponentWithMultipleContexts() {
  const theme = useContext(ThemeContext);     // +1 dependency
  const auth = useContext(AuthContext);       // +2 dependencies
  const settings = useContext(SettingsContext); // +3 dependencies
  const notifications = useContext(NotificationsContext); // +4 dependencies

  // Fiber node dependencies list grows
  // Memory: ~40 bytes per dependency
  // 4 contexts = ~160 bytes overhead per component
}

// With 1000 components consuming 4 contexts each:
// Memory overhead: 1000 × 160 bytes = 156 KB
```

**Best Practices from Internals:**

1. **Memoize provider values** - Object.is() comparison means new objects always trigger updates
2. **Split contexts** - Separate fast-changing from slow-changing data
3. **Avoid deep nesting** - Each provider level adds stack overhead
4. **Limit consumers** - More consumers = slower propagation
5. **Use refs for high-frequency** - Context isn't designed for 60fps updates

---

### 🐛 Real-World Scenario: E-Commerce Cart Context Performance Crisis

**Background:**
ShopFast, a high-traffic e-commerce platform (2M DAU), experienced severe performance degradation after implementing a global cart context. Users reported 3-5 second delays when adding items to cart.

**Initial Implementation:**

```javascript
// ❌ PROBLEMATIC IMPLEMENTATION
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discounts, setDiscounts] = useState([]);

  // Calculate total whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotalPrice(total);
  }, [items]);

  // Fetch recommendations whenever items change
  useEffect(() => {
    if (items.length > 0) {
      fetch('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ items })
      })
        .then(res => res.json())
        .then(setRecommendations);
    }
  }, [items]);

  // Check for discounts
  useEffect(() => {
    fetch('/api/discounts', {
      method: 'POST',
      body: JSON.stringify({ items, totalPrice })
    })
      .then(res => res.json())
      .then(setDiscounts);
  }, [items, totalPrice]);

  // ❌ PROBLEM: New object on every render
  return (
    <CartContext.Provider value={{
      items,
      loading,
      error,
      recommendations,
      totalPrice,
      discounts,
      setItems,
      setLoading,
      setError
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Multiple consumers across app
function Header() {
  const { items } = useContext(CartContext); // Just needs count
  return <CartIcon count={items.length} />;
}

function ProductRecommendations() {
  const { recommendations } = useContext(CartContext);
  return recommendations.map(/* render */);
}

function CheckoutSummary() {
  const { totalPrice, discounts } = useContext(CartContext);
  return <div>Total: ${totalPrice}</div>;
}
```

**Performance Metrics (Before Fix):**

```
Performance Analysis (Chrome DevTools):
- Add to cart action: 3,247ms
  - CartProvider re-render: 145ms
  - 127 child components re-rendered: 2,890ms
  - API calls: 212ms

- Total re-renders per cart update: 127 components
- Scripting time: 3,035ms (95% of total)
- Main thread blocked: 3.2 seconds

Lighthouse Score:
- Performance: 32/100 (❌ Critical)
- Time to Interactive: 8.4s
- Total Blocking Time: 3,200ms

User Impact:
- Cart abandonment rate: 47% (industry avg: 28%)
- Support tickets: +340% ("app is frozen")
- Revenue impact: -$2.1M/month
```

**Root Cause Analysis:**

```javascript
// Profiling revealed the issues
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration) {
  console.log({
    component: id,
    phase,
    actualDuration,
    baseDuration,
    wastedTime: actualDuration - baseDuration
  });
}

// Results:
// CartProvider re-renders: 1 time
// Child components re-rendered: 127 times
// Wasted renders: 104 components (82%)
//   - Components not using cart data
//   - Components only needing item count
//   - Components only needing totalPrice

// Why ALL components re-rendered:
// 1. Provider value is new object every render
// 2. All consumers subscribe to entire context
// 3. Cascading useEffects trigger more state updates
// 4. Each state update triggers new Provider re-render
```

**Debugging Process:**

```javascript
// Step 1: Identify re-render cascade
function CartProvider({ children }) {
  console.log('CartProvider render');

  const [items, setItems] = useState(() => {
    console.log('items state init');
    return [];
  });

  useEffect(() => {
    console.log('totalPrice effect running');
    // ... calculates total
    // This triggers ANOTHER Provider render
  }, [items]);

  useEffect(() => {
    console.log('recommendations effect running');
    // This triggers ANOTHER Provider render
  }, [items]);

  // Console output on "Add to Cart":
  // CartProvider render (1)
  // items state init
  // CartProvider render (2) - from setItems
  // totalPrice effect running
  // CartProvider render (3) - from setTotalPrice
  // recommendations effect running
  // CartProvider render (4) - from setRecommendations
  // discounts effect running
  // CartProvider render (5) - from setDiscounts
}

// Step 2: Measure component re-renders
function Header() {
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`Header render #${renderCount.current}`);
  const { items } = useContext(CartContext);

  // Renders 5 times for single "Add to Cart" action!
  return <CartIcon count={items.length} />;
}
```

**Solution: Split Contexts + Memoization + Derived State**

```javascript
// ✅ OPTIMIZED SOLUTION

// 1. Split contexts by concern and change frequency
const CartDataContext = createContext();
const CartActionsContext = createContext();
const CartMetadataContext = createContext();

function CartProvider({ children }) {
  // Core cart data (changes frequently)
  const [items, setItems] = useState([]);

  // Metadata (changes less frequently)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Derived state - computed from items
  const cartMetadata = useMemo(() => {
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { totalPrice, itemCount };
  }, [items]);

  // Actions (never change - no dependencies)
  const actions = useMemo(() => ({
    addItem: (item) => {
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    },

    removeItem: (itemId) => {
      setItems(prev => prev.filter(i => i.id !== itemId));
    },

    updateQuantity: (itemId, quantity) => {
      setItems(prev =>
        prev.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    },

    clearCart: () => setItems([])
  }), []); // Empty deps - actions never change

  // Debounced API calls
  useEffect(() => {
    if (items.length === 0) return;

    const timer = setTimeout(() => {
      fetch('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ items })
      })
        .then(res => res.json())
        .then(setRecommendations);
    }, 500); // Wait 500ms after last change

    return () => clearTimeout(timer);
  }, [items]);

  // Separate metadata context value
  const metadataValue = useMemo(() => ({
    ...cartMetadata,
    recommendations,
    loading,
    error
  }), [cartMetadata, recommendations, loading, error]);

  return (
    <CartDataContext.Provider value={items}>
      <CartActionsContext.Provider value={actions}>
        <CartMetadataContext.Provider value={metadataValue}>
          {children}
        </CartMetadataContext.Provider>
      </CartActionsContext.Provider>
    </CartDataContext.Provider>
  );
}

// Custom hooks for type safety and convenience
function useCartData() {
  const context = useContext(CartDataContext);
  if (context === undefined) {
    throw new Error('useCartData must be used within CartProvider');
  }
  return context;
}

function useCartActions() {
  const context = useContext(CartActionsContext);
  if (context === undefined) {
    throw new Error('useCartActions must be used within CartProvider');
  }
  return context;
}

function useCartMetadata() {
  const context = useContext(CartMetadataContext);
  if (context === undefined) {
    throw new Error('useCartMetadata must be used within CartProvider');
  }
  return context;
}

// Selective context consumption
function Header() {
  const { itemCount } = useCartMetadata(); // Only metadata
  return <CartIcon count={itemCount} />;
}

function ProductCard({ product }) {
  const { addItem } = useCartActions(); // Only actions
  return <button onClick={() => addItem(product)}>Add to Cart</button>;
}

function CheckoutSummary() {
  const items = useCartData(); // Full cart data
  const { totalPrice } = useCartMetadata(); // Metadata

  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name} x {item.quantity}</li>
        ))}
      </ul>
      <div>Total: ${totalPrice}</div>
    </div>
  );
}
```

**Results After Optimization:**

```
Performance Analysis (After):
- Add to cart action: 187ms (94% faster ✅)
  - CartProvider re-render: 8ms
  - 3 child components re-rendered: 12ms
  - API calls: 167ms (debounced)

- Total re-renders per cart update: 3 components (was 127)
- Scripting time: 20ms (was 3,035ms)
- Main thread blocked: 0ms (was 3,200ms)

Lighthouse Score:
- Performance: 94/100 (✅ Excellent)
- Time to Interactive: 1.2s (was 8.4s)
- Total Blocking Time: 0ms (was 3,200ms)

User Impact:
- Cart abandonment rate: 29% (was 47%)
- Support tickets: -85%
- Revenue recovery: +$2.4M/month

Key Improvements:
- 94% faster add-to-cart
- 97% fewer re-renders
- 100% less main thread blocking
- 18% absolute improvement in conversion
```

**Lessons Learned:**

1. **Split contexts by update frequency**
   - Actions context (never changes)
   - Data context (changes frequently)
   - Metadata context (derived, changes less)

2. **Always memoize provider values**
   - Use useMemo for context value objects
   - Prevents unnecessary re-renders from reference changes

3. **Compute derived state in provider**
   - Don't use multiple useState for related data
   - Calculate totalPrice from items directly

4. **Debounce expensive operations**
   - API calls don't need to fire on every change
   - Use setTimeout to batch updates

5. **Monitor re-renders in production**
   - Use React DevTools Profiler
   - Track component render counts
   - Identify wasted renders

---

<details>
<summary><strong>⚖️ Trade-offs: Context vs State Management Libraries</strong></summary>

When choosing between Context API and libraries like Redux, Zustand, or Jotai, consider these factors:

**Context API**

**Pros:**
- ✅ Built into React (no additional dependencies)
- ✅ Simple API (createContext, Provider, useContext)
- ✅ Excellent for relatively stable data (theme, auth, i18n)
- ✅ Type-safe with TypeScript
- ✅ No boilerplate for simple use cases
- ✅ Easy to test (just wrap with Provider)
- ✅ Zero bundle size impact

**Cons:**
- ❌ No built-in optimization (all consumers re-render)
- ❌ No devtools for debugging state changes
- ❌ No middleware support
- ❌ No time-travel debugging
- ❌ Performance issues with frequent updates
- ❌ Can't prevent re-renders without manual optimization
- ❌ No selector optimization

**Redux**

**Pros:**
- ✅ Selector optimization (useSelector with shallow equality)
- ✅ Middleware ecosystem (thunk, saga, persist)
- ✅ Excellent devtools (time-travel, state inspection)
- ✅ Predictable state updates (single store)
- ✅ Well-established patterns
- ✅ Great for complex state logic

**Cons:**
- ❌ Significant boilerplate (actions, reducers, types)
- ❌ Learning curve (middleware, thunks, sagas)
- ❌ Bundle size (~12 KB + middleware)
- ❌ Can be overkill for simple apps
- ❌ Async handling requires middleware

**Zustand**

**Pros:**
- ✅ Minimal boilerplate (simple store creation)
- ✅ Built-in selector optimization
- ✅ Tiny bundle size (~1 KB)
- ✅ No Context Provider needed
- ✅ Devtools support
- ✅ Middleware support
- ✅ Works outside React

**Cons:**
- ❌ Less mature ecosystem than Redux
- ❌ Smaller community
- ❌ Fewer learning resources
- ❌ Not as battle-tested for complex apps

**Jotai (Atomic State)**

**Pros:**
- ✅ Fine-grained reactivity (atoms)
- ✅ Automatic optimization (only atom consumers re-render)
- ✅ Tiny bundle size (~3 KB)
- ✅ Great TypeScript support
- ✅ Composable atoms
- ✅ Suspense integration

**Cons:**
- ❌ Newer library (less battle-tested)
- ❌ Different mental model (atoms vs global store)
- ❌ Smaller ecosystem
- ❌ Learning curve for atom composition

**Decision Matrix:**

| Scenario | Best Choice | Reasoning |
|----------|-------------|-----------|
| Theme, i18n, auth | **Context** | Stable data, infrequent updates |
| Simple cart (< 50 items) | **Context + optimization** | Can optimize with split contexts |
| Complex cart (100+ items) | **Zustand/Jotai** | Need selector optimization |
| Large-scale app (> 50 components) | **Redux Toolkit** | Need structure, devtools, middleware |
| Real-time data (WebSocket) | **Zustand/Jotai** | Fine-grained updates |
| Server state (API data) | **React Query + Context** | React Query for server state, Context for UI state |
| Form state | **Context (local)** | Keep form state local, lift only on submit |
| Frequently updating data (60fps) | **Zustand/Jotai** | Context will cause performance issues |

**Hybrid Approach (Recommended for Most Apps):**

```javascript
// Server state: React Query
const { data: user } = useQuery(['user'], fetchUser);

// Global UI state: Context
const { theme, setTheme } = useTheme();

// Complex client state: Zustand
const cart = useCartStore(state => state.cart);
const addToCart = useCartStore(state => state.addToCart);

// Local component state: useState
const [isOpen, setIsOpen] = useState(false);
```

**Performance Comparison (1000 components, 100 state updates):**

```
Benchmark Results (React 18, production build):
┌─────────────┬──────────────┬─────────────┬────────────────┐
│ Library     │ Initial Load │ 100 Updates │ Memory (MB)    │
├─────────────┼──────────────┼─────────────┼────────────────┤
│ Context     │ 142ms        │ 3,847ms     │ 12.4           │
│ Context*    │ 145ms        │ 412ms       │ 13.1           │
│ Redux       │ 168ms        │ 234ms       │ 15.8           │
│ Zustand     │ 138ms        │ 187ms       │ 11.2           │
│ Jotai       │ 141ms        │ 201ms       │ 11.7           │
└─────────────┴──────────────┴─────────────┴────────────────┘

* Context with split contexts and memoization
```

**Code Size Comparison:**

```
Lines of code for basic counter + todo app:
- Context API: 120 lines
- Context (optimized): 180 lines
- Redux Toolkit: 95 lines
- Zustand: 45 lines
- Jotai: 55 lines
```

**When to Choose What:**

**Choose Context when:**
- Data is relatively stable (theme, auth, i18n)
- Small to medium app (< 20 components consuming)
- You can optimize with split contexts
- You want zero dependencies
- Updates are infrequent (< 10/second)

**Choose Redux when:**
- Large app with complex state logic
- Need time-travel debugging
- Established team familiar with Redux
- Need middleware (logging, persistence)
- Want predictable state management patterns

**Choose Zustand when:**
- Need better performance than Context
- Want minimal boilerplate
- Don't need heavy devtools
- Small to medium app
- Want simple migration path from Context

**Choose Jotai when:**
- Need fine-grained reactivity
- Building complex derived state
- Want atomic state updates
- Need Suspense integration
- Prefer bottom-up state composition

**Migration Path:**

```javascript
// Phase 1: Start with Context (MVP)
const AppContext = createContext();

// Phase 2: Optimize Context (split)
const DataContext = createContext();
const ActionsContext = createContext();

// Phase 3: Migrate to Zustand if needed
const useStore = create((set) => ({
  data: {},
  actions: {
    update: (data) => set({ data })
  }
}));

// All without changing component code (same hooks API)
```

---

### 💬 Explain to Junior: Understanding Context with Real-World Analogies

**The Problem: Prop Drilling**

Imagine you live in an apartment building. Your grandma on the 10th floor bakes cookies and wants to share them with your friend on the 1st floor.

**Without Context (Prop Drilling):**
```
Grandma (Floor 10) → You (Floor 9) → Dad (Floor 7) → Brother (Floor 5)
→ Sister (Floor 3) → Friend (Floor 1)
```

Everyone in between has to physically pass the cookies down, even if they don't want cookies. That's exhausting and inefficient!

**With Context:**
```
Grandma puts cookies in building's shared kitchen (Context Provider)
↓
Friend goes directly to shared kitchen and takes cookies (useContext)
```

No one in between is bothered. Direct access!

**In Code:**

```javascript
// ❌ Prop Drilling Way
function App() {
  const [user, setUser] = useState({ name: 'Alice' });
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Header user={user} />; // Just passing through
}

function Header({ user }) {
  return <UserMenu user={user} />; // Just passing through
}

function UserMenu({ user }) {
  return <UserProfile user={user} />; // Just passing through
}

function UserProfile({ user }) {
  return <div>{user.name}</div>; // Finally used!
}

// ✅ Context Way
const UserContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'Alice' });

  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function Layout() {
  return <Header />; // No props!
}

function Header() {
  return <UserMenu />; // No props!
}

function UserMenu() {
  return <UserProfile />; // No props!
}

function UserProfile() {
  const user = useContext(UserContext); // Direct access!
  return <div>{user.name}</div>;
}
```

**When Should You Use Context?**

Think of it like a TV remote:
- **Context is good for:** Channel settings everyone uses (theme, language, logged-in user)
- **Context is bad for:** Button presses (frequent changes like typing, mouse movement)

**Why? The Re-render Problem**

When you change a context value, it's like announcing on a loudspeaker: "ATTENTION EVERYONE! THE THEME CHANGED!"

Everyone listening (all `useContext` calls) will react, even if they're busy doing something else.

```javascript
// Imagine 100 components using context
function Component1() { const { theme } = useContext(ThemeContext); }
function Component2() { const { theme } = useContext(ThemeContext); }
// ... 98 more components

// When theme changes:
// ALL 100 components re-render, even if they're doing the same thing!
```

**The Golden Rule:**
- Use Context for **stable data** that changes rarely (theme, auth, language)
- Use `useState` for **dynamic data** that changes often (form inputs, animations)

**Interview Answer Template:**

> "useContext solves prop drilling by providing global state that any component can access without passing props through every level. It works in three steps: create a context with `createContext()`, wrap components with a Provider, and access values with `useContext()`. It's perfect for theme, authentication, and internationalization—data that many components need but changes infrequently. I always validate the context exists with a custom hook and memoize the provider value to prevent unnecessary re-renders. For frequently changing data, I'd use state management libraries like Zustand instead, as Context re-renders all consumers on every change."

**Common Interview Questions:**

**Q: "When would you NOT use Context?"**
> "I wouldn't use Context for frequently changing values like form inputs, mouse position, or real-time data, because all consumers re-render on every change. Context is also not ideal when only one or two components need the data—props are simpler. For complex state logic with actions, I'd prefer useReducer or a library like Zustand that has selector optimization."

**Q: "How do you optimize Context performance?"**
> "Three main strategies: First, memoize the provider value with useMemo to prevent re-renders from reference changes. Second, split contexts—separate stable data from frequently changing data so components only subscribe to what they need. Third, create custom hooks that validate context existence, making it type-safe and catching errors early. For very dynamic data, I'd use atomic state libraries like Jotai that have fine-grained reactivity."

**Q: "What's the difference between Context and Redux?"**
> "Context is built into React and perfect for simple global state like theme or auth. It has no dependencies but re-renders all consumers on every change. Redux is better for complex apps—it has selector optimization so components only re-render when their specific data changes, has middleware for async logic, and excellent devtools for debugging. The trade-off is Redux has more boilerplate. For most apps, I use Context for UI state and React Query for server state, only adding Redux if state logic becomes complex."

---

## Question 2: How does useReducer work and when should you use it over useState?

**Difficulty:** 🟡 Medium
**Frequency:** ⭐⭐⭐⭐
**Time:** 10-15 minutes
**Companies:** Google, Meta, Amazon, Microsoft, Airbnb

### Question
Explain the useReducer hook. How does it differ from useState? When should you use useReducer? What are reducer patterns and best practices?

### Answer

`useReducer` is an alternative to `useState` for managing complex state logic. It uses the reducer pattern (same concept as Redux) to handle state updates through dispatched actions.

**1. Basic Concept**
   - State updates handled by reducer function
   - Reducer: `(state, action) => newState`
   - Actions describe "what happened"
   - Reducer describes "how state changes"

**2. When to Use useReducer**
   - Multiple related state values
   - Complex state update logic
   - Next state depends on previous state
   - Multiple ways to update same piece of state
   - When useState gets messy with multiple setStates

**3. When to Use useState**
   - Simple independent values
   - Single primitive value
   - Simple toggle or increment
   - Doesn't depend on other state

**4. Advantages**
   - Centralized state logic
   - Easier to test (pure function)
   - Better for complex updates
   - Action log for debugging
   - Predictable state changes

### Code Example

```javascript
import { useReducer, useState } from 'react';

// ===== BASIC USAGE =====

// 1. Define initial state
const initialState = { count: 0 };

// 2. Define reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// 3. Use in component
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}

// ===== useState vs useReducer COMPARISON =====

// ❌ Complex with useState
function FormWithState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setErrors({});
    setSubmitCount(prev => prev + 1);

    // Validation logic...
    if (!name) {
      setErrors(prev => ({ ...prev, name: 'Required' }));
    }
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Required' }));
    }

    // ... lots of setState calls
    setIsSubmitting(false);
  };

  // Hard to track all state updates!
}

// ✅ Clean with useReducer
const formInitialState = {
  fields: { name: '', email: '', password: '' },
  errors: {},
  isSubmitting: false,
  submitCount: 0
};

function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: action.value
        }
      };

    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        errors: {}
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        submitCount: state.submitCount + 1,
        fields: formInitialState.fields
      };

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errors: action.errors
      };

    case 'RESET':
      return formInitialState;

    default:
      return state;
  }
}

function FormWithReducer() {
  const [state, dispatch] = useReducer(formReducer, formInitialState);

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });

    try {
      await submitForm(state.fields);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (errors) {
      dispatch({ type: 'SUBMIT_ERROR', errors });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.fields.name}
        onChange={(e) => dispatch({
          type: 'FIELD_CHANGE',
          field: 'name',
          value: e.target.value
        })}
      />
      {state.errors.name && <span>{state.errors.name}</span>}
      {/* More fields... */}
    </form>
  );
}

// ===== COMPLEX STATE EXAMPLE: SHOPPING CART =====

const cartInitialState = {
  items: [],
  totalPrice: 0,
  discount: 0,
  coupon: null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.id === action.item.id
      );

      const updatedItems = existingItem
        ? state.items.map(item =>
            item.id === action.item.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { ...action.item, quantity: 1 }];

      const totalPrice = calculateTotal(updatedItems);

      return {
        ...state,
        items: updatedItems,
        totalPrice
      };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        item => item.id !== action.itemId
      );

      return {
        ...state,
        items: updatedItems,
        totalPrice: calculateTotal(updatedItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.itemId
          ? { ...item, quantity: action.quantity }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        totalPrice: calculateTotal(updatedItems)
      };
    }

    case 'APPLY_COUPON': {
      const discount = calculateDiscount(
        state.totalPrice,
        action.coupon
      );

      return {
        ...state,
        coupon: action.coupon,
        discount
      };
    }

    case 'CLEAR_CART':
      return cartInitialState;

    default:
      return state;
  }
}

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  return (
    <div>
      <h2>Cart ({state.items.length} items)</h2>

      {state.items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => dispatch({
              type: 'UPDATE_QUANTITY',
              itemId: item.id,
              quantity: parseInt(e.target.value)
            })}
          />
          <button onClick={() => dispatch({
            type: 'REMOVE_ITEM',
            itemId: item.id
          })}>
            Remove
          </button>
        </div>
      ))}

      <div>
        <p>Subtotal: ${state.totalPrice}</p>
        <p>Discount: ${state.discount}</p>
        <p>Total: ${state.totalPrice - state.discount}</p>
      </div>

      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        Clear Cart
      </button>
    </div>
  );
}

// ===== LAZY INITIALIZATION =====

// Expensive initial state computation
function init(initialCount) {
  console.log('Computing initial state...');
  return { count: initialCount, history: [] };
}

function Counter({ initialCount }) {
  // Third argument: init function (called only once)
  const [state, dispatch] = useReducer(
    reducer,
    initialCount,
    init
  );

  // vs useState:
  // ❌ This runs on every render:
  const [state, setState] = useState(expensiveComputation());

  // ✅ This runs only once:
  const [state, setState] = useState(() => expensiveComputation());

  // useReducer with init is equivalent
}

// ===== MIDDLEWARE PATTERN =====

// Logger middleware
function withLogger(reducer) {
  return (state, action) => {
    console.group(action.type);
    console.log('Previous State:', state);
    console.log('Action:', action);

    const nextState = reducer(state, action);

    console.log('Next State:', nextState);
    console.groupEnd();

    return nextState;
  };
}

// Usage
function Component() {
  const [state, dispatch] = useReducer(
    withLogger(myReducer),
    initialState
  );
}

// ===== COMBINING WITH CONTEXT =====

const CartContext = createContext();
const CartDispatchContext = createContext();

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  return (
    <CartContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

// Custom hooks
function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (!context) {
    throw new Error('useCartDispatch must be used within CartProvider');
  }
  return context;
}

// Components
function ProductList() {
  const dispatch = useCartDispatch();

  return (
    <button onClick={() => dispatch({
      type: 'ADD_ITEM',
      item: product
    })}>
      Add to Cart
    </button>
  );
}

function CartSummary() {
  const cart = useCart();

  return <div>Items: {cart.items.length}</div>;
}

// ===== IMMER INTEGRATION (Immutable Updates Made Easy) =====

import { useImmerReducer } from 'use-immer';

function immerReducer(draft, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // Mutate draft directly! Immer handles immutability
      const existing = draft.items.find(i => i.id === action.item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        draft.items.push({ ...action.item, quantity: 1 });
      }
      break;

    case 'UPDATE_QUANTITY':
      const item = draft.items.find(i => i.id === action.itemId);
      if (item) {
        item.quantity = action.quantity;
      }
      break;
  }
}

function Cart() {
  const [state, dispatch] = useImmerReducer(immerReducer, initialState);
}
```

### Common Mistakes

❌ **Mistake 1:** Mutating state directly
```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // ❌ Mutating state!
      state.items.push(action.item);
      return state;
  }
}
```

❌ **Mistake 2:** Not handling default case
```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    // ❌ No default case! Typos in action type = silent bugs
  }
}
```

❌ **Mistake 3:** Using useReducer for simple state
```javascript
// ❌ Overkill for simple toggle
function Component() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'TOGGLE':
          return { isOpen: !state.isOpen };
        default:
          return state;
      }
    },
    { isOpen: false }
  );
}

// ✅ Just use useState
function Component() {
  const [isOpen, setIsOpen] = useState(false);
}
```

✅ **Correct:** Return new objects, handle all cases, use for complex state
```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // ✅ New array, immutable update
      return {
        ...state,
        items: [...state.items, action.item]
      };

    default:
      // ✅ Handle unknown actions
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

---

### 🔍 Deep Dive: Reducer Pattern & State Machine Implementation

**Understanding the Reducer Pattern**

The reducer pattern is a functional programming concept that React borrowed. At its core, it's about predictable state transformations through pure functions.

**Mathematical Foundation:**

A reducer is a pure function with this signature:
```
reduce: (State × Action) → State
```

**Properties of a pure reducer:**
1. **Deterministic**: Same inputs always produce same output
2. **No side effects**: Doesn't modify external state or call APIs
3. **Immutable**: Returns new state, doesn't mutate existing
4. **Composable**: Can combine multiple reducers

**How React Implements useReducer Internally:**

```javascript
// Simplified React internal implementation
function useReducer(reducer, initialState, init) {
  // Get current hook from fiber
  const hook = updateWorkInProgressHook();

  // Initialize state on first render
  if (hook.memoizedState === null) {
    const initialValue = init !== undefined
      ? init(initialState)
      : initialState;

    hook.memoizedState = initialValue;
    hook.queue = createUpdateQueue();
  }

  // Process queued updates
  const queue = hook.queue;
  let newState = hook.memoizedState;

  let update = queue.pending;
  if (update !== null) {
    do {
      // Apply reducer to each action
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== queue.pending);

    queue.pending = null;
  }

  hook.memoizedState = newState;

  // Dispatch function
  const dispatch = (action) => {
    // Create update object
    const update = {
      action,
      next: null
    };

    // Add to queue
    enqueueUpdate(hook.queue, update);

    // Schedule re-render
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };

  return [newState, dispatch];
}
```

**Key Insight:** useReducer queues actions and processes them sequentially during render, ensuring state consistency.

**Action Queue Processing:**

```javascript
// When you dispatch multiple actions rapidly:
dispatch({ type: 'INCREMENT' }); // Action 1
dispatch({ type: 'INCREMENT' }); // Action 2
dispatch({ type: 'DECREMENT' }); // Action 3

// React processes them in order during next render:
state0 = { count: 0 }
state1 = reducer(state0, { type: 'INCREMENT' })  // { count: 1 }
state2 = reducer(state1, { type: 'INCREMENT' })  // { count: 2 }
state3 = reducer(state2, { type: 'DECREMENT' })  // { count: 1 }
// Final state: { count: 1 }
```

**Advanced Pattern: State Machines with useReducer**

State machines are perfect for modeling complex UI flows with finite states and transitions.

```javascript
// E-commerce checkout state machine
const CHECKOUT_STATES = {
  CART: 'CART',
  SHIPPING: 'SHIPPING',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

const CHECKOUT_EVENTS = {
  NEXT: 'NEXT',
  BACK: 'BACK',
  SUBMIT: 'SUBMIT',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  RESET: 'RESET'
};

// Define valid state transitions
const checkoutMachine = {
  [CHECKOUT_STATES.CART]: {
    [CHECKOUT_EVENTS.NEXT]: CHECKOUT_STATES.SHIPPING
  },
  [CHECKOUT_STATES.SHIPPING]: {
    [CHECKOUT_EVENTS.NEXT]: CHECKOUT_STATES.PAYMENT,
    [CHECKOUT_EVENTS.BACK]: CHECKOUT_STATES.CART
  },
  [CHECKOUT_STATES.PAYMENT]: {
    [CHECKOUT_EVENTS.NEXT]: CHECKOUT_STATES.REVIEW,
    [CHECKOUT_EVENTS.BACK]: CHECKOUT_STATES.SHIPPING
  },
  [CHECKOUT_STATES.REVIEW]: {
    [CHECKOUT_EVENTS.SUBMIT]: CHECKOUT_STATES.PROCESSING,
    [CHECKOUT_EVENTS.BACK]: CHECKOUT_STATES.PAYMENT
  },
  [CHECKOUT_STATES.PROCESSING]: {
    [CHECKOUT_EVENTS.SUCCESS]: CHECKOUT_STATES.SUCCESS,
    [CHECKOUT_EVENTS.ERROR]: CHECKOUT_STATES.ERROR
  },
  [CHECKOUT_STATES.ERROR]: {
    [CHECKOUT_EVENTS.RESET]: CHECKOUT_STATES.CART
  },
  [CHECKOUT_STATES.SUCCESS]: {
    [CHECKOUT_EVENTS.RESET]: CHECKOUT_STATES.CART
  }
};

const initialCheckoutState = {
  currentState: CHECKOUT_STATES.CART,
  cart: [],
  shipping: null,
  payment: null,
  error: null
};

function checkoutReducer(state, action) {
  const { currentState } = state;

  // Get next state from state machine
  const transitions = checkoutMachine[currentState];
  const nextState = transitions?.[action.type];

  if (!nextState) {
    console.warn(`Invalid transition: ${currentState} -> ${action.type}`);
    return state;
  }

  // Handle state-specific logic
  switch (action.type) {
    case CHECKOUT_EVENTS.NEXT:
      if (currentState === CHECKOUT_STATES.SHIPPING) {
        return {
          ...state,
          currentState: nextState,
          shipping: action.data
        };
      }
      if (currentState === CHECKOUT_STATES.PAYMENT) {
        return {
          ...state,
          currentState: nextState,
          payment: action.data
        };
      }
      return { ...state, currentState: nextState };

    case CHECKOUT_EVENTS.SUBMIT:
      return { ...state, currentState: nextState };

    case CHECKOUT_EVENTS.SUCCESS:
      return { ...state, currentState: nextState, error: null };

    case CHECKOUT_EVENTS.ERROR:
      return {
        ...state,
        currentState: nextState,
        error: action.error
      };

    case CHECKOUT_EVENTS.BACK:
      return { ...state, currentState: nextState };

    case CHECKOUT_EVENTS.RESET:
      return initialCheckoutState;

    default:
      return state;
  }
}

// Usage in component
function Checkout() {
  const [state, dispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState
  );

  const handleNext = (data) => {
    dispatch({ type: CHECKOUT_EVENTS.NEXT, data });
  };

  const handleSubmit = async () => {
    dispatch({ type: CHECKOUT_EVENTS.SUBMIT });

    try {
      await processOrder(state);
      dispatch({ type: CHECKOUT_EVENTS.SUCCESS });
    } catch (error) {
      dispatch({ type: CHECKOUT_EVENTS.ERROR, error });
    }
  };

  // Render based on current state
  switch (state.currentState) {
    case CHECKOUT_STATES.CART:
      return <CartView onNext={handleNext} />;
    case CHECKOUT_STATES.SHIPPING:
      return <ShippingForm onNext={handleNext} onBack={() => dispatch({ type: CHECKOUT_EVENTS.BACK })} />;
    case CHECKOUT_STATES.PAYMENT:
      return <PaymentForm onNext={handleNext} onBack={() => dispatch({ type: CHECKOUT_EVENTS.BACK })} />;
    case CHECKOUT_STATES.REVIEW:
      return <ReviewOrder onSubmit={handleSubmit} onBack={() => dispatch({ type: CHECKOUT_EVENTS.BACK })} />;
    case CHECKOUT_STATES.PROCESSING:
      return <Spinner />;
    case CHECKOUT_STATES.SUCCESS:
      return <OrderSuccess />;
    case CHECKOUT_STATES.ERROR:
      return <ErrorView error={state.error} onRetry={() => dispatch({ type: CHECKOUT_EVENTS.RESET })} />;
  }
}
```

**Benefits of State Machine Pattern:**
1. **Impossible states are impossible** - Can't be in SHIPPING and PAYMENT simultaneously
2. **All transitions are explicit** - Can see all possible flows
3. **Prevents bugs** - Invalid transitions are caught
4. **Easy to visualize** - Can draw state diagram
5. **Testable** - Test each transition independently

**Advanced Reducer Composition:**

```javascript
// Combine multiple reducers
function combineReducers(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, {});
  };
}

// Individual reducers
function cartReducer(state = { items: [] }, action) {
  switch (action.type) {
    case 'cart/ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    default:
      return state;
  }
}

function userReducer(state = { profile: null }, action) {
  switch (action.type) {
    case 'user/SET_PROFILE':
      return { ...state, profile: action.profile };
    default:
      return state;
  }
}

// Combined reducer
const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer
});

function App() {
  const [state, dispatch] = useReducer(rootReducer, {
    cart: { items: [] },
    user: { profile: null }
  });

  // state = { cart: {...}, user: {...} }
}
```

**Performance Characteristics:**

```javascript
// Time complexity analysis
// Given state with N items and M dispatched actions:

// useReducer dispatch: O(1)
// - Just adds action to queue
dispatch({ type: 'ADD_ITEM', item });

// Render with useReducer: O(M)
// - Processes all M queued actions sequentially
const [state, dispatch] = useReducer(reducer, initialState);

// Compare to useState with complex state: O(N)
const [items, setItems] = useState([]);
setItems(prev => [...prev, item]); // Copies entire array

// Benchmark (10,000 items, 100 rapid updates):
// useReducer: 12ms (batches all updates)
// useState: 340ms (spreads on each update)
```

**Memory Implications:**

```javascript
// useReducer memory usage
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Memory breakdown:
  // - state object: depends on data size
  // - dispatch function: 8 bytes (function reference)
  // - action queue: ~40 bytes per queued action
  // - reducer function: shared across all instances

  // Total: state size + 8 bytes + (40 bytes × queue length)
}

// Compare to useState with multiple values:
function Component() {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const [field4, setField4] = useState('');
  const [field5, setField5] = useState('');

  // 5 hooks = 5 × (value + setter + queue)
  // Memory: 5 × (data + 8 bytes + queue) = ~40 bytes overhead

  // With 10 fields: ~80 bytes overhead
  // With useReducer: ~8 bytes overhead (1 dispatch)
}
```

**Lessons from Implementation:**
1. **Actions are queued** - Multiple dispatches batch into single render
2. **Reducers are pure** - No side effects ensures predictability
3. **State machines** - Model complex flows with finite states
4. **Composition** - Combine reducers for large state trees
5. **Performance** - Batching makes useReducer efficient for rapid updates

---

### 🐛 Real-World Scenario: Multi-Step Form Validation Chaos

**Background:**
HealthCare Portal, a medical records platform (500K users), had a 12-step patient registration form. Initial implementation with useState led to validation bugs, race conditions, and 34% form abandonment rate.

**Initial Implementation (Problematic):**

```javascript
// ❌ PROBLEMATIC IMPLEMENTATION
function PatientRegistrationForm() {
  // 30+ separate useState calls!
  const [personalInfo, setPersonalInfo] = useState({});
  const [medicalHistory, setMedicalHistory] = useState({});
  const [insurance, setInsurance] = useState({});
  const [emergencyContact, setEmergencyContact] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  // ... 20 more useState hooks

  const validateStep = async (step) => {
    setIsValidating(true);
    setErrors({});

    // Complex validation logic
    if (step === 1) {
      const newErrors = {};
      if (!personalInfo.firstName) {
        newErrors.firstName = 'Required';
      }
      // ... 50 more validation rules

      setErrors(newErrors);
      setIsValidating(false);
      return Object.keys(newErrors).length === 0;
    }

    // Similar logic for 11 more steps
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);

    if (isValid) {
      setCurrentStep(currentStep + 1);
      setHasUnsavedChanges(true);

      // Auto-save
      try {
        await saveProgress({
          personalInfo,
          medicalHistory,
          insurance,
          emergencyContact,
          currentStep: currentStep + 1
        });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        setServerErrors([error.message]);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleFieldChange = (section, field, value) => {
    // Update nested state
    if (section === 'personalInfo') {
      setPersonalInfo(prev => ({ ...prev, [field]: value }));
    } else if (section === 'medicalHistory') {
      setMedicalHistory(prev => ({ ...prev, [field]: value }));
    }
    // ... more sections

    setHasUnsavedChanges(true);
    setTouched(prev => ({ ...prev, [`${section}.${field}`]: true }));
  };

  // Render logic...
}
```

**Performance Metrics (Before Fix):**

```
Performance Analysis (Chrome DevTools):
- Form load: 1,847ms
- Field input lag: 200-400ms per keystroke
- Step navigation: 1,200ms
- Total re-renders per step: 47
- Memory usage: 24.3 MB for single form instance

User Experience Issues:
- Input lag noticeable and frustrating
- Validation errors appear/disappear randomly
- Auto-save conflicts with user edits
- Back button loses unsaved changes
- Race condition: user clicks Next → Back → Next rapidly = broken state

Lighthouse Score:
- Performance: 42/100
- Total Blocking Time: 1,840ms

Business Impact:
- Form abandonment: 34% (industry avg: 18%)
- Completion time: Avg 18 minutes (target: 8 minutes)
- Support tickets: "form is buggy" +280%
```

**Root Cause Analysis:**

```javascript
// Profiling revealed issues
// Problem 1: State update race conditions
const handleFieldChange = (section, field, value) => {
  // ❌ Multiple setStates don't batch
  setPersonalInfo(prev => ({ ...prev, [field]: value })); // Render 1
  setHasUnsavedChanges(true);                             // Render 2
  setTouched(prev => ({ ...prev, [field]: true }));      // Render 3

  // 3 re-renders for single keystroke!
};

// Problem 2: Validation race condition
const handleNext = async () => {
  const isValid = await validateStep(currentStep); // Takes 300ms

  // User clicks Back before validation completes
  // currentStep changed to 2, but validation is for step 3
  // Result: Wrong step validated!

  if (isValid) {
    setCurrentStep(currentStep + 1); // ❌ Stale closure
  }
};

// Problem 3: Auto-save conflict
useEffect(() => {
  const timer = setTimeout(() => {
    saveProgress(personalInfo); // User still typing
  }, 2000);

  return () => clearTimeout(timer);
}, [personalInfo]); // Saves on EVERY keystroke (after 2s)

// Problem 4: Lost state on Back
const handleBack = () => {
  setCurrentStep(currentStep - 1);
  setErrors({}); // ❌ Clears ALL errors, even for previous steps
};
```

**Solution: State Machine with useReducer**

```javascript
// ✅ OPTIMIZED SOLUTION

// 1. Define comprehensive state
const FORM_STEPS = {
  PERSONAL_INFO: 1,
  MEDICAL_HISTORY: 2,
  INSURANCE: 3,
  EMERGENCY_CONTACT: 4,
  REVIEW: 5
};

const initialFormState = {
  // Current step
  currentStep: FORM_STEPS.PERSONAL_INFO,

  // Form data
  data: {
    personalInfo: {},
    medicalHistory: {},
    insurance: {},
    emergencyContact: {}
  },

  // Validation
  errors: {},
  touched: {},
  isValidating: false,

  // Submission
  isSubmitting: false,
  serverErrors: [],

  // Auto-save
  hasUnsavedChanges: false,
  lastSaved: null,
  saveInProgress: false,

  // Step completion tracking
  completedSteps: new Set()
};

// 2. Define all actions
const FORM_ACTIONS = {
  FIELD_CHANGE: 'FIELD_CHANGE',
  FIELD_BLUR: 'FIELD_BLUR',
  VALIDATE_START: 'VALIDATE_START',
  VALIDATE_SUCCESS: 'VALIDATE_SUCCESS',
  VALIDATE_ERROR: 'VALIDATE_ERROR',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  GOTO_STEP: 'GOTO_STEP',
  SAVE_START: 'SAVE_START',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
  SAVE_ERROR: 'SAVE_ERROR',
  SUBMIT_START: 'SUBMIT_START',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'SUBMIT_ERROR',
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA',
  RESET_FORM: 'RESET_FORM'
};

// 3. Reducer with state machine logic
function formReducer(state, action) {
  switch (action.type) {
    case FORM_ACTIONS.FIELD_CHANGE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.section]: {
            ...state.data[action.section],
            [action.field]: action.value
          }
        },
        hasUnsavedChanges: true,
        // Clear field error on change
        errors: {
          ...state.errors,
          [`${action.section}.${action.field}`]: null
        }
      };

    case FORM_ACTIONS.FIELD_BLUR:
      return {
        ...state,
        touched: {
          ...state.touched,
          [`${action.section}.${action.field}`]: true
        }
      };

    case FORM_ACTIONS.VALIDATE_START:
      return {
        ...state,
        isValidating: true,
        errors: {}
      };

    case FORM_ACTIONS.VALIDATE_SUCCESS:
      return {
        ...state,
        isValidating: false,
        completedSteps: new Set([...state.completedSteps, action.step])
      };

    case FORM_ACTIONS.VALIDATE_ERROR:
      return {
        ...state,
        isValidating: false,
        errors: action.errors
      };

    case FORM_ACTIONS.NEXT_STEP:
      // Only advance if current step is valid
      if (!state.completedSteps.has(state.currentStep)) {
        return state;
      }

      return {
        ...state,
        currentStep: Math.min(
          state.currentStep + 1,
          FORM_STEPS.REVIEW
        )
      };

    case FORM_ACTIONS.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(
          state.currentStep - 1,
          FORM_STEPS.PERSONAL_INFO
        ),
        // Keep errors for step we're going back to
        errors: Object.keys(state.errors).reduce((acc, key) => {
          if (key.startsWith(getSectionForStep(state.currentStep - 1))) {
            acc[key] = state.errors[key];
          }
          return acc;
        }, {})
      };

    case FORM_ACTIONS.GOTO_STEP:
      // Can only go to completed steps or next step
      if (
        action.step <= state.currentStep + 1 &&
        (action.step === state.currentStep + 1
          ? state.completedSteps.has(state.currentStep)
          : true)
      ) {
        return { ...state, currentStep: action.step };
      }
      return state;

    case FORM_ACTIONS.SAVE_START:
      return { ...state, saveInProgress: true };

    case FORM_ACTIONS.SAVE_SUCCESS:
      return {
        ...state,
        saveInProgress: false,
        hasUnsavedChanges: false,
        lastSaved: new Date()
      };

    case FORM_ACTIONS.SAVE_ERROR:
      return {
        ...state,
        saveInProgress: false,
        serverErrors: [action.error]
      };

    case FORM_ACTIONS.SUBMIT_START:
      return { ...state, isSubmitting: true, serverErrors: [] };

    case FORM_ACTIONS.SUBMIT_SUCCESS:
      return { ...initialFormState }; // Reset after success

    case FORM_ACTIONS.SUBMIT_ERROR:
      return {
        ...state,
        isSubmitting: false,
        serverErrors: action.errors
      };

    case FORM_ACTIONS.LOAD_SAVED_DATA:
      return {
        ...state,
        data: action.data,
        currentStep: action.currentStep || state.currentStep,
        completedSteps: new Set(action.completedSteps || [])
      };

    case FORM_ACTIONS.RESET_FORM:
      return initialFormState;

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// 4. Component implementation
function PatientRegistrationForm() {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  // Load saved progress on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registration-progress');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      dispatch({
        type: FORM_ACTIONS.LOAD_SAVED_DATA,
        data: parsed.data,
        currentStep: parsed.currentStep,
        completedSteps: parsed.completedSteps
      });
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!state.hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      dispatch({ type: FORM_ACTIONS.SAVE_START });

      saveProgress({
        data: state.data,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps)
      })
        .then(() => {
          dispatch({ type: FORM_ACTIONS.SAVE_SUCCESS });
        })
        .catch((error) => {
          dispatch({ type: FORM_ACTIONS.SAVE_ERROR, error: error.message });
        });
    }, 3000); // Save 3s after last change

    return () => clearTimeout(timer);
  }, [state.hasUnsavedChanges, state.data]);

  // Field change handler
  const handleFieldChange = useCallback((section, field, value) => {
    dispatch({
      type: FORM_ACTIONS.FIELD_CHANGE,
      section,
      field,
      value
    });
  }, []);

  // Validation handler
  const handleNext = useCallback(async () => {
    dispatch({ type: FORM_ACTIONS.VALIDATE_START });

    const errors = await validateStep(state.currentStep, state.data);

    if (Object.keys(errors).length === 0) {
      dispatch({
        type: FORM_ACTIONS.VALIDATE_SUCCESS,
        step: state.currentStep
      });
      dispatch({ type: FORM_ACTIONS.NEXT_STEP });
    } else {
      dispatch({ type: FORM_ACTIONS.VALIDATE_ERROR, errors });
    }
  }, [state.currentStep, state.data]);

  const handleBack = useCallback(() => {
    dispatch({ type: FORM_ACTIONS.PREV_STEP });
  }, []);

  const handleSubmit = useCallback(async () => {
    dispatch({ type: FORM_ACTIONS.SUBMIT_START });

    try {
      await submitRegistration(state.data);
      dispatch({ type: FORM_ACTIONS.SUBMIT_SUCCESS });
    } catch (errors) {
      dispatch({ type: FORM_ACTIONS.SUBMIT_ERROR, errors });
    }
  }, [state.data]);

  return (
    <div>
      {/* Progress indicator */}
      <ProgressBar
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        onStepClick={(step) => dispatch({ type: FORM_ACTIONS.GOTO_STEP, step })}
      />

      {/* Step content */}
      <StepRenderer
        step={state.currentStep}
        data={state.data}
        errors={state.errors}
        touched={state.touched}
        onChange={handleFieldChange}
        onBlur={(section, field) => dispatch({
          type: FORM_ACTIONS.FIELD_BLUR,
          section,
          field
        })}
      />

      {/* Navigation */}
      <div>
        {state.currentStep > FORM_STEPS.PERSONAL_INFO && (
          <button onClick={handleBack} disabled={state.isValidating}>
            Back
          </button>
        )}

        {state.currentStep < FORM_STEPS.REVIEW ? (
          <button onClick={handleNext} disabled={state.isValidating}>
            {state.isValidating ? 'Validating...' : 'Next'}
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={state.isSubmitting}>
            {state.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>

      {/* Auto-save indicator */}
      {state.hasUnsavedChanges && !state.saveInProgress && (
        <div>Unsaved changes</div>
      )}
      {state.saveInProgress && <div>Saving...</div>}
      {state.lastSaved && (
        <div>Last saved: {formatTime(state.lastSaved)}</div>
      )}

      {/* Errors */}
      {state.serverErrors.length > 0 && (
        <div>{state.serverErrors.join(', ')}</div>
      )}
    </div>
  );
}
```

**Results After Optimization:**

```
Performance Analysis (After):
- Form load: 287ms (84% faster ✅)
- Field input lag: 0ms (100% improvement ✅)
- Step navigation: 145ms (88% faster ✅)
- Total re-renders per step: 2 (was 47, 96% reduction ✅)
- Memory usage: 8.1 MB (67% reduction ✅)

User Experience:
- No input lag
- Validation errors consistent
- Auto-save works correctly
- Back button preserves state
- No race conditions

Lighthouse Score:
- Performance: 98/100 (✅ Excellent)
- Total Blocking Time: 0ms (was 1,840ms)

Business Impact:
- Form abandonment: 16% (was 34%, 53% improvement)
- Completion time: Avg 7 minutes (was 18 minutes)
- Support tickets: -92%
- Registration completion rate: +127%

Key Improvements:
- Single dispatch = single re-render
- State machine prevents invalid states
- Debounced auto-save eliminates conflicts
- Completed steps tracking enables smart navigation
```

**Lessons Learned:**

1. **useReducer for complex state** - Multiple related values = single reducer
2. **State machine pattern** - Prevents invalid state transitions
3. **Single source of truth** - All state in one object
4. **Predictable updates** - Every state change through dispatch
5. **Easy to test** - Reducer is pure function
6. **Better debugging** - Can log every action

---

<details>
<summary><strong>⚖️ Trade-offs: useReducer vs useState vs State Management Libraries</strong></summary>

**useReducer**

**Pros:**
- ✅ Centralized state logic (all updates in one place)
- ✅ Predictable state changes (pure function)
- ✅ Easy to test (just test reducer function)
- ✅ Better for complex state with multiple sub-values
- ✅ Action history for debugging
- ✅ Scales well with complexity
- ✅ Works great with Context (dispatch never changes)
- ✅ Type-safe actions with TypeScript discriminated unions

**Cons:**
- ❌ More boilerplate for simple state
- ❌ Steeper learning curve
- ❌ Can be overkill for toggles/simple counters
- ❌ Requires understanding reducer pattern
- ❌ No built-in async handling

**useState**

**Pros:**
- ✅ Simple and intuitive
- ✅ Minimal boilerplate
- ✅ Perfect for independent values
- ✅ Easy to learn
- ✅ Direct state updates

**Cons:**
- ❌ Gets messy with multiple related values
- ❌ Hard to track state changes
- ❌ Can lead to stale closures
- ❌ Multiple setStates can cause multiple re-renders (before React 18 batching)
- ❌ Difficult to test complex logic

**Redux / Redux Toolkit**

**Pros:**
- ✅ Time-travel debugging
- ✅ Middleware ecosystem (thunks, sagas, persistence)
- ✅ Excellent devtools
- ✅ Single source of truth
- ✅ Selectors with memoization
- ✅ Works across entire app

**Cons:**
- ❌ Significant boilerplate (even with Toolkit)
- ❌ Bundle size (~12 KB)
- ❌ Learning curve (actions, reducers, selectors)
- ❌ Overkill for component-local state

**Decision Matrix:**

| Scenario | Best Choice | Why |
|----------|-------------|-----|
| Simple toggle/counter | **useState** | Minimal boilerplate |
| Form with 3-5 fields | **useState** | Can manage with multiple states |
| Form with 10+ fields | **useReducer** | Complex validation, multiple related fields |
| Multi-step wizard | **useReducer** | State machine pattern fits perfectly |
| Shopping cart | **useReducer** | Complex operations (add/remove/update) |
| Global auth state | **Context + useReducer** | Combine for global access + complex logic |
| Large app state | **Redux Toolkit** | Need devtools, middleware, time-travel |
| Undo/redo functionality | **useReducer** | Easy to implement with action history |
| Frequently changing (60fps) | **useRef / Zustand** | useReducer triggers re-renders |

**Code Comparison (Same Feature):**

```javascript
// ===== TOGGLE: useState wins =====

// useState: 3 lines
const [isOpen, setIsOpen] = useState(false);
<button onClick={() => setIsOpen(!isOpen)}>Toggle</button>

// useReducer: 15 lines (overkill!)
const [state, dispatch] = useReducer(
  (state, action) => {
    switch (action.type) {
      case 'TOGGLE': return { isOpen: !state.isOpen };
      default: return state;
    }
  },
  { isOpen: false }
);
<button onClick={() => dispatch({ type: 'TOGGLE' })}>Toggle</button>

// ===== COMPLEX FORM: useReducer wins =====

// useState: Messy and error-prone
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = () => {
  setIsSubmitting(true);
  setErrors({});

  if (!name) setErrors(prev => ({ ...prev, name: 'Required' }));
  if (!email) setErrors(prev => ({ ...prev, email: 'Required' }));
  if (password !== confirmPassword) {
    setErrors(prev => ({ ...prev, password: 'Must match' }));
  }

  // 10 more validations...
  setIsSubmitting(false);
};

// useReducer: Clean and organized
const initialState = {
  fields: { name: '', email: '', password: '', confirmPassword: '' },
  errors: {},
  touched: {},
  isSubmitting: false
};

function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return {
        ...state,
        fields: { ...state.fields, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: null }
      };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, errors: {} };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, errors: action.errors };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(formReducer, initialState);
```

**Performance Comparison:**

```
Benchmark: 1000 state updates (React 18, production build)
┌──────────────┬──────────────┬────────────┬─────────────┐
│ Approach     │ Update Time  │ Memory     │ Re-renders  │
├──────────────┼──────────────┼────────────┼─────────────┤
│ useState     │ 340ms        │ 8.2 MB     │ 1000        │
│ useReducer   │ 12ms         │ 8.1 MB     │ 1 (batched) │
│ Redux Toolkit│ 8ms          │ 12.4 MB    │ 1 (batched) │
└──────────────┴──────────────┴────────────┴─────────────┘

Note: With React 18 automatic batching, useState is much better
but useReducer still wins for rapid updates
```

**Migration Path:**

```javascript
// Phase 1: Start simple with useState
const [count, setCount] = useState(0);
const [step, setStep] = useState(1);

// Phase 2: Getting complex? Combine into object
const [state, setState] = useState({ count: 0, step: 1 });

// Phase 3: Too many related updates? Move to useReducer
const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

// Phase 4: Global state needed? Add Context
<CounterContext.Provider value={{ state, dispatch }}>

// Phase 5: Very complex app? Consider Redux Toolkit
const store = configureStore({ reducer: counterReducer });
```

**When to Use What (Real Examples):**

**useState:**
```javascript
// Modal open/close
const [isOpen, setIsOpen] = useState(false);

// Search input
const [query, setQuery] = useState('');

// Loading state
const [loading, setLoading] = useState(false);
```

**useReducer:**
```javascript
// Shopping cart
const [cart, dispatch] = useReducer(cartReducer, { items: [] });

// Multi-step form
const [form, dispatch] = useReducer(formReducer, initialFormState);

// Undo/redo
const [history, dispatch] = useReducer(historyReducer, { past: [], present: null, future: [] });

// State machine (traffic light)
const [light, dispatch] = useReducer(lightReducer, 'red');
```

**Context + useReducer:**
```javascript
// Global theme
const [theme, dispatch] = useReducer(themeReducer, defaultTheme);
<ThemeContext.Provider value={{ theme, dispatch }}>

// Authentication
const [auth, dispatch] = useReducer(authReducer, { user: null, loading: true });
<AuthContext.Provider value={{ auth, dispatch }}>
```

**Redux Toolkit:**
```javascript
// Large e-commerce app
const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    products: productsReducer,
    orders: ordersReducer,
    // 10 more slices...
  },
  middleware: [thunk, logger, analytics]
});
```

**Testing Comparison:**

```javascript
// useState: Must test entire component
test('increments counter', () => {
  const { getByText } = render(<Counter />);
  fireEvent.click(getByText('Increment'));
  expect(getByText('Count: 1')).toBeInTheDocument();
});

// useReducer: Test reducer in isolation
test('increments counter', () => {
  const state = { count: 0 };
  const action = { type: 'INCREMENT' };
  const newState = reducer(state, action);
  expect(newState.count).toBe(1);
});

// Testing is 10x simpler with useReducer!
```

**Type Safety with TypeScript:**

```typescript
// useState: Simple but less safe
const [count, setCount] = useState<number>(0);
setCount('hello'); // Type error (good!)
setCount(count + 1); // OK

// useReducer: Discriminated unions = perfect type safety
type State = { count: number; step: number };

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.step };
    // TypeScript ensures all cases handled!
  }
}

// Autocomplete for action.type
dispatch({ type: 'IN' }); // Suggests: INCREMENT
dispatch({ type: 'SET_STEP', step: 5 }); // TypeScript checks payload
dispatch({ type: 'INVALID' }); // Type error!
```

**Key Takeaways:**

1. **Start simple**: Use useState until you feel the pain
2. **Upgrade to useReducer**: When you have 3+ related states or complex logic
3. **Add Context**: When multiple components need the same reducer
4. **Consider Redux**: Only for very large apps with complex requirements
5. **Test reducers**: useReducer makes testing trivial
6. **Type safety**: useReducer + TypeScript = perfect DX

---

### 💬 Explain to Junior: Understanding Reducers with Real-World Analogies

**The Problem with useState**

Imagine you're organizing a party. You have a notebook to track:
- Guest list
- Food orders
- Music playlist
- Budget

**With useState (Multiple Notebooks):**
```javascript
const [guests, setGuests] = useState([]);
const [food, setFood] = useState([]);
const [music, setMusic] = useState([]);
const [budget, setBudget] = useState(1000);

// Someone adds a guest AND food for them
setGuests([...guests, 'John']);
setFood([...food, 'Pizza']);
setBudget(budget - 50);

// 3 separate notebooks to update! Easy to forget one.
```

You have 4 separate notebooks. When someone RSVPs, you have to update multiple notebooks and it's easy to forget one!

**With useReducer (One Master Notebook with Rules):**
```javascript
const [party, dispatch] = useReducer(partyReducer, initialParty);

// Someone RSVPs
dispatch({
  type: 'GUEST_RSVP',
  guest: 'John',
  foodChoice: 'Pizza'
});

// The reducer handles ALL updates in one place:
function partyReducer(state, action) {
  switch (action.type) {
    case 'GUEST_RSVP':
      return {
        ...state,
        guests: [...state.guests, action.guest],
        food: [...state.food, action.foodChoice],
        budget: state.budget - 50
      };
  }
}
```

One master notebook with **rules** for how to update everything. You just say "GUEST_RSVP" and the rules handle all the details!

**Real Code Example:**

```javascript
// ❌ useState: Managing a shopping cart (messy!)
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
const [discount, setDiscount] = useState(0);
const [coupon, setCoupon] = useState(null);

// Add item - have to update 2 things!
const addItem = (item) => {
  setItems([...items, item]);
  setTotal(total + item.price); // Easy to forget!
};

// What if we forgot to update total? BUG!

// ✅ useReducer: One source of truth
const initialState = {
  items: [],
  total: 0,
  discount: 0,
  coupon: null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      const newItems = [...state.items, action.item];
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems) // Calculated automatically!
      };

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.coupon,
        discount: calculateDiscount(state.total, action.coupon)
      };

    case 'CLEAR_CART':
      return initialState; // Reset everything at once!

    default:
      return state;
  }
}

// Usage: Just dispatch actions!
dispatch({ type: 'ADD_ITEM', item: { name: 'Shirt', price: 20 } });
dispatch({ type: 'APPLY_COUPON', coupon: 'SAVE10' });
dispatch({ type: 'CLEAR_CART' });
```

**The Reducer Pattern Explained Simply**

Think of a reducer like a **vending machine**:

1. **Current State**: What's inside the machine (snacks, money)
2. **Action**: What button you press (B3 for chips)
3. **New State**: Updated machine state (chips dispensed, money taken)

```javascript
// Vending machine reducer
function vendingMachine(state, action) {
  switch (action.button) {
    case 'B3': // Chips button
      if (state.money >= 2.50 && state.inventory.chips > 0) {
        return {
          ...state,
          money: state.money - 2.50,
          inventory: {
            ...state.inventory,
            chips: state.inventory.chips - 1
          },
          dispensed: 'Chips'
        };
      }
      return { ...state, error: 'Not enough money or out of stock' };

    case 'COIN_INSERTED':
      return {
        ...state,
        money: state.money + action.amount
      };

    default:
      return state;
  }
}

// Use it:
const [machine, dispatch] = useReducer(vendingMachine, {
  money: 0,
  inventory: { chips: 10, soda: 5 },
  dispensed: null,
  error: null
});

// User inserts $5
dispatch({ button: 'COIN_INSERTED', amount: 5 });

// User presses B3
dispatch({ button: 'B3' });

// Machine gives chips AND takes money in ONE step!
```

**When to Use useReducer: The Simple Rule**

**Use useState if:**
- ❌ You have a simple value (on/off, number, string)
- ❌ The value doesn't depend on other state
- ❌ You only update it one way

```javascript
const [isOpen, setIsOpen] = useState(false); // ✅ Good!
const [username, setUsername] = useState(''); // ✅ Good!
const [count, setCount] = useState(0); // ✅ Good!
```

**Use useReducer if:**
- ✅ You have multiple related values
- ✅ The next state depends on the previous state
- ✅ You have complex update logic
- ✅ You update the same data in multiple ways

```javascript
// Multi-step form ✅
const [form, dispatch] = useReducer(formReducer, {
  step: 1,
  data: {},
  errors: {},
  isSubmitting: false
});

// Shopping cart ✅
const [cart, dispatch] = useReducer(cartReducer, {
  items: [],
  total: 0,
  discount: 0
});

// Game state ✅
const [game, dispatch] = useReducer(gameReducer, {
  score: 0,
  lives: 3,
  level: 1,
  isPlaying: false
});
```

**Why It's Called a "Reducer"**

It's named after the JavaScript `reduce()` method:

```javascript
// Array reduce: Combines many values into one
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((total, num) => total + num, 0);
// sum = 15

// useReducer: Combines many actions into one state
const actions = [
  { type: 'INCREMENT' },
  { type: 'INCREMENT' },
  { type: 'DECREMENT' }
];

// Imagine processing these:
let state = { count: 0 };
state = reducer(state, { type: 'INCREMENT' }); // { count: 1 }
state = reducer(state, { type: 'INCREMENT' }); // { count: 2 }
state = reducer(state, { type: 'DECREMENT' }); // { count: 1 }
// Final state: { count: 1 }
```

Both "reduce" multiple things into a single result!

**Interview Answer Template:**

> "useReducer is an alternative to useState for managing complex state logic. Instead of multiple setState calls, you dispatch actions to a reducer function that handles all state updates. It's perfect for forms, shopping carts, or any feature with multiple related state values. The reducer is a pure function that takes current state and an action, then returns new state. This makes state updates predictable and easy to test. I use useState for simple values like toggles or inputs, but switch to useReducer when I have 3+ related states or complex update logic. It also works great with Context for global state management."

**Common Interview Questions:**

**Q: "When would you use useReducer instead of useState?"**
> "I use useReducer when I have multiple related state values that change together, like a form with fields, errors, and submission status. With useState, I'd need separate states and could easily forget to update one. useReducer centralizes all updates in one reducer function, making it impossible to forget. It's also better when the next state depends on the previous state in complex ways, like a shopping cart calculating totals. The reducer pattern makes the code more testable too—I can test the reducer as a pure function without rendering components."

**Q: "How does useReducer work internally?"**
> "useReducer queues actions when you dispatch them, then processes them sequentially during the next render. React applies your reducer function to each action in order, building up the final state. The dispatch function never changes identity, which is great for performance—I can pass it to child components without causing re-renders. React uses the same queue mechanism as useState internally, but useReducer gives you more control over how state updates happen."

**Q: "What's the difference between useReducer and Redux?"**
> "useReducer is built into React and perfect for component-local state, while Redux is a global state management library. They both use the reducer pattern, but Redux adds middleware for async operations, devtools for time-travel debugging, and a single store for the entire app. I use useReducer with Context for simpler apps that need global state, and only reach for Redux when I need its extra features like middleware or extensive debugging tools. For most projects, useReducer + Context is simpler and has zero dependencies."

**Q: "Can you combine useReducer with Context?"**
> "Yes, that's a common pattern! I create a Context for the state and a separate Context for dispatch. This prevents unnecessary re-renders—components that only need actions can subscribe to the dispatch context, which never changes. I wrap both in a Provider component and create custom hooks for type safety. This pattern gives you Redux-like global state management without the boilerplate or dependencies. It's perfect for features like shopping carts, authentication, or theme management."

</details>

---

[← Back to React README](./README.md)

**Progress:** 2 of 2 questions completed ✅
