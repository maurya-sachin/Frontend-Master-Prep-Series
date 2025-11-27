# React Context API

## Question 1: How to create and use Context API for global state?

**Answer:**

The Context API is React's built-in solution for sharing data across component trees without prop drilling. It consists of three main parts: `createContext()` to create a context object, `Provider` component to supply values to the tree, and `useContext()` hook (or `Consumer` component) to access those values in child components.

**Basic Setup:**
```javascript
// 1. Create Context
const ThemeContext = createContext(defaultValue);

// 2. Provide value at top level
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ComponentTree />
    </ThemeContext.Provider>
  );
}

// 3. Consume in child components
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button className={theme}>Toggle</button>;
}
```

**Common Patterns:**
- **Custom Provider Component**: Wrap context logic in a dedicated component
- **Custom Hook**: Create `useTheme()` instead of exposing raw `useContext(ThemeContext)`
- **Context Composition**: Split large contexts into smaller, focused ones
- **Default Values**: Provide sensible defaults for better developer experience

Context is ideal for truly global state (theme, auth, locale) but should be used judiciously - not every piece of shared state needs Context. For complex state management or frequent updates, consider alternatives like Redux or Zustand.

---

### 🔍 Deep Dive

<details>
<summary><strong>🔍 Deep Dive: Context Creation Internals and Propagation Mechanism</strong></summary>

**Context Creation Internals and Propagation Mechanism:**

When you call `createContext(defaultValue)`, React creates a context object with internal fiber node references that form the foundation of its subscription system. The returned object contains:

```javascript
{
  Provider: ProviderComponent,
  Consumer: ConsumerComponent,
  _currentValue: defaultValue,     // Internal - current value for primary renderer
  _currentValue2: defaultValue,    // Internal - current value for secondary renderer (concurrent mode)
  $$typeof: Symbol.for('react.context')  // Marks this as a React context object
}
```

The `defaultValue` parameter is only used when a component consumes context **without a matching Provider above it** in the component tree. This is a common source of confusion - many developers mistakenly believe the default value serves as a fallback when the Provider's value is `undefined`. In reality, if you want `undefined` as the context value, you must explicitly pass `undefined` to the Provider. The default value is purely for the scenario where no Provider exists in the ancestor tree.

**Context Propagation Through Fiber Tree:**

React's Context implementation leverages the fiber tree architecture. When a Provider renders, React creates a fiber node with a `type` of `REACT_PROVIDER_TYPE` and stores the context value in the fiber's `memoizedProps`. This creates a "context stack" where nested Providers of the same context form a chain, and React always uses the value from the nearest Provider when resolving context consumption.

When you call `useContext(MyContext)`, React performs the following operations:
1. Traverses up the fiber tree from the current component
2. Searches for the nearest Provider fiber for that specific context
3. Reads the value from that Provider's fiber node
4. Subscribes the current component to that context by adding it to the Provider's dependency list
5. Returns the current value

This subscription is critical - it means the component will re-render whenever that specific Provider's value changes, regardless of `React.memo()` or `shouldComponentUpdate()`. The subscription is managed through React's internal `ReactCurrentDispatcher`, which maintains a list of all components currently consuming each context.

**Provider Component Mechanism and Value Change Detection:**

The Provider component works through React's reconciliation process with a sophisticated change detection system:

```javascript
// Simplified internal behavior of Provider rendering
function Provider({ value, children }) {
  // React stores this value in the fiber node's memoizedProps
  // When Provider re-renders, React:
  // 1. Compares new value with previous value using Object.is()
  // 2. If changed: marks all consuming components as needing update
  // 3. Schedules re-render for those components with priority
  // 4. Propagates changes down the fiber tree during reconciliation
  // 5. Batches updates if multiple contexts change simultaneously

  return children;
}
```

**Key Internal Behaviors and Performance Implications:**

**1. Value Comparison via Object.is():**

React uses `Object.is()` for equality checks, which has crucial implications for object and array references:

```javascript
// Object.is() behavior examples:
Object.is(5, 5)           // true - same primitive
Object.is('hello', 'hello') // true - same string
Object.is({}, {})         // false - different object references
Object.is([], [])         // false - different array references
const obj = {};
Object.is(obj, obj)       // true - same reference

// Context value creation pitfall:
// ❌ BAD - Creates new object every render, triggers re-renders
<ThemeContext.Provider value={{ theme: 'dark', toggle: toggleTheme }}>

// Even though theme is 'dark' every time, the object wrapper is NEW
// Object.is({ theme: 'dark' }, { theme: 'dark' }) === false
// ALL consumers re-render unnecessarily

// ✅ GOOD - Stable reference via useMemo
const value = useMemo(() => ({ theme, toggle: toggleTheme }), [theme]);
<ThemeContext.Provider value={value}>
// Now Object.is(previousValue, newValue) === true when theme unchanged
// Consumers only re-render when theme actually changes
```

**2. Subscription Mechanism and Dependency Tracking:**

When a component calls `useContext(ThemeContext)`, React performs dependency tracking:

- React adds the component's fiber node to the context's internal subscriber list (stored in `context._currentValue`)
- This list is checked during the reconciliation phase when the Provider's value changes
- All subscribers are marked with a "needs update" flag in their fiber nodes
- During the commit phase, React re-renders all marked components
- Subscriptions are automatically cleaned up when components unmount via effect cleanup

The subscription is **immediate and permanent** for the component's lifetime - there's no way to unsubscribe without unmounting. This is why context changes cannot be selectively ignored by consumers.

**3. Propagation Behavior - Bypassing Optimization Boundaries:**

Context changes have special propagation rules that bypass normal React optimization mechanisms:

```javascript
const ExpensiveComponent = React.memo(({ children }) => {
  // Even wrapped in memo, this re-renders when context changes
  const theme = useContext(ThemeContext);
  console.log('ExpensiveComponent rendered');
  return <div className={theme}>{children}</div>;
});

// Why memo doesn't help:
// - React.memo only prevents re-renders from parent prop changes
// - Context subscriptions are checked BEFORE memo comparison
// - If context changed, component re-renders regardless of memo
// - Memo still prevents parent re-renders from affecting this component
```

The reconciliation priority for re-renders:
1. First: Check if context consumed by component changed
2. Second: Check if props changed (memo comparison happens here)
3. Third: Check if parent re-rendered (memo blocks propagation here)

This means context changes have the highest priority and bypass all memoization boundaries, making performance optimization challenging for frequently-updating contexts.

**Advanced Patterns for Production Applications:**

**1. Context Splitting for Performance Optimization:**

The most effective performance optimization for Context is splitting large contexts into smaller, focused ones based on update frequency and coupling:

```javascript
// ❌ BAD - Single monolithic context causes re-render cascades
const AppContext = createContext({
  user,          // Changes on login/logout (rare)
  theme,         // Changes on theme toggle (rare)
  settings,      // Changes when user updates preferences (occasional)
  notifications, // Changes frequently (new notifications arrive)
  searchQuery,   // Changes on every keystroke (very frequent)
  cart          // Changes when items added/removed (occasional)
});

// Problem: When searchQuery updates (every keystroke), ALL components consuming
// AppContext re-render, including those only needing user or theme data

// ✅ GOOD - Split into focused contexts based on update frequency
const UserContext = createContext(null);              // Rare updates
const ThemeContext = createContext(null);             // Rare updates
const SettingsContext = createContext(null);          // Occasional updates
const NotificationsContext = createContext(null);     // Frequent updates
const SearchContext = createContext(null);            // Very frequent updates
const CartContext = createContext(null);              // Occasional updates

// Now components subscribe only to what they need:
function UserProfile() {
  const { user } = useContext(UserContext);
  // Only re-renders on login/logout, not on search/cart/notification changes
}

function SearchResults() {
  const { searchQuery, results } = useContext(SearchContext);
  // Only re-renders on search changes, isolated from other state
}

function CartIcon() {
  const { items } = useContext(CartContext);
  // Only re-renders when cart changes, immune to search/notification noise
}
```

This splitting strategy reduces unnecessary re-renders by 90-95% in typical applications, as components only respond to relevant state changes.

**2. Custom Provider with State Management:**
```javascript
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('theme') || 'light';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    theme,
    setTheme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for better DX
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**3. Selector Pattern (Manual Optimization):**
```javascript
// Context holds large state
const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = useState({
    user: { name: 'John', email: 'john@example.com' },
    products: [...],
    cart: [...],
    ui: { theme: 'light', sidebar: false }
  });

  // Provide both state and selectors
  const value = useMemo(() => ({
    state,
    setState,
    // Selectors - components can subscribe to specific slices
    selectUser: () => state.user,
    selectTheme: () => state.ui.theme,
    selectCart: () => state.cart
  }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Usage with manual memoization
function UserProfile() {
  const { state } = useContext(StoreContext);
  // ❌ Re-renders on ANY state change
  const user = state.user;

  // ✅ Better: use external library like use-context-selector
  // Or implement manual subscription
}
```

**4. Context Composition:**
```javascript
function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

**Multiple Context Values and Context Stacking:**

React supports nested Providers of the same context, creating a "context stack" where the nearest Provider wins:

```javascript
function App() {
  return (
    <ThemeContext.Provider value="light">
      <div>
        <ComponentA /> {/* Gets 'light' from outer Provider */}

        <ThemeContext.Provider value="dark">
          <ComponentB /> {/* Gets 'dark' from inner Provider - nearest wins */}

          <ThemeContext.Provider value="blue">
            <ComponentC /> {/* Gets 'blue' from innermost Provider */}
          </ThemeContext.Provider>
        </ThemeContext.Provider>
      </div>
    </ThemeContext.Provider>
  );
}

// React's resolution algorithm:
// 1. Start at consuming component's fiber node
// 2. Walk up fiber tree toward root
// 3. Find first Provider fiber matching the context
// 4. Return that Provider's value
// 5. If no Provider found, return context's default value
```

This pattern is useful for creating scoped contexts where different parts of your app can have different values for the same context type. Common use cases include:
- Nested theme zones (light header, dark sidebar, light content)
- Form contexts (nested forms with separate validation contexts)
- Feature flags (override global feature flags for specific sections)
- Testing (mock context values for specific component trees)

**Context Update Batching and Priority:**

React 18 introduced automatic batching for all state updates, which affects context updates:

```javascript
// React 18: Automatic batching
function updateMultipleContexts() {
  setUser({ name: 'John' });    // Context 1 update
  setTheme('dark');              // Context 2 update
  setCart([...items]);           // Context 3 update

  // All three updates are batched into a single re-render cycle
  // Components consuming multiple contexts only re-render once
  // This is true even in async contexts (setTimeout, promises, etc.)
}

// React 17 and earlier: Manual batching required
import { unstable_batchedUpdates } from 'react-dom';

unstable_batchedUpdates(() => {
  setUser({ name: 'John' });
  setTheme('dark');
  setCart([...items]);
  // Now batched in React 17
});

// Without batching in React 17:
// - Each setState triggers separate re-render
// - Components re-render 3 times instead of once
// - Significant performance penalty
```

Understanding batching is crucial for optimizing applications with multiple contexts, as it determines whether updates cause one re-render or many.

</details>

---

### 🐛 Real-World Scenario

<details>
<summary><strong>🐛 Real-World Scenario: Context Provider Causing App-Wide Performance Degradation</strong></summary>

**Production Bug: Context Provider Causing App-Wide Performance Degradation**

**Context:**
E-commerce application with 200+ components experiencing severe performance issues. Users complained about laggy UI, especially when typing in search boxes or toggling filters. Initial profiling showed components re-rendering unnecessarily.

**The Problem - Single Monolithic Context:**

```javascript
// ❌ BAD: Original implementation
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', priceRange: [0, 1000] });
  const [searchQuery, setSearchQuery] = useState('');
  const [ui, setUi] = useState({ sidebar: false, modal: null, theme: 'light' });

  // ❌ New object created every render
  const value = {
    user, setUser,
    cart, setCart,
    products, setProducts,
    filters, setFilters,
    searchQuery, setSearchQuery,
    ui, setUi
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hundreds of components consuming this context
function ProductCard() {
  const { cart, setCart } = useContext(AppContext); // Only needs cart
  // But re-renders when searchQuery, filters, ui, etc. change!
}

function SearchBar() {
  const { searchQuery, setSearchQuery } = useContext(AppContext);
  // Re-renders when cart, user, filters change!
}
```

**Measured Impact:**
- **Average render time**: 340ms for ProductList component (150 items)
- **Search input lag**: 200-300ms delay between keypress and UI update
- **React DevTools Profiler**: 50+ components re-rendering on every search keystroke
- **Lighthouse Performance Score**: Dropped from 85 to 52
- **User Complaints**: 40% increase in support tickets about "slow app"

**Debugging Process:**

**Step 1: React DevTools Profiler Analysis**
```bash
# Findings:
- 187 components re-rendered when typing in search
- Most didn't use searchQuery at all
- Re-renders cascaded through entire component tree
- Total wasted render time: ~2.3 seconds per keystroke
```

**Step 2: Why-Did-You-Render Library**
```javascript
// Added to development
import whyDidYouRender from '@welldone-software/why-did-you-render';
whyDidYouRender(React, {
  trackAllPureComponents: true,
});

// Output showed:
// "ProductCard re-rendered because AppContext value changed"
// "Even though ProductCard only uses 'cart', entire context object is new"
```

**Step 3: Context Value Reference Check**
```javascript
// Added logging to AppProvider
useEffect(() => {
  console.log('Context value reference changed');
}, [value]);

// Logged on EVERY state update (user, cart, filters, search, ui)
// Confirmed: new object every render
```

**The Solution - Context Splitting + Memoization:**

```javascript
// ✅ GOOD: Split into focused contexts
const UserContext = createContext();
const CartContext = createContext();
const ProductContext = createContext();
const FilterContext = createContext();
const SearchContext = createContext();
const UIContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const value = useMemo(() => ({
    cart,
    setCart,
    addToCart: (item) => setCart(prev => [...prev, item]),
    removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)),
    cartTotal: cart.reduce((sum, item) => sum + item.price, 0),
    cartCount: cart.length
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce expensive operations
  const debouncedQuery = useDebounce(searchQuery, 300);

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    debouncedQuery
  }), [searchQuery, debouncedQuery]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Compose all providers
function AppProviders({ children }) {
  return (
    <UserProvider>
      <CartProvider>
        <ProductProvider>
          <FilterProvider>
            <SearchProvider>
              <UIProvider>
                {children}
              </UIProvider>
            </SearchProvider>
          </FilterProvider>
        </ProductProvider>
      </CartProvider>
    </UserProvider>
  );
}

// Components now subscribe to only what they need
function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext); // Only re-renders on cart changes
  // No longer re-renders on search, filter, ui changes!
}

function SearchBar() {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  // Only re-renders on search changes
}
```

**Additional Optimization - Memoized Components:**

```javascript
// Prevent re-renders from parent updates
const ProductCard = memo(({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
});

// Context changes still propagate through memo
// But parent re-renders don't affect this component
```

**Results After Fix:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| ProductList Render Time | 340ms | 45ms | **87% faster** |
| Search Input Lag | 200-300ms | 15-20ms | **93% faster** |
| Components Re-rendering (per keystroke) | 187 | 3 | **98% reduction** |
| Lighthouse Performance Score | 52 | 89 | **71% improvement** |
| User Complaints | High | Resolved | **100% reduction** |

**Key Learnings:**
1. **Never create context value inline** - always use `useMemo()`
2. **Split contexts by update frequency** - fast-changing state (search) separate from slow-changing (user)
3. **Profile before optimizing** - React DevTools Profiler revealed the real culprit
4. **Context changes bypass memo** - understand propagation behavior
5. **Combine with other optimization techniques** - debouncing, memoization, code splitting

</details>

---

### ⚖️ Trade-offs

<details>
<summary><strong>⚖️ Trade-offs: Context API vs Redux vs Zustand - Decision Matrix</strong></summary>

**Context API vs Redux vs Zustand - Decision Matrix:**

| Factor | Context API | Redux | Zustand |
|--------|-------------|-------|---------|
| **Bundle Size** | 0KB (built-in) | ~12KB (RTK) | ~1KB |
| **Boilerplate** | Low | High | Very Low |
| **DevTools** | None (requires custom) | Excellent | Good |
| **Performance** | Poor (without optimization) | Excellent | Excellent |
| **Learning Curve** | Low | High | Very Low |
| **Middleware** | Manual | Built-in | Built-in |
| **Time Travel** | No | Yes | No |
| **Server State** | Manual | Manual | Manual |

**When to Use Context API:**

✅ **Good Use Cases:**
1. **Infrequent Updates:**
   ```javascript
   // Theme rarely changes - perfect for Context
   const ThemeContext = createContext();
   function useTheme() {
     return useContext(ThemeContext);
   }
   ```

2. **Simple Global State:**
   ```javascript
   // Auth state - logs in once, rarely changes
   const AuthContext = createContext();
   ```

3. **Dependency Injection:**
   ```javascript
   // Providing services/APIs to components
   const ApiContext = createContext();
   function ApiProvider({ children }) {
     const api = useMemo(() => new ApiClient(), []);
     return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
   }
   ```

4. **Small Applications:**
   - Under 50 components
   - Simple state requirements
   - No complex interactions

❌ **Poor Use Cases:**
1. **Frequent Updates:**
   ```javascript
   // ❌ Search query changes on every keystroke
   // ❌ Animation frame updates
   // ❌ Real-time data streams
   ```

2. **Large State Objects:**
   ```javascript
   // ❌ Entire application state in one context
   // ❌ Large lists with frequent mutations
   ```

3. **Complex State Logic:**
   ```javascript
   // ❌ Multi-step workflows
   // ❌ Undo/redo functionality
   // ❌ Computed derived state
   ```

**When to Use Redux:**

✅ **Good Use Cases:**
1. **Complex State Logic:**
   ```javascript
   // Multi-step checkout with validation
   const checkoutSlice = createSlice({
     name: 'checkout',
     initialState: { step: 1, data: {}, errors: {} },
     reducers: {
       nextStep: (state) => { state.step += 1; },
       validateStep: (state, action) => { /* complex validation */ }
     }
   });
   ```

2. **Need for DevTools:**
   - Time-travel debugging
   - Action logging
   - State inspection

3. **Middleware Requirements:**
   ```javascript
   // API calls, logging, analytics
   const loggerMiddleware = store => next => action => {
     console.log('Action:', action);
     return next(action);
   };
   ```

4. **Large Teams:**
   - Standardized patterns
   - Predictable state changes
   - Clear separation of concerns

❌ **Poor Use Cases:**
- Simple apps (overkill)
- Prototype/MVP (too much setup)
- Static/mostly-static data

**When to Use Zustand:**

✅ **Good Use Cases:**
1. **Frequent Updates with Performance:**
   ```javascript
   // Real-time updates without re-render hell
   const useStore = create((set) => ({
     count: 0,
     increment: () => set((state) => ({ count: state.count + 1 }))
   }));

   // Selective subscription - only re-renders when count changes
   function Counter() {
     const count = useStore(state => state.count);
   }
   ```

2. **Minimal Boilerplate:**
   ```javascript
   // Quick setup, low friction
   const useCartStore = create((set) => ({
     items: [],
     addItem: (item) => set((state) => ({ items: [...state.items, item] }))
   }));
   ```

3. **Mix of Global and Local State:**
   ```javascript
   // Can create multiple stores easily
   const useAuthStore = create(() => ({ user: null }));
   const useUIStore = create(() => ({ theme: 'light' }));
   const useCartStore = create(() => ({ items: [] }));
   ```

**Performance Comparison:**

```javascript
// Benchmark: 1000 updates, 100 consuming components

// Context API (without optimization)
// Average: 1200ms total
// Re-renders: 100 components × 1000 updates = 100,000 renders

// Context API (with splitting + memoization)
// Average: 180ms total
// Re-renders: ~3 components × 1000 updates = 3,000 renders

// Redux
// Average: 120ms total
// Re-renders: Only components subscribing to changed slice

// Zustand
// Average: 95ms total
// Re-renders: Only components with matching selectors
```

**Hybrid Approach (Recommended for Large Apps):**

```javascript
// Use Context for rare updates
const ThemeContext = createContext();
const AuthContext = createContext();
const I18nContext = createContext();

// Use Zustand/Redux for frequent updates
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
}));

const useSearchStore = create((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results })
}));

// Use React Query for server state
const { data: products } = useQuery('products', fetchProducts);
```

**Decision Framework:**

Ask yourself:
1. **How often does this state change?**
   - Rarely: Context
   - Frequently: Zustand/Redux

2. **How many components need it?**
   - Few (<10): Props or Context
   - Many (>10): Global state solution

3. **Is it server data?**
   - Yes: React Query/SWR
   - No: Context/Zustand/Redux

4. **Do you need DevTools/time-travel?**
   - Yes: Redux
   - No: Context/Zustand

5. **Team experience?**
   - New to React: Context
   - Experienced: Redux/Zustand
   - Prototyping: Zustand

---

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're working in a large office building with many floors. You need to send a message to someone on the 10th floor.

**Prop Drilling** is like passing a physical letter person-to-person:
- You give it to someone on floor 1
- They walk to floor 2 and hand it off
- That person walks to floor 3 and hands it off
- This continues until it reaches floor 10

**Context API** is like installing a building-wide speaker system:
- You speak into a microphone at the reception (Provider)
- Everyone in the building can hear you (Consumer)
- You don't need to pass messages person-to-person anymore

**But here's the catch**: When you make an announcement, EVERYONE in the building stops what they're doing to listen - even if the announcement isn't relevant to them. That's why Context can cause performance issues.

**The Solution**: Install separate speaker systems for different departments (Context Splitting):
- Engineering has their own channel
- Sales has their own channel
- HR has their own channel

Now when Engineering makes an announcement, only Engineering employees listen. Others keep working.

**Basic Explanation:**

Context API lets you share data across your React app without passing props through every component.

**Three Steps:**
1. **Create** the context (like creating a radio channel)
2. **Provide** the value (like broadcasting a message)
3. **Consume** the value (like tuning in to listen)

**Code Example:**

```javascript
// Step 1: Create context
const UserContext = createContext();

// Step 2: Provide value at top level
function App() {
  const [user, setUser] = useState({ name: 'Alice', role: 'admin' });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}

// Step 3: Consume anywhere in the tree
function UserProfile() {
  const { user } = useContext(UserContext);
  return <h1>Welcome, {user.name}!</h1>;
}

// Deep nesting - no prop drilling needed!
function App() {
  return (
    <UserContext.Provider value={...}>
      <Layout>
        <Sidebar>
          <Navigation>
            <UserProfile /> {/* Can access user directly! */}
          </Navigation>
        </Sidebar>
      </Layout>
    </UserContext.Provider>
  );
}
```

**Common Mistakes Beginners Make:**

**Mistake 1: Creating New Objects in Provider**
```javascript
// ❌ BAD - creates new object every render
<ThemeContext.Provider value={{ theme: 'dark', setTheme }}>

// ✅ GOOD - stable reference
const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
<ThemeContext.Provider value={value}>
```

**Mistake 2: Using Context for Everything**
```javascript
// ❌ BAD - context overkill for parent-child communication
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <Child />
    </CountContext.Provider>
  );
}

// ✅ GOOD - just use props!
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} />;
}
```

**Mistake 3: Not Handling Missing Provider**
```javascript
// ❌ BAD - crashes if no provider
function useTheme() {
  return useContext(ThemeContext);
}

// ✅ GOOD - helpful error message
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**Interview Answer Template:**

**Q: "What is Context API and when would you use it?"**

**Answer:**
"Context API is React's built-in solution for sharing data across component trees without prop drilling. It's useful for truly global state like theme, authentication, or localization that many components need access to.

You create a context with `createContext()`, provide a value using the Provider component at a high level, and consume it in child components using the `useContext()` hook.

However, I'm careful not to overuse it because Context has performance implications - when the context value changes, all consuming components re-render. For frequent updates or complex state, I'd consider alternatives like Zustand or Redux.

I typically use Context for:
- Theme settings (rarely changes)
- User authentication (infrequent updates)
- Localization (static after load)

And avoid it for:
- Search queries (frequent updates)
- Form state (local to component)
- Frequently changing UI state

I also make sure to memoize context values to prevent unnecessary re-renders."

</details>

**Follow-up Q: "How do you optimize Context performance?"**

**Answer:**
"Three main strategies:

1. **Split contexts** - Instead of one large context, create multiple smaller ones based on update frequency. This way, only relevant components re-render.

2. **Memoize values** - Use `useMemo()` to create stable references for context values, preventing re-renders when nothing actually changed.

3. **Combine with React.memo** - Though context changes bypass memo, you can still prevent parent re-renders from affecting children.

For high-frequency updates, I'd switch to Zustand which has built-in selector support for granular subscriptions."

**Mental Model for Understanding:**

Think of Context like a **bulletin board** in a shared workspace:
- The **Provider** posts notices on the board
- Any component can walk up and **read** the board (Consumer)
- When a new notice is posted, everyone currently reading gets notified
- The problem: even if you only care about one type of notice, you get interrupted for ALL notices

That's why you create **multiple bulletin boards** (split contexts) - one for urgent notices, one for general updates, one for events. Now you only pay attention to the boards relevant to you.

</details>

---

## Question 2: What are Context API performance pitfalls and optimization strategies?

**Answer:**

The Context API has inherent performance challenges because it triggers re-renders in ALL consuming components when the context value changes, regardless of whether they use the changed portion of the data. This "all-or-nothing" subscription model makes it unsuitable for frequently updating state without careful optimization.

**Main Performance Pitfalls:**

1. **Unstable Value References**: Creating new objects/arrays in Provider on every render causes all consumers to re-render unnecessarily.

2. **Large Context Objects**: Storing unrelated state together (user, cart, UI, filters) means changes to one property trigger re-renders for components only using other properties.

3. **Context Bypasses Memoization**: Even `React.memo()` components re-render when consuming context changes.

4. **Deep Component Trees**: Context changes propagate through entire component subtrees, triggering cascading re-renders.

**Optimization Strategies:**

**1. Split Contexts by Update Frequency**
```javascript
// ❌ BAD - monolithic context
const AppContext = createContext({ user, theme, cart, search });

// ✅ GOOD - separate contexts
const UserContext = createContext();    // Rarely changes
const ThemeContext = createContext();   // Rarely changes
const CartContext = createContext();    // Occasionally changes
const SearchContext = createContext();  // Frequently changes
```

**2. Memoize Context Values**
```javascript
// ✅ Prevent unnecessary re-renders
const value = useMemo(() => ({
  user,
  setUser,
  isAdmin: user?.role === 'admin'
}), [user]);

<UserContext.Provider value={value}>
```

**3. Use Context Selectors** (via libraries like `use-context-selector`)
```javascript
// Subscribe only to specific slices
const user = useContextSelector(AppContext, ctx => ctx.user);
// Only re-renders when user changes, not when cart/theme/etc. change
```

**4. Combine with Component Memoization**
```javascript
// Prevent parent re-renders from affecting children
const ProductCard = memo(({ product }) => {
  const { addToCart } = useContext(CartContext);
  return <button onClick={() => addToCart(product)}>Add</button>;
});
```

---

### 🔍 Deep Dive

**Understanding Context Re-render Behavior and Performance Bottlenecks:**

React's Context API re-render mechanism is fundamentally different from component prop updates. When a Provider's value changes, React uses `Object.is()` for referential equality comparison, which has profound implications for performance:

```javascript
// React's internal comparison algorithm (simplified from React source)
function hasContextChanged(oldValue, newValue) {
  return !Object.is(oldValue, newValue);
}

// Object.is() behavior - critical to understand:
Object.is({}, {})           // false - different object references in memory
Object.is([], [])           // false - different array references
Object.is(5, 5)             // true - primitives compared by value
Object.is('test', 'test')   // true - string primitives
Object.is(NaN, NaN)         // true - special case (unlike ===)
const obj = {};
Object.is(obj, obj)         // true - same memory reference
const arr = [];
Object.is(arr, arr)         // true - same memory reference

// The critical insight:
// Object.is() compares REFERENCES, not CONTENT for objects/arrays
// This means { x: 1 } !== { x: 1 } even though content is identical
```

**The Inline Object Creation Problem:**

The most common performance pitfall with Context is creating objects inline in the Provider:

```javascript
// ❌ BAD - Creates new object on EVERY render
function Provider1() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {/* On EVERY render of Provider1 (even if user unchanged):
          1. New object { user, setUser } created in memory
          2. Object.is(previousValue, newValue) returns false
          3. ALL consuming components marked for re-render
          4. Re-render cascade propagates through entire tree
          5. Consumers re-render even when user is identical */}
    </UserContext.Provider>
  );
}

// Why this happens:
// - JavaScript creates new object reference every render
// - Even if user is same, wrapper object is different
// - React sees different object reference = value changed
// - Triggers re-render of all consumers

// ✅ GOOD - Stable reference via useMemo
function Provider2() {
  const [user, setUser] = useState(null);

  // useMemo creates stable reference:
  // - Returns same object reference until dependencies change
  // - Only creates new object when user changes
  // - Object.is(previousValue, newValue) returns true when user unchanged
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <UserContext.Provider value={value}>
      {/* Consumers only re-render when user ACTUALLY changes
          No re-renders when Provider1 re-renders for other reasons */}
    </UserContext.Provider>
  );
}

// Performance impact example:
// Scenario: Provider re-renders 100 times, user changes 3 times
// - Without useMemo: 100 re-render cascades to all consumers
// - With useMemo: 3 re-render cascades to consumers
// - Improvement: 97% reduction in unnecessary re-renders
```

**Why Context Bypasses React.memo() - The Reconciliation Order:**

Understanding why Context changes bypass `React.memo()` requires understanding React's reconciliation algorithm:

**Why Context Bypasses React.memo():**

```javascript
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const theme = useContext(ThemeContext);
  const processedData = expensiveCalculation(data); // Heavy computation

  // Wrapped in memo, but still re-renders in these scenarios:
  // 1. Props change (data !== prevData) → re-render (expected)
  // 2. Context changes (theme !== prevTheme) → re-render (BYPASSES memo)
  // 3. Parent re-renders with same props → NO re-render (memo prevents)

  return <div className={theme}>{processedData}</div>;
});
```

**React's Component Re-render Decision Tree:**

```javascript
// React's internal reconciliation order (simplified from React source):

function shouldComponentUpdate(fiber) {
  // STEP 1: Check context subscriptions FIRST (highest priority)
  const contextChanged = checkContextSubscriptions(fiber);
  if (contextChanged) {
    return true; // Re-render immediately, skip all other checks
  }

  // STEP 2: Check if component is memoized
  const isMemoized = fiber.type.$$typeof === REACT_MEMO_TYPE;
  if (isMemoized) {
    // STEP 3: Shallow compare props
    const propsChanged = !shallowEqual(fiber.memoizedProps, fiber.pendingProps);
    if (propsChanged) {
      return true; // Props changed, re-render
    }
    return false; // Props same, skip re-render
  }

  // STEP 4: For non-memoized components
  // Always re-render when parent re-renders (default React behavior)
  return true;
}

// Key insight: Context check happens BEFORE memo check
// This means context changes always trigger re-render, memo can't prevent it
```

**Why This Design Decision:**

React's team made context subscriptions bypass memoization intentionally because:
1. Context represents external dependencies, not just props/state
2. Components explicitly opt into context changes via `useContext`
3. If context changes were blockable by memo, you'd get stale context data
4. Context is meant to propagate changes throughout the tree reliably

**Practical Implications:**

```javascript
// Scenario: Component tree with memoization
const Header = memo(() => {
  const theme = useContext(ThemeContext);
  console.log('Header rendered');
  return <header className={theme}>Header</header>;
});

const Content = memo(() => {
  // Doesn't use theme context
  console.log('Content rendered');
  return <main>Content</main>;
});

function App() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Header />   {/* Re-renders when theme changes (context bypass) */}
      <Content />  {/* Doesn't re-render (no context subscription) */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
      {/* When count changes, App re-renders but Header/Content don't (memo works) */}
      {/* When theme changes, Header re-renders (context bypasses memo) */}
    </ThemeContext.Provider>
  );
}

// Render logs when count updates:
// (nothing) - Header and Content memoized, props unchanged

// Render logs when theme updates:
// "Header rendered" - Context change bypasses memo
// (Content doesn't render - no theme context subscription)
```

**Advanced Optimization: Context Splitting Pattern**

```javascript
// Pattern: Fast-changing state separate from slow-changing state

// Slow-changing (setup once, rarely updates)
const ConfigContext = createContext();
function ConfigProvider({ children }) {
  const config = useMemo(() => ({
    apiUrl: process.env.API_URL,
    features: { darkMode: true, analytics: false },
    version: '1.0.0'
  }), []); // Empty deps - never changes

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

// Fast-changing (updates on every keystroke)
const SearchContext = createContext();
function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Only components using search re-render
  const value = useMemo(() => ({
    query,
    setQuery,
    results,
    setResults
  }), [query, results]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
```

**Provider Composition Performance:**

```javascript
// Multiple providers don't multiply re-renders
function App() {
  return (
    <ConfigProvider>      {/* Renders once */}
      <AuthProvider>      {/* Re-renders on auth changes */}
        <ThemeProvider>   {/* Re-renders on theme changes */}
          <CartProvider>  {/* Re-renders on cart changes */}
            <ComponentTree />
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

// ComponentTree children only re-render for contexts they consume
function ProductCard() {
  const { addToCart } = useContext(CartContext);
  // Only re-renders when CartContext changes
  // Immune to Auth/Theme changes
}
```

**Context Selector Implementation (Manual):**

```javascript
// Custom hook with selector pattern
function useContextSelector(context, selector) {
  const value = useContext(context);
  const selectedValue = selector(value);

  // Problem: Still re-renders on any context change
  // Solution: Need external library like use-context-selector
  // which uses useSubscription API

  return selectedValue;
}

// With use-context-selector library:
import { createContext, useContextSelector } from 'use-context-selector';

const StoreContext = createContext();

function StoreProvider({ children }) {
  const [state, setState] = useState({
    user: { name: 'John' },
    cart: [],
    theme: 'light'
  });

  return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>;
}

function UserName() {
  // Only re-renders when state.user.name changes
  const userName = useContextSelector(StoreContext, state => state.user.name);
  return <span>{userName}</span>;
}

function CartCount() {
  // Only re-renders when state.cart.length changes
  const cartCount = useContextSelector(StoreContext, state => state.cart.length);
  return <span>{cartCount}</span>;
}
```

**Profiling Context Performance:**

```javascript
// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="ProductList" onRender={onRenderCallback}>
  <ProductList />
</Profiler>

// Metrics to watch:
// - actualDuration: Time spent rendering
// - commitTime: When render was committed
// - Number of renders: Should match context updates
```

**Context Update Batching:**

```javascript
// React 18 automatic batching
function updateMultipleContexts() {
  setUser({ name: 'John' });    // Context 1
  setTheme('dark');              // Context 2
  setCart([...items]);           // Context 3

  // React 18: All updates batched into single render
  // React 17: Each setState triggers separate render
}

// For React 17, manual batching:
import { unstable_batchedUpdates } from 'react-dom';

unstable_batchedUpdates(() => {
  setUser({ name: 'John' });
  setTheme('dark');
  setCart([...items]);
});
```

---

### 🐛 Real-World Scenario

**Production Crisis: Search Feature Grinding App to a Halt**

**Context:**
SaaS dashboard application with real-time search across 10,000+ records. After deploying a new search feature using Context API, users reported the app becoming "unusable" when typing in the search box. CEO escalated as critical P0 bug affecting all customers.

**The Implementation (Before Fix):**

```javascript
// ❌ BAD: Single context for entire app state
const AppContext = createContext();

function AppProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', date: null });

  // Search runs on every keystroke
  useEffect(() => {
    if (searchQuery) {
      const results = performExpensiveSearch(searchQuery);
      setSearchResults(results);
    }
  }, [searchQuery]);

  // ❌ New object created every render
  const value = {
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    user, setUser,
    notifications, setNotifications,
    filters, setFilters
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 200+ components consuming this context
function SearchBar() {
  const { searchQuery, setSearchQuery } = useContext(AppContext);
  return <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />;
}

function ProductTable() {
  const { searchResults } = useContext(AppContext);
  // Renders 500 rows - re-renders on EVERY keystroke!
}

function Sidebar() {
  const { user } = useContext(AppContext);
  // Re-renders on search changes even though it only uses user!
}

function NotificationBell() {
  const { notifications } = useContext(AppContext);
  // Re-renders on search changes!
}
```

**Measured Performance Impact:**

| Metric | Value | Critical Threshold |
|--------|-------|-------------------|
| **Keystroke to UI Update** | 800-1200ms | <100ms |
| **Components Re-rendering per Keystroke** | 237 | <10 |
| **Total Render Time** | 3.2s per keystroke | <200ms |
| **CPU Usage** | 85-95% | <50% |
| **Memory Increase** | 150MB over 30 seconds | Stable |
| **Dropped Frames** | 80% of frames | <5% |
| **Users Affected** | 100% | 0% |

**User Impact:**
- Unable to type smoothly in search box
- UI freezing for 1-2 seconds after each keystroke
- Browser "Not Responding" warnings
- Data loss (typed characters not registered)

**Debugging Process:**

**Step 1: React DevTools Profiler**
```javascript
// Profiler results showing disaster:
// Render #1 (user types 's'): 237 components, 1.1s
// Render #2 (user types 'se'): 237 components, 1.3s
// Render #3 (user types 'sea'): 237 components, 1.5s (cumulative search data)

// Top offenders:
// ProductTable: 800ms (500 rows)
// Sidebar: 120ms (complex navigation)
// NotificationPanel: 90ms (100+ notifications)
// Dashboard: 200ms (charts re-rendering)
```

**Step 2: Why-Did-You-Render Analysis**
```javascript
import whyDidYouRender from '@welldone-software/why-did-you-render';
whyDidYouRender(React);

// Output:
// Sidebar re-rendered because AppContext changed
//   Prev value: { searchQuery: 'se', user: {...}, ... }
//   New value:  { searchQuery: 'sea', user: {...}, ... }
//   Diff: searchQuery changed
//   Problem: Sidebar doesn't use searchQuery!

// NotificationBell re-rendered because AppContext changed
//   Problem: Only needs notifications, not search!
```

**Step 3: Performance Timeline**
```javascript
// Chrome DevTools Performance tab:
// - Long task detected: 1,342ms
// - Main thread blocked: 95% of time
// - Layout thrashing: 187 forced reflows
// - Scripting: 3,200ms (React reconciliation)
```

**The Root Causes:**

1. **Unstable Context Value**:
```javascript
// New object created on EVERY render
const value = { searchQuery, setSearchQuery, ... };
// Object.is(oldValue, newValue) always false
```

2. **Monolithic Context**:
```javascript
// Search changes trigger re-renders for:
// - Components using user
// - Components using notifications
// - Components using filters
// - Everything!
```

3. **Expensive Components Re-rendering**:
```javascript
// ProductTable (500 rows) re-renders on every keystroke
// Even though search results update is debounced separately
```

4. **No Memoization**:
```javascript
// Components not using React.memo
// Child components re-rendering due to parent re-renders
// Cascading re-renders through tree
```

**The Solution (Step-by-Step Fix):**

**Fix 1: Split Context by Concern**
```javascript
// ✅ GOOD: Separate contexts
const SearchContext = createContext();
const UserContext = createContext();
const NotificationContext = createContext();
const FilterContext = createContext();

function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Debounce search
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery) {
      performExpensiveSearch(debouncedQuery).then(setSearchResults);
    }
  }, [debouncedQuery]);

  // ✅ Memoize value
  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching: searchQuery !== debouncedQuery
  }), [searchQuery, searchResults, debouncedQuery]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
```

**Fix 2: Memoize Expensive Components**
```javascript
// ✅ Prevent unnecessary re-renders
const ProductTable = memo(function ProductTable() {
  const { searchResults } = useContext(SearchContext);

  // Only re-renders when searchResults actually changes (after debounce)
  return (
    <table>
      {searchResults.map(product => (
        <ProductRow key={product.id} product={product} />
      ))}
    </table>
  );
});

const ProductRow = memo(function ProductRow({ product }) {
  // Individual rows don't re-render unless product changes
  return <tr>...</tr>;
});
```

**Fix 3: Optimize Search Input**
```javascript
// ✅ Controlled input with transition
function SearchBar() {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [localValue, setLocalValue] = useState(searchQuery);

  // Update local state immediately (smooth typing)
  const handleChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);

    // Update context with low priority
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  return <input value={localValue} onChange={handleChange} />;
}
```

**Fix 4: Virtual Scrolling for Large Lists**
```javascript
import { FixedSizeList } from 'react-window';

function ProductTable() {
  const { searchResults } = useContext(SearchContext);

  // Only render visible rows
  return (
    <FixedSizeList
      height={600}
      itemCount={searchResults.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ProductRow product={searchResults[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Results After All Fixes:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Keystroke to UI Update** | 800-1200ms | 15-30ms | **97% faster** |
| **Components Re-rendering** | 237 | 1 (SearchBar only) | **99.6% reduction** |
| **Total Render Time** | 3.2s | 45ms | **98.6% faster** |
| **CPU Usage** | 85-95% | 15-25% | **73% reduction** |
| **Memory Stable** | ✅ | ✅ | No regression |
| **Dropped Frames** | 80% | <1% | **Normal performance** |
| **Users Happy** | ❌ | ✅ | **Crisis resolved** |

**Additional Monitoring Added:**

```javascript
// Performance monitoring in production
function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Track performance metrics
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      if (duration > 100) {
        // Alert if search taking too long
        analytics.track('slow_search', {
          query: searchQuery,
          duration,
          resultsCount: searchResults.length
        });
      }
    };
  }, [searchQuery]);

  // ... rest of provider
}
```

**Key Learnings:**
1. **Never use Context for frequently updating state** - search queries change on every keystroke
2. **Always split contexts by update frequency** - fast-changing separate from slow-changing
3. **Always memoize context values** - prevent unstable references
4. **Profile before and after** - measure impact of optimizations
5. **Debounce expensive operations** - search doesn't need to run on every keystroke
6. **Use virtual scrolling for large lists** - only render visible items
7. **Consider alternatives** - Zustand/Jotai better for frequent updates

---

### ⚖️ Trade-offs

**Context Performance vs Alternative Solutions:**

| Approach | Performance | Complexity | Bundle Size | Use Case |
|----------|-------------|------------|-------------|----------|
| **Split Contexts** | Good | Medium | 0KB | Multiple independent state slices |
| **Context + Memo** | Good | Low | 0KB | Infrequent updates |
| **use-context-selector** | Excellent | Low | ~3KB | Selective subscriptions needed |
| **Zustand** | Excellent | Low | ~1KB | Frequent updates, simple API |
| **Jotai** | Excellent | Medium | ~3KB | Atomic state management |
| **Redux** | Excellent | High | ~12KB | Complex state, middleware, DevTools |

**Optimization Strategy Decision Matrix:**

**Scenario 1: Theme/Auth (Rare Updates)**
```javascript
// Decision: Plain Context with memoization
// Why: Updates are rare, no performance concerns
// Trade-off: Simple, no dependencies, perfect for this use case

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ✅ Pros: Simple, built-in, no overhead
// ❌ Cons: None for rare updates
```

**Scenario 2: Search/Filters (Frequent Updates)**
```javascript
// Decision: Zustand over Context
// Why: Frequent updates, need selective subscriptions
// Trade-off: Small bundle increase, but major performance gain

import create from 'zustand';

const useSearchStore = create((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results })
}));

// Components subscribe selectively
function SearchBar() {
  const query = useSearchStore(state => state.query);
  const setQuery = useSearchStore(state => state.setQuery);
  // Only re-renders when query changes
}

function SearchResults() {
  const results = useSearchStore(state => state.results);
  // Only re-renders when results change
}

// ✅ Pros: Excellent performance, simple API, selective subscriptions
// ❌ Cons: External dependency (+1KB)
```

**Scenario 3: Complex Forms (Local State)**
```javascript
// Decision: useState/useReducer, NOT Context
// Why: State is local to form, no need for global access
// Trade-off: Pass props or use form library

function CheckoutForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: {}
  });

  // Just pass props to child components
  return (
    <>
      <PersonalInfo data={formData} onChange={setFormData} />
      <AddressInfo data={formData} onChange={setFormData} />
      <PaymentInfo data={formData} onChange={setFormData} />
    </>
  );
}

// OR use React Hook Form
import { useForm } from 'react-hook-form';

function CheckoutForm() {
  const { register, handleSubmit } = useForm();
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}

// ✅ Pros: Simple, performant, no global state pollution
// ❌ Cons: Props passing (but only 1 level deep)
```

**Scenario 4: Large Dashboard (Mixed Update Frequencies)**
```javascript
// Decision: Hybrid approach
// Why: Different parts have different update patterns
// Trade-off: Slightly more complex, but optimal performance

// Rare updates: Context
const UserContext = createContext();
const ConfigContext = createContext();

// Frequent updates: Zustand
const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (n) => set((state) => ({
    notifications: [...state.notifications, n]
  }))
}));

const useRealtimeDataStore = create((set) => ({
  metrics: {},
  updateMetric: (key, value) => set((state) => ({
    metrics: { ...state.metrics, [key]: value }
  }))
}));

// Server state: React Query
const { data: dashboardData } = useQuery('dashboard', fetchDashboard);

function Dashboard() {
  return (
    <UserContext.Provider value={user}>
      <ConfigContext.Provider value={config}>
        <NotificationPanel /> {/* Uses Zustand */}
        <MetricsChart />      {/* Uses Zustand */}
        <UserProfile />       {/* Uses Context */}
        <SettingsPanel />     {/* Uses Context */}
        <DataTable />         {/* Uses React Query */}
      </ConfigContext.Provider>
    </UserContext.Provider>
  );
}

// ✅ Pros: Optimal performance for each use case
// ❌ Cons: More mental overhead, multiple patterns
```

**Memoization Trade-offs:**

```javascript
// Strategy 1: useMemo for context value
const value = useMemo(() => ({ user, setUser }), [user]);
// ✅ Pros: Prevents unnecessary re-renders
// ❌ Cons: Small memory overhead for memoization
// 📊 Impact: Critical - prevents re-render cascade

// Strategy 2: React.memo for components
const UserCard = memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});
// ✅ Pros: Prevents parent re-renders affecting child
// ❌ Cons: Doesn't prevent Context re-renders
// 📊 Impact: Medium - only helps with prop changes

// Strategy 3: useCallback for functions
const handleLogin = useCallback(() => {
  login(credentials);
}, [credentials]);
// ✅ Pros: Stable function reference
// ❌ Cons: Often overused, minimal benefit
// 📊 Impact: Low - only needed if passed to memoized children

// Strategy 4: Split contexts
// Multiple focused contexts instead of one large context
// ✅ Pros: Maximum performance benefit
// ❌ Cons: More boilerplate, more providers
// 📊 Impact: High - most effective optimization
```

**Performance Measurement Strategy:**

```javascript
// Always measure before optimizing
import { Profiler } from 'react';

function onRender(id, phase, actualDuration) {
  // Log to analytics
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}

<Profiler id="ProductList" onRender={onRender}>
  <ProductList />
</Profiler>

// Benchmark different approaches:
// 1. Baseline (no optimization)
// 2. With useMemo
// 3. With split contexts
// 4. With Zustand

// Choose approach with best performance/complexity ratio
```

**When Each Optimization Makes Sense:**

| Optimization | When to Use | Effort | Impact |
|--------------|-------------|--------|--------|
| **useMemo on value** | Always | Low | High |
| **Split contexts** | >3 independent state slices | Medium | High |
| **React.memo** | Expensive components | Low | Medium |
| **useCallback** | Functions passed to memoized children | Low | Low |
| **use-context-selector** | Large context with selective needs | Low | High |
| **Switch to Zustand** | Frequent updates (>1/sec) | Medium | Very High |
| **Virtual scrolling** | Lists >100 items | Medium | High |

---

### 💬 Explain to Junior

**Simple Analogy:**

Imagine you're in a classroom with 30 students. The teacher (Context Provider) writes a message on the whiteboard (context value).

**Without Optimization (Bad):**
- Teacher erases entire whiteboard and rewrites everything when ONE word changes
- All 30 students stop working and look up to read the entire whiteboard again
- Even students who only care about math problems re-read the entire board when the history assignment changes
- Classroom is constantly interrupted

**With Optimization (Good):**
- Teacher has separate whiteboards: Math, History, Science (Split Contexts)
- Only students in Math class look at Math whiteboard when it updates
- When teacher writes same message again, smart students recognize it hasn't changed and don't stop working (Memoization)
- Classroom runs smoothly

**Basic Explanation:**

Context API can make your app slow if you're not careful. Here's why and how to fix it:

**Problem 1: Creating New Objects**
```javascript
// ❌ BAD - Creates new object every render
function MyProvider({ children }) {
  const [user, setUser] = useState(null);

  // This is a NEW object every time
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// All components using this context re-render constantly!
```

**Why it's bad:**
- `{ user, setUser }` creates a new object every time
- React sees "new object" and thinks value changed
- Even if `user` is the same, the object wrapper is new
- All components consuming context re-render

**Solution: useMemo**
```javascript
// ✅ GOOD - Stable object reference
function MyProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Now components only re-render when 'user' actually changes!
```

**Problem 2: One Big Context**
```javascript
// ❌ BAD - Everything together
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);

  const value = useMemo(() => ({
    user, setUser,
    theme, setTheme,
    cart, setCart
  }), [user, theme, cart]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Problem: Component only using 'theme' re-renders when cart changes!
```

**Solution: Split Contexts**
```javascript
// ✅ GOOD - Separate contexts
const UserContext = createContext();
const ThemeContext = createContext();
const CartContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Now components only re-render when THEIR context changes!
function ThemedButton() {
  const { theme } = useContext(ThemeContext);
  // Doesn't re-render when user or cart changes!
}
```

**Problem 3: Expensive Components Re-rendering**
```javascript
function ProductTable() {
  const { theme } = useContext(ThemeContext);

  // Expensive calculation
  const processedData = products.map(p => {
    return expensiveCalculation(p); // Takes 100ms
  });

  return <table className={theme}>...</table>;
}

// Every time theme changes, expensive calculation runs again!
```

**Solution: React.memo + useMemo**
```javascript
const ProductTable = memo(function ProductTable() {
  const { theme } = useContext(ThemeContext);

  // Cache expensive calculation
  const processedData = useMemo(() => {
    return products.map(p => expensiveCalculation(p));
  }, [products]); // Only recalculate when products change

  return <table className={theme}>...</table>;
});
```

**Common Pitfall: Frequent Updates**
```javascript
// ❌ BAD - Search changes on every keystroke
function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const value = useMemo(() => ({ searchQuery, setSearchQuery }), [searchQuery]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// When user types "react", this triggers 5 re-renders (r, re, rea, reac, react)
// ALL components using SearchContext re-render 5 times!
```

**Solution: Debounce + Consider Zustand**
```javascript
// Better: Debounce
function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300); // Wait 300ms

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    debouncedQuery
  }), [searchQuery, debouncedQuery]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Or even better: Use Zustand for frequent updates
import create from 'zustand';

const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query) => set({ query })
}));

// Components can subscribe selectively
function SearchResults() {
  const query = useSearchStore(state => state.query);
  // Only re-renders when query changes, nothing else
}
```

**Quick Checklist for Context Performance:**

✅ **Always do:**
1. Wrap context value in `useMemo()`
2. Split unrelated state into separate contexts
3. Use `React.memo()` for expensive components

❌ **Avoid:**
1. Creating new objects/arrays in Provider
2. Putting all state in one context
3. Using Context for frequently changing data (search, mouse position, scroll)

**When to Use What:**

| State Updates | Solution | Example |
|---------------|----------|---------|
| **Rare** (once per session) | Context | Theme, User auth |
| **Occasional** (few times per minute) | Context + Memoization | Cart, Notifications |
| **Frequent** (many times per second) | Zustand/Redux | Search, Filters, Real-time data |
| **Local to component** | useState | Form inputs, Modals |

**Interview Answer Template:**

**Q: "How do you optimize Context API performance?"**

**Answer:**
"Context API can cause performance issues because all consuming components re-render when the context value changes. I optimize it in three main ways:

First, I always **memoize the context value** using `useMemo()` to prevent creating new object references on every render. Without this, even when the actual data hasn't changed, React thinks the context changed because it's a new object.

Second, I **split contexts** based on update frequency and concern. Instead of one large AppContext with user, theme, cart, and filters, I create separate contexts for each. This way, components only subscribe to the data they actually need.

Third, I **use React.memo** for expensive components that consume context, and move frequently-changing state out of Context entirely - into Zustand or local state.

For example, I recently worked on an app where search was in Context, causing hundreds of components to re-render on every keystroke. I moved search to Zustand with selective subscriptions, which reduced re-renders by 99% and made typing smooth again."

**Follow-up Q: "When would you NOT use Context?"**

**Answer:**
"I avoid Context for frequently updating state like search queries, mouse positions, or scroll positions. Context triggers re-renders in all consuming components, which kills performance for high-frequency updates.

Instead, I use:
- **Zustand/Jotai** for frequent global state (selective subscriptions)
- **useState/useReducer** for local component state
- **React Query** for server state (caching, background updates)

Context is perfect for truly global, rarely-changing state like theme, authentication, or locale - things that might change once per session."

**Mental Model:**

Think of Context like a **TV broadcast**:
- **Provider** is the TV station broadcasting
- **Consumers** are TVs tuned to that channel
- When broadcast changes, ALL TVs receive the update

**Problem**: If you broadcast "breaking news" every second, everyone's TV is constantly interrupting their show.

**Solution**:
- Create separate channels (split contexts)
- Only broadcast when content really changes (memoization)
- Let viewers record shows to watch later (debouncing)
